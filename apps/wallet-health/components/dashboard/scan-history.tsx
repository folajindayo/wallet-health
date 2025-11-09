'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getRiskLevelEmoji } from '@/lib/risk-scorer';

interface ScanHistoryProps {
  scans: Array<{
    timestamp: number;
    score: number;
    riskLevel: 'safe' | 'moderate' | 'critical';
    chainId: number;
  }>;
}

export function ScanHistory({ scans }: ScanHistoryProps) {
  if (!scans || scans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
          <CardDescription>Your wallet security score over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No previous scans. This is your first scan!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort scans by timestamp
  const sortedScans = [...scans].sort((a, b) => a.timestamp - b.timestamp);

  // Format data for chart
  const chartData = sortedScans.map((scan) => ({
    date: new Date(scan.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    score: scan.score,
    fullDate: new Date(scan.timestamp).toLocaleString(),
  }));

  // Calculate trend
  const firstScore = sortedScans[0].score;
  const lastScore = sortedScans[sortedScans.length - 1].score;
  const scoreDiff = lastScore - firstScore;
  const trend = scoreDiff > 0 ? 'up' : scoreDiff < 0 ? 'down' : 'stable';

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendText = () => {
    if (trend === 'up') return 'Improving';
    if (trend === 'down') return 'Declining';
    return 'Stable';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'success';
    if (trend === 'down') return 'destructive';
    return 'warning';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scan History</CardTitle>
            <CardDescription>
              {scans.length} scan{scans.length !== 1 ? 's' : ''} over time
            </CardDescription>
          </div>
          <Badge variant={getTrendColor()} className="inline-flex items-center gap-1">
            {getTrendIcon()}
            {getTrendText()}
            {scoreDiff !== 0 && ` (${scoreDiff > 0 ? '+' : ''}${scoreDiff})`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis
                dataKey="date"
                stroke="#a3a3a3"
                fontSize={12}
              />
              <YAxis
                stroke="#a3a3a3"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#121212',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#ededed' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Scans List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium mb-3">Recent Scans</h4>
          {sortedScans.slice(-5).reverse().map((scan, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getRiskLevelEmoji(scan.riskLevel)}</span>
                <div>
                  <div className="font-medium">
                    Score: {scan.score}/100
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(scan.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <Badge variant={
                scan.riskLevel === 'safe' ? 'success' :
                scan.riskLevel === 'moderate' ? 'warning' : 'destructive'
              }>
                {scan.riskLevel}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

