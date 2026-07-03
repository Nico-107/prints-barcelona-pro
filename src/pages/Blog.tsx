import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock, GraduationCap, Settings2, Wrench, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";

const SITE_URL = "https://www.dimension3dprints.com";

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
    description: "20% de descuento en todos los pedidos de impresión 3D para estudiantes universitarios. Sin pedido mínimo. Mismo servicio express y calidad que el resto de clientes.",
    readTime: "3 min",
    tags: ["Estudiantes", "Descuento", "Universitarios"],
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang="es" />
        <title>Guías de Impresión 3D Barcelona | Dimension3D</title>
        <meta name="description" content="Guías y recursos sobre impresión 3D en Barcelona — precios, urgente, recambios y más." />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
        <meta property="og:title" content="Guías de Impresión 3D Barcelona | Dimension3D" />
        <meta property="og:description" content="Guías y recursos sobre impresión 3D en Barcelona — precios, urgente, recambios y más." />
        <meta property="og:url" content={`${SITE_URL}/blog`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
      </Helmet>

      <LaunchOfferBanner />
      <Header />

      <main className="pt-16">

        {/* ── HERO ── */}
        <section className="py-16 md:py-20 hero-gradient">
          <div className="container px-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-5">
              <BookOpen className="w-3.5 h-3.5" />
              Guías y recursos
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              Guías de Impresión 3D en Barcelona
            </h1>
            <p className="text-lg text-primary-foreground/75 leading-relaxed">
              Todo lo que necesitas saber antes de pedir — precios reales, plazos, materiales y casos prácticos. Sin tecnicismos innecesarios.
            </p>
          </div>
        </section>

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
