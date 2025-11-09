/**
 * ENS Domain Manager Utility
 * Manages ENS domains and subdomains
 */

export interface ENSDomain {
  name: string;
  address: string; // Resolved address
  owner: string;
  resolver?: string;
  expiryDate?: number;
  registrationDate?: number;
  isExpired: boolean;
  isPrimary: boolean;
  chainId: number; // 1 for Ethereum mainnet
  subdomains?: ENSDomain[];
  textRecords?: Record<string, string>;
  addresses?: Record<number, string>; // Chain ID -> Address
}

export interface ENSRegistration {
  domain: string;
  duration: number; // years
  cost: string; // in ETH
  costUSD?: number;
  registrationDate: number;
  expiryDate: number;
  registrar: string;
}

export interface ENSProfile {
  walletAddress: string;
  primaryDomain: ENSDomain | null;
  ownedDomains: ENSDomain[];
  totalDomains: number;
  expiringSoon: ENSDomain[]; // Within 30 days
  expiredDomains: ENSDomain[];
  totalCostUSD: number;
  recommendations: string[];
}

export class ENSDomainManager {
  private domains: Map<string, ENSDomain> = new Map();

  /**
   * Add an ENS domain
   */
  addDomain(domain: ENSDomain): void {
    const key = `${domain.name.toLowerCase()}-${domain.chainId}`;
    this.domains.set(key, domain);
  }

  /**
   * Get domain
   */
  getDomain(name: string, chainId = 1): ENSDomain | null {
    const key = `${name.toLowerCase()}-${chainId}`;
    return this.domains.get(key) || null;
  }

  /**
   * Get all domains for a wallet
   */
  getWalletDomains(walletAddress: string, chainId = 1): ENSDomain[] {
    return Array.from(this.domains.values()).filter(
      d => d.owner.toLowerCase() === walletAddress.toLowerCase() && d.chainId === chainId
    );
  }

  /**
   * Get ENS profile
   */
  getENSProfile(walletAddress: string, chainId = 1): ENSProfile {
    const ownedDomains = this.getWalletDomains(walletAddress, chainId);
    const primaryDomain = ownedDomains.find(d => d.isPrimary) || null;
    
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    const expiringSoon = ownedDomains.filter(d => {
      if (!d.expiryDate) return false;
      const daysUntilExpiry = (d.expiryDate - now) / (24 * 60 * 60 * 1000);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    const expiredDomains = ownedDomains.filter(d => d.isExpired);

    // Calculate total cost (simplified)
    const totalCostUSD = ownedDomains.length * 5; // Estimate $5/year per domain

    // Generate recommendations
    const recommendations: string[] = [];

    if (expiringSoon.length > 0) {
      recommendations.push(`${expiringSoon.length} domain(s) expiring within 30 days. Renew soon.`);
    }

    if (expiredDomains.length > 0) {
      recommendations.push(`${expiredDomains.length} expired domain(s). Renew to prevent loss.`);
    }

    if (!primaryDomain) {
      recommendations.push('No primary domain set. Set a primary domain for better identity.');
    }

    if (ownedDomains.length === 0) {
      recommendations.push('No ENS domains found. Consider registering a domain for your wallet.');
    }

    return {
      walletAddress,
      primaryDomain,
      ownedDomains,
      totalDomains: ownedDomains.length,
      expiringSoon,
      expiredDomains,
      totalCostUSD,
      recommendations,
    };
  }

  /**
   * Resolve ENS name to address
   */
  async resolveENS(name: string, chainId = 1): Promise<string | null> {
    const domain = this.getDomain(name, chainId);
    if (domain) {
      return domain.address;
    }

    // In production, would call ENS resolver contract
    return null;
  }

  /**
   * Reverse resolve address to ENS name
   */
  async reverseResolve(address: string, chainId = 1): Promise<string | null> {
    const domains = Array.from(this.domains.values()).filter(
      d => d.address.toLowerCase() === address.toLowerCase() && d.chainId === chainId
    );

    // Return primary domain if available
    const primary = domains.find(d => d.isPrimary);
    if (primary) {
      return primary.name;
    }

    // Return first domain if available
    return domains.length > 0 ? domains[0].name : null;
  }

  /**
   * Check domain availability
   */
  async checkAvailability(name: string, chainId = 1): Promise<{
    available: boolean;
    price?: string;
    priceUSD?: number;
  }> {
    const domain = this.getDomain(name, chainId);
    
    if (domain) {
      return {
        available: false,
      };
    }

    // In production, would check ENS registrar
    return {
      available: true,
      price: '0.01', // Estimate
      priceUSD: 20,
    };
  }

  /**
   * Get text records
   */
  getTextRecords(name: string, chainId = 1): Record<string, string> | null {
    const domain = this.getDomain(name, chainId);
    return domain?.textRecords || null;
  }

  /**
   * Get multi-chain addresses
   */
  getMultiChainAddresses(name: string): Record<number, string> | null {
    const domain = this.getDomain(name, 1); // ENS is on Ethereum mainnet
    return domain?.addresses || null;
  }

  /**
   * Calculate domain value (simplified)
   */
  estimateDomainValue(domain: ENSDomain): {
    valueUSD: number;
    factors: string[];
  } {
    let valueUSD = 0;
    const factors: string[] = [];

    // Base value
    valueUSD = 10;

    // Short names are more valuable
    const nameLength = domain.name.split('.')[0].length;
    if (nameLength <= 3) {
      valueUSD *= 10;
      factors.push('Short name (3 chars or less)');
    } else if (nameLength <= 5) {
      valueUSD *= 5;
      factors.push('Short name (4-5 chars)');
    }

    // Common words are more valuable
    const commonWords = ['eth', 'crypto', 'defi', 'nft', 'dao', 'web3'];
    if (commonWords.includes(domain.name.split('.')[0].toLowerCase())) {
      valueUSD *= 3;
      factors.push('Common keyword');
    }

    // Age factor
    if (domain.registrationDate) {
      const age = (Date.now() - domain.registrationDate) / (365 * 24 * 60 * 60 * 1000);
      if (age > 2) {
        valueUSD *= 1.5;
        factors.push('Established domain');
      }
    }

    return {
      valueUSD: Math.round(valueUSD),
      factors,
    };
  }

  /**
   * Clear all domains
   */
  clear(): void {
    this.domains.clear();
  }
}

// Singleton instance
export const ensDomainManager = new ENSDomainManager();

