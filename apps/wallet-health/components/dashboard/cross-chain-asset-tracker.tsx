'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ArrowRightLeft,
  Target,
  Zap,
  Shield,
  Clock,
  BarChart3,
  PieChart,
  Globe,
  Link,
  ExternalLink,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Plus
} from 'lucide-react';
import { useState } from 'react';

interface ChainAsset {
  chain: string;
  chainLogo: string;
  totalValue: number;
  tokenCount: number;
  nftCount: number;
  gasBalance: number;
  defiPositions: number;
  topAssets: {
    symbol: string;
    balance: number;
    value: number;
    change24h: number;
  }[];
  recentActivity: number;
  securityScore: number;
}

interface CrossChainToken {
  symbol: string;
  name: string;
  logo: string;
  totalValue: number;
  chains: {
    chain: string;
    balance: number;
    value: number;
    percentage: number;
  }[];
}

interface BridgeActivity {
  id: string;
  fromChain: string;
  toChain: string;
  token: string;
  amount: number;
  value: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  estimatedTime?: string;
  txHash?: string;
}

interface CrossChainAssetTrackerProps {
  walletAddress: string;
}

export function CrossChainAssetTracker({ walletAddress }: CrossChainAssetTrackerProps) {
  const [selectedView, setSelectedView] = useState<'chains' | 'tokens' | 'bridges'>('chains');

  // Mock chain assets
  const chainAssets: ChainAsset[] = [
    {
      chain: 'Ethereum',
      chainLogo: '⟠',
      totalValue: 85000,
      tokenCount: 18,
      nftCount: 45,
      gasBalance: 2.5,
      defiPositions: 8,
      topAssets: [
        { symbol: 'ETH', balance: 25, value: 52500, change24h: 2.3 },
        { symbol: 'USDC', balance: 15000, value: 15000, change24h: 0.1 },
        { symbol: 'UNI', balance: 500, value: 8500, change24h: -1.2 },
      ],
      recentActivity: 12,
      securityScore: 92,
    },
    {
      chain: 'Polygon',
      chainLogo: '🟣',
      totalValue: 18500,
      tokenCount: 12,
      nftCount: 8,
      gasBalance: 150,
      defiPositions: 5,
      topAssets: [
        { symbol: 'MATIC', balance: 5000, value: 4500, change24h: 1.5 },
        { symbol: 'USDC', balance: 8000, value: 8000, change24h: 0.0 },
        { symbol: 'WETH', balance: 2.5, value: 5250, change24h: 2.3 },
      ],
      recentActivity: 8,
      securityScore: 88,
    },
    {
      chain: 'Arbitrum',
      chainLogo: '🔵',
      totalValue: 12000,
      tokenCount: 8,
      nftCount: 2,
      gasBalance: 0.8,
      defiPositions: 4,
      topAssets: [
        { symbol: 'ARB', balance: 2000, value: 2800, change24h: 3.2 },
        { symbol: 'ETH', balance: 4, value: 8400, change24h: 2.3 },
        { symbol: 'USDC', balance: 800, value: 800, change24h: 0.0 },
      ],
      recentActivity: 5,
      securityScore: 90,
    },
    {
      chain: 'Base',
      chainLogo: '🔷',
      totalValue: 5800,
      tokenCount: 6,
      nftCount: 12,
      gasBalance: 0.4,
      defiPositions: 2,
      topAssets: [
        { symbol: 'ETH', balance: 2.5, value: 5250, change24h: 2.3 },
        { symbol: 'USDC', balance: 500, value: 500, change24h: 0.0 },
        { symbol: 'DEGEN', balance: 50000, value: 50, change24h: -5.2 },
      ],
      recentActivity: 3,
      securityScore: 85,
    },
    {
      chain: 'Optimism',
      chainLogo: '🔴',
      totalValue: 3700,
      tokenCount: 5,
      nftCount: 3,
      gasBalance: 0.3,
      defiPositions: 1,
      topAssets: [
        { symbol: 'OP', balance: 500, value: 1500, change24h: 1.8 },
        { symbol: 'ETH', balance: 1, value: 2100, change24h: 2.3 },
        { symbol: 'USDC', balance: 100, value: 100, change24h: 0.0 },
      ],
      recentActivity: 2,
      securityScore: 87,
    },
  ];

  // Mock cross-chain tokens
  const crossChainTokens: CrossChainToken[] = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      logo: '⟠',
      totalValue: 68250,
      chains: [
        { chain: 'Ethereum', balance: 25, value: 52500, percentage: 77 },
        { chain: 'Arbitrum', balance: 4, value: 8400, percentage: 12 },
        { chain: 'Base', balance: 2.5, value: 5250, percentage: 8 },
        { chain: 'Optimism', balance: 1, value: 2100, percentage: 3 },
      ],
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      logo: '💵',
      totalValue: 24300,
      chains: [
        { chain: 'Ethereum', balance: 15000, value: 15000, percentage: 62 },
        { chain: 'Polygon', balance: 8000, value: 8000, percentage: 33 },
        { chain: 'Arbitrum', balance: 800, value: 800, percentage: 3 },
        { chain: 'Base', balance: 500, value: 500, percentage: 2 },
      ],
    },
    {
      symbol: 'UNI',
      name: 'Uniswap',
      logo: '🦄',
      totalValue: 8500,
      chains: [
        { chain: 'Ethereum', balance: 500, value: 8500, percentage: 100 },
      ],
    },
  ];

  // Mock bridge activities
  const bridgeActivities: BridgeActivity[] = [
    {
      id: '1',
      fromChain: 'Ethereum',
      toChain: 'Arbitrum',
      token: 'ETH',
      amount: 2.5,
      value: 5250,
      status: 'completed',
      timestamp: new Date(Date.now() - 86400000 * 1),
      txHash: '0xabcd1234...',
    },
    {
      id: '2',
      fromChain: 'Polygon',
      toChain: 'Ethereum',
      token: 'USDC',
      amount: 5000,
      value: 5000,
      status: 'completed',
      timestamp: new Date(Date.now() - 86400000 * 3),
      txHash: '0xefgh5678...',
    },
    {
      id: '3',
      fromChain: 'Base',
      toChain: 'Optimism',
      token: 'ETH',
      amount: 1,
      value: 2100,
      status: 'pending',
      timestamp: new Date(Date.now() - 3600000 * 2),
      estimatedTime: '~15 minutes',
    },
  ];

  const totalValue = chainAssets.reduce((sum, ca) => sum + ca.totalValue, 0);
  const totalChains = chainAssets.length;
  const totalTokens = chainAssets.reduce((sum, ca) => sum + ca.tokenCount, 0);
  const totalNFTs = chainAssets.reduce((sum, ca) => sum + ca.nftCount, 0);
  const averageSecurityScore = chainAssets.reduce((sum, ca) => sum + ca.securityScore, 0) / chainAssets.length;

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
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
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
              <Network className="h-5 w-5" />
              Cross-Chain Asset Tracker
            </CardTitle>
            <CardDescription>
              Track and manage assets across all blockchain networks
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Globe className="h-4 w-4 text-blue-500" />
              <p className="text-2xl font-bold">{totalChains}</p>
            </div>
            <p className="text-xs text-muted-foreground">Chains</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{totalTokens}</p>
            <p className="text-xs text-muted-foreground">Tokens</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{totalNFTs}</p>
            <p className="text-xs text-muted-foreground">NFTs</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-500">{averageSecurityScore.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Avg Security</p>
          </div>
        </div>

        {/* View Selector */}
        <div className="mb-6 flex gap-2">
          <Button
            size="sm"
            variant={selectedView === 'chains' ? 'default' : 'outline'}
            onClick={() => setSelectedView('chains')}
          >
            <Globe className="h-4 w-4 mr-2" />
            By Chain
          </Button>
          <Button
            size="sm"
            variant={selectedView === 'tokens' ? 'default' : 'outline'}
            onClick={() => setSelectedView('tokens')}
          >
            <PieChart className="h-4 w-4 mr-2" />
            By Token
          </Button>
          <Button
            size="sm"
            variant={selectedView === 'bridges' ? 'default' : 'outline'}
            onClick={() => setSelectedView('bridges')}
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Bridges
          </Button>
        </div>

        {/* By Chain View */}
        {selectedView === 'chains' && (
          <div className="space-y-4 mb-6">
            {chainAssets.map((chain) => {
              const percentage = (chain.totalValue / totalValue) * 100;
              
              return (
                <div
                  key={chain.chain}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-4xl">{chain.chainLogo}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-bold text-lg">{chain.chain}</h5>
                          <Badge variant="outline">{percentage.toFixed(1)}% of portfolio</Badge>
                          <Badge variant="secondary">Score: {chain.securityScore}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Value</p>
                            <p className="text-sm font-bold">{formatCurrency(chain.totalValue)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Tokens / NFTs</p>
                            <p className="text-sm font-bold">{chain.tokenCount} / {chain.nftCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Gas Balance</p>
                            <p className="text-sm font-bold">{formatNumber(chain.gasBalance, 4)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">DeFi Positions</p>
                            <p className="text-sm font-bold">{chain.defiPositions}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Assets */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold mb-2">Top Assets</p>
                    <div className="space-y-2">
                      {chain.topAssets.map((asset) => (
                        <div
                          key={asset.symbol}
                          className="flex items-center justify-between p-2 rounded bg-card border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{asset.symbol}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatNumber(asset.balance)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{formatCurrency(asset.value)}</span>
                            {asset.change24h >= 0 ? (
                              <span className="text-xs text-green-500 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +{asset.change24h.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-xs text-red-500 flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                {asset.change24h.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Bridge
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Explorer
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* By Token View */}
        {selectedView === 'tokens' && (
          <div className="space-y-4 mb-6">
            {crossChainTokens.map((token) => (
              <div
                key={token.symbol}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-4xl">{token.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-bold text-lg">{token.symbol}</h5>
                      <Badge variant="outline">{token.name}</Badge>
                      <Badge variant="default">{token.chains.length} chains</Badge>
                    </div>
                    <p className="text-2xl font-bold mb-3">{formatCurrency(token.totalValue)}</p>
                  </div>
                </div>

                {/* Distribution */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold mb-2">Distribution Across Chains</p>
                  {token.chains.map((chain) => (
                    <div key={chain.chain}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">{chain.chain}</span>
                        <span className="text-muted-foreground">
                          {formatNumber(chain.balance)} • {formatCurrency(chain.value)} ({chain.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${chain.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bridge Activity View */}
        {selectedView === 'bridges' && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Recent Bridge Activity</h4>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Bridge
              </Button>
            </div>
            {bridgeActivities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 rounded-lg border transition-colors ${
                  activity.status === 'pending'
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{activity.fromChain}</Badge>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">{activity.toChain}</Badge>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm mb-2">
                      <span className="font-bold">{formatNumber(activity.amount)} {activity.token}</span>
                      <span className="text-muted-foreground">{formatCurrency(activity.value)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(activity.timestamp)}
                      </span>
                      {activity.estimatedTime && (
                        <>
                          <span>•</span>
                          <span>{activity.estimatedTime}</span>
                        </>
                      )}
                      {activity.txHash && (
                        <>
                          <span>•</span>
                          <span>{activity.txHash}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {activity.status === 'pending' && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                      <div className="h-full w-2/3 bg-yellow-500 animate-pulse" />
                    </div>
                    <span className="text-muted-foreground">Processing...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🌐 Cross-Chain Benefits</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Track assets across all major blockchain networks</li>
            <li>• Unified portfolio view with real-time pricing</li>
            <li>• Monitor bridge transactions and transfers</li>
            <li>• Optimize asset distribution across chains</li>
            <li>• Identify arbitrage opportunities</li>
            <li>• Single dashboard for multi-chain management</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

