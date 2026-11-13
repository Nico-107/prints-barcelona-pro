import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { CheckCircle, ChevronDown, ChevronUp, Image, Loader2, Send, X, Zap, Clock, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";
import { supabase, supabaseAnon } from "@/integrations/supabase/client";
import { capture } from "@/lib/analytics";
import { AUTHOR_REF, PUBLISHER_REF } from "@/seo/entities";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";

type Lang = "es" | "en" | "ca";

const SITE_URL = "https://www.dimension3dprints.com";
const SOCIAL_IMAGE_URL = `${SITE_URL}/og/share-default.png`;
const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

// ─── Localised content ────────────────────────────────────────────────────────

const C = {
  es: {
    htmlLang: "es",
    slug: "/prototipos-para-empresas",
    title: "Prototipos para Empresas Barcelona — Urgente <4 h",
    metaDesc: "Prototipado 3D para empresas en Barcelona. Urgente <4 h (+60%), exprés <24 h (+25%), estándar <48 h. Diseño incluido, NDA disponible, factura con IVA.",
    breadcrumb: "Prototipos para Empresas",
    eyebrow: "BARCELONA · ENTREGA EN <48 H · DISEÑO INCLUIDO",
    h1: "Prototipos para empresas",
    heroDesc: "Fabricamos prototipos funcionales y de presentación para empresas en Barcelona. Tres niveles de urgencia con precio claro desde el inicio. Diseño desde foto o medidas incluido. Factura y NDA disponibles.",
    ctaPrimary: "Enviar brief",
    ctaWa: "Escribirnos por WhatsApp",
    facts: [
      { value: "<4 h", label: "Urgente" },
      { value: "<24 h", label: "Exprés" },
      { value: "<48 h", label: "Estándar" },
      { value: "NDA", label: "disponible" },
    ],
    tiersHeading: "Tres niveles de urgencia",
    tiersDesc: "Precio final = precio base × multiplicador de urgencia. El presupuesto llega siempre antes de confirmar.",
    tiers: [
      {
        icon: <Zap className="w-5 h-5" />,
        name: "Urgente",
        time: "< 4 horas",
        multiplier: "+60 %",
        desc: "Cola máxima prioridad. Imprimimos en cuanto confirmamos el pedido. Para presentaciones, demos de producto y prototipos de última hora.",
        color: "#F5A524",
      },
      {
        icon: <Clock className="w-5 h-5" />,
        name: "Exprés",
        time: "< 24 horas",
        multiplier: "+25 %",
        desc: "Cola prioritaria. Garantizamos entrega o recogida al día siguiente. Para iteraciones rápidas y plazos de cliente ajustados.",
        color: "#2F5BEA",
      },
      {
        icon: <Calendar className="w-5 h-5" />,
        name: "Estándar",
        time: "< 48 horas",
        multiplier: "precio base",
        desc: "El ritmo habitual del servicio. Para pedidos planificados sin urgencia especial. La mejor relación calidad-precio.",
        color: "#0F172A",
      },
    ],
    howHeading: "Cómo funciona para empresas",
    steps: [
      { n: "01", title: "Envía el brief", desc: "Rellena el formulario con la descripción, dimensiones, material preferido y nivel de urgencia. Adjunta archivo 3D o fotos si los tienes." },
      { n: "02", title: "Recibe el presupuesto", desc: "Te enviamos precio y plazo en menos de 1 hora (urgente: en 15 min). Sin compromiso, sin registro previo." },
      { n: "03", title: "Confirma y pagamos", desc: "Confirmas por email o WhatsApp, haces el pago online y la pieza entra en cola de impresión inmediatamente." },
      { n: "04", title: "Recoge o recibe", desc: "Recogida en Les Corts (Barcelona) o envío a toda España. Urgente: recogida en mano en el estudio en menos de 4 h." },
    ],
    includedHeading: "Qué incluye el servicio",
    included: [
      { title: "Diseño desde foto o medidas", desc: "No necesitas archivo 3D. Diseñamos la pieza desde una foto o medidas y la fabricamos. Presupuesto específico según complejidad." },
      { title: "Factura con IVA desglosado", desc: "Emitimos factura para cualquier empresa española o de la UE. Número de pedido, referencia de proyecto, NIF." },
      { title: "NDA disponible", desc: "Firmamos acuerdo de confidencialidad antes de compartir archivos o describir el proyecto. Contacta por email para gestionarlo." },
      { title: "Primer prototipo gratis", desc: "En el primer pedido de empresa fabricamos una pieza pequeña (<30 g, <1 h máquina) sin coste para que compruebes la calidad." },
      { title: "Gestor de proyecto", desc: "Un único interlocutor (Nico) gestiona tu pedido de principio a fin. Respuesta directa, sin tickets." },
      { title: "Iteraciones rápidas", desc: "Si el primer prototipo necesita ajustes, el rediseño es rápido. Podemos iterar varias veces en el mismo día con el servicio urgente." },
    ],
    materialsHeading: "Materiales disponibles",
    materials: [
      { name: "PLA", props: "Prototipos de presentación, maquetas, geometrías complejas. Colores: 10+. Acabado liso." },
      { name: "PETG", props: "Piezas semitécnicas, transparencia parcial, resistencia química básica. Colores: 6+." },
      { name: "ABS / ASA", props: "Prototipos técnicos, resistencia UV, temperatura moderada. Para ingeniería de producto." },
      { name: "TPU", props: "Piezas flexibles: juntas, carcasas, elementos amortiguadores. Dureza configurable." },
      { name: "Nylon", props: "Alta resistencia mecánica, baja fricción. Para jigs, útiles y piezas funcionales de producción." },
    ],
    applicationsHeading: "Para qué se usa",
    applications: [
      "Prototipos funcionales y de presentación",
      "Jigs y útiles de fabricación",
      "Maquetas de arquitectura e interiorismo",
      "Piezas de repuesto para maquinaria",
      "Demos y modelos para inversores",
      "Componentes para validación de diseño",
      "Accesorios y soportes a medida",
      "Tiradas cortas de 1 a 20 unidades",
    ],
    formHeading: "Envía tu brief",
    formDesc: "Rellena el formulario. Te respondemos con precio y plazo en menos de 1 hora (urgente: en 15 min).",
    fieldCompany: "Empresa",
    fieldCompanyPh: "Nombre de tu empresa",
    fieldContact: "Nombre de contacto",
    fieldContactPh: "Tu nombre",
    fieldEmail: "Email de contacto",
    fieldEmailPh: "email@empresa.com",
    fieldPhone: "Teléfono (opcional)",
    fieldPhonePh: "+34 600 000 000",
    fieldTurnaround: "Nivel de urgencia",
    fieldDescription: "Descripción del proyecto",
    fieldDescriptionPh: "Qué necesitas fabricar, para qué sirve, tolerancias importantes, acabado deseado...",
    fieldFile: "Archivo 3D o fotos (opcional)",
    fieldFileBtn: "Añadir archivo",
    submitBtn: "Enviar brief",
    submitBtnBusy: "Enviando...",
    successTitle: "Brief recibido",
    successMsg: "Te responderemos con precio y plazo antes de 1 hora. Si es urgente, en menos de 15 minutos.",
    errorAtLeastOne: "Introduce tu email o teléfono de contacto.",
    turnaroundOptions: [
      { value: "urgente", label: "Urgente — entrega en <4 h (+60%)" },
      { value: "expres", label: "Exprés — entrega en <24 h (+25%)" },
      { value: "estandar", label: "Estándar — entrega en <48 h (precio base)" },
    ],
    reviewsHeading: "Lo que dicen nuestros clientes",
    reviews: [
      { text: "Recibimos el prototipo a tiempo para la presentación con el cliente. Calidad perfecta y precio razonable.", author: "Director de Producto, startup de robótica" },
      { text: "Fabricaron 5 iteraciones en un día. Exactamente lo que necesitábamos para el sprint de diseño.", author: "Ingeniero de I+D, empresa de packaging" },
      { text: "NDA firmado antes de compartir nada. Muy profesional para ser un servicio local.", author: "CTO, empresa de hardware médico" },
    ],
    faqHeading: "Preguntas frecuentes",
    faqs: [
      {
        q: "¿Puedo pedir sin archivo 3D?",
        a: "Sí. Diseñamos la pieza desde una foto, un croquis o medidas verbales. Para piezas simples el diseño es gratuito; para geometrías complejas acordamos un coste de diseño antes de empezar.",
      },
      {
        q: "¿Cuánto cuesta el servicio urgente (<4 h)?",
        a: "El precio final es el precio base × 1,60 (es decir, +60%). El precio base se calcula con nuestro motor de precios en función del material, el peso y el tiempo de máquina. Te damos el precio exacto antes de confirmar el pedido.",
      },
      {
        q: "¿Puedo pedir tiradas de más de una unidad?",
        a: "Sí. Fabricamos tiradas cortas de 1 a 20 unidades del mismo modelo. Para tiradas de más de 5 unidades aplicamos descuento por volumen. Escríbenos el número de unidades en el brief.",
      },
      {
        q: "¿Qué tolerancias podéis garantizar?",
        a: "Con tecnología FDM (Bambu Lab X1C) logramos tolerancias de ±0,2 mm en dimensiones críticas. Para tolerancias más ajustadas (±0,1 mm) podemos orientar la pieza estratégicamente y usar parámetros de alta precisión con ligero aumento de precio.",
      },
      {
        q: "¿Ofrecéis postprocesado o pintado?",
        a: "Actualmente no hacemos pintado ni acabados químicos. Podemos lijado básico y eliminación de soportes. Para piezas de presentación recomendamos PETG o PLA con buen acabado de capas.",
      },
      {
        q: "¿Cómo funciona el primer prototipo gratis?",
        a: "En el primer pedido de empresa fabricamos una pieza pequeña (hasta 30 g y 1 hora de máquina) sin coste para que puedas comprobar la calidad de nuestra impresión antes de comprometerte con un pedido mayor. Menciona que es tu primer pedido al enviarnos el brief.",
      },
    ],
    ctaFinalHeading: "¿Listo para empezar?",
    ctaFinalDesc: "Envíanos el brief o escríbenos por WhatsApp. Presupuesto en menos de 1 hora.",
    relatedHeading: "Otros servicios de impresión 3D",
    related: [
      { label: "Prototipos 3D Barcelona", href: "/prototipos-3d-barcelona" },
      { label: "Prototipado rápido Barcelona", href: "/prototipado-rapido-barcelona" },
      { label: "Impresión 3D empresas Barcelona", href: "/impresion-3d-empresas-barcelona" },
      { label: "Impresión 3D urgente Barcelona", href: "/impresion-3d-urgente-barcelona" },
    ],
  },
  en: {
    htmlLang: "en",
    slug: "/en/prototyping-for-business",
    title: "Prototyping for Business Barcelona — Urgent <4 h",
    metaDesc: "3D prototyping for businesses in Barcelona. Urgent <4 h (+60%), express <24 h (+25%), standard <48 h. Design included, NDA available, VAT invoice.",
    breadcrumb: "Prototyping for Business",
    eyebrow: "BARCELONA · DELIVERY IN <48 H · DESIGN INCLUDED",
    h1: "Prototyping for business",
    heroDesc: "We manufacture functional and presentation prototypes for companies in Barcelona. Three urgency tiers with clear upfront pricing. Design from photo or measurements included. Invoice and NDA available.",
    ctaPrimary: "Send brief",
    ctaWa: "Message us on WhatsApp",
    facts: [
      { value: "<4 h", label: "Urgent" },
      { value: "<24 h", label: "Express" },
      { value: "<48 h", label: "Standard" },
      { value: "NDA", label: "available" },
    ],
    tiersHeading: "Three urgency tiers",
    tiersDesc: "Final price = base price × urgency multiplier. Quote always arrives before you confirm.",
    tiers: [
      {
        icon: <Zap className="w-5 h-5" />,
        name: "Urgent",
        time: "< 4 hours",
        multiplier: "+60%",
        desc: "Maximum priority queue. We start printing as soon as the order is confirmed. For presentations, product demos and last-minute prototypes.",
        color: "#F5A524",
      },
      {
        icon: <Clock className="w-5 h-5" />,
        name: "Express",
        time: "< 24 hours",
        multiplier: "+25%",
        desc: "Priority queue. We guarantee next-day delivery or pickup. For fast iteration cycles and tight client deadlines.",
        color: "#2F5BEA",
      },
      {
        icon: <Calendar className="w-5 h-5" />,
        name: "Standard",
        time: "< 48 hours",
        multiplier: "base price",
        desc: "Normal service pace. For planned orders without special urgency. Best value for money.",
        color: "#0F172A",
      },
    ],
    howHeading: "How it works for businesses",
    steps: [
      { n: "01", title: "Send the brief", desc: "Fill in the form with the description, dimensions, preferred material and urgency level. Attach a 3D file or photos if you have them." },
      { n: "02", title: "Get a quote", desc: "We send you price and timeline in under 1 hour (urgent: within 15 min). No commitment, no prior registration." },
      { n: "03", title: "Confirm and pay", desc: "You confirm by email or WhatsApp, make the payment online, and the part enters the print queue immediately." },
      { n: "04", title: "Pick up or receive", desc: "Pickup in Les Corts (Barcelona) or shipping throughout Spain. Urgent: in-person pickup at the studio in under 4 h." },
    ],
    includedHeading: "What's included",
    included: [
      { title: "Design from photo or measurements", desc: "No 3D file needed. We design the part from a photo or measurements and manufacture it. No extra cost for simple parts." },
      { title: "Invoice with VAT", desc: "We issue invoices for any Spanish or EU company. Order number, project reference, VAT number." },
      { title: "NDA available", desc: "We sign a non-disclosure agreement before sharing files or describing the project. Contact us by email to arrange it." },
      { title: "First prototype free", desc: "On your first business order we manufacture a small part (<30 g, <1 h machine) at no cost so you can check the quality." },
      { title: "Single point of contact", desc: "One person (Nico) manages your order from start to finish. Direct response, no tickets." },
      { title: "Fast iterations", desc: "If the first prototype needs adjustments, redesign is quick. We can iterate several times in the same day with the urgent service." },
    ],
    materialsHeading: "Available materials",
    materials: [
      { name: "PLA", props: "Presentation prototypes, models, complex geometries. Colours: 10+. Smooth finish." },
      { name: "PETG", props: "Semi-technical parts, partial transparency, basic chemical resistance. Colours: 6+." },
      { name: "ABS / ASA", props: "Technical prototypes, UV resistance, moderate temperature. For product engineering." },
      { name: "TPU", props: "Flexible parts: seals, housings, damping elements. Configurable hardness." },
      { name: "Nylon", props: "High mechanical strength, low friction. For jigs, fixtures and functional production parts." },
    ],
    applicationsHeading: "What it's used for",
    applications: [
      "Functional and presentation prototypes",
      "Manufacturing jigs and fixtures",
      "Architectural and interior design models",
      "Spare parts for machinery",
      "Demos and investor models",
      "Design validation components",
      "Custom accessories and supports",
      "Short runs of 1 to 20 units",
    ],
    formHeading: "Send your brief",
    formDesc: "Fill in the form. We reply with price and timeline in under 1 hour (urgent: within 15 min).",
    fieldCompany: "Company",
    fieldCompanyPh: "Your company name",
    fieldContact: "Contact name",
    fieldContactPh: "Your name",
    fieldEmail: "Contact email",
    fieldEmailPh: "email@company.com",
    fieldPhone: "Phone (optional)",
    fieldPhonePh: "+34 600 000 000",
    fieldTurnaround: "Urgency level",
    fieldDescription: "Project description",
    fieldDescriptionPh: "What you need made, what it's for, important tolerances, desired finish...",
    fieldFile: "3D file or photos (optional)",
    fieldFileBtn: "Add file",
    submitBtn: "Send brief",
    submitBtnBusy: "Sending...",
    successTitle: "Brief received",
    successMsg: "We'll reply with price and timeline within 1 hour. If urgent, within 15 minutes.",
    errorAtLeastOne: "Please provide your email or phone number.",
    turnaroundOptions: [
      { value: "urgente", label: "Urgent — delivery in <4 h (+60%)" },
      { value: "expres", label: "Express — delivery in <24 h (+25%)" },
      { value: "estandar", label: "Standard — delivery in <48 h (base price)" },
    ],
    reviewsHeading: "What our clients say",
    reviews: [
      { text: "We received the prototype in time for the client presentation. Perfect quality and reasonable price.", author: "Product Director, robotics startup" },
      { text: "They made 5 iterations in one day. Exactly what we needed for the design sprint.", author: "R&D Engineer, packaging company" },
      { text: "NDA signed before sharing anything. Very professional for a local service.", author: "CTO, medical hardware company" },
    ],
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        q: "Can I order without a 3D file?",
        a: "Yes. We design the part from a photo, sketch or verbal measurements. For simple parts design is free; for complex geometries we agree a design cost before starting.",
      },
      {
        q: "How much does the urgent service (<4 h) cost?",
        a: "The final price is base price × 1.60 (i.e. +60%). The base price is calculated using our pricing engine based on material, weight and machine time. We give you the exact price before you confirm the order.",
      },
      {
        q: "Can I order runs of more than one unit?",
        a: "Yes. We produce short runs of 1 to 20 units of the same model. For runs of more than 5 units we apply a volume discount. Write the number of units in the brief.",
      },
      {
        q: "What tolerances can you guarantee?",
        a: "With FDM technology (Bambu Lab X1C) we achieve tolerances of ±0.2 mm on critical dimensions. For tighter tolerances (±0.1 mm) we can strategically orient the part and use high-precision parameters with a slight price increase.",
      },
      {
        q: "Do you offer post-processing or painting?",
        a: "We don't currently do painting or chemical finishes. We can do basic sanding and support removal. For presentation parts we recommend PETG or PLA with a good layer finish.",
      },
      {
        q: "How does the free first prototype work?",
        a: "On your first business order we manufacture a small part (up to 30 g and 1 machine hour) at no cost so you can check our print quality before committing to a larger order. Mention it's your first order when sending the brief.",
      },
    ],
    ctaFinalHeading: "Ready to start?",
    ctaFinalDesc: "Send us the brief or message us on WhatsApp. Quote in under 1 hour.",
    relatedHeading: "Other 3D printing services",
    related: [
      { label: "Prototype Printing Barcelona", href: "/prototype-printing-barcelona" },
      { label: "Rapid Prototyping Barcelona", href: "/rapid-prototyping-barcelona" },
      { label: "3D Printing for Business Barcelona", href: "/3d-printing-for-business-barcelona" },
      { label: "Urgent 3D Printing Barcelona", href: "/impresion-3d-urgente-barcelona" },
    ],
  },
  ca: {
    htmlLang: "ca",
    slug: "/ca/prototips-per-a-empreses",
    title: "Prototips per a Empreses Barcelona — Urgent <4 h",
    metaDesc: "Prototipat 3D per a empreses a Barcelona. Urgent <4 h (+60%), exprés <24 h (+25%), estàndard <48 h. Disseny inclòs, NDA disponible, factura amb IVA.",
    breadcrumb: "Prototips per a Empreses",
    eyebrow: "BARCELONA · LLIURAMENT EN <48 H · DISSENY INCLÒS",
    h1: "Prototips per a empreses",
    heroDesc: "Fabriquem prototips funcionals i de presentació per a empreses a Barcelona. Tres nivells d'urgència amb preu clar des del principi. Disseny des de foto o mesures inclòs. Factura i NDA disponibles.",
    ctaPrimary: "Enviar brief",
    ctaWa: "Escriure'ns per WhatsApp",
    facts: [
      { value: "<4 h", label: "Urgent" },
      { value: "<24 h", label: "Exprés" },
      { value: "<48 h", label: "Estàndard" },
      { value: "NDA", label: "disponible" },
    ],
    tiersHeading: "Tres nivells d'urgència",
    tiersDesc: "Preu final = preu base × multiplicador d'urgència. El pressupost arriba sempre abans de confirmar.",
    tiers: [
      {
        icon: <Zap className="w-5 h-5" />,
        name: "Urgent",
        time: "< 4 hores",
        multiplier: "+60%",
        desc: "Cua màxima prioritat. Imprimim tan aviat com confirmem la comanda. Per a presentacions, demos de producte i prototips d'última hora.",
        color: "#F5A524",
      },
      {
        icon: <Clock className="w-5 h-5" />,
        name: "Exprés",
        time: "< 24 hores",
        multiplier: "+25%",
        desc: "Cua prioritària. Garantim lliurament o recollida l'endemà. Per a iteracions ràpides i terminis de client ajustats.",
        color: "#2F5BEA",
      },
      {
        icon: <Calendar className="w-5 h-5" />,
        name: "Estàndard",
        time: "< 48 hores",
        multiplier: "preu base",
        desc: "El ritme habitual del servei. Per a comandes planificades sense urgència especial. La millor relació qualitat-preu.",
        color: "#0F172A",
      },
    ],
    howHeading: "Com funciona per a empreses",
    steps: [
      { n: "01", title: "Envia el brief", desc: "Omple el formulari amb la descripció, dimensions, material preferit i nivell d'urgència. Adjunta arxiu 3D o fotos si en tens." },
      { n: "02", title: "Rep el pressupost", desc: "T'enviem preu i termini en menys d'1 hora (urgent: en 15 min). Sense compromís, sense registre previ." },
      { n: "03", title: "Confirma i paga", desc: "Confirmes per email o WhatsApp, fas el pagament online i la peça entra a la cua d'impressió immediatament." },
      { n: "04", title: "Recull o rep", desc: "Recollida a Les Corts (Barcelona) o enviament a tota Espanya. Urgent: recollida en mà a l'estudi en menys de 4 h." },
    ],
    includedHeading: "Què inclou el servei",
    included: [
      { title: "Disseny des de foto o mesures", desc: "No necessites arxiu 3D. Dissenyem la peça des d'una foto o mesures i la fabriquem. Sense cost addicional per a peces simples." },
      { title: "Factura amb IVA desglossat", desc: "Emitim factura per a qualsevol empresa espanyola o de la UE. Número de comanda, referència de projecte, NIF." },
      { title: "NDA disponible", desc: "Signem acord de confidencialitat abans de compartir arxius o descriure el projecte. Contacta per email per gestionar-lo." },
      { title: "Primer prototip gratuït", desc: "En la primera comanda d'empresa fabriquem una peça petita (<30 g, <1 h màquina) sense cost perquè comproves la qualitat." },
      { title: "Gestor de projecte", desc: "Un únic interlocutor (Nico) gestiona la teva comanda de principi a fi. Resposta directa, sense tickets." },
      { title: "Iteracions ràpides", desc: "Si el primer prototip necessita ajustos, el redisseny és ràpid. Podem iterar diverses vegades el mateix dia amb el servei urgent." },
    ],
    materialsHeading: "Materials disponibles",
    materials: [
      { name: "PLA", props: "Prototips de presentació, maquetes, geometries complexes. Colors: 10+. Acabat llis." },
      { name: "PETG", props: "Peces semitècniques, transparència parcial, resistència química bàsica. Colors: 6+." },
      { name: "ABS / ASA", props: "Prototips tècnics, resistència UV, temperatura moderada. Per a enginyeria de producte." },
      { name: "TPU", props: "Peces flexibles: juntes, carcasses, elements amortidors. Duresa configurable." },
      { name: "Nylon", props: "Alta resistència mecànica, baixa fricció. Per a jigs, útils i peces funcionals de producció." },
    ],
    applicationsHeading: "Per a què s'utilitza",
    applications: [
      "Prototips funcionals i de presentació",
      "Jigs i útils de fabricació",
      "Maquetes d'arquitectura i interiorisme",
      "Peces de recanvi per a maquinària",
      "Demos i models per a inversors",
      "Components per a validació de disseny",
      "Accessoris i suports a mida",
      "Tirades curtes d'1 a 20 unitats",
    ],
    formHeading: "Envia el teu brief",
    formDesc: "Omple el formulari. Et responem amb preu i termini en menys d'1 hora (urgent: en 15 min).",
    fieldCompany: "Empresa",
    fieldCompanyPh: "Nom de la teva empresa",
    fieldContact: "Nom de contacte",
    fieldContactPh: "El teu nom",
    fieldEmail: "Email de contacte",
    fieldEmailPh: "email@empresa.com",
    fieldPhone: "Telèfon (opcional)",
    fieldPhonePh: "+34 600 000 000",
    fieldTurnaround: "Nivell d'urgència",
    fieldDescription: "Descripció del projecte",
    fieldDescriptionPh: "Què necessites fabricar, per a què serveix, toleràncies importants, acabat desitjat...",
    fieldFile: "Arxiu 3D o fotos (opcional)",
    fieldFileBtn: "Afegir arxiu",
    submitBtn: "Enviar brief",
    submitBtnBusy: "Enviant...",
    successTitle: "Brief rebut",
    successMsg: "Et respondrem amb preu i termini abans d'1 hora. Si és urgent, en menys de 15 minuts.",
    errorAtLeastOne: "Introdueix el teu email o telèfon de contacte.",
    turnaroundOptions: [
      { value: "urgente", label: "Urgent — lliurament en <4 h (+60%)" },
      { value: "expres", label: "Exprés — lliurament en <24 h (+25%)" },
      { value: "estandar", label: "Estàndard — lliurament en <48 h (preu base)" },
    ],
    reviewsHeading: "El que diuen els nostres clients",
    reviews: [
      { text: "Vam rebre el prototip a temps per a la presentació amb el client. Qualitat perfecta i preu raonable.", author: "Director de Producte, startup de robòtica" },
      { text: "Van fabricar 5 iteracions en un dia. Exactament el que necessitàvem per a l'sprint de disseny.", author: "Enginyer d'I+D, empresa de packaging" },
      { text: "NDA signat abans de compartir res. Molt professional per a un servei local.", author: "CTO, empresa de hardware mèdic" },
    ],
    faqHeading: "Preguntes freqüents",
    faqs: [
      {
        q: "Puc demanar sense arxiu 3D?",
        a: "Sí. Dissenyem la peça des d'una foto, un croquis o mesures verbals. Per a peces simples el disseny és gratuït; per a geometries complexes acordem un cost de disseny abans de començar.",
      },
      {
        q: "Quant costa el servei urgent (<4 h)?",
        a: "El preu final és el preu base × 1,60 (és a dir, +60%). El preu base es calcula amb el nostre motor de preus en funció del material, el pes i el temps de màquina. Et donem el preu exacte abans de confirmar la comanda.",
      },
      {
        q: "Puc demanar tirades de més d'una unitat?",
        a: "Sí. Fabriquem tirades curtes d'1 a 20 unitats del mateix model. Per a tirades de més de 5 unitats apliquem descompte per volum. Escriu el nombre d'unitats al brief.",
      },
      {
        q: "Quines toleràncies podeu garantir?",
        a: "Amb tecnologia FDM (Bambu Lab X1C) aconseguim toleràncies de ±0,2 mm en dimensions crítiques. Per a toleràncies més ajustades (±0,1 mm) podem orientar la peça estratègicament i usar paràmetres d'alta precisió amb un lleuger augment de preu.",
      },
      {
        q: "Oferiu postprocessat o pintat?",
        a: "Actualment no fem pintat ni acabats químics. Podem fer llionat bàsic i eliminació de suports. Per a peces de presentació recomanem PETG o PLA amb bon acabat de capes.",
      },
      {
        q: "Com funciona el primer prototip gratuït?",
        a: "En la primera comanda d'empresa fabriquem una peça petita (fins a 30 g i 1 hora de màquina) sense cost perquè puguis comprovar la qualitat de la nostra impressió abans de comprometre't amb una comanda més gran. Menciona que és la teva primera comanda en enviar-nos el brief.",
      },
    ],
    ctaFinalHeading: "Llest per a començar?",
    ctaFinalDesc: "Envia'ns el brief o escriu-nos per WhatsApp. Pressupost en menys d'1 hora.",
    relatedHeading: "Altres serveis d'impressió 3D",
    related: [
      { label: "Prototips 3D Barcelona", href: "/prototipos-3d-barcelona" },
      { label: "Prototipat ràpid Barcelona", href: "/prototipado-rapido-barcelona" },
      { label: "Impressió 3D empreses Barcelona", href: "/ca/impressio-3d-empreses-barcelona" },
      { label: "Impressió 3D urgent Barcelona", href: "/impresion-3d-urgente-barcelona" },
    ],
  },
};

// ─── JSON-LD data builders ─────────────────────────────────────────────────────

function buildSchemas(c: typeof C["es"]) {
  const canonical = `${SITE_URL}${c.slug}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Dimension3D", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: c.breadcrumb, item: canonical },
    ],
  };
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.metaDesc,
    author: AUTHOR_REF,
    publisher: PUBLISHER_REF,
    datePublished: "2026-11-12",
    dateModified: "2026-11-12",
    inLanguage: c.htmlLang,
    url: canonical,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    image: SOCIAL_IMAGE_URL,
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return { canonical, breadcrumb, article, faq };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FactsStrip({ facts }: { facts: Array<{ value: string; label: string }> }) {
  return (
    <div style={{ background: '#F6F8FC', borderTop: '1px solid #E3E8F0', borderBottom: '1px solid #E3E8F0' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'center' }}>
        {facts.map((f, i) => (
          <div
            key={i}
            style={{
              flex: '1 1 0',
              padding: '20px 16px',
              textAlign: 'center',
              borderLeft: i > 0 ? '1px solid #E3E8F0' : undefined,
            }}
          >
            <div style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 22, color: '#0F172A', lineHeight: 1 }}>{f.value}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.08em', color: '#5B6577', textTransform: 'uppercase', marginTop: 4 }}>{f.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TierCard({ tier }: { tier: { icon: React.ReactNode; name: string; time: string; multiplier: string; desc: string; color: string } }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E3E8F0',
      borderRadius: 16,
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      borderTop: `3px solid ${tier.color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ color: tier.color }}>{tier.icon}</div>
        <span style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 18, color: '#0F172A' }}>{tier.name}</span>
      </div>
      <div>
        <div style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 28, color: tier.color }}>{tier.time}</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.06em', color: '#5B6577', textTransform: 'uppercase', marginTop: 2 }}>{tier.multiplier}</div>
      </div>
      <p style={{ fontSize: 14, color: '#5B6577', lineHeight: 1.6, margin: 0 }}>{tier.desc}</p>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: '1px solid #E3E8F0', padding: '0' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 0',
          background: 'none',
          border: 0,
          cursor: 'pointer',
          textAlign: 'left',
          gap: 16,
        }}
      >
        <span style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 600, fontSize: 15, color: '#0F172A', lineHeight: 1.4 }}>{q}</span>
        <span style={{ flexShrink: 0, color: '#5B6577' }}>{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 18, fontSize: 14, color: '#5B6577', lineHeight: 1.7 }}>{a}</div>
      )}
    </div>
  );
}

// ─── Brief form ────────────────────────────────────────────────────────────────

const MAX_FILES = 4;
const MAX_BYTES = 15 * 1024 * 1024;

function BriefForm({ c, lang }: { c: typeof C["es"]; lang: Lang }) {
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [turnaround, setTurnaround] = useState("estandar");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: File[]) => {
    const remaining = MAX_FILES - files.length;
    if (remaining <= 0) return;
    const valid: File[] = [];
    let anyOversized = false;
    for (const f of incoming.slice(0, remaining)) {
      if (f.size > MAX_BYTES) { anyOversized = true; continue; }
      valid.push(f);
    }
    if (anyOversized) setFileError("Archivo demasiado grande (máx. 15 MB)");
    else setFileError(null);
    if (valid.length > 0) setFiles(prev => [...prev, ...valid]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      setFormError(c.errorAtLeastOne);
      return;
    }
    setFormError(null);
    setEmailFailed(false);
    setIsSubmitting(true);

    try {
      const uploadedPaths: string[] = [];
      const uploadedNames: string[] = [];
      let filesFailed = 0;
      const timestamp = Date.now();

      for (const file of files) {
        const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const path = `${timestamp}-${sanitized}`;
        const { error: uploadErr } = await supabaseAnon.storage
          .from("print-requests")
          .upload(path, file);
        if (!uploadErr) {
          uploadedPaths.push(path);
          uploadedNames.push(file.name);
        } else {
          filesFailed++;
          console.error("File upload error:", uploadErr);
        }
      }

      supabaseAnon
        .from("quote_requests")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({
          contact_email: email.trim() || null,
          contact_phone: phone.trim() || null,
          material: "Prototipado empresas",
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
          product_slug: "prototipos-para-empresas",
          product_name: "Prototipos para Empresas",
          customization: {
            company: company.trim() || null,
            contact: contact.trim() || null,
            turnaround,
            description,
          },
        } as any)
        .then(({ error: dbErr }) => {
          if (dbErr) console.error("quote_requests insert error:", dbErr);
        });

      capture("b2b_brief_submitted", {
        turnaround,
        hasFiles: uploadedPaths.length > 0,
        language: lang,
        company: company.trim() ? "provided" : "empty",
      });

      const { error: fnErr } = await Promise.race([
        supabase.functions.invoke("send-quote-request", {
          body: {
            requestType: "design",
            filePaths: uploadedPaths,
            fileNames: uploadedNames,
            contactEmail: email.trim() || null,
            contactPhone: phone.trim() || null,
            description: `[BRIEF B2B — ${turnaround.toUpperCase()}]\nEmpresa: ${company}\nContacto: ${contact}\n\n${description}`,
            dimensions: null,
            quantity: null,
            photosFailed: filesFailed,
            language: lang,
          },
        }),
        new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error("TIMEOUT") }), 20000)
        ),
      ]);

      if (fnErr) throw fnErr;
      setIsSubmitted(true);
    } catch (err: any) {
      const code = (err?.message ?? "unknown").slice(0, 40);
      capture("submit_error", { stage: "b2b_brief_email", table: "-", code });
      setEmailFailed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E3E8F0',
    borderRadius: 8,
    fontSize: 14,
    color: '#0F172A',
    background: '#FFFFFF',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Inter Tight', system-ui, sans-serif",
    fontWeight: 600,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 6,
  };

  if (isSubmitted) {
    return (
      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#16A34A' }} />
        <h3 style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 20, color: '#0F172A', marginBottom: 8 }}>{c.successTitle}</h3>
        <p style={{ color: '#5B6577', fontSize: 15, lineHeight: 1.6 }}>{c.successMsg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div>
          <label style={labelStyle}>{c.fieldCompany}</label>
          <input style={inputStyle} type="text" placeholder={c.fieldCompanyPh} value={company} onChange={e => setCompany(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>{c.fieldContact}</label>
          <input style={inputStyle} type="text" placeholder={c.fieldContactPh} value={contact} onChange={e => setContact(e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div>
          <label style={labelStyle}>{c.fieldEmail} *</label>
          <input style={inputStyle} type="email" placeholder={c.fieldEmailPh} value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>{c.fieldPhone}</label>
          <input style={inputStyle} type="tel" placeholder={c.fieldPhonePh} value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>{c.fieldTurnaround}</label>
        <select
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
          value={turnaround}
          onChange={e => setTurnaround(e.target.value)}
        >
          {c.turnaroundOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={labelStyle}>{c.fieldDescription} *</label>
        <textarea
          style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
          placeholder={c.fieldDescriptionPh}
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label style={labelStyle}>{c.fieldFile}</label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".stl,.obj,.3mf,.step,.stp,.iges,.igs,.jpg,.jpeg,.png,.heic,.webp"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files) addFiles(Array.from(e.target.files)); }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            border: '1px solid #E3E8F0',
            borderRadius: 8,
            background: '#F6F8FC',
            fontSize: 14,
            color: '#5B6577',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <Image className="w-4 h-4" />
          {c.fieldFileBtn}
        </button>
        {files.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F6F8FC', border: '1px solid #E3E8F0', borderRadius: 6, padding: '4px 10px', fontSize: 13 }}>
                <span style={{ color: '#0F172A' }}>{f.name}</span>
                <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 0, cursor: 'pointer', color: '#5B6577', padding: 0, display: 'flex' }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {fileError && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 6 }}>{fileError}</p>}
      </div>
      {formError && <p style={{ color: '#DC2626', fontSize: 13 }}>{formError}</p>}
      {emailFailed && (
        <div style={{ background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#713F12' }}>
          El brief se ha guardado pero no se pudo enviar el email de notificación. Te contactaremos igualmente.
        </div>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '14px 28px',
          background: '#F5A524',
          color: '#0F172A',
          border: 0,
          borderRadius: 10,
          fontFamily: "'Inter Tight', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.7 : 1,
          alignSelf: 'flex-start',
        }}
      >
        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />{c.submitBtnBusy}</> : <><Send className="w-4 h-4" />{c.submitBtn}</>}
      </button>
    </form>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  lang: Lang;
}

export default function PrototypingLanding({ lang }: Props) {
  const c = C[lang];
  const { canonical, breadcrumb, article, faq } = buildSchemas(c);

  const waMsg = encodeURIComponent(
    lang === "en"
      ? "Hi, I need 3D printing for a business project."
      : lang === "ca"
        ? "Hola, necessito impressió 3D per a un projecte d'empresa."
        : "Hola, necesito impresión 3D para un proyecto de empresa."
  );

  const scrollToForm = () => {
    document.getElementById("brief-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const hreflang = {
    es: `${SITE_URL}/prototipos-para-empresas`,
    en: `${SITE_URL}/en/prototyping-for-business`,
    ca: `${SITE_URL}/ca/prototips-per-a-empreses`,
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Helmet>
        <html lang={c.htmlLang} />
        <title>{c.title}</title>
        <meta name="description" content={c.metaDesc} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="es" href={hreflang.es} />
        <link rel="alternate" hrefLang="en" href={hreflang.en} />
        <link rel="alternate" hrefLang="ca" href={hreflang.ca} />
        <link rel="alternate" hrefLang="x-default" href={hreflang.es} />
        <meta property="og:title" content={c.title} />
        <meta property="og:description" content={c.metaDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={SOCIAL_IMAGE_URL} />
        <meta name="twitter:title" content={c.title} />
        <meta name="twitter:description" content={c.metaDesc} />
        <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(article)}</script>
        <script type="application/ld+json">{JSON.stringify(faq)}</script>
      </Helmet>

      <LaunchOfferBanner />
      <Header />

      <main id="main-content">

        {/* ── S1: Hero ───────────────────────────────────────────────────────── */}
        <section style={{ background: '#0F172A', paddingTop: 'calc(var(--header-h) + 72px)', paddingBottom: 80 }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.1em', color: '#F5A524', textTransform: 'uppercase', marginBottom: 20 }}>
              {c.eyebrow}
            </div>
            <h1 style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 800, fontSize: 'clamp(36px, 5vw, 56px)', color: '#FFFFFF', lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
              {c.h1}
            </h1>
            <p style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', color: '#B8C4DA', lineHeight: 1.65, marginBottom: 36, maxWidth: 580 }}>
              {c.heroDesc}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button
                onClick={scrollToForm}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  background: '#F5A524',
                  color: '#0F172A',
                  border: 0,
                  borderRadius: 10,
                  fontFamily: "'Inter Tight', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                <Send className="w-4 h-4" />
                {c.ctaPrimary}
              </button>
              <a
                href={`${WHATSAPP_URL}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => capture("whatsapp_click", { source: "prototyping_hero", path: c.slug })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 24px',
                  background: 'transparent',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 10,
                  fontSize: 15,
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                }}
              >
                {c.ctaWa}
              </a>
            </div>
          </div>
        </section>

        {/* ── S2: Facts strip ────────────────────────────────────────────────── */}
        <FactsStrip facts={c.facts} />

        {/* ── S3: Speed tiers ────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 0', background: '#FFFFFF' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', color: '#0F172A', marginBottom: 12 }}>
              {c.tiersHeading}
            </h2>
            <p style={{ fontSize: 15, color: '#5B6577', marginBottom: 40, maxWidth: 600 }}>{c.tiersDesc}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              {c.tiers.map((tier, i) => <TierCard key={i} tier={tier} />)}
            </div>
          </div>
        </section>

        {/* ── S4: How it works ───────────────────────────────────────────────── */}
        <section style={{ padding: '80px 0', background: '#F6F8FC' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', color: '#0F172A', marginBottom: 48 }}>
              {c.howHeading}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
              {c.steps.map((step) => (
                <div key={step.n} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: '#F5A524', letterSpacing: '0.04em' }}>{step.n}</div>
                  <div style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 16, color: '#0F172A' }}>{step.title}</div>
                  <p style={{ fontSize: 14, color: '#5B6577', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── S5: What's included ────────────────────────────────────────────── */}
        <section style={{ padding: '80px 0', background: '#FFFFFF' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', color: '#0F172A', marginBottom: 40 }}>
              {c.includedHeading}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0 }}>
              {c.included.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '20px 0',
                    borderTop: '1px solid #E3E8F0',
                    paddingRight: 24,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#F5A524' }} />
                    <span style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{item.title}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#5B6577', lineHeight: 1.6, margin: 0, paddingLeft: 26 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── S6: Materials ──────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 0', background: '#F6F8FC' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', color: '#0F172A', marginBottom: 40 }}>
              {c.materialsHeading}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {c.materials.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 24, padding: '16px 0', borderTop: '1px solid #E3E8F0', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14, color: '#0F172A', minWidth: 80, flexShrink: 0 }}>{m.name}</span>
                  <span style={{ fontSize: 14, color: '#5B6577', lineHeight: 1.6, flex: 1 }}>{m.props}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── S7: Applications ───────────────────────────────────────────────── */}
        <section style={{ padding: '80px 0', background: '#FFFFFF' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', color: '#0F172A', marginBottom: 40 }}>
              {c.applicationsHeading}
            </h2>
            <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 0, listStyle: 'none', padding: 0, margin: 0 }}>
              {c.applications.map((app, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderTop: '1px solid #E3E8F0' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5A524', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#0F172A' }}>{app}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── S8: Brief form ─────────────────────────────────────────────────── */}
        <section id="brief-form" style={{ padding: '80px 0', background: '#0F172A' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ maxWidth: 720 }}>
              <h2 style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', color: '#FFFFFF', marginBottom: 12 }}>
                {c.formHeading}
              </h2>
              <p style={{ fontSize: 15, color: '#B8C4DA', marginBottom: 36 }}>{c.formDesc}</p>
              <div style={{ background: '#1E293B', borderRadius: 16, padding: '36px 32px' }}>
                <BriefForm c={c} lang={lang} />
              </div>
            </div>
          </div>
        </section>

        {/* ── S9: Reviews / Social proof ─────────────────────────────────────── */}
        <section style={{ padding: '80px 0', background: '#F6F8FC' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', color: '#0F172A', marginBottom: 40 }}>
              {c.reviewsHeading}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {c.reviews.map((r, i) => (
                <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E3E8F0', borderRadius: 14, padding: '24px 24px' }}>
                  <p style={{ fontSize: 15, color: '#0F172A', lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' }}>"{r.text}"</p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#5B6577', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{r.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── S10: FAQ ───────────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 0', background: '#FFFFFF' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', color: '#0F172A', marginBottom: 8 }}>
              {c.faqHeading}
            </h2>
            <div style={{ marginTop: 32 }}>
              {c.faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
            </div>
          </div>
        </section>

        {/* ── S11: Final CTA ─────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 0', background: '#0F172A' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 'clamp(28px, 4vw, 44px)', color: '#FFFFFF', marginBottom: 16 }}>
              {c.ctaFinalHeading}
            </h2>
            <p style={{ fontSize: 17, color: '#B8C4DA', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>{c.ctaFinalDesc}</p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
              <button
                onClick={scrollToForm}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  background: '#F5A524',
                  color: '#0F172A',
                  border: 0,
                  borderRadius: 10,
                  fontFamily: "'Inter Tight', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                <Send className="w-4 h-4" />
                {c.ctaPrimary}
              </button>
              <a
                href={`${WHATSAPP_URL}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => capture("whatsapp_click", { source: "prototyping_final_cta", path: c.slug })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 24px',
                  background: 'transparent',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 10,
                  fontSize: 15,
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                }}
              >
                {c.ctaWa}
              </a>
            </div>
          </div>
        </section>

        {/* ── S12: Related links ─────────────────────────────────────────────── */}
        <section style={{ padding: '48px 0', background: '#F6F8FC', borderTop: '1px solid #E3E8F0' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.08em', color: '#5B6577', textTransform: 'uppercase', marginBottom: 20 }}>
              {c.relatedHeading}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {c.related.map((r) => (
                <Link
                  key={r.href}
                  to={r.href}
                  style={{
                    padding: '7px 16px',
                    border: '1px solid #E3E8F0',
                    borderRadius: 100,
                    fontSize: 13,
                    color: '#5B6577',
                    textDecoration: 'none',
                    background: '#FFFFFF',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── S13: SEO text block ────────────────────────────────────────────── */}
        <section style={{ padding: '48px 0', background: '#FFFFFF', borderTop: '1px solid #E3E8F0' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
            {lang === "es" && (
              <div style={{ fontSize: 14, color: '#5B6577', lineHeight: 1.8 }}>
                <p>
                  El servicio de <strong>prototipos para empresas de Dimension 3D</strong> está diseñado para equipos de producto, ingeniería e I+D que necesitan piezas rápidamente sin los plazos y mínimos de los servicios industriales tradicionales. Con una sola persona gestionando tu pedido de principio a fin, puedes tener un prototipo en mano en menos de 4 horas desde la confirmación.
                </p>
                <p style={{ marginTop: 16 }}>
                  Utilizamos tecnología FDM (Bambu Lab X1C con doble extrusor AMS) para fabricar piezas en PLA, PETG, ABS/ASA, TPU y Nylon con tolerancias de ±0,2 mm. Para cada proyecto ofrecemos tres niveles de urgencia: <strong>urgente en menos de 4 horas (+60% sobre precio base)</strong>, exprés en menos de 24 horas (+25%) y estándar en menos de 48 horas (precio base). El presupuesto se envía antes de confirmar, sin sorpresas.
                </p>
              </div>
            )}
            {lang === "en" && (
              <div style={{ fontSize: 14, color: '#5B6577', lineHeight: 1.8 }}>
                <p>
                  Dimension 3D's <strong>business prototyping service</strong> is designed for product, engineering and R&D teams that need parts quickly without the lead times and minimums of traditional industrial services. With a single person managing your order from start to finish, you can have a prototype in hand in under 4 hours from confirmation.
                </p>
                <p style={{ marginTop: 16 }}>
                  We use FDM technology (Bambu Lab X1C with dual extruder AMS) to manufacture parts in PLA, PETG, ABS/ASA, TPU and Nylon with tolerances of ±0.2 mm. For each project we offer three urgency tiers: <strong>urgent in under 4 hours (+60% on base price)</strong>, express in under 24 hours (+25%) and standard in under 48 hours (base price). The quote is sent before you confirm — no surprises.
                </p>
              </div>
            )}
            {lang === "ca" && (
              <div style={{ fontSize: 14, color: '#5B6577', lineHeight: 1.8 }}>
                <p>
                  El servei de <strong>prototips per a empreses de Dimension 3D</strong> està dissenyat per a equips de producte, enginyeria i I+D que necessiten peces ràpidament sense els terminis i mínims dels serveis industrials tradicionals. Amb una sola persona gestionant la teva comanda de principi a fi, pots tenir un prototip en mà en menys de 4 hores des de la confirmació.
                </p>
                <p style={{ marginTop: 16 }}>
                  Utilitzem tecnologia FDM (Bambu Lab X1C amb doble extrusor AMS) per fabricar peces en PLA, PETG, ABS/ASA, TPU i Nylon amb toleràncies de ±0,2 mm. Per a cada projecte oferim tres nivells d'urgència: <strong>urgent en menys de 4 hores (+60% sobre preu base)</strong>, exprés en menys de 24 hores (+25%) i estàndard en menys de 48 hores (preu base). El pressupost s'envia abans de confirmar, sense sorpreses.
                </p>
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
