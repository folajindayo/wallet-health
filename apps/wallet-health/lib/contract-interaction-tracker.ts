/**
 * Smart Contract Interaction Tracker
 * Tracks all smart contract interactions and analyzes patterns
 */

export interface ContractInteraction {
  hash: string;
  timestamp: number;
  chainId: number;
  from: string;
  to: string; // Contract address
  value: string;
  method?: string;
  methodSignature?: string;
  gasUsed?: number;
  gasPrice?: string;
  status: 'success' | 'failed' | 'pending';
  data?: string;
  events?: Array<{
    name: string;
    signature: string;
    topics: string[];
    data: string;
  }>;
  metadata?: Record<string, any>;
}

export interface ContractProfile {
  address: string;
  chainId: number;
  name?: string;
  type?: 'defi' | 'nft' | 'exchange' | 'bridge' | 'governance' | 'other';
  isVerified: boolean;
  interactionCount: number;
  firstInteraction: number;
  lastInteraction: number;
  totalValue: string;
  totalGasUsed: number;
  methods: Record<string, number>; // method -> count
  successRate: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface InteractionAnalysis {
  interactions: ContractInteraction[];
  contracts: Map<string, ContractProfile>; // address -> profile
  summary: {
    totalInteractions: number;
    uniqueContracts: number;
    totalGasUsed: number;
    totalValue: string;
    successRate: number;
    timeRange: {
      start: number;
      end: number;
    };
  };
  patterns: {
    mostUsedContracts: Array<{ address: string; count: number }>;
    mostUsedMethods: Array<{ method: string; count: number }>;
    activeHours: Record<number, number>; // hour -> count
    activeDays: Record<number, number>; // day -> count
  };
  risks: Array<{
    type: 'unverified' | 'high_failure_rate' | 'suspicious_pattern' | 'new_contract';
    severity: 'high' | 'medium' | 'low';
    description: string;
    affectedContracts: string[];
  }>;
}

export class ContractInteractionTracker {
  private interactions: Map<string, ContractInteraction[]> = new Map(); // wallet -> interactions

  /**
   * Record a contract interaction
   */
  recordInteraction(
    walletAddress: string,
    interaction: ContractInteraction
  ): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.interactions.has(walletKey)) {
      this.interactions.set(walletKey, []);
    }

    const walletInteractions = this.interactions.get(walletKey)!;
    walletInteractions.push(interaction);

    // Keep last 10000 interactions per wallet
    if (walletInteractions.length > 10000) {
      walletInteractions.shift();
    }

    // Sort by timestamp
    walletInteractions.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Analyze contract interactions
   */
  analyzeInteractions(
    walletAddress: string,
    options: {
      startDate?: number;
      endDate?: number;
      chainId?: number;
    } = {}
  ): InteractionAnalysis {
    const walletKey = walletAddress.toLowerCase();
    let interactions = this.interactions.get(walletKey) || [];

    // Apply filters
    if (options.startDate) {
      interactions = interactions.filter(i => i.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      interactions = interactions.filter(i => i.timestamp <= options.endDate!);
    }

    if (options.chainId) {
      interactions = interactions.filter(i => i.chainId === options.chainId);
    }

    // Build contract profiles
    const contracts = new Map<string, ContractProfile>();

    interactions.forEach(interaction => {
      const contractKey = `${interaction.to.toLowerCase()}-${interaction.chainId}`;
      let profile = contracts.get(contractKey);

      if (!profile) {
        profile = {
          address: interaction.to,
          chainId: interaction.chainId,
          isVerified: false, // Would check from contract verification API
          interactionCount: 0,
          firstInteraction: interaction.timestamp,
          lastInteraction: interaction.timestamp,
          totalValue: '0',
          totalGasUsed: 0,
          methods: {},
          successRate: 0,
          riskLevel: 'medium',
        };
        contracts.set(contractKey, profile);
      }

      profile.interactionCount++;
      profile.firstInteraction = Math.min(profile.firstInteraction, interaction.timestamp);
      profile.lastInteraction = Math.max(profile.lastInteraction, interaction.timestamp);
      profile.totalValue = (
        BigInt(profile.totalValue) + BigInt(interaction.value || '0')
      ).toString();
      profile.totalGasUsed += interaction.gasUsed || 0;

      if (interaction.method) {
        profile.methods[interaction.method] = (profile.methods[interaction.method] || 0) + 1;
      }
    });

    // Calculate success rates and risk levels
    contracts.forEach((profile, key) => {
      const contractInteractions = interactions.filter(
        i => `${i.to.toLowerCase()}-${i.chainId}` === key
      );
      const successful = contractInteractions.filter(i => i.status === 'success').length;
      profile.successRate = contractInteractions.length > 0
        ? (successful / contractInteractions.length) * 100
        : 0;

      // Determine risk level
      if (!profile.isVerified) {
        profile.riskLevel = 'high';
      } else if (profile.successRate < 80) {
        profile.riskLevel = 'medium';
      } else {
        profile.riskLevel = 'low';
      }
    });

    // Calculate summary
    const successful = interactions.filter(i => i.status === 'success').length;
    const totalGasUsed = interactions.reduce((sum, i) => sum + (i.gasUsed || 0), 0);
    const totalValue = interactions.reduce(
      (sum, i) => sum + BigInt(i.value || '0'),
      BigInt(0)
    ).toString();

    const timestamps = interactions.map(i => i.timestamp);
    const timeRange = {
      start: timestamps.length > 0 ? Math.min(...timestamps) : Date.now(),
      end: timestamps.length > 0 ? Math.max(...timestamps) : Date.now(),
    };

    // Identify patterns
    const contractCounts = new Map<string, number>();
    interactions.forEach(i => {
      const key = `${i.to.toLowerCase()}-${i.chainId}`;
      contractCounts.set(key, (contractCounts.get(key) || 0) + 1);
    });

    const mostUsedContracts = Array.from(contractCounts.entries())
      .map(([address, count]) => ({ address, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const methodCounts = new Map<string, number>();
    interactions.forEach(i => {
      if (i.method) {
        methodCounts.set(i.method, (methodCounts.get(i.method) || 0) + 1);
      }
    });

    const mostUsedMethods = Array.from(methodCounts.entries())
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Time patterns
    const activeHours: Record<number, number> = {};
    const activeDays: Record<number, number> = {};

    interactions.forEach(i => {
      const date = new Date(i.timestamp * 1000);
      const hour = date.getHours();
      const day = date.getDay();

      activeHours[hour] = (activeHours[hour] || 0) + 1;
      activeDays[day] = (activeDays[day] || 0) + 1;
    });

    // Detect risks
    const risks = this.detectRisks(interactions, contracts);

    return {
      interactions,
      contracts,
      summary: {
        totalInteractions: interactions.length,
        uniqueContracts: contracts.size,
        totalGasUsed,
        totalValue,
        successRate: interactions.length > 0 ? (successful / interactions.length) * 100 : 0,
        timeRange,
      },
      patterns: {
        mostUsedContracts,
        mostUsedMethods,
        activeHours,
        activeDays,
      },
      risks,
    };
  }

  /**
   * Get interactions for a specific contract
   */
  getContractInteractions(
    walletAddress: string,
    contractAddress: string,
    chainId: number
  ): ContractInteraction[] {
    const walletKey = walletAddress.toLowerCase();
    const interactions = this.interactions.get(walletKey) || [];

    return interactions.filter(
      i => i.to.toLowerCase() === contractAddress.toLowerCase() && i.chainId === chainId
    );
  }

  /**
   * Get contract profile
   */
  getContractProfile(
    walletAddress: string,
    contractAddress: string,
    chainId: number
  ): ContractProfile | null {
    const analysis = this.analyzeInteractions(walletAddress, { chainId });
    const key = `${contractAddress.toLowerCase()}-${chainId}`;
    return analysis.contracts.get(key) || null;
  }

  /**
   * Detect risks in interactions
   */
  private detectRisks(
    interactions: ContractInteraction[],
    contracts: Map<string, ContractProfile>
  ): InteractionAnalysis['risks'] {
    const risks: InteractionAnalysis['risks'] = [];

    // Unverified contracts
    const unverifiedContracts: string[] = [];
    contracts.forEach((profile, key) => {
      if (!profile.isVerified) {
        unverifiedContracts.push(profile.address);
      }
    });

    if (unverifiedContracts.length > 0) {
      risks.push({
        type: 'unverified',
        severity: 'high',
        description: `${unverifiedContracts.length} unverified contract(s) detected`,
        affectedContracts: unverifiedContracts,
      });
    }

    // High failure rate
    const highFailureContracts: string[] = [];
    contracts.forEach((profile, key) => {
      if (profile.successRate < 50) {
        highFailureContracts.push(profile.address);
      }
    });

    if (highFailureContracts.length > 0) {
      risks.push({
        type: 'high_failure_rate',
        severity: 'medium',
        description: `${highFailureContracts.length} contract(s) with high failure rate`,
        affectedContracts: highFailureContracts,
      });
    }

    // New contracts (first interaction in last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newContracts: string[] = [];
    contracts.forEach((profile, key) => {
      if (profile.firstInteraction >= sevenDaysAgo) {
        newContracts.push(profile.address);
      }
    });

    if (newContracts.length > 0) {
      risks.push({
        type: 'new_contract',
        severity: 'medium',
        description: `${newContracts.length} newly interacted contract(s)`,
        affectedContracts: newContracts,
      });
    }

    return risks;
  }
}

// Singleton instance
export const contractInteractionTracker = new ContractInteractionTracker();
