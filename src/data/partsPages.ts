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
      cover: "/images/piezas/adaptador-vesa-uso.jpeg",
      uso: "/images/piezas/adaptador-vesa-cover.jpeg",
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
  {
    slug: "/embudo-dosificador-cafe-58mm",
    name: "Embudo Dosificador Magnético 58mm",
    category: "adapter",
    price: 11,
    problemStatement:
      "¿Se te cae el café molido fuera del portafiltro? Este embudo magnético lo mantiene todo dentro, sin manchar la encimera.",
    description:
      "Embudo dosificador magnético para portafiltros de 58mm, impreso en PETG. Próximamente disponible en más tamaños (54mm y otros) — contáctanos si necesitas una medida distinta.",
    howItsMade:
      "Impreso bajo demanda en PETG, resistente al uso diario junto a la máquina de café. Los imanes se insertan a mano tras la impresión.",
    images: {
      cover: "/images/piezas/funnel-58mm-cover.jpeg",
      uso: "/images/piezas/funnel-58mm-uso.jpeg",
      medidas: "/images/piezas/funnel-58mm-medidas.jpeg",
    },
    compatibleWith: "Portafiltros de 58mm estándar",
    material: "PETG",
    faqs: [
      {
        q: "¿Funciona con mi máquina?",
        a: "Compatible con la mayoría de portafiltros de 58mm estándar. Confirma el diámetro exacto de tu cesta antes de comprar.",
      },
      {
        q: "¿Hay otros tamaños disponibles?",
        a: "Sí, próximamente 54mm y otras medidas — contáctanos para encargos a medida.",
      },
      {
        q: "¿Es seguro cerca del grupo de la máquina?",
        a: "Sí, impreso en PETG, pero no está diseñado para tocar directamente el grupo caliente.",
      },
    ],
    disclaimer: "Diseño propio, no afiliado a ninguna marca de máquinas de café.",
    keywords: [
      "embudo dosificador cafe 58mm",
      "funnel magnetico portafiltro",
      "embudo espresso",
    ],
  },
  {
    slug: "/rueda-cesto-lavavajillas-bosch",
    name: "Rueda de Cesto para Lavavajillas Bosch (Juego de 4)",
    category: "replacement",
    price: 11,
    problemStatement:
      "¿Se ha roto una rueda del cesto de tu lavavajillas Bosch y ahora se descarrila? Juego de 4 ruedas de repuesto, listas para instalar hoy.",
    description:
      "Juego de 4 ruedas de repuesto compatibles con cestos inferiores de lavavajillas Bosch, Siemens y Neff. Impresas en PETG. Repuesto compatible, no es una pieza original de fábrica.",
    howItsMade:
      "Impresas bajo demanda en PETG por su resistencia al calor y la humedad del interior del lavavajillas. Se reutilizan los tornillos originales de las ruedas rotas.",
    images: {
      cover: "/images/piezas/dishwasher-wheel-cover.jpg",
      uso: "/images/piezas/dishwasher-wheel-uso.jpeg",
      medidas: "/images/piezas/dishwasher-wheel-medidas.jpeg",
      antesDespues: "/images/piezas/dishwasher-wheel-antes-despues.jpeg",
    },
    compatibleWith: "Lavavajillas Bosch, Siemens y Neff (confirmar modelo)",
    material: "PETG",
    faqs: [
      {
        q: "¿Es una pieza original Bosch?",
        a: "No. Es un repuesto compatible de diseño genérico, no fabricado ni afiliado a Bosch, Siemens o Neff.",
      },
      {
        q: "¿Vienen los tornillos incluidos?",
        a: "No, se reutilizan los tornillos originales de las ruedas rotas.",
      },
    ],
    disclaimer: "Repuesto compatible. No es un producto oficial de Bosch, Siemens ni Neff.",
    keywords: [
      "rueda cesto lavavajillas bosch rota",
      "repuesto rueda lavavajillas",
      "rueda cesto bosch siemens",
    ],
  },
  {
    slug: "/adaptador-manguera-gardena",
    name: "Adaptador de Manguera Gardena a Rosca Estándar",
    category: "adapter",
    price: 9,
    problemStatement:
      "¿Tienes accesorios de manguera americanos (GHT) y un sistema Gardena en casa? Este adaptador conecta ambos estándares sin comprar equipo nuevo.",
    description:
      "Adaptador impreso en PETG que conecta el estándar de rosca GHT con sistemas de conexión rápida tipo Gardena. Incluye junta de goma. No afiliado a ninguna marca de manguera.",
    howItsMade:
      "Impreso bajo demanda en PETG, resistente a la exposición exterior y al agua. Se suministra con especificación de junta de goma para un sellado correcto.",
    images: {
      cover: "/images/piezas/adaptador-gardena-cover.jpg",
      uso: "/images/piezas/adaptador-gardena-uso.jpg",
      medidas: "/images/piezas/adaptador-gardena-medidas.jpg",
    },
    compatibleWith: "Rosca GHT 3/4 pulgada, sistemas de conexión rápida tipo Gardena",
    material: "PETG",
    faqs: [
      {
        q: "¿Es un producto oficial Gardena?",
        a: "No. Es un diseño propio compatible con sistemas de conexión rápida de ese estilo, no fabricado ni afiliado a Gardena.",
      },
      {
        q: "¿Necesito una junta adicional?",
        a: "Se incluye especificación para junta de goma en el lado de conexión rápida para un sellado correcto.",
      },
    ],
    disclaimer: "Diseño propio compatible. No es un producto oficial Gardena.",
    keywords: [
      "adaptador manguera gardena ght",
      "conector manguera americana europea",
      "adaptador rosca jardin",
    ],
  },
];
