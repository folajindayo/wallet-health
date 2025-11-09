/**
 * Transaction Batch Optimizer Utility
 * Optimize batch transactions for gas efficiency
 */

export interface BatchTransaction {
  id: string;
  to: string;
  value: string;
  data: string;
  gasLimit: number;
  priority: 'low' | 'medium' | 'high';
  dependencies?: string[]; // IDs of transactions that must execute first
}

export interface BatchOptimization {
  originalOrder: BatchTransaction[];
  optimizedOrder: BatchTransaction[];
  totalGasBefore: number;
  totalGasAfter: number;
  gasSavings: number;
  gasSavingsPercent: number;
  executionPlan: Array<{
    step: number;
    transactions: BatchTransaction[];
    estimatedGas: number;
    canExecuteInParallel: boolean;
  }>;
}

export class TransactionBatchOptimizer {
  /**
   * Optimize batch transactions
   */
  optimizeBatch(transactions: BatchTransaction[]): BatchOptimization {
    // Calculate original gas
    const totalGasBefore = transactions.reduce((sum, tx) => sum + tx.gasLimit, 0);

    // Group by dependencies
    const optimizedOrder = this.topologicalSort(transactions);
    
    // Create execution plan
    const executionPlan = this.createExecutionPlan(optimizedOrder);

    // Calculate optimized gas (accounting for parallel execution)
    const totalGasAfter = executionPlan.reduce((sum, step) => {
      if (step.canExecuteInParallel) {
        // Parallel execution uses max gas of the group
        return sum + Math.max(...step.transactions.map(tx => tx.gasLimit));
      } else {
        // Sequential execution uses sum
        return sum + step.transactions.reduce((s, tx) => s + tx.gasLimit, 0);
      }
    }, 0);

    const gasSavings = totalGasBefore - totalGasAfter;
    const gasSavingsPercent = totalGasBefore > 0
      ? (gasSavings / totalGasBefore) * 100
      : 0;

    return {
      originalOrder: transactions,
      optimizedOrder,
      totalGasBefore,
      totalGasAfter,
      gasSavings: Math.round(gasSavings),
      gasSavingsPercent: Math.round(gasSavingsPercent * 100) / 100,
      executionPlan,
    };
  }

  /**
   * Topological sort to handle dependencies
   */
  private topologicalSort(transactions: BatchTransaction[]): BatchTransaction[] {
    const sorted: BatchTransaction[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (tx: BatchTransaction) => {
      if (visiting.has(tx.id)) {
        // Circular dependency detected
        return;
      }

      if (visited.has(tx.id)) {
        return;
      }

      visiting.add(tx.id);

      // Visit dependencies first
      if (tx.dependencies) {
        tx.dependencies.forEach(depId => {
          const dep = transactions.find(t => t.id === depId);
          if (dep) {
            visit(dep);
          }
        });
      }

      visiting.delete(tx.id);
      visited.add(tx.id);
      sorted.push(tx);
    };

    transactions.forEach(tx => {
      if (!visited.has(tx.id)) {
        visit(tx);
      }
    });

    return sorted;
  }

  /**
   * Create execution plan with parallelization
   */
  private createExecutionPlan(
    transactions: BatchTransaction[]
  ): BatchOptimization['executionPlan'] {
    const plan: BatchOptimization['executionPlan'] = [];
    const executed = new Set<string>();
    let step = 1;

    while (executed.size < transactions.length) {
      // Find transactions that can execute in parallel (no dependencies or dependencies already executed)
      const ready = transactions.filter(tx => {
        if (executed.has(tx.id)) {
          return false;
        }

        if (!tx.dependencies || tx.dependencies.length === 0) {
          return true;
        }

        return tx.dependencies.every(depId => executed.has(depId));
      });

      if (ready.length === 0) {
        // Should not happen if dependencies are valid
        break;
      }

      // Check if transactions can execute in parallel (same contract, no conflicts)
      const canParallelize = ready.length > 1 && this.canExecuteInParallel(ready);

      plan.push({
        step,
        transactions: ready,
        estimatedGas: canParallelize
          ? Math.max(...ready.map(tx => tx.gasLimit))
          : ready.reduce((sum, tx) => sum + tx.gasLimit, 0),
        canExecuteInParallel: canParallelize,
      });

      ready.forEach(tx => executed.add(tx.id));
      step++;
    }

    return plan;
  }

  /**
   * Check if transactions can execute in parallel
   */
  private canExecuteInParallel(transactions: BatchTransaction[]): boolean {
    // Simple check: can parallelize if they interact with different contracts
    // In production, would do more sophisticated conflict detection
    const contracts = new Set(transactions.map(tx => tx.to.toLowerCase()));
    return contracts.size === transactions.length;
  }

  /**
   * Estimate batch gas cost
   */
  estimateBatchGasCost(optimization: BatchOptimization): {
    totalGas: number;
    totalCostUSD: number;
    costPerTransaction: number;
  } {
    const ETH_PRICE_USD = 2000;
    const GAS_PRICE_GWEI = 30;
    const GAS_PRICE_WEI = GAS_PRICE_GWEI * 1e9;

    const totalGas = optimization.totalGasAfter;
    const totalCostETH = (totalGas * GAS_PRICE_WEI) / 1e18;
    const totalCostUSD = totalCostETH * ETH_PRICE_USD;
    const costPerTransaction = optimization.optimizedOrder.length > 0
      ? totalCostUSD / optimization.optimizedOrder.length
      : 0;

    return {
      totalGas,
      totalCostUSD: Math.round(totalCostUSD * 100) / 100,
      costPerTransaction: Math.round(costPerTransaction * 100) / 100,
    };
  }

  /**
   * Validate batch
   */
  validateBatch(transactions: BatchTransaction[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for duplicate IDs
    const ids = new Set(transactions.map(tx => tx.id));
    if (ids.size !== transactions.length) {
      errors.push('Duplicate transaction IDs found');
    }

    // Check dependencies
    const allIds = new Set(transactions.map(tx => tx.id));
    transactions.forEach(tx => {
      if (tx.dependencies) {
        tx.dependencies.forEach(depId => {
          if (!allIds.has(depId)) {
            errors.push(`Transaction ${tx.id} depends on non-existent transaction ${depId}`);
          }
          if (depId === tx.id) {
            errors.push(`Transaction ${tx.id} depends on itself`);
          }
        });
      }
    });

    // Check for circular dependencies (simplified)
    // In production, would use proper cycle detection

    // Warnings
    if (transactions.length > 50) {
      warnings.push('Large batch size may result in high gas costs');
    }

    const totalGas = transactions.reduce((sum, tx) => sum + tx.gasLimit, 0);
    if (totalGas > 10000000) {
      warnings.push('Total gas limit is very high, transaction may fail');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Singleton instance
export const transactionBatchOptimizer = new TransactionBatchOptimizer();

