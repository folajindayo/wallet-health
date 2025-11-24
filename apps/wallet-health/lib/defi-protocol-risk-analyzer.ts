/**
 * DeFi Protocol Risk Analyzer Utility
 * Analyze DeFi protocol risks
 */

export interface DeFiProtocol {
  name: string;
  address: string;
  chainId: number;
  category: 'dex' | 'lending' | 'yield' | 'derivatives' | 'bridge' | 'other';
  tvl: number; // Total value locked (USD)
  auditStatus: 'audited' | 'unaudited' | 'in-progress';
  auditReports?: string[];
  bugBounty?: boolean;
  bugBountyAmount?: number; // USD
  isVerified: boolean;
  age: number; // days since launch
  hacks?: Array<{
    date: number;
    amount: number; // USD
    description: string;
  }>;
}

export interface RiskAnalysis {
  protocol: DeFiProtocol;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: string[];
  safetyScore: number; // 0-100 (inverse of risk)
}

export class DeFiProtocolRiskAnalyzer {
  private protocols: Map<string, DeFiProtocol> = new Map();

  /**
   * Add protocol
   */
  addProtocol(protocol: DeFiProtocol): void {
    const key = `${protocol.address.toLowerCase()}-${protocol.chainId}`;
    this.protocols.set(key, protocol);
  }

  /**
   * Analyze protocol risk
   */
  analyzeRisk(protocolAddress: string, chainId: number): RiskAnalysis | null {
    const key = `${protocolAddress.toLowerCase()}-${chainId}`;
    const protocol = this.protocols.get(key);
    if (!protocol) {
      return null;
    }

    let riskScore = 0;
    const riskFactors: RiskAnalysis['riskFactors'] = [];
    const recommendations: string[] = [];

    // Audit status
    if (protocol.auditStatus === 'unaudited') {
      riskScore += 30;
      riskFactors.push({
        factor: 'Unaudited Protocol',
        severity: 'high',
        description: 'Protocol has not been audited by security firms',
      });
      recommendations.push('Avoid unaudited protocols or use with extreme caution');
    } else if (protocol.auditStatus === 'in-progress') {
      riskScore += 15;
      riskFactors.push({
        factor: 'Audit In Progress',
        severity: 'medium',
        description: 'Protocol audit is still ongoing',
      });
    }

    // Bug bounty
    if (!protocol.bugBounty) {
      riskScore += 10;
      riskFactors.push({
        factor: 'No Bug Bounty',
        severity: 'medium',
        description: 'Protocol does not have a bug bounty program',
      });
    } else if (protocol.bugBountyAmount && protocol.bugBountyAmount < 10000) {
      riskScore += 5;
      riskFactors.push({
        factor: 'Low Bug Bounty',
        severity: 'low',
        description: `Bug bounty amount is relatively low: $${protocol.bugBountyAmount}`,
      });
    }

    // TVL
    if (protocol.tvl < 1000000) {
      riskScore += 15;
      riskFactors.push({
        factor: 'Low TVL',
        severity: 'medium',
        description: `Protocol has low TVL: $${protocol.tvl.toLocaleString()}`,
      });
    } else if (protocol.tvl > 100000000) {
      riskScore -= 5; // Reduce risk for high TVL
    }

    // Age
    if (protocol.age < 30) {
      riskScore += 20;
      riskFactors.push({
        factor: 'New Protocol',
        severity: 'high',
        description: `Protocol is very new: ${protocol.age} days old`,
      });
      recommendations.push('New protocols carry higher risk. Start with small amounts');
    } else if (protocol.age < 90) {
      riskScore += 10;
      riskFactors.push({
        factor: 'Recently Launched',
        severity: 'medium',
        description: `Protocol launched ${protocol.age} days ago`,
      });
    }

    // Hacks
    if (protocol.hacks && protocol.hacks.length > 0) {
      const totalHacked = protocol.hacks.reduce((sum, h) => sum + h.amount, 0);
      riskScore += Math.min(30, protocol.hacks.length * 10);
      riskFactors.push({
        factor: 'Previous Hacks',
        severity: 'high',
        description: `Protocol has been hacked ${protocol.hacks.length} time(s), total loss: $${totalHacked.toLocaleString()}`,
      });
      recommendations.push('Protocol has been hacked before. Use with extreme caution');
    }

    // Verification
    if (!protocol.isVerified) {
      riskScore += 15;
      riskFactors.push({
        factor: 'Unverified Contract',
        severity: 'high',
        description: 'Contract source code is not verified',
      });
    }

    // Determine overall risk
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore >= 70) {
      overallRisk = 'critical';
    } else if (riskScore >= 50) {
      overallRisk = 'high';
    } else if (riskScore >= 30) {
      overallRisk = 'medium';
    }

    // Calculate safety score (inverse of risk)
    const safetyScore = Math.max(0, 100 - riskScore);

    // Add general recommendations
    if (overallRisk !== 'low') {
      recommendations.push('Only invest what you can afford to lose');
      recommendations.push('Monitor protocol updates and security announcements');
    }

    return {
      protocol,
      overallRisk,
      riskScore: Math.min(100, Math.max(0, riskScore)),
      riskFactors,
      recommendations,
      safetyScore: Math.round(safetyScore * 100) / 100,
    };
  }

  /**
   * Get protocol
   */
  getProtocol(protocolAddress: string, chainId: number): DeFiProtocol | null {
    const key = `${protocolAddress.toLowerCase()}-${chainId}`;
    return this.protocols.get(key) || null;
  }

  /**
   * Compare protocols
   */
  compareProtocols(
    protocolAddresses: Array<{ address: string; chainId: number }>
  ): Array<{
    protocol: DeFiProtocol;
    analysis: RiskAnalysis;
  }> {
    return protocolAddresses
      .map(({ address, chainId }) => {
        const analysis = this.analyzeRisk(address, chainId);
        return analysis ? { protocol: analysis.protocol, analysis } : null;
      })
      .filter((item): item is { protocol: DeFiProtocol; analysis: RiskAnalysis } => item !== null)
      .sort((a, b) => a.analysis.riskScore - b.analysis.riskScore); // Lower risk first
  }

  /**
   * Get safe protocols
   */
  getSafeProtocols(
    category?: DeFiProtocol['category'],
    minSafetyScore = 70
  ): Array<{
    protocol: DeFiProtocol;
    analysis: RiskAnalysis;
  }> {
    const results: Array<{ protocol: DeFiProtocol; analysis: RiskAnalysis }> = [];

    this.protocols.forEach(protocol => {
      if (category && protocol.category !== category) {
        return;
      }

      const analysis = this.analyzeRisk(protocol.address, protocol.chainId);
      if (analysis && analysis.safetyScore >= minSafetyScore) {
        results.push({ protocol, analysis });
      }
    });

    return results.sort((a, b) => b.analysis.safetyScore - a.analysis.safetyScore);
  }

  /**
   * Clear protocols
   */
  clear(): void {
    this.protocols.clear();
  }
}

// Singleton instance
export const defiProtocolRiskAnalyzer = new DeFiProtocolRiskAnalyzer();

