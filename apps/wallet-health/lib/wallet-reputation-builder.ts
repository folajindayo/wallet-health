/**
 * Wallet Reputation Builder Utility
 * Build reputation based on on-chain activity
 */

export interface ReputationMetrics {
  totalTransactions: number;
  totalVolumeUSD: number;
  accountAge: number; // days
  defiInteractions: number;
  governanceVotes: number;
  nftCount: number;
  verifiedContracts: number;
  successfulTrades: number;
  failedTransactions: number;
  averageGasPrice: number;
}

export interface ReputationScore {
  walletAddress: string;
  overallScore: number; // 0-1000
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  categoryScores: {
    activity: number; // 0-100
    volume: number; // 0-100
    reliability: number; // 0-100
    governance: number; // 0-100
    defi: number; // 0-100
  };
  badges: Array<{
    name: string;
    description: string;
    earnedAt: number;
  }>;
  rank: number; // Overall rank among all wallets
  percentile: number; // Percentile (0-100)
  lastUpdated: number;
}

export class WalletReputationBuilder {
  private reputations: Map<string, ReputationScore> = new Map();

  /**
   * Calculate reputation score
   */
  calculateReputation(
    walletAddress: string,
    metrics: ReputationMetrics
  ): ReputationScore {
    // Calculate category scores
    const activityScore = this.calculateActivityScore(metrics);
    const volumeScore = this.calculateVolumeScore(metrics);
    const reliabilityScore = this.calculateReliabilityScore(metrics);
    const governanceScore = this.calculateGovernanceScore(metrics);
    const defiScore = this.calculateDeFiScore(metrics);

    // Calculate overall score (weighted)
    const overallScore = Math.round(
      activityScore * 0.25 +
      volumeScore * 0.25 +
      reliabilityScore * 0.20 +
      governanceScore * 0.15 +
      defiScore * 0.15
    );

    // Determine level
    let level: ReputationScore['level'] = 'bronze';
    if (overallScore >= 800) {
      level = 'diamond';
    } else if (overallScore >= 650) {
      level = 'platinum';
    } else if (overallScore >= 500) {
      level = 'gold';
    } else if (overallScore >= 350) {
      level = 'silver';
    }

    // Generate badges
    const badges = this.generateBadges(metrics);

    const reputation: ReputationScore = {
      walletAddress: walletAddress.toLowerCase(),
      overallScore,
      level,
      categoryScores: {
        activity: Math.round(activityScore),
        volume: Math.round(volumeScore),
        reliability: Math.round(reliabilityScore),
        governance: Math.round(governanceScore),
        defi: Math.round(defiScore),
      },
      badges,
      rank: 0, // Would be calculated against all wallets
      percentile: 0, // Would be calculated against all wallets
      lastUpdated: Date.now(),
    };

    this.reputations.set(walletAddress.toLowerCase(), reputation);
    return reputation;
  }

  /**
   * Calculate activity score
   */
  private calculateActivityScore(metrics: ReputationMetrics): number {
    let score = 0;

    // Transaction count (max 30 points)
    if (metrics.totalTransactions > 1000) {
      score += 30;
    } else if (metrics.totalTransactions > 500) {
      score += 25;
    } else if (metrics.totalTransactions > 100) {
      score += 20;
    } else if (metrics.totalTransactions > 50) {
      score += 15;
    } else if (metrics.totalTransactions > 10) {
      score += 10;
    }

    // Account age (max 20 points)
    if (metrics.accountAge > 730) { // 2+ years
      score += 20;
    } else if (metrics.accountAge > 365) { // 1+ year
      score += 15;
    } else if (metrics.accountAge > 180) { // 6+ months
      score += 10;
    } else if (metrics.accountAge > 90) { // 3+ months
      score += 5;
    }

    // NFT count (max 10 points)
    if (metrics.nftCount > 100) {
      score += 10;
    } else if (metrics.nftCount > 50) {
      score += 7;
    } else if (metrics.nftCount > 10) {
      score += 5;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate volume score
   */
  private calculateVolumeScore(metrics: ReputationMetrics): number {
    let score = 0;

    // Total volume (max 100 points)
    if (metrics.totalVolumeUSD > 1000000) {
      score = 100;
    } else if (metrics.totalVolumeUSD > 500000) {
      score = 80;
    } else if (metrics.totalVolumeUSD > 100000) {
      score = 60;
    } else if (metrics.totalVolumeUSD > 50000) {
      score = 40;
    } else if (metrics.totalVolumeUSD > 10000) {
      score = 20;
    } else if (metrics.totalVolumeUSD > 1000) {
      score = 10;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate reliability score
   */
  private calculateReliabilityScore(metrics: ReputationMetrics): number {
    const totalAttempts = metrics.successfulTrades + metrics.failedTransactions;
    if (totalAttempts === 0) {
      return 50; // Neutral if no transactions
    }

    const successRate = (metrics.successfulTrades / totalAttempts) * 100;
    
    // Success rate (max 100 points)
    let score = successRate;

    // Verified contracts bonus
    if (metrics.verifiedContracts > 10) {
      score += 10;
    } else if (metrics.verifiedContracts > 5) {
      score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate governance score
   */
  private calculateGovernanceScore(metrics: ReputationMetrics): number {
    let score = 0;

    // Governance votes (max 100 points)
    if (metrics.governanceVotes > 50) {
      score = 100;
    } else if (metrics.governanceVotes > 20) {
      score = 80;
    } else if (metrics.governanceVotes > 10) {
      score = 60;
    } else if (metrics.governanceVotes > 5) {
      score = 40;
    } else if (metrics.governanceVotes > 0) {
      score = 20;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate DeFi score
   */
  private calculateDeFiScore(metrics: ReputationMetrics): number {
    let score = 0;

    // DeFi interactions (max 100 points)
    if (metrics.defiInteractions > 100) {
      score = 100;
    } else if (metrics.defiInteractions > 50) {
      score = 80;
    } else if (metrics.defiInteractions > 20) {
      score = 60;
    } else if (metrics.defiInteractions > 10) {
      score = 40;
    } else if (metrics.defiInteractions > 5) {
      score = 20;
    } else if (metrics.defiInteractions > 0) {
      score = 10;
    }

    return Math.min(100, score);
  }

  /**
   * Generate badges
   */
  private generateBadges(metrics: ReputationMetrics): Array<{
    name: string;
    description: string;
    earnedAt: number;
  }> {
    const badges: Array<{ name: string; description: string; earnedAt: number }> = [];
    const now = Date.now();

    if (metrics.totalTransactions > 1000) {
      badges.push({
        name: 'Power User',
        description: 'Over 1000 transactions',
        earnedAt: now,
      });
    }

    if (metrics.totalVolumeUSD > 100000) {
      badges.push({
        name: 'Whale',
        description: 'Over $100k in volume',
        earnedAt: now,
      });
    }

    if (metrics.accountAge > 365) {
      badges.push({
        name: 'Veteran',
        description: 'Active for over 1 year',
        earnedAt: now,
      });
    }

    if (metrics.governanceVotes > 10) {
      badges.push({
        name: 'Governance Leader',
        description: 'Active in governance',
        earnedAt: now,
      });
    }

    if (metrics.defiInteractions > 50) {
      badges.push({
        name: 'DeFi Enthusiast',
        description: 'Heavy DeFi user',
        earnedAt: now,
      });
    }

    return badges;
  }

  /**
   * Get reputation
   */
  getReputation(walletAddress: string): ReputationScore | null {
    return this.reputations.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Compare reputations
   */
  compareReputations(address1: string, address2: string): {
    address1: ReputationScore | null;
    address2: ReputationScore | null;
    difference: number;
    better: string | null;
  } {
    const rep1 = this.getReputation(address1);
    const rep2 = this.getReputation(address2);

    if (!rep1 || !rep2) {
      return {
        address1: rep1,
        address2: rep2,
        difference: 0,
        better: null,
      };
    }

    const difference = rep1.overallScore - rep2.overallScore;
    const better = difference > 0 ? address1 : difference < 0 ? address2 : null;

    return {
      address1: rep1,
      address2: rep2,
      difference,
      better,
    };
  }

  /**
   * Clear reputation
   */
  clear(walletAddress?: string): void {
    if (walletAddress) {
      this.reputations.delete(walletAddress.toLowerCase());
    } else {
      this.reputations.clear();
    }
  }
}

// Singleton instance
export const walletReputationBuilder = new WalletReputationBuilder();

