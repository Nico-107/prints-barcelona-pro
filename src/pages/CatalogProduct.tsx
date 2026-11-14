import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SocialMeta from "@/components/SocialMeta";
import { CheckCircle, Loader2, Send } from "lucide-react";
import ProductTemplate from "@/components/product/ProductTemplate";
import PictureImg from "@/components/PictureImg";
import { Button } from "@/components/ui/button";
import { supabase, supabaseAnon } from "@/integrations/supabase/client";
import { catalogProducts } from "@/data/catalogProducts";
import { useLanguage } from "@/contexts/LanguageContext";
import { PUBLISHER_REF } from "@/seo/entities";
import NotFound from "@/pages/NotFound";
import { capture, identifyUser } from "@/lib/analytics";
import { customerRef } from "@/lib/customerRef";

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

  // A6: catalog_product_view on mount — hook must come before the early return
  useEffect(() => {
    if (product) capture("catalog_product_view", { slug: product.slug });
  }, [product?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) return <NotFound />;

  const productLang = language === "en" || language === "ca" ? language : "es";
  const productName = product.name[productLang];
  const productDescription = product.description[productLang];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description: productDescription,
    image: `${SITE_URL}${product.image}`,
    url: `${SITE_URL}/catalogo/${product.slug}`,
    brand: { "@type": "Brand", name: "Dimension3D" },
    mpn: `D3D-${product.slug}`,
    offers: {
      "@type": "Offer",
      price: product.priceLow,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/catalogo/${product.slug}`,
      seller: PUBLISHER_REF,
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 6.00,
          currency: "EUR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "ES",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "ES",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        merchantReturnLink: `${SITE_URL}/politica-devoluciones`,
      },
    },
  };

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

      // A6 + A4: catalog_request_submitted with pseudonymous customer ref
      const ref = contactEmail.trim() ? await customerRef(contactEmail.trim()) : undefined;
      capture("catalog_request_submitted", { slug: product.slug, value: product.priceLow, customer_ref: ref, source_page: window.location.pathname });
      if (ref) identifyUser(ref);

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
          product_name: productName,
          customization: fieldValues,
        } as any)
        .then(({ error: dbErr }) => {
          if (dbErr) console.error("quote_requests insert error:", dbErr.message, dbErr);
        });

      supabase.functions
        .invoke("send-catalog-request", {
          body: {
            productSlug: product.slug,
            productName: productName,
            customization: fieldValues,
            contactEmail: contactEmail.trim() || null,
            contactPhone: contactPhone.trim() || null,
            priceLow: product.priceLow,
            priceHigh: product.priceHigh,
            language,
          },
        }).catch(console.error);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setFormError("Error al enviar la solicitud. Por favor, inténtalo de nuevo.");
      console.error("Catalog submit error:", err);
    }
  };

  const helmet = (
    <>
      <Helmet>
        <title>{productName} — Impresión 3D Barcelona</title>
        <meta name="description" content={productDescription} />
        <link rel="canonical" href={`${SITE_URL}/catalogo/${slug}`} />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>
      <SocialMeta title={`${productName}`} description={productDescription} path={`/catalogo/${product.slug}`} />
    </>
  );

  return (
    <ProductTemplate lang={language} helmet={helmet}>
      {/* fix-polish §4.2: top padding so the product hero doesn't sit
          flush under the header. */}
      <div className="pt-8 md:pt-14 pb-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <section data-testid="page-hero" data-page-hero className="grid md:grid-cols-2 gap-10 items-start">
              <div className="rounded-2xl overflow-hidden bg-secondary/30 aspect-square">
                <PictureImg
                  src={
                    product.variantImages
                      ? (product.variantImages.images[fieldValues[product.variantImages.field]] ?? product.image)
                      : product.image
                  }
                  alt={productName}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
                  Producto personalizado
                </p>
                <h1 className="text-3xl font-bold text-foreground mb-2">{productName}</h1>
                <p className="text-xl font-semibold text-accent mb-4">
                  €{product.priceLow}–€{product.priceHigh}
                </p>
                <p className="text-muted-foreground mb-8 leading-relaxed">{productDescription}</p>

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
            </section>

            {/* fix-polish §5.5: material, size, lead time pulled from the engine
                + three FAQ entries so catalog product pages are no longer thin. */}
            <section className="mt-16 max-w-3xl mx-auto text-[15px] leading-relaxed text-foreground/85 space-y-10">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">Material, tamaño y plazo</h2>
                <ul className="space-y-2 list-disc pl-5">
                  <li>
                    <strong>Material por defecto:</strong>{" "}
                    PLA — una elección segura para la mayoría de los objetos personalizados.
                    Si prefieres PETG (más resistente), ASA (soporta exterior) o TPU (flexible), indícalo en el formulario:
                    reviso el pedido antes de imprimir y confirmo si cambia el precio.
                  </li>
                  <li>
                    <strong>Tamaños disponibles:</strong>{" "}
                    {(() => {
                      const sizeField = product.fields.find(f => /size|tama|mida|größe|dimens/i.test(f.key));
                      return sizeField?.options?.join(" · ") ?? "estándar del producto";
                    })()}
                    . Para medidas fuera de estos rangos, usa el verificador de archivo en{" "}
                    <a href="/verificador-archivo-3d" className="text-accent underline">/verificador-archivo-3d</a>{" "}
                    o escríbeme por WhatsApp con la medida que necesitas.
                  </li>
                  <li>
                    <strong>Plazo:</strong> producción en 2–5 días laborables desde la confirmación, envío estándar 24–48 h a
                    España peninsular, 48–72 h al resto de UE. Para pedidos con fecha ajustada hay servicio express
                    con 24–48 h de producción y un recargo del 25 %.
                  </li>
                  <li>
                    <strong>Precio:</strong> €{product.priceLow}–€{product.priceHigh} por unidad según la combinación de
                    tamaño, color y acabado. El pedido mínimo es 10 €.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Preguntas frecuentes</h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="font-semibold text-foreground">¿Puedo pedir el producto con mi logo o texto?</dt>
                    <dd className="text-sm text-muted-foreground mt-1">
                      Sí. Las opciones de personalización aparecen en el formulario de arriba (texto, nombre, fecha).
                      Si quieres un logo o un diseño específico que no cabe en una de las opciones, mándanos el archivo
                      vectorial (SVG, AI) o una imagen de alta resolución por WhatsApp y te confirmamos si es viable
                      antes de aceptar el pedido.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">¿Qué pasa si el producto llega dañado?</dt>
                    <dd className="text-sm text-muted-foreground mt-1">
                      Si el producto llega dañado o con un defecto de impresión, lo reemplazamos sin coste. Avísanos por
                      WhatsApp con una foto en los 7 días siguientes a la entrega y gestionamos el reenvío. Enviamos siempre
                      con mensajería tracked y el embalaje es a prueba de golpes razonables.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">¿Puedo pedir varias unidades con personalización distinta?</dt>
                    <dd className="text-sm text-muted-foreground mt-1">
                      Sí. Para pedidos de 2 o más unidades con personalizaciones diferentes (p. ej. varios nombres o colores),
                      indícalo en el campo de notas al enviar el formulario. Para pedidos de 10+ unidades, el precio por unidad
                      baja; mándanos un WhatsApp con la cantidad y te hacemos un presupuesto ajustado antes de confirmar.
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          </div>
        </div>
      </div>
    </ProductTemplate>
  );
};

export default CatalogProduct;
