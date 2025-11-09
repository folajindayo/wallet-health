'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Trash2, 
  Download, 
  Share2, 
  FileText, 
  ExternalLink 
} from 'lucide-react';

interface QuickActionsProps {
  chainId: number;
  onExport?: () => void;
  onShare?: () => void;
  onRevoke?: () => void;
  onViewReport?: () => void;
}

export function QuickActions({ 
  chainId, 
  onExport, 
  onShare, 
  onRevoke,
  onViewReport 
}: QuickActionsProps) {
  const actions = [
    {
      icon: Shield,
      label: 'Revoke All',
      description: 'Revoke all token approvals',
      onClick: onRevoke || (() => window.open(`https://revoke.cash/?chainId=${chainId}`, '_blank')),
      variant: 'destructive' as const,
    },
    {
      icon: Download,
      label: 'Export',
      description: 'Download scan report',
      onClick: onExport,
      variant: 'outline' as const,
    },
    {
      icon: Share2,
      label: 'Share',
      description: 'Share your score',
      onClick: onShare,
      variant: 'outline' as const,
    },
    {
      icon: FileText,
      label: 'Full Report',
      description: 'View detailed report',
      onClick: onViewReport,
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common security tasks and tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto flex-col items-start gap-2 p-4 text-left"
              onClick={action.onClick}
              disabled={!action.onClick}
            >
              <action.icon className="h-5 w-5" />
              <div>
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-xs opacity-70 font-normal">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Additional Links */}
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between"
            onClick={() => window.open('https://revoke.cash', '_blank')}
          >
            <span>Revoke.cash</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between"
            onClick={() => window.open('https://etherscan.io', '_blank')}
          >
            <span>Block Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

