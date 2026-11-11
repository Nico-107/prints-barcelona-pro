interface FounderSectionProps {
  imageSrc: string;
  imageAlt: string;
  label?: string;
  heading: string;
  body: string;
  specs?: string[];
  cta?: { label: string; href: string };
  className?: string;
}

export function FounderSection({
  imageSrc,
  imageAlt,
  label,
  heading,
  body,
  specs,
  cta,
  className,
}: FounderSectionProps) {
  return (
    <div style={{ background: '#F6F8FC' }}>
      <div
        className={className}
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '84px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 44,
          alignItems: 'center',
        }}
      >
        {/* TODO(nico): replace with a real photo of Nico or his setup */}
        <div
          role="img"
          aria-label={imageAlt}
          style={{
            flex: '1 1 520px',
            minWidth: 0,
            height: 380,
            borderRadius: 20,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          style={{
            flex: '1 1 420px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {label && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                letterSpacing: '0.08em',
                color: '#2F5BEA',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </div>
          )}
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
          <p style={{ margin: 0, fontSize: 18.5, color: '#334155', lineHeight: 1.5 }}>{body}</p>
          {specs && specs.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px 26px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: '#5B6577',
              }}
            >
              {specs.map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
          )}
          {cta && (
            <a
              href={cta.href}
              style={{
                alignSelf: 'flex-start',
                textDecoration: 'none',
                border: '1.5px solid #0F172A',
                borderRadius: 10,
                padding: '14px 22px',
                fontWeight: 600,
                color: '#0F172A',
              }}
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
