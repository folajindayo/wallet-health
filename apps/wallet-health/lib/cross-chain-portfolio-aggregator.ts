/**
 * Cross-chain Portfolio Aggregator Utility
 * Aggregate and analyze portfolio across multiple chains
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
  nfts: Array<{
    contractAddress: string;
    tokenId: string;
    name?: string;
    valueUSD?: number;
  }>;
  staked: {
    totalValueUSD: number;
    positions: Array<{
      protocol: string;
      valueUSD: number;
    }>;
  };
}

export interface AggregatedPortfolio {
  walletAddress: string;
  totalValueUSD: number;
  chains: ChainPortfolio[];
  summary: {
    totalTokens: number;
    totalNFTs: number;
    totalStaked: number;
    chainsWithAssets: number;
    largestChain: number; // chainId
    diversification: number; // 0-100
  };
  distribution: {
    byChain: Array<{
      chainId: number;
      chainName: string;
      percentage: number;
      valueUSD: number;
    }>;
    byAssetType: {
      tokens: number;
      nfts: number;
      staked: number;
    };
  };
  trends?: {
    historicalValues: Array<{
      timestamp: number;
      totalValueUSD: number;
      byChain: Record<number, number>;
    }>;
  };
}

export class CrossChainPortfolioAggregator {
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

    const totalTokens = chainPortfolios.reduce(
      (sum, chain) => sum + chain.tokens.length,
      0
    );

    const totalNFTs = chainPortfolios.reduce(
      (sum, chain) => sum + chain.nfts.length,
      0
    );

    const totalStaked = chainPortfolios.reduce(
      (sum, chain) => sum + chain.staked.totalValueUSD,
      0
    );

    const chainsWithAssets = chainPortfolios.filter(
      chain => chain.totalValueUSD > 0
    ).length;

    // Find largest chain
    const largestChain = chainPortfolios.reduce((max, chain) =>
      chain.totalValueUSD > max.totalValueUSD ? chain : max,
      chainPortfolios[0]
    )?.chainId || 0;

    // Calculate diversification (how evenly distributed across chains)
    const diversification = this.calculateDiversification(chainPortfolios, totalValueUSD);

    // Calculate distribution by chain
    const distributionByChain = chainPortfolios.map(chain => ({
      chainId: chain.chainId,
      chainName: chain.chainName,
      percentage: totalValueUSD > 0
        ? (chain.totalValueUSD / totalValueUSD) * 100
        : 0,
      valueUSD: chain.totalValueUSD,
    }));

    // Calculate distribution by asset type
    const distributionByAssetType = {
      tokens: totalValueUSD > 0
        ? ((totalValueUSD - totalStaked) / totalValueUSD) * 100
        : 0,
      nfts: 0, // Would need NFT values
      staked: totalValueUSD > 0
        ? (totalStaked / totalValueUSD) * 100
        : 0,
    };

    return {
      walletAddress,
      totalValueUSD,
      chains: chainPortfolios,
      summary: {
        totalTokens,
        totalNFTs,
        totalStaked,
        chainsWithAssets,
        largestChain,
        diversification: Math.round(diversification * 100) / 100,
      },
      distribution: {
        byChain: distributionByChain,
        byAssetType: distributionByAssetType,
      },
    };
  }

  /**
   * Calculate diversification score
   */
  private calculateDiversification(
    chains: ChainPortfolio[],
    totalValue: number
  ): number {
    if (chains.length === 0 || totalValue === 0) return 0;

    // Calculate entropy (higher = more diversified)
    let entropy = 0;
    chains.forEach(chain => {
      const proportion = chain.totalValueUSD / totalValue;
      if (proportion > 0) {
        entropy -= proportion * Math.log2(proportion);
      }
    });

    // Normalize to 0-100 (max entropy = log2(number of chains))
    const maxEntropy = Math.log2(chains.length);
    const normalized = maxEntropy > 0 ? (entropy / maxEntropy) * 100 : 0;

    return Math.min(100, Math.max(0, normalized));
  }

  /**
   * Get portfolio value by chain
   */
  getValueByChain(
    portfolio: AggregatedPortfolio,
    chainId: number
  ): number {
    const chain = portfolio.chains.find(c => c.chainId === chainId);
    return chain?.totalValueUSD || 0;
  }

  /**
   * Get top tokens across all chains
   */
  getTopTokens(
    portfolio: AggregatedPortfolio,
    limit = 10
  ): Array<{
    symbol: string;
    address: string;
    chainId: number;
    valueUSD: number;
  }> {
    const allTokens: Array<{
      symbol: string;
      address: string;
      chainId: number;
      valueUSD: number;
    }> = [];

    portfolio.chains.forEach(chain => {
      chain.tokens.forEach(token => {
        allTokens.push({
          symbol: token.symbol,
          address: token.address,
          chainId: chain.chainId,
          valueUSD: token.valueUSD,
        });
      });
    });

    return allTokens
      .sort((a, b) => b.valueUSD - a.valueUSD)
      .slice(0, limit);
  }

  /**
   * Compare portfolios
   */
  comparePortfolios(
    portfolio1: AggregatedPortfolio,
    portfolio2: AggregatedPortfolio
  ): {
    totalValueDifference: number;
    totalValueDifferencePercent: number;
    chainDifferences: Array<{
      chainId: number;
      difference: number;
      differencePercent: number;
    }>;
    diversificationDifference: number;
  } {
    const totalValueDifference = portfolio2.totalValueUSD - portfolio1.totalValueUSD;
    const totalValueDifferencePercent = portfolio1.totalValueUSD > 0
      ? (totalValueDifference / portfolio1.totalValueUSD) * 100
      : 0;

    const chainDifferences: Array<{
      chainId: number;
      difference: number;
      differencePercent: number;
    }> = [];

    const allChainIds = new Set([
      ...portfolio1.chains.map(c => c.chainId),
      ...portfolio2.chains.map(c => c.chainId),
    ]);

    allChainIds.forEach(chainId => {
      const value1 = this.getValueByChain(portfolio1, chainId);
      const value2 = this.getValueByChain(portfolio2, chainId);
      const difference = value2 - value1;
      const differencePercent = value1 > 0
        ? (difference / value1) * 100
        : 0;

      chainDifferences.push({
        chainId,
        difference,
        differencePercent: Math.round(differencePercent * 100) / 100,
      });
    });

    const diversificationDifference =
      portfolio2.summary.diversification - portfolio1.summary.diversification;

    return {
      totalValueDifference: Math.round(totalValueDifference * 100) / 100,
      totalValueDifferencePercent: Math.round(totalValueDifferencePercent * 100) / 100,
      chainDifferences,
      diversificationDifference: Math.round(diversificationDifference * 100) / 100,
    };
  }

  /**
   * Calculate portfolio health score
   */
  calculatePortfolioHealth(portfolio: AggregatedPortfolio): {
    score: number; // 0-100
    factors: Array<{
      factor: string;
      score: number;
      impact: 'positive' | 'negative';
    }>;
  } {
    const factors: Array<{
      factor: string;
      score: number;
      impact: 'positive' | 'negative';
    }> = [];

    let score = 100;

    // Diversification factor
    const diversificationScore = portfolio.summary.diversification;
    factors.push({
      factor: 'Diversification',
      score: diversificationScore,
      impact: diversificationScore > 50 ? 'positive' : 'negative',
    });
    if (diversificationScore < 30) {
      score -= 20;
    } else if (diversificationScore < 50) {
      score -= 10;
    }

    // Multi-chain presence
    const multiChainScore = portfolio.summary.chainsWithAssets > 1 ? 100 : 50;
    factors.push({
      factor: 'Multi-chain Presence',
      score: multiChainScore,
      impact: multiChainScore === 100 ? 'positive' : 'negative',
    });
    if (portfolio.summary.chainsWithAssets === 1) {
      score -= 15;
    }

    // Asset type diversity
    const hasTokens = portfolio.summary.totalTokens > 0;
    const hasNFTs = portfolio.summary.totalNFTs > 0;
    const hasStaked = portfolio.summary.totalStaked > 0;
    const assetDiversity = [hasTokens, hasNFTs, hasStaked].filter(Boolean).length;
    const assetDiversityScore = (assetDiversity / 3) * 100;
    factors.push({
      factor: 'Asset Type Diversity',
      score: assetDiversityScore,
      impact: assetDiversityScore > 66 ? 'positive' : 'negative',
    });

    return {
      score: Math.max(0, Math.min(100, score)),
      factors,
    };
  }
}

// Singleton instance
export const crossChainPortfolioAggregator = new CrossChainPortfolioAggregator();

