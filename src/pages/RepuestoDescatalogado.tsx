import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, MessageCircle, Package, Wrench } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";

const SITE_URL = "https://www.dimension3dprints.com";
const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

const META_TITLE = "Repuesto Descatalogado en Barcelona — Reproducción 3D de Piezas que Ya No Se Venden | Dimension3D";
const META_DESC = "¿Tu aparato necesita un repuesto que ya no fabrica el fabricante? Lo reproducimos en 3D en Barcelona desde foto o la pieza original. Desde 10€. Presupuesto en 1 hora.";
const CANONICAL = `${SITE_URL}/repuesto-descatalogado`;

const FAQS = [
  {
    q: "¿Podéis reproducir cualquier repuesto descatalogado?",
    a: "Si es una pieza plástica con geometría definida, casi siempre podemos. Necesitamos la pieza original (aunque esté rota), fotografías desde varios ángulos con referencia de escala, o el número de referencia del fabricante. Las piezas que no podemos reproducir son las metálicas (solo trabajamos FDM plástico) y las que requieren tolerancias de precisión menores de ±0,1 mm. Mándanos una foto y en menos de una hora te decimos si es viable.",
  },
  {
    q: "¿Qué material uso si el fabricante ya no lo vende?",
    a: "Seleccionamos el material en función del uso de la pieza: PETG para piezas funcionales resistentes a humedad y golpes, ABS/ASA para exteriores o exposición al calor, TPU para piezas flexibles, Nylon para alta carga mecánica. En muchos casos el material impreso supera en durabilidad al plástico original.",
  },
  {
    q: "¿Cuánto tarda y cuánto cuesta reproducir un repuesto?",
    a: "La mayoría de piezas pequeñas y medianas están listas en 24–48 horas. El precio mínimo es 10€. Clips, tapas y bisagras suelen quedar entre 10€ y 20€. Piezas más grandes o con modelado desde cero desde 25€. Presupuesto siempre gratis y sin compromiso antes de confirmar.",
  },
  {
    q: "¿Tengo que tener el archivo STL del repuesto?",
    a: "No. Si tienes la pieza física (aunque esté rota), la medimos y modelamos nosotros. Si solo tienes fotos, podemos reproducir piezas con geometría clara. También buscamos el modelo en repositorios públicos como Thingiverse, Printables y GrabCAD — muchas piezas de electrodomésticos y vehículos populares ya existen en la comunidad.",
  },
  {
    q: "¿Cuánto aguanta una pieza impresa en 3D comparada con el original?",
    a: "Depende del material elegido, pero PETG y Nylon tienen una resistencia mecánica comparable o superior a los plásticos de inyección de gama media. Para aplicaciones de alta temperatura o exposición UV usamos ABS o ASA. Llevamos años sustituyendo piezas de electrodomésticos, muebles y vehículos con resultados duraderos.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#organization`,
  name: "Dimension3D",
  url: SITE_URL,
  image: `${SITE_URL}/og-image.jpg`,
  priceRange: "€€",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "16",
    bestRating: "5",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rambla de Brasil",
    addressLocality: "Barcelona",
    addressCountry: "ES",
  },
};

const EXAMPLES = [
  { category: "Electrodomésticos", color: "bg-blue-500/8 border-blue-500/20", items: ["Rueda o clip del cesto del lavavajillas", "Perilla de cocina, horno o campana extractora", "Tapa de compartimento del frigorífico", "Soporte de estante interior", "Bisagra o cierre de tapa"] },
  { category: "Muebles y hogar", color: "bg-green-500/8 border-green-500/20", items: ["Bisagra de plástico (IKEA u otras marcas)", "Pata o nivelador de armario o mesa", "Conector o clip de estantería modular", "Pomo o tirador de cajón descatalogado", "Tapa de enchufe o caja eléctrica"] },
  { category: "Vehículos", color: "bg-yellow-500/8 border-yellow-500/20", items: ["Clip de moldura de interior (modelos descatalogados)", "Tapa de portavasos o consola central", "Cierre de maletero o panel de puerta", "Soporte de mando a distancia o GPS", "Embellecedor de rejilla de ventilación"] },
  { category: "Gadgets y electrónica", color: "bg-purple-500/8 border-purple-500/20", items: ["Tapa de batería de mandos y cámaras", "Soporte o peana de altavoz o monitor", "Clip de fijación de pantalla o teclado", "Carcasa de sensor o componente electrónico", "Conector y retén de cable"] },
];

const RepuestoDescatalogado = () => {
  const endRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        capture("page_read_75pct", { page: "repuesto-descatalogado" });
        observer.disconnect();
      }
    }, { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleWhatsApp = () => {
    capture("whatsapp_click", { source: "repuesto_descatalogado" });
    const msg = "Hola, necesito reproducir un repuesto que ya no se fabrica. Os mando fotos.";
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang="es" />
        <title>{META_TITLE}</title>
        <meta name="description" content={META_DESC} />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content={META_TITLE} />
        <meta property="og:description" content={META_DESC} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={META_TITLE} />
        <meta name="twitter:description" content={META_DESC} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Repuesto descatalogado", item: CANONICAL },
          ],
        })}</script>
      </Helmet>

      <LaunchOfferBanner />
      <Header />

      <main className="pt-16">

        {/* ── HERO ── */}
        <section className="py-16 md:py-20 hero-gradient">
          <div className="container px-4 max-w-3xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-primary-foreground/50 mb-4">
              <Link to="/" className="hover:text-primary-foreground/80 transition-colors">Inicio</Link>
              <span>/</span>
              <span className="text-primary-foreground/70">Repuesto descatalogado</span>
            </nav>
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-5">
              <Package className="w-3.5 h-3.5" />
              Piezas que ya no se venden
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              Repuesto Descatalogado — Lo Imprimimos en 3D en Barcelona
            </h1>
            <p className="text-lg text-primary-foreground/75 leading-relaxed">
              El fabricante ya no lo fabrica. El servicio técnico pide semanas. La pieza cuesta más de lo que vale el aparato. La imprimimos en 3D desde la pieza original o unas fotos. Presupuesto gratis en menos de 1 hora. Desde 10€.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "Sin STL necesario",
                "Desde foto o pieza rota",
                "Desde 10€",
                "Listo en 24–48h",
              ].map((tag) => (
                <div key={tag} className="flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/15 rounded-full px-4 py-2 text-sm text-primary-foreground/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  {tag}
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={handleWhatsApp}
                variant="cta"
                size="lg"
                className="gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Mándanos una foto por WhatsApp
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-primary-foreground/80 hover:text-primary-foreground border border-primary-foreground/20 hover:border-primary-foreground/40">
                <Link to="/recambios-impresion-3d-barcelona">
                  Ver servicio de recambios <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-4 max-w-3xl mx-auto space-y-16">

            {/* 1. El problema */}
            <article id="el-problema">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                ¿Por qué ya no encuentras el repuesto?
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Los fabricantes dejan de producir repuestos normalmente entre 5 y 10 años después de descatalogar un modelo. Pero los aparatos duran más. Resulta que una lavadora de 12 años funciona perfectamente salvo por un clip de plástico del cesto, o que una silla de oficina de alta gama solo necesita una rueda nueva. El servicio técnico oficial no tiene la pieza, el número de referencia ya no aparece en ningún distribuidor y en Amazon solo hay genéricos que no encajan.
                </p>
                <p>
                  La impresión 3D existe exactamente para este problema. Si la pieza original existe físicamente — aunque esté rota en varios trozos — podemos medirla, modelarla y reproducirla. Si tienes el número de referencia del fabricante, buscamos el modelo en repositorios públicos como Thingiverse, Printables o GrabCAD. Si solo tienes fotos tomadas desde varios ángulos, podemos reproducir geometrías claras. En la mayoría de los casos tenemos respuesta en menos de una hora.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 2. Cómo funciona */}
            <article id="como-funciona">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Cómo reproducimos tu repuesto descatalogado
              </h2>
              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Nos mandas fotos o la pieza",
                    body: "Por WhatsApp, desde al menos 3 ángulos (frontal, lateral, posterior) junto a una regla o moneda para escala. Si tienes la pieza físicamente, puedes traerla al taller o enviárnosla.",
                  },
                  {
                    step: "02",
                    title: "Valoramos la viabilidad y te damos presupuesto",
                    body: "En menos de 1 hora te decimos si podemos reproducirla, con qué material y a qué precio. Sin compromiso. Si la pieza ya existe en un repositorio público te lo decimos y abaratamos el coste.",
                  },
                  {
                    step: "03",
                    title: "Modelamos e imprimimos",
                    body: "Si no tienes el STL, modelamos la pieza en CAD a partir de tus medidas o fotos. Si ya existe el modelo, pasamos directamente a imprimir. La mayoría de piezas quedan listas en 24–48 horas.",
                  },
                  {
                    step: "04",
                    title: "Recoges o enviamos a toda España",
                    body: "Recogida sin coste en nuestro taller de Rambla de Brasil, Barcelona, con cita previa. O envío a domicilio a toda España peninsular por 4,90€.",
                  },
                ].map(({ step, title, body }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-accent">{step}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">{title}</p>
                      <p className="text-foreground/70 text-sm leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 3. Qué repuestos */}
            <article id="que-repuestos">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Qué repuestos descatalogados fabricamos
              </h2>
              <p className="text-foreground/80 mb-6 leading-relaxed">
                Si es una pieza plástica con función mecánica o estructural, casi seguro podemos reproducirla. Estos son los tipos más habituales:
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {EXAMPLES.map(({ category, color, items }) => (
                  <div key={category} className={`rounded-xl border p-4 ${color}`}>
                    <p className="font-semibold text-foreground mb-3 text-sm">{category}</p>
                    <ul className="space-y-1.5">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-foreground/75">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl bg-accent/5 border border-accent/20 p-5">
                <p className="font-semibold text-foreground mb-2">¿No ves tu tipo de pieza aquí?</p>
                <p className="text-foreground/70 text-sm leading-relaxed mb-4">
                  Esta lista no es exhaustiva. Si tienes una pieza plástica que ya no se fabrica, mándanos una foto. En menos de una hora te decimos si podemos reproducirla.
                </p>
                <Button onClick={handleWhatsApp} variant="cta" size="sm" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Consultar por WhatsApp
                </Button>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 4. Piezas disponibles ya */}
            <article id="piezas-disponibles">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Piezas disponibles ya en nuestro catálogo
              </h2>
              <p className="text-foreground/80 mb-6 leading-relaxed">
                Algunos repuestos habituales ya están modelados y disponibles para compra directa. Puedes pedirlos sin necesidad de enviarnos fotos:
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Link
                  to="/rueda-cesto-lavavajillas-bosch"
                  className="group rounded-xl border border-border bg-background p-4 hover:border-accent/50 transition-colors"
                >
                  <Wrench className="w-5 h-5 text-accent mb-2" />
                  <p className="font-semibold text-foreground text-sm leading-snug mb-1 group-hover:text-accent transition-colors">
                    Rueda cesto lavavajillas Bosch / Siemens
                  </p>
                  <p className="text-xs text-foreground/55">Repuesto compatible. Desde 5€</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent mt-3">
                    Ver pieza <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
                <Link
                  to="/adaptador-manguera-gardena"
                  className="group rounded-xl border border-border bg-background p-4 hover:border-accent/50 transition-colors"
                >
                  <Wrench className="w-5 h-5 text-accent mb-2" />
                  <p className="font-semibold text-foreground text-sm leading-snug mb-1 group-hover:text-accent transition-colors">
                    Adaptador manguera Gardena
                  </p>
                  <p className="text-xs text-foreground/55">Compatible con sistemas Gardena. Desde 5€</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent mt-3">
                    Ver pieza <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
                <Link
                  to="/catalogo"
                  className="group rounded-xl border border-border bg-background p-4 hover:border-accent/50 transition-colors"
                >
                  <Package className="w-5 h-5 text-accent mb-2" />
                  <p className="font-semibold text-foreground text-sm leading-snug mb-1 group-hover:text-accent transition-colors">
                    Ver todo el catálogo
                  </p>
                  <p className="text-xs text-foreground/55">Recambios y piezas a medida disponibles ya</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent mt-3">
                    Explorar <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 5. FAQ */}
            <article id="faq">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Preguntas frecuentes sobre repuestos descatalogados
              </h2>
              <Accordion type="single" collapsible className="border border-border rounded-2xl px-2">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border/60 last:border-0">
                    <AccordionTrigger className="text-left font-semibold text-foreground py-4 hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/75 leading-relaxed pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </article>

            {/* 6. Artículo relacionado */}
            <div className="rounded-xl border border-border bg-secondary/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Guía relacionada</p>
              <Link
                to="/blog/recambios-piezas-rotas-impresion-3d-barcelona"
                className="group block"
              >
                <p className="font-semibold text-foreground text-sm leading-snug mb-1 group-hover:text-accent transition-colors">
                  Piezas rotas y recambios en 3D Barcelona — De la foto a la pieza en 24h
                </p>
                <p className="text-xs text-foreground/55 leading-relaxed">
                  Guía completa sobre qué piezas se pueden reproducir, qué materiales usar y cómo enviarnos la pieza o la foto.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent mt-3">
                  Leer guía <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>

          </div>
        </section>

        {/* ── CTA ── */}
        <section ref={endRef as React.RefObject<HTMLElement>} className="py-16 md:py-20 bg-foreground text-background">
          <div className="container px-4 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Presupuesto gratis en 1 hora
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-background mb-4">
              ¿Tienes un repuesto que ya no se fabrica?
            </h2>
            <p className="text-background/70 leading-relaxed mb-8 max-w-lg mx-auto">
              Mándanos una foto de la pieza por WhatsApp. En menos de una hora te decimos si podemos reproducirla y a qué precio.
            </p>
            <Button onClick={handleWhatsApp} variant="cta" size="lg" className="gap-2">
              <MessageCircle className="w-5 h-5" />
              Enviar foto por WhatsApp
            </Button>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default RepuestoDescatalogado;
