/**
 * Airdrop Eligibility Checker Utility
 * Checks eligibility for various airdrops
 */

export interface AirdropCampaign {
  id: string;
  name: string;
  token: string;
  tokenSymbol: string;
  chainId: number;
  eligibilityCriteria: EligibilityCriteria;
  snapshotDate?: number;
  claimDeadline?: number;
  estimatedReward?: string;
  estimatedRewardUSD?: number;
  status: 'upcoming' | 'active' | 'claimed' | 'expired';
  website?: string;
  twitter?: string;
}

export interface EligibilityCriteria {
  minTransactions?: number;
  minVolumeUSD?: number;
  minHoldTime?: number; // days
  requiredContracts?: string[]; // Contract addresses
  requiredChains?: number[];
  minNFTs?: number;
  minDeFiPositions?: number;
  governanceParticipation?: boolean;
  earlyAdopter?: boolean; // First transaction before date
}

export interface EligibilityResult {
  campaign: AirdropCampaign;
  isEligible: boolean;
  eligibilityScore: number; // 0-100
  criteriaMet: Array<{
    criterion: string;
    met: boolean;
    value: any;
    required?: any;
  }>;
  estimatedReward?: string;
  estimatedRewardUSD?: number;
  claimStatus?: 'not_claimed' | 'claimed' | 'expired';
  recommendations: string[];
}

export class AirdropEligibilityChecker {
  private campaigns: Map<string, AirdropCampaign> = new Map();

  constructor() {
    this.initializeCampaigns();
  }

  /**
   * Add airdrop campaign
   */
  addCampaign(campaign: AirdropCampaign): void {
    this.campaigns.set(campaign.id, campaign);
  }

  /**
   * Check eligibility for a wallet
   */
  checkEligibility(
    walletAddress: string,
    campaignId: string,
    walletMetrics: {
      totalTransactions?: number;
      totalVolumeUSD?: number;
      accountAge?: number; // days
      contractInteractions?: string[];
      chainsUsed?: number[];
      nftCount?: number;
      defiPositions?: number;
      governanceParticipation?: boolean;
      firstTransaction?: number;
    }
  ): EligibilityResult | null {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      return null;
    }

    const criteria = campaign.eligibilityCriteria;
    const criteriaMet: EligibilityResult['criteriaMet'] = [];
    let eligibilityScore = 0;
    let totalCriteria = 0;

    // Check minimum transactions
    if (criteria.minTransactions !== undefined) {
      totalCriteria++;
      const met = (walletMetrics.totalTransactions || 0) >= criteria.minTransactions;
      criteriaMet.push({
        criterion: `Minimum ${criteria.minTransactions} transactions`,
        met,
        value: walletMetrics.totalTransactions || 0,
        required: criteria.minTransactions,
      });
      if (met) {
        eligibilityScore += 100 / (Object.keys(criteria).length || 1);
      }
    }

    // Check minimum volume
    if (criteria.minVolumeUSD !== undefined) {
      totalCriteria++;
      const met = (walletMetrics.totalVolumeUSD || 0) >= criteria.minVolumeUSD;
      criteriaMet.push({
        criterion: `Minimum $${criteria.minVolumeUSD} volume`,
        met,
        value: walletMetrics.totalVolumeUSD || 0,
        required: criteria.minVolumeUSD,
      });
      if (met) {
        eligibilityScore += 100 / (Object.keys(criteria).length || 1);
      }
    }

    // Check minimum hold time
    if (criteria.minHoldTime !== undefined) {
      totalCriteria++;
      const met = (walletMetrics.accountAge || 0) >= criteria.minHoldTime;
      criteriaMet.push({
        criterion: `Account age ${criteria.minHoldTime} days`,
        met,
        value: walletMetrics.accountAge || 0,
        required: criteria.minHoldTime,
      });
      if (met) {
        eligibilityScore += 100 / (Object.keys(criteria).length || 1);
      }
    }

    // Check required contracts
    if (criteria.requiredContracts && criteria.requiredContracts.length > 0) {
      totalCriteria++;
      const interactedContracts = walletMetrics.contractInteractions || [];
      const metContracts = criteria.requiredContracts.filter(c =>
        interactedContracts.some(ic => ic.toLowerCase() === c.toLowerCase())
      );
      const met = metContracts.length > 0;
      criteriaMet.push({
        criterion: `Interact with required contracts`,
        met,
        value: `${metContracts.length}/${criteria.requiredContracts.length}`,
        required: criteria.requiredContracts.length,
      });
      if (met) {
        eligibilityScore += 100 / (Object.keys(criteria).length || 1);
      }
    }

    // Check required chains
    if (criteria.requiredChains && criteria.requiredChains.length > 0) {
      totalCriteria++;
      const usedChains = walletMetrics.chainsUsed || [];
      const metChains = criteria.requiredChains.filter(c => usedChains.includes(c));
      const met = metChains.length > 0;
      criteriaMet.push({
        criterion: `Use required chains`,
        met,
        value: `${metChains.length}/${criteria.requiredChains.length}`,
        required: criteria.requiredChains.length,
      });
      if (met) {
        eligibilityScore += 100 / (Object.keys(criteria).length || 1);
      }
    }

    // Check minimum NFTs
    if (criteria.minNFTs !== undefined) {
      totalCriteria++;
      const met = (walletMetrics.nftCount || 0) >= criteria.minNFTs;
      criteriaMet.push({
        criterion: `Minimum ${criteria.minNFTs} NFTs`,
        met,
        value: walletMetrics.nftCount || 0,
        required: criteria.minNFTs,
      });
      if (met) {
        eligibilityScore += 100 / (Object.keys(criteria).length || 1);
      }
    }

    // Check minimum DeFi positions
    if (criteria.minDeFiPositions !== undefined) {
      totalCriteria++;
      const met = (walletMetrics.defiPositions || 0) >= criteria.minDeFiPositions;
      criteriaMet.push({
        criterion: `Minimum ${criteria.minDeFiPositions} DeFi positions`,
        met,
        value: walletMetrics.defiPositions || 0,
        required: criteria.minDeFiPositions,
      });
      if (met) {
        eligibilityScore += 100 / (Object.keys(criteria).length || 1);
      }
    }

    // Check governance participation
    if (criteria.governanceParticipation !== undefined) {
      totalCriteria++;
      const met = walletMetrics.governanceParticipation || false;
      criteriaMet.push({
        criterion: 'Governance participation',
        met,
        value: met,
        required: true,
      });
      if (met) {
        eligibilityScore += 100 / (Object.keys(criteria).length || 1);
      }
    }

    // Check early adopter
    if (criteria.earlyAdopter && walletMetrics.firstTransaction) {
      totalCriteria++;
      const earlyAdopterDate = new Date('2023-01-01').getTime();
      const met = walletMetrics.firstTransaction < earlyAdopterDate;
      criteriaMet.push({
        criterion: 'Early adopter (before 2023)',
        met,
        value: new Date(walletMetrics.firstTransaction).toISOString(),
        required: 'Before 2023-01-01',
      });
      if (met) {
        eligibilityScore += 100 / (Object.keys(criteria).length || 1);
      }
    }

    // Normalize score
    if (totalCriteria > 0) {
      eligibilityScore = (eligibilityScore / totalCriteria) * 100;
    }

    const isEligible = eligibilityScore >= 70; // 70% threshold

    // Generate recommendations
    const recommendations: string[] = [];
    const unmetCriteria = criteriaMet.filter(c => !c.met);
    
    if (unmetCriteria.length > 0) {
      recommendations.push(`Meet ${unmetCriteria.length} more criteria to increase eligibility.`);
      unmetCriteria.forEach(c => {
        recommendations.push(`- ${c.criterion}`);
      });
    }

    if (!isEligible && eligibilityScore > 50) {
      recommendations.push('You are close to eligibility. Complete remaining criteria.');
    }

    return {
      campaign,
      isEligible,
      eligibilityScore: Math.round(eligibilityScore * 100) / 100,
      criteriaMet,
      estimatedReward: campaign.estimatedReward,
      estimatedRewardUSD: campaign.estimatedRewardUSD,
      recommendations,
    };
  }

  /**
   * Check all campaigns
   */
  checkAllCampaigns(
    walletAddress: string,
    walletMetrics: any
  ): EligibilityResult[] {
    const results: EligibilityResult[] = [];

    this.campaigns.forEach((campaign, id) => {
      if (campaign.status === 'active' || campaign.status === 'upcoming') {
        const result = this.checkEligibility(walletAddress, id, walletMetrics);
        if (result) {
          results.push(result);
        }
      }
    });

    // Sort by eligibility score (highest first)
    results.sort((a, b) => b.eligibilityScore - a.eligibilityScore);

    return results;
  }

  /**
   * Initialize known campaigns
   */
  private initializeCampaigns(): void {
    // Example campaigns - in production, would fetch from API
    this.addCampaign({
      id: 'example-1',
      name: 'Example Airdrop',
      token: '0x...',
      tokenSymbol: 'AIRDROP',
      chainId: 1,
      eligibilityCriteria: {
        minTransactions: 10,
        minVolumeUSD: 1000,
        minHoldTime: 30,
      },
      status: 'active',
      estimatedReward: '1000',
      estimatedRewardUSD: 500,
    });
  }

  /**
   * Get all campaigns
   */
  getAllCampaigns(): AirdropCampaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Clear all campaigns
   */
  clear(): void {
    this.campaigns.clear();
  }
}

// Singleton instance
export const airdropEligibilityChecker = new AirdropEligibilityChecker();

