/**
 * Token Snapshot Manager Utility
 * Takes snapshots of token balances at specific times
 */

export interface TokenSnapshot {
  id: string;
  walletAddress: string;
  chainId: number;
  timestamp: number;
  tokens: Array<{
    token: string;
    symbol: string;
    balance: string;
    balanceUSD: number;
  }>;
  totalValueUSD: number;
  note?: string;
  tags?: string[];
}

export interface SnapshotComparison {
  snapshot1: TokenSnapshot;
  snapshot2: TokenSnapshot;
  timeDiff: number; // milliseconds
  valueChange: number; // USD
  valueChangePercent: number; // Percentage
  tokenChanges: Array<{
    token: string;
    symbol: string;
    balanceChange: string;
    balanceChangePercent: number;
    valueChange: number;
  }>;
  newTokens: Array<{ token: string; symbol: string; balance: string }>;
  removedTokens: Array<{ token: string; symbol: string; balance: string }>;
}

export class TokenSnapshotManager {
  private snapshots: Map<string, TokenSnapshot[]> = new Map();

  /**
   * Create snapshot
   */
  createSnapshot(
    walletAddress: string,
    chainId: number,
    tokens: Array<{ token: string; symbol: string; balance: string; balanceUSD: number }>,
    note?: string,
    tags?: string[]
  ): TokenSnapshot {
    const id = `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const totalValueUSD = tokens.reduce((sum, t) => sum + t.balanceUSD, 0);

    const snapshot: TokenSnapshot = {
      id,
      walletAddress: walletAddress.toLowerCase(),
      chainId,
      timestamp: Date.now(),
      tokens,
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      note,
      tags,
    };

    const key = `${walletAddress.toLowerCase()}-${chainId}`;
    if (!this.snapshots.has(key)) {
      this.snapshots.set(key, []);
    }

    this.snapshots.get(key)!.push(snapshot);
    return snapshot;
  }

  /**
   * Get snapshots for wallet
   */
  getSnapshots(walletAddress: string, chainId: number): TokenSnapshot[] {
    const key = `${walletAddress.toLowerCase()}-${chainId}`;
    return (this.snapshots.get(key) || []).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get snapshot by ID
   */
  getSnapshot(id: string): TokenSnapshot | null {
    for (const snapshots of this.snapshots.values()) {
      const snapshot = snapshots.find(s => s.id === id);
      if (snapshot) {
        return snapshot;
      }
    }
    return null;
  }

  /**
   * Compare two snapshots
   */
  compareSnapshots(snapshot1Id: string, snapshot2Id: string): SnapshotComparison | null {
    const snapshot1 = this.getSnapshot(snapshot1Id);
    const snapshot2 = this.getSnapshot(snapshot2Id);

    if (!snapshot1 || !snapshot2) {
      return null;
    }

    if (snapshot1.walletAddress !== snapshot2.walletAddress || snapshot1.chainId !== snapshot2.chainId) {
      return null;
    }

    const timeDiff = snapshot2.timestamp - snapshot1.timestamp;
    const valueChange = snapshot2.totalValueUSD - snapshot1.totalValueUSD;
    const valueChangePercent = snapshot1.totalValueUSD > 0
      ? (valueChange / snapshot1.totalValueUSD) * 100
      : 0;

    // Create token maps
    const tokens1 = new Map(snapshot1.tokens.map(t => [t.token.toLowerCase(), t]));
    const tokens2 = new Map(snapshot2.tokens.map(t => [t.token.toLowerCase(), t]));

    // Find token changes
    const tokenChanges: SnapshotComparison['tokenChanges'] = [];
    const newTokens: SnapshotComparison['newTokens'] = [];
    const removedTokens: SnapshotComparison['removedTokens'] = [];

    tokens2.forEach((token2, address) => {
      const token1 = tokens1.get(address);
      if (token1) {
        const balance1 = parseFloat(token1.balance);
        const balance2 = parseFloat(token2.balance);
        const balanceChange = balance2 - balance1;
        const balanceChangePercent = balance1 > 0
          ? (balanceChange / balance1) * 100
          : 0;

        tokenChanges.push({
          token: address,
          symbol: token2.symbol,
          balanceChange: balanceChange.toString(),
          balanceChangePercent: Math.round(balanceChangePercent * 100) / 100,
          valueChange: token2.balanceUSD - token1.balanceUSD,
        });
      } else {
        newTokens.push({
          token: address,
          symbol: token2.symbol,
          balance: token2.balance,
        });
      }
    });

    tokens1.forEach((token1, address) => {
      if (!tokens2.has(address)) {
        removedTokens.push({
          token: address,
          symbol: token1.symbol,
          balance: token1.balance,
        });
      }
    });

    return {
      snapshot1,
      snapshot2,
      timeDiff,
      valueChange: Math.round(valueChange * 100) / 100,
      valueChangePercent: Math.round(valueChangePercent * 100) / 100,
      tokenChanges,
      newTokens,
      removedTokens,
    };
  }

  /**
   * Get snapshot history
   */
  getSnapshotHistory(walletAddress: string, chainId: number, days = 30): TokenSnapshot[] {
    const snapshots = this.getSnapshots(walletAddress, chainId);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return snapshots.filter(s => s.timestamp >= cutoff);
  }

  /**
   * Delete snapshot
   */
  deleteSnapshot(id: string): boolean {
    for (const [key, snapshots] of this.snapshots.entries()) {
      const index = snapshots.findIndex(s => s.id === id);
      if (index !== -1) {
        snapshots.splice(index, 1);
        if (snapshots.length === 0) {
          this.snapshots.delete(key);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Get snapshot statistics
   */
  getSnapshotStats(walletAddress: string, chainId: number): {
    totalSnapshots: number;
    firstSnapshot: TokenSnapshot | null;
    latestSnapshot: TokenSnapshot | null;
    totalValueChange: number;
    averageValueChange: number;
  } {
    const snapshots = this.getSnapshots(walletAddress, chainId);
    
    if (snapshots.length === 0) {
      return {
        totalSnapshots: 0,
        firstSnapshot: null,
        latestSnapshot: null,
        totalValueChange: 0,
        averageValueChange: 0,
      };
    }

    const firstSnapshot = snapshots[0];
    const latestSnapshot = snapshots[snapshots.length - 1];
    const totalValueChange = latestSnapshot.totalValueUSD - firstSnapshot.totalValueUSD;
    const averageValueChange = snapshots.length > 1
      ? totalValueChange / (snapshots.length - 1)
      : 0;

    return {
      totalSnapshots: snapshots.length,
      firstSnapshot,
      latestSnapshot,
      totalValueChange: Math.round(totalValueChange * 100) / 100,
      averageValueChange: Math.round(averageValueChange * 100) / 100,
    };
  }

  /**
   * Clear snapshots
   */
  clear(walletAddress?: string, chainId?: number): void {
    if (walletAddress && chainId) {
      const key = `${walletAddress.toLowerCase()}-${chainId}`;
      this.snapshots.delete(key);
    } else {
      this.snapshots.clear();
    }
  }
}

// Singleton instance
export const tokenSnapshotManager = new TokenSnapshotManager();

