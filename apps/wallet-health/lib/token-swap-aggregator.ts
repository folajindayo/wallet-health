/**
 * Token Swap Aggregator Utility
 * Finds best swap routes across multiple DEXs
 */

export interface SwapRoute {
  protocol: string;
  protocolAddress: string;
  chainId: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  priceImpact: number; // Percentage
  gasEstimate: number;
  gasCostUSD: number;
  route: string[]; // Token addresses in route
  executionTime?: number; // milliseconds
}

export interface SwapQuote {
  tokenIn: string;
  tokenInSymbol: string;
  tokenOut: string;
  tokenOutSymbol: string;
  amountIn: string;
  routes: SwapRoute[];
  bestRoute: SwapRoute | null;
  comparison: {
    bestPrice: SwapRoute | null;
    lowestGas: SwapRoute | null;
    lowestPriceImpact: SwapRoute | null;
  };
}

export interface SwapExecution {
  quote: SwapQuote;
  selectedRoute: SwapRoute;
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
  executedAt?: number;
  actualAmountOut?: string;
  actualGasUsed?: number;
}

export class TokenSwapAggregator {
  private supportedProtocols: Set<string> = new Set();
  private executionHistory: SwapExecution[] = [];

  constructor() {
    this.initializeProtocols();
  }

  /**
   * Get swap quote
   */
  async getQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    chainId: number
  ): Promise<SwapQuote> {
    // In production, would query multiple DEX APIs
    // For now, generate placeholder routes

    const routes: SwapRoute[] = [
      {
        protocol: 'Uniswap V3',
        protocolAddress: '0x...',
        chainId,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut: '0', // Would calculate from DEX
        priceImpact: 0.5,
        gasEstimate: 150000,
        gasCostUSD: 3.0,
        route: [tokenIn, tokenOut],
      },
      {
        protocol: '1inch',
        protocolAddress: '0x...',
        chainId,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut: '0',
        priceImpact: 0.3,
        gasEstimate: 180000,
        gasCostUSD: 3.6,
        route: [tokenIn, tokenOut],
      },
    ];

    // Find best route (highest amountOut)
    const bestRoute = routes.length > 0
      ? routes.reduce((best, current) => 
          parseFloat(current.amountOut) > parseFloat(best.amountOut) ? current : best
        )
      : null;

    // Find best by different criteria
    const bestPrice = routes.length > 0
      ? routes.reduce((best, current) => 
          parseFloat(current.amountOut) > parseFloat(best.amountOut) ? current : best
        )
      : null;

    const lowestGas = routes.length > 0
      ? routes.reduce((best, current) => 
          current.gasEstimate < best.gasEstimate ? current : best
        )
      : null;

    const lowestPriceImpact = routes.length > 0
      ? routes.reduce((best, current) => 
          current.priceImpact < best.priceImpact ? current : best
        )
      : null;

    return {
      tokenIn,
      tokenInSymbol: '',
      tokenOut,
      tokenOutSymbol: '',
      amountIn,
      routes,
      bestRoute,
      comparison: {
        bestPrice,
        lowestGas,
        lowestPriceImpact,
      },
    };
  }

  /**
   * Compare routes
   */
  compareRoutes(routes: SwapRoute[]): {
    bestPrice: SwapRoute | null;
    lowestGas: SwapRoute | null;
    lowestPriceImpact: SwapRoute | null;
    bestOverall: SwapRoute | null;
  } {
    if (routes.length === 0) {
      return {
        bestPrice: null,
        lowestGas: null,
        lowestPriceImpact: null,
        bestOverall: null,
      };
    }

    const bestPrice = routes.reduce((best, current) => 
      parseFloat(current.amountOut) > parseFloat(best.amountOut) ? current : best
    );

    const lowestGas = routes.reduce((best, current) => 
      current.gasEstimate < best.gasEstimate ? current : best
    );

    const lowestPriceImpact = routes.reduce((best, current) => 
      current.priceImpact < best.priceImpact ? current : best
    );

    // Calculate best overall (weighted score)
    const bestOverall = routes.reduce((best, current) => {
      const bestScore = this.calculateRouteScore(best);
      const currentScore = this.calculateRouteScore(current);
      return currentScore > bestScore ? current : best;
    });

    return {
      bestPrice,
      lowestGas,
      lowestPriceImpact,
      bestOverall,
    };
  }

  /**
   * Calculate route score
   */
  private calculateRouteScore(route: SwapRoute): number {
    // Weighted scoring: 70% price, 20% gas, 10% price impact
    const priceScore = parseFloat(route.amountOut) / 1000; // Normalize
    const gasScore = 100 - (route.gasEstimate / 1000); // Lower gas = higher score
    const impactScore = 100 - route.priceImpact * 10; // Lower impact = higher score

    return priceScore * 0.7 + gasScore * 0.2 + impactScore * 0.1;
  }

  /**
   * Execute swap
   */
  async executeSwap(
    quote: SwapQuote,
    selectedRoute: SwapRoute
  ): Promise<SwapExecution> {
    const execution: SwapExecution = {
      quote,
      selectedRoute,
      status: 'pending',
    };

    // In production, would execute swap via selected protocol
    // For now, simulate
    execution.status = 'completed';
    execution.executedAt = Date.now();
    execution.actualAmountOut = selectedRoute.amountOut;
    execution.actualGasUsed = selectedRoute.gasEstimate;

    // Store in history
    this.executionHistory.push(execution);
    if (this.executionHistory.length > 1000) {
      this.executionHistory = this.executionHistory.slice(-1000);
    }

    return execution;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 50): SwapExecution[] {
    return this.executionHistory.slice(-limit).reverse();
  }

  /**
   * Initialize supported protocols
   */
  private initializeProtocols(): void {
    this.supportedProtocols.add('Uniswap V3');
    this.supportedProtocols.add('Uniswap V2');
    this.supportedProtocols.add('1inch');
    this.supportedProtocols.add('0x');
    this.supportedProtocols.add('Curve');
    this.supportedProtocols.add('Balancer');
  }

  /**
   * Get supported protocols
   */
  getSupportedProtocols(): string[] {
    return Array.from(this.supportedProtocols);
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
  }
}

// Singleton instance
export const tokenSwapAggregator = new TokenSwapAggregator();

