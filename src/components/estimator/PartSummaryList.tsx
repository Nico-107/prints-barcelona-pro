import { X } from "lucide-react";
import type { ParsedFile, PartDefaults } from "@/lib/pricing";
import { effectivePartSettings } from "@/lib/pricing";
import { capture } from "@/lib/analytics";

interface PartSummaryListProps {
  parsedFiles: ParsedFile[];
  /** Files that have a .file blob and can be viewed — used for selectedFileIndex mapping */
  viewableFiles: ParsedFile[];
  defaults: PartDefaults;
  selectedFileIndex: number;
  costByFileId: Record<string, number>;
  disabled?: boolean;
  t: (key: string) => string;
  onSelect: (viewableIdx: number, fileId: string) => void;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

function stripUploadPrefix(name: string): string {
  return name.replace(/^\d+-/, "");
}

export function PartSummaryList({
  parsedFiles, viewableFiles, defaults, selectedFileIndex,
  costByFileId, disabled, t, onSelect, onQtyChange, onRemove,
}: PartSummaryListProps) {
  const scrollClass = parsedFiles.length > 4 ? "max-h-[26dvh] overflow-y-auto" : "";

  return (
    <div className="shrink-0">
      <p className="text-xs font-semibold text-muted-foreground mb-1.5">
        {t("calc.parts.title").replace("{count}", String(parsedFiles.length))}
      </p>
      <div className={`space-y-1 ${scrollClass}`}>
        {parsedFiles.map(f => {
          const viewableIdx = viewableFiles.indexOf(f);
          const isSelected = viewableIdx !== -1 && viewableIdx === selectedFileIndex;
          const eff = f.parseError ? null : effectivePartSettings(f, defaults);
          const costCents = costByFileId[f.id] ?? 0;
          const matColour = eff ? [eff.material, eff.color].filter(Boolean).join(" · ") : null;

          const rowBg = f.parseError
            ? "bg-destructive/8 border border-destructive/20"
            : isSelected
            ? "bg-accent/12 border border-accent/50"
            : "bg-muted/20 border border-border/50 hover:border-border";

          return (
            <div key={f.id} className={`rounded-lg ${rowBg} transition-colors`}>
              <div
                className="flex items-center gap-2 px-3 min-h-[44px] py-1.5"
                style={!f.parseError && viewableIdx !== -1 ? { cursor: "pointer" } : undefined}
                onClick={!f.parseError && viewableIdx !== -1 ? () => onSelect(viewableIdx, f.id) : undefined}
              >
                {/* Name + subtitle */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{stripUploadPrefix(f.name)}</p>
                  {f.parseError ? (
                    <p className="text-[10px] text-destructive leading-tight">{f.parseError}</p>
                  ) : matColour ? (
                    <p className="text-[10px] text-muted-foreground leading-tight">{matColour}</p>
                  ) : null}
                </div>

                {/* Price */}
                {!f.parseError && costCents > 0 && (
                  <span className="text-xs font-semibold text-foreground shrink-0">
                    €{(costCents / 100).toFixed(2)}
                  </span>
                )}

                {/* Qty stepper */}
                {!f.parseError && (
                  <div
                    className="flex items-center h-7 rounded border border-input bg-background overflow-hidden shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onQtyChange(f.id, f.qty - 1);
                        capture("part_settings_changed", { field: "qty", material: eff?.material ?? "" });
                      }}
                      disabled={f.qty <= 1 || disabled}
                      className="w-6 h-full flex items-center justify-center text-sm text-foreground hover:bg-muted/40 disabled:opacity-40 transition-colors"
                      aria-label={t("calc.parts.qty") + " −"}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-xs font-medium tabular-nums select-none">{f.qty}</span>
                    <button
                      type="button"
                      onClick={() => {
                        onQtyChange(f.id, f.qty + 1);
                        capture("part_settings_changed", { field: "qty", material: eff?.material ?? "" });
                      }}
                      disabled={f.qty >= 999 || disabled}
                      className="w-6 h-full flex items-center justify-center text-sm text-foreground hover:bg-muted/40 disabled:opacity-40 transition-colors"
                      aria-label={t("calc.parts.qty") + " +"}
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onRemove(f.id); }}
                  disabled={disabled}
                  className="p-1 rounded-full hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50"
                  aria-label={t("calc.parts.remove")}
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PartSummaryList;
