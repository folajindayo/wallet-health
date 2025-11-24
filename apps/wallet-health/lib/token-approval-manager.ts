/**
 * Token Approval Manager
 * Manage token approvals with batch operations and optimization
 */

export interface TokenApproval {
  tokenAddress: string;
  tokenSymbol: string;
  spenderAddress: string;
  spenderLabel?: string;
  allowance: string;
  allowanceFormatted: string; // Human readable
  isUnlimited: boolean;
  chainId: number;
  grantedAt?: number;
  lastUsedAt?: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ApprovalBatch {
  approvals: TokenApproval[];
  totalGasEstimate: number;
  estimatedCostUSD: number;
  operations: Array<{
    type: 'approve' | 'revoke' | 'update';
    tokenAddress: string;
    spenderAddress: string;
    newAllowance?: string;
  }>;
}

export interface ApprovalRecommendation {
  tokenAddress: string;
  tokenSymbol: string;
  spenderAddress: string;
  currentAllowance: string;
  recommendedAllowance: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: 'revoke' | 'reduce' | 'maintain' | 'increase';
}

export class TokenApprovalManager {
  private approvals: Map<string, TokenApproval[]> = new Map(); // walletAddress -> approvals

  /**
   * Add or update approvals
   */
  addApprovals(walletAddress: string, approvals: TokenApproval[]): void {
    const key = walletAddress.toLowerCase();
    const existing = this.approvals.get(key) || [];

    // Merge with existing approvals
    const merged = new Map<string, TokenApproval>();

    // Add existing approvals
    existing.forEach((approval) => {
      const approvalKey = `${approval.chainId}-${approval.tokenAddress}-${approval.spenderAddress}`;
      merged.set(approvalKey, approval);
    });

    // Update with new approvals
    approvals.forEach((approval) => {
      const approvalKey = `${approval.chainId}-${approval.tokenAddress}-${approval.spenderAddress}`;
      merged.set(approvalKey, {
        ...approval,
        grantedAt: approval.grantedAt || Date.now(),
      });
    });

    this.approvals.set(key, Array.from(merged.values()));
  }

  /**
   * Get approvals for a wallet
   */
  getApprovals(walletAddress: string, chainId?: number): TokenApproval[] {
    const key = walletAddress.toLowerCase();
    const allApprovals = this.approvals.get(key) || [];

    if (chainId) {
      return allApprovals.filter((a) => a.chainId === chainId);
    }

    return allApprovals;
  }

  /**
   * Get risky approvals
   */
  getRiskyApprovals(walletAddress: string, minRiskLevel: 'medium' | 'high' | 'critical' = 'medium'): TokenApproval[] {
    const approvals = this.getApprovals(walletAddress);
    const riskLevels = { medium: 1, high: 2, critical: 3 };
    const minLevel = riskLevels[minRiskLevel];

    return approvals.filter((approval) => {
      const level = riskLevels[approval.riskLevel] || 0;
      return level >= minLevel;
    });
  }

  /**
   * Generate batch revoke operations
   */
  generateBatchRevoke(
    walletAddress: string,
    approvalAddresses: Array<{ tokenAddress: string; spenderAddress: string; chainId: number }>
  ): ApprovalBatch {
    const approvals = this.getApprovals(walletAddress);
    const operations = approvalAddresses.map((addr) => ({
      type: 'revoke' as const,
      tokenAddress: addr.tokenAddress,
      spenderAddress: addr.spenderAddress,
    }));

    // Estimate gas (21000 base + 46000 per approval)
    const gasPerApproval = 46000;
    const baseGas = 21000;
    const totalGasEstimate = baseGas + operations.length * gasPerApproval;

    // Estimate cost (assuming 30 gwei, $2000 ETH)
    const gasPriceGwei = 30;
    const ethPriceUSD = 2000;
    const gasPriceWei = gasPriceGwei * 1e9;
    const costWei = BigInt(totalGasEstimate) * BigInt(Math.floor(gasPriceWei));
    const costEth = Number(costWei) / 1e18;
    const estimatedCostUSD = costEth * ethPriceUSD;

    return {
      approvals: approvals.filter((a) =>
        approvalAddresses.some(
          (addr) =>
            a.tokenAddress.toLowerCase() === addr.tokenAddress.toLowerCase() &&
            a.spenderAddress.toLowerCase() === addr.spenderAddress.toLowerCase() &&
            a.chainId === addr.chainId
        )
      ),
      totalGasEstimate,
      estimatedCostUSD: Math.round(estimatedCostUSD * 10000) / 10000,
      operations,
    };
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(walletAddress: string): ApprovalRecommendation[] {
    const approvals = this.getApprovals(walletAddress);
    const recommendations: ApprovalRecommendation[] = [];

    approvals.forEach((approval) => {
      // Check for unlimited approvals
      if (approval.isUnlimited) {
        recommendations.push({
          tokenAddress: approval.tokenAddress,
          tokenSymbol: approval.tokenSymbol,
          spenderAddress: approval.spenderAddress,
          currentAllowance: approval.allowanceFormatted,
          recommendedAllowance: 'Specific amount',
          reason: 'Unlimited approvals pose security risks',
          priority: 'high',
          action: 'reduce',
        });
      }

      // Check for unused approvals (older than 30 days)
      if (approval.lastUsedAt && Date.now() - approval.lastUsedAt > 30 * 24 * 60 * 60 * 1000) {
        recommendations.push({
          tokenAddress: approval.tokenAddress,
          tokenSymbol: approval.tokenSymbol,
          spenderAddress: approval.spenderAddress,
          currentAllowance: approval.allowanceFormatted,
          recommendedAllowance: '0',
          reason: 'Approval has not been used in 30+ days',
          priority: 'medium',
          action: 'revoke',
        });
      }

      // Check for high-risk approvals
      if (approval.riskLevel === 'critical' || approval.riskLevel === 'high') {
        recommendations.push({
          tokenAddress: approval.tokenAddress,
          tokenSymbol: approval.tokenSymbol,
          spenderAddress: approval.spenderAddress,
          currentAllowance: approval.allowanceFormatted,
          recommendedAllowance: '0',
          reason: `High risk approval detected (${approval.riskLevel})`,
          priority: 'critical',
          action: 'revoke',
        });
      }
    });

    // Sort by priority
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return recommendations;
  }

  /**
   * Calculate approval health score
   */
  calculateApprovalHealthScore(walletAddress: string): {
    score: number; // 0-100
    level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    factors: {
      totalApprovals: number;
      unlimitedApprovals: number;
      riskyApprovals: number;
      unusedApprovals: number;
    };
  } {
    const approvals = this.getApprovals(walletAddress);
    const unlimited = approvals.filter((a) => a.isUnlimited).length;
    const risky = approvals.filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical').length;
    const unused = approvals.filter(
      (a) => a.lastUsedAt && Date.now() - a.lastUsedAt > 30 * 24 * 60 * 60 * 1000
    ).length;

    let score = 100;

    // Deduct points for issues
    score -= Math.min(unlimited * 10, 40); // Max 40 points for unlimited
    score -= Math.min(risky * 15, 40); // Max 40 points for risky
    score -= Math.min(unused * 5, 20); // Max 20 points for unused

    // Deduct for total number of approvals
    if (approvals.length > 20) {
      score -= 10;
    } else if (approvals.length > 10) {
      score -= 5;
    }

    score = Math.max(0, Math.min(100, score));

    let level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (score >= 80) level = 'excellent';
    else if (score >= 60) level = 'good';
    else if (score >= 40) level = 'fair';
    else if (score >= 20) level = 'poor';
    else level = 'critical';

    return {
      score,
      level,
      factors: {
        totalApprovals: approvals.length,
        unlimitedApprovals: unlimited,
        riskyApprovals: risky,
        unusedApprovals: unused,
      },
    };
  }

  /**
   * Get approval statistics
   */
  getStatistics(walletAddress: string): {
    totalApprovals: number;
    byChain: Record<number, number>;
    byRiskLevel: Record<string, number>;
    unlimitedCount: number;
    totalAllowanceValueUSD: number; // Estimated
  } {
    const approvals = this.getApprovals(walletAddress);

    const byChain: Record<number, number> = {};
    const byRiskLevel: Record<string, number> = {};
    let unlimitedCount = 0;

    approvals.forEach((approval) => {
      byChain[approval.chainId] = (byChain[approval.chainId] || 0) + 1;
      byRiskLevel[approval.riskLevel] = (byRiskLevel[approval.riskLevel] || 0) + 1;
      if (approval.isUnlimited) {
        unlimitedCount++;
      }
    });

    return {
      totalApprovals: approvals.length,
      byChain,
      byRiskLevel,
      unlimitedCount,
      totalAllowanceValueUSD: 0, // Would need token prices to calculate
    };
  }

  /**
   * Remove approval
   */
  removeApproval(
    walletAddress: string,
    tokenAddress: string,
    spenderAddress: string,
    chainId: number
  ): boolean {
    const key = walletAddress.toLowerCase();
    const approvals = this.approvals.get(key) || [];

    const filtered = approvals.filter(
      (a) =>
        !(
          a.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() &&
          a.spenderAddress.toLowerCase() === spenderAddress.toLowerCase() &&
          a.chainId === chainId
        )
    );

    if (filtered.length !== approvals.length) {
      this.approvals.set(key, filtered);
      return true;
    }

    return false;
  }
}

// Singleton instance
export const tokenApprovalManager = new TokenApprovalManager();

