interface FinalCtaProps {
  imageSrc?: string;
  imageAlt?: string;
  heading: string;
  cta: { label: string; onClick: () => void };
  subCta?: { label: string; href: string };
  reassurance?: string;
  className?: string;
}

export function FinalCta({
  imageSrc,
  imageAlt,
  heading,
  cta,
  subCta,
  reassurance,
  className,
}: FinalCtaProps) {
  const hasImage = !!imageSrc;

  const sectionStyle: React.CSSProperties = hasImage
    ? {
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FFFFFF',
        position: 'relative',
      }
    : {
        background: '#0F172A',
        color: '#FFFFFF',
      };

  return (
    <section role={hasImage ? 'img' : undefined} aria-label={hasImage ? imageAlt : undefined} className={className} style={sectionStyle}>
      {hasImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5,8,16,0.66)',
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
          maxWidth: 1240,
          margin: '0 auto',
          padding: '120px 24px',
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
            fontSize: 'clamp(40px, 6vw, 84px)',
            lineHeight: 0.96,
            letterSpacing: '-0.03em',
            maxWidth: 820,
          }}
        >
          {heading}
        </h2>
        <button
          type="button"
          onClick={cta.onClick}
          className="ds-btn-primary"
          style={{
            fontSize: 'clamp(15px, 4.2vw, 21px)' as string,
            padding: 'clamp(14px, 3.5vw, 22px) clamp(16px, 4.5vw, 40px)',
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
