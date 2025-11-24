/**
 * Token Price Alert Manager Utility
 * Advanced token price alert management
 */

export interface PriceAlert {
  id: string;
  walletAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  condition: 'above' | 'below' | 'change_up' | 'change_down' | 'range';
  targetPrice?: number; // USD
  changePercent?: number; // Percentage
  priceRange?: [number, number]; // [min, max]
  isActive: boolean;
  createdAt: number;
  triggeredAt?: number;
  triggerCount: number;
  notificationChannels: Array<'email' | 'push' | 'sms' | 'webhook'>;
  webhookUrl?: string;
}

export interface AlertTrigger {
  alertId: string;
  tokenAddress: string;
  tokenSymbol: string;
  currentPrice: number;
  previousPrice: number;
  changePercent: number;
  timestamp: number;
  condition: string;
}

export class TokenPriceAlertManager {
  private alerts: Map<string, PriceAlert[]> = new Map();
  private triggers: AlertTrigger[] = [];

  /**
   * Create price alert
   */
  createAlert(alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggerCount'>): PriceAlert {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullAlert: PriceAlert = {
      ...alert,
      id,
      createdAt: Date.now(),
      triggerCount: 0,
    };

    const key = alert.walletAddress.toLowerCase();
    if (!this.alerts.has(key)) {
      this.alerts.set(key, []);
    }

    this.alerts.get(key)!.push(fullAlert);
    return fullAlert;
  }

  /**
   * Get alerts
   */
  getAlerts(walletAddress: string, activeOnly = false): PriceAlert[] {
    const key = walletAddress.toLowerCase();
    let alerts = this.alerts.get(key) || [];

    if (activeOnly) {
      alerts = alerts.filter(a => a.isActive);
    }

    return alerts.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Check alerts against current price
   */
  checkAlerts(
    walletAddress: string,
    tokenAddress: string,
    chainId: number,
    currentPrice: number,
    previousPrice?: number
  ): AlertTrigger[] {
    const alerts = this.getAlerts(walletAddress, true);
    const relevantAlerts = alerts.filter(
      a => a.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() && a.chainId === chainId
    );

    const triggers: AlertTrigger[] = [];
    const changePercent = previousPrice && previousPrice > 0
      ? ((currentPrice - previousPrice) / previousPrice) * 100
      : 0;

    relevantAlerts.forEach(alert => {
      let shouldTrigger = false;

      switch (alert.condition) {
        case 'above':
          if (alert.targetPrice && currentPrice >= alert.targetPrice) {
            shouldTrigger = true;
          }
          break;

        case 'below':
          if (alert.targetPrice && currentPrice <= alert.targetPrice) {
            shouldTrigger = true;
          }
          break;

        case 'change_up':
          if (alert.changePercent && changePercent >= alert.changePercent) {
            shouldTrigger = true;
          }
          break;

        case 'change_down':
          if (alert.changePercent && changePercent <= -alert.changePercent) {
            shouldTrigger = true;
          }
          break;

        case 'range':
          if (alert.priceRange) {
            const [min, max] = alert.priceRange;
            if (currentPrice >= min && currentPrice <= max) {
              shouldTrigger = true;
            }
          }
          break;
      }

      if (shouldTrigger) {
        const trigger: AlertTrigger = {
          alertId: alert.id,
          tokenAddress,
          tokenSymbol: alert.tokenSymbol,
          currentPrice,
          previousPrice: previousPrice || currentPrice,
          changePercent,
          timestamp: Date.now(),
          condition: alert.condition,
        };

        triggers.push(trigger);
        this.triggers.push(trigger);

        // Update alert
        alert.triggeredAt = Date.now();
        alert.triggerCount++;

        // Send notifications
        this.sendNotifications(alert, trigger);
      }
    });

    return triggers;
  }

  /**
   * Send notifications
   */
  private sendNotifications(alert: PriceAlert, trigger: AlertTrigger): void {
    const message = this.generateAlertMessage(alert, trigger);

    alert.notificationChannels.forEach(channel => {
      switch (channel) {
        case 'email':
          // Would send email
          console.log(`Email: ${message}`);
          break;
        case 'push':
          // Would send push notification
          console.log(`Push: ${message}`);
          break;
        case 'sms':
          // Would send SMS
          console.log(`SMS: ${message}`);
          break;
        case 'webhook':
          if (alert.webhookUrl) {
            // Would call webhook
            console.log(`Webhook to ${alert.webhookUrl}: ${message}`);
          }
          break;
      }
    });
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(alert: PriceAlert, trigger: AlertTrigger): string {
    switch (alert.condition) {
      case 'above':
        return `${alert.tokenSymbol} price is now $${trigger.currentPrice.toFixed(2)} (above $${alert.targetPrice})`;
      case 'below':
        return `${alert.tokenSymbol} price is now $${trigger.currentPrice.toFixed(2)} (below $${alert.targetPrice})`;
      case 'change_up':
        return `${alert.tokenSymbol} price increased ${trigger.changePercent.toFixed(2)}% to $${trigger.currentPrice.toFixed(2)}`;
      case 'change_down':
        return `${alert.tokenSymbol} price decreased ${Math.abs(trigger.changePercent).toFixed(2)}% to $${trigger.currentPrice.toFixed(2)}`;
      case 'range':
        return `${alert.tokenSymbol} price is $${trigger.currentPrice.toFixed(2)} (within range)`;
      default:
        return `${alert.tokenSymbol} price alert triggered`;
    }
  }

  /**
   * Update alert
   */
  updateAlert(walletAddress: string, alertId: string, updates: Partial<PriceAlert>): boolean {
    const alerts = this.getAlerts(walletAddress);
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) {
      return false;
    }

    Object.assign(alert, updates);
    return true;
  }

  /**
   * Delete alert
   */
  deleteAlert(walletAddress: string, alertId: string): boolean {
    const key = walletAddress.toLowerCase();
    const alerts = this.alerts.get(key);
    if (!alerts) {
      return false;
    }

    const index = alerts.findIndex(a => a.id === alertId);
    if (index === -1) {
      return false;
    }

    alerts.splice(index, 1);
    return true;
  }

  /**
   * Get trigger history
   */
  getTriggerHistory(walletAddress: string, limit = 50): AlertTrigger[] {
    const alerts = this.getAlerts(walletAddress);
    const alertIds = new Set(alerts.map(a => a.id));

    return this.triggers
      .filter(t => alertIds.has(t.alertId))
      .slice(-limit)
      .reverse();
  }

  /**
   * Clear alerts
   */
  clear(walletAddress?: string): void {
    if (walletAddress) {
      this.alerts.delete(walletAddress.toLowerCase());
    } else {
      this.alerts.clear();
      this.triggers = [];
    }
  }
}

// Singleton instance
export const tokenPriceAlertManager = new TokenPriceAlertManager();

