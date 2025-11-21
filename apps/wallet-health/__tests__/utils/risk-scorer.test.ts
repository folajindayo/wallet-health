/**
 * Risk Scorer Tests
 */

import { riskScorer } from '../../lib/utils/risk-scorer';

describe('RiskScorer', () => {
  it('calculates score based on risk factors', () => {
    const factors = {
      oldApprovals: 2,
      highValueApprovals: 1,
      unverifiedSpenders: 1,
      suspiciousActivity: 0,
    };

    const score = riskScorer.calculateScore(factors);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns high score for no risks', () => {
    const factors = {
      oldApprovals: 0,
      highValueApprovals: 0,
      unverifiedSpenders: 0,
      suspiciousActivity: 0,
    };

    const score = riskScorer.calculateScore(factors);
    expect(score).toBe(100);
  });

  it('returns low score for many risks', () => {
    const factors = {
      oldApprovals: 5,
      highValueApprovals: 3,
      unverifiedSpenders: 4,
      suspiciousActivity: 2,
    };

    const score = riskScorer.calculateScore(factors);
    expect(score).toBeLessThan(50);
  });
});

