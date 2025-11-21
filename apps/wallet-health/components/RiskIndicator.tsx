/**
 * RiskIndicator Component
 */

'use client';

interface RiskIndicatorProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  count?: number;
}

const RISK_CONFIG = {
  low: { color: 'bg-green-500', text: 'Low Risk', textColor: 'text-green-700' },
  medium: { color: 'bg-yellow-500', text: 'Medium Risk', textColor: 'text-yellow-700' },
  high: { color: 'bg-orange-500', text: 'High Risk', textColor: 'text-orange-700' },
  critical: { color: 'bg-red-500', text: 'Critical Risk', textColor: 'text-red-700' },
};

export function RiskIndicator({ level, count }: RiskIndicatorProps) {
  const config = RISK_CONFIG[level];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.color}`} />
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.text}
        {count !== undefined && ` (${count})`}
      </span>
    </div>
  );
}

