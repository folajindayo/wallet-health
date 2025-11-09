/**
 * Alert Manager
 * Manages and delivers alerts for wallet security events
 */

import type { RiskAlert } from '@wallet-health/types';

export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: {
    critical: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
  };
}

export type AlertChannel = 'browser' | 'email' | 'push' | 'webhook';

export interface Alert {
  id: string;
  type: 'risk' | 'transaction' | 'approval' | 'token' | 'contract';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  timestamp: number;
  walletAddress: string;
  chainId?: number;
  transactionHash?: string;
  metadata?: Record<string, any>;
  acknowledged: boolean;
  acknowledgedAt?: number;
}

export interface AlertPreferences {
  walletAddress: string;
  config: AlertConfig;
  mutedAlerts: string[]; // Alert IDs that are muted
}

export class AlertManager {
  private alerts: Map<string, Alert[]> = new Map(); // wallet -> alerts
  private preferences: Map<string, AlertPreferences> = new Map();
  private listeners: Map<string, Set<(alert: Alert) => void>> = new Map();

  /**
   * Register alert listener for a wallet
   */
  onAlert(walletAddress: string, callback: (alert: Alert) => void): () => void {
    if (!this.listeners.has(walletAddress)) {
      this.listeners.set(walletAddress, new Set());
    }
    this.listeners.get(walletAddress)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(walletAddress)?.delete(callback);
    };
  }

  /**
   * Create and dispatch an alert
   */
  async createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>): Promise<Alert> {
    const fullAlert: Alert = {
      ...alert,
      id: this.generateAlertId(),
      timestamp: Date.now(),
      acknowledged: false,
    };

    // Get preferences for this wallet
    const prefs = this.preferences.get(alert.walletAddress.toLowerCase());
    
    // Check if alert type is enabled
    if (prefs && !this.shouldSendAlert(fullAlert, prefs.config)) {
      return fullAlert;
    }

    // Check if alert is muted
    if (prefs?.mutedAlerts.includes(fullAlert.id)) {
      return fullAlert;
    }

    // Store alert
    const walletKey = alert.walletAddress.toLowerCase();
    if (!this.alerts.has(walletKey)) {
      this.alerts.set(walletKey, []);
    }
    const walletAlerts = this.alerts.get(walletKey)!;
    walletAlerts.push(fullAlert);

    // Keep only last 1000 alerts per wallet
    if (walletAlerts.length > 1000) {
      walletAlerts.shift();
    }

    // Dispatch to listeners
    this.dispatchAlert(fullAlert);

    // Send via configured channels
    if (prefs) {
      await this.sendAlert(fullAlert, prefs.config);
    }

    return fullAlert;
  }

  /**
   * Convert RiskAlert to Alert
   */
  createAlertFromRiskAlert(
    walletAddress: string,
    riskAlert: RiskAlert,
    chainId?: number
  ): Alert {
    const severityMap: Record<string, Alert['severity']> = {
      high: 'high',
      medium: 'medium',
      low: 'low',
    };

    return {
      id: this.generateAlertId(),
      type: 'risk',
      severity: severityMap[riskAlert.severity] || 'medium',
      title: riskAlert.title,
      message: riskAlert.description,
      timestamp: Date.now(),
      walletAddress,
      chainId,
      acknowledged: false,
      metadata: {
        actionable: riskAlert.actionable,
        actionLabel: riskAlert.actionLabel,
      },
    };
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(walletAddress: string, alertId: string): boolean {
    const walletKey = walletAddress.toLowerCase();
    const walletAlerts = this.alerts.get(walletKey);
    
    if (!walletAlerts) return false;

    const alert = walletAlerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedAt = Date.now();
    return true;
  }

  /**
   * Get alerts for a wallet
   */
  getAlerts(
    walletAddress: string,
    options: {
      unacknowledgedOnly?: boolean;
      severity?: Alert['severity'][];
      type?: Alert['type'][];
      limit?: number;
      since?: number;
    } = {}
  ): Alert[] {
    const walletKey = walletAddress.toLowerCase();
    let alerts = this.alerts.get(walletKey) || [];

    // Filter unacknowledged
    if (options.unacknowledgedOnly) {
      alerts = alerts.filter(a => !a.acknowledged);
    }

    // Filter by severity
    if (options.severity && options.severity.length > 0) {
      alerts = alerts.filter(a => options.severity!.includes(a.severity));
    }

    // Filter by type
    if (options.type && options.type.length > 0) {
      alerts = alerts.filter(a => options.type!.includes(a.type));
    }

    // Filter by timestamp
    if (options.since) {
      alerts = alerts.filter(a => a.timestamp >= options.since!);
    }

    // Sort by timestamp (newest first)
    alerts.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    if (options.limit) {
      alerts = alerts.slice(0, options.limit);
    }

    return alerts;
  }

  /**
   * Get alert statistics
   */
  getAlertStats(walletAddress: string): {
    total: number;
    unacknowledged: number;
    bySeverity: Record<Alert['severity'], number>;
    byType: Record<Alert['type'], number>;
  } {
    const walletKey = walletAddress.toLowerCase();
    const alerts = this.alerts.get(walletKey) || [];

    const stats = {
      total: alerts.length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      } as Record<Alert['severity'], number>,
      byType: {
        risk: 0,
        transaction: 0,
        approval: 0,
        token: 0,
        contract: 0,
      } as Record<Alert['type'], number>,
    };

    alerts.forEach(alert => {
      stats.bySeverity[alert.severity]++;
      stats.byType[alert.type]++;
    });

    return stats;
  }

  /**
   * Set alert preferences for a wallet
   */
  setPreferences(walletAddress: string, preferences: AlertPreferences): void {
    this.preferences.set(walletAddress.toLowerCase(), preferences);
  }

  /**
   * Get alert preferences
   */
  getPreferences(walletAddress: string): AlertPreferences | null {
    return this.preferences.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Clear alerts for a wallet
   */
  clearAlerts(walletAddress: string, options: { acknowledgedOnly?: boolean } = {}): number {
    const walletKey = walletAddress.toLowerCase();
    const alerts = this.alerts.get(walletKey);
    
    if (!alerts) return 0;

    if (options.acknowledgedOnly) {
      const before = alerts.length;
      const filtered = alerts.filter(a => !a.acknowledged);
      this.alerts.set(walletKey, filtered);
      return before - filtered.length;
    } else {
      const count = alerts.length;
      this.alerts.delete(walletKey);
      return count;
    }
  }

  /**
   * Private methods
   */

  private shouldSendAlert(alert: Alert, config: AlertConfig): boolean {
    if (!config.enabled) return false;
    return config.thresholds[alert.severity] ?? false;
  }

  private dispatchAlert(alert: Alert): void {
    const walletKey = alert.walletAddress.toLowerCase();
    const listeners = this.listeners.get(walletKey);
    
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('Error in alert listener:', error);
        }
      });
    }
  }

  private async sendAlert(alert: Alert, config: AlertConfig): Promise<void> {
    for (const channel of config.channels) {
      try {
        switch (channel) {
          case 'browser':
            await this.sendBrowserNotification(alert);
            break;
          case 'email':
            await this.sendEmailNotification(alert);
            break;
          case 'push':
            await this.sendPushNotification(alert);
            break;
          case 'webhook':
            await this.sendWebhookNotification(alert);
            break;
        }
      } catch (error) {
        console.error(`Error sending alert via ${channel}:`, error);
      }
    }
  }

  private async sendBrowserNotification(alert: Alert): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    // Request permission if not granted
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: alert.id,
        requireInteraction: alert.severity === 'critical',
      });
    }
  }

  private async sendEmailNotification(alert: Alert): Promise<void> {
    // Placeholder - would integrate with email service
    console.log('Email notification:', alert);
  }

  private async sendPushNotification(alert: Alert): Promise<void> {
    // Placeholder - would integrate with push notification service
    console.log('Push notification:', alert);
  }

  private async sendWebhookNotification(alert: Alert): Promise<void> {
    // Placeholder - would send to configured webhook URL
    console.log('Webhook notification:', alert);
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const alertManager = new AlertManager();

