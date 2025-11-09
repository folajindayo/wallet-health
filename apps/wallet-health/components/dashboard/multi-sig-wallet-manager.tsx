'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  ExternalLink,
  AlertTriangle,
  Key
} from 'lucide-react';
import { useState } from 'react';

interface Signer {
  address: string;
  name?: string;
  isOwner: boolean;
}

interface PendingTransaction {
  id: string;
  to: string;
  value: string;
  data?: string;
  description: string;
  confirmations: number;
  required: number;
  executed: boolean;
  rejected: boolean;
  createdAt: Date;
  signers: Signer[];
  yourSigned: boolean;
}

interface MultiSigWallet {
  address: string;
  name: string;
  threshold: number;
  owners: number;
  balance: number;
  pendingTxCount: number;
  network: string;
}

interface MultiSigWalletManagerProps {
  walletAddress: string;
}

export function MultiSigWalletManager({ walletAddress }: MultiSigWalletManagerProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Mock multi-sig wallets
  const multiSigWallets: MultiSigWallet[] = [
    {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      name: 'Treasury Wallet',
      threshold: 3,
      owners: 5,
      balance: 250000,
      pendingTxCount: 2,
      network: 'Ethereum',
    },
    {
      address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      name: 'Operations Fund',
      threshold: 2,
      owners: 3,
      balance: 85000,
      pendingTxCount: 1,
      network: 'Ethereum',
    },
  ];

  // Mock pending transactions
  const pendingTransactions: PendingTransaction[] = [
    {
      id: '1',
      to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      value: '10 ETH',
      description: 'Team payment for Q4 2024',
      confirmations: 2,
      required: 3,
      executed: false,
      rejected: false,
      createdAt: new Date(Date.now() - 3600000),
      signers: [
        { address: '0x123...abc', name: 'Alice', isOwner: true },
        { address: '0x456...def', name: 'Bob', isOwner: true },
        { address: '0x789...ghi', name: 'Charlie', isOwner: true },
      ],
      yourSigned: true,
    },
    {
      id: '2',
      to: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      value: '5000 USDC',
      description: 'Marketing budget allocation',
      confirmations: 1,
      required: 3,
      executed: false,
      rejected: false,
      createdAt: new Date(Date.now() - 7200000),
      signers: [
        { address: '0x123...abc', name: 'Alice', isOwner: true },
      ],
      yourSigned: false,
    },
    {
      id: '3',
      to: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
      value: '2.5 ETH',
      description: 'Infrastructure upgrade payment',
      confirmations: 3,
      required: 3,
      executed: true,
      rejected: false,
      createdAt: new Date(Date.now() - 86400000),
      signers: [
        { address: '0x123...abc', name: 'Alice', isOwner: true },
        { address: '0x456...def', name: 'Bob', isOwner: true },
        { address: '0x789...ghi', name: 'Charlie', isOwner: true },
      ],
      yourSigned: true,
    },
  ];

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
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const totalBalance = multiSigWallets.reduce((sum, w) => sum + w.balance, 0);
  const totalPending = multiSigWallets.reduce((sum, w) => sum + w.pendingTxCount, 0);
  const activePending = pendingTransactions.filter(tx => !tx.executed && !tx.rejected).length;
  const needsYourSignature = pendingTransactions.filter(tx => !tx.executed && !tx.yourSigned).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Multi-Sig Wallet Manager
            </CardTitle>
            <CardDescription>
              Manage your multi-signature wallets and pending transactions
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{multiSigWallets.length}</p>
            <p className="text-xs text-muted-foreground">Wallets</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalBalance)}</p>
            <p className="text-xs text-muted-foreground">Total Balance</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <p className="text-2xl font-bold text-yellow-600">{activePending}</p>
            <p className="text-xs text-muted-foreground">Pending Txs</p>
          </div>
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-center">
            <p className="text-2xl font-bold text-red-600">{needsYourSignature}</p>
            <p className="text-xs text-muted-foreground">Need Signature</p>
          </div>
        </div>

        {/* Alert for pending signatures */}
        {needsYourSignature > 0 && (
          <div className="mb-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Action Required</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {needsYourSignature} transaction{needsYourSignature !== 1 ? 's' : ''} waiting for your signature
                </p>
                <Button size="sm" variant="warning">
                  Review Transactions
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Multi-Sig Wallets */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-semibold">Your Multi-Sig Wallets</h4>
          {multiSigWallets.map((wallet) => (
            <div
              key={wallet.address}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setSelectedWallet(wallet.address)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{wallet.name}</h4>
                    <Badge variant="outline">{wallet.network}</Badge>
                    {wallet.pendingTxCount > 0 && (
                      <Badge variant="warning">{wallet.pendingTxCount} pending</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">
                    {wallet.address}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{wallet.threshold} of {wallet.owners} required</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold text-primary">{formatCurrency(wallet.balance)}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Transactions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Pending Transactions</h4>
          {pendingTransactions.map((tx) => (
            <div
              key={tx.id}
              className={`p-4 rounded-lg border transition-colors ${
                tx.executed
                  ? 'border-green-500/30 bg-green-500/5'
                  : tx.rejected
                  ? 'border-red-500/30 bg-red-500/5'
                  : !tx.yourSigned
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold text-sm">{tx.description}</h4>
                    {tx.executed ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Executed
                      </Badge>
                    ) : tx.rejected ? (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Rejected
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                    {!tx.executed && !tx.yourSigned && (
                      <Badge variant="destructive">Your Signature Needed</Badge>
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground">To</p>
                    <p className="text-sm font-mono mb-2">{tx.to}</p>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-lg font-bold text-primary">{tx.value}</p>
                  </div>

                  {/* Confirmation Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Confirmations</span>
                      <span className="font-medium">
                        {tx.confirmations} / {tx.required}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          tx.executed ? 'bg-green-500' : 'bg-primary'
                        }`}
                        style={{ width: `${(tx.confirmations / tx.required) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Signers */}
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-1">Signed by:</p>
                    <div className="flex flex-wrap gap-1">
                      {tx.signers.map((signer, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {signer.name || formatAddress(signer.address)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Created {formatTimeAgo(tx.createdAt)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {!tx.executed && !tx.rejected && (
                <div className="flex gap-2">
                  {!tx.yourSigned ? (
                    <>
                      <Button size="sm" variant="success">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Sign & Approve
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Already Signed
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {pendingTransactions.length === 0 && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Pending Transactions</p>
            <p className="text-xs text-muted-foreground">
              All transactions have been processed
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🔐 Multi-Sig Best Practices</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Verify transaction details carefully before signing</li>
            <li>• Use hardware wallets for owner keys</li>
            <li>• Keep threshold reasonable (not too high or too low)</li>
            <li>• Regularly review pending transactions</li>
            <li>• Communicate with co-signers for coordination</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

