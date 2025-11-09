'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Building2,
  TrendingUp,
  DollarSign,
  MapPin,
  Users,
  Calendar,
  Target,
  Shield,
  Activity,
  Award,
  Clock,
  CheckCircle2,
  BarChart3,
  PieChart,
  ExternalLink,
  Eye,
  Plus,
  Percent,
  TrendingDown
} from 'lucide-react';
import { useState } from 'react';

interface RealEstateToken {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'industrial' | 'land';
  location: string;
  country: string;
  image: string;
  totalValue: number;
  tokenPrice: number;
  yourShares: number;
  totalShares: number;
  yourInvestment: number;
  currentValue: number;
  unrealizedGain: number;
  gainPercentage: number;
  monthlyRent: number;
  annualYield: number;
  occupancyRate: number;
  purchaseDate: Date;
  verified: boolean;
  audited: boolean;
  protocol: string;
}

interface RealEstateOpportunity {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'industrial' | 'land';
  location: string;
  country: string;
  image: string;
  totalValue: number;
  minInvestment: number;
  targetRaise: number;
  currentRaise: number;
  tokenPrice: number;
  projectedYield: number;
  fundingDeadline: Date;
  investorCount: number;
  verified: boolean;
  highlights: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface RentalIncome {
  id: string;
  propertyId: string;
  propertyName: string;
  amount: number;
  date: Date;
  status: 'paid' | 'pending';
  type: 'monthly' | 'quarterly' | 'annual';
}

interface RealEstateTokenizationHubProps {
  walletAddress: string;
}

export function RealEstateTokenizationHub({ walletAddress }: RealEstateTokenizationHubProps) {
  const [selectedView, setSelectedView] = useState<'portfolio' | 'opportunities' | 'income'>('portfolio');

  // Mock real estate tokens
  const realEstateTokens: RealEstateToken[] = [
    {
      id: '1',
      name: 'Manhattan Luxury Apartment',
      type: 'residential',
      location: 'New York, NY',
      country: 'USA',
      image: '🏙️',
      totalValue: 5000000,
      tokenPrice: 100,
      yourShares: 500,
      totalShares: 50000,
      yourInvestment: 48000,
      currentValue: 52500,
      unrealizedGain: 4500,
      gainPercentage: 9.4,
      monthlyRent: 425,
      annualYield: 10.6,
      occupancyRate: 98,
      purchaseDate: new Date(Date.now() - 86400000 * 365),
      verified: true,
      audited: true,
      protocol: 'RealT',
    },
    {
      id: '2',
      name: 'Dubai Commercial Tower',
      type: 'commercial',
      location: 'Dubai Marina',
      country: 'UAE',
      image: '🏢',
      totalValue: 12000000,
      tokenPrice: 500,
      yourShares: 100,
      totalShares: 24000,
      yourInvestment: 48000,
      currentValue: 51000,
      unrealizedGain: 3000,
      gainPercentage: 6.3,
      monthlyRent: 520,
      annualYield: 13.0,
      occupancyRate: 100,
      purchaseDate: new Date(Date.now() - 86400000 * 180),
      verified: true,
      audited: true,
      protocol: 'Propy',
    },
    {
      id: '3',
      name: 'Tokyo Office Space',
      type: 'commercial',
      location: 'Shibuya, Tokyo',
      country: 'Japan',
      image: '🏛️',
      totalValue: 8000000,
      tokenPrice: 200,
      yourShares: 250,
      totalShares: 40000,
      yourInvestment: 48500,
      currentValue: 52000,
      unrealizedGain: 3500,
      gainPercentage: 7.2,
      monthlyRent: 480,
      annualYield: 11.9,
      occupancyRate: 95,
      purchaseDate: new Date(Date.now() - 86400000 * 270),
      verified: true,
      audited: false,
      protocol: 'RealT',
    },
  ];

  // Mock opportunities
  const opportunities: RealEstateOpportunity[] = [
    {
      id: '1',
      name: 'Miami Beach Resort',
      type: 'commercial',
      location: 'Miami Beach, FL',
      country: 'USA',
      image: '🏖️',
      totalValue: 15000000,
      minInvestment: 1000,
      targetRaise: 5000000,
      currentRaise: 3250000,
      tokenPrice: 250,
      projectedYield: 14.5,
      fundingDeadline: new Date(Date.now() + 86400000 * 30),
      investorCount: 432,
      verified: true,
      highlights: [
        'Prime beachfront location',
        'Renovated in 2023',
        'High tourist demand',
        'Strong rental history',
      ],
      riskLevel: 'low',
    },
    {
      id: '2',
      name: 'London Student Housing',
      type: 'residential',
      location: 'Central London',
      country: 'UK',
      image: '🎓',
      totalValue: 6000000,
      minInvestment: 500,
      targetRaise: 2000000,
      currentRaise: 1450000,
      tokenPrice: 100,
      projectedYield: 12.0,
      fundingDeadline: new Date(Date.now() + 86400000 * 15),
      investorCount: 287,
      verified: true,
      highlights: [
        'Near major universities',
        'Fully furnished units',
        'Guaranteed occupancy',
        'Long-term leases',
      ],
      riskLevel: 'low',
    },
    {
      id: '3',
      name: 'Singapore Industrial Warehouse',
      type: 'industrial',
      location: 'Jurong',
      country: 'Singapore',
      image: '🏭',
      totalValue: 10000000,
      minInvestment: 2000,
      targetRaise: 3000000,
      currentRaise: 850000,
      tokenPrice: 400,
      projectedYield: 16.0,
      fundingDeadline: new Date(Date.now() + 86400000 * 45),
      investorCount: 125,
      verified: true,
      highlights: [
        'Strategic logistics location',
        'Long-term corporate tenant',
        'Modern facilities',
        'Growing market demand',
      ],
      riskLevel: 'medium',
    },
  ];

  // Mock rental income
  const rentalIncome: RentalIncome[] = [
    {
      id: '1',
      propertyId: '1',
      propertyName: 'Manhattan Luxury Apartment',
      amount: 425,
      date: new Date(Date.now() - 86400000 * 5),
      status: 'paid',
      type: 'monthly',
    },
    {
      id: '2',
      propertyId: '2',
      propertyName: 'Dubai Commercial Tower',
      amount: 520,
      date: new Date(Date.now() - 86400000 * 3),
      status: 'paid',
      type: 'monthly',
    },
    {
      id: '3',
      propertyId: '3',
      propertyName: 'Tokyo Office Space',
      amount: 480,
      date: new Date(Date.now() - 86400000 * 7),
      status: 'paid',
      type: 'monthly',
    },
    {
      id: '4',
      propertyId: '1',
      propertyName: 'Manhattan Luxury Apartment',
      amount: 425,
      date: new Date(Date.now() + 86400000 * 25),
      status: 'pending',
      type: 'monthly',
    },
  ];

  const totalPortfolioValue = realEstateTokens.reduce((sum, t) => sum + t.currentValue, 0);
  const totalInvested = realEstateTokens.reduce((sum, t) => sum + t.yourInvestment, 0);
  const totalGain = totalPortfolioValue - totalInvested;
  const totalGainPercentage = (totalGain / totalInvested) * 100;
  const monthlyIncome = realEstateTokens.reduce((sum, t) => sum + t.monthlyRent, 0);
  const annualIncome = monthlyIncome * 12;
  const avgYield = realEstateTokens.reduce((sum, t) => sum + t.annualYield, 0) / realEstateTokens.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 2) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, any> = {
      residential: { variant: 'default', label: 'Residential' },
      commercial: { variant: 'info', label: 'Commercial' },
      industrial: { variant: 'warning', label: 'Industrial' },
      land: { variant: 'outline', label: 'Land' },
    };
    const style = styles[type] || { variant: 'outline', label: type };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    const styles = {
      low: { variant: 'success', label: 'Low Risk' },
      medium: { variant: 'warning', label: 'Medium Risk' },
      high: { variant: 'destructive', label: 'High Risk' },
    };
    const style = styles[risk as keyof typeof styles];
    return <Badge variant={style.variant as any}>{style.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'paid' ? (
      <Badge variant="success">Paid</Badge>
    ) : (
      <Badge variant="warning">Pending</Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Real Estate Tokenization Hub
            </CardTitle>
            <CardDescription>
              Invest in fractional real estate ownership globally
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Browse Properties
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className={`p-3 rounded-lg border text-center ${
            totalGain >= 0 
              ? 'border-green-500/20 bg-green-500/5' 
              : 'border-red-500/20 bg-red-500/5'
          }`}>
            <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(totalPortfolioValue)}
            </p>
            <p className="text-xs text-muted-foreground">Portfolio Value</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</p>
            <p className="text-xs text-muted-foreground">Monthly Income</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{avgYield.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Avg Yield</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{realEstateTokens.length}</p>
            <p className="text-xs text-muted-foreground">Properties</p>
          </div>
        </div>

        {/* View Selector */}
        <div className="mb-6 flex gap-2">
          <Button
            size="sm"
            variant={selectedView === 'portfolio' ? 'default' : 'outline'}
            onClick={() => setSelectedView('portfolio')}
          >
            <Building2 className="h-4 w-4 mr-2" />
            My Portfolio
          </Button>
          <Button
            size="sm"
            variant={selectedView === 'opportunities' ? 'default' : 'outline'}
            onClick={() => setSelectedView('opportunities')}
          >
            <Target className="h-4 w-4 mr-2" />
            Opportunities
          </Button>
          <Button
            size="sm"
            variant={selectedView === 'income' ? 'default' : 'outline'}
            onClick={() => setSelectedView('income')}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Income
          </Button>
        </div>

        {/* Portfolio View */}
        {selectedView === 'portfolio' && (
          <div className="space-y-4 mb-6">
            {realEstateTokens.map((token) => (
              <div
                key={token.id}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-5xl">{token.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h5 className="font-bold text-lg">{token.name}</h5>
                        {getTypeBadge(token.type)}
                        {token.verified && (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        {token.audited && (
                          <Badge variant="info" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Audited
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {token.location}, {token.country}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Your Shares</p>
                          <p className="text-sm font-bold">
                            {token.yourShares.toLocaleString()} / {token.totalShares.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Current Value</p>
                          <p className="text-sm font-bold">{formatCurrency(token.currentValue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly Rent</p>
                          <p className="text-sm font-bold text-green-500">{formatCurrency(token.monthlyRent)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Annual Yield</p>
                          <p className="text-sm font-bold">{token.annualYield.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${token.unrealizedGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {token.unrealizedGain >= 0 ? '+' : ''}{formatCurrency(token.unrealizedGain)}
                    </p>
                    <p className={`text-sm ${token.gainPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {token.gainPercentage >= 0 ? '+' : ''}{token.gainPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Property Details */}
                <div className="mb-3 p-3 rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Property Value</p>
                      <p className="font-bold">{formatCurrency(token.totalValue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Token Price</p>
                      <p className="font-bold">{formatCurrency(token.tokenPrice)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Occupancy</p>
                      <p className="font-bold">{token.occupancyRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Purchased</p>
                      <p className="font-bold">{formatDate(token.purchaseDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Buy More
                  </Button>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Opportunities View */}
        {selectedView === 'opportunities' && (
          <div className="space-y-4 mb-6">
            {opportunities.map((opp) => {
              const fundingPercentage = (opp.currentRaise / opp.targetRaise) * 100;
              const daysLeft = Math.floor((opp.fundingDeadline.getTime() - Date.now()) / 86400000);
              
              return (
                <div
                  key={opp.id}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-5xl">{opp.image}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h5 className="font-bold text-lg">{opp.name}</h5>
                          {getTypeBadge(opp.type)}
                          {getRiskBadge(opp.riskLevel)}
                          {opp.verified && (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {opp.location}, {opp.country}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Min Investment</p>
                            <p className="text-sm font-bold">{formatCurrency(opp.minInvestment)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Token Price</p>
                            <p className="text-sm font-bold">{formatCurrency(opp.tokenPrice)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Projected Yield</p>
                            <p className="text-sm font-bold text-green-500">{opp.projectedYield}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Days Left</p>
                            <p className="text-sm font-bold">{daysLeft}d</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Funding Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-semibold">
                        {formatCurrency(opp.currentRaise)} / {formatCurrency(opp.targetRaise)}
                      </span>
                      <span className="text-muted-foreground">
                        {fundingPercentage.toFixed(1)}% • {opp.investorCount} investors
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-primary transition-all"
                        style={{ width: `${fundingPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-3 flex flex-wrap gap-2">
                    {opp.highlights.map((highlight, index) => (
                      <Badge key={index} variant="outline" className="gap-1">
                        <Award className="h-3 w-3" />
                        {highlight}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Invest Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Income View */}
        {selectedView === 'income' && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
                <p className="text-2xl font-bold text-green-500">{formatCurrency(monthlyIncome)}</p>
                <p className="text-xs text-muted-foreground">Monthly Income</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card text-center">
                <p className="text-2xl font-bold">{formatCurrency(annualIncome)}</p>
                <p className="text-xs text-muted-foreground">Annual Projection</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card text-center">
                <p className="text-2xl font-bold">{((annualIncome / totalInvested) * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Income Yield</p>
              </div>
            </div>

            <h4 className="text-sm font-semibold mb-3">Recent Payments</h4>
            {rentalIncome.map((income) => (
              <div
                key={income.id}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold">{income.propertyName}</h5>
                      {getStatusBadge(income.status)}
                      <Badge variant="outline" className="capitalize">{income.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(income.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-500">
                      +{formatCurrency(income.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🏠 Real Estate Tokenization</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Fractional ownership of real-world properties</li>
            <li>• Earn passive rental income in crypto</li>
            <li>• Global diversification across countries</li>
            <li>• Liquid secondary market for tokens</li>
            <li>• Verified and audited properties</li>
            <li>• Start investing from $100</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

