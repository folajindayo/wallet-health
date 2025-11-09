'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Shield,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';

interface AuditEntry {
  id: string;
  timestamp: Date;
  type: 'scan' | 'approval' | 'revoke' | 'setting' | 'export' | 'alert';
  severity: 'info' | 'warning' | 'error' | 'success';
  action: string;
  details: string;
  user?: string;
  metadata?: Record<string, any>;
}

interface AuditLogProps {
  entries?: AuditEntry[];
  walletAddress: string;
}

export function AuditLog({ entries = [], walletAddress }: AuditLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock audit entries if none provided
  const mockEntries: AuditEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000),
      type: 'scan',
      severity: 'success',
      action: 'Security Scan Completed',
      details: 'Full wallet security scan completed with score 92/100',
      metadata: { score: 92, riskLevel: 'low' },
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 7200000),
      type: 'alert',
      severity: 'warning',
      action: 'High Risk Approval Detected',
      details: 'Unlimited USDT approval to unverified contract detected',
      metadata: { token: 'USDT', spender: '0x742d...3f8a' },
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 10800000),
      type: 'revoke',
      severity: 'success',
      action: 'Token Approval Revoked',
      details: 'Successfully revoked unlimited DAI approval',
      metadata: { token: 'DAI', spender: 'Uniswap V2' },
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 14400000),
      type: 'setting',
      severity: 'info',
      action: 'Settings Updated',
      details: 'Notification preferences updated',
      metadata: { changes: ['notifications.riskAlerts', 'privacy.hideSpam'] },
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 18000000),
      type: 'export',
      severity: 'info',
      action: 'Report Exported',
      details: 'Wallet health report exported as CSV',
      metadata: { format: 'csv', size: '45KB' },
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 86400000),
      type: 'scan',
      severity: 'success',
      action: 'Scheduled Scan Executed',
      details: 'Automatic daily scan completed successfully',
      metadata: { score: 90, riskLevel: 'low' },
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 172800000),
      type: 'alert',
      severity: 'error',
      action: 'Phishing Attempt Blocked',
      details: 'Malicious signature request from suspicious dApp blocked',
      metadata: { domain: 'unisvvap-fi.xyz', threat: 'phishing' },
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 259200000),
      type: 'approval',
      severity: 'warning',
      action: 'New Approval Created',
      details: 'New token approval granted to Aave protocol',
      metadata: { token: 'USDC', amount: '1000', spender: 'Aave' },
    },
  ];

  const displayEntries = entries.length > 0 ? entries : mockEntries;

  const filteredEntries = displayEntries.filter(entry => {
    const matchesSearch = entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || entry.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getIcon = (type: string, severity: string) => {
    if (severity === 'error') return <XCircle className="h-5 w-5 text-red-500" />;
    if (severity === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (severity === 'success') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    
    switch (type) {
      case 'scan':
        return <Shield className="h-5 w-5 text-blue-500" />;
      case 'approval':
      case 'revoke':
        return <RefreshCw className="h-5 w-5 text-purple-500" />;
      case 'export':
        return <Download className="h-5 w-5 text-gray-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'success':
        return <Badge variant="success">Success</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      scan: 'Scan',
      approval: 'Approval',
      revoke: 'Revoke',
      setting: 'Settings',
      export: 'Export',
      alert: 'Alert',
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = () => {
    const csv = [
      'Timestamp,Type,Severity,Action,Details',
      ...filteredEntries.map(entry => 
        `"${entry.timestamp.toISOString()}","${entry.type}","${entry.severity}","${entry.action}","${entry.details}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${walletAddress.slice(0, 8)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: displayEntries.length,
    errors: displayEntries.filter(e => e.severity === 'error').length,
    warnings: displayEntries.filter(e => e.severity === 'warning').length,
    success: displayEntries.filter(e => e.severity === 'success').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Log
            </CardTitle>
            <CardDescription>
              Complete history of wallet activities and security events
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Log
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-center">
            <p className="text-xl font-bold text-red-600">{stats.errors}</p>
            <p className="text-xs text-muted-foreground">Errors</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <p className="text-xl font-bold text-yellow-600">{stats.warnings}</p>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-xl font-bold text-green-600">{stats.success}</p>
            <p className="text-xs text-muted-foreground">Success</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audit log..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterType === 'scan' ? 'default' : 'outline'}
              onClick={() => setFilterType('scan')}
            >
              Scans
            </Button>
            <Button
              size="sm"
              variant={filterType === 'alert' ? 'default' : 'outline'}
              onClick={() => setFilterType('alert')}
            >
              Alerts
            </Button>
          </div>
        </div>

        {/* Audit Entries */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(entry.type, entry.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold text-sm">{entry.action}</h4>
                    {getSeverityBadge(entry.severity)}
                    {getTypeBadge(entry.type)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {entry.details}
                  </p>
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <div className="p-2 rounded bg-muted/50 mb-2">
                      <p className="text-xs font-mono">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(entry.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No audit entries found
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

