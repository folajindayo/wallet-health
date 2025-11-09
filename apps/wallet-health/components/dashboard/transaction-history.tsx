'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

interface Transaction {
  hash: string;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  successful: boolean;
  method?: string;
}

interface TransactionHistoryProps {
  walletAddress: string;
  chainId: number;
}

export function TransactionHistory({ walletAddress, chainId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getExplorerUrl = (hash: string) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      56: 'https://bscscan.com',
      137: 'https://polygonscan.com',
      8453: 'https://basescan.org',
      42161: 'https://arbiscan.io',
    };
    return `${explorers[chainId] || explorers[1]}/tx/${hash}`;
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/scan/transactions', {
        walletAddress,
        chainId,
        limit: 10,
      });

      if (response.data.success) {
        setTransactions(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, chainId]);

  const getTransactionType = (tx: Transaction) => {
    return tx.from.toLowerCase() === walletAddress.toLowerCase() ? 'sent' : 'received';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent wallet activity</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchTransactions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={fetchTransactions}
            >
              Try Again
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const type = getTransactionType(tx);
              const isSent = type === 'sent';

              return (
                <div
                  key={tx.hash}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Direction Icon */}
                    <div className={`p-2 rounded-full ${
                      isSent ? 'bg-red-500/10' : 'bg-green-500/10'
                    }`}>
                      {isSent ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      )}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{type}</span>
                        {tx.method && (
                          <Badge variant="outline" className="text-xs">
                            {tx.method}
                          </Badge>
                        )}
                        {!tx.successful && (
                          <Badge variant="destructive" className="text-xs">
                            Failed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{formatAddress(tx.hash)}</span>
                        <span>•</span>
                        <span>{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(getExplorerUrl(tx.hash), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

