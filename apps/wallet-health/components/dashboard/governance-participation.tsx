'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Vote, 
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  ExternalLink,
  Bell,
  Award
} from 'lucide-react';
import { useState } from 'react';

interface Proposal {
  id: string;
  protocol: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'failed' | 'queued' | 'executed';
  votingPower: number;
  yourVote?: 'for' | 'against' | 'abstain';
  forVotes: number;
  againstVotes: number;
  quorum: number;
  endsAt: Date;
  startedAt: Date;
  category: string;
  logo: string;
}

interface GovernanceStats {
  totalProtocols: number;
  totalVotingPower: number;
  proposalsVoted: number;
  participationRate: number;
}

interface GovernanceParticipationProps {
  walletAddress: string;
  proposals?: Proposal[];
}

export function GovernanceParticipation({ 
  walletAddress, 
  proposals = [] 
}: GovernanceParticipationProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'voted'>('all');

  // Mock governance data
  const mockProposals: Proposal[] = [
    {
      id: '1',
      protocol: 'Uniswap',
      title: 'UNI Proposal: Deploy Uniswap V3 on Base',
      description: 'This proposal seeks to deploy Uniswap V3 on Base network to expand liquidity options',
      status: 'active',
      votingPower: 15000,
      forVotes: 6500000,
      againstVotes: 1200000,
      quorum: 4000000,
      endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      category: 'Deployment',
      logo: '🦄',
    },
    {
      id: '2',
      protocol: 'Compound',
      title: 'COMP-145: Increase USDC Collateral Factor',
      description: 'Proposal to increase USDC collateral factor from 83% to 85%',
      status: 'active',
      votingPower: 8500,
      yourVote: 'for',
      forVotes: 450000,
      againstVotes: 125000,
      quorum: 400000,
      endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      category: 'Risk Parameters',
      logo: '🏛️',
    },
    {
      id: '3',
      protocol: 'Aave',
      title: 'AIP-89: Enable wstETH as Collateral',
      description: 'Enable Lido\'s wstETH as collateral on Aave V3',
      status: 'passed',
      votingPower: 12000,
      yourVote: 'for',
      forVotes: 850000,
      againstVotes: 50000,
      quorum: 500000,
      endsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      category: 'Asset Listing',
      logo: '👻',
    },
    {
      id: '4',
      protocol: 'MakerDAO',
      title: 'MIP-234: Adjust DAI Savings Rate',
      description: 'Adjust the DAI Savings Rate from 5% to 4.5%',
      status: 'executed',
      votingPower: 5000,
      yourVote: 'against',
      forVotes: 320000,
      againstVotes: 180000,
      quorum: 200000,
      endsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      category: 'Monetary Policy',
      logo: '🏦',
    },
    {
      id: '5',
      protocol: 'Curve',
      title: 'CIP-112: Add New Gauge for USDC/USDT Pool',
      description: 'Add voting gauge for the new USDC/USDT stable pool',
      status: 'active',
      votingPower: 25000,
      forVotes: 1200000,
      againstVotes: 300000,
      quorum: 800000,
      endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      category: 'Gauge Addition',
      logo: '🌊',
    },
  ];

  const displayProposals = proposals.length > 0 ? proposals : mockProposals;

  const filteredProposals = displayProposals.filter(proposal => {
    if (filter === 'all') return true;
    if (filter === 'active') return proposal.status === 'active';
    if (filter === 'voted') return proposal.yourVote !== undefined;
    return true;
  });

  const activeProposals = displayProposals.filter(p => p.status === 'active').length;
  const votedProposals = displayProposals.filter(p => p.yourVote !== undefined).length;
  const totalVotingPower = displayProposals.reduce((sum, p) => sum + p.votingPower, 0);
  const participationRate = (votedProposals / displayProposals.length) * 100;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  const formatTimeLeft = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diff < 0) return 'Ended';
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary">Active</Badge>;
      case 'passed':
        return <Badge variant="default">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'queued':
        return <Badge variant="outline">Queued</Badge>;
      case 'executed':
        return <Badge variant="outline">Executed</Badge>;
      default:
        return null;
    }
  };

  const getVoteBadge = (vote: string | undefined) => {
    if (!vote) return null;
    switch (vote) {
      case 'for':
        return <Badge variant="secondary">Voted For</Badge>;
      case 'against':
        return <Badge variant="destructive">Voted Against</Badge>;
      case 'abstain':
        return <Badge variant="outline">Abstained</Badge>;
      default:
        return null;
    }
  };

  const calculateVotePercentage = (forVotes: number, againstVotes: number) => {
    const total = forVotes + againstVotes;
    if (total === 0) return { for: 0, against: 0 };
    return {
      for: (forVotes / total) * 100,
      against: (againstVotes / total) * 100,
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Governance Participation
            </CardTitle>
            <CardDescription>
              Track and participate in protocol governance
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Set Alerts
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Governance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Active Proposals</p>
            <p className="text-2xl font-bold">{activeProposals}</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
            <p className="text-xs text-muted-foreground mb-1">Voting Power</p>
            <p className="text-2xl font-bold text-primary">{formatNumber(totalVotingPower)}</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5">
            <p className="text-xs text-muted-foreground mb-1">Voted</p>
            <p className="text-2xl font-bold text-green-600">{votedProposals}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Participation</p>
            <p className="text-2xl font-bold">{participationRate.toFixed(0)}%</p>
          </div>
        </div>

        {/* Participation Badge */}
        {participationRate >= 75 && (
          <div className="mb-6 p-4 rounded-lg border border-green-500/30 bg-green-500/5">
            <div className="flex items-start gap-2">
              <Award className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Active Governance Participant! 🎉</h4>
                <p className="text-xs text-muted-foreground">
                  You've voted on {participationRate.toFixed(0)}% of proposals. Keep up the great work!
                </p>
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
            All ({displayProposals.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
          >
            Active ({activeProposals})
          </Button>
          <Button
            size="sm"
            variant={filter === 'voted' ? 'default' : 'outline'}
            onClick={() => setFilter('voted')}
          >
            Voted ({votedProposals})
          </Button>
        </div>

        {/* Proposals List */}
        <div className="space-y-3">
          {filteredProposals.map((proposal) => {
            const votePercentages = calculateVotePercentage(proposal.forVotes, proposal.againstVotes);
            const quorumReached = proposal.forVotes >= proposal.quorum;

            return (
              <div
                key={proposal.id}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{proposal.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{proposal.title}</h4>
                      {getStatusBadge(proposal.status)}
                      {getVoteBadge(proposal.yourVote)}
                      <Badge variant="outline">{proposal.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {proposal.protocol} • {proposal.description}
                    </p>

                    {/* Voting Stats */}
                    <div className="space-y-2 mb-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-green-600 font-medium">
                            For: {formatNumber(proposal.forVotes)} ({votePercentages.for.toFixed(1)}%)
                          </span>
                          <span className="text-red-600 font-medium">
                            Against: {formatNumber(proposal.againstVotes)} ({votePercentages.against.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                          <div
                            className="bg-green-500"
                            style={{ width: `${votePercentages.for}%` }}
                          />
                          <div
                            className="bg-red-500"
                            style={{ width: `${votePercentages.against}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Quorum: {formatNumber(proposal.quorum)}</span>
                          {quorumReached && (
                            <CheckCircle2 className="h-3 w-3 text-green-500 ml-1" />
                          )}
                        </div>
                        {proposal.status === 'active' && (
                          <div className="flex items-center gap-1 text-primary">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeLeft(proposal.endsAt)}</span>
                          </div>
                        )}
                      </div>

                      {proposal.votingPower > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Your voting power: <span className="font-bold text-primary">{formatNumber(proposal.votingPower)}</span>
                        </p>
                      )}
                    </div>

                    {/* Voting Actions */}
                    {proposal.status === 'active' && !proposal.yourVote && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Vote For
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Vote Against
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProposals.length === 0 && (
          <div className="text-center py-8">
            <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Proposals Found</p>
            <p className="text-xs text-muted-foreground">
              Check back later for new governance proposals
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🗳️ Governance Benefits</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Shape the future of your favorite protocols</li>
            <li>• Earn governance tokens for participation</li>
            <li>• Protect your investment interests</li>
            <li>• Build reputation in the community</li>
            <li>• Access exclusive governance forums</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

