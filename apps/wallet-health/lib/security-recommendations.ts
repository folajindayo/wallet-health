/**
 * Security Recommendations Engine
 * Generate actionable security recommendations based on wallet analysis
 */

export interface SecurityRecommendation {
  id: string;
  type: 'approval' | 'token' | 'contract' | 'general' | 'defi' | 'nft';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: string;
  estimatedTime: string;
  relatedAddresses?: string[];
  relatedTokens?: string[];
  priority: number;
}

export interface RecommendationContext {
  approvals: Array<{
    token: string;
    spender: string;
    isUnlimited: boolean;
    isRisky: boolean;
    lastUsed?: number;
  }>;
  tokens: Array<{
    address: string;
    symbol: string;
    isSpam?: boolean;
    isPhishing?: boolean;
  }>;
  contracts: Array<{
    address: string;
    isVerified: boolean;
    isNew: boolean;
    riskScore?: number;
  }>;
  riskScore: number;
  alerts: Array<{
    severity: string;
    type: string;
  }>;
}

export class SecurityRecommendationsEngine {
  /**
   * Generate recommendations based on context
   */
  generateRecommendations(context: RecommendationContext): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    // Analyze approvals
    recommendations.push(...this.analyzeApprovals(context.approvals));

    // Analyze tokens
    recommendations.push(...this.analyzeTokens(context.tokens));

    // Analyze contracts
    recommendations.push(...this.analyzeContracts(context.contracts));

    // General recommendations based on risk score
    recommendations.push(...this.generateGeneralRecommendations(context));

    // Sort by priority (severity + impact)
    recommendations.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.priority - a.priority;
    });

    return recommendations;
  }

  /**
   * Analyze token approvals
   */
  private analyzeApprovals(approvals: RecommendationContext['approvals']): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    const unlimitedApprovals = approvals.filter(a => a.isUnlimited);
    if (unlimitedApprovals.length > 0) {
      recommendations.push({
        id: `rec-approval-unlimited-${Date.now()}`,
        type: 'approval',
        severity: 'critical',
        title: 'Revoke Unlimited Token Approvals',
        description: `You have ${unlimitedApprovals.length} unlimited token approval(s). These allow contracts to spend unlimited amounts of your tokens.`,
        action: 'Review and revoke unlimited approvals using the approval revoker tool.',
        impact: 'High - Eliminates risk of unlimited token drain',
        estimatedTime: '5-10 minutes',
        relatedAddresses: unlimitedApprovals.map(a => a.spender),
        relatedTokens: unlimitedApprovals.map(a => a.token),
        priority: 100,
      });
    }

    const riskyApprovals = approvals.filter(a => a.isRisky && !a.isUnlimited);
    if (riskyApprovals.length > 0) {
      recommendations.push({
        id: `rec-approval-risky-${Date.now()}`,
        type: 'approval',
        severity: 'high',
        title: 'Review Risky Token Approvals',
        description: `You have ${riskyApprovals.length} approval(s) to potentially risky contracts.`,
        action: 'Review each approval and revoke if not needed.',
        impact: 'Medium - Reduces exposure to risky contracts',
        estimatedTime: '10-15 minutes',
        relatedAddresses: riskyApprovals.map(a => a.spender),
        relatedTokens: riskyApprovals.map(a => a.token),
        priority: 80,
      });
    }

    const unusedApprovals = approvals.filter(a => {
      if (!a.lastUsed) return false;
      const daysSinceUse = (Date.now() - a.lastUsed) / (24 * 60 * 60 * 1000);
      return daysSinceUse > 90;
    });

    if (unusedApprovals.length > 0) {
      recommendations.push({
        id: `rec-approval-unused-${Date.now()}`,
        type: 'approval',
        severity: 'low',
        title: 'Clean Up Unused Approvals',
        description: `You have ${unusedApprovals.length} approval(s) that haven't been used in over 90 days.`,
        action: 'Revoke unused approvals to reduce attack surface.',
        impact: 'Low - Improves wallet hygiene',
        estimatedTime: '5 minutes',
        relatedAddresses: unusedApprovals.map(a => a.spender),
        relatedTokens: unusedApprovals.map(a => a.token),
        priority: 40,
      });
    }

    if (approvals.length > 20) {
      recommendations.push({
        id: `rec-approval-too-many-${Date.now()}`,
        type: 'approval',
        severity: 'medium',
        title: 'Too Many Active Approvals',
        description: `You have ${approvals.length} active approvals. Consider reviewing and cleaning up unnecessary ones.`,
        action: 'Use the approval optimizer to identify and revoke unnecessary approvals.',
        impact: 'Medium - Reduces complexity and attack surface',
        estimatedTime: '15-20 minutes',
        priority: 60,
      });
    }

    return recommendations;
  }

  /**
   * Analyze tokens
   */
  private analyzeTokens(tokens: RecommendationContext['tokens']): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    const spamTokens = tokens.filter(t => t.isSpam);
    if (spamTokens.length > 0) {
      recommendations.push({
        id: `rec-token-spam-${Date.now()}`,
        type: 'token',
        severity: 'high',
        title: 'Remove Spam Tokens',
        description: `You have ${spamTokens.length} spam token(s) in your wallet. These are often used for phishing.`,
        action: 'Hide or remove spam tokens from your wallet view.',
        impact: 'Medium - Reduces phishing risk',
        estimatedTime: '2 minutes',
        relatedTokens: spamTokens.map(t => t.address),
        priority: 70,
      });
    }

    const phishingTokens = tokens.filter(t => t.isPhishing);
    if (phishingTokens.length > 0) {
      recommendations.push({
        id: `rec-token-phishing-${Date.now()}`,
        type: 'token',
        severity: 'critical',
        title: '⚠️ CRITICAL: Remove Phishing Tokens',
        description: `You have ${phishingTokens.length} phishing token(s). DO NOT interact with these tokens.`,
        action: 'Immediately hide these tokens and never approve or interact with them.',
        impact: 'Critical - Prevents potential token theft',
        estimatedTime: '1 minute',
        relatedTokens: phishingTokens.map(t => t.address),
        priority: 100,
      });
    }

    return recommendations;
  }

  /**
   * Analyze contracts
   */
  private analyzeContracts(contracts: RecommendationContext['contracts']): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    const unverifiedContracts = contracts.filter(c => !c.isVerified);
    if (unverifiedContracts.length > 0) {
      recommendations.push({
        id: `rec-contract-unverified-${Date.now()}`,
        type: 'contract',
        severity: 'high',
        title: 'Review Unverified Contracts',
        description: `You have interactions with ${unverifiedContracts.length} unverified contract(s). Unverified contracts cannot be audited.`,
        action: 'Review each contract and revoke approvals if not needed.',
        impact: 'High - Reduces risk from unaudited contracts',
        estimatedTime: '15-20 minutes',
        relatedAddresses: unverifiedContracts.map(c => c.address),
        priority: 85,
      });
    }

    const newContracts = contracts.filter(c => c.isNew);
    if (newContracts.length > 0) {
      recommendations.push({
        id: `rec-contract-new-${Date.now()}`,
        type: 'contract',
        severity: 'medium',
        title: 'Exercise Caution with New Contracts',
        description: `You have interactions with ${newContracts.length} recently deployed contract(s). New contracts may have undiscovered vulnerabilities.`,
        action: 'Monitor these contracts closely and consider revoking approvals until they are proven safe.',
        impact: 'Medium - Reduces exposure to new contracts',
        estimatedTime: '10 minutes',
        relatedAddresses: newContracts.map(c => c.address),
        priority: 65,
      });
    }

    const highRiskContracts = contracts.filter(c => c.riskScore && c.riskScore > 80);
    if (highRiskContracts.length > 0) {
      recommendations.push({
        id: `rec-contract-high-risk-${Date.now()}`,
        type: 'contract',
        severity: 'critical',
        title: 'High-Risk Contracts Detected',
        description: `You have interactions with ${highRiskContracts.length} high-risk contract(s).`,
        action: 'Immediately review and revoke all approvals to these contracts.',
        impact: 'Critical - Prevents potential exploits',
        estimatedTime: '5 minutes',
        relatedAddresses: highRiskContracts.map(c => c.address),
        priority: 95,
      });
    }

    return recommendations;
  }

  /**
   * Generate general recommendations
   */
  private generateGeneralRecommendations(context: RecommendationContext): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    if (context.riskScore < 50) {
      recommendations.push({
        id: `rec-general-critical-${Date.now()}`,
        type: 'general',
        severity: 'critical',
        title: '⚠️ CRITICAL: Immediate Action Required',
        description: 'Your wallet has a critical risk score. Immediate action is required to secure your assets.',
        action: 'Review all recommendations and take immediate action on critical items.',
        impact: 'Critical - Prevents potential loss of funds',
        estimatedTime: '30-60 minutes',
        priority: 100,
      });
    } else if (context.riskScore < 70) {
      recommendations.push({
        id: `rec-general-moderate-${Date.now()}`,
        type: 'general',
        severity: 'medium',
        title: 'Moderate Risk Detected',
        description: 'Your wallet has some security concerns that should be addressed.',
        action: 'Review and address the recommendations listed above.',
        impact: 'Medium - Improves overall security',
        estimatedTime: '20-30 minutes',
        priority: 50,
      });
    }

    const criticalAlerts = context.alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push({
        id: `rec-general-alerts-${Date.now()}`,
        type: 'general',
        severity: 'critical',
        title: 'Critical Alerts Require Attention',
        description: `You have ${criticalAlerts.length} critical alert(s) that need immediate attention.`,
        action: 'Review all critical alerts and take appropriate action.',
        impact: 'Critical - Addresses immediate security threats',
        estimatedTime: '15-30 minutes',
        priority: 90,
      });
    }

    recommendations.push({
      id: `rec-general-monitoring-${Date.now()}`,
      type: 'general',
      severity: 'low',
      title: 'Enable Real-time Monitoring',
      description: 'Enable real-time wallet monitoring to receive instant alerts for suspicious activity.',
      action: 'Enable monitoring in your wallet settings.',
      impact: 'Low - Provides ongoing security monitoring',
      estimatedTime: '2 minutes',
      priority: 30,
    });

    return recommendations;
  }

  /**
   * Get recommendation by ID
   */
  getRecommendation(id: string, context: RecommendationContext): SecurityRecommendation | null {
    const recommendations = this.generateRecommendations(context);
    return recommendations.find(r => r.id === id) || null;
  }

  /**
   * Get recommendations by type
   */
  getRecommendationsByType(
    type: SecurityRecommendation['type'],
    context: RecommendationContext
  ): SecurityRecommendation[] {
    return this.generateRecommendations(context).filter(r => r.type === type);
  }

  /**
   * Get recommendations by severity
   */
  getRecommendationsBySeverity(
    severity: SecurityRecommendation['severity'],
    context: RecommendationContext
  ): SecurityRecommendation[] {
    return this.generateRecommendations(context).filter(r => r.severity === severity);
  }
}

// Singleton instance
export const securityRecommendationsEngine = new SecurityRecommendationsEngine();

