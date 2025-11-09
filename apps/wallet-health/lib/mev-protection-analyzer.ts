/**
 * MEV Protection Analyzer Utility
 * Analyzes MEV risks and suggests protection strategies
 */

export interface MEVRisk {
  type: 'sandwich' | 'frontrun' | 'backrun' | 'arbitrage' | 'liquidate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  potentialLoss: number; // in USD
  probability: number; // 0-100
  protectionAvailable: boolean;
  protectionMethod?: string;
}

export interface MEVProtectionStrategy {
  strategy: 'private_mempool' | 'flashbots' | 'cowswap' | '1inch_fusion' | 'limit_order';
  name: string;
  description: string;
  effectiveness: number; // 0-100
  cost: number; // in USD or percentage
  supportedChains: number[];
  implementation: string;
}

export interface TransactionMEVAnalysis {
  transactionHash: string;
  risks: MEVRisk[];
  riskScore: number; // 0-100
  recommendedProtection: MEVProtectionStrategy[];
  estimatedSavings: number; // USD
}

export interface WalletMEVProfile {
  walletAddress: string;
  totalMEVRisk: number; // USD
  riskLevel: 'low' | 'medium' | 'high';
  vulnerableTransactions: number;
  protectedTransactions: number;
  protectionRate: number; // percentage
  recommendations: string[];
}

export class MEVProtectionAnalyzer {
  private protectionStrategies: MEVProtectionStrategy[] = [];

  constructor() {
    this.initializeProtectionStrategies();
  }

  /**
   * Analyze transaction for MEV risks
   */
  analyzeTransaction(
    transaction: {
      hash: string;
      type: 'swap' | 'liquidity' | 'transfer' | 'contract_call';
      value: string;
      gasPrice: number;
      chainId: number;
      isPending?: boolean;
    }
  ): TransactionMEVAnalysis {
    const risks: MEVRisk[] = [];
    let riskScore = 0;

    // Analyze based on transaction type
    if (transaction.type === 'swap') {
      const swapRisk = this.analyzeSwapRisk(transaction);
      risks.push(...swapRisk);
      riskScore += swapRisk.reduce((sum, r) => {
        const severityWeight = { critical: 30, high: 20, medium: 10, low: 5 };
        return sum + severityWeight[r.severity] * (r.probability / 100);
      }, 0);
    }

    if (transaction.type === 'liquidity') {
      const liquidityRisk = this.analyzeLiquidityRisk(transaction);
      risks.push(...liquidityRisk);
      riskScore += liquidityRisk.reduce((sum, r) => {
        const severityWeight = { critical: 30, high: 20, medium: 10, low: 5 };
        return sum + severityWeight[r.severity] * (r.probability / 100);
      }, 0);
    }

    // High gas price increases MEV risk
    if (transaction.gasPrice > 100e9) {
      risks.push({
        type: 'frontrun',
        severity: 'medium',
        description: 'High gas price increases front-running risk',
        potentialLoss: parseFloat(transaction.value) * 0.01, // Estimate 1% loss
        probability: 40,
        protectionAvailable: true,
        protectionMethod: 'private_mempool',
      });
      riskScore += 15;
    }

    // Pending transactions are more vulnerable
    if (transaction.isPending) {
      risks.push({
        type: 'sandwich',
        severity: 'high',
        description: 'Pending transaction vulnerable to sandwich attacks',
        potentialLoss: parseFloat(transaction.value) * 0.02,
        probability: 60,
        protectionAvailable: true,
        protectionMethod: 'flashbots',
      });
      riskScore += 25;
    }

    // Get recommended protection strategies
    const recommendedProtection = this.getRecommendedProtection(risks, transaction.chainId);
    
    // Estimate potential savings
    const estimatedSavings = risks.reduce((sum, risk) => {
      if (risk.protectionAvailable) {
        return sum + risk.potentialLoss * (risk.probability / 100);
      }
      return sum;
    }, 0);

    return {
      transactionHash: transaction.hash,
      risks,
      riskScore: Math.min(100, Math.round(riskScore)),
      recommendedProtection,
      estimatedSavings,
    };
  }

  /**
   * Analyze swap transaction risks
   */
  private analyzeSwapRisk(transaction: any): MEVRisk[] {
    const risks: MEVRisk[] = [];

    // Large swaps are more vulnerable
    const valueEth = parseFloat(transaction.value) / 1e18;
    if (valueEth > 10) {
      risks.push({
        type: 'sandwich',
        severity: 'high',
        description: 'Large swap vulnerable to sandwich attacks',
        potentialLoss: valueEth * 0.03 * 2000, // Estimate 3% slippage
        probability: 70,
        protectionAvailable: true,
        protectionMethod: 'cowswap',
      });
    }

    // All swaps have some MEV risk
    risks.push({
      type: 'frontrun',
      severity: 'medium',
      description: 'Swap transaction can be front-run',
      potentialLoss: valueEth * 0.01 * 2000,
      probability: 30,
      protectionAvailable: true,
      protectionMethod: 'private_mempool',
    });

    return risks;
  }

  /**
   * Analyze liquidity transaction risks
   */
  private analyzeLiquidityRisk(transaction: any): MEVRisk[] {
    return [
      {
        type: 'arbitrage',
        severity: 'low',
        description: 'Liquidity operations can be arbitraged',
        potentialLoss: parseFloat(transaction.value) * 0.005,
        probability: 20,
        protectionAvailable: false,
      },
    ];
  }

  /**
   * Get recommended protection strategies
   */
  private getRecommendedProtection(
    risks: MEVRisk[],
    chainId: number
  ): MEVProtectionStrategy[] {
    const recommended: MEVProtectionStrategy[] = [];

    // Check if any risk has protection available
    const hasProtection = risks.some(r => r.protectionAvailable);
    if (!hasProtection) {
      return recommended;
    }

    // Recommend strategies based on chain support
    this.protectionStrategies.forEach(strategy => {
      if (strategy.supportedChains.includes(chainId)) {
        recommended.push(strategy);
      }
    });

    // Sort by effectiveness
    recommended.sort((a, b) => b.effectiveness - a.effectiveness);

    return recommended.slice(0, 3); // Top 3 recommendations
  }

  /**
   * Analyze wallet MEV profile
   */
  analyzeWalletProfile(
    transactions: Array<{
      hash: string;
      type: string;
      value: string;
      gasPrice: number;
      chainId: number;
      isProtected?: boolean;
    }>
  ): WalletMEVProfile {
    const analyses = transactions.map(tx => this.analyzeTransaction(tx));
    
    const totalMEVRisk = analyses.reduce((sum, a) => sum + a.estimatedSavings, 0);
    const vulnerableTransactions = analyses.filter(a => a.riskScore > 50).length;
    const protectedTransactions = transactions.filter(tx => tx.isProtected).length;
    const protectionRate = transactions.length > 0
      ? (protectedTransactions / transactions.length) * 100
      : 0;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (totalMEVRisk > 1000 || vulnerableTransactions > 10) {
      riskLevel = 'high';
    } else if (totalMEVRisk > 100 || vulnerableTransactions > 5) {
      riskLevel = 'medium';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (protectionRate < 50) {
      recommendations.push('Consider using MEV protection for more transactions');
    }
    if (vulnerableTransactions > 0) {
      recommendations.push(`Review ${vulnerableTransactions} high-risk transactions`);
    }
    if (totalMEVRisk > 500) {
      recommendations.push('Significant MEV risk detected - implement protection strategies');
    }

    return {
      walletAddress: '', // Would be passed in
      totalMEVRisk,
      riskLevel,
      vulnerableTransactions,
      protectedTransactions,
      protectionRate: Math.round(protectionRate * 100) / 100,
      recommendations,
    };
  }

  /**
   * Initialize protection strategies
   */
  private initializeProtectionStrategies(): void {
    this.protectionStrategies = [
      {
        strategy: 'flashbots',
        name: 'Flashbots Protect',
        description: 'Private mempool via Flashbots to prevent front-running',
        effectiveness: 95,
        cost: 0,
        supportedChains: [1], // Ethereum mainnet
        implementation: 'Use Flashbots RPC endpoint',
      },
      {
        strategy: 'cowswap',
        name: 'CoW Swap',
        description: 'MEV-protected DEX aggregator using batch auctions',
        effectiveness: 90,
        cost: 0.001, // Small fee
        supportedChains: [1, 100], // Ethereum, Gnosis
        implementation: 'Trade via CoW Swap interface',
      },
      {
        strategy: '1inch_fusion',
        name: '1inch Fusion',
        description: 'Intent-based trading with MEV protection',
        effectiveness: 85,
        cost: 0.0005,
        supportedChains: [1, 137, 56],
        implementation: 'Use 1inch Fusion mode',
      },
      {
        strategy: 'private_mempool',
        name: 'Private Mempool',
        description: 'Submit transactions to private mempool',
        effectiveness: 80,
        cost: 0,
        supportedChains: [1],
        implementation: 'Use private RPC endpoint',
      },
    ];
  }

  /**
   * Get all available protection strategies
   */
  getProtectionStrategies(chainId?: number): MEVProtectionStrategy[] {
    if (chainId) {
      return this.protectionStrategies.filter(s => s.supportedChains.includes(chainId));
    }
    return [...this.protectionStrategies];
  }
}

// Singleton instance
export const mevProtectionAnalyzer = new MEVProtectionAnalyzer();

