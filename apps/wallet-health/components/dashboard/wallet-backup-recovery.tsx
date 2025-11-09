'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Download,
  Upload,
  Lock,
  Unlock,
  Key,
  FileText,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Cloud,
  HardDrive,
  Smartphone,
  Mail,
  QrCode,
  RefreshCw,
  Archive
} from 'lucide-react';
import { useState } from 'react';

interface BackupMethod {
  id: string;
  name: string;
  type: 'seed' | 'keystore' | 'private-key' | 'hardware' | 'cloud' | 'social';
  icon: any;
  description: string;
  security: 'high' | 'medium' | 'low';
  lastBackup?: Date;
  status: 'active' | 'pending' | 'expired';
  encrypted: boolean;
}

interface RecoveryOption {
  id: string;
  method: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
  requirements: string[];
  recommended: boolean;
}

interface WalletBackupRecoveryProps {
  walletAddress: string;
}

export function WalletBackupRecovery({ walletAddress }: WalletBackupRecoveryProps) {
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Mock backup methods
  const backupMethods: BackupMethod[] = [
    {
      id: '1',
      name: 'Seed Phrase (12-word)',
      type: 'seed',
      icon: Key,
      description: 'Most common recovery method',
      security: 'high',
      lastBackup: new Date(Date.now() - 86400000 * 30),
      status: 'active',
      encrypted: true,
    },
    {
      id: '2',
      name: 'Encrypted Keystore File',
      type: 'keystore',
      icon: FileText,
      description: 'JSON file protected by password',
      security: 'high',
      lastBackup: new Date(Date.now() - 86400000 * 15),
      status: 'active',
      encrypted: true,
    },
    {
      id: '3',
      name: 'Private Key',
      type: 'private-key',
      icon: Lock,
      description: 'Direct access key',
      security: 'medium',
      status: 'pending',
      encrypted: false,
    },
    {
      id: '4',
      name: 'Hardware Wallet',
      type: 'hardware',
      icon: Smartphone,
      description: 'Ledger/Trezor backup',
      security: 'high',
      lastBackup: new Date(Date.now() - 86400000 * 60),
      status: 'active',
      encrypted: true,
    },
    {
      id: '5',
      name: 'Cloud Backup',
      type: 'cloud',
      icon: Cloud,
      description: 'Encrypted cloud storage',
      security: 'medium',
      lastBackup: new Date(Date.now() - 86400000 * 7),
      status: 'active',
      encrypted: true,
    },
    {
      id: '6',
      name: 'Social Recovery',
      type: 'social',
      icon: Mail,
      description: 'Guardian-based recovery',
      security: 'high',
      status: 'active',
      encrypted: true,
    },
  ];

  // Mock recovery options
  const recoveryOptions: RecoveryOption[] = [
    {
      id: '1',
      method: 'Seed Phrase Recovery',
      difficulty: 'easy',
      timeEstimate: '5 minutes',
      requirements: ['12 or 24-word seed phrase', 'Wallet derivation path'],
      recommended: true,
    },
    {
      id: '2',
      method: 'Keystore File + Password',
      difficulty: 'easy',
      timeEstimate: '2 minutes',
      requirements: ['JSON keystore file', 'Decryption password'],
      recommended: true,
    },
    {
      id: '3',
      method: 'Private Key Import',
      difficulty: 'medium',
      timeEstimate: '3 minutes',
      requirements: ['64-character private key', 'Secure environment'],
      recommended: false,
    },
    {
      id: '4',
      method: 'Hardware Wallet Restore',
      difficulty: 'easy',
      timeEstimate: '10 minutes',
      requirements: ['Hardware device', 'PIN code', 'Recovery seed'],
      recommended: true,
    },
    {
      id: '5',
      method: 'Social Recovery',
      difficulty: 'medium',
      timeEstimate: '24-48 hours',
      requirements: ['Guardian approvals (3/5)', 'Identity verification'],
      recommended: true,
    },
  ];

  // Mock seed phrase (NEVER expose real seed phrases!)
  const mockSeedPhrase = [
    'abandon', 'ability', 'able', 'about',
    'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident'
  ];

  const mockPrivateKey = '0x' + '•'.repeat(64);

  const activeBackups = backupMethods.filter(m => m.status === 'active').length;
  const encryptedBackups = backupMethods.filter(m => m.encrypted).length;
  const lastBackupDate = backupMethods
    .filter(m => m.lastBackup)
    .sort((a, b) => (b.lastBackup?.getTime() || 0) - (a.lastBackup?.getTime() || 0))[0]?.lastBackup;

  const getSecurityColor = (security: string) => {
    switch (security) {
      case 'high':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSecurityBadge = (security: string) => {
    const colors = {
      high: 'success',
      medium: 'warning',
      low: 'destructive',
    };
    return (
      <Badge variant={colors[security as keyof typeof colors] as any} className="capitalize">
        {security} Security
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return null;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'success',
      medium: 'warning',
      hard: 'destructive',
    };
    return (
      <Badge variant={colors[difficulty as keyof typeof colors] as any} className="capitalize">
        {difficulty}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const handleCopy = (text: string, item: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleBackupDownload = (method: string) => {
    // Mock download functionality
    console.log(`Downloading ${method} backup...`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Wallet Backup & Recovery
            </CardTitle>
            <CardDescription>
              Secure your wallet with multiple backup methods
            </CardDescription>
          </div>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Backup Now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Security Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-green-500" />
              <p className="text-2xl font-bold text-green-500">{activeBackups}</p>
            </div>
            <p className="text-xs text-muted-foreground">Active Backups</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Lock className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">{encryptedBackups}</p>
            </div>
            <p className="text-xs text-muted-foreground">Encrypted</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Last Backup</p>
            <p className="text-sm font-bold">
              {lastBackupDate ? formatDate(lastBackupDate) : 'Never'}
            </p>
          </div>
        </div>

        {/* Security Warning */}
        <div className="mb-6 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold mb-1">Important Security Notice</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Never share your seed phrase or private key with anyone</li>
                <li>• Store backups in multiple secure locations</li>
                <li>• Use encrypted storage for digital backups</li>
                <li>• Test recovery process regularly</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Backup Methods */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-semibold">Backup Methods</h4>
          {backupMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <div
                key={method.id}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg bg-primary/10 ${getSecurityColor(method.security)}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h5 className="font-semibold">{method.name}</h5>
                        {getStatusBadge(method.status)}
                        {getSecurityBadge(method.security)}
                        {method.encrypted && (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Encrypted
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {method.description}
                      </p>
                      {method.lastBackup && (
                        <p className="text-xs text-muted-foreground">
                          Last backup: {formatDate(method.lastBackup)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Backup
                  </Button>
                  {method.type === 'seed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                    >
                      {showSeedPhrase ? (
                        <><EyeOff className="h-4 w-4 mr-2" />Hide</>
                      ) : (
                        <><Eye className="h-4 w-4 mr-2" />View</>
                      )}
                    </Button>
                  )}
                  {method.type === 'private-key' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? (
                        <><EyeOff className="h-4 w-4 mr-2" />Hide</>
                      ) : (
                        <><Eye className="h-4 w-4 mr-2" />View</>
                      )}
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Seed Phrase Display */}
        {showSeedPhrase && (
          <div className="mb-6 p-4 rounded-lg border-2 border-red-500/30 bg-red-500/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Your Seed Phrase (Keep Secret!)
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(mockSeedPhrase.join(' '), 'seed')}
              >
                {copiedItem === 'seed' ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2" />Copied</>
                ) : (
                  <><Copy className="h-4 w-4 mr-2" />Copy</>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-3">
              {mockSeedPhrase.map((word, index) => (
                <div
                  key={index}
                  className="p-2 rounded bg-card border border-border text-center"
                >
                  <span className="text-xs text-muted-foreground mr-1">{index + 1}.</span>
                  <span className="text-sm font-mono font-semibold">{word}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-red-400">
              ⚠️ Write this down and store it in a secure location. Never share it online.
            </p>
          </div>
        )}

        {/* Private Key Display */}
        {showPrivateKey && (
          <div className="mb-6 p-4 rounded-lg border-2 border-red-500/30 bg-red-500/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Your Private Key (Keep Secret!)
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(mockPrivateKey, 'key')}
              >
                {copiedItem === 'key' ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2" />Copied</>
                ) : (
                  <><Copy className="h-4 w-4 mr-2" />Copy</>
                )}
              </Button>
            </div>
            <div className="p-3 rounded bg-card border border-border font-mono text-sm break-all mb-3">
              {mockPrivateKey}
            </div>
            <p className="text-xs text-red-400">
              ⚠️ Anyone with this key has full access to your wallet. Never share it.
            </p>
          </div>
        )}

        {/* Recovery Options */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-semibold">Recovery Options</h4>
          {recoveryOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 rounded-lg border transition-colors ${
                option.recommended
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h5 className="font-semibold">{option.method}</h5>
                    {getDifficultyBadge(option.difficulty)}
                    {option.recommended && (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Estimated time: {option.timeEstimate}
                  </p>
                  <div className="mb-2">
                    <p className="text-xs font-semibold mb-1">Requirements:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {option.requirements.map((req, index) => (
                        <li key={index}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Start Recovery
              </Button>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <Button variant="outline" className="justify-start">
            <Archive className="h-4 w-4 mr-2" />
            Export All Backups
          </Button>
          <Button variant="outline" className="justify-start">
            <RefreshCw className="h-4 w-4 mr-2" />
            Test Recovery Process
          </Button>
          <Button variant="outline" className="justify-start">
            <HardDrive className="h-4 w-4 mr-2" />
            Create Hardware Backup
          </Button>
          <Button variant="outline" className="justify-start">
            <Mail className="h-4 w-4 mr-2" />
            Setup Email Recovery
          </Button>
        </div>

        {/* Best Practices */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🔐 Backup Best Practices</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use at least 3 different backup methods</li>
            <li>• Store backups in multiple physical locations</li>
            <li>• Test recovery process at least once a year</li>
            <li>• Use encrypted storage for digital backups</li>
            <li>• Consider hardware wallets for large amounts</li>
            <li>• Setup social recovery for added security</li>
            <li>• Never take photos or screenshots of seeds</li>
            <li>• Use metal plates for permanent seed storage</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

