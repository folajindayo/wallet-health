/**
 * Gas Price Predictor Utility
 * Predicts future gas prices based on historical data
 */

export interface GasPriceDataPoint {
  timestamp: number;
  slow: number; // gwei
  standard: number; // gwei
  fast: number; // gwei
  baseFee?: number; // gwei
  blockNumber: number;
}

export interface GasPricePrediction {
  timeframe: '1h' | '6h' | '24h' | '7d';
  predictedSlow: number;
  predictedStandard: number;
  predictedFast: number;
  confidence: number; // 0-100
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
}

export interface GasPriceForecast {
  current: GasPriceDataPoint;
  predictions: GasPricePrediction[];
  recommendations: string[];
  optimalTime?: {
    timeframe: string;
    estimatedPrice: number;
    reason: string;
  };
}

export class GasPricePredictor {
  private historicalData: GasPriceDataPoint[] = [];
  private readonly MAX_DATA_POINTS = 1000;

  /**
   * Add historical data point
   */
  addDataPoint(data: GasPriceDataPoint): void {
    this.historicalData.push(data);
    
    // Keep sorted by timestamp
    this.historicalData.sort((a, b) => a.timestamp - b.timestamp);
    
    // Keep only last N data points
    if (this.historicalData.length > this.MAX_DATA_POINTS) {
      this.historicalData = this.historicalData.slice(-this.MAX_DATA_POINTS);
    }
  }

  /**
   * Add multiple data points
   */
  addDataPoints(dataPoints: GasPriceDataPoint[]): void {
    dataPoints.forEach(point => this.addDataPoint(point));
  }

  /**
   * Predict gas price for a timeframe
   */
  predict(timeframe: GasPricePrediction['timeframe']): GasPricePrediction | null {
    if (this.historicalData.length < 2) {
      return null;
    }

    // Calculate timeframe in milliseconds
    const timeframeMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    }[timeframe];

    // Get recent data within timeframe
    const now = Date.now();
    const cutoff = now - timeframeMs;
    const recentData = this.historicalData.filter(d => d.timestamp >= cutoff);

    if (recentData.length < 2) {
      return null;
    }

    // Calculate moving average
    const avgSlow = recentData.reduce((sum, d) => sum + d.slow, 0) / recentData.length;
    const avgStandard = recentData.reduce((sum, d) => sum + d.standard, 0) / recentData.length;
    const avgFast = recentData.reduce((sum, d) => sum + d.fast, 0) / recentData.length;

    // Calculate trend
    const firstHalf = recentData.slice(0, Math.floor(recentData.length / 2));
    const secondHalf = recentData.slice(Math.floor(recentData.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.standard, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.standard, 0) / secondHalf.length;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (secondAvg > firstAvg * 1.1) {
      trend = 'increasing';
    } else if (secondAvg < firstAvg * 0.9) {
      trend = 'decreasing';
    }

    // Calculate confidence based on data points and variance
    const variance = this.calculateVariance(recentData.map(d => d.standard));
    const confidence = Math.max(0, Math.min(100, 100 - variance / 10));

    // Predict prices (simple linear extrapolation)
    const trendFactor = trend === 'increasing' ? 1.05 : trend === 'decreasing' ? 0.95 : 1.0;
    const predictedSlow = Math.round(avgSlow * trendFactor);
    const predictedStandard = Math.round(avgStandard * trendFactor);
    const predictedFast = Math.round(avgFast * trendFactor);

    // Analyze factors
    const factors = this.analyzeFactors(recentData, trend);

    return {
      timeframe,
      predictedSlow,
      predictedStandard,
      predictedFast,
      confidence: Math.round(confidence),
      trend,
      factors,
    };
  }

  /**
   * Generate forecast
   */
  generateForecast(): GasPriceForecast | null {
    if (this.historicalData.length === 0) {
      return null;
    }

    const current = this.historicalData[this.historicalData.length - 1];

    // Generate predictions for different timeframes
    const predictions: GasPricePrediction[] = [];
    const timeframes: GasPricePrediction['timeframe'][] = ['1h', '6h', '24h', '7d'];

    timeframes.forEach(timeframe => {
      const prediction = this.predict(timeframe);
      if (prediction) {
        predictions.push(prediction);
      }
    });

    // Generate recommendations
    const recommendations: string[] = [];
    
    const shortTermPrediction = predictions.find(p => p.timeframe === '1h');
    if (shortTermPrediction) {
      if (shortTermPrediction.trend === 'increasing') {
        recommendations.push('Gas prices are increasing. Consider executing transactions soon.');
      } else if (shortTermPrediction.trend === 'decreasing') {
        recommendations.push('Gas prices are decreasing. You may want to wait for lower prices.');
      }
    }

    // Find optimal time
    const optimalTime = this.findOptimalTime(predictions);

    return {
      current,
      predictions,
      recommendations,
      optimalTime,
    };
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return variance;
  }

  /**
   * Analyze factors affecting gas prices
   */
  private analyzeFactors(
    data: GasPriceDataPoint[],
    trend: 'increasing' | 'decreasing' | 'stable'
  ): GasPricePrediction['factors'] {
    const factors: GasPricePrediction['factors'] = [];

    // Network congestion
    const avgPrice = data.reduce((sum, d) => sum + d.standard, 0) / data.length;
    if (avgPrice > 50) {
      factors.push({
        factor: 'Network Congestion',
        impact: 'negative',
        description: 'High gas prices indicate network congestion',
      });
    } else if (avgPrice < 20) {
      factors.push({
        factor: 'Low Network Activity',
        impact: 'positive',
        description: 'Low gas prices indicate low network activity',
      });
    }

    // Trend factor
    if (trend === 'increasing') {
      factors.push({
        factor: 'Price Trend',
        impact: 'negative',
        description: 'Gas prices are trending upward',
      });
    } else if (trend === 'decreasing') {
      factors.push({
        factor: 'Price Trend',
        impact: 'positive',
        description: 'Gas prices are trending downward',
      });
    }

    // Volatility
    const prices = data.map(d => d.standard);
    const variance = this.calculateVariance(prices);
    if (variance > 100) {
      factors.push({
        factor: 'High Volatility',
        impact: 'neutral',
        description: 'Gas prices are highly volatile',
      });
    }

    return factors;
  }

  /**
   * Find optimal time to execute transaction
   */
  private findOptimalTime(
    predictions: GasPricePrediction[]
  ): GasPriceForecast['optimalTime'] {
    if (predictions.length === 0) {
      return undefined;
    }

    // Find prediction with lowest price
    const lowestPrediction = predictions.reduce((lowest, current) => {
      return current.predictedStandard < lowest.predictedStandard ? current : lowest;
    });

    return {
      timeframe: lowestPrediction.timeframe,
      estimatedPrice: lowestPrediction.predictedStandard,
      reason: `Lowest predicted price in ${lowestPrediction.timeframe}`,
    };
  }

  /**
   * Get historical data
   */
  getHistoricalData(limit?: number): GasPriceDataPoint[] {
    if (limit) {
      return this.historicalData.slice(-limit);
    }
    return [...this.historicalData];
  }

  /**
   * Clear historical data
   */
  clear(): void {
    this.historicalData = [];
  }
}

// Singleton instance
export const gasPricePredictor = new GasPricePredictor();

