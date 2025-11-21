/**
 * Security Controller
 */

import { SecurityAnalysisService } from '../../application/services/security-analysis.service';
import { SecurityScanMapper } from '../../application/mappers/security-scan.mapper';

export class SecurityController {
  constructor(private readonly securityService: SecurityAnalysisService) {}

  async scanWallet(req: { walletAddress: string; chainId: number }) {
    try {
      const scan = await this.securityService.scanWallet(
        req.walletAddress,
        req.chainId
      );

      return {
        success: true,
        data: SecurityScanMapper.toDTO(scan),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getSecurityScore(req: { walletAddress: string; chainId: number }) {
    try {
      const score = await this.securityService.getSecurityScore(
        req.walletAddress,
        req.chainId
      );

      return {
        success: true,
        data: { score },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getCriticalThreats(req: { walletAddress: string; chainId: number }) {
    try {
      const threats = await this.securityService.getCriticalThreats(
        req.walletAddress,
        req.chainId
      );

      return {
        success: true,
        data: { threats },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

