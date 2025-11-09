'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';

interface GasPrice {
  slow: number;
  standard: number;
  fast: number;
  unit: string;
}

export function GasTracker() {
  const chainId = useChainId();
  const [gasPrice, setGasPrice] = useState<GasPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    // Simulate gas price fetching (in production, use actual API)
    const fetchGasPrice = () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const baseGas = Math.floor(Math.random() * 50) + 20;
        setGasPrice({
          slow: baseGas,
          standard: baseGas + 5,
          fast: baseGas + 15,
          unit: 'Gwei',
        });
        
        // Random trend
        const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
        setTrend(trends[Math.floor(Math.random() * trends.length)]);
        
        setLoading(false);
      }, 1000);
    };

    fetchGasPrice();
    
    // Refresh every 15 seconds
    const interval = setInterval(fetchGasPrice, 15000);
    
    return () => clearInterval(interval);
  }, [chainId]);

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-red-500" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-green-500" />;
    return <Zap className="h-3 w-3 text-yellow-500" />;
  };

  const getTrendText = () => {
    if (trend === 'up') return 'Increasing';
    if (trend === 'down') return 'Decreasing';
    return 'Stable';
  };

  const getGasColor = (type: 'slow' | 'standard' | 'fast') => {
    switch (type) {
      case 'slow':
        return 'bg-green-500/10 text-green-500 border-green-500/50';
      case 'standard':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50';
      case 'fast':
        return 'bg-red-500/10 text-red-500 border-red-500/50';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Gas Prices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gasPrice) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Gas Prices
            </CardTitle>
            <CardDescription>Current network gas fees</CardDescription>
          </div>
          <Badge variant="outline" className="inline-flex items-center gap-1">
            {getTrendIcon()}
            {getTrendText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {/* Slow */}
          <div className={`p-3 rounded-lg border ${getGasColor('slow')}`}>
            <div className="text-xs font-medium mb-1 opacity-80">Slow</div>
            <div className="text-lg font-bold">
              {gasPrice.slow}
            </div>
            <div className="text-xs opacity-70">{gasPrice.unit}</div>
          </div>

          {/* Standard */}
          <div className={`p-3 rounded-lg border ${getGasColor('standard')}`}>
            <div className="text-xs font-medium mb-1 opacity-80">Standard</div>
            <div className="text-lg font-bold">
              {gasPrice.standard}
            </div>
            <div className="text-xs opacity-70">{gasPrice.unit}</div>
          </div>

          {/* Fast */}
          <div className={`p-3 rounded-lg border ${getGasColor('fast')}`}>
            <div className="text-xs font-medium mb-1 opacity-80">Fast</div>
            <div className="text-lg font-bold">
              {gasPrice.fast}
            </div>
            <div className="text-xs opacity-70">{gasPrice.unit}</div>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground text-center">
          Updates every 15 seconds
        </div>
      </CardContent>
    </Card>
  );
}

