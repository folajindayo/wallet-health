/**
 * Activity Timeline Generator
 * Generates chronological timeline of wallet activities with risk annotations
 */

import type { TokenApproval, TokenInfo } from '@wallet-health/types';

export interface TimelineEvent {
  id: string;
  timestamp: number;
  type: 'approval' | 'transfer' | 'swap' | 'contract_interaction' | 'token_received' | 'nft_transfer';
  chainId: number;
  transactionHash: string;
  from: string;
  to: string;
  value?: string;
  token?: {
    address: string;
    symbol: string;
    decimals: number;
  };
  riskLevel?: 'safe' | 'moderate' | 'critical';
  riskFactors?: string[];
  metadata?: Record<string, any>;
}

export interface TimelineGroup {
  date: string; // YYYY-MM-DD
  events: TimelineEvent[];
  riskSummary: {
    total: number;
    safe: number;
    moderate: number;
    critical: number;
  };
}

export interface TimelineOptions {
  startDate?: number;
  endDate?: number;
  groupBy?: 'day' | 'week' | 'month';
  includeRiskAnalysis?: boolean;
  filterByType?: TimelineEvent['type'][];
  filterByRisk?: ('safe' | 'moderate' | 'critical')[];
}

export class ActivityTimeline {
  /**
   * Generate timeline from transaction data
   */
  async generateTimeline(
    transactions: Array<{
      hash: string;
      timestamp: number;
      from: string;
      to: string;
      value?: string;
      chainId: number;
      tokenTransfers?: Array<{
        token: string;
        symbol: string;
        decimals: number;
        value: string;
      }>;
      type?: string;
    }>,
    approvals: TokenApproval[] = [],
    options: TimelineOptions = {}
  ): Promise<{
    events: TimelineEvent[];
    grouped: TimelineGroup[];
    summary: {
      totalEvents: number;
      dateRange: { start: number; end: number };
      riskDistribution: { safe: number; moderate: number; critical: number };
    };
  }> {
    const events: TimelineEvent[] = [];

    // Convert transactions to timeline events
    for (const tx of transactions) {
      // Main transaction event
      const event: TimelineEvent = {
        id: `tx_${tx.hash}`,
        timestamp: tx.timestamp,
        type: this.determineEventType(tx),
        chainId: tx.chainId,
        transactionHash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        metadata: {
          tokenTransfers: tx.tokenTransfers,
        },
      };

      // Add risk analysis if enabled
      if (options.includeRiskAnalysis) {
        const riskAnalysis = this.analyzeTransactionRisk(tx, approvals);
        event.riskLevel = riskAnalysis.level;
        event.riskFactors = riskAnalysis.factors;
      }

      events.push(event);

      // Add token transfer events
      if (tx.tokenTransfers) {
        for (const transfer of tx.tokenTransfers) {
          const transferEvent: TimelineEvent = {
            id: `transfer_${tx.hash}_${transfer.token}`,
            timestamp: tx.timestamp,
            type: 'transfer',
            chainId: tx.chainId,
            transactionHash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: transfer.value,
            token: {
              address: transfer.token,
              symbol: transfer.symbol,
              decimals: transfer.decimals,
            },
          };

          if (options.includeRiskAnalysis) {
            const riskAnalysis = this.analyzeTransferRisk(transfer, tx);
            transferEvent.riskLevel = riskAnalysis.level;
            transferEvent.riskFactors = riskAnalysis.factors;
          }

          events.push(transferEvent);
        }
      }
    }

    // Add approval events
    for (const approval of approvals) {
      const approvalEvent: TimelineEvent = {
        id: `approval_${approval.token}_${approval.spender}`,
        timestamp: approval.timestamp || Date.now(),
        type: 'approval',
        chainId: approval.chainId,
        transactionHash: approval.transactionHash || '',
        from: approval.owner,
        to: approval.spender,
        token: {
          address: approval.token,
          symbol: approval.tokenSymbol || 'UNKNOWN',
          decimals: approval.tokenDecimals || 18,
        },
        riskLevel: approval.isVerified === false ? 'critical' : approval.contractAge && approval.contractAge < 30 ? 'moderate' : 'safe',
        riskFactors: this.getApprovalRiskFactors(approval),
        metadata: {
          allowance: approval.allowance,
          isUnlimited: approval.isUnlimited,
        },
      };

      events.push(approvalEvent);
    }

    // Apply filters
    let filteredEvents = events;

    if (options.startDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= options.endDate!);
    }

    if (options.filterByType && options.filterByType.length > 0) {
      filteredEvents = filteredEvents.filter(e => options.filterByType!.includes(e.type));
    }

    if (options.filterByRisk && options.filterByRisk.length > 0) {
      filteredEvents = filteredEvents.filter(e => 
        e.riskLevel && options.filterByRisk!.includes(e.riskLevel)
      );
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp - a.timestamp);

    // Group events
    const grouped = this.groupEvents(filteredEvents, options.groupBy || 'day');

    // Calculate summary
    const summary = {
      totalEvents: filteredEvents.length,
      dateRange: {
        start: filteredEvents.length > 0 ? Math.min(...filteredEvents.map(e => e.timestamp)) : Date.now(),
        end: filteredEvents.length > 0 ? Math.max(...filteredEvents.map(e => e.timestamp)) : Date.now(),
      },
      riskDistribution: {
        safe: filteredEvents.filter(e => e.riskLevel === 'safe').length,
        moderate: filteredEvents.filter(e => e.riskLevel === 'moderate').length,
        critical: filteredEvents.filter(e => e.riskLevel === 'critical').length,
      },
    };

    return {
      events: filteredEvents,
      grouped,
      summary,
    };
  }

  /**
   * Group events by time period
   */
  private groupEvents(
    events: TimelineEvent[],
    groupBy: 'day' | 'week' | 'month'
  ): TimelineGroup[] {
    const groups = new Map<string, TimelineEvent[]>();

    for (const event of events) {
      const date = new Date(event.timestamp * 1000);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(event);
    }

    // Convert to array and calculate risk summaries
    const grouped: TimelineGroup[] = Array.from(groups.entries()).map(([date, events]) => {
      const riskSummary = {
        total: events.length,
        safe: events.filter(e => e.riskLevel === 'safe').length,
        moderate: events.filter(e => e.riskLevel === 'moderate').length,
        critical: events.filter(e => e.riskLevel === 'critical').length,
      };

      return {
        date,
        events: events.sort((a, b) => b.timestamp - a.timestamp),
        riskSummary,
      };
    });

    // Sort by date (newest first)
    grouped.sort((a, b) => b.date.localeCompare(a.date));

    return grouped;
  }

  /**
   * Determine event type from transaction
   */
  private determineEventType(tx: any): TimelineEvent['type'] {
    if (tx.type) {
      return tx.type as TimelineEvent['type'];
    }

    // Heuristic detection
    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      if (tx.tokenTransfers.length === 1) {
        return 'transfer';
      }
      return 'swap';
    }

    if (tx.to && tx.value && tx.value !== '0') {
      return 'transfer';
    }

    return 'contract_interaction';
  }

  /**
   * Analyze transaction risk
   */
  private analyzeTransactionRisk(
    tx: any,
    approvals: TokenApproval[]
  ): { level: 'safe' | 'moderate' | 'critical'; factors: string[] } {
    const factors: string[] = [];
    let riskScore = 0;

    // Check if interacting with unverified contract
    const relatedApproval = approvals.find(a => a.spender.toLowerCase() === tx.to.toLowerCase());
    if (relatedApproval && relatedApproval.isVerified === false) {
      factors.push('Unverified contract');
      riskScore += 3;
    }

    // Check for large value transfers
    if (tx.value) {
      const valueEth = parseFloat(tx.value) / 1e18;
      if (valueEth > 10) {
        factors.push('Large transfer amount');
        riskScore += 1;
      }
    }

    // Determine risk level
    let level: 'safe' | 'moderate' | 'critical';
    if (riskScore >= 3) {
      level = 'critical';
    } else if (riskScore >= 1) {
      level = 'moderate';
    } else {
      level = 'safe';
    }

    return { level, factors };
  }

  /**
   * Analyze transfer risk
   */
  private analyzeTransferRisk(transfer: any, tx: any): { level: 'safe' | 'moderate' | 'critical'; factors: string[] } {
    const factors: string[] = [];
    let riskScore = 0;

    // Check for suspicious token
    if (transfer.symbol && this.isSuspiciousToken(transfer.symbol)) {
      factors.push('Suspicious token');
      riskScore += 2;
    }

    return {
      level: riskScore >= 2 ? 'critical' : riskScore >= 1 ? 'moderate' : 'safe',
      factors,
    };
  }

  /**
   * Get approval risk factors
   */
  private getApprovalRiskFactors(approval: TokenApproval): string[] {
    const factors: string[] = [];

    if (approval.isUnlimited) {
      factors.push('Unlimited approval');
    }

    if (approval.isVerified === false) {
      factors.push('Unverified contract');
    }

    if (approval.contractAge && approval.contractAge < 30) {
      factors.push('New contract (<30 days)');
    }

    return factors;
  }

  /**
   * Check if token is suspicious
   */
  private isSuspiciousToken(symbol: string): boolean {
    const suspiciousPatterns = [
      /test/i,
      /fake/i,
      /scam/i,
      /phishing/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(symbol));
  }
}

// Singleton instance
export const activityTimeline = new ActivityTimeline();

