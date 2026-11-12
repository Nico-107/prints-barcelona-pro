import React from 'react';

interface QuoteItem {
  text: string;
  author: string;
  original?: string;
  translatedLabel?: string;
  seeLabel?: string;
  hideLabel?: string;
}

interface QuoteFeatureProps {
  label?: string;
  featured: QuoteItem;
  secondary?: QuoteItem[];
  variant?: 'dark' | 'light';
  className?: string;
}

function OriginalToggle({ item, isDark }: { item: QuoteItem; isDark: boolean }) {
  const [open, setOpen] = React.useState(false);
  if (!item.original || !item.translatedLabel) return null;
  return (
    <span style={{ display: 'block', marginTop: 10 }}>
      <span style={{ fontSize: 13, color: isDark ? '#B8C4DA' : '#5B6577', marginRight: 6 }}>
        {item.translatedLabel}
      </span>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ fontSize: 13, color: isDark ? '#F5A524' : '#2F5BEA', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
      >
        {open ? item.hideLabel : item.seeLabel}
      </button>
      {open && (
        <span style={{ display: 'block', marginTop: 8, fontSize: 14, fontStyle: 'italic', color: isDark ? '#D5DCEA' : '#5B6577' }}>
          "{item.original}"
        </span>
      )}
    </span>
  );
}

export function QuoteFeature({ label, featured, secondary, variant = 'dark', className }: QuoteFeatureProps) {
  const isDark = variant === 'dark';

  return (
    <div
      className={`${isDark ? 'ds-grid-bg' : ''} ${className ?? ''}`}
      style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '84px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 30,
        }}
      >
        {label && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              letterSpacing: '0.08em',
              color: '#F5A524',
            }}
          >
            {label}
          </div>
        )}
        <blockquote
          style={{
            margin: 0,
            fontFamily: "'Inter Tight', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 'clamp(26px, 3.2vw, 40px)',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            maxWidth: 1040,
          }}
        >
          "{featured.text}"
          <footer
            style={{
              marginTop: 16,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 500,
              fontSize: 15,
              color: isDark ? '#B8C4DA' : '#5B6577',
            }}
          >
            {featured.author}
          </footer>
          <OriginalToggle item={featured} isDark={isDark} />
        </blockquote>
        {secondary && secondary.length > 0 && (
          <div
            className="ds-quote-secondary-row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 14,
            }}
          >
            {secondary.map((q, i) => (
              <blockquote
                key={i}
                style={{
                  margin: 0,
                  background: isDark ? 'rgba(255,255,255,0.06)' : '#F3F6FF',
                  border: isDark ? '1px solid rgba(255,255,255,0.16)' : 'none',
                  borderRadius: 14,
                  padding: 20,
                  fontSize: 16,
                  color: isDark ? '#D5DCEA' : '#0F172A',
                }}
              >
                "{q.text}"
                <footer
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    color: isDark ? '#B8C4DA' : '#5B6577',
                  }}
                >
                  {q.author}
                </footer>
                <OriginalToggle item={q} isDark={isDark} />
              </blockquote>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
