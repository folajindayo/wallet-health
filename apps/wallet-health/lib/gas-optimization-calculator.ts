/**
 * Gas Optimization Calculator Utility
 * Calculate optimal gas prices and estimate costs
 */

export interface GasPriceData {
  slow: number; // gwei
  standard: number; // gwei
  fast: number; // gwei
  instant?: number; // gwei
  timestamp: number;
  chainId: number;
}

export interface GasEstimate {
  gasLimit: number;
  gasPrice: number; // gwei
  totalGas: number; // wei
  costETH: string;
  costUSD?: number;
  estimatedTime?: number; // seconds
  priority: 'slow' | 'standard' | 'fast' | 'instant';
}

export interface OptimizationRecommendation {
  currentGasPrice: number;
  recommendedGasPrice: number;
  savings: {
    gas: number; // wei
    percentage: number;
    estimatedTime: number; // seconds
  };
  tradeoff: string;
}

export interface BatchOptimization {
  transactions: Array<{
    hash?: string;
    gasLimit: number;
    currentGasPrice: number;
    recommendedGasPrice: number;
    savings: number; // wei
  }>;
  totalSavings: number; // wei
  totalSavingsETH: string;
  totalSavingsUSD?: number;
  estimatedTimeSavings: number; // seconds
}

export class GasOptimizationCalculator {
  /**
   * Calculate gas estimate
   */
  calculateGasEstimate(
    gasLimit: number,
    gasPriceData: GasPriceData,
    priority: 'slow' | 'standard' | 'fast' | 'instant' = 'standard',
    ethPriceUSD?: number
  ): GasEstimate {
    const gasPriceGwei = this.getGasPriceForPriority(gasPriceData, priority);
    const gasPriceWei = gasPriceGwei * 1e9;
    const totalGas = gasLimit * gasPriceWei;
    const costETH = totalGas / 1e18;
    const costUSD = ethPriceUSD ? costETH * ethPriceUSD : undefined;
    const estimatedTime = this.estimateConfirmationTime(priority);

    return {
      gasLimit,
      gasPrice: gasPriceGwei,
      totalGas,
      costETH: costETH.toFixed(8),
      costUSD: costUSD ? Math.round(costUSD * 100) / 100 : undefined,
      estimatedTime,
      priority,
    };
  }

  /**
   * Get gas price for priority level
   */
  private getGasPriceForPriority(
    gasPriceData: GasPriceData,
    priority: 'slow' | 'standard' | 'fast' | 'instant'
  ): number {
    switch (priority) {
      case 'slow':
        return gasPriceData.slow;
      case 'standard':
        return gasPriceData.standard;
      case 'fast':
        return gasPriceData.fast;
      case 'instant':
        return gasPriceData.instant || gasPriceData.fast * 1.5;
      default:
        return gasPriceData.standard;
    }
  }

  /**
   * Estimate confirmation time based on priority
   */
  private estimateConfirmationTime(priority: string): number {
    switch (priority) {
      case 'slow':
        return 300; // 5 minutes
      case 'standard':
        return 120; // 2 minutes
      case 'fast':
        return 60; // 1 minute
      case 'instant':
        return 30; // 30 seconds
      default:
        return 120;
    }
  }

  /**
   * Get optimization recommendation
   */
  getOptimizationRecommendation(
    currentGasPrice: number, // gwei
    gasPriceData: GasPriceData,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): OptimizationRecommendation {
    let recommendedGasPrice: number;
    let tradeoff: string;

    if (urgency === 'low') {
      recommendedGasPrice = gasPriceData.slow;
      tradeoff = 'Lower cost but slower confirmation (5+ minutes)';
    } else if (urgency === 'high') {
      recommendedGasPrice = gasPriceData.fast;
      tradeoff = 'Faster confirmation but higher cost';
    } else {
      recommendedGasPrice = gasPriceData.standard;
      tradeoff = 'Balanced cost and speed (2-3 minutes)';
    }

    const currentWei = currentGasPrice * 1e9;
    const recommendedWei = recommendedGasPrice * 1e9;
    const savings = currentWei - recommendedWei;
    const percentage = currentGasPrice > 0
      ? ((savings / currentWei) * 100)
      : 0;

    const estimatedTime = this.estimateConfirmationTime(
      urgency === 'low' ? 'slow' : urgency === 'high' ? 'fast' : 'standard'
    );

    return {
      currentGasPrice,
      recommendedGasPrice,
      savings: {
        gas: savings,
        percentage: Math.round(percentage * 100) / 100,
        estimatedTime,
      },
      tradeoff,
    };
  }

  /**
   * Optimize batch transactions
   */
  optimizeBatch(
    transactions: Array<{
      hash?: string;
      gasLimit: number;
      currentGasPrice: number; // gwei
    }>,
    gasPriceData: GasPriceData,
    priority: 'slow' | 'standard' | 'fast' | 'instant' = 'standard',
    ethPriceUSD?: number
  ): BatchOptimization {
    const recommendedGasPrice = this.getGasPriceForPriority(gasPriceData, priority);
    const recommendedWei = recommendedGasPrice * 1e9;

    const optimized = transactions.map(tx => {
      const currentWei = tx.currentGasPrice * 1e9;
      const savings = currentWei - recommendedWei;
      const totalSavings = savings * tx.gasLimit;

      return {
        hash: tx.hash,
        gasLimit: tx.gasLimit,
        currentGasPrice: tx.currentGasPrice,
        recommendedGasPrice,
        savings: totalSavings,
      };
    });

    const totalSavings = optimized.reduce((sum, tx) => sum + tx.savings, 0);
    const totalSavingsETH = totalSavings / 1e18;
    const totalSavingsUSD = ethPriceUSD ? totalSavingsETH * ethPriceUSD : undefined;
    const estimatedTimeSavings = this.estimateConfirmationTime(priority);

    return {
      transactions: optimized,
      totalSavings,
      totalSavingsETH: totalSavingsETH.toFixed(8),
      totalSavingsUSD: totalSavingsUSD ? Math.round(totalSavingsUSD * 100) / 100 : undefined,
      estimatedTimeSavings,
    };
  }

  /**
   * Calculate gas savings for approval revocation
   */
  calculateRevokeSavings(
    approvalCount: number,
    currentGasPrice: number, // gwei
    optimizedGasPrice: number // gwei
  ): {
    currentCost: string; // ETH
    optimizedCost: string; // ETH
    savings: string; // ETH
    savingsPercentage: number;
  } {
    const gasPerRevoke = 100000; // ~100k gas per revoke
    const currentWei = currentGasPrice * 1e9;
    const optimizedWei = optimizedGasPrice * 1e9;

    const currentCost = (approvalCount * gasPerRevoke * currentWei) / 1e18;
    const optimizedCost = (approvalCount * gasPerRevoke * optimizedWei) / 1e18;
    const savings = currentCost - optimizedCost;
    const savingsPercentage = currentCost > 0
      ? (savings / currentCost) * 100
      : 0;

    return {
      currentCost: currentCost.toFixed(8),
      optimizedCost: optimizedCost.toFixed(8),
      savings: savings.toFixed(8),
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
    };
  }

  /**
   * Compare gas prices across chains
   */
  compareGasPrices(
    gasPrices: Array<{
      chainId: number;
      chainName: string;
      gasPriceData: GasPriceData;
    }>
  ): Array<{
    chainId: number;
    chainName: string;
    standardGasPrice: number;
    costForStandardTx: string; // ETH equivalent
    rank: number;
  }> {
    const standardGasLimit = 21000; // Standard ETH transfer

    const comparisons = gasPrices.map(({ chainId, chainName, gasPriceData }) => {
      const gasPriceWei = gasPriceData.standard * 1e9;
      const costWei = standardGasLimit * gasPriceWei;
      const costETH = costWei / 1e18;

      return {
        chainId,
        chainName,
        standardGasPrice: gasPriceData.standard,
        costForStandardTx: costETH.toFixed(8),
        rank: 0, // Will be set after sorting
      };
    });

    // Sort by cost (lowest first)
    comparisons.sort((a, b) => {
      const costA = parseFloat(a.costForStandardTx);
      const costB = parseFloat(b.costForStandardTx);
      return costA - costB;
    });

    // Assign ranks
    comparisons.forEach((comp, index) => {
      comp.rank = index + 1;
    });

    return comparisons;
  }

  /**
   * Get optimal gas price for time target
   */
  getOptimalGasPriceForTime(
    gasPriceData: GasPriceData,
    targetTimeSeconds: number
  ): {
    recommendedGasPrice: number; // gwei
    estimatedTime: number; // seconds
    costMultiplier: number; // compared to slow
  } {
    if (targetTimeSeconds <= 30) {
      return {
        recommendedGasPrice: gasPriceData.instant || gasPriceData.fast * 1.5,
        estimatedTime: 30,
        costMultiplier: 2.5,
      };
    } else if (targetTimeSeconds <= 60) {
      return {
        recommendedGasPrice: gasPriceData.fast,
        estimatedTime: 60,
        costMultiplier: 2.0,
      };
    } else if (targetTimeSeconds <= 120) {
      return {
        recommendedGasPrice: gasPriceData.standard,
        estimatedTime: 120,
        costMultiplier: 1.5,
      };
    } else {
      return {
        recommendedGasPrice: gasPriceData.slow,
        estimatedTime: 300,
        costMultiplier: 1.0,
      };
    }
  }
}

// Singleton instance
export const gasOptimizationCalculator = new GasOptimizationCalculator();

