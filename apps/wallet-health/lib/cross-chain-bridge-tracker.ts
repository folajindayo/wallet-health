/**
 * Cross-Chain Bridge Tracker
 * Tracks cross-chain bridge transactions and analyzes bridge usage
 */

export interface BridgeTransaction {
  hash: string;
  timestamp: number;
  fromChain: number;
  toChain: number;
  fromAddress: string;
  toAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: string;
  amountUSD?: number;
  bridgeProtocol: string;
  status: 'pending' | 'completed' | 'failed';
  completionHash?: string;
  completionTime?: number;
  estimatedTime?: number; // in seconds
  fees?: {
    bridgeFee: string;
    gasFee: string;
    totalUSD?: number;
  };
  metadata?: Record<string, any>;
}

export interface BridgeStats {
  totalBridges: number;
  completed: number;
  pending: number;
  failed: number;
  successRate: number;
  totalValueUSD: number;
  averageBridgeTime: number; // in seconds
  protocols: Record<string, {
    count: number;
  successRate: number;
    totalValue: string;
  }>;
  chains: {
    from: Record<number, number>;
    to: Record<number, number>;
  };
}

export interface BridgeAnalysis {
  transactions: BridgeTransaction[];
  stats: BridgeStats;
  risks: Array<{
    type: 'long_pending' | 'high_fees' | 'failed_bridge' | 'unknown_protocol';
    severity: 'high' | 'medium' | 'low';
    description: string;
    affectedTransactions: string[];
  }>;
  recommendations: string[];
}

export class CrossChainBridgeTracker {
  private bridges: Map<string, BridgeTransaction[]> = new Map(); // wallet -> bridges

  /**
   * Add bridge transaction
   */
  addBridge(
    walletAddress: string,
    bridge: BridgeTransaction
  ): void {
    const walletKey = walletAddress.toLowerCase();
    if (!this.bridges.has(walletKey)) {
      this.bridges.set(walletKey, []);
    }

    const walletBridges = this.bridges.get(walletKey)!;
    walletBridges.push(bridge);

    // Keep last 1000 bridges
    if (walletBridges.length > 1000) {
      walletBridges.shift();
    }

    // Sort by timestamp
    walletBridges.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Update bridge status
   */
  updateBridgeStatus(
    walletAddress: string,
    hash: string,
    status: BridgeTransaction['status'],
    completionHash?: string
  ): boolean {
    const walletKey = walletAddress.toLowerCase();
    const bridges = this.bridges.get(walletKey) || [];
    const bridge = bridges.find(b => b.hash === hash);

    if (!bridge) return false;

    bridge.status = status;
    if (completionHash) {
      bridge.completionHash = completionHash;
      bridge.completionTime = Date.now();
    }

    return true;
  }

  /**
   * Analyze bridge transactions
   */
  analyzeBridges(
    walletAddress: string,
    options: {
      startDate?: number;
      endDate?: number;
      chainId?: number;
    } = {}
  ): BridgeAnalysis {
    const walletKey = walletAddress.toLowerCase();
    let bridges = this.bridges.get(walletKey) || [];

    // Apply filters
    if (options.startDate) {
      bridges = bridges.filter(b => b.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      bridges = bridges.filter(b => b.timestamp <= options.endDate!);
    }

    if (options.chainId) {
      bridges = bridges.filter(
        b => b.fromChain === options.chainId || b.toChain === options.chainId
      );
    }

    // Calculate stats
    const stats = this.calculateStats(bridges);

    // Detect risks
    const risks = this.detectRisks(bridges);

    // Generate recommendations
    const recommendations = this.generateRecommendations(stats, risks);

    return {
      transactions: bridges,
      stats,
      risks,
      recommendations,
    };
  }

  /**
   * Get bridge statistics
   */
  getStats(walletAddress: string): BridgeStats {
    const walletKey = walletAddress.toLowerCase();
    const bridges = this.bridges.get(walletKey) || [];
    return this.calculateStats(bridges);
  }

  /**
   * Get pending bridges
   */
  getPendingBridges(walletAddress: string): BridgeTransaction[] {
    const walletKey = walletAddress.toLowerCase();
    const bridges = this.bridges.get(walletKey) || [];
    return bridges.filter(b => b.status === 'pending');
  }

  /**
   * Calculate statistics
   */
  private calculateStats(bridges: BridgeTransaction[]): BridgeStats {
    const completed = bridges.filter(b => b.status === 'completed').length;
    const pending = bridges.filter(b => b.status === 'pending').length;
    const failed = bridges.filter(b => b.status === 'failed').length;
    const successRate = bridges.length > 0
      ? (completed / (completed + failed)) * 100
      : 0;

    const totalValueUSD = bridges.reduce(
      (sum, b) => sum + (b.amountUSD || 0),
      0
    );

    // Calculate average bridge time
    const completedBridges = bridges.filter(
      b => b.status === 'completed' && b.completionTime
    );
    const bridgeTimes = completedBridges.map(b => {
      if (b.completionTime && b.timestamp) {
        return (b.completionTime - b.timestamp) / 1000; // Convert to seconds
      }
      return 0;
    });
    const averageBridgeTime =
      bridgeTimes.length > 0
        ? bridgeTimes.reduce((sum, t) => sum + t, 0) / bridgeTimes.length
        : 0;

    // Protocol stats
    const protocols: Record<string, { count: number; successRate: number; totalValue: bigint }> = {};
    bridges.forEach(bridge => {
      if (!protocols[bridge.bridgeProtocol]) {
        protocols[bridge.bridgeProtocol] = {
          count: 0,
          successRate: 0,
          totalValue: BigInt(0),
        };
      }

      protocols[bridge.bridgeProtocol].count++;
      protocols[bridge.bridgeProtocol].totalValue += BigInt(bridge.amount || '0');

      // Calculate success rate per protocol
      const protocolBridges = bridges.filter(b => b.bridgeProtocol === bridge.bridgeProtocol);
      const protocolCompleted = protocolBridges.filter(b => b.status === 'completed').length;
      const protocolFailed = protocolBridges.filter(b => b.status === 'failed').length;
      protocols[bridge.bridgeProtocol].successRate =
        protocolCompleted + protocolFailed > 0
          ? (protocolCompleted / (protocolCompleted + protocolFailed)) * 100
          : 0;
    });

    // Chain stats
    const fromChains: Record<number, number> = {};
    const toChains: Record<number, number> = {};
    bridges.forEach(bridge => {
      fromChains[bridge.fromChain] = (fromChains[bridge.fromChain] || 0) + 1;
      toChains[bridge.toChain] = (toChains[bridge.toChain] || 0) + 1;
    });

    return {
      totalBridges: bridges.length,
      completed,
      pending,
      failed,
      successRate: Math.round(successRate * 100) / 100,
      totalValueUSD,
      averageBridgeTime: Math.round(averageBridgeTime),
      protocols: Object.fromEntries(
        Object.entries(protocols).map(([protocol, data]) => [
          protocol,
          {
            count: data.count,
            successRate: Math.round(data.successRate * 100) / 100,
            totalValue: data.totalValue.toString(),
          },
        ])
      ),
      chains: {
        from: fromChains,
        to: toChains,
      },
    };
  }

  /**
   * Detect risks
   */
  private detectRisks(bridges: BridgeTransaction[]): BridgeAnalysis['risks'] {
    const risks: BridgeAnalysis['risks'] = [];

    // Long pending bridges (> 1 hour)
    const longPending = bridges.filter(bridge => {
      if (bridge.status !== 'pending') return false;
      const pendingTime = (Date.now() - bridge.timestamp) / 1000; // seconds
      return pendingTime > 3600; // 1 hour
    });

    if (longPending.length > 0) {
      risks.push({
        type: 'long_pending',
        severity: 'medium',
        description: `${longPending.length} bridge(s) pending for over 1 hour`,
        affectedTransactions: longPending.map(b => b.hash),
      });
    }

    // High fees
    const highFeeBridges = bridges.filter(bridge => {
      if (!bridge.fees?.totalUSD) return false;
      return bridge.fees.totalUSD > 50; // $50 threshold
    });

    if (highFeeBridges.length > 0) {
      risks.push({
        type: 'high_fees',
        severity: 'low',
        description: `${highFeeBridges.length} bridge(s) with high fees (>$50)`,
        affectedTransactions: highFeeBridges.map(b => b.hash),
      });
    }

    // Failed bridges
    const failedBridges = bridges.filter(b => b.status === 'failed');
    if (failedBridges.length > bridges.length * 0.1) {
      risks.push({
        type: 'failed_bridge',
        severity: 'high',
        description: `High failure rate: ${failedBridges.length}/${bridges.length} bridges failed`,
        affectedTransactions: failedBridges.map(b => b.hash),
      });
    }

    return risks;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    stats: BridgeStats,
    risks: BridgeAnalysis['risks']
  ): string[] {
    const recommendations: string[] = [];

    if (stats.successRate < 90) {
      recommendations.push('Consider using more reliable bridge protocols');
    }

    if (stats.averageBridgeTime > 1800) {
      recommendations.push('Bridge times are slow - consider faster alternatives');
    }

    const longPendingRisk = risks.find(r => r.type === 'long_pending');
    if (longPendingRisk) {
      recommendations.push('Check on pending bridges - some may need attention');
    }

    if (stats.pending > 5) {
      recommendations.push('Multiple pending bridges - monitor closely');
    }

    return recommendations;
  }
}

// Singleton instance
export const crossChainBridgeTracker = new CrossChainBridgeTracker();
