import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";
import { capture } from "@/lib/analytics";

const SITE_URL = "https://www.dimension3dprints.com";

const META_TITLE = "¿Cuánto cuesta la Impresión 3D en Barcelona? Guía de precios 2026 | Dimension3D";
const META_DESC = "Guía completa de precios de impresión 3D en Barcelona 2026. Desde 10€ para piezas pequeñas. Factores que afectan el precio: material, tamaño, cantidad. Presupuesto gratis en 1 hora.";
const CANONICAL = `${SITE_URL}/blog/precio-impresion-3d-barcelona`;

const FAQS = [
  {
    q: "¿Cuánto cuesta imprimir una pieza pequeña en Barcelona?",
    a: "Para piezas pequeñas (menos de 50 gramos) el precio mínimo en Dimension3D es de 10€. Esto cubre el material, el tiempo de impresión y la gestión del pedido. La mayoría de clips, soportes pequeños y piezas sencillas caen en este rango.",
  },
  {
    q: "¿Qué factores afectan más al precio de la impresión 3D?",
    a: "Los tres factores principales son: el peso en gramos de la pieza (que determina el coste de material), el tiempo de impresión en horas (que influye en el coste operativo) y el material elegido. El PLA es el más económico; materiales como el Nylon con fibra de carbono pueden costar un 60% más.",
  },
  {
    q: "¿Cuál es el precio mínimo de impresión 3D en Dimension3D?",
    a: "El precio mínimo es de 10€ por pedido. No importa si la pieza pesa 5 gramos o 45 gramos — el mínimo garantiza que el pedido sea viable para nosotros y que el cliente reciba atención y calidad plenas.",
  },
  {
    q: "¿Cómo puedo obtener un presupuesto exacto para mi pieza?",
    a: "La forma más rápida es usar nuestra calculadora en la página principal: introduce el peso aproximado del archivo STL y el material, y obtienes un precio orientativo en segundos. Para confirmar el precio exacto, envíanos el archivo por WhatsApp o el formulario web — respondemos en menos de 1 hora.",
  },
  {
    q: "¿Cuánto tarda en llegar mi pedido en Barcelona?",
    a: "Para pedidos estándar, el plazo es de 2 a 5 días laborables. Para pedidos express (coste adicional según complejidad), podemos entregar en 24 a 48 horas. La mayoría de clientes en Barcelona opt an por recogida en persona con cita previa, lo que puede ser el mismo día en algunos casos.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "¿Cuánto cuesta la Impresión 3D en Barcelona? Guía de precios 2026",
  description: META_DESC,
  author: { "@type": "Organization", name: "Dimension3D Barcelona" },
  publisher: { "@type": "Organization", name: "Dimension3D Barcelona", url: SITE_URL },
  datePublished: "2026-06-29",
  dateModified: "2026-06-29",
  inLanguage: "es",
  url: CANONICAL,
  image: `${SITE_URL}/og-image.jpg`,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const BlogPrecioBcn = () => {
  const endRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        capture('blog_read_75pct', { post: 'precio' });
        observer.disconnect();
      }
    }, { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={META_TITLE} />
        <meta name="twitter:description" content={META_DESC} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/blog` },
            { "@type": "ListItem", position: 3, name: "Guía de precios 2026", item: CANONICAL },
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
              <Link to="/blog" className="hover:text-primary-foreground/80 transition-colors">Guías</Link>
              <span>/</span>
              <span className="text-primary-foreground/70">Guía de precios 2026</span>
            </nav>
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors mb-5">
              ← Todas las guías
            </Link>
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-5">
              Guía 2026
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              ¿Cuánto cuesta imprimir en 3D en Barcelona? Guía de precios 2026
            </h1>
            <p className="text-lg text-primary-foreground/75 leading-relaxed">
              La guía más completa sobre precios de impresión 3D en Barcelona. Tarifas reales, factores que influyen en el coste y cómo obtener un presupuesto exacto en menos de 1 hora.
            </p>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-4 max-w-3xl mx-auto space-y-16">

            {/* 1. Introducción */}
            <article id="intro">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                ¿Por qué varía tanto el precio de la impresión 3D?
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Cuando buscas el precio de imprimir en 3D en Barcelona, probablemente encuentras respuestas muy dispares: desde "desde 5€" hasta "cientos de euros". Esa diferencia no es engaño — es que el precio de la impresión 3D depende de varios factores que cambian radicalmente de una pieza a otra.
                </p>
                <p>
                  La realidad es que nadie puede darte un precio exacto sin ver tu archivo o, al menos, conocer el peso aproximado de la pieza y el material que necesitas. Un soporte de móvil sencillo en PLA puede costar 10€. Un prototipo funcional grande en Nylon puede costar 80€. Son el mismo proceso, pero con parámetros completamente distintos.
                </p>
                <p>
                  Esta guía te explica exactamente qué factores determinan el precio, te da rangos de precios reales para los casos más comunes, y al final te mostramos la forma más rápida de obtener un presupuesto exacto para tu pieza específica — gratis, sin compromiso, en menos de una hora.
                </p>
                <p>
                  Si ya tienes tu archivo STL listo, puedes saltar directamente al final de esta página y usar nuestra calculadora instantánea. Si estás empezando a entender cómo funciona la impresión 3D, sigue leyendo.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 2. Precio por tamaño */}
            <article id="precio-tamano">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Precio por tamaño y peso: la referencia más útil
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  El peso de la pieza en gramos es el indicador más práctico del coste, porque determina directamente la cantidad de material consumido y da una idea bastante buena del tiempo de impresión. Usamos una fórmula base sencilla: <strong className="text-foreground">gramos × 0,10€ + horas de impresión × 0,50€</strong>, con un mínimo de 10€ por pedido.
                </p>
                <p>
                  A continuación, los rangos de precio más habituales en PLA (el material estándar):
                </p>
              </div>

              {/* Price table */}
              <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/60 text-foreground font-semibold">
                      <th className="text-left px-4 py-3 border-b border-border">Tamaño / Peso</th>
                      <th className="text-left px-4 py-3 border-b border-border">Precio orientativo (PLA)</th>
                      <th className="text-left px-4 py-3 border-b border-border">Ejemplos típicos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium">Pequeño (hasta 50 g)</td>
                      <td className="px-4 py-3 text-accent font-semibold">desde 10€</td>
                      <td className="px-4 py-3 text-foreground/70">Soporte de móvil, clip de repuesto, llavero, pieza pequeña</td>
                    </tr>
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium">Mediano (50–200 g)</td>
                      <td className="px-4 py-3 text-accent font-semibold">15€ – 30€</td>
                      <td className="px-4 py-3 text-foreground/70">Carcasa de dispositivo, engranaje, figura decorativa, organizador</td>
                    </tr>
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium">Grande (200–500 g)</td>
                      <td className="px-4 py-3 text-accent font-semibold">30€ – 60€</td>
                      <td className="px-4 py-3 text-foreground/70">Prototipo funcional, componente mecánico, maqueta arquitectónica</td>
                    </tr>
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium">Muy grande (500 g+)</td>
                      <td className="px-4 py-3 text-accent font-semibold">desde 55€</td>
                      <td className="px-4 py-3 text-foreground/70">Piezas industriales, estructuras grandes, impresiones en varias partes</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-sm text-foreground/60 italic">
                Precios orientativos en PLA. El material, la complejidad y las opciones de acabado pueden modificar el precio final.
              </p>
            </article>

            <div className="border-b border-border/40" />

            {/* 3. Material */}
            <article id="material">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Cómo afecta el material al precio
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  El material es el segundo factor más importante en el precio. No todos los filamentos cuestan lo mismo, y algunos requieren configuraciones de impresión más exigentes que alargan el tiempo del proceso. Aquí tienes un multiplicador orientativo respecto al precio base en PLA:
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                {[
                  { mat: "PLA", mult: "×1,0 (base)", why: "El material estándar. Fácil de imprimir, buena resistencia para uso cotidiano, amplia gama de colores. La opción más económica.", color: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400" },
                  { mat: "PETG", mult: "×1,1", why: "Ligeramente más resistente al calor y a la humedad que el PLA. Ideal para piezas que van al exterior o cerca de fuentes de calor. Mínimo incremento de precio.", color: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400" },
                  { mat: "TPU / ABS / ASA", mult: "×1,3", why: "TPU para piezas flexibles (fundas, juntas, amortiguadores). ABS/ASA para resistencia al calor y uso exterior intensivo. Requieren configuraciones más cuidadosas.", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
                  { mat: "Nylon (PA)", mult: "×1,4", why: "Excelente resistencia mecánica y al desgaste. Perfecto para engranajes, piezas funcionales sometidas a estrés. Más exigente en la impresión.", color: "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400" },
                  { mat: "Composites (fibra de carbono, fibra de vidrio)", mult: "×1,6", why: "La mayor resistencia por peso disponible en FDM. Para piezas técnicas y estructurales. El material más caro y el proceso más lento.", color: "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400" },
                ].map(({ mat, mult, why, color }) => (
                  <div key={mat} className={`rounded-xl border px-5 py-4 ${color}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{mat}</span>
                      <span className="text-sm font-semibold">{mult}</span>
                    </div>
                    <p className="text-sm opacity-80 leading-relaxed">{why}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-foreground/70 leading-relaxed">
                Si no tienes claro qué material necesitas, coméntanoslo al pedir presupuesto. En función del uso que le vayas a dar a la pieza, te recomendamos la opción más económica que cumpla tus requisitos.
              </p>
            </article>

            <div className="border-b border-border/40" />

            {/* 4. Otros factores */}
            <article id="otros-factores">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Otros factores que afectan al precio
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Más allá del tamaño y el material, hay otros parámetros que pueden subir o bajar el precio final:
                </p>

                <div className="space-y-5 mt-2">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Relleno (infill) y paredes</h3>
                    <p>
                      Por defecto imprimimos con un relleno del 15–20% y 2–3 perímetros de pared, que es más que suficiente para la gran mayoría de piezas decorativas o de uso suave. Si necesitas una pieza de alta resistencia mecánica (infill 40–80%, 4+ paredes), el tiempo de impresión puede aumentar un 30–60%, lo que se refleja en el precio.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Descuentos por cantidad</h3>
                    <p>
                      Si necesitas varias copias del mismo modelo, aplicamos descuentos por volumen: <strong className="text-foreground">10 o más unidades — 5% de descuento; 25 o más unidades — 10% de descuento</strong>. Para cantidades mayores o pedidos recurrentes de empresa, consúltanos directamente para una tarifa personalizada.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Complejidad geométrica</h3>
                    <p>
                      Piezas con muchos voladizos, geometrías muy intrincadas o partes que requieren soportes complejos tardan más en imprimir y en limpiar. Si tu diseño es especialmente elaborado, puede haber un pequeño recargo por la gestión de soportes y el post-procesado.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Post-procesado y acabado</h3>
                    <p>
                      El precio base incluye la pieza tal como sale de la impresora, con una limpieza básica de soportes. Si necesitas lijado, pintura, imprimación o cualquier otro acabado superficial, lo cotizamos aparte. La mayoría de clientes no necesitan post-procesado salvo para piezas decorativas o expuestas a la vista.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 5. Comparativa */}
            <article id="comparativa">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Comparativa: ¿cuánto cobran otros servicios?
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Cuando buscas impresión 3D en Barcelona tienes varias opciones. Queremos ser honestos sobre cómo nos comparamos:
                </p>

                <div className="space-y-4 mt-2">
                  <div className="rounded-xl border border-border px-5 py-4 bg-secondary/20">
                    <h3 className="font-semibold text-foreground mb-1">Servicios industriales online (Shapeways, Hubs, Craftcloud)</h3>
                    <p className="text-sm leading-relaxed">
                      Pensados para producción en volumen y materiales industriales (SLS, MJF, resina). Para pedidos pequeños en FDM, resultan caros — raramente bajan de 25–40€ por pieza sencilla — y los plazos son de 5–15 días por el envío desde otro país. No son la opción adecuada si necesitas algo rápido o en pequeña cantidad.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border px-5 py-4 bg-secondary/20">
                    <h3 className="font-semibold text-foreground mb-1">Makers locales particulares (Wallapop, grupos de Facebook)</h3>
                    <p className="text-sm leading-relaxed">
                      A veces los precios son más bajos, pero la calidad y fiabilidad son muy variables. No hay garantía de plazo, el soporte post-venta es inexistente y encontrar a alguien disponible puede llevar días. Para un prototipo informal está bien; para algo que necesitas en una fecha concreta o con calidad consistente, el riesgo es alto.
                    </p>
                  </div>

                  <div className="rounded-xl border border-accent/30 px-5 py-4 bg-accent/5">
                    <h3 className="font-semibold text-foreground mb-1">Dimension3D Barcelona</h3>
                    <p className="text-sm leading-relaxed">
                      Servicio profesional local con precios transparentes desde 10€, presupuesto en menos de 1 hora, plazo estándar de 2–5 días y express de 24–48h, recogida en Barcelona o envío a toda España. Respaldado por reseñas verificadas y soporte directo por WhatsApp. No somos el más barato en todos los casos, pero sí el más predecible y fiable para pedidos de 1 a 50 unidades.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 6. Ejemplos reales */}
            <article id="ejemplos">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Ejemplos de precios reales
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Nada mejor que ejemplos concretos. Aquí tienes seis encargos reales con sus precios aproximados, calculados con nuestra fórmula base (gramos × 0,10€ + horas × 0,50€, mínimo 10€):
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    name: "Soporte de móvil",
                    detail: "PLA, ~20 g, ~1,5 h de impresión",
                    price: "10€",
                    note: "Precio mínimo aplicado",
                  },
                  {
                    name: "Pieza de recambio (clip de persiana)",
                    detail: "PETG, ~35 g, ~2 h de impresión",
                    price: "10€ – 12€",
                    note: "PETG ×1,1 sobre base PLA",
                  },
                  {
                    name: "Carcasa de electrónica",
                    detail: "PLA, ~90 g, ~4 h de impresión",
                    price: "11€ – 15€",
                    note: "Pieza mediana, geometría sencilla",
                  },
                  {
                    name: "Prototipo funcional mediano",
                    detail: "PETG, ~150 g, ~7 h de impresión",
                    price: "22€ – 28€",
                    note: "Infill 25%, paredes estándar",
                  },
                  {
                    name: "Prototipo de ingeniería grande",
                    detail: "ABS, ~400 g, ~18 h de impresión",
                    price: "48€ – 58€",
                    note: "ABS ×1,3, alta resistencia",
                  },
                  {
                    name: "Figura decorativa detallada",
                    detail: "PLA, ~280 g, ~14 h de impresión",
                    price: "35€ – 45€",
                    note: "Alta resolución, soportes complejos",
                  },
                ].map(({ name, detail, price, note }) => (
                  <div key={name} className="rounded-xl border border-border bg-secondary/10 px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-foreground leading-tight">{name}</h3>
                      <span className="text-accent font-bold text-lg whitespace-nowrap">{price}</span>
                    </div>
                    <p className="text-xs text-foreground/60 mb-1">{detail}</p>
                    <p className="text-xs text-foreground/50 italic">{note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-3 bg-accent/8 border border-accent/20 rounded-xl px-5 py-4">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Estos son precios orientativos. El precio exacto depende del archivo específico. Envíanos tu STL o STEP y te damos el precio definitivo en menos de 1 hora, sin compromiso.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 7. Cómo obtener presupuesto */}
            <article id="presupuesto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                ¿Cómo obtener un presupuesto exacto?
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Tenemos dos formas de obtener un presupuesto, según la información que tengas disponible:
                </p>

                <div className="space-y-4 mt-2">
                  <div className="rounded-xl border border-border px-5 py-5 bg-secondary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-foreground">Calculadora instantánea (estimación)</h3>
                    </div>
                    <p className="text-sm leading-relaxed">
                      En nuestra página principal encontrarás una calculadora donde introduces el peso aproximado de la pieza (lo puedes ver en tu slicer antes de exportar) y el material, y obtienes un precio orientativo al instante. Es perfecta para comparar opciones o hacer una estimación rápida antes de comprometerte.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border px-5 py-5 bg-secondary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-foreground">Presupuesto humano en 1 hora (precio exacto)</h3>
                    </div>
                    <p className="text-sm leading-relaxed">
                      Envíanos tu archivo (STL, OBJ, 3MF o STEP) por WhatsApp o el formulario de la web, junto con el material que prefieres y el uso que le vas a dar. En menos de una hora te damos un precio definitivo, sin sorpresas ni cargos ocultos. Si el precio no te convence, no hay compromiso alguno.
                    </p>
                  </div>
                </div>

                <p>
                  No cobramos por dar presupuesto. No hay mínimo de pedido sorpresa más allá del que ya indicamos (10€). Y si tienes dudas sobre el material o el diseño, nuestro equipo te asesora sin coste adicional.
                </p>
              </div>
            </article>

          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-14 bg-accent">
          <div className="container px-4 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-accent-foreground mb-3">
              Obtén tu presupuesto ahora — gratis en 1 hora
            </h2>
            <p className="text-accent-foreground/80 mb-8 text-lg">
              Sube tu archivo o usa nuestra calculadora. Sin compromiso, sin sorpresas.
            </p>
            <Button asChild size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg gap-2">
              <Link to="/#calculator">
                Calcular precio ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section ref={endRef} className="py-16 md:py-20 bg-secondary/30">
          <div className="container px-4 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Preguntas frecuentes sobre precios
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-medium hover:text-accent hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <div className="container px-4 py-8 max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Todas las guías
          </Link>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default BlogPrecioBcn;
