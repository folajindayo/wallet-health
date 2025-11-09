/**
 * Multi-chain Portfolio Aggregator Utility
 * Aggregate portfolios across multiple chains
 */

export interface ChainPortfolio {
  chainId: number;
  chainName: string;
  totalValueUSD: number;
  tokenCount: number;
  nftCount: number;
  defiValueUSD: number;
  nativeBalance: string;
  nativeBalanceUSD: number;
  lastUpdated: number;
}

export interface AggregatedPortfolio {
  walletAddress: string;
  chains: ChainPortfolio[];
  totalValueUSD: number;
  byChain: Record<number, ChainPortfolio>;
  topTokens: Array<{
    token: string;
    symbol: string;
    totalBalance: string;
    totalValueUSD: number;
    chains: number[];
  }>;
  distribution: {
    byChain: Record<number, number>; // Percentage
    byCategory: Record<string, number>; // Percentage
  };
  lastUpdated: number;
}

export interface PortfolioComparison {
  portfolio1: AggregatedPortfolio;
  portfolio2: AggregatedPortfolio;
  valueDifference: number; // USD
  valueDifferencePercent: number;
  chainDifferences: Array<{
    chainId: number;
    chainName: string;
    difference: number; // USD
    differencePercent: number;
  }>;
}

export class MultiChainPortfolioAggregator {
  private portfolios: Map<string, AggregatedPortfolio> = new Map();

  /**
   * Aggregate portfolio across chains
   */
  aggregatePortfolio(
    walletAddress: string,
    chainPortfolios: ChainPortfolio[]
  ): AggregatedPortfolio {
    const totalValueUSD = chainPortfolios.reduce((sum, p) => sum + p.totalValueUSD, 0);

    // Group by chain
    const byChain: Record<number, ChainPortfolio> = {};
    chainPortfolios.forEach(p => {
      byChain[p.chainId] = p;
    });

    // Calculate distribution by chain
    const distributionByChain: Record<number, number> = {};
    chainPortfolios.forEach(p => {
      distributionByChain[p.chainId] = totalValueUSD > 0
        ? (p.totalValueUSD / totalValueUSD) * 100
        : 0;
    });

    // Aggregate top tokens (would need token data from each chain)
    const topTokens: AggregatedPortfolio['topTokens'] = [];

    // Calculate distribution by category
    const distributionByCategory: Record<string, number> = {
      native: 0,
      tokens: 0,
      defi: 0,
      nfts: 0,
    };

    chainPortfolios.forEach(p => {
      if (totalValueUSD > 0) {
        distributionByCategory.native += (p.nativeBalanceUSD / totalValueUSD) * 100;
        distributionByCategory.defi += (p.defiValueUSD / totalValueUSD) * 100;
      }
    });

    const portfolio: AggregatedPortfolio = {
      walletAddress: walletAddress.toLowerCase(),
      chains: chainPortfolios,
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      byChain,
      topTokens,
      distribution: {
        byChain: distributionByChain,
        byCategory: distributionByCategory,
      },
      lastUpdated: Date.now(),
    };

    this.portfolios.set(walletAddress.toLowerCase(), portfolio);
    return portfolio;
  }

  /**
   * Get aggregated portfolio
   */
  getPortfolio(walletAddress: string): AggregatedPortfolio | null {
    return this.portfolios.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Compare two portfolios
   */
  comparePortfolios(
    walletAddress1: string,
    walletAddress2: string
  ): PortfolioComparison | null {
    const portfolio1 = this.getPortfolio(walletAddress1);
    const portfolio2 = this.getPortfolio(walletAddress2);

    if (!portfolio1 || !portfolio2) {
      return null;
    }

    const valueDifference = portfolio2.totalValueUSD - portfolio1.totalValueUSD;
    const valueDifferencePercent = portfolio1.totalValueUSD > 0
      ? (valueDifference / portfolio1.totalValueUSD) * 100
      : 0;

    // Compare by chain
    const chainDifferences: PortfolioComparison['chainDifferences'] = [];
    const allChainIds = new Set([
      ...portfolio1.chains.map(c => c.chainId),
      ...portfolio2.chains.map(c => c.chainId),
    ]);

    allChainIds.forEach(chainId => {
      const p1Chain = portfolio1.byChain[chainId];
      const p2Chain = portfolio2.byChain[chainId];
      const chainName = p1Chain?.chainName || p2Chain?.chainName || `Chain ${chainId}`;

      const value1 = p1Chain?.totalValueUSD || 0;
      const value2 = p2Chain?.totalValueUSD || 0;
      const difference = value2 - value1;
      const differencePercent = value1 > 0
        ? (difference / value1) * 100
        : 0;

      chainDifferences.push({
        chainId,
        chainName,
        difference: Math.round(difference * 100) / 100,
        differencePercent: Math.round(differencePercent * 100) / 100,
      });
    });

    return {
      portfolio1,
      portfolio2,
      valueDifference: Math.round(valueDifference * 100) / 100,
      valueDifferencePercent: Math.round(valueDifferencePercent * 100) / 100,
      chainDifferences,
    };
  }

  /**
   * Get portfolio statistics
   */
  getPortfolioStats(walletAddress: string): {
    totalChains: number;
    largestChain: ChainPortfolio | null;
    smallestChain: ChainPortfolio | null;
    averageChainValue: number;
    diversificationScore: number; // 0-100
  } | null {
    const portfolio = this.getPortfolio(walletAddress);
    if (!portfolio) {
      return null;
    }

    const chains = portfolio.chains;
    if (chains.length === 0) {
      return {
        totalChains: 0,
        largestChain: null,
        smallestChain: null,
        averageChainValue: 0,
        diversificationScore: 0,
      };
    }

    const largestChain = chains.reduce((largest, current) =>
      current.totalValueUSD > largest.totalValueUSD ? current : largest
    );

    const smallestChain = chains.reduce((smallest, current) =>
      current.totalValueUSD < smallest.totalValueUSD ? current : smallest
    );

    const averageChainValue = portfolio.totalValueUSD / chains.length;

    // Calculate diversification score (higher if more evenly distributed)
    const values = chains.map(c => c.totalValueUSD);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue;
    const diversificationScore = portfolio.totalValueUSD > 0
      ? Math.max(0, 100 - (range / portfolio.totalValueUSD) * 100)
      : 0;

    return {
      totalChains: chains.length,
      largestChain,
      smallestChain,
      averageChainValue: Math.round(averageChainValue * 100) / 100,
      diversificationScore: Math.round(diversificationScore * 100) / 100,
    };
  }

  /**
   * Clear portfolio
   */
  clear(walletAddress?: string): void {
    if (walletAddress) {
      this.portfolios.delete(walletAddress.toLowerCase());
    } else {
      this.portfolios.clear();
    }
  }
}

// Singleton instance
export const multiChainPortfolioAggregator = new MultiChainPortfolioAggregator();

