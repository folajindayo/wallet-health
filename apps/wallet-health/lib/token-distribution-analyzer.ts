/**
 * Token Distribution Analyzer
 * Analyzes token distribution patterns and concentration risks
 */

export interface TokenDistribution {
  tokenAddress: string;
  tokenSymbol: string;
  totalSupply: string;
  holders: Array<{
    address: string;
    balance: string;
    percentage: number;
    rank: number;
  }>;
  statistics: {
    totalHolders: number;
    top10Percentage: number;
    top50Percentage: number;
    giniCoefficient: number; // 0-1, higher = more concentrated
    herfindahlIndex: number; // Concentration measure
    averageBalance: string;
    medianBalance: string;
  };
  riskAssessment: {
    concentrationRisk: 'low' | 'medium' | 'high' | 'critical';
    decentralizationScore: number; // 0-100
    risks: string[];
    recommendations: string[];
  };
}

export interface DistributionComparison {
  token1: TokenDistribution;
  token2: TokenDistribution;
  comparison: {
    giniDifference: number;
    top10Difference: number;
    moreDecentralized: string;
    insights: string[];
  };
}

export class TokenDistributionAnalyzer {
  /**
   * Analyze token distribution
   */
  analyzeDistribution(
    tokenAddress: string,
    tokenSymbol: string,
    totalSupply: string,
    holders: Array<{ address: string; balance: string }>
  ): TokenDistribution {
    // Sort holders by balance
    const sortedHolders = [...holders]
      .map(h => ({
        ...h,
        balanceBigInt: BigInt(h.balance),
      }))
      .sort((a, b) => {
        if (b.balanceBigInt > a.balanceBigInt) return 1;
        if (b.balanceBigInt < a.balanceBigInt) return -1;
        return 0;
      });

    const totalSupplyBigInt = BigInt(totalSupply);
    const totalHolders = sortedHolders.length;

    // Calculate percentages and ranks
    const holdersWithPercentage = sortedHolders.map((holder, index) => ({
      address: holder.address,
      balance: holder.balance,
      percentage: totalSupplyBigInt > 0n
        ? Number((holder.balanceBigInt * BigInt(10000)) / totalSupplyBigInt) / 100
        : 0,
      rank: index + 1,
    }));

    // Calculate statistics
    const top10 = holdersWithPercentage.slice(0, 10);
    const top50 = holdersWithPercentage.slice(0, 50);

    const top10Percentage = top10.reduce((sum, h) => sum + h.percentage, 0);
    const top50Percentage = top50.reduce((sum, h) => sum + h.percentage, 0);

    // Calculate Gini coefficient
    const giniCoefficient = this.calculateGiniCoefficient(holdersWithPercentage);

    // Calculate Herfindahl Index
    const herfindahlIndex = this.calculateHerfindahlIndex(holdersWithPercentage);

    // Calculate average and median
    const balances = holdersWithPercentage.map(h => BigInt(h.balance));
    const totalBalance = balances.reduce((sum, b) => sum + b, 0n);
    const averageBalance = totalHolders > 0
      ? (totalBalance / BigInt(totalHolders)).toString()
      : '0';

    const sortedBalances = [...balances].sort((a, b) => {
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    });
    const medianIndex = Math.floor(sortedBalances.length / 2);
    const medianBalance = sortedBalances.length > 0
      ? (sortedBalances.length % 2 === 0
          ? (sortedBalances[medianIndex - 1] + sortedBalances[medianIndex]) / 2n
          : sortedBalances[medianIndex]).toString()
      : '0';

    // Risk assessment
    const riskAssessment = this.assessRisk(
      giniCoefficient,
      top10Percentage,
      top50Percentage,
      totalHolders
    );

    return {
      tokenAddress,
      tokenSymbol,
      totalSupply,
      holders: holdersWithPercentage,
      statistics: {
        totalHolders,
        top10Percentage: Math.round(top10Percentage * 100) / 100,
        top50Percentage: Math.round(top50Percentage * 100) / 100,
        giniCoefficient: Math.round(giniCoefficient * 10000) / 10000,
        herfindahlIndex: Math.round(herfindahlIndex * 10000) / 10000,
        averageBalance,
        medianBalance,
      },
      riskAssessment,
    };
  }

  /**
   * Compare two token distributions
   */
  compareDistributions(
    distribution1: TokenDistribution,
    distribution2: TokenDistribution
  ): DistributionComparison {
    const giniDifference = distribution2.statistics.giniCoefficient - distribution1.statistics.giniCoefficient;
    const top10Difference = distribution2.statistics.top10Percentage - distribution1.statistics.top10Percentage;

    const moreDecentralized = distribution1.statistics.giniCoefficient < distribution2.statistics.giniCoefficient
      ? distribution1.tokenSymbol
      : distribution2.tokenSymbol;

    const insights: string[] = [];

    if (Math.abs(giniDifference) > 0.1) {
      insights.push(
        `${moreDecentralized} is significantly more decentralized (Gini difference: ${Math.abs(giniDifference).toFixed(3)})`
      );
    }

    if (Math.abs(top10Difference) > 10) {
      insights.push(
        `Top 10 holders control ${Math.abs(top10Difference).toFixed(1)}% more in ${top10Difference > 0 ? distribution2.tokenSymbol : distribution1.tokenSymbol}`
      );
    }

    if (distribution1.statistics.totalHolders !== distribution2.statistics.totalHolders) {
      const diff = Math.abs(distribution1.statistics.totalHolders - distribution2.statistics.totalHolders);
      insights.push(
        `${distribution1.statistics.totalHolders > distribution2.statistics.totalHolders ? distribution1.tokenSymbol : distribution2.tokenSymbol} has ${diff} more holders`
      );
    }

    return {
      token1: distribution1,
      token2: distribution2,
      comparison: {
        giniDifference: Math.round(giniDifference * 10000) / 10000,
        top10Difference: Math.round(top10Difference * 100) / 100,
        moreDecentralized,
        insights,
      },
    };
  }

  /**
   * Calculate Gini coefficient
   */
  private calculateGiniCoefficient(
    holders: Array<{ percentage: number }>
  ): number {
    if (holders.length === 0) return 0;

    const sorted = [...holders].sort((a, b) => a.percentage - b.percentage);
    const n = sorted.length;
    let sum = 0;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        sum += Math.abs(sorted[i].percentage - sorted[j].percentage);
      }
    }

    return sum / (2 * n * n * 100); // Normalize
  }

  /**
   * Calculate Herfindahl Index
   */
  private calculateHerfindahlIndex(
    holders: Array<{ percentage: number }>
  ): number {
    return holders.reduce((sum, h) => {
      const share = h.percentage / 100;
      return sum + share * share;
    }, 0);
  }

  /**
   * Assess risk based on distribution metrics
   */
  private assessRisk(
    giniCoefficient: number,
    top10Percentage: number,
    top50Percentage: number,
    totalHolders: number
  ): TokenDistribution['riskAssessment'] {
    const risks: string[] = [];
    const recommendations: string[] = [];

    let concentrationRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let decentralizationScore = 100;

    // Gini coefficient assessment
    if (giniCoefficient > 0.8) {
      concentrationRisk = 'critical';
      decentralizationScore -= 40;
      risks.push('Extremely high concentration (Gini > 0.8)');
      recommendations.push('Consider token distribution mechanisms to improve decentralization');
    } else if (giniCoefficient > 0.6) {
      concentrationRisk = 'high';
      decentralizationScore -= 30;
      risks.push('High concentration (Gini > 0.6)');
    } else if (giniCoefficient > 0.4) {
      concentrationRisk = 'medium';
      decentralizationScore -= 15;
      risks.push('Moderate concentration (Gini > 0.4)');
    }

    // Top 10 assessment
    if (top10Percentage > 80) {
      concentrationRisk = concentrationRisk === 'critical' ? 'critical' : 'high';
      decentralizationScore -= 20;
      risks.push('Top 10 holders control >80% of supply');
      recommendations.push('High concentration in top holders increases manipulation risk');
    } else if (top10Percentage > 60) {
      if (concentrationRisk === 'low') concentrationRisk = 'medium';
      decentralizationScore -= 10;
      risks.push('Top 10 holders control >60% of supply');
    }

    // Holder count assessment
    if (totalHolders < 100) {
      if (concentrationRisk === 'low') concentrationRisk = 'medium';
      decentralizationScore -= 10;
      risks.push('Low holder count increases concentration risk');
      recommendations.push('Consider airdrops or other distribution mechanisms to increase holder base');
    }

    // Final score adjustment
    if (top50Percentage > 95) {
      decentralizationScore -= 10;
    }

    decentralizationScore = Math.max(0, Math.min(100, decentralizationScore));

    return {
      concentrationRisk,
      decentralizationScore: Math.round(decentralizationScore),
      risks,
      recommendations,
    };
  }

  /**
   * Get distribution health score
   */
  getDistributionHealthScore(distribution: TokenDistribution): number {
    let score = 100;

    // Deduct based on Gini
    if (distribution.statistics.giniCoefficient > 0.8) score -= 40;
    else if (distribution.statistics.giniCoefficient > 0.6) score -= 30;
    else if (distribution.statistics.giniCoefficient > 0.4) score -= 15;

    // Deduct based on top 10
    if (distribution.statistics.top10Percentage > 80) score -= 20;
    else if (distribution.statistics.top10Percentage > 60) score -= 10;

    // Deduct based on holder count
    if (distribution.statistics.totalHolders < 100) score -= 10;
    else if (distribution.statistics.totalHolders < 500) score -= 5;

    return Math.max(0, Math.min(100, score));
  }
}

// Singleton instance
export const tokenDistributionAnalyzer = new TokenDistributionAnalyzer();
