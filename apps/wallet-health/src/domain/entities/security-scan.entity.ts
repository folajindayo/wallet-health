/**
 * Security Scan Entity
 * Represents a wallet security scan with risk assessment
 */

export interface SecurityScanProps {
  id: string;
  walletAddress: string;
  chainId: number;
  score: number;
  riskLevel: RiskLevel;
  threats: Threat[];
  scanDate: Date;
  recommendations: string[];
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface Threat {
  type: ThreatType;
  severity: RiskLevel;
  description: string;
  affectedAddresses?: string[];
}

export enum ThreatType {
  MALICIOUS_APPROVAL = 'malicious_approval',
  SUSPICIOUS_CONTRACT = 'suspicious_contract',
  HIGH_VALUE_EXPOSURE = 'high_value_exposure',
  PHISHING_RISK = 'phishing_risk',
  OUTDATED_APPROVAL = 'outdated_approval',
}

export class SecurityScanEntity {
  private constructor(private readonly props: SecurityScanProps) {}

  static create(props: SecurityScanProps): SecurityScanEntity {
    this.validate(props);
    return new SecurityScanEntity(props);
  }

  private static validate(props: SecurityScanProps): void {
    if (!props.id) {
      throw new Error('Scan ID is required');
    }

    if (!props.walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(props.walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    if (props.score < 0 || props.score > 100) {
      throw new Error('Score must be between 0 and 100');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get walletAddress(): string {
    return this.props.walletAddress;
  }

  get score(): number {
    return this.props.score;
  }

  get riskLevel(): RiskLevel {
    return this.props.riskLevel;
  }

  get threats(): Threat[] {
    return [...this.props.threats];
  }

  get scanDate(): Date {
    return this.props.scanDate;
  }

  isSafe(): boolean {
    return this.props.riskLevel === RiskLevel.LOW && this.props.threats.length === 0;
  }

  hasCriticalThreats(): boolean {
    return this.props.threats.some((threat) => threat.severity === RiskLevel.CRITICAL);
  }

  getThreatsBySeverity(severity: RiskLevel): Threat[] {
    return this.props.threats.filter((threat) => threat.severity === severity);
  }

  toJSON() {
    return {
      id: this.props.id,
      walletAddress: this.props.walletAddress,
      chainId: this.props.chainId,
      score: this.props.score,
      riskLevel: this.props.riskLevel,
      threats: this.props.threats,
      scanDate: this.props.scanDate.toISOString(),
      recommendations: this.props.recommendations,
      isSafe: this.isSafe(),
      hasCriticalThreats: this.hasCriticalThreats(),
    };
  }
}

