/**
 * Smart Contract Security Scanner Utility
 * Deep security analysis of smart contracts
 */

export interface SecurityScanResult {
  contractAddress: string;
  chainId: number;
  contractName?: string;
  scanDate: number;
  overallScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  issues: SecurityIssue[];
  recommendations: string[];
  verified: boolean;
  sourceCode?: string;
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'access_control' | 'reentrancy' | 'overflow' | 'logic_error' | 'gas_optimization' | 'other';
  title: string;
  description: string;
  location?: string; // File and line number
  recommendation: string;
}

export class SmartContractSecurityScanner {
  /**
   * Scan contract
   */
  async scanContract(
    contractAddress: string,
    chainId: number,
    sourceCode?: string
  ): Promise<SecurityScanResult> {
    const issues: SecurityIssue[] = [];
    let overallScore = 100;

    // Check if contract is verified
    const verified = !!sourceCode;

    if (!verified) {
      issues.push({
        severity: 'high',
        category: 'other',
        title: 'Unverified Contract',
        description: 'Contract source code is not verified on block explorer',
        recommendation: 'Avoid interacting with unverified contracts or request verification',
      });
      overallScore -= 20;
    }

    if (sourceCode) {
      // Check for common vulnerabilities
      const reentrancyIssues = this.checkReentrancy(sourceCode);
      issues.push(...reentrancyIssues);
      overallScore -= reentrancyIssues.length * 15;

      const accessControlIssues = this.checkAccessControl(sourceCode);
      issues.push(...accessControlIssues);
      overallScore -= accessControlIssues.length * 10;

      const overflowIssues = this.checkOverflow(sourceCode);
      issues.push(...overflowIssues);
      overallScore -= overflowIssues.length * 5;

      const logicIssues = this.checkLogicErrors(sourceCode);
      issues.push(...logicIssues);
      overallScore -= logicIssues.length * 10;

      const gasIssues = this.checkGasOptimization(sourceCode);
      issues.push(...gasIssues);
      overallScore -= gasIssues.length * 2;
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;

    if (criticalCount > 0 || overallScore < 40) {
      riskLevel = 'critical';
    } else if (highCount > 2 || overallScore < 60) {
      riskLevel = 'high';
    } else if (issues.length > 3 || overallScore < 80) {
      riskLevel = 'medium';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues);

    return {
      contractAddress,
      chainId,
      scanDate: Date.now(),
      overallScore: Math.max(0, Math.min(100, overallScore)),
      riskLevel,
      issues,
      recommendations,
      verified,
      sourceCode,
    };
  }

  /**
   * Check for reentrancy vulnerabilities
   */
  private checkReentrancy(sourceCode: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for external calls before state changes
    if (sourceCode.includes('call(') || sourceCode.includes('send(') || sourceCode.includes('transfer(')) {
      // Simplified check - would need more sophisticated analysis
      if (!sourceCode.includes('ReentrancyGuard') && !sourceCode.includes('nonReentrant')) {
        issues.push({
          severity: 'high',
          category: 'reentrancy',
          title: 'Potential Reentrancy Vulnerability',
          description: 'Contract makes external calls without reentrancy protection',
          recommendation: 'Use ReentrancyGuard or checks-effects-interactions pattern',
        });
      }
    }

    return issues;
  }

  /**
   * Check access control
   */
  private checkAccessControl(sourceCode: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for owner-only functions
    const publicFunctions = (sourceCode.match(/function\s+\w+\s*\([^)]*\)\s*public/g) || []).length;
    const onlyOwnerFunctions = (sourceCode.match(/onlyOwner/g) || []).length;

    if (publicFunctions > onlyOwnerFunctions * 2) {
      issues.push({
        severity: 'medium',
        category: 'access_control',
        title: 'Weak Access Control',
        description: 'Many public functions without proper access control',
        recommendation: 'Implement proper access control modifiers for sensitive functions',
      });
    }

    return issues;
  }

  /**
   * Check for overflow issues
   */
  private checkOverflow(sourceCode: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check if using SafeMath or Solidity 0.8+
    if (sourceCode.includes('pragma solidity') && !sourceCode.includes('^0.8')) {
      if (!sourceCode.includes('SafeMath') && !sourceCode.includes('using SafeMath')) {
        issues.push({
          severity: 'medium',
          category: 'overflow',
          title: 'Potential Integer Overflow',
          description: 'Contract may be vulnerable to integer overflow',
          recommendation: 'Use SafeMath library or upgrade to Solidity 0.8+',
        });
      }
    }

    return issues;
  }

  /**
   * Check for logic errors
   */
  private checkLogicErrors(sourceCode: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for common patterns that might indicate logic errors
    if (sourceCode.includes('== true') || sourceCode.includes('== false')) {
      issues.push({
        severity: 'low',
        category: 'logic_error',
        title: 'Redundant Boolean Comparison',
        description: 'Unnecessary boolean comparison detected',
        recommendation: 'Simplify boolean expressions',
      });
    }

    return issues;
  }

  /**
   * Check gas optimization
   */
  private checkGasOptimization(sourceCode: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for storage reads in loops
    if (sourceCode.includes('for') && sourceCode.includes('storage')) {
      issues.push({
        severity: 'low',
        category: 'gas_optimization',
        title: 'Potential Gas Optimization',
        description: 'Storage reads in loops can be optimized',
        recommendation: 'Cache storage variables before loops',
      });
    }

    return issues;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(issues: SecurityIssue[]): string[] {
    const recommendations: string[] = [];
    const categories = new Set(issues.map(i => i.category));

    if (categories.has('reentrancy')) {
      recommendations.push('Implement reentrancy guards for all external calls');
    }

    if (categories.has('access_control')) {
      recommendations.push('Review and strengthen access control mechanisms');
    }

    if (categories.has('overflow')) {
      recommendations.push('Use SafeMath or upgrade to Solidity 0.8+');
    }

    if (issues.some(i => i.severity === 'critical' || i.severity === 'high')) {
      recommendations.push('Conduct professional security audit before deployment');
    }

    return recommendations;
  }

  /**
   * Compare scan results
   */
  compareScans(scan1: SecurityScanResult, scan2: SecurityScanResult): {
    scoreChange: number;
    newIssues: number;
    resolvedIssues: number;
    improvement: boolean;
  } {
    const scoreChange = scan2.overallScore - scan1.overallScore;
    const newIssues = scan2.issues.length - scan1.issues.length;
    const resolvedIssues = scan1.issues.length - scan2.issues.length;
    const improvement = scoreChange > 0;

    return {
      scoreChange,
      newIssues,
      resolvedIssues,
      improvement,
    };
  }
}

// Singleton instance
export const smartContractSecurityScanner = new SmartContractSecurityScanner();
