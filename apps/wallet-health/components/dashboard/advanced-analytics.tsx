'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  PieChart,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useState } from 'react';

interface AdvancedAnalyticsProps {
  walletAddress: string;
}

export function AdvancedAnalytics({ walletAddress }: AdvancedAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock analytics data
  const transactionsByDay = [
    { day: 'Mon', count: 5, value: 1250 },
    { day: 'Tue', count: 8, value: 2100 },
    { day: 'Wed', count: 3, value: 890 },
    { day: 'Thu', count: 12, value: 3400 },
    { day: 'Fri', count: 7, value: 1800 },
    { day: 'Sat', count: 4, value: 950 },
    { day: 'Sun', count: 2, value: 450 },
  ];

  const protocolDistribution = [
    { name: 'DEX', value: 45, color: '#3b82f6' },
    { name: 'Lending', value: 30, color: '#10b981' },
    { name: 'Staking', value: 15, color: '#f59e0b' },
    { name: 'Bridge', value: 7, color: '#8b5cf6' },
    { name: 'Other', value: 3, color: '#6b7280' },
  ];

  const gasSpending = [
    { month: 'Jan', amount: 0.145 },
    { month: 'Feb', amount: 0.198 },
    { month: 'Mar', amount: 0.167 },
    { month: 'Apr', amount: 0.223 },
    { month: 'May', amount: 0.189 },
    { month: 'Jun', amount: 0.245 },
  ];

  const riskMetrics = {
    averageScore: 92,
    scoreVolatility: 'Low',
    criticalIncidents: 0,
    resolvedIssues: 5,
    activeMonitoring: true,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Advanced Analytics
            </CardTitle>
            <CardDescription>
              Deep insights into your wallet activity
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeframe Selector */}
        <div className="flex gap-2">
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
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Avg Score</p>
            <p className="text-2xl font-bold text-green-600">{riskMetrics.averageScore}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Volatility</p>
            <Badge variant="secondary">{riskMetrics.scoreVolatility}</Badge>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Critical</p>
            <p className="text-2xl font-bold">{riskMetrics.criticalIncidents}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Resolved</p>
            <p className="text-2xl font-bold text-primary">{riskMetrics.resolvedIssues}</p>
          </div>
        </div>

        {/* Transaction Activity Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Transaction Activity (Last 7 Days)
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transactionsByDay}>
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'value') return [formatCurrency(value), 'Volume'];
                    return [value, 'Transactions'];
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol Distribution */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Protocol Distribution
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={protocolDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {protocolDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gas Spending Trend */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Gas Spending (ETH)
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gasSpending}>
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => [`${value} ETH`, 'Gas Spent']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#f59e0b" 
                    radius={[8, 8, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">📊 Key Insights</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Most active day: Thursday with 12 transactions</li>
            <li>• Primary activity: DEX trading (45% of interactions)</li>
            <li>• Gas spending increased 30% compared to last month</li>
            <li>• Zero critical security incidents detected</li>
            <li>• Portfolio diversity score: Excellent</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

