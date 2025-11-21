/**
 * ThreatAlert Component
 */

'use client';

interface ThreatAlertProps {
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ALERT_STYLES = {
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  danger: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const ICONS = {
  warning: '⚠️',
  danger: '🚨',
  info: 'ℹ️',
};

export function ThreatAlert({ type, title, description, action }: ThreatAlertProps) {
  return (
    <div className={`p-4 rounded-lg border ${ALERT_STYLES[type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{ICONS[type]}</span>
        <div className="flex-1">
          <h3 className="font-bold mb-1">{title}</h3>
          <p className="text-sm mb-3">{description}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium underline hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

