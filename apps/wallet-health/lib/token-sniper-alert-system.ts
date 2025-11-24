/**
 * Token Sniper Alert System Utility
 * Alert for new token launches and opportunities
 */

export interface TokenLaunch {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chainId: number;
  launchTime: number;
  initialPrice: number; // USD
  currentPrice: number; // USD
  liquidity: number; // USD
  marketCap: number; // USD
  holders: number;
  isVerified: boolean;
  contractVerified: boolean;
  honeypotRisk: 'low' | 'medium' | 'high';
  rugPullRisk: 'low' | 'medium' | 'high';
}

export interface SniperAlert {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  alertType: 'new_launch' | 'price_spike' | 'liquidity_added' | 'holder_growth';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: TokenLaunch;
  timestamp: number;
  acknowledged: boolean;
}

export interface SniperConfig {
  minLiquidity: number; // USD
  maxHoneypotRisk: 'low' | 'medium' | 'high';
  maxRugPullRisk: 'low' | 'medium' | 'high';
  requireVerified: boolean;
  minHolders?: number;
  chains: number[];
  enabled: boolean;
}

export class TokenSniperAlertSystem {
  private alerts: Map<string, SniperAlert[]> = new Map();
  private configs: Map<string, SniperConfig> = new Map();
  private launches: Map<string, TokenLaunch> = new Map();

  /**
   * Set configuration
   */
  setConfig(walletAddress: string, config: SniperConfig): void {
    this.configs.set(walletAddress.toLowerCase(), config);
  }

  /**
   * Get configuration
   */
  getConfig(walletAddress: string): SniperConfig | null {
    return this.configs.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Process new token launch
   */
  processLaunch(walletAddress: string, launch: TokenLaunch): SniperAlert | null {
    const config = this.getConfig(walletAddress);
    if (!config || !config.enabled) {
      return null;
    }

    // Check filters
    if (launch.liquidity < config.minLiquidity) {
      return null;
    }

    if (config.requireVerified && !launch.isVerified) {
      return null;
    }

    const riskOrder = { low: 1, medium: 2, high: 3 };
    if (riskOrder[launch.honeypotRisk] > riskOrder[config.maxHoneypotRisk]) {
      return null;
    }

    if (riskOrder[launch.rugPullRisk] > riskOrder[config.maxRugPullRisk]) {
      return null;
    }

    if (config.chains.length > 0 && !config.chains.includes(launch.chainId)) {
      return null;
    }

    if (config.minHolders && launch.holders < config.minHolders) {
      return null;
    }

    // Create alert
    const alert: SniperAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tokenAddress: launch.tokenAddress,
      tokenSymbol: launch.tokenSymbol,
      alertType: 'new_launch',
      priority: this.determinePriority(launch),
      message: `New token launch: ${launch.tokenName} (${launch.tokenSymbol})`,
      data: launch,
      timestamp: Date.now(),
      acknowledged: false,
    };

    // Store alert
    const key = walletAddress.toLowerCase();
    if (!this.alerts.has(key)) {
      this.alerts.set(key, []);
    }
    this.alerts.get(key)!.push(alert);

    // Store launch
    this.launches.set(launch.tokenAddress.toLowerCase(), launch);

    return alert;
  }

  /**
   * Determine alert priority
   */
  private determinePriority(launch: TokenLaunch): SniperAlert['priority'] {
    let score = 0;

    // High liquidity = higher priority
    if (launch.liquidity > 100000) {
      score += 3;
    } else if (launch.liquidity > 50000) {
      score += 2;
    } else if (launch.liquidity > 10000) {
      score += 1;
    }

    // Verified = higher priority
    if (launch.isVerified) {
      score += 2;
    }

    // Low risk = higher priority
    if (launch.honeypotRisk === 'low' && launch.rugPullRisk === 'low') {
      score += 2;
    }

    // Many holders = higher priority
    if (launch.holders > 100) {
      score += 1;
    }

    if (score >= 6) {
      return 'critical';
    } else if (score >= 4) {
      return 'high';
    } else if (score >= 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Get alerts
   */
  getAlerts(walletAddress: string, unacknowledgedOnly = false): SniperAlert[] {
    const key = walletAddress.toLowerCase();
    let alerts = this.alerts.get(key) || [];

    if (unacknowledgedOnly) {
      alerts = alerts.filter(a => !a.acknowledged);
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(walletAddress: string, alertId: string): boolean {
    const key = walletAddress.toLowerCase();
    const alerts = this.alerts.get(key);
    if (!alerts) {
      return false;
    }

    const alert = alerts.find(a => a.id === alertId);
    if (!alert) {
      return false;
    }

    alert.acknowledged = true;
    return true;
  }

  /**
   * Get launch
   */
  getLaunch(tokenAddress: string): TokenLaunch | null {
    return this.launches.get(tokenAddress.toLowerCase()) || null;
  }

  /**
   * Update launch price
   */
  updateLaunchPrice(tokenAddress: string, currentPrice: number): void {
    const launch = this.launches.get(tokenAddress.toLowerCase());
    if (launch) {
      launch.currentPrice = currentPrice;
      
      // Check for price spike
      const priceChange = ((currentPrice - launch.initialPrice) / launch.initialPrice) * 100;
      if (priceChange > 50) {
        // Could trigger price spike alert
      }
    }
  }

  /**
   * Clear alerts
   */
  clearAlerts(walletAddress?: string): void {
    if (walletAddress) {
      this.alerts.delete(walletAddress.toLowerCase());
    } else {
      this.alerts.clear();
    }
  }
}

// Singleton instance
export const tokenSniperAlertSystem = new TokenSniperAlertSystem();

