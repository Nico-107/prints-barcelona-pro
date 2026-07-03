import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, MessageCircle, Settings2 } from "lucide-react";
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

const META_TITLE = "Prototipos Rápidos y Piezas Funcionales en 3D — Barcelona | Dimension3D";
const META_DESC = "Impresión 3D de prototipos funcionales y piezas técnicas para ingenieros y empresas en Barcelona. Materiales de ingeniería, tolerancias ajustadas, entrega 24-48h. Presupuesto en 1 hora.";
const CANONICAL = `${SITE_URL}/blog/prototipos-rapidos-piezas-funcionales-barcelona`;

const FAQS = [
  {
    q: "¿Qué materiales usáis para piezas funcionales y prototipos técnicos?",
    a: "Dependemos de los requisitos mecánicos y ambientales de la pieza. Para prototipos funcionales de uso general recomendamos PETG: buena rigidez, resistencia al impacto y temperatura hasta 80°C. Para entornos con calor, UV o requisitos de impacto elevados usamos ABS o ASA. Para piezas que necesitan alta resistencia mecánica y al desgaste, Nylon (PA6 o PA12). Para casos de alto rendimiento — componentes que soportan carga, piezas cerca de fuentes de calor — usamos PC (policarbonato). Para máxima rigidez por peso, disponemos de filamentos de fibra de carbono (PLA-CF, PETG-CF, Nylon-CF). Antes de confirmar cualquier pedido, discutimos el material más adecuado para tu aplicación.",
  },
  {
    q: "¿Qué tolerancias puedo esperar en impresión FDM? ¿Es suficiente para piezas funcionales?",
    a: "La precisión típica de nuestras impresoras FDM calibradas es de ±0,2 mm en dimensiones generales. En ejes y agujeros de alta precisión, con los ajustes correctos de holgura en el diseño, podemos conseguir ajustes deslizantes o de presión fiables. Los factores que más afectan a la precisión son: la temperatura ambiente durante la impresión, la contracción térmica del material (más pronunciada en ABS y Nylon), la orientación de impresión y el tamaño de la pieza. Para dimensiones críticas como diámetros de eje, agujeros de tornillo o superficies de ajuste, recomendamos especificarlas en el archivo y confirmarlas en una primera pieza de prueba antes de una tirada mayor.",
  },
  {
    q: "¿Podéis firmar un NDA para proyectos confidenciales?",
    a: "Sí. Para proyectos sensibles — prototipos de producto pre-lanzamiento, componentes de maquinaria propietaria, diseños bajo patente — firmamos acuerdos de confidencialidad (NDA) sin coste adicional. Los archivos de los clientes nunca se comparten ni se utilizan para ningún otro fin. Trabajamos directamente con el equipo técnico o el responsable de I+D, sin intermediarios. Si tu proyecto requiere NDA, indícalo al contactar y te enviamos un borrador estándar o revisamos el tuyo.",
  },
  {
    q: "¿Hay pedido mínimo para prototipos? ¿Y para tiradas cortas?",
    a: "No hay pedido mínimo en número de unidades — imprimimos desde una sola pieza. El precio mínimo por pedido es de 10€. Para tiradas cortas, aplicamos descuentos por cantidad: 5% de descuento a partir de 10 unidades, 10% a partir de 25 y 15% a partir de 50. Esto lo hace especialmente interesante para series de pre-producción antes de comprometerse con una inversión en moldes o fabricación en masa. Para pedidos de más de 50 unidades, contacta con nosotros para un presupuesto personalizado.",
  },
  {
    q: "¿Qué formatos de archivo aceptáis para prototipos y piezas técnicas?",
    a: "Aceptamos STL, STEP (el más recomendado para piezas técnicas porque mantiene información paramétrica), OBJ, 3MF e IGES. Para piezas con tolerancias críticas o ensambles, STEP es preferible a STL porque conserva las medidas exactas sin la triangulación característica del formato STL. Si trabajas con SolidWorks, Fusion 360, FreeCAD, Onshape o cualquier otro CAD, simplemente exporta a STEP o STL antes de enviarnos el archivo. Si tienes dudas sobre qué formato exportar, dinos qué software usas y te guiamos.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Prototipos Rápidos y Piezas Funcionales en 3D — Barcelona",
  description: META_DESC,
  author: { "@type": "Organization", name: "Dimension3D Barcelona" },
  publisher: { "@type": "Organization", name: "Dimension3D Barcelona", url: SITE_URL },
  datePublished: "2026-06-30",
  dateModified: "2026-06-30",
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

const BlogPrototiposBcn = () => {
  const endRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        capture('blog_read_75pct', { post: 'prototipos' });
        observer.disconnect();
      }
    }, { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleWhatsApp = () => {
    capture('whatsapp_click', { source: 'blog_prototipos' });
    const msg = "Hola, necesito prototipos o piezas funcionales en 3D para un proyecto de ingeniería. ¿Podéis ayudarme?";
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
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/blog` },
            { "@type": "ListItem", position: 3, name: "Prototipos y piezas funcionales", item: CANONICAL },
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
              <span className="text-primary-foreground/70">Prototipos y piezas funcionales</span>
            </nav>
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors mb-5">
              ← Todas las guías
            </Link>
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-5">
              <Settings2 className="w-3.5 h-3.5" />
              Ingeniería y prototipado
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              Prototipos Rápidos y Piezas Funcionales en 3D — Barcelona
            </h1>
            <p className="text-lg text-primary-foreground/75 leading-relaxed">
              De la idea al prototipo físico en 24-48 horas. Materiales de ingeniería, tolerancias ajustadas y descuentos para tiradas cortas. Para equipos de I+D, startups de hardware, ingenieros y fabricantes en Barcelona y toda España.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "PETG · ABS · Nylon · PC · Fibra de carbono",
                "Tolerancia ±0,2 mm",
                "Entrega 24-48h",
                "Desde 1 unidad",
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

            {/* 1. Ingeniería y prototipado */}
            <article id="ingenieria-prototipado">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Impresión 3D para ingeniería y prototipado
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  En el proceso de desarrollo de un producto, cada semana que se tarda en validar un diseño es una semana que retrasa el lanzamiento. La fabricación tradicional — mecanizado CNC, moldeo por inyección, fundición — tiene plazos de semanas o meses y costes de utillaje que solo se justifican en producciones de miles de unidades. La impresión FDM cambia completamente esta ecuación para la fase de prototipado.
                </p>
                <p>
                  Con impresión 3D FDM, un equipo de ingeniería puede tener el primer prototipo físico en 24-48 horas desde el archivo CAD, probarlo, detectar fallos de diseño, corregirlos en el ordenador y tener la segunda versión en manos otro día después. Este ciclo de iteración rápida — que con fabricación convencional llevaría semanas y miles de euros — se puede repetir tantas veces como sea necesario por el coste del material y unas horas de máquina.
                </p>
                <p>
                  Nuestro servicio está pensado específicamente para los perfiles que necesitan esto: equipos de I+D en empresas industriales que necesitan verificar ensambles y tolerancias antes de fabricar en serie, startups de hardware que iteran el diseño de su producto antes de comprometerse con moldes de inyección, ingenieros y técnicos que necesitan utillaje de taller personalizado, y pequeños fabricantes que quieren validar un rediseño sin parar la producción. Para todos estos casos, la impresión FDM ofrece una relación coste-velocidad que ningún otro proceso puede igualar en volúmenes de 1 a 50 unidades.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 2. Materiales técnicos */}
            <article id="materiales-tecnicos">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Materiales técnicos disponibles
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed mb-6">
                <p>
                  No todos los filamentos son iguales. Para aplicaciones funcionales, la elección del material determina si la pieza aguantará meses en producción o fallará a la primera semana. Estos son los materiales que usamos para piezas técnicas, con sus casos de uso y limitaciones honestas:
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    mat: "PETG",
                    tag: "Funcional de uso general",
                    tagColor: "bg-green-500/15 text-green-700 dark:text-green-400",
                    mult: "×1,1 vs PLA",
                    body: "Primera recomendación para prototipos funcionales que no requieren resistencia extrema al calor. El PETG tiene buena rigidez, absorbe impactos sin romperse, resiste la humedad y aguanta temperaturas de hasta 80°C sin deformarse. Es compatible con entornos alimentarios (con la variante certificada). Ideal para carcasas, soportes, conectores, piezas de ensamble y cualquier componente que necesite durabilidad sin condiciones extremas.",
                  },
                  {
                    mat: "ABS / ASA",
                    tag: "Calor, UV e impacto",
                    tagColor: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
                    mult: "×1,3 vs PLA",
                    body: "Cuando la pieza va a estar expuesta al calor (más de 80°C), al sol directo o a impactos frecuentes, ABS y ASA son las opciones estándar de la industria. El ASA es superior al ABS en resistencia UV — ideal para piezas de exterior o automoción. Ambos tienen una temperatura de deflexión bajo carga (HDT) de alrededor de 90-100°C y se mecanizan y postprocesan bien. La contracción durante el enfriamiento exige un control cuidadoso del entorno de impresión; por eso no todos los servicios los ofrecen con garantías de calidad. Nosotros sí.",
                  },
                  {
                    mat: "Nylon (PA6 / PA12)",
                    tag: "Alta resistencia y desgaste",
                    tagColor: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
                    mult: "×1,4 vs PLA",
                    body: "El Nylon es el material de ingeniería por excelencia cuando se necesita resistencia al desgaste, a la fatiga cíclica y a la abrasión. Es la opción correcta para engranajes, poleas, guías lineales, piezas con movimiento relativo o cualquier componente que deba sobrevivir a muchos ciclos de carga. PA12 es ligeramente más estable dimensionalmente que PA6 y absorbe menos humedad del ambiente, lo que lo hace preferible para piezas de precisión. Requiere almacenamiento sellado antes de la impresión para evitar que la humedad degrade el material.",
                  },
                  {
                    mat: "PC (Policarbonato)",
                    tag: "Alto rendimiento mecánico y térmico",
                    tagColor: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
                    mult: "×1,5 vs PLA",
                    body: "El policarbonato es uno de los termoplásticos de mayor rendimiento disponibles en FDM. Con una temperatura de deflexión bajo carga de más de 110°C, resistencia al impacto muy alta y excelente rigidez, es la opción para componentes que van a soportar condiciones severas: carcasas de equipos eléctricos, piezas cercanas a fuentes de calor, componentes de maquinaria que requieren tenacidad ante golpes. Es más exigente de imprimir que PETG o ABS — requiere temperatura de cama alta y un entorno controlado — pero los resultados justifican la complejidad.",
                  },
                  {
                    mat: "Composites (PLA-CF / PETG-CF / Nylon-CF)",
                    tag: "Máxima rigidez por peso",
                    tagColor: "bg-gray-500/15 text-gray-700 dark:text-gray-400",
                    mult: "×1,6 vs PLA",
                    body: "Los filamentos reforzados con fibra de carbono chopped ofrecen una rigidez notablemente superior al material base con un peso similar. Una pieza en Nylon-CF puede ser casi el doble de rígida que en Nylon puro, lo que los convierte en la opción para brazos de robot, soportes estructurales ligeros, utillaje aeronáutico o cualquier aplicación donde el ratio rigidez/peso es crítico. Importante: la fibra de carbono chopped mejora la rigidez pero no la resistencia al impacto — las piezas son más rígidas pero también más frágiles ante cargas de choque.",
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

              <p className="mt-5 text-sm text-foreground/60 leading-relaxed">
                Para aplicaciones fuera de estos materiales — TPU flexible, materiales conductores, filamentos de madera o metal — consulta con nosotros. Y si necesitas orientación para elegir el material correcto para tu caso específico, escríbenos con los requisitos de la pieza (temperatura máxima, cargas, entorno) y te hacemos una recomendación concreta.
              </p>
            </article>

            <div className="border-b border-border/40" />

            {/* 3. Tolerancias */}
            <article id="tolerancias-precision">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Tolerancias y precisión en FDM
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  La impresión FDM es una tecnología de fabricación aditiva de extrusión de material fundido. Con las impresoras calibradas correctamente, la precisión dimensional típica es de <strong className="text-foreground">±0,2 mm</strong> en las tres dimensiones para geometrías estándar. En piezas pequeñas bien orientadas, es posible llegar a ±0,1 mm en ejes críticos con ajuste manual de los parámetros de impresión.
                </p>
                <p>
                  Varios factores afectan a la precisión real de la pieza final. La contracción térmica es el más importante: materiales como el ABS y el Nylon se contraen significativamente al enfriarse, lo que puede introducir desviaciones dimensionales si no se compensa en el diseño o en los parámetros de impresión. La orientación de la pieza en la cama también influye: la precisión en los planos XY (horizontal) es generalmente mejor que en Z (vertical), donde el espesor de capa — típicamente 0,2 mm — define la resolución mínima.
                </p>
                <p>
                  Para piezas con dimensiones críticas — diámetros de eje que deben encajar con rodamientos, agujeros de tornillo con clase de tolerancia, superficies de ajuste de presión — recomendamos dos prácticas: primero, especificar esas dimensiones explícitamente en el archivo STEP con las tolerancias deseadas; segundo, validar con una pieza de prueba antes de una tirada. Los ajustes de holgura habituales en diseño para FDM son de 0,2-0,3 mm de juego en ejes deslizantes y 0,1-0,15 mm en ajustes de presión ligera, aunque dependen del material y la geometría específica.
                </p>
                <p>
                  Dicho esto, la impresión FDM no es CNC. Para tolerancias por debajo de ±0,1 mm, superficies funcionales de alta precisión o acabados superficiales críticos, la pieza impresa puede servir como prototipo pero la producción final requerirá mecanizado. En esos casos te lo indicamos honestamente antes de aceptar el encargo, y podemos orientarte hacia las opciones de postprocesado disponibles.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 4. Iteración rápida */}
            <article id="iteracion-rapida">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Iteración rápida: de la idea a la pieza física
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed mb-6">
                <p>
                  La velocidad de iteración es la principal ventaja de la impresión 3D frente a procesos de fabricación tradicionales. Aquí está el flujo de trabajo típico para un prototipo técnico:
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Envíanos el archivo CAD",
                    time: "Día 0",
                    body: "Mándanos el archivo por WhatsApp o el formulario web. Aceptamos STL, STEP, OBJ, 3MF e IGES. Si tienes un ensamble con varias piezas, envíalos todos juntos con una nota sobre el material y la función de cada uno. Si tienes dudas sobre el formato, exporta en STEP — es el más informativo para piezas técnicas.",
                  },
                  {
                    step: "2",
                    title: "Presupuesto en menos de 1 hora",
                    time: "Día 0 (mismo día)",
                    body: "Revisamos el archivo, detectamos posibles problemas de impresión (paredes demasiado finas, voladizos excesivos, geometrías que afectan a las tolerancias) y te enviamos el presupuesto con el desglose de material, tiempo y precio. Si hay decisiones de diseño que afecten a la funcionalidad, te lo indicamos antes de imprimir — no al finalizar.",
                  },
                  {
                    step: "3",
                    title: "Impresión en 24-48 horas",
                    time: "Día 1-2",
                    body: "Una vez confirmado el pedido, la pieza entra en cola de impresión. Para pedidos estándar el plazo es de 24 a 48 horas. Para urgencias reales — presentaciones, plazos de proyecto, feria inminente — ofrecemos servicio express con entrega en el mismo día o al día siguiente para piezas de tamaño normal.",
                  },
                  {
                    step: "4",
                    title: "Recogida o envío a toda España",
                    time: "Día 2-3",
                    body: "Puedes recoger en Barcelona (Gracia) con cita previa, o enviamos por mensajería con seguimiento a toda España peninsular. El envío llega normalmente en 24 horas adicionales. Para clientes recurrentes o proyectos con múltiples iteraciones, coordinamos los envíos para minimizar interrupciones en tu flujo de trabajo.",
                  },
                  {
                    step: "5",
                    title: "Revisión e iteración si es necesario",
                    time: "Día 3+",
                    body: "La clave del prototipado rápido es que el ciclo completo —desde el fallo detectado en la pieza hasta la corrección impresa en mano— puede completarse en 48-72 horas. Mientras un competidor espera semanas el presupuesto de mecanizado, tú ya llevas tres versiones del diseño validadas. Para proyectos con múltiples iteraciones, ajustamos el precio según el volumen acumulado.",
                  },
                ].map(({ step, title, time, body }) => (
                  <div key={step} className="flex gap-4 rounded-xl border border-border bg-secondary/10 px-5 py-5">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center">
                      {step}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{title}</h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/15 text-accent">{time}</span>
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 rounded-xl border border-accent/25 bg-accent/5">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  <strong className="text-foreground">Comparativa de velocidad:</strong> Un mecanizado CNC de una pieza de aluminio de complejidad media tiene un plazo típico de 2-4 semanas (presupuesto + programación + mecanizado + acabado). La misma geometría en PETG o Nylon puede estar en tus manos en 48 horas. Para la mayoría de las iteraciones de prototipo — donde lo que validas es la forma, el encaje y la función, no las propiedades del material definitivo — la diferencia de 2-3 semanas por ciclo cambia completamente el ritmo de desarrollo.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 5. Tiradas cortas */}
            <article id="tiradas-cortas">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Tiradas cortas y pre-producción
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  La impresión 3D no es solo para prototipos de una pieza. Para volúmenes de 1 a 50-100 unidades, puede ser también la opción de producción definitiva, especialmente cuando el diseño todavía puede evolucionar, cuando los volúmenes no justifican la inversión en utillaje de inyección, o cuando necesitas las piezas antes de tener confirmado el pedido de producción en masa.
                </p>
                <p>
                  Para tiradas cortas aplicamos descuentos por volumen que hacen el coste por unidad progresivamente más competitivo: <strong className="text-foreground">5% de descuento a partir de 10 unidades</strong>, <strong className="text-foreground">10% a partir de 25 unidades</strong> y <strong className="text-foreground">15% a partir de 50 unidades</strong>. A partir de 100 unidades, el precio por unidad suele ser lo suficientemente bajo para que valga la pena discutir el proyecto en detalle — contáctanos para un presupuesto personalizado.
                </p>
                <p>
                  Una tirada corta en FDM antes de comprometerse con moldes de inyección tiene además un valor estratégico: validas que el diseño final funciona en producción, identificas posibles problemas de ensamble o de uso real, y puedes tener un primer lote de producto para clientes beta o para exposición comercial mientras preparas la fabricación en serie. El coste de un molde de inyección simple empieza en varios miles de euros — una tirada de 50 unidades en FDM puede costar entre 200€ y 800€ dependiendo del tamaño y el material, y te da información real sobre el producto antes de ese compromiso.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 6. Casos de uso reales */}
            <article id="casos-uso">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Casos de uso reales
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed mb-6">
                <p>
                  Estos son cinco escenarios representativos de los proyectos de prototipado e ingeniería que gestionamos:
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Carcasa para prototipo de hardware de startup",
                    meta: "PETG · 2 iteraciones · entrega en 72h total",
                    body: "Una startup de IoT necesitaba validar el diseño de la carcasa de su dispositivo antes de pedir el molde de inyección. La primera versión reveló que el Puerto USB quedaba 0,3 mm demasiado alto respecto al panel. Corrigieron el CAD y tuvieron la segunda versión impresa en 36 horas. El molde se encargó con el diseño de la segunda iteración, ahorrando un retrabajo de molde que habría costado 1.200€.",
                  },
                  {
                    title: "Utillaje de montaje para taller de electrónica",
                    meta: "PETG-CF · serie de 8 unidades · entrega en 48h",
                    body: "Un taller de ensamble de PCBs necesitaba un utillaje de posicionamiento para soldar un conector en la posición exacta en placas de circuito. El utillaje tenía que ser rígido, resistente al calor del soldador y dimensionalmente estable para garantizar la posición del conector. Imprimimos 8 unidades en PETG reforzado con fibra de carbono. El utillaje lleva más de tres meses en uso diario sin deterioro apreciable.",
                  },
                  {
                    title: "Pieza funcional de sustitución en maquinaria industrial",
                    meta: "Nylon PA12 · sin stock disponible · entrega en 48h",
                    body: "Una empresa de maquinaria textil tenía una máquina parada porque una guía de plástico de un sistema de alimentación estaba descatalogada por el fabricante. El plazo de suministro del recambio original era de 6 semanas. Con las medidas de la pieza rota y un par de fotos de referencia, modelamos la guía en Nylon PA12 —el material más parecido en propiedades al original— y la entregamos en 48 horas. La máquina volvió a producción al tercer día.",
                  },
                  {
                    title: "Pieza de prueba para TFG de ingeniería mecánica",
                    meta: "PLA y PETG · 4 variantes · presupuesto cerrado",
                    body: "Un estudiante de ingeniería necesitaba cuatro variantes geométricas de una pieza para su trabajo de fin de grado sobre análisis de fatiga en uniones impresas. Necesitaba exactitud dimensional para que los resultados de ensayo fueran comparables entre variantes. Imprimimos las cuatro con parámetros de impresión documentados (temperatura, velocidad, relleno) para que pudiera incluirlos en la metodología del trabajo. Entrega en 24 horas dentro del plazo de presentación.",
                  },
                  {
                    title: "Serie de soportes de producción para pequeño fabricante",
                    meta: "ABS · 30 unidades · entrega escalonada en 5 días",
                    body: "Un pequeño fabricante de equipos de iluminación escénica necesitaba 30 soportes de montaje para una serie de pedidos. El volumen no justificaba un molde, y el plazo era de una semana. Produjimos los 30 soportes en ABS en 5 días, entregados en dos lotes para que pudieran empezar el ensamble sin esperar el pedido completo. Con el descuento por volumen de 25+ unidades, el coste fue significativamente inferior a la alternativa de mecanizado.",
                  },
                ].map(({ title, meta, body }) => (
                  <div key={title} className="rounded-xl border border-border bg-secondary/10 px-5 py-5">
                    <h3 className="font-semibold text-foreground leading-tight mb-1">{title}</h3>
                    <p className="text-xs text-foreground/50 mb-3">{meta}</p>
                    <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 7. Trabajamos con tu equipo */}
            <article id="equipo">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Trabajamos con tu equipo
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Para proyectos técnicos, la comunicación directa entre el técnico que encarga y el que fabrica hace una diferencia enorme. Trabajamos directamente con el responsable de diseño o ingeniería — sin comerciales intermediarios que no conocen el contexto técnico. Si hay una decisión de orientación que afecta a la resistencia de la pieza, o un voladizo que podría eliminarse con un pequeño cambio de diseño, te lo decimos antes de imprimir.
                </p>
                <p>
                  Para proyectos sensibles firmamos acuerdos de confidencialidad (NDA) sin coste adicional. Tus archivos CAD no se comparten, no se reutilizan y se eliminan tras el proyecto si así lo solicitas. Entendemos que el prototipo de un producto es el activo más valioso de una startup o equipo de I+D, y lo tratamos como tal.
                </p>
                <p>
                  Aceptamos todos los formatos estándar de CAD y fabricación: <strong className="text-foreground">STL, STEP, OBJ, 3MF e IGES</strong>. Para ensambles con varias piezas, STEP es el formato preferido porque mantiene la información paramétrica y permite verificar cotas críticas antes de imprimir. Si trabajas con SolidWorks, Fusion 360, FreeCAD, Onshape, Inventor o cualquier otro CAD, exporta a STEP y mándanoslo — te confirmamos que todo está correcto antes de lanzar la impresión.
                </p>
                <p>
                  Si tu empresa necesita un suministro recurrente de prototipos o piezas de producción, visita también nuestra{" "}
                  <Link to="/3d-printing-for-business-barcelona" className="text-accent hover:underline font-medium">
                    página de impresión 3D para empresas
                  </Link>{" "}
                  donde detallamos las condiciones para cuentas de empresa con factura, tiempos de respuesta garantizados y gestión de proyectos continuos.
                </p>
              </div>
            </article>

          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-14 bg-accent">
          <div className="container px-4 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-accent-foreground mb-3">
              ¿Tienes un prototipo o pieza técnica que imprimir?
            </h2>
            <p className="text-accent-foreground/80 mb-8 text-lg">
              Envíanos el archivo CAD o cuéntanos el proyecto. Presupuesto en menos de 1 hora, pieza en 24-48 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg gap-2">
                <Link to="/#calculator">
                  Calcular precio con mi archivo
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                onClick={handleWhatsApp}
                size="xl"
                className="bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-lg gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Consultar por WhatsApp
              </Button>
            </div>
          </div>
        </section>

        {/* ── INTERNAL LINKS ── */}
        <section className="py-12 bg-background">
          <div className="container px-4 max-w-3xl mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-5">Otras guías relacionadas</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { to: "/blog/precio-impresion-3d-barcelona", label: "Guía de precios 2026", desc: "Tabla de tarifas por tamaño y material con ejemplos reales." },
                { to: "/blog/impresion-3d-urgente-barcelona", label: "Impresión urgente 24-48h", desc: "Cómo funciona el servicio express y qué materiales están disponibles." },
                { to: "/blog/recambios-piezas-rotas-impresion-3d-barcelona", label: "Recambios y piezas rotas", desc: "De la foto o pieza rota a un recambio impreso en 3D." },
              ].map(({ to, label, desc }) => (
                <Link
                  key={to}
                  to={to}
                  className="group rounded-xl border border-border bg-secondary/10 px-4 py-4 hover:border-accent/40 transition-colors"
                >
                  <p className="font-semibold text-foreground text-sm mb-1 group-hover:text-accent transition-colors">{label}</p>
                  <p className="text-xs text-foreground/55 leading-relaxed">{desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section ref={endRef} className="py-16 md:py-20 bg-secondary/30">
          <div className="container px-4 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Preguntas frecuentes sobre prototipos y piezas funcionales
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

export default BlogPrototiposBcn;
