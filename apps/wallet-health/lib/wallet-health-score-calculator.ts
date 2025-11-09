/**
 * Wallet Health Score Calculator Utility
 * Comprehensive wallet health scoring system
 */

export interface HealthScoreFactors {
  approvals: {
    score: number;
    weight: number;
    factors: {
      unlimitedApprovals: number;
      riskyApprovals: number;
      totalApprovals: number;
      unusedApprovals: number;
    };
  };
  tokens: {
    score: number;
    weight: number;
    factors: {
      spamTokens: number;
      phishingTokens: number;
      totalTokens: number;
    };
  };
  contracts: {
    score: number;
    weight: number;
    factors: {
      unverifiedContracts: number;
      newContracts: number;
      highRiskContracts: number;
    };
  };
  transactions: {
    score: number;
    weight: number;
    factors: {
      failureRate: number;
      suspiciousTransactions: number;
      totalTransactions: number;
    };
  };
  practices: {
    score: number;
    weight: number;
    factors: {
      hasBackup: boolean;
      usesHardwareWallet: boolean;
      multiSigEnabled: boolean;
      monitoringEnabled: boolean;
    };
  };
}

export interface HealthScoreResult {
  overallScore: number; // 0-100
  riskLevel: 'safe' | 'moderate' | 'high' | 'critical';
  factors: HealthScoreFactors;
  breakdown: Array<{
    category: string;
    score: number;
    weight: number;
    contribution: number;
  }>;
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    issue: string;
    impact: number; // points to gain if fixed
    action: string;
  }>;
  trend?: {
    previousScore: number;
    change: number;
    direction: 'improving' | 'declining' | 'stable';
  };
}

export class WalletHealthScoreCalculator {
  /**
   * Calculate comprehensive health score
   */
  calculateHealthScore(data: {
    approvals: Array<{
      isUnlimited: boolean;
      isRisky: boolean;
      lastUsed?: number;
    }>;
    tokens: Array<{
      isSpam?: boolean;
      isPhishing?: boolean;
    }>;
    contracts: Array<{
      isVerified: boolean;
      isNew: boolean;
      riskScore?: number;
    }>;
    transactions: Array<{
      status: 'success' | 'failed';
      isSuspicious?: boolean;
    }>;
    practices?: {
      hasBackup?: boolean;
      usesHardwareWallet?: boolean;
      multiSigEnabled?: boolean;
      monitoringEnabled?: boolean;
    };
    previousScore?: number;
  }): HealthScoreResult {
    // Calculate category scores
    const approvalsScore = this.calculateApprovalsScore(data.approvals);
    const tokensScore = this.calculateTokensScore(data.tokens);
    const contractsScore = this.calculateContractsScore(data.contracts);
    const transactionsScore = this.calculateTransactionsScore(data.transactions);
    const practicesScore = this.calculatePracticesScore(data.practices || {});

    // Define weights
    const weights = {
      approvals: 0.30,
      tokens: 0.20,
      contracts: 0.25,
      transactions: 0.15,
      practices: 0.10,
    };

    // Calculate weighted overall score
    const overallScore = Math.round(
      approvalsScore.score * weights.approvals +
      tokensScore.score * weights.tokens +
      contractsScore.score * weights.contracts +
      transactionsScore.score * weights.transactions +
      practicesScore.score * weights.practices
    );

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overallScore);

    // Create factors object
    const factors: HealthScoreFactors = {
      approvals: {
        score: approvalsScore.score,
        weight: weights.approvals,
        factors: approvalsScore.factors,
      },
      tokens: {
        score: tokensScore.score,
        weight: weights.tokens,
        factors: tokensScore.factors,
      },
      contracts: {
        score: contractsScore.score,
        weight: weights.contracts,
        factors: contractsScore.factors,
      },
      transactions: {
        score: transactionsScore.score,
        weight: weights.transactions,
        factors: transactionsScore.factors,
      },
      practices: {
        score: practicesScore.score,
        weight: weights.practices,
        factors: practicesScore.factors,
      },
    };

    // Create breakdown
    const breakdown = [
      {
        category: 'Approvals',
        score: approvalsScore.score,
        weight: weights.approvals,
        contribution: Math.round(approvalsScore.score * weights.approvals),
      },
      {
        category: 'Tokens',
        score: tokensScore.score,
        weight: weights.tokens,
        contribution: Math.round(tokensScore.score * weights.tokens),
      },
      {
        category: 'Contracts',
        score: contractsScore.score,
        weight: weights.contracts,
        contribution: Math.round(contractsScore.score * weights.contracts),
      },
      {
        category: 'Transactions',
        score: transactionsScore.score,
        weight: weights.transactions,
        contribution: Math.round(transactionsScore.score * weights.transactions),
      },
      {
        category: 'Practices',
        score: practicesScore.score,
        weight: weights.practices,
        contribution: Math.round(practicesScore.score * weights.practices),
      },
    ];

    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, overallScore);

    // Calculate trend if previous score provided
    let trend: HealthScoreResult['trend'];
    if (data.previousScore !== undefined) {
      const change = overallScore - data.previousScore;
      trend = {
        previousScore: data.previousScore,
        change,
        direction: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
      };
    }

    return {
      overallScore,
      riskLevel,
      factors,
      breakdown,
      recommendations,
      trend,
    };
  }

  /**
   * Calculate approvals score
   */
  private calculateApprovalsScore(approvals: Array<{
    isUnlimited: boolean;
    isRisky: boolean;
    lastUsed?: number;
  }>): {
    score: number;
    factors: HealthScoreFactors['approvals']['factors'];
  } {
    let score = 100;
    const unlimitedApprovals = approvals.filter(a => a.isUnlimited).length;
    const riskyApprovals = approvals.filter(a => a.isRisky && !a.isUnlimited).length;
    const totalApprovals = approvals.length;

    // Deduct for unlimited approvals
    score -= unlimitedApprovals * 20;

    // Deduct for risky approvals
    score -= riskyApprovals * 10;

    // Deduct for too many approvals
    if (totalApprovals > 20) {
      score -= 10;
    } else if (totalApprovals > 10) {
      score -= 5;
    }

    // Check for unused approvals
    const unusedApprovals = approvals.filter(a => {
      if (!a.lastUsed) return false;
      const daysSinceUse = (Date.now() - a.lastUsed) / (24 * 60 * 60 * 1000);
      return daysSinceUse > 90;
    }).length;

    if (unusedApprovals > 0) {
      score -= Math.min(unusedApprovals * 2, 10);
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      factors: {
        unlimitedApprovals,
        riskyApprovals,
        totalApprovals,
        unusedApprovals,
      },
    };
  }

  /**
   * Calculate tokens score
   */
  private calculateTokensScore(tokens: Array<{
    isSpam?: boolean;
    isPhishing?: boolean;
  }>): {
    score: number;
    factors: HealthScoreFactors['tokens']['factors'];
  } {
    let score = 100;
    const phishingTokens = tokens.filter(t => t.isPhishing).length;
    const spamTokens = tokens.filter(t => t.isSpam).length;
    const totalTokens = tokens.length;

    // Critical deduction for phishing tokens
    score -= phishingTokens * 50;

    // Deduct for spam tokens
    score -= spamTokens * 5;

    return {
      score: Math.max(0, Math.min(100, score)),
      factors: {
        spamTokens,
        phishingTokens,
        totalTokens,
      },
    };
  }

  /**
   * Calculate contracts score
   */
  private calculateContractsScore(contracts: Array<{
    isVerified: boolean;
    isNew: boolean;
    riskScore?: number;
  }>): {
    score: number;
    factors: HealthScoreFactors['contracts']['factors'];
  } {
    let score = 100;
    const unverifiedContracts = contracts.filter(c => !c.isVerified).length;
    const newContracts = contracts.filter(c => c.isNew).length;
    const highRiskContracts = contracts.filter(c => c.riskScore && c.riskScore > 80).length;

    // Deduct for unverified contracts
    score -= unverifiedContracts * 15;

    // Deduct for new contracts
    score -= newContracts * 5;

    // Deduct for high-risk contracts
    score -= highRiskContracts * 25;

    return {
      score: Math.max(0, Math.min(100, score)),
      factors: {
        unverifiedContracts,
        newContracts,
        highRiskContracts,
      },
    };
  }

  /**
   * Calculate transactions score
   */
  private calculateTransactionsScore(transactions: Array<{
    status: 'success' | 'failed';
    isSuspicious?: boolean;
  }>): {
    score: number;
    factors: HealthScoreFactors['transactions']['factors'];
  } {
    let score = 100;
    const totalTransactions = transactions.length;
    const failedTransactions = transactions.filter(t => t.status === 'failed').length;
    const suspiciousTransactions = transactions.filter(t => t.isSuspicious).length;

    const failureRate = totalTransactions > 0
      ? (failedTransactions / totalTransactions) * 100
      : 0;

    // Deduct for high failure rate
    if (failureRate > 20) {
      score -= 20;
    } else if (failureRate > 10) {
      score -= 10;
    }

    // Deduct for suspicious transactions
    score -= suspiciousTransactions * 15;

    return {
      score: Math.max(0, Math.min(100, score)),
      factors: {
        failureRate: Math.round(failureRate * 100) / 100,
        suspiciousTransactions,
        totalTransactions,
      },
    };
  }

  /**
   * Calculate practices score
   */
  private calculatePracticesScore(practices: {
    hasBackup?: boolean;
    usesHardwareWallet?: boolean;
    multiSigEnabled?: boolean;
    monitoringEnabled?: boolean;
  }): {
    score: number;
    factors: HealthScoreFactors['practices']['factors'];
  } {
    let score = 0;

    if (practices.hasBackup) score += 30;
    if (practices.usesHardwareWallet) score += 30;
    if (practices.multiSigEnabled) score += 25;
    if (practices.monitoringEnabled) score += 15;

    return {
      score: Math.min(100, score),
      factors: {
        hasBackup: practices.hasBackup || false,
        usesHardwareWallet: practices.usesHardwareWallet || false,
        multiSigEnabled: practices.multiSigEnabled || false,
        monitoringEnabled: practices.monitoringEnabled || false,
      },
    };
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(score: number): HealthScoreResult['riskLevel'] {
    if (score >= 80) return 'safe';
    if (score >= 60) return 'moderate';
    if (score >= 40) return 'high';
    return 'critical';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    factors: HealthScoreFactors,
    overallScore: number
  ): HealthScoreResult['recommendations'] {
    const recommendations: HealthScoreResult['recommendations'] = [];

    // Approvals recommendations
    if (factors.approvals.factors.unlimitedApprovals > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Approvals',
        issue: `${factors.approvals.factors.unlimitedApprovals} unlimited approval(s)`,
        impact: factors.approvals.factors.unlimitedApprovals * 6, // 20 points * 0.3 weight
        action: 'Revoke unlimited approvals immediately',
      });
    }

    if (factors.approvals.factors.riskyApprovals > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Approvals',
        issue: `${factors.approvals.factors.riskyApprovals} risky approval(s)`,
        impact: factors.approvals.factors.riskyApprovals * 3,
        action: 'Review and revoke risky approvals',
      });
    }

    // Tokens recommendations
    if (factors.tokens.factors.phishingTokens > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Tokens',
        issue: `${factors.tokens.factors.phishingTokens} phishing token(s)`,
        impact: factors.tokens.factors.phishingTokens * 10,
        action: 'Remove phishing tokens immediately - DO NOT interact',
      });
    }

    // Contracts recommendations
    if (factors.contracts.factors.highRiskContracts > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Contracts',
        issue: `${factors.contracts.factors.highRiskContracts} high-risk contract(s)`,
        impact: factors.contracts.factors.highRiskContracts * 6.25,
        action: 'Revoke all approvals to high-risk contracts',
      });
    }

    // Practices recommendations
    if (!factors.practices.factors.hasBackup) {
      recommendations.push({
        priority: 'high',
        category: 'Practices',
        issue: 'No backup detected',
        impact: 3,
        action: 'Create secure backup of recovery phrase',
      });
    }

    // Sort by priority and impact
    recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.impact - a.impact;
    });

    return recommendations;
  }

  /**
   * Calculate potential score improvement
   */
  calculatePotentialImprovement(
    currentScore: number,
    recommendations: HealthScoreResult['recommendations']
  ): {
    potentialScore: number;
    improvement: number;
    achievable: boolean;
  } {
    const totalImpact = recommendations.reduce((sum, rec) => sum + rec.impact, 0);
    const potentialScore = Math.min(100, currentScore + totalImpact);
    const improvement = potentialScore - currentScore;

    return {
      potentialScore: Math.round(potentialScore),
      improvement: Math.round(improvement),
      achievable: improvement > 0,
    };
  }
}

// Singleton instance
export const walletHealthScoreCalculator = new WalletHealthScoreCalculator();

