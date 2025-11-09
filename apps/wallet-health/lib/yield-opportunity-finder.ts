/**
 * Yield Opportunity Finder Utility
 * Finds best yield farming opportunities
 */

export interface YieldOpportunity {
  protocol: string;
  protocolAddress: string;
  chainId: number;
  token: string;
  tokenSymbol: string;
  apy: number;
  apr: number;
  tvl: number; // USD
  minDeposit?: string;
  maxDeposit?: string;
  lockPeriod?: number; // days
  riskLevel: 'low' | 'medium' | 'high';
  auditStatus: 'audited' | 'unaudited' | 'in-progress';
  category: 'lending' | 'liquidity' | 'staking' | 'yield_farming';
  description: string;
  requirements?: string[];
}

export interface YieldComparison {
  opportunities: YieldOpportunity[];
  bestByAPY: YieldOpportunity | null;
  bestByRisk: YieldOpportunity | null;
  bestByTVL: YieldOpportunity | null;
  recommendations: Array<{
    opportunity: YieldOpportunity;
    reason: string;
    score: number; // 0-100
  }>;
}

export interface YieldFilter {
  minAPY?: number;
  maxAPY?: number;
  chains?: number[];
  categories?: YieldOpportunity['category'][];
  riskLevels?: YieldOpportunity['riskLevel'][];
  minTVL?: number;
  auditedOnly?: boolean;
}

export class YieldOpportunityFinder {
  private opportunities: Map<string, YieldOpportunity> = new Map();

  constructor() {
    this.initializeOpportunities();
  }

  /**
   * Add yield opportunity
   */
  addOpportunity(opportunity: YieldOpportunity): void {
    const key = `${opportunity.protocolAddress.toLowerCase()}-${opportunity.token.toLowerCase()}-${opportunity.chainId}`;
    this.opportunities.set(key, opportunity);
  }

  /**
   * Find opportunities
   */
  findOpportunities(filter?: YieldFilter): YieldOpportunity[] {
    let filtered = Array.from(this.opportunities.values());

    if (filter) {
      if (filter.minAPY !== undefined) {
        filtered = filtered.filter(o => o.apy >= filter.minAPY!);
      }
      if (filter.maxAPY !== undefined) {
        filtered = filtered.filter(o => o.apy <= filter.maxAPY!);
      }
      if (filter.chains && filter.chains.length > 0) {
        filtered = filtered.filter(o => filter.chains!.includes(o.chainId));
      }
      if (filter.categories && filter.categories.length > 0) {
        filtered = filtered.filter(o => filter.categories!.includes(o.category));
      }
      if (filter.riskLevels && filter.riskLevels.length > 0) {
        filtered = filtered.filter(o => filter.riskLevels!.includes(o.riskLevel));
      }
      if (filter.minTVL !== undefined) {
        filtered = filtered.filter(o => o.tvl >= filter.minTVL!);
      }
      if (filter.auditedOnly) {
        filtered = filtered.filter(o => o.auditStatus === 'audited');
      }
    }

    // Sort by APY (highest first)
    filtered.sort((a, b) => b.apy - a.apy);

    return filtered;
  }

  /**
   * Compare opportunities
   */
  compareOpportunities(
    opportunities: YieldOpportunity[],
    userPreferences?: {
      riskTolerance?: 'low' | 'medium' | 'high';
      preferredChains?: number[];
      minTVL?: number;
    }
  ): YieldComparison {
    if (opportunities.length === 0) {
      return {
        opportunities: [],
        bestByAPY: null,
        bestByRisk: null,
        bestByTVL: null,
        recommendations: [],
      };
    }

    // Find best by APY
    const bestByAPY = opportunities.reduce((best, current) =>
      current.apy > best.apy ? current : best
    );

    // Find best by risk (lowest risk with good APY)
    const lowRiskOpportunities = opportunities.filter(o => o.riskLevel === 'low');
    const bestByRisk = lowRiskOpportunities.length > 0
      ? lowRiskOpportunities.reduce((best, current) =>
          current.apy > best.apy ? current : best
        )
      : opportunities.reduce((best, current) =>
          this.getRiskScore(current.riskLevel) < this.getRiskScore(best.riskLevel)
            ? current
            : best
        );

    // Find best by TVL (highest TVL)
    const bestByTVL = opportunities.reduce((best, current) =>
      current.tvl > best.tvl ? current : best
    );

    // Generate recommendations with scoring
    const recommendations = opportunities.map(opportunity => {
      let score = 0;
      const reasons: string[] = [];

      // APY score (0-40 points)
      const maxAPY = Math.max(...opportunities.map(o => o.apy));
      score += (opportunity.apy / maxAPY) * 40;
      reasons.push(`APY: ${opportunity.apy}%`);

      // Risk score (0-30 points, lower risk = higher score)
      const riskScore = this.getRiskScore(opportunity.riskLevel);
      score += (1 - riskScore / 3) * 30;
      reasons.push(`Risk: ${opportunity.riskLevel}`);

      // TVL score (0-20 points)
      const maxTVL = Math.max(...opportunities.map(o => o.tvl));
      score += (opportunity.tvl / maxTVL) * 20;
      reasons.push(`TVL: $${opportunity.tvl.toLocaleString()}`);

      // Audit score (0-10 points)
      if (opportunity.auditStatus === 'audited') {
        score += 10;
        reasons.push('Audited protocol');
      }

      // User preferences bonus
      if (userPreferences) {
        if (userPreferences.preferredChains?.includes(opportunity.chainId)) {
          score += 5;
          reasons.push('Preferred chain');
        }
        if (userPreferences.minTVL && opportunity.tvl >= userPreferences.minTVL) {
          score += 5;
          reasons.push('Meets TVL requirement');
        }
      }

      return {
        opportunity,
        reason: reasons.join(', '),
        score: Math.round(score * 100) / 100,
      };
    });

    // Sort recommendations by score
    recommendations.sort((a, b) => b.score - a.score);

    return {
      opportunities,
      bestByAPY,
      bestByRisk,
      bestByTVL,
      recommendations: recommendations.slice(0, 10), // Top 10
    };
  }

  /**
   * Get risk score (0-3, lower = better)
   */
  private getRiskScore(riskLevel: YieldOpportunity['riskLevel']): number {
    const scores = { low: 1, medium: 2, high: 3 };
    return scores[riskLevel];
  }

  /**
   * Find opportunities for specific token
   */
  findOpportunitiesForToken(
    tokenAddress: string,
    chainId?: number
  ): YieldOpportunity[] {
    let filtered = Array.from(this.opportunities.values()).filter(
      o => o.token.toLowerCase() === tokenAddress.toLowerCase()
    );

    if (chainId) {
      filtered = filtered.filter(o => o.chainId === chainId);
    }

    return filtered.sort((a, b) => b.apy - a.apy);
  }

  /**
   * Get top opportunities
   */
  getTopOpportunities(
    limit = 10,
    filter?: YieldFilter
  ): YieldOpportunity[] {
    return this.findOpportunities(filter).slice(0, limit);
  }

  /**
   * Initialize known opportunities
   */
  private initializeOpportunities(): void {
    // Example opportunities - in production, would fetch from DeFi APIs
    this.addOpportunity({
      protocol: 'Aave',
      protocolAddress: '0x...',
      chainId: 1,
      token: '0x...',
      tokenSymbol: 'USDC',
      apy: 5.2,
      apr: 5.0,
      tvl: 1000000000,
      riskLevel: 'low',
      auditStatus: 'audited',
      category: 'lending',
      description: 'Lend USDC on Aave',
    });

    this.addOpportunity({
      protocol: 'Uniswap V3',
      protocolAddress: '0x...',
      chainId: 1,
      token: '0x...',
      tokenSymbol: 'ETH/USDC',
      apy: 12.5,
      apr: 11.8,
      tvl: 500000000,
      riskLevel: 'medium',
      auditStatus: 'audited',
      category: 'liquidity',
      description: 'Provide liquidity to ETH/USDC pool',
    });
  }

  /**
   * Clear all opportunities
   */
  clear(): void {
    this.opportunities.clear();
  }
}

// Singleton instance
export const yieldOpportunityFinder = new YieldOpportunityFinder();

