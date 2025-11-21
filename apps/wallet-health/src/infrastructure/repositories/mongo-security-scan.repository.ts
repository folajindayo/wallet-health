/**
 * MongoDB Security Scan Repository
 */

import {
  ISecurityScanRepository,
  SecurityScanFilters,
} from '../../domain/repositories/security-scan.repository';
import { SecurityScanEntity, RiskLevel } from '../../domain/entities/security-scan.entity';

export class MongoSecurityScanRepository implements ISecurityScanRepository {
  constructor(private readonly db: any) {}

  async findById(id: string): Promise<SecurityScanEntity | null> {
    const scan = await this.db.collection('security_scans').findOne({ id });
    return scan ? this.toDomain(scan) : null;
  }

  async findByWallet(
    address: string,
    chainId: number
  ): Promise<SecurityScanEntity | null> {
    const scan = await this.db
      .collection('security_scans')
      .findOne({ walletAddress: address.toLowerCase(), chainId });
    return scan ? this.toDomain(scan) : null;
  }

  async findAll(filters: SecurityScanFilters): Promise<SecurityScanEntity[]> {
    const query = this.buildQuery(filters);
    const scans = await this.db.collection('security_scans').find(query).toArray();
    return scans.map((scan: any) => this.toDomain(scan));
  }

  async create(scan: SecurityScanEntity): Promise<SecurityScanEntity> {
    const data = this.toData(scan);
    await this.db.collection('security_scans').insertOne(data);
    return scan;
  }

  async update(id: string, scan: SecurityScanEntity): Promise<SecurityScanEntity> {
    const data = this.toData(scan);
    await this.db.collection('security_scans').updateOne({ id }, { $set: data });
    return scan;
  }

  async delete(id: string): Promise<void> {
    await this.db.collection('security_scans').deleteOne({ id });
  }

  async getLatestScan(
    address: string,
    chainId: number
  ): Promise<SecurityScanEntity | null> {
    const scan = await this.db
      .collection('security_scans')
      .findOne(
        { walletAddress: address.toLowerCase(), chainId },
        { sort: { scanDate: -1 } }
      );
    return scan ? this.toDomain(scan) : null;
  }

  private buildQuery(filters: SecurityScanFilters): any {
    const query: any = {};

    if (filters.walletAddress) {
      query.walletAddress = filters.walletAddress.toLowerCase();
    }

    if (filters.chainId) {
      query.chainId = filters.chainId;
    }

    if (filters.riskLevel) {
      query.riskLevel = filters.riskLevel;
    }

    if (filters.fromDate || filters.toDate) {
      query.scanDate = {};
      if (filters.fromDate) {
        query.scanDate.$gte = filters.fromDate;
      }
      if (filters.toDate) {
        query.scanDate.$lte = filters.toDate;
      }
    }

    return query;
  }

  private toDomain(data: any): SecurityScanEntity {
    return SecurityScanEntity.create({
      id: data.id,
      walletAddress: data.walletAddress,
      chainId: data.chainId,
      score: data.score,
      riskLevel: data.riskLevel as RiskLevel,
      threats: data.threats || [],
      scanDate: new Date(data.scanDate),
      recommendations: data.recommendations || [],
    });
  }

  private toData(entity: SecurityScanEntity): any {
    return {
      id: entity.id,
      walletAddress: entity.walletAddress.toLowerCase(),
      chainId: entity.chainId,
      score: entity.score,
      riskLevel: entity.riskLevel,
      threats: entity.threats,
      scanDate: entity.scanDate,
      recommendations: [],
    };
  }
}

