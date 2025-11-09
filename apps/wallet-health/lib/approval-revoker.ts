/**
 * Token Approval Revocation Helper
 * Helps users revoke token approvals safely
 */

import type { TokenApproval } from '@wallet-health/types';

export interface RevocationRecommendation {
  approval: TokenApproval;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  estimatedGasCost?: number;
  estimatedGasCostUSD?: number;
  canBatch?: boolean;
}

export interface RevocationPlan {
  recommendations: RevocationRecommendation[];
  totalGasEstimate: number;
  totalGasEstimateUSD?: number;
  canBatchRevoke: boolean;
  batchGasEstimate?: number;
  savings?: {
    individual: number;
    batched: number;
    savings: number;
    savingsUSD?: number;
  };
}

export interface RevocationTransaction {
  token: string;
  spender: string;
  allowance: string;
  chainId: number;
  gasEstimate: number;
  transactionData: {
    to: string;
    data: string;
    value: string;
  };
}

export class ApprovalRevoker {
  /**
   * Analyze approvals and generate revocation recommendations
   */
  analyzeApprovalsForRevocation(approvals: TokenApproval[]): RevocationPlan {
    const recommendations: RevocationRecommendation[] = [];

    // Categorize approvals by priority
    for (const approval of approvals) {
      let priority: 'high' | 'medium' | 'low' = 'low';
      const reasons: string[] = [];

      // High priority: Unverified contracts
      if (approval.isVerified === false) {
        priority = 'high';
        reasons.push('Unverified contract - high security risk');
      }

      // High priority: Unlimited approvals
      if (approval.isUnlimited) {
        priority = priority === 'high' ? 'high' : 'medium';
        reasons.push('Unlimited approval - potential for large losses');
      }

      // Medium priority: New contracts
      if (approval.contractAge && approval.contractAge < 30) {
        if (priority === 'low') priority = 'medium';
        reasons.push('New contract (<30 days) - higher risk');
      }

      // Medium priority: Zero balance token
      if (approval.tokenBalance === '0' || parseFloat(approval.tokenBalance || '0') === 0) {
        if (priority === 'low') priority = 'medium';
        reasons.push('Token balance is zero - approval not needed');
      }

      // Low priority: Old, verified contracts with limited approval
      if (priority === 'low') {
        reasons.push('Low risk - consider revoking if not actively used');
      }

      recommendations.push({
        approval,
        priority,
        reason: reasons.join('; '),
        estimatedGasCost: this.estimateRevocationGas(approval),
        canBatch: true, // Most ERC20 approvals can be batched
      });
    }

    // Sort by priority
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Calculate gas estimates
    const totalGasEstimate = recommendations.reduce(
      (sum, rec) => sum + (rec.estimatedGasCost || 0),
      0
    );

    // Check if batching is possible
    const canBatchRevoke = this.canBatchRevoke(recommendations);
    const batchGasEstimate = canBatchRevoke
      ? this.estimateBatchRevocationGas(recommendations)
      : undefined;

    const savings = batchGasEstimate
      ? {
          individual: totalGasEstimate,
          batched: batchGasEstimate,
          savings: totalGasEstimate - batchGasEstimate,
        }
      : undefined;

    return {
      recommendations,
      totalGasEstimate,
      canBatchRevoke,
      batchGasEstimate,
      savings,
    };
  }

  /**
   * Generate revocation transaction data
   */
  generateRevocationTransaction(
    approval: TokenApproval,
    amount: string = '0' // 0 = full revocation
  ): RevocationTransaction {
    // ERC20 approve function signature: approve(address,uint256)
    // Function selector: 0x095ea7b3
    const approveSelector = '0x095ea7b3';
    
    // Encode spender address (20 bytes, padded to 32 bytes)
    const spenderPadded = approval.spender.slice(2).padStart(64, '0');
    
    // Encode amount (32 bytes)
    const amountPadded = BigInt(amount).toString(16).padStart(64, '0');
    
    // Construct transaction data
    const data = approveSelector + spenderPadded + amountPadded;

    return {
      token: approval.token,
      spender: approval.spender,
      allowance: amount,
      chainId: approval.chainId,
      gasEstimate: this.estimateRevocationGas(approval),
      transactionData: {
        to: approval.token,
        data,
        value: '0',
      },
    };
  }

  /**
   * Generate batch revocation transaction
   */
  generateBatchRevocationTransaction(
    approvals: TokenApproval[]
  ): {
    transactions: RevocationTransaction[];
    totalGasEstimate: number;
    canBatch: boolean;
  } {
    const transactions = approvals.map(approval =>
      this.generateRevocationTransaction(approval, '0')
    );

    const totalGasEstimate = this.estimateBatchRevocationGas(approvals);

    return {
      transactions,
      totalGasEstimate,
      canBatch: this.canBatchRevoke(approvals.map(a => ({ approval: a }))),
    };
  }

  /**
   * Estimate gas cost for revocation
   */
  private estimateRevocationGas(approval: TokenApproval): number {
    // Standard ERC20 approve gas: ~46,000 gas
    // Can vary based on token implementation
    return 46000;
  }

  /**
   * Estimate gas for batch revocation
   */
  private estimateBatchRevocationGas(approvals: RevocationRecommendation[] | TokenApproval[]): number {
    const approvalList = approvals.map(a =>
      'approval' in a ? a.approval : a
    );

    // Base transaction gas: 21,000
    // Each approval in batch: ~30,000 (slightly less than individual due to shared overhead)
    const baseGas = 21000;
    const perApprovalGas = 30000;

    return baseGas + approvalList.length * perApprovalGas;
  }

  /**
   * Check if approvals can be batched
   */
  private canBatchRevoke(recommendations: RevocationRecommendation[]): boolean {
    if (recommendations.length < 2) return false;

    // Check if all approvals are on the same chain
    const chainIds = new Set(recommendations.map(r => r.approval.chainId));
    if (chainIds.size > 1) return false;

    // Check if all are standard ERC20 (would need to verify in real implementation)
    return true;
  }

  /**
   * Get revocation statistics
   */
  getRevocationStats(plan: RevocationPlan): {
    totalApprovals: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    estimatedTotalGas: number;
    estimatedSavings: number;
    recommendedActions: string[];
  } {
    const highPriority = plan.recommendations.filter(r => r.priority === 'high').length;
    const mediumPriority = plan.recommendations.filter(r => r.priority === 'medium').length;
    const lowPriority = plan.recommendations.filter(r => r.priority === 'low').length;

    const recommendedActions: string[] = [];

    if (highPriority > 0) {
      recommendedActions.push(`Immediately revoke ${highPriority} high-priority approval(s)`);
    }

    if (plan.canBatchRevoke && plan.recommendations.length > 1) {
      recommendedActions.push(
        `Batch revoke ${plan.recommendations.length} approvals to save gas`
      );
    }

    if (mediumPriority > 0) {
      recommendedActions.push(`Review and revoke ${mediumPriority} medium-priority approval(s)`);
    }

    return {
      totalApprovals: plan.recommendations.length,
      highPriority,
      mediumPriority,
      lowPriority,
      estimatedTotalGas: plan.totalGasEstimate,
      estimatedSavings: plan.savings?.savings || 0,
      recommendedActions,
    };
  }
}

// Singleton instance
export const approvalRevoker = new ApprovalRevoker();
