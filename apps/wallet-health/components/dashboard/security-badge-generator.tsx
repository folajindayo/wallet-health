'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Download, 
  Share2, 
  Copy,
  CheckCircle2,
  Twitter,
  Link as LinkIcon
} from 'lucide-react';
import { useState } from 'react';

interface SecurityBadgeGeneratorProps {
  walletAddress: string;
  securityScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export function SecurityBadgeGenerator({ 
  walletAddress,
  securityScore,
  riskLevel
}: SecurityBadgeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [badgeStyle, setBadgeStyle] = useState<'default' | 'compact' | 'detailed'>('default');

  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  const getBadgeColor = () => {
    if (securityScore >= 80) return { bg: '#10b981', text: '#ffffff' };
    if (securityScore >= 60) return { bg: '#f59e0b', text: '#ffffff' };
    return { bg: '#ef4444', text: '#ffffff' };
  };

  const colors = getBadgeColor();

  const generateBadgeSVG = () => {
    const width = badgeStyle === 'compact' ? 200 : badgeStyle === 'detailed' ? 400 : 300;
    const height = badgeStyle === 'compact' ? 80 : badgeStyle === 'detailed' ? 160 : 120;

    if (badgeStyle === 'compact') {
      return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" rx="12" fill="${colors.bg}"/>
  <text x="50%" y="35" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${colors.text}" text-anchor="middle">
    Security Score
  </text>
  <text x="50%" y="60" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="${colors.text}" text-anchor="middle">
    ${securityScore}/100
  </text>
</svg>`;
    }

    if (badgeStyle === 'detailed') {
      return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.bg};stop-opacity:0.8" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="16" fill="url(#grad)"/>
  <text x="50%" y="35" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${colors.text}" text-anchor="middle">
    🛡️ Wallet Health Monitor
  </text>
  <text x="50%" y="70" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="${colors.text}" text-anchor="middle">
    ${securityScore}/100
  </text>
  <text x="50%" y="95" font-family="Arial, sans-serif" font-size="14" fill="${colors.text}" text-anchor="middle" opacity="0.9">
    Security Score
  </text>
  <text x="50%" y="120" font-family="monospace" font-size="12" fill="${colors.text}" text-anchor="middle" opacity="0.8">
    ${shortAddress}
  </text>
  <text x="50%" y="145" font-family="Arial, sans-serif" font-size="11" fill="${colors.text}" text-anchor="middle" opacity="0.7">
    Risk Level: ${riskLevel.toUpperCase()}
  </text>
</svg>`;
    }

    // Default style
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" rx="14" fill="${colors.bg}"/>
  <text x="50%" y="40" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${colors.text}" text-anchor="middle">
    Wallet Security
  </text>
  <text x="50%" y="75" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="${colors.text}" text-anchor="middle">
    ${securityScore}/100
  </text>
  <text x="50%" y="105" font-family="monospace" font-size="11" fill="${colors.text}" text-anchor="middle" opacity="0.8">
    ${shortAddress}
  </text>
</svg>`;
  };

  const handleDownload = () => {
    const svg = generateBadgeSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-security-badge-${securityScore}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = async () => {
    const shareUrl = `https://wallet-health.app/badge/${walletAddress}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = `My wallet security score is ${securityScore}/100! 🛡️ Check your wallet health at`;
    const url = `https://wallet-health.app`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const generateMarkdown = () => {
    return `![Wallet Security Badge](data:image/svg+xml;base64,${btoa(generateBadgeSVG())})`;
  };

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Badge Generator
        </CardTitle>
        <CardDescription>
          Generate and share your wallet security badge
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Badge Preview */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Preview</h4>
          <div className="flex justify-center p-8 rounded-lg border border-border bg-muted/30">
            <div dangerouslySetInnerHTML={{ __html: generateBadgeSVG() }} />
          </div>
        </div>

        {/* Style Selector */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Badge Style</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={badgeStyle === 'compact' ? 'default' : 'outline'}
              onClick={() => setBadgeStyle('compact')}
            >
              Compact
            </Button>
            <Button
              size="sm"
              variant={badgeStyle === 'default' ? 'default' : 'outline'}
              onClick={() => setBadgeStyle('default')}
            >
              Default
            </Button>
            <Button
              size="sm"
              variant={badgeStyle === 'detailed' ? 'default' : 'outline'}
              onClick={() => setBadgeStyle('detailed')}
            >
              Detailed
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Share & Export</h4>

          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download as SVG
          </Button>

          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4 mr-2" />
                Copy Shareable Link
              </>
            )}
          </Button>

          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={handleCopyMarkdown}
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Markdown Badge
              </>
            )}
          </Button>

          <Button
            className="w-full justify-start bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
            onClick={handleShareTwitter}
          >
            <Twitter className="h-4 w-4 mr-2" />
            Share on Twitter
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Why Share Your Badge?
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Build trust with your community</li>
            <li>• Demonstrate security-conscious practices</li>
            <li>• Encourage others to check their wallet health</li>
            <li>• Showcase your commitment to Web3 safety</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

