/**
 * Wallet Health Trends
 * Tracks and analyzes wallet health score trends over time with predictions
 */

export interface HealthSnapshot {
  timestamp: number;
  score: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  factors: {
    approvals: number;
    riskyApprovals: number;
    spamTokens: number;
    unverifiedContracts: number;
    newContracts: number;
  };
  metadata?: Record<string, any>;
}

export interface HealthTrend {
  snapshots: HealthSnapshot[];
  trend: 'improving' | 'stable' | 'declining' | 'volatile';
  trendStrength: number; // -100 to 100
  averageScore: number;
  currentScore: number;
  predictedScore?: number;
  predictedDate?: number;
  volatility: number; // 0-100
  riskFactors: Array<{
    factor: string;
    impact: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  recommendations: string[];
}

export interface TrendAnalysisOptions {
  lookbackDays?: number;
  predictionDays?: number;
  minSnapshots?: number;
}

export class WalletHealthTrends {
  private snapshots: Map<string, HealthSnapshot[]> = new Map();

  /**
   * Add a health snapshot
   */
  addSnapshot(walletAddress: string, snapshot: HealthSnapshot): void {
    const key = walletAddress.toLowerCase();
    const existing = this.snapshots.get(key) || [];
    
    // Remove duplicate timestamps (update existing)
    const filtered = existing.filter((s) => s.timestamp !== snapshot.timestamp);
    filtered.push(snapshot);
    
    // Sort by timestamp
    filtered.sort((a, b) => a.timestamp - b.timestamp);
    
    this.snapshots.set(key, filtered);
  }

  /**
   * Get health trend analysis
   */
  getTrend(
    walletAddress: string,
    options?: TrendAnalysisOptions
  ): HealthTrend | null {
    const key = walletAddress.toLowerCase();
    const allSnapshots = this.snapshots.get(key) || [];
    
    if (allSnapshots.length === 0) return null;

    const lookbackDays = options?.lookbackDays || 30;
    const minSnapshots = options?.minSnapshots || 3;
    const cutoffTime = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;

    // Filter snapshots within lookback period
    let snapshots = allSnapshots.filter((s) => s.timestamp >= cutoffTime);

    if (snapshots.length < minSnapshots) {
      // Use all available snapshots if not enough in lookback period
      snapshots = allSnapshots.slice(-Math.max(minSnapshots, allSnapshots.length));
    }

    if (snapshots.length === 0) return null;

    // Calculate average score
    const averageScore =
      snapshots.reduce((sum, s) => sum + s.score, 0) / snapshots.length;

    // Current score (most recent)
    const currentScore = snapshots[snapshots.length - 1].score;

    // Calculate trend
    const trend = this.calculateTrend(snapshots);
    const trendStrength = this.calculateTrendStrength(snapshots);

    // Calculate volatility
    const volatility = this.calculateVolatility(snapshots);

    // Predict future score
    const prediction = this.predictScore(snapshots, options?.predictionDays || 7);

    // Analyze risk factors
    const riskFactors = this.analyzeRiskFactors(snapshots);

    // Generate recommendations
    const recommendations = this.generateRecommendations(trend, riskFactors, currentScore);

    return {
      snapshots,
      trend: trend.trend,
      trendStrength: trend.strength,
      averageScore: Math.round(averageScore * 100) / 100,
      currentScore,
      predictedScore: prediction.score,
      predictedDate: prediction.date,
      volatility: Math.round(volatility * 100) / 100,
      riskFactors,
      recommendations,
    };
  }

  /**
   * Calculate trend direction and strength
   */
  private calculateTrend(snapshots: HealthSnapshot[]): {
    trend: HealthTrend['trend'];
    strength: number;
  } {
    if (snapshots.length < 2) {
      return { trend: 'stable', strength: 0 };
    }

    // Use linear regression to determine trend
    const n = snapshots.length;
    const scores = snapshots.map((s) => s.score);
    const timestamps = snapshots.map((s) => s.timestamp);

    // Normalize timestamps
    const minTime = Math.min(...timestamps);
    const normalizedTimes = timestamps.map((t) => (t - minTime) / (1000 * 60 * 60 * 24)); // days

    // Calculate slope
    const sumX = normalizedTimes.reduce((sum, x) => sum + x, 0);
    const sumY = scores.reduce((sum, y) => sum + y, 0);
    const sumXY = normalizedTimes.reduce((sum, x, i) => sum + x * scores[i], 0);
    const sumX2 = normalizedTimes.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const strength = Math.abs(slope) * 10; // Scale to -100 to 100

    // Determine trend
    let trend: HealthTrend['trend'];
    if (Math.abs(slope) < 0.1) {
      // Check volatility
      const variance = this.calculateVariance(scores);
      trend = variance > 100 ? 'volatile' : 'stable';
    } else if (slope > 0) {
      trend = 'improving';
    } else {
      trend = 'declining';
    }

    return { trend, strength: Math.min(100, Math.max(-100, strength)) };
  }

  /**
   * Calculate trend strength
   */
  private calculateTrendStrength(snapshots: HealthSnapshot[]): number {
    if (snapshots.length < 2) return 0;

    const firstHalf = snapshots.slice(0, Math.floor(snapshots.length / 2));
    const secondHalf = snapshots.slice(Math.floor(snapshots.length / 2));

    const firstAvg = firstHalf.reduce((sum, s) => sum + s.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.score, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;
    const percentChange = (change / Math.max(firstAvg, 1)) * 100;

    return Math.min(100, Math.max(-100, percentChange));
  }

  /**
   * Calculate volatility
   */
  private calculateVolatility(snapshots: HealthSnapshot[]): number {
    if (snapshots.length < 2) return 0;

    const scores = snapshots.map((s) => s.score);
    const variance = this.calculateVariance(scores);
    const stdDev = Math.sqrt(variance);
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    // Coefficient of variation
    const cv = (stdDev / Math.max(mean, 1)) * 100;
    return Math.min(100, cv);
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  /**
   * Predict future score using linear regression
   */
  private predictScore(
    snapshots: HealthSnapshot[],
    daysAhead: number
  ): { score: number; date: number } | { score?: undefined; date?: undefined } {
    if (snapshots.length < 3) {
      return {};
    }

    const scores = snapshots.map((s) => s.score);
    const timestamps = snapshots.map((s) => s.timestamp);

    // Normalize timestamps
    const minTime = Math.min(...timestamps);
    const normalizedTimes = timestamps.map((t) => (t - minTime) / (1000 * 60 * 60 * 24));

    // Linear regression
    const n = snapshots.length;
    const sumX = normalizedTimes.reduce((sum, x) => sum + x, 0);
    const sumY = scores.reduce((sum, y) => sum + y, 0);
    const sumXY = normalizedTimes.reduce((sum, x, i) => sum + x * scores[i], 0);
    const sumX2 = normalizedTimes.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict
    const lastTime = normalizedTimes[normalizedTimes.length - 1];
    const predictedTime = lastTime + daysAhead;
    const predictedScore = slope * predictedTime + intercept;

    const predictedDate = Date.now() + daysAhead * 24 * 60 * 60 * 1000;

    return {
      score: Math.max(0, Math.min(100, Math.round(predictedScore * 100) / 100)),
      date: predictedDate,
    };
  }

  /**
   * Analyze risk factors trends
   */
  private analyzeRiskFactors(snapshots: HealthSnapshot[]): HealthTrend['riskFactors'] {
    if (snapshots.length < 2) return [];

    const factors: HealthTrend['riskFactors'] = [];
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];

    // Analyze each factor
    const factorKeys: Array<keyof HealthSnapshot['factors']> = [
      'approvals',
      'riskyApprovals',
      'spamTokens',
      'unverifiedContracts',
      'newContracts',
    ];

    factorKeys.forEach((key) => {
      const firstValue = first.factors[key];
      const lastValue = last.factors[key];
      const change = lastValue - firstValue;
      const percentChange = firstValue > 0 ? (change / firstValue) * 100 : change * 10;

      let trend: 'increasing' | 'decreasing' | 'stable';
      if (Math.abs(percentChange) < 5) {
        trend = 'stable';
      } else if (change > 0) {
        trend = 'increasing';
      } else {
        trend = 'decreasing';
      }

      const impact = Math.abs(percentChange) * (key === 'riskyApprovals' ? 2 : 1);

      factors.push({
        factor: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
        impact: Math.round(impact * 100) / 100,
        trend,
      });
    });

    // Sort by impact
    return factors.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Generate recommendations based on trends
   */
  private generateRecommendations(
    trend: { trend: HealthTrend['trend']; strength: number },
    riskFactors: HealthTrend['riskFactors'],
    currentScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (trend.trend === 'declining') {
      recommendations.push('Wallet health is declining - review recent approvals and transactions');
      if (trend.strength < -20) {
        recommendations.push('Rapid decline detected - immediate action recommended');
      }
    } else if (trend.trend === 'improving') {
      recommendations.push('Wallet health is improving - continue current security practices');
    } else if (trend.trend === 'volatile') {
      recommendations.push('Wallet health is volatile - monitor closely for unusual activity');
    }

    // Factor-specific recommendations
    const increasingRisks = riskFactors.filter((f) => f.trend === 'increasing' && f.impact > 10);
    if (increasingRisks.length > 0) {
      increasingRisks.forEach((risk) => {
        if (risk.factor.includes('Risky Approvals')) {
          recommendations.push('Review and revoke risky token approvals');
        } else if (risk.factor.includes('Spam Tokens')) {
          recommendations.push('Remove spam tokens from wallet');
        } else if (risk.factor.includes('Unverified Contracts')) {
          recommendations.push('Avoid interacting with unverified contracts');
        }
      });
    }

    if (currentScore < 50) {
      recommendations.push('Wallet health score is low - comprehensive security review recommended');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring wallet health');
    }

    return recommendations;
  }

  /**
   * Get all snapshots for a wallet
   */
  getSnapshots(walletAddress: string): HealthSnapshot[] {
    return this.snapshots.get(walletAddress.toLowerCase()) || [];
  }

  /**
   * Clear old snapshots (older than specified days)
   */
  clearOldSnapshots(daysToKeep: number = 365): number {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    let cleared = 0;

    this.snapshots.forEach((snapshots, key) => {
      const filtered = snapshots.filter((s) => s.timestamp >= cutoffTime);
      if (filtered.length !== snapshots.length) {
        this.snapshots.set(key, filtered);
        cleared += snapshots.length - filtered.length;
      }
    });

    return cleared;
  }

  /**
   * Export trend data
   */
  exportTrendData(walletAddress: string): {
    trend: HealthTrend | null;
    snapshots: HealthSnapshot[];
  } {
    return {
      trend: this.getTrend(walletAddress),
      snapshots: this.getSnapshots(walletAddress),
    };
  }
}

// Singleton instance
export const walletHealthTrends = new WalletHealthTrends();

