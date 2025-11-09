'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  QrCode,
  Copy,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Settings,
  Plus,
  ExternalLink,
  Mail
} from 'lucide-react';
import { useState } from 'react';

interface PaymentRequest {
  id: string;
  recipient: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  createdAt: Date;
  paidAt?: Date;
  expiresAt: Date;
  paymentLink: string;
  qrCode: string;
  txHash?: string;
}

interface PaymentMethod {
  symbol: string;
  name: string;
  logo: string;
  enabled: boolean;
  balance: number;
}

interface Transaction {
  id: string;
  type: 'received' | 'sent';
  amount: number;
  currency: string;
  from: string;
  to: string;
  timestamp: Date;
  status: 'confirmed' | 'pending';
  txHash: string;
}

interface CryptoPaymentGatewayProps {
  walletAddress: string;
}

export function CryptoPaymentGateway({ walletAddress }: CryptoPaymentGatewayProps) {
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USDC');

  // Mock payment requests
  const paymentRequests: PaymentRequest[] = [
    {
      id: '1',
      recipient: 'John Doe',
      amount: 500,
      currency: 'USDC',
      description: 'Website design services',
      status: 'paid',
      createdAt: new Date(Date.now() - 86400000 * 2),
      paidAt: new Date(Date.now() - 86400000 * 1),
      expiresAt: new Date(Date.now() + 86400000 * 5),
      paymentLink: 'https://pay.wallet.health/inv_abc123',
      qrCode: 'QR_CODE_DATA',
      txHash: '0xabcd1234...',
    },
    {
      id: '2',
      recipient: 'Alice Smith',
      amount: 250,
      currency: 'ETH',
      description: 'Consulting fee - Q4 2024',
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000 * 1),
      expiresAt: new Date(Date.now() + 86400000 * 6),
      paymentLink: 'https://pay.wallet.health/inv_def456',
      qrCode: 'QR_CODE_DATA',
    },
    {
      id: '3',
      recipient: 'TechCorp Inc.',
      amount: 1000,
      currency: 'USDC',
      description: 'Monthly subscription - January',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 12),
      expiresAt: new Date(Date.now() + 86400000 * 13),
      paymentLink: 'https://pay.wallet.health/inv_ghi789',
      qrCode: 'QR_CODE_DATA',
    },
  ];

  // Mock payment methods
  const paymentMethods: PaymentMethod[] = [
    { symbol: 'ETH', name: 'Ethereum', logo: '💎', enabled: true, balance: 5.234 },
    { symbol: 'USDC', name: 'USD Coin', logo: '💵', enabled: true, balance: 10250.00 },
    { symbol: 'USDT', name: 'Tether', logo: '💵', enabled: true, balance: 5000.00 },
    { symbol: 'DAI', name: 'Dai', logo: '🪙', enabled: true, balance: 3250.00 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', logo: '₿', enabled: false, balance: 0.125 },
  ];

  // Mock transactions
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'received',
      amount: 500,
      currency: 'USDC',
      from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      to: walletAddress,
      timestamp: new Date(Date.now() - 86400000 * 1),
      status: 'confirmed',
      txHash: '0xabcd1234...',
    },
    {
      id: '2',
      type: 'sent',
      amount: 0.5,
      currency: 'ETH',
      from: walletAddress,
      to: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      timestamp: new Date(Date.now() - 86400000 * 3),
      status: 'confirmed',
      txHash: '0xefgh5678...',
    },
    {
      id: '3',
      type: 'received',
      amount: 1200,
      currency: 'USDC',
      from: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      to: walletAddress,
      timestamp: new Date(Date.now() - 86400000 * 5),
      status: 'confirmed',
      txHash: '0xijkl9012...',
    },
  ];

  const pendingRequests = paymentRequests.filter(r => r.status === 'pending').length;
  const totalReceived = transactions
    .filter(t => t.type === 'received' && t.status === 'confirmed')
    .reduce((sum, t) => sum + (t.currency === 'USDC' || t.currency === 'DAI' ? t.amount : 0), 0);
  const paidInvoices = paymentRequests.filter(r => r.status === 'paid').length;
  const totalVolume = totalReceived;

  const formatCurrency = (value: number, currency: string) => {
    if (currency === 'ETH' || currency === 'WBTC') {
      return `${value.toFixed(4)} ${currency}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Paid
        </Badge>;
      case 'pending':
        return <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
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
              <CreditCard className="h-5 w-5" />
              Crypto Payment Gateway
            </CardTitle>
            <CardDescription>
              Accept crypto payments and manage invoices
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowCreateRequest(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-yellow-500" />
              <p className="text-2xl font-bold">{pendingRequests}</p>
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-2xl font-bold text-green-600">{paidInvoices}</p>
            </div>
            <p className="text-xs text-muted-foreground">Paid</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalReceived, 'USDC')}
            </p>
            <p className="text-xs text-muted-foreground">Received</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">
              {formatCurrency(totalVolume, 'USDC')}
            </p>
            <p className="text-xs text-muted-foreground">Total Volume</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
          <div className="grid md:grid-cols-3 gap-2">
            <Button size="sm" variant="outline" className="w-full">
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
            <Button size="sm" variant="outline" className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share Payment Link
            </Button>
            <Button size="sm" variant="outline" className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Email Invoice
            </Button>
          </div>
        </div>

        {/* Accepted Currencies */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Accepted Payment Methods</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-colors ${
                  method.enabled
                    ? 'border-border hover:bg-muted/50'
                    : 'border-border opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{method.logo}</span>
                    <div>
                      <h5 className="font-semibold text-sm">{method.name}</h5>
                      <p className="text-xs text-muted-foreground">
                        {method.enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {formatCurrency(method.balance, method.symbol)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Requests/Invoices */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-semibold">Payment Requests</h4>
          {paymentRequests.map((request) => (
            <div
              key={request.id}
              className={`p-4 rounded-lg border transition-colors ${
                request.status === 'paid'
                  ? 'border-green-500/30 bg-green-500/5'
                  : request.status === 'pending'
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-border opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h5 className="font-semibold">{request.recipient}</h5>
                    {getStatusBadge(request.status)}
                    <Badge variant="outline">{request.currency}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {request.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(request.amount, request.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">{formatTimeAgo(request.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {request.status === 'paid' ? 'Paid' : 'Expires'}
                      </p>
                      <p className="text-sm font-medium">
                        {request.paidAt 
                          ? formatTimeAgo(request.paidAt)
                          : formatTimeUntil(request.expiresAt)
                        }
                      </p>
                    </div>
                  </div>

                  {request.status === 'paid' && request.txHash && (
                    <div className="p-2 rounded bg-green-500/10 border border-green-500/20 mb-2">
                      <p className="text-xs text-green-600">
                        ✓ Payment confirmed • Tx: {request.txHash}
                      </p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Payment Link:</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1">
                          {request.paymentLink}
                        </p>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {request.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline">
                      <QrCode className="h-4 w-4 mr-2" />
                      Show QR
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </>
                )}
                {request.status === 'paid' && (
                  <>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Transaction
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Recent Transactions</h4>
          {transactions.slice(0, 3).map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={tx.type === 'received' ? 'secondary' : 'default'}>
                      {tx.type === 'received' ? '↓ Received' : '↑ Sent'}
                    </Badge>
                    <Badge variant="outline">{tx.currency}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {tx.type === 'received' ? 'From' : 'To'}: {formatAddress(tx.type === 'received' ? tx.from : tx.to)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(tx.timestamp)} • {tx.txHash}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    tx.type === 'received' ? 'text-green-600' : 'text-primary'
                  }`}>
                    {tx.type === 'received' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">💳 Payment Gateway Features</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Accept multiple cryptocurrencies</li>
            <li>• Generate payment links and QR codes</li>
            <li>• Email invoices to clients automatically</li>
            <li>• Real-time payment notifications</li>
            <li>• Export transaction history for accounting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

