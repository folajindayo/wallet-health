/**
 * Whale Watcher Utility
 * Tracks large wallet movements and whale activity
 */

export interface WhaleTransaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  token: string;
  tokenSymbol: string;
  amount: string;
  amountUSD: number;
  type: 'transfer' | 'swap' | 'deposit' | 'withdraw';
  chainId: number;
  whaleType: 'whale' | 'mega_whale' | 'dolphin';
}

export interface WhaleWallet {
  address: string;
  label?: string;
  totalValueUSD: number;
  topHoldings: Array<{
    token: string;
    symbol: string;
    balance: string;
    valueUSD: number;
    percentage: number;
  }>;
  recentActivity: WhaleTransaction[];
  activityScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface WhaleAlert {
  id: string;
  type: 'large_transfer' | 'whale_movement' | 'accumulation' | 'distribution';
  wallet: string;
  transaction: WhaleTransaction;
  significance: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
}

export class WhaleWatcher {
  private whaleThresholds = {
    whale: 1000000, // $1M
    mega_whale: 10000000, // $10M
    dolphin: 100000, // $100K
  };

  private trackedWallets: Map<string, WhaleWallet> = new Map();
  private alerts: WhaleAlert[] = [];

  /**
   * Classify transaction as whale activity
   */
  classifyTransaction(transaction: {
    from: string;
    to: string;
    amountUSD: number;
    tokenSymbol: string;
  }): WhaleTransaction['whaleType'] | null {
    if (transaction.amountUSD >= this.whaleThresholds.mega_whale) {
      return 'mega_whale';
    }
    if (transaction.amountUSD >= this.whaleThresholds.whale) {
      return 'whale';
    }
    if (transaction.amountUSD >= this.whaleThresholds.dolphin) {
      return 'dolphin';
    }
    return null;
  }

  /**
   * Track whale wallet
   */
  trackWallet(wallet: WhaleWallet): void {
    this.trackedWallets.set(wallet.address.toLowerCase(), wallet);
  }

  /**
   * Get whale wallet
   */
  getWhaleWallet(address: string): WhaleWallet | null {
    return this.trackedWallets.get(address.toLowerCase()) || null;
  }

  /**
   * Process transaction and generate alerts
   */
  processTransaction(transaction: WhaleTransaction): WhaleAlert[] {
    const alerts: WhaleAlert[] = [];

    // Check if transaction qualifies as whale activity
    const whaleType = this.classifyTransaction({
      from: transaction.from,
      to: transaction.to,
      amountUSD: transaction.amountUSD,
      tokenSymbol: transaction.tokenSymbol,
    });

    if (!whaleType) {
      return alerts;
    }

    // Check if wallet is tracked
    const fromWallet = this.getWhaleWallet(transaction.from);
    const toWallet = this.getWhaleWallet(transaction.to);

    // Large transfer alert
    if (transaction.amountUSD >= this.whaleThresholds.mega_whale) {
      alerts.push({
        id: `whale-transfer-${transaction.hash}`,
        type: 'large_transfer',
        wallet: transaction.from,
        transaction,
        significance: 'critical',
        message: `Mega whale transfer: $${transaction.amountUSD.toLocaleString()} ${transaction.tokenSymbol}`,
        timestamp: transaction.timestamp,
      });
    }

    // Whale movement alert
    if (fromWallet || toWallet) {
      alerts.push({
        id: `whale-movement-${transaction.hash}`,
        type: 'whale_movement',
        wallet: fromWallet ? transaction.from : transaction.to,
        transaction,
        significance: 'high',
        message: `Tracked whale ${transaction.type}: $${transaction.amountUSD.toLocaleString()}`,
        timestamp: transaction.timestamp,
      });
    }

    // Accumulation pattern
    if (transaction.type === 'deposit' || transaction.type === 'transfer') {
      const isAccumulation = this.detectAccumulationPattern(transaction.to);
      if (isAccumulation) {
        alerts.push({
          id: `accumulation-${transaction.hash}`,
          type: 'accumulation',
          wallet: transaction.to,
          transaction,
          significance: 'medium',
          message: `Potential accumulation detected: $${transaction.amountUSD.toLocaleString()}`,
          timestamp: transaction.timestamp,
        });
      }
    }

    // Distribution pattern
    if (transaction.type === 'withdraw' || transaction.type === 'transfer') {
      const isDistribution = this.detectDistributionPattern(transaction.from);
      if (isDistribution) {
        alerts.push({
          id: `distribution-${transaction.hash}`,
          type: 'distribution',
          wallet: transaction.from,
          transaction,
          significance: 'high',
          message: `Potential distribution detected: $${transaction.amountUSD.toLocaleString()}`,
          timestamp: transaction.timestamp,
        });
      }
    }

    // Store alerts
    this.alerts.push(...alerts);

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    return alerts;
  }

  /**
   * Detect accumulation pattern
   */
  private detectAccumulationPattern(address: string): boolean {
    const wallet = this.getWhaleWallet(address);
    if (!wallet) {
      return false;
    }

    // Check if recent activity shows accumulation
    const recentDeposits = wallet.recentActivity.filter(
      t => t.type === 'deposit' || t.type === 'transfer'
    ).slice(0, 10);

    return recentDeposits.length >= 5; // 5+ deposits in recent activity
  }

  /**
   * Detect distribution pattern
   */
  private detectDistributionPattern(address: string): boolean {
    const wallet = this.getWhaleWallet(address);
    if (!wallet) {
      return false;
    }

    // Check if recent activity shows distribution
    const recentWithdrawals = wallet.recentActivity.filter(
      t => t.type === 'withdraw' || t.type === 'transfer'
    ).slice(0, 10);

    return recentWithdrawals.length >= 5; // 5+ withdrawals in recent activity
  }

  /**
   * Get top whales by value
   */
  getTopWhales(limit = 10): WhaleWallet[] {
    return Array.from(this.trackedWallets.values())
      .sort((a, b) => b.totalValueUSD - a.totalValueUSD)
      .slice(0, limit);
  }

  /**
   * Get recent whale alerts
   */
  getRecentAlerts(limit = 50): WhaleAlert[] {
    return this.alerts.slice(-limit).reverse();
  }

  /**
   * Get alerts by significance
   */
  getAlertsBySignificance(
    significance: WhaleAlert['significance']
  ): WhaleAlert[] {
    return this.alerts.filter(a => a.significance === significance);
  }

  /**
   * Analyze whale wallet activity
   */
  analyzeWalletActivity(address: string): {
    activityScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    patterns: string[];
  } | null {
    const wallet = this.getWhaleWallet(address);
    if (!wallet) {
      return null;
    }

    let activityScore = 0;
    const patterns: string[] = [];

    // Calculate activity score based on recent transactions
    const recentTransactions = wallet.recentActivity.slice(0, 20);
    activityScore += Math.min(50, recentTransactions.length * 2.5);

    // Check for accumulation
    if (this.detectAccumulationPattern(address)) {
      activityScore += 20;
      patterns.push('Accumulation pattern detected');
    }

    // Check for distribution
    if (this.detectDistributionPattern(address)) {
      activityScore += 15;
      patterns.push('Distribution pattern detected');
    }

    // Check for high value transactions
    const highValueTransactions = recentTransactions.filter(
      t => t.amountUSD >= this.whaleThresholds.whale
    );
    if (highValueTransactions.length > 0) {
      activityScore += 15;
      patterns.push(`${highValueTransactions.length} high-value transactions`);
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (activityScore >= 70) {
      riskLevel = 'high';
    } else if (activityScore >= 40) {
      riskLevel = 'medium';
    }

    return {
      activityScore: Math.min(100, activityScore),
      riskLevel,
      patterns,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.trackedWallets.clear();
    this.alerts = [];
  }
}

// Singleton instance
export const whaleWatcher = new WhaleWatcher();

