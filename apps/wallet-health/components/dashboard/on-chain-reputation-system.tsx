'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Star,
  Trophy,
  Shield,
  TrendingUp,
  Users,
  Activity,
  Target,
  CheckCircle2,
  Zap,
  Heart,
  Gift,
  Crown,
  Medal,
  Sparkles,
  Flame,
  ThumbsUp,
  MessageSquare,
  Share2,
  ExternalLink,
  Lock,
  Unlock
} from 'lucide-react';
import { useState } from 'react';

interface ReputationScore {
  category: string;
  score: number;
  maxScore: number;
  rank: string;
  icon: any;
  description: string;
  color: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedDate?: Date;
  progress?: number;
  requirement: string;
  reward: number; // reputation points
}

interface Credential {
  id: string;
  type: string;
  issuer: string;
  issuedDate: Date;
  verified: boolean;
  icon: any;
}

interface OnChainReputationSystemProps {
  walletAddress: string;
}

export function OnChainReputationSystem({ walletAddress }: OnChainReputationSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock reputation scores
  const reputationScores: ReputationScore[] = [
    {
      category: 'DeFi Expert',
      score: 850,
      maxScore: 1000,
      rank: 'Diamond',
      icon: Trophy,
      description: 'DeFi protocol interactions and liquidity provision',
      color: 'text-blue-500',
    },
    {
      category: 'Security Champion',
      score: 920,
      maxScore: 1000,
      rank: 'Platinum',
      icon: Shield,
      description: 'Safe wallet practices and security measures',
      color: 'text-green-500',
    },
    {
      category: 'NFT Collector',
      score: 650,
      maxScore: 1000,
      rank: 'Gold',
      icon: Award,
      description: 'NFT collection and marketplace activity',
      color: 'text-purple-500',
    },
    {
      category: 'Governance Participant',
      score: 780,
      maxScore: 1000,
      rank: 'Platinum',
      icon: Users,
      description: 'Active voting and proposal participation',
      color: 'text-yellow-500',
    },
    {
      category: 'Early Adopter',
      score: 890,
      maxScore: 1000,
      rank: 'Diamond',
      icon: Zap,
      description: 'Early user of new protocols and features',
      color: 'text-orange-500',
    },
    {
      category: 'Community Builder',
      score: 720,
      maxScore: 1000,
      rank: 'Gold',
      icon: Heart,
      description: 'Community engagement and referrals',
      color: 'text-pink-500',
    },
  ];

  // Mock achievements
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Whale Status',
      description: 'Portfolio value exceeds $100,000',
      icon: Crown,
      rarity: 'legendary',
      unlocked: true,
      unlockedDate: new Date(Date.now() - 86400000 * 45),
      requirement: 'Portfolio > $100K',
      reward: 500,
    },
    {
      id: '2',
      name: 'Security Master',
      description: 'Maintain 90+ security score for 30 days',
      icon: Shield,
      rarity: 'epic',
      unlocked: true,
      unlockedDate: new Date(Date.now() - 86400000 * 15),
      requirement: 'Security score 90+ for 30d',
      reward: 300,
    },
    {
      id: '3',
      name: 'DeFi Pioneer',
      description: 'Interact with 10+ different DeFi protocols',
      icon: Sparkles,
      rarity: 'rare',
      unlocked: true,
      unlockedDate: new Date(Date.now() - 86400000 * 60),
      requirement: '10+ protocol interactions',
      reward: 200,
    },
    {
      id: '4',
      name: 'Governance Guru',
      description: 'Vote on 50+ proposals',
      icon: Trophy,
      rarity: 'epic',
      unlocked: true,
      unlockedDate: new Date(Date.now() - 86400000 * 30),
      requirement: '50+ governance votes',
      reward: 350,
    },
    {
      id: '5',
      name: 'NFT Connoisseur',
      description: 'Own 100+ NFTs across 5+ collections',
      icon: Award,
      rarity: 'rare',
      unlocked: false,
      progress: 68,
      requirement: '100+ NFTs, 5+ collections',
      reward: 250,
    },
    {
      id: '6',
      name: 'Gas Optimizer',
      description: 'Save $500+ on gas fees through optimizations',
      icon: Flame,
      rarity: 'rare',
      unlocked: false,
      progress: 42,
      requirement: '$500+ gas savings',
      reward: 200,
    },
    {
      id: '7',
      name: 'Diamond Hands',
      description: 'Hold a position for 1+ year with 100%+ gains',
      icon: Medal,
      rarity: 'legendary',
      unlocked: false,
      progress: 85,
      requirement: '1+ year hold, 100%+ gain',
      reward: 600,
    },
    {
      id: '8',
      name: 'Community Hero',
      description: 'Refer 10+ users to the platform',
      icon: Heart,
      rarity: 'epic',
      unlocked: false,
      progress: 30,
      requirement: '10+ referrals',
      reward: 400,
    },
  ];

  // Mock credentials
  const credentials: Credential[] = [
    {
      id: '1',
      type: 'KYC Verified',
      issuer: 'Civic',
      issuedDate: new Date(Date.now() - 86400000 * 120),
      verified: true,
      icon: CheckCircle2,
    },
    {
      id: '2',
      type: 'Sybil Resistant',
      issuer: 'Gitcoin Passport',
      issuedDate: new Date(Date.now() - 86400000 * 90),
      verified: true,
      icon: Shield,
    },
    {
      id: '3',
      type: 'Proof of Humanity',
      issuer: 'PoH DAO',
      issuedDate: new Date(Date.now() - 86400000 * 180),
      verified: true,
      icon: Users,
    },
    {
      id: '4',
      type: 'ENS Holder',
      issuer: 'ENS Domains',
      issuedDate: new Date(Date.now() - 86400000 * 365),
      verified: true,
      icon: Star,
    },
  ];

  const totalScore = reputationScores.reduce((sum, rs) => sum + rs.score, 0);
  const maxTotalScore = reputationScores.reduce((sum, rs) => sum + rs.maxScore, 0);
  const overallRank = totalScore >= 5000 ? 'Legend' : totalScore >= 4000 ? 'Master' : totalScore >= 3000 ? 'Expert' : 'Advanced';
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalReputationPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.reward, 0);

  const filteredScores = selectedCategory === 'all' 
    ? reputationScores 
    : reputationScores.filter(rs => rs.category === selectedCategory);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getRarityBadge = (rarity: string) => {
    const styles = {
      common: { variant: 'outline', color: 'text-gray-500' },
      rare: { variant: 'info', color: 'text-blue-500' },
      epic: { variant: 'warning', color: 'text-purple-500' },
      legendary: { variant: 'destructive', color: 'text-yellow-500' },
    };
    const style = styles[rarity as keyof typeof styles] || styles.common;
    return (
      <Badge variant={style.variant as any} className="capitalize">
        {rarity}
      </Badge>
    );
  };

  const getRankBadge = (rank: string) => {
    const styles = {
      Bronze: 'bg-orange-700/20 text-orange-400 border-orange-700/50',
      Silver: 'bg-gray-400/20 text-gray-300 border-gray-400/50',
      Gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      Platinum: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
      Diamond: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    };
    const style = styles[rank as keyof typeof styles] || styles.Bronze;
    return (
      <Badge className={`${style} gap-1`}>
        <Award className="h-3 w-3" />
        {rank}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              On-Chain Reputation System
            </CardTitle>
            <CardDescription>
              Build your Web3 reputation and unlock achievements
            </CardDescription>
          </div>
          <Button size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Reputation */}
        <div className="mb-6 p-6 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-3">
              <Crown className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{totalScore.toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground mb-2">Reputation Points</p>
            <Badge className="gap-1 text-lg px-4 py-1">
              <Star className="h-4 w-4" />
              {overallRank}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-card/50 border border-border">
              <p className="text-2xl font-bold">{unlockedAchievements}/{achievements.length}</p>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-card/50 border border-border">
              <p className="text-2xl font-bold">{credentials.length}</p>
              <p className="text-xs text-muted-foreground">Credentials</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-card/50 border border-border">
              <p className="text-2xl font-bold">Top 5%</p>
              <p className="text-xs text-muted-foreground">Ranking</p>
            </div>
          </div>
        </div>

        {/* Reputation Categories */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Reputation Categories</h4>
          <div className="space-y-3">
            {filteredScores.map((score) => {
              const IconComponent = score.icon;
              const percentage = (score.score / score.maxScore) * 100;
              
              return (
                <div
                  key={score.category}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg bg-primary/10 ${score.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h5 className="font-semibold">{score.category}</h5>
                          {getRankBadge(score.rank)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {score.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{score.score}</p>
                      <p className="text-xs text-muted-foreground">/ {score.maxScore}</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className={`h-full ${score.color.replace('text-', 'bg-')} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(1)}% Complete</span>
                    <span>+{Math.floor((score.maxScore - score.score) / 10)} to next rank</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Achievements</h4>
            <span className="text-xs text-muted-foreground">
              {unlockedAchievements} / {achievements.length} unlocked
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    achievement.unlocked
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-card/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.unlocked ? 'bg-primary/20 text-primary' : 'bg-muted'
                    }`}>
                      {achievement.unlocked ? (
                        <IconComponent className="h-5 w-5" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h5 className="font-semibold">{achievement.name}</h5>
                        {getRarityBadge(achievement.rarity)}
                        {achievement.unlocked && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="gap-1">
                          <Gift className="h-3 w-3" />
                          +{achievement.reward} points
                        </Badge>
                        {achievement.unlocked && achievement.unlockedDate && (
                          <span className="text-muted-foreground">
                            {formatDate(achievement.unlockedDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!achievement.unlocked && achievement.progress !== undefined && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{achievement.requirement}</span>
                        <span className="font-bold">{achievement.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Credentials */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Verified Credentials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {credentials.map((credential) => {
              const IconComponent = credential.icon;
              
              return (
                <div
                  key={credential.id}
                  className="p-3 rounded-lg border border-green-500/30 bg-green-500/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <IconComponent className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-sm">{credential.type}</h5>
                        {credential.verified && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Issued by {credential.issuer} • {formatDate(credential.issuedDate)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-6 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Reputation Benefits
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-3 w-3 text-primary" />
              <span>Access to exclusive token launches</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3 text-primary" />
              <span>Lower trading fees on DEXs</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-3 w-3 text-primary" />
              <span>Priority support access</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="h-3 w-3 text-primary" />
              <span>Airdrop eligibility boost</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-3 w-3 text-primary" />
              <span>Governance weight multiplier</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-3 w-3 text-primary" />
              <span>Community recognition</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" className="justify-start">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Public Profile
          </Button>
          <Button variant="outline" className="justify-start">
            <MessageSquare className="h-4 w-4 mr-2" />
            Connect Social
          </Button>
          <Button variant="outline" className="justify-start">
            <Star className="h-4 w-4 mr-2" />
            Earn More Points
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

