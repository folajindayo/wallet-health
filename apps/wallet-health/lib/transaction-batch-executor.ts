/**
 * Transaction Batch Executor Utility
 * Executes multiple transactions efficiently with batching
 */

export interface BatchTransaction {
  id: string;
  to: string;
  value: string;
  data: string;
  gasLimit?: number;
  description?: string;
  required: boolean; // If false, can fail without stopping batch
}

export interface BatchExecutionPlan {
  id: string;
  transactions: BatchTransaction[];
  estimatedGas: number;
  estimatedCost: number; // USD
  canExecute: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface BatchExecutionResult {
  planId: string;
  success: boolean;
  executed: number;
  failed: number;
  skipped: number;
  totalGasUsed: number;
  totalCost: number; // USD
  transactions: Array<{
    id: string;
    hash?: string;
    success: boolean;
    error?: string;
    gasUsed?: number;
  }>;
  timestamp: number;
}

export interface BatchSimulation {
  plan: BatchExecutionPlan;
  simulation: {
    willSucceed: boolean;
    willFail: boolean;
    estimatedGas: number;
    estimatedCost: number;
    errors: string[];
    warnings: string[];
  };
}

export class TransactionBatchExecutor {
  /**
   * Create batch execution plan
   */
  createPlan(transactions: BatchTransaction[]): BatchExecutionPlan {
    // Estimate total gas
    const estimatedGas = transactions.reduce((sum, tx) => {
      return sum + (tx.gasLimit || 21000); // Default gas limit
    }, 0);

    // Estimate cost (simplified)
    const gasPrice = 30e9; // 30 gwei
    const estimatedCost = (estimatedGas * gasPrice) / 1e9 * 2000; // Assume ETH = $2000

    // Check if can execute (simplified - would check balances, etc.)
    const canExecute = transactions.length > 0;

    return {
      id: `batch-${Date.now()}`,
      transactions,
      estimatedGas,
      estimatedCost,
      canExecute,
    };
  }

  /**
   * Simulate batch execution
   */
  async simulateBatch(plan: BatchExecutionPlan): Promise<BatchSimulation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let willSucceed = true;
    let willFail = false;

    // Simulate each transaction
    for (const tx of plan.transactions) {
      // In production, would call eth_call for each transaction
      // For now, basic validation
      if (!tx.to || !tx.data) {
        errors.push(`Transaction ${tx.id}: Invalid parameters`);
        if (tx.required) {
          willSucceed = false;
          willFail = true;
        }
      }

      // Check gas limit
      if (tx.gasLimit && tx.gasLimit > 1000000) {
        warnings.push(`Transaction ${tx.id}: Very high gas limit`);
      }
    }

    return {
      plan,
      simulation: {
        willSucceed: !willFail && errors.length === 0,
        willFail,
        estimatedGas: plan.estimatedGas,
        estimatedCost: plan.estimatedCost,
        errors,
        warnings,
      },
    };
  }

  /**
   * Execute batch (simulated - would need wallet connection)
   */
  async executeBatch(
    plan: BatchExecutionPlan,
    executeFn?: (tx: BatchTransaction) => Promise<{ hash?: string; success: boolean; error?: string }>
  ): Promise<BatchExecutionResult> {
    const results: BatchExecutionResult['transactions'] = [];
    let executed = 0;
    let failed = 0;
    let skipped = 0;
    let totalGasUsed = 0;

    for (const tx of plan.transactions) {
      if (executeFn) {
        try {
          const result = await executeFn(tx);
          if (result.success) {
            executed++;
            results.push({
              id: tx.id,
              hash: result.hash,
              success: true,
            });
          } else {
            if (tx.required) {
              failed++;
              results.push({
                id: tx.id,
                success: false,
                error: result.error,
              });
              // Stop execution if required transaction fails
              break;
            } else {
              skipped++;
              results.push({
                id: tx.id,
                success: false,
                error: result.error,
              });
            }
          }
        } catch (error: any) {
          if (tx.required) {
            failed++;
            results.push({
              id: tx.id,
              success: false,
              error: error.message,
            });
            break;
          } else {
            skipped++;
            results.push({
              id: tx.id,
              success: false,
              error: error.message,
            });
          }
        }
      } else {
        // Simulated execution
        executed++;
        results.push({
          id: tx.id,
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          success: true,
          gasUsed: tx.gasLimit || 21000,
        });
        totalGasUsed += tx.gasLimit || 21000;
      }
    }

    const success = failed === 0;
    const gasPrice = 30e9;
    const totalCost = (totalGasUsed * gasPrice) / 1e9 * 2000;

    return {
      planId: plan.id,
      success,
      executed,
      failed,
      skipped,
      totalGasUsed,
      totalCost,
      transactions: results,
      timestamp: Date.now(),
    };
  }

  /**
   * Optimize batch order
   */
  optimizeBatchOrder(transactions: BatchTransaction[]): BatchTransaction[] {
    // Sort by priority: required transactions first, then by gas limit (lowest first)
    return [...transactions].sort((a, b) => {
      // Required transactions first
      if (a.required && !b.required) return -1;
      if (!a.required && b.required) return 1;
      
      // Then by gas limit (lower first)
      const gasA = a.gasLimit || 21000;
      const gasB = b.gasLimit || 21000;
      return gasA - gasB;
    });
  }

  /**
   * Estimate gas savings from batching
   */
  estimateGasSavings(
    individualGas: number[],
    batchGas: number
  ): {
    individualTotal: number;
    batchTotal: number;
    savings: number;
    savingsPercent: number;
  } {
    const individualTotal = individualGas.reduce((sum, gas) => sum + gas, 0);
    const savings = individualTotal - batchGas;
    const savingsPercent = individualTotal > 0
      ? (savings / individualTotal) * 100
      : 0;

    return {
      individualTotal,
      batchTotal: batchGas,
      savings,
      savingsPercent: Math.round(savingsPercent * 100) / 100,
    };
  }

  /**
   * Validate batch plan
   */
  validatePlan(plan: BatchExecutionPlan): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (plan.transactions.length === 0) {
      errors.push('Batch plan has no transactions');
    }

    if (plan.transactions.length > 100) {
      warnings.push('Large batch (>100 transactions). Consider splitting.');
    }

    // Check for duplicate transactions
    const transactionIds = new Set();
    plan.transactions.forEach(tx => {
      if (transactionIds.has(tx.id)) {
        errors.push(`Duplicate transaction ID: ${tx.id}`);
      }
      transactionIds.add(tx.id);
    });

    // Check gas limits
    plan.transactions.forEach(tx => {
      if (tx.gasLimit && tx.gasLimit < 21000) {
        warnings.push(`Transaction ${tx.id}: Gas limit may be too low`);
      }
      if (tx.gasLimit && tx.gasLimit > 5000000) {
        warnings.push(`Transaction ${tx.id}: Very high gas limit`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Singleton instance
export const transactionBatchExecutor = new TransactionBatchExecutor();

