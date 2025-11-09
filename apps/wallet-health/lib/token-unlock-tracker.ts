/**
 * Token Unlock Tracker
 * Tracks token vesting schedules and unlock events
 */

export interface TokenUnlock {
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  unlockType: 'vesting' | 'linear' | 'cliff' | 'custom';
  startDate: number;
  endDate: number;
  totalAmount: string;
  unlockedAmount: string;
  lockedAmount: string;
  unlockSchedule: Array<{
  date: number;
  amount: string;
  percentage: number;
  }>;
  nextUnlock?: {
    date: number;
    amount: string;
    daysUntil: number;
  };
  metadata?: Record<string, any>;
}

export interface UnlockEvent {
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  date: number;
  amount: string;
  amountUSD?: number;
  type: 'unlock' | 'vesting_release' | 'cliff_release';
  transactionHash?: string;
}

export interface UnlockSummary {
  totalLocked: string;
  totalUnlocked: string;
  totalValueUSD?: number;
  upcomingUnlocks: Array<{
    date: number;
    tokens: Array<{
      tokenAddress: string;
      tokenSymbol: string;
      amount: string;
    }>;
    totalAmount: string;
    daysUntil: number;
  }>;
  unlockSchedule: UnlockEvent[];
}

export class TokenUnlockTracker {
  private unlocks: Map<string, TokenUnlock[]> = new Map(); // wallet -> unlocks
  private events: Map<string, UnlockEvent[]> = new Map(); // wallet -> events

  /**
   * Add token unlock schedule
   */
  addUnlockSchedule(
    walletAddress: string,
    unlock: TokenUnlock
  ): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.unlocks.has(walletKey)) {
      this.unlocks.set(walletKey, []);
    }

    const walletUnlocks = this.unlocks.get(walletKey)!;
    
    // Check if already exists
    const existingIndex = walletUnlocks.findIndex(
      u => u.tokenAddress.toLowerCase() === unlock.tokenAddress.toLowerCase() &&
           u.chainId === unlock.chainId
    );

    if (existingIndex >= 0) {
      walletUnlocks[existingIndex] = unlock;
    } else {
      walletUnlocks.push(unlock);
    }
  }

  /**
   * Record unlock event
   */
  recordUnlockEvent(
    walletAddress: string,
    event: UnlockEvent
  ): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.events.has(walletKey)) {
      this.events.set(walletKey, []);
    }

    const walletEvents = this.events.get(walletKey)!;
    walletEvents.push(event);

    // Update unlock schedule
    const unlocks = this.unlocks.get(walletKey) || [];
    const unlock = unlocks.find(
      u => u.tokenAddress.toLowerCase() === event.tokenAddress.toLowerCase() &&
           u.chainId === event.chainId
    );

    if (unlock) {
      const unlocked = BigInt(unlock.unlockedAmount) + BigInt(event.amount);
      unlock.unlockedAmount = unlocked.toString();
      unlock.lockedAmount = (BigInt(unlock.totalAmount) - unlocked).toString();
    }
  }

  /**
   * Get unlock summary for wallet
   */
  getUnlockSummary(
    walletAddress: string,
    daysAhead: number = 90
  ): UnlockSummary {
    const walletKey = walletAddress.toLowerCase();
    const unlocks = this.unlocks.get(walletKey) || [];
    const events = this.events.get(walletKey) || [];

    let totalLocked = BigInt(0);
    let totalUnlocked = BigInt(0);
    const upcomingUnlocksMap = new Map<number, Array<{
      tokenAddress: string;
      tokenSymbol: string;
      amount: string;
    }>>();

    const now = Date.now();
    const cutoff = now + daysAhead * 24 * 60 * 60 * 1000;

    unlocks.forEach(unlock => {
      totalLocked += BigInt(unlock.lockedAmount);
      totalUnlocked += BigInt(unlock.unlockedAmount);

      // Find upcoming unlocks
      unlock.unlockSchedule.forEach(schedule => {
        if (schedule.date > now && schedule.date <= cutoff) {
          const dateKey = schedule.date;
          if (!upcomingUnlocksMap.has(dateKey)) {
            upcomingUnlocksMap.set(dateKey, []);
          }

          upcomingUnlocksMap.get(dateKey)!.push({
            tokenAddress: unlock.tokenAddress,
            tokenSymbol: unlock.tokenSymbol,
            amount: schedule.amount,
          });
        }
      });
    });

    // Convert upcoming unlocks to array
    const upcomingUnlocks = Array.from(upcomingUnlocksMap.entries())
      .map(([date, tokens]) => {
        const totalAmount = tokens.reduce(
          (sum, t) => sum + BigInt(t.amount),
          BigInt(0)
        ).toString();

        return {
        date,
          tokens,
          totalAmount,
          daysUntil: Math.ceil((date - now) / (24 * 60 * 60 * 1000)),
        };
      })
      .sort((a, b) => a.date - b.date);

    // Build unlock schedule from events
    const unlockSchedule = events
      .filter(e => e.date >= now - 90 * 24 * 60 * 60 * 1000) // Last 90 days
      .sort((a, b) => b.date - a.date);

    return {
      totalLocked: totalLocked.toString(),
      totalUnlocked: totalUnlocked.toString(),
      upcomingUnlocks,
      unlockSchedule,
    };
  }

  /**
   * Get next unlock for a token
   */
  getNextUnlock(
    walletAddress: string,
    tokenAddress: string,
    chainId: number
  ): TokenUnlock['nextUnlock'] | null {
    const walletKey = walletAddress.toLowerCase();
    const unlocks = this.unlocks.get(walletKey) || [];
    
    const unlock = unlocks.find(
      u => u.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() &&
           u.chainId === chainId
    );

    if (!unlock || !unlock.nextUnlock) return null;

    return unlock.nextUnlock;
  }

  /**
   * Calculate unlock progress
   */
  calculateUnlockProgress(
    walletAddress: string,
    tokenAddress: string,
    chainId: number
  ): {
    percentage: number;
    unlocked: string;
    locked: string;
    total: string;
    daysRemaining: number;
  } | null {
    const walletKey = walletAddress.toLowerCase();
    const unlocks = this.unlocks.get(walletKey) || [];
    
    const unlock = unlocks.find(
      u => u.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() &&
           u.chainId === chainId
    );

    if (!unlock) return null;

    const total = BigInt(unlock.totalAmount);
    const unlocked = BigInt(unlock.unlockedAmount);
    const locked = BigInt(unlock.lockedAmount);
    const percentage = total > 0 ? Number((unlocked * BigInt(100)) / total) : 0;

    const now = Date.now();
    const daysRemaining = unlock.endDate > now
      ? Math.ceil((unlock.endDate - now) / (24 * 60 * 60 * 1000))
      : 0;

    return {
      percentage: Math.round(percentage * 100) / 100,
      unlocked: unlocked.toString(),
      locked: locked.toString(),
      total: total.toString(),
      daysRemaining,
    };
  }

  /**
   * Get all unlock schedules
   */
  getAllUnlocks(walletAddress: string): TokenUnlock[] {
    const walletKey = walletAddress.toLowerCase();
    return this.unlocks.get(walletKey) || [];
  }

  /**
   * Get unlock events
   */
  getUnlockEvents(
    walletAddress: string,
    limit?: number
  ): UnlockEvent[] {
    const walletKey = walletAddress.toLowerCase();
    const events = this.events.get(walletKey) || [];
    
    const sorted = events.sort((a, b) => b.date - a.date);
    return limit ? sorted.slice(0, limit) : sorted;
  }
}

// Singleton instance
export const tokenUnlockTracker = new TokenUnlockTracker();
