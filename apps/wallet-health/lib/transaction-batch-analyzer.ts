/**
 * Transaction Batch Analyzer
 * Analyzes multiple transactions together to identify patterns and risks
 */

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  chainId: number;
  status: 'success' | 'failed' | 'pending';
  gasUsed?: number;
  gasPrice?: string;
  data?: string;
  tokenTransfers?: Array<{
    token: string;
    from: string;
    to: string;
    value: string;
  }>;
}

export interface BatchAnalysis {
  transactions: Transaction[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    totalValue: string;
    totalValueUSD?: number;
    totalGasUsed: number;
    totalGasCost: string;
    totalGasCostUSD?: number;
    timeRange: {
      start: number;
      end: number;
      duration: number; // in seconds
    };
  };
  patterns: {
    frequentRecipients: Array<{ address: string; count: number; totalValue: string }>;
    frequentTokens: Array<{ token: string; count: number; totalValue: string }>;
    timePatterns: {
      mostActiveHour: number;
      mostActiveDay: number;
      averageTimeBetween: number;
    };
    valuePatterns: {
      averageValue: string;
      medianValue: string;
      largestTransaction: Transaction;
      smallestTransaction: Transaction;
    };
  };
  risks: Array<{
    type: 'suspicious_pattern' | 'high_value' | 'failed_transactions' | 'rapid_fire' | 'unknown_contract';
    severity: 'high' | 'medium' | 'low';
    description: string;
    affectedTransactions: string[];
  }>;
  recommendations: string[];
}

export class TransactionBatchAnalyzer {
  /**
   * Analyze a batch of transactions
   */
  analyzeBatch(transactions: Transaction[]): BatchAnalysis {
    if (transactions.length === 0) {
      throw new Error('No transactions provided');
    }

    // Sort by timestamp
    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);

    // Calculate summary
    const summary = this.calculateSummary(sorted);

    // Identify patterns
    const patterns = this.identifyPatterns(sorted);

    // Detect risks
    const risks = this.detectRisks(sorted);

    // Generate recommendations
    const recommendations = this.generateRecommendations(summary, patterns, risks);

    return {
      transactions: sorted,
      summary,
      patterns,
      risks,
      recommendations,
    };
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(transactions: Transaction[]): BatchAnalysis['summary'] {
    const successful = transactions.filter(t => t.status === 'success').length;
    const failed = transactions.filter(t => t.status === 'failed').length;
    const pending = transactions.filter(t => t.status === 'pending').length;

    const totalValue = transactions.reduce(
      (sum, tx) => sum + BigInt(tx.value || '0'),
      BigInt(0)
    ).toString();

    const totalGasUsed = transactions.reduce(
      (sum, tx) => sum + (tx.gasUsed || 0),
      0
    );

    const totalGasCost = transactions.reduce((sum, tx) => {
      if (tx.gasUsed && tx.gasPrice) {
        return sum + BigInt(tx.gasUsed) * BigInt(tx.gasPrice);
      }
      return sum;
    }, BigInt(0)).toString();

    const timestamps = transactions.map(t => t.timestamp);
    const start = Math.min(...timestamps);
    const end = Math.max(...timestamps);
    const duration = end - start;

    return {
      total: transactions.length,
      successful,
      failed,
      pending,
      totalValue,
      totalGasUsed,
      totalGasCost,
      timeRange: {
        start,
        end,
        duration,
      },
    };
  }

  /**
   * Identify patterns in transactions
   */
  private identifyPatterns(transactions: Transaction[]): BatchAnalysis['patterns'] {
    // Frequent recipients
    const recipientCounts = new Map<string, { count: number; totalValue: bigint }>();
    transactions.forEach(tx => {
      const recipient = tx.to.toLowerCase();
      const existing = recipientCounts.get(recipient) || { count: 0, totalValue: BigInt(0) };
      recipientCounts.set(recipient, {
        count: existing.count + 1,
        totalValue: existing.totalValue + BigInt(tx.value || '0'),
      });
    });

    const frequentRecipients = Array.from(recipientCounts.entries())
      .map(([address, data]) => ({
        address,
        count: data.count,
        totalValue: data.totalValue.toString(),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Frequent tokens
    const tokenCounts = new Map<string, { count: number; totalValue: bigint }>();
    transactions.forEach(tx => {
      if (tx.tokenTransfers) {
        tx.tokenTransfers.forEach(transfer => {
          const token = transfer.token.toLowerCase();
          const existing = tokenCounts.get(token) || { count: 0, totalValue: BigInt(0) };
          tokenCounts.set(token, {
            count: existing.count + 1,
            totalValue: existing.totalValue + BigInt(transfer.value),
          });
        });
      }
    });

    const frequentTokens = Array.from(tokenCounts.entries())
      .map(([token, data]) => ({
        token,
        count: data.count,
        totalValue: data.totalValue.toString(),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Time patterns
    const hours = transactions.map(tx => new Date(tx.timestamp * 1000).getHours());
    const days = transactions.map(tx => new Date(tx.timestamp * 1000).getDay());

    const hourCounts = new Map<number, number>();
    hours.forEach(h => hourCounts.set(h, (hourCounts.get(h) || 0) + 1));
    const mostActiveHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

    const dayCounts = new Map<number, number>();
    days.forEach(d => dayCounts.set(d, (dayCounts.get(d) || 0) + 1));
    const mostActiveDay = Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

    // Average time between transactions
    const timeDiffs: number[] = [];
    for (let i = 1; i < transactions.length; i++) {
      timeDiffs.push(transactions[i].timestamp - transactions[i - 1].timestamp);
    }
    const averageTimeBetween =
      timeDiffs.length > 0
        ? timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length
        : 0;

    // Value patterns
    const values = transactions
      .map(tx => BigInt(tx.value || '0'))
      .sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });

    const averageValue =
      values.length > 0
        ? values.reduce((sum, val) => sum + val, BigInt(0)) / BigInt(values.length)
        : BigInt(0);

    const medianIndex = Math.floor(values.length / 2);
    const medianValue = values.length > 0 ? values[medianIndex] : BigInt(0);

    const largestTransaction = transactions.reduce((max, tx) => {
      const txValue = BigInt(tx.value || '0');
      const maxValue = BigInt(max.value || '0');
      return txValue > maxValue ? tx : max;
    }, transactions[0]);

    const smallestTransaction = transactions.reduce((min, tx) => {
      const txValue = BigInt(tx.value || '0');
      const minValue = BigInt(min.value || '0');
      return txValue < minValue ? tx : min;
    }, transactions[0]);

    return {
      frequentRecipients,
      frequentTokens,
      timePatterns: {
        mostActiveHour,
        mostActiveDay,
        averageTimeBetween: Math.round(averageTimeBetween),
      },
      valuePatterns: {
        averageValue: averageValue.toString(),
        medianValue: medianValue.toString(),
        largestTransaction,
        smallestTransaction,
      },
    };
  }

  /**
   * Detect risks in transaction batch
   */
  private detectRisks(transactions: Transaction[]): BatchAnalysis['risks'] {
    const risks: BatchAnalysis['risks'] = [];

    // Rapid-fire transactions
    const rapidFireThreshold = 60; // seconds
    for (let i = 1; i < transactions.length; i++) {
      const timeDiff = transactions[i].timestamp - transactions[i - 1].timestamp;
      if (timeDiff < rapidFireThreshold) {
        risks.push({
          type: 'rapid_fire',
          severity: 'medium',
          description: `Rapid-fire transactions detected (${timeDiff}s apart)`,
          affectedTransactions: [transactions[i - 1].hash, transactions[i].hash],
        });
      }
    }

    // High-value transactions
    const highValueThreshold = BigInt('10000000000000000000'); // 10 ETH
    const highValueTxs = transactions.filter(
      tx => BigInt(tx.value || '0') > highValueThreshold
    );
    if (highValueTxs.length > 0) {
      risks.push({
        type: 'high_value',
        severity: 'high',
        description: `${highValueTxs.length} high-value transaction(s) detected`,
        affectedTransactions: highValueTxs.map(tx => tx.hash),
      });
    }

    // Failed transactions
    const failedTxs = transactions.filter(tx => tx.status === 'failed');
    if (failedTxs.length > transactions.length * 0.1) {
      risks.push({
        type: 'failed_transactions',
        severity: 'medium',
        description: `High failure rate: ${failedTxs.length}/${transactions.length} transactions failed`,
        affectedTransactions: failedTxs.map(tx => tx.hash),
      });
    }

    // Suspicious patterns (same recipient multiple times quickly)
    const recipientGroups = new Map<string, Transaction[]>();
    transactions.forEach(tx => {
      const recipient = tx.to.toLowerCase();
      if (!recipientGroups.has(recipient)) {
        recipientGroups.set(recipient, []);
      }
      recipientGroups.get(recipient)!.push(tx);
    });

    recipientGroups.forEach((txs, recipient) => {
      if (txs.length >= 5) {
        const timeSpan = txs[txs.length - 1].timestamp - txs[0].timestamp;
        if (timeSpan < 3600) {
          // 5+ transactions to same address within 1 hour
          risks.push({
            type: 'suspicious_pattern',
            severity: 'high',
            description: `Suspicious pattern: ${txs.length} transactions to same address in ${Math.round(timeSpan / 60)} minutes`,
            affectedTransactions: txs.map(tx => tx.hash),
          });
        }
      }
    });

    return risks;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    summary: BatchAnalysis['summary'],
    patterns: BatchAnalysis['patterns'],
    risks: BatchAnalysis['risks']
  ): string[] {
    const recommendations: string[] = [];

    if (risks.length > 0) {
      recommendations.push('Review flagged transactions for potential security concerns');
    }

    if (summary.failed > summary.total * 0.1) {
      recommendations.push('High transaction failure rate - check network conditions and gas settings');
    }

    if (patterns.frequentRecipients.length > 0) {
      const topRecipient = patterns.frequentRecipients[0];
      if (topRecipient.count > 10) {
        recommendations.push(
          `Consider adding ${topRecipient.address} to your address book (used ${topRecipient.count} times)`
        );
      }
    }

    if (summary.totalGasCost) {
      const gasCostEth = parseFloat(summary.totalGasCost) / 1e18;
      if (gasCostEth > 0.1) {
        recommendations.push(`Total gas costs: ${gasCostEth.toFixed(4)} ETH - consider batching transactions`);
      }
    }

    return recommendations;
  }

  /**
   * Compare two transaction batches
   */
  compareBatches(
    batch1: Transaction[],
    batch2: Transaction[]
  ): {
    differences: {
      totalDifference: number;
      valueDifference: string;
      gasDifference: number;
    };
    commonRecipients: string[];
    uniqueToBatch1: string[];
    uniqueToBatch2: string[];
  } {
    const analysis1 = this.analyzeBatch(batch1);
    const analysis2 = this.analyzeBatch(batch2);

    const recipients1 = new Set(batch1.map(tx => tx.to.toLowerCase()));
    const recipients2 = new Set(batch2.map(tx => tx.to.toLowerCase()));

    const commonRecipients = Array.from(recipients1).filter(r => recipients2.has(r));
    const uniqueToBatch1 = Array.from(recipients1).filter(r => !recipients2.has(r));
    const uniqueToBatch2 = Array.from(recipients2).filter(r => !recipients1.has(r));

    return {
      differences: {
        totalDifference: analysis2.summary.total - analysis1.summary.total,
        valueDifference: (
          BigInt(analysis2.summary.totalValue) - BigInt(analysis1.summary.totalValue)
        ).toString(),
        gasDifference: analysis2.summary.totalGasUsed - analysis1.summary.totalGasUsed,
      },
      commonRecipients,
      uniqueToBatch1,
      uniqueToBatch2,
    };
  }
}

// Singleton instance
export const transactionBatchAnalyzer = new TransactionBatchAnalyzer();
