/**
 * Approval Types
 */

export interface TokenApproval {
  id: string;
  token: {
    address: string;
    symbol: string;
    name: string;
    logo?: string;
  };
  spender: {
    address: string;
    name?: string;
    isVerified: boolean;
  };
  amount: string;
  timestamp: number;
  chainId: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ApprovalStats {
  total: number;
  byRisk: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  totalValue: number;
}

