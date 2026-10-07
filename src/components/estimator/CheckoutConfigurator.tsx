import { useMemo } from "react";
import type { ParsedFile, PartDefaults, MaterialOption } from "@/lib/pricing";
import type { QualityKey } from "@/lib/estimator/core";
import type { BundleEstimateV3 } from "@/lib/estimate";
import { EST } from "@/lib/estimator/core";
import { USE_CASES, recommendMaterial, QUALITY_OPTIONS, STRENGTH_PRESETS, strengthFor, canPromiseSameDay } from "@/lib/materialGuide";
import type { UseCase, StrengthKey } from "@/lib/materialGuide";
import { materialDelta, qualityDelta, strengthDelta } from "@/lib/optionDeltas";
import { capture } from "@/lib/analytics";

const INSTANT_MATERIALS = ["PLA", "PETG", "ABS", "ASA", "Nylon", "TPU"];
const COLOUR_SWATCHES = ["White", "Black", "Grey", "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink"];

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
}

export function CheckoutConfigurator({
  parsedFiles, validFiles, bundle, defaults, advancedMode, onAdvancedModeChange,
  materialKey, onMaterialChange, activeUseCase, onUseCaseChange,
  colorPref, onColorChange, notesText, onNotesChange,
  quality, onQualityChange, infillPct, wallLoops, onInfillChange, onWallLoopsChange,
  supports, onSupportsChange, orientation, onOrientationChange,
  urgency, onUrgencyChange, materialOptions, disabled, t,
}: CheckoutConfiguratorProps) {
  const deltas = useMemo(() => {
    const vf = validFiles;
    if (!vf.length) return { materials: {} as Record<string, string>, qualities: {} as Record<string, string>, strengths: {} as Record<string, string> };
    const materials: Record<string, string> = {};
    for (const m of INSTANT_MATERIALS) materials[m] = materialDelta(vf, defaults, urgency, m).formatted;
    const qualities: Record<string, string> = {};
    for (const q of QUALITY_OPTIONS) qualities[q.key] = qualityDelta(vf, defaults, urgency, q.key).formatted;
    const strengths: Record<string, string> = {};
    for (const s of STRENGTH_PRESETS) strengths[s.key] = strengthDelta(vf, defaults, urgency, s.key, s.infill, s.walls).formatted;
    return { materials, qualities, strengths };
  }, [validFiles, defaults, urgency]);

  const whyLine = activeUseCase ? t(`calc.use.why.${activeUseCase}`) : null;
  const strengthKey = strengthFor(infillPct, wallLoops);

  const supportsWarning = !supports && bundle.estimates.some(e => e.supportCm3 > 0.05);
  const allSameDay = validFiles.every(f => canPromiseSameDay(f.settings?.material ?? defaults.material));

  const quoteOnlyMaterials = materialOptions.filter(m => !EST.materials[m.key]?.instant);

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

      {/* Use case chips (Simple mode) */}
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
                onClick={() => { onMaterialChange(mat); if (activeUseCase) onUseCaseChange('unsure'); capture("option_chosen", { group: "material", value: mat }); }}
                disabled={disabled}
                className={`text-left px-2.5 py-2 rounded-lg border text-xs transition-colors disabled:opacity-50 ${
                  materialKey === mat ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/60"
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
        {/* Quote-only materials disclosure */}
        {quoteOnlyMaterials.length > 0 && (
          <details className="mt-1.5">
            <summary className="text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground">
              More materials (quote only)
            </summary>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {quoteOnlyMaterials.map(m => (
                <button key={m.key} type="button"
                  onClick={() => { onMaterialChange(m.key); capture("option_chosen", { group: "material", value: m.key }); }}
                  disabled={disabled}
                  className={`px-2 py-1 rounded-md border text-xs transition-colors ${materialKey === m.key ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/50"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Colour */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.color.title")}</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <button type="button" onClick={() => onColorChange("")} disabled={disabled}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${!colorPref ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background hover:border-accent/60"}`}>
            {t("calc.color.any")}
          </button>
          {COLOUR_SWATCHES.map(c => (
            <button key={c} type="button" onClick={() => { onColorChange(c); capture("option_chosen", { group: "colour", value: c }); }} disabled={disabled}
              className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${colorPref === c ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background hover:border-accent/60"}`}>
              {c}
            </button>
          ))}
        </div>
        <input type="text" value={colorPref} onChange={e => onColorChange(e.target.value)} placeholder={t("calc.color.describe")}
          disabled={disabled}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60" />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.notes.label")}</label>
        <textarea value={notesText} onChange={e => onNotesChange(e.target.value)} placeholder={t("calc.notes.placeholder")}
          disabled={disabled} rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 resize-none" />
        <p className="text-xs text-muted-foreground mt-1">{t("calc.notes.reviewHint")}</p>
      </div>

      {/* Advanced-only options */}
      {advancedMode && (
        <>
          {/* Quality */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.quality.title")}</p>
            <div className="space-y-1" role="radiogroup">
              {QUALITY_OPTIONS.map(q => (
                <button key={q.key} type="button" role="radio" aria-checked={quality === q.key}
                  onClick={() => { onQualityChange(q.key); capture("option_chosen", { group: "quality", value: q.key }); }}
                  disabled={disabled}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors disabled:opacity-50 ${quality === q.key ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/60"}`}>
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
                  onClick={() => { onInfillChange(s.infill); onWallLoopsChange(s.walls); capture("option_chosen", { group: "strength", value: s.key }); }}
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

          {/* Supports */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.supports.title")}</p>
            <div className="flex gap-2" role="radiogroup">
              {([true, false] as const).map(v => (
                <button key={String(v)} type="button" role="radio" aria-checked={supports === v}
                  onClick={() => { onSupportsChange(v); capture("option_chosen", { group: "supports", value: String(v) }); }}
                  disabled={disabled}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs transition-colors disabled:opacity-50 ${supports === v ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/60"}`}>
                  {v ? t("calc.supports.auto") : t("calc.supports.none")}
                </button>
              ))}
            </div>
            {supportsWarning && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{t("calc.supports.warning")}</p>
            )}
          </div>

          {/* Orientation */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("calc.orient.title")}</p>
            <div className="flex gap-2" role="radiogroup">
              {(["auto", 0] as const).map(v => (
                <button key={String(v)} type="button" role="radio" aria-checked={orientation === v}
                  onClick={() => { onOrientationChange(v); capture("option_chosen", { group: "orientation", value: String(v) }); }}
                  disabled={disabled}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs transition-colors disabled:opacity-50 ${orientation === v ? "border-accent bg-accent/8" : "border-border bg-background hover:border-accent/60"}`}>
                  {v === "auto" ? t("calc.orient.auto") : t("calc.orient.keep")}
                </button>
              ))}
            </div>
          </div>

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
        </>
      )}

      {/* Orientation saving line — both modes */}
      {bundle.savedByOrientationEur >= 0.5 && orientation === "auto" && (
        <p className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
          {t("calc.orient.saving")
            .replace("{orientation}", t("calc.orient.name.side"))
            .replace("{amount}", bundle.savedByOrientationEur.toFixed(2))}
        </p>
      )}
    </div>
  );
}

export default CheckoutConfigurator;
