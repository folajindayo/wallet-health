'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Vote, 
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  BarChart3,
  Trophy,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ExternalLink,
  Bell,
  Filter,
  Calendar,
  Activity,
  Shield,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useState } from 'react';

interface GovernanceProposal {
  id: string;
  protocol: string;
  protocolLogo: string;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'rejected' | 'pending' | 'executed';
  category: 'treasury' | 'technical' | 'governance' | 'partnership' | 'other';
  startDate: Date;
  endDate: Date;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  totalVotingPower: number;
  yourVotingPower: number;
  yourVote?: 'for' | 'against' | 'abstain';
  ipfsLink?: string;
  discussionLink?: string;
}

interface VotingPower {
  protocol: string;
  token: string;
  balance: number;
  votingPower: number;
  delegatedTo?: string;
  delegatedFrom: number;
}

interface GovernanceVotingAggregatorProps {
  walletAddress: string;
}

export function GovernanceVotingAggregator({ walletAddress }: GovernanceVotingAggregatorProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | GovernanceProposal['status']>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | GovernanceProposal['category']>('all');

  // Mock voting power across protocols
  const votingPower: VotingPower[] = [
    {
      protocol: 'Uniswap',
      token: 'UNI',
      balance: 5000,
      votingPower: 5000,
      delegatedFrom: 2500,
    },
    {
      protocol: 'Compound',
      token: 'COMP',
      balance: 125,
      votingPower: 125,
      delegatedFrom: 0,
    },
    {
      protocol: 'Aave',
      token: 'AAVE',
      balance: 250,
      votingPower: 250,
      delegatedTo: '0x742d35Cc...',
    },
    {
      protocol: 'MakerDAO',
      token: 'MKR',
      balance: 8,
      votingPower: 8,
      delegatedFrom: 3,
    },
  ];

  // Mock governance proposals
  const proposals: GovernanceProposal[] = [
    {
      id: '1',
      protocol: 'Uniswap',
      protocolLogo: '🦄',
      title: 'Proposal to Deploy Uniswap v4 on Base Network',
      description: 'This proposal seeks to deploy Uniswap v4 on Base network to expand cross-chain liquidity and reduce gas costs for users.',
      proposer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      status: 'active',
      category: 'technical',
      startDate: new Date(Date.now() - 86400000 * 2),
      endDate: new Date(Date.now() + 86400000 * 5),
      votesFor: 12500000,
      votesAgainst: 850000,
      votesAbstain: 320000,
      quorum: 10000000,
      totalVotingPower: 50000000,
      yourVotingPower: 5000,
      ipfsLink: 'ipfs://QmX...',
      discussionLink: 'https://gov.uniswap.org/t/...',
    },
    {
      id: '2',
      protocol: 'Compound',
      protocolLogo: '🏦',
      title: 'Adjust cDAI Interest Rate Model',
      description: 'Proposal to update the DAI interest rate curve to better align with market conditions and optimize capital efficiency.',
      proposer: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      status: 'active',
      category: 'technical',
      startDate: new Date(Date.now() - 86400000 * 1),
      endDate: new Date(Date.now() + 86400000 * 6),
      votesFor: 450000,
      votesAgainst: 125000,
      votesAbstain: 25000,
      quorum: 400000,
      totalVotingPower: 2000000,
      yourVotingPower: 125,
      yourVote: 'for',
      ipfsLink: 'ipfs://QmY...',
      discussionLink: 'https://compound.finance/governance/...',
    },
    {
      id: '3',
      protocol: 'Aave',
      protocolLogo: '👻',
      title: 'Treasury Diversification Strategy',
      description: 'Allocate 10M from treasury to diversify into stablecoins and blue-chip assets for long-term sustainability.',
      proposer: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      status: 'passed',
      category: 'treasury',
      startDate: new Date(Date.now() - 86400000 * 10),
      endDate: new Date(Date.now() - 86400000 * 3),
      votesFor: 5800000,
      votesAgainst: 1200000,
      votesAbstain: 500000,
      quorum: 3000000,
      totalVotingPower: 15000000,
      yourVotingPower: 0,
      ipfsLink: 'ipfs://QmZ...',
      discussionLink: 'https://governance.aave.com/...',
    },
    {
      id: '4',
      protocol: 'MakerDAO',
      protocolLogo: '⚡',
      title: 'Onboard Real-World Assets as Collateral',
      description: 'Proposal to add tokenized real estate and treasury bonds as collateral types to expand DAI backing.',
      proposer: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
      status: 'active',
      category: 'governance',
      startDate: new Date(Date.now() - 86400000 * 3),
      endDate: new Date(Date.now() + 86400000 * 4),
      votesFor: 68000,
      votesAgainst: 42000,
      votesAbstain: 8000,
      quorum: 50000,
      totalVotingPower: 200000,
      yourVotingPower: 8,
      ipfsLink: 'ipfs://QmA...',
      discussionLink: 'https://forum.makerdao.com/...',
    },
    {
      id: '5',
      protocol: 'Uniswap',
      protocolLogo: '🦄',
      title: 'Fund Liquidity Mining Program for New Pairs',
      description: 'Allocate 5M UNI tokens to incentivize liquidity for emerging tokens and stablecoin pairs.',
      proposer: '0x456def...',
      status: 'pending',
      category: 'treasury',
      startDate: new Date(Date.now() + 86400000 * 1),
      endDate: new Date(Date.now() + 86400000 * 8),
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      quorum: 10000000,
      totalVotingPower: 50000000,
      yourVotingPower: 5000,
    },
  ];

  const filteredProposals = proposals.filter(proposal => {
    if (filterStatus !== 'all' && proposal.status !== filterStatus) return false;
    if (filterCategory !== 'all' && proposal.category !== filterCategory) return false;
    return true;
  });

  const activeProposals = proposals.filter(p => p.status === 'active').length;
  const totalVotingPower = votingPower.reduce((sum, vp) => sum + vp.votingPower, 0);
  const participationRate = proposals.filter(p => p.yourVote).length / proposals.filter(p => p.status === 'active').length * 100 || 0;
  const protocolsWithVotingPower = votingPower.length;

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  const getVotePercentages = (proposal: GovernanceProposal) => {
    const total = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
    if (total === 0) return { for: 0, against: 0, abstain: 0 };
    
    return {
      for: (proposal.votesFor / total) * 100,
      against: (proposal.votesAgainst / total) * 100,
      abstain: (proposal.votesAbstain / total) * 100,
    };
  };

  const getQuorumPercentage = (proposal: GovernanceProposal) => {
    const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
    return Math.min((totalVotes / proposal.quorum) * 100, 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="gap-1">
          <Activity className="h-3 w-3" />
          Active
        </Badge>;
      case 'passed':
        return <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Passed
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>;
      case 'pending':
        return <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case 'executed':
        return <Badge variant="outline" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Executed
        </Badge>;
      default:
        return null;
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, any> = {
      treasury: { label: 'Treasury', variant: 'default' },
      technical: { label: 'Technical', variant: 'info' },
      governance: { label: 'Governance', variant: 'warning' },
      partnership: { label: 'Partnership', variant: 'success' },
      other: { label: 'Other', variant: 'outline' },
    };
    const style = styles[category] || { label: category, variant: 'outline' };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Governance Voting Aggregator
            </CardTitle>
            <CardDescription>
              Participate in protocol governance across all your holdings
            </CardDescription>
          </div>
          <Button size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold text-primary">{activeProposals}</p>
            </div>
            <p className="text-xs text-muted-foreground">Active Proposals</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{formatNumber(totalVotingPower)}</p>
            <p className="text-xs text-muted-foreground">Total Voting Power</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-500">{participationRate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Participation</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{protocolsWithVotingPower}</p>
            <p className="text-xs text-muted-foreground">Protocols</p>
          </div>
        </div>

        {/* Your Voting Power */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-3">Your Voting Power</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {votingPower.map((vp) => (
              <div key={vp.protocol} className="p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{vp.protocol}</span>
                  <Badge variant="outline">{vp.token}</Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Your Balance:</span>
                    <span className="font-medium">{formatNumber(vp.balance)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Voting Power:</span>
                    <span className="font-bold text-primary">{formatNumber(vp.votingPower)}</span>
                  </div>
                  {vp.delegatedFrom > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>Delegated from:</span>
                      <span className="font-medium">+{formatNumber(vp.delegatedFrom)}</span>
                    </div>
                  )}
                  {vp.delegatedTo && (
                    <div className="flex items-center justify-between text-yellow-600">
                      <span>Delegated to:</span>
                      <span className="font-medium">{formatAddress(vp.delegatedTo)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Status</p>
            <div className="flex gap-2 flex-wrap">
              {['all', 'active', 'pending', 'passed', 'rejected'].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status as any)}
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
              {['all', 'treasury', 'technical', 'governance', 'partnership'].map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={filterCategory === category ? 'default' : 'outline'}
                  onClick={() => setFilterCategory(category as any)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Proposals */}
        <div className="space-y-4 mb-6">
          {filteredProposals.map((proposal) => {
            const percentages = getVotePercentages(proposal);
            const quorumPercentage = getQuorumPercentage(proposal);
            const isActive = proposal.status === 'active';
            const canVote = isActive && proposal.yourVotingPower > 0 && !proposal.yourVote;
            
            return (
              <div
                key={proposal.id}
                className={`p-4 rounded-lg border transition-colors ${
                  isActive
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">{proposal.protocolLogo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline">{proposal.protocol}</Badge>
                        {getStatusBadge(proposal.status)}
                        {getCategoryBadge(proposal.category)}
                        {proposal.yourVote && (
                          <Badge variant="info" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Voted {proposal.yourVote}
                          </Badge>
                        )}
                      </div>
                      <h5 className="font-bold mb-2">{proposal.title}</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        {proposal.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>By {formatAddress(proposal.proposer)}</span>
                        {isActive && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeRemaining(proposal.endDate)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voting Bars */}
                {(proposal.votesFor > 0 || proposal.votesAgainst > 0 || proposal.votesAbstain > 0) && (
                  <div className="mb-3 space-y-2">
                    {/* For */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <ThumbsUp className="h-3 w-3" />
                          For
                        </span>
                        <span className="font-bold text-green-600">
                          {formatNumber(proposal.votesFor)} ({percentages.for.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${percentages.for}%` }}
                        />
                      </div>
                    </div>

                    {/* Against */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 text-red-600 font-medium">
                          <ThumbsDown className="h-3 w-3" />
                          Against
                        </span>
                        <span className="font-bold text-red-600">
                          {formatNumber(proposal.votesAgainst)} ({percentages.against.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all"
                          style={{ width: `${percentages.against}%` }}
                        />
                      </div>
                    </div>

                    {/* Abstain */}
                    {proposal.votesAbstain > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-1 text-muted-foreground font-medium">
                            <Minus className="h-3 w-3" />
                            Abstain
                          </span>
                          <span className="font-bold">
                            {formatNumber(proposal.votesAbstain)} ({percentages.abstain.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full bg-muted-foreground transition-all"
                            style={{ width: `${percentages.abstain}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Quorum */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Target className="h-3 w-3" />
                          Quorum Progress
                        </span>
                        <span className={`font-bold ${quorumPercentage >= 100 ? 'text-green-600' : ''}`}>
                          {formatNumber(proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain)} / {formatNumber(proposal.quorum)} ({quorumPercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-border overflow-hidden">
                        <div
                          className={`h-full transition-all ${quorumPercentage >= 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${quorumPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Your Voting Power */}
                {proposal.yourVotingPower > 0 && (
                  <div className="mb-3 p-2 rounded bg-primary/10 text-xs">
                    <span className="text-muted-foreground">Your voting power: </span>
                    <span className="font-bold text-primary">{formatNumber(proposal.yourVotingPower)}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {canVote && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-600">
                        <ThumbsUp className="h-4 w-4" />
                        Vote For
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-600">
                        <ThumbsDown className="h-4 w-4" />
                        Vote Against
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Minus className="h-4 w-4" />
                        Abstain
                      </Button>
                    </>
                  )}
                  {proposal.discussionLink && (
                    <Button size="sm" variant="outline" className="gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Discussion
                    </Button>
                  )}
                  {proposal.ipfsLink && (
                    <Button size="sm" variant="outline" className="gap-1">
                      <FileText className="h-4 w-4" />
                      Details
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="gap-1">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🗳️ Governance Participation</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• View all proposals across your holdings</li>
            <li>• Vote directly from one dashboard</li>
            <li>• Track your voting history</li>
            <li>• Delegate voting power to experts</li>
            <li>• Get alerts for new proposals</li>
            <li>• Participate in protocol decision-making</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

