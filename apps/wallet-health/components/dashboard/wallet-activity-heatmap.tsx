'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  Filter,
  Download,
  Flame,
  Zap,
  Moon,
  Sun
} from 'lucide-react';
import { useState } from 'react';

interface DayActivity {
  date: Date;
  transactionCount: number;
  totalValue: number;
  gasSpent: number;
  intensity: number; // 0-100
}

interface WalletActivityHeatmapProps {
  walletAddress: string;
}

export function WalletActivityHeatmap({ walletAddress }: WalletActivityHeatmapProps) {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y'>('6m');
  const [viewMode, setViewMode] = useState<'transactions' | 'value' | 'gas'>('transactions');

  // Generate mock heatmap data for the past year
  const generateHeatmapData = (): DayActivity[] => {
    const data: DayActivity[] = [];
    const daysToShow = timeRange === '3m' ? 90 : timeRange === '6m' ? 180 : 365;
    const today = new Date();

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const transactionCount = Math.floor(Math.random() * 20);
      const totalValue = transactionCount * (Math.random() * 5000);
      const gasSpent = transactionCount * (Math.random() * 50);
      
      let intensity = 0;
      if (viewMode === 'transactions') {
        intensity = Math.min(100, (transactionCount / 20) * 100);
      } else if (viewMode === 'value') {
        intensity = Math.min(100, (totalValue / 100000) * 100);
      } else {
        intensity = Math.min(100, (gasSpent / 1000) * 100);
      }

      data.push({
        date,
        transactionCount,
        totalValue,
        gasSpent,
        intensity,
      });
    }

    return data;
  };

  const heatmapData = generateHeatmapData();

  // Calculate statistics
  const stats = {
    totalTransactions: heatmapData.reduce((sum, day) => sum + day.transactionCount, 0),
    totalValue: heatmapData.reduce((sum, day) => sum + day.totalValue, 0),
    totalGas: heatmapData.reduce((sum, day) => sum + day.gasSpent, 0),
    avgDailyTx: heatmapData.reduce((sum, day) => sum + day.transactionCount, 0) / heatmapData.length,
    mostActiveDay: heatmapData.reduce((max, day) => 
      day.transactionCount > max.transactionCount ? day : max, heatmapData[0]),
    streakDays: calculateStreak(heatmapData),
  };

  function calculateStreak(data: DayActivity[]): number {
    let currentStreak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].transactionCount > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  }

  const getIntensityColor = (intensity: number): string => {
    if (intensity === 0) return 'bg-muted';
    if (intensity < 25) return 'bg-emerald-500/20';
    if (intensity < 50) return 'bg-emerald-500/40';
    if (intensity < 75) return 'bg-emerald-500/60';
    return 'bg-emerald-500/80';
  };

  const getDayOfWeek = (date: Date): number => {
    return date.getDay(); // 0 = Sunday, 6 = Saturday
  };

  const getWeekNumber = (date: Date): number => {
    const firstDay = new Date(heatmapData[0].date);
    const diff = date.getTime() - firstDay.getTime();
    return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  };

  // Organize data by week and day
  const weeks: DayActivity[][] = [];
  heatmapData.forEach((day) => {
    const weekNum = getWeekNumber(day.date);
    if (!weeks[weekNum]) {
      weeks[weekNum] = [];
    }
    weeks[weekNum].push(day);
  });

  const getBusyHours = () => {
    // Mock data for most active hours
    return [
      { hour: '9-12 AM', percentage: 15, transactions: 145 },
      { hour: '12-3 PM', percentage: 25, transactions: 234 },
      { hour: '3-6 PM', percentage: 35, transactions: 312 },
      { hour: '6-9 PM', percentage: 20, transactions: 198 },
      { hour: '9 PM-12 AM', percentage: 5, transactions: 67 },
    ];
  };

  const getActivityPattern = () => {
    const weekdayTx = heatmapData.filter(d => d.date.getDay() >= 1 && d.date.getDay() <= 5)
      .reduce((sum, d) => sum + d.transactionCount, 0);
    const weekendTx = heatmapData.filter(d => d.date.getDay() === 0 || d.date.getDay() === 6)
      .reduce((sum, d) => sum + d.transactionCount, 0);
    
    return {
      weekday: Math.round((weekdayTx / stats.totalTransactions) * 100),
      weekend: Math.round((weekendTx / stats.totalTransactions) * 100),
    };
  };

  const pattern = getActivityPattern();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Activity Heatmap
            </CardTitle>
            <CardDescription>
              Visualize your wallet activity over time
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={timeRange === '3m' ? 'default' : 'outline'}
              onClick={() => setTimeRange('3m')}
            >
              3M
            </Button>
            <Button
              size="sm"
              variant={timeRange === '6m' ? 'default' : 'outline'}
              onClick={() => setTimeRange('6m')}
            >
              6M
            </Button>
            <Button
              size="sm"
              variant={timeRange === '1y' ? 'default' : 'outline'}
              onClick={() => setTimeRange('1y')}
            >
              1Y
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-xs">Total Transactions</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {stats.avgDailyTx.toFixed(1)}/day
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Total Volume</span>
            </div>
            <p className="text-2xl font-bold">${(stats.totalValue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg ${(stats.totalValue / heatmapData.length).toFixed(0)}/day
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-xs">Current Streak</span>
            </div>
            <p className="text-2xl font-bold">{stats.streakDays}</p>
            <p className="text-xs text-muted-foreground mt-1">
              consecutive days
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs">Gas Spent</span>
            </div>
            <p className="text-2xl font-bold">${stats.totalGas.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg ${(stats.totalGas / heatmapData.length).toFixed(2)}/day
            </p>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'transactions' ? 'default' : 'outline'}
              onClick={() => setViewMode('transactions')}
            >
              Transactions
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'value' ? 'default' : 'outline'}
              onClick={() => setViewMode('value')}
            >
              Value
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'gas' ? 'default' : 'outline'}
              onClick={() => setViewMode('gas')}
            >
              Gas
            </Button>
          </div>

          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex gap-1 mb-2 pl-8">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="w-3 text-xs text-muted-foreground">
                  {day[0]}
                </div>
              ))}
            </div>
            
            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                    const dayData = week.find(d => getDayOfWeek(d.date) === dayOfWeek);
                    if (!dayData) {
                      return <div key={dayOfWeek} className="w-3 h-3" />;
                    }

                    return (
                      <div
                        key={dayOfWeek}
                        className={`w-3 h-3 rounded-sm cursor-pointer hover:ring-2 ring-primary transition-all ${getIntensityColor(dayData.intensity)}`}
                        title={`${dayData.date.toLocaleDateString()}\n${dayData.transactionCount} transactions\n$${dayData.totalValue.toFixed(2)} value`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground">Less</span>
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500/20" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500/40" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500/80" />
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>

        {/* Activity Patterns */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Busiest Hours
            </h4>
            <div className="space-y-2">
              {getBusyHours().map((hour) => (
                <div key={hour.hour} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{hour.hour}</span>
                    <span className="font-medium">{hour.transactions} tx</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${hour.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Activity Pattern
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Weekdays</span>
                  </div>
                  <span className="text-sm font-medium">{pattern.weekday}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${pattern.weekday}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Weekends</span>
                  </div>
                  <span className="text-sm font-medium">{pattern.weekend}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${pattern.weekend}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Most active day: {stats.mostActiveDay.date.toLocaleDateString()} 
                  ({stats.mostActiveDay.transactionCount} transactions)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <h4 className="text-sm font-semibold mb-2">💡 Insights</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• You're most active during {getBusyHours()[0].hour} with {getBusyHours()[0].transactions} transactions</li>
            <li>• Current activity streak: {stats.streakDays} consecutive days</li>
            <li>• {pattern.weekday > pattern.weekend ? 'Weekday' : 'Weekend'} warrior with {Math.max(pattern.weekday, pattern.weekend)}% of transactions</li>
            <li>• Average {stats.avgDailyTx.toFixed(1)} transactions per day</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

