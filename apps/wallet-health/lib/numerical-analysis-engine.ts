/**
 * Numerical Analysis & Advanced Mathematics Engine
 * Root finding, integration, differentiation, linear algebra, and differential equations
 */

export interface RootFindingResult {
  root: number;
  iterations: number;
  error: number;
  converged: boolean;
}

export interface IntegrationResult {
  value: number;
  error: number;
  evaluations: number;
  method: string;
}

export interface ODESolution {
  t: number[];
  y: number[][];
  steps: number;
}

export interface Matrix {
  data: number[][];
  rows: number;
  cols: number;
}

export interface EigenDecomposition {
  eigenvalues: number[];
  eigenvectors: number[][];
  iterations: number;
}

export interface SVDResult {
  U: number[][];
  S: number[];
  Vt: number[][];
}

export class NumericalAnalysisEngine {
  /**
   * Newton-Raphson method for root finding
   */
  newtonRaphson(
    f: (x: number) => number,
    df: (x: number) => number,
    x0: number,
    tolerance: number = 1e-6,
    maxIterations: number = 100
  ): RootFindingResult {
    let x = x0;
    let error = Infinity;
    let iterations = 0;

    while (error > tolerance && iterations < maxIterations) {
      const fx = f(x);
      const dfx = df(x);

      if (Math.abs(dfx) < 1e-10) {
        break; // Derivative too small
      }

      const xNew = x - fx / dfx;
      error = Math.abs(xNew - x);
      x = xNew;
      iterations++;
    }

    return {
      root: x,
      iterations,
      error,
      converged: error <= tolerance,
    };
  }

  /**
   * Bisection method for root finding
   */
  bisection(
    f: (x: number) => number,
    a: number,
    b: number,
    tolerance: number = 1e-6,
    maxIterations: number = 100
  ): RootFindingResult {
    let left = a;
    let right = b;
    let iterations = 0;
    let root = (left + right) / 2;

    // Check initial conditions
    if (f(left) * f(right) > 0) {
      throw new Error('Function must have different signs at interval endpoints');
    }

    while (Math.abs(right - left) > tolerance && iterations < maxIterations) {
      root = (left + right) / 2;
      const fRoot = f(root);

      if (Math.abs(fRoot) < tolerance) {
        break;
      }

      if (f(left) * fRoot < 0) {
        right = root;
      } else {
        left = root;
      }

      iterations++;
    }

    return {
      root,
      iterations,
      error: Math.abs(right - left),
      converged: Math.abs(right - left) <= tolerance,
    };
  }

  /**
   * Secant method for root finding
   */
  secant(
    f: (x: number) => number,
    x0: number,
    x1: number,
    tolerance: number = 1e-6,
    maxIterations: number = 100
  ): RootFindingResult {
    let xPrev = x0;
    let xCurr = x1;
    let iterations = 0;
    let error = Infinity;

    while (error > tolerance && iterations < maxIterations) {
      const fPrev = f(xPrev);
      const fCurr = f(xCurr);

      if (Math.abs(fCurr - fPrev) < 1e-10) {
        break; // Division by zero
      }

      const xNew = xCurr - (fCurr * (xCurr - xPrev)) / (fCurr - fPrev);
      error = Math.abs(xNew - xCurr);

      xPrev = xCurr;
      xCurr = xNew;
      iterations++;
    }

    return {
      root: xCurr,
      iterations,
      error,
      converged: error <= tolerance,
    };
  }

  /**
   * Numerical differentiation (central difference)
   */
  differentiate(
    f: (x: number) => number,
    x: number,
    h: number = 1e-5
  ): number {
    // Central difference: f'(x) ≈ [f(x+h) - f(x-h)] / (2h)
    return (f(x + h) - f(x - h)) / (2 * h);
  }

  /**
   * Second derivative
   */
  secondDerivative(
    f: (x: number) => number,
    x: number,
    h: number = 1e-5
  ): number {
    // f''(x) ≈ [f(x+h) - 2f(x) + f(x-h)] / h²
    return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
  }

  /**
   * Gradient (partial derivatives)
   */
  gradient(
    f: (x: number[]) => number,
    x: number[],
    h: number = 1e-5
  ): number[] {
    const grad: number[] = [];

    for (let i = 0; i < x.length; i++) {
      const xPlus = [...x];
      const xMinus = [...x];
      xPlus[i] += h;
      xMinus[i] -= h;

      grad.push((f(xPlus) - f(xMinus)) / (2 * h));
    }

    return grad;
  }

  /**
   * Trapezoidal rule for numerical integration
   */
  trapezoidalIntegration(
    f: (x: number) => number,
    a: number,
    b: number,
    n: number = 1000
  ): IntegrationResult {
    const h = (b - a) / n;
    let sum = (f(a) + f(b)) / 2;

    for (let i = 1; i < n; i++) {
      sum += f(a + i * h);
    }

    const value = h * sum;

    // Error estimate (simplified)
    const error = Math.abs(b - a) ** 3 / (12 * n * n);

    return {
      value,
      error,
      evaluations: n + 1,
      method: 'Trapezoidal',
    };
  }

  /**
   * Simpson's rule for numerical integration
   */
  simpsonsIntegration(
    f: (x: number) => number,
    a: number,
    b: number,
    n: number = 1000
  ): IntegrationResult {
    // n must be even
    if (n % 2 !== 0) n++;

    const h = (b - a) / n;
    let sum = f(a) + f(b);

    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      sum += f(x) * (i % 2 === 0 ? 2 : 4);
    }

    const value = (h / 3) * sum;

    // Error estimate
    const error = Math.abs(b - a) ** 5 / (180 * n ** 4);

    return {
      value,
      error,
      evaluations: n + 1,
      method: 'Simpson',
    };
  }

  /**
   * Adaptive Quadrature (recursive Simpson's)
   */
  adaptiveQuadrature(
    f: (x: number) => number,
    a: number,
    b: number,
    tolerance: number = 1e-6,
    maxDepth: number = 10
  ): IntegrationResult {
    let evaluations = 0;

    const adaptiveHelper = (
      left: number,
      right: number,
      depth: number
    ): number => {
      const mid = (left + right) / 2;
      
      const whole = this.simpsonsIntegration(f, left, right, 2);
      const leftHalf = this.simpsonsIntegration(f, left, mid, 2);
      const rightHalf = this.simpsonsIntegration(f, mid, right, 2);
      
      evaluations += whole.evaluations + leftHalf.evaluations + rightHalf.evaluations;

      const error = Math.abs(whole.value - leftHalf.value - rightHalf.value);

      if (error < tolerance || depth >= maxDepth) {
        return leftHalf.value + rightHalf.value;
      }

      return (
        adaptiveHelper(left, mid, depth + 1) +
        adaptiveHelper(mid, right, depth + 1)
      );
    };

    const value = adaptiveHelper(a, b, 0);

    return {
      value,
      error: tolerance,
      evaluations,
      method: 'Adaptive Simpson',
    };
  }

  /**
   * Runge-Kutta 4th order method for ODEs
   */
  rungeKutta4(
    f: (t: number, y: number[]) => number[],
    y0: number[],
    t0: number,
    tf: number,
    steps: number
  ): ODESolution {
    const h = (tf - t0) / steps;
    const t: number[] = [t0];
    const y: number[][] = [y0];

    let yCurr = [...y0];
    let tCurr = t0;

    for (let i = 0; i < steps; i++) {
      const k1 = f(tCurr, yCurr);
      const k2 = f(tCurr + h / 2, this.vectorAdd(yCurr, this.vectorScale(k1, h / 2)));
      const k3 = f(tCurr + h / 2, this.vectorAdd(yCurr, this.vectorScale(k2, h / 2)));
      const k4 = f(tCurr + h, this.vectorAdd(yCurr, this.vectorScale(k3, h)));

      // y_{n+1} = y_n + h/6 * (k1 + 2k2 + 2k3 + k4)
      const increment = this.vectorScale(
        this.vectorAdd(
          this.vectorAdd(k1, this.vectorScale(k2, 2)),
          this.vectorAdd(this.vectorScale(k3, 2), k4)
        ),
        h / 6
      );

      yCurr = this.vectorAdd(yCurr, increment);
      tCurr += h;

      t.push(tCurr);
      y.push([...yCurr]);
    }

    return { t, y, steps };
  }

  /**
   * Euler method for ODEs (simpler, less accurate)
   */
  eulerMethod(
    f: (t: number, y: number[]) => number[],
    y0: number[],
    t0: number,
    tf: number,
    steps: number
  ): ODESolution {
    const h = (tf - t0) / steps;
    const t: number[] = [t0];
    const y: number[][] = [y0];

    let yCurr = [...y0];
    let tCurr = t0;

    for (let i = 0; i < steps; i++) {
      const dy = f(tCurr, yCurr);
      yCurr = this.vectorAdd(yCurr, this.vectorScale(dy, h));
      tCurr += h;

      t.push(tCurr);
      y.push([...yCurr]);
    }

    return { t, y, steps };
  }

  /**
   * Matrix multiplication
   */
  matrixMultiply(A: number[][], B: number[][]): number[][] {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;

    const result: number[][] = Array(rowsA)
      .fill(0)
      .map(() => Array(colsB).fill(0));

    for (let i = 0; i < rowsA; i++) {
      for (let j = 0; j < colsB; j++) {
        for (let k = 0; k < colsA; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }

    return result;
  }

  /**
   * Matrix transpose
   */
  transpose(A: number[][]): number[][] {
    const rows = A.length;
    const cols = A[0].length;

    return Array(cols)
      .fill(0)
      .map((_, i) => Array(rows).fill(0).map((_, j) => A[j][i]));
  }

  /**
   * LU Decomposition for solving linear systems
   */
  luDecomposition(A: number[][]): { L: number[][]; U: number[][] } {
    const n = A.length;
    const L: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));
    const U: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      // Upper triangular
      for (let k = i; k < n; k++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
          sum += L[i][j] * U[j][k];
        }
        U[i][k] = A[i][k] - sum;
      }

      // Lower triangular
      for (let k = i; k < n; k++) {
        if (i === k) {
          L[i][i] = 1;
        } else {
          let sum = 0;
          for (let j = 0; j < i; j++) {
            sum += L[k][j] * U[j][i];
          }
          L[k][i] = (A[k][i] - sum) / U[i][i];
        }
      }
    }

    return { L, U };
  }

  /**
   * Solve linear system Ax = b using LU decomposition
   */
  solveLinearSystem(A: number[][], b: number[]): number[] {
    const { L, U } = this.luDecomposition(A);
    const n = A.length;

    // Forward substitution: Ly = b
    const y: number[] = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < i; j++) {
        sum += L[i][j] * y[j];
      }
      y[i] = b[i] - sum;
    }

    // Backward substitution: Ux = y
    const x: number[] = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += U[i][j] * x[j];
      }
      x[i] = (y[i] - sum) / U[i][i];
    }

    return x;
  }

  /**
   * QR Decomposition using Gram-Schmidt
   */
  qrDecomposition(A: number[][]): { Q: number[][]; R: number[][] } {
    const m = A.length;
    const n = A[0].length;

    const Q: number[][] = Array(m)
      .fill(0)
      .map(() => Array(n).fill(0));
    const R: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    for (let j = 0; j < n; j++) {
      // Get column j
      let v = A.map((row) => row[j]);

      // Orthogonalize
      for (let i = 0; i < j; i++) {
        const q = Q.map((row) => row[i]);
        const proj = this.dotProduct(q, v);
        R[i][j] = proj;
        v = this.vectorSubtract(v, this.vectorScale(q, proj));
      }

      // Normalize
      const norm = this.vectorNorm(v);
      R[j][j] = norm;

      if (norm > 1e-10) {
        const qj = this.vectorScale(v, 1 / norm);
        for (let i = 0; i < m; i++) {
          Q[i][j] = qj[i];
        }
      }
    }

    return { Q, R };
  }

  /**
   * Power iteration for finding dominant eigenvalue
   */
  powerIteration(
    A: number[][],
    maxIterations: number = 1000,
    tolerance: number = 1e-6
  ): { eigenvalue: number; eigenvector: number[]; iterations: number } {
    const n = A.length;
    let v = Array(n)
      .fill(0)
      .map(() => Math.random());

    // Normalize
    v = this.vectorScale(v, 1 / this.vectorNorm(v));

    let eigenvalue = 0;
    let prevEigenvalue = Infinity;
    let iterations = 0;

    while (
      Math.abs(eigenvalue - prevEigenvalue) > tolerance &&
      iterations < maxIterations
    ) {
      // Multiply A * v
      const Av = A.map((row) => this.dotProduct(row, v));

      // Rayleigh quotient: eigenvalue = v^T * A * v
      prevEigenvalue = eigenvalue;
      eigenvalue = this.dotProduct(v, Av);

      // Normalize
      const norm = this.vectorNorm(Av);
      v = this.vectorScale(Av, 1 / norm);

      iterations++;
    }

    return {
      eigenvalue,
      eigenvector: v,
      iterations,
    };
  }

  /**
   * Cholesky decomposition for positive definite matrices
   */
  choleskyDecomposition(A: number[][]): number[][] {
    const n = A.length;
    const L: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = 0;

        if (j === i) {
          for (let k = 0; k < j; k++) {
            sum += L[j][k] * L[j][k];
          }
          L[j][j] = Math.sqrt(A[j][j] - sum);
        } else {
          for (let k = 0; k < j; k++) {
            sum += L[i][k] * L[j][k];
          }
          L[i][j] = (A[i][j] - sum) / L[j][j];
        }
      }
    }

    return L;
  }

  /**
   * Determinant using LU decomposition
   */
  determinant(A: number[][]): number {
    const { L, U } = this.luDecomposition(A);
    
    // det(A) = det(L) * det(U) = 1 * prod(diag(U))
    let det = 1;
    for (let i = 0; i < U.length; i++) {
      det *= U[i][i];
    }

    return det;
  }

  /**
   * Matrix inverse using Gauss-Jordan elimination
   */
  inverse(A: number[][]): number[][] {
    const n = A.length;
    
    // Augment A with identity matrix
    const augmented = A.map((row, i) => [
      ...row,
      ...Array(n)
        .fill(0)
        .map((_, j) => (i === j ? 1 : 0)),
    ]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Make diagonal 1
      const pivot = augmented[i][i];
      if (Math.abs(pivot) < 1e-10) {
        throw new Error('Matrix is singular');
      }

      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }

      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }

    // Extract inverse from augmented matrix
    return augmented.map((row) => row.slice(n));
  }

  /**
   * Private helper methods
   */

  private vectorAdd(a: number[], b: number[]): number[] {
    return a.map((val, i) => val + b[i]);
  }

  private vectorSubtract(a: number[], b: number[]): number[] {
    return a.map((val, i) => val - b[i]);
  }

  private vectorScale(v: number[], scalar: number): number[] {
    return v.map((val) => val * scalar);
  }

  private vectorNorm(v: number[]): number {
    return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
  }

  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }
}

