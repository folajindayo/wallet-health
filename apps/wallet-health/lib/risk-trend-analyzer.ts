/**
 * Risk Trend Analyzer Utility
 * Analyzes risk score trends over time
 */

export interface RiskSnapshot {
  timestamp: number;
  score: number;
  riskLevel: 'safe' | 'moderate' | 'critical';
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  impact: number; // -100 to +100
  severity: 'low' | 'medium' | 'high';
}

export interface RiskTrend {
  currentScore: number;
  previousScore: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  velocity: number; // Rate of change per day
  factors: {
    improving: RiskFactor[];
    deteriorating: RiskFactor[];
    new: RiskFactor[];
    resolved: RiskFactor[];
  };
  prediction?: {
    nextScore: number;
    confidence: number; // 0-100
    timeframe: number; // days
  };
}

export interface RiskHistory {
  snapshots: RiskSnapshot[];
  averageScore: number;
  minScore: number;
  maxScore: number;
  volatility: number;
  periods: {
    last24h: RiskSnapshot[];
    last7d: RiskSnapshot[];
    last30d: RiskSnapshot[];
  };
}

export class RiskTrendAnalyzer {
  private snapshots: RiskSnapshot[] = [];

  /**
   * Add a risk snapshot
   */
  addSnapshot(snapshot: RiskSnapshot): void {
    this.snapshots.push(snapshot);
    
    // Keep sorted by timestamp
    this.snapshots.sort((a, b) => a.timestamp - b.timestamp);
    
    // Keep only last 1000 snapshots
    if (this.snapshots.length > 1000) {
      this.snapshots = this.snapshots.slice(-1000);
    }
  }

  /**
   * Analyze risk trend
   */
  analyzeTrend(): RiskTrend | null {
    if (this.snapshots.length < 2) {
      return null;
    }

    const current = this.snapshots[this.snapshots.length - 1];
    const previous = this.snapshots[this.snapshots.length - 2];

    const change = current.score - previous.score;
    const changePercent = previous.score > 0 ? (change / previous.score) * 100 : 0;

    // Determine trend
    let trend: 'improving' | 'stable' | 'deteriorating';
    if (change > 5) {
      trend = 'improving';
    } else if (change < -5) {
      trend = 'deteriorating';
    } else {
      trend = 'stable';
    }

    // Calculate velocity (change per day)
    const timeDiff = current.timestamp - previous.timestamp;
    const daysDiff = timeDiff / (24 * 60 * 60 * 1000);
    const velocity = daysDiff > 0 ? change / daysDiff : 0;

    // Analyze factor changes
    const factors = this.analyzeFactorChanges(previous, current);

    // Predict future score
    const prediction = this.predictFutureScore();

    return {
      currentScore: current.score,
      previousScore: previous.score,
      change,
      changePercent,
      trend,
      velocity,
      factors,
      prediction,
    };
  }

  /**
   * Analyze factor changes
   */
  private analyzeFactorChanges(
    previous: RiskSnapshot,
    current: RiskSnapshot
  ): RiskTrend['factors'] {
    const previousFactors = new Map(previous.factors.map(f => [f.name, f]));
    const currentFactors = new Map(current.factors.map(f => [f.name, f]));

    const improving: RiskFactor[] = [];
    const deteriorating: RiskFactor[] = [];
    const newFactors: RiskFactor[] = [];
    const resolved: RiskFactor[] = [];

    // Check for improved factors
    currentFactors.forEach((currentFactor, name) => {
      const prevFactor = previousFactors.get(name);
      if (prevFactor) {
        if (currentFactor.impact > prevFactor.impact) {
          improving.push(currentFactor);
        } else if (currentFactor.impact < prevFactor.impact) {
          deteriorating.push(currentFactor);
        }
      } else {
        newFactors.push(currentFactor);
      }
    });

    // Check for resolved factors
    previousFactors.forEach((prevFactor, name) => {
      if (!currentFactors.has(name)) {
        resolved.push(prevFactor);
      }
    });

    return {
      improving,
      deteriorating,
      new: newFactors,
      resolved,
    };
  }

  /**
   * Predict future risk score
   */
  private predictFutureScore(): RiskTrend['prediction'] | undefined {
    if (this.snapshots.length < 3) {
      return undefined;
    }

    // Use linear regression for prediction
    const recent = this.snapshots.slice(-10);
    const scores = recent.map(s => s.score);
    const timestamps = recent.map(s => s.timestamp);

    // Calculate linear regression
    const n = scores.length;
    const sumX = timestamps.reduce((sum, t) => sum + t, 0);
    const sumY = scores.reduce((sum, s) => sum + s, 0);
    const sumXY = timestamps.reduce((sum, t, i) => sum + t * scores[i], 0);
    const sumXX = timestamps.reduce((sum, t) => sum + t * t, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict score in 7 days
    const futureTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const predictedScore = slope * futureTimestamp + intercept;

    // Clamp to 0-100
    const clampedScore = Math.max(0, Math.min(100, Math.round(predictedScore)));

    // Calculate confidence based on R-squared
    const meanY = sumY / n;
    const ssRes = scores.reduce((sum, s, i) => {
      const predicted = slope * timestamps[i] + intercept;
      return sum + Math.pow(s - predicted, 2);
    }, 0);
    const ssTot = scores.reduce((sum, s) => sum + Math.pow(s - meanY, 2), 0);
    const rSquared = 1 - ssRes / ssTot;
    const confidence = Math.max(0, Math.min(100, Math.round(rSquared * 100)));

    return {
      nextScore: clampedScore,
      confidence,
      timeframe: 7,
    };
  }

  /**
   * Get risk history
   */
  getHistory(): RiskHistory {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    const last7d = now - 7 * 24 * 60 * 60 * 1000;
    const last30d = now - 30 * 24 * 60 * 60 * 1000;

    const scores = this.snapshots.map(s => s.score);
    const averageScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Calculate volatility (standard deviation)
    const variance = scores.length > 0
      ? scores.reduce((sum, s) => sum + Math.pow(s - averageScore, 2), 0) / scores.length
      : 0;
    const volatility = Math.sqrt(variance);

    return {
      snapshots: [...this.snapshots],
      averageScore: Math.round(averageScore * 100) / 100,
      minScore,
      maxScore,
      volatility: Math.round(volatility * 100) / 100,
      periods: {
        last24h: this.snapshots.filter(s => s.timestamp >= last24h),
        last7d: this.snapshots.filter(s => s.timestamp >= last7d),
        last30d: this.snapshots.filter(s => s.timestamp >= last30d),
      },
    };
  }

  /**
   * Get risk score over time
   */
  getScoreOverTime(startTime?: number, endTime?: number): Array<{ timestamp: number; score: number }> {
    let filtered = this.snapshots;

    if (startTime) {
      filtered = filtered.filter(s => s.timestamp >= startTime);
    }
    if (endTime) {
      filtered = filtered.filter(s => s.timestamp <= endTime);
    }

    return filtered.map(s => ({
      timestamp: s.timestamp,
      score: s.score,
    }));
  }

  /**
   * Clear all snapshots
   */
  clear(): void {
    this.snapshots = [];
  }
}

// Singleton instance
export const riskTrendAnalyzer = new RiskTrendAnalyzer();

