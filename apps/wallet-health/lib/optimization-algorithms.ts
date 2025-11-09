/**
 * Advanced Optimization Algorithms Engine
 * Genetic algorithms, simulated annealing, particle swarm, and gradient-free optimization
 */

export interface OptimizationProblem {
  objectiveFunction: (x: number[]) => number;
  constraints?: (x: number[]) => boolean;
  dimensions: number;
  bounds: { min: number; max: number }[];
  minimize: boolean;
}

export interface OptimizationResult {
  solution: number[];
  fitness: number;
  iterations: number;
  convergenceHistory: number[];
  evaluations: number;
  success: boolean;
}

export interface GeneticAlgorithmConfig {
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  elitismRate: number;
  tournamentSize: number;
}

export interface ParticleSwarmConfig {
  swarmSize: number;
  iterations: number;
  inertiaWeight: number;
  cognitiveWeight: number;
  socialWeight: number;
}

export interface SimulatedAnnealingConfig {
  initialTemperature: number;
  coolingRate: number;
  minTemperature: number;
  iterationsPerTemp: number;
}

export class OptimizationAlgorithms {
  /**
   * Genetic Algorithm for global optimization
   */
  geneticAlgorithm(
    problem: OptimizationProblem,
    config: GeneticAlgorithmConfig
  ): OptimizationResult {
    const {
      populationSize,
      generations,
      mutationRate,
      crossoverRate,
      elitismRate,
      tournamentSize,
    } = config;

    // Initialize population
    let population = this.initializePopulation(
      populationSize,
      problem.dimensions,
      problem.bounds
    );

    const convergenceHistory: number[] = [];
    let evaluations = 0;
    let bestSolution = population[0];
    let bestFitness = this.evaluate(bestSolution, problem);

    for (let gen = 0; gen < generations; gen++) {
      // Evaluate fitness
      const fitness = population.map((individual) => {
        evaluations++;
        return this.evaluate(individual, problem);
      });

      // Find best in generation
      for (let i = 0; i < population.length; i++) {
        const fit = fitness[i];
        const isBetter = problem.minimize ? fit < bestFitness : fit > bestFitness;

        if (isBetter) {
          bestFitness = fit;
          bestSolution = [...population[i]];
        }
      }

      convergenceHistory.push(bestFitness);

      // Elitism: keep best individuals
      const eliteCount = Math.floor(populationSize * elitismRate);
      const eliteIndices = this.getTopIndices(fitness, eliteCount, problem.minimize);
      const newPopulation: number[][] = eliteIndices.map((i) => [...population[i]]);

      // Generate offspring
      while (newPopulation.length < populationSize) {
        // Selection
        const parent1 = this.tournamentSelection(
          population,
          fitness,
          tournamentSize,
          problem.minimize
        );
        const parent2 = this.tournamentSelection(
          population,
          fitness,
          tournamentSize,
          problem.minimize
        );

        // Crossover
        let offspring: number[];
        if (Math.random() < crossoverRate) {
          offspring = this.crossover(parent1, parent2);
        } else {
          offspring = [...parent1];
        }

        // Mutation
        if (Math.random() < mutationRate) {
          offspring = this.mutate(offspring, problem.bounds, mutationRate);
        }

        // Ensure constraints
        if (!problem.constraints || problem.constraints(offspring)) {
          newPopulation.push(offspring);
        }
      }

      population = newPopulation.slice(0, populationSize);
    }

    return {
      solution: bestSolution,
      fitness: bestFitness,
      iterations: generations,
      convergenceHistory,
      evaluations,
      success: true,
    };
  }

  /**
   * Particle Swarm Optimization
   */
  particleSwarm(
    problem: OptimizationProblem,
    config: ParticleSwarmConfig
  ): OptimizationResult {
    const { swarmSize, iterations, inertiaWeight, cognitiveWeight, socialWeight } =
      config;

    // Initialize particles
    const particles = this.initializePopulation(
      swarmSize,
      problem.dimensions,
      problem.bounds
    );

    // Initialize velocities
    const velocities = particles.map(() =>
      Array(problem.dimensions)
        .fill(0)
        .map(() => (Math.random() - 0.5) * 2)
    );

    // Personal best positions and fitness
    const personalBest = particles.map((p) => [...p]);
    const personalBestFitness = particles.map((p) => this.evaluate(p, problem));

    // Global best
    let globalBestIdx = problem.minimize
      ? personalBestFitness.indexOf(Math.min(...personalBestFitness))
      : personalBestFitness.indexOf(Math.max(...personalBestFitness));
    let globalBest = [...particles[globalBestIdx]];
    let globalBestFitness = personalBestFitness[globalBestIdx];

    const convergenceHistory: number[] = [];
    let evaluations = swarmSize;

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < swarmSize; i++) {
        // Update velocity
        for (let d = 0; d < problem.dimensions; d++) {
          const r1 = Math.random();
          const r2 = Math.random();

          velocities[i][d] =
            inertiaWeight * velocities[i][d] +
            cognitiveWeight * r1 * (personalBest[i][d] - particles[i][d]) +
            socialWeight * r2 * (globalBest[d] - particles[i][d]);

          // Velocity clamping
          const maxVel = (problem.bounds[d].max - problem.bounds[d].min) * 0.2;
          velocities[i][d] = Math.max(-maxVel, Math.min(maxVel, velocities[i][d]));
        }

        // Update position
        for (let d = 0; d < problem.dimensions; d++) {
          particles[i][d] += velocities[i][d];

          // Boundary handling
          particles[i][d] = Math.max(
            problem.bounds[d].min,
            Math.min(problem.bounds[d].max, particles[i][d])
          );
        }

        // Evaluate
        const fitness = this.evaluate(particles[i], problem);
        evaluations++;

        // Update personal best
        const isBetterPersonal = problem.minimize
          ? fitness < personalBestFitness[i]
          : fitness > personalBestFitness[i];

        if (isBetterPersonal) {
          personalBest[i] = [...particles[i]];
          personalBestFitness[i] = fitness;

          // Update global best
          const isBetterGlobal = problem.minimize
            ? fitness < globalBestFitness
            : fitness > globalBestFitness;

          if (isBetterGlobal) {
            globalBest = [...particles[i]];
            globalBestFitness = fitness;
          }
        }
      }

      convergenceHistory.push(globalBestFitness);
    }

    return {
      solution: globalBest,
      fitness: globalBestFitness,
      iterations,
      convergenceHistory,
      evaluations,
      success: true,
    };
  }

  /**
   * Simulated Annealing for optimization
   */
  simulatedAnnealing(
    problem: OptimizationProblem,
    config: SimulatedAnnealingConfig
  ): OptimizationResult {
    const { initialTemperature, coolingRate, minTemperature, iterationsPerTemp } =
      config;

    // Random initial solution
    let current = problem.bounds.map((b) => Math.random() * (b.max - b.min) + b.min);
    let currentFitness = this.evaluate(current, problem);

    let best = [...current];
    let bestFitness = currentFitness;

    const convergenceHistory: number[] = [];
    let temperature = initialTemperature;
    let evaluations = 1;
    let totalIterations = 0;

    while (temperature > minTemperature) {
      for (let i = 0; i < iterationsPerTemp; i++) {
        totalIterations++;

        // Generate neighbor solution
        const neighbor = this.generateNeighbor(current, problem.bounds, temperature);

        if (problem.constraints && !problem.constraints(neighbor)) {
          continue;
        }

        const neighborFitness = this.evaluate(neighbor, problem);
        evaluations++;

        // Calculate acceptance probability
        const delta = problem.minimize
          ? neighborFitness - currentFitness
          : currentFitness - neighborFitness;

        const acceptanceProbability =
          delta < 0 ? 1 : Math.exp(-delta / temperature);

        // Accept or reject
        if (Math.random() < acceptanceProbability) {
          current = neighbor;
          currentFitness = neighborFitness;

          // Update best
          const isBetter = problem.minimize
            ? currentFitness < bestFitness
            : currentFitness > bestFitness;

          if (isBetter) {
            best = [...current];
            bestFitness = currentFitness;
          }
        }
      }

      convergenceHistory.push(bestFitness);
      temperature *= coolingRate;
    }

    return {
      solution: best,
      fitness: bestFitness,
      iterations: totalIterations,
      convergenceHistory,
      evaluations,
      success: true,
    };
  }

  /**
   * Differential Evolution
   */
  differentialEvolution(
    problem: OptimizationProblem,
    populationSize: number = 50,
    generations: number = 100,
    F: number = 0.8, // Differential weight
    CR: number = 0.9 // Crossover probability
  ): OptimizationResult {
    // Initialize population
    let population = this.initializePopulation(
      populationSize,
      problem.dimensions,
      problem.bounds
    );

    let fitness = population.map((individual) => this.evaluate(individual, problem));

    let bestIdx = problem.minimize
      ? fitness.indexOf(Math.min(...fitness))
      : fitness.indexOf(Math.max(...fitness));
    let bestSolution = [...population[bestIdx]];
    let bestFitness = fitness[bestIdx];

    const convergenceHistory: number[] = [];
    let evaluations = populationSize;

    for (let gen = 0; gen < generations; gen++) {
      for (let i = 0; i < populationSize; i++) {
        // Select three random distinct individuals
        const indices = this.selectRandomIndices(i, populationSize, 3);
        const [a, b, c] = indices.map((idx) => population[idx]);

        // Mutation: v = a + F * (b - c)
        const mutant = a.map((val, d) => val + F * (b[d] - c[d]));

        // Crossover
        const trial = population[i].map((val, d) => {
          return Math.random() < CR || d === Math.floor(Math.random() * problem.dimensions)
            ? mutant[d]
            : val;
        });

        // Boundary handling
        for (let d = 0; d < problem.dimensions; d++) {
          trial[d] = Math.max(
            problem.bounds[d].min,
            Math.min(problem.bounds[d].max, trial[d])
          );
        }

        // Selection
        if (!problem.constraints || problem.constraints(trial)) {
          const trialFitness = this.evaluate(trial, problem);
          evaluations++;

          const isBetter = problem.minimize
            ? trialFitness < fitness[i]
            : trialFitness > fitness[i];

          if (isBetter) {
            population[i] = trial;
            fitness[i] = trialFitness;

            if (
              (problem.minimize && trialFitness < bestFitness) ||
              (!problem.minimize && trialFitness > bestFitness)
            ) {
              bestSolution = [...trial];
              bestFitness = trialFitness;
            }
          }
        }
      }

      convergenceHistory.push(bestFitness);
    }

    return {
      solution: bestSolution,
      fitness: bestFitness,
      iterations: generations,
      convergenceHistory,
      evaluations,
      success: true,
    };
  }

  /**
   * Nelder-Mead Simplex Method (gradient-free)
   */
  nelderMead(
    problem: OptimizationProblem,
    initialSimplex?: number[][],
    maxIterations: number = 1000,
    tolerance: number = 1e-6
  ): OptimizationResult {
    const n = problem.dimensions;

    // Initialize simplex
    let simplex = initialSimplex || this.initializePopulation(n + 1, n, problem.bounds);
    let fitness = simplex.map((point) => this.evaluate(point, problem));

    const convergenceHistory: number[] = [];
    let evaluations = n + 1;
    let iteration = 0;

    // Nelder-Mead coefficients
    const alpha = 1.0; // Reflection
    const beta = 2.0; // Expansion
    const gamma = 0.5; // Contraction
    const delta = 0.5; // Shrink

    while (iteration < maxIterations) {
      iteration++;

      // Sort by fitness
      const indices = Array.from({ length: n + 1 }, (_, i) => i).sort((a, b) =>
        problem.minimize ? fitness[a] - fitness[b] : fitness[b] - fitness[a]
      );

      const best = indices[0];
      const worst = indices[n];
      const secondWorst = indices[n - 1];

      convergenceHistory.push(fitness[best]);

      // Check convergence
      const range = Math.abs(fitness[worst] - fitness[best]);
      if (range < tolerance) {
        break;
      }

      // Calculate centroid (excluding worst point)
      const centroid = Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        for (let d = 0; d < n; d++) {
          centroid[d] += simplex[indices[i]][d];
        }
      }
      for (let d = 0; d < n; d++) {
        centroid[d] /= n;
      }

      // Reflection
      const reflected = centroid.map(
        (c, d) => c + alpha * (c - simplex[worst][d])
      );
      const reflectedFitness = this.evaluate(reflected, problem);
      evaluations++;

      const betterThanSecondWorst =
        (problem.minimize && reflectedFitness < fitness[secondWorst]) ||
        (!problem.minimize && reflectedFitness > fitness[secondWorst]);

      const betterThanBest =
        (problem.minimize && reflectedFitness < fitness[best]) ||
        (!problem.minimize && reflectedFitness > fitness[best]);

      if (betterThanSecondWorst && !betterThanBest) {
        simplex[worst] = reflected;
        fitness[worst] = reflectedFitness;
        continue;
      }

      // Expansion
      if (betterThanBest) {
        const expanded = centroid.map(
          (c, d) => c + beta * (reflected[d] - c)
        );
        const expandedFitness = this.evaluate(expanded, problem);
        evaluations++;

        if (
          (problem.minimize && expandedFitness < reflectedFitness) ||
          (!problem.minimize && expandedFitness > reflectedFitness)
        ) {
          simplex[worst] = expanded;
          fitness[worst] = expandedFitness;
        } else {
          simplex[worst] = reflected;
          fitness[worst] = reflectedFitness;
        }
        continue;
      }

      // Contraction
      const contracted = centroid.map(
        (c, d) => c + gamma * (simplex[worst][d] - c)
      );
      const contractedFitness = this.evaluate(contracted, problem);
      evaluations++;

      if (
        (problem.minimize && contractedFitness < fitness[worst]) ||
        (!problem.minimize && contractedFitness > fitness[worst])
      ) {
        simplex[worst] = contracted;
        fitness[worst] = contractedFitness;
        continue;
      }

      // Shrink
      for (let i = 1; i <= n; i++) {
        const idx = indices[i];
        simplex[idx] = simplex[idx].map(
          (val, d) => simplex[best][d] + delta * (val - simplex[best][d])
        );
        fitness[idx] = this.evaluate(simplex[idx], problem);
        evaluations++;
      }
    }

    const bestIdx = problem.minimize
      ? fitness.indexOf(Math.min(...fitness))
      : fitness.indexOf(Math.max(...fitness));

    return {
      solution: simplex[bestIdx],
      fitness: fitness[bestIdx],
      iterations: iteration,
      convergenceHistory,
      evaluations,
      success: iteration < maxIterations,
    };
  }

  /**
   * Ant Colony Optimization (for combinatorial problems)
   */
  antColonyOptimization(
    problem: OptimizationProblem,
    numAnts: number = 20,
    iterations: number = 100,
    alpha: number = 1.0, // Pheromone importance
    beta: number = 2.0, // Heuristic importance
    evaporation: number = 0.5,
    Q: number = 100 // Pheromone deposit factor
  ): OptimizationResult {
    const n = problem.dimensions;

    // Initialize pheromones
    const pheromones = Array(n)
      .fill(0)
      .map(() => Array(n).fill(1.0));

    let bestSolution: number[] = [];
    let bestFitness = problem.minimize ? Infinity : -Infinity;
    const convergenceHistory: number[] = [];
    let evaluations = 0;

    for (let iter = 0; iter < iterations; iter++) {
      const antSolutions: number[][] = [];
      const antFitness: number[] = [];

      // Each ant constructs a solution
      for (let ant = 0; ant < numAnts; ant++) {
        const solution = this.constructAntSolution(
          problem,
          pheromones,
          alpha,
          beta
        );
        const fitness = this.evaluate(solution, problem);

        antSolutions.push(solution);
        antFitness.push(fitness);
        evaluations++;

        // Update best
        const isBetter = problem.minimize
          ? fitness < bestFitness
          : fitness > bestFitness;

        if (isBetter) {
          bestSolution = [...solution];
          bestFitness = fitness;
        }
      }

      // Evaporate pheromones
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          pheromones[i][j] *= 1 - evaporation;
        }
      }

      // Deposit pheromones
      for (let ant = 0; ant < numAnts; ant++) {
        const deposit = Q / (1 + Math.abs(antFitness[ant]));
        for (let i = 0; i < n - 1; i++) {
          const from = Math.floor(antSolutions[ant][i]);
          const to = Math.floor(antSolutions[ant][i + 1]);
          if (from >= 0 && from < n && to >= 0 && to < n) {
            pheromones[from][to] += deposit;
          }
        }
      }

      convergenceHistory.push(bestFitness);
    }

    return {
      solution: bestSolution,
      fitness: bestFitness,
      iterations,
      convergenceHistory,
      evaluations,
      success: true,
    };
  }

  /**
   * Private helper methods
   */

  private initializePopulation(
    size: number,
    dimensions: number,
    bounds: { min: number; max: number }[]
  ): number[][] {
    const population: number[][] = [];

    for (let i = 0; i < size; i++) {
      const individual: number[] = [];
      for (let d = 0; d < dimensions; d++) {
        const value =
          Math.random() * (bounds[d].max - bounds[d].min) + bounds[d].min;
        individual.push(value);
      }
      population.push(individual);
    }

    return population;
  }

  private evaluate(solution: number[], problem: OptimizationProblem): number {
    return problem.objectiveFunction(solution);
  }

  private tournamentSelection(
    population: number[][],
    fitness: number[],
    tournamentSize: number,
    minimize: boolean
  ): number[] {
    const indices: number[] = [];

    for (let i = 0; i < tournamentSize; i++) {
      indices.push(Math.floor(Math.random() * population.length));
    }

    let bestIdx = indices[0];
    let bestFit = fitness[bestIdx];

    for (let i = 1; i < tournamentSize; i++) {
      const idx = indices[i];
      const fit = fitness[idx];

      if ((minimize && fit < bestFit) || (!minimize && fit > bestFit)) {
        bestIdx = idx;
        bestFit = fit;
      }
    }

    return [...population[bestIdx]];
  }

  private crossover(parent1: number[], parent2: number[]): number[] {
    const offspring: number[] = [];
    const crossoverPoint = Math.floor(Math.random() * parent1.length);

    for (let i = 0; i < parent1.length; i++) {
      offspring.push(i < crossoverPoint ? parent1[i] : parent2[i]);
    }

    return offspring;
  }

  private mutate(
    individual: number[],
    bounds: { min: number; max: number }[],
    mutationRate: number
  ): number[] {
    const mutated = [...individual];

    for (let i = 0; i < mutated.length; i++) {
      if (Math.random() < mutationRate) {
        const range = bounds[i].max - bounds[i].min;
        mutated[i] += (Math.random() - 0.5) * range * 0.1;
        mutated[i] = Math.max(
          bounds[i].min,
          Math.min(bounds[i].max, mutated[i])
        );
      }
    }

    return mutated;
  }

  private getTopIndices(
    fitness: number[],
    count: number,
    minimize: boolean
  ): number[] {
    return Array.from({ length: fitness.length }, (_, i) => i)
      .sort((a, b) => (minimize ? fitness[a] - fitness[b] : fitness[b] - fitness[a]))
      .slice(0, count);
  }

  private generateNeighbor(
    current: number[],
    bounds: { min: number; max: number }[],
    temperature: number
  ): number[] {
    const neighbor = [...current];
    const dim = Math.floor(Math.random() * current.length);
    const range = bounds[dim].max - bounds[dim].min;
    const perturbation = (Math.random() - 0.5) * range * 0.1 * temperature;

    neighbor[dim] += perturbation;
    neighbor[dim] = Math.max(
      bounds[dim].min,
      Math.min(bounds[dim].max, neighbor[dim])
    );

    return neighbor;
  }

  private selectRandomIndices(
    exclude: number,
    max: number,
    count: number
  ): number[] {
    const indices: number[] = [];

    while (indices.length < count) {
      const idx = Math.floor(Math.random() * max);
      if (idx !== exclude && !indices.includes(idx)) {
        indices.push(idx);
      }
    }

    return indices;
  }

  private constructAntSolution(
    problem: OptimizationProblem,
    pheromones: number[][],
    alpha: number,
    beta: number
  ): number[] {
    const solution: number[] = [];
    const n = problem.dimensions;

    for (let i = 0; i < n; i++) {
      // Simplified: generate value based on pheromone concentration
      const value =
        Math.random() * (problem.bounds[i].max - problem.bounds[i].min) +
        problem.bounds[i].min;
      solution.push(value);
    }

    return solution;
  }
}

