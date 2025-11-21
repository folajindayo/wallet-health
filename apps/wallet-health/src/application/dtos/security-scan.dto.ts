/**
 * Security Scan DTOs
 */

export interface SecurityScanDTO {
  id: string;
  walletAddress: string;
  threats: ThreatDTO[];
  riskScore: number;
  timestamp: Date;
}

export interface ThreatDTO {
  id: string;
  type: string;
  severity: string;
  description: string;
  detected: Date;
}

export interface CreateScanDTO {
  walletAddress: string;
  chainId: number;
}

export interface ScanResultDTO {
  scan: SecurityScanDTO;
  recommendations: string[];
  comparisonScore: number;
}
