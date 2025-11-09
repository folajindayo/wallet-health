/**
 * Portfolio Optimization Engine
 * Implements Modern Portfolio Theory (MPT) and various optimization strategies
 */

export interface Asset {
  symbol: string;
  currentAllocation: number; // percentage
  currentValue: number;
  expectedReturn: number; // annual percentage
  volatility: number; // standard deviation
  correlations: Record<string, number>; // correlation with other assets
}

export interface OptimizationResult {
  targetAllocation: Record<string, number>;
  expectedReturn: number;
  expectedVolatility: number;
  sharpeRatio: number;
  changes: {
    symbol: string;
    currentAllocation: number;
    targetAllocation: number;
    action: 'buy' | 'sell' | 'hold';
    amount: number;
  }[];
  improvementMetrics: {
    returnImprovement: number;
    riskReduction: number;
    sharpeImprovement: number;
  };
}

export interface OptimizationConstraints {
  minAllocation?: number; // minimum allocation per asset (e.g., 0.05 = 5%)
  maxAllocation?: number; // maximum allocation per asset (e.g., 0.30 = 30%)
  targetReturn?: number; // target annual return
  maxRisk?: number; // maximum portfolio volatility
  rebalanceThreshold?: number; // minimum difference to trigger rebalance (e.g., 0.05 = 5%)
}

export class PortfolioOptimizer {
  private riskFreeRate: number = 0.04; // 4% risk-free rate (e.g., T-bills)

  /**
   * Calculate portfolio expected return
   */
  calculatePortfolioReturn(assets: Asset[], allocations: Record<string, number>): number {
    return assets.reduce((sum, asset) => {
      const allocation = allocations[asset.symbol] || 0;
      return sum + (asset.expectedReturn * allocation);
    }, 0);
  }

  /**
   * Calculate portfolio volatility (standard deviation)
   * Uses correlation matrix for accurate risk calculation
   */
  calculatePortfolioVolatility(assets: Asset[], allocations: Record<string, number>): number {
    let variance = 0;

    // Calculate variance = Σ Σ wi * wj * σi * σj * ρij
    for (const asset1 of assets) {
      const w1 = allocations[asset1.symbol] || 0;
      
      for (const asset2 of assets) {
        const w2 = allocations[asset2.symbol] || 0;
        const correlation = asset1.symbol === asset2.symbol 
          ? 1 
          : (asset1.correlations[asset2.symbol] || 0);
        
        variance += w1 * w2 * asset1.volatility * asset2.volatility * correlation;
      }
    }

    return Math.sqrt(variance);
  }

  /**
   * Calculate Sharpe Ratio
   * (Return - RiskFreeRate) / Volatility
   */
  calculateSharpeRatio(expectedReturn: number, volatility: number): number {
    if (volatility === 0) return 0;
    return (expectedReturn - this.riskFreeRate) / volatility;
  }

  /**
   * Maximum Sharpe Ratio Optimization
   * Finds allocation that maximizes risk-adjusted returns
   */
  optimizeMaxSharpe(assets: Asset[], constraints: OptimizationConstraints = {}): OptimizationResult {
    const { 
      minAllocation = 0, 
      maxAllocation = 1, 
      rebalanceThreshold = 0.05 
    } = constraints;

    let bestAllocation: Record<string, number> = {};
    let bestSharpe = -Infinity;
    let bestReturn = 0;
    let bestVolatility = 0;

    // Grid search optimization (simplified Monte Carlo)
    const iterations = 10000;
    
    for (let i = 0; i < iterations; i++) {
      const allocation = this.generateRandomAllocation(assets, minAllocation, maxAllocation);
      
      const portfolioReturn = this.calculatePortfolioReturn(assets, allocation);
      const portfolioVolatility = this.calculatePortfolioVolatility(assets, allocation);
      const sharpe = this.calculateSharpeRatio(portfolioReturn, portfolioVolatility);

      if (sharpe > bestSharpe) {
        bestSharpe = sharpe;
        bestAllocation = allocation;
        bestReturn = portfolioReturn;
        bestVolatility = portfolioVolatility;
      }
    }

    return this.buildOptimizationResult(
      assets,
      bestAllocation,
      bestReturn,
      bestVolatility,
      bestSharpe,
      rebalanceThreshold
    );
  }

  /**
   * Minimum Volatility Optimization
   * Finds allocation that minimizes portfolio risk
   */
  optimizeMinVolatility(assets: Asset[], constraints: OptimizationConstraints = {}): OptimizationResult {
    const { 
      minAllocation = 0, 
      maxAllocation = 1, 
      targetReturn,
      rebalanceThreshold = 0.05 
    } = constraints;

    let bestAllocation: Record<string, number> = {};
    let bestVolatility = Infinity;
    let bestReturn = 0;
    let bestSharpe = 0;

    const iterations = 10000;
    
    for (let i = 0; i < iterations; i++) {
      const allocation = this.generateRandomAllocation(assets, minAllocation, maxAllocation);
      
      const portfolioReturn = this.calculatePortfolioReturn(assets, allocation);
      const portfolioVolatility = this.calculatePortfolioVolatility(assets, allocation);

      // Check if meets target return constraint
      if (targetReturn && portfolioReturn < targetReturn) continue;

      if (portfolioVolatility < bestVolatility) {
        bestVolatility = portfolioVolatility;
        bestAllocation = allocation;
        bestReturn = portfolioReturn;
        bestSharpe = this.calculateSharpeRatio(portfolioReturn, portfolioVolatility);
      }
    }

    return this.buildOptimizationResult(
      assets,
      bestAllocation,
      bestReturn,
      bestVolatility,
      bestSharpe,
      rebalanceThreshold
    );
  }

  /**
   * Risk Parity Optimization
   * Allocates based on equal risk contribution from each asset
   */
  optimizeRiskParity(assets: Asset[], constraints: OptimizationConstraints = {}): OptimizationResult {
    const { rebalanceThreshold = 0.05 } = constraints;
    
    // Risk parity: allocate inversely proportional to volatility
    const totalInverseVol = assets.reduce((sum, asset) => sum + (1 / asset.volatility), 0);
    
    const allocation: Record<string, number> = {};
    assets.forEach(asset => {
      allocation[asset.symbol] = (1 / asset.volatility) / totalInverseVol;
    });

    const portfolioReturn = this.calculatePortfolioReturn(assets, allocation);
    const portfolioVolatility = this.calculatePortfolioVolatility(assets, allocation);
    const sharpe = this.calculateSharpeRatio(portfolioReturn, portfolioVolatility);

    return this.buildOptimizationResult(
      assets,
      allocation,
      portfolioReturn,
      portfolioVolatility,
      sharpe,
      rebalanceThreshold
    );
  }

  /**
   * Maximum Return for Given Risk
   * Finds allocation that maximizes return for a specified risk level
   */
  optimizeMaxReturnForRisk(
    assets: Asset[], 
    targetRisk: number,
    constraints: OptimizationConstraints = {}
  ): OptimizationResult {
    const { 
      minAllocation = 0, 
      maxAllocation = 1,
      rebalanceThreshold = 0.05 
    } = constraints;

    let bestAllocation: Record<string, number> = {};
    let bestReturn = -Infinity;
    let bestVolatility = 0;
    let bestSharpe = 0;

    const iterations = 10000;
    const tolerance = targetRisk * 0.1; // 10% tolerance
    
    for (let i = 0; i < iterations; i++) {
      const allocation = this.generateRandomAllocation(assets, minAllocation, maxAllocation);
      
      const portfolioReturn = this.calculatePortfolioReturn(assets, allocation);
      const portfolioVolatility = this.calculatePortfolioVolatility(assets, allocation);

      // Check if volatility is within tolerance of target
      if (Math.abs(portfolioVolatility - targetRisk) > tolerance) continue;

      if (portfolioReturn > bestReturn) {
        bestReturn = portfolioReturn;
        bestAllocation = allocation;
        bestVolatility = portfolioVolatility;
        bestSharpe = this.calculateSharpeRatio(portfolioReturn, portfolioVolatility);
      }
    }

    return this.buildOptimizationResult(
      assets,
      bestAllocation,
      bestReturn,
      bestVolatility,
      bestSharpe,
      rebalanceThreshold
    );
  }

  /**
   * Mean-Variance Optimization with constraints
   * Balances return and risk based on risk aversion parameter
   */
  optimizeMeanVariance(
    assets: Asset[], 
    riskAversion: number = 2,
    constraints: OptimizationConstraints = {}
  ): OptimizationResult {
    const { 
      minAllocation = 0, 
      maxAllocation = 1,
      rebalanceThreshold = 0.05 
    } = constraints;

    let bestAllocation: Record<string, number> = {};
    let bestUtility = -Infinity;
    let bestReturn = 0;
    let bestVolatility = 0;
    let bestSharpe = 0;

    const iterations = 10000;
    
    for (let i = 0; i < iterations; i++) {
      const allocation = this.generateRandomAllocation(assets, minAllocation, maxAllocation);
      
      const portfolioReturn = this.calculatePortfolioReturn(assets, allocation);
      const portfolioVolatility = this.calculatePortfolioVolatility(assets, allocation);
      
      // Utility = Return - (RiskAversion * Variance / 2)
      const utility = portfolioReturn - (riskAversion * Math.pow(portfolioVolatility, 2) / 2);

      if (utility > bestUtility) {
        bestUtility = utility;
        bestAllocation = allocation;
        bestReturn = portfolioReturn;
        bestVolatility = portfolioVolatility;
        bestSharpe = this.calculateSharpeRatio(portfolioReturn, portfolioVolatility);
      }
    }

    return this.buildOptimizationResult(
      assets,
      bestAllocation,
      bestReturn,
      bestVolatility,
      bestSharpe,
      rebalanceThreshold
    );
  }

  /**
   * Calculate Value at Risk (VaR)
   * Estimates maximum loss at given confidence level
   */
  calculateVaR(
    portfolioValue: number,
    expectedReturn: number,
    volatility: number,
    confidenceLevel: number = 0.95,
    timeHorizon: number = 1
  ): number {
    // Use normal distribution approximation
    const z = this.getZScore(confidenceLevel);
    const expectedGrowth = expectedReturn * timeHorizon;
    const timeAdjustedVol = volatility * Math.sqrt(timeHorizon);
    
    // VaR = Portfolio Value * (Expected Return - Z * Volatility)
    const var95 = portfolioValue * (expectedGrowth - z * timeAdjustedVol);
    
    return Math.abs(var95);
  }

  /**
   * Calculate Conditional Value at Risk (CVaR)
   * Expected loss in worst case scenarios beyond VaR
   */
  calculateCVaR(
    portfolioValue: number,
    expectedReturn: number,
    volatility: number,
    confidenceLevel: number = 0.95,
    timeHorizon: number = 1
  ): number {
    const z = this.getZScore(confidenceLevel);
    const expectedGrowth = expectedReturn * timeHorizon;
    const timeAdjustedVol = volatility * Math.sqrt(timeHorizon);
    
    // Simplified CVaR calculation
    const phi = this.standardNormalPDF(z);
    const cvar = portfolioValue * (expectedGrowth - (phi / (1 - confidenceLevel)) * timeAdjustedVol);
    
    return Math.abs(cvar);
  }

  /**
   * Efficient Frontier Generation
   * Generates portfolio combinations along the efficient frontier
   */
  generateEfficientFrontier(
    assets: Asset[],
    points: number = 50
  ): { return: number; risk: number; sharpe: number }[] {
    const frontier: { return: number; risk: number; sharpe: number }[] = [];
    
    // Find min and max returns
    const minReturn = Math.min(...assets.map(a => a.expectedReturn));
    const maxReturn = Math.max(...assets.map(a => a.expectedReturn));
    const returnStep = (maxReturn - minReturn) / (points - 1);

    for (let i = 0; i < points; i++) {
      const targetReturn = minReturn + (returnStep * i);
      const result = this.optimizeMinVolatility(assets, { targetReturn });
      
      frontier.push({
        return: result.expectedReturn,
        risk: result.expectedVolatility,
        sharpe: result.sharpeRatio,
      });
    }

    return frontier.sort((a, b) => a.risk - b.risk);
  }

  /**
   * Private helper methods
   */

  private generateRandomAllocation(
    assets: Asset[],
    minAllocation: number,
    maxAllocation: number
  ): Record<string, number> {
    const allocation: Record<string, number> = {};
    const weights: number[] = [];
    
    // Generate random weights
    for (let i = 0; i < assets.length; i++) {
      weights.push(Math.random());
    }
    
    // Normalize to sum to 1
    const sum = weights.reduce((a, b) => a + b, 0);
    
    assets.forEach((asset, i) => {
      let normalizedWeight = weights[i] / sum;
      
      // Apply constraints
      normalizedWeight = Math.max(minAllocation, Math.min(maxAllocation, normalizedWeight));
      allocation[asset.symbol] = normalizedWeight;
    });

    // Ensure allocations sum to 1 after constraints
    const totalAllocation = Object.values(allocation).reduce((a, b) => a + b, 0);
    Object.keys(allocation).forEach(key => {
      allocation[key] /= totalAllocation;
    });

    return allocation;
  }

  private buildOptimizationResult(
    assets: Asset[],
    targetAllocation: Record<string, number>,
    expectedReturn: number,
    expectedVolatility: number,
    sharpeRatio: number,
    rebalanceThreshold: number
  ): OptimizationResult {
    const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const changes = assets.map(asset => {
      const currentAlloc = asset.currentAllocation;
      const targetAlloc = targetAllocation[asset.symbol] || 0;
      const difference = targetAlloc - currentAlloc;
      
      let action: 'buy' | 'sell' | 'hold' = 'hold';
      if (Math.abs(difference) > rebalanceThreshold) {
        action = difference > 0 ? 'buy' : 'sell';
      }

      return {
        symbol: asset.symbol,
        currentAllocation: currentAlloc,
        targetAllocation: targetAlloc,
        action,
        amount: Math.abs(difference * totalValue),
      };
    });

    // Calculate current portfolio metrics
    const currentAllocation: Record<string, number> = {};
    assets.forEach(asset => {
      currentAllocation[asset.symbol] = asset.currentAllocation;
    });

    const currentReturn = this.calculatePortfolioReturn(assets, currentAllocation);
    const currentVolatility = this.calculatePortfolioVolatility(assets, currentAllocation);
    const currentSharpe = this.calculateSharpeRatio(currentReturn, currentVolatility);

    return {
      targetAllocation,
      expectedReturn,
      expectedVolatility,
      sharpeRatio,
      changes: changes.filter(c => c.action !== 'hold'),
      improvementMetrics: {
        returnImprovement: expectedReturn - currentReturn,
        riskReduction: currentVolatility - expectedVolatility,
        sharpeImprovement: sharpeRatio - currentSharpe,
      },
    };
  }

  private getZScore(confidenceLevel: number): number {
    // Approximate z-scores for common confidence levels
    const zScores: Record<number, number> = {
      0.90: 1.28,
      0.95: 1.645,
      0.99: 2.326,
    };

    return zScores[confidenceLevel] || 1.645;
  }

  private standardNormalPDF(z: number): number {
    return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  }
}

/**
 * Rebalancing Strategy Calculator
 */
export class RebalancingStrategy {
  /**
   * Calculate optimal rebalancing frequency based on transaction costs
   */
  static calculateOptimalRebalanceFrequency(
    volatility: number,
    transactionCost: number,
    portfolioValue: number
  ): { days: number; reason: string } {
    // Higher volatility → more frequent rebalancing
    // Higher transaction costs → less frequent rebalancing
    
    const volatilityFactor = volatility / 0.20; // Normalize to 20% annual volatility
    const costFactor = transactionCost / portfolioValue;
    
    // Base frequency: 90 days (quarterly)
    const baseDays = 90;
    const adjustedDays = baseDays / volatilityFactor * (1 + costFactor * 10);
    
    const days = Math.max(7, Math.min(365, Math.round(adjustedDays)));
    
    let reason = '';
    if (days <= 30) {
      reason = 'High volatility requires frequent monitoring';
    } else if (days <= 90) {
      reason = 'Quarterly rebalancing recommended for optimal balance';
    } else {
      reason = 'Low volatility and high costs favor infrequent rebalancing';
    }

    return { days, reason };
  }

  /**
   * Threshold-based rebalancing check
   */
  static shouldRebalance(
    currentAllocation: Record<string, number>,
    targetAllocation: Record<string, number>,
    thresholdType: 'absolute' | 'relative' = 'absolute',
    threshold: number = 0.05
  ): boolean {
    for (const symbol in targetAllocation) {
      const current = currentAllocation[symbol] || 0;
      const target = targetAllocation[symbol];
      
      const difference = Math.abs(current - target);
      
      if (thresholdType === 'absolute') {
        if (difference > threshold) return true;
      } else {
        // Relative threshold
        if (target > 0 && difference / target > threshold) return true;
      }
    }

    return false;
  }
}

