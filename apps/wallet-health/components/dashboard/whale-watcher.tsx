'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Filter,
  Star,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface WhaleTransaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  fromLabel?: string;
  toLabel?: string;
  token: string;
  amount: number;
  valueUSD: number;
  type: 'transfer' | 'swap' | 'stake' | 'bridge';
  timestamp: Date;
  chain: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

interface WatchedWhale {
  address: string;
  label: string;
  balance: number;
  isWatching: boolean;
  recentActivity: number;
}

interface WhaleWatcherProps {
  walletAddress: string;
}

export function WhaleWatcher({ walletAddress }: WhaleWatcherProps) {
  const [filter, setFilter] = useState<'all' | 'transfer' | 'swap'>('all');
  const [minValue, setMinValue] = useState(100000); // Minimum $100k

  // Mock whale transactions
  const mockTransactions: WhaleTransaction[] = [
    {
      id: '1',
      hash: '0xabc...123',
      from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      fromLabel: 'Binance Hot Wallet',
      toLabel: 'Uniswap V2 Router',
      token: 'ETH',
      amount: 500,
      valueUSD: 1750000,
      type: 'transfer',
      timestamp: new Date(Date.now() - 300000),
      chain: 'Ethereum',
      impact: 'critical',
    },
    {
      id: '2',
      hash: '0xdef...456',
      from: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      to: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      fromLabel: 'Unknown Whale',
      toLabel: 'Aave Pool',
      token: 'USDC',
      amount: 2500000,
      valueUSD: 2500000,
      type: 'stake',
      timestamp: new Date(Date.now() - 600000),
      chain: 'Ethereum',
      impact: 'high',
    },
    {
      id: '3',
      hash: '0x789...abc',
      from: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      to: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
      fromLabel: 'OKX',
      toLabel: 'Uniswap V3 Router',
      token: 'WBTC',
      amount: 25,
      valueUSD: 1550000,
      type: 'swap',
      timestamp: new Date(Date.now() - 900000),
      chain: 'Ethereum',
      impact: 'high',
    },
    {
      id: '4',
      hash: '0x321...def',
      from: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
      to: '0x1111111254EEB25477B68fb85Ed929f73A960582',
      fromLabel: 'Bitfinex',
      toLabel: '1inch Router',
      token: 'USDT',
      amount: 1200000,
      valueUSD: 1200000,
      type: 'swap',
      timestamp: new Date(Date.now() - 1200000),
      chain: 'Ethereum',
      impact: 'medium',
    },
    {
      id: '5',
      hash: '0x654...789',
      from: '0x28C6c06298d514Db089934071355E5743bf21d60',
      to: '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf',
      fromLabel: 'Unknown Whale',
      toLabel: 'Polygon Bridge',
      token: 'ETH',
      amount: 150,
      valueUSD: 525000,
      type: 'bridge',
      timestamp: new Date(Date.now() - 1800000),
      chain: 'Ethereum',
      impact: 'medium',
    },
  ];

  const mockWatchedWhales: WatchedWhale[] = [
    {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      label: 'Binance Hot Wallet',
      balance: 250000000,
      isWatching: true,
      recentActivity: 45,
    },
    {
      address: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      label: 'OKX',
      balance: 180000000,
      isWatching: true,
      recentActivity: 32,
    },
  ];

  const filteredTransactions = mockTransactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (tx.valueUSD < minValue) return false;
    return true;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { label: string; variant: any }> = {
      transfer: { label: 'Transfer', variant: 'default' },
      swap: { label: 'Swap', variant: 'info' },
      stake: { label: 'Stake', variant: 'success' },
      bridge: { label: 'Bridge', variant: 'warning' },
    };
    const style = styles[type] || { label: type, variant: 'outline' };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Whale Watcher
            </CardTitle>
            <CardDescription>
              Monitor large transactions and whale movements
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Watched Whales */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Star className="h-4 w-4" />
              Watched Whales ({mockWatchedWhales.length})
            </h4>
            <Button size="sm" variant="outline">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {mockWatchedWhales.map((whale) => (
              <div
                key={whale.address}
                className="flex items-center justify-between p-2 rounded bg-background/50"
              >
                <div>
                  <p className="text-sm font-medium">{whale.label}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatAddress(whale.address)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Activity: {whale.recentActivity}tx</p>
                  <p className="text-xs font-bold">{formatCurrency(whale.balance)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'transfer' ? 'default' : 'outline'}
            onClick={() => setFilter('transfer')}
          >
            Transfers
          </Button>
          <Button
            size="sm"
            variant={filter === 'swap' ? 'default' : 'outline'}
            onClick={() => setFilter('swap')}
          >
            Swaps
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="text-sm border rounded px-2 py-1 bg-background"
              value={minValue}
              onChange={(e) => setMinValue(Number(e.target.value))}
            >
              <option value={50000}>$50K+</option>
              <option value={100000}>$100K+</option>
              <option value={500000}>$500K+</option>
              <option value={1000000}>$1M+</option>
            </select>
          </div>
        </div>

        {/* Live Transactions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Live Large Transactions</h4>
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className={`p-4 rounded-lg border transition-colors ${
                tx.impact === 'critical'
                  ? 'border-red-500/30 bg-red-500/5 animate-pulse'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getTypeBadge(tx.type)}
                    {getImpactBadge(tx.impact)}
                    <Badge variant="outline">{tx.chain}</Badge>
                  </div>

                  {/* Transaction Flow */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-sm font-medium truncate">
                        {tx.fromLabel || formatAddress(tx.from)}
                      </p>
                      {tx.fromLabel && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatAddress(tx.from)}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="text-sm font-medium truncate">
                        {tx.toLabel || formatAddress(tx.to)}
                      </p>
                      {tx.toLabel && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatAddress(tx.to)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-4 mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-lg font-bold">
                        {tx.amount.toLocaleString()} {tx.token}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Value</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(tx.valueUSD)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(tx.timestamp)} • {tx.hash}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              {tx.impact === 'critical' && (
                <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-xs text-red-600 font-medium">
                    Critical transaction - May impact market price
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Large Transactions</p>
            <p className="text-xs text-muted-foreground">
              Adjust filters to see more transactions
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🐋 Whale Watching Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Large transfers from exchanges often signal market movements</li>
            <li>• Watch for accumulation patterns from known whales</li>
            <li>• Critical transactions can cause short-term volatility</li>
            <li>• Follow whale wallets that align with your strategy</li>
            <li>• Set alerts for specific whale addresses</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

