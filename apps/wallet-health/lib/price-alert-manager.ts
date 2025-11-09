/**
 * Token Price Alert Manager Utility
 * Manages price alerts for tokens
 */

export interface PriceAlert {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  condition: 'above' | 'below' | 'change_percent';
  targetPrice: number; // in USD
  currentPrice: number;
  isActive: boolean;
  createdAt: number;
  triggeredAt?: number;
  notificationSent: boolean;
}

export interface AlertTrigger {
  alertId: string;
  timestamp: number;
  tokenAddress: string;
  tokenSymbol: string;
  targetPrice: number;
  actualPrice: number;
  condition: string;
}

export class PriceAlertManager {
  private alerts: Map<string, PriceAlert> = new Map();
  private triggers: AlertTrigger[] = [];
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  /**
   * Create a new price alert
   */
  createAlert(
    tokenAddress: string,
    tokenSymbol: string,
    chainId: number,
    condition: PriceAlert['condition'],
    targetPrice: number
  ): PriceAlert {
    const alert: PriceAlert = {
      id: `${tokenAddress}-${chainId}-${Date.now()}`,
      tokenAddress: tokenAddress.toLowerCase(),
      tokenSymbol,
      chainId,
      condition,
      targetPrice,
      currentPrice: 0, // Will be updated when checked
      isActive: true,
      createdAt: Date.now(),
      notificationSent: false,
    };

    this.alerts.set(alert.id, alert);
    return alert;
  }

  /**
   * Update token price
   */
  async updatePrice(
    tokenAddress: string,
    chainId: number,
    price: number
  ): Promise<AlertTrigger[]> {
    const cacheKey = `${tokenAddress.toLowerCase()}-${chainId}`;
    this.priceCache.set(cacheKey, { price, timestamp: Date.now() });

    const triggers: AlertTrigger[] = [];

    // Check all active alerts for this token
    for (const alert of this.alerts.values()) {
      if (
        !alert.isActive ||
        alert.tokenAddress !== tokenAddress.toLowerCase() ||
        alert.chainId !== chainId
      ) {
        continue;
      }

      // Update current price
      alert.currentPrice = price;

      let shouldTrigger = false;

      switch (alert.condition) {
        case 'above':
          shouldTrigger = price >= alert.targetPrice;
          break;
        case 'below':
          shouldTrigger = price <= alert.targetPrice;
          break;
        case 'change_percent':
          // Calculate percent change from previous price
          const changePercent = alert.currentPrice > 0
            ? ((price - alert.currentPrice) / alert.currentPrice) * 100
            : 0;
          shouldTrigger = Math.abs(changePercent) >= alert.targetPrice;
          break;
      }

      if (shouldTrigger && !alert.notificationSent) {
        const trigger: AlertTrigger = {
          alertId: alert.id,
          timestamp: Date.now(),
          tokenAddress: alert.tokenAddress,
          tokenSymbol: alert.tokenSymbol,
          targetPrice: alert.targetPrice,
          actualPrice: price,
          condition: alert.condition,
        };

        triggers.push(trigger);
        alert.triggeredAt = Date.now();
        alert.notificationSent = true;
        alert.isActive = false; // Deactivate after trigger

        this.triggers.push(trigger);
      }
    }

    return triggers;
  }

  /**
   * Get price for a token
   */
  async getPrice(tokenAddress: string, chainId: number): Promise<number | null> {
    const cacheKey = `${tokenAddress.toLowerCase()}-${chainId}`;
    const cached = this.priceCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.price;
    }

    // In real implementation, fetch from price API
    // For now, return cached or null
    return cached?.price || null;
  }

  /**
   * Get all alerts
   */
  getAlerts(activeOnly = false): PriceAlert[] {
    const alerts = Array.from(this.alerts.values());
    return activeOnly ? alerts.filter(a => a.isActive) : alerts;
  }

  /**
   * Get alerts for a token
   */
  getTokenAlerts(tokenAddress: string, chainId: number): PriceAlert[] {
    return Array.from(this.alerts.values()).filter(
      a => a.tokenAddress === tokenAddress.toLowerCase() && a.chainId === chainId
    );
  }

  /**
   * Update alert
   */
  updateAlert(alertId: string, updates: Partial<PriceAlert>): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    Object.assign(alert, updates);
    return true;
  }

  /**
   * Delete alert
   */
  deleteAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  /**
   * Activate alert
   */
  activateAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.isActive = true;
    alert.notificationSent = false;
    return true;
  }

  /**
   * Deactivate alert
   */
  deactivateAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.isActive = false;
    return true;
  }

  /**
   * Get trigger history
   */
  getTriggers(limit = 50): AlertTrigger[] {
    return this.triggers.slice(-limit).reverse();
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts.clear();
  }

  /**
   * Clear triggers
   */
  clearTriggers(): void {
    this.triggers = [];
  }

  /**
   * Check all alerts (batch update)
   */
  async checkAllAlerts(
    priceFetcher: (address: string, chainId: number) => Promise<number | null>
  ): Promise<AlertTrigger[]> {
    const allTriggers: AlertTrigger[] = [];

    // Group alerts by token
    const alertsByToken = new Map<string, PriceAlert[]>();
    for (const alert of this.alerts.values()) {
      if (!alert.isActive) continue;

      const key = `${alert.tokenAddress}-${alert.chainId}`;
      if (!alertsByToken.has(key)) {
        alertsByToken.set(key, []);
      }
      alertsByToken.get(key)!.push(alert);
    }

    // Check each token
    for (const [key, alerts] of alertsByToken.entries()) {
      const [address, chainIdStr] = key.split('-');
      const chainId = parseInt(chainIdStr);

      const price = await priceFetcher(address, chainId);
      if (price !== null) {
        const triggers = await this.updatePrice(address, chainId, price);
        allTriggers.push(...triggers);
      }
    }

    return allTriggers;
  }
}

// Singleton instance
export const priceAlertManager = new PriceAlertManager();

