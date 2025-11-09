/**
 * Liquidity Pool Analyzer Utility
 * Analyzes LP positions and impermanent loss
 */

export interface LiquidityPosition {
  poolAddress: string;
  poolName: string;
  chainId: number;
  token0: {
    address: string;
    symbol: string;
    amount: string;
    valueUSD: number;
  };
  token1: {
    address: string;
    symbol: string;
    amount: string;
    valueUSD: number;
  };
  lpTokens: string;
  lpTokenValue: number; // USD
  totalValueUSD: number;
  depositedAt: number;
  feesEarned?: number; // USD
  apr?: number;
}

export interface ImpermanentLoss {
  currentValue: number; // USD
  hodlValue: number; // USD if just held tokens
  impermanentLoss: number; // USD
  impermanentLossPercent: number; // Percentage
  priceRatio: number; // Current price ratio vs entry
}

export interface PoolAnalysis {
  position: LiquidityPosition;
  impermanentLoss: ImpermanentLoss;
  feesEarned: number;
  netReturn: number;
  netReturnPercent: number;
  breakEvenPrice: number;
  recommendations: string[];
}

export interface PoolStats {
  totalLiquidity: number; // USD
  volume24h: number; // USD
  fees24h: number; // USD
  apr: number; // Percentage
  tvl: number; // USD
  token0Price: number;
  token1Price: number;
  priceRatio: number;
}

export class LiquidityPoolAnalyzer {
  /**
   * Calculate impermanent loss
   */
  calculateImpermanentLoss(
    position: LiquidityPosition,
    currentToken0Price: number,
    currentToken1Price: number
  ): ImpermanentLoss {
    const entryToken0Value = position.token0.valueUSD;
    const entryToken1Value = position.token1.valueUSD;
    const entryTotalValue = entryToken0Value + entryToken1Value;

    // Calculate entry price ratio
    const entryPriceRatio = entryToken0Value / entryToken1Value;
    
    // Current price ratio
    const currentPriceRatio = currentToken0Price / currentToken1Price;
    const priceRatio = currentPriceRatio / entryPriceRatio;

    // Calculate current value in pool
    const currentValue = position.totalValueUSD;

    // Calculate HODL value (if tokens were just held)
    const hodlValue = entryTotalValue * Math.sqrt(priceRatio);

    // Calculate impermanent loss
    const impermanentLoss = currentValue - hodlValue;
    const impermanentLossPercent = entryTotalValue > 0
      ? (impermanentLoss / entryTotalValue) * 100
      : 0;

    return {
      currentValue,
      hodlValue,
      impermanentLoss,
      impermanentLossPercent: Math.round(impermanentLossPercent * 100) / 100,
      priceRatio,
    };
  }

  /**
   * Analyze liquidity position
   */
  analyzePosition(
    position: LiquidityPosition,
    currentToken0Price: number,
    currentToken1Price: number,
    poolStats?: PoolStats
  ): PoolAnalysis {
    const impermanentLoss = this.calculateImpermanentLoss(
      position,
      currentToken0Price,
      currentToken1Price
    );

    const feesEarned = position.feesEarned || 0;
    const netReturn = impermanentLoss.impermanentLoss + feesEarned;
    const entryValue = position.token0.valueUSD + position.token1.valueUSD;
    const netReturnPercent = entryValue > 0
      ? (netReturn / entryValue) * 100
      : 0;

    // Calculate break-even price (where IL + fees = 0)
    const breakEvenPrice = this.calculateBreakEvenPrice(
      position,
      impermanentLoss,
      feesEarned
    );

    // Generate recommendations
    const recommendations: string[] = [];

    if (impermanentLoss.impermanentLossPercent < -5) {
      recommendations.push('Significant impermanent loss detected. Consider exiting position if price continues to diverge.');
    }

    if (feesEarned < Math.abs(impermanentLoss.impermanentLoss)) {
      recommendations.push('Fees earned do not cover impermanent loss. Monitor position closely.');
    }

    if (poolStats && poolStats.apr < 10) {
      recommendations.push('Low APR. Consider rebalancing to higher yield pools.');
    }

    if (netReturnPercent < -10) {
      recommendations.push('Negative net return. Review position strategy.');
    }

    return {
      position,
      impermanentLoss,
      feesEarned,
      netReturn,
      netReturnPercent: Math.round(netReturnPercent * 100) / 100,
      breakEvenPrice,
      recommendations,
    };
  }

  /**
   * Calculate break-even price
   */
  private calculateBreakEvenPrice(
    position: LiquidityPosition,
    impermanentLoss: ImpermanentLoss,
    feesEarned: number
  ): number {
    // Simplified calculation - would need more complex math in production
    const entryPriceRatio = position.token0.valueUSD / position.token1.valueUSD;
    const targetIL = -feesEarned; // IL that makes net return = 0
    
    // This is a simplified approximation
    return entryPriceRatio * (1 + targetIL / (position.token0.valueUSD + position.token1.valueUSD));
  }

  /**
   * Calculate optimal LP allocation
   */
  calculateOptimalAllocation(
    token0Price: number,
    token1Price: number,
    totalValue: number,
    targetRatio: number = 0.5 // 50/50 split
  ): {
    token0Amount: number;
    token1Amount: number;
    token0Value: number;
    token1Value: number;
  } {
    const token0Value = totalValue * targetRatio;
    const token1Value = totalValue * (1 - targetRatio);
    
    const token0Amount = token0Value / token0Price;
    const token1Amount = token1Value / token1Price;

    return {
      token0Amount,
      token1Amount,
      token0Value,
      token1Value,
    };
  }

  /**
   * Simulate impermanent loss scenarios
   */
  simulateImpermanentLoss(
    entryToken0Value: number,
    entryToken1Value: number,
    priceChanges: number[] // Array of price ratio changes (e.g., [0.5, 0.75, 1.0, 1.25, 2.0])
  ): Array<{
    priceRatio: number;
    impermanentLoss: number;
    impermanentLossPercent: number;
  }> {
    const entryTotalValue = entryToken0Value + entryToken1Value;
    const entryPriceRatio = entryToken0Value / entryToken1Value;

    return priceChanges.map(change => {
      const currentPriceRatio = entryPriceRatio * change;
      
      // Simplified IL calculation: IL = 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
      const sqrtRatio = Math.sqrt(change);
      const hodlMultiplier = 2 * sqrtRatio / (1 + change);
      const impermanentLossPercent = (hodlMultiplier - 1) * 100;
      const impermanentLoss = entryTotalValue * (hodlMultiplier - 1);

      return {
        priceRatio: change,
        impermanentLoss,
        impermanentLossPercent: Math.round(impermanentLossPercent * 100) / 100,
      };
    });
  }

  /**
   * Compare multiple pools
   */
  comparePools(
    positions: LiquidityPosition[],
    currentPrices: Map<string, { token0: number; token1: number }>
  ): Array<{
    position: LiquidityPosition;
    analysis: PoolAnalysis;
    rank: number;
  }> {
    const analyses = positions.map(position => {
      const prices = currentPrices.get(position.poolAddress);
      if (!prices) {
        return null;
      }

      const analysis = this.analyzePosition(
        position,
        prices.token0,
        prices.token1
      );

      return {
        position,
        analysis,
        rank: 0, // Will be set after sorting
      };
    }).filter((a): a is NonNullable<typeof a> => a !== null);

    // Sort by net return percent (best first)
    analyses.sort((a, b) => b.analysis.netReturnPercent - a.analysis.netReturnPercent);

    // Assign ranks
    analyses.forEach((analysis, index) => {
      analysis.rank = index + 1;
    });

    return analyses;
  }
}

// Singleton instance
export const liquidityPoolAnalyzer = new LiquidityPoolAnalyzer();

