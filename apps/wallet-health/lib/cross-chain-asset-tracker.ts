/**
 * Cross-chain Asset Tracker Utility
 * Track assets across multiple chains
 */

export interface CrossChainAsset {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chains: Array<{
    chainId: number;
    chainName: string;
    balance: string;
    balanceUSD: number;
  }>;
  totalBalanceUSD: number;
  priceUSD: number;
}

export interface CrossChainPortfolio {
  walletAddress: string;
  assets: CrossChainAsset[];
  totalValueUSD: number;
  byChain: Record<number, {
    chainName: string;
    valueUSD: number;
    assetCount: number;
  }>;
  lastUpdated: number;
}

export interface BridgeTransaction {
  id: string;
  fromChain: number;
  toChain: number;
  tokenAddress: string;
  tokenSymbol: string;
  amount: string;
  amountUSD: number;
  bridgeProtocol: string;
  transactionHash: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export class CrossChainAssetTracker {
  private portfolios: Map<string, CrossChainPortfolio> = new Map();
  private bridgeTransactions: Map<string, BridgeTransaction[]> = new Map();

  /**
   * Update portfolio
   */
  updatePortfolio(
    walletAddress: string,
    assets: CrossChainAsset[]
  ): CrossChainPortfolio {
    const totalValueUSD = assets.reduce((sum, asset) => sum + asset.totalBalanceUSD, 0);

    // Group by chain
    const byChain: Record<number, { chainName: string; valueUSD: number; assetCount: number }> = {};
    
    assets.forEach(asset => {
      asset.chains.forEach(chain => {
        if (!byChain[chain.chainId]) {
          byChain[chain.chainId] = {
            chainName: chain.chainName,
            valueUSD: 0,
            assetCount: 0,
          };
        }
        byChain[chain.chainId].valueUSD += chain.balanceUSD;
        byChain[chain.chainId].assetCount++;
      });
    });

    const portfolio: CrossChainPortfolio = {
      walletAddress: walletAddress.toLowerCase(),
      assets,
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      byChain,
      lastUpdated: Date.now(),
    };

    this.portfolios.set(walletAddress.toLowerCase(), portfolio);
    return portfolio;
  }

  /**
   * Get portfolio
   */
  getPortfolio(walletAddress: string): CrossChainPortfolio | null {
    return this.portfolios.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Add bridge transaction
   */
  addBridgeTransaction(walletAddress: string, transaction: Omit<BridgeTransaction, 'id'>): BridgeTransaction {
    const id = `bridge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullTransaction: BridgeTransaction = {
      ...transaction,
      id,
    };

    const key = walletAddress.toLowerCase();
    if (!this.bridgeTransactions.has(key)) {
      this.bridgeTransactions.set(key, []);
    }

    this.bridgeTransactions.get(key)!.push(fullTransaction);

    // Keep only last 1000 transactions
    const transactions = this.bridgeTransactions.get(key)!;
    if (transactions.length > 1000) {
      transactions.splice(0, transactions.length - 1000);
    }

    return fullTransaction;
  }

  /**
   * Get bridge transactions
   */
  getBridgeTransactions(
    walletAddress: string,
    options?: {
      fromChain?: number;
      toChain?: number;
      status?: BridgeTransaction['status'];
      limit?: number;
    }
  ): BridgeTransaction[] {
    const key = walletAddress.toLowerCase();
    let transactions = this.bridgeTransactions.get(key) || [];

    if (options?.fromChain) {
      transactions = transactions.filter(t => t.fromChain === options.fromChain);
    }

    if (options?.toChain) {
      transactions = transactions.filter(t => t.toChain === options.toChain);
    }

    if (options?.status) {
      transactions = transactions.filter(t => t.status === options.status);
    }

    transactions.sort((a, b) => b.timestamp - a.timestamp);

    if (options?.limit) {
      transactions = transactions.slice(0, options.limit);
    }

    return transactions;
  }

  /**
   * Get asset across chains
   */
  getAssetAcrossChains(
    walletAddress: string,
    tokenSymbol: string
  ): CrossChainAsset | null {
    const portfolio = this.getPortfolio(walletAddress);
    if (!portfolio) {
      return null;
    }

    return portfolio.assets.find(a => a.tokenSymbol === tokenSymbol) || null;
  }

  /**
   * Calculate bridge statistics
   */
  getBridgeStats(walletAddress: string): {
    totalBridges: number;
    totalValueBridged: number; // USD
    byProtocol: Record<string, number>;
    byChainPair: Record<string, number>;
    pendingBridges: number;
  } {
    const transactions = this.getBridgeTransactions(walletAddress);
    
    const totalValueBridged = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amountUSD, 0);

    const byProtocol: Record<string, number> = {};
    transactions.forEach(t => {
      byProtocol[t.bridgeProtocol] = (byProtocol[t.bridgeProtocol] || 0) + t.amountUSD;
    });

    const byChainPair: Record<string, number> = {};
    transactions.forEach(t => {
      const pair = `${t.fromChain}-${t.toChain}`;
      byChainPair[pair] = (byChainPair[pair] || 0) + t.amountUSD;
    });

    const pendingBridges = transactions.filter(t => t.status === 'pending').length;

    return {
      totalBridges: transactions.length,
      totalValueBridged: Math.round(totalValueBridged * 100) / 100,
      byProtocol,
      byChainPair,
      pendingBridges,
    };
  }

  /**
   * Clear portfolio
   */
  clear(walletAddress?: string): void {
    if (walletAddress) {
      this.portfolios.delete(walletAddress.toLowerCase());
      this.bridgeTransactions.delete(walletAddress.toLowerCase());
    } else {
      this.portfolios.clear();
      this.bridgeTransactions.clear();
    }
  }
}

// Singleton instance
export const crossChainAssetTracker = new CrossChainAssetTracker();

