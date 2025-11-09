/**
 * Wallet Reputation System Utility
 * Builds reputation scores based on wallet activity
 */

export interface ReputationFactor {
  type: 'age' | 'volume' | 'diversity' | 'security' | 'governance' | 'defi' | 'nft';
  score: number; // 0-100
  weight: number; // 0-1
  description: string;
}

export interface WalletReputation {
  walletAddress: string;
  overallScore: number; // 0-100
  reputationLevel: 'new' | 'established' | 'trusted' | 'veteran' | 'whale';
  factors: ReputationFactor[];
  badges: string[];
  metrics: {
    accountAge: number; // days
    totalVolumeUSD: number;
    uniqueContracts: number;
    chainsUsed: number;
    transactions: number;
  };
  trends: {
    scoreChange30d: number;
    volumeChange30d: number;
    trend: 'improving' | 'stable' | 'declining';
  };
}

export interface ReputationBadge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  icon?: string;
}

export class WalletReputationSystem {
  private reputationCache: Map<string, WalletReputation> = new Map();
  private badges: ReputationBadge[] = [];

  constructor() {
    this.initializeBadges();
  }

  /**
   * Calculate wallet reputation
   */
  async calculateReputation(
    walletAddress: string,
    metrics: {
      firstTransaction?: number;
      totalVolumeUSD?: number;
      uniqueContracts?: number;
      chainsUsed?: number;
      totalTransactions?: number;
      securityScore?: number;
      governanceParticipation?: number;
      defiPositions?: number;
      nftCount?: number;
    }
  ): Promise<WalletReputation> {
    const cacheKey = walletAddress.toLowerCase();
    const cached = this.reputationCache.get(cacheKey);

    // Return cached if recent (within 1 hour)
    if (cached && Date.now() - cached.metrics.accountAge < 60 * 60 * 1000) {
      return cached;
    }

    const factors: ReputationFactor[] = [];

    // Account age factor
    const accountAge = metrics.firstTransaction
      ? Math.floor((Date.now() - metrics.firstTransaction) / (24 * 60 * 60 * 1000))
      : 0;
    const ageScore = Math.min(100, (accountAge / 365) * 100); // Max at 1 year
    factors.push({
      type: 'age',
      score: ageScore,
      weight: 0.15,
      description: `Account age: ${accountAge} days`,
    });

    // Volume factor
    const volumeScore = metrics.totalVolumeUSD
      ? Math.min(100, Math.log10(metrics.totalVolumeUSD / 1000) * 20) // Logarithmic scale
      : 0;
    factors.push({
      type: 'volume',
      score: volumeScore,
      weight: 0.20,
      description: `Total volume: $${metrics.totalVolumeUSD?.toLocaleString() || 0}`,
    });

    // Diversity factor
    const diversityScore = this.calculateDiversityScore(
      metrics.uniqueContracts || 0,
      metrics.chainsUsed || 0
    );
    factors.push({
      type: 'diversity',
      score: diversityScore,
      weight: 0.15,
      description: `${metrics.uniqueContracts || 0} contracts, ${metrics.chainsUsed || 0} chains`,
    });

    // Security factor
    const securityScore = metrics.securityScore || 50;
    factors.push({
      type: 'security',
      score: securityScore,
      weight: 0.25,
      description: `Security score: ${securityScore}/100`,
    });

    // Governance factor
    const governanceScore = metrics.governanceParticipation
      ? Math.min(100, metrics.governanceParticipation * 10)
      : 0;
    factors.push({
      type: 'governance',
      score: governanceScore,
      weight: 0.10,
      description: `Governance participation: ${metrics.governanceParticipation || 0}`,
    });

    // DeFi factor
    const defiScore = metrics.defiPositions
      ? Math.min(100, metrics.defiPositions * 20)
      : 0;
    factors.push({
      type: 'defi',
      score: defiScore,
      weight: 0.10,
      description: `DeFi positions: ${metrics.defiPositions || 0}`,
    });

    // NFT factor
    const nftScore = metrics.nftCount
      ? Math.min(100, Math.log10(metrics.nftCount + 1) * 25)
      : 0;
    factors.push({
      type: 'nft',
      score: nftScore,
      weight: 0.05,
      description: `NFTs owned: ${metrics.nftCount || 0}`,
    });

    // Calculate overall score
    const overallScore = factors.reduce((sum, factor) => {
      return sum + factor.score * factor.weight;
    }, 0);

    // Determine reputation level
    const reputationLevel = this.determineReputationLevel(overallScore, accountAge);

    // Get badges
    const badges = this.calculateBadges(factors, metrics);

    // Calculate trends (simplified - would need historical data)
    const trends = {
      scoreChange30d: 0,
      volumeChange30d: 0,
      trend: 'stable' as const,
    };

    const reputation: WalletReputation = {
      walletAddress,
      overallScore: Math.round(overallScore * 100) / 100,
      reputationLevel,
      factors,
      badges,
      metrics: {
        accountAge,
        totalVolumeUSD: metrics.totalVolumeUSD || 0,
        uniqueContracts: metrics.uniqueContracts || 0,
        chainsUsed: metrics.chainsUsed || 0,
        transactions: metrics.totalTransactions || 0,
      },
      trends,
    };

    // Cache result
    this.reputationCache.set(cacheKey, reputation);

    return reputation;
  }

  /**
   * Calculate diversity score
   */
  private calculateDiversityScore(uniqueContracts: number, chainsUsed: number): number {
    const contractScore = Math.min(50, uniqueContracts * 2);
    const chainScore = Math.min(50, chainsUsed * 10);
    return contractScore + chainScore;
  }

  /**
   * Determine reputation level
   */
  private determineReputationLevel(
    score: number,
    accountAge: number
  ): WalletReputation['reputationLevel'] {
    if (accountAge < 30) return 'new';
    if (score < 30) return 'new';
    if (score < 50) return 'established';
    if (score < 75) return 'trusted';
    if (accountAge > 365 && score >= 75) return 'veteran';
    if (score >= 90) return 'whale';
    return 'trusted';
  }

  /**
   * Calculate badges
   */
  private calculateBadges(
    factors: ReputationFactor[],
    metrics: any
  ): string[] {
    const badges: string[] = [];

    // Early adopter badge
    if (metrics.firstTransaction && Date.now() - metrics.firstTransaction > 2 * 365 * 24 * 60 * 60 * 1000) {
      badges.push('early-adopter');
    }

    // High volume badge
    if (metrics.totalVolumeUSD && metrics.totalVolumeUSD > 1000000) {
      badges.push('high-volume');
    }

    // Multi-chain badge
    if (metrics.chainsUsed && metrics.chainsUsed >= 3) {
      badges.push('multi-chain');
    }

    // Security champion badge
    const securityFactor = factors.find(f => f.type === 'security');
    if (securityFactor && securityFactor.score >= 80) {
      badges.push('security-champion');
    }

    // Governance participant badge
    if (metrics.governanceParticipation && metrics.governanceParticipation > 0) {
      badges.push('governance-participant');
    }

    // DeFi degen badge
    if (metrics.defiPositions && metrics.defiPositions >= 5) {
      badges.push('defi-degen');
    }

    // NFT collector badge
    if (metrics.nftCount && metrics.nftCount >= 10) {
      badges.push('nft-collector');
    }

    return badges;
  }

  /**
   * Initialize badges
   */
  private initializeBadges(): void {
    this.badges = [
      {
        id: 'early-adopter',
        name: 'Early Adopter',
        description: 'Wallet active for over 2 years',
        requirement: 'Account age > 2 years',
      },
      {
        id: 'high-volume',
        name: 'High Volume',
        description: 'Total volume over $1M',
        requirement: 'Total volume > $1M',
      },
      {
        id: 'multi-chain',
        name: 'Multi-Chain',
        description: 'Active on 3+ chains',
        requirement: 'Chains used >= 3',
      },
      {
        id: 'security-champion',
        name: 'Security Champion',
        description: 'Security score above 80',
        requirement: 'Security score >= 80',
      },
      {
        id: 'governance-participant',
        name: 'Governance Participant',
        description: 'Participated in DAO governance',
        requirement: 'Governance participation > 0',
      },
      {
        id: 'defi-degen',
        name: 'DeFi Degen',
        description: '5+ DeFi positions',
        requirement: 'DeFi positions >= 5',
      },
      {
        id: 'nft-collector',
        name: 'NFT Collector',
        description: 'Owns 10+ NFTs',
        requirement: 'NFT count >= 10',
      },
    ];
  }

  /**
   * Get all badges
   */
  getBadges(): ReputationBadge[] {
    return [...this.badges];
  }

  /**
   * Compare wallets
   */
  async compareWallets(
    wallets: Array<{ address: string; metrics: any }>
  ): Promise<Array<WalletReputation & { rank: number }>> {
    const reputations = await Promise.all(
      wallets.map(w => this.calculateReputation(w.address, w.metrics))
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
export const walletReputationSystem = new WalletReputationSystem();

