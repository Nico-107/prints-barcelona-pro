interface PriceTile { price: string; label: string; detail: string; }

interface PriceTilesProps {
  heading?: string;
  subheading?: string;
  tiles: PriceTile[];
  className?: string;
}

export function PriceTiles({ heading, subheading, tiles, className }: PriceTilesProps) {
  return (
    <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: 48 }}>
      {(heading || subheading) && (
        <div style={{ flex: '1 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {heading && (
            <h2
              style={{
                margin: 0,
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
          {subheading && (
            <p style={{ margin: 0, color: '#5B6577', maxWidth: 520 }}>{subheading}</p>
          )}
        </div>
      )}
      <div
        style={{
          flex: '1 1 520px',
          minWidth: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 12,
        }}
      >
        {tiles.map((tile, i) => (
          <div
            key={i}
            style={{
              background: '#F3F6FF',
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div
              style={{
                fontFamily: "'Inter Tight', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 34,
                lineHeight: 1,
              }}
            >
              {tile.price}
            </div>
            <div style={{ marginTop: 6 }}>{tile.label}</div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: '#5B6577',
              }}
            >
              {tile.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
