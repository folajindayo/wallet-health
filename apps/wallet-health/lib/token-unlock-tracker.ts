/**
 * Token Unlock Tracker Utility
 * Track token vesting and unlock schedules
 */

export interface UnlockSchedule {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  beneficiary: string;
  totalAmount: string;
  unlockedAmount: string;
  lockedAmount: string;
  startDate: number;
  endDate: number;
  cliffDate?: number;
  cliffAmount?: string;
  unlockType: 'linear' | 'cliff' | 'step' | 'custom';
  unlockEvents: UnlockEvent[];
}

export interface UnlockEvent {
  date: number;
  amount: string;
  percentage: number;
  unlocked: boolean;
  transactionHash?: string;
}

export interface UnlockSummary {
  totalSchedules: number;
  totalLocked: string;
  totalUnlocked: string;
  totalValueUSD: number;
  upcomingUnlocks: Array<{
    schedule: UnlockSchedule;
    event: UnlockEvent;
    daysUntil: number;
  }>;
  overdueUnlocks: Array<{
    schedule: UnlockSchedule;
    event: UnlockEvent;
    daysOverdue: number;
  }>;
}

export class TokenUnlockTracker {
  private schedules: Map<string, UnlockSchedule[]> = new Map();

  /**
   * Add unlock schedule
   */
  addSchedule(schedule: Omit<UnlockSchedule, 'id' | 'unlockEvents'>): UnlockSchedule {
    const id = `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate unlock events
    const unlockEvents = this.calculateUnlockEvents(schedule);

    const fullSchedule: UnlockSchedule = {
      ...schedule,
      id,
      unlockEvents,
    };

    const key = schedule.beneficiary.toLowerCase();
    if (!this.schedules.has(key)) {
      this.schedules.set(key, []);
    }

    this.schedules.get(key)!.push(fullSchedule);
    return fullSchedule;
  }

  /**
   * Calculate unlock events
   */
  private calculateUnlockEvents(schedule: Omit<UnlockSchedule, 'id' | 'unlockEvents'>): UnlockEvent[] {
    const events: UnlockEvent[] = [];
    const totalAmount = parseFloat(schedule.totalAmount);
    const now = Date.now();

    if (schedule.unlockType === 'linear') {
      // Linear unlock - gradual release
      const duration = schedule.endDate - schedule.startDate;
      const monthlyUnlocks = Math.ceil(duration / (30 * 24 * 60 * 60 * 1000));
      const amountPerUnlock = totalAmount / monthlyUnlocks;

      for (let i = 0; i < monthlyUnlocks; i++) {
        const unlockDate = schedule.startDate + (duration / monthlyUnlocks) * i;
        const isUnlocked = now >= unlockDate;

        events.push({
          date: unlockDate,
          amount: amountPerUnlock.toString(),
          percentage: (1 / monthlyUnlocks) * 100,
          unlocked: isUnlocked,
        });
      }
    } else if (schedule.unlockType === 'cliff') {
      // Cliff unlock - all at once
      const cliffDate = schedule.cliffDate || schedule.endDate;
      const cliffAmount = schedule.cliffAmount || schedule.totalAmount;
      const isUnlocked = now >= cliffDate;

      events.push({
        date: cliffDate,
        amount: cliffAmount,
        percentage: 100,
        unlocked: isUnlocked,
      });
    } else if (schedule.unlockType === 'step') {
      // Step unlock - quarterly or monthly releases
      const steps = 4; // Quarterly
      const stepDuration = (schedule.endDate - schedule.startDate) / steps;
      const amountPerStep = totalAmount / steps;

      for (let i = 0; i < steps; i++) {
        const unlockDate = schedule.startDate + stepDuration * i;
        const isUnlocked = now >= unlockDate;

        events.push({
          date: unlockDate,
          amount: amountPerStep.toString(),
          percentage: (1 / steps) * 100,
          unlocked: isUnlocked,
        });
      }
    }

    return events.sort((a, b) => a.date - b.date);
  }

  /**
   * Get schedules for beneficiary
   */
  getSchedules(beneficiary: string): UnlockSchedule[] {
    const key = beneficiary.toLowerCase();
    return this.schedules.get(key) || [];
  }

  /**
   * Get schedule by ID
   */
  getSchedule(id: string): UnlockSchedule | null {
    for (const schedules of this.schedules.values()) {
      const schedule = schedules.find(s => s.id === id);
      if (schedule) {
        return schedule;
      }
    }
    return null;
  }

  /**
   * Mark unlock event as executed
   */
  markUnlocked(scheduleId: string, eventDate: number, transactionHash: string): boolean {
    const schedule = this.getSchedule(scheduleId);
    if (!schedule) {
      return false;
    }

    const event = schedule.unlockEvents.find(e => e.date === eventDate);
    if (!event) {
      return false;
    }

    event.unlocked = true;
    event.transactionHash = transactionHash;

    // Update schedule amounts
    const unlockedAmount = schedule.unlockEvents
      .filter(e => e.unlocked)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    schedule.unlockedAmount = unlockedAmount.toString();
    schedule.lockedAmount = (parseFloat(schedule.totalAmount) - unlockedAmount).toString();

    return true;
  }

  /**
   * Get summary
   */
  getSummary(beneficiary: string): UnlockSummary {
    const schedules = this.getSchedules(beneficiary);
    const now = Date.now();

    const totalLocked = schedules.reduce((sum, s) => {
      return sum + parseFloat(s.lockedAmount);
    }, 0);

    const totalUnlocked = schedules.reduce((sum, s) => {
      return sum + parseFloat(s.unlockedAmount);
    }, 0);

    // Find upcoming unlocks
    const upcomingUnlocks: UnlockSummary['upcomingUnlocks'] = [];
    schedules.forEach(schedule => {
      schedule.unlockEvents.forEach(event => {
        if (!event.unlocked && event.date > now) {
          const daysUntil = Math.ceil((event.date - now) / (24 * 60 * 60 * 1000));
          upcomingUnlocks.push({
            schedule,
            event,
            daysUntil,
          });
        }
      });
    });

    // Find overdue unlocks
    const overdueUnlocks: UnlockSummary['overdueUnlocks'] = [];
    schedules.forEach(schedule => {
      schedule.unlockEvents.forEach(event => {
        if (!event.unlocked && event.date <= now) {
          const daysOverdue = Math.ceil((now - event.date) / (24 * 60 * 60 * 1000));
          overdueUnlocks.push({
            schedule,
            event,
            daysOverdue,
          });
        }
      });
    });

    upcomingUnlocks.sort((a, b) => a.daysUntil - b.daysUntil);
    overdueUnlocks.sort((a, b) => b.daysOverdue - a.daysOverdue);

    return {
      totalSchedules: schedules.length,
      totalLocked: totalLocked.toString(),
      totalUnlocked: totalUnlocked.toString(),
      totalValueUSD: 0, // Would need token price
      upcomingUnlocks: upcomingUnlocks.slice(0, 10),
      overdueUnlocks: overdueUnlocks.slice(0, 10),
    };
  }

  /**
   * Get upcoming unlocks
   */
  getUpcomingUnlocks(beneficiary: string, days = 30): UnlockSummary['upcomingUnlocks'] {
    const summary = this.getSummary(beneficiary);
    return summary.upcomingUnlocks.filter(u => u.daysUntil <= days);
  }

  /**
   * Clear schedules
   */
  clear(beneficiary?: string): void {
    if (beneficiary) {
      this.schedules.delete(beneficiary.toLowerCase());
    } else {
      this.schedules.clear();
    }
  }
}

// Singleton instance
export const tokenUnlockTracker = new TokenUnlockTracker();
