'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { RiskAlert } from '@wallet-health/types';

interface RiskAlertsProps {
  alerts: RiskAlert[];
}

export function RiskAlerts({ alerts }: RiskAlertsProps) {
  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBg = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/10 border-red-500/50';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/50';
      case 'low':
        return 'bg-blue-500/10 border-blue-500/50';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Alerts</CardTitle>
          <CardDescription>No security alerts detected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/50">
            <div className="text-green-500 text-2xl">✓</div>
            <p className="text-sm text-muted-foreground">
              Your wallet looks safe! No critical security issues found.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Risk Alerts
          <span className="text-sm font-normal text-muted-foreground">({alerts.length})</span>
        </CardTitle>
        <CardDescription>
          Security warnings and recommended actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getSeverityBg(alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {alert.description}
                  </p>
                  {alert.actionable && alert.actionLabel && (
                    <button
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => {
                        if (alert.actionUrl) {
                          window.open(alert.actionUrl, '_blank');
                        }
                      }}
                    >
                      {alert.actionLabel} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

