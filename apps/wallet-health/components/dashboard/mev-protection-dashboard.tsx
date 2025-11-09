'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  Activity,
  DollarSign,
  TrendingDown,
  Zap,
  Eye,
  EyeOff,
  Info,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';

interface MEVAttack {
  id: string;
  type: 'frontrun' | 'sandwich' | 'backrun' | 'liquidation';
  targetTx: string;
  attackerAddress: string;
  victim: string;
  extractedValue: number;
  timestamp: Date;
  blockNumber: number;
  prevented: boolean;
}

interface ProtectionStats {
  totalProtected: number;
  attacksPrevented: number;
  savingsAmount: number;
  successRate: number;
}

interface RPCProvider {
  name: string;
  type: 'public' | 'private' | 'flashbots';
  mevProtection: boolean;
  speed: 'fast' | 'medium' | 'slow';
  cost: 'free' | 'paid';
  enabled: boolean;
  logo: string;
}

interface MEVProtectionDashboardProps {
  walletAddress: string;
}

export function MEVProtectionDashboard({ walletAddress }: MEVProtectionDashboardProps) {
  const [protectionEnabled, setProtectionEnabled] = useState(true);

  // Mock MEV attacks
  const attacks: MEVAttack[] = [
    {
      id: '1',
      type: 'sandwich',
      targetTx: '0xabcd1234...',
      attackerAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      victim: walletAddress,
      extractedValue: 450,
      timestamp: new Date(Date.now() - 3600000),
      blockNumber: 18500234,
      prevented: true,
    },
    {
      id: '2',
      type: 'frontrun',
      targetTx: '0xefgh5678...',
      attackerAddress: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      victim: walletAddress,
      extractedValue: 1250,
      timestamp: new Date(Date.now() - 7200000),
      blockNumber: 18500180,
      prevented: true,
    },
    {
      id: '3',
      type: 'backrun',
      targetTx: '0xijkl9012...',
      attackerAddress: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      victim: walletAddress,
      extractedValue: 320,
      timestamp: new Date(Date.now() - 14400000),
      blockNumber: 18500045,
      prevented: true,
    },
    {
      id: '4',
      type: 'sandwich',
      targetTx: '0xmnop3456...',
      attackerAddress: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
      victim: '0x456...def',
      extractedValue: 850,
      timestamp: new Date(Date.now() - 21600000),
      blockNumber: 18499980,
      prevented: false,
    },
  ];

  // Mock RPC providers
  const rpcProviders: RPCProvider[] = [
    {
      name: 'Flashbots Protect',
      type: 'flashbots',
      mevProtection: true,
      speed: 'fast',
      cost: 'free',
      enabled: true,
      logo: '⚡',
    },
    {
      name: 'Eden Network',
      type: 'private',
      mevProtection: true,
      speed: 'fast',
      cost: 'paid',
      enabled: false,
      logo: '🌿',
    },
    {
      name: 'BloxRoute',
      type: 'private',
      mevProtection: true,
      speed: 'fast',
      cost: 'paid',
      enabled: false,
      logo: '🚀',
    },
    {
      name: 'Public RPC',
      type: 'public',
      mevProtection: false,
      speed: 'medium',
      cost: 'free',
      enabled: false,
      logo: '🌐',
    },
  ];

  const protectionStats: ProtectionStats = {
    totalProtected: 156,
    attacksPrevented: attacks.filter(a => a.prevented && a.victim === walletAddress).length,
    savingsAmount: attacks
      .filter(a => a.prevented && a.victim === walletAddress)
      .reduce((sum, a) => sum + a.extractedValue, 0),
    successRate: 98.7,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

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

  const getAttackTypeBadge = (type: string) => {
    const styles: Record<string, any> = {
      frontrun: { label: 'Front-run', variant: 'destructive' },
      sandwich: { label: 'Sandwich', variant: 'destructive' },
      backrun: { label: 'Back-run', variant: 'warning' },
      liquidation: { label: 'Liquidation', variant: 'info' },
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
              MEV Protection Dashboard
            </CardTitle>
            <CardDescription>
              Protect your transactions from MEV attacks
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant={protectionEnabled ? 'secondary' : 'destructive'}
            onClick={() => setProtectionEnabled(!protectionEnabled)}
          >
            {protectionEnabled ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Protected
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Unprotected
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Protection Status */}
        <div className={`mb-6 p-4 rounded-lg border ${
          protectionEnabled
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-red-500/30 bg-red-500/5'
        }`}>
          <div className="flex items-start gap-3">
            {protectionEnabled ? (
              <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold text-sm mb-1 ${
                protectionEnabled ? 'text-green-600' : 'text-red-600'
              }`}>
                {protectionEnabled ? 'MEV Protection Active' : 'MEV Protection Disabled'}
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                {protectionEnabled
                  ? 'Your transactions are being protected from front-running and sandwich attacks'
                  : 'Warning: Your transactions are vulnerable to MEV attacks'}
              </p>
              {!protectionEnabled && (
                <Button size="sm" variant="secondary" onClick={() => setProtectionEnabled(true)}>
                  Enable Protection
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Protection Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{protectionStats.totalProtected}</p>
            <p className="text-xs text-muted-foreground">Txs Protected</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-600">{protectionStats.attacksPrevented}</p>
            <p className="text-xs text-muted-foreground">Attacks Blocked</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(protectionStats.savingsAmount)}</p>
            <p className="text-xs text-muted-foreground">Value Saved</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-600">{protectionStats.successRate}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
        </div>

        {/* RPC Providers */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-semibold">Protected RPC Providers</h4>
          {rpcProviders.map((provider, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-colors ${
                provider.enabled
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{provider.logo}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-sm">{provider.name}</h5>
                      {provider.mevProtection && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Shield className="h-3 w-3" />
                          MEV Protected
                        </Badge>
                      )}
                      {provider.enabled && (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{provider.type} RPC</span>
                      <span>•</span>
                      <span className="capitalize">{provider.speed} speed</span>
                      <span>•</span>
                      <span className="capitalize">{provider.cost}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant={provider.enabled ? 'outline' : 'default'}>
                  {provider.enabled ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Attacks */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold">Recent MEV Activity</h4>
          {attacks.map((attack) => (
            <div
              key={attack.id}
              className={`p-4 rounded-lg border transition-colors ${
                attack.prevented
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getAttackTypeBadge(attack.type)}
                    {attack.prevented ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Prevented
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Not Protected
                      </Badge>
                    )}
                    {attack.victim === walletAddress && (
                      <Badge variant="outline">Your Tx</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Extracted Value</p>
                      <p className={`text-sm font-bold ${
                        attack.prevented ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {attack.prevented ? 'Saved ' : 'Lost '}{formatCurrency(attack.extractedValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Block</p>
                      <p className="text-sm font-mono">{attack.blockNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium">{formatTimeAgo(attack.timestamp)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Attacker: {formatAddress(attack.attackerAddress)}</span>
                    <span>•</span>
                    <span className="font-mono">{attack.targetTx}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Attack Types Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Common MEV Attacks
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Sandwich:</strong> Buy before + sell after your trade</li>
              <li>• <strong>Front-run:</strong> Copy your trade with higher gas</li>
              <li>• <strong>Back-run:</strong> Execute immediately after your trade</li>
              <li>• <strong>Liquidation:</strong> Extract value from liquidations</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Protection Methods
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Private RPC:</strong> Transactions not in public mempool</li>
              <li>• <strong>Flashbots:</strong> Direct submission to validators</li>
              <li>• <strong>MEV Blocker:</strong> Auto-routing to protected RPCs</li>
              <li>• <strong>Slippage:</strong> Set appropriate slippage tolerance</li>
            </ul>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🛡️ What is MEV?</h4>
          <p className="text-xs text-muted-foreground mb-2">
            MEV (Maximal Extractable Value) refers to the profit bots and validators can make by reordering, 
            including, or excluding transactions in blocks they produce.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• MEV bots scan the mempool for profitable opportunities</li>
            <li>• They can front-run your trades causing worse prices</li>
            <li>• Protection routes txs through private channels</li>
            <li>• Users save millions collectively with MEV protection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

