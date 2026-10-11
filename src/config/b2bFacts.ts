// ============================================================
// B2B FACTS — single source of truth for all business pages.
// owner: edit the values here; the UI reacts automatically.
// Fields set to null are hidden in the UI — never shown empty.
// ============================================================

// --------------- CLIENTS / PARTNERS -----------------

export interface ClientEntry {
  key: string;
  nameShown?: string;
  descriptor: { es: string; en: string; ca: string };
  summary: { es: string; en: string; ca: string } | null;
  imageSrc?: string;
  canName: boolean;
  logoSrc?: string;   // path under /clients/
  logoAlt: string;
  website?: string;
  instagram?: string;
  permission: "confirmed" | "pending";
  // "Client" or "Partner"
  badge: "client" | "partner";
}

// owner: confirm in writing (a WhatsApp/email OK is enough) before setting permission to "confirmed"
export const CLIENTS: ClientEntry[] = [
  {
    key: "intercruises",
    nameShown: "Intercruises",
    descriptor: {
      es: "Empresa de experiencias y eventos en Barcelona",
      en: "Events and experiences company in Barcelona",
      ca: "Empresa d'experiències i esdeveniments a Barcelona",
    },
    summary: {
      es: "Varitas mágicas de marca impresas en 3D para eventos temáticos",
      en: "Branded 'Varita Mágica' wands 3D printed for themed events",
      ca: "Varetes màgiques de marca impreses en 3D per a esdeveniments temàtics",
    },
    imageSrc: undefined,
    canName: true,
    logoSrc: "/clients/intercruises.png",
    logoAlt: "Intercruises logo",
    website: undefined,
    instagram: undefined,
    permission: "pending", // owner: confirm before enabling
    badge: "client",
  },
  {
    key: "cultural-habits",
    nameShown: "Cultural Habits",
    descriptor: {
      es: "Empresa creativa en Barcelona",
      en: "Creative company in Barcelona",
      ca: "Empresa creativa a Barcelona",
    },
    summary: null, // owner: fill what was printed
    imageSrc: undefined,
    canName: true,
    logoSrc: "/clients/cultural-habits.png",
    logoAlt: "Cultural Habits logo",
    website: undefined,
    instagram: undefined, // owner: fill the URL
    permission: "pending", // owner: confirm before enabling
    badge: "client",
  },
  {
    key: "gs-bikes",
    nameShown: "GS Bikes",
    descriptor: {
      es: "Empresa de ciclismo en Barcelona",
      en: "Cycling business in Barcelona",
      ca: "Empresa de ciclisme a Barcelona",
    },
    summary: null, // owner: fill what was printed
    imageSrc: undefined,
    canName: true,
    logoSrc: "/clients/gs-bikes.png",
    logoAlt: "GS Bikes logo",
    website: undefined,
    instagram: undefined,
    permission: "pending", // owner: confirm before enabling
    badge: "client",
  },
  {
    key: "lemon-printers",
    nameShown: "Lemon Printers",
    descriptor: {
      es: "Socio local de impresión en Barcelona",
      en: "Local print-shop partner in Barcelona",
      ca: "Soci local d'impressió a Barcelona",
    },
    summary: {
      es: "Asociación NFC y stand de derivación para clientes de impresión local",
      en: "NFC stand referral partnership for local print customers",
      ca: "Associació NFC i estand de derivació per a clients d'impressió local",
    },
    imageSrc: undefined,
    canName: true,
    // Square yellow tile, 225 px source. Render at most 56 px square, never upscale.
    logoSrc: "/clients/lemon-printers.png",
    logoAlt: "Lemon Printers logo",
    website: "/lemon",
    instagram: undefined,
    permission: "confirmed", // owner already uses the wordmark on /lemon
    badge: "partner",
  },
  {
    key: "iot-company",
    descriptor: {
      es: "Empresa de servicios IoT en Barcelona — carcasas de electrónica encargadas por factura",
      en: "IoT services company in Barcelona — electronic enclosures, supplied on invoice",
      ca: "Empresa de serveis IoT a Barcelona — carcasses electròniques encarregades per factura",
    },
    summary: {
      es: "Carcasas y recinto a medida para dispositivos electrónicos",
      en: "Custom enclosures and housings for electronic devices",
      ca: "Carcasses i recintes a mida per a dispositius electrònics",
    },
    imageSrc: undefined,
    canName: false,
    logoAlt: "IoT company",
    permission: "pending",
    badge: "client",
  },
  {
    key: "municipality",
    descriptor: {
      es: "Municipio español — maqueta arquitectónica de una plaza",
      en: "Spanish municipality — scale architectural model of a town square",
      ca: "Municipi espanyol — maqueta arquitectònica a escala d'una plaça",
    },
    summary: {
      es: "Maqueta a escala de una plaza urbana para presentación municipal",
      en: "Scale model of a town square for a municipal presentation",
      ca: "Maqueta a escala d'una plaça urbana per a presentació municipal",
    },
    imageSrc: undefined,
    canName: false,
    logoAlt: "Municipality client",
    permission: "pending",
    badge: "client",
  },
  {
    key: "asa-batch",
    descriptor: {
      es: "Cliente empresa — tirada de producción en ASA",
      en: "Business client — ASA production batch",
      ca: "Client empresa — tirada de producció en ASA",
    },
    summary: {
      es: "50 unidades en ASA para aplicación de exterior",
      en: "50-unit ASA production run for an outdoor application",
      ca: "50 unitats en ASA per a aplicació d'exterior",
    },
    imageSrc: undefined,
    canName: false,
    logoAlt: "Production batch client",
    permission: "pending",
    badge: "client",
  },
  {
    key: "architect",
    // Do not store personal data (name, address, tax ID) of private individuals.
    descriptor: {
      es: "Profesional de la arquitectura en Barcelona",
      en: "Architecture professional in Barcelona",
      ca: "Professional de l'arquitectura a Barcelona",
    },
    summary: {
      es: "Piezas de detalle para maqueta arquitectónica",
      en: "Detail parts for an architectural model",
      ca: "Peces de detall per a maqueta arquitectònica",
    },
    imageSrc: undefined,
    canName: false,
    logoAlt: "Architecture professional",
    permission: "pending",
    badge: "client",
  },
];

// --------------- FREE SAMPLE OFFER -----------------
// owner: terms of the free prototype/sample offer
export const FREE_SAMPLE = {
  enabled: true,
  valueCapEur: 15,
  oncePerCompany: true,
  wording: {
    es: "Imprimimos gratis un prototipo o pieza de muestra por empresa para proyectos reales. Una sola pieza, materiales estándar, hasta aproximadamente 15€ de coste de fabricación. Las piezas más grandes se descuentan, no son gratuitas.",
    en: "We print a free prototype or sample part for companies with a real project. One part per company, standard materials, up to roughly 15€ in production cost. Larger parts are discounted, not free.",
    ca: "Imprimim gratis un prototip o peça de mostra per empresa per a projectes reals. Una sola peça, materials estàndard, fins aproximadament 15€ de cost de fabricació. Les peces més grans es descompten, no són gratuïtes.",
  },
};

// --------------- FOUNDER -----------------
// Hide the founder block while photoSrc is null.
export const FOUNDER = {
  name: "Nico",
  role: {
    es: "Fundador y operador, Dimension3D Barcelona",
    en: "Founder and operator, Dimension3D Barcelona",
    ca: "Fundador i operador, Dimension3D Barcelona",
  },
  photoSrc: null as string | null, // owner: drop your photo at /images/nico.jpg and set the path here
  bio: {
    es: "Creé Dimension3D para fabricar piezas reales con rapidez, sin mínimos y sin burocracia. Crecí en Asia y Europa, vivo en Barcelona y estudio Digital Business and Innovation. Atiendo directamente en español, catalán, inglés, alemán y polaco.",
    en: "I started Dimension3D to make real parts fast, with no minimums and no overhead. I grew up across Asia and Europe, live in Barcelona, and study Digital Business and Innovation. I handle every project directly, in Spanish, Catalan, English, German, and Polish.",
    ca: "Vaig crear Dimension3D per fabricar peces reals amb rapidesa, sense mínims i sense burocràcia. Vaig créixer a Àsia i Europa, visc a Barcelona i estudio Digital Business and Innovation. Atenc directament en espanyol, català, anglès, alemany i polonès.",
  },
};

// --------------- STATS -----------------
export const STATS = {
  ordersPerMonth: "30+" as string | null,
  responseTime: "1 h" as string | null,
  repeatCustomers: null as string | null, // owner: set when you have a defensible figure
};

// --------------- CAPABILITIES -----------------
export const CAPABILITIES = {
  printers: "Bambu Lab X2D (enclosed, heated chamber)",
  // owner: fill the real X2D build volume; hide the line while null
  maxPartMm: { x: null as number | null, y: null as number | null, z: null as number | null },
  oversized: "Parts larger than the build plate are split and bonded, or produced through our partner network on request.",
  batchRange: "from 1 to several hundred units",
  leadTimeDays: "2–5 business days; 24–48 h urgent (surcharge applies)",
};

// --------------- TRUST SIGNALS -----------------
export const TRUST = {
  ndaOnRequest: true,
  invoiceForCompanies: true,  // "invoice for companies" — do NOT write IVA/VAT/NIF claims here
  localPickup: true,
  languages: ["ES", "CA", "EN", "DE", "PL"] as string[],
  rapidQuoteHours: 1,
};
