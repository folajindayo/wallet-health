/**
 * On-chain Reputation System Utility
 * Builds reputation based on on-chain activity
 */

export interface ReputationScore {
  walletAddress: string;
  overallScore: number; // 0-1000
  categoryScores: {
    trading: number;
    defi: number;
    governance: number;
    nft: number;
    lending: number;
    staking: number;
  };
  badges: ReputationBadge[];
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  verified: boolean;
  lastUpdated: number;
}

export interface ReputationBadge {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: number;
}

export interface ReputationEvent {
  type: 'trade' | 'defi_interaction' | 'governance_vote' | 'nft_purchase' | 'lending' | 'staking';
  impact: number; // -100 to +100
  description: string;
  timestamp: number;
  transactionHash?: string;
}

export class OnChainReputationSystem {
  private reputationCache: Map<string, ReputationScore> = new Map();
  private events: Map<string, ReputationEvent[]> = new Map();

  /**
   * Calculate reputation score
   */
  async calculateReputation(
    walletAddress: string,
    activity: {
      totalTrades?: number;
      totalVolumeUSD?: number;
      defiInteractions?: number;
      governanceVotes?: number;
      nftPurchases?: number;
      lendingTransactions?: number;
      stakingTransactions?: number;
      accountAge?: number; // days
    }
  ): Promise<ReputationScore> {
    const cacheKey = walletAddress.toLowerCase();
    const cached = this.reputationCache.get(cacheKey);

    // Return cached if recent (within 1 hour)
    if (cached && Date.now() - cached.lastUpdated < 60 * 60 * 1000) {
      return cached;
    }

    // Calculate category scores
    const tradingScore = this.calculateTradingScore(
      activity.totalTrades || 0,
      activity.totalVolumeUSD || 0
    );

    const defiScore = this.calculateDeFiScore(activity.defiInteractions || 0);
    const governanceScore = this.calculateGovernanceScore(activity.governanceVotes || 0);
    const nftScore = this.calculateNFTScore(activity.nftPurchases || 0);
    const lendingScore = this.calculateLendingScore(activity.lendingTransactions || 0);
    const stakingScore = this.calculateStakingScore(activity.stakingTransactions || 0);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      tradingScore * 0.25 +
      defiScore * 0.20 +
      governanceScore * 0.15 +
      nftScore * 0.10 +
      lendingScore * 0.15 +
      stakingScore * 0.15
    );

    // Calculate badges
    const badges = this.calculateBadges(activity, {
      trading: tradingScore,
      defi: defiScore,
      governance: governanceScore,
      nft: nftScore,
      lending: lendingScore,
      staking: stakingScore,
    });

    // Determine level
    const level = this.determineLevel(overallScore);

    const reputation: ReputationScore = {
      walletAddress,
      overallScore: Math.min(1000, overallScore),
      categoryScores: {
        trading: tradingScore,
        defi: defiScore,
        governance: governanceScore,
        nft: nftScore,
        lending: lendingScore,
        staking: stakingScore,
      },
      badges,
      level,
      verified: activity.accountAge ? activity.accountAge > 365 : false,
      lastUpdated: Date.now(),
    };

    // Cache result
    this.reputationCache.set(cacheKey, reputation);

    return reputation;
  }

  /**
   * Calculate trading score
   */
  private calculateTradingScore(trades: number, volumeUSD: number): number {
    let score = 0;

    // Volume-based score (logarithmic)
    if (volumeUSD > 0) {
      score += Math.min(200, Math.log10(volumeUSD / 1000) * 30);
    }

    // Trade count score
    score += Math.min(100, trades * 2);

    return Math.min(300, Math.round(score));
  }

  /**
   * Calculate DeFi score
   */
  private calculateDeFiScore(interactions: number): number {
    return Math.min(300, interactions * 10);
  }

  /**
   * Calculate governance score
   */
  private calculateGovernanceScore(votes: number): number {
    return Math.min(300, votes * 20);
  }

  /**
   * Calculate NFT score
   */
  private calculateNFTScore(purchases: number): number {
    return Math.min(300, Math.log10(purchases + 1) * 50);
  }

  /**
   * Calculate lending score
   */
  private calculateLendingScore(transactions: number): number {
    return Math.min(300, transactions * 15);
  }

  /**
   * Calculate staking score
   */
  private calculateStakingScore(transactions: number): number {
    return Math.min(300, transactions * 15);
  }

  /**
   * Calculate badges
   */
  private calculateBadges(
    activity: any,
    scores: ReputationScore['categoryScores']
  ): ReputationBadge[] {
    const badges: ReputationBadge[] = [];

    // Trading badges
    if (activity.totalVolumeUSD && activity.totalVolumeUSD > 1000000) {
      badges.push({
        id: 'whale-trader',
        name: 'Whale Trader',
        description: 'Traded over $1M',
        category: 'trading',
        rarity: 'legendary',
        earnedAt: Date.now(),
      });
    }

    if (scores.trading > 200) {
      badges.push({
        id: 'active-trader',
        name: 'Active Trader',
        description: 'High trading activity',
        category: 'trading',
        rarity: 'rare',
        earnedAt: Date.now(),
      });
    }

    // DeFi badges
    if (scores.defi > 200) {
      badges.push({
        id: 'defi-degen',
        name: 'DeFi Degen',
        description: 'Extensive DeFi participation',
        category: 'defi',
        rarity: 'epic',
        earnedAt: Date.now(),
      });
    }

    // Governance badges
    if (scores.governance > 100) {
      badges.push({
        id: 'governance-participant',
        name: 'Governance Participant',
        description: 'Active in DAO governance',
        category: 'governance',
        rarity: 'rare',
        earnedAt: Date.now(),
      });
    }

    // NFT badges
    if (activity.nftPurchases && activity.nftPurchases > 50) {
      badges.push({
        id: 'nft-collector',
        name: 'NFT Collector',
        description: 'Collected 50+ NFTs',
        category: 'nft',
        rarity: 'epic',
        earnedAt: Date.now(),
      });
    }

    return badges;
  }

  /**
   * Determine reputation level
   */
  private determineLevel(score: number): ReputationScore['level'] {
    if (score >= 800) return 'diamond';
    if (score >= 600) return 'platinum';
    if (score >= 400) return 'gold';
    if (score >= 200) return 'silver';
    return 'bronze';
  }

  /**
   * Add reputation event
   */
  addEvent(walletAddress: string, event: ReputationEvent): void {
    const key = walletAddress.toLowerCase();
    if (!this.events.has(key)) {
      this.events.set(key, []);
    }

    this.events.get(key)!.push(event);

    // Keep only last 1000 events per wallet
    const events = this.events.get(key)!;
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }

    // Invalidate cache
    this.reputationCache.delete(key);
  }

  /**
   * Get reputation events
   */
  getEvents(walletAddress: string, limit = 50): ReputationEvent[] {
    const events = this.events.get(walletAddress.toLowerCase()) || [];
    return events.slice(-limit).reverse();
  }

  /**
   * Compare wallets
   */
  async compareWallets(
    wallets: Array<{ address: string; activity: any }>
  ): Promise<Array<ReputationScore & { rank: number }>> {
    const reputations = await Promise.all(
      wallets.map(w => this.calculateReputation(w.address, w.activity))
    );

    // Sort by overall score
    reputations.sort((a, b) => b.overallScore - a.overallScore);

    // Add ranks
    return reputations.map((rep, index) => ({
      ...rep,
      rank: index + 1,
    }));
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.reputationCache.clear();
  }
}

// Singleton instance
export const onChainReputationSystem = new OnChainReputationSystem();

