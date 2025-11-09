import type { TokenApproval, TokenInfo, RiskAlert } from '@wallet-health/types';

export interface RiskFactors {
  activeApprovalsCount: number;
  unverifiedContractsCount: number;
  newContractsCount: number;
  spamTokensCount: number;
  hasENS: boolean;
  verifiedProtocolsCount: number;
}

export interface RiskScore {
  score: number;
  riskLevel: 'safe' | 'moderate' | 'critical';
  factors: RiskFactors;
  alerts: RiskAlert[];
}

const BASE_SCORE = 100;

// Scoring weights as per PRD
const WEIGHTS = {
  MANY_APPROVALS: -15,        // >10 active approvals
  UNVERIFIED_CONTRACT: -25,   // Each unverified contract
  NEW_CONTRACT: -10,          // Contract <30 days old
  SPAM_TOKEN: -20,            // Spam tokens detected
  ENS_VERIFIED: +10,          // Has ENS or verified protocols
};

// Calculate contract age in days
function getContractAgeDays(createdAt?: number): number {
  if (!createdAt) return 999; // Unknown age, assume safe
  const now = Date.now() / 1000; // Current time in seconds
  return (now - createdAt) / (60 * 60 * 24); // Convert to days
}

// Calculate risk score based on wallet data
export function calculateRiskScore(
  approvals: TokenApproval[],
  tokens: TokenInfo[],
  hasENS = false
): RiskScore {
  let score = BASE_SCORE;
  const alerts: RiskAlert[] = [];
  
  // Count risk factors
  const activeApprovalsCount = approvals.length;
  const unverifiedContractsCount = approvals.filter(a => a.isVerified === false).length;
  const newContractsCount = approvals.filter(a => {
    if (!a.contractAge) return false;
    return a.contractAge < 30;
  }).length;
  const spamTokensCount = tokens.filter(t => t.isSpam).length;
  const verifiedProtocolsCount = approvals.filter(a => a.isVerified === true).length;

  // Apply scoring rules from PRD
  
  // 1. Too many active approvals (>10)
  if (activeApprovalsCount > 10) {
    score += WEIGHTS.MANY_APPROVALS;
    alerts.push({
      id: 'many-approvals',
      severity: 'medium',
      title: 'Too Many Active Approvals',
      description: `You have ${activeApprovalsCount} active token approvals. Consider revoking unused ones.`,
      actionable: true,
      actionLabel: 'Review Approvals',
    });
  }

  // 2. Unverified contracts
  if (unverifiedContractsCount > 0) {
    score += WEIGHTS.UNVERIFIED_CONTRACT * unverifiedContractsCount;
    alerts.push({
      id: 'unverified-contracts',
      severity: 'high',
      title: 'Unverified Contract Approvals',
      description: `${unverifiedContractsCount} approval(s) to unverified contracts detected. High risk!`,
      actionable: true,
      actionLabel: 'Revoke Unverified',
    });
  }

  // 3. New contracts (<30 days)
  if (newContractsCount > 0) {
    score += WEIGHTS.NEW_CONTRACT * newContractsCount;
    alerts.push({
      id: 'new-contracts',
      severity: 'medium',
      title: 'New Contract Approvals',
      description: `${newContractsCount} approval(s) to contracts less than 30 days old.`,
      actionable: true,
      actionLabel: 'Review New Contracts',
    });
  }

  // 4. Spam tokens
  if (spamTokensCount > 0) {
    score += WEIGHTS.SPAM_TOKEN;
    alerts.push({
      id: 'spam-tokens',
      severity: 'medium',
      title: 'Spam Tokens Detected',
      description: `${spamTokensCount} spam or phishing token(s) found in your wallet.`,
      actionable: true,
      actionLabel: 'Hide Spam Tokens',
    });
  }

  // 5. ENS or verified protocols (bonus)
  if (hasENS || verifiedProtocolsCount > 0) {
    score += WEIGHTS.ENS_VERIFIED;
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine risk level
  let riskLevel: 'safe' | 'moderate' | 'critical';
  if (score >= 80) {
    riskLevel = 'safe';
  } else if (score >= 50) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'critical';
  }

  // Add general risk level alert
  if (riskLevel === 'critical') {
    alerts.unshift({
      id: 'critical-risk',
      severity: 'high',
      title: 'Critical Risk Level',
      description: 'Your wallet has critical security risks. Immediate action recommended.',
      actionable: false,
    });
  } else if (riskLevel === 'moderate') {
    alerts.unshift({
      id: 'moderate-risk',
      severity: 'medium',
      title: 'Moderate Risk Level',
      description: 'Your wallet has some security concerns. Review and take action.',
      actionable: false,
    });
  }

  return {
    score: Math.round(score),
    riskLevel,
    factors: {
      activeApprovalsCount,
      unverifiedContractsCount,
      newContractsCount,
      spamTokensCount,
      hasENS,
      verifiedProtocolsCount,
    },
    alerts,
  };
}

// Get risk level color for UI
export function getRiskLevelColor(riskLevel: 'safe' | 'moderate' | 'critical'): string {
  switch (riskLevel) {
    case 'safe':
      return 'text-green-500';
    case 'moderate':
      return 'text-yellow-500';
    case 'critical':
      return 'text-red-500';
  }
}

// Get risk level background color for UI
export function getRiskLevelBgColor(riskLevel: 'safe' | 'moderate' | 'critical'): string {
  switch (riskLevel) {
    case 'safe':
      return 'bg-green-500/10';
    case 'moderate':
      return 'bg-yellow-500/10';
    case 'critical':
      return 'bg-red-500/10';
  }
}

// Get risk level emoji
export function getRiskLevelEmoji(riskLevel: 'safe' | 'moderate' | 'critical'): string {
  switch (riskLevel) {
    case 'safe':
      return '🟢';
    case 'moderate':
      return '🟠';
    case 'critical':
      return '🔴';
  }
}

