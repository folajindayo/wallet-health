/**
 * Carbon Footprint Tracker Utility
 * Tracks carbon footprint of blockchain transactions
 */

export interface CarbonEmission {
  transactionHash: string;
  chainId: number;
  gasUsed: number;
  carbonEmissions: number; // kg CO2
  energyConsumption: number; // kWh
  timestamp: number;
  transactionType: string;
}

export interface ChainCarbonData {
  chainId: number;
  chainName: string;
  carbonPerTransaction: number; // kg CO2 per transaction
  carbonPerGasUnit: number; // kg CO2 per gas unit
  energyPerTransaction: number; // kWh per transaction
  isProofOfStake: boolean;
}

export interface CarbonFootprint {
  walletAddress: string;
  totalEmissions: number; // kg CO2
  totalEnergy: number; // kWh
  emissionsByChain: Record<number, number>;
  emissionsByType: Record<string, number>;
  transactions: number;
  averagePerTransaction: number;
  offsetNeeded: number; // USD to offset
  recommendations: string[];
}

export class CarbonFootprintTracker {
  private emissions: CarbonEmission[] = [];
  private chainData: Map<number, ChainCarbonData> = new Map();

  constructor() {
    this.initializeChainData();
  }

  /**
   * Initialize chain carbon data
   */
  private initializeChainData(): void {
    // Ethereum (PoS after merge)
    this.chainData.set(1, {
      chainId: 1,
      chainName: 'Ethereum',
      carbonPerTransaction: 0.0001, // kg CO2 (much lower after PoS)
      carbonPerGasUnit: 0.000000001,
      energyPerTransaction: 0.0002, // kWh
      isProofOfStake: true,
    });

    // BNB Chain (PoS)
    this.chainData.set(56, {
      chainId: 56,
      chainName: 'BNB Chain',
      carbonPerTransaction: 0.00005,
      carbonPerGasUnit: 0.0000000005,
      energyPerTransaction: 0.0001,
      isProofOfStake: true,
    });

    // Polygon (PoS)
    this.chainData.set(137, {
      chainId: 137,
      chainName: 'Polygon',
      carbonPerTransaction: 0.00001,
      carbonPerGasUnit: 0.0000000001,
      energyPerTransaction: 0.00002,
      isProofOfStake: true,
    });

    // Base (L2)
    this.chainData.set(8453, {
      chainId: 8453,
      chainName: 'Base',
      carbonPerTransaction: 0.000005,
      carbonPerGasUnit: 0.00000000005,
      energyPerTransaction: 0.00001,
      isProofOfStake: true,
    });

    // Arbitrum (L2)
    this.chainData.set(42161, {
      chainId: 42161,
      chainName: 'Arbitrum',
      carbonPerTransaction: 0.000005,
      carbonPerGasUnit: 0.00000000005,
      energyPerTransaction: 0.00001,
      isProofOfStake: true,
    });
  }

  /**
   * Calculate carbon emission for transaction
   */
  calculateEmission(
    chainId: number,
    gasUsed: number,
    transactionType: string
  ): CarbonEmission {
    const chainData = this.chainData.get(chainId);

    if (!chainData) {
      // Default values for unknown chains
      return {
        transactionHash: '',
        chainId,
        gasUsed,
        carbonEmissions: gasUsed * 0.000000001,
        energyConsumption: gasUsed * 0.000000002,
        timestamp: Date.now(),
        transactionType,
      };
    }

    const carbonEmissions = chainData.carbonPerGasUnit * gasUsed;
    const energyConsumption = chainData.energyPerTransaction;

    return {
      transactionHash: '',
      chainId,
      gasUsed,
      carbonEmissions,
      energyConsumption,
      timestamp: Date.now(),
      transactionType,
    };
  }

  /**
   * Add emission
   */
  addEmission(emission: CarbonEmission): void {
    this.emissions.push(emission);
    
    // Keep only last 10000 emissions
    if (this.emissions.length > 10000) {
      this.emissions = this.emissions.slice(-10000);
    }
  }

  /**
   * Calculate wallet carbon footprint
   */
  calculateFootprint(walletAddress: string): CarbonFootprint {
    // Filter emissions for wallet (would need to match from transaction data)
    const walletEmissions = this.emissions; // Simplified

    const totalEmissions = walletEmissions.reduce(
      (sum, e) => sum + e.carbonEmissions,
      0
    );

    const totalEnergy = walletEmissions.reduce(
      (sum, e) => sum + e.energyConsumption,
      0
    );

    // Group by chain
    const emissionsByChain: Record<number, number> = {};
    walletEmissions.forEach(e => {
      emissionsByChain[e.chainId] = (emissionsByChain[e.chainId] || 0) + e.carbonEmissions;
    });

    // Group by type
    const emissionsByType: Record<string, number> = {};
    walletEmissions.forEach(e => {
      emissionsByType[e.transactionType] = (emissionsByType[e.transactionType] || 0) + e.carbonEmissions;
    });

    const averagePerTransaction = walletEmissions.length > 0
      ? totalEmissions / walletEmissions.length
      : 0;

    // Calculate offset needed (assuming $20 per ton CO2)
    const offsetNeeded = (totalEmissions / 1000) * 20; // Convert kg to tons, multiply by price

    // Generate recommendations
    const recommendations: string[] = [];

    if (totalEmissions > 1) {
      recommendations.push('Consider using Layer 2 solutions to reduce carbon footprint');
    }

    const highEmissionChains = Object.entries(emissionsByChain)
      .filter(([_, emissions]) => emissions > 0.1)
      .map(([chainId]) => parseInt(chainId));

    if (highEmissionChains.length > 0) {
      recommendations.push('Consider migrating to more energy-efficient chains');
    }

    if (offsetNeeded > 0) {
      recommendations.push(`Consider offsetting ${totalEmissions.toFixed(4)} kg CO2 ($${offsetNeeded.toFixed(2)})`);
    }

    return {
      walletAddress,
      totalEmissions: Math.round(totalEmissions * 10000) / 10000,
      totalEnergy: Math.round(totalEnergy * 10000) / 10000,
      emissionsByChain,
      emissionsByType,
      transactions: walletEmissions.length,
      averagePerTransaction: Math.round(averagePerTransaction * 10000) / 10000,
      offsetNeeded: Math.round(offsetNeeded * 100) / 100,
      recommendations,
    };
  }

  /**
   * Compare chains by carbon footprint
   */
  compareChains(chainIds: number[]): Array<ChainCarbonData & { rank: number }> {
    const chains = chainIds
      .map(id => this.chainData.get(id))
      .filter((c): c is ChainCarbonData => c !== undefined);

    // Sort by carbon per transaction (lowest first)
    chains.sort((a, b) => a.carbonPerTransaction - b.carbonPerTransaction);

    return chains.map((chain, index) => ({
      ...chain,
      rank: index + 1,
    }));
  }

  /**
   * Get chain carbon data
   */
  getChainData(chainId: number): ChainCarbonData | null {
    return this.chainData.get(chainId) || null;
  }

  /**
   * Clear emissions
   */
  clear(): void {
    this.emissions = [];
  }
}

// Singleton instance
export const carbonFootprintTracker = new CarbonFootprintTracker();

