/**
 * Approval History Tracker Utility
 * Track token approval changes over time
 */

export interface ApprovalHistoryEntry {
  timestamp: number;
  tokenAddress: string;
  tokenSymbol: string;
  spenderAddress: string;
  spenderLabel?: string;
  action: 'granted' | 'revoked' | 'modified';
  previousAllowance?: string;
  newAllowance: string;
  transactionHash?: string;
  chainId: number;
}

export interface ApprovalSnapshot {
  timestamp: number;
  approvals: Array<{
    tokenAddress: string;
    tokenSymbol: string;
    spenderAddress: string;
    allowance: string;
    isUnlimited: boolean;
  }>;
  totalApprovals: number;
  unlimitedApprovals: number;
}

export interface ApprovalTrend {
  tokenAddress: string;
  tokenSymbol: string;
  spenderAddress: string;
  history: ApprovalHistoryEntry[];
  currentAllowance: string;
  firstSeen: number;
  lastModified: number;
  changeCount: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'revoked';
}

export class ApprovalHistoryTracker {
  private history: ApprovalHistoryEntry[] = [];
  private snapshots: ApprovalSnapshot[] = [];

  /**
   * Add approval history entry
   */
  addHistoryEntry(entry: Omit<ApprovalHistoryEntry, 'timestamp'>): ApprovalHistoryEntry {
    const historyEntry: ApprovalHistoryEntry = {
      ...entry,
      timestamp: Date.now(),
    };

    this.history.push(historyEntry);
    this.saveToStorage();
    return historyEntry;
  }

  /**
   * Create approval snapshot
   */
  createSnapshot(approvals: ApprovalSnapshot['approvals']): ApprovalSnapshot {
    const snapshot: ApprovalSnapshot = {
      timestamp: Date.now(),
      approvals,
      totalApprovals: approvals.length,
      unlimitedApprovals: approvals.filter(a => a.isUnlimited).length,
    };

    this.snapshots.push(snapshot);
    this.saveToStorage();
    return snapshot;
  }

  /**
   * Get approval history for a specific token and spender
   */
  getApprovalHistory(
    tokenAddress: string,
    spenderAddress: string
  ): ApprovalHistoryEntry[] {
    return this.history.filter(
      entry =>
        entry.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() &&
        entry.spenderAddress.toLowerCase() === spenderAddress.toLowerCase()
    ).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get all history entries
   */
  getAllHistory(): ApprovalHistoryEntry[] {
    return [...this.history].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get history for a specific token
   */
  getTokenHistory(tokenAddress: string): ApprovalHistoryEntry[] {
    return this.history.filter(
      entry => entry.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
    ).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get history for a specific spender
   */
  getSpenderHistory(spenderAddress: string): ApprovalHistoryEntry[] {
    return this.history.filter(
      entry => entry.spenderAddress.toLowerCase() === spenderAddress.toLowerCase()
    ).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get approval trends
   */
  getApprovalTrends(): ApprovalTrend[] {
    const trendsMap = new Map<string, ApprovalHistoryEntry[]>();

    // Group by token + spender
    this.history.forEach(entry => {
      const key = `${entry.tokenAddress.toLowerCase()}-${entry.spenderAddress.toLowerCase()}`;
      if (!trendsMap.has(key)) {
        trendsMap.set(key, []);
      }
      trendsMap.get(key)!.push(entry);
    });

    const trends: ApprovalTrend[] = [];

    trendsMap.forEach((history, key) => {
      const sortedHistory = history.sort((a, b) => a.timestamp - b.timestamp);
      const firstEntry = sortedHistory[0];
      const lastEntry = sortedHistory[sortedHistory.length - 1];

      // Determine trend
      let trend: ApprovalTrend['trend'] = 'stable';
      if (lastEntry.action === 'revoked') {
        trend = 'revoked';
      } else if (sortedHistory.length > 1) {
        const firstAllowance = BigInt(firstEntry.newAllowance || '0');
        const lastAllowance = BigInt(lastEntry.newAllowance || '0');
        if (lastAllowance > firstAllowance) {
          trend = 'increasing';
        } else if (lastAllowance < firstAllowance) {
          trend = 'decreasing';
        }
      }

      trends.push({
        tokenAddress: firstEntry.tokenAddress,
        tokenSymbol: firstEntry.tokenSymbol,
        spenderAddress: firstEntry.spenderAddress,
        history: sortedHistory,
        currentAllowance: lastEntry.newAllowance,
        firstSeen: firstEntry.timestamp,
        lastModified: lastEntry.timestamp,
        changeCount: sortedHistory.length,
        trend,
      });
    });

    return trends;
  }

  /**
   * Get approval statistics
   */
  getStatistics(): {
    totalHistoryEntries: number;
    totalSnapshots: number;
    grants: number;
    revokes: number;
    modifications: number;
    uniqueTokens: number;
    uniqueSpenders: number;
    averageLifetime: number; // days
  } {
    const grants = this.history.filter(e => e.action === 'granted').length;
    const revokes = this.history.filter(e => e.action === 'revoked').length;
    const modifications = this.history.filter(e => e.action === 'modified').length;

    const uniqueTokens = new Set(
      this.history.map(e => e.tokenAddress.toLowerCase())
    ).size;

    const uniqueSpenders = new Set(
      this.history.map(e => e.spenderAddress.toLowerCase())
    ).size;

    // Calculate average lifetime (time between grant and revoke)
    const lifetimes: number[] = [];
    const grantsByKey = new Map<string, ApprovalHistoryEntry>();

    this.history.forEach(entry => {
      const key = `${entry.tokenAddress.toLowerCase()}-${entry.spenderAddress.toLowerCase()}`;
      
      if (entry.action === 'granted') {
        grantsByKey.set(key, entry);
      } else if (entry.action === 'revoked' && grantsByKey.has(key)) {
        const grant = grantsByKey.get(key)!;
        const lifetime = (entry.timestamp - grant.timestamp) / (24 * 60 * 60 * 1000); // days
        lifetimes.push(lifetime);
        grantsByKey.delete(key);
      }
    });

    const averageLifetime = lifetimes.length > 0
      ? lifetimes.reduce((sum, lt) => sum + lt, 0) / lifetimes.length
      : 0;

    return {
      totalHistoryEntries: this.history.length,
      totalSnapshots: this.snapshots.length,
      grants,
      revokes,
      modifications,
      uniqueTokens,
      uniqueSpenders,
      averageLifetime: Math.round(averageLifetime * 100) / 100,
    };
  }

  /**
   * Get recent activity
   */
  getRecentActivity(limit = 10): ApprovalHistoryEntry[] {
    return [...this.history]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Compare snapshots
   */
  compareSnapshots(
    snapshot1: ApprovalSnapshot,
    snapshot2: ApprovalSnapshot
  ): {
    added: ApprovalSnapshot['approvals'];
    removed: ApprovalSnapshot['approvals'];
    modified: Array<{
      approval: ApprovalSnapshot['approvals'][0];
      previousAllowance: string;
      newAllowance: string;
    }>;
  } {
    const added: ApprovalSnapshot['approvals'] = [];
    const removed: ApprovalSnapshot['approvals'] = [];
    const modified: Array<{
      approval: ApprovalSnapshot['approvals'][0];
      previousAllowance: string;
      newAllowance: string;
    }> = [];

    const map1 = new Map<string, ApprovalSnapshot['approvals'][0]>();
    snapshot1.approvals.forEach(approval => {
      const key = `${approval.tokenAddress.toLowerCase()}-${approval.spenderAddress.toLowerCase()}`;
      map1.set(key, approval);
    });

    const map2 = new Map<string, ApprovalSnapshot['approvals'][0]>();
    snapshot2.approvals.forEach(approval => {
      const key = `${approval.tokenAddress.toLowerCase()}-${approval.spenderAddress.toLowerCase()}`;
      map2.set(key, approval);
    });

    // Find added and modified
    map2.forEach((approval2, key) => {
      const approval1 = map1.get(key);
      if (!approval1) {
        added.push(approval2);
      } else if (approval1.allowance !== approval2.allowance) {
        modified.push({
          approval: approval2,
          previousAllowance: approval1.allowance,
          newAllowance: approval2.allowance,
        });
      }
    });

    // Find removed
    map1.forEach((approval1, key) => {
      if (!map2.has(key)) {
        removed.push(approval1);
      }
    });

    return { added, removed, modified };
  }

  /**
   * Export history
   */
  exportHistory(): string {
    return JSON.stringify({
      history: this.history,
      snapshots: this.snapshots,
      exportDate: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Clear old history (older than specified days)
   */
  clearOldHistory(daysToKeep = 90): number {
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const initialLength = this.history.length;
    
    this.history = this.history.filter(entry => entry.timestamp >= cutoff);
    this.snapshots = this.snapshots.filter(snapshot => snapshot.timestamp >= cutoff);
    
    const removed = initialLength - this.history.length;
    if (removed > 0) {
      this.saveToStorage();
    }
    
    return removed;
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'wallet-health-approval-history',
          JSON.stringify({
            history: this.history,
            snapshots: this.snapshots,
          })
        );
      } catch (error) {
        console.error('Failed to save approval history to storage:', error);
      }
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wallet-health-approval-history');
        if (stored) {
          const data = JSON.parse(stored);
          if (data.history) {
            this.history = data.history;
          }
          if (data.snapshots) {
            this.snapshots = data.snapshots;
          }
        }
      } catch (error) {
        console.error('Failed to load approval history from storage:', error);
      }
    }
  }
}

// Singleton instance
export const approvalHistoryTracker = new ApprovalHistoryTracker();

// Initialize from storage if available
if (typeof window !== 'undefined') {
  approvalHistoryTracker.loadFromStorage();
}

