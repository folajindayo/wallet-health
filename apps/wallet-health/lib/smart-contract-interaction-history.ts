/**
 * Smart Contract Interaction History Utility
 * Track all smart contract interactions
 */

export interface ContractInteraction {
  id: string;
  walletAddress: string;
  contractAddress: string;
  contractName?: string;
  contractLabel?: string;
  chainId: number;
  functionName: string;
  functionSignature: string;
  parameters: Record<string, any>;
  value: string; // ETH/BNB/etc sent
  valueUSD: number;
  gasUsed: number;
  gasCost: number; // USD
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  events: Array<{
    name: string;
    args: Record<string, any>;
  }>;
}

export interface InteractionStats {
  totalInteractions: number;
  uniqueContracts: number;
  totalGasCost: number; // USD
  totalValueSent: number; // USD
  byContract: Record<string, {
    count: number;
    totalGasCost: number;
    lastInteraction: number;
  }>;
  byFunction: Record<string, number>;
  byChain: Record<number, number>;
  riskScore: number; // 0-100
}

export class SmartContractInteractionHistory {
  private interactions: Map<string, ContractInteraction[]> = new Map();

  /**
   * Add interaction
   */
  addInteraction(interaction: Omit<ContractInteraction, 'id'>): ContractInteraction {
    const id = `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullInteraction: ContractInteraction = {
      ...interaction,
      id,
    };

    const key = interaction.walletAddress.toLowerCase();
    if (!this.interactions.has(key)) {
      this.interactions.set(key, []);
    }

    this.interactions.get(key)!.push(fullInteraction);

    // Keep only last 10000 interactions per wallet
    const walletInteractions = this.interactions.get(key)!;
    if (walletInteractions.length > 10000) {
      walletInteractions.splice(0, walletInteractions.length - 10000);
    }

    return fullInteraction;
  }

  /**
   * Get interactions for wallet
   */
  getInteractions(
    walletAddress: string,
    options?: {
      contractAddress?: string;
      chainId?: number;
      startTime?: number;
      endTime?: number;
      limit?: number;
    }
  ): ContractInteraction[] {
    const key = walletAddress.toLowerCase();
    let interactions = this.interactions.get(key) || [];

    if (options?.contractAddress) {
      interactions = interactions.filter(
        i => i.contractAddress.toLowerCase() === options.contractAddress!.toLowerCase()
      );
    }

    if (options?.chainId) {
      interactions = interactions.filter(i => i.chainId === options.chainId);
    }

    if (options?.startTime) {
      interactions = interactions.filter(i => i.timestamp >= options.startTime!);
    }

    if (options?.endTime) {
      interactions = interactions.filter(i => i.timestamp <= options.endTime!);
    }

    // Sort by timestamp descending
    interactions.sort((a, b) => b.timestamp - a.timestamp);

    if (options?.limit) {
      interactions = interactions.slice(0, options.limit);
    }

    return interactions;
  }

  /**
   * Get statistics
   */
  getStats(walletAddress: string): InteractionStats {
    const interactions = this.getInteractions(walletAddress);
    
    const uniqueContracts = new Set(interactions.map(i => i.contractAddress.toLowerCase())).size;
    const totalGasCost = interactions.reduce((sum, i) => sum + i.gasCost, 0);
    const totalValueSent = interactions.reduce((sum, i) => sum + i.valueUSD, 0);

    // Group by contract
    const byContract: Record<string, {
      count: number;
      totalGasCost: number;
      lastInteraction: number;
    }> = {};

    interactions.forEach(interaction => {
      const contractKey = interaction.contractAddress.toLowerCase();
      if (!byContract[contractKey]) {
        byContract[contractKey] = {
          count: 0,
          totalGasCost: 0,
          lastInteraction: 0,
        };
      }

      byContract[contractKey].count++;
      byContract[contractKey].totalGasCost += interaction.gasCost;
      byContract[contractKey].lastInteraction = Math.max(
        byContract[contractKey].lastInteraction,
        interaction.timestamp
      );
    });

    // Group by function
    const byFunction: Record<string, number> = {};
    interactions.forEach(interaction => {
      byFunction[interaction.functionName] = (byFunction[interaction.functionName] || 0) + 1;
    });

    // Group by chain
    const byChain: Record<number, number> = {};
    interactions.forEach(interaction => {
      byChain[interaction.chainId] = (byChain[interaction.chainId] || 0) + 1;
    });

    // Calculate risk score
    const failedInteractions = interactions.filter(i => i.status === 'failed').length;
    const failureRate = interactions.length > 0 ? (failedInteractions / interactions.length) * 100 : 0;
    
    // Risk factors: high failure rate, many unique contracts, high gas costs
    let riskScore = 0;
    if (failureRate > 20) {
      riskScore += 30;
    } else if (failureRate > 10) {
      riskScore += 15;
    }

    if (uniqueContracts > 100) {
      riskScore += 20;
    } else if (uniqueContracts > 50) {
      riskScore += 10;
    }

    if (totalGasCost > 1000) {
      riskScore += 10;
    }

    return {
      totalInteractions: interactions.length,
      uniqueContracts,
      totalGasCost: Math.round(totalGasCost * 100) / 100,
      totalValueSent: Math.round(totalValueSent * 100) / 100,
      byContract,
      byFunction,
      byChain,
      riskScore: Math.min(100, riskScore),
    };
  }

  /**
   * Get most interacted contracts
   */
  getMostInteractedContracts(walletAddress: string, limit = 10): Array<{
    contractAddress: string;
    contractName?: string;
    interactionCount: number;
    totalGasCost: number;
    lastInteraction: number;
  }> {
    const stats = this.getStats(walletAddress);
    
    return Object.entries(stats.byContract)
      .map(([address, data]) => ({
        contractAddress: address,
        interactionCount: data.count,
        totalGasCost: Math.round(data.totalGasCost * 100) / 100,
        lastInteraction: data.lastInteraction,
      }))
      .sort((a, b) => b.interactionCount - a.interactionCount)
      .slice(0, limit);
  }

  /**
   * Search interactions
   */
  searchInteractions(
    walletAddress: string,
    query: string
  ): ContractInteraction[] {
    const interactions = this.getInteractions(walletAddress);
    const queryLower = query.toLowerCase();

    return interactions.filter(interaction =>
      interaction.contractAddress.toLowerCase().includes(queryLower) ||
      interaction.contractName?.toLowerCase().includes(queryLower) ||
      interaction.contractLabel?.toLowerCase().includes(queryLower) ||
      interaction.functionName.toLowerCase().includes(queryLower) ||
      interaction.transactionHash.toLowerCase().includes(queryLower)
    );
  }

  /**
   * Clear interactions
   */
  clear(walletAddress?: string): void {
    if (walletAddress) {
      this.interactions.delete(walletAddress.toLowerCase());
    } else {
      this.interactions.clear();
    }
  }
}

// Singleton instance
export const smartContractInteractionHistory = new SmartContractInteractionHistory();

