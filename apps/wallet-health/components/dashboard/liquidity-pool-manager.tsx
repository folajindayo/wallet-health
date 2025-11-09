'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Droplets, 
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  ExternalLink,
  AlertCircle,
  DollarSign,
  Percent
} from 'lucide-react';
import { useState } from 'react';

interface LiquidityPosition {
  id: string;
  protocol: string;
  pair: string;
  token0: string;
  token1: string;
  amount0: number;
  amount1: number;
  totalValue: number;
  share: number;
  apr: number;
  fees24h: number;
  feesTotal: number;
  impermanentLoss: number;
  priceRange?: {
    min: number;
    max: number;
    current: number;
  };
  version: 'v2' | 'v3' | 'stable';
  logo: string;
}

interface LiquidityPoolManagerProps {
  walletAddress: string;
  positions?: LiquidityPosition[];
}

export function LiquidityPoolManager({ 
  walletAddress, 
  positions = [] 
}: LiquidityPoolManagerProps) {
  const [filter, setFilter] = useState<'all' | 'in-range' | 'out-range'>('all');

  // Mock liquidity positions
  const mockPositions: LiquidityPosition[] = [
    {
      id: '1',
      protocol: 'Uniswap V3',
      pair: 'ETH/USDC',
      token0: 'ETH',
      token1: 'USDC',
      amount0: 2.5,
      amount1: 8500,
      totalValue: 17500,
      share: 0.15,
      apr: 24.5,
      fees24h: 12.50,
      feesTotal: 425.00,
      impermanentLoss: -2.3,
      priceRange: {
        min: 3200,
        max: 3800,
        current: 3500,
      },
      version: 'v3',
      logo: '🦄',
    },
    {
      id: '2',
      protocol: 'Curve',
      pair: 'USDC/USDT',
      token0: 'USDC',
      token1: 'USDT',
      amount0: 5000,
      amount1: 5000,
      totalValue: 10000,
      share: 0.08,
      apr: 8.2,
      fees24h: 2.25,
      feesTotal: 156.00,
      impermanentLoss: 0,
      version: 'stable',
      logo: '🌊',
    },
    {
      id: '3',
      protocol: 'SushiSwap',
      pair: 'WBTC/ETH',
      token0: 'WBTC',
      token1: 'ETH',
      amount0: 0.25,
      amount1: 5.0,
      totalValue: 35000,
      share: 0.12,
      apr: 18.7,
      fees24h: 18.50,
      feesTotal: 890.00,
      impermanentLoss: -5.2,
      version: 'v2',
      logo: '🍣',
    },
    {
      id: '4',
      protocol: 'Uniswap V3',
      pair: 'LINK/ETH',
      token0: 'LINK',
      token1: 'ETH',
      amount0: 500,
      amount1: 2.2,
      totalValue: 15400,
      share: 0.22,
      apr: 32.1,
      fees24h: 15.80,
      feesTotal: 520.00,
      impermanentLoss: -3.8,
      priceRange: {
        min: 0.003,
        max: 0.0045,
        current: 0.0028,
      },
      version: 'v3',
      logo: '🦄',
    },
  ];

  const displayPositions = positions.length > 0 ? positions : mockPositions;

  const isInRange = (position: LiquidityPosition) => {
    if (!position.priceRange) return true;
    const { min, max, current } = position.priceRange;
    return current >= min && current <= max;
  };

  const filteredPositions = displayPositions.filter(position => {
    if (filter === 'all') return true;
    if (filter === 'in-range') return isInRange(position);
    if (filter === 'out-range') return !isInRange(position);
    return true;
  });

  const totalLiquidity = displayPositions.reduce((sum, p) => sum + p.totalValue, 0);
  const totalFees = displayPositions.reduce((sum, p) => sum + p.feesTotal, 0);
  const avgAPR = displayPositions.reduce((sum, p) => sum + p.apr, 0) / displayPositions.length;
  const outOfRange = displayPositions.filter(p => !isInRange(p)).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getVersionBadge = (version: string) => {
    const styles: Record<string, any> = {
      'v2': { label: 'V2', variant: 'outline' },
      'v3': { label: 'V3', variant: 'default' },
      'stable': { label: 'Stable', variant: 'success' },
    };
    const style = styles[version] || { label: version, variant: 'outline' };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Liquidity Pool Manager
            </CardTitle>
            <CardDescription>
              Manage your liquidity positions and track earnings
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Liquidity
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Total Liquidity</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(totalLiquidity)}</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5">
            <p className="text-xs text-muted-foreground mb-1">Total Fees Earned</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalFees)}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Avg APR</p>
            <p className="text-xl font-bold">{avgAPR.toFixed(1)}%</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-xs text-muted-foreground mb-1">Out of Range</p>
            <p className="text-xl font-bold text-yellow-600">{outOfRange}</p>
          </div>
        </div>

        {/* Warning for Out of Range */}
        {outOfRange > 0 && (
          <div className="mb-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Positions Out of Range</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {outOfRange} position{outOfRange !== 1 ? 's are' : ' is'} currently out of range and not earning fees.
                  Consider rebalancing to maximize returns.
                </p>
                <Button size="sm" variant="outline">
                  Review Positions
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({displayPositions.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'in-range' ? 'default' : 'outline'}
            onClick={() => setFilter('in-range')}
          >
            In Range ({displayPositions.filter(p => isInRange(p)).length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'out-range' ? 'default' : 'outline'}
            onClick={() => setFilter('out-range')}
          >
            Out of Range ({outOfRange})
          </Button>
        </div>

        {/* Positions List */}
        <div className="space-y-3">
          {filteredPositions.map((position) => {
            const inRange = isInRange(position);
            return (
              <div
                key={position.id}
                className={`p-4 rounded-lg border transition-colors ${
                  inRange
                    ? 'border-border hover:bg-muted/50'
                    : 'border-yellow-500/30 bg-yellow-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">{position.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold">{position.pair}</h4>
                        {getVersionBadge(position.version)}
                        {!inRange && (
                          <Badge variant="outline" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Out of Range
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {position.protocol}
                      </p>

                      {/* Position Details */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Liquidity</p>
                          <p className="text-lg font-bold">{formatCurrency(position.totalValue)}</p>
                          <p className="text-xs text-muted-foreground">
                            {position.amount0} {position.token0} + {position.amount1.toFixed(2)} {position.token1}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pool Share</p>
                          <p className="text-lg font-bold">{position.share}%</p>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">APR</p>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <p className="text-sm font-bold text-green-600">{position.apr}%</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fees (24h)</p>
                          <p className="text-sm font-bold">{formatCurrency(position.fees24h)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Fees</p>
                          <p className="text-sm font-bold text-green-600">{formatCurrency(position.feesTotal)}</p>
                        </div>
                      </div>

                      {/* IL and Price Range */}
                      <div className="flex items-center gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Impermanent Loss</p>
                          <div className="flex items-center gap-1">
                            {position.impermanentLoss < 0 ? (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            ) : (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            )}
                            <p className={`text-sm font-bold ${
                              position.impermanentLoss < 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {position.impermanentLoss}%
                            </p>
                          </div>
                        </div>
                        {position.priceRange && (
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Price Range</p>
                            <div className="space-y-1">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${inRange ? 'bg-green-500' : 'bg-yellow-500'}`}
                                  style={{
                                    width: `${Math.min(
                                      ((position.priceRange.current - position.priceRange.min) / 
                                      (position.priceRange.max - position.priceRange.min)) * 100,
                                      100
                                    )}%`
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{position.priceRange.min}</span>
                                <span className="font-bold text-foreground">{position.priceRange.current}</span>
                                <span>{position.priceRange.max}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://app.uniswap.org/#/pool/${position.id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Liquidity
                  </Button>
                  <Button size="sm" variant="outline">
                    <Minus className="h-4 w-4 mr-2" />
                    Remove Liquidity
                  </Button>
                  <Button size="sm" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Collect Fees
                  </Button>
                  {!inRange && position.version === 'v3' && (
                    <Button size="sm" variant="outline">
                      <Percent className="h-4 w-4 mr-2" />
                      Rebalance
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredPositions.length === 0 && (
          <div className="text-center py-8">
            <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Liquidity Positions</p>
            <p className="text-xs text-muted-foreground mb-3">
              Provide liquidity to earn trading fees
            </p>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Liquidity
            </Button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">💧 LP Best Practices</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Monitor your positions regularly, especially V3 ranges</li>
            <li>• Collect fees periodically to avoid gas inefficiency</li>
            <li>• Consider impermanent loss when choosing pairs</li>
            <li>• Stable pairs (USDC/USDT) have minimal IL risk</li>
            <li>• Rebalance V3 positions when out of range</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

