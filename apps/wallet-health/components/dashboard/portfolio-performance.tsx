'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface PortfolioPerformanceProps {
  currentValue: number;
  previousValue?: number;
}

export function PortfolioPerformance({ currentValue, previousValue = 0 }: PortfolioPerformanceProps) {
  // Generate sample historical data (in production, fetch from API)
  const generateHistoricalData = () => {
    const data = [];
    const days = 30;
    let value = previousValue || currentValue * 0.8;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate price fluctuation leading to current value
      const progress = (days - i) / days;
      value = previousValue + (currentValue - previousValue) * progress + (Math.random() - 0.5) * (currentValue * 0.05);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(0, value),
      });
    }
    
    // Ensure last value is current
    data[data.length - 1].value = currentValue;
    
    return data;
  };

  const historicalData = generateHistoricalData();
  
  // Calculate changes
  const valueChange = currentValue - previousValue;
  const percentChange = previousValue > 0 ? ((valueChange / previousValue) * 100) : 0;
  const isPositive = valueChange >= 0;

  // Calculate stats
  const allValues = historicalData.map(d => d.value);
  const highValue = Math.max(...allValues);
  const lowValue = Math.min(...allValues);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Portfolio Performance
        </CardTitle>
        <CardDescription>30-day value tracking</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Value */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Value</p>
              <p className="text-3xl font-bold">
                {formatCurrency(currentValue)}
              </p>
            </div>
            <div className="text-right">
              <Badge 
                variant={isPositive ? 'secondary' : 'destructive'}
                className="inline-flex items-center gap-1"
              >
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive && '+'}{percentChange.toFixed(2)}%
              </Badge>
              <p className={`text-sm mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive && '+'}{formatCurrency(valueChange)}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={isPositive ? '#10b981' : '#ef4444'} 
                    stopOpacity={0.3} 
                  />
                  <stop 
                    offset="95%" 
                    stopColor={isPositive ? '#10b981' : '#ef4444'} 
                    stopOpacity={0} 
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis
                dataKey="date"
                stroke="#a3a3a3"
                fontSize={10}
                tickFormatter={(value) => value.split(' ')[1]} // Show only day
              />
              <YAxis
                stroke="#a3a3a3"
                fontSize={10}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#121212',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#ededed' }}
                formatter={(value: number) => [formatCurrency(value), 'Value']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                fill="url(#valueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">30-Day High</p>
            <p className="font-semibold text-green-500">{formatCurrency(highValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">30-Day Low</p>
            <p className="font-semibold text-red-500">{formatCurrency(lowValue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

