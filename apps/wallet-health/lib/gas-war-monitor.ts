/**
 * Gas War Monitor Utility
 * Monitor gas wars and high competition transactions
 */

export interface GasWarEvent {
  id: string;
  chainId: number;
  contractAddress: string;
  contractName?: string;
  eventType: 'nft_mint' | 'token_launch' | 'airdrop' | 'other';
  startTime: number;
  endTime?: number;
  peakGasPrice: number; // gwei
  averageGasPrice: number; // gwei
  transactionCount: number;
  totalGasSpent: number; // ETH or native token
  totalGasSpentUSD: number;
  participants: number;
  status: 'active' | 'ended';
}

export interface GasWarAlert {
  id: string;
  eventId: string;
  chainId: number;
  contractAddress: string;
  alertType: 'war_started' | 'gas_spike' | 'war_ended';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  gasPrice: number; // gwei
  timestamp: number;
  acknowledged: boolean;
}

export class GasWarMonitor {
  private events: Map<string, GasWarEvent> = new Map();
  private alerts: Map<string, GasWarAlert[]> = new Map();
  private readonly GAS_WAR_THRESHOLD = 100; // gwei

  /**
   * Detect gas war
   */
  detectGasWar(
    chainId: number,
    contractAddress: string,
    currentGasPrice: number,
    transactionCount: number,
    timeWindow: number = 300000 // 5 minutes
  ): GasWarEvent | null {
    if (currentGasPrice < this.GAS_WAR_THRESHOLD) {
      return null;
    }

    const key = `${contractAddress.toLowerCase()}-${chainId}`;
    const existingEvent = this.events.get(key);

    if (existingEvent && existingEvent.status === 'active') {
      // Update existing event
      existingEvent.peakGasPrice = Math.max(existingEvent.peakGasPrice, currentGasPrice);
      existingEvent.transactionCount += transactionCount;
      existingEvent.averageGasPrice = 
        (existingEvent.averageGasPrice * existingEvent.transactionCount + currentGasPrice * transactionCount) /
        (existingEvent.transactionCount + transactionCount);
      
      return existingEvent;
    }

    // Create new event
    const event: GasWarEvent = {
      id: `gas-war-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chainId,
      contractAddress,
      eventType: 'other',
      startTime: Date.now(),
      peakGasPrice: currentGasPrice,
      averageGasPrice: currentGasPrice,
      transactionCount,
      totalGasSpent: 0,
      totalGasSpentUSD: 0,
      participants: 1,
      status: 'active',
    };

    this.events.set(key, event);

    // Create alert
    this.createAlert(event, 'war_started', currentGasPrice);

    return event;
  }

  /**
   * End gas war event
   */
  endGasWar(eventId: string): boolean {
    const event = Array.from(this.events.values()).find(e => e.id === eventId);
    if (!event || event.status !== 'active') {
      return false;
    }

    event.status = 'ended';
    event.endTime = Date.now();

    // Create end alert
    this.createAlert(event, 'war_ended', event.averageGasPrice);

    return true;
  }

  /**
   * Create alert
   */
  private createAlert(
    event: GasWarEvent,
    alertType: GasWarAlert['alertType'],
    gasPrice: number
  ): void {
    const alert: GasWarAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventId: event.id,
      chainId: event.chainId,
      contractAddress: event.contractAddress,
      alertType,
      priority: this.determinePriority(gasPrice),
      message: this.generateAlertMessage(event, alertType, gasPrice),
      gasPrice,
      timestamp: Date.now(),
      acknowledged: false,
    };

    // Store alert (could be per wallet or global)
    const key = 'global'; // In production, might be per wallet
    if (!this.alerts.has(key)) {
      this.alerts.set(key, []);
    }

    this.alerts.get(key)!.push(alert);

    // Keep only last 1000 alerts
    const alerts = this.alerts.get(key)!;
    if (alerts.length > 1000) {
      alerts.splice(0, alerts.length - 1000);
    }
  }

  /**
   * Determine alert priority
   */
  private determinePriority(gasPrice: number): GasWarAlert['priority'] {
    if (gasPrice > 500) {
      return 'critical';
    } else if (gasPrice > 200) {
      return 'high';
    } else if (gasPrice > 100) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(
    event: GasWarEvent,
    alertType: GasWarAlert['alertType'],
    gasPrice: number
  ): string {
    switch (alertType) {
      case 'war_started':
        return `Gas war detected! Gas price: ${gasPrice} gwei. Contract: ${event.contractAddress.substring(0, 8)}...`;
      case 'gas_spike':
        return `Gas price spike: ${gasPrice} gwei`;
      case 'war_ended':
        return `Gas war ended. Average gas: ${event.averageGasPrice.toFixed(2)} gwei`;
      default:
        return 'Gas war event detected';
    }
  }

  /**
   * Get active gas wars
   */
  getActiveGasWars(chainId?: number): GasWarEvent[] {
    let events = Array.from(this.events.values()).filter(e => e.status === 'active');

    if (chainId) {
      events = events.filter(e => e.chainId === chainId);
    }

    return events.sort((a, b) => b.peakGasPrice - a.peakGasPrice);
  }

  /**
   * Get gas war event
   */
  getGasWarEvent(eventId: string): GasWarEvent | null {
    return Array.from(this.events.values()).find(e => e.id === eventId) || null;
  }

  /**
   * Get alerts
   */
  getAlerts(acknowledged = false): GasWarAlert[] {
    const allAlerts: GasWarAlert[] = [];
    this.alerts.forEach(alerts => {
      allAlerts.push(...alerts);
    });

    let filtered = allAlerts;
    if (!acknowledged) {
      filtered = filtered.filter(a => !a.acknowledged);
    }

    return filtered.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    for (const alerts of this.alerts.values()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Get gas war statistics
   */
  getStatistics(chainId?: number, days = 7): {
    totalWars: number;
    activeWars: number;
    averagePeakGas: number;
    highestPeakGas: number;
    totalGasSpent: number; // USD
  } {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    let events = Array.from(this.events.values()).filter(e => e.startTime >= cutoff);

    if (chainId) {
      events = events.filter(e => e.chainId === chainId);
    }

    const activeWars = events.filter(e => e.status === 'active').length;
    const averagePeakGas = events.length > 0
      ? events.reduce((sum, e) => sum + e.peakGasPrice, 0) / events.length
      : 0;
    const highestPeakGas = events.length > 0
      ? Math.max(...events.map(e => e.peakGasPrice))
      : 0;
    const totalGasSpent = events.reduce((sum, e) => sum + e.totalGasSpentUSD, 0);

    return {
      totalWars: events.length,
      activeWars,
      averagePeakGas: Math.round(averagePeakGas * 100) / 100,
      highestPeakGas: Math.round(highestPeakGas * 100) / 100,
      totalGasSpent: Math.round(totalGasSpent * 100) / 100,
    };
  }

  /**
   * Clear events
   */
  clear(chainId?: number): void {
    if (chainId) {
      const toDelete: string[] = [];
      this.events.forEach((event, key) => {
        if (event.chainId === chainId) {
          toDelete.push(key);
        }
      });
      toDelete.forEach(key => this.events.delete(key));
    } else {
      this.events.clear();
      this.alerts.clear();
    }
  }
}

// Singleton instance
export const gasWarMonitor = new GasWarMonitor();

