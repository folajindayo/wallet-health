/**
 * Security Scan Factory
 */

import { SecurityScan } from '../entities/security-scan.entity';

export class SecurityScanFactory {
  static create(data: any): SecurityScan {
    return new SecurityScan(
      data.id,
      data.walletAddress,
      data.threats,
      data.riskScore,
      data.timestamp
    );
  }

  static createFromAPI(apiData: any): SecurityScan {
    return SecurityScanFactory.create({
      id: apiData.id,
      walletAddress: apiData.wallet_address,
      threats: apiData.threats || [],
      riskScore: apiData.risk_score,
      timestamp: apiData.timestamp || new Date(),
    });
  }
}

