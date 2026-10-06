import type { MaterialOption } from "@/lib/pricing";

const INFILL_VALUES = [5, 15, 30, 50, 80];

interface DefaultSettingsProps {
  materialKey: string;
  colorPref: string;
  infillPct: number;
  wallLoops: number;
  multicolour: boolean;
  urgency: "standard" | "express" | "urgent";
  advancedMode: boolean;
  disabled?: boolean;
  t: (key: string) => string;
  materialOptions: MaterialOption[];
  onMaterialChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onInfillChange: (v: number) => void;
  onWallLoopsChange: (v: number) => void;
  onMulticolourChange: (v: boolean) => void;
  onUrgencyChange: (v: "standard" | "express" | "urgent") => void;
  onAdvancedModeChange: (v: boolean) => void;
}

export function DefaultSettings({
  materialKey,
  colorPref,
  infillPct,
  wallLoops,
  multicolour,
  urgency,
  advancedMode,
  disabled,
  t,
  materialOptions,
  onMaterialChange,
  onColorChange,
  onInfillChange,
  onWallLoopsChange,
  onMulticolourChange,
  onUrgencyChange,
  onAdvancedModeChange,
}: DefaultSettingsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("calc.parts.defaultsTitle")}
        </p>
        <div className="flex rounded-full border border-border overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => onAdvancedModeChange(false)}
            className={`px-2.5 py-1 transition-colors ${!advancedMode ? "bg-accent text-accent-foreground font-medium" : "bg-background text-muted-foreground hover:bg-muted/30"}`}
          >
            {t("calc.mode.simple")}
          </button>
          <button
            type="button"
            onClick={() => onAdvancedModeChange(true)}
            className={`px-2.5 py-1 transition-colors border-l border-border ${advancedMode ? "bg-accent text-accent-foreground font-medium" : "bg-background text-muted-foreground hover:bg-muted/30"}`}
          >
            {t("calc.mode.advanced")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={advancedMode ? "" : "col-span-2"}>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.material")}</label>
          <select
            value={materialKey}
            onChange={e => onMaterialChange(e.target.value)}
            disabled={disabled}
            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          >
            {materialOptions.map(m => (
              <option key={m.key} value={m.key}>{m.label} — {t(m.descriptorKey)}</option>
            ))}
          </select>
        </div>
        {advancedMode && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.infill")}</label>
            <select
              value={infillPct}
              onChange={e => onInfillChange(Number(e.target.value))}
              disabled={disabled}
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            >
              {INFILL_VALUES.map(v => (
                <option key={v} value={v}>{t(`calc.infill.${v}`)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Color */}
      <div className="mt-2">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.color")}</label>
        <input
          type="text"
          value={colorPref}
          onChange={e => onColorChange(e.target.value)}
          placeholder={t("calc.color.placeholder")}
          disabled={disabled}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
      </div>

      {advancedMode && (
        <>
          {/* Walls */}
          <div className="mt-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.walls")}</label>
            <select
              value={wallLoops}
              onChange={e => onWallLoopsChange(Number(e.target.value))}
              disabled={disabled}
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            >
              {[2,3,4,5,6,7,8].map(v => (
                <option key={v} value={v}>{t(`calc.walls.${v}`)}</option>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div className="mt-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.urgency.heading")}</label>
            <select
              value={urgency}
              onChange={e => onUrgencyChange(e.target.value as "standard" | "express" | "urgent")}
              disabled={disabled}
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            >
              <option value="standard">{t("calc.urgency.standard.label")} — {t("calc.urgency.standard.time")}</option>
              <option value="express">{t("calc.urgency.express.label")} +25% — {t("calc.urgency.express.time")}</option>
              <option value="urgent">{t("calc.urgency.urgent.label")} +60% — {t("calc.urgency.urgent.time")}</option>
            </select>
          </div>

          {/* Multicolour */}
          <div className="mt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={multicolour}
                onChange={e => onMulticolourChange(e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-input accent-accent"
              />
              <span className="text-xs font-medium text-muted-foreground">{t("calc.multicolour.label")}</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}

export default DefaultSettings;
