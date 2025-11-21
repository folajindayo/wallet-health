/**
 * Security Scan Mapper
 */

import { SecurityScan } from '../../domain/entities/security-scan.entity';
import { SecurityScanDTO } from '../dtos/security-scan.dto';

export class SecurityScanMapper {
  static toDTO(entity: SecurityScan): SecurityScanDTO {
    return {
      id: entity.id,
      walletAddress: entity.walletAddress,
      threats: entity.threats,
      riskScore: entity.riskScore,
      timestamp: entity.timestamp,
    };
  }

  static toDTOList(entities: SecurityScan[]): SecurityScanDTO[] {
    return entities.map(entity => this.toDTO(entity));
  }

  static toEntity(dto: SecurityScanDTO): SecurityScan {
    return new SecurityScan(
      dto.id,
      dto.walletAddress,
      dto.threats,
      dto.riskScore,
      dto.timestamp
    );
  }
}
