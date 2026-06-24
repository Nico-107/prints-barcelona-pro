import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2, Send, Package, DollarSign, Clock, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY } from "@/config/cities";
import { capture } from "@/lib/analytics";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";

const SITE_URL = "https://www.dimension3dprints.com";

const MAKERS_META: Record<string, { title: string; description: string; locale: string }> = {
  es: {
    title: `Únete a nuestra red de Makers | Dimension3D`,
    description: `¿Tienes una impresora 3D en casa? Colabora con Dimension3D, imprime pedidos reales y gana dinero con tu equipo.`,
    locale: "es_ES",
  },
  en: {
    title: `Join Our Maker Network | Dimension3D`,
    description: `Own a 3D printer? Partner with Dimension3D, print real orders, and earn money with your machine.`,
    locale: "en_US",
  },
  ca: {
    title: `Uneix-te a la nostra xarxa de Makers | Dimension3D`,
    description: `Tens una impressora 3D a casa? Col·labora amb Dimension3D, imprimeix comandes reals i guanya diners amb el teu equip.`,
    locale: "ca_ES",
  },
};

const Makers = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const meta = MAKERS_META[language] ?? MAKERS_META.es;
  const formRef = useRef<HTMLElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [printers, setPrinters] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formStartTimeRef = useRef<number>(Date.now());

  useEffect(() => { formStartTimeRef.current = Date.now(); }, [isSubmitted]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !city || !printers) {
      toast({ title: t("makers.form.required.title"), description: t("makers.form.required.desc"), variant: "destructive" });
      return;
    }
    if (honeypot) return;
    const elapsed = Date.now() - formStartTimeRef.current;
    if (elapsed < 3000) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("maker_applications").insert({
        name,
        email,
        phone: phone || null,
        city,
        printers,
        message: message || null,
      });
      if (error) throw error;
      setIsSubmitted(true);
      capture('maker application submitted', { has_phone: !!phone, has_message: !!message });
      toast({ title: t("makers.form.success.title"), description: t("makers.form.success.desc") });
    } catch (error: any) {
      console.error("Maker application error:", error);
      toast({ title: t("makers.form.error.title"), description: t("makers.form.error.desc"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const offerItems = [
    { icon: Package, title: t("makers.offer.1.title"), desc: t("makers.offer.1.desc") },
    { icon: DollarSign, title: t("makers.offer.2.title"), desc: t("makers.offer.2.desc") },
    { icon: Clock, title: t("makers.offer.3.title"), desc: t("makers.offer.3.desc") },
  ];

  const howItems = [
    { num: "01", title: t("makers.how.1.title"), desc: t("makers.how.1.desc") },
    { num: "02", title: t("makers.how.2.title"), desc: t("makers.how.2.desc") },
    { num: "03", title: t("makers.how.3.title"), desc: t("makers.how.3.desc") },
  ];

  const whoItems = [
    t("makers.who.1"),
    t("makers.who.2"),
    t("makers.who.3"),
    t("makers.who.4"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang={language} />
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={`${SITE_URL}/makers`} />
        <link rel="alternate" hrefLang="es" href={`${SITE_URL}/makers`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/makers`} />
        <link rel="alternate" hrefLang="ca" href={`${SITE_URL}/makers`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/makers`} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={`${SITE_URL}/makers`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={meta.locale} />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
      </Helmet>

      <LaunchOfferBanner />
      <Header />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative py-24 md:py-32 hero-gradient overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0V0zm39 0h1v40h-1V0zM0 0h40v1H0V0zm0 39h40v1H0v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          <div className="container relative z-10 px-4 text-center max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-widest text-primary-foreground/60 mb-4 font-medium">
              Dimension3D {ACTIVE_CITY.cityName}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              {t("makers.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
              {t("makers.hero.subtitle")}
            </p>
            <Button variant="cta" size="xl" onClick={scrollToForm} className="shadow-lg">
              {t("makers.hero.cta")}
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 80L1440 80L1440 40C1200 70 960 80 720 75C480 70 240 50 0 40Z" fill="hsl(var(--background))"/>
            </svg>
          </div>
        </section>

        {/* What we offer */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("makers.offer.title")}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {offerItems.map((item) => (
                <div key={item.title} className="bg-card rounded-2xl p-6 border border-border card-shadow text-center">
                  <div className="w-12 h-12 rounded-xl bg-cta/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-cta" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("makers.how.title")}</h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
              {howItems.map((item, i) => (
                <div key={item.num} className="flex items-start gap-5 bg-card rounded-2xl p-6 border border-border card-shadow">
                  <span className="text-3xl font-bold text-cta/30 leading-none w-10 flex-shrink-0">{item.num}</span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="section-dark-texture py-20 md:py-28">
          <div className="container relative z-10 px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-section-dark-fg mb-10">{t("makers.who.title")}</h2>
              <ul className="space-y-4 text-left">
                {whoItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-cta flex-shrink-0 mt-0.5" />
                    <span className="text-section-dark-fg/90">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button variant="cta" size="lg" onClick={scrollToForm}>
                  {t("makers.hero.cta")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Application form */}
        <section ref={formRef} id="makers-form" className="py-20 md:py-28 bg-secondary/30">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("makers.form.title")}</h2>
              <p className="text-lg text-muted-foreground">{t("makers.form.subtitle")}</p>
            </div>

            <div className="max-w-xl mx-auto">
              {isSubmitted ? (
                <div className="bg-card rounded-2xl p-8 border border-border card-shadow text-center">
                  <div className="w-16 h-16 rounded-full bg-whatsapp/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-whatsapp" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{t("makers.form.success.title")}</h3>
                  <p className="text-muted-foreground">{t("makers.form.success.desc")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 border border-border card-shadow space-y-4">
                  {/* Honeypot */}
                  <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
                    <label htmlFor="maker-website">Website</label>
                    <input type="text" id="maker-website" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("makers.form.name")}</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("makers.form.namePlaceholder")} required className="h-12" disabled={isLoading} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("makers.form.email")}</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("makers.form.emailPlaceholder")} required className="h-12" disabled={isLoading} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("makers.form.phone")}</label>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("makers.form.phonePlaceholder")} className="h-12" disabled={isLoading} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("makers.form.city")}</label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t("makers.form.cityPlaceholder")} required className="h-12" disabled={isLoading} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("makers.form.printers")}</label>
                    <Input value={printers} onChange={(e) => setPrinters(e.target.value)} placeholder={t("makers.form.printersPlaceholder")} required className="h-12" disabled={isLoading} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("makers.form.message")}</label>
                    <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("makers.form.messagePlaceholder")} rows={4} disabled={isLoading} maxLength={2000} />
                  </div>

                  <Button type="submit" variant="cta" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />{t("makers.form.submitting")}</> : <><Send className="w-4 h-4" />{t("makers.form.submit")}</>}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Makers;
