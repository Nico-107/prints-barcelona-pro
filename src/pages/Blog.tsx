import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { AUTHOR_REF, PUBLISHER_REF } from "@/seo/entities";
import { ArrowRight, BookOpen, Camera, Clock, GraduationCap, Package, Settings2, Timer, Wrench, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";
import { Hero as DsHero } from "@/components/ds";

const SITE_URL = "https://www.dimension3dprints.com";
const SOCIAL_IMAGE_URL = `${SITE_URL}/og/share-default.png`;

const POSTS = [
  {
    slug: "/blog/precio-impresion-3d-barcelona",
    icon: BookOpen,
    title: "¿Cuánto cuesta la Impresión 3D en Barcelona?",
    subtitle: "Guía de precios 2026",
    description: "Tabla de precios por tamaño y peso, cómo afecta el material al coste, descuentos por cantidad y 6 ejemplos reales con precios. La guía más completa para entender qué pagarás antes de pedir.",
    readTime: "8 min",
    tags: ["Precios", "PLA", "PETG"],
  },
  {
    slug: "/blog/impresion-3d-urgente-barcelona",
    icon: Zap,
    title: "Impresión 3D Urgente en Barcelona",
    subtitle: "Entrega en 24–48 horas",
    description: "Cómo funciona el servicio express paso a paso, qué materiales están disponibles para pedidos urgentes y casos reales de piezas entregadas en menos de 24 horas en Barcelona.",
    readTime: "6 min",
    tags: ["Urgente", "Express", "24h"],
  },
  {
    slug: "/blog/recambios-piezas-rotas-impresion-3d-barcelona",
    icon: Wrench,
    title: "Recambios y Piezas Rotas en 3D Barcelona",
    subtitle: "De la foto a la pieza en 24h",
    description: "Qué piezas se pueden reproducir en 3D, cómo enviarnos la foto o la pieza rota, qué material recomendamos para recambios funcionales y 5 ejemplos reales con precios.",
    readTime: "7 min",
    tags: ["Recambios", "PETG", "Sin STL"],
  },
  {
    slug: "/blog/prototipos-rapidos-piezas-funcionales-barcelona",
    icon: Settings2,
    title: "Prototipos Rápidos y Piezas Funcionales en 3D",
    subtitle: "Para ingenieros y empresas",
    description: "Materiales de ingeniería, tolerancias FDM, iteración rápida y tiradas cortas. Para equipos de I+D, startups de hardware y fabricantes en Barcelona.",
    readTime: "9 min",
    tags: ["Prototipos", "Ingeniería", "PETG"],
  },
  {
    slug: "/impresion-3d-estudiantes-barcelona",
    icon: GraduationCap,
    title: "Descuento 20% para Estudiantes Universitarios",
    subtitle: "Descuento universitario",
    description: "20% de descuento en todos los pedidos de impresión 3D para estudiantes universitarios. Pedido mínimo 10€. Mismo servicio express y calidad que el resto de clientes.",
    readTime: "3 min",
    tags: ["Estudiantes", "Descuento", "Universitarios"],
  },
  {
    slug: "/blog/pla-vs-petg",
    icon: BookOpen,
    title: "PLA vs PETG: ¿Qué material elegir para tu impresión 3D?",
    subtitle: "Comparativa de materiales",
    description: "Tabla comparativa completa: resistencia, temperatura, exterior, precio y facilidad de impresión. Cuándo usar PLA y cuándo PETG según el uso real de la pieza.",
    readTime: "7 min",
    tags: ["PLA", "PETG", "Materiales"],
  },
  {
    slug: "/blog/como-imprimir-en-3d-sin-impresora",
    icon: Zap,
    title: "Cómo imprimir en 3D sin tener una impresora",
    subtitle: "Guía para principiantes",
    description: "Tienes un STL descargado y quieres imprimirlo pero no tienes máquina. Opciones: servicio online, bibliotecas, makers locales. Guía paso a paso con precios.",
    readTime: "6 min",
    tags: ["Principiantes", "Online", "Sin Impresora"],
  },
  {
    slug: "/blog/imprimir-modelos-makerworld-printables-cults3d",
    icon: Package,
    title: "Imprimir modelos de Makerworld, Printables y Cults3D",
    subtitle: "Modelos descargados",
    description: "Descargaste un modelo de Makerworld o Printables y quieres imprimirlo. Guía: formatos, licencias, cómo enviarnos el archivo y qué esperar del resultado.",
    readTime: "5 min",
    tags: ["Makerworld", "Printables", "Modelos"],
  },
  {
    slug: "/blog/cuanto-tarda-imprimir-en-3d",
    icon: Timer,
    title: "¿Cuánto tarda una impresión 3D? Tiempos reales",
    subtitle: "Plazos de producción y entrega",
    description: "Tiempos de impresión reales por tamaño de pieza y plazo de entrega total. Piezas pequeñas: 1–3h. Piezas medianas: 3–8h. Express: 24–48h.",
    readTime: "6 min",
    tags: ["Plazos", "Express", "Tiempos"],
  },
  {
    slug: "/blog/que-se-puede-imprimir-en-3d",
    icon: Settings2,
    title: "¿Qué se puede imprimir en 3D? 20 aplicaciones reales",
    subtitle: "Ideas y aplicaciones",
    description: "Recambios, figuras, piezas de coche, prototipos, organizadores, piezas para makers. 20 aplicaciones con ejemplos reales de pedidos de Dimension3D.",
    readTime: "8 min",
    tags: ["Ideas", "Aplicaciones", "Recambios"],
  },
  {
    slug: "/blog/convertir-foto-en-modelo-3d",
    icon: Camera,
    title: "Convertir una foto en modelo 3D: opciones y cómo lo hacemos",
    subtitle: "Foto a pieza impresa",
    description: "Fotogrametría, modelado paramétrico o mandarnos la foto. Cómo pasar de una imagen a una pieza impresa en 3D. Coste y qué información necesitamos.",
    readTime: "7 min",
    tags: ["Diseño", "Foto", "Modelado"],
  },
  {
    slug: "/blog/piezas-de-recambio-impresas-3d",
    icon: Wrench,
    title: "Piezas de recambio impresas en 3D: 5 ejemplos reales",
    subtitle: "Adaptador VESA, lavavajillas, Gardena...",
    description: "Adaptador VESA, rueda de lavavajillas Bosch, adaptador Gardena, embudo de café. Recambios reales impresos en Dimension3D con materiales y precios.",
    readTime: "7 min",
    tags: ["Recambios", "PETG", "Catálogo"],
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Dimension3D", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
  ],
};

const blogArticleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  inLanguage: "es",
  headline: "Guías de Impresión 3D en Barcelona",
  description: "Guías prácticas de impresión 3D en Barcelona: tabla de precios, servicio urgente, recambios FDM y materiales. Lo que necesitas saber antes de pedir.",
  url: `${SITE_URL}/blog`,
  author: AUTHOR_REF,
  publisher: PUBLISHER_REF,
  datePublished: "2026-08-01",
  dateModified: "2026-11-11",
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog` },
  image: SOCIAL_IMAGE_URL,
};

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang="es" />
        <title>Guías de Impresión 3D Barcelona</title>
        <meta name="description" content="Guías prácticas de impresión 3D en Barcelona: tabla de precios, servicio urgente, recambios FDM y materiales. Lo que necesitas saber antes de pedir." />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
        <meta property="og:title" content="Guías de Impresión 3D Barcelona" />
        <meta property="og:description" content="Guías prácticas de impresión 3D en Barcelona: tabla de precios, servicio urgente, recambios FDM y materiales. Lo que necesitas saber antes de pedir." />
        <meta property="og:url" content={`${SITE_URL}/blog`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SOCIAL_IMAGE_URL} />
        <meta name="twitter:title" content="Guías de Impresión 3D Barcelona" />
        <meta name="twitter:description" content="Guías prácticas de impresión 3D en Barcelona: tabla de precios, servicio urgente, recambios FDM y materiales. Lo que necesitas saber antes de pedir." />
        <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(blogArticleSchema)}</script>
      </Helmet>

      <LaunchOfferBanner />
      <Header />

      <main id="main-content" className="pt-[var(--header-h)]">

        {/* ── HERO ── */}
        <DsHero
          variant="centered"
          extendBehindHeader={false}
          starLine={
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#B8C4DA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Guías y recursos
            </span>
          }
          h1="Guías de Impresión 3D en Barcelona"
          paragraph="Todo lo que necesitas saber antes de pedir — precios reales, plazos, materiales y casos prácticos. Sin tecnicismos innecesarios."
        />

        {/* ── ARTICLES ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-4 max-w-3xl mx-auto">
            <div className="space-y-6">
              {POSTS.map(({ slug, icon: Icon, title, subtitle, description, readTime, tags }) => (
                <article key={slug} className="group rounded-2xl border border-border bg-card hover:border-accent/40 transition-colors overflow-hidden">
                  <Link to={slug} className="block p-6 md:p-8">
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs text-foreground/40 font-medium uppercase tracking-wide">{subtitle}</span>
                          <span className="text-foreground/20">·</span>
                          <span className="flex items-center gap-1 text-xs text-foreground/40">
                            <Clock className="w-3 h-3" />
                            {readTime} lectura
                          </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors leading-snug">
                          {title}
                        </h2>
                        <p className="text-foreground/65 leading-relaxed text-sm md:text-base mb-4">
                          {description}
                        </p>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground/60 font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:gap-2.5 transition-all">
                            Leer más <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Blog;
