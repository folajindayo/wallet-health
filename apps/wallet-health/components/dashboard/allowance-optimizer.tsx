'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  Info,
  TrendingDown
} from 'lucide-react';
import { useState } from 'react';

interface TokenApproval {
  tokenSymbol: string;
  tokenName: string;
  spender: string;
  spenderName?: string;
  amount: string;
  isUnlimited: boolean;
  lastUsed: Date;
  daysSinceLastUse: number;
  risk: 'safe' | 'warning' | 'danger';
}

interface AllowanceOptimizerProps {
  approvals?: TokenApproval[];
  onOptimize?: (approval: TokenApproval, action: 'revoke' | 'limit') => void;
}

export function AllowanceOptimizer({ approvals = [], onOptimize }: AllowanceOptimizerProps) {
  const [processing, setProcessing] = useState<string | null>(null);

  // Mock data if none provided
  const mockApprovals: TokenApproval[] = [
    {
      tokenSymbol: 'USDT',
      tokenName: 'Tether USD',
      spender: '0x742d...3f8a',
      spenderName: 'Unknown Contract',
      amount: 'Unlimited',
      isUnlimited: true,
      lastUsed: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      daysSinceLastUse: 365,
      risk: 'danger',
    },
    {
      tokenSymbol: 'USDC',
      tokenName: 'USD Coin',
      spender: '0x7a25...488D',
      spenderName: 'Uniswap V2',
      amount: 'Unlimited',
      isUnlimited: true,
      lastUsed: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      daysSinceLastUse: 180,
      risk: 'warning',
    },
    {
      tokenSymbol: 'DAI',
      tokenName: 'Dai Stablecoin',
      spender: '0x7d27...c7A9',
      spenderName: 'Aave',
      amount: 'Unlimited',
      isUnlimited: true,
      lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      daysSinceLastUse: 30,
      risk: 'safe',
    },
    {
      tokenSymbol: 'WETH',
      tokenName: 'Wrapped Ether',
      spender: '0x3fC9...7FAD',
      spenderName: 'Unknown DEX',
      amount: '50.0',
      isUnlimited: false,
      lastUsed: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      daysSinceLastUse: 90,
      risk: 'warning',
    },
  ];

  const displayApprovals = approvals.length > 0 ? approvals : mockApprovals;

  // Categorize approvals
  const dangerousApprovals = displayApprovals.filter(a => a.risk === 'danger');
  const warningApprovals = displayApprovals.filter(a => a.risk === 'warning');
  const safeApprovals = displayApprovals.filter(a => a.risk === 'safe');

  const handleAction = async (approval: TokenApproval, action: 'revoke' | 'limit') => {
    setProcessing(approval.spender);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    onOptimize?.(approval, action);
    setProcessing(null);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'safe':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Low Risk
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Medium Risk
          </Badge>
        );
      case 'danger':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            High Risk
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRecommendation = (approval: TokenApproval) => {
    if (approval.risk === 'danger') {
      return 'Immediate revocation recommended';
    }
    if (approval.risk === 'warning' && approval.isUnlimited) {
      return 'Consider setting a limit or revoking';
    }
    if (approval.daysSinceLastUse > 180) {
      return 'Unused for 6+ months - consider revoking';
    }
    return 'Active and monitored';
  };

  const totalSavings = dangerousApprovals.length * 5 + warningApprovals.length * 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Token Allowance Optimizer
        </CardTitle>
        <CardDescription>
          Optimize your token approvals to reduce security risks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Optimization Potential</h4>
              <p className="text-sm text-muted-foreground mb-3">
                We found {dangerousApprovals.length + warningApprovals.length} approvals that could be optimized.
                Optimizing could improve your wallet security score by up to <span className="font-bold text-primary">{totalSavings} points</span>.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="default">
                  <Zap className="h-4 w-4 mr-2" />
                  Auto-Optimize All
                </Button>
                <Button size="sm" variant="outline">
                  Review Individually
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dangerous Approvals */}
        {dangerousApprovals.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-red-600 font-semibold mb-3">
              <AlertTriangle className="h-4 w-4" />
              Critical ({dangerousApprovals.length})
            </h3>
            <div className="space-y-3">
              {dangerousApprovals.map((approval, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-red-500/30 bg-red-500/5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">
                          {approval.tokenSymbol} → {approval.spenderName || 'Unknown'}
                        </h4>
                        {getRiskBadge(approval.risk)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Amount: <span className="font-mono">{approval.amount}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">
                        Last used: {approval.daysSinceLastUse} days ago
                      </p>
                      <p className="text-xs text-amber-600 font-medium">
                        ⚠️ {getRecommendation(approval)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(approval, 'revoke')}
                      disabled={processing === approval.spender}
                    >
                      {processing === approval.spender ? 'Processing...' : 'Revoke Now'}
                    </Button>
                    {approval.isUnlimited && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(approval, 'limit')}
                        disabled={processing === approval.spender}
                      >
                        Set Limit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning Approvals */}
        {warningApprovals.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-yellow-600 font-semibold mb-3">
              <AlertTriangle className="h-4 w-4" />
              Review Recommended ({warningApprovals.length})
            </h3>
            <div className="space-y-3">
              {warningApprovals.map((approval, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">
                          {approval.tokenSymbol} → {approval.spenderName || 'Unknown'}
                        </h4>
                        {getRiskBadge(approval.risk)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Amount: <span className="font-mono">{approval.amount}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">
                        Last used: {approval.daysSinceLastUse} days ago
                      </p>
                      <p className="text-xs text-yellow-600 font-medium">
                        💡 {getRecommendation(approval)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(approval, 'revoke')}
                      disabled={processing === approval.spender}
                    >
                      {processing === approval.spender ? 'Processing...' : 'Revoke'}
                    </Button>
                    {approval.isUnlimited && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(approval, 'limit')}
                        disabled={processing === approval.spender}
                      >
                        Set Limit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safe Approvals */}
        {safeApprovals.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-green-600 font-semibold mb-3">
              <CheckCircle2 className="h-4 w-4" />
              Healthy Approvals ({safeApprovals.length})
            </h3>
            <div className="space-y-2">
              {safeApprovals.map((approval, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-green-500/30 bg-green-500/5 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-medium text-sm">
                      {approval.tokenSymbol} → {approval.spenderName || 'Unknown'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Last used {approval.daysSinceLastUse} days ago
                    </p>
                  </div>
                  {getRiskBadge(approval.risk)}
                </div>
              ))}
            </div>
          </div>
        )}

        {displayApprovals.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Approvals Found</p>
            <p className="text-xs text-muted-foreground">
              Your wallet has no token approvals to optimize
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

