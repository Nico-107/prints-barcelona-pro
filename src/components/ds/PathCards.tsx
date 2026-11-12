interface PathCard {
  variant: 'amber' | 'blue' | 'dark';
  label?: string;
  heading: string;
  description: string;
  cta: string;
  href?: string;
  onClick?: () => void;
}

interface PathCardsProps {
  heading?: string;
  cards: PathCard[];
  className?: string;
}

const CARD_STYLES: Record<PathCard['variant'], { bg: string; color: string; labelColor: string; ctaColor: string; ctaBg: string; ctaBorder: string }> = {
  amber: { bg: '#F5A524', color: '#0B1120', labelColor: '#0B1120', ctaColor: '#0B1120', ctaBg: 'rgba(255,255,255,.88)', ctaBorder: 'rgba(0,0,0,.12)' },
  blue:  { bg: '#2F5BEA', color: '#FFFFFF', labelColor: '#FFFFFF', ctaColor: '#0B1120', ctaBg: 'rgba(255,255,255,.92)', ctaBorder: 'rgba(0,0,0,.12)' },
  dark:  { bg: '#0B1120', color: '#FFFFFF', labelColor: '#F5A524', ctaColor: '#0B1120', ctaBg: '#F5A524',               ctaBorder: '#D8870B' },
};

export function PathCards({ heading, cards, className }: PathCardsProps) {
  return (
    <div className={className}>
      {heading && (
        <h2
          style={{
            margin: '0 0 22px',
            fontFamily: "'Inter Tight', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(32px, 4vw, 52px)',
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
          }}
        >
          {heading}
        </h2>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {cards.map((card, i) => {
          const style = CARD_STYLES[card.variant];
          const inner = (
            <>
              {card.label && (
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    letterSpacing: '0.06em',
                    color: style.labelColor,
                  }}
                >
                  {card.label}
                </div>
              )}
              <div
                style={{
                  fontFamily: "'Inter Tight', system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: 34,
                  lineHeight: 1.04,
                  letterSpacing: '-0.02em',
                }}
              >
                {card.heading}
              </div>
              <p style={{ margin: 0, color: card.variant === 'dark' ? '#D5DCEA' : undefined }}>
                {card.description}
              </p>
              <div style={{ marginTop: 'auto' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: style.ctaBg,
                    border: `1px solid ${style.ctaBorder}`,
                    color: style.ctaColor,
                    fontWeight: 700,
                    fontSize: 15,
                    padding: '8px 16px',
                    borderRadius: 20,
                  }}
                >
                  <span className="ds-path-card-arrow">{card.cta}</span>
                </span>
              </div>
            </>
          );

          const sharedStyle: React.CSSProperties = {
            background: style.bg,
            color: style.color,
            borderRadius: 22,
            padding: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minHeight: 230,
            textDecoration: 'none',
            border: 0,
            textAlign: 'left',
            cursor: 'pointer',
          };
          const sharedClassName = "ds-path-card";

          if (card.href) {
            return (
              <a key={i} href={card.href} style={sharedStyle} className={sharedClassName}>
                {inner}
              </a>
            );
          }

          return (
            <button key={i} type="button" onClick={card.onClick} style={sharedStyle} className={sharedClassName}>
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}
