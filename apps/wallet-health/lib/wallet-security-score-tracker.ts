/**
 * Wallet Security Score Tracker
 * Tracks security score improvements over time and provides actionable insights
 */

export interface SecurityScoreSnapshot {
  timestamp: number;
  score: number;
  previousScore?: number;
  change: number;
  factors: {
    approvals: number;
    riskyApprovals: number;
    spamTokens: number;
    unverifiedContracts: number;
    newContracts: number;
    hasENS: boolean;
    multiSig: boolean;
    hardwareWallet: boolean;
  };
  improvements: string[];
  regressions: string[];
}

export interface SecurityScoreHistory {
  walletAddress: string;
  snapshots: SecurityScoreSnapshot[];
  currentScore: number;
  highestScore: number;
  lowestScore: number;
  averageScore: number;
  trend: 'improving' | 'stable' | 'declining' | 'volatile';
  improvementRate: number; // points per day
  milestones: Array<{
    score: number;
    timestamp: number;
    description: string;
  }>;
  recommendations: string[];
}

export class WalletSecurityScoreTracker {
  private histories: Map<string, SecurityScoreSnapshot[]> = new Map();

  /**
   * Add security score snapshot
   */
  addSnapshot(walletAddress: string, snapshot: SecurityScoreSnapshot): void {
    const key = walletAddress.toLowerCase();
    const existing = this.histories.get(key) || [];

    // Calculate change from previous snapshot
    const previousSnapshot = existing[existing.length - 1];
    const change = previousSnapshot ? snapshot.score - previousSnapshot.score : 0;

    const updatedSnapshot: SecurityScoreSnapshot = {
      ...snapshot,
      previousScore: previousSnapshot?.score,
      change,
      timestamp: snapshot.timestamp || Date.now(),
    };

    existing.push(updatedSnapshot);
    // Keep only last 365 days
    const cutoffTime = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const filtered = existing.filter((s) => s.timestamp >= cutoffTime);
    this.histories.set(key, filtered);
  }

  /**
   * Get security score history
   */
  getHistory(walletAddress: string, days?: number): SecurityScoreHistory | null {
    const key = walletAddress.toLowerCase();
    let snapshots = this.histories.get(key) || [];

    if (snapshots.length === 0) return null;

    // Filter by days if specified
    if (days) {
      const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
      snapshots = snapshots.filter((s) => s.timestamp >= cutoffTime);
    }

    if (snapshots.length === 0) return null;

    // Sort by timestamp
    snapshots.sort((a, b) => a.timestamp - b.timestamp);

    const currentScore = snapshots[snapshots.length - 1].score;
    const scores = snapshots.map((s) => s.score);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    // Calculate trend
    const trend = this.calculateTrend(snapshots);

    // Calculate improvement rate
    const improvementRate = this.calculateImprovementRate(snapshots);

    // Find milestones
    const milestones = this.findMilestones(snapshots);

    // Generate recommendations
    const recommendations = this.generateRecommendations(snapshots, currentScore, trend);

    return {
      walletAddress,
      snapshots,
      currentScore,
      highestScore,
      lowestScore,
      averageScore: Math.round(averageScore * 100) / 100,
      trend,
      improvementRate: Math.round(improvementRate * 100) / 100,
      milestones,
      recommendations,
    };
  }

  /**
   * Calculate trend
   */
  private calculateTrend(snapshots: SecurityScoreSnapshot[]): SecurityScoreHistory['trend'] {
    if (snapshots.length < 2) return 'stable';

    const scores = snapshots.map((s) => s.score);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;
    const variance = this.calculateVariance(scores);

    if (Math.abs(change) < 2) {
      return variance > 100 ? 'volatile' : 'stable';
    }

    return change > 0 ? 'improving' : 'declining';
  }

  /**
   * Calculate improvement rate (points per day)
   */
  private calculateImprovementRate(snapshots: SecurityScoreSnapshot[]): number {
    if (snapshots.length < 2) return 0;

    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    const timeSpan = (last.timestamp - first.timestamp) / (1000 * 60 * 60 * 24); // days
    const scoreChange = last.score - first.score;

    return timeSpan > 0 ? scoreChange / timeSpan : 0;
  }

  /**
   * Find milestones
   */
  private findMilestones(snapshots: SecurityScoreSnapshot[]): SecurityScoreHistory['milestones'] {
    const milestones: SecurityScoreHistory['milestones'] = [];

    // Score thresholds
    const thresholds = [50, 70, 80, 90, 95];
    const achieved = new Set<number>();

    snapshots.forEach((snapshot) => {
      thresholds.forEach((threshold) => {
        if (!achieved.has(threshold) && snapshot.score >= threshold) {
          achieved.add(threshold);
          milestones.push({
            score: threshold,
            timestamp: snapshot.timestamp,
            description: `Reached ${threshold} security score`,
          });
        }
      });
    });

    // Significant improvements
    let previousScore = snapshots[0]?.score;
    snapshots.forEach((snapshot, index) => {
      if (index > 0 && snapshot.score - previousScore >= 10) {
        milestones.push({
          score: snapshot.score,
          timestamp: snapshot.timestamp,
          description: `Significant improvement: +${snapshot.score - previousScore} points`,
        });
      }
      previousScore = snapshot.score;
    });

    return milestones.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    snapshots: SecurityScoreSnapshot[],
    currentScore: number,
    trend: SecurityScoreHistory['trend']
  ): string[] {
    const recommendations: string[] = [];
    const latest = snapshots[snapshots.length - 1];

    if (currentScore < 50) {
      recommendations.push('Security score is critically low - immediate action required');
      recommendations.push('Review and revoke all unnecessary token approvals');
      recommendations.push('Remove spam tokens from wallet');
    } else if (currentScore < 70) {
      recommendations.push('Security score needs improvement');
      recommendations.push('Review risky token approvals');
      recommendations.push('Avoid interacting with unverified contracts');
    }

    if (trend === 'declining') {
      recommendations.push('Security score is declining - review recent activity');
      recommendations.push('Check for new risky approvals or suspicious tokens');
    } else if (trend === 'improving') {
      recommendations.push('Security score is improving - continue current practices');
    }

    // Factor-specific recommendations
    if (latest.factors.riskyApprovals > 0) {
      recommendations.push(`Revoke ${latest.factors.riskyApprovals} risky token approval(s)`);
    }

    if (latest.factors.spamTokens > 0) {
      recommendations.push(`Remove ${latest.factors.spamTokens} spam token(s)`);
    }

    if (latest.factors.unverifiedContracts > 0) {
      recommendations.push('Avoid interacting with unverified contracts');
    }

    if (!latest.factors.hasENS) {
      recommendations.push('Consider setting up an ENS domain for better security');
    }

    if (!latest.factors.multiSig && currentScore < 80) {
      recommendations.push('Consider using a multi-signature wallet for enhanced security');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring wallet security');
      recommendations.push('Regular security scans recommended');
    }

    return recommendations;
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  /**
   * Get score statistics
   */
  getStatistics(walletAddress: string): {
    totalSnapshots: number;
    currentScore: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    trend: string;
  } | null {
    const history = this.getHistory(walletAddress);
    if (!history) return null;

    return {
      totalSnapshots: history.snapshots.length,
      currentScore: history.currentScore,
      averageScore: history.averageScore,
      highestScore: history.highestScore,
      lowestScore: history.lowestScore,
      trend: history.trend,
    };
  }

  /**
   * Export history
   */
  exportHistory(walletAddress: string): SecurityScoreHistory | null {
    return this.getHistory(walletAddress);
  }
}

// Singleton instance
export const walletSecurityScoreTracker = new WalletSecurityScoreTracker();

