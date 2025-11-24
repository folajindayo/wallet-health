/**
 * Security Recommendations Engine
 * Generates personalized security recommendations based on wallet analysis
 */

import type { TokenApproval, RiskAlert } from '@wallet-health/types';

export interface SecurityRecommendation {
  id: string;
  category: 'approvals' | 'tokens' | 'contracts' | 'general' | 'privacy' | 'backup';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  actionSteps: string[];
  estimatedTime: string;
  priority: number; // 1-10, higher = more urgent
  relatedAlerts?: string[]; // Alert IDs
  metadata?: Record<string, any>;
}

export interface RecommendationContext {
  approvals: TokenApproval[];
  tokens: Array<{ address: string; isSpam: boolean }>;
  riskScore: number;
  riskLevel: 'safe' | 'moderate' | 'critical';
  alerts: RiskAlert[];
  hasENS?: boolean;
  multiSig?: boolean;
  recentActivity?: number; // days
}

export interface RecommendationReport {
  recommendations: SecurityRecommendation[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    estimatedTotalTime: string;
  };
  prioritized: SecurityRecommendation[];
  quickWins: SecurityRecommendation[]; // Low effort, high impact
}

export class SecurityRecommendationsEngine {
  /**
   * Generate recommendations based on context
   */
  generateRecommendations(context: RecommendationContext): RecommendationReport {
    const recommendations: SecurityRecommendation[] = [];

    // Analyze approvals
    recommendations.push(...this.analyzeApprovals(context));

    // Analyze tokens
    recommendations.push(...this.analyzeTokens(context));

    // Analyze contracts
    recommendations.push(...this.analyzeContracts(context));

    // General security recommendations
    recommendations.push(...this.generateGeneralRecommendations(context));

    // Privacy recommendations
    recommendations.push(...this.generatePrivacyRecommendations(context));

    // Backup recommendations
    recommendations.push(...this.generateBackupRecommendations(context));

    // Sort by priority
    recommendations.sort((a, b) => b.priority - a.priority);

    // Calculate summary
    const summary = {
      total: recommendations.length,
      critical: recommendations.filter(r => r.severity === 'critical').length,
      high: recommendations.filter(r => r.severity === 'high').length,
      medium: recommendations.filter(r => r.severity === 'medium').length,
      low: recommendations.filter(r => r.severity === 'low').length,
      estimatedTotalTime: this.calculateTotalTime(recommendations),
    };

    // Get prioritized (top 10)
    const prioritized = recommendations.slice(0, 10);

    // Get quick wins (low effort, high impact)
    const quickWins = recommendations.filter(
      r => r.priority >= 7 && r.estimatedTime.includes('minute')
    );

    return {
      recommendations,
      summary,
      prioritized,
      quickWins,
    };
  }

  /**
   * Analyze approvals and generate recommendations
   */
  private analyzeApprovals(context: RecommendationContext): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    const unverifiedApprovals = context.approvals.filter(a => a.isVerified === false);
    if (unverifiedApprovals.length > 0) {
      recommendations.push({
        id: 'revoke-unverified',
        category: 'approvals',
        severity: 'critical',
        title: 'Revoke Unverified Contract Approvals',
        description: `You have ${unverifiedApprovals.length} approval(s) to unverified contracts. These pose a significant security risk.`,
        action: 'Revoke all unverified contract approvals immediately',
        actionSteps: [
          'Review each unverified contract approval',
          'Verify if the contract is legitimate',
          'Revoke approvals to suspicious contracts',
          'Use the approval revoker tool for batch revocation',
        ],
        estimatedTime: '15-30 minutes',
        priority: 10,
        relatedAlerts: context.alerts
          .filter(a => a.id === 'unverified-contracts')
          .map(a => a.id),
      });
    }

    const unlimitedApprovals = context.approvals.filter(a => a.isUnlimited);
    if (unlimitedApprovals.length > 0) {
      recommendations.push({
        id: 'limit-approvals',
        category: 'approvals',
        severity: 'high',
        title: 'Replace Unlimited Approvals',
        description: `You have ${unlimitedApprovals.length} unlimited approval(s). Consider replacing them with specific amounts.`,
        action: 'Replace unlimited approvals with specific amounts',
        actionSteps: [
          'Identify which approvals need unlimited access',
          'Calculate the maximum amount you need',
          'Revoke unlimited approvals',
          'Re-approve with specific amounts',
        ],
        estimatedTime: '20-40 minutes',
        priority: 8,
      });
    }

    if (context.approvals.length > 10) {
      recommendations.push({
        id: 'review-approvals',
        category: 'approvals',
        severity: 'medium',
        title: 'Review and Clean Up Approvals',
        description: `You have ${context.approvals.length} active approvals. Review and revoke unused ones.`,
        action: 'Review all approvals and revoke unused ones',
        actionSteps: [
          'List all active approvals',
          'Identify which ones are still needed',
          'Revoke unused approvals',
          'Set calendar reminder to review quarterly',
        ],
        estimatedTime: '30-60 minutes',
        priority: 6,
      });
    }

    return recommendations;
  }

  /**
   * Analyze tokens and generate recommendations
   */
  private analyzeTokens(context: RecommendationContext): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    const spamTokens = context.tokens.filter(t => t.isSpam);
    if (spamTokens.length > 0) {
      recommendations.push({
        id: 'hide-spam-tokens',
        category: 'tokens',
        severity: 'medium',
        title: 'Hide Spam Tokens',
        description: `You have ${spamTokens.length} spam or phishing token(s) in your wallet. Hide them to avoid confusion.`,
        action: 'Hide spam tokens from your wallet view',
        actionSteps: [
          'Review detected spam tokens',
          'Hide them in your wallet interface',
          'Never interact with spam tokens',
          'Be cautious of future airdrops',
        ],
        estimatedTime: '5 minutes',
        priority: 5,
      });
    }

    return recommendations;
  }

  /**
   * Analyze contracts and generate recommendations
   */
  private analyzeContracts(context: RecommendationContext): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    const newContracts = context.approvals.filter(
      a => a.contractAge && a.contractAge < 30
    );
    if (newContracts.length > 0) {
      recommendations.push({
        id: 'review-new-contracts',
        category: 'contracts',
        severity: 'medium',
        title: 'Review New Contract Interactions',
        description: `You have ${newContracts.length} approval(s) to contracts less than 30 days old. Verify their legitimacy.`,
        action: 'Review and verify new contract interactions',
        actionSteps: [
          'Check contract verification status',
          'Review contract source code if available',
          'Verify contract is from trusted source',
          'Consider revoking if suspicious',
        ],
        estimatedTime: '15-30 minutes',
        priority: 7,
      });
    }

    return recommendations;
  }

  /**
   * Generate general security recommendations
   */
  private generateGeneralRecommendations(context: RecommendationContext): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    if (context.riskLevel === 'critical') {
      recommendations.push({
        id: 'immediate-action',
        category: 'general',
        severity: 'critical',
        title: 'Immediate Security Action Required',
        description: 'Your wallet has critical security risks. Take immediate action.',
        action: 'Address all critical security issues immediately',
        actionSteps: [
          'Review all critical recommendations',
          'Revoke suspicious approvals',
          'Transfer funds to a new wallet if compromised',
          'Enable additional security measures',
        ],
        estimatedTime: '1-2 hours',
        priority: 10,
      });
    }

    if (!context.hasENS) {
      recommendations.push({
        id: 'setup-ens',
        category: 'general',
        severity: 'low',
        title: 'Consider Setting Up ENS Domain',
        description: 'An ENS domain can improve wallet security and make it easier to verify ownership.',
        action: 'Set up an ENS domain for your wallet',
        actionSteps: [
          'Search for available ENS domain',
          'Register domain',
          'Set reverse record',
          'Use ENS for transactions when possible',
        ],
        estimatedTime: '10-15 minutes',
        priority: 3,
      });
    }

    if (!context.multiSig && context.riskScore < 80) {
      recommendations.push({
        id: 'consider-multisig',
        category: 'general',
        severity: 'low',
        title: 'Consider Multi-Signature Wallet',
        description: 'For high-value wallets, consider using a multi-signature wallet for added security.',
        action: 'Set up a multi-signature wallet',
        actionSteps: [
          'Research multi-sig solutions (Gnosis Safe, Argent)',
          'Set up wallet with trusted co-signers',
          'Transfer funds gradually',
          'Test recovery process',
        ],
        estimatedTime: '1-2 hours',
        priority: 4,
      });
    }

    return recommendations;
  }

  /**
   * Generate privacy recommendations
   */
  private generatePrivacyRecommendations(context: RecommendationContext): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    recommendations.push({
      id: 'use-privacy-tools',
      category: 'privacy',
      severity: 'low',
      title: 'Use Privacy Tools',
      description: 'Consider using privacy tools like Tornado Cash or similar for sensitive transactions.',
      action: 'Research and use privacy tools when needed',
      actionSteps: [
        'Research privacy tools for your chain',
        'Understand legal implications',
        'Use for sensitive transactions only',
        'Follow best practices',
      ],
      estimatedTime: '30-60 minutes',
      priority: 3,
    });

    return recommendations;
  }

  /**
   * Generate backup recommendations
   */
  private generateBackupRecommendations(context: RecommendationContext): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    recommendations.push({
      id: 'secure-backup',
      category: 'backup',
      severity: 'high',
      title: 'Secure Your Recovery Phrase',
      description: 'Ensure your recovery phrase is stored securely and never stored digitally.',
      action: 'Verify recovery phrase backup security',
      actionSteps: [
        'Verify recovery phrase is written down',
        'Store in secure physical location',
        'Never store digitally or in cloud',
        'Consider using hardware wallet',
        'Test recovery process',
      ],
      estimatedTime: '30 minutes',
      priority: 9,
    });

    return recommendations;
  }

  /**
   * Get recommendations by severity
   */
  getRecommendationsBySeverity(
    severity: SecurityRecommendation['severity'],
    context: RecommendationContext
  ): SecurityRecommendation[] {
    const report = this.generateRecommendations(context);
    return report.recommendations.filter(r => r.severity === severity);
  }

  /**
   * Get recommendations by category
   */
  getRecommendationsByCategory(
    category: SecurityRecommendation['category'],
    context: RecommendationContext
  ): SecurityRecommendation[] {
    const report = this.generateRecommendations(context);
    return report.recommendations.filter(r => r.category === category);
  }

  /**
   * Calculate total estimated time
   */
  private calculateTotalTime(recommendations: SecurityRecommendation[]): string {
    let totalMinutes = 0;

    recommendations.forEach(rec => {
      const timeStr = rec.estimatedTime;
      if (timeStr.includes('minute')) {
        const match = timeStr.match(/(\d+)/);
        if (match) totalMinutes += parseInt(match[1]);
      } else if (timeStr.includes('hour')) {
        const match = timeStr.match(/(\d+)/);
        if (match) totalMinutes += parseInt(match[1]) * 60;
      }
    });

    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
    }
  }
}

// Singleton instance
export const securityRecommendationsEngine = new SecurityRecommendationsEngine();
