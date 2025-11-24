'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import type { HealthTrend } from '@/lib/wallet-health-trends';

interface WalletHealthTrendsProps {
  walletAddress: string;
  currentScore: number;
}

export function WalletHealthTrends({ walletAddress, currentScore }: WalletHealthTrendsProps) {
  const [trend, setTrend] = useState<HealthTrend | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrend();
  }, [walletAddress]);

  const fetchTrend = async () => {
    try {
      const response = await axios.get(`/api/health/trends?walletAddress=${walletAddress}&lookbackDays=30`);
      if (response.data.success) {
        setTrend(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch health trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Trends</CardTitle>
          <CardDescription>Loading trend analysis...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!trend) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Trends</CardTitle>
          <CardDescription>Insufficient data to analyze trends</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (trend.trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'volatile':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend.trend) {
      case 'improving':
        return 'text-green-500';
      case 'declining':
        return 'text-red-500';
      case 'volatile':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Health Trends</CardTitle>
            <CardDescription>30-day trend analysis and predictions</CardDescription>
          </div>
          {getTrendIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trend Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Score</p>
            <p className="text-2xl font-bold">{trend.currentScore}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="text-2xl font-bold">{trend.averageScore}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trend</p>
            <p className={`text-lg font-semibold ${getTrendColor()}`}>
              {trend.trend.charAt(0).toUpperCase() + trend.trend.slice(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Volatility</p>
            <p className="text-lg font-semibold">{trend.volatility.toFixed(1)}%</p>
          </div>
        </div>

        {/* Predicted Score */}
        {trend.predictedScore !== undefined && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Predicted Score (7 days)</p>
                <p className="text-2xl font-bold">{trend.predictedScore}</p>
              </div>
              {trend.predictedScore > trend.currentScore ? (
                <TrendingUp className="h-6 w-6 text-green-500" />
              ) : trend.predictedScore < trend.currentScore ? (
                <TrendingDown className="h-6 w-6 text-red-500" />
              ) : (
                <Minus className="h-6 w-6 text-gray-500" />
              )}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {trend.riskFactors.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Risk Factor Trends</p>
            <div className="space-y-2">
              {trend.riskFactors.slice(0, 5).map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    {factor.trend === 'increasing' ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : factor.trend === 'decreasing' ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-sm">{factor.factor}</span>
                  </div>
                  <span className="text-sm font-medium">{factor.impact.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {trend.recommendations.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Recommendations</p>
            <div className="space-y-2">
              {trend.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trend Strength */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trend Strength</span>
            <span className="text-sm font-medium">
              {trend.trendStrength > 0 ? '+' : ''}
              {trend.trendStrength.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${
                trend.trendStrength > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.abs(trend.trendStrength)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

