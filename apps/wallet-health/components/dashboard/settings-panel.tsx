'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  Download,
  Trash2,
  Save,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';

interface SettingsPanelProps {
  walletAddress: string;
  onSave?: (settings: any) => void;
}

export function SettingsPanel({ walletAddress, onSave }: SettingsPanelProps) {
  const [settings, setSettings] = useState({
    notifications: {
      newApprovals: true,
      spamTokens: true,
      riskAlerts: true,
      priceChanges: false,
      weeklyReport: true,
    },
    privacy: {
      hideSpamTokens: true,
      hideSmallBalances: false,
      publicProfile: false,
    },
    security: {
      autoScan: true,
      scanInterval: '24h',
      alertThreshold: 'medium',
    },
    display: {
      defaultView: 'overview',
      compactMode: false,
      showTestnets: false,
    },
  });

  const [saved, setSaved] = useState(false);

  const updateSetting = (category: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    onSave?.(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    // Reset to defaults
    setSettings({
      notifications: {
        newApprovals: true,
        spamTokens: true,
        riskAlerts: true,
        priceChanges: false,
        weeklyReport: true,
      },
      privacy: {
        hideSpamTokens: true,
        hideSmallBalances: false,
        publicProfile: false,
      },
      security: {
        autoScan: true,
        scanInterval: '24h',
        alertThreshold: 'medium',
      },
      display: {
        defaultView: 'overview',
        compactMode: false,
        showTestnets: false,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings & Preferences
            </CardTitle>
            <CardDescription>
              Customize your wallet health monitoring experience
            </CardDescription>
          </div>
          {saved && (
            <Badge variant="success" className="animate-in fade-in">
              ✓ Saved
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notifications */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold mb-4">
            <Bell className="h-4 w-4" />
            Notifications
          </h3>
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-approvals" className="cursor-pointer">
                <div>
                  <div className="font-medium">New Token Approvals</div>
                  <div className="text-xs text-muted-foreground">
                    Get notified when new approvals are detected
                  </div>
                </div>
              </Label>
              <Switch
                id="new-approvals"
                checked={settings.notifications.newApprovals}
                onCheckedChange={(checked) => updateSetting('notifications', 'newApprovals', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="spam-tokens" className="cursor-pointer">
                <div>
                  <div className="font-medium">Spam Token Alerts</div>
                  <div className="text-xs text-muted-foreground">
                    Alert when spam tokens are received
                  </div>
                </div>
              </Label>
              <Switch
                id="spam-tokens"
                checked={settings.notifications.spamTokens}
                onCheckedChange={(checked) => updateSetting('notifications', 'spamTokens', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="risk-alerts" className="cursor-pointer">
                <div>
                  <div className="font-medium">Security Risk Alerts</div>
                  <div className="text-xs text-muted-foreground">
                    Immediate alerts for critical risks
                  </div>
                </div>
              </Label>
              <Switch
                id="risk-alerts"
                checked={settings.notifications.riskAlerts}
                onCheckedChange={(checked) => updateSetting('notifications', 'riskAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="weekly-report" className="cursor-pointer">
                <div>
                  <div className="font-medium">Weekly Summary Report</div>
                  <div className="text-xs text-muted-foreground">
                    Receive weekly wallet health reports
                  </div>
                </div>
              </Label>
              <Switch
                id="weekly-report"
                checked={settings.notifications.weeklyReport}
                onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReport', checked)}
              />
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="pt-4 border-t border-border">
          <h3 className="flex items-center gap-2 font-semibold mb-4">
            <Eye className="h-4 w-4" />
            Privacy & Display
          </h3>
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="hide-spam" className="cursor-pointer">
                <div>
                  <div className="font-medium">Hide Spam Tokens</div>
                  <div className="text-xs text-muted-foreground">
                    Automatically hide spam from token list
                  </div>
                </div>
              </Label>
              <Switch
                id="hide-spam"
                checked={settings.privacy.hideSpamTokens}
                onCheckedChange={(checked) => updateSetting('privacy', 'hideSpamTokens', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hide-small" className="cursor-pointer">
                <div>
                  <div className="font-medium">Hide Small Balances</div>
                  <div className="text-xs text-muted-foreground">
                    Hide tokens with balance &lt; $1
                  </div>
                </div>
              </Label>
              <Switch
                id="hide-small"
                checked={settings.privacy.hideSmallBalances}
                onCheckedChange={(checked) => updateSetting('privacy', 'hideSmallBalances', checked)}
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="pt-4 border-t border-border">
          <h3 className="flex items-center gap-2 font-semibold mb-4">
            <Shield className="h-4 w-4" />
            Security Settings
          </h3>
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-scan" className="cursor-pointer">
                <div>
                  <div className="font-medium">Auto-Scan</div>
                  <div className="text-xs text-muted-foreground">
                    Automatically scan wallet every 24 hours
                  </div>
                </div>
              </Label>
              <Switch
                id="auto-scan"
                checked={settings.security.autoScan}
                onCheckedChange={(checked) => updateSetting('security', 'autoScan', checked)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

