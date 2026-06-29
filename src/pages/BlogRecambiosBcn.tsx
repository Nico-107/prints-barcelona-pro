import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, MessageCircle, Wrench } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";

const SITE_URL = "https://www.dimension3dprints.com";
const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

const META_TITLE = "Recambios y Piezas Rotas en Impresión 3D Barcelona — Desde 10€ | Dimension3D";
const META_DESC = "¿Se te ha roto una pieza y no encuentras el recambio? La imprimimos en 3D en Barcelona. Desde foto o medidas. Entrega 24-48h. Desde 10€. Presupuesto gratis en 1 hora.";
const CANONICAL = `${SITE_URL}/blog/recambios-piezas-rotas-impresion-3d-barcelona`;

const FAQS = [
  {
    q: "¿Podéis reproducir cualquier pieza rota en 3D?",
    a: "La gran mayoría de piezas plásticas sí son reproducibles. Si tienes la pieza rota (aunque esté en varios trozos), podemos medirla y modelarla. Si solo tienes fotos, podemos reproducir piezas con geometría clara. Las limitaciones son: piezas con formas orgánicas muy complejas sin archivo digital, piezas metálicas (no fabricamos en metal), y piezas con tolerancias muy ajustadas que requieren maquinado de precisión. Si tienes dudas sobre tu pieza concreta, mándanos una foto y te decimos en menos de 1 hora si podemos hacerlo.",
  },
  {
    q: "¿Cómo os envío la foto o las medidas de la pieza?",
    a: "La forma más rápida es por WhatsApp: manda fotos de la pieza desde al menos 3 ángulos (frontal, lateral y posterior), una foto junto a una regla o moneda para tener referencia de escala, y una descripción de para qué sirve la pieza y en qué aparato va. Con eso podemos darte un presupuesto en menos de 1 hora. Si tienes el archivo STL, OBJ o STEP, también puedes mandarlo por el formulario de la web.",
  },
  {
    q: "¿Cuánto cuesta imprimir un recambio en 3D?",
    a: "El precio mínimo es de 10€. La mayoría de recambios pequeños (clips, tapas, bisagras) caen entre 10€ y 20€. Piezas medianas funcionales suelen estar entre 20€ y 40€. Si además necesitamos modelar la pieza desde cero (porque no tienes archivo y la pieza es compleja), cotizamos el modelado por separado antes de confirmar nada.",
  },
  {
    q: "¿Qué material usáis para los recambios?",
    a: "Para la mayoría de recambios funcionales recomendamos PETG: es más resistente que el PLA, tiene algo de flexibilidad para absorber golpes, soporta temperaturas hasta 80°C y es resistente a la humedad. Para piezas expuestas al sol o al calor intenso (exterior, cerca del motor) usamos ABS o ASA. Para juntas y piezas que necesitan flexibilidad, TPU. El material más adecuado para tu pieza específica lo discutimos antes de imprimir.",
  },
  {
    q: "¿Cuánto tarda en estar lista la pieza?",
    a: "Para pedidos estándar, el plazo es de 2 a 5 días laborables desde la confirmación. Si la pieza es urgente, tenemos servicio express con entrega en 24-48 horas (mismo precio para piezas de tamaño normal). Cuéntanos tu plazo al pedir presupuesto y buscamos la mejor opción.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Piezas Rotas y Recambios en 3D Barcelona — De la Foto a la Pieza en 24h",
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

const BlogRecambiosBcn = () => {
  const handleWhatsApp = () => {
    const msg = "Hola, tengo una pieza rota y me gustaría saber si podéis reproducirla en 3D. Os mando fotos.";
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
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={META_TITLE} />
        <meta name="twitter:description" content={META_DESC} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <LaunchOfferBanner />
      <Header />

      <main className="pt-16">

        {/* ── HERO ── */}
        <section className="py-16 md:py-20 hero-gradient">
          <div className="container px-4 max-w-3xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-primary-foreground/50 mb-6">
              <Link to="/" className="hover:text-primary-foreground/80 transition-colors">
                Inicio
              </Link>
              <span>/</span>
              <span className="text-primary-foreground/70">Recambios y piezas rotas</span>
            </nav>
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-5">
              <Wrench className="w-3.5 h-3.5" />
              Reproducción de piezas
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              Piezas Rotas y Recambios en 3D Barcelona — De la Foto a la Pieza en 24h
            </h1>
            <p className="text-lg text-primary-foreground/75 leading-relaxed">
              ¿Se ha roto una pieza plástica y el fabricante ya no la vende, tarda semanas o cuesta más de lo que vale el aparato? La reproducimos en 3D desde una foto, unas medidas o el archivo original. Presupuesto gratis en menos de 1 hora.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "Desde foto o pieza rota",
                "Sin STL necesario",
                "Desde 10€",
                "Entrega 24-48h en Barcelona",
              ].map((tag) => (
                <div key={tag} className="flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/15 rounded-full px-4 py-2 text-sm text-primary-foreground/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-4 max-w-3xl mx-auto space-y-16">

            {/* 1. ¿Se puede imprimir? */}
            <article id="se-puede">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                ¿Se puede imprimir una pieza rota en 3D?
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  En la mayoría de los casos, sí. La impresión 3D es especialmente útil para reproducir piezas plásticas rotas porque permite crear una copia exacta a partir de la pieza original (aunque esté en varios trozos), de fotografías detalladas o del número de referencia del fabricante.
                </p>
                <p>
                  El proceso es el siguiente: primero analizamos la pieza y determinamos si podemos reproducirla con las medidas y la geometría necesarias. Si tienes el archivo 3D (STL, STEP, OBJ), la reproducción es directa. Si solo tienes la pieza física, la medimos nosotros o nos la describes por fotos. Si solo tienes el número de referencia del fabricante, buscamos el modelo en repositorios de piezas como Thingiverse, Printables o GrabCAD — muchas piezas de electrodomésticos y coches populares ya están modeladas por la comunidad.
                </p>
                <p>
                  Una vez tenemos el modelo validado, la impresión dura entre 1 y 12 horas según el tamaño, y la pieza está lista para recoger en Barcelona o enviamos a toda España. El precio incluye siempre la revisión del modelo y una prueba de encaje si es necesaria.
                </p>
                <p>
                  Hay casos en los que no podemos ayudarte: piezas metálicas (solo trabajamos con plástico FDM), piezas con tolerancias de precisión que requieren maquinado CNC (menos de ±0,1 mm), y piezas con geometría orgánica muy compleja sin referencias de medidas claras. Si tienes dudas, mándanos una foto y te decimos en menos de una hora si es viable.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 2. Qué piezas */}
            <article id="que-piezas">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                ¿Qué piezas se pueden reproducir?
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed mb-6">
                <p>
                  Si es plástico y tiene una función mecánica o estructural, probablemente podemos reproducirlo. Estos son los tipos de piezas más habituales que fabricamos para clientes en Barcelona:
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    category: "Electrodomésticos",
                    color: "bg-blue-500/8 border-blue-500/20",
                    items: [
                      "Clips del cesto de la lavadora o el lavavajillas",
                      "Mandos y perillas de cocina, horno o campana",
                      "Tapas de compartimentos de frigorífico",
                      "Soportes de estantes interiores",
                      "Bisagras y cierres de tapa",
                    ],
                  },
                  {
                    category: "Muebles y hogar",
                    color: "bg-green-500/8 border-green-500/20",
                    items: [
                      "Bisagras y pernos de plástico (IKEA y otras marcas)",
                      "Patas y niveladores de armarios y mesas",
                      "Conectores y clips de estanterías modulares",
                      "Pomos y tiradores de cajones y puertas",
                      "Tapas de enchufes y cajas eléctricas",
                    ],
                  },
                  {
                    category: "Vehículos",
                    color: "bg-yellow-500/8 border-yellow-500/20",
                    items: [
                      "Clips de molduras y paneles de interior",
                      "Portavasos y soportes de consola central",
                      "Tapas y carcasas de maletero y maletín",
                      "Soportes de mando a distancia y GPS",
                      "Piezas de embellecedor y rejillas de ventilación",
                    ],
                  },
                  {
                    category: "Industria y taller",
                    color: "bg-orange-500/8 border-orange-500/20",
                    items: [
                      "Juntas y retenes de plástico",
                      "Soportes y utillaje de producción",
                      "Tapas de protección y cubiertas",
                      "Piezas de utillaje y plantillas de montaje",
                      "Espaciadores, casquillos y guías",
                    ],
                  },
                  {
                    category: "Gadgets y electrónica",
                    color: "bg-purple-500/8 border-purple-500/20",
                    items: [
                      "Carcasas y tapas de dispositivos",
                      "Tapas de compartimento de batería",
                      "Soportes y bases de cargadores",
                      "Clips y correas de wearables",
                      "Fundas personalizadas para proyectos DIY",
                    ],
                  },
                  {
                    category: "Juguetes y ocio",
                    color: "bg-pink-500/8 border-pink-500/20",
                    items: [
                      "Piezas de juegos de mesa y figuras",
                      "Componentes de maquetas y dioramas",
                      "Accesorios de bicicleta y patinete",
                      "Piezas de instrumentos musicales",
                      "Repuestos de drones y radiocontrol",
                    ],
                  },
                ].map(({ category, color, items }) => (
                  <div key={category} className={`rounded-xl border px-5 py-4 ${color}`}>
                    <h3 className="font-semibold text-foreground mb-3">{category}</h3>
                    <ul className="space-y-1.5">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-foreground/70">
                          <span className="text-accent mt-0.5 flex-shrink-0">·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 3. Cómo enviarnos */}
            <article id="como-enviar">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                ¿Cómo enviarnos la pieza o las fotos?
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Tenemos tres formas de trabajar según la información que tengas disponible. Elige la que mejor se adapte a tu situación:
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    label: "A",
                    title: "Tienes el archivo STL, STEP u OBJ",
                    best: "Camino más rápido y económico",
                    bestColor: "bg-green-500/15 text-green-700 dark:text-green-400",
                    body: "Envíanos el archivo por el formulario de la web o por WhatsApp. Con el archivo digital podemos darte un presupuesto exacto en minutos y pasar directamente a imprimir. No necesitamos la pieza física. Aceptamos STL, OBJ, 3MF, STEP e IGES.",
                  },
                  {
                    label: "B",
                    title: "Tienes la pieza rota (o fotos detalladas)",
                    best: "El caso más habitual",
                    bestColor: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
                    body: "Manda fotos por WhatsApp desde al menos tres ángulos — frontal, lateral y posterior — junto a una regla o moneda para tener referencia de escala. Si la pieza tiene medidas críticas (diámetros de tornillo, longitudes exactas), inclúyelas en el mensaje. Con esto podemos modelarla nosotros o buscar el modelo en repositorios públicos. Si la pieza es compleja o las fotos no son suficientes, te pedimos que la traigas a Barcelona para medirla directamente.",
                  },
                  {
                    label: "C",
                    title: "Traes la pieza a Barcelona para medirla",
                    best: "Para piezas complejas sin referencias claras",
                    bestColor: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
                    body: "Si la pieza tiene geometría compleja o las fotos no son suficientes para reproducirla con precisión, puedes traerla a nuestro punto de recogida en Barcelona (con cita previa). La medimos, modelamos y te damos el presupuesto antes de confirmar. La pieza te la devolvemos siempre, la necesites para comparar o no.",
                  },
                ].map(({ label, title, best, bestColor, body }) => (
                  <div key={label} className="flex gap-4 rounded-xl border border-border bg-secondary/10 px-5 py-5">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center">
                      {label}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{title}</h3>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${bestColor}`}>{best}</span>
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-4 rounded-xl border border-border/60 bg-secondary/20">
                <p className="text-sm text-foreground/60 leading-relaxed">
                  <strong className="text-foreground/80">Limitaciones honestas:</strong> No podemos reproducir piezas metálicas, piezas con formas orgánicas muy complejas sin referencias de medidas, ni piezas que requieran tolerancias de precisión por debajo de ±0,2 mm. Para estos casos podemos orientarte hacia otras soluciones.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 4. Material */}
            <article id="material-recambios">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Material recomendado para recambios
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  La elección del material es crítica en piezas de recambio: necesitas que dure, no que sea bonita. Aquí tienes nuestra guía práctica según el tipo de uso:
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    mat: "PETG",
                    tag: "Recomendado para la mayoría de recambios",
                    tagColor: "bg-green-500/15 text-green-700 dark:text-green-400",
                    mult: "×1,1 vs PLA",
                    body: "Nuestra primera recomendación para piezas funcionales de recambio. El PETG combina buena resistencia mecánica, algo de flexibilidad para absorber impactos sin romperse, resistencia a la humedad y temperatura hasta 80°C. Es lo más parecido en prestaciones al plástico ABS/PP que usan los fabricantes de electrodomésticos, con la ventaja de que imprime de forma más fiable.",
                  },
                  {
                    mat: "ABS / ASA",
                    tag: "Exterior y calor intenso",
                    tagColor: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
                    mult: "×1,3 vs PLA",
                    body: "Para piezas que van al exterior, cerca de una fuente de calor (motor, horno, radiador) o expuestas a rayos UV. El ASA aguanta hasta 100°C y no se degrada con el sol. El ABS tiene propiedades similares y es la opción clásica para piezas técnicas de automoción e industria. Ligeramente más caro que el PETG por la configuración de impresión más exigente.",
                  },
                  {
                    mat: "TPU",
                    tag: "Juntas, sellos y piezas flexibles",
                    tagColor: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
                    mult: "×1,3 vs PLA",
                    body: "Para cualquier pieza que necesite flexibilidad: juntas, retenes, protectores contra golpes, fundas, correas o piezas que se doblan durante el uso. El TPU no se rompe bajo impacto y recupera su forma original. No es adecuado para piezas rígidas estructurales, pero para su función específica no tiene sustituto.",
                  },
                  {
                    mat: "PLA",
                    tag: "Solo decorativo o uso ligero",
                    tagColor: "bg-secondary text-foreground/60",
                    mult: "×1,0 (base)",
                    body: "El PLA es el más económico y más rápido de imprimir, pero no es la mejor opción para recambios funcionales: se vuelve frágil con el tiempo, no soporta temperaturas superiores a 60°C y puede deformarse en un coche aparcado al sol. Solo lo recomendamos para piezas puramente decorativas, accesorios interiores de muy bajo estrés o cuando el precio es el factor determinante y el cliente asume las limitaciones.",
                  },
                ].map(({ mat, tag, tagColor, mult, body }) => (
                  <div key={mat} className="rounded-xl border border-border px-5 py-4 bg-secondary/10">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-foreground">{mat}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tagColor}`}>{tag}</span>
                      <span className="text-xs text-foreground/40 ml-auto">{mult}</span>
                    </div>
                    <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 5. Precio */}
            <article id="precio-recambios">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Precio de recambios e impresión 3D
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  El precio mínimo por pedido es de <strong className="text-foreground">10€</strong>. La mayoría de recambios pequeños — clips, tapas, bisagras, pomos — caen en el rango de <strong className="text-foreground">10€ a 25€</strong>. Piezas medianas o con modelado incluido se sitúan habitualmente entre <strong className="text-foreground">25€ y 50€</strong>.
                </p>
                <p>
                  Los factores que determinan el precio son los mismos de siempre: el peso de la pieza en gramos, el tiempo de impresión, el material elegido y si necesitamos modelar la pieza desde cero. Si tienes el archivo STL listo, el precio es simplemente el de la impresión. Si necesitamos modelar la pieza, cotizamos el modelado por separado antes de confirmar — y si no te convence, no hay compromiso.
                </p>
                <p>
                  Para una guía completa de tarifas con ejemplos reales y la fórmula de cálculo, visita nuestra{" "}
                  <Link to="/blog/precio-impresion-3d-barcelona" className="text-accent hover:underline font-medium">
                    guía de precios de impresión 3D en Barcelona
                  </Link>
                  . Si lo que necesitas es un recambio urgente, consulta también nuestro{" "}
                  <Link to="/blog/impresion-3d-urgente-barcelona" className="text-accent hover:underline font-medium">
                    servicio de impresión urgente en 24-48 horas
                  </Link>
                  .
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 6. Ejemplos reales */}
            <article id="ejemplos-reales">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Ejemplos reales de recambios que hemos impreso
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed mb-6">
                <p>
                  Estos son cinco encargos reales representativos de los recambios que gestionamos en Barcelona. Los precios incluyen impresión y revisión de calidad; el modelado se cotiza aparte cuando es necesario.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Clip del cesto del lavavajillas Bosch",
                    meta: "PETG · ~12 g · modelado desde foto en 2h · impresión en 1h",
                    price: "10€",
                    story: "El clip que sujeta el cesto inferior de un lavavajillas Bosch se rompió. El recambio oficial costaba 8€ más 6€ de envío con 10 días de espera. Encontramos el modelo en Printables, lo imprimimos en PETG y el cliente lo recogió al día siguiente. El lavavajillas lleva meses funcionando perfectamente.",
                  },
                  {
                    title: "Soporte del espejo retrovisor interior",
                    meta: "ABS · ~28 g · modelo encontrado en repositorio del vehículo",
                    price: "15€",
                    story: "La pestaña de plástico que une el espejo retrovisor al parabrisas de un Volkswagen Golf se partió con el calor del verano. El concesionario pedía 45€ por el recambio más mano de obra. Imprimimos el soporte en ABS resistente al calor por 15€. El cliente lo instaló él mismo en 10 minutos.",
                  },
                  {
                    title: "Pomo de cajón IKEA Metod",
                    meta: "PLA · ~18 g · modelo disponible online",
                    price: "10€",
                    story: "Uno de los pomos de cocina IKEA se rompió en el punto de unión con el tornillo. IKEA ya no vendía ese modelo específico de manera independiente. Imprimimos el pomo en PLA en el color exacto del original. El cliente pidió cuatro unidades adicionales para reponer el juego completo.",
                  },
                  {
                    title: "Junta tórica de la puerta de la secadora",
                    meta: "TPU flexible · ~45 g · modelado desde medidas",
                    price: "18€",
                    story: "La junta de goma alrededor de la puerta de una secadora se resecó y empezó a dejar escapar calor, disparando el consumo. El recambio del fabricante estaba descatalogado. Modelamos la junta desde las medidas del hueco y la imprimimos en TPU flexible. La secadora volvió a su consumo normal.",
                  },
                  {
                    title: "Soporte de tablet para reposacabezas de coche",
                    meta: "PETG · ~85 g · modelado personalizado para el modelo de tablet",
                    price: "22€",
                    story: "Un soporte comercial de tablet para el coche se rompió en el punto de encaje con el reposacabezas. El modelo ya no se vendía. Modelamos un soporte a medida adaptado exactamente al modelo de tablet del cliente y al diámetro del reposacabezas de su coche, en PETG resistente. Más robusto que el original.",
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

            {/* 7. Pide ahora */}
            <article id="pide-ahora">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Pide tu recambio ahora
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Para la mayoría de los recambios, el camino más rápido es escribirnos directamente por WhatsApp. Si tienes el STL listo, usa la calculadora y nos mandas el archivo; si no tienes archivo digital — que es lo más habitual con piezas rotas — mándanos fotos por WhatsApp y te respondemos en menos de 1 hora con el precio y el plazo.
                </p>
                <p>
                  No necesitas saber nada de impresión 3D, ni tener ningún archivo preparado. Solo una foto de la pieza rota y una descripción de para qué sirve y en qué aparato va.
                </p>
              </div>
            </article>

          </div>
        </section>

        {/* ── DUAL CTA ── */}
        <section className="py-14 bg-accent">
          <div className="container px-4 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-accent-foreground mb-3">
              ¿Tienes una pieza rota? Te ayudamos ahora
            </h2>
            <p className="text-accent-foreground/80 mb-8 text-lg">
              Mándanos una foto por WhatsApp o usa la calculadora si ya tienes el STL. Presupuesto gratis en menos de 1 hora.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleWhatsApp}
                size="xl"
                className="bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-lg gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar foto por WhatsApp
              </Button>
              <Button asChild size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg gap-2">
                <Link to="/#calculator">
                  Tengo el STL — calcular precio
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 md:py-20 bg-secondary/30">
          <div className="container px-4 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Preguntas frecuentes sobre recambios en 3D
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

      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default BlogRecambiosBcn;
