/**
 * Smart Contract Risk Analyzer
 * Analyzes smart contract risks before interaction to help users make informed decisions
 */

export interface ContractRisk {
  contractAddress: string;
  chainId: number;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    isVerified: boolean;
    age: number; // days since deployment
    transactionCount: number;
    uniqueUsers: number;
    totalValueLocked?: number;
    hasKnownVulnerabilities: boolean;
    auditStatus: 'audited' | 'unaudited' | 'self-audited' | 'unknown';
    sourceCodeAvailable: boolean;
    proxyContract: boolean;
    upgradeable: boolean;
    centralizationRisks: string[];
  };
  warnings: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
  }>;
  recommendations: string[];
  metadata: {
    contractName?: string;
    compilerVersion?: string;
    optimizationEnabled?: boolean;
    license?: string;
    verifiedAt?: number;
    deployedAt?: number;
  };
}

export interface ContractInteractionRisk {
  contractAddress: string;
  method: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
  gasEstimate?: number;
  potentialIssues: string[];
}

export class SmartContractRiskAnalyzer {
  private knownVulnerableContracts: Set<string> = new Set();
  private knownSafeContracts: Set<string> = new Set();
  private contractCache: Map<string, ContractRisk> = new Map();

  /**
   * Analyze contract risk
   */
  async analyzeContract(params: {
    contractAddress: string;
    chainId: number;
    contractData?: {
      isVerified?: boolean;
      deployedAt?: number;
      transactionCount?: number;
      uniqueUsers?: number;
      totalValueLocked?: number;
      sourceCode?: string;
      abi?: any[];
      metadata?: Record<string, any>;
    };
  }): Promise<ContractRisk> {
    const { contractAddress, chainId, contractData = {} } = params;
    const cacheKey = `${chainId}-${contractAddress.toLowerCase()}`;

    // Check cache
    if (this.contractCache.has(cacheKey)) {
      return this.contractCache.get(cacheKey)!;
    }

    const factors = {
      isVerified: contractData.isVerified || false,
      age: contractData.deployedAt
        ? Math.floor((Date.now() - contractData.deployedAt) / (1000 * 60 * 60 * 24))
        : 0,
      transactionCount: contractData.transactionCount || 0,
      uniqueUsers: contractData.uniqueUsers || 0,
      totalValueLocked: contractData.totalValueLocked,
      hasKnownVulnerabilities: this.knownVulnerableContracts.has(contractAddress.toLowerCase()),
      auditStatus: this.determineAuditStatus(contractData),
      sourceCodeAvailable: !!contractData.sourceCode,
      proxyContract: this.detectProxyContract(contractData),
      upgradeable: this.detectUpgradeable(contractData),
      centralizationRisks: this.detectCentralizationRisks(contractData),
    };

    // Calculate risk score
    const riskScore = this.calculateRiskScore(factors);

    // Generate warnings
    const warnings = this.generateWarnings(factors, contractData);

    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, warnings, riskScore);

    const risk: ContractRisk = {
      contractAddress,
      chainId,
      riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      factors,
      warnings,
      recommendations,
      metadata: {
        contractName: contractData.metadata?.contractName,
        compilerVersion: contractData.metadata?.compilerVersion,
        optimizationEnabled: contractData.metadata?.optimizationEnabled,
        license: contractData.metadata?.license,
        verifiedAt: contractData.metadata?.verifiedAt,
        deployedAt: contractData.deployedAt,
      },
    };

    // Cache result
    this.contractCache.set(cacheKey, risk);

    return risk;
  }

  /**
   * Analyze specific contract interaction risk
   */
  analyzeInteraction(params: {
    contractAddress: string;
    method: string;
    parameters?: Record<string, any>;
    value?: string;
    gasEstimate?: number;
    contractRisk?: ContractRisk;
  }): ContractInteractionRisk {
    const { contractAddress, method, parameters = {}, value, gasEstimate, contractRisk } = params;

    const warnings: string[] = [];
    const potentialIssues: string[] = [];

    // Check for dangerous methods
    const dangerousMethods = ['transfer', 'transferFrom', 'approve', 'burn', 'mint'];
    if (dangerousMethods.includes(method.toLowerCase())) {
      warnings.push(`Method "${method}" can modify token balances`);
    }

    // Check for value transfers
    if (value && BigInt(value) > 0n) {
      warnings.push('This interaction involves transferring value');
      potentialIssues.push('Ensure recipient address is correct');
    }

    // Check gas estimate
    if (gasEstimate && gasEstimate > 500000) {
      warnings.push('High gas estimate - contract may perform complex operations');
    }

    // Use contract risk if available
    let riskScore = 50; // Default medium risk
    if (contractRisk) {
      riskScore = contractRisk.riskScore;
      if (contractRisk.factors.hasKnownVulnerabilities) {
        warnings.push('Contract has known vulnerabilities');
        potentialIssues.push('Consider avoiding interaction with this contract');
      }
      if (!contractRisk.factors.isVerified) {
        warnings.push('Contract source code is not verified');
        potentialIssues.push('Unverified contracts pose higher risk');
      }
    }

    // Method-specific checks
    if (method.toLowerCase() === 'approve') {
      const spender = parameters.spender || parameters.to;
      if (spender) {
        potentialIssues.push(`Approving ${spender.substring(0, 10)}... - verify this address`);
      }
      const amount = parameters.amount || parameters.value;
      if (amount && BigInt(amount) === BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')) {
        warnings.push('Unlimited approval detected');
        potentialIssues.push('Consider using a specific amount instead of unlimited');
      }
    }

    return {
      contractAddress,
      method,
      riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      warnings,
      gasEstimate,
      potentialIssues,
    };
  }

  /**
   * Determine audit status
   */
  private determineAuditStatus(contractData: any): ContractRisk['factors']['auditStatus'] {
    // In production, this would check audit databases
    if (contractData.metadata?.audited) {
      return 'audited';
    }
    if (contractData.metadata?.selfAudited) {
      return 'self-audited';
    }
    return 'unknown';
  }

  /**
   * Detect if contract is a proxy
   */
  private detectProxyContract(contractData: any): boolean {
    if (!contractData.sourceCode) return false;
    // Check for common proxy patterns
    const proxyPatterns = ['Proxy', 'UpgradeableProxy', 'TransparentUpgradeableProxy'];
    return proxyPatterns.some((pattern) =>
      contractData.sourceCode.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Detect if contract is upgradeable
   */
  private detectUpgradeable(contractData: any): boolean {
    if (!contractData.sourceCode) return false;
    // Check for upgrade patterns
    const upgradePatterns = ['upgrade', 'initialize', 'upgradeTo'];
    return upgradePatterns.some((pattern) =>
      contractData.sourceCode.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Detect centralization risks
   */
  private detectCentralizationRisks(contractData: any): string[] {
    const risks: string[] = [];

    if (contractData.metadata?.owner) {
      risks.push('Contract has a single owner address');
    }

    if (contractData.metadata?.admin) {
      risks.push('Contract has admin privileges');
    }

    if (this.detectUpgradeable(contractData)) {
      risks.push('Contract is upgradeable - code can change');
    }

    if (contractData.metadata?.pausable) {
      risks.push('Contract can be paused by owner');
    }

    return risks;
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(factors: ContractRisk['factors']): number {
    let score = 0;

    // Base score
    score += 50;

    // Verification status
    if (!factors.isVerified) score += 20;
    if (!factors.sourceCodeAvailable) score += 15;

    // Age
    if (factors.age < 30) score += 15; // New contracts are riskier
    if (factors.age < 7) score += 10; // Very new contracts

    // Usage
    if (factors.transactionCount < 100) score += 10;
    if (factors.transactionCount === 0) score += 20;

    // Users
    if (factors.uniqueUsers < 10) score += 10;
    if (factors.uniqueUsers === 0) score += 15;

    // Vulnerabilities
    if (factors.hasKnownVulnerabilities) score += 30;

    // Audit status
    if (factors.auditStatus === 'unaudited') score += 15;
    if (factors.auditStatus === 'unknown') score += 10;

    // Proxy/Upgradeable
    if (factors.proxyContract) score += 5;
    if (factors.upgradeable) score += 10;

    // Centralization
    score += factors.centralizationRisks.length * 5;

    // Positive factors
    if (factors.isVerified && factors.sourceCodeAvailable) score -= 10;
    if (factors.transactionCount > 10000) score -= 10;
    if (factors.uniqueUsers > 1000) score -= 10;
    if (factors.auditStatus === 'audited') score -= 15;
    if (factors.age > 365) score -= 5; // Old contracts are generally safer

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get risk level from score
   */
  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  /**
   * Generate warnings
   */
  private generateWarnings(factors: ContractRisk['factors'], contractData: any): ContractRisk['warnings'] {
    const warnings: ContractRisk['warnings'] = [];

    if (!factors.isVerified) {
      warnings.push({
        type: 'verification',
        severity: 'high',
        message: 'Contract source code is not verified',
      });
    }

    if (factors.age < 7) {
      warnings.push({
        type: 'age',
        severity: 'medium',
        message: `Contract is very new (${factors.age} days old)`,
      });
    }

    if (factors.transactionCount === 0) {
      warnings.push({
        type: 'usage',
        severity: 'high',
        message: 'Contract has no transaction history',
      });
    }

    if (factors.hasKnownVulnerabilities) {
      warnings.push({
        type: 'vulnerability',
        severity: 'critical',
        message: 'Contract has known vulnerabilities',
      });
    }

    if (factors.auditStatus === 'unaudited' || factors.auditStatus === 'unknown') {
      warnings.push({
        type: 'audit',
        severity: 'medium',
        message: 'Contract audit status is unknown',
      });
    }

    if (factors.upgradeable) {
      warnings.push({
        type: 'upgradeable',
        severity: 'medium',
        message: 'Contract is upgradeable - code can change',
      });
    }

    if (factors.centralizationRisks.length > 0) {
      warnings.push({
        type: 'centralization',
        severity: 'medium',
        message: `Centralization risks detected: ${factors.centralizationRisks.join(', ')}`,
      });
    }

    return warnings;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    factors: ContractRisk['factors'],
    warnings: ContractRisk['warnings'],
    riskScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (riskScore >= 70) {
      recommendations.push('Avoid interacting with this contract if possible');
      recommendations.push('Consider using alternative verified contracts');
    }

    if (!factors.isVerified) {
      recommendations.push('Wait for contract verification before interacting');
      recommendations.push('Review contract source code if available');
    }

    if (factors.age < 30) {
      recommendations.push('Monitor contract activity before large interactions');
      recommendations.push('Start with small test transactions');
    }

    if (factors.hasKnownVulnerabilities) {
      recommendations.push('Do not interact with this contract');
      recommendations.push('Report vulnerabilities to contract owner');
    }

    if (factors.upgradeable) {
      recommendations.push('Be aware that contract code may change');
      recommendations.push('Monitor for upgrade announcements');
    }

    if (factors.centralizationRisks.length > 0) {
      recommendations.push('Understand centralization risks before interacting');
      recommendations.push('Consider decentralized alternatives if available');
    }

    if (recommendations.length === 0) {
      recommendations.push('Contract appears safe, but always verify addresses');
      recommendations.push('Start with small amounts for first interaction');
    }

    return recommendations;
  }

  /**
   * Mark contract as vulnerable
   */
  markVulnerable(contractAddress: string): void {
    this.knownVulnerableContracts.add(contractAddress.toLowerCase());
    // Clear cache
    this.contractCache.clear();
  }

  /**
   * Mark contract as safe
   */
  markSafe(contractAddress: string): void {
    this.knownSafeContracts.add(contractAddress.toLowerCase());
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.contractCache.clear();
  }
}

// Singleton instance
export const smartContractRiskAnalyzer = new SmartContractRiskAnalyzer();

