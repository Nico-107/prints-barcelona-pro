import { ChevronDown, ChevronUp, X } from "lucide-react";
import type { ParsedFile, PartSettings, MaterialOption } from "@/lib/pricing";
import { capture } from "@/lib/analytics";

const INFILL_VALUES = [5, 15, 30, 50, 80];

interface PartRowProps {
  part: ParsedFile;
  effectiveMaterial: string;
  effectiveColor: string;
  effectiveInfill: number;
  effectiveWallLoops: number;
  costCents: number;
  isSelected: boolean;
  isCustomized: boolean;
  isExpanded: boolean;
  advancedMode: boolean;
  disabled?: boolean;
  t: (key: string) => string;
  language: string;
  materialOptions: MaterialOption[];
  onSelect: () => void;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
  onToggleExpand: () => void;
  onSettingsChange: (settings: PartSettings) => void;
  onResetSettings: () => void;
  onApplyToAll: () => void;
}

function stripUploadPrefix(name: string): string {
  return name.replace(/^\d+-/, "");
}

export function PartRow({
  part,
  effectiveMaterial,
  effectiveColor,
  effectiveInfill,
  effectiveWallLoops,
  costCents,
  isSelected,
  isCustomized,
  isExpanded,
  advancedMode,
  disabled,
  t,
  language,
  materialOptions,
  onSelect,
  onQtyChange,
  onRemove,
  onToggleExpand,
  onSettingsChange,
  onResetSettings,
  onApplyToAll,
}: PartRowProps) {
  const displayName = stripUploadPrefix(part.name);

  const summaryParts = [effectiveMaterial, `${effectiveInfill}%`];
  if (effectiveColor) summaryParts.push(effectiveColor);
  const summaryLine = summaryParts.join(" · ");

  const rowBg = part.parseError
    ? "bg-destructive/8 border border-destructive/20"
    : isSelected
    ? "bg-accent/12 border border-accent/50"
    : "bg-accent/8 border border-accent/25";

  return (
    <div className={`rounded-xl ${rowBg} transition-colors`}>
      {/* Collapsed row */}
      <div
        className="px-3 py-2.5 cursor-pointer"
        onClick={!part.parseError ? onSelect : undefined}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* File name + summary */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
            {part.parseError ? (
              <p className="text-xs text-destructive">{part.parseError}</p>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-xs text-muted-foreground">{summaryLine}</span>
                {isCustomized && (
                  <span className="text-xs bg-accent/15 text-accent border border-accent/30 rounded-full px-1.5 py-0 leading-4">
                    {t("calc.parts.customized")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price */}
          {!part.parseError && costCents > 0 && (
            <span className="text-sm font-semibold text-foreground shrink-0">
              €{(costCents / 100).toFixed(2)}
            </span>
          )}

          {/* Quantity stepper */}
          {!part.parseError && (
            <div
              className="flex items-center h-7 rounded border border-input bg-background overflow-hidden shrink-0"
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  onQtyChange(part.qty - 1);
                  capture("part_settings_changed", { field: "qty", material: effectiveMaterial });
                }}
                disabled={part.qty <= 1 || disabled}
                className="w-6 h-full flex items-center justify-center text-sm text-foreground hover:bg-muted/40 disabled:opacity-40 transition-colors"
                aria-label={t("calc.parts.qty") + " −"}
              >
                −
              </button>
              <span className="w-8 text-center text-xs font-medium tabular-nums select-none">{part.qty}</span>
              <button
                type="button"
                onClick={() => {
                  onQtyChange(part.qty + 1);
                  capture("part_settings_changed", { field: "qty", material: effectiveMaterial });
                }}
                disabled={part.qty >= 999 || disabled}
                className="w-6 h-full flex items-center justify-center text-sm text-foreground hover:bg-muted/40 disabled:opacity-40 transition-colors"
                aria-label={t("calc.parts.qty") + " +"}
              >
                +
              </button>
            </div>
          )}

          {/* Customize toggle */}
          {!part.parseError && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onToggleExpand(); }}
              disabled={disabled}
              className="shrink-0 text-xs text-accent hover:underline flex items-center gap-0.5 disabled:opacity-50"
              aria-label={isExpanded ? t("calc.parts.done") : t("calc.parts.customize")}
            >
              {isExpanded ? (
                <><ChevronUp className="w-3 h-3" />{t("calc.parts.done")}</>
              ) : (
                <><ChevronDown className="w-3 h-3" />{t("calc.parts.customize")}</>
              )}
            </button>
          )}

          {/* Remove */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRemove(); }}
            disabled={disabled}
            className="p-1 rounded-full hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50"
            aria-label={t("calc.parts.remove")}
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      {isExpanded && !part.parseError && (
        <div
          className="border-t border-accent/20 px-3 py-3 space-y-2"
          onClick={e => e.stopPropagation()}
        >
          {/* Material */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">{t("calc.material")}</label>
            <select
              value={effectiveMaterial}
              onChange={e => {
                onSettingsChange({ ...part.settings, material: e.target.value });
                capture("part_settings_changed", { field: "material", material: e.target.value });
              }}
              disabled={disabled}
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
            >
              {materialOptions.map(m => (
                <option key={m.key} value={m.key}>{m.label} — {t(m.descriptorKey)}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">{t("calc.color")}</label>
            <input
              type="text"
              value={effectiveColor}
              onChange={e => {
                onSettingsChange({ ...part.settings, color: e.target.value });
                capture("part_settings_changed", { field: "color", material: effectiveMaterial });
              }}
              placeholder={t("calc.color.placeholder")}
              disabled={disabled}
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
            />
          </div>

          {/* Infill + walls (Advanced mode only) */}
          {advancedMode && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("calc.infill")}</label>
                <select
                  value={effectiveInfill}
                  onChange={e => {
                    onSettingsChange({ ...part.settings, infill: Number(e.target.value) });
                    capture("part_settings_changed", { field: "infill", material: effectiveMaterial });
                  }}
                  disabled={disabled}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
                >
                  {INFILL_VALUES.map(v => (
                    <option key={v} value={v}>{t(`calc.infill.${v}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("calc.walls")}</label>
                <select
                  value={effectiveWallLoops}
                  onChange={e => {
                    onSettingsChange({ ...part.settings, wallLoops: Number(e.target.value) });
                    capture("part_settings_changed", { field: "walls", material: effectiveMaterial });
                  }}
                  disabled={disabled}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
                >
                  {[2,3,4,5,6,7,8].map(v => (
                    <option key={v} value={v}>{t(`calc.walls.${v}`)}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Multicolour (Advanced mode only) */}
          {advancedMode && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={part.settings?.multicolour ?? false}
                onChange={e => {
                  onSettingsChange({ ...part.settings, multicolour: e.target.checked });
                  capture("part_settings_changed", { field: "multicolour", material: effectiveMaterial });
                }}
                disabled={disabled}
                className="h-3.5 w-3.5 rounded border-input accent-accent"
              />
              <span className="text-xs font-medium text-muted-foreground">{t("calc.multicolour.label")}</span>
            </label>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onResetSettings();
                capture("part_reset_click", {});
              }}
              disabled={disabled}
              className="flex-1 h-7 rounded-md border border-border text-xs text-muted-foreground hover:bg-muted/30 transition-colors disabled:opacity-50"
            >
              {t("calc.parts.reset")}
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyToAll();
                capture("apply_to_all_click", {});
              }}
              disabled={disabled}
              className="flex-1 h-7 rounded-md border border-accent/40 text-xs text-accent hover:bg-accent/8 transition-colors disabled:opacity-50"
            >
              {t("calc.parts.applyAll")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartRow;
