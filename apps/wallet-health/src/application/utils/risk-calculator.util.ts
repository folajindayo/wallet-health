/**
 * Risk Calculator Utility
 */

export class RiskCalculator {
  static calculateScore(threats: any[]): number {
    let score = 100;

    for (const threat of threats) {
      switch (threat.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    return Math.max(0, score);
  }

  static getRiskLevel(score: number): string {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  static isSafe(score: number): boolean {
    return score >= 80;
  }
}


