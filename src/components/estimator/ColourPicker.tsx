import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { capture } from "@/lib/analytics";

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

function SwatchDot({ hexOrKey }: { hexOrKey: string }) {
  if (hexOrKey === "Transparent") {
    return (
      <span
        className="inline-block w-4 h-4 rounded-full border border-slate-300 bg-[repeating-conic-gradient(#ccc_0%_25%,#fff_0%_50%)] bg-[length:6px_6px] shrink-0"
      />
    );
  }
  if (hexOrKey === "Custom") {
    return <span className="inline-block w-4 h-4 rounded-full border border-slate-300 bg-gradient-to-br from-red-400 via-blue-400 to-green-400 shrink-0" />;
  }
  if (hexOrKey === "Any") {
    return <span className="inline-block w-4 h-4 rounded-full border-2 border-dashed border-slate-400 shrink-0" />;
  }
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border border-slate-300 shrink-0"
      style={{ backgroundColor: hexOrKey }}
    />
  );
}

export function ColourPicker({ value, onChange, disabled = false, t }: ColourPickerProps) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(() => isExternalCustom(value));
  const [customText, setCustomText] = useState(() => isExternalCustom(value) ? value : "");
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync when value prop changes externally
  useEffect(() => {
    if (isExternalCustom(value)) {
      setCustomMode(true);
      setCustomText(value);
    } else {
      setCustomMode(false);
    }
  }, [value]);

  // Close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const p = panelRef.current, t = triggerRef.current;
      if (p && !p.contains(e.target as Node) && t && !t.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const openPanel = () => {
    if (disabled) return;
    const next = !open;
    setOpen(next);
    if (next) capture("color_dropdown_opened", {});
  };

  const handleSelect = (key: string) => {
    setCustomMode(false);
    onChange(key);
    setOpen(false);
  };

  const handleCustomClick = () => {
    setCustomMode(true);
    capture("more_colors_opened", {});
  };

  const handleCustomInput = (v: string) => {
    setCustomText(v);
    onChange(v);
  };

  // Compute the trigger label
  let triggerSwatch: string = "Any";
  let triggerLabel = t("calc.color.name.any");
  if (customMode) {
    triggerSwatch = "Custom";
    triggerLabel = customText || t("calc.color.name.Custom");
  } else if (value && NAMED_KEYS.includes(value)) {
    const opt = COLOUR_OPTIONS.find(o => o.key === value)!;
    triggerSwatch = opt.key === "Transparent" ? "Transparent" : opt.hex;
    triggerLabel = t(`calc.color.name.${opt.key}`);
  }

  return (
    <div className="relative" data-testid="colour-picker">
      <button
        ref={triggerRef}
        type="button"
        onClick={openPanel}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        data-testid="colour-picker-trigger"
        className="w-full h-10 flex items-center justify-between gap-2 px-3 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-900 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          <SwatchDot hexOrKey={triggerSwatch} />
          <span className="truncate">{triggerLabel}</span>
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          ref={panelRef}
          data-testid="colour-picker-panel"
          className="absolute left-0 right-0 top-full mt-1 z-40 rounded-[10px] border border-slate-200 bg-white shadow-lg p-2 max-h-[280px] overflow-y-auto"
          role="listbox"
        >
          <div className="grid grid-cols-2 gap-1">
            {/* Any — "más rápido" tag */}
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm text-left hover:bg-slate-50 ${
                !customMode && value === "" ? "bg-accent/8 text-foreground" : "text-slate-700"
              }`}
              role="option"
              aria-selected={!customMode && value === ""}
            >
              <SwatchDot hexOrKey="Any" />
              <span className="truncate">{t("calc.color.name.any")}</span>
            </button>
            {COLOUR_OPTIONS.map(opt => {
              const selected = !customMode && value === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelect(opt.key)}
                  className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm text-left hover:bg-slate-50 ${
                    selected ? "bg-accent/8 text-foreground" : "text-slate-700"
                  }`}
                  role="option"
                  aria-selected={selected}
                >
                  <SwatchDot hexOrKey={opt.key === "Transparent" ? "Transparent" : opt.hex} />
                  <span className="truncate">{t(`calc.color.name.${opt.key}`)}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => { handleCustomClick(); setOpen(false); }}
              className={`col-span-2 flex items-center gap-2 px-2 py-2 rounded-md text-sm text-left hover:bg-slate-50 ${
                customMode ? "bg-accent/8 text-foreground" : "text-slate-700"
              }`}
              role="option"
              aria-selected={customMode}
            >
              <SwatchDot hexOrKey="Custom" />
              <span className="truncate">{t("calc.color.name.Custom")}</span>
            </button>
          </div>
        </div>
      )}

      {customMode && (
        <input
          type="text"
          value={customText}
          onChange={e => handleCustomInput(e.target.value)}
          placeholder={t("calc.color.customPlaceholder")}
          disabled={disabled}
          className="mt-2 w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-60"
          data-testid="colour-picker-custom-input"
        />
      )}
    </div>
  );
}

export default ColourPicker;
