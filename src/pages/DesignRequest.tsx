import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { CheckCircle, Image, Loader2, Send, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { supabase, supabaseAnon } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { capture } from "@/lib/analytics";

const SITE_URL = "https://www.dimension3dprints.com";
const MAX_FILES = 4;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const SLUG_ES = "/disena-tu-pieza-3d";
const SLUG_EN = "/design-your-3d-part";
const SLUG_CA = "/dissenya-la-teva-peca-3d";

const DesignRequest = () => {
  const { t, language } = useLanguage();

  const canonicalSlug =
    language === "ca" ? SLUG_CA : language === "en" ? SLUG_EN : SLUG_ES;
  const htmlLang =
    language === "ca" ? "ca" : language === "en" ? "en" : "es";

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [quantity, setQuantity] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const addPhotos = (incoming: File[]) => {
    const remaining = MAX_FILES - photos.length;
    if (remaining <= 0) return;
    const valid: File[] = [];
    let anyOversized = false;
    for (const f of incoming.slice(0, remaining)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > MAX_BYTES) { anyOversized = true; continue; }
      valid.push(f);
    }
    if (anyOversized) setPhotoError(t("design.form.photos.tooLarge"));
    else setPhotoError(null);
    if (valid.length > 0) setPhotos(prev => [...prev, ...valid]);
  };

  const removePhoto = (idx: number) =>
    setPhotos(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() && !contactPhone.trim()) {
      setFormError(t("design.form.atLeastOne"));
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    try {
      // Show success straight away — uploads and DB writes happen async.
      setIsSubmitted(true);
      setIsSubmitting(false);

      const hasPhoto = photos.length > 0;
      capture("design_request_submitted", { hasPhoto, language });

      // Upload photos and do DB work in background.
      (async () => {
        const uploadedPaths: string[] = [];
        const uploadedNames: string[] = [];
        const timestamp = Date.now();

        for (const photo of photos) {
          const sanitized = photo.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const path = `${timestamp}-${sanitized}`;
          const { error: uploadErr } = await supabaseAnon.storage
            .from("print-requests")
            .upload(path, photo);
          if (!uploadErr) {
            uploadedPaths.push(path);
            uploadedNames.push(photo.name);
          }
        }

        supabaseAnon
          .from("quote_requests")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert({
            contact_email: contactEmail.trim() || null,
            contact_phone: contactPhone.trim() || null,
            material: "Diseño a medida",
            infill: "N/A",
            wall_loops: 0,
            quantity: 1,
            estimated_grams: 0,
            estimated_hours: 0,
            estimated_price_low: 0,
            estimated_price_high: 0,
            file_paths: uploadedPaths,
            file_names: uploadedNames,
            status: "pending",
            product_slug: "design-request",
            product_name: "Diseño a medida",
            customization: {
              description,
              dimensions: dimensions.trim() || null,
              quantity: quantity.trim() || null,
            },
          } as any)
          .then(({ error: dbErr }) => {
            if (dbErr) console.error("quote_requests insert error:", dbErr);
          })


        supabase.functions
          .invoke("send-quote-request", {
            body: {
              filePaths: uploadedPaths,
              fileNames: uploadedNames,
              contactEmail: contactEmail.trim() || null,
              contactPhone: contactPhone.trim() || null,
              material: "Diseño a medida",
              description,
              dimensions: dimensions.trim() || null,
              quantity: quantity.trim() || null,
              priceLow: 0,
              priceHigh: 0,
              language,
            },
          }).catch(console.error);
      })();
    } catch {
      setIsSubmitting(false);
      setIsSubmitted(false);
      setFormError(t("design.error"));
    }
  };

  return (
    <>
      <Helmet>
        <html lang={htmlLang} />
        <title>{t("design.meta.title")}</title>
        <meta name="description" content={t("design.meta.description")} />
        <link rel="canonical" href={`${SITE_URL}${canonicalSlug}`} />
        <link rel="alternate" hrefLang="es" href={`${SITE_URL}${SLUG_ES}`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}${SLUG_EN}`} />
        <link rel="alternate" hrefLang="ca" href={`${SITE_URL}${SLUG_CA}`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${SLUG_ES}`} />
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container px-4 max-w-2xl">

          {/* Hero */}
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              {t("design.hero.badge")}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("design.hero.heading")}
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {t("design.hero.intro")}
            </p>
          </div>

          {/* 3-step process */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {([1, 2, 3] as const).map((n) => (
              <div key={n} className="text-center">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {n}
                </div>
                <p className="font-semibold text-sm mb-1 text-foreground">
                  {t(`design.step${n}.heading`)}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(`design.step${n}.desc`)}
                </p>
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 card-shadow">
            <p className="text-lg font-semibold text-foreground mb-1">
              {t("design.form.heading")}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {t("design.form.reassure")}
            </p>

            {isSubmitted ? (
              <div className="rounded-xl bg-whatsapp/10 border border-whatsapp/25 p-6 text-center">
                <CheckCircle className="w-10 h-10 text-whatsapp mx-auto mb-3" />
                <p className="font-semibold text-foreground text-lg mb-1">
                  {t("design.success.title")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("design.success.desc")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Description — required */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {t("design.form.desc.label")} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("design.form.desc.placeholder")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                {/* Photo upload — optional, image/*, max 10 MB, up to 4 */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {t("design.form.photos.label")}
                  </label>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addPhotos(Array.from(e.target.files ?? []));
                      e.target.value = "";
                    }}
                  />
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {photos.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 rounded-lg bg-accent/8 border border-accent/25 px-2.5 py-1.5 text-xs"
                        >
                          <Image className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Remove photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {photos.length < MAX_FILES && (
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-accent/50 hover:bg-accent/4 transition-colors text-center"
                    >
                      {t("design.form.photos.hint")} ({photos.length}/{MAX_FILES})
                    </button>
                  )}
                  {photoError && (
                    <p className="text-xs text-destructive mt-1">{photoError}</p>
                  )}
                </div>

                {/* Dimensions + Quantity — optional */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      {t("design.form.dimensions.label")}
                    </label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder={t("design.form.dimensions.placeholder")}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      {t("design.form.qty.label")}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder={t("design.form.qty.placeholder")}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Contact — email or phone, at least one required */}
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    {t("design.form.contact.heading")}
                  </p>
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder={t("calc.contact.email")}
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder={t("calc.contact.phone")}
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("design.form.atLeastOne.hint")}
                    </p>
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-destructive">{formError}</p>
                )}

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
                      {t("design.form.submitting")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t("design.form.submit")}
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
};

export default DesignRequest;
