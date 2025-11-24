/**
 * Yield Farming Opportunity Finder Utility
 * Find yield farming opportunities
 */

export interface YieldOpportunity {
  id: string;
  protocol: string;
  protocolLogo?: string;
  chainId: number;
  chainName: string;
  poolName: string;
  poolAddress: string;
  token0: string;
  token0Symbol: string;
  token1?: string;
  token1Symbol?: string;
  apy: number; // Annual percentage yield
  apy7d?: number; // 7-day APY
  apy30d?: number; // 30-day APY
  tvl: number; // Total value locked (USD)
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  minimumDeposit?: number; // USD
  lockPeriod?: number; // days
  isVerified: boolean;
  auditStatus: 'audited' | 'unaudited' | 'in-progress';
  createdAt: number;
}

export interface OpportunityFilter {
  minAPY?: number;
  maxRisk?: 'low' | 'medium' | 'high';
  chainIds?: number[];
  protocols?: string[];
  minTVL?: number;
  verifiedOnly?: boolean;
}

export interface OpportunityComparison {
  opportunities: YieldOpportunity[];
  bestAPY: YieldOpportunity | null;
  lowestRisk: YieldOpportunity | null;
  highestTVL: YieldOpportunity | null;
  recommendations: Array<{
    opportunity: YieldOpportunity;
    reason: string;
    score: number; // 0-100
  }>;
}

export class YieldFarmingOpportunityFinder {
  private opportunities: Map<string, YieldOpportunity> = new Map();

  /**
   * Add opportunity
   */
  addOpportunity(opportunity: Omit<YieldOpportunity, 'id' | 'createdAt'>): YieldOpportunity {
    const id = `opportunity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullOpportunity: YieldOpportunity = {
      ...opportunity,
      id,
      createdAt: Date.now(),
    };

    this.opportunities.set(id, fullOpportunity);
    return fullOpportunity;
  }

  /**
   * Find opportunities
   */
  findOpportunities(filter?: OpportunityFilter): YieldOpportunity[] {
    let opportunities = Array.from(this.opportunities.values());

    if (filter?.minAPY) {
      opportunities = opportunities.filter(o => o.apy >= filter.minAPY!);
    }

    if (filter?.maxRisk) {
      const riskOrder = { low: 1, medium: 2, high: 3 };
      const maxRiskOrder = riskOrder[filter.maxRisk];
      opportunities = opportunities.filter(
        o => riskOrder[o.riskLevel] <= maxRiskOrder
      );
    }

    if (filter?.chainIds && filter.chainIds.length > 0) {
      opportunities = opportunities.filter(o => filter.chainIds!.includes(o.chainId));
    }

    if (filter?.protocols && filter.protocols.length > 0) {
      opportunities = opportunities.filter(o => filter.protocols!.includes(o.protocol));
    }

    if (filter?.minTVL) {
      opportunities = opportunities.filter(o => o.tvl >= filter.minTVL!);
    }

    if (filter?.verifiedOnly) {
      opportunities = opportunities.filter(o => o.isVerified);
    }

    // Sort by APY descending
    opportunities.sort((a, b) => b.apy - a.apy);

    return opportunities;
  }

  /**
   * Compare opportunities
   */
  compareOpportunities(opportunityIds: string[]): OpportunityComparison | null {
    const opportunities = opportunityIds
      .map(id => this.opportunities.get(id))
      .filter((o): o is YieldOpportunity => o !== undefined);

    if (opportunities.length === 0) {
      return null;
    }

    const bestAPY = opportunities.reduce((best, current) =>
      current.apy > best.apy ? current : best
    );

    const lowestRisk = opportunities.reduce((lowest, current) => {
      const riskOrder = { low: 1, medium: 2, high: 3 };
      return riskOrder[current.riskLevel] < riskOrder[lowest.riskLevel] ? current : lowest;
    });

    const highestTVL = opportunities.reduce((highest, current) =>
      current.tvl > highest.tvl ? current : highest
    );

    // Generate recommendations with scoring
    const recommendations = opportunities.map(opportunity => {
      let score = 0;
      let reason = '';

      // APY score (0-40 points)
      const maxAPY = Math.max(...opportunities.map(o => o.apy));
      score += (opportunity.apy / maxAPY) * 40;

      // Risk score (0-30 points, lower risk = higher score)
      const riskScores = { low: 30, medium: 15, high: 5 };
      score += riskScores[opportunity.riskLevel];

      // TVL score (0-20 points)
      const maxTVL = Math.max(...opportunities.map(o => o.tvl));
      score += (opportunity.tvl / maxTVL) * 20;

      // Verification score (0-10 points)
      if (opportunity.isVerified) {
        score += 10;
      }

      if (score >= 80) {
        reason = 'Excellent opportunity with high APY and low risk';
      } else if (score >= 60) {
        reason = 'Good opportunity with balanced risk/reward';
      } else {
        reason = 'Moderate opportunity, consider alternatives';
      }

      return {
        opportunity,
        reason,
        score: Math.round(score),
      };
    }).sort((a, b) => b.score - a.score);

    return {
      opportunities,
      bestAPY,
      lowestRisk,
      highestTVL,
      recommendations,
    };
  }

  /**
   * Get opportunity by ID
   */
  getOpportunity(id: string): YieldOpportunity | null {
    return this.opportunities.get(id) || null;
  }

  /**
   * Get top opportunities
   */
  getTopOpportunities(limit = 10, filter?: OpportunityFilter): YieldOpportunity[] {
    return this.findOpportunities(filter).slice(0, limit);
  }

  /**
   * Calculate risk-adjusted APY
   */
  calculateRiskAdjustedAPY(opportunity: YieldOpportunity): number {
    const riskMultipliers = { low: 1.0, medium: 0.8, high: 0.5 };
    return opportunity.apy * riskMultipliers[opportunity.riskLevel];
  }

  /**
   * Clear opportunities
   */
  clear(): void {
    this.opportunities.clear();
  }
}

// Singleton instance
export const yieldFarmingOpportunityFinder = new YieldFarmingOpportunityFinder();

