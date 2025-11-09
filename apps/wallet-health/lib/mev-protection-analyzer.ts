/**
 * MEV Protection Analyzer
 * Analyzes transactions for MEV protection and front-running risks
 */

export interface MEVAnalysis {
  transactionHash: string;
  timestamp: number;
  chainId: number;
  hasMEVProtection: boolean;
  protectionType?: 'private_mempool' | 'flashbots' | 'cowswap' | '1inch_fusion' | 'other';
  riskLevel: 'low' | 'medium' | 'high';
  risks: Array<{
    type: 'front_running' | 'sandwich_attack' | 'back_running' | 'arbitrage' | 'none';
    severity: 'high' | 'medium' | 'low';
    description: string;
    probability?: number; // 0-100
  }>;
  recommendations: string[];
  estimatedMEVLoss?: {
    amount: string;
    amountUSD?: number;
    percentage: number;
  };
}

export interface MEVProtectionStats {
  totalTransactions: number;
  protectedTransactions: number;
  unprotectedTransactions: number;
  protectionRate: number;
  estimatedTotalMEVLoss: string;
  estimatedTotalMEVLossUSD?: number;
  protectionBreakdown: Record<string, number>;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export class MEVProtectionAnalyzer {
  /**
   * Analyze transaction for MEV protection
   */
  analyzeTransaction(
    transaction: {
      hash: string;
      timestamp: number;
      chainId: number;
      from: string;
      to: string;
      value: string;
      data?: string;
      gasPrice?: string;
      maxFeePerGas?: string;
      maxPriorityFeePerGas?: string;
      metadata?: Record<string, any>;
    }
  ): MEVAnalysis {
    const risks: MEVAnalysis['risks'] = [];
    const recommendations: string[] = [];
    let hasMEVProtection = false;
    let protectionType: MEVAnalysis['protectionType'];
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';

    // Check for known MEV protection services
    if (transaction.metadata?.privateMempool) {
      hasMEVProtection = true;
      protectionType = 'private_mempool';
    }

    if (transaction.metadata?.flashbots) {
      hasMEVProtection = true;
      protectionType = 'flashbots';
    }

    if (transaction.to && this.isCowSwap(transaction.to)) {
      hasMEVProtection = true;
      protectionType = 'cowswap';
    }

    if (transaction.to && this.is1inchFusion(transaction.to)) {
      hasMEVProtection = true;
      protectionType = '1inch_fusion';
    }

    // Analyze for MEV risks
    if (!hasMEVProtection) {
      // Check for swap-like transactions
      if (this.isSwapTransaction(transaction.data || '')) {
        risks.push({
          type: 'sandwich_attack',
          severity: 'high',
          description: 'Swap transaction without MEV protection - vulnerable to sandwich attacks',
          probability: 60,
        });

        risks.push({
          type: 'front_running',
          severity: 'medium',
          description: 'Transaction visible in public mempool - vulnerable to front-running',
          probability: 40,
        });

        riskLevel = 'high';
        recommendations.push('Use a private mempool or MEV-protected DEX for swaps');
        recommendations.push('Consider using Flashbots or CowSwap for better protection');
      }

      // Check for large value transactions
      const valueEth = parseFloat(transaction.value) / 1e18;
      if (valueEth > 10) {
        risks.push({
          type: 'front_running',
          severity: 'high',
          description: 'Large value transaction without protection - high MEV risk',
          probability: 70,
        });

        if (riskLevel !== 'high') riskLevel = 'high';
        recommendations.push('Use private mempool for large transactions');
      }

      // Check gas price (low gas = more vulnerable)
      if (transaction.gasPrice) {
        const gasGwei = parseFloat(transaction.gasPrice) / 1e9;
        if (gasGwei < 20) {
          risks.push({
            type: 'back_running',
            severity: 'medium',
            description: 'Low gas price - transaction may be back-run',
            probability: 30,
          });
        }
      }
    } else {
      risks.push({
        type: 'none',
        severity: 'low',
        description: 'Transaction uses MEV protection',
      });
      riskLevel = 'low';
    }

    // Estimate MEV loss for unprotected swaps
    let estimatedMEVLoss: MEVAnalysis['estimatedMEVLoss'] | undefined;
    if (!hasMEVProtection && this.isSwapTransaction(transaction.data || '')) {
      // Simplified estimation (would need actual swap data)
      const estimatedLossPercentage = 0.5; // 0.5% average MEV loss
      estimatedMEVLoss = {
        amount: (BigInt(transaction.value) * BigInt(50)) / BigInt(10000).toString(),
        percentage: estimatedLossPercentage,
      };
    }

    return {
      transactionHash: transaction.hash,
      timestamp: transaction.timestamp,
      chainId: transaction.chainId,
      hasMEVProtection,
      protectionType,
      riskLevel,
      risks,
      recommendations,
      estimatedMEVLoss,
    };
  }

  /**
   * Analyze multiple transactions
   */
  analyzeTransactions(
    transactions: Array<{
      hash: string;
      timestamp: number;
      chainId: number;
      from: string;
      to: string;
      value: string;
      data?: string;
      gasPrice?: string;
      metadata?: Record<string, any>;
    }>
  ): {
    analyses: MEVAnalysis[];
    stats: MEVProtectionStats;
  } {
    const analyses = transactions.map(tx => this.analyzeTransaction(tx));

    const protected = analyses.filter(a => a.hasMEVProtection).length;
    const unprotected = analyses.length - protected;
    const protectionRate = analyses.length > 0 ? (protected / analyses.length) * 100 : 0;

    // Calculate protection breakdown
    const protectionBreakdown: Record<string, number> = {};
    analyses.forEach(analysis => {
      if (analysis.protectionType) {
        protectionBreakdown[analysis.protectionType] =
          (protectionBreakdown[analysis.protectionType] || 0) + 1;
      }
    });

    // Risk distribution
    const riskDistribution = {
      low: analyses.filter(a => a.riskLevel === 'low').length,
      medium: analyses.filter(a => a.riskLevel === 'medium').length,
      high: analyses.filter(a => a.riskLevel === 'high').length,
    };

    // Estimate total MEV loss
    const totalMEVLoss = analyses.reduce((sum, a) => {
      if (a.estimatedMEVLoss) {
        return sum + BigInt(a.estimatedMEVLoss.amount);
      }
      return sum;
    }, BigInt(0));

    const stats: MEVProtectionStats = {
      totalTransactions: analyses.length,
      protectedTransactions: protected,
      unprotectedTransactions: unprotected,
      protectionRate: Math.round(protectionRate * 100) / 100,
      estimatedTotalMEVLoss: totalMEVLoss.toString(),
      protectionBreakdown,
      riskDistribution,
    };

    return {
      analyses,
      stats,
    };
  }

  /**
   * Get recommendations for MEV protection
   */
  getProtectionRecommendations(
    stats: MEVProtectionStats
  ): string[] {
    const recommendations: string[] = [];

    if (stats.protectionRate < 50) {
      recommendations.push(
        `Only ${stats.protectionRate.toFixed(1)}% of transactions use MEV protection - consider increasing`
      );
    }

    if (stats.riskDistribution.high > stats.totalTransactions * 0.2) {
      recommendations.push(
        `${stats.riskDistribution.high} high-risk transactions detected - use MEV protection`
      );
    }

    if (stats.estimatedTotalMEVLoss) {
      const lossEth = parseFloat(stats.estimatedTotalMEVLoss) / 1e18;
      if (lossEth > 0.1) {
        recommendations.push(
          `Estimated MEV loss: ${lossEth.toFixed(4)} ETH - use protection to reduce losses`
        );
      }
    }

    recommendations.push('Use private mempools (Flashbots) for sensitive transactions');
    recommendations.push('Consider using MEV-protected DEXs like CowSwap or 1inch Fusion');
    recommendations.push('Batch transactions when possible to reduce MEV exposure');

    return recommendations;
  }

  /**
   * Private helper methods
   */

  private isSwapTransaction(data: string): boolean {
    // Common swap function signatures
    const swapSignatures = [
      '0x7ff36ab5', // swapExactETHForTokens
      '0x18cbafe5', // swapExactETHForTokensSupportingFeeOnTransferTokens
      '0x38ed1739', // swapExactTokensForTokens
      '0x8803dbee', // swapTokensForExactTokens
      '0x5c11d795', // swapExactTokensForTokensSupportingFeeOnTransferTokens
      '0x4a25d94a', // swapETHForExactTokens
      '0xb6f9de95', // swapExactETHForTokens (Uniswap V2)
      '0x02751cec', // swapExactTokensForETH
    ];

    return swapSignatures.some(sig => data.toLowerCase().startsWith(sig.toLowerCase()));
  }

  private isCowSwap(address: string): boolean {
    // Known CowSwap addresses (simplified)
    const cowSwapAddresses = [
      '0x9008d19f58aabd9ed0d60971565aa8510560ab41', // Mainnet
      '0xc92e8bdf79f0507f65a392b0ab4667716bfe0110', // Gnosis Chain
    ];

    return cowSwapAddresses.includes(address.toLowerCase());
  }

  private is1inchFusion(address: string): boolean {
    // Known 1inch Fusion addresses (simplified)
    const fusionAddresses = [
      '0x1111111254fb6c44bac0bed2854e76f90643097d', // 1inch Router
    ];

    return fusionAddresses.includes(address.toLowerCase());
  }
}

// Singleton instance
export const mevProtectionAnalyzer = new MEVProtectionAnalyzer();
