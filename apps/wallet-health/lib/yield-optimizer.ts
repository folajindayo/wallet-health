/**
 * Yield Farming Optimizer
 * Calculates optimal yield strategies across DeFi protocols
 */

export interface YieldOpportunity {
  protocol: string;
  pool: string;
  token: string;
  strategy: 'single-stake' | 'lp-farming' | 'lending' | 'leverage-farming' | 'auto-compound';
  apr: number;
  apy: number; // APY with compounding
  tvl: number;
  dailyRewards: number;
  rewardTokens: string[];
  risks: string[];
  riskScore: number; // 0-100
  minDeposit: number;
  lockPeriod?: number; // days
  impermanentLossRisk?: number; // percentage
  fees: {
    deposit: number;
    withdrawal: number;
    performance: number;
  };
}

export interface OptimizedStrategy {
  allocations: {
    protocol: string;
    pool: string;
    amount: number;
    allocation: number; // percentage
    expectedReturn: number;
  }[];
  totalExpectedReturn: number;
  weightedAPY: number;
  weightedRisk: number;
  diversificationScore: number;
  projectedEarnings: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  comparisonToIndex: number; // vs simple hodl
}

export interface LeverageStrategy {
  protocol: string;
  collateral: string;
  borrowed: string;
  leverage: number; // e.g., 3x
  supplyAPY: number;
  borrowAPY: number;
  farmingAPY: number;
  netAPY: number;
  liquidationPrice: number;
  healthFactor: number;
  profitThreshold: number;
}

export class YieldOptimizer {
  private readonly compoundFrequency = 365; // Daily compounding

  /**
   * Convert APR to APY with compounding
   */
  calculateAPY(apr: number, compoundsPerYear: number = this.compoundFrequency): number {
    return (Math.pow(1 + apr / compoundsPerYear, compoundsPerYear) - 1) * 100;
  }

  /**
   * Calculate impermanent loss for LP positions
   */
  calculateImpermanentLoss(priceChange: number): number {
    // IL = 2 * √(priceRatio) / (1 + priceRatio) - 1
    const priceRatio = 1 + priceChange;
    const impermanentLoss = (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100;
    return Math.abs(impermanentLoss);
  }

  /**
   * Calculate IL-adjusted returns for LP farming
   */
  calculateLPReturns(
    farmingAPY: number,
    priceChangeToken1: number,
    priceChangeToken2: number,
    holdingPeriod: number // days
  ): {
    grossReturn: number;
    impermanentLoss: number;
    netReturn: number;
    breakEvenDays: number;
  } {
    const avgPriceChange = (priceChangeToken1 + priceChangeToken2) / 2;
    const impermanentLoss = this.calculateImpermanentLoss(avgPriceChange);
    
    const dailyAPY = farmingAPY / 365;
    const grossReturn = dailyAPY * holdingPeriod;
    const netReturn = grossReturn - impermanentLoss;
    
    // Calculate break-even point
    const breakEvenDays = impermanentLoss / dailyAPY;

    return {
      grossReturn,
      impermanentLoss,
      netReturn,
      breakEvenDays,
    };
  }

  /**
   * Optimize yield allocation across multiple opportunities
   */
  optimizeYieldAllocation(
    opportunities: YieldOpportunity[],
    totalCapital: number,
    riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate',
    constraints: {
      maxSingleAllocation?: number; // percentage
      minDiversification?: number; // minimum number of protocols
      maxRiskScore?: number;
    } = {}
  ): OptimizedStrategy {
    const {
      maxSingleAllocation = 0.40, // 40% max per protocol
      minDiversification = 3,
      maxRiskScore = this.getRiskToleranceScore(riskTolerance),
    } = constraints;

    // Filter by risk tolerance
    const filteredOpps = opportunities.filter(opp => opp.riskScore <= maxRiskScore);

    if (filteredOpps.length < minDiversification) {
      throw new Error(`Not enough opportunities meeting risk criteria. Found ${filteredOpps.length}, need ${minDiversification}`);
    }

    // Calculate utility scores for each opportunity
    const scoredOpps = filteredOpps.map(opp => ({
      ...opp,
      utilityScore: this.calculateUtilityScore(opp, riskTolerance),
    }));

    // Sort by utility score
    scoredOpps.sort((a, b) => b.utilityScore - a.utilityScore);

    // Allocate capital using modified Kelly Criterion approach
    const allocations = this.allocateCapitalKellyCriterion(
      scoredOpps,
      totalCapital,
      maxSingleAllocation,
      minDiversification
    );

    // Calculate weighted metrics
    const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
    const weightedAPY = allocations.reduce((sum, a) => {
      const opp = scoredOpps.find(o => o.protocol === a.protocol && o.pool === a.pool)!;
      return sum + (opp.apy * (a.amount / totalAllocated));
    }, 0);

    const weightedRisk = allocations.reduce((sum, a) => {
      const opp = scoredOpps.find(o => o.protocol === a.protocol && o.pool === a.pool)!;
      return sum + (opp.riskScore * (a.amount / totalAllocated));
    }, 0);

    // Calculate diversification score (Shannon entropy)
    const diversificationScore = this.calculateDiversification(allocations, totalAllocated);

    // Calculate projected earnings
    const yearlyEarnings = totalAllocated * (weightedAPY / 100);
    const projectedEarnings = {
      daily: yearlyEarnings / 365,
      weekly: yearlyEarnings / 52,
      monthly: yearlyEarnings / 12,
      yearly: yearlyEarnings,
    };

    // Compare to simple hodl (assume 0% return)
    const comparisonToIndex = weightedAPY;

    return {
      allocations,
      totalExpectedReturn: yearlyEarnings,
      weightedAPY,
      weightedRisk,
      diversificationScore,
      projectedEarnings,
      comparisonToIndex,
    };
  }

  /**
   * Calculate leverage farming strategy
   */
  calculateLeverageStrategy(
    supplyAPY: number,
    borrowAPY: number,
    farmingAPY: number,
    leverage: number,
    collateralAmount: number,
    ltv: number = 0.75 // Loan-to-Value ratio
  ): LeverageStrategy {
    // Effective position = collateral * leverage
    const totalPosition = collateralAmount * leverage;
    const borrowedAmount = totalPosition - collateralAmount;

    // Net APY = (Supply APY * collateral) + (Farming APY * position) - (Borrow APY * borrowed)
    const supplyEarnings = supplyAPY * collateralAmount;
    const farmingEarnings = farmingAPY * totalPosition;
    const borrowCosts = borrowAPY * borrowedAmount;
    
    const netEarnings = supplyEarnings + farmingEarnings - borrowCosts;
    const netAPY = (netEarnings / collateralAmount) * 100;

    // Calculate liquidation price (simplified)
    const liquidationPrice = 1 - (ltv / leverage);
    
    // Health factor = (Collateral Value * LTV) / Borrowed Value
    const healthFactor = (collateralAmount * ltv) / borrowedAmount;

    // Profit threshold (when does this beat simple farming?)
    const simpleFarmingReturn = farmingAPY * collateralAmount;
    const profitThreshold = (netEarnings / simpleFarmingReturn - 1) * 100;

    return {
      protocol: 'Leverage Farming',
      collateral: 'ETH',
      borrowed: 'USDC',
      leverage,
      supplyAPY,
      borrowAPY,
      farmingAPY,
      netAPY,
      liquidationPrice: liquidationPrice * 100,
      healthFactor,
      profitThreshold,
    };
  }

  /**
   * Calculate optimal leverage for maximum returns
   */
  calculateOptimalLeverage(
    supplyAPY: number,
    borrowAPY: number,
    farmingAPY: number,
    maxLeverage: number = 3
  ): { leverage: number; netAPY: number } {
    let optimalLeverage = 1;
    let maxNetAPY = farmingAPY;

    // Test different leverage levels
    for (let lev = 1; lev <= maxLeverage * 10; lev += 0.5) {
      const strategy = this.calculateLeverageStrategy(
        supplyAPY,
        borrowAPY,
        farmingAPY,
        lev,
        10000 // test with $10k
      );

      if (strategy.netAPY > maxNetAPY && strategy.healthFactor > 1.5) {
        maxNetAPY = strategy.netAPY;
        optimalLeverage = lev;
      }
    }

    return { leverage: optimalLeverage, netAPY: maxNetAPY };
  }

  /**
   * Auto-compound calculator
   */
  calculateAutoCompoundBenefit(
    principal: number,
    apr: number,
    days: number,
    compoundFrequency: 'daily' | 'weekly' | 'monthly' | 'manual'
  ): {
    finalAmount: number;
    totalEarnings: number;
    compoundBonus: number; // vs no compounding
  } {
    const frequencies = {
      daily: 365,
      weekly: 52,
      monthly: 12,
      manual: 1,
    };

    const n = frequencies[compoundFrequency];
    const t = days / 365;
    const r = apr / 100;

    // A = P(1 + r/n)^(nt)
    const finalAmount = principal * Math.pow(1 + r / n, n * t);
    const totalEarnings = finalAmount - principal;

    // Calculate simple interest for comparison
    const simpleInterest = principal * r * t;
    const compoundBonus = ((totalEarnings - simpleInterest) / simpleInterest) * 100;

    return {
      finalAmount,
      totalEarnings,
      compoundBonus,
    };
  }

  /**
   * Calculate gas efficiency for different strategies
   */
  calculateGasEfficiency(
    strategy: YieldOpportunity,
    depositAmount: number,
    gasPrice: number,
    ethPrice: number,
    holdingPeriod: number // days
  ): {
    totalGasCost: number;
    gasCostPercentage: number;
    breakEvenDays: number;
    isEfficient: boolean;
  } {
    // Estimate gas costs
    const depositGas = 200000; // gas units
    const withdrawGas = 150000;
    const claimGas = 100000; // per claim
    
    const claimsPerPeriod = holdingPeriod; // Daily claims
    
    const totalGasUnits = depositGas + withdrawGas + (claimGas * claimsPerPeriod);
    const totalGasCost = (totalGasUnits * gasPrice * ethPrice) / 1e9; // Convert from Gwei

    const gasCostPercentage = (totalGasCost / depositAmount) * 100;
    
    // Calculate earnings to cover gas
    const dailyEarnings = (depositAmount * strategy.apy / 100) / 365;
    const breakEvenDays = totalGasCost / dailyEarnings;

    const isEfficient = gasCostPercentage < 2 && breakEvenDays < holdingPeriod / 4;

    return {
      totalGasCost,
      gasCostPercentage,
      breakEvenDays,
      isEfficient,
    };
  }

  /**
   * Risk-adjusted return calculation (Sortino Ratio)
   */
  calculateRiskAdjustedReturn(
    returns: number[],
    targetReturn: number = 0,
    riskFreeRate: number = 0.04
  ): number {
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    
    // Calculate downside deviation
    const downsideReturns = returns.filter(r => r < targetReturn);
    const downsideVariance = downsideReturns.reduce((sum, r) => {
      return sum + Math.pow(r - targetReturn, 2);
    }, 0) / returns.length;
    
    const downsideDeviation = Math.sqrt(downsideVariance);

    if (downsideDeviation === 0) return Infinity;

    // Sortino Ratio = (Return - Risk Free Rate) / Downside Deviation
    return (avgReturn - riskFreeRate) / downsideDeviation;
  }

  /**
   * Private helper methods
   */

  private getRiskToleranceScore(tolerance: 'conservative' | 'moderate' | 'aggressive'): number {
    const scores = {
      conservative: 30,
      moderate: 60,
      aggressive: 90,
    };
    return scores[tolerance];
  }

  private calculateUtilityScore(
    opp: YieldOpportunity,
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  ): number {
    // Utility = Return - (Risk Aversion * Risk^2)
    const riskAversion = {
      conservative: 0.8,
      moderate: 0.5,
      aggressive: 0.2,
    }[riskTolerance];

    const normalizedRisk = opp.riskScore / 100;
    const normalizedReturn = opp.apy / 100;

    return normalizedReturn - (riskAversion * Math.pow(normalizedRisk, 2));
  }

  private allocateCapitalKellyCriterion(
    opportunities: (YieldOpportunity & { utilityScore: number })[],
    totalCapital: number,
    maxSingleAllocation: number,
    minProtocols: number
  ): {
    protocol: string;
    pool: string;
    amount: number;
    allocation: number;
    expectedReturn: number;
  }[] {
    const allocations = [];
    let remainingCapital = totalCapital;

    // Take top opportunities up to minProtocols
    const topOpps = opportunities.slice(0, Math.max(minProtocols, 5));

    // Calculate total utility for normalization
    const totalUtility = topOpps.reduce((sum, opp) => sum + Math.max(0, opp.utilityScore), 0);

    for (const opp of topOpps) {
      if (remainingCapital <= 0) break;

      // Kelly-inspired allocation: f* = (utility / totalUtility)
      const optimalFraction = Math.max(0, opp.utilityScore) / totalUtility;
      
      // Apply maximum allocation constraint
      const constrainedFraction = Math.min(optimalFraction, maxSingleAllocation);
      
      const amount = Math.min(totalCapital * constrainedFraction, remainingCapital);
      const expectedReturn = amount * (opp.apy / 100);

      if (amount > 0) {
        allocations.push({
          protocol: opp.protocol,
          pool: opp.pool,
          amount,
          allocation: (amount / totalCapital) * 100,
          expectedReturn,
        });

        remainingCapital -= amount;
      }
    }

    return allocations;
  }

  private calculateDiversification(
    allocations: { amount: number }[],
    totalAmount: number
  ): number {
    // Shannon Entropy for diversification
    // Higher entropy = better diversification
    let entropy = 0;

    for (const alloc of allocations) {
      const p = alloc.amount / totalAmount;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }

    // Normalize to 0-100 scale
    const maxEntropy = Math.log2(allocations.length);
    return (entropy / maxEntropy) * 100;
  }
}

/**
 * Yield Farming Strategy Backtester
 */
export class YieldBacktester {
  /**
   * Backtest a yield strategy with historical data
   */
  backtestStrategy(
    historicalAPYs: number[],
    initialCapital: number,
    compoundFrequency: number = 365
  ): {
    finalAmount: number;
    totalReturn: number;
    annualizedReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    volatility: number;
  } {
    let capital = initialCapital;
    const returns: number[] = [];
    let peak = initialCapital;
    let maxDrawdown = 0;

    for (const apy of historicalAPYs) {
      const dailyReturn = apy / 100 / 365;
      const dayReturn = capital * dailyReturn;
      capital += dayReturn;
      returns.push(dailyReturn / capital);

      // Track drawdown
      if (capital > peak) {
        peak = capital;
      } else {
        const drawdown = ((peak - capital) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }

    const finalAmount = capital;
    const totalReturn = ((finalAmount - initialCapital) / initialCapital) * 100;
    const years = historicalAPYs.length / 365;
    const annualizedReturn = (Math.pow(finalAmount / initialCapital, 1 / years) - 1) * 100;

    // Calculate volatility (standard deviation of returns)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized

    // Sharpe Ratio (simplified)
    const riskFreeRate = 0.04;
    const excessReturn = annualizedReturn - riskFreeRate * 100;
    const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;

    return {
      finalAmount,
      totalReturn,
      annualizedReturn,
      maxDrawdown,
      sharpeRatio,
      volatility,
    };
  }
}

