interface ImageBandProps {
  imageSrc: string;
  imageAlt: string;
  fadeDirection?: 'left' | 'both';
  heading: string;
  cta: { label: string; onClick: () => void };
  subCta?: { label: string; href: string };
  reassurance?: string;
  className?: string;
}

export function ImageBand({
  imageSrc,
  imageAlt,
  fadeDirection = 'left',
  heading,
  cta,
  subCta,
  reassurance,
  className,
}: ImageBandProps) {
  const gradient =
    fadeDirection === 'both'
      ? `linear-gradient(90deg, #000 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 80%, #000 100%), linear-gradient(0deg, #000 0%, rgba(0,0,0,0) 34%), #010101 url(${imageSrc}) center/cover no-repeat`
      : `linear-gradient(90deg, #000 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0) 75%), #010101 url(${imageSrc}) right center/auto 100% no-repeat`;

  return (
    <section
      role="img"
      aria-label={imageAlt}
      className={className}
      style={{ background: gradient, color: '#FFFFFF' }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '110px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          alignItems: 'flex-start',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "'Inter Tight', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(36px, 5vw, 68px)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            maxWidth: 640,
          }}
        >
          {heading}
        </h2>
        <button
          type="button"
          onClick={cta.onClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            background: '#F5A524',
            color: '#0F172A',
            border: 0,
            fontWeight: 700,
            fontSize: 21,
            padding: '22px 40px',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          {cta.label}
        </button>
        {reassurance && (
          <div style={{ fontSize: 15, color: '#D5DCEA' }}>{reassurance}</div>
        )}
        {subCta && (
          <a href={subCta.href} style={{ fontWeight: 600, color: '#FFFFFF', textDecoration: 'none' }}>
            {subCta.label}
          </a>
        )}
      </div>
    </section>
  );
}
