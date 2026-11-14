import { Helmet } from "react-helmet-async";
import SocialMeta from "@/components/SocialMeta";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { AUTHOR_REF, PUBLISHER_REF } from "@/seo/entities";

/**
 * fix-polish §5.2 — new /nl/3d-ontwerp-laten-maken landing targeting
 * the primary query "3d ontwerp laten maken" (pos 70 in GSC). 400+ word
 * body, 4 FAQ entries with FAQPage JSON-LD.
 */
const SITE_URL = "https://www.dimension3dprints.com";
const SLUG = "/nl/3d-ontwerp-laten-maken";
const TITLE = "3D Ontwerp Laten Maken — Vanuit Foto of Idee";
const DESC = "Laat een 3D-model maken op basis van een foto, schets of idee. Vanaf 20 €, binnen 3 dagen. Inclusief printklare STL én optioneel printen in Barcelona.";

const FAQS = [
  { q: "Hoeveel kost het om een 3D-model te laten maken?", a: "Voor eenvoudige onderdelen (clip, beugel, kapje) start het design-werk bij 20 €. Voor complexere geometrie (gescand object, ergonomische behuizing, functioneel mechanisme) 60–120 €. We bevestigen altijd een vaste prijs vóór we beginnen — geen verrassingen bij oplevering." },
  { q: "Welke informatie moet ik aanleveren?", a: "Een foto van het object vanaf minstens drie hoeken met iets voor schaal (munt, liniaal) is meestal genoeg. Als je kritische maten weet, geef ze mee. Voor reverse-engineering van bestaande onderdelen is het handig als je het origineel kunt opsturen; dat levert het meest nauwkeurige model op." },
  { q: "Hoe lang duurt het maken van een 3D-model?", a: "Standaard 2–3 werkdagen voor eenvoudige onderdelen, 3–5 voor complexere geometrie. Je krijgt tussentijds renders ter goedkeuring; na jouw OK leveren we het STL/STEP-bestand én printen we het optioneel in Barcelona." },
  { q: "Kan ik het model daarna zelf aanpassen of laten printen?", a: "Ja. We leveren het STL-bestand (en op verzoek STEP voor parametrische aanpassingen). Als je het model later in een ander materiaal of een andere grootte wilt, laat het weten — kleine schalingen zijn gratis, grotere aanpassingen doen we tegen een vooraf afgesproken bedrag." },
];

const NlDesignService = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description: DESC,
    inLanguage: "nl",
    author: AUTHOR_REF,
    publisher: PUBLISHER_REF,
    datePublished: "2026-11-14",
    dateModified: "2026-11-14",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${SLUG}` },
  };

  return (
    <>
      <Helmet>
        <html lang="nl" />
        <title>{TITLE} — Dimension3D</title>
        <meta name="description" content={DESC} />
        <link rel="canonical" href={`${SITE_URL}${SLUG}`} />
        <link rel="alternate" hrefLang="nl" href={`${SITE_URL}${SLUG}`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/design-your-3d-part`} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>
      <SocialMeta title={TITLE} description={DESC} path={SLUG} />
      <Header />
      <main id="main-content" className="min-h-screen bg-background pt-[calc(var(--header-h)+32px)] md:pt-[calc(var(--header-h)+56px)] pb-20">
        <div className="container px-4 max-w-3xl mx-auto">
          <section data-testid="page-hero" data-page-hero className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">3D Ontwerp op maat</p>
            <h1 className="font-display font-extrabold tracking-tight leading-tight mb-3" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>
              3D Ontwerp Laten Maken — Vanuit Foto, Schets of Idee
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Geen bestand? Geen probleem. Ik maak het 3D-model voor je op basis van een foto, een schets of een omschrijving — en print het optioneel vanuit mijn studio in Barcelona. Vanaf 20 € voor eenvoudige onderdelen, binnen 3 werkdagen.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild className="ds-btn-primary">
                <a href="https://wa.me/34621481490?text=Ik%20wil%20een%203D%20ontwerp%20laten%20maken">
                  Stuur me een WhatsApp <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/nl/3d-ontwerp-van-foto">Of upload direct een foto</Link>
              </Button>
            </div>
          </section>

          <section className="space-y-6 text-[15px] leading-relaxed text-foreground/85">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Wanneer heb je 3D-ontwerpwerk nodig?</h2>
              <p>
                De meeste klanten die hier terechtkomen hebben één van drie dingen: een gebroken onderdeel waarvan geen STL bestaat, een idee voor een product dat ze nog niet hebben uitgetekend, of een bestaand onderdeel dat ze kleiner, groter of in een andere vorm willen. In alle drie de gevallen is de werkwijze vergelijkbaar: je stuurt foto's, we bespreken de gewenste functie en afmetingen, ik model het onderdeel in CAD, en je ziet gerenderde previews voordat er iets in filament gaat.
              </p>
              <p className="mt-3">
                Omdat ik elke dag met FDM-print werk, ontwerp ik met de tolerantiewaarden en vuistregels van het productieproces in gedachten. Dat voorkomt het klassieke probleem van modellen die prachtig op het scherm staan maar onbedrukbare overhangs, te dunne wanden of niet-sluitende passingen hebben.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Welke bestanden lever ik op?</h2>
              <p>
                Je krijgt standaard een printklare STL en — op verzoek — een STEP-bestand voor latere parametrische aanpassingen in CAD. Beide bestanden mag je houden en elders gebruiken. Als je het model direct in Barcelona wilt laten printen, boek ik je plaats in de wachtrij zodra je het design goedkeurt; dat scheelt extra heen-en-weer later.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Werkwijze stap voor stap</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Stuur drie foto's van het object of de referentie, plus eventuele maten die je weet.</li>
                <li>Ik stuur binnen 1 uur in kantooruren een vaste offerte terug — materiaal, maat, prijs, oplevertermijn.</li>
                <li>Na jouw akkoord model ik het onderdeel en stuur ik een gerenderde preview.</li>
                <li>Pas na jouw goedkeuring op de preview ontvang je het STL/STEP en — als je dat wilt — print ik het.</li>
              </ol>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Veelgestelde vragen</h2>
              <dl className="space-y-4">
                {FAQS.map((f, i) => (
                  <div key={i}>
                    <dt className="font-semibold text-foreground">{f.q}</dt>
                    <dd className="text-sm text-muted-foreground mt-1">{f.a}</dd>
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

export default NlDesignService;
