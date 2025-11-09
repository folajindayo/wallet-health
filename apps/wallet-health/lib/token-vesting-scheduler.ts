/**
 * Token Vesting Scheduler Utility
 * Schedules and tracks token vesting
 */

export interface VestingSchedule {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  beneficiary: string;
  totalAmount: string;
  startDate: number;
  endDate: number;
  cliffDate?: number;
  cliffAmount?: string;
  vestingType: 'linear' | 'cliff' | 'step' | 'custom';
  releaseSchedule: VestingRelease[];
  isRevocable: boolean;
  revoked: boolean;
  revokedAt?: number;
}

export interface VestingRelease {
  date: number;
  amount: string;
  percentage: number;
  released: boolean;
  releaseTransactionHash?: string;
}

export interface VestingStats {
  totalSchedules: number;
  activeSchedules: number;
  totalVestingValue: number; // USD
  unlockedValue: number; // USD
  lockedValue: number; // USD
  upcomingReleases: VestingRelease[];
  overdueReleases: VestingRelease[];
}

export class TokenVestingScheduler {
  private schedules: Map<string, VestingSchedule> = new Map();

  /**
   * Create vesting schedule
   */
  createSchedule(schedule: Omit<VestingSchedule, 'id' | 'releaseSchedule'>): VestingSchedule {
    const id = `vesting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate release schedule
    const releaseSchedule = this.calculateReleaseSchedule(schedule);

    const fullSchedule: VestingSchedule = {
      ...schedule,
      id,
      releaseSchedule,
      revoked: false,
    };

    this.schedules.set(id, fullSchedule);
    return fullSchedule;
  }

  /**
   * Calculate release schedule
   */
  private calculateReleaseSchedule(
    schedule: Omit<VestingSchedule, 'id' | 'releaseSchedule'>
  ): VestingRelease[] {
    const releases: VestingRelease[] = [];
    const totalAmount = parseFloat(schedule.totalAmount);
    const duration = schedule.endDate - schedule.startDate;

    if (schedule.vestingType === 'linear') {
      // Linear vesting - release gradually
      const monthlyReleases = Math.ceil(duration / (30 * 24 * 60 * 60 * 1000));
      const amountPerRelease = totalAmount / monthlyReleases;

      for (let i = 0; i < monthlyReleases; i++) {
        const releaseDate = schedule.startDate + (duration / monthlyReleases) * i;
        const isReleased = Date.now() >= releaseDate && !schedule.revoked;

        releases.push({
          date: releaseDate,
          amount: amountPerRelease.toString(),
          percentage: (1 / monthlyReleases) * 100,
          released: isReleased,
        });
      }
    } else if (schedule.vestingType === 'cliff') {
      // Cliff vesting - all at once after cliff
      const cliffDate = schedule.cliffDate || schedule.endDate;
      const cliffAmount = schedule.cliffAmount || schedule.totalAmount;
      const isReleased = Date.now() >= cliffDate && !schedule.revoked;

      releases.push({
        date: cliffDate,
        amount: cliffAmount,
        percentage: 100,
        released: isReleased,
      });
    } else if (schedule.vestingType === 'step') {
      // Step vesting - releases at specific intervals
      const steps = 4; // Quarterly releases
      const stepDuration = duration / steps;
      const amountPerStep = totalAmount / steps;

      for (let i = 0; i < steps; i++) {
        const releaseDate = schedule.startDate + stepDuration * i;
        const isReleased = Date.now() >= releaseDate && !schedule.revoked;

        releases.push({
          date: releaseDate,
          amount: amountPerStep.toString(),
          percentage: (1 / steps) * 100,
          released: isReleased,
        });
      }
    }

    return releases;
  }

  /**
   * Get schedule
   */
  getSchedule(id: string): VestingSchedule | null {
    return this.schedules.get(id) || null;
  }

  /**
   * Get schedules for beneficiary
   */
  getBeneficiarySchedules(beneficiary: string): VestingSchedule[] {
    return Array.from(this.schedules.values()).filter(
      s => s.beneficiary.toLowerCase() === beneficiary.toLowerCase()
    );
  }

  /**
   * Mark release as executed
   */
  markReleaseExecuted(
    scheduleId: string,
    releaseDate: number,
    transactionHash: string
  ): boolean {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      return false;
    }

    const release = schedule.releaseSchedule.find(r => r.date === releaseDate);
    if (!release) {
      return false;
    }

    release.released = true;
    release.releaseTransactionHash = transactionHash;
    return true;
  }

  /**
   * Revoke schedule
   */
  revokeSchedule(scheduleId: string): boolean {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule || !schedule.isRevocable || schedule.revoked) {
      return false;
    }

    schedule.revoked = true;
    schedule.revokedAt = Date.now();
    return true;
  }

  /**
   * Get statistics
   */
  getStats(beneficiary?: string): VestingStats {
    let schedules = Array.from(this.schedules.values());

    if (beneficiary) {
      schedules = schedules.filter(
        s => s.beneficiary.toLowerCase() === beneficiary.toLowerCase()
      );
    }

    const activeSchedules = schedules.filter(s => !s.revoked);
    
    // Calculate values (would need token prices)
    const totalVestingValue = schedules.reduce(
      (sum, s) => sum + parseFloat(s.totalAmount),
      0
    );

    let unlockedValue = 0;
    let lockedValue = 0;
    const upcomingReleases: VestingRelease[] = [];
    const overdueReleases: VestingRelease[] = [];
    const now = Date.now();

    schedules.forEach(schedule => {
      schedule.releaseSchedule.forEach(release => {
        const amount = parseFloat(release.amount);
        if (release.released) {
          unlockedValue += amount;
        } else if (release.date <= now) {
          lockedValue += amount;
          overdueReleases.push(release);
        } else {
          lockedValue += amount;
          upcomingReleases.push(release);
        }
      });
    });

    upcomingReleases.sort((a, b) => a.date - b.date);
    overdueReleases.sort((a, b) => a.date - b.date);

    return {
      totalSchedules: schedules.length,
      activeSchedules: activeSchedules.length,
      totalVestingValue,
      unlockedValue,
      lockedValue,
      upcomingReleases: upcomingReleases.slice(0, 10),
      overdueReleases: overdueReleases.slice(0, 10),
    };
  }

  /**
   * Get upcoming releases
   */
  getUpcomingReleases(days = 30, beneficiary?: string): Array<{
    schedule: VestingSchedule;
    release: VestingRelease;
  }> {
    const now = Date.now();
    const cutoff = now + days * 24 * 60 * 60 * 1000;
    const results: Array<{ schedule: VestingSchedule; release: VestingRelease }> = [];

    this.schedules.forEach(schedule => {
      if (beneficiary && schedule.beneficiary.toLowerCase() !== beneficiary.toLowerCase()) {
        return;
      }

      if (schedule.revoked) {
        return;
      }

      schedule.releaseSchedule.forEach(release => {
        if (!release.released && release.date >= now && release.date <= cutoff) {
          results.push({ schedule, release });
        }
      });
    });

    results.sort((a, b) => a.release.date - b.release.date);
    return results;
  }

  /**
   * Clear all schedules
   */
  clear(): void {
    this.schedules.clear();
  }
}

// Singleton instance
export const tokenVestingScheduler = new TokenVestingScheduler();

