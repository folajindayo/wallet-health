/**
 * Staking Tracker
 * Tracks staking positions, rewards, and performance
 */

export interface StakingPosition {
  id: string;
  walletAddress: string;
  chainId: number;
  protocol: string;
  tokenAddress: string;
  tokenSymbol: string;
  stakedAmount: string;
  stakedAmountUSD?: number;
  rewardToken?: string;
  rewardTokenSymbol?: string;
  apy?: number;
  startDate: number;
  lastRewardDate?: number;
  totalRewards?: string;
  totalRewardsUSD?: number;
  status: 'active' | 'unstaking' | 'withdrawn';
  unstakingDate?: number;
  withdrawalDate?: number;
  metadata?: Record<string, any>;
}

export interface StakingReward {
  positionId: string;
  timestamp: number;
  amount: string;
  amountUSD?: number;
  tokenAddress: string;
  tokenSymbol: string;
  transactionHash?: string;
  type: 'reward' | 'compound' | 'withdrawal';
}

export interface StakingSummary {
  totalPositions: number;
  activePositions: number;
  totalStaked: string;
  totalStakedUSD: number;
  totalRewards: string;
  totalRewardsUSD: number;
  averageAPY: number;
  protocols: Record<string, {
    count: number;
    totalStaked: string;
    totalStakedUSD: number;
    averageAPY: number;
  }>;
  chains: Record<number, {
    chainId: number;
    positions: number;
    totalStaked: string;
    totalStakedUSD: number;
  }>;
}

export class StakingTracker {
  private positions: Map<string, StakingPosition[]> = new Map(); // wallet -> positions
  private rewards: Map<string, StakingReward[]> = new Map(); // wallet -> rewards

  /**
   * Add staking position
   */
  addPosition(
    walletAddress: string,
    position: Omit<StakingPosition, 'id'>
  ): StakingPosition {
    const walletKey = walletAddress.toLowerCase();
    if (!this.positions.has(walletKey)) {
      this.positions.set(walletKey, []);
    }

    const fullPosition: StakingPosition = {
      ...position,
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      walletAddress: walletAddress.toLowerCase(),
    };

    this.positions.get(walletKey)!.push(fullPosition);
    return fullPosition;
  }

  /**
   * Update position
   */
  updatePosition(
    walletAddress: string,
    positionId: string,
    updates: Partial<StakingPosition>
  ): boolean {
    const walletKey = walletAddress.toLowerCase();
    const positions = this.positions.get(walletKey) || [];
    const position = positions.find(p => p.id === positionId);

    if (!position) return false;

    Object.assign(position, updates);
    return true;
  }

  /**
   * Record reward
   */
  recordReward(
    walletAddress: string,
    reward: StakingReward
  ): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.rewards.has(walletKey)) {
      this.rewards.set(walletKey, []);
    }

    this.rewards.get(walletKey)!.push(reward);

    // Update position total rewards
    const positions = this.positions.get(walletKey) || [];
    const position = positions.find(p => p.id === reward.positionId);
    if (position) {
      const currentRewards = BigInt(position.totalRewards || '0');
      position.totalRewards = (
        currentRewards + BigInt(reward.amount)
      ).toString();
      position.lastRewardDate = reward.timestamp;
    }
  }

  /**
   * Get staking summary
   */
  getSummary(walletAddress: string): StakingSummary {
    const walletKey = walletAddress.toLowerCase();
    const positions = this.positions.get(walletKey) || [];
    const rewards = this.rewards.get(walletKey) || [];

    const activePositions = positions.filter(p => p.status === 'active');
    const totalStaked = positions.reduce(
      (sum, p) => sum + BigInt(p.stakedAmount),
      BigInt(0)
    ).toString();

    const totalStakedUSD = positions.reduce(
      (sum, p) => sum + (p.stakedAmountUSD || 0),
      0
    );

    const totalRewards = rewards.reduce(
      (sum, r) => sum + BigInt(r.amount),
      BigInt(0)
    ).toString();

    const totalRewardsUSD = rewards.reduce(
      (sum, r) => sum + (r.amountUSD || 0),
      0
    );

    // Calculate average APY
    const positionsWithAPY = positions.filter(p => p.apy !== undefined);
    const averageAPY =
      positionsWithAPY.length > 0
        ? positionsWithAPY.reduce((sum, p) => sum + (p.apy || 0), 0) /
          positionsWithAPY.length
        : 0;

    // Protocol breakdown
    const protocols: Record<string, {
      count: number;
      totalStaked: bigint;
      totalStakedUSD: number;
      totalAPY: number;
      countWithAPY: number;
    }> = {};

    positions.forEach(position => {
      if (!protocols[position.protocol]) {
        protocols[position.protocol] = {
          count: 0,
          totalStaked: BigInt(0),
          totalStakedUSD: 0,
          totalAPY: 0,
          countWithAPY: 0,
        };
      }

      protocols[position.protocol].count++;
      protocols[position.protocol].totalStaked += BigInt(position.stakedAmount);
      protocols[position.protocol].totalStakedUSD += position.stakedAmountUSD || 0;

      if (position.apy !== undefined) {
        protocols[position.protocol].totalAPY += position.apy;
        protocols[position.protocol].countWithAPY++;
      }
    });

    // Chain breakdown
    const chains: Record<number, {
      chainId: number;
      positions: number;
      totalStaked: bigint;
      totalStakedUSD: number;
    }> = {};

    positions.forEach(position => {
      if (!chains[position.chainId]) {
        chains[position.chainId] = {
          chainId: position.chainId,
          positions: 0,
          totalStaked: BigInt(0),
          totalStakedUSD: 0,
        };
      }

      chains[position.chainId].positions++;
      chains[position.chainId].totalStaked += BigInt(position.stakedAmount);
      chains[position.chainId].totalStakedUSD += position.stakedAmountUSD || 0;
    });

    return {
      totalPositions: positions.length,
      activePositions: activePositions.length,
      totalStaked,
      totalStakedUSD,
      totalRewards,
      totalRewardsUSD,
      averageAPY: Math.round(averageAPY * 100) / 100,
      protocols: Object.fromEntries(
        Object.entries(protocols).map(([protocol, data]) => [
          protocol,
          {
            count: data.count,
            totalStaked: data.totalStaked.toString(),
            totalStakedUSD: data.totalStakedUSD,
            averageAPY:
              data.countWithAPY > 0
                ? Math.round((data.totalAPY / data.countWithAPY) * 100) / 100
                : 0,
          },
        ])
      ),
      chains: Object.fromEntries(
        Object.entries(chains).map(([chainId, data]) => [
          parseInt(chainId),
          {
            ...data,
            totalStaked: data.totalStaked.toString(),
          },
        ])
      ),
    };
  }

  /**
   * Get all positions
   */
  getPositions(
    walletAddress: string,
    options: {
      status?: StakingPosition['status'];
      protocol?: string;
      chainId?: number;
    } = {}
  ): StakingPosition[] {
    const walletKey = walletAddress.toLowerCase();
    let positions = this.positions.get(walletKey) || [];

    if (options.status) {
      positions = positions.filter(p => p.status === options.status);
    }

    if (options.protocol) {
      positions = positions.filter(p => p.protocol === options.protocol);
    }

    if (options.chainId) {
      positions = positions.filter(p => p.chainId === options.chainId);
    }

    return positions;
  }

  /**
   * Get rewards
   */
  getRewards(
    walletAddress: string,
    options: {
      positionId?: string;
      limit?: number;
      since?: number;
    } = {}
  ): StakingReward[] {
    const walletKey = walletAddress.toLowerCase();
    let rewards = this.rewards.get(walletKey) || [];

    if (options.positionId) {
      rewards = rewards.filter(r => r.positionId === options.positionId);
    }

    if (options.since) {
      rewards = rewards.filter(r => r.timestamp >= options.since!);
    }

    rewards.sort((a, b) => b.timestamp - a.timestamp);

    if (options.limit) {
      rewards = rewards.slice(0, options.limit);
    }

    return rewards;
  }

  /**
   * Calculate estimated annual rewards
   */
  calculateEstimatedRewards(walletAddress: string): {
    totalEstimatedAnnual: string;
    totalEstimatedAnnualUSD?: number;
    byPosition: Array<{
      positionId: string;
      estimatedAnnual: string;
      estimatedAnnualUSD?: number;
    }>;
  } {
    const positions = this.getPositions(walletAddress, { status: 'active' });
    let totalEstimated = BigInt(0);

    const byPosition = positions.map(position => {
      if (!position.apy || !position.stakedAmount) {
        return {
          positionId: position.id,
          estimatedAnnual: '0',
        };
      }

      const staked = BigInt(position.stakedAmount);
      const apyDecimal = position.apy / 100;
      const estimated = (staked * BigInt(Math.floor(apyDecimal * 10000))) / BigInt(10000);
      totalEstimated += estimated;

      return {
        positionId: position.id,
        estimatedAnnual: estimated.toString(),
        estimatedAnnualUSD: position.stakedAmountUSD
          ? (position.stakedAmountUSD * position.apy) / 100
          : undefined,
      };
    });

    return {
      totalEstimatedAnnual: totalEstimated.toString(),
      byPosition,
    };
  }
}

// Singleton instance
export const stakingTracker = new StakingTracker();
