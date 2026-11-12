import { type ReactNode } from 'react';

interface UploadPanelProps {
  label?: string;
  heading: string;
  description: string;
  examples?: { text: string }[];
  children?: ReactNode;
}

export function UploadPanel({ label, heading, description, examples, children }: UploadPanelProps) {
  return (
    <div
      className="ds-upload-panel-dark"
      style={{
        background: '#0F172A',
        borderRadius: 24,
        padding: 'clamp(24px, 4vw, 48px)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 36,
        alignItems: 'center',
        color: '#FFFFFF',
      }}
    >
      {/* Left text column */}
      <div style={{ flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {label && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              letterSpacing: '0.08em',
              color: '#F5A524',
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
            fontSize: 'clamp(30px, 3.6vw, 46px)',
            lineHeight: 1.04,
            letterSpacing: '-0.02em',
          }}
        >
          {heading}
        </h2>
        <p style={{ margin: 0, color: '#D5DCEA' }}>{description}</p>
        {examples && examples.map((ex, i) => (
          <div key={i} style={{ fontSize: 15.5, color: '#D5DCEA' }}>
            {ex.text}
          </div>
        ))}
      </div>

      {/* Right: estimator slot */}
      <div className="ds-upload-panel-card" style={{ flex: '1 1 440px', minWidth: 0, background: '#FFFFFF', color: '#0F172A', borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children ?? (
          <div
            style={{
              border: '2px dashed #2F5BEA',
              background: '#F3F6FF',
              borderRadius: 14,
              padding: '36px 18px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <div style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 800, fontSize: 25 }}>
              Suelta tus archivos aquí
            </div>
            <div style={{ color: '#5B6577', fontSize: 15 }}>STL, OBJ, 3MF, GLB</div>
          </div>
        )}
      </div>
    </div>
  );
}
