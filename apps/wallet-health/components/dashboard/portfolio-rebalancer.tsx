'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  TrendingUp,
  AlertCircle,
  Target,
  ArrowRight,
  RefreshCw,
  Zap,
  DollarSign
} from 'lucide-react';
import { useState } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Asset {
  symbol: string;
  name: string;
  currentAllocation: number;
  targetAllocation: number;
  currentValue: number;
  difference: number;
  action: 'buy' | 'sell' | 'hold';
  amount: number;
}

interface RebalanceStrategy {
  name: string;
  description: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  allocations: Record<string, number>;
}

interface PortfolioRebalancerProps {
  walletAddress: string;
}

export function PortfolioRebalancer({ walletAddress }: PortfolioRebalancerProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('balanced');

  // Rebalance strategies
  const strategies: RebalanceStrategy[] = [
    {
      name: 'Conservative',
      description: 'Low risk, stable assets',
      riskLevel: 'conservative',
      allocations: {
        'USDC': 40,
        'ETH': 30,
        'BTC': 20,
        'USDT': 10,
      },
    },
    {
      name: 'Balanced',
      description: 'Moderate risk and growth',
      riskLevel: 'moderate',
      allocations: {
        'ETH': 40,
        'BTC': 30,
        'USDC': 15,
        'ALT': 15,
      },
    },
    {
      name: 'Aggressive',
      description: 'High risk, high potential',
      riskLevel: 'aggressive',
      allocations: {
        'ETH': 35,
        'ALT': 35,
        'BTC': 20,
        'USDC': 10,
      },
    },
  ];

  // Mock current portfolio
  const assets: Asset[] = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      currentAllocation: 45,
      targetAllocation: 40,
      currentValue: 31500,
      difference: -5,
      action: 'sell',
      amount: 3500,
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      currentAllocation: 25,
      targetAllocation: 30,
      currentValue: 17500,
      difference: 5,
      action: 'buy',
      amount: 3500,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      currentAllocation: 20,
      targetAllocation: 15,
      currentValue: 14000,
      difference: -5,
      action: 'sell',
      amount: 3500,
    },
    {
      symbol: 'ALT',
      name: 'Altcoins',
      currentAllocation: 10,
      targetAllocation: 15,
      currentValue: 7000,
      difference: 5,
      action: 'buy',
      amount: 3500,
    },
  ];

  const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const needsRebalance = assets.some(a => Math.abs(a.difference) > 3);
  const maxDeviation = Math.max(...assets.map(a => Math.abs(a.difference)));

  const currentData = assets.map(a => ({
    name: a.symbol,
    value: a.currentAllocation,
  }));

  const targetData = assets.map(a => ({
    name: a.symbol,
    value: a.targetAllocation,
  }));

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'buy':
        return <Badge variant="secondary">Buy</Badge>;
      case 'sell':
        return <Badge variant="destructive">Sell</Badge>;
      case 'hold':
        return <Badge variant="outline">Hold</Badge>;
      default:
        return null;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'conservative':
        return <Badge variant="secondary">Low Risk</Badge>;
      case 'moderate':
        return <Badge variant="outline">Moderate Risk</Badge>;
      case 'aggressive':
        return <Badge variant="destructive">High Risk</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Portfolio Rebalancer
            </CardTitle>
            <CardDescription>
              Optimize your portfolio allocation automatically
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Portfolio Overview */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Portfolio Overview</h4>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
          </div>
          {needsRebalance && (
            <div className="flex items-start gap-2 p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Rebalancing Recommended</p>
                <p className="text-xs text-muted-foreground">
                  Maximum deviation: {maxDeviation.toFixed(1)}% from target allocation
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Strategy Selector */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Select Rebalancing Strategy</h4>
          <div className="grid md:grid-cols-3 gap-3">
            {strategies.map((strategy) => (
              <div
                key={strategy.name}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedStrategy === strategy.name.toLowerCase()
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => setSelectedStrategy(strategy.name.toLowerCase())}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-sm">{strategy.name}</h5>
                  {getRiskBadge(strategy.riskLevel)}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{strategy.description}</p>
                <div className="space-y-1">
                  {Object.entries(strategy.allocations).map(([asset, allocation]) => (
                    <div key={asset} className="flex items-center justify-between text-xs">
                      <span>{asset}</span>
                      <span className="font-medium">{allocation}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-semibold mb-3 text-center">Current Allocation</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={currentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {currentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-center">Target Allocation</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={targetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {targetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Rebalancing Actions */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold">Recommended Actions</h4>
          {assets.map((asset, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold">{asset.name} ({asset.symbol})</h5>
                    {getActionBadge(asset.action)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-sm font-bold">{asset.currentAllocation}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-sm font-bold text-primary">{asset.targetAllocation}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">{formatCurrency(asset.currentValue)}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-primary">
                      {formatCurrency(asset.currentValue + (asset.action === 'buy' ? asset.amount : -asset.amount))}
                    </span>
                  </div>

                  {asset.action !== 'hold' && (
                    <p className="text-xs text-muted-foreground">
                      {asset.action === 'buy' ? 'Buy' : 'Sell'} {formatCurrency(Math.abs(asset.amount))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Execute Rebalance */}
        {needsRebalance && (
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3 mb-3">
              <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Auto-Rebalance Available</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Execute all recommended trades automatically with one click
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    <Zap className="h-4 w-4 mr-2" />
                    Execute Rebalance
                  </Button>
                  <Button size="sm" variant="outline">
                    Preview Transactions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">📊 Rebalancing Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Rebalance quarterly or when deviation exceeds 5%</li>
            <li>• Consider gas fees when executing rebalances</li>
            <li>• Review market conditions before rebalancing</li>
            <li>• Tax implications apply to realized gains</li>
            <li>• Use limit orders to reduce slippage</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

