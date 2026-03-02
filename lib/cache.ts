const CACHE_PREFIX = "@link1987tools/cache/";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const fullKey = `${CACHE_PREFIX}${key}`;
    const item = localStorage.getItem(fullKey);
    
    if (!item) {
      return null;
    }

    const cached: CacheItem<T> = JSON.parse(item);
    const now = Date.now();

    if (now - cached.timestamp > ONE_DAY_MS) {
      localStorage.removeItem(fullKey);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.error(`Error reading cache for key "${key}":`, error);
    return null;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const fullKey = `${CACHE_PREFIX}${key}`;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(fullKey, JSON.stringify(item));
  } catch (error) {
    console.error(`Error writing cache for key "${key}":`, error);
  }
}

export function clearCachedData(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const fullKey = `${CACHE_PREFIX}${key}`;
    localStorage.removeItem(fullKey);
  } catch (error) {
    console.error(`Error clearing cache for key "${key}":`, error);
  }
}

export function clearAllCache(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error("Error clearing all cache:", error);
  }
}

export function isCacheValid(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const fullKey = `${CACHE_PREFIX}${key}`;
    const item = localStorage.getItem(fullKey);
    
    if (!item) {
      return false;
    }

    const cached: CacheItem<unknown> = JSON.parse(item);
    const now = Date.now();

    return now - cached.timestamp <= ONE_DAY_MS;
  } catch (error) {
    return false;
  }
}
