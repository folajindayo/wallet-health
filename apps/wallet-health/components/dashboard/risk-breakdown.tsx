'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Minus } from 'lucide-react';
import type { RiskScore } from '@/lib/risk-scorer';

interface RiskBreakdownProps {
  riskScore: RiskScore;
}

export function RiskBreakdown({ riskScore }: RiskBreakdownProps) {
  const factors = [
    {
      label: 'Active Approvals',
      value: riskScore.factors.activeApprovalsCount,
      threshold: 10,
      impact: riskScore.factors.activeApprovalsCount > 10 ? -15 : 0,
      status: riskScore.factors.activeApprovalsCount <= 10 ? 'good' : 'bad',
      description: riskScore.factors.activeApprovalsCount > 10 
        ? 'Too many active approvals' 
        : 'Acceptable number of approvals',
    },
    {
      label: 'Unverified Contracts',
      value: riskScore.factors.unverifiedContractsCount,
      threshold: 0,
      impact: riskScore.factors.unverifiedContractsCount * -25,
      status: riskScore.factors.unverifiedContractsCount === 0 ? 'good' : 'bad',
      description: riskScore.factors.unverifiedContractsCount === 0
        ? 'No unverified contract approvals'
        : `${riskScore.factors.unverifiedContractsCount} unverified contract(s)`,
    },
    {
      label: 'New Contracts (<30 days)',
      value: riskScore.factors.newContractsCount,
      threshold: 0,
      impact: riskScore.factors.newContractsCount * -10,
      status: riskScore.factors.newContractsCount === 0 ? 'good' : 'warning',
      description: riskScore.factors.newContractsCount === 0
        ? 'No recent contract approvals'
        : `${riskScore.factors.newContractsCount} new contract(s)`,
    },
    {
      label: 'Spam Tokens',
      value: riskScore.factors.spamTokensCount,
      threshold: 0,
      impact: riskScore.factors.spamTokensCount > 0 ? -20 : 0,
      status: riskScore.factors.spamTokensCount === 0 ? 'good' : 'warning',
      description: riskScore.factors.spamTokensCount === 0
        ? 'No spam tokens detected'
        : `${riskScore.factors.spamTokensCount} spam token(s)`,
    },
    {
      label: 'Verified Protocols',
      value: riskScore.factors.verifiedProtocolsCount,
      threshold: 1,
      impact: riskScore.factors.hasENS || riskScore.factors.verifiedProtocolsCount > 0 ? 10 : 0,
      status: riskScore.factors.verifiedProtocolsCount > 0 || riskScore.factors.hasENS ? 'good' : 'neutral',
      description: riskScore.factors.verifiedProtocolsCount > 0 || riskScore.factors.hasENS
        ? 'Uses verified protocols'
        : 'No verified protocols detected',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'bad':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'bad':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Factor Breakdown</CardTitle>
        <CardDescription>
          Detailed analysis of factors affecting your security score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {factors.map((factor, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(factor.status)}
                  <div>
                    <div className="font-medium text-sm">{factor.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {factor.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{factor.value}</div>
                  <div className={`text-xs font-medium ${
                    factor.impact > 0 ? 'text-green-500' :
                    factor.impact < 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {factor.impact > 0 && '+'}
                    {factor.impact} pts
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Total Score */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Total Security Score</span>
              <span className="text-2xl font-bold text-primary">
                {riskScore.score}/100
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  riskScore.riskLevel === 'safe' ? 'bg-green-500' :
                  riskScore.riskLevel === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${riskScore.score}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

