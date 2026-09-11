import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Box, Clock, Loader2, ShoppingCart, Truck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import PictureImg from "@/components/PictureImg";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { PUBLISHER_REF } from "@/seo/entities";
import type { PartPage as PartPageData } from "@/data/partsPages";

const SITE_URL = "https://www.dimension3dprints.com";
const SHIPPING_FEE_EUROS = 5;

const FIXED_FAQ = {
  q: {
    es: "¿Estas piezas son oficiales de la marca?",
    en: "Are these official brand parts?",
    ca: "Aquestes peces són oficials de la marca?",
  },
  a: {
    es: "No. Todas las piezas de esta sección son diseños propios o repuestos compatibles, nunca piezas oficiales ni afiliadas a ningún fabricante.",
    en: "No. All parts in this section are original designs or compatible replacements — never official parts and never affiliated with any manufacturer.",
    ca: "No. Totes les peces d'aquesta secció són dissenys propis o recanvis compatibles, mai peces oficials ni afiliades a cap fabricant.",
  },
};

const UI = {
  badge:         { es: "Pieza a medida",          en: "Custom Part",                        ca: "Peça a mida" },
  buyNow:        { es: "Comprar ahora",             en: "Buy now",                            ca: "Comprar ara" },
  sending:       { es: "Redirigiendo...",           en: "Redirecting...",                     ca: "Redirigint..." },
  shippingNote:  { es: "+ €5 de envío (se muestra en el pago)", en: "+ €5 shipping (shown at checkout)", ca: "+ €5 d'enviament (es mostra al pagament)" },
  checkoutErr:   { es: "Error al iniciar el pago. Inténtalo de nuevo.", en: "Payment failed to start. Please try again.", ca: "Error en iniciar el pagament. Torna-ho a intentar." },
  howMade:       { es: "Cómo se fabrica",          en: "How it's made",                      ca: "Com es fabrica" },
  material:      { es: "Material",                  en: "Material",                           ca: "Material" },
  compatible:    { es: "Compatible con",            en: "Compatible with",                    ca: "Compatible amb" },
  inUse:         { es: "En uso",                    en: "In use",                             ca: "En ús" },
  dimensions:    { es: "Medidas",                   en: "Dimensions",                         ca: "Mides" },
  beforeAfter:   { es: "Antes y después",           en: "Before and after",                   ca: "Abans i després" },
  faq:           { es: "Preguntas frecuentes",      en: "Frequently asked questions",         ca: "Preguntes freqüents" },
  inUseAlt:      { es: "en uso",                    en: "in use",                             ca: "en ús" },
  dimensionsAlt: { es: "Medidas de",               en: "Dimensions of",                      ca: "Mides de" },
  beforeAfterAlt:{ es: "Antes y después —",         en: "Before and after —",                 ca: "Abans i després —" },
  madeToOrder:   { es: "Impreso bajo demanda",      en: "Made to order",                      ca: "Imprès sota demanda" },
  shippingCost:  { es: "+ €5 envío",                en: "+ €5 shipping",                      ca: "+ €5 enviament" },
  aboutProduct:  { es: "Descripción",               en: "Description",                        ca: "Descripció" },
};

interface Props {
  part: PartPageData;
}

const PartPage = ({ part }: Props) => {
  const { language } = useLanguage();
  const lang = language === "en" || language === "ca" ? language : "es";
  const L = (x: { es: string; en: string; ca: string }) => x[lang];

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const allFaqs = [...part.faqs, FIXED_FAQ];
  const productSlug = part.slug.replace(/^\//, "");

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: L(part.name),
    description: L(part.description),
    image: `${SITE_URL}${part.images.cover}`,
    url: `${SITE_URL}${part.slug}`,
    brand: { "@type": "Brand", name: "Dimension3D" },
    mpn: `D3D-${productSlug}`,
    keywords: part.keywords.join(", "),
    offers: {
      "@type": "Offer",
      price: part.price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}${part.slug}`,
      seller: PUBLISHER_REF,
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: SHIPPING_FEE_EUROS,
          currency: "EUR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "ES",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "ES",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        merchantReturnLink: `${SITE_URL}/politica-devoluciones`,
      },
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({
      "@type": "Question",
      name: L(faq.q),
      acceptedAnswer: { "@type": "Answer", text: L(faq.a) },
    })),
  };

  const metaTitle = L(part.metaTitle);
  const metaDescription = L(part.problemStatement);

  const handleBuyNow = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-instant-checkout", {
        body: {
          material: part.material,
          exactPrice: part.price,
          fulfillment: "shipping",
          productName: part.name.es,
          shippingRateEuros: SHIPPING_FEE_EUROS,
          language: lang,
        },
      });
      if (error || !data?.checkoutUrl) throw new Error(error?.message ?? "No checkout URL");
      window.location.href = data.checkoutUrl;
    } catch (err: unknown) {
      setIsCheckingOut(false);
      setCheckoutError(L(UI.checkoutErr));
      console.error("Parts checkout error:", err);
    }
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={part.keywords.join(", ")} />
        <link rel="canonical" href={`${SITE_URL}${part.slug}`} />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background pt-20 pb-28 md:pb-20">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto space-y-16">

            {/* Hero — image + all purchase-decision info in one section */}
            <section className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
              <div className="rounded-2xl overflow-hidden bg-secondary/30 aspect-[4/3] md:aspect-square">
                <PictureImg
                  src={part.images.cover}
                  alt={L(part.name)}
                  className="w-full h-full object-contain"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                  {L(UI.badge)}
                </p>

                <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {L(part.name)}
                </h1>

                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  {L(part.problemStatement)}
                </p>

                {/* Trust signals */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground border-y border-border py-3">
                  <span className="flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 shrink-0" />
                    {part.material}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {L(UI.madeToOrder)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 shrink-0" />
                    {L(UI.shippingCost)}
                  </span>
                </div>

                {/* Price + CTA */}
                <div>
                  <p className="text-3xl font-bold text-accent mb-3">€{part.price}</p>
                  <div className="space-y-2">
                    <Button
                      onClick={handleBuyNow}
                      variant="cta"
                      size="lg"
                      className="w-full gap-2"
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {L(UI.sending)}
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          {L(UI.buyNow)} — €{part.price}
                        </>
                      )}
                    </Button>
                    {checkoutError && (
                      <p className="text-xs text-destructive">{checkoutError}</p>
                    )}
                    <p className="text-xs text-muted-foreground text-center">
                      {L(UI.shippingNote)}
                    </p>
                    <p className="text-xs text-muted-foreground italic">{part.disclaimer}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">{L(UI.aboutProduct)}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{L(part.description)}</p>
            </section>

            {/* How it's made */}
            <section className="bg-secondary/30 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-foreground mb-3">{L(UI.howMade)}</h2>
              <p className="text-muted-foreground leading-relaxed">{L(part.howItsMade)}</p>
              <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    {L(UI.material)}
                  </dt>
                  <dd className="font-semibold text-foreground">{part.material}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    {L(UI.compatible)}
                  </dt>
                  <dd className="text-sm text-foreground">{L(part.compatibleWith)}</dd>
                </div>
              </dl>
            </section>

            {/* Usage and dimensions images */}
            <section className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  {L(UI.inUse)}
                </p>
                <div className="rounded-2xl overflow-hidden bg-secondary/30 aspect-video">
                  <PictureImg
                    src={part.images.uso}
                    alt={`${L(part.name)} ${L(UI.inUseAlt)}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  {L(UI.dimensions)}
                </p>
                <div className="rounded-2xl overflow-hidden bg-secondary/30 aspect-video">
                  <PictureImg
                    src={part.images.medidas}
                    alt={`${L(UI.dimensionsAlt)} ${L(part.name)}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </section>

            {/* Before/after — only rendered when the image is provided */}
            {part.images.antesDespues && (
              <section>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  {L(UI.beforeAfter)}
                </p>
                <div className="rounded-2xl overflow-hidden bg-secondary/30">
                  <PictureImg
                    src={part.images.antesDespues}
                    alt={`${L(UI.beforeAfterAlt)} ${L(part.name)}`}
                    className="w-full object-contain"
                  />
                </div>
              </section>
            )}

            {/* FAQ — accordion */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{L(UI.faq)}</h2>
              <Accordion type="single" collapsible className="border border-border rounded-2xl px-2">
                {allFaqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="last:border-0"
                  >
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                      {L(faq.q)}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {L(faq.a)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

          </div>
        </div>
      </main>
      {/* Sticky buy bar — mobile only, keeps price+CTA in same viewport as hero image */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur border-t border-border px-4 py-3 flex items-center gap-3">
        <div className="shrink-0">
          <p className="text-xl font-bold text-accent leading-none">€{part.price}</p>
          <p className="text-xs text-muted-foreground">{L(UI.shippingCost)}</p>
        </div>
        <Button
          onClick={handleBuyNow}
          variant="cta"
          size="lg"
          className="flex-1 gap-2"
          disabled={isCheckingOut}
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {L(UI.sending)}
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {L(UI.buyNow)}
            </>
          )}
        </Button>
      </div>
      <Footer />
      <WhatsAppFloat />
    </>
  );
};

export default PartPage;
