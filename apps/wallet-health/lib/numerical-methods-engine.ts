/**
 * Numerical Methods Engine
 * Newton-Raphson, Simpson integration, Runge-Kutta ODEs, LU/QR decomposition
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
}

export interface ODESolution {
  t: number[];
  y: number[][];
  steps: number;
}

export class NumericalMethodsEngine {
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

      if (Math.abs(dfx) < 1e-10) break;

      const xNew = x - fx / dfx;
      error = Math.abs(xNew - x);
      x = xNew;
      iterations++;
    }

    return { root: x, iterations, error, converged: error <= tolerance };
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

    if (f(left) * f(right) > 0) {
      throw new Error('Function must have different signs at interval endpoints');
    }

    while (Math.abs(right - left) > tolerance && iterations < maxIterations) {
      root = (left + right) / 2;
      const fRoot = f(root);

      if (Math.abs(fRoot) < tolerance) break;

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
   * Numerical differentiation (central difference)
   */
  differentiate(f: (x: number) => number, x: number, h: number = 1e-5): number {
    return (f(x + h) - f(x - h)) / (2 * h);
  }

  /**
   * Gradient (partial derivatives)
   */
  gradient(f: (x: number[]) => number, x: number[], h: number = 1e-5): number[] {
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
   * Simpson's rule for numerical integration
   */
  simpsonsIntegration(
    f: (x: number) => number,
    a: number,
    b: number,
    n: number = 1000
  ): IntegrationResult {
    if (n % 2 !== 0) n++;

    const h = (b - a) / n;
    let sum = f(a) + f(b);

    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      sum += f(x) * (i % 2 === 0 ? 2 : 4);
    }

    const value = (h / 3) * sum;
    const error = Math.abs(b - a) ** 5 / (180 * n ** 4);

    return { value, error, evaluations: n + 1 };
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
      for (let k = i; k < n; k++) {
        let sum = 0;
        for (let j = 0; j < i; j++) sum += L[i][j] * U[j][k];
        U[i][k] = A[i][k] - sum;
      }

      for (let k = i; k < n; k++) {
        if (i === k) {
          L[i][i] = 1;
        } else {
          let sum = 0;
          for (let j = 0; j < i; j++) sum += L[k][j] * U[j][i];
          L[k][i] = (A[k][i] - sum) / U[i][i];
        }
      }
    }

    return { L, U };
  }

  /**
   * Solve linear system Ax = b
   */
  solveLinearSystem(A: number[][], b: number[]): number[] {
    const { L, U } = this.luDecomposition(A);
    const n = A.length;

    // Forward substitution
    const y: number[] = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < i; j++) sum += L[i][j] * y[j];
      y[i] = b[i] - sum;
    }

    // Backward substitution
    const x: number[] = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) sum += U[i][j] * x[j];
      x[i] = (y[i] - sum) / U[i][i];
    }

    return x;
  }

  /**
   * Private helper methods
   */

  private vectorAdd(a: number[], b: number[]): number[] {
    return a.map((val, i) => val + b[i]);
  }

  private vectorScale(v: number[], scalar: number): number[] {
    return v.map((val) => val * scalar);
  }
}

