import { lazy, Suspense, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2, Package, Clock, Globe, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { whatsappUrl, ACTIVE_CITY } from "@/config/cities";
import { capture } from "@/lib/analytics";

const StlEstimator = lazy(() => import("@/components/StlEstimator").then(m => ({ default: m.StlEstimator })));

const SITE_URL = "https://www.dimension3dprints.com";
const PAGE_URL = `${SITE_URL}/3d-printing-service`;
const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

const faqs = [
  {
    q: "How long does shipping take to my country?",
    a: "From our Barcelona studio: Spain 1–2 business days, France/Germany/Italy/Netherlands/Portugal 3–5 business days, rest of Europe 4–6 business days, worldwide (US, UK, Australia) 5–10 business days. All shipments are tracked.",
  },
  {
    q: "What file formats do you accept?",
    a: "We accept STL, STEP, OBJ, 3MF, and IGES. Direct exports from SolidWorks, Fusion 360, Onshape, CATIA, and FreeCAD work without any conversion. If you only have a drawing or photo, contact us and we can discuss options.",
  },
  {
    q: "Is there a minimum order?",
    a: "The minimum order is €10. Most single small parts fall between €10 and €40. There is no minimum quantity — we print one-off pieces just as readily as batches of 50.",
  },
  {
    q: "Can you print in my specific material?",
    a: "We stock PLA, PETG, ABS, ASA, TPU, Nylon (PA12/PA6), Polycarbonate, and carbon-fibre composite variants of several materials. If you need a specific colour or grade not listed, ask — we can often source it. Send your file with a description of the use case and we will recommend the best option.",
  },
  {
    q: "How is the price calculated?",
    a: "Price depends on two factors: the weight of the printed part (grams of filament used) and the machine time (hours). There are no hidden set-up fees or file review charges. Shipping is calculated based on destination and parcel weight and is shown clearly before you confirm the order. Use the online calculator for an instant estimate.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  inLanguage: "en",
  headline: "Professional 3D Printing Service — Ship Anywhere in Europe",
  description:
    "Professional FDM 3D printing service based in Barcelona, shipping across Europe and worldwide. Upload your STL, get an instant quote, delivery in 3-7 days. From €10.",
  url: PAGE_URL,
  publisher: {
    "@type": "Organization",
    name: "Dimension3D",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` },
  },
  image: `${SITE_URL}/og-image.jpg`,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const InternationalServicePage = () => {
  useEffect(() => {
    capture('international_page_view', { referrer: document.referrer });
  }, []);

  const scrollToCalc = () => {
    capture('international_cta_click');
    const el = document.getElementById("calculator");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
  <div className="min-h-screen bg-background">
    <Helmet>
      <html lang="en" />
      <title>Professional 3D Printing Service — Fast Delivery Across Europe | Dimension3D</title>
      <meta
        name="description"
        content="Professional FDM 3D printing service based in Barcelona, shipping across Europe and worldwide. Upload your STL, get an instant quote, delivery in 3-7 days. From €10."
      />
      <link rel="canonical" href={PAGE_URL} />
      <link rel="alternate" hrefLang="es" href={`${SITE_URL}/`} />
      <link rel="alternate" hrefLang="ca" href={`${SITE_URL}/ca/`} />
      <link rel="alternate" hrefLang="en" href={PAGE_URL} />
      <link rel="alternate" hrefLang="x-default" href={PAGE_URL} />
      <meta property="og:title" content="Professional 3D Printing Service — Fast Delivery Across Europe | Dimension3D" />
      <meta
        property="og:description"
        content="Professional FDM 3D printing service based in Barcelona, shipping across Europe and worldwide. Upload your STL, get an instant quote, delivery in 3-7 days. From €10."
      />
      <meta property="og:url" content={PAGE_URL} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Professional 3D Printing Service — Fast Delivery Across Europe | Dimension3D" />
      <meta
        name="twitter:description"
        content="Professional FDM 3D printing service based in Barcelona, shipping across Europe and worldwide. Upload your STL, get an instant quote, delivery in 3-7 days. From €10."
      />
      <meta name="twitter:image" content={`${SITE_URL}/og-image.jpg`} />
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>

    <Header hideLanguageSelector={true} />

    <main className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden hero-gradient">
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0V0zm39 0h1v40h-1V0zM0 0h40v1H0V0zm0 39h40v1H0v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="absolute top-12 left-8 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

        <div className="container relative z-10 px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6">
              <Globe className="w-3.5 h-3.5" />
              Shipping Across Europe & Worldwide
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Professional 3D Printing Service — Ship Anywhere in Europe
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/85 mb-10 max-w-2xl mx-auto leading-relaxed">
              Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery in 3–7 business days anywhere in Europe. From €10. No minimum order.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button variant="cta" size="xl" className="shadow-lg" onClick={scrollToCalc}>
                Get an Instant Quote
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="whatsapp-outline"
                size="xl"
                onClick={() => { capture('international_cta_click'); window.open(`${WHATSAPP_URL}?text=${encodeURIComponent("Hi, I'd like a quote for 3D printing. I'm based outside Spain.")}`, "_blank"); }}
                className="group"
              >
                <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
                Message Us on WhatsApp
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-3 text-primary-foreground/75 text-sm">
              {["From €10", "Quote in 1 hour", "Ships to 30+ countries", "Tracked delivery", "No account needed"].map((label) => (
                <span key={label} className="inline-flex items-center gap-1.5 bg-primary-foreground/10 border border-primary-foreground/15 rounded-full px-4 py-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cta flex-shrink-0" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 46.7C1200 43.3 1320 36.7 1380 33.3L1440 30V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Quick stats */}
      <section className="container px-4 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Clock, label: "Quote turnaround", value: "< 1 hour" },
            { icon: Package, label: "Delivery to Europe", value: "3–5 days" },
            { icon: Globe, label: "Countries shipped", value: "30+" },
            { icon: CheckCircle2, label: "Minimum order", value: "€10" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center p-5 rounded-xl border border-border/50 bg-card">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="container px-4 py-10">
        <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-xl" />}>
          <StlEstimator />
        </Suspense>
      </section>

      {/* Content sections */}
      <section className="bg-secondary/20 py-14 md:py-20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto space-y-16">

            {/* The service */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                One studio. Consistent quality. Direct communication.
              </h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  We are a professional FDM 3D printing studio based in Barcelona, shipping to customers across Europe and worldwide. Unlike online marketplaces where your file passes through multiple hands and gets routed to whichever print farm accepts the job, we are a single studio — one team, one set of machines, consistent quality on every order.
                </p>
                <p>
                  Every print is reviewed, produced, and dispatched by the same people. There's no anonymous pipeline, no support ticketing system, no waiting days for a bot to process your upload. We specialise in FDM (Fused Deposition Modelling) printing across a full range of thermoplastics — from everyday PLA to engineering-grade Nylon, ASA, Polycarbonate, and carbon-fibre composites — and we're honest about what each material can and cannot do.
                </p>
                <p>
                  Being based in Barcelona places us at the heart of the EU, with access to reliable courier networks reaching any address in Europe within 3–5 business days of dispatch, and most worldwide destinations in 5–10 days. Whether you need a one-off prototype, a set of functional replacement parts, or ongoing supply of a component you've designed, we handle it with the same direct, personal approach.
                </p>
              </div>
            </div>

            {/* How it works remotely */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                How it works — fully remote, from anywhere in the world
              </h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  You don't need to be in Barcelona — or even in Spain — to use our service. The entire process is remote from the first second to the last tracking notification.
                </p>
                <ol className="space-y-3 list-decimal list-inside">
                  <li>
                    <strong className="text-foreground">Upload your file.</strong> Send your STL, STEP, OBJ, or 3MF file via our{" "}
                    <button onClick={scrollToCalc} className="text-accent hover:underline">online estimator</button>
                    , by email, or directly on WhatsApp. The estimator gives an instant price estimate based on your file's weight and print time.
                  </li>
                  <li>
                    <strong className="text-foreground">Human review within 1 hour.</strong> A real person checks your file for printability — wall thicknesses, overhangs, orientation — and confirms the exact price, lead time, and any material recommendations. If there's a potential problem, we tell you before we print anything.
                  </li>
                  <li>
                    <strong className="text-foreground">Approve and we print.</strong> Once you confirm the quote, the job enters our print queue. Most standard orders ship within 3–7 business days. Express options are available for urgent needs.
                  </li>
                  <li>
                    <strong className="text-foreground">Tracked courier delivery.</strong> We dispatch via trusted carriers. You receive a tracking number as soon as the parcel leaves our workshop. Typical delivery: 1–2 days within Spain, 3–5 days to most of Europe, 5–10 days worldwide.
                  </li>
                </ol>
                <p>
                  The whole process — from file upload to parcel arrival — typically takes 4–9 business days for European customers outside Spain. For customers in Germany, France, the Netherlands, Italy, or Portugal, delivery is routinely 3–5 days from dispatch.
                </p>
              </div>
            </div>

            {/* Materials */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Materials — full FDM range
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We print across the complete FDM material range. Here's what each material is best suited for:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    name: "PLA",
                    desc: "The most versatile entry-level material. Ideal for prototypes, display models, decorative items, and parts not exposed to heat above 60 °C or prolonged outdoor UV. Available in dozens of colours including silk, matte, and wood-fill variants. Most economical choice.",
                  },
                  {
                    name: "PETG",
                    desc: "Tougher than PLA with slight flexibility and good layer adhesion. Food-safe when properly post-processed. Excellent for housings, brackets, food containers, and parts that need impact resistance without the warping risk of ABS. Prints well in large formats.",
                  },
                  {
                    name: "ABS",
                    desc: "Strong, heat-resistant (up to ~100 °C), and easily machined, sanded, or painted. Standard choice for functional enclosures, automotive interior parts, and items that will be acetone-smoothed. Requires an enclosure to print well — we have that covered.",
                  },
                  {
                    name: "ASA",
                    desc: "ABS but UV-stabilised and more weather-resistant. The go-to material for anything that will live outdoors: garden fixtures, automotive exterior parts, signage, mounting brackets. Holds colour and mechanical properties far better than ABS under sunlight.",
                  },
                  {
                    name: "TPU (Flexible)",
                    desc: "Rubber-like filament available in various shore hardnesses. Used for phone cases, protective grips, gaskets, pipe seals, anti-vibration pads, wearable components, and any part that needs to compress, flex, or absorb impact. Highly durable.",
                  },
                  {
                    name: "Nylon (PA12 / PA6)",
                    desc: "High tensile strength, excellent fatigue resistance, and low friction coefficient. The standard engineering choice for gears, hinges, snap-fit clips, cable management, and mechanical parts that will experience repeated stress. Slightly hygroscopic — we dry filament before printing.",
                  },
                  {
                    name: "Polycarbonate (PC)",
                    desc: "Extremely tough and heat-resistant up to ~115 °C. Best for parts that must survive significant mechanical stress, high operating temperatures, or impacts. Used in industrial fixtures, protective covers, and parts that ABS or Nylon simply cannot handle.",
                  },
                  {
                    name: "Carbon Fibre Composites (CF-PLA, CF-PETG, CF-Nylon)",
                    desc: "Short-fibre reinforced materials with a significantly higher stiffness-to-weight ratio than standard polymers. Dramatically reduces flex and deformation. Used in structural brackets, drone frames, robotic arms, and precision parts where rigidity is paramount. Lightweight and professional-looking surface finish.",
                  },
                ].map(({ name, desc }) => (
                  <div key={name} className="p-5 rounded-xl border border-border/50 bg-card hover:border-accent/40 transition-colors">
                    <h3 className="font-bold text-foreground mb-2">{name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                Not sure which material suits your project? Send us the file and describe the use case — we'll recommend the right option at no charge.
              </p>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Pricing — transparent formula, no hidden fees
              </h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Our pricing is formula-based and fully transparent. The final price depends on two factors: the weight of the printed part (grams of filament consumed) and the machine time (hours of print). There are no set-up fees, no file review fees, and no platform charges. You pay for the print, nothing else.
                </p>
                <p>
                  The minimum order is <strong className="text-foreground">€10</strong>. Most single small parts fall in the €10–€40 range. Larger or multi-part orders scale proportionally. Material choice affects the per-gram cost: PLA is the most economical, with engineering materials like Polycarbonate and carbon-fibre composites at the top end — but still far more affordable than equivalent resin or SLS parts from industrial bureaus.
                </p>
                <p>
                  Shipping costs are calculated at the quote stage based on your country and estimated parcel weight. They're shown clearly before you confirm — no surprises at checkout. For regular customers or volume runs, we offer tiered pricing: ask us about per-unit discounts for orders above 10 identical parts.
                </p>
                <p>
                  Use the{" "}
                  <button onClick={scrollToCalc} className="text-accent hover:underline font-semibold">online calculator</button>{" "}
                  to upload your file and get an instant estimate, or send the file directly and we'll quote within the hour.
                </p>
              </div>
            </div>

            {/* Why choose us */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Why choose us over large 3D printing platforms?
              </h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Services like Hubs (formerly 3D Hubs), Shapeways, and Treatstock are marketplaces — your order is routed to one of hundreds of print farms, and quality, communication, and turnaround can vary unpredictably. Here's how we compare:
                </p>
                <ul className="space-y-3">
                  <li>
                    <strong className="text-foreground">Direct communication.</strong> You message the person who actually prints your part, not a support bot or a ticket queue. Questions are answered in minutes, not days.
                  </li>
                  <li>
                    <strong className="text-foreground">Faster turnaround for small orders.</strong> No marketplace overhead, no multi-step routing, no review queues. Most orders ship within 3–7 business days from confirmation.
                  </li>
                  <li>
                    <strong className="text-foreground">No minimum order.</strong> Unlike many industrial services that require batch minimums of 5 or 10 units, we print single parts starting at €10.
                  </li>
                  <li>
                    <strong className="text-foreground">Honest file review.</strong> A real human checks every file before it goes to print. If your model has a wall that will fail, we tell you before we print it — not after, when the part arrives broken.
                  </li>
                  <li>
                    <strong className="text-foreground">Better pricing for small quantities.</strong> Platform margins, reseller fees, and volume penalties don't apply to us. You pay for filament and machine time, not someone else's infrastructure.
                  </li>
                  <li>
                    <strong className="text-foreground">WhatsApp access.</strong> For urgent or complex projects, you can reach us directly — something no platform-based service can match. We aim to respond within the hour during business hours.
                  </li>
                </ul>
                <p>
                  For businesses that need consistent supply, NDA, volume pricing, or a dedicated contact, see our{" "}
                  <Link to="/3d-printing-for-business-barcelona" className="text-accent hover:underline font-semibold">
                    3D Printing for Business
                  </Link>{" "}
                  page.
                </p>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Shipping — tracked delivery to Europe and worldwide
              </h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  We ship via trusted courier partners, dispatching from our Barcelona workshop. All orders are fully tracked — you receive a tracking number as soon as the parcel leaves us.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse not-prose">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-semibold text-foreground">Destination</th>
                        <th className="text-left py-2 font-semibold text-foreground">Typical delivery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        ["Spain", "1–2 business days"],
                        ["France, Portugal, Germany, Italy, Netherlands", "3–5 business days"],
                        ["Poland, Belgium, Austria, Switzerland, Sweden, Denmark", "4–6 business days"],
                        ["Rest of Europe", "4–7 business days"],
                        ["UK, US, Canada, Australia", "5–10 business days"],
                      ].map(([dest, time]) => (
                        <tr key={dest}>
                          <td className="py-2 pr-4 text-muted-foreground">{dest}</td>
                          <td className="py-2 text-muted-foreground">{time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  We pack every order carefully. Small parts ship in padded envelopes; larger items go in rigid boxes with foam protection. Fragile, thin-walled, or oversized prints receive extra packaging and labelling. Shipping costs are calculated at the quote stage based on your destination country and estimated parcel weight, and are always shown before you confirm your order.
                </p>
                <p>
                  For regular customers placing multiple orders per month, we can discuss consolidated shipping to reduce per-order costs. Contact us to arrange a shipping agreement.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container px-4 py-14 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="group border border-border/50 rounded-xl bg-card overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-foreground select-none list-none">
                  {q}
                  <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="bg-secondary/20 py-10">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-4">Related reading</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                to="/blog/precio-impresion-3d-barcelona"
                className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 hover:border-accent/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <Package className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm leading-snug group-hover:text-accent transition-colors">
                    How much does 3D printing cost?
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Real prices by size and material</p>
                </div>
                <ArrowRight className="w-4 h-4 text-accent ml-auto flex-shrink-0" />
              </Link>
              <Link
                to="/3d-printing-for-business-barcelona"
                className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 hover:border-accent/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <Globe className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm leading-snug group-hover:text-accent transition-colors">
                    3D Printing for Business
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Volume pricing, NDA, priority queue</p>
                </div>
                <ArrowRight className="w-4 h-4 text-accent ml-auto flex-shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to get a quote?
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Upload your STL or STEP file to our online calculator for an instant price estimate. A member of the team reviews every file and confirms the exact price within one hour. No account required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cta" size="xl" className="shadow-lg" onClick={scrollToCalc}>
              Get an Instant Quote
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="whatsapp-outline"
              size="xl"
              onClick={() => {
                capture('international_cta_click');
                window.open(
                  `${WHATSAPP_URL}?text=${encodeURIComponent("Hi, I'm based outside Spain and I'd like a quote for 3D printing.")}`,
                  "_blank"
                );
              }}
              className="group"
            >
              <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
              Message Us on WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </main>

    <Footer />
    <WhatsAppFloat />
  </div>
  );
};

export default InternationalServicePage;
