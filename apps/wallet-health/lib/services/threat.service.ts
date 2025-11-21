/**
 * Threat Service
 */

interface Threat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

export class ThreatService {
  async analyzeAddress(address: string): Promise<Threat[]> {
    try {
      const response = await fetch(`/api/threats?address=${address}`);
      
      if (!response.ok) {
        throw new Error('Failed to analyze threats');
      }
      
      const data = await response.json();
      return data.threats || [];
    } catch (error) {
      console.error('ThreatService error:', error);
      return [];
    }
  }

  async checkSpender(spenderAddress: string): Promise<{
    isVerified: boolean;
    riskScore: number;
    reputation?: string;
  }> {
    try {
      const response = await fetch(`/api/spender?address=${spenderAddress}`);
      
      if (!response.ok) {
        return { isVerified: false, riskScore: 50 };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('ThreatService spender check error:', error);
      return { isVerified: false, riskScore: 50 };
    }
  }
}

export const threatService = new ThreatService();

