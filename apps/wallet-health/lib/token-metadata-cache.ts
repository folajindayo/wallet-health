/**
 * Token Metadata Cache
 * Caches token metadata to reduce API calls and improve performance
 */

export interface TokenMetadata {
  address: string;
  chainId: number;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  verified: boolean;
  tags?: string[];
  priceUSD?: number;
  lastUpdated: number;
}

export interface CacheStats {
  totalEntries: number;
  hits: number;
  misses: number;
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
}

export class TokenMetadataCache {
  private cache: Map<string, TokenMetadata> = new Map(); // address-chain -> metadata
  private stats = {
    hits: 0,
    misses: 0,
  };
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get token metadata
   */
  async getMetadata(
    tokenAddress: string,
    chainId: number,
    forceRefresh: boolean = false
  ): Promise<TokenMetadata | null> {
    const key = `${tokenAddress.toLowerCase()}-${chainId}`;
    const cached = this.cache.get(key);

    // Check if cached and still valid
    if (!forceRefresh && cached) {
      const age = Date.now() - cached.lastUpdated;
      if (age < this.CACHE_TTL) {
        this.stats.hits++;
        return cached;
      }
    }

    // Fetch from API
    this.stats.misses++;
    try {
      const metadata = await this.fetchMetadata(tokenAddress, chainId);
      if (metadata) {
        this.cache.set(key, metadata);
      }
      return metadata;
    } catch (error) {
      console.error(`Error fetching metadata for ${tokenAddress}:`, error);
      // Return cached even if expired as fallback
      return cached || null;
    }
  }

  /**
   * Batch get metadata
   */
  async batchGetMetadata(
    tokens: Array<{ address: string; chainId: number }>,
    forceRefresh: boolean = false
  ): Promise<Map<string, TokenMetadata>> {
    const results = new Map<string, TokenMetadata>();

    await Promise.all(
      tokens.map(async ({ address, chainId }) => {
        const metadata = await this.getMetadata(address, chainId, forceRefresh);
        if (metadata) {
          results.set(`${address.toLowerCase()}-${chainId}`, metadata);
        }
      })
    );

    return results;
  }

  /**
   * Set metadata manually
   */
  setMetadata(metadata: TokenMetadata): void {
    const key = `${metadata.address.toLowerCase()}-${metadata.chainId}`;
    this.cache.set(key, {
      ...metadata,
      lastUpdated: Date.now(),
    });
  }

  /**
   * Batch set metadata
   */
  batchSetMetadata(metadataList: TokenMetadata[]): void {
    metadataList.forEach(metadata => this.setMetadata(metadata));
  }

  /**
   * Invalidate cache for token
   */
  invalidate(tokenAddress: string, chainId: number): boolean {
    const key = `${tokenAddress.toLowerCase()}-${chainId}`;
    return this.cache.delete(key);
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    this.cache.forEach((metadata, key) => {
      const age = now - metadata.lastUpdated;
      if (age >= this.CACHE_TTL) {
        this.cache.delete(key);
        cleared++;
      }
    });

    return cleared;
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.lastUpdated);

    return {
      totalEntries: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate:
        this.stats.hits + this.stats.misses > 0
          ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
          : 0,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0,
    };
  }

  /**
   * Search tokens by symbol or name
   */
  searchTokens(query: string, chainId?: number): TokenMetadata[] {
    const queryLower = query.toLowerCase();
    const results: TokenMetadata[] = [];

    this.cache.forEach(metadata => {
      if (chainId && metadata.chainId !== chainId) return;

      if (
        metadata.symbol.toLowerCase().includes(queryLower) ||
        metadata.name.toLowerCase().includes(queryLower)
      ) {
        results.push(metadata);
      }
    });

    return results;
  }

  /**
   * Get verified tokens
   */
  getVerifiedTokens(chainId?: number): TokenMetadata[] {
    const results: TokenMetadata[] = [];

    this.cache.forEach(metadata => {
      if (chainId && metadata.chainId !== chainId) return;
      if (metadata.verified) {
        results.push(metadata);
      }
    });

    return results;
  }

  /**
   * Export cache
   */
  exportCache(): TokenMetadata[] {
    return Array.from(this.cache.values());
  }

  /**
   * Import cache
   */
  importCache(metadataList: TokenMetadata[]): void {
    metadataList.forEach(metadata => this.setMetadata(metadata));
  }

  /**
   * Private method to fetch metadata from API
   */
  private async fetchMetadata(
    tokenAddress: string,
    chainId: number
  ): Promise<TokenMetadata | null> {
    // Placeholder - would integrate with token list API or GoldRush API
    // For now, return mock structure
    return {
      address: tokenAddress,
      chainId,
      symbol: 'TOKEN',
      name: 'Token Name',
      decimals: 18,
      verified: false,
      lastUpdated: Date.now(),
    };
  }
}

// Singleton instance
export const tokenMetadataCache = new TokenMetadataCache();
