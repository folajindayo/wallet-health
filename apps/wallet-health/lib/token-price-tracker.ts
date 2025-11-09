/**
 * Token Price Tracker
 * Tracks token prices and portfolio value over time
 */

export interface TokenPrice {
  tokenAddress: string;
  symbol: string;
  chainId: number;
  price: number; // USD
  priceChange24h: number; // percentage
  priceChange7d: number; // percentage
  marketCap?: number;
  volume24h?: number;
  timestamp: number;
}

export interface PriceHistory {
  tokenAddress: string;
  chainId: number;
  prices: Array<{
    price: number;
    timestamp: number;
  }>;
}

export interface PortfolioValue {
  walletAddress: string;
  timestamp: number;
  totalValueUSD: number;
  tokens: Array<{
    tokenAddress: string;
    symbol: string;
    balance: string;
    price: number;
    valueUSD: number;
    allocation: number; // percentage
  }>;
  chains: Record<number, {
    chainId: number;
    valueUSD: number;
    allocation: number;
  }>;
  historical?: {
    value1hAgo?: number;
    value24hAgo?: number;
    value7dAgo?: number;
    value30dAgo?: number;
  };
}

export interface PriceAlert {
  id: string;
  tokenAddress: string;
  chainId: number;
  type: 'above' | 'below' | 'change';
  threshold: number;
  currentPrice: number;
  triggered: boolean;
  triggeredAt?: number;
}

export class TokenPriceTracker {
  private priceCache: Map<string, TokenPrice> = new Map(); // token-chain -> price
  private priceHistory: Map<string, PriceHistory> = new Map();
  private alerts: Map<string, PriceAlert[]> = new Map(); // wallet -> alerts
  private readonly CACHE_TTL = 60000; // 1 minute

  /**
   * Get current price for a token
   */
  async getPrice(tokenAddress: string, chainId: number): Promise<TokenPrice | null> {
    const key = `${tokenAddress.toLowerCase()}-${chainId}`;
    const cached = this.priceCache.get(key);

    // Return cached if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached;
    }

    try {
      const price = await this.fetchPrice(tokenAddress, chainId);
      if (price) {
        this.priceCache.set(key, price);
        this.addToHistory(tokenAddress, chainId, price.price);
      }
      return price;
    } catch (error) {
      console.error(`Error fetching price for ${tokenAddress}:`, error);
      return cached || null;
    }
  }

  /**
   * Get prices for multiple tokens
   */
  async getPrices(
    tokens: Array<{ address: string; chainId: number }>
  ): Promise<Map<string, TokenPrice>> {
    const prices = new Map<string, TokenPrice>();

    await Promise.all(
      tokens.map(async ({ address, chainId }) => {
        const price = await this.getPrice(address, chainId);
        if (price) {
          prices.set(`${address.toLowerCase()}-${chainId}`, price);
        }
      })
    );

    return prices;
  }

  /**
   * Calculate portfolio value
   */
  async calculatePortfolioValue(
    walletAddress: string,
    tokens: Array<{
      address: string;
      symbol: string;
      balance: string;
      chainId: number;
      decimals: number;
    }>
  ): Promise<PortfolioValue> {
    const prices = await this.getPrices(
      tokens.map(t => ({ address: t.address, chainId: t.chainId }))
    );

    const tokenValues: PortfolioValue['tokens'] = [];
    let totalValueUSD = 0;

    for (const token of tokens) {
      const key = `${token.address.toLowerCase()}-${token.chainId}`;
      const price = prices.get(key);

      if (price) {
        const balanceNum = parseFloat(token.balance) / Math.pow(10, token.decimals);
        const valueUSD = balanceNum * price.price;
        totalValueUSD += valueUSD;

        tokenValues.push({
          tokenAddress: token.address,
          symbol: token.symbol,
          balance: token.balance,
          price: price.price,
          valueUSD,
          allocation: 0, // Will calculate after total is known
        });
      }
    }

    // Calculate allocations
    tokenValues.forEach(token => {
      token.allocation = totalValueUSD > 0 ? (token.valueUSD / totalValueUSD) * 100 : 0;
    });

    // Calculate chain breakdown
    const chainValues: Record<number, { chainId: number; valueUSD: number }> = {};
    tokenValues.forEach(token => {
      const tokenData = tokens.find(t => t.address === token.tokenAddress);
      if (tokenData) {
        if (!chainValues[tokenData.chainId]) {
          chainValues[tokenData.chainId] = {
            chainId: tokenData.chainId,
            valueUSD: 0,
          };
        }
        chainValues[tokenData.chainId].valueUSD += token.valueUSD;
      }
    });

    const chains: PortfolioValue['chains'] = {};
    Object.values(chainValues).forEach(chain => {
      chains[chain.chainId] = {
        ...chain,
        allocation: totalValueUSD > 0 ? (chain.valueUSD / totalValueUSD) * 100 : 0,
      };
    });

    return {
      walletAddress,
      timestamp: Date.now(),
      totalValueUSD,
      tokens: tokenValues,
      chains,
    };
  }

  /**
   * Get price history
   */
  getPriceHistory(
    tokenAddress: string,
    chainId: number,
    hours: number = 24
  ): PriceHistory['prices'] {
    const key = `${tokenAddress.toLowerCase()}-${chainId}`;
    const history = this.priceHistory.get(key);

    if (!history) return [];

    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return history.prices.filter(p => p.timestamp >= cutoff);
  }

  /**
   * Create price alert
   */
  createAlert(
    walletAddress: string,
    alert: Omit<PriceAlert, 'id' | 'triggered'>
  ): PriceAlert {
    const fullAlert: PriceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      triggered: false,
    };

    const walletKey = walletAddress.toLowerCase();
    if (!this.alerts.has(walletKey)) {
      this.alerts.set(walletKey, []);
    }

    this.alerts.get(walletKey)!.push(fullAlert);
    return fullAlert;
  }

  /**
   * Check and trigger alerts
   */
  async checkAlerts(walletAddress: string): Promise<PriceAlert[]> {
    const walletKey = walletAddress.toLowerCase();
    const alerts = this.alerts.get(walletKey) || [];
    const triggered: PriceAlert[] = [];

    for (const alert of alerts) {
      if (alert.triggered) continue;

      const price = await this.getPrice(alert.tokenAddress, alert.chainId);
      if (!price) continue;

      let shouldTrigger = false;

      switch (alert.type) {
        case 'above':
          shouldTrigger = price.price >= alert.threshold;
          break;
        case 'below':
          shouldTrigger = price.price <= alert.threshold;
          break;
        case 'change':
          const change = Math.abs(price.priceChange24h);
          shouldTrigger = change >= alert.threshold;
          break;
      }

      if (shouldTrigger) {
        alert.triggered = true;
        alert.triggeredAt = Date.now();
        alert.currentPrice = price.price;
        triggered.push(alert);
      }
    }

    return triggered;
  }

  /**
   * Get alerts for a wallet
   */
  getAlerts(walletAddress: string, activeOnly: boolean = false): PriceAlert[] {
    const walletKey = walletAddress.toLowerCase();
    const alerts = this.alerts.get(walletKey) || [];

    if (activeOnly) {
      return alerts.filter(a => !a.triggered);
    }

    return alerts;
  }

  /**
   * Calculate price change percentage
   */
  calculatePriceChange(
    currentPrice: number,
    previousPrice: number
  ): number {
    if (previousPrice === 0) return 0;
    return ((currentPrice - previousPrice) / previousPrice) * 100;
  }

  /**
   * Predict price (simple moving average)
   */
  predictPrice(
    tokenAddress: string,
    chainId: number,
    timeframe: '1h' | '24h' | '7d' = '24h'
  ): number | null {
    const hours = timeframe === '1h' ? 1 : timeframe === '24h' ? 24 : 168;
    const history = this.getPriceHistory(tokenAddress, chainId, hours);

    if (history.length < 2) return null;

    const recentPrices = history.slice(-10).map(p => p.price);
    const average = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;

    // Simple trend calculation
    const firstPrice = history[0].price;
    const lastPrice = history[history.length - 1].price;
    const trend = (lastPrice - firstPrice) / history.length;

    return average + trend;
  }

  /**
   * Private methods
   */

  private async fetchPrice(
    tokenAddress: string,
    chainId: number
  ): Promise<TokenPrice | null> {
    // Placeholder - would integrate with price API (CoinGecko, CoinMarketCap, etc.)
    // For now, return mock data structure
    return {
      tokenAddress,
      symbol: 'TOKEN',
      chainId,
      price: Math.random() * 100,
      priceChange24h: (Math.random() - 0.5) * 20,
      priceChange7d: (Math.random() - 0.5) * 50,
      timestamp: Date.now(),
    };
  }

  private addToHistory(tokenAddress: string, chainId: number, price: number): void {
    const key = `${tokenAddress.toLowerCase()}-${chainId}`;
    const history = this.priceHistory.get(key) || {
      tokenAddress,
      chainId,
      prices: [],
    };

    history.prices.push({
      price,
      timestamp: Date.now(),
    });

    // Keep last 1000 entries
    if (history.prices.length > 1000) {
      history.prices.shift();
    }

    this.priceHistory.set(key, history);
  }
}

// Singleton instance
export const tokenPriceTracker = new TokenPriceTracker();

