/**
 * Gas Price History Tracker Utility
 * Track gas price history over time
 */

export interface GasPricePoint {
  timestamp: number;
  chainId: number;
  slow: number; // gwei
  standard: number; // gwei
  fast: number; // gwei
  baseFee?: number; // gwei (EIP-1559)
  priorityFee?: number; // gwei (EIP-1559)
}

export interface GasPriceStatistics {
  chainId: number;
  period: {
    start: number;
    end: number;
  };
  average: {
    slow: number;
    standard: number;
    fast: number;
  };
  min: {
    slow: number;
    standard: number;
    fast: number;
  };
  max: {
    slow: number;
    standard: number;
    fast: number;
  };
  current: {
    slow: number;
    standard: number;
    fast: number;
  };
  trend: {
    slow: 'up' | 'down' | 'stable';
    standard: 'up' | 'down' | 'stable';
    fast: 'up' | 'down' | 'stable';
  };
  volatility: number; // Standard deviation
}

export interface GasPricePrediction {
  chainId: number;
  predictedPrice: number; // gwei
  confidence: number; // 0-100
  timeframe: number; // minutes
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
}

export class GasPriceHistoryTracker {
  private history: Map<number, GasPricePoint[]> = new Map();
  private readonly MAX_POINTS = 10000;

  /**
   * Add gas price point
   */
  addGasPricePoint(point: GasPricePoint): void {
    const chainHistory = this.history.get(point.chainId) || [];
    chainHistory.push(point);

    // Keep only last MAX_POINTS
    if (chainHistory.length > this.MAX_POINTS) {
      chainHistory.splice(0, chainHistory.length - this.MAX_POINTS);
    }

    this.history.set(point.chainId, chainHistory);
  }

  /**
   * Get gas price history
   */
  getHistory(chainId: number, startTime?: number, endTime?: number): GasPricePoint[] {
    const chainHistory = this.history.get(chainId) || [];
    
    let filtered = chainHistory;
    if (startTime) {
      filtered = filtered.filter(p => p.timestamp >= startTime);
    }
    if (endTime) {
      filtered = filtered.filter(p => p.timestamp <= endTime);
    }

    return filtered.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get current gas price
   */
  getCurrentGasPrice(chainId: number): GasPricePoint | null {
    const chainHistory = this.history.get(chainId) || [];
    if (chainHistory.length === 0) {
      return null;
    }

    return chainHistory[chainHistory.length - 1];
  }

  /**
   * Get statistics
   */
  getStatistics(chainId: number, days = 7): GasPriceStatistics | null {
    const chainHistory = this.history.get(chainId) || [];
    if (chainHistory.length === 0) {
      return null;
    }

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const periodHistory = chainHistory.filter(p => p.timestamp >= cutoff);

    if (periodHistory.length === 0) {
      return null;
    }

    const slowPrices = periodHistory.map(p => p.slow);
    const standardPrices = periodHistory.map(p => p.standard);
    const fastPrices = periodHistory.map(p => p.fast);

    const calculateAverage = (prices: number[]) =>
      prices.reduce((sum, p) => sum + p, 0) / prices.length;

    const calculateMin = (prices: number[]) => Math.min(...prices);
    const calculateMax = (prices: number[]) => Math.max(...prices);

    const calculateVolatility = (prices: number[]) => {
      const avg = calculateAverage(prices);
      const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
      return Math.sqrt(variance);
    };

    const determineTrend = (prices: number[]): 'up' | 'down' | 'stable' => {
      if (prices.length < 2) return 'stable';
      const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
      const secondHalf = prices.slice(Math.floor(prices.length / 2));
      const firstAvg = calculateAverage(firstHalf);
      const secondAvg = calculateAverage(secondHalf);
      const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
      
      if (changePercent > 5) return 'up';
      if (changePercent < -5) return 'down';
      return 'stable';
    };

    const current = chainHistory[chainHistory.length - 1];

    return {
      chainId,
      period: {
        start: periodHistory[0].timestamp,
        end: periodHistory[periodHistory.length - 1].timestamp,
      },
      average: {
        slow: Math.round(calculateAverage(slowPrices) * 100) / 100,
        standard: Math.round(calculateAverage(standardPrices) * 100) / 100,
        fast: Math.round(calculateAverage(fastPrices) * 100) / 100,
      },
      min: {
        slow: calculateMin(slowPrices),
        standard: calculateMin(standardPrices),
        fast: calculateMin(fastPrices),
      },
      max: {
        slow: calculateMax(slowPrices),
        standard: calculateMax(standardPrices),
        fast: calculateMax(fastPrices),
      },
      current: {
        slow: current.slow,
        standard: current.standard,
        fast: current.fast,
      },
      trend: {
        slow: determineTrend(slowPrices),
        standard: determineTrend(standardPrices),
        fast: determineTrend(fastPrices),
      },
      volatility: Math.round(calculateVolatility(standardPrices) * 100) / 100,
    };
  }

  /**
   * Predict future gas price
   */
  predictGasPrice(chainId: number, timeframeMinutes = 60): GasPricePrediction | null {
    const chainHistory = this.history.get(chainId) || [];
    if (chainHistory.length < 10) {
      return null;
    }

    const recent = chainHistory.slice(-20);
    const recentStandard = recent.map(p => p.standard);

    // Simple linear regression for prediction
    const n = recentStandard.length;
    const sumX = recent.reduce((sum, _, i) => sum + i, 0);
    const sumY = recentStandard.reduce((sum, p) => sum + p, 0);
    const sumXY = recentStandard.reduce((sum, p, i) => sum + i * p, 0);
    const sumX2 = recent.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict for future point
    const futureIndex = n + Math.floor(timeframeMinutes / 5); // Assuming 5-minute intervals
    const predictedPrice = slope * futureIndex + intercept;

    // Calculate confidence based on recent volatility
    const avg = sumY / n;
    const variance = recentStandard.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(0, Math.min(100, 100 - (stdDev / avg) * 100));

    // Analyze factors
    const factors: GasPricePrediction['factors'] = [];
    
    const currentPrice = recent[recent.length - 1].standard;
    const trend = currentPrice > recent[0].standard ? 'up' : 'down';
    
    if (trend === 'up') {
      factors.push({
        name: 'Recent Price Increase',
        impact: 'positive',
        description: 'Gas prices have been increasing recently',
      });
    } else {
      factors.push({
        name: 'Recent Price Decrease',
        impact: 'negative',
        description: 'Gas prices have been decreasing recently',
      });
    }

    if (stdDev / avg > 0.2) {
      factors.push({
        name: 'High Volatility',
        impact: 'neutral',
        description: 'Gas prices are highly volatile',
      });
    }

    return {
      chainId,
      predictedPrice: Math.max(0, Math.round(predictedPrice * 100) / 100),
      confidence: Math.round(confidence),
      timeframe: timeframeMinutes,
      factors,
    };
  }

  /**
   * Get optimal gas price recommendation
   */
  getOptimalGasPrice(chainId: number, urgency: 'low' | 'medium' | 'high'): {
    recommended: number; // gwei
    estimatedWait: number; // seconds
    savings: number; // Percentage vs fast
  } | null {
    const current = this.getCurrentGasPrice(chainId);
    if (!current) {
      return null;
    }

    let recommended = current.standard;
    let estimatedWait = 120; // 2 minutes default

    if (urgency === 'low') {
      recommended = current.slow;
      estimatedWait = 300; // 5 minutes
    } else if (urgency === 'high') {
      recommended = current.fast;
      estimatedWait = 30; // 30 seconds
    }

    const savings = ((current.fast - recommended) / current.fast) * 100;

    return {
      recommended: Math.round(recommended * 100) / 100,
      estimatedWait,
      savings: Math.round(savings * 100) / 100,
    };
  }

  /**
   * Clear history
   */
  clear(chainId?: number): void {
    if (chainId) {
      this.history.delete(chainId);
    } else {
      this.history.clear();
    }
  }
}

// Singleton instance
export const gasPriceHistoryTracker = new GasPriceHistoryTracker();

