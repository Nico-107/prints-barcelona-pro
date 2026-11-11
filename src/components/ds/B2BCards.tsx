interface B2BCard {
  variant: 'dark' | 'blue';
  label: string;
  heading: string;
  description: string;
  cta: string;
  href: string;
}

interface B2BCardsProps {
  heading?: string;
  cards: B2BCard[];
  className?: string;
}

export function B2BCards({ heading, cards, className }: B2BCardsProps) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      {heading && (
        <h2
          style={{
            margin: 0,
            fontFamily: "'Inter Tight', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(30px, 3.6vw, 44px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {heading}
        </h2>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 18,
        }}
      >
        {cards.map((card, i) => {
          const isDark = card.variant === 'dark';
          return (
            <a
              key={i}
              href={card.href}
              style={{
                textDecoration: 'none',
                background: isDark ? '#0F172A' : '#2F5BEA',
                color: '#FFFFFF',
                borderRadius: 20,
                padding: 34,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                minHeight: 240,
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  letterSpacing: '0.08em',
                  color: isDark ? '#F5A524' : '#FFFFFF',
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontFamily: "'Inter Tight', system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: 34,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                }}
              >
                {card.heading}
              </div>
              <p
                style={{
                  margin: 0,
                  color: isDark ? '#D5DCEA' : '#FFFFFF',
                }}
              >
                {card.description}
              </p>
              <div
                style={{
                  marginTop: 'auto',
                  fontWeight: 700,
                  color: isDark ? '#F5A524' : '#FFFFFF',
                }}
              >
                {card.cta}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
