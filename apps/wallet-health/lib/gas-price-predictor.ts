/**
 * Gas Price Predictor
 * Predicts optimal gas prices based on historical patterns
 */

export interface GasPricePrediction {
  chainId: number;
  currentPrice: number; // gwei
  predictions: {
    low: number;
    standard: number;
    fast: number;
    instant: number;
  };
  confidence: 'high' | 'medium' | 'low';
  recommendedPrice: number;
  recommendedWaitTime: string;
  historicalAverage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
}

export interface GasPriceHistory {
  timestamp: number;
  low: number;
  standard: number;
  fast: number;
  instant: number;
}

export class GasPricePredictor {
  private history: Map<number, GasPriceHistory[]> = new Map(); // chainId -> history

  /**
   * Add gas price data point
   */
  addDataPoint(
    chainId: number,
    prices: { low: number; standard: number; fast: number; instant: number }
  ): void {
    if (!this.history.has(chainId)) {
      this.history.set(chainId, []);
    }

    this.history.get(chainId)!.push({
      timestamp: Date.now(),
      ...prices,
    });

    // Keep last 1000 data points per chain
    const history = this.history.get(chainId)!;
    if (history.length > 1000) {
      history.shift();
    }
  }

  /**
   * Predict gas prices
   */
  predict(
    chainId: number,
    urgency: 'low' | 'medium' | 'high' = 'medium',
    timeHorizon: '1h' | '6h' | '24h' = '1h'
  ): GasPricePrediction | null {
    const history = this.history.get(chainId);
    if (!history || history.length < 10) {
      return null; // Not enough data
    }

    // Get recent history (last 24 hours)
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000;
    const recent = history.filter(h => h.timestamp >= cutoff);

    if (recent.length < 5) {
      return null; // Not enough recent data
    }

    // Calculate current averages
    const currentLow = recent[recent.length - 1].low;
    const currentStandard = recent[recent.length - 1].standard;
    const currentFast = recent[recent.length - 1].fast;
    const currentInstant = recent[recent.length - 1].instant;

    // Calculate historical averages
    const avgLow = recent.reduce((sum, h) => sum + h.low, 0) / recent.length;
    const avgStandard = recent.reduce((sum, h) => sum + h.standard, 0) / recent.length;
    const avgFast = recent.reduce((sum, h) => sum + h.fast, 0) / recent.length;
    const avgInstant = recent.reduce((sum, h) => sum + h.instant, 0) / recent.length;

    // Simple trend detection
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));

    const firstAvg = firstHalf.reduce((sum, h) => sum + h.standard, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, h) => sum + h.standard, 0) / secondHalf.length;

    let trend: 'increasing' | 'decreasing' | 'stable';
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) trend = 'increasing';
    else if (change < -10) trend = 'decreasing';
    else trend = 'stable';

    // Predict future prices (simple linear projection)
    const trendFactor = change / 100;
    const timeMultiplier = timeHorizon === '1h' ? 1 : timeHorizon === '6h' ? 6 : 24;

    const predictions = {
      low: Math.max(0, currentLow * (1 + trendFactor * timeMultiplier * 0.1)),
      standard: Math.max(0, currentStandard * (1 + trendFactor * timeMultiplier * 0.1)),
      fast: Math.max(0, currentFast * (1 + trendFactor * timeMultiplier * 0.1)),
      instant: Math.max(0, currentInstant * (1 + trendFactor * timeMultiplier * 0.1)),
    };

    // Determine confidence
    const variance = recent.reduce((sum, h) => {
      const diff = h.standard - avgStandard;
      return sum + diff * diff;
    }, 0) / recent.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgStandard > 0 ? stdDev / avgStandard : 0;

    let confidence: 'high' | 'medium' | 'low';
    if (coefficientOfVariation < 0.1) confidence = 'high';
    else if (coefficientOfVariation < 0.3) confidence = 'medium';
    else confidence = 'low';

    // Recommend price based on urgency
    let recommendedPrice: number;
    let recommendedWaitTime: string;

    if (urgency === 'low') {
      recommendedPrice = predictions.low;
      recommendedWaitTime = 'Wait 5-15 minutes for lower prices';
    } else if (urgency === 'high') {
      recommendedPrice = predictions.fast;
      recommendedWaitTime = 'Use fast gas for immediate confirmation';
    } else {
      recommendedPrice = predictions.standard;
      recommendedWaitTime = 'Standard gas should confirm in 1-3 minutes';
    }

    // Generate factors
    const factors: string[] = [];
    if (trend === 'increasing') {
      factors.push('Gas prices are trending upward - consider waiting');
    } else if (trend === 'decreasing') {
      factors.push('Gas prices are trending downward - good time to transact');
    }
    if (currentStandard < avgStandard * 0.8) {
      factors.push('Current prices are below 24h average');
    } else if (currentStandard > avgStandard * 1.2) {
      factors.push('Current prices are above 24h average - consider waiting');
    }

    return {
      chainId,
      currentPrice: currentStandard,
      predictions: {
        low: Math.round(predictions.low * 100) / 100,
        standard: Math.round(predictions.standard * 100) / 100,
        fast: Math.round(predictions.fast * 100) / 100,
        instant: Math.round(predictions.instant * 100) / 100,
      },
      confidence,
      recommendedPrice: Math.round(recommendedPrice * 100) / 100,
      recommendedWaitTime,
      historicalAverage: Math.round(avgStandard * 100) / 100,
      trend,
      factors,
    };
  }

  /**
   * Get optimal gas price recommendation
   */
  getOptimalPrice(
    chainId: number,
    urgency: 'low' | 'medium' | 'high',
    maxWaitMinutes: number = 15
  ): {
    recommendedPrice: number;
    estimatedWait: string;
    savings: number;
    savingsPercentage: number;
  } | null {
    const prediction = this.predict(chainId, urgency, '1h');
    if (!prediction) return null;

    const current = prediction.currentPrice;
    let recommendedPrice: number;
    let estimatedWait: string;

    if (urgency === 'low' && maxWaitMinutes >= 10) {
      recommendedPrice = prediction.predictions.low;
      estimatedWait = '10-15 minutes';
    } else if (urgency === 'medium') {
      recommendedPrice = prediction.predictions.standard;
      estimatedWait = '1-3 minutes';
    } else {
      recommendedPrice = prediction.predictions.fast;
      estimatedWait = '30-60 seconds';
    }

    const savings = current - recommendedPrice;
    const savingsPercentage = current > 0 ? (savings / current) * 100 : 0;

    return {
      recommendedPrice: Math.round(recommendedPrice * 100) / 100,
      estimatedWait,
      savings: Math.round(savings * 100) / 100,
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
    };
  }

  /**
   * Get gas price history
   */
  getHistory(chainId: number, limit?: number): GasPriceHistory[] {
    const history = this.history.get(chainId) || [];
    return limit ? history.slice(-limit) : history;
  }
}

// Singleton instance
export const gasPricePredictor = new GasPricePredictor();
