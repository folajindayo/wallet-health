/**
 * Transaction Cost Optimizer
 * Optimizes transaction costs across different strategies and chains
 */

export interface CostOptimization {
  strategy: 'immediate' | 'wait' | 'batch' | 'layer2' | 'scheduled';
  estimatedSavings: number; // in USD
  estimatedSavingsPercent: number;
  currentCost: number; // in USD
  optimizedCost: number; // in USD
  waitTime?: number; // minutes to wait for better gas
  recommendations: string[];
  gasPriceData: {
    current: number; // gwei
    recommended: number; // gwei
    fast: number;
    standard: number;
    slow: number;
  };
}

export interface BatchOptimization {
  transactions: Array<{
    hash?: string;
    to: string;
    value: string;
    data?: string;
    gasLimit: number;
  }>;
  batchCost: number; // in USD
  individualCost: number; // in USD
  savings: number; // in USD
  savingsPercent: number;
  estimatedGasLimit: number;
  recommendations: string[];
}

export interface CrossChainComparison {
  chains: Array<{
    chainId: number;
    chainName: string;
    costUSD: number;
    gasPrice: number; // gwei
    timeToConfirm: number; // minutes
    recommendation: boolean;
  }>;
  bestChain: {
    chainId: number;
    chainName: string;
    costUSD: number;
    savings: number;
  };
}

export class TransactionCostOptimizer {
  private gasPriceHistory: Map<number, Array<{ timestamp: number; price: number }>> = new Map();
  private ethPriceUSD: number = 2000; // Default, should be updated from price feed

  /**
   * Optimize transaction cost
   */
  optimizeCost(params: {
    chainId: number;
    gasLimit: number;
    currentGasPrice: number; // gwei
    urgency: 'low' | 'medium' | 'high';
    gasPriceData?: {
      slow: number;
      standard: number;
      fast: number;
    };
  }): CostOptimization {
    const { chainId, gasLimit, currentGasPrice, urgency, gasPriceData } = params;

    // Get gas price data
    const prices = gasPriceData || this.getDefaultGasPrices(chainId);
    const currentCost = this.calculateCost(gasLimit, currentGasPrice);

    // Determine best strategy
    let strategy: CostOptimization['strategy'] = 'immediate';
    let optimizedCost = currentCost;
    let waitTime: number | undefined;
    let recommendations: string[] = [];

    if (urgency === 'low') {
      // Can wait for better gas
      if (prices.slow < currentGasPrice * 0.8) {
        strategy = 'wait';
        optimizedCost = this.calculateCost(gasLimit, prices.slow);
        waitTime = this.estimateWaitTime(chainId, prices.slow);
        recommendations.push(`Wait ${waitTime} minutes for lower gas prices`);
        recommendations.push(`Use slow gas price: ${prices.slow} gwei`);
      } else {
        strategy = 'immediate';
        optimizedCost = this.calculateCost(gasLimit, prices.standard);
        recommendations.push('Use standard gas price for best balance');
      }
    } else if (urgency === 'medium') {
      strategy = 'immediate';
      optimizedCost = this.calculateCost(gasLimit, prices.standard);
      recommendations.push('Use standard gas price');
    } else {
      strategy = 'immediate';
      optimizedCost = this.calculateCost(gasLimit, prices.fast);
      recommendations.push('Use fast gas price for urgent transactions');
    }

    // Check if Layer 2 would be cheaper
    const l2Cost = this.estimateL2Cost(chainId, gasLimit);
    if (l2Cost && l2Cost < optimizedCost * 0.5) {
      recommendations.push(`Consider using Layer 2 - estimated cost: $${l2Cost.toFixed(4)}`);
    }

    const savings = currentCost - optimizedCost;
    const savingsPercent = currentCost > 0 ? (savings / currentCost) * 100 : 0;

    return {
      strategy,
      estimatedSavings: Math.max(0, savings),
      estimatedSavingsPercent: Math.round(savingsPercent * 100) / 100,
      currentCost,
      optimizedCost,
      waitTime,
      recommendations,
      gasPriceData: {
        current: currentGasPrice,
        recommended: strategy === 'wait' ? prices.slow : prices.standard,
        fast: prices.fast,
        standard: prices.standard,
        slow: prices.slow,
      },
    };
  }

  /**
   * Optimize batch transactions
   */
  optimizeBatch(params: {
    chainId: number;
    transactions: Array<{
      to: string;
      value: string;
      data?: string;
      gasLimit: number;
    }>;
    gasPrice: number;
  }): BatchOptimization {
    const { chainId, transactions, gasPrice } = params;

    // Calculate individual costs
    const individualCost = transactions.reduce(
      (sum, tx) => sum + this.calculateCost(tx.gasLimit, gasPrice),
      0
    );

    // Estimate batch gas limit (base + per transaction overhead)
    const baseGas = 21000;
    const perTxOverhead = 5000; // Approximate overhead per transaction in batch
    const estimatedGasLimit = baseGas + transactions.reduce((sum, tx) => sum + tx.gasLimit + perTxOverhead, 0);

    // Batch cost
    const batchCost = this.calculateCost(estimatedGasLimit, gasPrice);

    const savings = individualCost - batchCost;
    const savingsPercent = individualCost > 0 ? (savings / individualCost) * 100 : 0;

    const recommendations: string[] = [];
    if (savings > 0) {
      recommendations.push(`Batching saves $${savings.toFixed(4)} (${savingsPercent.toFixed(1)}%)`);
      recommendations.push(`Estimated batch gas limit: ${estimatedGasLimit.toLocaleString()}`);
    } else {
      recommendations.push('Batching may not provide significant savings for these transactions');
    }

    if (transactions.length > 10) {
      recommendations.push('Large batch detected - consider splitting into smaller batches');
    }

    return {
      transactions,
      batchCost,
      individualCost,
      savings: Math.max(0, savings),
      savingsPercent: Math.round(savingsPercent * 100) / 100,
      estimatedGasLimit,
      recommendations,
    };
  }

  /**
   * Compare costs across chains
   */
  compareChains(params: {
    gasLimit: number;
    chains: Array<{
      chainId: number;
      chainName: string;
      gasPrice: number; // gwei
      nativeTokenPriceUSD?: number;
    }>;
  }): CrossChainComparison {
    const { gasLimit, chains } = params;

    const chainComparisons = chains.map((chain) => {
      const nativePrice = chain.nativeTokenPriceUSD || this.getNativeTokenPrice(chain.chainId);
      const costUSD = this.calculateCostUSD(gasLimit, chain.gasPrice, nativePrice);
      const timeToConfirm = this.estimateConfirmationTime(chain.chainId);

      return {
        chainId: chain.chainId,
        chainName: chain.chainName,
        costUSD: Math.round(costUSD * 10000) / 10000,
        gasPrice: chain.gasPrice,
        timeToConfirm,
        recommendation: false,
      };
    });

    // Find cheapest chain
    const sorted = [...chainComparisons].sort((a, b) => a.costUSD - b.costUSD);
    const bestChain = sorted[0];
    bestChain.recommendation = true;

    const maxCost = Math.max(...chainComparisons.map((c) => c.costUSD));
    const savings = maxCost - bestChain.costUSD;

    return {
      chains: chainComparisons,
      bestChain: {
        chainId: bestChain.chainId,
        chainName: bestChain.chainName,
        costUSD: bestChain.costUSD,
        savings: Math.round(savings * 10000) / 10000,
      },
    };
  }

  /**
   * Calculate cost in USD
   */
  private calculateCost(gasLimit: number, gasPriceGwei: number): number {
    const gasPriceWei = gasPriceGwei * 1e9;
    const costWei = BigInt(gasLimit) * BigInt(Math.floor(gasPriceWei));
    const costEth = Number(costWei) / 1e18;
    return costEth * this.ethPriceUSD;
  }

  /**
   * Calculate cost in USD with custom token price
   */
  private calculateCostUSD(gasLimit: number, gasPriceGwei: number, tokenPriceUSD: number): number {
    const gasPriceWei = gasPriceGwei * 1e9;
    const costWei = BigInt(gasLimit) * BigInt(Math.floor(gasPriceWei));
    const costNative = Number(costWei) / 1e18;
    return costNative * tokenPriceUSD;
  }

  /**
   * Get default gas prices for chain
   */
  private getDefaultGasPrices(chainId: number): { slow: number; standard: number; fast: number } {
    // Default gas prices by chain (in gwei)
    const defaults: Record<number, { slow: number; standard: number; fast: number }> = {
      1: { slow: 20, standard: 30, fast: 40 }, // Ethereum
      56: { slow: 3, standard: 5, fast: 7 }, // BSC
      137: { slow: 30, standard: 50, fast: 70 }, // Polygon
      8453: { slow: 0.1, standard: 0.1, fast: 0.1 }, // Base
      42161: { slow: 0.1, standard: 0.1, fast: 0.1 }, // Arbitrum
    };

    return defaults[chainId] || { slow: 1, standard: 2, fast: 3 };
  }

  /**
   * Get native token price
   */
  private getNativeTokenPrice(chainId: number): number {
    const prices: Record<number, number> = {
      1: 2000, // ETH
      56: 300, // BNB
      137: 0.5, // MATIC
      8453: 2000, // ETH (Base)
      42161: 2000, // ETH (Arbitrum)
    };
    return prices[chainId] || 1;
  }

  /**
   * Estimate wait time for gas price
   */
  private estimateWaitTime(chainId: number, targetGasPrice: number): number {
    // Simple estimation - in production would use historical data
    return 15; // minutes
  }

  /**
   * Estimate Layer 2 cost
   */
  private estimateL2Cost(chainId: number, gasLimit: number): number | null {
    // Only estimate if not already on L2
    if ([8453, 42161, 10].includes(chainId)) {
      return null; // Already on L2
    }

    // Estimate L2 cost (typically much cheaper)
    const l2GasPrice = 0.1; // gwei
    return this.calculateCost(gasLimit, l2GasPrice);
  }

  /**
   * Estimate confirmation time
   */
  private estimateConfirmationTime(chainId: number): number {
    const times: Record<number, number> = {
      1: 12, // Ethereum ~12 minutes
      56: 3, // BSC ~3 seconds
      137: 2, // Polygon ~2 seconds
      8453: 2, // Base ~2 seconds
      42161: 1, // Arbitrum ~1 second
    };
    return times[chainId] || 5;
  }

  /**
   * Update ETH price
   */
  updateEthPrice(priceUSD: number): void {
    this.ethPriceUSD = priceUSD;
  }

  /**
   * Add gas price data point
   */
  addGasPriceData(chainId: number, price: number): void {
    const history = this.gasPriceHistory.get(chainId) || [];
    history.push({ timestamp: Date.now(), price });
    // Keep only last 1000 data points
    if (history.length > 1000) {
      history.shift();
    }
    this.gasPriceHistory.set(chainId, history);
  }
}

// Singleton instance
export const transactionCostOptimizer = new TransactionCostOptimizer();

