/**
 * Token Approval Revoker Utility
 * Helps users revoke risky token approvals safely
 */

export interface RevokeApprovalParams {
  tokenAddress: string;
  spenderAddress: string;
  chainId: number;
  walletAddress: string;
}

export interface RevokeTransaction {
  to: string;
  data: string;
  value: string;
  gasLimit?: string;
  chainId: number;
  description: string;
  tokenSymbol: string;
  spenderAddress: string;
}

export interface BatchRevokeOptions {
  approvals: RevokeApprovalParams[];
  batchSize?: number;
  gasPrice?: string;
}

export class ApprovalRevoker {
  /**
   * Generate revoke transaction data for ERC20 token
   */
  generateRevokeTransaction(params: RevokeApprovalParams): RevokeTransaction {
    // ERC20 approve(address spender, uint256 amount) with amount = 0
    // Function signature: approve(address,uint256)
    // Encoded: 0x095ea7b3 + padded spender + padded amount (0)
    const spenderPadded = params.spenderAddress.slice(2).padStart(64, '0');
    const amountPadded = '0'.padStart(64, '0');
    const data = `0x095ea7b3${spenderPadded}${amountPadded}`;

    return {
      to: params.tokenAddress,
      data,
      value: '0x0',
      gasLimit: '0x186a0', // ~100,000 gas
      chainId: params.chainId,
      description: `Revoke approval for ${params.tokenAddress}`,
      tokenSymbol: '', // Would need to fetch from metadata
      spenderAddress: params.spenderAddress,
    };
  }

  /**
   * Generate batch revoke transactions
   */
  generateBatchRevokeTransactions(
    options: BatchRevokeOptions
  ): RevokeTransaction[] {
    const { approvals, batchSize = 10 } = options;
    const transactions: RevokeTransaction[] = [];

    // Group approvals by token to optimize gas
    const approvalsByToken = new Map<string, RevokeApprovalParams[]>();
    approvals.forEach(approval => {
      const key = approval.tokenAddress.toLowerCase();
      if (!approvalsByToken.has(key)) {
        approvalsByToken.set(key, []);
      }
      approvalsByToken.get(key)!.push(approval);
    });

    // Generate transactions
    approvalsByToken.forEach((tokenApprovals, tokenAddress) => {
      tokenApprovals.forEach(approval => {
        transactions.push(this.generateRevokeTransaction(approval));
      });
    });

    return transactions;
  }

  /**
   * Estimate total gas cost for revoking approvals
   */
  estimateGasCost(approvals: RevokeApprovalParams[], gasPrice?: string): {
    totalGas: number;
    totalCostETH: string;
    totalCostUSD?: number;
    perTransaction: number;
  } {
    const gasPerTransaction = 100000; // ~100k gas per revoke
    const totalGas = approvals.length * gasPerTransaction;
    
    // Default gas price if not provided (in gwei)
    const defaultGasPrice = 30; // 30 gwei
    const gasPriceGwei = gasPrice 
      ? parseFloat(gasPrice) / 1e9 
      : defaultGasPrice;
    
    const totalCostETH = (totalGas * gasPriceGwei * 1e9) / 1e18;
    
    return {
      totalGas,
      totalCostETH: totalCostETH.toFixed(8),
      perTransaction: gasPerTransaction,
    };
  }

  /**
   * Validate revoke transaction before execution
   */
  validateRevokeTransaction(
    transaction: RevokeTransaction,
    currentAllowance: string
  ): {
    valid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check if allowance is already zero
    if (currentAllowance === '0' || currentAllowance === '0x0') {
      warnings.push('Allowance is already zero - transaction may be unnecessary');
    }

    // Validate addresses
    if (!transaction.to || !transaction.to.startsWith('0x')) {
      errors.push('Invalid token address');
    }

    if (!transaction.spenderAddress || !transaction.spenderAddress.startsWith('0x')) {
      errors.push('Invalid spender address');
    }

    // Validate data format
    if (!transaction.data || !transaction.data.startsWith('0x095ea7b3')) {
      errors.push('Invalid transaction data - not an approval transaction');
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Get revoke recommendations based on risk level
   */
  getRevokeRecommendations(approvals: Array<{
    tokenAddress: string;
    spenderAddress: string;
    isUnlimited: boolean;
    isRisky: boolean;
    lastUsed?: number;
    riskScore?: number;
  }>): {
    critical: RevokeApprovalParams[];
    high: RevokeApprovalParams[];
    medium: RevokeApprovalParams[];
    low: RevokeApprovalParams[];
  } {
    const critical: RevokeApprovalParams[] = [];
    const high: RevokeApprovalParams[] = [];
    const medium: RevokeApprovalParams[] = [];
    const low: RevokeApprovalParams[] = [];

    approvals.forEach(approval => {
      const params: RevokeApprovalParams = {
        tokenAddress: approval.tokenAddress,
        spenderAddress: approval.spenderAddress,
        chainId: 1, // Would need to be passed
        walletAddress: '', // Would need to be passed
      };

      if (approval.isUnlimited && approval.isRisky) {
        critical.push(params);
      } else if (approval.isUnlimited || (approval.riskScore && approval.riskScore > 80)) {
        high.push(params);
      } else if (approval.isRisky || (approval.riskScore && approval.riskScore > 50)) {
        medium.push(params);
      } else if (approval.lastUsed) {
        const daysSinceUse = (Date.now() - approval.lastUsed) / (24 * 60 * 60 * 1000);
        if (daysSinceUse > 90) {
          low.push(params);
        }
      }
    });

    return { critical, high, medium, low };
  }
}

// Singleton instance
export const approvalRevoker = new ApprovalRevoker();

