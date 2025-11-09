'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Globe, 
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  Calendar,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { useState } from 'react';

interface ENSDomain {
  name: string;
  address: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  isPrimary: boolean;
  hasAvatar: boolean;
  hasTwitter: boolean;
  hasGithub: boolean;
  records: Record<string, string>;
  status: 'active' | 'expiring-soon' | 'expired';
}

interface ENSDomainManagerProps {
  walletAddress: string;
  domains?: ENSDomain[];
}

export function ENSDomainManager({ walletAddress, domains = [] }: ENSDomainManagerProps) {
  const [searchName, setSearchName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<'available' | 'taken' | null>(null);

  // Mock domains if none provided
  const mockDomains: ENSDomain[] = [
    {
      name: 'vitalik.eth',
      address: walletAddress,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 365,
      isPrimary: true,
      hasAvatar: true,
      hasTwitter: true,
      hasGithub: true,
      records: {
        'eth': walletAddress,
        'twitter': '@VitalikButerin',
        'github': 'vbuterin',
      },
      status: 'active',
    },
    {
      name: 'mydefi.eth',
      address: walletAddress,
      expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 45,
      isPrimary: false,
      hasAvatar: false,
      hasTwitter: false,
      hasGithub: false,
      records: {
        'eth': walletAddress,
      },
      status: 'expiring-soon',
    },
  ];

  const displayDomains = domains.length > 0 ? domains : mockDomains;

  const handleSearch = async () => {
    if (!searchName) return;
    setIsSearching(true);
    // Simulate ENS lookup
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSearchResult(Math.random() > 0.5 ? 'available' : 'taken');
    setIsSearching(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary">Active</Badge>;
      case 'expiring-soon':
        return <Badge variant="outline">Expiring Soon</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return null;
    }
  };

  const formatExpiryDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const primaryDomain = displayDomains.find(d => d.isPrimary);
  const expiringSoon = displayDomains.filter(d => d.status === 'expiring-soon').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          ENS Domain Manager
        </CardTitle>
        <CardDescription>
          Manage your Ethereum Name Service domains
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Primary ENS Display */}
        {primaryDomain && (
          <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">{primaryDomain.name}</h3>
                <Badge variant="default">Primary</Badge>
              </div>
              <Button size="sm" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground font-mono mb-2">
              {primaryDomain.address.slice(0, 16)}...{primaryDomain.address.slice(-16)}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {primaryDomain.hasAvatar && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Avatar
                </Badge>
              )}
              {primaryDomain.hasTwitter && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Twitter
                </Badge>
              )}
              {primaryDomain.hasGithub && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  GitHub
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Expires {formatExpiryDate(primaryDomain.expiryDate)}</span>
              <span className="text-primary font-medium">
                ({primaryDomain.daysUntilExpiry} days)
              </span>
            </div>
          </div>
        )}

        {/* Search for ENS */}
        <div className="mb-6 p-4 rounded-lg border border-border bg-card">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Search ENS Domain
          </h4>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Enter domain name (without .eth)"
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                setSearchResult(null);
              }}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>
          {searchResult && (
            <div className={`p-3 rounded-lg border ${
              searchResult === 'available'
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-red-500/30 bg-red-500/5'
            }`}>
              <div className="flex items-start gap-2">
                {searchResult === 'available' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">
                    {searchName}.eth is {searchResult === 'available' ? 'available' : 'taken'}
                  </p>
                  {searchResult === 'available' ? (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm">
                        Register Domain
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      This domain is already registered. Try a different name.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alerts */}
        {expiringSoon > 0 && (
          <div className="mb-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Renewal Required</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  You have {expiringSoon} domain{expiringSoon !== 1 ? 's' : ''} expiring soon.
                  Renew now to avoid losing ownership.
                </p>
                <Button size="sm" variant="outline">
                  Renew All Domains
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Domain List */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Your Domains</h4>
          {displayDomains.map((domain, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold">{domain.name}</h4>
                    {getStatusBadge(domain.status)}
                    {domain.isPrimary && <Badge variant="outline">Primary</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-2 break-all">
                    {domain.address}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Expires {formatExpiryDate(domain.expiryDate)}</span>
                    </div>
                    <div className={`font-medium ${
                      domain.daysUntilExpiry < 60 ? 'text-yellow-600' : 'text-primary'
                    }`}>
                      {domain.daysUntilExpiry} days left
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(domain.records).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}: {value.length > 20 ? `${value.slice(0, 20)}...` : value}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(domain.name)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://app.ens.domains/${domain.name}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                {domain.status === 'expiring-soon' && (
                  <Button size="sm" variant="outline">
                    Renew Now
                  </Button>
                )}
                {!domain.isPrimary && (
                  <Button size="sm" variant="outline">
                    Set as Primary
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  Edit Records
                </Button>
              </div>
            </div>
          ))}
        </div>

        {displayDomains.length === 0 && (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No ENS Domains</p>
            <p className="text-xs text-muted-foreground mb-3">
              Register your first ENS domain to get started
            </p>
            <Button size="sm">
              Register Domain
            </Button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🌐 ENS Benefits</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Replace long addresses with readable names</li>
            <li>• Set up decentralized websites</li>
            <li>• Link social media profiles</li>
            <li>• Receive payments to your name</li>
            <li>• Build your Web3 identity</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

