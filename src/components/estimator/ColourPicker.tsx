import { useState, useEffect } from "react";

// owner: edit/remove colours here
export const COLOUR_OPTIONS: { key: string; hex: string }[] = [
  { key: "White",       hex: "#FFFFFF" },
  { key: "Black",       hex: "#222222" },
  { key: "Grey",        hex: "#9E9E9E" },
  { key: "Red",         hex: "#E53935" },
  { key: "Blue",        hex: "#1E88E5" },
  { key: "Green",       hex: "#43A047" },
  { key: "Yellow",      hex: "#FDD835" },
  { key: "Orange",      hex: "#FB8C00" },
  { key: "Purple",      hex: "#8E24AA" },
  { key: "Pink",        hex: "#EC407A" },
  { key: "Brown",       hex: "#795548" },
  { key: "Beige",       hex: "#D7CCC8" },
  { key: "Silver",      hex: "#BDBDBD" },
  { key: "Gold",        hex: "#FFD600" },
  { key: "Transparent", hex: "transparent" },
];

const NAMED_KEYS = COLOUR_OPTIONS.map(o => o.key);
const isExternalCustom = (v: string) => v !== "" && !NAMED_KEYS.includes(v);

interface ColourPickerProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  t: (key: string) => string;
}

export function ColourPicker({ value, onChange, disabled = false, t }: ColourPickerProps) {
  const [customMode, setCustomMode] = useState(() => isExternalCustom(value));
  const [customText, setCustomText] = useState(() => isExternalCustom(value) ? value : "");

  // Sync when value prop changes externally (e.g. scope switch, "Reset to defaults")
  useEffect(() => {
    if (isExternalCustom(value)) {
      setCustomMode(true);
      setCustomText(value);
    } else {
      setCustomMode(false);
      // keep customText so it's ready if user clicks Custom again
    }
  }, [value]);

  const handleSwatch = (key: string) => {
    setCustomMode(false);
    onChange(key);
  };

  const handleCustomClick = () => {
    setCustomMode(true);
    // Do NOT call onChange — leave the stored value unchanged
  };

  const handleCustomInput = (v: string) => {
    setCustomText(v);
    onChange(v);
  };

  const SWATCH_SIZE = 36;

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={t("calc.color.title")}
        className="grid grid-cols-4 min-[420px]:grid-cols-5 sm:grid-cols-6 gap-x-2 gap-y-3"
      >
        {/* Any colour — dashed neutral circle */}
        <div className="min-w-0 flex flex-col items-center gap-1">
          <button
            type="button"
            role="radio"
            aria-checked={!customMode && value === ""}
            aria-label={t("calc.color.name.any")}
            onClick={() => handleSwatch("")}
            disabled={disabled}
            style={{ width: SWATCH_SIZE, height: SWATCH_SIZE }}
            className={`rounded-full border-2 border-dashed flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
              !customMode && value === "" ? "border-accent ring-2 ring-accent ring-offset-1" : "border-border hover:border-accent/60"
            }`}
          >
            {!customMode && value === "" && <span className="w-2 h-2 rounded-full bg-accent" />}
          </button>
          <span className="w-full text-center text-[11px] text-muted-foreground leading-tight break-words">{t("calc.color.name.any")}</span>
        </div>

        {/* Named colour swatches */}
        {COLOUR_OPTIONS.map(opt => {
          const selected = !customMode && value === opt.key;
          const swatchStyle: React.CSSProperties = { width: SWATCH_SIZE, height: SWATCH_SIZE };
          if (opt.key !== "Transparent") swatchStyle.backgroundColor = opt.hex;
          return (
            <div key={opt.key} className="min-w-0 flex flex-col items-center gap-1">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={t(`calc.color.name.${opt.key}`)}
                onClick={() => handleSwatch(opt.key)}
                disabled={disabled}
                style={swatchStyle}
                className={`rounded-full border-2 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                  selected ? "ring-2 ring-accent ring-offset-1 border-accent" : "border-border hover:border-accent/60"
                } ${opt.key === "Transparent" ? "bg-[repeating-conic-gradient(#ccc_0%_25%,#fff_0%_50%)] bg-[length:12px_12px]" : ""}`}
              >
                {selected && opt.key !== "Transparent" && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="drop-shadow-sm">
                    <path d="M2 7L5.5 10.5L12 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {selected && opt.key === "Transparent" && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="drop-shadow-sm">
                    <path d="M2 7L5.5 10.5L12 3" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <span className="w-full text-center text-[11px] text-muted-foreground leading-tight break-words">{t(`calc.color.name.${opt.key}`)}</span>
            </div>
          );
        })}

        {/* Custom colour */}
        <div className="min-w-0 flex flex-col items-center gap-1">
          <button
            type="button"
            role="radio"
            aria-checked={customMode}
            aria-label={t("calc.color.name.Custom")}
            onClick={handleCustomClick}
            disabled={disabled}
            style={{ width: SWATCH_SIZE, height: SWATCH_SIZE }}
            className={`rounded-full border-2 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 bg-gradient-to-br from-red-400 via-blue-400 to-green-400 ${
              customMode ? "ring-2 ring-accent ring-offset-1 border-accent" : "border-border hover:border-accent/60"
            }`}
          >
            {customMode && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="drop-shadow-sm">
                <path d="M2 7L5.5 10.5L12 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <span className="w-full text-center text-[11px] text-muted-foreground leading-tight break-words">{t("calc.color.name.Custom")}</span>
        </div>
      </div>

      {/* Custom colour text input — visible when customMode */}
      {customMode && (
        <input
          type="text"
          value={customText}
          onChange={e => handleCustomInput(e.target.value)}
          placeholder={t("calc.color.customPlaceholder")}
          disabled={disabled}
          className="mt-2 w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          autoFocus
        />
      )}
    </div>
  );
}

export default ColourPicker;
