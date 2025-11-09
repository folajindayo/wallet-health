/**
 * NFT Security Scanner Utility
 * Scans NFTs for security risks and suspicious activity
 */

export interface NFTInfo {
  contractAddress: string;
  tokenId: string;
  name: string;
  description?: string;
  image?: string;
  collection?: string;
  chainId: number;
  owner: string;
  isVerified: boolean;
  isSuspicious: boolean;
  riskScore: number;
  risks: NFTRisk[];
}

export interface NFTRisk {
  type: 'unverified_contract' | 'suspicious_collection' | 'recent_mint' | 'low_volume' | 'phishing';
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation?: string;
}

export interface NFTCollectionInfo {
  contractAddress: string;
  name: string;
  symbol: string;
  chainId: number;
  totalSupply: number;
  verified: boolean;
  floorPrice?: number;
  volume24h?: number;
  volume7d?: number;
  holders?: number;
  riskScore: number;
}

export class NFTSecurityScanner {
  /**
   * Scan NFT for security risks
   */
  async scanNFT(
    contractAddress: string,
    tokenId: string,
    chainId: number
  ): Promise<NFTInfo> {
    const risks: NFTRisk[] = [];
    let riskScore = 100;

    // Check if contract is verified
    const isVerified = await this.checkContractVerification(contractAddress, chainId);
    if (!isVerified) {
      risks.push({
        type: 'unverified_contract',
        severity: 'high',
        description: 'NFT contract is not verified on block explorer',
        recommendation: 'Verify contract authenticity before interacting',
      });
      riskScore -= 30;
    }

    // Check collection reputation
    const collectionInfo = await this.getCollectionInfo(contractAddress, chainId);
    if (collectionInfo && collectionInfo.riskScore < 50) {
      risks.push({
        type: 'suspicious_collection',
        severity: 'high',
        description: 'Collection has low reputation or suspicious activity',
        recommendation: 'Research collection before purchasing',
      });
      riskScore -= 25;
    }

    // Check if recently minted (potential spam)
    const mintDate = await this.getMintDate(contractAddress, tokenId, chainId);
    if (mintDate && Date.now() - mintDate < 7 * 24 * 60 * 60 * 1000) {
      risks.push({
        type: 'recent_mint',
        severity: 'low',
        description: 'NFT was minted within the last 7 days',
        recommendation: 'Verify authenticity if received unexpectedly',
      });
      riskScore -= 10;
    }

    // Check collection volume (low volume = potential scam)
    if (collectionInfo && collectionInfo.volume24h && collectionInfo.volume24h < 0.1) {
      risks.push({
        type: 'low_volume',
        severity: 'medium',
        description: 'Collection has very low trading volume',
        recommendation: 'Exercise caution with low-volume collections',
      });
      riskScore -= 15;
    }

    const isSuspicious = riskScore < 50 || risks.some(r => r.severity === 'high');

    return {
      contractAddress,
      tokenId,
      name: '', // Would be fetched from metadata
      chainId,
      owner: '', // Would be fetched from contract
      isVerified,
      isSuspicious,
      riskScore: Math.max(0, riskScore),
      risks,
    };
  }

  /**
   * Scan multiple NFTs
   */
  async scanNFTs(
    nfts: Array<{ contractAddress: string; tokenId: string; chainId: number }>
  ): Promise<NFTInfo[]> {
    return Promise.all(
      nfts.map(nft => this.scanNFT(nft.contractAddress, nft.tokenId, nft.chainId))
    );
  }

  /**
   * Get collection information
   */
  async getCollectionInfo(
    contractAddress: string,
    chainId: number
  ): Promise<NFTCollectionInfo | null> {
    // Placeholder - would fetch from GoldRush API or blockchain
    return {
      contractAddress,
      name: '',
      symbol: '',
      chainId,
      totalSupply: 0,
      verified: false,
      riskScore: 50,
    };
  }

  /**
   * Check if contract is verified
   */
  private async checkContractVerification(
    contractAddress: string,
    chainId: number
  ): Promise<boolean> {
    // Placeholder - would check block explorer API
    return false;
  }

  /**
   * Get mint date of NFT
   */
  private async getMintDate(
    contractAddress: string,
    tokenId: string,
    chainId: number
  ): Promise<number | null> {
    // Placeholder - would fetch from blockchain
    return null;
  }

  /**
   * Detect phishing NFTs (common patterns)
   */
  detectPhishingNFT(nft: NFTInfo): boolean {
    // Check for common phishing patterns
    const suspiciousPatterns = [
      /airdrop/i,
      /claim/i,
      /free/i,
      /urgent/i,
      /verify/i,
    ];

    const nameCheck = suspiciousPatterns.some(pattern => pattern.test(nft.name));
    const descCheck = nft.description && suspiciousPatterns.some(pattern => 
      pattern.test(nft.description!)
    );

    return nameCheck || descCheck || nft.isSuspicious;
  }

  /**
   * Calculate overall NFT portfolio risk
   */
  calculatePortfolioRisk(nfts: NFTInfo[]): {
    totalNFTs: number;
    riskyNFTs: number;
    averageRiskScore: number;
    criticalRisks: number;
  } {
    if (nfts.length === 0) {
      return {
        totalNFTs: 0,
        riskyNFTs: 0,
        averageRiskScore: 100,
        criticalRisks: 0,
      };
    }

    const riskyNFTs = nfts.filter(nft => nft.isSuspicious || nft.riskScore < 50);
    const averageRiskScore = nfts.reduce((sum, nft) => sum + nft.riskScore, 0) / nfts.length;
    const criticalRisks = nfts.filter(nft => 
      nft.risks.some(r => r.severity === 'high')
    ).length;

    return {
      totalNFTs: nfts.length,
      riskyNFTs: riskyNFTs.length,
      averageRiskScore: Math.round(averageRiskScore),
      criticalRisks,
    };
  }
}

// Singleton instance
export const nftSecurityScanner = new NFTSecurityScanner();

