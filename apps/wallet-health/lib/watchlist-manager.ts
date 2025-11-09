/**
 * Watchlist Manager Utility
 * Manage and monitor multiple wallets
 */

export interface WatchedWallet {
  address: string;
  label?: string;
  tags?: string[];
  chainId: number;
  addedAt: number;
  lastScanned?: number;
  lastScore?: number;
  lastRiskLevel?: 'safe' | 'moderate' | 'critical';
  notes?: string;
  alertsEnabled: boolean;
  monitoringInterval?: number; // minutes
}

export interface WatchlistGroup {
  id: string;
  name: string;
  wallets: string[]; // wallet addresses
  color?: string;
  createdAt: number;
}

export interface WatchlistStats {
  totalWallets: number;
  safeWallets: number;
  moderateWallets: number;
  criticalWallets: number;
  totalApprovals: number;
  totalAlerts: number;
  averageScore: number;
}

export class WatchlistManager {
  private watchlist: Map<string, WatchedWallet> = new Map();
  private groups: Map<string, WatchlistGroup> = new Map();

  /**
   * Add wallet to watchlist
   */
  addWallet(wallet: Omit<WatchedWallet, 'addedAt'>): WatchedWallet {
    const watchedWallet: WatchedWallet = {
      ...wallet,
      addedAt: Date.now(),
    };

    this.watchlist.set(wallet.address.toLowerCase(), watchedWallet);
    this.saveToStorage();
    return watchedWallet;
  }

  /**
   * Remove wallet from watchlist
   */
  removeWallet(address: string): boolean {
    const removed = this.watchlist.delete(address.toLowerCase());
    if (removed) {
      // Remove from all groups
      this.groups.forEach(group => {
        const index = group.wallets.indexOf(address.toLowerCase());
        if (index > -1) {
          group.wallets.splice(index, 1);
        }
      });
      this.saveToStorage();
    }
    return removed;
  }

  /**
   * Update wallet information
   */
  updateWallet(
    address: string,
    updates: Partial<WatchedWallet>
  ): WatchedWallet | null {
    const wallet = this.watchlist.get(address.toLowerCase());
    if (!wallet) return null;

    const updated = { ...wallet, ...updates };
    this.watchlist.set(address.toLowerCase(), updated);
    this.saveToStorage();
    return updated;
  }

  /**
   * Get wallet from watchlist
   */
  getWallet(address: string): WatchedWallet | null {
    return this.watchlist.get(address.toLowerCase()) || null;
  }

  /**
   * Get all watched wallets
   */
  getAllWallets(): WatchedWallet[] {
    return Array.from(this.watchlist.values());
  }

  /**
   * Get wallets by tag
   */
  getWalletsByTag(tag: string): WatchedWallet[] {
    return Array.from(this.watchlist.values()).filter(
      wallet => wallet.tags?.includes(tag)
    );
  }

  /**
   * Get wallets by risk level
   */
  getWalletsByRiskLevel(riskLevel: 'safe' | 'moderate' | 'critical'): WatchedWallet[] {
    return Array.from(this.watchlist.values()).filter(
      wallet => wallet.lastRiskLevel === riskLevel
    );
  }

  /**
   * Create watchlist group
   */
  createGroup(group: Omit<WatchlistGroup, 'id' | 'createdAt'>): WatchlistGroup {
    const newGroup: WatchlistGroup = {
      ...group,
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    this.groups.set(newGroup.id, newGroup);
    this.saveToStorage();
    return newGroup;
  }

  /**
   * Add wallet to group
   */
  addWalletToGroup(groupId: string, walletAddress: string): boolean {
    const group = this.groups.get(groupId);
    if (!group) return false;

    const address = walletAddress.toLowerCase();
    if (!group.wallets.includes(address)) {
      group.wallets.push(address);
      this.saveToStorage();
    }
    return true;
  }

  /**
   * Remove wallet from group
   */
  removeWalletFromGroup(groupId: string, walletAddress: string): boolean {
    const group = this.groups.get(groupId);
    if (!group) return false;

    const index = group.wallets.indexOf(walletAddress.toLowerCase());
    if (index > -1) {
      group.wallets.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Get group wallets
   */
  getGroupWallets(groupId: string): WatchedWallet[] {
    const group = this.groups.get(groupId);
    if (!group) return [];

    return group.wallets
      .map(address => this.watchlist.get(address))
      .filter((wallet): wallet is WatchedWallet => wallet !== undefined);
  }

  /**
   * Get watchlist statistics
   */
  getStats(): WatchlistStats {
    const wallets = Array.from(this.watchlist.values());
    const safeWallets = wallets.filter(w => w.lastRiskLevel === 'safe').length;
    const moderateWallets = wallets.filter(w => w.lastRiskLevel === 'moderate').length;
    const criticalWallets = wallets.filter(w => w.lastRiskLevel === 'critical').length;

    const scores = wallets
      .map(w => w.lastScore)
      .filter((score): score is number => score !== undefined);

    const averageScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;

    return {
      totalWallets: wallets.length,
      safeWallets,
      moderateWallets,
      criticalWallets,
      totalApprovals: 0, // Would need to aggregate from scans
      totalAlerts: 0, // Would need to aggregate from scans
      averageScore: Math.round(averageScore),
    };
  }

  /**
   * Search wallets
   */
  searchWallets(query: string): WatchedWallet[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.watchlist.values()).filter(wallet => {
      return (
        wallet.address.toLowerCase().includes(lowerQuery) ||
        wallet.label?.toLowerCase().includes(lowerQuery) ||
        wallet.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        wallet.notes?.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Export watchlist
   */
  exportWatchlist(): string {
    return JSON.stringify({
      wallets: Array.from(this.watchlist.values()),
      groups: Array.from(this.groups.values()),
      exportDate: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Import watchlist
   */
  importWatchlist(data: {
    wallets: WatchedWallet[];
    groups?: WatchlistGroup[];
  }): void {
    data.wallets.forEach(wallet => {
      this.watchlist.set(wallet.address.toLowerCase(), wallet);
    });

    if (data.groups) {
      data.groups.forEach(group => {
        this.groups.set(group.id, group);
      });
    }

    this.saveToStorage();
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'wallet-health-watchlist',
          JSON.stringify({
            wallets: Array.from(this.watchlist.values()),
            groups: Array.from(this.groups.values()),
          })
        );
      } catch (error) {
        console.error('Failed to save watchlist to storage:', error);
      }
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wallet-health-watchlist');
        if (stored) {
          const data = JSON.parse(stored);
          if (data.wallets) {
            data.wallets.forEach((wallet: WatchedWallet) => {
              this.watchlist.set(wallet.address.toLowerCase(), wallet);
            });
          }
          if (data.groups) {
            data.groups.forEach((group: WatchlistGroup) => {
              this.groups.set(group.id, group);
            });
          }
        }
      } catch (error) {
        console.error('Failed to load watchlist from storage:', error);
      }
    }
  }
}

// Singleton instance
export const watchlistManager = new WatchlistManager();

// Initialize from storage if available
if (typeof window !== 'undefined') {
  watchlistManager.loadFromStorage();
}

