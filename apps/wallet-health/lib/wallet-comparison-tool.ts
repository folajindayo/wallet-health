/**
 * Wallet Comparison Tool
 * Advanced wallet comparison with detailed analytics
 */

import type { TokenApproval, TokenInfo } from '@wallet-health/types';

export interface WalletComparison {
  wallet1: {
    address: string;
    score: number;
    riskLevel: 'safe' | 'moderate' | 'critical';
    totalValueUSD?: number;
    approvals: TokenApproval[];
    tokens: TokenInfo[];
  };
  wallet2: {
    address: string;
    score: number;
    riskLevel: 'safe' | 'moderate' | 'critical';
    totalValueUSD?: number;
    approvals: TokenApproval[];
    tokens: TokenInfo[];
  };
  comparison: {
    scoreDifference: number;
    riskLevelComparison: string;
    valueDifference?: number;
    valueDifferencePercentage?: number;
    commonApprovals: TokenApproval[];
    uniqueApprovals1: TokenApproval[];
    uniqueApprovals2: TokenApproval[];
    commonTokens: TokenInfo[];
    uniqueTokens1: TokenInfo[];
    uniqueTokens2: TokenInfo[];
    approvalSimilarity: number; // 0-100
    tokenSimilarity: number; // 0-100
    overallSimilarity: number; // 0-100
  };
  insights: string[];
  recommendations: string[];
}

export interface MultiWalletComparison {
  wallets: Array<{
    address: string;
    score: number;
    riskLevel: 'safe' | 'moderate' | 'critical';
    totalValueUSD?: number;
  }>;
  rankings: Array<{
    address: string;
    rank: number;
    score: number;
    riskLevel: 'safe' | 'moderate' | 'critical';
  }>;
  statistics: {
    averageScore: number;
    bestScore: number;
    worstScore: number;
    scoreDistribution: {
      safe: number;
      moderate: number;
      critical: number;
    };
  };
  commonalities: {
    commonApprovals: TokenApproval[];
    commonTokens: TokenInfo[];
    sharedContracts: string[];
  };
}

export class WalletComparisonTool {
  /**
   * Compare two wallets
   */
  compareWallets(
    wallet1: {
      address: string;
      score: number;
      riskLevel: 'safe' | 'moderate' | 'critical';
      totalValueUSD?: number;
      approvals: TokenApproval[];
      tokens: TokenInfo[];
    },
    wallet2: {
      address: string;
      score: number;
      riskLevel: 'safe' | 'moderate' | 'critical';
      totalValueUSD?: number;
      approvals: TokenApproval[];
      tokens: TokenInfo[];
    }
  ): WalletComparison {
    // Calculate similarities
    const approvalSimilarity = this.calculateApprovalSimilarity(
      wallet1.approvals,
      wallet2.approvals
    );
    const tokenSimilarity = this.calculateTokenSimilarity(
      wallet1.tokens,
      wallet2.tokens
    );
    const overallSimilarity = (approvalSimilarity + tokenSimilarity) / 2;

    // Find common and unique items
    const commonApprovals = this.findCommonApprovals(
      wallet1.approvals,
      wallet2.approvals
    );
    const uniqueApprovals1 = this.findUniqueApprovals(
      wallet1.approvals,
      wallet2.approvals
    );
    const uniqueApprovals2 = this.findUniqueApprovals(
      wallet2.approvals,
      wallet1.approvals
    );

    const commonTokens = this.findCommonTokens(wallet1.tokens, wallet2.tokens);
    const uniqueTokens1 = this.findUniqueTokens(wallet1.tokens, wallet2.tokens);
    const uniqueTokens2 = this.findUniqueTokens(wallet2.tokens, wallet1.tokens);

    // Calculate value difference
    const valueDifference = wallet1.totalValueUSD && wallet2.totalValueUSD
      ? wallet2.totalValueUSD - wallet1.totalValueUSD
      : undefined;
    const valueDifferencePercentage = wallet1.totalValueUSD && wallet2.totalValueUSD && wallet1.totalValueUSD > 0
      ? ((valueDifference! / wallet1.totalValueUSD) * 100)
      : undefined;

    // Generate insights
    const insights = this.generateInsights(
      wallet1,
      wallet2,
      approvalSimilarity,
      tokenSimilarity
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      wallet1,
      wallet2,
      commonApprovals,
      uniqueApprovals1,
      uniqueApprovals2
    );

    return {
      wallet1,
      wallet2,
      comparison: {
        scoreDifference: wallet2.score - wallet1.score,
        riskLevelComparison: this.compareRiskLevels(wallet1.riskLevel, wallet2.riskLevel),
        valueDifference,
        valueDifferencePercentage: valueDifferencePercentage
          ? Math.round(valueDifferencePercentage * 100) / 100
          : undefined,
        commonApprovals,
        uniqueApprovals1,
        uniqueApprovals2,
        commonTokens,
        uniqueTokens1,
        uniqueTokens2,
        approvalSimilarity: Math.round(approvalSimilarity * 100) / 100,
        tokenSimilarity: Math.round(tokenSimilarity * 100) / 100,
        overallSimilarity: Math.round(overallSimilarity * 100) / 100,
      },
      insights,
      recommendations,
    };
  }

  /**
   * Compare multiple wallets
   */
  compareMultipleWallets(
    wallets: Array<{
      address: string;
      score: number;
      riskLevel: 'safe' | 'moderate' | 'critical';
      totalValueUSD?: number;
      approvals: TokenApproval[];
      tokens: TokenInfo[];
    }>
  ): MultiWalletComparison {
    // Sort by score
    const sorted = [...wallets].sort((a, b) => b.score - a.score);

    const rankings = sorted.map((wallet, index) => ({
      address: wallet.address,
      rank: index + 1,
      score: wallet.score,
      riskLevel: wallet.riskLevel,
    }));

    // Calculate statistics
    const scores = wallets.map(w => w.score);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    const scoreDistribution = {
      safe: wallets.filter(w => w.riskLevel === 'safe').length,
      moderate: wallets.filter(w => w.riskLevel === 'moderate').length,
      critical: wallets.filter(w => w.riskLevel === 'critical').length,
    };

    // Find commonalities
    const commonApprovals = this.findCommonApprovalsAcrossWallets(
      wallets.map(w => w.approvals)
    );
    const commonTokens = this.findCommonTokensAcrossWallets(
      wallets.map(w => w.tokens)
    );

    const contractSet = new Set<string>();
    wallets.forEach(wallet => {
      wallet.approvals.forEach(approval => {
        contractSet.add(approval.spender.toLowerCase());
      });
    });
    const sharedContracts = Array.from(contractSet);

    return {
      wallets,
      rankings,
      statistics: {
        averageScore: Math.round(averageScore * 100) / 100,
        bestScore: Math.max(...scores),
        worstScore: Math.min(...scores),
        scoreDistribution,
      },
      commonalities: {
        commonApprovals,
        commonTokens,
        sharedContracts,
      },
    };
  }

  /**
   * Calculate approval similarity
   */
  private calculateApprovalSimilarity(
    approvals1: TokenApproval[],
    approvals2: TokenApproval[]
  ): number {
    if (approvals1.length === 0 && approvals2.length === 0) return 100;

    const set1 = new Set(
      approvals1.map(a => `${a.token.toLowerCase()}-${a.spender.toLowerCase()}`)
    );
    const set2 = new Set(
      approvals2.map(a => `${a.token.toLowerCase()}-${a.spender.toLowerCase()}`)
    );

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
  }

  /**
   * Calculate token similarity
   */
  private calculateTokenSimilarity(
    tokens1: TokenInfo[],
    tokens2: TokenInfo[]
  ): number {
    if (tokens1.length === 0 && tokens2.length === 0) return 100;

    const set1 = new Set(tokens1.map(t => t.address.toLowerCase()));
    const set2 = new Set(tokens2.map(t => t.address.toLowerCase()));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
  }

  /**
   * Find common approvals
   */
  private findCommonApprovals(
    approvals1: TokenApproval[],
    approvals2: TokenApproval[]
  ): TokenApproval[] {
    const set2 = new Set(
      approvals2.map(a => `${a.token.toLowerCase()}-${a.spender.toLowerCase()}`)
    );

    return approvals1.filter(a =>
      set2.has(`${a.token.toLowerCase()}-${a.spender.toLowerCase()}`)
    );
  }

  /**
   * Find unique approvals
   */
  private findUniqueApprovals(
    approvals1: TokenApproval[],
    approvals2: TokenApproval[]
  ): TokenApproval[] {
    const set2 = new Set(
      approvals2.map(a => `${a.token.toLowerCase()}-${a.spender.toLowerCase()}`)
    );

    return approvals1.filter(
      a => !set2.has(`${a.token.toLowerCase()}-${a.spender.toLowerCase()}`)
    );
  }

  /**
   * Find common tokens
   */
  private findCommonTokens(tokens1: TokenInfo[], tokens2: TokenInfo[]): TokenInfo[] {
    const set2 = new Set(tokens2.map(t => t.address.toLowerCase()));
    return tokens1.filter(t => set2.has(t.address.toLowerCase()));
  }

  /**
   * Find unique tokens
   */
  private findUniqueTokens(tokens1: TokenInfo[], tokens2: TokenInfo[]): TokenInfo[] {
    const set2 = new Set(tokens2.map(t => t.address.toLowerCase()));
    return tokens1.filter(t => !set2.has(t.address.toLowerCase()));
  }

  /**
   * Find common approvals across multiple wallets
   */
  private findCommonApprovalsAcrossWallets(
    approvalsList: TokenApproval[][]
  ): TokenApproval[] {
    if (approvalsList.length === 0) return [];

    let common = approvalsList[0];

    for (let i = 1; i < approvalsList.length; i++) {
      common = this.findCommonApprovals(common, approvalsList[i]);
    }

    return common;
  }

  /**
   * Find common tokens across multiple wallets
   */
  private findCommonTokensAcrossWallets(tokensList: TokenInfo[][]): TokenInfo[] {
    if (tokensList.length === 0) return [];

    let common = tokensList[0];

    for (let i = 1; i < tokensList.length; i++) {
      common = this.findCommonTokens(common, tokensList[i]);
    }

    return common;
  }

  /**
   * Compare risk levels
   */
  private compareRiskLevels(
    level1: 'safe' | 'moderate' | 'critical',
    level2: 'safe' | 'moderate' | 'critical'
  ): string {
    if (level1 === level2) {
      return `Both wallets have ${level1} risk level`;
    }

    const levels = { safe: 3, moderate: 2, critical: 1 };
    const diff = levels[level1] - levels[level2];

    if (diff > 0) {
      return `Wallet 1 has better risk level (${level1} vs ${level2})`;
    } else {
      return `Wallet 2 has better risk level (${level2} vs ${level1})`;
    }
  }

  /**
   * Generate insights
   */
  private generateInsights(
    wallet1: any,
    wallet2: any,
    approvalSimilarity: number,
    tokenSimilarity: number
  ): string[] {
    const insights: string[] = [];

    if (approvalSimilarity > 80) {
      insights.push('Wallets have very similar approval patterns');
    }

    if (tokenSimilarity > 80) {
      insights.push('Wallets hold very similar token portfolios');
    }

    if (wallet1.score > wallet2.score + 20) {
      insights.push('Wallet 1 has significantly better security score');
    } else if (wallet2.score > wallet1.score + 20) {
      insights.push('Wallet 2 has significantly better security score');
    }

    if (wallet1.totalValueUSD && wallet2.totalValueUSD) {
      const ratio = wallet2.totalValueUSD / wallet1.totalValueUSD;
      if (ratio > 2) {
        insights.push('Wallet 2 has significantly higher portfolio value');
      } else if (ratio < 0.5) {
        insights.push('Wallet 1 has significantly higher portfolio value');
      }
    }

    return insights;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    wallet1: any,
    wallet2: any,
    commonApprovals: TokenApproval[],
    uniqueApprovals1: TokenApproval[],
    uniqueApprovals2: TokenApproval[]
  ): string[] {
    const recommendations: string[] = [];

    if (wallet1.score < wallet2.score) {
      recommendations.push(
        `Consider applying security practices from wallet 2 to improve wallet 1's score`
      );
    }

    if (uniqueApprovals1.length > 5) {
      recommendations.push(
        `Wallet 1 has ${uniqueApprovals1.length} unique approvals - review for potential risks`
      );
    }

    if (commonApprovals.length > 0) {
      recommendations.push(
        `Both wallets share ${commonApprovals.length} approval(s) - ensure they're all necessary`
      );
    }

    return recommendations;
  }
}

// Singleton instance
export const walletComparisonTool = new WalletComparisonTool();
