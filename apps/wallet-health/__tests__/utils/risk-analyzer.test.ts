/**
 * Risk Analyzer Tests
 */

import { analyzeRisk, RiskFactors } from '../../lib/utils/risk-analyzer';

describe('analyzeRisk', () => {
  it('should return high score for safe wallet', () => {
    const factors: RiskFactors = {
      approvalCount: 0,
      unlimitedApprovals: 0,
      unverifiedContracts: 0,
      suspiciousTokens: 0,
      highValueExposure: 0,
    };

    const result = analyzeRisk(factors);
    expect(result.score).toBe(100);
    expect(result.level).toBe('low');
  });

  it('should penalize unlimited approvals', () => {
    const factors: RiskFactors = {
      approvalCount: 5,
      unlimitedApprovals: 2,
      unverifiedContracts: 0,
      suspiciousTokens: 0,
      highValueExposure: 0,
    };

    const result = analyzeRisk(factors);
    expect(result.score).toBeLessThan(70);
    expect(result.factors.length).toBeGreaterThan(0);
  });

  it('should provide recommendations', () => {
    const factors: RiskFactors = {
      approvalCount: 15,
      unlimitedApprovals: 1,
      unverifiedContracts: 1,
      suspiciousTokens: 0,
      highValueExposure: 0,
    };

    const result = analyzeRisk(factors);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});

