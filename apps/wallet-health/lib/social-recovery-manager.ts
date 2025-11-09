/**
 * Social Recovery Manager Utility
 * Manages social recovery wallets and guardians
 */

export interface SocialRecoveryWallet {
  address: string;
  chainId: number;
  guardians: Guardian[];
  threshold: number; // Required guardian signatures
  recoveryDelay: number; // seconds
  isActive: boolean;
  lastRecovery?: number;
}

export interface Guardian {
  address: string;
  label?: string;
  addedAt: number;
  isActive: boolean;
  type: 'wallet' | 'hardware' | 'social' | 'institutional';
  verified: boolean;
}

export interface RecoveryRequest {
  id: string;
  walletAddress: string;
  newOwner: string;
  requestedBy: string;
  requestedAt: number;
  expiresAt: number;
  guardianSignatures: Array<{
    guardian: string;
    signature: string;
    timestamp: number;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requiredSignatures: number;
  currentSignatures: number;
}

export interface SocialRecoveryStats {
  totalWallets: number;
  totalGuardians: number;
  averageGuardians: number;
  averageThreshold: number;
  pendingRecoveries: number;
  completedRecoveries: number;
}

export class SocialRecoveryManager {
  private wallets: Map<string, SocialRecoveryWallet> = new Map();
  private recoveryRequests: Map<string, RecoveryRequest> = new Map();

  /**
   * Add social recovery wallet
   */
  addWallet(wallet: SocialRecoveryWallet): void {
    const key = `${wallet.address.toLowerCase()}-${wallet.chainId}`;
    this.wallets.set(key, wallet);
  }

  /**
   * Get wallet
   */
  getWallet(address: string, chainId: number): SocialRecoveryWallet | null {
    const key = `${address.toLowerCase()}-${chainId}`;
    return this.wallets.get(key) || null;
  }

  /**
   * Add guardian
   */
  addGuardian(
    walletAddress: string,
    chainId: number,
    guardian: Guardian
  ): boolean {
    const wallet = this.getWallet(walletAddress, chainId);
    if (!wallet) {
      return false;
    }

    // Check if guardian already exists
    const exists = wallet.guardians.some(
      g => g.address.toLowerCase() === guardian.address.toLowerCase()
    );
    if (exists) {
      return false;
    }

    wallet.guardians.push(guardian);
    return true;
  }

  /**
   * Remove guardian
   */
  removeGuardian(
    walletAddress: string,
    chainId: number,
    guardianAddress: string
  ): boolean {
    const wallet = this.getWallet(walletAddress, chainId);
    if (!wallet) {
      return false;
    }

    const index = wallet.guardians.findIndex(
      g => g.address.toLowerCase() === guardianAddress.toLowerCase()
    );
    if (index === -1) {
      return false;
    }

    wallet.guardians.splice(index, 1);
    return true;
  }

  /**
   * Create recovery request
   */
  createRecoveryRequest(
    walletAddress: string,
    chainId: number,
    newOwner: string,
    requestedBy: string
  ): RecoveryRequest | null {
    const wallet = this.getWallet(walletAddress, chainId);
    if (!wallet) {
      return null;
    }

    const id = `recovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    const request: RecoveryRequest = {
      id,
      walletAddress,
      newOwner,
      requestedBy,
      requestedAt: Date.now(),
      expiresAt,
      guardianSignatures: [],
      status: 'pending',
      requiredSignatures: wallet.threshold,
      currentSignatures: 0,
    };

    this.recoveryRequests.set(id, request);
    return request;
  }

  /**
   * Sign recovery request
   */
  signRecoveryRequest(
    requestId: string,
    guardianAddress: string,
    signature: string
  ): boolean {
    const request = this.recoveryRequests.get(requestId);
    if (!request || request.status !== 'pending') {
      return false;
    }

    // Check if guardian is valid
    const wallet = this.getWallet(request.walletAddress, 1); // Simplified chainId
    if (!wallet) {
      return false;
    }

    const guardian = wallet.guardians.find(
      g => g.address.toLowerCase() === guardianAddress.toLowerCase() && g.isActive
    );
    if (!guardian) {
      return false;
    }

    // Check if already signed
    const alreadySigned = request.guardianSignatures.some(
      s => s.guardian.toLowerCase() === guardianAddress.toLowerCase()
    );
    if (alreadySigned) {
      return false;
    }

    // Add signature
    request.guardianSignatures.push({
      guardian: guardianAddress,
      signature,
      timestamp: Date.now(),
    });

    request.currentSignatures = request.guardianSignatures.length;

    // Check if threshold met
    if (request.currentSignatures >= request.requiredSignatures) {
      request.status = 'approved';
    }

    return true;
  }

  /**
   * Get recovery request
   */
  getRecoveryRequest(id: string): RecoveryRequest | null {
    return this.recoveryRequests.get(id) || null;
  }

  /**
   * Get pending recovery requests
   */
  getPendingRecoveries(walletAddress?: string): RecoveryRequest[] {
    const now = Date.now();
    let requests = Array.from(this.recoveryRequests.values())
      .filter(r => r.status === 'pending');

    // Check expiration
    requests.forEach(request => {
      if (request.expiresAt < now) {
        request.status = 'expired';
      }
    });

    requests = requests.filter(r => r.status === 'pending');

    if (walletAddress) {
      requests = requests.filter(
        r => r.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );
    }

    return requests.sort((a, b) => a.expiresAt - b.expiresAt);
  }

  /**
   * Get statistics
   */
  getStats(): SocialRecoveryStats {
    const wallets = Array.from(this.wallets.values());
    const totalGuardians = wallets.reduce((sum, w) => sum + w.guardians.length, 0);
    const averageGuardians = wallets.length > 0
      ? totalGuardians / wallets.length
      : 0;
    const averageThreshold = wallets.length > 0
      ? wallets.reduce((sum, w) => sum + w.threshold, 0) / wallets.length
      : 0;

    const pendingRecoveries = this.getPendingRecoveries().length;
    const completedRecoveries = Array.from(this.recoveryRequests.values())
      .filter(r => r.status === 'approved').length;

    return {
      totalWallets: wallets.length,
      totalGuardians,
      averageGuardians: Math.round(averageGuardians * 100) / 100,
      averageThreshold: Math.round(averageThreshold * 100) / 100,
      pendingRecoveries,
      completedRecoveries,
    };
  }

  /**
   * Validate wallet configuration
   */
  validateWallet(wallet: SocialRecoveryWallet): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (wallet.guardians.length < 2) {
      errors.push('At least 2 guardians are required');
    }

    if (wallet.threshold < 2) {
      errors.push('Threshold must be at least 2');
    }

    if (wallet.threshold > wallet.guardians.length) {
      errors.push('Threshold cannot exceed number of guardians');
    }

    if (wallet.threshold === wallet.guardians.length) {
      warnings.push('Threshold equals guardian count. Any guardian compromise affects security.');
    }

    const activeGuardians = wallet.guardians.filter(g => g.isActive).length;
    if (activeGuardians < wallet.threshold) {
      errors.push('Not enough active guardians to meet threshold');
    }

    if (wallet.recoveryDelay < 86400) {
      warnings.push('Recovery delay is less than 24 hours. Consider longer delay for security.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.wallets.clear();
    this.recoveryRequests.clear();
  }
}

// Singleton instance
export const socialRecoveryManager = new SocialRecoveryManager();

