'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowDownUp, 
  Zap,
  ChevronDown,
  Settings,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Info,
  Clock,
  DollarSign
} from 'lucide-react';
import { useState } from 'react';

interface Token {
  symbol: string;
  name: string;
  address: string;
  balance: number;
  price: number;
  logo: string;
}

interface SwapRoute {
  dex: string;
  route: string[];
  outputAmount: number;
  priceImpact: number;
  gasEstimate: number;
  logo: string;
  estimatedTime: number;
}

interface TokenSwapAggregatorProps {
  walletAddress: string;
}

export function TokenSwapAggregator({ walletAddress }: TokenSwapAggregatorProps) {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('1.0');
  const [slippage, setSlippage] = useState(0.5);

  // Mock tokens
  const tokens: Token[] = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x0000000000000000000000000000000000000000',
      balance: 5.234,
      price: 2450.50,
      logo: '💎',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      balance: 10250.00,
      price: 1.00,
      logo: '💵',
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      balance: 5000.00,
      price: 1.00,
      logo: '💵',
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      balance: 3250.00,
      price: 0.999,
      logo: '🪙',
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      balance: 0.125,
      price: 43250.00,
      logo: '₿',
    },
  ];

  // Mock swap routes
  const swapRoutes: SwapRoute[] = [
    {
      dex: 'Uniswap V3',
      route: ['ETH', 'USDC'],
      outputAmount: 2445.25,
      priceImpact: 0.12,
      gasEstimate: 135000,
      logo: '🦄',
      estimatedTime: 15,
    },
    {
      dex: '1inch',
      route: ['ETH', 'DAI', 'USDC'],
      outputAmount: 2447.80,
      priceImpact: 0.08,
      gasEstimate: 185000,
      logo: '🐙',
      estimatedTime: 20,
    },
    {
      dex: 'Curve',
      route: ['ETH', 'USDT', 'USDC'],
      outputAmount: 2446.50,
      priceImpact: 0.10,
      gasEstimate: 165000,
      logo: '🌊',
      estimatedTime: 18,
    },
    {
      dex: 'Sushiswap',
      route: ['ETH', 'USDC'],
      outputAmount: 2443.90,
      priceImpact: 0.18,
      gasEstimate: 145000,
      logo: '🍣',
      estimatedTime: 16,
    },
  ].sort((a, b) => b.outputAmount - a.outputAmount);

  const bestRoute = swapRoutes[0];
  const savings = bestRoute.outputAmount - swapRoutes[swapRoutes.length - 1].outputAmount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 6) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const getPriceImpactBadge = (impact: number) => {
    if (impact < 0.1) return <Badge variant="secondary">Low</Badge>;
    if (impact < 0.5) return <Badge variant="outline">Medium</Badge>;
    return <Badge variant="destructive">High</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownUp className="h-5 w-5" />
              Token Swap Aggregator
            </CardTitle>
            <CardDescription>
              Find the best prices across all DEXes
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Swap Interface */}
        <div className="mb-6 space-y-3">
          {/* From Token */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">You Pay</span>
              <span className="text-xs text-muted-foreground">
                Balance: {tokens[0].balance.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-1 text-2xl font-bold bg-transparent border-none outline-none"
                placeholder="0.0"
              />
              <Button variant="outline" className="gap-2">
                <span className="text-2xl">{tokens[0].logo}</span>
                <span className="font-bold">{tokens[0].symbol}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ≈ {formatCurrency(parseFloat(fromAmount) * tokens[0].price)}
            </p>
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">You Receive</span>
              <span className="text-xs text-muted-foreground">
                Balance: {tokens[1].balance.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={bestRoute?.outputAmount.toFixed(2) || '0.00'}
                readOnly
                className="flex-1 text-2xl font-bold bg-transparent border-none outline-none text-primary"
                placeholder="0.0"
              />
              <Button variant="outline" className="gap-2">
                <span className="text-2xl">{tokens[1].logo}</span>
                <span className="font-bold">{tokens[1].symbol}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ≈ {formatCurrency(bestRoute?.outputAmount || 0)}
            </p>
          </div>

          {/* Slippage Settings */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Slippage Tolerance</span>
            </div>
            <div className="flex gap-1">
              {[0.1, 0.5, 1.0].map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={slippage === value ? 'default' : 'outline'}
                  onClick={() => setSlippage(value)}
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Best Route Highlight */}
        {bestRoute && (
          <div className="mb-6 p-4 rounded-lg border border-green-500/30 bg-green-500/5">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{bestRoute.logo}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-green-600">Best Rate: {bestRoute.dex}</h4>
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    Recommended
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">You Get</p>
                    <p className="text-sm font-bold text-green-600">
                      {formatNumber(bestRoute.outputAmount, 2)} {tokens[1].symbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Price Impact</p>
                    <div className="flex items-center gap-1">
                      {getPriceImpactBadge(bestRoute.priceImpact)}
                      <span className="text-sm font-medium">{bestRoute.priceImpact}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gas</p>
                    <p className="text-sm font-medium">
                      ~{formatCurrency((bestRoute.gasEstimate * 30) / 1e9)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-sm font-medium">{bestRoute.estimatedTime}s</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Route:</span>
                  {bestRoute.route.map((token, index) => (
                    <span key={index} className="flex items-center gap-1">
                      {index > 0 && <span>→</span>}
                      <Badge variant="outline">{token}</Badge>
                    </span>
                  ))}
                </div>
                {savings > 0 && (
                  <p className="mt-2 text-xs text-green-600">
                    💰 Save {formatCurrency(savings)} vs worst rate
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Routes Comparison */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">All Available Routes</h4>
            <Button size="sm" variant="ghost">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          {swapRoutes.map((route, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                index === 0
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">{route.logo}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-sm">{route.dex}</h5>
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs">Best</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatNumber(route.outputAmount, 2)} {tokens[1].symbol}</span>
                      <span>•</span>
                      <span>{route.priceImpact}% impact</span>
                      <span>•</span>
                      <span>{route.estimatedTime}s</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {formatCurrency(route.outputAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Gas: {formatCurrency((route.gasEstimate * 30) / 1e9)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Swap Button */}
        <Button size="lg" className="w-full mb-4">
          <Zap className="h-5 w-5 mr-2" />
          Swap Tokens
        </Button>

        {/* Info Boxes */}
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium mb-1">Smart Routing</p>
                <p className="text-xs text-muted-foreground">
                  We automatically split your trade across multiple DEXes to get you the best price
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium mb-1">Price Impact Warning</p>
                <p className="text-xs text-muted-foreground">
                  Large trades may experience higher slippage. Consider splitting into smaller swaps.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">💡 Swap Optimization Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Check multiple routes to ensure best price</li>
            <li>• Consider gas costs for smaller trades</li>
            <li>• Set appropriate slippage for volatile tokens</li>
            <li>• Verify token contract addresses before swapping</li>
            <li>• Monitor price impact on large trades</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

