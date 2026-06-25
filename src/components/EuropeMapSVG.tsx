import { EUROPE_COUNTRY_PATHS, CITY_SVG_COORDS, SVG_W, SVG_H } from "@/data/europeMapData";

interface Props {
  /** "dark" = hero (navy bg, decorative). "light" = cities section (light bg, interactive). */
  variant: "dark" | "light";
  /**
   * Called with the city index (0-8, same order as buildCities in Makers.tsx).
   * Only fires in "light" variant.
   */
  onCityClick?: (cityIndex: number) => void;
  className?: string;
}

// ── Dot radii ──────────────────────────────────────────────────────
const R_LIVE_LIGHT  = 8.5;   // Barcelona on light bg
const R_LIVE_DARK   = 7.0;   // Barcelona on dark bg
const R_CITY_LIGHT  = 6.5;   // expanding cities on light bg
const R_CITY_DARK   = 5.5;   // expanding cities on dark bg

// ── Label typography ───────────────────────────────────────────────
const FONT_LIGHT = 12;
const FONT_DARK  = 11;
const LABEL_GAP  = 7;   // px between dot edge and label start

function labelPos(
  cx: number,
  cy: number,
  side: "above" | "below" | "left" | "right",
  dotRadius: number,
  fontSize: number,
) {
  const offset = dotRadius + LABEL_GAP;
  const vy = fontSize * 0.38; // approximate cap-height centering
  switch (side) {
    case "right": return { x: cx + offset,           y: cy + vy, anchor: "start"  as const };
    case "left":  return { x: cx - offset,           y: cy + vy, anchor: "end"    as const };
    case "above": return { x: cx,                    y: cy - offset, anchor: "middle" as const };
    case "below": return { x: cx, y: cy + offset + fontSize,         anchor: "middle" as const };
  }
}

export function EuropeMapSVG({ variant, onCityClick, className }: Props) {
  const isDark = variant === "dark";

  // ── Country layer colours ────────────────────────────────────────
  const countryFill   = isDark ? "rgba(155,200,240,0.20)"  : "#9fb8d2";
  const countryStroke = isDark ? "rgba(190,220,252,0.55)"  : "#5a7a9c";
  const strokeW       = isDark ? "1.0" : "1.4";

  const fontSize = isDark ? FONT_DARK : FONT_LIGHT;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      xmlns="http://www.w3.org/2000/svg"
      role={isDark ? "presentation" : "img"}
      aria-label={isDark ? undefined : "Map of Europe showing Dimension3D maker network cities"}
      aria-hidden={isDark ? true : undefined}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <defs>
        <style>{`
          /* Barcelona pulse ring */
          @keyframes bcn-pulse {
            0%   { r: 14; opacity: 0.6; }
            100% { r: 28; opacity: 0;   }
          }
          .bcn-pulse { animation: bcn-pulse 2.2s ease-out infinite; }

          /* Hover / active on clickable cities */
          .city-btn { cursor: pointer; }

          .city-btn .dot-group {
            transform-box: fill-box;
            transform-origin: center;
            transition: transform 0.12s ease;
          }
          .city-btn:hover  .dot-group { transform: scale(1.25); }
          .city-btn:active .dot-group { transform: scale(0.92); }

          .city-btn .hover-ring {
            opacity: 0;
            transition: opacity 0.15s ease;
          }
          .city-btn:hover  .hover-ring { opacity: 0.5;  }
          .city-btn:active .hover-ring { opacity: 0.75; }
        `}</style>
      </defs>

      {/* ── Country outlines ────────────────────────────────────── */}
      <g
        fill={countryFill}
        stroke={countryStroke}
        strokeWidth={strokeW}
        strokeLinejoin="round"
        fillRule="evenodd"
      >
        {EUROPE_COUNTRY_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* ── City markers ─────────────────────────────────────────── */}
      <g>
        {CITY_SVG_COORDS.map((city, idx) => {
          const { svgX: cx, svgY: cy, live, name, labelSide } = city;
          const interactive = !isDark && !!onCityClick;
          const r = live
            ? (isDark ? R_LIVE_DARK  : R_LIVE_LIGHT)
            : (isDark ? R_CITY_DARK  : R_CITY_LIGHT);
          const lp = labelPos(cx, cy, labelSide, r, fontSize);

          return (
            <g
              key={name}
              className={interactive ? "city-btn" : undefined}
              onClick={interactive ? () => onCityClick!(idx) : undefined}
              style={!interactive ? { cursor: "default" } : undefined}
              role={interactive ? "button" : undefined}
              aria-label={interactive ? name : undefined}
            >
              {/* ── Large invisible tap-target (accessibility / mobile) ── */}
              {interactive && (
                <circle cx={cx} cy={cy} r={20} fill="transparent" />
              )}

              {/* ── Pulse ring — Barcelona only; outside dot-group so it
                   doesn't double-scale on hover ─────────────────────── */}
              {live && (
                <circle
                  className="bcn-pulse"
                  cx={cx} cy={cy} r={14}
                  fill="none"
                  stroke={isDark ? "rgba(37,211,102,0.75)" : "#25d366"}
                  strokeWidth={isDark ? "1.8" : "2.5"}
                />
              )}

              {/* ── Hover reveal ring (light variant only) ────────────── */}
              {interactive && (
                <circle
                  className="hover-ring"
                  cx={cx} cy={cy}
                  r={r + 9}
                  fill="none"
                  stroke={live ? "#25d366" : "#f59e0b"}
                  strokeWidth="2"
                />
              )}

              {/* ── Main dot (+ optional glow halo) — scales on hover ── */}
              <g className={interactive ? "dot-group" : undefined}>
                {live ? (
                  <>
                    {/* Soft glow halo */}
                    <circle
                      cx={cx} cy={cy}
                      r={r + (isDark ? 5 : 4.5)}
                      fill={isDark ? "rgba(37,211,102,0.22)" : "rgba(37,211,102,0.20)"}
                    />
                    {/* Solid dot */}
                    <circle
                      cx={cx} cy={cy} r={r}
                      fill={isDark ? "#22c55e" : "#16a34a"}
                    />
                  </>
                ) : (
                  <>
                    {/* Soft amber halo */}
                    <circle
                      cx={cx} cy={cy}
                      r={r + (isDark ? 4 : 3.5)}
                      fill={isDark ? "rgba(251,191,36,0.20)" : "rgba(245,158,11,0.18)"}
                    />
                    {/* Solid dot */}
                    <circle
                      cx={cx} cy={cy} r={r}
                      fill={isDark ? "rgba(251,191,36,0.90)" : "#d97706"}
                    />
                  </>
                )}
              </g>

              {/* ── Label ─────────────────────────────────────────────── */}
              {isDark ? (
                /* Dark bg: white text with a dark stroke halo for legibility */
                <text
                  x={lp.x} y={lp.y}
                  textAnchor={lp.anchor}
                  fontSize={fontSize}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight={live ? "700" : "500"}
                  fill="rgba(255,255,255,0.92)"
                  stroke="rgba(5,12,35,0.70)"
                  strokeWidth="3"
                  paintOrder="stroke fill"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {name}
                </text>
              ) : (
                /* Light bg: dark navy text, high contrast */
                <text
                  x={lp.x} y={lp.y}
                  textAnchor={lp.anchor}
                  fontSize={fontSize}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight={live ? "700" : "500"}
                  fill={live ? "#15803d" : "#1e3a5f"}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {name}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
