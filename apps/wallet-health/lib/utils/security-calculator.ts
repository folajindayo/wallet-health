/**
 * Security Score Calculator
 */

export interface SecurityFactors {
  totalApprovals: number;
  unlimitedApprovals: number;
  unverifiedContracts: number;
  newContracts: number;
  spamTokens: number;
  hasENS: boolean;
}

export function calculateSecurityScore(factors: SecurityFactors): number {
  let score = 100;

  if (factors.totalApprovals > 10) score -= 15;
  score -= factors.unlimitedApprovals * 25;
  score -= factors.unverifiedContracts * 20;
  score -= factors.newContracts * 10;
  score -= factors.spamTokens * 15;
  if (factors.hasENS) score += 5;

  return Math.max(0, Math.min(100, score));
}

