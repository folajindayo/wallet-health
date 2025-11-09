'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  DollarSign,
  Activity,
  Target,
  Zap,
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  Twitter,
  Webhook,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Settings,
  Filter,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: 'price' | 'balance' | 'transaction' | 'security' | 'governance' | 'gas' | 'defi';
  condition: string;
  threshold: string;
  channels: ('email' | 'sms' | 'push' | 'discord' | 'telegram' | 'twitter' | 'webhook')[];
  frequency: 'instant' | 'hourly' | 'daily';
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  triggered: number;
  lastTriggered?: Date;
  icon: any;
  color: string;
}

interface AlertHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
}

interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'discord' | 'telegram' | 'twitter' | 'webhook';
  label: string;
  icon: any;
  connected: boolean;
  enabled: boolean;
}

interface SmartAlertAutomationProps {
  walletAddress: string;
}

export function SmartAlertAutomation({ walletAddress }: SmartAlertAutomationProps) {
  const [filterType, setFilterType] = useState<'all' | AlertRule['type']>('all');
  const [showHistory, setShowHistory] = useState(false);

  // Mock notification channels
  const channels: NotificationChannel[] = [
    {
      type: 'email',
      label: 'Email',
      icon: Mail,
      connected: true,
      enabled: true,
    },
    {
      type: 'push',
      label: 'Push Notification',
      icon: Bell,
      connected: true,
      enabled: true,
    },
    {
      type: 'sms',
      label: 'SMS',
      icon: Smartphone,
      connected: false,
      enabled: false,
    },
    {
      type: 'discord',
      label: 'Discord',
      icon: MessageSquare,
      connected: true,
      enabled: true,
    },
    {
      type: 'telegram',
      label: 'Telegram',
      icon: MessageSquare,
      connected: true,
      enabled: false,
    },
    {
      type: 'twitter',
      label: 'Twitter DM',
      icon: Twitter,
      connected: false,
      enabled: false,
    },
    {
      type: 'webhook',
      label: 'Custom Webhook',
      icon: Webhook,
      connected: true,
      enabled: true,
    },
  ];

  // Mock alert rules
  const alertRules: AlertRule[] = [
    {
      id: '1',
      name: 'ETH Price Alert',
      description: 'Alert when ETH drops below $2,000',
      type: 'price',
      condition: 'ETH price < $2,000',
      threshold: '$2,000',
      channels: ['email', 'push', 'discord'],
      frequency: 'instant',
      priority: 'high',
      enabled: true,
      triggered: 3,
      lastTriggered: new Date(Date.now() - 86400000 * 2),
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      id: '2',
      name: 'Portfolio Value Milestone',
      description: 'Alert when portfolio exceeds $150,000',
      type: 'balance',
      condition: 'Portfolio value > $150,000',
      threshold: '$150,000',
      channels: ['email', 'push', 'twitter'],
      frequency: 'instant',
      priority: 'medium',
      enabled: true,
      triggered: 0,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      id: '3',
      name: 'Large Transaction Detected',
      description: 'Alert on transactions over $10,000',
      type: 'transaction',
      condition: 'Transaction amount > $10,000',
      threshold: '$10,000',
      channels: ['email', 'push', 'sms', 'discord'],
      frequency: 'instant',
      priority: 'critical',
      enabled: true,
      triggered: 5,
      lastTriggered: new Date(Date.now() - 86400000 * 1),
      icon: Activity,
      color: 'text-yellow-500',
    },
    {
      id: '4',
      name: 'Security Score Drop',
      description: 'Alert when security score falls below 80',
      type: 'security',
      condition: 'Security score < 80',
      threshold: '80',
      channels: ['email', 'push', 'discord', 'telegram'],
      frequency: 'instant',
      priority: 'critical',
      enabled: true,
      triggered: 1,
      lastTriggered: new Date(Date.now() - 86400000 * 15),
      icon: Shield,
      color: 'text-red-500',
    },
    {
      id: '5',
      name: 'New Governance Proposal',
      description: 'Alert for new proposals in protocols you hold',
      type: 'governance',
      condition: 'New proposal in Uniswap, Compound, Aave',
      threshold: 'Any',
      channels: ['email', 'discord'],
      frequency: 'hourly',
      priority: 'medium',
      enabled: true,
      triggered: 12,
      lastTriggered: new Date(Date.now() - 86400000 * 3),
      icon: Target,
      color: 'text-blue-500',
    },
    {
      id: '6',
      name: 'Gas Price Drop',
      description: 'Alert when gas price drops below 15 GWEI',
      type: 'gas',
      condition: 'Gas price < 15 GWEI',
      threshold: '15 GWEI',
      channels: ['push', 'telegram'],
      frequency: 'instant',
      priority: 'low',
      enabled: true,
      triggered: 18,
      lastTriggered: new Date(Date.now() - 3600000 * 4),
      icon: Zap,
      color: 'text-green-500',
    },
    {
      id: '7',
      name: 'Liquidation Risk',
      description: 'Alert when loan health factor drops below 1.5',
      type: 'defi',
      condition: 'Health factor < 1.5',
      threshold: '1.5',
      channels: ['email', 'push', 'sms', 'discord', 'telegram'],
      frequency: 'instant',
      priority: 'critical',
      enabled: true,
      triggered: 0,
      icon: AlertTriangle,
      color: 'text-red-500',
    },
    {
      id: '8',
      name: 'Yield Opportunity',
      description: 'Alert when yield on stablecoin pools exceeds 10% APR',
      type: 'defi',
      condition: 'Stablecoin APR > 10%',
      threshold: '10% APR',
      channels: ['email', 'discord'],
      frequency: 'daily',
      priority: 'low',
      enabled: true,
      triggered: 4,
      lastTriggered: new Date(Date.now() - 86400000 * 5),
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      id: '9',
      name: 'Suspicious Activity',
      description: 'Alert on unusual wallet activity patterns',
      type: 'security',
      condition: 'Abnormal transaction pattern detected',
      threshold: 'AI Detection',
      channels: ['email', 'push', 'sms', 'discord', 'webhook'],
      frequency: 'instant',
      priority: 'critical',
      enabled: false,
      triggered: 0,
      icon: Shield,
      color: 'text-red-500',
    },
  ];

  // Mock alert history
  const alertHistory: AlertHistory[] = [
    {
      id: '1',
      ruleId: '3',
      ruleName: 'Large Transaction Detected',
      message: 'Transaction of $12,450 detected on Ethereum',
      timestamp: new Date(Date.now() - 86400000 * 1),
      priority: 'critical',
      acknowledged: true,
    },
    {
      id: '2',
      ruleId: '6',
      ruleName: 'Gas Price Drop',
      message: 'Gas price dropped to 12 GWEI',
      timestamp: new Date(Date.now() - 3600000 * 4),
      priority: 'low',
      acknowledged: true,
    },
    {
      id: '3',
      ruleId: '1',
      ruleName: 'ETH Price Alert',
      message: 'ETH price dropped to $1,980',
      timestamp: new Date(Date.now() - 86400000 * 2),
      priority: 'high',
      acknowledged: false,
    },
    {
      id: '4',
      ruleId: '5',
      ruleName: 'New Governance Proposal',
      message: 'New proposal in Uniswap: Deploy v4 on Base',
      timestamp: new Date(Date.now() - 86400000 * 3),
      priority: 'medium',
      acknowledged: true,
    },
  ];

  const filteredRules = filterType === 'all' 
    ? alertRules 
    : alertRules.filter(rule => rule.type === filterType);

  const enabledRules = alertRules.filter(r => r.enabled).length;
  const connectedChannels = channels.filter(c => c.connected).length;
  const totalTriggered = alertRules.reduce((sum, r) => sum + r.triggered, 0);
  const unacknowledgedAlerts = alertHistory.filter(h => !h.acknowledged).length;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: { variant: 'outline', color: 'text-blue-500' },
      medium: { variant: 'warning', color: 'text-yellow-500' },
      high: { variant: 'destructive', color: 'text-orange-500' },
      critical: { variant: 'destructive', color: 'text-red-500' },
    };
    const style = styles[priority as keyof typeof styles] || styles.low;
    return (
      <Badge variant={style.variant as any} className="capitalize">
        {priority}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      price: 'Price',
      balance: 'Balance',
      transaction: 'Transaction',
      security: 'Security',
      governance: 'Governance',
      gas: 'Gas',
      defi: 'DeFi',
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Smart Alert Automation
            </CardTitle>
            <CardDescription>
              Never miss important events with intelligent alerts
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Bell className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold text-primary">{enabledRules}</p>
            </div>
            <p className="text-xs text-muted-foreground">Active Alerts</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{connectedChannels}</p>
            <p className="text-xs text-muted-foreground">Channels</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{totalTriggered}</p>
            <p className="text-xs text-muted-foreground">Total Triggered</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <p className="text-2xl font-bold text-yellow-500">{unacknowledgedAlerts}</p>
            <p className="text-xs text-muted-foreground">Unread</p>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="mb-6 p-4 rounded-lg border border-border">
          <h4 className="text-sm font-semibold mb-3">Notification Channels</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {channels.map((channel) => {
              const IconComponent = channel.icon;
              return (
                <div
                  key={channel.type}
                  className={`p-3 rounded-lg border transition-colors ${
                    channel.connected && channel.enabled
                      ? 'border-green-500/30 bg-green-500/5'
                      : channel.connected
                      ? 'border-border bg-card'
                      : 'border-border bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="h-4 w-4" />
                    <span className="text-xs font-medium">{channel.label}</span>
                  </div>
                  {channel.connected ? (
                    <Badge variant={channel.enabled ? 'secondary' : 'outline'} className="text-xs gap-1">
                      {channel.enabled ? (
                        <><CheckCircle2 className="h-3 w-3" />Active</>
                      ) : (
                        <><XCircle className="h-3 w-3" />Paused</>
                      )}
                    </Badge>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-6 text-xs px-2">
                      Connect
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            {['all', 'price', 'security', 'transaction', 'defi', 'governance', 'gas'].map((type) => (
              <Button
                key={type}
                size="sm"
                variant={filterType === type ? 'default' : 'outline'}
                onClick={() => setFilterType(type as any)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
          >
            <Clock className="h-4 w-4 mr-2" />
            {showHistory ? 'Rules' : 'History'}
          </Button>
        </div>

        {/* Alert Rules */}
        {!showHistory && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold">Alert Rules</h4>
            {filteredRules.map((rule) => {
              const IconComponent = rule.icon;
              
              return (
                <div
                  key={rule.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    rule.enabled
                      ? 'border-border hover:bg-muted/50'
                      : 'border-border bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg bg-primary/10 ${rule.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h5 className="font-semibold">{rule.name}</h5>
                          {getTypeBadge(rule.type)}
                          {getPriorityBadge(rule.priority)}
                          {rule.enabled ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Disabled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {rule.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {rule.condition}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{rule.frequency} checks</span>
                          <span>•</span>
                          <span>Triggered {rule.triggered}x</span>
                          {rule.lastTriggered && (
                            <>
                              <span>•</span>
                              <span>Last: {formatDate(rule.lastTriggered)}</span>
                            </>
                          )}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {rule.channels.map((channel) => {
                            const channelInfo = channels.find(c => c.type === channel);
                            if (!channelInfo) return null;
                            const ChannelIcon = channelInfo.icon;
                            return (
                              <Badge key={channel} variant="outline" className="gap-1 text-xs">
                                <ChannelIcon className="h-3 w-3" />
                                {channelInfo.label}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button
                      size="sm"
                      variant={rule.enabled ? 'outline' : 'default'}
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Alert History */}
        {showHistory && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold">Alert History</h4>
            {alertHistory.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-colors ${
                  alert.acknowledged
                    ? 'border-border bg-card/50 opacity-70'
                    : 'border-yellow-500/30 bg-yellow-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h5 className="font-semibold">{alert.ruleName}</h5>
                      {getPriorityBadge(alert.priority)}
                      {alert.acknowledged ? (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Read
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Bell className="h-3 w-3" />
                          Unread
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(alert.timestamp)}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <Button size="sm" variant="outline">
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Setup */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🔔 Alert Automation Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Set up critical alerts for security and large transactions</li>
            <li>• Use multiple notification channels for important alerts</li>
            <li>• Configure daily summaries for low-priority events</li>
            <li>• Test alerts before enabling them</li>
            <li>• Adjust thresholds based on your activity patterns</li>
            <li>• Enable webhooks for custom integrations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

