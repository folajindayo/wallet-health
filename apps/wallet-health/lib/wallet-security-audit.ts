/**
 * Wallet Security Audit Utility
 * Comprehensive security audit and compliance checking
 */

export interface SecurityAuditResult {
  walletAddress: string;
  auditDate: number;
  overallScore: number; // 0-100
  riskLevel: 'safe' | 'moderate' | 'high' | 'critical';
  categories: {
    approvals: CategoryAudit;
    tokens: CategoryAudit;
    contracts: CategoryAudit;
    transactions: CategoryAudit;
    practices: CategoryAudit;
  };
  criticalIssues: SecurityIssue[];
  recommendations: SecurityRecommendation[];
  compliance: ComplianceCheck[];
}

export interface CategoryAudit {
  score: number;
  issues: SecurityIssue[];
  passed: number;
  failed: number;
  warnings: number;
}

export interface SecurityIssue {
  id: string;
  category: 'approval' | 'token' | 'contract' | 'transaction' | 'practice';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  evidence?: string[];
  remediation: string;
}

export interface SecurityRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  estimatedTime: string;
  impact: string;
}

export interface ComplianceCheck {
  standard: 'OWASP' | 'NIST' | 'CIS' | 'Custom';
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}

export class WalletSecurityAudit {
  /**
   * Perform comprehensive security audit
   */
  performAudit(
    walletAddress: string,
    data: {
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
      transactions: Array<{
        status: 'success' | 'failed';
        value: string;
        timestamp: number;
      }>;
      practices?: {
        hasBackup?: boolean;
        usesHardwareWallet?: boolean;
        multiSigEnabled?: boolean;
      };
    }
  ): SecurityAuditResult {
    const approvalsAudit = this.auditApprovals(data.approvals);
    const tokensAudit = this.auditTokens(data.tokens);
    const contractsAudit = this.auditContracts(data.contracts);
    const transactionsAudit = this.auditTransactions(data.transactions);
    const practicesAudit = this.auditPractices(data.practices || {});

    const allIssues = [
      ...approvalsAudit.issues,
      ...tokensAudit.issues,
      ...contractsAudit.issues,
      ...transactionsAudit.issues,
      ...practicesAudit.issues,
    ];

    const criticalIssues = allIssues.filter(i => i.severity === 'critical');
    const overallScore = this.calculateOverallScore([
      approvalsAudit,
      tokensAudit,
      contractsAudit,
      transactionsAudit,
      practicesAudit,
    ]);

    const riskLevel = this.determineRiskLevel(overallScore, criticalIssues.length);
    const recommendations = this.generateRecommendations(allIssues);
    const compliance = this.checkCompliance(allIssues);

    return {
      walletAddress,
      auditDate: Date.now(),
      overallScore,
      riskLevel,
      categories: {
        approvals: approvalsAudit,
        tokens: tokensAudit,
        contracts: contractsAudit,
        transactions: transactionsAudit,
        practices: practicesAudit,
      },
      criticalIssues,
      recommendations,
      compliance,
    };
  }

  /**
   * Audit token approvals
   */
  private auditApprovals(
    approvals: Array<{
      token: string;
      spender: string;
      isUnlimited: boolean;
      isRisky: boolean;
      lastUsed?: number;
    }>
  ): CategoryAudit {
    const issues: SecurityIssue[] = [];
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    // Check for unlimited approvals
    const unlimited = approvals.filter(a => a.isUnlimited);
    if (unlimited.length > 0) {
      issues.push({
        id: 'approval-unlimited',
        category: 'approval',
        severity: 'critical',
        title: 'Unlimited Token Approvals',
        description: `${unlimited.length} unlimited approval(s) detected`,
        impact: 'Unlimited approvals allow contracts to drain tokens without limit',
        evidence: unlimited.map(a => `${a.token} -> ${a.spender}`),
        remediation: 'Revoke unlimited approvals and set specific limits',
      });
      failed += unlimited.length;
    } else {
      passed++;
    }

    // Check for risky approvals
    const risky = approvals.filter(a => a.isRisky && !a.isUnlimited);
    if (risky.length > 0) {
      issues.push({
        id: 'approval-risky',
        category: 'approval',
        severity: 'high',
        title: 'Risky Token Approvals',
        description: `${risky.length} risky approval(s) detected`,
        impact: 'Risky approvals may be exploited by malicious contracts',
        evidence: risky.map(a => `${a.token} -> ${a.spender}`),
        remediation: 'Review and revoke risky approvals',
      });
      warnings += risky.length;
    }

    // Check for unused approvals
    const unused = approvals.filter(a => {
      if (!a.lastUsed) return false;
      const daysSinceUse = (Date.now() - a.lastUsed) / (24 * 60 * 60 * 1000);
      return daysSinceUse > 90;
    });

    if (unused.length > 0) {
      issues.push({
        id: 'approval-unused',
        category: 'approval',
        severity: 'low',
        title: 'Unused Approvals',
        description: `${unused.length} approval(s) not used in 90+ days`,
        impact: 'Unused approvals increase attack surface',
        remediation: 'Clean up unused approvals',
      });
    }

    // Check for too many approvals
    if (approvals.length > 20) {
      issues.push({
        id: 'approval-too-many',
        category: 'approval',
        severity: 'medium',
        title: 'Excessive Approvals',
        description: `${approvals.length} active approvals`,
        impact: 'Too many approvals increase complexity and risk',
        remediation: 'Review and consolidate approvals',
      });
      warnings++;
    }

    const score = this.calculateCategoryScore(approvals.length, failed, warnings);

    return {
      score,
      issues,
      passed,
      failed,
      warnings,
    };
  }

  /**
   * Audit tokens
   */
  private auditTokens(
    tokens: Array<{
      address: string;
      symbol: string;
      isSpam?: boolean;
      isPhishing?: boolean;
    }>
  ): CategoryAudit {
    const issues: SecurityIssue[] = [];
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    const phishing = tokens.filter(t => t.isPhishing);
    if (phishing.length > 0) {
      issues.push({
        id: 'token-phishing',
        category: 'token',
        severity: 'critical',
        title: 'Phishing Tokens Detected',
        description: `${phishing.length} phishing token(s) in wallet`,
        impact: 'Phishing tokens are used to steal funds',
        evidence: phishing.map(t => t.symbol),
        remediation: 'Immediately remove phishing tokens - DO NOT interact',
      });
      failed += phishing.length;
    } else {
      passed++;
    }

    const spam = tokens.filter(t => t.isSpam);
    if (spam.length > 0) {
      issues.push({
        id: 'token-spam',
        category: 'token',
        severity: 'medium',
        title: 'Spam Tokens Detected',
        description: `${spam.length} spam token(s) in wallet`,
        impact: 'Spam tokens may be used for phishing',
        evidence: spam.map(t => t.symbol),
        remediation: 'Remove spam tokens from wallet',
      });
      warnings += spam.length;
    }

    const score = this.calculateCategoryScore(tokens.length, failed, warnings);

    return {
      score,
      issues,
      passed,
      failed,
      warnings,
    };
  }

  /**
   * Audit contracts
   */
  private auditContracts(
    contracts: Array<{
      address: string;
      isVerified: boolean;
      isNew: boolean;
      riskScore?: number;
    }>
  ): CategoryAudit {
    const issues: SecurityIssue[] = [];
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    const unverified = contracts.filter(c => !c.isVerified);
    if (unverified.length > 0) {
      issues.push({
        id: 'contract-unverified',
        category: 'contract',
        severity: 'high',
        title: 'Unverified Contracts',
        description: `${unverified.length} unverified contract(s)`,
        impact: 'Unverified contracts cannot be audited',
        evidence: unverified.map(c => c.address),
        remediation: 'Review and revoke approvals to unverified contracts',
      });
      warnings += unverified.length;
    } else {
      passed++;
    }

    const newContracts = contracts.filter(c => c.isNew);
    if (newContracts.length > 0) {
      issues.push({
        id: 'contract-new',
        category: 'contract',
        severity: 'medium',
        title: 'New Contracts',
        description: `${newContracts.length} recently deployed contract(s)`,
        impact: 'New contracts may have undiscovered vulnerabilities',
        remediation: 'Exercise caution with new contracts',
      });
      warnings += newContracts.length;
    }

    const highRisk = contracts.filter(c => c.riskScore && c.riskScore > 80);
    if (highRisk.length > 0) {
      issues.push({
        id: 'contract-high-risk',
        category: 'contract',
        severity: 'critical',
        title: 'High-Risk Contracts',
        description: `${highRisk.length} high-risk contract(s)`,
        impact: 'High-risk contracts are likely to be exploited',
        remediation: 'Immediately revoke all approvals to high-risk contracts',
      });
      failed += highRisk.length;
    }

    const score = this.calculateCategoryScore(contracts.length, failed, warnings);

    return {
      score,
      issues,
      passed,
      failed,
      warnings,
    };
  }

  /**
   * Audit transactions
   */
  private auditTransactions(
    transactions: Array<{
      status: 'success' | 'failed';
      value: string;
      timestamp: number;
    }>
  ): CategoryAudit {
    const issues: SecurityIssue[] = [];
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    const failedTxs = transactions.filter(tx => tx.status === 'failed');
    const failureRate = transactions.length > 0
      ? (failedTxs.length / transactions.length) * 100
      : 0;

    if (failureRate > 20) {
      issues.push({
        id: 'transaction-high-failure',
        category: 'transaction',
        severity: 'medium',
        title: 'High Transaction Failure Rate',
        description: `${failureRate.toFixed(1)}% failure rate`,
        impact: 'Failed transactions waste gas and indicate issues',
        remediation: 'Review gas settings and transaction parameters',
      });
      warnings++;
    } else {
      passed++;
    }

    const score = this.calculateCategoryScore(transactions.length, failed, warnings);

    return {
      score,
      issues,
      passed,
      failed,
      warnings,
    };
  }

  /**
   * Audit security practices
   */
  private auditPractices(practices: {
    hasBackup?: boolean;
    usesHardwareWallet?: boolean;
    multiSigEnabled?: boolean;
  }): CategoryAudit {
    const issues: SecurityIssue[] = [];
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    if (!practices.hasBackup) {
      issues.push({
        id: 'practice-no-backup',
        category: 'practice',
        severity: 'high',
        title: 'No Backup Detected',
        description: 'Recovery phrase backup not confirmed',
        impact: 'Risk of permanent fund loss',
        remediation: 'Create secure backups of recovery phrase',
      });
      failed++;
    } else {
      passed++;
    }

    if (!practices.usesHardwareWallet) {
      issues.push({
        id: 'practice-no-hardware',
        category: 'practice',
        severity: 'medium',
        title: 'Not Using Hardware Wallet',
        description: 'Consider using hardware wallet for enhanced security',
        impact: 'Software wallets are more vulnerable',
        remediation: 'Consider migrating to hardware wallet',
      });
      warnings++;
    } else {
      passed++;
    }

    const score = this.calculateCategoryScore(3, failed, warnings);

    return {
      score,
      issues,
      passed,
      failed,
      warnings,
    };
  }

  /**
   * Calculate category score
   */
  private calculateCategoryScore(
    total: number,
    failed: number,
    warnings: number
  ): number {
    if (total === 0) return 100;

    let score = 100;
    score -= (failed / total) * 50;
    score -= (warnings / total) * 25;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(categories: CategoryAudit[]): number {
    const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
    return Math.round(totalScore / categories.length);
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(
    score: number,
    criticalIssues: number
  ): SecurityAuditResult['riskLevel'] {
    if (criticalIssues > 0 || score < 40) return 'critical';
    if (score < 60) return 'high';
    if (score < 80) return 'moderate';
    return 'safe';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(issues: SecurityIssue[]): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    const critical = issues.filter(i => i.severity === 'critical');
    critical.forEach(issue => {
      recommendations.push({
        priority: 'critical',
        title: issue.title,
        description: issue.description,
        action: issue.remediation,
        estimatedTime: '5-15 minutes',
        impact: issue.impact,
      });
    });

    const high = issues.filter(i => i.severity === 'high');
    high.forEach(issue => {
      recommendations.push({
        priority: 'high',
        title: issue.title,
        description: issue.description,
        action: issue.remediation,
        estimatedTime: '10-20 minutes',
        impact: issue.impact,
      });
    });

    return recommendations;
  }

  /**
   * Check compliance
   */
  private checkCompliance(issues: SecurityIssue[]): ComplianceCheck[] {
    const compliance: ComplianceCheck[] = [];

    // OWASP compliance
    const owaspIssues = issues.filter(i =>
      i.severity === 'critical' || i.severity === 'high'
    );
    compliance.push({
      standard: 'OWASP',
      passed: owaspIssues.length === 0,
      score: Math.max(0, 100 - owaspIssues.length * 20),
      issues: owaspIssues.map(i => i.title),
      recommendations: ['Address critical and high severity issues'],
    });

    return compliance;
  }
}

// Singleton instance
export const walletSecurityAudit = new WalletSecurityAudit();

