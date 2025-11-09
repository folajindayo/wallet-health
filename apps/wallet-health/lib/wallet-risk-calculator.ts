/**
 * Wallet Risk Calculator Utility
 * Calculate comprehensive risk scores for wallets
 */

export interface RiskFactors {
  approvals: {
    unlimitedCount: number;
    riskyCount: number;
    totalCount: number;
    unverifiedSpenders: number;
  };
  tokens: {
    phishingCount: number;
    spamCount: number;
    totalCount: number;
    suspiciousCount: number;
  };
  contracts: {
    unverifiedCount: number;
    newCount: number;
    highRiskCount: number;
    totalInteractions: number;
  };
  transactions: {
    failureRate: number;
    suspiciousCount: number;
    largeTransferCount: number;
    rapidTransactionCount: number;
  };
  practices: {
    hasBackup: boolean;
    usesHardwareWallet: boolean;
    monitoringEnabled: boolean;
  };
}

export interface RiskScore {
  overallScore: number; // 0-100 (higher = more risky)
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  categoryScores: {
    approvals: number;
    tokens: number;
    contracts: number;
    transactions: number;
    practices: number;
  };
  factors: RiskFactors;
  criticalRisks: Array<{
    category: string;
    issue: string;
    severity: 'critical' | 'high' | 'medium';
    impact: number;
  }>;
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    impact: string;
    estimatedImprovement: number; // points
  }>;
}

export class WalletRiskCalculator {
  /**
   * Calculate comprehensive risk score
   */
  calculateRiskScore(data: {
    approvals: Array<{
      isUnlimited: boolean;
      isRisky: boolean;
      spenderVerified?: boolean;
    }>;
    tokens: Array<{
      isPhishing?: boolean;
      isSpam?: boolean;
      isSuspicious?: boolean;
    }>;
    contracts: Array<{
      isVerified: boolean;
      isNew: boolean;
      riskScore?: number;
    }>;
    transactions: Array<{
      status: 'success' | 'failed';
      isSuspicious?: boolean;
      value: string;
      timestamp: number;
    }>;
    practices?: {
      hasBackup?: boolean;
      usesHardwareWallet?: boolean;
      monitoringEnabled?: boolean;
    };
  }): RiskScore {
    // Calculate category scores
    const approvalsScore = this.calculateApprovalsRisk(data.approvals);
    const tokensScore = this.calculateTokensRisk(data.tokens);
    const contractsScore = this.calculateContractsRisk(data.contracts);
    const transactionsScore = this.calculateTransactionsRisk(data.transactions);
    const practicesScore = this.calculatePracticesRisk(data.practices || {});

    // Calculate overall score (weighted average)
    const weights = {
      approvals: 0.30,
      tokens: 0.25,
      contracts: 0.25,
      transactions: 0.15,
      practices: 0.05,
    };

    const overallScore = Math.round(
      approvalsScore * weights.approvals +
      tokensScore * weights.tokens +
      contractsScore * weights.contracts +
      transactionsScore * weights.transactions +
      practicesScore * weights.practices
    );

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overallScore);

    // Extract factors
    const factors = this.extractFactors(data);

    // Identify critical risks
    const criticalRisks = this.identifyCriticalRisks(factors, {
      approvals: approvalsScore,
      tokens: tokensScore,
      contracts: contractsScore,
      transactions: transactionsScore,
      practices: practicesScore,
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, {
      approvals: approvalsScore,
      tokens: tokensScore,
      contracts: contractsScore,
      transactions: transactionsScore,
      practices: practicesScore,
    });

    return {
      overallScore,
      riskLevel,
      categoryScores: {
        approvals: approvalsScore,
        tokens: tokensScore,
        contracts: contractsScore,
        transactions: transactionsScore,
        practices: practicesScore,
      },
      factors,
      criticalRisks,
      recommendations,
    };
  }

  /**
   * Calculate approvals risk score
   */
  private calculateApprovalsRisk(approvals: Array<{
    isUnlimited: boolean;
    isRisky: boolean;
    spenderVerified?: boolean;
  }>): number {
    let score = 0;

    const unlimitedCount = approvals.filter(a => a.isUnlimited).length;
    const riskyCount = approvals.filter(a => a.isRisky && !a.isUnlimited).length;
    const unverifiedCount = approvals.filter(a => !a.spenderVerified).length;

    // Unlimited approvals are very risky
    score += unlimitedCount * 30;

    // Risky approvals
    score += riskyCount * 15;

    // Unverified spenders
    score += unverifiedCount * 10;

    // Too many approvals
    if (approvals.length > 20) {
      score += 20;
    } else if (approvals.length > 10) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate tokens risk score
   */
  private calculateTokensRisk(tokens: Array<{
    isPhishing?: boolean;
    isSpam?: boolean;
    isSuspicious?: boolean;
  }>): number {
    let score = 0;

    const phishingCount = tokens.filter(t => t.isPhishing).length;
    const spamCount = tokens.filter(t => t.isSpam).length;
    const suspiciousCount = tokens.filter(t => t.isSuspicious).length;

    // Phishing tokens are critical
    score += phishingCount * 50;

    // Spam tokens
    score += spamCount * 5;

    // Suspicious tokens
    score += suspiciousCount * 15;

    return Math.min(100, score);
  }

  /**
   * Calculate contracts risk score
   */
  private calculateContractsRisk(contracts: Array<{
    isVerified: boolean;
    isNew: boolean;
    riskScore?: number;
  }>): number {
    let score = 0;

    const unverifiedCount = contracts.filter(c => !c.isVerified).length;
    const newCount = contracts.filter(c => c.isNew).length;
    const highRiskCount = contracts.filter(c => c.riskScore && c.riskScore > 80).length;

    // Unverified contracts
    score += unverifiedCount * 20;

    // New contracts
    score += newCount * 10;

    // High-risk contracts
    score += highRiskCount * 40;

    return Math.min(100, score);
  }

  /**
   * Calculate transactions risk score
   */
  private calculateTransactionsRisk(transactions: Array<{
    status: 'success' | 'failed';
    isSuspicious?: boolean;
    value: string;
    timestamp: number;
  }>): number {
    let score = 0;

    const total = transactions.length;
    if (total === 0) return 0;

    const failedCount = transactions.filter(t => t.status === 'failed').length;
    const failureRate = (failedCount / total) * 100;
    
    if (failureRate > 20) {
      score += 30;
    } else if (failureRate > 10) {
      score += 15;
    }

    const suspiciousCount = transactions.filter(t => t.isSuspicious).length;
    score += suspiciousCount * 20;

    // Check for large transfers
    const largeThreshold = BigInt('1000000000000000000000'); // 1000 ETH
    const largeTransfers = transactions.filter(t =>
      BigInt(t.value || '0') > largeThreshold
    ).length;
    score += largeTransfers * 10;

    // Check for rapid transactions
    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    let rapidCount = 0;
    for (let i = 1; i < sorted.length; i++) {
      const timeDiff = sorted[i].timestamp - sorted[i - 1].timestamp;
      if (timeDiff < 60000) { // Less than 1 minute
        rapidCount++;
      }
    }
    score += Math.min(rapidCount * 5, 20);

    return Math.min(100, score);
  }

  /**
   * Calculate practices risk score
   */
  private calculatePracticesRisk(practices: {
    hasBackup?: boolean;
    usesHardwareWallet?: boolean;
    monitoringEnabled?: boolean;
  }): number {
    let score = 100; // Start with high risk

    if (practices.hasBackup) score -= 30;
    if (practices.usesHardwareWallet) score -= 40;
    if (practices.monitoringEnabled) score -= 20;

    return Math.max(0, score);
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(score: number): RiskScore['riskLevel'] {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'moderate';
    return 'low';
  }

  /**
   * Extract risk factors
   */
  private extractFactors(data: {
    approvals: Array<{
      isUnlimited: boolean;
      isRisky: boolean;
      spenderVerified?: boolean;
    }>;
    tokens: Array<{
      isPhishing?: boolean;
      isSpam?: boolean;
      isSuspicious?: boolean;
    }>;
    contracts: Array<{
      isVerified: boolean;
      isNew: boolean;
      riskScore?: number;
    }>;
    transactions: Array<{
      status: 'success' | 'failed';
      isSuspicious?: boolean;
      value: string;
      timestamp: number;
    }>;
    practices?: {
      hasBackup?: boolean;
      usesHardwareWallet?: boolean;
      monitoringEnabled?: boolean;
    };
  }): RiskFactors {
    return {
      approvals: {
        unlimitedCount: data.approvals.filter(a => a.isUnlimited).length,
        riskyCount: data.approvals.filter(a => a.isRisky && !a.isUnlimited).length,
        totalCount: data.approvals.length,
        unverifiedSpenders: data.approvals.filter(a => !a.spenderVerified).length,
      },
      tokens: {
        phishingCount: data.tokens.filter(t => t.isPhishing).length,
        spamCount: data.tokens.filter(t => t.isSpam).length,
        totalCount: data.tokens.length,
        suspiciousCount: data.tokens.filter(t => t.isSuspicious).length,
      },
      contracts: {
        unverifiedCount: data.contracts.filter(c => !c.isVerified).length,
        newCount: data.contracts.filter(c => c.isNew).length,
        highRiskCount: data.contracts.filter(c => c.riskScore && c.riskScore > 80).length,
        totalInteractions: data.contracts.length,
      },
      transactions: {
        failureRate: data.transactions.length > 0
          ? (data.transactions.filter(t => t.status === 'failed').length / data.transactions.length) * 100
          : 0,
        suspiciousCount: data.transactions.filter(t => t.isSuspicious).length,
        largeTransferCount: data.transactions.filter(t =>
          BigInt(t.value || '0') > BigInt('1000000000000000000000')
        ).length,
        rapidTransactionCount: 0, // Would calculate from timestamps
      },
      practices: {
        hasBackup: data.practices?.hasBackup || false,
        usesHardwareWallet: data.practices?.usesHardwareWallet || false,
        monitoringEnabled: data.practices?.monitoringEnabled || false,
      },
    };
  }

  /**
   * Identify critical risks
   */
  private identifyCriticalRisks(
    factors: RiskFactors,
    scores: RiskScore['categoryScores']
  ): RiskScore['criticalRisks'] {
    const risks: RiskScore['criticalRisks'] = [];

    if (factors.approvals.unlimitedCount > 0) {
      risks.push({
        category: 'Approvals',
        issue: `${factors.approvals.unlimitedCount} unlimited approval(s)`,
        severity: 'critical',
        impact: factors.approvals.unlimitedCount * 30,
      });
    }

    if (factors.tokens.phishingCount > 0) {
      risks.push({
        category: 'Tokens',
        issue: `${factors.tokens.phishingCount} phishing token(s)`,
        severity: 'critical',
        impact: factors.tokens.phishingCount * 50,
      });
    }

    if (factors.contracts.highRiskCount > 0) {
      risks.push({
        category: 'Contracts',
        issue: `${factors.contracts.highRiskCount} high-risk contract(s)`,
        severity: 'critical',
        impact: factors.contracts.highRiskCount * 40,
      });
    }

    if (scores.approvals > 70) {
      risks.push({
        category: 'Approvals',
        issue: 'Very high approval risk score',
        severity: 'high',
        impact: scores.approvals,
      });
    }

    return risks;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    factors: RiskFactors,
    scores: RiskScore['categoryScores']
  ): RiskScore['recommendations'] {
    const recommendations: RiskScore['recommendations'] = [];

    if (factors.approvals.unlimitedCount > 0) {
      recommendations.push({
        priority: 'critical',
        action: `Revoke ${factors.approvals.unlimitedCount} unlimited approval(s)`,
        impact: 'Significantly reduces approval risk',
        estimatedImprovement: factors.approvals.unlimitedCount * 9, // 30 points * 0.3 weight
      });
    }

    if (factors.tokens.phishingCount > 0) {
      recommendations.push({
        priority: 'critical',
        action: `Remove ${factors.tokens.phishingCount} phishing token(s) immediately`,
        impact: 'Eliminates critical token risk',
        estimatedImprovement: factors.tokens.phishingCount * 12.5, // 50 points * 0.25 weight
      });
    }

    if (factors.contracts.highRiskCount > 0) {
      recommendations.push({
        priority: 'critical',
        action: `Revoke approvals to ${factors.contracts.highRiskCount} high-risk contract(s)`,
        impact: 'Eliminates high contract risk',
        estimatedImprovement: factors.contracts.highRiskCount * 10, // 40 points * 0.25 weight
      });
    }

    if (!factors.practices.hasBackup) {
      recommendations.push({
        priority: 'high',
        action: 'Create secure backup of recovery phrase',
        impact: 'Reduces risk of permanent fund loss',
        estimatedImprovement: 1.5, // 30 points * 0.05 weight
      });
    }

    return recommendations;
  }

  /**
   * Compare risk scores
   */
  compareRiskScores(
    score1: RiskScore,
    score2: RiskScore
  ): {
    difference: number;
    improvedCategories: string[];
    worsenedCategories: string[];
    overallChange: 'improved' | 'worsened' | 'stable';
  } {
    const difference = score2.overallScore - score1.overallScore;

    const improvedCategories: string[] = [];
    const worsenedCategories: string[] = [];

    const categories: (keyof RiskScore['categoryScores'])[] = [
      'approvals', 'tokens', 'contracts', 'transactions', 'practices'
    ];

    categories.forEach(category => {
      const diff = score2.categoryScores[category] - score1.categoryScores[category];
      if (diff < -5) {
        improvedCategories.push(category);
      } else if (diff > 5) {
        worsenedCategories.push(category);
      }
    });

    const overallChange = difference < -5
      ? 'improved'
      : difference > 5
      ? 'worsened'
      : 'stable';

    return {
      difference: Math.round(difference * 100) / 100,
      improvedCategories,
      worsenedCategories,
      overallChange,
    };
  }
}

// Singleton instance
export const walletRiskCalculator = new WalletRiskCalculator();

