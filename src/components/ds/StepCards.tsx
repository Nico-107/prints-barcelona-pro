import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

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
      className={cn(className)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 18,
      }}
    >
      {steps.map((step) => {
        const isAction = !!step.cta;
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
              {step.icon && <div style={{ width: 34, height: 34 }}>{step.icon}</div>}
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
