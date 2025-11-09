/**
 * Watchlist Manager
 * Manages watchlists for monitoring multiple wallets
 */

export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  wallets: string[];
  tags: string[];
  alertsEnabled: boolean;
  alertThresholds?: {
    scoreThreshold?: number;
    newApprovalAlert?: boolean;
    largeTransferAlert?: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

export interface WatchlistGroup {
  id: string;
  name: string;
  watchlists: string[]; // Watchlist IDs
  color?: string;
  createdAt: number;
}

export interface WatchlistAlert {
  id: string;
  watchlistId: string;
  walletAddress: string;
  type: 'score_change' | 'new_approval' | 'large_transfer' | 'risk_increase';
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export class WatchlistManager {
  private watchlists: Map<string, Watchlist> = new Map();
  private groups: Map<string, WatchlistGroup> = new Map();
  private alerts: Map<string, WatchlistAlert[]> = new Map(); // watchlistId -> alerts

  /**
   * Create watchlist
   */
  createWatchlist(
    watchlist: Omit<Watchlist, 'id' | 'createdAt' | 'updatedAt'>
  ): Watchlist {
    const now = Date.now();
    const fullWatchlist: Watchlist = {
      ...watchlist,
      id: `wl_${now}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    this.watchlists.set(fullWatchlist.id, fullWatchlist);
    return fullWatchlist;
  }

  /**
   * Get watchlist
   */
  getWatchlist(id: string): Watchlist | null {
    return this.watchlists.get(id) || null;
  }

  /**
   * Update watchlist
   */
  updateWatchlist(
    id: string,
    updates: Partial<Omit<Watchlist, 'id' | 'createdAt'>>
  ): boolean {
    const watchlist = this.watchlists.get(id);
    if (!watchlist) return false;

    Object.assign(watchlist, updates, { updatedAt: Date.now() });
    return true;
  }

  /**
   * Delete watchlist
   */
  deleteWatchlist(id: string): boolean {
    return this.watchlists.delete(id);
  }

  /**
   * Add wallet to watchlist
   */
  addWalletToWatchlist(watchlistId: string, walletAddress: string): boolean {
    const watchlist = this.watchlists.get(watchlistId);
    if (!watchlist) return false;

    const normalizedAddress = walletAddress.toLowerCase();
    if (!watchlist.wallets.includes(normalizedAddress)) {
      watchlist.wallets.push(normalizedAddress);
      watchlist.updatedAt = Date.now();
    }

    return true;
  }

  /**
   * Remove wallet from watchlist
   */
  removeWalletFromWatchlist(watchlistId: string, walletAddress: string): boolean {
    const watchlist = this.watchlists.get(watchlistId);
    if (!watchlist) return false;

    const normalizedAddress = walletAddress.toLowerCase();
    watchlist.wallets = watchlist.wallets.filter(w => w !== normalizedAddress);
    watchlist.updatedAt = Date.now();
    return true;
  }

  /**
   * Get all watchlists
   */
  getAllWatchlists(): Watchlist[] {
    return Array.from(this.watchlists.values());
  }

  /**
   * Search watchlists
   */
  searchWatchlists(query: {
    name?: string;
    tags?: string[];
    walletAddress?: string;
  }): Watchlist[] {
    let results = Array.from(this.watchlists.values());

    if (query.name) {
      const nameLower = query.name.toLowerCase();
      results = results.filter(w => w.name.toLowerCase().includes(nameLower));
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(w =>
        query.tags!.some(tag => w.tags.includes(tag))
      );
    }

    if (query.walletAddress) {
      const normalizedAddress = query.walletAddress.toLowerCase();
      results = results.filter(w =>
        w.wallets.includes(normalizedAddress)
      );
    }

    return results;
  }

  /**
   * Create group
   */
  createGroup(
    group: Omit<WatchlistGroup, 'id' | 'createdAt'>
  ): WatchlistGroup {
    const now = Date.now();
    const fullGroup: WatchlistGroup = {
      ...group,
      id: `grp_${now}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
    };

    this.groups.set(fullGroup.id, fullGroup);
    return fullGroup;
  }

  /**
   * Get all groups
   */
  getAllGroups(): WatchlistGroup[] {
    return Array.from(this.groups.values());
  }

  /**
   * Add alert
   */
  addAlert(
    watchlistId: string,
    alert: Omit<WatchlistAlert, 'id' | 'timestamp' | 'acknowledged'>
  ): WatchlistAlert {
    const fullAlert: WatchlistAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      acknowledged: false,
    };

    if (!this.alerts.has(watchlistId)) {
      this.alerts.set(watchlistId, []);
    }

    this.alerts.get(watchlistId)!.push(fullAlert);

    // Keep last 1000 alerts per watchlist
    const alerts = this.alerts.get(watchlistId)!;
    if (alerts.length > 1000) {
      alerts.shift();
    }

    return fullAlert;
  }

  /**
   * Get alerts for watchlist
   */
  getAlerts(
    watchlistId: string,
    options: {
      unacknowledgedOnly?: boolean;
      severity?: WatchlistAlert['severity'][];
      limit?: number;
    } = {}
  ): WatchlistAlert[] {
    let alerts = this.alerts.get(watchlistId) || [];

    if (options.unacknowledgedOnly) {
      alerts = alerts.filter(a => !a.acknowledged);
    }

    if (options.severity && options.severity.length > 0) {
      alerts = alerts.filter(a => options.severity!.includes(a.severity));
    }

    alerts.sort((a, b) => b.timestamp - a.timestamp);

    if (options.limit) {
      alerts = alerts.slice(0, options.limit);
    }

    return alerts;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(watchlistId: string, alertId: string): boolean {
    const alerts = this.alerts.get(watchlistId);
    if (!alerts) return false;

    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    return true;
  }

  /**
   * Get watchlist statistics
   */
  getWatchlistStats(watchlistId: string): {
    totalWallets: number;
    totalAlerts: number;
    unacknowledgedAlerts: number;
    alertsBySeverity: Record<WatchlistAlert['severity'], number>;
  } | null {
    const watchlist = this.watchlists.get(watchlistId);
    if (!watchlist) return null;

    const alerts = this.alerts.get(watchlistId) || [];
    const unacknowledged = alerts.filter(a => !a.acknowledged).length;

    const alertsBySeverity: Record<WatchlistAlert['severity'], number> = {
      high: 0,
      medium: 0,
      low: 0,
    };

    alerts.forEach(alert => {
      alertsBySeverity[alert.severity]++;
    });

    return {
      totalWallets: watchlist.wallets.length,
      totalAlerts: alerts.length,
      unacknowledgedAlerts: unacknowledged,
      alertsBySeverity,
    };
  }
}

// Singleton instance
export const watchlistManager = new WatchlistManager();
