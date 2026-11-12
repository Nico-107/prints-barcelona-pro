import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Two-tone icons from V1 reference — dark stroke with one amber-filled detail
const STEP_ICONS: ReactNode[] = [
  // Upload tray
  <svg key="upload" width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 22V6"/><path d="M10 13l7-7 7 7"/>
    <rect x="5" y="22" width="24" height="7" rx="2" fill="#F5A524"/>
  </svg>,
  // Price tag
  <svg key="price" width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 17L17 5h12v12L17 29z"/>
    <circle cx="23" cy="11" r="2.5" fill="#F5A524"/>
  </svg>,
  // Layered print
  <svg key="print" width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 27h22"/>
    <path d="M9 22h16" stroke="#F5A524"/>
    <path d="M11 17h12" stroke="#F5A524"/>
    <path d="M13 12h8" stroke="#F5A524"/>
    <path d="M17 4v4"/>
  </svg>,
  // Package / box
  <svg key="box" width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 11l12-6 12 6v12l-12 6-12-6z"/>
    <path d="M5 11l12 6 12-6"/>
    <path d="M17 17v12"/>
    <path d="M11 8l12 6" stroke="#F5A524"/>
  </svg>,
];

interface Step {
  number: number;
  title: string;
  description: string;
  icon?: ReactNode;
  cta?: { label: string; onClick: () => void };
}

interface StepCardsProps {
  steps: Step[];
  className?: string;
}

export function StepCards({ steps, className }: StepCardsProps) {
  return (
    <div
      className={cn('ds-step-cards', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 18,
      }}
    >
      {steps.map((step, idx) => {
        const isAction = !!step.cta;
        const icon = step.icon ?? STEP_ICONS[idx] ?? null;
        const inner = (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                aria-hidden="true"
                style={{
                  fontFamily: "'Inter Tight', system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: 44,
                  lineHeight: 1,
                  color: '#2F5BEA',
                }}
              >
                {step.number}
              </span>
              {icon && <div style={{ width: 34, height: 34, flexShrink: 0 }}>{icon}</div>}
            </div>
            <h3
              style={{
                margin: 0,
                fontFamily: "'Inter Tight', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 22,
              }}
            >
              {step.title}
            </h3>
            <p style={{ margin: 0, color: '#5B6577', fontSize: 16 }}>{step.description}</p>
            {isAction && step.cta && (
              <span
                style={{
                  marginTop: 'auto',
                  paddingTop: 6,
                  fontWeight: 700,
                  color: '#2F5BEA',
                  fontSize: 15,
                }}
              >
                {step.cta.label}
              </span>
            )}
          </>
        );

        if (isAction && step.cta) {
          return (
            <button
              key={step.number}
              type="button"
              onClick={step.cta.onClick}
              style={{
                background: '#FFFFFF',
                border: '2px solid #2F5BEA',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                cursor: 'pointer',
                textAlign: 'left',
                minHeight: 180,
              }}
            >
              {inner}
            </button>
          );
        }

        return (
          <div
            key={step.number}
            style={{
              background: '#F6F8FC',
              borderRadius: 16,
              padding: 26,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}
