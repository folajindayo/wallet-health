/**
 * Transaction Pattern Detector
 * Detects unusual transaction patterns that might indicate wallet compromise or suspicious activity
 */

export interface Transaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  gasUsed: number;
  gasPrice: string;
  status: 'success' | 'failed';
  chainId: number;
  method?: string;
  contractAddress?: string;
}

export interface TransactionPattern {
  type: 'unusual_time' | 'rapid_fire' | 'high_value' | 'new_recipient' | 'failed_cluster' | 'gas_anomaly' | 'contract_interaction_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  transactions: Transaction[];
  metadata: Record<string, any>;
  detectedAt: number;
}

export interface PatternAnalysis {
  patterns: TransactionPattern[];
  riskScore: number; // 0-100
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  summary: {
    totalTransactions: number;
    unusualPatterns: number;
    criticalPatterns: number;
    timeRange: { start: number; end: number };
  };
  recommendations: string[];
}

export class TransactionPatternDetector {
  /**
   * Analyze transactions for unusual patterns
   */
  analyzePatterns(
    transactions: Transaction[],
    walletAddress: string,
    options?: {
      timeWindowHours?: number;
      rapidFireThreshold?: number;
      highValueThreshold?: number;
      gasAnomalyThreshold?: number;
    }
  ): PatternAnalysis {
    const patterns: TransactionPattern[] = [];
    const timeWindowHours = options?.timeWindowHours || 24;
    const rapidFireThreshold = options?.rapidFireThreshold || 5;
    const highValueThreshold = options?.highValueThreshold || 10000; // USD equivalent
    const gasAnomalyThreshold = options?.gasAnomalyThreshold || 2; // 2x average

    if (transactions.length === 0) {
      return {
        patterns: [],
        riskScore: 0,
        riskLevel: 'safe',
        summary: {
          totalTransactions: 0,
          unusualPatterns: 0,
          criticalPatterns: 0,
          timeRange: { start: 0, end: 0 },
        },
        recommendations: [],
      };
    }

    // Sort transactions by timestamp
    const sortedTxns = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    const timeRange = {
      start: sortedTxns[0].timestamp,
      end: sortedTxns[sortedTxns.length - 1].timestamp,
    };

    // 1. Detect unusual time patterns (transactions at odd hours)
    const unusualTimePattern = this.detectUnusualTimePattern(sortedTxns);
    if (unusualTimePattern) patterns.push(unusualTimePattern);

    // 2. Detect rapid-fire transactions
    const rapidFirePattern = this.detectRapidFirePattern(sortedTxns, rapidFireThreshold);
    if (rapidFirePattern) patterns.push(rapidFirePattern);

    // 3. Detect high-value transactions
    const highValuePattern = this.detectHighValuePattern(sortedTxns, highValueThreshold);
    if (highValuePattern) patterns.push(highValuePattern);

    // 4. Detect new recipient patterns
    const newRecipientPattern = this.detectNewRecipientPattern(sortedTxns, walletAddress);
    if (newRecipientPattern) patterns.push(newRecipientPattern);

    // 5. Detect failed transaction clusters
    const failedClusterPattern = this.detectFailedClusterPattern(sortedTxns);
    if (failedClusterPattern) patterns.push(failedClusterPattern);

    // 6. Detect gas price anomalies
    const gasAnomalyPattern = this.detectGasAnomalyPattern(sortedTxns, gasAnomalyThreshold);
    if (gasAnomalyPattern) patterns.push(gasAnomalyPattern);

    // 7. Detect contract interaction spikes
    const contractSpikePattern = this.detectContractInteractionSpike(sortedTxns);
    if (contractSpikePattern) patterns.push(contractSpikePattern);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(patterns);
    const riskLevel = this.getRiskLevel(riskScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(patterns, riskLevel);

    const criticalPatterns = patterns.filter((p) => p.severity === 'critical').length;

    return {
      patterns,
      riskScore,
      riskLevel,
      summary: {
        totalTransactions: transactions.length,
        unusualPatterns: patterns.length,
        criticalPatterns,
        timeRange,
      },
      recommendations,
    };
  }

  /**
   * Detect transactions at unusual times (2 AM - 5 AM)
   */
  private detectUnusualTimePattern(transactions: Transaction[]): TransactionPattern | null {
    const unusualHours = [0, 1, 2, 3, 4, 5]; // 12 AM - 5 AM
    const unusualTxns = transactions.filter((tx) => {
      const hour = new Date(tx.timestamp).getHours();
      return unusualHours.includes(hour);
    });

    if (unusualTxns.length === 0) return null;

    const severity = unusualTxns.length > 3 ? 'medium' : 'low';

    return {
      type: 'unusual_time',
      severity,
      description: `Found ${unusualTxns.length} transaction(s) during unusual hours (12 AM - 5 AM)`,
      transactions: unusualTxns,
      metadata: {
        unusualCount: unusualTxns.length,
        hours: unusualTxns.map((tx) => new Date(tx.timestamp).getHours()),
      },
      detectedAt: Date.now(),
    };
  }

  /**
   * Detect rapid-fire transactions (many transactions in short time)
   */
  private detectRapidFirePattern(
    transactions: Transaction[],
    threshold: number
  ): TransactionPattern | null {
    const windowMs = 60 * 60 * 1000; // 1 hour window
    const clusters: Transaction[][] = [];
    let currentCluster: Transaction[] = [];

    for (let i = 0; i < transactions.length; i++) {
      if (currentCluster.length === 0) {
        currentCluster.push(transactions[i]);
      } else {
        const timeDiff = transactions[i].timestamp - currentCluster[0].timestamp;
        if (timeDiff <= windowMs) {
          currentCluster.push(transactions[i]);
        } else {
          if (currentCluster.length >= threshold) {
            clusters.push([...currentCluster]);
          }
          currentCluster = [transactions[i]];
        }
      }
    }

    if (currentCluster.length >= threshold) {
      clusters.push(currentCluster);
    }

    if (clusters.length === 0) return null;

    const largestCluster = clusters.sort((a, b) => b.length - a.length)[0];
    const severity =
      largestCluster.length >= 20 ? 'critical' : largestCluster.length >= 10 ? 'high' : 'medium';

    return {
      type: 'rapid_fire',
      severity,
      description: `Detected ${largestCluster.length} transactions within 1 hour`,
      transactions: largestCluster,
      metadata: {
        clusterCount: clusters.length,
        largestClusterSize: largestCluster.length,
        timeSpan: largestCluster[largestCluster.length - 1].timestamp - largestCluster[0].timestamp,
      },
      detectedAt: Date.now(),
    };
  }

  /**
   * Detect high-value transactions
   */
  private detectHighValuePattern(
    transactions: Transaction[],
    threshold: number
  ): TransactionPattern | null {
    // Note: This assumes value is in wei. In production, convert to USD using price feeds
    const highValueTxns = transactions.filter((tx) => {
      const valueEth = parseFloat(tx.value) / 1e18;
      // Rough estimate: assume 1 ETH = $2000 for threshold calculation
      return valueEth * 2000 >= threshold;
    });

    if (highValueTxns.length === 0) return null;

    const totalValue = highValueTxns.reduce(
      (sum, tx) => sum + parseFloat(tx.value) / 1e18,
      0
    );
    const severity = totalValue * 2000 >= threshold * 10 ? 'critical' : 'high';

    return {
      type: 'high_value',
      severity,
      description: `Found ${highValueTxns.length} high-value transaction(s) exceeding $${threshold}`,
      transactions: highValueTxns,
      metadata: {
        count: highValueTxns.length,
        totalValueEth: totalValue,
        estimatedValueUSD: totalValue * 2000,
      },
      detectedAt: Date.now(),
    };
  }

  /**
   * Detect transactions to new/unusual recipients
   */
  private detectNewRecipientPattern(
    transactions: Transaction[],
    walletAddress: string
  ): TransactionPattern | null {
    const recipientCounts: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.to.toLowerCase() !== walletAddress.toLowerCase()) {
        recipientCounts[tx.to.toLowerCase()] = (recipientCounts[tx.to.toLowerCase()] || 0) + 1;
      }
    });

    // Find recipients that appear only once (new recipients)
    const newRecipients = Object.entries(recipientCounts)
      .filter(([_, count]) => count === 1)
      .map(([address]) => address);

    if (newRecipients.length === 0) return null;

    const newRecipientTxns = transactions.filter((tx) =>
      newRecipients.includes(tx.to.toLowerCase())
    );

    const severity =
      newRecipients.length >= 10 ? 'high' : newRecipients.length >= 5 ? 'medium' : 'low';

    return {
      type: 'new_recipient',
      severity,
      description: `Found ${newRecipients.length} transaction(s) to new recipients`,
      transactions: newRecipientTxns,
      metadata: {
        newRecipientCount: newRecipients.length,
        recipients: newRecipients,
      },
      detectedAt: Date.now(),
    };
  }

  /**
   * Detect clusters of failed transactions
   */
  private detectFailedClusterPattern(transactions: Transaction[]): TransactionPattern | null {
    const failedTxns = transactions.filter((tx) => tx.status === 'failed');
    if (failedTxns.length < 3) return null;

    // Check if failures are clustered in time
    const sortedFailed = failedTxns.sort((a, b) => a.timestamp - b.timestamp);
    const windowMs = 30 * 60 * 1000; // 30 minutes
    const clusters: Transaction[][] = [];
    let currentCluster: Transaction[] = [];

    for (let i = 0; i < sortedFailed.length; i++) {
      if (currentCluster.length === 0) {
        currentCluster.push(sortedFailed[i]);
      } else {
        const timeDiff = sortedFailed[i].timestamp - currentCluster[0].timestamp;
        if (timeDiff <= windowMs) {
          currentCluster.push(sortedFailed[i]);
        } else {
          if (currentCluster.length >= 3) {
            clusters.push([...currentCluster]);
          }
          currentCluster = [sortedFailed[i]];
        }
      }
    }

    if (currentCluster.length >= 3) {
      clusters.push(currentCluster);
    }

    if (clusters.length === 0) return null;

    const largestCluster = clusters.sort((a, b) => b.length - a.length)[0];
    const severity = largestCluster.length >= 10 ? 'high' : 'medium';

    return {
      type: 'failed_cluster',
      severity,
      description: `Detected cluster of ${largestCluster.length} failed transactions`,
      transactions: largestCluster,
      metadata: {
        clusterCount: clusters.length,
        largestClusterSize: largestCluster.length,
        totalFailed: failedTxns.length,
      },
      detectedAt: Date.now(),
    };
  }

  /**
   * Detect gas price anomalies
   */
  private detectGasAnomalyPattern(
    transactions: Transaction[],
    threshold: number
  ): TransactionPattern | null {
    const gasPrices = transactions
      .map((tx) => parseFloat(tx.gasPrice))
      .filter((price) => price > 0);
    if (gasPrices.length === 0) return null;

    const avgGasPrice = gasPrices.reduce((sum, p) => sum + p, 0) / gasPrices.length;
    const thresholdPrice = avgGasPrice * threshold;

    const anomalyTxns = transactions.filter(
      (tx) => parseFloat(tx.gasPrice) > thresholdPrice || parseFloat(tx.gasPrice) < avgGasPrice / threshold
    );

    if (anomalyTxns.length === 0) return null;

    return {
      type: 'gas_anomaly',
      severity: 'low',
      description: `Found ${anomalyTxns.length} transaction(s) with unusual gas prices`,
      transactions: anomalyTxns,
      metadata: {
        averageGasPrice: avgGasPrice,
        anomalyCount: anomalyTxns.length,
      },
      detectedAt: Date.now(),
    };
  }

  /**
   * Detect spikes in contract interactions
   */
  private detectContractInteractionSpike(transactions: Transaction[]): TransactionPattern | null {
    const contractTxns = transactions.filter((tx) => tx.contractAddress || tx.method);
    if (contractTxns.length < 5) return null;

    // Group by hour
    const hourlyCounts: Record<number, number> = {};
    contractTxns.forEach((tx) => {
      const hour = Math.floor(tx.timestamp / (60 * 60 * 1000));
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    const counts = Object.values(hourlyCounts);
    const avgCount = counts.reduce((sum, c) => sum + c, 0) / counts.length;
    const threshold = avgCount * 3; // 3x average

    const spikeHours = Object.entries(hourlyCounts)
      .filter(([_, count]) => count >= threshold)
      .map(([hour]) => parseInt(hour));

    if (spikeHours.length === 0) return null;

    const spikeTxns = contractTxns.filter((tx) => {
      const hour = Math.floor(tx.timestamp / (60 * 60 * 1000));
      return spikeHours.includes(hour);
    });

    const severity = spikeTxns.length >= 20 ? 'high' : 'medium';

    return {
      type: 'contract_interaction_spike',
      severity,
      description: `Detected spike of ${spikeTxns.length} contract interactions`,
      transactions: spikeTxns,
      metadata: {
        spikeHours,
        averageHourlyInteractions: avgCount,
        spikeInteractions: spikeTxns.length,
      },
      detectedAt: Date.now(),
    };
  }

  /**
   * Calculate overall risk score based on patterns
   */
  private calculateRiskScore(patterns: TransactionPattern[]): number {
    if (patterns.length === 0) return 0;

    let score = 0;
    const weights: Record<string, Record<string, number>> = {
      unusual_time: { low: 5, medium: 10, high: 0, critical: 0 },
      rapid_fire: { low: 0, medium: 15, high: 25, critical: 40 },
      high_value: { low: 0, medium: 0, high: 20, critical: 35 },
      new_recipient: { low: 5, medium: 10, high: 15, critical: 0 },
      failed_cluster: { low: 0, medium: 10, high: 20, critical: 0 },
      gas_anomaly: { low: 3, medium: 0, high: 0, critical: 0 },
      contract_interaction_spike: { low: 0, medium: 10, high: 15, critical: 0 },
    };

    patterns.forEach((pattern) => {
      const weight = weights[pattern.type]?.[pattern.severity] || 0;
      score += weight;
    });

    return Math.min(100, score);
  }

  /**
   * Get risk level from score
   */
  private getRiskLevel(score: number): PatternAnalysis['riskLevel'] {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    if (score >= 10) return 'low';
    return 'safe';
  }

  /**
   * Generate recommendations based on detected patterns
   */
  private generateRecommendations(
    patterns: TransactionPattern[],
    riskLevel: PatternAnalysis['riskLevel']
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Review all recent transactions immediately');
      recommendations.push('Consider revoking token approvals if suspicious activity detected');
      recommendations.push('Check for unauthorized access to your wallet');
    }

    patterns.forEach((pattern) => {
      switch (pattern.type) {
        case 'rapid_fire':
          recommendations.push('Multiple rapid transactions detected - verify all were intentional');
          break;
        case 'high_value':
          recommendations.push('High-value transactions detected - double-check recipient addresses');
          break;
        case 'new_recipient':
          recommendations.push('Transactions to new recipients detected - verify addresses are correct');
          break;
        case 'failed_cluster':
          recommendations.push('Multiple failed transactions - check for potential issues or attacks');
          break;
        case 'contract_interaction_spike':
          recommendations.push('Unusual spike in contract interactions - review for suspicious contracts');
          break;
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

// Singleton instance
export const transactionPatternDetector = new TransactionPatternDetector();

