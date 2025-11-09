'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock,
  Target,
  Activity,
  Shield,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { useState } from 'react';

interface FlashloanTransaction {
  id: string;
  protocol: string;
  amount: number;
  token: string;
  borrower: string;
  profit: number;
  gasUsed: number;
  strategy: 'arbitrage' | 'liquidation' | 'collateral_swap' | 'other';
  timestamp: Date;
  txHash: string;
  success: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

interface FlashloanOpportunity {
  id: string;
  type: 'arbitrage' | 'liquidation';
  dexes: string[];
  estimatedProfit: number;
  requiredCapital: number;
  gasEstimate: number;
  riskScore: number;
  expiresIn: number;
}

interface ProtocolStats {
  protocol: string;
  totalVolume: number;
  transactions: number;
  avgSize: number;
  successRate: number;
  logo: string;
}

interface FlashloanMonitorProps {
  walletAddress: string;
}

export function FlashloanMonitor({ walletAddress }: FlashloanMonitorProps) {
  const [filterStrategy, setFilterStrategy] = useState<'all' | FlashloanTransaction['strategy']>('all');

  // Mock flashloan transactions
  const transactions: FlashloanTransaction[] = [
    {
      id: '1',
      protocol: 'Aave',
      amount: 1000000,
      token: 'USDC',
      borrower: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      profit: 5420,
      gasUsed: 450000,
      strategy: 'arbitrage',
      timestamp: new Date(Date.now() - 3600000),
      txHash: '0xabcd1234...',
      success: true,
      riskLevel: 'medium',
    },
    {
      id: '2',
      protocol: 'dYdX',
      amount: 50,
      token: 'ETH',
      borrower: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      profit: 8750,
      gasUsed: 380000,
      strategy: 'liquidation',
      timestamp: new Date(Date.now() - 7200000),
      txHash: '0xefgh5678...',
      success: true,
      riskLevel: 'high',
    },
    {
      id: '3',
      protocol: 'Balancer',
      amount: 500000,
      token: 'DAI',
      borrower: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      profit: 3200,
      gasUsed: 420000,
      strategy: 'arbitrage',
      timestamp: new Date(Date.now() - 10800000),
      txHash: '0xijkl9012...',
      success: true,
      riskLevel: 'low',
    },
    {
      id: '4',
      protocol: 'Aave',
      amount: 2000000,
      token: 'USDT',
      borrower: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
      profit: -850,
      gasUsed: 480000,
      strategy: 'collateral_swap',
      timestamp: new Date(Date.now() - 14400000),
      txHash: '0xmnop3456...',
      success: false,
      riskLevel: 'high',
    },
  ];

  // Mock opportunities
  const opportunities: FlashloanOpportunity[] = [
    {
      id: '1',
      type: 'arbitrage',
      dexes: ['Uniswap V3', 'Sushiswap'],
      estimatedProfit: 2850,
      requiredCapital: 500000,
      gasEstimate: 350000,
      riskScore: 35,
      expiresIn: 45,
    },
    {
      id: '2',
      type: 'liquidation',
      dexes: ['Compound'],
      estimatedProfit: 4200,
      requiredCapital: 1000000,
      gasEstimate: 420000,
      riskScore: 65,
      expiresIn: 120,
    },
  ];

  // Mock protocol stats
  const protocolStats: ProtocolStats[] = [
    {
      protocol: 'Aave',
      totalVolume: 15800000000,
      transactions: 245000,
      avgSize: 64490,
      successRate: 94.5,
      logo: '👻',
    },
    {
      protocol: 'dYdX',
      totalVolume: 8500000000,
      transactions: 180000,
      avgSize: 47222,
      successRate: 91.2,
      logo: '📊',
    },
    {
      protocol: 'Balancer',
      totalVolume: 3200000000,
      transactions: 95000,
      avgSize: 33684,
      successRate: 89.8,
      logo: '⚖️',
    },
  ];

  const filteredTransactions = transactions.filter(tx => {
    if (filterStrategy === 'all') return true;
    return tx.strategy === filterStrategy;
  });

  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalProfit = transactions.filter(tx => tx.success).reduce((sum, tx) => sum + tx.profit, 0);
  const successRate = (transactions.filter(tx => tx.success).length / transactions.length) * 100;
  const activeOpportunities = opportunities.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge variant="success">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      default:
        return null;
    }
  };

  const getStrategyBadge = (strategy: string) => {
    const styles: Record<string, any> = {
      arbitrage: { label: 'Arbitrage', variant: 'info' },
      liquidation: { label: 'Liquidation', variant: 'warning' },
      collateral_swap: { label: 'Collateral Swap', variant: 'default' },
      other: { label: 'Other', variant: 'outline' },
    };
    const style = styles[strategy] || { label: strategy, variant: 'outline' };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Flashloan Monitor
            </CardTitle>
            <CardDescription>
              Track flashloan opportunities and executions
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <Info className="h-4 w-4 mr-2" />
            Learn Flashloans
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{formatNumber(totalVolume)}</p>
            <p className="text-xs text-muted-foreground">Total Volume</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
            <p className="text-xs text-muted-foreground">Total Profit</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{successRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <p className="text-2xl font-bold text-yellow-600">{activeOpportunities}</p>
            <p className="text-xs text-muted-foreground">Opportunities</p>
          </div>
        </div>

        {/* Active Opportunities */}
        {opportunities.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Active Opportunities</h4>
              <Badge variant="warning" className="gap-1">
                <Clock className="h-3 w-3 animate-pulse" />
                Live
              </Badge>
            </div>
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold capitalize">{opp.type} Opportunity</h5>
                      <Badge variant="outline">{opp.expiresIn}s left</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Est. Profit</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(opp.estimatedProfit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Required</p>
                        <p className="text-sm font-bold">
                          {formatCurrency(opp.requiredCapital)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Gas Est.</p>
                        <p className="text-sm font-bold">
                          {formatNumber(opp.gasEstimate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Route:</span>
                      {opp.dexes.map((dex, index) => (
                        <span key={index} className="flex items-center gap-1">
                          {index > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                          <Badge variant="outline" className="text-xs">{dex}</Badge>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Risk Score:</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            opp.riskScore > 70 ? 'bg-red-500' : opp.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${opp.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{opp.riskScore}/100</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    <Zap className="h-4 w-4 mr-2" />
                    Execute
                  </Button>
                  <Button size="sm" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Simulate
                  </Button>
                  <Button size="sm" variant="outline">
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Protocol Stats */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Protocol Statistics</h4>
          <div className="grid md:grid-cols-3 gap-3">
            {protocolStats.map((protocol, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{protocol.logo}</span>
                  <h5 className="font-semibold">{protocol.protocol}</h5>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Volume</span>
                    <span className="font-bold">{formatNumber(protocol.totalVolume)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Transactions</span>
                    <span className="font-bold">{formatNumber(protocol.transactions)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Avg Size</span>
                    <span className="font-bold">{formatCurrency(protocol.avgSize)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-bold text-green-600">{protocol.successRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filterStrategy === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStrategy('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filterStrategy === 'arbitrage' ? 'default' : 'outline'}
            onClick={() => setFilterStrategy('arbitrage')}
          >
            Arbitrage
          </Button>
          <Button
            size="sm"
            variant={filterStrategy === 'liquidation' ? 'default' : 'outline'}
            onClick={() => setFilterStrategy('liquidation')}
          >
            Liquidation
          </Button>
          <Button
            size="sm"
            variant={filterStrategy === 'collateral_swap' ? 'default' : 'outline'}
            onClick={() => setFilterStrategy('collateral_swap')}
          >
            Collateral Swap
          </Button>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Recent Flashloans</h4>
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className={`p-4 rounded-lg border transition-colors ${
                tx.success
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h5 className="font-semibold">{tx.protocol}</h5>
                    {getStrategyBadge(tx.strategy)}
                    {getRiskBadge(tx.riskLevel)}
                    {tx.success ? (
                      <Badge variant="success" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Failed
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-sm font-bold">
                        {formatNumber(tx.amount)} {tx.token}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Profit/Loss</p>
                      <p className={`text-sm font-bold ${
                        tx.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.profit > 0 ? '+' : ''}{formatCurrency(tx.profit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gas Used</p>
                      <p className="text-sm font-bold">{formatNumber(tx.gasUsed)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium">{formatTimeAgo(tx.timestamp)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Borrower: {formatAddress(tx.borrower)}</span>
                    <span>•</span>
                    <span className="font-mono">{tx.txHash}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">⚡ What are Flashloans?</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Borrow large amounts without collateral</li>
            <li>• Must repay within same transaction</li>
            <li>• Used for arbitrage, liquidations, and more</li>
            <li>• Requires smart contract knowledge</li>
            <li>• High risk, high reward strategies</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

