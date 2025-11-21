/**
 * ScoreGauge Component
 */

'use client';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreGauge({ score, maxScore = 100, size = 'md' }: ScoreGaugeProps) {
  const percentage = (score / maxScore) * 100;
  
  const getColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const sizeClasses = {
    sm: 'w-24 h-24 text-lg',
    md: 'w-32 h-32 text-2xl',
    lg: 'w-40 h-40 text-3xl',
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <svg className="transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-gray-200"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={`${percentage * 2.827} 283`}
          className={getColor()}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${getColor()}`}>{score}</span>
      </div>
    </div>
  );
}

