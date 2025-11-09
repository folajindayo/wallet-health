/**
 * Portfolio Rebalancing Suggestions Utility
 * Suggest portfolio rebalancing strategies
 */

export interface TokenPosition {
  tokenAddress: string;
  tokenSymbol: string;
  balance: string;
  balanceUSD: number;
  targetAllocation?: number; // Percentage
  currentAllocation: number; // Percentage
}

export interface RebalancingSuggestion {
  type: 'buy' | 'sell' | 'swap';
  fromToken?: string;
  toToken: string;
  fromSymbol?: string;
  toSymbol: string;
  amountUSD: number;
  amount: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  expectedImpact: number; // Percentage improvement
}

export interface RebalancingPlan {
  walletAddress: string;
  currentValue: number; // USD
  targetValue: number; // USD
  suggestions: RebalancingSuggestion[];
  totalCost: number; // USD (gas + slippage)
  expectedImprovement: number; // Percentage
  riskLevel: 'low' | 'medium' | 'high';
}

export class PortfolioRebalancingSuggestions {
  /**
   * Generate rebalancing suggestions
   */
  generateSuggestions(
    walletAddress: string,
    positions: TokenPosition[],
    targetAllocations?: Record<string, number>
  ): RebalancingPlan {
    const currentValue = positions.reduce((sum, p) => sum + p.balanceUSD, 0);
    const suggestions: RebalancingSuggestion[] = [];

    // Calculate current allocations
    positions.forEach(pos => {
      pos.currentAllocation = currentValue > 0
        ? (pos.balanceUSD / currentValue) * 100
        : 0;
    });

    // If no target allocations, use equal distribution
    const targets = targetAllocations || this.generateEqualAllocations(positions);
    
    // Find imbalances
    positions.forEach(position => {
      const target = targets[position.tokenSymbol] || 0;
      const current = position.currentAllocation;
      const difference = current - target;

      if (Math.abs(difference) > 5) { // More than 5% deviation
        if (difference > 0) {
          // Over-allocated, suggest selling
          const excessUSD = (difference / 100) * currentValue;
          suggestions.push({
            type: 'sell',
            toToken: position.tokenAddress,
            toSymbol: position.tokenSymbol,
            amountUSD: Math.abs(excessUSD),
            amount: (Math.abs(excessUSD) / (position.balanceUSD / parseFloat(position.balance))).toString(),
            reason: `Over-allocated by ${Math.abs(difference).toFixed(2)}%. Target: ${target}%, Current: ${current.toFixed(2)}%`,
            priority: Math.abs(difference) > 15 ? 'high' : Math.abs(difference) > 10 ? 'medium' : 'low',
            expectedImpact: Math.abs(difference),
          });
        } else {
          // Under-allocated, suggest buying
          const deficitUSD = (Math.abs(difference) / 100) * currentValue;
          suggestions.push({
            type: 'buy',
            toToken: position.tokenAddress,
            toSymbol: position.tokenSymbol,
            amountUSD: deficitUSD,
            amount: '0', // Would calculate based on price
            reason: `Under-allocated by ${Math.abs(difference).toFixed(2)}%. Target: ${target}%, Current: ${current.toFixed(2)}%`,
            priority: Math.abs(difference) > 15 ? 'high' : Math.abs(difference) > 10 ? 'medium' : 'low',
            expectedImpact: Math.abs(difference),
          });
        }
      }
    });

    // Estimate costs
    const totalCost = suggestions.length * 50; // ~$50 per transaction (gas + slippage)

    // Calculate expected improvement
    const totalDeviation = positions.reduce((sum, p) => {
      const target = targets[p.tokenSymbol] || 0;
      return sum + Math.abs(p.currentAllocation - target);
    }, 0);
    const expectedImprovement = totalDeviation / positions.length;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (suggestions.length > 5 || totalCost > currentValue * 0.05) {
      riskLevel = 'high';
    } else if (suggestions.length > 3 || totalCost > currentValue * 0.02) {
      riskLevel = 'medium';
    }

    return {
      walletAddress,
      currentValue: Math.round(currentValue * 100) / 100,
      targetValue: Math.round(currentValue * 100) / 100, // Same value, different allocation
      suggestions: suggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      totalCost: Math.round(totalCost * 100) / 100,
      expectedImprovement: Math.round(expectedImprovement * 100) / 100,
      riskLevel,
    };
  }

  /**
   * Generate equal allocations
   */
  private generateEqualAllocations(positions: TokenPosition[]): Record<string, number> {
    const allocation = 100 / positions.length;
    const allocations: Record<string, number> = {};
    positions.forEach(pos => {
      allocations[pos.tokenSymbol] = allocation;
    });
    return allocations;
  }

  /**
   * Generate risk-based allocations
   */
  generateRiskBasedAllocations(
    positions: TokenPosition[],
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  ): Record<string, number> {
    // Simplified risk-based allocation
    // In production, would use more sophisticated risk models
    
    const allocations: Record<string, number> = {};
    
    if (riskTolerance === 'conservative') {
      // Favor stablecoins and blue-chip tokens
      positions.forEach(pos => {
        if (['USDC', 'USDT', 'DAI', 'ETH', 'BTC'].includes(pos.tokenSymbol)) {
          allocations[pos.tokenSymbol] = 20;
        } else {
          allocations[pos.tokenSymbol] = 100 / positions.length;
        }
      });
    } else if (riskTolerance === 'moderate') {
      // Equal distribution
      const allocation = 100 / positions.length;
      positions.forEach(pos => {
        allocations[pos.tokenSymbol] = allocation;
      });
    } else {
      // Aggressive: favor higher volatility tokens
      positions.forEach(pos => {
        allocations[pos.tokenSymbol] = 100 / positions.length;
      });
    }

    // Normalize to 100%
    const total = Object.values(allocations).reduce((sum, a) => sum + a, 0);
    Object.keys(allocations).forEach(key => {
      allocations[key] = (allocations[key] / total) * 100;
    });

    return allocations;
  }

  /**
   * Calculate rebalancing impact
   */
  calculateImpact(
    currentPositions: TokenPosition[],
    targetAllocations: Record<string, number>
  ): {
    currentDeviation: number; // Average deviation from target
    targetDeviation: number; // Expected deviation after rebalancing
    improvement: number; // Percentage improvement
  } {
    const currentValue = currentPositions.reduce((sum, p) => sum + p.balanceUSD, 0);
    
    const currentDeviation = currentPositions.reduce((sum, p) => {
      const target = targetAllocations[p.tokenSymbol] || 0;
      const current = currentValue > 0 ? (p.balanceUSD / currentValue) * 100 : 0;
      return sum + Math.abs(current - target);
    }, 0) / currentPositions.length;

    // Assume perfect rebalancing (would be 0 deviation)
    const targetDeviation = 0;

    const improvement = currentDeviation > 0
      ? ((currentDeviation - targetDeviation) / currentDeviation) * 100
      : 0;

    return {
      currentDeviation: Math.round(currentDeviation * 100) / 100,
      targetDeviation: Math.round(targetDeviation * 100) / 100,
      improvement: Math.round(improvement * 100) / 100,
    };
  }
}

// Singleton instance
export const portfolioRebalancingSuggestions = new PortfolioRebalancingSuggestions();

