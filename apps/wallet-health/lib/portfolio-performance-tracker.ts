/**
 * Portfolio Performance Tracker Utility
 * Tracks portfolio value, returns, and performance metrics over time
 */

export interface PortfolioSnapshot {
  timestamp: number;
  totalValueUSD: number;
  tokenBreakdown: TokenValue[];
  chainBreakdown: ChainValue[];
  defiValue?: number;
  nftValue?: number;
}

export interface TokenValue {
  address: string;
  symbol: string;
  balance: string;
  valueUSD: number;
  priceUSD: number;
  chainId: number;
}

export interface ChainValue {
  chainId: number;
  chainName: string;
  valueUSD: number;
  percentage: number;
}

export interface PerformanceMetrics {
  currentValue: number;
  initialValue: number;
  totalReturn: number; // USD
  totalReturnPercent: number; // Percentage
  dailyReturn: number;
  dailyReturnPercent: number;
  weeklyReturn: number;
  weeklyReturnPercent: number;
  monthlyReturn: number;
  monthlyReturnPercent: number;
  bestPerformer: TokenValue;
  worstPerformer: TokenValue;
  volatility: number; // Standard deviation of returns
  sharpeRatio?: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
}

export interface PortfolioComparison {
  vsEthereum: {
    return: number;
    returnPercent: number;
  };
  vsBitcoin: {
    return: number;
    returnPercent: number;
  };
  vsMarket: {
    return: number;
    returnPercent: number;
  };
}

export class PortfolioPerformanceTracker {
  private snapshots: PortfolioSnapshot[] = [];
  private initialSnapshot: PortfolioSnapshot | null = null;

  /**
   * Add a portfolio snapshot
   */
  addSnapshot(snapshot: PortfolioSnapshot): void {
    this.snapshots.push(snapshot);
    
    // Keep snapshots sorted by timestamp
    this.snapshots.sort((a, b) => a.timestamp - b.timestamp);
    
    // Keep only last 1000 snapshots
    if (this.snapshots.length > 1000) {
      this.snapshots = this.snapshots.slice(-1000);
    }

    // Set initial snapshot if not set
    if (!this.initialSnapshot) {
      this.initialSnapshot = snapshot;
    }
  }

  /**
   * Calculate performance metrics
   */
  calculateMetrics(): PerformanceMetrics | null {
    if (this.snapshots.length < 2 || !this.initialSnapshot) {
      return null;
    }

    const current = this.snapshots[this.snapshots.length - 1];
    const initial = this.initialSnapshot;

    const totalReturn = current.totalValueUSD - initial.totalValueUSD;
    const totalReturnPercent = (totalReturn / initial.totalValueUSD) * 100;

    // Calculate daily return
    const oneDayAgo = this.getSnapshotBefore(current.timestamp - 24 * 60 * 60 * 1000);
    const dailyReturn = oneDayAgo 
      ? current.totalValueUSD - oneDayAgo.totalValueUSD
      : 0;
    const dailyReturnPercent = oneDayAgo
      ? ((dailyReturn / oneDayAgo.totalValueUSD) * 100)
      : 0;

    // Calculate weekly return
    const oneWeekAgo = this.getSnapshotBefore(current.timestamp - 7 * 24 * 60 * 60 * 1000);
    const weeklyReturn = oneWeekAgo
      ? current.totalValueUSD - oneWeekAgo.totalValueUSD
      : 0;
    const weeklyReturnPercent = oneWeekAgo
      ? ((weeklyReturn / oneWeekAgo.totalValueUSD) * 100)
      : 0;

    // Calculate monthly return
    const oneMonthAgo = this.getSnapshotBefore(current.timestamp - 30 * 24 * 60 * 60 * 1000);
    const monthlyReturn = oneMonthAgo
      ? current.totalValueUSD - oneMonthAgo.totalValueUSD
      : 0;
    const monthlyReturnPercent = oneMonthAgo
      ? ((monthlyReturn / oneMonthAgo.totalValueUSD) * 100)
      : 0;

    // Find best and worst performers
    const tokenPerformance = this.calculateTokenPerformance();
    const bestPerformer = tokenPerformance.sort((a, b) => b.returnPercent - a.returnPercent)[0];
    const worstPerformer = tokenPerformance.sort((a, b) => a.returnPercent - b.returnPercent)[0];

    // Calculate volatility
    const returns = this.calculateReturns();
    const volatility = this.calculateVolatility(returns);

    // Calculate max drawdown
    const { maxDrawdown, maxDrawdownPercent } = this.calculateMaxDrawdown();

    return {
      currentValue: current.totalValueUSD,
      initialValue: initial.totalValueUSD,
      totalReturn,
      totalReturnPercent,
      dailyReturn,
      dailyReturnPercent,
      weeklyReturn,
      weeklyReturnPercent,
      monthlyReturn,
      monthlyReturnPercent,
      bestPerformer: bestPerformer.token,
      worstPerformer: worstPerformer.token,
      volatility,
      maxDrawdown,
      maxDrawdownPercent,
    };
  }

  /**
   * Get snapshot before a timestamp
   */
  private getSnapshotBefore(timestamp: number): PortfolioSnapshot | null {
    for (let i = this.snapshots.length - 1; i >= 0; i--) {
      if (this.snapshots[i].timestamp <= timestamp) {
        return this.snapshots[i];
      }
    }
    return this.snapshots[0] || null;
  }

  /**
   * Calculate token performance
   */
  private calculateTokenPerformance(): Array<{
    token: TokenValue;
    returnPercent: number;
  }> {
    if (!this.initialSnapshot) return [];

    const current = this.snapshots[this.snapshots.length - 1];
    const initial = this.initialSnapshot;

    return current.tokenBreakdown.map(token => {
      const initialToken = initial.tokenBreakdown.find(
        t => t.address.toLowerCase() === token.address.toLowerCase() && t.chainId === token.chainId
      );

      if (!initialToken) {
        return { token, returnPercent: 0 };
      }

      const returnPercent = ((token.valueUSD - initialToken.valueUSD) / initialToken.valueUSD) * 100;
      return { token, returnPercent };
    });
  }

  /**
   * Calculate returns array
   */
  private calculateReturns(): number[] {
    const returns: number[] = [];
    
    for (let i = 1; i < this.snapshots.length; i++) {
      const prev = this.snapshots[i - 1];
      const curr = this.snapshots[i];
      const returnPercent = ((curr.totalValueUSD - prev.totalValueUSD) / prev.totalValueUSD) * 100;
      returns.push(returnPercent);
    }

    return returns;
  }

  /**
   * Calculate volatility (standard deviation)
   */
  private calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0;

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate maximum drawdown
   */
  private calculateMaxDrawdown(): { maxDrawdown: number; maxDrawdownPercent: number } {
    if (this.snapshots.length === 0) {
      return { maxDrawdown: 0, maxDrawdownPercent: 0 };
    }

    let peak = this.snapshots[0].totalValueUSD;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;

    for (const snapshot of this.snapshots) {
      if (snapshot.totalValueUSD > peak) {
        peak = snapshot.totalValueUSD;
      }

      const drawdown = peak - snapshot.totalValueUSD;
      const drawdownPercent = (drawdown / peak) * 100;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
      }
    }

    return { maxDrawdown, maxDrawdownPercent };
  }

  /**
   * Get portfolio value over time
   */
  getValueOverTime(startTime?: number, endTime?: number): Array<{ timestamp: number; value: number }> {
    let filtered = this.snapshots;

    if (startTime) {
      filtered = filtered.filter(s => s.timestamp >= startTime);
    }
    if (endTime) {
      filtered = filtered.filter(s => s.timestamp <= endTime);
    }

    return filtered.map(s => ({
      timestamp: s.timestamp,
      value: s.totalValueUSD,
    }));
  }

  /**
   * Get allocation breakdown
   */
  getAllocationBreakdown(): {
    byToken: Array<{ token: TokenValue; percentage: number }>;
    byChain: Array<{ chain: ChainValue; percentage: number }>;
  } {
    if (this.snapshots.length === 0) {
      return { byToken: [], byChain: [] };
    }

    const current = this.snapshots[this.snapshots.length - 1];
    const total = current.totalValueUSD;

    const byToken = current.tokenBreakdown.map(token => ({
      token,
      percentage: (token.valueUSD / total) * 100,
    }));

    const byChain = current.chainBreakdown.map(chain => ({
      chain,
      percentage: chain.percentage,
    }));

    return { byToken, byChain };
  }

  /**
   * Reset tracker (clear all snapshots)
   */
  reset(): void {
    this.snapshots = [];
    this.initialSnapshot = null;
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): PortfolioSnapshot[] {
    return [...this.snapshots];
  }
}

// Singleton instance
export const portfolioPerformanceTracker = new PortfolioPerformanceTracker();

