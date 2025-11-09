'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
  Clock,
  AlertCircle,
  ChevronDown,
  Download,
  RefreshCw,
  PieChart
} from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FeeData {
  date: string;
  totalFees: number;
  avgGasPrice: number;
  transactions: number;
}

interface TransactionFeeAnalyticsProps {
  walletAddress: string;
}

export function TransactionFeeAnalytics({ walletAddress }: TransactionFeeAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [viewMode, setViewMode] = useState<'chart' | 'breakdown'>('chart');

  // Mock historical fee data
  const generateFeeData = (): FeeData[] => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const data: FeeData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalFees: Math.random() * 100 + 20,
        avgGasPrice: Math.random() * 50 + 20,
        transactions: Math.floor(Math.random() * 20) + 1,
      });
    }
    
    return data;
  };

  const feeData = generateFeeData();

  // Calculate statistics
  const totalFees = feeData.reduce((sum, d) => sum + d.totalFees, 0);
  const avgFeePerTx = totalFees / feeData.reduce((sum, d) => sum + d.transactions, 0);
  const totalTransactions = feeData.reduce((sum, d) => sum + d.transactions, 0);
  const avgGasPrice = feeData.reduce((sum, d) => sum + d.avgGasPrice, 0) / feeData.length;

  // Fee breakdown by type
  const feeBreakdown = [
    { name: 'Swaps', value: 450, percentage: 35, color: '#10b981' },
    { name: 'Transfers', value: 280, percentage: 22, color: '#3b82f6' },
    { name: 'NFT Mints', value: 320, percentage: 25, color: '#8b5cf6' },
    { name: 'Approvals', value: 180, percentage: 14, color: '#f59e0b' },
    { name: 'Other', value: 50, percentage: 4, color: '#6b7280' },
  ];

  // Fee comparison by network
  const networkFees = [
    { network: 'Ethereum', avgFee: 12.50, txCount: 45, totalFees: 562.50, color: '#627EEA' },
    { network: 'Polygon', avgFee: 0.15, txCount: 120, totalFees: 18.00, color: '#8247E5' },
    { network: 'Arbitrum', avgFee: 0.80, txCount: 80, totalFees: 64.00, color: '#28A0F0' },
    { network: 'Base', avgFee: 0.25, txCount: 95, totalFees: 23.75, color: '#0052FF' },
    { network: 'BNB Chain', avgFee: 0.35, txCount: 60, totalFees: 21.00, color: '#F3BA2F' },
  ];

  // Monthly comparison
  const monthlyComparison = [
    { month: 'Jan', fees: 125, savings: 0 },
    { month: 'Feb', fees: 98, savings: 27 },
    { month: 'Mar', fees: 142, savings: 0 },
    { month: 'Apr', fees: 89, savings: 53 },
    { month: 'May', fees: 156, savings: 0 },
    { month: 'Jun', fees: 112, savings: 44 },
  ];

  // Fee optimization tips
  const optimizationTips = [
    {
      title: 'Use Layer 2 Solutions',
      description: 'Save up to 95% on fees by using Arbitrum, Optimism, or Base',
      potentialSavings: 450,
      difficulty: 'Easy',
    },
    {
      title: 'Batch Transactions',
      description: 'Combine multiple transactions to save on approval fees',
      potentialSavings: 120,
      difficulty: 'Medium',
    },
    {
      title: 'Time Your Transactions',
      description: 'Execute transactions during low network activity (weekends)',
      potentialSavings: 85,
      difficulty: 'Easy',
    },
    {
      title: 'Optimize Gas Settings',
      description: 'Use custom gas limits to avoid overpaying',
      potentialSavings: 65,
      difficulty: 'Advanced',
    },
  ];

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      'Easy': 'secondary',
      'Medium': 'default',
      'Advanced': 'outline',
    };
    return <Badge variant={variants[difficulty as keyof typeof variants] as any}>{difficulty}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Transaction Fee Analytics
            </CardTitle>
            <CardDescription>
              Track and optimize your gas spending
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

      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total Fees</span>
            </div>
            <p className="text-2xl font-bold">${totalFees.toFixed(2)}</p>
            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+12% vs last period</span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs">Avg Fee/Tx</span>
            </div>
            <p className="text-2xl font-bold">${avgFeePerTx.toFixed(2)}</p>
            <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
              <TrendingDown className="h-3 w-3" />
              <span>-8% vs last period</span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Total Transactions</span>
            </div>
            <p className="text-2xl font-bold">{totalTransactions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {(totalTransactions / feeData.length).toFixed(1)}/day
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Avg Gas Price</span>
            </div>
            <p className="text-2xl font-bold">{avgGasPrice.toFixed(0)} Gwei</p>
            <p className="text-xs text-muted-foreground mt-1">
              Last {feeData.length} days
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={timeRange === '7d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('7d')}
            >
              7D
            </Button>
            <Button
              size="sm"
              variant={timeRange === '30d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('30d')}
            >
              30D
            </Button>
            <Button
              size="sm"
              variant={timeRange === '90d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('90d')}
            >
              90D
            </Button>
            <Button
              size="sm"
              variant={timeRange === '1y' ? 'default' : 'outline'}
              onClick={() => setTimeRange('1y')}
            >
              1Y
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'chart' ? 'default' : 'outline'}
              onClick={() => setViewMode('chart')}
            >
              Chart
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'breakdown' ? 'default' : 'outline'}
              onClick={() => setViewMode('breakdown')}
            >
              Breakdown
            </Button>
          </div>
        </div>

        {/* Fee Chart */}
        {viewMode === 'chart' ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalFees"
                  name="Total Fees ($)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgGasPrice"
                  name="Avg Gas Price (Gwei)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Fee Breakdown Pie Chart */}
            <div className="h-80 flex flex-col">
              <h4 className="text-sm font-semibold mb-4">Fee Breakdown by Type</h4>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={feeBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }: any) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {feeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Network Comparison */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Fees by Network</h4>
              <div className="space-y-3">
                {networkFees.map((network) => (
                  <div
                    key={network.network}
                    className="p-3 rounded-lg border border-border bg-card/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{network.network}</span>
                      <Badge variant="secondary">{network.txCount} tx</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg: ${network.avgFee.toFixed(2)}</span>
                      <span className="font-semibold">${network.totalFees.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${(network.totalFees / 689.25) * 100}%`,
                          backgroundColor: network.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Monthly Comparison */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Monthly Fee Comparison</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="fees" name="Fees Paid ($)" fill="#ef4444" />
                <Bar dataKey="savings" name="Potential Savings ($)" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Optimization Tips */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold">💡 Fee Optimization Tips</h4>
            <Badge variant="secondary" className="gap-1">
              <DollarSign className="h-3 w-3" />
              Save up to $720/mo
            </Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {optimizationTips.map((tip, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border bg-card/50">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-sm">{tip.title}</h5>
                  {getDifficultyBadge(tip.difficulty)}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {tip.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Potential savings
                  </span>
                  <span className="text-sm font-bold text-emerald-500">
                    ${tip.potentialSavings}/mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Alert */}
        <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Fee Optimization Opportunity</p>
              <p className="text-sm text-muted-foreground">
                You could save approximately <strong>$720/month</strong> by implementing the optimization tips above.
                Consider using Layer 2 networks for 95% fee reduction on similar transactions.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

