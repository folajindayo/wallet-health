/**
 * Cache Helper
 */

export interface CacheOptions {
  ttl: number; // Time to live in milliseconds
}

export class CacheHelper<T> {
  private cache = new Map<string, { data: T; expiresAt: number }>();

  set(key: string, value: T, options: CacheOptions): void {
    const expiresAt = Date.now() + options.ttl;
    this.cache.set(key, { data: value, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}


