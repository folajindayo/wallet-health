/**
 * Gas Price Predictor Utility
 * Predict optimal gas prices based on historical data and network conditions
 */

export interface GasPricePrediction {
  chainId: number;
  predictedGasPrice: number; // gwei
  confidence: number; // 0-100
  timeframe: 'immediate' | '5min' | '15min' | '30min' | '1hour';
  currentGasPrice: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
  historicalAverage?: number;
}

export interface GasPriceHistory {
  timestamp: number;
  slow: number;
  standard: number;
  fast: number;
  instant?: number;
}

export interface NetworkConditions {
  chainId: number;
  pendingTransactions: number;
  blockUtilization: number; // 0-100
  networkCongestion: 'low' | 'medium' | 'high' | 'very-high';
  estimatedWaitTime: number; // seconds
}

export class GasPricePredictor {
  private history: Map<number, GasPriceHistory[]> = new Map();

  /**
   * Add gas price history entry
   */
  addHistoryEntry(chainId: number, history: GasPriceHistory): void {
    if (!this.history.has(chainId)) {
      this.history.set(chainId, []);
    }

    const chainHistory = this.history.get(chainId)!;
    chainHistory.push(history);

    // Keep only last 1000 entries
    if (chainHistory.length > 1000) {
      chainHistory.shift();
    }
  }

  /**
   * Predict gas price
   */
  predictGasPrice(
    chainId: number,
    currentGasPrice: number,
    timeframe: GasPricePrediction['timeframe'] = '15min',
    networkConditions?: NetworkConditions
  ): GasPricePrediction {
    const chainHistory = this.history.get(chainId) || [];
    
    // Calculate trend
    const trend = this.calculateTrend(chainHistory, currentGasPrice);
    
    // Predict based on trend and network conditions
    let predictedGasPrice = currentGasPrice;
    let confidence = 50;

    if (chainHistory.length > 0) {
      // Use moving average
      const recent = chainHistory.slice(-10);
      const avgStandard = recent.reduce((sum, h) => sum + h.standard, 0) / recent.length;
      predictedGasPrice = avgStandard;
      confidence = Math.min(100, 50 + recent.length * 5);
    }

    // Adjust based on trend
    if (trend === 'increasing') {
      predictedGasPrice *= 1.1; // 10% increase
      confidence += 10;
    } else if (trend === 'decreasing') {
      predictedGasPrice *= 0.9; // 10% decrease
      confidence += 10;
    }

    // Adjust based on network conditions
    if (networkConditions) {
      if (networkConditions.networkCongestion === 'very-high') {
        predictedGasPrice *= 1.2;
        confidence += 15;
      } else if (networkConditions.networkCongestion === 'high') {
        predictedGasPrice *= 1.1;
        confidence += 10;
      } else if (networkConditions.networkCongestion === 'low') {
        predictedGasPrice *= 0.95;
        confidence += 5;
      }
    }

    // Calculate historical average
    const historicalAverage = chainHistory.length > 0
      ? chainHistory.reduce((sum, h) => sum + h.standard, 0) / chainHistory.length
      : undefined;

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      predictedGasPrice,
      currentGasPrice,
      trend,
      networkConditions
    );

    return {
      chainId,
      predictedGasPrice: Math.round(predictedGasPrice * 100) / 100,
      confidence: Math.min(100, confidence),
      timeframe,
      currentGasPrice,
      trend,
      recommendation,
      historicalAverage: historicalAverage ? Math.round(historicalAverage * 100) / 100 : undefined,
    };
  }

  /**
   * Calculate gas price trend
   */
  private calculateTrend(
    history: GasPriceHistory[],
    currentPrice: number
  ): GasPricePrediction['trend'] {
    if (history.length < 2) return 'stable';

    const recent = history.slice(-5);
    if (recent.length === 0) return 'stable';

    const avgRecent = recent.reduce((sum, h) => sum + h.standard, 0) / recent.length;
    const diff = currentPrice - avgRecent;
    const percentDiff = (diff / avgRecent) * 100;

    if (percentDiff > 5) return 'increasing';
    if (percentDiff < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(
    predictedPrice: number,
    currentPrice: number,
    trend: GasPricePrediction['trend'],
    networkConditions?: NetworkConditions
  ): string {
    if (networkConditions?.networkCongestion === 'very-high') {
      return 'Network is very congested - consider waiting or using higher gas price';
    }

    if (trend === 'increasing') {
      return 'Gas prices are increasing - submit transaction soon to avoid higher costs';
    }

    if (trend === 'decreasing') {
      return 'Gas prices are decreasing - consider waiting for better rates';
    }

    if (predictedPrice < currentPrice * 0.9) {
      return 'Predicted price is lower - consider waiting for better rates';
    }

    if (predictedPrice > currentPrice * 1.1) {
      return 'Predicted price is higher - submit transaction now to avoid cost increase';
    }

    return 'Gas prices are stable - current price is optimal';
  }

  /**
   * Get optimal gas price for time target
   */
  getOptimalGasPriceForTime(
    chainId: number,
    targetTimeSeconds: number,
    currentGasPrice: number
  ): {
    recommendedGasPrice: number;
    estimatedTime: number;
    confidence: number;
  } {
    const chainHistory = this.history.get(chainId) || [];
    
    // Estimate based on historical data
    let recommendedGasPrice = currentGasPrice;
    let estimatedTime = 120; // default 2 minutes
    let confidence = 50;

    if (chainHistory.length > 0) {
      // Find historical gas prices that achieved similar confirmation times
      // This is simplified - in reality would need actual confirmation time data
      const avgStandard = chainHistory.reduce((sum, h) => sum + h.standard, 0) / chainHistory.length;
      
      if (targetTimeSeconds <= 30) {
        recommendedGasPrice = avgStandard * 1.5;
        estimatedTime = 30;
        confidence = 60;
      } else if (targetTimeSeconds <= 60) {
        recommendedGasPrice = avgStandard * 1.2;
        estimatedTime = 60;
        confidence = 65;
      } else if (targetTimeSeconds <= 120) {
        recommendedGasPrice = avgStandard;
        estimatedTime = 120;
        confidence = 70;
      } else {
        recommendedGasPrice = avgStandard * 0.8;
        estimatedTime = 300;
        confidence = 65;
      }
    }

    return {
      recommendedGasPrice: Math.round(recommendedGasPrice * 100) / 100,
      estimatedTime,
      confidence,
    };
  }

  /**
   * Analyze gas price patterns
   */
  analyzePatterns(chainId: number): {
    averageGasPrice: number;
    volatility: number;
    peakHours: number[];
    lowHours: number[];
    weeklyPattern?: {
      day: number;
      averageGasPrice: number;
    }[];
  } {
    const chainHistory = this.history.get(chainId) || [];
    
    if (chainHistory.length === 0) {
      return {
        averageGasPrice: 0,
        volatility: 0,
        peakHours: [],
        lowHours: [],
      };
    }

    const averageGasPrice = chainHistory.reduce(
      (sum, h) => sum + h.standard,
      0
    ) / chainHistory.length;

    // Calculate volatility (standard deviation)
    const variance = chainHistory.reduce(
      (sum, h) => sum + Math.pow(h.standard - averageGasPrice, 2),
      0
    ) / chainHistory.length;
    const volatility = Math.sqrt(variance);

    // Analyze hourly patterns
    const hourlyPrices = new Map<number, number[]>();
    chainHistory.forEach(h => {
      const hour = new Date(h.timestamp).getHours();
      if (!hourlyPrices.has(hour)) {
        hourlyPrices.set(hour, []);
      }
      hourlyPrices.get(hour)!.push(h.standard);
    });

    const hourlyAverages = Array.from(hourlyPrices.entries()).map(([hour, prices]) => ({
      hour,
      average: prices.reduce((sum, p) => sum + p, 0) / prices.length,
    }));

    hourlyAverages.sort((a, b) => b.average - a.average);
    const peakHours = hourlyAverages.slice(0, 3).map(h => h.hour);
    const lowHours = hourlyAverages.slice(-3).map(h => h.hour);

    return {
      averageGasPrice: Math.round(averageGasPrice * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      peakHours,
      lowHours,
    };
  }

  /**
   * Get gas price statistics
   */
  getStatistics(chainId: number): {
    totalEntries: number;
    timeRange: {
      start: number;
      end: number;
      days: number;
    };
    currentAverage: number;
    minGasPrice: number;
    maxGasPrice: number;
  } {
    const chainHistory = this.history.get(chainId) || [];

    if (chainHistory.length === 0) {
      return {
        totalEntries: 0,
        timeRange: { start: 0, end: 0, days: 0 },
        currentAverage: 0,
        minGasPrice: 0,
        maxGasPrice: 0,
      };
    }

    const sorted = [...chainHistory].sort((a, b) => a.timestamp - b.timestamp);
    const start = sorted[0].timestamp;
    const end = sorted[sorted.length - 1].timestamp;
    const days = (end - start) / (24 * 60 * 60 * 1000);

    const recent = sorted.slice(-10);
    const currentAverage = recent.reduce((sum, h) => sum + h.standard, 0) / recent.length;

    const allPrices = chainHistory.map(h => h.standard);
    const minGasPrice = Math.min(...allPrices);
    const maxGasPrice = Math.max(...allPrices);

    return {
      totalEntries: chainHistory.length,
      timeRange: {
        start,
        end,
        days: Math.round(days * 100) / 100,
      },
      currentAverage: Math.round(currentAverage * 100) / 100,
      minGasPrice: Math.round(minGasPrice * 100) / 100,
      maxGasPrice: Math.round(maxGasPrice * 100) / 100,
    };
  }
}

// Singleton instance
export const gasPricePredictor = new GasPricePredictor();
