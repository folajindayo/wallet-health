'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Users, TrendingUp } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { getRiskLevelEmoji, getRiskLevelColor } from '@/lib/risk-scorer';
import { useState } from 'react';

interface WalletData {
  address: string;
  score: number;
  riskLevel: 'safe' | 'moderate' | 'critical';
  approvals: number;
  tokens: number;
  alerts: number;
}

interface WalletComparisonProps {
  currentWallet: WalletData;
}

export function WalletComparison({ currentWallet }: WalletComparisonProps) {
  const [wallets, setWallets] = useState<WalletData[]>([currentWallet]);
  const [newAddress, setNewAddress] = useState('');
  const [adding, setAdding] = useState(false);

  const addWallet = () => {
    if (!newAddress || wallets.length >= 4) return;
    
    // In production, fetch actual data
    // For now, simulate
    const mockWallet: WalletData = {
      address: newAddress,
      score: Math.floor(Math.random() * 100),
      riskLevel: ['safe', 'moderate', 'critical'][Math.floor(Math.random() * 3)] as any,
      approvals: Math.floor(Math.random() * 20),
      tokens: Math.floor(Math.random() * 50),
      alerts: Math.floor(Math.random() * 10),
    };

    setWallets([...wallets, mockWallet]);
    setNewAddress('');
    setAdding(false);
  };

  const removeWallet = (address: string) => {
    if (wallets.length <= 1) return;
    setWallets(wallets.filter(w => w.address !== address));
  };

  const bestScore = Math.max(...wallets.map(w => w.score));
  const avgScore = Math.round(wallets.reduce((sum, w) => sum + w.score, 0) / wallets.length);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Wallet Comparison
              <Badge variant="outline">{wallets.length}</Badge>
            </CardTitle>
            <CardDescription>
              Compare security scores across multiple wallets
            </CardDescription>
          </div>
          {wallets.length < 4 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAdding(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Wallet
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Add Wallet Form */}
        {adding && (
          <div className="mb-4 p-4 rounded-lg border border-border bg-muted/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter wallet address..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={addWallet} disabled={!newAddress}>
                Add
              </Button>
              <Button variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Best Score</span>
            </div>
            <p className="text-2xl font-bold text-primary">{bestScore}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Average Score</span>
            </div>
            <p className="text-2xl font-bold">{avgScore}</p>
          </div>
        </div>

        {/* Wallet Grid */}
        <div className="space-y-3">
          {wallets.map((wallet, index) => (
            <div
              key={wallet.address}
              className="p-4 rounded-lg border border-border bg-card relative"
            >
              {wallets.length > 1 && wallet.address !== currentWallet.address && (
                <button
                  onClick={() => removeWallet(wallet.address)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {formatAddress(wallet.address)}
                  </span>
                  {wallet.address === currentWallet.address && (
                    <Badge variant="secondary" className="text-xs">Current</Badge>
                  )}
                  {wallet.score === bestScore && (
                    <Badge variant="outline" className="text-xs">🏆 Best</Badge>
                  )}
                </div>
                <span className="text-2xl">{getRiskLevelEmoji(wallet.riskLevel)}</span>
              </div>

              {/* Score Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Security Score</span>
                  <span className={`text-sm font-bold ${getRiskLevelColor(wallet.riskLevel)}`}>
                    {wallet.score}/100
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      wallet.riskLevel === 'safe' ? 'bg-green-500' :
                      wallet.riskLevel === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${wallet.score}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Approvals</p>
                  <p className="font-semibold">{wallet.approvals}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tokens</p>
                  <p className="font-semibold">{wallet.tokens}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Alerts</p>
                  <p className="font-semibold text-destructive">{wallet.alerts}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {wallets.length === 1 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Add more wallets to compare security scores
          </div>
        )}
      </CardContent>
    </Card>
  );
}

