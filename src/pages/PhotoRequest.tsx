import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, Camera, Image as ImageIcon, X, ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase, supabaseAnon } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { capture } from "@/lib/analytics";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";

const MAX_BYTES = 10 * 1024 * 1024;
const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

/**
 * fix-polish §5.1: mobile photo-path, three screens.
 *   1. Photo       — camera capture + "choose from library", up to 3 files.
 *   2. Describe    — what it is, approximate size, optional quantity.
 *   3. Contact     — email or WhatsApp number; submit.
 *
 * Reuses the existing `send-quote-request` edge function with
 * requestType="design". Fires `photo_request_submitted` on success only.
 *
 * The non-mobile hero CTA still routes to the full /disena-tu-pieza-3d
 * page which has the extended version. The mobile CTA in Index.tsx hero
 * routes here via the new /foto (es/ca) and /photo (en + intl) slugs.
 */
const SLUG_BY_LANG: Record<string, string> = {
  es: "/foto", ca: "/foto", en: "/photo",
  de: "/foto", fr: "/photo", nl: "/foto", it: "/foto", pt: "/foto",
};

const COPY = {
  es: {
    title: "Mándame una foto · Dimension3D",
    heading: "Mándame una foto",
    subtitle: "Hazme llegar una foto o un pequeño vídeo y te preparo un presupuesto en menos de 1 h.",
    step1: "Tu foto",
    step2: "Qué es y cuánto mide",
    step3: "Cómo te escribo",
    ctaNext: "Siguiente",
    ctaBack: "Atrás",
    ctaSubmit: "Enviar",
    takePhoto: "Hacer foto",
    pickPhoto: "Elegir de la galería",
    photoHint: "Puedes añadir hasta 3 fotos. Si tienes la pieza, pon una moneda al lado para escala.",
    tooLarge: "La foto es demasiado grande (10 MB máx).",
    needOne: "Añade al menos una foto para continuar.",
    descLabel: "Qué es y para qué lo usas",
    descPlaceholder: "Soporte roto de nevera, adaptador para un tubo…",
    sizeLabel: "Tamaño aproximado",
    sizePlaceholder: "p. ej. 8 cm de largo · del tamaño de la mano",
    qtyLabel: "Cuántas unidades (opcional)",
    qtyPlaceholder: "1",
    needDesc: "Dime qué es para seguir.",
    emailLabel: "Email",
    phoneLabel: "WhatsApp (opcional)",
    emailOrPhone: "Dame email o WhatsApp — con uno es suficiente.",
    successTitle: "Foto enviada",
    successBody: "La he recibido. Te escribo en menos de 1 h en horario laboral.",
    errorRetry: "Algo falló. Vuelve a intentarlo o escríbeme por WhatsApp.",
    wa: "Escribirme por WhatsApp",
  },
  ca: {
    title: "Envia'm una foto · Dimension3D",
    heading: "Envia'm una foto",
    subtitle: "Fes-me arribar una foto o un vídeo curt i et preparo un pressupost en menys d'1 h.",
    step1: "La teva foto", step2: "Què és i quant mesura", step3: "Com t'escric",
    ctaNext: "Següent", ctaBack: "Enrere", ctaSubmit: "Enviar",
    takePhoto: "Fer foto", pickPhoto: "Triar de la galeria",
    photoHint: "Pots afegir fins a 3 fotos. Si tens la peça, posa una moneda al costat per a escala.",
    tooLarge: "La foto és massa gran (10 MB màx).", needOne: "Afegeix almenys una foto per continuar.",
    descLabel: "Què és i per a què l'uses", descPlaceholder: "Suport trencat de nevera, adaptador per a un tub…",
    sizeLabel: "Mida aproximada", sizePlaceholder: "p. ex. 8 cm de llarg · com una mà",
    qtyLabel: "Quantes unitats (opcional)", qtyPlaceholder: "1",
    needDesc: "Digues-me què és per continuar.",
    emailLabel: "Email", phoneLabel: "WhatsApp (opcional)", emailOrPhone: "Dona'm email o WhatsApp — amb un n'hi ha prou.",
    successTitle: "Foto enviada", successBody: "L'he rebut. T'escric en menys d'1 h en horari laboral.",
    errorRetry: "Alguna cosa ha fallat. Torna-ho a provar o escriu-me per WhatsApp.",
    wa: "Escriu-me per WhatsApp",
  },
  en: {
    title: "Send me a photo · Dimension3D",
    heading: "Send me a photo",
    subtitle: "Send a photo or a short clip and I'll come back with a quote in under an hour.",
    step1: "Your photo", step2: "What it is and how big", step3: "How I reach you",
    ctaNext: "Next", ctaBack: "Back", ctaSubmit: "Send",
    takePhoto: "Take a photo", pickPhoto: "Choose from library",
    photoHint: "Up to 3 photos. If you have the part, put a coin next to it for scale.",
    tooLarge: "Photo is too large (10 MB max).", needOne: "Add at least one photo to continue.",
    descLabel: "What it is and what you use it for", descPlaceholder: "Broken fridge shelf support, adapter for a hose…",
    sizeLabel: "Rough size", sizePlaceholder: "e.g. 8 cm long · fits in a hand",
    qtyLabel: "How many (optional)", qtyPlaceholder: "1",
    needDesc: "Tell me what it is to continue.",
    emailLabel: "Email", phoneLabel: "WhatsApp (optional)", emailOrPhone: "Give me email or WhatsApp — one is enough.",
    successTitle: "Photo received", successBody: "Got it. I'll be in touch in under an hour during business hours.",
    errorRetry: "Something failed. Try again or message me on WhatsApp.",
    wa: "Message me on WhatsApp",
  },
} as const;

const PhotoRequest = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const c = ((COPY as unknown) as Record<string, typeof COPY.es>)[language] ?? COPY.es;
  const canonicalSlug = SLUG_BY_LANG[language] ?? "/foto";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [sizeHint, setSizeHint] = useState("");
  const [quantity, setQuantity] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const addPhotos = (incoming: File[]) => {
    const remaining = 3 - photos.length;
    if (remaining <= 0) return;
    let anyOversized = false;
    const valid: File[] = [];
    for (const f of incoming.slice(0, remaining)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > MAX_BYTES) { anyOversized = true; continue; }
      valid.push(f);
    }
    setFormError(anyOversized ? c.tooLarge : null);
    if (valid.length) setPhotos(prev => [...prev, ...valid]);
  };

  const goNext = () => {
    if (step === 1) {
      if (photos.length === 0) { setFormError(c.needOne); return; }
      setFormError(null);
      capture("photo_request_step" as any, { step: 1 });
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!description.trim()) { setFormError(c.needDesc); return; }
      setFormError(null);
      capture("photo_request_step" as any, { step: 2 });
      setStep(3);
      return;
    }
  };

  const goBack = () => { setFormError(null); setStep(prev => (prev > 1 ? (prev - 1) as 1 | 2 : prev)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() && !contactPhone.trim()) { setFormError(c.emailOrPhone); return; }
    setFormError(null);
    setSubmitFailed(false);
    setIsSubmitting(true);
    try {
      const uploadedPaths: string[] = [];
      const uploadedNames: string[] = [];
      let photosFailed = 0;
      const ts = Date.now();
      for (const p of photos) {
        const sanitized = p.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const path = `${ts}-${sanitized}`;
        const { error: uploadErr } = await supabaseAnon.storage.from("print-requests").upload(path, p);
        if (!uploadErr) { uploadedPaths.push(path); uploadedNames.push(p.name); } else { photosFailed++; }
      }
      supabaseAnon.from("quote_requests")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          material: "Diseño a medida (photo)",
          infill: "N/A", wall_loops: 0, quantity: Number(quantity.trim()) || 1,
          estimated_grams: 0, estimated_hours: 0, estimated_price_low: 0, estimated_price_high: 0,
          file_paths: uploadedPaths, file_names: uploadedNames,
          status: "pending", product_slug: "photo-request", product_name: "Photo request",
          customization: { description, sizeHint: sizeHint.trim() || null, quantity: quantity.trim() || null },
        } as any).then(({ error: dbErr }) => { if (dbErr) console.error("insert error:", dbErr); });
      const { error: fnErr } = await Promise.race([
        supabase.functions.invoke("send-quote-request", {
          body: {
            requestType: "design",
            filePaths: uploadedPaths, fileNames: uploadedNames,
            contactEmail: contactEmail.trim() || null, contactPhone: contactPhone.trim() || null,
            description, dimensions: sizeHint.trim() || null, quantity: quantity.trim() || null,
            photosFailed, language,
          },
        }),
        new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error("TIMEOUT") }), 20000),
        ),
      ]);
      if (fnErr) throw fnErr;
      // fix-polish §5.1 — fire ONLY on success.
      capture("photo_request_submitted" as any, { language, photoCount: uploadedPaths.length });
      setIsSubmitted(true);
    } catch (err: any) {
      const code = (err?.message ?? "unknown").slice(0, 40);
      capture("submit_error" as any, { stage: "photo_request", table: "-", code });
      setSubmitFailed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <html lang={language} />
        <title>{c.title}</title>
        <meta name="description" content={c.subtitle} />
        <link rel="canonical" href={`https://www.dimension3dprints.com${canonicalSlug}`} />
        <meta name="robots" content="noindex,follow" />
      </Helmet>
      <Header />
      <main id="main-content" className="flex-1 bg-background pt-[calc(var(--header-h)+24px)] pb-10">
        <div className="container px-4 max-w-md mx-auto">
          <section data-testid="page-hero" data-page-hero className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-2">
              {language === "en" ? "Step " : "Paso "}{step}/3
            </p>
            <h1 className="font-display font-extrabold tracking-tight leading-tight mb-2" style={{ fontSize: "clamp(26px, 5vw, 32px)" }}>
              {c.heading}
            </h1>
            <p className="text-sm text-muted-foreground">{c.subtitle}</p>
            {/* Step chips */}
            <div className="flex gap-2 mt-4" data-testid="photo-request-steps">
              {[1, 2, 3].map(n => (
                <span key={n} className={`h-1 flex-1 rounded-full ${step >= n ? "bg-accent" : "bg-muted"}`} aria-current={step === n ? "step" : undefined} />
              ))}
            </div>
          </section>

          {isSubmitted ? (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-5 text-center" data-testid="photo-request-success">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-foreground">{c.successTitle}</p>
              <p className="text-sm text-muted-foreground mt-1">{c.successBody}</p>
              <Button className="mt-4 w-full ds-btn-primary" onClick={() => navigate(language === "ca" ? "/ca" : language === "en" ? "/3d-printing-service" : "/")}>
                OK
              </Button>
            </div>
          ) : (
            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); goNext(); }} className="space-y-4">
              {/* ── Step 1: Photo ── */}
              {step === 1 && (
                <section data-testid="photo-request-step-1" className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">{c.step1}</p>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={e => { addPhotos(Array.from(e.target.files ?? [])); e.target.value = ""; }}
                    className="hidden"
                    data-testid="photo-request-camera"
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => { addPhotos(Array.from(e.target.files ?? [])); e.target.value = ""; }}
                    className="hidden"
                    data-testid="photo-request-gallery"
                  />
                  <Button type="button" className="w-full ds-btn-primary h-12" onClick={() => cameraInputRef.current?.click()}>
                    <Camera className="w-5 h-5 mr-2" /> {c.takePhoto}
                  </Button>
                  <Button type="button" variant="outline" className="w-full h-12" onClick={() => galleryInputRef.current?.click()}>
                    <ImageIcon className="w-5 h-5 mr-2" /> {c.pickPhoto}
                  </Button>
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2" data-testid="photo-request-preview">
                      {photos.map((p, i) => (
                        <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-input">
                          <img src={URL.createObjectURL(p)} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-0.5" aria-label="remove">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{c.photoHint}</p>
                </section>
              )}

              {/* ── Step 2: Describe ── */}
              {step === 2 && (
                <section data-testid="photo-request-step-2" className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">{c.step2}</p>
                  <label className="block">
                    <span className="block text-xs font-medium text-muted-foreground mb-1">{c.descLabel}</span>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder={c.descPlaceholder}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      data-testid="photo-request-description"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-muted-foreground mb-1">{c.sizeLabel}</span>
                    <input
                      type="text"
                      value={sizeHint}
                      onChange={e => setSizeHint(e.target.value)}
                      placeholder={c.sizePlaceholder}
                      className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      data-testid="photo-request-size"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-muted-foreground mb-1">{c.qtyLabel}</span>
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      placeholder={c.qtyPlaceholder}
                      className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      data-testid="photo-request-quantity"
                    />
                  </label>
                </section>
              )}

              {/* ── Step 3: Contact ── */}
              {step === 3 && (
                <section data-testid="photo-request-step-3" className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">{c.step3}</p>
                  <label className="block">
                    <span className="block text-xs font-medium text-muted-foreground mb-1">{c.emailLabel}</span>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      data-testid="photo-request-email"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-muted-foreground mb-1">{c.phoneLabel}</span>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      data-testid="photo-request-phone"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">{c.emailOrPhone}</p>
                  {submitFailed && (
                    <div className="rounded-md bg-red-50 border border-red-200 text-red-700 p-3 text-xs space-y-2">
                      <p>{c.errorRetry}</p>
                      <a href={`${WHATSAPP_URL}?text=${encodeURIComponent(description || "foto")}`} className="underline font-medium">
                        {c.wa}
                      </a>
                    </div>
                  )}
                </section>
              )}

              {formError && <p className="text-xs text-red-600" role="alert">{formError}</p>}

              <div className="flex gap-2 pt-1">
                {step > 1 && (
                  <Button type="button" variant="outline" className="h-12" onClick={goBack} data-testid="photo-request-back">
                    <ArrowLeft className="w-4 h-4 mr-1" /> {c.ctaBack}
                  </Button>
                )}
                <Button type="submit" className="flex-1 ds-btn-primary h-12" disabled={isSubmitting} data-testid="photo-request-next">
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />…</>
                  ) : step === 3 ? (
                    <><CheckCircle className="w-4 h-4 mr-2" /> {c.ctaSubmit}</>
                  ) : (
                    <>{c.ctaNext} <ArrowRight className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PhotoRequest;
