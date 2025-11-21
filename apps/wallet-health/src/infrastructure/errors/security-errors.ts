/**
 * Security-related Error Classes
 */

export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message);
    this.name = 'SecurityError';
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class ThreatDetectedError extends SecurityError {
  constructor(
    message: string = 'Security threat detected',
    public threatType: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) {
    super(message, 'THREAT_DETECTED', severity);
    this.name = 'ThreatDetectedError';
    Object.setPrototypeOf(this, ThreatDetectedError.prototype);
  }
}

export class ScanFailedError extends SecurityError {
  constructor(message: string = 'Security scan failed') {
    super(message, 'SCAN_FAILED', 'medium');
    this.name = 'ScanFailedError';
    Object.setPrototypeOf(this, ScanFailedError.prototype);
  }
}

export class InvalidWalletError extends SecurityError {
  constructor(message: string = 'Invalid wallet address') {
    super(message, 'INVALID_WALLET', 'low');
    this.name = 'InvalidWalletError';
    Object.setPrototypeOf(this, InvalidWalletError.prototype);
  }
}

