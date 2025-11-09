'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Repeat, 
  Plus,
  Pause,
  Play,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Settings,
  TrendingUp,
  Users
} from 'lucide-react';
import { useState } from 'react';

interface RecurringPayment {
  id: string;
  name: string;
  recipient: string;
  recipientName: string;
  amount: number;
  token: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  nextPayment: Date;
  lastPayment?: Date;
  status: 'active' | 'paused' | 'failed' | 'completed';
  totalPaid: number;
  remainingPayments?: number;
  autoRenew: boolean;
  category: 'subscription' | 'salary' | 'bills' | 'donations' | 'other';
  createdAt: Date;
}

interface PaymentHistory {
  id: string;
  paymentId: string;
  amount: number;
  token: string;
  date: Date;
  status: 'success' | 'failed' | 'pending';
  txHash: string;
  gasUsed: number;
}

interface RecurringPaymentsManagerProps {
  walletAddress: string;
}

export function RecurringPaymentsManager({ walletAddress }: RecurringPaymentsManagerProps) {
  const [filterCategory, setFilterCategory] = useState<'all' | RecurringPayment['category']>('all');

  // Mock recurring payments
  const payments: RecurringPayment[] = [
    {
      id: '1',
      name: 'Netflix Subscription',
      recipient: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      recipientName: 'Netflix Inc.',
      amount: 15.99,
      token: 'USDC',
      frequency: 'monthly',
      nextPayment: new Date(Date.now() + 86400000 * 5),
      lastPayment: new Date(Date.now() - 86400000 * 25),
      status: 'active',
      totalPaid: 191.88,
      autoRenew: true,
      category: 'subscription',
      createdAt: new Date(Date.now() - 86400000 * 365),
    },
    {
      id: '2',
      name: 'Team Member Salary',
      recipient: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      recipientName: 'John Doe',
      amount: 5000,
      token: 'USDC',
      frequency: 'biweekly',
      nextPayment: new Date(Date.now() + 86400000 * 8),
      lastPayment: new Date(Date.now() - 86400000 * 6),
      status: 'active',
      totalPaid: 130000,
      remainingPayments: 24,
      autoRenew: false,
      category: 'salary',
      createdAt: new Date(Date.now() - 86400000 * 520),
    },
    {
      id: '3',
      name: 'Cloud Hosting',
      recipient: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      recipientName: 'AWS',
      amount: 250,
      token: 'USDC',
      frequency: 'monthly',
      nextPayment: new Date(Date.now() + 86400000 * 12),
      lastPayment: new Date(Date.now() - 86400000 * 18),
      status: 'active',
      totalPaid: 3000,
      autoRenew: true,
      category: 'bills',
      createdAt: new Date(Date.now() - 86400000 * 365),
    },
    {
      id: '4',
      name: 'Charity Donation',
      recipient: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
      recipientName: 'GiveWell',
      amount: 100,
      token: 'DAI',
      frequency: 'monthly',
      nextPayment: new Date(Date.now() + 86400000 * 15),
      lastPayment: new Date(Date.now() - 86400000 * 15),
      status: 'active',
      totalPaid: 600,
      autoRenew: true,
      category: 'donations',
      createdAt: new Date(Date.now() - 86400000 * 180),
    },
    {
      id: '5',
      name: 'Gym Membership',
      recipient: '0x456def...',
      recipientName: 'FitLife Gym',
      amount: 50,
      token: 'USDC',
      frequency: 'monthly',
      nextPayment: new Date(Date.now() + 86400000 * 3),
      status: 'paused',
      totalPaid: 300,
      autoRenew: false,
      category: 'subscription',
      createdAt: new Date(Date.now() - 86400000 * 180),
    },
  ];

  // Mock payment history
  const history: PaymentHistory[] = [
    {
      id: '1',
      paymentId: '1',
      amount: 15.99,
      token: 'USDC',
      date: new Date(Date.now() - 86400000 * 25),
      status: 'success',
      txHash: '0xabcd1234...',
      gasUsed: 65000,
    },
    {
      id: '2',
      paymentId: '2',
      amount: 5000,
      token: 'USDC',
      date: new Date(Date.now() - 86400000 * 6),
      status: 'success',
      txHash: '0xefgh5678...',
      gasUsed: 68000,
    },
    {
      id: '3',
      paymentId: '3',
      amount: 250,
      token: 'USDC',
      date: new Date(Date.now() - 86400000 * 18),
      status: 'success',
      txHash: '0xijkl9012...',
      gasUsed: 62000,
    },
  ];

  const filteredPayments = payments.filter(payment => {
    if (filterCategory === 'all') return true;
    return payment.category === filterCategory;
  });

  const activePayments = payments.filter(p => p.status === 'active').length;
  const totalMonthlySpend = payments
    .filter(p => p.status === 'active')
    .reduce((sum, p) => {
      const multiplier = {
        daily: 30,
        weekly: 4.33,
        biweekly: 2.16,
        monthly: 1,
        quarterly: 0.33,
        yearly: 0.083,
      }[p.frequency];
      return sum + (p.amount * multiplier);
    }, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.totalPaid, 0);
  const upcomingPayments = payments
    .filter(p => p.status === 'active')
    .sort((a, b) => a.nextPayment.getTime() - b.nextPayment.getTime())
    .slice(0, 3);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `in ${days}d`;
    return `in ${Math.floor(days / 7)}w`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>;
      case 'paused':
        return <Badge variant="warning" className="gap-1">
          <Pause className="h-3 w-3" />
          Paused
        </Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, any> = {
      subscription: { label: 'Subscription', variant: 'info' },
      salary: { label: 'Salary', variant: 'success' },
      bills: { label: 'Bills', variant: 'warning' },
      donations: { label: 'Donations', variant: 'default' },
      other: { label: 'Other', variant: 'outline' },
    };
    const style = styles[category] || { label: category, variant: 'outline' };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  const getFrequencyBadge = (frequency: string) => {
    return <Badge variant="outline" className="capitalize">{frequency}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Recurring Payments Manager
            </CardTitle>
            <CardDescription>
              Automate your regular crypto payments
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Payment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Repeat className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold">{activePayments}</p>
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalMonthlySpend)}</p>
            <p className="text-xs text-muted-foreground">Monthly Spend</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-muted-foreground">Total Paid</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-600">{upcomingPayments.length}</p>
            </div>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="mb-6 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
          <h4 className="text-sm font-semibold mb-3">Next Payments Due</h4>
          <div className="space-y-2">
            {upcomingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-2 rounded bg-card">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{payment.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(payment.amount)} {payment.token}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeUntil(payment.nextPayment)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filterCategory === 'subscription' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('subscription')}
          >
            Subscriptions
          </Button>
          <Button
            size="sm"
            variant={filterCategory === 'salary' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('salary')}
          >
            Salaries
          </Button>
          <Button
            size="sm"
            variant={filterCategory === 'bills' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('bills')}
          >
            Bills
          </Button>
          <Button
            size="sm"
            variant={filterCategory === 'donations' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('donations')}
          >
            Donations
          </Button>
        </div>

        {/* Recurring Payments List */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold">Your Recurring Payments</h4>
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className={`p-4 rounded-lg border transition-colors ${
                payment.status === 'active'
                  ? 'border-green-500/30 bg-green-500/5'
                  : payment.status === 'paused'
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h5 className="font-semibold">{payment.name}</h5>
                    {getStatusBadge(payment.status)}
                    {getCategoryBadge(payment.category)}
                    {getFrequencyBadge(payment.frequency)}
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">
                    To: {payment.recipientName} ({formatAddress(payment.recipient)})
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(payment.amount)} {payment.token}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Next Payment</p>
                      <p className="text-sm font-medium">{formatTimeUntil(payment.nextPayment)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Paid</p>
                      <p className="text-sm font-bold">{formatCurrency(payment.totalPaid)}</p>
                    </div>
                    {payment.remainingPayments && (
                      <div>
                        <p className="text-xs text-muted-foreground">Remaining</p>
                        <p className="text-sm font-medium">{payment.remainingPayments} payments</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {payment.lastPayment && (
                      <span>Last: {formatDate(payment.lastPayment)}</span>
                    )}
                    <span>•</span>
                    <span>Started: {formatDate(payment.createdAt)}</span>
                    {payment.autoRenew && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">Auto-renew enabled</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {payment.status === 'active' ? (
                  <Button size="sm" variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : payment.status === 'paused' ? (
                  <Button size="sm" variant="success">
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                ) : null}
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  View History
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold">Recent Transactions</h4>
          {history.slice(0, 3).map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{formatDate(tx.date)}</p>
                    {tx.status === 'success' && (
                      <Badge variant="success" className="gap-1 text-xs">
                        <CheckCircle2 className="h-3 w-3" />
                        Success
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tx.txHash} • Gas: {tx.gasUsed.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {formatCurrency(tx.amount)} {tx.token}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🔄 Recurring Payment Benefits</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Never miss a payment deadline</li>
            <li>• Fully automated - set it and forget it</li>
            <li>• Pay employees and contractors on time</li>
            <li>• Track all recurring expenses in one place</li>
            <li>• Cancel or modify payments anytime</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

