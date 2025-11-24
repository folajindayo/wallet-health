/**
 * Transaction Fee Optimizer
 * Optimizes transaction fees across different chains and strategies
 */

export interface FeeOptimization {
  chainId: number;
  currentFee: {
    gasPrice: number; // gwei
    gasLimit: number;
    totalFee: string; // in native token
    totalFeeUSD?: number;
  };
  optimizedFee: {
    gasPrice: number;
    gasLimit: number;
    totalFee: string;
    totalFeeUSD?: number;
    strategy: 'time_delay' | 'chain_switch' | 'batch' | 'l2' | 'optimized_gas';
  };
  savings: {
    feeSavings: string;
    feeSavingsUSD?: number;
    savingsPercentage: number;
    estimatedWaitTime: string;
  };
  recommendation: string;
}

export interface CrossChainFeeComparison {
  transactionType: 'transfer' | 'swap' | 'approval' | 'contract_call';
  gasEstimate: number;
  comparisons: Array<{
    chainId: number;
    chainName: string;
    gasPrice: number;
    totalFee: string;
    totalFeeUSD?: number;
    estimatedTime: string;
    recommendation: 'best' | 'good' | 'acceptable' | 'expensive';
  }>;
  bestOption: {
    chainId: number;
    chainName: string;
    savingsUSD?: number;
  };
}

export class TransactionFeeOptimizer {
  /**
   * Optimize transaction fee
   */
  optimizeFee(
    chainId: number,
    gasEstimate: number,
    urgency: 'low' | 'medium' | 'high' = 'medium',
    currentGasPrice?: number
  ): FeeOptimization {
    // Get current gas price (would fetch from gas tracker)
    const currentGas = currentGasPrice || 30; // Default 30 gwei
    const currentTotalFee = (currentGas * gasEstimate) / 1e9; // in ETH

    // Determine optimal strategy
    let optimizedGas: number;
    let strategy: FeeOptimization['optimizedFee']['strategy'];
    let estimatedWaitTime: string;

    if (urgency === 'low') {
      // Use slow gas for low urgency
      optimizedGas = currentGas * 0.7; // 30% reduction
      strategy = 'time_delay';
      estimatedWaitTime = '5-15 minutes';
    } else if (urgency === 'high') {
      // Use fast gas for high urgency
      optimizedGas = currentGas;
      strategy = 'optimized_gas';
      estimatedWaitTime = '30-60 seconds';
    } else {
      // Medium urgency - use standard
      optimizedGas = currentGas * 0.85; // 15% reduction
      strategy = 'optimized_gas';
      estimatedWaitTime = '1-3 minutes';
    }

    const optimizedTotalFee = (optimizedGas * gasEstimate) / 1e9;
    const feeSavings = currentTotalFee - optimizedTotalFee;
    const savingsPercentage = currentTotalFee > 0
      ? (feeSavings / currentTotalFee) * 100
      : 0;

    let recommendation = '';
    if (savingsPercentage > 10) {
      recommendation = `Wait and use optimized gas to save ${savingsPercentage.toFixed(1)}%`;
    } else {
      recommendation = 'Current gas price is reasonable for your urgency level';
    }

    return {
      chainId,
      currentFee: {
        gasPrice: currentGas,
        gasLimit: gasEstimate,
        totalFee: currentTotalFee.toString(),
      },
      optimizedFee: {
        gasPrice: optimizedGas,
        gasLimit: gasEstimate,
        totalFee: optimizedTotalFee.toString(),
        strategy,
      },
      savings: {
        feeSavings: feeSavings.toString(),
        savingsPercentage: Math.round(savingsPercentage * 100) / 100,
        estimatedWaitTime,
      },
      recommendation,
    };
  }

  /**
   * Compare fees across chains
   */
  compareCrossChainFees(
    transactionType: 'transfer' | 'swap' | 'approval' | 'contract_call',
    gasEstimate: number,
    chains: number[] = [1, 137, 56, 8453, 42161] // Ethereum, Polygon, BSC, Base, Arbitrum
  ): CrossChainFeeComparison {
    // Gas estimates by transaction type
    const gasEstimates: Record<string, number> = {
      transfer: 21000,
      approval: 46000,
      swap: 150000,
      contract_call: 100000,
    };

    const actualGasEstimate = gasEstimates[transactionType] || gasEstimate;

    // Mock gas prices (would fetch from gas tracker)
    const chainGasPrices: Record<number, { price: number; name: string }> = {
      1: { price: 30, name: 'Ethereum' },
      137: { price: 50, name: 'Polygon' },
      56: { price: 3, name: 'BNB Chain' },
      8453: { price: 0.1, name: 'Base' },
      42161: { price: 0.1, name: 'Arbitrum' },
    };

    const comparisons = chains.map(chainId => {
      const chainInfo = chainGasPrices[chainId] || { price: 30, name: `Chain ${chainId}` };
      const totalFee = (chainInfo.price * actualGasEstimate) / 1e9;

      // Determine recommendation
      const fees = chains.map(c => {
        const info = chainGasPrices[c] || { price: 30, name: '' };
        return (info.price * actualGasEstimate) / 1e9;
      });
      const minFee = Math.min(...fees);
      const maxFee = Math.max(...fees);
      const feeRange = maxFee - minFee;

      let recommendation: 'best' | 'good' | 'acceptable' | 'expensive';
      if (totalFee === minFee) {
        recommendation = 'best';
      } else if (totalFee <= minFee + feeRange * 0.33) {
        recommendation = 'good';
      } else if (totalFee <= minFee + feeRange * 0.66) {
        recommendation = 'acceptable';
      } else {
        recommendation = 'expensive';
      }

      return {
        chainId,
        chainName: chainInfo.name,
        gasPrice: chainInfo.price,
        totalFee: totalFee.toString(),
        estimatedTime: this.estimateConfirmationTime(chainInfo.price),
        recommendation,
      };
    });

    // Find best option
    const best = comparisons.reduce((best, current) => {
      const bestFee = parseFloat(best.totalFee);
      const currentFee = parseFloat(current.totalFee);
      return currentFee < bestFee ? current : best;
    }, comparisons[0]);

    return {
      transactionType,
      gasEstimate: actualGasEstimate,
      comparisons,
      bestOption: {
        chainId: best.chainId,
        chainName: best.chainName,
      },
    };
  }

  /**
   * Estimate batch transaction savings
   */
  estimateBatchSavings(
    chainId: number,
    transactionCount: number,
    gasPerTransaction: number
  ): {
    individualTotal: string;
    batchedTotal: string;
    savings: string;
    savingsPercentage: number;
  } {
    const baseGas = 21000;
    const gasPerTx = gasPerTransaction;
    const batchOverhead = 5000; // Additional gas for batch

    const individualTotal = (gasPerTx * transactionCount) / 1e9;
    const batchedTotal = (baseGas + gasPerTx * transactionCount + batchOverhead) / 1e9;

    const savings = individualTotal - batchedTotal;
    const savingsPercentage = individualTotal > 0
      ? (savings / individualTotal) * 100
      : 0;

    return {
      individualTotal: individualTotal.toString(),
      batchedTotal: batchedTotal.toString(),
      savings: savings.toString(),
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
    };
  }

  /**
   * Recommend optimal chain
   */
  recommendOptimalChain(
    transactionType: 'transfer' | 'swap' | 'approval' | 'contract_call',
    urgency: 'low' | 'medium' | 'high' = 'medium',
    valueUSD?: number
  ): {
    recommendedChain: number;
    chainName: string;
    reason: string;
    estimatedFee: string;
  } {
    const comparison = this.compareCrossChainFees(transactionType, 0);

    // For high-value transactions, prefer Ethereum for security
    if (valueUSD && valueUSD > 10000 && urgency !== 'high') {
      return {
        recommendedChain: 1,
        chainName: 'Ethereum',
        reason: 'High-value transaction - Ethereum provides best security',
        estimatedFee: comparison.comparisons.find(c => c.chainId === 1)?.totalFee || '0',
      };
    }

    // For low urgency, prefer L2s
    if (urgency === 'low') {
      const l2 = comparison.comparisons.find(c => c.chainId === 8453 || c.chainId === 42161);
      if (l2) {
        return {
          recommendedChain: l2.chainId,
          chainName: l2.chainName,
          reason: 'Low urgency - L2 provides best fees',
          estimatedFee: l2.totalFee,
        };
      }
    }

    // Default to best fee option
    return {
      recommendedChain: comparison.bestOption.chainId,
      chainName: comparison.bestOption.chainName,
      reason: 'Best fee option for this transaction type',
      estimatedFee: comparison.comparisons.find(
        c => c.chainId === comparison.bestOption.chainId
      )?.totalFee || '0',
    };
  }

  /**
   * Private helper methods
   */

  private estimateConfirmationTime(gasPrice: number): string {
    if (gasPrice < 1) return '10-30 seconds'; // L2
    if (gasPrice < 20) return '5-15 minutes';
    if (gasPrice < 50) return '1-3 minutes';
    if (gasPrice < 100) return '30-60 seconds';
    return '10-30 seconds';
  }
}

// Singleton instance
export const transactionFeeOptimizer = new TransactionFeeOptimizer();
