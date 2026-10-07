import type { ParsedFile } from "@/lib/pricing";

export type Scope = "all" | string; // "all" or a file id

interface PartScopeBarProps {
  validFiles: ParsedFile[];
  scope: Scope;
  costByFileId: Record<string, number>;
  onScopeChange: (scope: Scope) => void;
  t: (key: string) => string;
}

export function PartScopeBar({ validFiles, scope, costByFileId, onScopeChange, t }: PartScopeBarProps) {
  if (validFiles.length <= 1) return null;

  const editingFile = scope !== "all" ? validFiles.find(f => f.id === scope) : null;
  const editingLabel = editingFile
    ? t("calc.scope.editingPart").replace("{name}", editingFile.name.replace(/\.[^.]+$/, ""))
    : t("calc.scope.editingAll");

  return (
    <div className="space-y-1.5">
      <div className="flex overflow-x-auto gap-1 pb-0.5 scrollbar-none">
        {/* All parts tab */}
        <button
          type="button"
          onClick={() => onScopeChange("all")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors whitespace-nowrap ${
            scope === "all"
              ? "border-accent bg-accent text-accent-foreground font-semibold"
              : "border-border bg-background text-muted-foreground hover:border-accent/60 hover:bg-accent/5"
          }`}
        >
          {t("calc.scope.all")}
        </button>

        {/* Per-part tabs */}
        {validFiles.map((f, i) => {
          const isSelected = scope === f.id;
          const hasOverride = f.settings != null && Object.keys(f.settings).length > 0;
          const price = costByFileId[f.id];
          const priceLabel = price != null ? ` · €${(price / 100).toFixed(2)}` : "";
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onScopeChange(f.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors whitespace-nowrap flex items-center gap-1 ${
                isSelected
                  ? "border-accent bg-accent text-accent-foreground font-semibold"
                  : "border-border bg-background text-muted-foreground hover:border-accent/60 hover:bg-accent/5"
              }`}
            >
              {t("calc.scope.part").replace("{n}", String(i + 1))}{priceLabel}
              {hasOverride && (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-accent-foreground/70" : "bg-accent"}`} />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{editingLabel}</p>
    </div>
  );
}

export default PartScopeBar;
