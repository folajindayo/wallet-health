'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Plus,
  TrendingUp,
  TrendingDown,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Target,
  Calendar,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';

interface LimitOrder {
  id: string;
  type: 'buy' | 'sell';
  fromToken: string;
  toToken: string;
  fromAmount: number;
  targetPrice: number;
  currentPrice: number;
  filled: number;
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  estimatedOutput: number;
  protocol: string;
}

interface LimitOrderManagerProps {
  walletAddress: string;
}

export function LimitOrderManager({ walletAddress }: LimitOrderManagerProps) {
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'filled' | 'cancelled'>('all');

  // Mock limit orders
  const orders: LimitOrder[] = [
    {
      id: '1',
      type: 'buy',
      fromToken: 'USDC',
      toToken: 'ETH',
      fromAmount: 5000,
      targetPrice: 2300,
      currentPrice: 2450,
      filled: 0,
      status: 'active',
      expiresAt: new Date(Date.now() + 86400000 * 7),
      createdAt: new Date(Date.now() - 86400000 * 2),
      estimatedOutput: 2.17,
      protocol: 'CoW Protocol',
    },
    {
      id: '2',
      type: 'sell',
      fromToken: 'ETH',
      toToken: 'USDC',
      fromAmount: 2,
      targetPrice: 2600,
      currentPrice: 2450,
      filled: 0,
      status: 'active',
      expiresAt: new Date(Date.now() + 86400000 * 14),
      createdAt: new Date(Date.now() - 86400000 * 5),
      estimatedOutput: 5200,
      protocol: '1inch Limit Order',
    },
    {
      id: '3',
      type: 'buy',
      fromToken: 'USDC',
      toToken: 'WBTC',
      fromAmount: 10000,
      targetPrice: 42000,
      currentPrice: 43250,
      filled: 100,
      status: 'filled',
      expiresAt: new Date(Date.now() + 86400000 * 3),
      createdAt: new Date(Date.now() - 86400000 * 8),
      estimatedOutput: 0.238,
      protocol: 'CoW Protocol',
    },
    {
      id: '4',
      type: 'sell',
      fromToken: 'UNI',
      toToken: 'USDC',
      fromAmount: 500,
      targetPrice: 8.5,
      currentPrice: 7.2,
      filled: 0,
      status: 'active',
      expiresAt: new Date(Date.now() + 86400000 * 30),
      createdAt: new Date(Date.now() - 86400000 * 15),
      estimatedOutput: 4250,
      protocol: '1inch Limit Order',
    },
    {
      id: '5',
      type: 'buy',
      fromToken: 'DAI',
      toToken: 'LINK',
      fromAmount: 1000,
      targetPrice: 12.5,
      currentPrice: 14.2,
      filled: 0,
      status: 'cancelled',
      expiresAt: new Date(Date.now() - 86400000 * 1),
      createdAt: new Date(Date.now() - 86400000 * 10),
      estimatedOutput: 80,
      protocol: 'CoW Protocol',
    },
  ];

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const activeOrders = orders.filter(o => o.status === 'active').length;
  const filledOrders = orders.filter(o => o.status === 'filled').length;
  const totalVolume = orders
    .filter(o => o.status === 'filled')
    .reduce((sum, o) => sum + o.fromAmount, 0);
  const pendingValue = orders
    .filter(o => o.status === 'active')
    .reduce((sum, o) => sum + o.fromAmount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 6) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (diff < 0) return 'Expired';
    if (hours < 24) return `${hours}h left`;
    return `${days}d left`;
  };

  const getPriceDifference = (target: number, current: number) => {
    const diff = ((target - current) / current) * 100;
    return diff;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="gap-1">
          <Clock className="h-3 w-3" />
          Active
        </Badge>;
      case 'filled':
        return <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Filled
        </Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="gap-1">
          <XCircle className="h-3 w-3" />
          Cancelled
        </Badge>;
      case 'expired':
        return <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Expired
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Limit Order Manager
            </CardTitle>
            <CardDescription>
              Set target prices and execute automatically
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowCreateOrder(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <p className="text-2xl font-bold">{activeOrders}</p>
            </div>
            <p className="text-xs text-muted-foreground">Active Orders</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-2xl font-bold text-green-600">{filledOrders}</p>
            </div>
            <p className="text-xs text-muted-foreground">Filled Orders</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalVolume)}</p>
            <p className="text-xs text-muted-foreground">Total Volume</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingValue)}</p>
            <p className="text-xs text-muted-foreground">Pending Value</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
          >
            All Orders
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('active')}
          >
            Active
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'filled' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('filled')}
          >
            Filled
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('cancelled')}
          >
            Cancelled
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const priceDiff = getPriceDifference(order.targetPrice, order.currentPrice);
            const isCloseToTarget = Math.abs(priceDiff) < 5;

            return (
              <div
                key={order.id}
                className={`p-4 rounded-lg border transition-colors ${
                  order.status === 'filled'
                    ? 'border-green-500/30 bg-green-500/5'
                    : order.status === 'cancelled'
                    ? 'border-border opacity-60'
                    : isCloseToTarget
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        {order.type === 'buy' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <h5 className="font-semibold">
                          {order.type.toUpperCase()} {order.fromAmount} {order.fromToken}
                        </h5>
                      </div>
                      {getStatusBadge(order.status)}
                      <Badge variant="outline" className="text-xs">{order.protocol}</Badge>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Target Price</p>
                        <p className="text-sm font-bold">
                          {formatCurrency(order.targetPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current Price</p>
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(order.currentPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Difference</p>
                        <p className={`text-sm font-bold ${
                          priceDiff > 0 
                            ? order.type === 'sell' ? 'text-green-600' : 'text-red-600'
                            : order.type === 'sell' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Output</p>
                        <p className="text-sm font-bold">
                          {formatNumber(order.estimatedOutput, 4)} {order.toToken}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar for Filled Orders */}
                    {order.filled > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Filled</span>
                          <span className="font-medium">{order.filled}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${order.filled}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Close to Target Warning */}
                    {isCloseToTarget && order.status === 'active' && (
                      <div className="mb-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-xs text-yellow-600">
                          ⚡ Price is close to your target! Order may execute soon.
                        </p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created {formatTimeAgo(order.createdAt)}</span>
                      </div>
                      {order.status === 'active' && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeUntil(order.expiresAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {order.status === 'active' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Orders Found</p>
            <p className="text-xs text-muted-foreground mb-4">
              {filterStatus === 'all'
                ? 'Create your first limit order to get started'
                : `No ${filterStatus} orders`}
            </p>
            {filterStatus === 'all' && (
              <Button onClick={() => setShowCreateOrder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Limit Order
              </Button>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🎯 Limit Order Benefits</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Execute trades at your desired price automatically</li>
            <li>• No gas fees until order is filled (gasless)</li>
            <li>• MEV protection through CoW Protocol</li>
            <li>• Set expiration dates for better control</li>
            <li>• Partial fills supported on some protocols</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

