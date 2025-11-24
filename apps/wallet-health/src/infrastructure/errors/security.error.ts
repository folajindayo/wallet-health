/**
 * Security Errors
 */

export class SecurityError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class ScanFailedError extends SecurityError {
  constructor(reason: string) {
    super(`Security scan failed: ${reason}`, 'SCAN_FAILED', 500);
    this.name = 'ScanFailedError';
  }
}

export class ThreatDetectedError extends SecurityError {
  constructor(threatType: string) {
    super(`Threat detected: ${threatType}`, 'THREAT_DETECTED', 200);
    this.name = 'ThreatDetectedError';
  }
}


