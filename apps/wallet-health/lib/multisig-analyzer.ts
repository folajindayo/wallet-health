/**
 * Multi-Signature Wallet Analyzer
 * Analyzes multi-signature wallet configurations and security
 */

export interface MultisigWallet {
  address: string;
  chainId: number;
  type: 'gnosis_safe' | 'argent' | 'argent_v2' | 'custom';
  threshold: number; // Required signatures
  owners: string[];
  totalOwners: number;
  version?: string;
  nonce?: number;
  balance?: string;
  balanceUSD?: number;
}

export interface MultisigAnalysis {
  wallet: MultisigWallet;
  securityScore: number;
  riskLevel: 'safe' | 'moderate' | 'critical';
  riskFactors: string[];
  recommendations: string[];
  configuration: {
    thresholdRatio: number; // threshold / totalOwners
    isOptimalThreshold: boolean;
    ownerDistribution: {
      uniqueOwners: number;
      duplicateOwners: number;
    };
  };
  permissions: {
    canExecute: boolean;
    requiredSignatures: number;
    pendingTransactions?: number;
  };
}

export interface MultisigTransaction {
  safeTxHash: string;
  to: string;
  value: string;
  data: string;
  operation: number; // 0 = CALL, 1 = DELEGATE_CALL
  safeTxGas: number;
  baseGas: number;
  gasPrice: string;
  gasToken: string;
  refundReceiver: string;
  nonce: number;
  confirmations: Array<{
    owner: string;
    signature: string;
  }>;
  signatures: string;
  status: 'pending' | 'executed' | 'cancelled';
  submittedAt?: number;
  executedAt?: number;
}

export class MultisigAnalyzer {
  /**
   * Analyze multi-signature wallet
   */
  async analyzeMultisig(wallet: MultisigWallet): Promise<MultisigAnalysis> {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    let securityScore = 100;

    // Analyze threshold configuration
    const thresholdRatio = wallet.threshold / wallet.totalOwners;
    const isOptimalThreshold = this.isOptimalThreshold(wallet.threshold, wallet.totalOwners);

    if (!isOptimalThreshold) {
      riskFactors.push(`Suboptimal threshold configuration (${wallet.threshold}/${wallet.totalOwners})`);
      securityScore -= 10;
      recommendations.push(
        `Consider adjusting threshold to ${this.getOptimalThreshold(wallet.totalOwners)}/${wallet.totalOwners} for better security`
      );
    }

    // Check for duplicate owners
    const uniqueOwners = new Set(wallet.owners.map(o => o.toLowerCase()));
    const duplicateOwners = wallet.owners.length - uniqueOwners.size;

    if (duplicateOwners > 0) {
      riskFactors.push(`${duplicateOwners} duplicate owner(s) detected`);
      securityScore -= 15;
      recommendations.push('Remove duplicate owners to improve security');
    }

    // Check threshold ratio
    if (thresholdRatio < 0.5) {
      riskFactors.push('Threshold is less than 50% of owners (low security)');
      securityScore -= 20;
      recommendations.push('Increase threshold to at least 50% of owners');
    } else if (thresholdRatio === 1) {
      riskFactors.push('Threshold requires all owners (high risk of deadlock)');
      securityScore -= 10;
      recommendations.push('Consider reducing threshold to allow for owner unavailability');
    }

    // Check owner count
    if (wallet.totalOwners < 2) {
      riskFactors.push('Not a valid multi-signature wallet (less than 2 owners)');
      securityScore -= 50;
    } else if (wallet.totalOwners > 10) {
      riskFactors.push('Large number of owners may complicate coordination');
      securityScore -= 5;
      recommendations.push('Consider using a governance structure for large owner sets');
    }

    // Determine risk level
    let riskLevel: 'safe' | 'moderate' | 'critical';
    if (securityScore >= 80) {
      riskLevel = 'safe';
    } else if (securityScore >= 50) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'critical';
    }

    return {
      wallet,
      securityScore: Math.max(0, Math.min(100, securityScore)),
      riskLevel,
      riskFactors,
      recommendations,
      configuration: {
        thresholdRatio,
        isOptimalThreshold,
        ownerDistribution: {
          uniqueOwners: uniqueOwners.size,
          duplicateOwners,
        },
      },
      permissions: {
        canExecute: false, // Would check actual permissions
        requiredSignatures: wallet.threshold,
      },
    };
  }

  /**
   * Analyze pending transactions
   */
  async analyzePendingTransactions(
    wallet: MultisigWallet,
    transactions: MultisigTransaction[]
  ): Promise<{
    totalPending: number;
    readyToExecute: number;
    needsMoreSignatures: number;
    riskAssessment: {
      highValueTransactions: number;
      suspiciousTransactions: number;
      recommendations: string[];
    };
  }> {
    const pending = transactions.filter(tx => tx.status === 'pending');
    const readyToExecute = pending.filter(tx => tx.confirmations.length >= wallet.threshold);
    const needsMoreSignatures = pending.filter(tx => tx.confirmations.length < wallet.threshold);

    // Analyze transaction values
    const highValueTransactions = pending.filter(tx => {
      const value = parseFloat(tx.value);
      return value > 10 * 1e18; // > 10 ETH
    }).length;

    // Check for suspicious patterns
    const suspiciousTransactions = pending.filter(tx => {
      // Check for zero-value transactions with data (potential malicious contract calls)
      if (tx.value === '0' && tx.data && tx.data !== '0x') {
        return true;
      }
      // Check for delegate calls (high risk)
      if (tx.operation === 1) {
        return true;
      }
      return false;
    }).length;

    const recommendations: string[] = [];
    if (highValueTransactions > 0) {
      recommendations.push(`Review ${highValueTransactions} high-value pending transaction(s)`);
    }
    if (suspiciousTransactions > 0) {
      recommendations.push(`Investigate ${suspiciousTransactions} potentially suspicious transaction(s)`);
    }
    if (readyToExecute.length > 0) {
      recommendations.push(`${readyToExecute.length} transaction(s) ready to execute`);
    }

    return {
      totalPending: pending.length,
      readyToExecute: readyToExecute.length,
      needsMoreSignatures: needsMoreSignatures.length,
      riskAssessment: {
        highValueTransactions,
        suspiciousTransactions,
        recommendations,
      },
    };
  }

  /**
   * Compare multiple multisig wallets
   */
  compareMultisigs(analyses: MultisigAnalysis[]): {
    averageSecurityScore: number;
    mostSecure: MultisigAnalysis;
    leastSecure: MultisigAnalysis;
    commonRiskFactors: string[];
    recommendations: string[];
  } {
    const avgScore = analyses.reduce((sum, a) => sum + a.securityScore, 0) / analyses.length;

    const mostSecure = analyses.reduce((best, current) =>
      current.securityScore > best.securityScore ? current : best
    );

    const leastSecure = analyses.reduce((worst, current) =>
      current.securityScore < worst.securityScore ? current : worst
    );

    // Find common risk factors
    const riskFactorCounts = new Map<string, number>();
    analyses.forEach(analysis => {
      analysis.riskFactors.forEach(factor => {
        riskFactorCounts.set(factor, (riskFactorCounts.get(factor) || 0) + 1);
      });
    });

    const commonRiskFactors = Array.from(riskFactorCounts.entries())
      .filter(([_, count]) => count >= analyses.length / 2)
      .map(([factor]) => factor);

    // Aggregate recommendations
    const allRecommendations = analyses.flatMap(a => a.recommendations);
    const uniqueRecommendations = Array.from(new Set(allRecommendations));

    return {
      averageSecurityScore: Math.round(avgScore * 100) / 100,
      mostSecure,
      leastSecure,
      commonRiskFactors,
      recommendations: uniqueRecommendations,
    };
  }

  /**
   * Check if threshold is optimal
   */
  private isOptimalThreshold(threshold: number, totalOwners: number): boolean {
    const optimal = this.getOptimalThreshold(totalOwners);
    return threshold === optimal;
  }

  /**
   * Get optimal threshold for number of owners
   */
  private getOptimalThreshold(totalOwners: number): number {
    // Optimal threshold is typically (totalOwners / 2) + 1 for majority
    // But we want at least 2/3 for better security
    if (totalOwners <= 2) return 2;
    if (totalOwners <= 3) return 2;
    if (totalOwners <= 5) return Math.ceil(totalOwners * 0.6);
    return Math.ceil(totalOwners * 0.67); // 2/3 majority
  }

  /**
   * Detect multisig wallet type from address/chain
   */
  async detectMultisigType(address: string, chainId: number): Promise<MultisigWallet['type'] | null> {
    // Placeholder - would check contract code or known addresses
    // Gnosis Safe detection
    // Argent detection
    // etc.
    return 'gnosis_safe'; // Default assumption
  }
}

// Singleton instance
export const multisigAnalyzer = new MultisigAnalyzer();

