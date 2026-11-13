import { Link } from "react-router-dom";

type Lang = "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt";

const LINKS: Record<Lang, Record<string, string>> = {
  es: { PLA: "/impresion-pla-barcelona", PETG: "/impresion-petg-barcelona", TPU: "/impresion-tpu-barcelona", ASA: "/impresion-pla-barcelona", NYLON: "/impresion-petg-barcelona" },
  en: { PLA: "/pla-printing-barcelona", PETG: "/petg-printing-barcelona", TPU: "/tpu-printing-barcelona", ASA: "/pla-printing-barcelona", NYLON: "/petg-printing-barcelona" },
  ca: { PLA: "/ca/impressio-pla-barcelona", PETG: "/ca/impressio-petg-barcelona", TPU: "/ca/impressio-tpu-barcelona", ASA: "/ca/impressio-pla-barcelona", NYLON: "/ca/impressio-petg-barcelona" },
  de: { PLA: "/de/3d-druck-materialien", PETG: "/de/3d-druck-materialien", TPU: "/de/3d-druck-materialien", ASA: "/de/3d-druck-materialien", NYLON: "/de/3d-druck-materialien" },
  fr: { PLA: "/", PETG: "/", TPU: "/", ASA: "/", NYLON: "/" },
  it: { PLA: "/", PETG: "/", TPU: "/", ASA: "/", NYLON: "/" },
  nl: { PLA: "/", PETG: "/", TPU: "/", ASA: "/", NYLON: "/" },
  pt: { PLA: "/", PETG: "/", TPU: "/", ASA: "/", NYLON: "/" },
};

const COPY: Record<Lang, { heading: string; needs: Array<{ need: string; mat: string; because: string }>; }> = {
  es: {
    heading: "Material según necesidad",
    needs: [
      { need: "Resistencia al calor", mat: "ASA", because: "Estable hasta ~100 °C, exteriores" },
      { need: "Exterior / UV", mat: "ASA", because: "UV estable, aguanta sol y lluvia" },
      { need: "Flexible / junta", mat: "TPU", because: "Shore 95A, absorbe golpes" },
      { need: "Rígido / funcional", mat: "PETG", because: "Tenaz y preciso" },
      { need: "Primer borrador económico", mat: "PLA", because: "Más barato, buena precisión" },
    ],
  },
  ca: {
    heading: "Material segons necessitat",
    needs: [
      { need: "Resistència a la calor", mat: "ASA", because: "Estable fins a ~100 °C" },
      { need: "Exterior / UV", mat: "ASA", because: "UV estable" },
      { need: "Flexible / junta", mat: "TPU", because: "Shore 95A" },
      { need: "Rígid / funcional", mat: "PETG", because: "Tenaç i precís" },
      { need: "Primer esborrany econòmic", mat: "PLA", because: "Més barat" },
    ],
  },
  en: {
    heading: "Material by need",
    needs: [
      { need: "Heat resistance", mat: "ASA", because: "Stable up to ~100 °C" },
      { need: "Outdoor / UV", mat: "ASA", because: "UV stable" },
      { need: "Flexible / gasket", mat: "TPU", because: "Shore 95A, shock-absorbing" },
      { need: "Stiff / functional", mat: "PETG", because: "Tough and precise" },
      { need: "Cheap first draft", mat: "PLA", because: "Lowest cost, good accuracy" },
    ],
  },
  de: {
    heading: "Material nach Bedarf",
    needs: [
      { need: "Hitzebeständigkeit", mat: "ASA", because: "Stabil bis ~100 °C" },
      { need: "Außen / UV", mat: "ASA", because: "UV-stabil" },
      { need: "Flexibel / Dichtung", mat: "TPU", because: "Shore 95A" },
      { need: "Steif / funktional", mat: "PETG", because: "Zäh und präzise" },
      { need: "Erster Entwurf günstig", mat: "PLA", because: "Am günstigsten" },
    ],
  },
  fr: {
    heading: "Matière selon le besoin",
    needs: [
      { need: "Résistance thermique", mat: "ASA", because: "Stable jusqu'à ~100 °C" },
      { need: "Extérieur / UV", mat: "ASA", because: "Stable aux UV" },
      { need: "Flexible / joint", mat: "TPU", because: "Shore 95A" },
      { need: "Rigide / fonctionnel", mat: "PETG", because: "Résistant et précis" },
      { need: "Premier prototype éco", mat: "PLA", because: "Le moins cher" },
    ],
  },
  nl: {
    heading: "Materiaal naar behoefte",
    needs: [
      { need: "Hittebestendigheid", mat: "ASA", because: "Stabiel tot ~100 °C" },
      { need: "Buiten / UV", mat: "ASA", because: "UV-stabiel" },
      { need: "Flexibel / afdichting", mat: "TPU", because: "Shore 95A" },
      { need: "Stijf / functioneel", mat: "PETG", because: "Taai en precies" },
      { need: "Goedkope eerste draft", mat: "PLA", because: "Goedkoopste" },
    ],
  },
  it: {
    heading: "Materiale per esigenza",
    needs: [
      { need: "Resistenza al calore", mat: "ASA", because: "Stabile fino a ~100 °C" },
      { need: "Esterno / UV", mat: "ASA", because: "UV stabile" },
      { need: "Flessibile / guarnizione", mat: "TPU", because: "Shore 95A" },
      { need: "Rigido / funzionale", mat: "PETG", because: "Tenace e preciso" },
      { need: "Primo prototipo economico", mat: "PLA", because: "Il più economico" },
    ],
  },
  pt: {
    heading: "Material por necessidade",
    needs: [
      { need: "Resistência ao calor", mat: "ASA", because: "Estável até ~100 °C" },
      { need: "Exterior / UV", mat: "ASA", because: "UV estável" },
      { need: "Flexível / junta", mat: "TPU", because: "Shore 95A" },
      { need: "Rígido / funcional", mat: "PETG", because: "Tenaz e preciso" },
      { need: "Primeiro protótipo barato", mat: "PLA", because: "O mais barato" },
    ],
  },
};

export default function MaterialByNeed({ lang }: { lang: Lang }) {
  const copy = COPY[lang] ?? COPY.en;
  const links = LINKS[lang] ?? LINKS.en;
  return (
    <section data-testid="material-by-need" data-page-section="material-by-need" className="py-12 md:py-16 bg-white">
      <div className="container max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">{copy.heading}</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {copy.needs.map((row, i) => (
            <Link
              key={i}
              to={links[row.mat] ?? "/"}
              data-need-row
              data-material={row.mat}
              className="block rounded-xl border border-border bg-background p-4 hover:border-accent/50 transition-colors"
            >
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{row.need}</p>
              <p className="font-semibold text-foreground">{row.mat}</p>
              <p className="text-xs text-muted-foreground mt-1">{row.because}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
