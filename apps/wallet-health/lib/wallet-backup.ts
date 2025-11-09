/**
 * Wallet Backup & Export Utility
 * Secure wallet data export and backup functionality
 */

import type { WalletScanResult } from '@wallet-health/types';
import { formatAddress } from './utils';

export interface BackupData {
  version: string;
  timestamp: number;
  walletAddress: string;
  chainId: number;
  scanResults: WalletScanResult[];
  preferences?: {
    alerts: boolean;
    monitoring: boolean;
    theme: string;
  };
  metadata: {
    exportDate: string;
    exportVersion: string;
    totalScans: number;
  };
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'encrypted';
  includeHistory?: boolean;
  includePreferences?: boolean;
  encrypt?: boolean;
  password?: string;
}

export class WalletBackup {
  private readonly VERSION = '1.0.0';

  /**
   * Create backup data structure
   */
  createBackup(
    walletAddress: string,
    chainId: number,
    scanResults: WalletScanResult[],
    preferences?: BackupData['preferences']
  ): BackupData {
    return {
      version: this.VERSION,
      timestamp: Date.now(),
      walletAddress,
      chainId,
      scanResults,
      preferences,
      metadata: {
        exportDate: new Date().toISOString(),
        exportVersion: this.VERSION,
        totalScans: scanResults.length,
      },
    };
  }

  /**
   * Export wallet data as JSON
   */
  exportAsJSON(backupData: BackupData, filename?: string): void {
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `wallet-backup-${formatAddress(backupData.walletAddress)}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export wallet data as encrypted JSON
   */
  async exportAsEncrypted(
    backupData: BackupData,
    password: string,
    filename?: string
  ): Promise<void> {
    // Simple encryption using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(backupData));
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const encryptedData = {
      encrypted: Array.from(new Uint8Array(encrypted)),
      salt: Array.from(salt),
      iv: Array.from(iv),
      version: this.VERSION,
    };

    const dataStr = JSON.stringify(encryptedData);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `wallet-backup-encrypted-${formatAddress(backupData.walletAddress)}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import encrypted backup
   */
  async importEncrypted(
    encryptedData: {
      encrypted: number[];
      salt: number[];
      iv: number[];
      version: string;
    },
    password: string
  ): Promise<BackupData> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(encryptedData.salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(encryptedData.iv),
      },
      key,
      new Uint8Array(encryptedData.encrypted)
    );

    return JSON.parse(decoder.decode(decrypted));
  }

  /**
   * Validate backup data integrity
   */
  validateBackup(backupData: BackupData): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check version
    if (!backupData.version) {
      errors.push('Missing version field');
    }

    // Check wallet address
    if (!backupData.walletAddress || !backupData.walletAddress.startsWith('0x')) {
      errors.push('Invalid wallet address');
    }

    // Check scan results
    if (!backupData.scanResults || !Array.isArray(backupData.scanResults)) {
      errors.push('Invalid scan results format');
    }

    // Check timestamp
    if (!backupData.timestamp || backupData.timestamp > Date.now()) {
      warnings.push('Invalid or future timestamp');
    }

    // Check metadata
    if (!backupData.metadata) {
      warnings.push('Missing metadata');
    } else {
      if (backupData.metadata.totalScans !== backupData.scanResults.length) {
        warnings.push('Scan count mismatch in metadata');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate backup summary
   */
  generateSummary(backupData: BackupData): string {
    const latestScan = backupData.scanResults[backupData.scanResults.length - 1];
    const summary = `
Wallet Backup Summary
═══════════════════════════════════════
Wallet: ${backupData.walletAddress}
Chain: ${backupData.chainId}
Export Date: ${new Date(backupData.timestamp).toLocaleString()}
Total Scans: ${backupData.scanResults.length}

Latest Scan:
  Security Score: ${latestScan?.score || 'N/A'}/100
  Risk Level: ${latestScan?.riskLevel || 'N/A'}
  Total Approvals: ${latestScan?.approvals?.length || 0}
  Alerts: ${latestScan?.alerts?.length || 0}

═══════════════════════════════════════
    `.trim();

    return summary;
  }
}

// Singleton instance
export const walletBackup = new WalletBackup();

