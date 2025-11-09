'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, 
  ShoppingBag,
  DollarSign,
  Star,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  Target,
  Zap,
  Award,
  Heart,
  Send,
  CreditCard,
  Percent,
  Tag,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Activity,
  Globe
} from 'lucide-react';
import { useState } from 'react';

interface GiftCard {
  id: string;
  brand: string;
  logo: string;
  category: 'shopping' | 'food' | 'entertainment' | 'travel' | 'gaming' | 'subscription';
  country: string;
  denominations: number[];
  discount: number; // percentage off
  cashbackRate: number; // percentage cashback in crypto
  rating: number;
  reviewCount: number;
  instantDelivery: boolean;
  description: string;
  popular: boolean;
}

interface PurchasedCard {
  id: string;
  brand: string;
  logo: string;
  amount: number;
  paidAmount: number;
  discount: number;
  cashback: number;
  code: string;
  pin?: string;
  status: 'active' | 'used' | 'expired';
  purchaseDate: Date;
  expiryDate: Date;
  redeemUrl?: string;
}

interface RewardProgram {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  discount: number;
  icon: any;
  active: boolean;
}

interface CryptoGiftCardsMarketplaceProps {
  walletAddress: string;
}

export function CryptoGiftCardsMarketplace({ walletAddress }: CryptoGiftCardsMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | GiftCard['category']>('all');
  const [selectedView, setSelectedView] = useState<'marketplace' | 'mygifts' | 'rewards'>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock gift cards
  const giftCards: GiftCard[] = [
    {
      id: '1',
      brand: 'Amazon',
      logo: '📦',
      category: 'shopping',
      country: 'USA',
      denominations: [10, 25, 50, 100, 250, 500],
      discount: 5,
      cashbackRate: 2,
      rating: 4.8,
      reviewCount: 12453,
      instantDelivery: true,
      description: 'Shop everything on Amazon with crypto',
      popular: true,
    },
    {
      id: '2',
      brand: 'Starbucks',
      logo: '☕',
      category: 'food',
      country: 'USA',
      denominations: [10, 25, 50],
      discount: 3,
      cashbackRate: 1.5,
      rating: 4.6,
      reviewCount: 8234,
      instantDelivery: true,
      description: 'Get your favorite coffee with crypto',
      popular: true,
    },
    {
      id: '3',
      brand: 'Netflix',
      logo: '🎬',
      category: 'subscription',
      country: 'Global',
      denominations: [15, 30, 60],
      discount: 8,
      cashbackRate: 3,
      rating: 4.9,
      reviewCount: 15678,
      instantDelivery: true,
      description: 'Stream unlimited movies and shows',
      popular: true,
    },
    {
      id: '4',
      brand: 'Uber',
      logo: '🚗',
      category: 'travel',
      country: 'USA',
      denominations: [25, 50, 100, 200],
      discount: 4,
      cashbackRate: 2,
      rating: 4.5,
      reviewCount: 6789,
      instantDelivery: true,
      description: 'Ride and eat with Uber',
      popular: false,
    },
    {
      id: '5',
      brand: 'Steam',
      logo: '🎮',
      category: 'gaming',
      country: 'Global',
      denominations: [10, 20, 50, 100],
      discount: 6,
      cashbackRate: 2.5,
      rating: 4.7,
      reviewCount: 9876,
      instantDelivery: true,
      description: 'Buy games and in-game items',
      popular: true,
    },
    {
      id: '6',
      brand: 'Airbnb',
      logo: '🏠',
      category: 'travel',
      country: 'Global',
      denominations: [50, 100, 250, 500],
      discount: 7,
      cashbackRate: 3,
      rating: 4.8,
      reviewCount: 5432,
      instantDelivery: true,
      description: 'Book unique stays worldwide',
      popular: false,
    },
    {
      id: '7',
      brand: 'Spotify',
      logo: '🎵',
      category: 'subscription',
      country: 'Global',
      denominations: [10, 30, 60],
      discount: 5,
      cashbackRate: 2,
      rating: 4.6,
      reviewCount: 7654,
      instantDelivery: true,
      description: 'Music streaming premium',
      popular: true,
    },
    {
      id: '8',
      brand: 'Apple',
      logo: '🍎',
      category: 'shopping',
      country: 'USA',
      denominations: [15, 25, 50, 100, 250],
      discount: 4,
      cashbackRate: 1.5,
      rating: 4.9,
      reviewCount: 11234,
      instantDelivery: true,
      description: 'Apple products and services',
      popular: true,
    },
  ];

  // Mock purchased cards
  const purchasedCards: PurchasedCard[] = [
    {
      id: '1',
      brand: 'Amazon',
      logo: '📦',
      amount: 50,
      paidAmount: 47.50,
      discount: 5,
      cashback: 1.00,
      code: 'XXXX-YYYY-ZZZZ-AAAA',
      status: 'active',
      purchaseDate: new Date(Date.now() - 86400000 * 3),
      expiryDate: new Date(Date.now() + 86400000 * 360),
      redeemUrl: 'https://amazon.com/redeem',
    },
    {
      id: '2',
      brand: 'Starbucks',
      logo: '☕',
      amount: 25,
      paidAmount: 24.25,
      discount: 3,
      cashback: 0.38,
      code: 'BBBB-CCCC-DDDD-EEEE',
      status: 'active',
      purchaseDate: new Date(Date.now() - 86400000 * 7),
      expiryDate: new Date(Date.now() + 86400000 * 180),
      redeemUrl: 'https://starbucks.com',
    },
    {
      id: '3',
      brand: 'Netflix',
      logo: '🎬',
      amount: 30,
      paidAmount: 27.60,
      discount: 8,
      cashback: 0.90,
      code: 'FFFF-GGGG-HHHH-IIII',
      status: 'used',
      purchaseDate: new Date(Date.now() - 86400000 * 30),
      expiryDate: new Date(Date.now() + 86400000 * 330),
    },
  ];

  // Mock reward programs
  const rewardPrograms: RewardProgram[] = [
    {
      id: '1',
      name: 'Bronze Tier',
      description: 'Additional 1% discount on all purchases',
      pointsRequired: 0,
      discount: 1,
      icon: Award,
      active: true,
    },
    {
      id: '2',
      name: 'Silver Tier',
      description: 'Additional 2% discount + priority support',
      pointsRequired: 1000,
      discount: 2,
      icon: Award,
      active: false,
    },
    {
      id: '3',
      name: 'Gold Tier',
      description: 'Additional 3% discount + exclusive deals',
      pointsRequired: 5000,
      discount: 3,
      icon: Award,
      active: false,
    },
    {
      id: '4',
      name: 'Platinum Tier',
      description: 'Additional 5% discount + VIP benefits',
      pointsRequired: 10000,
      discount: 5,
      icon: Award,
      active: false,
    },
  ];

  const filteredCards = giftCards.filter(card => {
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    const matchesSearch = card.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalSpent = purchasedCards.reduce((sum, card) => sum + card.paidAmount, 0);
  const totalSaved = purchasedCards.reduce((sum, card) => sum + (card.amount - card.paidAmount), 0);
  const totalCashback = purchasedCards.reduce((sum, card) => sum + card.cashback, 0);
  const activeCards = purchasedCards.filter(c => c.status === 'active').length;
  const currentPoints = 750; // Mock points

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, any> = {
      shopping: { variant: 'default', label: 'Shopping' },
      food: { variant: 'success', label: 'Food & Drink' },
      entertainment: { variant: 'info', label: 'Entertainment' },
      travel: { variant: 'warning', label: 'Travel' },
      gaming: { variant: 'destructive', label: 'Gaming' },
      subscription: { variant: 'outline', label: 'Subscription' },
    };
    const style = styles[category] || { variant: 'outline', label: category };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'used':
        return <Badge variant="outline">Used</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
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
              <Gift className="h-5 w-5" />
              Crypto Gift Cards Marketplace
            </CardTitle>
            <CardDescription>
              Buy gift cards with crypto and earn cashback
            </CardDescription>
          </div>
          <Button size="sm">
            <Search className="h-4 w-4 mr-2" />
            Browse All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-2xl font-bold text-green-500">{formatCurrency(totalSaved)}</p>
            <p className="text-xs text-muted-foreground">Total Saved</p>
          </div>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalCashback)}</p>
            <p className="text-xs text-muted-foreground">Cashback Earned</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card text-center">
            <p className="text-2xl font-bold">{activeCards}</p>
            <p className="text-xs text-muted-foreground">Active Cards</p>
          </div>
        </div>

        {/* View Selector */}
        <div className="mb-6 flex gap-2">
          <Button
            size="sm"
            variant={selectedView === 'marketplace' ? 'default' : 'outline'}
            onClick={() => setSelectedView('marketplace')}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Marketplace
          </Button>
          <Button
            size="sm"
            variant={selectedView === 'mygifts' ? 'default' : 'outline'}
            onClick={() => setSelectedView('mygifts')}
          >
            <Gift className="h-4 w-4 mr-2" />
            My Gifts
          </Button>
          <Button
            size="sm"
            variant={selectedView === 'rewards' ? 'default' : 'outline'}
            onClick={() => setSelectedView('rewards')}
          >
            <Award className="h-4 w-4 mr-2" />
            Rewards ({currentPoints})
          </Button>
        </div>

        {/* Marketplace View */}
        {selectedView === 'marketplace' && (
          <>
            {/* Search and Filters */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brands..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'shopping', 'food', 'entertainment', 'travel', 'gaming', 'subscription'] as const).map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Gift Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    card.popular
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-5xl">{card.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h5 className="font-bold text-lg">{card.brand}</h5>
                        {getCategoryBadge(card.category)}
                        {card.popular && (
                          <Badge variant="warning" className="gap-1">
                            <Star className="h-3 w-3" />
                            Popular
                          </Badge>
                        )}
                        {card.instantDelivery && (
                          <Badge variant="success" className="gap-1">
                            <Zap className="h-3 w-3" />
                            Instant
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {card.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs mb-2">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {card.rating} ({card.reviewCount.toLocaleString()})
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {card.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="success" className="gap-1">
                          <Percent className="h-3 w-3" />
                          {card.discount}% OFF
                        </Badge>
                        <Badge variant="info" className="gap-1">
                          <DollarSign className="h-3 w-3" />
                          {card.cashbackRate}% Cashback
                        </Badge>
                      </div>
                      <div className="flex gap-2 flex-wrap mb-3">
                        {card.denominations.slice(0, 4).map((amount) => (
                          <Badge key={amount} variant="outline">
                            ${amount}
                          </Badge>
                        ))}
                        {card.denominations.length > 4 && (
                          <Badge variant="outline">+{card.denominations.length - 4} more</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* My Gifts View */}
        {selectedView === 'mygifts' && (
          <div className="space-y-3 mb-6">
            {purchasedCards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-4xl">{card.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h5 className="font-semibold">{card.brand}</h5>
                        {getStatusBadge(card.status)}
                        <Badge variant="outline">{formatCurrency(card.amount)}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <p className="text-muted-foreground">Paid Amount</p>
                          <p className="font-bold">{formatCurrency(card.paidAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">You Saved</p>
                          <p className="font-bold text-green-500">
                            {formatCurrency(card.amount - card.paidAmount)} ({card.discount}%)
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cashback</p>
                          <p className="font-bold text-primary">{formatCurrency(card.cashback)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expires</p>
                          <p className="font-bold">{formatDate(card.expiryDate)}</p>
                        </div>
                      </div>
                      {card.status === 'active' && (
                        <div className="p-2 rounded bg-muted/50 mb-2">
                          <p className="text-xs text-muted-foreground mb-1">Gift Card Code:</p>
                          <p className="font-mono font-bold">{card.code}</p>
                          {card.pin && (
                            <p className="text-xs mt-1">
                              <span className="text-muted-foreground">PIN: </span>
                              <span className="font-mono font-bold">{card.pin}</span>
                            </p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Purchased: {formatDate(card.purchaseDate)}
                      </p>
                    </div>
                  </div>
                </div>
                {card.status === 'active' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                    {card.redeemUrl && (
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Redeem Online
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Gift to Friend
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Rewards View */}
        {selectedView === 'rewards' && (
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg">Your Reward Points</h4>
                  <p className="text-sm text-muted-foreground">Earn points with every purchase</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{currentPoints.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                1 point = $1 spent • Next tier in {1000 - currentPoints} points
              </p>
            </div>

            <h4 className="text-sm font-semibold">Membership Tiers</h4>
            {rewardPrograms.map((program) => {
              const IconComponent = program.icon;
              const canActivate = currentPoints >= program.pointsRequired;
              
              return (
                <div
                  key={program.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    program.active
                      ? 'border-primary/30 bg-primary/5'
                      : canActivate
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-border opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h5 className="font-semibold">{program.name}</h5>
                          {program.active && (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                          {canActivate && !program.active && (
                            <Badge variant="warning">Available</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {program.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <Badge variant="outline" className="gap-1">
                            <Target className="h-3 w-3" />
                            {program.pointsRequired.toLocaleString()} points required
                          </Badge>
                          <Badge variant="success" className="gap-1">
                            <Percent className="h-3 w-3" />
                            +{program.discount}% discount
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  {canActivate && !program.active && (
                    <Button size="sm" className="mt-3">
                      Activate Tier
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🎁 Gift Card Benefits</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Buy gift cards with crypto instantly</li>
            <li>• Save up to 10% on every purchase</li>
            <li>• Earn cashback in crypto on all orders</li>
            <li>• 1000+ brands across 150 countries</li>
            <li>• Instant delivery to your wallet</li>
            <li>• Gift cards never expire on our platform</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

