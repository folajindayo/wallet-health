/**
 * Wallet Activity Heatmap Generator Utility
 * Generates activity heatmaps for wallet transactions
 */

export interface ActivityData {
  timestamp: number;
  type: 'transfer' | 'approval' | 'swap' | 'contract_call' | 'nft';
  value?: number; // in USD
  chainId: number;
}

export interface HeatmapCell {
  day: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  count: number;
  totalValue: number;
  intensity: number; // 0-100
}

export interface HeatmapData {
  cells: HeatmapCell[][];
  maxCount: number;
  maxValue: number;
  totalActivities: number;
  period: {
    start: number;
    end: number;
  };
}

export interface ActivityStats {
  totalActivities: number;
  activitiesByDay: Record<string, number>;
  activitiesByHour: Record<string, number>;
  activitiesByType: Record<string, number>;
  busiestDay: string;
  busiestHour: number;
  averagePerDay: number;
  averagePerHour: number;
}

export class ActivityHeatmapGenerator {
  /**
   * Generate heatmap data from activity data
   */
  generateHeatmap(activities: ActivityData[], days = 7): HeatmapData {
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;

    // Filter activities within time range
    const filteredActivities = activities.filter(
      a => a.timestamp >= startTime && a.timestamp <= now
    );

    // Initialize 7x24 grid (7 days, 24 hours)
    const cells: HeatmapCell[][] = [];
    for (let day = 0; day < 7; day++) {
      cells[day] = [];
      for (let hour = 0; hour < 24; hour++) {
        cells[day][hour] = {
          day,
          hour,
          count: 0,
          totalValue: 0,
          intensity: 0,
        };
      }
    }

    // Populate cells
    let maxCount = 0;
    let maxValue = 0;

    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const day = date.getDay(); // 0-6
      const hour = date.getHours(); // 0-23

      const cell = cells[day][hour];
      cell.count++;
      cell.totalValue += activity.value || 0;

      maxCount = Math.max(maxCount, cell.count);
      maxValue = Math.max(maxValue, cell.totalValue);
    });

    // Calculate intensity (0-100)
    cells.forEach(dayRow => {
      dayRow.forEach(cell => {
        if (maxCount > 0) {
          cell.intensity = Math.round((cell.count / maxCount) * 100);
        }
      });
    });

    return {
      cells,
      maxCount,
      maxValue,
      totalActivities: filteredActivities.length,
      period: {
        start: startTime,
        end: now,
      },
    };
  }

  /**
   * Generate activity statistics
   */
  generateStats(activities: ActivityData[]): ActivityStats {
    const activitiesByDay: Record<string, number> = {};
    const activitiesByHour: Record<string, number> = {};
    const activitiesByType: Record<string, number> = {};

    let maxDayCount = 0;
    let busiestDay = '';
    let maxHourCount = 0;
    let busiestHour = 0;

    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();

      // Count by day
      activitiesByDay[dayName] = (activitiesByDay[dayName] || 0) + 1;
      if (activitiesByDay[dayName] > maxDayCount) {
        maxDayCount = activitiesByDay[dayName];
        busiestDay = dayName;
      }

      // Count by hour
      activitiesByHour[hour.toString()] = (activitiesByHour[hour.toString()] || 0) + 1;
      if (activitiesByHour[hour.toString()] > maxHourCount) {
        maxHourCount = activitiesByHour[hour.toString()];
        busiestHour = hour;
      }

      // Count by type
      activitiesByType[activity.type] = (activitiesByType[activity.type] || 0) + 1;
    });

    const totalDays = Object.keys(activitiesByDay).length || 1;
    const averagePerDay = activities.length / totalDays;
    const averagePerHour = activities.length / 24;

    return {
      totalActivities: activities.length,
      activitiesByDay,
      activitiesByHour,
      activitiesByType,
      busiestDay,
      busiestHour,
      averagePerDay: Math.round(averagePerDay * 100) / 100,
      averagePerHour: Math.round(averagePerHour * 100) / 100,
    };
  }

  /**
   * Generate heatmap for specific time range
   */
  generateHeatmapForRange(
    activities: ActivityData[],
    startTime: number,
    endTime: number
  ): HeatmapData {
    const filtered = activities.filter(
      a => a.timestamp >= startTime && a.timestamp <= endTime
    );

    // Calculate number of days
    const days = Math.ceil((endTime - startTime) / (24 * 60 * 60 * 1000));
    return this.generateHeatmap(filtered, days);
  }

  /**
   * Get activity distribution by day of week
   */
  getDayDistribution(activities: ActivityData[]): Record<string, number> {
    const distribution: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      distribution[dayName]++;
    });

    return distribution;
  }

  /**
   * Get activity distribution by hour
   */
  getHourDistribution(activities: ActivityData[]): number[] {
    const distribution = new Array(24).fill(0);

    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const hour = date.getHours();
      distribution[hour]++;
    });

    return distribution;
  }

  /**
   * Detect activity patterns
   */
  detectPatterns(activities: ActivityData[]): {
    isRegular: boolean;
    peakHours: number[];
    quietHours: number[];
    weekdayActivity: number;
    weekendActivity: number;
  } {
    const hourDistribution = this.getHourDistribution(activities);
    const dayDistribution = this.getDayDistribution(activities);

    // Find peak hours (top 25%)
    const sortedHours = hourDistribution
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count);
    const peakThreshold = sortedHours[Math.floor(sortedHours.length * 0.25)].count;
    const peakHours = sortedHours
      .filter(h => h.count >= peakThreshold)
      .map(h => h.hour);

    // Find quiet hours (bottom 25%)
    const quietThreshold = sortedHours[Math.floor(sortedHours.length * 0.75)].count;
    const quietHours = sortedHours
      .filter(h => h.count <= quietThreshold)
      .map(h => h.hour);

    // Calculate weekday vs weekend activity
    const weekdayActivity =
      (dayDistribution.Monday || 0) +
      (dayDistribution.Tuesday || 0) +
      (dayDistribution.Wednesday || 0) +
      (dayDistribution.Thursday || 0) +
      (dayDistribution.Friday || 0);

    const weekendActivity =
      (dayDistribution.Saturday || 0) + (dayDistribution.Sunday || 0);

    // Determine if activity is regular (consistent pattern)
    const variance = this.calculateVariance(hourDistribution);
    const isRegular = variance < 100; // Threshold for regularity

    return {
      isRegular,
      peakHours,
      quietHours,
      weekdayActivity,
      weekendActivity,
    };
  }

  /**
   * Calculate variance of distribution
   */
  private calculateVariance(distribution: number[]): number {
    const mean = distribution.reduce((sum, val) => sum + val, 0) / distribution.length;
    const variance =
      distribution.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      distribution.length;
    return variance;
  }
}

// Singleton instance
export const activityHeatmapGenerator = new ActivityHeatmapGenerator();

