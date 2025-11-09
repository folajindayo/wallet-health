/**
 * NFT Collection Tracker Utility
 * Track NFT collections and their values
 */

export interface NFTCollection {
  contractAddress: string;
  name: string;
  symbol: string;
  chainId: number;
  standard: 'ERC721' | 'ERC1155';
  totalSupply: number;
  floorPrice: number; // ETH or native token
  floorPriceUSD: number;
  totalVolume: number; // USD
  owners: number;
  verified: boolean;
  description?: string;
  imageUrl?: string;
  website?: string;
  twitter?: string;
}

export interface NFTToken {
  tokenId: string;
  collectionAddress: string;
  owner: string;
  name?: string;
  imageUrl?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  lastSalePrice?: number; // USD
  lastSaleDate?: number;
  estimatedValue?: number; // USD
}

export interface CollectionStats {
  collection: NFTCollection;
  userTokens: NFTToken[];
  totalValue: number; // USD
  averageValue: number; // USD
  floorValue: number; // USD
  topValue: number; // USD
  rarityRank?: number; // If available
  priceChange24h: number; // Percentage
  priceChange7d: number; // Percentage
}

export class NFTCollectionTracker {
  private collections: Map<string, NFTCollection> = new Map();
  private userNFTs: Map<string, Map<string, NFTToken[]>> = new Map(); // wallet -> chain -> tokens

  /**
   * Add collection
   */
  addCollection(collection: NFTCollection): void {
    const key = `${collection.contractAddress.toLowerCase()}-${collection.chainId}`;
    this.collections.set(key, collection);
  }

  /**
   * Get collection
   */
  getCollection(contractAddress: string, chainId: number): NFTCollection | null {
    const key = `${contractAddress.toLowerCase()}-${chainId}`;
    return this.collections.get(key) || null;
  }

  /**
   * Add user NFT
   */
  addUserNFT(walletAddress: string, chainId: number, token: NFTToken): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.userNFTs.has(walletKey)) {
      this.userNFTs.set(walletKey, new Map());
    }

    const walletMap = this.userNFTs.get(walletKey)!;
    const chainKey = chainId.toString();
    if (!walletMap.has(chainKey)) {
      walletMap.set(chainKey, []);
    }

    const tokens = walletMap.get(chainKey)!;
    
    // Check if token already exists
    const existingIndex = tokens.findIndex(
      t => t.tokenId === token.tokenId && t.collectionAddress.toLowerCase() === token.collectionAddress.toLowerCase()
    );

    if (existingIndex !== -1) {
      tokens[existingIndex] = token;
    } else {
      tokens.push(token);
    }
  }

  /**
   * Get user NFTs
   */
  getUserNFTs(walletAddress: string, chainId?: number): NFTToken[] {
    const walletKey = walletAddress.toLowerCase();
    const walletMap = this.userNFTs.get(walletKey);
    if (!walletMap) {
      return [];
    }

    if (chainId !== undefined) {
      return walletMap.get(chainId.toString()) || [];
    }

    // Return all chains
    const allTokens: NFTToken[] = [];
    walletMap.forEach(tokens => {
      allTokens.push(...tokens);
    });

    return allTokens;
  }

  /**
   * Get collection stats for user
   */
  getCollectionStats(
    walletAddress: string,
    collectionAddress: string,
    chainId: number
  ): CollectionStats | null {
    const collection = this.getCollection(collectionAddress, chainId);
    if (!collection) {
      return null;
    }

    const userTokens = this.getUserNFTs(walletAddress, chainId).filter(
      token => token.collectionAddress.toLowerCase() === collectionAddress.toLowerCase()
    );

    if (userTokens.length === 0) {
      return {
        collection,
        userTokens: [],
        totalValue: 0,
        averageValue: 0,
        floorValue: collection.floorPriceUSD,
        topValue: 0,
        priceChange24h: 0,
        priceChange7d: 0,
      };
    }

    const totalValue = userTokens.reduce((sum, token) => {
      return sum + (token.estimatedValue || token.lastSalePrice || collection.floorPriceUSD);
    }, 0);

    const averageValue = totalValue / userTokens.length;
    const floorValue = collection.floorPriceUSD;
    const topValue = Math.max(...userTokens.map(t => t.estimatedValue || t.lastSalePrice || 0));

    return {
      collection,
      userTokens,
      totalValue: Math.round(totalValue * 100) / 100,
      averageValue: Math.round(averageValue * 100) / 100,
      floorValue: Math.round(floorValue * 100) / 100,
      topValue: Math.round(topValue * 100) / 100,
      priceChange24h: 0, // Would fetch from API
      priceChange7d: 0, // Would fetch from API
    };
  }

  /**
   * Get all user collections
   */
  getUserCollections(walletAddress: string, chainId?: number): CollectionStats[] {
    const userTokens = this.getUserNFTs(walletAddress, chainId);
    const collectionMap = new Map<string, { address: string; chainId: number }>();

    userTokens.forEach(token => {
      const key = `${token.collectionAddress.toLowerCase()}-${token.chainId || chainId || 1}`;
      if (!collectionMap.has(key)) {
        collectionMap.set(key, {
          address: token.collectionAddress,
          chainId: token.chainId || chainId || 1,
        });
      }
    });

    const stats: CollectionStats[] = [];
    collectionMap.forEach(({ address, chainId: cid }) => {
      const stat = this.getCollectionStats(walletAddress, address, cid);
      if (stat) {
        stats.push(stat);
      }
    });

    return stats.sort((a, b) => b.totalValue - a.totalValue);
  }

  /**
   * Calculate total NFT portfolio value
   */
  calculatePortfolioValue(walletAddress: string, chainId?: number): {
    totalValue: number; // USD
    collectionCount: number;
    tokenCount: number;
    byCollection: Record<string, number>;
  } {
    const collections = this.getUserCollections(walletAddress, chainId);
    const totalValue = collections.reduce((sum, c) => sum + c.totalValue, 0);
    const tokenCount = collections.reduce((sum, c) => sum + c.userTokens.length, 0);

    const byCollection: Record<string, number> = {};
    collections.forEach(c => {
      byCollection[c.collection.name] = c.totalValue;
    });

    return {
      totalValue: Math.round(totalValue * 100) / 100,
      collectionCount: collections.length,
      tokenCount,
      byCollection,
    };
  }

  /**
   * Clear user NFTs
   */
  clearUserNFTs(walletAddress?: string, chainId?: number): void {
    if (walletAddress) {
      const walletKey = walletAddress.toLowerCase();
      if (chainId !== undefined) {
        const walletMap = this.userNFTs.get(walletKey);
        if (walletMap) {
          walletMap.delete(chainId.toString());
        }
      } else {
        this.userNFTs.delete(walletKey);
      }
    } else {
      this.userNFTs.clear();
    }
  }
}

// Singleton instance
export const nftCollectionTracker = new NFTCollectionTracker();

