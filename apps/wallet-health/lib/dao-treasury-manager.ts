/**
 * DAO Treasury Manager Utility
 * Manages DAO treasury analysis and tracking
 */

export interface DAOTreasury {
  daoAddress: string;
  daoName: string;
  chainId: number;
  totalValueUSD: number;
  tokenHoldings: Array<{
    token: string;
    symbol: string;
    balance: string;
    valueUSD: number;
    percentage: number;
  }>;
  nftHoldings?: number;
  nftValueUSD?: number;
  lastUpdated: number;
}

export interface TreasuryTransaction {
  id: string;
  daoAddress: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'swap' | 'governance';
  token: string;
  tokenSymbol: string;
  amount: string;
  amountUSD: number;
  from: string;
  to: string;
  timestamp: number;
  transactionHash: string;
  proposalId?: string; // If governance-related
}

export interface TreasuryStats {
  totalDAOs: number;
  totalValueUSD: number;
  averageTreasurySize: number;
  largestTreasury: DAOTreasury | null;
  mostActiveDAO: {
    dao: DAOTreasury;
    transactionCount: number;
  } | null;
  byChain: Record<number, number>;
}

export class DAOTreasuryManager {
  private treasuries: Map<string, DAOTreasury> = new Map();
  private transactions: Map<string, TreasuryTransaction[]> = new Map();

  /**
   * Add DAO treasury
   */
  addTreasury(treasury: DAOTreasury): void {
    const key = `${treasury.daoAddress.toLowerCase()}-${treasury.chainId}`;
    this.treasuries.set(key, treasury);
  }

  /**
   * Get treasury
   */
  getTreasury(daoAddress: string, chainId: number): DAOTreasury | null {
    const key = `${daoAddress.toLowerCase()}-${chainId}`;
    return this.treasuries.get(key) || null;
  }

  /**
   * Add transaction
   */
  addTransaction(transaction: TreasuryTransaction): void {
    const key = transaction.daoAddress.toLowerCase();
    if (!this.transactions.has(key)) {
      this.transactions.set(key, []);
    }

    this.transactions.get(key)!.push(transaction);

    // Keep only last 10000 transactions per DAO
    const txList = this.transactions.get(key)!;
    if (txList.length > 10000) {
      txList.splice(0, txList.length - 10000);
    }
  }

  /**
   * Get treasury transactions
   */
  getTransactions(daoAddress: string, limit = 100): TreasuryTransaction[] {
    const transactions = this.transactions.get(daoAddress.toLowerCase()) || [];
    return transactions.slice(-limit).reverse();
  }

  /**
   * Get statistics
   */
  getStats(): TreasuryStats {
    const treasuries = Array.from(this.treasuries.values());
    const totalValueUSD = treasuries.reduce((sum, t) => sum + t.totalValueUSD, 0);
    const averageTreasurySize = treasuries.length > 0
      ? totalValueUSD / treasuries.length
      : 0;

    // Find largest treasury
    const largestTreasury = treasuries.length > 0
      ? treasuries.reduce((largest, current) =>
          current.totalValueUSD > largest.totalValueUSD ? current : largest
        )
      : null;

    // Find most active DAO
    let mostActiveDAO: { dao: DAOTreasury; transactionCount: number } | null = null;
    let maxTransactions = 0;

    treasuries.forEach(treasury => {
      const txCount = this.getTransactions(treasury.daoAddress).length;
      if (txCount > maxTransactions) {
        maxTransactions = txCount;
        mostActiveDAO = { dao: treasury, transactionCount: txCount };
      }
    });

    // Group by chain
    const byChain: Record<number, number> = {};
    treasuries.forEach(treasury => {
      byChain[treasury.chainId] = (byChain[treasury.chainId] || 0) + treasury.totalValueUSD;
    });

    return {
      totalDAOs: treasuries.length,
      totalValueUSD,
      averageTreasurySize: Math.round(averageTreasurySize * 100) / 100,
      largestTreasury,
      mostActiveDAO,
      byChain,
    };
  }

  /**
   * Analyze treasury health
   */
  analyzeTreasuryHealth(daoAddress: string, chainId: number): {
    healthScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  } {
    const treasury = this.getTreasury(daoAddress, chainId);
    if (!treasury) {
      return {
        healthScore: 0,
        riskLevel: 'high',
        recommendations: ['Treasury data not available'],
      };
    }

    let healthScore = 100;
    const recommendations: string[] = [];

    // Check diversification
    const topHolding = treasury.tokenHoldings[0];
    if (topHolding && topHolding.percentage > 80) {
      healthScore -= 20;
      recommendations.push('High concentration in single token. Consider diversification.');
    }

    // Check treasury size
    if (treasury.totalValueUSD < 10000) {
      healthScore -= 10;
      recommendations.push('Small treasury size. May need additional funding.');
    }

    // Check update frequency
    const daysSinceUpdate = (Date.now() - treasury.lastUpdated) / (24 * 60 * 60 * 1000);
    if (daysSinceUpdate > 30) {
      healthScore -= 15;
      recommendations.push('Treasury data is outdated. Update regularly.');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (healthScore < 60) {
      riskLevel = 'high';
    } else if (healthScore < 80) {
      riskLevel = 'medium';
    }

    return {
      healthScore: Math.max(0, Math.min(100, healthScore)),
      riskLevel,
      recommendations,
    };
  }

  /**
   * Get top DAOs by value
   */
  getTopDAOs(limit = 10): DAOTreasury[] {
    return Array.from(this.treasuries.values())
      .sort((a, b) => b.totalValueUSD - a.totalValueUSD)
      .slice(0, limit);
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.treasuries.clear();
    this.transactions.clear();
  }
}

// Singleton instance
export const daoTreasuryManager = new DAOTreasuryManager();

