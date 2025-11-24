/**
 * Security Helper Tests
 */

import { calculateThreatScore, categorizeThreat, getPriorityLevel } from '../security.helper';

describe('Security Helper', () => {
  describe('calculateThreatScore', () => {
    it('should return 0 for no threats', () => {
      expect(calculateThreatScore([])).toBe(0);
    });

    it('should calculate score correctly', () => {
      const threats = [
        { severity: 'critical' },
        { severity: 'high' },
        { severity: 'medium' },
      ];
      expect(calculateThreatScore(threats)).toBe(17);
    });

    it('should cap score at 100', () => {
      const threats = Array(20).fill({ severity: 'critical' });
      expect(calculateThreatScore(threats)).toBe(100);
    });
  });

  describe('categorizeThreat', () => {
    it('should categorize known threats', () => {
      expect(categorizeThreat('phishing')).toBe('Social Engineering');
      expect(categorizeThreat('malware')).toBe('Malicious Code');
      expect(categorizeThreat('exploit')).toBe('Smart Contract Vulnerability');
    });

    it('should handle unknown threats', () => {
      expect(categorizeThreat('unknown')).toBe('Unknown');
    });
  });

  describe('getPriorityLevel', () => {
    it('should return correct priority', () => {
      expect(getPriorityLevel('critical')).toBe(1);
      expect(getPriorityLevel('high')).toBe(2);
      expect(getPriorityLevel('medium')).toBe(3);
      expect(getPriorityLevel('low')).toBe(4);
    });

    it('should handle unknown severity', () => {
      expect(getPriorityLevel('unknown')).toBe(5);
    });
  });
});


