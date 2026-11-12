interface PriceRow { material: string; useCase: string; price: string; }

interface PriceTableProps {
  rows: PriceRow[];
  columns?: { material: string; use: string; price: string };
  button?: { label: string; onClick: () => void };
  className?: string;
}

export function PriceTable({ rows, columns, button, className }: PriceTableProps) {
  const col = columns ?? { material: "MATERIAL", use: "PARA QUÉ", price: "MATERIAL + MÁQUINA" };
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: 16.5 }}>
          <thead>
            <tr style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: '#5B6577', textAlign: 'left', letterSpacing: '0.06em' }}>
              <th style={{ padding: '10px 12px 10px 0', fontWeight: 500, borderBottom: '2px solid #0F172A' }}>{col.material}</th>
              <th style={{ padding: '10px 12px', fontWeight: 500, borderBottom: '2px solid #0F172A' }}>{col.use}</th>
              <th style={{ padding: '10px 0 10px 12px', fontWeight: 500, borderBottom: '2px solid #0F172A', textAlign: 'right' }}>{col.price}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '15px 12px 15px 0', borderBottom: i < rows.length - 1 ? '1px solid #E3E8F0' : undefined, fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 21 }}>
                  {row.material}
                </td>
                <td style={{ padding: '15px 12px', borderBottom: i < rows.length - 1 ? '1px solid #E3E8F0' : undefined }}>
                  {row.useCase}
                </td>
                <td style={{ padding: '15px 0 15px 12px', borderBottom: i < rows.length - 1 ? '1px solid #E3E8F0' : undefined, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
                  {row.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {button && (
        <button
          type="button"
          onClick={button.onClick}
          style={{
            alignSelf: 'flex-start',
            background: '#F5A524',
            color: '#0F172A',
            border: 0,
            borderRadius: 10,
            padding: '15px 26px',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          {button.label}
        </button>
      )}
    </div>
  );
}
