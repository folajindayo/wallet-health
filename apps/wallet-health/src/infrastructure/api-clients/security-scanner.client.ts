/**
 * Security Scanner API Client
 */

export class SecurityScannerClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async scanWallet(address: string, chainId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ address, chainId }),
    });

    if (!response.ok) {
      throw new Error('Failed to scan wallet');
    }

    return response.json();
  }

  async getThreats(address: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/threats/${address}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch threats');
    }

    return response.json();
  }

  async getRiskScore(address: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/risk-score/${address}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch risk score');
    }

    return response.json();
  }
}


