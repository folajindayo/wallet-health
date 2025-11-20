/**
 * Wallet Security Entity
 * Core domain entity for wallet security analysis
 */

export interface WalletSecurityEntity {
  readonly walletAddress: string;
  readonly chainId: number;
  readonly securityScore: number;
  readonly riskLevel: RiskLevel;
  readonly approvals: TokenApproval[];
  readonly threats: SecurityThreat[];
  readonly lastScanned: Date;
}

export enum RiskLevel {
  SAFE = 'safe',
  MODERATE = 'moderate',
  CRITICAL = 'critical',
}

export interface TokenApproval {
  tokenAddress: string;
  tokenSymbol: string;
  spender: string;
  allowance: string;
  isUnlimited: boolean;
  riskScore: number;
  lastUpdated: Date;
}

export interface SecurityThreat {
  type: ThreatType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  affectedAssets?: string[];
}

export enum ThreatType {
  UNLIMITED_APPROVAL = 'unlimited_approval',
  UNVERIFIED_CONTRACT = 'unverified_contract',
  SUSPICIOUS_TOKEN = 'suspicious_token',
  PHISHING_RISK = 'phishing_risk',
  MEV_EXPOSURE = 'mev_exposure',
}

export function createWalletSecurityEntity(
  walletAddress: string,
  chainId: number
): WalletSecurityEntity {
  return {
    walletAddress: walletAddress.toLowerCase(),
    chainId,
    securityScore: 100,
    riskLevel: RiskLevel.SAFE,
    approvals: [],
    threats: [],
    lastScanned: new Date(),
  };
}

