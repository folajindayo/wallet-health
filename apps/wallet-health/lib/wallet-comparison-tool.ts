/**
 * Wallet Comparison Tool Utility
 * Compare multiple wallets side by side
 */

export interface WalletComparison {
  id: string;
  wallets: Array<{
    address: string;
    label?: string;
    chainId: number;
  }>;
  metrics: {
    totalValueUSD: number;
    tokenCount: number;
    transactionCount: number;
    riskScore: number;
    age: number; // days
  }[];
  createdAt: number;
  lastUpdated: number;
}

export interface ComparisonResult {
  comparison: WalletComparison;
  differences: {
    valueDifference: number; // USD
    valueDifferencePercent: number;
    tokenDifference: number;
    riskDifference: number;
    ageDifference: number; // days
  }[];
  rankings: {
    byValue: string[]; // wallet addresses
    byTokens: string[];
    byRisk: string[];
    byAge: string[];
  };
  insights: string[];
}

export class WalletComparisonTool {
  private comparisons: Map<string, WalletComparison> = new Map();

  /**
   * Create comparison
   */
  createComparison(
    wallets: Array<{ address: string; label?: string; chainId: number }>
  ): WalletComparison {
    const id = `comparison-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const comparison: WalletComparison = {
      id,
      wallets,
      metrics: wallets.map(() => ({
        totalValueUSD: 0,
        tokenCount: 0,
        transactionCount: 0,
        riskScore: 0,
        age: 0,
      })),
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    this.comparisons.set(id, comparison);
    return comparison;
  }

  /**
   * Update comparison metrics
   */
  updateMetrics(
    comparisonId: string,
    walletIndex: number,
    metrics: Partial<WalletComparison['metrics'][0]>
  ): boolean {
    const comparison = this.comparisons.get(comparisonId);
    if (!comparison || walletIndex >= comparison.metrics.length) {
      return false;
    }

    comparison.metrics[walletIndex] = {
      ...comparison.metrics[walletIndex],
      ...metrics,
    };
    comparison.lastUpdated = Date.now();
    return true;
  }

  /**
   * Get comparison
   */
  getComparison(id: string): WalletComparison | null {
    return this.comparisons.get(id) || null;
  }

  /**
   * Analyze comparison
   */
  analyzeComparison(comparisonId: string): ComparisonResult | null {
    const comparison = this.comparisons.get(comparisonId);
    if (!comparison) {
      return null;
    }

    // Calculate differences
    const differences = comparison.metrics.map((metric, index) => {
      const otherMetrics = comparison.metrics.filter((_, i) => i !== index);
      const avgValue = otherMetrics.reduce((sum, m) => sum + m.totalValueUSD, 0) / otherMetrics.length;
      const avgTokens = otherMetrics.reduce((sum, m) => sum + m.tokenCount, 0) / otherMetrics.length;
      const avgRisk = otherMetrics.reduce((sum, m) => sum + m.riskScore, 0) / otherMetrics.length;
      const avgAge = otherMetrics.reduce((sum, m) => sum + m.age, 0) / otherMetrics.length;

      return {
        valueDifference: metric.totalValueUSD - avgValue,
        valueDifferencePercent: avgValue > 0
          ? ((metric.totalValueUSD - avgValue) / avgValue) * 100
          : 0,
        tokenDifference: metric.tokenCount - avgTokens,
        riskDifference: metric.riskScore - avgRisk,
        ageDifference: metric.age - avgAge,
      };
    });

    // Generate rankings
    const byValue = [...comparison.wallets]
      .sort((a, b) => {
        const indexA = comparison.wallets.indexOf(a);
        const indexB = comparison.wallets.indexOf(b);
        return comparison.metrics[indexB].totalValueUSD - comparison.metrics[indexA].totalValueUSD;
      })
      .map(w => w.address);

    const byTokens = [...comparison.wallets]
      .sort((a, b) => {
        const indexA = comparison.wallets.indexOf(a);
        const indexB = comparison.wallets.indexOf(b);
        return comparison.metrics[indexB].tokenCount - comparison.metrics[indexA].tokenCount;
      })
      .map(w => w.address);

    const byRisk = [...comparison.wallets]
      .sort((a, b) => {
        const indexA = comparison.wallets.indexOf(a);
        const indexB = comparison.wallets.indexOf(b);
        return comparison.metrics[indexA].riskScore - comparison.metrics[indexB].riskScore; // Lower is better
      })
      .map(w => w.address);

    const byAge = [...comparison.wallets]
      .sort((a, b) => {
        const indexA = comparison.wallets.indexOf(a);
        const indexB = comparison.wallets.indexOf(b);
        return comparison.metrics[indexB].age - comparison.metrics[indexA].age;
      })
      .map(w => w.address);

    // Generate insights
    const insights: string[] = [];
    const maxValue = Math.max(...comparison.metrics.map(m => m.totalValueUSD));
    const minValue = Math.min(...comparison.metrics.map(m => m.totalValueUSD));
    
    if (maxValue > minValue * 2) {
      const maxIndex = comparison.metrics.findIndex(m => m.totalValueUSD === maxValue);
      insights.push(`${comparison.wallets[maxIndex].label || comparison.wallets[maxIndex].address} has significantly higher value than others`);
    }

    const maxRisk = Math.max(...comparison.metrics.map(m => m.riskScore));
    const minRisk = Math.min(...comparison.metrics.map(m => m.riskScore));
    if (maxRisk - minRisk > 30) {
      const minIndex = comparison.metrics.findIndex(m => m.riskScore === minRisk);
      insights.push(`${comparison.wallets[minIndex].label || comparison.wallets[minIndex].address} has the lowest risk score`);
    }

    return {
      comparison,
      differences,
      rankings: {
        byValue,
        byTokens,
        byRisk,
        byAge,
      },
      insights,
    };
  }

  /**
   * Delete comparison
   */
  deleteComparison(id: string): boolean {
    return this.comparisons.delete(id);
  }

  /**
   * Get all comparisons
   */
  getAllComparisons(): WalletComparison[] {
    return Array.from(this.comparisons.values());
  }

  /**
   * Clear all comparisons
   */
  clear(): void {
    this.comparisons.clear();
  }
}

// Singleton instance
export const walletComparisonTool = new WalletComparisonTool();

