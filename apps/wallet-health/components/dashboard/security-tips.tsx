'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  ChevronRight 
} from 'lucide-react';
import { useState } from 'react';

interface Tip {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  category: 'critical' | 'important' | 'recommended';
  read: boolean;
}

export function SecurityTips() {
  const [tips, setTips] = useState<Tip[]>([
    {
      id: '1',
      icon: Shield,
      title: 'Review Token Approvals Regularly',
      description: 'Check your token approvals monthly and revoke any you don\'t recognize or no longer use. Unlimited approvals are especially risky.',
      category: 'critical',
      read: false,
    },
    {
      id: '2',
      icon: Lock,
      title: 'Use Hardware Wallets',
      description: 'Hardware wallets like Ledger or Trezor keep your private keys offline and provide the highest level of security for your assets.',
      category: 'important',
      read: false,
    },
    {
      id: '3',
      icon: Eye,
      title: 'Verify Contract Addresses',
      description: 'Always verify contract addresses before interacting. Scammers often create fake tokens with similar names to legitimate projects.',
      category: 'critical',
      read: false,
    },
    {
      id: '4',
      icon: AlertTriangle,
      title: 'Beware of Phishing',
      description: 'Never click suspicious links or connect your wallet to unknown sites. Always check the URL and look for HTTPS.',
      category: 'critical',
      read: false,
    },
    {
      id: '5',
      icon: CheckCircle,
      title: 'Enable 2FA',
      description: 'Enable two-factor authentication on all accounts related to your crypto holdings, including exchanges and email.',
      category: 'important',
      read: false,
    },
    {
      id: '6',
      icon: Info,
      title: 'Diversify Wallet Usage',
      description: 'Use different wallets for different purposes: one for trading, one for long-term holding, and one for testing new dApps.',
      category: 'recommended',
      read: false,
    },
  ]);

  const markAsRead = (id: string) => {
    setTips(tips.map(tip => 
      tip.id === id ? { ...tip, read: true } : tip
    ));
  };

  const getCategoryBadge = (category: 'critical' | 'important' | 'recommended') => {
    switch (category) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'important':
        return <Badge variant="outline">Important</Badge>;
      case 'recommended':
        return <Badge variant="default">Recommended</Badge>;
    }
  };

  const unreadCount = tips.filter(t => !t.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Tips
            </CardTitle>
            <CardDescription>
              Best practices to keep your wallet safe
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Badge variant="secondary">
              {unreadCount} New
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                tip.read 
                  ? 'border-border bg-muted/30 opacity-60' 
                  : 'border-border bg-card hover:bg-muted/50'
              }`}
              onClick={() => markAsRead(tip.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <tip.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{tip.title}</h4>
                    {getCategoryBadge(tip.category)}
                    {tip.read && (
                      <Badge variant="outline" className="text-xs">
                        ✓ Read
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tip.description}
                  </p>
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground flex-shrink-0 ${
                  tip.read ? 'opacity-30' : ''
                }`} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Click on a tip to mark it as read • Stay safe! 🛡️
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

