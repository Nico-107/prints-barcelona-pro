export interface PartPage {
  slug: string;
  name: string;
  category: "adapter" | "replacement";
  price: number;
  problemStatement: string;
  description: string;
  howItsMade: string;
  images: { cover: string; uso: string; medidas: string; antesDespues?: string };
  compatibleWith: string;
  material: string;
  faqs: { q: string; a: string }[];
  disclaimer: string;
  keywords: string[];
}

export const partPages: PartPage[] = [
  {
    slug: "/adaptador-vesa-monitor",
    name: "Adaptador VESA para Monitor",
    category: "adapter",
    price: 18,
    problemStatement:
      "¿Tu monitor no tiene el patrón de agujeros VESA estándar? Este adaptador conecta cualquier monitor a un soporte o brazo VESA 100x100, sin comprar un soporte nuevo.",
    description:
      "Adaptador impreso en 3D que conecta el patrón de tornillos de tu monitor a un soporte VESA estándar de 100x100mm. Diseño propio, sin piezas de terceros ni reproducciones de marca.",
    howItsMade:
      "Diseñado a medida según el patrón de agujeros de tu monitor e impreso bajo demanda en PETG, un material rígido y resistente a la deformación. No mantenemos stock — cada pieza se fabrica cuando se confirma el pedido, por lo que no hay inventario que se quede obsoleto ni desperdicio de material.",
    images: {
      cover: "/images/piezas/adaptador-vesa-cover.jpeg",
      uso: "/images/piezas/adaptador-vesa-uso.jpeg",
      medidas: "/images/piezas/adaptador-vesa-medidas.jpeg",
    },
    compatibleWith:
      "Monitores con patrón de tornillos no estándar, hacia soportes VESA 100x100mm",
    material: "PETG",
    faqs: [
      {
        q: "¿Es compatible con mi monitor?",
        a: "Contáctanos con el patrón de agujeros de tu monitor (mide la distancia entre tornillos) para confirmar antes de comprar.",
      },
      {
        q: "¿Cuánto peso soporta?",
        a: "Diseñado para monitores de hasta 8kg. Para pantallas más pesadas, consulta antes de comprar.",
      },
      {
        q: "¿Esto es un producto oficial de alguna marca?",
        a: "No. Es un diseño propio de Dimension3D para resolver un patrón de montaje no estándar. No está afiliado ni respaldado por ningún fabricante de monitores.",
      },
    ],
    disclaimer:
      "Producto de diseño propio. No es una pieza oficial ni está afiliado a ningún fabricante.",
    keywords: [
      "adaptador vesa",
      "adaptador monitor soporte",
      "vesa no estandar",
      "monitor sin vesa",
    ],
  },
];
