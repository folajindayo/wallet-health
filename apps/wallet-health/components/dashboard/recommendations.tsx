'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Shield, Trash2, ExternalLink } from 'lucide-react';
import type { RiskScore } from '@/lib/risk-scorer';

interface RecommendationsProps {
  riskScore: RiskScore;
  chainId: number;
}

interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
  };
}

export function Recommendations({ riskScore, chainId }: RecommendationsProps) {
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // High priority: Unverified contracts
    if (riskScore.factors.unverifiedContractsCount > 0) {
      recommendations.push({
        id: 'revoke-unverified',
        priority: 'high',
        icon: AlertTriangle,
        title: 'Revoke Unverified Contract Approvals',
        description: `You have ${riskScore.factors.unverifiedContractsCount} approval(s) to unverified contracts. These are high risk and should be revoked immediately.`,
        action: {
          label: 'Revoke Now',
          url: `https://revoke.cash/?chainId=${chainId}`,
        },
      });
    }

    // High priority: Many active approvals
    if (riskScore.factors.activeApprovalsCount > 10) {
      recommendations.push({
        id: 'reduce-approvals',
        priority: 'high',
        title: 'Reduce Active Approvals',
        description: `You have ${riskScore.factors.activeApprovalsCount} active token approvals. Consider revoking ones you no longer use.`,
        icon: Shield,
        action: {
          label: 'Review Approvals',
          url: `https://revoke.cash/?chainId=${chainId}`,
        },
      });
    }

    // Medium priority: New contracts
    if (riskScore.factors.newContractsCount > 0) {
      recommendations.push({
        id: 'review-new',
        priority: 'medium',
        title: 'Review New Contract Approvals',
        description: `${riskScore.factors.newContractsCount} approval(s) to contracts less than 30 days old. These may be legitimate but require extra caution.`,
        icon: AlertTriangle,
      });
    }

    // Medium priority: Spam tokens
    if (riskScore.factors.spamTokensCount > 0) {
      recommendations.push({
        id: 'hide-spam',
        priority: 'medium',
        title: 'Hide Spam Tokens',
        description: `${riskScore.factors.spamTokensCount} spam or phishing token(s) detected. Hide them to clean up your wallet view.`,
        icon: Trash2,
      });
    }

    // Low priority: Good practices (if score is good)
    if (riskScore.score >= 80) {
      recommendations.push({
        id: 'maintain',
        priority: 'low',
        title: 'Maintain Good Security Practices',
        description: 'Your wallet is in good shape! Continue monitoring regularly and be cautious with new approvals.',
        icon: CheckCircle,
      });
    }

    // Low priority: Use ENS (if don't have)
    if (!riskScore.factors.hasENS && riskScore.factors.verifiedProtocolsCount > 0) {
      recommendations.push({
        id: 'consider-ens',
        priority: 'low',
        title: 'Consider Getting an ENS Name',
        description: 'ENS names add legitimacy and make your address more recognizable.',
        icon: Shield,
        action: {
          label: 'Learn More',
          url: 'https://ens.domains',
        },
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Recommendations
          <Badge variant="outline">{recommendations.length}</Badge>
        </CardTitle>
        <CardDescription>
          Prioritized actions to improve your wallet security
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No recommendations at this time. Your wallet is secure!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <rec.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{rec.title}</h4>
                      <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.description}
                    </p>
                    {rec.action && (
                      <Button
                        size="sm"
                        variant={rec.priority === 'high' ? 'destructive' : 'outline'}
                        onClick={() => {
                          if (rec.action?.url) {
                            window.open(rec.action.url, '_blank');
                          } else if (rec.action?.onClick) {
                            rec.action.onClick();
                          }
                        }}
                      >
                        {rec.action.label}
                        {rec.action.url && <ExternalLink className="h-3 w-3 ml-2" />}
                      </Button>
                    )}
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

