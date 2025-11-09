'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';

interface TaxTransaction {
  id: string;
  date: Date;
  type: 'trade' | 'transfer' | 'income' | 'expense' | 'stake' | 'reward';
  description: string;
  token: string;
  amount: number;
  valueUSD: number;
  gainLoss?: number;
  taxCategory: string;
}

interface TaxSummary {
  year: number;
  totalTrades: number;
  capitalGains: number;
  capitalLosses: number;
  netGainLoss: number;
  income: number;
  expenses: number;
  stakingRewards: number;
  airdrops: number;
}

interface TaxReportingCenterProps {
  walletAddress: string;
}

export function TaxReportingCenter({ walletAddress }: TaxReportingCenterProps) {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock tax data
  const taxSummary: TaxSummary = {
    year: 2024,
    totalTrades: 156,
    capitalGains: 15420.50,
    capitalLosses: 3240.00,
    netGainLoss: 12180.50,
    income: 2450.00,
    expenses: 890.50,
    stakingRewards: 1850.00,
    airdrops: 600.00,
  };

  const recentTransactions: TaxTransaction[] = [
    {
      id: '1',
      date: new Date('2024-11-05'),
      type: 'trade',
      description: 'Swap ETH for USDC on Uniswap',
      token: 'ETH',
      amount: 2.5,
      valueUSD: 8750.00,
      gainLoss: 420.50,
      taxCategory: 'Short-term Capital Gain',
    },
    {
      id: '2',
      date: new Date('2024-11-03'),
      type: 'reward',
      description: 'Airdrop claim - ARB tokens',
      token: 'ARB',
      amount: 1250,
      valueUSD: 2125.00,
      taxCategory: 'Income',
    },
    {
      id: '3',
      date: new Date('2024-11-01'),
      type: 'stake',
      description: 'Staking rewards from Lido',
      token: 'ETH',
      amount: 0.042,
      valueUSD: 148.35,
      taxCategory: 'Staking Income',
    },
    {
      id: '4',
      date: new Date('2024-10-28'),
      type: 'trade',
      description: 'Swap USDT for ETH on Uniswap',
      token: 'USDT',
      amount: 5000,
      valueUSD: 5000.00,
      gainLoss: -125.00,
      taxCategory: 'Short-term Capital Loss',
    },
  ];

  const handleGenerateReport = async (format: 'pdf' | 'csv' | 'turbotax') => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    
    // In real implementation, trigger download
    alert(`${format.toUpperCase()} report generated for ${selectedYear}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trade':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'reward':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'stake':
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { label: string; variant: any }> = {
      trade: { label: 'Trade', variant: 'default' },
      transfer: { label: 'Transfer', variant: 'outline' },
      income: { label: 'Income', variant: 'secondary' },
      expense: { label: 'Expense', variant: 'destructive' },
      stake: { label: 'Stake', variant: 'info' },
      reward: { label: 'Reward', variant: 'secondary' },
    };
    const style = styles[type] || { label: type, variant: 'outline' };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tax Reporting Center
            </CardTitle>
            <CardDescription>
              Generate tax reports for your crypto transactions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedYear(selectedYear - 1)}
            >
              {selectedYear - 1}
            </Button>
            <Button size="sm" variant="default">
              {selectedYear}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedYear(selectedYear + 1)}
              disabled={selectedYear >= new Date().getFullYear()}
            >
              {selectedYear + 1}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tax Year Summary */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {selectedYear} Tax Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Trades</p>
              <p className="text-2xl font-bold">{taxSummary.totalTrades}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Net Gain/Loss</p>
              <p className={`text-2xl font-bold ${
                taxSummary.netGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(taxSummary.netGainLoss)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(taxSummary.income + taxSummary.stakingRewards + taxSummary.airdrops)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Expenses</p>
              <p className="text-2xl font-bold">{formatCurrency(taxSummary.expenses)}</p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Capital Gains/Losses */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="text-sm font-semibold mb-3">Capital Gains & Losses</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Capital Gains</span>
                </div>
                <span className="font-bold text-green-600">
                  {formatCurrency(taxSummary.capitalGains)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Capital Losses</span>
                </div>
                <span className="font-bold text-red-600">
                  ({formatCurrency(taxSummary.capitalLosses)})
                </span>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Net Capital Gain/Loss</span>
                  <span className={`font-bold ${
                    taxSummary.netGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(taxSummary.netGainLoss)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Income Breakdown */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="text-sm font-semibold mb-3">Income Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Staking Rewards</span>
                <span className="font-bold">{formatCurrency(taxSummary.stakingRewards)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Airdrops</span>
                <span className="font-bold">{formatCurrency(taxSummary.airdrops)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Other Income</span>
                <span className="font-bold">{formatCurrency(taxSummary.income)}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total Income</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(taxSummary.income + taxSummary.stakingRewards + taxSummary.airdrops)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mb-6 p-4 rounded-lg border border-border bg-card">
          <h4 className="text-sm font-semibold mb-3">Export Tax Report</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGenerateReport('pdf')}
              disabled={isGenerating}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF Report
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGenerateReport('csv')}
              disabled={isGenerating}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV Export
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGenerateReport('turbotax')}
              disabled={isGenerating}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              TurboTax
            </Button>
          </div>
          {isGenerating && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Generating report...
            </p>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Recent Taxable Events</h4>
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1">
                  {getTypeIcon(tx.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-sm">{tx.description}</p>
                      {getTypeBadge(tx.type)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-1">
                      <span>{tx.amount} {tx.token}</span>
                      <span>≈ {formatCurrency(tx.valueUSD)}</span>
                      <span>{tx.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {tx.taxCategory}
                      </Badge>
                      {tx.gainLoss !== undefined && (
                        <Badge variant={tx.gainLoss >= 0 ? 'secondary' : 'destructive'} className="text-xs">
                          {tx.gainLoss >= 0 ? '+' : ''}{formatCurrency(tx.gainLoss)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Important Notes */}
        <div className="mt-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm mb-2">Important Tax Information</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• This report is for informational purposes only</li>
                <li>• Consult with a tax professional for accurate filing</li>
                <li>• Tax laws vary by jurisdiction and change frequently</li>
                <li>• Keep records of all transactions for audit purposes</li>
                <li>• Report all crypto income to avoid penalties</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Partner Services */}
        <div className="mt-4 p-4 rounded-lg border border-border bg-card">
          <h4 className="text-sm font-semibold mb-3">Tax Partner Services</h4>
          <div className="space-y-2">
            <Button size="sm" variant="outline" className="w-full justify-between">
              <span>CoinTracker Pro</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-between">
              <span>Koinly Tax Reports</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-between">
              <span>CryptoTaxCalculator</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

