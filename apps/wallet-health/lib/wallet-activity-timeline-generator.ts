/**
 * Wallet Activity Timeline Generator
 * Generates comprehensive activity timelines with risk annotations
 */

export interface TimelineEvent {
  id: string;
  type: 'transaction' | 'approval' | 'token_received' | 'nft_received' | 'contract_interaction' | 'risk_event';
  timestamp: number;
  title: string;
  description: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  chainId: number;
  hash?: string;
  from?: string;
  to?: string;
  value?: string;
  tokenAddress?: string;
  metadata?: Record<string, any>;
}

export interface TimelineGroup {
  date: string;
  events: TimelineEvent[];
  summary: {
    totalEvents: number;
    riskEvents: number;
    totalValue: number;
    chains: number[];
  };
}

export interface ActivityTimeline {
  walletAddress: string;
  startDate: number;
  endDate: number;
  groups: TimelineGroup[];
  summary: {
    totalEvents: number;
    totalDays: number;
    riskEvents: number;
    uniqueChains: number;
    totalValueUSD: number;
    peakActivityDay: string;
    riskDistribution: Record<string, number>;
  };
  insights: string[];
}

export class WalletActivityTimelineGenerator {
  /**
   * Generate timeline from events
   */
  generateTimeline(params: {
    walletAddress: string;
    events: Array<{
      type: TimelineEvent['type'];
      timestamp: number;
      title: string;
      description: string;
      riskLevel?: TimelineEvent['riskLevel'];
      chainId: number;
      hash?: string;
      from?: string;
      to?: string;
      value?: string;
      tokenAddress?: string;
      metadata?: Record<string, any>;
    }>;
  }): ActivityTimeline {
    const { walletAddress, events } = params;

    if (events.length === 0) {
      return {
        walletAddress,
        startDate: Date.now(),
        endDate: Date.now(),
        groups: [],
        summary: {
          totalEvents: 0,
          totalDays: 0,
          riskEvents: 0,
          uniqueChains: 0,
          totalValueUSD: 0,
          peakActivityDay: '',
          riskDistribution: {},
        },
        insights: [],
      };
    }

    // Sort events by timestamp
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

    const startDate = sortedEvents[0].timestamp;
    const endDate = sortedEvents[sortedEvents.length - 1].timestamp;
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Convert to timeline events
    const timelineEvents: TimelineEvent[] = sortedEvents.map((event, index) => ({
      id: `${event.hash || event.timestamp}-${index}`,
      ...event,
    }));

    // Group by date
    const groups = this.groupByDate(timelineEvents);

    // Calculate summary
    const summary = this.calculateSummary(timelineEvents, groups, startDate, endDate);

    // Generate insights
    const insights = this.generateInsights(timelineEvents, groups, summary);

    return {
      walletAddress,
      startDate,
      endDate,
      groups,
      summary,
      insights,
    };
  }

  /**
   * Group events by date
   */
  private groupByDate(events: TimelineEvent[]): TimelineGroup[] {
    const groupsMap = new Map<string, TimelineEvent[]>();

    events.forEach((event) => {
      const date = new Date(event.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groupsMap.has(date)) {
        groupsMap.set(date, []);
      }
      groupsMap.get(date)!.push(event);
    });

    const groups: TimelineGroup[] = [];

    groupsMap.forEach((events, date) => {
      // Calculate group summary
      const riskEvents = events.filter((e) => e.riskLevel).length;
      const totalValue = events.reduce((sum, e) => {
        if (e.value) {
          const valueEth = parseFloat(e.value) / 1e18;
          return sum + valueEth * 2000; // Rough USD estimate
        }
        return sum;
      }, 0);
      const chains = [...new Set(events.map((e) => e.chainId))];

      groups.push({
        date,
        events: events.sort((a, b) => b.timestamp - a.timestamp), // Most recent first
        summary: {
          totalEvents: events.length,
          riskEvents,
          totalValue: Math.round(totalValue * 100) / 100,
          chains,
        },
      });
    });

    // Sort groups by date (newest first)
    return groups.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }

  /**
   * Calculate summary
   */
  private calculateSummary(
    events: TimelineEvent[],
    groups: TimelineGroup[],
    startDate: number,
    endDate: number
  ): ActivityTimeline['summary'] {
    const riskEvents = events.filter((e) => e.riskLevel).length;
    const uniqueChains = new Set(events.map((e) => e.chainId)).size;
    const totalValueUSD = events.reduce((sum, e) => {
      if (e.value) {
        const valueEth = parseFloat(e.value) / 1e18;
        return sum + valueEth * 2000;
      }
      return sum;
    }, 0);

    // Find peak activity day
    const peakGroup = groups.reduce((max, group) =>
      group.summary.totalEvents > max.summary.totalEvents ? group : max
    );

    // Risk distribution
    const riskDistribution: Record<string, number> = {};
    events.forEach((e) => {
      if (e.riskLevel) {
        riskDistribution[e.riskLevel] = (riskDistribution[e.riskLevel] || 0) + 1;
      }
    });

    return {
      totalEvents: events.length,
      totalDays: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
      riskEvents,
      uniqueChains,
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      peakActivityDay: peakGroup.date,
      riskDistribution,
    };
  }

  /**
   * Generate insights
   */
  private generateInsights(
    events: TimelineEvent[],
    groups: TimelineGroup[],
    summary: ActivityTimeline['summary']
  ): string[] {
    const insights: string[] = [];

    // Activity level insights
    const avgEventsPerDay = summary.totalEvents / Math.max(summary.totalDays, 1);
    if (avgEventsPerDay > 10) {
      insights.push('High activity level detected - wallet is very active');
    } else if (avgEventsPerDay < 1) {
      insights.push('Low activity level - wallet is mostly dormant');
    }

    // Risk insights
    if (summary.riskEvents > 0) {
      const riskPercent = (summary.riskEvents / summary.totalEvents) * 100;
      if (riskPercent > 20) {
        insights.push(`High percentage of risk events: ${riskPercent.toFixed(1)}%`);
      }
    }

    // Chain diversity
    if (summary.uniqueChains > 3) {
      insights.push(`Active across ${summary.uniqueChains} different chains`);
    }

    // Peak activity
    insights.push(`Peak activity day: ${summary.peakActivityDay}`);

    // Risk distribution
    if (summary.riskDistribution.critical) {
      insights.push(`Critical risk events detected: ${summary.riskDistribution.critical}`);
    }

    // Recent activity
    const recentEvents = events.filter((e) => Date.now() - e.timestamp < 7 * 24 * 60 * 60 * 1000);
    if (recentEvents.length > 0) {
      insights.push(`${recentEvents.length} events in the last 7 days`);
    }

    return insights;
  }

  /**
   * Filter timeline by risk level
   */
  filterByRisk(timeline: ActivityTimeline, riskLevels: Array<'low' | 'medium' | 'high' | 'critical'>): ActivityTimeline {
    const filteredGroups = timeline.groups.map((group) => ({
      ...group,
      events: group.events.filter((e) => e.riskLevel && riskLevels.includes(e.riskLevel)),
    })).filter((group) => group.events.length > 0);

    // Recalculate summary for filtered events
    const allFilteredEvents = filteredGroups.flatMap((g) => g.events);
    const summary = this.calculateSummary(
      allFilteredEvents,
      filteredGroups,
      timeline.startDate,
      timeline.endDate
    );

    return {
      ...timeline,
      groups: filteredGroups,
      summary,
    };
  }

  /**
   * Get events by date range
   */
  getEventsByDateRange(
    timeline: ActivityTimeline,
    startDate: number,
    endDate: number
  ): TimelineEvent[] {
    return timeline.groups
      .flatMap((g) => g.events)
      .filter((e) => e.timestamp >= startDate && e.timestamp <= endDate);
  }
}

// Singleton instance
export const walletActivityTimelineGenerator = new WalletActivityTimelineGenerator();

