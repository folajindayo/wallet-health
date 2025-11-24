/**
 * Anomaly Detection Engine
 * ML-based anomaly detection for suspicious wallet activities using statistical analysis
 */

export interface Anomaly {
  id: string;
  type: 'transaction' | 'approval' | 'token' | 'contract' | 'behavioral' | 'temporal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: number;
  confidence: number; // 0-100
  metadata: Record<string, any>;
  relatedData?: any;
}

export interface AnomalyDetectionResult {
  anomalies: Anomaly[];
  riskScore: number; // 0-100
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  summary: {
    totalAnomalies: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  recommendations: string[];
  patterns: Array<{
    pattern: string;
    frequency: number;
    risk: number;
  }>;
}

export interface WalletBehaviorProfile {
  walletAddress: string;
  averageTransactionValue: number;
  averageTransactionFrequency: number; // per day
  preferredChains: number[];
  commonRecipients: string[];
  commonContracts: string[];
  transactionTimes: number[]; // hours of day
  transactionDays: number[]; // days of week
  lastUpdated: number;
}

export class AnomalyDetectionEngine {
  private behaviorProfiles: Map<string, WalletBehaviorProfile> = new Map();
  private readonly MIN_DATA_POINTS = 10; // Minimum transactions needed to build profile

  /**
   * Detect anomalies in wallet activity
   */
  detectAnomalies(params: {
    walletAddress: string;
    transactions: Array<{
      hash: string;
      timestamp: number;
      from: string;
      to: string;
      value: string;
      chainId: number;
      contractAddress?: string;
    }>;
    approvals?: Array<{
      tokenAddress: string;
      spenderAddress: string;
      allowance: string;
      timestamp: number;
    }>;
    tokens?: Array<{
      address: string;
      balance: string;
      symbol: string;
    }>;
  }): AnomalyDetectionResult {
    const anomalies: Anomaly[] = [];
    const { walletAddress, transactions, approvals = [], tokens = [] } = params;

    // Build or update behavior profile
    const profile = this.buildBehaviorProfile(walletAddress, transactions);

    // 1. Detect transaction value anomalies
    const valueAnomalies = this.detectValueAnomalies(transactions, profile);
    anomalies.push(...valueAnomalies);

    // 2. Detect frequency anomalies
    const frequencyAnomalies = this.detectFrequencyAnomalies(transactions, profile);
    anomalies.push(...frequencyAnomalies);

    // 3. Detect chain switching anomalies
    const chainAnomalies = this.detectChainAnomalies(transactions, profile);
    anomalies.push(...chainAnomalies);

    // 4. Detect recipient anomalies
    const recipientAnomalies = this.detectRecipientAnomalies(transactions, profile);
    anomalies.push(...recipientAnomalies);

    // 5. Detect temporal anomalies (unusual times)
    const temporalAnomalies = this.detectTemporalAnomalies(transactions, profile);
    anomalies.push(...temporalAnomalies);

    // 6. Detect approval anomalies
    if (approvals.length > 0) {
      const approvalAnomalies = this.detectApprovalAnomalies(approvals, walletAddress);
      anomalies.push(...approvalAnomalies);
    }

    // 7. Detect token anomalies
    if (tokens.length > 0) {
      const tokenAnomalies = this.detectTokenAnomalies(tokens, walletAddress);
      anomalies.push(...tokenAnomalies);
    }

    // 8. Detect contract interaction anomalies
    const contractAnomalies = this.detectContractAnomalies(transactions, profile);
    anomalies.push(...contractAnomalies);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(anomalies);
    const riskLevel = this.getRiskLevel(riskScore);

    // Generate patterns
    const patterns = this.identifyPatterns(anomalies);

    // Generate recommendations
    const recommendations = this.generateRecommendations(anomalies, riskLevel);

    // Summary
    const summary = {
      totalAnomalies: anomalies.length,
      criticalCount: anomalies.filter((a) => a.severity === 'critical').length,
      highCount: anomalies.filter((a) => a.severity === 'high').length,
      mediumCount: anomalies.filter((a) => a.severity === 'medium').length,
      lowCount: anomalies.filter((a) => a.severity === 'low').length,
    };

    return {
      anomalies,
      riskScore,
      riskLevel,
      summary,
      recommendations,
      patterns,
    };
  }

  /**
   * Build behavior profile from transaction history
   */
  private buildBehaviorProfile(
    walletAddress: string,
    transactions: Array<{ timestamp: number; value: string; chainId: number; to: string; contractAddress?: string }>
  ): WalletBehaviorProfile {
    if (transactions.length < this.MIN_DATA_POINTS) {
      // Return default profile if insufficient data
      return {
        walletAddress,
        averageTransactionValue: 0,
        averageTransactionFrequency: 0,
        preferredChains: [],
        commonRecipients: [],
        commonContracts: [],
        transactionTimes: [],
        transactionDays: [],
        lastUpdated: Date.now(),
      };
    }

    // Calculate average transaction value
    const values = transactions.map((tx) => parseFloat(tx.value) / 1e18);
    const averageTransactionValue = values.reduce((sum, v) => sum + v, 0) / values.length;

    // Calculate frequency (transactions per day)
    const sortedTxns = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    const timeSpan = sortedTxns[sortedTxns.length - 1].timestamp - sortedTxns[0].timestamp;
    const days = Math.max(timeSpan / (1000 * 60 * 60 * 24), 1);
    const averageTransactionFrequency = transactions.length / days;

    // Find preferred chains
    const chainCounts: Record<number, number> = {};
    transactions.forEach((tx) => {
      chainCounts[tx.chainId] = (chainCounts[tx.chainId] || 0) + 1;
    });
    const preferredChains = Object.entries(chainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([chainId]) => parseInt(chainId));

    // Find common recipients
    const recipientCounts: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.to.toLowerCase() !== walletAddress.toLowerCase()) {
        recipientCounts[tx.to.toLowerCase()] = (recipientCounts[tx.to.toLowerCase()] || 0) + 1;
      }
    });
    const commonRecipients = Object.entries(recipientCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([address]) => address);

    // Find common contracts
    const contractCounts: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.contractAddress) {
        contractCounts[tx.contractAddress.toLowerCase()] =
          (contractCounts[tx.contractAddress.toLowerCase()] || 0) + 1;
      }
    });
    const commonContracts = Object.entries(contractCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([address]) => address);

    // Transaction times (hours)
    const transactionTimes = transactions.map((tx) => new Date(tx.timestamp).getHours());

    // Transaction days (0-6, Sunday-Saturday)
    const transactionDays = transactions.map((tx) => new Date(tx.timestamp).getDay());

    const profile: WalletBehaviorProfile = {
      walletAddress,
      averageTransactionValue,
      averageTransactionFrequency,
      preferredChains,
      commonRecipients,
      commonContracts,
      transactionTimes,
      transactionDays,
      lastUpdated: Date.now(),
    };

    this.behaviorProfiles.set(walletAddress.toLowerCase(), profile);
    return profile;
  }

  /**
   * Detect value anomalies using statistical methods
   */
  private detectValueAnomalies(
    transactions: Array<{ value: string; timestamp: number }>,
    profile: WalletBehaviorProfile
  ): Anomaly[] {
    if (transactions.length < this.MIN_DATA_POINTS || profile.averageTransactionValue === 0) {
      return [];
    }

    const values = transactions.map((tx) => parseFloat(tx.value) / 1e18);
    const mean = profile.averageTransactionValue;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + 3 * stdDev; // 3-sigma rule

    const anomalies: Anomaly[] = [];
    transactions.forEach((tx, index) => {
      const value = parseFloat(tx.value) / 1e18;
      if (value > threshold) {
        const deviation = (value - mean) / stdDev;
        const severity =
          deviation > 5 ? 'critical' : deviation > 3 ? 'high' : deviation > 2 ? 'medium' : 'low';
        const confidence = Math.min(100, Math.abs(deviation) * 20);

        anomalies.push({
          id: `value-${tx.timestamp}-${index}`,
          type: 'transaction',
          severity,
          description: `Unusually high transaction value detected: ${value.toFixed(4)} ETH (${(deviation * stdDev).toFixed(4)} ETH above average)`,
          detectedAt: Date.now(),
          confidence: Math.round(confidence),
          metadata: {
            value,
            averageValue: mean,
            deviation,
            threshold,
          },
          relatedData: tx,
        });
      }
    });

    return anomalies;
  }

  /**
   * Detect frequency anomalies
   */
  private detectFrequencyAnomalies(
    transactions: Array<{ timestamp: number }>,
    profile: WalletBehaviorProfile
  ): Anomaly[] {
    if (transactions.length < this.MIN_DATA_POINTS || profile.averageTransactionFrequency === 0) {
      return [];
    }

    const anomalies: Anomaly[] = [];
    const sortedTxns = [...transactions].sort((a, b) => a.timestamp - b.timestamp);

    // Check for sudden spikes in activity
    const windowSize = 24 * 60 * 60 * 1000; // 24 hours
    for (let i = 0; i < sortedTxns.length - 1; i++) {
      const windowStart = sortedTxns[i].timestamp;
      const windowEnd = windowStart + windowSize;
      const windowTxns = sortedTxns.filter(
        (tx) => tx.timestamp >= windowStart && tx.timestamp <= windowEnd
      );

      const frequency = windowTxns.length;
      const expectedFrequency = profile.averageTransactionFrequency;
      const ratio = frequency / Math.max(expectedFrequency, 0.1);

      if (ratio > 5) {
        // 5x normal frequency
        const severity = ratio > 10 ? 'critical' : ratio > 7 ? 'high' : 'medium';
        anomalies.push({
          id: `frequency-${windowStart}`,
          type: 'behavioral',
          severity,
          description: `Unusual activity spike detected: ${frequency} transactions in 24 hours (${ratio.toFixed(1)}x normal frequency)`,
          detectedAt: Date.now(),
          confidence: Math.min(100, ratio * 10),
          metadata: {
            frequency,
            expectedFrequency,
            ratio,
            windowStart,
            windowEnd,
          },
        });
        break; // Only report first spike
      }
    }

    return anomalies;
  }

  /**
   * Detect chain switching anomalies
   */
  private detectChainAnomalies(
    transactions: Array<{ chainId: number; timestamp: number }>,
    profile: WalletBehaviorProfile
  ): Anomaly[] {
    if (profile.preferredChains.length === 0) return [];

    const anomalies: Anomaly[] = [];
    const recentTxns = transactions.slice(-10); // Check last 10 transactions

    recentTxns.forEach((tx) => {
      if (!profile.preferredChains.includes(tx.chainId)) {
        anomalies.push({
          id: `chain-${tx.timestamp}`,
          type: 'transaction',
          severity: 'low',
          description: `Transaction on unusual chain: Chain ID ${tx.chainId}`,
          detectedAt: Date.now(),
          confidence: 60,
          metadata: {
            chainId: tx.chainId,
            preferredChains: profile.preferredChains,
          },
          relatedData: tx,
        });
      }
    });

    return anomalies;
  }

  /**
   * Detect recipient anomalies
   */
  private detectRecipientAnomalies(
    transactions: Array<{ to: string; timestamp: number }>,
    profile: WalletBehaviorProfile
  ): Anomaly[] {
    if (profile.commonRecipients.length === 0) return [];

    const anomalies: Anomaly[] = [];
    const recentTxns = transactions.slice(-20); // Check last 20 transactions

    recentTxns.forEach((tx) => {
      if (
        !profile.commonRecipients.includes(tx.to.toLowerCase()) &&
        tx.to.toLowerCase() !== profile.walletAddress.toLowerCase()
      ) {
        anomalies.push({
          id: `recipient-${tx.timestamp}`,
          type: 'transaction',
          severity: 'medium',
          description: `Transaction to new/unusual recipient: ${tx.to.substring(0, 10)}...`,
          detectedAt: Date.now(),
          confidence: 70,
          metadata: {
            recipient: tx.to,
            commonRecipients: profile.commonRecipients,
          },
          relatedData: tx,
        });
      }
    });

    return anomalies.slice(0, 5); // Limit to 5 most recent
  }

  /**
   * Detect temporal anomalies
   */
  private detectTemporalAnomalies(
    transactions: Array<{ timestamp: number }>,
    profile: WalletBehaviorProfile
  ): Anomaly[] {
    if (profile.transactionTimes.length === 0) return [];

    const anomalies: Anomaly[] = [];
    const recentTxns = transactions.slice(-10);

    // Calculate most common transaction hour
    const hourCounts: Record<number, number> = {};
    profile.transactionTimes.forEach((hour) => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const mostCommonHour = parseInt(
      Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '12'
    );

    recentTxns.forEach((tx) => {
      const hour = new Date(tx.timestamp).getHours();
      const hourDiff = Math.abs(hour - mostCommonHour);
      if (hourDiff > 6) {
        // More than 6 hours difference
        anomalies.push({
          id: `temporal-${tx.timestamp}`,
          type: 'temporal',
          severity: 'low',
          description: `Transaction at unusual time: ${hour}:00 (usual time: ${mostCommonHour}:00)`,
          detectedAt: Date.now(),
          confidence: 50,
          metadata: {
            hour,
            mostCommonHour,
            difference: hourDiff,
          },
          relatedData: tx,
        });
      }
    });

    return anomalies.slice(0, 3); // Limit to 3
  }

  /**
   * Detect approval anomalies
   */
  private detectApprovalAnomalies(
    approvals: Array<{ tokenAddress: string; spenderAddress: string; allowance: string; timestamp: number }>,
    walletAddress: string
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    approvals.forEach((approval) => {
      const allowance = BigInt(approval.allowance);
      const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

      // Check for unlimited approvals
      if (allowance >= maxUint256 / BigInt(2)) {
        anomalies.push({
          id: `approval-${approval.timestamp}`,
          type: 'approval',
          severity: 'high',
          description: `Unlimited token approval detected for ${approval.tokenAddress.substring(0, 10)}...`,
          detectedAt: Date.now(),
          confidence: 95,
          metadata: {
            tokenAddress: approval.tokenAddress,
            spenderAddress: approval.spenderAddress,
            allowance: approval.allowance,
          },
          relatedData: approval,
        });
      }
    });

    return anomalies;
  }

  /**
   * Detect token anomalies
   */
  private detectTokenAnomalies(
    tokens: Array<{ address: string; balance: string; symbol: string }>,
    walletAddress: string
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Check for suspicious token symbols (common scam patterns)
    const suspiciousPatterns = [
      /test/i,
      /airdrop/i,
      /claim/i,
      /free/i,
      /reward/i,
      /[^a-zA-Z0-9]/g, // Non-alphanumeric characters
    ];

    tokens.forEach((token) => {
      suspiciousPatterns.forEach((pattern) => {
        if (pattern.test(token.symbol)) {
          anomalies.push({
            id: `token-${token.address}`,
            type: 'token',
            severity: 'medium',
            description: `Suspicious token detected: ${token.symbol}`,
            detectedAt: Date.now(),
            confidence: 60,
            metadata: {
              tokenAddress: token.address,
              symbol: token.symbol,
              balance: token.balance,
            },
            relatedData: token,
          });
        }
      });
    });

    return anomalies;
  }

  /**
   * Detect contract interaction anomalies
   */
  private detectContractAnomalies(
    transactions: Array<{ contractAddress?: string; timestamp: number }>,
    profile: WalletBehaviorProfile
  ): Anomaly[] {
    if (profile.commonContracts.length === 0) return [];

    const anomalies: Anomaly[] = [];
    const recentContractTxns = transactions
      .filter((tx) => tx.contractAddress)
      .slice(-10);

    recentContractTxns.forEach((tx) => {
      if (
        tx.contractAddress &&
        !profile.commonContracts.includes(tx.contractAddress.toLowerCase())
      ) {
        anomalies.push({
          id: `contract-${tx.timestamp}`,
          type: 'contract',
          severity: 'medium',
          description: `Interaction with new contract: ${tx.contractAddress.substring(0, 10)}...`,
          detectedAt: Date.now(),
          confidence: 65,
          metadata: {
            contractAddress: tx.contractAddress,
            commonContracts: profile.commonContracts,
          },
          relatedData: tx,
        });
      }
    });

    return anomalies.slice(0, 5);
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(anomalies: Anomaly[]): number {
    if (anomalies.length === 0) return 0;

    let score = 0;
    const weights = { critical: 25, high: 15, medium: 8, low: 3 };

    anomalies.forEach((anomaly) => {
      score += weights[anomaly.severity] || 0;
    });

    return Math.min(100, score);
  }

  /**
   * Get risk level from score
   */
  private getRiskLevel(score: number): AnomalyDetectionResult['riskLevel'] {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    if (score >= 10) return 'low';
    return 'safe';
  }

  /**
   * Identify patterns in anomalies
   */
  private identifyPatterns(anomalies: Anomaly[]): Array<{ pattern: string; frequency: number; risk: number }> {
    const patterns: Record<string, number> = {};

    anomalies.forEach((anomaly) => {
      const key = `${anomaly.type}-${anomaly.severity}`;
      patterns[key] = (patterns[key] || 0) + 1;
    });

    return Object.entries(patterns).map(([pattern, frequency]) => {
      const [type, severity] = pattern.split('-');
      const riskWeights: Record<string, number> = { critical: 25, high: 15, medium: 8, low: 3 };
      const risk = riskWeights[severity] || 0;

      return {
        pattern: `${type} (${severity})`,
        frequency,
        risk: risk * frequency,
      };
    });
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    anomalies: Anomaly[],
    riskLevel: AnomalyDetectionResult['riskLevel']
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Immediate review of all recent transactions required');
      recommendations.push('Consider temporarily disabling wallet if compromise suspected');
      recommendations.push('Review and revoke suspicious token approvals');
    }

    const hasValueAnomalies = anomalies.some((a) => a.type === 'transaction' && a.severity === 'high');
    if (hasValueAnomalies) {
      recommendations.push('Verify all high-value transactions were intentional');
    }

    const hasApprovalAnomalies = anomalies.some((a) => a.type === 'approval');
    if (hasApprovalAnomalies) {
      recommendations.push('Review token approvals and revoke unnecessary ones');
    }

    const hasRecipientAnomalies = anomalies.some((a) => a.type === 'transaction' && a.metadata.recipient);
    if (hasRecipientAnomalies) {
      recommendations.push('Double-check recipient addresses for recent transactions');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring wallet activity');
    }

    return recommendations;
  }

  /**
   * Get behavior profile for a wallet
   */
  getBehaviorProfile(walletAddress: string): WalletBehaviorProfile | null {
    return this.behaviorProfiles.get(walletAddress.toLowerCase()) || null;
  }
}

// Singleton instance
export const anomalyDetectionEngine = new AnomalyDetectionEngine();

