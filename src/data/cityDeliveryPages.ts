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
    deliveryDays: "3–4 business days",
    metaTitle: "3D Printing Service with Delivery to Paris — From €10 | Dimension3D",
    metaDescription: "Professional FDM 3D printing from Barcelona, delivered to Paris in 3–4 business days. Upload your STL, instant quote in 1 hour, no minimum order. From €10.",
    h1: "3D Printing Service with Delivery to Paris",
    eyebrowText: "Shipping to France · 3–4 Business Days",
    heroSubtitle: "Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to Paris in 3–4 business days. From €10. No minimum order.",
    introParagraph: "France has the fastest-growing 3D printing market in Europe, driven by its aerospace and defence industries — Safran, the Airbus supply chain network — the grandes écoles engineering culture at Arts et Métiers, ENPC, and Centrale Paris, and a design ecosystem that stretches from the product studios of Le Marais to the industrial manufacturers on the Île-de-France periphery. French customers across engineering, architecture, and industrial design typically combine high precision requirements with a preference for direct, technical communication with the people producing their parts. We ship to Paris and the wider Île-de-France region regularly, parcels travelling within the EU single market — no customs, no delays — and arriving in 3–4 business days from dispatch.",
    deliveryTableRow: ["Paris & Île-de-France, France", "3–4 business days"],
    shippingFaqQ: "How long does shipping from Barcelona to Paris take?",
    shippingFaqA: "Most orders arrive at Paris addresses in 3–4 business days from dispatch. All shipments are fully tracked — you receive a tracking number as soon as the parcel leaves our Barcelona workshop. Delivery to Île-de-France suburbs is the same timeframe. No EU customs formalities apply between Spain and France.",
    whatsappMsg: "Hi, I'm based in Paris and I'd like a quote for 3D printing.",
    nativeSection: {
      lang: "fr",
      headline: "Service d'impression 3D professionnel avec livraison à Paris",
      body: "Devis instantané en 1 heure. Livraison en 3–4 jours ouvrables depuis Barcelone. FDM en PLA, PETG, ABS, Nylon et composites carbone. Sans minimum de commande.",
      ctaLabel: "Obtenir un devis",
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
    metaTitle: "3D Printing Service with Delivery to London — From €10 | Dimension3D",
    metaDescription: "Professional FDM 3D printing from Barcelona, delivered to London in 4–6 business days. Pricing in euros, UK shipments handled routinely. Instant quote in 1 hour.",
    h1: "3D Printing Service with Delivery to London",
    eyebrowText: "Shipping to the UK · 4–6 Business Days",
    heroSubtitle: "Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to London in 4–6 business days. Pricing in euros. From €10.",
    introParagraph: "London's product development and creative industries ecosystem — from the hardware accelerators in Shoreditch and the design consultancies of South Kensington to the fabrication labs at Imperial, UCL, and the RCA — places consistent demand on fast, quality FDM prototyping. UK customers in product design, engineering, and the creative sector increasingly source from European studios for access to engineering-grade materials at competitive euro-denominated rates. We handle UK shipments as a routine part of our operations: post-Brexit export documentation is prepared by us, commercial invoices are provided with every UK order, and parcels typically reach London addresses in 4–6 business days.",
    deliveryTableRow: ["London & Greater London, UK", "4–6 business days"],
    shippingFaqQ: "Does Brexit affect shipping from Barcelona to London?",
    shippingFaqA: "Yes — UK shipments require export documentation, which we handle as standard. Parcels typically arrive in 4–6 business days from dispatch. Orders for personal use under £135 generally clear UK customs without additional import VAT. Commercial orders above this threshold may incur UK import VAT at 20%. We provide commercial invoices with all UK shipments to facilitate customs clearance.",
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
    deliveryDays: "3–4 business days",
    metaTitle: "3D Printing Service with Delivery to Amsterdam — From €10 | Dimension3D",
    metaDescription: "Professional FDM 3D printing from Barcelona, delivered to Amsterdam in 3–4 business days. Upload your STL, instant quote, no minimum order. From €10.",
    h1: "3D Printing Service with Delivery to Amsterdam",
    eyebrowText: "Shipping to Netherlands · 3–4 Business Days",
    heroSubtitle: "Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to Amsterdam in 3–4 business days. From €10. No minimum order.",
    introParagraph: "The Netherlands punches well above its weight in European tech and maker culture — from the hardware startups along Amsterdam's Silicon Canal and the deep-tech companies in Eindhoven's Brainport region to the robotics labs at TU Delft and the precision manufacturing suppliers feeding ASML's supply chain. Dutch tech culture values speed, transparent pricing, and direct communication — exactly the operating model of our studio. We ship to Amsterdam and across the Netherlands regularly, parcels travelling within the EU single market and arriving in 3–4 business days with no customs complications.",
    deliveryTableRow: ["Amsterdam & Netherlands", "3–4 business days"],
    shippingFaqQ: "How long does 3D print delivery from Barcelona to Amsterdam take?",
    shippingFaqA: "Parcels dispatched from our Barcelona workshop typically arrive at Amsterdam addresses in 3–4 business days via tracked courier. Delivery to other Dutch cities — Rotterdam, The Hague, Utrecht, Eindhoven — is the same timeframe. No EU customs formalities apply between Spain and the Netherlands.",
    whatsappMsg: "Hi, I'm based in Amsterdam and I'd like a quote for 3D printing.",
    nativeSection: {
      lang: "nl",
      headline: "3D-printservice met levering naar Amsterdam",
      body: "Professionele FDM-studio in Barcelona. Offerte in 1 uur, levering naar Amsterdam in 3–4 werkdagen. Vanaf €10. Geen minimumbestelling.",
      ctaLabel: "Offerte aanvragen — levering naar Amsterdam",
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
    deliveryDays: "3–4 business days",
    metaTitle: "3D Printing Service with Delivery to Berlin — From €10 | Dimension3D",
    metaDescription: "Professional FDM 3D printing from Barcelona, delivered to Berlin in 3–4 business days. Upload your STL, instant quote in 1 hour, no minimum order. From €10.",
    h1: "3D Printing Service with Delivery to Berlin",
    eyebrowText: "Shipping to Germany · 3–4 Business Days",
    heroSubtitle: "Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to Berlin in 3–4 business days. From €10. No minimum order.",
    introParagraph: "Germany is Europe's largest 3D printing market — roughly a third of EU additive manufacturing revenue flows through German industry, driven by the Mittelstand manufacturing base, the automotive supply chains feeding BMW, Mercedes, and Volkswagen, and the deep-tech hardware ventures building Industry 4.0 solutions. Berlin specifically sits at the intersection of this engineering culture and a startup ecosystem with intense demand for custom parts without industrial batch minimums: hardware founders in Mitte, precision engineers in Tempelhof, makers in Neukölln, and product designers who need direct communication with the person producing their parts rather than an automated print-farm queue. We ship to Berlin and the wider Brandenburg region regularly — EU single market, no customs formalities, 3–4 business days from dispatch.",
    deliveryTableRow: ["Berlin & Brandenburg, Germany", "3–4 business days"],
    shippingFaqQ: "How long does shipping from Barcelona to Berlin take?",
    shippingFaqA: "Standard tracked delivery from Barcelona to Berlin typically takes 3–4 business days. As both Spain and Germany are EU member states, there are no customs formalities or border delays. Delivery to other German cities — Munich, Hamburg, Frankfurt, Cologne — is similarly 3–4 business days from dispatch.",
    whatsappMsg: "Hi, I'm based in Berlin and I'd like a quote for 3D printing.",
    nativeSection: {
      lang: "de",
      headline: "3D-Druckservice mit Lieferung nach Berlin",
      body: "Professionelles FDM-Druckstudio in Barcelona. Angebot in 1 Stunde, Lieferung nach Berlin in 3–4 Werktagen. Ab €10. Keine Mindestbestellung.",
      ctaLabel: "Angebot anfordern — Lieferung nach Berlin",
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
    deliveryDays: "3–4 business days",
    metaTitle: "3D Printing Service with Delivery to Milan — From €10 | Dimension3D",
    metaDescription: "Professional FDM 3D printing from Barcelona, delivered to Milan in 3–4 business days. Upload your STL, instant quote in 1 hour, no minimum order. From €10.",
    h1: "3D Printing Service with Delivery to Milan",
    eyebrowText: "Shipping to Italy · 3–4 Business Days",
    heroSubtitle: "Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to Milan in 3–4 business days. From €10. No minimum order.",
    introParagraph: "Milan occupies a unique position at the crossroads of Italian industrial design, fashion prototyping, and precision manufacturing — from the product studios and architecture firms of Brera and Porta Nuova (home to Salone del Mobile's design-week ecosystem) to the automotive component suppliers feeding the Ferrari, Lamborghini, Alfa Romeo, and Stellantis supply chains across the Po Valley. Italian industry has a deep appreciation for surface finish, material quality, and precision tolerances — the same standards we apply to every print we produce. We ship to Milan and Lombardy regularly, with parcels arriving in 3–4 business days within the EU single market. Whether you need architecture models, automotive component prototypes, fashion accessory iterations, or functional mechanical parts, our full FDM material range covers Italian design's broad requirements.",
    deliveryTableRow: ["Milan & Lombardy, Italy", "3–4 business days"],
    shippingFaqQ: "How long does 3D printing delivery from Barcelona to Milan take?",
    shippingFaqA: "Parcels dispatched from our Barcelona workshop typically reach Milan in 3–4 business days via tracked courier. Delivery to other northern Italian cities — Turin, Venice, Genoa, Bologna, Verona — is similarly 3–4 business days. No EU customs delays apply between Spain and Italy.",
    whatsappMsg: "Hi, I'm based in Milan and I'd like a quote for 3D printing.",
    nativeSection: {
      lang: "it",
      headline: "Servizio di stampa 3D con consegna a Milano",
      body: "Studio FDM professionale a Barcellona. Preventivo in 1 ora, consegna a Milano in 3–4 giorni lavorativi. Da €10. Nessun ordine minimo.",
      ctaLabel: "Richiedi preventivo — consegna a Milano",
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
    deliveryDays: "3–4 business days",
    metaTitle: "3D Printing Service with Delivery to Rome — From €10 | Dimension3D",
    metaDescription: "Professional FDM 3D printing from Barcelona, delivered to Rome in 3–4 business days. Upload your STL, instant quote in 1 hour, no minimum order. From €10.",
    h1: "3D Printing Service with Delivery to Rome",
    eyebrowText: "Shipping to Italy · 3–4 Business Days",
    heroSubtitle: "Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to Rome in 3–4 business days. From €10. No minimum order.",
    introParagraph: "Rome and the Lazio region occupy a different industrial niche from the northern Italian manufacturing belt — the region hosts major architecture and urban planning firms, the engineering and design faculties at La Sapienza and Tor Vergata universities, archaeological conservation and restoration labs, government and institutional engineering projects, and a growing cluster of creative and digital media companies. These sectors generate consistent demand for scale models, precision prototypes, and custom components that traditional manufacturing cannot supply at short notice and small quantities. We ship to Rome and Lazio regularly within the EU — 3–4 business days, fully tracked, no customs formalities.",
    deliveryTableRow: ["Rome & Lazio, Italy", "3–4 business days"],
    shippingFaqQ: "How long does delivery from Barcelona to Rome take?",
    shippingFaqA: "Parcels dispatched from our Barcelona workshop typically arrive at Rome addresses in 3–4 business days. Delivery to other central Italian cities — Florence, Naples, Bologna — is similarly 3–4 business days. All shipments are fully tracked from dispatch, and no EU customs formalities apply between Spain and Italy.",
    whatsappMsg: "Hi, I'm based in Rome and I'd like a quote for 3D printing.",
    nativeSection: {
      lang: "it",
      headline: "Servizio di stampa 3D con consegna a Roma",
      body: "Studio FDM professionale a Barcellona. Preventivo in 1 ora, consegna a Roma in 3–4 giorni lavorativi. Da €10. Nessun ordine minimo.",
      ctaLabel: "Richiedi preventivo — consegna a Roma",
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
    deliveryDays: "2–3 business days",
    metaTitle: "3D Printing Service with Delivery to Lisbon — From €10 | Dimension3D",
    metaDescription: "Professional FDM 3D printing from Barcelona, delivered to Lisbon in just 2–3 business days. Upload your STL, instant quote in 1 hour, no minimum order. From €10.",
    h1: "3D Printing Service with Delivery to Lisbon",
    eyebrowText: "Shipping to Portugal · 2–3 Business Days",
    heroSubtitle: "Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to Lisbon in just 2–3 business days. From €10. No minimum order.",
    introParagraph: "Lisbon has transformed over the past decade into one of Europe's most dynamic startup and innovation hubs — from the creative manufacturing at Beato Tech City and LX Factory to the engineering ventures energised by Web Summit, NOVA SBE, and IST's technology transfer programmes. As Portugal's immediate Iberian neighbour, Barcelona offers Lisbon one of our fastest EU shipping connections: parcels typically arrive in 2–3 business days, sometimes the next working day for orders dispatched early. The combination of Iberian logistics, a shared EU regulatory framework, and no customs barrier makes this one of our smoothest international supply routes for customers needing quality FDM parts fast.",
    deliveryTableRow: ["Lisbon & Portugal", "2–3 business days"],
    shippingFaqQ: "How quickly can you deliver 3D prints to Lisbon?",
    shippingFaqA: "Lisbon is one of our fastest destinations: parcels from Barcelona typically arrive in 2–3 business days via tracked courier. Porto and other Portuguese cities are within the same timeframe. No EU customs formalities apply between Spain and Portugal, and all shipments are tracked from our workshop door to yours.",
    whatsappMsg: "Hi, I'm based in Lisbon and I'd like a quote for 3D printing.",
    nativeSection: {
      lang: "pt",
      headline: "Serviço de impressão 3D com entrega em Lisboa",
      body: "Estúdio FDM profissional em Barcelona. Orçamento em 1 hora, entrega em Lisboa em 2–3 dias úteis. A partir de €10. Sem pedido mínimo.",
      ctaLabel: "Pedir orçamento — entrega em Lisboa",
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
    metaTitle: "3D Printing Service with Delivery to New York — From €10 | Dimension3D",
    metaDescription: "Professional FDM 3D printing from Barcelona, delivered to New York in 7–10 business days. Upload your STL, instant quote in 1 hour, no minimum order. From €10.",
    h1: "3D Printing Service with Delivery to New York",
    eyebrowText: "Shipping to the USA · 7–10 Business Days",
    heroSubtitle: "Barcelona-based FDM studio. Upload your STL or STEP, get a quote within one hour, delivery to New York in 7–10 business days. From €10. No minimum order.",
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
    metaTitle: "Impresión 3D con Entrega a Madrid — Desde €10 | Dimension3D",
    metaDescription: "Servicio profesional de impresión 3D desde Barcelona con entrega a Madrid en 1–2 días hábiles. Presupuesto en 1 hora, sin pedido mínimo. Desde €10.",
    h1: "Impresión 3D con Entrega a Madrid",
    eyebrowText: "Envío a Madrid · 1–2 Días Hábiles",
    heroSubtitle: "Estudio FDM profesional con sede en Barcelona. Sube tu STL o STEP, recibe presupuesto en 1 hora y entrega a Madrid en 1–2 días hábiles con mensajería seguida. Desde €10, sin pedido mínimo.",
    introParagraph: "Madrid es el centro industrial y tecnológico de España — desde las startups del Corredor del Henares y los proveedores aeroespaciales de Getafe hasta los estudios de diseño de producto en Malasaña y los talleres de ingeniería de precisión en Leganés. Imprimimos tu pieza en nuestro taller FDM de Barcelona y la enviamos a Madrid con mensajería seguida en 1–2 días hábiles. Presupuesto humano confirmado en menos de 1 hora, comunicación directa por WhatsApp con el equipo que produce tu pieza, y tarificación transparente en euros. Sin pedido mínimo, sin comisiones de plataforma.",
    deliveryTableRow: ["Madrid y Comunidad de Madrid", "1–2 días hábiles"],
    shippingFaqQ: "¿Cuánto tarda el envío de Barcelona a Madrid?",
    shippingFaqA: "Los pedidos se producen en nuestro taller de Barcelona y llegan a domicilios en Madrid en 1–2 días hábiles mediante mensajería estándar con seguimiento. Para muchos envíos, la entrega se produce al día siguiente del despacho. Todos los envíos incluyen número de seguimiento en cuanto el paquete sale del taller.",
    whatsappMsg: "Hola, soy de Madrid y me gustaría un presupuesto para impresión 3D con entrega desde Barcelona.",
    articleInLanguage: "es",
  },
  {
    slug: "/3d-printing-madrid",
    altSlug: "/madrid",
    lang: "en",
    locale: "en_US",
    city: "Madrid",
    country: "Spain",
    deliveryDays: "1–2 business days",
    metaTitle: "3D Printing Delivered to Madrid — From €10 | Dimension3D",
    metaDescription: "Professional FDM 3D printing from Barcelona, delivered to Madrid in 1–2 business days. Quote in 1 hour, no minimum order. From €10.",
    h1: "3D Printing Delivered to Madrid",
    eyebrowText: "Delivery to Madrid · 1–2 Business Days",
    heroSubtitle: "Barcelona-based FDM studio. Upload your STL or STEP, get a quote in one hour, delivery to Madrid in 1–2 business days via tracked courier. From €10, no minimum order.",
    introParagraph: "Madrid is Spain's industrial and technology hub — from the startups of the Corredor del Henares and the aerospace suppliers of Getafe to the product design studios of Malasaña and the precision engineering workshops of Leganés. We produce your part at our FDM studio in Barcelona and ship it to Madrid via tracked courier in 1–2 business days. Human-confirmed quote in under one hour, direct WhatsApp communication with the team producing your part, transparent pricing in euros. No minimum order, no marketplace commission.",
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
    metaTitle: "Impresión 3D con Entrega a Valencia — Desde €10 | Dimension3D",
    metaDescription: "Servicio profesional de impresión 3D desde Barcelona con entrega a Valencia en 1–2 días hábiles. Sube tu STL, presupuesto en 1 hora, sin pedido mínimo. Desde €10.",
    h1: "Impresión 3D con Entrega a Valencia",
    eyebrowText: "Envío a Valencia · 1–2 Días Hábiles",
    heroSubtitle: "Estudio FDM profesional en Barcelona. Sube tu STL o STEP, recibe presupuesto en 1 hora, entrega en Valencia en 1–2 días hábiles. Desde €10. Sin pedido mínimo.",
    introParagraph: "Valencia combina una de las cadenas de automoción más importantes de España — con la planta de Ford en Almussafes y su extensa red de proveedores de primer nivel — con un ecosistema tecnológico en crecimiento en el Parque Tecnológico y Las Naves, y una comunidad activa de makers, diseñadores de producto y artesanos en el centro histórico y el barrio del Cabanyal. Al estar a pocas horas de Barcelona, los envíos llegan a Valencia en 1–2 días hábiles con seguimiento completo — frecuentemente al día siguiente del despacho. Para componentes de automoción, prototipos de ingeniería o proyectos de diseño urgentes, somos la opción más cercana y rápida disponible.",
    deliveryTableRow: ["Valencia y Comunitat Valenciana", "1–2 días hábiles"],
    shippingFaqQ: "¿Cuánto tarda un pedido de Barcelona a Valencia?",
    shippingFaqA: "Los pedidos se envían desde Barcelona y llegan a Valencia en 1–2 días hábiles mediante mensajería estándar con seguimiento. La Comunitat Valenciana es una de nuestras zonas de entrega más rápidas — en muchos casos el pedido llega al día siguiente del envío. También ofrecemos recogida en Barcelona con cita previa para mayor comodidad.",
    whatsappMsg: "Hola, soy de Valencia y me gustaría un presupuesto para impresión 3D.",
    nativeSection: {
      lang: "ca",
      headline: "Servei d'impressió 3D professional amb lliurament a València",
      body: "Pressupost instantani en 1 hora. Lliurament en 1–2 dies hàbils des de Barcelona. FDM en PLA, PETG, ABS, Nylon i compostos. Sense comanda mínima.",
      ctaLabel: "Demanar pressupost",
    },
    articleInLanguage: "es",
  },
  {
    slug: "/impresion-3d-sevilla",
    altSlug: "/3d-printing-sevilla",
    lang: "es",
    locale: "es_ES",
    city: "Sevilla",
    country: "España",
    deliveryDays: "2–3 días hábiles",
    metaTitle: "Impresión 3D en Sevilla — Producción Local, Recogida en Av. Parsi | Dimension3D",
    metaDescription: "Impresión 3D FDM producida localmente en Sevilla, con recogida en Av. Parsi 21 (cita previa) o envío a toda la provincia. Presupuesto en 1 hora. Desde €10.",
    h1: "Impresión 3D en Sevilla — Producción y Recogida Local",
    eyebrowText: "Recogida en Sevilla · Cita Previa",
    heroSubtitle: "Tu pieza, impresa por nuestro maker local en Sevilla y verificada con fotos antes de cada entrega. Recógela en Av. Parsi 21 con cita previa, o la enviamos a cualquier punto de la provincia. Presupuesto en 1 hora, desde €10, sin pedido mínimo.",
    introParagraph: "Sevilla es uno de los grandes polos aeroespaciales de Europa — junto a Toulouse y Hamburgo, es una de las tres únicas ciudades del continente con una línea de montaje final de aviones, gracias a la planta de Airbus Defence and Space en San Pablo y a proveedores tier-1 como Alestis Aerospace en el parque tecnológico Aerópolis. A esto se suma una comunidad de ingeniería activa en la Escuela Técnica Superior de Ingeniería de la Universidad de Sevilla, y un tejido artesanal único ligado a la Feria de Abril y la Semana Santa. Ahora imprimimos directamente en Sevilla, de la mano de un maker local verificado que produce cada pieza y nos envía fotos de control de calidad antes de completarla. Puedes recoger tu pedido en Av. Parsi 21 con cita previa, o lo enviamos a cualquier punto de la provincia. Presupuesto humano confirmado en menos de 1 hora, comunicación directa por WhatsApp, sin pedido mínimo ni comisiones de plataforma.",
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
    metaTitle: "3D Printing in Seville — Local Production, Pickup on Av. Parsi | Dimension3D",
    metaDescription: "FDM 3D printing produced locally in Seville, with pickup at Av. Parsi 21 (by appointment) or delivery across the province. Quote in 1 hour. From €10.",
    h1: "3D Printing in Seville — Local Production & Pickup",
    eyebrowText: "Seville Pickup · By Appointment",
    heroSubtitle: "Your part, printed by our local Seville maker and photo-verified before every handoff. Pick it up at Av. Parsi 21 by appointment, or we ship it across the province. Quote in 1 hour, from €10, no minimum order.",
    introParagraph: "Seville is one of Europe's major aerospace hubs — alongside Toulouse and Hamburg, it's one of only three cities on the continent with a final aircraft assembly line, thanks to the Airbus Defence and Space plant in San Pablo and tier-1 suppliers like Alestis Aerospace at the Aerópolis technology park. That sits alongside an active engineering community at the University of Seville's School of Engineering, and a distinctive craft tradition tied to the Feria de Abril and Semana Santa. We now print directly in Seville, through a verified local maker who produces each piece and sends us quality-check photos before it's marked complete. Pick up your order at Av. Parsi 21 by appointment, or we'll ship it anywhere in the province. Human-confirmed quote in under one hour, direct WhatsApp communication, no minimum order, no marketplace commission.",
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
