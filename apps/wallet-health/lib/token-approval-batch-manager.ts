/**
 * Token Approval Batch Manager Utility
 * Efficiently manage multiple token approvals in batches
 */

export interface BatchApprovalOperation {
  id: string;
  operations: Array<{
    tokenAddress: string;
    tokenSymbol: string;
    spenderAddress: string;
    action: 'grant' | 'revoke' | 'update';
    amount?: string; // for grant/update, undefined for revoke
    currentAllowance?: string;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
  gasEstimate?: number;
  transactions?: Array<{
    hash: string;
    status: 'pending' | 'success' | 'failed';
  }>;
}

export interface BatchApprovalPlan {
  operations: BatchApprovalOperation['operations'];
  estimatedGas: number;
  estimatedCost: string; // ETH
  estimatedCostUSD?: number;
  batches: Array<{
    operations: BatchApprovalOperation['operations'];
    gasEstimate: number;
  }>;
  recommendations: string[];
}

export interface ApprovalBatch {
  tokenAddress: string;
  spenders: Array<{
    address: string;
    action: 'grant' | 'revoke' | 'update';
    amount?: string;
  }>;
  gasEstimate: number;
}

export class TokenApprovalBatchManager {
  private operations: Map<string, BatchApprovalOperation> = new Map();

  /**
   * Create batch approval plan
   */
  createBatchPlan(
    operations: BatchApprovalOperation['operations'],
    gasPrice: number, // gwei
    batchSize = 10
  ): BatchApprovalPlan {
    // Group operations by token to optimize gas
    const operationsByToken = new Map<string, BatchApprovalOperation['operations']>();
    
    operations.forEach(op => {
      const key = op.tokenAddress.toLowerCase();
      if (!operationsByToken.has(key)) {
        operationsByToken.set(key, []);
      }
      operationsByToken.get(key)!.push(op);
    });

    // Create batches
    const batches: BatchApprovalPlan['batches'] = [];
    operationsByToken.forEach((tokenOps, tokenAddress) => {
      // Split into smaller batches if needed
      for (let i = 0; i < tokenOps.length; i += batchSize) {
        const batchOps = tokenOps.slice(i, i + batchSize);
        const gasEstimate = this.estimateBatchGas(batchOps);
        
        batches.push({
          operations: batchOps,
          gasEstimate,
        });
      }
    });

    // Calculate total gas
    const totalGas = batches.reduce((sum, batch) => sum + batch.gasEstimate, 0);
    const gasPriceWei = gasPrice * 1e9;
    const estimatedCost = (totalGas * gasPriceWei) / 1e18;

    // Generate recommendations
    const recommendations = this.generateRecommendations(operations, batches);

    return {
      operations,
      estimatedGas: totalGas,
      estimatedCost: estimatedCost.toFixed(8),
      batches,
      recommendations,
    };
  }

  /**
   * Estimate gas for batch operations
   */
  private estimateBatchGas(operations: BatchApprovalOperation['operations']): number {
    // Base gas per approval: ~46,000
    // Batch operations might save some gas
    const baseGasPerApproval = 46000;
    const batchDiscount = 0.1; // 10% discount for batching
    
    const totalGas = operations.length * baseGasPerApproval;
    return Math.round(totalGas * (1 - batchDiscount));
  }

  /**
   * Create batch approval operation
   */
  createBatchOperation(
    operations: BatchApprovalOperation['operations']
  ): BatchApprovalOperation {
    const operation: BatchApprovalOperation = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      operations,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.operations.set(operation.id, operation);
    return operation;
  }

  /**
   * Get batch operation
   */
  getBatchOperation(operationId: string): BatchApprovalOperation | null {
    return this.operations.get(operationId) || null;
  }

  /**
   * Update batch operation status
   */
  updateBatchOperation(
    operationId: string,
    updates: Partial<BatchApprovalOperation>
  ): BatchApprovalOperation | null {
    const operation = this.operations.get(operationId);
    if (!operation) return null;

    const updated = { ...operation, ...updates };
    this.operations.set(operationId, updated);
    return updated;
  }

  /**
   * Optimize batch operations
   */
  optimizeBatch(
    operations: BatchApprovalOperation['operations']
  ): {
    optimized: BatchApprovalOperation['operations'];
    savings: {
      gas: number;
      operations: number;
    };
  } {
    // Remove duplicate operations (same token + spender)
    const seen = new Set<string>();
    const optimized: BatchApprovalOperation['operations'] = [];

    operations.forEach(op => {
      const key = `${op.tokenAddress.toLowerCase()}-${op.spenderAddress.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        optimized.push(op);
      }
    });

    // Sort by priority (revoke first, then update, then grant)
    optimized.sort((a, b) => {
      const priority = { revoke: 3, update: 2, grant: 1 };
      return priority[b.action] - priority[a.action];
    });

    const savings = {
      gas: (operations.length - optimized.length) * 46000,
      operations: operations.length - optimized.length,
    };

    return {
      optimized,
      savings,
    };
  }

  /**
   * Generate batch approval transactions
   */
  generateBatchTransactions(
    batch: ApprovalBatch
  ): Array<{
    to: string;
    data: string;
    value: string;
    gasLimit: number;
  }> {
    const transactions: Array<{
      to: string;
      data: string;
      value: string;
      gasLimit: number;
    }> = [];

    batch.spenders.forEach(spender => {
      if (spender.action === 'revoke') {
        // ERC20 approve(address spender, uint256 amount) with amount = 0
        const spenderPadded = spender.address.slice(2).padStart(64, '0');
        const amountPadded = '0'.padStart(64, '0');
        const data = `0x095ea7b3${spenderPadded}${amountPadded}`;

        transactions.push({
          to: batch.tokenAddress,
          data,
          value: '0x0',
          gasLimit: 46000,
        });
      } else if (spender.action === 'grant' || spender.action === 'update') {
        // ERC20 approve with specific amount
        const spenderPadded = spender.address.slice(2).padStart(64, '0');
        const amount = BigInt(spender.amount || '0');
        const amountPadded = amount.toString(16).padStart(64, '0');
        const data = `0x095ea7b3${spenderPadded}${amountPadded}`;

        transactions.push({
          to: batch.tokenAddress,
          data,
          value: '0x0',
          gasLimit: 46000,
        });
      }
    });

    return transactions;
  }

  /**
   * Validate batch operations
   */
  validateBatchOperations(
    operations: BatchApprovalOperation['operations']
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for empty operations
    if (operations.length === 0) {
      errors.push('No operations provided');
      return { valid: false, errors, warnings };
    }

    // Check for duplicate operations
    const seen = new Set<string>();
    operations.forEach((op, index) => {
      const key = `${op.tokenAddress.toLowerCase()}-${op.spenderAddress.toLowerCase()}`;
      if (seen.has(key)) {
        warnings.push(`Duplicate operation at index ${index}`);
      }
      seen.add(key);
    });

    // Validate addresses
    operations.forEach((op, index) => {
      if (!op.tokenAddress.startsWith('0x') || op.tokenAddress.length !== 42) {
        errors.push(`Invalid token address at index ${index}`);
      }
      if (!op.spenderAddress.startsWith('0x') || op.spenderAddress.length !== 42) {
        errors.push(`Invalid spender address at index ${index}`);
      }
    });

    // Validate amounts
    operations.forEach((op, index) => {
      if ((op.action === 'grant' || op.action === 'update') && !op.amount) {
        errors.push(`Missing amount for grant/update operation at index ${index}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    operations: BatchApprovalOperation['operations'],
    batches: BatchApprovalPlan['batches']
  ): string[] {
    const recommendations: string[] = [];

    if (operations.length > 20) {
      recommendations.push('Large batch detected - consider splitting into smaller batches');
    }

    const revokeCount = operations.filter(op => op.action === 'revoke').length;
    if (revokeCount > 0) {
      recommendations.push(`Revoking ${revokeCount} approval(s) will improve security`);
    }

    if (batches.length > 1) {
      recommendations.push(`Operations will be split into ${batches.length} batches for gas optimization`);
    }

    const unlimitedGrants = operations.filter(
      op => op.action === 'grant' && op.amount === '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    );
    if (unlimitedGrants.length > 0) {
      recommendations.push(`Warning: ${unlimitedGrants.length} unlimited approval(s) - consider setting limits`);
    }

    return recommendations;
  }

  /**
   * Get all batch operations
   */
  getAllBatchOperations(): BatchApprovalOperation[] {
    return Array.from(this.operations.values());
  }

  /**
   * Get operations by status
   */
  getOperationsByStatus(status: BatchApprovalOperation['status']): BatchApprovalOperation[] {
    return Array.from(this.operations.values()).filter(op => op.status === status);
  }

  /**
   * Clear completed operations
   */
  clearCompletedOperations(olderThanDays = 7): number {
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let cleared = 0;

    this.operations.forEach((op, id) => {
      if (op.status === 'completed' && op.completedAt && op.completedAt < cutoff) {
        this.operations.delete(id);
        cleared++;
      }
    });

    return cleared;
  }
}

// Singleton instance
export const tokenApprovalBatchManager = new TokenApprovalBatchManager();

