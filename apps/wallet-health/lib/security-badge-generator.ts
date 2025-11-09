/**
 * Security Badge Generator Utility
 * Generates security badges for wallets
 */

export interface SecurityBadge {
  id: string;
  name: string;
  description: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  criteria: {
    minScore: number;
    requirements: string[];
  };
  svg?: string; // SVG badge code
  imageUrl?: string; // Badge image URL
}

export interface WalletBadge {
  walletAddress: string;
  badges: SecurityBadge[];
  overallLevel: SecurityBadge['level'];
  earnedAt: number;
  expiresAt?: number;
  verificationCode?: string; // For verification
}

export interface BadgeTemplate {
  level: SecurityBadge['level'];
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  icon: string;
}

export class SecurityBadgeGenerator {
  private badgeTemplates: Map<SecurityBadge['level'], BadgeTemplate> = new Map();
  private walletBadges: Map<string, WalletBadge> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize badge templates
   */
  private initializeTemplates(): void {
    this.badgeTemplates.set('bronze', {
      level: 'bronze',
      colors: {
        primary: '#CD7F32',
        secondary: '#8B4513',
        text: '#FFFFFF',
      },
      icon: '🛡️',
    });

    this.badgeTemplates.set('silver', {
      level: 'silver',
      colors: {
        primary: '#C0C0C0',
        secondary: '#808080',
        text: '#000000',
      },
      icon: '🛡️',
    });

    this.badgeTemplates.set('gold', {
      level: 'gold',
      colors: {
        primary: '#FFD700',
        secondary: '#FFA500',
        text: '#000000',
      },
      icon: '🛡️',
    });

    this.badgeTemplates.set('platinum', {
      level: 'platinum',
      colors: {
        primary: '#E5E4E2',
        secondary: '#BCC6CC',
        text: '#000000',
      },
      icon: '🛡️',
    });

    this.badgeTemplates.set('diamond', {
      level: 'diamond',
      colors: {
        primary: '#B9F2FF',
        secondary: '#00D9FF',
        text: '#000000',
      },
      icon: '💎',
    });
  }

  /**
   * Generate badge for wallet
   */
  generateBadge(
    walletAddress: string,
    securityScore: number,
    metrics: {
      accountAge?: number; // days
      totalTransactions?: number;
      hasENS?: boolean;
      isVerified?: boolean;
      hasBackup?: boolean;
      usesHardwareWallet?: boolean;
    }
  ): WalletBadge {
    const badges: SecurityBadge[] = [];

    // Determine overall level based on score
    let overallLevel: SecurityBadge['level'] = 'bronze';
    if (securityScore >= 90) {
      overallLevel = 'diamond';
    } else if (securityScore >= 80) {
      overallLevel = 'platinum';
    } else if (securityScore >= 70) {
      overallLevel = 'gold';
    } else if (securityScore >= 60) {
      overallLevel = 'silver';
    }

    // Generate specific badges
    if (securityScore >= 80) {
      badges.push({
        id: 'high-security',
        name: 'High Security',
        description: 'Wallet with excellent security practices',
        level: overallLevel,
        criteria: {
          minScore: 80,
          requirements: ['Security score >= 80'],
        },
      });
    }

    if (metrics.accountAge && metrics.accountAge > 365) {
      badges.push({
        id: 'veteran',
        name: 'Veteran Wallet',
        description: 'Active for over 1 year',
        level: 'gold',
        criteria: {
          minScore: 0,
          requirements: ['Account age > 365 days'],
        },
      });
    }

    if (metrics.hasENS) {
      badges.push({
        id: 'ens-verified',
        name: 'ENS Verified',
        description: 'Wallet has ENS domain',
        level: 'silver',
        criteria: {
          minScore: 0,
          requirements: ['ENS domain registered'],
        },
      });
    }

    if (metrics.usesHardwareWallet) {
      badges.push({
        id: 'hardware-wallet',
        name: 'Hardware Wallet',
        description: 'Uses hardware wallet',
        level: 'platinum',
        criteria: {
          minScore: 0,
          requirements: ['Hardware wallet connected'],
        },
      });
    }

    if (metrics.hasBackup) {
      badges.push({
        id: 'backed-up',
        name: 'Backed Up',
        description: 'Wallet backup verified',
        level: 'gold',
        criteria: {
          minScore: 0,
          requirements: ['Backup verified'],
        },
      });
    }

    // Generate verification code
    const verificationCode = this.generateVerificationCode(walletAddress, badges);

    const walletBadge: WalletBadge = {
      walletAddress,
      badges,
      overallLevel,
      earnedAt: Date.now(),
      verificationCode,
    };

    this.walletBadges.set(walletAddress.toLowerCase(), walletBadge);

    return walletBadge;
  }

  /**
   * Generate verification code
   */
  private generateVerificationCode(
    walletAddress: string,
    badges: SecurityBadge[]
  ): string {
    const data = `${walletAddress}-${badges.map(b => b.id).join(',')}-${Date.now()}`;
    // In production, would use cryptographic hash
    return Buffer.from(data).toString('base64').substring(0, 16);
  }

  /**
   * Generate SVG badge
   */
  generateSVGBadge(badge: SecurityBadge): string {
    const template = this.badgeTemplates.get(badge.level);
    if (!template) {
      return '';
    }

    return `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-${badge.id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${template.colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${template.colors.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#grad-${badge.id})" stroke="${template.colors.secondary}" stroke-width="4"/>
        <text x="100" y="80" font-family="Arial" font-size="60" text-anchor="middle" fill="${template.colors.text}">${template.icon}</text>
        <text x="100" y="140" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="${template.colors.text}">${badge.name}</text>
        <text x="100" y="160" font-family="Arial" font-size="12" text-anchor="middle" fill="${template.colors.text}">${badge.level}</text>
      </svg>
    `;
  }

  /**
   * Get wallet badge
   */
  getWalletBadge(walletAddress: string): WalletBadge | null {
    return this.walletBadges.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Verify badge
   */
  verifyBadge(walletAddress: string, verificationCode: string): boolean {
    const badge = this.walletBadges.get(walletAddress.toLowerCase());
    if (!badge) {
      return false;
    }

    return badge.verificationCode === verificationCode;
  }

  /**
   * Export badge as image data URL
   */
  async exportBadgeAsImage(badge: SecurityBadge): Promise<string> {
    const svg = this.generateSVGBadge(badge);
    // In production, would convert SVG to image
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  /**
   * Clear wallet badges
   */
  clear(): void {
    this.walletBadges.clear();
  }
}

// Singleton instance
export const securityBadgeGenerator = new SecurityBadgeGenerator();

