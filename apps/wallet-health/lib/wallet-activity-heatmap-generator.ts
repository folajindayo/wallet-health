/**
 * Wallet Activity Heatmap Generator Utility
 * Generate visual heatmap of wallet activity
 */

export interface HeatmapDataPoint {
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  transactionCount: number;
  totalValue: number; // USD
  intensity: number; // 0-100
}

export interface HeatmapData {
  walletAddress: string;
  period: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
  data: HeatmapDataPoint[];
  statistics: {
    totalTransactions: number;
    totalValue: number; // USD
    averagePerDay: number;
    peakHour: number;
    peakDay: string;
    mostActiveDay: string;
  };
}

export class WalletActivityHeatmapGenerator {
  /**
   * Generate heatmap data
   */
  generateHeatmap(
    walletAddress: string,
    transactions: Array<{
      timestamp: number;
      value: number; // USD
    }>,
    days = 30
  ): HeatmapData {
    const now = Date.now();
    const startDate = new Date(now - days * 24 * 60 * 60 * 1000);
    const endDate = new Date(now);

    // Initialize data structure
    const dataMap = new Map<string, Map<number, { count: number; value: number }>>();

    // Process transactions
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      const dateStr = date.toISOString().split('T')[0];
      const hour = date.getHours();

      if (!dataMap.has(dateStr)) {
        dataMap.set(dateStr, new Map());
      }

      const hourMap = dataMap.get(dateStr)!;
      if (!hourMap.has(hour)) {
        hourMap.set(hour, { count: 0, value: 0 });
      }

      const data = hourMap.get(hour)!;
      data.count++;
      data.value += tx.value;
    });

    // Convert to array and calculate intensity
    const data: HeatmapDataPoint[] = [];
    let maxCount = 0;
    let maxValue = 0;

    dataMap.forEach((hourMap, dateStr) => {
      hourMap.forEach((stats, hour) => {
        maxCount = Math.max(maxCount, stats.count);
        maxValue = Math.max(maxValue, stats.value);
      });
    });

    dataMap.forEach((hourMap, dateStr) => {
      hourMap.forEach((stats, hour) => {
        // Calculate intensity (0-100) based on count and value
        const countIntensity = maxCount > 0 ? (stats.count / maxCount) * 50 : 0;
        const valueIntensity = maxValue > 0 ? (stats.value / maxValue) * 50 : 0;
        const intensity = Math.min(100, countIntensity + valueIntensity);

        data.push({
          date: dateStr,
          hour,
          transactionCount: stats.count,
          totalValue: Math.round(stats.value * 100) / 100,
          intensity: Math.round(intensity * 100) / 100,
        });
      });
    });

    // Calculate statistics
    const totalTransactions = transactions.length;
    const totalValue = transactions.reduce((sum, tx) => sum + tx.value, 0);
    const averagePerDay = totalTransactions / days;

    // Find peak hour
    const hourCounts = new Map<number, number>();
    transactions.forEach(tx => {
      const hour = new Date(tx.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    const peakHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 12;

    // Find peak day
    const dayCounts = new Map<string, number>();
    transactions.forEach(tx => {
      const dateStr = new Date(tx.timestamp).toISOString().split('T')[0];
      dayCounts.set(dateStr, (dayCounts.get(dateStr) || 0) + 1);
    });
    const peakDay = Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Find most active day (by value)
    const dayValues = new Map<string, number>();
    transactions.forEach(tx => {
      const dateStr = new Date(tx.timestamp).toISOString().split('T')[0];
      dayValues.set(dateStr, (dayValues.get(dateStr) || 0) + tx.value);
    });
    const mostActiveDay = Array.from(dayValues.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return {
      walletAddress,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      data: data.sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.hour - b.hour;
      }),
      statistics: {
        totalTransactions,
        totalValue: Math.round(totalValue * 100) / 100,
        averagePerDay: Math.round(averagePerDay * 100) / 100,
        peakHour,
        peakDay,
        mostActiveDay,
      },
    };
  }

  /**
   * Generate heatmap for specific period
   */
  generateHeatmapForPeriod(
    walletAddress: string,
    transactions: Array<{ timestamp: number; value: number }>,
    startDate: Date,
    endDate: Date
  ): HeatmapData {
    const filtered = transactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      return txDate >= startDate && txDate <= endDate;
    });

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    return this.generateHeatmap(walletAddress, filtered, days);
  }

  /**
   * Get heatmap color intensity
   */
  getColorIntensity(intensity: number): string {
    // Returns color based on intensity (0-100)
    if (intensity >= 80) {
      return '#ff0000'; // Red - high activity
    } else if (intensity >= 60) {
      return '#ff6600'; // Orange
    } else if (intensity >= 40) {
      return '#ffcc00'; // Yellow
    } else if (intensity >= 20) {
      return '#ccff00'; // Light green
    } else {
      return '#66ff00'; // Green - low activity
    }
  }

  /**
   * Export heatmap as CSV
   */
  exportAsCSV(heatmapData: HeatmapData): string {
    const lines: string[] = [];
    lines.push('Date,Hour,Transaction Count,Total Value (USD),Intensity');
    
    heatmapData.data.forEach(point => {
      lines.push(`${point.date},${point.hour},${point.transactionCount},${point.totalValue},${point.intensity}`);
    });

    return lines.join('\n');
  }
}

// Singleton instance
export const walletActivityHeatmapGenerator = new WalletActivityHeatmapGenerator();

