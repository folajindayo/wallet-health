/**
 * Token Approval Simulator Utility
 * Simulate approval changes before executing them
 */

export interface ApprovalSimulation {
  tokenAddress: string;
  tokenSymbol: string;
  spenderAddress: string;
  currentAllowance: string;
  proposedAllowance: string;
  action: 'grant' | 'revoke' | 'update';
  gasEstimate: number;
  gasCost: string; // ETH
  gasCostUSD?: number;
  impact: {
    riskChange: number; // -100 to +100
    securityImpact: 'improves' | 'neutral' | 'worsens';
    description: string;
  };
  warnings: Array<{
    severity: 'low' | 'medium' | 'high';
    message: string;
  }>;
  recommendations: string[];
}

export interface BatchApprovalSimulation {
  simulations: ApprovalSimulation[];
  totalGasEstimate: number;
  totalGasCost: string; // ETH
  totalGasCostUSD?: number;
  overallImpact: {
    riskChange: number;
    securityImpact: 'improves' | 'neutral' | 'worsens';
    approvalsToRevoke: number;
    approvalsToGrant: number;
    approvalsToUpdate: number;
  };
  recommendations: string[];
}

export class TokenApprovalSimulator {
  /**
   * Simulate single approval change
   */
  simulateApproval(
    tokenAddress: string,
    tokenSymbol: string,
    spenderAddress: string,
    currentAllowance: string,
    proposedAllowance: string,
    gasPrice: number, // gwei
    ethPriceUSD?: number
  ): ApprovalSimulation {
    const current = BigInt(currentAllowance);
    const proposed = BigInt(proposedAllowance);
    
    // Determine action
    let action: ApprovalSimulation['action'];
    if (proposed === BigInt(0)) {
      action = 'revoke';
    } else if (current === BigInt(0)) {
      action = 'grant';
    } else {
      action = 'update';
    }

    // Estimate gas (standard approval gas)
    const gasEstimate = 46000;
    const gasPriceWei = gasPrice * 1e9;
    const gasCost = (gasEstimate * gasPriceWei) / 1e18;
    const gasCostUSD = ethPriceUSD ? gasCost * ethPriceUSD : undefined;

    // Calculate impact
    const impact = this.calculateImpact(current, proposed, action);

    // Generate warnings
    const warnings = this.generateWarnings(current, proposed, action);

    // Generate recommendations
    const recommendations = this.generateRecommendations(impact, warnings);

    return {
      tokenAddress,
      tokenSymbol,
      spenderAddress,
      currentAllowance,
      proposedAllowance,
      action,
      gasEstimate,
      gasCost: gasCost.toFixed(8),
      gasCostUSD: gasCostUSD ? Math.round(gasCostUSD * 100) / 100 : undefined,
      impact,
      warnings,
      recommendations,
    };
  }

  /**
   * Simulate batch approval changes
   */
  simulateBatch(
    approvals: Array<{
      tokenAddress: string;
      tokenSymbol: string;
      spenderAddress: string;
      currentAllowance: string;
      proposedAllowance: string;
    }>,
    gasPrice: number, // gwei
    ethPriceUSD?: number
  ): BatchApprovalSimulation {
    const simulations = approvals.map(approval =>
      this.simulateApproval(
        approval.tokenAddress,
        approval.tokenSymbol,
        approval.spenderAddress,
        approval.currentAllowance,
        approval.proposedAllowance,
        gasPrice,
        ethPriceUSD
      )
    );

    const totalGasEstimate = simulations.reduce((sum, sim) => sum + sim.gasEstimate, 0);
    const totalGasCost = simulations.reduce((sum, sim) => sum + parseFloat(sim.gasCost), 0);
    const totalGasCostUSD = ethPriceUSD ? totalGasCost * ethPriceUSD : undefined;

    // Calculate overall impact
    const riskChange = simulations.reduce((sum, sim) => sum + sim.impact.riskChange, 0);
    const approvalsToRevoke = simulations.filter(s => s.action === 'revoke').length;
    const approvalsToGrant = simulations.filter(s => s.action === 'grant').length;
    const approvalsToUpdate = simulations.filter(s => s.action === 'update').length;

    const securityImpact = riskChange < -10
      ? 'improves'
      : riskChange > 10
      ? 'worsens'
      : 'neutral';

    // Aggregate recommendations
    const allRecommendations = simulations.flatMap(s => s.recommendations);
    const uniqueRecommendations = [...new Set(allRecommendations)];

    return {
      simulations,
      totalGasEstimate,
      totalGasCost: totalGasCost.toFixed(8),
      totalGasCostUSD: totalGasCostUSD ? Math.round(totalGasCostUSD * 100) / 100 : undefined,
      overallImpact: {
        riskChange: Math.round(riskChange * 100) / 100,
        securityImpact,
        approvalsToRevoke,
        approvalsToGrant,
        approvalsToUpdate,
      },
      recommendations: uniqueRecommendations,
    };
  }

  /**
   * Calculate impact of approval change
   */
  private calculateImpact(
    current: bigint,
    proposed: bigint,
    action: ApprovalSimulation['action']
  ): ApprovalSimulation['impact'] {
    let riskChange = 0;
    let securityImpact: ApprovalSimulation['impact']['securityImpact'] = 'neutral';
    let description = '';

    if (action === 'revoke') {
      riskChange = -20; // Revoking reduces risk
      securityImpact = 'improves';
      description = 'Revoking approval improves security by removing exposure';
    } else if (action === 'grant') {
      // Check if unlimited
      const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      if (proposed === maxUint256 || proposed > BigInt('1000000000000000000000000')) {
        riskChange = 30; // Granting unlimited increases risk significantly
        securityImpact = 'worsens';
        description = 'Granting unlimited approval significantly increases risk';
      } else {
        riskChange = 10; // Granting any approval increases risk
        securityImpact = 'worsens';
        description = 'Granting approval increases exposure to spender';
      }
    } else if (action === 'update') {
      const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      
      if (current === maxUint256 && proposed !== maxUint256) {
        riskChange = -25; // Reducing from unlimited is good
        securityImpact = 'improves';
        description = 'Reducing from unlimited approval improves security';
      } else if (current !== maxUint256 && proposed === maxUint256) {
        riskChange = 30; // Increasing to unlimited is bad
        securityImpact = 'worsens';
        description = 'Increasing to unlimited approval significantly increases risk';
      } else if (proposed > current) {
        riskChange = 5; // Increasing allowance slightly increases risk
        securityImpact = 'worsens';
        description = 'Increasing allowance increases exposure';
      } else {
        riskChange = -5; // Decreasing allowance reduces risk
        securityImpact = 'improves';
        description = 'Decreasing allowance reduces exposure';
      }
    }

    return {
      riskChange,
      securityImpact,
      description,
    };
  }

  /**
   * Generate warnings
   */
  private generateWarnings(
    current: bigint,
    proposed: bigint,
    action: ApprovalSimulation['action']
  ): ApprovalSimulation['warnings'] {
    const warnings: ApprovalSimulation['warnings'] = [];

    const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

    if (action === 'grant' && proposed === maxUint256) {
      warnings.push({
        severity: 'high',
        message: 'Granting unlimited approval - consider setting a specific limit',
      });
    }

    if (action === 'update' && current !== maxUint256 && proposed === maxUint256) {
      warnings.push({
        severity: 'high',
        message: 'Updating to unlimited approval - this significantly increases risk',
      });
    }

    if (action === 'revoke' && current === BigInt(0)) {
      warnings.push({
        severity: 'low',
        message: 'Approval is already revoked - transaction may be unnecessary',
      });
    }

    return warnings;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    impact: ApprovalSimulation['impact'],
    warnings: ApprovalSimulation['warnings']
  ): string[] {
    const recommendations: string[] = [];

    if (impact.securityImpact === 'improves') {
      recommendations.push('This change improves wallet security');
    } else if (impact.securityImpact === 'worsens') {
      recommendations.push('Consider the security implications before proceeding');
    }

    if (warnings.some(w => w.severity === 'high')) {
      recommendations.push('Review high-severity warnings before proceeding');
    }

    if (impact.riskChange > 20) {
      recommendations.push('This change significantly increases risk - proceed with caution');
    }

    return recommendations;
  }

  /**
   * Compare multiple approval scenarios
   */
  compareScenarios(
    scenarios: Array<{
      name: string;
      proposedAllowance: string;
    }>,
    tokenAddress: string,
    tokenSymbol: string,
    spenderAddress: string,
    currentAllowance: string,
    gasPrice: number,
    ethPriceUSD?: number
  ): Array<{
    name: string;
    simulation: ApprovalSimulation;
    comparison: {
      gasCost: string;
      riskChange: number;
      securityImpact: string;
    };
  }> {
    return scenarios.map(scenario => {
      const simulation = this.simulateApproval(
        tokenAddress,
        tokenSymbol,
        spenderAddress,
        currentAllowance,
        scenario.proposedAllowance,
        gasPrice,
        ethPriceUSD
      );

      return {
        name: scenario.name,
        simulation,
        comparison: {
          gasCost: simulation.gasCost,
          riskChange: simulation.impact.riskChange,
          securityImpact: simulation.impact.securityImpact,
        },
      };
    });
  }
}

// Singleton instance
export const tokenApprovalSimulator = new TokenApprovalSimulator();

