import { useMemo, useState } from "react";
import type { ParsedFile, PartDefaults, MaterialOption, PartSettings } from "@/lib/pricing";
import { effectivePartSettings, isPartCustomized } from "@/lib/pricing";
import type { QualityKey } from "@/lib/estimator/core";
import type { BundleEstimateV3 } from "@/lib/estimate";
import { EST } from "@/lib/estimator/core";
import { USE_CASES, recommendMaterial, QUALITY_OPTIONS, STRENGTH_PRESETS, strengthFor, canPromiseSameDay } from "@/lib/materialGuide";
import type { UseCase, StrengthKey } from "@/lib/materialGuide";
import { materialDelta, qualityDelta, strengthDelta } from "@/lib/optionDeltas";
import { capture } from "@/lib/analytics";
import { ColourPicker } from "./ColourPicker";
import { PartScopeBar } from "./PartScopeBar";
import type { Scope } from "./PartScopeBar";
import { computeShipDate, formatShipDate } from "@/lib/shipDate";
import { formatEUR } from "@/lib/formatPrice";

const INSTANT_MATERIALS = ["PLA", "PETG", "ABS", "ASA", "Nylon", "TPU"];

interface CheckoutConfiguratorProps {
  parsedFiles: ParsedFile[];
  validFiles: ParsedFile[];
  bundle: BundleEstimateV3;
  defaults: PartDefaults;
  advancedMode: boolean;
  onAdvancedModeChange: (v: boolean) => void;
  materialKey: string;
  onMaterialChange: (v: string) => void;
  activeUseCase: UseCase | null;
  onUseCaseChange: (u: UseCase) => void;
  colorPref: string;
  onColorChange: (v: string) => void;
  notesText: string;
  onNotesChange: (v: string) => void;
  quality: QualityKey;
  onQualityChange: (v: QualityKey) => void;
  infillPct: number;
  wallLoops: number;
  onInfillChange: (v: number) => void;
  onWallLoopsChange: (v: number) => void;
  supports: boolean;
  onSupportsChange: (v: boolean) => void;
  orientation: 'auto' | number;
  onOrientationChange: (v: 'auto' | number) => void;
  urgency: "standard" | "express" | "urgent";
  onUrgencyChange: (v: "standard" | "express" | "urgent") => void;
  materialOptions: MaterialOption[];
  disabled: boolean;
  t: (key: string) => string;
  language: string;
  // Per-part scope (Advanced mode)
  scope?: Scope;
  onScopeChange?: (s: Scope) => void;
  costByFileId?: Record<string, number>;
  onPartSettingsChange?: (id: string, settings: PartSettings) => void;
  onResetPartSettings?: (id: string) => void;
  onApplyToAll?: (id: string) => void;
  onClearFieldFromAllParts?: (field: keyof PartSettings) => number;
  replacedCount?: number | null;
  /** Selected (scoped or first) part — used to drive the Simple-mode qty stepper. */
  activeFileId?: string;
  onQtyChange?: (id: string, qty: number) => void;
}

export function CheckoutConfigurator({
  parsedFiles, validFiles, bundle, defaults, advancedMode, onAdvancedModeChange,
  materialKey, onMaterialChange, activeUseCase, onUseCaseChange,
  colorPref, onColorChange, notesText, onNotesChange,
  quality, onQualityChange, infillPct, wallLoops, onInfillChange, onWallLoopsChange,
  supports, onSupportsChange,
  orientation, onOrientationChange,
  urgency, onUrgencyChange, materialOptions, disabled, t, language,
  scope = "all", onScopeChange, costByFileId = {},
  onPartSettingsChange, onResetPartSettings, onApplyToAll,
  onClearFieldFromAllParts, replacedCount,
  activeFileId, onQtyChange,
}: CheckoutConfiguratorProps) {
  const [noteOpen, setNoteOpen] = useState(!!notesText && notesText.length > 0);

  // Determine if we're in a per-part scope
  const scopedFile = scope !== "all" ? validFiles.find(f => f.id === scope) : null;
  const scopedEff = scopedFile ? effectivePartSettings(scopedFile, defaults) : null;
  const scopedIsCustomized = scopedFile ? isPartCustomized(scopedFile) : false;

  // Effective values for controls — scoped part's effective values or defaults
  const effMaterial = scopedEff ? scopedEff.material : materialKey;
  const effColor    = scopedEff ? scopedEff.color    : colorPref;
  const effQuality  = scopedEff ? scopedEff.quality  : quality;
  const effInfill   = scopedEff ? scopedEff.infill   : infillPct;
  const effWalls    = scopedEff ? scopedEff.wallLoops : wallLoops;

  const handleMaterialChange = (v: string) => {
    if (scopedFile && onPartSettingsChange) {
      onPartSettingsChange(scopedFile.id, { ...(scopedFile.settings ?? {}), material: v });
    } else {
      onMaterialChange(v);
      if (onClearFieldFromAllParts) onClearFieldFromAllParts("material");
    }
    if (activeUseCase) onUseCaseChange("unsure");
    capture("option_chosen", { group: "material", value: v });
  };

  const handleColorChange = (v: string) => {
    if (scopedFile && onPartSettingsChange) {
      onPartSettingsChange(scopedFile.id, { ...(scopedFile.settings ?? {}), color: v });
    } else {
      onColorChange(v);
      if (onClearFieldFromAllParts) onClearFieldFromAllParts("color");
    }
  };

  const handleQualityChange = (v: QualityKey) => {
    if (scopedFile && onPartSettingsChange) {
      onPartSettingsChange(scopedFile.id, { ...(scopedFile.settings ?? {}), quality: v });
    } else {
      onQualityChange(v);
      if (onClearFieldFromAllParts) onClearFieldFromAllParts("quality");
    }
    capture("option_chosen", { group: "quality", value: v });
  };

  const handleStrengthChange = (inf: number, walls: number, key: StrengthKey | 'custom') => {
    if (scopedFile && onPartSettingsChange) {
      onPartSettingsChange(scopedFile.id, { ...(scopedFile.settings ?? {}), infill: inf, wallLoops: walls });
    } else {
      onInfillChange(inf);
      onWallLoopsChange(walls);
      if (onClearFieldFromAllParts) { onClearFieldFromAllParts("infill"); onClearFieldFromAllParts("wallLoops"); }
    }
    capture("option_chosen", { group: "strength", value: key });
  };

  // For delta computation in scoped mode, use just the scoped file
  const deltaFiles = scopedFile ? [scopedFile] : validFiles;
  const deltaDefaults: PartDefaults = scopedFile
    ? { ...defaults, material: effMaterial, color: effColor, quality: effQuality, infill: effInfill, wallLoops: effWalls }
    : defaults;

  const deltas = useMemo(() => {
    const vf = deltaFiles;
    if (!vf.length) return { materials: {} as Record<string, string>, qualities: {} as Record<string, string>, strengths: {} as Record<string, string> };
    const materials: Record<string, string> = {};
    for (const m of INSTANT_MATERIALS) materials[m] = materialDelta(vf, deltaDefaults, urgency, m).formatted;
    const qualities: Record<string, string> = {};
    for (const q of QUALITY_OPTIONS) qualities[q.key] = qualityDelta(vf, deltaDefaults, urgency, q.key).formatted;
    const strengths: Record<string, string> = {};
    for (const s of STRENGTH_PRESETS) strengths[s.key] = strengthDelta(vf, deltaDefaults, urgency, s.key, s.infill, s.walls).formatted;
    return { materials, qualities, strengths };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validFiles, deltaDefaults, urgency, scope]);

  const whyLine = activeUseCase ? t(`calc.use.why.${activeUseCase}`) : null;
  const strengthKey = strengthFor(effInfill, effWalls);

  const allSameDay = validFiles.every(f => canPromiseSameDay(f.settings?.material ?? defaults.material));
  const quoteOnlyMaterials = materialOptions.filter(m => !EST.materials[m.key]?.instant);

  const hasAnyOverrides = validFiles.some(f => isPartCustomized(f));
  const overrideCount = validFiles.filter(f => isPartCustomized(f)).length;

  // Simple-mode qty target — the active part (scope) or first valid file
  const simpleQtyFile = (() => {
    if (activeFileId) return validFiles.find(f => f.id === activeFileId) ?? validFiles[0];
    return validFiles[0];
  })();
  const simpleQty = simpleQtyFile?.qty ?? 1;

  // Ship-date labels for the Plazo pills (Simple mode)
  const now = new Date();
  const shipStd = formatShipDate(computeShipDate(now, "standard"), language);
  const shipExp = formatShipDate(computeShipDate(now, "express"), language);
  const unitPriceStr = (() => {
    if (!simpleQtyFile || simpleQty <= 1) return null;
    const cents = costByFileId[simpleQtyFile.id];
    if (!cents) return null;
    return formatEUR((cents / simpleQty) / 100, language as Parameters<typeof formatEUR>[1]);
  })();

  return (
    <div className="space-y-4">
      {/* Mode toggle at the very top of the right column (conv-27) */}
      <div
        className="inline-flex p-0.5 rounded-[10px] bg-slate-100 text-xs font-medium"
        role="tablist"
        aria-label={t("calc.mode.simple") + " / " + t("calc.mode.advanced")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={!advancedMode}
          data-testid="mode-simple"
          onClick={() => { if (advancedMode) { onAdvancedModeChange(false); capture("config_mode_changed", { mode: "simple" }); } }}
          className={`px-3 py-1.5 rounded-[8px] transition-colors ${!advancedMode ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          {t("calc.mode.simple")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={advancedMode}
          data-testid="mode-advanced"
          onClick={() => { if (!advancedMode) { onAdvancedModeChange(true); capture("config_mode_changed", { mode: "advanced" }); } }}
          className={`px-3 py-1.5 rounded-[8px] transition-colors ${advancedMode ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          {t("calc.mode.advanced")}
        </button>
      </div>

      {/* Simple mode: overrides hint */}
      {!advancedMode && hasAnyOverrides && (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
          <span>{t("calc.scope.someCustom")}</span>
          <button
            type="button"
            onClick={() => {
              if (onClearFieldFromAllParts) {
                (["material", "color", "infill", "wallLoops", "quality", "supports", "orientation"] as (keyof PartSettings)[]).forEach(f => onClearFieldFromAllParts(f));
              }
            }}
            className="text-accent underline text-xs shrink-0"
          >
            {t("calc.scope.makeSame")}
          </button>
        </div>
      )}

      {/* Advanced: PartScopeBar */}
      {advancedMode && validFiles.length > 1 && onScopeChange && (
        <PartScopeBar
          validFiles={validFiles}
          scope={scope}
          costByFileId={costByFileId}
          onScopeChange={onScopeChange}
          t={t}
        />
      )}

      {/* Scoped part header */}
      {advancedMode && scopedFile && (
        <div className="rounded-lg border border-border bg-muted/10 px-3 py-2 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-foreground truncate">{scopedFile.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
              scopedIsCustomized ? "bg-accent/15 text-accent font-semibold" : "bg-muted text-muted-foreground"
            }`}>
              {scopedIsCustomized ? t("calc.scope.custom") : t("calc.scope.same")}
            </span>
          </div>
          {scopedIsCustomized && (
            <div className="flex gap-2">
              <button type="button" onClick={() => onResetPartSettings?.(scopedFile.id)}
                className="text-xs text-muted-foreground hover:text-foreground underline">
                {t("calc.scope.resetToAll")}
              </button>
              <button type="button" onClick={() => onApplyToAll?.(scopedFile.id)}
                className="text-xs text-accent hover:text-accent/80 underline">
                {t("calc.scope.useForAll")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* "Applied to all" confirmation */}
      {replacedCount != null && replacedCount > 0 && (
        <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
          {t("calc.scope.replacedNote").replace("{n}", String(replacedCount))}
        </p>
      )}

      {/* Use-case chips — hidden by default. Prompt §1 keeps them reachable
          through "¿No sabes cuál elegir?" below the material grid, so we wrap
          them in a <details> that renders nothing until the user asks. */}
      {!advancedMode && (
        <details data-testid="use-case-chips" className="sr-only [&[open]]:not-sr-only">
          <summary className="hidden"></summary>
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.use.title")}</p>
          <div className="flex flex-wrap gap-1.5">
            {USE_CASES.map(u => (
              <button key={u.key} type="button"
                onClick={() => {
                  onUseCaseChange(u.key);
                  const mat = recommendMaterial(u.key);
                  if (mat) onMaterialChange(mat);
                  capture("use_case_chosen", { use_case: u.key, material: mat });
                }}
                disabled={disabled}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors disabled:opacity-50 ${
                  activeUseCase === u.key ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background text-foreground hover:border-accent/60 hover:bg-accent/5"
                }`}
              >
                {t(`calc.use.${u.key}`)}
              </button>
            ))}
          </div>
          {whyLine && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {whyLine}{" "}
              <button type="button" onClick={() => onUseCaseChange('unsure')} className="text-accent underline text-xs">
                {t("calc.use.change")}
              </button>
            </p>
          )}
        </details>
      )}

      {/* Advanced group header: Material & colour */}
      {advancedMode && (
        <div>
          <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-0.5">{t("calc.adv.group.material")}</p>
          <p className="text-xs text-muted-foreground mb-2">{t("calc.adv.group.material.hint")}</p>
        </div>
      )}

      {/* Material cards */}
      <div>
        <p className={advancedMode ? "sr-only" : "text-xs font-medium text-muted-foreground mb-2"}>{t("calc.material")}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {INSTANT_MATERIALS.map(mat => {
            const opt = materialOptions.find(m => m.key === mat);
            if (!opt) return null;
            return (
              <button key={mat} type="button"
                data-ph-name="material-chip"
                onClick={() => handleMaterialChange(mat)}
                disabled={disabled}
                className={`text-left px-2.5 py-2 rounded-lg border text-xs transition-colors disabled:opacity-50 ${
                  effMaterial === mat ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/60"
                }`}
              >
                <span className="font-semibold truncate block">{mat}</span>
                {effMaterial === mat && (
                  <p className="text-muted-foreground truncate mt-0.5">{t(opt.descriptorKey)}</p>
                )}
              </button>
            );
          })}
        </div>
        {quoteOnlyMaterials.length > 0 && (
          <details
            className="mt-1.5"
            onToggle={(e) => {
              if ((e.currentTarget as HTMLDetailsElement).open) capture("material_more_opened", {});
            }}
          >
            <summary className="text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground">
              {t("calc.mat.more")}
            </summary>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {quoteOnlyMaterials.map(m => (
                <button key={m.key} type="button"
                  onClick={() => handleMaterialChange(m.key)}
                  disabled={disabled}
                  className={`px-2 py-1 rounded-md border text-xs transition-colors ${effMaterial === m.key ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/50"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </details>
        )}
        {/* "¿No sabes cuál elegir?" — reveals the use-case chips inline per Prompt §1 */}
        {!advancedMode && (
          <button
            type="button"
            onClick={() => {
              const details = document.querySelector('[data-testid="use-case-chips"]') as HTMLDetailsElement | null;
              if (details) details.open = !details.open;
            }}
            className="mt-1.5 text-xs text-accent underline"
          >
            {t("calc.use.title")}
          </button>
        )}
      </div>

      {/* Colour picker — key resets internal customMode state on scope change */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.color.title")}</p>
        <ColourPicker
          key={scope}
          value={effColor}
          onChange={handleColorChange}
          disabled={disabled}
          t={t}
        />
      </div>

      {/* Advanced-only options (non-whole-order) */}
      {advancedMode && (
        <>
          {/* Advanced group header: Quality & strength */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-0.5">{t("calc.adv.group.quality")}</p>
            <p className="text-xs text-muted-foreground mb-2">{t("calc.adv.group.quality.hint")}</p>
          </div>

          {/* Quality */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.quality.title")}</p>
            <div className="space-y-1" role="radiogroup">
              {QUALITY_OPTIONS.map(q => (
                <button key={q.key} type="button" role="radio" aria-checked={effQuality === q.key}
                  onClick={() => handleQualityChange(q.key)}
                  disabled={disabled}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors disabled:opacity-50 ${effQuality === q.key ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/60"}`}>
                  <div>
                    <span className="font-medium">{t(`calc.quality.${q.key}`)}</span>
                    <span className="text-muted-foreground ml-1.5">{t(`calc.quality.hint.${q.key}`)}</span>
                  </div>
                  {deltas.qualities[q.key] && deltas.qualities[q.key] !== "Included" && (
                    <span className={`shrink-0 ml-2 text-[10px] font-medium ${deltas.qualities[q.key].startsWith("+") ? "text-amber-600" : "text-green-600"}`}>{deltas.qualities[q.key]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Strength */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.strength.title")}</p>
            <div className="space-y-1" role="radiogroup">
              {STRENGTH_PRESETS.map(s => (
                <button key={s.key} type="button" role="radio" aria-checked={strengthKey === s.key}
                  onClick={() => handleStrengthChange(s.infill, s.walls, s.key)}
                  disabled={disabled}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors disabled:opacity-50 ${strengthKey === s.key ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/60"}`}>
                  <div>
                    <span className="font-medium">{t(`calc.strength.${s.key}`)}</span>
                    <span className="text-muted-foreground ml-1.5">{t(`calc.strength.hint.${s.key}`)}</span>
                  </div>
                  {deltas.strengths[s.key] && deltas.strengths[s.key] !== "Included" && (
                    <span className={`shrink-0 ml-2 text-[10px] font-medium ${deltas.strengths[s.key].startsWith("+") ? "text-amber-600" : "text-green-600"}`}>{deltas.strengths[s.key]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced group header: Orientation & supports */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-0.5">{t("calc.adv.group.orientation")}</p>
            <p className="text-xs text-muted-foreground mb-2">{t("calc.adv.group.orientation.hint")}</p>
          </div>

          {/* Orientation */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.orient.title")}</p>
            <div className="space-y-1" role="radiogroup">
              {(["auto", 0, 1] as const).map((o) => {
                const isAuto = o === "auto";
                const isCurrent = orientation === o;
                return (
                  <button key={String(o)} type="button" role="radio" aria-checked={isCurrent}
                    onClick={() => onOrientationChange(o)}
                    disabled={disabled}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors disabled:opacity-50 ${isCurrent ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/60"}`}
                  >
                    {isAuto ? t("calc.orient.auto") : o === 0 ? t("calc.orient.keep") : t("calc.orient.name.1")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Supports */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.supports.title")}</p>
            <div className="space-y-1" role="radiogroup">
              <button type="button" role="radio" aria-checked={supports}
                onClick={() => onSupportsChange(true)}
                disabled={disabled}
                className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors disabled:opacity-50 ${supports ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/60"}`}
              >
                {t("calc.supports.auto")}
              </button>
              <button type="button" role="radio" aria-checked={!supports}
                onClick={() => onSupportsChange(false)}
                disabled={disabled}
                className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors disabled:opacity-50 ${!supports ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/60"}`}
              >
                {t("calc.supports.none")}
              </button>
            </div>
            {!supports && (
              <p className="text-xs text-amber-600 mt-1.5">{t("calc.supports.warning")}</p>
            )}
          </div>
        </>
      )}

      {/* Whole-order section: urgency (Advanced) + notes */}
      {advancedMode && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{t("calc.scope.wholeOrder")}</p>
          <div className="space-y-4">
            {/* Urgency */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.urgency.heading")}</p>
              <div className="space-y-1" role="radiogroup">
                {(["standard", "express", "urgent"] as const).map(u => {
                  const isUrgent = u === "urgent";
                  const label = isUrgent ? t("calc.urgency.urgentNextDay") : t(`calc.urgency.${u}.label`);
                  const time = isUrgent
                    ? (allSameDay ? t("calc.urgency.urgent.time") : t("calc.urgency.urgentNextDay"))
                    : t(`calc.urgency.${u}.time`);
                  return (
                    <button key={u} type="button" role="radio" aria-checked={urgency === u}
                      onClick={() => onUrgencyChange(u)}
                      disabled={disabled}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors disabled:opacity-50 ${urgency === u ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/60"}`}>
                      <span className="font-medium">{label}</span>
                      {u === "express" && <span className="text-muted-foreground ml-1">+25%</span>}
                      {u === "urgent" && <span className="text-muted-foreground ml-1">+60%</span>}
                      <span className="text-muted-foreground ml-1">— {time}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.notes.label")}</label>
              <textarea value={notesText} onChange={e => onNotesChange(e.target.value)} placeholder={t("calc.notes.placeholder")}
                disabled={disabled} rows={3} data-ph-mask
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 resize-none" />
              <p className="text-xs text-muted-foreground mt-1">{t("calc.notes.reviewHint")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Simple mode: Cantidad + Plazo + Note link (conv-27 §bug 8) */}
      {!advancedMode && (
        <>
          {/* Cantidad */}
          {simpleQtyFile && onQtyChange && (
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("calc.simple.qty")}</p>
              <div className="flex items-center gap-3">
                <div
                  className="inline-flex items-center h-10 rounded-[10px] border border-slate-200 bg-white overflow-hidden"
                  data-testid="simple-qty-stepper"
                >
                  <button
                    type="button"
                    onClick={() => { onQtyChange(simpleQtyFile.id, simpleQty - 1); capture("part_settings_changed", { field: "qty", material: effMaterial }); }}
                    disabled={simpleQty <= 1 || disabled}
                    className="w-10 h-full flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    aria-label="−"
                  >−</button>
                  <span className="w-10 text-center text-sm font-medium tabular-nums select-none">{simpleQty}</span>
                  <button
                    type="button"
                    onClick={() => { onQtyChange(simpleQtyFile.id, simpleQty + 1); capture("part_settings_changed", { field: "qty", material: effMaterial }); }}
                    disabled={simpleQty >= 999 || disabled}
                    className="w-10 h-full flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    aria-label="+"
                  >+</button>
                </div>
                {unitPriceStr && (
                  <span className="text-xs text-slate-500 tabular-nums">{unitPriceStr}{t("calc.simple.perUnit")}</span>
                )}
              </div>
            </div>
          )}

          {/* Plazo — Estándar / Urgente (+25%) */}
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("calc.simple.plazo")}</p>
            <div className="grid grid-cols-2 gap-1.5" role="radiogroup" data-testid="simple-plazo">
              <button
                type="button"
                role="radio"
                aria-checked={urgency === "standard"}
                data-testid="plazo-standard"
                onClick={() => onUrgencyChange("standard")}
                disabled={disabled}
                className={`text-left px-3 py-2 rounded-[10px] border text-xs transition-colors disabled:opacity-50 ${
                  urgency === "standard" ? "border-accent bg-accent/8" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="font-medium block">{t("calc.urgency.standard.label")}</span>
                <span className="text-slate-500 block mt-0.5">{t("calc.simple.shipsOn").replace("{date}", shipStd)}</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={urgency === "express"}
                data-testid="plazo-express"
                onClick={() => onUrgencyChange("express")}
                disabled={disabled}
                className={`text-left px-3 py-2 rounded-[10px] border text-xs transition-colors disabled:opacity-50 ${
                  urgency === "express" ? "border-accent bg-accent/8" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="font-medium block">{t("calc.simple.urgent")} <span className="text-slate-500 font-normal">+25%</span></span>
                <span className="text-slate-500 block mt-0.5">{t("calc.simple.shipsOn").replace("{date}", shipExp)}</span>
              </button>
            </div>
          </div>

          {/* Note — collapsed by default */}
          <div>
            {!noteOpen ? (
              <button
                type="button"
                onClick={() => { setNoteOpen(true); capture("note_opened", {}); }}
                className="text-xs text-accent underline"
                data-testid="add-note-link"
              >
                + {t("calc.simple.addNote")}
              </button>
            ) : (
              <>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t("calc.notes.label")}</label>
                <textarea
                  value={notesText}
                  onChange={e => onNotesChange(e.target.value)}
                  placeholder={t("calc.notes.placeholder")}
                  disabled={disabled}
                  rows={2}
                  data-ph-mask
                  autoFocus
                  className="w-full rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-60 resize-none"
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CheckoutConfigurator;
