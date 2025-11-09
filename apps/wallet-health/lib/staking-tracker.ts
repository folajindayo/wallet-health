/**
 * Staking Tracker Utility
 * Tracks staking positions and rewards
 */

export interface StakingPosition {
  protocol: string;
  protocolAddress: string;
  chainId: number;
  tokenAddress: string;
  tokenSymbol: string;
  stakedAmount: string;
  stakedValueUSD: number;
  stakedAt: number;
  unlockDate?: number;
  apr: number;
  apy?: number;
  rewardsEarned: string;
  rewardsValueUSD: number;
  claimableRewards: string;
  claimableValueUSD: number;
  status: 'active' | 'unstaking' | 'unlocked';
}

export interface StakingReward {
  positionId: string;
  amount: string;
  valueUSD: number;
  timestamp: number;
  transactionHash: string;
  claimed: boolean;
}

export interface StakingSummary {
  totalPositions: number;
  totalStaked: number; // USD
  totalRewards: number; // USD
  totalClaimable: number; // USD
  averageAPR: number;
  estimatedAnnualRewards: number; // USD
  positions: StakingPosition[];
  topPerformer: StakingPosition | null;
  recommendations: string[];
}

export interface StakingPerformance {
  position: StakingPosition;
  daysStaked: number;
  totalReturn: number; // USD
  totalReturnPercent: number;
  effectiveAPR: number;
  projectedAnnualReturn: number; // USD
}

export class StakingTracker {
  private positions: Map<string, StakingPosition> = new Map();
  private rewards: Map<string, StakingReward[]> = new Map();

  /**
   * Add a staking position
   */
  addPosition(position: StakingPosition): void {
    const key = `${position.protocolAddress.toLowerCase()}-${position.tokenAddress.toLowerCase()}`;
    this.positions.set(key, position);
  }

  /**
   * Add a reward
   */
  addReward(reward: StakingReward): void {
    if (!this.rewards.has(reward.positionId)) {
      this.rewards.set(reward.positionId, []);
    }
    this.rewards.get(reward.positionId)!.push(reward);
  }

  /**
   * Get staking summary
   */
  getSummary(): StakingSummary {
    const positions = Array.from(this.positions.values());
    
    const totalStaked = positions.reduce((sum, p) => sum + p.stakedValueUSD, 0);
    const totalRewards = positions.reduce((sum, p) => sum + p.rewardsValueUSD, 0);
    const totalClaimable = positions.reduce((sum, p) => sum + p.claimableValueUSD, 0);

    const averageAPR = positions.length > 0
      ? positions.reduce((sum, p) => sum + p.apr, 0) / positions.length
      : 0;

    const estimatedAnnualRewards = totalStaked * (averageAPR / 100);

    // Find top performer
    const topPerformer = positions.length > 0
      ? positions.reduce((best, current) => 
          current.apr > best.apr ? current : best
        )
      : null;

    // Generate recommendations
    const recommendations: string[] = [];

    if (positions.length === 0) {
      recommendations.push('No staking positions found. Consider staking idle assets to earn rewards.');
    } else {
      if (averageAPR < 5) {
        recommendations.push('Average APR is low. Consider rebalancing to higher yield protocols.');
      }

      if (totalClaimable > 100) {
        recommendations.push(`You have $${totalClaimable.toFixed(2)} in claimable rewards. Consider claiming.`);
      }

      const lowAPRPositions = positions.filter(p => p.apr < 3);
      if (lowAPRPositions.length > 0) {
        recommendations.push(`${lowAPRPositions.length} position(s) have APR < 3%. Review for optimization.`);
      }
    }

    return {
      totalPositions: positions.length,
      totalStaked,
      totalRewards,
      totalClaimable,
      averageAPR: Math.round(averageAPR * 100) / 100,
      estimatedAnnualRewards,
      positions,
      topPerformer,
      recommendations,
    };
  }

  /**
   * Calculate staking performance
   */
  calculatePerformance(position: StakingPosition): StakingPerformance {
    const daysStaked = Math.floor((Date.now() - position.stakedAt) / (24 * 60 * 60 * 1000));
    
    const totalReturn = position.rewardsValueUSD;
    const totalReturnPercent = position.stakedValueUSD > 0
      ? (totalReturn / position.stakedValueUSD) * 100
      : 0;

    // Calculate effective APR based on actual returns
    const effectiveAPR = daysStaked > 0
      ? (totalReturnPercent / daysStaked) * 365
      : position.apr;

    const projectedAnnualReturn = position.stakedValueUSD * (effectiveAPR / 100);

    return {
      position,
      daysStaked,
      totalReturn,
      totalReturnPercent: Math.round(totalReturnPercent * 100) / 100,
      effectiveAPR: Math.round(effectiveAPR * 100) / 100,
      projectedAnnualReturn,
    };
  }

  /**
   * Get rewards for a position
   */
  getPositionRewards(positionId: string): StakingReward[] {
    return this.rewards.get(positionId) || [];
  }

  /**
   * Get all rewards
   */
  getAllRewards(): StakingReward[] {
    const allRewards: StakingReward[] = [];
    this.rewards.forEach(rewardList => {
      allRewards.push(...rewardList);
    });
    return allRewards.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get positions by protocol
   */
  getPositionsByProtocol(protocolAddress: string): StakingPosition[] {
    return Array.from(this.positions.values()).filter(
      p => p.protocolAddress.toLowerCase() === protocolAddress.toLowerCase()
    );
  }

  /**
   * Get positions by chain
   */
  getPositionsByChain(chainId: number): StakingPosition[] {
    return Array.from(this.positions.values()).filter(p => p.chainId === chainId);
  }

  /**
   * Calculate total rewards over time period
   */
  getRewardsOverTime(days: number): Array<{
    date: number;
    rewards: number; // USD
    count: number;
  }> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const allRewards = this.getAllRewards().filter(r => r.timestamp >= cutoff);

    // Group by date
    const rewardsByDate = new Map<number, { rewards: number; count: number }>();

    allRewards.forEach(reward => {
      const dateKey = Math.floor(reward.timestamp / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
      if (!rewardsByDate.has(dateKey)) {
        rewardsByDate.set(dateKey, { rewards: 0, count: 0 });
      }
      const dayData = rewardsByDate.get(dateKey)!;
      dayData.rewards += reward.valueUSD;
      dayData.count++;
    });

    return Array.from(rewardsByDate.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date - b.date);
  }

  /**
   * Compare staking protocols
   */
  compareProtocols(): Array<{
    protocol: string;
    positions: number;
    totalStaked: number;
    averageAPR: number;
    totalRewards: number;
  }> {
    const protocolMap = new Map<string, {
      protocol: string;
      positions: number;
      totalStaked: number;
      totalAPR: number;
      totalRewards: number;
    }>();

    this.positions.forEach(position => {
      const key = position.protocolAddress.toLowerCase();
      if (!protocolMap.has(key)) {
        protocolMap.set(key, {
          protocol: position.protocol,
          positions: 0,
          totalStaked: 0,
          totalAPR: 0,
          totalRewards: 0,
        });
      }

      const stats = protocolMap.get(key)!;
      stats.positions++;
      stats.totalStaked += position.stakedValueUSD;
      stats.totalAPR += position.apr;
      stats.totalRewards += position.rewardsValueUSD;
    });

    return Array.from(protocolMap.values()).map(stats => ({
      protocol: stats.protocol,
      positions: stats.positions,
      totalStaked: stats.totalStaked,
      averageAPR: stats.positions > 0 ? stats.totalAPR / stats.positions : 0,
      totalRewards: stats.totalRewards,
    })).sort((a, b) => b.averageAPR - a.averageAPR);
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.positions.clear();
    this.rewards.clear();
  }
}

// Singleton instance
export const stakingTracker = new StakingTracker();

