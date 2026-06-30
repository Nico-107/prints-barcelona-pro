import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, GraduationCap, MessageCircle } from "lucide-react";
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

const META_TITLE = "Impresión 3D para Estudiantes en Barcelona — 20% Descuento | Dimension3D";
const META_DESC = "Impresión 3D con 20% de descuento para estudiantes en Barcelona. Maquetas, TFG, prototipos de ingeniería. UPC, ESEIAAT, IQS, La Salle y más. Presupuesto en 1 hora.";
const CANONICAL = `${SITE_URL}/impresion-3d-estudiantes-barcelona`;

const FAQS = [
  {
    q: "¿Cómo verifico que soy estudiante para obtener el descuento?",
    a: "El proceso es sencillo y sin burocracia. Al confirmar tu presupuesto (por email o WhatsApp), menciona que eres estudiante e indica tu universidad. Puedes verificarlo con tu carnet universitario vigente o enviándonos un email desde tu dirección .edu o @estudiant.upc.edu (o similar). No necesitas acreditar tu matrícula ni aportar documentación adicional — trabajamos sobre la confianza.",
  },
  {
    q: "¿Qué universidades y centros aceptan el descuento?",
    a: "El descuento aplica a cualquier estudiante matriculado en un centro de educación superior reconocido, sin limitación de universidad. UPC, ESEIAAT, IQS, La Salle Campus Barcelona, ELISAVA, EINA, UB, UAB, ESADE, Escola Massana — cualquier universidad, escuela de diseño o centro politécnico. Si estudias fuera de Barcelona pero necesitas impresión para un proyecto, también aplica.",
  },
  {
    q: "¿El descuento del 20% aplica a todo el pedido?",
    a: "Sí, el 20% se aplica sobre el precio final de la impresión (incluyendo cualquier descuento por cantidad si aplica). El único límite es el precio mínimo de 10€ por pedido — si tu pieza ya sale a 10€ (el mínimo del servicio), ese precio no se reduce más. Para pedidos de múltiples piezas o tiradas más grandes, el 20% siempre va sobre el total calculado.",
  },
  {
    q: "¿Hay un pedido mínimo para el descuento de estudiante?",
    a: "No hay mínimo especial para el descuento de estudiante más allá del mínimo general del servicio (10€). Puedes pedir desde una sola pieza pequeña. Para proyectos grandes (TFM, maquetas de arquitectura a escala, tiradas de piezas para prototipado), el descuento del 20% sigue aplicando sobre el total, lo que representa un ahorro significativo.",
  },
  {
    q: "¿Cuánto tarda la entrega para un TFG o proyecto con fecha límite?",
    a: "Para pedidos estándar el plazo es de 2 a 5 días laborables desde la confirmación. Si tienes una fecha límite ajustada — presentación del TFG, entrega del proyecto de taller, defensa del TFM — tenemos servicio express con entrega en 24-48 horas al mismo precio base más el descuento de estudiante. Comunícanos tu fecha al pedir presupuesto y lo priorizamos.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Impresión 3D para Estudiantes en Barcelona — 20% de Descuento",
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

const StudentsBcn = () => {
  const handleWhatsApp = () => {
    capture("whatsapp_click", { source: "students_page" });
    const msg = "Hola, soy estudiante y me gustaría un presupuesto con descuento para mi proyecto.";
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
              <span className="text-primary-foreground/70">Estudiantes</span>
            </nav>

            {/* Discount badge */}
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full px-5 py-2 text-sm font-bold uppercase tracking-widest mb-6">
              <GraduationCap className="w-4 h-4" />
              20% de descuento para estudiantes
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              Impresión 3D para Estudiantes en Barcelona — 20% de Descuento
            </h1>
            <p className="text-lg text-primary-foreground/75 leading-relaxed">
              ¿Estudiante de ingeniería, arquitectura o diseño? Imprime tu TFG, TFM, maqueta o prototipo con un 20% de descuento real. Solo necesitas tu carnet universitario o email .edu. Presupuesto gratis en menos de 1 hora.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "20% descuento verificado",
                "TFG, TFM y maquetas",
                "Entrega 24-48h disponible",
                "UPC, ESEIAAT, IQS, La Salle y más",
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

            {/* 1. Quién puede pedir el descuento */}
            <article id="quien-puede">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                ¿Quién puede pedir el descuento?
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  Cualquier estudiante matriculado en un centro de educación superior puede acceder al descuento del 20%: universidades públicas, privadas, escuelas de diseño, escuelas de arquitectura, escuelas politécnicas y centros de formación superior reconocidos. No importa si estudias en Barcelona o en otra ciudad — mientras tu proyecto lo necesites, aplica.
                </p>
                <p>
                  El descuento está pensado para proyectos académicos reales: TFGs, TFMs, maquetas de presentación, prototipos de ingeniería, proyectos de taller y encargos de asignatura. Si necesitas imprimir para uso personal y eres estudiante, también puedes solicitarlo — no filtramos el tipo de proyecto, solo verificamos que eres estudiante activo.
                </p>
                <p>
                  La verificación es sencilla: mencionas tu universidad al confirmar el presupuesto y adjuntas tu carnet universitario o nos escribes desde tu dirección de email institucional (.edu, @estudiant.upc.edu, @alumnes.ub.edu, o similar). Sin burocracia extra, sin plazos de espera para validarlo.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 2. Cómo funciona el descuento */}
            <article id="como-funciona">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Cómo funciona el descuento
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed mb-6">
                <p>
                  El proceso tiene tres pasos muy simples. La calculadora online te da una estimación inmediata al precio normal — el descuento se aplica manualmente al confirmar el presupuesto, una vez verificamos que eres estudiante.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Calcula el precio con tu archivo",
                    color: "bg-accent text-accent-foreground",
                    body: "Sube tu archivo STL en la calculadora de la web (o descríbenos tu proyecto por WhatsApp si no tienes el archivo listo). Obtendrás una estimación inmediata al precio estándar.",
                  },
                  {
                    step: "2",
                    title: "Menciona que eres estudiante al confirmar",
                    color: "bg-accent text-accent-foreground",
                    body: "Al confirmar el presupuesto por email o WhatsApp, indica tu universidad. Puedes verificarlo con tu carnet universitario o enviándonos un mensaje desde tu correo institucional (.edu o equivalente).",
                  },
                  {
                    step: "3",
                    title: "Recibe el presupuesto con el 20% aplicado",
                    color: "bg-accent text-accent-foreground",
                    body: "Aplicamos el 20% de descuento sobre el precio final y te enviamos el presupuesto definitivo. En menos de 1 hora desde tu consulta. Sin letra pequeña — el descuento aplica sobre el total de la impresión.",
                  },
                ].map(({ step, title, color, body }) => (
                  <div key={step} className="flex gap-4 rounded-xl border border-border bg-secondary/10 px-5 py-5">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center ${color}`}>
                      {step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 3. Universidades */}
            <article id="universidades">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Universidades y escuelas con las que trabajamos
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed mb-6">
                <p>
                  Trabajamos habitualmente con estudiantes de los principales centros de Barcelona en los que la impresión 3D forma parte de los proyectos académicos: ingeniería industrial, arquitectura, diseño de producto, diseño gráfico, mecatrónica y robótica.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    name: "UPC — Universitat Politècnica de Catalunya",
                    color: "bg-blue-500/8 border-blue-500/20",
                    degrees: ["Ingeniería Industrial", "Ingeniería Mecánica", "Ingeniería Electrónica", "Arquitectura Técnica"],
                    note: "La politécnica más grande de Barcelona. Alta demanda de prototipos para proyectos de ingeniería y TFGs técnicos.",
                  },
                  {
                    name: "ESEIAAT — Escola Superior d'Enginyeries Industrial, Aeroespacial i Audiovisual de Terrassa",
                    color: "bg-indigo-500/8 border-indigo-500/20",
                    degrees: ["Ingeniería Aeroespacial", "Ingeniería Industrial", "Diseño Industrial"],
                    note: "Campus UPC en Terrassa. Proyectos de mecánica de precisión, aeronáutica y diseño de producto.",
                  },
                  {
                    name: "IQS — Institut Químic de Sarrià",
                    color: "bg-green-500/8 border-green-500/20",
                    degrees: ["Ingeniería en Tecnologías Industriales", "Biotecnología", "Farmacia"],
                    note: "Escuela de ingeniería y ciencias con fuerte componente práctico. Prototipos para proyectos de laboratorio y TFGs técnicos.",
                  },
                  {
                    name: "La Salle Campus Barcelona",
                    color: "bg-red-500/8 border-red-500/20",
                    degrees: ["Ingeniería de Telecomunicaciones", "Ingeniería Multimedia", "Robótica e Inteligencia Artificial"],
                    note: "Proyectos de robótica, electrónica y prototipos de hardware. Alta demanda de carcasas, soportes y piezas de montaje.",
                  },
                  {
                    name: "ELISAVA — Escola Superior de Disseny i Enginyeria de Barcelona",
                    color: "bg-purple-500/8 border-purple-500/20",
                    degrees: ["Diseño de Producto e Ingeniería", "Diseño Gráfico", "Diseño de Moda"],
                    note: "Escuela de diseño con proyectos muy orientados a prototipos físicos. Maquetas de concepto, modelos de presentación y piezas funcionales.",
                  },
                  {
                    name: "EINA — Centre Universitari de Disseny i Art de Barcelona",
                    color: "bg-yellow-500/8 border-yellow-500/20",
                    degrees: ["Diseño de Producto", "Diseño Gráfico", "Diseño de Interiores"],
                    note: "Centro UAB de diseño. Proyectos de maquetismo, prototipado conceptual y modelos de presentación para TFGs de diseño.",
                  },
                  {
                    name: "UB — Universitat de Barcelona",
                    color: "bg-orange-500/8 border-orange-500/20",
                    degrees: ["Ingeniería Electrónica", "Física", "Química", "Ciencias Ambientales"],
                    note: "Para proyectos de laboratorio, instrumentación y prototipos de investigación de grado y posgrado.",
                  },
                  {
                    name: "UAB — Universitat Autònoma de Barcelona",
                    color: "bg-teal-500/8 border-teal-500/20",
                    degrees: ["Ingeniería Biomédica", "Veterinaria", "Ciencias Ambientales", "Telecomunicaciones"],
                    note: "Proyectos de biomedicina y ciencias aplicadas. Maquetas anatómicas, modelos educativos y piezas para investigación.",
                  },
                ].map(({ name, color, degrees, note }) => (
                  <div key={name} className={`rounded-xl border px-5 py-4 ${color}`}>
                    <h3 className="font-semibold text-foreground mb-2 leading-snug">{name}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {degrees.map((d) => (
                        <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-background/60 text-foreground/60">{d}</span>
                      ))}
                    </div>
                    <p className="text-xs text-foreground/60 leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-4 rounded-xl border border-border/60 bg-secondary/20">
                <p className="text-sm text-foreground/60 leading-relaxed">
                  <strong className="text-foreground/80">¿Tu universidad no está en la lista?</strong> El descuento aplica a cualquier centro de educación superior reconocido, no solo a los que aparecen aquí. Si estudias en otro centro, escríbenos y te lo confirmamos en minutos.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 4. Para qué proyectos */}
            <article id="proyectos">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Para qué proyectos es ideal la impresión 3D
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed mb-6">
                <p>
                  La impresión 3D encaja perfectamente en los tipos de proyectos académicos en los que el resultado físico importa: necesitas mostrar algo tangible en la presentación, verificar que las medidas son correctas o fabricar una pieza funcional que forma parte del diseño final.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: "TFG y TFM — Prototipos de presentación",
                    tag: "Ingeniería, Diseño, Arquitectura",
                    tagColor: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
                    body: "Para la defensa del trabajo de fin de grado o máster, un prototipo físico impacta mucho más que una imagen en pantalla. Imprimimos el prototipo o maqueta del proyecto para que lo presentes delante del tribunal — sea una pieza mecánica, un componente de producto, un modelo arquitectónico a escala o un dispositivo electrónico con carcasa impresa.",
                  },
                  {
                    title: "Maquetas de arquitectura a escala",
                    tag: "Escuelas de Arquitectura y Diseño",
                    tagColor: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
                    body: "Las maquetas impresas en 3D permiten representar volúmenes complejos a escala con una precisión que el cartón o el foam no pueden alcanzar. Imprimimos maquetas a escala 1:100, 1:50 o la que necesites, con paredes, forjados, cubiertas y detalles definidos. Ideal para presentaciones de taller o la maqueta final del proyecto de carrera.",
                  },
                  {
                    title: "Prototipos de diseño de producto",
                    tag: "ELISAVA, EINA, IQS, UPC",
                    tagColor: "bg-green-500/15 text-green-700 dark:text-green-400",
                    body: "En diseño de producto, el proceso de iteración es todo: modelas en ordenador, imprimes, pruebas en mano, ves qué no funciona y corriges. Con el descuento de estudiante, cada iteración cuesta menos y puedes permitirte más rondas de refinamiento antes de la presentación final.",
                  },
                  {
                    title: "Piezas para proyectos de robótica y mecatrónica",
                    tag: "La Salle, ESEIAAT, UPC",
                    tagColor: "bg-red-500/15 text-red-700 dark:text-red-400",
                    body: "Chasis de robots, soportes de sensores, carcasas de electrónica, acoples de motor, guías de cables — todo lo que en un proyecto de robótica necesitas fabricar pero no puedes comprar estándar. PETG para piezas estructurales, TPU para elementos con flex, PLA para prototipos rápidos de geometría.",
                  },
                  {
                    title: "Instrumentación y modelos de laboratorio",
                    tag: "UB, IQS, UAB",
                    tagColor: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
                    body: "Porta-muestras, soportes de sensores, adaptadores de equipo, carcasas de electrónica de medición, modelos anatómicos educativos. Si tu proyecto de investigación necesita un componente específico que no existe en catálogo, lo fabricamos a medida.",
                  },
                  {
                    title: "Proyectos de asignatura con entrega física",
                    tag: "Cualquier carrera con proyectos de taller",
                    tagColor: "bg-secondary text-foreground/60",
                    body: "Muchas asignaturas requieren entregar un objeto físico: mecánica de máquinas, diseño asistido por ordenador, fabricación, ergonomía del producto, proyectos de integración. Si tienes el modelo 3D diseñado en clase y necesitas el objeto real, podemos imprimirlo en 24-48 horas para que llegues a tiempo a la entrega.",
                  },
                ].map(({ title, tag, tagColor, body }) => (
                  <div key={title} className="rounded-xl border border-border px-5 py-4 bg-secondary/10">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tagColor}`}>{tag}</span>
                    </div>
                    <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 5. Precios para estudiantes */}
            <article id="precios">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Precios para estudiantes — ejemplos con descuento aplicado
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed mb-6">
                <p>
                  Estos son ejemplos orientativos en PLA con relleno estándar (15%) y el 20% de descuento ya aplicado. El precio exacto depende del volumen real de tu pieza — usa la calculadora para obtener una estimación antes de pedir presupuesto.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Pieza pequeña",
                    detail: "~20 g · piezas de clip, engranaje pequeño, accesorio de montaje",
                    normal: "10€",
                    student: "10€",
                    note: "El precio mínimo del servicio es 10€ — en este caso el descuento está en el propio precio mínimo.",
                    highlight: false,
                  },
                  {
                    label: "Pieza mediana",
                    detail: "~150 g · soporte de sensor, componente de robot, parte de maqueta",
                    normal: "~22€",
                    student: "~18€",
                    note: "Ahorro: ~4€ por pieza. Si necesitas 3 iteraciones del mismo componente, el ahorro total es de ~12€.",
                    highlight: true,
                  },
                  {
                    label: "Proyecto grande",
                    detail: "~400 g · maqueta de arquitectura, prototipo completo, chasis de robot",
                    normal: "~48€",
                    student: "~38€",
                    note: "Ahorro: ~10€. Para proyectos que requieren varias piezas, los ahorros se acumulan rápidamente.",
                    highlight: false,
                  },
                  {
                    label: "Tirada de piezas (10+ unidades)",
                    detail: "Ejemplo: 15 unidades de ~30 g cada una · componentes repetidos para proyecto",
                    normal: "~42€ (con descuento qty 5%)",
                    student: "~34€ (20% dto. estudiante sobre precio con descuento qty)",
                    note: "En tiradas, el descuento de estudiante se aplica después del descuento por cantidad — doble ahorro.",
                    highlight: false,
                  },
                ].map(({ label, detail, normal, student, note, highlight }) => (
                  <div key={label} className={`rounded-xl border px-5 py-4 ${highlight ? "border-accent/40 bg-accent/5" : "border-border bg-secondary/10"}`}>
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div>
                        <h3 className="font-semibold text-foreground">{label}</h3>
                        <p className="text-xs text-foreground/50 mt-0.5">{detail}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-foreground/40 line-through">{normal}</p>
                        <p className="text-xl font-bold text-accent">{student}</p>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/55 leading-relaxed mt-2">{note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-4 rounded-xl border border-border/60 bg-secondary/20">
                <p className="text-sm text-foreground/65 leading-relaxed">
                  Para una guía completa de tarifas con la fórmula de cálculo y ejemplos reales, visita nuestra{" "}
                  <Link to="/blog/precio-impresion-3d-barcelona" className="text-accent hover:underline font-medium">
                    guía de precios de impresión 3D en Barcelona
                  </Link>
                  . También puedes calcular el precio exacto de tu pieza en{" "}
                  <Link to="/#calculator" className="text-accent hover:underline font-medium">
                    la calculadora online
                  </Link>
                  {" "}y luego mencionar tu universidad al confirmar para que apliquemos el 20%.
                </p>
              </div>
            </article>

            <div className="border-b border-border/40" />

            {/* 6. Por qué elegirnos */}
            <article id="por-que">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
                Por qué elegirnos para tu proyecto académico
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed mb-6">
                <p>
                  Los proyectos académicos tienen características que los hacen diferentes de los encargos de empresa: plazos inamovibles, presupuesto ajustado, dudas sobre qué material elegir y a menudo la necesidad de iterar varias veces antes de llegar a la versión final.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Cumplimos los plazos de entrega",
                    body: "Sabemos que la fecha de presentación del TFG no se mueve. Si nos comunicas tu deadline, lo priorizamos. Servicio express 24-48h disponible al mismo precio base con el descuento estudiante.",
                    color: "bg-blue-500/8 border-blue-500/20",
                  },
                  {
                    title: "Comunicación directa, sin intermediarios",
                    body: "Nos escribes por WhatsApp o email y te responde la persona que imprime tu pieza. Si el modelo tiene un problema, te lo decimos antes de imprimir — no recibes la pieza mal hecha.",
                    color: "bg-green-500/8 border-green-500/20",
                  },
                  {
                    title: "Te ayudamos a elegir el material",
                    body: "Si no tienes claro si usar PLA, PETG o ABS para tu proyecto, te explicamos cuál encaja mejor con los requisitos funcionales y de presentación. Sin cobrarte consultoría extra.",
                    color: "bg-amber-500/8 border-amber-500/20",
                  },
                  {
                    title: "Precio transparente antes de imprimir",
                    body: "Siempre te confirmamos el precio exacto antes de empezar. Sin sorpresas al recoger. Si el modelo necesita ajustes que afectan al precio, te consultamos primero.",
                    color: "bg-purple-500/8 border-purple-500/20",
                  },
                  {
                    title: "Acepta múltiples iteraciones",
                    body: "En diseño y prototipos es normal imprimir, ver que algo no funciona y volver a imprimir. Con el descuento de estudiante, cada iteración cuesta menos y puedes permitirte más ciclos de refinamiento.",
                    color: "bg-orange-500/8 border-orange-500/20",
                  },
                  {
                    title: "Entrega en Barcelona o envío a toda España",
                    body: "Recoges en Barcelona (centro, con cita previa) o enviamos por mensajería en 24h a cualquier punto de España. Ideal si presentas tu proyecto fuera de Barcelona.",
                    color: "bg-teal-500/8 border-teal-500/20",
                  },
                ].map(({ title, body, color }) => (
                  <div key={title} className={`rounded-xl border px-5 py-4 ${color}`}>
                    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </article>

          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-14 bg-amber-500">
          <div className="container px-4 max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-bold text-white mb-4">
              <GraduationCap className="w-4 h-4" />
              20% descuento para estudiantes
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              ¿Empezamos con tu proyecto?
            </h2>
            <p className="text-white/85 mb-8 text-lg">
              Sube tu archivo, menciona tu universidad y obtienes el presupuesto con el descuento del 20% en menos de 1 hora.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="xl" className="bg-white text-amber-600 hover:bg-white/90 font-bold shadow-lg gap-2">
                <Link to="/#calculator">
                  Sube tu archivo y menciona tu universidad
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                onClick={handleWhatsApp}
                size="xl"
                className="bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-lg gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contactar por WhatsApp
              </Button>
            </div>
          </div>
        </section>

        {/* ── INTERNAL LINKS ── */}
        <section className="py-12 bg-secondary/20">
          <div className="container px-4 max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold text-foreground mb-5">Guías relacionadas</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  to: "/blog/precio-impresion-3d-barcelona",
                  label: "Guía de precios",
                  desc: "Tabla de precios por peso, material y cantidad",
                },
                {
                  to: "/blog/impresion-3d-urgente-barcelona",
                  label: "Impresión urgente",
                  desc: "Entrega en 24-48h para deadlines ajustados",
                },
                {
                  to: "/blog/prototipos-rapidos-piezas-funcionales-barcelona",
                  label: "Prototipos funcionales",
                  desc: "Materiales técnicos para proyectos de ingeniería",
                },
              ].map(({ to, label, desc }) => (
                <Link
                  key={to}
                  to={to}
                  className="group rounded-xl border border-border bg-card px-4 py-4 hover:border-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors">{label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-accent transition-all flex-shrink-0" />
                  </div>
                  <p className="text-xs text-foreground/55 leading-relaxed">{desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-4 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Preguntas frecuentes sobre el descuento para estudiantes
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

export default StudentsBcn;
