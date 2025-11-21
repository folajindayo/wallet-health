/**
 * Security Scan Repository Implementation (Prisma)
 */

import { ISecurityScanRepository } from '../../../domain/repositories/security-scan.repository';
import { SecurityScan } from '../../../domain/entities/security-scan.entity';
import { PrismaClient } from '@prisma/client';

export class PrismaSecurityScanRepository implements ISecurityScanRepository {
  constructor(private prisma: PrismaClient) {}

  async findByWalletAddress(address: string): Promise<SecurityScan[]> {
    const scans = await this.prisma.securityScan.findMany({
      where: { walletAddress: address },
      orderBy: { timestamp: 'desc' },
    });
    
    return scans.map(s => new SecurityScan(
      s.id,
      s.walletAddress,
      s.threats,
      s.riskScore,
      s.timestamp
    ));
  }

  async findById(id: string): Promise<SecurityScan | null> {
    const scan = await this.prisma.securityScan.findUnique({
      where: { id },
    });
    
    if (!scan) return null;
    
    return new SecurityScan(
      scan.id,
      scan.walletAddress,
      scan.threats,
      scan.riskScore,
      scan.timestamp
    );
  }

  async save(scan: SecurityScan): Promise<void> {
    await this.prisma.securityScan.upsert({
      where: { id: scan.id },
      update: {
        walletAddress: scan.walletAddress,
        threats: scan.threats,
        riskScore: scan.riskScore,
        timestamp: scan.timestamp,
      },
      create: {
        id: scan.id,
        walletAddress: scan.walletAddress,
        threats: scan.threats,
        riskScore: scan.riskScore,
        timestamp: scan.timestamp,
      },
    });
  }
}

