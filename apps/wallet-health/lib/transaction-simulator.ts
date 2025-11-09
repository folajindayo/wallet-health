/**
 * Transaction Simulator Utility
 * Simulate transactions before executing them
 */

export interface SimulationInput {
  from: string;
  to: string;
  value?: string;
  data?: string;
  gasLimit?: number;
  gasPrice?: number;
  chainId: number;
}

export interface SimulationResult {
  success: boolean;
  gasUsed: number;
  gasCost: number; // USD
  balanceChanges: Array<{
    address: string;
    token?: string;
    before: string;
    after: string;
    change: string;
  }>;
  events: Array<{
    name: string;
    args: Record<string, any>;
  }>;
  errors?: string[];
  warnings?: string[];
  estimatedTime: number; // seconds
}

export interface SimulationComparison {
  scenarios: Array<{
    name: string;
    input: SimulationInput;
    result: SimulationResult;
  }>;
  bestScenario: {
    name: string;
    gasCost: number;
    success: boolean;
  } | null;
}

export class TransactionSimulator {
  private readonly ETH_PRICE_USD = 2000; // Would fetch from API

  /**
   * Simulate transaction
   */
  async simulateTransaction(input: SimulationInput): Promise<SimulationResult> {
    // In production, would call eth_call or similar
    // For now, simulate based on transaction type

    const gasLimit = input.gasLimit || this.estimateGasLimit(input);
    const gasPrice = input.gasPrice || 30e9; // 30 gwei default
    const gasCost = (gasLimit * gasPrice * this.ETH_PRICE_USD) / 1e18;

    // Simulate balance changes
    const balanceChanges: SimulationResult['balanceChanges'] = [];

    // From address balance change
    if (input.value) {
      const valueWei = BigInt(input.value);
      balanceChanges.push({
        address: input.from,
        before: '1000000000000000000', // Would fetch actual balance
        after: (BigInt('1000000000000000000') - valueWei).toString(),
        change: `-${input.value}`,
      });

      // To address balance change
      balanceChanges.push({
        address: input.to,
        before: '500000000000000000', // Would fetch actual balance
        after: (BigInt('500000000000000000') + valueWei).toString(),
        change: `+${input.value}`,
      });
    }

    // Simulate events (would parse from actual simulation)
    const events: SimulationResult['events'] = [];
    if (input.data && input.data.length > 0) {
      events.push({
        name: 'Transfer',
        args: {
          from: input.from,
          to: input.to,
          value: input.value || '0',
        },
      });
    }

    // Estimate block time
    const blockTime = this.getBlockTime(input.chainId);
    const estimatedTime = blockTime * 2; // ~2 blocks

    // Check for potential issues
    const warnings: string[] = [];
    const errors: string[] = [];

    if (gasCost > 100) {
      warnings.push('High gas cost detected. Consider waiting for lower gas prices.');
    }

    if (gasLimit > 500000) {
      warnings.push('High gas limit. Transaction may fail if contract logic is complex.');
    }

    return {
      success: true,
      gasUsed: gasLimit,
      gasCost: Math.round(gasCost * 100) / 100,
      balanceChanges,
      events,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      estimatedTime: Math.round(estimatedTime),
    };
  }

  /**
   * Estimate gas limit
   */
  private estimateGasLimit(input: SimulationInput): number {
    if (input.data && input.data.length > 0) {
      // Contract interaction
      const dataLength = input.data.length / 2 - 1; // Remove 0x prefix
      return 21000 + dataLength * 16; // Base + data cost
    }
    // Simple transfer
    return 21000;
  }

  /**
   * Get block time for chain
   */
  private getBlockTime(chainId: number): number {
    const blockTimes: Record<number, number> = {
      1: 12, // Ethereum
      137: 2, // Polygon
      42161: 0.25, // Arbitrum
      10: 2, // Optimism
      56: 3, // BSC
      8453: 2, // Base
    };
    return blockTimes[chainId] || 12;
  }

  /**
   * Compare multiple transaction scenarios
   */
  async compareScenarios(
    scenarios: Array<{ name: string; input: SimulationInput }>
  ): Promise<SimulationComparison> {
    const results = await Promise.all(
      scenarios.map(async scenario => ({
        name: scenario.name,
        input: scenario.input,
        result: await this.simulateTransaction(scenario.input),
      }))
    );

    // Find best scenario (lowest gas cost, successful)
    const successfulScenarios = results.filter(s => s.result.success);
    const bestScenario = successfulScenarios.length > 0
      ? successfulScenarios.reduce((best, current) =>
          current.result.gasCost < best.result.gasCost ? current : best
        )
      : null;

    return {
      scenarios: results,
      bestScenario: bestScenario
        ? {
            name: bestScenario.name,
            gasCost: bestScenario.result.gasCost,
            success: bestScenario.result.success,
          }
        : null,
    };
  }

  /**
   * Simulate batch transactions
   */
  async simulateBatch(
    transactions: SimulationInput[]
  ): Promise<{
    totalGasUsed: number;
    totalGasCost: number; // USD
    results: SimulationResult[];
    success: boolean;
  }> {
    const results = await Promise.all(
      transactions.map(tx => this.simulateTransaction(tx))
    );

    const totalGasUsed = results.reduce((sum, r) => sum + r.gasUsed, 0);
    const totalGasCost = results.reduce((sum, r) => sum + r.gasCost, 0);
    const success = results.every(r => r.success);

    return {
      totalGasUsed,
      totalGasCost: Math.round(totalGasCost * 100) / 100,
      results,
      success,
    };
  }

  /**
   * Validate transaction before simulation
   */
  validateTransaction(input: SimulationInput): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!input.from || !input.to) {
      errors.push('From and to addresses are required');
    }

    if (input.value && BigInt(input.value) < 0) {
      errors.push('Value cannot be negative');
    }

    if (input.gasLimit && input.gasLimit < 21000) {
      warnings.push('Gas limit seems too low for a transaction');
    }

    if (input.gasLimit && input.gasLimit > 10000000) {
      warnings.push('Gas limit is very high. Transaction may fail.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Singleton instance
export const transactionSimulator = new TransactionSimulator();
