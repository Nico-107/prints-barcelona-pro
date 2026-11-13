import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { cta } from "@/lib/ctaVocabulary";
import type { Lang } from "@/lib/ctaVocabulary";

type NotFoundStrings = {
  htmlLang: string;
  title: string;
  description: string;
  heading: string;
  body: string;
  back: string;
};

const STRINGS: Record<Lang, NotFoundStrings> = {
  es: {
    htmlLang: "es",
    title: "404 — Página no encontrada",
    description: "La página que buscas no existe. Vuelve al inicio o sube un archivo.",
    heading: "Página no encontrada",
    body: "La dirección que buscas no existe o ha cambiado. Prueba con estos accesos directos.",
    back: "← Volver al inicio",
  },
  ca: {
    htmlLang: "ca",
    title: "404 — Pàgina no trobada",
    description: "La pàgina que busques no existeix. Torna a l'inici o puja un arxiu.",
    heading: "Pàgina no trobada",
    body: "L'adreça que busques no existeix o ha canviat. Prova amb aquests accessos directes.",
    back: "← Tornar a l'inici",
  },
  en: {
    htmlLang: "en",
    title: "404 — Page not found",
    description: "The page you're looking for doesn't exist. Head back home or upload a file.",
    heading: "Page not found",
    body: "The address you're looking for doesn't exist or has moved. Try one of these shortcuts.",
    back: "← Back to home",
  },
  de: {
    htmlLang: "de",
    title: "404 — Seite nicht gefunden",
    description: "Die gesuchte Seite existiert nicht. Zurück zur Startseite oder Datei hochladen.",
    heading: "Seite nicht gefunden",
    body: "Die gesuchte Adresse existiert nicht oder wurde geändert. Versuche es mit diesen Links.",
    back: "← Zurück zur Startseite",
  },
  fr: {
    htmlLang: "fr",
    title: "404 — Page introuvable",
    description: "La page que vous cherchez n'existe pas. Retournez à l'accueil ou envoyez un fichier.",
    heading: "Page introuvable",
    body: "L'adresse recherchée n'existe pas ou a changé. Essayez l'un de ces raccourcis.",
    back: "← Retour à l'accueil",
  },
  nl: {
    htmlLang: "nl",
    title: "404 — Pagina niet gevonden",
    description: "De pagina die je zoekt bestaat niet. Ga terug naar home of upload een bestand.",
    heading: "Pagina niet gevonden",
    body: "Het adres dat je zoekt bestaat niet of is verplaatst. Probeer een van deze snelkoppelingen.",
    back: "← Terug naar home",
  },
  it: {
    htmlLang: "it",
    title: "404 — Pagina non trovata",
    description: "La pagina che cerchi non esiste. Torna alla home o carica un file.",
    heading: "Pagina non trovata",
    body: "L'indirizzo che cerchi non esiste o è cambiato. Prova una di queste scorciatoie.",
    back: "← Torna alla home",
  },
  pt: {
    htmlLang: "pt",
    title: "404 — Página não encontrada",
    description: "A página que procuras não existe. Volta ao início ou envia um ficheiro.",
    heading: "Página não encontrada",
    body: "O endereço que procuras não existe ou mudou. Experimenta um destes atalhos.",
    back: "← Voltar ao início",
  },
};

const HOME_HREF: Record<Lang, string> = {
  es: "/",
  ca: "/ca",
  en: "/3d-printing-service",
  de: "/de/3d-druck-service",
  fr: "/fr/impression-3d-en-ligne",
  nl: "/nl/3d-printen-laten-maken",
  it: "/it/stampa-3d-online",
  pt: "/pt/impressao-3d-online",
};

const NotFound = () => {
  const { language } = useLanguage();
  const location = useLocation();
  // Fallback: infer from path when language context isn't yet set.
  const inferred: Lang = (language as Lang) ?? "es";
  const s = STRINGS[inferred] ?? STRINGS.es;
  const home = HOME_HREF[inferred];
  const upload = home + "#calculator";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <html lang={s.htmlLang} />
        <meta name="robots" content="noindex,follow" />
        <title>{s.title}</title>
        <meta name="description" content={s.description} />
      </Helmet>
      <Header />
      <main id="main-content" className="flex-1 flex items-center justify-center py-20">
        <div className="container px-4 max-w-lg mx-auto text-center">
          <p className="text-7xl font-bold text-accent mb-4">404</p>
          <h1 className="text-2xl font-bold text-foreground mb-3">{s.heading}</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">{s.body}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              to={upload}
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {cta("primary", inferred)}
            </Link>
            <Link
              to={home}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card text-foreground px-5 py-2.5 text-sm font-semibold hover:border-accent/50 transition-colors"
            >
              {s.heading === "Page not found" ? "Home" : s.back.replace(/^[^ ]+\s/, "")}
            </Link>
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card text-foreground px-5 py-2.5 text-sm font-semibold hover:border-accent/50 transition-colors"
            >
              {inferred === "en" ? "Catalogue" : inferred === "ca" ? "Catàleg" : inferred === "de" ? "Katalog" : inferred === "fr" ? "Catalogue" : inferred === "nl" ? "Catalogus" : inferred === "it" ? "Catalogo" : inferred === "pt" ? "Catálogo" : "Catálogo"}
            </Link>
          </div>
          <Link to={home} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {s.back}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
