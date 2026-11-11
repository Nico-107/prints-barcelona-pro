import { type ReactNode } from 'react';

interface HeroProps {
  variant: 'centered' | 'split-image';
  starLine?: ReactNode;
  h1: ReactNode;
  paragraph: string;
  primaryButton?: { label: ReactNode; onClick: () => void };
  reassuranceItems?: string[];
  noFileLink?: { label: string; onClick: () => void };
  factsItems?: { value: string; label: string }[];
  splitImage?: { src: string; alt: string };
  /** When false, hero sits below the header instead of extending behind it */
  extendBehindHeader?: boolean;
}

/** Centered (V1) hero — dark grid background, no image */
function CenteredHero({
  starLine, h1, paragraph, primaryButton, reassuranceItems = [], noFileLink, factsItems = [],
  extendBehindHeader = true,
}: HeroProps) {
  return (
    <section
      className="ds-grid-bg relative text-white"
      style={extendBehindHeader ? {
        marginTop: 'calc(-1 * var(--header-h))',
        paddingTop: 'calc(var(--header-h) + 92px)',
      } : {
        paddingTop: '84px',
      }}
    >
      <div className="ds-container" style={{ paddingBottom: 0 }}>
        <div
          style={{
            maxWidth: 1040,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 26,
            paddingBottom: 64,
          }}
        >
          {starLine && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '8px 18px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                letterSpacing: '0.06em',
                color: '#B8C4DA',
              }}
            >
              {starLine}
            </div>
          )}

          <h1
            style={{
              margin: 0,
              fontFamily: "'Inter Tight', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(46px, 6.6vw, 92px)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              color: '#FFFFFF',
            }}
          >
            {h1}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 21,
              lineHeight: 1.45,
              color: '#D5DCEA',
              maxWidth: 620,
            }}
          >
            {paragraph}
          </p>

          {primaryButton && (
            <button
              type="button"
              onClick={primaryButton.onClick}
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                background: '#F5A524',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: 22,
                padding: '22px 40px',
                borderRadius: 12,
                border: 0,
                cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {primaryButton.label}
            </button>
          )}

          {reassuranceItems.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '6px 16px',
                fontSize: 15,
                color: '#B8C4DA',
              }}
            >
              {reassuranceItems.map((item, i) => (
                <span key={i}>{item}</span>
              ))}
            </div>
          )}

          {noFileLink && (
            <button
              type="button"
              onClick={noFileLink.onClick}
              style={{
                fontSize: 16.5,
                color: '#FFFFFF',
                fontWeight: 600,
                background: 'none',
                border: 0,
                cursor: 'pointer',
                padding: 0,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {noFileLink.label}
            </button>
          )}
        </div>
      </div>

      {/* Facts strip */}
      {factsItems.length > 0 && (
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(11,17,32,0.6)',
          }}
        >
          <div
            className="ds-container"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
              textAlign: 'left',
            }}
          >
            {factsItems.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '22px',
                  paddingLeft: i === 0 ? 0 : '22px',
                  paddingRight: i === factsItems.length - 1 ? 0 : '22px',
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.14)' : undefined,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12.5,
                  color: '#B8C4DA',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#FFFFFF',
                    fontFamily: "'Inter Tight', system-ui, sans-serif",
                    fontWeight: 800,
                    fontSize: 28,
                    lineHeight: 1.15,
                    marginBottom: 2,
                  }}
                >
                  {item.value}
                </span>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** Split-image (V2) hero — black bg, image right, text left */
function SplitImageHero({
  starLine, h1, paragraph, primaryButton, reassuranceItems = [], noFileLink, splitImage,
}: HeroProps) {
  return (
    <section
      style={{
        background: '#000000',
        color: '#FFFFFF',
        marginTop: 'calc(-1 * var(--header-h))',
        paddingTop: 'var(--header-h)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* Text column */}
        <div
          style={{
            flex: '1 1 560px',
            minWidth: 0,
            boxSizing: 'border-box',
            padding: 'clamp(24px,5vw,72px) clamp(16px,4vw,40px) clamp(32px,6vw,96px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            alignItems: 'flex-start',
            justifyContent: 'center',
            maxWidth: 'calc(1240px / 2 + 24px)',
            marginLeft: 'auto',
          }}
        >
          {starLine && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                letterSpacing: '0.08em',
                color: '#8FB0FF',
              }}
            >
              {starLine}
            </div>
          )}

          <h1
            style={{
              margin: 0,
              fontFamily: "'Inter Tight', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(48px, 6.4vw, 96px)',
              lineHeight: 0.94,
              letterSpacing: '-0.035em',
            }}
          >
            {h1}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 21,
              color: '#E3E8F3',
              maxWidth: 500,
            }}
          >
            {paragraph}
          </p>

          <button
            type="button"
            onClick={primaryButton.onClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              background: '#F5A524',
              color: '#0B1020',
              fontWeight: 700,
              fontSize: 23,
              padding: '24px 46px',
              borderRadius: 14,
              border: 0,
              cursor: 'pointer',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {primaryButton.label}
          </button>

          {reassuranceItems.length > 0 && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: '#C6CEDF',
                letterSpacing: '0.02em',
              }}
            >
              {reassuranceItems.join(' · ')}
            </div>
          )}

          {noFileLink && (
            <button
              type="button"
              onClick={noFileLink.onClick}
              style={{
                fontSize: 16.5,
                color: '#E3E8F3',
                background: 'none',
                border: 0,
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {noFileLink.label}
            </button>
          )}
        </div>

        {/* Image column */}
        {splitImage && (
          <div
            style={{ flex: '1 1 520px', minWidth: 0, position: 'relative', minHeight: 'clamp(240px, 50vw, 640px)' }}
          >
            {/* Fade overlay — left edge fades to black */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.6) 14%, rgba(0,0,0,0) 36%)',
                zIndex: 1,
              }}
            />
            <picture>
              <source
                srcSet="/img/x2d/x2d-inside-480.webp 480w, /img/x2d/x2d-inside-960.webp 960w, /img/x2d/x2d-inside-1600.webp 1600w"
                sizes="(max-width: 900px) 100vw, 50vw"
                type="image/webp"
              />
              <img
                src={splitImage.src}
                alt={splitImage.alt}
                fetchPriority="high"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </picture>
          </div>
        )}
      </div>
    </section>
  );
}

export function Hero(props: HeroProps) {
  if (props.variant === 'split-image') return <SplitImageHero {...props} />;
  return <CenteredHero {...props} />;
}
