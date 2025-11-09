/**
 * Wallet Health Report Generator Utility
 * Generate comprehensive wallet health reports
 */

import type { WalletScanResult } from '@wallet-health/types';

export interface HealthReport {
  walletAddress: string;
  chainId: number;
  generatedAt: number;
  reportVersion: string;
  summary: {
    overallScore: number;
    riskLevel: 'safe' | 'moderate' | 'critical';
    totalApprovals: number;
    riskyApprovals: number;
    totalAlerts: number;
    criticalAlerts: number;
  };
  securityAnalysis: {
    approvalHealth: {
      score: number;
      unlimitedApprovals: number;
      riskyApprovals: number;
      recommendations: string[];
    };
    tokenHealth: {
      score: number;
      spamTokens: number;
      phishingTokens: number;
      recommendations: string[];
    };
    contractHealth: {
      score: number;
      unverifiedContracts: number;
      newContracts: number;
      recommendations: string[];
    };
  };
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
  }>;
  trends?: {
    scoreHistory: Array<{ timestamp: number; score: number }>;
    approvalHistory: Array<{ timestamp: number; count: number }>;
  };
  metadata: {
    scanCount: number;
    firstScan?: number;
    lastScan?: number;
  };
}

export interface ReportOptions {
  includeTrends?: boolean;
  includeDetailedAnalysis?: boolean;
  format?: 'json' | 'markdown' | 'html' | 'pdf';
  language?: 'en' | 'es' | 'fr' | 'de';
}

export class WalletHealthReportGenerator {
  private readonly REPORT_VERSION = '1.0.0';

  /**
   * Generate comprehensive health report
   */
  generateReport(
    scanResults: WalletScanResult[],
    options: ReportOptions = {}
  ): HealthReport {
    const latestScan = scanResults[scanResults.length - 1];
    if (!latestScan) {
      throw new Error('No scan results provided');
    }

    const summary = this.generateSummary(scanResults);
    const securityAnalysis = this.generateSecurityAnalysis(latestScan);
    const recommendations = this.generateRecommendations(latestScan, securityAnalysis);

    const report: HealthReport = {
      walletAddress: latestScan.address,
      chainId: latestScan.chainId,
      generatedAt: Date.now(),
      reportVersion: this.REPORT_VERSION,
      summary,
      securityAnalysis,
      recommendations,
      metadata: {
        scanCount: scanResults.length,
        firstScan: scanResults[0]?.timestamp,
        lastScan: latestScan.timestamp,
      },
    };

    if (options.includeTrends && scanResults.length > 1) {
      report.trends = this.generateTrends(scanResults);
    }

    return report;
  }

  /**
   * Generate summary
   */
  private generateSummary(scanResults: WalletScanResult[]): HealthReport['summary'] {
    const latestScan = scanResults[scanResults.length - 1];
    const riskyApprovals = latestScan.approvals?.filter(
      a => a.isRisky || a.isUnlimited
    ).length || 0;
    const criticalAlerts = latestScan.alerts?.filter(
      a => a.severity === 'critical'
    ).length || 0;

    return {
      overallScore: latestScan.score,
      riskLevel: latestScan.riskLevel as 'safe' | 'moderate' | 'critical',
      totalApprovals: latestScan.approvals?.length || 0,
      riskyApprovals,
      totalAlerts: latestScan.alerts?.length || 0,
      criticalAlerts,
    };
  }

  /**
   * Generate security analysis
   */
  private generateSecurityAnalysis(
    scanResult: WalletScanResult
  ): HealthReport['securityAnalysis'] {
    const approvals = scanResult.approvals || [];
    const unlimitedApprovals = approvals.filter(a => a.isUnlimited).length;
    const riskyApprovals = approvals.filter(a => a.isRisky).length;

    // Calculate approval health score
    let approvalScore = 100;
    approvalScore -= unlimitedApprovals * 20;
    approvalScore -= riskyApprovals * 10;
    if (approvals.length > 20) approvalScore -= 10;
    approvalScore = Math.max(0, Math.min(100, approvalScore));

    // Token health
    const tokens = scanResult.tokens || [];
    const spamTokens = tokens.filter(t => t.isSpam).length;
    const phishingTokens = tokens.filter(t => t.isPhishing).length;

    let tokenScore = 100;
    tokenScore -= phishingTokens * 50;
    tokenScore -= spamTokens * 10;
    tokenScore = Math.max(0, Math.min(100, tokenScore));

    // Contract health (would need contract data)
    const contractScore = 85; // Placeholder

    return {
      approvalHealth: {
        score: approvalScore,
        unlimitedApprovals,
        riskyApprovals,
        recommendations: this.getApprovalRecommendations(approvals),
      },
      tokenHealth: {
        score: tokenScore,
        spamTokens,
        phishingTokens,
        recommendations: this.getTokenRecommendations(tokens),
      },
      contractHealth: {
        score: contractScore,
        unverifiedContracts: 0, // Would need contract data
        newContracts: 0,
        recommendations: [],
      },
    };
  }

  /**
   * Get approval recommendations
   */
  private getApprovalRecommendations(approvals: WalletScanResult['approvals']): string[] {
    const recommendations: string[] = [];
    const unlimited = approvals?.filter(a => a.isUnlimited).length || 0;
    const risky = approvals?.filter(a => a.isRisky).length || 0;

    if (unlimited > 0) {
      recommendations.push(`Revoke ${unlimited} unlimited approval(s) immediately`);
    }
    if (risky > 0) {
      recommendations.push(`Review ${risky} risky approval(s)`);
    }
    if ((approvals?.length || 0) > 20) {
      recommendations.push('Consider cleaning up unused approvals');
    }

    return recommendations;
  }

  /**
   * Get token recommendations
   */
  private getTokenRecommendations(tokens: WalletScanResult['tokens']): string[] {
    const recommendations: string[] = [];
    const phishing = tokens?.filter(t => t.isPhishing).length || 0;
    const spam = tokens?.filter(t => t.isSpam).length || 0;

    if (phishing > 0) {
      recommendations.push(`⚠️ CRITICAL: Remove ${phishing} phishing token(s) immediately`);
    }
    if (spam > 0) {
      recommendations.push(`Hide or remove ${spam} spam token(s)`);
    }

    return recommendations;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    scanResult: WalletScanResult,
    securityAnalysis: HealthReport['securityAnalysis']
  ): HealthReport['recommendations'] {
    const recommendations: HealthReport['recommendations'] = [];

    // Critical recommendations
    if (securityAnalysis.approvalHealth.unlimitedApprovals > 0) {
      recommendations.push({
        priority: 'critical',
        title: 'Revoke Unlimited Approvals',
        description: `You have ${securityAnalysis.approvalHealth.unlimitedApprovals} unlimited approval(s)`,
        action: 'Use the approval revoker to revoke these approvals immediately',
      });
    }

    if (securityAnalysis.tokenHealth.phishingTokens > 0) {
      recommendations.push({
        priority: 'critical',
        title: 'Remove Phishing Tokens',
        description: `You have ${securityAnalysis.tokenHealth.phishingTokens} phishing token(s)`,
        action: 'Hide or remove these tokens - do not interact with them',
      });
    }

    // High priority
    if (securityAnalysis.approvalHealth.riskyApprovals > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Review Risky Approvals',
        description: `You have ${securityAnalysis.approvalHealth.riskyApprovals} risky approval(s)`,
        action: 'Review each approval and revoke if not needed',
      });
    }

    // Medium priority
    if (securityAnalysis.tokenHealth.spamTokens > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Clean Up Spam Tokens',
        description: `You have ${securityAnalysis.tokenHealth.spamTokens} spam token(s)`,
        action: 'Hide spam tokens to improve wallet hygiene',
      });
    }

    // Low priority
    if (scanResult.score >= 80) {
      recommendations.push({
        priority: 'low',
        title: 'Enable Real-time Monitoring',
        description: 'Your wallet is healthy. Enable monitoring to stay protected',
        action: 'Enable real-time monitoring in settings',
      });
    }

    return recommendations;
  }

  /**
   * Generate trends
   */
  private generateTrends(scanResults: WalletScanResult[]): HealthReport['trends'] {
    const scoreHistory = scanResults.map(scan => ({
      timestamp: scan.timestamp,
      score: scan.score,
    }));

    const approvalHistory = scanResults.map(scan => ({
      timestamp: scan.timestamp,
      count: scan.approvals?.length || 0,
    }));

    return {
      scoreHistory,
      approvalHistory,
    };
  }

  /**
   * Export report as markdown
   */
  exportAsMarkdown(report: HealthReport): string {
    let md = `# Wallet Health Report\n\n`;
    md += `**Wallet:** \`${report.walletAddress}\`\n`;
    md += `**Chain ID:** ${report.chainId}\n`;
    md += `**Generated:** ${new Date(report.generatedAt).toLocaleString()}\n\n`;

    md += `## Summary\n\n`;
    md += `- **Overall Score:** ${report.summary.overallScore}/100\n`;
    md += `- **Risk Level:** ${report.summary.riskLevel.toUpperCase()}\n`;
    md += `- **Total Approvals:** ${report.summary.totalApprovals}\n`;
    md += `- **Risky Approvals:** ${report.summary.riskyApprovals}\n`;
    md += `- **Total Alerts:** ${report.summary.totalAlerts}\n`;
    md += `- **Critical Alerts:** ${report.summary.criticalAlerts}\n\n`;

    md += `## Security Analysis\n\n`;
    md += `### Approval Health: ${report.securityAnalysis.approvalHealth.score}/100\n`;
    md += `- Unlimited Approvals: ${report.securityAnalysis.approvalHealth.unlimitedApprovals}\n`;
    md += `- Risky Approvals: ${report.securityAnalysis.approvalHealth.riskyApprovals}\n\n`;

    md += `### Token Health: ${report.securityAnalysis.tokenHealth.score}/100\n`;
    md += `- Spam Tokens: ${report.securityAnalysis.tokenHealth.spamTokens}\n`;
    md += `- Phishing Tokens: ${report.securityAnalysis.tokenHealth.phishingTokens}\n\n`;

    md += `## Recommendations\n\n`;
    report.recommendations.forEach((rec, index) => {
      md += `${index + 1}. **[${rec.priority.toUpperCase()}]** ${rec.title}\n`;
      md += `   - ${rec.description}\n`;
      md += `   - Action: ${rec.action}\n\n`;
    });

    return md;
  }

  /**
   * Export report as JSON
   */
  exportAsJSON(report: HealthReport): string {
    return JSON.stringify(report, null, 2);
  }
}

// Singleton instance
export const walletHealthReportGenerator = new WalletHealthReportGenerator();

