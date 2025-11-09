/**
 * DeFi Exposure Analyzer Utility
 * Analyzes wallet's DeFi exposure and protocol interactions
 */

export interface DeFiProtocol {
  name: string;
  category: 'lending' | 'dex' | 'yield' | 'derivatives' | 'bridge' | 'staking';
  contractAddress: string;
  chainId: number;
  tvl?: number;
  apy?: number;
  riskLevel: 'low' | 'medium' | 'high';
  isVerified: boolean;
  auditStatus: 'audited' | 'unaudited' | 'in-progress';
}

export interface DeFiPosition {
  protocol: DeFiProtocol;
  positionType: 'supply' | 'borrow' | 'liquidity' | 'stake' | 'deposit';
  token: string;
  tokenSymbol: string;
  amount: string;
  valueUSD?: number;
  apy?: number;
  healthFactor?: number; // For lending protocols
  timestamp: number;
}

export interface DeFiExposure {
  totalValueUSD: number;
  positions: DeFiPosition[];
  protocols: DeFiProtocol[];
  riskBreakdown: {
    low: number;
    medium: number;
    high: number;
  };
  categoryBreakdown: {
    lending: number;
    dex: number;
    yield: number;
    derivatives: number;
    bridge: number;
    staking: number;
  };
  concentrationRisk: number; // 0-100, higher = more concentrated
  recommendations: string[];
}

export class DeFiExposureAnalyzer {
  private knownProtocols: Map<string, DeFiProtocol> = new Map();

  constructor() {
    this.initializeKnownProtocols();
  }

  /**
   * Analyze wallet's DeFi exposure
   */
  async analyzeExposure(
    walletAddress: string,
    chainId: number,
    approvals: Array<{ spender: string; token: string; allowance: string }>,
    tokens: Array<{ address: string; balance: string; symbol: string; value?: number }>
  ): Promise<DeFiExposure> {
    const positions: DeFiPosition[] = [];
    const protocols = new Set<DeFiProtocol>();

    // Identify DeFi protocols from approvals
    for (const approval of approvals) {
      const protocol = this.identifyProtocol(approval.spender, chainId);
      if (protocol) {
        protocols.add(protocol);
        
        // Try to detect position
        const position = await this.detectPosition(
          walletAddress,
          protocol,
          approval.token,
          chainId
        );
        if (position) {
          positions.push(position);
        }
      }
    }

    // Calculate total value
    const totalValueUSD = positions.reduce((sum, pos) => sum + (pos.valueUSD || 0), 0);

    // Risk breakdown
    const riskBreakdown = this.calculateRiskBreakdown(Array.from(protocols));
    
    // Category breakdown
    const categoryBreakdown = this.calculateCategoryBreakdown(positions);

    // Concentration risk
    const concentrationRisk = this.calculateConcentrationRisk(positions);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      Array.from(protocols),
      positions,
      concentrationRisk
    );

    return {
      totalValueUSD,
      positions,
      protocols: Array.from(protocols),
      riskBreakdown,
      categoryBreakdown,
      concentrationRisk,
      recommendations,
    };
  }

  /**
   * Identify protocol from contract address
   */
  private identifyProtocol(contractAddress: string, chainId: number): DeFiProtocol | null {
    const key = `${chainId}-${contractAddress.toLowerCase()}`;
    return this.knownProtocols.get(key) || null;
  }

  /**
   * Detect DeFi position
   */
  private async detectPosition(
    walletAddress: string,
    protocol: DeFiProtocol,
    tokenAddress: string,
    chainId: number
  ): Promise<DeFiPosition | null> {
    // Placeholder - would query protocol contracts or APIs
    return null;
  }

  /**
   * Calculate risk breakdown
   */
  private calculateRiskBreakdown(protocols: DeFiProtocol[]): {
    low: number;
    medium: number;
    high: number;
  } {
    const breakdown = { low: 0, medium: 0, high: 0 };
    
    protocols.forEach(protocol => {
      breakdown[protocol.riskLevel]++;
    });

    return breakdown;
  }

  /**
   * Calculate category breakdown
   */
  private calculateCategoryBreakdown(positions: DeFiPosition[]): {
    lending: number;
    dex: number;
    yield: number;
    derivatives: number;
    bridge: number;
    staking: number;
  } {
    const breakdown = {
      lending: 0,
      dex: 0,
      yield: 0,
      derivatives: 0,
      bridge: 0,
      staking: 0,
    };

    positions.forEach(position => {
      const category = position.protocol.category;
      breakdown[category] += position.valueUSD || 0;
    });

    return breakdown;
  }

  /**
   * Calculate concentration risk
   */
  private calculateConcentrationRisk(positions: DeFiPosition[]): number {
    if (positions.length === 0) return 0;

    const totalValue = positions.reduce((sum, pos) => sum + (pos.valueUSD || 0), 0);
    if (totalValue === 0) return 0;

    // Calculate Herfindahl-Hirschman Index (HHI)
    let hhi = 0;
    positions.forEach(position => {
      const share = (position.valueUSD || 0) / totalValue;
      hhi += share * share;
    });

    // Convert HHI (0-1) to risk score (0-100)
    // HHI of 1 = 100% concentration = 100 risk
    return Math.round(hhi * 100);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    protocols: DeFiProtocol[],
    positions: DeFiPosition[],
    concentrationRisk: number
  ): string[] {
    const recommendations: string[] = [];

    // High concentration risk
    if (concentrationRisk > 70) {
      recommendations.push(
        'High concentration risk detected. Consider diversifying across multiple protocols.'
      );
    }

    // Unaudited protocols
    const unaudited = protocols.filter(p => p.auditStatus === 'unaudited');
    if (unaudited.length > 0) {
      recommendations.push(
        `${unaudited.length} unaudited protocol(s) detected. Exercise caution with unaudited protocols.`
      );
    }

    // High-risk protocols
    const highRisk = protocols.filter(p => p.riskLevel === 'high');
    if (highRisk.length > 0) {
      recommendations.push(
        `${highRisk.length} high-risk protocol(s) detected. Review and consider reducing exposure.`
      );
    }

    // Low diversity
    if (protocols.length < 3 && positions.length > 0) {
      recommendations.push(
        'Low protocol diversity. Consider spreading exposure across more protocols.'
      );
    }

    return recommendations;
  }

  /**
   * Initialize known DeFi protocols
   */
  private initializeKnownProtocols(): void {
    // Ethereum Mainnet
    this.addProtocol({
      name: 'Uniswap V3',
      category: 'dex',
      contractAddress: '0x68b3465833fb72A70ecDF485E0ae4C1e9AD4599B',
      chainId: 1,
      riskLevel: 'low',
      isVerified: true,
      auditStatus: 'audited',
    });

    this.addProtocol({
      name: 'Aave V3',
      category: 'lending',
      contractAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      chainId: 1,
      riskLevel: 'low',
      isVerified: true,
      auditStatus: 'audited',
    });

    // Add more protocols as needed
  }

  /**
   * Add protocol to known list
   */
  private addProtocol(protocol: DeFiProtocol): void {
    const key = `${protocol.chainId}-${protocol.contractAddress.toLowerCase()}`;
    this.knownProtocols.set(key, protocol);
  }
}

// Singleton instance
export const defiExposureAnalyzer = new DeFiExposureAnalyzer();

