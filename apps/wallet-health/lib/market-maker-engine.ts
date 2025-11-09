/**
 * Market Making Algorithm Engine
 * Advanced market making strategies with order book analysis and inventory management
 */

export interface OrderBookLevel {
  price: number;
  quantity: number;
  orders: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  midPrice: number;
  spread: number;
  spreadBps: number; // Basis points
  timestamp: number;
}

export interface MarketMakingStrategy {
  bidPrice: number;
  askPrice: number;
  bidSize: number;
  askSize: number;
  expectedProfit: number;
  riskScore: number;
  reasoning: string;
}

export interface InventoryPosition {
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  inventoryRisk: number; // 0-100
}

export interface MarketMetrics {
  volatility: number;
  liquidity: number;
  orderBookImbalance: number; // -1 to 1
  microstructureNoise: number;
  effectiveSpread: number;
  priceImpact: number;
}

export interface QuoteParameters {
  baseSpread: number; // Minimum spread in bps
  inventorySkew: number; // Adjustment for inventory
  volatilityAdjustment: number;
  competitionAdjustment: number;
  minProfitBps: number;
}

export class MarketMakerEngine {
  private readonly MIN_SPREAD_BPS = 10; // 0.1%
  private readonly MAX_INVENTORY_RATIO = 0.3; // 30% of total capital
  private readonly RISK_FREE_RATE = 0.04; // 4% annual

  /**
   * Analyze order book depth and liquidity
   */
  analyzeOrderBook(orderBook: OrderBook): MarketMetrics {
    // Calculate total liquidity
    const bidLiquidity = orderBook.bids.reduce((sum, level) => sum + level.quantity * level.price, 0);
    const askLiquidity = orderBook.asks.reduce((sum, level) => sum + level.quantity * level.price, 0);
    const totalLiquidity = bidLiquidity + askLiquidity;

    // Order book imbalance (-1 = heavy ask pressure, +1 = heavy bid pressure)
    const imbalance = (bidLiquidity - askLiquidity) / (bidLiquidity + askLiquidity);

    // Calculate volatility from bid-ask spread
    const volatility = orderBook.spreadBps / 100; // Simplified proxy

    // Microstructure noise (variability in top-of-book)
    const topSpread = orderBook.asks[0].price - orderBook.bids[0].price;
    const microstructureNoise = topSpread / orderBook.midPrice;

    // Effective spread (weighted by volume)
    const effectiveSpread = this.calculateEffectiveSpread(orderBook);

    // Price impact for standard trade size
    const standardTradeValue = 10000; // $10k
    const priceImpact = this.estimatePriceImpact(orderBook, standardTradeValue);

    return {
      volatility,
      liquidity: totalLiquidity,
      orderBookImbalance: imbalance,
      microstructureNoise,
      effectiveSpread,
      priceImpact,
    };
  }

  /**
   * Calculate optimal bid-ask quotes using Avellaneda-Stoikov model
   */
  calculateOptimalQuotes(
    orderBook: OrderBook,
    inventory: InventoryPosition,
    marketMetrics: MarketMetrics,
    params: QuoteParameters,
    timeHorizon: number = 300 // 5 minutes in seconds
  ): MarketMakingStrategy {
    const midPrice = orderBook.midPrice;
    const sigma = marketMetrics.volatility;
    const gamma = 0.1; // Risk aversion parameter

    // Reservation price (optimal mid-price considering inventory)
    const q = inventory.quantity;
    const T = timeHorizon;
    const reservationPrice = midPrice - q * gamma * Math.pow(sigma, 2) * T;

    // Optimal spread (Avellaneda-Stoikov formula)
    const k = 0.1; // Order arrival rate parameter
    const optimalSpread = gamma * Math.pow(sigma, 2) * T + (2 / gamma) * Math.log(1 + gamma / k);

    // Adjust spread based on parameters
    let adjustedSpread = optimalSpread;
    
    // Base spread minimum
    adjustedSpread = Math.max(adjustedSpread, params.baseSpread / 10000);

    // Volatility adjustment
    adjustedSpread *= (1 + params.volatilityAdjustment * sigma);

    // Competition adjustment (tighten if competitive)
    adjustedSpread *= (1 - params.competitionAdjustment);

    // Inventory skew (widen on the side with more inventory)
    const inventorySkewAmount = params.inventorySkew * Math.abs(q) * 0.001;

    // Calculate bid and ask prices
    let bidPrice: number;
    let askPrice: number;

    if (q > 0) {
      // Long inventory: incentivize selling
      askPrice = reservationPrice + adjustedSpread / 2 - inventorySkewAmount;
      bidPrice = reservationPrice - adjustedSpread / 2 - inventorySkewAmount * 2;
    } else if (q < 0) {
      // Short inventory: incentivize buying
      bidPrice = reservationPrice - adjustedSpread / 2 + inventorySkewAmount;
      askPrice = reservationPrice + adjustedSpread / 2 + inventorySkewAmount * 2;
    } else {
      // Neutral inventory
      bidPrice = reservationPrice - adjustedSpread / 2;
      askPrice = reservationPrice + adjustedSpread / 2;
    }

    // Calculate position sizes based on Kelly criterion
    const edge = adjustedSpread / midPrice;
    const kellyFraction = edge / Math.pow(sigma, 2);
    const safeKelly = kellyFraction * 0.25; // Use quarter Kelly for safety

    const baseSize = 1000; // Base order size
    const bidSize = baseSize * (1 + safeKelly);
    const askSize = baseSize * (1 + safeKelly);

    // Expected profit per round trip
    const expectedProfit = (askPrice - bidPrice) * Math.min(bidSize, askSize);

    // Risk score
    const riskScore = this.calculateQuoteRisk(
      bidPrice,
      askPrice,
      midPrice,
      inventory,
      marketMetrics
    );

    return {
      bidPrice,
      askPrice,
      bidSize,
      askSize,
      expectedProfit,
      riskScore,
      reasoning: this.generateQuoteReasoning(inventory, marketMetrics, adjustedSpread),
    };
  }

  /**
   * Manage inventory risk with dynamic hedging
   */
  calculateInventoryHedge(
    inventory: InventoryPosition,
    targetInventory: number,
    marketPrice: number,
    hedgeCost: number // cost per unit to hedge
  ): {
    shouldHedge: boolean;
    hedgeAmount: number;
    hedgeCost: number;
    netBenefit: number;
    recommendation: string;
  } {
    const currentInventory = inventory.quantity;
    const inventoryDeviation = currentInventory - targetInventory;
    
    // Calculate inventory risk
    const inventoryValue = Math.abs(inventoryDeviation) * marketPrice;
    const volatilityRisk = inventoryValue * inventory.inventoryRisk / 100;

    // Hedge if deviation is significant
    const shouldHedge = Math.abs(inventoryDeviation) > targetInventory * 0.2; // 20% deviation
    const hedgeAmount = shouldHedge ? inventoryDeviation : 0;
    const totalHedgeCost = Math.abs(hedgeAmount) * hedgeCost;

    // Net benefit = Risk reduced - Hedge cost
    const netBenefit = volatilityRisk - totalHedgeCost;

    let recommendation: string;
    if (shouldHedge && netBenefit > 0) {
      recommendation = `Hedge ${Math.abs(hedgeAmount).toFixed(2)} units to reduce risk by $${volatilityRisk.toFixed(2)}`;
    } else if (shouldHedge) {
      recommendation = `Hedge cost ($${totalHedgeCost.toFixed(2)}) exceeds risk reduction ($${volatilityRisk.toFixed(2)}). Consider reducing quotes instead.`;
    } else {
      recommendation = 'Inventory within acceptable range. No hedging needed.';
    }

    return {
      shouldHedge,
      hedgeAmount,
      hedgeCost: totalHedgeCost,
      netBenefit,
      recommendation,
    };
  }

  /**
   * Calculate optimal inventory target using mean-variance optimization
   */
  calculateOptimalInventory(
    expectedReturn: number,
    volatility: number,
    riskAversion: number,
    capital: number,
    currentPrice: number
  ): {
    optimalQuantity: number;
    optimalValue: number;
    allocationPercent: number;
    expectedUtility: number;
  } {
    // Optimal quantity = (Expected Return) / (Risk Aversion * Variance)
    const variance = Math.pow(volatility, 2);
    const optimalQuantity = expectedReturn / (riskAversion * variance * currentPrice);

    // Constrain to maximum inventory ratio
    const maxQuantity = (capital * this.MAX_INVENTORY_RATIO) / currentPrice;
    const constrainedQuantity = Math.min(Math.abs(optimalQuantity), maxQuantity);

    const optimalValue = constrainedQuantity * currentPrice;
    const allocationPercent = (optimalValue / capital) * 100;

    // Expected utility = Return - (Risk Aversion * Variance * Position²) / 2
    const expectedUtility = 
      expectedReturn * constrainedQuantity - 
      (riskAversion * variance * Math.pow(constrainedQuantity, 2)) / 2;

    return {
      optimalQuantity: constrainedQuantity,
      optimalValue,
      allocationPercent,
      expectedUtility,
    };
  }

  /**
   * Detect adverse selection (informed trading)
   */
  detectAdverseSelection(
    recentTrades: { price: number; size: number; side: 'buy' | 'sell'; timestamp: number }[]
  ): {
    adverseSelectionScore: number; // 0-100
    isInformed: boolean;
    signals: string[];
  } {
    const signals: string[] = [];
    let score = 0;

    if (recentTrades.length < 10) {
      return { adverseSelectionScore: 0, isInformed: false, signals: [] };
    }

    // Check for large orders
    const sizes = recentTrades.map(t => t.size);
    const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const largeOrders = recentTrades.filter(t => t.size > avgSize * 3).length;
    
    if (largeOrders > recentTrades.length * 0.3) {
      score += 25;
      signals.push('Unusually large orders detected');
    }

    // Check for one-sided flow
    const buys = recentTrades.filter(t => t.side === 'buy').length;
    const imbalance = Math.abs(buys / recentTrades.length - 0.5);
    
    if (imbalance > 0.3) {
      score += 30;
      signals.push('Strong directional flow');
    }

    // Check for persistent price movement
    const prices = recentTrades.map(t => t.price);
    const priceChange = (prices[prices.length - 1] - prices[0]) / prices[0];
    
    if (Math.abs(priceChange) > 0.02) { // 2% move
      score += 25;
      signals.push('Significant price momentum');
    }

    // Check for rapid execution
    const timeSpan = recentTrades[recentTrades.length - 1].timestamp - recentTrades[0].timestamp;
    const tradesPerMinute = (recentTrades.length / timeSpan) * 60000;
    
    if (tradesPerMinute > 10) {
      score += 20;
      signals.push('High frequency trading activity');
    }

    return {
      adverseSelectionScore: Math.min(100, score),
      isInformed: score > 60,
      signals,
    };
  }

  /**
   * Calculate fair value using microprice model
   */
  calculateMicroprice(orderBook: OrderBook): {
    microprice: number;
    confidence: number;
    deviation: number;
  } {
    if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
      return {
        microprice: orderBook.midPrice,
        confidence: 0,
        deviation: 0,
      };
    }

    const bestBid = orderBook.bids[0];
    const bestAsk = orderBook.asks[0];

    // Microprice = weighted average of best bid and ask
    const totalVolume = bestBid.quantity + bestAsk.quantity;
    const microprice = 
      (bestBid.price * bestAsk.quantity + bestAsk.price * bestBid.quantity) / totalVolume;

    // Confidence based on volume balance
    const volumeRatio = Math.min(bestBid.quantity, bestAsk.quantity) / 
                        Math.max(bestBid.quantity, bestAsk.quantity);
    const confidence = volumeRatio * 100;

    // Deviation from mid price
    const deviation = Math.abs(microprice - orderBook.midPrice) / orderBook.midPrice;

    return {
      microprice,
      confidence,
      deviation,
    };
  }

  /**
   * Calculate profitability metrics for market making
   */
  calculateProfitability(
    totalVolume: number,
    avgSpread: number,
    inventoryCost: number,
    adverseSelectionCost: number
  ): {
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    returnOnCapital: number;
  } {
    // Gross profit from spread capture
    const grossProfit = totalVolume * avgSpread;

    // Costs
    const totalCosts = inventoryCost + adverseSelectionCost;
    const netProfit = grossProfit - totalCosts;

    // Metrics
    const profitMargin = (netProfit / grossProfit) * 100;
    const returnOnCapital = (netProfit / totalVolume) * 100;

    return {
      grossProfit,
      netProfit,
      profitMargin,
      returnOnCapital,
    };
  }

  /**
   * Private helper methods
   */

  private calculateEffectiveSpread(orderBook: OrderBook): number {
    if (orderBook.bids.length === 0 || orderBook.asks.length === 0) return 0;

    // Volume-weighted spread
    let weightedSpread = 0;
    let totalVolume = 0;

    for (let i = 0; i < Math.min(5, orderBook.bids.length, orderBook.asks.length); i++) {
      const bid = orderBook.bids[i];
      const ask = orderBook.asks[i];
      const volume = Math.min(bid.quantity, ask.quantity);
      const spread = (ask.price - bid.price) / orderBook.midPrice;

      weightedSpread += spread * volume;
      totalVolume += volume;
    }

    return totalVolume > 0 ? weightedSpread / totalVolume : 0;
  }

  private estimatePriceImpact(orderBook: OrderBook, tradeValue: number): number {
    // Calculate how much price moves for a given trade size
    let remainingValue = tradeValue;
    let totalCost = 0;
    let totalQuantity = 0;

    // Walk the order book
    for (const level of orderBook.asks) {
      if (remainingValue <= 0) break;

      const levelValue = level.quantity * level.price;
      const takeValue = Math.min(remainingValue, levelValue);
      const takeQuantity = takeValue / level.price;

      totalCost += takeValue;
      totalQuantity += takeQuantity;
      remainingValue -= takeValue;
    }

    if (totalQuantity === 0) return 0;

    const avgPrice = totalCost / totalQuantity;
    const priceImpact = (avgPrice - orderBook.midPrice) / orderBook.midPrice;

    return priceImpact;
  }

  private calculateQuoteRisk(
    bidPrice: number,
    askPrice: number,
    midPrice: number,
    inventory: InventoryPosition,
    metrics: MarketMetrics
  ): number {
    let risk = 0;

    // Spread risk (too tight = more risk)
    const spread = (askPrice - bidPrice) / midPrice;
    if (spread < 0.001) risk += 30; // < 0.1%
    else if (spread < 0.002) risk += 15;

    // Inventory risk
    risk += inventory.inventoryRisk * 0.4;

    // Market volatility risk
    if (metrics.volatility > 0.05) risk += 20; // High volatility
    else if (metrics.volatility > 0.03) risk += 10;

    // Liquidity risk
    if (metrics.liquidity < 50000) risk += 15;

    // Order book imbalance risk
    risk += Math.abs(metrics.orderBookImbalance) * 15;

    return Math.min(100, risk);
  }

  private generateQuoteReasoning(
    inventory: InventoryPosition,
    metrics: MarketMetrics,
    spread: number
  ): string {
    const reasons: string[] = [];

    if (inventory.quantity > 0) {
      reasons.push('Skewing quotes to reduce long inventory');
    } else if (inventory.quantity < 0) {
      reasons.push('Skewing quotes to cover short inventory');
    }

    if (metrics.volatility > 0.04) {
      reasons.push('Widening spread due to high volatility');
    }

    if (metrics.orderBookImbalance > 0.3) {
      reasons.push('Adjusting for strong buy-side pressure');
    } else if (metrics.orderBookImbalance < -0.3) {
      reasons.push('Adjusting for strong sell-side pressure');
    }

    if (metrics.liquidity < 50000) {
      reasons.push('Increasing caution due to low liquidity');
    }

    return reasons.length > 0 ? reasons.join('. ') : 'Normal market making conditions';
  }
}

