/**
 * Transaction Batch Analyzer Utility
 * Analyze multiple transactions at once for patterns and risks
 */

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: number;
  chainId: number;
  status: 'success' | 'failed' | 'pending';
  method?: string;
  contractAddress?: string;
}

export interface BatchAnalysisResult {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalGasUsed: number;
  totalGasCost: number;
  totalValue: string;
  averageGasPrice: number;
  riskScore: number;
  riskLevel: 'safe' | 'moderate' | 'critical';
  patterns: TransactionPattern[];
  anomalies: TransactionAnomaly[];
  recommendations: string[];
  timeDistribution: {
    hour: number;
    count: number;
  }[];
  contractInteractions: {
    address: string;
    count: number;
    totalValue: string;
  }[];
}

export interface TransactionPattern {
  type: 'recurring' | 'batch' | 'rapid' | 'large-value' | 'suspicious';
  description: string;
  transactions: string[]; // transaction hashes
  severity: 'low' | 'medium' | 'high';
}

export interface TransactionAnomaly {
  type: 'unusual-gas' | 'failed-transaction' | 'suspicious-contract' | 'large-transfer' | 'rapid-succession';
  description: string;
  transaction: string; // transaction hash
  severity: 'low' | 'medium' | 'high';
  details?: Record<string, unknown>;
}

export class TransactionBatchAnalyzer {
  /**
   * Analyze batch of transactions
   */
  analyzeBatch(transactions: Transaction[]): BatchAnalysisResult {
    if (transactions.length === 0) {
      return this.getEmptyResult();
    }

    const successful = transactions.filter(tx => tx.status === 'success');
    const failed = transactions.filter(tx => tx.status === 'failed');
    
    const totalGasUsed = transactions.reduce(
      (sum, tx) => sum + BigInt(tx.gasUsed || '0'),
      BigInt(0)
    );

    const totalGasCost = transactions.reduce(
      (sum, tx) => {
        const gasUsed = BigInt(tx.gasUsed || '0');
        const gasPrice = BigInt(tx.gasPrice || '0');
        return sum + (gasUsed * gasPrice);
      },
      BigInt(0)
    );

    const totalValue = transactions.reduce(
      (sum, tx) => sum + BigInt(tx.value || '0'),
      BigInt(0)
    );

    const averageGasPrice = transactions.reduce(
      (sum, tx) => sum + parseFloat(tx.gasPrice || '0'),
      0
    ) / transactions.length;

    const patterns = this.detectPatterns(transactions);
    const anomalies = this.detectAnomalies(transactions);
    const riskScore = this.calculateRiskScore(transactions, patterns, anomalies);
    const riskLevel = this.getRiskLevel(riskScore);

    const timeDistribution = this.analyzeTimeDistribution(transactions);
    const contractInteractions = this.analyzeContractInteractions(transactions);
    const recommendations = this.generateRecommendations(transactions, patterns, anomalies);

    return {
      totalTransactions: transactions.length,
      successfulTransactions: successful.length,
      failedTransactions: failed.length,
      totalGasUsed: Number(totalGasUsed),
      totalGasCost: Number(totalGasCost) / 1e18, // Convert to ETH
      totalValue: totalValue.toString(),
      averageGasPrice,
      riskScore,
      riskLevel,
      patterns,
      anomalies,
      recommendations,
      timeDistribution,
      contractInteractions,
    };
  }

  /**
   * Detect transaction patterns
   */
  private detectPatterns(transactions: Transaction[]): TransactionPattern[] {
    const patterns: TransactionPattern[] = [];

    // Detect recurring transactions (same contract, similar value)
    const contractGroups = new Map<string, Transaction[]>();
    transactions.forEach(tx => {
      if (tx.contractAddress) {
        const key = tx.contractAddress.toLowerCase();
        if (!contractGroups.has(key)) {
          contractGroups.set(key, []);
        }
        contractGroups.get(key)!.push(tx);
      }
    });

    contractGroups.forEach((txs, contract) => {
      if (txs.length >= 5) {
        patterns.push({
          type: 'recurring',
          description: `Recurring interactions with contract ${contract.slice(0, 10)}...`,
          transactions: txs.map(tx => tx.hash),
          severity: 'low',
        });
      }
    });

    // Detect rapid transactions (multiple in short time)
    const sortedByTime = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 0; i < sortedByTime.length - 1; i++) {
      const timeDiff = sortedByTime[i + 1].timestamp - sortedByTime[i].timestamp;
      if (timeDiff < 60000) { // Less than 1 minute
        const rapidTxs = sortedByTime.slice(i, i + 2);
        patterns.push({
          type: 'rapid',
          description: 'Rapid succession of transactions',
          transactions: rapidTxs.map(tx => tx.hash),
          severity: 'medium',
        });
        break;
      }
    }

    // Detect large value transactions
    const largeValueThreshold = BigInt('1000000000000000000000'); // 1000 ETH
    const largeTxs = transactions.filter(tx => BigInt(tx.value || '0') > largeValueThreshold);
    if (largeTxs.length > 0) {
      patterns.push({
        type: 'large-value',
        description: `${largeTxs.length} large value transaction(s) detected`,
        transactions: largeTxs.map(tx => tx.hash),
        severity: 'high',
      });
    }

    return patterns;
  }

  /**
   * Detect transaction anomalies
   */
  private detectAnomalies(transactions: Transaction[]): TransactionAnomaly[] {
    const anomalies: TransactionAnomaly[] = [];

    // Detect failed transactions
    const failedTxs = transactions.filter(tx => tx.status === 'failed');
    failedTxs.forEach(tx => {
      anomalies.push({
        type: 'failed-transaction',
        description: 'Transaction failed',
        transaction: tx.hash,
        severity: 'medium',
      });
    });

    // Detect unusual gas usage
    const gasUsages = transactions
      .map(tx => parseFloat(tx.gasUsed || '0'))
      .filter(gas => gas > 0);
    
    if (gasUsages.length > 0) {
      const avgGas = gasUsages.reduce((sum, gas) => sum + gas, 0) / gasUsages.length;
      const threshold = avgGas * 2;

      transactions.forEach(tx => {
        const gasUsed = parseFloat(tx.gasUsed || '0');
        if (gasUsed > threshold && gasUsed > 500000) {
          anomalies.push({
            type: 'unusual-gas',
            description: `Unusually high gas usage: ${gasUsed.toLocaleString()}`,
            transaction: tx.hash,
            severity: 'low',
            details: { gasUsed, averageGas: avgGas },
          });
        }
      });
    }

    // Detect large transfers
    const largeValueThreshold = BigInt('1000000000000000000000'); // 1000 ETH
    transactions.forEach(tx => {
      const value = BigInt(tx.value || '0');
      if (value > largeValueThreshold) {
        anomalies.push({
          type: 'large-transfer',
          description: `Large value transfer: ${(Number(value) / 1e18).toFixed(4)} ETH`,
          transaction: tx.hash,
          severity: 'high',
          details: { value: value.toString() },
        });
      }
    });

    return anomalies;
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(
    transactions: Transaction[],
    patterns: TransactionPattern[],
    anomalies: TransactionAnomaly[]
  ): number {
    let score = 100;

    // Deduct for failed transactions
    const failureRate = transactions.filter(tx => tx.status === 'failed').length / transactions.length;
    score -= failureRate * 30;

    // Deduct for high severity patterns
    const highSeverityPatterns = patterns.filter(p => p.severity === 'high').length;
    score -= highSeverityPatterns * 15;

    // Deduct for high severity anomalies
    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high').length;
    score -= highSeverityAnomalies * 20;

    // Deduct for medium severity issues
    const mediumIssues = [
      ...patterns.filter(p => p.severity === 'medium'),
      ...anomalies.filter(a => a.severity === 'medium'),
    ].length;
    score -= mediumIssues * 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get risk level from score
   */
  private getRiskLevel(score: number): 'safe' | 'moderate' | 'critical' {
    if (score >= 80) return 'safe';
    if (score >= 50) return 'moderate';
    return 'critical';
  }

  /**
   * Analyze time distribution
   */
  private analyzeTimeDistribution(transactions: Transaction[]): {
    hour: number;
    count: number;
  }[] {
    const distribution = new Map<number, number>();

    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      const hour = date.getHours();
      distribution.set(hour, (distribution.get(hour) || 0) + 1);
    });

    return Array.from(distribution.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour - b.hour);
  }

  /**
   * Analyze contract interactions
   */
  private analyzeContractInteractions(transactions: Transaction[]): {
    address: string;
    count: number;
    totalValue: string;
  }[] {
    const contractMap = new Map<string, { count: number; totalValue: bigint }>();

    transactions.forEach(tx => {
      if (tx.contractAddress) {
        const address = tx.contractAddress.toLowerCase();
        if (!contractMap.has(address)) {
          contractMap.set(address, { count: 0, totalValue: BigInt(0) });
        }
        const entry = contractMap.get(address)!;
        entry.count++;
        entry.totalValue += BigInt(tx.value || '0');
      }
    });

    return Array.from(contractMap.entries())
      .map(([address, data]) => ({
        address,
        count: data.count,
        totalValue: data.totalValue.toString(),
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    transactions: Transaction[],
    patterns: TransactionPattern[],
    anomalies: TransactionAnomaly[]
  ): string[] {
    const recommendations: string[] = [];

    const failureRate = transactions.filter(tx => tx.status === 'failed').length / transactions.length;
    if (failureRate > 0.1) {
      recommendations.push('High failure rate detected. Review transaction parameters and gas settings.');
    }

    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
    if (highSeverityAnomalies.length > 0) {
      recommendations.push('High severity anomalies detected. Review transactions carefully.');
    }

    const rapidPatterns = patterns.filter(p => p.type === 'rapid');
    if (rapidPatterns.length > 0) {
      recommendations.push('Rapid transaction patterns detected. Consider batching transactions to save gas.');
    }

    return recommendations;
  }

  /**
   * Get empty result
   */
  private getEmptyResult(): BatchAnalysisResult {
    return {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      totalGasUsed: 0,
      totalGasCost: 0,
      totalValue: '0',
      averageGasPrice: 0,
      riskScore: 100,
      riskLevel: 'safe',
      patterns: [],
      anomalies: [],
      recommendations: [],
      timeDistribution: [],
      contractInteractions: [],
    };
  }
}

// Singleton instance
export const transactionBatchAnalyzer = new TransactionBatchAnalyzer();

