import { type ReactNode } from 'react';

interface HeroProps {
  variant: 'centered' | 'split-image';
  starLine?: ReactNode;
  h1: ReactNode;
  paragraph: string;
  /** Mobile-only paragraph override (shown instead of paragraph on ≤767px) */
  mobileParagraph?: string;
  primaryButton?: { label: ReactNode; onClick: () => void };
  /** Outlined secondary button (WhatsApp, etc.) — links to href */
  secondaryButton?: { label: string; href: string };
  /** Small text link below buttons (e.g. "send me the link") */
  sendLinkButton?: { label: string; onClick: () => void };
  reassuranceItems?: string[];
  noFileLink?: { label: string; onClick: () => void };
  factsItems?: { value: string; label: string }[];
  splitImage?: { src: string; alt: string };
  /** When false, hero sits below the header instead of extending behind it */
  extendBehindHeader?: boolean;
  /** Mobile-only: review quote card + 3-col stats row shown below the fold on the first screen */
  mobileExtras?: { quoteText: string; quoteAuthor: string; facts: { value: string; label: string }[] };
}

/** Centered (V1) hero — dark grid background, no image */
function CenteredHero({
  starLine, h1, paragraph, primaryButton, secondaryButton, sendLinkButton,
  reassuranceItems = [], noFileLink, factsItems = [],
  extendBehindHeader = true,
}: HeroProps) {
  return (
    <section
      data-testid="page-hero"
      data-page-hero
      data-hero-variant="A"
      className="ds-grid-bg ds-v1-hero-section relative text-white"
      style={extendBehindHeader ? {
        marginTop: 'calc(-1 * var(--header-h))',
        paddingTop: 'calc(var(--header-h) + 92px)',
        contain: 'layout',
      } : {
        paddingTop: '84px',
        contain: 'layout',
      }}
    >
      <div className="ds-container" style={{ paddingBottom: 0 }}>
        <div
          className="ds-v1-hero-inner"
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
              className="ds-v1-hero-starline"
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
              fontSize: 'clamp(38px, 6.5vw, 92px)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              color: '#FFFFFF',
            }}
          >
            {h1}
          </h1>

          <p
            data-testid="hero-subtitle"
            style={{
              margin: 0,
              fontSize: 'clamp(16.5px, 2vw, 21px)',
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
              data-hero-cta="true"
              onClick={primaryButton.onClick}
              className="ds-btn-primary"
              style={{
                fontSize: 'clamp(15px, 4.2vw, 22px)',
                padding: 'clamp(14px, 3.5vw, 20px) clamp(16px, 4.5vw, 32px)',
                width: '100%',
                maxWidth: 480,
                boxSizing: 'border-box' as const,
              }}
            >
              {primaryButton.label}
            </button>
          )}

          {secondaryButton && (
            <a
              href={secondaryButton.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 'clamp(15px, 2vw, 16.5px)',
                padding: 'clamp(13px, 3vw, 15px)',
                borderRadius: 12,
                border: '1.5px solid rgba(255,255,255,0.55)',
                color: '#FFFFFF',
                fontFamily: "'Inter', system-ui, sans-serif",
                width: '100%',
                maxWidth: 480,
                boxSizing: 'border-box' as const,
              }}
            >
              {secondaryButton.label}
            </a>
          )}

          {sendLinkButton && (
            <button
              type="button"
              onClick={sendLinkButton.onClick}
              style={{
                fontSize: 15,
                color: '#D5DCEA',
                fontWeight: 400,
                background: 'none',
                border: 0,
                cursor: 'pointer',
                padding: 0,
                fontFamily: "'Inter', system-ui, sans-serif",
                textAlign: 'center',
              }}
            >
              {sendLinkButton.label}
            </button>
          )}

          {reassuranceItems.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '6px 10px',
                fontSize: 15,
                color: '#B8C4DA',
              }}
            >
              {reassuranceItems.map((item, i) => (
                <>
                  {i > 0 && <span key={`sep-${i}`} aria-hidden="true">·</span>}
                  <span key={i}>{item}</span>
                </>
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
          <div className="ds-container ds-hero-facts">
            {factsItems.map((item, i) => (
              <div
                key={i}
                style={{
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
  starLine, h1, paragraph, mobileParagraph, primaryButton, secondaryButton, sendLinkButton, reassuranceItems = [], noFileLink, splitImage, mobileExtras,
}: HeroProps) {
  return (
    <section
      data-testid="page-hero"
      data-page-hero
      data-hero-variant="B"
      data-v2-hero
      className="ds-hero-split-section"
      style={{
        background: '#000000',
        color: '#FFFFFF',
        marginTop: 'calc(-1 * (var(--header-h) + env(safe-area-inset-top)))',
        paddingTop: 'calc(var(--header-h) + env(safe-area-inset-top))',
        contain: 'layout',
      }}
    >
      <div className="ds-hero-split-wrapper" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* Text column */}
        <div
          className="ds-hero-split-text"
          style={{
            flex: '1 1 560px',
            minWidth: 0,
            boxSizing: 'border-box',
            paddingTop: 'clamp(64px, 7vw, 112px)',
            paddingRight: '40px',
            paddingBottom: 'clamp(32px, 6vw, 96px)',
            paddingLeft: 'max(24px, calc((100% - 1240px) / 2 + 24px))',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          {starLine && (
            <div
              data-testid="hero-eyebrow-v2"
              className="ds-hero-split-eyebrow"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                letterSpacing: '0.08em',
                color: '#B8C4DA',
              }}
            >
              {starLine}
            </div>
          )}

          <h1
            style={{
              margin: 0,
              fontFamily: "'Bricolage Grotesque', 'Inter Tight', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(40px, 5.6vw, 84px)',
              lineHeight: 0.96,
              letterSpacing: '-0.03em',
            }}
          >
            {h1}
          </h1>

          {/* Desktop paragraph */}
          <p
            className={mobileParagraph ? 'ds-hero-v2-desktop-only' : undefined}
            style={{
              margin: 0,
              fontSize: 'clamp(16.5px, 2vw, 21px)',
              color: '#D5DCEA',
              maxWidth: 500,
            }}
          >
            {paragraph}
          </p>

          {/* Mobile paragraph (if different from desktop) */}
          {mobileParagraph && (
            <p
              className="ds-v2-mobile-only"
              style={{
                margin: 0,
                fontSize: 16.5,
                color: '#D5DCEA',
              }}
            >
              {mobileParagraph}
            </p>
          )}

          <button
            type="button"
            data-hero-cta="true"
            onClick={primaryButton?.onClick}
            className="ds-btn-primary"
            style={{
              fontSize: 'clamp(16px, 4.5vw, 23px)' as string,
              padding: 'clamp(16px, 4vw, 24px) clamp(24px, 6.4vw, 46px)',
            }}
          >
            {primaryButton?.label}
          </button>

          {/* Reassurance line (mono) — desktop only on V2 (drag-and-drop doesn't exist on phones) */}
          {reassuranceItems.length > 0 && (
            <div
              className="ds-hero-v2-desktop-only"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: '#B8C4DA',
                letterSpacing: '0.02em',
              }}
            >
              {reassuranceItems.join(' · ')}
            </div>
          )}

          {/* noFileLink: desktop only on V2 (no drag-and-drop on phones) */}
          {noFileLink && (
            <button
              type="button"
              className="ds-hero-v2-desktop-only"
              onClick={noFileLink.onClick}
              style={{
                fontSize: 15,
                color: '#D5DCEA',
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

          {/* Secondary (WhatsApp) + share link: desktop hidden on V2 (mobile only via CSS) */}
          {secondaryButton && (
            <a
              href={secondaryButton.href}
              className="ds-v2-mobile-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                border: '1.5px solid rgba(255,255,255,0.55)',
                borderRadius: 14,
                padding: 'clamp(13px, 3.5vw, 15px) clamp(16px, 4vw, 24px)',
                fontWeight: 600,
                fontSize: 'clamp(15px, 4vw, 16.5px)' as string,
                color: '#FFFFFF',
                fontFamily: "'Inter', system-ui, sans-serif",
                width: '100%',
                boxSizing: 'border-box' as const,
              }}
            >
              {secondaryButton.label}
            </a>
          )}

          {sendLinkButton && (
            <button
              type="button"
              onClick={sendLinkButton.onClick}
              className="ds-v2-mobile-only"
              style={{
                fontSize: 15,
                color: '#D5DCEA',
                background: 'none',
                border: 0,
                cursor: 'pointer',
                padding: 0,
                textAlign: 'center',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {sendLinkButton.label}
            </button>
          )}

          {/* Mobile-only: quote card + stats row pinned to bottom of hero */}
          {mobileExtras && (
            <div className="ds-hero-mobile-extras">
              <blockquote style={{ margin: 0, padding: '14px 16px', background: 'rgba(255,255,255,0.07)', borderRadius: 14, fontSize: 15, color: '#E8ECF4' }}>
                <span style={{ color: '#F5A524', letterSpacing: 2, fontSize: 12 }}>★★★★★</span>
                <br />
                "{mobileExtras.quoteText}" <span style={{ color: '#B8C4DA', fontSize: 13 }}>— {mobileExtras.quoteAuthor}</span>
              </blockquote>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', borderTop: '1px solid rgba(255,255,255,0.18)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#B8C4DA' }}>
                {mobileExtras.facts.map((fact, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 8px 0',
                      borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.18)' : 'none',
                      paddingLeft: i > 0 ? 12 : 0,
                      paddingRight: i < mobileExtras.facts.length - 1 ? 8 : 0,
                    }}
                  >
                    <span style={{ display: 'block', color: '#FFFFFF', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, lineHeight: 1.2 }}>
                      {fact.value}
                    </span>
                    {fact.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Image column */}
        {splitImage && (
          <div
            className="ds-hero-split-img"
            style={{ flex: '1 1 520px', minWidth: 0, position: 'relative', minHeight: 'clamp(240px, 50vw, 640px)' }}
          >
            {/* Fade overlay — left edge fades to black (desktop) / bottom fades to black (mobile) */}
            <div
              aria-hidden="true"
              className="ds-hero-split-fade"
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
