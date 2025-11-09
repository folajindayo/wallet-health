'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Eye, 
  Plus, 
  Trash2, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';

interface WatchedWallet {
  address: string;
  label: string;
  score: number;
  lastScore: number;
  lastChecked: Date;
  alerts: number;
  portfolioValue: number;
}

interface WalletWatchlistProps {
  onAddWallet?: (address: string, label: string) => void;
  onRemoveWallet?: (address: string) => void;
  onRefresh?: (address: string) => void;
}

export function WalletWatchlist({ 
  onAddWallet,
  onRemoveWallet,
  onRefresh 
}: WalletWatchlistProps) {
  const [wallets, setWallets] = useState<WatchedWallet[]>([
    {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      label: 'Main Wallet',
      score: 92,
      lastScore: 88,
      lastChecked: new Date(Date.now() - 3600000),
      alerts: 0,
      portfolioValue: 45230.50,
    },
    {
      address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      label: 'Trading Wallet',
      score: 75,
      lastScore: 78,
      lastChecked: new Date(Date.now() - 7200000),
      alerts: 2,
      portfolioValue: 12450.00,
    },
    {
      address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      label: 'Cold Storage',
      score: 98,
      lastScore: 98,
      lastChecked: new Date(Date.now() - 86400000),
      alerts: 0,
      portfolioValue: 125000.00,
    },
  ]);

  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newAddress && newLabel) {
      const newWallet: WatchedWallet = {
        address: newAddress,
        label: newLabel,
        score: 0,
        lastScore: 0,
        lastChecked: new Date(),
        alerts: 0,
        portfolioValue: 0,
      };
      setWallets([...wallets, newWallet]);
      onAddWallet?.(newAddress, newLabel);
      setNewAddress('');
      setNewLabel('');
      setIsAdding(false);
    }
  };

  const handleRemove = (address: string) => {
    setWallets(wallets.filter(w => w.address !== address));
    onRemoveWallet?.(address);
  };

  const handleRefresh = (address: string) => {
    onRefresh?.(address);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getScoreTrend = (wallet: WatchedWallet) => {
    const diff = wallet.score - wallet.lastScore;
    if (diff > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-3 w-3" />
          <span className="text-xs">+{diff}</span>
        </div>
      );
    }
    if (diff < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="h-3 w-3" />
          <span className="text-xs">{diff}</span>
        </div>
      );
    }
    return <span className="text-xs text-muted-foreground">—</span>;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="secondary">{score}</Badge>;
    if (score >= 60) return <Badge variant="outline">{score}</Badge>;
    return <Badge variant="destructive">{score}</Badge>;
  };

  const totalValue = wallets.reduce((sum, w) => sum + w.portfolioValue, 0);
  const avgScore = Math.round(wallets.reduce((sum, w) => sum + w.score, 0) / wallets.length);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Wallet Watchlist
            </CardTitle>
            <CardDescription>
              Monitor multiple wallets in one place
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Wallet
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Total Portfolio</p>
            <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Avg Security Score</p>
            <p className="text-xl font-bold">{avgScore}/100</p>
          </div>
        </div>

        {/* Add Wallet Form */}
        {isAdding && (
          <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
            <Input
              placeholder="Wallet Address (0x...)"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
            <Input
              placeholder="Label (e.g., 'My DeFi Wallet')"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} className="flex-1">
                Add to Watchlist
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Wallet List */}
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div
              key={wallet.address}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{wallet.label}</h4>
                    {getScoreBadge(wallet.score)}
                    {getScoreTrend(wallet)}
                    {wallet.alerts > 0 && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {wallet.alerts}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">
                    {formatAddress(wallet.address)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">
                        {formatCurrency(wallet.portfolioValue)}
                      </span>
                      {' '}value
                    </div>
                    <div>
                      Last checked: {formatTimestamp(wallet.lastChecked)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRefresh(wallet.address)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(wallet.address)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {wallets.length === 0 && (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No wallets in watchlist</p>
            <p className="text-xs text-muted-foreground">
              Add wallets to monitor their security and portfolio
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

