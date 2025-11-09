/**
 * Smart Contract Interaction Analyzer
 * Advanced analysis of contract bytecode, interactions, and security patterns
 */

export interface ContractMetadata {
  address: string;
  bytecode: string;
  creationCode?: string;
  deployedAt: number;
  compiler?: string;
  verified: boolean;
  sourcecode?: string;
}

export interface FunctionSignature {
  selector: string; // 4-byte function selector
  name: string;
  inputs: { name: string; type: string }[];
  outputs: { name: string; type: string }[];
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
}

export interface ContractInteraction {
  txHash: string;
  timestamp: number;
  from: string;
  to: string;
  value: number;
  gasUsed: number;
  gasPrice: number;
  functionSelector: string;
  functionName?: string;
  decodedInput?: any;
  success: boolean;
}

export interface SecurityAnalysis {
  riskScore: number; // 0-100
  vulnerabilities: Vulnerability[];
  patterns: SecurityPattern[];
  gasEfficiency: number; // 0-100
  codeQuality: number; // 0-100
  recommendations: string[];
}

export interface Vulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  remediation: string;
}

export interface SecurityPattern {
  pattern: string;
  present: boolean;
  description: string;
  importance: 'critical' | 'recommended' | 'optional';
}

export interface InteractionPattern {
  frequency: number;
  gasAverage: number;
  successRate: number;
  uniqueCallers: number;
  peakTimes: number[];
  suspiciousActivity: boolean;
}

export class SmartContractAnalyzer {
  /**
   * Analyze bytecode for security vulnerabilities
   */
  analyzeBytecode(bytecode: string): SecurityAnalysis {
    const vulnerabilities: Vulnerability[] = [];
    const patterns: SecurityPattern[] = [];
    let riskScore = 0;

    // Remove 0x prefix if present
    const code = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;

    // Check for reentrancy guard
    const hasReentrancyGuard = this.detectReentrancyGuard(code);
    patterns.push({
      pattern: 'Reentrancy Guard',
      present: hasReentrancyGuard,
      description: 'Protects against reentrancy attacks',
      importance: 'critical',
    });

    if (!hasReentrancyGuard) {
      vulnerabilities.push({
        type: 'Reentrancy',
        severity: 'critical',
        description: 'Contract may be vulnerable to reentrancy attacks',
        remediation: 'Implement reentrancy guard or checks-effects-interactions pattern',
      });
      riskScore += 30;
    }

    // Check for unchecked call returns
    const hasUncheckedCalls = this.detectUncheckedCalls(code);
    if (hasUncheckedCalls) {
      vulnerabilities.push({
        type: 'Unchecked Call Return',
        severity: 'high',
        description: 'External calls without checking return values',
        remediation: 'Always check return values of external calls',
      });
      riskScore += 20;
    }

    // Check for integer overflow/underflow protection
    const hasSafeMath = this.detectSafeMath(code);
    patterns.push({
      pattern: 'SafeMath',
      present: hasSafeMath,
      description: 'Protects against integer overflow/underflow',
      importance: 'recommended',
    });

    if (!hasSafeMath) {
      vulnerabilities.push({
        type: 'Integer Overflow',
        severity: 'medium',
        description: 'Missing overflow/underflow protection',
        remediation: 'Use SafeMath library or Solidity 0.8+',
      });
      riskScore += 15;
    }

    // Check for access control
    const hasAccessControl = this.detectAccessControl(code);
    patterns.push({
      pattern: 'Access Control',
      present: hasAccessControl,
      description: 'Role-based access control mechanisms',
      importance: 'critical',
    });

    if (!hasAccessControl) {
      vulnerabilities.push({
        type: 'Missing Access Control',
        severity: 'high',
        description: 'No access control mechanisms detected',
        remediation: 'Implement OpenZeppelin AccessControl or similar',
      });
      riskScore += 25;
    }

    // Check for self-destruct
    const hasSelfDestruct = this.detectSelfDestruct(code);
    if (hasSelfDestruct) {
      vulnerabilities.push({
        type: 'Self Destruct',
        severity: 'critical',
        description: 'Contract contains selfdestruct functionality',
        remediation: 'Remove selfdestruct or implement strict access controls',
      });
      riskScore += 35;
    }

    // Check for delegatecall
    const hasDelegateCall = this.detectDelegateCall(code);
    if (hasDelegateCall) {
      vulnerabilities.push({
        type: 'Delegate Call',
        severity: 'high',
        description: 'Contract uses delegatecall which can be dangerous',
        remediation: 'Ensure delegatecall targets are trusted and validated',
      });
      riskScore += 20;
    }

    // Calculate gas efficiency
    const gasEfficiency = this.analyzeGasEfficiency(code);

    // Calculate code quality
    const codeQuality = this.analyzeCodeQuality(code, patterns);

    // Generate recommendations
    const recommendations = this.generateRecommendations(vulnerabilities, patterns);

    return {
      riskScore: Math.min(100, riskScore),
      vulnerabilities,
      patterns,
      gasEfficiency,
      codeQuality,
      recommendations,
    };
  }

  /**
   * Analyze interaction patterns
   */
  analyzeInteractionPatterns(interactions: ContractInteraction[]): InteractionPattern {
    if (interactions.length === 0) {
      return {
        frequency: 0,
        gasAverage: 0,
        successRate: 0,
        uniqueCallers: 0,
        peakTimes: [],
        suspiciousActivity: false,
      };
    }

    // Calculate frequency (interactions per day)
    const timeSpan = interactions[interactions.length - 1].timestamp - interactions[0].timestamp;
    const days = timeSpan / (24 * 60 * 60 * 1000);
    const frequency = interactions.length / Math.max(1, days);

    // Calculate average gas
    const gasAverage = interactions.reduce((sum, i) => sum + i.gasUsed, 0) / interactions.length;

    // Calculate success rate
    const successCount = interactions.filter(i => i.success).length;
    const successRate = (successCount / interactions.length) * 100;

    // Count unique callers
    const uniqueCallers = new Set(interactions.map(i => i.from)).size;

    // Find peak times (hour of day)
    const hourCounts: Record<number, number> = {};
    for (const interaction of interactions) {
      const hour = new Date(interaction.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    const peakTimes = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Detect suspicious activity
    const suspiciousActivity = this.detectSuspiciousActivity(interactions);

    return {
      frequency,
      gasAverage,
      successRate,
      uniqueCallers,
      peakTimes,
      suspiciousActivity,
    };
  }

  /**
   * Extract function selectors from bytecode
   */
  extractFunctionSelectors(bytecode: string): string[] {
    const code = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
    const selectors: Set<string> = new Set();

    // Look for PUSH4 opcodes (0x63) followed by function selectors
    for (let i = 0; i < code.length - 8; i += 2) {
      const opcode = code.slice(i, i + 2);
      
      if (opcode === '63') {
        // Next 4 bytes are the function selector
        const selector = '0x' + code.slice(i + 2, i + 10);
        selectors.add(selector);
      }
    }

    return Array.from(selectors);
  }

  /**
   * Decode function selector to name (requires ABI)
   */
  decodeFunctionSelector(selector: string): string {
    // Common function selectors mapping
    const commonSelectors: Record<string, string> = {
      '0x095ea7b3': 'approve(address,uint256)',
      '0xa9059cbb': 'transfer(address,uint256)',
      '0x23b872dd': 'transferFrom(address,address,uint256)',
      '0x70a08231': 'balanceOf(address)',
      '0x18160ddd': 'totalSupply()',
      '0xdd62ed3e': 'allowance(address,address)',
      '0x06fdde03': 'name()',
      '0x95d89b41': 'symbol()',
      '0x313ce567': 'decimals()',
      '0x3ccfd60b': 'withdraw()',
      '0xd0e30db0': 'deposit()',
      '0x2e1a7d4d': 'withdraw(uint256)',
      '0x40c10f19': 'mint(address,uint256)',
      '0x42966c68': 'burn(uint256)',
      '0x8da5cb5b': 'owner()',
      '0x715018a6': 'renounceOwnership()',
      '0xf2fde38b': 'transferOwnership(address)',
    };

    return commonSelectors[selector] || 'Unknown Function';
  }

  /**
   * Calculate contract complexity score
   */
  calculateComplexity(bytecode: string): {
    score: number;
    opcodeCount: number;
    jumps: number;
    loops: number;
    estimatedLines: number;
  } {
    const code = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
    
    // Count opcodes
    const opcodeCount = code.length / 2;
    
    // Count jumps (JUMP, JUMPI opcodes: 0x56, 0x57)
    let jumps = 0;
    for (let i = 0; i < code.length; i += 2) {
      const opcode = code.slice(i, i + 2);
      if (opcode === '56' || opcode === '57') {
        jumps++;
      }
    }

    // Estimate loops (JUMPI appearing multiple times to same address)
    const loops = Math.floor(jumps / 4); // Rough estimate

    // Estimate source lines (bytecode to source is ~1:3 ratio)
    const estimatedLines = Math.floor(opcodeCount / 6);

    // Calculate complexity score (0-100)
    let score = Math.min(100, (opcodeCount / 100) + (jumps / 5) + (loops * 10));

    return {
      score,
      opcodeCount,
      jumps,
      loops,
      estimatedLines,
    };
  }

  /**
   * Analyze gas usage patterns
   */
  analyzeGasPatterns(interactions: ContractInteraction[]): {
    average: number;
    median: number;
    p95: number;
    variance: number;
    outliers: ContractInteraction[];
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (interactions.length === 0) {
      return {
        average: 0,
        median: 0,
        p95: 0,
        variance: 0,
        outliers: [],
        trend: 'stable',
      };
    }

    // Sort by gas used
    const sorted = [...interactions].sort((a, b) => a.gasUsed - b.gasUsed);
    
    // Calculate average
    const average = interactions.reduce((sum, i) => sum + i.gasUsed, 0) / interactions.length;

    // Calculate median
    const median = sorted[Math.floor(sorted.length / 2)].gasUsed;

    // Calculate 95th percentile
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95 = sorted[p95Index].gasUsed;

    // Calculate variance
    const variance = interactions.reduce((sum, i) => {
      return sum + Math.pow(i.gasUsed - average, 2);
    }, 0) / interactions.length;

    // Identify outliers (more than 2 standard deviations)
    const stdDev = Math.sqrt(variance);
    const outliers = interactions.filter(i => {
      return Math.abs(i.gasUsed - average) > 2 * stdDev;
    });

    // Detect trend
    const trend = this.detectGasTrend(interactions);

    return {
      average,
      median,
      p95,
      variance,
      outliers,
      trend,
    };
  }

  /**
   * Private helper methods
   */

  private detectReentrancyGuard(code: string): boolean {
    // Look for common reentrancy guard patterns
    // Simplified: check for SSTORE operations with specific patterns
    return code.includes('5555') || code.includes('6001'); // Simplified detection
  }

  private detectUncheckedCalls(code: string): boolean {
    // Look for CALL opcodes without subsequent ISZERO checks
    // Simplified detection
    let hasUnchecked = false;
    for (let i = 0; i < code.length - 4; i += 2) {
      const opcode = code.slice(i, i + 2);
      if (opcode === 'f1') { // CALL opcode
        const next = code.slice(i + 2, i + 4);
        if (next !== '15') { // Not followed by ISZERO
          hasUnchecked = true;
        }
      }
    }
    return hasUnchecked;
  }

  private detectSafeMath(code: string): boolean {
    // Look for overflow check patterns
    return code.includes('10') && code.includes('57'); // ADD followed by JUMPI
  }

  private detectAccessControl(code: string): boolean {
    // Look for common access control patterns
    // Simplified: check for ownership patterns
    return code.includes('33') && code.includes('14'); // CALLER and EQ
  }

  private detectSelfDestruct(code: string): boolean {
    // Look for SELFDESTRUCT opcode (0xff)
    return code.includes('ff');
  }

  private detectDelegateCall(code: string): boolean {
    // Look for DELEGATECALL opcode (0xf4)
    return code.includes('f4');
  }

  private analyzeGasEfficiency(code: string): number {
    let score = 100;

    // Penalize for inefficient patterns
    const codeLength = code.length / 2;
    if (codeLength > 24000) score -= 30; // Very large contract
    else if (codeLength > 12000) score -= 15;

    // Check for repeated patterns (could be optimized)
    const uniqueRatio = new Set(code.match(/.{1,8}/g)).size / (code.length / 8);
    if (uniqueRatio < 0.5) score -= 20; // High repetition

    return Math.max(0, score);
  }

  private analyzeCodeQuality(code: string, patterns: SecurityPattern[]): number {
    let score = 50; // Base score

    // Bonus for security patterns
    const criticalPatterns = patterns.filter(p => p.importance === 'critical' && p.present);
    score += criticalPatterns.length * 15;

    const recommendedPatterns = patterns.filter(p => p.importance === 'recommended' && p.present);
    score += recommendedPatterns.length * 10;

    // Complexity penalty
    const complexity = this.calculateComplexity(code);
    if (complexity.score > 80) score -= 20;
    else if (complexity.score > 60) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(
    vulnerabilities: Vulnerability[],
    patterns: SecurityPattern[]
  ): string[] {
    const recommendations: string[] = [];

    // Critical vulnerabilities
    const critical = vulnerabilities.filter(v => v.severity === 'critical');
    if (critical.length > 0) {
      recommendations.push(`Address ${critical.length} critical vulnerabilities immediately`);
    }

    // Missing patterns
    const missingCritical = patterns.filter(p => p.importance === 'critical' && !p.present);
    if (missingCritical.length > 0) {
      recommendations.push('Implement critical security patterns: ' + missingCritical.map(p => p.pattern).join(', '));
    }

    // General recommendations
    if (vulnerabilities.length === 0) {
      recommendations.push('Contract appears secure, but conduct a professional audit');
    }

    recommendations.push('Monitor contract interactions for unusual patterns');
    recommendations.push('Consider upgradeability mechanisms for future improvements');

    return recommendations;
  }

  private detectSuspiciousActivity(interactions: ContractInteraction[]): boolean {
    // High failure rate
    const failureRate = interactions.filter(i => !i.success).length / interactions.length;
    if (failureRate > 0.3) return true;

    // Unusual gas usage patterns
    const gasUsages = interactions.map(i => i.gasUsed);
    const avgGas = gasUsages.reduce((a, b) => a + b, 0) / gasUsages.length;
    const highGasCount = gasUsages.filter(g => g > avgGas * 3).length;
    if (highGasCount > interactions.length * 0.1) return true;

    // Rapid-fire transactions from same address
    const addressCounts: Record<string, number> = {};
    for (const interaction of interactions) {
      addressCounts[interaction.from] = (addressCounts[interaction.from] || 0) + 1;
    }
    const maxFromSingle = Math.max(...Object.values(addressCounts));
    if (maxFromSingle > interactions.length * 0.5) return true;

    return false;
  }

  private detectGasTrend(interactions: ContractInteraction[]): 'increasing' | 'decreasing' | 'stable' {
    if (interactions.length < 10) return 'stable';

    // Compare first half to second half
    const midpoint = Math.floor(interactions.length / 2);
    const firstHalf = interactions.slice(0, midpoint);
    const secondHalf = interactions.slice(midpoint);

    const avgFirst = firstHalf.reduce((sum, i) => sum + i.gasUsed, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, i) => sum + i.gasUsed, 0) / secondHalf.length;

    const change = (avgSecond - avgFirst) / avgFirst;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }
}

