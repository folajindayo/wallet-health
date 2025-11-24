/**
 * Wallet Health Score Calculator Utility
 * Calculate overall wallet health score
 */

export interface HealthMetrics {
  securityScore: number; // 0-100
  riskScore: number; // 0-100 (lower is better)
  activityScore: number; // 0-100
  portfolioScore: number; // 0-100
  complianceScore: number; // 0-100
}

export interface HealthScore {
  overall: number; // 0-100
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  metrics: HealthMetrics;
  breakdown: Array<{
    category: string;
    score: number;
    weight: number;
    contribution: number;
  }>;
  recommendations: string[];
  lastUpdated: number;
}

export class WalletHealthScoreCalculator {
  /**
   * Calculate health score
   */
  calculateHealthScore(metrics: HealthMetrics): HealthScore {
    // Weighted scoring
    const weights = {
      security: 0.35,
      risk: 0.25,
      activity: 0.15,
      portfolio: 0.15,
      compliance: 0.10,
    };

    // Risk score is inverted (lower is better)
    const normalizedRiskScore = 100 - metrics.riskScore;

    const overall = Math.round(
      metrics.securityScore * weights.security +
      normalizedRiskScore * weights.risk +
      metrics.activityScore * weights.activity +
      metrics.portfolioScore * weights.portfolio +
      metrics.complianceScore * weights.compliance
    );

    // Determine level
    let level: HealthScore['level'] = 'excellent';
    if (overall < 40) {
      level = 'critical';
    } else if (overall < 60) {
      level = 'poor';
    } else if (overall < 75) {
      level = 'fair';
    } else if (overall < 90) {
      level = 'good';
    }

    // Calculate breakdown
    const breakdown: HealthScore['breakdown'] = [
      {
        category: 'Security',
        score: metrics.securityScore,
        weight: weights.security,
        contribution: Math.round(metrics.securityScore * weights.security),
      },
      {
        category: 'Risk',
        score: normalizedRiskScore,
        weight: weights.risk,
        contribution: Math.round(normalizedRiskScore * weights.risk),
      },
      {
        category: 'Activity',
        score: metrics.activityScore,
        weight: weights.activity,
        contribution: Math.round(metrics.activityScore * weights.activity),
      },
      {
        category: 'Portfolio',
        score: metrics.portfolioScore,
        weight: weights.portfolio,
        contribution: Math.round(metrics.portfolioScore * weights.portfolio),
      },
      {
        category: 'Compliance',
        score: metrics.complianceScore,
        weight: weights.compliance,
        contribution: Math.round(metrics.complianceScore * weights.compliance),
      },
    ];

    // Generate recommendations
    const recommendations: string[] = [];

    if (metrics.securityScore < 70) {
      recommendations.push('Improve security practices: review token approvals, enable 2FA, use hardware wallet');
    }

    if (metrics.riskScore > 50) {
      recommendations.push('Reduce risk exposure: review high-risk positions and interactions');
    }

    if (metrics.activityScore < 50) {
      recommendations.push('Increase wallet activity: diversify transactions and interactions');
    }

    if (metrics.portfolioScore < 60) {
      recommendations.push('Optimize portfolio: diversify holdings and review allocation');
    }

    if (metrics.complianceScore < 70) {
      recommendations.push('Improve compliance: review transaction history and ensure proper documentation');
    }

    return {
      overall,
      level,
      metrics,
      breakdown,
      recommendations,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Compare health scores
   */
  compareHealthScores(score1: HealthScore, score2: HealthScore): {
    difference: number;
    betterScore: HealthScore;
    improvements: Array<{
      category: string;
      improvement: number;
    }>;
  } {
    const difference = score2.overall - score1.overall;
    const betterScore = score2.overall > score1.overall ? score2 : score1;

    const improvements = score1.breakdown.map((item, index) => ({
      category: item.category,
      improvement: score2.breakdown[index].score - item.score,
    }));

    return {
      difference,
      betterScore,
      improvements,
    };
  }

  /**
   * Get health trend
   */
  getHealthTrend(scores: HealthScore[]): {
    trend: 'improving' | 'declining' | 'stable';
    change: number;
    average: number;
  } {
    if (scores.length < 2) {
      return {
        trend: 'stable',
        change: 0,
        average: scores[0]?.overall || 0,
      };
    }

    const sorted = scores.sort((a, b) => a.lastUpdated - b.lastUpdated);
    const first = sorted[0].overall;
    const last = sorted[sorted.length - 1].overall;
    const change = last - first;

    const average = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (change > 5) {
      trend = 'improving';
    } else if (change < -5) {
      trend = 'declining';
    }

    return {
      trend,
      change: Math.round(change * 100) / 100,
      average: Math.round(average * 100) / 100,
    };
  }
}

// Singleton instance
export const walletHealthScoreCalculator = new WalletHealthScoreCalculator();
