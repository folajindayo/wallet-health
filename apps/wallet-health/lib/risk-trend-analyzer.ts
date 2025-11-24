/**
 * Risk Trend Analyzer
 * Analyzes risk trends over time and predicts future risks
 */

export interface RiskSnapshot {
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

export interface RiskTrend {
  period: '7d' | '30d' | '90d' | '1y';
  trend: 'improving' | 'declining' | 'stable';
  trendStrength: 'strong' | 'moderate' | 'weak';
  change: number; // percentage change
  snapshots: RiskSnapshot[];
  prediction?: {
    nextScore: number;
    nextRiskLevel: 'safe' | 'moderate' | 'critical';
    confidence: 'high' | 'medium' | 'low';
    timeframe: string;
  };
  insights: string[];
  warnings: string[];
}

export class RiskTrendAnalyzer {
  private snapshots: Map<string, RiskSnapshot[]> = new Map(); // wallet -> snapshots

  /**
   * Add risk snapshot
   */
  addSnapshot(walletAddress: string, snapshot: RiskSnapshot): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.snapshots.has(walletKey)) {
      this.snapshots.set(walletKey, []);
    }

    this.snapshots.get(walletKey)!.push(snapshot);

    // Keep last 1000 snapshots
    const snapshots = this.snapshots.get(walletKey)!;
    if (snapshots.length > 1000) {
      snapshots.shift();
    }

    // Sort by timestamp
    snapshots.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Analyze risk trend
   */
  analyzeTrend(
    walletAddress: string,
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): RiskTrend {
    const walletKey = walletAddress.toLowerCase();
    const snapshots = this.snapshots.get(walletKey) || [];

    if (snapshots.length < 2) {
      throw new Error('Insufficient snapshot data for trend analysis');
    }

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
    }

    const periodSnapshots = snapshots.filter(s => s.timestamp >= cutoff);

    if (periodSnapshots.length < 2) {
      throw new Error('Insufficient data for selected period');
    }

    const first = periodSnapshots[0];
    const last = periodSnapshots[periodSnapshots.length - 1];
    const scoreChange = last.score - first.score;
    const change = first.score > 0 ? (scoreChange / first.score) * 100 : 0;

    // Determine trend
    let trend: 'improving' | 'declining' | 'stable';
    let trendStrength: 'strong' | 'moderate' | 'weak';

    if (change > 10) {
      trend = 'improving';
      trendStrength = change > 20 ? 'strong' : 'moderate';
    } else if (change < -10) {
      trend = 'declining';
      trendStrength = change < -20 ? 'strong' : 'moderate';
    } else {
      trend = 'stable';
      trendStrength = 'weak';
    }

    // Generate prediction
    const prediction = this.predictFutureRisk(periodSnapshots);

    // Generate insights
    const insights = this.generateInsights(periodSnapshots, trend, change);

    // Generate warnings
    const warnings = this.generateWarnings(periodSnapshots, last);

    return {
      period,
      trend,
      trendStrength,
      change: Math.round(change * 100) / 100,
      snapshots: periodSnapshots,
      prediction,
      insights,
      warnings,
    };
  }

  /**
   * Predict future risk
   */
  private predictFutureRisk(snapshots: RiskSnapshot[]): RiskTrend['prediction'] {
    if (snapshots.length < 3) {
      return undefined;
    }

    // Simple linear regression for prediction
    const recent = snapshots.slice(-10);
    const scores = recent.map(s => s.score);
    const timestamps = recent.map(s => s.timestamp);

    // Calculate trend
    const n = recent.length;
    const sumX = timestamps.reduce((sum, t) => sum + t, 0);
    const sumY = scores.reduce((sum, s) => sum + s, 0);
    const sumXY = timestamps.reduce((sum, t, i) => sum + t * scores[i], 0);
    const sumX2 = timestamps.reduce((sum, t) => sum + t * t, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next week
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const predictedScore = Math.max(0, Math.min(100, Math.round(slope * nextWeek + intercept)));

    let nextRiskLevel: 'safe' | 'moderate' | 'critical';
    if (predictedScore >= 80) {
      nextRiskLevel = 'safe';
    } else if (predictedScore >= 50) {
      nextRiskLevel = 'moderate';
    } else {
      nextRiskLevel = 'critical';
    }

    // Calculate confidence based on data points and variance
    const variance = scores.reduce(
      (sum, s, i) => sum + Math.pow(s - (slope * timestamps[i] + intercept), 2),
      0
    ) / n;
    const confidence = variance < 100 ? 'high' : variance < 400 ? 'medium' : 'low';

    return {
      nextScore: predictedScore,
      nextRiskLevel,
      confidence,
      timeframe: '1 week',
    };
  }

  /**
   * Generate insights
   */
  private generateInsights(
    snapshots: RiskSnapshot[],
    trend: 'improving' | 'declining' | 'stable',
    change: number
  ): string[] {
    const insights: string[] = [];

    if (trend === 'improving') {
      insights.push(`Risk score improved by ${Math.abs(Math.round(change))}%`);
    } else if (trend === 'declining') {
      insights.push(`Risk score declined by ${Math.abs(Math.round(change))}% - action needed`);
    }

    // Check factor changes
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];

    if (last.factors.unverifiedContractsCount > first.factors.unverifiedContractsCount) {
      insights.push('Number of unverified contracts increased');
    }

    if (last.factors.activeApprovalsCount > first.factors.activeApprovalsCount + 5) {
      insights.push('Significant increase in active approvals');
    }

    return insights;
  }

  /**
   * Generate warnings
   */
  private generateWarnings(
    snapshots: RiskSnapshot[],
    current: RiskSnapshot
  ): string[] {
    const warnings: string[] = [];

    if (current.riskLevel === 'critical') {
      warnings.push('Current risk level is critical - immediate action required');
    }

    // Check for rapid decline
    if (snapshots.length >= 3) {
      const recent = snapshots.slice(-3);
      const decline = recent[0].score - recent[recent.length - 1].score;
      if (decline > 20) {
        warnings.push('Rapid decline in risk score detected');
      }
    }

    if (current.factors.unverifiedContractsCount > 0) {
      warnings.push(`${current.factors.unverifiedContractsCount} unverified contract(s) detected`);
    }

    return warnings;
  }

  /**
   * Get snapshot history
   */
  getSnapshotHistory(
    walletAddress: string,
    limit?: number
  ): RiskSnapshot[] {
    const walletKey = walletAddress.toLowerCase();
    const snapshots = this.snapshots.get(walletKey) || [];
    return limit ? snapshots.slice(-limit) : snapshots;
  }

  /**
   * Compare risk across multiple wallets
   */
  compareWallets(walletAddresses: string[]): {
    averageScore: number;
    bestScore: number;
    worstScore: number;
    rankings: Array<{
      walletAddress: string;
      currentScore: number;
      trend: 'improving' | 'declining' | 'stable';
    }>;
  } {
    const rankings: Array<{
      walletAddress: string;
      currentScore: number;
      trend: 'improving' | 'declining' | 'stable';
    }> = [];

    walletAddresses.forEach(address => {
      const snapshots = this.snapshots.get(address.toLowerCase()) || [];
      if (snapshots.length === 0) return;

      const current = snapshots[snapshots.length - 1];
      let trend: 'improving' | 'declining' | 'stable' = 'stable';

      if (snapshots.length >= 2) {
        const previous = snapshots[snapshots.length - 2];
        const change = current.score - previous.score;
        if (change > 5) trend = 'improving';
        else if (change < -5) trend = 'declining';
      }

      rankings.push({
        walletAddress: address,
        currentScore: current.score,
        trend,
      });
    });

    rankings.sort((a, b) => b.currentScore - a.currentScore);

    const scores = rankings.map(r => r.currentScore);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    return {
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      rankings,
    };
  }
}

// Singleton instance
export const riskTrendAnalyzer = new RiskTrendAnalyzer();
