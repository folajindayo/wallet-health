/**
 * Mempool Analyzer & MEV Detector
 * Advanced algorithms for analyzing pending transactions and detecting MEV opportunities
 */

export interface PendingTransaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  gasPrice: number;
  gasLimit: number;
  nonce: number;
  data: string;
  timestamp: number;
}

export interface MEVOpportunity {
  type: 'sandwich' | 'frontrun' | 'backrun' | 'liquidation' | 'arbitrage';
  targetTx: string;
  estimatedProfit: number;
  requiredGas: number;
  breakEvenGasPrice: number;
  confidence: number; // 0-100
  risk: number; // 0-100
  strategy: string;
  executionPlan: string[];
}

export interface SandwichOpportunity extends MEVOpportunity {
  victimTx: PendingTransaction;
  frontrunTx: {
    gasPrice: number;
    input: string;
    expectedSlippage: number;
  };
  backrunTx: {
    gasPrice: number;
    input: string;
    expectedProfit: number;
  };
  priceImpact: number;
}

export interface MempoolStatistics {
  totalPending: number;
  averageGasPrice: number;
  medianGasPrice: number;
  gasPriceDistribution: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  congestionLevel: 'low' | 'medium' | 'high' | 'extreme';
  estimatedWaitTime: Record<number, number>; // gasPrice -> estimated minutes
}

export interface TransactionCluster {
  transactions: PendingTransaction[];
  commonFeatures: {
    sameContract?: string;
    similarValue?: boolean;
    sequentialNonces?: boolean;
    sameOrigin?: boolean;
  };
  suspiciousScore: number; // 0-100
  possibleAttack: string | null;
}

export class MempoolAnalyzer {
  private readonly MIN_PROFIT_THRESHOLD = 50; // $50 minimum profit
  private readonly MAX_MEV_RISK = 80; // Maximum risk score to pursue MEV

  /**
   * Analyze mempool statistics
   */
  analyzeMempoolStatistics(pending: PendingTransaction[]): MempoolStatistics {
    if (pending.length === 0) {
      return {
        totalPending: 0,
        averageGasPrice: 0,
        medianGasPrice: 0,
        gasPriceDistribution: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
        congestionLevel: 'low',
        estimatedWaitTime: {},
      };
    }

    const gasPrices = pending.map(tx => tx.gasPrice).sort((a, b) => a - b);
    
    const averageGasPrice = gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length;
    const medianGasPrice = gasPrices[Math.floor(gasPrices.length / 2)];

    const gasPriceDistribution = {
      p10: gasPrices[Math.floor(gasPrices.length * 0.1)],
      p25: gasPrices[Math.floor(gasPrices.length * 0.25)],
      p50: medianGasPrice,
      p75: gasPrices[Math.floor(gasPrices.length * 0.75)],
      p90: gasPrices[Math.floor(gasPrices.length * 0.9)],
    };

    // Determine congestion level
    let congestionLevel: 'low' | 'medium' | 'high' | 'extreme';
    if (pending.length < 1000) congestionLevel = 'low';
    else if (pending.length < 5000) congestionLevel = 'medium';
    else if (pending.length < 10000) congestionLevel = 'high';
    else congestionLevel = 'extreme';

    // Estimate wait times for different gas prices
    const estimatedWaitTime = this.estimateWaitTimes(
      gasPriceDistribution,
      congestionLevel
    );

    return {
      totalPending: pending.length,
      averageGasPrice,
      medianGasPrice,
      gasPriceDistribution,
      congestionLevel,
      estimatedWaitTime,
    };
  }

  /**
   * Detect sandwich attack opportunities
   */
  detectSandwichOpportunities(
    pending: PendingTransaction[],
    ethPrice: number
  ): SandwichOpportunity[] {
    const opportunities: SandwichOpportunity[] = [];

    // Filter for large DEX swaps
    const dexSwaps = pending.filter(tx => this.isDEXSwap(tx));

    for (const victimTx of dexSwaps) {
      const analysis = this.analyzeSandwichPotential(victimTx, ethPrice);
      
      if (
        analysis.estimatedProfit > this.MIN_PROFIT_THRESHOLD &&
        analysis.risk < this.MAX_MEV_RISK
      ) {
        opportunities.push(analysis);
      }
    }

    return opportunities.sort((a, b) => b.estimatedProfit - a.estimatedProfit);
  }

  /**
   * Detect frontrunning opportunities
   */
  detectFrontrunOpportunities(
    pending: PendingTransaction[],
    ethPrice: number
  ): MEVOpportunity[] {
    const opportunities: MEVOpportunity[] = [];

    // Look for high-value transactions that could be frontrun
    for (const tx of pending) {
      // NFT mints
      if (this.isNFTMint(tx)) {
        const opportunity = this.analyzeNFTFrontrun(tx, ethPrice);
        if (opportunity.estimatedProfit > this.MIN_PROFIT_THRESHOLD) {
          opportunities.push(opportunity);
        }
      }

      // Token launches
      if (this.isTokenLaunch(tx)) {
        const opportunity = this.analyzeTokenLaunchFrontrun(tx, ethPrice);
        if (opportunity.estimatedProfit > this.MIN_PROFIT_THRESHOLD) {
          opportunities.push(opportunity);
        }
      }
    }

    return opportunities.sort((a, b) => b.estimatedProfit - a.estimatedProfit);
  }

  /**
   * Detect liquidation opportunities
   */
  detectLiquidationOpportunities(
    pending: PendingTransaction[],
    ethPrice: number
  ): MEVOpportunity[] {
    const opportunities: MEVOpportunity[] = [];

    // Look for lending protocol interactions
    const lendingTxs = pending.filter(tx => this.isLendingProtocolTx(tx));

    for (const tx of lendingTxs) {
      // Check if this creates a liquidation opportunity
      const opportunity = this.analyzeLiquidationPotential(tx, ethPrice);
      
      if (
        opportunity.estimatedProfit > this.MIN_PROFIT_THRESHOLD &&
        opportunity.risk < this.MAX_MEV_RISK
      ) {
        opportunities.push(opportunity);
      }
    }

    return opportunities.sort((a, b) => b.estimatedProfit - a.estimatedProfit);
  }

  /**
   * Cluster related transactions
   */
  clusterTransactions(pending: PendingTransaction[]): TransactionCluster[] {
    const clusters: TransactionCluster[] = [];

    // Group by contract address
    const byContract: Record<string, PendingTransaction[]> = {};
    for (const tx of pending) {
      if (!byContract[tx.to]) {
        byContract[tx.to] = [];
      }
      byContract[tx.to].push(tx);
    }

    // Analyze each contract's transactions
    for (const [contract, txs] of Object.entries(byContract)) {
      if (txs.length < 3) continue; // Skip small groups

      const cluster = this.analyzeCluster(txs, contract);
      if (cluster.suspiciousScore > 60) {
        clusters.push(cluster);
      }
    }

    // Group by sender
    const bySender: Record<string, PendingTransaction[]> = {};
    for (const tx of pending) {
      if (!bySender[tx.from]) {
        bySender[tx.from] = [];
      }
      bySender[tx.from].push(tx);
    }

    // Detect rapid-fire transactions from same sender
    for (const [sender, txs] of Object.entries(bySender)) {
      if (txs.length >= 5) {
        const cluster = this.analyzeCluster(txs, sender);
        cluster.possibleAttack = 'Rapid transaction spam';
        clusters.push(cluster);
      }
    }

    return clusters.sort((a, b) => b.suspiciousScore - a.suspiciousScore);
  }

  /**
   * Calculate optimal gas price for transaction inclusion
   */
  calculateOptimalGasPrice(
    stats: MempoolStatistics,
    urgency: 'low' | 'medium' | 'high',
    targetBlocks: number = 1
  ): {
    recommended: number;
    min: number;
    max: number;
    confidence: number;
  } {
    const { gasPriceDistribution } = stats;

    let recommended: number;
    let min: number;
    let max: number;
    let confidence: number;

    switch (urgency) {
      case 'high':
        // Top 10% to ensure inclusion in next block
        recommended = gasPriceDistribution.p90 * 1.1;
        min = gasPriceDistribution.p75;
        max = gasPriceDistribution.p90 * 1.5;
        confidence = 95;
        break;

      case 'medium':
        // Median to get included within target blocks
        recommended = gasPriceDistribution.p50 * (1 + targetBlocks * 0.05);
        min = gasPriceDistribution.p25;
        max = gasPriceDistribution.p75;
        confidence = 80;
        break;

      case 'low':
        // Lower quartile, can wait
        recommended = gasPriceDistribution.p25;
        min = gasPriceDistribution.p10;
        max = gasPriceDistribution.p50;
        confidence = 60;
        break;
    }

    // Adjust for congestion
    if (stats.congestionLevel === 'extreme') {
      recommended *= 1.3;
      confidence -= 15;
    } else if (stats.congestionLevel === 'high') {
      recommended *= 1.15;
      confidence -= 10;
    }

    return {
      recommended,
      min,
      max,
      confidence: Math.max(50, confidence),
    };
  }

  /**
   * Simulate transaction execution to detect potential failures
   */
  simulateTransaction(tx: PendingTransaction): {
    willSucceed: boolean;
    gasUsed: number;
    reason?: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let willSucceed = true;
    let gasUsed = tx.gasLimit;
    let reason: string | undefined;

    // Check gas limit
    if (tx.gasLimit < 21000) {
      willSucceed = false;
      reason = 'Gas limit too low (minimum 21000)';
    }

    // Check gas price
    if (tx.gasPrice < 1) {
      warnings.push('Extremely low gas price, transaction may never be mined');
    }

    // Check value vs sender balance (would need state access)
    // This is simplified
    if (tx.value > 0 && tx.gasPrice * tx.gasLimit > tx.value * 0.5) {
      warnings.push('Gas cost is more than 50% of transaction value');
    }

    // Estimate actual gas usage (simplified)
    const baseGas = 21000;
    const dataGas = tx.data.length / 2 * 16; // 16 gas per byte
    gasUsed = Math.min(baseGas + dataGas, tx.gasLimit);

    return {
      willSucceed,
      gasUsed: Math.floor(gasUsed),
      reason,
      warnings,
    };
  }

  /**
   * Private helper methods
   */

  private estimateWaitTimes(
    distribution: { p10: number; p25: number; p50: number; p75: number; p90: number },
    congestion: 'low' | 'medium' | 'high' | 'extreme'
  ): Record<number, number> {
    const baseTime = {
      low: 1,
      medium: 3,
      high: 10,
      extreme: 30,
    }[congestion];

    return {
      [distribution.p90]: baseTime * 0.5, // High gas: fast
      [distribution.p75]: baseTime * 1,
      [distribution.p50]: baseTime * 2,
      [distribution.p25]: baseTime * 4,
      [distribution.p10]: baseTime * 10, // Low gas: slow
    };
  }

  private isDEXSwap(tx: PendingTransaction): boolean {
    // Common DEX function selectors
    const dexSelectors = [
      '0x38ed1739', // swapExactTokensForTokens
      '0x8803dbee', // swapTokensForExactTokens
      '0x7ff36ab5', // swapExactETHForTokens
      '0x18cbafe5', // swapExactTokensForETH
      '0xfb3bdb41', // swapETHForExactTokens
      '0x4a25d94a', // swapTokensForExactETH
    ];

    const selector = tx.data.slice(0, 10);
    return dexSelectors.includes(selector) && tx.value > 0.1; // Minimum 0.1 ETH
  }

  private analyzeSandwichPotential(
    tx: PendingTransaction,
    ethPrice: number
  ): SandwichOpportunity {
    // Estimate slippage and price impact
    const tradeSize = tx.value * ethPrice;
    const priceImpact = this.estimatePriceImpact(tradeSize);
    const slippage = priceImpact * 0.8; // Conservative estimate

    // Calculate frontrun and backrun profits
    const frontrunProfit = tradeSize * slippage * 0.3;
    const backrunProfit = tradeSize * slippage * 0.5;
    const totalProfit = frontrunProfit + backrunProfit;

    // Calculate required gas
    const frontrunGas = 150000;
    const backrunGas = 150000;
    const totalGas = frontrunGas + backrunGas;

    // Gas price must be higher than victim
    const requiredGasPrice = tx.gasPrice * 1.1;
    const gasCost = (totalGas * requiredGasPrice) / 1e9 * ethPrice;

    const netProfit = totalProfit - gasCost;

    // Calculate risk
    let risk = 50;
    if (priceImpact < 1) risk += 20; // Small impact = harder to profit
    if (tx.gasPrice > 100) risk += 15; // High gas competition
    if (tradeSize < 50000) risk += 15; // Small trade

    return {
      type: 'sandwich',
      targetTx: tx.hash,
      estimatedProfit: netProfit,
      requiredGas: totalGas,
      breakEvenGasPrice: (totalProfit / totalGas * 1e9) / ethPrice,
      confidence: Math.max(0, 100 - risk),
      risk: Math.min(100, risk),
      strategy: 'Sandwich attack',
      executionPlan: [
        '1. Submit frontrun transaction with higher gas',
        '2. Let victim transaction execute',
        '3. Submit backrun transaction',
        '4. Profit from price movement',
      ],
      victimTx: tx,
      frontrunTx: {
        gasPrice: requiredGasPrice,
        input: '0x...', // Simplified
        expectedSlippage: slippage,
      },
      backrunTx: {
        gasPrice: tx.gasPrice * 0.9,
        input: '0x...', // Simplified
        expectedProfit: backrunProfit,
      },
      priceImpact,
    };
  }

  private isNFTMint(tx: PendingTransaction): boolean {
    // Common NFT mint selectors
    const mintSelectors = ['0x40c10f19', '0xa0712d68', '0x6a627842'];
    const selector = tx.data.slice(0, 10);
    return mintSelectors.includes(selector);
  }

  private isTokenLaunch(tx: PendingTransaction): boolean {
    // Look for addLiquidity or similar functions
    const launchSelectors = ['0xe8e33700', '0xf305d719'];
    const selector = tx.data.slice(0, 10);
    return launchSelectors.includes(selector) && tx.value > 1; // Significant liquidity
  }

  private isLendingProtocolTx(tx: PendingTransaction): boolean {
    // Common lending protocol selectors (borrow, repay, liquidate)
    const lendingSelectors = ['0xc5ebeaec', '0x573ade81', '0xf5e3c462'];
    const selector = tx.data.slice(0, 10);
    return lendingSelectors.includes(selector);
  }

  private analyzeNFTFrontrun(tx: PendingTransaction, ethPrice: number): MEVOpportunity {
    const mintValue = tx.value * ethPrice;
    const floorPrice = mintValue * 1.5; // Assume 50% profit on flip
    const estimatedProfit = floorPrice - mintValue - (tx.gasPrice * 200000) / 1e9 * ethPrice;

    return {
      type: 'frontrun',
      targetTx: tx.hash,
      estimatedProfit,
      requiredGas: 200000,
      breakEvenGasPrice: tx.gasPrice * 1.2,
      confidence: 60,
      risk: 70,
      strategy: 'NFT mint frontrun',
      executionPlan: [
        '1. Submit mint with higher gas',
        '2. List NFT on marketplace',
        '3. Sell for profit',
      ],
    };
  }

  private analyzeTokenLaunchFrontrun(tx: PendingTransaction, ethPrice: number): MEVOpportunity {
    const liquidityValue = tx.value * ethPrice;
    const estimatedProfit = liquidityValue * 0.2; // 20% gain on early buy

    return {
      type: 'frontrun',
      targetTx: tx.hash,
      estimatedProfit,
      requiredGas: 250000,
      breakEvenGasPrice: tx.gasPrice * 1.5,
      confidence: 50,
      risk: 80,
      strategy: 'Token launch frontrun',
      executionPlan: [
        '1. Buy tokens immediately after liquidity added',
        '2. Sell after price pump',
      ],
    };
  }

  private analyzeLiquidationPotential(
    tx: PendingTransaction,
    ethPrice: number
  ): MEVOpportunity {
    // Simplified liquidation analysis
    const collateralValue = tx.value * ethPrice;
    const liquidationBonus = collateralValue * 0.05; // 5% bonus
    const gasCost = (tx.gasPrice * 500000) / 1e9 * ethPrice;
    const estimatedProfit = liquidationBonus - gasCost;

    return {
      type: 'liquidation',
      targetTx: tx.hash,
      estimatedProfit,
      requiredGas: 500000,
      breakEvenGasPrice: (liquidationBonus / 500000 * 1e9) / ethPrice,
      confidence: 75,
      risk: 60,
      strategy: 'Liquidation capture',
      executionPlan: [
        '1. Monitor for undercollateralized positions',
        '2. Submit liquidation transaction',
        '3. Receive liquidation bonus',
      ],
    };
  }

  private analyzeCluster(txs: PendingTransaction[], identifier: string): TransactionCluster {
    const commonFeatures = {
      sameContract: this.hasSameContract(txs),
      similarValue: this.hasSimilarValues(txs),
      sequentialNonces: this.hasSequentialNonces(txs),
      sameOrigin: this.hasSameOrigin(txs),
    };

    let suspiciousScore = 0;
    let possibleAttack: string | null = null;

    // Sequential nonces from same sender
    if (commonFeatures.sequentialNonces && commonFeatures.sameOrigin) {
      suspiciousScore += 30;
      possibleAttack = 'Potential spam or bot activity';
    }

    // Many transactions to same contract
    if (commonFeatures.sameContract && txs.length > 10) {
      suspiciousScore += 25;
      possibleAttack = 'Possible coordinated attack or airdrop farming';
    }

    // Similar values (dusting attack?)
    if (commonFeatures.similarValue && txs.length > 20) {
      suspiciousScore += 35;
      possibleAttack = 'Possible dusting attack or spam campaign';
    }

    return {
      transactions: txs,
      commonFeatures,
      suspiciousScore: Math.min(100, suspiciousScore),
      possibleAttack,
    };
  }

  private estimatePriceImpact(tradeSize: number): number {
    // Simplified price impact calculation
    // Real calculation would need pool reserves
    if (tradeSize < 10000) return 0.1;
    if (tradeSize < 50000) return 0.5;
    if (tradeSize < 100000) return 1.0;
    if (tradeSize < 500000) return 2.5;
    return 5.0;
  }

  private hasSameContract(txs: PendingTransaction[]): string | undefined {
    const contracts = new Set(txs.map(tx => tx.to));
    return contracts.size === 1 ? Array.from(contracts)[0] : undefined;
  }

  private hasSimilarValues(txs: PendingTransaction[]): boolean {
    const values = txs.map(tx => tx.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const allSimilar = values.every(v => Math.abs(v - avg) < avg * 0.1);
    return allSimilar;
  }

  private hasSequentialNonces(txs: PendingTransaction[]): boolean {
    const sorted = [...txs].sort((a, b) => a.nonce - b.nonce);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].nonce !== sorted[i - 1].nonce + 1) {
        return false;
      }
    }
    return true;
  }

  private hasSameOrigin(txs: PendingTransaction[]): boolean {
    const origins = new Set(txs.map(tx => tx.from));
    return origins.size === 1;
  }
}

