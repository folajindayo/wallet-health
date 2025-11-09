'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users,
  Key,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { useState } from 'react';

interface Guardian {
  id: string;
  address: string;
  name: string;
  email?: string;
  status: 'active' | 'pending' | 'removed';
  addedAt: Date;
  lastActive?: Date;
  trustScore: number;
}

interface RecoveryRequest {
  id: string;
  type: 'recovery' | 'ownership_transfer';
  requestedBy: string;
  newOwner: string;
  approvals: number;
  required: number;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  createdAt: Date;
  expiresAt: Date;
  guardianVotes: Array<{
    guardian: string;
    vote: 'approve' | 'reject';
    timestamp: Date;
  }>;
}

interface SocialRecoveryWalletProps {
  walletAddress: string;
}

export function SocialRecoveryWallet({ walletAddress }: SocialRecoveryWalletProps) {
  const [showAddGuardian, setShowAddGuardian] = useState(false);

  // Mock guardians
  const guardians: Guardian[] = [
    {
      id: '1',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      name: 'Alice (Family)',
      email: 'alice@example.com',
      status: 'active',
      addedAt: new Date(Date.now() - 86400000 * 30),
      lastActive: new Date(Date.now() - 86400000 * 2),
      trustScore: 98,
    },
    {
      id: '2',
      address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      name: 'Bob (Friend)',
      email: 'bob@example.com',
      status: 'active',
      addedAt: new Date(Date.now() - 86400000 * 25),
      lastActive: new Date(Date.now() - 86400000 * 5),
      trustScore: 95,
    },
    {
      id: '3',
      address: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      name: 'Charlie (Colleague)',
      status: 'active',
      addedAt: new Date(Date.now() - 86400000 * 20),
      lastActive: new Date(Date.now() - 86400000 * 10),
      trustScore: 92,
    },
    {
      id: '4',
      address: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
      name: 'Diana (Backup)',
      status: 'pending',
      addedAt: new Date(Date.now() - 86400000 * 2),
      trustScore: 85,
    },
  ];

  // Mock recovery requests
  const recoveryRequests: RecoveryRequest[] = [
    {
      id: '1',
      type: 'recovery',
      requestedBy: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      newOwner: '0x9876543210abcdef...',
      approvals: 2,
      required: 3,
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 12),
      expiresAt: new Date(Date.now() + 3600000 * 36),
      guardianVotes: [
        {
          guardian: 'Alice',
          vote: 'approve',
          timestamp: new Date(Date.now() - 3600000 * 11),
        },
        {
          guardian: 'Bob',
          vote: 'approve',
          timestamp: new Date(Date.now() - 3600000 * 8),
        },
      ],
    },
  ];

  const activeGuardians = guardians.filter(g => g.status === 'active').length;
  const pendingGuardians = guardians.filter(g => g.status === 'pending').length;
  const recoveryThreshold = 3;
  const pendingRecoveries = recoveryRequests.filter(r => r.status === 'pending').length;

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

    if (hours < 24) return `${hours}h remaining`;
    return `${days}d remaining`;
  };

  const getTrustScoreBadge = (score: number) => {
    if (score >= 95) return <Badge variant="secondary">Excellent</Badge>;
    if (score >= 85) return <Badge variant="default">Good</Badge>;
    if (score >= 70) return <Badge variant="outline">Fair</Badge>;
    return <Badge variant="destructive">Low</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Social Recovery Wallet
            </CardTitle>
            <CardDescription>
              Secure wallet recovery with trusted guardians
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowAddGuardian(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Guardian
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold">{activeGuardians}</p>
            </div>
            <p className="text-xs text-muted-foreground">Active Guardians</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Key className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold text-primary">{recoveryThreshold}</p>
            </div>
            <p className="text-xs text-muted-foreground">Threshold</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-600">{pendingGuardians}</p>
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-2xl font-bold text-red-600">{pendingRecoveries}</p>
            </div>
            <p className="text-xs text-muted-foreground">Recoveries</p>
          </div>
        </div>

        {/* Security Status */}
        <div className="mb-6 p-4 rounded-lg border border-green-500/30 bg-green-500/5">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 text-green-600">
                Recovery Protection Active
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Your wallet is protected with {activeGuardians} trusted guardians. 
                {recoveryThreshold} of {activeGuardians} approvals required for recovery.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Threshold
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Recovery Requests */}
        {recoveryRequests.length > 0 && (
          <div className="mb-6 space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Pending Recovery Requests
            </h4>
            {recoveryRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-sm">
                        {request.type === 'recovery' ? 'Wallet Recovery' : 'Ownership Transfer'}
                      </h5>
                      <Badge variant="outline">Pending</Badge>
                    </div>

                    <div className="mb-3 space-y-1">
                      <p className="text-xs text-muted-foreground">Requested by</p>
                      <p className="text-sm font-mono">{formatAddress(request.requestedBy)}</p>
                      <p className="text-xs text-muted-foreground mt-2">New owner address</p>
                      <p className="text-sm font-mono">{request.newOwner}</p>
                    </div>

                    {/* Approval Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Guardian Approvals</span>
                        <span className="font-medium">
                          {request.approvals} / {request.required}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 transition-all"
                          style={{ width: `${(request.approvals / request.required) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Guardian Votes */}
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Votes:</p>
                      <div className="flex flex-wrap gap-1">
                        {request.guardianVotes.map((vote, index) => (
                          <Badge
                            key={index}
                            variant={vote.vote === 'approve' ? 'success' : 'destructive'}
                            className="text-xs"
                          >
                            {vote.guardian}: {vote.vote}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Created {formatTimeAgo(request.createdAt)} • 
                      {' '}{formatTimeUntil(request.expiresAt)}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 mb-3">
                  <p className="text-xs text-red-600 font-medium">
                    ⚠️ If you didn't initiate this request, immediately reject it and review your guardians!
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Request
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guardians List */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Your Guardians</h4>
          {guardians.map((guardian) => (
            <div
              key={guardian.id}
              className={`p-4 rounded-lg border transition-colors ${
                guardian.status === 'active'
                  ? 'border-border hover:bg-muted/50'
                  : guardian.status === 'pending'
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-red-500/30 bg-red-500/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h5 className="font-semibold">{guardian.name}</h5>
                    {guardian.status === 'active' ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : guardian.status === 'pending' ? (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Removed
                      </Badge>
                    )}
                    {getTrustScoreBadge(guardian.trustScore)}
                  </div>

                  <p className="text-xs text-muted-foreground font-mono mb-2">
                    {guardian.address}
                  </p>

                  {guardian.email && (
                    <p className="text-xs text-muted-foreground mb-2">
                      📧 {guardian.email}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Added {formatTimeAgo(guardian.addedAt)}</span>
                    {guardian.lastActive && (
                      <span>Last active {formatTimeAgo(guardian.lastActive)}</span>
                    )}
                    <span>Trust: {guardian.trustScore}%</span>
                  </div>
                </div>

                {guardian.status !== 'removed' && (
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {guardians.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Guardians Added</p>
            <p className="text-xs text-muted-foreground mb-4">
              Add trusted contacts to enable wallet recovery
            </p>
            <Button onClick={() => setShowAddGuardian(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Guardian
            </Button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🛡️ Social Recovery Benefits</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Recover access if you lose your private keys</li>
            <li>• No single point of failure - distributed trust</li>
            <li>• Guardians can't steal funds - only help recover</li>
            <li>• Choose family, friends, or hardware wallets</li>
            <li>• Update guardians anytime to maintain security</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

