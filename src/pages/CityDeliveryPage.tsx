import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2, Package, Clock, Globe, MessageCircle, Truck } from "lucide-react";
import Header, { type HeaderCityLanguage } from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { whatsappUrl, ACTIVE_CITY } from "@/config/cities";
import { capture } from "@/lib/analytics";
import type { CityPageConfig } from "@/data/cityDeliveryPages";

const SITE_URL = "https://www.dimension3dprints.com";
const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

const EN_SHARED_FAQS = [
  {
    q: "What file formats do you accept?",
    a: "We accept STL, STEP, OBJ, 3MF, and IGES. Direct exports from SolidWorks, Fusion 360, Onshape, CATIA, and FreeCAD work without any conversion. If you only have a drawing or photo, contact us and we can discuss options.",
  },
  {
    q: "Is there a minimum order?",
    a: "The minimum order is €10. Most single small parts fall between €10 and €40. There is no minimum quantity — we print one-off pieces just as readily as batches of 50.",
  },
  {
    q: "Can you print in my specific material?",
    a: "We stock PLA, PETG, ABS, ASA, TPU, Nylon (PA12/PA6), Polycarbonate, and carbon-fibre composite variants of several materials. If you need a specific colour or grade not listed, ask — we can often source it.",
  },
  {
    q: "How is the price calculated?",
    a: "Price depends on two factors: the weight of the printed part (grams of filament used) and the machine time (hours of print). There are no hidden set-up fees or file review charges. Use the online calculator for an instant estimate.",
  },
];

const ES_SHARED_FAQS = [
  {
    q: "¿Qué formatos de archivo aceptáis?",
    a: "Aceptamos STL, STEP, OBJ, 3MF e IGES. Las exportaciones directas de SolidWorks, Fusion 360, Onshape, CATIA y FreeCAD funcionan sin conversión. Si solo dispones de un plano o una foto, contáctanos y valoramos opciones.",
  },
  {
    q: "¿Hay un pedido mínimo?",
    a: "El pedido mínimo es de €10. La mayoría de piezas individuales pequeñas están entre €10 y €40. No hay cantidad mínima — imprimimos piezas únicas con la misma rapidez que pedidos de 50 unidades.",
  },
  {
    q: "¿Podéis imprimir en mi material específico?",
    a: "Disponemos de PLA, PETG, ABS, ASA, TPU, Nylon (PA12/PA6), Policarbonato y variantes de fibra de carbono de varios materiales. Si necesitas un color o grado específico, consúltanos — a menudo podemos aprovisionarlo.",
  },
  {
    q: "¿Cómo se calcula el precio?",
    a: "El precio depende de dos factores: el peso de la pieza impresa (gramos de filamento consumido) y el tiempo de máquina (horas de impresión). No hay tasas de configuración ni cargos por revisión de archivos. Usa la calculadora online para obtener un presupuesto instantáneo.",
  },
];

const LANG_LABELS: Record<string, string> = {
  de: "Deutsch",
  fr: "Français",
  nl: "Nederlands",
  it: "Italiano",
  pt: "Português",
  ca: "Català",
};

interface Props {
  config: CityPageConfig;
}

const CityDeliveryPage = ({ config }: Props) => {
  const isES = config.lang === "es";
  const PAGE_URL = `${SITE_URL}${config.slug}`;

  const cityLanguages: HeaderCityLanguage[] = (() => {
    const nativeLang = config.nativeSection?.lang;
    const nativeLabels: Record<string, { label: string; aria: string }> = {
      fr: { label: "FR", aria: "Français" },
      de: { label: "DE", aria: "Deutsch" },
      nl: { label: "NL", aria: "Nederlands" },
      it: { label: "IT", aria: "Italiano" },
      pt: { label: "PT", aria: "Português" },
      ca: { label: "CA", aria: "Català" },
    };
    // London, New York — EN only, no toggle
    if (config.lang === "en" && !nativeLang) {
      return [{ code: "en", label: "EN", aria: "English", isActive: true }];
    }
    // Madrid — ES active, EN no-op
    if (config.lang === "es" && !nativeLang) {
      return [
        { code: "es", label: "ES", aria: "Español", isActive: true },
        { code: "en", label: "EN", aria: "English", isActive: false },
      ];
    }
    // Valencia — ES active, EN no-op, CA scrolls to native section
    if (config.lang === "es" && nativeLang === "ca") {
      return [
        { code: "es", label: "ES", aria: "Español", isActive: true },
        { code: "en", label: "EN", aria: "English", isActive: false },
        { code: "ca", label: "CA", aria: "Català", isActive: false, scrollTo: "native-section" },
      ];
    }
    // Paris/Berlin/Amsterdam/Milan/Rome/Lisbon — native scrolls to section, EN active
    if (config.lang === "en" && nativeLang) {
      const n = nativeLabels[nativeLang] ?? { label: nativeLang.toUpperCase(), aria: nativeLang };
      return [
        { code: nativeLang, ...n, isActive: false, scrollTo: "native-section" },
        { code: "en", label: "EN", aria: "English", isActive: true },
      ];
    }
    return [{ code: "en", label: "EN", aria: "English", isActive: true }];
  })();

  const sharedFaqs = isES ? ES_SHARED_FAQS : EN_SHARED_FAQS;
  const allFaqs = [{ q: config.shippingFaqQ, a: config.shippingFaqA }, ...sharedFaqs];

  const secondaryLinkItem = config.secondaryLink ?? {
    to: "/blog/precio-impresion-3d-barcelona",
    label: isES ? "¿Cuánto cuesta la impresión 3D?" : "How much does 3D printing cost?",
    description: isES ? "Precios reales por tamaño y material" : "Real prices by size and material",
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    inLanguage: config.articleInLanguage ?? config.lang,
    headline: config.h1,
    description: config.metaDescription,
    url: PAGE_URL,
    publisher: {
      "@type": "Organization",
      name: "Dimension3D",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` },
    },
    image: `${SITE_URL}/og-image.jpg`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  useEffect(() => {
    capture("city_page_view", { city: config.city, slug: config.slug });
  }, [config.city, config.slug]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang={config.lang} />
        <title>{config.metaTitle}</title>
        <meta name="description" content={config.metaDescription} />
        <link rel="canonical" href={PAGE_URL} />
        {config.articleInLanguage ? (
          <link rel="alternate" hreflang={config.articleInLanguage} href={PAGE_URL} />
        ) : null}
        <meta property="og:title" content={config.metaTitle} />
        <meta property="og:description" content={config.metaDescription} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={config.locale} />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={config.metaTitle} />
        <meta name="twitter:description" content={config.metaDescription} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.jpg`} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header cityLanguages={cityLanguages} />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden hero-gradient">
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0V0zm39 0h1v40h-1V0zM0 0h40v1H0V0zm0 39h40v1H0v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
          <div className="absolute top-12 left-8 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

          <div className="container relative z-10 px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6">
                <Truck className="w-3.5 h-3.5" />
                {config.eyebrowText}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                {config.h1}
              </h1>

              <p className="text-lg md:text-xl text-primary-foreground/85 mb-10 max-w-2xl mx-auto leading-relaxed">
                {config.heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Button variant="cta" size="xl" asChild className="shadow-lg">
                  <Link
                    to="/#calculator"
                    onClick={() => capture("city_cta_click", { city: config.city, type: "calculator" })}
                  >
                    {isES ? `Presupuesto con entrega en ${config.city}` : `Get a quote — delivered to ${config.city}`}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  variant="whatsapp-outline"
                  size="xl"
                  onClick={() => {
                    capture("city_cta_click", { city: config.city, type: "whatsapp" });
                    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(config.whatsappMsg)}`, "_blank");
                  }}
                  className="group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
                  {isES ? "WhatsApp" : "Message Us on WhatsApp"}
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-3 text-primary-foreground/75 text-sm">
                {(isES
                  ? ["Desde €10", "Presupuesto en 1 hora", "Seguimiento incluido", "Sin pedido mínimo", "Sin registro"]
                  : ["From €10", "Quote in 1 hour", "Tracked delivery", "No minimum order", "No account needed"]
                ).map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 bg-primary-foreground/10 border border-primary-foreground/15 rounded-full px-4 py-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cta flex-shrink-0" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path
                d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 46.7C1200 43.3 1320 36.7 1380 33.3L1440 30V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
                fill="hsl(var(--background))"
              />
            </svg>
          </div>
        </section>

        {/* Quick stats */}
        <section className="container px-4 py-12">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {(isES
              ? [
                  { icon: Clock, label: "Tiempo de presupuesto", value: "< 1 hora" },
                  { icon: Truck, label: `Entrega a ${config.city}`, value: config.deliveryDays },
                  { icon: Globe, label: "Países de envío", value: "30+" },
                  { icon: CheckCircle2, label: "Pedido mínimo", value: "€10" },
                ]
              : [
                  { icon: Clock, label: "Quote turnaround", value: "< 1 hour" },
                  { icon: Truck, label: `Delivery to ${config.city}`, value: config.deliveryDays },
                  { icon: Globe, label: "Countries shipped", value: "30+" },
                  { icon: CheckCircle2, label: "Minimum order", value: "€10" },
                ]
            ).map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center p-5 rounded-xl border border-border/50 bg-card">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Native language callout */}
        {config.nativeSection && (
          <section id="native-section" className="bg-accent/10 border-y border-accent/20 py-8">
            <div className="container px-4">
              <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">
                    {LANG_LABELS[config.nativeSection.lang] ?? config.nativeSection.lang.toUpperCase()}
                  </p>
                  <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">
                    {config.nativeSection.headline}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {config.nativeSection.body}
                  </p>
                </div>
                <Button variant="cta" size="lg" asChild className="flex-shrink-0 shadow-sm">
                  <Link
                    to="/#calculator"
                    onClick={() => capture("city_cta_click", { city: config.city, type: "native_cta" })}
                  >
                    {config.nativeSection.ctaLabel}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Content sections */}
        <section className="bg-secondary/20 py-14 md:py-20">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto space-y-16">

              {/* The service — city-specific intro paragraph */}
              {isES ? (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Un estudio. Calidad consistente. Comunicación directa.
                  </h2>
                  <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                    <p>{config.introParagraph}</p>
                    <p>
                      Somos un estudio profesional de impresión 3D FDM con sede en Barcelona. A diferencia de los
                      marketplaces online donde tu archivo pasa por múltiples manos y se enruta a cualquier granja de
                      impresión que acepte el trabajo, somos un único estudio — un equipo, unas mismas máquinas, calidad
                      consistente en cada pedido.
                    </p>
                    <p>
                      Cada impresión es revisada, producida y despachada por las mismas personas. Estamos especializados
                      en FDM (Modelado por Deposición Fundida) en toda la gama de termoplásticos, desde PLA estándar
                      hasta Nylon de grado ingenieril, ASA, Policarbonato y composites de fibra de carbono.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    One studio. Consistent quality. Direct communication.
                  </h2>
                  <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                    <p>{config.introParagraph}</p>
                    <p>
                      We are a professional FDM 3D printing studio based in Barcelona. Unlike online marketplaces where
                      your file passes through multiple hands and gets routed to whichever print farm accepts the job, we
                      are a single studio — one team, one set of machines, consistent quality on every order.
                    </p>
                    <p>
                      Every print is reviewed, produced, and dispatched by the same people. We specialise in FDM (Fused
                      Deposition Modelling) printing across a full range of thermoplastics — from everyday PLA to
                      engineering-grade Nylon, ASA, Polycarbonate, and carbon-fibre composites.
                    </p>
                  </div>
                </div>
              )}

              {/* How it works */}
              {isES ? (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Cómo funciona — completamente remoto
                  </h2>
                  <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                    <p>No necesitas estar en Barcelona para usar nuestro servicio. Todo el proceso es remoto desde el primer momento hasta la última notificación de seguimiento.</p>
                    <ol className="space-y-3 list-decimal list-inside">
                      <li>
                        <strong className="text-foreground">Sube tu archivo.</strong> Envía tu STL, STEP, OBJ o 3MF
                        a través de nuestra{" "}
                        <Link to="/#calculator" className="text-accent hover:underline">calculadora online</Link>,
                        por email o directamente por WhatsApp.
                      </li>
                      <li>
                        <strong className="text-foreground">Revisión humana en 1 hora.</strong> Una persona real
                        comprueba tu archivo y confirma el precio exacto, el plazo y las recomendaciones de material.
                        Si hay algún problema, te avisamos antes de imprimir.
                      </li>
                      <li>
                        <strong className="text-foreground">Aprueba y lo imprimimos.</strong> Una vez confirmado
                        el presupuesto, el trabajo entra en nuestra cola. La mayoría de pedidos estándar salen en
                        3–7 días laborables.
                      </li>
                      <li>
                        <strong className="text-foreground">Entrega con mensajería seguida.</strong> Recibirás un
                        número de seguimiento en cuanto el paquete salga de nuestro taller.
                      </li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    How it works — fully remote, from anywhere in the world
                  </h2>
                  <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                    <p>You don't need to be in Barcelona to use our service. The entire process is remote from the first second to the last tracking notification.</p>
                    <ol className="space-y-3 list-decimal list-inside">
                      <li>
                        <strong className="text-foreground">Upload your file.</strong> Send your STL, STEP, OBJ, or
                        3MF file via our{" "}
                        <Link to="/#calculator" className="text-accent hover:underline">online estimator</Link>,
                        by email, or directly on WhatsApp. The estimator gives an instant price estimate based on your
                        file's weight and print time.
                      </li>
                      <li>
                        <strong className="text-foreground">Human review within 1 hour.</strong> A real person checks
                        your file for printability — wall thicknesses, overhangs, orientation — and confirms the exact
                        price, lead time, and any material recommendations.
                      </li>
                      <li>
                        <strong className="text-foreground">Approve and we print.</strong> Once you confirm the quote,
                        the job enters our print queue. Most standard orders ship within 3–7 business days.
                      </li>
                      <li>
                        <strong className="text-foreground">Tracked courier delivery.</strong> You receive a tracking
                        number as soon as the parcel leaves our workshop.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Materials */}
              {isES ? (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Materiales — gama FDM completa
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Imprimimos en toda la gama de materiales FDM. Esto es para lo que sirve cada uno:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { name: "PLA", desc: "El material más versátil y económico. Ideal para prototipos, modelos decorativos y piezas que no estén expuestas a calor superior a 60 °C. Disponible en decenas de colores." },
                      { name: "PETG", desc: "Más resistente que el PLA con ligera flexibilidad. Excelente para carcasas, soportes y piezas que necesiten resistencia al impacto sin el riesgo de deformación del ABS." },
                      { name: "ABS", desc: "Fuerte, resistente al calor (hasta ~100 °C) y fácilmente mecanizable. Estándar para carcasas funcionales y piezas de automoción interior." },
                      { name: "ASA", desc: "ABS con estabilización UV y mayor resistencia a la intemperie. Ideal para exteriores: fijaciones de jardín, piezas de automóvil, señalética, soportes de montaje." },
                      { name: "TPU (Flexible)", desc: "Filamento tipo goma en varios durómetros Shore. Usado para carcasas de móvil, empuñaduras, juntas, sellos de tuberías y almohadillas antivibratorias." },
                      { name: "Nylon (PA12 / PA6)", desc: "Alta resistencia a la tracción, excelente resistencia a la fatiga y bajo coeficiente de fricción. Para engranajes, bisagras, clips de ensamblaje y piezas mecánicas bajo estrés repetido." },
                      { name: "Policarbonato (PC)", desc: "Extremadamente resistente y resistente al calor hasta ~115 °C. Para piezas que deben soportar estrés mecánico significativo, altas temperaturas o impactos." },
                      { name: "Composites de Fibra de Carbono", desc: "Mayor rigidez con menos peso. Para soportes estructurales, marcos de drones, brazos robóticos y piezas de precisión donde la rigidez es prioritaria." },
                    ].map(({ name, desc }) => (
                      <div key={name} className="p-5 rounded-xl border border-border/50 bg-card hover:border-accent/40 transition-colors">
                        <h3 className="font-bold text-foreground mb-2">{name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Materials — full FDM range
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    We print across the complete FDM material range. Here's what each material is best suited for:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { name: "PLA", desc: "The most versatile entry-level material. Ideal for prototypes, display models, and parts not exposed to heat above 60 °C. Available in dozens of colours. Most economical choice." },
                      { name: "PETG", desc: "Tougher than PLA with slight flexibility. Excellent for housings, brackets, and parts that need impact resistance without the warping risk of ABS." },
                      { name: "ABS", desc: "Strong, heat-resistant (up to ~100 °C), and easily machined or sanded. Standard choice for functional enclosures and automotive interior parts." },
                      { name: "ASA", desc: "ABS but UV-stabilised and more weather-resistant. The go-to for anything outdoors: garden fixtures, automotive exterior parts, signage, mounting brackets." },
                      { name: "TPU (Flexible)", desc: "Rubber-like filament in various shore hardnesses. Used for phone cases, grips, gaskets, pipe seals, anti-vibration pads, and wearable components." },
                      { name: "Nylon (PA12 / PA6)", desc: "High tensile strength, excellent fatigue resistance, low friction. The standard engineering choice for gears, hinges, snap-fits, and parts under repeated stress." },
                      { name: "Polycarbonate (PC)", desc: "Extremely tough and heat-resistant up to ~115 °C. Best for parts that must survive significant mechanical stress, high temperatures, or impacts." },
                      { name: "Carbon Fibre Composites", desc: "Short-fibre reinforced materials with higher stiffness-to-weight ratio. Used in structural brackets, drone frames, robotic arms, and precision parts where rigidity is paramount." },
                    ].map(({ name, desc }) => (
                      <div key={name} className="p-5 rounded-xl border border-border/50 bg-card hover:border-accent/40 transition-colors">
                        <h3 className="font-bold text-foreground mb-2">{name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              {isES ? (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Precios — fórmula transparente, sin costes ocultos
                  </h2>
                  <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                    <p>
                      Nuestra tarificación es por fórmula y completamente transparente. El precio final depende de dos
                      factores: el peso de la pieza impresa (gramos de filamento consumido) y el tiempo de máquina
                      (horas de impresión). No hay tasas de configuración, ni cargos por revisión de archivos.
                    </p>
                    <p>
                      El pedido mínimo es <strong className="text-foreground">€10</strong>. La mayoría de piezas
                      individuales pequeñas están en el rango de €10–€40. El PLA es la opción más económica; los
                      materiales de ingeniería como Policarbonato y composites de fibra de carbono están en el extremo
                      superior, pero siguen siendo mucho más asequibles que piezas equivalentes en resina o SLS.
                    </p>
                    <p>
                      Usa la{" "}
                      <Link to="/#calculator" className="text-accent hover:underline font-semibold">
                        calculadora online
                      </Link>{" "}
                      para obtener un presupuesto instantáneo, o envíanos el archivo y te cotizamos en menos de una hora.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Pricing — transparent formula, no hidden fees
                  </h2>
                  <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                    <p>
                      Our pricing is formula-based and fully transparent. The final price depends on two factors: the
                      weight of the printed part (grams of filament consumed) and the machine time (hours of print).
                      There are no set-up fees, no file review fees, and no platform charges.
                    </p>
                    <p>
                      The minimum order is <strong className="text-foreground">€10</strong>. Most single small parts
                      fall in the €10–€40 range. Material choice affects the per-gram cost: PLA is the most economical,
                      with engineering materials like Polycarbonate and carbon-fibre composites at the top end — but
                      still far more affordable than equivalent resin or SLS parts from industrial bureaus.
                    </p>
                    <p>
                      Use the{" "}
                      <Link to="/#calculator" className="text-accent hover:underline font-semibold">
                        online calculator
                      </Link>{" "}
                      to upload your file and get an instant estimate, or send the file directly and we'll quote within
                      the hour.
                    </p>
                  </div>
                </div>
              )}

              {/* Why us */}
              {isES ? (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    ¿Por qué elegirnos frente a las grandes plataformas?
                  </h2>
                  <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                    <ul className="space-y-3">
                      <li>
                        <strong className="text-foreground">Comunicación directa.</strong> Hablas con la persona que
                        imprime tu pieza, no con un bot de soporte. Las preguntas se responden en minutos, no en días.
                      </li>
                      <li>
                        <strong className="text-foreground">Plazos más rápidos para pedidos pequeños.</strong> Sin
                        overhead de marketplace, sin enrutamiento de múltiples pasos. La mayoría de pedidos salen en
                        3–7 días laborables desde la confirmación.
                      </li>
                      <li>
                        <strong className="text-foreground">Sin pedido mínimo.</strong> Imprimimos desde una sola pieza
                        a partir de €10. Los servicios industriales suelen exigir lotes mínimos de 5 o 10 unidades.
                      </li>
                      <li>
                        <strong className="text-foreground">Revisión honesta del archivo.</strong> Un humano real
                        comprueba cada archivo antes de imprimir. Si tu modelo tiene un problema, te avisamos antes de
                        imprimir, no después de que llegue la pieza rota.
                      </li>
                      <li>
                        <strong className="text-foreground">Acceso por WhatsApp.</strong> Para proyectos urgentes o
                        complejos, puedes contactarnos directamente. Respondemos en menos de una hora en horario laboral.
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Why choose us over large 3D printing platforms?
                  </h2>
                  <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                    <ul className="space-y-3">
                      <li>
                        <strong className="text-foreground">Direct communication.</strong> You message the person who
                        actually prints your part, not a support bot or a ticket queue. Questions are answered in
                        minutes, not days.
                      </li>
                      <li>
                        <strong className="text-foreground">Faster turnaround for small orders.</strong> No marketplace
                        overhead, no multi-step routing. Most orders ship within 3–7 business days from confirmation.
                      </li>
                      <li>
                        <strong className="text-foreground">No minimum order.</strong> We print single parts starting
                        at €10. Unlike many industrial services that require batch minimums of 5 or 10 units.
                      </li>
                      <li>
                        <strong className="text-foreground">Honest file review.</strong> A real human checks every file
                        before it goes to print. If your model has a wall that will fail, we tell you before we print
                        it — not after, when the part arrives broken.
                      </li>
                      <li>
                        <strong className="text-foreground">WhatsApp access.</strong> For urgent or complex projects,
                        reach us directly — something no platform-based service can match. We aim to respond within the
                        hour during business hours.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Why order from Barcelona? */}
              {isES ? (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    ¿Por qué pedir desde Barcelona?
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { title: "Hub tecnológico europeo", body: "Barcelona acoge el Mobile World Congress y alberga el distrito de innovación 22@ — uno de los ecosistemas tecnológicos más densos de Europa. Somos un estudio profesional arraigado en esa infraestructura." },
                      { title: "Calidad de estudio, no de granja", body: "Somos un único estudio, no un marketplace que enruta tu archivo a la granja de impresión más barata. Las mismas máquinas, el mismo equipo, la misma calidad en cada pedido." },
                      { title: "Estándares europeos de fabricación", body: "Operamos bajo normativa europea: materiales certificados con trazabilidad, equipos calibrados periódicamente y control de calidad humano antes de cada envío." },
                      { title: "Envío con seguimiento completo", body: "Todos los pedidos salen con seguimiento completo. Recibirás un enlace de seguimiento en el momento en que el paquete salga de nuestro taller — visibilidad total de Barcelona a tu puerta." },
                    ].map(({ title, body }) => (
                      <div key={title} className="p-5 rounded-xl border border-border/50 bg-card">
                        <h3 className="font-bold text-foreground mb-2 text-sm">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Why order from Barcelona?
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { title: "European tech hub", body: "Barcelona hosts the Mobile World Congress and the 22@ innovation district — one of Europe's most concentrated technology ecosystems. We are a professional studio rooted in that environment." },
                      { title: "Studio quality, not a print farm", body: "We are a single studio — not a marketplace routing your file to whichever print farm is cheapest. Same machines, same team, consistent quality on every order." },
                      { title: "EU manufacturing standards", body: "We operate under European manufacturing norms: certified materials with full traceability, regularly calibrated equipment, and human quality control before every shipment leaves." },
                      { title: "Fully tracked shipping", body: "Every order ships with full courier tracking. You receive a tracking link the moment your parcel leaves our workshop — complete visibility from Barcelona to your door." },
                    ].map(({ title, body }) => (
                      <div key={title} className="p-5 rounded-xl border border-border/50 bg-card">
                        <h3 className="font-bold text-foreground mb-2 text-sm">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping — city row highlighted */}
              {isES ? (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Envío — entrega con seguimiento a {config.city} y resto del mundo
                  </h2>
                  <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                    <p>
                      Enviamos a través de mensajeros de confianza desde nuestro taller en Barcelona. Todos los pedidos
                      tienen seguimiento completo — recibirás un número de seguimiento en cuanto el paquete salga.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse not-prose">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 font-semibold text-foreground">Destino</th>
                            <th className="text-left py-2 font-semibold text-foreground">Entrega estimada</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          <tr className="bg-accent/5">
                            <td className="py-2 pr-4 font-semibold text-foreground">{config.deliveryTableRow[0]}</td>
                            <td className="py-2 font-semibold text-accent">{config.deliveryTableRow[1]}</td>
                          </tr>
                          {[
                            ["Barcelona (recogida)", "Mismo día con cita previa"],
                            ["Resto de España", "2–3 días hábiles"],
                            ["Europa", "3–6 días hábiles"],
                            ["Internacional", "5–10 días hábiles"],
                          ].map(([dest, time]) => (
                            <tr key={dest}>
                              <td className="py-2 pr-4 text-muted-foreground">{dest}</td>
                              <td className="py-2 text-muted-foreground">{time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p>
                      Los gastos de envío se calculan en la fase de presupuesto en función de tu destino y el peso
                      estimado del paquete, y siempre se muestran antes de que confirmes el pedido.
                    </p>
                    <p className="not-prose text-sm bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 text-muted-foreground">
                      <strong className="text-foreground">Coste de envío estimado a {config.city}:</strong>{" "}
                      normalmente €8–15 para piezas pequeñas, €15–25 para pedidos más grandes. El coste exacto se confirma en el presupuesto antes de que apruebes el pedido.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Shipping — tracked delivery to {config.city} and worldwide
                  </h2>
                  <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                    <p>
                      We ship via trusted courier partners, dispatching from our Barcelona workshop. All orders are
                      fully tracked — you receive a tracking number as soon as the parcel leaves us.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse not-prose">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 font-semibold text-foreground">Destination</th>
                            <th className="text-left py-2 font-semibold text-foreground">Typical delivery</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          <tr className="bg-accent/5">
                            <td className="py-2 pr-4 font-semibold text-foreground">{config.deliveryTableRow[0]}</td>
                            <td className="py-2 font-semibold text-accent">{config.deliveryTableRow[1]}</td>
                          </tr>
                          {[
                            ["Spain", "1–2 business days"],
                            ["France, Portugal, Germany, Italy, Netherlands", "3–5 business days"],
                            ["Rest of Europe", "4–7 business days"],
                            ["UK, US, Canada, Australia", "5–10 business days"],
                          ].map(([dest, time]) => (
                            <tr key={dest}>
                              <td className="py-2 pr-4 text-muted-foreground">{dest}</td>
                              <td className="py-2 text-muted-foreground">{time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p>
                      Shipping costs are calculated at the quote stage based on your country and estimated parcel weight,
                      and are always shown before you confirm your order.
                    </p>
                    <p className="not-prose text-sm bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 text-muted-foreground">
                      <strong className="text-foreground">Estimated shipping to {config.city}:</strong>{" "}
                      typically €8–15 for small parts, €15–25 for larger orders. The exact cost is confirmed in your quote before you approve the order.
                    </p>
                    {config.locale === "en_GB" && (
                      <p className="not-prose text-sm bg-secondary border border-border rounded-lg px-4 py-3 text-muted-foreground">
                        <strong className="text-foreground">UK customs note:</strong>{" "}
                        Orders under £135 typically clear UK customs duty-free — the de minimis threshold comfortably covers most single 3D printing orders. Any applicable UK import VAT on commercial orders above this threshold will be confirmed at quote stage before you commit to anything.
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* Customer reviews */}
        <section className="container px-4 py-14 md:py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
              {isES ? "Lo que dicen nuestros clientes internacionales" : "What our international customers say"}
            </h2>
            <p className="text-center text-muted-foreground mb-8 text-sm">
              {isES ? "Pedidos remotos desde toda Europa y más allá" : "Remote orders from across Europe and beyond"}
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-border bg-card">
                <span className="text-accent text-base mb-3 block" aria-label="5 out of 5 stars">★★★★★</span>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {isES
                    ? "\"Pedimos desde nuestra empresa de construcción en Alemania — todo el proceso fue completamente remoto. Enviamos los archivos por WhatsApp, recibimos presupuesto rápidamente y las piezas llegaron perfectas. Funcionó exactamente como necesitábamos.\""
                    : "\"We ordered from our construction company in Germany — entirely remote. Sent the files via WhatsApp, got a fast quote, and the parts arrived exactly as needed. Everything worked perfectly for the project.\""}
                </p>
                <div>
                  <p className="font-semibold text-foreground text-sm">Kirill Gromskiy</p>
                  <p className="text-xs text-muted-foreground">{isES ? "Empresa constructora · Pedido remoto" : "Construction company · Remote order"}</p>
                </div>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <span className="text-accent text-base mb-3 block" aria-label="5 out of 5 stars">★★★★★</span>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {isES
                    ? "\"Pedí desde Milán — al principio dudé por pedir desde otro país, pero la comunicación fue rápida y profesional. Calidad excelente y el paquete llegó en 3 días. Sin duda repetiré.\""
                    : "\"Ordered from Milan — I was unsure about ordering from another country, but communication was fast and professional. Excellent quality, and the package arrived in 3 days. Will definitely use again.\""}
                </p>
                <div>
                  <p className="font-semibold text-foreground text-sm">Valentino Modestino Lombardi</p>
                  <p className="text-xs text-muted-foreground">{isES ? "Milán, Italia · Pedido remoto" : "Milan, Italy · Remote order"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container px-4 py-14 md:py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              {isES ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
            </h2>
            <div className="space-y-4">
              {allFaqs.map(({ q, a }) => (
                <details
                  key={q}
                  className="group border border-border/50 rounded-xl bg-card overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-foreground select-none list-none">
                    {q}
                    <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="bg-secondary/20 py-10">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-lg font-bold text-foreground mb-4">
                {isES ? "Lectura relacionada" : "Related reading"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  to="/3d-printing-service"
                  className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 hover:border-accent/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Globe className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm leading-snug group-hover:text-accent transition-colors">
                      {isES ? "Servicio Internacional" : "International Shipping Service"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isES ? "Envíos a Europa y todo el mundo" : "Delivery across Europe and worldwide"}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-accent ml-auto flex-shrink-0" />
                </Link>
                <Link
                  to={secondaryLinkItem.to}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 hover:border-accent/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Package className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm leading-snug group-hover:text-accent transition-colors">
                      {secondaryLinkItem.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {secondaryLinkItem.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-accent ml-auto flex-shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container px-4 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isES ? "¿Listo para pedir presupuesto?" : "Ready to get a quote?"}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {isES
                ? "Sube tu archivo STL o STEP a nuestra calculadora para obtener un presupuesto instantáneo. Un miembro del equipo revisa cada archivo y confirma el precio exacto en menos de una hora. Sin registro necesario."
                : "Upload your STL or STEP file to our online calculator for an instant price estimate. A member of the team reviews every file and confirms the exact price within one hour. No account required."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cta" size="xl" asChild className="shadow-lg">
                <Link
                  to="/#calculator"
                  onClick={() => capture("city_cta_click", { city: config.city, type: "calculator_bottom" })}
                >
                  {isES ? `Presupuesto con entrega en ${config.city}` : `Get a quote — delivered to ${config.city}`}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="whatsapp-outline"
                size="xl"
                onClick={() => {
                  capture("city_cta_click", { city: config.city, type: "whatsapp_bottom" });
                  window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(config.whatsappMsg)}`, "_blank");
                }}
                className="group"
              >
                <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
                {isES ? "WhatsApp" : "Message Us on WhatsApp"}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default CityDeliveryPage;
