/**
 * Transaction Fee Optimizer Utility
 * Optimize transaction fees across different chains and scenarios
 */

export interface FeeOptimization {
  chainId: number;
  chainName: string;
  currentFee: string; // in native token
  optimizedFee: string;
  savings: string;
  savingsPercentage: number;
  estimatedTime: number; // seconds
  priority: 'slow' | 'standard' | 'fast' | 'instant';
  recommendation: string;
}

export interface BatchFeeOptimization {
  transactions: Array<{
    hash?: string;
    chainId: number;
    currentFee: string;
    optimizedFee: string;
    savings: string;
  }>;
  totalSavings: string;
  totalSavingsUSD?: number;
  recommendations: string[];
}

export interface FeeComparison {
  chains: Array<{
    chainId: number;
    chainName: string;
    fee: string;
    feeUSD?: number;
    estimatedTime: number;
    rank: number;
  }>;
  cheapest: number; // chainId
  fastest: number; // chainId
  bestValue: number; // chainId
}

export class TransactionFeeOptimizer {
  /**
   * Optimize fee for a specific transaction
   */
  optimizeFee(
    chainId: number,
    gasLimit: number,
    currentGasPrice: number, // gwei
    gasPriceData: {
      slow: number;
      standard: number;
      fast: number;
      instant?: number;
    },
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): FeeOptimization {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      56: 'BNB Chain',
      137: 'Polygon',
      8453: 'Base',
      42161: 'Arbitrum',
      10: 'Optimism',
    };

    let optimizedGasPrice: number;
    let priority: FeeOptimization['priority'];
    let estimatedTime: number;
    let recommendation: string;

    if (urgency === 'low') {
      optimizedGasPrice = gasPriceData.slow;
      priority = 'slow';
      estimatedTime = 300; // 5 minutes
      recommendation = 'Use slow priority for maximum savings';
    } else if (urgency === 'high') {
      optimizedGasPrice = gasPriceData.fast;
      priority = 'fast';
      estimatedTime = 60; // 1 minute
      recommendation = 'Use fast priority for quick confirmation';
    } else {
      optimizedGasPrice = gasPriceData.standard;
      priority = 'standard';
      estimatedTime = 120; // 2 minutes
      recommendation = 'Use standard priority for balanced cost and speed';
    }

    const currentFee = (gasLimit * currentGasPrice * 1e9) / 1e18;
    const optimizedFee = (gasLimit * optimizedGasPrice * 1e9) / 1e18;
    const savings = currentFee - optimizedFee;
    const savingsPercentage = currentFee > 0
      ? (savings / currentFee) * 100
      : 0;

    return {
      chainId,
      chainName: chainNames[chainId] || `Chain ${chainId}`,
      currentFee: currentFee.toFixed(8),
      optimizedFee: optimizedFee.toFixed(8),
      savings: savings.toFixed(8),
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
      estimatedTime,
      priority,
      recommendation,
    };
  }

  /**
   * Optimize batch of transactions
   */
  optimizeBatch(
    transactions: Array<{
      hash?: string;
      chainId: number;
      gasLimit: number;
      currentGasPrice: number;
    }>,
    gasPriceDataMap: Map<number, {
      slow: number;
      standard: number;
      fast: number;
    }>,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): BatchFeeOptimization {
    const optimized: BatchFeeOptimization['transactions'] = [];
    let totalSavings = 0;

    transactions.forEach(tx => {
      const gasPriceData = gasPriceDataMap.get(tx.chainId);
      if (!gasPriceData) return;

      const optimization = this.optimizeFee(
        tx.chainId,
        tx.gasLimit,
        tx.currentGasPrice,
        gasPriceData,
        urgency
      );

      optimized.push({
        hash: tx.hash,
        chainId: tx.chainId,
        currentFee: optimization.currentFee,
        optimizedFee: optimization.optimizedFee,
        savings: optimization.savings,
      });

      totalSavings += parseFloat(optimization.savings);
    });

    const recommendations: string[] = [];
    if (optimized.length > 5) {
      recommendations.push('Consider batching transactions to save gas');
    }
    if (urgency === 'low') {
      recommendations.push('Using slow priority can save significant fees');
    }

    return {
      transactions: optimized,
      totalSavings: totalSavings.toFixed(8),
      recommendations,
    };
  }

  /**
   * Compare fees across chains
   */
  compareFeesAcrossChains(
    gasLimit: number,
    gasPriceDataMap: Map<number, {
      slow: number;
      standard: number;
      fast: number;
      chainName: string;
    }>
  ): FeeComparison {
    const chains: FeeComparison['chains'] = [];

    gasPriceDataMap.forEach((gasPriceData, chainId) => {
      const fee = (gasLimit * gasPriceData.standard * 1e9) / 1e18;
      chains.push({
        chainId,
        chainName: gasPriceData.chainName,
        fee: fee.toFixed(8),
        estimatedTime: 120, // standard priority
        rank: 0, // Will be set after sorting
      });
    });

    // Sort by fee (cheapest first)
    chains.sort((a, b) => parseFloat(a.fee) - parseFloat(b.fee));

    // Assign ranks
    chains.forEach((chain, index) => {
      chain.rank = index + 1;
    });

    const cheapest = chains[0]?.chainId || 0;
    const fastest = chains[0]?.chainId || 0; // Would need actual confirmation times
    const bestValue = chains[0]?.chainId || 0; // Would consider both fee and speed

    return {
      chains,
      cheapest,
      fastest,
      bestValue,
    };
  }

  /**
   * Calculate optimal fee for time target
   */
  calculateOptimalFeeForTime(
    chainId: number,
    gasLimit: number,
    gasPriceData: {
      slow: number;
      standard: number;
      fast: number;
      instant?: number;
    },
    targetTimeSeconds: number
  ): {
    recommendedGasPrice: number;
    estimatedFee: string;
    estimatedTime: number;
    confidence: number;
  } {
    let recommendedGasPrice: number;
    let estimatedTime: number;

    if (targetTimeSeconds <= 30) {
      recommendedGasPrice = gasPriceData.instant || gasPriceData.fast * 1.5;
      estimatedTime = 30;
    } else if (targetTimeSeconds <= 60) {
      recommendedGasPrice = gasPriceData.fast;
      estimatedTime = 60;
    } else if (targetTimeSeconds <= 120) {
      recommendedGasPrice = gasPriceData.standard;
      estimatedTime = 120;
    } else {
      recommendedGasPrice = gasPriceData.slow;
      estimatedTime = 300;
    }

    const estimatedFee = (gasLimit * recommendedGasPrice * 1e9) / 1e18;
    const timeDiff = Math.abs(estimatedTime - targetTimeSeconds);
    const confidence = Math.max(0, 100 - (timeDiff / targetTimeSeconds) * 100);

    return {
      recommendedGasPrice,
      estimatedFee: estimatedFee.toFixed(8),
      estimatedTime,
      confidence: Math.round(confidence),
    };
  }

  /**
   * Estimate total fees for multiple transactions
   */
  estimateTotalFees(
    transactions: Array<{
      chainId: number;
      gasLimit: number;
      gasPrice: number;
    }>,
    ethPriceUSD?: number
  ): {
    totalFeeETH: string;
    totalFeeUSD?: number;
    feesByChain: Array<{
      chainId: number;
      fee: string;
      feeUSD?: number;
    }>;
  } {
    const feesByChain = new Map<number, number>();

    transactions.forEach(tx => {
      const fee = (tx.gasLimit * tx.gasPrice * 1e9) / 1e18;
      const current = feesByChain.get(tx.chainId) || 0;
      feesByChain.set(tx.chainId, current + fee);
    });

    const feesByChainArray = Array.from(feesByChain.entries()).map(([chainId, fee]) => ({
      chainId,
      fee: fee.toFixed(8),
      feeUSD: ethPriceUSD ? Math.round(fee * ethPriceUSD * 100) / 100 : undefined,
    }));

    const totalFeeETH = Array.from(feesByChain.values())
      .reduce((sum, fee) => sum + fee, 0);

    return {
      totalFeeETH: totalFeeETH.toFixed(8),
      totalFeeUSD: ethPriceUSD
        ? Math.round(totalFeeETH * ethPriceUSD * 100) / 100
        : undefined,
      feesByChain: feesByChainArray,
    };
  }
}

// Singleton instance
export const transactionFeeOptimizer = new TransactionFeeOptimizer();

