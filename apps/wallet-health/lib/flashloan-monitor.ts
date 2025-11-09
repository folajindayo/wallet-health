/**
 * Flashloan Monitor Utility
 * Monitors flashloan usage and detects potential risks
 */

export interface FlashloanTransaction {
  hash: string;
  timestamp: number;
  protocol: string;
  chainId: number;
  asset: string;
  assetSymbol: string;
  amount: string;
  amountUSD: number;
  fee: string;
  feeUSD: number;
  profit?: number; // USD
  profitPercent?: number;
  status: 'success' | 'failed';
  transactions: string[]; // Related transaction hashes
}

export interface FlashloanPattern {
  type: 'arbitrage' | 'liquidation' | 'collateral_swap' | 'debt_refinance' | 'unknown';
  frequency: number; // per month
  averageProfit: number; // USD
  successRate: number; // percentage
  riskLevel: 'low' | 'medium' | 'high';
}

export interface FlashloanStats {
  totalFlashloans: number;
  totalVolumeUSD: number;
  totalFeesUSD: number;
  totalProfitUSD: number;
  averageProfit: number;
  successRate: number;
  protocolsUsed: Record<string, number>;
  mostProfitable: FlashloanTransaction | null;
  patterns: FlashloanPattern[];
}

export class FlashloanMonitor {
  private flashloans: FlashloanTransaction[] = [];
  private knownProtocols: Set<string> = new Set();

  constructor() {
    this.initializeKnownProtocols();
  }

  /**
   * Add a flashloan transaction
   */
  addFlashloan(flashloan: FlashloanTransaction): void {
    this.flashloans.push(flashloan);
    
    // Keep sorted by timestamp
    this.flashloans.sort((a, b) => b.timestamp - a.timestamp);
    
    // Keep only last 10000 flashloans
    if (this.flashloans.length > 10000) {
      this.flashloans = this.flashloans.slice(-10000);
    }
  }

  /**
   * Get flashloan statistics
   */
  getStats(walletAddress?: string): FlashloanStats {
    let filtered = this.flashloans;
    
    // Filter by wallet if provided (would need to check transaction from address)
    // For now, return all stats

    const successful = filtered.filter(f => f.status === 'success');
    const totalVolumeUSD = filtered.reduce((sum, f) => sum + f.amountUSD, 0);
    const totalFeesUSD = filtered.reduce((sum, f) => sum + f.feeUSD, 0);
    const totalProfitUSD = successful.reduce((sum, f) => sum + (f.profit || 0), 0);
    const averageProfit = successful.length > 0
      ? totalProfitUSD / successful.length
      : 0;
    const successRate = filtered.length > 0
      ? (successful.length / filtered.length) * 100
      : 0;

    // Count protocols
    const protocolsUsed: Record<string, number> = {};
    filtered.forEach(f => {
      protocolsUsed[f.protocol] = (protocolsUsed[f.protocol] || 0) + 1;
    });

    // Find most profitable
    const mostProfitable = successful.length > 0
      ? successful.reduce((best, current) => 
          (current.profit || 0) > (best.profit || 0) ? current : best
        )
      : null;

    // Detect patterns
    const patterns = this.detectPatterns(filtered);

    return {
      totalFlashloans: filtered.length,
      totalVolumeUSD,
      totalFeesUSD,
      totalProfitUSD,
      averageProfit: Math.round(averageProfit * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      protocolsUsed,
      mostProfitable,
      patterns,
    };
  }

  /**
   * Detect flashloan patterns
   */
  private detectPatterns(flashloans: FlashloanTransaction[]): FlashloanPattern[] {
    const patterns: FlashloanPattern[] = [];
    
    // Group by type (simplified - would need transaction analysis)
    const typeGroups = new Map<string, FlashloanTransaction[]>();
    
    flashloans.forEach(flashloan => {
      // Determine type based on transactions (simplified)
      const type = this.determineFlashloanType(flashloan);
      if (!typeGroups.has(type)) {
        typeGroups.set(type, []);
      }
      typeGroups.get(type)!.push(flashloan);
    });

    // Calculate pattern statistics
    typeGroups.forEach((transactions, type) => {
      const successful = transactions.filter(t => t.status === 'success');
      const totalProfit = successful.reduce((sum, t) => sum + (t.profit || 0), 0);
      const averageProfit = successful.length > 0 ? totalProfit / successful.length : 0;
      const successRate = transactions.length > 0
        ? (successful.length / transactions.length) * 100
        : 0;

      // Calculate frequency (per month)
      const timeSpan = transactions.length > 1
        ? (transactions[0].timestamp - transactions[transactions.length - 1].timestamp) / (30 * 24 * 60 * 60 * 1000)
        : 1;
      const frequency = timeSpan > 0 ? transactions.length / timeSpan : transactions.length;

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (successRate < 50 || averageProfit < 0) {
        riskLevel = 'high';
      } else if (successRate < 80 || averageProfit < 100) {
        riskLevel = 'medium';
      }

      patterns.push({
        type: type as FlashloanPattern['type'],
        frequency: Math.round(frequency * 100) / 100,
        averageProfit: Math.round(averageProfit * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
        riskLevel,
      });
    });

    return patterns;
  }

  /**
   * Determine flashloan type (simplified)
   */
  private determineFlashloanType(flashloan: FlashloanTransaction): string {
    // In production, would analyze transaction data
    // For now, return based on profit
    if (flashloan.profit && flashloan.profit > 1000) {
      return 'arbitrage';
    }
    return 'unknown';
  }

  /**
   * Get flashloans by protocol
   */
  getFlashloansByProtocol(protocol: string): FlashloanTransaction[] {
    return this.flashloans.filter(f => f.protocol === protocol);
  }

  /**
   * Get recent flashloans
   */
  getRecentFlashloans(days = 7, limit = 50): FlashloanTransaction[] {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.flashloans
      .filter(f => f.timestamp >= cutoff)
      .slice(0, limit);
  }

  /**
   * Calculate flashloan profitability
   */
  calculateProfitability(flashloan: FlashloanTransaction): {
    profitUSD: number;
    profitPercent: number;
    roi: number; // Return on investment
  } {
    const profitUSD = flashloan.profit || 0;
    const profitPercent = flashloan.amountUSD > 0
      ? (profitUSD / flashloan.amountUSD) * 100
      : 0;
    const roi = flashloan.feeUSD > 0
      ? (profitUSD / flashloan.feeUSD) * 100
      : 0;

    return {
      profitUSD,
      profitPercent: Math.round(profitPercent * 100) / 100,
      roi: Math.round(roi * 100) / 100,
    };
  }

  /**
   * Initialize known flashloan protocols
   */
  private initializeKnownProtocols(): void {
    this.knownProtocols.add('Aave');
    this.knownProtocols.add('dYdX');
    this.knownProtocols.add('Uniswap');
    this.knownProtocols.add('Balancer');
    this.knownProtocols.add('MakerDAO');
  }

  /**
   * Check if protocol is known
   */
  isKnownProtocol(protocol: string): boolean {
    return this.knownProtocols.has(protocol);
  }

  /**
   * Clear all flashloans
   */
  clear(): void {
    this.flashloans = [];
  }
}

// Singleton instance
export const flashloanMonitor = new FlashloanMonitor();

