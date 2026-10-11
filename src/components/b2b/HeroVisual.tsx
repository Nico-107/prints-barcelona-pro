// Inline SVG "production sheet" hero visual.
// No external assets, no animation beyond the prefers-reduced-motion-gated fade.
// All data values come from b2bFacts / the estimator — never hard-coded.
import { STATS, TRUST } from "@/config/b2bFacts";
import type { B2BLang } from "./B2BLanding";

interface HeroVisualProps {
  lang: B2BLang;
  unitPrice50ASACents: number;
  ariaTitle: string;
  ariaDesc: string;
  exampleLabel: string;
  statusLabel: string;
  stepLabels: [string, string, string, string];
  dataLabels: { price: string; delivery: string; quote: string; note: string };
  orderLabel: string;
  className?: string;
}

const PLATE_X = 136;
const PLATE_Y = 58;
const PLATE_W = 288; // 6 cols × 48
const PLATE_H = 192; // 4 rows × 48
const CELL = 48;
const COLS = 6;
const ROWS = 4;
const FILLED_STEPS = 2;

// Simple L-bracket / enclosure silhouette, centred at origin, ~18×18 px
const PART_PATH = "M-9,-9 L-9,9 L9,9 L9,3 L-3,3 L-3,-9 Z";

// Checkmark path centred at origin
const CHECK_PATH = "M-4,0 L-1.5,2.5 L4,-3.5";

const HeroVisual = ({
  lang,
  unitPrice50ASACents,
  ariaTitle,
  ariaDesc,
  exampleLabel,
  statusLabel,
  stepLabels,
  dataLabels,
  orderLabel,
  className = "",
}: HeroVisualProps) => {
  const priceFormatted = (() => {
    const eur = (unitPrice50ASACents / 100).toFixed(2);
    if (lang === "en") return `€${eur}/unit`;
    const localNum = eur.replace(".", ",");
    return lang === "ca" ? `${localNum} €/u` : `${localNum} €/ud`;
  })();

  const deliveryValue = (() => {
    const d = STATS.leadTimeDays ?? "2–5";
    if (lang === "es") return `${d} días`;
    if (lang === "ca") return `${d} dies`;
    return `${d} days`;
  })();

  const quoteValue = `${TRUST.rapidQuoteHours} h`;

  // Step x positions (evenly spaced, 4 steps across the card)
  const stepXs: [number, number, number, number] = [64, 208, 352, 496];

  return (
    <svg
      viewBox="0 0 560 440"
      role="img"
      aria-labelledby="hv-title hv-desc"
      className={`w-full h-auto select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .hv-main { animation: hv-fade 0.4s ease-out both; }
        }
        @keyframes hv-fade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <title id="hv-title">{ariaTitle}</title>
      <desc id="hv-desc">{ariaDesc}</desc>

      <defs>
        <clipPath id="hv-clip">
          <rect x="0" y="0" width="560" height="440" rx="12" />
        </clipPath>
      </defs>

      <g className="hv-main" clipPath="url(#hv-clip)">

        {/* ── Card background ── */}
        <rect x="0" y="0" width="560" height="440" fill="hsl(var(--card))" />

        {/* ── Header strip ── */}
        <rect x="0" y="0" width="560" height="50" fill="hsl(var(--primary))" />

        {/* Order label (left) */}
        <text
          x="16" y="32"
          fill="hsl(var(--primary-foreground))"
          fontSize="11" fontFamily="ui-monospace,monospace" fontWeight="600"
          letterSpacing="0.8" opacity="0.9"
        >
          {orderLabel}
        </text>

        {/* Status pill */}
        <rect x="258" y="14" width="118" height="22" rx="11"
          fill="hsl(var(--primary-foreground))" fillOpacity="0.1"
          stroke="hsl(var(--primary-foreground))" strokeOpacity="0.2" strokeWidth="0.75"
        />
        <circle cx="272" cy="25" r="3.5" fill="#4ade80" />
        <text x="281" y="30" fill="hsl(var(--primary-foreground))" fontSize="10"
          fontFamily="ui-sans-serif,sans-serif" opacity="0.9">
          {statusLabel}
        </text>

        {/* Example badge */}
        <rect x="388" y="14" width="96" height="22" rx="11" fill="hsl(var(--cta))" />
        <text x="436" y="29" fill="hsl(var(--cta-foreground))" fontSize="10"
          fontFamily="ui-sans-serif,sans-serif" fontWeight="700"
          textAnchor="middle" letterSpacing="0.8">
          {exampleLabel.toUpperCase()}
        </text>

        {/* ── Print plate ── */}
        <rect
          x={PLATE_X} y={PLATE_Y} width={PLATE_W} height={PLATE_H}
          rx="6" fill="hsl(var(--secondary))"
          stroke="hsl(var(--border))" strokeWidth="0.75"
        />

        {/* Grid lines — vertical */}
        {Array.from({ length: COLS - 1 }, (_, i) => (
          <line
            key={`gv${i}`}
            x1={PLATE_X + (i + 1) * CELL} y1={PLATE_Y}
            x2={PLATE_X + (i + 1) * CELL} y2={PLATE_Y + PLATE_H}
            stroke="hsl(var(--border))" strokeWidth="0.5"
          />
        ))}

        {/* Grid lines — horizontal */}
        {Array.from({ length: ROWS - 1 }, (_, i) => (
          <line
            key={`gh${i}`}
            x1={PLATE_X} y1={PLATE_Y + (i + 1) * CELL}
            x2={PLATE_X + PLATE_W} y2={PLATE_Y + (i + 1) * CELL}
            stroke="hsl(var(--border))" strokeWidth="0.5"
          />
        ))}

        {/* Part silhouettes — rows 0-2: primary (navy), row 3: cta (orange/finished) */}
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const cx = PLATE_X + col * CELL + CELL / 2;
            const cy = PLATE_Y + row * CELL + CELL / 2;
            const finished = row === ROWS - 1;
            return (
              <path
                key={`p${row}-${col}`}
                d={PART_PATH}
                transform={`translate(${cx},${cy})`}
                fill={finished ? "hsl(var(--cta))" : "hsl(var(--primary))"}
                opacity="0.8"
              />
            );
          })
        )}

        {/* Caption under plate */}
        <text
          x="280" y="268" textAnchor="middle"
          fill="hsl(var(--muted-foreground))" fontSize="12"
          fontFamily="ui-sans-serif,sans-serif" letterSpacing="0.3"
        >
          {dataLabels.note.includes("50")
            ? `24 ${lang === "es" ? "piezas por placa" : lang === "ca" ? "peces per placa" : "parts per plate"}`
            : `24 ${lang === "es" ? "piezas por placa" : lang === "ca" ? "peces per placa" : "parts per plate"}`
          }
        </text>

        {/* ── Progress line ── */}
        {/* Connecting lines */}
        {(stepXs.slice(0, -1) as number[]).map((x, i) => (
          <line
            key={`pl${i}`}
            x1={x + 11} y1={290}
            x2={stepXs[i + 1] - 11} y2={290}
            stroke={i < FILLED_STEPS - 1 ? "hsl(var(--accent))" : "hsl(var(--border))"}
            strokeWidth="2"
          />
        ))}

        {/* Step circles + labels */}
        {stepXs.map((x, i) => {
          const filled = i < FILLED_STEPS;
          return (
            <g key={`ps${i}`}>
              <circle
                cx={x} cy={290} r="10"
                fill={filled ? "hsl(var(--accent))" : "hsl(var(--card))"}
                stroke={filled ? "hsl(var(--accent))" : "hsl(var(--border))"}
                strokeWidth="1.5"
              />
              {filled ? (
                <path
                  d={CHECK_PATH}
                  transform={`translate(${x},290)`}
                  fill="none"
                  stroke="hsl(var(--accent-foreground))"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <text
                  x={x} y={294} textAnchor="middle"
                  fill="hsl(var(--muted-foreground))" fontSize="10"
                  fontFamily="ui-monospace,monospace" fontWeight="600"
                >
                  {i + 1}
                </text>
              )}
              <text
                x={x} y={314} textAnchor="middle"
                fill="hsl(var(--muted-foreground))" fontSize="12"
                fontFamily="ui-sans-serif,sans-serif"
              >
                {stepLabels[i]}
              </text>
            </g>
          );
        })}

        {/* ── Separator ── */}
        <line x1="20" y1="328" x2="540" y2="328" stroke="hsl(var(--border))" strokeWidth="0.5" />

        {/* ── Data rows ── */}

        {/* Row 1: unit price */}
        <text x="20" y="354" fill="hsl(var(--muted-foreground))" fontSize="13"
          fontFamily="ui-sans-serif,sans-serif">
          {dataLabels.price}
        </text>
        <text x="540" y="354" textAnchor="end" fill="hsl(var(--foreground))" fontSize="20"
          fontFamily="ui-monospace,monospace" fontWeight="700"
          style={{ fontVariantNumeric: "tabular-nums" }}>
          {priceFormatted}
        </text>

        {/* Row 2: lead time */}
        <text x="20" y="378" fill="hsl(var(--muted-foreground))" fontSize="13"
          fontFamily="ui-sans-serif,sans-serif">
          {dataLabels.delivery}
        </text>
        <text x="540" y="378" textAnchor="end" fill="hsl(var(--foreground))" fontSize="20"
          fontFamily="ui-monospace,monospace" fontWeight="700"
          style={{ fontVariantNumeric: "tabular-nums" }}>
          {deliveryValue}
        </text>

        {/* Row 3: quote time */}
        <text x="20" y="402" fill="hsl(var(--muted-foreground))" fontSize="13"
          fontFamily="ui-sans-serif,sans-serif">
          {dataLabels.quote}
        </text>
        <text x="540" y="402" textAnchor="end" fill="hsl(var(--foreground))" fontSize="20"
          fontFamily="ui-monospace,monospace" fontWeight="700"
          style={{ fontVariantNumeric: "tabular-nums" }}>
          {quoteValue}
        </text>

        {/* ── Separator ── */}
        <line x1="20" y1="416" x2="540" y2="416" stroke="hsl(var(--border))" strokeWidth="0.5" />

        {/* ── Indicative note ── */}
        <text x="280" y="432" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="11"
          fontFamily="ui-sans-serif,sans-serif" opacity="0.7" letterSpacing="0.3">
          {dataLabels.note}
        </text>

      </g>

      {/* Card border — rendered on top so it's always crisp */}
      <rect x="0" y="0" width="560" height="440" rx="12"
        fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
    </svg>
  );
};

export default HeroVisual;
