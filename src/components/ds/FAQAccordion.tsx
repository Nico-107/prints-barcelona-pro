import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  heading?: string;
  items: FAQItem[];
  className?: string;
}

export function FAQAccordion({ heading, items, className }: FAQAccordionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className={className}>
      {heading && (
        <h2
          style={{
            margin: '0 0 28px',
            fontFamily: "'Inter Tight', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(28px, 3.2vw, 40px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {heading}
        </h2>
      )}
      <div>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              borderTop: '1px solid #E3E8F0',
              ...(i === items.length - 1 ? { borderBottom: '1px solid #E3E8F0' } : {}),
            }}
          >
            <button
              type="button"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                padding: '20px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'Inter Tight', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: '#0F172A',
              }}
            >
              {item.question}
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2F5BEA',
                  fontSize: 20,
                  transition: 'transform 0.2s',
                  transform: open === i ? 'rotate(45deg)' : 'none',
                }}
              >
                +
              </span>
            </button>
            {open === i && (
              <div
                style={{
                  paddingBottom: 20,
                  color: '#5B6577',
                  lineHeight: 1.6,
                }}
              >
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
