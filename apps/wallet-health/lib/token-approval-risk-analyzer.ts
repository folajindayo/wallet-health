/**
 * Token Approval Risk Analyzer Utility
 * Analyze risks of token approvals
 */

export interface TokenApproval {
  tokenAddress: string;
  tokenSymbol: string;
  spender: string;
  spenderLabel?: string;
  amount: string;
  amountUSD: number;
  chainId: number;
  grantedAt: number;
  lastUsed?: number;
  isRevoked: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ApprovalRiskAnalysis {
  approval: TokenApproval;
  riskScore: number; // 0-100
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: string[];
  spenderInfo?: {
    isContract: boolean;
    isVerified: boolean;
    reputation?: 'good' | 'neutral' | 'suspicious';
    interactions: number;
  };
}

export interface ApprovalSummary {
  totalApprovals: number;
  activeApprovals: number;
  revokedApprovals: number;
  totalApprovedValue: number; // USD
  highRiskApprovals: number;
  criticalRiskApprovals: number;
  byRiskLevel: Record<string, number>;
}

export class TokenApprovalRiskAnalyzer {
  private approvals: Map<string, TokenApproval[]> = new Map();
  private readonly UNLIMITED_THRESHOLD = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

  /**
   * Add approval
   */
  addApproval(approval: TokenApproval): void {
    const key = approval.tokenAddress.toLowerCase();
    if (!this.approvals.has(key)) {
      this.approvals.set(key, []);
    }

    this.approvals.get(key)!.push(approval);
  }

  /**
   * Analyze approval risk
   */
  analyzeRisk(approval: TokenApproval): ApprovalRiskAnalysis {
    let riskScore = 0;
    const riskFactors: ApprovalRiskAnalysis['riskFactors'] = [];
    const recommendations: string[] = [];

    // Check if unlimited approval
    const amountBigInt = BigInt(approval.amount);
    if (amountBigInt >= this.UNLIMITED_THRESHOLD) {
      riskScore += 40;
      riskFactors.push({
        factor: 'Unlimited Approval',
        severity: 'high',
        description: 'Approval amount is unlimited, posing significant risk',
      });
      recommendations.push('Revoke unlimited approval and set specific limits');
    }

    // Check approval amount vs wallet balance
    if (approval.amountUSD > 10000) {
      riskScore += 20;
      riskFactors.push({
        factor: 'High Approval Value',
        severity: 'medium',
        description: `Approval value is $${approval.amountUSD}, which is significant`,
      });
    }

    // Check if spender is unknown/unverified
    if (!approval.spenderLabel && !approval.spenderInfo?.isVerified) {
      riskScore += 25;
      riskFactors.push({
        factor: 'Unknown Spender',
        severity: 'high',
        description: 'Spender address is not verified or recognized',
      });
      recommendations.push('Verify spender address before approving');
    }

    // Check if approval is old and unused
    const daysSinceGrant = (Date.now() - approval.grantedAt) / (24 * 60 * 60 * 1000);
    if (daysSinceGrant > 90 && !approval.lastUsed) {
      riskScore += 15;
      riskFactors.push({
        factor: 'Stale Approval',
        severity: 'medium',
        description: 'Approval has been granted for a long time without use',
      });
      recommendations.push('Consider revoking unused approvals');
    }

    // Check spender reputation
    if (approval.spenderInfo?.reputation === 'suspicious') {
      riskScore += 30;
      riskFactors.push({
        factor: 'Suspicious Spender',
        severity: 'critical',
        description: 'Spender has suspicious reputation or history',
      });
      recommendations.push('Immediately revoke approval from suspicious spender');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore >= 70) {
      riskLevel = 'critical';
    } else if (riskScore >= 50) {
      riskLevel = 'high';
    } else if (riskScore >= 30) {
      riskLevel = 'medium';
    }

    return {
      approval,
      riskScore: Math.min(100, riskScore),
      riskFactors,
      recommendations,
      spenderInfo: approval.spenderInfo,
    };
  }

  /**
   * Get approvals for wallet
   */
  getApprovals(walletAddress: string, chainId?: number): TokenApproval[] {
    const allApprovals: TokenApproval[] = [];
    this.approvals.forEach(approvals => {
      allApprovals.push(...approvals);
    });

    let filtered = allApprovals;
    if (chainId) {
      filtered = filtered.filter(a => a.chainId === chainId);
    }

    return filtered;
  }

  /**
   * Get high-risk approvals
   */
  getHighRiskApprovals(walletAddress: string): ApprovalRiskAnalysis[] {
    const approvals = this.getApprovals(walletAddress);
    return approvals
      .map(a => this.analyzeRisk(a))
      .filter(analysis => analysis.riskScore >= 50)
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Get approval summary
   */
  getSummary(walletAddress: string): ApprovalSummary {
    const approvals = this.getApprovals(walletAddress);
    const activeApprovals = approvals.filter(a => !a.isRevoked);
    const revokedApprovals = approvals.filter(a => a.isRevoked);

    const totalApprovedValue = activeApprovals.reduce((sum, a) => sum + a.amountUSD, 0);

    const riskAnalyses = activeApprovals.map(a => this.analyzeRisk(a));
    const highRiskApprovals = riskAnalyses.filter(a => a.riskScore >= 50 && a.riskScore < 70).length;
    const criticalRiskApprovals = riskAnalyses.filter(a => a.riskScore >= 70).length;

    const byRiskLevel: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    riskAnalyses.forEach(analysis => {
      byRiskLevel[analysis.approval.riskLevel]++;
    });

    return {
      totalApprovals: approvals.length,
      activeApprovals: activeApprovals.length,
      revokedApprovals: revokedApprovals.length,
      totalApprovedValue: Math.round(totalApprovedValue * 100) / 100,
      highRiskApprovals,
      criticalRiskApprovals,
      byRiskLevel,
    };
  }

  /**
   * Revoke approval
   */
  revokeApproval(tokenAddress: string, spender: string, chainId: number): boolean {
    const approvals = this.approvals.get(tokenAddress.toLowerCase());
    if (!approvals) {
      return false;
    }

    const approval = approvals.find(
      a => a.spender.toLowerCase() === spender.toLowerCase() && a.chainId === chainId && !a.isRevoked
    );

    if (!approval) {
      return false;
    }

    approval.isRevoked = true;
    return true;
  }

  /**
   * Clear approvals
   */
  clear(walletAddress?: string): void {
    if (walletAddress) {
      // Would filter by wallet if we tracked wallet ownership
      this.approvals.clear();
    } else {
      this.approvals.clear();
    }
  }
}

// Singleton instance
export const tokenApprovalRiskAnalyzer = new TokenApprovalRiskAnalyzer();

