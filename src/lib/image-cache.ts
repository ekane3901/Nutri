import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CACHE_DIR = join(process.cwd(), ".cache", "images");
const MAX_MEMORY_ENTRIES = 80;

const memoryCache = new Map<string, Buffer>();
const memoryKeys: string[] = [];

function getCacheKey(query: string, generate: boolean): string {
  const input = `${query.toLowerCase().trim()}|${generate}`;
  return createHash("sha256").update(input).digest("hex").slice(0, 20);
}

function ensureDir(): boolean {
  try {
    if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export function getCachedImageUrl(key: string): string | null {
  if (memoryCache.has(key)) return `/api/image/cached?k=${key}`;
  if (ensureDir()) {
    const file = join(CACHE_DIR, `${key}.jpg`);
    if (existsSync(file)) return `/api/image/cached?k=${key}`;
  }
  return null;
}

export function setCachedImage(key: string, buffer: Buffer): void {
  if (ensureDir()) {
    try {
      writeFileSync(join(CACHE_DIR, `${key}.jpg`), buffer);
    } catch {
      // e.g. read-only fs in serverless
    }
  }
  while (memoryKeys.length >= MAX_MEMORY_ENTRIES && memoryKeys.length > 0) {
    const oldest = memoryKeys.shift();
    if (oldest) memoryCache.delete(oldest);
  }
  memoryCache.set(key, buffer);
  if (!memoryKeys.includes(key)) memoryKeys.push(key);
}

export function getCachedImageBuffer(key: string): Buffer | null {
  const mem = memoryCache.get(key);
  if (mem) return mem;
  if (ensureDir()) {
    const file = join(CACHE_DIR, `${key}.jpg`);
    if (existsSync(file)) {
      try {
        const buf = readFileSync(file);
        while (memoryKeys.length >= MAX_MEMORY_ENTRIES && memoryKeys.length > 0) {
          const oldest = memoryKeys.shift();
          if (oldest) memoryCache.delete(oldest);
        }
        memoryCache.set(key, buf);
        memoryKeys.push(key);
        return buf;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export { getCacheKey };
