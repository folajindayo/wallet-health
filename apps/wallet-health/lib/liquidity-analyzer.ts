/**
 * Liquidity Pool Analyzer
 * Advanced algorithms for LP position analysis, impermanent loss, and optimal liquidity provision
 */

export interface LiquidityPool {
  protocol: string;
  poolAddress: string;
  token0: string;
  token1: string;
  reserve0: number;
  reserve1: number;
  totalLiquidity: number;
  fee: number; // e.g., 0.003 for 0.3%
  volume24h: number;
  volumeWeek: number;
}

export interface LPPosition {
  pool: LiquidityPool;
  liquidity: number; // LP tokens held
  token0Amount: number;
  token1Amount: number;
  entryPrice0: number;
  entryPrice1: number;
  currentPrice0: number;
  currentPrice1: number;
  entryTimestamp: number;
}

export interface LPAnalysis {
  currentValue: number;
  initialValue: number;
  impermanentLoss: {
    absolute: number;
    percentage: number;
  };
  feesEarned: {
    total: number;
    daily: number;
    apy: number;
  };
  netProfitLoss: {
    absolute: number;
    percentage: number;
    vsHodl: number;
  };
  priceRatio: {
    initial: number;
    current: number;
    change: number;
  };
  recommendation: 'hold' | 'remove' | 'add-more' | 'rebalance';
  projectedReturns: {
    days30: number;
    days60: number;
    days90: number;
  };
}

export interface OptimalLiquidityRange {
  lowerPrice: number;
  upperPrice: number;
  concentration: number; // 0-1, higher = more concentrated
  estimatedAPR: number;
  capitalEfficiency: number;
  outOfRangeRisk: number; // percentage
}

export class LiquidityAnalyzer {
  /**
   * Calculate exact impermanent loss using the standard formula
   * IL = 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
   */
  calculateImpermanentLoss(
    initialPrice: number,
    currentPrice: number,
    initialValue: number
  ): { absolute: number; percentage: number } {
    const priceRatio = currentPrice / initialPrice;
    
    // IL formula
    const ilMultiplier = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio);
    const currentValueWithIL = initialValue * ilMultiplier;
    
    const absolute = currentValueWithIL - initialValue;
    const percentage = (absolute / initialValue) * 100;

    return { absolute, percentage };
  }

  /**
   * Analyze LP position with comprehensive metrics
   */
  analyzeLPPosition(position: LPPosition): LPAnalysis {
    const daysHeld = (Date.now() - position.entryTimestamp) / (24 * 60 * 60 * 1000);
    
    // Calculate current position value
    const currentValue = 
      position.token0Amount * position.currentPrice0 +
      position.token1Amount * position.currentPrice1;

    // Calculate initial value at entry
    const initialValue =
      position.token0Amount * position.entryPrice0 +
      position.token1Amount * position.entryPrice1;

    // Calculate IL
    const avgEntryPrice = position.entryPrice1 / position.entryPrice0;
    const avgCurrentPrice = position.currentPrice1 / position.currentPrice0;
    const impermanentLoss = this.calculateImpermanentLoss(
      avgEntryPrice,
      avgCurrentPrice,
      initialValue
    );

    // Estimate fees earned based on volume and pool share
    const poolShare = position.liquidity / position.pool.totalLiquidity;
    const feesEarned = this.estimateFeesEarned(
      position.pool,
      poolShare,
      daysHeld
    );

    // Calculate net P&L
    const netAbsolute = (currentValue - initialValue) + impermanentLoss.absolute + feesEarned.total;
    const netPercentage = (netAbsolute / initialValue) * 100;

    // Calculate vs HODL
    const hodlValue = 
      position.token0Amount * position.currentPrice0 +
      position.token1Amount * position.currentPrice1;
    const vsHodl = ((currentValue + feesEarned.total - hodlValue) / hodlValue) * 100;

    // Price ratio analysis
    const priceRatio = {
      initial: avgEntryPrice,
      current: avgCurrentPrice,
      change: ((avgCurrentPrice - avgEntryPrice) / avgEntryPrice) * 100,
    };

    // Generate recommendation
    const recommendation = this.generateLPRecommendation(
      impermanentLoss.percentage,
      feesEarned.apy,
      netPercentage,
      daysHeld
    );

    // Project future returns
    const projectedReturns = this.projectLPReturns(
      currentValue,
      feesEarned.apy,
      impermanentLoss.percentage,
      daysHeld
    );

    return {
      currentValue,
      initialValue,
      impermanentLoss,
      feesEarned,
      netProfitLoss: {
        absolute: netAbsolute,
        percentage: netPercentage,
        vsHodl,
      },
      priceRatio,
      recommendation,
      projectedReturns,
    };
  }

  /**
   * Calculate optimal price range for concentrated liquidity (Uniswap V3)
   */
  calculateOptimalRange(
    currentPrice: number,
    historicalPrices: number[],
    riskTolerance: 'conservative' | 'moderate' | 'aggressive',
    targetAPR: number = 0.20
  ): OptimalLiquidityRange {
    // Calculate price volatility
    const volatility = this.calculatePriceVolatility(historicalPrices);
    
    // Determine range multipliers based on risk tolerance
    const rangeMultipliers = {
      conservative: { lower: 0.5, upper: 2.0 },   // Wide range
      moderate: { lower: 0.7, upper: 1.5 },       // Medium range
      aggressive: { lower: 0.85, upper: 1.18 },   // Narrow range
    };

    const multipliers = rangeMultipliers[riskTolerance];
    
    // Adjust for volatility
    const volatilityAdjustment = 1 + (volatility * 0.5);
    const lowerPrice = currentPrice * multipliers.lower / volatilityAdjustment;
    const upperPrice = currentPrice * multipliers.upper * volatilityAdjustment;

    // Calculate concentration (inverse of range width)
    const rangeWidth = (upperPrice - lowerPrice) / currentPrice;
    const concentration = 1 / (1 + rangeWidth);

    // Estimate APR based on concentration
    // More concentrated = higher fees when in range but higher risk
    const baseAPR = 0.15; // 15% base
    const concentrationBonus = concentration * 0.50; // Up to 50% bonus
    const estimatedAPR = (baseAPR + concentrationBonus) * (1 + volatility);

    // Capital efficiency = how much more efficient vs full range
    const fullRangeEfficiency = 1;
    const capitalEfficiency = 1 / rangeWidth * 2;

    // Out of range risk based on historical price movement
    const outOfRangeRisk = this.calculateOutOfRangeRisk(
      currentPrice,
      lowerPrice,
      upperPrice,
      historicalPrices
    );

    return {
      lowerPrice,
      upperPrice,
      concentration,
      estimatedAPR,
      capitalEfficiency,
      outOfRangeRisk,
    };
  }

  /**
   * Calculate optimal token ratio for providing liquidity
   */
  calculateOptimalTokenRatio(
    token0Price: number,
    token1Price: number,
    targetValue: number
  ): { token0Amount: number; token1Amount: number; ratio: number } {
    // For constant product AMMs: x * y = k
    // Optimal ratio is equal value of both tokens
    const valuePerToken = targetValue / 2;
    
    const token0Amount = valuePerToken / token0Price;
    const token1Amount = valuePerToken / token1Price;
    const ratio = token0Amount / token1Amount;

    return { token0Amount, token1Amount, ratio };
  }

  /**
   * Calculate single-sided liquidity provision impact
   */
  calculateSingleSidedImpact(
    pool: LiquidityPool,
    tokenAddress: string,
    amount: number,
    currentPrice: number
  ): {
    priceImpact: number;
    slippage: number;
    effectivePrice: number;
    minReceived: number;
  } {
    const isToken0 = tokenAddress === pool.token0;
    const reserve = isToken0 ? pool.reserve0 : pool.reserve1;
    const oppositeReserve = isToken0 ? pool.reserve1 : pool.reserve0;

    // Constant product formula: x * y = k
    const k = reserve * oppositeReserve;
    
    // New reserve after adding liquidity
    const newReserve = reserve + amount;
    const newOppositeReserve = k / newReserve;
    
    // Price impact
    const oldPrice = oppositeReserve / reserve;
    const newPrice = newOppositeReserve / newReserve;
    const priceImpact = Math.abs((newPrice - oldPrice) / oldPrice) * 100;

    // Slippage (similar to price impact for single-sided)
    const slippage = priceImpact;

    // Effective price received
    const effectivePrice = newPrice;

    // Minimum tokens received with 0.5% slippage tolerance
    const minReceived = amount * (1 - 0.005) * effectivePrice;

    return {
      priceImpact,
      slippage,
      effectivePrice,
      minReceived,
    };
  }

  /**
   * Calculate optimal rebalancing timing for LP positions
   */
  calculateRebalanceTiming(
    position: LPPosition,
    targetRatio: number,
    rebalanceCost: number
  ): {
    shouldRebalance: boolean;
    currentDeviation: number;
    costBenefitRatio: number;
    estimatedGain: number;
    recommendation: string;
  } {
    // Current ratio
    const currentRatio = position.token0Amount / position.token1Amount;
    const currentDeviation = Math.abs((currentRatio - targetRatio) / targetRatio) * 100;

    // Estimate IL reduction from rebalancing
    const ilReduction = this.estimateILReduction(
      position,
      currentRatio,
      targetRatio
    );

    // Cost-benefit analysis
    const estimatedGain = ilReduction - rebalanceCost;
    const costBenefitRatio = ilReduction / rebalanceCost;

    // Decision logic
    const shouldRebalance = 
      currentDeviation > 20 && // More than 20% deviation
      costBenefitRatio > 2 &&  // At least 2x benefit vs cost
      estimatedGain > 0;       // Net positive gain

    let recommendation = '';
    if (shouldRebalance) {
      recommendation = `Rebalance now to reduce IL by $${ilReduction.toFixed(2)}`;
    } else if (currentDeviation > 15) {
      recommendation = `Monitor closely. Rebalance if deviation exceeds 25%`;
    } else {
      recommendation = `No rebalancing needed. Position is well-balanced`;
    }

    return {
      shouldRebalance,
      currentDeviation,
      costBenefitRatio,
      estimatedGain,
      recommendation,
    };
  }

  /**
   * Calculate LP position health score
   */
  calculatePositionHealth(position: LPPosition, analysis: LPAnalysis): {
    score: number; // 0-100
    factors: {
      ilImpact: number;
      feeGeneration: number;
      profitability: number;
      timeHeld: number;
    };
    rating: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    let score = 100;
    
    // IL impact (0-30 points)
    const ilFactor = Math.max(0, 30 - Math.abs(analysis.impermanentLoss.percentage));
    
    // Fee generation (0-30 points)
    const feeFactor = Math.min(30, analysis.feesEarned.apy * 0.3);
    
    // Profitability (0-30 points)
    const profitFactor = analysis.netProfitLoss.percentage > 0 
      ? Math.min(30, analysis.netProfitLoss.percentage * 0.3)
      : Math.max(-30, analysis.netProfitLoss.percentage * 0.3);
    
    // Time held (0-10 points) - reward long-term positions
    const daysHeld = (Date.now() - position.entryTimestamp) / (24 * 60 * 60 * 1000);
    const timeFactor = Math.min(10, daysHeld / 30 * 10);

    score = ilFactor + feeFactor + profitFactor + timeFactor;

    let rating: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 80) rating = 'excellent';
    else if (score >= 60) rating = 'good';
    else if (score >= 40) rating = 'fair';
    else rating = 'poor';

    return {
      score: Math.max(0, Math.min(100, score)),
      factors: {
        ilImpact: ilFactor,
        feeGeneration: feeFactor,
        profitability: profitFactor,
        timeHeld: timeFactor,
      },
      rating,
    };
  }

  /**
   * Calculate just-in-time (JIT) liquidity optimal timing
   */
  calculateJITTiming(
    pool: LiquidityPool,
    expectedTrade: {
      size: number;
      direction: 'buy' | 'sell';
    },
    blockTime: number = 12 // seconds
  ): {
    optimalBlocksBefore: number;
    estimatedFees: number;
    riskScore: number;
    profitProbability: number;
  } {
    // Calculate expected fee from trade
    const estimatedFees = expectedTrade.size * pool.fee;

    // JIT liquidity should be added 1-2 blocks before
    const optimalBlocksBefore = 2;

    // Risk factors
    let riskScore = 50;
    
    // Higher risk if trade is very large relative to pool
    const tradeSizeRatio = expectedTrade.size / pool.totalLiquidity;
    if (tradeSizeRatio > 0.1) riskScore += 20;
    if (tradeSizeRatio > 0.05) riskScore += 10;

    // Risk if pool is highly volatile
    const volatilityRisk = (pool.volume24h / pool.totalLiquidity) * 10;
    riskScore += volatilityRisk;

    // Calculate profit probability
    const profitProbability = Math.max(0, 100 - riskScore);

    return {
      optimalBlocksBefore,
      estimatedFees,
      riskScore: Math.min(100, riskScore),
      profitProbability,
    };
  }

  /**
   * Private helper methods
   */

  private estimateFeesEarned(
    pool: LiquidityPool,
    poolShare: number,
    daysHeld: number
  ): { total: number; daily: number; apy: number } {
    // Estimate fees from volume and pool share
    const dailyVolume = pool.volume24h;
    const dailyFees = dailyVolume * pool.fee;
    const dailyFeesEarned = dailyFees * poolShare;
    const totalFeesEarned = dailyFeesEarned * daysHeld;

    // Calculate APY
    const initialValue = pool.totalLiquidity * poolShare;
    const annualFees = dailyFeesEarned * 365;
    const apy = (annualFees / initialValue) * 100;

    return {
      total: totalFeesEarned,
      daily: dailyFeesEarned,
      apy,
    };
  }

  private generateLPRecommendation(
    ilPercentage: number,
    feeAPY: number,
    netPercentage: number,
    daysHeld: number
  ): 'hold' | 'remove' | 'add-more' | 'rebalance' {
    // Remove if IL is severe and not offset by fees
    if (ilPercentage < -20 && feeAPY < 10) {
      return 'remove';
    }

    // Add more if performing well
    if (netPercentage > 10 && feeAPY > 20) {
      return 'add-more';
    }

    // Rebalance if held too long with drift
    if (daysHeld > 60 && Math.abs(ilPercentage) > 15) {
      return 'rebalance';
    }

    return 'hold';
  }

  private projectLPReturns(
    currentValue: number,
    feeAPY: number,
    ilPercentage: number,
    daysHeld: number
  ): { days30: number; days60: number; days90: number } {
    const dailyFeeRate = feeAPY / 365 / 100;
    
    // Assume IL continues at same rate
    const dailyILRate = ilPercentage / daysHeld / 100;

    const project = (days: number) => {
      const feeGain = currentValue * dailyFeeRate * days;
      const ilLoss = currentValue * dailyILRate * days;
      return feeGain + ilLoss;
    };

    return {
      days30: project(30),
      days60: project(60),
      days90: project(90),
    };
  }

  private calculatePriceVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private calculateOutOfRangeRisk(
    currentPrice: number,
    lowerPrice: number,
    upperPrice: number,
    historicalPrices: number[]
  ): number {
    // Calculate percentage of time price was outside similar range historically
    let outOfRangeCount = 0;
    
    for (const price of historicalPrices) {
      if (price < lowerPrice || price > upperPrice) {
        outOfRangeCount++;
      }
    }

    return (outOfRangeCount / historicalPrices.length) * 100;
  }

  private estimateILReduction(
    position: LPPosition,
    currentRatio: number,
    targetRatio: number
  ): number {
    // Simplified IL reduction estimate
    const currentDeviation = Math.abs(currentRatio - targetRatio);
    const ilReductionRate = 0.1; // 10% of deviation can be recovered
    
    const potentialReduction = currentDeviation * position.liquidity * ilReductionRate;
    return potentialReduction;
  }
}

