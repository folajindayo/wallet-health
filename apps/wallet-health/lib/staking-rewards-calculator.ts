/**
 * Staking Rewards Calculator Utility
 * Calculate staking rewards and APY
 */

export interface StakingPosition {
  id: string;
  protocol: string;
  chainId: number;
  tokenAddress: string;
  tokenSymbol: string;
  stakedAmount: string;
  stakedAmountUSD: number;
  rewardTokenAddress?: string;
  rewardTokenSymbol?: string;
  apy: number; // Annual percentage yield
  apr: number; // Annual percentage rate
  lockPeriod?: number; // days
  unstakingPeriod?: number; // days
  startedAt: number;
  rewardsEarned: string;
  rewardsEarnedUSD: number;
  claimableRewards: string;
  claimableRewardsUSD: number;
}

export interface RewardsCalculation {
  position: StakingPosition;
  dailyRewards: number; // USD
  weeklyRewards: number; // USD
  monthlyRewards: number; // USD
  yearlyRewards: number; // USD
  effectiveAPY: number; // Percentage (accounting for compounding)
  breakEvenDays: number; // Days to break even on gas costs
  roi: number; // Return on investment percentage
}

export interface StakingComparison {
  positions: Array<{
    position: StakingPosition;
    calculation: RewardsCalculation;
  }>;
  bestAPY: StakingPosition | null;
  bestROI: StakingPosition | null;
  totalStaked: number; // USD
  totalRewards: number; // USD
}

export class StakingRewardsCalculator {
  private readonly GAS_COST_CLAIM = 0.001; // ETH (would vary)
  private readonly ETH_PRICE_USD = 2000;

  /**
   * Calculate rewards
   */
  calculateRewards(position: StakingPosition): RewardsCalculation {
    const stakedUSD = position.stakedAmountUSD;
    const apy = position.apy / 100;

    // Simple interest calculation
    const yearlyRewards = stakedUSD * apy;
    const monthlyRewards = yearlyRewards / 12;
    const weeklyRewards = yearlyRewards / 52;
    const dailyRewards = yearlyRewards / 365;

    // Effective APY with compounding (daily)
    const effectiveAPY = ((1 + apy / 365) ** 365 - 1) * 100;

    // Break-even calculation (gas cost vs rewards)
    const gasCostUSD = this.GAS_COST_CLAIM * this.ETH_PRICE_USD;
    const breakEvenDays = dailyRewards > 0
      ? Math.ceil(gasCostUSD / dailyRewards)
      : Infinity;

    // ROI calculation
    const totalRewardsUSD = position.rewardsEarnedUSD + position.claimableRewardsUSD;
    const daysStaked = (Date.now() - position.startedAt) / (24 * 60 * 60 * 1000);
    const roi = stakedUSD > 0 && daysStaked > 0
      ? (totalRewardsUSD / stakedUSD) * (365 / daysStaked) * 100
      : 0;

    return {
      position,
      dailyRewards: Math.round(dailyRewards * 100) / 100,
      weeklyRewards: Math.round(weeklyRewards * 100) / 100,
      monthlyRewards: Math.round(monthlyRewards * 100) / 100,
      yearlyRewards: Math.round(yearlyRewards * 100) / 100,
      effectiveAPY: Math.round(effectiveAPY * 100) / 100,
      breakEvenDays: Math.round(breakEvenDays),
      roi: Math.round(roi * 100) / 100,
    };
  }

  /**
   * Calculate optimal claim frequency
   */
  calculateOptimalClaimFrequency(position: StakingPosition): {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    days: number;
    totalRewards: number; // USD
    netRewards: number; // USD after gas
    reasoning: string;
  } {
    const calculation = this.calculateRewards(position);
    const gasCostUSD = this.GAS_COST_CLAIM * this.ETH_PRICE_USD;

    // Calculate net rewards for different frequencies
    const dailyNet = calculation.dailyRewards - gasCostUSD;
    const weeklyNet = calculation.weeklyRewards * 7 - gasCostUSD;
    const monthlyNet = calculation.monthlyRewards * 30 - gasCostUSD;

    let frequency: 'daily' | 'weekly' | 'monthly' | 'custom' = 'monthly';
    let days = 30;
    let totalRewards = calculation.monthlyRewards * 30;
    let netRewards = monthlyNet;
    let reasoning = 'Monthly claiming balances rewards and gas costs';

    if (dailyNet > 0 && calculation.dailyRewards > gasCostUSD * 2) {
      frequency = 'daily';
      days = 1;
      totalRewards = calculation.dailyRewards;
      netRewards = dailyNet;
      reasoning = 'Daily rewards exceed gas costs significantly';
    } else if (weeklyNet > monthlyNet) {
      frequency = 'weekly';
      days = 7;
      totalRewards = calculation.weeklyRewards * 7;
      netRewards = weeklyNet;
      reasoning = 'Weekly claiming optimizes net rewards';
    }

    return {
      frequency,
      days,
      totalRewards: Math.round(totalRewards * 100) / 100,
      netRewards: Math.round(netRewards * 100) / 100,
      reasoning,
    };
  }

  /**
   * Compare staking positions
   */
  comparePositions(positions: StakingPosition[]): StakingComparison {
    const calculations = positions.map(p => ({
      position: p,
      calculation: this.calculateRewards(p),
    }));

    const bestAPY = calculations.reduce((best, current) =>
      current.position.apy > best.position.apy ? current : best
    ).position;

    const bestROI = calculations.reduce((best, current) =>
      current.calculation.roi > best.calculation.roi ? current : best
    ).position;

    const totalStaked = positions.reduce((sum, p) => sum + p.stakedAmountUSD, 0);
    const totalRewards = positions.reduce((sum, p) => sum + p.rewardsEarnedUSD + p.claimableRewardsUSD, 0);

    return {
      positions: calculations,
      bestAPY,
      bestROI,
      totalStaked: Math.round(totalStaked * 100) / 100,
      totalRewards: Math.round(totalRewards * 100) / 100,
    };
  }

  /**
   * Calculate projected rewards
   */
  calculateProjectedRewards(
    position: StakingPosition,
    days: number
  ): {
    projectedRewards: number; // USD
    projectedTotal: number; // USD (staked + rewards)
    growthPercent: number;
  } {
    const calculation = this.calculateRewards(position);
    const projectedRewards = calculation.dailyRewards * days;
    const projectedTotal = position.stakedAmountUSD + projectedRewards;
    const growthPercent = position.stakedAmountUSD > 0
      ? (projectedRewards / position.stakedAmountUSD) * 100
      : 0;

    return {
      projectedRewards: Math.round(projectedRewards * 100) / 100,
      projectedTotal: Math.round(projectedTotal * 100) / 100,
      growthPercent: Math.round(growthPercent * 100) / 100,
    };
  }
}

// Singleton instance
export const stakingRewardsCalculator = new StakingRewardsCalculator();

