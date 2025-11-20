/**
 * Percentage Calculator
 */

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function calculateChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

export function distributeByPercentage(
  total: number,
  percentages: number[]
): number[] {
  return percentages.map((pct) => (total * pct) / 100);
}

