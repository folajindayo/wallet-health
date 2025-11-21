/**
 * Comparison Utilities
 */

export function compareScores(score1: number, score2: number): number {
  return score2 - score1;
}

export function isScoreImproving(current: number, previous: number): boolean {
  return current > previous;
}

export function calculateScoreChange(current: number, previous: number): {
  change: number;
  percentage: number;
  isPositive: boolean;
} {
  const change = current - previous;
  const percentage = previous === 0 ? 0 : (change / previous) * 100;
  
  return {
    change,
    percentage: Math.round(percentage),
    isPositive: change >= 0,
  };
}

