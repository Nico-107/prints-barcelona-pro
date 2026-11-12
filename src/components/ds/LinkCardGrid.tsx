import { Link } from 'react-router-dom';

interface LinkCardItem { href: string; title: string; description?: string; }

interface LinkCardGridProps {
  items: LinkCardItem[];
  className?: string;
}

export function LinkCardGrid({ items, className }: LinkCardGridProps) {
  return (
    <div
      className={`ds-link-card-grid${className ? ` ${className}` : ''}`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 14,
      }}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          style={{
            textDecoration: 'none',
            background: '#FFFFFF',
            border: '1px solid #E3E8F0',
            borderRadius: 14,
            padding: '22px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            transition: 'border-color 0.15s, transform 0.15s',
            color: 'inherit',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(47,91,234,0.3)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#E3E8F0';
            (e.currentTarget as HTMLElement).style.transform = 'none';
          }}
        >
          <span>
            <strong style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 21, display: 'block' }}>
              {item.title}
            </strong>
            <span style={{ color: '#5B6577', fontSize: 15.5 }}>{item.description}</span>
          </span>
          <span style={{ color: '#2F5BEA', fontSize: 24, flexShrink: 0 }}>→</span>
        </Link>
      ))}
    </div>
  );
}
