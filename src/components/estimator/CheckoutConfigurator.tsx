import { useMemo } from "react";
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
}

export function CheckoutConfigurator({
  parsedFiles, validFiles, bundle, defaults, advancedMode, onAdvancedModeChange,
  materialKey, onMaterialChange, activeUseCase, onUseCaseChange,
  colorPref, onColorChange, notesText, onNotesChange,
  quality, onQualityChange, infillPct, wallLoops, onInfillChange, onWallLoopsChange,
  supports: _supports, onSupportsChange: _onSupportsChange,
  orientation: _orientation, onOrientationChange: _onOrientationChange,
  urgency, onUrgencyChange, materialOptions, disabled, t,
  scope = "all", onScopeChange, costByFileId = {},
  onPartSettingsChange, onResetPartSettings, onApplyToAll,
  onClearFieldFromAllParts, replacedCount,
}: CheckoutConfiguratorProps) {

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

  return (
    <div className="space-y-4">
      {/* Mode switch */}
      <div>
        <div className="flex rounded-lg border border-border overflow-hidden text-sm" role="radiogroup" aria-label="Configurator mode">
          <button type="button" role="radio" aria-checked={!advancedMode}
            onClick={() => { onAdvancedModeChange(false); capture("config_mode_changed", { mode: "simple" }); }}
            className={`flex-1 py-2 px-3 transition-colors ${!advancedMode ? "bg-accent text-accent-foreground font-semibold" : "bg-background text-muted-foreground hover:bg-muted/30"}`}>
            {t("calc.mode.simple")}
          </button>
          <button type="button" role="radio" aria-checked={advancedMode}
            onClick={() => { onAdvancedModeChange(true); capture("config_mode_changed", { mode: "advanced" }); }}
            className={`flex-1 py-2 px-3 border-l border-border transition-colors ${advancedMode ? "bg-accent text-accent-foreground font-semibold" : "bg-background text-muted-foreground hover:bg-muted/30"}`}>
            {t("calc.mode.advanced")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {advancedMode ? t("calc.mode.advancedHint") : t("calc.mode.simpleHint")}
        </p>
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

      {/* Use case chips (Simple mode, scope=all only) */}
      {!advancedMode && (
        <div>
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
        </div>
      )}

      {/* Material cards */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.material")}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {INSTANT_MATERIALS.map(mat => {
            const opt = materialOptions.find(m => m.key === mat);
            if (!opt) return null;
            const delta = deltas.materials[mat];
            return (
              <button key={mat} type="button"
                onClick={() => handleMaterialChange(mat)}
                disabled={disabled}
                className={`text-left px-2.5 py-2 rounded-lg border text-xs transition-colors disabled:opacity-50 ${
                  effMaterial === mat ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/60"
                }`}
              >
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span className="font-semibold truncate">{mat}</span>
                  {delta && delta !== "Included" && (
                    <span className={`shrink-0 text-[10px] font-medium ${delta.startsWith("+") ? "text-amber-600" : "text-green-600"}`}>{delta}</span>
                  )}
                </div>
                <p className="text-muted-foreground truncate mt-0.5">{t(opt.descriptorKey)}</p>
              </button>
            );
          })}
        </div>
        {quoteOnlyMaterials.length > 0 && (
          <details className="mt-1.5">
            <summary className="text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground">
              More materials (quote only)
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
      </div>

      {/* Colour picker */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.color.title")}</p>
        <ColourPicker
          value={effColor}
          onChange={handleColorChange}
          disabled={disabled}
          t={t}
        />
      </div>

      {/* Advanced-only options (non-whole-order) */}
      {advancedMode && (
        <>
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
                disabled={disabled} rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 resize-none" />
              <p className="text-xs text-muted-foreground mt-1">{t("calc.notes.reviewHint")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes (Simple mode) */}
      {!advancedMode && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.notes.label")}</label>
          <textarea value={notesText} onChange={e => onNotesChange(e.target.value)} placeholder={t("calc.notes.placeholder")}
            disabled={disabled} rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 resize-none" />
          <p className="text-xs text-muted-foreground mt-1">{t("calc.notes.reviewHint")}</p>
        </div>
      )}
    </div>
  );
}

export default CheckoutConfigurator;
