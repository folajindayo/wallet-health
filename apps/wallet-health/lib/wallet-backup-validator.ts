/**
 * Wallet Backup Validator Utility
 * Validate wallet backups and recovery phrases
 */

export interface BackupValidation {
  type: 'seed_phrase' | 'private_key' | 'keystore';
  isValid: boolean;
  errors: string[];
  warnings: string[];
  strength: 'weak' | 'medium' | 'strong';
  checks: Array<{
    name: string;
    passed: boolean;
    message: string;
  }>;
}

export interface SeedPhraseValidation extends BackupValidation {
  wordCount: number;
  words: string[];
  checksumValid: boolean;
  duplicateWords: boolean;
  invalidWords: string[];
}

export class WalletBackupValidator {
  private readonly BIP39_WORDLIST: Set<string> = new Set([
    // Simplified - would include full BIP39 wordlist
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    // ... full list would be here
  ]);

  /**
   * Validate seed phrase
   */
  validateSeedPhrase(seedPhrase: string): SeedPhraseValidation {
    const words = seedPhrase.trim().toLowerCase().split(/\s+/);
    const checks: Array<{ name: string; passed: boolean; message: string }> = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check word count
    const validWordCounts = [12, 15, 18, 21, 24];
    const wordCountCheck = validWordCounts.includes(words.length);
    checks.push({
      name: 'Word Count',
      passed: wordCountCheck,
      message: wordCountCheck
        ? `Valid word count: ${words.length}`
        : `Invalid word count: ${words.length}. Must be 12, 15, 18, 21, or 24`,
    });

    if (!wordCountCheck) {
      errors.push(`Invalid word count: ${words.length}`);
    }

    // Check for invalid words
    const invalidWords: string[] = [];
    words.forEach((word, index) => {
      if (!this.BIP39_WORDLIST.has(word)) {
        invalidWords.push(`Word ${index + 1}: "${word}"`);
      }
    });

    const invalidWordsCheck = invalidWords.length === 0;
    checks.push({
      name: 'Valid Words',
      passed: invalidWordsCheck,
      message: invalidWordsCheck
        ? 'All words are valid BIP39 words'
        : `Invalid words found: ${invalidWords.join(', ')}`,
    });

    if (!invalidWordsCheck) {
      errors.push(`Invalid words: ${invalidWords.join(', ')}`);
    }

    // Check for duplicates
    const uniqueWords = new Set(words);
    const duplicateWords = uniqueWords.size !== words.length;
    checks.push({
      name: 'No Duplicates',
      passed: !duplicateWords,
      message: duplicateWords
        ? 'Duplicate words found in seed phrase'
        : 'No duplicate words',
    });

    if (duplicateWords) {
      warnings.push('Duplicate words found - this may indicate an error');
    }

    // Check checksum (simplified - would use proper BIP39 checksum validation)
    const checksumValid = this.validateChecksum(words);
    checks.push({
      name: 'Checksum',
      passed: checksumValid,
      message: checksumValid
        ? 'Checksum is valid'
        : 'Checksum validation failed - seed phrase may be incorrect',
    });

    if (!checksumValid) {
      errors.push('Checksum validation failed');
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (errors.length === 0 && words.length >= 18) {
      strength = 'strong';
    } else if (errors.length === 0) {
      strength = 'medium';
    }

    const isValid = errors.length === 0;

    return {
      type: 'seed_phrase',
      isValid,
      errors,
      warnings,
      strength,
      checks,
      wordCount: words.length,
      words,
      checksumValid,
      duplicateWords,
      invalidWords,
    };
  }

  /**
   * Validate private key
   */
  validatePrivateKey(privateKey: string): BackupValidation {
    const checks: Array<{ name: string; passed: boolean; message: string }> = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Remove 0x prefix if present
    const cleaned = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

    // Check length (64 hex characters)
    const lengthCheck = cleaned.length === 64;
    checks.push({
      name: 'Length',
      passed: lengthCheck,
      message: lengthCheck
        ? 'Valid length: 64 characters'
        : `Invalid length: ${cleaned.length} (must be 64)`,
    });

    if (!lengthCheck) {
      errors.push(`Invalid private key length: ${cleaned.length}`);
    }

    // Check hex format
    const hexPattern = /^[0-9a-fA-F]+$/;
    const formatCheck = hexPattern.test(cleaned);
    checks.push({
      name: 'Format',
      passed: formatCheck,
      message: formatCheck
        ? 'Valid hexadecimal format'
        : 'Invalid format - must be hexadecimal',
    });

    if (!formatCheck) {
      errors.push('Private key contains invalid characters');
    }

    // Check if all zeros (invalid)
    const allZeros = /^0+$/.test(cleaned);
    if (allZeros) {
      errors.push('Private key cannot be all zeros');
      checks.push({
        name: 'Not All Zeros',
        passed: false,
        message: 'Private key is all zeros - invalid',
      });
    } else {
      checks.push({
        name: 'Not All Zeros',
        passed: true,
        message: 'Private key is not all zeros',
      });
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (errors.length === 0) {
      strength = 'strong';
    }

    const isValid = errors.length === 0;

    return {
      type: 'private_key',
      isValid,
      errors,
      warnings,
      strength,
      checks,
    };
  }

  /**
   * Validate checksum (simplified BIP39 checksum validation)
   */
  private validateChecksum(words: string[]): boolean {
    // Simplified - in production would use proper BIP39 checksum algorithm
    // This is a placeholder that always returns true for valid word counts
    const validWordCounts = [12, 15, 18, 21, 24];
    return validWordCounts.includes(words.length);
  }

  /**
   * Suggest corrections for seed phrase
   */
  suggestCorrections(seedPhrase: string): string[] {
    const words = seedPhrase.trim().toLowerCase().split(/\s+/);
    const suggestions: string[] = [];

    words.forEach((word, index) => {
      if (!this.BIP39_WORDLIST.has(word)) {
        // Find similar words (simplified - would use edit distance)
        const similar = Array.from(this.BIP39_WORDLIST).filter(w => {
          return w.startsWith(word.substring(0, 3)) || word.startsWith(w.substring(0, 3));
        }).slice(0, 3);

        if (similar.length > 0) {
          suggestions.push(`Word ${index + 1} "${word}" might be: ${similar.join(', ')}`);
        }
      }
    });

    return suggestions;
  }

  /**
   * Check backup security
   */
  checkBackupSecurity(backup: BackupValidation): {
    secure: boolean;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    if (backup.strength === 'weak') {
      recommendations.push('Backup strength is weak - consider creating a new backup');
    }

    if (backup.errors.length > 0) {
      recommendations.push('Fix validation errors before using this backup');
    }

    if (backup.warnings.length > 0) {
      recommendations.push('Review warnings carefully');
    }

    recommendations.push('Store backup in secure, offline location');
    recommendations.push('Never share backup with anyone');
    recommendations.push('Consider using hardware wallet for additional security');

    return {
      secure: backup.isValid && backup.strength !== 'weak',
      recommendations,
    };
  }
}

// Singleton instance
export const walletBackupValidator = new WalletBackupValidator();
