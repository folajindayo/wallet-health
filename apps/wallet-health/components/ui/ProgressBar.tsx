/**
 * ProgressBar Component
 */

'use client';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

export function ProgressBar({ value, max = 100, color = 'blue' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${colors[color]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

