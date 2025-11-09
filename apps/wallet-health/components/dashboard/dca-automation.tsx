'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Calendar,
  DollarSign,
  Play,
  Pause,
  Plus,
  Settings,
  Clock,
  Target,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DCAStrategy {
  id: string;
  name: string;
  token: string;
  fromToken: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  nextExecution: Date;
  status: 'active' | 'paused' | 'completed';
  totalInvested: number;
  totalTokens: number;
  avgPrice: number;
  currentValue: number;
  profit: number;
  executionCount: number;
  createdAt: Date;
}

interface Execution {
  id: string;
  strategyId: string;
  date: Date;
  amount: number;
  tokens: number;
  price: number;
  txHash: string;
  status: 'success' | 'pending' | 'failed';
}

interface DCAAutomationProps {
  walletAddress: string;
}

export function DCAAutomation({ walletAddress }: DCAAutomationProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  // Mock strategies
  const strategies: DCAStrategy[] = [
    {
      id: '1',
      name: 'ETH Accumulation',
      token: 'ETH',
      fromToken: 'USDC',
      amount: 100,
      frequency: 'weekly',
      nextExecution: new Date(Date.now() + 86400000 * 3),
      status: 'active',
      totalInvested: 5200,
      totalTokens: 2.15,
      avgPrice: 2418.60,
      currentValue: 5267.50,
      profit: 67.50,
      executionCount: 52,
      createdAt: new Date(Date.now() - 86400000 * 364),
    },
    {
      id: '2',
      name: 'BTC Long Term',
      token: 'WBTC',
      fromToken: 'USDC',
      amount: 250,
      frequency: 'biweekly',
      nextExecution: new Date(Date.now() + 86400000 * 8),
      status: 'active',
      totalInvested: 6000,
      totalTokens: 0.142,
      avgPrice: 42253.52,
      currentValue: 6141.50,
      profit: 141.50,
      executionCount: 24,
      createdAt: new Date(Date.now() - 86400000 * 336),
    },
    {
      id: '3',
      name: 'LINK Builder',
      token: 'LINK',
      fromToken: 'USDC',
      amount: 50,
      frequency: 'daily',
      nextExecution: new Date(Date.now() + 86400000),
      status: 'paused',
      totalInvested: 3650,
      totalTokens: 268.5,
      avgPrice: 13.59,
      currentValue: 3813.30,
      profit: 163.30,
      executionCount: 73,
      createdAt: new Date(Date.now() - 86400000 * 73),
    },
  ];

  // Mock executions for selected strategy
  const executions: Execution[] = [
    {
      id: '1',
      strategyId: '1',
      date: new Date(Date.now() - 86400000 * 7),
      amount: 100,
      tokens: 0.041,
      price: 2439.02,
      txHash: '0xabcd1234...',
      status: 'success',
    },
    {
      id: '2',
      strategyId: '1',
      date: new Date(Date.now() - 86400000 * 14),
      amount: 100,
      tokens: 0.042,
      price: 2380.95,
      txHash: '0xefgh5678...',
      status: 'success',
    },
    {
      id: '3',
      strategyId: '1',
      date: new Date(Date.now() - 86400000 * 21),
      amount: 100,
      tokens: 0.040,
      price: 2500.00,
      txHash: '0xijkl9012...',
      status: 'success',
    },
  ];

  // Mock price history chart data
  const chartData = [
    { week: 'Week 1', avgPrice: 2380, currentPrice: 2400 },
    { week: 'Week 2', avgPrice: 2390, currentPrice: 2350 },
    { week: 'Week 3', avgPrice: 2400, currentPrice: 2500 },
    { week: 'Week 4', avgPrice: 2410, currentPrice: 2450 },
    { week: 'Week 5', avgPrice: 2418, currentPrice: 2448 },
  ];

  const activeStrategies = strategies.filter(s => s.status === 'active').length;
  const totalInvested = strategies.reduce((sum, s) => sum + s.totalInvested, 0);
  const totalValue = strategies.reduce((sum, s) => sum + s.currentValue, 0);
  const totalProfit = totalValue - totalInvested;
  const profitPercent = (totalProfit / totalInvested) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 6) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `in ${days}d`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="gap-1">
          <Play className="h-3 w-3" />
          Active
        </Badge>;
      case 'paused':
        return <Badge variant="warning" className="gap-1">
          <Pause className="h-3 w-3" />
          Paused
        </Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const styles: Record<string, any> = {
      daily: { label: 'Daily', variant: 'info' },
      weekly: { label: 'Weekly', variant: 'default' },
      biweekly: { label: 'Bi-Weekly', variant: 'success' },
      monthly: { label: 'Monthly', variant: 'warning' },
    };
    const style = styles[frequency] || { label: frequency, variant: 'outline' };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              DCA Automation
            </CardTitle>
            <CardDescription>
              Dollar Cost Average into your favorite tokens
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Strategy
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Portfolio Summary */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="font-semibold mb-3">Portfolio Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Value</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Profit</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Return</p>
              <p className={`text-2xl font-bold ${profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Active Strategies */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Your DCA Strategies</h4>
            <Badge variant="info">{activeStrategies} Active</Badge>
          </div>
          {strategies.map((strategy) => {
            const profitPercent = (strategy.profit / strategy.totalInvested) * 100;

            return (
              <div
                key={strategy.id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  strategy.status === 'active'
                    ? 'border-green-500/30 bg-green-500/5'
                    : strategy.status === 'paused'
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => setSelectedStrategy(strategy.id)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h5 className="font-semibold">{strategy.name}</h5>
                      {getStatusBadge(strategy.status)}
                      {getFrequencyBadge(strategy.frequency)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Per Trade</p>
                        <p className="text-sm font-bold">
                          {formatCurrency(strategy.amount)} {strategy.fromToken}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Holdings</p>
                        <p className="text-sm font-bold text-primary">
                          {formatNumber(strategy.totalTokens, 4)} {strategy.token}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Price</p>
                        <p className="text-sm font-bold">
                          {formatCurrency(strategy.avgPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Profit</p>
                        <p className={`text-sm font-bold ${
                          strategy.profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {strategy.profit >= 0 ? '+' : ''}{formatCurrency(strategy.profit)}
                          {' '}({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Next: {formatTimeUntil(strategy.nextExecution)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>{strategy.executionCount} executions</span>
                      </div>
                      <span>Started {formatDate(strategy.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {strategy.status === 'active' ? (
                    <Button size="sm" variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary">
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance Chart */}
        {selectedStrategy && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3">Avg Buy Price vs Current Price</h4>
            <div className="h-64 p-4 rounded-lg border border-border bg-card">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="avgPrice" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Your Avg Price"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="currentPrice" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Current Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Executions */}
        {selectedStrategy && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold">Recent Executions</h4>
            {executions.map((execution) => (
              <div
                key={execution.id}
                className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{formatDate(execution.date)}</p>
                      {execution.status === 'success' && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3" />
                          Success
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Bought {formatNumber(execution.tokens, 4)} ETH</span>
                      <span>•</span>
                      <span>@{formatCurrency(execution.price)}</span>
                      <span>•</span>
                      <span className="font-mono">{execution.txHash}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(execution.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">📈 DCA Benefits</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Reduce impact of market volatility</li>
            <li>• Remove emotion from investing decisions</li>
            <li>• Build positions over time automatically</li>
            <li>• Lower average cost through consistent buying</li>
            <li>• Set it and forget it - fully automated</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

