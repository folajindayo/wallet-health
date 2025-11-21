/**
 * ThreatService Tests
 */

import { threatService } from '../../lib/services/threat.service';

global.fetch = jest.fn();

describe('ThreatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeAddress', () => {
    it('analyzes address for threats', async () => {
      const mockThreats = [
        {
          id: '1',
          type: 'old_approvals',
          severity: 'medium' as const,
          description: 'Old approvals detected',
          recommendation: 'Review and revoke',
        },
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ threats: mockThreats }),
      });

      const result = await threatService.analyzeAddress('0x123');
      expect(result).toEqual(mockThreats);
    });

    it('handles analysis errors', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('API error'));

      const result = await threatService.analyzeAddress('0x123');
      expect(result).toEqual([]);
    });
  });

  describe('checkSpender', () => {
    it('checks spender verification', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          isVerified: true,
          riskScore: 20,
          reputation: 'good',
        }),
      });

      const result = await threatService.checkSpender('0x456');
      expect(result.isVerified).toBe(true);
      expect(result.riskScore).toBe(20);
    });
  });
});

