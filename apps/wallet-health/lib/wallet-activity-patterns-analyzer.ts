/**
 * Wallet Activity Patterns Analyzer Utility
 * Analyze wallet activity patterns
 */

export interface ActivityPattern {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  timestamp: number;
  transactionCount: number;
  totalValue: number; // USD
  uniqueContracts: number;
  uniqueTokens: number;
  averageGasPrice: number;
}

export interface PatternAnalysis {
  walletAddress: string;
  patterns: ActivityPattern[];
  insights: {
    peakHours: number[]; // Hours of day (0-23)
    peakDays: number[]; // Days of week (0-6)
    averageDailyTransactions: number;
    averageDailyValue: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    volatility: number; // Standard deviation
  };
  anomalies: Array<{
    timestamp: number;
    type: 'spike' | 'drop' | 'unusual';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export class WalletActivityPatternsAnalyzer {
  private patterns: Map<string, ActivityPattern[]> = new Map();

  /**
   * Add activity pattern
   */
  addPattern(walletAddress: string, pattern: ActivityPattern): void {
    const key = walletAddress.toLowerCase();
    if (!this.patterns.has(key)) {
      this.patterns.set(key, []);
    }

    this.patterns.get(key)!.push(pattern);

    // Keep only last 1000 patterns per wallet
    const walletPatterns = this.patterns.get(key)!;
    if (walletPatterns.length > 1000) {
      walletPatterns.splice(0, walletPatterns.length - 1000);
    }
  }

  /**
   * Analyze patterns
   */
  analyzePatterns(walletAddress: string, days = 30): PatternAnalysis | null {
    const key = walletAddress.toLowerCase();
    const walletPatterns = this.patterns.get(key) || [];
    
    if (walletPatterns.length === 0) {
      return null;
    }

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const recentPatterns = walletPatterns.filter(p => p.timestamp >= cutoff);

    if (recentPatterns.length === 0) {
      return null;
    }

    // Analyze peak hours
    const hourCounts = new Map<number, number>();
    recentPatterns.forEach(p => {
      const hour = new Date(p.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + p.transactionCount);
    });
    const peakHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);

    // Analyze peak days
    const dayCounts = new Map<number, number>();
    recentPatterns.forEach(p => {
      const day = new Date(p.timestamp).getDay();
      dayCounts.set(day, (dayCounts.get(day) || 0) + p.transactionCount);
    });
    const peakDays = Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    // Calculate averages
    const totalTransactions = recentPatterns.reduce((sum, p) => sum + p.transactionCount, 0);
    const totalValue = recentPatterns.reduce((sum, p) => sum + p.totalValue, 0);
    const averageDailyTransactions = totalTransactions / days;
    const averageDailyValue = totalValue / days;

    // Determine trend
    const firstHalf = recentPatterns.slice(0, Math.floor(recentPatterns.length / 2));
    const secondHalf = recentPatterns.slice(Math.floor(recentPatterns.length / 2));
    const firstAvg = firstHalf.reduce((sum, p) => sum + p.transactionCount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.transactionCount, 0) / secondHalf.length;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    if (changePercent > 10) {
      trend = 'increasing';
    } else if (changePercent < -10) {
      trend = 'decreasing';
    }

    // Calculate volatility
    const transactionCounts = recentPatterns.map(p => p.transactionCount);
    const avg = transactionCounts.reduce((sum, c) => sum + c, 0) / transactionCounts.length;
    const variance = transactionCounts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / transactionCounts.length;
    const volatility = Math.sqrt(variance);

    // Detect anomalies
    const anomalies: PatternAnalysis['anomalies'] = [];
    const mean = avg;
    const stdDev = volatility;

    recentPatterns.forEach(pattern => {
      const zScore = (pattern.transactionCount - mean) / (stdDev || 1);
      
      if (Math.abs(zScore) > 2) {
        const type = zScore > 2 ? 'spike' : 'drop';
        const severity = Math.abs(zScore) > 3 ? 'high' : Math.abs(zScore) > 2.5 ? 'medium' : 'low';
        
        anomalies.push({
          timestamp: pattern.timestamp,
          type,
          description: `${type === 'spike' ? 'Unusual spike' : 'Unusual drop'} in activity: ${pattern.transactionCount} transactions`,
          severity,
        });
      }
    });

    return {
      walletAddress,
      patterns: recentPatterns,
      insights: {
        peakHours,
        peakDays,
        averageDailyTransactions: Math.round(averageDailyTransactions * 100) / 100,
        averageDailyValue: Math.round(averageDailyValue * 100) / 100,
        trend,
        volatility: Math.round(volatility * 100) / 100,
      },
      anomalies: anomalies.sort((a, b) => b.timestamp - a.timestamp),
    };
  }

  /**
   * Predict next activity
   */
  predictNextActivity(walletAddress: string): {
    predictedTransactions: number;
    predictedValue: number;
    confidence: number; // 0-100
    nextPeakHour: number;
  } | null {
    const analysis = this.analyzePatterns(walletAddress);
    if (!analysis) {
      return null;
    }

    const recentPatterns = analysis.patterns.slice(-7); // Last 7 days
    if (recentPatterns.length === 0) {
      return null;
    }

    // Simple moving average prediction
    const avgTransactions = recentPatterns.reduce((sum, p) => sum + p.transactionCount, 0) / recentPatterns.length;
    const avgValue = recentPatterns.reduce((sum, p) => sum + p.totalValue, 0) / recentPatterns.length;

    // Confidence based on pattern consistency
    const variance = recentPatterns.reduce((sum, p) => {
      return sum + Math.pow(p.transactionCount - avgTransactions, 2);
    }, 0) / recentPatterns.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgTransactions > 0 ? stdDev / avgTransactions : 0;
    const confidence = Math.max(0, Math.min(100, 100 - coefficientOfVariation * 100));

    // Next peak hour (most active hour)
    const nextPeakHour = analysis.insights.peakHours[0] || 12;

    return {
      predictedTransactions: Math.round(avgTransactions * 100) / 100,
      predictedValue: Math.round(avgValue * 100) / 100,
      confidence: Math.round(confidence),
      nextPeakHour,
    };
  }

  /**
   * Get patterns for wallet
   */
  getPatterns(walletAddress: string, startTime?: number, endTime?: number): ActivityPattern[] {
    const key = walletAddress.toLowerCase();
    let patterns = this.patterns.get(key) || [];

    if (startTime) {
      patterns = patterns.filter(p => p.timestamp >= startTime);
    }

    if (endTime) {
      patterns = patterns.filter(p => p.timestamp <= endTime);
    }

    return patterns.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Clear patterns
   */
  clear(walletAddress?: string): void {
    if (walletAddress) {
      this.patterns.delete(walletAddress.toLowerCase());
    } else {
      this.patterns.clear();
    }
  }
}

// Singleton instance
export const walletActivityPatternsAnalyzer = new WalletActivityPatternsAnalyzer();

