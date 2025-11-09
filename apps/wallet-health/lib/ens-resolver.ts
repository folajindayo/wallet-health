/**
 * ENS Resolver Utility
 * Resolves ENS domains and verifies ownership
 */

import { createPublicClient, http, isAddress } from 'viem';
import { mainnet } from 'viem/chains';

export interface ENSInfo {
  name: string | null;
  address: string | null;
  avatar?: string | null;
  resolver?: string | null;
  verified: boolean;
  reverseRecord?: string | null;
}

export interface ENSResolution {
  domain: string;
  address: string | null;
  resolved: boolean;
  verified: boolean;
  error?: string;
}

export class ENSResolver {
  private client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  /**
   * Resolve ENS domain to address
   */
  async resolveENS(domain: string): Promise<ENSResolution> {
    try {
      // Normalize domain
      const normalizedDomain = domain.toLowerCase().endsWith('.eth')
        ? domain.toLowerCase()
        : `${domain.toLowerCase()}.eth`;

      // Resolve address
      const address = await this.client.getEnsAddress({
        name: normalizedDomain,
      });

      if (!address) {
        return {
          domain: normalizedDomain,
          address: null,
          resolved: false,
          verified: false,
          error: 'Domain not found or not configured',
        };
      }

      // Verify reverse record
      const reverseRecord = await this.verifyReverseRecord(address, normalizedDomain);

      return {
        domain: normalizedDomain,
        address,
        resolved: true,
        verified: reverseRecord,
      };
    } catch (error: any) {
      return {
        domain,
        address: null,
        resolved: false,
        verified: false,
        error: error.message || 'Failed to resolve ENS domain',
      };
    }
  }

  /**
   * Resolve address to ENS name (reverse lookup)
   */
  async resolveAddress(address: string): Promise<ENSInfo> {
    try {
      if (!isAddress(address)) {
        throw new Error('Invalid address format');
      }

      // Get primary name
      const name = await this.client.getEnsName({
        address: address as `0x${string}`,
      });

      // Get avatar if name exists
      let avatar: string | null = null;
      if (name) {
        try {
          avatar = await this.client.getEnsAvatar({
            name,
          }) || null;
        } catch {
          // Avatar not set or failed to fetch
        }
      }

      // Get resolver address
      let resolver: string | null = null;
      if (name) {
        try {
          const resolverAddress = await this.client.getEnsResolver({
            name,
          });
          resolver = resolverAddress || null;
        } catch {
          // Resolver not found
        }
      }

      // Verify reverse record
      const verified = name ? await this.verifyReverseRecord(address, name) : false;

      return {
        name,
        address,
        avatar,
        resolver,
        verified,
        reverseRecord: name || null,
      };
    } catch (error: any) {
      return {
        name: null,
        address,
        verified: false,
        error: error.message || 'Failed to resolve address',
      };
    }
  }

  /**
   * Verify ENS reverse record
   */
  async verifyReverseRecord(address: string, expectedName: string): Promise<boolean> {
    try {
      const resolvedName = await this.client.getEnsName({
        address: address as `0x${string}`,
      });

      if (!resolvedName) {
        return false;
      }

      // Normalize for comparison
      const normalizedExpected = expectedName.toLowerCase().endsWith('.eth')
        ? expectedName.toLowerCase()
        : `${expectedName.toLowerCase()}.eth`;
      const normalizedResolved = resolvedName.toLowerCase();

      return normalizedResolved === normalizedExpected;
    } catch {
      return false;
    }
  }

  /**
   * Batch resolve multiple ENS domains
   */
  async batchResolveENS(domains: string[]): Promise<ENSResolution[]> {
    return Promise.all(domains.map(domain => this.resolveENS(domain)));
  }

  /**
   * Batch resolve multiple addresses
   */
  async batchResolveAddress(addresses: string[]): Promise<ENSInfo[]> {
    return Promise.all(addresses.map(address => this.resolveAddress(address)));
  }

  /**
   * Check if string is ENS domain
   */
  isENSDomain(input: string): boolean {
    return input.includes('.eth') || /^[a-z0-9-]+\.eth$/i.test(input);
  }

  /**
   * Normalize ENS domain
   */
  normalizeENS(domain: string): string {
    const normalized = domain.toLowerCase().trim();
    return normalized.endsWith('.eth') ? normalized : `${normalized}.eth`;
  }

  /**
   * Validate ENS domain format
   */
  validateENS(domain: string): { valid: boolean; error?: string } {
    const normalized = this.normalizeENS(domain);

    // Basic validation
    if (normalized.length < 4) {
      return { valid: false, error: 'Domain too short' };
    }

    if (normalized.length > 255) {
      return { valid: false, error: 'Domain too long' };
    }

    // Check format
    const pattern = /^[a-z0-9-]+\.eth$/;
    if (!pattern.test(normalized)) {
      return { valid: false, error: 'Invalid domain format' };
    }

    // Check for consecutive hyphens
    if (normalized.includes('--')) {
      return { valid: false, error: 'Cannot contain consecutive hyphens' };
    }

    // Check for leading/trailing hyphens
    const namePart = normalized.split('.')[0];
    if (namePart.startsWith('-') || namePart.endsWith('-')) {
      return { valid: false, error: 'Cannot start or end with hyphen' };
    }

    return { valid: true };
  }
}

// Singleton instance
export const ensResolver = new ENSResolver();

