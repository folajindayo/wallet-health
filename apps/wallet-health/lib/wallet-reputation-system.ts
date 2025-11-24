/**
 * Wallet Reputation System
 * Tracks and scores wallet reputation based on activity and behavior
 */

export interface ReputationScore {
  walletAddress: string;
  overallScore: number; // 0-1000
  categoryScores: {
    security: number; // 0-200
    activity: number; // 0-200
    trustworthiness: number; // 0-200
    longevity: number; // 0-200
    diversity: number; // 0-200
  };
  badges: string[];
  riskFlags: string[];
  verified: boolean;
  lastUpdated: number;
}

export interface ReputationHistory {
  walletAddress: string;
  history: Array<{
    timestamp: number;
    score: number;
    reason: string;
    change: number;
  }>;
  trend: 'improving' | 'declining' | 'stable';
}

export interface ReputationComparison {
  wallet1: ReputationScore;
  wallet2: ReputationScore;
  comparison: {
    scoreDifference: number;
    betterWallet: string;
    differences: Array<{
      category: string;
      difference: number;
    }>;
  };
}

export class WalletReputationSystem {
  private scores: Map<string, ReputationScore> = new Map();
  private history: Map<string, ReputationHistory['history']> = new Map();

  /**
   * Calculate reputation score
   */
  calculateScore(
    walletAddress: string,
    data: {
      age?: number; // days
      totalTransactions?: number;
      verifiedContracts?: number;
      unverifiedContracts?: number;
      spamTokens?: number;
      hasENS?: boolean;
      multiSig?: boolean;
      chains?: number[];
      tokens?: number;
      riskScore?: number;
    }
  ): ReputationScore {
    const walletKey = walletAddress.toLowerCase();

    // Security score (0-200)
    let securityScore = 100; // Base score
    if (data.hasENS) securityScore += 20;
    if (data.multiSig) securityScore += 30;
    if (data.verifiedContracts && data.verifiedContracts > 0) {
      securityScore += Math.min(30, data.verifiedContracts * 2);
    }
    if (data.unverifiedContracts && data.unverifiedContracts > 0) {
      securityScore -= Math.min(50, data.unverifiedContracts * 10);
    }
    if (data.spamTokens && data.spamTokens > 0) {
      securityScore -= Math.min(30, data.spamTokens * 5);
    }
    if (data.riskScore !== undefined) {
      securityScore += (data.riskScore - 50) * 0.4; // Scale risk score
    }
    securityScore = Math.max(0, Math.min(200, securityScore));

    // Activity score (0-200)
    let activityScore = 50; // Base score
    if (data.totalTransactions) {
      const txScore = Math.min(100, data.totalTransactions / 10);
      activityScore += txScore;
    }
    if (data.chains && data.chains.length > 1) {
      activityScore += Math.min(30, data.chains.length * 5);
    }
    activityScore = Math.max(0, Math.min(200, activityScore));

    // Trustworthiness score (0-200)
    let trustworthinessScore = 100; // Base score
    if (data.verifiedContracts && data.unverifiedContracts) {
      const verifiedRatio = data.verifiedContracts / (data.verifiedContracts + data.unverifiedContracts);
      trustworthinessScore += verifiedRatio * 50;
    }
    if (data.spamTokens && data.spamTokens === 0) {
      trustworthinessScore += 20;
    }
    if (data.hasENS) trustworthinessScore += 20;
    trustworthinessScore = Math.max(0, Math.min(200, trustworthinessScore));

    // Longevity score (0-200)
    let longevityScore = 0;
    if (data.age) {
      if (data.age > 365) longevityScore = 200;
      else if (data.age > 180) longevityScore = 150;
      else if (data.age > 90) longevityScore = 100;
      else if (data.age > 30) longevityScore = 50;
      else longevityScore = 25;
    }

    // Diversity score (0-200)
    let diversityScore = 50; // Base score
    if (data.chains && data.chains.length > 1) {
      diversityScore += Math.min(50, data.chains.length * 10);
    }
    if (data.tokens && data.tokens > 5) {
      diversityScore += Math.min(50, (data.tokens - 5) * 5);
    }
    diversityScore = Math.max(0, Math.min(200, diversityScore));

    // Calculate badges
    const badges: string[] = [];
    if (securityScore > 150) badges.push('high-security');
    if (activityScore > 150) badges.push('active-trader');
    if (trustworthinessScore > 150) badges.push('trusted');
    if (longevityScore > 150) badges.push('veteran');
    if (diversityScore > 150) badges.push('diversified');
    if (data.hasENS) badges.push('ens-verified');
    if (data.multiSig) badges.push('multisig');
    if (data.chains && data.chains.length >= 5) badges.push('multi-chain');

    // Risk flags
    const riskFlags: string[] = [];
    if (data.unverifiedContracts && data.unverifiedContracts > 5) {
      riskFlags.push('high-unverified-contracts');
    }
    if (data.spamTokens && data.spamTokens > 10) {
      riskFlags.push('many-spam-tokens');
    }
    if (data.riskScore !== undefined && data.riskScore < 50) {
      riskFlags.push('low-risk-score');
    }

    const overallScore = Math.round(
      securityScore + activityScore + trustworthinessScore + longevityScore + diversityScore
    );

    const score: ReputationScore = {
      walletAddress,
      overallScore: Math.max(0, Math.min(1000, overallScore)),
      categoryScores: {
        security: Math.round(securityScore),
        activity: Math.round(activityScore),
        trustworthiness: Math.round(trustworthinessScore),
        longevity: Math.round(longevityScore),
        diversity: Math.round(diversityScore),
      },
      badges,
      riskFlags,
      verified: badges.includes('ens-verified') || badges.includes('multisig'),
      lastUpdated: Date.now(),
    };

    // Store score
    this.scores.set(walletKey, score);

    // Record history
    const previousScore = this.scores.get(walletKey);
    if (previousScore) {
      const change = score.overallScore - previousScore.overallScore;
      this.addHistoryEntry(walletKey, score.overallScore, 'Score updated', change);
    }

    return score;
  }

  /**
   * Get reputation score
   */
  getScore(walletAddress: string): ReputationScore | null {
    return this.scores.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Get reputation history
   */
  getHistory(walletAddress: string): ReputationHistory | null {
    const walletKey = walletAddress.toLowerCase();
    const history = this.history.get(walletKey) || [];

    if (history.length === 0) return null;

    // Determine trend
    if (history.length < 2) {
      return {
        walletAddress,
        history,
        trend: 'stable',
      };
    }

    const recent = history.slice(-10);
    const first = recent[0].score;
    const last = recent[recent.length - 1].score;
    const change = last - first;

    let trend: 'improving' | 'declining' | 'stable';
    if (change > 50) trend = 'improving';
    else if (change < -50) trend = 'declining';
    else trend = 'stable';

    return {
      walletAddress,
      history,
      trend,
    };
  }

  /**
   * Compare two wallets
   */
  compareWallets(
    wallet1: string,
    wallet2: string
  ): ReputationComparison | null {
    const score1 = this.getScore(wallet1);
    const score2 = this.getScore(wallet2);

    if (!score1 || !score2) return null;

    const scoreDifference = score2.overallScore - score1.overallScore;
    const betterWallet = scoreDifference > 0 ? wallet2 : wallet1;

    const differences = [
      {
        category: 'security',
        difference: score2.categoryScores.security - score1.categoryScores.security,
      },
      {
        category: 'activity',
        difference: score2.categoryScores.activity - score1.categoryScores.activity,
      },
      {
        category: 'trustworthiness',
        difference: score2.categoryScores.trustworthiness - score1.categoryScores.trustworthiness,
      },
      {
        category: 'longevity',
        difference: score2.categoryScores.longevity - score1.categoryScores.longevity,
      },
      {
        category: 'diversity',
        difference: score2.categoryScores.diversity - score1.categoryScores.diversity,
      },
    ];

    return {
      wallet1: score1,
      wallet2: score2,
      comparison: {
        scoreDifference,
        betterWallet,
        differences,
      },
    };
  }

  /**
   * Get top wallets by score
   */
  getTopWallets(limit: number = 10): ReputationScore[] {
    return Array.from(this.scores.values())
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);
  }

  /**
   * Add history entry
   */
  private addHistoryEntry(
    walletKey: string,
    score: number,
    reason: string,
    change: number
  ): void {
    if (!this.history.has(walletKey)) {
      this.history.set(walletKey, []);
    }

    this.history.get(walletKey)!.push({
      timestamp: Date.now(),
      score,
      reason,
      change,
    });

    // Keep last 1000 entries
    const history = this.history.get(walletKey)!;
    if (history.length > 1000) {
      history.shift();
    }
  }
}

// Singleton instance
export const walletReputationSystem = new WalletReputationSystem();
