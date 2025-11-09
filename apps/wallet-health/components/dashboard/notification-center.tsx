'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X,
  Trash2,
  BellOff
} from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
}

export function NotificationCenter({ 
  notifications = [],
  onMarkAsRead,
  onDelete,
  onClearAll
}: NotificationCenterProps) {
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(
    notifications.length > 0 ? notifications : [
      {
        id: '1',
        type: 'warning',
        title: 'High Risk Approval Detected',
        message: 'You have given unlimited approval to 0x742d...3f8a. Consider revoking this approval.',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        actionLabel: 'Revoke',
      },
      {
        id: '2',
        type: 'success',
        title: 'Scan Complete',
        message: 'Your wallet security scan has completed. Score: 92/100',
        timestamp: new Date(Date.now() - 7200000),
        read: false,
      },
      {
        id: '3',
        type: 'info',
        title: 'New Feature Available',
        message: 'Check out the new DeFi exposure tracker to see your protocol positions.',
        timestamp: new Date(Date.now() - 86400000),
        read: true,
      },
      {
        id: '4',
        type: 'warning',
        title: 'Spam Tokens Detected',
        message: '3 spam tokens have been detected in your wallet. They have been automatically hidden.',
        timestamp: new Date(Date.now() - 172800000),
        read: true,
      },
      {
        id: '5',
        type: 'error',
        title: 'Critical Security Alert',
        message: 'A contract you interacted with has been flagged as malicious. Review your recent transactions.',
        timestamp: new Date(Date.now() - 259200000),
        read: false,
        actionLabel: 'Review',
      },
    ]
  );

  const unreadCount = localNotifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setLocalNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    onMarkAsRead?.(id);
  };

  const handleDelete = (id: string) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
    onDelete?.(id);
  };

  const handleClearAll = () => {
    setLocalNotifications([]);
    onClearAll?.();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Center
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay updated with your wallet's security status
            </CardDescription>
          </div>
          {localNotifications.length > 0 && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={handleClearAll}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {localNotifications.length === 0 ? (
          <div className="text-center py-8">
            <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No notifications
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {localNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.read
                    ? 'border-border bg-muted/30'
                    : 'border-primary/30 bg-primary/5'
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm">
                        {notification.title}
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                        {notification.actionLabel && (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs"
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

