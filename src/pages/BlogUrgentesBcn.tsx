import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, Zap } from "lucide-react";
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

const META_TITLE = "Impresión 3D Urgente en Barcelona — Entrega en 24h | Dimension3D";
const META_DESC = "¿Necesitas una pieza impresa en 3D con urgencia en Barcelona? Servicio express con entrega en 24-48h. Presupuesto en menos de 1 hora. Recogida en Barcelona o envío urgente.";
const CANONICAL = `${SITE_URL}/blog/impresion-3d-urgente-barcelona`;

const FAQS = [
  {
    q: "¿Con qué rapidez puedo tener mi pieza impresa en 3D en Barcelona?",
    a: "Para pedidos urgentes, el plazo estándar es de 24 a 48 horas desde la confirmación del pedido. En casos muy simples y con material disponible, podemos entregar el mismo día. El tiempo exacto depende del tamaño de la pieza, el material y la carga de trabajo en el momento del pedido — te lo confirmamos al dar el presupuesto.",
  },
  {
    q: "¿Qué formatos de archivo aceptáis para pedidos urgentes?",
    a: "Aceptamos STL, OBJ, 3MF y STEP. Si tienes el archivo en otro formato (IGES, SolidWorks, Fusion 360), también podemos trabajar con él en la mayoría de casos. Si no tienes ningún archivo digital, envíanos una foto clara de la pieza rota o un croquis con medidas — para piezas sencillas podemos modelarla nosotros mismos.",
  },
  {
    q: "¿Puedo recoger la pieza en Barcelona o hay que esperar el envío?",
    a: "Para pedidos en Barcelona, ofrecemos recogida en persona con cita previa — es la opción más rápida y no tiene coste de envío. También enviamos por mensajería urgente a toda España (24h laborable) si estás fuera de Barcelona o prefieres recibirlo en casa u oficina.",
  },
  {
    q: "¿Cuál es el precio mínimo para un pedido urgente?",
    a: "El precio mínimo es de 10€, igual que para pedidos estándar. No cobramos recargo por urgencia en la mayoría de pedidos de tamaño normal. Para piezas muy grandes o complejas que requieran reorganizar la cola de producción, puede aplicarse una pequeña tarifa prioritaria que te comunicamos siempre antes de confirmar.",
  },
  {
    q: "¿Qué hago si no tengo el archivo STL de la pieza que necesito?",
    a: "No hay problema. Si la pieza es accesible (aunque esté rota), puedes enviarnos fotos desde varios ángulos junto con las medidas clave. Para piezas estándar o de repuesto comunes, muchas veces encontramos el modelo en repositorios públicos como Thingiverse o Printables. Si la pieza es única, te cotizamos el modelado 3D por separado antes de imprimir.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Impresión 3D Urgente en Barcelona — Tu Pieza en 24–48 Horas",
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

const BlogUrgentesBcn = () => {
  const endRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        capture('blog_read_75pct', { post: 'urgentes' });
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
            { "@type": "ListItem", position: 3, name: "Impresión urgente 24h", item: CANONICAL },
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
              <span className="text-primary-foreground/70">Impresión urgente 24h</span>
            </nav>
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors mb-5">
              ← Todas las guías
            </Link>
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-5">
              <Zap className="w-3.5 h-3.5" />
              Servicio Express
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              Impresión 3D Urgente en Barcelona — Tu Pieza en 24–48 Horas
            </h1>
            <p className="text-lg text-primary-foreground/75 leading-relaxed">
              Cuando necesitas una pieza impresa en 3D hoy o mañana, no puedes esperar semanas ni arriesgarte con un servicio desconocido. Presupuesto en menos de 1 hora, impresión prioritaria y recogida en Barcelona o envío urgente.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {[
                { icon: Clock, text: "Presupuesto en &lt;1 hora" },
                { icon: Zap, text: "Entrega en 24–48h" },
                { icon: CheckCircle2, text: "Recogida en Barcelona" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/15 rounded-full px-4 py-2 text-sm text-primary-foreground/80">
                  <Icon className="w-4 h-4 text-accent flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: text }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-4 max-w-3xl mx-auto space-y-16">

            {/* 1. Casos de uso */}
            <article id="casos-uso">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                ¿Para qué necesitas impresión 3D urgente?
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  La impresión 3D urgente no es un capricho — en muchos casos es la única solución práctica cuando una pieza falla en el momento menos oportuno o cuando un plazo no da margen para procesos convencionales. Estos son los escenarios más frecuentes que atendemos:
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Máquina parada por una pieza rota",
                    body: "Un clip, engranaje o soporte roto puede detener una línea de producción entera. Fabricar la pieza en metal puede tardar semanas y costar cientos de euros. Una impresión en 3D en PLA o PETG funciona como solución temporal o permanente en pocas horas.",
                  },
                  {
                    title: "Atrezzo para un evento mañana",
                    body: "Presentaciones, ferias, inauguraciones — cuando falta un elemento decorativo, expositor o accesorio de última hora, la impresión 3D es la única opción que da resultado en menos de un día sin recurrir a soluciones improvisadas.",
                  },
                  {
                    title: "Cosplay o disfraz de última hora",
                    body: "Casco, escudo, armadura, prop de arma — las piezas de cosplay en 3D son uno de nuestros pedidos urgentes más habituales. Con el archivo preparado, una pieza mediana puede estar lista en menos de 24 horas.",
                  },
                  {
                    title: "Prototipo para una reunión o presentación",
                    body: "Mostrar un prototipo físico en una reunión con un cliente o inversor cambia completamente la conversación. Si la reunión es mañana, enviamos el archivo hoy y recogemos mañana por la mañana antes de que empiece.",
                  },
                  {
                    title: "Recambio de pieza descatalogada",
                    body: "Electrodomésticos, maquinaria antigua, muebles con sistemas propietarios — cuando el fabricante ya no fabrica la pieza o tarda semanas en enviarla, la impresión 3D es la solución más rápida y frecuentemente la única posible.",
                  },
                  {
                    title: "Pieza para una reparación puntual",
                    body: "Fontaneros, carpinteros, técnicos de mantenimiento — cada vez más profesionales nos llaman con una foto de una pieza rota y la necesitan al día siguiente para terminar una obra o reparación que no puede esperar.",
                  },
                ].map(({ title, body }) => (
                  <div key={title} className="rounded-xl border border-border bg-secondary/10 px-5 py-4">
                    <h3 className="font-semibold text-foreground mb-2 leading-tight">{title}</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 2. Cómo funciona */}
            <article id="como-funciona">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                ¿Cómo funciona el servicio urgente?
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  El proceso es deliberadamente simple. No queremos que pierdas tiempo con formularios complicados cuando lo que necesitas es tu pieza cuanto antes. Así funciona de principio a fin:
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    step: "1",
                    title: "Envíanos tu archivo o una foto",
                    body: "Manda tu STL, STEP, OBJ o 3MF por WhatsApp o el formulario web. Si no tienes archivo digital, una foto clara de la pieza desde varios ángulos con las medidas clave es suficiente para piezas sencillas. Cuanta más información, más rápido podemos presupuestar.",
                  },
                  {
                    step: "2",
                    title: "Recibes el presupuesto en menos de 1 hora",
                    body: "Revisamos el archivo, elegimos el material más adecuado si no nos lo has indicado, y te enviamos el precio exacto junto con el plazo de entrega estimado. Sin sorpresas ni cargos ocultos. Si tienes dudas, te llamamos o respondemos por WhatsApp.",
                  },
                  {
                    step: "3",
                    title: "Confirmas y arrancamos",
                    body: "Con tu confirmación, la pieza entra en la cola prioritaria. Para pedidos urgentes, la impresión empieza en las próximas horas, no días. Te avisamos cuando esté lista.",
                  },
                  {
                    step: "4",
                    title: "Tu pieza lista en 24–48 horas",
                    body: "La mayoría de piezas urgentes están listas en 24 horas. Piezas muy grandes o complejas pueden necesitar 48 horas. Siempre te confirmamos el plazo exacto antes de que confirmes el pedido, para que puedas planificar.",
                  },
                  {
                    step: "5",
                    title: "Recogida en Barcelona o envío urgente",
                    body: "Recoge en persona en Barcelona con cita previa — sin coste de envío y habitualmente la opción más rápida. También enviamos por mensajería urgente a cualquier punto de España con entrega en 24h laborable si necesitas la pieza en otra ciudad.",
                  },
                ].map(({ step, title, body }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center">
                      {step}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 3. Materiales */}
            <article id="materiales">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                ¿Qué materiales están disponibles para impresión urgente?
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Todos nuestros materiales están disponibles para pedidos urgentes, aunque algunos son más rápidos de imprimir que otros. Si el tiempo es el factor crítico, te recomendamos el material que da el mejor equilibrio entre velocidad y funcionalidad para tu caso concreto.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    mat: "PLA",
                    badge: "Más rápido",
                    badgeColor: "bg-green-500/15 text-green-700 dark:text-green-400",
                    body: "El material estándar y el más rápido de imprimir. Excelente para piezas decorativas, prototipos de forma, accesorios, props y cualquier pieza de uso interior que no esté sometida a calor intenso (más de 60°C). Amplia gama de colores disponibles. La primera opción cuando el tiempo es crítico.",
                  },
                  {
                    mat: "PETG",
                    badge: "Rápido",
                    badgeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
                    body: "Ligeramente más lento que el PLA pero con mejor resistencia mecánica y a la humedad. Ideal para piezas funcionales, recambios, componentes que van al exterior o en entornos húmedos. Muy buena relación velocidad/prestaciones para pedidos urgentes de piezas que necesitan aguantar algo de estrés.",
                  },
                  {
                    mat: "ABS / ASA",
                    badge: "Velocidad media",
                    badgeColor: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
                    body: "Resistencia al calor (hasta 100°C) y a los rayos UV (especialmente el ASA). Para piezas que van cerca de motores, en exteriores o en entornos de alta temperatura. Requieren configuración más cuidadosa y ligeramente más tiempo, pero generalmente seguimos cumpliendo el plazo de 24–48h para tamaños medios.",
                  },
                  {
                    mat: "TPU (flexible)",
                    badge: "Velocidad media",
                    badgeColor: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
                    body: "Material flexible y resistente al impacto. Para fundas, juntas, protectores, amortiguadores y cualquier pieza que necesite doblar sin romperse. La impresión es más lenta por la naturaleza del material, pero para piezas de tamaño pequeño o mediano el plazo urgente sigue siendo viable.",
                  },
                ].map(({ mat, badge, badgeColor, body }) => (
                  <div key={mat} className="rounded-xl border border-border px-5 py-4 bg-secondary/10">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-foreground">{mat}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
                    </div>
                    <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 4. Precio */}
            <article id="precio">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Precio del servicio urgente
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Somos transparentes con los precios: <strong className="text-foreground">el servicio urgente no tiene recargo automático</strong>. Para la mayoría de pedidos de tamaño normal — piezas de hasta 200–300 gramos — el precio es exactamente el mismo que para un pedido estándar, desde 10€.
                </p>
                <p>
                  La razón es sencilla: si tenemos capacidad disponible y el pedido encaja en la cola de producción sin desplazar otros compromisos, no tiene sentido cobrarte más por ello. Nuestro objetivo es que vuelvas cuando necesites imprimir de nuevo, no exprimir cada pedido urgente.
                </p>
                <p>
                  Hay dos situaciones en las que puede aplicarse una pequeña tarifa prioritaria:
                </p>
                <ul className="space-y-2 pl-4">
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5">·</span>
                    <span><strong className="text-foreground">Piezas muy grandes o largas</strong> (más de 400–500 gramos o más de 20 horas de impresión) que requieren reorganizar la cola de producción o usar una máquina en exclusiva durante toda la noche. En estos casos te lo indicamos antes de confirmar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5">·</span>
                    <span><strong className="text-foreground">Pedidos de entrega el mismo día</strong> antes de las 14h, cuando el pedido llega por la mañana temprano y requiere romper la planificación del día. Habitual para emergencias de producción.</span>
                  </li>
                </ul>
                <p>
                  Para una guía completa de precios con ejemplos reales y la fórmula de cálculo, visita nuestra{" "}
                  <Link to="/blog/precio-impresion-3d-barcelona" className="text-accent hover:underline font-medium">
                    guía de precios de impresión 3D en Barcelona
                  </Link>
                  .
                </p>
              </div>

              <div className="mt-5 flex items-start gap-3 bg-accent/8 border border-accent/20 rounded-xl px-5 py-4">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Siempre te comunicamos el precio exacto y el plazo antes de que confirmes. Sin sorpresas, sin cargos adicionales no anunciados.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 5. Casos reales */}
            <article id="casos-reales">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Casos reales: piezas urgentes que hemos impreso
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Estos son ejemplos representativos de pedidos urgentes que gestionamos habitualmente. Los precios son orientativos siguiendo nuestra tarifa estándar.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "Clip del lavavajillas roto",
                    meta: "PETG · ~15 g · entregado en menos de 8 horas",
                    price: "10€",
                    story: "El cesto del lavavajillas dejó de cerrarse por un clip plástico roto. El cliente nos mandó una foto a las 9h. A las 10h tenía el presupuesto. A las 17h recogió la pieza en Barcelona. El lavavajillas funcionando esa misma noche.",
                  },
                  {
                    title: "Prototipo para reunión con inversores",
                    meta: "PLA · ~180 g · entregado en 24 horas",
                    price: "22€",
                    story: "Una startup de dispositivos médicos necesitaba un prototipo de forma de su producto para una presentación al día siguiente. Nos enviaron el STL a las 18h. A las 9h del día siguiente la pieza estaba lista para recoger antes de la reunión a las 11h.",
                  },
                  {
                    title: "Pieza de armadura para cosplay",
                    meta: "PLA · ~240 g · entregado en 36 horas",
                    price: "28€",
                    story: "Para una convención de fin de semana, un cosplayer se dio cuenta el jueves por la tarde que le faltaba una pieza del peto. Con el archivo STL del modelo en mano, imprimimos durante la noche y la pieza estuvo lista el viernes al mediodía.",
                  },
                  {
                    title: "Soporte de rodamiento para maquinaria industrial",
                    meta: "PETG alta resistencia · ~320 g · entregado en 48 horas",
                    price: "38€",
                    story: "Una empresa de artes gráficas tenía una impresora industrial parada por un soporte de plástico roto. El recambio original tardaba 3 semanas. Imprimimos la pieza en PETG de alta resistencia como solución provisional. La máquina volvió a funcionar al segundo día.",
                  },
                  {
                    title: "Expositor para feria de diseño",
                    meta: "PLA · ~410 g (3 piezas) · entregado en 48 horas",
                    price: "48€",
                    story: "Un diseñador industrial necesitaba tres expositores personalizados para presentar sus productos en una feria. Los encargó con dos días de antelación. Imprimimos las tres piezas en paralelo durante la noche y las tuvo listas la mañana de la feria.",
                  },
                ].map(({ title, meta, price, story }) => (
                  <div key={title} className="rounded-xl border border-border bg-secondary/10 px-5 py-5">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-foreground leading-tight">{title}</h3>
                      <span className="text-accent font-bold text-lg whitespace-nowrap">{price}</span>
                    </div>
                    <p className="text-xs text-foreground/50 mb-3">{meta}</p>
                    <p className="text-sm text-foreground/70 leading-relaxed">{story}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 6. Cómo pedir */}
            <article id="como-pedir">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                ¿Cómo pedir tu pieza urgente ahora?
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Tienes dos caminos, según lo urgente que sea tu situación y la información que tengas disponible:
                </p>

                <div className="space-y-4 mt-2">
                  <div className="rounded-xl border border-border px-5 py-5 bg-secondary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-foreground">Calculadora instantánea (tienes el archivo)</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/70">
                      Si ya tienes el archivo STL y sabes el material que necesitas, usa la calculadora en la página principal para obtener un precio orientativo al instante. Después envíanos el archivo para confirmar el precio exacto y el plazo. Este camino es el más rápido para pedidos estándar.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border px-5 py-5 bg-secondary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-foreground">WhatsApp directo (para urgencias reales)</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/70">
                      Si necesitas la pieza hoy o mañana a primera hora, el camino más rápido es escribirnos directamente por WhatsApp. Manda el archivo (o las fotos si no tienes STL), cuéntanos qué es y cuándo lo necesitas — respondemos en menos de 1 hora durante el horario de 9:00 a 20:00. Para urgencias extremas fuera de horario, también respondemos si podemos.
                    </p>
                  </div>
                </div>

                <p>
                  En ambos casos, te confirmamos el precio exacto y el plazo de entrega antes de que confirmes nada. No hay compromiso hasta que tú digas que sí. El presupuesto es siempre gratuito.
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
              Sube tu archivo o usa la calculadora. Sin compromiso, sin sorpresas.
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
              Preguntas frecuentes sobre impresión urgente
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

export default BlogUrgentesBcn;
