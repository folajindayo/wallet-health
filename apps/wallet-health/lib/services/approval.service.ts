/**
 * Approval Service
 */

export interface TokenApproval {
  tokenAddress: string;
  spender: string;
  amount: string;
  isUnlimited: boolean;
  timestamp: Date;
}

export class ApprovalService {
  async getApprovals(walletAddress: string): Promise<TokenApproval[]> {
    const response = await fetch(`/api/approvals?address=${walletAddress}`);
    if (!response.ok) throw new Error('Failed to fetch approvals');
    return response.json();
  }

  async revokeApproval(tokenAddress: string, spender: string): Promise<string> {
    const response = await fetch('/api/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenAddress, spender }),
    });
    if (!response.ok) throw new Error('Failed to revoke approval');
    const data = await response.json();
    return data.txHash;
  }
}

