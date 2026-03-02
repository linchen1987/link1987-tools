const STORAGE_PREFIX = "@link1987tools/";

export function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  
  try {
    const fullKey = getStorageKey(key);
    const item = localStorage.getItem(fullKey);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    const fullKey = getStorageKey(key);
    localStorage.setItem(fullKey, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    const fullKey = getStorageKey(key);
    localStorage.removeItem(fullKey);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}
