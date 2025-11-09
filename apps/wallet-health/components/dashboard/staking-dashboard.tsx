'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  TrendingUp,
  Lock,
  Unlock,
  ExternalLink,
  Plus,
  Minus,
  Calculator
} from 'lucide-react';
import { useState } from 'react';

interface StakingPosition {
  id: string;
  protocol: string;
  token: string;
  staked: number;
  value: number;
  apr: number;
  earned: number;
  earnedValue: number;
  lockPeriod?: number; // in days
  unlockDate?: Date;
  isLocked: boolean;
  autoCompound: boolean;
  logo: string;
}

interface StakingDashboardProps {
  walletAddress: string;
  positions?: StakingPosition[];
}

export function StakingDashboard({ walletAddress, positions = [] }: StakingDashboardProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  // Mock staking positions
  const mockPositions: StakingPosition[] = [
    {
      id: '1',
      protocol: 'Lido',
      token: 'ETH',
      staked: 5.25,
      value: 18500,
      apr: 3.8,
      earned: 0.0421,
      earnedValue: 148.35,
      isLocked: false,
      autoCompound: true,
      logo: '🏖️',
    },
    {
      id: '2',
      protocol: 'Aave',
      token: 'AAVE',
      staked: 125,
      value: 12500,
      apr: 7.2,
      earned: 8.45,
      earnedValue: 845.00,
      isLocked: false,
      autoCompound: true,
      logo: '👻',
    },
    {
      id: '3',
      protocol: 'Rocket Pool',
      token: 'ETH',
      staked: 16.0,
      value: 56320,
      apr: 4.1,
      earned: 0.145,
      earnedValue: 510.50,
      isLocked: false,
      autoCompound: false,
      logo: '🚀',
    },
    {
      id: '4',
      protocol: 'Curve',
      token: 'CRV',
      staked: 5000,
      value: 4250,
      apr: 12.5,
      earned: 125.5,
      earnedValue: 106.675,
      lockPeriod: 365,
      unlockDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isLocked: true,
      autoCompound: false,
      logo: '🌊',
    },
  ];

  const displayPositions = positions.length > 0 ? positions : mockPositions;

  const totalStaked = displayPositions.reduce((sum, p) => sum + p.value, 0);
  const totalEarned = displayPositions.reduce((sum, p) => sum + p.earnedValue, 0);
  const avgAPR = displayPositions.reduce((sum, p) => sum + p.apr, 0) / displayPositions.length;
  const activePositions = displayPositions.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDaysUntilUnlock = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Unlocked';
    if (days === 0) return 'Today';
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Staking Dashboard
        </CardTitle>
        <CardDescription>
          Manage your staking positions across protocols
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Total Staked</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalStaked)}</p>
          </div>
          <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
            <p className="text-xs text-muted-foreground mb-1">Total Earned</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEarned)}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Avg APR</p>
            <p className="text-2xl font-bold">{avgAPR.toFixed(2)}%</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Active Positions</p>
            <p className="text-2xl font-bold">{activePositions}</p>
          </div>
        </div>

        {/* Earnings Projection */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Calculator className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">Projected Annual Earnings</h4>
              <p className="text-2xl font-bold text-primary mb-2">
                {formatCurrency(totalStaked * (avgAPR / 100))}
              </p>
              <p className="text-xs text-muted-foreground">
                Based on current APRs and staked amounts
              </p>
            </div>
          </div>
        </div>

        {/* Staking Positions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Your Staking Positions</h4>
          {displayPositions.map((position) => (
            <div
              key={position.id}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-3xl">{position.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{position.protocol}</h4>
                      {position.isLocked ? (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Locked
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Unlock className="h-3 w-3" />
                          Flexible
                        </Badge>
                      )}
                      {position.autoCompound && (
                        <Badge variant="outline">Auto-Compound</Badge>
                      )}
                    </div>

                    {/* Staked Amount */}
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground">Staked</p>
                      <p className="text-xl font-bold">
                        {position.staked} {position.token}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ≈ {formatCurrency(position.value)}
                      </p>
                    </div>

                    {/* Earned */}
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground">Rewards Earned</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-green-600">
                          {position.earned} {position.token}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ≈ {formatCurrency(position.earnedValue)}
                        </p>
                      </div>
                    </div>

                    {/* APR */}
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">APR</p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <p className="text-lg font-bold text-green-600">
                            {position.apr}%
                          </p>
                        </div>
                      </div>
                      {position.unlockDate && (
                        <div>
                          <p className="text-xs text-muted-foreground">Unlocks In</p>
                          <p className="text-sm font-medium">
                            {formatDaysUntilUnlock(position.unlockDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Stake More
                </Button>
                {!position.isLocked && (
                  <Button size="sm" variant="outline">
                    <Minus className="h-4 w-4 mr-2" />
                    Unstake
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Coins className="h-4 w-4 mr-2" />
                  Claim Rewards
                </Button>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {displayPositions.length === 0 && (
          <div className="text-center py-8">
            <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Staking Positions</p>
            <p className="text-xs text-muted-foreground mb-3">
              Start staking to earn passive income
            </p>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Explore Staking Options
            </Button>
          </div>
        )}

        {/* Popular Staking Protocols */}
        <div className="mt-6 p-4 rounded-lg border border-border bg-card">
          <h4 className="text-sm font-semibold mb-3">Popular Staking Protocols</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="justify-start">
              🏖️ Lido (3.8% APR)
            </Button>
            <Button size="sm" variant="outline" className="justify-start">
              🚀 Rocket Pool (4.1% APR)
            </Button>
            <Button size="sm" variant="outline" className="justify-start">
              👻 Aave (7.2% APR)
            </Button>
            <Button size="sm" variant="outline" className="justify-start">
              🌊 Curve (12.5% APR)
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">💡 Staking Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Diversify across multiple protocols to reduce risk</li>
            <li>• Consider lock-up periods before staking</li>
            <li>• Enable auto-compound for maximum returns</li>
            <li>• Monitor APRs as they can change</li>
            <li>• Keep some liquid assets for emergencies</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

