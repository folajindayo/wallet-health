/**
 * Security Scan Repository Interface
 */

import { SecurityScanEntity } from '../entities/security-scan.entity';

export interface SecurityScanFilters {
  walletAddress?: string;
  chainId?: number;
  riskLevel?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface ISecurityScanRepository {
  findById(id: string): Promise<SecurityScanEntity | null>;
  findByWallet(address: string, chainId: number): Promise<SecurityScanEntity | null>;
  findAll(filters: SecurityScanFilters): Promise<SecurityScanEntity[]>;
  create(scan: SecurityScanEntity): Promise<SecurityScanEntity>;
  update(id: string, scan: SecurityScanEntity): Promise<SecurityScanEntity>;
  delete(id: string): Promise<void>;
  getLatestScan(address: string, chainId: number): Promise<SecurityScanEntity | null>;
}

