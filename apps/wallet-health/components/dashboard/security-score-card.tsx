'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw } from 'lucide-react';
import { getRiskLevelEmoji, getRiskLevelColor, getRiskLevelBgColor } from '@/lib/risk-scorer';

interface SecurityScoreCardProps {
  score: number;
  riskLevel: 'safe' | 'moderate' | 'critical';
  onScanAgain?: () => void;
  isScanning?: boolean;
}

export function SecurityScoreCard({ score, riskLevel, onScanAgain, isScanning }: SecurityScoreCardProps) {
  // Calculate the stroke dash offset for the circular progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Security Score</CardTitle>
            <CardDescription>Overall wallet health rating</CardDescription>
          </div>
          {onScanAgain && (
            <Button
              variant="outline"
              size="sm"
              onClick={onScanAgain}
              disabled={isScanning}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Scan Again'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8">
          {/* Circular Progress */}
          <div className="relative">
            <svg className="transform -rotate-90" width="280" height="280">
              {/* Background circle */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                stroke="currentColor"
                strokeWidth="20"
                fill="none"
                className="text-muted"
              />
              {/* Progress circle */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                stroke="currentColor"
                strokeWidth="20"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={`${getRiskLevelColor(riskLevel)} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Score in the center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold mb-2">{score}</div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
          </div>

          {/* Risk Level Badge */}
          <div className={`mt-8 px-6 py-3 rounded-full ${getRiskLevelBgColor(riskLevel)} border ${getRiskLevelColor(riskLevel).replace('text-', 'border-')}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getRiskLevelEmoji(riskLevel)}</span>
              <span className={`text-lg font-semibold ${getRiskLevelColor(riskLevel)}`}>
                {riskLevel === 'safe' && 'Healthy Wallet'}
                {riskLevel === 'moderate' && 'Needs Attention'}
                {riskLevel === 'critical' && 'Critical Risk'}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-center text-sm text-muted-foreground max-w-md">
            {riskLevel === 'safe' && 'Your wallet shows good security practices. Keep monitoring for new risks.'}
            {riskLevel === 'moderate' && 'Some security concerns detected. Review and take action on the alerts below.'}
            {riskLevel === 'critical' && 'Critical security risks found! Immediate action recommended to protect your funds.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

