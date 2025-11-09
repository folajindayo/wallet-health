/**
 * Token Unlock/Vesting Tracker Utility
 * Tracks token unlocks and vesting schedules
 */

export interface VestingSchedule {
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  totalAmount: string;
  unlockedAmount: string;
  lockedAmount: string;
  startDate: number;
  endDate: number;
  cliffDate?: number;
  vestingType: 'linear' | 'cliff' | 'custom';
  releaseSchedule: VestingRelease[];
}

export interface VestingRelease {
  date: number;
  amount: string;
  percentage: number;
  isUnlocked: boolean;
}

export interface UnlockEvent {
  tokenAddress: string;
  tokenSymbol: string;
  amount: string;
  unlockDate: number;
  daysUntil: number;
  valueUSD?: number;
  isCliff?: boolean;
}

export interface TokenUnlockSummary {
  totalTokens: number;
  totalValueUSD: number;
  upcomingUnlocks: UnlockEvent[];
  recentUnlocks: UnlockEvent[];
  lockedValue: number;
  unlockedValue: number;
  nextUnlock?: UnlockEvent;
  unlockCalendar: Array<{
    date: number;
    unlocks: UnlockEvent[];
    totalValue: number;
  }>;
}

export class TokenUnlockTracker {
  private vestingSchedules: Map<string, VestingSchedule> = new Map();

  /**
   * Add a vesting schedule
   */
  addVestingSchedule(schedule: VestingSchedule): void {
    const key = `${schedule.tokenAddress.toLowerCase()}-${schedule.chainId}`;
    this.vestingSchedules.set(key, schedule);
  }

  /**
   * Calculate unlock schedule
   */
  calculateUnlockSchedule(schedule: VestingSchedule): VestingRelease[] {
    const releases: VestingRelease[] = [];
    const totalAmount = parseFloat(schedule.totalAmount);
    const startTime = schedule.startDate;
    const endTime = schedule.endDate;
    const duration = endTime - startTime;

    if (schedule.vestingType === 'linear') {
      // Linear vesting - unlock gradually over time
      const monthlyReleases = Math.ceil(duration / (30 * 24 * 60 * 60 * 1000));
      const amountPerRelease = totalAmount / monthlyReleases;

      for (let i = 0; i < monthlyReleases; i++) {
        const releaseDate = startTime + (duration / monthlyReleases) * i;
        const isUnlocked = Date.now() >= releaseDate;

        releases.push({
          date: releaseDate,
          amount: amountPerRelease.toString(),
          percentage: (1 / monthlyReleases) * 100,
          isUnlocked,
        });
      }
    } else if (schedule.vestingType === 'cliff') {
      // Cliff vesting - unlock all at once after cliff
      const cliffDate = schedule.cliffDate || endTime;
      const isUnlocked = Date.now() >= cliffDate;

      releases.push({
        date: cliffDate,
        amount: schedule.totalAmount,
        percentage: 100,
        isUnlocked,
      });
    }

    return releases;
  }

  /**
   * Get upcoming unlocks
   */
  getUpcomingUnlocks(days = 30): UnlockEvent[] {
    const unlocks: UnlockEvent[] = [];
    const cutoffDate = Date.now() + days * 24 * 60 * 60 * 1000;

    this.vestingSchedules.forEach(schedule => {
      const releases = this.calculateUnlockSchedule(schedule);
      
      releases.forEach(release => {
        if (!release.isUnlocked && release.date <= cutoffDate) {
          const daysUntil = Math.ceil((release.date - Date.now()) / (24 * 60 * 60 * 1000));
          
          unlocks.push({
            tokenAddress: schedule.tokenAddress,
            tokenSymbol: schedule.tokenSymbol,
            amount: release.amount,
            unlockDate: release.date,
            daysUntil,
            isCliff: schedule.vestingType === 'cliff',
          });
        }
      });
    });

    // Sort by unlock date
    unlocks.sort((a, b) => a.unlockDate - b.unlockDate);

    return unlocks;
  }

  /**
   * Get recent unlocks
   */
  getRecentUnlocks(days = 30): UnlockEvent[] {
    const unlocks: UnlockEvent[] = [];
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;

    this.vestingSchedules.forEach(schedule => {
      const releases = this.calculateUnlockSchedule(schedule);
      
      releases.forEach(release => {
        if (release.isUnlocked && release.date >= cutoffDate) {
          const daysSince = Math.floor((Date.now() - release.date) / (24 * 60 * 60 * 1000));
          
          unlocks.push({
            tokenAddress: schedule.tokenAddress,
            tokenSymbol: schedule.tokenSymbol,
            amount: release.amount,
            unlockDate: release.date,
            daysUntil: -daysSince, // Negative for past unlocks
          });
        }
      });
    });

    // Sort by unlock date (most recent first)
    unlocks.sort((a, b) => b.unlockDate - a.unlockDate);

    return unlocks;
  }

  /**
   * Get unlock summary
   */
  getUnlockSummary(): TokenUnlockSummary {
    const upcomingUnlocks = this.getUpcomingUnlocks(90);
    const recentUnlocks = this.getRecentUnlocks(90);

    // Calculate totals
    let totalTokens = 0;
    let lockedValue = 0;
    let unlockedValue = 0;

    this.vestingSchedules.forEach(schedule => {
      const totalAmount = parseFloat(schedule.totalAmount);
      totalTokens += totalAmount;

      const releases = this.calculateUnlockSchedule(schedule);
      const unlocked = releases.filter(r => r.isUnlocked);
      const locked = releases.filter(r => !r.isUnlocked);

      unlocked.forEach(r => {
        unlockedValue += parseFloat(r.amount);
      });

      locked.forEach(r => {
        lockedValue += parseFloat(r.amount);
      });
    });

    // Create unlock calendar (group by date)
    const calendarMap = new Map<number, UnlockEvent[]>();
    upcomingUnlocks.forEach(unlock => {
      const dateKey = Math.floor(unlock.unlockDate / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
      if (!calendarMap.has(dateKey)) {
        calendarMap.set(dateKey, []);
      }
      calendarMap.get(dateKey)!.push(unlock);
    });

    const unlockCalendar = Array.from(calendarMap.entries())
      .map(([date, unlocks]) => ({
        date,
        unlocks,
        totalValue: unlocks.reduce((sum, u) => sum + (u.valueUSD || 0), 0),
      }))
      .sort((a, b) => a.date - b.date);

    return {
      totalTokens,
      totalValueUSD: lockedValue + unlockedValue, // Would need token prices
      upcomingUnlocks,
      recentUnlocks,
      lockedValue,
      unlockedValue,
      nextUnlock: upcomingUnlocks[0],
      unlockCalendar,
    };
  }

  /**
   * Get vesting schedule for a token
   */
  getVestingSchedule(tokenAddress: string, chainId: number): VestingSchedule | null {
    const key = `${tokenAddress.toLowerCase()}-${chainId}`;
    return this.vestingSchedules.get(key) || null;
  }

  /**
   * Calculate unlock progress
   */
  getUnlockProgress(tokenAddress: string, chainId: number): {
    unlocked: number;
    locked: number;
    percentage: number;
  } | null {
    const schedule = this.getVestingSchedule(tokenAddress, chainId);
    if (!schedule) {
      return null;
    }

    const releases = this.calculateUnlockSchedule(schedule);
    const unlocked = releases.filter(r => r.isUnlocked);
    const locked = releases.filter(r => !r.isUnlocked);

    const unlockedAmount = unlocked.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const lockedAmount = locked.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const totalAmount = unlockedAmount + lockedAmount;
    const percentage = totalAmount > 0 ? (unlockedAmount / totalAmount) * 100 : 0;

    return {
      unlocked: unlockedAmount,
      locked: lockedAmount,
      percentage: Math.round(percentage * 100) / 100,
    };
  }

  /**
   * Clear all schedules
   */
  clear(): void {
    this.vestingSchedules.clear();
  }
}

// Singleton instance
export const tokenUnlockTracker = new TokenUnlockTracker();

