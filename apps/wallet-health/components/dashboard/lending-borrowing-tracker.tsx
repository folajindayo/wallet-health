'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, 
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Percent,
  ExternalLink,
  RefreshCw,
  Shield
} from 'lucide-react';
import { useState } from 'react';

interface LendingPosition {
  id: string;
  protocol: string;
  type: 'lending' | 'borrowing';
  asset: string;
  amount: number;
  valueUSD: number;
  apy: number;
  collateral?: {
    asset: string;
    amount: number;
    valueUSD: number;
  };
  healthFactor?: number;
  liquidationPrice?: number;
  earnedInterest?: number;
  paidInterest?: number;
  logo: string;
}

interface LendingBorrowingTrackerProps {
  walletAddress: string;
  positions?: LendingPosition[];
}

export function LendingBorrowingTracker({ 
  walletAddress, 
  positions = [] 
}: LendingBorrowingTrackerProps) {
  const [filter, setFilter] = useState<'all' | 'lending' | 'borrowing'>('all');

  // Mock lending/borrowing positions
  const mockPositions: LendingPosition[] = [
    {
      id: '1',
      protocol: 'Aave',
      type: 'lending',
      asset: 'USDC',
      amount: 25000,
      valueUSD: 25000,
      apy: 4.2,
      earnedInterest: 875.50,
      logo: '👻',
    },
    {
      id: '2',
      protocol: 'Aave',
      type: 'borrowing',
      asset: 'DAI',
      amount: 10000,
      valueUSD: 10000,
      apy: 5.8,
      collateral: {
        asset: 'ETH',
        amount: 5.0,
        valueUSD: 17500,
      },
      healthFactor: 1.75,
      liquidationPrice: 2800,
      paidInterest: 290.00,
      logo: '👻',
    },
    {
      id: '3',
      protocol: 'Compound',
      type: 'lending',
      asset: 'ETH',
      amount: 3.5,
      valueUSD: 12250,
      apy: 2.8,
      earnedInterest: 342.00,
      logo: '🏛️',
    },
    {
      id: '4',
      protocol: 'Compound',
      type: 'borrowing',
      asset: 'USDT',
      amount: 5000,
      valueUSD: 5000,
      apy: 4.5,
      collateral: {
        asset: 'WBTC',
        amount: 0.15,
        valueUSD: 9000,
      },
      healthFactor: 1.80,
      liquidationPrice: 48000,
      paidInterest: 112.50,
      logo: '🏛️',
    },
    {
      id: '5',
      protocol: 'MakerDAO',
      type: 'borrowing',
      asset: 'DAI',
      amount: 8000,
      valueUSD: 8000,
      apy: 3.5,
      collateral: {
        asset: 'ETH',
        amount: 4.0,
        valueUSD: 14000,
      },
      healthFactor: 1.45,
      liquidationPrice: 3100,
      paidInterest: 140.00,
      logo: '🏦',
    },
  ];

  const displayPositions = positions.length > 0 ? positions : mockPositions;

  const filteredPositions = displayPositions.filter(position => {
    if (filter === 'all') return true;
    if (filter === 'lending') return position.type === 'lending';
    if (filter === 'borrowing') return position.type === 'borrowing';
    return true;
  });

  const lendingPositions = displayPositions.filter(p => p.type === 'lending');
  const borrowingPositions = displayPositions.filter(p => p.type === 'borrowing');

  const totalLent = lendingPositions.reduce((sum, p) => sum + p.valueUSD, 0);
  const totalBorrowed = borrowingPositions.reduce((sum, p) => sum + p.valueUSD, 0);
  const totalEarned = lendingPositions.reduce((sum, p) => sum + (p.earnedInterest || 0), 0);
  const totalPaid = borrowingPositions.reduce((sum, p) => sum + (p.paidInterest || 0), 0);
  const netEarnings = totalEarned - totalPaid;

  const atRiskPositions = borrowingPositions.filter(p => p.healthFactor && p.healthFactor < 1.5).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getHealthFactorBadge = (healthFactor: number) => {
    if (healthFactor >= 2.0) {
      return <Badge variant="secondary">Safe ({healthFactor.toFixed(2)})</Badge>;
    }
    if (healthFactor >= 1.5) {
      return <Badge variant="outline">Moderate ({healthFactor.toFixed(2)})</Badge>;
    }
    return <Badge variant="destructive">At Risk ({healthFactor.toFixed(2)})</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Lending & Borrowing Tracker
            </CardTitle>
            <CardDescription>
              Monitor your lending and borrowing positions across protocols
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5">
            <p className="text-xs text-muted-foreground mb-1">Total Lent</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalLent)}</p>
          </div>
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
            <p className="text-xs text-muted-foreground mb-1">Total Borrowed</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalBorrowed)}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Net Earnings</p>
            <p className={`text-xl font-bold ${netEarnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netEarnings)}
            </p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-xs text-muted-foreground mb-1">At Risk</p>
            <p className="text-xl font-bold text-yellow-600">{atRiskPositions}</p>
          </div>
        </div>

        {/* Warnings */}
        {atRiskPositions > 0 && (
          <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1 text-red-600">Liquidation Risk Alert</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {atRiskPositions} position{atRiskPositions !== 1 ? 's have' : ' has'} a health factor below 1.5.
                  Consider adding collateral or repaying debt to avoid liquidation.
                </p>
                <Button size="sm" variant="destructive">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Risk Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({displayPositions.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'lending' ? 'default' : 'outline'}
            onClick={() => setFilter('lending')}
          >
            Lending ({lendingPositions.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'borrowing' ? 'default' : 'outline'}
            onClick={() => setFilter('borrowing')}
          >
            Borrowing ({borrowingPositions.length})
          </Button>
        </div>

        {/* Positions List */}
        <div className="space-y-3">
          {filteredPositions.map((position) => (
            <div
              key={position.id}
              className={`p-4 rounded-lg border transition-colors ${
                position.healthFactor && position.healthFactor < 1.5
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-3xl">{position.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-semibold">{position.protocol}</h4>
                      <Badge variant={position.type === 'lending' ? 'secondary' : 'destructive'}>
                        {position.type === 'lending' ? 'Lending' : 'Borrowing'}
                      </Badge>
                      {position.healthFactor && getHealthFactorBadge(position.healthFactor)}
                    </div>

                    {/* Position Details */}
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground">
                        {position.type === 'lending' ? 'Supplied' : 'Borrowed'}
                      </p>
                      <p className="text-xl font-bold">
                        {position.amount.toFixed(2)} {position.asset}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ≈ {formatCurrency(position.valueUSD)}
                      </p>
                    </div>

                    {/* Collateral (for borrowing) */}
                    {position.collateral && (
                      <div className="mb-3 p-2 rounded bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Collateral</p>
                        <p className="text-sm font-semibold">
                          {position.collateral.amount} {position.collateral.asset}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ≈ {formatCurrency(position.collateral.valueUSD)}
                        </p>
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">APY</p>
                        <div className="flex items-center gap-1">
                          {position.type === 'lending' ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <p className={`text-sm font-bold ${
                            position.type === 'lending' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {position.apy}%
                          </p>
                        </div>
                      </div>
                      {position.earnedInterest !== undefined && (
                        <div>
                          <p className="text-xs text-muted-foreground">Earned</p>
                          <p className="text-sm font-bold text-green-600">
                            {formatCurrency(position.earnedInterest)}
                          </p>
                        </div>
                      )}
                      {position.paidInterest !== undefined && (
                        <div>
                          <p className="text-xs text-muted-foreground">Paid</p>
                          <p className="text-sm font-bold text-red-600">
                            {formatCurrency(position.paidInterest)}
                          </p>
                        </div>
                      )}
                      {position.liquidationPrice && (
                        <div>
                          <p className="text-xs text-muted-foreground">Liq. Price</p>
                          <p className="text-sm font-bold">
                            ${position.liquidationPrice.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`https://app.aave.com`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {position.type === 'lending' ? (
                  <>
                    <Button size="sm" variant="outline">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Supply More
                    </Button>
                    <Button size="sm" variant="outline">
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Add Collateral
                    </Button>
                    <Button size="sm" variant="outline">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Repay
                    </Button>
                    <Button size="sm" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Borrow More
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPositions.length === 0 && (
          <div className="text-center py-8">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Positions Found</p>
            <p className="text-xs text-muted-foreground mb-3">
              Start lending or borrowing to earn or leverage assets
            </p>
            <Button size="sm">
              Explore Protocols
            </Button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">💡 DeFi Lending Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Maintain health factor above 2.0 for safety</li>
            <li>• Set up price alerts for liquidation risk</li>
            <li>• Diversify collateral across multiple assets</li>
            <li>• Monitor APY changes regularly</li>
            <li>• Consider using stablecoins for lower volatility</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

