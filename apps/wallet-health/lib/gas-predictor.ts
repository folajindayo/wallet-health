/**
 * Gas Price Prediction Engine
 * Predicts optimal gas prices and transaction timing using statistical models
 */

export interface GasDataPoint {
  timestamp: number;
  baseFee: number;
  priorityFee: number;
  totalGas: number;
  blockNumber: number;
  pendingTransactions: number;
  blockUtilization: number; // 0-1
}

export interface GasPrediction {
  currentGas: number;
  predictedGas: {
    next5min: number;
    next15min: number;
    next1hour: number;
    next4hours: number;
  };
  confidence: number; // 0-100
  recommendation: 'wait' | 'send-now' | 'urgent';
  optimalTime: string;
  potentialSavings: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface GasOptimizationStrategy {
  currentCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercentage: number;
  strategy: string;
  executionTime: string;
  confidence: number;
}

export class GasPredictor {
  private readonly EMA_ALPHA = 0.3; // Exponential Moving Average smoothing factor
  private readonly TREND_WINDOW = 12; // 1 hour with 5-min intervals

  /**
   * Predict future gas prices using exponential moving average and trend analysis
   */
  predictGasPrices(historicalData: GasDataPoint[]): GasPrediction {
    if (historicalData.length < 10) {
      throw new Error('Insufficient historical data for prediction');
    }

    const currentGas = historicalData[historicalData.length - 1].totalGas;
    
    // Calculate EMA for smoothing
    const ema = this.calculateEMA(historicalData.map(d => d.totalGas));
    
    // Detect trend
    const trend = this.detectTrend(historicalData);
    
    // Calculate volatility
    const volatility = this.calculateVolatility(historicalData.map(d => d.totalGas));
    
    // Predict future prices
    const predictions = this.forecastPrices(
      currentGas,
      ema,
      trend,
      volatility,
      historicalData
    );

    // Calculate confidence based on volatility and data quality
    const confidence = this.calculatePredictionConfidence(
      historicalData,
      volatility
    );

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      currentGas,
      predictions,
      trend,
      confidence
    );

    // Find optimal time
    const optimalTime = this.findOptimalExecutionTime(predictions, trend);
    
    // Calculate potential savings
    const potentialSavings = Math.max(0, currentGas - Math.min(...Object.values(predictions)));

    return {
      currentGas,
      predictedGas: predictions,
      confidence,
      recommendation,
      optimalTime,
      potentialSavings,
      trend,
    };
  }

  /**
   * Optimize transaction timing based on gas patterns
   */
  optimizeTransactionTiming(
    urgency: 'low' | 'medium' | 'high',
    historicalData: GasDataPoint[],
    maxWaitTime: number = 24 // hours
  ): GasOptimizationStrategy {
    const prediction = this.predictGasPrices(historicalData);
    const currentCost = prediction.currentGas;

    // Analyze historical patterns to find low-gas windows
    const lowGasWindows = this.findLowGasWindows(historicalData);
    
    let strategy: string;
    let executionTime: string;
    let optimizedCost: number;

    if (urgency === 'high') {
      // Execute immediately with slight optimization
      strategy = 'Immediate execution with optimized gas limit';
      executionTime = 'Now';
      optimizedCost = currentCost * 0.95; // 5% optimization
    } else if (urgency === 'medium') {
      // Wait for next low window within 4 hours
      const nextWindow = lowGasWindows.find(w => w.hoursAway <= 4);
      if (nextWindow) {
        strategy = 'Wait for upcoming low-gas window';
        executionTime = `In ${nextWindow.hoursAway.toFixed(1)} hours`;
        optimizedCost = nextWindow.expectedGas;
      } else {
        strategy = 'Execute within next hour when gas dips';
        executionTime = 'Within 1 hour';
        optimizedCost = prediction.predictedGas.next1hour;
      }
    } else {
      // Wait for optimal window within max wait time
      const optimalWindow = lowGasWindows.find(w => w.hoursAway <= maxWaitTime);
      if (optimalWindow) {
        strategy = 'Wait for optimal low-gas period';
        executionTime = `In ${optimalWindow.hoursAway.toFixed(1)} hours (${optimalWindow.description})`;
        optimizedCost = optimalWindow.expectedGas;
      } else {
        strategy = 'Execute during next weekend/off-peak hours';
        executionTime = this.getNextWeekend();
        optimizedCost = currentCost * 0.6; // Historical 40% savings
      }
    }

    const savings = currentCost - optimizedCost;
    const savingsPercentage = (savings / currentCost) * 100;

    return {
      currentCost,
      optimizedCost,
      savings,
      savingsPercentage,
      strategy,
      executionTime,
      confidence: prediction.confidence,
    };
  }

  /**
   * Calculate optimal gas price for target confirmation time
   */
  calculateOptimalGasPrice(
    targetConfirmationTime: number, // minutes
    currentBaseFee: number,
    pendingTransactions: number,
    blockUtilization: number
  ): {
    baseFee: number;
    priorityFee: number;
    totalGas: number;
    confidence: number;
  } {
    // EIP-1559 gas calculation
    // Target blocks = confirmation time / 12 seconds (avg block time)
    const targetBlocks = Math.ceil(targetConfirmationTime / 0.2);

    // Adjust base fee prediction based on utilization
    let predictedBaseFee = currentBaseFee;
    
    if (blockUtilization > 0.5) {
      // Base fee increases by 12.5% per block when usage > 50%
      const blocksAhead = targetBlocks;
      predictedBaseFee = currentBaseFee * Math.pow(1.125, blocksAhead);
    } else {
      // Base fee decreases by 12.5% per block when usage < 50%
      const blocksAhead = targetBlocks;
      predictedBaseFee = currentBaseFee * Math.pow(0.875, blocksAhead);
    }

    // Calculate priority fee based on pending transactions
    let priorityFee = 1; // 1 Gwei minimum
    
    if (targetConfirmationTime <= 1) {
      // Urgent: High priority fee
      priorityFee = this.calculatePriorityFeeForUrgent(pendingTransactions);
    } else if (targetConfirmationTime <= 5) {
      // Fast: Medium priority fee
      priorityFee = this.calculatePriorityFeeForFast(pendingTransactions);
    } else {
      // Standard: Low priority fee
      priorityFee = this.calculatePriorityFeeForStandard(pendingTransactions);
    }

    const totalGas = predictedBaseFee + priorityFee;

    // Confidence decreases with longer time horizons
    const confidence = Math.max(50, 100 - (targetBlocks * 2));

    return {
      baseFee: predictedBaseFee,
      priorityFee,
      totalGas,
      confidence,
    };
  }

  /**
   * Analyze gas patterns to identify recurring cycles
   */
  analyzeGasPatterns(historicalData: GasDataPoint[]): {
    dailyPattern: { hour: number; avgGas: number }[];
    weeklyPattern: { day: number; avgGas: number }[];
    peakHours: number[];
    lowHours: number[];
    volatilityScore: number;
  } {
    // Group by hour of day
    const hourlyData: Record<number, number[]> = {};
    const dailyData: Record<number, number[]> = {};

    for (const point of historicalData) {
      const date = new Date(point.timestamp);
      const hour = date.getHours();
      const day = date.getDay();

      if (!hourlyData[hour]) hourlyData[hour] = [];
      if (!dailyData[day]) dailyData[day] = [];

      hourlyData[hour].push(point.totalGas);
      dailyData[day].push(point.totalGas);
    }

    // Calculate averages
    const dailyPattern = Object.entries(hourlyData).map(([hour, values]) => ({
      hour: parseInt(hour),
      avgGas: values.reduce((a, b) => a + b, 0) / values.length,
    })).sort((a, b) => a.hour - b.hour);

    const weeklyPattern = Object.entries(dailyData).map(([day, values]) => ({
      day: parseInt(day),
      avgGas: values.reduce((a, b) => a + b, 0) / values.length,
    })).sort((a, b) => a.day - b.day);

    // Identify peak and low hours
    const sortedHours = [...dailyPattern].sort((a, b) => b.avgGas - a.avgGas);
    const peakHours = sortedHours.slice(0, 4).map(h => h.hour);
    const lowHours = sortedHours.slice(-4).map(h => h.hour);

    // Calculate overall volatility
    const allGas = historicalData.map(d => d.totalGas);
    const volatilityScore = this.calculateVolatility(allGas);

    return {
      dailyPattern,
      weeklyPattern,
      peakHours,
      lowHours,
      volatilityScore,
    };
  }

  /**
   * Calculate break-even gas price for arbitrage/MEV opportunities
   */
  calculateBreakEvenGas(
    profitOpportunity: number,
    gasUnitsRequired: number,
    ethPrice: number,
    minProfitMargin: number = 0.2 // 20% minimum profit margin
  ): {
    maxGasPrice: number;
    breakEvenGasPrice: number;
    recommendedGasPrice: number;
  } {
    // Convert profit to ETH
    const profitInETH = profitOpportunity / ethPrice;
    
    // Break-even gas price (Gwei)
    const breakEvenGasPrice = (profitInETH * 1e9) / gasUnitsRequired;
    
    // Max gas price with minimum profit margin
    const maxGasPrice = breakEvenGasPrice * (1 - minProfitMargin);
    
    // Recommended gas price (80% of max for safety)
    const recommendedGasPrice = maxGasPrice * 0.8;

    return {
      maxGasPrice,
      breakEvenGasPrice,
      recommendedGasPrice,
    };
  }

  /**
   * Private helper methods
   */

  private calculateEMA(data: number[]): number {
    let ema = data[0];
    
    for (let i = 1; i < data.length; i++) {
      ema = this.EMA_ALPHA * data[i] + (1 - this.EMA_ALPHA) * ema;
    }
    
    return ema;
  }

  private detectTrend(data: GasDataPoint[]): 'rising' | 'falling' | 'stable' {
    if (data.length < this.TREND_WINDOW) {
      return 'stable';
    }

    const recent = data.slice(-this.TREND_WINDOW);
    const first = recent.slice(0, this.TREND_WINDOW / 2);
    const second = recent.slice(this.TREND_WINDOW / 2);

    const firstAvg = first.reduce((sum, d) => sum + d.totalGas, 0) / first.length;
    const secondAvg = second.reduce((sum, d) => sum + d.totalGas, 0) / second.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change > 0.1) return 'rising';
    if (change < -0.1) return 'falling';
    return 'stable';
  }

  private calculateVolatility(prices: number[]): number {
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => {
      return sum + Math.pow(price - mean, 2);
    }, 0) / prices.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private forecastPrices(
    current: number,
    ema: number,
    trend: 'rising' | 'falling' | 'stable',
    volatility: number,
    historicalData: GasDataPoint[]
  ): {
    next5min: number;
    next15min: number;
    next1hour: number;
    next4hours: number;
  } {
    const trendFactors = {
      rising: 1.05,
      falling: 0.95,
      stable: 1.0,
    };

    const trendFactor = trendFactors[trend];
    
    // Use mean reversion: prices tend to revert to EMA
    const meanReversionStrength = 0.3;
    
    const forecast5min = current * trendFactor * 0.9 + ema * 0.1;
    const forecast15min = forecast5min * trendFactor * (1 - meanReversionStrength * 0.5) + ema * meanReversionStrength * 0.5;
    const forecast1hour = ema * (1 - meanReversionStrength) + current * meanReversionStrength * trendFactor;
    const forecast4hours = ema * (1 - meanReversionStrength * 1.5) + current * meanReversionStrength * 0.5;

    return {
      next5min: Math.max(1, forecast5min),
      next15min: Math.max(1, forecast15min),
      next1hour: Math.max(1, forecast1hour),
      next4hours: Math.max(1, forecast4hours),
    };
  }

  private calculatePredictionConfidence(
    data: GasDataPoint[],
    volatility: number
  ): number {
    let confidence = 100;

    // Reduce confidence based on volatility
    if (volatility > 0.5) confidence -= 30;
    else if (volatility > 0.3) confidence -= 15;

    // Reduce confidence if data is sparse
    if (data.length < 50) confidence -= 20;
    else if (data.length < 100) confidence -= 10;

    // Check data recency
    const latestTimestamp = data[data.length - 1].timestamp;
    const dataAge = Date.now() - latestTimestamp;
    
    if (dataAge > 300000) confidence -= 25; // >5 minutes old
    else if (dataAge > 60000) confidence -= 10; // >1 minute old

    return Math.max(50, confidence);
  }

  private generateRecommendation(
    current: number,
    predictions: { next5min: number; next15min: number; next1hour: number; next4hours: number },
    trend: 'rising' | 'falling' | 'stable',
    confidence: number
  ): 'wait' | 'send-now' | 'urgent' {
    const lowestPrediction = Math.min(...Object.values(predictions));
    const savingsPercentage = ((current - lowestPrediction) / current) * 100;

    if (trend === 'falling' && savingsPercentage > 15 && confidence > 70) {
      return 'wait';
    }

    if (trend === 'rising' || current < lowestPrediction * 1.1) {
      return 'send-now';
    }

    if (savingsPercentage > 25) {
      return 'wait';
    }

    return 'send-now';
  }

  private findOptimalExecutionTime(
    predictions: { next5min: number; next15min: number; next1hour: number; next4hours: number },
    trend: 'rising' | 'falling' | 'stable'
  ): string {
    const times = [
      { time: 'in 5 minutes', gas: predictions.next5min },
      { time: 'in 15 minutes', gas: predictions.next15min },
      { time: 'in 1 hour', gas: predictions.next1hour },
      { time: 'in 4 hours', gas: predictions.next4hours },
    ];

    const optimal = times.reduce((min, t) => t.gas < min.gas ? t : min, times[0]);
    
    if (trend === 'falling') {
      return optimal.time;
    }

    return 'now';
  }

  private findLowGasWindows(data: GasDataPoint[]): {
    hoursAway: number;
    expectedGas: number;
    description: string;
  }[] {
    // Analyze historical patterns
    const patterns = this.analyzeGasPatterns(data);
    const now = new Date();
    const currentHour = now.getHours();

    const windows = patterns.lowHours.map(hour => {
      let hoursAway = hour - currentHour;
      if (hoursAway < 0) hoursAway += 24;

      const avgData = patterns.dailyPattern.find(p => p.hour === hour);
      
      return {
        hoursAway,
        expectedGas: avgData ? avgData.avgGas : data[data.length - 1].totalGas * 0.7,
        description: `${hour}:00 UTC (typically low activity)`,
      };
    }).sort((a, b) => a.hoursAway - b.hoursAway);

    return windows;
  }

  private getNextWeekend(): string {
    const now = new Date();
    const currentDay = now.getDay();
    const daysUntilSaturday = (6 - currentDay + 7) % 7 || 7;
    
    return `In ${daysUntilSaturday} days (Weekend - typically 30-40% lower gas)`;
  }

  private calculatePriorityFeeForUrgent(pendingTx: number): number {
    // High priority: ensure inclusion in next 1-2 blocks
    return Math.max(2, pendingTx / 5000);
  }

  private calculatePriorityFeeForFast(pendingTx: number): number {
    // Medium priority: inclusion within 5 blocks
    return Math.max(1.5, pendingTx / 10000);
  }

  private calculatePriorityFeeForStandard(pendingTx: number): number {
    // Low priority: inclusion eventually
    return Math.max(1, pendingTx / 20000);
  }
}

