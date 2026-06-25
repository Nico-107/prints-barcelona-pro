import { EUROPE_COUNTRY_PATHS, CITY_SVG_COORDS, SVG_W, SVG_H } from "@/data/europeMapData";

interface Props {
  /** "dark" = hero section (navy bg), "light" = cities section (light bg) */
  variant: "dark" | "light";
  /**
   * Called with the city index (0-8, same order as buildCities in Makers.tsx).
   * Only fired in "light" variant; hero map is purely decorative.
   */
  onCityClick?: (cityIndex: number) => void;
  className?: string;
}

const LABEL_OFFSET = 10;
const FONT_SIZE = 10;

function labelPos(
  cx: number,
  cy: number,
  side: "above" | "below" | "left" | "right",
) {
  switch (side) {
    case "right":
      return { x: cx + LABEL_OFFSET, y: cy + 4, anchor: "start" as const };
    case "left":
      return { x: cx - LABEL_OFFSET, y: cy + 4, anchor: "end" as const };
    case "above":
      return { x: cx, y: cy - LABEL_OFFSET, anchor: "middle" as const };
    case "below":
      return { x: cx, y: cy + LABEL_OFFSET + FONT_SIZE, anchor: "middle" as const };
  }
}

export function EuropeMapSVG({ variant, onCityClick, className }: Props) {
  const isDark = variant === "dark";

  /* ── colour palette ─────────────────────────────────────────── */
  const countryFill   = isDark ? "rgba(255,255,255,0.08)" : "#dde4ee";
  const countryStroke = isDark ? "rgba(255,255,255,0.20)" : "#8fa0bb";
  const labelFill     = isDark ? "rgba(255,255,255,0.75)" : "#334155";

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
      {/* Barcelona pulse keyframes */}
      <defs>
        <style>{`
          @keyframes bcn-pulse {
            0%   { r: 9;  opacity: 0.45; }
            100% { r: 18; opacity: 0;    }
          }
          .bcn-pulse { animation: bcn-pulse 2s ease-out infinite; }
        `}</style>
      </defs>

      {/* Country outlines */}
      <g fill={countryFill} stroke={countryStroke} strokeWidth="0.8" strokeLinejoin="round" fillRule="evenodd">
        {EUROPE_COUNTRY_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* City markers */}
      <g>
        {CITY_SVG_COORDS.map((city, idx) => {
          const { svgX: cx, svgY: cy, live, name, labelSide } = city;
          const interactive = !isDark && !!onCityClick;
          const lp = labelPos(cx, cy, labelSide);

          return (
            <g
              key={name}
              onClick={interactive ? () => onCityClick!(idx) : undefined}
              style={{ cursor: interactive ? "pointer" : "default" }}
              role={interactive ? "button" : undefined}
              aria-label={interactive ? name : undefined}
            >
              {live ? (
                <>
                  {/* Animated pulse ring for Barcelona */}
                  <circle
                    className="bcn-pulse"
                    cx={cx}
                    cy={cy}
                    r={9}
                    fill="none"
                    stroke={isDark ? "rgba(37,211,102,0.6)" : "#25d366"}
                    strokeWidth="1.5"
                  />
                  {/* Solid green dot */}
                  <circle cx={cx} cy={cy} r={5.5} fill="#25d366" />
                </>
              ) : (
                /* Amber dot for expanding cities */
                <circle
                  cx={cx}
                  cy={cy}
                  r={isDark ? 3.5 : 4.5}
                  fill={isDark ? "rgba(245,158,11,0.65)" : "#f59e0b"}
                />
              )}

              {/* Label — only in light variant */}
              {!isDark && (
                <text
                  x={lp.x}
                  y={lp.y}
                  textAnchor={lp.anchor}
                  fontSize={FONT_SIZE}
                  fontFamily="system-ui, sans-serif"
                  fontWeight={live ? "600" : "400"}
                  fill={live ? "#16a34a" : labelFill}
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
