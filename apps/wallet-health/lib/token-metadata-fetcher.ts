/**
 * Token Metadata Fetcher Utility
 * Fetches and caches token metadata from various sources
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
  totalSupply?: string;
  verified: boolean;
  tags?: string[];
  website?: string;
  twitter?: string;
  description?: string;
}

export interface TokenPrice {
  address: string;
  chainId: number;
  priceUSD: number;
  priceChange24h: number;
  timestamp: number;
}

export interface TokenList {
  name: string;
  tokens: TokenMetadata[];
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  timestamp: number;
}

export class TokenMetadataFetcher {
  private cache: Map<string, TokenMetadata> = new Map();
  private priceCache: Map<string, TokenPrice> = new Map();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour
  private readonly PRICE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch token metadata
   */
  async fetchMetadata(
    address: string,
    chainId: number
  ): Promise<TokenMetadata | null> {
    const cacheKey = `${address.toLowerCase()}-${chainId}`;
    const cached = this.cache.get(cacheKey);

    // Return cached if still valid
    if (cached) {
      return cached;
    }

    // In production, would fetch from:
    // - Token contract (ERC20)
    // - CoinGecko API
    // - Token lists (Uniswap, etc.)
    // - Block explorer APIs

    // Placeholder metadata
    const metadata: TokenMetadata = {
      address: address.toLowerCase(),
      chainId,
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      decimals: 18,
      verified: false,
    };

    // Cache result
    this.cache.set(cacheKey, metadata);

    return metadata;
  }

  /**
   * Fetch multiple token metadata
   */
  async fetchMultipleMetadata(
    tokens: Array<{ address: string; chainId: number }>
  ): Promise<TokenMetadata[]> {
    const results = await Promise.all(
      tokens.map(t => this.fetchMetadata(t.address, t.chainId))
    );

    return results.filter((m): m is TokenMetadata => m !== null);
  }

  /**
   * Fetch token price
   */
  async fetchPrice(
    address: string,
    chainId: number
  ): Promise<TokenPrice | null> {
    const cacheKey = `${address.toLowerCase()}-${chainId}`;
    const cached = this.priceCache.get(cacheKey);

    // Return cached if still valid
    if (cached && Date.now() - cached.timestamp < this.PRICE_CACHE_TTL) {
      return cached;
    }

    // In production, would fetch from price APIs
    // Placeholder
    const price: TokenPrice = {
      address: address.toLowerCase(),
      chainId,
      priceUSD: 0,
      priceChange24h: 0,
      timestamp: Date.now(),
    };

    // Cache result
    this.priceCache.set(cacheKey, price);

    return price;
  }

  /**
   * Fetch prices for multiple tokens
   */
  async fetchMultiplePrices(
    tokens: Array<{ address: string; chainId: number }>
  ): Promise<Map<string, TokenPrice>> {
    const prices = new Map<string, TokenPrice>();

    await Promise.all(
      tokens.map(async t => {
        const price = await this.fetchPrice(t.address, t.chainId);
        if (price) {
          prices.set(`${t.address.toLowerCase()}-${t.chainId}`, price);
        }
      })
    );

    return prices;
  }

  /**
   * Search tokens by symbol or name
   */
  async searchTokens(
    query: string,
    chainId?: number
  ): Promise<TokenMetadata[]> {
    // In production, would search token lists and APIs
    // For now, search cache
    const results: TokenMetadata[] = [];

    this.cache.forEach(metadata => {
      if (chainId && metadata.chainId !== chainId) {
        return;
      }

      const queryLower = query.toLowerCase();
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
   * Get popular tokens
   */
  async getPopularTokens(
    chainId: number,
    limit = 20
  ): Promise<TokenMetadata[]> {
    // In production, would fetch from token lists sorted by market cap
    // For now, return cached tokens for the chain
    const results: TokenMetadata[] = [];

    this.cache.forEach(metadata => {
      if (metadata.chainId === chainId) {
        results.push(metadata);
      }
    });

    return results.slice(0, limit);
  }

  /**
   * Verify token
   */
  async verifyToken(
    address: string,
    chainId: number
  ): Promise<{
    verified: boolean;
    source?: string;
    contractAddress?: string;
  }> {
    // In production, would check:
    // - Token lists (Uniswap, etc.)
    // - Block explorer verification
    // - Known token databases

    const metadata = await this.fetchMetadata(address, chainId);
    return {
      verified: metadata?.verified || false,
      source: metadata?.verified ? 'token-list' : undefined,
      contractAddress: address,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.priceCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    metadataCount: number;
    priceCount: number;
    chains: number[];
  } {
    const chains = new Set<number>();
    this.cache.forEach(metadata => {
      chains.add(metadata.chainId);
    });

    return {
      metadataCount: this.cache.size,
      priceCount: this.priceCache.size,
      chains: Array.from(chains),
    };
  }
}

// Singleton instance
export const tokenMetadataFetcher = new TokenMetadataFetcher();

