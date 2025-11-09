/**
 * Trading Strategy Engine
 * Advanced algorithmic trading strategies with backtesting and optimization
 */

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  strength: number; // 0-100
  price: number;
  timestamp: number;
  indicators: Record<string, number>;
  confidence: number;
  reason: string;
}

export interface BacktestResult {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number; // Gross profit / Gross loss
  averageWin: number;
  averageLoss: number;
  expectancy: number;
  trades: Trade[];
}

export interface Trade {
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  type: 'long' | 'short';
  quantity: number;
  pnl: number;
  pnlPercent: number;
  duration: number; // minutes
}

export interface StrategyParameters {
  initialCapital: number;
  positionSize: number; // percentage of capital per trade
  stopLoss: number; // percentage
  takeProfit: number; // percentage
  riskRewardRatio: number;
  maxPositions: number;
  commissionRate: number; // percentage
}

export class TradingStrategyEngine {
  /**
   * Calculate Relative Strength Index (RSI)
   */
  calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    const changes: number[] = [];

    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    // Calculate initial average gain and loss
    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) avgGain += changes[i];
      else avgLoss += Math.abs(changes[i]);
    }

    avgGain /= period;
    avgLoss /= period;

    // Calculate RSI for each point
    for (let i = period; i < changes.length; i++) {
      const change = changes[i];
      
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
      }

      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push(rsiValue);
    }

    return rsi;
  }

  /**
   * Calculate Moving Average Convergence Divergence (MACD)
   */
  calculateMACD(
    prices: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): { macd: number[]; signal: number[]; histogram: number[] } {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);

    // MACD line
    const macd: number[] = [];
    for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
      macd.push(fastEMA[i] - slowEMA[i]);
    }

    // Signal line (EMA of MACD)
    const signal = this.calculateEMA(macd, signalPeriod);

    // Histogram
    const histogram: number[] = [];
    for (let i = 0; i < signal.length; i++) {
      histogram.push(macd[i + (macd.length - signal.length)] - signal[i]);
    }

    return { macd, signal, histogram };
  }

  /**
   * Calculate Bollinger Bands
   */
  calculateBollingerBands(
    prices: number[],
    period: number = 20,
    stdDev: number = 2
  ): { upper: number[]; middle: number[]; lower: number[] } {
    const middle = this.calculateSMA(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = 0; i < middle.length; i++) {
      const slice = prices.slice(i, i + period);
      const mean = middle[i];
      
      // Calculate standard deviation
      const variance = slice.reduce((sum, price) => {
        return sum + Math.pow(price - mean, 2);
      }, 0) / period;
      
      const std = Math.sqrt(variance);

      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }

    return { upper, middle, lower };
  }

  /**
   * Calculate Average True Range (ATR) for volatility
   */
  calculateATR(candles: OHLCV[], period: number = 14): number[] {
    const tr: number[] = [];
    const atr: number[] = [];

    // Calculate True Range
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;

      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);

      tr.push(Math.max(tr1, tr2, tr3));
    }

    // Calculate ATR (EMA of TR)
    let atrValue = tr.slice(0, period).reduce((a, b) => a + b, 0) / period;
    atr.push(atrValue);

    for (let i = period; i < tr.length; i++) {
      atrValue = ((atrValue * (period - 1)) + tr[i]) / period;
      atr.push(atrValue);
    }

    return atr;
  }

  /**
   * Mean Reversion Strategy
   */
  meanReversionStrategy(
    candles: OHLCV[],
    params: {
      period: number;
      entryStdDev: number;
      exitStdDev: number;
    }
  ): TradingSignal[] {
    const prices = candles.map(c => c.close);
    const { upper, middle, lower } = this.calculateBollingerBands(
      prices,
      params.period,
      params.entryStdDev
    );

    const signals: TradingSignal[] = [];

    for (let i = 0; i < candles.length; i++) {
      const price = prices[i];
      const idx = i - (prices.length - upper.length);
      
      if (idx < 0) continue;

      // Buy when price touches lower band (oversold)
      if (price <= lower[idx]) {
        signals.push({
          type: 'buy',
          strength: Math.min(100, ((lower[idx] - price) / lower[idx]) * 200),
          price,
          timestamp: candles[i].timestamp,
          indicators: {
            upperBand: upper[idx],
            middleBand: middle[idx],
            lowerBand: lower[idx],
          },
          confidence: 75,
          reason: 'Price at lower Bollinger Band - oversold condition',
        });
      }
      // Sell when price touches upper band (overbought)
      else if (price >= upper[idx]) {
        signals.push({
          type: 'sell',
          strength: Math.min(100, ((price - upper[idx]) / upper[idx]) * 200),
          price,
          timestamp: candles[i].timestamp,
          indicators: {
            upperBand: upper[idx],
            middleBand: middle[idx],
            lowerBand: lower[idx],
          },
          confidence: 75,
          reason: 'Price at upper Bollinger Band - overbought condition',
        });
      }
    }

    return signals;
  }

  /**
   * Momentum Strategy (RSI + MACD)
   */
  momentumStrategy(
    candles: OHLCV[],
    params: {
      rsiPeriod: number;
      rsiOversold: number;
      rsiOverbought: number;
    }
  ): TradingSignal[] {
    const prices = candles.map(c => c.close);
    const rsi = this.calculateRSI(prices, params.rsiPeriod);
    const { macd, signal, histogram } = this.calculateMACD(prices);

    const signals: TradingSignal[] = [];

    for (let i = 0; i < candles.length; i++) {
      const rsiIdx = i - (prices.length - rsi.length);
      const macdIdx = i - (prices.length - histogram.length);

      if (rsiIdx < 1 || macdIdx < 1) continue;

      const currentRSI = rsi[rsiIdx];
      const prevMACD = histogram[macdIdx - 1];
      const currentMACD = histogram[macdIdx];

      // Buy signal: RSI oversold + MACD bullish crossover
      if (currentRSI < params.rsiOversold && currentMACD > 0 && prevMACD <= 0) {
        signals.push({
          type: 'buy',
          strength: Math.min(100, (100 - currentRSI) + Math.abs(currentMACD) * 10),
          price: prices[i],
          timestamp: candles[i].timestamp,
          indicators: {
            rsi: currentRSI,
            macd: macd[macdIdx],
            signal: signal[macdIdx],
            histogram: currentMACD,
          },
          confidence: 85,
          reason: 'RSI oversold with MACD bullish crossover',
        });
      }
      // Sell signal: RSI overbought + MACD bearish crossover
      else if (currentRSI > params.rsiOverbought && currentMACD < 0 && prevMACD >= 0) {
        signals.push({
          type: 'sell',
          strength: Math.min(100, (currentRSI - 50) + Math.abs(currentMACD) * 10),
          price: prices[i],
          timestamp: candles[i].timestamp,
          indicators: {
            rsi: currentRSI,
            macd: macd[macdIdx],
            signal: signal[macdIdx],
            histogram: currentMACD,
          },
          confidence: 85,
          reason: 'RSI overbought with MACD bearish crossover',
        });
      }
    }

    return signals;
  }

  /**
   * Backtest a trading strategy
   */
  backtest(
    candles: OHLCV[],
    signals: TradingSignal[],
    params: StrategyParameters
  ): BacktestResult {
    let capital = params.initialCapital;
    let position: { type: 'long' | 'short'; entry: number; quantity: number; time: number } | null = null;
    const trades: Trade[] = [];
    let peak = capital;
    let maxDrawdown = 0;

    for (const signal of signals) {
      // Entry logic
      if (!position && (signal.type === 'buy' || signal.type === 'sell')) {
        const positionValue = capital * (params.positionSize / 100);
        const quantity = positionValue / signal.price;
        const commission = positionValue * (params.commissionRate / 100);

        position = {
          type: signal.type === 'buy' ? 'long' : 'short',
          entry: signal.price,
          quantity,
          time: signal.timestamp,
        };

        capital -= commission;
      }
      // Exit logic
      else if (position) {
        const shouldExit = 
          (position.type === 'long' && signal.type === 'sell') ||
          (position.type === 'short' && signal.type === 'buy');

        // Check stop loss and take profit
        const priceChange = position.type === 'long'
          ? (signal.price - position.entry) / position.entry
          : (position.entry - signal.price) / position.entry;

        const hitStopLoss = priceChange <= -(params.stopLoss / 100);
        const hitTakeProfit = priceChange >= (params.takeProfit / 100);

        if (shouldExit || hitStopLoss || hitTakeProfit) {
          const exitValue = position.quantity * signal.price;
          const entryValue = position.quantity * position.entry;
          const commission = exitValue * (params.commissionRate / 100);

          let pnl: number;
          if (position.type === 'long') {
            pnl = exitValue - entryValue - commission;
          } else {
            pnl = entryValue - exitValue - commission;
          }

          const pnlPercent = (pnl / entryValue) * 100;

          trades.push({
            entryTime: position.time,
            exitTime: signal.timestamp,
            entryPrice: position.entry,
            exitPrice: signal.price,
            type: position.type,
            quantity: position.quantity,
            pnl,
            pnlPercent,
            duration: (signal.timestamp - position.time) / 60000, // minutes
          });

          capital += pnl;

          // Update drawdown
          if (capital > peak) {
            peak = capital;
          } else {
            const drawdown = ((peak - capital) / peak) * 100;
            maxDrawdown = Math.max(maxDrawdown, drawdown);
          }

          position = null;
        }
      }
    }

    // Calculate metrics
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    
    const totalReturn = ((capital - params.initialCapital) / params.initialCapital) * 100;
    const days = (candles[candles.length - 1].timestamp - candles[0].timestamp) / (24 * 60 * 60 * 1000);
    const annualizedReturn = (Math.pow(capital / params.initialCapital, 365 / days) - 1) * 100;

    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : Infinity;

    const averageWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
      : 0;

    const averageLoss = losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length
      : 0;

    const winRate = (winningTrades.length / trades.length) * 100;
    const expectancy = (winRate / 100) * averageWin + ((100 - winRate) / 100) * averageLoss;

    // Calculate Sharpe Ratio
    const returns = trades.map(t => t.pnlPercent);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? (avgReturn - 2) / stdDev : 0; // 2% risk-free rate

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalReturn,
      annualizedReturn,
      sharpeRatio,
      maxDrawdown,
      profitFactor,
      averageWin,
      averageLoss,
      expectancy,
      trades,
    };
  }

  /**
   * Optimize strategy parameters using grid search
   */
  optimizeStrategy(
    candles: OHLCV[],
    strategyType: 'momentum' | 'mean-reversion',
    parameterRanges: {
      rsiPeriod?: number[];
      rsiOversold?: number[];
      rsiOverbought?: number[];
      bbPeriod?: number[];
      bbStdDev?: number[];
    },
    backtestParams: StrategyParameters
  ): {
    bestParams: any;
    bestResult: BacktestResult;
    allResults: { params: any; result: BacktestResult }[];
  } {
    const allResults: { params: any; result: BacktestResult }[] = [];

    if (strategyType === 'momentum') {
      const rsiPeriods = parameterRanges.rsiPeriod || [14];
      const rsiOversoldLevels = parameterRanges.rsiOversold || [30];
      const rsiOverboughtLevels = parameterRanges.rsiOverbought || [70];

      for (const period of rsiPeriods) {
        for (const oversold of rsiOversoldLevels) {
          for (const overbought of rsiOverboughtLevels) {
            const signals = this.momentumStrategy(candles, {
              rsiPeriod: period,
              rsiOversold: oversold,
              rsiOverbought: overbought,
            });

            const result = this.backtest(candles, signals, backtestParams);
            
            allResults.push({
              params: { rsiPeriod: period, rsiOversold: oversold, rsiOverbought: overbought },
              result,
            });
          }
        }
      }
    } else {
      const bbPeriods = parameterRanges.bbPeriod || [20];
      const bbStdDevs = parameterRanges.bbStdDev || [2];

      for (const period of bbPeriods) {
        for (const stdDev of bbStdDevs) {
          const signals = this.meanReversionStrategy(candles, {
            period,
            entryStdDev: stdDev,
            exitStdDev: stdDev * 0.5,
          });

          const result = this.backtest(candles, signals, backtestParams);
          
          allResults.push({
            params: { bbPeriod: period, bbStdDev: stdDev },
            result,
          });
        }
      }
    }

    // Find best result by Sharpe ratio
    const best = allResults.reduce((best, current) => {
      return current.result.sharpeRatio > best.result.sharpeRatio ? current : best;
    }, allResults[0]);

    return {
      bestParams: best.params,
      bestResult: best.result,
      allResults,
    };
  }

  /**
   * Private helper methods
   */

  private calculateEMA(data: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);

    // Start with SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i];
    }
    ema.push(sum / period);

    // Calculate EMA
    for (let i = period; i < data.length; i++) {
      const value = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
      ema.push(value);
    }

    return ema;
  }

  private calculateSMA(data: number[], period: number): number[] {
    const sma: number[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / period;
      sma.push(avg);
    }

    return sma;
  }
}

