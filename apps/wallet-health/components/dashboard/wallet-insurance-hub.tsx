'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  TrendingUp,
  FileText,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';

interface InsurancePolicy {
  id: string;
  provider: string;
  type: 'protocol' | 'smart_contract' | 'stablecoin' | 'comprehensive';
  protocol: string;
  coverage: number;
  premium: number;
  premiumPeriod: 'monthly' | 'annual';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'claim_pending' | 'claimed';
  coveredAssets: string[];
  logo: string;
}

interface InsuranceProvider {
  name: string;
  rating: number;
  totalCoverage: number;
  minPremium: number;
  logo: string;
  types: string[];
}

interface Claim {
  id: string;
  policyId: string;
  protocol: string;
  incident: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submittedAt: Date;
  resolvedAt?: Date;
}

interface WalletInsuranceHubProps {
  walletAddress: string;
}

export function WalletInsuranceHub({ walletAddress }: WalletInsuranceHubProps) {
  const [showNewPolicy, setShowNewPolicy] = useState(false);

  // Mock insurance policies
  const policies: InsurancePolicy[] = [
    {
      id: '1',
      provider: 'Nexus Mutual',
      type: 'protocol',
      protocol: 'Aave V3',
      coverage: 50000,
      premium: 150,
      premiumPeriod: 'monthly',
      startDate: new Date(Date.now() - 86400000 * 30),
      endDate: new Date(Date.now() + 86400000 * 335),
      status: 'active',
      coveredAssets: ['USDC', 'ETH', 'DAI'],
      logo: '🛡️',
    },
    {
      id: '2',
      provider: 'InsurAce',
      type: 'smart_contract',
      protocol: 'Uniswap V3',
      coverage: 25000,
      premium: 75,
      premiumPeriod: 'monthly',
      startDate: new Date(Date.now() - 86400000 * 60),
      endDate: new Date(Date.now() + 86400000 * 305),
      status: 'active',
      coveredAssets: ['ETH', 'USDC'],
      logo: '⚡',
    },
    {
      id: '3',
      provider: 'Bridge Mutual',
      type: 'stablecoin',
      protocol: 'USDC',
      coverage: 100000,
      premium: 200,
      premiumPeriod: 'annual',
      startDate: new Date(Date.now() - 86400000 * 180),
      endDate: new Date(Date.now() + 86400000 * 185),
      status: 'active',
      coveredAssets: ['USDC'],
      logo: '🌉',
    },
  ];

  // Mock insurance providers
  const providers: InsuranceProvider[] = [
    {
      name: 'Nexus Mutual',
      rating: 4.8,
      totalCoverage: 500000000,
      minPremium: 50,
      logo: '🛡️',
      types: ['protocol', 'smart_contract', 'comprehensive'],
    },
    {
      name: 'InsurAce',
      rating: 4.6,
      totalCoverage: 250000000,
      minPremium: 40,
      logo: '⚡',
      types: ['protocol', 'smart_contract', 'stablecoin'],
    },
    {
      name: 'Bridge Mutual',
      rating: 4.5,
      totalCoverage: 150000000,
      minPremium: 60,
      logo: '🌉',
      types: ['stablecoin', 'protocol'],
    },
    {
      name: 'Unslashed',
      rating: 4.4,
      totalCoverage: 100000000,
      minPremium: 35,
      logo: '🔐',
      types: ['protocol', 'comprehensive'],
    },
  ];

  // Mock claims
  const claims: Claim[] = [
    {
      id: '1',
      policyId: '1',
      protocol: 'Aave V3',
      incident: 'Smart contract vulnerability exploit',
      amount: 15000,
      status: 'approved',
      submittedAt: new Date(Date.now() - 86400000 * 45),
      resolvedAt: new Date(Date.now() - 86400000 * 30),
    },
  ];

  const activePolicies = policies.filter(p => p.status === 'active').length;
  const totalCoverage = policies
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + p.coverage, 0);
  const monthlyPremium = policies
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + (p.premiumPeriod === 'monthly' ? p.premium : p.premium / 12), 0);
  const pendingClaims = claims.filter(c => c.status === 'pending').length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>;
      case 'expired':
        return <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expired
        </Badge>;
      case 'claim_pending':
        return <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Claim Pending
        </Badge>;
      case 'claimed':
        return <Badge variant="default">Claimed</Badge>;
      default:
        return null;
    }
  };

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="secondary">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'paid':
        return <Badge variant="secondary">Paid</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { label: string; variant: any }> = {
      protocol: { label: 'Protocol', variant: 'default' },
      smart_contract: { label: 'Smart Contract', variant: 'info' },
      stablecoin: { label: 'Stablecoin', variant: 'success' },
      comprehensive: { label: 'Comprehensive', variant: 'warning' },
    };
    const style = styles[type] || { label: type, variant: 'outline' };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Wallet Insurance Hub
            </CardTitle>
            <CardDescription>
              Protect your assets with DeFi insurance coverage
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowNewPolicy(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Policy
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold">{activePolicies}</p>
            </div>
            <p className="text-xs text-muted-foreground">Active Policies</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalCoverage)}</p>
            <p className="text-xs text-muted-foreground">Total Coverage</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{formatCurrency(monthlyPremium)}</p>
            <p className="text-xs text-muted-foreground">Monthly Premium</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="h-4 w-4 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-600">{pendingClaims}</p>
            </div>
            <p className="text-xs text-muted-foreground">Pending Claims</p>
          </div>
        </div>

        {/* Coverage Overview */}
        <div className="mb-6 p-4 rounded-lg border border-green-500/30 bg-green-500/5">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 text-green-600">
                Protected Assets
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Your wallet has {formatCurrency(totalCoverage)} in active coverage across {activePolicies} policies
              </p>
              <div className="flex flex-wrap gap-1">
                {Array.from(new Set(policies.flatMap(p => p.coveredAssets))).map((asset, index) => (
                  <Badge key={index} variant="outline">
                    {asset}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Policies */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-semibold">Your Policies</h4>
          {policies.map((policy) => (
            <div
              key={policy.id}
              className={`p-4 rounded-lg border transition-colors ${
                policy.status === 'active'
                  ? 'border-border hover:bg-muted/50'
                  : 'border-red-500/30 bg-red-500/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl">{policy.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h5 className="font-semibold">{policy.provider}</h5>
                      {getStatusBadge(policy.status)}
                      {getTypeBadge(policy.type)}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      Covering {policy.protocol}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Coverage</p>
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(policy.coverage)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Premium</p>
                        <p className="text-sm font-bold">
                          {formatCurrency(policy.premium)}/{policy.premiumPeriod === 'monthly' ? 'mo' : 'yr'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Start Date</p>
                        <p className="text-sm font-medium">{formatDate(policy.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">End Date</p>
                        <p className="text-sm font-medium">{formatDate(policy.endDate)}</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Covered Assets:</p>
                      <div className="flex flex-wrap gap-1">
                        {policy.coveredAssets.map((asset, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {asset}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {policy.status === 'active' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    File Claim
                  </Button>
                  <Button size="sm" variant="outline">
                    View Policy
                  </Button>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Available Providers */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-semibold">Available Insurance Providers</h4>
          {providers.map((provider, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl">{provider.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold">{provider.name}</h5>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium">{provider.rating}</span>
                        <span className="text-yellow-500">⭐</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Coverage</p>
                        <p className="text-sm font-bold">
                          {formatCurrency(provider.totalCoverage)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Min. Premium</p>
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(provider.minPremium)}/mo
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {provider.types.map((type, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {type.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button size="sm">
                  Get Quote
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Claims History */}
        {claims.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Claims History</h4>
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-lg border border-green-500/30 bg-green-500/5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-sm">{claim.protocol}</h5>
                      {getClaimStatusBadge(claim.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{claim.incident}</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(claim.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted {formatTimeAgo(claim.submittedAt)}
                      {claim.resolvedAt && ` • Resolved ${formatTimeAgo(claim.resolvedAt)}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🛡️ Insurance Benefits</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Protect your assets from smart contract exploits</li>
            <li>• Get compensated for protocol failures</li>
            <li>• Stablecoin de-pegging coverage available</li>
            <li>• Claims processed by decentralized governance</li>
            <li>• Multiple providers for competitive rates</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

