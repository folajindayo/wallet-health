/**
 * Scanner Adapter
 */

export interface ScannerAdapter {
  scanAddress(address: string): Promise<ScanResult>;
  getApprovals(address: string): Promise<Approval[]>;
}

export interface ScanResult {
  score: number;
  risks: Array<{ type: string; severity: string }>;
}

export interface Approval {
  token: string;
  spender: string;
  amount: string;
}

export class SecurityScannerAdapter implements ScannerAdapter {
  async scanAddress(address: string): Promise<ScanResult> {
    // Implementation would integrate with actual security scanning API
    return {
      score: 75,
      risks: [],
    };
  }

  async getApprovals(address: string): Promise<Approval[]> {
    // Implementation would fetch actual approvals
    return [];
  }
}

