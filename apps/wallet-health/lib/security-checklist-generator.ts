/**
 * Security Checklist Generator Utility
 * Generate comprehensive security checklists for wallets
 */

export interface SecurityChecklist {
  walletAddress: string;
  generatedAt: number;
  categories: Array<{
    name: string;
    items: ChecklistItem[];
    completed: number;
    total: number;
    score: number; // 0-100
  }>;
  overallScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  recommendations: Array<{
    category: string;
    item: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
  }>;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  checked: boolean;
  action?: string;
  impact?: string;
}

export class SecurityChecklistGenerator {
  /**
   * Generate security checklist
   */
  generateChecklist(
    walletAddress: string,
    data: {
      approvals: Array<{
        isUnlimited: boolean;
        isRisky: boolean;
        lastUsed?: number;
      }>;
      tokens: Array<{
        isPhishing?: boolean;
        isSpam?: boolean;
      }>;
      contracts: Array<{
        isVerified: boolean;
        isNew: boolean;
        riskScore?: number;
      }>;
      practices?: {
        hasBackup?: boolean;
        usesHardwareWallet?: boolean;
        monitoringEnabled?: boolean;
      };
    }
  ): SecurityChecklist {
    const categories: SecurityChecklist['categories'] = [];

    // Approvals category
    const approvalsCategory = this.generateApprovalsChecklist(data.approvals);
    categories.push(approvalsCategory);

    // Tokens category
    const tokensCategory = this.generateTokensChecklist(data.tokens);
    categories.push(tokensCategory);

    // Contracts category
    const contractsCategory = this.generateContractsChecklist(data.contracts);
    categories.push(contractsCategory);

    // Practices category
    const practicesCategory = this.generatePracticesChecklist(data.practices || {});
    categories.push(practicesCategory);

    // Calculate overall score
    const overallScore = categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length;

    // Determine priority
    const priority = this.determinePriority(overallScore, categories);

    // Generate recommendations
    const recommendations = this.generateRecommendations(categories);

    return {
      walletAddress,
      generatedAt: Date.now(),
      categories,
      overallScore: Math.round(overallScore),
      priority,
      recommendations,
    };
  }

  /**
   * Generate approvals checklist
   */
  private generateApprovalsChecklist(approvals: Array<{
    isUnlimited: boolean;
    isRisky: boolean;
    lastUsed?: number;
  }>): SecurityChecklist['categories'][0] {
    const items: ChecklistItem[] = [];

    const unlimitedCount = approvals.filter(a => a.isUnlimited).length;
    const riskyCount = approvals.filter(a => a.isRisky && !a.isUnlimited).length;
    const unusedCount = approvals.filter(a => {
      if (!a.lastUsed) return false;
      const daysSinceUse = (Date.now() - a.lastUsed) / (24 * 60 * 60 * 1000);
      return daysSinceUse > 90;
    }).length;

    // Critical items
    if (unlimitedCount > 0) {
      items.push({
        id: 'approval-unlimited',
        title: `Revoke ${unlimitedCount} unlimited approval(s)`,
        description: 'Unlimited approvals allow contracts to drain tokens without limit',
        priority: 'critical',
        checked: unlimitedCount === 0,
        action: 'Use approval revoker to revoke unlimited approvals',
        impact: 'Eliminates unlimited exposure risk',
      });
    }

    if (riskyCount > 0) {
      items.push({
        id: 'approval-risky',
        title: `Review ${riskyCount} risky approval(s)`,
        description: 'Risky approvals may be exploited by malicious contracts',
        priority: 'high',
        checked: riskyCount === 0,
        action: 'Review each approval and revoke if not needed',
        impact: 'Reduces exposure to risky contracts',
      });
    }

    // Medium priority items
    if (unusedCount > 0) {
      items.push({
        id: 'approval-unused',
        title: `Clean up ${unusedCount} unused approval(s)`,
        description: 'Unused approvals increase attack surface',
        priority: 'medium',
        checked: unusedCount === 0,
        action: 'Revoke approvals not used in 90+ days',
        impact: 'Reduces attack surface',
      });
    }

    if (approvals.length > 20) {
      items.push({
        id: 'approval-too-many',
        title: 'Reduce number of active approvals',
        description: `You have ${approvals.length} active approvals`,
        priority: 'medium',
        checked: approvals.length <= 10,
        action: 'Review and consolidate approvals',
        impact: 'Reduces complexity and risk',
      });
    }

    // Low priority items
    items.push({
      id: 'approval-regular-review',
      title: 'Set up regular approval reviews',
      description: 'Review approvals monthly to maintain security',
      priority: 'low',
      checked: false,
      action: 'Enable monthly approval review reminders',
      impact: 'Maintains ongoing security',
    });

    const completed = items.filter(item => item.checked).length;
    const score = items.length > 0 ? (completed / items.length) * 100 : 100;

    return {
      name: 'Token Approvals',
      items,
      completed,
      total: items.length,
      score: Math.round(score),
    };
  }

  /**
   * Generate tokens checklist
   */
  private generateTokensChecklist(tokens: Array<{
    isPhishing?: boolean;
    isSpam?: boolean;
  }>): SecurityChecklist['categories'][0] {
    const items: ChecklistItem[] = [];

    const phishingCount = tokens.filter(t => t.isPhishing).length;
    const spamCount = tokens.filter(t => t.isSpam).length;

    if (phishingCount > 0) {
      items.push({
        id: 'token-phishing',
        title: `Remove ${phishingCount} phishing token(s) immediately`,
        description: 'Phishing tokens are used to steal funds',
        priority: 'critical',
        checked: phishingCount === 0,
        action: 'DO NOT interact with these tokens - remove them immediately',
        impact: 'Prevents potential token theft',
      });
    }

    if (spamCount > 0) {
      items.push({
        id: 'token-spam',
        title: `Remove ${spamCount} spam token(s)`,
        description: 'Spam tokens may be used for phishing',
        priority: 'medium',
        checked: spamCount === 0,
        action: 'Hide or remove spam tokens from wallet',
        impact: 'Reduces phishing risk',
      });
    }

    items.push({
      id: 'token-regular-audit',
      title: 'Regularly audit token holdings',
      description: 'Review tokens monthly for suspicious activity',
      priority: 'low',
      checked: false,
      action: 'Set up monthly token audit reminders',
      impact: 'Maintains token security',
    });

    const completed = items.filter(item => item.checked).length;
    const score = items.length > 0 ? (completed / items.length) * 100 : 100;

    return {
      name: 'Tokens',
      items,
      completed,
      total: items.length,
      score: Math.round(score),
    };
  }

  /**
   * Generate contracts checklist
   */
  private generateContractsChecklist(contracts: Array<{
    isVerified: boolean;
    isNew: boolean;
    riskScore?: number;
  }>): SecurityChecklist['categories'][0] {
    const items: ChecklistItem[] = [];

    const unverifiedCount = contracts.filter(c => !c.isVerified).length;
    const newCount = contracts.filter(c => c.isNew).length;
    const highRiskCount = contracts.filter(c => c.riskScore && c.riskScore > 80).length;

    if (highRiskCount > 0) {
      items.push({
        id: 'contract-high-risk',
        title: `Revoke approvals to ${highRiskCount} high-risk contract(s)`,
        description: 'High-risk contracts are likely to be exploited',
        priority: 'critical',
        checked: highRiskCount === 0,
        action: 'Immediately revoke all approvals to high-risk contracts',
        impact: 'Prevents potential exploits',
      });
    }

    if (unverifiedCount > 0) {
      items.push({
        id: 'contract-unverified',
        title: `Review ${unverifiedCount} unverified contract(s)`,
        description: 'Unverified contracts cannot be audited',
        priority: 'high',
        checked: unverifiedCount === 0,
        action: 'Review and revoke approvals to unverified contracts',
        impact: 'Reduces risk from unaudited contracts',
      });
    }

    if (newCount > 0) {
      items.push({
        id: 'contract-new',
        title: `Exercise caution with ${newCount} new contract(s)`,
        description: 'New contracts may have undiscovered vulnerabilities',
        priority: 'medium',
        checked: false,
        action: 'Monitor new contracts closely',
        impact: 'Reduces exposure to new contracts',
      });
    }

    const completed = items.filter(item => item.checked).length;
    const score = items.length > 0 ? (completed / items.length) * 100 : 100;

    return {
      name: 'Smart Contracts',
      items,
      completed,
      total: items.length,
      score: Math.round(score),
    };
  }

  /**
   * Generate practices checklist
   */
  private generatePracticesChecklist(practices: {
    hasBackup?: boolean;
    usesHardwareWallet?: boolean;
    monitoringEnabled?: boolean;
  }): SecurityChecklist['categories'][0] {
    const items: ChecklistItem[] = [];

    items.push({
      id: 'practice-backup',
      title: 'Create secure backup of recovery phrase',
      description: 'Backup is essential for wallet recovery',
      priority: 'high',
      checked: practices.hasBackup || false,
      action: 'Create encrypted backup in secure location',
      impact: 'Prevents permanent fund loss',
    });

    items.push({
      id: 'practice-hardware',
      title: 'Use hardware wallet for enhanced security',
      description: 'Hardware wallets provide better security than software wallets',
      priority: 'medium',
      checked: practices.usesHardwareWallet || false,
      action: 'Consider migrating to hardware wallet',
      impact: 'Significantly improves security',
    });

    items.push({
      id: 'practice-monitoring',
      title: 'Enable real-time wallet monitoring',
      description: 'Monitoring alerts you to suspicious activity',
      priority: 'medium',
      checked: practices.monitoringEnabled || false,
      action: 'Enable monitoring in wallet settings',
      impact: 'Provides ongoing security monitoring',
    });

    items.push({
      id: 'practice-education',
      title: 'Stay educated about Web3 security',
      description: 'Security best practices evolve',
      priority: 'low',
      checked: false,
      action: 'Follow security updates and best practices',
      impact: 'Maintains security awareness',
    });

    const completed = items.filter(item => item.checked).length;
    const score = items.length > 0 ? (completed / items.length) * 100 : 100;

    return {
      name: 'Security Practices',
      items,
      completed,
      total: items.length,
      score: Math.round(score),
    };
  }

  /**
   * Determine priority
   */
  private determinePriority(
    overallScore: number,
    categories: SecurityChecklist['categories']
  ): SecurityChecklist['priority'] {
    const criticalItems = categories.reduce(
      (sum, cat) => sum + cat.items.filter(item => item.priority === 'critical' && !item.checked).length,
      0
    );

    if (criticalItems > 0 || overallScore < 40) return 'critical';
    if (overallScore < 60) return 'high';
    if (overallScore < 80) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    categories: SecurityChecklist['categories']
  ): SecurityChecklist['recommendations'] {
    const recommendations: SecurityChecklist['recommendations'] = [];

    categories.forEach(category => {
      category.items.forEach(item => {
        if (!item.checked && item.action) {
          recommendations.push({
            category: category.name,
            item: item.title,
            priority: item.priority,
            action: item.action,
          });
        }
      });
    });

    // Sort by priority
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return recommendations;
  }

  /**
   * Export checklist as markdown
   */
  exportAsMarkdown(checklist: SecurityChecklist): string {
    let md = `# Security Checklist\n\n`;
    md += `**Wallet:** \`${checklist.walletAddress}\`\n`;
    md += `**Generated:** ${new Date(checklist.generatedAt).toLocaleString()}\n`;
    md += `**Overall Score:** ${checklist.overallScore}/100\n`;
    md += `**Priority:** ${checklist.priority.toUpperCase()}\n\n`;

    checklist.categories.forEach(category => {
      md += `## ${category.name} (${category.completed}/${category.total} - ${category.score}%)\n\n`;
      
      category.items.forEach(item => {
        const checkbox = item.checked ? '[x]' : '[ ]';
        md += `${checkbox} **${item.priority.toUpperCase()}** ${item.title}\n`;
        md += `   - ${item.description}\n`;
        if (item.action) {
          md += `   - Action: ${item.action}\n`;
        }
        md += `\n`;
      });
    });

    if (checklist.recommendations.length > 0) {
      md += `## Recommendations\n\n`;
      checklist.recommendations.forEach((rec, index) => {
        md += `${index + 1}. **[${rec.priority.toUpperCase()}]** ${rec.item}\n`;
        md += `   - Category: ${rec.category}\n`;
        md += `   - Action: ${rec.action}\n\n`;
      });
    }

    return md;
  }
}

// Singleton instance
export const securityChecklistGenerator = new SecurityChecklistGenerator();

