/**
 * Security Analysis Service
 * Application layer service for security analysis
 */

import { ScanWalletSecurityUseCase } from '../../domain/use-cases/scan-wallet-security.use-case';

export class SecurityAnalysisService {
  constructor(private readonly scanWalletUseCase: ScanWalletSecurityUseCase) {}

  async scanWallet(walletAddress: string, chainId: number) {
    return await this.scanWalletUseCase.execute({
      walletAddress,
      chainId,
    });
  }

  async getSecurityScore(walletAddress: string, chainId: number): Promise<number> {
    const scan = await this.scanWallet(walletAddress, chainId);
    return scan.score;
  }

  async isSafe(walletAddress: string, chainId: number): Promise<boolean> {
    const scan = await this.scanWallet(walletAddress, chainId);
    return scan.isSafe();
  }

  async getCriticalThreats(walletAddress: string, chainId: number) {
    const scan = await this.scanWallet(walletAddress, chainId);
    return scan.threats.filter((t) => t.severity === 'critical');
  }
}


