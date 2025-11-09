/**
 * Token Allowance Monitor Utility
 * Monitor token allowances in real-time and detect changes
 */

export interface AllowanceSnapshot {
  tokenAddress: string;
  tokenSymbol: string;
  spenderAddress: string;
  allowance: string;
  isUnlimited: boolean;
  timestamp: number;
  blockNumber?: number;
}

export interface AllowanceChange {
  tokenAddress: string;
  tokenSymbol: string;
  spenderAddress: string;
  previousAllowance: string;
  newAllowance: string;
  changeType: 'granted' | 'revoked' | 'increased' | 'decreased';
  timestamp: number;
  transactionHash?: string;
  blockNumber?: number;
}

export interface MonitoringConfig {
  walletAddress: string;
  chainId: number;
  checkInterval: number; // milliseconds
  tokens?: string[]; // specific tokens to monitor (empty = all)
  spenders?: string[]; // specific spenders to monitor (empty = all)
  alertOnChange: boolean;
  alertOnNewApproval: boolean;
  alertOnRevocation: boolean;
}

export class TokenAllowanceMonitor {
  private snapshots: Map<string, AllowanceSnapshot> = new Map();
  private changeHistory: AllowanceChange[] = [];
  private monitoringConfigs: Map<string, MonitoringConfig> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Generate snapshot key
   */
  private getSnapshotKey(tokenAddress: string, spenderAddress: string): string {
    return `${tokenAddress.toLowerCase()}-${spenderAddress.toLowerCase()}`;
  }

  /**
   * Create snapshot of current allowances
   */
  createSnapshot(allowances: Omit<AllowanceSnapshot, 'timestamp'>[]): AllowanceSnapshot[] {
    const snapshots: AllowanceSnapshot[] = [];
    const now = Date.now();

    allowances.forEach(allowance => {
      const snapshot: AllowanceSnapshot = {
        ...allowance,
        timestamp: now,
      };

      const key = this.getSnapshotKey(allowance.tokenAddress, allowance.spenderAddress);
      const previous = this.snapshots.get(key);

      // Detect changes
      if (previous) {
        const change = this.detectChange(previous, snapshot);
        if (change) {
          this.changeHistory.push(change);
        }
      }

      this.snapshots.set(key, snapshot);
      snapshots.push(snapshot);
    });

    return snapshots;
  }

  /**
   * Detect changes between snapshots
   */
  private detectChange(
    previous: AllowanceSnapshot,
    current: AllowanceSnapshot
  ): AllowanceChange | null {
    const prevAllowance = BigInt(previous.allowance);
    const currAllowance = BigInt(current.allowance);

    if (prevAllowance === currAllowance) {
      return null;
    }

    let changeType: AllowanceChange['changeType'];
    if (currAllowance === BigInt(0)) {
      changeType = 'revoked';
    } else if (prevAllowance === BigInt(0)) {
      changeType = 'granted';
    } else if (currAllowance > prevAllowance) {
      changeType = 'increased';
    } else {
      changeType = 'decreased';
    }

    return {
      tokenAddress: current.tokenAddress,
      tokenSymbol: current.tokenSymbol,
      spenderAddress: current.spenderAddress,
      previousAllowance: previous.allowance,
      newAllowance: current.allowance,
      changeType,
      timestamp: current.timestamp,
      blockNumber: current.blockNumber,
    };
  }

  /**
   * Get current snapshot for a token and spender
   */
  getSnapshot(tokenAddress: string, spenderAddress: string): AllowanceSnapshot | null {
    const key = this.getSnapshotKey(tokenAddress, spenderAddress);
    return this.snapshots.get(key) || null;
  }

  /**
   * Get all snapshots
   */
  getAllSnapshots(): AllowanceSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  /**
   * Get change history
   */
  getChangeHistory(
    tokenAddress?: string,
    spenderAddress?: string,
    limit?: number
  ): AllowanceChange[] {
    let history = [...this.changeHistory];

    if (tokenAddress) {
      history = history.filter(
        change => change.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
      );
    }

    if (spenderAddress) {
      history = history.filter(
        change => change.spenderAddress.toLowerCase() === spenderAddress.toLowerCase()
      );
    }

    // Sort by timestamp (newest first)
    history.sort((a, b) => b.timestamp - a.timestamp);

    if (limit) {
      history = history.slice(0, limit);
    }

    return history;
  }

  /**
   * Start monitoring allowances
   */
  startMonitoring(
    config: MonitoringConfig,
    onChange: (change: AllowanceChange) => void
  ): string {
    const monitorId = `${config.walletAddress}-${config.chainId}-${Date.now()}`;
    this.monitoringConfigs.set(monitorId, config);

    const interval = setInterval(() => {
      // In a real implementation, this would fetch current allowances from blockchain
      // For now, this is a placeholder structure
      this.checkForChanges(monitorId, onChange);
    }, config.checkInterval);

    this.intervals.set(monitorId, interval);
    return monitorId;
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(monitorId: string): boolean {
    const interval = this.intervals.get(monitorId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(monitorId);
      this.monitoringConfigs.delete(monitorId);
      return true;
    }
    return false;
  }

  /**
   * Check for changes (placeholder - would fetch from blockchain in real implementation)
   */
  private checkForChanges(
    monitorId: string,
    onChange: (change: AllowanceChange) => void
  ): void {
    const config = this.monitoringConfigs.get(monitorId);
    if (!config) return;

    // This would fetch current allowances and compare with snapshots
    // For now, it's a placeholder
  }

  /**
   * Get monitoring statistics
   */
  getStatistics(): {
    totalSnapshots: number;
    totalChanges: number;
    activeMonitors: number;
    recentChanges: number; // changes in last 24 hours
  } {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentChanges = this.changeHistory.filter(
      change => change.timestamp >= oneDayAgo
    ).length;

    return {
      totalSnapshots: this.snapshots.size,
      totalChanges: this.changeHistory.length,
      activeMonitors: this.intervals.size,
      recentChanges,
    };
  }

  /**
   * Clear old snapshots
   */
  clearOldSnapshots(olderThanDays = 90): number {
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let cleared = 0;

    this.snapshots.forEach((snapshot, key) => {
      if (snapshot.timestamp < cutoff) {
        this.snapshots.delete(key);
        cleared++;
      }
    });

    // Clear old change history
    const initialHistoryLength = this.changeHistory.length;
    this.changeHistory = this.changeHistory.filter(
      change => change.timestamp >= cutoff
    );
    cleared += initialHistoryLength - this.changeHistory.length;

    return cleared;
  }

  /**
   * Export monitoring data
   */
  exportData(): string {
    return JSON.stringify({
      snapshots: Array.from(this.snapshots.values()),
      changeHistory: this.changeHistory,
      exportDate: new Date().toISOString(),
    }, null, 2);
  }
}

// Singleton instance
export const tokenAllowanceMonitor = new TokenAllowanceMonitor();

