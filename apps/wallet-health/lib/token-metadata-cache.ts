/**
 * Token Metadata Cache Utility
 * Cache token metadata to reduce API calls
 */

export interface TokenMetadata {
  address: string;
  chainId: number;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  priceUSD?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
  lastUpdated: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 1 hour)
  maxSize?: number; // Maximum cache size (default: 1000)
}

export class TokenMetadataCache {
  private cache: Map<string, TokenMetadata> = new Map();
  private readonly defaultTTL = 60 * 60 * 1000; // 1 hour
  private readonly defaultMaxSize = 1000;
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || this.defaultTTL,
      maxSize: options.maxSize || this.defaultMaxSize,
    };
  }

  /**
   * Generate cache key
   */
  private getCacheKey(address: string, chainId: number): string {
    return `${chainId}:${address.toLowerCase()}`;
  }

  /**
   * Check if metadata is expired
   */
  private isExpired(metadata: TokenMetadata): boolean {
    const age = Date.now() - metadata.lastUpdated;
    return age > this.options.ttl;
  }

  /**
   * Get token metadata from cache
   */
  get(address: string, chainId: number): TokenMetadata | null {
    const key = this.getCacheKey(address, chainId);
    const metadata = this.cache.get(key);

    if (!metadata) {
      return null;
    }

    if (this.isExpired(metadata)) {
      this.cache.delete(key);
      return null;
    }

    return metadata;
  }

  /**
   * Set token metadata in cache
   */
  set(metadata: TokenMetadata): void {
    // Check cache size and evict oldest if needed
    if (this.cache.size >= this.options.maxSize) {
      this.evictOldest();
    }

    const key = this.getCacheKey(metadata.address, metadata.chainId);
    const cachedMetadata: TokenMetadata = {
      ...metadata,
      lastUpdated: Date.now(),
    };

    this.cache.set(key, cachedMetadata);
    this.saveToStorage();
  }

  /**
   * Batch set multiple metadata entries
   */
  setBatch(metadataList: TokenMetadata[]): void {
    metadataList.forEach(metadata => this.set(metadata));
  }

  /**
   * Check if token exists in cache and is valid
   */
  has(address: string, chainId: number): boolean {
    const metadata = this.get(address, chainId);
    return metadata !== null;
  }

  /**
   * Remove token from cache
   */
  delete(address: string, chainId: number): boolean {
    const key = this.getCacheKey(address, chainId);
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
    expired: number;
  } {
    let expired = 0;
    this.cache.forEach(metadata => {
      if (this.isExpired(metadata)) {
        expired++;
      }
    });

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      expired,
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    let cleaned = 0;
    const keysToDelete: string[] = [];

    this.cache.forEach((metadata, key) => {
      if (this.isExpired(metadata)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      cleaned++;
    });

    if (cleaned > 0) {
      this.saveToStorage();
    }

    return cleaned;
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    this.cache.forEach((metadata, key) => {
      if (metadata.lastUpdated < oldestTime) {
        oldestTime = metadata.lastUpdated;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get all cached tokens for a chain
   */
  getChainTokens(chainId: number): TokenMetadata[] {
    const tokens: TokenMetadata[] = [];
    const prefix = `${chainId}:`;

    this.cache.forEach((metadata, key) => {
      if (key.startsWith(prefix) && !this.isExpired(metadata)) {
        tokens.push(metadata);
      }
    });

    return tokens;
  }

  /**
   * Search tokens by symbol or name
   */
  search(query: string, chainId?: number): TokenMetadata[] {
    const lowerQuery = query.toLowerCase();
    const results: TokenMetadata[] = [];

    this.cache.forEach((metadata, key) => {
      if (this.isExpired(metadata)) {
        return;
      }

      if (chainId && metadata.chainId !== chainId) {
        return;
      }

      if (
        metadata.symbol.toLowerCase().includes(lowerQuery) ||
        metadata.name.toLowerCase().includes(lowerQuery) ||
        metadata.address.toLowerCase().includes(lowerQuery)
      ) {
        results.push(metadata);
      }
    });

    return results;
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const cacheData = Array.from(this.cache.entries());
        localStorage.setItem(
          'wallet-health-token-cache',
          JSON.stringify({
            cache: cacheData,
            options: this.options,
            version: '1.0.0',
          })
        );
      } catch (error) {
        console.error('Failed to save token cache to storage:', error);
      }
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wallet-health-token-cache');
        if (stored) {
          const data = JSON.parse(stored);
          if (data.cache && Array.isArray(data.cache)) {
            data.cache.forEach(([key, metadata]: [string, TokenMetadata]) => {
              // Only load non-expired entries
              if (!this.isExpired(metadata)) {
                this.cache.set(key, metadata);
              }
            });
          }
          if (data.options) {
            this.options = { ...this.options, ...data.options };
          }
        }
      } catch (error) {
        console.error('Failed to load token cache from storage:', error);
      }
    }
  }
}

// Singleton instance
export const tokenMetadataCache = new TokenMetadataCache();

// Initialize from storage if available
if (typeof window !== 'undefined') {
  tokenMetadataCache.loadFromStorage();
}

