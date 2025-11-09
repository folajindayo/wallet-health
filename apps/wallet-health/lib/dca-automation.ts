/**
 * DCA (Dollar Cost Averaging) Automation Utility
 * Automates DCA strategies for token purchases
 */

export interface DCAStrategy {
  id: string;
  name: string;
  tokenIn: string; // Address of token to sell (e.g., USDC)
  tokenOut: string; // Address of token to buy (e.g., ETH)
  tokenInSymbol: string;
  tokenOutSymbol: string;
  amountPerPeriod: number; // USD amount per period
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: number;
  endDate?: number;
  chainId: number;
  isActive: boolean;
  totalInvested: number; // USD
  totalReceived: number; // Amount of tokenOut received
  averagePrice: number; // Average buy price
  executions: DCAExecution[];
  nextExecution?: number;
}

export interface DCAExecution {
  id: string;
  strategyId: string;
  timestamp: number;
  amountIn: number; // USD
  amountOut: number; // Token amount
  price: number; // Price at execution
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
  gasUsed?: number;
  gasCost?: number; // USD
}

export interface DCAStats {
  totalStrategies: number;
  activeStrategies: number;
  totalInvested: number; // USD
  totalExecutions: number;
  averageROI: number; // Percentage
  bestPerformer: DCAStrategy | null;
  upcomingExecutions: DCAExecution[];
}

export class DCAAutomation {
  private strategies: Map<string, DCAStrategy> = new Map();
  private executions: Map<string, DCAExecution> = new Map();

  /**
   * Create DCA strategy
   */
  createStrategy(strategy: Omit<DCAStrategy, 'id' | 'executions' | 'totalInvested' | 'totalReceived' | 'averagePrice'>): DCAStrategy {
    const id = `dca-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullStrategy: DCAStrategy = {
      ...strategy,
      id,
      totalInvested: 0,
      totalReceived: 0,
      averagePrice: 0,
      executions: [],
      nextExecution: this.calculateNextExecution(strategy.startDate, strategy.frequency),
    };

    this.strategies.set(id, fullStrategy);
    return fullStrategy;
  }

  /**
   * Calculate next execution time
   */
  private calculateNextExecution(startDate: number, frequency: DCAStrategy['frequency']): number {
    const now = Date.now();
    if (now < startDate) {
      return startDate;
    }

    const frequencyMs = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
    }[frequency];

    const periodsElapsed = Math.floor((now - startDate) / frequencyMs);
    return startDate + (periodsElapsed + 1) * frequencyMs;
  }

  /**
   * Add execution
   */
  addExecution(execution: DCAExecution): void {
    this.executions.set(execution.id, execution);

    const strategy = this.strategies.get(execution.strategyId);
    if (strategy) {
      strategy.executions.push(execution);

      if (execution.status === 'completed') {
        strategy.totalInvested += execution.amountIn;
        strategy.totalReceived += execution.amountOut;

        // Recalculate average price
        const totalAmountIn = strategy.executions
          .filter(e => e.status === 'completed')
          .reduce((sum, e) => sum + e.amountIn, 0);
        const totalAmountOut = strategy.executions
          .filter(e => e.status === 'completed')
          .reduce((sum, e) => sum + e.amountOut, 0);

        strategy.averagePrice = totalAmountOut > 0 ? totalAmountIn / totalAmountOut : 0;

        // Calculate next execution
        strategy.nextExecution = this.calculateNextExecution(
          strategy.startDate,
          strategy.frequency
        );
      }
    }
  }

  /**
   * Get strategy
   */
  getStrategy(id: string): DCAStrategy | null {
    return this.strategies.get(id) || null;
  }

  /**
   * Get all strategies
   */
  getAllStrategies(activeOnly = false): DCAStrategy[] {
    const strategies = Array.from(this.strategies.values());
    return activeOnly ? strategies.filter(s => s.isActive) : strategies;
  }

  /**
   * Get statistics
   */
  getStats(): DCAStats {
    const strategies = Array.from(this.strategies.values());
    const activeStrategies = strategies.filter(s => s.isActive).length;
    const totalInvested = strategies.reduce((sum, s) => sum + s.totalInvested, 0);
    const totalExecutions = Array.from(this.executions.values()).length;

    // Calculate average ROI (simplified)
    let totalROI = 0;
    let strategiesWithROI = 0;
    strategies.forEach(strategy => {
      if (strategy.executions.length > 0 && strategy.averagePrice > 0) {
        // Simplified ROI calculation
        const currentPrice = strategy.executions[strategy.executions.length - 1]?.price || 0;
        if (currentPrice > 0) {
          const roi = ((currentPrice - strategy.averagePrice) / strategy.averagePrice) * 100;
          totalROI += roi;
          strategiesWithROI++;
        }
      }
    });

    const averageROI = strategiesWithROI > 0 ? totalROI / strategiesWithROI : 0;

    // Find best performer
    const bestPerformer = strategies.length > 0
      ? strategies.reduce((best, current) => {
          const bestROI = best.averagePrice > 0
            ? ((best.executions[best.executions.length - 1]?.price || 0) - best.averagePrice) / best.averagePrice
            : 0;
          const currentROI = current.averagePrice > 0
            ? ((current.executions[current.executions.length - 1]?.price || 0) - current.averagePrice) / current.averagePrice
            : 0;
          return currentROI > bestROI ? current : best;
        })
      : null;

    // Get upcoming executions
    const now = Date.now();
    const upcomingExecutions: DCAExecution[] = [];
    strategies.forEach(strategy => {
      if (strategy.isActive && strategy.nextExecution && strategy.nextExecution > now) {
        upcomingExecutions.push({
          id: `pending-${strategy.id}`,
          strategyId: strategy.id,
          timestamp: strategy.nextExecution,
          amountIn: strategy.amountPerPeriod,
          amountOut: 0,
          price: 0,
          status: 'pending',
        });
      }
    });

    upcomingExecutions.sort((a, b) => a.timestamp - b.timestamp);

    return {
      totalStrategies: strategies.length,
      activeStrategies,
      totalInvested,
      totalExecutions,
      averageROI: Math.round(averageROI * 100) / 100,
      bestPerformer,
      upcomingExecutions: upcomingExecutions.slice(0, 10),
    };
  }

  /**
   * Pause strategy
   */
  pauseStrategy(id: string): boolean {
    const strategy = this.strategies.get(id);
    if (!strategy) {
      return false;
    }

    strategy.isActive = false;
    return true;
  }

  /**
   * Resume strategy
   */
  resumeStrategy(id: string): boolean {
    const strategy = this.strategies.get(id);
    if (!strategy) {
      return false;
    }

    strategy.isActive = true;
    strategy.nextExecution = this.calculateNextExecution(
      strategy.startDate,
      strategy.frequency
    );
    return true;
  }

  /**
   * Delete strategy
   */
  deleteStrategy(id: string): boolean {
    // Remove related executions
    const executionIds: string[] = [];
    this.executions.forEach((execution, execId) => {
      if (execution.strategyId === id) {
        executionIds.push(execId);
      }
    });

    executionIds.forEach(execId => this.executions.delete(execId));

    return this.strategies.delete(id);
  }

  /**
   * Get executions for strategy
   */
  getStrategyExecutions(strategyId: string): DCAExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.strategyId === strategyId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.strategies.clear();
    this.executions.clear();
  }
}

// Singleton instance
export const dcaAutomation = new DCAAutomation();

