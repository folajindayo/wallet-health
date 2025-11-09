'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  TrendingUp,
  Users,
  Lock,
  Shield,
  Calendar,
  DollarSign,
  Target,
  Clock,
  Star,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Flame,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  ChevronRight,
  Activity,
  Bell
} from 'lucide-react';
import { useState } from 'react';

interface TokenLaunch {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  description: string;
  website: string;
  status: 'upcoming' | 'live' | 'ended';
  category: string;
  chain: string;
  totalRaise: number;
  currentRaise: number;
  minContribution: number;
  maxContribution: number;
  price: number;
  launchDate: Date;
  endDate: Date;
  participants: number;
  vestingPeriod: string;
  isVerified: boolean;
  isAudited: boolean;
  riskScore: number;
  highlights: string[];
  socialStats: {
    twitter: number;
    discord: number;
    telegram: number;
  };
}

interface LaunchpadFilter {
  status: 'all' | 'upcoming' | 'live' | 'ended';
  category: 'all' | string;
  chain: 'all' | string;
}

interface TokenLaunchpadPlatformProps {
  walletAddress: string;
}

export function TokenLaunchpadPlatform({ walletAddress }: TokenLaunchpadPlatformProps) {
  const [filter, setFilter] = useState<LaunchpadFilter>({
    status: 'all',
    category: 'all',
    chain: 'all',
  });

  // Mock token launches
  const launches: TokenLaunch[] = [
    {
      id: '1',
      name: 'DeFi Protocol X',
      symbol: 'DPX',
      logo: '🏦',
      description: 'Next-gen lending protocol with AI-powered risk assessment',
      website: 'https://defiprotocolx.com',
      status: 'live',
      category: 'DeFi',
      chain: 'Ethereum',
      totalRaise: 2000000,
      currentRaise: 1450000,
      minContribution: 100,
      maxContribution: 10000,
      price: 0.5,
      launchDate: new Date(Date.now() - 86400000 * 2),
      endDate: new Date(Date.now() + 86400000 * 5),
      participants: 1247,
      vestingPeriod: '6 months linear',
      isVerified: true,
      isAudited: true,
      riskScore: 25,
      highlights: [
        'Audited by CertiK',
        'Team KYC verified',
        'Backed by top VCs',
        'Working product',
      ],
      socialStats: {
        twitter: 45000,
        discord: 12000,
        telegram: 8500,
      },
    },
    {
      id: '2',
      name: 'GameFi Arena',
      symbol: 'GFA',
      logo: '🎮',
      description: 'Play-to-earn gaming ecosystem with NFT integration',
      website: 'https://gamefiarena.io',
      status: 'upcoming',
      category: 'Gaming',
      chain: 'Polygon',
      totalRaise: 1500000,
      currentRaise: 0,
      minContribution: 50,
      maxContribution: 5000,
      price: 0.25,
      launchDate: new Date(Date.now() + 86400000 * 3),
      endDate: new Date(Date.now() + 86400000 * 10),
      participants: 0,
      vestingPeriod: '3 months cliff, 9 months linear',
      isVerified: true,
      isAudited: true,
      riskScore: 35,
      highlights: [
        'Beta version live',
        'Partnership with major gaming studios',
        '10K+ beta testers',
        'Token utility in game',
      ],
      socialStats: {
        twitter: 28000,
        discord: 15000,
        telegram: 6200,
      },
    },
    {
      id: '3',
      name: 'AI DataChain',
      symbol: 'AIDC',
      logo: '🤖',
      description: 'Decentralized AI training data marketplace',
      website: 'https://aidatachain.ai',
      status: 'live',
      category: 'AI',
      chain: 'Base',
      totalRaise: 3000000,
      currentRaise: 850000,
      minContribution: 200,
      maxContribution: 20000,
      price: 1.0,
      launchDate: new Date(Date.now() - 86400000 * 1),
      endDate: new Date(Date.now() + 86400000 * 6),
      participants: 423,
      vestingPeriod: '12 months linear',
      isVerified: true,
      isAudited: false,
      riskScore: 45,
      highlights: [
        'Innovative AI model',
        'Strategic partnerships',
        'Experienced team',
        'Patent pending tech',
      ],
      socialStats: {
        twitter: 18000,
        discord: 5000,
        telegram: 3500,
      },
    },
    {
      id: '4',
      name: 'GreenChain',
      symbol: 'GRC',
      logo: '🌱',
      description: 'Carbon credit trading platform on blockchain',
      website: 'https://greenchain.eco',
      status: 'ended',
      category: 'Climate',
      chain: 'Ethereum',
      totalRaise: 1000000,
      currentRaise: 1000000,
      minContribution: 100,
      maxContribution: 5000,
      price: 0.4,
      launchDate: new Date(Date.now() - 86400000 * 15),
      endDate: new Date(Date.now() - 86400000 * 8),
      participants: 2145,
      vestingPeriod: '4 months linear',
      isVerified: true,
      isAudited: true,
      riskScore: 20,
      highlights: [
        'Fully funded',
        'Government partnerships',
        'Carbon neutral operations',
        'Real-world impact',
      ],
      socialStats: {
        twitter: 32000,
        discord: 8000,
        telegram: 5500,
      },
    },
  ];

  const filteredLaunches = launches.filter((launch) => {
    if (filter.status !== 'all' && launch.status !== filter.status) return false;
    if (filter.category !== 'all' && launch.category !== filter.category) return false;
    if (filter.chain !== 'all' && launch.chain !== filter.chain) return false;
    return true;
  });

  const liveLaunches = launches.filter(l => l.status === 'live').length;
  const totalRaised = launches.reduce((sum, l) => sum + l.currentRaise, 0);
  const totalParticipants = launches.reduce((sum, l) => sum + l.participants, 0);
  const avgRiskScore = launches.reduce((sum, l) => sum + l.riskScore, 0) / launches.length;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getProgressPercentage = (current: number, total: number) => {
    return Math.min((current / total) * 100, 100);
  };

  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge variant="secondary" className="gap-1">
          <Activity className="h-3 w-3" />
          Live Now
        </Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Upcoming
        </Badge>;
      case 'ended':
        return <Badge variant="outline">Ended</Badge>;
      default:
        return null;
    }
  };

  const getRiskBadge = (score: number) => {
    if (score <= 30) {
      return <Badge variant="secondary">Low Risk</Badge>;
    } else if (score <= 60) {
      return <Badge variant="outline">Medium Risk</Badge>;
    } else {
      return <Badge variant="destructive">High Risk</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Token Launchpad Platform
            </CardTitle>
            <CardDescription>
              Discover and participate in verified token launches
            </CardDescription>
          </div>
          <Button size="sm">
            <Rocket className="h-4 w-4 mr-2" />
            Apply to Launch
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold text-primary">{liveLaunches}</p>
            </div>
            <p className="text-xs text-muted-foreground">Live Launches</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{formatCurrency(totalRaised)}</p>
            <p className="text-xs text-muted-foreground">Total Raised</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{formatNumber(totalParticipants)}</p>
            <p className="text-xs text-muted-foreground">Participants</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-500">{avgRiskScore.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Avg Risk Score</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Status</p>
            <div className="flex gap-2 flex-wrap">
              {['all', 'live', 'upcoming', 'ended'].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={filter.status === status ? 'default' : 'outline'}
                  onClick={() => setFilter({ ...filter, status: status as any })}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Category</p>
            <div className="flex gap-2 flex-wrap">
              {['all', 'DeFi', 'Gaming', 'AI', 'Climate'].map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={filter.category === category ? 'default' : 'outline'}
                  onClick={() => setFilter({ ...filter, category })}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Token Launches */}
        <div className="space-y-4 mb-6">
          {filteredLaunches.map((launch) => {
            const progress = getProgressPercentage(launch.currentRaise, launch.totalRaise);
            const isLive = launch.status === 'live';
            
            return (
              <div
                key={launch.id}
                className={`p-4 rounded-lg border transition-colors ${
                  isLive
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-4xl">{launch.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h5 className="font-bold text-lg">{launch.name}</h5>
                        <Badge variant="outline">{launch.symbol}</Badge>
                        {getStatusBadge(launch.status)}
                        {launch.isVerified && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        {launch.isAudited && (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Audited
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {launch.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Badge variant="outline">{launch.category}</Badge>
                        </span>
                        <span className="flex items-center gap-1">
                          <Badge variant="outline">{launch.chain}</Badge>
                        </span>
                        {getRiskBadge(launch.riskScore)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {launch.status !== 'ended' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-semibold">
                        {formatCurrency(launch.currentRaise)} / {formatCurrency(launch.totalRaise)}
                      </span>
                      <span className="text-muted-foreground">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-2 rounded bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <p className="text-sm font-bold">{formatCurrency(launch.price)}</p>
                  </div>
                  <div className="text-center p-2 rounded bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Participants</p>
                    <p className="text-sm font-bold">{formatNumber(launch.participants)}</p>
                  </div>
                  <div className="text-center p-2 rounded bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      {launch.status === 'upcoming' ? 'Starts' : launch.status === 'live' ? 'Ends' : 'Ended'}
                    </p>
                    <p className="text-sm font-bold">
                      {launch.status === 'upcoming'
                        ? getTimeUntil(launch.launchDate)
                        : launch.status === 'live'
                        ? getTimeUntil(launch.endDate)
                        : formatDate(launch.endDate)
                      }
                    </p>
                  </div>
                  <div className="text-center p-2 rounded bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Vesting</p>
                    <p className="text-sm font-bold">{launch.vestingPeriod.split(',')[0]}</p>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {launch.highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-xs"
                      >
                        <Star className="h-3 w-3 text-primary" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Stats */}
                <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {formatNumber(launch.socialStats.twitter)} Twitter
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {formatNumber(launch.socialStats.discord)} Discord
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {formatNumber(launch.socialStats.telegram)} Telegram
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {isLive && (
                    <Button size="sm" className="gap-1">
                      <Rocket className="h-4 w-4" />
                      Participate Now
                    </Button>
                  )}
                  {launch.status === 'upcoming' && (
                    <Button size="sm" variant="outline" className="gap-1">
                      <Bell className="h-4 w-4" />
                      Set Reminder
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🚀 Launchpad Benefits</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• All projects verified and KYC'd</li>
            <li>• Smart contract audits by reputable firms</li>
            <li>• Fair token distribution mechanisms</li>
            <li>• Transparent vesting schedules</li>
            <li>• Community governance participation</li>
            <li>• Early access to promising projects</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

