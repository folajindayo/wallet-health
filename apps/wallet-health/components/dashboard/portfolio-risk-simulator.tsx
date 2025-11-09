'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Target,
  BarChart3,
  Zap,
  RefreshCw,
  Play,
  RotateCcw,
  Settings,
  Info,
  DollarSign,
  Percent,
  Activity
} from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  type: 'market_crash' | 'bull_run' | 'volatility' | 'defi_exploit' | 'custom';
  parameters: {
    priceChange: number; // percentage
    duration: number; // days
    volatility: number; // 0-100
    liquidationRisk: number; // 0-100
  };
}

interface PortfolioRiskSimulatorProps {
  walletAddress: string;
  currentValue: number;
}

export function PortfolioRiskSimulator({ walletAddress, currentValue = 50000 }: PortfolioRiskSimulatorProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>('market_crash');
  const [isSimulating, setIsSimulating] = useState(false);
  const [customParams, setCustomParams] = useState({
    priceChange: -30,
    duration: 7,
    volatility: 50,
  });

  // Predefined simulation scenarios
  const scenarios: SimulationScenario[] = [
    {
      id: 'market_crash',
      name: 'Market Crash',
      description: 'Simulate a severe 50% market downturn over 7 days',
      type: 'market_crash',
      parameters: {
        priceChange: -50,
        duration: 7,
        volatility: 80,
        liquidationRisk: 75,
      },
    },
    {
      id: 'bull_run',
      name: 'Bull Run',
      description: 'Simulate a 100% price increase over 30 days',
      type: 'bull_run',
      parameters: {
        priceChange: 100,
        duration: 30,
        volatility: 40,
        liquidationRisk: 10,
      },
    },
    {
      id: 'high_volatility',
      name: 'High Volatility',
      description: 'Extreme price swings with 20% daily moves',
      type: 'volatility',
      parameters: {
        priceChange: 0,
        duration: 14,
        volatility: 90,
        liquidationRisk: 45,
      },
    },
    {
      id: 'defi_exploit',
      name: 'DeFi Exploit',
      description: 'Protocol hack causing 80% loss in specific positions',
      type: 'defi_exploit',
      parameters: {
        priceChange: -80,
        duration: 1,
        volatility: 95,
        liquidationRisk: 90,
      },
    },
    {
      id: 'stable_growth',
      name: 'Stable Growth',
      description: 'Steady 30% growth over 90 days',
      type: 'custom',
      parameters: {
        priceChange: 30,
        duration: 90,
        volatility: 20,
        liquidationRisk: 5,
      },
    },
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenario) || scenarios[0];

  // Generate simulation data
  const generateSimulationData = () => {
    const { priceChange, duration, volatility } = currentScenario.parameters;
    const data = [];
    const steps = Math.min(duration, 30); // Max 30 data points for clarity

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const trend = (priceChange / 100) * progress;
      const noise = (Math.random() - 0.5) * (volatility / 100) * 0.3;
      const change = trend + noise;
      
      const portfolioValue = currentValue * (1 + change);
      const bestCase = currentValue * (1 + change + (volatility / 400));
      const worstCase = currentValue * (1 + change - (volatility / 400));

      data.push({
        day: i,
        value: portfolioValue,
        bestCase,
        worstCase,
        change: change * 100,
      });
    }

    return data;
  };

  const simulationData = generateSimulationData();
  const finalValue = simulationData[simulationData.length - 1].value;
  const totalChange = ((finalValue - currentValue) / currentValue) * 100;
  const maxDrawdown = Math.min(...simulationData.map(d => d.change));
  const maxGain = Math.max(...simulationData.map(d => d.change));

  // Risk metrics
  const riskMetrics = {
    valueAtRisk: currentValue * 0.15, // 15% VaR
    maxLoss: currentValue * (Math.abs(maxDrawdown) / 100),
    sharpeRatio: totalChange > 0 ? (totalChange / currentScenario.parameters.volatility).toFixed(2) : '0.00',
    liquidationRisk: currentScenario.parameters.liquidationRisk,
  };

  // Asset allocation impact
  const assetImpact = [
    { asset: 'ETH', allocation: 45, impact: currentScenario.parameters.priceChange * 0.9, value: 22500 },
    { asset: 'BTC', allocation: 25, impact: currentScenario.parameters.priceChange * 0.7, value: 12500 },
    { asset: 'Stablecoins', allocation: 15, impact: 0, value: 7500 },
    { asset: 'DeFi Tokens', allocation: 10, impact: currentScenario.parameters.priceChange * 1.5, value: 5000 },
    { asset: 'NFTs', allocation: 5, impact: currentScenario.parameters.priceChange * 1.2, value: 2500 },
  ];

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Portfolio Risk Simulator
            </CardTitle>
            <CardDescription>
              Test your portfolio against market scenarios
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={runSimulation}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSimulating ? 'animate-spin' : ''}`} />
              Run Simulation
            </Button>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Portfolio Value */}
        <div className="p-4 rounded-lg border border-border bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Portfolio Value</p>
              <p className="text-3xl font-bold">${currentValue.toLocaleString()}</p>
            </div>
            <Shield className="h-12 w-12 text-primary/50" />
          </div>
        </div>

        {/* Scenario Selection */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Select Simulation Scenario</h4>
          <div className="grid md:grid-cols-3 gap-3">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-4 rounded-lg border text-left transition-all hover:border-primary ${
                  selectedScenario === scenario.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-sm">{scenario.name}</h5>
                  {scenario.parameters.priceChange < 0 ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{scenario.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {scenario.parameters.priceChange > 0 ? '+' : ''}
                    {scenario.parameters.priceChange}%
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {scenario.parameters.duration}d
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Results */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Projected Value</span>
            </div>
            <p className="text-2xl font-bold">${finalValue.toLocaleString(0)}</p>
            <div className={`flex items-center gap-1 text-xs mt-1 ${totalChange >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
              {totalChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{totalChange > 0 ? '+' : ''}{totalChange.toFixed(2)}%</span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Max Drawdown</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{maxDrawdown.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              ${(currentValue * Math.abs(maxDrawdown) / 100).toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-xs">Volatility</span>
            </div>
            <p className="text-2xl font-bold">{currentScenario.parameters.volatility}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sharpe: {riskMetrics.sharpeRatio}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs">Liquidation Risk</span>
            </div>
            <p className="text-2xl font-bold">{riskMetrics.liquidationRisk}%</p>
            <Badge 
              variant={riskMetrics.liquidationRisk > 70 ? 'destructive' : riskMetrics.liquidationRisk > 40 ? 'default' : 'secondary'}
              className="mt-1"
            >
              {riskMetrics.liquidationRisk > 70 ? 'High' : riskMetrics.liquidationRisk > 40 ? 'Medium' : 'Low'}
            </Badge>
          </div>
        </div>

        {/* Simulation Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Portfolio Value Projection</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWorst" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="day" 
                  stroke="#666"
                  label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#666"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="bestCase"
                  name="Best Case"
                  stroke="#3b82f6"
                  fill="url(#colorBest)"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Expected"
                  stroke="#10b981"
                  fill="url(#colorValue)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="worstCase"
                  name="Worst Case"
                  stroke="#ef4444"
                  fill="url(#colorWorst)"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Impact Analysis */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Asset Impact Analysis</h4>
          <div className="space-y-3">
            {assetImpact.map((asset) => {
              const newValue = asset.value * (1 + asset.impact / 100);
              const change = newValue - asset.value;
              
              return (
                <div key={asset.asset} className="p-3 rounded-lg border border-border bg-card/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{asset.asset}</span>
                      <Badge variant="outline" className="text-xs">
                        {asset.allocation}%
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${newValue.toLocaleString()}</p>
                      <p className={`text-xs ${change >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                        {change > 0 ? '+' : ''}${change.toLocaleString()} ({asset.impact.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${change >= 0 ? 'bg-emerald-500' : 'bg-destructive'}`}
                      style={{ width: `${Math.abs(asset.impact)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Mitigation Recommendations */}
        <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/10">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold mb-2">Risk Mitigation Recommendations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {riskMetrics.liquidationRisk > 50 && (
                  <li>• High liquidation risk detected - Consider reducing leverage or adding collateral</li>
                )}
                {Math.abs(maxDrawdown) > 30 && (
                  <li>• Significant drawdown possible - Increase stablecoin allocation to 25%+</li>
                )}
                {currentScenario.parameters.volatility > 70 && (
                  <li>• High volatility scenario - Set stop-loss orders at key support levels</li>
                )}
                <li>• Diversify across uncorrelated assets to reduce portfolio volatility</li>
                <li>• Consider hedging with options or inverse positions for downside protection</li>
                <li>• Maintain 10-20% in stablecoins for buying opportunities during crashes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stress Test Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border text-center">
            <DollarSign className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Value at Risk (95%)</p>
            <p className="text-xl font-bold">${riskMetrics.valueAtRisk.toLocaleString()}</p>
          </div>

          <div className="p-4 rounded-lg border border-border text-center">
            <AlertTriangle className="h-8 w-8 mx-auto text-destructive mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Maximum Loss</p>
            <p className="text-xl font-bold">${riskMetrics.maxLoss.toLocaleString()}</p>
          </div>

          <div className="p-4 rounded-lg border border-border text-center">
            <BarChart3 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Sharpe Ratio</p>
            <p className="text-xl font-bold">{riskMetrics.sharpeRatio}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

