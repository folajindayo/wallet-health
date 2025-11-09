'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  TrendingDown,
  TrendingUp,
  DollarSign,
  Zap,
  Activity,
  Target,
  Award,
  Info,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CarbonMetrics {
  totalEmissions: number;
  dailyAverage: number;
  monthlyTrend: number;
  offsetPurchased: number;
  netEmissions: number;
  ranking: 'excellent' | 'good' | 'average' | 'high';
}

interface NetworkEmissions {
  network: string;
  emissions: number;
  transactions: number;
  avgPerTx: number;
  percentage: number;
  logo: string;
}

interface OffsetProject {
  id: string;
  name: string;
  type: 'reforestation' | 'renewable' | 'carbon_capture' | 'ocean';
  description: string;
  pricePerTon: number;
  verified: boolean;
  impact: string;
  logo: string;
}

interface CarbonFootprintTrackerProps {
  walletAddress: string;
}

export function CarbonFootprintTracker({ walletAddress }: CarbonFootprintTrackerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock carbon metrics
  const metrics: CarbonMetrics = {
    totalEmissions: 245.5, // kg CO2
    dailyAverage: 8.2,
    monthlyTrend: -12.5, // Negative means improvement
    offsetPurchased: 150,
    netEmissions: 95.5,
    ranking: 'good',
  };

  // Mock network emissions
  const networkEmissions: NetworkEmissions[] = [
    {
      network: 'Ethereum',
      emissions: 180.5,
      transactions: 45,
      avgPerTx: 4.01,
      percentage: 73.5,
      logo: '💎',
    },
    {
      network: 'Polygon',
      emissions: 35.0,
      transactions: 230,
      avgPerTx: 0.15,
      percentage: 14.3,
      logo: '🟣',
    },
    {
      network: 'Arbitrum',
      emissions: 20.0,
      transactions: 120,
      avgPerTx: 0.17,
      percentage: 8.1,
      logo: '🔵',
    },
    {
      network: 'Optimism',
      emissions: 10.0,
      transactions: 80,
      avgPerTx: 0.13,
      percentage: 4.1,
      logo: '🔴',
    },
  ];

  // Mock chart data
  const chartData = [
    { date: 'Week 1', emissions: 85 },
    { date: 'Week 2', emissions: 72 },
    { date: 'Week 3', emissions: 68 },
    { date: 'Week 4', emissions: 62 },
  ];

  // Mock offset projects
  const offsetProjects: OffsetProject[] = [
    {
      id: '1',
      name: 'Amazon Rainforest Protection',
      type: 'reforestation',
      description: 'Protect and restore rainforest in the Amazon basin',
      pricePerTon: 15,
      verified: true,
      impact: '1 ton = 50 trees protected',
      logo: '🌳',
    },
    {
      id: '2',
      name: 'Solar Farm Development',
      type: 'renewable',
      description: 'Build solar energy infrastructure in developing regions',
      pricePerTon: 20,
      verified: true,
      impact: '1 ton = 500 kWh clean energy',
      logo: '☀️',
    },
    {
      id: '3',
      name: 'Ocean Plastic Removal',
      type: 'ocean',
      description: 'Remove plastic waste from oceans and waterways',
      pricePerTon: 25,
      verified: true,
      impact: '1 ton = 100kg plastic removed',
      logo: '🌊',
    },
    {
      id: '4',
      name: 'Direct Air Capture',
      type: 'carbon_capture',
      description: 'Advanced technology to capture CO2 directly from air',
      pricePerTon: 35,
      verified: true,
      impact: '1 ton = permanent removal',
      logo: '🏭',
    },
  ];

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getRankingBadge = (ranking: string) => {
    switch (ranking) {
      case 'excellent':
        return <Badge variant="success" className="gap-1">
          <Leaf className="h-3 w-3" />
          Excellent
        </Badge>;
      case 'good':
        return <Badge variant="info" className="gap-1">
          <Leaf className="h-3 w-3" />
          Good
        </Badge>;
      case 'average':
        return <Badge variant="warning">Average</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
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
              <Leaf className="h-5 w-5" />
              Carbon Footprint Tracker
            </CardTitle>
            <CardDescription>
              Monitor and offset your blockchain carbon emissions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overview Stats */}
        <div className="mb-6 p-4 rounded-lg border border-green-500/20 bg-green-500/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold mb-1">Your Carbon Impact</h4>
              <div className="flex items-center gap-2">
                {getRankingBadge(metrics.ranking)}
                {metrics.monthlyTrend < 0 && (
                  <Badge variant="success" className="gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {Math.abs(metrics.monthlyTrend)}% improvement
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                <Button
                  key={period}
                  size="sm"
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  onClick={() => setSelectedPeriod(period)}
                  className="h-7 px-2 text-xs"
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Emissions</p>
              <p className="text-2xl font-bold">{formatNumber(metrics.totalEmissions)} kg</p>
              <p className="text-xs text-muted-foreground">CO2 equivalent</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Offset Purchased</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(metrics.offsetPurchased)} kg</p>
              <p className="text-xs text-muted-foreground">Carbon credits</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Emissions</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(metrics.netEmissions)} kg</p>
              <p className="text-xs text-muted-foreground">After offsets</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Daily Average</p>
              <p className="text-2xl font-bold">{formatNumber(metrics.dailyAverage)} kg</p>
              <p className="text-xs text-muted-foreground">Per day</p>
            </div>
          </div>
        </div>

        {/* Emissions Trend Chart */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Emissions Trend</h4>
          <div className="h-64 p-4 rounded-lg border border-border bg-card">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="emissions" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Breakdown */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-semibold">Emissions by Network</h4>
          {networkEmissions.map((network) => (
            <div
              key={network.network}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{network.logo}</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm">{network.network}</h5>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{network.transactions} transactions</span>
                      <span>•</span>
                      <span>{formatNumber(network.avgPerTx)} kg/tx</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatNumber(network.emissions)} kg</p>
                  <p className="text-xs text-muted-foreground">{network.percentage}% of total</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${network.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Carbon Offset Projects */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Offset Your Emissions</h4>
            <Badge variant="info">{formatNumber(metrics.netEmissions)} kg to offset</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {offsetProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{project.logo}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-sm">{project.name}</h5>
                      {project.verified && (
                        <Badge variant="success" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{project.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {project.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{project.impact}</span>
                    </div>
                    <p className="text-sm font-bold text-primary">
                      {formatCurrency(project.pricePerTon)}/ton CO2
                    </p>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <Leaf className="h-4 w-4 mr-2" />
                  Purchase Offset
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              Reduce Your Impact
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use Layer 2 networks (90% less emissions)</li>
              <li>• Batch transactions together</li>
              <li>• Choose low gas periods</li>
              <li>• Use Proof-of-Stake chains</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Earn Green Badges
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>🌱 Carbon Neutral - Offset 100% emissions</li>
              <li>🌿 Eco Warrior - 6 months carbon neutral</li>
              <li>🌳 Climate Champion - 1 year carbon neutral</li>
              <li>🌏 Planet Protector - 10+ tons offset</li>
            </ul>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🌍 Why Carbon Tracking Matters</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Blockchain transactions consume energy and produce CO2</li>
            <li>• L2 networks use 90% less energy than L1</li>
            <li>• Carbon credits fund renewable energy and reforestation</li>
            <li>• Track and reduce your environmental impact</li>
            <li>• Be part of the solution for sustainable Web3</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

