'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ScoreDataPoint {
  date: string;
  score: number;
  risk: 'low' | 'medium' | 'high';
}

interface HealthScoreTrendProps {
  data?: ScoreDataPoint[];
  currentScore: number;
  previousScore?: number;
}

export function HealthScoreTrend({ 
  data = [],
  currentScore,
  previousScore 
}: HealthScoreTrendProps) {
  // Generate mock data if none provided
  const mockData: ScoreDataPoint[] = [
    { date: '30d ago', score: 78, risk: 'medium' },
    { date: '25d ago', score: 82, risk: 'medium' },
    { date: '20d ago', score: 85, risk: 'low' },
    { date: '15d ago', score: 88, risk: 'low' },
    { date: '10d ago', score: 86, risk: 'low' },
    { date: '5d ago', score: 90, risk: 'low' },
    { date: 'Today', score: currentScore, risk: currentScore >= 80 ? 'low' : currentScore >= 60 ? 'medium' : 'high' },
  ];

  const displayData = data.length > 0 ? data : mockData;
  const lastScore = previousScore ?? displayData[displayData.length - 2]?.score ?? currentScore;
  const scoreDiff = currentScore - lastScore;
  const percentChange = lastScore > 0 ? ((scoreDiff / lastScore) * 100).toFixed(1) : '0';

  const getTrendIcon = () => {
    if (scoreDiff > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (scoreDiff < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendBadge = () => {
    if (scoreDiff > 0) {
      return (
        <Badge variant="secondary" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          +{Math.abs(scoreDiff)} pts ({percentChange}%)
        </Badge>
      );
    }
    if (scoreDiff < 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <TrendingDown className="h-3 w-3" />
          -{Math.abs(scoreDiff)} pts ({Math.abs(parseFloat(percentChange))}%)
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <Minus className="h-3 w-3" />
        No change
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getTrendIcon()}
            Health Score Trend
          </span>
          {getTrendBadge()}
        </CardTitle>
        <CardDescription>
          Your wallet security score over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Score Display */}
        <div className="mb-6 p-4 rounded-lg border border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Score</p>
              <p className="text-4xl font-bold" style={{ color: getScoreColor(currentScore) }}>
                {currentScore}
                <span className="text-lg text-muted-foreground">/100</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Previous Score</p>
              <p className="text-2xl font-semibold text-muted-foreground">
                {lastScore}
              </p>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Score Milestones */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          <div className="p-3 rounded-lg border border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">Low Risk</p>
            <p className="text-lg font-semibold text-green-500">80-100</p>
          </div>
          <div className="p-3 rounded-lg border border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">Medium Risk</p>
            <p className="text-lg font-semibold text-yellow-500">60-79</p>
          </div>
          <div className="p-3 rounded-lg border border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">High Risk</p>
            <p className="text-lg font-semibold text-red-500">0-59</p>
          </div>
        </div>

        {/* Insights */}
        {scoreDiff !== 0 && (
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm">
              {scoreDiff > 0 ? (
                <>
                  <span className="font-semibold text-green-600">Great job!</span> Your security score 
                  has improved by {Math.abs(scoreDiff)} points. Keep following best practices.
                </>
              ) : (
                <>
                  <span className="font-semibold text-red-600">Action needed:</span> Your security score 
                  has decreased by {Math.abs(scoreDiff)} points. Review your recent approvals and transactions.
                </>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

