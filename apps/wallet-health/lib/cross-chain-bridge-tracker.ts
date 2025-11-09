/**
 * Cross-chain Bridge Tracker Utility
 * Tracks assets bridged across different chains
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
  estimatedTime?: number; // milliseconds
}

export interface BridgeStats {
  totalBridges: number;
  totalValueUSD: number;
  bridgesByChain: Record<string, number>;
  bridgesByProtocol: Record<string, number>;
  averageBridgeTime: number; // milliseconds
  successRate: number;
  mostUsedBridge: string;
  mostBridgedChain: string;
}

export interface BridgeRoute {
  fromChain: number;
  toChain: number;
  protocol: string;
  estimatedTime: number;
  estimatedCost: number;
  liquidity: number; // USD
  riskLevel: 'low' | 'medium' | 'high';
}

export class CrossChainBridgeTracker {
  private bridges: BridgeTransaction[] = [];
  private knownBridges: Map<string, BridgeRoute> = new Map();

  constructor() {
    this.initializeKnownBridges();
  }

  /**
   * Add a bridge transaction
   */
  addBridge(bridge: BridgeTransaction): void {
    this.bridges.push(bridge);
    
    // Keep sorted by timestamp
    this.bridges.sort((a, b) => b.timestamp - a.timestamp);
    
    // Keep only last 10000 bridges
    if (this.bridges.length > 10000) {
      this.bridges = this.bridges.slice(-10000);
    }
  }

  /**
   * Update bridge status
   */
  updateBridgeStatus(hash: string, status: BridgeTransaction['status'], completionHash?: string): boolean {
    const bridge = this.bridges.find(b => b.hash === hash);
    if (!bridge) {
      return false;
    }

    bridge.status = status;
    if (completionHash) {
      bridge.completionHash = completionHash;
    }

    if (status === 'completed' && bridge.estimatedTime) {
      bridge.estimatedTime = Date.now() - bridge.timestamp;
    }

    return true;
  }

  /**
   * Get bridge statistics
   */
  getStats(): BridgeStats {
    const completed = this.bridges.filter(b => b.status === 'completed');
    const totalValueUSD = completed.reduce((sum, b) => sum + (b.amountUSD || 0), 0);

    const bridgesByChain: Record<string, number> = {};
    const bridgesByProtocol: Record<string, number> = {};

    let totalBridgeTime = 0;
    let completedWithTime = 0;

    this.bridges.forEach(bridge => {
      // Count by destination chain
      const chainKey = bridge.toChain.toString();
      bridgesByChain[chainKey] = (bridgesByChain[chainKey] || 0) + 1;

      // Count by protocol
      bridgesByProtocol[bridge.bridgeProtocol] = (bridgesByProtocol[bridge.bridgeProtocol] || 0) + 1;

      // Calculate average bridge time
      if (bridge.status === 'completed' && bridge.estimatedTime) {
        totalBridgeTime += bridge.estimatedTime;
        completedWithTime++;
      }
    });

    const averageBridgeTime = completedWithTime > 0
      ? totalBridgeTime / completedWithTime
      : 0;

    const successRate = this.bridges.length > 0
      ? (completed.length / this.bridges.length) * 100
      : 0;

    // Find most used bridge
    const mostUsedBridge = Object.entries(bridgesByProtocol).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Find most bridged chain
    const mostBridgedChain = Object.entries(bridgesByChain).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return {
      totalBridges: this.bridges.length,
      totalValueUSD,
      bridgesByChain,
      bridgesByProtocol,
      averageBridgeTime: Math.round(averageBridgeTime),
      successRate: Math.round(successRate * 100) / 100,
      mostUsedBridge,
      mostBridgedChain,
    };
  }

  /**
   * Get bridges for a wallet
   */
  getWalletBridges(walletAddress: string, limit = 50): BridgeTransaction[] {
    return this.bridges
      .filter(b => 
        b.fromAddress.toLowerCase() === walletAddress.toLowerCase() ||
        b.toAddress.toLowerCase() === walletAddress.toLowerCase()
      )
      .slice(0, limit);
  }

  /**
   * Get bridges between two chains
   */
  getChainBridges(fromChain: number, toChain: number): BridgeTransaction[] {
    return this.bridges.filter(
      b => b.fromChain === fromChain && b.toChain === toChain
    );
  }

  /**
   * Find best bridge route
   */
  findBestRoute(
    fromChain: number,
    toChain: number,
    tokenAddress: string,
    amount: string
  ): BridgeRoute | null {
    const routeKey = `${fromChain}-${toChain}-${tokenAddress}`;
    const route = this.knownBridges.get(routeKey);

    if (route) {
      return route;
    }

    // Find alternative routes
    const routes = Array.from(this.knownBridges.values()).filter(
      r => r.fromChain === fromChain && r.toChain === toChain
    );

    if (routes.length === 0) {
      return null;
    }

    // Sort by risk level and estimated cost
    routes.sort((a, b) => {
      const riskOrder = { low: 1, medium: 2, high: 3 };
      if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      }
      return a.estimatedCost - b.estimatedCost;
    });

    return routes[0];
  }

  /**
   * Track pending bridges
   */
  getPendingBridges(walletAddress?: string): BridgeTransaction[] {
    let pending = this.bridges.filter(b => b.status === 'pending');

    if (walletAddress) {
      pending = pending.filter(
        b =>
          b.fromAddress.toLowerCase() === walletAddress.toLowerCase() ||
          b.toAddress.toLowerCase() === walletAddress.toLowerCase()
      );
    }

    // Check for expired pending bridges (older than 24 hours)
    const now = Date.now();
    const expired = pending.filter(
      b => now - b.timestamp > 24 * 60 * 60 * 1000
    );

    return pending.filter(b => !expired.includes(b));
  }

  /**
   * Initialize known bridge routes
   */
  private initializeKnownBridges(): void {
    // Ethereum to Base
    this.knownBridges.set('1-8453-native', {
      fromChain: 1,
      toChain: 8453,
      protocol: 'Base Bridge',
      estimatedTime: 2 * 60 * 1000, // 2 minutes
      estimatedCost: 0.0001,
      liquidity: 10000000,
      riskLevel: 'low',
    });

    // Add more bridge routes as needed
  }

  /**
   * Add custom bridge route
   */
  addBridgeRoute(route: BridgeRoute): void {
    const key = `${route.fromChain}-${route.toChain}-native`;
    this.knownBridges.set(key, route);
  }

  /**
   * Clear all bridges
   */
  clear(): void {
    this.bridges = [];
  }
}

// Singleton instance
export const crossChainBridgeTracker = new CrossChainBridgeTracker();

