export interface CatalogField {
  key: string;
  label: string;
  type: "text" | "select";
  options?: string[];
}

export interface CatalogProduct {
  slug: string;
  name: Record<"es" | "en" | "ca", string>;
  image: string;
  priceLow: number;
  priceHigh: number;
  description: Record<"es" | "en" | "ca", string>;
  fields: CatalogField[];
  variantImages?: { field: string; images: Record<string, string> };
  coverImages?: Record<string, string>;
}

export const catalogProducts: CatalogProduct[] = [
  {
    slug: "jarron-personalizado",
    name: {
      es: "Jarrón acanalado personalizado",
      en: "Custom Ribbed Vase",
      ca: "Gerro acanalat personalitzat",
    },
    image: "/images/catalog/vase.jpg",
    priceLow: 18,
    priceHigh: 35,
    description: {
      es: "Un jarrón decorativo con textura acanalada impreso en 3D y personalizado a tu medida. Perfecto para decorar cualquier rincón del hogar o como regalo original. Disponible en varios tamaños y colores para adaptarse a tu estilo.",
      en: "A 3D-printed decorative vase with a ribbed texture, personalised to your taste. Perfect for styling any corner of your home or as an original gift. Available in several sizes and colours to suit your style.",
      ca: "Un gerro decoratiu amb textura acanalada imprès en 3D i personalitzat a la teva mida. Perfecte per decorar qualsevol racó de la llar o com a regal original. Disponible en diverses mides i colors per adaptar-se al teu estil.",
    },
    fields: [
      {
        key: "size",
        label: "Tamaño",
        type: "select",
        options: ["Pequeño (12cm)", "Mediano (18cm)", "Grande (25cm)"],
      },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Blanco", "Negro", "Beige", "Verde oliva"],
      },
    ],
  },
  {
    slug: "placa-nombre",
    name: {
      es: "Placa de nombre personalizada",
      en: "Custom Name Plate",
      ca: "Placa de nom personalitzada",
    },
    image: "/images/catalog/placa-nombre-blanco.jpg",
    priceLow: 12,
    priceHigh: 20,
    description: {
      es: "Placa identificativa con el nombre o texto que elijas, ideal para puertas, escritorios o habitaciones. Fabricada con acabado de alta calidad y diseño elegante. Perfecta como regalo personalizado para cualquier ocasión.",
      en: "Personalised name plate with the text of your choice, ideal for doors, desks or bedrooms. Made with a high-quality finish and elegant design. A perfect personalised gift for any occasion.",
      ca: "Placa identificativa amb el nom o text que triïs, ideal per a portes, escriptoris o habitacions. Fabricada amb un acabat d'alta qualitat i disseny elegant. El regal personalitzat perfecte per a qualsevol ocasió.",
    },
    fields: [
      { key: "text", label: "Texto a grabar", type: "text" },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Blanco", "Negro", "Madera clara", "Dorado"],
      },
    ],
    variantImages: {
      field: "color",
      images: {
        "Blanco": "/images/catalog/placa-nombre-blanco.jpg",
        "Negro": "/images/catalog/placa-nombre-negro.jpg",
        "Madera clara": "/images/catalog/placa-nombre-madera-clara.jpg",
        "Dorado": "/images/catalog/placa-nombre-dorado.jpg",
      },
    },
    coverImages: {
      es: "/images/catalog/placa-nombre-cover-es.jpg",
      en: "/images/catalog/placa-nombre-cover-en.jpg",
      ca: "/images/catalog/placa-nombre-cover-ca.jpg",
    },
  },
  {
    slug: "placa-mascota",
    name: {
      es: "Placa identificativa para mascota",
      en: "Custom Pet ID Tag",
      ca: "Placa identificativa per a mascota",
    },
    image: "/images/catalog/pet-tag.jpg",
    priceLow: 8,
    priceHigh: 14,
    description: {
      es: "Chapa de identificación personalizada para tu mascota con su nombre y, si lo deseas, tu número de teléfono. Ligera, resistente y con un acabado suave que garantiza la comodidad del animal. Disponible en colores vivos para que sea fácil de localizar.",
      en: "Personalised ID tag for your pet, engraved with their name and, if you wish, your phone number. Lightweight, durable and smooth-finished for the animal's comfort. Available in bright colours so they are easy to spot.",
      ca: "Xapa d'identificació personalitzada per a la teva mascota amb el seu nom i, si vols, el teu número de telèfon. Lleugera, resistent i amb un acabat suau que garanteix la comoditat de l'animal. Disponible en colors vius perquè sigui fàcil de localitzar.",
    },
    fields: [
      { key: "petName", label: "Nombre de la mascota", type: "text" },
      {
        key: "phone",
        label: "Teléfono de contacto (opcional, se graba en la placa)",
        type: "text",
      },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Rosa", "Azul", "Negro", "Blanco"],
      },
    ],
  },
  {
    slug: "soporte-telefono",
    name: {
      es: "Soporte de teléfono acanalado",
      en: "Ribbed Phone Stand",
      ca: "Suport de telèfon acanalat",
    },
    image: "/images/catalog/stand-space-black.jpg",
    priceLow: 10,
    priceHigh: 16,
    description: {
      es: "Soporte de teléfono con textura acanalada, diseño minimalista impreso en 3D. Ideal para el escritorio, la mesita de noche o cualquier rincón donde quieras tener el móvil siempre a mano y bien visible.",
      en: "3D-printed phone stand with a ribbed texture and minimalist design. Ideal for your desk, bedside table or anywhere you want your phone always visible and within reach.",
      ca: "Suport de telèfon amb textura acanalada i disseny minimalista imprès en 3D. Ideal per a l'escriptori, la tauleta de nit o qualsevol racó on vulguis tenir el mòbil sempre a mà i ben visible.",
    },
    fields: [
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Negro espacial", "Blanco hueso", "Azul", "Naranja"],
      },
    ],
    variantImages: {
      field: "color",
      images: {
        "Negro espacial": "/images/catalog/stand-space-black.jpg",
        "Blanco hueso": "/images/catalog/stand-off-white.jpg",
        "Azul": "/images/catalog/stand-blue.jpg",
        "Naranja": "/images/catalog/stand-orange.jpg",
      },
    },
  },
  {
    slug: "topper-boda",
    name: {
      es: "Topper de tarta personalizado",
      en: "Custom Cake Topper",
      ca: "Topper de pastís personalitzat",
    },
    image: "/images/catalog/topper-1-abrazo.jpg",
    priceLow: 20,
    priceHigh: 40,
    description: {
      es: "Topper de tarta impreso en 3D con los nombres de los novios y, opcionalmente, la fecha del enlace. Un detalle único y romántico que hará aún más especial vuestro gran día. Disponible en acabados metalizados y clásicos.",
      en: "3D-printed wedding cake topper with the names of the couple and, optionally, the date of the celebration. A unique and romantic touch that will make your special day even more memorable. Available in metallic and classic finishes.",
      ca: "Topper de pastís imprès en 3D amb els noms dels nuvis i, opcionalment, la data de l'enllaç. Un detall únic i romàntic que farà encara més especial el vostre gran dia. Disponible en acabats metal·litzats i clàssics.",
    },
    fields: [
      { key: "names", label: "Nombres de los novios", type: "text" },
      { key: "date", label: "Fecha (opcional)", type: "text" },
      {
        key: "style",
        label: "Diseño",
        type: "select",
        options: ["Abrazo con corazón", "Beso con anillos", "Choca las manos", "LOVE decorativo"],
      },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Dorado", "Plateado", "Negro", "Blanco"],
      },
    ],
    variantImages: {
      field: "style",
      images: {
        "Abrazo con corazón": "/images/catalog/topper-1-abrazo.jpg",
        "Beso con anillos": "/images/catalog/topper-2-beso.jpg",
        "Choca las manos": "/images/catalog/topper-3-choca-manos.jpg",
        "LOVE decorativo": "/images/catalog/topper-4-love.jpg",
      },
    },
  },
];
