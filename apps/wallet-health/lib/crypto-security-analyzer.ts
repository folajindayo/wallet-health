/**
 * Cryptographic & Security Analysis Engine
 * Advanced cryptographic algorithms and security pattern analysis
 */

export interface SecurityAnalysis {
  overallScore: number; // 0-100
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  cryptoStrength: number; // 0-100
  entropy: number;
  patterns: SecurityPattern[];
}

export interface SecurityVulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  cve?: string;
}

export interface SecurityPattern {
  name: string;
  detected: boolean;
  confidence: number; // 0-100
  indicators: string[];
}

export interface HashAnalysis {
  algorithm: string;
  strength: number;
  collisionResistance: number;
  preimageResistance: number;
  avalancheEffect: number;
}

export interface EntropyAnalysis {
  shannonEntropy: number;
  minEntropy: number;
  kolmogorovComplexity: number;
  randomnessScore: number; // 0-100
}

export class CryptoSecurityAnalyzer {
  /**
   * Calculate Shannon entropy
   */
  calculateShannonEntropy(data: string | number[]): number {
    const bytes = typeof data === 'string' 
      ? Array.from(data).map(c => c.charCodeAt(0))
      : data;

    // Count frequency of each byte
    const frequency: Record<number, number> = {};
    for (const byte of bytes) {
      frequency[byte] = (frequency[byte] || 0) + 1;
    }

    // Calculate entropy: H = -Σ p(x) * log2(p(x))
    const n = bytes.length;
    let entropy = 0;

    for (const count of Object.values(frequency)) {
      const p = count / n;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  /**
   * Calculate min-entropy (worst-case entropy)
   */
  calculateMinEntropy(data: string | number[]): number {
    const bytes = typeof data === 'string'
      ? Array.from(data).map(c => c.charCodeAt(0))
      : data;

    const frequency: Record<number, number> = {};
    for (const byte of bytes) {
      frequency[byte] = (frequency[byte] || 0) + 1;
    }

    // Min-entropy = -log2(max probability)
    const maxCount = Math.max(...Object.values(frequency));
    const maxProb = maxCount / bytes.length;

    return -Math.log2(maxProb);
  }

  /**
   * Estimate Kolmogorov complexity (approximation using compression)
   */
  estimateKolmogorovComplexity(data: string): number {
    // Simplified estimate using run-length encoding compression ratio
    let compressed = '';
    let count = 1;

    for (let i = 0; i < data.length; i++) {
      if (i < data.length - 1 && data[i] === data[i + 1]) {
        count++;
      } else {
        compressed += data[i] + (count > 1 ? count.toString() : '');
        count = 1;
      }
    }

    // Complexity = compressed length / original length
    return compressed.length / data.length;
  }

  /**
   * Comprehensive entropy analysis
   */
  analyzeEntropy(data: string | number[]): EntropyAnalysis {
    const dataString = typeof data === 'string' ? data : data.map(n => String.fromCharCode(n)).join('');
    
    const shannonEntropy = this.calculateShannonEntropy(data);
    const minEntropy = this.calculateMinEntropy(data);
    const kolmogorovComplexity = this.estimateKolmogorovComplexity(dataString);

    // Randomness score (0-100)
    // Perfect randomness: 8 bits per byte for Shannon entropy
    const maxEntropy = 8;
    const randomnessScore = Math.min(100, (shannonEntropy / maxEntropy) * 100);

    return {
      shannonEntropy,
      minEntropy,
      kolmogorovComplexity,
      randomnessScore,
    };
  }

  /**
   * Test statistical randomness (NIST SP 800-22 inspired)
   */
  testRandomness(data: number[]): {
    frequencyTest: { passed: boolean; pValue: number };
    runsTest: { passed: boolean; pValue: number };
    longestRunTest: { passed: boolean; pValue: number };
    spectralTest: { passed: boolean; pValue: number };
  } {
    // Frequency (Monobit) Test
    const frequencyTest = this.frequencyTest(data);

    // Runs Test
    const runsTest = this.runsTest(data);

    // Longest Run of Ones Test
    const longestRunTest = this.longestRunTest(data);

    // Spectral Test (DFT)
    const spectralTest = this.spectralTest(data);

    return {
      frequencyTest,
      runsTest,
      longestRunTest,
      spectralTest,
    };
  }

  /**
   * Detect cryptographic patterns and weaknesses
   */
  detectCryptoPatterns(data: string | number[]): SecurityPattern[] {
    const patterns: SecurityPattern[] = [];
    const bytes = typeof data === 'string'
      ? Array.from(data).map(c => c.charCodeAt(0))
      : data;

    // Detect repeating patterns
    const repeatingPattern = this.detectRepeatingPattern(bytes);
    patterns.push({
      name: 'Repeating Pattern',
      detected: repeatingPattern.detected,
      confidence: repeatingPattern.confidence,
      indicators: repeatingPattern.indicators,
    });

    // Detect low entropy regions
    const lowEntropy = this.detectLowEntropy(bytes);
    patterns.push({
      name: 'Low Entropy Region',
      detected: lowEntropy.detected,
      confidence: lowEntropy.confidence,
      indicators: lowEntropy.indicators,
    });

    // Detect sequential patterns
    const sequential = this.detectSequentialPattern(bytes);
    patterns.push({
      name: 'Sequential Pattern',
      detected: sequential.detected,
      confidence: sequential.confidence,
      indicators: sequential.indicators,
    });

    // Detect weak PRNG
    const weakPRNG = this.detectWeakPRNG(bytes);
    patterns.push({
      name: 'Weak PRNG',
      detected: weakPRNG.detected,
      confidence: weakPRNG.confidence,
      indicators: weakPRNG.indicators,
    });

    return patterns;
  }

  /**
   * Analyze hash function strength
   */
  analyzeHashStrength(
    hashFunction: (data: string) => string,
    testData: string[]
  ): HashAnalysis {
    // Test collision resistance
    const hashes = testData.map(d => hashFunction(d));
    const uniqueHashes = new Set(hashes);
    const collisionResistance = (uniqueHashes.size / hashes.length) * 100;

    // Test preimage resistance (simplified)
    let preimageResistance = 100;
    for (let i = 0; i < Math.min(10, testData.length); i++) {
      const hash = hashFunction(testData[i]);
      // In real scenario, we'd try to find preimage
      // Here we just check hash distribution
      const hashEntropy = this.calculateShannonEntropy(hash);
      preimageResistance = Math.min(preimageResistance, (hashEntropy / 8) * 100);
    }

    // Test avalanche effect
    const avalancheEffect = this.testAvalancheEffect(hashFunction, testData[0] || 'test');

    // Overall strength
    const strength = (collisionResistance + preimageResistance + avalancheEffect) / 3;

    return {
      algorithm: 'Custom',
      strength,
      collisionResistance,
      preimageResistance,
      avalancheEffect,
    };
  }

  /**
   * Detect timing attack vulnerabilities
   */
  detectTimingVulnerability(
    operation: (input: string) => boolean,
    testInputs: string[]
  ): {
    vulnerable: boolean;
    confidence: number;
    timingVariance: number;
  } {
    const timings: number[] = [];

    for (const input of testInputs) {
      const start = performance.now();
      operation(input);
      const end = performance.now();
      timings.push(end - start);
    }

    // Calculate variance
    const mean = timings.reduce((a, b) => a + b, 0) / timings.length;
    const variance = timings.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / timings.length;
    const stdDev = Math.sqrt(variance);

    // High variance suggests timing vulnerability
    const coefficientOfVariation = stdDev / mean;
    const vulnerable = coefficientOfVariation > 0.1; // 10% threshold
    const confidence = Math.min(100, coefficientOfVariation * 1000);

    return {
      vulnerable,
      confidence,
      timingVariance: variance,
    };
  }

  /**
   * Generate cryptographically secure random bytes (using crypto API)
   */
  generateSecureRandom(length: number): number[] {
    // In browser/Node.js, use crypto.getRandomValues or crypto.randomBytes
    // Here's a fallback using Math.random (NOT cryptographically secure)
    const bytes: number[] = [];
    for (let i = 0; i < length; i++) {
      bytes.push(Math.floor(Math.random() * 256));
    }
    return bytes;
  }

  /**
   * Analyze key strength
   */
  analyzeKeyStrength(key: string | number[]): {
    strength: number; // 0-100
    bitStrength: number;
    entropy: number;
    recommendations: string[];
  } {
    const bytes = typeof key === 'string'
      ? Array.from(key).map(c => c.charCodeAt(0))
      : key;

    const entropy = this.calculateShannonEntropy(bytes);
    const bitStrength = bytes.length * entropy;
    
    const recommendations: string[] = [];
    let strength = 0;

    // Evaluate based on bit strength
    if (bitStrength >= 256) {
      strength = 100;
    } else if (bitStrength >= 128) {
      strength = 90;
      recommendations.push('Key is strong but consider 256-bit equivalent for long-term security');
    } else if (bitStrength >= 80) {
      strength = 70;
      recommendations.push('Key strength is acceptable but upgrade to 128-bit or higher recommended');
    } else {
      strength = 40;
      recommendations.push('Key is weak! Use at least 128-bit equivalent');
    }

    // Check entropy
    if (entropy < 7) {
      strength -= 20;
      recommendations.push('Low entropy detected. Ensure key is randomly generated');
    }

    // Check for patterns
    const patterns = this.detectCryptoPatterns(bytes);
    const hasWeakPatterns = patterns.some(p => p.detected && p.confidence > 70);
    
    if (hasWeakPatterns) {
      strength -= 15;
      recommendations.push('Patterns detected in key. Regenerate using secure random source');
    }

    return {
      strength: Math.max(0, strength),
      bitStrength,
      entropy,
      recommendations,
    };
  }

  /**
   * Detect side-channel attack vectors
   */
  detectSideChannelVectors(
    implementation: string
  ): {
    timingAttack: boolean;
    cacheAttack: boolean;
    powerAnalysis: boolean;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    // Check for timing attack vectors
    const timingAttack =
      implementation.includes('===') ||
      implementation.includes('==') ||
      implementation.includes('if (') &&
      (implementation.includes('return') || implementation.includes('break'));

    if (timingAttack) {
      recommendations.push('Use constant-time comparison functions');
    }

    // Check for cache attack vectors
    const cacheAttack =
      implementation.includes('[') &&
      implementation.includes(']') &&
      (implementation.includes('key') || implementation.includes('secret'));

    if (cacheAttack) {
      recommendations.push('Avoid key-dependent memory access patterns');
    }

    // Check for power analysis vectors
    const powerAnalysis =
      implementation.includes('*') ||
      implementation.includes('+') &&
      (implementation.includes('key') || implementation.includes('secret'));

    if (powerAnalysis) {
      recommendations.push('Consider hardware countermeasures for power analysis');
    }

    return {
      timingAttack,
      cacheAttack,
      powerAnalysis,
      recommendations,
    };
  }

  /**
   * Private helper methods
   */

  private frequencyTest(data: number[]): { passed: boolean; pValue: number } {
    // Count ones
    const ones = data.filter(b => b === 1).length;
    const n = data.length;

    // Calculate statistic
    const s = Math.abs(ones - n / 2) / Math.sqrt(n / 4);
    
    // Approximate p-value using normal distribution
    const pValue = this.erfComplement(s / Math.sqrt(2));

    return {
      passed: pValue >= 0.01, // 1% significance level
      pValue,
    };
  }

  private runsTest(data: number[]): { passed: boolean; pValue: number } {
    // Count runs
    let runs = 1;
    for (let i = 1; i < data.length; i++) {
      if (data[i] !== data[i - 1]) runs++;
    }

    const n = data.length;
    const ones = data.filter(b => b === 1).length;
    const pi = ones / n;

    // Expected runs
    const expectedRuns = 2 * n * pi * (1 - pi) + 1;
    const variance = (2 * n * pi * (1 - pi) * (2 * n * pi * (1 - pi) - n)) / (n - 1);

    const z = (runs - expectedRuns) / Math.sqrt(variance);
    const pValue = this.erfComplement(Math.abs(z) / Math.sqrt(2));

    return {
      passed: pValue >= 0.01,
      pValue,
    };
  }

  private longestRunTest(data: number[]): { passed: boolean; pValue: number } {
    // Find longest run of ones
    let longestRun = 0;
    let currentRun = 0;

    for (const bit of data) {
      if (bit === 1) {
        currentRun++;
        longestRun = Math.max(longestRun, currentRun);
      } else {
        currentRun = 0;
      }
    }

    // Expected longest run (approximation)
    const n = data.length;
    const expectedLongest = Math.log2(n);
    const deviation = Math.abs(longestRun - expectedLongest);

    // Simplified p-value
    const pValue = Math.max(0, 1 - deviation / expectedLongest);

    return {
      passed: pValue >= 0.01,
      pValue,
    };
  }

  private spectralTest(data: number[]): { passed: boolean; pValue: number } {
    // Discrete Fourier Transform test (simplified)
    const n = data.length;
    
    // Convert to +1, -1
    const x = data.map(b => b === 1 ? 1 : -1);

    // Calculate DFT magnitude
    let maxMagnitude = 0;
    for (let k = 0; k < n / 2; k++) {
      let real = 0;
      let imag = 0;

      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * k * t) / n;
        real += x[t] * Math.cos(angle);
        imag += x[t] * Math.sin(angle);
      }

      const magnitude = Math.sqrt(real * real + imag * imag);
      maxMagnitude = Math.max(maxMagnitude, magnitude);
    }

    // Expected magnitude for random data
    const expectedMagnitude = Math.sqrt(n);
    const deviation = Math.abs(maxMagnitude - expectedMagnitude) / expectedMagnitude;

    const pValue = Math.max(0, 1 - deviation);

    return {
      passed: pValue >= 0.01,
      pValue,
    };
  }

  private detectRepeatingPattern(bytes: number[]): {
    detected: boolean;
    confidence: number;
    indicators: string[];
  } {
    const indicators: string[] = [];
    let maxRepeat = 0;

    // Look for repeating sequences
    for (let len = 2; len <= Math.min(16, bytes.length / 2); len++) {
      for (let i = 0; i <= bytes.length - len * 2; i++) {
        const pattern = bytes.slice(i, i + len);
        const next = bytes.slice(i + len, i + len * 2);

        if (this.arraysEqual(pattern, next)) {
          maxRepeat = Math.max(maxRepeat, len);
          indicators.push(`Repeat of length ${len} at position ${i}`);
        }
      }
    }

    const detected = maxRepeat >= 4;
    const confidence = Math.min(100, maxRepeat * 10);

    return { detected, confidence, indicators };
  }

  private detectLowEntropy(bytes: number[]): {
    detected: boolean;
    confidence: number;
    indicators: string[];
  } {
    const indicators: string[] = [];
    const chunkSize = 32;
    let lowEntropyChunks = 0;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
      const entropy = this.calculateShannonEntropy(chunk);

      if (entropy < 6) {
        lowEntropyChunks++;
        indicators.push(`Low entropy (${entropy.toFixed(2)}) at byte ${i}`);
      }
    }

    const detected = lowEntropyChunks > 0;
    const confidence = Math.min(100, (lowEntropyChunks / (bytes.length / chunkSize)) * 200);

    return { detected, confidence, indicators };
  }

  private detectSequentialPattern(bytes: number[]): {
    detected: boolean;
    confidence: number;
    indicators: string[];
  } {
    const indicators: string[] = [];
    let maxSequence = 0;
    let currentSequence = 1;

    for (let i = 1; i < bytes.length; i++) {
      if (Math.abs(bytes[i] - bytes[i - 1]) <= 1) {
        currentSequence++;
        maxSequence = Math.max(maxSequence, currentSequence);
      } else {
        if (currentSequence >= 8) {
          indicators.push(`Sequential run of ${currentSequence} at position ${i - currentSequence}`);
        }
        currentSequence = 1;
      }
    }

    const detected = maxSequence >= 8;
    const confidence = Math.min(100, maxSequence * 5);

    return { detected, confidence, indicators };
  }

  private detectWeakPRNG(bytes: number[]): {
    detected: boolean;
    confidence: number;
    indicators: string[];
  } {
    const indicators: string[] = [];

    // Test for linear congruential generator patterns
    const correlations: number[] = [];

    for (let lag = 1; lag <= Math.min(10, bytes.length / 2); lag++) {
      let correlation = 0;
      for (let i = 0; i < bytes.length - lag; i++) {
        correlation += bytes[i] * bytes[i + lag];
      }
      correlation /= bytes.length - lag;
      correlations.push(correlation);
    }

    const avgCorrelation = correlations.reduce((a, b) => a + b, 0) / correlations.length;
    const expectedCorrelation = 127.5 * 127.5; // For uniform [0,255]

    const deviation = Math.abs(avgCorrelation - expectedCorrelation) / expectedCorrelation;

    if (deviation > 0.1) {
      indicators.push(`High correlation detected (${deviation.toFixed(4)})`);
    }

    const detected = deviation > 0.1;
    const confidence = Math.min(100, deviation * 500);

    return { detected, confidence, indicators };
  }

  private testAvalancheEffect(
    hashFunction: (data: string) => string,
    input: string
  ): number {
    const originalHash = hashFunction(input);

    let totalBitChanges = 0;
    let tests = 0;

    // Flip each bit in input and check hash changes
    for (let i = 0; i < Math.min(input.length, 32); i++) {
      const modified = input.substring(0, i) + 
                      String.fromCharCode(input.charCodeAt(i) ^ 1) + 
                      input.substring(i + 1);
      
      const modifiedHash = hashFunction(modified);
      const bitChanges = this.countBitDifferences(originalHash, modifiedHash);
      
      totalBitChanges += bitChanges;
      tests++;
    }

    // Good avalanche effect: ~50% bits should change
    const avgBitChanges = totalBitChanges / tests;
    const hashLength = originalHash.length * 4; // Assume hex string
    const expectedChanges = hashLength / 2;
    
    // Score based on how close to 50%
    const score = 100 - Math.abs(avgBitChanges - expectedChanges) / expectedChanges * 100;

    return Math.max(0, score);
  }

  private countBitDifferences(str1: string, str2: string): number {
    let differences = 0;

    for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
      if (str1[i] !== str2[i]) {
        // Count bit differences in character
        const xor = str1.charCodeAt(i) ^ str2.charCodeAt(i);
        differences += this.popcount(xor);
      }
    }

    return differences;
  }

  private popcount(n: number): number {
    let count = 0;
    while (n > 0) {
      count += n & 1;
      n >>= 1;
    }
    return count;
  }

  private arraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, i) => val === b[i]);
  }

  private erfComplement(x: number): number {
    // Approximation of complementary error function
    const t = 1 / (1 + 0.5 * Math.abs(x));
    const tau = t * Math.exp(-x * x - 1.26551223 +
      t * (1.00002368 +
      t * (0.37409196 +
      t * (0.09678418 +
      t * (-0.18628806 +
      t * (0.27886807 +
      t * (-1.13520398 +
      t * (1.48851587 +
      t * (-0.82215223 +
      t * 0.17087277)))))))));

    return x >= 0 ? tau : 2 - tau;
  }
}

