import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, MessageCircle, Package } from "lucide-react";
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

const META_TITLE = "Impresión 3D Sin Pedido Mínimo Barcelona — Desde 1 Pieza y 10€ | Dimension3D";
const META_DESC = "Imprimimos una sola pieza en 3D en Barcelona desde 10€ sin pedido mínimo. Un clip, un adaptador, un soporte — sin importe mínimo ni cantidad mínima. Presupuesto gratis en 1 hora, entrega en 24–48h.";
const CANONICAL = `${SITE_URL}/impresion-3d-sin-pedido-minimo`;

const FAQS = [
  {
    q: "¿Puedo encargar solo una pieza?",
    a: "Sí. No hay pedido mínimo de ningún tipo en Dimension3D Barcelona. Puedes encargar una única pieza desde 10€. No hace falta alcanzar ningún importe mínimo ni comprar varias unidades del mismo modelo.",
  },
  {
    q: "¿Cuánto cuesta una pieza pequeña de repuesto?",
    a: "Las piezas pequeñas (menos de 20 gramos) suelen costar entre 10€ y 15€. Las piezas medianas (20–80 gramos) entre 15€ y 25€. El precio depende del material elegido y el tiempo de impresión. Si necesitamos modelar la pieza desde cero (porque no tienes archivo), se cotiza el modelado por separado. Presupuesto gratis y sin compromiso antes de confirmar.",
  },
  {
    q: "¿Cuánto tarda una pieza pequeña en estar lista?",
    a: "Las piezas pequeñas (menos de 50 gramos) están listas habitualmente en 24 horas. Piezas medianas en 2 a 3 días laborables. Con el servicio urgente, la mayoría de piezas pequeñas se entregan en el mismo día o al día siguiente.",
  },
  {
    q: "¿Tienen envío mínimo para una sola pieza?",
    a: "El envío a domicilio tiene un coste fijo de 4,90€ independientemente del número de piezas o el peso del pedido. Para pedidos en Barcelona, la recogida en taller no tiene ningún coste adicional. La cita previa es gratuita.",
  },
  {
    q: "¿Todos los materiales están disponibles para pedidos individuales?",
    a: "Sí. PLA, PETG, ABS, ASA, TPU flexible, Nylon y compuestos de fibra de carbono (PLA-CF, PETG-CF, Nylon-CF) están disponibles para cualquier tamaño de pedido, incluyendo una sola pieza. El precio mínimo de 10€ se aplica independientemente del material.",
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

const PART_EXAMPLES = [
  { type: "Clips y retenes de plástico", weight: "3–15 g", price: "10–12€", mat: "PETG" },
  { type: "Adaptadores y conectores", weight: "10–40 g", price: "10–18€", mat: "PLA / PETG" },
  { type: "Soportes y brackets", weight: "20–80 g", price: "12–22€", mat: "PETG / ABS" },
  { type: "Tapas y carcasas de repuesto", weight: "8–50 g", price: "10–20€", mat: "PLA / PETG" },
  { type: "Bisagras y pernos de plástico", weight: "2–20 g", price: "10–14€", mat: "PETG" },
  { type: "Piezas decorativas únicas", weight: "10–150 g", price: "10–30€", mat: "PLA" },
];

const SinPedidoMinimo = () => {
  const endRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        capture("page_read_75pct", { page: "sin-pedido-minimo" });
        observer.disconnect();
      }
    }, { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleWhatsApp = () => {
    capture("whatsapp_click", { source: "sin_pedido_minimo" });
    const msg = "Hola, quiero pedir una sola pieza impresa en 3D. No tengo pedido mínimo. ¿Me podéis dar presupuesto?";
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
            { "@type": "ListItem", position: 2, name: "Sin pedido mínimo", item: CANONICAL },
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
              <span className="text-primary-foreground/70">Sin pedido mínimo</span>
            </nav>
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-5">
              <Package className="w-3.5 h-3.5" />
              Desde 1 pieza
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-5">
              Impresión 3D Sin Pedido Mínimo en Barcelona — Desde 1 Pieza y 10€
            </h1>

            {/* ANSWER CAPSULE — opening */}
            <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-5 py-4 mb-6">
              <p className="text-primary-foreground/90 leading-relaxed">
                Dimension3D Barcelona imprime piezas únicas desde 10€ sin pedido mínimo. Puedes encargar un solo clip de 3 gramos, un adaptador de 50 gramos o un soporte de 200 gramos y pagarás el precio por pieza sin ningún importe mínimo de pedido. Presupuesto gratis en menos de 1 hora. Entrega en 24–48 horas en Barcelona o envío a toda España por 4,90€.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {[
                "Sin pedido mínimo",
                "Desde 10€ por pieza",
                "Presupuesto en &lt;1h",
                "Entrega 24–48h",
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
                Pedir presupuesto por WhatsApp
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-primary-foreground/80 hover:text-primary-foreground border border-primary-foreground/20 hover:border-primary-foreground/40">
                <Link to="/blog/impresion-3d-urgente-barcelona">
                  Servicio urgente 24h <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-4 max-w-3xl mx-auto space-y-16">

            {/* 1. Qué significa */}
            <article id="sin-pedido-minimo">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                ¿Qué significa exactamente «sin pedido mínimo»?
              </h2>
              {/* SECTION CAPSULE */}
              <div className="bg-secondary/40 border border-border rounded-xl px-5 py-4 mb-5">
                <p className="text-foreground/85 leading-relaxed">
                  Sin pedido mínimo significa que una sola pieza tiene el mismo precio por unidad que un lote de cien. El precio mínimo de cualquier pedido en Dimension3D Barcelona es 10€, independientemente del peso, el número de unidades o el material elegido. No hay recargo por pedido pequeño ni tarifa de gestión adicional.
                </p>
              </div>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Muchos servicios de impresión 3D — tanto online como presenciales — imponen un pedido mínimo de entre 25€ y 60€. La razón comercial es que preparar una impresión tiene un tiempo de configuración fijo: abrir el archivo, revisar la geometría, colocar la pieza en la cama, ajustar los parámetros. Para que ese tiempo resulte rentable, muchos operadores exigen un mínimo.
                </p>
                <p>
                  En Dimension3D no funcionamos así. El precio desde 10€ ya cubre ese tiempo de configuración para piezas sencillas. Si necesitas un solo clip de repuesto de 3 gramos de PETG, el precio es 10€, no 40€ para «compensar» el tiempo de preparación.
                </p>
                <p>
                  La única excepción son las piezas que requieren modelado CAD desde cero (sin archivo digital y con geometría compleja) — en ese caso, el coste del modelado se cotiza por separado antes de confirmar nada.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 2. Piezas habituales */}
            <article id="piezas-habituales">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Piezas individuales que fabricamos habitualmente
              </h2>
              {/* SECTION CAPSULE */}
              <div className="bg-secondary/40 border border-border rounded-xl px-5 py-4 mb-5">
                <p className="text-foreground/85 leading-relaxed">
                  Fabricamos regularmente piezas individuales de entre 3 y 200 gramos para particulares y profesionales en Barcelona. Los más frecuentes: clips y retenes (10–12€), adaptadores y conectores (10–18€), soportes y brackets (12–22€), tapas de repuesto (10–20€) y bisagras de plástico (10–14€). Todos los precios incluyen material, impresión y revisión de calidad.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-secondary/40">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Tipo de pieza</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Peso aprox.</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Precio orientativo</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Material habitual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PART_EXAMPLES.map((row, i) => (
                      <tr key={row.type} className={i % 2 === 0 ? "bg-background" : "bg-secondary/20"}>
                        <td className="px-4 py-3 text-foreground">{row.type}</td>
                        <td className="px-4 py-3 text-foreground/70">{row.weight}</td>
                        <td className="px-4 py-3 font-medium text-accent">{row.price}</td>
                        <td className="px-4 py-3 text-foreground/70">{row.mat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-foreground/50 mt-3">
                Precios orientativos para piezas estándar con archivo digital disponible. El precio exacto se confirma siempre en el presupuesto gratuito antes de cualquier compromiso.
              </p>

              {/* Links to catalog parts */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/rueda-cesto-lavavajillas-bosch"
                  className="group rounded-xl border border-border bg-background p-4 hover:border-accent/50 transition-colors"
                >
                  <p className="font-semibold text-foreground text-sm mb-1 group-hover:text-accent transition-colors">Rueda cesto lavavajillas Bosch/Siemens</p>
                  <p className="text-xs text-foreground/55 mb-2">Repuesto individual. Disponible ya.</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">Ver pieza <ArrowRight className="w-3 h-3" /></span>
                </Link>
                <Link
                  to="/adaptador-manguera-gardena"
                  className="group rounded-xl border border-border bg-background p-4 hover:border-accent/50 transition-colors"
                >
                  <p className="font-semibold text-foreground text-sm mb-1 group-hover:text-accent transition-colors">Adaptador manguera Gardena</p>
                  <p className="text-xs text-foreground/55 mb-2">Pieza individual. Disponible ya.</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">Ver pieza <ArrowRight className="w-3 h-3" /></span>
                </Link>
              </div>
              <p className="text-sm text-foreground/55 mt-3">
                ¿Buscas otro recambio? <Link to="/catalogo" className="text-accent hover:underline">Explora el catálogo completo</Link>.
              </p>
            </article>

            <div className="border-b border-border/40" />

            {/* 3. Materiales */}
            <article id="materiales">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Materiales disponibles para una sola pieza
              </h2>
              {/* SECTION CAPSULE */}
              <div className="bg-secondary/40 border border-border rounded-xl px-5 py-4 mb-5">
                <p className="text-foreground/85 leading-relaxed">
                  Todos los materiales del catálogo están disponibles para pedidos individuales: PLA (interior, decorativo, el más rápido), PETG (funcional, resistente a humedad, recomendado para recambios), ABS y ASA (alta temperatura y UV), TPU flexible, Nylon (alta carga mecánica) y compuestos de fibra de carbono. El precio mínimo de 10€ se aplica a cualquier material.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { mat: "PLA", use: "Decorativo, prototipos, piezas de interior", note: "El más rápido. Desde 10€." },
                  { mat: "PETG", use: "Recambios funcionales, humedad, golpes", note: "Recomendado para piezas de repuesto. Desde 10€." },
                  { mat: "ABS / ASA", use: "Alta temperatura (hasta 100°C), exterior, UV", note: "ASA especialmente para exteriores. Desde 10€." },
                  { mat: "TPU", use: "Flexible, juntas, fundas, amortiguadores", note: "Elástico y resistente al impacto. Desde 10€." },
                  { mat: "Nylon", use: "Alta carga mecánica, desgaste", note: "El más resistente mecánicamente. Desde 12€." },
                  { mat: "PLA-CF / PETG-CF", use: "Rigidez máxima, aspecto técnico", note: "Fibra de carbono compuesta. Desde 14€." },
                ].map(({ mat, use, note }) => (
                  <div key={mat} className="rounded-xl border border-border bg-secondary/10 px-4 py-3">
                    <p className="font-bold text-foreground text-sm mb-0.5">{mat}</p>
                    <p className="text-xs text-foreground/70">{use}</p>
                    <p className="text-xs text-accent font-medium mt-1">{note}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 4. Cómo pedir */}
            <article id="como-pedir">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Cómo pedir una sola pieza
              </h2>
              {/* SECTION CAPSULE */}
              <div className="bg-secondary/40 border border-border rounded-xl px-5 py-4 mb-5">
                <p className="text-foreground/85 leading-relaxed">
                  Para encargar una sola pieza, envía el archivo STL o una foto por WhatsApp al número del taller. Respondemos con presupuesto en menos de 1 hora, de 9:00 a 20:00. Confirmas, pagamos, imprimimos. La mayoría de piezas pequeñas están listas en 24 horas. Recogida gratuita en Barcelona o envío a domicilio por 4,90€.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { step: "01", title: "Envía el archivo o una foto", body: "Por WhatsApp o el formulario web. Si tienes el STL, el presupuesto es inmediato. Si solo tienes la pieza o unas fotos, lo revisamos y te respondemos en menos de 1 hora." },
                  { step: "02", title: "Recibe el presupuesto en menos de 1 hora", body: "Precio exacto, material recomendado y plazo de entrega. Sin sorpresas ni cargos ocultos. El presupuesto es siempre gratuito." },
                  { step: "03", title: "Confirma y arrancamos", body: "Con tu confirmación, la pieza entra en producción. Para pedidos urgentes, empezamos en horas, no días." },
                  { step: "04", title: "Recoge o recibe en 24–48 horas", body: "Recogida sin coste en Rambla de Brasil, Barcelona, con cita previa. Envío a toda España peninsular por 4,90€." },
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
                Preguntas frecuentes sobre pedidos individuales
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                to="/repuesto-descatalogado"
                className="group rounded-xl border border-border bg-secondary/20 p-5 hover:border-accent/50 transition-colors"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Servicio relacionado</p>
                <p className="font-semibold text-foreground text-sm leading-snug mb-1 group-hover:text-accent transition-colors">
                  ¿El fabricante ya no lo vende?
                </p>
                <p className="text-xs text-foreground/55 leading-relaxed mb-3">
                  Reproducimos piezas descatalogadas desde foto o la pieza original. Mismo precio mínimo de 10€.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Reproducción de descatalogados <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
              <Link
                to="/impresion-3d-empresas-barcelona"
                className="group rounded-xl border border-border bg-secondary/20 p-5 hover:border-accent/50 transition-colors"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Servicio relacionado</p>
                <p className="font-semibold text-foreground text-sm leading-snug mb-1 group-hover:text-accent transition-colors">
                  ¿Necesitas varias piezas para tu empresa?
                </p>
                <p className="text-xs text-foreground/55 leading-relaxed mb-3">
                  Prototipos, recambios de maquinaria y piezas de marca para empresas. Sin pedido mínimo, NDA disponible.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Servicio para empresas <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>

          </div>
        </section>

        {/* ── CTA ── */}
        <section ref={endRef as React.RefObject<HTMLElement>} className="py-16 md:py-20 bg-foreground text-background">
          <div className="container px-4 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Sin pedido mínimo · Desde 10€
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-background mb-4">
              ¿Necesitas una sola pieza?
            </h2>
            <p className="text-background/70 leading-relaxed mb-8 max-w-lg mx-auto">
              Mándanos el archivo STL o una foto por WhatsApp. En menos de una hora tienes presupuesto, sin compromiso y sin pedido mínimo.
            </p>
            <Button onClick={handleWhatsApp} variant="cta" size="lg" className="gap-2">
              <MessageCircle className="w-5 h-5" />
              Enviar por WhatsApp
            </Button>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default SinPedidoMinimo;
