/**
 * Token Launchpad Platform Utility
 * Tracks token launches and ICOs
 */

export interface TokenLaunch {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chainId: number;
  launchDate: number;
  launchPrice: number; // USD
  currentPrice?: number; // USD
  totalRaised: number; // USD
  hardCap?: number; // USD
  softCap?: number; // USD
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  platform: string;
  website?: string;
  whitepaper?: string;
  socialLinks?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  riskLevel: 'low' | 'medium' | 'high';
  kycRequired: boolean;
  auditStatus: 'audited' | 'unaudited' | 'in-progress';
}

export interface LaunchParticipation {
  launchId: string;
  walletAddress: string;
  amountInvested: number; // USD
  tokensReceived: number;
  participationDate: number;
  status: 'pending' | 'confirmed' | 'refunded';
  transactionHash?: string;
}

export interface LaunchpadStats {
  totalLaunches: number;
  upcomingLaunches: number;
  liveLaunches: number;
  completedLaunches: number;
  totalRaised: number; // USD
  averageROI: number; // Percentage
  topPerformer: TokenLaunch | null;
  userParticipations: number;
  userInvested: number; // USD
}

export class TokenLaunchpadPlatform {
  private launches: Map<string, TokenLaunch> = new Map();
  private participations: Map<string, LaunchParticipation[]> = new Map();

  /**
   * Add token launch
   */
  addLaunch(launch: TokenLaunch): void {
    this.launches.set(launch.id, launch);
  }

  /**
   * Get launch
   */
  getLaunch(id: string): TokenLaunch | null {
    return this.launches.get(id) || null;
  }

  /**
   * Get launches by status
   */
  getLaunchesByStatus(status: TokenLaunch['status']): TokenLaunch[] {
    return Array.from(this.launches.values())
      .filter(l => l.status === status)
      .sort((a, b) => a.launchDate - b.launchDate);
  }

  /**
   * Get upcoming launches
   */
  getUpcomingLaunches(days = 30): TokenLaunch[] {
    const now = Date.now();
    const cutoff = now + days * 24 * 60 * 60 * 1000;

    return Array.from(this.launches.values())
      .filter(l => l.status === 'upcoming' && l.launchDate >= now && l.launchDate <= cutoff)
      .sort((a, b) => a.launchDate - b.launchDate);
  }

  /**
   * Get live launches
   */
  getLiveLaunches(): TokenLaunch[] {
    const now = Date.now();
    return Array.from(this.launches.values())
      .filter(l => l.status === 'live' && l.launchDate <= now)
      .sort((a, b) => a.launchDate - b.launchDate);
  }

  /**
   * Add participation
   */
  addParticipation(participation: LaunchParticipation): void {
    const key = participation.walletAddress.toLowerCase();
    if (!this.participations.has(key)) {
      this.participations.set(key, []);
    }

    this.participations.get(key)!.push(participation);
  }

  /**
   * Get user participations
   */
  getUserParticipations(walletAddress: string): LaunchParticipation[] {
    return this.participations.get(walletAddress.toLowerCase()) || [];
  }

  /**
   * Calculate ROI for launch
   */
  calculateROI(launch: TokenLaunch): number | null {
    if (!launch.currentPrice || launch.status !== 'completed') {
      return null;
    }

    const roi = ((launch.currentPrice - launch.launchPrice) / launch.launchPrice) * 100;
    return Math.round(roi * 100) / 100;
  }

  /**
   * Get statistics
   */
  getStats(walletAddress?: string): LaunchpadStats {
    const launches = Array.from(this.launches.values());
    const upcomingLaunches = launches.filter(l => l.status === 'upcoming').length;
    const liveLaunches = launches.filter(l => l.status === 'live').length;
    const completedLaunches = launches.filter(l => l.status === 'completed').length;

    const totalRaised = launches.reduce((sum, l) => sum + l.totalRaised, 0);

    // Calculate average ROI
    const completedWithPrice = launches.filter(
      l => l.status === 'completed' && l.currentPrice
    );
    const rois = completedWithPrice.map(l => this.calculateROI(l)).filter((r): r is number => r !== null);
    const averageROI = rois.length > 0
      ? rois.reduce((sum, roi) => sum + roi, 0) / rois.length
      : 0;

    // Find top performer
    const topPerformer = completedWithPrice.length > 0
      ? completedWithPrice.reduce((best, current) => {
          const bestROI = this.calculateROI(best) || 0;
          const currentROI = this.calculateROI(current) || 0;
          return currentROI > bestROI ? current : best;
        })
      : null;

    // User stats
    let userParticipations = 0;
    let userInvested = 0;

    if (walletAddress) {
      const userParts = this.getUserParticipations(walletAddress);
      userParticipations = userParts.length;
      userInvested = userParts.reduce((sum, p) => sum + p.amountInvested, 0);
    }

    return {
      totalLaunches: launches.length,
      upcomingLaunches,
      liveLaunches,
      completedLaunches,
      totalRaised,
      averageROI: Math.round(averageROI * 100) / 100,
      topPerformer,
      userParticipations,
      userInvested,
    };
  }

  /**
   * Analyze launch risk
   */
  analyzeLaunchRisk(launch: TokenLaunch): {
    riskScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high';
    factors: string[];
  } {
    let riskScore = 0;
    const factors: string[] = [];

    // Audit status
    if (launch.auditStatus === 'unaudited') {
      riskScore += 30;
      factors.push('Unaudited contract');
    }

    // KYC requirement
    if (!launch.kycRequired) {
      riskScore += 10;
      factors.push('No KYC requirement');
    }

    // Platform reputation (simplified)
    const reputablePlatforms = ['CoinList', 'Polkastarter', 'DAO Maker'];
    if (!reputablePlatforms.includes(launch.platform)) {
      riskScore += 15;
      factors.push('Unknown or new platform');
    }

    // Hard cap check
    if (launch.hardCap && launch.totalRaised >= launch.hardCap * 0.9) {
      riskScore += 5;
      factors.push('Near hard cap');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskScore >= 50) {
      riskLevel = 'high';
    } else if (riskScore >= 25) {
      riskLevel = 'medium';
    }

    return {
      riskScore: Math.min(100, riskScore),
      riskLevel,
      factors,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.launches.clear();
    this.participations.clear();
  }
}

// Singleton instance
export const tokenLaunchpadPlatform = new TokenLaunchpadPlatform();

