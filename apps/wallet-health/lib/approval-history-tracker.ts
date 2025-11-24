/**
 * Approval History Tracker
 * Tracks approval history over time to detect patterns and changes
 */

import type { TokenApproval } from '@wallet-health/types';

export interface ApprovalHistoryEntry {
  timestamp: number;
  action: 'granted' | 'revoked' | 'modified';
  token: string;
  tokenSymbol: string;
  spender: string;
  spenderName?: string;
  allowance: string;
  isUnlimited: boolean;
  transactionHash: string;
  chainId: number;
  previousAllowance?: string;
}

export interface ApprovalHistorySnapshot {
  timestamp: number;
  totalApprovals: number;
  uniqueTokens: number;
  uniqueSpenders: number;
  unlimitedApprovals: number;
  unverifiedContracts: number;
  approvals: TokenApproval[];
}

export interface ApprovalTrend {
  period: '7d' | '30d' | '90d' | '1y';
  trend: 'increasing' | 'decreasing' | 'stable';
  change: number; // percentage change
  snapshots: ApprovalHistorySnapshot[];
  insights: string[];
}

export interface ApprovalPattern {
  type: 'frequent_grant' | 'frequent_revoke' | 'repeated_spender' | 'token_rotation';
  description: string;
  frequency: number;
  affectedTokens: string[];
  affectedSpenders: string[];
}

export class ApprovalHistoryTracker {
  private history: Map<string, ApprovalHistoryEntry[]> = new Map(); // wallet -> entries
  private snapshots: Map<string, ApprovalHistorySnapshot[]> = new Map(); // wallet -> snapshots

  /**
   * Record approval history entry
   */
  recordEntry(
    walletAddress: string,
    entry: ApprovalHistoryEntry
  ): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.history.has(walletKey)) {
      this.history.set(walletKey, []);
    }

    this.history.get(walletKey)!.push(entry);

    // Keep last 10000 entries
    const entries = this.history.get(walletKey)!;
    if (entries.length > 10000) {
      entries.shift();
    }

    // Sort by timestamp
    entries.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Record snapshot
   */
  recordSnapshot(
    walletAddress: string,
    snapshot: ApprovalHistorySnapshot
  ): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.snapshots.has(walletKey)) {
      this.snapshots.set(walletKey, []);
    }

    this.snapshots.get(walletKey)!.push(snapshot);

    // Keep last 1000 snapshots
    const snapshots = this.snapshots.get(walletKey)!;
    if (snapshots.length > 1000) {
      snapshots.shift();
    }

    // Sort by timestamp
    snapshots.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get approval trend
   */
  getTrend(
    walletAddress: string,
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): ApprovalTrend {
    const walletKey = walletAddress.toLowerCase();
    const snapshots = this.snapshots.get(walletKey) || [];

    if (snapshots.length < 2) {
      throw new Error('Insufficient snapshot data for trend analysis');
    }

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

    const periodSnapshots = snapshots.filter(s => s.timestamp >= cutoff);

    if (periodSnapshots.length < 2) {
      throw new Error('Insufficient data for selected period');
    }

    const first = periodSnapshots[0];
    const last = periodSnapshots[periodSnapshots.length - 1];
    const change = first.totalApprovals > 0
      ? ((last.totalApprovals - first.totalApprovals) / first.totalApprovals) * 100
      : 0;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (change > 10) {
      trend = 'increasing';
    } else if (change < -10) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    // Generate insights
    const insights: string[] = [];
    if (trend === 'increasing') {
      insights.push(`Approvals increased by ${Math.round(change)}% over ${period}`);
    } else if (trend === 'decreasing') {
      insights.push(`Approvals decreased by ${Math.abs(Math.round(change))}% over ${period}`);
    } else {
      insights.push(`Approval count remained relatively stable`);
    }

    if (last.unlimitedApprovals > first.unlimitedApprovals) {
      insights.push('Number of unlimited approvals increased');
    }

    return {
      period,
      trend,
      change: Math.round(change * 100) / 100,
      snapshots: periodSnapshots,
      insights,
    };
  }

  /**
   * Detect approval patterns
   */
  detectPatterns(walletAddress: string): ApprovalPattern[] {
    const walletKey = walletAddress.toLowerCase();
    const entries = this.history.get(walletKey) || [];
    const patterns: ApprovalPattern[] = [];

    // Frequent grant pattern
    const grantFrequency = entries.filter(e => e.action === 'granted').length;
    if (grantFrequency > 20) {
      patterns.push({
        type: 'frequent_grant',
        description: `Frequent approval grants detected (${grantFrequency} grants)`,
        frequency: grantFrequency,
        affectedTokens: Array.from(new Set(entries.map(e => e.token))),
        affectedSpenders: Array.from(new Set(entries.map(e => e.spender))),
      });
    }

    // Frequent revoke pattern
    const revokeFrequency = entries.filter(e => e.action === 'revoked').length;
    if (revokeFrequency > 10) {
      patterns.push({
        type: 'frequent_revoke',
        description: `Frequent approval revocations detected (${revokeFrequency} revokes)`,
        frequency: revokeFrequency,
        affectedTokens: Array.from(new Set(entries.filter(e => e.action === 'revoked').map(e => e.token))),
        affectedSpenders: Array.from(new Set(entries.filter(e => e.action === 'revoked').map(e => e.spender))),
      });
    }

    // Repeated spender pattern
    const spenderCounts = new Map<string, number>();
    entries.forEach(e => {
      if (e.action === 'granted') {
        spenderCounts.set(e.spender, (spenderCounts.get(e.spender) || 0) + 1);
      }
    });

    spenderCounts.forEach((count, spender) => {
      if (count > 5) {
        patterns.push({
          type: 'repeated_spender',
          description: `Repeated approvals to same spender: ${spender.substring(0, 10)}... (${count} times)`,
          frequency: count,
          affectedTokens: Array.from(new Set(
            entries.filter(e => e.spender === spender).map(e => e.token)
          )),
          affectedSpenders: [spender],
        });
      }
    });

    return patterns;
  }

  /**
   * Get approval history
   */
  getHistory(
    walletAddress: string,
    options: {
      startDate?: number;
      endDate?: number;
      action?: ApprovalHistoryEntry['action'];
      token?: string;
      spender?: string;
      limit?: number;
    } = {}
  ): ApprovalHistoryEntry[] {
    const walletKey = walletAddress.toLowerCase();
    let entries = this.history.get(walletKey) || [];

    if (options.startDate) {
      entries = entries.filter(e => e.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      entries = entries.filter(e => e.timestamp <= options.endDate!);
    }

    if (options.action) {
      entries = entries.filter(e => e.action === options.action);
    }

    if (options.token) {
      entries = entries.filter(e =>
        e.token.toLowerCase() === options.token!.toLowerCase()
      );
    }

    if (options.spender) {
      entries = entries.filter(e =>
        e.spender.toLowerCase() === options.spender!.toLowerCase()
      );
    }

    // Sort by timestamp (newest first)
    entries.sort((a, b) => b.timestamp - a.timestamp);

    if (options.limit) {
      entries = entries.slice(0, options.limit);
    }

    return entries;
  }

  /**
   * Get snapshot history
   */
  getSnapshotHistory(
    walletAddress: string,
    limit?: number
  ): ApprovalHistorySnapshot[] {
    const walletKey = walletAddress.toLowerCase();
    const snapshots = this.snapshots.get(walletKey) || [];
    return limit ? snapshots.slice(-limit) : snapshots;
  }

  /**
   * Compare two snapshots
   */
  compareSnapshots(
    snapshot1: ApprovalHistorySnapshot,
    snapshot2: ApprovalHistorySnapshot
  ): {
    newApprovals: TokenApproval[];
    revokedApprovals: TokenApproval[];
    modifiedApprovals: Array<{
      approval: TokenApproval;
      oldAllowance: string;
      newAllowance: string;
    }>;
    changes: {
      totalChange: number;
      unlimitedChange: number;
      unverifiedChange: number;
    };
  } {
    const set1 = new Set(snapshot1.approvals.map(a => `${a.token}-${a.spender}`));
    const set2 = new Set(snapshot2.approvals.map(a => `${a.token}-${a.spender}`));

    const newApprovals = snapshot2.approvals.filter(
      a => !set1.has(`${a.token}-${a.spender}`)
    );

    const revokedApprovals = snapshot1.approvals.filter(
      a => !set2.has(`${a.token}-${a.spender}`)
    );

    const modifiedApprovals: Array<{
      approval: TokenApproval;
      oldAllowance: string;
      newAllowance: string;
    }> = [];

    snapshot2.approvals.forEach(approval2 => {
      const approval1 = snapshot1.approvals.find(
        a => a.token === approval2.token && a.spender === approval2.spender
      );

      if (approval1 && approval1.allowance !== approval2.allowance) {
        modifiedApprovals.push({
          approval: approval2,
          oldAllowance: approval1.allowance,
          newAllowance: approval2.allowance,
        });
      }
    });

    return {
      newApprovals,
      revokedApprovals,
      modifiedApprovals,
      changes: {
        totalChange: snapshot2.totalApprovals - snapshot1.totalApprovals,
        unlimitedChange:
          snapshot2.unlimitedApprovals - snapshot1.unlimitedApprovals,
        unverifiedChange:
          snapshot2.unverifiedContracts - snapshot1.unverifiedContracts,
      },
    };
  }
}

// Singleton instance
export const approvalHistoryTracker = new ApprovalHistoryTracker();
