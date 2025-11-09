/**
 * Portfolio Performance Tracker
 * Tracks portfolio performance metrics over time
 */

export interface PerformanceSnapshot {
  timestamp: number;
  totalValueUSD: number;
  tokens: Record<string, {
    balance: string;
    valueUSD: number;
    price: number;
  }>;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  period: '1d' | '7d' | '30d' | '90d' | '1y' | 'all';
  startValue: number;
  endValue: number;
  absoluteReturn: number;
  absoluteReturnUSD: number;
  percentageReturn: number;
  volatility: number;
  sharpeRatio?: number;
  maxDrawdown: number;
  bestDay: { date: number; return: number };
  worstDay: { date: number; return: number };
  dailyReturns: Array<{ date: number; return: number; value: number }>;
}

export interface PerformanceComparison {
  portfolio: PerformanceMetrics;
  benchmarks: {
    ethereum?: PerformanceMetrics;
    bitcoin?: PerformanceMetrics;
    defiIndex?: PerformanceMetrics;
  };
  outperformance: {
    vsEthereum: number;
    vsBitcoin: number;
    vsDefiIndex: number;
  };
}

export class PortfolioPerformanceTracker {
  private snapshots: Map<string, PerformanceSnapshot[]> = new Map(); // wallet -> snapshots

  /**
   * Record a performance snapshot
   */
  recordSnapshot(
    walletAddress: string,
    snapshot: PerformanceSnapshot
  ): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.snapshots.has(walletKey)) {
      this.snapshots.set(walletKey, []);
    }

    const snapshots = this.snapshots.get(walletKey)!;
    snapshots.push(snapshot);

    // Keep last 1000 snapshots
    if (snapshots.length > 1000) {
      snapshots.shift();
    }

    // Sort by timestamp
    snapshots.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Calculate performance metrics
   */
  calculatePerformance(
    walletAddress: string,
    period: '1d' | '7d' | '30d' | '90d' | '1y' | 'all' = '30d'
  ): PerformanceMetrics {
    const walletKey = walletAddress.toLowerCase();
    const snapshots = this.snapshots.get(walletKey) || [];

    if (snapshots.length < 2) {
      throw new Error('Insufficient data for performance calculation');
    }

    const now = Date.now();
    let cutoff: number;

    switch (period) {
      case '1d':
        cutoff = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        cutoff = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        cutoff = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '90d':
        cutoff = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case '1y':
        cutoff = now - 365 * 24 * 60 * 60 * 1000;
        break;
      case 'all':
        cutoff = 0;
        break;
    }

    const periodSnapshots = snapshots.filter(s => s.timestamp >= cutoff);

    if (periodSnapshots.length < 2) {
      throw new Error('Insufficient data for selected period');
    }

    const startValue = periodSnapshots[0].totalValueUSD;
    const endValue = periodSnapshots[periodSnapshots.length - 1].totalValueUSD;
    const absoluteReturn = endValue - startValue;
    const percentageReturn = startValue > 0 ? (absoluteReturn / startValue) * 100 : 0;

    // Calculate daily returns
    const dailyReturns: PerformanceMetrics['dailyReturns'] = [];
    let maxDrawdown = 0;
    let peak = startValue;
    let bestDay = { date: periodSnapshots[0].timestamp, return: 0 };
    let worstDay = { date: periodSnapshots[0].timestamp, return: 0 };

    for (let i = 1; i < periodSnapshots.length; i++) {
      const prev = periodSnapshots[i - 1];
      const curr = periodSnapshots[i];
      const dailyReturn = prev.totalValueUSD > 0
        ? ((curr.totalValueUSD - prev.totalValueUSD) / prev.totalValueUSD) * 100
        : 0;

      dailyReturns.push({
        date: curr.timestamp,
        return: dailyReturn,
        value: curr.totalValueUSD,
      });

      // Track drawdown
      if (curr.totalValueUSD > peak) {
        peak = curr.totalValueUSD;
      }
      const drawdown = ((peak - curr.totalValueUSD) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }

      // Track best/worst days
      if (dailyReturn > bestDay.return) {
        bestDay = { date: curr.timestamp, return: dailyReturn };
      }
      if (dailyReturn < worstDay.return) {
        worstDay = { date: curr.timestamp, return: dailyReturn };
      }
    }

    // Calculate volatility (standard deviation of daily returns)
    const avgReturn = dailyReturns.reduce((sum, d) => sum + d.return, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce(
      (sum, d) => sum + Math.pow(d.return - avgReturn, 2),
      0
    ) / dailyReturns.length;
    const volatility = Math.sqrt(variance);

    // Calculate Sharpe ratio (simplified, assuming risk-free rate of 0)
    const sharpeRatio = volatility > 0 ? (avgReturn / volatility) : 0;

    return {
      period,
      startValue,
      endValue,
      absoluteReturn,
      absoluteReturnUSD: absoluteReturn,
      percentageReturn: Math.round(percentageReturn * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      bestDay,
      worstDay,
      dailyReturns,
    };
  }

  /**
   * Compare performance with benchmarks
   */
  async compareWithBenchmarks(
    walletAddress: string,
    period: '1d' | '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<PerformanceComparison> {
    const portfolio = this.calculatePerformance(walletAddress, period);

    // Placeholder for benchmark data - would fetch from API
    const benchmarks = {
      ethereum: portfolio, // Would be actual ETH performance
      bitcoin: portfolio, // Would be actual BTC performance
      defiIndex: portfolio, // Would be DeFi index performance
    };

    const outperformance = {
      vsEthereum: portfolio.percentageReturn - (benchmarks.ethereum?.percentageReturn || 0),
      vsBitcoin: portfolio.percentageReturn - (benchmarks.bitcoin?.percentageReturn || 0),
      vsDefiIndex: portfolio.percentageReturn - (benchmarks.defiIndex?.percentageReturn || 0),
    };

    return {
      portfolio,
      benchmarks,
      outperformance,
    };
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(
    walletAddress: string,
    limit?: number
  ): PerformanceSnapshot[] {
    const walletKey = walletAddress.toLowerCase();
    const snapshots = this.snapshots.get(walletKey) || [];
    return limit ? snapshots.slice(-limit) : snapshots;
  }

  /**
   * Calculate token allocation changes
   */
  calculateAllocationChanges(
    walletAddress: string,
    period: '1d' | '7d' | '30d' = '7d'
  ): Array<{
    tokenAddress: string;
    startAllocation: number;
    endAllocation: number;
    change: number;
  }> {
    const walletKey = walletAddress.toLowerCase();
    const snapshots = this.snapshots.get(walletKey) || [];

    const now = Date.now();
    let cutoff: number;
    switch (period) {
      case '1d':
        cutoff = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        cutoff = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        cutoff = now - 30 * 24 * 60 * 60 * 1000;
        break;
    }

    const periodSnapshots = snapshots.filter(s => s.timestamp >= cutoff);
    if (periodSnapshots.length < 2) return [];

    const start = periodSnapshots[0];
    const end = periodSnapshots[periodSnapshots.length - 1];

    const startTotal = start.totalValueUSD;
    const endTotal = end.totalValueUSD;

    const tokenSet = new Set([
      ...Object.keys(start.tokens),
      ...Object.keys(end.tokens),
    ]);

    const changes: Array<{
      tokenAddress: string;
      startAllocation: number;
      endAllocation: number;
      change: number;
    }> = [];

    tokenSet.forEach(tokenAddress => {
      const startValue = start.tokens[tokenAddress]?.valueUSD || 0;
      const endValue = end.tokens[tokenAddress]?.valueUSD || 0;

      const startAllocation = startTotal > 0 ? (startValue / startTotal) * 100 : 0;
      const endAllocation = endTotal > 0 ? (endValue / endTotal) * 100 : 0;

      changes.push({
        tokenAddress,
        startAllocation: Math.round(startAllocation * 100) / 100,
        endAllocation: Math.round(endAllocation * 100) / 100,
        change: Math.round((endAllocation - startAllocation) * 100) / 100,
      });
    });

    return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }
}

// Singleton instance
export const portfolioPerformanceTracker = new PortfolioPerformanceTracker();

