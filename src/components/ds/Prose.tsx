import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ProseProps {
  children: ReactNode;
  className?: string;
  maxWidth?: number;
}

export function Prose({ children, className, maxWidth = 720 }: ProseProps) {
  return (
    <div
      className={cn('ds-prose', className)}
      style={{ maxWidth, lineHeight: 1.65 }}
    >
      {children}
    </div>
  );
}
