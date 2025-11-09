/**
 * Arbitrage Detection Engine
 * Identifies profitable arbitrage opportunities across DEXs and chains
 */

export interface TokenPrice {
  exchange: string;
  token: string;
  price: number;
  liquidity: number;
  gasEstimate: number;
  timestamp: number;
}

export interface ArbitrageOpportunity {
  token: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  priceSpread: number; // percentage
  grossProfit: number;
  estimatedGasCost: number;
  netProfit: number;
  profitMargin: number; // percentage
  requiredCapital: number;
  slippageImpact: number;
  executionSteps: string[];
  riskScore: number; // 0-100
  confidence: number; // 0-100
}

export interface FlashloanArbitrageOpportunity extends ArbitrageOpportunity {
  flashloanProvider: string;
  flashloanFee: number;
  totalCost: number;
  leverage: number;
}

export interface CrossChainArbitrage {
  token: string;
  sourceChain: string;
  targetChain: string;
  sourcePrice: number;
  targetPrice: number;
  bridgeFee: number;
  bridgeTime: number; // minutes
  netProfit: number;
  totalGasCost: number;
}

export class ArbitrageDetector {
  private minProfitThreshold: number = 0.01; // 1% minimum profit
  private maxSlippageTolerance: number = 0.02; // 2% max slippage

  /**
   * Detect simple DEX arbitrage opportunities
   */
  detectDEXArbitrage(prices: TokenPrice[]): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];
    const pricesByToken = this.groupByToken(prices);

    for (const [token, tokenPrices] of Object.entries(pricesByToken)) {
      if (tokenPrices.length < 2) continue;

      // Sort by price to find buy (lowest) and sell (highest)
      const sortedPrices = [...tokenPrices].sort((a, b) => a.price - b.price);
      const buyPrice = sortedPrices[0];
      const sellPrice = sortedPrices[sortedPrices.length - 1];

      const spread = ((sellPrice.price - buyPrice.price) / buyPrice.price) * 100;

      if (spread <= this.minProfitThreshold * 100) continue;

      // Calculate optimal trade size based on liquidity
      const tradeSize = Math.min(buyPrice.liquidity, sellPrice.liquidity) * 0.1; // 10% of liquidity
      const requiredCapital = tradeSize * buyPrice.price;
      
      const grossProfit = tradeSize * (sellPrice.price - buyPrice.price);
      const estimatedGas = buyPrice.gasEstimate + sellPrice.gasEstimate;
      const netProfit = grossProfit - estimatedGas;
      const profitMargin = (netProfit / requiredCapital) * 100;

      // Calculate slippage impact
      const slippage = this.estimateSlippage(tradeSize, buyPrice.liquidity, sellPrice.liquidity);

      // Calculate risk score
      const riskScore = this.calculateArbitrageRisk(
        spread,
        buyPrice.liquidity,
        sellPrice.liquidity,
        estimatedGas,
        grossProfit
      );

      // Calculate confidence based on liquidity and spread stability
      const confidence = this.calculateConfidence(buyPrice, sellPrice, spread);

      if (netProfit > 0 && slippage < this.maxSlippageTolerance) {
        opportunities.push({
          token,
          buyExchange: buyPrice.exchange,
          sellExchange: sellPrice.exchange,
          buyPrice: buyPrice.price,
          sellPrice: sellPrice.price,
          priceSpread: spread,
          grossProfit,
          estimatedGasCost: estimatedGas,
          netProfit,
          profitMargin,
          requiredCapital,
          slippageImpact: slippage * 100,
          executionSteps: [
            `1. Buy ${tradeSize.toFixed(4)} ${token} on ${buyPrice.exchange} at $${buyPrice.price}`,
            `2. Sell ${tradeSize.toFixed(4)} ${token} on ${sellPrice.exchange} at $${sellPrice.price}`,
            `3. Net profit: $${netProfit.toFixed(2)} (${profitMargin.toFixed(2)}%)`,
          ],
          riskScore,
          confidence,
        });
      }
    }

    return opportunities.sort((a, b) => b.netProfit - a.netProfit);
  }

  /**
   * Detect flashloan arbitrage opportunities
   */
  detectFlashloanArbitrage(
    prices: TokenPrice[],
    flashloanProviders: { name: string; fee: number }[]
  ): FlashloanArbitrageOpportunity[] {
    const opportunities: FlashloanArbitrageOpportunity[] = [];
    const baseArbitrages = this.detectDEXArbitrage(prices);

    for (const arb of baseArbitrages) {
      for (const provider of flashloanProviders) {
        // Calculate leveraged opportunity
        const leverage = 10; // 10x leverage via flashloan
        const leveragedCapital = arb.requiredCapital * leverage;
        const flashloanFee = leveragedCapital * provider.fee;
        
        const leveragedGrossProfit = arb.grossProfit * leverage;
        const totalCost = arb.estimatedGasCost + flashloanFee;
        const netProfit = leveragedGrossProfit - totalCost;
        const profitMargin = (netProfit / leveragedCapital) * 100;

        if (netProfit > 0) {
          opportunities.push({
            ...arb,
            flashloanProvider: provider.name,
            flashloanFee,
            totalCost,
            leverage,
            requiredCapital: 0, // No capital required with flashloan
            netProfit,
            profitMargin,
            executionSteps: [
              `1. Borrow ${leveragedCapital.toFixed(2)} via flashloan from ${provider.name}`,
              `2. Buy ${token} on ${arb.buyExchange} at $${arb.buyPrice}`,
              `3. Sell ${token} on ${arb.sellExchange} at $${arb.sellPrice}`,
              `4. Repay flashloan + fee ($${flashloanFee.toFixed(2)})`,
              `5. Keep profit: $${netProfit.toFixed(2)} (${profitMargin.toFixed(2)}%)`,
            ],
            riskScore: arb.riskScore + 15, // Flashloans add risk
          });
        }
      }
    }

    return opportunities.sort((a, b) => b.netProfit - a.netProfit);
  }

  /**
   * Detect triangular arbitrage (e.g., ETH → USDC → DAI → ETH)
   */
  detectTriangularArbitrage(
    prices: TokenPrice[],
    tradingPairs: { from: string; to: string }[]
  ): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];
    
    // Find circular trading paths
    const paths = this.findTriangularPaths(tradingPairs);

    for (const path of paths) {
      const [token1, token2, token3] = path;
      
      // Calculate exchange rates
      const rate12 = this.getExchangeRate(token1, token2, prices);
      const rate23 = this.getExchangeRate(token2, token3, prices);
      const rate31 = this.getExchangeRate(token3, token1, prices);

      if (!rate12 || !rate23 || !rate31) continue;

      // Calculate final return for 1 unit of token1
      const finalAmount = 1 * rate12.rate * rate23.rate * rate31.rate;
      const profit = finalAmount - 1;
      const profitPercent = profit * 100;

      if (profitPercent > this.minProfitThreshold * 100) {
        const capitalRequired = 10000; // $10k example
        const grossProfit = capitalRequired * profit;
        const totalGas = rate12.gasEstimate + rate23.gasEstimate + rate31.gasEstimate;
        const netProfit = grossProfit - totalGas;

        if (netProfit > 0) {
          opportunities.push({
            token: `${token1}-${token2}-${token3}`,
            buyExchange: rate12.exchange,
            sellExchange: rate31.exchange,
            buyPrice: 1,
            sellPrice: finalAmount,
            priceSpread: profitPercent,
            grossProfit,
            estimatedGasCost: totalGas,
            netProfit,
            profitMargin: (netProfit / capitalRequired) * 100,
            requiredCapital: capitalRequired,
            slippageImpact: 0.5, // Estimate
            executionSteps: [
              `1. Start with ${token1}`,
              `2. Exchange ${token1} → ${token2} on ${rate12.exchange}`,
              `3. Exchange ${token2} → ${token3} on ${rate23.exchange}`,
              `4. Exchange ${token3} → ${token1} on ${rate31.exchange}`,
              `5. Profit: ${profitPercent.toFixed(4)}%`,
            ],
            riskScore: this.calculateTriangularRisk(profitPercent, totalGas, grossProfit),
            confidence: 85,
          });
        }
      }
    }

    return opportunities.sort((a, b) => b.netProfit - a.netProfit);
  }

  /**
   * Detect cross-chain arbitrage opportunities
   */
  detectCrossChainArbitrage(
    ethereumPrices: TokenPrice[],
    polygonPrices: TokenPrice[],
    bridgeFees: Record<string, number>
  ): CrossChainArbitrage[] {
    const opportunities: CrossChainArbitrage[] = [];
    
    const ethPricesByToken = this.groupByToken(ethereumPrices);
    const polyPricesByToken = this.groupByToken(polygonPrices);

    for (const [token, ethPrices] of Object.entries(ethPricesByToken)) {
      const polyPrices = polyPricesByToken[token];
      if (!polyPrices) continue;

      const ethAvgPrice = this.calculateAveragePrice(ethPrices);
      const polyAvgPrice = this.calculateAveragePrice(polyPrices);
      
      const bridgeFee = bridgeFees[token] || 0;
      const estimatedGas = 50; // ETH mainnet + Polygon gas

      // ETH → Polygon arbitrage
      if (polyAvgPrice > ethAvgPrice * 1.01) {
        const tradeSize = 10000; // $10k
        const profit = (polyAvgPrice - ethAvgPrice) * (tradeSize / ethAvgPrice);
        const netProfit = profit - bridgeFee - estimatedGas;

        if (netProfit > 0) {
          opportunities.push({
            token,
            sourceChain: 'Ethereum',
            targetChain: 'Polygon',
            sourcePrice: ethAvgPrice,
            targetPrice: polyAvgPrice,
            bridgeFee,
            bridgeTime: 10, // ~10 minutes
            netProfit,
            totalGasCost: estimatedGas,
          });
        }
      }

      // Polygon → ETH arbitrage
      if (ethAvgPrice > polyAvgPrice * 1.01) {
        const tradeSize = 10000;
        const profit = (ethAvgPrice - polyAvgPrice) * (tradeSize / polyAvgPrice);
        const netProfit = profit - bridgeFee - estimatedGas;

        if (netProfit > 0) {
          opportunities.push({
            token,
            sourceChain: 'Polygon',
            targetChain: 'Ethereum',
            sourcePrice: polyAvgPrice,
            targetPrice: ethAvgPrice,
            bridgeFee,
            bridgeTime: 10,
            netProfit,
            totalGasCost: estimatedGas,
          });
        }
      }
    }

    return opportunities.sort((a, b) => b.netProfit - a.netProfit);
  }

  /**
   * Calculate optimal arbitrage execution timing
   */
  calculateOptimalTiming(
    opportunity: ArbitrageOpportunity,
    historicalGasPrices: number[]
  ): {
    shouldExecuteNow: boolean;
    reason: string;
    alternativeTime?: string;
    potentialSavings?: number;
  } {
    const currentGas = opportunity.estimatedGasCost;
    const avgGas = historicalGasPrices.reduce((a, b) => a + b, 0) / historicalGasPrices.length;
    const minGas = Math.min(...historicalGasPrices);

    // If opportunity is highly profitable, execute immediately
    if (opportunity.profitMargin > 10) {
      return {
        shouldExecuteNow: true,
        reason: 'High profit margin justifies immediate execution',
      };
    }

    // If current gas is significantly above average, wait
    if (currentGas > avgGas * 1.5) {
      const potentialSavings = currentGas - avgGas;
      return {
        shouldExecuteNow: false,
        reason: 'Gas prices are high. Waiting for lower gas could increase profits.',
        alternativeTime: 'Weekend or early morning UTC',
        potentialSavings,
      };
    }

    // If current gas is near minimum, execute
    if (currentGas < minGas * 1.2) {
      return {
        shouldExecuteNow: true,
        reason: 'Gas prices are favorable',
      };
    }

    return {
      shouldExecuteNow: true,
      reason: 'Moderate conditions, execute before opportunity disappears',
    };
  }

  /**
   * Private helper methods
   */

  private groupByToken(prices: TokenPrice[]): Record<string, TokenPrice[]> {
    return prices.reduce((acc, price) => {
      if (!acc[price.token]) {
        acc[price.token] = [];
      }
      acc[price.token].push(price);
      return acc;
    }, {} as Record<string, TokenPrice[]>);
  }

  private estimateSlippage(
    tradeSize: number,
    buyLiquidity: number,
    sellLiquidity: number
  ): number {
    // Simplified slippage estimation
    const buySlippage = tradeSize / buyLiquidity;
    const sellSlippage = tradeSize / sellLiquidity;
    return Math.max(buySlippage, sellSlippage);
  }

  private calculateArbitrageRisk(
    spread: number,
    buyLiquidity: number,
    sellLiquidity: number,
    gasCost: number,
    grossProfit: number
  ): number {
    let risk = 0;

    // Low spread increases risk of price movement
    if (spread < 2) risk += 30;
    else if (spread < 5) risk += 15;

    // Low liquidity increases slippage risk
    const minLiquidity = Math.min(buyLiquidity, sellLiquidity);
    if (minLiquidity < 100000) risk += 30;
    else if (minLiquidity < 500000) risk += 15;

    // High gas cost relative to profit increases risk
    const gasRatio = gasCost / grossProfit;
    if (gasRatio > 0.5) risk += 25;
    else if (gasRatio > 0.3) risk += 15;

    return Math.min(100, risk);
  }

  private calculateConfidence(
    buyPrice: TokenPrice,
    sellPrice: TokenPrice,
    spread: number
  ): number {
    let confidence = 100;

    // Reduce confidence if prices are stale
    const now = Date.now();
    const buyAge = now - buyPrice.timestamp;
    const sellAge = now - sellPrice.timestamp;
    
    if (Math.max(buyAge, sellAge) > 60000) confidence -= 20; // >1 minute old
    if (Math.max(buyAge, sellAge) > 300000) confidence -= 30; // >5 minutes old

    // Higher spread = higher confidence
    if (spread > 5) confidence += 0;
    else if (spread > 2) confidence -= 10;
    else confidence -= 25;

    // Low liquidity reduces confidence
    const minLiquidity = Math.min(buyPrice.liquidity, sellPrice.liquidity);
    if (minLiquidity < 100000) confidence -= 20;

    return Math.max(0, Math.min(100, confidence));
  }

  private calculateTriangularRisk(
    profitPercent: number,
    gasCost: number,
    grossProfit: number
  ): number {
    let risk = 20; // Base risk for triangular

    if (profitPercent < 1) risk += 30;
    else if (profitPercent < 2) risk += 15;

    const gasRatio = gasCost / grossProfit;
    if (gasRatio > 0.4) risk += 25;
    else if (gasRatio > 0.2) risk += 10;

    return Math.min(100, risk);
  }

  private findTriangularPaths(
    pairs: { from: string; to: string }[]
  ): string[][] {
    const paths: string[][] = [];
    const tokens = new Set<string>();
    
    pairs.forEach(p => {
      tokens.add(p.from);
      tokens.add(p.to);
    });

    const tokenArray = Array.from(tokens);

    // Find all possible 3-token cycles
    for (let i = 0; i < tokenArray.length; i++) {
      for (let j = 0; j < tokenArray.length; j++) {
        for (let k = 0; k < tokenArray.length; k++) {
          if (i !== j && j !== k && k !== i) {
            const path = [tokenArray[i], tokenArray[j], tokenArray[k]];
            
            // Check if all pairs exist
            const hasPath12 = pairs.some(p => p.from === path[0] && p.to === path[1]);
            const hasPath23 = pairs.some(p => p.from === path[1] && p.to === path[2]);
            const hasPath31 = pairs.some(p => p.from === path[2] && p.to === path[0]);
            
            if (hasPath12 && hasPath23 && hasPath31) {
              paths.push(path);
            }
          }
        }
      }
    }

    return paths;
  }

  private getExchangeRate(
    from: string,
    to: string,
    prices: TokenPrice[]
  ): { rate: number; exchange: string; gasEstimate: number } | null {
    // Simplified: find any price that can give us the rate
    const fromPrice = prices.find(p => p.token === from);
    const toPrice = prices.find(p => p.token === to);

    if (!fromPrice || !toPrice) return null;

    return {
      rate: fromPrice.price / toPrice.price,
      exchange: fromPrice.exchange,
      gasEstimate: fromPrice.gasEstimate,
    };
  }

  private calculateAveragePrice(prices: TokenPrice[]): number {
    const sum = prices.reduce((acc, p) => acc + p.price, 0);
    return sum / prices.length;
  }
}

