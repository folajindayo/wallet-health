/**
 * Game Theory & Strategic Decision Engine
 * Nash equilibrium, auction theory, mechanism design, and strategic analysis
 */

export interface Player {
  id: string;
  strategy: number[];
  payoff: number;
}

export interface NashEquilibrium {
  strategies: number[][];
  payoffs: number[];
  isStable: boolean;
  type: 'pure' | 'mixed';
}

export interface AuctionResult {
  winner: string;
  price: number;
  revenue: number;
  efficiency: number;
  bidders: { id: string; bid: number; value: number }[];
}

export interface CooperativeGame {
  players: string[];
  coalitionValues: Map<string, number>;
  shapleyValues: Map<string, number>;
  core: number[][];
}

export interface MechanismDesign {
  truthful: boolean;
  efficient: boolean;
  individualRational: boolean;
  budgetBalanced: boolean;
}

export interface EvolutionaryStableStrategy {
  strategy: number[];
  fitness: number;
  stable: boolean;
  invasionProbability: number;
}

export class GameTheoryEngine {
  /**
   * Find Nash Equilibrium for 2-player game (pure strategies)
   */
  findNashEquilibrium(
    payoffMatrix1: number[][],
    payoffMatrix2: number[][]
  ): NashEquilibrium[] {
    const equilibria: NashEquilibrium[] = [];
    const rows = payoffMatrix1.length;
    const cols = payoffMatrix1[0].length;

    // Check all strategy combinations
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let isNash = true;

        // Check if player 1 wants to deviate
        for (let k = 0; k < rows; k++) {
          if (k !== i && payoffMatrix1[k][j] > payoffMatrix1[i][j]) {
            isNash = false;
            break;
          }
        }

        // Check if player 2 wants to deviate
        for (let k = 0; k < cols; k++) {
          if (k !== j && payoffMatrix2[i][k] > payoffMatrix2[i][j]) {
            isNash = false;
            break;
          }
        }

        if (isNash) {
          equilibria.push({
            strategies: [[i], [j]],
            payoffs: [payoffMatrix1[i][j], payoffMatrix2[i][j]],
            isStable: true,
            type: 'pure',
          });
        }
      }
    }

    return equilibria;
  }

  /**
   * Mixed Strategy Nash Equilibrium for 2x2 games
   */
  findMixedStrategyNash(
    payoffMatrix1: number[][],
    payoffMatrix2: number[][]
  ): NashEquilibrium | null {
    // Only for 2x2 games
    if (payoffMatrix1.length !== 2 || payoffMatrix1[0].length !== 2) {
      return null;
    }

    const a11 = payoffMatrix1[0][0];
    const a12 = payoffMatrix1[0][1];
    const a21 = payoffMatrix1[1][0];
    const a22 = payoffMatrix1[1][1];

    const b11 = payoffMatrix2[0][0];
    const b12 = payoffMatrix2[0][1];
    const b21 = payoffMatrix2[1][0];
    const b22 = payoffMatrix2[1][1];

    // Player 2's mixing probability (makes Player 1 indifferent)
    const q = (a21 - a11) / (a11 - a12 - a21 + a22);

    // Player 1's mixing probability (makes Player 2 indifferent)
    const p = (b12 - b11) / (b11 - b12 - b21 + b22);

    // Check validity (probabilities must be in [0,1])
    if (p < 0 || p > 1 || q < 0 || q > 1 || isNaN(p) || isNaN(q)) {
      return null;
    }

    // Calculate expected payoffs
    const payoff1 = p * q * a11 + p * (1 - q) * a12 + (1 - p) * q * a21 + (1 - p) * (1 - q) * a22;
    const payoff2 = p * q * b11 + p * (1 - q) * b12 + (1 - p) * q * b21 + (1 - p) * (1 - q) * b22;

    return {
      strategies: [
        [p, 1 - p],
        [q, 1 - q],
      ],
      payoffs: [payoff1, payoff2],
      isStable: true,
      type: 'mixed',
    };
  }

  /**
   * Iterative Best Response for finding Nash Equilibrium
   */
  iterativeBestResponse(
    payoffFunctions: ((strategies: number[][]) => number)[],
    initialStrategies: number[][],
    maxIterations: number = 100,
    tolerance: number = 1e-6
  ): { strategies: number[][]; payoffs: number[]; converged: boolean } {
    let strategies = initialStrategies.map((s) => [...s]);
    let converged = false;

    for (let iter = 0; iter < maxIterations; iter++) {
      const newStrategies: number[][] = [];
      let maxChange = 0;

      // Each player finds best response
      for (let i = 0; i < payoffFunctions.length; i++) {
        const bestResponse = this.findBestResponse(
          payoffFunctions[i],
          strategies,
          i
        );
        newStrategies.push(bestResponse);

        // Calculate change
        const change = this.strategyDistance(strategies[i], bestResponse);
        maxChange = Math.max(maxChange, change);
      }

      strategies = newStrategies;

      if (maxChange < tolerance) {
        converged = true;
        break;
      }
    }

    const payoffs = payoffFunctions.map((f) => f(strategies));

    return { strategies, payoffs, converged };
  }

  /**
   * First-Price Sealed-Bid Auction
   */
  firstPriceAuction(
    bids: { id: string; bid: number; value: number }[]
  ): AuctionResult {
    // Find highest bidder
    let maxBid = -Infinity;
    let winner = '';
    let winnerValue = 0;

    for (const bidder of bids) {
      if (bidder.bid > maxBid) {
        maxBid = bidder.bid;
        winner = bidder.id;
        winnerValue = bidder.value;
      }
    }

    // Revenue = winning bid
    const revenue = maxBid;

    // Efficiency = winner's value / max possible value
    const maxValue = Math.max(...bids.map((b) => b.value));
    const efficiency = winnerValue / maxValue;

    return {
      winner,
      price: maxBid,
      revenue,
      efficiency,
      bidders: bids,
    };
  }

  /**
   * Second-Price (Vickrey) Auction
   */
  vickreyAuction(
    bids: { id: string; bid: number; value: number }[]
  ): AuctionResult {
    // Sort bids descending
    const sortedBids = [...bids].sort((a, b) => b.bid - a.bid);

    const winner = sortedBids[0].id;
    const winnerValue = sortedBids[0].value;
    
    // Price = second-highest bid (truthful mechanism)
    const price = sortedBids.length > 1 ? sortedBids[1].bid : sortedBids[0].bid;

    const maxValue = Math.max(...bids.map((b) => b.value));
    const efficiency = winnerValue / maxValue;

    return {
      winner,
      price,
      revenue: price,
      efficiency,
      bidders: bids,
    };
  }

  /**
   * All-Pay Auction
   */
  allPayAuction(
    bids: { id: string; bid: number; value: number }[]
  ): AuctionResult {
    let maxBid = -Infinity;
    let winner = '';
    let winnerValue = 0;

    for (const bidder of bids) {
      if (bidder.bid > maxBid) {
        maxBid = bidder.bid;
        winner = bidder.id;
        winnerValue = bidder.value;
      }
    }

    // Revenue = sum of all bids (everyone pays)
    const revenue = bids.reduce((sum, b) => sum + b.bid, 0);

    const maxValue = Math.max(...bids.map((b) => b.value));
    const efficiency = winnerValue / maxValue;

    return {
      winner,
      price: maxBid,
      revenue,
      efficiency,
      bidders: bids,
    };
  }

  /**
   * Shapley Value (fair allocation in cooperative games)
   */
  calculateShapleyValue(
    players: string[],
    characteristicFunction: (coalition: string[]) => number
  ): Map<string, number> {
    const n = players.length;
    const shapleyValues = new Map<string, number>();

    for (const player of players) {
      let value = 0;

      // Iterate over all possible coalitions
      const allCoalitions = this.generateCoalitions(players);

      for (const coalition of allCoalitions) {
        if (!coalition.includes(player)) {
          const s = coalition.length;
          
          // Weight: (s! * (n-s-1)!) / n!
          const weight = this.factorial(s) * this.factorial(n - s - 1) / this.factorial(n);

          // Marginal contribution
          const coalitionWithPlayer = [...coalition, player];
          const marginalContribution =
            characteristicFunction(coalitionWithPlayer) -
            characteristicFunction(coalition);

          value += weight * marginalContribution;
        }
      }

      // Add contribution of singleton
      value += characteristicFunction([player]) / n;

      shapleyValues.set(player, value);
    }

    return shapleyValues;
  }

  /**
   * Core of a cooperative game
   */
  findCore(
    players: string[],
    characteristicFunction: (coalition: string[]) => number
  ): number[][] {
    const core: number[][] = [];
    const n = players.length;
    const totalValue = characteristicFunction(players);

    // Generate candidate allocations
    const candidates = this.generateAllocations(n, totalValue, 100);

    for (const allocation of candidates) {
      let isInCore = true;

      // Check all coalitions
      const coalitions = this.generateCoalitions(players);

      for (const coalition of coalitions) {
        const coalitionValue = characteristicFunction(coalition);
        const coalitionAllocation = coalition.reduce(
          (sum, player) => sum + allocation[players.indexOf(player)],
          0
        );

        // Coalition must not have incentive to deviate
        if (coalitionAllocation < coalitionValue) {
          isInCore = false;
          break;
        }
      }

      if (isInCore) {
        core.push(allocation);
      }
    }

    return core;
  }

  /**
   * Mechanism Design: Check Incentive Compatibility (Truthfulness)
   */
  checkIncentiveCompatibility(
    mechanism: (bids: number[]) => { allocations: number[]; payments: number[] },
    trueValues: number[]
  ): boolean {
    const n = trueValues.length;

    // Check if truthful bidding is optimal for each player
    for (let i = 0; i < n; i++) {
      const trueBid = [...trueValues];
      const trueResult = mechanism(trueBid);
      const trueUtility =
        trueResult.allocations[i] * trueValues[i] - trueResult.payments[i];

      // Try deviating bids
      for (let dev = 0; dev < trueValues[i] * 2; dev += trueValues[i] * 0.1) {
        const deviatingBid = [...trueBid];
        deviatingBid[i] = dev;
        
        const devResult = mechanism(deviatingBid);
        const devUtility =
          devResult.allocations[i] * trueValues[i] - devResult.payments[i];

        // If deviation improves utility, mechanism is not truthful
        if (devUtility > trueUtility + 1e-6) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Evolutionary Stable Strategy (ESS)
   */
  findEvolutionaryStableStrategy(
    payoffMatrix: number[][],
    initialPopulation: number[],
    generations: number = 1000,
    mutationRate: number = 0.01
  ): EvolutionaryStableStrategy {
    let population = [...initialPopulation];
    const n = population.length;

    for (let gen = 0; gen < generations; gen++) {
      // Calculate fitness for each strategy
      const fitness = population.map((_, i) =>
        population.reduce(
          (sum, freq, j) => sum + freq * payoffMatrix[i][j],
          0
        )
      );

      // Average fitness
      const avgFitness = fitness.reduce((a, b) => a + b, 0) / n;

      // Replicator dynamics: dx_i/dt = x_i * (f_i - f_avg)
      const newPopulation = population.map((freq, i) => {
        const growth = freq * (fitness[i] - avgFitness);
        return Math.max(0, freq + growth * 0.01);
      });

      // Normalize
      const sum = newPopulation.reduce((a, b) => a + b, 0);
      population = newPopulation.map((freq) => freq / sum);

      // Apply mutation
      if (Math.random() < mutationRate) {
        const i = Math.floor(Math.random() * n);
        const j = Math.floor(Math.random() * n);
        const transfer = population[i] * 0.01;
        population[i] -= transfer;
        population[j] += transfer;
      }
    }

    // Calculate final fitness
    const finalFitness = population.reduce(
      (sum, freq, i) =>
        sum +
        freq *
          population.reduce((s, f, j) => s + f * payoffMatrix[i][j], 0),
      0
    );

    // Check stability (simplified)
    const stable = this.checkESSStability(population, payoffMatrix);

    return {
      strategy: population,
      fitness: finalFitness,
      stable,
      invasionProbability: stable ? 0 : 0.1,
    };
  }

  /**
   * Prisoner's Dilemma specific analysis
   */
  analyzePrisonersDilemma(
    cooperatePayoff: number,
    defectPayoff: number,
    mutualCooperation: number,
    mutualDefection: number
  ): {
    dominantStrategy: 'cooperate' | 'defect';
    nashEquilibrium: string;
    paretoOptimal: string;
    socialWelfare: { cooperate: number; defect: number };
  } {
    // Dominant strategy
    const dominantStrategy =
      defectPayoff > cooperatePayoff ? 'defect' : 'cooperate';

    // Nash equilibrium (typically mutual defection)
    const nashEquilibrium =
      defectPayoff > cooperatePayoff
        ? 'Mutual Defection'
        : 'Mutual Cooperation';

    // Pareto optimal (typically mutual cooperation)
    const paretoOptimal =
      mutualCooperation > mutualDefection
        ? 'Mutual Cooperation'
        : 'Mutual Defection';

    return {
      dominantStrategy,
      nashEquilibrium,
      paretoOptimal,
      socialWelfare: {
        cooperate: mutualCooperation * 2,
        defect: defectPayoff + cooperatePayoff,
      },
    };
  }

  /**
   * Stackelberg Game (leader-follower)
   */
  solveStackelbergGame(
    leaderPayoff: (l: number, f: number) => number,
    followerPayoff: (l: number, f: number) => number,
    searchSpace: { min: number; max: number; step: number }
  ): {
    leaderStrategy: number;
    followerStrategy: number;
    leaderPayoff: number;
    followerPayoff: number;
  } {
    let bestLeaderPayoff = -Infinity;
    let bestLeaderStrategy = 0;
    let bestFollowerStrategy = 0;

    // Leader considers all possible strategies
    for (
      let l = searchSpace.min;
      l <= searchSpace.max;
      l += searchSpace.step
    ) {
      // For each leader strategy, find follower's best response
      let bestFollowerPayoffForL = -Infinity;
      let followerBestResponse = 0;

      for (
        let f = searchSpace.min;
        f <= searchSpace.max;
        f += searchSpace.step
      ) {
        const fPayoff = followerPayoff(l, f);
        if (fPayoff > bestFollowerPayoffForL) {
          bestFollowerPayoffForL = fPayoff;
          followerBestResponse = f;
        }
      }

      // Calculate leader's payoff given follower's best response
      const lPayoff = leaderPayoff(l, followerBestResponse);

      if (lPayoff > bestLeaderPayoff) {
        bestLeaderPayoff = lPayoff;
        bestLeaderStrategy = l;
        bestFollowerStrategy = followerBestResponse;
      }
    }

    return {
      leaderStrategy: bestLeaderStrategy,
      followerStrategy: bestFollowerStrategy,
      leaderPayoff: bestLeaderPayoff,
      followerPayoff: followerPayoff(bestLeaderStrategy, bestFollowerStrategy),
    };
  }

  /**
   * Private helper methods
   */

  private findBestResponse(
    payoffFunction: (strategies: number[][]) => number,
    otherStrategies: number[][],
    playerIndex: number
  ): number[] {
    // Simplified: try different strategies and find best
    const testStrategies = [
      [1, 0],
      [0, 1],
      [0.5, 0.5],
      [0.3, 0.7],
      [0.7, 0.3],
    ];

    let bestPayoff = -Infinity;
    let bestStrategy = testStrategies[0];

    for (const strategy of testStrategies) {
      const testFullStrategy = otherStrategies.map((s, i) =>
        i === playerIndex ? strategy : s
      );
      const payoff = payoffFunction(testFullStrategy);

      if (payoff > bestPayoff) {
        bestPayoff = payoff;
        bestStrategy = strategy;
      }
    }

    return bestStrategy;
  }

  private strategyDistance(s1: number[], s2: number[]): number {
    return Math.sqrt(
      s1.reduce((sum, val, i) => sum + Math.pow(val - s2[i], 2), 0)
    );
  }

  private generateCoalitions(players: string[]): string[][] {
    const coalitions: string[][] = [];
    const n = players.length;

    // Generate all subsets (2^n combinations)
    for (let i = 0; i < Math.pow(2, n); i++) {
      const coalition: string[] = [];
      for (let j = 0; j < n; j++) {
        if ((i & (1 << j)) !== 0) {
          coalition.push(players[j]);
        }
      }
      coalitions.push(coalition);
    }

    return coalitions;
  }

  private factorial(n: number): number {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  private generateAllocations(
    n: number,
    total: number,
    samples: number
  ): number[][] {
    const allocations: number[][] = [];

    for (let i = 0; i < samples; i++) {
      const allocation: number[] = [];
      let remaining = total;

      for (let j = 0; j < n - 1; j++) {
        const value = Math.random() * remaining;
        allocation.push(value);
        remaining -= value;
      }
      allocation.push(remaining);

      allocations.push(allocation);
    }

    return allocations;
  }

  private checkESSStability(
    strategy: number[],
    payoffMatrix: number[][]
  ): boolean {
    const n = strategy.length;

    // Check if strategy is resistant to invasion
    for (let mutant = 0; mutant < n; mutant++) {
      const mutantStrategy = Array(n).fill(0);
      mutantStrategy[mutant] = 1;

      // Payoff against population
      const residentPayoff = strategy.reduce(
        (sum, freq, i) =>
          sum +
          freq *
            strategy.reduce((s, f, j) => s + f * payoffMatrix[i][j], 0),
        0
      );

      const mutantPayoff = mutantStrategy.reduce(
        (sum, freq, i) =>
          sum +
          freq *
            strategy.reduce((s, f, j) => s + f * payoffMatrix[i][j], 0),
        0
      );

      // If mutant does better, not stable
      if (mutantPayoff > residentPayoff + 1e-6) {
        return false;
      }
    }

    return true;
  }
}

