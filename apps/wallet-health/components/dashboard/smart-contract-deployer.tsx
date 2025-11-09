'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Rocket,
  FileCode,
  Settings,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Zap,
  Shield,
  DollarSign,
  Clock
} from 'lucide-react';
import { useState } from 'react';

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  type: 'token' | 'nft' | 'multisig' | 'dao' | 'defi' | 'custom';
  complexity: 'beginner' | 'intermediate' | 'advanced';
  gasEstimate: number;
  audited: boolean;
  features: string[];
  logo: string;
}

interface DeployedContract {
  id: string;
  name: string;
  address: string;
  network: string;
  type: string;
  deployedAt: Date;
  status: 'deploying' | 'deployed' | 'verified' | 'failed';
  txHash: string;
  gasUsed: number;
  totalCost: number;
  verified: boolean;
}

interface SmartContractDeployerProps {
  walletAddress: string;
}

export function SmartContractDeployer({ walletAddress }: SmartContractDeployerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [deployNetwork, setDeployNetwork] = useState<string>('ethereum');

  // Mock contract templates
  const templates: ContractTemplate[] = [
    {
      id: '1',
      name: 'ERC-20 Token',
      description: 'Standard fungible token with mint, burn, and transfer capabilities',
      type: 'token',
      complexity: 'beginner',
      gasEstimate: 1200000,
      audited: true,
      features: ['Mintable', 'Burnable', 'Pausable', 'Ownable'],
      logo: '🪙',
    },
    {
      id: '2',
      name: 'ERC-721 NFT',
      description: 'Non-fungible token collection with royalties and metadata',
      type: 'nft',
      complexity: 'intermediate',
      gasEstimate: 2500000,
      audited: true,
      features: ['Enumerable', 'URI Storage', 'Royalties', 'Whitelist'],
      logo: '🎨',
    },
    {
      id: '3',
      name: 'Multi-Sig Wallet',
      description: 'Secure wallet requiring multiple signatures for transactions',
      type: 'multisig',
      complexity: 'advanced',
      gasEstimate: 3500000,
      audited: true,
      features: ['M-of-N Signatures', 'Daily Limits', 'Timelock', 'Recovery'],
      logo: '🔐',
    },
    {
      id: '4',
      name: 'DAO Governance',
      description: 'Decentralized governance with voting and proposal system',
      type: 'dao',
      complexity: 'advanced',
      gasEstimate: 4200000,
      audited: true,
      features: ['Token Voting', 'Timelock', 'Treasury', 'Delegation'],
      logo: '🏛️',
    },
    {
      id: '5',
      name: 'Staking Pool',
      description: 'Token staking contract with rewards distribution',
      type: 'defi',
      complexity: 'intermediate',
      gasEstimate: 2800000,
      audited: true,
      features: ['Reward Calculation', 'Lock Periods', 'Emergency Withdraw'],
      logo: '💎',
    },
    {
      id: '6',
      name: 'Token Vesting',
      description: 'Linear or cliff vesting schedule for token distribution',
      type: 'defi',
      complexity: 'intermediate',
      gasEstimate: 1800000,
      audited: true,
      features: ['Linear Vesting', 'Cliff Period', 'Revocable', 'Multi-Beneficiary'],
      logo: '⏳',
    },
  ];

  // Mock deployed contracts
  const deployedContracts: DeployedContract[] = [
    {
      id: '1',
      name: 'MyToken (MTK)',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      network: 'Ethereum',
      type: 'ERC-20',
      deployedAt: new Date(Date.now() - 86400000 * 5),
      status: 'verified',
      txHash: '0xabcd1234...',
      gasUsed: 1245000,
      totalCost: 45.5,
      verified: true,
    },
    {
      id: '2',
      name: 'NFT Collection',
      address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      network: 'Polygon',
      type: 'ERC-721',
      deployedAt: new Date(Date.now() - 86400000 * 12),
      status: 'verified',
      txHash: '0xefgh5678...',
      gasUsed: 2598000,
      totalCost: 2.8,
      verified: true,
    },
    {
      id: '3',
      name: 'Team MultiSig',
      address: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      network: 'Ethereum',
      type: 'Multi-Sig',
      deployedAt: new Date(Date.now() - 86400000 * 1),
      status: 'deployed',
      txHash: '0xijkl9012...',
      gasUsed: 3621000,
      totalCost: 52.3,
      verified: false,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatGas = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);

    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case 'beginner':
        return <Badge variant="secondary">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="outline">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="destructive">Advanced</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'deploying':
        return <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3 animate-spin" />
          Deploying
        </Badge>;
      case 'deployed':
        return <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Deployed
        </Badge>;
      case 'verified':
        return <Badge variant="secondary" className="gap-1">
          <Shield className="h-3 w-3" />
          Verified
        </Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>;
      default:
        return null;
    }
  };

  const totalDeployed = deployedContracts.length;
  const totalGasSpent = deployedContracts.reduce((sum, c) => sum + c.totalCost, 0);
  const verifiedContracts = deployedContracts.filter(c => c.verified).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Smart Contract Deployer
            </CardTitle>
            <CardDescription>
              Deploy audited contracts with one click
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Rocket className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold">{totalDeployed}</p>
            </div>
            <p className="text-xs text-muted-foreground">Deployed</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalGasSpent)}</p>
            <p className="text-xs text-muted-foreground">Gas Spent</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="h-4 w-4 text-green-500" />
              <p className="text-2xl font-bold text-green-600">{verifiedContracts}</p>
            </div>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
        </div>

        {/* Network Selector */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Select Network</h4>
          <div className="flex gap-2 flex-wrap">
            {['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism'].map((network) => (
              <Button
                key={network}
                size="sm"
                variant={deployNetwork === network.toLowerCase() ? 'default' : 'outline'}
                onClick={() => setDeployNetwork(network.toLowerCase())}
              >
                {network}
              </Button>
            ))}
          </div>
        </div>

        {/* Contract Templates */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-semibold">Contract Templates</h4>
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                selectedTemplate === template.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-3xl">{template.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h5 className="font-semibold">{template.name}</h5>
                      {getComplexityBadge(template.complexity)}
                      {template.audited && (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Audited
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      {template.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="text-sm font-medium capitalize">{template.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Est. Gas</p>
                        <p className="text-sm font-medium">{formatGas(template.gasEstimate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Est. Cost</p>
                        <p className="text-sm font-medium text-primary">
                          {formatCurrency((template.gasEstimate * 30) / 1e9)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {selectedTemplate === template.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <Rocket className="h-4 w-4 mr-2" />
                      Deploy Contract
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileCode className="h-4 w-4 mr-2" />
                      View Code
                    </Button>
                    <Button size="sm" variant="outline">
                      Customize
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Deployed Contracts */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Your Deployed Contracts</h4>
          {deployedContracts.map((contract) => (
            <div
              key={contract.id}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h5 className="font-semibold">{contract.name}</h5>
                    {getStatusBadge(contract.status)}
                    <Badge variant="outline">{contract.network}</Badge>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground">Contract Address</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono">{contract.address}</p>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-medium">{contract.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gas Used</p>
                      <p className="text-sm font-medium">{formatGas(contract.gasUsed)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cost</p>
                      <p className="text-sm font-medium text-primary">
                        {formatCurrency(contract.totalCost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deployed</p>
                      <p className="text-sm font-medium">{formatTimeAgo(contract.deployedAt)}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground font-mono">
                    Tx: {contract.txHash}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </Button>
                {!contract.verified && contract.status !== 'deploying' && (
                  <Button size="sm" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Contract
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>

        {deployedContracts.length === 0 && (
          <div className="text-center py-8">
            <Code className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Contracts Deployed</p>
            <p className="text-xs text-muted-foreground mb-4">
              Select a template above to deploy your first contract
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🚀 Deployment Features</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• All templates are audited and battle-tested</li>
            <li>• One-click deployment with customizable parameters</li>
            <li>• Automatic contract verification on Etherscan</li>
            <li>• Multi-chain support (Ethereum, Polygon, BSC, etc.)</li>
            <li>• Gas optimization and cost estimation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

