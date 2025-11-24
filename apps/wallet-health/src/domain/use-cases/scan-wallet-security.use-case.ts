/**
 * Scan Wallet Security Use Case
 */

import { ISecurityScanRepository } from '../repositories/security-scan.repository';
import { SecurityScanEntity, RiskLevel, Threat, ThreatType } from '../entities/security-scan.entity';

export interface ScanWalletRequest {
  walletAddress: string;
  chainId: number;
}

export class ScanWalletSecurityUseCase {
  constructor(private readonly scanRepository: ISecurityScanRepository) {}

  async execute(request: ScanWalletRequest): Promise<SecurityScanEntity> {
    // Perform security analysis
    const threats = await this.analyzeThreats(request.walletAddress, request.chainId);
    const score = this.calculateScore(threats);
    const riskLevel = this.determineRiskLevel(score);
    const recommendations = this.generateRecommendations(threats);

    const scan = SecurityScanEntity.create({
      id: this.generateId(),
      walletAddress: request.walletAddress,
      chainId: request.chainId,
      score,
      riskLevel,
      threats,
      scanDate: new Date(),
      recommendations,
    });

    return await this.scanRepository.create(scan);
  }

  private async analyzeThreats(address: string, chainId: number): Promise<Threat[]> {
    // Implementation would check approvals, contracts, etc.
    return [];
  }

  private calculateScore(threats: Threat[]): number {
    let score = 100;
    
    for (const threat of threats) {
      switch (threat.severity) {
        case RiskLevel.CRITICAL:
          score -= 30;
          break;
        case RiskLevel.HIGH:
          score -= 20;
          break;
        case RiskLevel.MEDIUM:
          score -= 10;
          break;
        case RiskLevel.LOW:
          score -= 5;
          break;
      }
    }

    return Math.max(0, score);
  }

  private determineRiskLevel(score: number): RiskLevel {
    if (score >= 80) return RiskLevel.LOW;
    if (score >= 60) return RiskLevel.MEDIUM;
    if (score >= 40) return RiskLevel.HIGH;
    return RiskLevel.CRITICAL;
  }

  private generateRecommendations(threats: Threat[]): string[] {
    const recommendations: string[] = [];
    
    if (threats.some((t) => t.type === ThreatType.MALICIOUS_APPROVAL)) {
      recommendations.push('Revoke suspicious token approvals immediately');
    }
    
    if (threats.some((t) => t.type === ThreatType.HIGH_VALUE_EXPOSURE)) {
      recommendations.push('Consider moving high-value assets to a hardware wallet');
    }

    return recommendations;
  }

  private generateId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}


