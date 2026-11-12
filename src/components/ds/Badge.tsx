import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'amber' | 'blue' | 'muted';
  className?: string;
}

export function Badge({ children, variant = 'amber', className }: BadgeProps) {
  const colorMap = {
    amber: 'text-ds-amber',
    blue:  'text-ds-blue',
    muted: 'text-ds-text-muted',
  };
  return (
    <span
      className={cn(
        'font-mono text-[13px] tracking-[0.08em] uppercase',
        colorMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
