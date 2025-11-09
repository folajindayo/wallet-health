'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertCircle, Infinity } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import type { TokenApproval } from '@wallet-health/types';

interface ApprovalListProps {
  approvals: TokenApproval[];
  chainId: number;
}

export function ApprovalList({ approvals, chainId }: ApprovalListProps) {
  const getExplorerUrl = (address: string) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      56: 'https://bscscan.com',
      137: 'https://polygonscan.com',
      8453: 'https://basescan.org',
      42161: 'https://arbiscan.io',
    };
    return `${explorers[chainId] || explorers[1]}/address/${address}`;
  };

  const getRevokeUrl = (tokenAddress: string, spenderAddress: string) => {
    return `https://revoke.cash/token/${tokenAddress}/${spenderAddress}?chainId=${chainId}`;
  };

  if (approvals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Approvals</CardTitle>
          <CardDescription>No active approvals found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your wallet has no active token approvals. This is good for security!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Token Approvals
          <span className="text-sm font-normal text-muted-foreground">({approvals.length})</span>
        </CardTitle>
        <CardDescription>
          Review and revoke unlimited or suspicious token allowances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {approvals.map((approval, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                approval.isRisky || approval.isUnlimited
                  ? 'border-destructive/50 bg-destructive/5'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Token Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">
                      {approval.tokenSymbol || 'Unknown'}
                    </span>
                    {approval.isUnlimited && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-500">
                        <Infinity className="h-3 w-3" />
                        Unlimited
                      </span>
                    )}
                    {approval.isRisky && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-destructive/20 text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        Risky
                      </span>
                    )}
                  </div>

                  {/* Spender Info */}
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>Spender:</span>
                      <a
                        href={getExplorerUrl(approval.spender)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono hover:text-primary inline-flex items-center gap-1"
                      >
                        {formatAddress(approval.spender)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    {approval.contractAge !== undefined && approval.contractAge < 30 && (
                      <div className="text-xs text-yellow-500">
                        ⚠️ New contract (less than 30 days old)
                      </div>
                    )}
                    {approval.isVerified === false && (
                      <div className="text-xs text-destructive">
                        ⚠️ Unverified contract
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => window.open(getRevokeUrl(approval.token, approval.spender), '_blank')}
                  >
                    Revoke
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(getExplorerUrl(approval.token), '_blank')}
                  >
                    View Token
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

