'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, ExternalLink, PieChart, DollarSign, Percent } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface Protocol {
  name: string;
  category: 'lending' | 'dex' | 'staking' | 'bridge' | 'other';
  logo: string;
  totalValue: number;
  positions: number;
  risk: 'low' | 'medium' | 'high';
  url?: string;
}

interface DeFiExposureProps {
  protocols?: Protocol[];
}

export function DeFiExposure({ protocols = [] }: DeFiExposureProps) {
  // Mock data if none provided
  const defaultProtocols: Protocol[] = [
    {
      name: 'Uniswap',
      category: 'dex',
      logo: '🦄',
      totalValue: 5420.50,
      positions: 3,
      risk: 'low',
      url: 'https://uniswap.org',
    },
    {
      name: 'Aave',
      category: 'lending',
      logo: '👻',
      totalValue: 12350.00,
      positions: 2,
      risk: 'low',
      url: 'https://aave.com',
    },
    {
      name: 'Curve',
      category: 'dex',
      logo: '🌊',
      totalValue: 3200.75,
      positions: 1,
      risk: 'medium',
      url: 'https://curve.fi',
    },
    {
      name: 'Lido',
      category: 'staking',
      logo: '🏖️',
      totalValue: 8900.00,
      positions: 1,
      risk: 'low',
      url: 'https://lido.fi',
    },
  ];

  const displayProtocols = protocols.length > 0 ? protocols : defaultProtocols;
  const totalValue = displayProtocols.reduce((sum, p) => sum + p.totalValue, 0);
  const totalPositions = displayProtocols.reduce((sum, p) => sum + p.positions, 0);

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, { label: string; variant: any }> = {
      lending: { label: 'Lending', variant: 'success' },
      dex: { label: 'DEX', variant: 'info' },
      staking: { label: 'Staking', variant: 'warning' },
      bridge: { label: 'Bridge', variant: 'outline' },
      other: { label: 'Other', variant: 'outline' },
    };
    const style = styles[category] || styles.other;
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge variant="success">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      default:
        return null;
    }
  };

  const categoryBreakdown = displayProtocols.reduce((acc, protocol) => {
    acc[protocol.category] = (acc[protocol.category] || 0) + protocol.totalValue;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          DeFi Protocol Exposure
        </CardTitle>
        <CardDescription>
          Your positions across DeFi protocols
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Value</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Positions</span>
            </div>
            <p className="text-2xl font-bold">{totalPositions}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Exposure by Category</h4>
          <div className="space-y-2">
            {Object.entries(categoryBreakdown).map(([category, value]) => {
              const percentage = (value / totalValue) * 100;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{category}</span>
                    <span className="font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Protocol List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Active Protocols</h4>
          {displayProtocols.map((protocol, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-3xl">{protocol.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{protocol.name}</h4>
                      {getCategoryBadge(protocol.category)}
                      {getRiskBadge(protocol.risk)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="text-foreground font-medium">
                          {formatCurrency(protocol.totalValue)}
                        </span>
                        {' '}total value
                      </div>
                      <div>
                        <span className="text-foreground font-medium">
                          {protocol.positions}
                        </span>
                        {' '}position{protocol.positions !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
                {protocol.url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(protocol.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {displayProtocols.length === 0 && (
          <div className="text-center py-8">
            <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No DeFi protocol exposure detected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

