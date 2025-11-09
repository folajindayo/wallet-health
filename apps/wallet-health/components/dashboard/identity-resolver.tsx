'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield,
  Link as LinkIcon,
  Twitter,
  Github,
  Globe,
  Mail,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  Search
} from 'lucide-react';
import { useState } from 'react';

interface Identity {
  address: string;
  primaryName?: string;
  avatar?: string;
  verified: boolean;
  services: {
    ens?: string;
    lens?: string;
    farcaster?: string;
    unstoppable?: string;
    spaceid?: string;
  };
  socials: {
    twitter?: string;
    github?: string;
    website?: string;
    email?: string;
  };
  reputation: {
    score: number;
    badges: string[];
    verifications: string[];
  };
}

interface ResolvedAddress {
  input: string;
  address: string;
  name?: string;
  service: 'ENS' | 'Lens' | 'Unstoppable' | 'Address';
  verified: boolean;
  timestamp: Date;
}

interface IdentityResolverProps {
  walletAddress: string;
}

export function IdentityResolver({ walletAddress }: IdentityResolverProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock identity
  const identity: Identity = {
    address: walletAddress,
    primaryName: 'vitalik.eth',
    avatar: '👤',
    verified: true,
    services: {
      ens: 'vitalik.eth',
      lens: 'vitalik.lens',
      farcaster: '@vitalik',
      unstoppable: 'vitalik.crypto',
      spaceid: 'vitalik.bnb',
    },
    socials: {
      twitter: '@VitalikButerin',
      github: 'vbuterin',
      website: 'https://vitalik.ca',
      email: 'v@ethereum.org',
    },
    reputation: {
      score: 98,
      badges: ['Early Adopter', 'Verified Developer', 'DAO Contributor'],
      verifications: ['Twitter', 'GitHub', 'Email'],
    },
  };

  // Mock resolved addresses
  const recentResolves: ResolvedAddress[] = [
    {
      input: 'vitalik.eth',
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      name: 'vitalik.eth',
      service: 'ENS',
      verified: true,
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      input: 'lens/@stani',
      address: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf',
      name: 'stani.lens',
      service: 'Lens',
      verified: true,
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      input: 'unstoppable.crypto',
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      name: 'unstoppable.crypto',
      service: 'Unstoppable',
      verified: true,
      timestamp: new Date(Date.now() - 14400000),
    },
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getReputationBadge = (score: number) => {
    if (score >= 90) return <Badge variant="secondary">Excellent</Badge>;
    if (score >= 75) return <Badge variant="default">Good</Badge>;
    if (score >= 50) return <Badge variant="outline">Fair</Badge>;
    return <Badge variant="destructive">Low</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Identity Resolver
            </CardTitle>
            <CardDescription>
              Resolve Web3 identities and reverse lookup addresses
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ENS, Lens, Unstoppable, or address..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          </div>
        </div>

        {/* Your Identity */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Your Identity</h4>
            {identity.verified && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>

          <div className="flex items-start gap-4 mb-4">
            <div className="text-5xl">{identity.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">{identity.primaryName || formatAddress(identity.address)}</h3>
                {getReputationBadge(identity.reputation.score)}
              </div>
              <p className="text-xs font-mono text-muted-foreground mb-3">
                {identity.address}
              </p>

              {/* Services */}
              <div className="mb-3">
                <p className="text-xs font-semibold mb-2">Connected Services</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(identity.services).map(([service, value]) => (
                    value && (
                      <div key={service} className="flex items-center gap-2 p-2 rounded bg-muted">
                        <LinkIcon className="h-3 w-3 text-primary" />
                        <span className="text-xs font-medium capitalize">{service}</span>
                        <Badge variant="outline" className="ml-auto text-xs">{value}</Badge>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="mb-3">
                <p className="text-xs font-semibold mb-2">Social Links</p>
                <div className="flex gap-2 flex-wrap">
                  {identity.socials.twitter && (
                    <Button size="sm" variant="outline" className="gap-2">
                      <Twitter className="h-3 w-3" />
                      {identity.socials.twitter}
                    </Button>
                  )}
                  {identity.socials.github && (
                    <Button size="sm" variant="outline" className="gap-2">
                      <Github className="h-3 w-3" />
                      {identity.socials.github}
                    </Button>
                  )}
                  {identity.socials.website && (
                    <Button size="sm" variant="outline" className="gap-2">
                      <Globe className="h-3 w-3" />
                      Website
                    </Button>
                  )}
                </div>
              </div>

              {/* Reputation */}
              <div>
                <p className="text-xs font-semibold mb-2">Reputation & Badges</p>
                <div className="flex gap-1 flex-wrap">
                  {identity.reputation.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button size="sm" className="w-full">
            <Shield className="h-4 w-4 mr-2" />
            Edit Identity
          </Button>
        </div>

        {/* Recent Resolves */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold">Recent Resolves</h4>
          {recentResolves.map((resolve, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-sm">{resolve.input}</h5>
                    <Badge variant="outline">{resolve.service}</Badge>
                    {resolve.verified && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mb-2">
                    {resolve.address}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(resolve.timestamp)}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Supported Services */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-3">Supported Services</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              { name: 'ENS', desc: '.eth domains', icon: '🌐' },
              { name: 'Lens Protocol', desc: '.lens handles', icon: '🌿' },
              { name: 'Unstoppable Domains', desc: '.crypto, .nft, .dao', icon: '🔗' },
              { name: 'Space ID', desc: '.bnb, .arb domains', icon: '🚀' },
              { name: 'Farcaster', desc: '@username handles', icon: '🎯' },
              { name: 'Address', desc: '0x... addresses', icon: '📍' },
            ].map((service, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted">
                <span className="text-xl">{service.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.desc}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🔍 Identity Features</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Resolve ENS, Lens, Unstoppable, and more</li>
            <li>• Reverse lookup addresses to names</li>
            <li>• View social profiles and verification status</li>
            <li>• Track reputation scores and badges</li>
            <li>• Unified identity across Web3 platforms</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

