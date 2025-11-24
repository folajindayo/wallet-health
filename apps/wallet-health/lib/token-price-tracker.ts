/**
 * Token Price Tracker Utility
 * Track token prices over time
 */

export interface PricePoint {
  timestamp: number;
  price: number; // USD
  volume24h?: number;
  marketCap?: number;
  change24h?: number; // Percentage
}

export interface TokenPriceData {
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  prices: PricePoint[];
  currentPrice: number;
  priceChange24h: number; // Percentage
  priceChange7d: number; // Percentage
  priceChange30d: number; // Percentage
  allTimeHigh?: number;
  allTimeLow?: number;
  lastUpdated: number;
}

export interface PriceAlert {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  condition: 'above' | 'below' | 'change';
  targetPrice?: number;
  changePercent?: number; // For change alerts
  isActive: boolean;
  triggered: boolean;
  triggeredAt?: number;
}

export class TokenPriceTracker {
  private priceData: Map<string, TokenPriceData> = new Map();
  private alerts: Map<string, PriceAlert> = new Map();
  private readonly MAX_PRICE_POINTS = 10000;

  /**
   * Add price point
   */
  addPricePoint(
    tokenAddress: string,
    tokenSymbol: string,
    chainId: number,
    price: number,
    volume24h?: number,
    marketCap?: number,
    change24h?: number
  ): void {
    const key = `${tokenAddress.toLowerCase()}-${chainId}`;
    const pricePoint: PricePoint = {
      timestamp: Date.now(),
      price,
      volume24h,
      marketCap,
      change24h,
    };

    if (!this.priceData.has(key)) {
      this.priceData.set(key, {
        tokenAddress,
        tokenSymbol,
        chainId,
        prices: [],
        currentPrice: price,
        priceChange24h: change24h || 0,
        priceChange7d: 0,
        priceChange30d: 0,
        lastUpdated: Date.now(),
      });
    }

    const data = this.priceData.get(key)!;
    data.prices.push(pricePoint);

    // Keep only last MAX_PRICE_POINTS
    if (data.prices.length > this.MAX_PRICE_POINTS) {
      data.prices = data.prices.slice(-this.MAX_PRICE_POINTS);
    }

    // Update current price
    data.currentPrice = price;
    data.priceChange24h = change24h || 0;
    data.lastUpdated = Date.now();

    // Calculate 7d and 30d changes
    const now = Date.now();
    const price7dAgo = this.getPriceAt(data.prices, now - 7 * 24 * 60 * 60 * 1000);
    const price30dAgo = this.getPriceAt(data.prices, now - 30 * 24 * 60 * 60 * 1000);

    if (price7dAgo) {
      data.priceChange7d = ((price - price7dAgo) / price7dAgo) * 100;
    }
    if (price30dAgo) {
      data.priceChange30d = ((price - price30dAgo) / price30dAgo) * 100;
    }

    // Update all-time high/low
    if (!data.allTimeHigh || price > data.allTimeHigh) {
      data.allTimeHigh = price;
    }
    if (!data.allTimeLow || price < data.allTimeLow) {
      data.allTimeLow = price;
    }

    // Check alerts
    this.checkAlerts(key, price);
  }

  /**
   * Get price at specific time
   */
  private getPriceAt(prices: PricePoint[], timestamp: number): number | null {
    const point = prices.find(p => p.timestamp >= timestamp);
    return point ? point.price : null;
  }

  /**
   * Get price data
   */
  getPriceData(tokenAddress: string, chainId: number): TokenPriceData | null {
    const key = `${tokenAddress.toLowerCase()}-${chainId}`;
    return this.priceData.get(key) || null;
  }

  /**
   * Get price history
   */
  getPriceHistory(
    tokenAddress: string,
    chainId: number,
    startTime?: number,
    endTime?: number
  ): PricePoint[] {
    const data = this.getPriceData(tokenAddress, chainId);
    if (!data) {
      return [];
    }

    let prices = data.prices;

    if (startTime) {
      prices = prices.filter(p => p.timestamp >= startTime);
    }
    if (endTime) {
      prices = prices.filter(p => p.timestamp <= endTime);
    }

    return prices;
  }

  /**
   * Create price alert
   */
  createAlert(alert: Omit<PriceAlert, 'id' | 'triggered'>): PriceAlert {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullAlert: PriceAlert = {
      ...alert,
      id,
      triggered: false,
    };

    this.alerts.set(id, fullAlert);
    return fullAlert;
  }

  /**
   * Check alerts
   */
  private checkAlerts(key: string, currentPrice: number): void {
    this.alerts.forEach(alert => {
      if (!alert.isActive || alert.triggered) {
        return;
      }

      const alertKey = `${alert.tokenAddress.toLowerCase()}-${alert.chainId}`;
      if (alertKey !== key) {
        return;
      }

      let shouldTrigger = false;

      if (alert.condition === 'above' && alert.targetPrice) {
        shouldTrigger = currentPrice >= alert.targetPrice;
      } else if (alert.condition === 'below' && alert.targetPrice) {
        shouldTrigger = currentPrice <= alert.targetPrice;
      } else if (alert.condition === 'change' && alert.changePercent) {
        const data = this.priceData.get(key);
        if (data && data.priceChange24h) {
          shouldTrigger = Math.abs(data.priceChange24h) >= Math.abs(alert.changePercent);
        }
      }

      if (shouldTrigger) {
        alert.triggered = true;
        alert.triggeredAt = Date.now();
      }
    });
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(tokenAddress?: string, chainId?: number): PriceAlert[] {
    let alerts = Array.from(this.alerts.values()).filter(a => a.isActive && !a.triggered);

    if (tokenAddress && chainId) {
      alerts = alerts.filter(
        a => a.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() && a.chainId === chainId
      );
    }

    return alerts;
  }

  /**
   * Delete alert
   */
  deleteAlert(id: string): boolean {
    return this.alerts.delete(id);
  }

  /**
   * Get price statistics
   */
  getPriceStatistics(tokenAddress: string, chainId: number, days = 30): {
    average: number;
    min: number;
    max: number;
    volatility: number; // Standard deviation
    trend: 'up' | 'down' | 'stable';
  } | null {
    const data = this.getPriceData(tokenAddress, chainId);
    if (!data) {
      return null;
    }

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const prices = data.prices.filter(p => p.timestamp >= cutoff).map(p => p.price);

    if (prices.length === 0) {
      return null;
    }

    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    // Calculate volatility (standard deviation)
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance);

    // Determine trend
    const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
    const secondHalf = prices.slice(Math.floor(prices.length / 2));
    const firstAvg = firstHalf.reduce((sum, p) => sum + p, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p, 0) / secondHalf.length;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    if (changePercent > 5) {
      trend = 'up';
    } else if (changePercent < -5) {
      trend = 'down';
    }

    return {
      average: Math.round(average * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      trend,
    };
  }

  /**
   * Clear price data
   */
  clear(tokenAddress?: string, chainId?: number): void {
    if (tokenAddress && chainId) {
      const key = `${tokenAddress.toLowerCase()}-${chainId}`;
      this.priceData.delete(key);
    } else {
      this.priceData.clear();
    }
  }
}

// Singleton instance
export const tokenPriceTracker = new TokenPriceTracker();
