'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, 
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  Zap,
  ArrowRight,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { useState } from 'react';

interface Transaction {
  id: string;
  type: 'transfer' | 'swap' | 'approve' | 'revoke' | 'stake' | 'custom';
  to: string;
  value: string;
  token: string;
  data?: string;
  gasEstimate: number;
  status: 'pending' | 'executing' | 'success' | 'failed';
  txHash?: string;
  error?: string;
}

interface BatchExecution {
  id: string;
  name: string;
  transactions: Transaction[];
  createdAt: Date;
  status: 'draft' | 'executing' | 'completed' | 'failed';
  totalGas: number;
  successCount: number;
  failedCount: number;
}

interface BatchTransactionExecutorProps {
  walletAddress: string;
}

export function BatchTransactionExecutor({ walletAddress }: BatchTransactionExecutorProps) {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  // Mock transactions
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'approve',
      to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      value: '1000',
      token: 'USDC',
      gasEstimate: 45000,
      status: 'pending',
    },
    {
      id: '2',
      type: 'swap',
      to: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      value: '1',
      token: 'ETH',
      gasEstimate: 180000,
      status: 'pending',
    },
    {
      id: '3',
      type: 'transfer',
      to: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      value: '500',
      token: 'USDC',
      gasEstimate: 21000,
      status: 'pending',
    },
    {
      id: '4',
      type: 'stake',
      to: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
      value: '100',
      token: 'UNI',
      gasEstimate: 125000,
      status: 'pending',
    },
  ];

  // Mock batch executions
  const batches: BatchExecution[] = [
    {
      id: '1',
      name: 'Monthly DeFi Operations',
      transactions: [
        { ...transactions[0], status: 'success', txHash: '0xabc...' },
        { ...transactions[1], status: 'success', txHash: '0xdef...' },
        { ...transactions[2], status: 'success', txHash: '0xghi...' },
      ],
      createdAt: new Date(Date.now() - 86400000 * 5),
      status: 'completed',
      totalGas: 246000,
      successCount: 3,
      failedCount: 0,
    },
    {
      id: '2',
      name: 'Portfolio Rebalancing',
      transactions: [
        { ...transactions[0], status: 'success', txHash: '0xjkl...' },
        { ...transactions[1], status: 'failed', error: 'Insufficient funds' },
      ],
      createdAt: new Date(Date.now() - 86400000 * 12),
      status: 'failed',
      totalGas: 225000,
      successCount: 1,
      failedCount: 1,
    },
  ];

  const totalGasEstimate = transactions.reduce((sum, tx) => sum + tx.gasEstimate, 0);
  const estimatedCost = (totalGasEstimate * 30) / 1e9; // Assuming 30 Gwei gas price
  const completedBatches = batches.filter(b => b.status === 'completed').length;
  const totalTransactions = batches.reduce((sum, b) => sum + b.transactions.length, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatGas = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case 'executing':
        return <Badge variant="info" className="gap-1">
          <Zap className="h-3 w-3 animate-pulse" />
          Executing
        </Badge>;
      case 'success':
        return <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Success
        </Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>;
      case 'completed':
        return <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return '💸';
      case 'swap':
        return '🔄';
      case 'approve':
        return '✅';
      case 'revoke':
        return '❌';
      case 'stake':
        return '💎';
      case 'custom':
        return '⚙️';
      default:
        return '📝';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Batch Transaction Executor
            </CardTitle>
            <CardDescription>
              Execute multiple transactions in one go
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{transactions.length}</p>
            <p className="text-xs text-muted-foreground">Queued</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(estimatedCost)}</p>
            <p className="text-xs text-muted-foreground">Est. Gas Cost</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-600">{completedBatches}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{totalTransactions}</p>
            <p className="text-xs text-muted-foreground">Total Txs</p>
          </div>
        </div>

        {/* Current Batch */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Current Batch</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Transactions Queue */}
          <div className="space-y-2 mb-4">
            {transactions.map((tx, index) => (
              <div
                key={tx.id}
                className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{getTypeIcon(tx.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-sm capitalize">{tx.type}</h5>
                        {getStatusBadge(tx.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{tx.value} {tx.token}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{formatAddress(tx.to)}</span>
                        <span>•</span>
                        <span>Gas: {formatGas(tx.gasEstimate)}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">No Transactions</p>
              <p className="text-xs text-muted-foreground mb-4">
                Add transactions to create a batch
              </p>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          )}

          {/* Batch Summary */}
          {transactions.length > 0 && (
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 mb-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold">Batch Summary</h5>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="font-bold">{transactions.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Gas</p>
                  <p className="font-bold">{formatGas(totalGasEstimate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Est. Cost</p>
                  <p className="font-bold text-primary">{formatCurrency(estimatedCost)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Execute Button */}
          {transactions.length > 0 && (
            <div className="flex gap-2">
              <Button className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Execute Batch ({transactions.length} txs)
              </Button>
              <Button variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Simulate
              </Button>
            </div>
          )}
        </div>

        {/* Previous Batches */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Previous Batches</h4>
          {batches.map((batch) => (
            <div
              key={batch.id}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                batch.status === 'completed'
                  ? 'border-green-500/30 bg-green-500/5'
                  : batch.status === 'failed'
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setSelectedBatch(batch.id)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold">{batch.name}</h5>
                    {getStatusBadge(batch.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Transactions</p>
                      <p className="text-sm font-bold">{batch.transactions.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Success</p>
                      <p className="text-sm font-bold text-green-600">{batch.successCount}</p>
                    </div>
                    {batch.failedCount > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Failed</p>
                        <p className="text-sm font-bold text-red-600">{batch.failedCount}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Gas Used</p>
                      <p className="text-sm font-bold">{formatGas(batch.totalGas)}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Executed {formatTimeAgo(batch.createdAt)}
                  </p>
                </div>
              </div>

              {selectedBatch === batch.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  {batch.transactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span>{getTypeIcon(tx.type)}</span>
                        <span className="capitalize">{tx.type}</span>
                        {getStatusBadge(tx.status)}
                      </div>
                      {tx.txHash && (
                        <span className="font-mono">{tx.txHash}</span>
                      )}
                      {tx.error && (
                        <span className="text-red-600">{tx.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">⚡ Batch Execution Benefits</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Execute multiple transactions with one approval</li>
            <li>• Save time and reduce transaction management</li>
            <li>• Simulate batches before execution</li>
            <li>• Automatic retry on failures</li>
            <li>• Export and share batch configurations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

