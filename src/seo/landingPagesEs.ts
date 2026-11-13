import type { LandingContent } from "./landingPages";

const pick = (...names: string[]) => names.map((n) => `/projects/${n}`);

export const PAGES_ES: LandingContent[] = [
  {
    slug: "/piezas-personalizadas-3d-barcelona",
    topic: "custom-parts",
    altSlug: "/custom-parts-barcelona",
    lang: "es",
    category: "use-case",
    metaTitle: "Piezas 3D a Medida Barcelona",
    metaDescription: "Piezas 3D a medida en Barcelona desde tu STL, STEP o foto. Recambios funcionales, soportes, clips de coche y prototipos.",
    h1: "Piezas 3D a Medida en Barcelona — De Archivo a Pieza en 24–48h",
    intro: "¿Necesitas una pieza que no encuentras en ninguna tienda? Eso es justamente lo que hacemos. Dimension3D fabrica piezas 3D personalizadas en Barcelona para hogares, talleres, conductores y makers — desde un solo clip roto hasta pequeñas tiradas de soportes a medida.",
    sections: [
      {
        heading: "Piezas personalizadas habituales",
        body: "Algunos de los encargos más frecuentes que recibimos en Barcelona: recambios de plástico para electrodomésticos (lavadoras, neveras, lavavajillas, aspiradoras), clips y embellecedores de coche rotos, soportes para baldas, monitores y equipos, pomos y tiradores, guías de cajón, organizadores, accesorios para bicicleta y carcasas protectoras para electrónica.\n\nSi la pieza original ya no se fabrica, o el fabricante cobra un precio absurdo por un trozo de plástico minúsculo, una impresión 3D a medida suele ser más rápida, más barata e igual de duradera cuando se hace en el material adecuado."
      },
      {
        heading: "Manda una foto y recibe la pieza",
        body: "No necesitas un archivo 3D. La mayoría de nuestros clientes de piezas a medida nos envían por WhatsApp una foto de la pieza rota junto a una regla o una moneda como referencia. A partir de ahí solemos poder:\n\n• confirmar si es imprimible,\n• recomendar un material (PLA para piezas sin esfuerzo, PETG o ABS para piezas con carga, TPU para piezas flexibles),\n• y darte un precio claro en menos de una hora.\n\nPara formas más complejas también trabajamos con archivos STEP/STL, planos técnicos o medidas que tú mismo aportes."
      },
      {
        heading: "Piezas únicas y pequeñas tiradas",
        body: "El pedido mínimo es de 10 € (sin mínimo por pieza). Tan contentos imprimimos un solo soporte de recambio como una pequeña serie de piezas idénticas para un taller, una clínica dental, un estudio de arquitectura o una tienda local. Para clientes habituales guardamos el archivo, así los reencargos son inmediatos."
      },
      {
        heading: "Pensadas para durar de verdad",
        body: "Una pieza impresa en 3D solo es tan buena como su material y sus parámetros de impresión. Elegimos el plástico y la densidad de relleno según la función real de la pieza, no el más barato. Por eso muchas piezas a medida de Dimension3D son más duraderas que el plástico inyectado original que sustituyen."
      }
    ],
    faqs: [
      { q: "¿Podéis copiar una pieza rota a partir de una foto?", a: "En muchos casos sí — sobre todo piezas simétricas o con geometría sencilla. Envía una foto clara con regla o moneda como referencia y te lo confirmamos enseguida." },
      { q: "¿Qué material recomendáis para piezas a medida?", a: "PLA para piezas decorativas o sin esfuerzo, PETG para exteriores o carga moderada, ABS/ASA para resistencia al calor y TPU para piezas flexibles como mangos o juntas." },
      { q: "¿Hay pedido mínimo?", a: "El pedido mínimo es de 10 € por pedido — desde 1 pieza. Imprimimos piezas únicas constantemente, y solo pagas por lo que pides." },
      { q: "¿Qué precisión tienen las piezas a medida?", a: "La precisión típica en FDM es de unos ±0,2 mm. Para tolerancias más ajustadas afinamos parámetros y postprocesamos las superficies críticas." },
      { q: "¿Podéis recrear una pieza solo a partir de medidas, sin el original?", a: "Sí. Si puedes aportar medidas detalladas, fotos desde varios ángulos o un croquis técnico, podemos modelar e imprimir la pieza. Para geometrías complejas, una breve consulta ayuda a aclarar los requisitos de ajuste." },
      { q: "¿Qué pasa si la pieza impresa no encaja a la primera?", a: "La FDM mantiene una precisión típica de ±0,2 mm. Si un primer intento está ligeramente fuera para un ajuste de tolerancia ajustada, aplicamos una pequeña corrección dimensional (normalmente 0,1–0,2 mm) y reimprimimos a coste reducido." }
    ],
    galleryImages: pick("custom-brackets.jpg", "ferrari-key-holder.jpg", "red-adapter.jpg", "intake-manifold.jpg", "black-intake.jpg", "curved-parts.jpg"),
    related: [
      { label: "Recambios y Descatalogados", slug: "/recambios-impresion-3d-barcelona" },
      { label: "Piezas Funcionales", slug: "/piezas-funcionales-barcelona" },
      { label: "Diseñamos tu Pieza — Sin Archivo", slug: "/disena-tu-pieza-3d" },
      { label: "Cómo se Calcula el Precio", slug: "/precio-impresion-3d-barcelona" },
      { label: "Custom Parts (EN)", slug: "/custom-parts-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" }
    ],
    schemaServiceName: "Piezas Personalizadas 3D Barcelona"
  },
  {
    slug: "/prototipos-3d-barcelona",
    topic: "prototypes",
    altSlug: "/prototype-printing-barcelona",
    lang: "es",
    category: "use-case",
    metaTitle: "Prototipos 3D en Barcelona | Prototipado Rápido FDM",
    metaDescription: "Prototipado rápido en Barcelona para startups, ingenieros y estudiantes. Prototipos funcionales, validación de producto, tiradas piloto. Plazos rápidos.",
    h1: "Prototipos 3D en Barcelona",
    intro: "Dimension3D es el aliado en Barcelona para cualquiera que esté iterando sobre un producto físico — startups validando su primer hardware, ingenieros freelance, diseñadores industriales, estudiantes universitarios e inventores. Imprimimos prototipos funcionales que puedes probar de verdad, no solo enseñar.",
    sections: [
      {
        heading: "Prototipado rápido para no parar tu proyecto",
        body: "El sentido de un prototipo es aprender rápido. Cada semana extra entre iteraciones te cuesta tiempo, dinero e impulso. Trabajar con una imprenta 3D local en Barcelona te permite pasar de una revisión CAD a una pieza en mano en 24–72 horas, sin esperar a un servicio extranjero.\n\nAceptamos archivos STL, OBJ, 3MF y STEP. Si trabajas con SolidWorks, Fusion 360, Onshape, Rhino, FreeCAD o Tinkercad, sus exportaciones nativas funcionan sin problema."
      },
      {
        heading: "Prototipos funcionales, no maquetas",
        body: "Te ayudamos a elegir el material según lo que tenga que hacer el prototipo. PLA es ideal para validar forma y ajuste. PETG aguanta esfuerzo moderado y exteriores. ABS/ASA tolera calor. Nylon y Nylon-CF dan una resistencia mecánica cercana a los plásticos de ingeniería. TPU permite prototipar juntas, sellos y cubiertas flexibles.\n\nEsto importa: un prototipo que falla por el motivo equivocado — material o relleno mal elegidos — desperdicia un ciclo entero de iteración."
      },
      {
        heading: "Startups, ingenieros, makers y proyectos académicos",
        body: "Trabajamos habitualmente con:\n\n• Startups de hardware en Barcelona validando MVPs.\n• Diseñadores de producto freelance presentando a clientes.\n• Ingenieros que necesitan plantillas, utillajes y herramientas.\n• Estudiantes de la UPC, ESDi, Elisava e IED produciendo proyectos finales.\n• Inventores en proceso de patentar que necesitan una muestra física funcional.\n\nFirmamos NDA con gusto para proyectos confidenciales."
      },
      {
        heading: "Del prototipo a la pequeña serie",
        body: "Una vez validado el prototipo, podemos escalar a tiradas de baja producción (desde una unidad hasta varios cientos, según el tamaño) sin que tengas que cambiar de proveedor. Esa continuidad importa cuando intentas lanzar un producto, no solo imprimirlo."
      }
    ],
    faqs: [
      { q: "¿Qué formatos de archivo 3D aceptáis?", a: "STL, OBJ, 3MF y STEP. También podemos trabajar con exportaciones nativas de tu CAD — pregúntanos." },
      { q: "¿Firmáis NDA para prototipos confidenciales?", a: "Sí. Firmamos NDA habitualmente con startups de hardware y departamentos de I+D." },
      { q: "¿Hacéis pequeñas tiradas de producción tras el prototipo?", a: "Sí, producimos tiradas desde unidades individuales hasta varios cientos una vez validado el diseño." },
      { q: "¿Cuánto se tarda en una iteración?", a: "La mayoría de iteraciones de prototipo están listas en 24–72 horas según tamaño y material." },
      { q: "¿Es mejor la FDM que la resina para mi prototipo?", a: "Para prototipos funcionales que hay que manipular, probar o someter a esfuerzo, la FDM suele ser mejor — produce piezas más resistentes en una gama de materiales más amplia. La resina tiene mayor detalle superficial pero es más frágil. Te asesoramos según lo que el prototipo tiene que demostrar." },
      { q: "¿Qué pasa si detectáis un problema en mi archivo durante la revisión?", a: "Lo indicamos en el presupuesto antes de empezar — problemas de espesor de pared, voladizos sin soporte, orientación que afectaría a la resistencia. Tú decides si revisar el archivo o continuar con nuestras recomendaciones." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "black-intake.jpg", "red-adapter.jpg", "blue-molds.jpg", "curved-parts.jpg"),
    related: [
      { label: "Prototipado Rápido 24–72h", slug: "/prototipado-rapido-barcelona" },
      { label: "Piezas Funcionales para Validar", slug: "/piezas-funcionales-barcelona" },
      { label: "Servicio Express y Mismo Día", slug: "/impresion-3d-urgente-barcelona" },
      { label: "Diseñamos tu Pieza — Sin Archivo", slug: "/disena-tu-pieza-3d" },
      { label: "Prototype Printing (EN)", slug: "/prototype-printing-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" }
    ],
    schemaServiceName: "Prototipado Rápido Barcelona"
  },
  {
    slug: "/impresion-3d-urgente-barcelona",
    topic: "urgent",
    altSlug: "/urgent-3d-printing-barcelona",
    lang: "es",
    category: "service",
    metaTitle: "Impresión 3D Urgente en Barcelona | Express 24h",
    metaDescription: "Impresión 3D urgente en Barcelona. Cola prioritaria, entregas en 24–48h y mismo día para piezas rotas, eventos y cosplay. Contacta por WhatsApp.",
    h1: "Impresión 3D Urgente en Barcelona",
    intro: "A veces una pieza no puede esperar. Un electrodoméstico roto bloquea tu cocina, una demo a un cliente es mañana, una entrega de cosplay es este fin de semana. Dimension3D ofrece servicio de impresión 3D urgente en Barcelona con cola prioritaria, entregas en 24–48 horas y producción el mismo día cuando las máquinas lo permiten.",
    sections: [
      {
        heading: "Cómo funcionan los pedidos urgentes",
        body: "Mándanos un WhatsApp con lo que necesitas y tu fecha límite. En cuestión de minutos (en horario laboral) te decimos con honestidad:\n\n• si tu plazo es realista,\n• qué material recomendamos para imprimir lo más rápido posible sin sacrificar la función,\n• y el precio Express.\n\nNo aceptamos el encargo si no podemos cumplir el plazo — preferimos perder un trabajo antes que dejar tirado a un cliente."
      },
      {
        heading: "Casos típicos de urgencia",
        body: "• Recambios de electrodomésticos que bloquean el día a día (tiradores de lavadora, clips de nevera, boquillas de aspiradora).\n• Atrezzo, carteles y soportes de última hora para eventos.\n• Accesorios de cosplay antes de una convención o sesión de fotos.\n• Plantillas de ingeniería o clips de recambio en una línea de producción.\n• Prototipos de demo para una reunión con inversores.\n\nSi es imprimible en FDM y la geometría es razonable, normalmente lo encajamos en la cola."
      },
      {
        heading: "Cola prioritaria sin perder calidad",
        body: "Express no significa chapuza. Seguimos laminando con soportes adecuados, temperaturas calibradas y revisamos cada pieza antes de que salga del taller. La diferencia es que tu encargo pasa al frente de la cola y se imprime en la siguiente máquina disponible."
      },
      {
        heading: "Recogida o entrega rápida en Barcelona",
        body: "Para encargos urgentes en Barcelona, la recogida local con cita previa es la opción más rápida. También coordinamos mensajería el mismo día dentro de la ciudad para encargos que no se pueden recoger. Para el resto de la España peninsular, ofrecemos envío express con seguimiento."
      }
    ],
    faqs: [
      { q: "¿Realmente puedo tener una impresión 3D el mismo día en Barcelona?", a: "A veces — depende del tamaño, el material y la cola actual. Mándanos un WhatsApp con la pieza y la fecha límite y te respondemos honestamente en minutos." },
      { q: "¿Cuánto cuesta extra el servicio urgente?", a: "Los encargos Express tienen un recargo de prioridad que depende del tamaño y el plazo. Siempre ves el precio total antes de aprobar el pedido." },
      { q: "¿Cuál es la forma más rápida de enviar mi archivo?", a: "WhatsApp al +34 672 051 147. Adjunta el STL/STEP/foto e indica el plazo." },
      { q: "¿Las impresiones urgentes pueden tener buena calidad?", a: "Sí. No sacrificamos adherencia entre capas, precisión dimensional ni acabado por la velocidad — solo damos prioridad a tu encargo." },
      { q: "¿Trabajáis los fines de semana para emergencias reales?", a: "Contáctanos por WhatsApp — para emergencias reales a veces podemos acomodar producción en fin de semana. No es un servicio garantizado, pero siempre vale la pena preguntar si tu situación es crítica." },
      { q: "¿Cuál es el plazo mínimo absoluto posible?", a: "Para piezas pequeñas y simples en PLA o PETG, hemos tenido pedidos listos para recogida local en tan solo 3–6 horas desde la aprobación del archivo. Las piezas más grandes o complejas siempre necesitan más tiempo." }
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "halloween-set.jpg", "stranger-things-lit.jpg", "lion-king-figures.jpg", "intake-manifold.jpg", "custom-brackets.jpg"),
    related: [
      { label: "Recambios Descatalogados", slug: "/recambios-impresion-3d-barcelona" },
      { label: "Piezas a Medida al Momento", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Iteración de Prototipos", slug: "/prototipos-3d-barcelona" },
      { label: "Recargos y Precios Express", slug: "/precio-impresion-3d-barcelona" },
      { label: "Urgent Printing (EN)", slug: "/urgent-3d-printing-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" }
    ],
    schemaServiceName: "Impresión 3D Urgente Barcelona"
  },
  {
    slug: "/precio-impresion-3d-barcelona",
    topic: "pricing",
    altSlug: "/3d-printing-price-barcelona",
    lang: "es",
    category: "service",
    metaTitle: "Precios Impresión 3D Barcelona — Desde 10€, Gratis en 1h",
    metaDescription: "¿Cuánto cuesta la impresión 3D en Barcelona? Piezas desde 10€. Precios transparentes por tamaño y material. Presupuesto gratis en 1h, sin compromiso.",
    h1: "Precio de Impresión 3D en Barcelona",
    intro: "Una de las primeras preguntas de cualquier cliente es: ¿cuánto va a costar mi impresión 3D? En esta página explicamos exactamente qué determina el precio de una impresión 3D en Barcelona, con ejemplos realistas, para que puedas planificar tu proyecto sin sorpresas.",
    sections: [
      {
        heading: "Qué determina el precio",
        body: "Tres factores marcan principalmente el precio de una impresión 3D:\n\n1. Coste del material — PLA es el más asequible; PETG, ABS/ASA y TPU cuestan algo más; Nylon y Nylon-CF son los más premium.\n2. Tiempo y tamaño — las piezas más grandes y altas usan más plástico y ocupan la máquina más tiempo.\n3. Complejidad — soportes pesados, detalle muy fino, postprocesado o montaje añaden trabajo.\n\nTe damos un precio único y transparente que ya incluye preparación, laminado, material, tiempo de máquina y acabado básico."
      },
      {
        heading: "Rangos de precio típicos",
        body: "Estas referencias son realistas para impresiones FDM en Barcelona:\n\n• Piezas pequeñas (clip, pomo, gancho, figura pequeña): desde 10 €.\n• Piezas medianas (soporte, organizador, decoración, figura mediana): normalmente 20–60 €.\n• Piezas grandes (cascos, jarrones, carcasas grandes, figuras altas): normalmente 60–250 €.\n• Pequeñas tiradas: pide precio por unidad — las piezas repetidas salen más baratas.\n\nSon referencias de partida. El presupuesto exacto depende de tu archivo, material y plazo."
      },
      {
        heading: "Descuentos por cantidad",
        body: "Las piezas repetidas cuestan menos por unidad porque la preparación y el laminado se hacen una sola vez. Si necesitas 5, 20 o 200 piezas iguales, indícalo en tu solicitud y te diremos exactamente cómo baja el precio por unidad según crece la cantidad."
      },
      {
        heading: "Cómo pedir un presupuesto claro",
        body: "Envíanos tu archivo STL/OBJ/3MF/STEP (o una foto y medidas aproximadas) por el formulario de la web o por WhatsApp. En menos de una hora en horario laboral te enviamos un precio claro, el material recomendado y el plazo realista. No se cobra nada hasta que confirmas el pedido."
      }
    ],
    faqs: [
      { q: "¿Cuál es la impresión 3D más barata?", a: "Piezas pequeñas y simples en PLA desde unos 10 €. Materiales más resistentes o tamaños mayores cuestan más." },
      { q: "¿Cobráis por el presupuesto?", a: "No. Los presupuestos son siempre gratis y solo pagas si confirmas el pedido." },
      { q: "¿Por qué la misma pieza cuesta más en PETG o Nylon?", a: "Esos filamentos son más caros e imprimen más despacio con parámetros más exigentes, pero duran mucho más en aplicaciones con esfuerzo o exteriores." },
      { q: "¿Las cantidades grandes salen más baratas por pieza?", a: "Sí. Indícanos la cantidad y te enviamos un precio escalado." },
      { q: "¿El precio presupuestado es fijo una vez que lo apruebo?", a: "Sí. Una vez que apruebas un presupuesto, el precio queda bloqueado. Los presupuestos son válidos por 30 días desde su emisión — si los costes de materiales cambian significativamente después de ese periodo, puede que necesitemos revisarlo." },
      { q: "¿Puedo obtener una estimación aproximada sin enviar un archivo?", a: "Sí — describe el tamaño de la pieza, el material y la cantidad y te daremos un rango orientativo realista. Para un presupuesto exacto y vinculante, necesitamos un archivo o una foto clara con dimensiones." }
    ],
    galleryImages: pick("custom-brackets.jpg", "ferrari-key-holder.jpg", "purple-figures.jpg", "cookie-cutters.jpg", "blue-molds.jpg", "red-adapter.jpg"),
    related: [
      { label: "Impresión 3D en Barcelona", slug: "/" },
      { label: "Mejor Servicio Según Necesidad", slug: "/mejor-servicio-impresion-3d-barcelona" },
      { label: "PLA — la Opción Más Económica", slug: "/impresion-pla-barcelona" },
      { label: "Comparativa de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Pricing (EN)", slug: "/3d-printing-price-barcelona" },
      { label: "Preus (CA)", slug: "/ca/preu-impressio-3d-barcelona" }
    ],
    schemaServiceName: "Precios Impresión 3D Barcelona"
  },
  {
    slug: "/recambios-impresion-3d-barcelona",
    topic: "replacement-parts",
    altSlug: "/replacement-parts-barcelona",
    lang: "es",
    category: "use-case",
    metaTitle: "Recambios 3D Barcelona",
    metaDescription: "Recambios impresos en 3D en Barcelona para electrodomésticos, muebles y vehículos. Clips rotos, mandos, soportes y piezas descatalogadas.",
    h1: "Recambios Impresos en 3D en Barcelona",
    intro: "Tirar un electrodoméstico que funciona perfectamente por culpa de un trozo minúsculo de plástico roto no tiene sentido — ni a nivel ambiental ni económico. Dimension3D fabrica recambios impresos en 3D en Barcelona para electrodomésticos, mobiliario, objetos antiguos y cualquier producto cuyo recambio original ya no esté disponible.",
    sections: [
      {
        heading: "Recambios que hacemos a diario",
        body: "Encargos habituales en Barcelona:\n\n• Cajetines, tiradores y clips de lavadoras y lavavajillas.\n• Soportes de baldas, guías y bisagras de neveras.\n• Adaptadores y clips de aspiradoras.\n• Pomos y piezas de depósitos de cafeteras.\n• Conectores de muebles y soportes de baldas.\n• Piezas para radios antiguas, cámaras y juguetes vintage.\n• Clips, soportes y accesorios para bici y patinete.\n\nSi la pieza original se rompió, deformó o simplemente desapareció, hay muchas posibilidades de que la podamos recrear."
      },
      {
        heading: "Cuando la pieza ya no se vende",
        body: "Muchos fabricantes dejan de vender recambios al cabo de unos años, dejando al propietario con un producto perfectamente funcional y un trozo de plástico de 5 € que falta. Podemos hacer ingeniería inversa de la pieza a partir de una foto clara con escala, de la pieza rota original o de tus medidas, y la imprimimos en un material que dure más que el original."
      },
      {
        heading: "Reparar en lugar de tirar",
        body: "Reparar en lugar de reemplazar evita emisiones de fabricación y residuos electrónicos. Una pieza impresa en 3D usa una fracción de la energía y materiales necesarios para fabricar un electrodoméstico nuevo. Es nuestra pequeña aportación al derecho a reparar aquí en Barcelona."
      },
      {
        heading: "Cómo pedir un recambio",
        body: "Envíanos un WhatsApp con:\n\n1. Una foto clara de la pieza rota junto a una regla o moneda.\n2. Una foto del lugar donde encaja (para entender cómo se monta).\n3. Marca y modelo del aparato, si los conoces.\n\nTe respondemos con la viabilidad, el material recomendado y el precio en menos de una hora, en horario laboral."
      }
    ],
    faqs: [
      { q: "¿Podéis sustituir cualquier pieza de plástico?", a: "La mayoría de piezas de plástico simples sí. Clips muy finos y elásticos o piezas para mucho calor pueden requerir un material específico — te avisamos si no es viable." },
      { q: "¿Cuánto dura un recambio impreso?", a: "Cuando se hace en el material adecuado (PETG, ABS o Nylon en piezas con esfuerzo), suelen durar más que el plástico inyectado original." },
      { q: "¿Reparar es más barato que comprar nuevo?", a: "Casi siempre. Una pieza impresa cuesta normalmente 10–60 € frente a cientos por un electrodoméstico nuevo." },
      { q: "¿Imprimís piezas para equipos antiguos?", a: "Sí. Cámaras, radios, juguetes y electrodomésticos antiguos son algunos de nuestros encargos favoritos porque ya no existen recambios originales." },
      { q: "¿Qué información ayuda a conseguir el resultado más preciso a la primera?", a: "Una foto clara de la pieza rota junto a una regla o moneda, una foto mostrando dónde se monta en el aparato, y la marca y modelo del dispositivo. Cuanto más contexto, mejor el ajuste en el primer intento." },
      { q: "¿Podéis hacer recambios en metal?", a: "No — trabajamos exclusivamente con filamentos poliméricos (PLA, PETG, ABS/ASA, Nylon, TPU). Para piezas metálicas necesitarías un servicio de mecanizado CNC o fundición. Nuestros recambios poliméricos frecuentemente superan la durabilidad de los originales en aplicaciones de baja temperatura." }
    ],
    galleryImages: pick("custom-brackets.jpg", "red-adapter.jpg", "curved-parts.jpg", "black-intake.jpg", "intake-manifold.jpg", "ferrari-key-holder.jpg"),
    related: [
      { label: "Piezas a Medida desde Foto", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Servicio Urgente", slug: "/impresion-3d-urgente-barcelona" },
      { label: "Diseñamos tu Pieza — Sin Archivo", slug: "/disena-tu-pieza-3d" },
      { label: "Estructura del Precio", slug: "/precio-impresion-3d-barcelona" },
      { label: "Replacement Parts (EN)", slug: "/replacement-parts-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" }
    ],
    schemaServiceName: "Recambios Impresos 3D Barcelona"
  },
  {
    slug: "/impresion-pla-barcelona",
    topic: "pla",
    altSlug: "/pla-printing-barcelona",
    lang: "es",
    category: "material",
    metaTitle: "Impresión PLA Barcelona — Prototipos, Regalos y Decoración",
    metaDescription: "Impresión 3D en PLA en Barcelona — precisa, económica y ecológica. Prototipos, decoraciones, regalos personalizados y figuras. Amplia gama de colores.",
    h1: "Impresión 3D en PLA en Barcelona",
    intro: "El PLA es el material de impresión 3D más popular del mundo por buenos motivos — es ecológico, fácil de imprimir con gran precisión y está disponible en una enorme gama de colores. Dimension3D ofrece impresión profesional en PLA en Barcelona para todo tipo de proyectos, desde piezas decorativas hasta prototipos iniciales.",
    sections: [
      {
        heading: "Por qué PLA",
        body: "El PLA (ácido poliláctico) es un bioplástico derivado de fuentes renovables como el almidón de maíz. Comparado con otros materiales de impresión 3D:\n\n• Es ecológico y biodegradable en condiciones de compostaje industrial.\n• Es fácil de imprimir a alta resolución, capturando detalles finos.\n• Está disponible en decenas de colores y acabados (mate, seda, brillo, fluorescente, mármol, efecto madera).\n• Es más asequible que los plásticos de ingeniería.\n\nSus principales limitaciones son la sensibilidad al calor (se reblandece por encima de ~55°C) y menor resistencia mecánica que PETG, ABS o Nylon."
      },
      {
        heading: "Para qué es mejor el PLA",
        body: "Recomendamos PLA para:\n\n• Piezas decorativas, esculturas, figuras y dioramas.\n• Prototipos de arquitectura y diseño de producto.\n• Regalos, artículos personalizados, llaveros a medida.\n• Cortadores de galletas, maceteros, organizadores (uso interior).\n• Proyectos educativos y de estudiantes.\n• Miniaturas de juego de mesa y coleccionables.\n\nPara cualquier cosa que vaya a vivir en exterior, soportar peso o resistir calor, normalmente recomendamos PETG, ABS/ASA o Nylon en su lugar."
      },
      {
        heading: "Opciones de color y acabado",
        body: "Tenemos una amplia gama de colores PLA: negros, blancos y grises clásicos para prototipos; rojos, azules, verdes, amarillos y morados vibrantes para piezas decorativas; y filamentos especiales como seda, mate, efecto mármol y fluorescente. Si buscas un color de marca específico o un Pantone, mándanos la referencia y la igualamos lo más posible."
      },
      {
        heading: "Buena relación calidad-precio y entregas rápidas",
        body: "Como el PLA imprime rápido y de forma fiable, también es uno de los materiales más asequibles. Las piezas pequeñas en PLA empiezan desde 10 € y la mayoría de pedidos en PLA salen en 2–5 días laborables. Hay servicio Express para urgencias."
      }
    ],
    faqs: [
      { q: "¿Es el PLA suficientemente fuerte para piezas funcionales?", a: "Para esfuerzos bajos o moderados, sí. Para piezas con carga o altas temperaturas recomendamos PETG, ABS/ASA o Nylon." },
      { q: "¿Es realmente biodegradable el PLA?", a: "Sí, en condiciones de compostaje industrial. En un cajón normal dura años." },
      { q: "¿Podéis imprimir PLA en cualquier color?", a: "Tenemos un amplio surtido. Para colores especiales, dinos la referencia y buscamos la coincidencia más cercana." },
      { q: "¿Cuál es el tamaño máximo en PLA?", a: "El volumen máximo típico es de unos 250×250×300 mm en una pieza. Objetos mayores se imprimen en partes y se ensamblan." },
      { q: "¿Se puede lijar, imprimar y pintar el PLA?", a: "Sí. El PLA se lija fácilmente con lija estándar, acepta bien la imprimación acrílica y se puede pintar con aerosol o pintura acrílica. Es el material ideal para figuras y piezas decorativas que pienses acabar o personalizar." },
      { q: "¿Es el PLA seguro para el contacto con alimentos?", a: "El PLA estándar no está certificado para contacto alimentario — la superficie porosa de la FDM puede albergar bacterias incluso tras el lavado. No lo recomendamos para tazas, platos o cubiertos. Para aplicaciones de contacto alimentario, consúltanos sobre materiales certificados." }
    ],
    galleryImages: pick("eiffel-tower.jpg", "big-ben-tower.jpg", "green-chameleon.jpg", "purple-figures.jpg", "halloween-set.jpg", "ferrari-key-holder.jpg"),
    related: [
      { label: "PETG — Más Resistente y Exterior", slug: "/impresion-petg-barcelona" },
      { label: "TPU — Flexible tipo Goma", slug: "/impresion-tpu-barcelona" },
      { label: "Elegir el Material Adecuado", slug: "/guia-materiales-impresion-3d" },
      { label: "Cómo Preparar tu Archivo STL", slug: "/como-preparar-archivo-impresion-3d" },
      { label: "PLA Printing (EN)", slug: "/pla-printing-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" }
    ],
    schemaServiceName: "Impresión PLA Barcelona"
  },
  {
    slug: "/impresion-petg-barcelona",
    topic: "petg",
    altSlug: "/petg-printing-barcelona",
    lang: "es",
    category: "material",
    metaTitle: "Impresión PETG Barcelona — Piezas Funcionales y Exteriores",
    metaDescription: "Impresión 3D en PETG en Barcelona. Más resistente que el PLA, soporta agua y UV. Piezas funcionales y exteriores. Presupuesto en 1 h desde 10€.",
    h1: "Impresión 3D en PETG en Barcelona",
    intro: "Cuando una pieza necesita ser más dura que el PLA, sobrevivir al exterior o estar en contacto con agua, el PETG suele ser la respuesta. Dimension3D ofrece impresión profesional en PETG en Barcelona para aplicaciones funcionales, mecánicas y de exterior.",
    sections: [
      {
        heading: "Por qué PETG",
        body: "El PETG (tereftalato de polietileno glicol) está entre el PLA y el ABS en dificultad y propiedades. Comparado con el PLA ofrece:\n\n• Mayor resistencia al impacto — las piezas flexan en lugar de romperse.\n• Mejor resistencia a temperatura (reblandece sobre 70–80°C).\n• Excelente adherencia entre capas, lo que da impresiones más fuertes.\n• Buena resistencia química, al agua y a UV.\n\nEs el material que más recomendamos para piezas que tienen que cumplir una función real, no solo lucir bien."
      },
      {
        heading: "Para qué es mejor el PETG",
        body: "Encargos típicos en PETG en Barcelona:\n\n• Soportes y montajes de exterior (maceteros, equipo de jardín, terraza).\n• Clips funcionales y embellecedores de coche.\n• Plantillas mecánicas, utillaje y herramientas.\n• Recambios de electrodomésticos que se calientan o mojan.\n• Recipientes, tapas y aplicaciones cercanas a alimentos (el contacto alimentario requiere filamento certificado — pregúntanos).\n• Accesorios de bici y patinete expuestos al clima."
      },
      {
        heading: "Resistencia a exterior y agua",
        body: "El PETG resiste mucho mejor que el PLA la humedad y la exposición UV, lo que lo convierte en la opción natural para cualquier cosa que viva fuera todo el año en el clima de Barcelona. Además es menos quebradizo en frío, así que las piezas aguantan los cambios de temperatura sin agrietarse."
      },
      {
        heading: "Pide piezas en PETG en Barcelona",
        body: "Envía tu archivo STL/STEP o describe la pieza en el formulario. Te sugeriremos el espesor de pared y el relleno adecuados para que la pieza sea suficientemente fuerte sin ser innecesariamente cara. Las piezas pequeñas en PETG empiezan desde 12–15 €."
      }
    ],
    faqs: [
      { q: "¿En qué se diferencia el PETG del PLA?", a: "El PETG es más duro, más flexible al impacto, más resistente al calor y soporta el exterior. El PLA es más fácil de imprimir, capta más detalle y es más barato." },
      { q: "¿Aguanta el PETG los veranos de Barcelona en exterior?", a: "Sí. El PETG resiste bien UV y humedad. Para aplicaciones de mucho calor podemos sugerir ABS/ASA." },
      { q: "¿Es el PETG apto para alimentos?", a: "El PETG estándar no está certificado para contacto alimentario. Existe PETG certificado food-safe y podemos conseguirlo para proyectos específicos." },
      { q: "¿Es el PETG más caro que el PLA?", a: "Algo. El material cuesta un poco más e imprime más lento, así que el precio por pieza es típicamente un 15–30% mayor que en PLA." },
      { q: "¿A qué temperatura empieza a deformarse el PETG?", a: "El PETG empieza a reblandecerse alrededor de los 70–80°C. Para piezas cerca de fuentes de calor constantes — motores, lavavajillas, cerca de hornos — recomendamos ABS/ASA, que aguanta hasta 90–100°C." },
      { q: "¿Cuánto más resistente es el PETG que el PLA para piezas funcionales?", a: "El PETG ofrece típicamente un 20–30% más de resistencia al impacto que el PLA y una adherencia entre capas significativamente mejor. En la práctica, las piezas flexan bajo carga en lugar de romperse limpiamente — lo que importa en el uso mecánico real." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "black-intake.jpg", "red-adapter.jpg", "curved-parts.jpg", "blue-molds.jpg"),
    related: [
      { label: "PLA — Impresión Fácil Diaria", slug: "/impresion-pla-barcelona" },
      { label: "TPU — Flexible tipo Goma", slug: "/impresion-tpu-barcelona" },
      { label: "Guía Completa de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Preparar Archivos para FDM", slug: "/como-preparar-archivo-impresion-3d" },
      { label: "PETG Printing (EN)", slug: "/petg-printing-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" }
    ],
    schemaServiceName: "Impresión PETG Barcelona"
  },
  {
    slug: "/impresion-tpu-barcelona",
    topic: "tpu",
    altSlug: "/tpu-printing-barcelona",
    lang: "es",
    category: "material",
    metaTitle: "Impresión TPU Flexible Barcelona",
    metaDescription: "Impresión 3D en TPU flexible en Barcelona. Piezas tipo goma: soportes de móvil, juntas, mangos y wearables. Presupuesto en 1 h, desde 10€.",
    h1: "Impresión 3D Flexible en TPU en Barcelona",
    intro: "El TPU es el material que hace flexible la impresión 3D. Si una pieza necesita doblarse, agarrar, amortiguar o sellar, este es el que usamos. Dimension3D fabrica impresiones 3D a medida en TPU en Barcelona para todo, desde soportes de móvil hasta juntas industriales.",
    sections: [
      {
        heading: "Qué es el TPU",
        body: "El TPU (poliuretano termoplástico) es un filamento flexible tipo goma. La dureza exacta depende de la dureza shore — normalmente trabajamos con TPU 95A, que se siente parecido a una goma dura: lo bastante flexible para doblarse y estirarse, lo bastante firme para mantener forma bajo carga.\n\nSus propiedades lo hacen perfecto para piezas que tienen que absorber impactos, adaptarse a formas o sellar contra superficies."
      },
      {
        heading: "Para qué es mejor el TPU",
        body: "Imprimimos TPU en Barcelona para:\n\n• Soportes de móvil, tablet y dashcam que tienen que agarrar sin rayar.\n• Juntas, sellos y arandelas a medida para aplicaciones no críticas.\n• Mangos y fundas ergonómicas.\n• Piezas y accesorios wearables.\n• Parachoques y carcasas protectoras.\n• Piezas de drones que tienen que absorber vibración.\n• Correas de reloj y pulseras."
      },
      {
        heading: "Cosas a saber sobre la impresión flexible",
        body: "El TPU es más lento de imprimir que el PLA o el PETG y requiere afinar bien los parámetros, lo que lo hace algo más caro por pieza. Paredes muy finas pueden quedar demasiado blandas, mientras que paredes muy gruesas se vuelven demasiado rígidas — te sugerimos el espesor y relleno que dan la sensación que buscas.\n\nEl TPU también resiste la abrasión, los aceites y muchos productos químicos, lo que lo hace sorprendentemente duradero para ser flexible."
      },
      {
        heading: "Pide piezas en TPU",
        body: "Envía tu archivo STL/STEP o describe lo que necesitas. Dinos cómo de flexible quieres que se sienta la pieza — blando y blandito, tipo goma, o firme pero doblable — y adaptamos la geometría. Las piezas pequeñas en TPU empiezan normalmente en 15 €."
      }
    ],
    faqs: [
      { q: "¿Cómo de flexible es vuestro TPU?", a: "El TPU 95A estándar se comporta como una goma dura — se dobla y estira pero no es blandurri. Podemos ajustar la sensación cambiando espesor de pared y relleno." },
      { q: "¿Puedo imprimir una funda de móvil a medida en TPU?", a: "Sí, siempre que tengas o puedas aportar un modelo 3D de la forma de tu móvil. También adaptamos modelos existentes." },
      { q: "¿Es el TPU bueno para piezas de exterior?", a: "Sí — resiste bien UV y humedad y mantiene su flexibilidad en un rango amplio de temperatura." },
      { q: "¿Por qué es el TPU más caro que el PLA?", a: "Imprime mucho más lento y requiere afinar parámetros. La diferencia suele ser un 30–50% más por pieza." },
      { q: "¿Qué dureza Shore tiene vuestro filamento TPU estándar?", a: "Trabajamos principalmente con dureza Shore 95A, que se nota como una goma dura — doblegable y estirable pero con estabilidad estructural bajo carga. Se pueden conseguir variantes más blandas (alrededor de 85A) para aplicaciones que necesitan más flexibilidad." },
      { q: "¿Cómo de finas pueden ser las paredes en una impresión flexible de TPU?", a: "Para impresiones flexibles fiables recomendamos un espesor mínimo de pared de 1,5–3,0 mm según la flexibilidad deseada. Las paredes muy finas quedan demasiado inestables dimensionalmente; las muy gruesas pierden la flexión deseada." }
    ],
    galleryImages: pick("curved-parts.jpg", "custom-brackets.jpg", "red-adapter.jpg", "black-intake.jpg", "intake-manifold.jpg", "blue-molds.jpg"),
    related: [
      { label: "PLA — Impresión Rígida con Detalle", slug: "/impresion-pla-barcelona" },
      { label: "PETG — Piezas Rígidas Funcionales", slug: "/impresion-petg-barcelona" },
      { label: "Tabla Comparativa de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Modelado y Grosor de Paredes", slug: "/como-preparar-archivo-impresion-3d" },
      { label: "TPU Printing (EN)", slug: "/tpu-printing-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" }
    ],
    schemaServiceName: "Impresión TPU Barcelona"
  },
  {
    slug: "/miniaturas-3d-barcelona",
    topic: "miniatures",
    altSlug: "/miniatures-barcelona",
    lang: "es",
    category: "use-case",
    metaTitle: "Miniaturas y Figuras 3D en Barcelona | Tabletop Gaming",
    metaDescription: "Miniaturas y figuras impresas en 3D en Barcelona para juegos de mesa, coleccionismo y dioramas. Alto detalle, listas para pintar. Encargos a medida.",
    h1: "Miniaturas y Figuras 3D en Barcelona",
    intro: "Desde ejércitos de tabletop hasta figuras de coleccionista y dioramas detallados, las miniaturas son una de nuestras categorías favoritas. Dimension3D imprime miniaturas 3D de alto detalle en Barcelona para aficionados, jugadores y coleccionistas.",
    sections: [
      {
        heading: "Qué imprimimos para el mundo del hobby",
        body: "Encargos habituales de miniaturas en Barcelona:\n\n• Ejércitos y escuadras de wargame (escalas 28mm, 32mm, 54mm).\n• Personajes y monstruos de rol.\n• Figuras de exhibición de películas, series, anime y videojuegos.\n• Miniaturas a medida diseñadas a partir de tu concepto o boceto.\n• Piezas de escenografía, terreno y mazmorras modulares.\n• Dioramas con varias figuras y efectos.\n• Recambios para juegos de mesa y figuras rotas."
      },
      {
        heading: "Alto detalle, listas para pintar",
        body: "Aunque trabajamos principalmente con tecnología FDM, un laminado cuidadoso, alturas de capa finas y los materiales adecuados nos permiten producir miniaturas con el nivel de detalle que esperan los coleccionistas. Orientamos las piezas para minimizar líneas de capa visibles en caras y superficies importantes, y recomendamos el material según el tipo de pintura y acabado que pienses dar.\n\nSi un proyecto requiere realmente detalle de resina, te lo decimos desde el principio — no vendemos al FDM lo que no puede dar."
      },
      {
        heading: "Miniaturas a medida desde tu concepto",
        body: "¿Tienes una idea de personaje, una mascota familiar, el logo de tu grupo convertido en figura, o un regalo personalizado en mente? Mándanos referencias — bocetos, fotos, descripciones — y podemos imprimir un modelo 3D que tú aportes o presupuestar el diseño 3D a medida antes de imprimirlo.\n\nProducimos habitualmente figuras únicas a medida como regalos personalizados: despedidas, jubilaciones, mascotas de grupos de juego, mascotas de marca."
      },
      {
        heading: "Pide miniaturas en Barcelona",
        body: "Cuéntanos qué quieres imprimir — archivo, escala y cantidad — y te presupuestamos en menos de una hora en horario laboral. Empaquetamos con cuidado para recogida local en Barcelona o envío a toda la España peninsular con seguimiento."
      }
    ],
    faqs: [
      { q: "¿Realmente puede el FDM imprimir miniaturas detalladas?", a: "Sí, con la orientación correcta y alturas de capa finas. Para detalle extremo (ojos, partes muy finas) te decimos honestamente los límites del FDM antes de presupuestar." },
      { q: "¿Qué escalas imprimís?", a: "Las escalas más comunes de tabletop (28mm, 32mm, 54mm) y escalas más grandes para exhibición. Envía tu archivo o indica la escala y lo confirmamos." },
      { q: "¿Entregáis miniaturas imprimadas o pintadas?", a: "Por defecto entregamos impresiones limpias listas para pintar. Si quieres miniaturas pintadas, pídenos presupuesto separado para la pintura." },
      { q: "¿Podéis diseñar una miniatura a partir de una foto?", a: "Sí, presupuestamos el diseño 3D a medida desde fotos o referencias y luego imprimimos el resultado." },
      { q: "¿Qué altura de capa usáis para miniaturas de alto detalle?", a: "Para miniaturas de exhibición usamos típicamente 0,10–0,12 mm de altura de capa, que capta detalle superficial fino manteniendo tiempos de impresión prácticos. Para figuras muy pequeñas o detalle extremo podemos llegar a 0,08 mm." },
      { q: "¿Se verán las marcas de soporte en la miniatura terminada?", a: "Orientamos las piezas cuidadosamente para colocar los puntos de contacto del soporte en zonas no visibles — partes inferiores, superficies traseras, bases. Algunas marcas son inherentes al FDM; establecemos expectativas realistas por modelo antes de que apruebes la impresión." }
    ],
    galleryImages: pick("purple-figures.jpg", "lion-king-figures.jpg", "lion-king-scene.jpg", "stranger-things-diorama.jpg", "stranger-things-lit.jpg", "halloween-set.jpg"),
    related: [
      { label: "PLA — Filamento con Detalle", slug: "/impresion-pla-barcelona" },
      { label: "Figuras Únicas a Medida", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Qué Servicio Encaja Mejor", slug: "/mejor-servicio-impresion-3d-barcelona" },
      { label: "Precios por Lote y Cantidad", slug: "/precio-impresion-3d-barcelona" },
      { label: "Miniatures (EN)", slug: "/miniatures-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" }
    ],
    schemaServiceName: "Miniaturas 3D Barcelona"
  },

  // ----- NUEVA: EMPRESAS -----
  {
    slug: "/impresion-3d-empresas-barcelona",
    topic: "business",
    altSlug: "/3d-printing-for-business-barcelona",
    lang: "es",
    category: "use-case",
    metaTitle: "Impresión 3D para Empresas en Barcelona",
    metaDescription: "Impresión 3D para empresas e ingenieros en Barcelona. 250+ pedidos, desde 10€, sin tarifa de configuración. Factura con IVA. Presupuesto en 1 hora.",
    h1: "Impresión 3D para Empresas en Barcelona — Factura, NDA y Desde 10 €",
    intro: "Dimension3D trabaja con equipos de ingeniería, departamentos de I+D, talleres y pequeños fabricantes en Barcelona que necesitan piezas 3D funcionales sin los tiempos y la burocracia de un proveedor industrial. Envía tu archivo — STL, STEP o IGES — y recibe presupuesto profesional en menos de una hora. Sin cuenta, sin concurso, sin volumen mínimo.",
    sections: [
      {
        heading: "Qué producimos para clientes empresa",
        body: "Nuestros clientes empresa nos usan para una amplia gama de aplicaciones técnicas e industriales:\n\n• Utillaje, jigs, fixtures y herramientas de fin de brazo para líneas de producción.\n• Prototipos funcionales para validación y presentaciones a clientes.\n• Carcasas y cajas para electrónica y PCBs.\n• Piezas de repuesto y componentes de desgaste para maquinaria.\n• Tiradas cortas de producción, desde unas pocas hasta varios cientos de piezas idénticas.\n• Soportes de montaje, guías de cable y hardware para rack.\n\nTrabajamos en PETG, ABS/ASA, Nylon y Nylon-CF para aplicaciones estructurales, y en PLA o PETG para piezas funcionales de baja carga. Si tu aplicación requiere un material o tolerancia específicos, dínoslo desde el principio."
      },
      {
        heading: "STL, STEP e IGES aceptados — presupuesto profesional en 1 hora",
        body: "Envíanos tu archivo por el formulario de subida o directamente por WhatsApp. Trabajamos con todos los formatos CAD estándar: STL, STEP, IGES, OBJ y 3MF. Si usas SolidWorks, Fusion 360, Onshape, CATIA o FreeCAD, exporta en cualquiera de esos formatos.\n\nRevisamos cada archivo manualmente antes de presupuestar — comprobando espesor de pared, necesidad de soportes, orientación y adecuación del material — para que el presupuesto refleje el coste real y el plazo real, no una estimación automática. Recibirás un precio detallado en menos de 60 minutos en horario laboral."
      },
      {
        heading: "Tiradas cortas y pedidos repetidos",
        body: "Una vez que la pieza está validada, podemos gestionar pedidos repetidos sin volver a presupuestar desde cero. Conservamos el archivo laminado y los parámetros de impresión. El coste unitario baja con el volumen — pide precio por tramos al solicitar presupuesto.\n\nTambién podemos entregar en tu taller u oficina de Barcelona por mensajería, o enviar a cualquier dirección de la España peninsular con seguimiento."
      },
      {
        heading: "Confidencialidad y NDA",
        body: "Firmamos NDA para cualquier proyecto que lo requiera. La confidencialidad es práctica habitual para nosotros — nunca compartimos archivos, diseños ni detalles de proyectos de clientes. Si tu departamento de I+D o equipo de ingeniería necesita discreción, lo gestionamos como punto de partida, no como excepción."
      }
    ],
    faqs: [
      { q: "¿Firmáis NDA para proyectos de empresa?", a: "Sí. Firmamos NDA para cualquier cliente que lo solicite. Nunca compartimos archivos ni detalles de proyectos de clientes." },
      { q: "¿Qué formatos de archivo aceptáis?", a: "STL, STEP, IGES, OBJ y 3MF. Exportaciones nativas de SolidWorks, Fusion 360, Onshape y la mayoría de herramientas funcionan directamente." },
      { q: "¿Podéis suministrar 50 o 100 piezas idénticas?", a: "Sí. Realizamos tiradas desde una unidad hasta varios cientos. El precio unitario baja con la cantidad — pide presupuesto por tramos." },
      { q: "¿Qué tolerancias podéis mantener?", a: "La precisión FDM típica es ±0,2 mm. Para características de tolerancia más ajustada ajustamos parámetros y podemos post-procesar superficies críticas. Indícanos el requisito desde el principio." },
      { q: "¿Emitís facturas completas con IVA para pedidos de empresa?", a: "Sí. Emitimos facturas completas con IVA para todos los clientes empresa. Facilítanos el nombre de tu empresa y el CIF/NIF al hacer el pedido." },
      { q: "¿Cuál es el plazo típico para una tirada de 50–100 piezas?", a: "Para la mayoría de piezas de tamaño estándar, entre 5 y 10 días laborables según el tamaño y el material. Para necesidades urgentes de tirada, contáctanos para hablar de planificación prioritaria — te diremos con honestidad qué es alcanzable." }
    ],
    galleryImages: pick("intake-manifold.jpg", "black-intake.jpg", "custom-brackets.jpg", "blue-molds.jpg", "curved-parts.jpg", "red-adapter.jpg"),
    related: [
      { label: "Prototipado Rápido 24–72h", slug: "/prototipado-rapido-barcelona" },
      { label: "Piezas Funcionales Estructurales", slug: "/piezas-funcionales-barcelona" },
      { label: "Prototipos de Validación", slug: "/prototipos-3d-barcelona" },
      { label: "PETG para Carcasas Industriales", slug: "/impresion-petg-barcelona" },
      { label: "For Business (EN)", slug: "/3d-printing-for-business-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" }
    ],
    schemaServiceName: "Impresión 3D para Empresas Barcelona"
  },

  // ----- NUEVA: PROTOTIPADO RÁPIDO -----
  {
    slug: "/prototipado-rapido-barcelona",
    topic: "rapid-prototyping",
    altSlug: "/rapid-prototyping-barcelona",
    lang: "es",
    category: "use-case",
    metaTitle: "Prototipado Rápido Barcelona — Entrega 24–72h, Desde 10€",
    metaDescription: "Prototipado rápido en Barcelona para ingenieros y startups. STL o STEP — prototipo funcional en 24–72h. Desde 10€, sin tarifa de configuración. PETG, Nylon.",
    h1: "Prototipado Rápido en Barcelona — Entrega en 24–72h",
    intro: "La iteración rápida es la base del desarrollo de hardware. Dimension3D ofrece prototipado rápido en Barcelona con un plazo típico de 24–72 horas desde archivo hasta pieza en mano — para que tu próxima revisión de diseño llegue antes de que la competencia termine su primera solicitud de presupuesto.",
    sections: [
      {
        heading: "24–72h de STL o STEP a pieza funcional",
        body: "En cuanto termina tu revisión CAD, envíala. Aceptamos STL, STEP e IGES de cualquier herramienta de modelado — SolidWorks, Fusion 360, Onshape, Rhino, FreeCAD, CATIA. Sin conversión, sin reformateo.\n\nRevisamos cada archivo manualmente antes de confirmar el plazo. Si la geometría tiene un problema de soportes o un espesor de pared que afectará a la función, lo señalamos en el presupuesto en lugar de imprimir una pieza defectuosa y hacerte esperar otras 48 horas."
      },
      {
        heading: "Material adaptado a la fase de iteración",
        body: "Seleccionamos el material de impresión según lo que el prototipo tiene que demostrar, no lo que es más barato:\n\n• PLA — verificaciones de forma y ajuste, modelos de concepto en fase temprana.\n• PETG — carga moderada y exposición exterior, primera validación funcional.\n• ABS/ASA — piezas resistentes al calor, prototipos para automoción y carcasas.\n• Nylon / Nylon-CF — piezas mecánicas de alta carga, más cercanas a las propiedades del plástico inyectado.\n• TPU — cubiertas flexibles, juntas, estanqueidades.\n\nElegir el material equivocado desperdicia un ciclo de iteración completo. En el presupuesto te recomendamos el correcto."
      },
      {
        heading: "Iteraciones sin fricción",
        body: "Cada archivo revisado pasa por el mismo ciclo de revisión en el día y producción en 24–72h. Sin suscripción, pedido mínimo de 10 € por iteración, sin burocracia — subes, revisamos, presupuestamos, apruebas, imprimimos. Para clientes que iteran con frecuencia conservamos tu proyecto en archivo y podemos recibir revisiones por WhatsApp directamente."
      },
      {
        heading: "Del prototipo a la tirada corta de producción",
        body: "Una vez que el diseño está cerrado, podemos pasar sin fisuras a tiradas cortas de producción sin cambiar de proveedor ni renegociar condiciones. Conservamos los parámetros de impresión validados y podemos programar una tirada con poco margen de preaviso."
      }
    ],
    faqs: [
      { q: "¿Cuánto tarda una iteración de prototipado?", a: "Normalmente entre 24 y 72 horas desde el envío del archivo hasta la pieza en mano, según tamaño, material y cola actual." },
      { q: "¿Qué formatos CAD aceptáis?", a: "STL, STEP, IGES, OBJ y 3MF. Exportaciones de SolidWorks, Fusion 360, Onshape, Rhino, FreeCAD y la mayoría de herramientas funcionan sin conversión." },
      { q: "¿Detectáis problemas de diseño antes de imprimir?", a: "Sí. Revisamos cada archivo manualmente y señalamos problemas de espesor de pared, soportes o material antes de imprimir." },
      { q: "¿Podéis hacer una tirada pequeña de producción tras el prototipo?", a: "Sí. Pasamos del prototipo a la tirada corta sin cambiar de proveedor ni re-establecer condiciones. Pide presupuesto por tramos para cualquier cantidad." },
      { q: "¿En qué se diferencia esto de vuestro servicio estándar de prototipos?", a: "El prototipado rápido está configurado específicamente para ciclos de iteración múltiple rápidos. Guardamos tu proyecto entre iteraciones, aceptamos archivos de revisión directamente por WhatsApp y priorizamos el plazo de 24–72h sin volver a presupuestar desde cero cada vez." },
      { q: "¿Puedo hacer varias revisiones de diseño en la misma semana?", a: "Sí — ese es todo el punto. Cada archivo revisado pasa por el mismo ciclo de revisión en el día y producción en 24–72h. Los iteradores frecuentes comparten archivos directamente por WhatsApp y los entregamos sin demora administrativa." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "black-intake.jpg", "red-adapter.jpg", "blue-molds.jpg", "curved-parts.jpg"),
    related: [
      { label: "Impresión 3D para Empresas", slug: "/impresion-3d-empresas-barcelona" },
      { label: "Piezas Funcionales con Carga", slug: "/piezas-funcionales-barcelona" },
      { label: "Prototipos Únicos y Series", slug: "/prototipos-3d-barcelona" },
      { label: "Guía de Selección de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Rapid Prototyping (EN)", slug: "/rapid-prototyping-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" }
    ],
    schemaServiceName: "Prototipado Rápido Barcelona"
  },

  // ----- NUEVA: PIEZAS FUNCIONALES -----
  {
    slug: "/piezas-funcionales-barcelona",
    topic: "functional-parts",
    altSlug: "/functional-parts-barcelona",
    lang: "es",
    category: "use-case",
    metaTitle: "Piezas Funcionales 3D Barcelona",
    metaDescription: "Piezas funcionales 3D en Barcelona: PETG, ABS, Nylon y TPU. Componentes estructurales, utillaje y piezas de uso final. Presupuesto en 1 h, desde 10€.",
    h1: "Piezas Funcionales 3D en Barcelona — Bajo Demanda",
    intro: "No toda impresión 3D es decorativa. Dimension3D está especializado en piezas funcionales impresas en 3D en Barcelona — componentes que cargan, flexionan, sellan, montan, protegen o sustituyen algo en el mundo real. Seleccionamos el material, el espesor de pared y el relleno correctos para lo que la pieza tiene que hacer.",
    sections: [
      {
        heading: "Qué hace realmente funcional una pieza",
        body: "Una pieza funcional tiene que sobrevivir a su entorno y cumplir su cometido sin fallar. Eso significa:\n\n• Elegir el polímero adecuado — PETG para piezas funcionales generales y de exterior, ABS/ASA para resistencia al calor y productos químicos, Nylon para cargas mecánicas altas, Nylon-CF para máxima rigidez, TPU para aplicaciones flexibles o de estanqueidad.\n• Configurar la densidad de relleno correcta — 20–40% para cargas moderadas, 60–80% para piezas estructurales, 100% macizo para contactos portantes.\n• Orientar la pieza en la dirección de carga dominante — la adherencia entre capas es siempre el eje débil en FDM.\n\nTomamos las tres decisiones por ti en la fase de presupuesto. Si una geometría no va a sobrevivir a la aplicación en FDM, te lo decimos antes de imprimirla."
      },
      {
        heading: "Categorías habituales de piezas funcionales",
        body: "Trabajos típicos de impresión funcional en Barcelona:\n\n• Jigs, fixtures y guías para líneas de producción.\n• Carcasas y cajas para electrónica, sensores y PCBs.\n• Piezas de repuesto y reparación para electrodomésticos, vehículos y equipos.\n• Soportes de montaje, guías de cable y hardware para rack.\n• Utillaje a medida y pinzas de fin de brazo.\n• Soportes estructurales para muebles, estanterías y estructuras de exterior.\n• Prototipos funcionales para validación mecánica.\n\nSi una pieza tiene un trabajo real que hacer, la tratamos como tal."
      },
      {
        heading: "Guía de materiales para impresión funcional",
        body: "Selección de materiales para piezas funcionales:\n\n• PETG — el más versátil para piezas funcionales, de exterior y en contacto con agua. Fácil de imprimir, resistente, resistente a UV y humedad.\n• ABS/ASA — para piezas que se calientan (automoción, electrodomésticos cerca de fuentes de calor) o que afrontan UV exterior a largo plazo.\n• Nylon PA12 — alta resistencia a la tracción, baja fricción, bueno para engranajes, casquillos y piezas de alto desgaste.\n• Nylon-CF — la opción FDM más rígida, se acerca al aluminio en rigidez por peso para soportes estructurales.\n• TPU 95A — para piezas flexibles: juntas, mangos, topes, estanqueidades.\n\nEn el presupuesto te recomendamos el material adecuado para tu aplicación."
      },
      {
        heading: "De una pieza a una tirada corta",
        body: "Pedido mínimo de 10 €, sin tarifa de configuración. Imprimimos piezas funcionales individuales con la misma facilidad que un lote de 50. Para pedidos repetidos, conservamos el archivo y los parámetros para que los reencargos se gestionen en minutos. Pide precio por tramos para cualquier cantidad — el coste unitario baja con el volumen."
      }
    ],
    faqs: [
      { q: "¿Qué material es mejor para piezas funcionales con carga?", a: "Nylon PA12 o Nylon-CF para máxima resistencia mecánica. PETG para cargas moderadas con exposición exterior o al agua. En el presupuesto especificamos el correcto." },
      { q: "¿Cuánto resiste una pieza en PETG comparada con plástico inyectado?", a: "Una pieza PETG bien impresa al 60%+ de relleno es a menudo comparable al PP o ABS inyectado para cargas estructurales moderadas, aunque anisótropa — más resistente en el plano de impresión que entre capas." },
      { q: "¿Podéis imprimir piezas funcionales con tolerancias ajustadas?", a: "La FDM típica mantiene ±0,2 mm. Para superficies de acoplamiento críticas ajustamos parámetros y podemos post-mecanizar si se requieren tolerancias más ajustadas." },
      { q: "¿Revisáis los archivos antes de imprimir?", a: "Sí. Revisamos cada archivo manualmente. Si hay un problema — paredes finas, orientación inadecuada para la dirección de carga, soporte insuficiente — lo señalamos antes de imprimir." },
      { q: "¿Qué densidad de relleno usáis para piezas estructurales con carga?", a: "Para cargas estructurales moderadas usamos 40–60% de relleno. Para alta carga o superficies de contacto portante usamos 80–100% sólido. Especificamos el relleno en cada presupuesto para que sepas exactamente lo que recibes." },
      { q: "¿Qué postprocesado está disponible para piezas funcionales?", a: "Insertos roscados de calor (M3, M4, M5) para conexiones con tornillo, suavizado por vapor de acetona en ABS para mejor sellado superficial, y roscado manual o lijado ligero de superficies de acoplamiento críticas. Solicita cualquier postprocesado al enviar el presupuesto." }
    ],
    galleryImages: pick("intake-manifold.jpg", "black-intake.jpg", "custom-brackets.jpg", "curved-parts.jpg", "blue-molds.jpg", "red-adapter.jpg"),
    related: [
      { label: "Impresión 3D para Empresas B2B", slug: "/impresion-3d-empresas-barcelona" },
      { label: "Iteración Rápida de Prototipos", slug: "/prototipado-rapido-barcelona" },
      { label: "PETG para Carga y Exterior", slug: "/impresion-petg-barcelona" },
      { label: "Nylon, ABS, ASA Explicados", slug: "/guia-materiales-impresion-3d" },
      { label: "Functional Parts (EN)", slug: "/functional-parts-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" }
    ],
    schemaServiceName: "Piezas Funcionales 3D Barcelona"
  },

  // ----- NUEVA: CÓMO ELEGIR SERVICIO -----
  {
    slug: "/como-elegir-servicio-impresion-3d-barcelona",
    topic: "choosing-service",
    altSlug: "/how-to-choose-3d-printing-service-barcelona",
    lang: "es",
    category: "use-case",
    metaTitle: "Cómo Elegir un Servicio de Impresión 3D en Barcelona",
    metaDescription: "Guía práctica para elegir servicio de impresión 3D en Barcelona: qué preguntar antes de encargar, señales a las que prestar atención",
    h1: "Cómo Elegir el Mejor Servicio de Impresión 3D en Barcelona: 7 Criterios",
    intro: "Antes de mandar tu archivo al primer resultado de Google, dedica cinco minutos a hacer algunas preguntas concretas. Las respuestas te dicen si el precio que te van a dar refleja la pieza que realmente vas a recibir — y si el servicio que estás eligiendo encaja de verdad con tu proyecto. Esta guía repasa qué preguntar, en qué fijarte, y en qué se diferencian estructuralmente los tres modelos de servicio más comunes.",
    sections: [
      {
        heading: "Qué preguntar antes de encargar",
        body: "Un servicio de impresión 3D serio responde a todas estas preguntas con claridad y por escrito. Si alguna respuesta queda vaga, esa vaguedad ya es información.\n\n• ¿Con qué materiales trabajáis realmente y cuáles me recomendaríais para mi pieza? Un taller que ofrece veinte materiales pero solo imprime dos con regularidad es distinto de uno que mantiene seis materiales en rotación diaria.\n• ¿Qué altura de capa y qué relleno usaríais para mi presupuesto? La altura de capa (habitualmente 0,12–0,28 mm en FDM) y el porcentaje de relleno cambian directamente el precio y la resistencia de la pieza.\n• ¿Qué tolerancia podéis mantener en las medidas críticas de mi geometría? El FDM en la práctica se sitúa en torno a ±0,2 mm en la mayoría de dimensiones. Pregunta qué mide realmente el taller, no la cifra de marketing.\n• ¿Quién revisa mi archivo antes de imprimir? ¿Una persona, un algoritmo, o nada? La revisión humana detecta problemas de espesor de pared, de orientación y de soportes que el presupuesto automático no ve.\n• ¿Hay pedido mínimo? ¿Cuál es la pieza más pequeña que imprimís, y por qué precio?\n• ¿Cuál es el plazo realista desde presupuesto aprobado hasta pieza enviada, en días laborables, para el tamaño y material que os planteo?\n\nUn taller que responde a estas seis preguntas en un mensaje de WhatsApp en menos de una hora ya te ha contado mucho sobre cómo trabaja."
      },
      {
        heading: "Señales a las que prestar atención en un presupuesto",
        body: "Algunos patrones merecen una pausa antes de aprobar un encargo:\n\n• Un precio cerrado sin que nadie haya abierto el archivo. El precio en FDM es una función de gramos de plástico y horas de máquina. Sin abrir la geometría, ningún presupuesto puede reflejar ninguna de las dos cosas con precisión — una cifra instantánea suele ir con margen de seguridad, o bien ser poco realista.\n• Ningún pedido mínimo indicado en la web. Todo taller tiene uno, esté en 10 € o en 200 €. No indicarlo abiertamente suele significar que se negocia caso por caso, lo que dificulta planificar el gasto.\n• Plazos de entrega vagos o inexistentes. \"Entrega rápida\" no es un plazo. \"Envío en 3–5 días laborables desde aprobación\" sí lo es.\n• Ningún canal de soporte con una persona al otro lado. Si el único punto de contacto es un formulario web que genera un número de ticket, espera que el ritmo de la comunicación se ajuste a eso.\n• Silencio sobre la revisión del archivo. Si nadie mira la geometría antes de imprimir, el taller está asumiendo que tu CAD es perfecto. La mayoría de los CAD no lo son.\n\nNinguna de estas señales por sí sola indica un mal taller — pero tres o cuatro juntas forman un patrón."
      },
      {
        heading: "Tres modelos de servicio — comparativa objetiva",
        body: "Hay tres formas habituales de encargar una impresión 3D en Barcelona, y se diferencian en aspectos estructurales que importan más que el marketing de cualquier empresa concreta:\n\n| Característica | Taller local en Barcelona | Plataforma online internacional | Marketplace de makers |\n|---|---|---|---|\n| Plazo típico (presupuesto aprobado → pieza en mano) | 2–5 días laborables en pedidos estándar; express 24–48h posible | 7–14 días laborables incluyendo envío internacional | Variable según el maker; habitualmente 5–15 días laborables |\n| Pedido mínimo | Fijado por el taller; frecuentemente 10–50 € o inexistente | Sin mínimo por pieza habitualmente; mínimos por pedido comunes | Fijado por cada maker de forma independiente |\n| Revisión humana del archivo antes de presupuestar | Práctica habitual en la mayoría de talleres locales | Presupuesto algorítmico por defecto; revisión humana bajo petición o en tramos superiores | Depende íntegramente del maker |\n| Idioma de atención | Español, catalán e inglés disponibles a nivel local | Habitualmente inglés únicamente, o portal por idioma | Depende de los idiomas del maker |\n| Recogida presencial | Disponible con cita en la mayoría de talleres locales | No ofrecida — solo envío internacional | En ocasiones, si el maker es local y está dispuesto |\n| Personalización y ayuda de diseño | Diálogo directo con la persona que produce la pieza | Especificaciones estándar; personalización vía ticket o tramo premium | Directa con el maker, calidad variable |\n\nEn el caso de Dimension3D concretamente: somos un taller local en Barcelona, presupuestamos en menos de una hora en horario laboral, el pedido mínimo es de 10 € sin mínimo por pieza, revisamos cada archivo manualmente antes de dar el precio, atendemos en español, catalán e inglés, y la recogida en Barcelona está disponible con cita previa.\n\nLa opción adecuada depende de tu proyecto. Si necesitas una pieza funcional para la próxima semana con una recomendación de material concreta, un taller local está estructuralmente preparado para eso. Si necesitas 500 piezas idénticas con calidad de inyección al menor coste unitario posible y puedes esperar, la economía de una plataforma internacional puede encajar mejor. Elige el modelo que se ajuste al trabajo."
      },
      {
        heading: "Preguntas específicas según el tipo de proyecto",
        body: "La lista genérica anterior es un mínimo, no un techo. Según lo que estés encargando, añade preguntas específicas al proyecto:\n\n• Para una pieza funcional con carga: pregunta qué material y qué relleno recomiendan y por qué, y con qué rango de temperatura y de carga trabajan al hacer esa recomendación.\n• Para una pieza para exterior: pregunta explícitamente por estabilidad UV. ASA y PETG se comportan de forma distinta al sol que el PLA. Un taller que responde \"lo imprimimos en lo que quieras\" sin preguntar por el entorno no está optimizando para que la pieza funcione.\n• Para un prototipo visual: pregunta por altura de capa, acabado superficial y opciones de post-procesado (lijado, imprimación, pintura).\n• Para una tirada de 20+ piezas idénticas: pregunta por precio por tramos, control de calidad por lote, y cómo gestionan las piezas que salen fuera de especificación.\n• Para cualquier proyecto con fecha límite: pide un plazo de presupuesto-aprobado-a-envío en días laborables, no naturales, y confirma si el servicio express se presupuesta aparte.\n\nUn buen taller agradece estas preguntas. Le indican qué priorizar en tu encargo."
      },
      {
        heading: "Cómo respondemos nosotros a cada punto — en corto",
        body: "Para referencia directa, así responde nuestra operación a la lista:\n\n• Materiales en rotación diaria: PLA, PETG, ABS, ASA, TPU, Nylon (PA12) y variantes reforzadas con fibra de carbono (PLA-CF, PETG-CF, Nylon-CF).\n• Rango de altura de capa: 0,12–0,28 mm según la función de la pieza; se especifica por presupuesto.\n• Tolerancia típica: ±0,2 mm en la mayoría de dimensiones FDM; características de mayor precisión se presupuestan individualmente.\n• Revisión de archivo: cada archivo se abre manualmente antes de enviar el presupuesto; las cuestiones de espesor de pared, soportes y orientación se plantean en ese momento.\n• Pedido mínimo: 10 €. Sin mínimo por pieza — un solo clip pequeño es un encargo válido.\n• Plazo: estándar de 2–5 días laborables desde presupuesto aprobado; express en 24–48h disponible; entregas el mismo día posibles cuando la cola lo permite.\n• Idioma de atención: español, catalán e inglés, por WhatsApp o email.\n• Recogida: disponible en el taller de Barcelona con cita previa; envío a la España peninsular con seguimiento.\n\nUsa esta guía con cualquier taller que estés valorando. El objetivo no es dirigirte a nosotros — es darte la forma de una buena conversación con cualquier proveedor de impresión 3D."
      }
    ],
    faqs: [
      { q: "¿Es mala señal que un servicio dé precio online al instante?", a: "No necesariamente — un estimador instantáneo es genuinamente útil para una primera cifra orientativa. Lo que importa es si una persona revisa el archivo antes de confirmar el presupuesto. Precio instantáneo seguido de revisión humana está bien. Precio instantáneo que va directo a imprimir sin que nadie mire la geometría es donde aparecen los problemas." },
      { q: "¿Cómo sé si un taller puede mantener la tolerancia que necesito?", a: "Pregunta qué características te importan (agujeros, superficies de acoplamiento, insertos roscados) y qué tolerancia pueden mantener en esas concretamente. Un taller que responde con una cifra real y una explicación de cómo lo conseguiría — orientación, número de perímetros, post-procesado — sabe lo que hace. Un taller que solo dice \"sí, alta tolerancia\" no ha respondido a la pregunta." },
      { q: "¿Debería preocuparme que un taller no tenga pedido mínimo?", a: "No — al contrario. Un mínimo declarado de 10 € o similar sin mínimo por pieza es un taller preparado para imprimir un solo clip sin problema. Un taller que solo presupuesta a partir de 200 € por pedido está optimizado para un tipo de cliente distinto, y eso también está bien — simplemente asegúrate de que encaja con tu proyecto." },
      { q: "¿Cuál es un plazo razonable para una pieza funcional pequeña en Barcelona?", a: "Para una pieza pequeña en PLA o PETG sin geometría compleja, desde presupuesto aprobado hasta lista para recoger son habitualmente 2–5 días laborables en un taller local. El servicio express en 24–48 horas es una opción común encima de eso. Si alguien te presupuesta 3 semanas para una pieza estándar pequeña sin justificación concreta, pregunta el motivo." },
      { q: "¿Merece la pena pagar más por un taller local en lugar de un servicio online internacional?", a: "Depende del proyecto. Un taller local está estructuralmente preparado para diálogo directo, plazos más cortos, recogida presencial y revisión del archivo por una persona. Una plataforma internacional está estructuralmente preparada para producción estandarizada de gran volumen. Si tu proyecto encaja con el segundo perfil — cientos de piezas idénticas, sin prisa, sin materiales inusuales — la economía de la plataforma puede compensar. Si encaja con el primero, la diferencia de precio del taller local es normalmente menor de lo que la gente espera, y la reducción de fricción es real." },
      { q: "¿Cómo sé que un taller cumplirá lo que ha presupuestado?", a: "Dos pruebas prácticas. Primero, pide ver fotografías de una pieza similar que hayan impreso recientemente — un taller serio tiene portfolio. Segundo, fíjate en cómo responden a tus preguntas previas al presupuesto: respuestas precisas, directas y con los compromisos reconocidos correlan fuertemente con el mismo comportamiento en el trabajo real." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "ferrari-key-holder.jpg", "curved-parts.jpg", "black-intake.jpg", "red-adapter.jpg"),
    related: [
      { label: "Guía Completa de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Preparar Archivos Correctamente", slug: "/como-preparar-archivo-impresion-3d" },
      { label: "Mejor Servicio por Caso de Uso", slug: "/mejor-servicio-impresion-3d-barcelona" },
      { label: "Cómo se Calcula el Precio", slug: "/precio-impresion-3d-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" },
      { label: "Choosing Guide (EN)", slug: "/how-to-choose-3d-printing-service-barcelona" }
    ],
    schemaServiceName: "Guía del Comprador de Impresión 3D Barcelona",
    datePublished: "2026-08-01",
    dateModified: "2026-10-15",
    howToSteps: [
      { name: "Qué preguntar antes de encargar", text: "Un servicio de impresión 3D serio responde a todas estas preguntas con claridad y por escrito. Si alguna respuesta queda vaga, esa vaguedad ya es información." },
      { name: "Señales a las que prestar atención en un presupuesto", text: "Algunos patrones merecen una pausa antes de aprobar un encargo. Ninguna de estas señales por sí sola indica un mal taller — pero tres o cuatro juntas forman un patrón." },
      { name: "Tres modelos de servicio — comparativa objetiva", text: "Hay tres formas habituales de encargar una impresión 3D en Barcelona, y se diferencian en aspectos estructurales que importan más que el marketing de cualquier empresa concreta." },
      { name: "Preguntas específicas según el tipo de proyecto", text: "La lista genérica anterior es un mínimo, no un techo. Según lo que estés encargando, añade preguntas específicas al proyecto." },
      { name: "Cómo respondemos nosotros a cada punto — en corto", text: "Para referencia directa, así responde nuestra operación a la lista." }
    ]
  },

  // ----- NUEVA: GUÍA DE MATERIALES -----
  {
    slug: "/guia-materiales-impresion-3d",
    topic: "materials-guide",
    altSlug: "/3d-printing-materials-guide",
    lang: "es",
    category: "material",
    metaTitle: "Guía de Materiales para Impresión 3D",
    metaDescription: "Guía práctica de selección de materiales FDM. Puntos fuertes reales, debilidades reales y usos habituales de PLA, PETG, ABS, ASA, TPU",
    h1: "Materiales para Impresión 3D — Guía Práctica de Selección",
    intro: "La causa más habitual de que una pieza 3D falle en uso es que se eligió el material equivocado. Esta guía no es una hoja de especificaciones — es una descripción práctica de en qué es realmente bueno cada material que trabajamos, en qué no lo es, y cuándo conviene tirar de otra opción. Todos los materiales listados están en nuestra rotación diaria.",
    sections: [
      {
        heading: "PLA — el material por defecto sensato para piezas sin exigencia térmica",
        body: "El PLA (ácido poliláctico) es el material FDM más fácil de imprimir y el más económico. Es dimensionalmente estable, tiene una deformación mínima, imprime limpio a alturas de capa pequeñas, y viene en más colores que cualquier otra categoría de filamento. Para modelos visuales, prototipos, piezas decorativas, cortadores de galletas y cualquier pieza de interior que no vaya a soportar esfuerzo mecánico, el PLA es la opción sensata por defecto.\n\nPuntos fuertes: barato, imprimible, dimensionalmente preciso, buen acabado estético.\n\nDebilidades: el PLA se ablanda alrededor de 55–60 °C. Una pieza de PLA olvidada en un coche aparcado en Barcelona en julio se deforma. Es también más frágil que el PETG frente a impactos secos, y se degrada lentamente bajo exposición prolongada a UV.\n\nCuándo NO usar PLA: cualquier aplicación con temperaturas superiores a 50 °C, uso exterior más allá de unas pocas semanas, o piezas que deban flexar o absorber impactos repetidos."
      },
      {
        heading: "PETG — el material funcional habitual",
        body: "El PETG (tereftalato de polietileno modificado con glicol) es lo que más habitualmente recomendamos cuando un cliente dice \"pieza funcional\". Es más duro que el PLA, más tolerante al calor (se ablanda hacia 75–80 °C), resiste razonablemente bien la humedad y el UV, e imprime sin necesidad de cámara cerrada. Para carcasas, soportes, montajes, clips de repuesto, fijaciones para exterior y piezas que necesiten resistencia mecánica moderada sin requisitos de grado industrial, el PETG es la opción práctica.\n\nPuntos fuertes: más resistente al impacto que el PLA, mejor comportamiento térmico y frente a UV, existen grados aptos para contacto alimentario, buena adhesión entre capas.\n\nDebilidades: ligeramente más propenso a hilos finos en la impresión (puede requerir algo de post-procesado para superficies limpias), menos rígido que el ABS, no apto para aplicaciones de muy alta temperatura.\n\nCuándo NO usar PETG: piezas expuestas a calor sostenido por encima de 70 °C, o aplicaciones que requieran rigidez muy alta (Nylon o PC son mejores)."
      },
      {
        heading: "ABS y ASA — calor, esfuerzo mecánico y uso exterior",
        body: "El ABS (acrilonitrilo butadieno estireno) es el plástico técnico tradicional — resistente, con tolerancia térmica en torno a 100 °C, y trabajable con herramientas comunes. El ASA (acrilonitrilo estireno acrilato) es químicamente similar pero incorpora estabilización UV real, lo que lo convierte en la opción correcta para cualquier cosa que viva al exterior durante todo el año. Ambos se imprimen mejor en cámara cerrada para controlar la deformación.\n\nPuntos fuertes: resistencia térmica hasta ~100 °C, buena resistencia mecánica, se pegan y se mecanizan fácilmente, el ASA es genuinamente estable al UV.\n\nDebilidades: propensos a deformarse sin cámara cerrada o una buena adhesión de cama, el ABS emite ligeros gases al imprimir (por eso los trabajamos en un espacio ventilado), y el acabado suele ser más rugoso que el del PLA recién salido de máquina.\n\nCuándo NO usar ABS/ASA: modelos decorativos donde el acabado superficial importa más que la resistencia, o piezas de pared fina donde la distorsión por deformación comprometería el ajuste."
      },
      {
        heading: "TPU — piezas flexibles, juntas y empuñaduras",
        body: "El TPU (poliuretano termoplástico) es un filamento tipo goma que se imprime en varias durezas Shore. Se usa para cualquier cosa que necesite flexar, amortiguar vibración o sellar contra otra superficie: fundas de móvil, juntas, patas, protectores de cables, empuñaduras, pequeñas ruedas para proyectos de robótica.\n\nPuntos fuertes: excelente flexibilidad con alta resistencia al desgarro, químicamente robusto, buena amortiguación de vibración.\n\nDebilidades: lento de imprimir (habitualmente 20–30 mm/s frente a 60+ mm/s en PLA), sensible a la humedad (hay que mantenerlo seco), y las características pequeñas (paredes finas, aristas vivas) son más difíciles de resolver limpiamente que en materiales rígidos.\n\nCuándo NO usar TPU: piezas estructurales rígidas, cualquier pieza que requiera alta tolerancia dimensional en ajustes ceñidos, o cuando el tiempo de impresión sea una restricción crítica."
      },
      {
        heading: "Nylon (PA12) y composites de fibra de carbono",
        body: "El Nylon es el polímero técnico de referencia del FDM. Alta resistencia a la tracción, excelente resistencia a la fatiga, baja fricción, y comportamiento estable en un rango amplio de temperaturas. Aplicaciones habituales: engranajes, bisagras, clips de ensamblaje, mecanismos de deslizamiento, soportes estructurales bajo carga repetida.\n\nLos grados reforzados con fibra de carbono (PLA-CF, PETG-CF, Nylon-CF) añaden refuerzo de fibra corta, lo que aumenta la rigidez y la estabilidad dimensional a costa de algo de fragilidad y de desgaste abrasivo sobre la boquilla. Son la opción correcta para soportes estructurales, chasis de drones, brazos robóticos y utillajes que deban mantener su forma bajo carga sin flexar.\n\nPuntos fuertes del Nylon: rendimiento mecánico excepcional para FDM, auto-lubricante, tolera flexiones repetidas sin fallo por fatiga. Los composites de fibra de carbono añaden rigidez y reducen la deformación.\n\nDebilidades: el Nylon es higroscópico — absorbe humedad del aire y hay que imprimirlo seco. Tanto el Nylon como los composites CF son más caros por gramo que el PLA o el PETG. Los grados con fibra requieren boquilla de acero endurecido o rubí porque desgastan las de latón en pocos kilos de impresión.\n\nCuándo NO usar Nylon o CF: para piezas sensibles al coste que el PETG podría cubrir, o para piezas donde el post-procesado (pintura, imprimación) importe más que el rendimiento mecánico."
      },
      {
        heading: "Comparativa de un vistazo",
        body: "La tabla siguiente es un ranking aproximado de los materiales que trabajamos según las propiedades que más habitualmente determinan la elección de material. Los rankings son relativos — \"baja\" para flexibilidad del TPU significa baja comparada con goma, no con PLA. El coste es relativo por gramo, a precios habituales de filamento.\n\n| Material | Resistencia térmica | Resistencia mecánica | Flexibilidad | Facilidad de impresión | Uso exterior | Coste relativo |\n|---|---|---|---|---|---|---|\n| PLA | Baja (~55 °C) | Media | Baja | Alta | Baja | Bajo |\n| PETG | Media (~75 °C) | Media-Alta | Ligera | Media-Alta | Media-Alta | Bajo-Medio |\n| ABS | Alta (~100 °C) | Alta | Baja | Media (requiere cámara) | Media | Medio |\n| ASA | Alta (~100 °C) | Alta | Baja | Media (requiere cámara) | Alta (estable UV) | Medio |\n| TPU | Media | Media (resistente al desgarro) | Muy alta | Media-Baja | Media | Medio |\n| Nylon (PA12) | Alta | Muy alta | Baja-Media (algunos grados) | Media (requiere secado) | Media | Medio-Alto |\n| PLA-CF | Baja (~55 °C) | Alta (rígido) | Muy baja | Media | Baja | Alto |\n| PETG-CF | Media (~75 °C) | Alta (rígido) | Muy baja | Media | Media-Alta | Alto |\n| Nylon-CF | Alta | Muy alta (rígido) | Baja | Media (requiere secado) | Media | Alto |\n\nSi tienes dudas sobre cuál encaja mejor con tu pieza, describe la aplicación al pedir presupuesto — cargas esperadas, rango de temperatura, interior o exterior, sensibilidad al coste — y te recomendamos un material con el razonamiento explícito."
      }
    ],
    faqs: [
      { q: "¿Qué material es mejor para una pieza que vivirá en exterior en Barcelona?", a: "El ASA es la opción por defecto correcta — es químicamente similar al ABS pero genuinamente estable al UV, por lo que mantiene su color y sus propiedades mecánicas durante años de exposición al sol. El PETG es una opción secundaria razonable para piezas que no necesiten máxima resistencia UV. El PLA no se recomienda para uso exterior más allá de unas pocas semanas." },
      { q: "¿Puedo usar PLA para una pieza funcional con carga?", a: "Para cargas ligeras en interior a temperatura ambiente, sí — el PLA es de hecho más rígido que el PETG en ficha técnica. La razón por la que solemos recomendar PETG para piezas funcionales es que el PLA es más frágil frente a impacto y tiene un punto de deformación térmica mucho más bajo. Si la pieza siempre estará en interior, sin impactos y sin calor, el PLA es una opción válida." },
      { q: "¿Qué diferencia real hay entre PLA-CF, PETG-CF y Nylon-CF?", a: "Se diferencian en el polímero base — el refuerzo de fibra corta mejora la rigidez en los tres casos, pero las fortalezas del material base se mantienen. El Nylon-CF es el más resistente y con mayor tolerancia térmica, el PETG-CF es un punto intermedio con buena resistencia química, y el PLA-CF es el más económico e imprime fácil, pero conserva la baja tolerancia térmica del PLA." },
      { q: "¿Cuánto cambia realmente el precio de una pieza según el material?", a: "En la mayoría de piezas pequeñas, el material representa quizás la mitad del coste final — la otra mitad es tiempo de máquina. Entre el PLA (el más económico) y el Nylon-CF (el más caro por gramo), el coste por gramo aproximadamente se duplica. Pero como la mayoría de piezas son pequeñas, la diferencia absoluta suele ser de pocos euros. En tiradas de piezas más grandes, la elección de material empieza a pesar más." },
      { q: "¿Trabajáis con materiales que no aparecen en esta guía?", a: "Los materiales de esta guía son nuestra rotación diaria. Podemos aprovisionar PC (policarbonato) y otros grados especiales bajo petición si la aplicación lo justifica — pregúntanos al pedir presupuesto y te confirmamos disponibilidad y plazo." },
      { q: "¿Cómo elijo entre PETG y ABS para un soporte de exterior?", a: "Para uso exterior concretamente, el ASA es una opción por defecto mejor que el ABS porque es estable al UV — el ABS estándar amarillea y termina agrietándose con sol directo. El PETG también es un material razonable para exterior en piezas que no necesiten máxima resistencia térmica y UV. Si la pieza recibirá impactos ocasionales y clima moderado, PETG. Si tiene que soportar calor sostenido y UV total durante todo el año, ASA." }
    ],
    galleryImages: pick("custom-brackets.jpg", "red-adapter.jpg", "curved-parts.jpg", "black-intake.jpg", "intake-manifold.jpg", "blue-molds.jpg"),
    related: [
      { label: "PLA — Filamento Rígido Diario", slug: "/impresion-pla-barcelona" },
      { label: "PETG — Filamento Funcional Resistente", slug: "/impresion-petg-barcelona" },
      { label: "TPU — Flexible tipo Goma", slug: "/impresion-tpu-barcelona" },
      { label: "Checklist de Preparación de Archivo", slug: "/como-preparar-archivo-impresion-3d" },
      { label: "Verificador de Archivo STL Gratis", slug: "/verificador-archivo-3d" },
      { label: "Materials Guide (EN)", slug: "/3d-printing-materials-guide" }
    ],
    schemaServiceName: "Guía de Materiales Impresión 3D",
    datePublished: "2026-08-01",
    dateModified: "2026-10-15"
  },

  // ----- NUEVA: PREPARACIÓN DE ARCHIVO -----
  {
    slug: "/como-preparar-archivo-impresion-3d",
    topic: "file-prep",
    altSlug: "/how-to-prepare-file-for-3d-printing",
    lang: "es",
    category: "use-case",
    metaTitle: "Cómo Preparar un Archivo para Impresión 3D — Guía Práctica",
    metaDescription: "Guía práctica de preparación de archivos para impresión 3D FDM. Formatos aceptados, espesor de pared, tolerancias reales, orientación, soportes",
    h1: "Cómo Preparar un Archivo para Impresión 3D",
    intro: "Tienes un modelo 3D — o la idea de uno — y quieres imprimirlo. Antes de mandarlo, dedicar diez minutos a comprobar unas cuantas cosas te ahorra tiempo en el presupuesto, evita revisiones y produce una pieza mejor. Esta guía cubre los pasos prácticos de preparación de archivo que marcan la diferencia entre una impresión limpia y otra que vuelve a la fase de diseño.",
    sections: [
      {
        heading: "Formatos aceptados — y cuál mandar",
        body: "Aceptamos los formatos 3D estándar: STL, STEP, OBJ, 3MF e IGES. Cada uno tiene sus compromisos, y cuál mandar depende de dónde salga tu modelo.\n\n• STL es el formato de malla clásico — una superficie de triángulos. Es universal, ocupa poco, y funciona con todo. Contra: pierde toda la información paramétrica; una vez exportado, son solo triángulos. Manda STL si es lo que tu software exporta o si lo exportaste manualmente.\n\n• STEP (o STP) es el formato de intercambio CAD profesional. Preserva la geometría real — planos, curvas, features — de forma que podemos medir dimensiones críticas con precisión desde el origen. Si modelas en SolidWorks, Fusion 360, Onshape o cualquier herramienta CAD profesional, exportar STEP es preferible. Ocupa un poco más pero nos deja más con lo que trabajar.\n\n• 3MF es un reemplazo moderno del STL que lleva información de color, material y unidades junto a la malla. Si tu software lo soporta, 3MF suele ser la opción más segura para una exportación limpia.\n\n• OBJ es común en flujos artísticos y de escultura (ZBrush, Blender). Preserva bien el detalle de malla pero no carga información técnica. Vale para modelos decorativos u orgánicos.\n\nSi no lo tienes claro: STEP si lo tienes, STL como opción universal. Mándalo tal cual. Lo abrimos, lo revisamos, y te avisamos antes de presupuestar si el archivo tiene alguna cuestión."
      },
      {
        heading: "Espesor mínimo de pared en FDM",
        body: "La causa más habitual de que una pieza impresa falle es tener paredes demasiado finas. El FDM imprime en líneas extruidas (habitualmente 0,4 mm de ancho desde una boquilla estándar), y las paredes necesitan tener al menos varias anchuras de línea para mantener su forma y funcionar estructuralmente.\n\nMínimos prácticos para FDM (boquilla de 0,4 mm):\n\n• Mínimo absoluto para que una pared exista: 0,8 mm (dos líneas de extrusión).\n• Mínimo para una pared estructural — que soporte carga o no se rompa al manipularla: 1,5–2,0 mm.\n• Valor por defecto cómodo para paredes de carcasa, soportes, piezas funcionales: 2,0–3,0 mm.\n• Texto vertical o features en relieve: al menos 0,8 mm de ancho y 0,4 mm de profundidad para que se lean.\n\nParedes de menos de 0,8 mm pueden directamente no imprimirse — el laminador las omite. Paredes entre 0,8 y 1,2 mm sí imprimen pero son frágiles. Si tu CAD incluye paredes sub-milimétricas (por ejemplo, capas exteriores de 0,5 mm) que funcionaban bien en inyección, hay que engrosarlas para FDM. Si no estás seguro de que tu pieza cumpla estos mínimos, lo señalamos en la revisión."
      },
      {
        heading: "Tolerancias reales y cómo diseñar para ellas",
        body: "El FDM no es un proceso de mecanizado de precisión. La precisión típica en una impresora FDM bien calibrada está en torno a ±0,2 mm en la mayoría de dimensiones — a veces más ajustada en features individuales, a veces más amplia en piezas grandes por contracción térmica.\n\nLo que esto significa en la práctica:\n\n• Los agujeros imprimen más pequeños de lo modelado, habitualmente entre 0,1 y 0,3 mm en diámetro, porque la extrusión sobresale ligeramente por dentro de las curvas. Si necesitas un agujero de Ø5 mm para un eje de Ø5 mm, modélalo a Ø5,2–5,3 mm, o planea taladrarlo después de imprimir.\n\n• Encajes a presión y snap-fits necesitan holgura. Para dos piezas que deban deslizar entre sí, deja al menos 0,2 mm de holgura por cada superficie de acoplamiento. Para un ajuste a presión de fricción, 0,1 mm puede funcionar pero está al límite de la fiabilidad.\n\n• Agujeros roscados: imprimir la rosca directamente en FDM funciona para M6 y superiores, pero el acabado superficial es rugoso. Para cualquier tamaño menor o rosca portante, solemos instalar un inserto roscado de latón termofijable (M3, M4, M5 son tamaños de stock). Modela el agujero para el inserto, no para la rosca — el resto lo hacemos nosotros.\n\n• Dimensiones totales en piezas grandes (>150 mm) pueden encoger entre 0,5 y 1,0 mm por contracción térmica, especialmente en ABS o ASA. Para una cota exterior crítica podemos compensar la escala al laminar.\n\nSi una tolerancia concreta importa — la separación entre agujeros de un montaje, una holgura crítica — indícala al mandar el archivo. Esa es la diferencia entre un presupuesto que podemos comprometer y uno que no."
      },
      {
        heading: "Voladizos, soportes y orientación de la pieza",
        body: "El FDM imprime capa a capa desde la cama hacia arriba. Cualquier parte de tu geometría que sobresalga sobre espacio no soportado necesita material de soporte impreso debajo — lo que consume filamento, alarga tiempos y deja una superficie más rugosa donde se retira.\n\nReglas prácticas:\n\n• Voladizos con más de 45° desde la vertical suelen necesitar soporte. Un voladizo de 30° es fácil, uno de 60° necesita soporte, un voladizo de 90° pleno (una repisa horizontal sobresaliendo) siempre necesita soporte.\n\n• Puentes — tramos planos que salvan la distancia entre dos apoyos — pueden imprimirse sin soporte hasta unos 20–30 mm en una impresora bien calibrada. Puentes más largos necesitan soporte por debajo.\n\n• La orientación lo cambia todo. Una pieza que parece imposible de imprimir en la orientación modelada suele ser trivial girada. Cuando revisamos tu archivo, elegimos la orientación que minimiza soportes y maximiza la resistencia de las features críticas (las piezas FDM son más resistentes a lo largo del plano de las capas, más débiles entre capas — así que una bisagra, un snap-fit o una pestaña portante debe imprimirse con la dirección de carga paralela a las capas, no perpendicular).\n\nNo necesitas diseñar para una orientación concreta — para eso está la revisión del archivo. Pero si una superficie debe tener un acabado concreto o una dirección de resistencia concreta, indícalo para que orientemos en consecuencia."
      },
      {
        heading: "Agujeros, insertos roscados y encajes a presión",
        body: "Las features mecánicas pequeñas son donde las impresiones FDM suelen defraudar más si el diseño no se ajustó al proceso. Algunas cifras prácticas:\n\n• Agujeros para tornillos autorroscantes o para madera: modélalos al diámetro del vástago (por ejemplo, Ø3 mm para un autorroscante M3). El plástico cede lo suficiente para que la rosca muerda.\n\n• Agujeros pasantes para tornillos métricos: modélalos al diámetro del tornillo + 0,3–0,5 mm de holgura. Un agujero pasante para M4 debe ser Ø4,4–4,5 mm en el modelo.\n\n• Insertos roscados (insertos termofijables de latón): los instalamos habitualmente en M3, M4 y M5. Modela el agujero según la especificación del fabricante del inserto — normalmente el diámetro exterior de la parte moleteada menos 0,1 mm. Si no estás seguro, modela Ø4,5 mm para M3, Ø5,7 mm para M4, Ø6,7 mm para M5, y lo ajustamos en la revisión.\n\n• Ejes a presión: deja de 0,1 a 0,2 mm de sub-medida en el agujero para un ajuste por fricción. Más ajustado que eso es poco fiable; más holgado, se moverá.\n\n• Bisagras vivas en TPU o PETG: 0,5–1,0 mm de espesor, al menos 5 mm de ancho, con transiciones redondeadas. Las bisagras vivas FDM funcionan pero tienen una vida a fatiga más corta que sus equivalentes inyectados.\n\nSi diseñas desde cero específicamente para FDM, estas cifras ahorran iteración. Si estás adaptando un diseño de otro proceso (inyección, CNC), en la revisión repasamos los cambios necesarios."
      },
      {
        heading: "Qué hacer si no tienes archivo",
        body: "Una parte significativa de nuestros encargos entra sin ningún archivo CAD. No es un problema. El proceso es distinto, no peor.\n\nQué necesitamos en lugar del archivo:\n\n• Una fotografía clara de la pieza u objeto — con una regla, un calibre o una moneda de un euro visible como referencia de escala. Dos o tres ángulos ayudan. Si la pieza está rota, fotografía los trozos por separado y también juntos.\n\n• Cotas clave si las conoces: altura, ancho, fondo totales, diámetros de agujeros, grosor de features críticas. Un boceto rápido con las medidas anotadas encima funciona bien.\n\n• Una descripción de qué hace la pieza: sujeta esto a aquello, tiene que flexar, va al exterior, aguanta este peso.\n\nMándalo por WhatsApp y valoramos si podemos reconstruir la geometría a partir de la referencia. Para piezas sencillas — clips, soportes, separadores, piezas de plástico de repuesto de electrodomésticos — la reconstrucción suele ser directa e incluida en el presupuesto estándar. Para geometrías más complejas puede que necesitemos una tarifa de modelado, que presupuestamos por adelantado antes de empezar.\n\nEl peor escenario es que miremos la referencia y te digamos que la reconstrucción no es viable — en cuyo caso te podemos orientar hacia alternativas (escaneo 3D, o un contratista de modelado). No aceptamos un trabajo que no podemos entregar."
      }
    ],
    faqs: [
      { q: "¿Es mejor mandar STEP o STL?", a: "STEP si lo tienes — preserva la geometría real, así podemos medir features con exactitud. STL vale como alternativa universal y funciona en todos los flujos. Ambos producen la misma pieza final si el STL se exporta con resolución suficiente." },
      { q: "¿Cuál es la feature más pequeña que se puede imprimir de forma fiable en FDM?", a: "Features menores de 0,8 mm en superficie horizontal cuesta que resuelvan limpiamente con boquilla de 0,4 mm. Las features verticales (por ejemplo, texto en una pared) pueden ir algo más pequeñas pero se hacen difíciles de leer. Para cualquier cosa crítica por debajo de 1 mm lo señalamos en la revisión y proponemos alternativas — una boquilla menor, otra orientación, o resina si la feature realmente importa." },
      { q: "¿Cómo sé si mis espesores de pared son correctos?", a: "La mayoría de herramientas CAD tienen un análisis de espesor de pared que marca zonas finas. Si no dispones de él, la regla práctica es: nada estructural por debajo de 1,5 mm, nada decorativo por debajo de 0,8 mm. Si nos mandas el archivo, esto se comprueba como parte de la revisión estándar — preferimos señalarlo a imprimir una pieza que se rompa." },
      { q: "¿Necesito añadir los soportes yo?", a: "No — nunca. Nosotros generamos los soportes y elegimos la orientación como parte del laminado. Soportes añadidos en tu CAD o por otro laminador normalmente entrarían en conflicto con nuestros propios ajustes. Manda el modelo limpio." },
      { q: "¿Podéis escalar mi archivo al imprimir si lo necesito más grande o más pequeño?", a: "Sí, y lo hacemos con frecuencia en prototipos y regalos. Di qué factor de escala o qué dimensión final quieres; te confirmamos las dimensiones resultantes antes de imprimir para que no haya sorpresas." },
      { q: "¿Qué pasa si mi archivo tiene errores — geometría no-manifold, normales invertidas?", a: "La mayoría de laminadores modernos reparan errores menores de malla de forma automática. Para problemas más serios (agujeros en la superficie, geometría auto-intersecante) lo señalamos en la revisión y, o bien lo reparamos nosotros para casos sencillos, o te lo devolvemos para corregir si la reparación cambiaría la geometría de forma significativa. En cualquier caso, lo sabrás antes de imprimir." }
    ],
    galleryImages: pick("intake-manifold.jpg", "custom-brackets.jpg", "black-intake.jpg", "curved-parts.jpg", "red-adapter.jpg", "blue-molds.jpg"),
    related: [
      { label: "Guía Completa de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Verificador de Archivo STL Gratis", slug: "/verificador-archivo-3d" },
      { label: "Diseñamos tu Pieza — Sin Archivo", slug: "/disena-tu-pieza-3d" },
      { label: "Piezas a Medida desde Archivo o Foto", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Mejor Servicio por Caso de Uso", slug: "/mejor-servicio-impresion-3d-barcelona" },
      { label: "File Prep Guide (EN)", slug: "/how-to-prepare-file-for-3d-printing" }
    ],
    schemaServiceName: "Guía de Preparación de Archivos 3D",
    datePublished: "2026-08-01",
    dateModified: "2026-10-15",
    howToSteps: [
      { name: "Formatos aceptados — y cuál mandar", text: "Aceptamos los formatos 3D estándar: STL, STEP, OBJ, 3MF e IGES. Cada uno tiene sus compromisos, y cuál mandar depende de dónde salga tu modelo." },
      { name: "Espesor mínimo de pared en FDM", text: "La causa más habitual de que una pieza impresa falle es tener paredes demasiado finas. El FDM imprime en líneas extruidas (habitualmente 0,4 mm de ancho desde una boquilla estándar), y las paredes necesitan tener al menos varias anchuras de línea para mantener su forma." },
      { name: "Tolerancias reales y cómo diseñar para ellas", text: "El FDM no es un proceso de mecanizado de precisión. La precisión típica en una impresora FDM bien calibrada está en torno a ±0,2 mm en la mayoría de dimensiones." },
      { name: "Voladizos, soportes y orientación de la pieza", text: "El FDM imprime capa a capa desde la cama hacia arriba. Cualquier parte de tu geometría que sobresalga sobre espacio no soportado necesita material de soporte impreso debajo." },
      { name: "Agujeros, insertos roscados y encajes a presión", text: "Las features mecánicas pequeñas son donde las impresiones FDM suelen defraudar más si el diseño no se ajustó al proceso." },
      { name: "Qué hacer si no tienes archivo", text: "Una parte significativa de nuestros encargos entra sin ningún archivo CAD. No es un problema. El proceso es distinto, no peor." }
    ]
  },

  // ----- NUEVA: MEJOR SERVICIO (por necesidad) -----
  {
    slug: "/mejor-servicio-impresion-3d-barcelona",
    topic: "best-service",
    altSlug: "/best-3d-printing-service-barcelona",
    lang: "es",
    category: "service",
    metaTitle: "Cómo Elegir Servicio de Impresión 3D — Guía Barcelona",
    metaDescription: "No hay un único mejor servicio de impresión 3D en Barcelona. Esta guía desglosa qué priorizar según tu caso: urgencia, pieza única, empresa o regalo.",
    h1: "Cómo Elegir el Mejor Servicio de Impresión 3D en Barcelona",
    intro: "No existe un único \"mejor\" servicio de impresión 3D — la respuesta honesta depende de qué estés imprimiendo, con qué plazo lo necesitas, y qué tiene que aguantar la pieza en uso. Quien necesita 500 tapones iguales para una producción tiene necesidades distintas de quien necesita un solo clip de repuesto para el viernes. Esta página desglosa la pregunta por caso de uso, te dice en qué fijarte para cada uno, y es honesta con los casos en los que nosotros no somos el proveedor adecuado.",
    sections: [
      {
        heading: "Mejor para piezas urgentes (para esta semana)",
        body: "Si el factor decisivo es el tiempo — una demo el lunes, una reparación que no puede esperar, una presentación a un cliente antes del fin de semana — lo que importa es:\n\n• Un plazo indicado en días laborables desde presupuesto aprobado, no un vago \"entrega rápida\".\n• Un servicio express o prioritario declarado explícitamente, y qué cuesta realmente.\n• Un canal de soporte con una persona que responde en menos de una hora en horario laboral, no un formulario que devuelve un número de ticket.\n• Disposición a decir que no cuando el plazo no es realista — un taller que se compromete a cualquier fecha es un taller que incumple algunas.\n\nEn el caso de Dimension3D concretamente: los presupuestos vuelven en menos de 1 hora en horario laboral, el plazo estándar es de 2–5 días laborables desde presupuesto aprobado, el servicio express entrega en 24–48 horas, y la producción el mismo día es posible cuando la cola lo permite. Si tu fecha no es viable, lo decimos desde el principio en lugar de comprometernos y llegar tarde."
      },
      {
        heading: "Mejor para piezas únicas y personalizadas",
        body: "Para una pieza única a medida — un soporte de repuesto, un utillaje, un proyecto personal, un clip roto que nadie vende ya — las prioridades son distintas:\n\n• Un pedido mínimo lo suficientemente bajo como para que una sola pieza pequeña sea un encargo válido.\n• Una persona dispuesta a mirar la geometría (o una fotografía, o un boceto rápido) y asesorar sobre si es imprimible y en qué material.\n• Sin obligación de que diseñes tú en CAD — o bien aceptando fotos con medidas de referencia, o bien ofreciendo modelado como línea aparte del presupuesto.\n• Disposición a explicar la elección de material y parámetros de impresión para que entiendas lo que estás pagando.\n\nEn el caso de Dimension3D concretamente: el pedido mínimo es de 10 €, no hay mínimo por pieza, cada archivo (o fotografía de referencia) se revisa manualmente antes de presupuestar, y aceptamos presupuestos a partir de foto más medidas cuando no existe archivo CAD. El material y los ajustes se explican siempre en el presupuesto para que sepas qué estás aprobando."
      },
      {
        heading: "Mejor para empresas y prototipos funcionales",
        body: "Para equipos de ingeniería, departamentos de I+D y pequeños fabricantes las prioridades vuelven a cambiar:\n\n• Un conocimiento práctico de la diferencia real entre materiales — cuándo el Nylon-CF marca la diferencia frente a cuándo el PETG haría el mismo trabajo por una fracción del precio.\n• Compromisos de tolerancia realistas respaldados por medición, no por marketing.\n• Capacidad de repetir una pieza validada bajo demanda con calidad consistente.\n• Facturación estándar con IVA y, cuando aplique, firma de NDA como práctica habitual.\n• Disposición a pasar del prototipo a la tirada corta de producción con el mismo proveedor, sin re-presupuestar desde cero.\n\nPara proyectos empresariales, nuestra página dedicada a clientes empresa entra en más detalle: ver Impresión 3D para Empresas en Barcelona. La precisión FDM típica es de ±0,2 mm en la mayoría de dimensiones; las características de mayor precisión se presupuestan individualmente. La producción en tirada corta es parte habitual de lo que hacemos."
      },
      {
        heading: "Mejor para decoración, regalos y miniaturas",
        body: "Para uso personal o de regalo — figuras, decoración a medida, artículos personalizados — los factores decisivos son otra vez distintos:\n\n• Acabados disponibles y calidad superficial (rango de alturas de capa, opciones de post-procesado).\n• Variedad de colores y si el taller tiene el material necesario para la estética que buscas.\n• Fotos reales de lo que el taller ha producido, no imágenes de banco.\n• Un catálogo hecho para artículos donde no necesitas algo totalmente a medida.\n\nPara artículos habituales — jarrones a medida, placas con nombre, placas para mascota, soportes de móvil, toppers de tarta — visita nuestro catálogo de productos. Para trabajo de figuras con detalle fino, piezas de juegos de mesa y miniaturas, la página de miniaturas explica cómo abordamos estos proyectos específicamente, incluyendo los compromisos del FDM a pequeña escala."
      },
      {
        heading: "Cómo decidir, en corto",
        body: "El marco de decisión en cinco segundos:\n\n• Urgente y funcional → prioriza un taller con servicio express explícito y revisión humana del archivo.\n• Pieza única a medida → prioriza un taller con mínimo bajo o inexistente por pieza y disposición a revisar el archivo.\n• Empresa o prototipo → prioriza conocimiento de materiales, compromisos de tolerancia, facturación con IVA y capacidad de tirada corta.\n• Regalo, decoración o personal → prioriza opciones de acabado, disponibilidad en catálogo y portfolio demostrado.\n\nPara la mayoría de estos casos, un taller local en Barcelona encaja estructuralmente. Para producciones muy grandes, trabajo de detalle ultra-fino o piezas metálicas industriales certificadas, otros tipos de proveedor encajan estructuralmente mejor — ver la sección honesta a continuación."
      },
      {
        heading: "Cuándo Dimension3D NO es la mejor opción",
        body: "Hay casos en los que honestamente la respuesta es no. Si alguno de estos describe tu proyecto, preferimos orientarte al tipo de proveedor correcto antes que aceptar un trabajo que no vamos a entregar bien.\n\n• Producciones muy grandes — cientos o miles de unidades idénticas. El FDM es un proceso por pieza en el que el coste escala con la cantidad de una forma que la inyección de plástico no. Por encima de aproximadamente 200 unidades, o cuando el coste unitario pesa más que la inversión en molde, un taller especializado en inyección de plástico (o una planta de producción dedicada con capacidad de máquinas en paralelo) produce las piezas de forma más económica. Para trabajos de este rango, busca un proveedor que te presupueste con proceso de inyección, o una granja FDM grande con decenas de máquinas trabajando el mismo encargo en paralelo.\n\n• Joyería, detalle superficial ultra-fino, trabajo dental o figuras de alta precisión. El FDM deja líneas de capa visibles incluso a la altura de capa más fina (unos 0,08 mm en una impresora bien calibrada), lo cual está bien para piezas funcionales y para la mayoría de piezas decorativas, pero se nota en trabajo a escala de joyería. Para piezas donde el detalle superficial por debajo de la resolución de capa importa, busca un taller que trabaje con resina SLA o DLP — el proceso produce fundamentalmente superficies más lisas a esa escala.\n\n• Piezas metálicas industriales certificadas. No ofrecemos impresión 3D en metal. Si tu proyecto requiere piezas metálicas estructurales con certificaciones o estándares de material específicos — aeroespacial, médico, componentes estructurales críticos — busca un taller especializado en fabricación aditiva metálica (SLM, DMLS, o binder jetting) con las certificaciones relevantes para tu sector.\n\nEn cualquiera de estos casos, cuéntanos qué estás construyendo y te sugerimos el tipo de proveedor que encaja — aunque no seamos nosotros."
      }
    ],
    faqs: [
      { q: "¿Cuál es el mejor servicio de impresión 3D en Barcelona?", a: "No hay una única respuesta — depende del caso de uso. Para piezas funcionales urgentes, un taller local con capacidad express y revisión humana del archivo. Para piezas únicas a medida, un taller con mínimo de pedido bajo. Para trabajo de empresa y prototipos, un taller con criterio de materiales y compromisos de tolerancia. Para decoración y regalos, un taller con portfolio y opciones de acabado. Las secciones anteriores explican cómo decidir por necesidad." },
      { q: "¿Cómo comparo servicios de impresión 3D de forma objetiva?", a: "Fíjate en aspectos estructurales antes que en marketing: pedido mínimo declarado en cifras, plazo indicado en días laborables desde presupuesto aprobado, si una persona revisa el archivo antes de imprimir, idioma de atención, disponibilidad de recogida presencial, y si el taller puede presupuestar a partir de fotografías cuando no hay CAD. Nuestra guía del comprador complementaria entra en más detalle." },
      { q: "¿Cuál es el servicio de impresión 3D más rápido en Barcelona?", a: "Para urgencia real, busca un taller con servicio express declarado (24–48 horas) en lugar de un vago \"rápido\", y con un canal de soporte que responda en menos de una hora. Nosotros ofrecemos express en 24–48 horas y producción el mismo día cuando la cola lo permite." },
      { q: "¿Qué servicio es mejor para una pieza única a medida?", a: "Un taller local con mínimo por pieza bajo o inexistente, dispuesto a aceptar una fotografía o un boceto cuando no hay archivo CAD, y dispuesto a revisar la geometría manualmente. Mínimos de pedido en el rango 10–50 € son habituales en talleres locales. El nuestro es de 10 € sin mínimo por pieza." },
      { q: "¿Es Dimension3D siempre la opción más barata?", a: "No. El precio unitario más bajo para producciones grandes suele ser de un proveedor de inyección de plástico o de una granja FDM grande. Para cantidades pequeñas, piezas únicas y prototipos funcionales, la diferencia de precio entre talleres locales suele ser pequeña — la diferencia relevante es la velocidad de respuesta, la revisión humana del archivo y la calidad de la comunicación. Si el precio es lo que más pesa en tu proyecto, compara siempre presupuestos." },
      { q: "¿Cuándo no debería usar impresión 3D FDM en absoluto?", a: "Para piezas que requieren detalle superficial por debajo de la resolución de las líneas de capa (unos 0,08 mm en una impresora FDM bien calibrada) — joyería fina, trabajo dental, figuras ultra-detalladas — la impresión en resina SLA o DLP es el proceso fundamentalmente adecuado. Para piezas metálicas estructurales con certificaciones específicas, la fabricación aditiva metálica (SLM, DMLS) es el proceso adecuado. El FDM es la herramienta correcta para una amplia gama de aplicaciones, pero no para todas." }
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "custom-brackets.jpg", "intake-manifold.jpg", "purple-figures.jpg", "green-chameleon.jpg", "eiffel-tower.jpg"),
    related: [
      { label: "Cómo Elegir un Servicio", slug: "/como-elegir-servicio-impresion-3d-barcelona" },
      { label: "Guía de Selección de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Preparar tu Archivo", slug: "/como-preparar-archivo-impresion-3d" },
      { label: "Impresión 3D en Barcelona", slug: "/" },
      { label: "Desglose Transparente del Precio", slug: "/precio-impresion-3d-barcelona" },
      { label: "Best Service (EN)", slug: "/best-3d-printing-service-barcelona" }
    ],
    schemaServiceName: "Mejor Servicio de Impresión 3D Barcelona",
    datePublished: "2026-08-01",
    dateModified: "2026-10-15"
  },

  // ----- NUEVA: INGRESOS PARA MAKERS (cómo ganar dinero con una impresora 3D) -----
  {
    slug: "/como-ganar-dinero-con-impresora-3d",
    topic: "maker-income",
    altSlug: "/how-to-make-money-with-a-3d-printer",
    lang: "es",
    category: "use-case",
    audience: "maker",
    metaTitle: "Cómo Ganar Dinero con una Impresora 3D — 6 Rutas Reales",
    metaDescription: "Guía práctica para obtener ingresos con una impresora 3D que ya tienes. Rutas reales — venta local, marketplaces, archivos de diseño, encargos para negocios.",
    h1: "Cómo Ganar Dinero con una Impresora 3D",
    intro: "Sí, puedes ganar dinero con una impresora 3D — las seis rutas más fiables son: (1) venta local directa, (2) unirte a una red de impresión como la de Dimension3D (gratis, sin comisión, sin exclusividad), (3) marketplaces como Wallapop o Etsy, (4) vender archivos de diseño en Cults3D o MakerWorld, (5) encargos de prototipado para negocios locales y (6) recambios y reparaciones. La primera venta llega más rápido con venta local o a través de una red; los archivos de diseño son los más pasivos pero tardan más en escalar. Esta guía repasa cada canal con sus contras reales — sin promesas de ingresos, solo lo que pasa en la práctica.",
    sections: [
      {
        heading: "Vender impresiones acabadas en local — la primera venta más rápida",
        body: "Vender impresiones físicas a gente de tu propia ciudad es el camino más corto entre la impresora y el primer ingreso. Te ahorras envíos, comisiones de plataforma y el cliente ve el objeto en la mano — no hay devoluciones porque la foto no coincidía con la realidad.\n\nQué funciona en local, en la práctica: regalos personalizados (placas con nombre, llaveros, toppers de tarta), utilitarios (soportes de móvil, cable managers, organizadores pequeños, macetas), recambios y pomos que los vecinos te preguntan cuando ya saben lo que haces, y decoración modesta (jarrones pequeños, decoraciones de temporada, miniaturas para grupos de hobby locales). El volumen es pequeño pero la fricción es casi nula.\n\nEsfuerzo realista: bajo o medio. Hace falta un modo de que te encuentren — un estado de WhatsApp, un par de posts en Instagram, un grupo local de Facebook, una mención en el chat del barrio. Tiempo hasta el primer ingreso: rápido, a menudo una o dos semanas después de contarlo. Contra principal: la demanda local se satura. En un círculo pequeño, una docena de ventas al mes ya es mucho, y llegarás a un techo enseguida sin ampliar tu alcance o tu catálogo."
      },
      {
        heading: "Unirte a una red de impresión — gratis, sin comisión, los encargos de tu zona van para ti",
        body: "Antes de los canales individuales que vienen abajo, el camino más corto a encargos reales que no tuviste que marketear es unirte a una red local de impresión. La red de makers de Dimension3D está montada exactamente para esto, y la oferta se mantiene deliberadamente simple:\n\n• Unirse es gratis — sin cuota de alta, sin coste de solicitud, sin tarjeta de prueba.\n• Sin comisión sobre tu trabajo — cada euro que el cliente te paga se queda contigo.\n• Sin cláusula de exclusividad — sigues vendiendo en Wallapop, Etsy, Cults3D o cualquier otro sitio donde ya ganas.\n• Las condiciones se acuerdan individualmente con cada maker antes de empezar cualquier trabajo, así que nada se impone de forma genérica.\n• Los makers producen localmente bajo la marca Dimension3D cuando llegan encargos a su zona, así que no estás limitado a una única ciudad.\n\nCómo funciona el modelo en la práctica: otra persona lleva el pipeline de marketing — SEO, listados, anuncios, marca, relación con los clientes — y dirige encargos reales que llegan a makers en el área local del cliente. Tú conservas tu impresora, conservas tus precios, y los encargos que aceptas corren bajo la marca Dimension3D. Todo lo que la red te envía es adicional a lo que ya haces, porque no hay cláusula de exclusividad.\n\nLa red se expande ciudad a ciudad. El número real de solicitudes que verás depende de la demanda real en tu ciudad concreta — un maker en un mercado donde la marca ya está asentada verá más solicitudes que uno donde la red acaba de arrancar. No hay números garantizados ni volúmenes mensuales prometidos. Lo que sí está garantizado es que unirse no cuesta nada y no hay permanencia, así que si aún no llegan encargos en tu ciudad, no has perdido nada.\n\nSolicita en [/makers](/makers). Mira [/maker-guide](/maker-guide) para el flujo completo — cómo llegan los encargos, cómo se presupuesta y cómo el pago va directamente del cliente al maker sin plataforma en medio."
      },
      {
        heading: "Marketplaces (Etsy, Wallapop, eBay) — alcance a cambio de comisiones y competencia",
        body: "Los marketplaces permiten que un desconocido a medio país de distancia encuentre tu anuncio un martes por la tarde. Ese alcance es genuinamente valioso — y viene con dos costes.\n\nPrimero, comisiones. Etsy cobra una tarifa de publicación más un porcentaje por venta más el procesado del pago. eBay tiene una estructura parecida en efecto. Wallapop es gratis para venta casual pero cobra en las ventas con envío integrado y empuja promoción de pago. Cuenta con un 8–15% de la parte de arriba en cualquier plataforma que te haga descubrimiento de clientes.\n\nSegundo, competencia. Cualquier producto que puedas listar, cientos de vendedores ya lo listaron — a menudo más barato, con mejor fotografía y a veces enviado desde un país con menores costes de mano de obra y material. Ganar por precio es una carrera al abismo que no vale la pena empezar. Ganar por diferenciación (un nicho, mejores fotos, una opción de personalización específica, envío más rápido a un mercado local) es la única estrategia duradera.\n\nEsfuerzo realista: medio o alto, continuo. Los anuncios necesitan actualización, las fotos necesitan mejora, los mensajes hay que contestarlos rápido, las reseñas hay que protegerlas. Tiempo hasta el primer ingreso: días o semanas tras publicar y ajustar el precio. Contra principal: sin un nicho concreto o un diferenciador real, la mayoría de anuncios se ahogan."
      },
      {
        heading: "Vender archivos de diseño (Cults3D, MakerWorld, otros) — ingreso pasivo con rampa lenta",
        body: "Si te manejas en una herramienta de modelado 3D, puedes vender el archivo en lugar de la impresión. Un solo modelo bien diseñado subido a Cults3D o MakerWorld puede vender durante años sin que hagas nada después de subirlo. Es lo más cercano que tiene la impresión 3D a un ingreso genuinamente pasivo.\n\nLa rampa, sin embargo, es lenta. Un archivo nuevo sin reseñas y sin marca detrás normalmente no vende nada los primeros meses. Lo que funciona: publicar un flujo constante de archivos (decenas, no dos o tres), construir seguidores y apuntar a un nicho concreto (los fans de una franquicia de videojuegos, un hobby específico) o producir archivos con un estilo distintivo que la gente aprenda a reconocer.\n\nEsfuerzo realista: alto al principio (aprender a modelar, iterar en calidad, producir suficientes archivos para importar), bajo después una vez que el catálogo está montado. Tiempo hasta un ingreso significativo: meses, a veces más. Contra principal: es un negocio de portafolio — los ingresos iniciales son prácticamente cero, y rendirte antes del mes seis significa retirarte justo antes de que empiece la parte compuesta."
      },
      {
        heading: "Prototipado y pequeñas tiradas para negocios locales",
        body: "Cada barrio tiene pequeños negocios que ocasionalmente necesitan una pieza física — un arquitecto que quiere una maqueta a escala para presentar a un cliente, un dueño de bar que necesita marcadores de bebida a medida, un taller que rompió un soporte propietario, una clínica dental que quiere objetos de mesa con su marca. Estos encargos pagan mejor por pieza que las ventas al consumidor porque el cliente está comprando una solución, no un capricho.\n\nCómo llegar a ellos: preséntate como servicio local de impresión 3D a los negocios en un radio determinado, deja una tarjeta simple, date de alta en Google Business y sé rápido en responder. El primer encargo es el difícil; los repetidos ocurren sin que hagas nada una vez has entregado bien.\n\nEsfuerzo realista: medio — unas tardes de contacto inicial y luego trabajo reactivo. Tiempo hasta el primer ingreso: semanas. Contra principal: impredecible — un buen mes pueden ser cuatro encargos, uno flojo cero, y hacen falta entre 6 y 12 meses de presencia constante antes de que los negocios locales piensen en ti primero para este tipo de trabajo."
      },
      {
        heading: "Recambios y reparaciones — trabajo de alto valor y confianza",
        body: "Uno de los usos con mayor margen para una impresora en casa es sustituir piezas de plástico rotas de cosas que la gente ya tiene — un clip específico del cajetín de detergente de una lavadora, un soporte de balda de nevera, un adaptador de aspiradora, un conector de mueble descatalogado. El cliente está comparando tu presupuesto (algunas decenas de euros) contra la alternativa de comprar un electrodoméstico nuevo (cientos), así que el precio es generoso frente a los artículos de consumo.\n\nLa pega es que la mayoría de encargos requieren o modelar desde una foto o medir con cuidado la pieza rota original. Esa habilidad se practica. Las piezas simples y simétricas son rápidas; las geometrías complejas son legítimamente difíciles y a veces no compensa presupuestarlas.\n\nEsfuerzo realista: medio por encargo, pero cada reparación exitosa produce un cliente encantado que se lo cuenta a otros. El boca a boca en trabajo de recambio compone especialmente bien. Tiempo hasta el primer ingreso: rápido cuando empiezas a contarlo a los vecinos y a publicar en grupos locales. Contra principal: la carga es a rachas (cinco encargos una semana, ninguno la siguiente) y la habilidad de modelado tiene una curva real — espera anotar como aprendizaje un par de encargos tempranos."
      }
    ],
    faqs: [
      { q: "¿Cómo me uno a la red de makers de Dimension3D?", a: "Solicítalo en [/makers](/makers) — el formulario lleva unos dos minutos. Leemos cada solicitud personalmente, normalmente en 24 horas, y respondemos por WhatsApp o email. Unirse es gratis: sin cuota de alta, sin comisión sobre tu trabajo y sin cláusula de exclusividad, así que sigues vendiendo donde ya vendas. Las condiciones se acuerdan individualmente con cada maker antes de empezar cualquier trabajo. Tu primer mes es gratis y a partir de ahí la tarifa es un importe mensual fijo acordado contigo antes de empezar — habitualmente desde 2 €/mes. Mira [/maker-guide](/maker-guide) para el recorrido completo." },
      { q: "¿Cómo monetizo una impresora 3D si no he vendido nada antes?", a: "El camino más corto: cuéntaselo a la gente que ya conoces, publica una foto clara de un proyecto en tu círculo (Instagram, estado de WhatsApp, un grupo local de Facebook o Nextdoor), ofrece algo pequeño y concreto en lugar de un genérico \"puedo imprimir cualquier cosa\", y prepárate para responder rápido cuando llegue el primer mensaje. Los primeros clientes casi siempre vienen de alguien a una o dos conexiones de distancia, no de un desconocido encontrando tu anuncio." },
      { q: "¿Cuánto dinero se puede ganar realistamente con una impresora 3D en casa?", a: "Varía enormemente — desde nada (si la impresora está parada) a un ingreso modesto (unos cientos de euros al mes a tiempo parcial) hasta un ingreso principal real (con varias impresoras y dedicación completa). Lo que más importa es el tiempo dedicado y en qué canales te apoyas. Los canales pasivos como los archivos pagan muy lentamente. Los activos como la venta local pagan más rápido pero topan más bajo. Las redes pagan según la demanda en tu ciudad." },
      { q: "¿Merece la pena vender en Etsy o Wallapop concretamente impresiones 3D?", a: "Merece la pena probarlo, pero cuenta con que las comisiones se lleven un 10–15% y con que los primeros meses sean silenciosos. Las dos plataformas premian a vendedores con un nicho concreto o un estilo distintivo. Los anuncios genéricos (un soporte de móvil, un llavero con nombre) compiten con miles casi idénticos y no suelen moverse." },
      { q: "¿Cuánto tarda en ser rentable vender productos impresos en 3D?", a: "Para venta directa local, los primeros ingresos pueden aparecer en días pero el total suele quedar pequeño sin expandir el alcance activamente. Para marketplaces, cuenta con 1–3 meses de ajustar anuncios antes de encargos consistentes. Para archivos de diseño, los ingresos significativos suelen llegar a partir del sexto mes. Para encargos vía red, depende de la demanda en tu ciudad concreta más que del tiempo invertido." },
      { q: "¿Tengo que darme de alta como autónomo para vender impresiones 3D legalmente?", a: "Eso depende enteramente de las reglas fiscales de tu localidad y de cuánto ganes, no de la impresión 3D en sí. En España, los ingresos ocasionales por debajo de ciertos umbrales no requieren darse de alta como autónomo, pero la actividad regular sí. Las reglas cambian en cada país. Si vas más allá de lo casual, consulta a un asesor fiscal local — no somos profesionales fiscales y esto no es asesoramiento legal." },
      { q: "¿Qué canal de ingresos tiene la mejor relación esfuerzo/dinero?", a: "Ninguno domina a los demás — por eso esta guía cubre seis. En la práctica, la mayoría de los makers que ingresan de forma constante combinan dos o tres canales: por ejemplo, clientes locales recurrentes más una red de impresión más un pequeño catálogo de archivos. Así los canales lentos van componiendo en segundo plano mientras los activos pagan las facturas." }
    ],
    galleryImages: pick("custom-brackets.jpg", "ferrari-key-holder.jpg", "purple-figures.jpg", "halloween-set.jpg", "cookie-cutters.jpg", "red-adapter.jpg"),
    related: [
      { label: "Economía Real de un Negocio de Impresión", slug: "/es-rentable-negocio-impresion-3d" },
      { label: "Cómo Conseguir tus Primeros Clientes", slug: "/como-conseguir-clientes-impresion-3d" },
      { label: "Únete a la Red Local de Makers", slug: "/makers" },
      { label: "Cómo Funciona la Red", slug: "/maker-guide" },
      { label: "English Guide", slug: "/how-to-make-money-with-a-3d-printer" },
      { label: "Deutsche Fassung", slug: "/mit-3d-drucker-geld-verdienen" }
    ],
    schemaServiceName: "Cómo Ganar Dinero con Impresora 3D — Guía",
    datePublished: "2026-08-02",
    dateModified: "2026-10-15",
    howToSteps: [
      { name: "Vender impresiones acabadas en local — la primera venta más rápida", text: "Vender impresiones físicas a gente de tu propia ciudad es el camino más corto entre la impresora y el primer ingreso. Te ahorras envíos, comisiones de plataforma y el cliente ve el objeto en la mano." },
      { name: "Unirte a una red de impresión — gratis, sin comisión, los encargos de tu zona van para ti", text: "Antes de los canales individuales que vienen abajo, el camino más corto a encargos reales que no tuviste que marketear es unirte a una red local de impresión." },
      { name: "Marketplaces (Etsy, Wallapop, eBay) — alcance a cambio de comisiones y competencia", text: "Los marketplaces permiten que un desconocido a medio país de distancia encuentre tu anuncio un martes por la tarde. Ese alcance es genuinamente valioso — y viene con dos costes: comisiones y competencia." },
      { name: "Vender archivos de diseño (Cults3D, MakerWorld, otros) — ingreso pasivo con rampa lenta", text: "Si te manejas en una herramienta de modelado 3D, puedes vender el archivo en lugar de la impresión. Un solo modelo bien diseñado subido a Cults3D o MakerWorld puede vender durante años sin que hagas nada después de subirlo." },
      { name: "Prototipado y pequeñas tiradas para negocios locales", text: "Cada barrio tiene pequeños negocios que ocasionalmente necesitan una pieza física. Estos encargos pagan mejor por pieza que las ventas al consumidor porque el cliente está comprando una solución, no un capricho." },
      { name: "Recambios y reparaciones — trabajo de alto valor y confianza", text: "Uno de los usos con mayor margen para una impresora en casa es sustituir piezas de plástico rotas de cosas que la gente ya tiene." }
    ]
  },

  // ----- NUEVA: RENTABILIDAD PARA MAKERS (¿es rentable un negocio de impresión 3D?) -----
  {
    slug: "/es-rentable-negocio-impresion-3d",
    topic: "maker-profitability",
    altSlug: "/is-3d-printing-business-profitable",
    lang: "es",
    category: "use-case",
    audience: "maker",
    metaTitle: "¿Es Rentable un Negocio de Impresión 3D? Costes Reales",
    metaDescription: "La economía honesta de un negocio de impresión 3D: coste del filamento por gramo, electricidad por hora de impresión, amortización de la impresora",
    h1: "¿Es Rentable un Negocio de Impresión 3D? Los Números Reales",
    intro: "Si la impresión 3D es rentable depende de si el precio que cobras cubre todos los inputs que entran en una pieza — no solo el plástico. Esta página descompone el coste de una impresión FDM en sus componentes reales, da rangos realistas para cada uno (con el razonamiento) y recorre un ejemplo completo para que puedas construir precios defendibles para tu propio trabajo. También cubre el input que la mayoría de desgloses ignora — la captación de clientes — y cómo una red local gratuita como la de Dimension3D cambia las cuentas cuando los pedidos vienen a ti en lugar de perseguirlos tú.",
    sections: [
      {
        heading: "Coste del filamento — por kilo y por gramo",
        body: "El filamento es el input más visible y el más fácil de precificar correctamente si lo abordas en gramos en lugar de bobinas.\n\nPrecios típicos de bobina al por menor en Europa en el mercado actual: el PLA está en aproximadamente 18–28 €/kg para colores básicos de marcas de gama media, 30–45 €/kg para sedas, mármoles y acabados especiales. El PETG suele situarse en 20–30 €/kg. El ABS/ASA ronda los 22–35 €/kg. El TPU es notablemente más caro, 35–55 €/kg. El nylon y los grados reforzados con fibra de carbono empiezan en unos 45 €/kg y suben.\n\nPasado a gramos, el precio por gramo queda: PLA en unos 0,02–0,045 €/g, PETG en 0,02–0,03, TPU en 0,035–0,055, Nylon-CF en 0,06+. El slicer estima los gramos por pieza directamente — el número que debes usar para presupuestar es el estimado del slicer más un pequeño buffer (5–10%) por purga, primer y pequeñas mermas inevitables.\n\nUna pieza pequeña del día a día suele pesar 15–60 g. Una pieza funcional mediana pesa 80–200 g. Una pieza decorativa grande o un casco puede pesar entre 300 g y bastante más de un kilo. Es decir: el coste de material puro en la mayoría de impresiones a escala de consumo está en el rango de unos céntimos a unos pocos euros — pequeño respecto al precio final que debería pagar el cliente."
      },
      {
        heading: "Captación de clientes — la línea que la mayoría de desgloses olvida, y cómo una red la elimina",
        body: "Todos los inputs anteriores dan por hecho que ya encuentras tus propios clientes. Ese esfuerzo es coste real: meses de configurar Google Business antes de que compongan las reseñas, horas semanales respondiendo consultas en Wallapop que no convierten, tarifas de Etsy, quebraderos de envío transfronterizo, todo el ensayo y error de la fotografía y precios en los primeros meses. La mayoría de desgloses de coste de impresión 3D dejan la captación de clientes fuera porque no es imputable a una pieza concreta — pero es el mayor coste fijo de tener una actividad de maker, y la razón por la que muchos makers técnicamente competentes nunca acaban siendo rentables.\n\nLa red de makers de Dimension3D está diseñada para eliminar esa línea entera. La oferta es deliberadamente simple:\n\n• Unirse es gratis — sin cuota de alta, sin coste de solicitud.\n• Sin comisión sobre tu trabajo — cada euro que el cliente te paga se queda contigo.\n• Sin exclusividad — sigues vendiendo donde ya vendas en paralelo.\n• Las condiciones se acuerdan individualmente con cada maker antes de empezar cualquier trabajo, así que nada se impone de forma genérica.\n• Los makers producen localmente bajo la marca Dimension3D cuando llegan encargos a su zona.\n\nCómo funciona el modelo en la práctica: otra persona lleva el pipeline de marketing — SEO, listados, anuncios, marca — y dirige encargos reales de clientes a makers en el área local de cada pedido. Tú conservas tu impresora, conservas tus precios, y cada encargo que aceptas corre encima de lo que ya haces.\n\nLa red se expande ciudad a ciudad, así que el número de solicitudes que verás depende de la demanda real en tu ciudad concreta — no hay volúmenes garantizados ni números mensuales prometidos. Lo que sí está garantizado es que unirse no cuesta nada y no hay permanencia. Si la red produce encargos en tu ciudad, tu coste efectivo de captación de esos encargos es cero, y las cuentas de construcción de precio de las secciones siguientes corren sobre una base de coste fijo genuinamente distinta.\n\nSolicita en [/makers](/makers). Mira [/maker-guide](/maker-guide) para el flujo completo — cómo llegan los encargos, cómo se presupuesta y cómo el pago va directamente del cliente al maker."
      },
      {
        heading: "Electricidad — el coste por hora de impresión",
        body: "Una impresora FDM en marcha consume energía casi todo para la cama y el hotend, con un pequeño consumo constante de motores y electrónica. El consumo medio de una impresora FDM de escritorio típica (un solo hotend, cama a 60 °C) está en torno a 80–150 W. Impresoras cerradas con cámara caliente o doble hotend consumen más, a veces 200–300 W.\n\nCon un precio minorista de la electricidad en Europa en un rango normal de 0,15–0,30 €/kWh, esto se traduce en aproximadamente 0,015–0,045 €/hora de impresión en una máquina estándar, es decir, unos céntimos por hora. Una impresión de 10 horas en ese rango cuesta 0,15–0,45 € en electricidad. Es genuinamente bajo — la electricidad rara vez es el coste que decide si un encargo es rentable.\n\nAun así, explicítalo. Cobrar solo por plástico deja un pequeño margen sin cubrir de forma consistente, y a lo largo de decenas de impresiones al mes suma. La forma de integrarlo es incluir una tarifa por hora de máquina (mira amortización más abajo) que combina electricidad y amortización en un solo número."
      },
      {
        heading: "Amortización de la impresora — repartir el coste de la máquina entre horas de impresión",
        body: "La impresora tiene una vida útil finita. En lugar de tratar la compra como una suma fija que ya recuperaste o no, precifícala por hora de uso — igual que hace cualquier negocio basado en equipamiento.\n\nUna suposición razonable para una impresora FDM de consumo de gama media comprada por 400–800 €: cuenta con una vida útil del orden de 2.000–4.000 horas de impresión antes de que componentes importantes (hotend, cama, extrusor) requieran sustitución o la máquina en sí requiera mantenimiento significativo. La vida útil real varía enormemente según marca, cuidados y ritmo de uso — algunas máquinas duran mucho más, otras mueren antes — pero suponer un valor de ese rango para planificar es razonable.\n\nDividir 400–800 € entre 2.000–4.000 horas da un coste amortizado de máquina de aproximadamente 0,10–0,40 €/hora. Combinado con la electricidad (unos céntimos por hora), una tarifa de máquina defendible queda en torno a 0,15–0,50 €/hora según tu impresora y tus supuestos. Para una impresión de 10 horas, eso son 1,50–5,00 € atribuibles a la máquina en sí — pequeño comparado con tu tiempo, pero no cero y merece incluirse."
      },
      {
        heading: "Tasa de fallos, packaging, envío — los costes ocultos que los nuevos vendedores olvidan",
        body: "Las impresiones fallidas son coste real. Una impresora bien calibrada usando materiales conocidos falla quizá un 5–10% en operación doméstica normal, más en geometrías inusuales o materiales nuevos, menos en piezas planas simples que imprimes a menudo. Cada impresión fallida consumió material, electricidad y tiempo de máquina que ahora tienes que recuperar con las buenas. Añade aproximadamente un 10% a tu coste por pieza como buffer de fallos — más si trabajas con un material difícil o una geometría por primera vez.\n\nEl packaging importa más de lo que la mayoría de vendedores nuevos estima. Una bolsa acolchada o una caja pequeña, plástico de burbujas, una etiqueta impresa — cuenta entre 0,50 y 2,00 € por envío según el tamaño de la pieza. Escatimar en packaging y la primera pieza que llegue rota costará más en devoluciones y reseñas que el packaging habría costado para cien pedidos.\n\nEl envío o lo paga el cliente (transparente, sin ambigüedad) o lo incluyes en tu precio (más simple para el cliente, pero sé honesto contigo mismo sobre el coste real — 4–8 € para un paquete pequeño con seguimiento a nivel nacional en la mayor parte de Europa, más para cajas grandes y destinos internacionales). El envío mal costeado es la forma más común en la que los pequeños vendedores pierden dinero sin darse cuenta."
      },
      {
        heading: "Ejemplo real — construir un precio a partir de los inputs",
        body: "Toma una pieza concreta: un soporte a medida de tamaño medio, 120 g de PETG, 8 horas de impresión, envío nacional dentro de España en una caja pequeña acolchada.\n\n• Material: 120 g × 0,025 €/g = 3,00 € (PETG a precio medio), más 10% de buffer de mermas = 3,30 €.\n• Tarifa de máquina: 8 horas × 0,30 €/hora = 2,40 € (amortización de impresora gama media más electricidad).\n• Buffer de fallos: 10% del coste de material + máquina = 0,57 €.\n• Packaging + etiquetas: 1,20 €.\n• Envío: 5,50 € por un paquete pequeño nacional con seguimiento.\n• Coste directo hasta aquí: 12,97 €.\n\nEn este punto has cubierto cada input físico y no has perdido nada — pero te has pagado a ti mismo cero. Añade mano de obra: aunque sean 30 minutos de tiempo activo (laminar, preparar, post-procesar, empaquetar, comunicar con el cliente) a unos modestos 15 €/hora, son 7,50 €. Coste directo incluyendo tu tiempo: 20,47 €.\n\nAhora añade margen. Un servicio comercial de impresión 3D típicamente aplica un margen del 40–100% sobre el coste directo, según complejidad, urgencia y cuán diferenciada sea la oferta. Para esta pieza con un margen medio del 60%, el precio final queda en unos 33 €. En el extremo bajo (un vendedor amateur cubriendo mínimos), 25 € puede ser defendible. En el extremo alto para un encargo urgente con tolerancias ajustadas, 45 € no es descabellado.\n\nEl punto no es que 33 € sea el número correcto para todo soporte. El punto es que un precio construido a partir de inputs más mano de obra más margen es defendible — puedes explicar cada componente al cliente que pregunte. Un precio sacado del aire no."
      },
      {
        heading: "Por qué las piezas muy pequeñas y baratas no suelen ser rentables — y los mínimos de pedido",
        body: "Una vez interiorizado el desglose de costes, un tipo específico de encargo se vuelve claramente problemático: la petición muy pequeña y muy barata. Una impresión de 5 gramos que dura 20 minutos cuesta menos de un euro en material y tiempo de máquina, pero los costes fijos — mano de obra para comunicarte con el cliente, packaging, envío, procesado de pago — no encogen proporcionalmente. Sigues teniendo que laminar, escribir al cliente, empaquetar y enviar. En una impresión de 5 € esos costes fijos consumen la mayor parte del precio. En una impresión de 30 € son un pie de página.\n\nPor eso casi toda operación comercial de impresión 3D tiene un mínimo de pedido, normalmente entre 10 y 30 € según el modelo de negocio. No es codicia — es aritmética. Por debajo del mínimo, los encargos pierden dinero cuando los costes fijos se incluyen honestamente.\n\nComo maker, ponte tu propio mínimo desde el principio. Si una impresión de 5 € te lleva 15 minutos de trabajo activo y consume packaging y envío, estás perdiendo dinero y construyendo la costumbre de infravalorar tu tiempo. Un mínimo publicado (sea 10, 15 o 20 €) filtra las peticiones que nunca iban a valer la pena y te deja sitio para atender a los clientes que sí valoran el trabajo."
      }
    ],
    faqs: [
      { q: "¿Cómo me uno a la red de makers de Dimension3D?", a: "Solicítalo en [/makers](/makers) — el formulario lleva unos dos minutos. Leemos cada solicitud personalmente, normalmente en 24 horas, y respondemos por WhatsApp o email. Unirse es gratis: sin cuota de alta, sin comisión sobre tu trabajo y sin cláusula de exclusividad, así que sigues vendiendo donde ya vendas. Las condiciones se acuerdan individualmente con cada maker antes de empezar cualquier trabajo. Tu primer mes es gratis y a partir de ahí la tarifa es un importe mensual fijo acordado contigo antes de empezar — habitualmente desde 2 €/mes. Mira [/maker-guide](/maker-guide) para el recorrido completo." },
      { q: "¿Es rentable en la práctica un negocio de impresión 3D?", a: "Puede serlo, pero no automáticamente — la rentabilidad depende enteramente de si el precio cubre material, tiempo de máquina, tasa de fallos, packaging, envío y mano de obra, y aún deja margen. Los negocios que precifican solo por plástico rozan el equilibrio en el mejor caso. Los que construyen un precio defendible a partir de los inputs anteriores ganan margen consistentemente, especialmente en trabajo funcional y de recambio donde el cliente compara contra el coste de un producto de sustitución." },
      { q: "¿Cuánto cuesta realmente hacer funcionar una impresora 3D por hora?", a: "Para una impresora FDM de consumo típica, la electricidad sola cuesta unos céntimos por hora (0,015–0,045 €/hora al precio minorista europeo y con consumos de 80–150 W). Una vez incorporas la amortización de la impresora (repartiendo el coste de compra entre 2.000–4.000 horas útiles), una tarifa por hora de máquina defendible queda en torno a 0,15–0,50 €. Los consumibles (boquillas, tubos PTFE, recambios ocasionales) añaden un pequeño coste adicional continuo." },
      { q: "¿Qué margen debería cobrar sobre una impresión 3D?", a: "Los servicios comerciales de impresión 3D suelen añadir un margen del 40–100% sobre el coste directo (material + tiempo de máquina + buffer de fallos + packaging + envío + mano de obra). En el extremo bajo eres un vendedor amateur apenas cubriéndote; en el alto precificas trabajo complejo, urgente o diferenciado. Por debajo del 40% de margen, eventos poco frecuentes (una devolución, un lote fallido, un mes flojo) se comen el beneficio entero." },
      { q: "¿Por qué los servicios de impresión 3D tienen mínimos de pedido?", a: "Porque los costes fijos — comunicarte con el cliente, laminar, empaquetar, enviar, procesar el pago — no escalan hacia abajo según encoge la pieza. Una impresión de 5 € que consume 20 minutos de tu tiempo es una pérdida cuando esos costes fijos se incluyen honestamente. Un mínimo publicado (típicamente 10–30 €) filtra pedidos que nunca iban a ser rentables y permite enfocar el negocio en encargos donde el valor es proporcional al trabajo." },
      { q: "¿Cómo calculo mi precio por gramo de filamento con precisión?", a: "Toma el precio real que pagaste por la bobina (incluyendo envío si aplica) y divide por el peso en gramos — para una bobina de 22 €, 1 kg, son 0,022 € por gramo. Después, que tu slicer estime los gramos de filamento que consumirá tu pieza, añade un buffer del 5–10% por purga y primer, y multiplica. Esta es la línea de material solamente — no el precio que cobras al cliente, que superpone tiempo de máquina, buffer de fallos, packaging, envío, mano de obra y margen." },
      { q: "¿Cuántas impresiones aguanta una impresora 3D de consumo antes de necesitar mantenimiento importante?", a: "No hay un único número — depende de la marca, el cuidado y la intensidad con que se use. Una hipótesis razonable para planificar con una impresora FDM de consumo gama media es 2.000–4.000 horas antes de que componentes principales (hotend, cama, extrusor) requieran sustitución o mantenimiento significativo. Algunas máquinas duran mucho más con buen mantenimiento; algunas mueren antes si se aprietan mucho. Usa la hipótesis con la que te sientas cómodo para amortización y revísala según se despliegue el historial real de tu impresora." }
    ],
    galleryImages: pick("intake-manifold.jpg", "custom-brackets.jpg", "black-intake.jpg", "curved-parts.jpg", "blue-molds.jpg", "red-adapter.jpg"),
    related: [
      { label: "Rutas Reales de Ingresos", slug: "/como-ganar-dinero-con-impresora-3d" },
      { label: "Playbook de Captación de Clientes", slug: "/como-conseguir-clientes-impresion-3d" },
      { label: "Únete a la Red Local de Makers", slug: "/makers" },
      { label: "Red de Makers Explicada", slug: "/maker-guide" },
      { label: "Profitability (EN)", slug: "/is-3d-printing-business-profitable" },
      { label: "Rentabilität (DE)", slug: "/ist-3d-druck-geschaeft-rentabel" }
    ],
    schemaServiceName: "Guía Rentabilidad Negocio Impresión 3D",
    datePublished: "2026-08-02",
    dateModified: "2026-10-15"
  },

  // ----- NUEVA: CLIENTES PARA MAKERS (cómo conseguir clientes de impresión 3D) -----
  {
    slug: "/como-conseguir-clientes-impresion-3d",
    topic: "maker-customers",
    altSlug: "/how-to-get-3d-printing-customers",
    lang: "es",
    category: "use-case",
    audience: "maker",
    metaTitle: "Cómo Conseguir Clientes de Impresión 3D — Lo que Funciona",
    metaDescription: "¿Impresora lista pero nadie pide? Guía práctica de captación de clientes para makers 3D: Google Business Profile, marketplaces, fotografía",
    h1: "Cómo Conseguir Clientes de Impresión 3D — El Problema Real",
    intro: "El problema más difícil de la impresión 3D no es imprimir. Es el silencio entre encender la impresora y el primer mensaje de un cliente. Esta página trata de cerrar ese hueco — las cosas concretas que convierten una impresora en marcha en un flujo constante de encargos. Si quieres saltarte el marketing por completo, una opción es unirte a una red local de impresión — la de Dimension3D es gratis, sin comisión, sin cuota de alta y sin exclusividad — y cada uno de los caminos de abajo sigue funcionando en paralelo.",
    sections: [
      {
        heading: "Google Business Profile — el listado gratis que todo maker se salta",
        body: "Google Business Profile (antes Google My Business) es un listado gratuito que pone tu servicio de impresión 3D en Google Maps y en el bloque local al principio de las búsquedas locales. Es la pieza de marketing gratuito con mayor apalancamiento para un servicio basado en localización, y la mayoría de makers en casa no lo configuran nunca.\n\nLo que necesitas: un nombre para tu servicio, un área de servicio (no necesitas local público — un perfil de negocio de área de servicio es un tipo válido), datos de contacto, horario, categorías (\"servicio de impresión 3D\" es una categoría válida) y fotos de tu trabajo. Google verificará el negocio, normalmente por postal o teléfono, antes de que el listado esté activo.\n\nUna vez activo, anima a los clientes contentos a dejar una reseña. Las reseñas son la señal individual más potente que Google usa para posicionar negocios locales. Diez reseñas genuinas de clientes reales en unos meses superarán cualquier gasto en anuncios pagados para un pequeño servicio local. Responde a cada reseña, positiva o negativa, con tono profesional — eso también lo verán los futuros clientes."
      },
      {
        heading: "Unirte a una red de impresión existente — encargos que vienen a ti, gratis",
        body: "Todo lo demás en esta página es un canal que tienes que construir tú, y cada uno lleva meses de constancia antes de producir encargos de forma fiable. Si quieres una vía más corta a peticiones reales de clientes que no hayas tenido que buscar tú mismo, unirte a una red local de impresión existente es la opción de baja fricción que merece la pena considerar primero.\n\nLa red de makers de Dimension3D está montada exactamente para esto, y la oferta se mantiene deliberadamente simple:\n\n• Unirse es gratis — sin cuota de alta, sin coste de solicitud, sin tarjeta de prueba.\n• Sin comisión sobre tu trabajo — cada euro que el cliente te paga se queda contigo.\n• Sin cláusula de exclusividad — sigues usando en paralelo todos los canales de abajo (Google Business, marketplaces, clientes directos).\n• Las condiciones se acuerdan individualmente con cada maker antes de empezar cualquier trabajo, así que nada se impone de forma genérica.\n• Los makers producen localmente bajo la marca Dimension3D cuando llegan encargos a su zona.\n\nCómo llegan los encargos: un cliente busca impresión 3D en su ciudad, aterriza en Dimension3D, envía una consulta, y la solicitud se dirige a un maker en su zona — tú conservas tu impresora, tú fijas el precio, y el cliente te paga a ti directamente. Dimension3D nunca toca el dinero.\n\nLa red se expande ciudad a ciudad, así que el volumen de solicitudes que verás depende de la demanda real en tu ciudad — un maker en un mercado donde la marca ya está asentada verá más solicitudes que uno donde la red acaba de arrancar. No hay números garantizados ni volúmenes mensuales prometidos. Lo que sí está garantizado es que unirse no cuesta nada y no hay permanencia — si aún no llegan encargos en tu ciudad, no has perdido nada.\n\nSolicita en [/makers](/makers). Mira [/maker-guide](/maker-guide) para el recorrido completo — cómo llegan los encargos, cómo se presupuesta y cómo el pago va directamente del cliente al maker.\n\nTodo lo que viene debajo de esta sección es lo que hacer en paralelo — construir tu propia visibilidad a través de marketplaces, fotografía, precios, velocidad de respuesta y clientes recurrentes."
      },
      {
        heading: "Marketplaces locales — donde la gente ya busca",
        body: "En España, Wallapop es donde va la gente cuando necesita algo específico y quiere ver vendedores locales. En Francia, Leboncoin. En Alemania, Kleinanzeigen (antes eBay Kleinanzeigen). Etsy y eBay cubren alcance transfronterizo. Cada uno tiene su propia dinámica; el hilo común es que la gente ya está allí, buscando activamente.\n\nQué funciona en clasificados: artículos prácticos específicos (placas con nombre, soportes de móvil, organizadores de cable, llaveros a medida, toppers de tarta), recambios descritos con precisión suficiente para que quien busque el problema exacto los encuentre, y regalos personalizados con una foto clara de cómo queda la personalización.\n\nQué no funciona: anuncios genéricos sin fotografía, precios sin contexto o copy que no diga qué hace el artículo. Compite por claridad, no por ser el más barato. El anuncio más barato de cada marketplace suele ser uno al que no quieres bajar el precio."
      },
      {
        heading: "Fotografiar tus impresiones correctamente — la palanca más grande",
        body: "La diferencia entre un anuncio que vende y uno que no es, muy a menudo, la fotografía. Las impresiones en una mesa desordenada bajo luz cenital dura se ven peor de lo que el objeto realmente es. Las impresiones sobre un fondo limpio con luz natural suave parecen un catálogo profesional.\n\nEl mínimo práctico para buena fotografía de producto de una impresión 3D: fondo liso (una sábana blanca doblada, un cartón pluma, un lightbox si vas en serio), luz de día suave e indirecta o una lámpara softbox barata, un móvil sujeto con firmeza (un trípode, una pila de libros, cualquier cosa) y varios ángulos incluyendo uno que muestre el objeto a la escala correcta (junto a una moneda, una mano o un objeto familiar).\n\nUna sola foto genuinamente bien iluminada con fondo limpio venderá más que tres fotos rápidas tomadas en el suelo del taller. No cuesta nada más que veinte minutos de montaje y se reutiliza en cada anuncio."
      },
      {
        heading: "Precios transparentes — quita fricción, no margen",
        body: "Cada mensaje de cliente que recibes preguntando \"cuánto cuesta esto\" es un mensaje al que no necesitabas dedicar tiempo. Publicar precios transparentes por adelantado (sea como tabla, un número por gramo, un mínimo de pedido o un conjunto de precios de artículos habituales) convierte curiosos en clientes porque pueden decidir sin tener que hablar con un desconocido.\n\nQué publicar: tu mínimo de pedido (esto solo filtra las peticiones que nunca iban a ser rentables), precios típicos para las categorías de trabajo que sí haces (una tarifa por gramo, un \"desde\" para artículos habituales), y cualquier recargo o descuento que apliques de forma consistente (recargo por urgencia, descuento por cantidad en lotes grandes). No necesitas publicar todos los precios posibles — necesitas publicar los suficientes para que el cliente sepa si está en tu rango antes de contactarte.\n\nOcultar precios \"para conservar flexibilidad\" pierde más ventas de las que protege. Los clientes que no consiguieron un número aproximado asumirán lo peor y se irán."
      },
      {
        heading: "Velocidad de respuesta — la ventaja competitiva infravalorada",
        body: "En servicios, quien responde primero suele ganar el encargo. Si un cliente manda la misma petición a tres makers y uno responde en treinta minutos, otro en cuatro horas y otro al día siguiente, el rápido se lleva la mayoría de encargos — independientemente de quién era más barato.\n\nQué aspecto tiene esto en la práctica: mantén las notificaciones de WhatsApp activadas en tu horario laboral, responde al menos con un acuse aunque el presupuesto completo tarde más, y ajusta expectativas honestamente (\"tendré presupuesto completo esta noche\" gana a cuatro horas de silencio). Un mensaje breve y educado en minutos vale más para la conversión que un presupuesto bellamente formateado enviado seis horas después.\n\nEsto no va de estar disponible a las 2 de la mañana — va de definir tu ventana de respuesta (por ejemplo, laborables de 9 a 20) y ser rápido dentro de ella de forma consistente. Publica esa ventana en un sitio visible para que los clientes que escriben fuera sepan cuándo esperar respuesta."
      },
      {
        heading: "Clientes recurrentes vs únicos — dónde está el negocio real",
        body: "Los clientes únicos pagan la factura del martes. Los recurrentes son el negocio real. Un cliente que pidió un soporte en marzo, un regalo personalizado en junio y un pequeño lote de prototipos en septiembre vale, a lo largo de un año, muchas veces más que tres primeras ventas sin relación — y cuesta mucho menos captarlo porque ya tienes su confianza.\n\nLo más simple que puedes hacer para fomentar recurrencia: guarda el archivo del cliente para que un reencargo lleve minutos en lugar de empezar de cero, haz un pequeño seguimiento tras la entrega para comprobar que la pieza funcionó como esperaba (esto es realmente raro y destaca), y recuerda lo que pidió para que la siguiente conversación empiece caliente en lugar de fría. Los pequeños negocios que pidieron una vez para una necesidad concreta suelen volver para la siguiente si la experiencia fue buena y la fricción para reencargar es baja.\n\nLa mayoría de los canales de consumo (marketplaces, clasificados) desincentivan activamente el negocio directo recurrente empujando la comunicación de vuelta por su plataforma. Las relaciones locales y los clientes de contacto directo son donde ocurre el efecto acumulativo."
      }
    ],
    faqs: [
      { q: "¿Cómo me uno a la red de makers de Dimension3D?", a: "Solicítalo en [/makers](/makers) — el formulario lleva unos dos minutos. Leemos cada solicitud personalmente, normalmente en 24 horas, y respondemos por WhatsApp o email. Unirse es gratis: sin cuota de alta, sin comisión sobre tu trabajo y sin cláusula de exclusividad, así que sigues vendiendo donde ya vendas. Las condiciones se acuerdan individualmente con cada maker antes de empezar cualquier trabajo. Tu primer mes es gratis y a partir de ahí la tarifa es un importe mensual fijo acordado contigo antes de empezar — habitualmente desde 2 €/mes. Mira [/maker-guide](/maker-guide) para el recorrido completo." },
      { q: "¿Cómo encuentro mi primer cliente de impresión 3D?", a: "El camino más corto es contárselo a la gente que ya conoces — publica una foto clara de un proyecto en tu círculo (Instagram, estado de WhatsApp, un grupo local de Facebook o Nextdoor), ofrece algo pequeño y específico en lugar de un genérico \"imprimo lo que sea\", y prepárate para responder rápido cuando llegue el primer mensaje. Los primeros clientes casi siempre vienen de alguien a una o dos conexiones de distancia, no de un desconocido encontrando tu anuncio." },
      { q: "¿Merece la pena montar Google Business Profile para un servicio de impresión 3D?", a: "Sí — es gratis y para cualquier servicio basado en localización es la pieza de marketing local con mayor apalancamiento. No necesitas local público (los perfiles de negocio de área de servicio son un tipo válido). Diez reseñas genuinas de clientes contentos en unos meses generarán más consultas entrantes sostenidas que cualquier gasto en anuncios pagados para un pequeño operador local." },
      { q: "¿Por qué mis anuncios en Wallapop o Etsy tienen visitas pero no pedidos?", a: "Casi siempre una de tres cosas: el precio está desalineado con la competencia visible, la foto no muestra el objeto con claridad sobre fondo limpio, o la descripción no dice explícitamente qué es el objeto y para quién es. Visitas sin pedidos son en realidad una señal positiva — significa que el anuncio aparece en búsqueda. El hueco a cerrar es entre \"alguien hizo clic\" y \"alguien escribió\", que suele ser un problema de fotografía y copy, no de alcance." },
      { q: "¿Con qué rapidez tengo que responder a las consultas de los clientes?", a: "Dentro de tu horario laboral publicado, responder en menos de treinta minutos es una ventaja competitiva real y a menudo la diferencia entre ganar o perder un encargo. Aunque el presupuesto completo tarde más, enviar un acuse breve rápido (\"Recibido, tendré presupuesto a las 18h\") mantiene la conversación caliente y evita que el cliente escriba a la competencia mientras espera." },
      { q: "¿Cuál es la mejor forma de conseguir clientes recurrentes en impresión 3D?", a: "Tres cosas: guarda el archivo del cliente para que los reencargos lleven minutos en lugar de empezar de cero, haz un seguimiento breve tras la entrega para confirmar que la pieza funcionó (es raro y destaca), y recuerda lo que pidió antes para que la siguiente conversación empiece caliente. Los pequeños negocios que pidieron una vez para una necesidad concreta suelen volver si la experiencia fue buena y reencargar es de baja fricción." },
      { q: "¿Unirme a una red de impresión significa que dejo de vender por mi cuenta?", a: "No — al menos no con ninguna red que merezca la pena. La red de Dimension3D específicamente es no exclusiva: los makers siguen con Wallapop, Etsy, clientes directos o cualquier otro canal que ya usen. Los encargos de la red vienen adicionales a lo que ya haces, y ese es el punto. Si una red requiere que dejes de vender en otros sitios a cambio de unirte, merece la pena pensarlo mucho antes de firmar." }
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "custom-brackets.jpg", "purple-figures.jpg", "green-chameleon.jpg", "halloween-set.jpg", "red-adapter.jpg"),
    related: [
      { label: "Canales de Ingresos que Realmente Pagan", slug: "/como-ganar-dinero-con-impresora-3d" },
      { label: "Números Reales de un Negocio", slug: "/es-rentable-negocio-impresion-3d" },
      { label: "Únete a la Red Local de Makers", slug: "/makers" },
      { label: "Flujo y Pago en la Red", slug: "/maker-guide" },
      { label: "Customers Guide (EN)", slug: "/how-to-get-3d-printing-customers" },
      { label: "Kunden finden (DE)", slug: "/kunden-fuer-3d-druck-finden" }
    ],
    schemaServiceName: "Guía Captación Clientes Impresión 3D",
    datePublished: "2026-08-02",
    dateModified: "2026-10-15",
    howToSteps: [
      { name: "Google Business Profile — el listado gratis que todo maker se salta", text: "Google Business Profile (antes Google My Business) es un listado gratuito que pone tu servicio de impresión 3D en Google Maps y en el bloque local al principio de las búsquedas locales. Es la pieza de marketing gratuito con mayor apalancamiento para un servicio basado en localización." },
      { name: "Unirte a una red de impresión existente — encargos que vienen a ti, gratis", text: "Todo lo demás en esta página es un canal que tienes que construir tú, y cada uno lleva meses de constancia antes de producir encargos de forma fiable. Si quieres una vía más corta a peticiones reales de clientes que no hayas tenido que buscar tú mismo, unirte a una red local de impresión existente es la opción de baja fricción." },
      { name: "Marketplaces locales — donde la gente ya busca", text: "En España, Wallapop es donde va la gente cuando necesita algo específico y quiere ver vendedores locales. Cada plataforma tiene su propia dinámica; el hilo común es que la gente ya está allí, buscando activamente." },
      { name: "Fotografiar tus impresiones correctamente — la palanca más grande", text: "La diferencia entre un anuncio que vende y uno que no es, muy a menudo, la fotografía. Las impresiones sobre un fondo limpio con luz natural suave parecen un catálogo profesional." },
      { name: "Precios transparentes — quita fricción, no margen", text: "Cada mensaje de cliente que recibes preguntando cuánto cuesta esto es un mensaje al que no necesitabas dedicar tiempo. Publicar precios transparentes por adelantado convierte curiosos en clientes." },
      { name: "Velocidad de respuesta — la ventaja competitiva infravalorada", text: "En servicios, quien responde primero suele ganar el encargo. Si un cliente manda la misma petición a tres makers y uno responde en treinta minutos, el rápido se lleva la mayoría de encargos." },
      { name: "Clientes recurrentes vs únicos — dónde está el negocio real", text: "Los clientes únicos pagan la factura del martes. Los recurrentes son el negocio real." }
    ]
  },

  // ----- COMPARATIVA DE MATERIALES -----
  {
    slug: "/comparativa-materiales-impresion-3d",
    topic: "materials-comparison",
    altSlug: "/3d-printing-materials-comparison",
    lang: "es",
    category: "use-case",
    metaTitle: "Comparativa de Materiales de Impresión 3D",
    metaDescription: "Comparativa completa de materiales FDM: PLA, PETG, ABS, ASA, TPU, Nylon y fibra de carbono. Propiedades, usos y precios orientativos en Dimension3D.",
    h1: "Comparativa de Materiales de Impresión 3D — ¿Qué Material es el Adecuado para tu Pieza?",
    intro: "Elegir el material equivocado cuesta dinero dos veces: una cuando pagas por una pieza que falla, y otra cuando la reimprimes. Esta página pone todos los materiales FDM que ofrecemos uno al lado del otro para que puedas comparar una sola vez y pedir con confianza. Todos los materiales de la tabla están en stock y se imprimen en el estudio.",
    comparisonTable: {
      headers: ["Material", "Coste", "Resistencia a tracción", "Resistencia al calor", "Flexibilidad", "Apto para exteriores", "Imprimibilidad", "Uso típico"],
      rows: [
        ["PLA",        "Bajo",         "Media",              "Baja (~55 °C)",        "Rígido",    "Baja",               "Alta",        "Decorativo, regalos, prototipos, modelos de exposición"],
        ["PETG",       "Bajo–Medio",   "Media–Alta",         "Media (~75 °C)",       "Ligera",    "Media–Alta",         "Media–Alta",  "Piezas funcionales, carcasas, elementos en exteriores"],
        ["ABS",        "Medio",        "Alta",               "Alta (~100 °C)",        "Rígido",    "Media",              "Media*",      "Piezas técnicas, carcasas expuestas al calor"],
        ["ASA",        "Medio",        "Alta",               "Alta (~100 °C)",        "Rígido",    "Alta (estable UV)",  "Media*",      "Piezas estructurales en exteriores, accesorios de jardín"],
        ["TPU",        "Medio",        "Media",              "Media (~70 °C)",        "Muy Alta",  "Media",              "Media–Baja",  "Juntas, empuñaduras, conectores flexibles, fundas"],
        ["Nylon PA12", "Medio–Alto",   "Muy Alta",           "Alta (~110 °C)",        "Baja–Media","Media",              "Media†",      "Piezas de carga, alta resistencia al desgaste"],
        ["PLA-CF",     "Alto",         "Alta (muy rígido)",  "Baja (~55 °C)",         "Muy Baja",  "Baja",               "Media",       "Soportes ligeros y rígidos, utillajes"],
        ["PETG-CF",    "Alto",         "Alta (muy rígido)",  "Media (~75 °C)",        "Muy Baja",  "Media–Alta",         "Media",       "Piezas estructurales rígidas con exposición exterior"],
        ["Nylon-CF",   "Alto",         "Muy Alta (rígido)",  "Alta (~110 °C)",        "Muy Baja",  "Media",              "Media†",      "Máxima rigidez y resistencia bajo calor"],
      ],
      caption: "* ABS y ASA requieren una cámara de impresión calefactada para buena adhesión y evitar deformaciones. † El Nylon debe secarse antes de imprimir. El coste es relativo por gramo a precio de filamento típico. La resistencia al calor es la temperatura de deflexión práctica de la pieza impresa a relleno estándar.",
    },
    sections: [
      {
        heading: "Cómo interpretar esta comparativa",
        body: "Todas las valoraciones son relativas dentro del conjunto de materiales FDM que ofrecemos — no son comparaciones con nylon inyectado ni con composites aeroespaciales. El coste es relativo por gramo a precio de filamento típico: una pieza grande en material barato puede costar más que una pieza pequeña en material caro. La resistencia a tracción corresponde al plano XY con un relleno estándar de aproximadamente el 25%, no al 100% sólido. La resistencia al calor es la temperatura de deflexión práctica de la pieza impresa, que puede ser inferior a la que figura en el datasheet del filamento por el efecto de la unión entre capas. La 'imprimibilidad' mide con qué fiabilidad puede imprimirse un material sin cama caliente adicional, cámara cerrada ni secado de filamento — puntuación más alta significa menos variables y mejores resultados en más máquinas."
      },
      {
        heading: "PLA y PETG — la pareja del día a día",
        body: "El PLA es el punto de partida por defecto por una razón. Es el material más barato de nuestra selección, el más fácil de imprimir, dimensionalmente preciso y fiable para la inmensa mayoría de aplicaciones de interior. Su única debilidad real es la resistencia al calor: nada que vaya a estar dentro de un coche aparcado, cerca de un radiador o en exteriores bajo el sol de Barcelona debería ser PLA. La pieza se ablandará, deformará o fallará. Para todo lo que permanezca en interiores a temperatura ambiente, el PLA es casi siempre la elección correcta — y la más rentable.\n\nEl PETG sube un escalón en casi todas las dimensiones prácticas. Es ligeramente más caro y algo más exigente de imprimir, pero significativamente más resistente en exteriores, algo más flexible bajo carga sin fracturarse, y aguanta temperaturas de hasta unos 75 °C. El patrón más habitual que vemos: prototipo en PLA y reimpresión en PETG para la pieza final que va a vivir en exterior o cerca de una fuente de calor. El PETG también tiene mejor resistencia química que el PLA, lo que importa para piezas en contacto con productos de limpieza o disolventes suaves."
      },
      {
        heading: "ABS, ASA y materiales resistentes al calor",
        body: "ABS y ASA comparten la misma banda de precio y ambos aguantan temperaturas de hasta unos 100 °C, pero resuelven problemas distintos. El ABS es el termoplástico técnico clásico — alta resistencia, buena resistencia al impacto y comportamiento mecánico bien caracterizado. El ASA añade una propiedad crítica que el ABS no tiene: estabilidad UV. En exteriores en Barcelona, una pieza de ABS se amarillea y se vuelve frágil en pocos meses; una de ASA no. Para cualquier aplicación estructural en exterior, el ASA es casi siempre la mejor elección.\n\nAmbos materiales requieren una cámara de impresión calefactada para una impresión fiable. Sin ella, el diferencial de temperatura entre la capa extruida y el aire ambiente provoca deformaciones y delaminación. Los imprimimos en el estudio con el equipamiento adecuado. Si los estás evaluando para tu propia máquina, trátalos como materiales de nivel intermedio-avanzado: no porque la configuración sea complicada, sino porque el entorno de impresión debe estar controlado."
      },
      {
        heading: "TPU — la alternativa flexible",
        body: "El TPU es el material al que recurrimos cuando una pieza necesita flexarse, absorber impactos o sellar contra otra superficie. Es elástico y similar al caucho — ideal para juntas, empuñaduras, protectores de cable, fundas de móvil, tapas con cierre a presión y cualquier pieza que se fracture si fuera rígida. El compromiso: precisión dimensional reducida (el TPU se estira ligeramente al medir) y parámetros de impresión más exigentes: retracción cuidada, velocidades lentas y atención a la humedad. Si se requieren tolerancias ajustadas bajo deformación, conviene prototipar y medir primero.\n\nLa resistencia al calor del TPU se sitúa entre el PLA y el ABS. Para la mayoría de aplicaciones de sellado y agarre, las temperaturas de operación están bien dentro del rango. El TPU también se presenta en diferentes durezas Shore; si tienes un objetivo de dureza concreto, indícalo al solicitar presupuesto."
      },
      {
        heading: "Nylon y filamentos reforzados con fibra de carbono",
        body: "El Nylon PA12 ofrece la mejor combinación de resistencia a tracción, resistencia al impacto y tolerancia térmica de todos los materiales no-CF de nuestra selección. Absorbe impactos considerables sin fracturarse y mantiene integridad estructural hasta aproximadamente 110 °C. El inconveniente práctico: el nylon es higroscópico y debe secarse antes de imprimir, lo que añade un paso al proceso. Las piezas entregadas tienen la misma calidad que cualquier nylon procesado correctamente.\n\nLas variantes con fibra de carbono (PLA-CF, PETG-CF, Nylon-CF) mezclan fibra de carbono de fibra corta en el material base. El resultado es una rigidez enormemente mayor — las piezas se notan y se comportan como una clase de material diferente al base sin reforzar. El compromiso es menor ductilidad: las piezas CF resisten la deflexión pero son más frágiles bajo carga de impacto repentina. La fibra de carbono es la elección correcta cuando la rigidez y la relación rigidez-peso son el objetivo principal. Cuando una pieza necesita flexarse sin fracturarse, el material base sin CF rinde mejor.\n\nLos filamentos CF también desgastan los nozzles estándar de latón más rápido que los materiales sin reforzar — un coste que absorbemos en el precio por gramo, de ahí que las variantes CF sean las más caras de nuestra selección."
      },
    ],
    faqs: [
      { q: "¿Cuál es el material más barato para impresión 3D?", a: "El PLA es el material más barato por gramo. Como el coste de una pieza escala principalmente con el peso de material y el tiempo de impresión, una pieza en PLA será casi siempre la versión más asequible de cualquier diseño. El PETG es el siguiente, seguido de ABS/ASA y TPU, con el Nylon y las variantes de fibra de carbono en la parte superior del rango. Si el coste es la restricción principal, diseña para PLA y cambia de material solo cuando la aplicación lo requiera de verdad." },
      { q: "¿Puedo usar PLA para piezas en exteriores o en entornos cálidos?", a: "El PLA se ablanda a unos 55 °C — una temperatura que se alcanza habitualmente dentro de un coche aparcado en verano en Barcelona, en una terraza bajo el sol o cerca de una ventana orientada al sur. Para aplicaciones en exterior, el PETG (hasta ~75 °C, buena tolerancia UV) es el mínimo que recomendamos. El ASA es mejor para cualquier cosa estructural o expuesta permanentemente al sol. El PLA funciona bien en exterior en condiciones templadas y a la sombra, pero preferimos señalar el riesgo antes de que la pieza falle." },
      { q: "¿Cuál es el material más resistente que ofrecéis?", a: "Por resistencia a tracción, el Nylon-CF imprime las piezas más resistentes de nuestra selección. Por resistencia al impacto (tenacidad bajo carga repentina), el Nylon PA12 estándar aguanta mejor — la fibra de carbono que hace rígidos los filamentos CF también reduce la ductilidad. Para la mayoría de aplicaciones de alta resistencia, la respuesta correcta depende de si la pieza debe resistir la deflexión bajo carga sostenida (Nylon-CF) o la fractura bajo impacto repentino (Nylon PA12)." },
      { q: "¿Qué significa '-CF' en PLA-CF, PETG-CF o Nylon-CF?", a: "CF significa reforzado con fibra de carbono. Fibras cortas de carbono se mezclan en el filamento base, aumentando drásticamente la rigidez y reduciendo el peso por volumen. El compromiso es menor resistencia al impacto en comparación con el material base sin reforzar — las piezas CF resisten la flexión pero son más frágiles bajo carga repentina. Las variantes CF también tienen un mayor coste por gramo por el precio del material y el desgaste acelerado del nozzle." },
      { q: "Necesito una pieza resistente al calor — ¿qué material elijo?", a: "Depende del rango de temperatura. Hasta ~70 °C: el PETG cubre la mayoría de aplicaciones sin carga elevada de forma fiable. Entre 70 y 110 °C: ABS o ASA son las opciones prácticas en FDM — ASA para exposición exterior, ABS para interior. Por encima de ~110 °C: los materiales FDM estándar alcanzan sus límites prácticos. Para aplicaciones de verdadero calor extremo, describe las condiciones térmicas exactas y la carga al solicitar presupuesto y te recomendaremos el enfoque correcto." },
      { q: "¿Afecta el material al plazo de entrega?", a: "Ligeramente. PLA y PETG son los más rápidos de procesar — no requieren cámara ni secado. ABS y ASA necesitan calefacción de cámara, lo que añade un pequeño paso de preparación. Los grados de Nylon deben secarse antes de imprimir, lo que añade unas horas. El TPU se imprime más lento por las restricciones de velocidad. Las variantes de fibra de carbono son similares en tiempo a sus materiales base. Para pedidos urgentes, indícanos el plazo al pedir para que podamos confirmar la disponibilidad." },
    ],
    galleryImages: pick("intake-manifold.jpg", "custom-brackets.jpg", "red-adapter.jpg", "black-intake.jpg", "curved-parts.jpg", "blue-molds.jpg"),
    related: [
      { label: "Guía Completa de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Comparativa de Plazos de Entrega", slug: "/comparativa-plazos-impresion-3d" },
      { label: "Comparativa de Tecnologías (FDM vs SLA vs SLS)", slug: "/comparativa-tecnologias-impresion-3d" },
      { label: "Cómo Preparar tu Archivo", slug: "/como-preparar-archivo-impresion-3d" },
      { label: "Precios Transparentes", slug: "/precio-impresion-3d-barcelona" },
      { label: "Mejor Servicio Según Uso", slug: "/mejor-servicio-impresion-3d-barcelona" },
    ],
    schemaServiceName: "Comparativa de Materiales de Impresión 3D",
    datePublished: "2026-09-03",
    dateModified: "2026-09-03",
  },

  // ----- COMPARATIVA DE PLAZOS -----
  {
    slug: "/comparativa-plazos-impresion-3d",
    topic: "turnaround-comparison",
    altSlug: "/3d-printing-turnaround-comparison",
    lang: "es",
    category: "use-case",
    metaTitle: "Comparativa de Plazos de Impresión 3D",
    metaDescription: "Compara los plazos de entrega de impresión 3D en Barcelona: estándar 2–5 días, express 24–48 h y urgente. Plazos reales con impacto en el precio.",
    h1: "Comparativa de Plazos de Impresión 3D — Estándar, Express y Urgente",
    intro: "¿Cuánto tarda una impresión 3D? La respuesta depende del nivel de servicio que elijas — y de ser honestos sobre lo que cada nivel puede y no puede ofrecer. Esta página detalla nuestros tres niveles de plazo, sus tiempos reales, el impacto en el precio, los materiales disponibles y las condiciones que aplican, para que puedas ajustar tu fecha límite al nivel correcto sin sorpresas.",
    comparisonTable: {
      headers: ["Nivel de servicio", "Plazo típico", "Precio vs estándar", "Materiales disponibles", "Ideal para", "Condiciones clave"],
      rows: [
        ["Estándar",           "2–5 días laborables",                "Precio base (×1,0)",      "Todos los materiales (PLA, PETG, ABS, ASA, TPU, Nylon, variantes CF)", "Pedidos sin urgencia, prototipos, pedidos sensibles al precio",          "Por defecto en todos los pedidos; el más fiable para control de calidad"],
        ["Express",            "24–48 horas",                        "+25% sobre precio base",  "PLA, PETG, ABS, ASA, TPU",                                             "Fechas límite de evento, demos con clientes, iteraciones urgentes",       "No disponible para todos los materiales; los volúmenes grandes pueden no caber"],
        ["Urgente / Mismo día","Mismo día laborable (recogida)",     "+60% sobre precio base",  "PLA, PETG, TPU",                                                       "Emergencias reales — pieza rota, atrezo de última hora, demo en vivo",   "Sujeto a cola; solo volúmenes pequeños; nunca garantizado de antemano"],
      ],
      caption: "Los plazos se cuentan desde el presupuesto aprobado hasta el envío o la disponibilidad para recogida, en días laborables. El servicio de mismo día es solo para recogida — no disponible para envío postal.",
    },
    sections: [
      {
        heading: "Estándar — el nivel por defecto, y casi siempre el correcto",
        body: "El servicio estándar cubre la gran mayoría de pedidos. Un plazo de 2–5 días laborables nos da margen para revisar el archivo correctamente, seleccionar los parámetros de impresión óptimos, supervisar el proceso y realizar un control de calidad antes de que la pieza salga del taller. Admite todos los materiales de nuestra selección — desde PLA básico hasta Nylon-CF — porque la ausencia de presión de tiempo evita compromisos en el secado, el precalentamiento de la cámara o la velocidad de impresión.\n\nEl servicio estándar es también el más rentable por diseño. Si tu proyecto tiene una fecha límite flexible, el estándar es casi siempre la elección correcta. El multiplicador de precio es ×1,0 — el número que ves en el estimador es lo que pagas, sin recargo por urgencia."
      },
      {
        heading: "Express — de 24 a 48 horas",
        body: "El servicio express apunta a completar el pedido en uno o dos días laborables a partir del presupuesto aprobado. Es la elección correcta cuando tienes una fecha límite específica — una presentación a cliente, un evento, un ciclo de iteración que necesita cerrarse antes de fin de semana — pero la producción el mismo día no es necesaria.\n\nEl express está disponible para PLA, PETG, ABS, ASA y TPU. Los materiales que requieren más preparación o secado (Nylon, variantes de fibra de carbono) pueden no ser compatibles con express según la cola y la complejidad de la pieza. Las piezas muy grandes o los pedidos de gran volumen también pueden quedar fuera de la ventana de 24–48 horas independientemente del material. Al solicitar un presupuesto express, confirmamos si tu trabajo concreto entra en el plazo antes de que apruebes nada.\n\nEl recargo express es del 25% sobre el precio base de material e impresión — no sobre servicios adicionales como acabados o envío. Para piezas grandes con precio base elevado, el valor absoluto del recargo puede ser significativo. Para piezas pequeñas con precio base bajo, la prima express suele ser una adición menor."
      },
      {
        heading: "Urgente y mismo día — la realidad",
        body: "El servicio urgente implica producción el mismo día laborable y disponibilidad para recogida ese día. Está reservado para emergencias reales: una pieza de recambio crítica necesaria antes del cierre de la jornada, un atrezo necesario para un rodaje a primera hora del día siguiente, un utillaje roto en una línea de producción. El multiplicador de precio ×1,6 refleja tanto la interrupción de la cola como las restricciones físicas de la producción el mismo día.\n\nEl servicio de mismo día es solo para recogida — no envío postal. Está limitado a materiales que se imprimen de forma fiable sin preparación extendida: PLA, PETG y TPU. También está limitado a piezas que físicamente terminan dentro de una jornada laboral — una pieza de 400 gramos que tarda 14 horas de máquina no puede ser de mismo día independientemente del precio. Y, de forma crítica: el mismo día no está garantizado hasta que hayamos revisado tu archivo y confirmado disponibilidad. Si nos contactas a las 16h para recoger a las 18h, la respuesta puede ser no. Contáctanos lo antes posible en el día si necesitas servicio de mismo día."
      },
      {
        heading: "Qué controla realmente el plazo de entrega",
        body: "El nivel que eliges es un objetivo, no una garantía automática. Varios factores afectan a lo que podemos entregar en qué tiempo:\n\n• Tamaño y volumen de la pieza: Un soporte pequeño de 30 gramos puede imprimirse en dos horas. Una carcasa grande de 400 gramos se imprime de noche. Los pedidos de varias piezas tardan más que una sola impresión. Lo evaluamos durante la presupuestación.\n\n• Material: El Nylon debe secarse antes de imprimir (añade varias horas). ABS y ASA requieren precalentamiento de cámara. Son retrasos menores en servicio estándar pero relevantes en contextos urgentes.\n\n• Cola: Si el taller está a plena capacidad — situación habitual antes de fines de semana o festivos españoles — incluso los trabajos express pueden retrasarse algunas horas. Somos transparentes cuando esto afecta a tu pedido.\n\n• Calidad del archivo: Un archivo que necesita reparación antes del slicing añade tiempo. Enviar un archivo limpio y validado (ver nuestra guía de preparación de archivos) es la forma más fiable de proteger tu fecha límite."
      },
      {
        heading: "Cómo indicar una fecha límite al pedir",
        body: "Cuando envíes una solicitud de presupuesto, incluye tu fecha límite concreta de forma explícita — no un vago 'lo antes posible'. Indícanos la fecha y hora exacta en que necesitas la pieza lista, y si es para recogida o envío. Confirmaremos si tu plazo es viable antes de que apruebes nada.\n\nPara pedidos urgentes: contáctanos por WhatsApp lo antes posible en el día. Cuanto antes lo sepamos, más opciones tenemos. Un mensaje a las 9h nos da toda la jornada laboral. Un mensaje a las 17h puede dejar tiempo de máquina insuficiente independientemente del recargo.\n\nPara pedidos express planificados: solicita el presupuesto al menos 24 horas antes de la hora de disponibilidad objetivo. Esto nos da tiempo para preparar el archivo, presupuestar con precisión e iniciar el proceso sin prisas. Un servicio express pedido a las 8h para las 17h del mismo día es sustancialmente más viable que uno pedido a las 15h."
      },
    ],
    faqs: [
      { q: "¿Cuánto tarda una impresión 3D en Barcelona?", a: "Lo más rápido es la recogida el mismo día para piezas pequeñas en PLA/PETG/TPU — sujeto a cola y confirmado en el momento del pedido. Para trabajo planificado, el servicio express apunta a 24–48 horas. El servicio estándar entrega en 2–5 días laborables y cubre todos los materiales. Contáctanos lo antes posible en el día para solicitudes de mismo día." },
      { q: "¿Cuánto más cuesta el servicio express frente al estándar?", a: "El express añade un 25% sobre el precio base de material e impresión. El urgente (mismo día) añade un 60%. Los recargos se aplican al coste de impresión, no al envío ni a los acabados presupuestados por separado. Para piezas pequeñas, la prima absoluta es modesta; para piezas grandes o con materiales caros puede ser significativa." },
      { q: "¿Podéis imprimir Nylon o fibra de carbono el mismo día?", a: "No de forma fiable. El Nylon requiere secado antes de imprimir (añade varias horas de preparación) y las variantes de fibra de carbono también. Ambos están disponibles en servicio express según la cola, pero la producción el mismo día no es realista para estos materiales. Para un trabajo urgente en Nylon o CF, contáctanos temprano y te damos una valoración honesta." },
      { q: "¿Las '24–48 horas' se cuentan desde que mando el archivo o desde que apruebo el presupuesto?", a: "Desde que apruebas el presupuesto. La ventana de 24–48 horas comienza una vez que tenemos el archivo limpio, el presupuesto acordado e iniciamos la impresión. La revisión del archivo y la presupuestación ocurren antes de esa ventana. Para una fecha límite realmente ajustada, merece la pena contactarnos lo antes posible para que el presupuesto pueda acordarse rápidamente." },
      { q: "¿Es posible la entrega a domicilio el mismo día o solo la recogida?", a: "Solo recogida el mismo día. Los mensajeros postales tienen horarios de recogida fijos y el día siguiente es el mínimo realista para entrega en cualquier punto de España. Si necesitas las piezas hoy y no puedes recoger en persona, consúltanos — en algunos casos podemos coordinar recogida de mensajero para trabajos muy tempraneros, pero no es un servicio estándar." },
      { q: "¿Qué pasa si hay un fallo de impresión en un pedido express o urgente?", a: "Si la impresión falla por un problema de archivo o slicing de nuestra parte, reimprimimos sin coste adicional y priorizamos la reimpresión. Si el fallo es causado por un problema de geometría en tu archivo, te contactamos de inmediato y valoramos las opciones. En pedidos urgentes especialmente, revisamos los archivos cuidadosamente antes de empezar para minimizar este riesgo." },
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "custom-brackets.jpg", "intake-manifold.jpg", "red-adapter.jpg", "purple-figures.jpg", "cookie-cutters.jpg"),
    related: [
      { label: "Comparativa de Materiales", slug: "/comparativa-materiales-impresion-3d" },
      { label: "Comparativa de Tecnologías (FDM vs SLA vs SLS)", slug: "/comparativa-tecnologias-impresion-3d" },
      { label: "Guía Completa de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Cómo Preparar tu Archivo", slug: "/como-preparar-archivo-impresion-3d" },
      { label: "Precios Transparentes", slug: "/precio-impresion-3d-barcelona" },
      { label: "Mejor Servicio Según Uso", slug: "/mejor-servicio-impresion-3d-barcelona" },
    ],
    schemaServiceName: "Comparativa de Plazos de Impresión 3D",
    datePublished: "2026-09-03",
    dateModified: "2026-09-03",
  },

  // ----- COMPARATIVA DE TECNOLOGÍAS -----
  {
    slug: "/comparativa-tecnologias-impresion-3d",
    topic: "technology-comparison",
    altSlug: "/3d-printing-technology-comparison",
    lang: "es",
    category: "use-case",
    metaTitle: "FDM vs SLA vs SLS",
    metaDescription: "Compara FDM, SLA (resina) y SLS/MJF: detalle de superficie, resistencia, materiales, coste y casos de uso. Elige el proceso correcto para tu pieza.",
    h1: "FDM vs SLA vs SLS — Comparativa de Tecnologías de Impresión 3D",
    intro: "Tres tecnologías dominan los servicios de impresión 3D profesionales: FDM (modelado por deposición fundida), SLA (estereolitografía / resina) y SLS o MJF (fusión por lecho de polvo). Cada una tiene ventajas reales y límites reales. Esta página las compara en las dimensiones que más importan — detalle de superficie, resistencia mecánica, rango de materiales, coste por pieza y caso de uso típico — y te dice con honestidad cuál elegir, incluyendo cuándo el FDM no es la respuesta correcta.",
    comparisonTable: {
      headers: ["Tecnología", "Detalle de superficie", "Resistencia mecánica", "Rango de materiales", "Coste por pieza", "Caso de uso típico", "¿Disponible en Dimension3D?"],
      rows: [
        ["FDM (Modelado por deposición fundida)", "Bueno — líneas de capa visibles; suavizable con postprocesado",   "Muy buena en plano XY; el eje Z (unión entre capas) es el más débil", "Amplio: PLA, PETG, ABS, ASA, TPU, Nylon, variantes CF y más",           "Bajo–Medio", "Piezas funcionales, prototipos, carcasas, soportes, recambios",                                "✓ Sí — nuestra tecnología principal"],
        ["SLA / Resina",                          "Excelente — el mayor detalle de superficie de cualquier proceso de consumo", "Buena a compresión; frágil bajo carga de impacto fuerte", "Principalmente resinas rígidas estándar; existen resinas técnicas y flexibles", "Medio–Alto", "Patrones de joyería, modelos dentales, miniaturas de exposición, piezas de alta calidad superficial", "✗ No disponible"],
        ["SLS / MJF (Fusión por lecho de polvo)", "Buena — sin marcas de soporte, acabado mate suave",               "Excelente — completamente isotrópica (igual resistencia en todas las direcciones)", "Nylon PA12, PA11, TPU (SLS); rango más amplio con MJF",                  "Alto",       "Piezas de uso final en bajos volúmenes, geometría compleja, elementos interlockados sin restricciones de soporte", "✗ No disponible"],
      ],
      caption: "El FDM es nuestra tecnología. SLA y SLS/MJF son alternativas del sector que ofrecen otros proveedores — incluidas aquí para una comparativa honesta.",
    },
    sections: [
      {
        heading: "FDM — qué es y dónde destaca",
        body: "El modelado por deposición fundida funciona fundiendo un filamento termoplástico y depositándolo capa a capa para construir la pieza. Es con diferencia la tecnología de impresión 3D más accesible, cubre el mayor rango de materiales, los mayores volúmenes de construcción y el menor coste por gramo de cualquier proceso principal.\n\nEl FDM destaca de verdad en piezas funcionales. Un soporte que necesita soportar carga, una carcasa que necesita sobrevivir a golpes, una pieza de recambio que debe encajar en una interfaz concreta, un prototipo que hay que probar en condiciones reales — estas son aplicaciones en las que el FDM rinde de forma fiable y rentable. El rango de materiales es una fortaleza particular: PLA para trabajo de interior rentable, PETG para exposición exterior, ASA para piezas estructurales en exterior estables al UV, TPU para aplicaciones flexibles, Nylon y variantes de fibra de carbono para máximas prestaciones.\n\nLas líneas de capa son visibles en piezas FDM sin acabar — esto es una consecuencia inherente del proceso de deposición, no un defecto de calidad. En piezas funcionales las líneas son irrelevantes. En piezas de exposición o presentación, el lijado, el imprimado y la pintura pueden producir un acabado liso. Si la textura superficial es un requisito estricto, ver SLA abajo."
      },
      {
        heading: "SLA y resina — donde supera genuinamente al FDM",
        body: "La SLA (estereolitografía) y sus variantes (MSLA, DLP) utilizan luz UV para curar una resina líquida capa a capa. La resolución es mucho más fina que el FDM porque el proceso no está limitado por el diámetro del nozzle — son alcanzables detalles de hasta 0,05 mm en impresoras de resina de consumo.\n\nLa SLA es genuinamente la mejor elección para aplicaciones donde la calidad superficial es el requisito principal: patrones de joyería para fundición, modelos dentales, miniaturas de escala para exposición, renders de producto en fase de prototipo. Si necesitas capturar expresiones faciales en una figura, replicar un detalle mecánico fino o producir una superficie que se pintará para exposición, la SLA produce un resultado que el FDM no puede igualar sin un postprocesado extenso.\n\nSin embargo, los compromisos son reales. Las piezas de resina son típicamente más frágiles que las de FDM — aguantan bien la compresión pero se fracturan bajo impacto fuerte. El rango de materiales es limitado comparado con los filamentos técnicos de FDM. El volumen de construcción es menor en la mayoría de impresoras de resina. Y el requisito de postprocesado (lavado UV y curado) añade pasos al flujo de trabajo.\n\nNo ofrecemos impresión SLA. Si el requisito principal de tu proyecto es máxima calidad superficial y la pieza no estará sometida a carga mecánica significativa, te diremos con honestidad que una impresión en resina de un servicio especializado es la mejor opción."
      },
      {
        heading: "SLS y MJF — fusión industrial por lecho de polvo",
        body: "El sinterizado selectivo por láser (SLS) y la Multi Jet Fusion (MJF) de HP son procesos de polvo que sinterizan o unen partículas de polímero sin ninguna estructura de soporte. La ausencia de soportes es la ventaja práctica clave: canales internos, socavados y geometría compleja entrelazada que requeriría soportes extensos en FDM o SLA se imprime sin restricciones en SLS/MJF.\n\nLas propiedades mecánicas son excelentes. Las piezas de fusión por lecho de polvo son completamente isotrópicas — igual resistencia en todas las direcciones — y se comportan más como piezas inyectadas que como impresiones FDM, que tienen una debilidad medible en el eje Z por la unión entre capas. Para piezas de uso final que serán cargadas en múltiples direcciones, las características de resistencia de SLS/MJF son superiores.\n\nLa barrera práctica es el coste. SLS y MJF requieren equipamiento industrial, y la economía por pieza solo se vuelve competitiva con el FDM a volúmenes que justifican el overhead de preparación. Un soporte individual en SLS cuesta varias veces más que el mismo soporte en Nylon FDM. No ofrecemos SLS ni MJF — no son rentables para los volúmenes de pieza y las aplicaciones que nos traen la mayoría de nuestros clientes."
      },
      {
        heading: "Cuándo el FDM no es la elección correcta",
        body: "Imprimimos en FDM y creemos que es la tecnología correcta para la mayoría de aplicaciones prácticas de impresión 3D. Pero hay casos en los que genuinamente no lo es.\n\n• Si la calidad superficial es el requisito principal y el postprocesado no es viable — una figura de calidad de exposición, un patrón de joyería para fundición, un modelo dental — la SLA producirá un mejor resultado.\n\n• Si la pieza tiene geometría interna compleja o elementos entrelazados que requerirían extracción de soportes extensos — y la extracción de soportes dañaría o distorsionaría la pieza — SLS/MJF es más adecuado.\n\n• Si la pieza se cargará en los tres ejes simultáneamente y se requiere resistencia isotrópica — no solo resistencia XY — el Nylon SLS/MJF supera al Nylon FDM.\n\nEn cualquiera de estos casos, te lo diremos directamente. Preferimos ayudarte a encontrar el proceso correcto antes que aceptar un pedido que vaya a decepcionar."
      },
      {
        heading: "Cómo elegir la tecnología para tu proyecto",
        body: "Empieza por los requisitos funcionales, no por la tecnología:\n\n1. ¿Para qué es la pieza? ¿Carga estructural, exposición visual, sellado flexible, geometría interna compleja?\n2. ¿Qué acabado superficial es aceptable? ¿Las líneas de capa son tolerables, o se requiere liso?\n3. ¿Cuál es el entorno de operación? ¿Interior, exterior, expuesto al calor, al impacto?\n4. ¿Cuál es el presupuesto y el plazo?\n\nPara la mayoría de piezas funcionales — prototipos, recambios, soportes, carcasas, atrezo, utillajes — el FDM cubre el requisito bien, al menor coste y con el plazo más rápido. Si tus respuestas a las preguntas anteriores apuntan a la calidad superficial como requisito principal, a geometría compleja sin soporte, o a propiedades mecánicas completamente isotrópicas, describe esos requisitos explícitamente al solicitar presupuesto. Te daremos una recomendación honesta, incluyendo si esa recomendación apunta a otro proveedor o tecnología."
      },
    ],
    faqs: [
      { q: "¿Es la impresión FDM de menor calidad que la SLA?", a: "No en general — depende de qué se entiende por calidad. La SLA produce un detalle superficial más fino, lo que es relevante para joyería, modelos dentales y miniaturas de exposición. El FDM produce piezas funcionales más resistentes en un rango más amplio de materiales técnicos. Para piezas de carga, resistentes al calor o duraderas en exterior, el FDM supera típicamente a la SLA. Para calidad de superficie de exposición sin postprocesado, la SLA es mejor. 'Mayor calidad' depende por completo de la aplicación." },
      { q: "¿Podéis producir piezas en SLA o SLS?", a: "No — nos especializamos en FDM. Creemos que el FDM es la tecnología correcta para la mayoría de aplicaciones prácticas, y somos honestos cuando no lo es. Si el requisito principal de tu proyecto es muy alta calidad superficial (SLA) o geometría compleja sin soporte a bajo volumen (SLS/MJF), te lo diremos y te orientaremos hacia alternativas adecuadas antes que aceptar un pedido que no te sirva bien." },
      { q: "¿Cómo se ven las líneas de capa en piezas FDM?", a: "Las líneas de capa son visibles en piezas FDM sin acabar — es una propiedad inherente del proceso, no un problema de calidad. A la altura de capa estándar de 0,2 mm, las líneas se aprecian en inspección cercana. A 0,1 mm (modo fino), son mucho más sutiles. El postprocesado (lijado con grano progresivamente más fino y luego imprimado) puede producir una superficie casi lisa. Si la pieza es funcional y no estética, las líneas de capa no afectan al rendimiento." },
      { q: "¿Es el FDM suficientemente resistente para piezas funcionales y de carga?", a: "Sí, para la gran mayoría de aplicaciones funcionales. Con un relleno estándar del 20–25%, las piezas FDM manejan cargas cotidianas de forma fiable. Para aplicaciones más exigentes, el relleno puede aumentarse, el número de paredes incrementarse o elegir un material de mayor rendimiento (PETG, ABS, Nylon o variantes CF). La salvedad estructural es la anisotropía en el eje Z — las piezas son algo más débiles en la dirección vertical de impresión que en XY. Para la mayoría de piezas esto es manejable con orientación; para piezas que deben ser isotrópicas en todas las direcciones, SLS/MJF es la tecnología más adecuada." },
      { q: "¿Por qué no ofrecéis impresión en resina o SLS?", a: "Nos centramos en FDM porque cubre la amplia mayoría de aplicaciones prácticas de impresión 3D mejor que cualquier alternativa individual — a menor coste, con un rango de materiales más amplio y a mayores volúmenes de construcción. Ofrecer SLA y SLS requeriría equipamiento separado, conocimiento específico y cadenas de suministro distintas, y diluiría el foco en lugar de mejorar el resultado para la mayoría de clientes. Preferimos hacer una tecnología bien y ser honestos cuando otra es la respuesta correcta." },
      { q: "¿Qué tecnología es más rentable para tiradas pequeñas de producción?", a: "El FDM es casi siempre el más rentable para tiradas pequeñas y medianas de piezas funcionales. El coste por pieza es bajo, no hay pedido mínimo y iterar en el diseño entre impresiones cuesta solo material y tiempo de máquina. SLS/MJF se vuelve competitivo a volúmenes más altos donde el coste por pieza baja por la utilización completa de la cama. La SLA es relativamente cara por pieza y se justifica principalmente por requisitos de calidad superficial, no por economía de volumen." },
    ],
    galleryImages: pick("purple-detail.jpg", "purple-figures.jpg", "intake-manifold.jpg", "curved-parts.jpg", "lion-king-figures.jpg", "stranger-things-diorama.jpg"),
    related: [
      { label: "Comparativa de Materiales", slug: "/comparativa-materiales-impresion-3d" },
      { label: "Comparativa de Plazos", slug: "/comparativa-plazos-impresion-3d" },
      { label: "Guía Completa de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Cómo Preparar tu Archivo", slug: "/como-preparar-archivo-impresion-3d" },
      { label: "Precios Transparentes", slug: "/precio-impresion-3d-barcelona" },
      { label: "Mejor Servicio Según Uso", slug: "/mejor-servicio-impresion-3d-barcelona" },
    ],
    schemaServiceName: "Comparativa de Tecnologías de Impresión 3D",
    datePublished: "2026-09-03",
    dateModified: "2026-09-03",
  },

  // ----- TIRADAS CORTAS -----
  {
    slug: "/tiradas-cortas-impresion-3d-barcelona",
    topic: "short-run",
    altSlug: "/short-run-3d-printing-barcelona",
    lang: "es",
    category: "use-case",
    metaTitle: "Tiradas Cortas de Impresión 3D en Barcelona",
    metaDescription: "Tiradas cortas de piezas 3D en Barcelona: desde 1 hasta varios cientos de unidades idénticas. Sin pedido mínimo. Presupuesto en 1 h, desde 10€.",
    h1: "Tiradas Cortas de Impresión 3D en Barcelona — Producción en Lote Sin Configuración",
    intro: "La producción en tirada corta se sitúa entre un prototipo único y una fabricación en serie: necesitas más de una pieza, pero no miles. En Dimension3D gestionamos lotes desde una sola unidad hasta varios cientos de piezas idénticas con el mismo plazo y calidad de material que un pedido de prototipo. Pedido mínimo de 10 €, sin tarifa de configuración, factura incluida para pedidos de empresa.",
    sections: [
      {
        heading: "Por qué el FDM es práctico para tiradas cortas",
        body: "El FDM es adecuado para producción en tirada corta porque no hay coste de utillaje: el mismo archivo que imprime una unidad imprime cincuenta, con un coste unitario que escala con material y tiempo de máquina en lugar de coste de molde amortizado. Esto significa que puedes comenzar una tirada de diez piezas, validarlas en uso y repetir el pedido con parámetros modificados sin penalización económica.\n\nEl límite práctico de un solo lote en nuestra Bambu Lab X2D es de unas 50–80 piezas pequeñas por placa, según la geometría. Las piezas más grandes o lotes de geometría mixta requieren varias placas y se programan en sesiones consecutivas. Presupuestamos el coste unitario por tramo de cantidad para que puedas ver exactamente dónde cambia la economía."
      },
      {
        heading: "Materiales para lotes de producción",
        body: "Para la mayoría de la producción en tirada corta recomendamos PETG o ASA como base. Ambos son más duraderos que el PLA en condiciones reales, se adaptan a entornos exteriores o de calor, y están disponibles en varios colores. El PLA es adecuado para lotes de uso puramente interior y no estructural. Para lotes de grado técnico bajo carga mecánica o a temperaturas elevadas, Nylon PA12 o Nylon-CF son la opción correcta.\n\nEl coste por unidad de un lote pequeño en PLA puede ser de 1–3 € según el tamaño; el PETG y el ASA son un 10–30% más caros por gramo. Las variantes de Nylon y CF llevan un precio base más alto. Todos los presupuestos incluyen un desglose claro del coste unitario por tramo de cantidad."
      },
      {
        heading: "Del prototipo al lote: mismo proveedor",
        body: "Un flujo de trabajo habitual: prototipar una o dos piezas, validar el ajuste y la función, luego pedir el lote completo con el mismo archivo y parámetros. Guardamos los ajustes de impresión validados para que los pedidos repetidos se gestionen en minutos. Para pedidos recurrentes (reposiciones semanales o mensuales), podemos configurar un acuerdo de pedido repetido con plazos consistentes.\n\nLos clientes empresariales reciben factura en cada pedido. Los NDAs se firman bajo petición como estándar para cualquier proyecto B2B. Para una visión completa de nuestra oferta para empresas, consulta la página de impresión 3D para empresas."
      },
    ],
    faqs: [
      { q: "¿Cuál es el pedido mínimo para una tirada?", a: "10 € por pedido, sin tarifa de configuración. No hay un número mínimo de piezas: si una pieza cuesta 10 €, ese es un pedido válido. Si necesitas 100 piezas de 0,50 € cada una, el mínimo de 10 € se aplica una sola vez por pedido." },
      { q: "¿Cuánto tarda una tirada corta?", a: "Depende del volumen total. Una tirada de 10–20 piezas pequeñas generalmente se completa en el plazo estándar (2–5 días laborables). Tiradas más grandes de 50–200 piezas se programan en múltiples sesiones y tardan 3–7 días laborables según la cola. Los niveles express y urgente están disponibles para tiradas pequeñas." },
      { q: "¿Podéis dividir una tirada en diferentes colores o materiales?", a: "Sí. Cada cambio de material o color requiere un pequeño paso de configuración, que se refleja en un pequeño coste adicional. Para tiradas mixtas, solicita un presupuesto con la división especificada y confirmaremos viabilidad y coste antes de comprometernos." },
      { q: "¿Proporcionáis facturas para pedidos de empresa?", a: "Sí. Cada pedido recibe factura. Para pedidos B2B con requisitos de facturación específicos (referencia de proyecto, centro de coste, número de pedido), indícalo al pedir y lo gestionamos." },
      { q: "¿Qué tolerancias puedo esperar en las piezas del lote?", a: "±0,2 mm en la mayoría de dimensiones a la altura de capa estándar de 0,2 mm. Todas las piezas de un lote usan parámetros idénticos, por lo que la consistencia entre piezas es alta. Para superficies de acoplamiento o ajustes por apriete, prototipa y mide antes de pedir el lote completo." },
      { q: "¿Guardáis mis archivos para pedidos repetidos?", a: "Sí. Guardamos los archivos de impresión validados para clientes con pedidos repetidos. Los reencargos se gestionan en minutos. Para pedidos recurrentes (cadencia semanal o mensual), podemos configurar un slot de prioridad." },
    ],
    galleryImages: pick("intake-manifold.jpg", "custom-brackets.jpg", "blue-molds.jpg", "curved-parts.jpg", "red-adapter.jpg", "black-intake.jpg"),
    related: [
      { label: "Impresión 3D para Empresas Barcelona", slug: "/impresion-3d-empresas-barcelona" },
      { label: "Prototipado Rápido Barcelona", slug: "/prototipado-rapido-barcelona" },
      { label: "Comparativa de Materiales", slug: "/comparativa-materiales-impresion-3d" },
      { label: "Piezas Funcionales Barcelona", slug: "/piezas-funcionales-barcelona" },
      { label: "Precios Transparentes", slug: "/precio-impresion-3d-barcelona" },
      { label: "Impresión 3D en Barcelona", slug: "/" },
    ],
    schemaServiceName: "Tiradas Cortas de Impresión 3D Barcelona",
    datePublished: "2026-10-11",
    dateModified: "2026-10-11",
  },

  // ── NEW MONEY PAGES (Nov 2026) ──────────────────────────────────────────

  {
    slug: "/precio-impresion-3d",
    topic: "pricing-national",
    altSlug: "/precio-impresion-3d-barcelona",
    lang: "es",
    category: "service",
    metaTitle: "Precio Impresión 3D — Calcula tu Pieza desde 10€",
    metaDescription: "¿Cuánto cuesta imprimir en 3D? Tabla de precios reales por material y tamaño, calculadora instantánea. Desde 10€, envío a España por 5,90€.",
    h1: "¿Cuánto cuesta imprimir en 3D? Precios reales y calculadora",
    intro: "Dimension3D cobra desde 10 € por pedido, el presupuesto llega en menos de 1 hora y el envío a cualquier punto de España cuesta 5,90 €. El precio final depende del material elegido, el tamaño de la pieza y el plazo. Esta página explica exactamente cómo se calcula, con ejemplos reales y una tabla de precios por material.",
    sections: [
      {
        heading: "¿Qué determina el precio de una impresión 3D?",
        body: "Tres factores principales marcan el coste:\n\n**1. Material** — el plástico más económico es el PLA. PETG y TPU tienen un pequeño recargo. Nylon y materiales con fibra de carbono son los más premium.\n**2. Tamaño y tiempo de máquina** — una pieza más grande usa más material y ocupa la impresora más horas. Las piezas pequeñas (5–30 g) a menudo se agrupan en la misma cama para reducir el tiempo por unidad.\n**3. Plazo** — el servicio estándar (2–5 días hábiles) es el más económico. El servicio Express (1–2 días) lleva un recargo del 25%. El servicio Urgente (mismo día) lleva un recargo del 60%.\n\nEl precio incluye siempre: revisión del archivo, laminado, material, tiempo de máquina y acabado básico (retirada de soportes, limpieza). No hay setup fee ni cargo por pieza."
      },
      {
        heading: "Cómo se calcula: material + tiempo de máquina",
        body: "El precio en Dimension3D se calcula como: (material 0,055 €/g × gramos + tiempo de máquina 4,95 €/h las primeras 3 h, 3,85 €/h hasta 8 h, 2,75 €/h a partir de ahí) × multiplicador del material. El multiplicador se aplica tanto al material como al tiempo de máquina. Sin setup fee ni cargo por preparación. El mínimo de 10 € se aplica una sola vez al pedido completo, no por pieza.\n\n• **PLA** — multiplicador ×1,0. El favorito para decoración, figuras, prototipos de forma y piezas sin carga mecánica.\n• **PETG** — multiplicador ×1,1. Resistente a la humedad y al exterior. Ideal para soportes, piezas de coche, exteriores.\n• **ABS / ASA** — multiplicador ×1,3. Resistente al calor (hasta ~90°C). ASA aguanta UV y exterior mejor que ABS.\n• **TPU** — multiplicador ×1,3. Flexible y resistente al impacto. Perfecto para juntas, fundas y piezas que absorben golpes.\n• **Nylon** — multiplicador ×1,4. Alta resistencia mecánica y al desgaste. Para piezas funcionales de ingeniería.\n\nUna pieza pequeña de 30 g en PLA con 30 min de máquina sale a 1,65 € de material + 2,48 € de tiempo = 4,13 €; como es menos de 10 €, el pedido sale a 10 €. Usa la calculadora de arriba para ver el precio exacto de tu pieza."
      },
      {
        heading: "Tabla de ejemplos reales de precio",
        body: "Estos precios salen directamente de nuestro motor de precios con los gramos y horas indicados (PLA salvo indicación, calidad estándar, sin urgencia, sin envío):\n\n• **Clip de cajón roto** (5 g, 0,5 h): 10,00 € (mínimo).\n• **Soporte para estantería** (25 g, 1,5 h): 10,00 € (mínimo).\n• **Adaptador VESA de monitor** (40 g, 2 h): 12,10 €.\n• **Figura decorativa mediana** (90 g, 5 h): 27,50 €.\n• **Pieza de recambio lavaplatos** (35 g PETG, 1,5 h): 10,29 €.\n• **Prototipo funcional mediano** (150 g PETG, 7 h): 42,35 €.\n• **Figura grande / casco decorativo** (350 g, 16 h): 75,35 €.\n\nPara piezas con geometría compleja, muchos soportes o materiales especiales, el presupuesto puede salir más alto. Súbe tu archivo para ver el precio exacto."
      },
      {
        heading: "Envío a España y recogida en Barcelona",
        body: "El envío estándar a cualquier punto de la Península, Baleares o Canarias cuesta 5,90 €. Los pedidos salen en 24–48 horas desde que se confirma el encargo, y el tiempo de tránsito es de 1–2 días laborables para Península.\n\nSi estás en Barcelona o alrededores (Les Corts, L'Hospitalet, Esplugues, Sant Just, Cornellà, Badalona, Sant Cugat) puedes recoger sin coste de envío con cita previa en Les Corts."
      },
      {
        heading: "¿Cómo hacer más barata tu impresión?",
        body: "Estos ajustes bajan el precio sin comprometer la calidad para la mayoría de usos:\n\n• **Elige PLA si no es para exterior ni calor** — es el material más económico y más que suficiente para el 70% de los pedidos.\n• **Reduce el relleno al 15–20%** — el relleno estándar para piezas decorativas o no estructurales puede ser del 10–15%.\n• **Ajusta la calidad a 'estándar'** — la capa de 0,20 mm da un acabado excelente a menor tiempo que calidad fina.\n• **Pide en plazo estándar** — el recargo Express es del 25% y el Urgente del 60%.\n• **Agrupa varias piezas en un pedido** — las piezas comparten cama de impresión, lo que reduce el tiempo de máquina por pieza.\n• **Si pagas el diseño, pide un archivo optimizado** — un modelo mal orientado o con exceso de soportes puede costar el doble que el mismo diseño bien preparado."
      },
      {
        heading: "Diseño y modelado 3D: coste adicional",
        body: "Si no tienes el archivo 3D, Dimension3D puede diseñarlo. El coste de diseño depende de la complejidad de la pieza y se cotiza por separado. Siempre se confirma antes de comenzar. Envíanos una foto o descripción por WhatsApp y te damos un precio en menos de 1 hora."
      },
    ],
    faqs: [
      { q: "¿Cuánto cuesta imprimir en 3D en España?", a: "En Dimension3D el mínimo es 10 € por pedido. Piezas pequeñas estándar (5–30 g en PLA) suelen salir entre 10 y 18 €. Piezas medianas (50–150 g) entre 20 y 50 €. El envío a España cuesta 5,90 €." },
      { q: "¿Cuánto cuesta imprimir en 3D por gramo?", a: "El precio final depende del material, el tamaño y el plazo. Sube tu archivo a la calculadora de esta página para ver el precio exacto en segundos." },
      { q: "¿Hay tarifa de setup o pedido mínimo?", a: "No hay tarifa de setup. El pedido mínimo es 10 € por pedido. Puedes pedir una sola pieza sin coste extra." },
      { q: "¿Cuánto tarda el servicio Express?", a: "El servicio Express sale en 24–48h desde la confirmación del pedido y lleva un recargo del 25%. El servicio Urgente (mismo día o siguiente) lleva un recargo del 60% y no está disponible para todos los materiales." },
      { q: "¿Cómo obtengo un presupuesto exacto?", a: "Sube tu archivo STL, 3MF, OBJ o STEP en la calculadora de esta página. El precio aparece en segundos. Para piezas sin archivo, envíanos una foto por WhatsApp y te respondemos en menos de 1 hora en horario laboral." },
      { q: "¿El precio incluye el IVA?", a: "Los precios mostrados en la calculadora son sin IVA. El IVA (21% para particulares en España) se añade en el checkout." },
      { q: "¿Podéis hacer descuento por volumen?", a: "Sí. Las tiradas de 5 piezas o más iguales se benefician de precio por unidad más bajo porque la preparación se amortiza. Para tiradas de 50 piezas o más, pide presupuesto por WhatsApp." },
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "red-adapter.jpg", "blue-molds.jpg", "curved-parts.jpg", "black-intake.jpg"),
    related: [
      { label: "Precio Impresión 3D Barcelona (recogida)", slug: "/precio-impresion-3d-barcelona" },
      { label: "Impresión 3D Online — Envío a España", slug: "/impresion-3d-online" },
      { label: "Impresión 3D Cerca de Mí", slug: "/impresion-3d-cerca-de-mi" },
      { label: "Comparativa de Materiales", slug: "/comparativa-materiales-impresion-3d" },
      { label: "Impresión 3D Multicolor", slug: "/impresion-3d-multicolor" },
      { label: "Piezas Funcionales Barcelona", slug: "/piezas-funcionales-barcelona" },
    ],
    schemaServiceName: "Impresión 3D — Precio Nacional",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
    comparisonTable: {
      caption: "Material + tiempo de máquina según material (tarifa de las primeras 3 h; baja a partir de 3 h y 8 h). Mínimo 10 € por pedido. (Dimension3D, Nov 2026)",
      headers: ["Material", "Material + máquina", "Temperatura máx.", "Exterior", "Flexible", "Uso típico"],
      rows: [
        ["PLA",     "0,055 €/g + 4,95 €/h", "55°C",   "No",  "No",  "Prototipos, decoración, figuras"],
        ["PETG",    "0,061 €/g + 5,45 €/h", "75°C",   "Sí",  "No",  "Piezas funcionales, exterior, humedad"],
        ["ABS",     "0,072 €/g + 6,44 €/h", "90°C",   "No",  "No",  "Piezas de alta temperatura interior"],
        ["ASA",     "0,072 €/g + 6,44 €/h", "90°C",   "Sí",  "No",  "Exterior UV, automoción"],
        ["TPU",     "0,072 €/g + 6,44 €/h", "80°C",   "Sí",  "Sí",  "Juntas, fundas, amortiguación"],
        ["Nylon",   "0,077 €/g + 6,93 €/h", "90°C",   "No",  "No",  "Alta resistencia mecánica, desgaste"],
      ],
    },
  },

  {
    slug: "/impresion-3d-online",
    topic: "online-service",
    altSlug: "/3d-printing-service",
    lang: "es",
    category: "service",
    metaTitle: "Impresión 3D Online — Envío a Toda España desde 10€",
    metaDescription: "Servicio de impresión 3D online sin pedido mínimo. Sube STL, 3MF, OBJ o STEP, recibe precio en 1h, envío a toda España por 5,90€. Desde 10€.",
    h1: "Impresión 3D online, sin pedido mínimo y con envío a casa",
    intro: "Dimension3D es un servicio de impresión 3D online desde Barcelona. Sube tu archivo, recibe un precio en menos de 1 hora, y recibe la pieza en casa en 2–5 días laborables en cualquier punto de España. Pedido mínimo 10 €, sin setup fee, y un humano revisa cada pedido antes de imprimir.",
    sections: [
      {
        heading: "¿Cómo funciona el pedido online?",
        body: "El proceso tiene cuatro pasos y no requiere registro previo:\n\n**1. Sube tu archivo** — STL, 3MF, OBJ o STEP. La calculadora te muestra el precio estimado de inmediato.\n**2. Confirma los detalles** — material, color, cantidad y plazo. Si tienes dudas, escríbenos por WhatsApp.\n**3. Revisión humana** — antes de imprimir, revisamos el archivo: grosor de pared, voladizos, orientación óptima. Si hay algún problema te avisamos antes de cobrar.\n**4. Impresión y envío** — imprimimos tu pieza y la enviamos por mensajería urgente. Recibes un número de seguimiento cuando sale."
      },
      {
        heading: "Formatos de archivo aceptados",
        body: "Aceptamos los formatos más habituales de CAD y diseño 3D:\n\n• **STL** — el estándar universal, compatible con cualquier software de modelado.\n• **3MF** — el formato moderno de Bambu Studio, PrusaSlicer y otros slicers. Incluye color y materiales.\n• **OBJ** — habitual en diseño artístico, juegos y escaneos 3D.\n• **STEP / STP** — el formato profesional de ingeniería: más preciso que STL para piezas técnicas.\n\n¿No tienes archivo? No es un problema. Mándanos una foto de la pieza que necesitas (con una regla o moneda como referencia) y en menos de 1 hora en horario laboral te confirmamos si podemos reproducirla y el precio."
      },
      {
        heading: "Sin archivo: diseñamos tu pieza",
        body: "Muchos de nuestros clientes no tienen archivo 3D. Lo resolvemos de tres formas:\n\n• **Foto + medidas**: para recambios, copias de piezas rotas o piezas sencillas. Manda una foto clara con una referencia de tamaño.\n• **Croquis o planos**: si tienes un dibujo técnico, lo modelamos.\n• **Descripción**: para piezas estándar (soportes, adaptadores, organizadores), descríbenos qué necesitas y lo modelamos desde cero.\n\nEl diseño se cotiza por separado y siempre se confirma antes de empezar. El coste de diseño oscila entre 20 € para piezas sencillas y 120 € para piezas complejas."
      },
      {
        heading: "Materiales disponibles online",
        body: "Todos nuestros materiales están disponibles para pedidos online:\n\n• **PLA** — el más económico. Perfecto para prototipos de forma, figuras y decoración.\n• **PETG** — resistente al exterior, la humedad y el calor moderado. Nuestra recomendación para piezas funcionales.\n• **ABS / ASA** — para piezas con exposición al calor o UV exterior (ASA es mejor que ABS para exterior).\n• **TPU** — flexible y resistente al impacto. Para juntas, fundas y protecciones.\n• **Nylon** — alta resistencia mecánica. Para piezas de ingeniería y desgaste.\n\nTambién trabajamos con Nylon-CF y PETG-CF bajo presupuesto personalizado."
      },
      {
        heading: "Plazos de entrega por zona",
        body: "Los plazos son orientativos desde la confirmación del pedido:\n\n• **Barcelona y área metropolitana**: envío en D+1–2, llegada en D+2–3 (posible recogida misma jornada).\n• **Resto de Península**: impresión 2–5 días hábiles + 1–2 días de tránsito.\n• **Baleares**: igual que Península + 1 día de tránsito adicional.\n• **Canarias**: 2–3 días de tránsito adicionales.\n• **UE (zona euro)**: envío disponible. Consultar plazos por país.\n\nEl servicio Express reduce el plazo de producción a 24–48h con un recargo del 25%."
      },
      {
        heading: "Comparación con las grandes plataformas online",
        body: "Las grandes plataformas de impresión 3D online automatizadas tienen ventajas claras: capacidad infinita, algoritmos de precio instantáneo y varias tecnologías (SLS, MJF, resina). Pero tienen limitaciones:\n\n• No hay nadie que revise si tu archivo tiene problemas antes de imprimir.\n• No ofrecen ayuda con el diseño si no tienes archivo.\n• El precio mínimo suele ser mucho más alto que 10 €.\n• El soporte es por ticket, no por WhatsApp con una respuesta en minutos.\n\nDimension3D es un estudio pequeño y experto. Revisamos cada pedido manualmente, damos soporte por WhatsApp en castellano, catalán, inglés y polaco, y el mínimo es 10 € sin setup fee."
      },
    ],
    faqs: [
      { q: "¿Puedo pedir una sola pieza online?", a: "Sí. El pedido mínimo es de 10 € por pedido, sin mínimo por unidad. Imprimimos piezas únicas constantemente." },
      { q: "¿Qué pasa si mi archivo tiene problemas?", a: "Revisamos el archivo antes de imprimir. Si hay problemas de grosor de pared, voladizos problemáticos u otros errores, te lo comunicamos antes de cobrar y sugerimos soluciones." },
      { q: "¿Podéis imprimir un modelo descargado de Makerworld, Printables o Cults3D?", a: "Sí. Si has descargado un modelo gratuito de cualquier plataforma y quieres que lo imprimamos, súbe el archivo STL directamente. Verificamos que sea imprimible y te damos precio." },
      { q: "¿Cuánto cuesta el envío a España?", a: "5,90 € por pedido a cualquier punto de Península, Baleares o Canarias. Los pedidos que superen cierto importe tienen envío gratuito (ver calculadora)." },
      { q: "¿Podéis imprimir en varios colores en una sola pieza?", a: "Sí. Nuestra Bambu Lab X2D con AMS permite hasta 4 colores en una misma pieza. Consulta nuestra página de impresión 3D multicolor para más detalles." },
      { q: "¿Aceptáis pedidos urgentes online?", a: "Sí. Al pedir puedes seleccionar el plazo Express (recargo 25%) o Urgente (recargo 60%). Los pedidos urgentes se gestionan en horario laboral y tienen disponibilidad limitada." },
      { q: "¿Sois un servicio online o físico?", a: "Los dos. Podemos enviar a toda España y Europa. Si estás en Barcelona, también puedes recoger con cita previa en Les Corts." },
    ],
    galleryImages: pick("custom-brackets.jpg", "curved-parts.jpg", "intake-manifold.jpg", "red-adapter.jpg", "blue-molds.jpg", "black-intake.jpg"),
    related: [
      { label: "Precio Impresión 3D — Calculadora", slug: "/precio-impresion-3d" },
      { label: "Impresión 3D Cerca de Mí", slug: "/impresion-3d-cerca-de-mi" },
      { label: "Impresión 3D Multicolor", slug: "/impresion-3d-multicolor" },
      { label: "Piezas Personalizadas 3D Barcelona", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Impresión 3D Urgente Barcelona", slug: "/impresion-3d-urgente-barcelona" },
      { label: "Recambios Impresión 3D", slug: "/recambios-impresion-3d-barcelona" },
    ],
    schemaServiceName: "Impresión 3D Online — Envío España",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
    extraHreflang: [
      { lang: "fr", slug: "/fr/impression-3d-en-ligne" },
      { lang: "it", slug: "/it/stampa-3d-online" },
      { lang: "nl", slug: "/nl/3d-printen-laten-maken" },
      { lang: "pt", slug: "/pt/impressao-3d-online" },
    ],
  },

  {
    slug: "/impresion-3d-multicolor",
    topic: "multicolor",
    altSlug: "/3d-printing-service",
    lang: "es",
    category: "service",
    metaTitle: "Impresión 3D Multicolor — Hasta 4 Colores por Pieza",
    metaDescription: "Impresión 3D multicolor FDM con Bambu Lab X2D + AMS. Hasta 4 colores en una pieza. Logos, señalética, figuras, placas. Envío a toda España desde 5,90€.",
    h1: "Impresión 3D Multicolor: logos, figuras y piezas en varios colores",
    intro: "Dimension3D imprime en varios colores en una misma pieza gracias a la Bambu Lab X2D con sistema AMS (Automatic Material System). Podemos combinar hasta 4 colores de PLA o PETG en un solo objeto, sin pintar ni pegar. Perfecto para logos, señalética, placas personalizadas, figuras y prototipos con partes codificadas por color.",
    sections: [
      {
        heading: "¿Qué es la impresión 3D multicolor FDM?",
        body: "La impresión 3D multicolor FDM (Fused Deposition Modeling) usa una impresora equipada con un sistema de cambio automático de filamento — en nuestro caso, el AMS (Automatic Material System) de Bambu Lab. La máquina puede cambiar entre hasta 4 bobinas de filamento durante la misma impresión, deposibando cada color exactamente donde debe ir.\n\nEl resultado es una pieza compacta y de una sola vez, sin juntas, sin pegar partes por separado y sin pintura manual. Los colores son sólidos en toda la sección de la pieza, no solo en la superficie."
      },
      {
        heading: "¿Para qué es ideal la impresión multicolor?",
        body: "Las aplicaciones más habituales:\n\n• **Logos y señalética** — texto o icono en un color diferente al fondo. Ideal para placas de empresa, letreros para ferias o decoración de oficina.\n• **Placas personalizadas** — nombre, número de habitación, placa de mascota, dirección. El texto sobresale en un color contrastante.\n• **Figuras y coleccionables** — personajes con ropa de varios colores, dragones bicolor, esculturas multicolor.\n• **Llaveros y accesorios** — diseños bicolor con detalle fino.\n• **Prototipos con partes codificadas** — donde los ingenieros usan colores para identificar partes del ensamblaje a simple vista.\n• **Maquetas y maquetas arquitectónicas** — elementos diferenciados por color sin postprocesado."
      },
      {
        heading: "Límites por pieza y preparación del archivo",
        body: "Algunas consideraciones técnicas antes de pedir:\n\n• **Máximo 4 colores por pieza** con el AMS actual. Para más colores necesitarías pintura o piezas ensambladas.\n• **El residuo de purga** — al cambiar de color, la impresora purga unos gramos de filamento de transición. Esto tiene un pequeño coste adicional (~2–5 € por cambio de color activo) que se refleja en el presupuesto.\n• **El archivo** — necesitas un fichero 3MF con los cuerpos pintados por color (compatible con Bambu Studio, PrusaSlicer o OrcaSlicer), o un archivo STL con cuerpos separados por color. No basta con un STL único pintado solo en la visualización.\n• **Resolución mínima** — las transiciones de color son al nivel de capa (0,20 mm). Los detalles muy finos (<0,8 mm de ancho) pueden no reproducirse con precisión en color."
      },
      {
        heading: "¿Cuánto cuesta la impresión multicolor?",
        body: "El precio se calcula igual que cualquier pieza, con dos añadidos:\n\n1. El **recargo por purga** (~2–5 € por cambio de color activo, dependiendo del volumen de purga).\n2. Algo más de **tiempo de máquina**, porque los cambios de filamento añaden minutos.\n\nUna placa pequeña bicolor (8×5 cm) suele costar entre 15 y 22 € todo incluido. Una figura mediana con 3–4 colores puede costar entre 30 y 60 € según el tamaño. Sube tu archivo 3MF o STL multicolor para obtener un precio exacto."
      },
      {
        heading: "Materiales disponibles en multicolor",
        body: "Para impresión multicolor usamos principalmente:\n\n• **PLA** — disponible en la gama más amplia de colores y acabados (mate, seda, metalizado, fluorescente). La opción estándar para cualquier pieza decorativa o no estructural.\n• **PETG** — para multicolor en piezas funcionales que necesitan algo más de resistencia o exposición al exterior.\n\nLa combinación de materiales diferentes en la misma impresión (p.ej. PLA + TPU) no es posible con el sistema AMS actual — todos los colores deben ser del mismo tipo de material."
      },
    ],
    faqs: [
      { q: "¿Cuántos colores puedo tener en una misma pieza?", a: "Hasta 4 colores con nuestro sistema AMS actual. Para más colores, habría que pintar manualmente o ensamblar piezas por separado." },
      { q: "¿Puedo mezclar PLA y PETG en la misma pieza multicolor?", a: "No. Todos los filamentos en una impresión multicolor deben ser del mismo tipo de material (todos PLA o todos PETG) para que las temperaturas de impresión sean compatibles." },
      { q: "¿Cómo preparo el archivo para multicolor?", a: "La forma más fácil es con Bambu Studio o PrusaSlicer: importas el modelo, usas la herramienta de pintura para asignar colores por zona y exportas como 3MF. También puedes enviarnos STLs separados por cuerpo/color y nosotros hacemos el montaje." },
      { q: "¿Podéis imprimir un logo en mi pieza?", a: "Sí. Podemos añadir un logo en relieve y en color diferente a una pieza existente. Mándanos tu pieza en STL y el logo en SVG o como referencia, y hacemos la adaptación del modelo." },
      { q: "¿La impresión multicolor es más cara que la monocolor?", a: "Ligeramente. El recargo principal es el residuo de purga (~2–5 € por cambio de color activo). El resto del cálculo es igual que una pieza normal." },
      { q: "¿Tenéis muestras de colores disponibles?", a: "Sí. Mándanos un WhatsApp y te enviamos una foto de los colores actuales disponibles en PLA y PETG." },
      { q: "¿Es posible imprimir una figura de varios colores a partir de una foto?", a: "Para figuras bicolor sencillas (siluetas, placas con nombre, escudos) sí podemos partir de una referencia. Para figuras complejas con degradados o muchos colores se necesita un modelo 3D preparado." },
    ],
    galleryImages: pick("lion-king-figures.jpg", "lion-king-scene.jpg", "halloween-set.jpg", "stranger-things-diorama.jpg", "purple-figures.jpg", "cookie-cutters.jpg"),
    related: [
      { label: "Impresión 3D Online — Pide Ahora", slug: "/impresion-3d-online" },
      { label: "Piezas Personalizadas 3D", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Catálogo de Productos", slug: "/catalogo" },
      { label: "Precio Impresión 3D", slug: "/precio-impresion-3d" },
      { label: "Materiales PLA Barcelona", slug: "/impresion-pla-barcelona" },
    ],
    schemaServiceName: "Impresión 3D Multicolor FDM",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
  },

  {
    slug: "/impresion-3d",
    topic: "pillar",
    altSlug: "/3d-printing-service",
    lang: "es",
    category: "service",
    metaTitle: "Impresión 3D FDM — Servicio Online desde 10€, Envío España",
    metaDescription: "Qué es la impresión 3D FDM, materiales disponibles, precios reales y cómo pedir online. Envío a toda España. Desde 10€, presupuesto en 1h.",
    h1: "Impresión 3D: todo lo que necesitas saber para imprimir tu pieza",
    intro: "Dimension3D es un servicio de impresión 3D en Barcelona con envío a toda España y Europa. Fabricamos piezas a medida, prototipos, recambios y objetos decorativos usando tecnología FDM en materiales como PLA, PETG, TPU, ABS/ASA y Nylon. El pedido mínimo es 10 €, el presupuesto llega en menos de 1 hora y el envío cuesta 5,90 €.",
    sections: [
      {
        heading: "¿Qué es la impresión 3D y cómo funciona?",
        body: "La impresión 3D (también llamada fabricación aditiva) construye objetos físicos capa a capa a partir de un archivo digital. En lugar de tallar o moldear el material, lo deposita exactamente donde hace falta.\n\nLa tecnología más usada en nuestro estudio es la **FDM (Fused Deposition Modeling)**: la máquina funde un filamento de plástico y lo deposita en capas de 0,15–0,30 mm de grosor. Las capas se funden entre sí formando una pieza sólida. El proceso es controlado por un fichero de instrucciones llamado G-code, generado por un software llamado slicer a partir de tu modelo 3D."
      },
      {
        heading: "Tipos de impresión 3D: FDM vs resina vs SLS",
        body: "FDM es la tecnología que usamos. ¿En qué se diferencia de las otras?\n\n• **FDM** — la más versatil y económica. Amplia gama de materiales técnicos (PETG, ABS, Nylon, TPU, CF). Ideal para prototipos funcionales, piezas mecánicas, recambios y producciones cortas. Acabado de capa visible pero aceptable para la mayoría de usos industriales y decorativos.\n• **Resina (SLA/MSLA)** — mayor resolución superficial y detalle fino. Excelente para joyería, figuras miniatura y piezas dentales. Más frágil mecánicamente y más cara. Piezas huecas frecuentes.\n• **SLS / MJF** — para series industriales, geometrías complejas sin soportes y materiales como Nylon 12. Mucho más cara. Para lotes de producción serios.\n\nPara la mayoría de los pedidos que recibimos — recambios, piezas funcionales, prototipos, decoración — FDM es la opción más práctica."
      },
      {
        heading: "¿Qué materiales usamos?",
        body: "Trabajamos con los plásticos FDM más habituales:\n\n• **PLA** — el más económico y fácil de imprimir. Perfecto para prototipos de forma, decoración, figuras. Sensible al calor (>55°C).\n• **PETG** — resistente a la humedad y al exterior, fácil de imprimir, buen equilibrio precio/resistencia. La recomendación para piezas funcionales.\n• **ABS / ASA** — más resistente al calor que PLA y PETG. ASA también resiste UV. Perfecto para piezas de coche y exteriores.\n• **TPU** — flexible y resistente al impacto. Fundas, juntas, ruedas, amortiguadores.\n• **Nylon** — alta resistencia mecánica y al desgaste. Engranajes, piezas de ingeniería, bisagras.\n• **Nylon-CF / PETG-CF** — reforzados con fibra de carbono, para piezas de alta resistencia estructural."
      },
      {
        heading: "¿Para qué se usa la impresión 3D?",
        body: "Las aplicaciones más frecuentes en nuestros 250+ pedidos:\n\n• **Recambios y piezas descatalogadas** — ruedas de lavavajillas, clips de coche, tiradores, guías, fijaciones.\n• **Prototipos** — validar forma, ajuste y función antes de producción en serie.\n• **Personalización** — logos, placas con nombre, keychains, decoración de hogar.\n• **Piezas funcionales** — soportes, adaptadores, herramientas, utillajes.\n• **Modelos y maquetas** — arquitectura, juegos de mesa, figuras.\n• **Tiradas cortas** — pequeños lotes de piezas para startups, talleres y clínicas."
      },
      {
        heading: "¿Cómo pedir una impresión 3D?",
        body: "El proceso es sencillo:\n\n1. **Sube tu archivo** (STL, 3MF, OBJ, STEP) en la calculadora. El precio aparece al instante.\n2. **Elige material, color, cantidad y plazo**.\n3. **Confirma el pedido** — un técnico revisa el archivo y te confirma en menos de 1 hora.\n4. **Recibe la pieza** — enviamos a toda España (5,90 €) o puedes recoger en Barcelona.\n\nSi no tienes archivo, mándanos una foto y medidas por WhatsApp. En la mayoría de casos podemos dar precio antes de crear el modelo."
      },
      {
        heading: "¿Cuánto cuesta imprimir en 3D?",
        body: "El mínimo es 10 € por pedido (sin setup fee ni cobro por número de piezas). Los precios varían según material, tamaño y plazo:\n\n• Piezas pequeñas (5–30 g): desde 10 €.\n• Piezas medianas (50–150 g): 20–50 €.\n• Piezas grandes (200–500 g): 60–150 €.\n\nEl envío a España cuesta 5,90 €. Para piezas especiales, multicolor o con diseño, el precio puede ser mayor. Consulta la calculadora o la página de precios para más detalle."
      },
    ],
    faqs: [
      { q: "¿Qué es la impresión 3D FDM?", a: "FDM (Fused Deposition Modeling) es la tecnología de impresión 3D más común. Funde un filamento de plástico y lo deposita capa a capa para construir un objeto sólido. Es la mejor opción para piezas funcionales, recambios y prototipos." },
      { q: "¿Cuánto tarda una impresión 3D?", a: "El tiempo depende del tamaño y la complejidad. Piezas pequeñas pueden imprimirse en 1–3 horas. Piezas grandes pueden tardar 12–24 horas. El plazo total de entrega (desde pedido hasta recepción) es de 2–7 días laborables." },
      { q: "¿Puedo pedir una pieza sin tener un archivo 3D?", a: "Sí. Si tienes una pieza rota, una foto y medidas, o una descripción de lo que necesitas, podemos modelar y imprimir la pieza. El diseño tiene un coste adicional según la complejidad." },
      { q: "¿Es la impresión 3D tan resistente como las piezas de fábrica?", a: "Depende del material y la aplicación. Piezas de PETG, ABS o Nylon pueden igualar o superar la resistencia de plásticos moldeados equivalentes. Para aplicaciones de alta carga o temperatura, te asesoramos sobre el material más adecuado." },
      { q: "¿Podéis imprimir en cualquier color?", a: "Tenemos una amplia gama de colores en PLA y PETG. Para colores exactos (Pantone o RAL), mándanos la referencia y la buscamos en nuestra gama. No hacemos mezcla de colores personalizados." },
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "red-adapter.jpg", "blue-molds.jpg", "lion-king-figures.jpg", "curved-parts.jpg"),
    related: [
      { label: "Precio Impresión 3D — Calculadora", slug: "/precio-impresion-3d" },
      { label: "Impresión 3D Online", slug: "/impresion-3d-online" },
      { label: "Impresión 3D Multicolor", slug: "/impresion-3d-multicolor" },
      { label: "Impresión 3D Cerca de Mí", slug: "/impresion-3d-cerca-de-mi" },
      { label: "Piezas Personalizadas 3D Barcelona", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Recambios Impresión 3D", slug: "/recambios-impresion-3d-barcelona" },
    ],
    schemaServiceName: "Impresión 3D FDM — Servicio Nacional",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
    comparisonTable: {
      caption: "Comparativa de tecnologías de impresión 3D (FDM vs resina vs SLS)",
      headers: ["Tecnología", "Materiales", "Detalle", "Resistencia", "Coste", "Mejor para"],
      rows: [
        ["FDM",   "PLA, PETG, ABS, TPU, Nylon", "Medio",   "Alta",   "€",    "Funcional, recambios, series"],
        ["Resina","Fotopolímero",                "Muy alta","Baja",   "€€",   "Joyería, dental, figuras finas"],
        ["SLS",   "Nylon 12, PA",               "Alta",    "Muy alta","€€€", "Series industriales, geometría compleja"],
      ],
    },
  },

  {
    slug: "/impresion-3d-cerca-de-mi",
    topic: "near-me",
    altSlug: "/3d-printing-service",
    lang: "es",
    category: "service",
    metaTitle: "Impresión 3D Cerca de Mí en Barcelona — Recoge o Envío",
    metaDescription: "Impresión 3D cerca de ti en Barcelona. Recoge en Les Corts (Rambla de Brasil 53) o envío a casa. Barrios: Eixample, Gràcia, Sarrià, Sants y más.",
    h1: "Impresión 3D cerca de ti en Barcelona — recogida en Les Corts o envío a tu puerta",
    intro: "Si buscas impresión 3D cerca de ti en Barcelona, Dimension3D está en el barrio de Les Corts, Rambla de Brasil 53. Podemos imprimir tu pieza y tenerla lista para recoger en el mismo día o enviarla a cualquier dirección de Barcelona y del resto de España. Pedido mínimo 10 € por pedido, sin mínimo por pieza ni por zona.",
    sections: [
      {
        heading: "Punto de recogida: Les Corts, Rambla de Brasil",
        body: "Nuestro punto de recogida con cita previa está en la Rambla de Brasil, 53 (08028 Barcelona), en el barrio de Les Corts, a 5 minutos andando del metro de Collblanc (L5) y de la Zona Universitaria (L3).\n\nA pie desde los barrios de Barcelona: 5–10 min desde Sants, Badal, La Bordeta y Can Vidalet. 10–15 min desde Esquerra de l'Eixample y Hostafrancs. Con transporte desde cualquier punto de Barcelona en 20–30 min.\n\nRecogida con cita previa: cuando tu pieza esté lista, te avisamos por WhatsApp y coordinamos la hora de recogida. Horario flexible, normalmente todos los días."
      },
      {
        heading: "Zonas de Barcelona con entrega rápida",
        body: "Para pedidos urgentes dentro de Barcelona o el área metropolitana, coordinar una entrega rápida es posible. Zonas habituales:\n\n• **Barcelona ciudad**: Les Corts, Eixample, Gràcia, Sarrià-Sant Gervasi, Horta-Guinardó, Nou Barris, Sant Andreu, Sant Martí, Sants-Montjuïc, Ciutat Vella.\n• **Área metropolitana sur**: L'Hospitalet de Llobregat, Cornellà de Llobregat, Esplugues de Llobregat, Sant Just Desvern, Sant Feliu de Llobregat.\n• **Área metropolitana norte**: Badalona, Sant Adrià de Besòs, Santa Coloma de Gramenet.\n• **Área metropolitana noroeste**: Sant Cugat del Vallès, Rubí, Mollet del Vallès.\n\nPara entrega en día el mismo día en Barcelona ciudad, escríbenos por WhatsApp antes de las 10:00."
      },
      {
        heading: "Opciones de entrega urgente en Barcelona",
        body: "Cuando necesitas la pieza lo antes posible:\n\n• **Recogida misma jornada** — para pedidos confirmados antes de las 12:00 en día laborable, en la mayoría de casos la pieza está lista para recoger esa misma tarde.\n• **Servicio Express** — plazo de 24–48h desde la confirmación, con un recargo del 25%.\n• **Servicio Urgente** — para emergencias reales: same-day o next-day, con un recargo del 60% y disponibilidad limitada a PLA, PETG y TPU.\n\nPara discutir un plazo específico, mándanos un WhatsApp antes de hacer el pedido."
      },
      {
        heading: "Envío si no estás en Barcelona",
        body: "Si estás fuera de Barcelona o prefieres recibir la pieza en casa, el envío cuesta 5,90 € a cualquier punto de España (Península, Baleares, Canarias). El tiempo de tránsito es de 1–2 días laborables para Península.\n\nPara el resto de España, el proceso es 100% online: sube el archivo, paga y recibe en casa. No necesitas pasar por Barcelona."
      },
      {
        heading: "¿Cómo encontrar el taller desde Google Maps?",
        body: "El taller está en la Rambla de Brasil, 53, 08028 Barcelona. Puedes llegar:\n\n• **Metro**: Collblanc (L5) o Zona Universitària (L3), ambas a ~5 min andando.\n• **Bus**: varias líneas paran en la Travessera de les Corts / Rambla del Brasil.\n• **Coche**: hay aparcamiento en la misma calle y en el parking de Mas Guitart cercano.\n\nAnte cualquier duda de localización, mándanos un WhatsApp y te ayudamos."
      },
    ],
    faqs: [
      { q: "¿Dónde está el taller de impresión 3D en Barcelona?", a: "En la Rambla de Brasil, 53 (Les Corts, Barcelona 08028). A 5 minutos del metro Collblanc (L5)." },
      { q: "¿Puedo recoger mi pedido el mismo día?", a: "Para pedidos confirmados antes de las 12:00 en día laborable, en la mayoría de casos la pieza está lista para recoger esa misma tarde. Para garantizarlo, usa el servicio Urgente." },
      { q: "¿Cubren toda Barcelona o solo Les Corts?", a: "Podemos enviar a toda la ciudad y el área metropolitana. La recogida presencial es en Les Corts. Si necesitas entrega a domicilio dentro de Barcelona, consúltanos." },
      { q: "¿También imprimís en L'Hospitalet, Cornellà o Sant Cugat?", a: "Sí. Puedes recoger en el estudio de Barcelona, o te enviamos a tu dirección. El coste de envío a toda la provincia de Barcelona es 5,90 €." },
      { q: "¿Tenéis horario flexible para recoger?", a: "La recogida es con cita previa, así que el horario es flexible. Cuando tu pieza esté lista te avisamos por WhatsApp y acordamos la hora que mejor te venga, normalmente todos los días." },
      { q: "¿Podéis venir a buscar mi pieza rota para copiarla?", a: "No hacemos recogida a domicilio para escaneo. Lo más práctico es traer la pieza al taller o enviarnos buenas fotos con una referencia de tamaño." },
    ],
    galleryImages: pick("custom-brackets.jpg", "curved-parts.jpg", "red-adapter.jpg", "intake-manifold.jpg", "black-intake.jpg", "blue-molds.jpg"),
    related: [
      { label: "Impresión 3D Online — Envío España", slug: "/impresion-3d-online" },
      { label: "Precio Impresión 3D", slug: "/precio-impresion-3d" },
      { label: "Impresión 3D Urgente Barcelona", slug: "/impresion-3d-urgente-barcelona" },
      { label: "Piezas Personalizadas 3D Barcelona", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Impresión 3D para Empresas Barcelona", slug: "/impresion-3d-empresas-barcelona" },
    ],
    schemaServiceName: "Impresión 3D Cerca de Mí — Barcelona",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
  },

  {
    slug: "/sobre-nosotros",
    topic: "about",
    altSlug: "/about",
    lang: "es",
    category: "service",
    metaTitle: "Sobre Nosotros — Dimension3D Barcelona | Impresión 3D FDM",
    metaDescription: "Dimension3D es un estudio de impresión 3D FDM en Barcelona fundado por Nico (Mikołaj Szczełkun). 250+ pedidos, Bambu Lab X2D, servicio online a toda España.",
    h1: "Sobre Dimension3D: el estudio detrás de cada pieza",
    intro: "Dimension3D es un estudio de impresión 3D FDM fundado en Barcelona por Nico (Mikołaj Szczełkun). Fabricamos piezas a medida, prototipos y recambios para particulares y empresas de toda España. Desdel estudio en Les Corts hemos completado más de 250 pedidos, y seguimos haciendo lo mismo que al principio: revisar cada encargo manualmente, responder en menos de 1 hora y entregar piezas que funcionan.",
    sections: [
      {
        heading: "El fundador: Nico (Mikołaj Szczełkun)",
        body: "Nico es el fundador y técnico principal de Dimension3D. Estudió en Polonia y se mudó a Barcelona, donde combinó su pasión por el diseño técnico con la tecnología FDM. Nico lleva 4 años trabajando con impresoras 3D y comenzó a imprimir para clientes en 2024, primero como proyecto personal y luego construyendo Dimension3D como un servicio real para clientes reales.\n\nSu formación técnica y su obsesión por los detalles explican el enfoque de Dimension3D: cada pedido se revisa antes de imprimir, cada material se elige según la función real de la pieza, y cada cliente recibe una respuesta directa, no automatizada."
      },
      {
        heading: "El taller y las máquinas",
        body: "El taller principal está en la Rambla de Brasil, 53, barrio de Les Corts, Barcelona. Trabajamos con una flota de impresoras FDM centradas en la Bambu Lab X2D con sistema AMS (Automatic Material System), que permite impresión multicolor de hasta 4 filamentos en la misma pieza.\n\nUsamos exclusivamente tecnología FDM — no fabricamos en resina ni en SLS. FDM es la tecnología más versátil para piezas funcionales, recambios y producción a corto plazo con materiales técnicos como PETG, ABS/ASA, TPU y Nylon. Para aplicaciones que requieren mayor detalle superficial o materiales especiales que FDM no cubre, lo comunicamos abiertamente y remitimos a quien puede ayudar mejor."
      },
      {
        heading: "250+ pedidos y lo que hemos aprendido",
        body: "Desde el primer pedido hasta hoy, hemos imprimido más de 250 encargos para particulares, startups, talleres, clínicas, diseñadores y estudiantes. Algunos patrones que vemos constantemente:\n\n• La mayoría de los clientes no tienen archivo 3D — trabajan con fotos, piezas rotas y medidas.\n• El material correcto importa más que la calidad de impresión — una pieza bien orientada en PETG supera a la misma pieza mal configurada en Nylon.\n• El soporte directo marca la diferencia — los clientes que reciben respuesta en minutos tienen mucho menos estrés que los que esperan días.\n\nEsto ha moldeado cómo trabajamos: revisión humana de cada archivo, respuesta por WhatsApp en horario laboral, y honestidad cuando un encargo no es el mejor caso de uso para FDM."
      },
      {
        heading: "Dimension3D en el Smart City Expo World Congress 2026",
        body: "En noviembre de 2026, Dimension3D asistió al Smart City Expo World Congress en Barcelona, el evento mundial de referencia para ciudades inteligentes. Como servicio local de fabricación aditiva, seguimos de cerca los avances en cadenas de suministro urbanas y piezas de infraestructura."
      },
      {
        heading: "Lo que hacemos y lo que no hacemos",
        body: "Hacemos:\n• Impresión FDM en PLA, PETG, ABS/ASA, TPU, Nylon y materiales de fibra de carbono.\n• Revisión de archivos STL, 3MF, OBJ y STEP antes de imprimir.\n• Diseño y modelado 3D para clientes sin archivo (a partir de fotos, medidas o descripciones).\n• Tiradas cortas de producción (1 unidad a varios cientos).\n• Servicio urgente y same-day para clientes en Barcelona con plazo real.\n\nNo hacemos:\n• Impresión en resina (SLA/MSLA) — el mercado tiene mejores opciones especializadas.\n• Impresión SLS/MJF — para series industriales grandes, hay proveedores industriales más adecuados.\n• Acabados superficiales avanzados (pintura, cromado, metalizado) — sí hacemos lijado básico a petición.\n• Producción en miles de unidades — para eso hay que hablar de inyección."
      },
    ],
    faqs: [
      { q: "¿Quién hay detrás de Dimension3D?", a: "Dimension3D es un estudio fundado por Nico (Mikołaj Szczełkun), con taller en Barcelona. Revisamos y gestionamos cada pedido directamente, sin intermediarios." },
      { q: "¿Cuántos pedidos habéis hecho?", a: "Más de 250 pedidos desde la apertura, para particulares, startups, talleres, clínicas y estudiantes." },
      { q: "¿Podéis hacer un NDA para proyectos confidenciales?", a: "Sí. Firmamos NDA habitualmente con startups de hardware y departamentos de I+D. Mándanos un WhatsApp o email para concretar." },
      { q: "¿En qué idiomas atendéis?", a: "Español, catalán, inglés y polaco. Podemos gestionar pedidos en cualquiera de estos idiomas." },
      { q: "¿Estáis en Barcelona físicamente o solo online?", a: "Tenemos taller físico en la Rambla de Brasil, 53 (Les Corts, Barcelona). También atendemos pedidos 100% online con envío a toda España y la UE." },
      { q: "¿Desde cuándo está en marcha Dimension3D?", a: "Nico lleva 4 años trabajando con impresoras 3D y comenzó a imprimir para clientes en 2024. Llevamos más de 250 pedidos gestionados para particulares y empresas de toda España." },
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "blue-molds.jpg", "curved-parts.jpg", "red-adapter.jpg", "black-intake.jpg"),
    related: [
      { label: "Impresión 3D Online", slug: "/impresion-3d-online" },
      { label: "Precio Impresión 3D", slug: "/precio-impresion-3d" },
      { label: "Piezas Personalizadas 3D Barcelona", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Prototipos 3D Barcelona", slug: "/prototipos-3d-barcelona" },
      { label: "Impresión 3D para Empresas", slug: "/impresion-3d-empresas-barcelona" },
    ],
    schemaServiceName: "Dimension3D — Estudio de Impresión 3D Barcelona",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
    extraHreflang: [
      { lang: "en", slug: "/about" },
    ],
  },

  // ── BLOG POSTS (Nov 2026) ───────────────────────────────────────────────

  {
    slug: "/blog/pla-vs-petg",
    topic: "blog-pla-vs-petg",
    altSlug: "/blog/pla-vs-petg",
    lang: "es",
    category: "guide",
    metaTitle: "PLA vs PETG: ¿Qué material elegir para tu impresión 3D?",
    metaDescription: "Comparativa completa PLA vs PETG: resistencia, temperatura, precio, exterior, imprimibilidad. Cuándo usar cada uno según el uso real de la pieza.",
    h1: "PLA vs PETG: diferencias clave y cuándo usar cada material",
    intro: "PLA y PETG son los dos materiales FDM más usados en Dimension3D. El PLA es más económico, más fácil de imprimir y suficiente para el 60% de los pedidos. El PETG aguanta más temperatura, humedad y esfuerzo mecánico, y es nuestra recomendación para piezas funcionales. Esta guía explica cuándo usar cada uno con ejemplos reales.",
    sections: [
      {
        heading: "¿Qué es el PLA y para qué sirve?",
        body: "El PLA (ácido poliláctico) es el plástico FDM más común. Deriva del almidón de maíz, es biodegradable en compostaje industrial y se imprime con facilidad a temperaturas bajas (190–220°C). Captura bien el detalle, está disponible en decenas de colores y es el material más económico de nuestra gama.\n\nLimitaciones del PLA: se deforma a partir de ~55–60°C. No es adecuado para el interior de un coche, para exteriores en verano o para piezas sometidas a carga continua. Tampoco tolera bien la humedad prolongada."
      },
      {
        heading: "¿Qué es el PETG y para qué sirve?",
        body: "El PETG (polietileno tereftalato glicol) combina propiedades del PET (la resistencia y la claridad) con una mayor facilidad de impresión. Aguanta hasta ~75–80°C, tolera la humedad y el exterior, y tiene mejor resistencia al impacto que el PLA.\n\nEl PETG es nuestra recomendación por defecto para piezas funcionales: soportes, piezas de coche, recambios para electrodomésticos, piezas de exterior, contenedores en contacto con líquidos. Su único inconveniente frente al PLA es que cuesta algo más y requiere un poco más de cuidado en la impresión (más tendencia a las hebras de filamento)."
      },
      {
        heading: "¿Cuál es más resistente, PLA o PETG?",
        body: "Depende del tipo de resistencia:\n\n• **Rigidez** — el PLA es más rígido (módulo de Young más alto). Las piezas en PLA ceden menos ante la misma carga.\n• **Resistencia al impacto** — el PETG absorbe mejor los golpes y es menos quebradizo. El PLA tiende a romperse limpiamente bajo impacto.\n• **Temperatura** — el PETG gana claramente. El PLA se deforma a 55°C; el PETG aguanta hasta 75–80°C.\n• **Exterior / UV** — el PETG tolera mejor la lluvia y la humedad. Para UV prolongado, ABS o ASA son superiores a ambos.\n• **Tensión a rotura** — similares, el PETG tiene ligera ventaja.\n\nResumen: para piezas decorativas y prototipos de forma, el PLA es suficiente. Para piezas que aguantan carga, calor o exterior, el PETG es más seguro."
      },
      {
        heading: "¿Cuál es más económico?",
        body: "El PLA cuesta algo menos que el PETG en Dimension3D — la diferencia en una pieza de 100 g es de menos de 1 €. Para la mayoría de pedidos, el diferencial de precio es menor que el diferencial de prestaciones, así que si tienes dudas, el PETG suele merecer el pequeño extra. Usa la calculadora para ver el precio exacto de tu pieza en cada material."
      },
      {
        heading: "Tabla comparativa PLA vs PETG",
        body: "Resumen de las diferencias clave para elegir el material según el uso:"
      },
      {
        heading: "¿Cuándo NO usar PLA?",
        body: "Evita el PLA en estas situaciones:\n\n• Interior de un coche (el sol puede calentarlo a 70–80°C, demasiado para PLA).\n• Piezas en exteriores en verano (mismo problema de temperatura).\n• Piezas que soportan peso o tensión continua durante semanas (riesgo de creep).\n• Piezas en contacto con agua caliente (lavaplatos, lavavajillas, ducha).\n• Recambios de electrodomésticos con calor (carcasa de secadora, piezas de horno)."
      },
      {
        heading: "¿Cuándo NO usar PETG?",
        body: "El PETG tiene buenas prestaciones en la mayoría de usos, pero hay excepciones:\n\n• Piezas con exposición prolongada a UV directo — el ASA aguanta mejor.\n• Piezas que necesitan alta rigidez sin flexión — el PLA o el ABS pueden ser mejores.\n• Acabado superficial muy fino — el PLA imprime con mejor calidad superficial en impresoras bien calibradas."
      },
    ],
    faqs: [
      { q: "¿Es el PETG más resistente que el PLA?", a: "Depende del tipo de resistencia. El PETG aguanta mejor el impacto, la temperatura (75°C vs 55°C) y la humedad. El PLA es más rígido. Para piezas funcionales, el PETG suele ser la mejor opción." },
      { q: "¿Puedo imprimir PETG en cualquier impresora FDM?", a: "El PETG necesita temperaturas algo más altas que el PLA (230–245°C) y se beneficia de una cama caliente (70–80°C). La mayoría de impresoras modernas lo admiten sin problema." },
      { q: "¿Cuánto más cuesta el PETG que el PLA?", a: "En Dimension3D, el PETG tiene un recargo de aproximadamente el 10% sobre el PLA. Para una pieza de 100 g, la diferencia es menor de 1 €." },
      { q: "¿PLA o PETG para piezas de exterior?", a: "PETG para exteriores con lluvia y humedad. Para exposición directa al sol durante años, el ASA es superior a ambos." },
      { q: "¿Qué material es mejor para recambios de electrodomésticos?", a: "Generalmente PETG: aguanta el calor moderado (lavaplatos, lavadoras), es resistente al impacto y no se deforma con la humedad. Para recambios de secadoras u hornos, podría ser necesario ABS/ASA." },
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "red-adapter.jpg", "curved-parts.jpg", "black-intake.jpg", "blue-molds.jpg"),
    related: [
      { label: "Comparativa Completa de Materiales", slug: "/comparativa-materiales-impresion-3d" },
      { label: "Precio Impresión 3D — Calculadora", slug: "/precio-impresion-3d" },
      { label: "Recambios Impresión 3D Barcelona", slug: "/recambios-impresion-3d-barcelona" },
      { label: "Impresión 3D Online", slug: "/impresion-3d-online" },
      { label: "Guía de Materiales de Impresión 3D", slug: "/guia-materiales-impresion-3d" },
    ],
    schemaServiceName: "PLA vs PETG — Guía de Materiales",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
    comparisonTable: {
      caption: "PLA vs PETG — comparativa de propiedades clave para impresión 3D FDM",
      headers: ["Propiedad", "PLA", "PETG"],
      rows: [
        ["Temperatura máx.", "~55°C", "~75°C"],
        ["Resistencia al impacto", "Baja (quebradizo)", "Media-alta"],
        ["Exterior / humedad", "No recomendado", "Sí"],
        ["UV directo", "No", "Aceptable (no ideal)"],
        ["Flexibilidad", "Rígido", "Semirígido"],
        ["Precio relativo", "€", "€ (+10%)"],
        ["Facilidad de impresión", "Muy alta", "Alta"],
        ["Detalle superficial", "Excelente", "Muy bueno"],
        ["Mejor para", "Prototipos, decoración", "Piezas funcionales, recambios"],
      ],
    },
  },

  {
    slug: "/blog/como-imprimir-en-3d-sin-impresora",
    topic: "blog-imprimir-sin-impresora",
    altSlug: "/blog/como-imprimir-en-3d-sin-impresora",
    lang: "es",
    category: "guide",
    metaTitle: "Cómo Imprimir en 3D sin Impresora — Guía para Principiantes",
    metaDescription: "Tienes un modelo 3D (STL, OBJ, 3MF) y quieres imprimirlo pero no tienes impresora. Opciones: servicio online, bibliotecas, makers locales. Guía paso a paso.",
    h1: "Cómo imprimir en 3D sin tener una impresora: opciones y precios",
    intro: "Tienes un archivo STL descargado de Makerworld o diseñado en Tinkercad, y quieres verlo impreso. No necesitas comprarte una impresora. Esta guía explica las tres opciones principales para imprimir en 3D sin impresora: servicios online como Dimension3D, bibliotecas y makerspaces, y plataformas de makers locales.",
    sections: [
      {
        heading: "Opción 1: servicio de impresión 3D online",
        body: "La forma más práctica para la mayoría de personas. Subes el archivo a un servicio como Dimension3D, recibes el precio, pagas y te llega la pieza a casa.\n\nVentajas:\n• Sin desplazamientos, sin esperas, sin aprendizaje técnico.\n• Materiales de calidad profesional (PETG, Nylon, TPU) que las impresoras de entrada no siempre pueden usar bien.\n• Alguien revisa tu archivo antes de imprimir — si hay problemas, te avisan.\n• Envío a toda España en 2–5 días por 5,90 €.\n\nDesventajas:\n• No es gratis. El mínimo es 10 € por pieza + 5,90 € de envío.\n• Si necesitas la pieza en 30 minutos, un servicio online no es la opción."
      },
      {
        heading: "¿Cómo enviar tu archivo a un servicio de impresión?",
        body: "El proceso en Dimension3D es simple:\n\n1. **Prepara tu archivo** — STL, 3MF, OBJ o STEP. Los archivos descargados de Makerworld, Printables, Cults3D o Thingiverse ya están en el formato correcto.\n2. **Sube el archivo** — usa la calculadora en la web o mándalo por WhatsApp.\n3. **Elige material y color** — PLA para decoración, PETG para piezas funcionales. Hay decenas de colores.\n4. **Recibe el presupuesto** — en menos de 1 hora en horario laboral.\n5. **Confirma y paga** — el pedido se pone en cola de impresión.\n6. **Recibe la pieza** — en casa o recógela en Barcelona."
      },
      {
        heading: "Opción 2: bibliotecas y makerspaces",
        body: "Muchas bibliotecas públicas y centros cívicos en Barcelona y otras ciudades tienen impresoras 3D disponibles para uso gratuito o a bajo coste. Los makerspaces (espacios de makers compartidos) también ofrecen acceso.\n\nVentajas: bajo coste o gratuito. Contacto directo con expertos.\nDesventajas: hay que aprender a usar el software (slicer), los tiempos de espera pueden ser largos, y la calidad del resultado depende del estado de la máquina y tu experiencia.\n\nEn Barcelona: Fab Lab Barcelona, Espai Jove La Fontana, y algunos centros cívicos del Ayuntamiento tienen acceso a impresoras para ciudadanos."
      },
      {
        heading: "Opción 3: encargarlo a un maker local",
        body: "Plataformas como 3DHubs (ahora Protolabs) o Craftcloud conectan usuarios con makers y estudios locales. También existen comunidades en Reddit (r/3Dprinting), Facebook y Discord donde los makers imprimen piezas para otros a cambio de una compensación.\n\nVentaja: puede ser más barato para tiradas pequeñas con makers aficionados.\nDesventaja: la calidad, los plazos y la comunicación son variables. No hay garantía de servicio profesional ni atención al cliente formal."
      },
      {
        heading: "¿Qué pasa si no tengo el archivo?",
        body: "Muchos clientes de Dimension3D no tienen archivo 3D. No es necesario tenerlo. Tienes tres opciones:\n\n• **Enviar una foto** — de la pieza que quieres imprimir o copiar, con una referencia de tamaño (regla, moneda). Muchas veces podemos modelar la pieza a partir de fotos.\n• **Dar medidas** — si conoces las dimensiones exactas, podemos modelar la pieza desde cero.\n• **Describir lo que necesitas** — para piezas sencillas (soportes, adaptadores, organizadores), la descripción es suficiente para hacer un presupuesto.\n\nEl diseño tiene un coste adicional (desde 20 €) que se cotiza antes de empezar."
      },
    ],
    faqs: [
      { q: "¿Puedo imprimir un archivo STL descargado de internet?", a: "Sí. Si has descargado un modelo de Makerworld, Printables, Cults3D u otra plataforma, puedes enviarlo a Dimension3D y lo imprimimos. Verificamos que el archivo sea correcto antes de imprimir." },
      { q: "¿Cuánto cuesta imprimir un modelo descargado?", a: "Desde 10 € (mínimo) + 5,90 € de envío. El precio depende del tamaño y el material. Sube el archivo a nuestra calculadora para ver el precio exacto." },
      { q: "¿Puedo imprimir en 3D en la biblioteca?", a: "En Barcelona, algunas bibliotecas y centros cívicos tienen impresoras 3D disponibles. El acceso suele ser gratuito o muy económico, pero hay que aprender el proceso y los tiempos de espera pueden ser largos." },
      { q: "¿Es legal imprimir modelos descargados de internet?", a: "Depende de la licencia del modelo. Los modelos en Makerworld, Printables y la mayoría de plataformas tienen licencias Creative Commons para uso personal no comercial. Para uso comercial, revisa siempre la licencia del modelo específico." },
      { q: "¿Qué formato de archivo necesito para imprimir en 3D?", a: "STL es el formato más universal. También aceptamos 3MF, OBJ y STEP. Los archivos exportados desde Tinkercad, Fusion 360, FreeCAD o cualquier software CAD estándar funcionan directamente." },
    ],
    galleryImages: pick("custom-brackets.jpg", "curved-parts.jpg", "red-adapter.jpg", "intake-manifold.jpg", "blue-molds.jpg", "black-intake.jpg"),
    related: [
      { label: "Impresión 3D Online — Envío España", slug: "/impresion-3d-online" },
      { label: "Precio Impresión 3D", slug: "/precio-impresion-3d" },
      { label: "Impresión 3D Cerca de Mí", slug: "/impresion-3d-cerca-de-mi" },
      { label: "Modelos de Makerworld y Printables", slug: "/blog/imprimir-modelos-makerworld-printables-cults3d" },
      { label: "Cómo Preparar tu Archivo", slug: "/como-preparar-archivo-impresion-3d" },
    ],
    schemaServiceName: "Impresión 3D sin Impresora — Guía",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
  },

  {
    slug: "/blog/imprimir-modelos-makerworld-printables-cults3d",
    topic: "blog-modelos-descargados",
    altSlug: "/blog/imprimir-modelos-makerworld-printables-cults3d",
    lang: "es",
    category: "guide",
    metaTitle: "Imprimir Modelos de Makerworld, Printables y Cults3D — Guía",
    metaDescription: "Descargaste un modelo 3D de Makerworld, Printables o Cults3D y quieres imprimirlo. Guía paso a paso: formato, licencias, cómo pedirlo en Dimension3D.",
    h1: "Cómo imprimir modelos descargados de Makerworld, Printables o Cults3D",
    intro: "Makerworld, Printables y Cults3D son las principales plataformas para descargar modelos 3D gratuitos o de pago. Si has encontrado la pieza perfecta pero no tienes impresora, Dimension3D la imprime por ti desde 10 €. Esta guía explica cómo funciona: formatos, licencias y cómo enviarnos el archivo.",
    sections: [
      {
        heading: "Las principales plataformas de modelos 3D",
        body: "Hay tres plataformas que concentran la mayor parte de los modelos 3D disponibles para descargar:\n\n• **Makerworld** — la plataforma oficial de Bambu Lab. Muchos modelos de alta calidad con previsualizaciones realistas. Especialmente activa para figuras, miniaturas y objetos decorativos.\n• **Printables** — plataforma de Prusa Research. Gran comunidad, miles de modelos técnicos (recambios, adaptadores, herramientas, organizadores) y filtros avanzados por categoría y popularidad.\n• **Cults3D** — comunidad francesa con muchos modelos creativos, artísticos y de diseño industrial. También incluye modelos de pago de diseñadores profesionales.\n\nTodas ellas permiten descargar los archivos en formato STL o 3MF, que son los formatos que aceptamos en Dimension3D."
      },
      {
        heading: "Paso 1: descarga el modelo en el formato correcto",
        body: "Cuando descargues el modelo, busca el archivo en formato STL o 3MF. STL es el más universal y está disponible en todas las plataformas. 3MF es más moderno e incluye información de colores y materiales cuando el diseñador lo ha especificado.\n\nSi el modelo tiene múltiples partes (p.ej. un personaje con ropa por piezas separadas), descarga todos los archivos STL que lo componen. Cuando nos lo envíes, especifica qué partes van en qué color."
      },
      {
        heading: "Paso 2: comprueba la licencia",
        body: "Antes de pedir la impresión, comprueba la licencia del modelo:\n\n• **CC BY, CC BY-SA, CC0 (uso público)** — puedes imprimirlo para uso personal y en muchos casos comercial (lee la variante específica).\n• **CC BY-NC** — solo uso personal, no comercial.\n• **Licencia propietaria / All rights reserved** — necesitas permiso explícito del diseñador.\n\nPara uso personal (imprimir una pieza para tu casa), la mayoría de licencias lo permiten. Si vas a vender la pieza impresa, comprueba que la licencia lo autorice."
      },
      {
        heading: "Paso 3: envíanos el archivo y pide presupuesto",
        body: "Una vez tienes el archivo descargado:\n\n1. Sube el STL/3MF en nuestra calculadora o mándalo por WhatsApp.\n2. Dinos el material que quieres (PLA para decoración, PETG para piezas funcionales) y el color.\n3. Si el modelo tiene partes ensambladas, indica cuáles van en cada color.\n4. Recibe el presupuesto en menos de 1 hora.\n\nRevisamos el archivo antes de imprimir: comprobamos grosor de pared, voladizos problemáticos y orientación óptima. Si hay algo mejorable, te lo comunicamos antes de cobrar."
      },
      {
        heading: "Modelos típicos que imprimimos de estas plataformas",
        body: "Algunas de las categorías más frecuentes que llegan vía Makerworld y Printables:\n\n• Figuras de personajes (videojuegos, películas, anime)\n• Organizadores para cajones, cables y herramientas\n• Recambios para muebles IKEA y otros muebles estándar\n• Adaptadores para mangueras, ventiladores y electrónica doméstica\n• Piezas para Raspberry Pi, Arduino y otros proyectos de maker\n• Maquetas arquitectónicas y decoración de hogar\n• Accesorios para bicicleta y vehículos"
      },
    ],
    faqs: [
      { q: "¿Puedo enviaros un modelo de Makerworld para que lo imprimáis?", a: "Sí. Descarga el archivo STL o 3MF y súbelo en nuestra calculadora o mándalo por WhatsApp. Lo revisamos y te damos precio en menos de 1 hora." },
      { q: "¿Los modelos de estas plataformas se pueden imprimir directamente?", a: "En la mayoría de casos sí, aunque a veces necesitan pequeños ajustes de orientación o escala. Revisamos el archivo antes de imprimir y te avisamos si hay que cambiar algo." },
      { q: "¿Podéis imprimir modelos con múltiples partes en diferentes colores?", a: "Sí. Con nuestro sistema multicolor (Bambu Lab X2D + AMS) podemos imprimir hasta 4 colores en la misma pieza. Para piezas separadas ensambladas, imprimimos cada parte en el color que elijas." },
      { q: "¿Qué pasa si el modelo tiene errores (archivos STL rotos)?", a: "Lo detectamos en la revisión previa y te lo comunicamos antes de cobrar. En muchos casos podemos reparar el archivo automáticamente; si no, sugerimos descargar una versión alternativa o ajustar el modelo." },
      { q: "¿Podéis escalar el modelo a un tamaño diferente al original?", a: "Sí. Al pedir, especifica la escala o las dimensiones finales que necesitas. Consideramos el grosor de pared mínimo al escalar piezas muy pequeñas." },
    ],
    galleryImages: pick("lion-king-figures.jpg", "lion-king-scene.jpg", "halloween-set.jpg", "stranger-things-diorama.jpg", "purple-figures.jpg", "ferrari-key-holder.jpg"),
    related: [
      { label: "Impresión 3D Online", slug: "/impresion-3d-online" },
      { label: "Impresión 3D Multicolor", slug: "/impresion-3d-multicolor" },
      { label: "Cómo Imprimir sin Impresora", slug: "/blog/como-imprimir-en-3d-sin-impresora" },
      { label: "Precio Impresión 3D", slug: "/precio-impresion-3d" },
      { label: "Piezas Personalizadas 3D Barcelona", slug: "/piezas-personalizadas-3d-barcelona" },
    ],
    schemaServiceName: "Imprimir Modelos Descargados — Guía",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
  },

  {
    slug: "/blog/cuanto-tarda-imprimir-en-3d",
    topic: "blog-cuanto-tarda",
    altSlug: "/blog/cuanto-tarda-imprimir-en-3d",
    lang: "es",
    category: "guide",
    metaTitle: "¿Cuánto Tarda una Impresión 3D? Tiempos Reales por Tamaño",
    metaDescription: "¿Cuánto tarda imprimir en 3D? Guía con tiempos reales por tamaño: piezas pequeñas (1–3h), medianas (3–8h), grandes (8–24h+). Plazos de entrega con Dimension3D.",
    h1: "¿Cuánto tarda una impresión 3D? Tiempos reales y plazos de entrega",
    intro: "El tiempo de impresión 3D depende principalmente del tamaño de la pieza, la altura de capa elegida y el material. Una pieza pequeña (20–30 g) puede imprimirse en 1–3 horas; una pieza grande (300+ g) puede tardar 20–30 horas. Esta guía explica qué factores influyen y cuál es el plazo de entrega real desde que pides hasta que recibes.",
    sections: [
      {
        heading: "¿Qué determina el tiempo de impresión?",
        body: "Los cinco factores principales que marcan el tiempo de máquina:\n\n1. **Volumen de plástico** — a más gramos, más tiempo. Una pieza de 10 g tarda 30–60 min; una de 300 g puede tardar 10–15 h.\n2. **Altura de capa** — capa más fina (0,10–0,15 mm) = más tiempo pero mejor calidad. Capa estándar (0,20 mm) equilibra velocidad y acabado.\n3. **Densidad de relleno** — relleno del 10% es mucho más rápido que relleno del 30%. Para piezas decorativas, 10–15% es suficiente.\n4. **Soportes** — voladizos complejos necesitan soportes que añaden tiempo y material.\n5. **Orientación** — la misma pieza orientada de forma diferente puede tardar un 30–50% más o menos."
      },
      {
        heading: "Tiempos de impresión orientativos por tamaño",
        body: "Estos son tiempos de máquina típicos en nuestra Bambu Lab X2D a calidad estándar (0,20 mm, PLA, 15% relleno):\n\n• **Pieza pequeña** (5×5×5 cm, ~15–30 g): 1–3 horas.\n• **Pieza mediana** (10×8×8 cm, ~50–100 g): 3–7 horas.\n• **Pieza funcional grande** (15×12×10 cm, ~150–200 g): 7–14 horas.\n• **Pieza muy grande / casco** (25×20×20 cm, ~300–500 g): 15–30 horas.\n\nEstos tiempos se calculan automáticamente cuando subes el archivo a nuestra calculadora."
      },
      {
        heading: "Plazo de entrega total: de pedido a puerta",
        body: "El tiempo de impresión es solo una parte del plazo total. El ciclo completo desde que confirmas el pedido hasta que recibes la pieza:\n\n• **Revisión del archivo**: normalmente menos de 1 hora en horario laboral.\n• **Cola de impresión**: según la carga del taller, de inmediato a 24h.\n• **Impresión**: según la pieza, de 1 a 30 horas.\n• **Acabado y control de calidad**: 30–60 min (retirada de soportes, limpieza).\n• **Preparación del envío**: mismo día si termina antes de las 16:00.\n• **Tránsito**: 1–2 días laborables para Península.\n\n**En total (servicio estándar)**: 2–5 días laborables desde la confirmación."
      },
      {
        heading: "Servicio Express: 24–48 horas",
        body: "Si necesitas la pieza antes, el servicio Express (recargo 25%) garantiza que tu pedido entra en la cola prioritaria y se envía en 24–48h desde la confirmación. Para pedidos urgentes (mismo día o siguiente), el recargo es del 60% y la disponibilidad es limitada.\n\nPara gestionar un pedido urgente correctamente, escríbenos por WhatsApp antes de hacerlo — así confirmamos disponibilidad y plazo real antes de comprometerse."
      },
      {
        heading: "¿Puedo ver el progreso de mi impresión?",
        body: "Para pedidos a través del checkout online, recibes un número de seguimiento cuando el pedido sale. No tenemos una cámara de seguimiento en tiempo real, pero si quieres una actualización del estado de tu pedido, escríbenos por WhatsApp y te respondemos en minutos."
      },
    ],
    faqs: [
      { q: "¿Cuánto tarda imprimir una pieza pequeña?", a: "Una pieza pequeña (5–30 g) tarda entre 1 y 3 horas de impresión. Con la cola de producción y el envío, el plazo total es de 2–4 días laborables." },
      { q: "¿Cuánto tarda imprimir una figura de tamaño mediano?", a: "Una figura de 10–15 cm de altura tarda entre 4 y 10 horas de impresión. Puede tardar más con soporte complejo o calidad fina." },
      { q: "¿Es posible recibir la pieza el mismo día?", a: "Para pedidos confirmados antes de las 10:00 y recogida en Barcelona, es posible en muchos casos. Para envío urgente, podemos garantizar el día siguiente con nuestro servicio Urgente (recargo 60%)." },
      { q: "¿Qué es más rápido, PLA o PETG?", a: "PLA y PETG tienen tiempos de impresión muy similares con nuestra Bambu Lab X2D. La diferencia es marginal (<5%) para la mayoría de piezas." },
      { q: "¿Puedo acelerar la impresión reduciendo la calidad?", a: "Sí. Con calidad 'fast' (capa 0,25–0,30 mm) el tiempo puede reducirse un 20–30% a costa de un acabado con líneas más visibles. Para piezas funcionales, es una buena opción." },
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "red-adapter.jpg", "curved-parts.jpg", "black-intake.jpg", "blue-molds.jpg"),
    related: [
      { label: "Impresión 3D Urgente Barcelona", slug: "/impresion-3d-urgente-barcelona" },
      { label: "Precio Impresión 3D", slug: "/precio-impresion-3d" },
      { label: "Impresión 3D Online", slug: "/impresion-3d-online" },
      { label: "Impresión 3D Cerca de Mí", slug: "/impresion-3d-cerca-de-mi" },
      { label: "Prototipado Rápido Barcelona", slug: "/prototipado-rapido-barcelona" },
    ],
    schemaServiceName: "¿Cuánto Tarda Imprimir en 3D? — Guía",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
  },

  {
    slug: "/blog/que-se-puede-imprimir-en-3d",
    topic: "blog-que-se-puede-imprimir",
    altSlug: "/blog/que-se-puede-imprimir-en-3d",
    lang: "es",
    category: "guide",
    metaTitle: "¿Qué se Puede Imprimir en 3D? Ideas y Aplicaciones Reales",
    metaDescription: "¿Qué se puede imprimir en 3D? Recambios, figuras, prototipos, piezas de coche, organizadores y mucho más. 20 ideas con ejemplos reales de Dimension3D.",
    h1: "¿Qué se puede imprimir en 3D? 20 aplicaciones reales con ejemplos",
    intro: "La impresión 3D FDM puede fabricar cualquier objeto sólido que cabe en la cama de impresión (25×25 cm) y no requiera propiedades imposibles en plástico. Desde recambios de electrodomésticos hasta figuras de colección, pasando por prototipos de ingeniería y piezas de coche. Esta guía muestra las 20 aplicaciones más frecuentes en Dimension3D con ejemplos reales.",
    sections: [
      {
        heading: "Recambios y piezas descatalogadas",
        body: "Es nuestra categoría más frecuente. La impresión 3D brilla cuando el fabricante ya no vende la pieza o cobra un precio absurdo por un trozo de plástico.\n\nEjemplos reales de pedidos en Dimension3D:\n• Rueda de cesta de lavavajillas Bosch — imprimida en PETG, disponible en nuestro catálogo.\n• Embudo dosificador de café 58mm — para portafiltros estándar.\n• Adaptador de manguera Gardena 3/4\" — compatible con reguladores de jardín.\n• Adaptador VESA para monitor — para soportes no estándar.\n• Tirador de cajón roto — copiado de uno original.\n• Guía de persiana rota — a partir de foto y medidas."
      },
      {
        heading: "Figuras, miniaturas y coleccionables",
        body: "Las figuras y miniaturas son uno de los usos más creativos de la impresión 3D. Se descargan modelos de plataformas como Makerworld y Printables y se imprimen en PLA a alta calidad.\n\nEjemplos:\n• Personajes de videojuegos y películas.\n• Figuras para juegos de mesa y rol.\n• Esculturas y decoración.\n• Bustos y retratos en 3D.\n• Réplicas de monumentos."
      },
      {
        heading: "Piezas de coche y moto",
        body: "La FDM en ABS/ASA o PETG puede reproducir muchas piezas interiores del coche que se rompen con el tiempo: embellecedores, clips de tapicería, soportes de dashboard, tapas de fusibles y carcasas de retrovisores.\n\nConsideraciones: las piezas del habitáculo del coche no superan normalmente 70°C (excepto las zonas cerca del motor). ABS/ASA son los materiales de referencia para estas aplicaciones."
      },
      {
        heading: "Prototipos y desarrollo de producto",
        body: "Las startups, ingenieros freelance y estudiantes son usuarios frecuentes. La FDM permite pasar de un archivo CAD a una pieza física en 24–72 horas, validar forma y ajuste, y hacer la siguiente iteración.\n\nTipos de prototipos frecuentes:\n• Validación de forma (fit-and-finish prototype)\n• Piezas funcionales para pruebas mecánicas\n• Modelos para presentación a clientes o inversores\n• Utillajes y herramientas de producción"
      },
      {
        heading: "Organizadores y accesorios de hogar",
        body: "Un área en auge: soportes para cables, organizadores de cajones, porta-especias, soportes para el móvil en la ducha, bases para dispositivos, fundas para mandos a distancia.\n\nLo bueno de este tipo de piezas es que la mayoría ya existen en Makerworld o Printables — solo hay que descargar e imprimir."
      },
      {
        heading: "Piezas para makers y electrónica",
        body: "Carcasas para Raspberry Pi, Arduino y ESP32. Soportes para sensores, cámaras y módulos. Clips para perfil de aluminio 20×20 y 40×40. La comunidad maker crea y comparte miles de modelos específicos para proyectos de DIY y domótica."
      },
      {
        heading: "¿Qué NO se puede imprimir en 3D?",
        body: "Para ser honestos, hay aplicaciones donde la FDM no es la herramienta adecuada:\n\n• **Piezas con alta temperatura** (>100°C): el PLA y PETG se deforman. Pueden usarse materiales especiales como PC o Nylon-CF, pero con limitaciones.\n• **Piezas con detalle muy fino** (<0,5 mm): la FDM tiene un límite de resolución de ~0,4 mm. Para joyería y dental, la resina es mejor.\n• **Producción en miles de unidades**: el moldeo por inyección es más económico a partir de cierta escala.\n• **Objetos sellados herméticamente**: la FDM no es hermética por naturaleza (aunque se puede hacer con postprocesado)."
      },
    ],
    faqs: [
      { q: "¿Se puede imprimir en 3D cualquier objeto?", a: "Casi cualquier objeto sólido que cabe en 25×25 cm puede imprimirse. Las limitaciones principales son el tamaño, el detalle muy fino y las propiedades de temperatura del plástico." },
      { q: "¿Cuántos colores puede tener un objeto impreso en 3D?", a: "Con nuestro sistema multicolor Bambu Lab X2D + AMS, hasta 4 colores en la misma impresión. Para más colores, habría que pintar o ensamblar partes." },
      { q: "¿Podéis imprimir objetos transparentes?", a: "Sí. PETG natural tiene una traslucidez suave. No es completamente transparente como el vidrio, pero permite ver el interior. Para transparencia mayor, existen filamentos de PETG especiales." },
      { q: "¿La impresión 3D FDM es resistente?", a: "Sí para la mayoría de usos domésticos y profesionales. Piezas de PETG, ABS o Nylon pueden igualar o superar plásticos moldeados equivalentes en resistencia mecánica." },
      { q: "¿Se pueden imprimir piezas de metal en 3D?", a: "No con FDM estándar. Hay sistemas de impresión 3D de metal (DMLS, SLM) pero son industriales y muy caros. Para piezas de metal, generalmente es mejor mecanizado CNC o fundición." },
    ],
    galleryImages: pick("lion-king-figures.jpg", "custom-brackets.jpg", "intake-manifold.jpg", "red-adapter.jpg", "blue-molds.jpg", "stranger-things-diorama.jpg"),
    related: [
      { label: "Recambios Impresión 3D Barcelona", slug: "/recambios-impresion-3d-barcelona" },
      { label: "Piezas Personalizadas 3D Barcelona", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Impresión 3D Multicolor", slug: "/impresion-3d-multicolor" },
      { label: "Impresión 3D — Qué es y Cómo Funciona", slug: "/impresion-3d" },
      { label: "Prototipos 3D Barcelona", slug: "/prototipos-3d-barcelona" },
    ],
    schemaServiceName: "¿Qué se Puede Imprimir en 3D? — Guía",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
  },

  {
    slug: "/blog/convertir-foto-en-modelo-3d",
    topic: "blog-convertir-foto-3d",
    altSlug: "/blog/convertir-foto-en-modelo-3d",
    lang: "es",
    category: "guide",
    metaTitle: "Convertir Foto en Modelo 3D — Opciones y Proceso",
    metaDescription: "¿Cómo convertir una foto en un modelo 3D para imprimir? Escáneres 3D, fotogrametría, modelado manual. Y la opción más práctica: mandarnos la foto.",
    h1: "Convertir una foto en modelo 3D: opciones, herramientas y cómo lo hacemos",
    intro: "No todo el mundo tiene un modelo 3D listo para imprimir. Muchas personas tienen una foto de la pieza que necesitan: una pieza rota, un objeto que quieren replicar, o un diseño de referencia. Esta guía explica cómo pasar de una foto a una pieza impresa en 3D, qué herramientas existen y cuándo tiene sentido encargarnos el diseño directamente.",
    sections: [
      {
        heading: "¿Se puede imprimir directamente desde una foto?",
        body: "No directamente. Las impresoras 3D necesitan un archivo con geometría 3D (STL, 3MF, OBJ, STEP) — una foto solo tiene información 2D de píxeles. Para imprimir desde una foto necesitas primero convertirla en un modelo 3D.\n\nHay tres métodos para hacerlo, con distinta complejidad y resultado."
      },
      {
        heading: "Método 1: fotogrametría (escaneado a partir de fotos)",
        body: "La fotogrametría convierte múltiples fotos tomadas desde distintos ángulos en un modelo 3D. Softwares como RealityCapture, Meshroom (gratuito) o aplicaciones móviles como Polycam o Luma AI automatizan el proceso.\n\n**Funciona bien para**: objetos irregulares o artísticos, esculturas, figuras, superficies orgánicas.\n**No funciona bien para**: objetos pequeños, superficies muy reflectantes, geometrías con partes ocultas.\n\nEl resultado es un modelo de malla con alta fidelidad visual pero que puede necesitar limpieza (Meshmixer, Blender) antes de imprimir."
      },
      {
        heading: "Método 2: modelado paramétrico a partir de medidas",
        body: "Para piezas técnicas (recambios, soportes, adaptadores), el mejor resultado se obtiene modelando la pieza desde cero con un software CAD (Fusion 360, FreeCAD, OpenSCAD) a partir de las medidas reales.\n\n**Funciona bien para**: recambios con geometría definida, piezas de ingeniería, copias exactas.\n**Requiere**: saber modelar en CAD, o encargárselo a alguien que sepa.\n\nEs el método que usamos en Dimension3D cuando un cliente nos manda una pieza rota y medidas. El resultado es un modelo paramétrico preciso, no una malla aproximada."
      },
      {
        heading: "Método 3: escáner 3D dedicado",
        body: "Los escáneres 3D (Revopoint, Creality Raptor, escáneres industriales) generan nubes de puntos muy precisas de un objeto. Son más rápidos y precisos que la fotogrametría para objetos medianos.\n\n**Funciona bien para**: piezas mecánicas, ingeniería inversa profesional.\n**Desventaja**: los buenos escáneres cuestan cientos o miles de euros. No es una opción para el usuario casual."
      },
      {
        heading: "La opción más práctica: mandarnos la foto",
        body: "Para la mayoría de los casos — especialmente recambios de piezas rotas — no necesitas ninguna de las opciones anteriores. En Dimension3D modelamos la pieza desde cero a partir de:\n\n• **Fotos claras** de la pieza desde varios ángulos, con una referencia de tamaño (regla, moneda).\n• **Medidas** de las dimensiones críticas si las tienes.\n• **La pieza original** (si es posible traerla al taller para tomarle medidas exactas).\n\nEl diseño tiene un coste adicional (desde 20 € para piezas sencillas) que se cotiza antes de empezar. Para piezas sencillas con geometría clara (clips, tiradores, soportes simétricos), solemos poder modelar desde una buena foto."
      },
      {
        heading: "Herramientas gratuitas para convertir fotos en 3D",
        body: "Si quieres intentarlo tú mismo:\n\n• **Polycam** — app iOS/Android para fotogrametría con el móvil. Gratuita (con límites).\n• **Luma AI** — fotogrametría en la nube a partir de un vídeo del móvil. Gratuita.\n• **Meshroom** — fotogrametría desktop open-source. Requiere GPU.\n• **Blender** — para limpiar y reparar modelos de malla. Curva de aprendizaje pronunciada.\n\nEl proceso típico: múltiples fotos → fotogrametría → malla 3D → limpieza en Blender → export STL → impresión."
      },
    ],
    faqs: [
      { q: "¿Podéis imprimir una pieza a partir de una foto?", a: "En muchos casos sí. Mándanos fotos claras de la pieza desde varios ángulos y con una referencia de tamaño. Para piezas con geometría sencilla, podemos modelar e imprimir a partir de fotos. El diseño tiene un coste adicional (desde 20 €)." },
      { q: "¿Cuánto cuesta que modeléis una pieza desde cero?", a: "Desde 20 € para piezas sencillas (copia de una pieza rota con geometría clara). Piezas complejas pueden costar 50–120 €. Siempre cotizamos antes de empezar." },
      { q: "¿Qué es la fotogrametría?", a: "Fotogrametría es el proceso de convertir múltiples fotos tomadas desde distintos ángulos en un modelo 3D. Aplicaciones como Polycam o Luma AI lo hacen de forma casi automática desde el móvil." },
      { q: "¿Funciona bien la fotogrametría para piezas pequeñas?", a: "No muy bien. La fotogrametría funciona mejor para objetos de 10–50 cm con superficies no reflectantes. Para piezas pequeñas y técnicas, el modelado paramétrico da mejores resultados." },
      { q: "¿Podéis diseñar una pieza completamente nueva que no existe?", a: "Sí. Si describes qué necesitas (funciones, dimensiones, cómo encaja con otras piezas), diseñamos la pieza desde cero. El coste depende de la complejidad." },
    ],
    galleryImages: pick("custom-brackets.jpg", "red-adapter.jpg", "intake-manifold.jpg", "curved-parts.jpg", "black-intake.jpg", "blue-molds.jpg"),
    related: [
      { label: "Diseñamos tu Pieza — Sin Archivo", slug: "/disena-tu-pieza-3d" },
      { label: "Recambios Impresión 3D Barcelona", slug: "/recambios-impresion-3d-barcelona" },
      { label: "Piezas Personalizadas 3D Barcelona", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Impresión 3D Online", slug: "/impresion-3d-online" },
      { label: "Cómo Imprimir sin Impresora", slug: "/blog/como-imprimir-en-3d-sin-impresora" },
    ],
    schemaServiceName: "Convertir Foto en Modelo 3D — Guía",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
  },

  {
    slug: "/blog/piezas-de-recambio-impresas-3d",
    topic: "blog-piezas-recambio",
    altSlug: "/blog/piezas-de-recambio-impresas-3d",
    lang: "es",
    category: "guide",
    metaTitle: "Piezas de Recambio Impresas en 3D: Ejemplos Reales y Precios",
    metaDescription: "Adaptador VESA, rueda de lavavajillas Bosch, adaptador Gardena, embudo de café. Piezas de recambio reales impresas en 3D por Dimension3D en Barcelona.",
    h1: "Piezas de recambio impresas en 3D: 5 ejemplos reales con precios",
    intro: "La impresión 3D FDM es especialmente útil para recambios: piezas descatalogadas, piezas que el fabricante vende a precio absurdo, o piezas de un producto económico que no vale la pena reparar por el canal oficial. Esta guía muestra 5 ejemplos reales de recambios que hemos imprimido en Dimension3D, con materiales, precios orientativos y dónde encontrar más.",
    sections: [
      {
        heading: "Adaptador VESA para monitor",
        body: "Uno de los pedidos más frecuentes: el soporte VESA del monitor no encaja con el brazo porque el monitor usa un patrón no estándar. El adaptador VESA impreso en 3D resuelve el problema sin comprar un brazo nuevo.\n\nMaterial recomendado: PETG (aguanta el peso del monitor sin deformarse). Precio orientativo: 15–25 € según el modelo. Disponible en nuestro catálogo para los modelos más comunes, o imprimimos a medida a partir del patrón concreto del monitor."
      },
      {
        heading: "Rueda de cesta de lavavajillas Bosch",
        body: "Las ruedas de las cestas del lavavajillas son una de las piezas que más se rompen y que el fabricante ya no vende (o cobra 15–20 € por dos pequeños rollos de plástico). La impresión en PETG reproduce exactamente la geometría original.\n\nMaterial: PETG (resistente al agua caliente y detergentes). Precio: desde 10 € para un juego de 4 ruedas. Disponible en nuestro catálogo para los modelos Bosch más comunes."
      },
      {
        heading: "Adaptador de manguera Gardena 3/4\"",
        body: "Los conectores de manguera Gardena son propietarios y no siempre compatibles con otros sistemas de riego. El adaptador impreso en PETG o TPU (semirígido para un sellado mejor) permite conectar cualquier manguera estándar 3/4\" al sistema Gardena sin goteras.\n\nMaterial: PETG o TPU según el diseño. Precio: 10–15 €. Disponible en catálogo."
      },
      {
        heading: "Embudo dosificador de café 58mm",
        body: "Para los que usan un molino de café que no tiene embudo, o cuyo embudo se ha roto. El embudo dosificador de 58mm encaja en la portafiltro estándar de la mayoría de máquinas de espresso domésticas y semiprofesionales.\n\nMaterial: PETG (apto para contacto con alimentos en su versión certificada food-safe). Precio: 10–15 €. Disponible en catálogo."
      },
      {
        heading: "Recambios que no están en catálogo",
        body: "Estos son cuatro ejemplos de un catálogo que crece continuamente. Pero la mayoría de pedidos de recambios son piezas únicas — el tirón de una persiana, la guía de un cajón, el clip de una rejilla, el tirador de un mueble descatalogado.\n\nSi tienes una pieza rota que necesitas reproducir y no está en nuestro catálogo, mándanos una foto con una referencia de tamaño. En la mayoría de casos podemos dar precio antes de crear el modelo. El proceso habitual es: foto → valoración gratuita → confirmación → diseño (si es necesario) → impresión → entrega."
      },
      {
        heading: "Materiales para recambios: cuándo usar qué",
        body: "La elección del material determina si el recambio funciona a largo plazo:\n\n• **PETG** — el estándar para recambios. Aguanta agua, detergentes, calor moderado (<80°C) y es resistente al impacto.\n• **ABS/ASA** — para recambios del coche, piezas con calor (hasta 90°C) o exterior con UV.\n• **TPU** — para piezas que necesitan ser flexibles: juntas, tapones, piezas de sellado.\n• **PLA** — solo para recambios puramente estéticos sin carga ni calor (embellecedores, tapas).\n• **Nylon** — para recambios de alta resistencia mecánica y desgaste (engranajes, poleas, ruedas con carga)."
      },
    ],
    faqs: [
      { q: "¿Qué recambios tenéis en catálogo?", a: "Adaptador VESA para monitor, rueda de cesta de lavavajillas Bosch, adaptador de manguera Gardena y embudo dosificador de café 58mm. Estamos ampliando el catálogo continuamente." },
      { q: "¿Podéis fabricar un recambio que no está en catálogo?", a: "Sí. Mándanos una foto de la pieza con una referencia de tamaño y te decimos si es viable. Para piezas con geometría clara, podemos modelar e imprimir sin catálogo." },
      { q: "¿Cuánto dura un recambio impreso en 3D?", a: "Un recambio bien diseñado en el material adecuado dura años. PETG para lavavajillas, TPU para juntas flexibles, ABS/ASA para piezas de coche expuestas al calor. Muchos de nuestros clientes llevan años usando los recambios que les imprimimos." },
      { q: "¿Los recambios impresos en 3D son aptos para contacto con alimentos?", a: "PETG estándar no tiene certificación food-safe. Para piezas en contacto directo con alimentos, usamos PETG food-safe certificado (puede suponer un pequeño recargo) o recomendamos un sellador adecuado." },
      { q: "¿Qué es mejor, PETG o ABS para recambios de electrodomésticos?", a: "Depende de la temperatura. Para lavavajillas, lavadoras y frigoríficos, PETG es suficiente. Para secadoras, hornos o piezas cerca del motor del coche, ABS o ASA son más seguros." },
    ],
    galleryImages: pick("red-adapter.jpg", "intake-manifold.jpg", "custom-brackets.jpg", "curved-parts.jpg", "ferrari-key-holder.jpg", "blue-molds.jpg"),
    related: [
      { label: "Recambios Impresión 3D Barcelona", slug: "/recambios-impresion-3d-barcelona" },
      { label: "Adaptador VESA Monitor", slug: "/adaptador-vesa-monitor" },
      { label: "Rueda Lavavajillas Bosch", slug: "/rueda-cesto-lavavajillas-bosch" },
      { label: "Adaptador Manguera Gardena", slug: "/adaptador-manguera-gardena" },
      { label: "Piezas Personalizadas 3D Barcelona", slug: "/piezas-personalizadas-3d-barcelona" },
    ],
    schemaServiceName: "Piezas de Recambio Impresas en 3D — Guía",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
  },
];
