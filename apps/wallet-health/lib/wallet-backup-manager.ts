/**
 * Wallet Backup Manager Utility
 * Helps manage wallet backups and recovery
 */

export interface BackupInfo {
  id: string;
  walletAddress: string;
  backupType: 'seed_phrase' | 'private_key' | 'keystore' | 'hardware';
  createdAt: number;
  lastVerified: number;
  isEncrypted: boolean;
  location: 'local' | 'cloud' | 'hardware' | 'paper';
  verified: boolean;
  notes?: string;
}

export interface RecoveryInfo {
  walletAddress: string;
  recoveryMethod: 'seed_phrase' | 'private_key' | 'social_recovery' | 'multi_sig';
  setupDate: number;
  verified: boolean;
  guardians?: string[]; // For social recovery
  threshold?: number; // For multi-sig
}

export interface BackupHealth {
  walletAddress: string;
  hasBackup: boolean;
  backupAge: number; // days since last backup
  isVerified: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  backupScore: number; // 0-100
}

export interface BackupChecklist {
  seedPhraseBackedUp: boolean;
  seedPhraseVerified: boolean;
  privateKeyBackedUp: boolean;
  keystoreBackedUp: boolean;
  hardwareWalletUsed: boolean;
  socialRecoverySetup: boolean;
  multiSigSetup: boolean;
  backupLocationSecure: boolean;
  backupEncrypted: boolean;
  recoveryTested: boolean;
}

export class WalletBackupManager {
  private backups: Map<string, BackupInfo[]> = new Map();
  private recoveries: Map<string, RecoveryInfo> = new Map();

  /**
   * Add a backup
   */
  addBackup(backup: BackupInfo): void {
    const walletBackups = this.backups.get(backup.walletAddress.toLowerCase()) || [];
    walletBackups.push(backup);
    this.backups.set(backup.walletAddress.toLowerCase(), walletBackups);
  }

  /**
   * Add recovery info
   */
  addRecovery(recovery: RecoveryInfo): void {
    this.recoveries.set(recovery.walletAddress.toLowerCase(), recovery);
  }

  /**
   * Get backup health for a wallet
   */
  getBackupHealth(walletAddress: string): BackupHealth {
    const walletBackups = this.backups.get(walletAddress.toLowerCase()) || [];
    const recovery = this.recoveries.get(walletAddress.toLowerCase());

    const hasBackup = walletBackups.length > 0;
    const latestBackup = walletBackups.length > 0
      ? walletBackups.reduce((latest, current) => 
          current.createdAt > latest.createdAt ? current : latest
        )
      : null;

    const backupAge = latestBackup
      ? Math.floor((Date.now() - latestBackup.createdAt) / (24 * 60 * 60 * 1000))
      : Infinity;

    const isVerified = latestBackup?.verified || false;

    // Calculate risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'critical';
    let backupScore = 0;

    if (hasBackup) {
      backupScore += 30;
    }

    if (isVerified) {
      backupScore += 20;
    }

    if (backupAge < 90) {
      backupScore += 20;
    } else if (backupAge < 365) {
      backupScore += 10;
    }

    if (latestBackup?.isEncrypted) {
      backupScore += 15;
    }

    if (latestBackup?.location === 'hardware' || latestBackup?.location === 'paper') {
      backupScore += 15;
    }

    if (recovery) {
      backupScore += 10;
    }

    if (backupScore >= 80) {
      riskLevel = 'low';
    } else if (backupScore >= 60) {
      riskLevel = 'medium';
    } else if (backupScore >= 40) {
      riskLevel = 'high';
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (!hasBackup) {
      recommendations.push('CRITICAL: No backup found. Create a backup immediately.');
    }

    if (backupAge > 365) {
      recommendations.push('Backup is over 1 year old. Verify and update your backup.');
    }

    if (!isVerified) {
      recommendations.push('Backup has not been verified. Test your backup recovery process.');
    }

    if (latestBackup && !latestBackup.isEncrypted && latestBackup.location === 'cloud') {
      recommendations.push('Cloud backup is not encrypted. Enable encryption for security.');
    }

    if (!recovery) {
      recommendations.push('No recovery method configured. Set up social recovery or multi-sig.');
    }

    if (backupScore < 50) {
      recommendations.push('Backup security score is low. Review and improve backup practices.');
    }

    return {
      walletAddress,
      hasBackup,
      backupAge,
      isVerified,
      riskLevel,
      recommendations,
      backupScore,
    };
  }

  /**
   * Get backup checklist
   */
  getBackupChecklist(walletAddress: string): BackupChecklist {
    const walletBackups = this.backups.get(walletAddress.toLowerCase()) || [];
    const recovery = this.recoveries.get(walletAddress.toLowerCase());

    const seedPhraseBackedUp = walletBackups.some(b => b.backupType === 'seed_phrase');
    const seedPhraseVerified = walletBackups.some(b => 
      b.backupType === 'seed_phrase' && b.verified
    );
    const privateKeyBackedUp = walletBackups.some(b => b.backupType === 'private_key');
    const keystoreBackedUp = walletBackups.some(b => b.backupType === 'keystore');
    const hardwareWalletUsed = walletBackups.some(b => b.backupType === 'hardware');
    const socialRecoverySetup = recovery?.recoveryMethod === 'social_recovery';
    const multiSigSetup = recovery?.recoveryMethod === 'multi_sig';
    const backupLocationSecure = walletBackups.some(b => 
      b.location === 'hardware' || b.location === 'paper'
    );
    const backupEncrypted = walletBackups.some(b => b.isEncrypted);
    const recoveryTested = walletBackups.some(b => b.verified);

    return {
      seedPhraseBackedUp,
      seedPhraseVerified,
      privateKeyBackedUp,
      keystoreBackedUp,
      hardwareWalletUsed,
      socialRecoverySetup,
      multiSigSetup,
      backupLocationSecure,
      backupEncrypted,
      recoveryTested,
    };
  }

  /**
   * Verify backup
   */
  verifyBackup(walletAddress: string, backupId: string): boolean {
    const walletBackups = this.backups.get(walletAddress.toLowerCase()) || [];
    const backup = walletBackups.find(b => b.id === backupId);

    if (!backup) {
      return false;
    }

    backup.verified = true;
    backup.lastVerified = Date.now();
    return true;
  }

  /**
   * Get all backups for a wallet
   */
  getWalletBackups(walletAddress: string): BackupInfo[] {
    return this.backups.get(walletAddress.toLowerCase()) || [];
  }

  /**
   * Get recovery info
   */
  getRecoveryInfo(walletAddress: string): RecoveryInfo | null {
    return this.recoveries.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Generate backup recommendations
   */
  generateRecommendations(walletAddress: string): string[] {
    const health = this.getBackupHealth(walletAddress);
    const checklist = this.getBackupChecklist(walletAddress);

    const recommendations: string[] = [];

    if (!checklist.seedPhraseBackedUp) {
      recommendations.push('Write down your seed phrase and store it securely offline.');
    }

    if (checklist.seedPhraseBackedUp && !checklist.seedPhraseVerified) {
      recommendations.push('Verify your seed phrase backup by testing recovery.');
    }

    if (!checklist.hardwareWalletUsed) {
      recommendations.push('Consider using a hardware wallet for enhanced security.');
    }

    if (!checklist.socialRecoverySetup && !checklist.multiSigSetup) {
      recommendations.push('Set up social recovery or multi-sig for additional security.');
    }

    if (!checklist.backupEncrypted && health.hasBackup) {
      recommendations.push('Encrypt your backups if storing digitally.');
    }

    if (health.backupAge > 180) {
      recommendations.push('Update your backup regularly (every 6 months recommended).');
    }

    return recommendations;
  }

  /**
   * Clear all backups (for testing)
   */
  clear(): void {
    this.backups.clear();
    this.recoveries.clear();
  }
}

// Singleton instance
export const walletBackupManager = new WalletBackupManager();

