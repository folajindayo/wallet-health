/**
 * Risk Calculator Tests
 */

import { 
  calculateRiskScore, 
  determineRiskLevel, 
  aggregateRiskFactors 
} from '../risk-calculator.util';

describe('RiskCalculator', () => {
  describe('calculateRiskScore', () => {
    it('should calculate risk score from threats', () => {
      const threats = [
        { severity: 'high', weight: 0.8 },
        { severity: 'medium', weight: 0.5 },
      ];
      const score = calculateRiskScore(threats);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for no threats', () => {
      expect(calculateRiskScore([])).toBe(0);
    });
  });

  describe('determineRiskLevel', () => {
    it('should return low for score < 25', () => {
      expect(determineRiskLevel(20)).toBe('low');
    });

    it('should return medium for score 25-50', () => {
      expect(determineRiskLevel(35)).toBe('medium');
    });

    it('should return high for score 50-75', () => {
      expect(determineRiskLevel(60)).toBe('high');
    });

    it('should return critical for score > 75', () => {
      expect(determineRiskLevel(80)).toBe('critical');
    });
  });
});

