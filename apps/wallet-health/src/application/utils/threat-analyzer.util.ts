/**
 * Threat Analyzer Utility
 */

export class ThreatAnalyzer {
  static categorizeThreat(type: string): {
    category: string;
    description: string;
  } {
    const categories: Record<string, { category: string; description: string }> = {
      malicious_approval: {
        category: 'Token Approval',
        description: 'Potentially malicious token approval detected',
      },
      suspicious_contract: {
        category: 'Contract Interaction',
        description: 'Interaction with suspicious smart contract',
      },
      high_value_exposure: {
        category: 'Value at Risk',
        description: 'High value assets at risk',
      },
      phishing_risk: {
        category: 'Phishing',
        description: 'Potential phishing attempt detected',
      },
    };

    return categories[type] || { category: 'Unknown', description: 'Unknown threat type' };
  }

  static getThreatPriority(severity: string): number {
    const priorities: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return priorities[severity] || 0;
  }

  static sortThreatsBySeverity(threats: any[]): any[] {
    return [...threats].sort(
      (a, b) => this.getThreatPriority(b.severity) - this.getThreatPriority(a.severity)
    );
  }
}


