/**
 * RiskBadge Component
 */

'use client';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
}

export function RiskBadge({ level, score }: RiskBadgeProps) {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[level]}`}>
      {level.toUpperCase()} - {score}%
    </span>
  );
}

