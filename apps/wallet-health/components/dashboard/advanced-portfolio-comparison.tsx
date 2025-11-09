'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GitCompare, 
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Award,
  AlertCircle,
  CheckCircle2,
  Minus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useState } from 'react';

interface WalletComparison {
  address: string;
  name: string;
  portfolioValue: number;
  securityScore: number;
  totalTokens: number;
  totalNFTs: number;
  activeApprovals: number;
  riskyApprovals: number;
  monthlyGrowth: number;
  diversificationScore: number;
  defiExposure: number;
  topToken: string;
  age: number; // days
  transactionCount: number;
  avgTransactionValue: number;
}

interface ComparisonMetric {
  label: string;
  key: keyof WalletComparison;
  format: 'currency' | 'number' | 'percentage' | 'days';
  icon: any;
  description: string;
  category: 'performance' | 'security' | 'activity';
}

interface AdvancedPortfolioComparisonProps {
  currentWallet: string;
}

export function AdvancedPortfolioComparison({ currentWallet }: AdvancedPortfolioComparisonProps) {
  const [selectedWallets, setSelectedWallets] = useState<string[]>([currentWallet]);

  // Mock wallet data
  const wallets: Record<string, WalletComparison> = {
    [currentWallet]: {
      address: currentWallet,
      name: 'Your Wallet',
      portfolioValue: 125000,
      securityScore: 85,
      totalTokens: 24,
      totalNFTs: 12,
      activeApprovals: 8,
      riskyApprovals: 2,
      monthlyGrowth: 12.5,
      diversificationScore: 78,
      defiExposure: 45000,
      topToken: 'ETH',
      age: 456,
      transactionCount: 1234,
      avgTransactionValue: 850,
    },
    '0x742d35Cc6634C0532925a3b844Bc454e4438f44e': {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      name: 'Whale Wallet',
      portfolioValue: 2500000,
      securityScore: 95,
      totalTokens: 45,
      totalNFTs: 156,
      activeApprovals: 15,
      riskyApprovals: 0,
      monthlyGrowth: 8.3,
      diversificationScore: 92,
      defiExposure: 850000,
      topToken: 'ETH',
      age: 1250,
      transactionCount: 8956,
      avgTransactionValue: 15000,
    },
    '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD': {
      address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      name: 'Conservative Portfolio',
      portfolioValue: 85000,
      securityScore: 92,
      totalTokens: 8,
      totalNFTs: 3,
      activeApprovals: 3,
      riskyApprovals: 0,
      monthlyGrowth: 4.2,
      diversificationScore: 65,
      defiExposure: 25000,
      topToken: 'USDC',
      age: 890,
      transactionCount: 456,
      avgTransactionValue: 1200,
    },
    '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a': {
      address: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      name: 'Aggressive Trader',
      portfolioValue: 65000,
      securityScore: 68,
      totalTokens: 38,
      totalNFTs: 8,
      activeApprovals: 22,
      riskyApprovals: 5,
      monthlyGrowth: 28.7,
      diversificationScore: 45,
      defiExposure: 52000,
      topToken: 'PEPE',
      age: 234,
      transactionCount: 3456,
      avgTransactionValue: 450,
    },
  };

  const metrics: ComparisonMetric[] = [
    {
      label: 'Portfolio Value',
      key: 'portfolioValue',
      format: 'currency',
      icon: DollarSign,
      description: 'Total wallet value',
      category: 'performance',
    },
    {
      label: 'Security Score',
      key: 'securityScore',
      format: 'number',
      icon: Shield,
      description: 'Overall security rating',
      category: 'security',
    },
    {
      label: 'Monthly Growth',
      key: 'monthlyGrowth',
      format: 'percentage',
      icon: TrendingUp,
      description: '30-day portfolio change',
      category: 'performance',
    },
    {
      label: 'Total Tokens',
      key: 'totalTokens',
      format: 'number',
      icon: PieChart,
      description: 'Number of different tokens',
      category: 'activity',
    },
    {
      label: 'Total NFTs',
      key: 'totalNFTs',
      format: 'number',
      icon: Award,
      description: 'NFT collection size',
      category: 'activity',
    },
    {
      label: 'Active Approvals',
      key: 'activeApprovals',
      format: 'number',
      icon: CheckCircle2,
      description: 'Current token approvals',
      category: 'security',
    },
    {
      label: 'Risky Approvals',
      key: 'riskyApprovals',
      format: 'number',
      icon: AlertCircle,
      description: 'High-risk approvals',
      category: 'security',
    },
    {
      label: 'Diversification',
      key: 'diversificationScore',
      format: 'number',
      icon: Target,
      description: 'Portfolio diversification score',
      category: 'performance',
    },
    {
      label: 'DeFi Exposure',
      key: 'defiExposure',
      format: 'currency',
      icon: Activity,
      description: 'Value in DeFi protocols',
      category: 'activity',
    },
    {
      label: 'Wallet Age',
      key: 'age',
      format: 'days',
      icon: BarChart3,
      description: 'Days since first transaction',
      category: 'activity',
    },
    {
      label: 'Total Transactions',
      key: 'transactionCount',
      format: 'number',
      icon: Activity,
      description: 'All-time transaction count',
      category: 'activity',
    },
    {
      label: 'Avg Transaction',
      key: 'avgTransactionValue',
      format: 'currency',
      icon: DollarSign,
      description: 'Average transaction value',
      category: 'activity',
    },
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
      case 'days':
        return `${value} days`;
      default:
        return value.toLocaleString();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getMetricComparison = (
    metric: ComparisonMetric,
    walletAddress: string,
    compareAddress: string
  ) => {
    const wallet = wallets[walletAddress];
    const compare = wallets[compareAddress];
    const walletValue = wallet[metric.key] as number;
    const compareValue = compare[metric.key] as number;
    
    const diff = ((walletValue - compareValue) / compareValue) * 100;
    const isHigherBetter = !['riskyApprovals', 'activeApprovals'].includes(metric.key);
    const isBetter = isHigherBetter ? diff > 0 : diff < 0;
    
    return { diff, isBetter };
  };

  const getBestWallet = (metric: ComparisonMetric) => {
    const selectedWalletData = selectedWallets.map(addr => ({
      address: addr,
      value: wallets[addr][metric.key] as number,
    }));

    const isHigherBetter = !['riskyApprovals', 'activeApprovals'].includes(metric.key);
    const best = selectedWalletData.sort((a, b) => 
      isHigherBetter ? b.value - a.value : a.value - b.value
    )[0];

    return best.address;
  };

  const addWallet = (address: string) => {
    if (!selectedWallets.includes(address)) {
      setSelectedWallets([...selectedWallets, address]);
    }
  };

  const removeWallet = (address: string) => {
    if (selectedWallets.length > 1) {
      setSelectedWallets(selectedWallets.filter(addr => addr !== address));
    }
  };

  const categoryMetrics = (category: string) => 
    metrics.filter(m => m.category === category);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Advanced Portfolio Comparison
            </CardTitle>
            <CardDescription>
              Compare wallet strategies and performance
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Wallet
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Selected Wallets */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Comparing {selectedWallets.length} Wallets</h4>
          <div className="flex gap-2 flex-wrap">
            {selectedWallets.map((address) => (
              <div
                key={address}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/20 bg-primary/5"
              >
                <span className="text-sm font-medium">
                  {wallets[address].name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatAddress(address)}
                </span>
                {selectedWallets.length > 1 && (
                  <button
                    onClick={() => removeWallet(address)}
                    className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Available Wallets to Add */}
        {selectedWallets.length < Object.keys(wallets).length && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3">Add More Wallets</h4>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(wallets)
                .filter(addr => !selectedWallets.includes(addr))
                .map((address) => (
                  <Button
                    key={address}
                    size="sm"
                    variant="outline"
                    onClick={() => addWallet(address)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {wallets[address].name}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance Metrics
          </h4>
          <div className="space-y-4">
            {categoryMetrics('performance').map((metric) => {
              const IconComponent = metric.icon;
              const bestWallet = getBestWallet(metric);
              
              return (
                <div key={metric.key} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <IconComponent className="h-4 w-4 text-primary" />
                    <h5 className="font-semibold">{metric.label}</h5>
                    <span className="text-xs text-muted-foreground">
                      {metric.description}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {selectedWallets.map((address) => {
                      const wallet = wallets[address];
                      const value = wallet[metric.key] as number;
                      const isBest = address === bestWallet;
                      
                      return (
                        <div
                          key={address}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isBest
                              ? 'border border-green-500/30 bg-green-500/5'
                              : 'border border-border bg-card'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{wallet.name}</span>
                            {isBest && (
                              <Badge variant="success" className="gap-1">
                                <Award className="h-3 w-3" />
                                Best
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">
                              {formatValue(value, metric.format)}
                            </span>
                            {metric.key === 'monthlyGrowth' && (
                              value >= 0 ? (
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Metrics */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Metrics
          </h4>
          <div className="space-y-4">
            {categoryMetrics('security').map((metric) => {
              const IconComponent = metric.icon;
              const bestWallet = getBestWallet(metric);
              
              return (
                <div key={metric.key} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <IconComponent className="h-4 w-4 text-primary" />
                    <h5 className="font-semibold">{metric.label}</h5>
                    <span className="text-xs text-muted-foreground">
                      {metric.description}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {selectedWallets.map((address) => {
                      const wallet = wallets[address];
                      const value = wallet[metric.key] as number;
                      const isBest = address === bestWallet;
                      
                      return (
                        <div
                          key={address}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isBest
                              ? 'border border-green-500/30 bg-green-500/5'
                              : 'border border-border bg-card'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{wallet.name}</span>
                            {isBest && (
                              <Badge variant="success" className="gap-1">
                                <Award className="h-3 w-3" />
                                Best
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm font-bold">
                            {formatValue(value, metric.format)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Metrics */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Metrics
          </h4>
          <div className="space-y-4">
            {categoryMetrics('activity').map((metric) => {
              const IconComponent = metric.icon;
              const bestWallet = getBestWallet(metric);
              
              return (
                <div key={metric.key} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <IconComponent className="h-4 w-4 text-primary" />
                    <h5 className="font-semibold">{metric.label}</h5>
                    <span className="text-xs text-muted-foreground">
                      {metric.description}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {selectedWallets.map((address) => {
                      const wallet = wallets[address];
                      const value = wallet[metric.key] as number;
                      const isBest = address === bestWallet;
                      
                      return (
                        <div
                          key={address}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isBest
                              ? 'border border-green-500/30 bg-green-500/5'
                              : 'border border-border bg-card'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{wallet.name}</span>
                            {isBest && (
                              <Badge variant="success" className="gap-1">
                                <Award className="h-3 w-3" />
                                Best
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm font-bold">
                            {formatValue(value, metric.format)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">📊 Comparison Insights</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Compare multiple wallets side-by-side</li>
            <li>• Identify best practices from top performers</li>
            <li>• Track performance across key metrics</li>
            <li>• Learn from different investment strategies</li>
            <li>• Benchmark against whales and experts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

