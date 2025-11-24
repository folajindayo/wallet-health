/**
 * Security Scan Entity Tests
 */

import { SecurityScanEntity, RiskLevel } from '../security-scan.entity';

describe('SecurityScanEntity', () => {
  const validProps = {
    id: 'scan-1',
    walletAddress: '0x' + '1'.repeat(40),
    chainId: 1,
    score: 85,
    riskLevel: RiskLevel.LOW,
    threats: [],
    scanDate: new Date(),
    recommendations: [],
  };

  describe('create', () => {
    it('should create a valid scan entity', () => {
      const scan = SecurityScanEntity.create(validProps);
      expect(scan.id).toBe(validProps.id);
      expect(scan.score).toBe(validProps.score);
    });

    it('should throw error for invalid wallet address', () => {
      expect(() =>
        SecurityScanEntity.create({ ...validProps, walletAddress: 'invalid' })
      ).toThrow('Invalid wallet address');
    });

    it('should throw error for invalid score', () => {
      expect(() =>
        SecurityScanEntity.create({ ...validProps, score: 150 })
      ).toThrow('Score must be between 0 and 100');
    });
  });

  describe('business logic', () => {
    it('should identify safe wallets', () => {
      const scan = SecurityScanEntity.create(validProps);
      expect(scan.isSafe()).toBe(true);
    });

    it('should detect critical threats', () => {
      const scan = SecurityScanEntity.create({
        ...validProps,
        threats: [
          {
            type: 'malicious_approval',
            severity: RiskLevel.CRITICAL,
            description: 'Test',
          },
        ],
      });
      expect(scan.hasCriticalThreats()).toBe(true);
    });

    it('should filter threats by severity', () => {
      const scan = SecurityScanEntity.create({
        ...validProps,
        threats: [
          { type: 'test1', severity: RiskLevel.HIGH, description: 'Test 1' },
          { type: 'test2', severity: RiskLevel.LOW, description: 'Test 2' },
        ],
      });
      expect(scan.getThreatsBySeverity(RiskLevel.HIGH)).toHaveLength(1);
    });
  });
});


