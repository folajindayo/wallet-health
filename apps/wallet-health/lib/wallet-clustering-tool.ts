/**
 * Wallet Clustering Tool Utility
 * Cluster wallets by behavior patterns
 */

export interface WalletCluster {
  id: string;
  name: string;
  description: string;
  wallets: string[];
  characteristics: {
    averageValueUSD: number;
    commonTokens: string[];
    averageAge: number; // days
    activityLevel: 'low' | 'medium' | 'high';
    riskProfile: 'low' | 'medium' | 'high';
  };
  createdAt: number;
}

export interface WalletBehavior {
  walletAddress: string;
  metrics: {
    totalTransactions: number;
    totalValueUSD: number;
    tokenCount: number;
    defiInteractions: number;
    nftCount: number;
    accountAge: number; // days
    averageTransactionValue: number;
    transactionFrequency: number; // per day
  };
  patterns: {
    preferredChains: number[];
    preferredTokens: string[];
    tradingHours: number[]; // Hours of day when most active
    activityDays: number[]; // Days of week when most active
  };
}

export interface ClusteringResult {
  clusters: WalletCluster[];
  unclustered: string[];
  statistics: {
    totalWallets: number;
    clusteredWallets: number;
    clusterCount: number;
    averageClusterSize: number;
  };
}

export class WalletClusteringTool {
  private clusters: Map<string, WalletCluster> = new Map();
  private behaviors: Map<string, WalletBehavior> = new Map();

  /**
   * Analyze wallet behavior
   */
  analyzeBehavior(
    walletAddress: string,
    data: {
      transactions: Array<{ timestamp: number; value: number; chainId: number }>;
      tokens: Array<{ token: string; valueUSD: number }>;
      defiInteractions: number;
      nfts: number;
      accountAge: number;
    }
  ): WalletBehavior {
    const totalTransactions = data.transactions.length;
    const totalValueUSD = data.transactions.reduce((sum, t) => sum + t.value, 0);
    const averageTransactionValue = totalTransactions > 0
      ? totalValueUSD / totalTransactions
      : 0;

    const accountAge = data.accountAge;
    const transactionFrequency = accountAge > 0
      ? totalTransactions / accountAge
      : 0;

    // Analyze preferred chains
    const chainCounts = new Map<number, number>();
    data.transactions.forEach(t => {
      chainCounts.set(t.chainId, (chainCounts.get(t.chainId) || 0) + 1);
    });
    const preferredChains = Array.from(chainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([chainId]) => chainId);

    // Analyze preferred tokens
    const preferredTokens = data.tokens
      .sort((a, b) => b.valueUSD - a.valueUSD)
      .slice(0, 5)
      .map(t => t.token);

    // Analyze trading hours
    const hourCounts = new Map<number, number>();
    data.transactions.forEach(t => {
      const hour = new Date(t.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    const tradingHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);

    // Analyze activity days
    const dayCounts = new Map<number, number>();
    data.transactions.forEach(t => {
      const day = new Date(t.timestamp).getDay();
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });
    const activityDays = Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    // Determine activity level
    let activityLevel: 'low' | 'medium' | 'high' = 'low';
    if (transactionFrequency > 1) {
      activityLevel = 'high';
    } else if (transactionFrequency > 0.1) {
      activityLevel = 'medium';
    }

    const behavior: WalletBehavior = {
      walletAddress: walletAddress.toLowerCase(),
      metrics: {
        totalTransactions,
        totalValueUSD: Math.round(totalValueUSD * 100) / 100,
        tokenCount: data.tokens.length,
        defiInteractions: data.defiInteractions,
        nftCount: data.nfts,
        accountAge,
        averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
        transactionFrequency: Math.round(transactionFrequency * 100) / 100,
      },
      patterns: {
        preferredChains,
        preferredTokens,
        tradingHours,
        activityDays,
      },
    };

    this.behaviors.set(walletAddress.toLowerCase(), behavior);
    return behavior;
  }

  /**
   * Cluster wallets by behavior
   */
  clusterWallets(
    walletAddresses: string[],
    similarityThreshold = 0.7
  ): ClusteringResult {
    const behaviors = walletAddresses
      .map(addr => this.behaviors.get(addr.toLowerCase()))
      .filter((b): b is WalletBehavior => b !== undefined);

    if (behaviors.length === 0) {
      return {
        clusters: [],
        unclustered: walletAddresses,
        statistics: {
          totalWallets: walletAddresses.length,
          clusteredWallets: 0,
          clusterCount: 0,
          averageClusterSize: 0,
        },
      };
    }

    const clusters: WalletCluster[] = [];
    const clustered = new Set<string>();
    let clusterId = 1;

    behaviors.forEach(behavior => {
      if (clustered.has(behavior.walletAddress)) {
        return;
      }

      // Find similar wallets
      const similarWallets = behaviors.filter(b => {
        if (b.walletAddress === behavior.walletAddress || clustered.has(b.walletAddress)) {
          return false;
        }

        const similarity = this.calculateSimilarity(behavior, b);
        return similarity >= similarityThreshold;
      });

      if (similarWallets.length > 0) {
        const clusterWallets = [behavior.walletAddress, ...similarWallets.map(b => b.walletAddress)];
        
        // Calculate cluster characteristics
        const allBehaviors = [behavior, ...similarWallets];
        const averageValue = allBehaviors.reduce((sum, b) => sum + b.metrics.totalValueUSD, 0) / allBehaviors.length;
        const averageAge = allBehaviors.reduce((sum, b) => sum + b.metrics.accountAge, 0) / allBehaviors.length;

        // Find common tokens
        const tokenCounts = new Map<string, number>();
        allBehaviors.forEach(b => {
          b.patterns.preferredTokens.forEach(token => {
            tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
          });
        });
        const commonTokens = Array.from(tokenCounts.entries())
          .filter(([, count]) => count >= allBehaviors.length * 0.5)
          .map(([token]) => token)
          .slice(0, 5);

        // Determine activity level and risk profile
        const avgActivity = allBehaviors.reduce((sum, b) => {
          const level = b.metrics.activityLevel === 'high' ? 3 : b.metrics.activityLevel === 'medium' ? 2 : 1;
          return sum + level;
        }, 0) / allBehaviors.length;

        const activityLevel: 'low' | 'medium' | 'high' = avgActivity >= 2.5 ? 'high' : avgActivity >= 1.5 ? 'medium' : 'low';
        const riskProfile: 'low' | 'medium' | 'high' = activityLevel === 'high' ? 'medium' : 'low';

        const cluster: WalletCluster = {
          id: `cluster-${clusterId++}`,
          name: `Cluster ${clusterId - 1}`,
          description: `${clusterWallets.length} wallets with similar behavior patterns`,
          wallets: clusterWallets,
          characteristics: {
            averageValueUSD: Math.round(averageValue * 100) / 100,
            commonTokens,
            averageAge: Math.round(averageAge),
            activityLevel,
            riskProfile,
          },
          createdAt: Date.now(),
        };

        clusters.push(cluster);
        clusterWallets.forEach(addr => clustered.add(addr));
      }
    });

    const unclustered = walletAddresses.filter(addr => !clustered.has(addr.toLowerCase()));

    return {
      clusters,
      unclustered,
      statistics: {
        totalWallets: walletAddresses.length,
        clusteredWallets: clustered.size,
        clusterCount: clusters.length,
        averageClusterSize: clusters.length > 0
          ? clustered.size / clusters.length
          : 0,
      },
    };
  }

  /**
   * Calculate similarity between two behaviors
   */
  private calculateSimilarity(behavior1: WalletBehavior, behavior2: WalletBehavior): number {
    let similarity = 0;
    let factors = 0;

    // Compare transaction frequency (normalized)
    const freqDiff = Math.abs(behavior1.metrics.transactionFrequency - behavior2.metrics.transactionFrequency);
    const maxFreq = Math.max(behavior1.metrics.transactionFrequency, behavior2.metrics.transactionFrequency, 1);
    similarity += (1 - Math.min(1, freqDiff / maxFreq)) * 0.2;
    factors += 0.2;

    // Compare preferred chains
    const commonChains = behavior1.patterns.preferredChains.filter(c =>
      behavior2.patterns.preferredChains.includes(c)
    ).length;
    const maxChains = Math.max(behavior1.patterns.preferredChains.length, behavior2.patterns.preferredChains.length, 1);
    similarity += (commonChains / maxChains) * 0.3;
    factors += 0.3;

    // Compare preferred tokens
    const commonTokens = behavior1.patterns.preferredTokens.filter(t =>
      behavior2.patterns.preferredTokens.includes(t)
    ).length;
    const maxTokens = Math.max(behavior1.patterns.preferredTokens.length, behavior2.patterns.preferredTokens.length, 1);
    similarity += (commonTokens / maxTokens) * 0.3;
    factors += 0.3;

    // Compare activity level
    if (behavior1.metrics.activityLevel === behavior2.metrics.activityLevel) {
      similarity += 0.2;
    }
    factors += 0.2;

    return factors > 0 ? similarity / factors : 0;
  }

  /**
   * Get behavior for wallet
   */
  getBehavior(walletAddress: string): WalletBehavior | null {
    return this.behaviors.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Get cluster
   */
  getCluster(id: string): WalletCluster | null {
    return this.clusters.get(id) || null;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.clusters.clear();
    this.behaviors.clear();
  }
}

// Singleton instance
export const walletClusteringTool = new WalletClusteringTool();

