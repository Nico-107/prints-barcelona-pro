import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle, Loader2, Send, MessageCircle, ArrowRight,
  Users, Shield, Gift, DollarSign, BookOpen, Globe, CheckCircle2, X as XIcon, HelpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";
import { EuropeMapSVG } from "@/components/EuropeMapSVG";
import { GlobeMap, type GlobeCity } from "@/components/GlobeMap";

const SITE_URL = "https://www.dimension3dprints.com";
const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

interface Offer { title: string; body: string; }
interface Step { label: string; note: string; callout?: string; }
interface Comparison { alone: string; withUs: string; }
interface CityEntry { name: string; live: boolean; }
interface FAQ { q: string; a: string; }

interface MakersCopy {
  metaTitle: string; metaDesc: string;
  eyebrow: string; titleLine1: string; titleLine2: string; subtitle: string;
  ctaJoin: string; ctaWhatsApp: string; trust: string[];
  offerHeading: string; offerSubheading: string; offers: Offer[];
  howHeading: string; howSubheading: string; walkthroughHelpLabel: string; steps: Step[]; stepHighlight: string;
  whyHeading: string; whySubheading: string; alone: string; withUs: string; comparisons: Comparison[];
  citiesHeading: string; citiesSubheading: string; cityLive: string; cityExpanding: string;
  cities: CityEntry[];
  citySelectPlaceholder: string; cityOtherOption: string; cityOtherPlaceholder: string;
  reqHeading: string; reqSubheading: string; reqs: string[]; reqNote: string;
  formHeading: string; formSubheading: string;
  faqHeading: string; faqs: FAQ[];
  successTitle: string; successDesc: string;
}

const OFFER_ICONS = [Users, Shield, Gift, DollarSign, BookOpen, Globe];

// Live status for each city — index order must match buildCities() call order:
// Barcelona, Madrid, Valencia, Lisbon, Paris, Amsterdam, Berlin, Munich, Milan
const CITY_LIVE = [true, false, false, false, false, false, false, false, false];

function buildCities(names: string[]): CityEntry[] {
  return names.map((name, i) => ({ name, live: CITY_LIVE[i] ?? false }));
}

// All globe cities with real lat/lon coordinates
const GLOBE_CITIES: GlobeCity[] = [
  // Live
  { name: "Barcelona",    lat:  41.39, lon:   2.17, live: true },
  // Europe expanding
  { name: "Madrid",       lat:  40.42, lon:  -3.70, live: false },
  { name: "Lisbon",       lat:  38.72, lon:  -9.14, live: false },
  { name: "Valencia",     lat:  39.47, lon:  -0.38, live: false },
  { name: "Paris",        lat:  48.86, lon:   2.35, live: false },
  { name: "Amsterdam",    lat:  52.37, lon:   4.90, live: false },
  { name: "Munich",       lat:  48.14, lon:  11.58, live: false },
  { name: "Berlin",       lat:  52.52, lon:  13.40, live: false },
  { name: "Milan",        lat:  45.46, lon:   9.19, live: false },
  { name: "Rome",         lat:  41.90, lon:  12.50, live: false },
  { name: "Zurich",       lat:  47.38, lon:   8.54, live: false },
  { name: "Brussels",     lat:  50.85, lon:   4.35, live: false },
  { name: "Vienna",       lat:  48.21, lon:  16.37, live: false },
  { name: "Hamburg",      lat:  53.55, lon:   9.99, live: false },
  { name: "Stockholm",    lat:  59.33, lon:  18.07, live: false },
  { name: "Warsaw",       lat:  52.23, lon:  21.01, live: false },
  { name: "Prague",       lat:  50.07, lon:  14.44, live: false },
  { name: "Lyon",         lat:  45.75, lon:   4.83, live: false },
  { name: "Porto",        lat:  41.16, lon:  -8.63, live: false },
  // Americas expanding
  { name: "New York",     lat:  40.71, lon: -74.01, live: false },
  { name: "Chicago",      lat:  41.88, lon: -87.63, live: false },
  { name: "Los Angeles",  lat:  34.05, lon:-118.24, live: false },
  { name: "Miami",        lat:  25.77, lon: -80.19, live: false },
  { name: "Toronto",      lat:  43.65, lon: -79.38, live: false },
  { name: "Mexico City",  lat:  19.43, lon: -99.13, live: false },
  { name: "São Paulo",    lat: -23.55, lon: -46.63, live: false },
  { name: "Buenos Aires", lat: -34.60, lon: -58.38, live: false },
  // Asia / other expanding
  { name: "Tokyo",        lat:  35.69, lon: 139.69, live: false },
  { name: "Singapore",    lat:   1.35, lon: 103.82, live: false },
  { name: "Dubai",        lat:  25.20, lon:  55.27, live: false },
  { name: "Sydney",       lat: -33.87, lon: 151.21, live: false },
  { name: "Seoul",        lat:  37.57, lon: 126.98, live: false },
  { name: "Mumbai",       lat:  19.08, lon:  72.88, live: false },
];

// Maps globe English city name → index in c.cities dropdown (the 9 standard cities)
const GLOBE_TO_FORM_IDX: Record<string, number> = {
  "Barcelona": 0, "Madrid": 1, "Valencia": 2, "Lisbon": 3,
  "Paris": 4, "Amsterdam": 5, "Berlin": 6, "Munich": 7, "Milan": 8,
};

const COPY: Record<string, MakersCopy> = {
  en: {
    metaTitle: "Join the Maker Network | Dimension3D",
    metaDesc: "Own a 3D printer? Join the Dimension3D maker network. Get real clients without marketing, first month free, zero commission — ever.",
    eyebrow: "The Dimension3D Maker Network",
    titleLine1: "We bring the clients.",
    titleLine2: "You just print.",
    subtitle: "Join the maker network behind Dimension3D and receive real print orders — without doing any marketing yourself.",
    ctaJoin: "Apply to join",
    ctaWhatsApp: "Ask us a question",
    trust: ["First month free", "No commission, ever", "Just bring an FDM printer"],
    offerHeading: "What you get",
    offerSubheading: "Everything you need to start earning — from day one.",
    offers: [
      { title: "Clients sent directly to you", body: "We handle all marketing, SEO, and customer acquisition. You receive print-ready jobs — no sourcing required." },
      { title: "A trusted brand behind you", body: "Customers trust Dimension3D before they trust a listing. You inherit that trust without building it yourself." },
      { title: "First month completely free", body: "No upfront cost, no trial period. Print real orders, get paid, then decide if you want to continue." },
      { title: "Flat fee. Zero commission, ever.", body: "From just €2/month after the free period. We never take a cut of what you earn — you quote the job, you keep it all." },
      { title: "Tools & know-how to grow", body: "We show you how to list on Wallapop (Spain), Leboncoin (France), Kleinanzeigen (Germany) — pricing, file prep, quality tips." },
      { title: "A storefront you couldn't build alone", body: "A professional presence with real reviews, SEO rankings, and customer trust — built for you from day one." },
    ],
    howHeading: "How it works for makers",
    howSubheading: "Six steps — you only deal with the last three.",
    walkthroughHelpLabel: "How does it actually work?",
    steps: [
      { label: "You apply to join", note: "Fill in the form and tell us about your setup. We review every application personally, usually within 24 hours." },
      { label: "We contact you via WhatsApp", note: "Once approved, we reach out on WhatsApp to confirm your details and collect the contact — phone or email — where you want customer requests sent directly to you." },
      { label: "You're listed in your city", note: "We add you to your city on the Dimension3D site. When customers search for 3D printing in your area, they find you." },
      { label: "A customer request arrives at your contact", note: "When a customer requests a quote for your city, the request goes directly to your contact — not through us. You receive it, no middleman." },
      { label: "You quote, print, and get paid directly", note: "You and the customer deal directly from start to finish. You set the price, handle the print, and the customer pays you — Dimension3D never touches the money.", callout: "Zero commission — ever" },
      { label: "We charge a flat monthly fee", note: "From just €2/month after your free first month. That's our only charge — brand, SEO, and customer flow all included." },
    ],
    stepHighlight: "You get paid directly — we take zero commission",
    whyHeading: "Why us — not just Wallapop on your own?",
    whySubheading: "Both are valid options. Here's the honest difference.",
    alone: "Going it alone",
    withUs: "With Dimension3D",
    comparisons: [
      { alone: "Fight for visibility among hundreds of listings", withUs: "Clients already come to us — we route them to you" },
      { alone: "Build trust from zero reviews from scratch", withUs: "Inherit the brand's reviews and SEO authority" },
      { alone: "Trial and error on pricing and positioning", withUs: "Pricing guidance and templates from day one" },
      { alone: "Learn file prep, materials, tolerances alone", withUs: "We share what we know so you get it right first time" },
      { alone: "One language, one city, one listing", withUs: "Access to a growing cross-European network" },
    ],
    citiesHeading: "A network growing across Europe",
    citiesSubheading: "Barcelona is live. Major cities are next — the first maker in each gets priority placement and the best position.",
    cityLive: "Live",
    cityExpanding: "Expanding",
    cities: buildCities(["Barcelona","Madrid","Valencia","Lisbon","Paris","Amsterdam","Berlin","Munich","Milan"]),
    citySelectPlaceholder: "Select your city",
    cityOtherOption: "Other city (not listed)",
    cityOtherPlaceholder: "Enter your city",
    reqHeading: "What we're looking for",
    reqSubheading: "The bar is deliberately low. We want makers who care, not machines that scale.",
    reqs: [
      "At least one FDM printer in working order (any brand, any size)",
      "Reliability — if you commit to a job, you deliver it",
      "Willingness to describe your setup and capacity honestly",
    ],
    reqNote: "If you have a printer and care about doing good work, you qualify.",
    formHeading: "Apply to join",
    formSubheading: "Tell us about your setup and we'll get back to you within 24 hours.",
    faqHeading: "Maker FAQ",
    faqs: [
      { q: "What does it cost after the free month?", a: "From just €2/month — a flat fee with no commission and no hidden costs. The exact amount depends on your city and order volume. We agree it with you before your free month ends, no surprises." },
      { q: "How do I get paid?", a: "Directly by the customer. You quote the job, agree on the price, and the customer pays you. Dimension3D does not sit in the middle and takes zero cut from your earnings." },
      { q: "Do you take any commission?", a: "No, never. Our model is a flat monthly fee — everything you earn from printing goes to you. Simple and transparent, always." },
      { q: "What printer do I need?", a: "An FDM printer in working condition — any brand. Bambu Lab, Prusa, Creality, Artillery, Anycubic, Voron — all good. We currently focus on FDM; resin support may come later." },
      { q: "Which cities can I join from?", a: "We're live in Barcelona and actively expanding to Madrid, Valencia, Paris, Berlin, Amsterdam, Milan, Munich, and Lisbon. Apply now from any city — first applicants in each market get priority placement when it goes live." },
      { q: "How exactly do you bring me clients?", a: "Via Google organic search, social media, and word of mouth. We invest in SEO and brand-building so customers find Dimension3D first. When a customer requests a quote for your city, the request goes directly to your contact — phone or email — that you provided when joining. You receive it and deal with the customer directly, no middleman." },
    ],
    successTitle: "Application received!",
    successDesc: "We'll review your profile and get back to you within 24 hours via email or WhatsApp.",
  },
  es: {
    metaTitle: "Únete a la Red de Makers | Dimension3D",
    metaDesc: "¿Tienes una impresora 3D? Únete a la red de makers de Dimension3D. Recibe clientes reales sin hacer marketing, primer mes gratis, cero comisión.",
    eyebrow: "La Red de Makers de Dimension3D",
    titleLine1: "Nosotros traemos los clientes.",
    titleLine2: "Tú solo imprimes.",
    subtitle: "Únete a la red de makers de Dimension3D y recibe pedidos reales de impresión — sin hacer ningún marketing por tu cuenta.",
    ctaJoin: "Solicitar unirme",
    ctaWhatsApp: "Pregúntanos algo",
    trust: ["Primer mes gratis", "Sin comisión, nunca", "Solo necesitas una impresora FDM"],
    offerHeading: "Qué consigues",
    offerSubheading: "Todo lo que necesitas para empezar a ganar — desde el primer día.",
    offers: [
      { title: "Clientes enviados directamente a ti", body: "Nosotros gestionamos todo el marketing, el SEO y la captación. Tú recibes encargos listos para imprimir." },
      { title: "Una marca de confianza a tu espalda", body: "Los clientes confían en Dimension3D antes de confiar en un anuncio. Heredas esa confianza sin construirla tú." },
      { title: "Primer mes completamente gratis", body: "Sin coste inicial, sin período de prueba. Imprime pedidos reales, cobra y luego decide si quieres seguir." },
      { title: "Tarifa fija. Sin comisión, nunca.", body: "Desde solo €2/mes tras el período gratuito. Nunca nos llevamos un porcentaje — presupuestas el encargo y te lo quedas todo." },
      { title: "Herramientas y conocimiento para crecer", body: "Te enseñamos a publicar en Wallapop (España), Leboncoin (Francia), Kleinanzeigen (Alemania) — precios, preparación de archivos, calidad." },
      { title: "Un escaparate que no podrías construir solo", body: "Presencia profesional con reseñas reales, posicionamiento SEO y confianza del cliente — lista desde el primer día." },
    ],
    howHeading: "Cómo funciona para los makers",
    howSubheading: "Seis pasos — tú solo gestionas los tres últimos.",
    walkthroughHelpLabel: "¿Cómo funciona exactamente?",
    steps: [
      { label: "Solicitas unirte", note: "Rellena el formulario y cuéntanos sobre tu configuración. Revisamos cada solicitud personalmente, normalmente en 24 horas." },
      { label: "Te contactamos por WhatsApp", note: "Una vez aprobado, te escribimos por WhatsApp para confirmar tus datos y recoger el contacto — teléfono o email — donde quieres recibir las solicitudes de clientes directamente." },
      { label: "Apareces en tu ciudad", note: "Te añadimos a tu ciudad en el sitio de Dimension3D. Cuando los clientes buscan impresión 3D en tu zona, te encuentran a ti." },
      { label: "Una solicitud de cliente llega directamente a ti", note: "Cuando un cliente pide presupuesto para tu ciudad, la solicitud va directamente a tu contacto — no pasa por nosotros. Tú la recibes, sin intermediario." },
      { label: "Tú presupuestas, imprimes y cobras directamente", note: "Tú y el cliente tratan directamente de principio a fin. Fijas el precio, gestionas la impresión y el cliente te paga a ti — Dimension3D nunca toca el dinero.", callout: "Sin comisión, nunca" },
      { label: "Nosotros cobramos una tarifa mensual fija", note: "Desde solo €2/mes después del primer mes gratuito. Es el único cargo — marca, SEO y flujo de clientes incluidos." },
    ],
    stepHighlight: "El cliente te paga directamente — nosotros no cobramos comisión",
    whyHeading: "¿Por qué nosotros y no solo Wallapop?",
    whySubheading: "Las dos opciones son válidas. Esta es la diferencia honesta.",
    alone: "Por tu cuenta",
    withUs: "Con Dimension3D",
    comparisons: [
      { alone: "Pelear por visibilidad entre cientos de anuncios", withUs: "Los clientes ya vienen a nosotros — te los enviamos a ti" },
      { alone: "Construir confianza desde cero reseñas", withUs: "Heredas las reseñas y la autoridad SEO de la marca" },
      { alone: "Prueba y error en precios y posicionamiento", withUs: "Guía de precios y plantillas desde el primer día" },
      { alone: "Aprender preparación de archivos y materiales solo", withUs: "Compartimos lo que sabemos para que aciertes a la primera" },
      { alone: "Un idioma, una ciudad, un anuncio", withUs: "Acceso a una red europea en crecimiento" },
    ],
    citiesHeading: "Una red que crece por toda Europa",
    citiesSubheading: "Barcelona ya está en marcha. Las grandes ciudades son las siguientes — el primer maker de cada una tiene la mejor posición.",
    cityLive: "Activo",
    cityExpanding: "En expansión",
    cities: buildCities(["Barcelona","Madrid","Valencia","Lisboa","París","Ámsterdam","Berlín","Múnich","Milán"]),
    citySelectPlaceholder: "Selecciona tu ciudad",
    cityOtherOption: "Otra ciudad (no listada)",
    cityOtherPlaceholder: "Indica tu ciudad",
    reqHeading: "Qué buscamos",
    reqSubheading: "El listón es deliberadamente bajo. Queremos makers que se impliquen, no máquinas que escalen.",
    reqs: [
      "Al menos una impresora FDM en buen estado (cualquier marca, cualquier tamaño)",
      "Fiabilidad — si te comprometes con un encargo, lo entregas",
      "Disposición a describir tu equipamiento y capacidad con honestidad",
    ],
    reqNote: "Si tienes una impresora y te importa hacer buen trabajo, cumples los requisitos.",
    formHeading: "Solicitar unirse",
    formSubheading: "Cuéntanos tu configuración y te respondemos en 24 horas.",
    faqHeading: "Preguntas de makers",
    faqs: [
      { q: "¿Cuánto cuesta después del mes gratis?", a: "Desde solo €2/mes — una tarifa fija sin comisión y sin costes ocultos. El importe exacto depende de tu ciudad y volumen. Lo acordamos contigo antes de que termine tu mes gratuito, sin sorpresas." },
      { q: "¿Cómo me pagan?", a: "Directamente el cliente. Tú presupuestas el encargo, acordáis el precio y el cliente te paga. Dimension3D no interviene en el pago y no se lleva ningún porcentaje." },
      { q: "¿Cobráis alguna comisión?", a: "No, nunca. Nuestro modelo es una tarifa mensual fija — todo lo que ganas imprimiendo es tuyo. Simple y transparente, siempre." },
      { q: "¿Qué impresora necesito?", a: "Una impresora FDM en buen estado — cualquier marca. Bambu Lab, Prusa, Creality, Artillery, Anycubic, Voron — todas valen. Actualmente nos centramos en FDM; la resina puede añadirse más adelante." },
      { q: "¿Desde qué ciudades puedo unirme?", a: "Estamos activos en Barcelona y expandiéndonos a Madrid, Valencia, París, Berlín, Ámsterdam, Milán, Múnich y Lisboa. Apúntate ahora — los primeros solicitantes en cada ciudad tienen prioridad cuando se activa." },
      { q: "¿Cómo me traéis clientes exactamente?", a: "A través de búsqueda orgánica en Google, redes sociales y boca a boca. Invertimos en SEO para que los clientes encuentren Dimension3D primero. Cuando un cliente pide presupuesto para tu ciudad, la solicitud llega directamente a tu contacto — teléfono o email — que nos diste al unirte. Tú la recibes y tratas con el cliente directamente, sin intermediario." },
    ],
    successTitle: "¡Solicitud recibida!",
    successDesc: "Revisaremos tu perfil y te responderemos en 24 horas por email o WhatsApp.",
  },
  ca: {
    metaTitle: "Uneix-te a la Xarxa de Makers | Dimension3D",
    metaDesc: "Tens una impressora 3D? Uneix-te a la xarxa de makers de Dimension3D. Rep clients reals sense màrqueting, primer mes gratis, zero comissió.",
    eyebrow: "La Xarxa de Makers de Dimension3D",
    titleLine1: "Nosaltres portem els clients.",
    titleLine2: "Tu simplement imprimeixes.",
    subtitle: "Uneix-te a la xarxa de makers de Dimension3D i rep comandes reals d'impressió — sense fer cap màrqueting per compte teu.",
    ctaJoin: "Sol·licitar unir-me",
    ctaWhatsApp: "Fes-nos una pregunta",
    trust: ["Primer mes gratis", "Sense comissió, mai", "Només necessites una impressora FDM"],
    offerHeading: "Què aconsegueixes",
    offerSubheading: "Tot el que necessites per començar a guanyar — des del primer dia.",
    offers: [
      { title: "Clients enviats directament a tu", body: "Nosaltres gestionem tot el màrqueting, el SEO i la captació. Tu reps encàrrecs a punt per imprimir." },
      { title: "Una marca de confiança al teu darrere", body: "Els clients confien en Dimension3D abans de confiar en un anunci. Heretes aquesta confiança sense construir-la tu." },
      { title: "Primer mes completament gratis", body: "Sense cost inicial, sense període de prova. Imprimeix comandes reals, cobra i llavors decideix si vols continuar." },
      { title: "Tarifa fixa. Sense comissió, mai.", body: "Des de només €2/mes després del període gratuït. Mai ens emportem un percentatge — pressupostes l'encàrrec i te'l quedes tot." },
      { title: "Eines i coneixement per créixer", body: "T'ensenyem a publicar a Wallapop (Espanya), Leboncoin (França), Kleinanzeigen (Alemanya) — preus, preparació d'arxius, qualitat." },
      { title: "Un aparador que no podries construir sol", body: "Presència professional amb ressenyes reals, posicionament SEO i confiança del client — llesta des del primer dia." },
    ],
    howHeading: "Com funciona per als makers",
    howSubheading: "Sis passos — tu només gestiones els tres últims.",
    walkthroughHelpLabel: "Com funciona exactament?",
    steps: [
      { label: "Sol·licites unir-te", note: "Omple el formulari i explica'ns la teva configuració. Revisem cada sol·licitud personalment, normalment en 24 hores." },
      { label: "Et contactem per WhatsApp", note: "Un cop aprovat, t'escribim per WhatsApp per confirmar les teves dades i recollir el contacte — telèfon o email — on vols rebre les sol·licituds dels clients directament." },
      { label: "Apareixeràs a la teva ciutat", note: "T'afegim a la teva ciutat al lloc de Dimension3D. Quan els clients cerquen impressió 3D a la teva zona, et troben a tu." },
      { label: "Una sol·licitud d'un client arriba directament a tu", note: "Quan un client demana pressupost per a la teva ciutat, la sol·licitud va directament al teu contacte — no passa per nosaltres. Tu la reps, sense intermediari." },
      { label: "Tu pressuposta, imprimeixes i cobres directament", note: "Tu i el client tracten directament de principi a fi. Fixes el preu, gestiones la impressió i el client et paga a tu — Dimension3D mai toca els diners.", callout: "Sense comissió, mai" },
      { label: "Cobrem una tarifa mensual fixa", note: "Des de només €2/mes després del primer mes gratuït. És l'únic càrrec — marca, SEO i flux de clients inclosos." },
    ],
    stepHighlight: "El client et paga directament — nosaltres no cobrem comissió",
    whyHeading: "Per què nosaltres i no només Wallapop?",
    whySubheading: "Totes dues opcions són vàlides. Aquesta és la diferència honesta.",
    alone: "Tot sol",
    withUs: "Amb Dimension3D",
    comparisons: [
      { alone: "Lluitar per visibilitat entre centenars d'anuncis", withUs: "Els clients ja vénen a nosaltres — te'ls enviem a tu" },
      { alone: "Construir confiança des de zero ressenyes", withUs: "Heretes les ressenyes i l'autoritat SEO de la marca" },
      { alone: "Assaig i error en preus i posicionament", withUs: "Guia de preus i plantilles des del primer dia" },
      { alone: "Aprendre preparació d'arxius i materials tot sol", withUs: "Compartim el que sabem perquè encertis a la primera" },
      { alone: "Un idioma, una ciutat, un anunci", withUs: "Accés a una xarxa europea en creixement" },
    ],
    citiesHeading: "Una xarxa que creix per tota Europa",
    citiesSubheading: "Barcelona ja és en marxa. Les grans ciutats són les següents — el primer maker de cada una té la millor posició.",
    cityLive: "Actiu",
    cityExpanding: "En expansió",
    cities: buildCities(["Barcelona","Madrid","València","Lisboa","París","Amsterdam","Berlín","Munic","Milà"]),
    citySelectPlaceholder: "Selecciona la teva ciutat",
    cityOtherOption: "Altra ciutat (no llistada)",
    cityOtherPlaceholder: "Indica la teva ciutat",
    reqHeading: "Què busquem",
    reqSubheading: "El llistó és deliberadament baix. Volem makers que s'impliquin, no màquines que escalen.",
    reqs: [
      "Almenys una impressora FDM en bon estat (qualsevol marca, qualsevol mida)",
      "Fiabilitat — si et compromets amb un encàrrec, el lliures",
      "Disposició a descriure el teu equipament i capacitat amb honestedat",
    ],
    reqNote: "Si tens una impressora i t'importa fer una bona feina, compleixes els requisits.",
    formHeading: "Sol·licitar unir-se",
    formSubheading: "Explica'ns la teva configuració i et respondrem en 24 hores.",
    faqHeading: "Preguntes de makers",
    faqs: [
      { q: "Quant costa després del mes gratis?", a: "Des de només €2/mes — una tarifa fixa sense comissió i sense costos ocults. L'import exacte depèn de la teva ciutat i volum. Ho acordem amb tu abans que acabi el mes gratuït, sense sorpreses." },
      { q: "Com em paguen?", a: "Directament el client. Tu pressupostes l'encàrrec, acordeu el preu i el client et paga. Dimension3D no intervé en el pagament i no s'emporta cap percentatge." },
      { q: "Cobreu alguna comissió?", a: "No, mai. El nostre model és una tarifa mensual fixa — tot el que guanyes imprimint és teu. Simple i transparent, sempre." },
      { q: "Quina impressora necessito?", a: "Una impressora FDM en bon estat — qualsevol marca. Bambu Lab, Prusa, Creality, Artillery, Anycubic, Voron — totes valen. Actualment ens centrem en FDM; la resina pot afegir-se més endavant." },
      { q: "Des de quines ciutats puc unir-me?", a: "Estem actius a Barcelona i expandint-nos a Madrid, València, París, Berlín, Amsterdam, Milà, Munic i Lisboa. Apunta't ara — els primers sol·licitants en cada ciutat tenen prioritat quan s'activa." },
      { q: "Com em porteu clients exactament?", a: "A través de cerca orgànica a Google, xarxes socials i boca-orella. Invertim en SEO perquè els clients trobin Dimension3D primer. Quan un client demana pressupost per a la teva ciutat, la sol·licitud arriba directament al teu contacte — telèfon o email — que ens vas donar en unir-te. Tu la reps i tractes amb el client directament, sense intermediari." },
    ],
    successTitle: "Sol·licitud rebuda!",
    successDesc: "Revisarem el teu perfil i et respondrem en 24 hores per email o WhatsApp.",
  },
};

const Makers = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const c = COPY[language] ?? COPY.es;
  const formRef = useRef<HTMLElement>(null);

  // Form state — unchanged from original
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

  // City select state
  const [citySelectVal, setCitySelectVal] = useState<string>("");
  const [cityIsOther, setCityIsOther] = useState(false);

  useEffect(() => { formStartTimeRef.current = Date.now(); }, [isSubmitted]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Globe click → match localized dropdown name or fall into "other" with pre-fill.
  // Cities outside the 9-city dropdown (Rome, Tokyo, etc.) are pre-filled into the
  // custom city input so the maker never has to type their city manually.
  const handleGlobeCityClick = (englishName: string) => {
    const idx = GLOBE_TO_FORM_IDX[englishName];
    if (idx !== undefined && idx < c.cities.length) {
      handleCitySelect(c.cities[idx].name);
    } else {
      setCitySelectVal("__other__");
      setCityIsOther(true);
      setCity(englishName);
      scrollToForm();
    }
  };

  const handleCitySelect = (cityName: string) => {
    setCitySelectVal(cityName);
    setCityIsOther(false);
    setCity(cityName);
    scrollToForm();
  };

  const handleCitySelectChange = (val: string) => {
    setCitySelectVal(val);
    if (val === "__other__") {
      setCityIsOther(true);
      setCity("");
    } else {
      setCityIsOther(false);
      setCity(val);
    }
  };

  const handleWhatsApp = () => {
    capture('whatsapp_click', { source: 'makers_page' });
    const msg =
      language === "ca" ? "Hola, m'interessa unir-me a la xarxa de makers de Dimension3D." :
      language === "es" ? "Hola, me interesa unirme a la red de makers de Dimension3D." :
      "Hi, I'm interested in joining the Dimension3D maker network.";
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Supabase insert — completely unchanged
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

      // Fire-and-forget email notification — errors are swallowed and never block the user
      supabase.functions.invoke("send-maker-application", {
        body: {
          name, email, phone: phone || null, city, printers,
          message: message || null, website: honeypot,
          formStartTime: formStartTimeRef.current,
        },
      }).catch((err) => console.error("Maker email notification failed:", err));

      setIsSubmitted(true);
      capture("maker application submitted", { has_phone: !!phone, has_message: !!message });
      toast({ title: t("makers.form.success.title"), description: t("makers.form.success.desc") });
    } catch (error: any) {
      console.error("Maker application error:", error);
      toast({ title: t("makers.form.error.title"), description: t("makers.form.error.desc"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang={language} />
        <title>{c.metaTitle}</title>
        <meta name="description" content={c.metaDesc} />
        <link rel="canonical" href={`${SITE_URL}/makers`} />
        <link rel="alternate" hrefLang="es" href={`${SITE_URL}/makers`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/makers`} />
        <link rel="alternate" hrefLang="ca" href={`${SITE_URL}/makers`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/makers`} />
        <meta property="og:title" content={c.metaTitle} />
        <meta property="og:description" content={c.metaDesc} />
        <meta property="og:url" content={`${SITE_URL}/makers`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <LaunchOfferBanner />
      <Header />

      <main className="pt-16">

        {/* ── 1. HERO ──────────────────────────────────────────────── */}
        <section className="relative py-24 md:py-32 hero-gradient overflow-hidden">
          {/* Diagonal amber stripe decoration (right half) */}
          <div
            className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(-55deg, rgba(245,158,11,0.06) 0, rgba(245,158,11,0.06) 1px, transparent 0, transparent 22px)",
            }}
          />
          <div className="absolute top-20 left-8 w-40 h-40 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

          <div className="container relative z-10 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">

              {/* Left: copy */}
              <div>
                <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6">
                  {c.eyebrow}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
                  {c.titleLine1}
                  <br />
                  <span className="text-cta">{c.titleLine2}</span>
                </h1>
                <p className="text-lg text-primary-foreground/85 mb-10 max-w-xl leading-relaxed">
                  {c.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Button variant="cta" size="xl" onClick={scrollToForm} className="shadow-lg gap-2">
                    {c.ctaJoin}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button variant="whatsapp-outline" size="xl" onClick={handleWhatsApp} className="group gap-2">
                    <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
                    {c.ctaWhatsApp}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3 mb-6">
                  {c.trust.map((label) => (
                    <span key={label} className="inline-flex items-center gap-1.5 bg-primary-foreground/10 border border-primary-foreground/15 rounded-full px-4 py-1.5 text-sm text-primary-foreground/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cta flex-shrink-0" />
                      {label}
                    </span>
                  ))}
                </div>
                <Link
                  to="/maker-guide"
                  className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/55 hover:text-primary-foreground/80 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  {c.walkthroughHelpLabel}
                </Link>
              </div>

              {/* Right: 3D interactive globe (desktop only) */}
              <div className="hidden lg:flex items-center justify-center">
                <div
                  className="relative w-full max-w-xl overflow-hidden rounded-2xl"
                  style={{ aspectRatio: "800/660" }}
                >
                  <GlobeMap
                    cities={GLOBE_CITIES}
                    onCityClick={handleGlobeCityClick}
                    liveLabel={c.cityLive}
                    expandingLabel={c.cityExpanding}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 80L1440 80L1440 40C1200 70 960 80 720 75C480 70 240 50 0 40Z" fill="hsl(var(--background))"/>
            </svg>
          </div>
        </section>

        {/* ── 2. WHAT YOU GET ──────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{c.offerHeading}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{c.offerSubheading}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {c.offers.map((offer, i) => {
                const Icon = OFFER_ICONS[i];
                return (
                  <div key={i} className="p-6 rounded-xl border border-border/50 bg-card hover:border-accent/50 hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{offer.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 3. HOW IT WORKS ──────────────────────────────────────── */}
        <section id="maker-walkthrough" className="py-20 md:py-28 bg-secondary/30">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{c.howHeading}</h2>
              <p className="text-muted-foreground">{c.howSubheading}</p>
            </div>
            <div className="max-w-2xl mx-auto space-y-4">
              {c.steps.map((step, i) => (
                <div key={i} className={`flex items-start gap-5 rounded-2xl p-6 border transition-all ${
                  i === 4
                    ? "border-accent/50 bg-accent/5 shadow-md"
                    : "border-border bg-card"
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold ${
                    i === 4 ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${i === 4 ? "text-accent" : "text-foreground"}`}>
                      {step.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.note}</p>
                    {step.callout && (
                      <span className="inline-flex items-center gap-1.5 mt-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-3 py-1 text-xs font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        {step.callout}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-5 py-2.5 text-sm font-semibold text-accent">
                <CheckCircle2 className="w-4 h-4" />
                {c.stepHighlight}
              </span>
            </div>
          </div>
        </section>

        {/* ── 4. WHY US (comparison) ───────────────────────────────── */}
        <section className="py-20 md:py-28 hero-gradient">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">{c.whyHeading}</h2>
              <p className="text-primary-foreground/70">{c.whySubheading}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Going it alone */}
              <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                    <XIcon className="w-4 h-4 text-primary-foreground/40" />
                  </div>
                  <h3 className="font-semibold text-primary-foreground/50">{c.alone}</h3>
                </div>
                <ul className="space-y-4">
                  {c.comparisons.map((comp, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary-foreground/25 font-bold mt-0.5 leading-none">✕</span>
                      <span className="text-sm text-primary-foreground/55">{comp.alone}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* With Dimension3D */}
              <div className="bg-accent/10 border border-accent/35 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="font-semibold text-accent">{c.withUs}</h3>
                </div>
                <ul className="space-y-4">
                  {c.comparisons.map((comp, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-whatsapp flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-primary-foreground/90">{comp.withUs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. CITIES MAP ────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="container px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{c.citiesHeading}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{c.citiesSubheading}</p>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mb-8 text-sm">
              <span className="flex items-center gap-2 text-whatsapp font-semibold">
                <span className="w-3 h-3 rounded-full bg-whatsapp inline-block" />
                {c.cityLive}
              </span>
              <span className="flex items-center gap-2 text-accent font-medium">
                <span className="w-3 h-3 rounded-full bg-accent/70 inline-block" />
                {c.cityExpanding}
              </span>
            </div>

            {/* Desktop: interactive SVG map with mathematically-correct city positions */}
            <div
              className="hidden md:block w-full max-w-2xl mx-auto select-none"
              style={{ aspectRatio: "800/660" }}
            >
              <EuropeMapSVG
                variant="light"
                onCityClick={(idx) => handleCitySelect(c.cities[idx].name)}
              />
            </div>

            {/* Mobile: pill grid */}
            <div className="md:hidden flex flex-wrap gap-3 justify-center">
              {c.cities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all active:scale-95 ${
                    city.live
                      ? "bg-whatsapp/15 border-whatsapp/40 text-whatsapp"
                      : "bg-accent/10 border-accent/25 text-accent hover:bg-accent/20"
                  }`}
                >
                  {city.live && <span className="w-2 h-2 rounded-full bg-whatsapp animate-pulse" />}
                  {city.name}
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-8">
              {language === "ca"
                ? "Fes clic en una ciutat per sol·licitar-hi i pre-emplenar el formulari."
                : language === "es"
                ? "Haz clic en una ciudad para postularte desde allí y prerellenar el formulario."
                : "Click a city to apply from there — it pre-fills the form below."}
            </p>
          </div>
        </section>

        {/* ── 6. WHAT WE'RE LOOKING FOR ────────────────────────────── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{c.reqHeading}</h2>
              <p className="text-muted-foreground mb-8">{c.reqSubheading}</p>
              <div className="space-y-3 text-left max-w-md mx-auto mb-6">
                {c.reqs.map((req) => (
                  <div key={req} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{req}</span>
                  </div>
                ))}
              </div>
              <p className="text-accent font-semibold text-lg mb-6">{c.reqNote}</p>
              <Button variant="cta" size="lg" onClick={scrollToForm} className="gap-2">
                {c.ctaJoin}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── 7. APPLICATION FORM ──────────────────────────────────── */}
        <section ref={formRef} id="makers-form" className="py-20 md:py-28 bg-secondary/30">
          <div className="container px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">

              {/* Left: context (sticky on desktop) */}
              <div className="lg:sticky lg:top-24">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{c.formHeading}</h2>
                <p className="text-lg text-muted-foreground mb-8">{c.formSubheading}</p>
                <div className="space-y-3 mb-6">
                  {c.reqs.map((req) => (
                    <div key={req} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{req}</span>
                    </div>
                  ))}
                </div>
                <p className="text-accent font-semibold">{c.reqNote}</p>
              </div>

              {/* Right: form */}
              <div>
                {isSubmitted ? (
                  <div className="bg-card rounded-2xl p-8 border border-border card-shadow text-center">
                    <div className="w-16 h-16 rounded-full bg-whatsapp/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-whatsapp" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{c.successTitle}</h3>
                    <p className="text-muted-foreground">{c.successDesc}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 border border-border card-shadow space-y-4 relative">
                    {/* Honeypot — unchanged */}
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

                    {/* City — now a Select with network cities */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t("makers.form.city")}</label>
                      <Select value={citySelectVal} onValueChange={handleCitySelectChange} disabled={isLoading}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder={c.citySelectPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {c.cities.map((cityOpt) => (
                            <SelectItem key={cityOpt.name} value={cityOpt.name} textValue={cityOpt.name}>
                              <span className="flex items-center gap-2">
                                {cityOpt.live
                                  ? <span className="w-2 h-2 rounded-full bg-whatsapp inline-block flex-shrink-0" />
                                  : <span className="w-2 h-2 rounded-full bg-accent/50 inline-block flex-shrink-0" />
                                }
                                {cityOpt.name}
                                {cityOpt.live && (
                                  <span className="text-xs text-whatsapp ml-1 font-medium">{c.cityLive}</span>
                                )}
                              </span>
                            </SelectItem>
                          ))}
                          <SelectItem value="__other__">{c.cityOtherOption}</SelectItem>
                        </SelectContent>
                      </Select>
                      {cityIsOther && (
                        <Input
                          className="h-12 mt-2"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder={c.cityOtherPlaceholder}
                          disabled={isLoading}
                          autoFocus
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t("makers.form.printers")}</label>
                      <Input value={printers} onChange={(e) => setPrinters(e.target.value)} placeholder={t("makers.form.printersPlaceholder")} required className="h-12" disabled={isLoading} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t("makers.form.message")}</label>
                      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("makers.form.messagePlaceholder")} rows={4} disabled={isLoading} maxLength={2000} />
                    </div>

                    <Button type="submit" variant="cta" size="lg" className="w-full gap-2" disabled={isLoading}>
                      {isLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" />{t("makers.form.submitting")}</>
                        : <><Send className="w-4 h-4" />{t("makers.form.submit")}</>}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. FAQ ───────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">{c.faqHeading}</h2>
              <Accordion type="single" collapsible className="w-full">
                {c.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-medium hover:text-accent hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-10 text-center">
                <Button variant="cta" size="lg" onClick={scrollToForm} className="gap-2">
                  {c.ctaJoin}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
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
