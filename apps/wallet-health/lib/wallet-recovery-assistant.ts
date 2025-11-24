/**
 * Wallet Recovery Assistant Utility
 * Help with wallet recovery processes
 */

export interface RecoveryMethod {
  type: 'seed_phrase' | 'private_key' | 'hardware_wallet' | 'social_recovery' | 'multi_sig';
  name: string;
  description: string;
  steps: string[];
  requirements: string[];
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface RecoveryChecklist {
  walletAddress: string;
  hasSeedPhrase: boolean;
  hasPrivateKey: boolean;
  hasHardwareWallet: boolean;
  hasBackup: boolean;
  recoveryMethods: RecoveryMethod[];
  recommendedMethod: RecoveryMethod | null;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface RecoveryGuide {
  method: RecoveryMethod;
  detailedSteps: Array<{
    step: number;
    title: string;
    description: string;
    warnings?: string[];
    tips?: string[];
  }>;
  commonIssues: Array<{
    issue: string;
    solution: string;
  }>;
}

export class WalletRecoveryAssistant {
  private readonly RECOVERY_METHODS: RecoveryMethod[] = [
    {
      type: 'seed_phrase',
      name: 'Seed Phrase Recovery',
      description: 'Recover wallet using 12 or 24-word seed phrase',
      steps: [
        'Locate your seed phrase (should be written down securely)',
        'Open your wallet application',
        'Select "Import Wallet" or "Restore Wallet"',
        'Enter your seed phrase in the correct order',
        'Set a new password',
        'Verify wallet address matches your original',
      ],
      requirements: [
        '12 or 24-word seed phrase',
        'Original wallet application or compatible wallet',
      ],
      estimatedTime: '5-10 minutes',
      difficulty: 'easy',
    },
    {
      type: 'private_key',
      name: 'Private Key Recovery',
      description: 'Recover wallet using private key',
      steps: [
        'Locate your private key (should be stored securely)',
        'Open your wallet application',
        'Select "Import Wallet" or "Add Account"',
        'Choose "Private Key" option',
        'Paste your private key',
        'Set a new password',
        'Verify wallet address matches your original',
      ],
      requirements: [
        'Private key (64-character hex string)',
        'Wallet application that supports private key import',
      ],
      estimatedTime: '5 minutes',
      difficulty: 'easy',
    },
    {
      type: 'hardware_wallet',
      name: 'Hardware Wallet Recovery',
      description: 'Recover using hardware wallet device',
      steps: [
        'Locate your hardware wallet device',
        'Connect device to computer',
        'Enter PIN if required',
        'Follow device-specific recovery process',
        'Enter seed phrase if prompted',
        'Verify wallet address',
      ],
      requirements: [
        'Hardware wallet device (Ledger, Trezor, etc.)',
        'Recovery seed phrase',
        'Device-specific software',
      ],
      estimatedTime: '10-15 minutes',
      difficulty: 'medium',
    },
    {
      type: 'social_recovery',
      name: 'Social Recovery',
      description: 'Recover using social recovery guardians',
      steps: [
        'Contact your recovery guardians',
        'Request recovery approval from guardians',
        'Wait for required number of approvals',
        'Complete recovery process',
        'Set new wallet credentials',
      ],
      requirements: [
        'Access to guardian contacts',
        'Required number of guardian approvals',
        'Recovery delay period completion (if applicable)',
      ],
      estimatedTime: '1-7 days',
      difficulty: 'hard',
    },
    {
      type: 'multi_sig',
      name: 'Multi-signature Recovery',
      description: 'Recover multi-signature wallet',
      steps: [
        'Identify all required signers',
        'Contact each signer',
        'Coordinate signing process',
        'Execute recovery transaction',
        'Verify wallet access',
      ],
      requirements: [
        'Access to required number of signers',
        'Signer private keys or hardware wallets',
        'Multi-sig wallet contract address',
      ],
      estimatedTime: '1-3 days',
      difficulty: 'hard',
    },
  ];

  /**
   * Get recovery checklist
   */
  getRecoveryChecklist(
    walletAddress: string,
    options: {
      hasSeedPhrase?: boolean;
      hasPrivateKey?: boolean;
      hasHardwareWallet?: boolean;
      hasBackup?: boolean;
    }
  ): RecoveryChecklist {
    const hasSeedPhrase = options.hasSeedPhrase || false;
    const hasPrivateKey = options.hasPrivateKey || false;
    const hasHardwareWallet = options.hasHardwareWallet || false;
    const hasBackup = options.hasBackup || false;

    // Filter available methods
    const availableMethods = this.RECOVERY_METHODS.filter(method => {
      switch (method.type) {
        case 'seed_phrase':
          return hasSeedPhrase;
        case 'private_key':
          return hasPrivateKey;
        case 'hardware_wallet':
          return hasHardwareWallet;
        case 'social_recovery':
        case 'multi_sig':
          return true; // Always available
        default:
          return false;
      }
    });

    // Determine recommended method
    let recommendedMethod: RecoveryMethod | null = null;
    if (hasSeedPhrase) {
      recommendedMethod = this.RECOVERY_METHODS.find(m => m.type === 'seed_phrase') || null;
    } else if (hasPrivateKey) {
      recommendedMethod = this.RECOVERY_METHODS.find(m => m.type === 'private_key') || null;
    } else if (hasHardwareWallet) {
      recommendedMethod = this.RECOVERY_METHODS.find(m => m.type === 'hardware_wallet') || null;
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (!hasSeedPhrase && !hasPrivateKey && !hasHardwareWallet) {
      riskLevel = 'high';
    } else if (!hasBackup) {
      riskLevel = 'medium';
    }

    return {
      walletAddress,
      hasSeedPhrase,
      hasPrivateKey,
      hasHardwareWallet,
      hasBackup,
      recoveryMethods: availableMethods,
      recommendedMethod,
      riskLevel,
    };
  }

  /**
   * Get recovery guide
   */
  getRecoveryGuide(methodType: RecoveryMethod['type']): RecoveryGuide | null {
    const method = this.RECOVERY_METHODS.find(m => m.type === methodType);
    if (!method) {
      return null;
    }

    // Generate detailed steps
    const detailedSteps = method.steps.map((step, index) => ({
      step: index + 1,
      title: step,
      description: this.getStepDescription(methodType, index),
      warnings: this.getStepWarnings(methodType, index),
      tips: this.getStepTips(methodType, index),
    }));

    // Common issues
    const commonIssues = this.getCommonIssues(methodType);

    return {
      method,
      detailedSteps,
      commonIssues,
    };
  }

  /**
   * Get step description
   */
  private getStepDescription(methodType: RecoveryMethod['type'], stepIndex: number): string {
    // Simplified - would have detailed descriptions for each step
    return `Follow this step carefully to ensure successful wallet recovery.`;
  }

  /**
   * Get step warnings
   */
  private getStepWarnings(methodType: RecoveryMethod['type'], stepIndex: number): string[] {
    const warnings: string[] = [];

    if (methodType === 'seed_phrase' && stepIndex === 0) {
      warnings.push('Never share your seed phrase with anyone');
      warnings.push('Only enter seed phrase in official wallet applications');
    }

    if (methodType === 'private_key' && stepIndex === 3) {
      warnings.push('Ensure you are in a secure, private location');
      warnings.push('Never share your private key');
    }

    return warnings;
  }

  /**
   * Get step tips
   */
  private getStepTips(methodType: RecoveryMethod['type'], stepIndex: number): string[] {
    const tips: string[] = [];

    if (methodType === 'seed_phrase' && stepIndex === 3) {
      tips.push('Double-check each word for typos');
      tips.push('Ensure words are in the correct order');
    }

    return tips;
  }

  /**
   * Get common issues
   */
  private getCommonIssues(methodType: RecoveryMethod['type']): Array<{
    issue: string;
    solution: string;
  }> {
    const issues: Array<{ issue: string; solution: string }> = [];

    if (methodType === 'seed_phrase') {
      issues.push({
        issue: 'Seed phrase not working',
        solution: 'Verify all words are spelled correctly and in the correct order. Check if you have the right seed phrase for this wallet.',
      });
      issues.push({
        issue: 'Wallet address does not match',
        solution: 'Ensure you are using the correct derivation path. Some wallets use different paths.',
      });
    }

    if (methodType === 'private_key') {
      issues.push({
        issue: 'Invalid private key format',
        solution: 'Private key must be 64 hexadecimal characters (0-9, a-f). Ensure there are no spaces or extra characters.',
      });
    }

    return issues;
  }

  /**
   * Get all recovery methods
   */
  getAllRecoveryMethods(): RecoveryMethod[] {
    return [...this.RECOVERY_METHODS];
  }
}

// Singleton instance
export const walletRecoveryAssistant = new WalletRecoveryAssistant();

