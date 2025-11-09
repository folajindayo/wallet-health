'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart as PieChartIcon, 
  TrendingUp,
  AlertTriangle,
  Target,
  Award,
  Info,
  DollarSign,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface AssetAllocation {
  category: string;
  value: number;
  percentage: number;
  recommended: number;
  deviation: number;
  risk: 'low' | 'medium' | 'high';
}

interface DiversificationScore {
  overall: number;
  categoryBalance: number;
  riskDistribution: number;
  concentration: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
}

interface Recommendation {
  type: 'increase' | 'decrease' | 'maintain';
  category: string;
  currentAllocation: number;
  targetAllocation: number;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

interface PortfolioDiversificationAnalyzerProps {
  walletAddress: string;
}

export function PortfolioDiversificationAnalyzer({ walletAddress }: PortfolioDiversificationAnalyzerProps) {
  const [strategy, setStrategy] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');

  // Mock asset allocations
  const allocations: AssetAllocation[] = [
    {
      category: 'Blue Chip (ETH, BTC)',
      value: 45000,
      percentage: 45,
      recommended: 50,
      deviation: -5,
      risk: 'low',
    },
    {
      category: 'Stablecoins',
      value: 20000,
      percentage: 20,
      recommended: 15,
      deviation: 5,
      risk: 'low',
    },
    {
      category: 'DeFi Tokens',
      value: 15000,
      percentage: 15,
      recommended: 20,
      deviation: -5,
      risk: 'medium',
    },
    {
      category: 'Layer 2s',
      value: 10000,
      percentage: 10,
      recommended: 10,
      deviation: 0,
      risk: 'medium',
    },
    {
      category: 'Altcoins',
      value: 8000,
      percentage: 8,
      recommended: 5,
      deviation: 3,
      risk: 'high',
    },
    {
      category: 'Meme Coins',
      value: 2000,
      percentage: 2,
      recommended: 0,
      deviation: 2,
      risk: 'high',
    },
  ];

  // Mock diversification score
  const diversificationScore: DiversificationScore = {
    overall: 78,
    categoryBalance: 82,
    riskDistribution: 75,
    concentration: 77,
    rating: 'good',
  };

  // Mock recommendations
  const recommendations: Recommendation[] = [
    {
      type: 'increase',
      category: 'Blue Chip (ETH, BTC)',
      currentAllocation: 45,
      targetAllocation: 50,
      action: 'Add $5,000 to ETH/BTC position',
      priority: 'high',
    },
    {
      type: 'increase',
      category: 'DeFi Tokens',
      currentAllocation: 15,
      targetAllocation: 20,
      action: 'Diversify into quality DeFi protocols',
      priority: 'medium',
    },
    {
      type: 'decrease',
      category: 'Stablecoins',
      currentAllocation: 20,
      targetAllocation: 15,
      action: 'Deploy $5,000 into productive assets',
      priority: 'medium',
    },
    {
      type: 'decrease',
      category: 'Meme Coins',
      currentAllocation: 2,
      targetAllocation: 0,
      action: 'Exit speculative positions',
      priority: 'low',
    },
  ];

  // Radar chart data
  const radarData = [
    { metric: 'Balance', score: diversificationScore.categoryBalance },
    { metric: 'Risk Dist.', score: diversificationScore.riskDistribution },
    { metric: 'Concentration', score: diversificationScore.concentration },
    { metric: 'Volatility', score: 70 },
    { metric: 'Liquidity', score: 85 },
  ];

  const totalValue = allocations.reduce((sum, a) => sum + a.value, 0);
  const pieData = allocations.map(a => ({
    name: a.category,
    value: a.percentage,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return <Badge variant="secondary" className="gap-1">
          <Award className="h-3 w-3" />
          Excellent
        </Badge>;
      case 'good':
        return <Badge variant="default" className="gap-1">
          <Target className="h-3 w-3" />
          Good
        </Badge>;
      case 'fair':
        return <Badge variant="outline">Fair</Badge>;
      case 'poor':
        return <Badge variant="destructive">Poor</Badge>;
      default:
        return null;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge variant="secondary">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="outline">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="outline">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
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
              <PieChartIcon className="h-5 w-5" />
              Portfolio Diversification Analyzer
            </CardTitle>
            <CardDescription>
              Analyze and optimize your portfolio allocation
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Diversification Score */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold mb-1">Diversification Score</h4>
              {getRatingBadge(diversificationScore.rating)}
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary">{diversificationScore.overall}</p>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${diversificationScore.categoryBalance}%` }}
                  />
                </div>
                <span className="text-xs font-bold">{diversificationScore.categoryBalance}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Risk Dist.</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${diversificationScore.riskDistribution}%` }}
                  />
                </div>
                <span className="text-xs font-bold">{diversificationScore.riskDistribution}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Concentration</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${diversificationScore.concentration}%` }}
                  />
                </div>
                <span className="text-xs font-bold">{diversificationScore.concentration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Selector */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Target Strategy</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={strategy === 'conservative' ? 'default' : 'outline'}
              onClick={() => setStrategy('conservative')}
            >
              Conservative
            </Button>
            <Button
              size="sm"
              variant={strategy === 'balanced' ? 'default' : 'outline'}
              onClick={() => setStrategy('balanced')}
            >
              Balanced
            </Button>
            <Button
              size="sm"
              variant={strategy === 'aggressive' ? 'default' : 'outline'}
              onClick={() => setStrategy('aggressive')}
            >
              Aggressive
            </Button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-center">Current Allocation</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-center">Portfolio Metrics</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Asset Allocations */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-semibold">Asset Categories</h4>
          {allocations.map((allocation, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-sm">{allocation.category}</h5>
                    {getRiskBadge(allocation.risk)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Value</p>
                      <p className="text-sm font-bold">{formatCurrency(allocation.value)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-sm font-bold text-primary">{allocation.percentage}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-sm font-bold">{allocation.recommended}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deviation</p>
                      <p className={`text-sm font-bold ${
                        allocation.deviation === 0
                          ? 'text-green-600'
                          : Math.abs(allocation.deviation) > 5
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                        {allocation.deviation > 0 ? '+' : ''}{allocation.deviation}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${allocation.percentage}%` }}
                      />
                      <div
                        className="absolute top-0 h-full w-0.5 bg-green-500"
                        style={{ left: `${allocation.recommended}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold">Rebalancing Recommendations</h4>
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                rec.priority === 'high'
                  ? 'border-red-500/30 bg-red-500/5'
                  : rec.priority === 'medium'
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-sm">{rec.category}</h5>
                    {getPriorityBadge(rec.priority)}
                    <Badge variant={rec.type === 'increase' ? 'secondary' : rec.type === 'decrease' ? 'destructive' : 'outline'}>
                      {rec.type === 'increase' ? '↑ Increase' : rec.type === 'decrease' ? '↓ Decrease' : '→ Maintain'}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{rec.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {rec.currentAllocation}% → {rec.targetAllocation}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Boxes */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Diversification Benefits
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Reduce overall portfolio risk</li>
              <li>• Minimize impact of single asset volatility</li>
              <li>• Smoother long-term returns</li>
              <li>• Better risk-adjusted performance</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Best Practices
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Rebalance quarterly or when deviation {'>'}10%</li>
              <li>• Maintain emergency fund in stablecoins</li>
              <li>• Adjust allocation based on risk tolerance</li>
              <li>• Consider tax implications when rebalancing</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

