import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { catalogProducts } from "@/data/catalogProducts";

const SITE_URL = "https://www.dimension3dprints.com";

const Catalog = () => {
  return (
    <>
      <Helmet>
        <title>Catálogo de productos personalizados | Dimension3D</title>
        <meta
          name="description"
          content="Explora nuestro catálogo de productos personalizados impresos en 3D: jarrón acanalado, placa de nombre, placa para mascota y topper de boda. Solicita presupuesto sin compromiso."
        />
        <link rel="canonical" href={`${SITE_URL}/catalogo`} />
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Catálogo
            </p>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Productos personalizados
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Elige tu producto, personalízalo a tu gusto y recibe un presupuesto sin compromiso.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {catalogProducts.map((product) => (
              <Link
                key={product.slug}
                to={`/catalogo/${product.slug}`}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-accent/50 hover:shadow-md transition-all duration-200"
              >
                <div className="aspect-square bg-secondary/30 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-foreground mb-1 leading-tight">
                    {product.name}
                  </h2>
                  <p className="text-sm text-accent font-medium">
                    Desde €{product.priceLow}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
};

export default Catalog;
