'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, FileCheck, AlertTriangle, Coins, TrendingUp, Clock } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { WalletScanResult } from '@wallet-health/types';

interface WalletStatsProps {
  scanResult: WalletScanResult;
}

export function WalletStats({ scanResult }: WalletStatsProps) {
  // Calculate statistics
  const totalTokens = scanResult.tokens.length;
  const cleanTokens = scanResult.tokens.filter(t => !t.isSpam).length;
  const spamTokens = scanResult.tokens.filter(t => t.isSpam).length;
  const totalApprovals = scanResult.approvals.length;
  const riskyApprovals = scanResult.approvals.filter(a => a.isRisky || a.isUnlimited).length;
  const portfolioValue = scanResult.tokens
    .filter(t => !t.isSpam)
    .reduce((sum, token) => sum + (token.value || 0), 0);
  const highAlerts = scanResult.alerts.filter(a => a.severity === 'high').length;

  const stats = [
    {
      icon: Shield,
      label: 'Security Score',
      value: `${scanResult.score}/100`,
      subValue: scanResult.riskLevel,
      color: scanResult.riskLevel === 'safe' ? 'text-green-500' :
             scanResult.riskLevel === 'moderate' ? 'text-yellow-500' : 'text-red-500',
      bgColor: scanResult.riskLevel === 'safe' ? 'bg-green-500/10' :
               scanResult.riskLevel === 'moderate' ? 'bg-yellow-500/10' : 'bg-red-500/10',
    },
    {
      icon: Coins,
      label: 'Portfolio Value',
      value: formatCurrency(portfolioValue),
      subValue: `${cleanTokens} tokens`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: FileCheck,
      label: 'Token Approvals',
      value: totalApprovals.toString(),
      subValue: riskyApprovals > 0 ? `${riskyApprovals} risky` : 'All safe',
      color: riskyApprovals > 0 ? 'text-yellow-500' : 'text-green-500',
      bgColor: riskyApprovals > 0 ? 'bg-yellow-500/10' : 'bg-green-500/10',
    },
    {
      icon: AlertTriangle,
      label: 'Risk Alerts',
      value: scanResult.alerts.length.toString(),
      subValue: highAlerts > 0 ? `${highAlerts} critical` : 'Low priority',
      color: highAlerts > 0 ? 'text-red-500' : 'text-blue-500',
      bgColor: highAlerts > 0 ? 'bg-red-500/10' : 'bg-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {stat.subValue}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

