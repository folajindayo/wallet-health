'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Code,
  Lock,
  Unlock,
  Bug,
  FileText,
  Clock,
  Users,
  Activity,
  Zap,
  Target,
  AlertCircle,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useState } from 'react';

interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  description: string;
  recommendation: string;
  cwe?: string;
}

interface ContractScanResult {
  address: string;
  name: string;
  verified: boolean;
  openSource: boolean;
  auditScore: number; // 0-100
  deploymentDate: Date;
  transactionCount: number;
  uniqueUsers: number;
  issues: SecurityIssue[];
  audits: {
    company: string;
    date: Date;
    report: string;
  }[];
  securityFeatures: {
    name: string;
    implemented: boolean;
    description: string;
  }[];
}

interface SmartContractSecurityScannerProps {
  walletAddress: string;
}

export function SmartContractSecurityScanner({ walletAddress }: SmartContractSecurityScannerProps) {
  const [contractAddress, setContractAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ContractScanResult | null>(null);

  // Mock scan result
  const mockScanResult: ContractScanResult = {
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    name: 'Uniswap (UNI)',
    verified: true,
    openSource: true,
    auditScore: 92,
    deploymentDate: new Date('2020-09-17'),
    transactionCount: 15234567,
    uniqueUsers: 234567,
    issues: [
      {
        severity: 'low',
        category: 'Access Control',
        description: 'Owner privileges detected in token contract',
        recommendation: 'Consider implementing multi-sig or timelock for admin functions',
        cwe: 'CWE-284',
      },
      {
        severity: 'info',
        category: 'Gas Optimization',
        description: 'Potential gas optimization in loop operations',
        recommendation: 'Cache array length in loops to save gas',
      },
      {
        severity: 'medium',
        category: 'Reentrancy',
        description: 'External call before state update detected',
        recommendation: 'Follow checks-effects-interactions pattern',
        cwe: 'CWE-841',
      },
    ],
    audits: [
      {
        company: 'Trail of Bits',
        date: new Date('2020-08-15'),
        report: 'https://example.com/audit-report.pdf',
      },
      {
        company: 'ConsenSys Diligence',
        date: new Date('2020-09-01'),
        report: 'https://example.com/audit-report-2.pdf',
      },
    ],
    securityFeatures: [
      { name: 'Access Control', implemented: true, description: 'Role-based access control implemented' },
      { name: 'Reentrancy Guard', implemented: true, description: 'Protected against reentrancy attacks' },
      { name: 'Pausable', implemented: true, description: 'Emergency pause functionality' },
      { name: 'Upgradeable', implemented: false, description: 'Immutable contract design' },
      { name: 'Rate Limiting', implemented: false, description: 'No transaction rate limits' },
      { name: 'Oracle Protection', implemented: true, description: 'Chainlink oracle integration' },
    ],
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setScanResult(mockScanResult);
      setIsScanning(false);
    }, 2000);
  };

  const getSeverityBadge = (severity: string) => {
    const config = {
      critical: { variant: 'destructive' as const, label: 'Critical', icon: AlertTriangle },
      high: { variant: 'destructive' as const, label: 'High', icon: XCircle },
      medium: { variant: 'default' as const, label: 'Medium', icon: AlertCircle },
      low: { variant: 'secondary' as const, label: 'Low', icon: Eye },
      info: { variant: 'outline' as const, label: 'Info', icon: FileText },
    };

    const { variant, label, icon: Icon } = config[severity as keyof typeof config];
    
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', variant: 'secondary' as const };
    if (score >= 70) return { label: 'Good', variant: 'default' as const };
    if (score >= 50) return { label: 'Fair', variant: 'default' as const };
    return { label: 'Poor', variant: 'destructive' as const };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Smart Contract Security Scanner
            </CardTitle>
            <CardDescription>
              Analyze smart contracts for security vulnerabilities
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter contract address (0x...)"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleScan} disabled={isScanning}>
            {isScanning ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Scan
              </>
            )}
          </Button>
        </div>

        {!scanResult ? (
          <div className="p-12 text-center border border-dashed border-border rounded-lg">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Contract Scanned</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a contract address above to start the security analysis
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline">Vulnerability Detection</Badge>
              <Badge variant="outline">Audit History</Badge>
              <Badge variant="outline">Best Practices</Badge>
              <Badge variant="outline">Risk Assessment</Badge>
            </div>
          </div>
        ) : (
          <>
            {/* Contract Info Header */}
            <div className="p-4 rounded-lg border border-border bg-card/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{scanResult.name}</h3>
                    {scanResult.verified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Verified
                      </Badge>
                    )}
                    {scanResult.openSource && (
                      <Badge variant="outline" className="gap-1">
                        <Code className="h-3 w-3" />
                        Open Source
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {scanResult.address}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Etherscan
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Deployed</p>
                  <p className="text-sm font-semibold">
                    {scanResult.deploymentDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Transactions</p>
                  <p className="text-sm font-semibold">
                    {(scanResult.transactionCount / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Unique Users</p>
                  <p className="text-sm font-semibold">
                    {(scanResult.uniqueUsers / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Audits</p>
                  <p className="text-sm font-semibold">{scanResult.audits.length} Reports</p>
                </div>
              </div>
            </div>

            {/* Security Score */}
            <div className="p-6 rounded-lg border border-border bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Overall Security Score</h4>
                  <Badge {...getScoreBadge(scanResult.auditScore)} />
                </div>
                <div className="text-right">
                  <p className={`text-5xl font-bold ${getScoreColor(scanResult.auditScore)}`}>
                    {scanResult.auditScore}
                  </p>
                  <p className="text-xs text-muted-foreground">out of 100</p>
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    scanResult.auditScore >= 90
                      ? 'bg-emerald-500'
                      : scanResult.auditScore >= 70
                      ? 'bg-blue-500'
                      : scanResult.auditScore >= 50
                      ? 'bg-amber-500'
                      : 'bg-destructive'
                  }`}
                  style={{ width: `${scanResult.auditScore}%` }}
                />
              </div>
            </div>

            {/* Security Issues */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Bug className="h-4 w-4 text-primary" />
                  Security Issues Found
                </h4>
                <Badge variant="outline">{scanResult.issues.length} Issues</Badge>
              </div>

              <div className="space-y-3">
                {scanResult.issues.map((issue, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-card/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(issue.severity)}
                        <span className="text-sm font-semibold">{issue.category}</span>
                      </div>
                      {issue.cwe && (
                        <Badge variant="outline" className="text-xs">
                          {issue.cwe}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                    <div className="p-3 rounded-md bg-muted/50">
                      <p className="text-xs font-medium mb-1">💡 Recommendation:</p>
                      <p className="text-xs text-muted-foreground">{issue.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Features */}
            <div>
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Security Features
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {scanResult.securityFeatures.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      feature.implemented
                        ? 'border-emerald-500/20 bg-emerald-500/10'
                        : 'border-border bg-card/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-semibold">{feature.name}</span>
                      {feature.implemented ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit History */}
            <div>
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Audit History
              </h4>
              <div className="space-y-3">
                {scanResult.audits.map((audit, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-card/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{audit.company}</p>
                        <p className="text-xs text-muted-foreground">
                          {audit.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <FileText className="h-3 w-3 mr-2" />
                      View Report
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border text-center">
                <AlertTriangle className="h-8 w-8 mx-auto text-destructive mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Critical Issues</p>
                <p className="text-2xl font-bold">
                  {scanResult.issues.filter(i => i.severity === 'critical').length}
                </p>
              </div>

              <div className="p-4 rounded-lg border border-border text-center">
                <Clock className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Contract Age</p>
                <p className="text-2xl font-bold">
                  {Math.floor((Date.now() - scanResult.deploymentDate.getTime()) / (365 * 24 * 60 * 60 * 1000))}y
                </p>
              </div>

              <div className="p-4 rounded-lg border border-border text-center">
                <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Trust Score</p>
                <p className="text-2xl font-bold">
                  {Math.min(100, Math.floor(scanResult.uniqueUsers / 2500))}%
                </p>
              </div>
            </div>

            {/* Overall Assessment */}
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold mb-2">Overall Assessment</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    This contract has been professionally audited and shows strong security practices.
                    The code is verified and open source, with {scanResult.uniqueUsers.toLocaleString()} unique users
                    and {(scanResult.transactionCount / 1000000).toFixed(1)}M transactions, indicating high community trust.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified Contract
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Multiple Audits
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      High Activity
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

