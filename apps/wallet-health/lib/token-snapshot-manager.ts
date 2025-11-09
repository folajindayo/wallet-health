/**
 * Token Snapshot Manager
 * Manages token balance snapshots for historical tracking
 */

export interface TokenSnapshot {
  timestamp: number;
  walletAddress: string;
  chainId: number;
  tokens: Array<{
    address: string;
    symbol: string;
    balance: string;
    balanceUSD?: number;
    price?: number;
  }>;
  totalValueUSD?: number;
  metadata?: Record<string, any>;
}

export interface SnapshotComparison {
  snapshot1: TokenSnapshot;
  snapshot2: TokenSnapshot;
  differences: {
    newTokens: Array<{ address: string; symbol: string; balance: string }>;
    removedTokens: Array<{ address: string; symbol: string; balance: string }>;
    changedBalances: Array<{
      address: string;
      symbol: string;
      oldBalance: string;
      newBalance: string;
      change: string;
      changeUSD?: number;
    }>;
    totalValueChange: number;
    totalValueChangeUSD?: number;
  };
}

export interface SnapshotSeries {
  walletAddress: string;
  chainId: number;
  snapshots: TokenSnapshot[];
  summary: {
    totalSnapshots: number;
    dateRange: { start: number; end: number };
    averageValue: number;
    maxValue: number;
    minValue: number;
  };
}

export class TokenSnapshotManager {
  private snapshots: Map<string, TokenSnapshot[]> = new Map(); // wallet-chain -> snapshots

  /**
   * Create snapshot
   */
  createSnapshot(snapshot: TokenSnapshot): void {
    const key = `${snapshot.walletAddress.toLowerCase()}-${snapshot.chainId}`;
    if (!this.snapshots.has(key)) {
      this.snapshots.set(key, []);
    }

    this.snapshots.get(key)!.push(snapshot);

    // Keep last 1000 snapshots per wallet-chain
    const snapshots = this.snapshots.get(key)!;
    if (snapshots.length > 1000) {
      snapshots.shift();
    }

    // Sort by timestamp
    snapshots.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get snapshots
   */
  getSnapshots(
    walletAddress: string,
    chainId: number,
    options: {
      startDate?: number;
      endDate?: number;
      limit?: number;
    } = {}
  ): TokenSnapshot[] {
    const key = `${walletAddress.toLowerCase()}-${chainId}`;
    let snapshots = this.snapshots.get(key) || [];

    if (options.startDate) {
      snapshots = snapshots.filter(s => s.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      snapshots = snapshots.filter(s => s.timestamp <= options.endDate!);
    }

    snapshots.sort((a, b) => b.timestamp - a.timestamp);

    if (options.limit) {
      snapshots = snapshots.slice(0, options.limit);
    }

    return snapshots;
  }

  /**
   * Get latest snapshot
   */
  getLatestSnapshot(walletAddress: string, chainId: number): TokenSnapshot | null {
    const snapshots = this.getSnapshots(walletAddress, chainId, { limit: 1 });
    return snapshots.length > 0 ? snapshots[0] : null;
  }

  /**
   * Compare two snapshots
   */
  compareSnapshots(
    snapshot1: TokenSnapshot,
    snapshot2: TokenSnapshot
  ): SnapshotComparison {
    const tokenMap1 = new Map(
      snapshot1.tokens.map(t => [t.address.toLowerCase(), t])
    );
    const tokenMap2 = new Map(
      snapshot2.tokens.map(t => [t.address.toLowerCase(), t])
    );

    const newTokens: SnapshotComparison['differences']['newTokens'] = [];
    const removedTokens: SnapshotComparison['differences']['removedTokens'] = [];
    const changedBalances: SnapshotComparison['differences']['changedBalances'] = [];

    // Find new tokens
    tokenMap2.forEach((token2, address) => {
      if (!tokenMap1.has(address)) {
        newTokens.push({
          address: token2.address,
          symbol: token2.symbol,
          balance: token2.balance,
        });
      }
    });

    // Find removed tokens
    tokenMap1.forEach((token1, address) => {
      if (!tokenMap2.has(address)) {
        removedTokens.push({
          address: token1.address,
          symbol: token1.symbol,
          balance: token1.balance,
        });
      }
    });

    // Find changed balances
    tokenMap2.forEach((token2, address) => {
      const token1 = tokenMap1.get(address);
      if (token1 && token1.balance !== token2.balance) {
        const balance1 = BigInt(token1.balance);
        const balance2 = BigInt(token2.balance);
        const change = balance2 - balance1;

        changedBalances.push({
          address: token2.address,
          symbol: token2.symbol,
          oldBalance: token1.balance,
          newBalance: token2.balance,
          change: change.toString(),
          changeUSD: token2.balanceUSD && token1.balanceUSD
            ? token2.balanceUSD - token1.balanceUSD
            : undefined,
        });
      }
    });

    const totalValueChange = (snapshot2.totalValueUSD || 0) - (snapshot1.totalValueUSD || 0);

    return {
      snapshot1,
      snapshot2,
      differences: {
        newTokens,
        removedTokens,
        changedBalances,
        totalValueChange,
        totalValueChangeUSD: totalValueChange,
      },
    };
  }

  /**
   * Get snapshot series
   */
  getSnapshotSeries(
    walletAddress: string,
    chainId: number
  ): SnapshotSeries {
    const snapshots = this.getSnapshots(walletAddress, chainId);

    if (snapshots.length === 0) {
      throw new Error('No snapshots found');
    }

    const values = snapshots
      .map(s => s.totalValueUSD || 0)
      .filter(v => v > 0);

    const timestamps = snapshots.map(s => s.timestamp);

    return {
      walletAddress,
      chainId,
      snapshots,
      summary: {
        totalSnapshots: snapshots.length,
        dateRange: {
          start: Math.min(...timestamps),
          end: Math.max(...timestamps),
        },
        averageValue: values.length > 0
          ? values.reduce((sum, v) => sum + v, 0) / values.length
          : 0,
        maxValue: values.length > 0 ? Math.max(...values) : 0,
        minValue: values.length > 0 ? Math.min(...values) : 0,
      },
    };
  }

  /**
   * Calculate portfolio growth
   */
  calculateGrowth(
    walletAddress: string,
    chainId: number,
    period: '7d' | '30d' | '90d' | '1y'
  ): {
    startValue: number;
    endValue: number;
    growth: number;
    growthPercentage: number;
  } | null {
    const now = Date.now();
    let cutoff: number;

    switch (period) {
      case '7d':
        cutoff = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        cutoff = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '90d':
        cutoff = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case '1y':
        cutoff = now - 365 * 24 * 60 * 60 * 1000;
        break;
    }

    const snapshots = this.getSnapshots(walletAddress, chainId, {
      startDate: cutoff,
    });

    if (snapshots.length < 2) return null;

    const sorted = snapshots.sort((a, b) => a.timestamp - b.timestamp);
    const start = sorted[0];
    const end = sorted[sorted.length - 1];

    const startValue = start.totalValueUSD || 0;
    const endValue = end.totalValueUSD || 0;
    const growth = endValue - startValue;
    const growthPercentage = startValue > 0 ? (growth / startValue) * 100 : 0;

    return {
      startValue,
      endValue,
      growth,
      growthPercentage: Math.round(growthPercentage * 100) / 100,
    };
  }
}

// Singleton instance
export const tokenSnapshotManager = new TokenSnapshotManager();
