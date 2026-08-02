import type { LandingContent } from "./landingPages";

const pick = (...names: string[]) => names.map((n) => `/projects/${n}`);

export const PAGES_ES: LandingContent[] = [
  {
    slug: "/impresion-3d-barcelona",
    topic: "service-3d-printing",
    altSlug: "/3d-printing-barcelona",
    lang: "es",
    category: "service",
    metaTitle: "Servicio de Impresión 3D en Barcelona — Desde 10€, en 1h",
    metaDescription: "Servicio profesional de impresión 3D en Barcelona. Piezas a medida, prototipos y recambios. Presupuesto en 1h, desde 10€. Recogida local o envío.",
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
      { q: "¿Cuánto cuesta una impresión 3D?", a: "La mayoría de piezas pequeñas empiezan desde 10€. El precio final depende del tamaño, el material, el tiempo de impresión y la cantidad. Siempre recibes un presupuesto transparente antes de pagar nada." },
      { q: "¿Ofrecéis impresión en resina o solo FDM?", a: "Trabajamos con tecnología FDM, que cubre la gran mayoría de aplicaciones prácticas — piezas funcionales, prototipos, regalos y recambios. Si un proyecto requiere realmente el nivel de detalle de la resina, te lo decimos de antemano." },
      { q: "¿Cuál es el tamaño máximo que podéis imprimir en una pieza?", a: "Nuestro volumen de impresión es de aproximadamente 250×250×300 mm. Los objetos más grandes se pueden imprimir por partes y ensamblar limpiamente, con uniones planificadas para minimizar su visibilidad." }
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
      { q: "¿Qué precisión tienen las piezas a medida?", a: "La precisión típica en FDM es de unos ±0,2 mm. Para tolerancias más ajustadas afinamos parámetros y postprocesamos las superficies críticas." },
      { q: "¿Podéis recrear una pieza solo a partir de medidas, sin el original?", a: "Sí. Si puedes aportar medidas detalladas, fotos desde varios ángulos o un croquis técnico, podemos modelar e imprimir la pieza. Para geometrías complejas, una breve consulta ayuda a aclarar los requisitos de ajuste." },
      { q: "¿Qué pasa si la pieza impresa no encaja a la primera?", a: "La FDM mantiene una precisión típica de ±0,2 mm. Si un primer intento está ligeramente fuera para un ajuste de tolerancia ajustada, aplicamos una pequeña corrección dimensional (normalmente 0,1–0,2 mm) y reimprimimos a coste reducido." }
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
      { q: "¿Cuánto se tarda en una iteración?", a: "La mayoría de iteraciones de prototipo están listas en 24–72 horas según tamaño y material." },
      { q: "¿Es mejor la FDM que la resina para mi prototipo?", a: "Para prototipos funcionales que hay que manipular, probar o someter a esfuerzo, la FDM suele ser mejor — produce piezas más resistentes en una gama de materiales más amplia. La resina tiene mayor detalle superficial pero es más frágil. Te asesoramos según lo que el prototipo tiene que demostrar." },
      { q: "¿Qué pasa si detectáis un problema en mi archivo durante la revisión?", a: "Lo indicamos en el presupuesto antes de empezar — problemas de espesor de pared, voladizos sin soporte, orientación que afectaría a la resistencia. Tú decides si revisar el archivo o continuar con nuestras recomendaciones." }
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
      { q: "¿Las impresiones urgentes pueden tener buena calidad?", a: "Sí. No sacrificamos adherencia entre capas, precisión dimensional ni acabado por la velocidad — solo damos prioridad a tu encargo." },
      { q: "¿Trabajáis los fines de semana para emergencias reales?", a: "Contáctanos por WhatsApp — para emergencias reales a veces podemos acomodar producción en fin de semana. No es un servicio garantizado, pero siempre vale la pena preguntar si tu situación es crítica." },
      { q: "¿Cuál es el plazo mínimo absoluto posible?", a: "Para piezas pequeñas y simples en PLA o PETG, hemos tenido pedidos listos para recogida local en tan solo 3–6 horas desde la aprobación del archivo. Las piezas más grandes o complejas siempre necesitan más tiempo." }
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
      { q: "¿Las cantidades grandes salen más baratas por pieza?", a: "Sí. Indícanos la cantidad y te enviamos un precio escalado." },
      { q: "¿El precio presupuestado es fijo una vez que lo apruebo?", a: "Sí. Una vez que apruebas un presupuesto, el precio queda bloqueado. Los presupuestos son válidos por 30 días desde su emisión — si los costes de materiales cambian significativamente después de ese periodo, puede que necesitemos revisarlo." },
      { q: "¿Puedo obtener una estimación aproximada sin enviar un archivo?", a: "Sí — describe el tamaño de la pieza, el material y la cantidad y te daremos un rango orientativo realista. Para un presupuesto exacto y vinculante, necesitamos un archivo o una foto clara con dimensiones." }
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
      { q: "¿Imprimís piezas para equipos antiguos?", a: "Sí. Cámaras, radios, juguetes y electrodomésticos antiguos son algunos de nuestros encargos favoritos porque ya no existen recambios originales." },
      { q: "¿Qué información ayuda a conseguir el resultado más preciso a la primera?", a: "Una foto clara de la pieza rota junto a una regla o moneda, una foto mostrando dónde se monta en el aparato, y la marca y modelo del dispositivo. Cuanto más contexto, mejor el ajuste en el primer intento." },
      { q: "¿Podéis hacer recambios en metal?", a: "No — trabajamos exclusivamente con filamentos poliméricos (PLA, PETG, ABS/ASA, Nylon, TPU). Para piezas metálicas necesitarías un servicio de mecanizado CNC o fundición. Nuestros recambios poliméricos frecuentemente superan la durabilidad de los originales en aplicaciones de baja temperatura." }
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
      { q: "¿Cuál es el tamaño máximo en PLA?", a: "El volumen máximo típico es de unos 250×250×300 mm en una pieza. Objetos mayores se imprimen en partes y se ensamblan." },
      { q: "¿Se puede lijar, imprimar y pintar el PLA?", a: "Sí. El PLA se lija fácilmente con lija estándar, acepta bien la imprimación acrílica y se puede pintar con aerosol o pintura acrílica. Es el material ideal para figuras y piezas decorativas que pienses acabar o personalizar." },
      { q: "¿Es el PLA seguro para el contacto con alimentos?", a: "El PLA estándar no está certificado para contacto alimentario — la superficie porosa de la FDM puede albergar bacterias incluso tras el lavado. No lo recomendamos para tazas, platos o cubiertos. Para aplicaciones de contacto alimentario, consúltanos sobre materiales certificados." }
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
      { q: "¿Es el PETG más caro que el PLA?", a: "Algo. El material cuesta un poco más e imprime más lento, así que el precio por pieza es típicamente un 15–30% mayor que en PLA." },
      { q: "¿A qué temperatura empieza a deformarse el PETG?", a: "El PETG empieza a reblandecerse alrededor de los 70–80°C. Para piezas cerca de fuentes de calor constantes — motores, lavavajillas, cerca de hornos — recomendamos ABS/ASA, que aguanta hasta 90–100°C." },
      { q: "¿Cuánto más resistente es el PETG que el PLA para piezas funcionales?", a: "El PETG ofrece típicamente un 20–30% más de resistencia al impacto que el PLA y una adherencia entre capas significativamente mejor. En la práctica, las piezas flexan bajo carga en lugar de romperse limpiamente — lo que importa en el uso mecánico real." }
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
      { q: "¿Por qué es el TPU más caro que el PLA?", a: "Imprime mucho más lento y requiere afinar parámetros. La diferencia suele ser un 30–50% más por pieza." },
      { q: "¿Qué dureza Shore tiene vuestro filamento TPU estándar?", a: "Trabajamos principalmente con dureza Shore 95A, que se nota como una goma dura — doblegable y estirable pero con estabilidad estructural bajo carga. Se pueden conseguir variantes más blandas (alrededor de 85A) para aplicaciones que necesitan más flexibilidad." },
      { q: "¿Cómo de finas pueden ser las paredes en una impresión flexible de TPU?", a: "Para impresiones flexibles fiables recomendamos un espesor mínimo de pared de 1,5–3,0 mm según la flexibilidad deseada. Las paredes muy finas quedan demasiado inestables dimensionalmente; las muy gruesas pierden la flexión deseada." }
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
      { q: "¿Podéis diseñar una miniatura a partir de una foto?", a: "Sí, presupuestamos el diseño 3D a medida desde fotos o referencias y luego imprimimos el resultado." },
      { q: "¿Qué altura de capa usáis para miniaturas de alto detalle?", a: "Para miniaturas de exhibición usamos típicamente 0,10–0,12 mm de altura de capa, que capta detalle superficial fino manteniendo tiempos de impresión prácticos. Para figuras muy pequeñas o detalle extremo podemos llegar a 0,08 mm." },
      { q: "¿Se verán las marcas de soporte en la miniatura terminada?", a: "Orientamos las piezas cuidadosamente para colocar los puntos de contacto del soporte en zonas no visibles — partes inferiores, superficies traseras, bases. Algunas marcas son inherentes al FDM; establecemos expectativas realistas por modelo antes de que apruebes la impresión." }
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
      { q: "¿Qué tolerancias podéis mantener?", a: "La precisión FDM típica es ±0,2 mm. Para características de tolerancia más ajustada ajustamos parámetros y podemos post-procesar superficies críticas. Indícanos el requisito desde el principio." },
      { q: "¿Emitís facturas completas con IVA para pedidos de empresa?", a: "Sí. Emitimos facturas completas con IVA para todos los clientes empresa. Facilítanos el nombre de tu empresa y el CIF/NIF al hacer el pedido." },
      { q: "¿Cuál es el plazo típico para una tirada de 50–100 piezas?", a: "Para la mayoría de piezas de tamaño estándar, entre 5 y 10 días laborables según el tamaño y el material. Para necesidades urgentes de tirada, contáctanos para hablar de planificación prioritaria — te diremos con honestidad qué es alcanzable." }
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
      { q: "¿Podéis hacer una tirada pequeña de producción tras el prototipo?", a: "Sí. Pasamos del prototipo a la tirada corta (5–200 unidades) sin cambiar de proveedor ni re-establecer condiciones." },
      { q: "¿En qué se diferencia esto de vuestro servicio estándar de prototipos?", a: "El prototipado rápido está configurado específicamente para ciclos de iteración múltiple rápidos. Guardamos tu proyecto entre iteraciones, aceptamos archivos de revisión directamente por WhatsApp y priorizamos el plazo de 24–72h sin volver a presupuestar desde cero cada vez." },
      { q: "¿Puedo hacer varias revisiones de diseño en la misma semana?", a: "Sí — ese es todo el punto. Cada archivo revisado pasa por el mismo ciclo de revisión en el día y producción en 24–72h. Los iteradores frecuentes comparten archivos directamente por WhatsApp y los entregamos sin demora administrativa." }
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
      { q: "¿Revisáis los archivos antes de imprimir?", a: "Sí. Revisamos cada archivo manualmente. Si hay un problema — paredes finas, orientación inadecuada para la dirección de carga, soporte insuficiente — lo señalamos antes de imprimir." },
      { q: "¿Qué densidad de relleno usáis para piezas estructurales con carga?", a: "Para cargas estructurales moderadas usamos 40–60% de relleno. Para alta carga o superficies de contacto portante usamos 80–100% sólido. Especificamos el relleno en cada presupuesto para que sepas exactamente lo que recibes." },
      { q: "¿Qué postprocesado está disponible para piezas funcionales?", a: "Insertos roscados de calor (M3, M4, M5) para conexiones con tornillo, suavizado por vapor de acetona en ABS para mejor sellado superficial, y roscado manual o lijado ligero de superficies de acoplamiento críticas. Solicita cualquier postprocesado al enviar el presupuesto." }
    ],
    galleryImages: pick("intake-manifold.jpg", "black-intake.jpg", "custom-brackets.jpg", "curved-parts.jpg", "blue-molds.jpg", "red-adapter.jpg"),
    related: [
      { label: "Impresión 3D para Empresas", slug: "/impresion-3d-empresas-barcelona" },
      { label: "Prototipado Rápido", slug: "/prototipado-rapido-barcelona" },
      { label: "Impresión PETG", slug: "/impresion-petg-barcelona" },
      { label: "Recambios 3D", slug: "/recambios-impresion-3d-barcelona" }
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
    metaTitle: "Cómo Elegir un Servicio de Impresión 3D en Barcelona — Guía del Comprador | Dimension3D",
    metaDescription: "Guía práctica para elegir servicio de impresión 3D en Barcelona: qué preguntar antes de encargar, señales a las que prestar atención, y comparativa objetiva de taller local, plataforma online y marketplace de makers.",
    h1: "Cómo Elegir un Servicio de Impresión 3D en Barcelona",
    intro: "Antes de mandar tu archivo al primer resultado de Google, dedica cinco minutos a hacer algunas preguntas concretas. Las respuestas te dicen si el precio que te van a dar refleja la pieza que realmente vas a recibir — y si el servicio que estás eligiendo encaja de verdad con tu proyecto. Esta guía repasa qué preguntar, en qué fijarte, y en qué se diferencian estructuralmente los tres modelos de servicio más comunes.",
    sections: [
      {
        heading: "Qué preguntar antes de encargar",
        body: "Un servicio de impresión 3D serio responde a todas estas preguntas con claridad y por escrito. Si alguna respuesta queda vaga, esa vaguedad ya es información.\n\n• ¿Con qué materiales trabajáis realmente y cuáles me recomendaríais para mi pieza? Un taller que ofrece veinte materiales pero solo imprime dos con regularidad es distinto de uno que mantiene seis materiales en rotación diaria.\n• ¿Qué altura de capa y qué relleno usaríais para mi presupuesto? La altura de capa (habitualmente 0,12–0,28 mm en FDM) y el porcentaje de relleno cambian directamente el precio y la resistencia de la pieza.\n• ¿Qué tolerancia podéis mantener en las medidas críticas de mi geometría? El FDM en la práctica se sitúa en torno a ±0,2 mm en la mayoría de dimensiones. Pregunta qué mide realmente el taller, no la cifra de marketing.\n• ¿Quién revisa mi archivo antes de imprimir? ¿Una persona, un algoritmo, o nada? La revisión humana detecta problemas de espesor de pared, de orientación y de soportes que el presupuesto automático no ve.\n• ¿Hay pedido mínimo? ¿Cuál es la pieza más pequeña que imprimís, y por qué precio?\n• ¿Cuál es el plazo realista desde presupuesto aprobado hasta pieza enviada, en días laborables, para el tamaño y material que os planteo?\n\nUn taller que responde a estas seis preguntas en un mensaje de WhatsApp en menos de una hora ya te ha contado mucho sobre cómo trabaja."
      },
      {
        heading: "Señales a las que prestar atención en un presupuesto",
        body: "Algunos patrones merecen una pausa antes de aprobar un encargo:\n\n• Un precio cerrado sin que nadie haya abierto el archivo. El precio en FDM es una función de gramos de plástico y horas de máquina. Sin abrir la geometría, ningún presupuesto puede reflejar ninguna de las dos cosas con precisión — una cifra instantánea suele ir con margen de seguridad, o bien ser poco realista.\n• Ningún pedido mínimo indicado en la web. Todo taller tiene uno, esté en 10€ o en 200€. No indicarlo abiertamente suele significar que se negocia caso por caso, lo que dificulta planificar el gasto.\n• Plazos de entrega vagos o inexistentes. \"Entrega rápida\" no es un plazo. \"Envío en 3–5 días laborables desde aprobación\" sí lo es.\n• Ningún canal de soporte con una persona al otro lado. Si el único punto de contacto es un formulario web que genera un número de ticket, espera que el ritmo de la comunicación se ajuste a eso.\n• Silencio sobre la revisión del archivo. Si nadie mira la geometría antes de imprimir, el taller está asumiendo que tu CAD es perfecto. La mayoría de los CAD no lo son.\n\nNinguna de estas señales por sí sola indica un mal taller — pero tres o cuatro juntas forman un patrón."
      },
      {
        heading: "Tres modelos de servicio — comparativa objetiva",
        body: "Hay tres formas habituales de encargar una impresión 3D en Barcelona, y se diferencian en aspectos estructurales que importan más que el marketing de cualquier empresa concreta:\n\n| Característica | Taller local en Barcelona | Plataforma online internacional | Marketplace de makers |\n|---|---|---|---|\n| Plazo típico (presupuesto aprobado → pieza en mano) | 2–5 días laborables en pedidos estándar; express 24–48h posible | 7–14 días laborables incluyendo envío internacional | Variable según el maker; habitualmente 5–15 días laborables |\n| Pedido mínimo | Fijado por el taller; frecuentemente 10–50€ o inexistente | Sin mínimo por pieza habitualmente; mínimos por pedido comunes | Fijado por cada maker de forma independiente |\n| Revisión humana del archivo antes de presupuestar | Práctica habitual en la mayoría de talleres locales | Presupuesto algorítmico por defecto; revisión humana bajo petición o en tramos superiores | Depende íntegramente del maker |\n| Idioma de atención | Español, catalán e inglés disponibles a nivel local | Habitualmente inglés únicamente, o portal por idioma | Depende de los idiomas del maker |\n| Recogida presencial | Disponible con cita en la mayoría de talleres locales | No ofrecida — solo envío internacional | En ocasiones, si el maker es local y está dispuesto |\n| Personalización y ayuda de diseño | Diálogo directo con la persona que produce la pieza | Especificaciones estándar; personalización vía ticket o tramo premium | Directa con el maker, calidad variable |\n\nEn el caso de Dimension3D concretamente: somos un taller local en Barcelona, presupuestamos en menos de una hora en horario laboral, el pedido mínimo es de 10€ sin mínimo por pieza, revisamos cada archivo manualmente antes de dar el precio, atendemos en español, catalán e inglés, y la recogida en Barcelona está disponible con cita previa.\n\nLa opción adecuada depende de tu proyecto. Si necesitas una pieza funcional para la próxima semana con una recomendación de material concreta, un taller local está estructuralmente preparado para eso. Si necesitas 500 piezas idénticas con calidad de inyección al menor coste unitario posible y puedes esperar, la economía de una plataforma internacional puede encajar mejor. Elige el modelo que se ajuste al trabajo."
      },
      {
        heading: "Preguntas específicas según el tipo de proyecto",
        body: "La lista genérica anterior es un mínimo, no un techo. Según lo que estés encargando, añade preguntas específicas al proyecto:\n\n• Para una pieza funcional con carga: pregunta qué material y qué relleno recomiendan y por qué, y con qué rango de temperatura y de carga trabajan al hacer esa recomendación.\n• Para una pieza para exterior: pregunta explícitamente por estabilidad UV. ASA y PETG se comportan de forma distinta al sol que el PLA. Un taller que responde \"lo imprimimos en lo que quieras\" sin preguntar por el entorno no está optimizando para que la pieza funcione.\n• Para un prototipo visual: pregunta por altura de capa, acabado superficial y opciones de post-procesado (lijado, imprimación, pintura).\n• Para una tirada de 20+ piezas idénticas: pregunta por precio por tramos, control de calidad por lote, y cómo gestionan las piezas que salen fuera de especificación.\n• Para cualquier proyecto con fecha límite: pide un plazo de presupuesto-aprobado-a-envío en días laborables, no naturales, y confirma si el servicio express se presupuesta aparte.\n\nUn buen taller agradece estas preguntas. Le indican qué priorizar en tu encargo."
      },
      {
        heading: "Cómo respondemos nosotros a cada punto — en corto",
        body: "Para referencia directa, así responde nuestra operación a la lista:\n\n• Materiales en rotación diaria: PLA, PETG, ABS, ASA, TPU, Nylon (PA12) y variantes reforzadas con fibra de carbono (PLA-CF, PETG-CF, Nylon-CF).\n• Rango de altura de capa: 0,12–0,28 mm según la función de la pieza; se especifica por presupuesto.\n• Tolerancia típica: ±0,2 mm en la mayoría de dimensiones FDM; características de mayor precisión se presupuestan individualmente.\n• Revisión de archivo: cada archivo se abre manualmente antes de enviar el presupuesto; las cuestiones de espesor de pared, soportes y orientación se plantean en ese momento.\n• Pedido mínimo: 10€. Sin mínimo por pieza — un solo clip pequeño es un encargo válido.\n• Plazo: estándar de 2–5 días laborables desde presupuesto aprobado; express en 24–48h disponible; entregas el mismo día posibles cuando la cola lo permite.\n• Idioma de atención: español, catalán e inglés, por WhatsApp o email.\n• Recogida: disponible en el taller de Barcelona con cita previa; envío a la España peninsular con seguimiento.\n\nUsa esta guía con cualquier taller que estés valorando. El objetivo no es dirigirte a nosotros — es darte la forma de una buena conversación con cualquier proveedor de impresión 3D."
      }
    ],
    faqs: [
      { q: "¿Es mala señal que un servicio dé precio online al instante?", a: "No necesariamente — un estimador instantáneo es genuinamente útil para una primera cifra orientativa. Lo que importa es si una persona revisa el archivo antes de confirmar el presupuesto. Precio instantáneo seguido de revisión humana está bien. Precio instantáneo que va directo a imprimir sin que nadie mire la geometría es donde aparecen los problemas." },
      { q: "¿Cómo sé si un taller puede mantener la tolerancia que necesito?", a: "Pregunta qué características te importan (agujeros, superficies de acoplamiento, insertos roscados) y qué tolerancia pueden mantener en esas concretamente. Un taller que responde con una cifra real y una explicación de cómo lo conseguiría — orientación, número de perímetros, post-procesado — sabe lo que hace. Un taller que solo dice \"sí, alta tolerancia\" no ha respondido a la pregunta." },
      { q: "¿Debería preocuparme que un taller no tenga pedido mínimo?", a: "No — al contrario. Un mínimo declarado de 10€ o similar sin mínimo por pieza es un taller preparado para imprimir un solo clip sin problema. Un taller que solo presupuesta a partir de 200€ por pedido está optimizado para un tipo de cliente distinto, y eso también está bien — simplemente asegúrate de que encaja con tu proyecto." },
      { q: "¿Cuál es un plazo razonable para una pieza funcional pequeña en Barcelona?", a: "Para una pieza pequeña en PLA o PETG sin geometría compleja, desde presupuesto aprobado hasta lista para recoger son habitualmente 2–5 días laborables en un taller local. El servicio express en 24–48 horas es una opción común encima de eso. Si alguien te presupuesta 3 semanas para una pieza estándar pequeña sin justificación concreta, pregunta el motivo." },
      { q: "¿Merece la pena pagar más por un taller local en lugar de un servicio online internacional?", a: "Depende del proyecto. Un taller local está estructuralmente preparado para diálogo directo, plazos más cortos, recogida presencial y revisión del archivo por una persona. Una plataforma internacional está estructuralmente preparada para producción estandarizada de gran volumen. Si tu proyecto encaja con el segundo perfil — cientos de piezas idénticas, sin prisa, sin materiales inusuales — la economía de la plataforma puede compensar. Si encaja con el primero, la diferencia de precio del taller local es normalmente menor de lo que la gente espera, y la reducción de fricción es real." },
      { q: "¿Cómo sé que un taller cumplirá lo que ha presupuestado?", a: "Dos pruebas prácticas. Primero, pide ver fotografías de una pieza similar que hayan impreso recientemente — un taller serio tiene portfolio. Segundo, fíjate en cómo responden a tus preguntas previas al presupuesto: respuestas precisas, directas y con los compromisos reconocidos correlan fuertemente con el mismo comportamiento en el trabajo real." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "ferrari-key-holder.jpg", "curved-parts.jpg", "black-intake.jpg", "red-adapter.jpg"),
    related: [
      { label: "Guía de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Cómo Preparar tu Archivo", slug: "/como-preparar-archivo-impresion-3d" },
      { label: "Impresión 3D en Barcelona", slug: "/impresion-3d-barcelona" },
      { label: "Precios", slug: "/precio-impresion-3d-barcelona" }
    ],
    schemaServiceName: "Guía del Comprador de Impresión 3D Barcelona"
  },

  // ----- NUEVA: GUÍA DE MATERIALES -----
  {
    slug: "/guia-materiales-impresion-3d",
    topic: "materials-guide",
    altSlug: "/3d-printing-materials-guide",
    lang: "es",
    category: "material",
    metaTitle: "Guía de Materiales para Impresión 3D — PLA, PETG, ABS, TPU, Nylon, CF | Dimension3D",
    metaDescription: "Guía práctica de selección de materiales FDM. Puntos fuertes reales, debilidades reales y usos habituales de PLA, PETG, ABS, ASA, TPU, Nylon y composites de fibra de carbono — con compromisos honestos, no marketing.",
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
      { label: "Impresión PLA", slug: "/impresion-pla-barcelona" },
      { label: "Impresión PETG", slug: "/impresion-petg-barcelona" },
      { label: "TPU Flexible", slug: "/impresion-tpu-barcelona" },
      { label: "Cómo Preparar tu Archivo", slug: "/como-preparar-archivo-impresion-3d" }
    ],
    schemaServiceName: "Guía de Materiales Impresión 3D"
  },

  // ----- NUEVA: PREPARACIÓN DE ARCHIVO -----
  {
    slug: "/como-preparar-archivo-impresion-3d",
    topic: "file-prep",
    altSlug: "/how-to-prepare-file-for-3d-printing",
    lang: "es",
    category: "use-case",
    metaTitle: "Cómo Preparar un Archivo para Impresión 3D — Guía Práctica | Dimension3D",
    metaDescription: "Guía práctica de preparación de archivos para impresión 3D FDM. Formatos aceptados, espesor de pared, tolerancias reales, orientación, soportes, dimensionado de agujeros, y qué hacer si no tienes archivo.",
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
      { label: "Guía de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Cómo Elegir un Servicio", slug: "/como-elegir-servicio-impresion-3d-barcelona" },
      { label: "Piezas Personalizadas", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Prototipos 3D", slug: "/prototipos-3d-barcelona" }
    ],
    schemaServiceName: "Guía de Preparación de Archivos 3D"
  },

  // ----- NUEVA: MEJOR SERVICIO (por necesidad) -----
  {
    slug: "/mejor-servicio-impresion-3d-barcelona",
    topic: "best-service",
    altSlug: "/best-3d-printing-service-barcelona",
    lang: "es",
    category: "service",
    metaTitle: "Mejor Servicio de Impresión 3D en Barcelona — Cuál Encaja con tu Caso | Dimension3D",
    metaDescription: "No hay un único \"mejor\" servicio de impresión 3D en Barcelona — depende de qué imprimas, con qué plazo y qué tiene que aguantar la pieza. Guía práctica por tipo de necesidad.",
    h1: "Mejor Servicio de Impresión 3D en Barcelona",
    intro: "No existe un único \"mejor\" servicio de impresión 3D — la respuesta honesta depende de qué estés imprimiendo, con qué plazo lo necesitas, y qué tiene que aguantar la pieza en uso. Quien necesita 500 tapones iguales para una producción tiene necesidades distintas de quien necesita un solo clip de repuesto para el viernes. Esta página desglosa la pregunta por caso de uso, te dice en qué fijarte para cada uno, y es honesta con los casos en los que nosotros no somos el proveedor adecuado.",
    sections: [
      {
        heading: "Mejor para piezas urgentes (para esta semana)",
        body: "Si el factor decisivo es el tiempo — una demo el lunes, una reparación que no puede esperar, una presentación a un cliente antes del fin de semana — lo que importa es:\n\n• Un plazo indicado en días laborables desde presupuesto aprobado, no un vago \"entrega rápida\".\n• Un servicio express o prioritario declarado explícitamente, y qué cuesta realmente.\n• Un canal de soporte con una persona que responde en menos de una hora en horario laboral, no un formulario que devuelve un número de ticket.\n• Disposición a decir que no cuando el plazo no es realista — un taller que se compromete a cualquier fecha es un taller que incumple algunas.\n\nEn el caso de Dimension3D concretamente: los presupuestos vuelven en menos de 1 hora en horario laboral, el plazo estándar es de 2–5 días laborables desde presupuesto aprobado, el servicio express entrega en 24–48 horas, y la producción el mismo día es posible cuando la cola lo permite. Si tu fecha no es viable, lo decimos desde el principio en lugar de comprometernos y llegar tarde."
      },
      {
        heading: "Mejor para piezas únicas y personalizadas",
        body: "Para una pieza única a medida — un soporte de repuesto, un utillaje, un proyecto personal, un clip roto que nadie vende ya — las prioridades son distintas:\n\n• Un pedido mínimo lo suficientemente bajo como para que una sola pieza pequeña sea un encargo válido.\n• Una persona dispuesta a mirar la geometría (o una fotografía, o un boceto rápido) y asesorar sobre si es imprimible y en qué material.\n• Sin obligación de que diseñes tú en CAD — o bien aceptando fotos con medidas de referencia, o bien ofreciendo modelado como línea aparte del presupuesto.\n• Disposición a explicar la elección de material y parámetros de impresión para que entiendas lo que estás pagando.\n\nEn el caso de Dimension3D concretamente: el pedido mínimo es de 10€, no hay mínimo por pieza, cada archivo (o fotografía de referencia) se revisa manualmente antes de presupuestar, y aceptamos presupuestos a partir de foto más medidas cuando no existe archivo CAD. El material y los ajustes se explican siempre en el presupuesto para que sepas qué estás aprobando."
      },
      {
        heading: "Mejor para empresas y prototipos funcionales",
        body: "Para equipos de ingeniería, departamentos de I+D y pequeños fabricantes las prioridades vuelven a cambiar:\n\n• Un conocimiento práctico de la diferencia real entre materiales — cuándo el Nylon-CF marca la diferencia frente a cuándo el PETG haría el mismo trabajo por una fracción del precio.\n• Compromisos de tolerancia realistas respaldados por medición, no por marketing.\n• Capacidad de repetir una pieza validada bajo demanda con calidad consistente.\n• Facturación estándar con IVA y, cuando aplique, firma de NDA como práctica habitual.\n• Disposición a pasar del prototipo a la tirada corta de producción con el mismo proveedor, sin re-presupuestar desde cero.\n\nPara proyectos empresariales, nuestra página dedicada a clientes empresa entra en más detalle: ver Impresión 3D para Empresas en Barcelona. La precisión FDM típica es de ±0,2 mm en la mayoría de dimensiones; las características de mayor precisión se presupuestan individualmente. La producción de tirada corta de 5–200 piezas es parte habitual de lo que hacemos."
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
      { q: "¿Qué servicio es mejor para una pieza única a medida?", a: "Un taller local con mínimo por pieza bajo o inexistente, dispuesto a aceptar una fotografía o un boceto cuando no hay archivo CAD, y dispuesto a revisar la geometría manualmente. Mínimos de pedido en el rango 10–50€ son habituales en talleres locales. El nuestro es de 10€ sin mínimo por pieza." },
      { q: "¿Es Dimension3D siempre la opción más barata?", a: "No. El precio unitario más bajo para producciones grandes suele ser de un proveedor de inyección de plástico o de una granja FDM grande. Para cantidades pequeñas, piezas únicas y prototipos funcionales, la diferencia de precio entre talleres locales suele ser pequeña — la diferencia relevante es la velocidad de respuesta, la revisión humana del archivo y la calidad de la comunicación. Si el precio es lo que más pesa en tu proyecto, compara siempre presupuestos." },
      { q: "¿Cuándo no debería usar impresión 3D FDM en absoluto?", a: "Para piezas que requieren detalle superficial por debajo de la resolución de las líneas de capa (unos 0,08 mm en una impresora FDM bien calibrada) — joyería fina, trabajo dental, figuras ultra-detalladas — la impresión en resina SLA o DLP es el proceso fundamentalmente adecuado. Para piezas metálicas estructurales con certificaciones específicas, la fabricación aditiva metálica (SLM, DMLS) es el proceso adecuado. El FDM es la herramienta correcta para una amplia gama de aplicaciones, pero no para todas." }
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "custom-brackets.jpg", "intake-manifold.jpg", "purple-figures.jpg", "green-chameleon.jpg", "eiffel-tower.jpg"),
    related: [
      { label: "Cómo Elegir un Servicio", slug: "/como-elegir-servicio-impresion-3d-barcelona" },
      { label: "Guía de Materiales", slug: "/guia-materiales-impresion-3d" },
      { label: "Cómo Preparar tu Archivo", slug: "/como-preparar-archivo-impresion-3d" },
      { label: "Catálogo de Productos", slug: "/catalogo" }
    ],
    schemaServiceName: "Mejor Servicio de Impresión 3D Barcelona"
  },

  // ----- NUEVA: INGRESOS PARA MAKERS (cómo ganar dinero con una impresora 3D) -----
  {
    slug: "/como-ganar-dinero-con-impresora-3d",
    topic: "maker-income",
    altSlug: "/how-to-make-money-with-a-3d-printer",
    lang: "es",
    category: "use-case",
    audience: "maker",
    metaTitle: "Cómo Ganar Dinero con una Impresora 3D — Guía Honesta | Dimension3D",
    metaDescription: "Guía práctica para obtener ingresos con una impresora 3D que ya tienes. Rutas reales — venta local, marketplaces, archivos de diseño, encargos para negocios, recambios, redes de makers — con esfuerzo realista y las contras honestas de cada opción.",
    h1: "Cómo Ganar Dinero con una Impresora 3D",
    intro: "Tienes una impresora 3D y quieres que se pague a sí misma. Perfecto — pero internet está lleno de guías que se saltan las partes incómodas (competencia, comisiones, ramps lentos, cuánto trabajo real requiere cada canal). Esta guía repasa las formas concretas en las que la gente genera ingresos con una impresora FDM en casa, con las contras claras y sin promesas de por medio. Uno de los caminos más cortos, cuando funciona, es unirte a una red local de impresión — la de Dimension3D es gratis, sin cuota de alta, sin comisión y sin exclusividad — así que puede correr en paralelo con cualquier otro canal de los que verás abajo.",
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
      { label: "¿Es Rentable un Negocio de Impresión 3D?", slug: "/es-rentable-negocio-impresion-3d" },
      { label: "Cómo Conseguir Clientes de Impresión 3D", slug: "/como-conseguir-clientes-impresion-3d" },
      { label: "Únete a la Red de Makers", slug: "/makers" },
      { label: "Guía del Maker — Cómo Funciona", slug: "/maker-guide" }
    ],
    schemaServiceName: "Cómo Ganar Dinero con Impresora 3D — Guía"
  },

  // ----- NUEVA: RENTABILIDAD PARA MAKERS (¿es rentable un negocio de impresión 3D?) -----
  {
    slug: "/es-rentable-negocio-impresion-3d",
    topic: "maker-profitability",
    altSlug: "/is-3d-printing-business-profitable",
    lang: "es",
    category: "use-case",
    audience: "maker",
    metaTitle: "¿Es Rentable un Negocio de Impresión 3D? Costes Reales | Dimension3D",
    metaDescription: "La economía honesta de un negocio de impresión 3D: coste del filamento por gramo, electricidad por hora de impresión, amortización de la impresora, tasa de fallos, packaging y envío — con un ejemplo real convirtiendo esos inputs en un precio defendible.",
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
      { label: "Cómo Ganar Dinero con una Impresora 3D", slug: "/como-ganar-dinero-con-impresora-3d" },
      { label: "Cómo Conseguir Clientes de Impresión 3D", slug: "/como-conseguir-clientes-impresion-3d" },
      { label: "Únete a la Red de Makers", slug: "/makers" },
      { label: "Guía del Maker — Cómo Funciona", slug: "/maker-guide" }
    ],
    schemaServiceName: "Guía Rentabilidad Negocio Impresión 3D"
  },

  // ----- NUEVA: CLIENTES PARA MAKERS (cómo conseguir clientes de impresión 3D) -----
  {
    slug: "/como-conseguir-clientes-impresion-3d",
    topic: "maker-customers",
    altSlug: "/how-to-get-3d-printing-customers",
    lang: "es",
    category: "use-case",
    audience: "maker",
    metaTitle: "Cómo Conseguir Clientes de Impresión 3D — Lo que Funciona | Dimension3D",
    metaDescription: "¿Impresora lista pero nadie pide? Guía práctica de captación de clientes para makers 3D: Google Business Profile, marketplaces, fotografía, precios transparentes, velocidad de respuesta, clientes recurrentes y unirte a una red de impresión.",
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
      { label: "Cómo Ganar Dinero con una Impresora 3D", slug: "/como-ganar-dinero-con-impresora-3d" },
      { label: "¿Es Rentable un Negocio de Impresión 3D?", slug: "/es-rentable-negocio-impresion-3d" },
      { label: "Únete a la Red de Makers", slug: "/makers" },
      { label: "Guía del Maker — Cómo Funciona", slug: "/maker-guide" }
    ],
    schemaServiceName: "Guía Captación Clientes Impresión 3D"
  }
];
