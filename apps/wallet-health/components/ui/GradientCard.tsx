/**
 * GradientCard Component
 */

'use client';

interface GradientCardProps {
  children: React.ReactNode;
  from?: string;
  to?: string;
  className?: string;
}

export function GradientCard({
  children,
  from = 'blue',
  to = 'purple',
  className = '',
}: GradientCardProps) {
  return (
    <div className={`bg-gradient-to-br from-${from}-500 to-${to}-600 rounded-lg p-6 text-white ${className}`}>
      {children}
    </div>
  );
}

