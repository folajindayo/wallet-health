/**
 * Risk Prediction Engine Utility
 * Predict future risks based on historical patterns and trends
 */

export interface RiskPrediction {
  type: 'approval' | 'token' | 'contract' | 'transaction' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  description: string;
  factors: string[];
  mitigation: string[];
  confidence: number; // 0-100
}

export interface PredictionContext {
  currentRiskScore: number;
  riskHistory: Array<{ timestamp: number; score: number }>;
  approvalCount: number;
  riskyApprovals: number;
  recentTransactions: number;
  failedTransactions: number;
  newContracts: number;
  spamTokens: number;
}

export class RiskPredictionEngine {
  /**
   * Predict future risks
   */
  predictRisks(context: PredictionContext): RiskPrediction[] {
    const predictions: RiskPrediction[] = [];

    // Predict approval risk
    predictions.push(...this.predictApprovalRisk(context));

    // Predict token risk
    predictions.push(...this.predictTokenRisk(context));

    // Predict transaction risk
    predictions.push(...this.predictTransactionRisk(context));

    // Predict general risk trend
    predictions.push(...this.predictGeneralRisk(context));

    // Sort by probability and severity
    predictions.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.probability - a.probability;
    });

    return predictions;
  }

  /**
   * Predict approval-related risks
   */
  private predictApprovalRisk(context: PredictionContext): RiskPrediction[] {
    const predictions: RiskPrediction[] = [];

    // High approval count risk
    if (context.approvalCount > 20) {
      predictions.push({
        type: 'approval',
        severity: 'medium',
        probability: 60,
        timeframe: 'short-term',
        description: 'High number of active approvals increases attack surface',
        factors: [
          `Current approval count: ${context.approvalCount}`,
          'Each approval represents a potential risk vector',
        ],
        mitigation: [
          'Review and revoke unused approvals',
          'Use approval optimizer to identify unnecessary approvals',
          'Consider setting approval limits instead of unlimited',
        ],
        confidence: 75,
      });
    }

    // Risky approvals trend
    if (context.riskyApprovals > 5) {
      predictions.push({
        type: 'approval',
        severity: 'high',
        probability: 70,
        timeframe: 'immediate',
        description: 'Multiple risky approvals detected - immediate action recommended',
        factors: [
          `Risky approvals: ${context.riskyApprovals}`,
          'Risky approvals are more likely to be exploited',
        ],
        mitigation: [
          'Immediately review all risky approvals',
          'Revoke approvals to unverified contracts',
          'Revoke unlimited approvals',
        ],
        confidence: 85,
      });
    }

    // Approval growth trend
    if (context.approvalCount > 10 && context.recentTransactions > 20) {
      predictions.push({
        type: 'approval',
        severity: 'low',
        probability: 50,
        timeframe: 'medium-term',
        description: 'Approval count may continue to grow with high transaction activity',
        factors: [
          'High transaction activity often leads to more approvals',
          'Users tend to accumulate approvals over time',
        ],
        mitigation: [
          'Regularly audit and clean up approvals',
          'Set reminders to review approvals monthly',
        ],
        confidence: 60,
      });
    }

    return predictions;
  }

  /**
   * Predict token-related risks
   */
  private predictTokenRisk(context: PredictionContext): RiskPrediction[] {
    const predictions: RiskPrediction[] = [];

    if (context.spamTokens > 0) {
      predictions.push({
        type: 'token',
        severity: 'medium',
        probability: 40,
        timeframe: 'short-term',
        description: 'Spam tokens in wallet may indicate phishing attempts',
        factors: [
          `Spam tokens detected: ${context.spamTokens}`,
          'Spam tokens are often used for phishing',
        ],
        mitigation: [
          'Remove spam tokens from wallet',
          'Never interact with spam tokens',
          'Be cautious of airdrops',
        ],
        confidence: 70,
      });
    }

    return predictions;
  }

  /**
   * Predict transaction-related risks
   */
  private predictTransactionRisk(context: PredictionContext): RiskPrediction[] {
    const predictions: RiskPrediction[] = [];

    // High failure rate
    if (context.failedTransactions > 0 && context.recentTransactions > 0) {
      const failureRate = (context.failedTransactions / context.recentTransactions) * 100;
      if (failureRate > 20) {
        predictions.push({
          type: 'transaction',
          severity: 'medium',
          probability: 65,
          timeframe: 'immediate',
          description: 'High transaction failure rate detected',
          factors: [
            `Failure rate: ${failureRate.toFixed(1)}%`,
            'Failed transactions waste gas and indicate potential issues',
          ],
          mitigation: [
            'Review gas settings',
            'Check network conditions',
            'Verify transaction parameters before sending',
          ],
          confidence: 80,
        });
      }
    }

    // Rapid transactions
    if (context.recentTransactions > 50) {
      predictions.push({
        type: 'transaction',
        severity: 'low',
        probability: 40,
        timeframe: 'short-term',
        description: 'High transaction volume may lead to increased gas costs',
        factors: [
          `Recent transactions: ${context.recentTransactions}`,
          'High volume can indicate automated trading or bot activity',
        ],
        mitigation: [
          'Consider batching transactions',
          'Use gas optimization tools',
          'Monitor gas prices before transactions',
        ],
        confidence: 60,
      });
    }

    return predictions;
  }

  /**
   * Predict general risk trends
   */
  private predictGeneralRisk(context: PredictionContext): RiskPrediction[] {
    const predictions: RiskPrediction[] = [];

    // Analyze risk score trend
    if (context.riskHistory.length >= 3) {
      const recent = context.riskHistory.slice(-3);
      const trend = this.calculateTrend(recent.map(r => r.score));

      if (trend < -5) {
        // Risk score decreasing (improving)
        predictions.push({
          type: 'general',
          severity: 'low',
          probability: 60,
          timeframe: 'medium-term',
          description: 'Risk score is improving - wallet security is getting better',
          factors: [
            'Risk score trend is positive',
            'Recent security improvements detected',
          ],
          mitigation: [
            'Continue current security practices',
            'Maintain regular security audits',
          ],
          confidence: 70,
        });
      } else if (trend > 5) {
        // Risk score increasing (worsening)
        predictions.push({
          type: 'general',
          severity: 'high',
          probability: 75,
          timeframe: 'short-term',
          description: 'Risk score is deteriorating - immediate action recommended',
          factors: [
            'Risk score trend is negative',
            'Security posture is declining',
          ],
          mitigation: [
            'Immediately review all security settings',
            'Audit all approvals and contracts',
            'Review recent transactions for suspicious activity',
          ],
          confidence: 80,
        });
      }
    }

    // Low risk score prediction
    if (context.currentRiskScore < 50) {
      predictions.push({
        type: 'general',
        severity: 'critical',
        probability: 85,
        timeframe: 'immediate',
        description: 'Critical risk level - wallet requires immediate attention',
        factors: [
          `Current risk score: ${context.currentRiskScore}/100`,
          'Low scores indicate significant security issues',
        ],
        mitigation: [
          'Review all security recommendations',
          'Revoke risky approvals immediately',
          'Remove suspicious tokens',
          'Consider using a hardware wallet',
        ],
        confidence: 90,
      });
    }

    // New contracts risk
    if (context.newContracts > 3) {
      predictions.push({
        type: 'contract',
        severity: 'medium',
        probability: 55,
        timeframe: 'short-term',
        description: 'Multiple new contract interactions detected',
        factors: [
          `New contracts: ${context.newContracts}`,
          'New contracts may have undiscovered vulnerabilities',
        ],
        mitigation: [
          'Verify contract source code',
          'Check contract audit status',
          'Review contract permissions',
        ],
        confidence: 65,
      });
    }

    return predictions;
  }

  /**
   * Calculate trend from values
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    let trend = 0;
    for (let i = 1; i < values.length; i++) {
      trend += values[i] - values[i - 1];
    }

    return trend / (values.length - 1);
  }

  /**
   * Get risk prediction summary
   */
  getPredictionSummary(predictions: RiskPrediction[]): {
    totalPredictions: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    averageProbability: number;
    averageConfidence: number;
  } {
    const critical = predictions.filter(p => p.severity === 'critical').length;
    const high = predictions.filter(p => p.severity === 'high').length;
    const medium = predictions.filter(p => p.severity === 'medium').length;
    const low = predictions.filter(p => p.severity === 'low').length;

    const averageProbability = predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length
      : 0;

    const averageConfidence = predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
      : 0;

    return {
      totalPredictions: predictions.length,
      critical,
      high,
      medium,
      low,
      averageProbability: Math.round(averageProbability * 100) / 100,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
    };
  }
}

// Singleton instance
export const riskPredictionEngine = new RiskPredictionEngine();

