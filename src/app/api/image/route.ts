import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getCacheKey, getCachedImageUrl, setCachedImage } from "@/lib/image-cache";

const FALLBACK_FOOD =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const generate = searchParams.get("generate") === "1" || searchParams.get("generate") === "true";

  if (!q) {
    return NextResponse.json({ url: FALLBACK_FOOD });
  }

  const cacheKey = getCacheKey(q, generate);
  const cachedUrl = getCachedImageUrl(cacheKey);
  if (cachedUrl) {
    return NextResponse.json({ url: cachedUrl });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  let imageUrl: string | null = null;

  if (generate && openaiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const prompt = `Appetizing, professional food photography of "${q}", single dish, clean presentation, high quality restaurant style, no text`;
      const resp = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });
      imageUrl = resp.data?.[0]?.url ?? null;
    } catch (err) {
      console.error("DALL-E image generation failed:", err);
    }
  }

  if (!imageUrl) {
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    if (unsplashKey) {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape`,
          {
            headers: { Authorization: `Client-ID ${unsplashKey}` },
            next: { revalidate: 86400 },
          }
        );
        if (res.ok) {
          const data = (await res.json()) as { results?: { urls?: { regular?: string } }[] };
          imageUrl = data.results?.[0]?.urls?.regular ?? FALLBACK_FOOD;
        }
      } catch {
        // fall through
      }
    }
  }

  if (!imageUrl) {
    return NextResponse.json({ url: FALLBACK_FOOD });
  }

  const buffer = await fetchImageBuffer(imageUrl);
  if (buffer && buffer.length > 0) {
    setCachedImage(cacheKey, buffer);
    return NextResponse.json({ url: `/api/image/cached?k=${cacheKey}` });
  }

  return NextResponse.json({ url: imageUrl });
}
