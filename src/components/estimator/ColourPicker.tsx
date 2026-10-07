import { useState } from "react";

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

interface ColourPickerProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  t: (key: string) => string;
}

export function ColourPicker({ value, onChange, disabled = false, t }: ColourPickerProps) {
  const namedKeys = COLOUR_OPTIONS.map(o => o.key);
  const isNamed = namedKeys.includes(value) || value === "";
  const isCustom = !isNamed;
  const [customText, setCustomText] = useState(isCustom ? value : "");

  const handleSwatch = (key: string) => {
    onChange(key);
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
        className="flex flex-wrap gap-2"
      >
        {/* Any colour — dashed neutral circle */}
        <div className="flex flex-col items-center gap-0.5" style={{ minWidth: 44, minHeight: 44 }}>
          <button
            type="button"
            role="radio"
            aria-checked={value === ""}
            aria-label={t("calc.color.name.any")}
            onClick={() => handleSwatch("")}
            disabled={disabled}
            style={{ width: SWATCH_SIZE, height: SWATCH_SIZE }}
            className={`rounded-full border-2 border-dashed flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
              value === "" ? "border-accent ring-2 ring-accent ring-offset-1" : "border-border hover:border-accent/60"
            }`}
          >
            {value === "" && <span className="w-2 h-2 rounded-full bg-accent" />}
          </button>
          <span className="text-[11px] text-muted-foreground text-center leading-tight max-w-[48px]">{t("calc.color.name.any")}</span>
        </div>

        {/* Named colour swatches */}
        {COLOUR_OPTIONS.map(opt => {
          const selected = value === opt.key;
          return (
            <div key={opt.key} className="flex flex-col items-center gap-0.5" style={{ minWidth: 44, minHeight: 44 }}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={t(`calc.color.name.${opt.key}`)}
                onClick={() => handleSwatch(opt.key)}
                disabled={disabled}
                style={{ width: SWATCH_SIZE, height: SWATCH_SIZE }}
                className={`rounded-full border-2 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                  selected ? "ring-2 ring-accent ring-offset-1 border-accent" : "border-border hover:border-accent/60"
                } ${opt.key === "Transparent" ? "bg-[repeating-conic-gradient(#ccc_0%_25%,#fff_0%_50%)] bg-[length:12px_12px]" : ""}`}
                {...(opt.key !== "Transparent" ? { style: { width: SWATCH_SIZE, height: SWATCH_SIZE, backgroundColor: opt.hex } } : { style: { width: SWATCH_SIZE, height: SWATCH_SIZE } })}
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
              <span className="text-[11px] text-muted-foreground text-center leading-tight max-w-[48px]">{t(`calc.color.name.${opt.key}`)}</span>
            </div>
          );
        })}

        {/* Custom colour */}
        <div className="flex flex-col items-center gap-0.5" style={{ minWidth: 44, minHeight: 44 }}>
          <button
            type="button"
            role="radio"
            aria-checked={isCustom}
            aria-label={t("calc.color.name.Custom")}
            onClick={() => { onChange(customText); }}
            disabled={disabled}
            style={{ width: SWATCH_SIZE, height: SWATCH_SIZE }}
            className={`rounded-full border-2 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 bg-gradient-to-br from-red-400 via-blue-400 to-green-400 ${
              isCustom ? "ring-2 ring-accent ring-offset-1 border-accent" : "border-border hover:border-accent/60"
            }`}
          >
            {isCustom && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="drop-shadow-sm">
                <path d="M2 7L5.5 10.5L12 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <span className="text-[11px] text-muted-foreground text-center leading-tight max-w-[48px]">{t("calc.color.name.Custom")}</span>
        </div>
      </div>

      {/* Custom colour text input — visible when Custom is selected */}
      {isCustom && (
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
