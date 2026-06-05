const TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 200;

interface Entry<T> {
  data: T;
  expires: number;
}

const substituteCache = new Map<string, Entry<{ substitutions: unknown[] }>>();
const recipeCache = new Map<string, Entry<{ recipes: unknown[] }>>();

function prune<T>(map: Map<string, Entry<T>>) {
  const now = Date.now();
  for (const [key, entry] of map.entries()) {
    if (entry.expires <= now) map.delete(key);
  }
  while (map.size > MAX_ENTRIES) {
    const first = map.keys().next().value;
    if (first) map.delete(first);
  }
}

export function getSubstituteCached(key: string): { substitutions: unknown[] } | null {
  const entry = substituteCache.get(key);
  if (!entry) return null;
  if (entry.expires <= Date.now()) {
    substituteCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setSubstituteCached(key: string, data: { substitutions: unknown[] }): void {
  prune(substituteCache);
  substituteCache.set(key, { data, expires: Date.now() + TTL_MS });
}

export function getRecipeCached(key: string): { recipes: unknown[] } | null {
  const entry = recipeCache.get(key);
  if (!entry) return null;
  if (entry.expires <= Date.now()) {
    recipeCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setRecipeCached(key: string, data: { recipes: unknown[] }): void {
  prune(recipeCache);
  recipeCache.set(key, { data, expires: Date.now() + TTL_MS });
}
