/**
 * Advanced Probability & Statistics Engine
 * Distributions, hypothesis testing, regression, Bayesian inference
 */

export interface Distribution {
  mean: number;
  variance: number;
  stdDev: number;
  skewness: number;
  kurtosis: number;
}

export interface HypothesisTest {
  statistic: number;
  pValue: number;
  criticalValue: number;
  reject: boolean;
  confidenceLevel: number;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  correlation: number;
  residuals: number[];
  predictions: number[];
}

export interface BayesianResult {
  posterior: number;
  prior: number;
  likelihood: number;
  evidence: number;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  mean: number;
  confidence: number;
}

export class ProbabilityStatisticsEngine {
  /**
   * Calculate descriptive statistics
   */
  descriptiveStats(data: number[]): Distribution {
    const n = data.length;
    const mean = this.mean(data);
    const variance = this.variance(data);
    const stdDev = Math.sqrt(variance);
    
    // Skewness (3rd moment)
    const skewness = data.reduce((sum, x) => {
      return sum + Math.pow((x - mean) / stdDev, 3);
    }, 0) / n;
    
    // Kurtosis (4th moment)
    const kurtosis = data.reduce((sum, x) => {
      return sum + Math.pow((x - mean) / stdDev, 4);
    }, 0) / n - 3; // Excess kurtosis
    
    return { mean, variance, stdDev, skewness, kurtosis };
  }

  /**
   * Normal (Gaussian) Distribution PDF
   */
  normalPDF(x: number, mean: number = 0, stdDev: number = 1): number {
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(x - mean, 2) / (2 * stdDev * stdDev);
    return coefficient * Math.exp(exponent);
  }

  /**
   * Normal Distribution CDF (cumulative)
   */
  normalCDF(x: number, mean: number = 0, stdDev: number = 1): number {
    const z = (x - mean) / stdDev;
    return 0.5 * (1 + this.erf(z / Math.sqrt(2)));
  }

  /**
   * Generate samples from normal distribution
   */
  normalSample(n: number, mean: number = 0, stdDev: number = 1): number[] {
    const samples: number[] = [];
    
    for (let i = 0; i < n; i++) {
      // Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      samples.push(mean + stdDev * z);
    }
    
    return samples;
  }

  /**
   * Student's t-test (one sample)
   */
  tTest(
    data: number[],
    populationMean: number,
    confidenceLevel: number = 0.95
  ): HypothesisTest {
    const n = data.length;
    const sampleMean = this.mean(data);
    const sampleStd = Math.sqrt(this.variance(data));
    
    // t-statistic
    const statistic = (sampleMean - populationMean) / (sampleStd / Math.sqrt(n));
    
    // Degrees of freedom
    const df = n - 1;
    
    // Critical value (two-tailed)
    const alpha = 1 - confidenceLevel;
    const criticalValue = this.tCritical(df, alpha / 2);
    
    // p-value (approximation)
    const pValue = 2 * (1 - this.tCDF(Math.abs(statistic), df));
    
    return {
      statistic,
      pValue,
      criticalValue,
      reject: Math.abs(statistic) > criticalValue,
      confidenceLevel,
    };
  }

  /**
   * Chi-square test for goodness of fit
   */
  chiSquareTest(
    observed: number[],
    expected: number[],
    confidenceLevel: number = 0.95
  ): HypothesisTest {
    const n = observed.length;
    
    // Chi-square statistic
    let statistic = 0;
    for (let i = 0; i < n; i++) {
      statistic += Math.pow(observed[i] - expected[i], 2) / expected[i];
    }
    
    const df = n - 1;
    const alpha = 1 - confidenceLevel;
    const criticalValue = this.chiSquareCritical(df, alpha);
    const pValue = 1 - this.chiSquareCDF(statistic, df);
    
    return {
      statistic,
      pValue,
      criticalValue,
      reject: statistic > criticalValue,
      confidenceLevel,
    };
  }

  /**
   * Linear regression (Ordinary Least Squares)
   */
  linearRegression(x: number[], y: number[]): RegressionResult {
    const n = x.length;
    const meanX = this.mean(x);
    const meanY = this.mean(y);
    
    // Calculate slope and intercept
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += Math.pow(x[i] - meanX, 2);
    }
    
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // Predictions and residuals
    const predictions = x.map(xi => slope * xi + intercept);
    const residuals = y.map((yi, i) => yi - predictions[i]);
    
    // R-squared
    const ssRes = residuals.reduce((sum, r) => sum + r * r, 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const rSquared = 1 - ssRes / ssTot;
    
    // Correlation coefficient
    const correlation = Math.sqrt(rSquared) * Math.sign(slope);
    
    return {
      slope,
      intercept,
      rSquared,
      correlation,
      residuals,
      predictions,
    };
  }

  /**
   * Multiple linear regression
   */
  multipleRegression(X: number[][], y: number[]): {
    coefficients: number[];
    rSquared: number;
    predictions: number[];
  } {
    const n = X.length;
    const p = X[0].length;
    
    // Add intercept column
    const Xb = X.map(row => [1, ...row]);
    
    // Normal equation: β = (X'X)^(-1)X'y
    const XtX = this.matrixMultiply(this.transpose(Xb), Xb);
    const Xty = this.matrixVectorMultiply(this.transpose(Xb), y);
    
    const coefficients = this.solveLinearSystem(XtX, Xty);
    
    // Predictions
    const predictions = Xb.map(row => 
      row.reduce((sum, x, i) => sum + x * coefficients[i], 0)
    );
    
    // R-squared
    const meanY = this.mean(y);
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const rSquared = 1 - ssRes / ssTot;
    
    return { coefficients, rSquared, predictions };
  }

  /**
   * Bayesian inference (simple)
   */
  bayesianInference(
    prior: number,
    likelihood: number,
    evidence: number
  ): BayesianResult {
    // Bayes' theorem: P(A|B) = P(B|A) * P(A) / P(B)
    const posterior = (likelihood * prior) / evidence;
    
    return { posterior, prior, likelihood, evidence };
  }

  /**
   * Confidence interval for mean
   */
  confidenceInterval(
    data: number[],
    confidence: number = 0.95
  ): ConfidenceInterval {
    const n = data.length;
    const mean = this.mean(data);
    const stdDev = Math.sqrt(this.variance(data));
    const stdError = stdDev / Math.sqrt(n);
    
    // t-critical value
    const alpha = 1 - confidence;
    const df = n - 1;
    const tCrit = this.tCritical(df, alpha / 2);
    
    const margin = tCrit * stdError;
    
    return {
      lower: mean - margin,
      upper: mean + margin,
      mean,
      confidence,
    };
  }

  /**
   * Binomial distribution
   */
  binomialPMF(k: number, n: number, p: number): number {
    return this.binomialCoefficient(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }

  /**
   * Poisson distribution
   */
  poissonPMF(k: number, lambda: number): number {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
  }

  /**
   * Exponential distribution
   */
  exponentialPDF(x: number, lambda: number): number {
    return x < 0 ? 0 : lambda * Math.exp(-lambda * x);
  }

  /**
   * Correlation coefficient (Pearson)
   */
  correlation(x: number[], y: number[]): number {
    const n = x.length;
    const meanX = this.mean(x);
    const meanY = this.mean(y);
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }
    
    return numerator / Math.sqrt(denomX * denomY);
  }

  /**
   * Covariance
   */
  covariance(x: number[], y: number[]): number {
    const n = x.length;
    const meanX = this.mean(x);
    const meanY = this.mean(y);
    
    return x.reduce((sum, xi, i) => {
      return sum + (xi - meanX) * (y[i] - meanY);
    }, 0) / (n - 1);
  }

  /**
   * Z-score normalization
   */
  zScore(data: number[]): number[] {
    const mean = this.mean(data);
    const stdDev = Math.sqrt(this.variance(data));
    return data.map(x => (x - mean) / stdDev);
  }

  /**
   * Percentile
   */
  percentile(data: number[], p: number): number {
    const sorted = [...data].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * ANOVA (Analysis of Variance)
   */
  anova(groups: number[][]): {
    fStatistic: number;
    pValue: number;
    betweenVariance: number;
    withinVariance: number;
  } {
    const k = groups.length;
    const n = groups.reduce((sum, g) => sum + g.length, 0);
    
    // Grand mean
    const allData = groups.flat();
    const grandMean = this.mean(allData);
    
    // Between-group variance
    let ssB = 0;
    for (const group of groups) {
      const groupMean = this.mean(group);
      ssB += group.length * Math.pow(groupMean - grandMean, 2);
    }
    const dfB = k - 1;
    const msB = ssB / dfB;
    
    // Within-group variance
    let ssW = 0;
    for (const group of groups) {
      const groupMean = this.mean(group);
      ssW += group.reduce((sum, x) => sum + Math.pow(x - groupMean, 2), 0);
    }
    const dfW = n - k;
    const msW = ssW / dfW;
    
    // F-statistic
    const fStatistic = msB / msW;
    const pValue = 1 - this.fCDF(fStatistic, dfB, dfW);
    
    return {
      fStatistic,
      pValue,
      betweenVariance: msB,
      withinVariance: msW,
    };
  }

  /**
   * Private helper methods
   */

  private mean(data: number[]): number {
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  private variance(data: number[]): number {
    const m = this.mean(data);
    return data.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / (data.length - 1);
  }

  private erf(x: number): number {
    // Approximation of error function
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }

  private tCritical(df: number, alpha: number): number {
    // Approximation for t-critical value
    return 1.96 + (2.5 / Math.sqrt(df)); // Simplified
  }

  private tCDF(t: number, df: number): number {
    // Approximation
    return 0.5 + 0.5 * this.erf(t / Math.sqrt(2));
  }

  private chiSquareCritical(df: number, alpha: number): number {
    // Approximation
    return df * Math.pow(1 - 2 / (9 * df) + 1.96 * Math.sqrt(2 / (9 * df)), 3);
  }

  private chiSquareCDF(x: number, df: number): number {
    // Simplified approximation
    return this.normalCDF(Math.sqrt(x) - Math.sqrt(df - 0.5), 0, 1);
  }

  private fCDF(f: number, df1: number, df2: number): number {
    // Very simplified approximation
    return 0.5 + 0.5 * this.erf(Math.sqrt(f) - 1);
  }

  private factorial(n: number): number {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  private binomialCoefficient(n: number, k: number): number {
    return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
  }

  private transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, i) => matrix.map(row => row[i]));
  }

  private matrixMultiply(A: number[][], B: number[][]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < A.length; i++) {
      result[i] = [];
      for (let j = 0; j < B[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < A[0].length; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  private matrixVectorMultiply(A: number[][], v: number[]): number[] {
    return A.map(row => row.reduce((sum, a, i) => sum + a * v[i], 0));
  }

  private solveLinearSystem(A: number[][], b: number[]): number[] {
    // Gaussian elimination (simplified)
    const n = A.length;
    const aug = A.map((row, i) => [...row, b[i]]);
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const factor = aug[j][i] / aug[i][i];
        for (let k = i; k <= n; k++) {
          aug[j][k] -= factor * aug[i][k];
        }
      }
    }
    
    // Back substitution
    const x: number[] = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = aug[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= aug[i][j] * x[j];
      }
      x[i] /= aug[i][i];
    }
    
    return x;
  }
}

