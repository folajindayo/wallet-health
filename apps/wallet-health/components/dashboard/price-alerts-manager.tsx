'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Edit2
} from 'lucide-react';
import { useState } from 'react';

interface PriceAlert {
  id: string;
  token: string;
  symbol: string;
  currentPrice: number;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  triggered: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  notificationChannels: ('email' | 'push' | 'sms')[];
}

interface PriceAlertsManagerProps {
  walletAddress: string;
  alerts?: PriceAlert[];
}

export function PriceAlertsManager({ walletAddress, alerts = [] }: PriceAlertsManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newAlert, setNewAlert] = useState({
    token: '',
    symbol: '',
    targetPrice: '',
    condition: 'above' as 'above' | 'below',
  });

  // Mock alerts
  const mockAlerts: PriceAlert[] = [
    {
      id: '1',
      token: 'Ethereum',
      symbol: 'ETH',
      currentPrice: 3500,
      targetPrice: 4000,
      condition: 'above',
      isActive: true,
      triggered: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notificationChannels: ['email', 'push'],
    },
    {
      id: '2',
      token: 'Bitcoin',
      symbol: 'BTC',
      currentPrice: 62000,
      targetPrice: 60000,
      condition: 'below',
      isActive: true,
      triggered: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notificationChannels: ['push'],
    },
    {
      id: '3',
      token: 'Uniswap',
      symbol: 'UNI',
      currentPrice: 6.85,
      targetPrice: 7.00,
      condition: 'above',
      isActive: true,
      triggered: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      triggeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notificationChannels: ['email', 'push', 'sms'],
    },
    {
      id: '4',
      token: 'Chainlink',
      symbol: 'LINK',
      currentPrice: 14.25,
      targetPrice: 12.00,
      condition: 'below',
      isActive: false,
      triggered: false,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      notificationChannels: ['email'],
    },
  ];

  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts;

  const activeAlerts = displayAlerts.filter(a => a.isActive && !a.triggered).length;
  const triggeredAlerts = displayAlerts.filter(a => a.triggered).length;

  const handleCreateAlert = () => {
    // In real implementation, this would call an API
    console.log('Creating alert:', newAlert);
    setIsCreating(false);
    setNewAlert({
      token: '',
      symbol: '',
      targetPrice: '',
      condition: 'above',
    });
  };

  const handleDeleteAlert = (id: string) => {
    // In real implementation, this would call an API
    console.log('Deleting alert:', id);
  };

  const handleToggleAlert = (id: string) => {
    // In real implementation, this would call an API
    console.log('Toggling alert:', id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const calculateProgress = (current: number, target: number, condition: 'above' | 'below') => {
    if (condition === 'above') {
      return Math.min((current / target) * 100, 100);
    }
    return Math.max(100 - ((current - target) / current) * 100, 0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Price Alerts Manager
            </CardTitle>
            <CardDescription>
              Set alerts for token price movements
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsCreating(!isCreating)}>
            <Plus className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{displayAlerts.length}</p>
            <p className="text-xs text-muted-foreground">Total Alerts</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-600">{activeAlerts}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <p className="text-2xl font-bold text-yellow-600">{triggeredAlerts}</p>
            <p className="text-xs text-muted-foreground">Triggered</p>
          </div>
        </div>

        {/* Create Alert Form */}
        {isCreating && (
          <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-4">
            <h4 className="font-semibold text-sm">Create New Price Alert</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="token">Token Symbol</Label>
                <Input
                  id="token"
                  placeholder="e.g., ETH, BTC"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label htmlFor="targetPrice">Target Price (USD)</Label>
                <Input
                  id="targetPrice"
                  type="number"
                  placeholder="e.g., 4000"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="condition">Condition</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant={newAlert.condition === 'above' ? 'default' : 'outline'}
                  onClick={() => setNewAlert({ ...newAlert, condition: 'above' })}
                  className="flex-1"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Above
                </Button>
                <Button
                  size="sm"
                  variant={newAlert.condition === 'below' ? 'default' : 'outline'}
                  onClick={() => setNewAlert({ ...newAlert, condition: 'below' })}
                  className="flex-1"
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Below
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleCreateAlert} 
                disabled={!newAlert.symbol || !newAlert.targetPrice}
                className="flex-1"
              >
                Create Alert
              </Button>
              <Button onClick={() => setIsCreating(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          {displayAlerts.map((alert) => {
            const progress = calculateProgress(alert.currentPrice, alert.targetPrice, alert.condition);
            const isClose = Math.abs(alert.currentPrice - alert.targetPrice) / alert.targetPrice < 0.05;

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-colors ${
                  alert.triggered
                    ? 'border-green-500/30 bg-green-500/5'
                    : !alert.isActive
                    ? 'border-border bg-muted/30'
                    : isClose
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">
                        {alert.token} ({alert.symbol})
                      </h4>
                      {alert.triggered ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Triggered
                        </Badge>
                      ) : alert.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Paused</Badge>
                      )}
                      {isClose && alert.isActive && !alert.triggered && (
                        <Badge variant="warning" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Close to Target
                        </Badge>
                      )}
                    </div>

                    {/* Price Info */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-bold">{formatCurrency(alert.currentPrice)}</span>
                        {alert.condition === 'above' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-muted-foreground">Target:</span>
                        <span className="font-bold text-primary">{formatCurrency(alert.targetPrice)}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            alert.triggered ? 'bg-green-500' : 'bg-primary'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Notification Channels */}
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="h-3 w-3 text-muted-foreground" />
                      <div className="flex gap-1">
                        {alert.notificationChannels.map((channel) => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Timestamps */}
                    <p className="text-xs text-muted-foreground">
                      Created {alert.createdAt.toLocaleDateString()}
                      {alert.triggeredAt && (
                        <span> • Triggered {alert.triggeredAt.toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleAlert(alert.id)}
                    >
                      {alert.isActive ? (
                        <Bell className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4 opacity-50" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {displayAlerts.length === 0 && (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Price Alerts</p>
            <p className="text-xs text-muted-foreground mb-3">
              Create your first alert to get notified of price movements
            </p>
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🔔 Alert Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Set realistic price targets based on market analysis</li>
            <li>• Use multiple notification channels for critical alerts</li>
            <li>• Review and adjust alerts regularly</li>
            <li>• Consider both upward and downward movements</li>
            <li>• Don't set too many alerts to avoid notification fatigue</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

