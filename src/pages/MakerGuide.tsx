import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, DollarSign, Users, Zap,
  MessageCircle, ShieldCheck, TrendingUp, Clock, HelpCircle, Store,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";

const SITE_URL = "https://www.dimension3dprints.com";
const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

interface GuideFAQ { q: string; a: string; }
interface GuideSection { heading: string; body: string[]; callout?: string; }

interface GuideCopy {
  metaTitle: string;
  metaDesc: string;
  breadcrumbMakers: string;
  breadcrumbGuide: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  tocLabel: string;
  sections: GuideSection[];
  faqHeading: string;
  faqs: GuideFAQ[];
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
  whatsappButton: string;
}

const COPY: Record<string, GuideCopy> = {
  en: {
    metaTitle: "How It Works for Makers — Full Guide | Dimension3D",
    metaDesc: "The complete guide to joining the Dimension3D maker network: how orders reach you, how to quote, how to get paid directly with zero commission, and what we provide.",
    breadcrumbMakers: "Become a Maker",
    breadcrumbGuide: "How It Works",
    eyebrow: "The Maker Guide",
    title: "How it works — the full picture",
    subtitle: "Everything you need to know before joining the Dimension3D maker network. No marketing speak, no hidden details.",
    tocLabel: "In this guide",
    sections: [
      {
        heading: "1. Who this is for",
        body: [
          "This network is for anyone who owns a working FDM 3D printer and wants to earn money from it without building a business from scratch. You don't need a storefront, a social media following, or years of experience — just a printer, reliability, and care for quality.",
          "We work with hobbyists running a single Bambu or Prusa at home, and with more experienced makers who have multiple machines. There's no minimum volume. You choose how much you take on.",
          "If you're already selling on Wallapop, Leboncoin, or Kleinanzeigen — great, this complements that. If you've never sold a print before — also fine, that's what the network is for.",
        ],
      },
      {
        heading: "2. Joining — step by step",
        body: [
          "Step 1 — Apply. Fill in the application form on the Become a Maker page. Tell us your city, what printer(s) you have, and a little about your setup. There's no formal interview.",
          "Step 2 — We review. We read every application personally, usually within 24 hours. We're looking for reliability and honesty in how you describe your setup — not for a perfect CV.",
          "Step 3 — Confirmed. If it's a fit, we send you a welcome message via WhatsApp or email with the next steps. If not, we'll tell you why.",
          "Step 4 — First month free. From the moment you're confirmed, your first full month is completely free. No charge, no trial. Print real jobs, get paid, then decide.",
        ],
        callout: "First month completely free — no card required",
      },
      {
        heading: "3. How orders reach you",
        body: [
          "Customers find Dimension3D through Google search, Instagram, and word of mouth. We invest continuously in SEO and brand visibility so customers come to us first.",
          "When you join, we collect your preferred contact — a phone number or email address — where you want customer quote requests sent directly. This is the number or address customers will reach you at.",
          "When a customer submits a quote request for your city — via our web form, WhatsApp, or Instagram — the request goes directly to your contact. It does not pass through us. You receive the customer's message and the details they provided: what they want printed, any files they attached, and their own contact info.",
          "You and the customer then deal directly with each other from that point forward. You reply to them, discuss the job, quote the price, print it, and arrange payment and delivery — all between the two of you. Dimension3D is not in the loop for individual transactions.",
        ],
      },
      {
        heading: "4. Accepting and declining jobs",
        body: [
          "Every job is optional. There is no obligation, no minimum volume, no penalty for declining.",
          "When we send you a job via WhatsApp, you simply reply to accept or decline. We ask for a response within a few hours so the customer isn't left waiting — but there's no rigid SLA.",
          "Common reasons to decline: you're already at capacity, the material isn't one you stock, the deadline is too tight, or the file has issues you don't want to deal with. All of these are fine. Just let us know.",
          "If you accept a job, we expect you to deliver it. Reliability is the most important thing we ask of you. A maker who accepts 5 jobs and completes all 5 is far more valuable than one who takes 20 and drops 4.",
        ],
        callout: "No obligation, no minimums — every job is your choice",
      },
      {
        heading: "5. Quoting your work",
        body: [
          "You set your own prices. Dimension3D does not dictate what you charge for a job.",
          "We'll give you guidance on typical pricing for different job types — material cost, print time, complexity — so you're not guessing. But the final price you quote to the customer is yours to set.",
          "In practice: the customer tells us what they need and their rough budget. We pass that context to you along with the file. You confirm whether you can do it at that price, or come back with your own quote.",
          "Don't underprice. We've seen makers burn out by treating every job as a favour. Your time and electricity cost money. We'd rather you charge fairly and do 10 good jobs a month than run at a loss doing 30.",
        ],
      },
      {
        heading: "6. Printing and delivery",
        body: [
          "Once you've accepted a job and the price is agreed, you print it. Standard stuff — slicer settings, supports, bed adhesion. We trust you to know your printer.",
          "For quality, the expectation is simple: the print should match what the customer was shown or described. If there's a visible layer shift, stringing, or dimensional error that affects the part's use, reprint before delivery.",
          "Delivery is between you and the customer. Options include: local pickup (most common for Barcelona jobs), shipping (customer pays shipping), or drop-off if you're both nearby. We stay out of the logistics — you coordinate directly.",
          "If something goes wrong — a failed print, a delay, a material shortage — tell us and tell the customer early. Bad news early is always better than silence.",
        ],
      },
      {
        heading: "7. Getting paid — directly, with zero commission",
        body: [
          "You get paid directly by the customer. Not through us, not via any platform we control. You agree the price, the customer pays you — by transfer, cash, Bizum, whatever you and the customer arrange.",
          "Dimension3D takes zero commission from your earnings. Not 10%, not 5%, not 1%. Zero. What you earn from printing stays with you.",
          "This is the core of our model: we are not a marketplace that clips a percentage of every transaction. We are a lead-generation and brand-building service, charged as a flat monthly fee.",
          "The money flow is: customer pays you → you keep it all → separately, you pay us the flat monthly fee. Those two things are completely independent.",
        ],
        callout: "Zero commission — ever. You keep 100% of what customers pay you.",
      },
      {
        heading: "8. The flat monthly fee",
        body: [
          "After your free first month, we charge a flat monthly fee. The exact amount depends on your city and typical order volume — we agree it with you individually before your free month ends. Starting from just €2/month.",
          "The fee is fixed. It doesn't change based on how many jobs you take or how much you earn. A busy month and a quiet month cost the same.",
          "We invoice by email or arrange a simple bank transfer. No platform, no subscription portal to manage.",
          "If you want to pause — you travel, your printer breaks, life happens — just tell us. We don't auto-charge and we're not a subscription trap.",
          "Why a flat fee instead of commission? Because commission creates a conflict of interest: we'd benefit from pushing high-value jobs to makers regardless of fit. A flat fee means our incentive is simply to keep you happy and active.",
        ],
        callout: "From €2/month — agreed with you individually, no surprises",
      },
      {
        heading: "9. What Dimension3D provides",
        body: [
          "Brand trust — customers come to us because we have reviews, a professional presence, and an established Google ranking. You inherit that trust without building it yourself.",
          "Customer acquisition — we handle all marketing: SEO, Google Ads when we run them, Instagram, and word of mouth. You never do any marketing for Dimension3D jobs.",
          "Classifieds coaching — separately from the network jobs, we help you succeed on Wallapop (Spain), Leboncoin (France), and Kleinanzeigen (Germany). We share what works: listing copy, pricing, how to handle enquiries, which categories get the most traction.",
          "Pricing guidance — we share what customers typically pay for different job types so you can quote confidently.",
          "File prep tips — advice on handling common file issues: non-manifold geometry, oversized prints, poor support structure in the original file.",
          "A growing network — as more cities come online, you gain access to a European maker community. Knowledge, support, and eventually, referrals.",
        ],
      },
      {
        heading: "10. What we expect from you",
        body: [
          "Reliability is the only thing we truly require. If you say yes to a job, deliver it. If something goes wrong, communicate early.",
          "Honesty — about your capacity, your printer's limitations, your available time. Don't accept jobs you can't complete.",
          "Quality — not perfection, but care. A print that looks like it was rushed will reflect on Dimension3D and on you.",
          "Communication — respond to our WhatsApp messages within a few hours during working days. If you're going to be unavailable for a week, let us know.",
          "That's genuinely it. We're not asking for exclusivity, a minimum revenue target, or formal reporting. We want a straightforward working relationship: you print, we bring the customers, everyone gets paid.",
        ],
      },
    ],
    faqHeading: "Common questions",
    faqs: [
      { q: "Do I need to be registered as self-employed?", a: "That depends on your local tax rules, not ours. In Spain, occasional income below certain thresholds doesn't require autónomo registration — but we're not your tax advisors. If you're going to do this regularly, it's worth understanding your obligations. We can connect you with others in the network who've navigated this." },
      { q: "What if I already sell on Wallapop or Leboncoin?", a: "That's a good sign. You already understand the market. Joining the network complements your existing listings — Dimension3D jobs come in addition to, not instead of, what you're already doing. And our classifieds coaching can help you perform better on those platforms too." },
      { q: "Can I join from outside Spain?", a: "Yes. We're actively expanding to France, Germany, Italy, and the Netherlands. Apply now — early applicants in each new market get priority placement when it goes live." },
      { q: "What if I only have one printer?", a: "One printer is enough. Most of our current makers have one machine. You set your own capacity limits." },
      { q: "What printer brands do you support?", a: "Any FDM printer in working condition. Bambu Lab, Prusa, Creality, Artillery, Anycubic, Voron, Flashforge — all good. We currently focus on FDM. Resin support may come later." },
      { q: "How quickly do I need to respond to job offers?", a: "We ask for a response within a few hours during working hours. There's no rigid SLA, but customers are waiting — a quick yes or no keeps things moving for everyone." },
      { q: "What happens if a print fails?", a: "Tell us immediately. We'll help manage the customer expectation. If the failure was due to file issues, we work through it together. If it was a printer issue, you reprint. The key is communication — don't go silent." },
      { q: "Can I set a maximum number of jobs per month?", a: "Yes. Just tell us your capacity and we'll respect it. If you only want 2–3 jobs a month, that's fine. The flat monthly fee doesn't change based on volume." },
      { q: "What if I disagree with a customer?", a: "Contact us. We're in the loop and can help mediate if needed. We protect both sides — we won't leave you exposed to an unreasonable customer." },
      { q: "Is there a contract?", a: "We keep it simple. No long-form contracts, no lock-in periods. We operate on trust and a straightforward written agreement about the fee and scope. Either party can end the arrangement with reasonable notice." },
    ],
    ctaHeading: "Ready to join?",
    ctaBody: "Apply now — it takes two minutes, and your first month is completely free.",
    ctaButton: "Apply to join",
    whatsappButton: "Ask us a question",
  },

  es: {
    metaTitle: "Cómo funciona para makers — Guía completa | Dimension3D",
    metaDesc: "La guía completa para unirte a la red de makers de Dimension3D: cómo llegan los pedidos, cómo presupuestar, cómo cobrar directamente con cero comisión y qué te proporcionamos.",
    breadcrumbMakers: "Únete como Maker",
    breadcrumbGuide: "Cómo funciona",
    eyebrow: "La Guía del Maker",
    title: "Cómo funciona — la imagen completa",
    subtitle: "Todo lo que necesitas saber antes de unirte a la red de makers de Dimension3D. Sin palabrería de marketing, sin detalles ocultos.",
    tocLabel: "En esta guía",
    sections: [
      {
        heading: "1. Para quién es esto",
        body: [
          "Esta red es para cualquiera que tenga una impresora FDM en funcionamiento y quiera ganar dinero con ella sin construir un negocio desde cero. No necesitas un local, seguidores en redes sociales ni años de experiencia — solo una impresora, fiabilidad y cuidado por la calidad.",
          "Trabajamos con aficionados que tienen una sola Bambu o Prusa en casa, y con makers más experimentados que tienen varias máquinas. No hay volumen mínimo. Tú decides cuánto asumes.",
          "Si ya vendes en Wallapop, Leboncoin o Kleinanzeigen — genial, esto lo complementa. Si nunca has vendido una impresión — también está bien, para eso existe la red.",
        ],
      },
      {
        heading: "2. Unirse — paso a paso",
        body: [
          "Paso 1 — Solicitas. Rellena el formulario en la página Para Makers. Cuéntanos tu ciudad, qué impresora(s) tienes y algo sobre tu configuración. No hay entrevista formal.",
          "Paso 2 — Revisamos. Leemos cada solicitud personalmente, normalmente en 24 horas. Buscamos fiabilidad y honestidad en cómo describes tu configuración — no un CV perfecto.",
          "Paso 3 — Confirmado. Si encaja, te enviamos un mensaje de bienvenida por WhatsApp o email con los siguientes pasos. Si no, te explicamos por qué.",
          "Paso 4 — Primer mes gratis. Desde el momento en que estás confirmado, tu primer mes completo es totalmente gratuito. Sin cargo, sin prueba. Imprime encargos reales, cobra y luego decide.",
        ],
        callout: "Primer mes completamente gratis — sin tarjeta requerida",
      },
      {
        heading: "3. Cómo llegan los pedidos",
        body: [
          "Los clientes encuentran Dimension3D a través de la búsqueda de Google, Instagram y el boca a boca. Invertimos continuamente en SEO y visibilidad de marca para que los clientes vengan a nosotros primero.",
          "Cuando te unes, recogemos tu contacto preferido — un número de teléfono o una dirección de email — donde quieres que lleguen directamente las solicitudes de presupuesto de los clientes. Ese es el número o la dirección a la que te llegan los clientes.",
          "Cuando un cliente envía una solicitud de presupuesto para tu ciudad — a través de nuestro formulario web, WhatsApp o Instagram — la solicitud va directamente a tu contacto. No pasa por nosotros. Tú recibes el mensaje del cliente y los detalles que proporcionó: qué quiere imprimir, cualquier archivo que haya adjuntado y su propia información de contacto.",
          "Tú y el cliente tratan directamente entre sí desde ese momento. Tú le respondes, discutes el encargo, presupuestas el precio, lo imprimes y organizas el pago y la entrega — todo entre vosotros. Dimension3D no interviene en las transacciones individuales.",
        ],
      },
      {
        heading: "4. Aceptar y rechazar encargos",
        body: [
          "Cada encargo es opcional. No hay obligación, no hay volumen mínimo, no hay penalización por rechazar.",
          "Cuando te enviamos un encargo por WhatsApp, simplemente respondes para aceptar o rechazar. Pedimos una respuesta en pocas horas para que el cliente no espere — pero no hay un SLA rígido.",
          "Razones habituales para rechazar: ya tienes la capacidad llena, no tienes ese material, el plazo es muy ajustado, o el archivo tiene problemas. Todo esto está bien. Solo avísanos.",
          "Si aceptas un encargo, esperamos que lo entregues. La fiabilidad es lo más importante que te pedimos. Un maker que acepta 5 encargos y completa los 5 vale mucho más que uno que toma 20 y abandona 4.",
        ],
        callout: "Sin obligación, sin mínimos — cada encargo es tu elección",
      },
      {
        heading: "5. Presupuestar tu trabajo",
        body: [
          "Tú fijas tus propios precios. Dimension3D no dicta lo que cobras por un encargo.",
          "Te daremos orientación sobre precios típicos para diferentes tipos de encargos — coste de material, tiempo de impresión, complejidad — para que no tengas que adivinar. Pero el precio final que presupuestas al cliente es tuyo.",
          "En la práctica: el cliente nos dice qué necesita y su presupuesto aproximado. Te pasamos ese contexto junto con el archivo. Tú confirmas si puedes hacerlo a ese precio, o vuelves con tu propio presupuesto.",
          "No te infravalores. Hemos visto makers agotarse por tratar cada encargo como un favor. Tu tiempo y electricidad cuestan dinero. Preferimos que cobres bien y hagas 10 buenos encargos al mes que trabajar a pérdidas haciendo 30.",
        ],
      },
      {
        heading: "6. Imprimir y entregar",
        body: [
          "Una vez que has aceptado el encargo y el precio está acordado, imprimes. Lo de siempre — ajustes del slicer, soportes, adhesión de cama. Confiamos en que conoces tu impresora.",
          "Para la calidad, la expectativa es simple: la impresión debe coincidir con lo que se mostró o describió al cliente. Si hay un desplazamiento de capa visible, hilos o errores dimensionales que afectan al uso de la pieza, reimprímela antes de la entrega.",
          "La entrega es entre tú y el cliente. Opciones: recogida en persona (lo más habitual), envío (el cliente paga los portes) o entrega si estáis cerca. Nosotros nos mantenemos al margen — coordinad directamente.",
          "Si algo sale mal — una impresión fallida, un retraso, escasez de material — avísanos a nosotros y al cliente pronto. Las malas noticias a tiempo siempre son mejor que el silencio.",
        ],
      },
      {
        heading: "7. Cobrar — directamente, sin comisión",
        body: [
          "El cliente te paga directamente a ti. No a través de nosotros, no a través de ninguna plataforma que controlemos. Acordáis el precio, el cliente te paga — por transferencia, efectivo, Bizum, lo que tú y el cliente acordéis.",
          "Dimension3D no cobra ninguna comisión de tus ingresos. No el 10%, no el 5%, no el 1%. Cero. Lo que ganas imprimiendo es tuyo.",
          "Este es el núcleo de nuestro modelo: no somos un marketplace que recorta un porcentaje de cada transacción. Somos un servicio de captación de clientes y construcción de marca, cobrado como una tarifa mensual fija.",
          "El flujo de dinero es: el cliente te paga → tú te lo quedas todo → por separado, nos pagas la tarifa mensual fija. Estas dos cosas son completamente independientes.",
        ],
        callout: "Cero comisión — nunca. Te quedas el 100% de lo que te pagan los clientes.",
      },
      {
        heading: "8. La tarifa mensual fija",
        body: [
          "Después del primer mes gratuito, cobramos una tarifa mensual fija. El importe exacto depende de tu ciudad y el volumen típico de pedidos — lo acordamos contigo individualmente antes de que acabe tu mes gratuito. Desde solo €2/mes.",
          "La tarifa es fija. No cambia según cuántos encargos aceptes o cuánto ganes. Un mes ajetreado y uno tranquilo cuestan lo mismo.",
          "Facturamos por email o acordamos una transferencia bancaria sencilla. Sin plataforma, sin portal de suscripción que gestionar.",
          "Si quieres pausar — viajas, tu impresora se estropea, la vida pasa — avísanos. No cobramos automáticamente y no somos una trampa de suscripción.",
          "¿Por qué tarifa fija en lugar de comisión? Porque la comisión crea un conflicto de intereses: nos beneficiaría empujar encargos de alto valor a los makers independientemente de si encajan. Una tarifa fija significa que nuestro incentivo es simplemente mantenerte contento y activo.",
        ],
        callout: "Desde €2/mes — acordado individualmente contigo, sin sorpresas",
      },
      {
        heading: "9. Qué te proporciona Dimension3D",
        body: [
          "Confianza de marca — los clientes vienen a nosotros porque tenemos reseñas, una presencia profesional y un posicionamiento establecido en Google. Heredas esa confianza sin construirla tú.",
          "Captación de clientes — gestionamos todo el marketing: SEO, Google Ads cuando los usamos, Instagram y boca a boca. Nunca haces ningún marketing para los encargos de Dimension3D.",
          "Coaching en clasificados — además de los encargos de la red, te ayudamos a tener éxito en Wallapop (España), Leboncoin (Francia) y Kleinanzeigen (Alemania). Compartimos lo que funciona: texto de anuncios, precios, cómo gestionar consultas, qué categorías tienen más tracción.",
          "Guía de precios — compartimos lo que los clientes suelen pagar por diferentes tipos de encargos para que puedas presupuestar con confianza.",
          "Consejos de preparación de archivos — orientación sobre cómo manejar problemas habituales: geometría no manifold, impresiones sobredimensionadas, estructura de soportes deficiente en el archivo original.",
          "Una red en crecimiento — a medida que más ciudades se incorporan, tienes acceso a una comunidad europea de makers. Conocimiento, apoyo y, con el tiempo, referencias.",
        ],
      },
      {
        heading: "10. Qué esperamos de ti",
        body: [
          "La fiabilidad es lo único que realmente requerimos. Si dices sí a un encargo, entrégalo. Si algo sale mal, comunícalo pronto.",
          "Honestidad — sobre tu capacidad, las limitaciones de tu impresora, tu tiempo disponible. No aceptes encargos que no puedas completar.",
          "Calidad — no perfección, sino cuidado. Una impresión que parece hecha con prisa nos afecta a Dimension3D y a ti.",
          "Comunicación — responde a nuestros mensajes de WhatsApp en pocas horas durante los días laborables. Si vas a estar no disponible una semana, avísanos.",
          "Eso es genuinamente todo. No pedimos exclusividad, un objetivo mínimo de ingresos ni informes formales. Queremos una relación de trabajo sencilla: tú imprimes, nosotros traemos los clientes, todos cobran.",
        ],
      },
    ],
    faqHeading: "Preguntas frecuentes",
    faqs: [
      { q: "¿Necesito estar dado de alta como autónomo?", a: "Eso depende de tus normas fiscales locales, no de las nuestras. En España, los ingresos ocasionales por debajo de ciertos umbrales no requieren darse de alta como autónomo — pero no somos tus asesores fiscales. Si vas a hacerlo regularmente, vale la pena entender tus obligaciones. Podemos conectarte con otros de la red que ya han navegado por esto." },
      { q: "¿Qué pasa si ya vendo en Wallapop o Leboncoin?", a: "Eso es buena señal. Ya entiendes el mercado. Unirte a la red complementa tus anuncios existentes — los encargos de Dimension3D se suman a lo que ya haces, no lo sustituyen. Y nuestro coaching en clasificados puede ayudarte a mejorar en esas plataformas también." },
      { q: "¿Puedo unirme desde fuera de España?", a: "Sí. Nos estamos expandiendo activamente a Francia, Alemania, Italia y Países Bajos. Solicita ahora — los primeros solicitantes en cada nuevo mercado tienen prioridad cuando se activa." },
      { q: "¿Y si solo tengo una impresora?", a: "Una impresora es suficiente. La mayoría de nuestros makers actuales tienen una sola máquina. Tú fijas tus propios límites de capacidad." },
      { q: "¿Qué marcas de impresoras admitís?", a: "Cualquier impresora FDM en buen estado. Bambu Lab, Prusa, Creality, Artillery, Anycubic, Voron, Flashforge — todas valen. Actualmente nos centramos en FDM. La resina puede añadirse más adelante." },
      { q: "¿Con qué rapidez debo responder a las ofertas de encargos?", a: "Pedimos respuesta en pocas horas durante el horario laboral. No hay un SLA rígido, pero los clientes esperan — un sí o no rápido mantiene todo en movimiento." },
      { q: "¿Qué pasa si una impresión falla?", a: "Avísanos de inmediato. Te ayudamos a gestionar la expectativa del cliente. Si el fallo fue por problemas con el archivo, lo trabajamos juntos. Si fue un problema de la impresora, reimprime. La clave es la comunicación — no desaparezcas." },
      { q: "¿Puedo fijar un número máximo de encargos al mes?", a: "Sí. Solo dinos tu capacidad y la respetaremos. Si solo quieres 2–3 encargos al mes, está bien. La tarifa mensual fija no cambia según el volumen." },
      { q: "¿Qué pasa si tengo un desacuerdo con un cliente?", a: "Contáctanos. Estamos en el circuito y podemos ayudar a mediar si es necesario. Protegemos a ambas partes — no te dejaremos expuesto a un cliente poco razonable." },
      { q: "¿Hay un contrato?", a: "Lo mantenemos simple. Sin contratos largos, sin períodos de permanencia. Operamos con confianza y un acuerdo escrito sencillo sobre la tarifa y el alcance. Cualquiera de las partes puede terminar el acuerdo con un preaviso razonable." },
    ],
    ctaHeading: "¿Listo para unirte?",
    ctaBody: "Solicita ahora — solo lleva dos minutos, y tu primer mes es completamente gratis.",
    ctaButton: "Solicitar unirme",
    whatsappButton: "Pregúntanos algo",
  },

  ca: {
    metaTitle: "Com funciona per als makers — Guia completa | Dimension3D",
    metaDesc: "La guia completa per unir-te a la xarxa de makers de Dimension3D: com arriben les comandes, com pressupostar, com cobrar directament amb zero comissió i què et proporcionem.",
    breadcrumbMakers: "Uneix-te com a Maker",
    breadcrumbGuide: "Com funciona",
    eyebrow: "La Guia del Maker",
    title: "Com funciona — la imatge completa",
    subtitle: "Tot el que necessites saber abans d'unir-te a la xarxa de makers de Dimension3D. Sense màrqueting buit, sense detalls ocults.",
    tocLabel: "En aquesta guia",
    sections: [
      {
        heading: "1. Per a qui és això",
        body: [
          "Aquesta xarxa és per a qualsevol que tingui una impressora FDM en funcionament i vulgui guanyar diners amb ella sense construir un negoci des de zero. No necessites un local, seguidors a les xarxes socials ni anys d'experiència — només una impressora, fiabilitat i cura per la qualitat.",
          "Treballem amb aficionats que tenen una sola Bambu o Prusa a casa, i amb makers més experimentats que tenen diverses màquines. No hi ha volum mínim. Tu decideixes quant assumeixes.",
          "Si ja vens a Wallapop, Leboncoin o Kleinanzeigen — genial, això ho complementa. Si mai has venut una impressió — també és correcte, per a això existeix la xarxa.",
        ],
      },
      {
        heading: "2. Unir-se — pas a pas",
        body: [
          "Pas 1 — Sol·licites. Omple el formulari a la pàgina Per a Makers. Explica'ns la teva ciutat, quina/es impressora/es tens i una mica de la teva configuració. No hi ha entrevista formal.",
          "Pas 2 — Revisem. Llegim cada sol·licitud personalment, normalment en 24 hores. Busquem fiabilitat i honestedat en com describes la teva configuració — no un CV perfecte.",
          "Pas 3 — Confirmat. Si encaixa, t'enviem un missatge de benvinguda per WhatsApp o email amb els passos següents. Si no, t'expliquem per què.",
          "Pas 4 — Primer mes gratis. Des del moment en què estàs confirmat, el teu primer mes complet és totalment gratuït. Sense càrrec, sense prova. Imprimeix encàrrecs reals, cobra i llavors decideix.",
        ],
        callout: "Primer mes completament gratis — sense targeta requerida",
      },
      {
        heading: "3. Com arriben les comandes",
        body: [
          "Els clients troben Dimension3D a través de la cerca de Google, Instagram i el boca-orella. Invertim contínuament en SEO i visibilitat de marca perquè els clients vinguin a nosaltres primer.",
          "Quan t'uneixes, recollim el teu contacte preferit — un número de telèfon o una adreça d'email — on vols que arribin directament les sol·licituds de pressupost dels clients. Aquell és el número o l'adreça a través del qual et contacten els clients.",
          "Quan un client envia una sol·licitud de pressupost per a la teva ciutat — a través del nostre formulari web, WhatsApp o Instagram — la sol·licitud va directament al teu contacte. No passa per nosaltres. Tu reps el missatge del client i els detalls que va proporcionar: què vol imprimir, qualsevol arxiu que hagi adjuntat i la seva pròpia informació de contacte.",
          "Tu i el client tracten directament entre ells des d'aquell moment. Tu li respons, discuteixes l'encàrrec, pressuposta el preu, ho imprimeixes i organitzeu el pagament i el lliurament — tot entre vosaltres. Dimension3D no intervé en les transaccions individuals.",
        ],
      },
      {
        heading: "4. Acceptar i rebutjar encàrrecs",
        body: [
          "Cada encàrrec és opcional. No hi ha obligació, no hi ha volum mínim, no hi ha penalització per rebutjar.",
          "Quan t'enviem un encàrrec per WhatsApp, simplement respons per acceptar o rebutjar. Demanem una resposta en poques hores perquè el client no esperi — però no hi ha un SLA rígid.",
          "Raons habituals per rebutjar: ja tens la capacitat plena, no tens aquell material, el termini és molt ajustat, o l'arxiu té problemes. Tot això és acceptable. Simplement avisa'ns.",
          "Si acceptes un encàrrec, esperem que el lliuris. La fiabilitat és el més important que et demanem. Un maker que accepta 5 encàrrecs i completa els 5 val molt més que un que en pren 20 i en deixa anar 4.",
        ],
        callout: "Sense obligació, sense mínims — cada encàrrec és la teva elecció",
      },
      {
        heading: "5. Pressupostar la teva feina",
        body: [
          "Tu fixes els teus propis preus. Dimension3D no dicta el que cobres per un encàrrec.",
          "Et donarem orientació sobre preus típics per a diferents tipus d'encàrrecs — cost de material, temps d'impressió, complexitat — perquè no hagis d'endevinar. Però el preu final que pressupostes al client és teu.",
          "A la pràctica: el client ens diu què necessita i el seu pressupost aproximat. Et passem aquest context juntament amb l'arxiu. Tu confirmes si pots fer-ho a aquell preu, o tornes amb el teu propi pressupost.",
          "No et subvalories. Hem vist makers esgotats per tractar cada encàrrec com un favor. El teu temps i l'electricitat costen diners. Preferim que cobris bé i facis 10 bons encàrrecs al mes que treballar a pèrdues fent-ne 30.",
        ],
      },
      {
        heading: "6. Imprimir i lliurar",
        body: [
          "Un cop has acceptat l'encàrrec i el preu està acordat, imprimeixes. El de sempre — ajustos del slicer, suports, adhesió del llit. Confiem que coneixes la teva impressora.",
          "Per a la qualitat, l'expectativa és simple: la impressió ha de coincidir amb el que es va mostrar o descriure al client. Si hi ha un desplaçament de capa visible, fils o errors dimensionals que afecten l'ús de la peça, reimprímela abans del lliurament.",
          "El lliurament és entre tu i el client. Opcions: recollida en persona (el més habitual), enviament (el client paga les despeses), o entrega si esteu a prop. Nosaltres ens quedem al marge — coordineu directament.",
          "Si alguna cosa va malament — una impressió fallida, un retard, manca de material — avisa'ns a nosaltres i al client aviat. Les males notícies a temps sempre són millor que el silenci.",
        ],
      },
      {
        heading: "7. Cobrar — directament, sense comissió",
        body: [
          "El client et paga directament a tu. No a través nostre, no a través de cap plataforma que controlem. Acordeu el preu, el client et paga — per transferència, efectiu, Bizum, el que tu i el client acordeu.",
          "Dimension3D no cobra cap comissió dels teus ingressos. No el 10%, no el 5%, no l'1%. Zero. El que guanyes imprimint és teu.",
          "Aquest és el nucli del nostre model: no som un marketplace que retalla un percentatge de cada transacció. Som un servei de captació de clients i construcció de marca, cobrat com una tarifa mensual fixa.",
          "El flux de diners és: el client et paga → tu te'l quedes tot → per separat, ens pagues la tarifa mensual fixa. Aquestes dues coses són completament independents.",
        ],
        callout: "Zero comissió — mai. Et quedes el 100% del que et paguen els clients.",
      },
      {
        heading: "8. La tarifa mensual fixa",
        body: [
          "Després del primer mes gratuït, cobrem una tarifa mensual fixa. L'import exacte depèn de la teva ciutat i el volum típic de comandes — ho acordem amb tu individualment abans que acabi el mes gratuït. Des de només €2/mes.",
          "La tarifa és fixa. No canvia segons quants encàrrecs acceptis o quant guanyis. Un mes atabalat i un de tranquil costen el mateix.",
          "Facturem per email o acordem una transferència bancària senzilla. Sense plataforma, sense portal de subscripció a gestionar.",
          "Si vols pausar — viatges, la teva impressora es trenca, la vida passa — avisa'ns. No cobrem automàticament i no som una trampa de subscripció.",
          "Per què tarifa fixa en lloc de comissió? Perquè la comissió crea un conflicte d'interessos: ens beneficiaria empènyer encàrrecs d'alt valor als makers independentment de si encaixen. Una tarifa fixa significa que el nostre incentiu és simplement mantenir-te content i actiu.",
        ],
        callout: "Des de €2/mes — acordat individualment amb tu, sense sorpreses",
      },
      {
        heading: "9. Què et proporciona Dimension3D",
        body: [
          "Confiança de marca — els clients vénen a nosaltres perquè tenim ressenyes, una presència professional i un posicionament establert a Google. Heretes aquesta confiança sense construir-la tu.",
          "Captació de clients — gestionem tot el màrqueting: SEO, Google Ads quan els usem, Instagram i boca-orella. Mai fas cap màrqueting per als encàrrecs de Dimension3D.",
          "Coaching en classificats — a més dels encàrrecs de la xarxa, t'ajudem a tenir èxit a Wallapop (Espanya), Leboncoin (França) i Kleinanzeigen (Alemanya). Compartim el que funciona: text d'anuncis, preus, com gestionar consultes, quines categories tenen més tracció.",
          "Guia de preus — compartim el que els clients solen pagar per a diferents tipus d'encàrrecs perquè puguis pressupostar amb confiança.",
          "Consells de preparació d'arxius — orientació sobre com gestionar problemes habituals: geometria no manifold, impressions sobredimensionades, estructura de suports deficient a l'arxiu original.",
          "Una xarxa en creixement — a mesura que més ciutats s'incorporen, tens accés a una comunitat europea de makers. Coneixement, suport i, amb el temps, referències.",
        ],
      },
      {
        heading: "10. Què esperem de tu",
        body: [
          "La fiabilitat és l'únic que realment requerim. Si dius sí a un encàrrec, lliura'l. Si alguna cosa va malament, comunica-ho aviat.",
          "Honestedat — sobre la teva capacitat, les limitacions de la teva impressora, el teu temps disponible. No acceptis encàrrecs que no puguis completar.",
          "Qualitat — no perfecció, sinó cura. Una impressió que sembla feta amb pressa ens afecta a Dimension3D i a tu.",
          "Comunicació — respon als nostres missatges de WhatsApp en poques hores durant els dies laborables. Si no estaràs disponible una setmana, avisa'ns.",
          "Això és genuïnament tot. No demanem exclusivitat, un objectiu mínim d'ingressos ni informes formals. Volem una relació de treball senzilla: tu imprimeixes, nosaltres portem els clients, tothom cobra.",
        ],
      },
    ],
    faqHeading: "Preguntes habituals",
    faqs: [
      { q: "Necessito estar donat d'alta com a autònom?", a: "Això depèn de les teves normes fiscals locals, no de les nostres. A Espanya, els ingressos ocasionals per sota de certs llindars no requereixen donar-se d'alta com a autònom — però no som els teus assessors fiscals. Si ho faràs regularment, val la pena entendre les teves obligacions. Podem connectar-te amb altres de la xarxa que ja hi han navegat." },
      { q: "Què passa si ja venc a Wallapop o Leboncoin?", a: "Això és bona senyal. Ja entens el mercat. Unir-te a la xarxa complementa els teus anuncis existents — els encàrrecs de Dimension3D se sumen al que ja fas, no ho substitueixen. I el nostre coaching en classificats et pot ajudar a millorar en aquelles plataformes també." },
      { q: "Puc unir-me des de fora d'Espanya?", a: "Sí. Ens estem expandint activament a França, Alemanya, Itàlia i els Països Baixos. Sol·licita ara — els primers sol·licitants en cada nou mercat tenen prioritat quan s'activa." },
      { q: "I si només tinc una impressora?", a: "Una impressora és suficient. La majoria dels nostres makers actuals tenen una sola màquina. Tu fixes els teus propis límits de capacitat." },
      { q: "Quines marques d'impressores admeteu?", a: "Qualsevol impressora FDM en bon estat. Bambu Lab, Prusa, Creality, Artillery, Anycubic, Voron, Flashforge — totes valen. Actualment ens centrem en FDM. La resina pot afegir-se més endavant." },
      { q: "Amb quina rapidesa he de respondre a les ofertes d'encàrrecs?", a: "Demanem resposta en poques hores durant l'horari laboral. No hi ha un SLA rígid, però els clients esperen — un sí o no ràpid manté tot en moviment." },
      { q: "Què passa si una impressió falla?", a: "Avisa'ns de seguida. T'ajudem a gestionar l'expectativa del client. Si el fallo va ser per problemes amb l'arxiu, ho treballem junts. Si va ser un problema de la impressora, reimprímela. La clau és la comunicació — no desapareguis." },
      { q: "Puc fixar un nombre màxim d'encàrrecs al mes?", a: "Sí. Només diga'ns la teva capacitat i la respectarem. Si només vols 2–3 encàrrecs al mes, és correcte. La tarifa mensual fixa no canvia segons el volum." },
      { q: "Què passa si tinc un desacord amb un client?", a: "Contacta'ns. Estem en el circuit i podem ajudar a mediar si cal. Protegim totes dues parts — no et deixarem exposat a un client poc raonable." },
      { q: "Hi ha un contracte?", a: "Ho mantenim simple. Sense contractes llargs, sense períodes de permanència. Operem amb confiança i un acord escrit senzill sobre la tarifa i l'abast. Qualsevol de les parts pot acabar l'acord amb un preavís raonable." },
    ],
    ctaHeading: "Llest per unir-te?",
    ctaBody: "Sol·licita ara — només triga dos minuts, i el teu primer mes és completament gratis.",
    ctaButton: "Sol·licitar unir-me",
    whatsappButton: "Fes-nos una pregunta",
  },
};

const SECTION_ICONS = [Users, Zap, MessageCircle, CheckCircle2, DollarSign, TrendingUp, ShieldCheck, Clock, Store, HelpCircle];

const MakerGuide = () => {
  const { language } = useLanguage();
  const c = COPY[language] ?? COPY.en;

  const handleWhatsApp = () => {
    const msg =
      language === "ca" ? "Hola, m'interessa unir-me a la xarxa de makers de Dimension3D." :
      language === "es" ? "Hola, me interesa unirme a la red de makers de Dimension3D." :
      "Hi, I'm interested in joining the Dimension3D maker network.";
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
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
        <link rel="canonical" href={`${SITE_URL}/maker-guide`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/maker-guide`} />
        <link rel="alternate" hrefLang="es" href={`${SITE_URL}/maker-guide`} />
        <link rel="alternate" hrefLang="ca" href={`${SITE_URL}/maker-guide`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/maker-guide`} />
        <meta property="og:title" content={c.metaTitle} />
        <meta property="og:description" content={c.metaDesc} />
        <meta property="og:url" content={`${SITE_URL}/maker-guide`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <LaunchOfferBanner />
      <Header />

      <main className="pt-16">

        {/* ── HERO ── */}
        <section className="py-16 md:py-20 hero-gradient">
          <div className="container px-4 max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-primary-foreground/50 mb-6">
              <Link to="/makers" className="hover:text-primary-foreground/80 transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                {c.breadcrumbMakers}
              </Link>
              <span>/</span>
              <span className="text-primary-foreground/70">{c.breadcrumbGuide}</span>
            </nav>

            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-5">
              {c.eyebrow}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              {c.title}
            </h1>
            <p className="text-lg text-primary-foreground/75 leading-relaxed">
              {c.subtitle}
            </p>

            {/* Table of contents pill list */}
            <div className="mt-8 p-5 rounded-2xl bg-primary-foreground/8 border border-primary-foreground/12">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-3">{c.tocLabel}</p>
              <div className="flex flex-wrap gap-2">
                {c.sections.map((s, i) => (
                  <a
                    key={i}
                    href={`#section-${i}`}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/18 hover:text-primary-foreground transition-colors"
                  >
                    {s.heading}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTIONS ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-4 max-w-3xl mx-auto">
            <div className="space-y-16">
              {c.sections.map((section, i) => {
                const Icon = SECTION_ICONS[i] ?? HelpCircle;
                return (
                  <article key={i} id={`section-${i}`} className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4.5 h-4.5 text-accent" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground">{section.heading}</h2>
                    </div>

                    <div className="space-y-4 pl-0 md:pl-12">
                      {section.body.map((para, j) => (
                        <p key={j} className="text-foreground/80 leading-relaxed">{para}</p>
                      ))}

                      {section.callout && (
                        <div className="flex items-center gap-3 bg-accent/8 border border-accent/20 rounded-xl px-5 py-3.5 mt-2">
                          <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                          <span className="text-sm font-semibold text-accent">{section.callout}</span>
                        </div>
                      )}
                    </div>

                    {i < c.sections.length - 1 && (
                      <div className="mt-10 border-b border-border/40" />
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 md:py-20 bg-secondary/30">
          <div className="container px-4 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">{c.faqHeading}</h2>
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
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 md:py-20 hero-gradient">
          <div className="container px-4 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">{c.ctaHeading}</h2>
            <p className="text-primary-foreground/75 mb-8 text-lg">{c.ctaBody}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="cta" size="xl" className="gap-2 shadow-lg">
                <Link to="/makers">
                  {c.ctaButton}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="whatsapp-outline" size="xl" onClick={handleWhatsApp} className="gap-2">
                <MessageCircle className="w-5 h-5" />
                {c.whatsappButton}
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

export default MakerGuide;
