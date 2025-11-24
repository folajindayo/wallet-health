/**
 * Portfolio Rebalancing Assistant
 * Provides recommendations for portfolio rebalancing based on risk and diversification
 */

export interface TokenPosition {
  address: string;
  symbol: string;
  balance: string;
  valueUSD: number;
  percentage: number; // Percentage of total portfolio
  chainId: number;
  priceUSD: number;
}

export interface RebalancingRecommendation {
  token: TokenPosition;
  currentPercentage: number;
  targetPercentage: number;
  action: 'buy' | 'sell' | 'hold';
  amountUSD: number;
  amountTokens: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

export interface RebalancingPlan {
  walletAddress: string;
  currentPortfolio: TokenPosition[];
  recommendations: RebalancingRecommendation[];
  targetAllocation: Record<string, number>; // tokenSymbol -> percentage
  totalValueUSD: number;
  rebalancingCost: number; // Estimated gas costs
  expectedImprovement: {
    diversificationScore: number;
    riskScore: number;
    before: { diversification: number; risk: number };
    after: { diversification: number; risk: number };
  };
  strategy: 'conservative' | 'moderate' | 'aggressive';
}

export class PortfolioRebalancingAssistant {
  /**
   * Generate rebalancing plan
   */
  generatePlan(params: {
    walletAddress: string;
    positions: TokenPosition[];
    targetAllocation?: Record<string, number>;
    strategy?: 'conservative' | 'moderate' | 'aggressive';
    rebalanceThreshold?: number; // Percentage deviation to trigger rebalancing
  }): RebalancingPlan {
    const {
      walletAddress,
      positions,
      targetAllocation = this.generateDefaultAllocation(positions),
      strategy = 'moderate',
      rebalanceThreshold = 5, // 5% deviation
    } = params;

    const totalValue = positions.reduce((sum, p) => sum + p.valueUSD, 0);

    // Calculate current allocation
    const currentAllocation: Record<string, number> = {};
    positions.forEach((pos) => {
      currentAllocation[pos.symbol] = pos.percentage;
    });

    // Generate recommendations
    const recommendations: RebalancingRecommendation[] = [];

    Object.entries(targetAllocation).forEach(([symbol, targetPercent]) => {
      const currentPercent = currentAllocation[symbol] || 0;
      const deviation = Math.abs(currentPercent - targetPercent);

      if (deviation > rebalanceThreshold) {
        const position = positions.find((p) => p.symbol === symbol);
        const amountUSD = totalValue * (targetPercent - currentPercent) / 100;

        let action: 'buy' | 'sell' | 'hold';
        if (targetPercent > currentPercent) {
          action = 'buy';
        } else if (targetPercent < currentPercent) {
          action = 'sell';
        } else {
          action = 'hold';
        }

        const reason = this.generateReason(symbol, currentPercent, targetPercent, deviation, strategy);

        recommendations.push({
          token: position || {
            address: '',
            symbol,
            balance: '0',
            valueUSD: 0,
            percentage: 0,
            chainId: 1,
            priceUSD: 0,
          },
          currentPercentage: currentPercent,
          targetPercentage: targetPercent,
          action,
          amountUSD: Math.abs(amountUSD),
          amountTokens: position
            ? (Math.abs(amountUSD) / position.priceUSD).toFixed(6)
            : '0',
          reason,
          priority: this.calculatePriority(deviation, strategy),
        });
      }
    });

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    // Calculate expected improvement
    const before = this.calculateMetrics(positions);
    const afterPositions = this.simulateRebalancing(positions, recommendations, totalValue);
    const after = this.calculateMetrics(afterPositions);

    // Estimate rebalancing cost (gas)
    const rebalancingCost = this.estimateRebalancingCost(recommendations);

    return {
      walletAddress,
      currentPortfolio: positions,
      recommendations,
      targetAllocation,
      totalValueUSD: totalValue,
      rebalancingCost,
      expectedImprovement: {
        diversificationScore: after.diversification - before.diversification,
        riskScore: before.risk - after.risk, // Lower risk is better
        before,
        after,
      },
      strategy,
    };
  }

  /**
   * Generate default allocation based on current positions
   */
  private generateDefaultAllocation(positions: TokenPosition[]): Record<string, number> {
    const allocation: Record<string, number> = {};
    const totalValue = positions.reduce((sum, p) => sum + p.valueUSD, 0);

    if (totalValue === 0) return {};

    // Equal weight allocation
    const equalWeight = 100 / positions.length;
    positions.forEach((pos) => {
      allocation[pos.symbol] = equalWeight;
    });

    return allocation;
  }

  /**
   * Generate reason for rebalancing
   */
  private generateReason(
    symbol: string,
    current: number,
    target: number,
    deviation: number,
    strategy: string
  ): string {
    if (current > target) {
      return `Overweight by ${deviation.toFixed(1)}% - reduce exposure for better diversification`;
    } else {
      return `Underweight by ${deviation.toFixed(1)}% - increase exposure to meet target allocation`;
    }
  }

  /**
   * Calculate priority
   */
  private calculatePriority(deviation: number, strategy: string): 'low' | 'medium' | 'high' {
    const thresholds: Record<string, { high: number; medium: number }> = {
      conservative: { high: 10, medium: 5 },
      moderate: { high: 15, medium: 7 },
      aggressive: { high: 20, medium: 10 },
    };

    const threshold = thresholds[strategy] || thresholds.moderate;

    if (deviation >= threshold.high) return 'high';
    if (deviation >= threshold.medium) return 'medium';
    return 'low';
  }

  /**
   * Calculate portfolio metrics
   */
  private calculateMetrics(positions: TokenPosition[]): {
    diversification: number; // 0-100
    risk: number; // 0-100
  } {
    if (positions.length === 0) {
      return { diversification: 0, risk: 100 };
    }

    // Diversification score (based on number of positions and distribution)
    const totalValue = positions.reduce((sum, p) => sum + p.valueUSD, 0);
    if (totalValue === 0) {
      return { diversification: 0, risk: 100 };
    }

    // Calculate Herfindahl-Hirschman Index (HHI) for concentration
    const hhi = positions.reduce((sum, p) => {
      const share = p.valueUSD / totalValue;
      return sum + share * share;
    }, 0);

    // Convert HHI to diversification score (lower HHI = higher diversification)
    const diversification = Math.max(0, Math.min(100, (1 - hhi) * 100));

    // Risk score (simplified - would use volatility, correlation, etc. in production)
    const risk = Math.min(100, positions.length * 10); // More positions = lower risk (simplified)

    return { diversification, risk };
  }

  /**
   * Simulate rebalancing
   */
  private simulateRebalancing(
    currentPositions: TokenPosition[],
    recommendations: RebalancingRecommendation[],
    totalValue: number
  ): TokenPosition[] {
    const newPositions = currentPositions.map((pos) => ({ ...pos }));

    recommendations.forEach((rec) => {
      const position = newPositions.find((p) => p.symbol === rec.token.symbol);
      if (position) {
        if (rec.action === 'buy') {
          position.valueUSD += rec.amountUSD;
          position.balance = (parseFloat(position.balance) + parseFloat(rec.amountTokens)).toString();
        } else if (rec.action === 'sell') {
          position.valueUSD = Math.max(0, position.valueUSD - rec.amountUSD);
          position.balance = Math.max(0, parseFloat(position.balance) - parseFloat(rec.amountTokens)).toString();
        }
        position.percentage = (position.valueUSD / totalValue) * 100;
      }
    });

    return newPositions;
  }

  /**
   * Estimate rebalancing cost
   */
  private estimateRebalancingCost(recommendations: RebalancingRecommendation[]): number {
    // Estimate gas costs for swaps/transfers
    const gasPerOperation = 150000; // Approximate gas for swap
    const gasPriceGwei = 30;
    const ethPriceUSD = 2000;
    const operations = recommendations.filter((r) => r.action !== 'hold').length;

    const totalGas = gasPerOperation * operations;
    const gasPriceWei = gasPriceGwei * 1e9;
    const costWei = BigInt(totalGas) * BigInt(Math.floor(gasPriceWei));
    const costEth = Number(costWei) / 1e18;
    const costUSD = costEth * ethPriceUSD;

    return Math.round(costUSD * 10000) / 10000;
  }

  /**
   * Generate target allocation based on risk profile
   */
  generateTargetAllocation(params: {
    riskProfile: 'conservative' | 'moderate' | 'aggressive';
    preferredTokens?: string[];
    maxPositions?: number;
  }): Record<string, number> {
    const { riskProfile, preferredTokens = [], maxPositions = 10 } = params;

    // Default allocations by risk profile
    const allocations: Record<string, Record<string, number>> = {
      conservative: {
        USDC: 40,
        USDT: 30,
        DAI: 20,
        ETH: 10,
      },
      moderate: {
        ETH: 40,
        USDC: 25,
        BTC: 20,
        'Other': 15,
      },
      aggressive: {
        ETH: 50,
        'Altcoins': 30,
        'DeFi Tokens': 20,
      },
    };

    return allocations[riskProfile] || allocations.moderate;
  }
}

// Singleton instance
export const portfolioRebalancingAssistant = new PortfolioRebalancingAssistant();

