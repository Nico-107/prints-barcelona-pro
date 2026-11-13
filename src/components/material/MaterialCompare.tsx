import { Link } from "react-router-dom";

type Lang = "es" | "en" | "ca";

const LINKS: Record<Lang, Record<string, string>> = {
  es: { PLA: "/impresion-pla-barcelona", PETG: "/impresion-petg-barcelona", TPU: "/impresion-tpu-barcelona", GUIDE: "/guia-materiales-impresion-3d" },
  en: { PLA: "/pla-printing-barcelona", PETG: "/petg-printing-barcelona", TPU: "/tpu-printing-barcelona", GUIDE: "/3d-printing-materials-guide" },
  ca: { PLA: "/ca/impressio-pla-barcelona", PETG: "/ca/impressio-petg-barcelona", TPU: "/ca/impressio-tpu-barcelona", GUIDE: "/guia-materiales-impresion-3d" },
};

const COPY: Record<Lang, { heading: string; compareWith: string; guide: string }> = {
  es: { heading: "Compara con otros materiales", compareWith: "Comparar con", guide: "Guía de materiales" },
  ca: { heading: "Compara amb altres materials", compareWith: "Comparar amb", guide: "Guia de materials" },
  en: { heading: "Compare with other materials", compareWith: "Compare with", guide: "Materials guide" },
};

export default function MaterialCompare({ lang, current }: { lang: Lang; current: "PLA" | "PETG" | "TPU" }) {
  const copy = COPY[lang] ?? COPY.en;
  const links = LINKS[lang] ?? LINKS.en;
  const others = (["PLA", "PETG", "TPU"] as const).filter((m) => m !== current);
  return (
    <section data-testid="material-compare" data-page-section="material-compare" className="py-10 md:py-14 bg-secondary/20">
      <div className="container max-w-3xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">{copy.heading}</h2>
        <p className="text-sm text-muted-foreground mb-4">{copy.compareWith}:</p>
        <div className="flex flex-wrap gap-3">
          {others.map((m) => (
            <Link
              key={m}
              to={links[m] ?? "/"}
              data-compare-link
              data-material={m}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:border-accent/50 transition-colors"
            >
              {m}
            </Link>
          ))}
          <Link
            to={links.GUIDE}
            data-compare-link
            data-material="GUIDE"
            className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 text-accent px-4 py-2 text-sm font-medium hover:bg-accent/10 transition-colors"
          >
            {copy.guide} →
          </Link>
        </div>
      </div>
    </section>
  );
}
