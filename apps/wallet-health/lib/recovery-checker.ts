/**
 * Wallet Recovery Phrase Checker
 * Checks if recovery phrase might be exposed (without storing the actual phrase)
 */

export interface RecoveryCheckResult {
  isSecure: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  checks: Array<{
    check: string;
    passed: boolean;
    message: string;
    recommendation?: string;
  }>;
  recommendations: string[];
  score: number; // 0-100
}

export interface PhrasePattern {
  type: 'common_words' | 'sequential' | 'repeated' | 'dictionary' | 'short' | 'long';
  description: string;
  risk: 'low' | 'medium' | 'high';
}

export class RecoveryChecker {
  private readonly COMMON_WORDS = new Set([
    'password',
    '123456',
    'password123',
    'admin',
    'qwerty',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
    'master',
  ]);

  private readonly COMMON_BIP39_WORDS = new Set([
    'abandon',
    'ability',
    'able',
    'about',
    'above',
    // Add more common BIP39 words if needed
  ]);

  /**
   * Check recovery phrase security (without storing the phrase)
   */
  checkRecoveryPhrase(phrase: string): RecoveryCheckResult {
    const checks: RecoveryCheckResult['checks'] = [];
    let score = 100;

    // Check 1: Length validation
    const words = phrase.trim().split(/\s+/);
    const isValidLength = words.length === 12 || words.length === 24;
    checks.push({
      check: 'Phrase Length',
      passed: isValidLength,
      message: isValidLength
        ? `Valid ${words.length}-word phrase`
        : `Invalid phrase length: ${words.length} words (should be 12 or 24)`,
      recommendation: isValidLength
        ? undefined
        : 'Use a standard 12 or 24-word recovery phrase',
    });
    if (!isValidLength) score -= 20;

    // Check 2: No common dictionary words
    const hasCommonWords = words.some(word =>
      this.COMMON_WORDS.has(word.toLowerCase())
    );
    checks.push({
      check: 'Common Words',
      passed: !hasCommonWords,
      message: hasCommonWords
        ? 'Contains common dictionary words'
        : 'No common dictionary words detected',
      recommendation: hasCommonWords
        ? 'Avoid using common dictionary words in your recovery phrase'
        : undefined,
    });
    if (hasCommonWords) score -= 15;

    // Check 3: No sequential patterns
    const hasSequential = this.hasSequentialPattern(words);
    checks.push({
      check: 'Sequential Patterns',
      passed: !hasSequential,
      message: hasSequential
        ? 'Sequential patterns detected'
        : 'No sequential patterns detected',
      recommendation: hasSequential
        ? 'Avoid sequential or predictable word patterns'
        : undefined,
    });
    if (hasSequential) score -= 10;

    // Check 4: No repeated words
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const hasRepeats = uniqueWords.size < words.length;
    checks.push({
      check: 'Repeated Words',
      passed: !hasRepeats,
      message: hasRepeats
        ? 'Repeated words detected'
        : 'No repeated words',
      recommendation: hasRepeats
        ? 'Each word in recovery phrase should be unique'
        : undefined,
    });
    if (hasRepeats) score -= 10;

    // Check 5: Word length consistency
    const wordLengths = words.map(w => w.length);
    const avgLength = wordLengths.reduce((sum, len) => sum + len, 0) / wordLengths.length;
    const hasInconsistentLength = wordLengths.some(
      len => Math.abs(len - avgLength) > 3
    );
    checks.push({
      check: 'Word Length Consistency',
      passed: !hasInconsistentLength,
      message: hasInconsistentLength
        ? 'Inconsistent word lengths detected'
        : 'Word lengths are consistent',
      recommendation: hasInconsistentLength
        ? 'Verify all words are from the BIP39 word list'
        : undefined,
    });
    if (hasInconsistentLength) score -= 5;

    // Check 6: Entropy check (simplified)
    const entropy = this.calculateEntropy(words);
    const hasLowEntropy = entropy < 100; // Simplified threshold
    checks.push({
      check: 'Entropy',
      passed: !hasLowEntropy,
      message: hasLowEntropy
        ? 'Low entropy detected - phrase may be predictable'
        : `Good entropy: ${entropy.toFixed(2)}`,
      recommendation: hasLowEntropy
        ? 'Use a properly generated recovery phrase with high entropy'
        : undefined,
    });
    if (hasLowEntropy) score -= 20;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (score >= 80) {
      riskLevel = 'low';
    } else if (score >= 50) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(checks, riskLevel);

    return {
      isSecure: score >= 70 && isValidLength,
      riskLevel,
      checks,
      recommendations,
      score: Math.max(0, Math.min(100, score)),
    };
  }

  /**
   * Check if phrase might be exposed (heuristic check)
   */
  checkForExposure(phrase: string, context?: {
    storedInCloud?: boolean;
    sharedWithOthers?: boolean;
    writtenDown?: boolean;
    screenshotTaken?: boolean;
  }): {
    exposureRisk: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
  } {
    const factors: string[] = [];
    let riskScore = 0;

    if (context?.storedInCloud) {
      factors.push('Stored in cloud storage (high risk)');
      riskScore += 30;
    }

    if (context?.sharedWithOthers) {
      factors.push('Shared with others (high risk)');
      riskScore += 25;
    }

    if (context?.screenshotTaken) {
      factors.push('Screenshot taken (medium risk)');
      riskScore += 15;
    }

    if (context?.writtenDown) {
      factors.push('Written down (low-medium risk depending on storage)');
      riskScore += 10;
    }

    let exposureRisk: 'low' | 'medium' | 'high';
    if (riskScore >= 30) {
      exposureRisk = 'high';
    } else if (riskScore >= 15) {
      exposureRisk = 'medium';
    } else {
      exposureRisk = 'low';
    }

    const recommendations: string[] = [];
    if (exposureRisk === 'high') {
      recommendations.push('Immediately generate a new recovery phrase');
      recommendations.push('Transfer all funds to a new wallet');
      recommendations.push('Never store recovery phrase digitally');
    } else if (exposureRisk === 'medium') {
      recommendations.push('Consider generating a new recovery phrase');
      recommendations.push('Store recovery phrase in a secure physical location only');
    } else {
      recommendations.push('Keep recovery phrase secure and never share it');
      recommendations.push('Store in a secure physical location');
    }

    return {
      exposureRisk,
      factors,
      recommendations,
    };
  }

  /**
   * Validate BIP39 phrase format (without verifying actual words)
   */
  validateBIP39Format(phrase: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const words = phrase.trim().split(/\s+/);

    if (words.length !== 12 && words.length !== 24) {
      errors.push(`Invalid word count: ${words.length} (must be 12 or 24)`);
    }

    words.forEach((word, index) => {
      if (word.length < 3 || word.length > 8) {
        errors.push(`Word ${index + 1} has invalid length: ${word.length}`);
      }

      if (!/^[a-z]+$/.test(word.toLowerCase())) {
        errors.push(`Word ${index + 1} contains invalid characters`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Private helper methods
   */

  private hasSequentialPattern(words: string[]): boolean {
    // Check for simple sequential patterns
    for (let i = 1; i < words.length; i++) {
      const prev = words[i - 1].toLowerCase();
      const curr = words[i].toLowerCase();

      // Check if words are alphabetically sequential
      if (curr > prev && curr.charCodeAt(0) - prev.charCodeAt(0) === 1) {
        return true;
      }
    }

    return false;
  }

  private calculateEntropy(words: string[]): number {
    // Simplified entropy calculation
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const wordFreq = new Map<string, number>();

    words.forEach(word => {
      const normalized = word.toLowerCase();
      wordFreq.set(normalized, (wordFreq.get(normalized) || 0) + 1);
    });

    let entropy = 0;
    const total = words.length;

    wordFreq.forEach(count => {
      const probability = count / total;
      entropy -= probability * Math.log2(probability);
    });

    return entropy * words.length; // Scale by word count
  }

  private generateRecommendations(
    checks: RecoveryCheckResult['checks'],
    riskLevel: 'low' | 'medium' | 'high'
  ): string[] {
    const recommendations: string[] = [];

    const failedChecks = checks.filter(c => !c.passed);

    if (failedChecks.length > 0) {
      recommendations.push('Address the following security concerns:');
      failedChecks.forEach(check => {
        if (check.recommendation) {
          recommendations.push(`- ${check.recommendation}`);
        }
      });
    }

    if (riskLevel === 'high') {
      recommendations.push('Consider generating a new recovery phrase');
      recommendations.push('Transfer funds to a new wallet if current phrase is compromised');
    }

    recommendations.push('Never share your recovery phrase with anyone');
    recommendations.push('Store recovery phrase in a secure physical location');
    recommendations.push('Use a hardware wallet for additional security');

    return recommendations;
  }
}

// Singleton instance
export const recoveryChecker = new RecoveryChecker();

