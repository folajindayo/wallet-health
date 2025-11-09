'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Shield, 
  Coins,
  FileCheck,
  RefreshCw 
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'scan' | 'approval' | 'token' | 'alert' | 'revoke';
  title: string;
  description: string;
  timestamp: number;
  severity?: 'success' | 'warning' | 'error';
}

interface ActivityTimelineProps {
  activities?: Activity[];
  maxItems?: number;
}

export function ActivityTimeline({ activities = [], maxItems = 10 }: ActivityTimelineProps) {
  // Mock activities if none provided
  const defaultActivities: Activity[] = [
    {
      id: '1',
      type: 'scan',
      title: 'Wallet Scanned',
      description: 'Security score: 85/100 - Healthy wallet',
      timestamp: Date.now(),
      severity: 'success',
    },
    {
      id: '2',
      type: 'alert',
      title: 'New Spam Token Detected',
      description: 'Suspicious token airdrop identified in your wallet',
      timestamp: Date.now() - 3600000,
      severity: 'warning',
    },
    {
      id: '3',
      type: 'approval',
      title: 'Token Approval Found',
      description: 'Unlimited approval to Uniswap V3',
      timestamp: Date.now() - 7200000,
      severity: 'warning',
    },
    {
      id: '4',
      type: 'scan',
      title: 'Wallet Scanned',
      description: 'Security score: 82/100 - Needs attention',
      timestamp: Date.now() - 86400000,
      severity: 'warning',
    },
    {
      id: '5',
      type: 'revoke',
      title: 'Approval Revoked',
      description: 'Successfully revoked approval to unknown contract',
      timestamp: Date.now() - 172800000,
      severity: 'success',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;
  const limitedActivities = displayActivities.slice(0, maxItems);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'scan':
        return Shield;
      case 'approval':
        return FileCheck;
      case 'token':
        return Coins;
      case 'alert':
        return AlertTriangle;
      case 'revoke':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
        <CardDescription>
          Recent wallet security events and actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          {/* Activities */}
          <div className="space-y-4">
            {limitedActivities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              
              return (
                <div key={activity.id} className="relative pl-10">
                  {/* Icon */}
                  <div className="absolute left-0 top-0 p-2 rounded-full bg-card border-2 border-border">
                    <ActivityIcon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="pb-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{activity.title}</h4>
                        {activity.severity && (
                          <div className="flex-shrink-0">
                            {getSeverityIcon(activity.severity)}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {getRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {displayActivities.length > maxItems && (
            <div className="text-center pt-4 border-t border-border">
              <button className="text-sm text-primary hover:underline">
                View all {displayActivities.length} activities
              </button>
            </div>
          )}

          {displayActivities.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

