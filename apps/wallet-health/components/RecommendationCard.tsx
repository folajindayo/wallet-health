/**
 * RecommendationCard Component
 */

'use client';

interface RecommendationCardProps {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const PRIORITY_STYLES = {
  high: 'border-red-200 bg-red-50',
  medium: 'border-yellow-200 bg-yellow-50',
  low: 'border-blue-200 bg-blue-50',
};

const PRIORITY_ICONS = {
  high: '🔴',
  medium: '🟡',
  low: '🔵',
};

export function RecommendationCard({
  priority,
  title,
  description,
  action,
}: RecommendationCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${PRIORITY_STYLES[priority]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{PRIORITY_ICONS[priority]}</span>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm text-gray-700 mb-3">{description}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

