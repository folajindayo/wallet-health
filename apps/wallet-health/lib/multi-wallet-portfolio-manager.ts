/**
 * Multi-Wallet Portfolio Manager
 * Manage and compare multiple wallets in a unified portfolio view
 */

export interface WalletPortfolio {
  address: string;
  label?: string;
  tags: string[];
  chains: number[];
  totalValueUSD: number;
  tokenCount: number;
  nftCount: number;
  healthScore: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: number;
  metadata?: Record<string, any>;
}

export interface PortfolioSummary {
  totalWallets: number;
  totalValueUSD: number;
  averageHealthScore: number;
  overallRiskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  chainDistribution: Record<number, number>; // chainId -> valueUSD
  tokenDistribution: Record<string, number>; // tokenSymbol -> valueUSD
  riskDistribution: Record<string, number>; // riskLevel -> count
  topWallets: Array<{
    address: string;
    label?: string;
    valueUSD: number;
    healthScore: number;
  }>;
  recommendations: string[];
}

export interface WalletComparison {
  wallets: Array<{
    address: string;
    label?: string;
    metrics: {
      totalValueUSD: number;
      healthScore: number;
      tokenCount: number;
      transactionCount?: number;
      riskLevel: string;
    };
  }>;
  similarities: Array<{
    wallet1: string;
    wallet2: string;
    similarity: number; // 0-100
    commonTokens: string[];
    commonContracts: string[];
  }>;
  differences: Array<{
    metric: string;
    wallet1: string;
    wallet2: string;
    difference: number;
  }>;
}

export class MultiWalletPortfolioManager {
  private portfolios: Map<string, WalletPortfolio> = new Map();
  private walletGroups: Map<string, string[]> = new Map(); // groupName -> wallet addresses

  /**
   * Add or update wallet portfolio
   */
  addWallet(portfolio: WalletPortfolio): void {
    const key = portfolio.address.toLowerCase();
    this.portfolios.set(key, {
      ...portfolio,
      lastUpdated: Date.now(),
    });
  }

  /**
   * Remove wallet
   */
  removeWallet(address: string): boolean {
    const key = address.toLowerCase();
    const removed = this.portfolios.delete(key);

    // Remove from all groups
    this.walletGroups.forEach((addresses, groupName) => {
      const filtered = addresses.filter((addr) => addr.toLowerCase() !== key);
      if (filtered.length !== addresses.length) {
        this.walletGroups.set(groupName, filtered);
      }
    });

    return removed;
  }

  /**
   * Get wallet portfolio
   */
  getWallet(address: string): WalletPortfolio | null {
    return this.portfolios.get(address.toLowerCase()) || null;
  }

  /**
   * Get all wallets
   */
  getAllWallets(): WalletPortfolio[] {
    return Array.from(this.portfolios.values());
  }

  /**
   * Get portfolio summary
   */
  getSummary(walletAddresses?: string[]): PortfolioSummary {
    const wallets = walletAddresses
      ? walletAddresses.map((addr) => this.getWallet(addr)).filter((w) => w !== null) as WalletPortfolio[]
      : this.getAllWallets();

    if (wallets.length === 0) {
      return {
        totalWallets: 0,
        totalValueUSD: 0,
        averageHealthScore: 0,
        overallRiskLevel: 'safe',
        chainDistribution: {},
        tokenDistribution: {},
        riskDistribution: {},
        topWallets: [],
        recommendations: [],
      };
    }

    const totalValueUSD = wallets.reduce((sum, w) => sum + w.totalValueUSD, 0);
    const averageHealthScore =
      wallets.reduce((sum, w) => sum + w.healthScore, 0) / wallets.length;

    // Chain distribution
    const chainDistribution: Record<number, number> = {};
    wallets.forEach((w) => {
      w.chains.forEach((chainId) => {
        chainDistribution[chainId] = (chainDistribution[chainId] || 0) + w.totalValueUSD;
      });
    });

    // Risk distribution
    const riskDistribution: Record<string, number> = {};
    wallets.forEach((w) => {
      riskDistribution[w.riskLevel] = (riskDistribution[w.riskLevel] || 0) + 1;
    });

    // Overall risk level
    const riskScores: Record<string, number> = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
      safe: 1,
    };
    const maxRisk = wallets.reduce((max, w) => {
      const score = riskScores[w.riskLevel] || 0;
      return score > max ? score : max;
    }, 0);
    const overallRiskLevel = Object.entries(riskScores).find(
      ([_, score]) => score === maxRisk
    )?.[0] as PortfolioSummary['overallRiskLevel'] || 'safe';

    // Top wallets by value
    const topWallets = wallets
      .sort((a, b) => b.totalValueUSD - a.totalValueUSD)
      .slice(0, 5)
      .map((w) => ({
        address: w.address,
        label: w.label,
        valueUSD: w.totalValueUSD,
        healthScore: w.healthScore,
      }));

    // Generate recommendations
    const recommendations = this.generateRecommendations(wallets, averageHealthScore, overallRiskLevel);

    return {
      totalWallets: wallets.length,
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      averageHealthScore: Math.round(averageHealthScore * 100) / 100,
      overallRiskLevel,
      chainDistribution,
      tokenDistribution: {}, // Would need token data to populate
      riskDistribution,
      topWallets,
      recommendations,
    };
  }

  /**
   * Compare wallets
   */
  compareWallets(addresses: string[]): WalletComparison | null {
    if (addresses.length < 2) return null;

    const wallets = addresses
      .map((addr) => this.getWallet(addr))
      .filter((w) => w !== null) as WalletPortfolio[];

    if (wallets.length < 2) return null;

    // Calculate similarities
    const similarities: WalletComparison['similarities'] = [];
    for (let i = 0; i < wallets.length; i++) {
      for (let j = i + 1; j < wallets.length; j++) {
        const similarity = this.calculateSimilarity(wallets[i], wallets[j]);
        similarities.push({
          wallet1: wallets[i].address,
          wallet2: wallets[j].address,
          similarity: Math.round(similarity.similarity * 100) / 100,
          commonTokens: similarity.commonTokens,
          commonContracts: similarity.commonContracts,
        });
      }
    }

    // Calculate differences
    const differences: WalletComparison['differences'] = [];
    const metrics = ['totalValueUSD', 'healthScore', 'tokenCount'];
    metrics.forEach((metric) => {
      const values = wallets.map((w) => (w as any)[metric]);
      const max = Math.max(...values);
      const min = Math.min(...values);
      if (max !== min) {
        const maxWallet = wallets[values.indexOf(max)];
        const minWallet = wallets[values.indexOf(min)];
        differences.push({
          metric,
          wallet1: maxWallet.address,
          wallet2: minWallet.address,
          difference: max - min,
        });
      }
    });

    return {
      wallets: wallets.map((w) => ({
        address: w.address,
        label: w.label,
        metrics: {
          totalValueUSD: w.totalValueUSD,
          healthScore: w.healthScore,
          tokenCount: w.tokenCount,
          riskLevel: w.riskLevel,
        },
      })),
      similarities,
      differences,
    };
  }

  /**
   * Calculate similarity between two wallets
   */
  private calculateSimilarity(
    wallet1: WalletPortfolio,
    wallet2: WalletPortfolio
  ): {
    similarity: number;
    commonTokens: string[];
    commonContracts: string[];
  } {
    let similarity = 0;
    let factors = 0;

    // Health score similarity
    const healthDiff = Math.abs(wallet1.healthScore - wallet2.healthScore);
    similarity += (100 - healthDiff) / 100;
    factors++;

    // Risk level similarity
    if (wallet1.riskLevel === wallet2.riskLevel) {
      similarity += 1;
    }
    factors++;

    // Chain overlap
    const commonChains = wallet1.chains.filter((c) => wallet2.chains.includes(c));
    const totalChains = new Set([...wallet1.chains, ...wallet2.chains]).size;
    if (totalChains > 0) {
      similarity += commonChains.length / totalChains;
    }
    factors++;

    // Tag overlap
    const commonTags = wallet1.tags.filter((t) => wallet2.tags.includes(t));
    const totalTags = new Set([...wallet1.tags, ...wallet2.tags]).size;
    if (totalTags > 0) {
      similarity += commonTags.length / totalTags;
    }
    factors++;

    return {
      similarity: factors > 0 ? similarity / factors : 0,
      commonTokens: [], // Would need token data
      commonContracts: [], // Would need contract data
    };
  }

  /**
   * Create wallet group
   */
  createGroup(name: string, walletAddresses: string[]): void {
    this.walletGroups.set(name, walletAddresses.map((addr) => addr.toLowerCase()));
  }

  /**
   * Get wallet groups
   */
  getGroups(): Record<string, WalletPortfolio[]> {
    const groups: Record<string, WalletPortfolio[]> = {};
    this.walletGroups.forEach((addresses, name) => {
      groups[name] = addresses
        .map((addr) => this.getWallet(addr))
        .filter((w) => w !== null) as WalletPortfolio[];
    });
    return groups;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    wallets: WalletPortfolio[],
    averageHealthScore: number,
    overallRiskLevel: PortfolioSummary['overallRiskLevel']
  ): string[] {
    const recommendations: string[] = [];

    if (averageHealthScore < 50) {
      recommendations.push('Overall portfolio health is low - review security practices');
    }

    const highRiskWallets = wallets.filter((w) => w.riskLevel === 'high' || w.riskLevel === 'critical');
    if (highRiskWallets.length > 0) {
      recommendations.push(
        `${highRiskWallets.length} wallet(s) have high risk - prioritize security improvements`
      );
    }

    const lowHealthWallets = wallets.filter((w) => w.healthScore < 50);
    if (lowHealthWallets.length > wallets.length / 2) {
      recommendations.push('Majority of wallets have low health scores - comprehensive review needed');
    }

    // Diversification
    const uniqueChains = new Set(wallets.flatMap((w) => w.chains)).size;
    if (uniqueChains < 2 && wallets.length > 1) {
      recommendations.push('Consider diversifying across multiple chains');
    }

    if (recommendations.length === 0) {
      recommendations.push('Portfolio appears healthy - continue monitoring');
    }

    return recommendations;
  }

  /**
   * Export portfolio data
   */
  exportPortfolio(walletAddresses?: string[]): {
    wallets: WalletPortfolio[];
    summary: PortfolioSummary;
  } {
    return {
      wallets: walletAddresses
        ? walletAddresses.map((addr) => this.getWallet(addr)).filter((w) => w !== null) as WalletPortfolio[]
        : this.getAllWallets(),
      summary: this.getSummary(walletAddresses),
    };
  }
}

// Singleton instance
export const multiWalletPortfolioManager = new MultiWalletPortfolioManager();

