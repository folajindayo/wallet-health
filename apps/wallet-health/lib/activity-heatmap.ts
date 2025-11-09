/**
 * Activity Heatmap Generator
 * Generates activity heatmaps for wallet transactions
 */

export interface ActivityData {
  timestamp: number;
  type: 'transfer' | 'swap' | 'approval' | 'contract_interaction' | 'nft';
  chainId: number;
  value?: string;
}

export interface HeatmapCell {
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  count: number;
  value: string; // Total value in native token
  valueUSD?: number;
  intensity: number; // 0-100 for visualization
}

export interface HeatmapData {
  cells: HeatmapCell[][]; // [dayOfWeek][hour]
  summary: {
    totalActivities: number;
    totalValue: string;
    busiestDay: number; // 0-6 (Sunday = 0)
    busiestHour: number; // 0-23
    averagePerDay: number;
    averagePerHour: number;
  };
  period: {
    start: number;
    end: number;
    days: number;
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
    const now = Date.now();
    const start = now - days * 24 * 60 * 60 * 1000;

    // Filter activities within period
    const periodActivities = activities.filter(
      a => a.timestamp >= start && a.timestamp <= now
    );

    // Initialize cells: 7 days x 24 hours
    const cells: HeatmapCell[][] = [];
    for (let day = 0; day < 7; day++) {
      cells[day] = [];
      for (let hour = 0; hour < 24; hour++) {
        cells[day][hour] = {
          date: '', // Will be set when we have actual dates
          hour,
          count: 0,
          value: '0',
          intensity: 0,
        };
      }
    }

    // Aggregate activities by day of week and hour
    periodActivities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dayOfWeek = date.getDay(); // 0-6 (Sunday = 0)
      const hour = date.getHours(); // 0-23

      const cell = cells[dayOfWeek][hour];
      cell.count++;
      cell.value = (BigInt(cell.value) + BigInt(activity.value || '0')).toString();
      cell.date = date.toISOString().split('T')[0];
    });

    // Calculate intensity (normalize to 0-100)
    const maxCount = Math.max(...cells.flat().map(c => c.count));
    cells.forEach(day => {
      day.forEach(cell => {
        cell.intensity = maxCount > 0 ? Math.round((cell.count / maxCount) * 100) : 0;
      });
    });

    // Calculate summary
    const totalActivities = periodActivities.length;
    const totalValue = periodActivities.reduce(
      (sum, a) => sum + BigInt(a.value || '0'),
      BigInt(0)
    ).toString();

    // Find busiest day and hour
    let busiestDay = 0;
    let busiestHour = 0;
    let maxCellCount = 0;

    cells.forEach((day, dayIndex) => {
      day.forEach((cell, hourIndex) => {
        if (cell.count > maxCellCount) {
          maxCellCount = cell.count;
          busiestDay = dayIndex;
          busiestHour = hourIndex;
        }
      });
    });

    const averagePerDay = days > 0 ? totalActivities / days : 0;
    const averagePerHour = days > 0 ? totalActivities / (days * 24) : 0;

    return {
      cells,
      summary: {
        totalActivities,
        totalValue,
        busiestDay,
        busiestHour,
        averagePerDay: Math.round(averagePerDay * 100) / 100,
        averagePerHour: Math.round(averagePerHour * 100) / 100,
      },
      period: {
        start,
        end: now,
        days,
      },
    };
  }

  /**
   * Generate statistics from activities
   */
  generateStats(activities: ActivityData[]): {
    busiestDay: string;
    busiestHour: number;
    totalActivities: number;
    activitiesByDay: Record<string, number>;
    activitiesByHour: Record<number, number>;
    activitiesByType: Record<string, number>;
  } {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const activitiesByDay: Record<string, number> = {};
    const activitiesByHour: Record<number, number> = {};
    const activitiesByType: Record<string, number> = {};

    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dayName = dayNames[date.getDay()];
      const hour = date.getHours();

      activitiesByDay[dayName] = (activitiesByDay[dayName] || 0) + 1;
      activitiesByHour[hour] = (activitiesByHour[hour] || 0) + 1;
      activitiesByType[activity.type] = (activitiesByType[activity.type] || 0) + 1;
    });

    const busiestDay = Object.entries(activitiesByDay).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    const busiestHour = Object.entries(activitiesByHour).sort((a, b) => b[1] - a[1])[0]?.[0] 
      ? parseInt(Object.entries(activitiesByHour).sort((a, b) => b[1] - a[1])[0][0])
      : 0;

    return {
      busiestDay,
      busiestHour,
      totalActivities: activities.length,
      activitiesByDay,
      activitiesByHour,
      activitiesByType,
    };
  }

  /**
   * Compare heatmaps (e.g., week over week)
   */
  compareHeatmaps(
    heatmap1: HeatmapData,
    heatmap2: HeatmapData
  ): {
    difference: number; // Percentage change
    busiestDayChange: number;
    busiestHourChange: number;
    activityChange: number;
  } {
    const activityChange = heatmap1.summary.totalActivities > 0
      ? ((heatmap2.summary.totalActivities - heatmap1.summary.totalActivities) /
          heatmap1.summary.totalActivities) *
        100
      : 0;

    const busiestDayChange = heatmap2.summary.busiestDay - heatmap1.summary.busiestDay;
    const busiestHourChange = heatmap2.summary.busiestHour - heatmap1.summary.busiestHour;

    // Calculate overall difference
    let totalDifference = 0;
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const count1 = heatmap1.cells[day][hour].count;
        const count2 = heatmap2.cells[day][hour].count;
        if (count1 > 0) {
          totalDifference += Math.abs((count2 - count1) / count1);
        } else if (count2 > 0) {
          totalDifference += 1;
        }
      }
    }
    const averageDifference = (totalDifference / (7 * 24)) * 100;

    return {
      difference: Math.round(averageDifference * 100) / 100,
      busiestDayChange,
      busiestHourChange,
      activityChange: Math.round(activityChange * 100) / 100,
    };
  }
}

// Singleton instance
export const activityHeatmapGenerator = new ActivityHeatmapGenerator();

