/**
 * Wallet Activity Analyzer Utility
 * Deep analysis of wallet activity patterns and behaviors
 */

export interface ActivityPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'irregular';
  description: string;
  frequency: number; // transactions per period
  confidence: number; // 0-100
  timeOfDay?: number; // hour (0-23)
  dayOfWeek?: number; // 0-6 (Sunday = 0)
}

export interface ActivityAnalysis {
  walletAddress: string;
  analysisPeriod: {
    start: number;
    end: number;
    days: number;
  };
  summary: {
    totalTransactions: number;
    totalValue: string;
    averageTransactionValue: string;
    mostActiveDay: string;
    mostActiveHour: number;
    averageTransactionsPerDay: number;
  };
  patterns: ActivityPattern[];
  behaviors: {
    isActiveTrader: boolean;
    isDeFiUser: boolean;
    isNFTCollector: boolean;
    isStaker: boolean;
    isGovernanceParticipant: boolean;
  };
  riskIndicators: {
    rapidTransactions: number;
    largeTransfers: number;
    suspiciousContracts: number;
    failedTransactions: number;
  };
  recommendations: string[];
}

export interface Transaction {
  hash: string;
  timestamp: number;
  value: string;
  to: string;
  from: string;
  method?: string;
  contractAddress?: string;
  status: 'success' | 'failed';
  gasUsed?: number;
}

export class WalletActivityAnalyzer {
  /**
   * Analyze wallet activity
   */
  analyzeActivity(
    walletAddress: string,
    transactions: Transaction[],
    periodDays?: number
  ): ActivityAnalysis {
    if (transactions.length === 0) {
      throw new Error('No transactions provided');
    }

    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    const start = sorted[0].timestamp;
    const end = sorted[sorted.length - 1].timestamp;
    const actualDays = (end - start) / (24 * 60 * 60 * 1000);
    const analysisDays = periodDays || Math.ceil(actualDays);

    const summary = this.calculateSummary(walletAddress, sorted, analysisDays);
    const patterns = this.detectPatterns(sorted);
    const behaviors = this.analyzeBehaviors(sorted);
    const riskIndicators = this.identifyRiskIndicators(sorted);
    const recommendations = this.generateRecommendations(summary, patterns, behaviors, riskIndicators);

    return {
      walletAddress,
      analysisPeriod: {
        start,
        end,
        days: analysisDays,
      },
      summary,
      patterns,
      behaviors,
      riskIndicators,
      recommendations,
    };
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(
    walletAddress: string,
    transactions: Transaction[],
    days: number
  ): ActivityAnalysis['summary'] {
    const totalValue = transactions.reduce(
      (sum, tx) => sum + BigInt(tx.value || '0'),
      BigInt(0)
    );

    const averageValue = transactions.length > 0
      ? totalValue / BigInt(transactions.length)
      : BigInt(0);

    // Most active day
    const dayCounts = new Map<string, number>();
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      const dayKey = date.toLocaleDateString();
      dayCounts.set(dayKey, (dayCounts.get(dayKey) || 0) + 1);
    });

    let mostActiveDay = '';
    let maxCount = 0;
    dayCounts.forEach((count, day) => {
      if (count > maxCount) {
        maxCount = count;
        mostActiveDay = day;
      }
    });

    // Most active hour
    const hourCounts = new Map<number, number>();
    transactions.forEach(tx => {
      const hour = new Date(tx.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    let mostActiveHour = 0;
    let maxHourCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxHourCount) {
        maxHourCount = count;
        mostActiveHour = hour;
      }
    });

    const averageTransactionsPerDay = transactions.length / days;

    return {
      totalTransactions: transactions.length,
      totalValue: totalValue.toString(),
      averageTransactionValue: averageValue.toString(),
      mostActiveDay,
      mostActiveHour,
      averageTransactionsPerDay: Math.round(averageTransactionsPerDay * 100) / 100,
    };
  }

  /**
   * Detect activity patterns
   */
  private detectPatterns(transactions: Transaction[]): ActivityPattern[] {
    const patterns: ActivityPattern[] = [];

    // Daily pattern
    const hourlyDistribution = new Map<number, number>();
    transactions.forEach(tx => {
      const hour = new Date(tx.timestamp).getHours();
      hourlyDistribution.set(hour, (hourlyDistribution.get(hour) || 0) + 1);
    });

    if (hourlyDistribution.size > 0) {
      const maxHour = Array.from(hourlyDistribution.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      if (maxHour !== undefined) {
        patterns.push({
          type: 'daily',
          description: `Most active around ${maxHour}:00`,
          frequency: hourlyDistribution.get(maxHour) || 0,
          confidence: 70,
          timeOfDay: maxHour,
        });
      }
    }

    // Weekly pattern
    const dayOfWeekCounts = new Map<number, number>();
    transactions.forEach(tx => {
      const dayOfWeek = new Date(tx.timestamp).getDay();
      dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) || 0) + 1);
    });

    if (dayOfWeekCounts.size > 0) {
      const maxDay = Array.from(dayOfWeekCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      if (maxDay !== undefined) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        patterns.push({
          type: 'weekly',
          description: `Most active on ${dayNames[maxDay]}`,
          frequency: dayOfWeekCounts.get(maxDay) || 0,
          confidence: 60,
          dayOfWeek: maxDay,
        });
      }
    }

    // Transaction frequency pattern
    const days = (transactions[transactions.length - 1].timestamp - transactions[0].timestamp) / (24 * 60 * 60 * 1000);
    const transactionsPerDay = transactions.length / days;

    if (transactionsPerDay > 10) {
      patterns.push({
        type: 'daily',
        description: 'High-frequency trading pattern',
        frequency: transactionsPerDay,
        confidence: 85,
      });
    } else if (transactionsPerDay < 0.1) {
      patterns.push({
        type: 'irregular',
        description: 'Low-frequency, irregular activity',
        frequency: transactionsPerDay,
        confidence: 80,
      });
    }

    return patterns;
  }

  /**
   * Analyze wallet behaviors
   */
  private analyzeBehaviors(transactions: Transaction[]): ActivityAnalysis['behaviors'] {
    const contractInteractions = transactions.filter(tx => tx.contractAddress).length;
    const contractRatio = contractInteractions / transactions.length;

    // DeFi user (high contract interactions)
    const isDeFiUser = contractRatio > 0.5;

    // NFT collector (would need to check for NFT transfer methods)
    const isNFTCollector = transactions.some(tx => 
      tx.method?.includes('transfer') && tx.contractAddress
    );

    // Active trader (high frequency)
    const days = (transactions[transactions.length - 1].timestamp - transactions[0].timestamp) / (24 * 60 * 60 * 1000);
    const isActiveTrader = transactions.length / days > 5;

    // Staker (would need to check for staking contract interactions)
    const isStaker = transactions.some(tx =>
      tx.method?.includes('stake') || tx.method?.includes('deposit')
    );

    // Governance participant (would need to check for voting methods)
    const isGovernanceParticipant = transactions.some(tx =>
      tx.method?.includes('vote') || tx.method?.includes('propose')
    );

    return {
      isActiveTrader,
      isDeFiUser,
      isNFTCollector,
      isStaker,
      isGovernanceParticipant,
    };
  }

  /**
   * Identify risk indicators
   */
  private identifyRiskIndicators(transactions: Transaction[]): ActivityAnalysis['riskIndicators'] {
    // Rapid transactions (multiple in short time)
    let rapidTransactions = 0;
    for (let i = 1; i < transactions.length; i++) {
      const timeDiff = transactions[i].timestamp - transactions[i - 1].timestamp;
      if (timeDiff < 60000) { // Less than 1 minute
        rapidTransactions++;
      }
    }

    // Large transfers (over 10 ETH equivalent)
    const largeThreshold = BigInt('10000000000000000000'); // 10 ETH
    const largeTransfers = transactions.filter(tx =>
      BigInt(tx.value || '0') > largeThreshold
    ).length;

    // Suspicious contracts (unverified, new, etc.)
    // This would need contract verification data
    const suspiciousContracts = 0; // Placeholder

    // Failed transactions
    const failedTransactions = transactions.filter(tx => tx.status === 'failed').length;

    return {
      rapidTransactions,
      largeTransfers,
      suspiciousContracts,
      failedTransactions,
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    summary: ActivityAnalysis['summary'],
    patterns: ActivityPattern[],
    behaviors: ActivityAnalysis['behaviors'],
    riskIndicators: ActivityAnalysis['riskIndicators']
  ): string[] {
    const recommendations: string[] = [];

    if (riskIndicators.rapidTransactions > 10) {
      recommendations.push('High number of rapid transactions detected - consider batching to save gas');
    }

    if (riskIndicators.failedTransactions > summary.totalTransactions * 0.1) {
      recommendations.push('High transaction failure rate - review gas settings and network conditions');
    }

    if (riskIndicators.largeTransfers > 0) {
      recommendations.push('Large transfers detected - ensure you recognize all transactions');
    }

    if (behaviors.isDeFiUser) {
      recommendations.push('Active DeFi user detected - regularly review token approvals');
    }

    if (summary.averageTransactionsPerDay > 10) {
      recommendations.push('High transaction frequency - consider using gas optimization tools');
    }

    return recommendations;
  }

  /**
   * Compare activity between two wallets
   */
  compareActivity(
    analysis1: ActivityAnalysis,
    analysis2: ActivityAnalysis
  ): {
    similarity: number; // 0-100
    differences: string[];
  } {
    const differences: string[] = [];
    let similarity = 100;

    // Compare transaction frequency
    const freqDiff = Math.abs(
      analysis1.summary.averageTransactionsPerDay - analysis2.summary.averageTransactionsPerDay
    );
    if (freqDiff > 5) {
      differences.push(`Transaction frequency differs by ${freqDiff.toFixed(2)} tx/day`);
      similarity -= 20;
    }

    // Compare behaviors
    const behaviorKeys: (keyof ActivityAnalysis['behaviors'])[] = [
      'isActiveTrader', 'isDeFiUser', 'isNFTCollector', 'isStaker', 'isGovernanceParticipant'
    ];

    behaviorKeys.forEach(key => {
      if (analysis1.behaviors[key] !== analysis2.behaviors[key]) {
        differences.push(`Behavior difference: ${key}`);
        similarity -= 10;
      }
    });

    // Compare most active hour
    const hourDiff = Math.abs(analysis1.summary.mostActiveHour - analysis2.summary.mostActiveHour);
    if (hourDiff > 4) {
      differences.push(`Most active hour differs by ${hourDiff} hours`);
      similarity -= 15;
    }

    return {
      similarity: Math.max(0, similarity),
      differences,
    };
  }
}

// Singleton instance
export const walletActivityAnalyzer = new WalletActivityAnalyzer();

