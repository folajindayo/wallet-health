/**
 * Wallet Recovery Checker Utility
 * Check wallet recovery phrase security and best practices
 */

export interface RecoveryPhraseCheck {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-100
  issues: RecoveryIssue[];
  recommendations: string[];
  entropy?: number;
}

export interface RecoveryIssue {
  type: 'common-words' | 'sequential' | 'repeated' | 'dictionary' | 'length' | 'checksum';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedWords?: number[];
}

export interface RecoveryBestPractices {
  hasBackup: boolean;
  backupLocation: string[];
  isEncrypted: boolean;
  isOffline: boolean;
  multipleBackups: boolean;
  trustedContacts: boolean;
  score: number;
  recommendations: string[];
}

export class WalletRecoveryChecker {
  private readonly COMMON_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
  ]);

  /**
   * Check recovery phrase strength (without storing the actual phrase)
   */
  checkRecoveryPhrase(words: string[]): RecoveryPhraseCheck {
    const issues: RecoveryIssue[] = [];
    let score = 100;

    // Check length
    if (words.length < 12) {
      issues.push({
        type: 'length',
        severity: 'critical',
        description: `Recovery phrase should be at least 12 words (you have ${words.length})`,
        affectedWords: [],
      });
      score -= 50;
    } else if (words.length < 24) {
      issues.push({
        type: 'length',
        severity: 'medium',
        description: 'Consider using a 24-word phrase for better security',
        affectedWords: [],
      });
      score -= 10;
    }

    // Check for repeated words
    const wordCounts = new Map<string, number[]>();
    words.forEach((word, index) => {
      const lower = word.toLowerCase();
      if (!wordCounts.has(lower)) {
        wordCounts.set(lower, []);
      }
      wordCounts.get(lower)!.push(index);
    });

    wordCounts.forEach((indices, word) => {
      if (indices.length > 1) {
        issues.push({
          type: 'repeated',
          severity: indices.length > 2 ? 'high' : 'medium',
          description: `Word "${word}" appears ${indices.length} times`,
          affectedWords: indices,
        });
        score -= indices.length * 5;
      }
    });

    // Check for sequential patterns
    const sequentialPatterns = this.detectSequentialPatterns(words);
    if (sequentialPatterns.length > 0) {
      issues.push({
        type: 'sequential',
        severity: 'high',
        description: 'Sequential patterns detected in recovery phrase',
        affectedWords: sequentialPatterns,
      });
      score -= 20;
    }

    // Check for common dictionary words (BIP39 words are fine, but common English words might indicate issues)
    const commonWordIndices: number[] = [];
    words.forEach((word, index) => {
      if (this.COMMON_WORDS.has(word.toLowerCase())) {
        commonWordIndices.push(index);
      }
    });

    if (commonWordIndices.length > words.length * 0.3) {
      issues.push({
        type: 'common-words',
        severity: 'medium',
        description: 'High percentage of common words detected',
        affectedWords: commonWordIndices,
      });
      score -= 15;
    }

    // Calculate strength level
    let strength: RecoveryPhraseCheck['strength'];
    if (score >= 90) {
      strength = 'very-strong';
    } else if (score >= 70) {
      strength = 'strong';
    } else if (score >= 50) {
      strength = 'medium';
    } else {
      strength = 'weak';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, words.length);

    return {
      strength,
      score: Math.max(0, Math.min(100, score)),
      issues,
      recommendations,
    };
  }

  /**
   * Detect sequential patterns in words
   */
  private detectSequentialPatterns(words: string[]): number[] {
    const sequential: number[] = [];
    
    // Check for numeric sequences (if words could be interpreted as numbers)
    // This is a simplified check - in reality, BIP39 words don't have numeric meaning
    
    // Check for alphabetical sequences
    for (let i = 0; i < words.length - 2; i++) {
      const word1 = words[i].toLowerCase();
      const word2 = words[i + 1].toLowerCase();
      const word3 = words[i + 2].toLowerCase();
      
      // Simple pattern detection (would need BIP39 word list for accurate checking)
      if (word1 === word2 || word2 === word3) {
        sequential.push(i, i + 1, i + 2);
      }
    }

    return [...new Set(sequential)];
  }

  /**
   * Generate recommendations based on issues
   */
  private generateRecommendations(issues: RecoveryIssue[], wordCount: number): string[] {
    const recommendations: string[] = [];

    if (wordCount < 12) {
      recommendations.push('Use at least 12 words for your recovery phrase');
    } else if (wordCount < 24) {
      recommendations.push('Consider upgrading to a 24-word recovery phrase for enhanced security');
    }

    const hasRepeated = issues.some(i => i.type === 'repeated');
    if (hasRepeated) {
      recommendations.push('Avoid repeating words in your recovery phrase');
    }

    const hasSequential = issues.some(i => i.type === 'sequential');
    if (hasSequential) {
      recommendations.push('Avoid sequential or predictable patterns');
    }

    recommendations.push('Never share your recovery phrase with anyone');
    recommendations.push('Store recovery phrase offline in a secure location');
    recommendations.push('Consider using a hardware wallet for additional security');
    recommendations.push('Create multiple secure backups in different locations');

    return recommendations;
  }

  /**
   * Check recovery phrase best practices
   */
  checkBestPractices(practices: Partial<RecoveryBestPractices>): RecoveryBestPractices {
    let score = 0;
    const recommendations: string[] = [];

    if (practices.hasBackup) {
      score += 20;
    } else {
      recommendations.push('Create at least one backup of your recovery phrase');
    }

    if (practices.backupLocation && practices.backupLocation.length > 0) {
      score += 10;
      if (practices.backupLocation.length > 1) {
        score += 10;
      } else {
        recommendations.push('Consider creating multiple backups in different locations');
      }
    }

    if (practices.isEncrypted) {
      score += 15;
    } else {
      recommendations.push('Encrypt your recovery phrase backup if storing digitally');
    }

    if (practices.isOffline) {
      score += 20;
    } else {
      recommendations.push('Store recovery phrase backups offline (not on internet-connected devices)');
    }

    if (practices.multipleBackups) {
      score += 15;
    } else {
      recommendations.push('Create multiple backups to prevent total loss');
    }

    if (practices.trustedContacts) {
      score += 10;
    } else {
      recommendations.push('Consider sharing recovery phrase with trusted contacts using secure methods');
    }

    return {
      hasBackup: practices.hasBackup || false,
      backupLocation: practices.backupLocation || [],
      isEncrypted: practices.isEncrypted || false,
      isOffline: practices.isOffline || false,
      multipleBackups: practices.multipleBackups || false,
      trustedContacts: practices.trustedContacts || false,
      score: Math.min(100, score),
      recommendations,
    };
  }

  /**
   * Validate recovery phrase format (without storing actual words)
   */
  validateFormat(words: string[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (words.length === 0) {
      errors.push('Recovery phrase cannot be empty');
      return { valid: false, errors, warnings };
    }

    if (words.length !== 12 && words.length !== 15 && words.length !== 18 && words.length !== 21 && words.length !== 24) {
      warnings.push(`Unusual word count: ${words.length}. Standard counts are 12, 15, 18, 21, or 24 words`);
    }

    // Check for empty words
    words.forEach((word, index) => {
      if (!word || word.trim().length === 0) {
        errors.push(`Word at position ${index + 1} is empty`);
      }
    });

    // Check word length (BIP39 words are typically 3-8 characters)
    words.forEach((word, index) => {
      if (word.length < 3) {
        warnings.push(`Word at position ${index + 1} is unusually short`);
      }
      if (word.length > 8) {
        warnings.push(`Word at position ${index + 1} is unusually long`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Singleton instance
export const walletRecoveryChecker = new WalletRecoveryChecker();

