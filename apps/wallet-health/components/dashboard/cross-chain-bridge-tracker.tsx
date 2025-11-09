'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shuffle, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';

interface BridgeTransaction {
  id: string;
  fromChain: string;
  toChain: string;
  token: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
  estimatedTime: number; // in minutes
  bridgeProtocol: string;
  txHash: string;
  fee: number;
}

interface CrossChainBridgeTrackerProps {
  walletAddress: string;
  transactions?: BridgeTransaction[];
}

export function CrossChainBridgeTracker({ 
  walletAddress, 
  transactions = [] 
}: CrossChainBridgeTrackerProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Mock bridge transactions
  const mockTransactions: BridgeTransaction[] = [
    {
      id: '1',
      fromChain: 'Ethereum',
      toChain: 'Arbitrum',
      token: 'ETH',
      amount: 0.5,
      status: 'processing',
      timestamp: new Date(Date.now() - 600000),
      estimatedTime: 15,
      bridgeProtocol: 'Arbitrum Bridge',
      txHash: '0xabc...def',
      fee: 0.002,
    },
    {
      id: '2',
      fromChain: 'Polygon',
      toChain: 'Ethereum',
      token: 'USDC',
      amount: 1000,
      status: 'completed',
      timestamp: new Date(Date.now() - 86400000),
      estimatedTime: 20,
      bridgeProtocol: 'Polygon Bridge',
      txHash: '0x123...456',
      fee: 2.5,
    },
    {
      id: '3',
      fromChain: 'Ethereum',
      toChain: 'Optimism',
      token: 'USDT',
      amount: 500,
      status: 'completed',
      timestamp: new Date(Date.now() - 172800000),
      estimatedTime: 10,
      bridgeProtocol: 'Optimism Bridge',
      txHash: '0x789...abc',
      fee: 1.8,
    },
    {
      id: '4',
      fromChain: 'BNB Chain',
      toChain: 'Ethereum',
      token: 'BNB',
      amount: 2.5,
      status: 'pending',
      timestamp: new Date(Date.now() - 300000),
      estimatedTime: 25,
      bridgeProtocol: 'Binance Bridge',
      txHash: '0xdef...789',
      fee: 0.005,
    },
  ];

  const displayTransactions = transactions.length > 0 ? transactions : mockTransactions;

  const filteredTransactions = displayTransactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'pending') return tx.status === 'pending' || tx.status === 'processing';
    if (filter === 'completed') return tx.status === 'completed';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Processing
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getChainIcon = (chain: string) => {
    const icons: Record<string, string> = {
      'Ethereum': '⟠',
      'Arbitrum': '🔷',
      'Optimism': '🔴',
      'Polygon': '🟣',
      'BNB Chain': '🟡',
      'Base': '🔵',
    };
    return icons[chain] || '⛓️';
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const stats = {
    total: displayTransactions.length,
    pending: displayTransactions.filter(tx => tx.status === 'pending' || tx.status === 'processing').length,
    completed: displayTransactions.filter(tx => tx.status === 'completed').length,
    totalVolume: displayTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    totalFees: displayTransactions.reduce((sum, tx) => sum + tx.fee, 0),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Cross-Chain Bridge Tracker
            </CardTitle>
            <CardDescription>
              Monitor your cross-chain bridge transactions
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Bridges</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-xl font-bold">${stats.totalFees.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Fees</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </Button>
          <Button
            size="sm"
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            In Progress ({stats.pending})
          </Button>
          <Button
            size="sm"
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
          >
            Completed ({stats.completed})
          </Button>
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  {/* Chain Route */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                      <span className="text-xl">{getChainIcon(tx.fromChain)}</span>
                      <span className="text-sm font-medium">{tx.fromChain}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                      <span className="text-xl">{getChainIcon(tx.toChain)}</span>
                      <span className="text-sm font-medium">{tx.toChain}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{tx.bridgeProtocol}</Badge>
                    {getStatusBadge(tx.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div>
                      <span className="text-foreground font-medium">
                        {tx.amount} {tx.token}
                      </span>
                    </div>
                    <div>
                      Fee: <span className="text-foreground">${tx.fee.toFixed(2)}</span>
                    </div>
                    {(tx.status === 'pending' || tx.status === 'processing') && (
                      <div className="flex items-center gap-1 text-primary">
                        <Clock className="h-3 w-3" />
                        ~{tx.estimatedTime}min
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTimestamp(tx.timestamp)}</span>
                    <span>•</span>
                    <span className="font-mono">{tx.txHash}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`https://etherscan.io/tx/${tx.txHash}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar for Processing */}
              {(tx.status === 'processing' || tx.status === 'pending') && (
                <div className="mt-3">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000 animate-pulse"
                      style={{ width: tx.status === 'processing' ? '60%' : '20%' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tx.status === 'processing' 
                      ? 'Transaction is being processed on destination chain' 
                      : 'Waiting for source chain confirmation'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <Shuffle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              No bridge transactions found
            </p>
            <p className="text-xs text-muted-foreground">
              Your cross-chain bridges will appear here
            </p>
          </div>
        )}

        {/* Popular Bridges */}
        <div className="mt-6 p-4 rounded-lg border border-border bg-card">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Popular Bridge Protocols
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="justify-start">
              Arbitrum Bridge
            </Button>
            <Button size="sm" variant="outline" className="justify-start">
              Optimism Bridge
            </Button>
            <Button size="sm" variant="outline" className="justify-start">
              Polygon Bridge
            </Button>
            <Button size="sm" variant="outline" className="justify-start">
              Base Bridge
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">⚠️ Bridge Safety Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Always verify the official bridge URL</li>
            <li>• Double-check destination chain and amount</li>
            <li>• Be patient - bridges can take 10-30 minutes</li>
            <li>• Keep transaction hashes for tracking</li>
            <li>• Use official bridges for large amounts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

