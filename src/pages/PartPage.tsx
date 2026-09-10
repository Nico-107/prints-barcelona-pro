import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { CheckCircle, Loader2, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import PictureImg from "@/components/PictureImg";
import { Button } from "@/components/ui/button";
import { supabase, supabaseAnon } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { PUBLISHER_REF } from "@/seo/entities";
import type { PartPage as PartPageData } from "@/data/partsPages";

const SITE_URL = "https://www.dimension3dprints.com";

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
  badge:        { es: "Pieza a medida",       en: "Custom Part",                     ca: "Peça a mida" },
  formTitle:    { es: "Pedir este adaptador",  en: "Order this part",                 ca: "Demanar aquesta peça" },
  emailPh:      { es: "Tu email",              en: "Your email",                      ca: "El teu email" },
  phonePh:      { es: "WhatsApp / teléfono",   en: "WhatsApp / phone",                ca: "WhatsApp / telèfon" },
  contactHint:  { es: "Al menos uno de los dos es obligatorio.", en: "At least one contact method is required.", ca: "Com a mínim un dels dos és obligatori." },
  sent:         { es: "¡Pedido enviado!",      en: "Order sent!",                     ca: "Comanda enviada!" },
  sentSub:      { es: "Hemos recibido tu solicitud. Nos pondremos en contacto contigo en menos de 1 hora.", en: "We've received your request. We'll be in touch within 1 hour.", ca: "Hem rebut la teva sol·licitud. Ens posarem en contacte amb tu en menys d'1 hora." },
  submitErr:    { es: "Error al enviar la solicitud. Por favor, inténtalo de nuevo.", en: "Failed to send request. Please try again.", ca: "Error en enviar la sol·licitud. Si us plau, torna-ho a intentar." },
  sending:      { es: "Enviando...",           en: "Sending...",                      ca: "Enviant..." },
  submitBtn:    { es: "Solicitar este adaptador", en: "Request this part",            ca: "Sol·licitar aquesta peça" },
  howMade:      { es: "Cómo se fabrica",       en: "How it's made",                   ca: "Com es fabrica" },
  material:     { es: "Material",              en: "Material",                        ca: "Material" },
  compatible:   { es: "Compatible con",        en: "Compatible with",                 ca: "Compatible amb" },
  inUse:        { es: "En uso",                en: "In use",                          ca: "En ús" },
  dimensions:   { es: "Medidas",               en: "Dimensions",                      ca: "Mides" },
  beforeAfter:  { es: "Antes y después",       en: "Before and after",                ca: "Abans i després" },
  faq:          { es: "Preguntas frecuentes",  en: "Frequently asked questions",      ca: "Preguntes freqüents" },
  inUseAlt:     { es: "en uso",                en: "in use",                          ca: "en ús" },
  dimensionsAlt:{ es: "Medidas de",            en: "Dimensions of",                   ca: "Mides de" },
  beforeAfterAlt:{ es: "Antes y después —",    en: "Before and after —",              ca: "Abans i després —" },
};

interface Props {
  part: PartPageData;
}

const PartPage = ({ part }: Props) => {
  const { language } = useLanguage();
  const lang = language === "en" || language === "ca" ? language : "es";
  const L = (x: { es: string; en: string; ca: string }) => x[lang];

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
          value: 6.0,
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

  const metaTitle = `${L(part.name)} | Dimension3D`;
  const metaDescription = `${L(part.problemStatement)} ${part.keywords.slice(0, 2).join(", ")}.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() && !contactPhone.trim()) {
      setFormError(L(UI.contactHint));
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    try {
      setIsSubmitted(true);
      setIsSubmitting(false);

      supabaseAnon
        .from("quote_requests")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          material: part.material,
          infill: "N/A",
          wall_loops: 0,
          quantity: 1,
          estimated_grams: 0,
          estimated_hours: 0,
          estimated_price_low: part.price,
          estimated_price_high: part.price,
          file_paths: [],
          status: "pending",
          product_slug: productSlug,
          product_name: part.name.es,
          customization: {},
        } as any)
        .then(({ error: dbErr }) => {
          if (dbErr) console.error("quote_requests insert error:", dbErr.message, dbErr);
        });

      supabase.functions
        .invoke("send-catalog-request", {
          body: {
            productSlug: productSlug,
            productName: part.name.es,
            customization: {},
            contactEmail: contactEmail.trim() || null,
            contactPhone: contactPhone.trim() || null,
            priceLow: part.price,
            priceHigh: part.price,
            language: lang,
          },
        })
        .catch(console.error);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setFormError(L(UI.submitErr));
      console.error("Part page submit error:", err);
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
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto space-y-16">

            {/* Hero */}
            <section className="grid md:grid-cols-2 gap-10 items-start">
              <div className="rounded-2xl overflow-hidden bg-secondary/30 aspect-square">
                <PictureImg
                  src={part.images.cover}
                  alt={L(part.name)}
                  className="w-full h-full object-contain"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
                  {L(UI.badge)}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                  {L(part.problemStatement)}
                </h1>
                <p className="text-2xl font-bold text-accent mb-1">€{part.price}</p>
                <p className="text-xs text-muted-foreground mb-6 italic">{part.disclaimer}</p>

                {isSubmitted ? (
                  <div className="rounded-xl bg-whatsapp/10 border border-whatsapp/25 p-6 text-center">
                    <CheckCircle className="w-10 h-10 text-whatsapp mx-auto mb-3" />
                    <p className="font-semibold text-foreground text-lg mb-1">{L(UI.sent)}</p>
                    <p className="text-sm text-muted-foreground">{L(UI.sentSub)}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm font-semibold text-foreground">{L(UI.formTitle)}</p>
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder={L(UI.emailPh)}
                        disabled={isSubmitting}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      />
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder={L(UI.phonePh)}
                        disabled={isSubmitting}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      />
                      <p className="text-xs text-muted-foreground">{L(UI.contactHint)}</p>
                    </div>
                    {formError && <p className="text-xs text-destructive">{formError}</p>}
                    <Button
                      type="submit"
                      variant="cta"
                      size="lg"
                      className="w-full gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {L(UI.sending)}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {L(UI.submitBtn)}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">{L(part.name)}</h2>
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

            {/* FAQ */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">{L(UI.faq)}</h2>
              <dl className="space-y-6">
                {allFaqs.map((faq, i) => (
                  <div
                    key={i}
                    className="border-b border-border pb-6 last:border-0 last:pb-0"
                  >
                    <dt className="font-semibold text-foreground mb-2">{L(faq.q)}</dt>
                    <dd className="text-muted-foreground leading-relaxed">{L(faq.a)}</dd>
                  </div>
                ))}
              </dl>
            </section>

          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
};

export default PartPage;
