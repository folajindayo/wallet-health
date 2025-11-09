'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileCode, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useState } from 'react';

interface ContractInteraction {
  address: string;
  name?: string;
  verified: boolean;
  interactions: number;
  lastInteraction: Date;
  risk: 'safe' | 'medium' | 'high';
  category?: string;
  explorerUrl?: string;
}

interface ContractInteractionsProps {
  contracts?: ContractInteraction[];
}

export function ContractInteractions({ contracts = [] }: ContractInteractionsProps) {
  const [filter, setFilter] = useState<'all' | 'safe' | 'risky'>('all');

  // Mock data if none provided
  const mockContracts: ContractInteraction[] = [
    {
      address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      name: 'Uniswap V2 Router',
      verified: true,
      interactions: 45,
      lastInteraction: new Date(Date.now() - 3600000),
      risk: 'safe',
      category: 'DEX',
      explorerUrl: 'https://etherscan.io/address/0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    },
    {
      address: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      name: 'Aave Lending Pool',
      verified: true,
      interactions: 12,
      lastInteraction: new Date(Date.now() - 86400000),
      risk: 'safe',
      category: 'Lending',
      explorerUrl: 'https://etherscan.io/address/0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
    },
    {
      address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      name: 'Unknown Contract',
      verified: false,
      interactions: 3,
      lastInteraction: new Date(Date.now() - 172800000),
      risk: 'medium',
      category: 'Unknown',
    },
    {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      name: 'FLAGGED: Potential Scam',
      verified: false,
      interactions: 1,
      lastInteraction: new Date(Date.now() - 259200000),
      risk: 'high',
      category: 'Warning',
    },
  ];

  const displayContracts = contracts.length > 0 ? contracts : mockContracts;

  const filteredContracts = displayContracts.filter(contract => {
    if (filter === 'all') return true;
    if (filter === 'safe') return contract.risk === 'safe';
    if (filter === 'risky') return contract.risk === 'high' || contract.risk === 'medium';
    return true;
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'safe':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Safe
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Medium Risk
          </Badge>
        );
      case 'high':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            High Risk
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const stats = {
    total: displayContracts.length,
    safe: displayContracts.filter(c => c.risk === 'safe').length,
    risky: displayContracts.filter(c => c.risk === 'high' || c.risk === 'medium').length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Smart Contract Interactions
        </CardTitle>
        <CardDescription>
          Contracts your wallet has interacted with
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.safe}</p>
            <p className="text-xs text-muted-foreground">Safe</p>
          </div>
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.risky}</p>
            <p className="text-xs text-muted-foreground">Risky</p>
          </div>
        </div>

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
            variant={filter === 'safe' ? 'default' : 'outline'}
            onClick={() => setFilter('safe')}
          >
            Safe ({stats.safe})
          </Button>
          <Button
            size="sm"
            variant={filter === 'risky' ? 'default' : 'outline'}
            onClick={() => setFilter('risky')}
          >
            Risky ({stats.risky})
          </Button>
        </div>

        {/* Contract List */}
        <div className="space-y-3">
          {filteredContracts.map((contract, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold truncate">
                      {contract.name || 'Unknown Contract'}
                    </h4>
                    {contract.verified && (
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                    {getRiskBadge(contract.risk)}
                  </div>

                  <p className="text-xs text-muted-foreground font-mono mb-3 truncate">
                    {contract.address}
                  </p>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{contract.interactions} interactions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Last: {formatTimestamp(contract.lastInteraction)}</span>
                    </div>
                    {contract.category && (
                      <Badge variant="outline" className="text-xs">
                        {contract.category}
                      </Badge>
                    )}
                  </div>
                </div>

                {contract.explorerUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(contract.explorerUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-8">
            <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No contracts found for this filter
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

