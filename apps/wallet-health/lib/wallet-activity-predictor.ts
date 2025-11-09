/**
 * Wallet Activity Predictor
 * Predicts future wallet activity patterns using historical data and ML techniques
 */

export interface ActivityPrediction {
  predictedTransactions: number;
  predictedValue: number; // in ETH
  confidence: number; // 0-100
  timeHorizon: number; // days
  predictions: Array<{
    date: number;
    expectedTransactions: number;
    expectedValue: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  patterns: {
    peakDays: string[];
    peakHours: number[];
    averageTransactionValue: number;
    averageFrequency: number; // transactions per day
  };
  recommendations: string[];
}

export interface ActivityHistory {
  timestamp: number;
  transactionCount: number;
  totalValue: number;
  uniqueRecipients: number;
  uniqueContracts: number;
  chains: number[];
}

export class WalletActivityPredictor {
  private history: Map<string, ActivityHistory[]> = new Map();

  /**
   * Add activity history
   */
  addHistory(walletAddress: string, history: ActivityHistory): void {
    const key = walletAddress.toLowerCase();
    const existing = this.history.get(key) || [];
    existing.push(history);
    existing.sort((a, b) => a.timestamp - b.timestamp);
    this.history.set(key, existing);
  }

  /**
   * Predict future activity
   */
  predictActivity(
    walletAddress: string,
    timeHorizonDays: number = 7
  ): ActivityPrediction | null {
    const key = walletAddress.toLowerCase();
    const history = this.history.get(key) || [];

    if (history.length < 7) {
      // Need at least 7 days of history
      return null;
    }

    // Calculate patterns
    const patterns = this.calculatePatterns(history);

    // Predict using moving average and trend analysis
    const predictions = this.generatePredictions(history, timeHorizonDays, patterns);

    // Calculate totals
    const predictedTransactions = predictions.reduce(
      (sum, p) => sum + p.expectedTransactions,
      0
    );
    const predictedValue = predictions.reduce((sum, p) => sum + p.expectedValue, 0);

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(history, patterns);

    // Generate recommendations
    const recommendations = this.generateRecommendations(predictions, patterns);

    return {
      predictedTransactions,
      predictedValue,
      confidence,
      timeHorizon: timeHorizonDays,
      predictions,
      patterns,
      recommendations,
    };
  }

  /**
   * Calculate activity patterns
   */
  private calculatePatterns(history: ActivityHistory[]): ActivityPrediction['patterns'] {
    // Calculate average transaction value
    const totalValue = history.reduce((sum, h) => sum + h.totalValue, 0);
    const totalTransactions = history.reduce((sum, h) => sum + h.transactionCount, 0);
    const averageTransactionValue = totalTransactions > 0 ? totalValue / totalTransactions : 0;

    // Calculate average frequency
    const timeSpan = history[history.length - 1].timestamp - history[0].timestamp;
    const days = Math.max(timeSpan / (1000 * 60 * 60 * 24), 1);
    const averageFrequency = totalTransactions / days;

    // Find peak days
    const dayCounts: Record<string, number> = {};
    history.forEach((h) => {
      const day = new Date(h.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + h.transactionCount;
    });
    const peakDays = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    // Find peak hours
    const hourCounts: Record<number, number> = {};
    history.forEach((h) => {
      const hour = new Date(h.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + h.transactionCount;
    });
    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return {
      peakDays,
      peakHours,
      averageTransactionValue,
      averageFrequency,
    };
  }

  /**
   * Generate predictions
   */
  private generatePredictions(
    history: ActivityHistory[],
    timeHorizonDays: number,
    patterns: ActivityPrediction['patterns']
  ): ActivityPrediction['predictions'] {
    const predictions: ActivityPrediction['predictions'] = [];
    const now = Date.now();

    // Use moving average with trend
    const recentHistory = history.slice(-14); // Last 14 days
    const avgDailyTransactions =
      recentHistory.reduce((sum, h) => sum + h.transactionCount, 0) / recentHistory.length;
    const avgDailyValue = recentHistory.reduce((sum, h) => sum + h.totalValue, 0) / recentHistory.length;

    // Calculate trend
    const firstHalf = recentHistory.slice(0, Math.floor(recentHistory.length / 2));
    const secondHalf = recentHistory.slice(Math.floor(recentHistory.length / 2));
    const firstAvg = firstHalf.reduce((sum, h) => sum + h.transactionCount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, h) => sum + h.transactionCount, 0) / secondHalf.length;
    const trend = (secondAvg - firstAvg) / firstHalf.length; // transactions per day trend

    for (let day = 1; day <= timeHorizonDays; day++) {
      const date = now + day * 24 * 60 * 60 * 1000;
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

      // Adjust for day of week pattern
      const dayMultiplier = patterns.peakDays.includes(dayOfWeek) ? 1.2 : 0.9;

      // Apply trend
      const trendAdjusted = avgDailyTransactions + trend * day;

      // Predict transactions
      const expectedTransactions = Math.max(0, Math.round(trendAdjusted * dayMultiplier));

      // Predict value
      const expectedValue = expectedTransactions * patterns.averageTransactionValue;

      // Determine risk level
      const riskLevel = this.determineRiskLevel(expectedTransactions, expectedValue, patterns);

      predictions.push({
        date,
        expectedTransactions,
        expectedValue,
        riskLevel,
      });
    }

    return predictions;
  }

  /**
   * Determine risk level for a day
   */
  private determineRiskLevel(
    transactions: number,
    value: number,
    patterns: ActivityPrediction['patterns']
  ): 'low' | 'medium' | 'high' {
    const transactionRatio = transactions / Math.max(patterns.averageFrequency, 0.1);
    const valueRatio = value / Math.max(patterns.averageTransactionValue, 0.001);

    if (transactionRatio > 3 || valueRatio > 5) {
      return 'high';
    }
    if (transactionRatio > 1.5 || valueRatio > 2) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Calculate prediction confidence
   */
  private calculateConfidence(
    history: ActivityHistory[],
    patterns: ActivityPrediction['patterns']
  ): number {
    if (history.length < 7) return 0;

    let confidence = 50; // Base confidence

    // More history = higher confidence
    if (history.length >= 30) confidence += 20;
    else if (history.length >= 14) confidence += 10;

    // Consistency in patterns
    const transactionCounts = history.map((h) => h.transactionCount);
    const variance = this.calculateVariance(transactionCounts);
    const mean = transactionCounts.reduce((sum, c) => sum + c, 0) / transactionCounts.length;
    const coefficientOfVariation = Math.sqrt(variance) / Math.max(mean, 1);

    if (coefficientOfVariation < 0.5) confidence += 15; // Low variance = consistent
    else if (coefficientOfVariation < 1.0) confidence += 5;

    // Pattern strength
    if (patterns.peakDays.length > 0) confidence += 5;
    if (patterns.peakHours.length > 0) confidence += 5;

    return Math.min(100, confidence);
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    predictions: ActivityPrediction['predictions'],
    patterns: ActivityPrediction['patterns']
  ): string[] {
    const recommendations: string[] = [];

    const highRiskDays = predictions.filter((p) => p.riskLevel === 'high');
    if (highRiskDays.length > 0) {
      recommendations.push(
        `${highRiskDays.length} day(s) with predicted high activity - prepare accordingly`
      );
    }

    if (patterns.peakDays.length > 0) {
      recommendations.push(
        `Peak activity typically occurs on: ${patterns.peakDays.join(', ')}`
      );
    }

    if (patterns.peakHours.length > 0) {
      const hours = patterns.peakHours.map((h) => `${h}:00`).join(', ');
      recommendations.push(`Peak activity hours: ${hours}`);
    }

    const totalPredicted = predictions.reduce((sum, p) => sum + p.expectedTransactions, 0);
    if (totalPredicted > patterns.averageFrequency * predictions.length * 1.5) {
      recommendations.push('Predicted activity is above average - monitor closely');
    }

    if (recommendations.length === 0) {
      recommendations.push('Activity patterns appear stable');
    }

    return recommendations;
  }

  /**
   * Get activity history
   */
  getHistory(walletAddress: string): ActivityHistory[] {
    return this.history.get(walletAddress.toLowerCase()) || [];
  }

  /**
   * Clear old history
   */
  clearOldHistory(daysToKeep: number = 90): number {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    let cleared = 0;

    this.history.forEach((history, key) => {
      const filtered = history.filter((h) => h.timestamp >= cutoffTime);
      if (filtered.length !== history.length) {
        this.history.set(key, filtered);
        cleared += history.length - filtered.length;
      }
    });

    return cleared;
  }
}

// Singleton instance
export const walletActivityPredictor = new WalletActivityPredictor();

