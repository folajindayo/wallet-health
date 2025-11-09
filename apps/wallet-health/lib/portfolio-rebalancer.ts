/**
 * Portfolio Rebalancer Utility
 * Suggests portfolio rebalancing strategies
 */

export interface PortfolioAllocation {
  token: string;
  tokenSymbol: string;
  currentAmount: number;
  currentValueUSD: number;
  currentPercentage: number;
  targetPercentage: number;
  difference: number; // percentage points
  action: 'buy' | 'sell' | 'hold';
  amountToTrade: number; // USD
  amountToTradeTokens: number; // token amount
}

export interface RebalancingStrategy {
  type: 'equal_weight' | 'risk_parity' | 'momentum' | 'mean_reversion' | 'custom';
  name: string;
  description: string;
  allocations: PortfolioAllocation[];
  totalValueUSD: number;
  rebalancingCost: number; // Estimated gas fees
  expectedImprovement: number; // Expected return improvement %
}

export interface RebalancingRecommendation {
  currentAllocation: PortfolioAllocation[];
  strategies: RebalancingStrategy[];
  recommendedStrategy: RebalancingStrategy | null;
  reasons: string[];
  riskWarning: boolean;
}

export class PortfolioRebalancer {
  /**
   * Calculate equal weight allocation
   */
  calculateEqualWeight(
    tokens: Array<{ symbol: string; valueUSD: number }>
  ): PortfolioAllocation[] {
    const totalValue = tokens.reduce((sum, t) => sum + t.valueUSD, 0);
    const targetPercentage = 100 / tokens.length;

    return tokens.map(token => ({
      token: '',
      tokenSymbol: token.symbol,
      currentAmount: 0, // Would need actual amounts
      currentValueUSD: token.valueUSD,
      currentPercentage: totalValue > 0 ? (token.valueUSD / totalValue) * 100 : 0,
      targetPercentage,
      difference: (token.valueUSD / totalValue) * 100 - targetPercentage,
      action: (token.valueUSD / totalValue) * 100 > targetPercentage ? 'sell' : 'buy',
      amountToTrade: Math.abs((token.valueUSD / totalValue) * 100 - targetPercentage) * totalValue / 100,
      amountToTradeTokens: 0, // Would need token price
    }));
  }

  /**
   * Calculate risk parity allocation
   */
  calculateRiskParity(
    tokens: Array<{
      symbol: string;
      valueUSD: number;
      volatility?: number; // Standard deviation of returns
    }>
  ): PortfolioAllocation[] {
    // Risk parity: allocate inversely proportional to volatility
    const volatilities = tokens.map(t => t.volatility || 1);
    const inverseVolatilities = volatilities.map(v => 1 / v);
    const sumInverseVol = inverseVolatilities.reduce((sum, v) => sum + v, 0);

    const totalValue = tokens.reduce((sum, t) => sum + t.valueUSD, 0);

    return tokens.map((token, index) => {
      const targetPercentage = (inverseVolatilities[index] / sumInverseVol) * 100;
      const currentPercentage = totalValue > 0 ? (token.valueUSD / totalValue) * 100 : 0;

      return {
        token: '',
        tokenSymbol: token.symbol,
        currentAmount: 0,
        currentValueUSD: token.valueUSD,
        currentPercentage,
        targetPercentage,
        difference: currentPercentage - targetPercentage,
        action: currentPercentage > targetPercentage ? 'sell' : 'buy',
        amountToTrade: Math.abs(currentPercentage - targetPercentage) * totalValue / 100,
        amountToTradeTokens: 0,
      };
    });
  }

  /**
   * Generate rebalancing recommendations
   */
  generateRecommendations(
    currentPortfolio: Array<{
      token: string;
      symbol: string;
      valueUSD: number;
      volatility?: number;
    }>,
    targetStrategy: 'equal_weight' | 'risk_parity' | 'custom' = 'equal_weight',
    customTargets?: Record<string, number> // token -> target percentage
  ): RebalancingRecommendation {
    const totalValue = currentPortfolio.reduce((sum, t) => sum + t.valueUSD, 0);

    // Calculate current allocation
    const currentAllocation: PortfolioAllocation[] = currentPortfolio.map(token => ({
      token: token.token,
      tokenSymbol: token.symbol,
      currentAmount: 0,
      currentValueUSD: token.valueUSD,
      currentPercentage: totalValue > 0 ? (token.valueUSD / totalValue) * 100 : 0,
      targetPercentage: 0, // Will be set by strategy
      difference: 0,
      action: 'hold',
      amountToTrade: 0,
      amountToTradeTokens: 0,
    }));

    // Generate strategies
    const strategies: RebalancingStrategy[] = [];

    // Equal weight strategy
    const equalWeightAllocations = this.calculateEqualWeight(
      currentPortfolio.map(t => ({ symbol: t.symbol, valueUSD: t.valueUSD }))
    );
    strategies.push({
      type: 'equal_weight',
      name: 'Equal Weight',
      description: 'Distribute portfolio equally across all assets',
      allocations: equalWeightAllocations,
      totalValueUSD: totalValue,
      rebalancingCost: this.estimateRebalancingCost(equalWeightAllocations),
      expectedImprovement: 2, // Estimate
    });

    // Risk parity strategy (if volatility data available)
    const hasVolatility = currentPortfolio.some(t => t.volatility);
    if (hasVolatility) {
      const riskParityAllocations = this.calculateRiskParity(currentPortfolio);
      strategies.push({
        type: 'risk_parity',
        name: 'Risk Parity',
        description: 'Allocate based on inverse volatility for balanced risk',
        allocations: riskParityAllocations,
        totalValueUSD: totalValue,
        rebalancingCost: this.estimateRebalancingCost(riskParityAllocations),
        expectedImprovement: 3,
      });
    }

    // Custom strategy (if provided)
    if (customTargets) {
      const customAllocations = this.calculateCustomAllocation(
        currentPortfolio,
        customTargets
      );
      strategies.push({
        type: 'custom',
        name: 'Custom Allocation',
        description: 'Custom target allocation',
        allocations: customAllocations,
        totalValueUSD: totalValue,
        rebalancingCost: this.estimateRebalancingCost(customAllocations),
        expectedImprovement: 1,
      });
    }

    // Select recommended strategy
    const recommendedStrategy = strategies.find(s => s.type === targetStrategy) || strategies[0] || null;

    // Generate reasons
    const reasons: string[] = [];
    const maxDeviation = Math.max(...currentAllocation.map(a => Math.abs(a.currentPercentage - a.targetPercentage)));
    
    if (maxDeviation > 10) {
      reasons.push('Portfolio allocation has deviated significantly from target.');
    }

    if (recommendedStrategy) {
      const totalRebalancing = recommendedStrategy.allocations.reduce(
        (sum, a) => sum + a.amountToTrade,
        0
      );
      if (totalRebalancing > totalValue * 0.1) {
        reasons.push('Significant rebalancing required (>10% of portfolio).');
      }
    }

    // Risk warning
    const riskWarning = recommendedStrategy
      ? recommendedStrategy.rebalancingCost > totalValue * 0.01 // >1% in fees
      : false;

    return {
      currentAllocation,
      strategies,
      recommendedStrategy,
      reasons,
      riskWarning,
    };
  }

  /**
   * Calculate custom allocation
   */
  private calculateCustomAllocation(
    tokens: Array<{ symbol: string; valueUSD: number }>,
    targets: Record<string, number>
  ): PortfolioAllocation[] {
    const totalValue = tokens.reduce((sum, t) => sum + t.valueUSD, 0);

    return tokens.map(token => {
      const targetPercentage = targets[token.symbol] || 0;
      const currentPercentage = totalValue > 0 ? (token.valueUSD / totalValue) * 100 : 0;

      return {
        token: '',
        tokenSymbol: token.symbol,
        currentAmount: 0,
        currentValueUSD: token.valueUSD,
        currentPercentage,
        targetPercentage,
        difference: currentPercentage - targetPercentage,
        action: currentPercentage > targetPercentage ? 'sell' : 'buy',
        amountToTrade: Math.abs(currentPercentage - targetPercentage) * totalValue / 100,
        amountToTradeTokens: 0,
      };
    });
  }

  /**
   * Estimate rebalancing cost
   */
  private estimateRebalancingCost(allocations: PortfolioAllocation[]): number {
    // Count number of trades needed
    const tradesNeeded = allocations.filter(a => a.amountToTrade > 10).length; // >$10 trades
    
    // Estimate gas cost per trade (simplified)
    const gasCostPerTrade = 50; // USD estimate
    const tradingFees = 0.003; // 0.3% trading fee

    const totalTradeValue = allocations.reduce((sum, a) => sum + a.amountToTrade, 0);
    const tradingFeeCost = totalTradeValue * tradingFees;
    const gasCost = tradesNeeded * gasCostPerTrade;

    return tradingFeeCost + gasCost;
  }

  /**
   * Calculate optimal rebalancing threshold
   */
  calculateRebalancingThreshold(
    allocations: PortfolioAllocation[],
    transactionCost: number
  ): number {
    // Calculate threshold where rebalancing benefit exceeds cost
    const totalValue = allocations.reduce((sum, a) => sum + a.currentValueUSD, 0);
    const costPercentage = (transactionCost / totalValue) * 100;
    
    // Typically rebalance when deviation exceeds 5% or cost threshold
    return Math.max(5, costPercentage * 2);
  }

  /**
   * Check if rebalancing is needed
   */
  isRebalancingNeeded(
    allocations: PortfolioAllocation[],
    threshold = 5 // percentage points
  ): boolean {
    return allocations.some(a => Math.abs(a.difference) > threshold);
  }
}

// Singleton instance
export const portfolioRebalancer = new PortfolioRebalancer();

