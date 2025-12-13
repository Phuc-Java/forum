type CacheEntry<T> = { value: T; expiresAt: number | null };

const store = new Map<string, CacheEntry<unknown>>();

export function cacheSet<T>(key: string, value: T, ttlSeconds?: number) {
  const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
  store.set(key, { value, expiresAt });
}

export function cacheGet<T>(key: string): T | null {
  const e = store.get(key) as CacheEntry<T> | undefined;
  if (!e) return null;
  if (e.expiresAt && e.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  return e.value as T;
}

export async function cacheWrap<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== null) return hit;
  const val = await fn();
  cacheSet(key, val, ttlSeconds);
  return val;
}

export function cacheDelete(key: string) {
  store.delete(key);
}

export function cacheClear() {
  store.clear();
}

// Simple periodic cleanup to avoid memory leaks in long-running servers
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (v.expiresAt && v.expiresAt < now) store.delete(k);
  }
}, 60_000).unref?.();

export default { cacheGet, cacheSet, cacheWrap, cacheDelete, cacheClear };
