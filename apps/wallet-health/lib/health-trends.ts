/**
 * Wallet Health Trends Tracker
 * Tracks wallet health score over time and identifies trends
 */

export interface HealthSnapshot {
  timestamp: number;
  score: number;
  riskLevel: 'safe' | 'moderate' | 'critical';
  factors: {
    activeApprovalsCount: number;
    unverifiedContractsCount: number;
    newContractsCount: number;
    spamTokensCount: number;
  };
  metadata?: Record<string, any>;
}

export interface HealthTrend {
  period: '7d' | '30d' | '90d' | '1y' | 'all';
  snapshots: HealthSnapshot[];
  trend: 'improving' | 'declining' | 'stable';
  trendPercentage: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  volatility: number;
  predictions?: {
    nextWeek?: number;
    nextMonth?: number;
  };
}

export interface TrendAnalysis {
  current: HealthSnapshot;
  trends: HealthTrend[];
  insights: string[];
  recommendations: string[];
  alerts: Array<{
    type: 'rapid_decline' | 'improvement' | 'volatility' | 'critical_threshold';
    message: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

export class HealthTrendsTracker {
  private snapshots: Map<string, HealthSnapshot[]> = new Map(); // wallet -> snapshots

  /**
   * Record a health snapshot
   */
  recordSnapshot(walletAddress: string, snapshot: HealthSnapshot): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.snapshots.has(walletKey)) {
      this.snapshots.set(walletKey, []);
    }

    const snapshots = this.snapshots.get(walletKey)!;
    snapshots.push(snapshot);

    // Keep only last 1000 snapshots per wallet
    if (snapshots.length > 1000) {
      snapshots.shift();
    }

    // Sort by timestamp
    snapshots.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get health trends for a wallet
   */
  getTrends(
    walletAddress: string,
    periods: ('7d' | '30d' | '90d' | '1y' | 'all')[] = ['7d', '30d', '90d']
  ): TrendAnalysis {
    const walletKey = walletAddress.toLowerCase();
    const snapshots = this.snapshots.get(walletKey) || [];

    if (snapshots.length === 0) {
      throw new Error('No health snapshots found for this wallet');
    }

    const current = snapshots[snapshots.length - 1];
    const trends: HealthTrend[] = [];

    for (const period of periods) {
      const trend = this.calculateTrend(snapshots, period);
      trends.push(trend);
    }

    const insights = this.generateInsights(snapshots, trends);
    const recommendations = this.generateRecommendations(current, trends);
    const alerts = this.generateAlerts(snapshots, trends);

    return {
      current,
      trends,
      insights,
      recommendations,
      alerts,
    };
  }

  /**
   * Calculate trend for a specific period
   */
  private calculateTrend(
    snapshots: HealthSnapshot[],
    period: '7d' | '30d' | '90d' | '1y' | 'all'
  ): HealthTrend {
    const now = Date.now();
    let cutoff: number;

    switch (period) {
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

    if (periodSnapshots.length === 0) {
      return {
        period,
        snapshots: [],
        trend: 'stable',
        trendPercentage: 0,
        averageScore: 0,
        minScore: 0,
        maxScore: 0,
        volatility: 0,
      };
    }

    // Calculate trend
    const firstScore = periodSnapshots[0].score;
    const lastScore = periodSnapshots[periodSnapshots.length - 1].score;
    const scoreDiff = lastScore - firstScore;
    const trendPercentage = firstScore > 0 ? (scoreDiff / firstScore) * 100 : 0;

    let trend: 'improving' | 'declining' | 'stable';
    if (trendPercentage > 5) {
      trend = 'improving';
    } else if (trendPercentage < -5) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    // Calculate statistics
    const scores = periodSnapshots.map(s => s.score);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    // Calculate volatility (standard deviation)
    const variance =
      scores.reduce((sum, s) => sum + Math.pow(s - averageScore, 2), 0) / scores.length;
    const volatility = Math.sqrt(variance);

    // Predictions (simple linear regression)
    const predictions = this.predictFutureScores(periodSnapshots);

    return {
      period,
      snapshots: periodSnapshots,
      trend,
      trendPercentage: Math.round(trendPercentage * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      minScore,
      maxScore,
      volatility: Math.round(volatility * 100) / 100,
      predictions,
    };
  }

  /**
   * Predict future scores using linear regression
   */
  private predictFutureScores(snapshots: HealthSnapshot[]): {
    nextWeek?: number;
    nextMonth?: number;
  } {
    if (snapshots.length < 2) {
      return {};
    }

    // Simple linear regression
    const n = snapshots.length;
    const sumX = snapshots.reduce((sum, s, i) => sum + i, 0);
    const sumY = snapshots.reduce((sum, s) => sum + s.score, 0);
    const sumXY = snapshots.reduce((sum, s, i) => sum + i * s.score, 0);
    const sumX2 = snapshots.reduce((sum, s, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextWeek = Math.max(0, Math.min(100, Math.round(slope * n + intercept)));
    const nextMonth = Math.max(
      0,
      Math.min(100, Math.round(slope * (n + 4) + intercept))
    );

    return { nextWeek, nextMonth };
  }

  /**
   * Generate insights from trends
   */
  private generateInsights(
    snapshots: HealthSnapshot[],
    trends: HealthTrend[]
  ): string[] {
    const insights: string[] = [];

    if (snapshots.length === 0) return insights;

    const recentTrend = trends.find(t => t.period === '7d');
    if (recentTrend) {
      if (recentTrend.trend === 'improving') {
        insights.push('Your wallet health has improved over the past week');
      } else if (recentTrend.trend === 'declining') {
        insights.push('Your wallet health has declined over the past week');
      }
    }

    const longTermTrend = trends.find(t => t.period === '90d');
    if (longTermTrend && longTermTrend.volatility > 10) {
      insights.push('High volatility detected - wallet health fluctuates significantly');
    }

    const current = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];
    if (previous) {
      const scoreChange = current.score - previous.score;
      if (Math.abs(scoreChange) > 10) {
        insights.push(
          `Significant change detected: ${scoreChange > 0 ? '+' : ''}${scoreChange} points`
        );
      }
    }

    return insights;
  }

  /**
   * Generate recommendations based on trends
   */
  private generateRecommendations(
    current: HealthSnapshot,
    trends: HealthTrend[]
  ): string[] {
    const recommendations: string[] = [];

    if (current.score < 50) {
      recommendations.push('Immediate action required - wallet health is critical');
    }

    const recentTrend = trends.find(t => t.period === '7d');
    if (recentTrend && recentTrend.trend === 'declining') {
      recommendations.push('Review recent approvals and revoke unused ones');
    }

    if (current.factors.unverifiedContractsCount > 0) {
      recommendations.push(
        `Revoke ${current.factors.unverifiedContractsCount} unverified contract approval(s)`
      );
    }

    if (current.factors.activeApprovalsCount > 10) {
      recommendations.push('Consider revoking unused token approvals');
    }

    return recommendations;
  }

  /**
   * Generate alerts based on trends
   */
  private generateAlerts(
    snapshots: HealthSnapshot[],
    trends: HealthTrend[]
  ): Array<{
    type: 'rapid_decline' | 'improvement' | 'volatility' | 'critical_threshold';
    message: string;
    severity: 'high' | 'medium' | 'low';
  }> {
    const alerts: Array<{
      type: 'rapid_decline' | 'improvement' | 'volatility' | 'critical_threshold';
      message: string;
      severity: 'high' | 'medium' | 'low';
    }> = [];

    if (snapshots.length < 2) return alerts;

    const current = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];

    // Critical threshold alert
    if (current.score < 50 && current.riskLevel === 'critical') {
      alerts.push({
        type: 'critical_threshold',
        message: 'Wallet health has reached critical levels',
        severity: 'high',
      });
    }

    // Rapid decline alert
    const scoreDrop = previous.score - current.score;
    if (scoreDrop > 20) {
      alerts.push({
        type: 'rapid_decline',
        message: `Rapid decline detected: ${scoreDrop} points`,
        severity: 'high',
      });
    }

    // Improvement alert
    if (scoreDrop < -10) {
      alerts.push({
        type: 'improvement',
        message: `Significant improvement: ${Math.abs(scoreDrop)} points`,
        severity: 'low',
      });
    }

    // Volatility alert
    const recentTrend = trends.find(t => t.period === '7d');
    if (recentTrend && recentTrend.volatility > 15) {
      alerts.push({
        type: 'volatility',
        message: 'High volatility in wallet health detected',
        severity: 'medium',
      });
    }

    return alerts;
  }

  /**
   * Get snapshot history
   */
  getSnapshotHistory(
    walletAddress: string,
    limit?: number
  ): HealthSnapshot[] {
    const walletKey = walletAddress.toLowerCase();
    const snapshots = this.snapshots.get(walletKey) || [];
    return limit ? snapshots.slice(-limit) : snapshots;
  }

  /**
   * Export trends data
   */
  exportTrendsData(walletAddress: string): {
    snapshots: HealthSnapshot[];
    trends: HealthTrend[];
  } {
    const walletKey = walletAddress.toLowerCase();
    const snapshots = this.snapshots.get(walletKey) || [];
    const trends = this.getTrends(walletAddress).trends;

    return { snapshots, trends };
  }
}

// Singleton instance
export const healthTrendsTracker = new HealthTrendsTracker();

