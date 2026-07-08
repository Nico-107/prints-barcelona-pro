import { useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle, Loader2, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { supabase, supabaseAnon } from "@/integrations/supabase/client";
import { catalogProducts } from "@/data/catalogProducts";
import { useLanguage } from "@/contexts/LanguageContext";
import NotFound from "@/pages/NotFound";

const SITE_URL = "https://www.dimension3dprints.com";

const CatalogProduct = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const product = catalogProducts.find((p) => p.slug === slug);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!product) return <NotFound />;

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() && !contactPhone.trim()) {
      setFormError("Introduce al menos un método de contacto — email o teléfono.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    try {
      setIsSubmitted(true);
      setIsSubmitting(false);

      supabaseAnon
        .from("quote_requests")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          material: "Catálogo",
          infill: "N/A",
          wall_loops: 0,
          quantity: 1,
          estimated_grams: 0,
          estimated_hours: 0,
          estimated_price_low: product.priceLow,
          estimated_price_high: product.priceHigh,
          file_paths: [],
          status: "pending",
          product_slug: product.slug,
          product_name: product.name,
          customization: fieldValues,
        } as any)
        .then(({ error: dbErr }) => {
          if (dbErr) console.error("quote_requests insert error:", dbErr.message, dbErr);
        })
        .catch((e: unknown) => console.error("quote_requests insert threw:", e));

      supabase.functions
        .invoke("send-catalog-request", {
          body: {
            productSlug: product.slug,
            productName: product.name,
            customization: fieldValues,
            contactEmail: contactEmail.trim() || null,
            contactPhone: contactPhone.trim() || null,
            priceLow: product.priceLow,
            priceHigh: product.priceHigh,
            language,
          },
        })
        .catch(console.error);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setFormError("Error al enviar la solicitud. Por favor, inténtalo de nuevo.");
      console.error("Catalog submit error:", err);
    }
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | Dimension3D</title>
        <meta name="description" content={product.description} />
        <link rel="canonical" href={`${SITE_URL}/catalogo/${slug}`} />
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <div className="rounded-2xl overflow-hidden bg-secondary/30 aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
                  Producto personalizado
                </p>
                <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                <p className="text-xl font-semibold text-accent mb-4">
                  €{product.priceLow}–€{product.priceHigh}
                </p>
                <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>

                {isSubmitted ? (
                  <div className="rounded-xl bg-whatsapp/10 border border-whatsapp/25 p-6 text-center">
                    <CheckCircle className="w-10 h-10 text-whatsapp mx-auto mb-3" />
                    <p className="font-semibold text-foreground text-lg mb-1">¡Solicitud enviada!</p>
                    <p className="text-sm text-muted-foreground">
                      Hemos recibido tu pedido personalizado. Nos pondremos en contacto contigo en
                      menos de 1 hora con el presupuesto confirmado.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm font-semibold text-foreground">Personaliza tu pedido</p>

                    {product.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          {field.label}
                        </label>
                        {field.type === "select" ? (
                          <select
                            value={fieldValues[field.key] ?? ""}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">Selecciona una opción</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={fieldValues[field.key] ?? ""}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.label}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        )}
                      </div>
                    ))}

                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-semibold text-foreground mb-3">
                        Datos de contacto
                      </p>
                      <div className="space-y-2">
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="Tu email"
                          disabled={isSubmitting}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                        />
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="WhatsApp / teléfono"
                          disabled={isSubmitting}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                        />
                        <p className="text-xs text-muted-foreground">
                          Al menos uno de los dos es obligatorio.
                        </p>
                      </div>
                    </div>

                    {formError && <p className="text-xs text-destructive">{formError}</p>}

                    <Button
                      type="submit"
                      variant="cta"
                      size="lg"
                      className="w-full gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Solicitar presupuesto
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
};

export default CatalogProduct;
