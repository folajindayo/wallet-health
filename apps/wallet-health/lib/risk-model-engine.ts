/**
 * Advanced Risk Model Engine
 * Sophisticated risk analysis with Monte Carlo simulation, stress testing, and correlation analysis
 */

export interface Asset {
  symbol: string;
  value: number;
  expectedReturn: number;
  volatility: number;
  beta: number; // Market beta
}

export interface PortfolioRisk {
  valueAtRisk: {
    var95: number;
    var99: number;
    cvar95: number; // Conditional VaR
    cvar99: number;
  };
  stressTest: {
    marketCrash: number; // -50% market
    cryptoWinter: number; // -80% crypto
    defiCollapse: number; // -90% DeFi
    flashCrash: number; // -30% instant
  };
  correlationRisk: number;
  concentrationRisk: number;
  liquidityRisk: number;
  overallRiskScore: number; // 0-100
}

export interface MonteCarloResult {
  simulations: number;
  scenarios: Scenario[];
  statistics: {
    mean: number;
    median: number;
    stdDev: number;
    skewness: number;
    kurtosis: number;
  };
  percentiles: {
    p1: number;
    p5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
  probabilityOfLoss: number;
  expectedShortfall: number;
}

export interface Scenario {
  finalValue: number;
  returns: number;
  path: number[];
}

export interface StressTestScenario {
  name: string;
  marketShock: number;
  volatilityMultiplier: number;
  correlationShift: number;
  liquidityDrying: number;
}

export interface RiskDecomposition {
  systematicRisk: number; // Market-driven
  specificRisk: number; // Asset-specific
  portfolioRisk: number; // Combined
  diversificationBenefit: number;
  marginalRisk: Record<string, number>; // Risk contribution per asset
}

export class RiskModelEngine {
  private readonly TRADING_DAYS = 252;
  private readonly CONFIDENCE_95 = 1.645;
  private readonly CONFIDENCE_99 = 2.326;

  /**
   * Calculate Value at Risk (VaR) using historical simulation
   */
  calculateVaR(
    returns: number[],
    portfolioValue: number,
    confidenceLevel: number = 0.95,
    timeHorizon: number = 1
  ): { var: number; cvar: number } {
    if (returns.length < 30) {
      throw new Error('Insufficient data for VaR calculation (need at least 30 data points)');
    }

    // Sort returns ascending (worst first)
    const sortedReturns = [...returns].sort((a, b) => a - b);
    
    // VaR is the loss at the confidence level
    const varIndex = Math.floor((1 - confidenceLevel) * sortedReturns.length);
    const varReturn = sortedReturns[varIndex];
    const var_ = Math.abs(portfolioValue * varReturn * Math.sqrt(timeHorizon));

    // CVaR (Expected Shortfall) is the average of losses beyond VaR
    const tailReturns = sortedReturns.slice(0, varIndex + 1);
    const avgTailReturn = tailReturns.reduce((a, b) => a + b, 0) / tailReturns.length;
    const cvar = Math.abs(portfolioValue * avgTailReturn * Math.sqrt(timeHorizon));

    return { var: var_, cvar };
  }

  /**
   * Monte Carlo simulation for portfolio returns
   */
  monteCarloSimulation(
    assets: Asset[],
    portfolioValue: number,
    days: number = 252,
    simulations: number = 10000
  ): MonteCarloResult {
    const scenarios: Scenario[] = [];

    for (let sim = 0; sim < simulations; sim++) {
      const path: number[] = [portfolioValue];
      let currentValue = portfolioValue;

      for (let day = 0; day < days; day++) {
        // Generate correlated random returns for each asset
        let portfolioReturn = 0;

        for (const asset of assets) {
          const weight = asset.value / portfolioValue;
          
          // Generate random return using Box-Muller transform
          const u1 = Math.random();
          const u2 = Math.random();
          const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          
          // Daily return = expected return + volatility * random shock
          const dailyExpectedReturn = asset.expectedReturn / this.TRADING_DAYS;
          const dailyVolatility = asset.volatility / Math.sqrt(this.TRADING_DAYS);
          const dailyReturn = dailyExpectedReturn + dailyVolatility * z;
          
          portfolioReturn += weight * dailyReturn;
        }

        currentValue *= (1 + portfolioReturn);
        path.push(currentValue);
      }

      scenarios.push({
        finalValue: currentValue,
        returns: (currentValue - portfolioValue) / portfolioValue,
        path,
      });
    }

    // Calculate statistics
    const finalValues = scenarios.map(s => s.finalValue);
    const returns = scenarios.map(s => s.returns);

    const mean = finalValues.reduce((a, b) => a + b, 0) / simulations;
    const sortedValues = [...finalValues].sort((a, b) => a - b);
    const median = sortedValues[Math.floor(simulations / 2)];

    // Standard deviation
    const variance = finalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / simulations;
    const stdDev = Math.sqrt(variance);

    // Skewness (asymmetry)
    const skewness = finalValues.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / simulations;

    // Kurtosis (tail risk)
    const kurtosis = finalValues.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / simulations - 3;

    // Percentiles
    const percentiles = {
      p1: sortedValues[Math.floor(simulations * 0.01)],
      p5: sortedValues[Math.floor(simulations * 0.05)],
      p10: sortedValues[Math.floor(simulations * 0.10)],
      p25: sortedValues[Math.floor(simulations * 0.25)],
      p50: median,
      p75: sortedValues[Math.floor(simulations * 0.75)],
      p90: sortedValues[Math.floor(simulations * 0.90)],
      p95: sortedValues[Math.floor(simulations * 0.95)],
      p99: sortedValues[Math.floor(simulations * 0.99)],
    };

    // Probability of loss
    const lossScenarios = scenarios.filter(s => s.returns < 0).length;
    const probabilityOfLoss = (lossScenarios / simulations) * 100;

    // Expected Shortfall (average loss in worst 5% scenarios)
    const worstScenarios = sortedValues.slice(0, Math.floor(simulations * 0.05));
    const expectedShortfall = portfolioValue - (worstScenarios.reduce((a, b) => a + b, 0) / worstScenarios.length);

    return {
      simulations,
      scenarios,
      statistics: {
        mean,
        median,
        stdDev,
        skewness,
        kurtosis,
      },
      percentiles,
      probabilityOfLoss,
      expectedShortfall,
    };
  }

  /**
   * Stress testing with predefined scenarios
   */
  stressTest(assets: Asset[], portfolioValue: number): PortfolioRisk['stressTest'] {
    const scenarios: StressTestScenario[] = [
      {
        name: 'Market Crash',
        marketShock: -0.50,
        volatilityMultiplier: 3.0,
        correlationShift: 0.3,
        liquidityDrying: 0.5,
      },
      {
        name: 'Crypto Winter',
        marketShock: -0.80,
        volatilityMultiplier: 4.0,
        correlationShift: 0.5,
        liquidityDrying: 0.7,
      },
      {
        name: 'DeFi Collapse',
        marketShock: -0.90,
        volatilityMultiplier: 5.0,
        correlationShift: 0.7,
        liquidityDrying: 0.9,
      },
      {
        name: 'Flash Crash',
        marketShock: -0.30,
        volatilityMultiplier: 10.0,
        correlationShift: 0.2,
        liquidityDrying: 0.3,
      },
    ];

    const results: Record<string, number> = {};

    for (const scenario of scenarios) {
      let portfolioLoss = 0;

      for (const asset of assets) {
        const weight = asset.value / portfolioValue;
        
        // Asset loss = market shock * beta + specific shock
        const marketComponent = scenario.marketShock * asset.beta;
        const specificComponent = scenario.marketShock * (1 - asset.beta) * 0.5;
        const assetLoss = marketComponent + specificComponent;
        
        portfolioLoss += weight * assetLoss;
      }

      const key = scenario.name.toLowerCase().replace(/\s+/g, '');
      results[key] = Math.abs(portfolioLoss * portfolioValue);
    }

    return {
      marketCrash: results['marketcrash'] || 0,
      cryptoWinter: results['cryptowinter'] || 0,
      defiCollapse: results['deficollapse'] || 0,
      flashCrash: results['flashcrash'] || 0,
    };
  }

  /**
   * Calculate portfolio risk decomposition
   */
  decomposeRisk(assets: Asset[], correlationMatrix: number[][]): RiskDecomposition {
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    const weights = assets.map(a => a.value / totalValue);

    // Systematic risk (market-driven)
    const portfolioBeta = assets.reduce((sum, asset, i) => {
      return sum + weights[i] * asset.beta;
    }, 0);
    const systematicRisk = portfolioBeta * 0.15; // Assume 15% market volatility

    // Specific risk (diversifiable)
    let specificVariance = 0;
    for (let i = 0; i < assets.length; i++) {
      const specificVol = assets[i].volatility * Math.sqrt(1 - Math.pow(assets[i].beta, 2));
      specificVariance += Math.pow(weights[i] * specificVol, 2);
    }
    const specificRisk = Math.sqrt(specificVariance);

    // Portfolio risk (using correlation matrix)
    let portfolioVariance = 0;
    for (let i = 0; i < assets.length; i++) {
      for (let j = 0; j < assets.length; j++) {
        const correlation = correlationMatrix[i]?.[j] ?? (i === j ? 1 : 0);
        portfolioVariance += 
          weights[i] * weights[j] * 
          assets[i].volatility * assets[j].volatility * 
          correlation;
      }
    }
    const portfolioRisk = Math.sqrt(portfolioVariance);

    // Diversification benefit
    const undiversifiedRisk = Math.sqrt(
      assets.reduce((sum, asset, i) => sum + Math.pow(weights[i] * asset.volatility, 2), 0)
    );
    const diversificationBenefit = undiversifiedRisk - portfolioRisk;

    // Marginal risk contribution
    const marginalRisk: Record<string, number> = {};
    for (let i = 0; i < assets.length; i++) {
      let contribution = 0;
      for (let j = 0; j < assets.length; j++) {
        const correlation = correlationMatrix[i]?.[j] ?? (i === j ? 1 : 0);
        contribution += 
          weights[j] * assets[j].volatility * correlation;
      }
      marginalRisk[assets[i].symbol] = (assets[i].volatility * contribution) / portfolioRisk;
    }

    return {
      systematicRisk,
      specificRisk,
      portfolioRisk,
      diversificationBenefit,
      marginalRisk,
    };
  }

  /**
   * Calculate concentration risk (Herfindahl-Hirschman Index)
   */
  calculateConcentrationRisk(assets: Asset[]): number {
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    
    // HHI = Σ (weight_i)²
    const hhi = assets.reduce((sum, asset) => {
      const weight = asset.value / totalValue;
      return sum + Math.pow(weight, 2);
    }, 0);

    // Convert to 0-100 scale (1.0 = fully concentrated, 0 = perfectly diversified)
    return hhi * 100;
  }

  /**
   * Calculate correlation risk
   */
  calculateCorrelationRisk(correlationMatrix: number[][]): number {
    if (correlationMatrix.length === 0) return 0;

    let sumCorrelations = 0;
    let count = 0;

    // Average off-diagonal correlations
    for (let i = 0; i < correlationMatrix.length; i++) {
      for (let j = i + 1; j < correlationMatrix.length; j++) {
        sumCorrelations += Math.abs(correlationMatrix[i]?.[j] ?? 0);
        count++;
      }
    }

    const avgCorrelation = count > 0 ? sumCorrelations / count : 0;
    
    // High correlation = high risk (0-100 scale)
    return avgCorrelation * 100;
  }

  /**
   * Calculate liquidity risk based on volume and market depth
   */
  calculateLiquidityRisk(
    assets: Asset[],
    volumes: Record<string, number>,
    marketCaps: Record<string, number>
  ): number {
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    let liquidityRisk = 0;

    for (const asset of assets) {
      const weight = asset.value / totalValue;
      const volume = volumes[asset.symbol] || 0;
      const marketCap = marketCaps[asset.symbol] || 1;

      // Liquidity ratio: position size / daily volume
      const liquidityRatio = asset.value / volume;
      
      // Market depth: position size / market cap
      const depthRatio = asset.value / marketCap;

      // Risk increases with illiquidity
      let assetLiquidityRisk = 0;
      
      if (liquidityRatio > 0.5) assetLiquidityRisk += 40; // Can't exit quickly
      else if (liquidityRatio > 0.2) assetLiquidityRisk += 20;
      else if (liquidityRatio > 0.1) assetLiquidityRisk += 10;

      if (depthRatio > 0.05) assetLiquidityRisk += 30; // Large relative to market
      else if (depthRatio > 0.01) assetLiquidityRisk += 15;

      liquidityRisk += weight * assetLiquidityRisk;
    }

    return Math.min(100, liquidityRisk);
  }

  /**
   * Comprehensive portfolio risk analysis
   */
  analyzePortfolioRisk(
    assets: Asset[],
    portfolioValue: number,
    historicalReturns: number[],
    correlationMatrix: number[][],
    volumes: Record<string, number>,
    marketCaps: Record<string, number>
  ): PortfolioRisk {
    // VaR calculations
    const var95 = this.calculateVaR(historicalReturns, portfolioValue, 0.95);
    const var99 = this.calculateVaR(historicalReturns, portfolioValue, 0.99);

    // Stress tests
    const stressTest = this.stressTest(assets, portfolioValue);

    // Risk factors
    const correlationRisk = this.calculateCorrelationRisk(correlationMatrix);
    const concentrationRisk = this.calculateConcentrationRisk(assets);
    const liquidityRisk = this.calculateLiquidityRisk(assets, volumes, marketCaps);

    // Overall risk score (weighted average)
    const overallRiskScore = (
      var95.var / portfolioValue * 100 * 0.3 + // 30% weight
      correlationRisk * 0.2 + // 20% weight
      concentrationRisk * 0.25 + // 25% weight
      liquidityRisk * 0.25 // 25% weight
    );

    return {
      valueAtRisk: {
        var95: var95.var,
        var99: var99.var,
        cvar95: var95.cvar,
        cvar99: var99.cvar,
      },
      stressTest,
      correlationRisk,
      concentrationRisk,
      liquidityRisk,
      overallRiskScore: Math.min(100, overallRiskScore),
    };
  }

  /**
   * Calculate optimal hedge ratio for portfolio protection
   */
  calculateHedgeRatio(
    portfolioBeta: number,
    portfolioValue: number,
    hedgeInstrumentBeta: number = -1.0 // e.g., inverse ETF
  ): {
    hedgeRatio: number;
    hedgeAmount: number;
    effectiveBeta: number;
    protectionLevel: number;
  } {
    // Optimal hedge ratio = Portfolio Beta / Hedge Instrument Beta
    const hedgeRatio = -portfolioBeta / hedgeInstrumentBeta;
    const hedgeAmount = portfolioValue * Math.abs(hedgeRatio);

    // Effective beta after hedging
    const effectiveBeta = portfolioBeta + (hedgeRatio * hedgeInstrumentBeta);

    // Protection level (how much market risk is eliminated)
    const protectionLevel = (1 - Math.abs(effectiveBeta / portfolioBeta)) * 100;

    return {
      hedgeRatio,
      hedgeAmount,
      effectiveBeta,
      protectionLevel,
    };
  }

  /**
   * Calculate tail risk metrics
   */
  calculateTailRisk(returns: number[]): {
    leftTailIndex: number; // Extreme downside
    rightTailIndex: number; // Extreme upside
    tailRatio: number; // Asymmetry
  } {
    const sorted = [...returns].sort((a, b) => a - b);
    const n = sorted.length;

    // Calculate tail indices (Hill estimator)
    const leftTail = sorted.slice(0, Math.floor(n * 0.05));
    const rightTail = sorted.slice(Math.floor(n * 0.95));

    const leftTailIndex = this.calculateHillEstimator(leftTail);
    const rightTailIndex = this.calculateHillEstimator(rightTail);

    // Tail ratio: downside risk / upside potential
    const avgLeftTail = Math.abs(leftTail.reduce((a, b) => a + b, 0) / leftTail.length);
    const avgRightTail = Math.abs(rightTail.reduce((a, b) => a + b, 0) / rightTail.length);
    const tailRatio = avgLeftTail / avgRightTail;

    return {
      leftTailIndex,
      rightTailIndex,
      tailRatio,
    };
  }

  /**
   * Private helper methods
   */

  private calculateHillEstimator(tailData: number[]): number {
    if (tailData.length < 2) return 1;

    const sorted = [...tailData].sort((a, b) => b - a);
    const n = sorted.length;
    
    let sum = 0;
    for (let i = 0; i < n - 1; i++) {
      sum += Math.log(sorted[i] / sorted[n - 1]);
    }

    return (n - 1) / sum;
  }
}

