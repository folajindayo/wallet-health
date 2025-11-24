/**
 * Wallet Connection Analytics
 * Tracks and analyzes wallet connection patterns, session duration, and usage statistics
 */

export interface ConnectionSession {
  id: string;
  walletAddress: string;
  chainId: number;
  connectedAt: number;
  disconnectedAt?: number;
  duration?: number; // in seconds
  userAgent?: string;
  ipAddress?: string;
  connectionMethod: 'metamask' | 'walletconnect' | 'coinbase' | 'other';
  actionsPerformed: number;
  transactionsInitiated: number;
  scansPerformed: number;
}

export interface ConnectionAnalytics {
  totalSessions: number;
  totalDuration: number; // total seconds connected
  averageSessionDuration: number;
  longestSession: number;
  shortestSession: number;
  mostActiveChain: number;
  connectionMethods: Record<string, number>;
  peakHours: Array<{ hour: number; count: number }>;
  peakDays: Array<{ day: string; count: number }>;
  averageActionsPerSession: number;
  totalTransactions: number;
  totalScans: number;
  connectionFrequency: 'daily' | 'weekly' | 'monthly' | 'sporadic';
  lastConnectedAt?: number;
  firstConnectedAt?: number;
}

export class WalletConnectionAnalytics {
  private sessions: Map<string, ConnectionSession> = new Map();
  private currentSessions: Map<string, ConnectionSession> = new Map();

  /**
   * Start tracking a new connection session
   */
  startSession(params: {
    walletAddress: string;
    chainId: number;
    connectionMethod: ConnectionSession['connectionMethod'];
    userAgent?: string;
    ipAddress?: string;
  }): string {
    const sessionId = `${params.walletAddress}-${Date.now()}`;
    const session: ConnectionSession = {
      id: sessionId,
      walletAddress: params.walletAddress,
      chainId: params.chainId,
      connectedAt: Date.now(),
      connectionMethod: params.connectionMethod,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      actionsPerformed: 0,
      transactionsInitiated: 0,
      scansPerformed: 0,
    };

    this.currentSessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * End a connection session
   */
  endSession(sessionId: string): ConnectionSession | null {
    const session = this.currentSessions.get(sessionId);
    if (!session) return null;

    const disconnectedAt = Date.now();
    const duration = disconnectedAt - session.connectedAt;

    const completedSession: ConnectionSession = {
      ...session,
      disconnectedAt,
      duration: Math.floor(duration / 1000), // convert to seconds
    };

    this.sessions.set(sessionId, completedSession);
    this.currentSessions.delete(sessionId);

    return completedSession;
  }

  /**
   * Track an action performed during a session
   */
  trackAction(sessionId: string, actionType: 'scan' | 'transaction' | 'other'): void {
    const session = this.currentSessions.get(sessionId);
    if (!session) return;

    session.actionsPerformed++;
    if (actionType === 'scan') {
      session.scansPerformed++;
    } else if (actionType === 'transaction') {
      session.transactionsInitiated++;
    }
  }

  /**
   * Get analytics for a specific wallet
   */
  getAnalytics(walletAddress: string): ConnectionAnalytics | null {
    const walletSessions = Array.from(this.sessions.values()).filter(
      (s) => s.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );

    if (walletSessions.length === 0) return null;

    // Calculate total duration
    const totalDuration = walletSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageSessionDuration = totalDuration / walletSessions.length;
    const sessionDurations = walletSessions.map((s) => s.duration || 0);
    const longestSession = Math.max(...sessionDurations);
    const shortestSession = Math.min(...sessionDurations);

    // Count connection methods
    const connectionMethods: Record<string, number> = {};
    walletSessions.forEach((s) => {
      connectionMethods[s.connectionMethod] = (connectionMethods[s.connectionMethod] || 0) + 1;
    });

    // Find most active chain
    const chainCounts: Record<number, number> = {};
    walletSessions.forEach((s) => {
      chainCounts[s.chainId] = (chainCounts[s.chainId] || 0) + 1;
    });
    const mostActiveChain = parseInt(
      Object.entries(chainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '1'
    );

    // Calculate peak hours (0-23)
    const hourCounts: Record<number, number> = {};
    walletSessions.forEach((s) => {
      const hour = new Date(s.connectedAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate peak days
    const dayCounts: Record<string, number> = {};
    walletSessions.forEach((s) => {
      const day = new Date(s.connectedAt).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const peakDays = Object.entries(dayCounts)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Calculate averages
    const totalActions = walletSessions.reduce((sum, s) => sum + s.actionsPerformed, 0);
    const averageActionsPerSession = totalActions / walletSessions.length;
    const totalTransactions = walletSessions.reduce((sum, s) => sum + s.transactionsInitiated, 0);
    const totalScans = walletSessions.reduce((sum, s) => sum + s.scansPerformed, 0);

    // Determine connection frequency
    const sortedSessions = walletSessions.sort((a, b) => a.connectedAt - b.connectedAt);
    const firstConnected = sortedSessions[0].connectedAt;
    const lastConnected = sortedSessions[sortedSessions.length - 1].connectedAt;
    const daysBetween = (lastConnected - firstConnected) / (1000 * 60 * 60 * 24);
    const sessionsPerDay = walletSessions.length / Math.max(daysBetween, 1);

    let connectionFrequency: ConnectionAnalytics['connectionFrequency'];
    if (sessionsPerDay >= 1) {
      connectionFrequency = 'daily';
    } else if (sessionsPerDay >= 0.14) {
      connectionFrequency = 'weekly';
    } else if (sessionsPerDay >= 0.03) {
      connectionFrequency = 'monthly';
    } else {
      connectionFrequency = 'sporadic';
    }

    return {
      totalSessions: walletSessions.length,
      totalDuration,
      averageSessionDuration: Math.floor(averageSessionDuration),
      longestSession,
      shortestSession,
      mostActiveChain,
      connectionMethods,
      peakHours,
      peakDays,
      averageActionsPerSession: Math.round(averageActionsPerSession * 100) / 100,
      totalTransactions,
      totalScans,
      connectionFrequency,
      lastConnectedAt: lastConnected,
      firstConnectedAt: firstConnected,
    };
  }

  /**
   * Get all sessions for a wallet
   */
  getSessions(walletAddress: string): ConnectionSession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  /**
   * Get current active sessions
   */
  getActiveSessions(walletAddress?: string): ConnectionSession[] {
    const sessions = Array.from(this.currentSessions.values());
    if (walletAddress) {
      return sessions.filter(
        (s) => s.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );
    }
    return sessions;
  }

  /**
   * Clear old sessions (older than specified days)
   */
  clearOldSessions(daysToKeep: number = 90): number {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    let cleared = 0;

    this.sessions.forEach((session, id) => {
      if (session.connectedAt < cutoffTime) {
        this.sessions.delete(id);
        cleared++;
      }
    });

    return cleared;
  }

  /**
   * Export analytics data
   */
  exportData(walletAddress: string): {
    analytics: ConnectionAnalytics;
    sessions: ConnectionSession[];
  } | null {
    const analytics = this.getAnalytics(walletAddress);
    if (!analytics) return null;

    return {
      analytics,
      sessions: this.getSessions(walletAddress),
    };
  }
}

// Singleton instance
export const walletConnectionAnalytics = new WalletConnectionAnalytics();

