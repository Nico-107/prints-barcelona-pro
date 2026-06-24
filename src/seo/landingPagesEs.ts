import type { LandingContent } from "./landingPages";

const pick = (...names: string[]) => names.map((n) => `/projects/${n}`);

export const PAGES_ES: LandingContent[] = [
  {
    slug: "/impresion-3d-barcelona",
    topic: "service-3d-printing",
    altSlug: "/3d-printing-barcelona",
    lang: "es",
    category: "service",
    metaTitle: "Impresión 3D en Barcelona — Presupuesto en 1h, Entrega 24–48h | Dimension3D",
    metaDescription: "Servicio profesional de impresión 3D en Barcelona. Envía tu archivo STL/STEP — presupuesto en menos de 1 hora, entrega en 24–48h. Piezas funcionales, prototipos y piezas a medida. Recogida local o envío a España.",
    h1: "Impresión 3D en Barcelona — Presupuesto en 1h, Entrega Rápida",
    intro: "Dimension3D es un estudio de impresión 3D ubicado en Barcelona que ayuda a particulares, makers, ingenieros y pequeñas empresas a fabricar piezas físicas de forma rápida, limpia y a un precio justo. Desde un solo recambio hasta una pequeña tirada de prototipos funcionales, gestionamos todo el proceso de forma local en la ciudad.",
    sections: [
      {
        heading: "Qué imprimimos cada semana en Barcelona",
        body: "Nuestro día a día combina piezas únicas a medida, recambios de objetos rotos o descatalogados, prototipos de diseño para startups locales y regalos personalizados. Trabajamos con tecnología FDM y una selección cuidada de materiales (PLA, PETG, ABS/ASA, Nylon y TPU), para elegir el plástico adecuado en lugar de imponer uno solo a todos los proyectos.\n\nSi tienes un archivo 3D (STL, OBJ, 3MF, STEP) podemos presupuestarlo casi al instante. Si solo tienes una foto, un boceto o la pieza rota, te ayudamos a convertirlo en algo imprimible. La idea es siempre la misma: tú nos cuentas el problema, nosotros entregamos la pieza."
      },
      {
        heading: "Por qué elegir un proveedor local en Barcelona",
        body: "Trabajar con una imprenta 3D en tu propia ciudad lo cambia todo. Te ahorras envíos internacionales, aduanas y barreras de idioma. Puedes recoger tu pedido en Barcelona con cita previa, o recibirlo en cualquier punto de la España peninsular con seguimiento. Los presupuestos llegan en menos de 1 hora en horario laboral por WhatsApp y podemos enseñarte muestras reales antes de imprimir.\n\nSer locales también nos permite iterar rápido. Si un prototipo necesita un pequeño cambio, lo ajustamos y reimprimimos el mismo día en lugar de esperar una semana a un proveedor extranjero."
      },
      {
        heading: "Entregas rápidas y servicio el mismo día",
        body: "Los pedidos estándar se entregan en 2–5 días laborables. Para encargos realmente urgentes ofrecemos servicio Express en 24–48 horas, e incluso producción el mismo día cuando la cola lo permite. Si tienes una fecha límite — un evento, una demo a un cliente, un electrodoméstico parado — dínoslo desde el principio y te diremos con honestidad qué es viable.\n\nNunca enviamos una pieza que no nos quedaríamos para nosotros. Cada impresión se revisa en cuanto a adherencia entre capas, precisión dimensional y acabado antes de salir del taller."
      },
      {
        heading: "Cómo es el proceso",
        body: "1. Envíanos tu archivo o describe lo que necesitas en el formulario o por WhatsApp.\n2. Te respondemos con un precio claro, el material recomendado y los plazos.\n3. Tú apruebas, imprimimos, revisamos y recibes la pieza.\n\nSin suscripciones, sin pedido mínimo y sin sorpresas en el precio."
      }
    ],
    faqs: [
      { q: "¿En cuánto tiempo puedo tener una impresión 3D en Barcelona?", a: "El plazo estándar es de 2–5 días laborables. Tenemos servicio Express en 24–48 horas e incluso entregas el mismo día según la cola y el tamaño de la pieza." },
      { q: "¿Necesito un archivo 3D para hacer un pedido?", a: "No. Si solo tienes una foto, un boceto o la pieza rota original, te ayudamos a llegar a un archivo imprimible. También ofrecemos diseño a medida bajo presupuesto." },
      { q: "¿Puedo recoger mi pedido en Barcelona?", a: "Sí, ofrecemos recogida local en Barcelona con cita previa. También enviamos a toda la España peninsular con seguimiento." },
      { q: "¿Cuánto cuesta una impresión 3D?", a: "La mayoría de piezas pequeñas empiezan desde 10€. El precio final depende del tamaño, el material, el tiempo de impresión y la cantidad. Siempre recibes un presupuesto transparente antes de pagar nada." }
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "green-chameleon.jpg", "eiffel-tower.jpg", "purple-figures.jpg", "halloween-set.jpg", "intake-manifold.jpg"),
    related: [
      { label: "Piezas Personalizadas", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Prototipos 3D", slug: "/prototipos-3d-barcelona" },
      { label: "Impresión 3D Urgente", slug: "/impresion-3d-urgente-barcelona" },
      { label: "Precios", slug: "/precio-impresion-3d-barcelona" }
    ],
    schemaServiceName: "Servicio de Impresión 3D Barcelona"
  },
  {
    slug: "/piezas-personalizadas-3d-barcelona",
    topic: "custom-parts",
    altSlug: "/custom-parts-barcelona",
    lang: "es",
    category: "use-case",
    metaTitle: "Piezas 3D a Medida Barcelona — STL/STEP o Foto, Presupuesto en 1h | Dimension3D",
    metaDescription: "Piezas 3D a medida en Barcelona desde tu STL, STEP o foto. Recambios funcionales, soportes, clips de coche y prototipos. Presupuesto profesional en menos de 1 hora. Sin pedido mínimo.",
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
        body: "No hay pedido mínimo. Tan contentos imprimimos un solo soporte de recambio como una pequeña serie de piezas idénticas para un taller, una clínica dental, un estudio de arquitectura o una tienda local. Para clientes habituales guardamos el archivo, así los reencargos son inmediatos."
      },
      {
        heading: "Pensadas para durar de verdad",
        body: "Una pieza impresa en 3D solo es tan buena como su material y sus parámetros de impresión. Elegimos el plástico y la densidad de relleno según la función real de la pieza, no el más barato. Por eso muchas piezas a medida de Dimension3D son más duraderas que el plástico inyectado original que sustituyen."
      }
    ],
    faqs: [
      { q: "¿Podéis copiar una pieza rota a partir de una foto?", a: "En muchos casos sí — sobre todo piezas simétricas o con geometría sencilla. Envía una foto clara con regla o moneda como referencia y te lo confirmamos enseguida." },
      { q: "¿Qué material recomendáis para piezas a medida?", a: "PLA para piezas decorativas o sin esfuerzo, PETG para exteriores o carga moderada, ABS/ASA para resistencia al calor y TPU para piezas flexibles como mangos o juntas." },
      { q: "¿Hay pedido mínimo?", a: "No. Imprimimos piezas únicas constantemente, y solo pagas por lo que pides." },
      { q: "¿Qué precisión tienen las piezas a medida?", a: "La precisión típica en FDM es de unos ±0,2 mm. Para tolerancias más ajustadas afinamos parámetros y postprocesamos las superficies críticas." }
    ],
    galleryImages: pick("custom-brackets.jpg", "ferrari-key-holder.jpg", "red-adapter.jpg", "intake-manifold.jpg", "black-intake.jpg", "curved-parts.jpg"),
    related: [
      { label: "Recambios 3D", slug: "/recambios-impresion-3d-barcelona" },
      { label: "Prototipos 3D", slug: "/prototipos-3d-barcelona" },
      { label: "Impresión PETG", slug: "/impresion-petg-barcelona" },
      { label: "Impresión 3D Urgente", slug: "/impresion-3d-urgente-barcelona" }
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
        body: "Una vez validado el prototipo, podemos escalar a tiradas de baja producción (típicamente 5–200 unidades según el tamaño) sin que tengas que cambiar de proveedor. Esa continuidad importa cuando intentas lanzar un producto, no solo imprimirlo."
      }
    ],
    faqs: [
      { q: "¿Qué formatos de archivo 3D aceptáis?", a: "STL, OBJ, 3MF y STEP. También podemos trabajar con exportaciones nativas de tu CAD — pregúntanos." },
      { q: "¿Firmáis NDA para prototipos confidenciales?", a: "Sí. Firmamos NDA habitualmente con startups de hardware y departamentos de I+D." },
      { q: "¿Hacéis pequeñas tiradas de producción tras el prototipo?", a: "Sí, producimos tiradas de 5–200 unidades una vez validado el diseño." },
      { q: "¿Cuánto se tarda en una iteración?", a: "La mayoría de iteraciones de prototipo están listas en 24–72 horas según tamaño y material." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "black-intake.jpg", "red-adapter.jpg", "blue-molds.jpg", "curved-parts.jpg"),
    related: [
      { label: "Piezas Personalizadas", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Impresión 3D Urgente", slug: "/impresion-3d-urgente-barcelona" },
      { label: "Precios", slug: "/precio-impresion-3d-barcelona" },
      { label: "Impresión PETG", slug: "/impresion-petg-barcelona" }
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
      { q: "¿Las impresiones urgentes pueden tener buena calidad?", a: "Sí. No sacrificamos adherencia entre capas, precisión dimensional ni acabado por la velocidad — solo damos prioridad a tu encargo." }
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "halloween-set.jpg", "stranger-things-lit.jpg", "lion-king-figures.jpg", "intake-manifold.jpg", "custom-brackets.jpg"),
    related: [
      { label: "Recambios 3D", slug: "/recambios-impresion-3d-barcelona" },
      { label: "Piezas Personalizadas", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Prototipos 3D", slug: "/prototipos-3d-barcelona" },
      { label: "Precios", slug: "/precio-impresion-3d-barcelona" }
    ],
    schemaServiceName: "Impresión 3D Urgente Barcelona"
  },
  {
    slug: "/precio-impresion-3d-barcelona",
    topic: "pricing",
    altSlug: "/3d-printing-price-barcelona",
    lang: "es",
    category: "service",
    metaTitle: "Precio Impresión 3D Barcelona — Desde 10€, Presupuesto Gratis en 1h | Dimension3D",
    metaDescription: "¿Cuánto cuesta la impresión 3D en Barcelona? Piezas pequeñas desde 10€. Precios transparentes por tamaño, material y cantidad. Presupuesto gratis en menos de 1 hora, sin compromiso.",
    h1: "Precio de Impresión 3D en Barcelona",
    intro: "Una de las primeras preguntas de cualquier cliente es: ¿cuánto va a costar mi impresión 3D? En esta página explicamos exactamente qué determina el precio de una impresión 3D en Barcelona, con ejemplos realistas, para que puedas planificar tu proyecto sin sorpresas.",
    sections: [
      {
        heading: "Qué determina el precio",
        body: "Tres factores marcan principalmente el precio de una impresión 3D:\n\n1. Coste del material — PLA es el más asequible; PETG, ABS/ASA y TPU cuestan algo más; Nylon y Nylon-CF son los más premium.\n2. Tiempo y tamaño — las piezas más grandes y altas usan más plástico y ocupan la máquina más tiempo.\n3. Complejidad — soportes pesados, detalle muy fino, postprocesado o montaje añaden trabajo.\n\nTe damos un precio único y transparente que ya incluye preparación, laminado, material, tiempo de máquina y acabado básico."
      },
      {
        heading: "Rangos de precio típicos",
        body: "Estas referencias son realistas para impresiones FDM en Barcelona:\n\n• Piezas pequeñas (clip, pomo, gancho, figura pequeña): desde 10€.\n• Piezas medianas (soporte, organizador, decoración, figura mediana): normalmente 20–60€.\n• Piezas grandes (cascos, jarrones, carcasas grandes, figuras altas): normalmente 60–250€.\n• Pequeñas tiradas: pide precio por unidad — las piezas repetidas salen más baratas.\n\nSon referencias de partida. El presupuesto exacto depende de tu archivo, material y plazo."
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
      { q: "¿Cuál es la impresión 3D más barata?", a: "Piezas pequeñas y simples en PLA desde unos 10€. Materiales más resistentes o tamaños mayores cuestan más." },
      { q: "¿Cobráis por el presupuesto?", a: "No. Los presupuestos son siempre gratis y solo pagas si confirmas el pedido." },
      { q: "¿Por qué la misma pieza cuesta más en PETG o Nylon?", a: "Esos filamentos son más caros e imprimen más despacio con parámetros más exigentes, pero duran mucho más en aplicaciones con esfuerzo o exteriores." },
      { q: "¿Las cantidades grandes salen más baratas por pieza?", a: "Sí. Indícanos la cantidad y te enviamos un precio escalado." }
    ],
    galleryImages: pick("custom-brackets.jpg", "ferrari-key-holder.jpg", "purple-figures.jpg", "cookie-cutters.jpg", "blue-molds.jpg", "red-adapter.jpg"),
    related: [
      { label: "Servicio de Impresión 3D", slug: "/impresion-3d-barcelona" },
      { label: "Piezas Personalizadas", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Impresión PLA", slug: "/impresion-pla-barcelona" },
      { label: "Prototipos 3D", slug: "/prototipos-3d-barcelona" }
    ],
    schemaServiceName: "Precios Impresión 3D Barcelona"
  },
  {
    slug: "/recambios-impresion-3d-barcelona",
    topic: "replacement-parts",
    altSlug: "/replacement-parts-barcelona",
    lang: "es",
    category: "use-case",
    metaTitle: "Recambios 3D Barcelona — Clips Rotos, Electrodomésticos y Piezas Descatalogadas | Dimension3D",
    metaDescription: "Recambios impresos en 3D en Barcelona para electrodomésticos, muebles y vehículos. Clips rotos, mandos, soportes y piezas descatalogadas. De foto a pieza en 24–48h. Desde 10€.",
    h1: "Recambios Impresos en 3D en Barcelona",
    intro: "Tirar un electrodoméstico que funciona perfectamente por culpa de un trozo minúsculo de plástico roto no tiene sentido — ni a nivel ambiental ni económico. Dimension3D fabrica recambios impresos en 3D en Barcelona para electrodomésticos, mobiliario, objetos antiguos y cualquier producto cuyo recambio original ya no esté disponible.",
    sections: [
      {
        heading: "Recambios que hacemos a diario",
        body: "Encargos habituales en Barcelona:\n\n• Cajetines, tiradores y clips de lavadoras y lavavajillas.\n• Soportes de baldas, guías y bisagras de neveras.\n• Adaptadores y clips de aspiradoras.\n• Pomos y piezas de depósitos de cafeteras.\n• Conectores de muebles y soportes de baldas.\n• Piezas para radios antiguas, cámaras y juguetes vintage.\n• Clips, soportes y accesorios para bici y patinete.\n\nSi la pieza original se rompió, deformó o simplemente desapareció, hay muchas posibilidades de que la podamos recrear."
      },
      {
        heading: "Cuando la pieza ya no se vende",
        body: "Muchos fabricantes dejan de vender recambios al cabo de unos años, dejando al propietario con un producto perfectamente funcional y un trozo de plástico de 5€ que falta. Podemos hacer ingeniería inversa de la pieza a partir de una foto clara con escala, de la pieza rota original o de tus medidas, y la imprimimos en un material que dure más que el original."
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
      { q: "¿Reparar es más barato que comprar nuevo?", a: "Casi siempre. Una pieza impresa cuesta normalmente 10–60€ frente a cientos por un electrodoméstico nuevo." },
      { q: "¿Imprimís piezas para equipos antiguos?", a: "Sí. Cámaras, radios, juguetes y electrodomésticos antiguos son algunos de nuestros encargos favoritos porque ya no existen recambios originales." }
    ],
    galleryImages: pick("custom-brackets.jpg", "red-adapter.jpg", "curved-parts.jpg", "black-intake.jpg", "intake-manifold.jpg", "ferrari-key-holder.jpg"),
    related: [
      { label: "Piezas Personalizadas", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Impresión PETG", slug: "/impresion-petg-barcelona" },
      { label: "Impresión 3D Urgente", slug: "/impresion-3d-urgente-barcelona" },
      { label: "Servicio de Impresión 3D", slug: "/impresion-3d-barcelona" }
    ],
    schemaServiceName: "Recambios Impresos 3D Barcelona"
  },
  {
    slug: "/impresion-pla-barcelona",
    topic: "pla",
    altSlug: "/pla-printing-barcelona",
    lang: "es",
    category: "material",
    metaTitle: "Impresión PLA Barcelona — Prototipos, Regalos y Decoración | Dimension3D",
    metaDescription: "Impresión 3D en PLA en Barcelona — precisa, económica y ecológica. Prototipos, decoraciones, regalos personalizados y figuras. Amplia gama de colores. Presupuesto gratis en menos de 1 hora.",
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
        body: "Como el PLA imprime rápido y de forma fiable, también es uno de los materiales más asequibles. Las piezas pequeñas en PLA empiezan desde 10€ y la mayoría de pedidos en PLA salen en 2–5 días laborables. Hay servicio Express para urgencias."
      }
    ],
    faqs: [
      { q: "¿Es el PLA suficientemente fuerte para piezas funcionales?", a: "Para esfuerzos bajos o moderados, sí. Para piezas con carga o altas temperaturas recomendamos PETG, ABS/ASA o Nylon." },
      { q: "¿Es realmente biodegradable el PLA?", a: "Sí, en condiciones de compostaje industrial. En un cajón normal dura años." },
      { q: "¿Podéis imprimir PLA en cualquier color?", a: "Tenemos un amplio surtido. Para colores especiales, dinos la referencia y buscamos la coincidencia más cercana." },
      { q: "¿Cuál es el tamaño máximo en PLA?", a: "El volumen máximo típico es de unos 250×250×300 mm en una pieza. Objetos mayores se imprimen en partes y se ensamblan." }
    ],
    galleryImages: pick("eiffel-tower.jpg", "big-ben-tower.jpg", "green-chameleon.jpg", "purple-figures.jpg", "halloween-set.jpg", "ferrari-key-holder.jpg"),
    related: [
      { label: "Impresión PETG", slug: "/impresion-petg-barcelona" },
      { label: "Impresión TPU", slug: "/impresion-tpu-barcelona" },
      { label: "Miniaturas 3D", slug: "/miniaturas-3d-barcelona" },
      { label: "Precios", slug: "/precio-impresion-3d-barcelona" }
    ],
    schemaServiceName: "Impresión PLA Barcelona"
  },
  {
    slug: "/impresion-petg-barcelona",
    topic: "petg",
    altSlug: "/petg-printing-barcelona",
    lang: "es",
    category: "material",
    metaTitle: "Impresión PETG Barcelona — Piezas Funcionales y Exteriores | Dimension3D",
    metaDescription: "Impresión 3D en PETG en Barcelona. Más resistente que el PLA, soporta agua y UV. Envía tu STL/STEP — presupuesto en 1h. Ideal para piezas funcionales, mecánicas y de exterior.",
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
        body: "Envía tu archivo STL/STEP o describe la pieza en el formulario. Te sugeriremos el espesor de pared y el relleno adecuados para que la pieza sea suficientemente fuerte sin ser innecesariamente cara. Las piezas pequeñas en PETG empiezan desde 12–15€."
      }
    ],
    faqs: [
      { q: "¿En qué se diferencia el PETG del PLA?", a: "El PETG es más duro, más flexible al impacto, más resistente al calor y soporta el exterior. El PLA es más fácil de imprimir, capta más detalle y es más barato." },
      { q: "¿Aguanta el PETG los veranos de Barcelona en exterior?", a: "Sí. El PETG resiste bien UV y humedad. Para aplicaciones de mucho calor podemos sugerir ABS/ASA." },
      { q: "¿Es el PETG apto para alimentos?", a: "El PETG estándar no está certificado para contacto alimentario. Existe PETG certificado food-safe y podemos conseguirlo para proyectos específicos." },
      { q: "¿Es el PETG más caro que el PLA?", a: "Algo. El material cuesta un poco más e imprime más lento, así que el precio por pieza es típicamente un 15–30% mayor que en PLA." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "black-intake.jpg", "red-adapter.jpg", "curved-parts.jpg", "blue-molds.jpg"),
    related: [
      { label: "Impresión PLA", slug: "/impresion-pla-barcelona" },
      { label: "Impresión TPU", slug: "/impresion-tpu-barcelona" },
      { label: "Piezas Personalizadas", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Recambios 3D", slug: "/recambios-impresion-3d-barcelona" }
    ],
    schemaServiceName: "Impresión PETG Barcelona"
  },
  {
    slug: "/impresion-tpu-barcelona",
    topic: "tpu",
    altSlug: "/tpu-printing-barcelona",
    lang: "es",
    category: "material",
    metaTitle: "Impresión TPU Flexible Barcelona — Juntas, Mangos y Piezas de Goma | Dimension3D",
    metaDescription: "Impresión 3D flexible en TPU en Barcelona. Piezas tipo goma para soportes de móvil, juntas, mangos y wearables. Envía STL/STEP — piezas flexibles a medida en 24–72h.",
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
        body: "Envía tu archivo STL/STEP o describe lo que necesitas. Dinos cómo de flexible quieres que se sienta la pieza — blando y blandito, tipo goma, o firme pero doblable — y adaptamos la geometría. Las piezas pequeñas en TPU empiezan normalmente en 15€."
      }
    ],
    faqs: [
      { q: "¿Cómo de flexible es vuestro TPU?", a: "El TPU 95A estándar se comporta como una goma dura — se dobla y estira pero no es blandurri. Podemos ajustar la sensación cambiando espesor de pared y relleno." },
      { q: "¿Puedo imprimir una funda de móvil a medida en TPU?", a: "Sí, siempre que tengas o puedas aportar un modelo 3D de la forma de tu móvil. También adaptamos modelos existentes." },
      { q: "¿Es el TPU bueno para piezas de exterior?", a: "Sí — resiste bien UV y humedad y mantiene su flexibilidad en un rango amplio de temperatura." },
      { q: "¿Por qué es el TPU más caro que el PLA?", a: "Imprime mucho más lento y requiere afinar parámetros. La diferencia suele ser un 30–50% más por pieza." }
    ],
    galleryImages: pick("curved-parts.jpg", "custom-brackets.jpg", "red-adapter.jpg", "black-intake.jpg", "intake-manifold.jpg", "blue-molds.jpg"),
    related: [
      { label: "Impresión PLA", slug: "/impresion-pla-barcelona" },
      { label: "Impresión PETG", slug: "/impresion-petg-barcelona" },
      { label: "Piezas Personalizadas", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Recambios 3D", slug: "/recambios-impresion-3d-barcelona" }
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
      { q: "¿Podéis diseñar una miniatura a partir de una foto?", a: "Sí, presupuestamos el diseño 3D a medida desde fotos o referencias y luego imprimimos el resultado." }
    ],
    galleryImages: pick("purple-figures.jpg", "lion-king-figures.jpg", "lion-king-scene.jpg", "stranger-things-diorama.jpg", "stranger-things-lit.jpg", "halloween-set.jpg"),
    related: [
      { label: "Impresión PLA", slug: "/impresion-pla-barcelona" },
      { label: "Piezas Personalizadas", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Servicio de Impresión 3D", slug: "/impresion-3d-barcelona" },
      { label: "Precios", slug: "/precio-impresion-3d-barcelona" }
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
    metaTitle: "Impresión 3D para Empresas en Barcelona — Piezas Técnicas y Tiradas Cortas | Dimension3D",
    metaDescription: "Impresión 3D profesional para empresas e ingenieros en Barcelona. Envía tu archivo STL/STEP — presupuesto en 1 hora. Piezas funcionales y técnicas, utillaje, tiradas cortas. NDA disponible.",
    h1: "Impresión 3D para Empresas en Barcelona",
    intro: "Dimension3D trabaja con equipos de ingeniería, departamentos de I+D, talleres y pequeños fabricantes en Barcelona que necesitan piezas 3D funcionales sin los tiempos y la burocracia de un proveedor industrial. Envía tu archivo — STL, STEP o IGES — y recibe presupuesto profesional en menos de una hora. Sin cuenta, sin concurso, sin volumen mínimo.",
    sections: [
      {
        heading: "Qué producimos para clientes empresa",
        body: "Nuestros clientes empresa nos usan para una amplia gama de aplicaciones técnicas e industriales:\n\n• Utillaje, jigs, fixtures y herramientas de fin de brazo para líneas de producción.\n• Prototipos funcionales para validación y presentaciones a clientes.\n• Carcasas y cajas para electrónica y PCBs.\n• Piezas de repuesto y componentes de desgaste para maquinaria.\n• Tiradas cortas de producción de 5 a 200 piezas idénticas.\n• Soportes de montaje, guías de cable y hardware para rack.\n\nTrabajamos en PETG, ABS/ASA, Nylon y Nylon-CF para aplicaciones estructurales, y en PLA o PETG para piezas funcionales de baja carga. Si tu aplicación requiere un material o tolerancia específicos, dínoslo desde el principio."
      },
      {
        heading: "STL, STEP e IGES aceptados — presupuesto profesional en 1 hora",
        body: "Envíanos tu archivo por el formulario de subida o directamente por WhatsApp. Trabajamos con todos los formatos CAD estándar: STL, STEP, IGES, OBJ y 3MF. Si usas SolidWorks, Fusion 360, Onshape, CATIA o FreeCAD, exporta en cualquiera de esos formatos.\n\nRevisamos cada archivo manualmente antes de presupuestar — comprobando espesor de pared, necesidad de soportes, orientación y adecuación del material — para que el presupuesto refleje el coste real y el plazo real, no una estimación automática. Recibirás un precio detallado en menos de 60 minutos en horario laboral."
      },
      {
        heading: "Tiradas cortas y pedidos repetidos",
        body: "Una vez que la pieza está validada, podemos gestionar pedidos repetidos sin volver a presupuestar desde cero. Conservamos el archivo laminado y los parámetros de impresión. Para cantidades de 5–200 piezas, el coste unitario baja con el volumen — pide precio por tramos al solicitar presupuesto.\n\nTambién podemos entregar en tu taller u oficina de Barcelona por mensajería, o enviar a cualquier dirección de la España peninsular con seguimiento."
      },
      {
        heading: "Confidencialidad y NDA",
        body: "Firmamos NDA para cualquier proyecto que lo requiera. La confidencialidad es práctica habitual para nosotros — nunca compartimos archivos, diseños ni detalles de proyectos de clientes. Si tu departamento de I+D o equipo de ingeniería necesita discreción, lo gestionamos como punto de partida, no como excepción."
      }
    ],
    faqs: [
      { q: "¿Firmáis NDA para proyectos de empresa?", a: "Sí. Firmamos NDA para cualquier cliente que lo solicite. Nunca compartimos archivos ni detalles de proyectos de clientes." },
      { q: "¿Qué formatos de archivo aceptáis?", a: "STL, STEP, IGES, OBJ y 3MF. Exportaciones nativas de SolidWorks, Fusion 360, Onshape y la mayoría de herramientas funcionan directamente." },
      { q: "¿Podéis suministrar 50 o 100 piezas idénticas?", a: "Sí. Realizamos tiradas cortas de producción de 5 a 200 unidades. El precio unitario baja con la cantidad — pide presupuesto por tramos." },
      { q: "¿Qué tolerancias podéis mantener?", a: "La precisión FDM típica es ±0,2 mm. Para características de tolerancia más ajustada ajustamos parámetros y podemos post-procesar superficies críticas. Indícanos el requisito desde el principio." }
    ],
    galleryImages: pick("intake-manifold.jpg", "black-intake.jpg", "custom-brackets.jpg", "blue-molds.jpg", "curved-parts.jpg", "red-adapter.jpg"),
    related: [
      { label: "Prototipos 3D", slug: "/prototipos-3d-barcelona" },
      { label: "Prototipado Rápido", slug: "/prototipado-rapido-barcelona" },
      { label: "Piezas Funcionales", slug: "/piezas-funcionales-barcelona" },
      { label: "Impresión Urgente", slug: "/impresion-3d-urgente-barcelona" }
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
    metaTitle: "Prototipado Rápido Barcelona — Ciclo 24–72h, STL/STEP Aceptado | Dimension3D",
    metaDescription: "Prototipado rápido en Barcelona para ingenieros y startups. Envía tu archivo STL o STEP — prototipo funcional en 24–72 horas. Itera rápido. PETG, Nylon, ABS. NDA disponible.",
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
        body: "Cada archivo revisado pasa por el mismo ciclo de revisión en el día y producción en 24–72h. Sin suscripción, sin pedido mínimo por iteración y sin burocracia — subes, revisamos, presupuestamos, apruebas, imprimimos. Para clientes que iteran con frecuencia conservamos tu proyecto en archivo y podemos recibir revisiones por WhatsApp directamente."
      },
      {
        heading: "Del prototipo a la tirada corta de producción",
        body: "Una vez que el diseño está cerrado, podemos pasar sin fisuras a tiradas cortas de producción (5–200 unidades) sin cambiar de proveedor ni renegociar condiciones. Conservamos los parámetros de impresión validados y podemos programar una tirada con poco margen de preaviso."
      }
    ],
    faqs: [
      { q: "¿Cuánto tarda una iteración de prototipado?", a: "Normalmente entre 24 y 72 horas desde el envío del archivo hasta la pieza en mano, según tamaño, material y cola actual." },
      { q: "¿Qué formatos CAD aceptáis?", a: "STL, STEP, IGES, OBJ y 3MF. Exportaciones de SolidWorks, Fusion 360, Onshape, Rhino, FreeCAD y la mayoría de herramientas funcionan sin conversión." },
      { q: "¿Detectáis problemas de diseño antes de imprimir?", a: "Sí. Revisamos cada archivo manualmente y señalamos problemas de espesor de pared, soportes o material antes de imprimir." },
      { q: "¿Podéis hacer una tirada pequeña de producción tras el prototipo?", a: "Sí. Pasamos del prototipo a la tirada corta (5–200 unidades) sin cambiar de proveedor ni re-establecer condiciones." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "black-intake.jpg", "red-adapter.jpg", "blue-molds.jpg", "curved-parts.jpg"),
    related: [
      { label: "Impresión 3D para Empresas", slug: "/impresion-3d-empresas-barcelona" },
      { label: "Piezas Funcionales", slug: "/piezas-funcionales-barcelona" },
      { label: "Impresión 3D Urgente", slug: "/impresion-3d-urgente-barcelona" },
      { label: "Precios", slug: "/precio-impresion-3d-barcelona" }
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
    metaTitle: "Piezas Funcionales 3D Barcelona — PETG, Nylon, ABS Bajo Demanda | Dimension3D",
    metaDescription: "Piezas funcionales 3D en Barcelona en PETG, ABS, Nylon y TPU. Componentes estructurales, utillaje, piezas de uso final. Envía tu STL/STEP — presupuesto en 1 hora.",
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
        body: "Sin pedido mínimo. Imprimimos piezas funcionales individuales con la misma facilidad que un lote de 50. Para pedidos repetidos, conservamos el archivo y los parámetros para que los reencargos se gestionen en minutos. Para cantidades de 5–200, pide precio por tramos — el coste unitario baja con el volumen."
      }
    ],
    faqs: [
      { q: "¿Qué material es mejor para piezas funcionales con carga?", a: "Nylon PA12 o Nylon-CF para máxima resistencia mecánica. PETG para cargas moderadas con exposición exterior o al agua. En el presupuesto especificamos el correcto." },
      { q: "¿Cuánto resiste una pieza en PETG comparada con plástico inyectado?", a: "Una pieza PETG bien impresa al 60%+ de relleno es a menudo comparable al PP o ABS inyectado para cargas estructurales moderadas, aunque anisótropa — más resistente en el plano de impresión que entre capas." },
      { q: "¿Podéis imprimir piezas funcionales con tolerancias ajustadas?", a: "La FDM típica mantiene ±0,2 mm. Para superficies de acoplamiento críticas ajustamos parámetros y podemos post-mecanizar si se requieren tolerancias más ajustadas." },
      { q: "¿Revisáis los archivos antes de imprimir?", a: "Sí. Revisamos cada archivo manualmente. Si hay un problema — paredes finas, orientación inadecuada para la dirección de carga, soporte insuficiente — lo señalamos antes de imprimir." }
    ],
    galleryImages: pick("intake-manifold.jpg", "black-intake.jpg", "custom-brackets.jpg", "curved-parts.jpg", "blue-molds.jpg", "red-adapter.jpg"),
    related: [
      { label: "Impresión 3D para Empresas", slug: "/impresion-3d-empresas-barcelona" },
      { label: "Prototipado Rápido", slug: "/prototipado-rapido-barcelona" },
      { label: "Impresión PETG", slug: "/impresion-petg-barcelona" },
      { label: "Recambios 3D", slug: "/recambios-impresion-3d-barcelona" }
    ],
    schemaServiceName: "Piezas Funcionales 3D Barcelona"
  }
];
