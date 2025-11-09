/**
 * Real-time Wallet Monitoring Utility
 * Monitors wallet activity and detects suspicious patterns
 */

import type { TokenApproval, TokenInfo } from '@wallet-health/types';

export interface WalletActivity {
  timestamp: number;
  type: 'approval' | 'transfer' | 'swap' | 'contract_interaction';
  from: string;
  to: string;
  value?: string;
  token?: string;
  hash: string;
  chainId: number;
}

export interface MonitoringAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'unusual_activity' | 'large_transfer' | 'new_approval' | 'suspicious_contract';
  message: string;
  timestamp: number;
  transactionHash?: string;
}

export interface WalletMonitorConfig {
  walletAddress: string;
  chainId: number;
  checkInterval?: number; // milliseconds
  alertThresholds?: {
    largeTransferThreshold?: number; // in USD
    newApprovalAlert?: boolean;
    suspiciousContractAlert?: boolean;
  };
}

export class WalletMonitor {
  private config: Required<WalletMonitorConfig>;
  private activityHistory: WalletActivity[] = [];
  private alerts: MonitoringAlert[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private onAlertCallback?: (alert: MonitoringAlert) => void;

  constructor(config: WalletMonitorConfig) {
    this.config = {
      ...config,
      checkInterval: config.checkInterval || 30000, // 30 seconds default
      alertThresholds: {
        largeTransferThreshold: config.alertThresholds?.largeTransferThreshold || 10000,
        newApprovalAlert: config.alertThresholds?.newApprovalAlert ?? true,
        suspiciousContractAlert: config.alertThresholds?.suspiciousContractAlert ?? true,
      },
    };
  }

  /**
   * Start monitoring wallet activity
   */
  start(onAlert?: (alert: MonitoringAlert) => void): void {
    this.onAlertCallback = onAlert;
    
    if (this.intervalId) {
      this.stop();
    }

    // Initial check
    this.checkActivity();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.checkActivity();
    }, this.config.checkInterval);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check for new wallet activity
   */
  private async checkActivity(): Promise<void> {
    try {
      // In a real implementation, this would fetch from blockchain
      // For now, this is a placeholder structure
      const newActivity = await this.fetchRecentActivity();
      
      // Detect new activities
      const newActivities = this.detectNewActivities(newActivity);
      
      // Analyze and generate alerts
      for (const activity of newActivities) {
        const alerts = this.analyzeActivity(activity);
        alerts.forEach(alert => {
          this.addAlert(alert);
        });
      }

      // Update history
      this.activityHistory = [...this.activityHistory, ...newActivities].slice(-1000); // Keep last 1000
    } catch (error) {
      console.error('Error checking wallet activity:', error);
    }
  }

  /**
   * Fetch recent activity (placeholder - would integrate with GoldRush API)
   */
  private async fetchRecentActivity(): Promise<WalletActivity[]> {
    // This would call the GoldRush API or blockchain RPC
    return [];
  }

  /**
   * Detect new activities not in history
   */
  private detectNewActivities(activities: WalletActivity[]): WalletActivity[] {
    const existingHashes = new Set(this.activityHistory.map(a => a.hash));
    return activities.filter(a => !existingHashes.has(a.hash));
  }

  /**
   * Analyze activity and generate alerts
   */
  private analyzeActivity(activity: WalletActivity): MonitoringAlert[] {
    const alerts: MonitoringAlert[] = [];

    // Large transfer detection
    if (activity.type === 'transfer' && activity.value) {
      const valueNum = parseFloat(activity.value);
      if (valueNum >= this.config.alertThresholds.largeTransferThreshold) {
        alerts.push({
          id: `large-transfer-${activity.hash}`,
          severity: 'warning',
          type: 'large_transfer',
          message: `Large transfer detected: $${valueNum.toLocaleString()}`,
          timestamp: activity.timestamp,
          transactionHash: activity.hash,
        });
      }
    }

    // New approval detection
    if (activity.type === 'approval' && this.config.alertThresholds.newApprovalAlert) {
      alerts.push({
        id: `new-approval-${activity.hash}`,
        severity: 'info',
        type: 'new_approval',
        message: `New token approval detected for ${activity.to}`,
        timestamp: activity.timestamp,
        transactionHash: activity.hash,
      });
    }

    // Suspicious contract detection
    if (activity.type === 'contract_interaction' && this.config.alertThresholds.suspiciousContractAlert) {
      // Check if contract is verified, new, or has low reputation
      alerts.push({
        id: `suspicious-contract-${activity.hash}`,
        severity: 'warning',
        type: 'suspicious_contract',
        message: `Interaction with potentially risky contract: ${activity.to}`,
        timestamp: activity.timestamp,
        transactionHash: activity.hash,
      });
    }

    return alerts;
  }

  /**
   * Add alert and trigger callback
   */
  private addAlert(alert: MonitoringAlert): void {
    // Avoid duplicates
    if (this.alerts.some(a => a.id === alert.id)) {
      return;
    }

    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Trigger callback
    if (this.onAlertCallback) {
      this.onAlertCallback(alert);
    }
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit = 10): MonitoringAlert[] {
    return this.alerts.slice(-limit).reverse();
  }

  /**
   * Get activity history
   */
  getActivityHistory(limit = 50): WalletActivity[] {
    return this.activityHistory.slice(-limit).reverse();
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }
}

/**
 * Compare two wallets and identify differences
 */
export function compareWallets(
  wallet1: { address: string; approvals: TokenApproval[]; tokens: TokenInfo[] },
  wallet2: { address: string; approvals: TokenApproval[]; tokens: TokenInfo[] }
): {
  uniqueApprovals1: TokenApproval[];
  uniqueApprovals2: TokenApproval[];
  commonApprovals: TokenApproval[];
  uniqueTokens1: TokenInfo[];
  uniqueTokens2: TokenInfo[];
  commonTokens: TokenInfo[];
} {
  // Compare approvals
  const approvalSet1 = new Set(wallet1.approvals.map(a => `${a.token}-${a.spender}`));
  const approvalSet2 = new Set(wallet2.approvals.map(a => `${a.token}-${a.spender}`));

  const uniqueApprovals1 = wallet1.approvals.filter(
    a => !approvalSet2.has(`${a.token}-${a.spender}`)
  );
  const uniqueApprovals2 = wallet2.approvals.filter(
    a => !approvalSet1.has(`${a.token}-${a.spender}`)
  );
  const commonApprovals = wallet1.approvals.filter(
    a => approvalSet2.has(`${a.token}-${a.spender}`)
  );

  // Compare tokens
  const tokenSet1 = new Set(wallet1.tokens.map(t => t.address.toLowerCase()));
  const tokenSet2 = new Set(wallet2.tokens.map(t => t.address.toLowerCase()));

  const uniqueTokens1 = wallet1.tokens.filter(
    t => !tokenSet2.has(t.address.toLowerCase())
  );
  const uniqueTokens2 = wallet2.tokens.filter(
    t => !tokenSet1.has(t.address.toLowerCase())
  );
  const commonTokens = wallet1.tokens.filter(
    t => tokenSet2.has(t.address.toLowerCase())
  );

  return {
    uniqueApprovals1,
    uniqueApprovals2,
    commonApprovals,
    uniqueTokens1,
    uniqueTokens2,
    commonTokens,
  };
}

