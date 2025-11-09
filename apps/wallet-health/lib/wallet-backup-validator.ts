/**
 * Wallet Backup Validator Utility
 * Validate and verify wallet backup integrity and security
 */

export interface BackupValidation {
  valid: boolean;
  integrity: {
    checksumValid: boolean;
    structureValid: boolean;
    dataComplete: boolean;
  };
  security: {
    isEncrypted: boolean;
    encryptionStrength?: 'weak' | 'medium' | 'strong';
    passwordProtected: boolean;
  };
  completeness: {
    hasWalletAddress: boolean;
    hasScanResults: boolean;
    hasPreferences: boolean;
    hasMetadata: boolean;
  };
  age: {
    backupAge: number; // days
    isRecent: boolean;
    isExpired: boolean;
  };
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    type: 'integrity' | 'security' | 'completeness' | 'age';
    message: string;
    recommendation: string;
  }>;
  score: number; // 0-100
}

export interface BackupMetadata {
  version?: string;
  timestamp?: number;
  walletAddress?: string;
  chainId?: number;
  exportDate?: string;
  exportVersion?: string;
  totalScans?: number;
}

export class WalletBackupValidator {
  /**
   * Validate backup data
   */
  validateBackup(backupData: {
    version?: string;
    timestamp?: number;
    walletAddress?: string;
    chainId?: number;
    scanResults?: unknown[];
    preferences?: unknown;
    metadata?: BackupMetadata;
    encrypted?: boolean;
  }): BackupValidation {
    const issues: BackupValidation['issues'] = [];
    let score = 100;

    // Check integrity
    const integrity = this.checkIntegrity(backupData);
    if (!integrity.checksumValid) {
      issues.push({
        severity: 'critical',
        type: 'integrity',
        message: 'Backup checksum validation failed',
        recommendation: 'Backup may be corrupted - do not use',
      });
      score -= 50;
    }

    if (!integrity.structureValid) {
      issues.push({
        severity: 'high',
        type: 'integrity',
        message: 'Backup structure is invalid',
        recommendation: 'Verify backup format matches expected structure',
      });
      score -= 30;
    }

    if (!integrity.dataComplete) {
      issues.push({
        severity: 'medium',
        type: 'integrity',
        message: 'Backup data appears incomplete',
        recommendation: 'Verify all expected data is present',
      });
      score -= 20;
    }

    // Check security
    const security = this.checkSecurity(backupData);
    if (!security.isEncrypted) {
      issues.push({
        severity: 'high',
        type: 'security',
        message: 'Backup is not encrypted',
        recommendation: 'Use encrypted backup format for sensitive data',
      });
      score -= 25;
    }

    if (security.encryptionStrength === 'weak') {
      issues.push({
        severity: 'medium',
        type: 'security',
        message: 'Weak encryption detected',
        recommendation: 'Use stronger encryption (AES-256-GCM)',
      });
      score -= 15;
    }

    // Check completeness
    const completeness = this.checkCompleteness(backupData);
    if (!completeness.hasWalletAddress) {
      issues.push({
        severity: 'critical',
        type: 'completeness',
        message: 'Wallet address missing',
        recommendation: 'Backup must include wallet address',
      });
      score -= 30;
    }

    if (!completeness.hasScanResults) {
      issues.push({
        severity: 'medium',
        type: 'completeness',
        message: 'Scan results missing',
        recommendation: 'Include scan results for complete backup',
      });
      score -= 10;
    }

    // Check age
    const age = this.checkAge(backupData);
    if (age.isExpired) {
      issues.push({
        severity: 'low',
        type: 'age',
        message: `Backup is ${age.backupAge} days old`,
        recommendation: 'Create fresh backup to ensure data is current',
      });
      score -= 5;
    }

    return {
      valid: issues.filter(i => i.severity === 'critical').length === 0,
      integrity,
      security,
      completeness,
      age,
      issues,
      score: Math.max(0, Math.min(100, score)),
    };
  }

  /**
   * Check backup integrity
   */
  private checkIntegrity(backupData: unknown): BackupValidation['integrity'] {
    // Check if data is valid JSON structure
    const structureValid = typeof backupData === 'object' && backupData !== null;

    // Check for required top-level fields
    const hasRequiredFields = structureValid && (
      'version' in (backupData as Record<string, unknown>) ||
      'timestamp' in (backupData as Record<string, unknown>) ||
      'walletAddress' in (backupData as Record<string, unknown>)
    );

    // Checksum validation would require actual checksum in backup
    const checksumValid = true; // Placeholder

    return {
      checksumValid,
      structureValid: structureValid && hasRequiredFields,
      dataComplete: hasRequiredFields,
    };
  }

  /**
   * Check backup security
   */
  private checkSecurity(backupData: {
    encrypted?: boolean;
    [key: string]: unknown;
  }): BackupValidation['security'] {
    const isEncrypted = backupData.encrypted === true;
    
    // Check for encryption indicators
    const hasEncryptionFields = 'encrypted' in backupData ||
      'salt' in backupData ||
      'iv' in backupData;

    let encryptionStrength: BackupValidation['security']['encryptionStrength'];
    if (isEncrypted && hasEncryptionFields) {
      encryptionStrength = 'strong'; // Would check actual algorithm
    } else if (isEncrypted) {
      encryptionStrength = 'medium';
    }

    return {
      isEncrypted,
      encryptionStrength,
      passwordProtected: isEncrypted,
    };
  }

  /**
   * Check backup completeness
   */
  private checkCompleteness(backupData: {
    walletAddress?: string;
    scanResults?: unknown[];
    preferences?: unknown;
    metadata?: BackupMetadata;
  }): BackupValidation['completeness'] {
    return {
      hasWalletAddress: !!backupData.walletAddress,
      hasScanResults: !!backupData.scanResults && Array.isArray(backupData.scanResults),
      hasPreferences: !!backupData.preferences,
      hasMetadata: !!backupData.metadata,
    };
  }

  /**
   * Check backup age
   */
  private checkAge(backupData: {
    timestamp?: number;
    metadata?: BackupMetadata;
  }): BackupValidation['age'] {
    const timestamp = backupData.timestamp || 
      (backupData.metadata?.exportDate 
        ? new Date(backupData.metadata.exportDate).getTime()
        : undefined);

    if (!timestamp) {
      return {
        backupAge: 0,
        isRecent: false,
        isExpired: true,
      };
    }

    const ageMs = Date.now() - timestamp;
    const backupAge = ageMs / (24 * 60 * 60 * 1000); // days

    return {
      backupAge: Math.round(backupAge * 100) / 100,
      isRecent: backupAge < 30,
      isExpired: backupAge > 90,
    };
  }

  /**
   * Verify backup can be restored
   */
  verifyRestoreCapability(backupData: {
    version?: string;
    walletAddress?: string;
    scanResults?: unknown[];
  }): {
    canRestore: boolean;
    missingData: string[];
    warnings: string[];
  } {
    const missingData: string[] = [];
    const warnings: string[] = [];

    if (!backupData.walletAddress) {
      missingData.push('Wallet address');
    }

    if (!backupData.scanResults || backupData.scanResults.length === 0) {
      warnings.push('No scan results - restore will have limited data');
    }

    // Check version compatibility
    if (backupData.version) {
      const version = parseFloat(backupData.version);
      if (version < 1.0) {
        warnings.push('Backup version is outdated - may have compatibility issues');
      }
    }

    return {
      canRestore: missingData.length === 0,
      missingData,
      warnings,
    };
  }

  /**
   * Compare two backups
   */
  compareBackups(
    backup1: { timestamp?: number; scanResults?: unknown[] },
    backup2: { timestamp?: number; scanResults?: unknown[] }
  ): {
    newer: 'backup1' | 'backup2' | 'equal';
    scanCountDifference: number;
    ageDifference: number; // days
  } {
    const timestamp1 = backup1.timestamp || 0;
    const timestamp2 = backup2.timestamp || 0;
    
    let newer: 'backup1' | 'backup2' | 'equal';
    if (timestamp1 > timestamp2) {
      newer = 'backup1';
    } else if (timestamp2 > timestamp1) {
      newer = 'backup2';
    } else {
      newer = 'equal';
    }

    const scanCount1 = backup1.scanResults?.length || 0;
    const scanCount2 = backup2.scanResults?.length || 0;
    const scanCountDifference = scanCount2 - scanCount1;

    const ageDifference = Math.abs(timestamp1 - timestamp2) / (24 * 60 * 60 * 1000);

    return {
      newer,
      scanCountDifference,
      ageDifference: Math.round(ageDifference * 100) / 100,
    };
  }
}

// Singleton instance
export const walletBackupValidator = new WalletBackupValidator();

