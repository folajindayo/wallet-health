/**
 * Multi-Chain Portfolio Aggregator
 * Aggregates portfolio data across multiple chains
 */

export interface ChainPortfolio {
  chainId: number;
  chainName: string;
  totalValueUSD: number;
  tokens: Array<{
    address: string;
    symbol: string;
    balance: string;
    valueUSD: number;
  }>;
  nfts?: Array<{
    contract: string;
    tokenId: string;
    name: string;
    valueUSD?: number;
  }>;
}

export interface AggregatedPortfolio {
  walletAddress: string;
  totalValueUSD: number;
  chains: ChainPortfolio[];
  summary: {
    totalChains: number;
    activeChains: number;
    chainDistribution: Record<number, {
      chainName: string;
      valueUSD: number;
      allocation: number;
    }>;
    topTokens: Array<{
      symbol: string;
      totalValueUSD: number;
      chains: number[];
    }>;
    topChains: Array<{
      chainId: number;
      chainName: string;
      valueUSD: number;
      allocation: number;
    }>;
  };
  lastUpdated: number;
}

export class MultiChainPortfolioAggregator {
  /**
   * Aggregate portfolio across chains
   */
  aggregatePortfolio(
    walletAddress: string,
    chainPortfolios: ChainPortfolio[]
  ): AggregatedPortfolio {
    const totalValueUSD = chainPortfolios.reduce(
      (sum, chain) => sum + chain.totalValueUSD,
      0
    );

    // Calculate chain distribution
    const chainDistribution: Record<number, {
      chainName: string;
      valueUSD: number;
      allocation: number;
    }> = {};

    chainPortfolios.forEach(chain => {
      chainDistribution[chain.chainId] = {
        chainName: chain.chainName,
        valueUSD: chain.totalValueUSD,
        allocation: totalValueUSD > 0
          ? (chain.totalValueUSD / totalValueUSD) * 100
          : 0,
      };
    });

    // Aggregate tokens across chains
    const tokenMap = new Map<string, {
      symbol: string;
      totalValueUSD: number;
      chains: Set<number>;
    }>();

    chainPortfolios.forEach(chain => {
      chain.tokens.forEach(token => {
        const key = token.address.toLowerCase();
        const existing = tokenMap.get(key);

        if (existing) {
          existing.totalValueUSD += token.valueUSD;
          existing.chains.add(chain.chainId);
        } else {
          tokenMap.set(key, {
            symbol: token.symbol,
            totalValueUSD: token.valueUSD,
            chains: new Set([chain.chainId]),
          });
        }
      });
    });

    const topTokens = Array.from(tokenMap.values())
      .sort((a, b) => b.totalValueUSD - a.totalValueUSD)
      .slice(0, 10)
      .map(t => ({
        symbol: t.symbol,
        totalValueUSD: Math.round(t.totalValueUSD * 100) / 100,
        chains: Array.from(t.chains),
      }));

    // Top chains by value
    const topChains = chainPortfolios
      .sort((a, b) => b.totalValueUSD - a.totalValueUSD)
      .slice(0, 5)
      .map(chain => ({
        chainId: chain.chainId,
        chainName: chain.chainName,
        valueUSD: chain.totalValueUSD,
        allocation: totalValueUSD > 0
          ? Math.round((chain.totalValueUSD / totalValueUSD) * 100 * 100) / 100
          : 0,
      }));

    const activeChains = chainPortfolios.filter(c => c.totalValueUSD > 0).length;

    return {
      walletAddress,
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      chains: chainPortfolios,
      summary: {
        totalChains: chainPortfolios.length,
        activeChains,
        chainDistribution,
        topTokens,
        topChains,
      },
      lastUpdated: Date.now(),
    };
  }

  /**
   * Calculate cross-chain token totals
   */
  calculateCrossChainTokenTotals(
    chainPortfolios: ChainPortfolio[]
  ): Map<string, {
    symbol: string;
    totalBalance: string;
    totalValueUSD: number;
    chains: number[];
  }> {
    const tokenMap = new Map<string, {
      symbol: string;
      totalBalance: bigint;
      totalValueUSD: number;
      chains: Set<number>;
    }>();

    chainPortfolios.forEach(chain => {
      chain.tokens.forEach(token => {
        const key = token.address.toLowerCase();
        const existing = tokenMap.get(key);

        if (existing) {
          existing.totalBalance += BigInt(token.balance);
          existing.totalValueUSD += token.valueUSD;
          existing.chains.add(chain.chainId);
        } else {
          tokenMap.set(key, {
            symbol: token.symbol,
            totalBalance: BigInt(token.balance),
            totalValueUSD: token.valueUSD,
            chains: new Set([chain.chainId]),
          });
        }
      });
    });

    const result = new Map<string, {
      symbol: string;
      totalBalance: string;
      totalValueUSD: number;
      chains: number[];
    }>();

    tokenMap.forEach((data, address) => {
      result.set(address, {
        symbol: data.symbol,
        totalBalance: data.totalBalance.toString(),
        totalValueUSD: Math.round(data.totalValueUSD * 100) / 100,
        chains: Array.from(data.chains),
      });
    });

    return result;
  }

  /**
   * Get chain allocation recommendations
   */
  getChainAllocationRecommendations(
    aggregated: AggregatedPortfolio
  ): Array<{
    chainId: number;
    chainName: string;
    currentAllocation: number;
    recommendedAllocation: number;
    reason: string;
  }> {
    const recommendations: Array<{
      chainId: number;
      chainName: string;
      currentAllocation: number;
      recommendedAllocation: number;
      reason: string;
    }> = [];

    // Check for over-concentration
    aggregated.summary.topChains.forEach(chain => {
      if (chain.allocation > 50) {
        recommendations.push({
          chainId: chain.chainId,
          chainName: chain.chainName,
          currentAllocation: chain.allocation,
          recommendedAllocation: 40,
          reason: 'Over-concentration risk - consider diversifying',
        });
      }
    });

    // Recommend L2s for cost savings
    const l2Chains = aggregated.chains.filter(
      c => c.chainId === 8453 || c.chainId === 42161 || c.chainId === 10
    );
    const l2Total = l2Chains.reduce((sum, c) => sum + c.totalValueUSD, 0);
    const l2Allocation = aggregated.totalValueUSD > 0
      ? (l2Total / aggregated.totalValueUSD) * 100
      : 0;

    if (l2Allocation < 20 && aggregated.totalValueUSD > 1000) {
      recommendations.push({
        chainId: 8453,
        chainName: 'Base',
        currentAllocation: l2Allocation,
        recommendedAllocation: 30,
        reason: 'Consider moving more assets to L2 for lower fees',
      });
    }

    return recommendations;
  }
}

// Singleton instance
export const multiChainPortfolioAggregator = new MultiChainPortfolioAggregator();
