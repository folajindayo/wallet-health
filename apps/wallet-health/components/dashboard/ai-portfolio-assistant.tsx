'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Shield,
  Zap,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Lightbulb,
  BookOpen,
  Star,
  Award
} from 'lucide-react';
import { useState } from 'react';

interface AIRecommendation {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'rebalance' | 'security' | 'optimize';
  title: string;
  description: string;
  reasoning: string;
  confidence: number; // 0-100
  potentialImpact: string;
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'security' | 'risk' | 'diversification' | 'cost';
  icon: any;
  actionable: boolean;
  estimatedTime?: string;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'trend' | 'optimization';
  impact: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIPortfolioAssistantProps {
  walletAddress: string;
}

export function AIPortfolioAssistant({ walletAddress }: AIPortfolioAssistantProps) {
  const [selectedTab, setSelectedTab] = useState<'recommendations' | 'insights' | 'chat'>('recommendations');
  const [chatInput, setChatInput] = useState('');

  // Mock AI recommendations
  const recommendations: AIRecommendation[] = [
    {
      id: '1',
      type: 'rebalance',
      title: 'Rebalance Portfolio for Better Diversification',
      description: 'Your portfolio is 65% concentrated in ETH. Consider diversifying into stablecoins and other blue-chip assets.',
      reasoning: 'High concentration in a single asset increases volatility risk. Optimal diversification suggests 40-50% maximum in any single asset.',
      confidence: 87,
      potentialImpact: '+12% risk-adjusted returns',
      priority: 'high',
      category: 'diversification',
      icon: PieChart,
      actionable: true,
      estimatedTime: '15 min',
    },
    {
      id: '2',
      type: 'security',
      title: 'Revoke High-Risk Token Approvals',
      description: 'Detected 3 unlimited approvals to contracts with security concerns.',
      reasoning: 'These contracts have flags for suspicious activity. Revoking these approvals eliminates potential theft vectors.',
      confidence: 95,
      potentialImpact: 'Prevent potential loss of $85,000',
      priority: 'high',
      category: 'security',
      icon: Shield,
      actionable: true,
      estimatedTime: '5 min',
    },
    {
      id: '3',
      type: 'optimize',
      title: 'Optimize Gas Spending',
      description: 'You could save ~$450/month by timing transactions during off-peak hours.',
      reasoning: 'Analysis shows you typically transact during peak hours (2-6 PM UTC) when gas is 40-60% higher.',
      confidence: 82,
      potentialImpact: 'Save $5,400 annually',
      priority: 'medium',
      category: 'cost',
      icon: Zap,
      actionable: true,
      estimatedTime: '2 min',
    },
    {
      id: '4',
      type: 'buy',
      title: 'Consider Stablecoin Yield Opportunities',
      description: 'Move 20% of idle USDC into high-yield stablecoin pools (8-12% APY).',
      reasoning: 'You have $24,000 in idle USDC earning 0%. Protocols like Aave and Compound offer safe yields with minimal risk.',
      confidence: 78,
      potentialImpact: '+$2,400/year passive income',
      priority: 'medium',
      category: 'performance',
      icon: DollarSign,
      actionable: true,
      estimatedTime: '10 min',
    },
    {
      id: '5',
      type: 'sell',
      title: 'Exit Underperforming Position',
      description: 'Consider selling your SHIB position (-45% over 6 months).',
      reasoning: 'Technical indicators show continued downward trend with no reversal signals. Better opportunities available.',
      confidence: 65,
      potentialImpact: 'Prevent further -15% decline',
      priority: 'low',
      category: 'performance',
      icon: TrendingDown,
      actionable: true,
      estimatedTime: '5 min',
    },
    {
      id: '6',
      type: 'hold',
      title: 'Maintain Long-Term ETH Position',
      description: 'Your ETH position is performing well. Hold for long-term growth.',
      reasoning: 'Strong fundamentals, upcoming upgrades, and favorable market conditions suggest continued upside.',
      confidence: 88,
      potentialImpact: '+40% potential over 12 months',
      priority: 'low',
      category: 'performance',
      icon: TrendingUp,
      actionable: false,
    },
  ];

  // Mock AI insights
  const insights: AIInsight[] = [
    {
      id: '1',
      title: 'DeFi Summer 2.0 Opportunity',
      description: 'AI detects increasing DeFi protocol activity similar to patterns from 2020. Consider increasing exposure to major DeFi tokens.',
      type: 'opportunity',
      impact: 'high',
      timestamp: new Date(Date.now() - 3600000 * 2),
    },
    {
      id: '2',
      title: 'Whale Activity Alert',
      description: 'Large wallets are accumulating ETH. Historical data shows this precedes price increases 73% of the time.',
      type: 'trend',
      impact: 'high',
      timestamp: new Date(Date.now() - 3600000 * 5),
    },
    {
      id: '3',
      title: 'Protocol Risk Detected',
      description: 'One of your lending positions shows unusual TVL decline. Consider reducing exposure or monitoring closely.',
      type: 'risk',
      impact: 'medium',
      timestamp: new Date(Date.now() - 3600000 * 8),
    },
    {
      id: '4',
      title: 'Gas Optimization Window',
      description: 'Gas prices predicted to drop 40% in next 6 hours. Optimal time for pending transactions.',
      type: 'optimization',
      impact: 'medium',
      timestamp: new Date(Date.now() - 3600000 * 1),
    },
  ];

  // Mock chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI Portfolio Assistant. I analyze your wallet 24/7 and provide personalized recommendations. How can I help you today?",
      timestamp: new Date(Date.now() - 3600000 * 24),
    },
    {
      id: '2',
      role: 'user',
      content: "What should I do with my current ETH position?",
      timestamp: new Date(Date.now() - 3600000 * 23),
    },
    {
      id: '3',
      role: 'assistant',
      content: "Based on my analysis of your 25 ETH position ($52,500 value):\n\n✅ **Recommendation: HOLD**\n\n**Reasoning:**\n1. Strong momentum (+15% in 30 days)\n2. Upcoming Shanghai upgrade\n3. Institutional accumulation increasing\n4. Your entry price is favorable\n\n**Action:** Consider taking 20% profits at $2,300 to reduce risk while maintaining upside exposure.\n\nWould you like me to set up an alert for this price level?",
      timestamp: new Date(Date.now() - 3600000 * 23),
    },
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };
    
    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: `${Date.now()}-ai`,
        role: 'assistant',
        content: "I'm analyzing your request and market data. This is a demo response. In production, I would provide detailed analysis based on real-time blockchain data, market trends, and your portfolio context.",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: { variant: 'destructive', label: 'High Priority' },
      medium: { variant: 'warning', label: 'Medium' },
      low: { variant: 'outline', label: 'Low' },
    };
    const style = styles[priority as keyof typeof styles];
    return <Badge variant={style.variant as any}>{style.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, any> = {
      buy: { variant: 'success', label: 'Buy', icon: TrendingUp },
      sell: { variant: 'destructive', label: 'Sell', icon: TrendingDown },
      hold: { variant: 'outline', label: 'Hold', icon: Target },
      rebalance: { variant: 'info', label: 'Rebalance', icon: PieChart },
      security: { variant: 'warning', label: 'Security', icon: Shield },
      optimize: { variant: 'default', label: 'Optimize', icon: Zap },
    };
    const style = styles[type] || { variant: 'outline', label: type, icon: Sparkles };
    const IconComponent = style.icon;
    return (
      <Badge variant={style.variant} className="gap-1">
        <IconComponent className="h-3 w-3" />
        {style.label}
      </Badge>
    );
  };

  const getInsightTypeBadge = (type: string) => {
    const styles: Record<string, any> = {
      opportunity: { variant: 'success', label: 'Opportunity' },
      risk: { variant: 'destructive', label: 'Risk Alert' },
      trend: { variant: 'info', label: 'Market Trend' },
      optimization: { variant: 'warning', label: 'Optimization' },
    };
    const style = styles[type] || { variant: 'outline', label: type };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  const getImpactBadge = (impact: string) => {
    const styles = {
      high: { variant: 'destructive', label: 'High Impact' },
      medium: { variant: 'warning', label: 'Medium' },
      low: { variant: 'outline', label: 'Low' },
    };
    const style = styles[impact as keyof typeof styles];
    return <Badge variant={style.variant as any}>{style.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Portfolio Assistant
            </CardTitle>
            <CardDescription>
              Powered by advanced AI models analyzing blockchain data 24/7
            </CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tab Selector */}
        <div className="mb-6 flex gap-2">
          <Button
            size="sm"
            variant={selectedTab === 'recommendations' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('recommendations')}
          >
            <Target className="h-4 w-4 mr-2" />
            Recommendations
          </Button>
          <Button
            size="sm"
            variant={selectedTab === 'insights' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('insights')}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Insights
          </Button>
          <Button
            size="sm"
            variant={selectedTab === 'chat' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('chat')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </div>

        {/* Recommendations Tab */}
        {selectedTab === 'recommendations' && (
          <div className="space-y-4 mb-6">
            {recommendations.map((rec) => {
              const IconComponent = rec.icon;
              
              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    rec.priority === 'high'
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h5 className="font-semibold">{rec.title}</h5>
                          {getTypeBadge(rec.type)}
                          {getPriorityBadge(rec.priority)}
                          <Badge variant="outline" className="gap-1">
                            <Star className="h-3 w-3" />
                            {rec.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {rec.description}
                        </p>
                        <div className="mb-3 p-3 rounded-lg bg-muted/50">
                          <p className="text-xs font-semibold mb-1">AI Reasoning:</p>
                          <p className="text-xs text-muted-foreground">{rec.reasoning}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3 text-green-500" />
                            <span className="font-semibold text-green-500">
                              {rec.potentialImpact}
                            </span>
                          </span>
                          {rec.estimatedTime && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {rec.estimatedTime}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {rec.actionable && (
                    <div className="flex gap-2">
                      <Button size="sm">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Execute
                      </Button>
                      <Button size="sm" variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Learn More
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Insights Tab */}
        {selectedTab === 'insights' && (
          <div className="space-y-3 mb-6">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h5 className="font-semibold">{insight.title}</h5>
                      {getInsightTypeBadge(insight.type)}
                      {getImpactBadge(insight.impact)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(insight.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Tab */}
        {selectedTab === 'chat' && (
          <div>
            {/* Chat Messages */}
            <div className="mb-4 h-[400px] overflow-y-auto space-y-3 p-4 rounded-lg border border-border bg-muted/20">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {formatDate(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about your portfolio..."
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Suggested Questions */}
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  'What are my biggest risks?',
                  'How can I improve returns?',
                  'Should I rebalance?',
                  'Gas optimization tips?',
                ].map((question) => (
                  <Button
                    key={question}
                    size="sm"
                    variant="outline"
                    onClick={() => setChatInput(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Capabilities */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2">🤖 AI Capabilities</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Real-time portfolio analysis and optimization</li>
            <li>• Predictive analytics based on blockchain data</li>
            <li>• Personalized recommendations tailored to your goals</li>
            <li>• Risk assessment and security monitoring</li>
            <li>• Market trend detection and opportunities</li>
            <li>• Natural language chat for instant answers</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

