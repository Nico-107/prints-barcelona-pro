export interface CatalogField {
  key: string;
  label: string;
  type: "text" | "select";
  options?: string[];
}

export interface CatalogProduct {
  slug: string;
  name: string;
  image: string;
  priceLow: number;
  priceHigh: number;
  description: string;
  fields: CatalogField[];
}

export const catalogProducts: CatalogProduct[] = [
  {
    slug: "jarron-personalizado",
    name: "Jarrón acanalado personalizado",
    image: "/images/catalog/vase.jpg",
    priceLow: 18,
    priceHigh: 35,
    description:
      "Un jarrón decorativo con textura acanalada impreso en 3D y personalizado a tu medida. Perfecto para decorar cualquier rincón del hogar o como regalo original. Disponible en varios tamaños y colores para adaptarse a tu estilo.",
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
    name: "Placa de nombre personalizada",
    image: "/images/catalog/nameplate.jpg",
    priceLow: 12,
    priceHigh: 20,
    description:
      "Placa identificativa con el nombre o texto que elijas, ideal para puertas, escritorios o habitaciones. Fabricada con acabado de alta calidad y diseño elegante. Perfecta como regalo personalizado para cualquier ocasión.",
    fields: [
      { key: "text", label: "Texto a grabar", type: "text" },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Blanco", "Negro", "Madera clara", "Dorado"],
      },
    ],
  },
  {
    slug: "placa-mascota",
    name: "Placa identificativa para mascota",
    image: "/images/catalog/pet-tag.jpg",
    priceLow: 8,
    priceHigh: 14,
    description:
      "Chapa de identificación personalizada para tu mascota con su nombre y, si lo deseas, tu número de teléfono. Ligera, resistente y con un acabado suave que garantiza la comodidad del animal. Disponible en colores vivos para que sea fácil de localizar.",
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
    slug: "topper-boda",
    name: "Topper de tarta personalizado",
    image: "/images/catalog/cake-topper.jpg",
    priceLow: 20,
    priceHigh: 40,
    description:
      "Topper de tarta impreso en 3D con los nombres de los novios y, opcionalmente, la fecha del enlace. Un detalle único y romántico que hará aún más especial vuestro gran día. Disponible en acabados metalizados y clásicos.",
    fields: [
      { key: "names", label: "Nombres de los novios", type: "text" },
      { key: "date", label: "Fecha (opcional)", type: "text" },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Dorado", "Plateado", "Negro", "Blanco"],
      },
    ],
  },
];
