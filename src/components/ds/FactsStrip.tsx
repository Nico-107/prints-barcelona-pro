import { cn } from '@/lib/utils';

interface FactItem { value: string; label: string; }

interface FactsStripProps {
  items: FactItem[];
  variant?: 'dark' | 'light';
  className?: string;
}

export function FactsStrip({ items, variant = 'dark', className }: FactsStripProps) {
  const isDark = variant === 'dark';

  return (
    <div
      className={cn('border-t', isDark ? 'border-white/[0.14]' : 'border-ds-line', className)}
      style={{ background: isDark ? '#0B1120' : '#F6F8FC' }}
    >
      <div
        className="ds-container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col gap-1',
              i > 0 && (isDark ? 'border-l border-white/[0.14]' : 'border-l border-ds-line')
            )}
            style={{ padding: '22px', paddingLeft: i > 0 ? '22px' : undefined, paddingRight: i < items.length - 1 ? '22px' : undefined }}
          >
            <span
              style={{
                fontFamily: "'Inter Tight', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 28,
                lineHeight: 1.15,
                color: isDark ? '#FFFFFF' : '#0F172A',
              }}
            >
              {item.value}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12.5,
                color: isDark ? '#B8C4DA' : '#5B6577',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
