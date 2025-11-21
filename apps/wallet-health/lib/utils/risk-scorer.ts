/**
 * Risk Scorer
 */

interface RiskFactors {
  oldApprovals: number;
  highValueApprovals: number;
  unverifiedSpenders: number;
  suspiciousActivity: number;
}

export class RiskScorer {
  private weights = {
    oldApprovals: 0.25,
    highValueApprovals: 0.35,
    unverifiedSpenders: 0.25,
    suspiciousActivity: 0.15,
  };

  calculateScore(factors: RiskFactors): number {
    const oldApprovalsScore = Math.max(0, 100 - factors.oldApprovals * 10);
    const highValueScore = Math.max(0, 100 - factors.highValueApprovals * 15);
    const unverifiedScore = Math.max(0, 100 - factors.unverifiedSpenders * 20);
    const suspiciousScore = Math.max(0, 100 - factors.suspiciousActivity * 25);

    const weightedScore =
      oldApprovalsScore * this.weights.oldApprovals +
      highValueScore * this.weights.highValueApprovals +
      unverifiedScore * this.weights.unverifiedSpenders +
      suspiciousScore * this.weights.suspiciousActivity;

    return Math.round(weightedScore);
  }
}

export const riskScorer = new RiskScorer();

