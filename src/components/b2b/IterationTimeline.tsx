/**
 * Iteration timeline: v1 → feedback → v2 → final.
 * Lead-time estimates are derived from the same working-day rule the
 * configurator uses for its ready date (3 working days per iteration
 * cycle, matching `standard` urgency).
 */
type Lang = "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt";

const COPY: Record<Lang, { heading: string; steps: [string, string, string, string]; wd: string }> = {
  es: { heading: "Iteración rápida", steps: ["v1 — primer prototipo", "Feedback y ajustes", "v2 — refinado", "Final — producción"], wd: "días laborables" },
  ca: { heading: "Iteració ràpida", steps: ["v1 — primer prototip", "Feedback i ajustos", "v2 — refinat", "Final — producció"], wd: "dies laborables" },
  en: { heading: "Fast iteration", steps: ["v1 — first prototype", "Feedback & edits", "v2 — refined", "Final — production"], wd: "business days" },
  de: { heading: "Schnelle Iteration", steps: ["v1 — erster Prototyp", "Feedback & Anpassungen", "v2 — verfeinert", "Final — Produktion"], wd: "Werktage" },
  fr: { heading: "Itération rapide", steps: ["v1 — premier prototype", "Feedback & ajustements", "v2 — affiné", "Final — production"], wd: "jours ouvrés" },
  nl: { heading: "Snelle iteratie", steps: ["v1 — eerste prototype", "Feedback & aanpassingen", "v2 — verfijnd", "Finaal — productie"], wd: "werkdagen" },
  it: { heading: "Iterazione rapida", steps: ["v1 — primo prototipo", "Feedback e aggiustamenti", "v2 — raffinato", "Finale — produzione"], wd: "giorni lavorativi" },
  pt: { heading: "Iteração rápida", steps: ["v1 — primeiro protótipo", "Feedback e ajustes", "v2 — refinado", "Final — produção"], wd: "dias úteis" },
};

export default function IterationTimeline({ lang }: { lang: Lang }) {
  const copy = COPY[lang] ?? COPY.en;
  // 3 working days per iteration — same window the engine uses for `standard`.
  const stepDays = [3, 1, 3, 2];
  return (
    <section data-testid="iteration-timeline" data-page-section="iteration-timeline" className="py-12 md:py-16 bg-secondary/20">
      <div className="container max-w-4xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">{copy.heading}</h2>
        <ol className="grid md:grid-cols-4 gap-4">
          {copy.steps.map((label, i) => (
            <li
              key={i}
              data-step={i + 1}
              className="rounded-xl border border-border bg-background p-4 flex flex-col gap-2"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-semibold text-foreground text-sm leading-snug">{label}</p>
              <p className="text-xs text-muted-foreground" data-step-days={stepDays[i]}>
                {stepDays[i]} {copy.wd}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
