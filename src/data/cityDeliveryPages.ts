import { getMarket } from "@/config/intlMarkets";

// EN delivery day strings sourced from intlMarkets.ts so they stay in sync with native pages.
const DE_DAYS = getMarket("DE")!.enDeliveryDays; // "3–5 business days"
const NL_DAYS = getMarket("NL")!.enDeliveryDays; // "3–5 business days"
const FR_DAYS = getMarket("FR")!.enDeliveryDays; // "2–4 business days"
const IT_DAYS = getMarket("IT")!.enDeliveryDays; // "3–5 business days"
const PT_DAYS = getMarket("PT")!.enDeliveryDays; // "2–4 business days"

export interface CityPageConfig {
  slug: string;
  // When set, the paired-language counterpart of this page. The language
  // switcher navigates here instead of trying to translate the current URL
  // in place (used for Madrid: /madrid ES ↔ /3d-printing-madrid EN).
  altSlug?: string;
  lang: "en" | "es" | "fr";
  locale: string;
  city: string;
  country: string;
  deliveryDays: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  eyebrowText: string;
  heroSubtitle: string;
  introParagraph: string;
  deliveryTableRow: [string, string];
  shippingFaqQ: string;
  shippingFaqA: string;
  whatsappMsg: string;
  nativeSection?: {
    lang: string;
    headline: string;
    body: string;
    ctaLabel: string;
    /** Slug of the native-language equivalent page; when set the CTA navigates there */
    nativeUrl?: string;
  };
  articleInLanguage?: string;
  secondaryLink?: {
    to: string;
    label: string;
    description: string;
  };
  extraFaqs?: Array<{ q: string; a: string }>;
  localPickup?: {
    address: string;
    addressLocality: string;
    postalCode: string;
    addressRegion: string;
    addressCountry: string;
    latitude: number;
    longitude: number;
    schedulingNote: string;
    whatsappMsg: string;
    whatsappNumber: string;
  };
}

export const CITY_PAGES: CityPageConfig[] = [
  {
    slug: "/3d-printing-delivery-paris",
    lang: "fr",
    locale: "en_FR",
    city: "Paris",
    country: "France",
    deliveryDays: FR_DAYS,
    metaTitle: "3D Printing Service with Delivery to Paris — From €10",
    metaDescription: `Professional FDM 3D printing from Barcelona, delivered to Paris in ${FR_DAYS}. Upload your STL, instant quote in 1 hour. Minimum order €10.`,
    h1: "3D Printing Service with Delivery to Paris",
    eyebrowText: "Shipping to France · 2–4 Business Days",
    heroSubtitle: `Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to Paris in ${FR_DAYS}. From €10.`,
    introParagraph: `France has the fastest-growing 3D printing market in Europe, driven by its aerospace and defence industries — Safran, the Airbus supply chain network — the grandes écoles engineering culture at Arts et Métiers, ENPC, and Centrale Paris, and a design ecosystem that stretches from the product studios of Le Marais to the industrial manufacturers on the Île-de-France periphery. French customers across engineering, architecture, and industrial design typically combine high precision requirements with a preference for direct, technical communication with the people producing their parts. Parcels travel within the EU single market — no customs, no delays — and usually arrive at Paris addresses in ${FR_DAYS} from dispatch.`,
    deliveryTableRow: ["Paris & Île-de-France, France", FR_DAYS],
    shippingFaqQ: "How long does shipping from Barcelona to Paris take?",
    shippingFaqA: `Most orders arrive at Paris addresses in ${FR_DAYS} from dispatch. All shipments are fully tracked — you receive a tracking number as soon as the parcel leaves our Barcelona workshop. Delivery to Île-de-France suburbs is the same timeframe. No EU customs formalities apply between Spain and France.`,
    whatsappMsg: "Hi, I'm based in Paris and I'd like a quote for 3D printing.",
    nativeSection: {
      lang: "fr",
      headline: "Service d'impression 3D professionnel avec livraison à Paris",
      body: "Devis instantané en 1 heure. Livraison en 2–4 jours ouvrables depuis Barcelone. FDM en PLA, PETG, ABS, Nylon et composites carbone. Commande minimum 10 €.",
      ctaLabel: "Obtenir un devis",
      nativeUrl: "/fr/impression-3d-paris",
    },
    articleInLanguage: "fr",
    secondaryLink: {
      to: "/blog/prototipos-rapidos-piezas-funcionales-barcelona",
      label: "Functional Prototypes & Industrial Parts",
      description: "From rapid prototyping to production-ready functional parts",
    },
  },
  {
    slug: "/3d-printing-delivery-london",
    lang: "en",
    locale: "en_GB",
    city: "London",
    country: "United Kingdom",
    deliveryDays: "4–6 business days",
    metaTitle: "3D Printing Service with Delivery to London",
    metaDescription: "Professional FDM 3D printing from Barcelona, delivered to London in 4–6 business days. Pricing in euros, UK shipments handled routinely.",
    h1: "3D Printing Service with Delivery to London",
    eyebrowText: "Shipping to the UK · 4–6 Business Days",
    heroSubtitle: "Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to London in 4–6 business days. Shipping outside the EU is quoted individually.",
    introParagraph: "London's product development and creative industries ecosystem — from the hardware accelerators in Shoreditch and the design consultancies of South Kensington to the fabrication labs at Imperial, UCL, and the RCA — places consistent demand on fast, quality FDM prototyping. UK customers in product design, engineering, and the creative sector increasingly source from European studios for access to engineering-grade materials at competitive euro-denominated rates. We handle UK shipments as a routine part of our operations: post-Brexit export documentation is prepared by us, commercial invoices are provided with every UK order, and parcels typically reach London addresses in 4–6 business days.",
    deliveryTableRow: ["London & Greater London, UK", "4–6 business days"],
    shippingFaqQ: "Does Brexit affect shipping from Barcelona to London?",
    shippingFaqA: "Yes — UK shipments require export documentation, which we handle as standard. Parcels typically arrive in 4–6 business days from dispatch. Orders for personal use under £135 generally clear UK customs without additional import VAT. Commercial orders above this threshold may incur UK import VAT at 20%. We provide commercial invoices with all UK shipments to facilitate customs clearance. Note: instant checkout is available for EU countries only; UK orders are quoted and invoiced manually.",
    whatsappMsg: "Hi, I'm based in London and I'd like a quote for 3D printing.",
    articleInLanguage: "en",
    secondaryLink: {
      to: "/blog/recambios-piezas-rotas-impresion-3d-barcelona",
      label: "Replacement Parts & Custom Components",
      description: "One-off parts, repairs, and hard-to-source components",
    },
  },
  {
    slug: "/3d-printing-delivery-amsterdam",
    lang: "en",
    locale: "en_NL",
    city: "Amsterdam",
    country: "Netherlands",
    deliveryDays: NL_DAYS,
    metaTitle: "3D Printing Service with Delivery to Amsterdam — From €10",
    metaDescription: `Professional FDM 3D printing from Barcelona, delivered to Amsterdam in ${NL_DAYS}. Upload your STL, instant quote. Minimum order €10.`,
    h1: "3D Printing Service with Delivery to Amsterdam",
    eyebrowText: "Shipping to Netherlands · 3–5 Business Days",
    heroSubtitle: `Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to Amsterdam in ${NL_DAYS}. From €10.`,
    introParagraph: `The Netherlands punches well above its weight in European tech and maker culture — from the hardware startups along Amsterdam's Silicon Canal and the deep-tech companies in Eindhoven's Brainport region to the robotics labs at TU Delft and the precision manufacturing suppliers feeding ASML's supply chain. Dutch tech culture values speed, transparent pricing, and direct communication — exactly the operating model of our studio. Parcels travel within the EU single market and usually arrive at Amsterdam addresses in ${NL_DAYS} with no customs complications.`,
    deliveryTableRow: ["Amsterdam & Netherlands", NL_DAYS],
    shippingFaqQ: "How long does 3D print delivery from Barcelona to Amsterdam take?",
    shippingFaqA: `Parcels dispatched from our Barcelona workshop typically arrive at Amsterdam addresses in ${NL_DAYS} via tracked courier. Delivery to other Dutch cities — Rotterdam, The Hague, Utrecht, Eindhoven — is the same timeframe. No EU customs formalities apply between Spain and the Netherlands.`,
    whatsappMsg: "Hi, I'm based in Amsterdam and I'd like a quote for 3D printing.",
    nativeSection: {
      lang: "nl",
      headline: "3D-printservice met levering naar Amsterdam",
      body: "Professionele FDM-studio in Barcelona. Offerte in 1 uur, levering naar Amsterdam in 3–5 werkdagen. Vanaf €10, minimumbestelling €10.",
      ctaLabel: "Offerte aanvragen — Amsterdam",
      nativeUrl: "/nl/3d-printen-amsterdam",
    },
    articleInLanguage: "nl",
    secondaryLink: {
      to: "/impresion-3d-estudiantes-barcelona",
      label: "Student & Maker Projects",
      description: "One-off parts for students, makers, and side projects",
    },
  },
  {
    slug: "/3d-printing-delivery-berlin",
    lang: "en",
    locale: "en_DE",
    city: "Berlin",
    country: "Germany",
    deliveryDays: DE_DAYS,
    metaTitle: "3D Printing Service with Delivery to Berlin — From €10",
    metaDescription: `Professional FDM 3D printing from Barcelona, delivered to Berlin in ${DE_DAYS}. Upload your STL, instant quote in 1 hour. Minimum order €10.`,
    h1: "3D Printing Service with Delivery to Berlin",
    eyebrowText: "Shipping to Germany · 3–5 Business Days",
    heroSubtitle: `Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to Berlin in ${DE_DAYS}. From €10.`,
    introParagraph: `Germany is Europe's largest 3D printing market — roughly a third of EU additive manufacturing revenue flows through German industry, driven by the Mittelstand manufacturing base, the automotive supply chains feeding BMW, Mercedes, and Volkswagen, and the deep-tech hardware ventures building Industry 4.0 solutions. Berlin specifically sits at the intersection of this engineering culture and a startup ecosystem with intense demand for custom parts without industrial batch minimums: hardware founders in Mitte, precision engineers in Tempelhof, makers in Neukölln, and product designers who need direct communication with the person producing their parts rather than an automated print-farm queue. Parcels travel within the EU single market — no customs formalities — and usually reach Berlin in ${DE_DAYS} from dispatch.`,
    deliveryTableRow: ["Berlin & Brandenburg, Germany", DE_DAYS],
    shippingFaqQ: "How long does shipping from Barcelona to Berlin take?",
    shippingFaqA: `Standard tracked delivery from Barcelona to Berlin typically takes ${DE_DAYS}. As both Spain and Germany are EU member states, there are no customs formalities or border delays. Delivery to other German cities — Munich, Hamburg, Frankfurt, Cologne — is similarly ${DE_DAYS} from dispatch.`,
    whatsappMsg: "Hi, I'm based in Berlin and I'd like a quote for 3D printing.",
    nativeSection: {
      lang: "de",
      headline: "3D-Druckservice mit Lieferung nach Berlin",
      body: "Professionelles FDM-Druckstudio in Barcelona. Angebot in 1 Stunde, Lieferung nach Berlin in 3–5 Werktagen. Ab 10 €, Mindestbestellwert 10 €.",
      ctaLabel: "Angebot anfordern — Lieferung nach Berlin",
      nativeUrl: "/de/3d-druck-berlin",
    },
    articleInLanguage: "de",
    secondaryLink: {
      to: "/blog/prototipos-rapidos-piezas-funcionales-barcelona",
      label: "Functional Prototypes & Industrial Parts",
      description: "From rapid prototyping to production-ready functional parts",
    },
  },
  {
    slug: "/3d-printing-delivery-milan",
    lang: "en",
    locale: "en_IT",
    city: "Milan",
    country: "Italy",
    deliveryDays: IT_DAYS,
    metaTitle: "3D Printing Service with Delivery to Milan — From €10",
    metaDescription: `Professional FDM 3D printing from Barcelona, delivered to Milan in ${IT_DAYS}. Upload your STL, instant quote in 1 hour. Minimum order €10.`,
    h1: "3D Printing Service with Delivery to Milan",
    eyebrowText: "Shipping to Italy · 3–5 Business Days",
    heroSubtitle: `Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to Milan in ${IT_DAYS}. From €10.`,
    introParagraph: `Milan occupies a unique position at the crossroads of Italian industrial design, fashion prototyping, and precision manufacturing — from the product studios and architecture firms of Brera and Porta Nuova (home to Salone del Mobile's design-week ecosystem) to the automotive component suppliers feeding the Ferrari, Lamborghini, Alfa Romeo, and Stellantis supply chains across the Po Valley. Italian industry has a deep appreciation for surface finish, material quality, and precision tolerances — the same standards we apply to every print we produce. Parcels usually arrive at Milan and Lombardy addresses in ${IT_DAYS} within the EU single market. Whether you need architecture models, automotive component prototypes, fashion accessory iterations, or functional mechanical parts, our full FDM material range covers Italian design's broad requirements.`,
    deliveryTableRow: ["Milan & Lombardy, Italy", IT_DAYS],
    shippingFaqQ: "How long does 3D printing delivery from Barcelona to Milan take?",
    shippingFaqA: `Parcels dispatched from our Barcelona workshop typically reach Milan in ${IT_DAYS} via tracked courier. Delivery to other northern Italian cities — Turin, Venice, Genoa, Bologna, Verona — is similarly ${IT_DAYS}. No EU customs delays apply between Spain and Italy.`,
    whatsappMsg: "Hi, I'm based in Milan and I'd like a quote for 3D printing.",
    nativeSection: {
      lang: "it",
      headline: "Servizio di stampa 3D con consegna a Milano",
      body: "Studio FDM professionale a Barcellona. Preventivo in 1 ora, consegna a Milano in 3–5 giorni lavorativi. Da €10, ordine minimo €10.",
      ctaLabel: "Richiedi preventivo — consegna a Milano",
      nativeUrl: "/it/stampa-3d-milano",
    },
    articleInLanguage: "it",
    secondaryLink: {
      to: "/blog/prototipos-rapidos-piezas-funcionales-barcelona",
      label: "Functional Prototypes & Industrial Parts",
      description: "From rapid prototyping to production-ready functional parts",
    },
  },
  {
    slug: "/3d-printing-delivery-rome",
    lang: "en",
    locale: "en_IT",
    city: "Rome",
    country: "Italy",
    deliveryDays: IT_DAYS,
    metaTitle: "3D Printing Service with Delivery to Rome — From €10",
    metaDescription: `Professional FDM 3D printing from Barcelona, delivered to Rome in ${IT_DAYS}. Upload your STL, instant quote in 1 hour. Minimum order €10.`,
    h1: "3D Printing Service with Delivery to Rome",
    eyebrowText: "Shipping to Italy · 3–5 Business Days",
    heroSubtitle: `Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to Rome in ${IT_DAYS}. From €10.`,
    introParagraph: `Rome and the Lazio region occupy a different industrial niche from the northern Italian manufacturing belt — the region hosts major architecture and urban planning firms, the engineering and design faculties at La Sapienza and Tor Vergata universities, archaeological conservation and restoration labs, government and institutional engineering projects, and a growing cluster of creative and digital media companies. These sectors generate consistent demand for scale models, precision prototypes, and custom components that traditional manufacturing cannot supply at short notice and small quantities. Parcels from our Barcelona studio usually arrive at Rome and Lazio addresses in ${IT_DAYS} within the EU — fully tracked, no customs formalities.`,
    deliveryTableRow: ["Rome & Lazio, Italy", IT_DAYS],
    shippingFaqQ: "How long does delivery from Barcelona to Rome take?",
    shippingFaqA: `Parcels dispatched from our Barcelona workshop typically arrive at Rome addresses in ${IT_DAYS}. Delivery to other central Italian cities — Florence, Naples, Bologna — is similarly ${IT_DAYS}. All shipments are fully tracked from dispatch, and no EU customs formalities apply between Spain and Italy.`,
    whatsappMsg: "Hi, I'm based in Rome and I'd like a quote for 3D printing.",
    nativeSection: {
      lang: "it",
      headline: "Servizio di stampa 3D con consegna a Roma",
      body: "Studio FDM professionale a Barcellona. Preventivo in 1 ora, consegna a Roma in 3–5 giorni lavorativi. Da €10, ordine minimo €10.",
      ctaLabel: "Richiedi preventivo — consegna a Roma",
      nativeUrl: "/it/stampa-3d-roma",
    },
    articleInLanguage: "it",
    secondaryLink: {
      to: "/blog/prototipos-rapidos-piezas-funcionales-barcelona",
      label: "Functional Prototypes & Industrial Parts",
      description: "From rapid prototyping to production-ready functional parts",
    },
  },
  {
    slug: "/3d-printing-delivery-lisbon",
    lang: "en",
    locale: "en_PT",
    city: "Lisbon",
    country: "Portugal",
    deliveryDays: PT_DAYS,
    metaTitle: "3D Printing Service with Delivery to Lisbon — From €10",
    metaDescription: `Professional FDM 3D printing from Barcelona, delivered to Lisbon in ${PT_DAYS}. Upload your STL, instant quote in 1 hour. Minimum order €10.`,
    h1: "3D Printing Service with Delivery to Lisbon",
    eyebrowText: "Shipping to Portugal · 2–4 Business Days",
    heroSubtitle: `Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to Lisbon in ${PT_DAYS}. From €10.`,
    introParagraph: `Lisbon has transformed over the past decade into one of Europe's most dynamic startup and innovation hubs — from the creative manufacturing at Beato Tech City and LX Factory to the engineering ventures energised by Web Summit, NOVA SBE, and IST's technology transfer programmes. As Portugal's immediate Iberian neighbour, Barcelona offers Lisbon one of our fastest EU shipping connections: parcels typically arrive in ${PT_DAYS} from dispatch. The combination of Iberian logistics, a shared EU regulatory framework, and no customs barrier makes this one of our smoothest international supply routes for customers needing quality FDM parts fast.`,
    deliveryTableRow: ["Lisbon & Portugal", PT_DAYS],
    shippingFaqQ: "How quickly can you deliver 3D prints to Lisbon?",
    shippingFaqA: `Lisbon is one of our fastest destinations: parcels from Barcelona typically arrive in ${PT_DAYS} via tracked courier. Porto and other Portuguese cities are within the same timeframe. No EU customs formalities apply between Spain and Portugal, and all shipments are tracked from our workshop door to yours.`,
    whatsappMsg: "Hi, I'm based in Lisbon and I'd like a quote for 3D printing.",
    nativeSection: {
      lang: "pt",
      headline: "Serviço de impressão 3D com entrega em Lisboa",
      body: "Estúdio FDM profissional em Barcelona. Orçamento em 1 hora, entrega em Lisboa em 2–4 dias úteis. A partir de €10, encomenda mínima €10.",
      ctaLabel: "Pedir orçamento — entrega em Lisboa",
      nativeUrl: "/pt/impressao-3d-lisboa",
    },
    articleInLanguage: "pt",
  },
  {
    slug: "/3d-printing-delivery-new-york",
    lang: "en",
    locale: "en_US",
    city: "New York",
    country: "United States",
    deliveryDays: "7–10 business days",
    metaTitle: "3D Printing Service with Delivery to New York",
    metaDescription: "Professional FDM 3D printing from Barcelona, delivered to New York in 7–10 business days. Upload your STL, get a quote in 1 hour. Minimum order €10.",
    h1: "3D Printing Service with Delivery to New York",
    eyebrowText: "Shipping to the USA · 7–10 Business Days",
    heroSubtitle: "Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to New York in 7–10 business days. Shipping outside the EU is quoted individually.",
    introParagraph: "New York's maker and product development community — from the hardware startups at Brooklyn Navy Yard and the design studios in DUMBO to the fabrication labs at NYU, Columbia, and Pratt Institute — increasingly sources from European studios for FDM work that demands material range, precision, and direct communication unavailable at domestic print farms. The honest transit picture: parcels leave our Barcelona studio and arrive at NYC addresses in 7–10 business days, clearing US customs at JFK or Newark. What makes the cross-Atlantic journey worthwhile is European manufacturing precision standards, a broader engineering-grade material range, and euro-denominated pricing that is genuinely competitive for US customers at current exchange rates. Personal orders under the $800 US de minimis threshold typically clear customs without additional duties.",
    deliveryTableRow: ["New York City, USA", "7–10 business days"],
    shippingFaqQ: "How does shipping from Barcelona to New York work?",
    shippingFaqA: "Parcels are dispatched from our Barcelona studio and typically arrive at New York City addresses in 7–10 business days. All shipments are tracked. They clear US customs at the port of entry (usually JFK or Newark). Personal orders under $800 are generally below the US de minimis threshold and clear without additional duties. Commercial orders above $800 may be subject to US import duties — we provide commercial invoices with all US shipments to facilitate customs clearance.",
    whatsappMsg: "Hi, I'm based in New York and I'd like a quote for 3D printing.",
    articleInLanguage: "en",
  },
  {
    slug: "/madrid",
    altSlug: "/3d-printing-madrid",
    lang: "es",
    locale: "es_ES",
    city: "Madrid",
    country: "España",
    deliveryDays: "1–2 días hábiles",
    metaTitle: "Impresión 3D en Madrid — Precios desde 10€, Envío 1–2 Días",
    metaDescription: "Impresión 3D FDM entregada en Madrid en 1–2 días hábiles desde Barcelona. Desde 10€, presupuesto en 1 hora. Prototipos, piezas funcionales y recambios.",
    h1: "Impresión 3D en Madrid — Precios desde 10€, Entrega en 1–2 Días",
    eyebrowText: "Envío a Madrid · 1–2 Días Hábiles",
    heroSubtitle: "Estudio FDM profesional con sede en Barcelona. Sube tu STL o STEP, recibe presupuesto en 1 hora y entrega a Madrid en 1–2 días hábiles con mensajería seguida. Desde €10.",
    introParagraph: `Madrid es la capital de España y el mayor polo tecnológico e industrial del país. Los precios de impresión 3D en Madrid con entrega rápida desde Barcelona son exactamente los mismos que para cualquier otro punto de España: desde 10€ por pieza, sin tarifa de configuración y con presupuesto confirmado en menos de 1 hora en días laborables.

La Comunidad de Madrid concentra un ecosistema industrial y tecnológico de primer orden. El Corredor del Henares — el mayor corredor industrial de España en términos de superficie logística — alberga empresas de logística, farmacéutica, química y electrónica que generan una demanda constante de piezas a medida, utillaje de producción y prototipos funcionales. El municipio de Getafe es uno de los polos aeroespaciales más importantes de Europa: Airbus Defence and Space, la División de Aviones de Transporte Militar, talleres de mecanizado de precisión y una cadena de proveedores tier-1 y tier-2. La impresión 3D encaja en este entorno como solución para prototipos de componentes, plantillas de verificación, útiles de ensamblaje y piezas de repuesto con plazos ajustados.

Más al norte, el municipio de Alcobendas y el Parque Tecnológico de Tres Cantos concentran sedes de empresas como Indra, GMV, Repsol y numerosas multinacionales tecnológicas con departamentos de I+D activos. Estos entornos demandan ciclos rápidos de prototipado: de archivo CAD a pieza física en 24–72 horas, con materiales que van del PLA de concepto al Nylon-CF de validación estructural.

El tejido de startups de Madrid — desde las aceleradoras de La Nave y el hub de South Summit hasta el ecosistema de diseño de producto en Lavapiés y Malasaña — genera pedidos frecuentes de primeras iteraciones de hardware, carcasas para electrónica, piezas de presentación y prototipos de validación de usuario. Muchos equipos de producto en Madrid utilizan servicios de impresión 3D de forma continua a lo largo del ciclo de desarrollo, con entregas de 1–2 días hábiles que permiten iterar en paralelo con el trabajo de ingeniería.

Las universidades técnicas de la Comunidad de Madrid — la Universidad Politécnica de Madrid (UPM, con más de 40.000 estudiantes de ingeniería), la Universidad Carlos III en Leganés y la Universidad Rey Juan Carlos — generan una demanda constante de piezas para proyectos de fin de grado, investigación aplicada y laboratorios de prototipado. Trabajamos habitualmente con estudiantes y equipos de investigación de estas instituciones.

El proceso es el mismo independientemente del tamaño del pedido: subes tu archivo STL, STEP, OBJ o 3MF (o nos envías una foto si no tienes archivo), recibes un presupuesto desglosado en menos de 1 hora, apruebas el precio y producimos la pieza. Enviamos a Madrid con mensajería seguida — la mayoría de pedidos llegan al día siguiente o en dos días hábiles. Para proyectos con necesidades de materiales específicos (Polycarbonato, Nylon PA12, Nylon-CF, ABS para alta temperatura o TPU para piezas flexibles), te recomendamos la opción correcta en el presupuesto.

Sin pedido mínimo por encima de 10€, sin comisiones de plataforma, sin burocracia: subes tu archivo, nosotros producimos y tú recibes la pieza en Madrid.`,
    deliveryTableRow: ["Madrid y Comunidad de Madrid", "1–2 días hábiles"],
    shippingFaqQ: "¿Cuánto tarda el envío de Barcelona a Madrid?",
    shippingFaqA: "Los pedidos se producen en nuestro taller de Barcelona y llegan a domicilios en Madrid en 1–2 días hábiles mediante mensajería estándar con seguimiento. Para muchos envíos, la entrega se produce al día siguiente del despacho. Todos los envíos incluyen número de seguimiento en cuanto el paquete sale del taller.",
    whatsappMsg: "Hola, soy de Madrid y me gustaría un presupuesto para impresión 3D con entrega desde Barcelona.",
    articleInLanguage: "es",
    extraFaqs: [
      {
        q: "¿Cuánto cuesta la impresión 3D con entrega a Madrid?",
        a: "El pedido mínimo es de 10€. El precio final depende del peso de la pieza en gramos, el tiempo de impresión y el material seleccionado. La mayoría de piezas pequeñas de uso doméstico o industrial están entre 10€ y 40€. El envío a Madrid tiene un coste estándar de mensajería con seguimiento, habitualmente al día siguiente del despacho. Usa la calculadora de esta página para obtener un presupuesto orientativo al instante.",
      },
      {
        q: "¿Trabajáis con empresas e ingenieros de Madrid?",
        a: "Sí. Trabajamos habitualmente con startups, estudios de ingeniería, empresas del sector aeroespacial, equipos de I+D y fabricantes de la Comunidad de Madrid. Para proyectos empresariales ofrecemos factura con IVA, firma de NDA para proyectos confidenciales y reencargos rápidos sobre archivos ya validados.",
      },
      {
        q: "¿Qué materiales están disponibles para envío a Madrid?",
        a: "Imprimimos en PLA, PETG, ABS, ASA, TPU flexible, Nylon (PA12/PA6), Polycarbonato y compositos con fibra de carbono. Te recomendamos el material más adecuado según la función de tu pieza — resistencia mecánica, temperatura de trabajo, flexibilidad o acabado superficial.",
      },
      {
        q: "¿Podéis hacer prototipos iterativos para proyectos en Madrid?",
        a: "Sí. El plazo estándar de 1–2 días hábiles permite ciclos de iteración rápidos. Si necesitas dos o tres versiones de la misma geometría, las podemos producir en días consecutivos. Para proyectos urgentes ofrecemos servicio express en 24–48 horas.",
      },
    ],
  },
  {
    slug: "/3d-printing-madrid",
    altSlug: "/madrid",
    lang: "en",
    locale: "en_US",
    city: "Madrid",
    country: "Spain",
    deliveryDays: "1–2 business days",
    metaTitle: "3D Printing in Madrid — Prices from €10, 1–2 Day Delivery",
    metaDescription: "FDM 3D printing from Barcelona, delivered to Madrid in 1–2 business days. Prices from €10, quote in 1 hour. Prototypes, functional parts, spare parts.",
    h1: "3D Printing in Madrid — From €10, Delivered in 1–2 Days",
    eyebrowText: "Delivery to Madrid · 1–2 Business Days",
    heroSubtitle: "Barcelona-based FDM studio. Upload your STL or STEP, get a quote in one hour, delivery to Madrid in 1–2 business days via tracked courier. From €10.",
    introParagraph: "Madrid is Spain's industrial and technology hub — from the startups of the Corredor del Henares and the aerospace suppliers of Getafe to the product design studios of Malasaña and the precision engineering workshops of Leganés. We produce your part at our FDM studio in Barcelona and ship it to Madrid via tracked courier in 1–2 business days. Human-confirmed quote in under one hour, direct WhatsApp communication with the team producing your part, transparent pricing in euros. Minimum order €10, no marketplace commission.",
    deliveryTableRow: ["Madrid & Comunidad de Madrid", "1–2 business days"],
    shippingFaqQ: "How long does shipping from Barcelona to Madrid take?",
    shippingFaqA: "Orders are produced at our Barcelona workshop and arrive at Madrid addresses in 1–2 business days via tracked standard courier. Many shipments arrive the business day after dispatch. Every order ships with a tracking number as soon as the parcel leaves the workshop.",
    whatsappMsg: "Hi, I'm in Madrid and I'd like a quote for 3D printing delivered from Barcelona.",
    articleInLanguage: "en",
  },
  {
    slug: "/impresion-3d-con-entrega-a-valencia",
    lang: "es",
    locale: "es_ES",
    city: "Valencia",
    country: "España",
    deliveryDays: "1–2 días hábiles",
    metaTitle: "Impresión 3D en Valencia — Desde 10€, Envío 1–2 Días",
    metaDescription: "Servicio de impresión 3D FDM con entrega a Valencia en 1–2 días hábiles desde Barcelona. Presupuesto en 1 hora, desde 10€. Prototipado rápido e industrial.",
    h1: "Impresión 3D en Valencia — Entrega en 1–2 Días Hábiles",
    eyebrowText: "Envío a Valencia · 1–2 Días Hábiles",
    heroSubtitle: "Estudio FDM en Barcelona. Sube tu STL o STEP, recibe presupuesto en 1 hora, entrega a Valencia en 1–2 días hábiles con mensajería seguida. Desde 10€.",
    introParagraph: `Valencia es la tercera ciudad de España y uno de sus polos industriales más dinámicos. La Comunitat Valenciana tiene una base económica diversificada que incluye automoción, cerámica y azulejos, mueble y madera, agroalimentación, calzado, textil y un sector tecnológico en expansión. Todo ello genera una demanda constante de piezas a medida, prototipos funcionales, utillaje y recambios que la impresión 3D puede satisfacer con rapidez y sin los mínimos de producción que impone el moldeo por inyección.

La industria de automoción es la más destacada: la planta de Ford en Almussafes y su extensa red de proveedores tier-1 y tier-2 requieren prototipos de componentes, plantillas de verificación y utillaje de producción con plazos ajustados. El sector cerámico de la Comunitat Valenciana — el mayor clúster de cerámica de construcción de Europa — utiliza impresión 3D para prototipar nuevas formas y diseños antes de llevarlos a producción en serie. Los fabricantes de mueble del arco Paterna–Manises–L'Eliana incorporan piezas funcionales impresas para mecanismos, herrajes a medida y piezas de exposición. Y la comunidad de makers, diseñadores de producto y estudios de ingeniería que orbitan alrededor de la Universitat Politècnica de València, del Parc Tecnològic y de espacios como Las Naves generan una demanda sostenida de iteraciones rápidas de prototipo.

Trabajar con un servicio de impresión 3D profesional en lugar de una solución de escritorio marca la diferencia en cuanto a calidad de la pieza, selección de material y plazos predecibles. Desde Barcelona podemos imprimir en PLA, PETG, ABS, ASA, TPU flexible, Nylon y compostos de fibra de carbono, con los parámetros correctos para cada aplicación. Las piezas salen del taller en 24–72 horas tras confirmar el presupuesto, y llegan a Valencia frecuentemente al día siguiente del despacho.

El proceso es directo: subes tu archivo STL, STEP, OBJ o 3MF (o nos envías una foto de la pieza si no tienes archivo), recibes un presupuesto transparente en menos de 1 hora en días laborables, apruebas el precio y te enviamos la pieza. No hay tarifas de configuración, no hay pedido mínimo por encima de los 10€, y cada pieza se revisa antes de salir del taller. Comunicación directa por WhatsApp en español, sin formularios que tardan días en responder.

Para proyectos industriales valencianos que necesitan piezas de forma regular, guardamos el archivo y gestionamos reencargos sin fricciones. Para prototipos iterativos — cuando necesitas probar tres versiones de una geometría antes de confirmar el diseño final — el plazo de 1–2 días hábiles entre pedidos hace que la velocidad de iteración sea comparable a tener la impresora in-house, sin los costes de mantenimiento ni la curva de aprendizaje.`,
    deliveryTableRow: ["Valencia y Comunitat Valenciana", "1–2 días hábiles"],
    shippingFaqQ: "¿Cuánto tarda un pedido de Barcelona a Valencia?",
    shippingFaqA: "Los pedidos se envían desde Barcelona y llegan a Valencia en 1–2 días hábiles mediante mensajería estándar con seguimiento. La Comunitat Valenciana es una de nuestras zonas de entrega más rápidas — en muchos casos el pedido llega al día siguiente del despacho. También ofrecemos recogida en Barcelona con cita previa.",
    whatsappMsg: "Hola, soy de Valencia y me gustaría un presupuesto para impresión 3D.",
    nativeSection: {
      lang: "ca",
      headline: "Servei d'impressió 3D professional amb lliurament a València",
      body: "Pressupost instantani en 1 hora. Lliurament en 1–2 dies hàbils des de Barcelona. FDM en PLA, PETG, ABS, Nylon i compostos de fibra de carboni. Sense comanda mínima.",
      ctaLabel: "Demanar pressupost",
    },
    articleInLanguage: "es",
    extraFaqs: [
      {
        q: "¿Cuánto cuesta la impresión 3D con entrega a Valencia?",
        a: "El pedido mínimo es de 10€. El precio final depende del peso de la pieza (gramos de filamento), el tiempo de impresión y el material. La mayoría de piezas pequeñas de uso doméstico o industrial están entre 10€ y 40€. El envío a Valencia tiene un coste estándar de mensajería con seguimiento. Usa la calculadora de esta página para obtener un presupuesto orientativo al instante.",
      },
      {
        q: "¿Imprimís para empresas industriales en Valencia?",
        a: "Sí. Trabajamos habitualmente con startups, estudios de ingeniería, fabricantes de mueble, empresas del sector cerámico y proveedores de automoción de la Comunitat Valenciana. Para proyectos empresariales ofrecemos factura con IVA, firma de NDA para proyectos confidenciales y capacidad de reencargos rápidos sobre archivos ya validados.",
      },
      {
        q: "¿Qué materiales están disponibles para envío a Valencia?",
        a: "Imprimimos en PLA, PETG, ABS, ASA, TPU flexible, Nylon (PA12/PA6), Polycarbonato y variantes con fibra de carbono. Te recomendamos el material más adecuado según la función de tu pieza — resistencia mecánica, temperatura de trabajo, flexibilidad o acabado superficial.",
      },
      {
        q: "¿Puedo pedir prototipos iterativos con entrega rápida a Valencia?",
        a: "Sí. El plazo estándar de 1–2 días hábiles permite ciclos de iteración rápidos para prototipado de producto. Si necesitas dos o tres versiones de una misma geometría, las podemos producir en días consecutivos. Para proyectos urgentes ofrecemos servicio express en 24–48 horas.",
      },
      {
        q: "¿Imprimís piezas industriales o solo decorativas?",
        a: "Fabricamos todo tipo de piezas: recambios funcionales, utillaje de producción, plantillas de verificación, prototipos de ingeniería, piezas de exposición y artículos personalizados. El material y los parámetros de impresión se seleccionan según la función real de la pieza, no el más económico por defecto.",
      },
    ],
  },
  {
    slug: "/impresion-3d-sevilla",
    altSlug: "/3d-printing-sevilla",
    lang: "es",
    locale: "es_ES",
    city: "Sevilla",
    country: "España",
    deliveryDays: "2–3 días hábiles",
    metaTitle: "Impresión 3D en Sevilla — Producción Local, Desde 10€",
    metaDescription: "Impresión 3D FDM producida localmente en Sevilla con recogida en Av. Parsi 21 (cita previa) o envío a toda la provincia. Presupuesto en 1 hora. Desde 10€.",
    h1: "Impresión 3D en Sevilla — Producción Local y Desde 10€",
    eyebrowText: "Recogida en Sevilla · Cita Previa",
    heroSubtitle: "Tu pieza, impresa por nuestro maker local en Sevilla y verificada con fotos antes de cada entrega. Recógela en Av. Parsi 21 con cita previa, o la enviamos a cualquier punto de la provincia. Presupuesto en 1 hora, desde €10.",
    introParagraph: `Sevilla es uno de los grandes polos aeroespaciales de Europa — junto a Toulouse y Hamburgo, es una de las tres únicas ciudades del continente con una línea de montaje final de aviones, gracias a la planta de Airbus Defence and Space en San Pablo y a proveedores tier-1 como Alestis Aerospace en el parque tecnológico Aerópolis. La impresión 3D tiene aplicación directa en este entorno: prototipado de componentes de aeroestructura, útiles de ensamblaje, plantillas de verificación dimensional y piezas de apoyo a la producción con plazos ajustados.

A esto se suma una comunidad de ingeniería activa en la Escuela Técnica Superior de Ingeniería (ETSI) de la Universidad de Sevilla — una de las escuelas de ingeniería industrial y aeronáutica con más tradición de España — y un tejido de empresas tecnológicas y startups que ha crecido en los últimos años alrededor del Parque Científico y Tecnológico Cartuja. Ingenieros y diseñadores de producto de este ecosistema utilizan la impresión 3D para ciclos rápidos de prototipado: de archivo a pieza física en 24–72 horas, sin los tiempos de espera del moldeo por inyección ni los mínimos de producción que hacen inviable la fabricación pequeña.

Sevilla tiene también un tejido artesanal y cultural singular. La Feria de Abril y la Semana Santa generan una demanda de piezas decorativas, complementos, accesorios y elementos de atrezo que la impresión 3D puede satisfacer con rapidez y personalización. La artesanía sevillana convive con la industria: talleres de forja, carpintería y cerámica incorporan piezas impresas en 3D para completar proyectos donde el molde tradicional no tiene la geometría necesaria o el plazo es demasiado corto.

Lo que hace diferente nuestro servicio en Sevilla es la producción local: trabajamos con un maker verificado en la ciudad que imprime cada pieza, la revisa con fotografías de control de calidad y la tiene lista para recogida en Av. Parsi 21 (cita previa por WhatsApp) o la envía a cualquier punto de Sevilla y su provincia. Esto elimina el tiempo de tránsito desde Barcelona para pedidos locales y permite una comunicación directa en persona si el proyecto lo requiere.

El proceso es directo: subes tu archivo STL, STEP, OBJ o 3MF (o nos envías una foto de la pieza si no tienes archivo), recibes un presupuesto transparente en menos de 1 hora en días laborables, apruebas el precio y producimos la pieza localmente en Sevilla. Sin tarifa de configuración, sin pedido mínimo por encima de los 10€, y con control de calidad fotográfico antes de cada entrega.

Para proyectos industriales o de ingeniería que necesitan materiales de alto rendimiento — ABS para resistencia a temperatura, Nylon para carga mecánica, PETG para exposición exterior o TPU flexible para juntas y cubiertas — nuestro maker local trabaja con el mismo rango de materiales que el taller de Barcelona. Te recomendamos el material correcto en el presupuesto según la función real de la pieza.`,
    deliveryTableRow: ["Sevilla y provincia (envío)", "2–3 días hábiles"],
    shippingFaqQ: "¿Cuánto tarda en estar lista mi pieza para recoger en Sevilla?",
    shippingFaqA: "Al producirse localmente en Sevilla, normalmente tu pieza está lista para recoger en 2–3 días hábiles tras confirmar el presupuesto. Te avisamos por WhatsApp en cuanto esté lista, junto con fotos de control de calidad de la pieza terminada.",
    whatsappMsg: "Hola, soy de Sevilla y me gustaría un presupuesto para impresión 3D.",
    articleInLanguage: "es",
    localPickup: {
      address: "Av. Parsi, 21",
      addressLocality: "Sevilla",
      postalCode: "41016",
      addressRegion: "Sevilla",
      addressCountry: "ES",
      latitude: 37.375453,
      longitude: -5.918144,
      schedulingNote: "Recogida solo con cita previa — contáctanos por WhatsApp para coordinar el horario.",
      whatsappMsg: "Hola, soy de Sevilla y me gustaría recoger un pedido de impresión 3D en Av. Parsi 21.",
      whatsappNumber: "34695783248",
    },
    extraFaqs: [
      {
        q: "¿Puedo recoger mi pedido en persona en Sevilla?",
        a: "Sí — trabajamos con un maker local en Sevilla y puedes recoger tu pieza en Av. Parsi 21 con cita previa, coordinada por WhatsApp.",
      },
      {
        q: "¿Cómo garantizáis la calidad si se imprime en Sevilla y no en Barcelona?",
        a: "Nuestro maker local en Sevilla nos envía fotos de cada pieza antes de completarla, y solo se entrega una vez que confirmamos que cumple nuestro estándar de calidad.",
      },
      {
        q: "¿Y si no puedo recoger en persona?",
        a: "Sin problema — también enviamos a cualquier punto de Sevilla y su provincia mediante mensajería con seguimiento.",
      },
      {
        q: "¿En qué materiales imprimís?",
        a: "Trabajamos con PLA, PETG, ABS y TPU flexible — te recomendamos el material más adecuado según el uso de tu pieza al confirmar el presupuesto.",
      },
    ],
  },
  {
    slug: "/3d-printing-sevilla",
    altSlug: "/impresion-3d-sevilla",
    lang: "en",
    locale: "en_US",
    city: "Seville",
    country: "Spain",
    deliveryDays: "2–3 business days",
    metaTitle: "3D Printing in Seville — Local Production, From €10",
    metaDescription: "FDM 3D printing produced locally in Seville, with pickup at Av. Parsi 21 (by appointment) or delivery across the province. From €10, quote in 1 hour.",
    h1: "3D Printing in Seville — Local Production & From €10",
    eyebrowText: "Seville Pickup · By Appointment",
    heroSubtitle: "Your part, printed by our local Seville maker and photo-verified before every handoff. Pick it up at Av. Parsi 21 by appointment, or we ship it across the province. Quote in 1 hour, from €10.",
    introParagraph: "Seville is one of Europe's major aerospace hubs — alongside Toulouse and Hamburg, it's one of only three cities on the continent with a final aircraft assembly line, thanks to the Airbus Defence and Space plant in San Pablo and tier-1 suppliers like Alestis Aerospace at the Aerópolis technology park. That sits alongside an active engineering community at the University of Seville's School of Engineering, and a distinctive craft tradition tied to the Feria de Abril and Semana Santa. We now print directly in Seville, through a verified local maker who produces each piece and sends us quality-check photos before it's marked complete. Pick up your order at Av. Parsi 21 by appointment, or we'll ship it anywhere in the province. Human-confirmed quote in under one hour, direct WhatsApp communication, minimum order €10, no marketplace commission.",
    deliveryTableRow: ["Seville & province (shipping)", "2–3 business days"],
    shippingFaqQ: "How long until my piece is ready for pickup in Seville?",
    shippingFaqA: "Since it's produced locally in Seville, your piece is typically ready for pickup within 2–3 business days of confirming your quote. We'll message you on WhatsApp as soon as it's ready, along with quality-check photos of the finished piece.",
    whatsappMsg: "Hi, I'm in Seville and I'd like a quote for 3D printing.",
    articleInLanguage: "en",
    localPickup: {
      address: "Av. Parsi, 21",
      addressLocality: "Seville",
      postalCode: "41016",
      addressRegion: "Sevilla",
      addressCountry: "ES",
      latitude: 37.375453,
      longitude: -5.918144,
      schedulingNote: "Pickup by appointment only — contact us on WhatsApp to arrange a time.",
      whatsappMsg: "Hi, I'm in Seville and I'd like to pick up a 3D printing order at Av. Parsi 21.",
      whatsappNumber: "34695783248",
    },
    extraFaqs: [
      {
        q: "Can I pick up my order in person in Seville?",
        a: "Yes — we work with a local maker in Seville, and you can pick up your piece at Av. Parsi 21 by appointment, arranged over WhatsApp.",
      },
      {
        q: "How do you guarantee quality if it's printed in Seville, not Barcelona?",
        a: "Our local Seville maker sends us photos of every piece before it's marked complete, and it's only handed off once we've confirmed it meets our quality standard.",
      },
      {
        q: "What if I can't pick it up in person?",
        a: "No problem — we also ship anywhere in Seville and its province via tracked courier.",
      },
      {
        q: "What materials do you print in?",
        a: "We work with PLA, PETG, ABS, and flexible TPU — we'll recommend the right material for your part's actual use when confirming your quote.",
      },
    ],
  },
];
