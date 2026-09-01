import { useState, useRef, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
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

// PLA density + typical 15% infill + 2 wall loops (mirrors StlEstimator defaults)
const PLA_DENSITY = 1.24;          // g/cm³
const EFFECTIVE_FILL = 0.269;      // wallFactor(2) + 0.15 * (1 - wallFactor(2))

// File-prep guide slugs by language
const FILE_PREP_SLUG: Record<string, string> = {
  es: "/como-preparar-archivo-impresion-3d",
  ca: "/how-to-prepare-file-for-3d-printing",  // CA has no separate file-prep page yet
  en: "/how-to-prepare-file-for-3d-printing",
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

  const canonicalSlug =
    language === "ca" ? SLUG_CA : language === "en" ? SLUG_EN : SLUG_ES;
  const htmlLang =
    language === "ca" ? "ca" : language === "en" ? "en" : "es";

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
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${SLUG_ES}`} />
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container px-4 max-w-2xl">

          {/* Hero */}
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              {t("checker.badge")}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("checker.heading")}
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {t("checker.subheading")}
            </p>
          </div>

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

        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  );
};

export default FileChecker;
