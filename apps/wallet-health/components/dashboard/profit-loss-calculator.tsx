'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Percent,
  Download,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PnLData {
  period: string;
  realized: number;
  unrealized: number;
  total: number;
}

interface AssetPnL {
  asset: string;
  symbol: string;
  invested: number;
  currentValue: number;
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
  roi: number;
  transactions: number;
}

interface ProfitLossCalculatorProps {
  walletAddress: string;
}

export function ProfitLossCalculator({ walletAddress }: ProfitLossCalculatorProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');

  // Mock PnL data
  const pnlHistory: PnLData[] = [
    { period: 'Week 1', realized: 1200, unrealized: 850, total: 2050 },
    { period: 'Week 2', realized: 1850, unrealized: 1200, total: 3050 },
    { period: 'Week 3', realized: 2100, unrealized: 950, total: 3050 },
    { period: 'Week 4', realized: 2850, unrealized: 1850, total: 4700 },
    { period: 'Week 5', realized: 3200, unrealized: 2100, total: 5300 },
    { period: 'Week 6', realized: 3850, unrealized: 2850, total: 6700 },
    { period: 'Week 7', realized: 4200, unrealized: 3200, total: 7400 },
    { period: 'Week 8', realized: 4850, unrealized: 3850, total: 8700 },
  ];

  const assetBreakdown: AssetPnL[] = [
    {
      asset: 'Ethereum',
      symbol: 'ETH',
      invested: 25000,
      currentValue: 31500,
      realizedPnL: 2850,
      unrealizedPnL: 3650,
      totalPnL: 6500,
      roi: 26.0,
      transactions: 45,
    },
    {
      asset: 'Bitcoin',
      symbol: 'BTC',
      invested: 15000,
      currentValue: 16200,
      realizedPnL: 850,
      unrealizedPnL: 350,
      totalPnL: 1200,
      roi: 8.0,
      transactions: 12,
    },
    {
      asset: 'Uniswap',
      symbol: 'UNI',
      invested: 8000,
      currentValue: 9850,
      realizedPnL: 650,
      unrealizedPnL: 1200,
      totalPnL: 1850,
      roi: 23.1,
      transactions: 28,
    },
    {
      asset: 'Aave',
      symbol: 'AAVE',
      invested: 5000,
      currentValue: 4200,
      realizedPnL: -200,
      unrealizedPnL: -600,
      totalPnL: -800,
      roi: -16.0,
      transactions: 8,
    },
  ];

  const totalInvested = assetBreakdown.reduce((sum, a) => sum + a.invested, 0);
  const totalCurrentValue = assetBreakdown.reduce((sum, a) => sum + a.currentValue, 0);
  const totalRealizedPnL = assetBreakdown.reduce((sum, a) => sum + a.realizedPnL, 0);
  const totalUnrealizedPnL = assetBreakdown.reduce((sum, a) => sum + a.unrealizedPnL, 0);
  const totalPnL = totalRealizedPnL + totalUnrealizedPnL;
  const totalROI = ((totalPnL / totalInvested) * 100);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const winningAssets = assetBreakdown.filter(a => a.totalPnL > 0).length;
  const losingAssets = assetBreakdown.filter(a => a.totalPnL < 0).length;
  const winRate = (winningAssets / assetBreakdown.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Profit & Loss Calculator
            </CardTitle>
            <CardDescription>
              Track your investment performance and returns
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Summary */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="font-semibold mb-3">Overall Performance</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
              <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Value</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalCurrentValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total P&L</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">ROI</p>
              <div className="flex items-center gap-1">
                {totalROI >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <p className={`text-2xl font-bold ${totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-6">
          <Button
            size="sm"
            variant={timeframe === '7d' ? 'default' : 'outline'}
            onClick={() => setTimeframe('7d')}
          >
            7 Days
          </Button>
          <Button
            size="sm"
            variant={timeframe === '30d' ? 'default' : 'outline'}
            onClick={() => setTimeframe('30d')}
          >
            30 Days
          </Button>
          <Button
            size="sm"
            variant={timeframe === '90d' ? 'default' : 'outline'}
            onClick={() => setTimeframe('90d')}
          >
            90 Days
          </Button>
          <Button
            size="sm"
            variant={timeframe === '1y' ? 'default' : 'outline'}
            onClick={() => setTimeframe('1y')}
          >
            1 Year
          </Button>
          <Button
            size="sm"
            variant={timeframe === 'all' ? 'default' : 'outline'}
            onClick={() => setTimeframe('all')}
          >
            All Time
          </Button>
        </div>

        {/* P&L Chart */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">P&L Over Time</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlHistory}>
                <XAxis 
                  dataKey="period" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'P&L']}
                />
                <Area
                  type="monotone"
                  dataKey="realized"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="unrealized"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-xs text-muted-foreground">Realized P&L</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-xs text-muted-foreground">Unrealized P&L</span>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-600">{winningAssets}</p>
            <p className="text-xs text-muted-foreground">Winning Assets</p>
          </div>
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-center">
            <p className="text-2xl font-bold text-red-600">{losingAssets}</p>
            <p className="text-xs text-muted-foreground">Losing Assets</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{winRate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
        </div>

        {/* Asset Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Asset Performance Breakdown</h4>
          {assetBreakdown.map((asset, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{asset.asset} ({asset.symbol})</h4>
                    {asset.totalPnL >= 0 ? (
                      <Badge variant="secondary">Profit</Badge>
                    ) : (
                      <Badge variant="destructive">Loss</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Invested</p>
                      <p className="text-sm font-bold">{formatCurrency(asset.invested)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current Value</p>
                      <p className="text-sm font-bold">{formatCurrency(asset.currentValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total P&L</p>
                      <p className={`text-sm font-bold ${
                        asset.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {asset.totalPnL >= 0 ? '+' : ''}{formatCurrency(asset.totalPnL)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ROI</p>
                      <div className="flex items-center gap-1">
                        {asset.roi >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <p className={`text-sm font-bold ${
                          asset.roi >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {asset.roi >= 0 ? '+' : ''}{asset.roi.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div>
                      Realized: <span className={`font-medium ${
                        asset.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {asset.realizedPnL >= 0 ? '+' : ''}{formatCurrency(asset.realizedPnL)}
                      </span>
                    </div>
                    <div>
                      Unrealized: <span className={`font-medium ${
                        asset.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {asset.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(asset.unrealizedPnL)}
                      </span>
                    </div>
                    <div>
                      {asset.transactions} transactions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">📊 P&L Insights</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Realized P&L: Profits/losses from closed positions</li>
            <li>• Unrealized P&L: Current profits/losses on open positions</li>
            <li>• ROI calculated based on initial investment amounts</li>
            <li>• Track performance to optimize your strategy</li>
            <li>• Consider tax implications on realized gains</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

