/**
 * InfoPanel Component
 */

'use client';

interface InfoPanelProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
}

export function InfoPanel({ title, children, icon }: InfoPanelProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-2">{title}</h4>
          <div className="text-sm text-blue-800">{children}</div>
        </div>
      </div>
    </div>
  );
}

