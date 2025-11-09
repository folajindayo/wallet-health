/**
 * Smart Contract Deployer Helper Utility
 * Helps deploy contracts safely with verification
 */

export interface DeploymentConfig {
  contractName: string;
  constructorArgs?: any[];
  chainId: number;
  gasLimit?: number;
  gasPrice?: number;
  value?: string; // For payable constructors
  verifyContract: boolean;
  waitForConfirmation: boolean;
  optimizationEnabled?: boolean;
  optimizationRuns?: number;
}

export interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  deploymentCost: number; // USD
  verified: boolean;
  verificationTxHash?: string;
  deployedAt: number;
  explorerUrl?: string;
}

export interface DeploymentChecklist {
  contractCodeReviewed: boolean;
  testsPassed: boolean;
  auditCompleted: boolean;
  gasOptimized: boolean;
  constructorArgsValidated: boolean;
  networkSelected: boolean;
  sufficientBalance: boolean;
  verificationReady: boolean;
  risksAcknowledged: boolean;
}

export interface DeploymentRisk {
  type: 'high_gas' | 'unverified' | 'testnet_only' | 'no_audit' | 'upgradeable';
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

export class SmartContractDeployerHelper {
  /**
   * Validate deployment config
   */
  validateConfig(config: DeploymentConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.contractName) {
      errors.push('Contract name is required');
    }

    if (!config.chainId) {
      errors.push('Chain ID is required');
    }

    // Check if testnet
    const isTestnet = [5, 11155111, 97, 80001].includes(config.chainId); // Goerli, Sepolia, BSC Testnet, Mumbai
    if (!isTestnet && !config.verifyContract) {
      warnings.push('Contract verification is recommended for mainnet deployments');
    }

    if (config.gasLimit && config.gasLimit > 8000000) {
      warnings.push('Very high gas limit. Verify contract complexity.');
    }

    if (config.gasLimit && config.gasLimit < 100000) {
      warnings.push('Low gas limit. May be insufficient for contract deployment.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate deployment checklist
   */
  generateChecklist(config: DeploymentConfig): DeploymentChecklist {
    // In production, would check actual state
    return {
      contractCodeReviewed: false,
      testsPassed: false,
      auditCompleted: false,
      gasOptimized: config.optimizationEnabled || false,
      constructorArgsValidated: config.constructorArgs !== undefined,
      networkSelected: config.chainId > 0,
      sufficientBalance: true, // Would check actual balance
      verificationReady: config.verifyContract,
      risksAcknowledged: false,
    };
  }

  /**
   * Analyze deployment risks
   */
  analyzeRisks(config: DeploymentConfig): DeploymentRisk[] {
    const risks: DeploymentRisk[] = [];

    // High gas risk
    if (config.gasLimit && config.gasLimit > 5000000) {
      risks.push({
        type: 'high_gas',
        severity: 'medium',
        description: 'High gas limit indicates complex contract',
        recommendation: 'Review contract code for optimization opportunities',
      });
    }

    // Unverified contract risk
    if (!config.verifyContract) {
      risks.push({
        type: 'unverified',
        severity: 'high',
        description: 'Contract will not be verified on block explorer',
        recommendation: 'Enable contract verification for transparency',
      });
    }

    // Testnet only risk
    const isTestnet = [5, 11155111, 97, 80001].includes(config.chainId);
    if (isTestnet) {
      risks.push({
        type: 'testnet_only',
        severity: 'low',
        description: 'Deploying to testnet',
        recommendation: 'Test thoroughly before mainnet deployment',
      });
    }

    // No audit risk (would check if audit exists)
    risks.push({
      type: 'no_audit',
      severity: 'high',
      description: 'Contract has not been audited',
      recommendation: 'Consider professional audit before mainnet deployment',
    });

    return risks;
  }

  /**
   * Estimate deployment cost
   */
  estimateDeploymentCost(config: DeploymentConfig): {
    gasEstimate: number;
    gasCost: number; // in native token
    gasCostUSD: number;
  } {
    // Estimate gas (simplified)
    const baseGas = 200000; // Base deployment gas
    const constructorGas = config.constructorArgs
      ? config.constructorArgs.length * 20000
      : 0;
    const gasEstimate = config.gasLimit || (baseGas + constructorGas);

    // Calculate cost
    const gasPrice = config.gasPrice || 30e9; // 30 gwei default
    const gasCost = (gasEstimate * gasPrice) / 1e9; // in ETH
    const gasCostUSD = gasCost * 2000; // Assume ETH = $2000

    return {
      gasEstimate,
      gasCost,
      gasCostUSD: Math.round(gasCostUSD * 100) / 100,
    };
  }

  /**
   * Generate deployment script
   */
  generateDeploymentScript(config: DeploymentConfig): string {
    const constructorArgs = config.constructorArgs || [];
    const argsString = constructorArgs.map(arg => JSON.stringify(arg)).join(', ');

    return `
// Deployment script for ${config.contractName}
const ${config.contractName} = await ethers.getContractFactory("${config.contractName}");
const ${config.contractName.toLowerCase()} = await ${config.contractName}.deploy(${argsString}${config.value ? `, { value: "${config.value}" }` : ''});
await ${config.contractName.toLowerCase()}.deployed();

console.log("${config.contractName} deployed to:", ${config.contractName.toLowerCase()}.address);

${config.verifyContract ? `
// Verify contract
await hre.run("verify:verify", {
  address: ${config.contractName.toLowerCase()}.address,
  constructorArguments: [${argsString}],
});
` : ''}
`;
  }

  /**
   * Simulate deployment
   */
  async simulateDeployment(config: DeploymentConfig): Promise<{
    willSucceed: boolean;
    estimatedGas: number;
    estimatedCost: number;
    errors: string[];
  }> {
    const validation = this.validateConfig(config);
    const costEstimate = this.estimateDeploymentCost(config);

    // In production, would use eth_estimateGas
    return {
      willSucceed: validation.valid,
      estimatedGas: costEstimate.gasEstimate,
      estimatedCost: costEstimate.gasCostUSD,
      errors: validation.errors,
    };
  }

  /**
   * Get deployment recommendations
   */
  getRecommendations(config: DeploymentConfig): string[] {
    const recommendations: string[] = [];
    const risks = this.analyzeRisks(config);
    const checklist = this.generateChecklist(config);

    if (!checklist.contractCodeReviewed) {
      recommendations.push('Review contract code thoroughly before deployment');
    }

    if (!checklist.testsPassed) {
      recommendations.push('Run comprehensive tests before deployment');
    }

    if (!checklist.auditCompleted && !isTestnet(config.chainId)) {
      recommendations.push('Consider professional audit for mainnet deployment');
    }

    if (!config.optimizationEnabled) {
      recommendations.push('Enable compiler optimization to reduce gas costs');
    }

    if (!config.verifyContract && !isTestnet(config.chainId)) {
      recommendations.push('Enable contract verification for transparency');
    }

    const highRiskRisks = risks.filter(r => r.severity === 'high');
    if (highRiskRisks.length > 0) {
      recommendations.push(`${highRiskRisks.length} high-risk issue(s) detected. Review before deployment.`);
    }

    return recommendations;
  }
}

function isTestnet(chainId: number): boolean {
  return [5, 11155111, 97, 80001, 421611].includes(chainId);
}

// Singleton instance
export const smartContractDeployerHelper = new SmartContractDeployerHelper();

