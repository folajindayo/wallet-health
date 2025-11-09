/**
 * Token Distribution Analyzer Utility
 * Analyze token distribution and holder patterns
 */

export interface HolderDistribution {
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  totalSupply: string;
  totalHolders: number;
  distribution: Array<{
    range: string; // e.g., "0-0.001%", "0.001-0.01%"
    holderCount: number;
    totalBalance: string;
    percentage: number;
  }>;
  concentration: {
    top10Percent: number; // Percentage of supply held by top 10%
    top1Percent: number; // Percentage of supply held by top 1%
    giniCoefficient: number; // 0-1, higher = more concentrated
  };
  whaleAddresses: Array<{
    address: string;
    balance: string;
    percentage: number;
    label?: string;
  }>;
}

export interface DistributionAnalysis {
  tokenAddress: string;
  tokenSymbol: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendations: string[];
  score: number; // 0-100
}

export class TokenDistributionAnalyzer {
  /**
   * Analyze token distribution
   */
  analyzeDistribution(
    tokenAddress: string,
    tokenSymbol: string,
    chainId: number,
    holders: Array<{ address: string; balance: string }>
  ): HolderDistribution {
    const totalSupply = holders.reduce((sum, h) => sum + parseFloat(h.balance), 0).toString();
    const totalHolders = holders.length;

    // Sort by balance descending
    const sortedHolders = [...holders].sort((a, b) => 
      parseFloat(b.balance) - parseFloat(a.balance)
    );

    // Calculate distribution ranges
    const ranges = [
      { min: 0, max: 0.001, label: '0-0.001%' },
      { min: 0.001, max: 0.01, label: '0.001-0.01%' },
      { min: 0.01, max: 0.1, label: '0.01-0.1%' },
      { min: 0.1, max: 1, label: '0.1-1%' },
      { min: 1, max: 10, label: '1-10%' },
      { min: 10, max: 100, label: '10%+' },
    ];

    const distribution = ranges.map(range => {
      const holdersInRange = sortedHolders.filter(h => {
        const percentage = (parseFloat(h.balance) / parseFloat(totalSupply)) * 100;
        return percentage >= range.min && percentage < range.max;
      });

      const totalBalance = holdersInRange.reduce(
        (sum, h) => sum + parseFloat(h.balance),
        0
      ).toString();

      return {
        range: range.label,
        holderCount: holdersInRange.length,
        totalBalance,
        percentage: (parseFloat(totalBalance) / parseFloat(totalSupply)) * 100,
      };
    });

    // Calculate concentration metrics
    const top10Count = Math.max(1, Math.floor(totalHolders * 0.1));
    const top1Count = Math.max(1, Math.floor(totalHolders * 0.01));

    const top10Balance = sortedHolders
      .slice(0, top10Count)
      .reduce((sum, h) => sum + parseFloat(h.balance), 0);

    const top1Balance = sortedHolders
      .slice(0, top1Count)
      .reduce((sum, h) => sum + parseFloat(h.balance), 0);

    const top10Percent = (top10Balance / parseFloat(totalSupply)) * 100;
    const top1Percent = (top1Balance / parseFloat(totalSupply)) * 100;

    // Calculate Gini coefficient
    const giniCoefficient = this.calculateGiniCoefficient(sortedHolders, parseFloat(totalSupply));

    // Identify whales (top holders)
    const whaleThreshold = parseFloat(totalSupply) * 0.01; // 1% threshold
    const whaleAddresses = sortedHolders
      .filter(h => parseFloat(h.balance) >= whaleThreshold)
      .slice(0, 20) // Top 20 whales
      .map(h => ({
        address: h.address,
        balance: h.balance,
        percentage: (parseFloat(h.balance) / parseFloat(totalSupply)) * 100,
      }));

    return {
      tokenAddress,
      tokenSymbol,
      chainId,
      totalSupply,
      totalHolders,
      distribution,
      concentration: {
        top10Percent: Math.round(top10Percent * 100) / 100,
        top1Percent: Math.round(top1Percent * 100) / 100,
        giniCoefficient: Math.round(giniCoefficient * 1000) / 1000,
      },
      whaleAddresses,
    };
  }

  /**
   * Calculate Gini coefficient
   */
  private calculateGiniCoefficient(
    sortedHolders: Array<{ address: string; balance: string }>,
    totalSupply: number
  ): number {
    if (sortedHolders.length === 0 || totalSupply === 0) {
      return 0;
    }

    const n = sortedHolders.length;
    let numerator = 0;
    let denominator = 0;

    sortedHolders.forEach((holder, i) => {
      const balance = parseFloat(holder.balance);
      numerator += (2 * (i + 1) - n - 1) * balance;
      denominator += balance;
    });

    return denominator > 0 ? numerator / (n * denominator) : 0;
  }

  /**
   * Analyze distribution risk
   */
  analyzeRisk(distribution: HolderDistribution): DistributionAnalysis {
    let riskScore = 0;
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    // Check top 10% concentration
    if (distribution.concentration.top10Percent > 80) {
      riskScore += 30;
      riskFactors.push('Extremely high concentration in top 10% of holders');
      recommendations.push('Consider token distribution mechanisms to reduce concentration');
    } else if (distribution.concentration.top10Percent > 60) {
      riskScore += 15;
      riskFactors.push('High concentration in top 10% of holders');
    }

    // Check top 1% concentration
    if (distribution.concentration.top1Percent > 50) {
      riskScore += 25;
      riskFactors.push('Very high concentration in top 1% of holders');
      recommendations.push('High risk of price manipulation by whales');
    } else if (distribution.concentration.top1Percent > 30) {
      riskScore += 10;
      riskFactors.push('Moderate concentration in top 1% of holders');
    }

    // Check Gini coefficient
    if (distribution.concentration.giniCoefficient > 0.8) {
      riskScore += 20;
      riskFactors.push('Very high Gini coefficient indicates extreme inequality');
    } else if (distribution.concentration.giniCoefficient > 0.6) {
      riskScore += 10;
      riskFactors.push('High Gini coefficient indicates significant inequality');
    }

    // Check whale count
    if (distribution.whaleAddresses.length > 10) {
      riskScore += 10;
      riskFactors.push('Large number of whale addresses');
    }

    // Check holder count
    if (distribution.totalHolders < 100) {
      riskScore += 15;
      riskFactors.push('Low number of holders');
      recommendations.push('Token may lack sufficient distribution');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore >= 70) {
      riskLevel = 'critical';
    } else if (riskScore >= 50) {
      riskLevel = 'high';
    } else if (riskScore >= 30) {
      riskLevel = 'medium';
    }

    // Add general recommendations
    if (riskLevel !== 'low') {
      recommendations.push('Monitor whale movements closely');
      recommendations.push('Consider implementing vesting schedules for large holders');
    }

    return {
      tokenAddress: distribution.tokenAddress,
      tokenSymbol: distribution.tokenSymbol,
      riskLevel,
      riskFactors,
      recommendations,
      score: Math.min(100, riskScore),
    };
  }

  /**
   * Compare distributions
   */
  compareDistributions(
    dist1: HolderDistribution,
    dist2: HolderDistribution
  ): {
    concentrationDifference: number;
    holderCountDifference: number;
    giniDifference: number;
    moreDistributed: HolderDistribution;
  } {
    const concentrationDiff = dist1.concentration.top10Percent - dist2.concentration.top10Percent;
    const holderCountDiff = dist1.totalHolders - dist2.totalHolders;
    const giniDiff = dist1.concentration.giniCoefficient - dist2.concentration.giniCoefficient;
    const moreDistributed = dist1.concentration.giniCoefficient < dist2.concentration.giniCoefficient
      ? dist1
      : dist2;

    return {
      concentrationDifference: Math.round(concentrationDiff * 100) / 100,
      holderCountDifference: holderCountDiff,
      giniDifference: Math.round(giniDiff * 1000) / 1000,
      moreDistributed,
    };
  }
}

// Singleton instance
export const tokenDistributionAnalyzer = new TokenDistributionAnalyzer();

