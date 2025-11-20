/**
 * Risk Analyzer
 */

export interface RiskFactors {
  approvalCount: number;
  unlimitedApprovals: number;
  unverifiedContracts: number;
  suspiciousTokens: number;
  highValueExposure: number;
}

export interface RiskAnalysis {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendations: string[];
}

export function analyzeRisk(factors: RiskFactors): RiskAnalysis {
  let score = 100;
  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  if (factors.approvalCount > 10) {
    score -= 15;
    riskFactors.push('High number of token approvals');
    recommendations.push('Review and revoke unnecessary approvals');
  }

  if (factors.unlimitedApprovals > 0) {
    score -= factors.unlimitedApprovals * 20;
    riskFactors.push('Unlimited token approvals detected');
    recommendations.push('Set limited approval amounts');
  }

  if (factors.unverifiedContracts > 0) {
    score -= factors.unverifiedContracts * 15;
    riskFactors.push('Approvals to unverified contracts');
    recommendations.push('Only approve verified contracts');
  }

  score = Math.max(0, Math.min(100, score));

  const level = score >= 70 ? 'low' : score >= 50 ? 'medium' : score >= 30 ? 'high' : 'critical';

  return {
    score,
    level,
    factors: riskFactors,
    recommendations,
  };
}

