/**
 * Machine Learning Prediction Engine
 * Advanced ML algorithms for price prediction and pattern recognition
 */

export interface TrainingData {
  features: number[][];
  labels: number[];
}

export interface PredictionResult {
  predicted: number;
  confidence: number;
  featureImportance: Record<string, number>;
  model: string;
}

export interface NeuralNetworkConfig {
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
  learningRate: number;
  epochs: number;
  batchSize: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rmse: number;
  mae: number;
  r2: number;
}

export interface ClusterResult {
  clusters: number[][];
  centroids: number[][];
  inertia: number;
  silhouetteScore: number;
}

export class MLPredictionEngine {
  /**
   * Linear Regression using Gradient Descent
   */
  linearRegression(
    X: number[][],
    y: number[],
    learningRate: number = 0.01,
    iterations: number = 1000
  ): {
    weights: number[];
    bias: number;
    history: number[];
  } {
    const m = X.length; // Number of samples
    const n = X[0].length; // Number of features

    // Initialize parameters
    let weights = new Array(n).fill(0);
    let bias = 0;
    const history: number[] = [];

    // Gradient Descent
    for (let iter = 0; iter < iterations; iter++) {
      // Forward pass: predictions
      const predictions = X.map((xi) =>
        xi.reduce((sum, xij, j) => sum + xij * weights[j], 0) + bias
      );

      // Calculate cost (MSE)
      const cost =
        predictions.reduce((sum, pred, i) => sum + Math.pow(pred - y[i], 2), 0) /
        (2 * m);
      history.push(cost);

      // Backward pass: gradients
      const errors = predictions.map((pred, i) => pred - y[i]);

      // Update weights
      for (let j = 0; j < n; j++) {
        const gradient =
          X.reduce((sum, xi, i) => sum + errors[i] * xi[j], 0) / m;
        weights[j] -= learningRate * gradient;
      }

      // Update bias
      const biasGradient = errors.reduce((sum, e) => sum + e, 0) / m;
      bias -= learningRate * biasGradient;
    }

    return { weights, bias, history };
  }

  /**
   * Logistic Regression for binary classification
   */
  logisticRegression(
    X: number[][],
    y: number[],
    learningRate: number = 0.01,
    iterations: number = 1000
  ): {
    weights: number[];
    bias: number;
    accuracy: number;
  } {
    const m = X.length;
    const n = X[0].length;

    let weights = new Array(n).fill(0);
    let bias = 0;

    // Sigmoid function
    const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

    for (let iter = 0; iter < iterations; iter++) {
      // Forward pass
      const z = X.map((xi) =>
        xi.reduce((sum, xij, j) => sum + xij * weights[j], 0) + bias
      );
      const predictions = z.map(sigmoid);

      // Gradients
      const errors = predictions.map((pred, i) => pred - y[i]);

      // Update weights
      for (let j = 0; j < n; j++) {
        const gradient =
          X.reduce((sum, xi, i) => sum + errors[i] * xi[j], 0) / m;
        weights[j] -= learningRate * gradient;
      }

      // Update bias
      const biasGradient = errors.reduce((sum, e) => sum + e, 0) / m;
      bias -= learningRate * biasGradient;
    }

    // Calculate accuracy
    const finalPredictions = X.map((xi) => {
      const z = xi.reduce((sum, xij, j) => sum + xij * weights[j], 0) + bias;
      return sigmoid(z) >= 0.5 ? 1 : 0;
    });

    const correct = finalPredictions.filter((pred, i) => pred === y[i]).length;
    const accuracy = (correct / m) * 100;

    return { weights, bias, accuracy };
  }

  /**
   * K-Nearest Neighbors (KNN) for classification/regression
   */
  knn(
    trainX: number[][],
    trainY: number[],
    testX: number[][],
    k: number = 5
  ): number[] {
    const predictions: number[] = [];

    for (const testPoint of testX) {
      // Calculate distances to all training points
      const distances = trainX.map((trainPoint, i) => ({
        distance: this.euclideanDistance(testPoint, trainPoint),
        label: trainY[i],
      }));

      // Sort by distance and get k nearest
      distances.sort((a, b) => a.distance - b.distance);
      const kNearest = distances.slice(0, k);

      // Majority vote (classification) or average (regression)
      const prediction = this.isClassification(trainY)
        ? this.majorityVote(kNearest.map((n) => n.label))
        : this.average(kNearest.map((n) => n.label));

      predictions.push(prediction);
    }

    return predictions;
  }

  /**
   * Decision Tree for classification
   */
  decisionTree(
    X: number[][],
    y: number[],
    maxDepth: number = 5,
    minSamples: number = 2
  ): DecisionTreeNode {
    return this.buildTree(X, y, 0, maxDepth, minSamples);
  }

  /**
   * Random Forest ensemble
   */
  randomForest(
    X: number[][],
    y: number[],
    numTrees: number = 10,
    maxDepth: number = 5
  ): {
    trees: DecisionTreeNode[];
    predict: (testX: number[][]) => number[];
  } {
    const trees: DecisionTreeNode[] = [];

    // Build multiple trees on bootstrap samples
    for (let i = 0; i < numTrees; i++) {
      const { bootX, bootY } = this.bootstrap(X, y);
      const tree = this.buildTree(bootX, bootY, 0, maxDepth, 2);
      trees.push(tree);
    }

    // Prediction function
    const predict = (testX: number[][]): number[] => {
      return testX.map((xi) => {
        const treePredictions = trees.map((tree) =>
          this.predictTree(tree, xi)
        );
        return this.majorityVote(treePredictions);
      });
    };

    return { trees, predict };
  }

  /**
   * K-Means Clustering
   */
  kMeansClustering(
    X: number[][],
    k: number,
    maxIterations: number = 100
  ): ClusterResult {
    const m = X.length;
    const n = X[0].length;

    // Initialize centroids randomly
    let centroids = this.initializeCentroids(X, k);
    let assignments = new Array(m).fill(0);
    let prevAssignments: number[] = [];

    for (let iter = 0; iter < maxIterations; iter++) {
      // Assign points to nearest centroid
      assignments = X.map((xi) => {
        const distances = centroids.map((c) => this.euclideanDistance(xi, c));
        return distances.indexOf(Math.min(...distances));
      });

      // Check convergence
      if (
        JSON.stringify(assignments) === JSON.stringify(prevAssignments)
      ) {
        break;
      }
      prevAssignments = [...assignments];

      // Update centroids
      for (let cluster = 0; cluster < k; cluster++) {
        const clusterPoints = X.filter((_, i) => assignments[i] === cluster);
        if (clusterPoints.length > 0) {
          centroids[cluster] = this.calculateCentroid(clusterPoints);
        }
      }
    }

    // Calculate inertia (within-cluster sum of squares)
    let inertia = 0;
    for (let i = 0; i < m; i++) {
      inertia += Math.pow(
        this.euclideanDistance(X[i], centroids[assignments[i]]),
        2
      );
    }

    // Calculate silhouette score
    const silhouetteScore = this.calculateSilhouette(X, assignments, centroids);

    // Organize into clusters
    const clusters: number[][] = [];
    for (let cluster = 0; cluster < k; cluster++) {
      clusters.push(
        assignments
          .map((a, i) => (a === cluster ? i : -1))
          .filter((i) => i !== -1)
      );
    }

    return {
      clusters,
      centroids,
      inertia,
      silhouetteScore,
    };
  }

  /**
   * Principal Component Analysis (PCA) for dimensionality reduction
   */
  pca(X: number[][], numComponents: number): {
    transformed: number[][];
    components: number[][];
    explainedVariance: number[];
  } {
    const m = X.length;
    const n = X[0].length;

    // Center the data
    const means = this.calculateMeans(X);
    const centered = X.map((xi) => xi.map((xij, j) => xij - means[j]));

    // Calculate covariance matrix
    const covariance = this.calculateCovariance(centered);

    // Eigen decomposition (simplified - using power iteration)
    const { eigenvalues, eigenvectors } = this.eigenDecomposition(
      covariance,
      numComponents
    );

    // Project data onto principal components
    const transformed = centered.map((xi) =>
      eigenvectors.slice(0, numComponents).map((ev) => this.dotProduct(xi, ev))
    );

    // Calculate explained variance ratio
    const totalVariance = eigenvalues.reduce((a, b) => a + b, 0);
    const explainedVariance = eigenvalues.map((ev) => ev / totalVariance);

    return {
      transformed,
      components: eigenvectors.slice(0, numComponents),
      explainedVariance: explainedVariance.slice(0, numComponents),
    };
  }

  /**
   * Naive Bayes Classifier
   */
  naiveBayes(trainX: number[][], trainY: number[], testX: number[][]): {
    predictions: number[];
    probabilities: number[][];
  } {
    // Get unique classes
    const classes = Array.from(new Set(trainY));

    // Calculate class priors
    const priors: Record<number, number> = {};
    for (const c of classes) {
      priors[c] = trainY.filter((y) => y === c).length / trainY.length;
    }

    // Calculate feature statistics for each class
    const stats: Record<
      number,
      { means: number[]; stds: number[] }
    > = {};

    for (const c of classes) {
      const classData = trainX.filter((_, i) => trainY[i] === c);
      stats[c] = {
        means: this.calculateMeans(classData),
        stds: this.calculateStds(classData),
      };
    }

    // Make predictions
    const predictions: number[] = [];
    const probabilities: number[][] = [];

    for (const xi of testX) {
      const classProbabilities: Record<number, number> = {};

      for (const c of classes) {
        // Calculate likelihood using Gaussian PDF
        let likelihood = 1;
        for (let j = 0; j < xi.length; j++) {
          const mean = stats[c].means[j];
          const std = stats[c].stds[j] || 0.01; // Avoid division by zero
          likelihood *= this.gaussianPDF(xi[j], mean, std);
        }

        // Posterior = Prior * Likelihood
        classProbabilities[c] = priors[c] * likelihood;
      }

      // Normalize probabilities
      const total = Object.values(classProbabilities).reduce(
        (a, b) => a + b,
        0
      );
      const normalizedProbs = classes.map(
        (c) => classProbabilities[c] / total
      );

      // Get prediction (class with highest probability)
      const maxProb = Math.max(...Object.values(classProbabilities));
      const prediction = classes.find(
        (c) => classProbabilities[c] === maxProb
      )!;

      predictions.push(prediction);
      probabilities.push(normalizedProbs);
    }

    return { predictions, probabilities };
  }

  /**
   * Support Vector Machine (simplified linear SVM)
   */
  svm(
    X: number[][],
    y: number[],
    learningRate: number = 0.001,
    lambda: number = 0.01,
    epochs: number = 1000
  ): {
    weights: number[];
    bias: number;
    accuracy: number;
  } {
    const m = X.length;
    const n = X[0].length;

    let weights = new Array(n).fill(0);
    let bias = 0;

    // Convert labels to -1 and 1
    const yBinary = y.map((yi) => (yi === 0 ? -1 : 1));

    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < m; i++) {
        const xi = X[i];
        const yi = yBinary[i];

        // Calculate decision value
        const decision =
          xi.reduce((sum, xij, j) => sum + xij * weights[j], 0) + bias;

        // Update if misclassified or within margin
        if (yi * decision < 1) {
          // Hinge loss gradient
          for (let j = 0; j < n; j++) {
            weights[j] = weights[j] + learningRate * (yi * xi[j] - 2 * lambda * weights[j]);
          }
          bias = bias + learningRate * yi;
        } else {
          // Regularization only
          for (let j = 0; j < n; j++) {
            weights[j] = weights[j] + learningRate * (-2 * lambda * weights[j]);
          }
        }
      }
    }

    // Calculate accuracy
    const predictions = X.map((xi) => {
      const decision =
        xi.reduce((sum, xij, j) => sum + xij * weights[j], 0) + bias;
      return decision >= 0 ? 1 : 0;
    });

    const correct = predictions.filter((pred, i) => pred === y[i]).length;
    const accuracy = (correct / m) * 100;

    return { weights, bias, accuracy };
  }

  /**
   * Calculate model evaluation metrics
   */
  calculateMetrics(actual: number[], predicted: number[]): ModelMetrics {
    const n = actual.length;

    // Classification metrics
    let tp = 0,
      fp = 0,
      tn = 0,
      fn = 0;

    for (let i = 0; i < n; i++) {
      if (actual[i] === 1 && predicted[i] === 1) tp++;
      if (actual[i] === 0 && predicted[i] === 1) fp++;
      if (actual[i] === 0 && predicted[i] === 0) tn++;
      if (actual[i] === 1 && predicted[i] === 0) fn++;
    }

    const accuracy = ((tp + tn) / n) * 100;
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1Score = (2 * precision * recall) / (precision + recall) || 0;

    // Regression metrics
    const errors = actual.map((a, i) => a - predicted[i]);
    const rmse = Math.sqrt(
      errors.reduce((sum, e) => sum + e * e, 0) / n
    );
    const mae = errors.reduce((sum, e) => sum + Math.abs(e), 0) / n;

    const mean = actual.reduce((a, b) => a + b, 0) / n;
    const ssTotal = actual.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0);
    const ssResidual = errors.reduce((sum, e) => sum + e * e, 0);
    const r2 = 1 - ssResidual / ssTotal;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      rmse,
      mae,
      r2,
    };
  }

  /**
   * Private helper methods
   */

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, ai, i) => sum + Math.pow(ai - b[i], 2), 0)
    );
  }

  private isClassification(y: number[]): boolean {
    const unique = new Set(y);
    return unique.size < y.length * 0.1; // Heuristic
  }

  private majorityVote(values: number[]): number {
    const counts: Record<number, number> = {};
    for (const v of values) {
      counts[v] = (counts[v] || 0) + 1;
    }
    return Number(
      Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
    );
  }

  private average(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private buildTree(
    X: number[][],
    y: number[],
    depth: number,
    maxDepth: number,
    minSamples: number
  ): DecisionTreeNode {
    // Stopping criteria
    if (depth >= maxDepth || X.length < minSamples || new Set(y).size === 1) {
      return { isLeaf: true, value: this.majorityVote(y) };
    }

    // Find best split
    const { feature, threshold } = this.findBestSplit(X, y);

    if (feature === -1) {
      return { isLeaf: true, value: this.majorityVote(y) };
    }

    // Split data
    const leftIndices: number[] = [];
    const rightIndices: number[] = [];

    for (let i = 0; i < X.length; i++) {
      if (X[i][feature] <= threshold) {
        leftIndices.push(i);
      } else {
        rightIndices.push(i);
      }
    }

    const leftX = leftIndices.map((i) => X[i]);
    const leftY = leftIndices.map((i) => y[i]);
    const rightX = rightIndices.map((i) => X[i]);
    const rightY = rightIndices.map((i) => y[i]);

    // Recursively build subtrees
    return {
      isLeaf: false,
      feature,
      threshold,
      left: this.buildTree(leftX, leftY, depth + 1, maxDepth, minSamples),
      right: this.buildTree(rightX, rightY, depth + 1, maxDepth, minSamples),
    };
  }

  private findBestSplit(
    X: number[][],
    y: number[]
  ): { feature: number; threshold: number } {
    let bestGini = Infinity;
    let bestFeature = -1;
    let bestThreshold = 0;

    const numFeatures = X[0].length;

    for (let feature = 0; feature < numFeatures; feature++) {
      const values = X.map((xi) => xi[feature]);
      const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);

      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;

        const leftY = y.filter((_, j) => X[j][feature] <= threshold);
        const rightY = y.filter((_, j) => X[j][feature] > threshold);

        if (leftY.length === 0 || rightY.length === 0) continue;

        const gini =
          (leftY.length / y.length) * this.giniImpurity(leftY) +
          (rightY.length / y.length) * this.giniImpurity(rightY);

        if (gini < bestGini) {
          bestGini = gini;
          bestFeature = feature;
          bestThreshold = threshold;
        }
      }
    }

    return { feature: bestFeature, threshold: bestThreshold };
  }

  private giniImpurity(y: number[]): number {
    const counts: Record<number, number> = {};
    for (const yi of y) {
      counts[yi] = (counts[yi] || 0) + 1;
    }

    let gini = 1;
    for (const count of Object.values(counts)) {
      const prob = count / y.length;
      gini -= prob * prob;
    }

    return gini;
  }

  private predictTree(tree: DecisionTreeNode, x: number[]): number {
    if (tree.isLeaf) {
      return tree.value!;
    }

    if (x[tree.feature!] <= tree.threshold!) {
      return this.predictTree(tree.left!, x);
    } else {
      return this.predictTree(tree.right!, x);
    }
  }

  private bootstrap(
    X: number[][],
    y: number[]
  ): { bootX: number[][]; bootY: number[] } {
    const m = X.length;
    const bootX: number[][] = [];
    const bootY: number[] = [];

    for (let i = 0; i < m; i++) {
      const idx = Math.floor(Math.random() * m);
      bootX.push(X[idx]);
      bootY.push(y[idx]);
    }

    return { bootX, bootY };
  }

  private initializeCentroids(X: number[][], k: number): number[][] {
    const centroids: number[][] = [];
    const used = new Set<number>();

    while (centroids.length < k) {
      const idx = Math.floor(Math.random() * X.length);
      if (!used.has(idx)) {
        centroids.push([...X[idx]]);
        used.add(idx);
      }
    }

    return centroids;
  }

  private calculateCentroid(points: number[][]): number[] {
    const n = points[0].length;
    const centroid = new Array(n).fill(0);

    for (const point of points) {
      for (let j = 0; j < n; j++) {
        centroid[j] += point[j];
      }
    }

    return centroid.map((c) => c / points.length);
  }

  private calculateSilhouette(
    X: number[][],
    assignments: number[],
    centroids: number[][]
  ): number {
    // Simplified silhouette score
    let totalScore = 0;

    for (let i = 0; i < X.length; i++) {
      const cluster = assignments[i];
      const a = this.euclideanDistance(X[i], centroids[cluster]);

      // Find nearest other cluster
      let b = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        if (c !== cluster) {
          const dist = this.euclideanDistance(X[i], centroids[c]);
          b = Math.min(b, dist);
        }
      }

      totalScore += (b - a) / Math.max(a, b);
    }

    return totalScore / X.length;
  }

  private calculateMeans(X: number[][]): number[] {
    const m = X.length;
    const n = X[0].length;
    const means = new Array(n).fill(0);

    for (const xi of X) {
      for (let j = 0; j < n; j++) {
        means[j] += xi[j];
      }
    }

    return means.map((mean) => mean / m);
  }

  private calculateStds(X: number[][]): number[] {
    const means = this.calculateMeans(X);
    const m = X.length;
    const n = X[0].length;
    const variances = new Array(n).fill(0);

    for (const xi of X) {
      for (let j = 0; j < n; j++) {
        variances[j] += Math.pow(xi[j] - means[j], 2);
      }
    }

    return variances.map((v) => Math.sqrt(v / m));
  }

  private calculateCovariance(X: number[][]): number[][] {
    const m = X.length;
    const n = X[0].length;
    const cov: number[][] = [];

    for (let i = 0; i < n; i++) {
      cov[i] = [];
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < m; k++) {
          sum += X[k][i] * X[k][j];
        }
        cov[i][j] = sum / m;
      }
    }

    return cov;
  }

  private eigenDecomposition(
    matrix: number[][],
    numComponents: number
  ): { eigenvalues: number[]; eigenvectors: number[][] } {
    // Simplified power iteration method
    const n = matrix.length;
    const eigenvalues: number[] = [];
    const eigenvectors: number[][] = [];

    for (let comp = 0; comp < numComponents; comp++) {
      let v = Array.from({ length: n }, () => Math.random());

      // Power iteration
      for (let iter = 0; iter < 100; iter++) {
        const Av = this.matrixVectorMultiply(matrix, v);
        const norm = Math.sqrt(Av.reduce((sum, x) => sum + x * x, 0));
        v = Av.map((x) => x / norm);
      }

      const eigenvalue = this.dotProduct(
        v,
        this.matrixVectorMultiply(matrix, v)
      );
      eigenvalues.push(eigenvalue);
      eigenvectors.push(v);

      // Deflate matrix for next eigenvector
      matrix = this.deflateMatrix(matrix, v, eigenvalue);
    }

    return { eigenvalues, eigenvectors };
  }

  private matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map((row) => this.dotProduct(row, vector));
  }

  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  }

  private deflateMatrix(
    matrix: number[][],
    eigenvector: number[],
    eigenvalue: number
  ): number[][] {
    const n = matrix.length;
    const deflated: number[][] = [];

    for (let i = 0; i < n; i++) {
      deflated[i] = [];
      for (let j = 0; j < n; j++) {
        deflated[i][j] =
          matrix[i][j] - eigenvalue * eigenvector[i] * eigenvector[j];
      }
    }

    return deflated;
  }

  private gaussianPDF(x: number, mean: number, std: number): number {
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(std, 2));
    return (
      (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent)
    );
  }
}

interface DecisionTreeNode {
  isLeaf: boolean;
  value?: number;
  feature?: number;
  threshold?: number;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
}

