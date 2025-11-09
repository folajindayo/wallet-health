'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Users,
  Zap,
  DollarSign,
  Settings,
  Check,
  X,
  Clock,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useState } from 'react';

interface Alert {
  id: string;
  type: 'security' | 'price' | 'transaction' | 'governance' | 'whale' | 'gas';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  icon: string;
}

interface AlertRule {
  id: string;
  type: 'price' | 'wallet' | 'gas' | 'governance' | 'security';
  name: string;
  description: string;
  enabled: boolean;
  conditions: string;
  channels: ('push' | 'email' | 'sms' | 'discord')[];
}

interface RealTimeAlertsProps {
  walletAddress: string;
}

export function RealTimeAlerts({ walletAddress }: RealTimeAlertsProps) {
  const [filterType, setFilterType] = useState<'all' | Alert['type']>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Mock alerts
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'security',
      severity: 'critical',
      title: 'Suspicious Approval Detected',
      message: 'Unlimited token approval to unknown contract 0x742d...f44e detected. Revoke immediately.',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      actionRequired: true,
      actionUrl: '/dashboard?tab=approvals',
      icon: '🚨',
    },
    {
      id: '2',
      type: 'price',
      severity: 'high',
      title: 'ETH Price Alert',
      message: 'Ethereum reached your target price of $2,500. Current price: $2,502.50',
      timestamp: new Date(Date.now() - 1800000),
      read: false,
      actionRequired: false,
      icon: '💰',
    },
    {
      id: '3',
      type: 'whale',
      severity: 'medium',
      title: 'Large Transaction Detected',
      message: 'Whale moved 10,000 ETH ($25M) from Binance. Market impact expected.',
      timestamp: new Date(Date.now() - 3600000),
      read: true,
      actionRequired: false,
      icon: '🐋',
    },
    {
      id: '4',
      type: 'transaction',
      severity: 'low',
      title: 'Transaction Confirmed',
      message: 'Your swap of 1 ETH to 2,450 USDC has been confirmed.',
      timestamp: new Date(Date.now() - 7200000),
      read: true,
      actionRequired: false,
      icon: '✅',
    },
    {
      id: '5',
      type: 'governance',
      severity: 'medium',
      title: 'Proposal Ending Soon',
      message: 'Proposal "Increase Treasury Allocation" ends in 6 hours. Cast your vote now.',
      timestamp: new Date(Date.now() - 10800000),
      read: false,
      actionRequired: true,
      actionUrl: '/dashboard?tab=governance',
      icon: '🗳️',
    },
    {
      id: '6',
      type: 'gas',
      severity: 'low',
      title: 'Low Gas Prices',
      message: 'Gas prices dropped to 15 Gwei. Good time for transactions.',
      timestamp: new Date(Date.now() - 14400000),
      read: true,
      actionRequired: false,
      icon: '⛽',
    },
  ];

  // Mock alert rules
  const alertRules: AlertRule[] = [
    {
      id: '1',
      type: 'price',
      name: 'Price Alerts',
      description: 'Get notified when tokens reach target prices',
      enabled: true,
      conditions: 'ETH > $2,500 or < $2,000',
      channels: ['push', 'email'],
    },
    {
      id: '2',
      type: 'wallet',
      name: 'Wallet Activity',
      description: 'Monitor incoming and outgoing transactions',
      enabled: true,
      conditions: 'All transactions > $1,000',
      channels: ['push'],
    },
    {
      id: '3',
      type: 'security',
      name: 'Security Alerts',
      description: 'Critical security events and threats',
      enabled: true,
      conditions: 'Suspicious approvals, phishing attempts',
      channels: ['push', 'email', 'sms'],
    },
    {
      id: '4',
      type: 'gas',
      name: 'Gas Price Alerts',
      description: 'Notify when gas prices are optimal',
      enabled: true,
      conditions: 'Gas < 20 Gwei',
      channels: ['push'],
    },
    {
      id: '5',
      type: 'governance',
      name: 'Governance Updates',
      description: 'DAO proposals and voting deadlines',
      enabled: false,
      conditions: 'All active proposals',
      channels: ['email'],
    },
  ];

  const filteredAlerts = alerts.filter(alert => {
    if (filterType === 'all') return true;
    return alert.type === filterType;
  });

  const unreadCount = alerts.filter(a => !a.read).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.read).length;
  const actionRequiredCount = alerts.filter(a => a.actionRequired && !a.read).length;
  const enabledRules = alertRules.filter(r => r.enabled).length;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="outline">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'price':
        return <TrendingUp className="h-4 w-4" />;
      case 'transaction':
        return <Zap className="h-4 w-4" />;
      case 'governance':
        return <Users className="h-4 w-4" />;
      case 'whale':
        return <DollarSign className="h-4 w-4" />;
      case 'gas':
        return <Zap className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Real-Time Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay informed about important events
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Bell className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold">{unreadCount}</p>
            </div>
            <p className="text-xs text-muted-foreground">Unread</p>
          </div>
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            </div>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              <p className="text-2xl font-bold text-yellow-600">{actionRequiredCount}</p>
            </div>
            <p className="text-xs text-muted-foreground">Action Required</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Check className="h-4 w-4 text-green-500" />
              <p className="text-2xl font-bold text-green-600">{enabledRules}</p>
            </div>
            <p className="text-xs text-muted-foreground">Active Rules</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filterType === 'security' ? 'default' : 'outline'}
            onClick={() => setFilterType('security')}
          >
            Security
          </Button>
          <Button
            size="sm"
            variant={filterType === 'price' ? 'default' : 'outline'}
            onClick={() => setFilterType('price')}
          >
            Price
          </Button>
          <Button
            size="sm"
            variant={filterType === 'transaction' ? 'default' : 'outline'}
            onClick={() => setFilterType('transaction')}
          >
            Transaction
          </Button>
          <Button
            size="sm"
            variant={filterType === 'governance' ? 'default' : 'outline'}
            onClick={() => setFilterType('governance')}
          >
            Governance
          </Button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Recent Alerts</h4>
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost">
                Mark All Read
              </Button>
            )}
          </div>
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border transition-colors ${
                alert.severity === 'critical'
                  ? 'border-red-500/30 bg-red-500/5'
                  : alert.severity === 'high'
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : !alert.read
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border hover:bg-muted/50 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/20'
                    : alert.severity === 'high'
                    ? 'bg-yellow-500/20'
                    : 'bg-primary/20'
                }`}>
                  {getTypeIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h5 className="font-semibold text-sm">{alert.title}</h5>
                        {getSeverityBadge(alert.severity)}
                        {!alert.read && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                        {alert.actionRequired && (
                          <Badge variant="outline" className="text-xs">Action Required</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(alert.timestamp)}</span>
                      </div>
                    </div>
                    <span className="text-2xl">{alert.icon}</span>
                  </div>

                  {alert.actionRequired && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="default">
                        Take Action
                      </Button>
                      <Button size="sm" variant="outline">
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alert Rules Settings */}
        {showSettings && (
          <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
            <h4 className="text-sm font-semibold mb-3">Alert Rules</h4>
            <div className="space-y-3">
              {alertRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-sm">{rule.name}</h5>
                        {rule.enabled ? (
                          <Badge variant="secondary">Enabled</Badge>
                        ) : (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {rule.description}
                      </p>
                      <div className="text-xs">
                        <p className="text-muted-foreground mb-1">Conditions:</p>
                        <p className="font-mono text-xs bg-muted px-2 py-1 rounded mb-2">
                          {rule.conditions}
                        </p>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-muted-foreground">Channels:</span>
                          {rule.channels.map((channel, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {channel === 'push' && <Bell className="h-3 w-3 mr-1" />}
                              {channel === 'email' && <Mail className="h-3 w-3 mr-1" />}
                              {channel === 'sms' && <MessageSquare className="h-3 w-3 mr-1" />}
                              {channel === 'discord' && <MessageSquare className="h-3 w-3 mr-1" />}
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🔔 Alert Features</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Instant push notifications for critical events</li>
            <li>• Multi-channel alerts (Push, Email, SMS, Discord)</li>
            <li>• Customizable alert rules and conditions</li>
            <li>• Priority-based alert severity levels</li>
            <li>• Smart filtering to reduce alert fatigue</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

