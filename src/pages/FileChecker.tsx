import { useState, useRef, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import SocialMeta from "@/components/SocialMeta";
import { Link } from "react-router-dom";
import { FileBox, X, Loader2, RotateCcw, ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { parseStl } from "@/lib/stlAnalysis";

const StlViewer = lazy(() => import("@/components/StlViewer"));

const SITE_URL = "https://www.dimension3dprints.com";
const MAX_BYTES = 250 * 1024 * 1024;

const SLUG_ES = "/verificador-archivo-3d";
const SLUG_EN = "/3d-file-checker";
const SLUG_CA = "/comprovador-arxiu-3d";
// Section 6.6: five new language variants of the file checker.
const SLUG_DE = "/de/3d-datei-pruefen";
const SLUG_FR = "/fr/verificateur-fichier-3d";
const SLUG_NL = "/nl/3d-bestand-controleren";
const SLUG_IT = "/it/verifica-file-3d";
const SLUG_PT = "/pt/verificador-ficheiro-3d";

const CHECKER_SLUGS: Record<string, string> = {
  es: SLUG_ES, en: SLUG_EN, ca: SLUG_CA,
  de: SLUG_DE, fr: SLUG_FR, nl: SLUG_NL, it: SLUG_IT, pt: SLUG_PT,
};

// PLA density + typical 15% infill + 2 wall loops (mirrors StlEstimator defaults)
const PLA_DENSITY = 1.24;          // g/cm³
const EFFECTIVE_FILL = 0.269;      // wallFactor(2) + 0.15 * (1 - wallFactor(2))

// File-prep guide slugs by language
const FILE_PREP_SLUG: Record<string, string> = {
  es: "/como-preparar-archivo-impresion-3d",
  ca: "/how-to-prepare-file-for-3d-printing",  // CA has no separate file-prep page yet
  en: "/how-to-prepare-file-for-3d-printing",
  de: "/de/3d-druck-datei-vorbereiten",
  fr: "/fr/preparer-fichier-impression-3d",
  nl: "/nl/3d-printbestand-voorbereiden",
  it: "/it/preparare-file-stampa-3d",
  pt: "/pt/preparar-ficheiro-impressao-3d",
};

interface AnalysisResult {
  fileName: string;
  file: File;
  boundingMm: { x: number; y: number; z: number };
  volumeCm3: number;
  weightG: number;
  overhangPct: number;
}

const FileChecker = () => {
  const { t, language } = useLanguage();

  const canonicalSlug = CHECKER_SLUGS[language] ?? SLUG_ES;
  const htmlLang = language;

  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const analyse = async (file: File) => {
    setError(null);
    setResult(null);

    if (!file.name.toLowerCase().endsWith(".stl")) {
      setError(t("checker.error.notStl"));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t("checker.error.tooLarge"));
      return;
    }

    setIsAnalyzing(true);
    try {
      const buf = await file.arrayBuffer();
      const { volumeMm3, overhangPct, boundingBoxMm } = parseStl(buf);
      const volumeCm3 = volumeMm3 / 1000;
      setResult({
        fileName: file.name,
        file,
        boundingMm: boundingBoxMm,
        volumeCm3,
        weightG: volumeCm3 * PLA_DENSITY * EFFECTIVE_FILL,
        overhangPct,
      });
    } catch {
      setError(t("checker.error.parse"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    analyse(files[0]);
  };

  const overhangLabel = (pct: number) => {
    if (pct < 0.05) return t("checker.overhang.fine");
    if (pct < 0.30) return t("checker.overhang.needsSupport");
    return t("checker.overhang.checkOrientation");
  };

  const overhangColor = (pct: number) => {
    if (pct < 0.05) return "text-green-600 dark:text-green-400";
    if (pct < 0.30) return "text-amber-600 dark:text-amber-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const filePrepSlug = FILE_PREP_SLUG[language] ?? FILE_PREP_SLUG.en;

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": t("checker.heading"),
    "description": t("checker.meta.description"),
    "step": [
      { "@type": "HowToStep", "name": t("checker.schema.step1.name"), "text": t("checker.schema.step1.text") },
      { "@type": "HowToStep", "name": t("checker.schema.step2.name"), "text": t("checker.schema.step2.text") },
      { "@type": "HowToStep", "name": t("checker.schema.step3.name"), "text": t("checker.schema.step3.text") },
    ]
  };

  return (
    <>
      <Helmet>
        <html lang={htmlLang} />
        <title>{t("checker.meta.title")}</title>
        <meta name="description" content={t("checker.meta.description")} />
        <link rel="canonical" href={`${SITE_URL}${canonicalSlug}`} />
        <link rel="alternate" hrefLang="es" href={`${SITE_URL}${SLUG_ES}`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}${SLUG_EN}`} />
        <link rel="alternate" hrefLang="ca" href={`${SITE_URL}${SLUG_CA}`} />
        <link rel="alternate" hrefLang="de" href={`${SITE_URL}${SLUG_DE}`} />
        <link rel="alternate" hrefLang="fr" href={`${SITE_URL}${SLUG_FR}`} />
        <link rel="alternate" hrefLang="nl" href={`${SITE_URL}${SLUG_NL}`} />
        <link rel="alternate" hrefLang="it" href={`${SITE_URL}${SLUG_IT}`} />
        <link rel="alternate" hrefLang="pt" href={`${SITE_URL}${SLUG_PT}`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${SLUG_ES}`} />
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
      </Helmet>
      <SocialMeta title={t("checker.meta.title")} description={t("checker.meta.description")} path={canonicalSlug} />

      <Header />

      {/* fix-polish §4.2: compact-hero top padding so the eyebrow isn't
          flush under the header on a tool-first page. */}
      <main id="main-content" className="min-h-screen bg-background pt-[calc(var(--header-h)+32px)] md:pt-[calc(var(--header-h)+56px)] pb-20">
        <div className="container px-4 max-w-2xl">

          {/* Hero */}
          <section data-testid="page-hero" data-page-hero className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              {t("checker.badge")}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("checker.heading")}
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {t("checker.subheading")}
            </p>
          </section>

          {/* Privacy reassurance */}
          <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/30 px-4 py-3 mb-6">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("checker.privacy")}
            </p>
          </div>

          {/* Drop zone — only shown when no result yet */}
          {!result && !isAnalyzing && (
            <div
              className={`rounded-2xl border-2 border-dashed transition-colors cursor-pointer mb-6 ${
                isDragging
                  ? "border-accent bg-accent/5"
                  : "border-border bg-card hover:border-accent/50 hover:bg-accent/3"
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
            >
              <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                  <FileBox className="w-7 h-7 text-accent" />
                </div>
                <p className="text-base font-semibold text-foreground">{t("checker.drop.prompt")}</p>
                <p className="text-sm text-muted-foreground">{t("checker.drop.hint")}</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".stl"
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          {/* Analysing spinner */}
          {isAnalyzing && (
            <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span className="text-sm font-medium">{t("checker.analyzing")}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 mb-4 flex items-start gap-2.5">
              <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Result card */}
          {result && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6 card-shadow space-y-5">
                {/* Filename + reset */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground truncate max-w-[70%]">
                    {result.fileName}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setResult(null); setError(null); }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {t("checker.reset")}
                  </button>
                </div>

                {/* 3D preview */}
                <div className="flex justify-center">
                  <Suspense fallback={<div style={{ width: 280, height: 280, background: "#f0f0f0", borderRadius: 8 }} />}>
                    <StlViewer file={result.file} size={280} />
                  </Suspense>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">{t("checker.result.dimensions")}</p>
                    <p className="font-semibold text-foreground">
                      {result.boundingMm.x.toFixed(1)} × {result.boundingMm.y.toFixed(1)} × {result.boundingMm.z.toFixed(1)} mm
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">{t("checker.result.volume")}</p>
                    <p className="font-semibold text-foreground">
                      {result.volumeCm3 < 1
                        ? `${(result.volumeCm3 * 1000).toFixed(0)} mm³`
                        : `${result.volumeCm3.toFixed(1)} cm³`}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">{t("checker.result.weight")}</p>
                    <p className="font-semibold text-foreground">
                      ~{result.weightG < 1 ? "<1" : result.weightG.toFixed(1)} g
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">{t("checker.result.overhangs")}</p>
                    <p className={`font-semibold ${overhangColor(result.overhangPct)}`}>
                      {overhangLabel(result.overhangPct)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(result.overhangPct * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Overhang disclaimer */}
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  {t("checker.overhang.disclaimer")}
                </p>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <Button asChild variant="cta" size="lg" className="w-full gap-2">
                  <Link to="/#calculator">
                    <ArrowRight className="w-4 h-4" />
                    {t("checker.cta.quote")}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full gap-2 text-sm">
                  <Link to={filePrepSlug}>
                    <BookOpen className="w-4 h-4" />
                    {t("checker.cta.filePrep")}
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* fix-polish §5.5: long-form content — what the checker reads, what each
              number means, what to do next, FAQs. Reaches 450+ words without the
              tool region so SEO quality is preserved on every indexable variant. */}
          <section className="mt-16 space-y-10 text-[15px] leading-relaxed text-foreground/85 max-w-2xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">
                {pickLang(language, {
                  es: "Qué comprueba este verificador",
                  en: "What this checker reads",
                  ca: "Què comprova aquest verificador",
                  de: "Was dieser Prüfer liest",
                  fr: "Ce que ce vérificateur analyse",
                  nl: "Wat deze controle leest",
                  it: "Che cosa controlla questo strumento",
                  pt: "O que este verificador analisa",
                })}
              </h2>
              <p>
                {pickLang(language, {
                  es: "El verificador descompone tu STL en el navegador — nada se sube a nuestros servidores — y mide cuatro cosas que determinan si una pieza se puede imprimir en 3D FDM, cuánto va a costar y qué riesgo hay de fallo. Dimensiones del cubo envolvente para saber si cabe en la plancha (256 × 256 × 261 mm en la Bambu Lab X2D). Volumen cerrado de la malla para estimar peso en PLA con 15% de relleno y 2 vueltas de pared. Peso en gramos para estimar el coste del plástico. Porcentaje de caras colgantes (overhangs) para avisarte cuándo una pieza va a necesitar soportes significativos. Estas cuatro cifras son exactamente las que miramos antes de aceptar un encargo.",
                  en: "The checker reads your STL in the browser — nothing is uploaded to our servers — and measures four things that decide whether a part can be printed on FDM, how much it will cost, and where it could fail. The bounding box so you know whether it fits the build plate (256 × 256 × 261 mm on the Bambu Lab X2D). The closed-mesh volume so a weight estimate is possible in PLA at 15 % infill and 2 wall loops. The weight in grams, which drives the plastic cost. The overhang percentage — the share of surface area that would need supports when printed in the most common orientation — so you know in advance whether to expect a cleaner print or a job with removable support material. Those four numbers are exactly the ones I look at before quoting any job.",
                  ca: "El verificador analitza el teu STL al navegador — res no es puja als nostres servidors — i mesura quatre coses que decideixen si una peça es pot imprimir en FDM, quant costarà i on pot fallar. Dimensions del cub envolvent per saber si cap a la safata (256 × 256 × 261 mm a la Bambu Lab X2D). Volum tancat de la malla per estimar pes en PLA amb 15 % d'emplenat i 2 voltes de paret. Pes en grams per estimar el cost del plàstic. Percentatge de superfícies en voladís per avisar-te quan la peça necessitarà suports. Aquestes quatre xifres són exactament les que miro abans d'acceptar un encàrrec.",
                  de: "Der Prüfer analysiert deine STL direkt im Browser — nichts wird auf unsere Server geladen — und misst vier Dinge, die bestimmen, ob ein Teil per FDM druckbar ist, was es kostet und wo es scheitern könnte. Den Begrenzungsquader, damit du siehst, ob das Teil auf die Druckplatte passt (256 × 256 × 261 mm auf der Bambu Lab X2D). Das geschlossene Netzvolumen für eine Gewichtsschätzung in PLA mit 15 % Füllung und 2 Wandschleifen. Das Gewicht in Gramm als Grundlage für die Materialkosten. Den Überhang-Anteil, also den Flächenanteil, der im gängigsten Druckaufbau Stützmaterial brauchen würde. Genau diese vier Zahlen prüfe ich vor jedem Angebot.",
                  fr: "Le vérificateur analyse ton STL directement dans le navigateur — rien n'est envoyé sur nos serveurs — et mesure quatre choses qui déterminent si une pièce est imprimable en FDM, combien elle coûtera et où elle risque d'échouer. Les dimensions de la boîte englobante pour savoir si la pièce entre dans le plateau (256 × 256 × 261 mm sur la Bambu Lab X2D). Le volume de maillage fermé, nécessaire à l'estimation du poids en PLA à 15 % de remplissage et 2 boucles de paroi. Le poids en grammes, moteur du coût plastique. Le pourcentage de surface en surplomb — ce que les supports devront soutenir dans l'orientation la plus courante. Ces quatre chiffres sont exactement ceux que je regarde avant d'accepter un travail.",
                  nl: "De controle leest je STL in de browser — er wordt niets naar onze servers geüpload — en meet vier dingen die bepalen of een onderdeel op FDM gedrukt kan worden, wat het kost en waar het kan falen. De bounding box zodat je weet of het op het printbed past (256 × 256 × 261 mm op de Bambu Lab X2D). Het gesloten-mesh-volume voor een gewichtsschatting in PLA met 15 % vulling en 2 wandlussen. Het gewicht in gram, de basis van de materiaalkost. Het overhang-percentage — het aandeel oppervlakte dat in de meest gebruikelijke oriëntatie steunmateriaal nodig zou hebben. Precies deze vier getallen kijk ik aan voor ik een opdracht accepteer.",
                  it: "Lo strumento analizza il tuo STL direttamente nel browser — nulla viene caricato sui nostri server — e misura quattro valori che decidono se un pezzo è stampabile in FDM, quanto costerà e dove può fallire. Le dimensioni del parallelepipedo contenitore per sapere se il pezzo sta nella piastra di stampa (256 × 256 × 261 mm sulla Bambu Lab X2D). Il volume di maglia chiusa, necessario per stimare il peso in PLA al 15 % di riempimento e 2 anelli di parete. Il peso in grammi, base per il costo della plastica. La percentuale di superficie in strapiombo, cioè quanto bisognerà sostenere nell'orientamento più comune. Sono esattamente le quattro misure che guardo prima di accettare un lavoro.",
                  pt: "O verificador analisa o teu STL diretamente no browser — nada é enviado para os nossos servidores — e mede quatro coisas que decidem se uma peça se consegue imprimir em FDM, quanto vai custar e onde pode falhar. As dimensões do paralelepípedo envolvente, para saberes se cabe na mesa de impressão (256 × 256 × 261 mm na Bambu Lab X2D). O volume de malha fechada, necessário para estimar o peso em PLA com 15 % de preenchimento e 2 voltas de parede. O peso em gramas, base para o custo do plástico. A percentagem de superfície em saliência, ou seja, quanto terá de ser suportado na orientação mais comum. São exactamente estas quatro medidas que olho antes de aceitar um trabalho.",
                })}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">
                {pickLang(language, {
                  es: "Qué significa cada resultado",
                  en: "What each result means",
                  ca: "Què significa cada resultat",
                  de: "Was jedes Ergebnis bedeutet",
                  fr: "Ce que signifie chaque résultat",
                  nl: "Wat elk resultaat betekent",
                  it: "Cosa significa ogni risultato",
                  pt: "O que significa cada resultado",
                })}
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>{pickLang(language, { es: "Dimensiones", en: "Dimensions", ca: "Dimensions", de: "Abmessungen", fr: "Dimensions", nl: "Afmetingen", it: "Dimensioni", pt: "Dimensões" })}</strong>
                  {" — "}
                  {pickLang(language, {
                    es: "cualquier eje por encima de 256 mm (X/Y) o 261 mm (Z) obliga a dividir la pieza o imprimirla en otra orientación.",
                    en: "any axis above 256 mm (X/Y) or 261 mm (Z) means the part has to be split or re-oriented before it fits the Bambu Lab X2D.",
                    ca: "qualsevol eix per sobre de 256 mm (X/Y) o 261 mm (Z) obliga a dividir la peça o reorientar-la per cabre a la Bambu Lab X2D.",
                    de: "Jede Achse über 256 mm (X/Y) oder 261 mm (Z) zwingt zum Teilen oder Umorientieren der Datei vor dem Druck.",
                    fr: "tout axe au-delà de 256 mm (X/Y) ou 261 mm (Z) impose de découper la pièce ou de la réorienter pour qu'elle entre dans la X2D.",
                    nl: "elke as boven 256 mm (X/Y) of 261 mm (Z) betekent dat het onderdeel gesplitst of heroriënteerd moet worden.",
                    it: "qualunque asse oltre 256 mm (X/Y) o 261 mm (Z) obbliga a dividere il pezzo o a riorientarlo prima della stampa.",
                    pt: "qualquer eixo acima de 256 mm (X/Y) ou 261 mm (Z) obriga a dividir a peça ou a reorientá-la antes da impressão.",
                  })}
                </li>
                <li>
                  <strong>{pickLang(language, { es: "Volumen y peso", en: "Volume and weight", ca: "Volum i pes", de: "Volumen und Gewicht", fr: "Volume et poids", nl: "Volume en gewicht", it: "Volume e peso", pt: "Volume e peso" })}</strong>
                  {" — "}
                  {pickLang(language, {
                    es: "el peso es la señal más fiable del coste. Para orientarte: 10 g ≈ precio mínimo, 50 g ≈ 18 €, 200 g ≈ 40–55 € según el material.",
                    en: "weight is the most reliable cost signal. Rough guide: 10 g ≈ minimum price, 50 g ≈ €18, 200 g ≈ €40–55 depending on material.",
                    ca: "el pes és la millor senyal de cost. Orientativament: 10 g ≈ preu mínim, 50 g ≈ 18 €, 200 g ≈ 40–55 € segons el material.",
                    de: "Das Gewicht ist der zuverlässigste Preisindikator. Richtwert: 10 g ≈ Mindestpreis, 50 g ≈ 18 €, 200 g ≈ 40–55 € je nach Material.",
                    fr: "le poids est le meilleur indicateur du coût. Repère : 10 g ≈ prix minimum, 50 g ≈ 18 €, 200 g ≈ 40–55 € selon le matériau.",
                    nl: "het gewicht is het meest betrouwbare kostensignaal. Richtlijn: 10 g ≈ minimumprijs, 50 g ≈ 18 €, 200 g ≈ 40–55 € afhankelijk van het materiaal.",
                    it: "il peso è il segnale di costo più affidabile. Guida: 10 g ≈ prezzo minimo, 50 g ≈ 18 €, 200 g ≈ 40–55 € a seconda del materiale.",
                    pt: "o peso é o melhor indicador do custo. Orientação: 10 g ≈ preço mínimo, 50 g ≈ 18 €, 200 g ≈ 40–55 € consoante o material.",
                  })}
                </li>
                <li>
                  <strong>{pickLang(language, { es: "Voladizos", en: "Overhangs", ca: "Voladissos", de: "Überhänge", fr: "Surplombs", nl: "Overhang", it: "Strapiombi", pt: "Saliências" })}</strong>
                  {" — "}
                  {pickLang(language, {
                    es: "por debajo del 10 % la pieza suele imprimirse limpia; por encima del 25 % se añaden soportes que dejarán marca; por encima del 40 % toca repensar la orientación o dividir la pieza.",
                    en: "under 10 % the part usually prints cleanly; above 25 % support material is added and leaves a mark on the under-surface; above 40 % the orientation (or the geometry) needs rethinking.",
                    ca: "per sota del 10 % la peça s'imprimeix neta; per sobre del 25 % s'afegeixen suports que deixen marca; per sobre del 40 % cal repensar l'orientació o dividir la peça.",
                    de: "Unter 10 % druckt das Teil meist sauber; über 25 % wird Stützmaterial nötig und hinterlässt Spuren; über 40 % muss die Orientierung oder die Geometrie überdacht werden.",
                    fr: "sous 10 % la pièce s'imprime proprement ; au-dessus de 25 % des supports sont ajoutés et laissent une marque ; au-dessus de 40 % il faut repenser l'orientation ou la géométrie.",
                    nl: "onder 10 % print het onderdeel schoon; boven 25 % wordt steunmateriaal toegevoegd dat sporen achterlaat; boven 40 % moet de oriëntatie of geometrie opnieuw bekeken worden.",
                    it: "sotto il 10 % il pezzo stampa pulito; sopra il 25 % servono supporti che lasciano traccia; sopra il 40 % bisogna ripensare l'orientamento o la geometria.",
                    pt: "abaixo de 10 % a peça imprime limpa; acima de 25 % são adicionados suportes que deixam marca; acima de 40 % é preciso repensar a orientação ou a geometria.",
                  })}
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">
                {pickLang(language, {
                  es: "Qué hacer después",
                  en: "What to do next",
                  ca: "Què fer després",
                  de: "Was du als Nächstes tust",
                  fr: "Que faire ensuite",
                  nl: "Wat te doen daarna",
                  it: "Cosa fare dopo",
                  pt: "O que fazer a seguir",
                })}
              </h2>
              <p>
                {pickLang(language, {
                  es: "Si las cifras encajan y el porcentaje de voladizos es razonable, sube el mismo STL a la calculadora de la home y recibirás precio final con material y acabado en menos de un minuto. Si la pieza es demasiado grande o tiene voladizos complejos, la guía de preparación de archivo explica cómo dividirla o reorientarla. Y si prefieres mandarme el archivo con dudas, un WhatsApp es más rápido que un formulario — lo miro en persona en horario laboral.",
                  en: "If the numbers fit and the overhang share is reasonable, upload the same STL to the home-page calculator for a full quote with material and finish in under a minute. If the part is oversized or has complex overhangs, the file-preparation guide walks through splitting and reorienting. If you'd rather send the file with questions, a WhatsApp beats a form — I look at them personally during business hours.",
                  ca: "Si les xifres encaixen i el percentatge de voladissos és raonable, puja el mateix STL a la calculadora de la home i obtindràs preu final amb material i acabat en menys d'un minut. Si la peça és massa gran o té voladissos complexos, la guia de preparació d'arxiu explica com dividir-la o reorientar-la. I si prefereixes enviar-me l'arxiu amb dubtes, un WhatsApp és més ràpid que un formulari — el miro jo en horari laboral.",
                  de: "Passen die Zahlen und ist der Überhang-Anteil akzeptabel, lade dieselbe STL im Preisrechner auf der Startseite hoch — Angebot mit Material und Finish in weniger als einer Minute. Ist das Teil zu groß oder sind die Überhänge komplex, zeigt der Dateivorbereitungs-Ratgeber Teilen und Umorientieren Schritt für Schritt. Lieber mit Fragen schicken? Eine WhatsApp-Nachricht ist schneller als jedes Formular — ich sehe sie persönlich zu Arbeitszeiten.",
                  fr: "Si les chiffres passent et que le taux de surplombs est raisonnable, envoie le même STL à la calculatrice d'accueil pour un devis complet avec matériau et finition en moins d'une minute. Si la pièce est trop grande ou présente des surplombs complexes, le guide de préparation de fichier détaille le découpage et la réorientation. Pour envoyer le fichier avec des questions, un WhatsApp va plus vite qu'un formulaire — je les lis moi-même en horaire ouvré.",
                  nl: "Als de cijfers kloppen en het overhang-aandeel redelijk is, upload je dezelfde STL op de rekenmachine van de homepage voor een volledige offerte met materiaal en afwerking binnen een minuut. Als het onderdeel te groot is of complexe overhangs heeft, laat de bestandvoorbereidingsgids het splitsen en heroriënteren stap voor stap zien. Liever het bestand met vragen sturen? Een WhatsApp is sneller dan een formulier — ik lees ze persoonlijk tijdens kantoortijden.",
                  it: "Se i numeri tornano e la percentuale di strapiombi è ragionevole, carica lo stesso STL sulla calcolatrice in home per un preventivo completo con materiale e finitura in meno di un minuto. Se il pezzo è troppo grande o ha strapiombi complessi, la guida alla preparazione del file spiega come dividerlo o riorientarlo. Preferisci inviarmi il file con domande? Un WhatsApp è più veloce di un modulo — li leggo io in orario lavorativo.",
                  pt: "Se os números batem certo e a percentagem de saliências é razoável, carrega o mesmo STL na calculadora da página inicial para um orçamento completo com material e acabamento em menos de um minuto. Se a peça for grande demais ou tiver saliências complexas, o guia de preparação de ficheiro mostra como dividir ou reorientar. Preferes enviar o ficheiro com dúvidas? Um WhatsApp é mais rápido do que um formulário — leio-os eu em horário laboral.",
                })}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">
                {pickLang(language, {
                  es: "Preguntas frecuentes",
                  en: "Frequently asked questions",
                  ca: "Preguntes freqüents",
                  de: "Häufige Fragen",
                  fr: "Questions fréquentes",
                  nl: "Veelgestelde vragen",
                  it: "Domande frequenti",
                  pt: "Perguntas frequentes",
                })}
              </h2>
              <dl className="space-y-4">
                {([
                  {
                    q: { es: "¿Mi archivo se guarda en algún sitio?", en: "Is my file uploaded anywhere?", ca: "El meu arxiu es desa enlloc?", de: "Wird meine Datei irgendwo hochgeladen?", fr: "Mon fichier est-il envoyé quelque part ?", nl: "Wordt mijn bestand ergens opgeslagen?", it: "Il mio file viene caricato da qualche parte?", pt: "O meu ficheiro é enviado para algum lado?" },
                    a: { es: "No. El análisis ocurre en tu navegador, el STL no viaja a nuestros servidores. Si decides pedir presupuesto, entonces sí se sube — y se borra tras completar el pedido.", en: "No. The analysis runs in your browser; the STL never travels to our servers. If you then request a quote through the calculator, it uploads at that point — and is deleted once the order is done.", ca: "No. L'anàlisi passa al teu navegador; l'STL no viatja als nostres servidors. Si demanes pressupost per la calculadora, llavors sí es puja — i s'esborra en completar la comanda.", de: "Nein. Die Analyse läuft im Browser, die STL verlässt dein Gerät nicht. Erst wenn du über den Preisrechner ein Angebot anforderst, wird sie hochgeladen — und nach Abschluss der Bestellung gelöscht.", fr: "Non. L'analyse se fait dans ton navigateur ; le STL ne part pas vers nos serveurs. Il n'est envoyé qu'au moment où tu demandes un devis via la calculatrice — et effacé après la fin de la commande.", nl: "Nee. De analyse gebeurt in je browser; de STL gaat niet naar onze servers. Pas als je via de rekenmachine een offerte opvraagt wordt het bestand geüpload — en na afronding gewist.", it: "No. L'analisi avviene nel tuo browser; l'STL non arriva sui nostri server. Se poi richiedi un preventivo tramite la calcolatrice, in quel momento sì — e viene cancellato al termine dell'ordine.", pt: "Não. A análise acontece no teu browser; o STL não viaja para os nossos servidores. Só é enviado se pedires orçamento pela calculadora — e é apagado no fim da encomenda." },
                  },
                  {
                    q: { es: "¿Por qué el peso que calcula el verificador es diferente del presupuesto?", en: "Why is the weight here different from the full quote?", ca: "Per què el pes aquí és diferent del pressupost final?", de: "Warum unterscheidet sich das Gewicht hier vom endgültigen Angebot?", fr: "Pourquoi le poids ici diffère-t-il du devis final ?", nl: "Waarom verschilt het gewicht hier van de uiteindelijke offerte?", it: "Perché il peso qui è diverso dal preventivo finale?", pt: "Porque é que o peso aqui é diferente do orçamento final?" },
                    a: { es: "El verificador asume PLA, 15 % de relleno y 2 vueltas de pared. El presupuesto real cambia con el material elegido, el relleno real y la densidad del material. Para PETG o ABS el peso puede subir hasta un 10 %; para Nylon o PC-CF un 15–20 %.", en: "The checker assumes PLA, 15 % infill, and 2 wall loops. The full quote reflects the material you pick, its density, and the real infill. PETG and ABS come out ~10 % heavier for the same part; Nylon and PC-CF closer to 15–20 % heavier.", ca: "El verificador assumeix PLA, 15 % d'emplenat i 2 voltes de paret. El pressupost real reflecteix el material triat i la seva densitat. Amb PETG o ABS el pes pot pujar un 10 %; amb Nylon o PC-CF un 15–20 %.", de: "Der Prüfer rechnet mit PLA, 15 % Füllung und 2 Wandschleifen. Das echte Angebot hängt vom Material, dessen Dichte und der tatsächlichen Füllung ab. PETG und ABS sind rund 10 % schwerer, Nylon und PC-CF 15–20 %.", fr: "Le vérificateur suppose PLA, 15 % de remplissage et 2 boucles de paroi. Le devis complet reflète le matériau choisi, sa densité et le remplissage réel. PETG et ABS ajoutent ~10 % ; Nylon et PC-CF 15–20 %.", nl: "De controle gaat uit van PLA, 15 % vulling en 2 wandlussen. De echte offerte hangt af van het gekozen materiaal, dichtheid en vulling. PETG en ABS zijn ~10 % zwaarder, Nylon en PC-CF 15–20 %.", it: "Lo strumento assume PLA, 15 % di riempimento e 2 anelli di parete. Il preventivo reale dipende dal materiale scelto, dalla sua densità e dal riempimento effettivo. PETG e ABS pesano ~10 % in più, Nylon e PC-CF 15–20 %.", pt: "O verificador assume PLA, 15 % de preenchimento e 2 voltas de parede. O orçamento real reflete o material escolhido, a sua densidade e o preenchimento real. PETG e ABS pesam ~10 % mais, Nylon e PC-CF 15–20 %." },
                  },
                  {
                    q: { es: "¿Admite OBJ, 3MF o STEP?", en: "Can it read OBJ, 3MF or STEP?", ca: "Admet OBJ, 3MF o STEP?", de: "Unterstützt es OBJ, 3MF oder STEP?", fr: "Lit-il OBJ, 3MF ou STEP ?", nl: "Werkt het ook met OBJ, 3MF of STEP?", it: "Legge OBJ, 3MF o STEP?", pt: "Aceita OBJ, 3MF ou STEP?" },
                    a: { es: "Por ahora solo STL. Para otros formatos, sube el archivo a la calculadora — ahí sí se aceptan OBJ, 3MF y STEP y el presupuesto se calcula igual.", en: "STL only for now. For other formats, upload to the home-page calculator — it accepts OBJ, 3MF, and STEP and calculates a quote the same way.", ca: "De moment només STL. Per altres formats, puja l'arxiu a la calculadora — accepta OBJ, 3MF i STEP i el pressupost es calcula igual.", de: "Vorerst nur STL. Für andere Formate lade die Datei in den Preisrechner auf der Startseite — er akzeptiert OBJ, 3MF und STEP und erstellt das Angebot auf dieselbe Weise.", fr: "STL uniquement pour l'instant. Pour les autres formats, envoie le fichier à la calculatrice — elle accepte OBJ, 3MF et STEP et calcule le devis de la même manière.", nl: "Voorlopig alleen STL. Voor andere formaten upload je naar de homepagerekenmachine — die accepteert OBJ, 3MF en STEP en berekent de offerte op dezelfde manier.", it: "Per ora solo STL. Per altri formati carica il file sulla calcolatrice in home — accetta OBJ, 3MF e STEP e calcola il preventivo nello stesso modo.", pt: "Por agora apenas STL. Para outros formatos usa a calculadora da página inicial — aceita OBJ, 3MF e STEP e calcula o orçamento da mesma forma." },
                  },
                  {
                    q: { es: "Mi pieza aparece con 60 % de voladizos — ¿sigue siendo imprimible?", en: "My part shows 60 % overhangs — is it still printable?", ca: "La meva peça marca 60 % de voladissos — encara es pot imprimir?", de: "Mein Teil zeigt 60 % Überhang — ist es noch druckbar?", fr: "Ma pièce affiche 60 % de surplombs — est-elle imprimable ?", nl: "Mijn onderdeel toont 60 % overhang — is dat nog te printen?", it: "Il mio pezzo mostra il 60 % di strapiombi — si può ancora stampare?", pt: "A minha peça mostra 60 % de saliências — ainda é imprimível?" },
                    a: { es: "Sí, pero con soportes abundantes y acabado peor en la parte inferior. En estos casos suele valer la pena revisar la orientación del modelo o dividir la pieza en dos partes que luego se encolan. Si me mandas el archivo por WhatsApp te digo si vale la pena.", en: "Yes, but with heavy support material and a rougher finish on the under-surface. These jobs usually benefit from re-orientation or splitting the part in two and gluing it after printing. Send me the file over WhatsApp and I'll tell you whether it's worth it.", ca: "Sí, però amb molts suports i un acabat pitjor a la part inferior. En aquests casos sovint convé revisar l'orientació o dividir la peça en dos trossos que s'encolen després. Envia-me l'arxiu per WhatsApp i et diré si val la pena.", de: "Ja, aber mit viel Stützmaterial und rauerer Unterseite. Oft lohnt es sich, die Orientierung zu ändern oder das Teil zu teilen und nach dem Druck zu kleben. Schick mir die Datei per WhatsApp, ich sage dir, ob es sich lohnt.", fr: "Oui, mais avec beaucoup de supports et une finition inférieure moins nette. Ces pièces gagnent souvent à être réorientées ou coupées en deux pour être recollées. Envoie-moi le fichier sur WhatsApp, je te dis si cela vaut le coup.", nl: "Ja, maar met veel steunmateriaal en een ruwere afwerking aan de onderzijde. Vaak is heroriëntatie of het splitsen van het onderdeel en achteraf lijmen beter. Stuur me het bestand via WhatsApp en ik vertel je of het de moeite waard is.", it: "Sì, ma con molti supporti e una finitura peggiore sulla superficie inferiore. Spesso conviene riorientare o dividere il pezzo in due e incollarlo dopo. Mandami il file su WhatsApp e ti dico se vale la pena.", pt: "Sim, mas com muitos suportes e um acabamento mais áspero na parte inferior. Nestes casos muitas vezes compensa reorientar ou dividir a peça em duas e colar depois. Envia-me o ficheiro no WhatsApp e digo-te se vale a pena." },
                  },
                ] as const).map((item, i) => (
                  <div key={i}>
                    <dt className="font-semibold text-foreground">{pickLang(language, item.q)}</dt>
                    <dd className="text-sm text-muted-foreground mt-1">{pickLang(language, item.a)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  );
};

// fix-polish §5.5 — tiny language picker with sensible English fallback.
function pickLang<T extends Partial<Record<string, string>>>(lang: string, labels: T): string {
  return labels[lang] ?? labels.en ?? labels.es ?? "";
}

export default FileChecker;
