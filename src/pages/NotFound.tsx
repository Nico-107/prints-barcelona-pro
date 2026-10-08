import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <html lang="es" />
        <meta name="robots" content="noindex,follow" />
        <title>404 — Página no encontrada | Dimension3D Barcelona</title>
        <meta name="description" content="La página que buscas no existe. Vuelve al inicio o usa la calculadora para obtener un presupuesto de impresión 3D." />
      </Helmet>
      <Header />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container px-4 max-w-lg mx-auto text-center">
          <p className="text-7xl font-bold text-accent mb-4">404</p>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Página no encontrada
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            La dirección que buscas no existe o ha cambiado. Prueba con estos accesos directos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              to="/#calculator"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Calcular precio
            </Link>
            <Link
              to="/impresion-3d-barcelona"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card text-foreground px-5 py-2.5 text-sm font-semibold hover:border-accent/50 transition-colors"
            >
              Impresión 3D Barcelona
            </Link>
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card text-foreground px-5 py-2.5 text-sm font-semibold hover:border-accent/50 transition-colors"
            >
              Catálogo
            </Link>
          </div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
