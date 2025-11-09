'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Landmark, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Vote,
  Shield,
  Calendar,
  Target
} from 'lucide-react';
import { useState } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TreasuryAsset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  percentage: number;
  change24h: number;
  logo: string;
}

interface TreasuryTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'swap' | 'reward';
  amount: number;
  token: string;
  from?: string;
  to?: string;
  timestamp: Date;
  proposalId?: string;
  status: 'confirmed' | 'pending';
  txHash: string;
}

interface Proposal {
  id: string;
  title: string;
  type: 'spending' | 'investment' | 'grant';
  amount: number;
  token: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  quorum: number;
  endsAt: Date;
}

interface DAOTreasuryManagerProps {
  walletAddress: string;
}

export function DAOTreasuryManager({ walletAddress }: DAOTreasuryManagerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock treasury assets
  const assets: TreasuryAsset[] = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 245.5,
      value: 601225,
      percentage: 42.5,
      change24h: 2.4,
      logo: '💎',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 425000,
      value: 425000,
      percentage: 30.0,
      change24h: 0.1,
      logo: '💵',
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      balance: 180000,
      value: 179820,
      percentage: 12.7,
      change24h: -0.1,
      logo: '🪙',
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      balance: 4.2,
      value: 181650,
      percentage: 12.8,
      change24h: 3.2,
      logo: '₿',
    },
    {
      symbol: 'UNI',
      name: 'Uniswap',
      balance: 12500,
      value: 28125,
      percentage: 2.0,
      change24h: -1.8,
      logo: '🦄',
    },
  ];

  // Mock transactions
  const transactions: TreasuryTransaction[] = [
    {
      id: '1',
      type: 'deposit',
      amount: 50000,
      token: 'USDC',
      from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      timestamp: new Date(Date.now() - 3600000 * 12),
      status: 'confirmed',
      txHash: '0xabcd1234...',
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 10,
      token: 'ETH',
      to: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      timestamp: new Date(Date.now() - 86400000 * 2),
      proposalId: 'PROP-042',
      status: 'confirmed',
      txHash: '0xefgh5678...',
    },
    {
      id: '3',
      type: 'reward',
      amount: 2500,
      token: 'UNI',
      timestamp: new Date(Date.now() - 86400000 * 5),
      status: 'confirmed',
      txHash: '0xijkl9012...',
    },
    {
      id: '4',
      type: 'swap',
      amount: 25000,
      token: 'USDC',
      timestamp: new Date(Date.now() - 86400000 * 8),
      status: 'confirmed',
      txHash: '0xmnop3456...',
    },
  ];

  // Mock proposals
  const proposals: Proposal[] = [
    {
      id: 'PROP-045',
      title: 'Marketing Budget Q1 2025',
      type: 'spending',
      amount: 75000,
      token: 'USDC',
      status: 'active',
      votesFor: 12500000,
      votesAgainst: 3200000,
      quorum: 10000000,
      endsAt: new Date(Date.now() + 86400000 * 3),
    },
    {
      id: 'PROP-044',
      title: 'Developer Grant Program',
      type: 'grant',
      amount: 100000,
      token: 'USDC',
      status: 'passed',
      votesFor: 18500000,
      votesAgainst: 2100000,
      quorum: 10000000,
      endsAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: 'PROP-043',
      title: 'Invest in DeFi Yield Strategy',
      type: 'investment',
      amount: 50,
      token: 'ETH',
      status: 'active',
      votesFor: 8200000,
      votesAgainst: 5800000,
      quorum: 10000000,
      endsAt: new Date(Date.now() + 86400000 * 5),
    },
  ];

  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
  const change24h = assets.reduce((sum, a) => sum + (a.value * a.change24h / 100), 0);
  const changePercent = (change24h / totalValue) * 100;
  const activeProposals = proposals.filter(p => p.status === 'active').length;

  const chartData = assets.map(a => ({
    name: a.symbol,
    value: a.percentage,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (diff < 0) return 'Ended';
    if (hours < 24) return `${hours}h left`;
    return `${days}d left`;
  };

  const getProposalStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'passed':
        return <Badge variant="secondary">Passed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'executed':
        return <Badge variant="secondary">Executed</Badge>;
      default:
        return null;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'swap':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'reward':
        return <DollarSign className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              DAO Treasury Manager
            </CardTitle>
            <CardDescription>
              Monitor and manage DAO treasury assets
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <Target className="h-4 w-4 mr-2" />
            New Proposal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Treasury Overview */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Total Treasury Value</h4>
            <div className="flex gap-1">
              {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                <Button
                  key={period}
                  size="sm"
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  onClick={() => setSelectedPeriod(period)}
                  className="h-7 px-2 text-xs"
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalValue)}</p>
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${
              changePercent >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
            }`}>
              {changePercent >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {changePercent >= 0 ? '+' : ''}{formatCurrency(change24h)} (24h)
          </p>
        </div>

        {/* Asset Allocation */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-semibold mb-3">Asset Allocation</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Top Assets</h4>
            <div className="space-y-2">
              {assets.slice(0, 5).map((asset, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{asset.logo}</span>
                      <div>
                        <h5 className="font-semibold text-sm">{asset.symbol}</h5>
                        <p className="text-xs text-muted-foreground">{asset.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(asset.value)}</p>
                      <p className={`text-xs ${
                        asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatNumber(asset.balance)} {asset.symbol}</span>
                    <span>{asset.percentage}% of treasury</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Proposals */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Active Proposals</h4>
            <Badge variant="default">{activeProposals} Active</Badge>
          </div>
          {proposals.filter(p => p.status === 'active').map((proposal) => {
            const voteProgress = (proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100;
            const quorumReached = (proposal.votesFor + proposal.votesAgainst) >= proposal.quorum;

            return (
              <div
                key={proposal.id}
                className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold">{proposal.title}</h5>
                      {getProposalStatusBadge(proposal.status)}
                      <Badge variant="outline" className="capitalize">{proposal.type}</Badge>
                    </div>

                    <div className="mb-3">
                      <p className="text-lg font-bold text-primary">
                        {formatNumber(proposal.amount)} {proposal.token}
                      </p>
                      <p className="text-xs text-muted-foreground">Requested Amount</p>
                    </div>

                    {/* Voting Progress */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-green-600">For: {formatNumber(proposal.votesFor)}</span>
                        <span className="text-red-600">Against: {formatNumber(proposal.votesAgainst)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${voteProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {quorumReached ? (
                          <span className="text-green-600">✓ Quorum reached</span>
                        ) : (
                          <span className="text-yellow-600">
                            {formatNumber(proposal.quorum - (proposal.votesFor + proposal.votesAgainst))} votes needed
                          </span>
                        )}
                      </span>
                      <span>{formatTimeUntil(proposal.endsAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    <Vote className="h-4 w-4 mr-2" />
                    Vote For
                  </Button>
                  <Button size="sm" variant="destructive">
                    Vote Against
                  </Button>
                  <Button size="sm" variant="outline">
                    Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Recent Transactions</h4>
          {transactions.slice(0, 4).map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm capitalize">{tx.type}</p>
                      <Badge variant="outline" className="text-xs">{tx.token}</Badge>
                      {tx.proposalId && (
                        <Badge variant="default" className="text-xs">{tx.proposalId}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tx.from && `From ${formatAddress(tx.from)}`}
                      {tx.to && `To ${formatAddress(tx.to)}`}
                      {' • '}{formatTimeAgo(tx.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    tx.type === 'deposit' || tx.type === 'reward' ? 'text-green-600' : 'text-primary'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'reward' ? '+' : '-'}
                    {formatNumber(tx.amount)} {tx.token}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🏛️ Treasury Best Practices</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Diversify assets to reduce risk</li>
            <li>• Maintain sufficient stablecoin reserves</li>
            <li>• All spending requires governance approval</li>
            <li>• Regular treasury audits and reports</li>
            <li>• Implement multi-sig for large transactions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

