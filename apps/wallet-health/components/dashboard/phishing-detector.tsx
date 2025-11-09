'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Search,
  ExternalLink,
  XCircle
} from 'lucide-react';
import { useState } from 'react';

interface PhishingAlert {
  type: 'transaction' | 'signature' | 'connection' | 'url';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  detected: Date;
  indicators: string[];
  recommendation: string;
}

interface PhishingDetectorProps {
  alerts?: PhishingAlert[];
  onCheckUrl?: (url: string) => void;
}

export function PhishingDetector({ alerts = [], onCheckUrl }: PhishingDetectorProps) {
  const [urlToCheck, setUrlToCheck] = useState('');
  const [checkResult, setCheckResult] = useState<'safe' | 'suspicious' | 'malicious' | null>(null);

  // Mock alerts if none provided
  const mockAlerts: PhishingAlert[] = [
    {
      type: 'transaction',
      severity: 'critical',
      title: 'Suspicious Token Approval Request',
      description: 'A contract attempted to request unlimited approval for your USDT tokens.',
      detected: new Date(Date.now() - 3600000),
      indicators: [
        'Unverified contract',
        'Unlimited approval amount',
        'Recently deployed (< 7 days)',
        'No verified source code',
      ],
      recommendation: 'Do not approve this transaction. The contract shows multiple red flags.',
    },
    {
      type: 'signature',
      severity: 'high',
      title: 'Blind Signature Request Detected',
      description: 'You were asked to sign a message with unclear contents.',
      detected: new Date(Date.now() - 7200000),
      indicators: [
        'Hidden message content',
        'Requesting wallet control',
        'Domain not matching dApp',
      ],
      recommendation: 'Never sign messages you cannot read or understand.',
    },
    {
      type: 'url',
      severity: 'medium',
      title: 'Suspicious Domain Detected',
      description: 'You visited a domain similar to a known DeFi protocol.',
      detected: new Date(Date.now() - 86400000),
      indicators: [
        'Typosquatting detected',
        'Recently registered domain',
        'No SSL certificate',
      ],
      recommendation: 'Verify the official URL before connecting your wallet.',
    },
  ];

  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts;

  const handleCheckUrl = () => {
    if (!urlToCheck) return;

    // Simulate URL check
    const suspiciousPatterns = ['unisvvap', 'opensae', 'metmask', 'pancakesvvap'];
    const maliciousPatterns = ['free-airdrop', 'claim-eth', 'urgent-verify'];

    const lowerUrl = urlToCheck.toLowerCase();
    
    if (maliciousPatterns.some(pattern => lowerUrl.includes(pattern))) {
      setCheckResult('malicious');
    } else if (suspiciousPatterns.some(pattern => lowerUrl.includes(pattern))) {
      setCheckResult('suspicious');
    } else {
      setCheckResult('safe');
    }

    onCheckUrl?.(urlToCheck);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      transaction: 'Transaction',
      signature: 'Signature',
      connection: 'Connection',
      url: 'URL',
    };
    return <Badge variant="outline">{styles[type]}</Badge>;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const criticalCount = displayAlerts.filter(a => a.severity === 'critical').length;
  const highCount = displayAlerts.filter(a => a.severity === 'high').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Phishing & Scam Detector
        </CardTitle>
        <CardDescription>
          Real-time protection against phishing attempts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* URL Checker */}
        <div className="mb-6 p-4 rounded-lg border border-border bg-card">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Check URL Safety
          </h4>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Enter URL to check (e.g., https://example.com)"
              value={urlToCheck}
              onChange={(e) => {
                setUrlToCheck(e.target.value);
                setCheckResult(null);
              }}
            />
            <Button onClick={handleCheckUrl}>
              Check
            </Button>
          </div>
          {checkResult && (
            <div className={`p-3 rounded-lg border ${
              checkResult === 'safe' 
                ? 'border-green-500/30 bg-green-500/5' 
                : checkResult === 'suspicious'
                ? 'border-yellow-500/30 bg-yellow-500/5'
                : 'border-red-500/30 bg-red-500/5'
            }`}>
              <div className="flex items-start gap-2">
                {checkResult === 'safe' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : checkResult === 'suspicious' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-sm mb-1">
                    {checkResult === 'safe' 
                      ? 'URL appears safe' 
                      : checkResult === 'suspicious'
                      ? 'Suspicious URL detected'
                      : 'Malicious URL detected'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {checkResult === 'safe' 
                      ? 'No known threats detected. Always verify official URLs.' 
                      : checkResult === 'suspicious'
                      ? 'This URL shows suspicious patterns. Verify before proceeding.'
                      : 'This URL is flagged as malicious. Do NOT connect your wallet.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alert Stats */}
        {displayAlerts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-center">
              <p className="text-2xl font-bold text-red-600">{criticalCount + highCount}</p>
              <p className="text-xs text-muted-foreground">Critical/High Alerts</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold">{displayAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Total Threats Blocked</p>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Recent Threats</h4>
          {displayAlerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                alert.severity === 'critical' || alert.severity === 'high'
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-yellow-500/30 bg-yellow-500/5'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                  alert.severity === 'critical' || alert.severity === 'high'
                    ? 'text-red-500'
                    : 'text-yellow-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                    {getSeverityBadge(alert.severity)}
                    {getTypeBadge(alert.type)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {alert.description}
                  </p>
                  <div className="mb-3">
                    <p className="text-xs font-semibold mb-2">Red Flags:</p>
                    <ul className="space-y-1">
                      {alert.indicators.map((indicator, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          <span>{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-border">
                    <p className="text-xs">
                      <span className="font-semibold">Recommendation:</span> {alert.recommendation}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Detected {formatTimestamp(alert.detected)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayAlerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">All Clear!</p>
            <p className="text-xs text-muted-foreground">
              No phishing attempts detected
            </p>
          </div>
        )}

        {/* Safety Tips */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🛡️ Safety Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Always verify URLs before connecting your wallet</li>
            <li>• Never approve unlimited token spending</li>
            <li>• Don't sign messages you can't read</li>
            <li>• Be cautious of "urgent" requests or offers</li>
            <li>• Use hardware wallets for high-value transactions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

