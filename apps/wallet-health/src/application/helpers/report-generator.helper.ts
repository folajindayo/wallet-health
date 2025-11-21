/**
 * Report Generator Helper
 */

export class ReportGenerator {
  static generateSecurityReport(scan: any): string {
    const lines = [
      `Security Report for ${scan.walletAddress}`,
      `Scan Date: ${new Date(scan.timestamp).toLocaleString()}`,
      `Risk Score: ${scan.riskScore}/100`,
      `Risk Level: ${scan.riskLevel.toUpperCase()}`,
      '',
      'Threats Detected:',
    ];
    
    if (scan.threats.length === 0) {
      lines.push('  - No threats detected');
    } else {
      scan.threats.forEach((threat: any, i: number) => {
        lines.push(`  ${i + 1}. [${threat.severity}] ${threat.type}: ${threat.description}`);
      });
    }
    
    return lines.join('\n');
  }

  static generateSummary(scan: any): string {
    const criticalCount = scan.threats.filter((t: any) => t.severity === 'critical').length;
    const highCount = scan.threats.filter((t: any) => t.severity === 'high').length;
    
    if (criticalCount > 0) {
      return `${criticalCount} critical threat(s) detected. Immediate action required.`;
    }
    
    if (highCount > 0) {
      return `${highCount} high-severity threat(s) detected. Review recommended.`;
    }
    
    return 'No significant threats detected.';
  }
}

