/**
 * Liquidity Pool Position Analyzer Utility
 * Analyze LP positions and impermanent loss
 */

export interface LiquidityPosition {
  id: string;
  poolAddress: string;
  poolName: string;
  protocol: string;
  chainId: number;
  token0: string;
  token0Symbol: string;
  token1: string;
  token1Symbol: string;
  lpTokenBalance: string;
  token0Amount: string;
  token1Amount: string;
  token0ValueUSD: number;
  token1ValueUSD: number;
  totalValueUSD: number;
  addedAt: number;
  feesEarnedUSD: number;
}

export interface ImpermanentLossAnalysis {
  position: LiquidityPosition;
  currentValue: number; // USD
  hodlValue: number; // USD (if held tokens instead)
  impermanentLoss: number; // USD
  impermanentLossPercent: number; // Percentage
  priceRatio: number; // Current price ratio vs entry
  breakEvenPrice: number; // Price at which IL = 0
}

export interface PoolAnalysis {
  position: LiquidityPosition;
  poolStats: {
    totalLiquidity: number; // USD
    volume24h: number; // USD
    fees24h: number; // USD
    apy: number; // Percentage
    apr: number; // Percentage
  };
  positionShare: number; // Percentage of pool
  estimatedFees: number; // USD per day
  riskLevel: 'low' | 'medium' | 'high';
}

export class LiquidityPoolPositionAnalyzer {
  /**
   * Calculate impermanent loss
   */
  calculateImpermanentLoss(
    position: LiquidityPosition,
    currentToken0Price: number,
    currentToken1Price: number,
    entryToken0Price: number,
    entryToken1Price: number
  ): ImpermanentLossAnalysis {
    const currentValue = position.token0ValueUSD + position.token1ValueUSD;

    // Calculate hodl value (if tokens were held instead)
    const entryToken0Value = parseFloat(position.token0Amount) * entryToken0Price;
    const entryToken1Value = parseFloat(position.token1Amount) * entryToken1Price;
    const entryTotalValue = entryToken0Value + entryToken1Value;

    const hodlToken0Value = parseFloat(position.token0Amount) * currentToken0Price;
    const hodlToken1Value = parseFloat(position.token1Amount) * currentToken1Price;
    const hodlValue = hodlToken0Value + hodlToken1Value;

    const impermanentLoss = currentValue - hodlValue;
    const impermanentLossPercent = hodlValue > 0
      ? (impermanentLoss / hodlValue) * 100
      : 0;

    // Calculate price ratio
    const entryRatio = entryToken0Price / entryToken1Price;
    const currentRatio = currentToken0Price / currentToken1Price;
    const priceRatio = currentRatio / entryRatio;

    // Break-even price (when IL = 0, price ratio = 1)
    const breakEvenPrice = entryToken0Price; // Simplified

    return {
      position,
      currentValue: Math.round(currentValue * 100) / 100,
      hodlValue: Math.round(hodlValue * 100) / 100,
      impermanentLoss: Math.round(impermanentLoss * 100) / 100,
      impermanentLossPercent: Math.round(impermanentLossPercent * 100) / 100,
      priceRatio: Math.round(priceRatio * 1000) / 1000,
      breakEvenPrice: Math.round(breakEvenPrice * 100) / 100,
    };
  }

  /**
   * Analyze pool position
   */
  analyzePosition(
    position: LiquidityPosition,
    poolStats: {
      totalLiquidity: number;
      volume24h: number;
      fees24h: number;
      apy: number;
    }
  ): PoolAnalysis {
    // Calculate position share
    const positionShare = poolStats.totalLiquidity > 0
      ? (position.totalValueUSD / poolStats.totalLiquidity) * 100
      : 0;

    // Estimate daily fees
    const feeRate = poolStats.fees24h / poolStats.totalLiquidity;
    const estimatedFees = position.totalValueUSD * feeRate;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    // High volatility pairs = higher risk
    const isStablePair = position.token0Symbol.includes('USD') || 
                        position.token1Symbol.includes('USD') ||
                        position.token0Symbol === 'USDC' || 
                        position.token0Symbol === 'USDT' ||
                        position.token1Symbol === 'USDC' || 
                        position.token1Symbol === 'USDT';

    if (!isStablePair) {
      riskLevel = 'high';
    } else if (poolStats.apy > 50) {
      riskLevel = 'medium';
    }

    return {
      position,
      poolStats: {
        ...poolStats,
        apr: poolStats.apy, // Simplified
      },
      positionShare: Math.round(positionShare * 1000) / 1000,
      estimatedFees: Math.round(estimatedFees * 100) / 100,
      riskLevel,
    };
  }

  /**
   * Calculate optimal position size
   */
  calculateOptimalPosition(
    totalPortfolioValue: number,
    riskTolerance: 'conservative' | 'moderate' | 'aggressive',
    poolAPY: number,
    poolRisk: 'low' | 'medium' | 'high'
  ): {
    recommendedAllocation: number; // Percentage
    recommendedAmount: number; // USD
    reasoning: string;
  } {
    let recommendedAllocation = 0;
    let reasoning = '';

    if (riskTolerance === 'conservative') {
      if (poolRisk === 'low' && poolAPY > 5) {
        recommendedAllocation = 10;
        reasoning = 'Low-risk pool with decent APY suitable for conservative allocation';
      } else {
        recommendedAllocation = 5;
        reasoning = 'Conservative allocation recommended for this pool';
      }
    } else if (riskTolerance === 'moderate') {
      if (poolRisk === 'low') {
        recommendedAllocation = 20;
      } else if (poolRisk === 'medium') {
        recommendedAllocation = 15;
      } else {
        recommendedAllocation = 10;
      }
      reasoning = 'Moderate allocation based on pool risk profile';
    } else {
      if (poolRisk === 'low') {
        recommendedAllocation = 30;
      } else if (poolRisk === 'medium') {
        recommendedAllocation = 25;
      } else {
        recommendedAllocation = 20;
      }
      reasoning = 'Aggressive allocation for higher yield potential';
    }

    const recommendedAmount = (totalPortfolioValue * recommendedAllocation) / 100;

    return {
      recommendedAllocation,
      recommendedAmount: Math.round(recommendedAmount * 100) / 100,
      reasoning,
    };
  }

  /**
   * Compare positions
   */
  comparePositions(positions: LiquidityPosition[]): {
    bestPerformer: LiquidityPosition | null;
    worstPerformer: LiquidityPosition | null;
    averageAPY: number;
    totalValue: number;
  } {
    if (positions.length === 0) {
      return {
        bestPerformer: null,
        worstPerformer: null,
        averageAPY: 0,
        totalValue: 0,
      };
    }

    // Would need APY data for each position
    const totalValue = positions.reduce((sum, p) => sum + p.totalValueUSD, 0);

    return {
      bestPerformer: positions.reduce((best, current) =>
        current.totalValueUSD > best.totalValueUSD ? current : best
      ),
      worstPerformer: positions.reduce((worst, current) =>
        current.totalValueUSD < worst.totalValueUSD ? current : worst
      ),
      averageAPY: 0, // Would calculate from pool stats
      totalValue: Math.round(totalValue * 100) / 100,
    };
  }
}

// Singleton instance
export const liquidityPoolPositionAnalyzer = new LiquidityPoolPositionAnalyzer();

