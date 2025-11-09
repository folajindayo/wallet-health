/**
 * Time Series Analysis Engine
 * Advanced statistical models for forecasting and anomaly detection
 */

export interface TimeSeriesData {
  timestamp: number;
  value: number;
}

export interface ForecastResult {
  predictions: {
    timestamp: number;
    value: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }[];
  model: string;
  accuracy: number;
  rmse: number; // Root Mean Square Error
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
}

export interface Trend {
  direction: 'up' | 'down' | 'sideways';
  strength: number; // 0-100
  slope: number;
  r2: number; // Goodness of fit
  changePercent: number;
}

export interface Seasonality {
  isPresent: boolean;
  period: number;
  strength: number; // 0-100
  peaks: number[];
  troughs: number[];
}

export interface Anomaly {
  timestamp: number;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  zScore: number;
}

export interface StationarityTest {
  isStationary: boolean;
  adfStatistic: number;
  pValue: number;
  criticalValues: Record<string, number>;
  recommendation: string;
}

export interface Autocorrelation {
  lags: number[];
  acf: number[]; // Autocorrelation Function
  pacf: number[]; // Partial Autocorrelation Function
  significantLags: number[];
}

export class TimeSeriesAnalyzer {
  /**
   * ARIMA (AutoRegressive Integrated Moving Average) model
   */
  fitARIMA(
    data: TimeSeriesData[],
    p: number = 1, // AR order
    d: number = 1, // Integration order (differencing)
    q: number = 1  // MA order
  ): {
    coefficients: {
      ar: number[];
      ma: number[];
    };
    residuals: number[];
    aic: number; // Akaike Information Criterion
    bic: number; // Bayesian Information Criterion
  } {
    const values = data.map(d => d.value);
    
    // Apply differencing
    let series = values;
    for (let i = 0; i < d; i++) {
      series = this.difference(series);
    }

    // Fit AR component
    const arCoefficients = this.fitAR(series, p);
    
    // Calculate residuals
    const residuals = this.calculateResiduals(series, arCoefficients);
    
    // Fit MA component on residuals
    const maCoefficients = this.fitMA(residuals, q);

    // Calculate information criteria
    const n = series.length;
    const k = p + q + 1; // number of parameters
    const rss = residuals.reduce((sum, r) => sum + r * r, 0);
    
    const aic = n * Math.log(rss / n) + 2 * k;
    const bic = n * Math.log(rss / n) + k * Math.log(n);

    return {
      coefficients: {
        ar: arCoefficients,
        ma: maCoefficients,
      },
      residuals,
      aic,
      bic,
    };
  }

  /**
   * Exponential Smoothing (Holt-Winters) for forecasting
   */
  exponentialSmoothing(
    data: TimeSeriesData[],
    forecastHorizon: number,
    alpha: number = 0.3, // Level smoothing
    beta: number = 0.1,  // Trend smoothing
    gamma: number = 0.1  // Seasonality smoothing
  ): ForecastResult {
    const values = data.map(d => d.value);
    const n = values.length;

    // Initialize components
    let level = values[0];
    let trend = values[1] - values[0];
    const seasonalPeriod = this.detectSeasonalPeriod(data);
    const seasonal: number[] = new Array(seasonalPeriod).fill(1);

    // Fitted values for error calculation
    const fitted: number[] = [];

    // Fit the model
    for (let t = 0; t < n; t++) {
      const seasonalIndex = t % seasonalPeriod;
      const forecast = (level + trend) * seasonal[seasonalIndex];
      fitted.push(forecast);

      // Update components
      const prevLevel = level;
      const prevTrend = trend;

      level = alpha * (values[t] / seasonal[seasonalIndex]) + (1 - alpha) * (prevLevel + prevTrend);
      trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;
      seasonal[seasonalIndex] = gamma * (values[t] / (prevLevel + prevTrend)) + (1 - gamma) * seasonal[seasonalIndex];
    }

    // Generate forecasts
    const predictions = [];
    const lastTimestamp = data[n - 1].timestamp;
    const timeStep = data[1].timestamp - data[0].timestamp;

    // Calculate error metrics
    const errors = values.map((v, i) => v - fitted[i]);
    const rmse = Math.sqrt(errors.reduce((sum, e) => sum + e * e, 0) / n);
    const mae = errors.reduce((sum, e) => sum + Math.abs(e), 0) / n;
    const mape = errors.reduce((sum, e, i) => sum + Math.abs(e / values[i]), 0) / n * 100;

    for (let i = 1; i <= forecastHorizon; i++) {
      const seasonalIndex = (n + i - 1) % seasonalPeriod;
      const forecastValue = (level + i * trend) * seasonal[seasonalIndex];
      
      // Confidence intervals (simplified using RMSE)
      const confidence = Math.max(50, 100 - i * 5); // Decreases with horizon
      const margin = rmse * (2 - confidence / 100) * Math.sqrt(i);

      predictions.push({
        timestamp: lastTimestamp + i * timeStep,
        value: forecastValue,
        lowerBound: forecastValue - margin,
        upperBound: forecastValue + margin,
        confidence,
      });
    }

    return {
      predictions,
      model: 'Holt-Winters Exponential Smoothing',
      accuracy: 100 - mape,
      rmse,
      mae,
      mape,
    };
  }

  /**
   * Detect trend using linear regression
   */
  detectTrend(data: TimeSeriesData[]): Trend {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data.map(d => d.value);

    // Linear regression: y = a + bx
    const { slope, intercept, r2 } = this.linearRegression(x, y);

    // Trend strength based on R²
    const strength = r2 * 100;

    // Trend direction
    let direction: 'up' | 'down' | 'sideways';
    if (Math.abs(slope) < 0.01) direction = 'sideways';
    else if (slope > 0) direction = 'up';
    else direction = 'down';

    // Percentage change
    const firstValue = y[0];
    const lastValue = y[n - 1];
    const changePercent = ((lastValue - firstValue) / firstValue) * 100;

    return {
      direction,
      strength,
      slope,
      r2,
      changePercent,
    };
  }

  /**
   * Detect seasonality using autocorrelation
   */
  detectSeasonality(data: TimeSeriesData[]): Seasonality {
    const acf = this.calculateACF(data.map(d => d.value), Math.floor(data.length / 2));
    
    // Find peaks in ACF
    const peaks = this.findPeaks(acf.slice(1)); // Skip lag 0
    
    // Most significant period
    const period = peaks.length > 0 ? peaks[0] + 1 : 0;
    
    // Seasonality strength (average of significant ACF values)
    const significantACF = acf.filter((val, i) => i > 0 && Math.abs(val) > 0.3);
    const strength = significantACF.length > 0 
      ? Math.abs(significantACF.reduce((a, b) => a + b, 0) / significantACF.length) * 100
      : 0;

    // Find actual peaks and troughs in data
    const values = data.map(d => d.value);
    const dataPeaks = this.findPeaks(values).map(i => data[i].timestamp);
    const dataTroughs = this.findPeaks(values.map(v => -v)).map(i => data[i].timestamp);

    return {
      isPresent: period > 1 && strength > 20,
      period,
      strength,
      peaks: dataPeaks,
      troughs: dataTroughs,
    };
  }

  /**
   * Detect anomalies using statistical methods
   */
  detectAnomalies(
    data: TimeSeriesData[],
    method: 'zscore' | 'iqr' | 'isolation' = 'zscore',
    threshold: number = 3
  ): Anomaly[] {
    const values = data.map(d => d.value);
    const anomalies: Anomaly[] = [];

    if (method === 'zscore') {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
      );

      for (let i = 0; i < data.length; i++) {
        const zScore = (values[i] - mean) / stdDev;
        
        if (Math.abs(zScore) > threshold) {
          const deviation = Math.abs(values[i] - mean);
          
          let severity: 'low' | 'medium' | 'high' | 'critical';
          if (Math.abs(zScore) > 5) severity = 'critical';
          else if (Math.abs(zScore) > 4) severity = 'high';
          else if (Math.abs(zScore) > 3) severity = 'medium';
          else severity = 'low';

          anomalies.push({
            timestamp: data[i].timestamp,
            value: values[i],
            expectedValue: mean,
            deviation,
            severity,
            zScore,
          });
        }
      }
    } else if (method === 'iqr') {
      const sorted = [...values].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      for (let i = 0; i < data.length; i++) {
        if (values[i] < lowerBound || values[i] > upperBound) {
          const median = sorted[Math.floor(sorted.length / 2)];
          const deviation = Math.abs(values[i] - median);
          
          anomalies.push({
            timestamp: data[i].timestamp,
            value: values[i],
            expectedValue: median,
            deviation,
            severity: 'medium',
            zScore: 0,
          });
        }
      }
    }

    return anomalies.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
  }

  /**
   * Test for stationarity using Augmented Dickey-Fuller test
   */
  testStationarity(data: TimeSeriesData[]): StationarityTest {
    const values = data.map(d => d.value);
    
    // Simplified ADF test
    const differences = this.difference(values);
    const laggedValues = values.slice(0, -1);
    
    // Regression: Δy_t = α + β*y_{t-1} + ε_t
    const { slope: beta, intercept, r2 } = this.linearRegression(
      laggedValues,
      differences
    );

    // ADF statistic (simplified)
    const n = differences.length;
    const residuals = differences.map((d, i) => d - (intercept + beta * laggedValues[i]));
    const rss = residuals.reduce((sum, r) => sum + r * r, 0);
    const stdError = Math.sqrt(rss / (n - 2));
    const tStat = beta / (stdError / Math.sqrt(laggedValues.reduce((sum, v) => sum + v * v, 0)));

    // Critical values (5% significance level)
    const criticalValues = {
      '1%': -3.43,
      '5%': -2.86,
      '10%': -2.57,
    };

    const pValue = this.approximatePValue(tStat);
    const isStationary = tStat < criticalValues['5%'];

    let recommendation: string;
    if (isStationary) {
      recommendation = 'Series is stationary. No transformation needed.';
    } else {
      recommendation = 'Series is non-stationary. Consider differencing or detrending.';
    }

    return {
      isStationary,
      adfStatistic: tStat,
      pValue,
      criticalValues,
      recommendation,
    };
  }

  /**
   * Calculate autocorrelation function
   */
  calculateAutocorrelation(data: TimeSeriesData[], maxLag: number = 20): Autocorrelation {
    const values = data.map(d => d.value);
    const acf = this.calculateACF(values, maxLag);
    const pacf = this.calculatePACF(values, maxLag);

    // Significant lags (where |ACF| > 2/√n)
    const threshold = 2 / Math.sqrt(values.length);
    const significantLags = acf
      .map((val, i) => (Math.abs(val) > threshold ? i : -1))
      .filter(i => i > 0);

    return {
      lags: Array.from({ length: maxLag + 1 }, (_, i) => i),
      acf,
      pacf,
      significantLags,
    };
  }

  /**
   * Private helper methods
   */

  private difference(series: number[]): number[] {
    const diff: number[] = [];
    for (let i = 1; i < series.length; i++) {
      diff.push(series[i] - series[i - 1]);
    }
    return diff;
  }

  private fitAR(series: number[], order: number): number[] {
    // Fit autoregressive model using Yule-Walker equations
    const acf = this.calculateACF(series, order);
    const coefficients: number[] = [];

    // Simplified: use ACF directly as approximation
    for (let i = 1; i <= order; i++) {
      coefficients.push(acf[i] * 0.8); // Dampened
    }

    return coefficients;
  }

  private fitMA(residuals: number[], order: number): number[] {
    // Fit moving average model
    const coefficients: number[] = [];
    
    // Simplified: use residual autocorrelation
    const acf = this.calculateACF(residuals, order);
    for (let i = 1; i <= order; i++) {
      coefficients.push(acf[i] * 0.7); // Dampened
    }

    return coefficients;
  }

  private calculateResiduals(series: number[], arCoefficients: number[]): number[] {
    const residuals: number[] = [];
    const p = arCoefficients.length;

    for (let t = p; t < series.length; t++) {
      let predicted = 0;
      for (let i = 0; i < p; i++) {
        predicted += arCoefficients[i] * series[t - i - 1];
      }
      residuals.push(series[t] - predicted);
    }

    return residuals;
  }

  private calculateACF(series: number[], maxLag: number): number[] {
    const n = series.length;
    const mean = series.reduce((a, b) => a + b, 0) / n;
    
    // Variance
    const c0 = series.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
    
    const acf: number[] = [1]; // Lag 0 is always 1

    for (let k = 1; k <= maxLag; k++) {
      let sum = 0;
      for (let t = k; t < n; t++) {
        sum += (series[t] - mean) * (series[t - k] - mean);
      }
      acf.push(sum / (n * c0));
    }

    return acf;
  }

  private calculatePACF(series: number[], maxLag: number): number[] {
    const pacf: number[] = [1];
    const acf = this.calculateACF(series, maxLag);

    // Durbin-Levinson algorithm
    for (let k = 1; k <= maxLag; k++) {
      let numerator = acf[k];
      let denominator = 1;

      for (let j = 1; j < k; j++) {
        numerator -= pacf[j] * acf[k - j];
        denominator -= pacf[j] * acf[j];
      }

      pacf.push(numerator / denominator);
    }

    return pacf;
  }

  private linearRegression(x: number[], y: number[]): {
    slope: number;
    intercept: number;
    r2: number;
  } {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R²
    const meanY = sumY / n;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const ssResidual = y.reduce((sum, yi, i) => {
      const predicted = intercept + slope * x[i];
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const r2 = 1 - ssResidual / ssTotal;

    return { slope, intercept, r2 };
  }

  private findPeaks(series: number[]): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < series.length - 1; i++) {
      if (series[i] > series[i - 1] && series[i] > series[i + 1]) {
        peaks.push(i);
      }
    }

    return peaks;
  }

  private detectSeasonalPeriod(data: TimeSeriesData[]): number {
    const values = data.map(d => d.value);
    const acf = this.calculateACF(values, Math.floor(values.length / 2));
    
    // Find first significant peak after lag 1
    for (let i = 2; i < acf.length; i++) {
      if (acf[i] > 0.3 && acf[i] > acf[i - 1] && acf[i] > acf[i + 1]) {
        return i;
      }
    }

    return 12; // Default to monthly if no seasonality detected
  }

  private approximatePValue(tStat: number): number {
    // Rough approximation of p-value from t-statistic
    if (tStat < -3.5) return 0.001;
    if (tStat < -2.9) return 0.01;
    if (tStat < -2.6) return 0.05;
    return 0.1;
  }
}

