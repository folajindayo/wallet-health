/**
 * Gas Price Optimizer
 * Suggests optimal times to transact based on gas price patterns
 */

import { GasPrice } from './gas-tracker';

export interface GasOptimizationRecommendation {
  currentGas: GasPrice;
  recommendedGas: number;
  recommendedSpeed: 'slow' | 'standard' | 'fast';
  estimatedSavings: number; // in gwei
  estimatedSavingsUSD?: number;
  estimatedWaitTime: string;
  optimalTimeWindow?: {
    start: number; // timestamp
    end: number; // timestamp
    reason: string;
  };
  urgency: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface GasPattern {
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday = 0)
  averageGas: number;
  minGas: number;
  maxGas: number;
  transactionCount: number;
}

export class GasOptimizer {
  private gasHistory: Map<number, GasPrice[]> = new Map(); // chainId -> history

  /**
   * Record gas price data
   */
  recordGasPrice(chainId: number, gasPrice: GasPrice): void {
    if (!this.gasHistory.has(chainId)) {
      this.gasHistory.set(chainId, []);
    }

    const history = this.gasHistory.get(chainId)!;
    history.push(gasPrice);

    // Keep last 1000 entries
    if (history.length > 1000) {
      history.shift();
    }
  }

  /**
   * Get optimization recommendation
   */
  getOptimizationRecommendation(
    chainId: number,
    urgency: 'low' | 'medium' | 'high' = 'medium',
    gasEstimate: number = 21000
  ): GasOptimizationRecommendation | null {
    const history = this.gasHistory.get(chainId);
    if (!history || history.length === 0) {
      return null;
    }

    const current = history[history.length - 1];
    const standardGas = current.standard;

    // Analyze patterns
    const patterns = this.analyzeGasPatterns(chainId);
    const optimalWindow = this.findOptimalTimeWindow(patterns, urgency);

    // Determine recommended gas price
    let recommendedGas: number;
    let recommendedSpeed: 'slow' | 'standard' | 'fast';
    let estimatedWaitTime: string;

    if (urgency === 'high') {
      recommendedGas = current.fast;
      recommendedSpeed = 'fast';
      estimatedWaitTime = '30-60 seconds';
    } else if (urgency === 'low') {
      // Find lower gas price from patterns
      const lowGasTimes = patterns
        .filter(p => p.averageGas < standardGas)
        .sort((a, b) => a.averageGas - b.averageGas);

      if (lowGasTimes.length > 0) {
        recommendedGas = lowGasTimes[0].averageGas;
        recommendedSpeed = 'slow';
        estimatedWaitTime = '5-15 minutes';
      } else {
        recommendedGas = current.slow;
        recommendedSpeed = 'slow';
        estimatedWaitTime = '5-15 minutes';
      }
    } else {
      recommendedGas = standardGas;
      recommendedSpeed = 'standard';
      estimatedWaitTime = '1-3 minutes';
    }

    // Calculate savings
    const gasDifference = standardGas - recommendedGas;
    const estimatedSavings = gasDifference * gasEstimate; // in gwei

    // Generate recommendation
    let recommendation = '';
    if (gasDifference > 0) {
      recommendation = `Wait and use ${recommendedSpeed} gas to save ~${gasDifference.toFixed(0)} gwei`;
    } else if (gasDifference < 0) {
      recommendation = `Current gas prices are reasonable. Proceed with ${recommendedSpeed} gas.`;
    } else {
      recommendation = `Current gas prices are optimal for ${recommendedSpeed} transactions.`;
    }

    if (optimalWindow) {
      recommendation += ` Best time window: ${optimalWindow.reason}`;
    }

    return {
      currentGas: current,
      recommendedGas,
      recommendedSpeed,
      estimatedSavings,
      estimatedWaitTime,
      optimalTimeWindow: optimalWindow,
      urgency,
      recommendation,
    };
  }

  /**
   * Analyze gas price patterns by time
   */
  analyzeGasPatterns(chainId: number): GasPattern[] {
    const history = this.gasHistory.get(chainId) || [];
    if (history.length === 0) return [];

    const patterns = new Map<string, {
      hour: number;
      dayOfWeek: number;
      gasPrices: number[];
    }>();

    history.forEach(gasPrice => {
      const date = new Date(gasPrice.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const key = `${dayOfWeek}-${hour}`;

      if (!patterns.has(key)) {
        patterns.set(key, {
          hour,
          dayOfWeek,
          gasPrices: [],
        });
      }

      patterns.get(key)!.gasPrices.push(gasPrice.standard);
    });

    return Array.from(patterns.values()).map(pattern => {
      const gasPrices = pattern.gasPrices;
      const averageGas = gasPrices.reduce((sum, g) => sum + g, 0) / gasPrices.length;
      const minGas = Math.min(...gasPrices);
      const maxGas = Math.max(...gasPrices);

      return {
        hour: pattern.hour,
        dayOfWeek: pattern.dayOfWeek,
        averageGas: Math.round(averageGas),
        minGas,
        maxGas,
        transactionCount: gasPrices.length,
      };
    });
  }

  /**
   * Find optimal time window for transactions
   */
  findOptimalTimeWindow(
    patterns: GasPattern[],
    urgency: 'low' | 'medium' | 'high'
  ): GasOptimizationRecommendation['optimalTimeWindow'] | undefined {
    if (patterns.length === 0) return undefined;

    // For low urgency, find times with lowest gas
    if (urgency === 'low') {
      const sorted = [...patterns].sort((a, b) => a.averageGas - b.averageGas);
      const best = sorted[0];

      // Find next occurrence of this time
      const now = new Date();
      const targetHour = best.hour;
      const targetDay = best.dayOfWeek;

      let nextOccurrence = new Date();
      nextOccurrence.setHours(targetHour, 0, 0, 0);

      // Adjust to next occurrence of this day/hour
      const daysUntil = (targetDay - now.getDay() + 7) % 7;
      if (daysUntil === 0 && now.getHours() >= targetHour) {
        nextOccurrence.setDate(now.getDate() + 7);
      } else {
        nextOccurrence.setDate(now.getDate() + daysUntil);
      }

      const endTime = new Date(nextOccurrence);
      endTime.setHours(targetHour + 2, 0, 0, 0); // 2-hour window

      return {
        start: nextOccurrence.getTime(),
        end: endTime.getTime(),
        reason: `Lower gas prices typically occur on ${this.getDayName(targetDay)}s around ${targetHour}:00`,
      };
    }

    return undefined;
  }

  /**
   * Predict gas price for specific time
   */
  predictGasPrice(
    chainId: number,
    targetTime: number
  ): { predicted: number; confidence: 'high' | 'medium' | 'low' } | null {
    const patterns = this.analyzeGasPatterns(chainId);
    if (patterns.length === 0) return null;

    const targetDate = new Date(targetTime);
    const targetHour = targetDate.getHours();
    const targetDay = targetDate.getDay();

    // Find matching pattern
    const matchingPattern = patterns.find(
      p => p.hour === targetHour && p.dayOfWeek === targetDay
    );

    if (matchingPattern) {
      return {
        predicted: matchingPattern.averageGas,
        confidence: matchingPattern.transactionCount > 10 ? 'high' : 'medium',
      };
    }

    // Fallback to overall average
    const overallAverage = patterns.reduce((sum, p) => sum + p.averageGas, 0) / patterns.length;
    return {
      predicted: Math.round(overallAverage),
      confidence: 'low',
    };
  }

  /**
   * Get gas price statistics
   */
  getGasStatistics(chainId: number, hours: number = 24): {
    average: number;
    min: number;
    max: number;
    current: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } | null {
    const history = this.gasHistory.get(chainId) || [];
    if (history.length === 0) return null;

    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const recent = history.filter(g => g.timestamp >= cutoff);

    if (recent.length === 0) return null;

    const prices = recent.map(g => g.standard);
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const current = recent[recent.length - 1].standard;

    // Determine trend
    const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
    const secondHalf = prices.slice(Math.floor(prices.length / 2));
    const firstAvg = firstHalf.reduce((sum, p) => sum + p, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p, 0) / secondHalf.length;

    let trend: 'increasing' | 'decreasing' | 'stable';
    const diff = secondAvg - firstAvg;
    if (diff > 5) {
      trend = 'increasing';
    } else if (diff < -5) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return {
      average: Math.round(average),
      min,
      max,
      current,
      trend,
    };
  }

  /**
   * Private helper methods
   */

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }
}

// Singleton instance
export const gasOptimizer = new GasOptimizer();

