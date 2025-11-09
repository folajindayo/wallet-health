'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Zap,
  Target,
  DollarSign,
  Percent,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Star,
  Shield
} from 'lucide-react';
import { useState } from 'react';

interface YieldOpportunity {
  id: string;
  protocol: string;
  type: 'lending' | 'staking' | 'farming' | 'vault';
  asset: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  audited: boolean;
  lockPeriod?: number;
  minDeposit: number;
  currentDeposit?: number;
  potentialEarnings: number;
  logo: string;
  features: string[];
}

interface YieldOptimization {
  currentAPY: number;
  optimizedAPY: number;
  additionalYield: number;
  recommendations: YieldOpportunity[];
}

interface YieldOptimizerProps {
  walletAddress: string;
}

export function YieldOptimizer({ walletAddress }: YieldOptimizerProps) {
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lending' | 'staking' | 'farming' | 'vault'>('all');

  // Mock yield opportunities
  const opportunities: YieldOpportunity[] = [
    {
      id: '1',
      protocol: 'Aave V3',
      type: 'lending',
      asset: 'USDC',
      apy: 4.2,
      tvl: 2500000000,
      risk: 'low',
      audited: true,
      minDeposit: 0,
      currentDeposit: 10000,
      potentialEarnings: 420,
      logo: '👻',
      features: ['Instant withdrawal', 'Variable APY', 'Insurance'],
    },
    {
      id: '2',
      protocol: 'Lido',
      type: 'staking',
      asset: 'ETH',
      apy: 3.8,
      tvl: 15000000000,
      risk: 'low',
      audited: true,
      minDeposit: 0.01,
      currentDeposit: 5000,
      potentialEarnings: 190,
      logo: '🏖️',
      features: ['Liquid staking', 'Daily rewards', 'No lock'],
    },
    {
      id: '3',
      protocol: 'Curve Finance',
      type: 'farming',
      asset: 'USDC/USDT',
      apy: 12.5,
      tvl: 850000000,
      risk: 'low',
      audited: true,
      minDeposit: 100,
      potentialEarnings: 1250,
      logo: '🌊',
      features: ['Stable pairs', 'CRV rewards', 'Low IL risk'],
    },
    {
      id: '4',
      protocol: 'Yearn Finance',
      type: 'vault',
      asset: 'ETH',
      apy: 8.5,
      tvl: 450000000,
      risk: 'medium',
      audited: true,
      minDeposit: 0.1,
      potentialEarnings: 425,
      logo: '💎',
      features: ['Auto-compound', 'Strategy rotation', 'Optimized'],
    },
    {
      id: '5',
      protocol: 'GMX',
      type: 'staking',
      asset: 'GMX',
      apy: 18.7,
      tvl: 280000000,
      risk: 'medium',
      audited: true,
      lockPeriod: 365,
      minDeposit: 10,
      potentialEarnings: 1870,
      logo: '⚡',
      features: ['High APY', 'esGMX rewards', 'Fee sharing'],
    },
    {
      id: '6',
      protocol: 'Convex Finance',
      type: 'farming',
      asset: 'CRV',
      apy: 15.2,
      tvl: 320000000,
      risk: 'medium',
      audited: true,
      minDeposit: 100,
      potentialEarnings: 1520,
      logo: '🔺',
      features: ['Boosted rewards', 'CVX tokens', 'No lock'],
    },
    {
      id: '7',
      protocol: 'Beefy Finance',
      type: 'vault',
      asset: 'BTC',
      apy: 6.8,
      tvl: 180000000,
      risk: 'low',
      audited: true,
      minDeposit: 0.01,
      potentialEarnings: 680,
      logo: '🐮',
      features: ['Auto-compound', 'Multi-chain', 'Gas optimized'],
    },
  ];

  const filteredOpportunities = opportunities.filter(opp => {
    if (riskFilter !== 'all' && opp.risk !== riskFilter) return false;
    if (typeFilter !== 'all' && opp.type !== typeFilter) return false;
    return true;
  }).sort((a, b) => b.apy - a.apy);

  const currentYield = opportunities
    .filter(o => o.currentDeposit)
    .reduce((sum, o) => sum + (o.currentDeposit! * o.apy / 100), 0);

  const potentialYield = filteredOpportunities
    .slice(0, 3)
    .reduce((sum, o) => sum + o.potentialEarnings, 0);

  const optimization: YieldOptimization = {
    currentAPY: 5.2,
    optimizedAPY: 9.8,
    additionalYield: potentialYield - currentYield,
    recommendations: filteredOpportunities.slice(0, 3),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTVL = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
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

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { label: string; variant: any }> = {
      lending: { label: 'Lending', variant: 'default' },
      staking: { label: 'Staking', variant: 'info' },
      farming: { label: 'Farming', variant: 'success' },
      vault: { label: 'Vault', variant: 'warning' },
    };
    const style = styles[type] || { label: type, variant: 'outline' };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Yield Optimizer
            </CardTitle>
            <CardDescription>
              Maximize your returns with optimized yield strategies
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh APYs
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Optimization Summary */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Optimization Opportunity
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current APY</p>
              <p className="text-2xl font-bold">{optimization.currentAPY}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Optimized APY</p>
              <p className="text-2xl font-bold text-green-600">{optimization.optimizedAPY}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Additional Yield</p>
              <p className="text-2xl font-bold text-primary">
                +{formatCurrency(optimization.additionalYield)}/yr
              </p>
            </div>
          </div>
          <Button size="sm" className="mt-4">
            <Zap className="h-4 w-4 mr-2" />
            Auto-Optimize Now
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={riskFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setRiskFilter('all')}
              >
                All Risk
              </Button>
              <Button
                size="sm"
                variant={riskFilter === 'low' ? 'default' : 'outline'}
                onClick={() => setRiskFilter('low')}
              >
                Low
              </Button>
              <Button
                size="sm"
                variant={riskFilter === 'medium' ? 'default' : 'outline'}
                onClick={() => setRiskFilter('medium')}
              >
                Medium
              </Button>
              <Button
                size="sm"
                variant={riskFilter === 'high' ? 'default' : 'outline'}
                onClick={() => setRiskFilter('high')}
              >
                High
              </Button>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('all')}
              >
                All Types
              </Button>
              <Button
                size="sm"
                variant={typeFilter === 'lending' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('lending')}
              >
                Lending
              </Button>
              <Button
                size="sm"
                variant={typeFilter === 'staking' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('staking')}
              >
                Staking
              </Button>
              <Button
                size="sm"
                variant={typeFilter === 'farming' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('farming')}
              >
                Farming
              </Button>
            </div>
          </div>
        </div>

        {/* Yield Opportunities */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Best Yield Opportunities</h4>
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-3xl">{opp.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h5 className="font-semibold">{opp.protocol}</h5>
                      {getTypeBadge(opp.type)}
                      {getRiskBadge(opp.risk)}
                      {opp.audited && (
                        <Badge variant="outline" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Audited
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">APY</p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <p className="text-xl font-bold text-green-600">{opp.apy}%</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Asset</p>
                        <p className="text-sm font-bold">{opp.asset}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">TVL</p>
                        <p className="text-sm font-bold">{formatTVL(opp.tvl)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Min Deposit</p>
                        <p className="text-sm font-bold">
                          {opp.minDeposit === 0 ? 'None' : formatCurrency(opp.minDeposit)}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {opp.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {opp.lockPeriod && (
                      <p className="text-xs text-yellow-600">
                        ⚠️ Lock period: {opp.lockPeriod} days
                      </p>
                    )}

                    {opp.currentDeposit && (
                      <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                        <p className="text-xs text-green-600">
                          Currently deposited: {formatCurrency(opp.currentDeposit)} • 
                          Annual earnings: {formatCurrency(opp.potentialEarnings)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open('https://aave.com', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button size="sm" variant="default">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
                {opp.currentDeposit && (
                  <Button size="sm" variant="outline">
                    Manage Position
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Opportunities Found</p>
            <p className="text-xs text-muted-foreground">
              Adjust filters to see more options
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">💡 Yield Optimization Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Higher APY usually means higher risk - diversify</li>
            <li>• Check if protocols are audited by reputable firms</li>
            <li>• Consider lock periods vs liquidity needs</li>
            <li>• Monitor APY changes regularly</li>
            <li>• Factor in gas costs for smaller deposits</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

