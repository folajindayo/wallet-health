/**
 * Security Score Value Object
 */

export class SecurityScore {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  static create(value: number): SecurityScore {
    if (value < 0 || value > 100) {
      throw new Error('Security score must be between 0 and 100');
    }
    return new SecurityScore(value);
  }

  get value(): number {
    return this._value;
  }

  get riskLevel(): 'safe' | 'moderate' | 'critical' {
    if (this._value >= 80) return 'safe';
    if (this._value >= 50) return 'moderate';
    return 'critical';
  }

  get color(): string {
    if (this._value >= 80) return 'green';
    if (this._value >= 50) return 'yellow';
    return 'red';
  }

  toString(): string {
    return `${this._value}/100`;
  }
}

