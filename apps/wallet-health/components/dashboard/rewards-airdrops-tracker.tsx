'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, 
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Clock,
  Star,
  Coins,
  Bell
} from 'lucide-react';
import { useState } from 'react';

interface Reward {
  id: string;
  protocol: string;
  type: 'airdrop' | 'staking' | 'liquidity' | 'governance' | 'referral';
  token: string;
  amount: number;
  valueUSD: number;
  status: 'claimable' | 'claimed' | 'upcoming' | 'expired';
  claimDeadline?: Date;
  claimedAt?: Date;
  requirements?: string[];
  claimUrl?: string;
}

interface RewardsAirdropsTrackerProps {
  walletAddress: string;
  rewards?: Reward[];
}

export function RewardsAirdropsTracker({ 
  walletAddress, 
  rewards = [] 
}: RewardsAirdropsTrackerProps) {
  const [filter, setFilter] = useState<'all' | 'claimable' | 'claimed'>('all');

  // Mock rewards data
  const mockRewards: Reward[] = [
    {
      id: '1',
      protocol: 'Uniswap',
      type: 'liquidity',
      token: 'UNI',
      amount: 125.5,
      valueUSD: 875.35,
      status: 'claimable',
      claimDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      requirements: ['Provide liquidity for 30 days'],
      claimUrl: 'https://app.uniswap.org/rewards',
    },
    {
      id: '2',
      protocol: 'Arbitrum',
      type: 'airdrop',
      token: 'ARB',
      amount: 1250,
      valueUSD: 2125.00,
      status: 'claimable',
      claimDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      requirements: ['Bridge to Arbitrum before snapshot'],
      claimUrl: 'https://arbitrum.foundation/claim',
    },
    {
      id: '3',
      protocol: 'Optimism',
      type: 'airdrop',
      token: 'OP',
      amount: 650,
      valueUSD: 1495.00,
      status: 'claimed',
      claimedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      requirements: ['Early user of Optimism'],
      claimUrl: 'https://app.optimism.io/airdrop',
    },
    {
      id: '4',
      protocol: 'Aave',
      type: 'staking',
      token: 'stkAAVE',
      amount: 45.2,
      valueUSD: 4520.00,
      status: 'claimable',
      requirements: ['Stake AAVE tokens'],
      claimUrl: 'https://app.aave.com/staking',
    },
    {
      id: '5',
      protocol: 'Compound',
      type: 'governance',
      token: 'COMP',
      amount: 12.8,
      valueUSD: 768.00,
      status: 'upcoming',
      claimDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      requirements: ['Participate in governance'],
      claimUrl: 'https://compound.finance/governance',
    },
  ];

  const displayRewards = rewards.length > 0 ? rewards : mockRewards;

  const filteredRewards = displayRewards.filter(reward => {
    if (filter === 'all') return true;
    if (filter === 'claimable') return reward.status === 'claimable';
    if (filter === 'claimed') return reward.status === 'claimed';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'claimable':
        return (
          <Badge variant="secondary" className="gap-1">
            <Gift className="h-3 w-3" />
            Claimable
          </Badge>
        );
      case 'claimed':
        return (
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Claimed
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Upcoming
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">Expired</Badge>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { label: string; variant: any }> = {
      airdrop: { label: 'Airdrop', variant: 'default' },
      staking: { label: 'Staking', variant: 'info' },
      liquidity: { label: 'Liquidity', variant: 'success' },
      governance: { label: 'Governance', variant: 'warning' },
      referral: { label: 'Referral', variant: 'outline' },
    };
    const style = styles[type] || { label: type, variant: 'outline' };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  const formatDeadline = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    return `${Math.floor(days / 30)} months`;
  };

  const stats = {
    total: displayRewards.length,
    claimable: displayRewards.filter(r => r.status === 'claimable').length,
    claimed: displayRewards.filter(r => r.status === 'claimed').length,
    totalClaimableValue: displayRewards
      .filter(r => r.status === 'claimable')
      .reduce((sum, r) => sum + r.valueUSD, 0),
    totalClaimedValue: displayRewards
      .filter(r => r.status === 'claimed')
      .reduce((sum, r) => sum + r.valueUSD, 0),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Rewards & Airdrops Tracker
            </CardTitle>
            <CardDescription>
              Track and claim your DeFi rewards and airdrops
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Set Alerts
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Rewards</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.claimable}</p>
            <p className="text-xs text-muted-foreground">Claimable</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-lg font-bold text-primary">
              ${stats.totalClaimableValue.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Unclaimed Value</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-lg font-bold">${stats.totalClaimedValue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Claimed Value</p>
          </div>
        </div>

        {/* Call to Action for Claimable */}
        {stats.claimable > 0 && (
          <div className="mb-6 p-4 rounded-lg border border-green-500/30 bg-green-500/5">
            <div className="flex items-start gap-3">
              <Gift className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">
                  You have {stats.claimable} reward{stats.claimable !== 1 ? 's' : ''} ready to claim!
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Total value: ${stats.totalClaimableValue.toFixed(2)} USD
                </p>
                <Button size="sm" variant="secondary">
                  <Coins className="h-4 w-4 mr-2" />
                  Claim All Rewards
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
            All ({stats.total})
          </Button>
          <Button
            size="sm"
            variant={filter === 'claimable' ? 'default' : 'outline'}
            onClick={() => setFilter('claimable')}
          >
            Claimable ({stats.claimable})
          </Button>
          <Button
            size="sm"
            variant={filter === 'claimed' ? 'default' : 'outline'}
            onClick={() => setFilter('claimed')}
          >
            Claimed ({stats.claimed})
          </Button>
        </div>

        {/* Rewards List */}
        <div className="space-y-3">
          {filteredRewards.map((reward) => (
            <div
              key={reward.id}
              className={`p-4 rounded-lg border transition-colors ${
                reward.status === 'claimable'
                  ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold">{reward.protocol}</h4>
                    {getTypeBadge(reward.type)}
                    {getStatusBadge(reward.status)}
                  </div>

                  {/* Amount */}
                  <div className="mb-2">
                    <p className="text-2xl font-bold text-primary">
                      {reward.amount.toFixed(2)} {reward.token}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ≈ ${reward.valueUSD.toFixed(2)} USD
                    </p>
                  </div>

                  {/* Requirements */}
                  {reward.requirements && reward.requirements.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {reward.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Deadline or Claimed Date */}
                  {reward.claimDeadline && reward.status === 'claimable' && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Claim by: {formatDeadline(reward.claimDeadline)}</span>
                    </div>
                  )}
                  {reward.claimedAt && reward.status === 'claimed' && (
                    <p className="text-xs text-muted-foreground">
                      Claimed {reward.claimedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>

                {reward.claimUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(reward.claimUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Claim Button */}
              {reward.status === 'claimable' && (
                <Button size="sm" variant="secondary" className="w-full">
                  <Gift className="h-4 w-4 mr-2" />
                  Claim {reward.amount.toFixed(2)} {reward.token}
                </Button>
              )}
            </div>
          ))}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              No rewards found
            </p>
            <p className="text-xs text-muted-foreground">
              Keep using DeFi protocols to earn rewards!
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Star className="h-4 w-4" />
            How to Maximize Rewards
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Participate in governance voting</li>
            <li>• Provide liquidity to earn trading fees</li>
            <li>• Stake tokens for protocol rewards</li>
            <li>• Be an early user of new protocols</li>
            <li>• Follow protocols on social media for announcements</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

