/**
 * Activity Heatmap Generator
 * Generates activity heatmaps for wallet transactions
 */

export interface ActivityData {
  timestamp: number;
  type: 'transfer' | 'swap' | 'approval' | 'contract_interaction' | 'other';
  value?: string;
  chainId: number;
}

export interface HeatmapCell {
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  count: number;
  value: string; // Total value
  valueUSD?: number;
  intensity: number; // 0-100 for visualization
}

export interface HeatmapData {
  cells: HeatmapCell[][]; // [day][hour]
  summary: {
    totalActivities: number;
    busiestDay: string;
    busiestHour: number;
    totalValue: string;
    totalValueUSD?: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export interface ActivityStats {
  busiestDay: string;
  busiestHour: number;
  averagePerDay: number;
  averagePerHour: number;
  peakActivity: {
    date: string;
    hour: number;
    count: number;
  };
}

export class ActivityHeatmapGenerator {
  /**
   * Generate heatmap data from activities
   */
  generateHeatmap(
    activities: ActivityData[],
    days: number = 30
  ): HeatmapData {
    if (activities.length === 0) {
      return {
        cells: [],
        summary: {
          totalActivities: 0,
          busiestDay: '',
          busiestHour: 0,
          totalValue: '0',
          dateRange: {
            start: '',
            end: '',
          },
        },
      };
    }

    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    // Filter activities within date range
    const filteredActivities = activities.filter(
      a => a.timestamp >= startDate && a.timestamp <= now
    );

    // Initialize cells map
    const cellsMap = new Map<string, {
      count: number;
      value: bigint;
      valueUSD: number;
    }>();

    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dateKey = date.toISOString().split('T')[0];
      const hour = date.getHours();
      const cellKey = `${dateKey}-${hour}`;

      if (!cellsMap.has(cellKey)) {
        cellsMap.set(cellKey, {
          count: 0,
          value: BigInt(0),
          valueUSD: 0,
        });
      }

      const cell = cellsMap.get(cellKey)!;
      cell.count++;
      if (activity.value) {
        cell.value += BigInt(activity.value);
      }
      // Would calculate USD value from price data
    });

    // Build 2D array structure
    const dateSet = new Set<string>();
    filteredActivities.forEach(a => {
      const date = new Date(a.timestamp).toISOString().split('T')[0];
      dateSet.add(date);
    });

    const sortedDates = Array.from(dateSet).sort();
    const cells: HeatmapCell[][] = [];

    // Find max count for intensity calculation
    let maxCount = 0;
    cellsMap.forEach(cell => {
      if (cell.count > maxCount) {
        maxCount = cell.count;
      }
    });

    sortedDates.forEach(date => {
      const dayCells: HeatmapCell[] = [];
      for (let hour = 0; hour < 24; hour++) {
        const cellKey = `${date}-${hour}`;
        const cellData = cellsMap.get(cellKey);

        if (cellData) {
          dayCells.push({
            date,
            hour,
            count: cellData.count,
            value: cellData.value.toString(),
            valueUSD: cellData.valueUSD,
            intensity: maxCount > 0 ? Math.round((cellData.count / maxCount) * 100) : 0,
          });
        } else {
          dayCells.push({
            date,
            hour,
            count: 0,
            value: '0',
            intensity: 0,
          });
        }
      }
      cells.push(dayCells);
    });

    // Calculate summary
    const totalActivities = filteredActivities.length;
    const totalValue = filteredActivities.reduce(
      (sum, a) => sum + BigInt(a.value || '0'),
      BigInt(0)
    ).toString();

    // Find busiest day and hour
    let busiestDay = '';
    let busiestHour = 0;
    let maxCellCount = 0;

    cellsMap.forEach((cell, key) => {
      if (cell.count > maxCellCount) {
        maxCellCount = cell.count;
        const [date, hour] = key.split('-');
        busiestDay = date;
        busiestHour = parseInt(hour);
      }
    });

    return {
      cells,
      summary: {
        totalActivities,
        busiestDay,
        busiestHour,
        totalValue,
        dateRange: {
          start: sortedDates[0] || '',
          end: sortedDates[sortedDates.length - 1] || '',
        },
      },
    };
  }

  /**
   * Generate activity statistics
   */
  generateStats(activities: ActivityData[]): ActivityStats {
    if (activities.length === 0) {
      return {
        busiestDay: '',
        busiestHour: 0,
        averagePerDay: 0,
        averagePerHour: 0,
        peakActivity: {
          date: '',
          hour: 0,
          count: 0,
        },
      };
    }

    // Group by day and hour
    const dayCounts = new Map<string, number>();
    const hourCounts = new Map<number, number>();
    const dayHourCounts = new Map<string, number>();

    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dateKey = date.toISOString().split('T')[0];
      const hour = date.getHours();
      const dayHourKey = `${dateKey}-${hour}`;

      dayCounts.set(dateKey, (dayCounts.get(dateKey) || 0) + 1);
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      dayHourCounts.set(dayHourKey, (dayHourCounts.get(dayHourKey) || 0) + 1);
    });

    // Find busiest day
    let busiestDay = '';
    let maxDayCount = 0;
    dayCounts.forEach((count, day) => {
      if (count > maxDayCount) {
        maxDayCount = count;
        busiestDay = day;
      }
    });

    // Find busiest hour
    let busiestHour = 0;
    let maxHourCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxHourCount) {
        maxHourCount = count;
        busiestHour = hour;
      }
    });

    // Find peak activity
    let peakDate = '';
    let peakHour = 0;
    let peakCount = 0;
    dayHourCounts.forEach((count, key) => {
      if (count > peakCount) {
        peakCount = count;
        const [date, hour] = key.split('-');
        peakDate = date;
        peakHour = parseInt(hour);
      }
    });

    // Calculate averages
    const uniqueDays = dayCounts.size;
    const averagePerDay = uniqueDays > 0 ? activities.length / uniqueDays : 0;
    const averagePerHour = activities.length / 24;

    return {
      busiestDay,
      busiestHour,
      averagePerDay: Math.round(averagePerDay * 100) / 100,
      averagePerHour: Math.round(averagePerHour * 100) / 100,
      peakActivity: {
        date: peakDate,
        hour: peakHour,
        count: peakCount,
      },
    };
  }

  /**
   * Get activity distribution by type
   */
  getActivityDistribution(activities: ActivityData[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    activities.forEach(activity => {
      distribution[activity.type] = (distribution[activity.type] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Get activity distribution by chain
   */
  getChainDistribution(activities: ActivityData[]): Record<number, number> {
    const distribution: Record<number, number> = {};

    activities.forEach(activity => {
      distribution[activity.chainId] = (distribution[activity.chainId] || 0) + 1;
    });

    return distribution;
  }
}

// Singleton instance
export const activityHeatmapGenerator = new ActivityHeatmapGenerator();
