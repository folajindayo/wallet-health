/**
 * Risk Score Value Object
 * Represents a calculated security risk score
 */

import { RiskLevel } from '../entities/security-scan.entity';

export class RiskScore {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number): RiskScore {
    if (value < 0 || value > 100) {
      throw new Error('Risk score must be between 0 and 100');
    }
    return new RiskScore(value);
  }

  static fromThreats(threatCount: number, maxThreats: number = 10): RiskScore {
    const normalizedCount = Math.min(threatCount, maxThreats);
    const score = 100 - (normalizedCount / maxThreats) * 100;
    return new RiskScore(Math.max(0, Math.min(100, score)));
  }

  getValue(): number {
    return this.value;
  }

  getRiskLevel(): RiskLevel {
    if (this.value >= 80) return RiskLevel.LOW;
    if (this.value >= 60) return RiskLevel.MEDIUM;
    if (this.value >= 40) return RiskLevel.HIGH;
    return RiskLevel.CRITICAL;
  }

  isHigh Risk(): boolean {
    return this.value < 60;
  }

  isSafe(): boolean {
    return this.value >= 80;
  }

  toString(): string {
    return `${this.value}/100`;
  }

  toJSON() {
    return {
      value: this.value,
      riskLevel: this.getRiskLevel(),
      isSafe: this.isSafe(),
    };
  }
}


