/**
 * Network Status Monitor Utility
 * Monitors blockchain network status and health
 */

export interface NetworkStatus {
  chainId: number;
  chainName: string;
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  blockHeight: number;
  latestBlockTime: number;
  averageBlockTime: number; // seconds
  pendingTransactions: number;
  gasPrice: {
    slow: number;
    standard: number;
    fast: number;
  };
  networkUtilization: number; // 0-100 percentage
  nodeHealth: {
    synced: boolean;
    peers: number;
    latency: number; // milliseconds
  };
  lastUpdated: number;
}

export interface NetworkAlert {
  id: string;
  chainId: number;
  type: 'high_gas' | 'slow_blocks' | 'network_congestion' | 'node_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
}

export class NetworkStatusMonitor {
  private statusCache: Map<number, NetworkStatus> = new Map();
  private alerts: NetworkAlert[] = [];
  private readonly UPDATE_INTERVAL = 60000; // 1 minute

  /**
   * Update network status
   */
  updateStatus(status: NetworkStatus): void {
    this.statusCache.set(status.chainId, status);

    // Check for issues and generate alerts
    this.checkNetworkHealth(status);
  }

  /**
   * Get network status
   */
  getStatus(chainId: number): NetworkStatus | null {
    return this.statusCache.get(chainId) || null;
  }

  /**
   * Get all network statuses
   */
  getAllStatuses(): NetworkStatus[] {
    return Array.from(this.statusCache.values());
  }

  /**
   * Check network health and generate alerts
   */
  private checkNetworkHealth(status: NetworkStatus): void {
    // High gas price alert
    if (status.gasPrice.standard > 100e9) { // > 100 gwei
      this.addAlert({
        id: `high-gas-${status.chainId}-${Date.now()}`,
        chainId: status.chainId,
        type: 'high_gas',
        severity: 'high',
        message: `High gas prices detected on ${status.chainName}: ${status.gasPrice.standard / 1e9} gwei`,
        timestamp: Date.now(),
        resolved: false,
      });
    }

    // Slow blocks alert
    if (status.averageBlockTime > 15) { // > 15 seconds
      this.addAlert({
        id: `slow-blocks-${status.chainId}-${Date.now()}`,
        chainId: status.chainId,
        type: 'slow_blocks',
        severity: 'medium',
        message: `Slow block times on ${status.chainName}: ${status.averageBlockTime}s average`,
        timestamp: Date.now(),
        resolved: false,
      });
    }

    // Network congestion alert
    if (status.networkUtilization > 90) {
      this.addAlert({
        id: `congestion-${status.chainId}-${Date.now()}`,
        chainId: status.chainId,
        type: 'network_congestion',
        severity: 'high',
        message: `Network congestion on ${status.chainName}: ${status.networkUtilization}% utilization`,
        timestamp: Date.now(),
        resolved: false,
      });
    }

    // Node health alert
    if (!status.nodeHealth.synced || status.nodeHealth.latency > 1000) {
      this.addAlert({
        id: `node-issue-${status.chainId}-${Date.now()}`,
        chainId: status.chainId,
        type: 'node_issue',
        severity: 'medium',
        message: `Node health issues on ${status.chainName}`,
        timestamp: Date.now(),
        resolved: false,
      });
    }
  }

  /**
   * Add alert
   */
  private addAlert(alert: NetworkAlert): void {
    // Check if similar alert already exists
    const existing = this.alerts.find(
      a => a.chainId === alert.chainId &&
           a.type === alert.type &&
           !a.resolved &&
           Date.now() - a.timestamp < 3600000 // Within 1 hour
    );

    if (!existing) {
      this.alerts.push(alert);

      // Keep only last 1000 alerts
      if (this.alerts.length > 1000) {
        this.alerts = this.alerts.slice(-1000);
      }
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(chainId?: number): NetworkAlert[] {
    let alerts = this.alerts.filter(a => !a.resolved);

    if (chainId) {
      alerts = alerts.filter(a => a.chainId === chainId);
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      return false;
    }

    alert.resolved = true;
    return true;
  }

  /**
   * Compare network statuses
   */
  compareNetworks(chainIds: number[]): Array<NetworkStatus & { rank: number }> {
    const statuses = chainIds
      .map(id => this.statusCache.get(id))
      .filter((s): s is NetworkStatus => s !== undefined);

    // Sort by status (operational first), then by gas price (lowest first)
    statuses.sort((a, b) => {
      const statusOrder = { operational: 1, degraded: 2, down: 3, unknown: 4 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.gasPrice.standard - b.gasPrice.standard;
    });

    return statuses.map((status, index) => ({
      ...status,
      rank: index + 1,
    }));
  }

  /**
   * Get network health score
   */
  getHealthScore(chainId: number): number | null {
    const status = this.statusCache.get(chainId);
    if (!status) {
      return null;
    }

    let score = 100;

    // Deduct for status
    if (status.status === 'down') {
      score -= 50;
    } else if (status.status === 'degraded') {
      score -= 25;
    }

    // Deduct for high gas
    if (status.gasPrice.standard > 100e9) {
      score -= 20;
    } else if (status.gasPrice.standard > 50e9) {
      score -= 10;
    }

    // Deduct for slow blocks
    if (status.averageBlockTime > 20) {
      score -= 15;
    } else if (status.averageBlockTime > 15) {
      score -= 5;
    }

    // Deduct for high utilization
    if (status.networkUtilization > 90) {
      score -= 15;
    } else if (status.networkUtilization > 80) {
      score -= 5;
    }

    // Deduct for node issues
    if (!status.nodeHealth.synced) {
      score -= 10;
    }
    if (status.nodeHealth.latency > 1000) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }
}

// Singleton instance
export const networkStatusMonitor = new NetworkStatusMonitor();

