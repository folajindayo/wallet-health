/**
 * Gas Price Tracker Utility
 * Tracks and predicts gas prices across multiple chains
 */

export interface GasPrice {
  chainId: number;
  timestamp: number;
  slow: number; // gwei
  standard: number; // gwei
  fast: number; // gwei
  instant?: number; // gwei
  baseFee?: number; // gwei (EIP-1559)
  priorityFee?: {
    slow: number;
    standard: number;
    fast: number;
  };
}

export interface GasPriceHistory {
  chainId: number;
  prices: GasPrice[];
}

export interface GasEstimate {
  chainId: number;
  transactionType: 'transfer' | 'approval' | 'swap' | 'contract_call' | 'complex';
  estimatedGas: number; // gas units
  estimatedCost: {
    slow: number; // in native token
    standard: number;
    fast: number;
    instant?: number;
  };
  estimatedCostUSD?: {
    slow: number;
    standard: number;
    fast: number;
    instant?: number;
  };
}

export class GasTracker {
  private priceHistory: Map<number, GasPrice[]> = new Map();
  private priceCache: Map<number, GasPrice> = new Map();
  private cacheExpiry: Map<number, number> = new Map();
  private readonly CACHE_TTL = 30000; // 30 seconds

  /**
   * Get current gas prices for a chain
   */
  async getGasPrice(chainId: number): Promise<GasPrice | null> {
    const cached = this.priceCache.get(chainId);
    const expiry = this.cacheExpiry.get(chainId);

    // Return cached if still valid
    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    try {
      const price = await this.fetchGasPrice(chainId);
      if (price) {
        this.priceCache.set(chainId, price);
        this.cacheExpiry.set(chainId, Date.now() + this.CACHE_TTL);
        
        // Add to history
        const history = this.priceHistory.get(chainId) || [];
        history.push(price);
        // Keep last 100 entries
        if (history.length > 100) {
          history.shift();
        }
        this.priceHistory.set(chainId, history);
      }
      return price;
    } catch (error) {
      console.error(`Error fetching gas price for chain ${chainId}:`, error);
      return cached || null;
    }
  }

  /**
   * Fetch gas price from API/RPC (placeholder)
   */
  private async fetchGasPrice(chainId: number): Promise<GasPrice | null> {
    // In real implementation, this would call:
    // - GoldRush API for gas prices
    // - Or direct RPC calls to get gas prices
    
    // Placeholder structure
    return {
      chainId,
      timestamp: Date.now(),
      slow: 20,
      standard: 30,
      fast: 50,
      instant: 100,
    };
  }

  /**
   * Get gas price history
   */
  getGasPriceHistory(chainId: number, hours = 24): GasPrice[] {
    const history = this.priceHistory.get(chainId) || [];
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return history.filter(p => p.timestamp >= cutoff);
  }

  /**
   * Predict gas price based on historical data
   */
  predictGasPrice(chainId: number, timeframe: '1h' | '6h' | '24h' = '1h'): GasPrice | null {
    const history = this.getGasPriceHistory(chainId, 24);
    if (history.length < 2) {
      return null;
    }

    // Simple moving average prediction
    const recent = history.slice(-10);
    const avgSlow = recent.reduce((sum, p) => sum + p.slow, 0) / recent.length;
    const avgStandard = recent.reduce((sum, p) => sum + p.standard, 0) / recent.length;
    const avgFast = recent.reduce((sum, p) => sum + p.fast, 0) / recent.length;

    return {
      chainId,
      timestamp: Date.now(),
      slow: Math.round(avgSlow),
      standard: Math.round(avgStandard),
      fast: Math.round(avgFast),
    };
  }

  /**
   * Estimate gas cost for a transaction
   */
  async estimateGasCost(
    chainId: number,
    transactionType: GasEstimate['transactionType'],
    gasPrice?: GasPrice
  ): Promise<GasEstimate | null> {
    const prices = gasPrice || await this.getGasPrice(chainId);
    if (!prices) {
      return null;
    }

    // Estimated gas units by transaction type
    const gasEstimates: Record<GasEstimate['transactionType'], number> = {
      transfer: 21000,
      approval: 46000,
      swap: 150000,
      contract_call: 100000,
      complex: 300000,
    };

    const estimatedGas = gasEstimates[transactionType] || 100000;

    // Calculate cost in native token (gwei * gas units / 1e9)
    const calculateCost = (gwei: number) => (gwei * estimatedGas) / 1e9;

    return {
      chainId,
      transactionType,
      estimatedGas,
      estimatedCost: {
        slow: calculateCost(prices.slow),
        standard: calculateCost(prices.standard),
        fast: calculateCost(prices.fast),
        instant: prices.instant ? calculateCost(prices.instant) : undefined,
      },
    };
  }

  /**
   * Get optimal gas price recommendation
   */
  getOptimalGasPrice(chainId: number, urgency: 'low' | 'medium' | 'high' = 'medium'): {
    recommended: number;
    speed: 'slow' | 'standard' | 'fast' | 'instant';
    estimatedTime: string;
  } | null {
    const current = this.priceCache.get(chainId);
    if (!current) {
      return null;
    }

    const recommendations = {
      low: { gwei: current.slow, speed: 'slow' as const, time: '5-15 minutes' },
      medium: { gwei: current.standard, speed: 'standard' as const, time: '1-3 minutes' },
      high: { gwei: current.fast, speed: 'fast' as const, time: '30-60 seconds' },
    };

    const rec = recommendations[urgency];
    return {
      recommended: rec.gwei,
      speed: rec.speed,
      estimatedTime: rec.time,
    };
  }

  /**
   * Compare gas prices across chains
   */
  async compareGasPrices(chainIds: number[]): Promise<Map<number, GasPrice>> {
    const prices = new Map<number, GasPrice>();
    
    await Promise.all(
      chainIds.map(async (chainId) => {
        const price = await this.getGasPrice(chainId);
        if (price) {
          prices.set(chainId, price);
        }
      })
    );

    return prices;
  }
}

// Singleton instance
export const gasTracker = new GasTracker();

