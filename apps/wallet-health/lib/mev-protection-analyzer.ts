/**
 * MEV Protection Analyzer
 * Analyzes transactions for MEV risks and protection strategies
 */

export interface MEVRisk {
  type: 'sandwich' | 'frontrunning' | 'backrunning' | 'arbitrage' | 'liquidation';
  severity: 'high' | 'medium' | 'low';
  description: string;
  estimatedLoss?: string;
  estimatedLossUSD?: number;
  protectionAvailable: boolean;
  recommendations: string[];
}

export interface MEVAnalysis {
  transactionHash: string;
  timestamp: number;
  risks: MEVRisk[];
  protectionScore: number; // 0-100
  protectionLevel: 'protected' | 'partial' | 'unprotected';
  recommendations: string[];
  estimatedMEVExtracted?: string;
  estimatedMEVExtractedUSD?: number;
}

export interface MEVProtectionStrategy {
  name: string;
  type: 'private_mempool' | 'flashbots' | 'cowswap' | '1inch_fusion' | 'other';
  description: string;
  effectiveness: number; // 0-100
  cost: 'free' | 'low' | 'medium' | 'high';
  supportedChains: number[];
}

export class MEVProtectionAnalyzer {
  private readonly protectionStrategies: MEVProtectionStrategy[] = [
    {
      name: 'Flashbots Protect',
      type: 'flashbots',
      description: 'Private mempool for Ethereum transactions',
      effectiveness: 95,
      cost: 'free',
      supportedChains: [1],
    },
    {
      name: 'CoW Swap',
      type: 'cowswap',
      description: 'MEV-protected DEX aggregator',
      effectiveness: 90,
      cost: 'free',
      supportedChains: [1, 100],
    },
    {
      name: '1inch Fusion',
      type: '1inch_fusion',
      description: 'Intent-based swaps with MEV protection',
      effectiveness: 85,
      cost: 'low',
      supportedChains: [1, 137, 56, 42161],
    },
    {
      name: 'Private Mempool',
      type: 'private_mempool',
      description: 'Use RPC with private transaction submission',
      effectiveness: 70,
      cost: 'low',
      supportedChains: [1],
    },
  ];

  /**
   * Analyze transaction for MEV risks
   */
  analyzeTransaction(
    transaction: {
      hash: string;
      timestamp: number;
      from: string;
      to: string;
      value: string;
      data?: string;
      gasPrice?: string;
      maxFeePerGas?: string;
      maxPriorityFeePerGas?: string;
      chainId: number;
      type?: 'swap' | 'liquidity' | 'transfer' | 'other';
    }
  ): MEVAnalysis {
    const risks: MEVRisk[] = [];
    let protectionScore = 100;

    // Check transaction type
    if (transaction.type === 'swap' || this.isSwapTransaction(transaction)) {
      // High risk for swaps
      risks.push({
        type: 'sandwich',
        severity: 'high',
        description: 'Swap transactions are vulnerable to sandwich attacks',
        estimatedLoss: this.estimateSandwichLoss(transaction),
        protectionAvailable: true,
        recommendations: [
          'Use MEV-protected DEX like CoW Swap',
          'Use Flashbots Protect for large swaps',
          'Split large swaps into smaller transactions',
        ],
      });
      protectionScore -= 30;
    }

    // Check gas price (high gas = potential frontrunning target)
    if (transaction.maxFeePerGas || transaction.gasPrice) {
      const gasPrice = transaction.maxFeePerGas
        ? parseFloat(transaction.maxFeePerGas) / 1e9
        : parseFloat(transaction.gasPrice || '0') / 1e9;

      if (gasPrice > 100) {
        risks.push({
          type: 'frontrunning',
          severity: 'medium',
          description: 'High gas price makes transaction attractive for frontrunning',
          protectionAvailable: true,
          recommendations: [
            'Use private mempool or Flashbots',
            'Consider using lower gas price during off-peak hours',
          ],
        });
        protectionScore -= 15;
      }
    }

    // Check if using protection
    const isProtected = this.checkProtection(transaction);
    if (!isProtected) {
      risks.push({
        type: 'frontrunning',
        severity: 'medium',
        description: 'Transaction not using MEV protection',
        protectionAvailable: true,
        recommendations: this.getProtectionRecommendations(transaction.chainId),
      });
      protectionScore -= 20;
    }

    // Determine protection level
    let protectionLevel: 'protected' | 'partial' | 'unprotected';
    if (protectionScore >= 80) {
      protectionLevel = 'protected';
    } else if (protectionScore >= 50) {
      protectionLevel = 'partial';
    } else {
      protectionLevel = 'unprotected';
    }

    // Aggregate recommendations
    const allRecommendations = risks.flatMap(r => r.recommendations);
    const uniqueRecommendations = Array.from(new Set(allRecommendations));

    return {
      transactionHash: transaction.hash,
      timestamp: transaction.timestamp,
      risks,
      protectionScore: Math.max(0, Math.min(100, protectionScore)),
      protectionLevel,
      recommendations: uniqueRecommendations,
    };
  }

  /**
   * Get available protection strategies for chain
   */
  getProtectionStrategies(chainId: number): MEVProtectionStrategy[] {
    return this.protectionStrategies.filter(s =>
      s.supportedChains.includes(chainId)
    );
  }

  /**
   * Recommend best protection strategy
   */
  recommendProtection(
    chainId: number,
    transactionType: 'swap' | 'liquidity' | 'transfer' | 'other',
    valueUSD?: number
  ): MEVProtectionStrategy | null {
    const strategies = this.getProtectionStrategies(chainId);
    if (strategies.length === 0) return null;

    // For swaps, prefer CoW Swap or Flashbots
    if (transactionType === 'swap') {
      const cowSwap = strategies.find(s => s.type === 'cowswap');
      if (cowSwap) return cowSwap;

      const flashbots = strategies.find(s => s.type === 'flashbots');
      if (flashbots && (valueUSD || 0) > 10000) return flashbots;
    }

    // Return most effective strategy
    return strategies.sort((a, b) => b.effectiveness - a.effectiveness)[0];
  }

  /**
   * Analyze multiple transactions
   */
  analyzeTransactions(transactions: Array<{
    hash: string;
    timestamp: number;
    from: string;
    to: string;
    value: string;
    chainId: number;
    type?: 'swap' | 'liquidity' | 'transfer' | 'other';
  }>): {
    analyses: MEVAnalysis[];
    summary: {
      totalTransactions: number;
      protected: number;
      partial: number;
      unprotected: number;
      averageProtectionScore: number;
      totalEstimatedMEV: string;
    };
  } {
    const analyses = transactions.map(tx => this.analyzeTransaction(tx));

    const protected = analyses.filter(a => a.protectionLevel === 'protected').length;
    const partial = analyses.filter(a => a.protectionLevel === 'partial').length;
    const unprotected = analyses.filter(a => a.protectionLevel === 'unprotected').length;

    const averageProtectionScore =
      analyses.reduce((sum, a) => sum + a.protectionScore, 0) / analyses.length;

    return {
      analyses,
      summary: {
        totalTransactions: transactions.length,
        protected,
        partial,
        unprotected,
        averageProtectionScore: Math.round(averageProtectionScore * 100) / 100,
        totalEstimatedMEV: '0', // Would calculate from actual MEV data
      },
    };
  }

  /**
   * Private helper methods
   */

  private isSwapTransaction(transaction: any): boolean {
    // Check if transaction is to known DEX contracts
    const dexContracts = [
      '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap V2 Router
      '0xe592427a0aece92de3edee1f18e0157c05861564', // Uniswap V3 Router
      '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f', // SushiSwap Router
    ];

    return dexContracts.some(contract =>
      transaction.to?.toLowerCase() === contract.toLowerCase()
    );
  }

  private estimateSandwichLoss(transaction: any): string {
    // Simplified estimation - would use actual slippage data
    const value = BigInt(transaction.value || '0');
    // Assume 0.5% sandwich loss
    return ((value * BigInt(5)) / BigInt(1000)).toString();
  }

  private checkProtection(transaction: any): boolean {
    // Check if transaction uses protection (e.g., Flashbots, CoW Swap)
    // This would check transaction metadata or contract addresses
    return false; // Placeholder
  }

  private getProtectionRecommendations(chainId: number): string[] {
    const strategies = this.getProtectionStrategies(chainId);
    return strategies.map(s => `Use ${s.name} for MEV protection`);
  }
}

// Singleton instance
export const mevProtectionAnalyzer = new MEVProtectionAnalyzer();
