/**
 * Multi-sig Wallet Manager Utility
 * Manages and analyzes multi-signature wallets
 */

export interface MultisigWallet {
  address: string;
  chainId: number;
  threshold: number; // Required signatures
  owners: string[];
  totalOwners: number;
  pendingTransactions: MultisigTransaction[];
  executedTransactions: MultisigTransaction[];
  balance: string;
  balanceUSD?: number;
}

export interface MultisigTransaction {
  id: string;
  to: string;
  value: string;
  data: string;
  nonce: number;
  executed: boolean;
  confirmations: number;
  requiredConfirmations: number;
  submittedBy: string;
  submittedAt: number;
  executedAt?: number;
  executedBy?: string;
  executionHash?: string;
  signatures: Array<{
    owner: string;
    signature: string;
    timestamp: number;
  }>;
}

export interface MultisigStats {
  totalWallets: number;
  totalBalanceUSD: number;
  totalPendingTransactions: number;
  averageThreshold: number;
  averageOwners: number;
  mostActiveWallet: MultisigWallet | null;
  securityScore: number;
}

export interface MultisigHealth {
  wallet: MultisigWallet;
  securityScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  issues: string[];
}

export class MultisigManager {
  private wallets: Map<string, MultisigWallet> = new Map();

  /**
   * Add a multisig wallet
   */
  addWallet(wallet: MultisigWallet): void {
    const key = `${wallet.address.toLowerCase()}-${wallet.chainId}`;
    this.wallets.set(key, wallet);
  }

  /**
   * Get wallet
   */
  getWallet(address: string, chainId: number): MultisigWallet | null {
    const key = `${address.toLowerCase()}-${chainId}`;
    return this.wallets.get(key) || null;
  }

  /**
   * Add transaction
   */
  addTransaction(
    walletAddress: string,
    chainId: number,
    transaction: MultisigTransaction
  ): boolean {
    const wallet = this.getWallet(walletAddress, chainId);
    if (!wallet) {
      return false;
    }

    if (transaction.executed) {
      wallet.executedTransactions.push(transaction);
    } else {
      wallet.pendingTransactions.push(transaction);
    }

    return true;
  }

  /**
   * Get statistics
   */
  getStats(): MultisigStats {
    const wallets = Array.from(this.wallets.values());
    
    const totalBalanceUSD = wallets.reduce((sum, w) => sum + (w.balanceUSD || 0), 0);
    const totalPendingTransactions = wallets.reduce(
      (sum, w) => sum + w.pendingTransactions.length,
      0
    );
    const averageThreshold = wallets.length > 0
      ? wallets.reduce((sum, w) => sum + w.threshold, 0) / wallets.length
      : 0;
    const averageOwners = wallets.length > 0
      ? wallets.reduce((sum, w) => sum + w.totalOwners, 0) / wallets.length
      : 0;

    // Find most active wallet
    const mostActiveWallet = wallets.length > 0
      ? wallets.reduce((most, current) => 
          current.pendingTransactions.length + current.executedTransactions.length >
          most.pendingTransactions.length + most.executedTransactions.length
            ? current
            : most
        )
      : null;

    // Calculate security score
    const securityScore = this.calculateSecurityScore(wallets);

    return {
      totalWallets: wallets.length,
      totalBalanceUSD,
      totalPendingTransactions,
      averageThreshold: Math.round(averageThreshold * 100) / 100,
      averageOwners: Math.round(averageOwners * 100) / 100,
      mostActiveWallet,
      securityScore,
    };
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(wallets: MultisigWallet[]): number {
    if (wallets.length === 0) return 0;

    let totalScore = 0;

    wallets.forEach(wallet => {
      let score = 0;

      // Threshold score (higher threshold = more secure)
      score += Math.min(30, wallet.threshold * 5);

      // Owner count score (more owners = more secure, but diminishing returns)
      score += Math.min(20, wallet.totalOwners * 2);

      // Threshold ratio (threshold/totalOwners should be reasonable)
      const thresholdRatio = wallet.threshold / wallet.totalOwners;
      if (thresholdRatio >= 0.5 && thresholdRatio <= 0.8) {
        score += 20; // Good balance
      } else if (thresholdRatio < 0.5) {
        score += 10; // Too low
      } else {
        score += 15; // Too high but acceptable
      }

      // Pending transactions (fewer = better)
      if (wallet.pendingTransactions.length === 0) {
        score += 15;
      } else if (wallet.pendingTransactions.length < 5) {
        score += 10;
      } else {
        score += 5;
      }

      // Balance security (higher balance = need more security)
      if (wallet.balanceUSD && wallet.balanceUSD > 1000000) {
        // Require higher threshold for large balances
        if (wallet.threshold >= 3) {
          score += 15;
        } else {
          score -= 10;
        }
      } else {
        score += 15;
      }

      totalScore += Math.min(100, score);
    });

    return Math.round(totalScore / wallets.length);
  }

  /**
   * Analyze wallet health
   */
  analyzeWalletHealth(address: string, chainId: number): MultisigHealth | null {
    const wallet = this.getWallet(address, chainId);
    if (!wallet) {
      return null;
    }

    const securityScore = this.calculateSecurityScore([wallet]);
    const riskLevel = this.determineRiskLevel(securityScore, wallet);

    const recommendations: string[] = [];
    const issues: string[] = [];

    // Check threshold
    if (wallet.threshold < 2) {
      issues.push('Threshold is too low. Consider increasing to at least 2.');
    }

    if (wallet.threshold === wallet.totalOwners) {
      issues.push('Threshold equals total owners. Any single owner compromise will affect security.');
    }

    // Check pending transactions
    if (wallet.pendingTransactions.length > 10) {
      issues.push('Too many pending transactions. Review and execute or cancel old transactions.');
    }

    // Check owner count
    if (wallet.totalOwners < 2) {
      issues.push('Multi-sig requires at least 2 owners.');
    }

    if (wallet.totalOwners > 10) {
      recommendations.push('Consider reducing owner count for better efficiency.');
    }

    // Check balance vs security
    if (wallet.balanceUSD && wallet.balanceUSD > 1000000 && wallet.threshold < 3) {
      recommendations.push('High balance detected. Consider increasing threshold for better security.');
    }

    // Generate recommendations
    if (securityScore < 50) {
      recommendations.push('Security score is low. Review wallet configuration.');
    }

    if (wallet.pendingTransactions.length === 0 && wallet.executedTransactions.length === 0) {
      recommendations.push('No transaction history. Ensure wallet is properly configured.');
    }

    return {
      wallet,
      securityScore,
      riskLevel,
      recommendations,
      issues,
    };
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(
    securityScore: number,
    wallet: MultisigWallet
  ): 'low' | 'medium' | 'high' {
    if (securityScore >= 70 && wallet.threshold >= 2) {
      return 'low';
    }
    if (securityScore >= 50) {
      return 'medium';
    }
    return 'high';
  }

  /**
   * Get pending transactions requiring action
   */
  getPendingTransactionsRequiringAction(
    walletAddress: string,
    chainId: number,
    userAddress: string
  ): MultisigTransaction[] {
    const wallet = this.getWallet(walletAddress, chainId);
    if (!wallet) {
      return [];
    }

    return wallet.pendingTransactions.filter(tx => {
      // Check if user is an owner
      const isOwner = wallet.owners.some(
        owner => owner.toLowerCase() === userAddress.toLowerCase()
      );
      if (!isOwner) {
        return false;
      }

      // Check if user has already signed
      const hasSigned = tx.signatures.some(
        sig => sig.owner.toLowerCase() === userAddress.toLowerCase()
      );
      if (hasSigned) {
        return false;
      }

      // Check if transaction needs more confirmations
      return tx.confirmations < tx.requiredConfirmations;
    });
  }

  /**
   * Clear all wallets
   */
  clear(): void {
    this.wallets.clear();
  }
}

// Singleton instance
export const multisigManager = new MultisigManager();

