"use client";

import { useEffect, useState } from "react";

const IMAGE_CACHE_PREFIX = "nutrify_img:";

interface SearchImageProps {
  query: string;
  alt: string;
  className?: string;
  size?: "small" | "medium" | "large";
  rounded?: "default" | "full";
  /** Use DALL-E to generate an image when OpenAI key is set */
  generate?: boolean;
}

const sizeClasses = {
  small: "h-16 w-16 sm:h-20 sm:w-20",
  medium: "h-24 w-24 sm:h-32 sm:w-32",
  large: "h-48 w-full sm:h-64 md:h-80",
};

function getImageCacheKey(query: string, generate: boolean): string {
  return `${IMAGE_CACHE_PREFIX}${query.trim().toLowerCase()}|${generate}`;
}

export default function SearchImage({ query, alt, className = "", size = "medium", rounded = "default", generate = false }: SearchImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false);
      return;
    }
    const cacheKey = getImageCacheKey(query, generate);
    try {
      const cached = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(cacheKey) : null;
      if (cached) {
        setUrl(cached);
        setLoading(false);
        return;
      }
    } catch {
      // ignore
    }

    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ q: query });
    if (generate) params.set("generate", "1");
    fetch(`/api/image?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.url) {
          setUrl(data.url);
          try {
            sessionStorage.setItem(cacheKey, data.url);
          } catch {
            // ignore quota or private mode
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, generate]);

  const isLarge = size === "large";
  const roundClass =
    rounded === "full" ? "rounded-full object-cover" : isLarge ? "rounded-none" : "rounded-xl object-cover";

  if (loading) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-zinc-800 ${sizeClasses[size]} ${roundClass} ${className}`}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!url) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-zinc-800 text-3xl text-zinc-600 ${sizeClasses[size]} ${roundClass} ${className}`}
      >
        🍽️
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`object-cover ${sizeClasses[size]} ${roundClass} ${className}`}
      sizes={isLarge ? "100vw" : "128px"}
    />
  );
}
