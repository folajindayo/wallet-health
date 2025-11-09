/**
 * Smart Contract Interaction Tracker Utility
 * Tracks and analyzes all smart contract interactions
 */

export interface ContractInteraction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  contractAddress: string;
  contractName?: string;
  method: string;
  methodSignature?: string;
  value: string; // in wei
  gasUsed: number;
  gasPrice: number;
  status: 'success' | 'failed' | 'pending';
  chainId: number;
  blockNumber: number;
  inputData?: string;
  events?: ContractEvent[];
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface ContractEvent {
  name: string;
  signature: string;
  parameters: Record<string, any>;
}

export interface ContractStats {
  contractAddress: string;
  contractName?: string;
  totalInteractions: number;
  successfulInteractions: number;
  failedInteractions: number;
  totalValue: string;
  totalGasUsed: number;
  totalGasCost: number; // in native token
  firstInteraction: number;
  lastInteraction: number;
  methods: MethodStats[];
  riskScore: number;
}

export interface MethodStats {
  method: string;
  callCount: number;
  successRate: number;
  totalValue: string;
  avgGasUsed: number;
}

export interface InteractionPattern {
  type: 'frequent' | 'recent' | 'high_value' | 'risky';
  description: string;
  interactions: ContractInteraction[];
}

export class ContractInteractionTracker {
  private interactions: ContractInteraction[] = [];
  private contractCache: Map<string, ContractStats> = new Map();

  /**
   * Add an interaction
   */
  addInteraction(interaction: ContractInteraction): void {
    this.interactions.push(interaction);
    
    // Keep sorted by timestamp
    this.interactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Keep only last 10000 interactions
    if (this.interactions.length > 10000) {
      this.interactions = this.interactions.slice(-10000);
    }

    // Invalidate cache for this contract
    this.contractCache.delete(interaction.contractAddress.toLowerCase());
  }

  /**
   * Add multiple interactions
   */
  addInteractions(interactions: ContractInteraction[]): void {
    interactions.forEach(interaction => this.addInteraction(interaction));
  }

  /**
   * Get interactions for a contract
   */
  getContractInteractions(contractAddress: string, limit = 100): ContractInteraction[] {
    return this.interactions
      .filter(i => i.contractAddress.toLowerCase() === contractAddress.toLowerCase())
      .slice(0, limit);
  }

  /**
   * Get interactions for a wallet
   */
  getWalletInteractions(walletAddress: string, limit = 100): ContractInteraction[] {
    return this.interactions
      .filter(i => i.from.toLowerCase() === walletAddress.toLowerCase())
      .slice(0, limit);
  }

  /**
   * Get contract statistics
   */
  getContractStats(contractAddress: string): ContractStats | null {
    const cacheKey = contractAddress.toLowerCase();
    
    // Check cache
    if (this.contractCache.has(cacheKey)) {
      return this.contractCache.get(cacheKey)!;
    }

    const contractInteractions = this.getContractInteractions(contractAddress);
    
    if (contractInteractions.length === 0) {
      return null;
    }

    const successful = contractInteractions.filter(i => i.status === 'success').length;
    const failed = contractInteractions.filter(i => i.status === 'failed').length;
    
    const totalValue = contractInteractions.reduce(
      (sum, i) => sum + BigInt(i.value || '0'),
      BigInt(0)
    ).toString();

    const totalGasUsed = contractInteractions.reduce((sum, i) => sum + i.gasUsed, 0);
    const totalGasCost = contractInteractions.reduce(
      (sum, i) => sum + (i.gasUsed * i.gasPrice) / 1e9,
      0
    );

    const timestamps = contractInteractions.map(i => i.timestamp);
    const firstInteraction = Math.min(...timestamps);
    const lastInteraction = Math.max(...timestamps);

    // Calculate method statistics
    const methodMap = new Map<string, ContractInteraction[]>();
    contractInteractions.forEach(i => {
      const method = i.method || 'unknown';
      if (!methodMap.has(method)) {
        methodMap.set(method, []);
      }
      methodMap.get(method)!.push(i);
    });

    const methods: MethodStats[] = Array.from(methodMap.entries()).map(([method, interactions]) => {
      const successfulCalls = interactions.filter(i => i.status === 'success').length;
      const totalValue = interactions.reduce(
        (sum, i) => sum + BigInt(i.value || '0'),
        BigInt(0)
      ).toString();
      const avgGasUsed = interactions.reduce((sum, i) => sum + i.gasUsed, 0) / interactions.length;

      return {
        method,
        callCount: interactions.length,
        successRate: (successfulCalls / interactions.length) * 100,
        totalValue,
        avgGasUsed: Math.round(avgGasUsed),
      };
    });

    // Calculate risk score (0-100, higher = riskier)
    let riskScore = 0;
    
    // Failed interactions increase risk
    riskScore += (failed / contractInteractions.length) * 30;
    
    // New contracts are riskier
    const contractAge = Date.now() - firstInteraction;
    if (contractAge < 7 * 24 * 60 * 60 * 1000) { // Less than 7 days
      riskScore += 20;
    } else if (contractAge < 30 * 24 * 60 * 60 * 1000) { // Less than 30 days
      riskScore += 10;
    }

    // High value interactions increase risk
    const avgValue = parseFloat(totalValue) / contractInteractions.length / 1e18;
    if (avgValue > 10) {
      riskScore += 15;
    }

    riskScore = Math.min(100, Math.round(riskScore));

    const stats: ContractStats = {
      contractAddress,
      contractName: contractInteractions[0].contractName,
      totalInteractions: contractInteractions.length,
      successfulInteractions: successful,
      failedInteractions: failed,
      totalValue,
      totalGasUsed,
      totalGasCost,
      firstInteraction,
      lastInteraction,
      methods,
      riskScore,
    };

    // Cache result
    this.contractCache.set(cacheKey, stats);

    return stats;
  }

  /**
   * Detect interaction patterns
   */
  detectPatterns(walletAddress: string): InteractionPattern[] {
    const walletInteractions = this.getWalletInteractions(walletAddress);
    const patterns: InteractionPattern[] = [];

    // Frequent interactions
    const contractCounts = new Map<string, number>();
    walletInteractions.forEach(i => {
      const count = contractCounts.get(i.contractAddress) || 0;
      contractCounts.set(i.contractAddress, count + 1);
    });

    const frequentContracts = Array.from(contractCounts.entries())
      .filter(([_, count]) => count >= 10)
      .map(([address]) => address);

    if (frequentContracts.length > 0) {
      patterns.push({
        type: 'frequent',
        description: `Frequent interactions with ${frequentContracts.length} contract(s)`,
        interactions: walletInteractions.filter(i => 
          frequentContracts.includes(i.contractAddress)
        ),
      });
    }

    // Recent interactions (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentInteractions = walletInteractions.filter(i => i.timestamp >= oneDayAgo);
    
    if (recentInteractions.length > 0) {
      patterns.push({
        type: 'recent',
        description: `${recentInteractions.length} interactions in the last 24 hours`,
        interactions: recentInteractions,
      });
    }

    // High value interactions
    const highValueInteractions = walletInteractions.filter(i => {
      const valueEth = parseFloat(i.value || '0') / 1e18;
      return valueEth > 1; // More than 1 ETH
    });

    if (highValueInteractions.length > 0) {
      patterns.push({
        type: 'high_value',
        description: `${highValueInteractions.length} high-value interactions (>1 ETH)`,
        interactions: highValueInteractions,
      });
    }

    // Risky interactions
    const riskyInteractions = walletInteractions.filter(i => 
      i.riskLevel === 'high' || i.status === 'failed'
    );

    if (riskyInteractions.length > 0) {
      patterns.push({
        type: 'risky',
        description: `${riskyInteractions.length} risky or failed interactions`,
        interactions: riskyInteractions,
      });
    }

    return patterns;
  }

  /**
   * Get interaction summary
   */
  getSummary(walletAddress: string): {
    totalInteractions: number;
    uniqueContracts: number;
    totalValue: string;
    totalGasCost: number;
    successRate: number;
    topContracts: Array<{ address: string; interactions: number }>;
  } {
    const walletInteractions = this.getWalletInteractions(walletAddress);
    
    const uniqueContracts = new Set(
      walletInteractions.map(i => i.contractAddress.toLowerCase())
    ).size;

    const totalValue = walletInteractions.reduce(
      (sum, i) => sum + BigInt(i.value || '0'),
      BigInt(0)
    ).toString();

    const totalGasCost = walletInteractions.reduce(
      (sum, i) => sum + (i.gasUsed * i.gasPrice) / 1e9,
      0
    );

    const successful = walletInteractions.filter(i => i.status === 'success').length;
    const successRate = walletInteractions.length > 0
      ? (successful / walletInteractions.length) * 100
      : 0;

    // Top contracts by interaction count
    const contractCounts = new Map<string, number>();
    walletInteractions.forEach(i => {
      const count = contractCounts.get(i.contractAddress) || 0;
      contractCounts.set(i.contractAddress, count + 1);
    });

    const topContracts = Array.from(contractCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([address, interactions]) => ({ address, interactions }));

    return {
      totalInteractions: walletInteractions.length,
      uniqueContracts,
      totalValue,
      totalGasCost,
      successRate,
      topContracts,
    };
  }

  /**
   * Clear all interactions
   */
  clear(): void {
    this.interactions = [];
    this.contractCache.clear();
  }
}

// Singleton instance
export const contractInteractionTracker = new ContractInteractionTracker();

