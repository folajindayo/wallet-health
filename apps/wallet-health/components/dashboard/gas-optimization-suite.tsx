'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  TrendingDown,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Target,
  Timer,
  Flame,
  Wind,
  Droplet,
  Bell,
  Settings,
  BarChart3,
  LineChart
} from 'lucide-react';
import { useState } from 'react';

interface GasPrice {
  type: 'slow' | 'standard' | 'fast' | 'instant';
  gwei: number;
  usd: number;
  timeEstimate: string;
  icon: any;
  color: string;
}

interface GasOptimization {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'high' | 'medium' | 'low';
  category: 'timing' | 'batching' | 'approval' | 'network';
  implemented: boolean;
}

interface GasAlert {
  id: string;
  type: 'price-drop' | 'optimal-time' | 'network-congestion';
  message: string;
  timestamp: Date;
  actionable: boolean;
}

interface HistoricalGas {
  timestamp: Date;
  price: number;
  congestion: 'low' | 'medium' | 'high';
}

interface GasOptimizationSuiteProps {
  currentChain: string;
}

export function GasOptimizationSuite({ currentChain }: GasOptimizationSuiteProps) {
  const [selectedSpeed, setSelectedSpeed] = useState<'slow' | 'standard' | 'fast' | 'instant'>('standard');
  const [alertThreshold, setAlertThreshold] = useState(30); // GWEI

  // Mock current gas prices
  const gasPrices: GasPrice[] = [
    {
      type: 'slow',
      gwei: 12,
      usd: 2.15,
      timeEstimate: '~10 min',
      icon: Droplet,
      color: 'text-blue-500',
    },
    {
      type: 'standard',
      gwei: 18,
      usd: 3.22,
      timeEstimate: '~3 min',
      icon: Wind,
      color: 'text-green-500',
    },
    {
      type: 'fast',
      gwei: 25,
      usd: 4.48,
      timeEstimate: '~30 sec',
      icon: Zap,
      color: 'text-yellow-500',
    },
    {
      type: 'instant',
      gwei: 35,
      usd: 6.27,
      timeEstimate: '~15 sec',
      icon: Flame,
      color: 'text-red-500',
    },
  ];

  // Mock optimization suggestions
  const optimizations: GasOptimization[] = [
    {
      id: '1',
      title: 'Batch Multiple Transactions',
      description: 'Combine 3 pending approvals into one transaction',
      potentialSavings: 45,
      difficulty: 'easy',
      impact: 'high',
      category: 'batching',
      implemented: false,
    },
    {
      id: '2',
      title: 'Optimize Approval Timing',
      description: 'Wait for off-peak hours (2-6 AM UTC)',
      potentialSavings: 60,
      difficulty: 'easy',
      impact: 'high',
      category: 'timing',
      implemented: false,
    },
    {
      id: '3',
      title: 'Use Layer 2 Networks',
      description: 'Move some operations to Arbitrum or Optimism',
      potentialSavings: 85,
      difficulty: 'medium',
      impact: 'high',
      category: 'network',
      implemented: false,
    },
    {
      id: '4',
      title: 'Revoke Unlimited Approvals',
      description: 'Replace with limited approvals to avoid re-approval costs',
      potentialSavings: 25,
      difficulty: 'easy',
      impact: 'medium',
      category: 'approval',
      implemented: true,
    },
    {
      id: '5',
      title: 'Gas Token Strategy',
      description: 'Mint gas tokens during low congestion',
      potentialSavings: 40,
      difficulty: 'hard',
      impact: 'medium',
      category: 'timing',
      implemented: false,
    },
  ];

  // Mock gas alerts
  const gasAlerts: GasAlert[] = [
    {
      id: '1',
      type: 'price-drop',
      message: 'Gas price dropped 40% in the last hour!',
      timestamp: new Date(Date.now() - 1800000),
      actionable: true,
    },
    {
      id: '2',
      type: 'optimal-time',
      message: 'Best time to transact: Next 2 hours',
      timestamp: new Date(Date.now() - 3600000),
      actionable: true,
    },
    {
      id: '3',
      type: 'network-congestion',
      message: 'Network congestion increasing, wait recommended',
      timestamp: new Date(Date.now() - 7200000),
      actionable: false,
    },
  ];

  // Mock historical gas data (last 24 hours)
  const historicalGas: HistoricalGas[] = Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 3600000),
    price: 15 + Math.random() * 20 + Math.sin(i / 3) * 10,
    congestion: i % 8 < 3 ? 'low' : i % 8 < 6 ? 'medium' : 'high',
  }));

  const currentGasPrice = gasPrices.find(gp => gp.type === selectedSpeed) || gasPrices[1];
  const avgGasPrice = historicalGas.reduce((sum, h) => sum + h.price, 0) / historicalGas.length;
  const minGasPrice = Math.min(...historicalGas.map(h => h.price));
  const maxGasPrice = Math.max(...historicalGas.map(h => h.price));
  const currentVsAvg = ((currentGasPrice.gwei - avgGasPrice) / avgGasPrice) * 100;
  
  const totalPotentialSavings = optimizations
    .filter(o => !o.implemented)
    .reduce((sum, o) => sum + o.potentialSavings, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'success',
      medium: 'warning',
      hard: 'destructive',
    };
    return (
      <Badge variant={colors[difficulty as keyof typeof colors] as any} className="capitalize">
        {difficulty}
      </Badge>
    );
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'success',
      medium: 'warning',
      low: 'default',
    };
    return (
      <Badge variant={colors[impact as keyof typeof colors] as any} className="capitalize">
        {impact} Impact
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'timing':
        return Timer;
      case 'batching':
        return Target;
      case 'approval':
        return CheckCircle2;
      case 'network':
        return Activity;
      default:
        return Zap;
    }
  };

  const getCongestionColor = (congestion: string) => {
    switch (congestion) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price-drop':
        return TrendingDown;
      case 'optimal-time':
        return Clock;
      case 'network-congestion':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Gas Optimization Suite
            </CardTitle>
            <CardDescription>
              Save money with intelligent gas strategies
            </CardDescription>
          </div>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure Alerts
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Gas Prices */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Current Gas Prices ({currentChain})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gasPrices.map((price) => {
              const IconComponent = price.icon;
              const isSelected = price.type === selectedSpeed;
              
              return (
                <button
                  key={price.type}
                  onClick={() => setSelectedSpeed(price.type)}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-primary/10 scale-105'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`h-4 w-4 ${price.color}`} />
                    <span className="text-xs font-semibold capitalize">{price.type}</span>
                  </div>
                  <p className="text-2xl font-bold mb-1">{price.gwei}</p>
                  <p className="text-xs text-muted-foreground mb-1">GWEI</p>
                  <p className="text-sm font-semibold text-primary">{formatCurrency(price.usd)}</p>
                  <p className="text-xs text-muted-foreground">{price.timeEstimate}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gas Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Current</p>
            <p className="text-xl font-bold">{currentGasPrice.gwei} GWEI</p>
            {currentVsAvg >= 0 ? (
              <p className="text-xs text-red-500">+{currentVsAvg.toFixed(1)}% vs avg</p>
            ) : (
              <p className="text-xs text-green-500">{currentVsAvg.toFixed(1)}% vs avg</p>
            )}
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-xs text-muted-foreground mb-1">24h Average</p>
            <p className="text-xl font-bold">{avgGasPrice.toFixed(1)} GWEI</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-xs text-muted-foreground mb-1">24h Low</p>
            <p className="text-xl font-bold text-green-500">{minGasPrice.toFixed(1)} GWEI</p>
          </div>
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-center">
            <p className="text-xs text-muted-foreground mb-1">24h High</p>
            <p className="text-xl font-bold text-red-500">{maxGasPrice.toFixed(1)} GWEI</p>
          </div>
        </div>

        {/* Gas Alerts */}
        {gasAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            <h4 className="text-sm font-semibold">Live Alerts</h4>
            {gasAlerts.slice(0, 3).map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    alert.actionable
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-yellow-500/30 bg-yellow-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <AlertIcon className={`h-4 w-4 mt-0.5 ${
                        alert.actionable ? 'text-green-500' : 'text-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                    {alert.actionable && (
                      <Button size="sm" variant="outline">
                        Act Now
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Optimization Suggestions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Optimization Suggestions</h4>
            <Badge variant="secondary" className="gap-1">
              <TrendingDown className="h-3 w-3" />
              Save up to {totalPotentialSavings}%
            </Badge>
          </div>
          <div className="space-y-3">
            {optimizations.map((opt) => {
              const CategoryIcon = getCategoryIcon(opt.category);
              
              return (
                <div
                  key={opt.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    opt.implemented
                      ? 'border-green-500/30 bg-green-500/5 opacity-60'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h5 className="font-semibold">{opt.title}</h5>
                          {opt.implemented ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Implemented
                            </Badge>
                          ) : (
                            <>
                              {getDifficultyBadge(opt.difficulty)}
                              {getImpactBadge(opt.impact)}
                            </>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {opt.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1">
                            <DollarSign className="h-3 w-3" />
                            Save {opt.potentialSavings}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!opt.implemented && (
                    <Button size="sm" variant="outline">
                      <Zap className="h-4 w-4 mr-2" />
                      Implement
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Historical Gas Chart Preview */}
        <div className="mb-6 p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">24h Gas Price Trend</h4>
            <Button size="sm" variant="ghost">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Chart
            </Button>
          </div>
          <div className="h-24 flex items-end gap-1">
            {historicalGas.slice(-12).map((data, index) => {
              const height = (data.price / maxGasPrice) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 relative group"
                >
                  <div
                    className={`w-full rounded-t transition-all ${
                      data.congestion === 'low'
                        ? 'bg-green-500/50 group-hover:bg-green-500'
                        : data.congestion === 'medium'
                        ? 'bg-yellow-500/50 group-hover:bg-yellow-500'
                        : 'bg-red-500/50 group-hover:bg-red-500'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {data.price.toFixed(1)} GWEI
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>12h ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* Best Times to Transact */}
        <div className="mb-6 p-4 rounded-lg border border-green-500/20 bg-green-500/5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Best Times to Transact (Next 24h)
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded bg-card border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Tonight</p>
              <p className="text-sm font-bold">2-6 AM UTC</p>
              <Badge variant="secondary" className="text-xs mt-1">~12 GWEI</Badge>
            </div>
            <div className="p-2 rounded bg-card border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Tomorrow</p>
              <p className="text-sm font-bold">3-7 AM UTC</p>
              <Badge variant="secondary" className="text-xs mt-1">~11 GWEI</Badge>
            </div>
            <div className="p-2 rounded bg-card border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Weekend</p>
              <p className="text-sm font-bold">Sat Morning</p>
              <Badge variant="secondary" className="text-xs mt-1">~10 GWEI</Badge>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">⚡ Gas Optimization Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Transact during off-peak hours (2-6 AM UTC) for 40-60% savings</li>
            <li>• Batch multiple operations into single transactions</li>
            <li>• Use Layer 2 solutions for frequent transactions</li>
            <li>• Set custom gas prices based on urgency</li>
            <li>• Enable gas alerts for price drops</li>
            <li>• Consider using gas tokens during high congestion</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

