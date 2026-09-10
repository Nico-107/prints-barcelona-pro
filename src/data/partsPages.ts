type I18n = { es: string; en: string; ca: string };

export interface PartPage {
  slug: string;
  name: I18n;
  metaTitle: I18n;
  category: "adapter" | "replacement";
  price: number;
  problemStatement: I18n;
  description: I18n;
  howItsMade: I18n;
  images: { cover: string; uso: string; medidas: string; antesDespues?: string };
  compatibleWith: I18n;
  material: string;
  faqs: { q: I18n; a: I18n }[];
  disclaimer: string;
  keywords: string[];
}

export const partPages: PartPage[] = [
  {
    slug: "/adaptador-vesa-monitor",
    name: {
      es: "Adaptador VESA para Monitor",
      en: "VESA Monitor Adapter",
      ca: "Adaptador VESA per a Monitor",
    },
    metaTitle: {
      es: "Adaptador VESA para Monitor — Repuesto Universal para Soporte No Estándar | Dimension3D",
      en: "VESA Monitor Adapter — Universal Fix for Non-Standard Monitor Mounts | Dimension3D",
      ca: "Adaptador VESA per a Monitor — Recanvi Universal per a Suport No Estàndard | Dimension3D",
    },
    category: "adapter",
    price: 18,
    problemStatement: {
      es: "¿Tu monitor no tiene el patrón de agujeros VESA estándar? Este adaptador conecta cualquier monitor a un soporte o brazo VESA 100x100, sin comprar un soporte nuevo.",
      en: "Does your monitor lack a standard VESA hole pattern? This adapter connects any monitor to a VESA 100×100 mount or arm — no new stand needed.",
      ca: "El teu monitor no té el patró de forats VESA estàndard? Aquest adaptador connecta qualsevol monitor a un suport o braç VESA 100×100, sense comprar cap suport nou.",
    },
    description: {
      es: "Adaptador impreso en 3D que conecta el patrón de tornillos de tu monitor a un soporte VESA estándar de 100x100mm. Diseño propio, sin piezas de terceros ni reproducciones de marca.",
      en: "3D-printed adapter that bridges your monitor's non-standard screw pattern to a 100×100 mm VESA mount. Original design — no third-party components, no brand reproductions.",
      ca: "Adaptador imprès en 3D que connecta el patró de cargols del teu monitor a un suport VESA estàndard de 100×100 mm. Disseny propi, sense components de tercers ni reproduccions de marca.",
    },
    howItsMade: {
      es: "Diseñado a medida según el patrón de agujeros de tu monitor e impreso bajo demanda en PETG, un material rígido y resistente a la deformación. No mantenemos stock — cada pieza se fabrica cuando se confirma el pedido, por lo que no hay inventario que se quede obsoleto ni desperdicio de material.",
      en: "Custom-designed to match your monitor's hole pattern and printed on demand in PETG — a rigid, deformation-resistant material. We hold no stock; each piece is printed once the order is confirmed, so nothing sits on a shelf going to waste.",
      ca: "Dissenyat a mida segons el patró de forats del teu monitor i imprès sota demanda en PETG, un material rígid i resistent a la deformació. No tenim estoc; cada peça es fabrica quan es confirma la comanda, de manera que no hi ha inventari que envelleixi ni malbaratament de material.",
    },
    images: {
      cover: "/images/piezas/adaptador-vesa-uso.jpeg",
      uso: "/images/piezas/adaptador-vesa-cover.jpeg",
      medidas: "/images/piezas/adaptador-vesa-medidas.jpeg",
    },
    compatibleWith: {
      es: "Monitores con patrón de tornillos no estándar, hacia soportes VESA 100x100mm",
      en: "Monitors with non-standard screw patterns, to VESA 100×100 mm mounts",
      ca: "Monitors amb patró de cargols no estàndard, cap a suports VESA 100×100 mm",
    },
    material: "PETG",
    faqs: [
      {
        q: {
          es: "¿Es compatible con mi monitor?",
          en: "Is it compatible with my monitor?",
          ca: "És compatible amb el meu monitor?",
        },
        a: {
          es: "Contáctanos con el patrón de agujeros de tu monitor (mide la distancia entre tornillos) para confirmar antes de comprar.",
          en: "Send us your monitor's hole pattern (measure the distance between screws) and we'll confirm compatibility before you buy.",
          ca: "Envia'ns el patró de forats del teu monitor (mesura la distància entre cargols) i confirmarem la compatibilitat abans de comprar.",
        },
      },
      {
        q: {
          es: "¿Cuánto peso soporta?",
          en: "How much weight can it hold?",
          ca: "Quant pes suporta?",
        },
        a: {
          es: "Diseñado para monitores de hasta 8kg. Para pantallas más pesadas, consulta antes de comprar.",
          en: "Designed for monitors up to 8 kg. For heavier screens, ask before ordering.",
          ca: "Dissenyat per a monitors de fins a 8 kg. Per a pantalles més pesades, consulta'ns abans de comprar.",
        },
      },
      {
        q: {
          es: "¿Esto es un producto oficial de alguna marca?",
          en: "Is this an official brand product?",
          ca: "És un producte oficial d'alguna marca?",
        },
        a: {
          es: "No. Es un diseño propio de Dimension3D para resolver un patrón de montaje no estándar. No está afiliado ni respaldado por ningún fabricante de monitores.",
          en: "No. It is an original Dimension3D design for non-standard mounting patterns. It is not affiliated with or endorsed by any monitor manufacturer.",
          ca: "No. És un disseny propi de Dimension3D per resoldre un patró de muntatge no estàndard. No està afiliat ni avalat per cap fabricant de monitors.",
        },
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
    name: {
      es: "Embudo Dosificador Magnético 58mm",
      en: "Magnetic Dosing Funnel 58 mm",
      ca: "Embut Dosificador Magnètic 58 mm",
    },
    metaTitle: {
      es: "Embudo Dosificador Magnético 58mm — Sin Derrames al Cargar el Portafiltro | Dimension3D",
      en: "Magnetic Dosing Funnel 58mm — No Spills When Loading Your Portafilter | Dimension3D",
      ca: "Embut Dosificador Magnètic 58mm — Sense Derrames en Carregar el Portafiltres | Dimension3D",
    },
    category: "adapter",
    price: 11,
    problemStatement: {
      es: "¿Se te cae el café molido fuera del portafiltro? Este embudo magnético lo mantiene todo dentro, sin manchar la encimera.",
      en: "Does ground coffee spill outside the portafilter? This magnetic dosing funnel keeps everything inside, with no mess on the counter.",
      ca: "Se't cau el cafè mòlt fora del portafiltres? Aquest embut magnètic ho manté tot a dins, sense tacar el taulell.",
    },
    description: {
      es: "Embudo dosificador magnético para portafiltros de 58mm, impreso en PETG. Próximamente disponible en más tamaños (54mm y otros) — contáctanos si necesitas una medida distinta.",
      en: "Magnetic dosing funnel for 58 mm portafilters, printed in PETG. More sizes coming soon (54 mm and others) — contact us if you need a different diameter.",
      ca: "Embut dosificador magnètic per a portafiltres de 58 mm, imprès en PETG. Aviat disponible en més mides (54 mm i altres) — contacta'ns si necessites una mida diferent.",
    },
    howItsMade: {
      es: "Impreso bajo demanda en PETG, resistente al uso diario junto a la máquina de café. Los imanes se insertan a mano tras la impresión.",
      en: "Printed on demand in PETG, which handles daily use next to an espresso machine without warping. The magnets are inserted by hand after printing.",
      ca: "Imprès sota demanda en PETG, resistent a l'ús diari al costat de la màquina de cafè. Els imants s'insereixen a mà després de la impressió.",
    },
    images: {
      cover: "/images/piezas/funnel-58mm-cover.jpeg",
      uso: "/images/piezas/funnel-58mm-uso.jpeg",
      medidas: "/images/piezas/funnel-58mm-medidas.jpeg",
    },
    compatibleWith: {
      es: "Portafiltros de 58mm estándar",
      en: "Standard 58 mm portafilters",
      ca: "Portafiltres de 58 mm estàndard",
    },
    material: "PETG",
    faqs: [
      {
        q: {
          es: "¿Funciona con mi máquina?",
          en: "Will it work with my machine?",
          ca: "Funcionarà amb la meva màquina?",
        },
        a: {
          es: "Compatible con la mayoría de portafiltros de 58mm estándar. Confirma el diámetro exacto de tu cesta antes de comprar.",
          en: "Compatible with most standard 58 mm portafilters. Confirm the exact basket diameter before ordering.",
          ca: "Compatible amb la majoria de portafiltres de 58 mm estàndard. Confirma el diàmetre exacte de la teva cistella abans de comprar.",
        },
      },
      {
        q: {
          es: "¿Hay otros tamaños disponibles?",
          en: "Are other sizes available?",
          ca: "Hi ha altres mides disponibles?",
        },
        a: {
          es: "Sí, próximamente 54mm y otras medidas — contáctanos para encargos a medida.",
          en: "Yes — 54 mm and other sizes are coming soon. Contact us for custom orders.",
          ca: "Sí, aviat 54 mm i altres mides — contacta'ns per a encàrrecs a mida.",
        },
      },
      {
        q: {
          es: "¿Es seguro cerca del grupo de la máquina?",
          en: "Is it safe near the group head?",
          ca: "És segur prop del grup de la màquina?",
        },
        a: {
          es: "Sí, impreso en PETG, pero no está diseñado para tocar directamente el grupo caliente.",
          en: "Yes, it is printed in PETG, but it is not designed to come into direct contact with the hot group head.",
          ca: "Sí, imprès en PETG, però no està dissenyat per tocar directament el grup calent.",
        },
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
    name: {
      es: "Rueda de Cesto para Lavavajillas Bosch (Juego de 4)",
      en: "Dishwasher Basket Wheel for Bosch (Set of 4)",
      ca: "Roda de Cistell per a Rentavaixelles Bosch (Joc de 4)",
    },
    metaTitle: {
      es: "Rueda Cesto Lavavajillas Bosch — Juego de 4 Ruedas de Repuesto Compatible | Dimension3D",
      en: "Dishwasher Basket Wheel for Bosch — Set of 4 Compatible Replacement Wheels | Dimension3D",
      ca: "Roda Cistell Rentavaixelles Bosch — Joc de 4 Rodes de Recanvi Compatible | Dimension3D",
    },
    category: "replacement",
    price: 11,
    problemStatement: {
      es: "¿Se ha roto una rueda del cesto de tu lavavajillas Bosch y ahora se descarrila? Juego de 4 ruedas de repuesto, listas para instalar hoy.",
      en: "Has a wheel on your Bosch dishwasher basket broken and now it keeps derailing? Set of 4 replacement wheels, ready to fit today.",
      ca: "S'ha trencat una roda del cistell del teu rentavaixelles Bosch i ara es descarrila? Joc de 4 rodes de recanvi, llestes per instal·lar avui.",
    },
    description: {
      es: "Juego de 4 ruedas de repuesto compatibles con cestos inferiores de lavavajillas Bosch, Siemens y Neff. Impresas en PETG. Repuesto compatible, no es una pieza original de fábrica.",
      en: "Set of 4 replacement wheels compatible with the lower basket of Bosch, Siemens and Neff dishwashers. Printed in PETG. Compatible spare part — not an original factory component.",
      ca: "Joc de 4 rodes de recanvi compatibles amb els cistells inferiors de rentavaixelles Bosch, Siemens i Neff. Impreses en PETG. Recanvi compatible, no és una peça original de fàbrica.",
    },
    howItsMade: {
      es: "Impresas bajo demanda en PETG por su resistencia al calor y la humedad del interior del lavavajillas. Se reutilizan los tornillos originales de las ruedas rotas.",
      en: "Printed on demand in PETG for its resistance to the heat and moisture inside a dishwasher. The original screws from the broken wheels are reused.",
      ca: "Impreses sota demanda en PETG per la seva resistència a la calor i la humitat de l'interior del rentavaixelles. Es reutilitzen els cargols originals de les rodes trencades.",
    },
    images: {
      cover: "/images/piezas/dishwasher-wheel-cover.jpg",
      uso: "/images/piezas/dishwasher-wheel-uso.jpeg",
      medidas: "/images/piezas/dishwasher-wheel-medidas.jpeg",
      antesDespues: "/images/piezas/dishwasher-wheel-antes-despues.jpeg",
    },
    compatibleWith: {
      es: "Lavavajillas Bosch, Siemens y Neff (confirmar modelo)",
      en: "Bosch, Siemens and Neff dishwashers (confirm model)",
      ca: "Rentavaixelles Bosch, Siemens i Neff (confirmar model)",
    },
    material: "PETG",
    faqs: [
      {
        q: {
          es: "¿Es una pieza original Bosch?",
          en: "Is this an original Bosch part?",
          ca: "És una peça original Bosch?",
        },
        a: {
          es: "No. Es un repuesto compatible de diseño genérico, no fabricado ni afiliado a Bosch, Siemens o Neff.",
          en: "No. It is a compatible replacement of generic design, not manufactured by or affiliated with Bosch, Siemens or Neff.",
          ca: "No. És un recanvi compatible de disseny genèric, no fabricat ni afiliat a Bosch, Siemens o Neff.",
        },
      },
      {
        q: {
          es: "¿Vienen los tornillos incluidos?",
          en: "Are the screws included?",
          ca: "Vénen els cargols inclosos?",
        },
        a: {
          es: "No, se reutilizan los tornillos originales de las ruedas rotas.",
          en: "No — you reuse the original screws from the broken wheels.",
          ca: "No, es reutilitzen els cargols originals de les rodes trencades.",
        },
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
    name: {
      es: "Adaptador de Manguera Gardena a Rosca Estándar",
      en: "Gardena Hose Adapter to Standard Thread",
      ca: "Adaptador de Mànega Gardena a Rosca Estàndard",
    },
    metaTitle: {
      es: "Adaptador Manguera Gardena a Rosca Estándar — Conecta GHT y Sistema Gardena | Dimension3D",
      en: "Gardena Hose Adapter to Standard Thread — Bridge GHT and Gardena Systems | Dimension3D",
      ca: "Adaptador Mànega Gardena a Rosca Estàndard — Connecta GHT i Sistema Gardena | Dimension3D",
    },
    category: "adapter",
    price: 9,
    problemStatement: {
      es: "¿Tienes accesorios de manguera americanos (GHT) y un sistema Gardena en casa? Este adaptador conecta ambos estándares sin comprar equipo nuevo.",
      en: "Do you have American hose fittings (GHT) and a Gardena-style system at home? This adapter joins both standards without buying new equipment.",
      ca: "Tens accessoris de mànega americans (GHT) i un sistema Gardena a casa? Aquest adaptador connecta els dos estàndards sense comprar cap equip nou.",
    },
    description: {
      es: "Adaptador impreso en PETG que conecta el estándar de rosca GHT con sistemas de conexión rápida tipo Gardena. Incluye junta de goma. No afiliado a ninguna marca de manguera.",
      en: "PETG adapter that bridges GHT thread fittings to Gardena-style quick-connect systems. Includes a rubber gasket. Not affiliated with any hose brand.",
      ca: "Adaptador en PETG que connecta les roscades GHT amb els sistemes de connexió ràpida tipus Gardena. Inclou junta de goma. No afiliat a cap marca de mànega.",
    },
    howItsMade: {
      es: "Impreso bajo demanda en PETG, resistente a la exposición exterior y al agua. Se suministra con especificación de junta de goma para un sellado correcto.",
      en: "Printed on demand in PETG, which holds up to outdoor exposure and water contact. Supplied with a rubber gasket spec for a proper seal on the quick-connect side.",
      ca: "Imprès sota demanda en PETG, resistent a l'exposició exterior i a l'aigua. Es subministra amb especificació de junta de goma per a un segellament correcte al costat de connexió ràpida.",
    },
    images: {
      cover: "/images/piezas/adaptador-gardena-cover.jpg",
      uso: "/images/piezas/adaptador-gardena-uso.jpg",
      medidas: "/images/piezas/adaptador-gardena-medidas.jpg",
    },
    compatibleWith: {
      es: "Rosca GHT 3/4 pulgada, sistemas de conexión rápida tipo Gardena",
      en: "3/4-inch GHT thread fittings, Gardena-style quick-connect systems",
      ca: "Rosca GHT 3/4 de polzada, sistemes de connexió ràpida tipus Gardena",
    },
    material: "PETG",
    faqs: [
      {
        q: {
          es: "¿Es un producto oficial Gardena?",
          en: "Is this an official Gardena product?",
          ca: "És un producte oficial Gardena?",
        },
        a: {
          es: "No. Es un diseño propio compatible con sistemas de conexión rápida de ese estilo, no fabricado ni afiliado a Gardena.",
          en: "No. It is an original design compatible with that style of quick-connect system, not manufactured by or affiliated with Gardena.",
          ca: "No. És un disseny propi compatible amb sistemes de connexió ràpida d'aquest estil, no fabricat ni afiliat a Gardena.",
        },
      },
      {
        q: {
          es: "¿Necesito una junta adicional?",
          en: "Do I need an extra gasket?",
          ca: "Necessito una junta addicional?",
        },
        a: {
          es: "Se incluye especificación para junta de goma en el lado de conexión rápida para un sellado correcto.",
          en: "A rubber gasket spec is included for the quick-connect side to ensure a proper seal.",
          ca: "S'inclou l'especificació de junta de goma al costat de connexió ràpida per garantir un segellament correcte.",
        },
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
