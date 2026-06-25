import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
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
  Users, Shield, Gift, DollarSign, BookOpen, Globe, CheckCircle2, X as XIcon,
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

const SITE_URL = "https://www.dimension3dprints.com";
const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

interface Offer { title: string; body: string; }
interface Step { label: string; note: string; }
interface Comparison { alone: string; withUs: string; }
interface CityEntry { name: string; live: boolean; x: number; y: number; labelSide: "above" | "below" | "left" | "right"; }
interface FAQ { q: string; a: string; }

interface MakersCopy {
  metaTitle: string; metaDesc: string;
  eyebrow: string; titleLine1: string; titleLine2: string; subtitle: string;
  ctaJoin: string; ctaWhatsApp: string; trust: string[];
  offerHeading: string; offerSubheading: string; offers: Offer[];
  howHeading: string; howSubheading: string; steps: Step[]; stepHighlight: string;
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

// City positions calibrated to europe-dots.png (360×360 px, equirectangular ~lon -10→44°E, lat 35→58°N)
// Formula (verified pixel-exact): x% = 26.5 + lon×1.726,  y% = 200.9 − lat×3.22
const CITY_COORDS: Omit<CityEntry, "name">[] = [
  { live: true,  x: 30, y: 68, labelSide: "right"  }, // Barcelona  2.17°E 41.4°N
  { live: false, x: 20, y: 71, labelSide: "left"   }, // Madrid    -3.70°E 40.4°N
  { live: false, x: 26, y: 74, labelSide: "below"  }, // Valencia  -0.38°E 39.5°N
  { live: false, x: 11, y: 76, labelSide: "right"  }, // Lisbon    -9.14°E 38.7°N
  { live: false, x: 31, y: 44, labelSide: "left"   }, // Paris      2.35°E 48.9°N
  { live: false, x: 35, y: 32, labelSide: "left"   }, // Amsterdam  4.90°E 52.4°N
  { live: false, x: 50, y: 32, labelSide: "right"  }, // Berlin    13.41°E 52.5°N
  { live: false, x: 47, y: 46, labelSide: "right"  }, // Munich    11.58°E 48.1°N
  { live: false, x: 42, y: 55, labelSide: "left"   }, // Milan      9.19°E 45.5°N
];

const LABEL_CLS: Record<"above" | "below" | "left" | "right", string> = {
  above: "bottom-full mb-1 left-1/2 -translate-x-1/2",
  below: "top-full mt-1 left-1/2 -translate-x-1/2",
  left:  "right-full mr-2 top-1/2 -translate-y-1/2 text-right",
  right: "left-full ml-2 top-1/2 -translate-y-1/2",
};

function buildCities(names: string[]): CityEntry[] {
  return names.map((name, i) => ({ name, ...CITY_COORDS[i] }));
}

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
    howHeading: "How it works",
    howSubheading: "Five steps. You just handle step three.",
    steps: [
      { label: "A customer finds Dimension3D", note: "Via Google, Instagram, or word of mouth — we handle all customer acquisition." },
      { label: "We send the job to you", note: "Print-ready file, material spec, expected quality, and deadline — everything you need to start." },
      { label: "You confirm and print", note: "Accept or decline any job, any time. No mandatory commitment, no minimum volume." },
      { label: "The customer pays you directly", note: "You set your price. You receive payment. Dimension3D takes zero cut — not a penny." },
      { label: "You keep it all", note: "Minus one small flat monthly fee. That's our entire business model with you." },
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
      { q: "How exactly do you bring me clients?", a: "Via Google organic search, social media, and word of mouth. We invest in SEO and brand-building so customers find Dimension3D first. When a job fits your location and printer, we send it directly via WhatsApp." },
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
    howHeading: "Cómo funciona",
    howSubheading: "Cinco pasos. Tú solo te encargas del tercero.",
    steps: [
      { label: "Un cliente encuentra Dimension3D", note: "A través de Google, Instagram o boca a boca — nosotros gestionamos toda la captación." },
      { label: "Te enviamos el encargo", note: "Archivo listo, especificación de material, calidad esperada y plazo — todo lo que necesitas para empezar." },
      { label: "Confirmas e imprimes", note: "Acepta o rechaza cualquier encargo, en cualquier momento. Sin compromiso obligatorio, sin mínimo de volumen." },
      { label: "El cliente te paga directamente a ti", note: "Tú fijas el precio y recibes el pago. Dimension3D no se lleva ningún porcentaje — ni un céntimo." },
      { label: "Te lo quedas todo", note: "Menos una pequeña tarifa mensual fija. Eso es todo nuestro modelo contigo." },
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
      { q: "¿Cómo me traéis clientes exactamente?", a: "A través de búsqueda orgánica en Google, redes sociales y boca a boca. Invertimos en SEO para que los clientes nos encuentren primero. Cuando llega un encargo que encaja con tu ubicación e impresora, te lo enviamos directamente por WhatsApp." },
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
    howHeading: "Com funciona",
    howSubheading: "Cinc passos. Tu només t'encarregues del tercer.",
    steps: [
      { label: "Un client troba Dimension3D", note: "A través de Google, Instagram o boca-orella — nosaltres gestionem tota la captació." },
      { label: "T'enviem l'encàrrec", note: "Arxiu llest, especificació de material, qualitat esperada i termini — tot el que necessites per començar." },
      { label: "Confirmes i imprimeixes", note: "Accepta o rebutja qualsevol encàrrec, en qualsevol moment. Sense compromís obligatori, sense mínim de volum." },
      { label: "El client et paga directament a tu", note: "Tu fixes el preu i reps el pagament. Dimension3D no s'emporta cap percentatge — ni un cèntim." },
      { label: "Te'l quedes tot", note: "Menys una petita tarifa mensual fixa. Aquest és tot el nostre model amb tu." },
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
      { q: "Com em porteu clients exactament?", a: "A través de cerca orgànica a Google, xarxes socials i boca-orella. Invertim en SEO perquè els clients ens trobin primer. Quan arriba un encàrrec que encaixa amb la teva ubicació i impressora, te'l enviem directament per WhatsApp." },
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
                <div className="flex flex-wrap gap-3">
                  {c.trust.map((label) => (
                    <span key={label} className="inline-flex items-center gap-1.5 bg-primary-foreground/10 border border-primary-foreground/15 rounded-full px-4 py-1.5 text-sm text-primary-foreground/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cta flex-shrink-0" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Europe map image (desktop only) */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-full max-w-md" style={{ aspectRatio: "1" }}>
                  {/* Map image — inverted + brightened for light dots on dark hero */}
                  <img
                    src="/europe-dots.png"
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                    style={{ filter: "invert(1) brightness(1.8)", opacity: 0.35 }}
                  />
                  {/* Connection lines Barcelona → other cities */}
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    {c.cities.filter(city => !city.live).map(city => (
                      <line key={city.name}
                        x1={30} y1={68} x2={city.x} y2={city.y}
                        stroke="white" strokeOpacity="0.15" strokeWidth="0.5" strokeDasharray="1.5 2.5" />
                    ))}
                  </svg>
                  {/* "MAKER NETWORK" label */}
                  <div className="absolute top-3 left-0 right-0 text-center pointer-events-none">
                    <span className="text-[10px] text-white/30 font-medium tracking-widest uppercase">Maker Network</span>
                  </div>
                  {/* City markers */}
                  {c.cities.map((city) => (
                    <div
                      key={city.name}
                      className="absolute"
                      style={{ left: `${city.x}%`, top: `${city.y}%`, transform: "translate(-50%,-50%)" }}
                      aria-hidden="true"
                    >
                      {city.live ? (
                        <span className="relative flex items-center justify-center w-5 h-5">
                          <span className="absolute w-9 h-9 rounded-full bg-accent/25 animate-ping" />
                          <span className="relative w-5 h-5 rounded-full bg-accent shadow-lg ring-2 ring-white/40" />
                        </span>
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-white/55 border border-white/25 shadow block" />
                      )}
                      <span className={`absolute whitespace-nowrap text-[10px] font-medium pointer-events-none leading-none ${
                        city.live ? "text-accent" : "text-white/45"
                      } ${LABEL_CLS[city.labelSide]}`}>
                        {city.name}
                      </span>
                    </div>
                  ))}
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
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{c.howHeading}</h2>
              <p className="text-muted-foreground">{c.howSubheading}</p>
            </div>
            <div className="max-w-2xl mx-auto space-y-4">
              {c.steps.map((step, i) => (
                <div key={i} className={`flex items-start gap-5 rounded-2xl p-6 border transition-all ${
                  i === 3
                    ? "border-accent/50 bg-accent/5 shadow-md"
                    : "border-border bg-card"
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold ${
                    i === 3 ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-1 ${i === 3 ? "text-accent" : "text-foreground"}`}>
                      {step.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.note}</p>
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

            {/* Desktop: geographic map with europe-dots.png image */}
            <div
              className="hidden md:block relative w-full max-w-lg mx-auto select-none rounded-xl overflow-hidden border border-border/50"
              style={{ aspectRatio: "1" }}
            >
              <img
                src="/europe-dots.png"
                alt=""
                aria-hidden="true"
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                style={{ opacity: 0.55 }}
              />
              {/* City markers — % positions calibrated to europe-dots.png pixel coordinates */}
              {c.cities.map((city) => (
                <button
                  key={city.name}
                  className="absolute group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full z-10"
                  style={{ left: `${city.x}%`, top: `${city.y}%`, transform: "translate(-50%,-50%)" }}
                  onClick={() => handleCitySelect(city.name)}
                  title={city.name}
                  aria-label={`${city.name} — ${city.live ? c.cityLive : c.cityExpanding}. Click to apply from this city.`}
                >
                  {city.live ? (
                    <span className="relative flex items-center justify-center w-6 h-6">
                      <span className="absolute w-10 h-10 rounded-full bg-whatsapp/25 animate-ping" />
                      <span className="relative w-6 h-6 rounded-full bg-whatsapp shadow-lg shadow-whatsapp/40 ring-2 ring-white" />
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-accent border-2 border-white shadow block group-hover:scale-125 transition-all duration-200" />
                  )}
                  <span className={`absolute whitespace-nowrap text-xs font-semibold pointer-events-none drop-shadow-sm ${
                    city.live ? "text-whatsapp" : "text-foreground/75 group-hover:text-foreground"
                  } ${LABEL_CLS[city.labelSide]}`}>
                    {city.name}
                  </span>
                </button>
              ))}
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
