/**
 * Transaction Fee Optimizer Utility
 * Optimize transaction fees across different networks
 */

export interface FeeEstimate {
  chainId: number;
  chainName: string;
  gasPrice: {
    slow: number; // wei
    standard: number;
    fast: number;
  };
  estimatedCost: {
    slow: number; // USD
    standard: number;
    fast: number;
  };
  estimatedTime: {
    slow: number; // seconds
    standard: number;
    fast: number;
  };
  recommendation: 'slow' | 'standard' | 'fast';
  savings: {
    vsFast: number; // USD
    vsStandard: number; // USD
  };
}

export interface FeeOptimization {
  transactionType: string;
  gasLimit: number;
  estimates: FeeEstimate[];
  bestOption: FeeEstimate | null;
  totalSavings: number; // USD
  alternativeChains: Array<{
    chainId: number;
    chainName: string;
    estimatedCost: number; // USD
    savings: number; // USD vs main chain
  }>;
}

export class TransactionFeeOptimizer {
  private readonly ETH_PRICE_USD = 2000; // Would fetch from API
  private readonly CHAIN_NAMES: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    42161: 'Arbitrum',
    10: 'Optimism',
    56: 'BSC',
    8453: 'Base',
  };

  /**
   * Estimate fees for transaction
   */
  estimateFees(
    chainId: number,
    gasLimit: number,
    gasPrice?: { slow: number; standard: number; fast: number }
  ): FeeEstimate {
    const chainName = this.CHAIN_NAMES[chainId] || `Chain ${chainId}`;
    
    // Default gas prices if not provided (in gwei)
    const defaultGasPrices = {
      slow: 20e9,
      standard: 30e9,
      fast: 50e9,
    };

    const prices = gasPrice || defaultGasPrices;

    // Calculate costs in ETH
    const costSlow = (gasLimit * prices.slow) / 1e18;
    const costStandard = (gasLimit * prices.standard) / 1e18;
    const costFast = (gasLimit * prices.fast) / 1e18;

    // Convert to USD
    const costSlowUSD = costSlow * this.ETH_PRICE_USD;
    const costStandardUSD = costStandard * this.ETH_PRICE_USD;
    const costFastUSD = costFast * this.ETH_PRICE_USD;

    // Estimate times (seconds)
    const blockTime = this.getBlockTime(chainId);
    const timeSlow = blockTime * 5; // ~5 blocks
    const timeStandard = blockTime * 2; // ~2 blocks
    const timeFast = blockTime; // ~1 block

    // Determine recommendation
    let recommendation: 'slow' | 'standard' | 'fast' = 'standard';
    if (costSlowUSD < costStandardUSD * 0.7 && timeSlow < 300) {
      recommendation = 'slow';
    } else if (costFastUSD < costStandardUSD * 1.2) {
      recommendation = 'fast';
    }

    const savings = {
      vsFast: costFastUSD - costSlowUSD,
      vsStandard: costStandardUSD - costSlowUSD,
    };

    return {
      chainId,
      chainName,
      gasPrice: prices,
      estimatedCost: {
        slow: Math.round(costSlowUSD * 100) / 100,
        standard: Math.round(costStandardUSD * 100) / 100,
        fast: Math.round(costFastUSD * 100) / 100,
      },
      estimatedTime: {
        slow: Math.round(timeSlow),
        standard: Math.round(timeStandard),
        fast: Math.round(timeFast),
      },
      recommendation,
      savings: {
        vsFast: Math.round(savings.vsFast * 100) / 100,
        vsStandard: Math.round(savings.vsStandard * 100) / 100,
      },
    };
  }

  /**
   * Optimize transaction across multiple chains
   */
  optimizeTransaction(
    transactionType: string,
    gasLimit: number,
    chainIds: number[],
    gasPrices?: Map<number, { slow: number; standard: number; fast: number }>
  ): FeeOptimization {
    const estimates = chainIds.map(chainId => {
      const gasPrice = gasPrices?.get(chainId);
      return this.estimateFees(chainId, gasLimit, gasPrice);
    });

    // Find best option
    const bestOption = estimates.reduce((best, current) => {
      const bestCost = best.estimatedCost[best.recommendation];
      const currentCost = current.estimatedCost[current.recommendation];
      return currentCost < bestCost ? current : best;
    });

    // Calculate total savings
    const mainChainCost = estimates[0]?.estimatedCost.standard || 0;
    const bestCost = bestOption.estimatedCost[bestOption.recommendation];
    const totalSavings = mainChainCost - bestCost;

    // Find alternative chains
    const alternativeChains = estimates
      .filter(e => e.chainId !== estimates[0]?.chainId)
      .map(e => ({
        chainId: e.chainId,
        chainName: e.chainName,
        estimatedCost: e.estimatedCost[e.recommendation],
        savings: mainChainCost - e.estimatedCost[e.recommendation],
      }))
      .filter(a => a.savings > 0)
      .sort((a, b) => b.savings - a.savings);

    return {
      transactionType,
      gasLimit,
      estimates,
      bestOption,
      totalSavings: Math.round(totalSavings * 100) / 100,
      alternativeChains,
    };
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
   * Calculate optimal gas price
   */
  calculateOptimalGasPrice(
    currentGasPrice: number,
    urgency: 'low' | 'medium' | 'high'
  ): {
    recommended: number;
    savings: number; // Percentage
    estimatedWait: number; // seconds
  } {
    let recommended = currentGasPrice;
    let savings = 0;
    let estimatedWait = 0;

    if (urgency === 'low') {
      recommended = currentGasPrice * 0.7;
      savings = 30;
      estimatedWait = 300; // 5 minutes
    } else if (urgency === 'medium') {
      recommended = currentGasPrice * 0.9;
      savings = 10;
      estimatedWait = 60; // 1 minute
    } else {
      recommended = currentGasPrice * 1.1;
      savings = -10; // More expensive but faster
      estimatedWait = 10; // 10 seconds
    }

    return {
      recommended: Math.round(recommended),
      savings,
      estimatedWait,
    };
  }

  /**
   * Compare fee strategies
   */
  compareStrategies(
    gasLimit: number,
    strategies: Array<{ name: string; gasPrice: number }>
  ): Array<{
    name: string;
    costUSD: number;
    estimatedTime: number;
    savings: number; // vs highest cost
  }> {
    const costs = strategies.map(s => ({
      name: s.name,
      costUSD: (gasLimit * s.gasPrice * this.ETH_PRICE_USD) / 1e18,
      estimatedTime: this.getBlockTime(1) * Math.ceil(s.gasPrice / 30e9),
    }));

    const maxCost = Math.max(...costs.map(c => c.costUSD));

    return costs.map(c => ({
      ...c,
      costUSD: Math.round(c.costUSD * 100) / 100,
      savings: Math.round((maxCost - c.costUSD) * 100) / 100,
    }));
  }
}

// Singleton instance
export const transactionFeeOptimizer = new TransactionFeeOptimizer();
