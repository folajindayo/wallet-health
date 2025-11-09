'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Bell,
  RefreshCw,
  BarChart3,
  Zap,
  Target,
  Info,
  Lock,
  Unlock
} from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProtocolMetrics {
  id: string;
  name: string;
  logo: string;
  category: 'defi' | 'lending' | 'dex' | 'bridge' | 'derivatives';
  healthScore: number; // 0-100
  tvl: number;
  tvlChange24h: number;
  volume24h: number;
  volumeChange24h: number;
  users24h: number;
  usersChange24h: number;
  securityScore: number;
  auditStatus: 'audited' | 'unaudited' | 'in-progress';
  insuranceCoverage: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  alerts: {
    type: 'critical' | 'warning' | 'info';
    message: string;
  }[];
}

interface ProtocolHealthMonitorProps {
  walletAddress: string;
}

export function ProtocolHealthMonitor({ walletAddress }: ProtocolHealthMonitorProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'defi' | 'lending' | 'dex' | 'bridge' | 'derivatives'>('all');
  const [sortBy, setSortBy] = useState<'health' | 'tvl' | 'volume'>('health');

  // Mock protocol data
  const protocols: ProtocolMetrics[] = [
    {
      id: '1',
      name: 'Aave',
      logo: '👻',
      category: 'lending',
      healthScore: 95,
      tvl: 5200000000,
      tvlChange24h: 2.5,
      volume24h: 450000000,
      volumeChange24h: 5.2,
      users24h: 12500,
      usersChange24h: 3.1,
      securityScore: 98,
      auditStatus: 'audited',
      insuranceCoverage: true,
      riskLevel: 'low',
      alerts: [],
    },
    {
      id: '2',
      name: 'Uniswap V3',
      logo: '🦄',
      category: 'dex',
      healthScore: 92,
      tvl: 3800000000,
      tvlChange24h: -1.2,
      volume24h: 1200000000,
      volumeChange24h: 8.5,
      users24h: 28000,
      usersChange24h: 4.7,
      securityScore: 96,
      auditStatus: 'audited',
      insuranceCoverage: true,
      riskLevel: 'low',
      alerts: [],
    },
    {
      id: '3',
      name: 'Compound',
      logo: '🏦',
      category: 'lending',
      healthScore: 88,
      tvl: 2100000000,
      tvlChange24h: 1.8,
      volume24h: 180000000,
      volumeChange24h: -2.3,
      users24h: 8900,
      usersChange24h: 1.5,
      securityScore: 94,
      auditStatus: 'audited',
      insuranceCoverage: true,
      riskLevel: 'low',
      alerts: [
        { type: 'info', message: 'New governance proposal active' },
      ],
    },
    {
      id: '4',
      name: 'Curve Finance',
      logo: '🌀',
      category: 'dex',
      healthScore: 85,
      tvl: 4500000000,
      tvlChange24h: 0.5,
      volume24h: 850000000,
      volumeChange24h: 3.2,
      users24h: 15600,
      usersChange24h: 2.1,
      securityScore: 90,
      auditStatus: 'audited',
      insuranceCoverage: true,
      riskLevel: 'low',
      alerts: [
        { type: 'warning', message: 'High volatility detected in pool #42' },
      ],
    },
    {
      id: '5',
      name: 'GMX',
      logo: '⚡',
      category: 'derivatives',
      healthScore: 82,
      tvl: 650000000,
      tvlChange24h: 4.5,
      volume24h: 420000000,
      volumeChange24h: 12.3,
      users24h: 5200,
      usersChange24h: 8.9,
      securityScore: 88,
      auditStatus: 'audited',
      insuranceCoverage: false,
      riskLevel: 'medium',
      alerts: [
        { type: 'info', message: 'New trading pair added: SOL-PERP' },
      ],
    },
    {
      id: '6',
      name: 'Across Bridge',
      logo: '🌉',
      category: 'bridge',
      healthScore: 78,
      tvl: 280000000,
      tvlChange24h: -3.2,
      volume24h: 95000000,
      volumeChange24h: -1.5,
      users24h: 3400,
      usersChange24h: -2.1,
      securityScore: 85,
      auditStatus: 'audited',
      insuranceCoverage: true,
      riskLevel: 'medium',
      alerts: [
        { type: 'warning', message: 'Increased bridge delay on Arbitrum route' },
      ],
    },
  ];

  // Historical health data
  const healthHistory = [
    { date: 'Mon', aave: 94, uniswap: 91, compound: 87, curve: 84, gmx: 81, across: 79 },
    { date: 'Tue', aave: 93, uniswap: 92, compound: 88, curve: 85, gmx: 80, across: 78 },
    { date: 'Wed', aave: 95, uniswap: 91, compound: 87, curve: 83, gmx: 82, across: 77 },
    { date: 'Thu', aave: 94, uniswap: 93, compound: 89, curve: 86, gmx: 81, across: 79 },
    { date: 'Fri', aave: 95, uniswap: 92, compound: 88, curve: 85, gmx: 82, across: 78 },
    { date: 'Sat', aave: 96, uniswap: 93, compound: 89, curve: 86, gmx: 83, across: 80 },
    { date: 'Sun', aave: 95, uniswap: 92, compound: 88, curve: 85, gmx: 82, across: 78 },
  ];

  const filteredProtocols = protocols
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'health') return b.healthScore - a.healthScore;
      if (sortBy === 'tvl') return b.tvl - a.tvl;
      if (sortBy === 'volume') return b.volume24h - a.volume24h;
      return 0;
    });

  const getHealthBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', variant: 'secondary' as const, color: 'text-emerald-500' };
    if (score >= 75) return { label: 'Good', variant: 'default' as const, color: 'text-blue-500' };
    if (score >= 60) return { label: 'Fair', variant: 'default' as const, color: 'text-amber-500' };
    return { label: 'Poor', variant: 'destructive' as const, color: 'text-destructive' };
  };

  const getRiskBadge = (risk: string) => {
    const config = {
      low: { variant: 'secondary' as const, label: 'Low Risk', color: 'text-emerald-500' },
      medium: { variant: 'default' as const, label: 'Medium Risk', color: 'text-amber-500' },
      high: { variant: 'destructive' as const, label: 'High Risk', color: 'text-destructive' },
    };
    return config[risk as keyof typeof config];
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      defi: 'bg-blue-500/10 text-blue-500',
      lending: 'bg-green-500/10 text-green-500',
      dex: 'bg-purple-500/10 text-purple-500',
      bridge: 'bg-orange-500/10 text-orange-500',
      derivatives: 'bg-pink-500/10 text-pink-500',
    };
    return colors[category as keyof typeof colors];
  };

  // Calculate overall stats
  const overallStats = {
    avgHealthScore: protocols.reduce((sum, p) => sum + p.healthScore, 0) / protocols.length,
    totalTVL: protocols.reduce((sum, p) => sum + p.tvl, 0),
    totalVolume: protocols.reduce((sum, p) => sum + p.volume24h, 0),
    criticalAlerts: protocols.reduce((sum, p) => sum + p.alerts.filter(a => a.type === 'critical').length, 0),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Protocol Health Monitor
            </CardTitle>
            <CardDescription>
              Real-time health tracking of DeFi protocols
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </Button>
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-xs">Avg Health</span>
            </div>
            <p className="text-2xl font-bold">{overallStats.avgHealthScore.toFixed(0)}</p>
            <Badge variant="secondary" className="mt-1">
              {getHealthBadge(overallStats.avgHealthScore).label}
            </Badge>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total TVL</span>
            </div>
            <p className="text-2xl font-bold">${(overallStats.totalTVL / 1000000000).toFixed(1)}B</p>
            <p className="text-xs text-muted-foreground mt-1">Across {protocols.length} protocols</p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">24h Volume</span>
            </div>
            <p className="text-2xl font-bold">${(overallStats.totalVolume / 1000000000).toFixed(2)}B</p>
            <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+4.2%</span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Alerts</span>
            </div>
            <p className="text-2xl font-bold">{overallStats.criticalAlerts}</p>
            <p className="text-xs text-muted-foreground mt-1">Critical issues</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === 'lending' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('lending')}
            >
              Lending
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === 'dex' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('dex')}
            >
              DEX
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === 'derivatives' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('derivatives')}
            >
              Derivatives
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === 'bridge' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('bridge')}
            >
              Bridge
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            <select
              className="text-xs bg-background border border-border rounded-md px-2 py-1"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="health">Health Score</option>
              <option value="tvl">TVL</option>
              <option value="volume">Volume</option>
            </select>
          </div>
        </div>

        {/* Health Trend Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3">7-Day Health Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" domain={[70, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="aave" name="Aave" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="uniswap" name="Uniswap" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="compound" name="Compound" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="curve" name="Curve" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol List */}
        <div className="space-y-4">
          {filteredProtocols.map((protocol) => {
            const health = getHealthBadge(protocol.healthScore);
            const risk = getRiskBadge(protocol.riskLevel);

            return (
              <div key={protocol.id} className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{protocol.logo}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{protocol.name}</h4>
                        <Badge variant="outline" className={getCategoryBadge(protocol.category)}>
                          {protocol.category.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={health.variant}>{health.label}</Badge>
                        <Badge variant={risk.variant}>{risk.label}</Badge>
                        {protocol.insuranceCoverage && (
                          <Badge variant="outline" className="gap-1">
                            <Shield className="h-3 w-3 text-emerald-500" />
                            Insured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Visit
                  </Button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Health Score</p>
                    <p className={`text-lg font-bold ${health.color}`}>{protocol.healthScore}/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">TVL</p>
                    <p className="text-lg font-bold">${(protocol.tvl / 1000000000).toFixed(2)}B</p>
                    <p className={`text-xs ${protocol.tvlChange24h >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                      {protocol.tvlChange24h > 0 ? '+' : ''}{protocol.tvlChange24h.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
                    <p className="text-lg font-bold">${(protocol.volume24h / 1000000).toFixed(0)}M</p>
                    <p className={`text-xs ${protocol.volumeChange24h >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                      {protocol.volumeChange24h > 0 ? '+' : ''}{protocol.volumeChange24h.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Security Score</p>
                    <p className="text-lg font-bold">{protocol.securityScore}/100</p>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {protocol.auditStatus}
                    </Badge>
                  </div>
                </div>

                {/* Alerts */}
                {protocol.alerts.length > 0 && (
                  <div className="space-y-2">
                    {protocol.alerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-md flex items-start gap-2 ${
                          alert.type === 'critical'
                            ? 'bg-destructive/10 border border-destructive/20'
                            : alert.type === 'warning'
                            ? 'bg-amber-500/10 border border-amber-500/20'
                            : 'bg-blue-500/10 border border-blue-500/20'
                        }`}
                      >
                        {alert.type === 'critical' ? (
                          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                        ) : alert.type === 'warning' ? (
                          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-xs">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Risk Summary */}
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold mb-2">💡 Monitoring Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Monitor health scores below 70 for potential risks</li>
                <li>• Check for sudden TVL drops ({'>'}20%) which may indicate issues</li>
                <li>• Verify audit status before depositing large amounts</li>
                <li>• Enable notifications for critical alerts on your positions</li>
                <li>• Review security scores and insurance coverage regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

