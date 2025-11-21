/**
 * Security Type Definitions
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ThreatType = 'phishing' | 'malware' | 'exploit' | 'scam' | 'suspicious';

export interface IThreat {
  type: ThreatType;
  severity: RiskLevel;
  description: string;
  affectedAddresses?: string[];
  detectedAt: string;
  mitigationSteps?: string[];
}

export interface ISecurityScan {
  id: string;
  walletAddress: string;
  chainId: number;
  score: number;
  riskLevel: RiskLevel;
  threats: IThreat[];
  scanDate: string;
  recommendations: string[];
}

export interface IScanHistory {
  scans: ISecurityScan[];
  trends: {
    scoreChange: number;
    newThreats: number;
    resolvedThreats: number;
  };
}

