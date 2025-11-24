/**
 * Risk Alert System
 * Comprehensive alert system for wallet security risks
 */

export interface RiskAlert {
  id: string;
  type: 'approval' | 'transaction' | 'token' | 'contract' | 'behavior' | 'score_change' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  walletAddress: string;
  chainId?: number;
  timestamp: number;
  acknowledged: boolean;
  acknowledgedAt?: number;
  resolved: boolean;
  resolvedAt?: number;
  metadata?: Record<string, any>;
  actions?: Array<{
    label: string;
    action: string;
    type: 'revoke' | 'review' | 'ignore' | 'custom';
  }>;
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    type: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
    value: any;
  }[];
  severity: RiskAlert['severity'];
  notificationChannels: Array<'email' | 'push' | 'sms' | 'webhook'>;
}

export interface AlertSummary {
  totalAlerts: number;
  unacknowledged: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byType: Record<string, number>;
  recentAlerts: RiskAlert[];
}

export class RiskAlertSystem {
  private alerts: Map<string, RiskAlert[]> = new Map(); // walletAddress -> alerts
  private rules: Map<string, AlertRule> = new Map();

  /**
   * Create alert
   */
  createAlert(alert: Omit<RiskAlert, 'id' | 'acknowledged' | 'resolved' | 'timestamp'>): RiskAlert {
    const fullAlert: RiskAlert = {
      ...alert,
      id: `${alert.walletAddress}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
    };

    const key = alert.walletAddress.toLowerCase();
    const existing = this.alerts.get(key) || [];
    existing.push(fullAlert);
    this.alerts.set(key, existing);

    return fullAlert;
  }

  /**
   * Get alerts for wallet
   */
  getAlerts(
    walletAddress: string,
    options?: {
      unacknowledgedOnly?: boolean;
      severity?: RiskAlert['severity'][];
      type?: RiskAlert['type'][];
      limit?: number;
    }
  ): RiskAlert[] {
    const key = walletAddress.toLowerCase();
    let alerts = this.alerts.get(key) || [];

    if (options?.unacknowledgedOnly) {
      alerts = alerts.filter((a) => !a.acknowledged);
    }

    if (options?.severity && options.severity.length > 0) {
      alerts = alerts.filter((a) => options.severity!.includes(a.severity));
    }

    if (options?.type && options.type.length > 0) {
      alerts = alerts.filter((a) => options.type!.includes(a.type));
    }

    // Sort by timestamp (newest first)
    alerts.sort((a, b) => b.timestamp - a.timestamp);

    if (options?.limit) {
      alerts = alerts.slice(0, options.limit);
    }

    return alerts;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(walletAddress: string, alertId: string): boolean {
    const key = walletAddress.toLowerCase();
    const alerts = this.alerts.get(key) || [];
    const alert = alerts.find((a) => a.id === alertId);

    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = Date.now();
      return true;
    }

    return false;
  }

  /**
   * Resolve alert
   */
  resolveAlert(walletAddress: string, alertId: string): boolean {
    const key = walletAddress.toLowerCase();
    const alerts = this.alerts.get(key) || [];
    const alert = alerts.find((a) => a.id === alertId);

    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      return true;
    }

    return false;
  }

  /**
   * Get alert summary
   */
  getSummary(walletAddress: string): AlertSummary {
    const alerts = this.getAlerts(walletAddress);
    const unacknowledged = alerts.filter((a) => !a.acknowledged).length;
    const critical = alerts.filter((a) => a.severity === 'critical').length;
    const high = alerts.filter((a) => a.severity === 'high').length;
    const medium = alerts.filter((a) => a.severity === 'medium').length;
    const low = alerts.filter((a) => a.severity === 'low').length;

    const byType: Record<string, number> = {};
    alerts.forEach((alert) => {
      byType[alert.type] = (byType[alert.type] || 0) + 1;
    });

    const recentAlerts = alerts.slice(0, 10);

    return {
      totalAlerts: alerts.length,
      unacknowledged,
      critical,
      high,
      medium,
      low,
      byType,
      recentAlerts,
    };
  }

  /**
   * Create alert rule
   */
  createRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Evaluate rules and create alerts
   */
  evaluateRules(walletAddress: string, data: {
    approvals?: any[];
    transactions?: any[];
    tokens?: any[];
    score?: number;
    previousScore?: number;
  }): RiskAlert[] {
    const createdAlerts: RiskAlert[] = [];

    this.rules.forEach((rule) => {
      if (!rule.enabled) return;

      // Evaluate conditions
      let matches = true;
      rule.conditions.forEach((condition) => {
        if (!this.evaluateCondition(condition, data)) {
          matches = false;
        }
      });

      if (matches) {
        const alert = this.createAlert({
          type: this.inferAlertType(rule),
          severity: rule.severity,
          title: rule.name,
          message: `Alert triggered: ${rule.name}`,
          walletAddress,
          metadata: { ruleId: rule.id },
        });
        createdAlerts.push(alert);
      }
    });

    return createdAlerts;
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: AlertRule['conditions'][0], data: any): boolean {
    const value = this.getDataValue(data, condition.type);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'exists':
        return value !== undefined && value !== null;
      default:
        return false;
    }
  }

  /**
   * Get data value by type
   */
  private getDataValue(data: any, type: string): any {
    switch (type) {
      case 'approval_count':
        return data.approvals?.length || 0;
      case 'risky_approval_count':
        return data.approvals?.filter((a: any) => a.riskLevel === 'high' || a.riskLevel === 'critical').length || 0;
      case 'score':
        return data.score || 0;
      case 'score_change':
        return (data.score || 0) - (data.previousScore || 0);
      case 'transaction_count':
        return data.transactions?.length || 0;
      case 'spam_token_count':
        return data.tokens?.filter((t: any) => t.isSpam).length || 0;
      default:
        return null;
    }
  }

  /**
   * Infer alert type from rule
   */
  private inferAlertType(rule: AlertRule): RiskAlert['type'] {
    if (rule.name.toLowerCase().includes('approval')) return 'approval';
    if (rule.name.toLowerCase().includes('transaction')) return 'transaction';
    if (rule.name.toLowerCase().includes('token')) return 'token';
    if (rule.name.toLowerCase().includes('contract')) return 'contract';
    if (rule.name.toLowerCase().includes('score')) return 'score_change';
    return 'behavior';
  }

  /**
   * Clear old alerts (older than specified days)
   */
  clearOldAlerts(daysToKeep: number = 90): number {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    let cleared = 0;

    this.alerts.forEach((alerts, key) => {
      const filtered = alerts.filter((a) => a.timestamp >= cutoffTime);
      if (filtered.length !== alerts.length) {
        this.alerts.set(key, filtered);
        cleared += alerts.length - filtered.length;
      }
    });

    return cleared;
  }

  /**
   * Bulk acknowledge alerts
   */
  bulkAcknowledge(walletAddress: string, alertIds: string[]): number {
    let acknowledged = 0;
    alertIds.forEach((id) => {
      if (this.acknowledgeAlert(walletAddress, id)) {
        acknowledged++;
      }
    });
    return acknowledged;
  }

  /**
   * Bulk resolve alerts
   */
  bulkResolve(walletAddress: string, alertIds: string[]): number {
    let resolved = 0;
    alertIds.forEach((id) => {
      if (this.resolveAlert(walletAddress, id)) {
        resolved++;
      }
    });
    return resolved;
  }
}

// Singleton instance
export const riskAlertSystem = new RiskAlertSystem();

