/**
 * Security Scan Mapper
 */

import { SecurityScanEntity } from '../../domain/entities/security-scan.entity';
import { SecurityScanDTO } from '../dtos/security-scan.dto';

export class SecurityScanMapper {
  static toDTO(entity: SecurityScanEntity): SecurityScanDTO {
    return {
      id: entity.id,
      walletAddress: entity.walletAddress,
      chainId: entity.chainId,
      score: entity.score,
      riskLevel: entity.riskLevel,
      threats: entity.threats,
      scanDate: entity.scanDate.toISOString(),
      recommendations: [],
      isSafe: entity.isSafe(),
      hasCriticalThreats: entity.hasCriticalThreats(),
    };
  }

  static toDTOList(entities: SecurityScanEntity[]): SecurityScanDTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }
}

