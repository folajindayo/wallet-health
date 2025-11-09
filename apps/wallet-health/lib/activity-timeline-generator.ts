/**
 * Activity Timeline Generator Utility
 * Generates visual timeline of wallet activities
 */

export interface TimelineEvent {
  id: string;
  timestamp: number;
  type: 'transfer' | 'approval' | 'swap' | 'contract_call' | 'nft' | 'defi' | 'governance';
  title: string;
  description: string;
  from?: string;
  to?: string;
  value?: string;
  valueUSD?: number;
  token?: string;
  tokenSymbol?: string;
  chainId: number;
  transactionHash?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  category: string;
  metadata?: Record<string, any>;
}

export interface TimelinePeriod {
  start: number;
  end: number;
  events: TimelineEvent[];
  summary: {
    totalEvents: number;
    totalValueUSD: number;
    eventTypes: Record<string, number>;
    riskEvents: number;
  };
}

export interface TimelineView {
  events: TimelineEvent[];
  periods: TimelinePeriod[];
  totalEvents: number;
  dateRange: {
    start: number;
    end: number;
  };
  statistics: {
    byType: Record<string, number>;
    byChain: Record<number, number>;
    byRisk: Record<string, number>;
    totalValueUSD: number;
  };
}

export class ActivityTimelineGenerator {
  /**
   * Generate timeline from events
   */
  generateTimeline(
    events: TimelineEvent[],
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): TimelineView {
    if (events.length === 0) {
      return {
        events: [],
        periods: [],
        totalEvents: 0,
        dateRange: { start: Date.now(), end: Date.now() },
        statistics: {
          byType: {},
          byChain: {},
          byRisk: {},
          totalValueUSD: 0,
        },
      };
    }

    // Sort events by timestamp
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

    // Calculate date range
    const timestamps = sortedEvents.map(e => e.timestamp);
    const start = Math.min(...timestamps);
    const end = Math.max(...timestamps);

    // Group events into periods
    const periods = this.groupEventsIntoPeriods(sortedEvents, groupBy);

    // Calculate statistics
    const statistics = this.calculateStatistics(sortedEvents);

    return {
      events: sortedEvents,
      periods,
      totalEvents: sortedEvents.length,
      dateRange: { start, end },
      statistics,
    };
  }

  /**
   * Group events into periods
   */
  private groupEventsIntoPeriods(
    events: TimelineEvent[],
    groupBy: 'day' | 'week' | 'month'
  ): TimelinePeriod[] {
    const periods: TimelinePeriod[] = [];
    const periodMap = new Map<number, TimelineEvent[]>();

    // Determine period duration
    const periodDuration = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    }[groupBy];

    // Group events by period
    events.forEach(event => {
      const periodStart = Math.floor(event.timestamp / periodDuration) * periodDuration;
      
      if (!periodMap.has(periodStart)) {
        periodMap.set(periodStart, []);
      }
      periodMap.get(periodStart)!.push(event);
    });

    // Create period objects
    periodMap.forEach((periodEvents, periodStart) => {
      const periodEnd = periodStart + periodDuration;
      
      // Calculate summary
      const totalValueUSD = periodEvents.reduce(
        (sum, e) => sum + (e.valueUSD || 0),
        0
      );

      const eventTypes: Record<string, number> = {};
      periodEvents.forEach(e => {
        eventTypes[e.type] = (eventTypes[e.type] || 0) + 1;
      });

      const riskEvents = periodEvents.filter(e => e.riskLevel === 'high').length;

      periods.push({
        start: periodStart,
        end: periodEnd,
        events: periodEvents.sort((a, b) => a.timestamp - b.timestamp),
        summary: {
          totalEvents: periodEvents.length,
          totalValueUSD,
          eventTypes,
          riskEvents,
        },
      });
    });

    // Sort periods by start time
    periods.sort((a, b) => a.start - b.start);

    return periods;
  }

  /**
   * Calculate statistics
   */
  private calculateStatistics(events: TimelineEvent[]): TimelineView['statistics'] {
    const byType: Record<string, number> = {};
    const byChain: Record<number, number> = {};
    const byRisk: Record<string, number> = {};
    let totalValueUSD = 0;

    events.forEach(event => {
      // Count by type
      byType[event.type] = (byType[event.type] || 0) + 1;

      // Count by chain
      byChain[event.chainId] = (byChain[event.chainId] || 0) + 1;

      // Count by risk
      const risk = event.riskLevel || 'unknown';
      byRisk[risk] = (byRisk[risk] || 0) + 1;

      // Sum value
      totalValueUSD += event.valueUSD || 0;
    });

    return {
      byType,
      byChain,
      byRisk,
      totalValueUSD,
    };
  }

  /**
   * Filter timeline by date range
   */
  filterByDateRange(
    timeline: TimelineView,
    startDate: number,
    endDate: number
  ): TimelineView {
    const filteredEvents = timeline.events.filter(
      e => e.timestamp >= startDate && e.timestamp <= endDate
    );

    return this.generateTimeline(filteredEvents);
  }

  /**
   * Filter timeline by event type
   */
  filterByType(
    timeline: TimelineView,
    types: TimelineEvent['type'][]
  ): TimelineView {
    const filteredEvents = timeline.events.filter(e => types.includes(e.type));
    return this.generateTimeline(filteredEvents);
  }

  /**
   * Filter timeline by risk level
   */
  filterByRisk(
    timeline: TimelineView,
    riskLevels: Array<'low' | 'medium' | 'high'>
  ): TimelineView {
    const filteredEvents = timeline.events.filter(
      e => e.riskLevel && riskLevels.includes(e.riskLevel)
    );
    return this.generateTimeline(filteredEvents);
  }

  /**
   * Get timeline summary
   */
  getSummary(timeline: TimelineView): {
    totalEvents: number;
    dateRange: string;
    mostActiveDay: string;
    mostActiveType: string;
    totalValue: number;
    riskEvents: number;
  } {
    const mostActiveType = Object.entries(timeline.statistics.byType)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

    // Find most active day
    const dayCounts = new Map<number, number>();
    timeline.events.forEach(e => {
      const day = Math.floor(e.timestamp / (24 * 60 * 60 * 1000));
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });

    const mostActiveDayEntry = Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];

    const mostActiveDay = mostActiveDayEntry
      ? new Date(mostActiveDayEntry[0] * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : 'N/A';

    const riskEvents = timeline.statistics.byRisk.high || 0;

    return {
      totalEvents: timeline.totalEvents,
      dateRange: `${new Date(timeline.dateRange.start).toLocaleDateString()} - ${new Date(timeline.dateRange.end).toLocaleDateString()}`,
      mostActiveDay,
      mostActiveType,
      totalValue: timeline.statistics.totalValueUSD,
      riskEvents,
    };
  }

  /**
   * Export timeline as JSON
   */
  exportAsJSON(timeline: TimelineView): string {
    return JSON.stringify(timeline, null, 2);
  }

  /**
   * Export timeline as CSV
   */
  exportAsCSV(timeline: TimelineView): string {
    const headers = [
      'Timestamp',
      'Date',
      'Type',
      'Title',
      'Description',
      'Value (USD)',
      'Token',
      'Chain ID',
      'Risk Level',
      'Transaction Hash',
    ];

    const rows = timeline.events.map(event => [
      event.timestamp.toString(),
      new Date(event.timestamp).toISOString(),
      event.type,
      event.title,
      event.description,
      (event.valueUSD || 0).toString(),
      event.tokenSymbol || '',
      event.chainId.toString(),
      event.riskLevel || 'unknown',
      event.transactionHash || '',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

// Singleton instance
export const activityTimelineGenerator = new ActivityTimelineGenerator();

