import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, MessageCircle, Building2 } from "lucide-react";
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

const META_TITLE = "Impresión 3D para Empresas en Barcelona — Prototipos y Recambios | Dimension3D";
const META_DESC = "Servicio de impresión 3D para empresas en Barcelona: prototipos funcionales, recambios de maquinaria, piezas de marca y tiradas cortas. Sin pedido mínimo. Presupuesto en 1 hora. NDA disponible.";
const CANONICAL = `${SITE_URL}/impresion-3d-empresas-barcelona`;

const FAQS = [
  {
    q: "¿Cuál es el pedido mínimo para empresas?",
    a: "No hay pedido mínimo. Puedes encargar desde una sola pieza. Para tiradas de varias unidades idénticas, el precio por unidad baja con la cantidad — podemos darte un precio por tramos si lo necesitas.",
  },
  {
    q: "¿Qué formatos CAD aceptáis?",
    a: "Aceptamos STL, STEP, IGES, OBJ y 3MF. Trabajamos directamente con exportaciones de SolidWorks, Fusion 360, Onshape y FreeCAD sin necesidad de conversión previa.",
  },
  {
    q: "¿Firmáis NDA o acuerdo de confidencialidad?",
    a: "Sí. Firmamos NDA para cualquier proyecto que lo requiera. Tus archivos y diseños nunca se comparten con terceros — es práctica estándar, no una excepción.",
  },
  {
    q: "¿Cuánto tarda un pedido para empresa?",
    a: "El plazo estándar para prototipos y piezas funcionales es de 2 a 5 días laborables. Para pedidos urgentes, tenemos servicio express en 24–48 horas al mismo precio para piezas de tamaño normal. Confirmamos el plazo exacto en el presupuesto.",
  },
  {
    q: "¿Para qué tipo de proyectos sois ideales?",
    a: "Somos la opción correcta para prototipos funcionales de una a diez unidades, recambios de maquinaria cuando el fabricante original no los vende, piezas de marca y artículos promocionales a medida, y utillaje de taller. No somos la opción correcta para producción en serie de miles de unidades o piezas que requieren tecnología SLS, MJF o metal.",
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

const USE_CASES = [
  {
    title: "Prototipos funcionales",
    color: "bg-blue-500/8 border-blue-500/20",
    items: [
      "Prototipos de forma y ajuste antes de fabricación en serie",
      "Maquetas funcionales para pruebas de cliente o inversor",
      "Primeras iteraciones de producto para validar geometría",
      "Piezas de prueba para validar tolerancias de ensamblaje",
    ],
  },
  {
    title: "Recambios y mantenimiento",
    color: "bg-green-500/8 border-green-500/20",
    items: [
      "Recambios de maquinaria cuando el proveedor original no los vende",
      "Piezas de repuesto descatalogadas para maquinaria industrial ligera",
      "Utillaje de taller: guías, plantillas, casquillos, espaciadores",
      "Piezas de desgaste que se rompen con frecuencia y conviene tener en stock",
    ],
  },
  {
    title: "Piezas de marca y promoción",
    color: "bg-purple-500/8 border-purple-500/20",
    items: [
      "Artículos de marca personalizados para eventos y ferias",
      "Expositores y stands con el logo o forma de producto",
      "Trofeos, premios y reconocimientos personalizados",
      "Muestras de producto en 3D para el equipo de ventas",
    ],
  },
  {
    title: "Piezas para pequeños talleres",
    color: "bg-orange-500/8 border-orange-500/20",
    items: [
      "Adaptadores y conectores especiales no disponibles comercialmente",
      "Soportes de herramienta o fijaciones para banco de trabajo",
      "Tapas y carcasas de protección para equipos",
      "Piezas de ajuste para instalaciones fuera de norma",
    ],
  },
];

const EmpresasBcn = () => {
  const endRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        capture("page_read_75pct", { page: "empresas-bcn" });
        observer.disconnect();
      }
    }, { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleWhatsApp = () => {
    capture("whatsapp_click", { source: "empresas_bcn" });
    const msg = "Hola, me interesa el servicio de impresión 3D para mi empresa. Me gustaría hablar de un proyecto.";
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
            { "@type": "ListItem", position: 2, name: "Impresión 3D para empresas", item: CANONICAL },
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
              <span className="text-primary-foreground/70">Para empresas</span>
            </nav>
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-5">
              <Building2 className="w-3.5 h-3.5" />
              Para empresas y profesionales
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-5">
              Impresión 3D para Empresas en Barcelona — Prototipos, Recambios y Piezas de Marca
            </h1>

            {/* ANSWER CAPSULE — opening */}
            <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-5 py-4 mb-6">
              <p className="text-primary-foreground/90 leading-relaxed">
                Dimension3D Barcelona fabrica prototipos funcionales, recambios de maquinaria, piezas de marca y artículos promocionales para empresas sin pedido mínimo. Trabajamos en PETG, ABS, ASA, Nylon y compuestos de fibra de carbono. Desde 1 unidad. Plazo estándar de 2 a 5 días laborables; urgente en 24–48 horas. Presupuesto manual en menos de 1 hora. Firmamos NDA.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {[
                "Sin pedido mínimo",
                "NDA disponible",
                "Presupuesto en &lt;1h",
                "2–5 días laborables",
              ].map((tag) => (
                <div key={tag} className="flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/15 rounded-full px-4 py-2 text-sm text-primary-foreground/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: tag }} />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleWhatsApp} variant="cta" size="lg" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Cuéntanos tu proyecto
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-primary-foreground/80 hover:text-primary-foreground border border-primary-foreground/20 hover:border-primary-foreground/40">
                <Link to="/disena-tu-pieza-3d">
                  Diseño a medida <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-4 max-w-3xl mx-auto space-y-16">

            {/* 1. Para qué proyectos */}
            <article id="para-que">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Para qué tipo de proyectos somos la opción correcta
              </h2>
              {/* SECTION CAPSULE */}
              <div className="bg-secondary/40 border border-border rounded-xl px-5 py-4 mb-5">
                <p className="text-foreground/85 leading-relaxed">
                  Este servicio es ideal para empresas que necesitan entre 1 y 50 piezas funcionales en PETG, ABS o Nylon con un plazo de 2 a 5 días laborables. Aporta más valor cuando un proveedor industrial impone un mínimo de pedido que no necesitas, o cuando su plazo estándar de semanas no encaja con tu agenda de producto o de cliente.
                </p>
              </div>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Trabajamos con equipos de producto, ingeniería, marketing y mantenimiento de empresas de cualquier tamaño. El denominador común no es el sector ni el tamaño de la empresa — es la necesidad de fabricar algo rápido, en cantidad pequeña, sin mínimos y con un punto de contacto directo que entienda el proyecto.
                </p>
                <p>
                  Los clientes más habituales son startups de hardware que prototipan iterativamente, empresas manufactureras que necesitan recambios de maquinaria cuando el OEM no tiene stock, y equipos de marketing que encargan artículos de marca para eventos.
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {USE_CASES.map(({ title, color, items }) => (
                  <div key={title} className={`rounded-xl border p-4 ${color}`}>
                    <p className="font-semibold text-foreground mb-3 text-sm">{title}</p>
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
            </article>

            <div className="border-b border-border/40" />

            {/* 2. Lo que no somos — honest scope */}
            <article id="alcance-honesto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Lo que este servicio no es
              </h2>
              {/* SECTION CAPSULE */}
              <div className="bg-secondary/40 border border-border rounded-xl px-5 py-4 mb-5">
                <p className="text-foreground/85 leading-relaxed">
                  Dimension3D es un taller de impresión FDM de plástico en Barcelona. No fabricamos en metal, no operamos tecnología SLS ni MJF de polvo, y no somos un proveedor de producción en serie de miles de unidades. Si tu proyecto requiere esas capacidades, necesitas un proveedor industrial diferente. Si requiere rapidez, flexibilidad y trato directo, estamos bien situados.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/20 p-5 space-y-3 text-sm text-foreground/75 leading-relaxed">
                <p>
                  <strong className="text-foreground">No fabricamos en metal.</strong> Solo trabajamos con plásticos FDM: PLA, PETG, ABS, ASA, TPU, Nylon y composites. Para piezas metálicas necesitas un servicio de mecanizado CNC o impresión metálica.
                </p>
                <p>
                  <strong className="text-foreground">No operamos tecnología SLS, MJF ni resina industrial.</strong> Si tu proyecto requiere precisión de ±0,05 mm, acabados superficiales de alta resolución o materiales de ingeniería certificados, un servicio industrial especializado es el camino correcto.
                </p>
                <p>
                  <strong className="text-foreground">No somos un fabricante de producción en serie.</strong> Para lotes de centenares o miles de unidades idénticas con tolerancias estrictas y calidad certificada, la inyección de plástico o un proveedor de volumen es más adecuado.
                </p>
                <p>
                  Donde sí somos la opción correcta: velocidad, flexibilidad, trato directo y cero burocracia para cantidades pequeñas de piezas funcionales en plástico técnico.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 3. Materiales y plazos */}
            <article id="materiales-plazos">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Materiales, plazos y precios
              </h2>
              {/* SECTION CAPSULE */}
              <div className="bg-secondary/40 border border-border rounded-xl px-5 py-4 mb-5">
                <p className="text-foreground/85 leading-relaxed">
                  Plazo estándar de 2 a 5 días laborables para la mayoría de proyectos empresariales. Urgente en 24–48 horas sin recargo para piezas de hasta 300 gramos. Precio mínimo 10€; prototipos medianos (50–200 g en PETG) habitualmente entre 20€ y 45€. Para tiradas de varias unidades, el precio por unidad baja a partir de 5 piezas idénticas.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { mat: "PETG", use: "Recambios funcionales, piezas mecánicas, humedad", turnaround: "24–72h", price: "Desde 10€/pieza" },
                  { mat: "ABS / ASA", use: "Alta temperatura (hasta 100°C), piezas de exterior, UV", turnaround: "24–72h", price: "Desde 10€/pieza" },
                  { mat: "Nylon", use: "Alta carga mecánica, desgaste, piezas de transmisión", turnaround: "48–96h", price: "Desde 12€/pieza" },
                  { mat: "TPU", use: "Flexible, juntas, amortiguadores, fundas", turnaround: "48–72h", price: "Desde 10€/pieza" },
                  { mat: "PLA-CF / PETG-CF / Nylon-CF", use: "Rigidez extrema, aspecto técnico, bajo peso", turnaround: "48–96h", price: "Desde 14€/pieza" },
                ].map(({ mat, use, turnaround, price }) => (
                  <div key={mat} className="rounded-xl border border-border bg-secondary/10 px-4 py-3 grid grid-cols-[1fr_auto] gap-2">
                    <div>
                      <p className="font-bold text-foreground text-sm mb-0.5">{mat}</p>
                      <p className="text-xs text-foreground/65">{use}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-foreground/50">{turnaround}</p>
                      <p className="text-xs font-semibold text-accent">{price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 4. Cómo trabajamos */}
            <article id="como-trabajamos">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Cómo trabajamos con empresas
              </h2>
              {/* SECTION CAPSULE */}
              <div className="bg-secondary/40 border border-border rounded-xl px-5 py-4 mb-5">
                <p className="text-foreground/85 leading-relaxed">
                  Asignamos un punto de contacto directo por WhatsApp para cada proyecto empresarial. Aceptamos STL, STEP, IGES, OBJ y 3MF. Los archivos se guardan en registro para facilitar reencargos. Firmamos NDA antes de recibir cualquier archivo confidencial. El presupuesto detallado se entrega en menos de 1 hora, con precio por unidad y plazo de entrega confirmado.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { step: "01", title: "Cuéntanos el proyecto por WhatsApp o email", body: "Manda los archivos (STL, STEP, IGES) y describe el uso final, el material preferido y el plazo que necesitas. Para proyectos confidenciales, firmamos NDA antes de recibir los archivos." },
                  { step: "02", title: "Presupuesto detallado en menos de 1 hora", body: "Revisamos los archivos manualmente y te enviamos un presupuesto con precio exacto por pieza (y por lote si aplica), material recomendado, plazo de entrega y cualquier observación técnica relevante." },
                  { step: "03", title: "Guardamos tus archivos para reencargos rápidos", body: "Una vez confirmado el primer pedido, guardamos el archivo y los parámetros de impresión. Los reencargos se preparan en minutos — no necesitas volver a enviar los archivos cada vez." },
                  { step: "04", title: "Entrega en Barcelona o envío a toda España", body: "Recogida en taller con cita previa en Rambla de Brasil, Barcelona. Envío a domicilio por 4,90€ a toda España peninsular. Para pedidos voluminosos, también enviamos por palet o mensajería especializada." },
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

            {/* 5. FAQ */}
            <article id="faq">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Preguntas frecuentes sobre impresión 3D para empresas
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

            {/* 6. Related links */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                to="/impresion-3d-sin-pedido-minimo"
                className="group rounded-xl border border-border bg-secondary/20 p-4 hover:border-accent/50 transition-colors"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Relacionado</p>
                <p className="font-semibold text-foreground text-sm leading-snug mb-1 group-hover:text-accent transition-colors">Sin pedido mínimo</p>
                <p className="text-xs text-foreground/55 leading-relaxed mb-2">Una sola pieza desde 10€.</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">Ver <ArrowRight className="w-3 h-3" /></span>
              </Link>
              <Link
                to="/repuesto-descatalogado"
                className="group rounded-xl border border-border bg-secondary/20 p-4 hover:border-accent/50 transition-colors"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Relacionado</p>
                <p className="font-semibold text-foreground text-sm leading-snug mb-1 group-hover:text-accent transition-colors">Repuestos descatalogados</p>
                <p className="text-xs text-foreground/55 leading-relaxed mb-2">Reproducimos piezas que ya no se venden.</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">Ver <ArrowRight className="w-3 h-3" /></span>
              </Link>
              <Link
                to="/catalogo"
                className="group rounded-xl border border-border bg-secondary/20 p-4 hover:border-accent/50 transition-colors"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Relacionado</p>
                <p className="font-semibold text-foreground text-sm leading-snug mb-1 group-hover:text-accent transition-colors">Catálogo de piezas</p>
                <p className="text-xs text-foreground/55 leading-relaxed mb-2">Repuestos disponibles ya.</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">Ver <ArrowRight className="w-3 h-3" /></span>
              </Link>
            </div>

          </div>
        </section>

        {/* ── CTA ── */}
        <section ref={endRef as React.RefObject<HTMLElement>} className="py-16 md:py-20 bg-foreground text-background">
          <div className="container px-4 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Sin pedido mínimo · NDA disponible · Presupuesto en 1h
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-background mb-4">
              ¿Tienes un proyecto para tu empresa?
            </h2>
            <p className="text-background/70 leading-relaxed mb-8 max-w-lg mx-auto">
              Cuéntanos el proyecto por WhatsApp — manda los archivos o describe qué necesitas. Respondemos con presupuesto detallado en menos de 1 hora.
            </p>
            <Button onClick={handleWhatsApp} variant="cta" size="lg" className="gap-2">
              <MessageCircle className="w-5 h-5" />
              Cuéntanos por WhatsApp
            </Button>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default EmpresasBcn;
