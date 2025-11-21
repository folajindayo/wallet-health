/**
 * StatCard Component
 */

'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export function StatCard({ label, value, icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      
      <div className="flex items-end justify-between">
        <span className={`text-3xl font-bold text-${color}-600`}>{value}</span>
        
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}

