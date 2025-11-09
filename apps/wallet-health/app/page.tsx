'use client';

import { Shield, Scan, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // Redirect to dashboard if already connected
  useEffect(() => {
    if (isConnected && address) {
      router.push('/dashboard');
    }
  }, [isConnected, address, router]);

  const features = [
    {
      icon: Scan,
      title: 'Approval Scanner',
      description: 'Scan all token approvals across Ethereum, BNB, Polygon, Base, and Arbitrum.',
      color: 'text-blue-500',
    },
    {
      icon: AlertTriangle,
      title: 'Risk Detection',
      description: 'Identify risky unlimited allowances, unverified contracts, and spam tokens.',
      color: 'text-yellow-500',
    },
    {
      icon: CheckCircle,
      title: 'Security Score',
      description: 'Get an instant health score (0-100) with actionable recommendations.',
      color: 'text-green-500',
    },
    {
      icon: Shield,
      title: 'Non-Custodial',
      description: 'Read-only access via WalletConnect. Your funds stay safe in your wallet.',
      color: 'text-purple-500',
    },
  ];

  const stats = [
    { value: '5', label: 'Supported Chains' },
    { value: '100%', label: 'Free to Use' },
    { value: '0', label: 'Smart Contracts' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Header */}
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Wallet Health</span>
            </div>
            <Button variant="outline" onClick={() => open()}>
              Connect Wallet
            </Button>
          </div>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
              Scan Your Wallet for
              <span className="text-primary"> Security Risks</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Instantly audit your wallet for dangerous token approvals, suspicious contracts, 
              and phishing attempts — before it's too late 🚨
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg h-14 px-8"
                onClick={() => open()}
              >
                <Shield className="mr-2 h-5 w-5" />
                Scan Now (Free)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg h-14 px-8"
                onClick={() => window.open('https://github.com/folajindayo/wallet-health', '_blank')}
              >
                View on GitHub
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="border-border bg-card/50 backdrop-blur">
                <CardHeader>
                  <feature.icon className={`h-10 w-10 ${feature.color} mb-2`} />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How It Works */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
            <div className="space-y-4">
              {[
                { step: 1, text: 'Connect your wallet via WalletConnect (MetaMask, Trust, Rainbow, etc.)' },
                { step: 2, text: 'We scan for token approvals, contracts, and suspicious tokens' },
                { step: 3, text: 'Get your Security Score and detailed risk breakdown' },
                { step: 4, text: 'Take action: revoke approvals, hide spam, secure your funds' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <p className="text-muted-foreground pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to Secure Your Wallet?</CardTitle>
                <CardDescription className="text-base">
                  Free scan. No sign-up. Read-only access. Takes 30 seconds.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="lg"
                  className="text-lg h-14 px-12"
                  onClick={() => open()}
                >
                  Connect Wallet & Start Scan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Built with Next.js, WalletConnect, and GoldRush API</p>
            <p className="mt-2">Open source • Non-custodial • Free forever</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
