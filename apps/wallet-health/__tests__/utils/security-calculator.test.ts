/**
 * Security Calculator Tests
 */

import { calculateSecurityScore } from '../../lib/utils/security-calculator';

describe('calculateSecurityScore', () => {
  it('should return 100 for safe wallet', () => {
    const score = calculateSecurityScore({
      totalApprovals: 0,
      unlimitedApprovals: 0,
      unverifiedContracts: 0,
      newContracts: 0,
      spamTokens: 0,
      hasENS: true,
    });
    expect(score).toBe(100);
  });

  it('should penalize unlimited approvals', () => {
    const score = calculateSecurityScore({
      totalApprovals: 5,
      unlimitedApprovals: 2,
      unverifiedContracts: 0,
      newContracts: 0,
      spamTokens: 0,
      hasENS: false,
    });
    expect(score).toBeLessThan(70);
  });

  it('should never go below 0', () => {
    const score = calculateSecurityScore({
      totalApprovals: 100,
      unlimitedApprovals: 10,
      unverifiedContracts: 10,
      newContracts: 10,
      spamTokens: 10,
      hasENS: false,
    });
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

