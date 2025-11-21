/**
 * Get Threat Report Use Case
 */

import { ISecurityScanRepository } from '../repositories/security-scan.repository';

export interface GetThreatReportRequest {
  walletAddress: string;
  chainId: number;
}

export interface ThreatReport {
  totalThreats: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  mostRecentScan: Date;
  riskTrend: 'improving' | 'declining' | 'stable';
}

export class GetThreatReportUseCase {
  constructor(private readonly scanRepository: ISecurityScanRepository) {}

  async execute(request: GetThreatReportRequest): Promise<ThreatReport> {
    const scan = await this.scanRepository.getLatestScan(
      request.walletAddress,
      request.chainId
    );

    if (!scan) {
      throw new Error('No security scan found for this wallet');
    }

    const threats = scan.threats;
    const criticalCount = threats.filter((t) => t.severity === 'critical').length;
    const highCount = threats.filter((t) => t.severity === 'high').length;
    const mediumCount = threats.filter((t) => t.severity === 'medium').length;
    const lowCount = threats.filter((t) => t.severity === 'low').length;

    return {
      totalThreats: threats.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      mostRecentScan: scan.scanDate,
      riskTrend: 'stable', // Would be calculated from historical data
    };
  }
}

