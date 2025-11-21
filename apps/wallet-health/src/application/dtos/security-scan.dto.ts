/**
 * Security Scan DTOs
 */

export interface SecurityScanDTO {
  id: string;
  walletAddress: string;
  chainId: number;
  score: number;
  riskLevel: string;
  threats: ThreatDTO[];
  scanDate: string;
  recommendations: string[];
  isSafe: boolean;
  hasCriticalThreats: boolean;
}

export interface ThreatDTO {
  type: string;
  severity: string;
  description: string;
  affectedAddresses?: string[];
}

export interface ScanWalletRequestDTO {
  walletAddress: string;
  chainId: number;
}

