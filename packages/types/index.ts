// Shared types across the monorepo

export interface WalletScanResult {
  address: string;
  chainId: number;
  score: number;
  riskLevel: 'safe' | 'moderate' | 'critical';
  timestamp: number;
  approvals: TokenApproval[];
  tokens: TokenInfo[];
  alerts: RiskAlert[];
}

export interface TokenApproval {
  token: string;
  tokenSymbol: string;
  tokenName: string;
  spender: string;
  allowance: string;
  isUnlimited: boolean;
  isRisky: boolean;
  contractAge?: number;
  isVerified?: boolean;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logo?: string;
  isSpam: boolean;
  isVerified: boolean;
  price?: number;
  value?: number;
}

export interface RiskAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface ScanHistory {
  walletAddress: string;
  scans: {
    timestamp: number;
    score: number;
    riskLevel: string;
    chainId: number;
  }[];
}

export interface UserPreferences {
  walletAddress: string;
  hiddenTokens: string[];
  notifications: boolean;
  theme: 'dark' | 'light';
}

