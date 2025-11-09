'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Gift,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  Star,
  Target,
  Zap,
  RefreshCw,
  Bell
} from 'lucide-react';
import { useState } from 'react';

interface AirdropEligibility {
  id: string;
  protocol: string;
  logo: string;
  status: 'eligible' | 'ineligible' | 'pending' | 'claimed';
  eligibilityScore: number; // 0-100
  estimatedValue: number;
  claimDeadline?: Date;
  requirements: {
    name: string;
    met: boolean;
    description: string;
  }[];
  actions?: {
    label: string;
    url: string;
  }[];
  category: 'defi' | 'nft' | 'gaming' | 'social' | 'infrastructure';
}

interface AirdropEligibilityCheckerProps {
  walletAddress: string;
}

export function AirdropEligibilityChecker({ walletAddress }: AirdropEligibilityCheckerProps) {
  const [filter, setFilter] = useState<'all' | 'eligible' | 'pending' | 'claimed'>('all');
  const [sortBy, setSortBy] = useState<'value' | 'deadline' | 'score'>('value');

  // Mock airdrop data
  const airdrops: AirdropEligibility[] = [
    {
      id: '1',
      protocol: 'zkSync Era',
      logo: '🔷',
      status: 'eligible',
      eligibilityScore: 85,
      estimatedValue: 1250,
      claimDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      category: 'infrastructure',
      requirements: [
        { name: 'Bridge Activity', met: true, description: 'Made 10+ bridge transactions' },
        { name: 'DeFi Interaction', met: true, description: 'Used at least 3 protocols' },
        { name: 'Volume Threshold', met: true, description: 'Traded $5,000+ total volume' },
        { name: 'Early Adopter', met: false, description: 'Used testnet before launch' },
      ],
      actions: [
        { label: 'Check Eligibility', url: '#' },
        { label: 'Claim Airdrop', url: '#' },
      ],
    },
    {
      id: '2',
      protocol: 'LayerZero',
      logo: '🌐',
      status: 'pending',
      eligibilityScore: 65,
      estimatedValue: 850,
      claimDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      category: 'infrastructure',
      requirements: [
        { name: 'Cross-Chain Activity', met: true, description: '5+ cross-chain transactions' },
        { name: 'Unique Chains', met: true, description: 'Used 4+ different chains' },
        { name: 'Protocol Usage', met: false, description: 'Interacted with 10+ protocols' },
        { name: 'NFT Transfers', met: true, description: 'Transferred NFTs cross-chain' },
      ],
      actions: [
        { label: 'Increase Score', url: '#' },
      ],
    },
    {
      id: '3',
      protocol: 'Starknet',
      logo: '⭐',
      status: 'claimed',
      eligibilityScore: 100,
      estimatedValue: 2100,
      category: 'infrastructure',
      requirements: [
        { name: 'Wallet Setup', met: true, description: 'Deployed Starknet wallet' },
        { name: 'Transaction Volume', met: true, description: 'Made 20+ transactions' },
        { name: 'DApp Interaction', met: true, description: 'Used 5+ dApps' },
        { name: 'Liquidity Provider', met: true, description: 'Provided liquidity' },
      ],
    },
    {
      id: '4',
      protocol: 'Blast',
      logo: '💥',
      status: 'eligible',
      eligibilityScore: 92,
      estimatedValue: 1680,
      claimDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      category: 'infrastructure',
      requirements: [
        { name: 'Bridge Deposit', met: true, description: 'Bridged ETH to Blast' },
        { name: 'Points Earned', met: true, description: 'Earned 1000+ points' },
        { name: 'Referrals', met: true, description: 'Referred 3+ users' },
        { name: 'Gold Status', met: true, description: 'Achieved Gold tier' },
      ],
      actions: [
        { label: 'Claim Tokens', url: '#' },
      ],
    },
    {
      id: '5',
      protocol: 'Arbitrum Orbit',
      logo: '🔵',
      status: 'ineligible',
      eligibilityScore: 25,
      estimatedValue: 0,
      category: 'infrastructure',
      requirements: [
        { name: 'Orbit Chain Usage', met: false, description: 'Use Orbit-powered chains' },
        { name: 'Volume Requirement', met: false, description: '$10,000+ transaction volume' },
        { name: 'Developer Activity', met: false, description: 'Deploy a contract' },
        { name: 'Community Member', met: true, description: 'Joined governance' },
      ],
    },
    {
      id: '6',
      protocol: 'Scroll',
      logo: '📜',
      status: 'pending',
      eligibilityScore: 78,
      estimatedValue: 950,
      claimDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      category: 'infrastructure',
      requirements: [
        { name: 'Bridge Activity', met: true, description: '15+ bridge transactions' },
        { name: 'NFT Minting', met: true, description: 'Minted NFTs on Scroll' },
        { name: 'DeFi Activity', met: true, description: 'Used 4+ DeFi protocols' },
        { name: 'Early User', met: false, description: 'Used alpha/beta testnet' },
      ],
    },
  ];

  // Calculate statistics
  const stats = {
    totalEligible: airdrops.filter(a => a.status === 'eligible').length,
    potentialValue: airdrops.filter(a => a.status === 'eligible').reduce((sum, a) => sum + a.estimatedValue, 0),
    claimed: airdrops.filter(a => a.status === 'claimed').length,
    claimedValue: airdrops.filter(a => a.status === 'claimed').reduce((sum, a) => sum + a.estimatedValue, 0),
    pending: airdrops.filter(a => a.status === 'pending').length,
  };

  const getStatusBadge = (status: string) => {
    const config = {
      eligible: { variant: 'secondary' as const, icon: CheckCircle2, label: 'Eligible', color: 'text-emerald-500' },
      ineligible: { variant: 'outline' as const, icon: XCircle, label: 'Not Eligible', color: 'text-muted-foreground' },
      pending: { variant: 'default' as const, icon: Clock, label: 'Pending', color: 'text-amber-500' },
      claimed: { variant: 'outline' as const, icon: CheckCircle2, label: 'Claimed', color: 'text-blue-500' },
    };

    const { variant, icon: Icon, label, color } = config[status as keyof typeof config];
    
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className={`h-3 w-3 ${color}`} />
        {label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      defi: 'bg-blue-500/10 text-blue-500',
      nft: 'bg-purple-500/10 text-purple-500',
      gaming: 'bg-pink-500/10 text-pink-500',
      social: 'bg-green-500/10 text-green-500',
      infrastructure: 'bg-orange-500/10 text-orange-500',
    };

    return (
      <Badge variant="outline" className={colors[category as keyof typeof colors]}>
        {category.toUpperCase()}
      </Badge>
    );
  };

  const filteredAirdrops = airdrops
    .filter(a => filter === 'all' || a.status === filter)
    .sort((a, b) => {
      if (sortBy === 'value') return b.estimatedValue - a.estimatedValue;
      if (sortBy === 'score') return b.eligibilityScore - a.eligibilityScore;
      if (sortBy === 'deadline' && a.claimDeadline && b.claimDeadline) {
        return a.claimDeadline.getTime() - b.claimDeadline.getTime();
      }
      return 0;
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Airdrop Eligibility Checker
            </CardTitle>
            <CardDescription>
              Track and claim your eligible airdrops
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-border bg-emerald-500/10">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs">Eligible</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalEligible}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ${stats.potentialValue.toLocaleString()} value
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-blue-500/10">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Star className="h-4 w-4" />
              <span className="text-xs">Claimed</span>
            </div>
            <p className="text-2xl font-bold">{stats.claimed}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ${stats.claimedValue.toLocaleString()} received
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-amber-500/10">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Pending</span>
            </div>
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground mt-1">
              In progress
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-primary/10">
            <div className="flex items-center gap-2 text-primary mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total Value</span>
            </div>
            <p className="text-2xl font-bold">
              ${(stats.potentialValue + stats.claimedValue).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Potential + claimed
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === 'eligible' ? 'default' : 'outline'}
              onClick={() => setFilter('eligible')}
            >
              Eligible
            </Button>
            <Button
              size="sm"
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button
              size="sm"
              variant={filter === 'claimed' ? 'default' : 'outline'}
              onClick={() => setFilter('claimed')}
            >
              Claimed
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            <select
              className="text-xs bg-background border border-border rounded-md px-2 py-1"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="value">Value</option>
              <option value="score">Score</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
        </div>

        {/* Airdrop List */}
        <div className="space-y-4">
          {filteredAirdrops.map((airdrop) => (
            <div
              key={airdrop.id}
              className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{airdrop.logo}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{airdrop.protocol}</h4>
                      {getCategoryBadge(airdrop.category)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(airdrop.status)}
                      {airdrop.claimDeadline && (
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {Math.ceil((airdrop.claimDeadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000))}d left
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Estimated Value</p>
                  <p className="text-2xl font-bold text-primary">
                    ${airdrop.estimatedValue.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Eligibility Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Eligibility Score</span>
                  <span className="text-sm font-bold">{airdrop.eligibilityScore}/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      airdrop.eligibilityScore >= 80
                        ? 'bg-emerald-500'
                        : airdrop.eligibilityScore >= 50
                        ? 'bg-amber-500'
                        : 'bg-destructive'
                    }`}
                    style={{ width: `${airdrop.eligibilityScore}%` }}
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-4">
                <h5 className="text-sm font-semibold mb-2">Requirements:</h5>
                <div className="grid md:grid-cols-2 gap-2">
                  {airdrop.requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 p-2 rounded-md ${
                        req.met ? 'bg-emerald-500/10' : 'bg-muted'
                      }`}
                    >
                      {req.met ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs font-medium">{req.name}</p>
                        <p className="text-xs text-muted-foreground">{req.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {airdrop.actions && airdrop.actions.length > 0 && (
                <div className="flex gap-2">
                  {airdrop.actions.map((action, idx) => (
                    <Button key={idx} size="sm" variant={idx === 0 ? 'default' : 'outline'}>
                      {action.label}
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Farming Tips */}
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold mb-2">💡 Airdrop Farming Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use new protocols early to maximize eligibility</li>
                <li>• Bridge and interact across multiple chains</li>
                <li>• Maintain consistent weekly activity</li>
                <li>• Provide liquidity and participate in governance</li>
                <li>• Join testnet programs for higher allocations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">Upcoming Claim Deadlines</p>
              <p className="text-sm text-muted-foreground">
                You have {stats.totalEligible} eligible airdrops worth ${stats.potentialValue.toLocaleString()}.
                Make sure to claim before deadlines expire!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

