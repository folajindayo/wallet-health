/**
 * Token Approval Optimizer Utility
 * Suggests optimal approval amounts and helps manage approvals
 */

export interface ApprovalRecommendation {
  tokenAddress: string;
  tokenSymbol: string;
  currentAllowance: string;
  recommendedAllowance: string;
  reason: 'unlimited' | 'excessive' | 'expired' | 'unused' | 'optimal';
  priority: 'high' | 'medium' | 'low';
  action: 'revoke' | 'reduce' | 'maintain' | 'increase';
  estimatedGasCost?: number;
  savings?: {
    gas: number;
    risk: string;
  };
}

export interface ApprovalAnalysis {
  totalApprovals: number;
  unlimitedApprovals: number;
  excessiveApprovals: number;
  unusedApprovals: number;
  totalRiskValue: number; // USD value at risk
  recommendations: ApprovalRecommendation[];
  summary: {
    shouldRevoke: number;
    shouldReduce: number;
    shouldMaintain: number;
    totalGasSavings: number;
  };
}

export interface UsagePattern {
  tokenAddress: string;
  averageAmount: number;
  maxAmount: number;
  frequency: number; // transactions per month
  lastUsed: number;
}

export class ApprovalOptimizer {
  /**
   * Analyze approvals and generate recommendations
   */
  analyzeApprovals(
    approvals: Array<{
      token: string;
      tokenSymbol: string;
      spender: string;
      allowance: string;
      isUnlimited: boolean;
      lastUsed?: number;
    }>,
    usagePatterns?: UsagePattern[]
  ): ApprovalAnalysis {
    const recommendations: ApprovalRecommendation[] = [];
    let unlimitedCount = 0;
    let excessiveCount = 0;
    let unusedCount = 0;
    let totalRiskValue = 0;

    approvals.forEach(approval => {
      const pattern = usagePatterns?.find(
        p => p.tokenAddress.toLowerCase() === approval.token.toLowerCase()
      );

      let recommendation: ApprovalRecommendation | null = null;

      // Check for unlimited approvals
      if (approval.isUnlimited) {
        unlimitedCount++;
        const recommended = pattern
          ? (pattern.maxAmount * 1.5).toString() // 50% buffer
          : '0'; // Revoke if no usage pattern

        recommendation = {
          tokenAddress: approval.token,
          tokenSymbol: approval.tokenSymbol,
          currentAllowance: approval.allowance,
          recommendedAllowance: recommended,
          reason: 'unlimited',
          priority: 'high',
          action: recommended === '0' ? 'revoke' : 'reduce',
          estimatedGasCost: 46000, // Standard approval gas
          savings: {
            gas: 0,
            risk: 'Eliminates unlimited exposure risk',
          },
        };
      }
      // Check for excessive approvals
      else if (pattern) {
        const currentAmount = parseFloat(approval.allowance);
        const recommendedAmount = pattern.maxAmount * 1.5; // 50% buffer

        if (currentAmount > recommendedAmount * 2) {
          excessiveCount++;
          recommendation = {
            tokenAddress: approval.token,
            tokenSymbol: approval.tokenSymbol,
            currentAllowance: approval.allowance,
            recommendedAllowance: recommendedAmount.toString(),
            reason: 'excessive',
            priority: 'medium',
            action: 'reduce',
            estimatedGasCost: 46000,
            savings: {
              gas: 0,
              risk: `Reduces exposure from ${currentAmount} to ${recommendedAmount}`,
            },
          };
        }
      }
      // Check for unused approvals
      else if (approval.lastUsed) {
        const daysSinceUse = (Date.now() - approval.lastUsed) / (24 * 60 * 60 * 1000);
        if (daysSinceUse > 90) {
          unusedCount++;
          recommendation = {
            tokenAddress: approval.token,
            tokenSymbol: approval.tokenSymbol,
            currentAllowance: approval.allowance,
            recommendedAllowance: '0',
            reason: 'unused',
            priority: 'low',
            action: 'revoke',
            estimatedGasCost: 46000,
            savings: {
              gas: 0,
              risk: 'Removes unused approval',
            },
          };
        }
      }

      if (recommendation) {
        recommendations.push(recommendation);
        
        // Estimate risk value (simplified)
        const allowanceValue = parseFloat(approval.allowance);
        if (approval.isUnlimited || allowanceValue > 0) {
          totalRiskValue += allowanceValue; // Would need token price for accurate USD
        }
      }
    });

    // Sort recommendations by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    recommendations.sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    const shouldRevoke = recommendations.filter(r => r.action === 'revoke').length;
    const shouldReduce = recommendations.filter(r => r.action === 'reduce').length;
    const shouldMaintain = approvals.length - recommendations.length;

    // Estimate total gas savings (if revoking unused approvals)
    const totalGasSavings = shouldRevoke * 46000; // Gas per revocation

    return {
      totalApprovals: approvals.length,
      unlimitedApprovals: unlimitedCount,
      excessiveApprovals: excessiveCount,
      unusedApprovals: unusedCount,
      totalRiskValue,
      recommendations,
      summary: {
        shouldRevoke,
        shouldReduce,
        shouldMaintain,
        totalGasSavings,
      },
    };
  }

  /**
   * Calculate optimal approval amount based on usage
   */
  calculateOptimalApproval(usagePattern: UsagePattern, bufferPercent = 50): string {
    const buffer = 1 + bufferPercent / 100;
    const optimal = usagePattern.maxAmount * buffer;
    return optimal.toString();
  }

  /**
   * Batch optimize approvals
   */
  batchOptimize(
    approvals: Array<{
      token: string;
      tokenSymbol: string;
      spender: string;
      allowance: string;
      isUnlimited: boolean;
    }>,
    batchSize = 10
  ): {
    batches: Array<{
      approvals: string[];
      estimatedGas: number;
    }>;
    totalGas: number;
  } {
    const batches: Array<{ approvals: string[]; estimatedGas: number }> = [];
    const approvalAddresses = approvals.map(a => `${a.token}-${a.spender}`);

    for (let i = 0; i < approvalAddresses.length; i += batchSize) {
      const batch = approvalAddresses.slice(i, i + batchSize);
      batches.push({
        approvals: batch,
        estimatedGas: batch.length * 46000, // Gas per approval
      });
    }

    const totalGas = batches.reduce((sum, batch) => sum + batch.estimatedGas, 0);

    return {
      batches,
      totalGas,
    };
  }

  /**
   * Get approval health score
   */
  getApprovalHealthScore(analysis: ApprovalAnalysis): number {
    let score = 100;

    // Deduct points for unlimited approvals
    score -= analysis.unlimitedApprovals * 20;

    // Deduct points for excessive approvals
    score -= analysis.excessiveApprovals * 10;

    // Deduct points for unused approvals
    score -= analysis.unusedApprovals * 5;

    // Deduct points for too many approvals
    if (analysis.totalApprovals > 20) {
      score -= 10;
    } else if (analysis.totalApprovals > 10) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }
}

// Singleton instance
export const approvalOptimizer = new ApprovalOptimizer();

