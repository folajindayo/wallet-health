'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Shield,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ExternalLink,
  Eye,
  Settings,
  Filter
} from 'lucide-react';
import { useState } from 'react';

interface OptionsPosition {
  id: string;
  type: 'call' | 'put';
  underlying: string;
  strikePrice: number;
  expiryDate: Date;
  premium: number;
  quantity: number;
  currentPrice: number;
  unrealizedPnL: number;
  pnLPercentage: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  impliedVolatility: number;
  status: 'itm' | 'otm' | 'atm'; // in-the-money, out-of-the-money, at-the-money
  protocol: string;
}

interface PerpetualPosition {
  id: string;
  market: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  liquidationPrice: number;
  leverage: number;
  margin: number;
  unrealizedPnL: number;
  pnLPercentage: number;
  fundingRate: number;
  protocol: string;
}

interface OptionStrategyTemplate {
  id: string;
  name: string;
  description: string;
  type: 'bullish' | 'bearish' | 'neutral';
  riskLevel: 'low' | 'medium' | 'high';
  maxProfit: string;
  maxLoss: string;
  icon: any;
}

interface OptionsDashboardProps {
  walletAddress: string;
}

export function OptionsDashboard({ walletAddress }: OptionsDashboardProps) {
  const [selectedView, setSelectedView] = useState<'options' | 'perps' | 'strategies'>('options');

  // Mock options positions
  const optionsPositions: OptionsPosition[] = [
    {
      id: '1',
      type: 'call',
      underlying: 'ETH',
      strikePrice: 2200,
      expiryDate: new Date(Date.now() + 86400000 * 14),
      premium: 85,
      quantity: 5,
      currentPrice: 105,
      unrealizedPnL: 100,
      pnLPercentage: 23.5,
      delta: 0.65,
      gamma: 0.008,
      theta: -2.5,
      vega: 0.15,
      impliedVolatility: 45,
      status: 'itm',
      protocol: 'Lyra',
    },
    {
      id: '2',
      type: 'put',
      underlying: 'BTC',
      strikePrice: 42000,
      expiryDate: new Date(Date.now() + 86400000 * 7),
      premium: 320,
      quantity: 2,
      currentPrice: 280,
      unrealizedPnL: -80,
      pnLPercentage: -12.5,
      delta: -0.35,
      gamma: 0.005,
      theta: -5.2,
      vega: 0.22,
      impliedVolatility: 52,
      status: 'otm',
      protocol: 'Deribit',
    },
    {
      id: '3',
      type: 'call',
      underlying: 'SOL',
      strikePrice: 100,
      expiryDate: new Date(Date.now() + 86400000 * 30),
      premium: 12,
      quantity: 10,
      currentPrice: 15,
      unrealizedPnL: 30,
      pnLPercentage: 25.0,
      delta: 0.55,
      gamma: 0.012,
      theta: -1.8,
      vega: 0.18,
      impliedVolatility: 68,
      status: 'atm',
      protocol: 'Lyra',
    },
  ];

  // Mock perpetual positions
  const perpetualPositions: PerpetualPosition[] = [
    {
      id: '1',
      market: 'ETH-PERP',
      side: 'long',
      size: 50,
      entryPrice: 2050,
      currentPrice: 2100,
      liquidationPrice: 1850,
      leverage: 5,
      margin: 20500,
      unrealizedPnL: 2500,
      pnLPercentage: 12.2,
      fundingRate: 0.01,
      protocol: 'GMX',
    },
    {
      id: '2',
      market: 'BTC-PERP',
      side: 'short',
      size: 2,
      entryPrice: 43500,
      currentPrice: 43200,
      liquidationPrice: 45800,
      leverage: 3,
      margin: 29000,
      unrealizedPnL: 600,
      pnLPercentage: 2.1,
      fundingRate: -0.008,
      protocol: 'dYdX',
    },
  ];

  // Mock strategy templates
  const strategyTemplates: OptionStrategyTemplate[] = [
    {
      id: '1',
      name: 'Bull Call Spread',
      description: 'Buy lower strike call, sell higher strike call',
      type: 'bullish',
      riskLevel: 'low',
      maxProfit: 'Limited',
      maxLoss: 'Limited',
      icon: TrendingUp,
    },
    {
      id: '2',
      name: 'Bear Put Spread',
      description: 'Buy higher strike put, sell lower strike put',
      type: 'bearish',
      riskLevel: 'low',
      maxProfit: 'Limited',
      maxLoss: 'Limited',
      icon: TrendingDown,
    },
    {
      id: '3',
      name: 'Iron Condor',
      description: 'Sell OTM call & put spreads simultaneously',
      type: 'neutral',
      riskLevel: 'medium',
      maxProfit: 'Limited',
      maxLoss: 'Limited',
      icon: Target,
    },
    {
      id: '4',
      name: 'Long Straddle',
      description: 'Buy call and put at same strike',
      type: 'neutral',
      riskLevel: 'high',
      maxProfit: 'Unlimited',
      maxLoss: 'Limited',
      icon: Activity,
    },
  ];

  const totalOptionsPnL = optionsPositions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  const totalPerpsPnL = perpetualPositions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  const totalPnL = totalOptionsPnL + totalPerpsPnL;
  const totalPositions = optionsPositions.length + perpetualPositions.length;
  const totalMarginUsed = perpetualPositions.reduce((sum, pos) => sum + pos.margin, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 2) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const days = Math.floor((expiryDate.getTime() - Date.now()) / 86400000);
    return days;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'itm':
        return <Badge variant="success">In-The-Money</Badge>;
      case 'otm':
        return <Badge variant="destructive">Out-of-Money</Badge>;
      case 'atm':
        return <Badge variant="warning">At-The-Money</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'call' ? (
      <Badge variant="success" className="gap-1">
        <ArrowUpRight className="h-3 w-3" />
        Call
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <ArrowDownRight className="h-3 w-3" />
        Put
      </Badge>
    );
  };

  const getSideBadge = (side: string) => {
    return side === 'long' ? (
      <Badge variant="success">Long</Badge>
    ) : (
      <Badge variant="destructive">Short</Badge>
    );
  };

  const getStrategyTypeBadge = (type: string) => {
    const styles = {
      bullish: { variant: 'success', label: 'Bullish' },
      bearish: { variant: 'destructive', label: 'Bearish' },
      neutral: { variant: 'warning', label: 'Neutral' },
    };
    const style = styles[type as keyof typeof styles];
    return <Badge variant={style.variant as any}>{style.label}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    const styles = {
      low: { variant: 'success', label: 'Low Risk' },
      medium: { variant: 'warning', label: 'Medium Risk' },
      high: { variant: 'destructive', label: 'High Risk' },
    };
    const style = styles[risk as keyof typeof styles];
    return <Badge variant={style.variant as any}>{style.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Options & Derivatives Dashboard
            </CardTitle>
            <CardDescription>
              Advanced trading with options and perpetual futures
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Position
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className={`p-3 rounded-lg border text-center ${
            totalPnL >= 0 
              ? 'border-green-500/20 bg-green-500/5' 
              : 'border-red-500/20 bg-red-500/5'
          }`}>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
            </p>
            <p className="text-xs text-muted-foreground">Total P&L</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{totalPositions}</p>
            <p className="text-xs text-muted-foreground">Open Positions</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{formatCurrency(totalMarginUsed)}</p>
            <p className="text-xs text-muted-foreground">Margin Used</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{optionsPositions.length}</p>
            <p className="text-xs text-muted-foreground">Options</p>
          </div>
        </div>

        {/* View Selector */}
        <div className="mb-6 flex gap-2">
          <Button
            size="sm"
            variant={selectedView === 'options' ? 'default' : 'outline'}
            onClick={() => setSelectedView('options')}
          >
            Options
          </Button>
          <Button
            size="sm"
            variant={selectedView === 'perps' ? 'default' : 'outline'}
            onClick={() => setSelectedView('perps')}
          >
            Perpetuals
          </Button>
          <Button
            size="sm"
            variant={selectedView === 'strategies' ? 'default' : 'outline'}
            onClick={() => setSelectedView('strategies')}
          >
            Strategies
          </Button>
        </div>

        {/* Options Positions */}
        {selectedView === 'options' && (
          <div className="space-y-4 mb-6">
            {optionsPositions.map((position) => {
              const daysToExpiry = getDaysUntilExpiry(position.expiryDate);
              
              return (
                <div
                  key={position.id}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h5 className="font-bold text-lg">{position.underlying}</h5>
                        {getTypeBadge(position.type)}
                        {getStatusBadge(position.status)}
                        <Badge variant="outline">{position.protocol}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Strike Price</p>
                          <p className="text-sm font-bold">{formatCurrency(position.strikePrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Expiry</p>
                          <p className="text-sm font-bold">{daysToExpiry}d ({formatDate(position.expiryDate)})</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Premium</p>
                          <p className="text-sm font-bold">{formatCurrency(position.premium)} → {formatCurrency(position.currentPrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Quantity</p>
                          <p className="text-sm font-bold">{position.quantity}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${position.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {position.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPnL)}
                      </p>
                      <p className={`text-sm ${position.pnLPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {position.pnLPercentage >= 0 ? '+' : ''}{position.pnLPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Greeks */}
                  <div className="mb-3 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-semibold mb-2">Greeks</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Delta</p>
                        <p className="text-sm font-bold">{position.delta.toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Gamma</p>
                        <p className="text-sm font-bold">{position.gamma.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Theta</p>
                        <p className="text-sm font-bold text-red-500">{position.theta.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Vega</p>
                        <p className="text-sm font-bold">{position.vega.toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">IV</p>
                        <p className="text-sm font-bold">{position.impliedVolatility}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                    <Button size="sm" variant="destructive">
                      Close Position
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Perpetual Positions */}
        {selectedView === 'perps' && (
          <div className="space-y-4 mb-6">
            {perpetualPositions.map((position) => {
              const healthPercentage = ((position.currentPrice - position.liquidationPrice) / position.currentPrice) * 100;
              
              return (
                <div
                  key={position.id}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h5 className="font-bold text-lg">{position.market}</h5>
                        {getSideBadge(position.side)}
                        <Badge variant="outline">{position.leverage}x Leverage</Badge>
                        <Badge variant="info">{position.protocol}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Size</p>
                          <p className="text-sm font-bold">{position.size}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Entry Price</p>
                          <p className="text-sm font-bold">{formatCurrency(position.entryPrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Current Price</p>
                          <p className="text-sm font-bold">{formatCurrency(position.currentPrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Margin</p>
                          <p className="text-sm font-bold">{formatCurrency(position.margin)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${position.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {position.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPnL)}
                      </p>
                      <p className={`text-sm ${position.pnLPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {position.pnLPercentage >= 0 ? '+' : ''}{position.pnLPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Liquidation Risk */}
                  <div className="mb-3 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold">Liquidation Risk</p>
                      <p className="text-xs text-muted-foreground">
                        Liq Price: {formatCurrency(position.liquidationPrice)}
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className={`h-full ${
                          healthPercentage > 50 ? 'bg-green-500' : 
                          healthPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(healthPercentage, 0)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">{healthPercentage.toFixed(1)}% from liquidation</p>
                      <p className={`text-xs font-semibold ${
                        position.fundingRate >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        Funding: {(position.fundingRate * 100).toFixed(3)}%
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Add Margin
                    </Button>
                    <Button size="sm" variant="outline">
                      Take Profit
                    </Button>
                    <Button size="sm" variant="outline">
                      Stop Loss
                    </Button>
                    <Button size="sm" variant="destructive">
                      Close Position
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Strategy Templates */}
        {selectedView === 'strategies' && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold mb-3">Pre-Built Option Strategies</h4>
            {strategyTemplates.map((strategy) => {
              const IconComponent = strategy.icon;
              
              return (
                <div
                  key={strategy.id}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h5 className="font-semibold">{strategy.name}</h5>
                          {getStrategyTypeBadge(strategy.type)}
                          {getRiskBadge(strategy.riskLevel)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {strategy.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-muted-foreground">
                            Max Profit: <span className="font-bold text-green-500">{strategy.maxProfit}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Max Loss: <span className="font-bold text-red-500">{strategy.maxLoss}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Learn More
                    </Button>
                    <Button size="sm">
                      Use Strategy
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Warning Box */}
        <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold mb-1">High Risk Trading</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Options and derivatives involve significant risk</li>
                <li>• You can lose more than your initial investment</li>
                <li>• Monitor liquidation prices closely on leveraged positions</li>
                <li>• Understand Greeks and funding rates before trading</li>
                <li>• Always use stop losses and take profits</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">📈 Derivatives Trading</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Trade options and perpetual futures on-chain</li>
            <li>• Use leverage up to 100x on select platforms</li>
            <li>• Access advanced Greeks analytics</li>
            <li>• Pre-built strategy templates</li>
            <li>• Real-time P&L tracking</li>
            <li>• Automated risk management</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

