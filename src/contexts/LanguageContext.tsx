import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const es: Record<string, string> = {
  // Header
  "nav.howItWorks": "Cómo funciona",
  "nav.services": "Servicios",
  "nav.materials": "Materiales",
  "nav.uploadFile": "Subir archivo",
  "nav.requestQuote": "Solicitar presupuesto",
  
  // Hero
  "hero.title": "Impresión 3D de alta calidad en Barcelona",
  "hero.subtitle": "Impresiones a medida, prototipos y producción rápida. Sube tu archivo y recibe presupuesto en menos de 1 hora.",
  "hero.cta.quote": "Solicitar presupuesto",
  "hero.cta.whatsapp": "Contactar por WhatsApp",
  
  // FileUpload
  "upload.title": "Solicitar presupuesto",
  "upload.subtitle": "Sube tu archivo 3D y recibe el precio final en menos de 1 hora",
  "upload.subtext": "Sin precios automáticos. Revisamos cada proyecto manualmente.",
  "upload.dropTitle": "Arrastra tu archivo aquí",
  "upload.dropSubtitle": "o haz clic para seleccionar",
  "upload.dropFormats": "Formatos: STL, OBJ, 3MF, STEP",
  "upload.emailLabel": "Tu email *",
  "upload.emailPlaceholder": "tu@email.com",
  "upload.messageLabel": "Mensaje (opcional)",
  "upload.messagePlaceholder": "Detalles sobre el material, color, cantidad...",
  "upload.urgentLabel": "Necesito mi pieza con urgencia (48h)",
  "upload.urgentDesc": "Entrega prioritaria con un pequeño suplemento. Misma calidad garantizada.",
  "upload.submit": "Enviar solicitud",
  "upload.submitting": "Enviando...",
  "upload.quickQuote": "Presupuesto rápido, sin compromiso",
  "upload.altDivider": "¿Dudas o sin archivo?",
  "upload.whatsappBtn": "Consúltanos por WhatsApp",
  "upload.whatsappHint": "¿No sabes si tu pieza es imprimible? Pregúntanos sin compromiso",
  "upload.success.title": "¡Archivo recibido!",
  "upload.success.desc": "Hemos recibido tu solicitud. El equipo de Dimension3D revisará el diseño y te contactará pronto con el presupuesto.",
  "upload.success.another": "Enviar otro archivo",
  "upload.error.title": "Error",
  "upload.error.desc": "No se pudo enviar la solicitud. Por favor, inténtalo de nuevo.",
  "upload.error.fields": "Campos requeridos",
  "upload.error.fieldsDesc": "Por favor, completa todos los campos obligatorios.",
  "upload.error.format": "Formato no válido",
  "upload.error.formatDesc": "Por favor, sube un archivo 3D válido (STL, OBJ, 3MF, STEP)",
  
  // HowItWorks
  "how.title": "Cómo funciona",
  "how.subtitle": "Sube tu archivo, recibe presupuesto en menos de 1 hora y recoge o recibe tu pieza",
  "how.step1.title": "Sube tu archivo",
  "how.step1.desc": "Envíanos tu archivo 3D (STL, OBJ, 3MF) o consúltanos por WhatsApp.",
  "how.step2.title": "Recibe presupuesto",
  "how.step2.desc": "Revisamos tu diseño y te enviamos precio final. Sin sorpresas.",
  "how.step3.title": "Imprimimos tu pieza",
  "how.step3.desc": "Producción local en Barcelona con materiales de calidad profesional.",
  "how.step4.title": "Recogida o envío",
  "how.step4.desc": "Recoge en Barcelona o recibe tu pedido en cualquier punto de España.",
  
  // Services / WhatCanWePrint
  "services.title": "Nuestros servicios",
  "services.subtitle": "Desde prototipos funcionales hasta piezas finales de uso diario",
  "services.proto.title": "Prototipos funcionales",
  "services.proto.desc": "Valida tus diseños antes de la producción final",
  "services.parts.title": "Piezas de repuesto",
  "services.parts.desc": "Repuestos exactos para electrodomésticos, máquinas o vehículos",
  "services.brackets.title": "Soportes y adaptadores",
  "services.brackets.desc": "Brackets, montajes y soluciones a medida",
  "services.technical.title": "Piezas técnicas",
  "services.technical.desc": "Componentes para RC, drones, automoción y mecánica",
  "services.custom.title": "Proyectos personalizados",
  "services.custom.desc": "Piezas únicas para hobby, decoración o uso personal",
  "services.original.title": "Diseños originales",
  "services.original.desc": "Si lo puedes imaginar, lo podemos imprimir",
  "services.cta": "¿No estás seguro si tu pieza es imprimible? Consúltanos sin compromiso",
  
  // Materials
  "materials.title": "Materiales y calidad",
  "materials.subtitle": "Seleccionamos el material óptimo según la aplicación de tu pieza",
  "materials.pla.desc": "Económico y versátil",
  "materials.pla.detail": "Ideal para prototipos, maquetas y piezas decorativas con buen acabado.",
  "materials.petg.desc": "Resistente y durable",
  "materials.petg.detail": "Para piezas funcionales que requieren flexibilidad y resistencia a impactos.",
  "materials.abs.desc": "Técnico y térmico",
  "materials.abs.detail": "Soporta calor, esfuerzos mecánicos y exposición a exteriores.",
  "materials.nylon.desc": "Industrial y mecánico",
  "materials.nylon.detail": "Máxima resistencia para piezas técnicas de alto rendimiento.",
  "materials.help": "¿No sabes qué material elegir?",
  "materials.helpDesc": "Te asesoramos según el uso de tu pieza. Consulta sin compromiso.",
  
  // WhyChooseUs
  "why.title": "¿Por qué Dimension3D?",
  "why.subtitle": "Servicio de impresión 3D profesional con producción local y envíos a toda España",
  "why.personal.title": "Atención personalizada",
  "why.personal.desc": "Cada proyecto recibe atención individual. Trato directo y cercano.",
  "why.custom.title": "Proyectos a medida",
  "why.custom.desc": "Piezas técnicas, mecánicas, hobby, automoción y proyectos únicos.",
  "why.direct.title": "Comunicación directa",
  "why.direct.desc": "Contacto por WhatsApp. Sin intermediarios ni complicaciones.",
  "why.proven.title": "Experiencia probada",
  "why.proven.desc": "Clientes satisfechos en Barcelona y toda España.",
  
  // ExpressPrinting
  "express.title": "Impresión express: entrega en 24–48h",
  "express.desc": "¿Proyecto urgente? Impresión prioritaria con la misma calidad. Sujeto a complejidad y disponibilidad.",
  "express.time": "Entrega en 24–48h",
  "express.quality": "Misma calidad garantizada",
  "express.fee": "Pequeño suplemento",
  "express.note": "Indica \"urgente\" al solicitar presupuesto para priorizar tu pedido",
  
  // Reviews
  "reviews.title": "Reseñas de clientes",
  "reviews.subtitle": "Opiniones reales de clientes con los que hemos trabajado en Barcelona",
  "reviews.based": "basado en",
  "reviews.verified": "reseñas verificadas",
  "reviews.showMore": "Ver más reseñas",
  "reviews.showLess": "Ver menos",
  "reviews.verifiedBadge": "Verificada",
  "reviews.footer": "Clientes satisfechos con el servicio de impresión 3D de Dimension3D en Barcelona y alrededores",
  "reviews.form.title": "¿Has trabajado con Dimension3D?",
  "reviews.form.subtitle": "Déjanos tu opinión y ayuda a otros clientes a conocer nuestro servicio",
  "reviews.form.name": "Nombre *",
  "reviews.form.namePlaceholder": "Tu nombre",
  "reviews.form.email": "Email *",
  "reviews.form.emailPlaceholder": "tu@email.com",
  "reviews.form.rating": "Tu valoración *",
  "reviews.form.review": "Tu reseña *",
  "reviews.form.reviewPlaceholder": "Cuéntanos tu experiencia con nuestro servicio...",
  "reviews.form.orderRef": "Referencia del pedido (opcional)",
  "reviews.form.orderRefPlaceholder": "Describe brevemente qué imprimimos para ti",
  "reviews.form.submit": "Enviar reseña",
  "reviews.form.submitting": "Enviando...",
  "reviews.form.success": "¡Gracias por tu reseña!",
  "reviews.form.successDesc": "Tu reseña ha sido enviada y será revisada antes de publicarse.",
  "reviews.form.error": "Error",
  "reviews.form.errorDesc": "No se pudo enviar la reseña. Por favor, inténtalo de nuevo.",
  "reviews.form.required": "Campos requeridos",
  "reviews.form.requiredDesc": "Por favor, completa todos los campos obligatorios.",
  "reviews.form.disclaimer": "Todas las reseñas son verificadas manualmente antes de publicarse para garantizar que provienen de clientes reales.",
  
  // ServiceInfo
  "service.title": "Servicio de impresión 3D",
  "service.titleHighlight": "en Barcelona",
  "service.desc": "Dimension3D es un servicio profesional de impresión 3D bajo pedido. Producción local en Barcelona con envíos a toda España.",
  "service.pickup.title": "Recogida local en Barcelona",
  "service.pickup.desc": "Coordina una cita para recoger tu pedido. Sin colas ni esperas.",
  "service.shipping.title": "Envíos a toda España",
  "service.shipping.desc": "Enviamos a cualquier punto de la península con seguimiento incluido.",
  "service.feat.online": "Pedidos 100% online",
  "service.feat.onlineDesc": "Gestión digital completa. Sube tu archivo y recibe presupuesto.",
  "service.feat.local": "Producción en Barcelona",
  "service.feat.localDesc": "Fabricación local con tiempos de entrega reducidos.",
  "service.feat.appointment": "Recogida con cita previa",
  "service.feat.appointmentDesc": "Coordina día y hora para recoger tu pedido en Barcelona.",
  "service.feat.shipping": "Envíos a toda España",
  "service.feat.shippingDesc": "Entrega a domicilio en cualquier punto de la península.",
  
  // FAQ
  "faq.title": "Preguntas frecuentes",
  "faq.subtitle": "Resolvemos las dudas más comunes sobre nuestro servicio de impresión 3D",
  "faq.moreQuestion": "¿Tienes otra pregunta?",
  "faq.moreAnswer": "Escríbenos por WhatsApp",
  "faq.moreEnd": "y te respondemos en minutos",
  
  // CTA
  "cta.title": "¿Listo para dar forma a tu idea?",
  "cta.subtitle": "Sube tu archivo 3D o contáctanos directamente. Presupuesto sin compromiso en menos de 1 hora.",
  "cta.upload": "Subir archivo",
  "cta.contact": "Contactar por WhatsApp",
  
  // Footer
  "footer.tagline": "Servicio profesional de impresión 3D en Barcelona",
  "footer.taglineSub": "Producción local · Clientes de Barcelona y toda España",
  "footer.location.label": "Ubicación",
  "footer.location.city": "Barcelona, España",
  "footer.location.pickup": "Recogida local con cita previa",
  "footer.shipping.label": "Envíos",
  "footer.shipping.area": "Toda España peninsular",
  "footer.shipping.tracking": "Con seguimiento incluido",
  "footer.response.label": "Respuesta",
  "footer.response.time": "Presupuesto en menos de 1h",
  "footer.response.express": "Express disponible (24-48h)",
  "footer.whatsapp": "Contactar por WhatsApp",
  "footer.copyright": "Servicio de impresión 3D en Barcelona, España.",
  
  // WhatsApp
  "whatsapp.tooltip": "¿Hablamos?",
  "whatsapp.message": "Hola, me gustaría solicitar un servicio de impresión 3D con Dimension3D.",
};

const en: Record<string, string> = {
  // Header
  "nav.howItWorks": "How It Works",
  "nav.services": "Services",
  "nav.materials": "Materials",
  "nav.uploadFile": "Upload File",
  "nav.requestQuote": "Get a Quote",
  
  // Hero
  "hero.title": "High-Quality 3D Printing in Barcelona",
  "hero.subtitle": "Custom prints, prototypes, and fast turnaround. Upload your file and get a quote within 1 hour.",
  "hero.cta.quote": "Request a Quote",
  "hero.cta.whatsapp": "Contact via WhatsApp",
  
  // FileUpload
  "upload.title": "Request a Quote",
  "upload.subtitle": "Upload your 3D file and receive the final price within 1 hour",
  "upload.subtext": "No automated pricing. We review every project manually.",
  "upload.dropTitle": "Drag your file here",
  "upload.dropSubtitle": "or click to select",
  "upload.dropFormats": "Formats: STL, OBJ, 3MF, STEP",
  "upload.emailLabel": "Your email *",
  "upload.emailPlaceholder": "your@email.com",
  "upload.messageLabel": "Message (optional)",
  "upload.messagePlaceholder": "Details about material, color, quantity...",
  "upload.urgentLabel": "I need this part urgently (48h)",
  "upload.urgentDesc": "Priority delivery with a small surcharge. Same quality guaranteed.",
  "upload.submit": "Send Request",
  "upload.submitting": "Sending...",
  "upload.quickQuote": "Quick quote, no commitment",
  "upload.altDivider": "Questions or no file?",
  "upload.whatsappBtn": "Contact us on WhatsApp",
  "upload.whatsappHint": "Not sure if your part is printable? Ask us — no commitment",
  "upload.success.title": "File received!",
  "upload.success.desc": "We've received your request. The Dimension3D team will review your design and get back to you with a quote shortly.",
  "upload.success.another": "Send another file",
  "upload.error.title": "Error",
  "upload.error.desc": "Could not send request. Please try again.",
  "upload.error.fields": "Required fields",
  "upload.error.fieldsDesc": "Please fill in all required fields.",
  "upload.error.format": "Invalid format",
  "upload.error.formatDesc": "Please upload a valid 3D file (STL, OBJ, 3MF, STEP)",
  
  // HowItWorks
  "how.title": "How It Works",
  "how.subtitle": "Upload your file, get a quote within 1 hour, and receive your part",
  "how.step1.title": "Upload Your File",
  "how.step1.desc": "Send us your 3D file (STL, OBJ, 3MF) or reach out via WhatsApp.",
  "how.step2.title": "Get a Quote",
  "how.step2.desc": "We review your design and send you a final price. No hidden fees.",
  "how.step3.title": "We Print It",
  "how.step3.desc": "Local production in Barcelona using professional-grade materials.",
  "how.step4.title": "Pickup or Delivery",
  "how.step4.desc": "Pick up in Barcelona or get it delivered anywhere in Spain.",
  
  // Services / WhatCanWePrint
  "services.title": "Our Services",
  "services.subtitle": "From functional prototypes to everyday end-use parts",
  "services.proto.title": "Functional Prototypes",
  "services.proto.desc": "Validate your designs before committing to full production",
  "services.parts.title": "Replacement Parts",
  "services.parts.desc": "Exact replacements for appliances, machinery, or vehicles",
  "services.brackets.title": "Mounts & Adapters",
  "services.brackets.desc": "Custom brackets, fixtures, and tailored solutions",
  "services.technical.title": "Technical Components",
  "services.technical.desc": "Parts for RC, drones, automotive, and mechanical applications",
  "services.custom.title": "Custom Projects",
  "services.custom.desc": "One-of-a-kind pieces for hobbies, décor, or personal use",
  "services.original.title": "Original Designs",
  "services.original.desc": "If you can imagine it, we can print it",
  "services.cta": "Not sure if your part is printable? Ask us — no commitment",
  
  // Materials
  "materials.title": "Materials & Quality",
  "materials.subtitle": "We select the optimal material based on your part's application",
  "materials.pla.desc": "Versatile & affordable",
  "materials.pla.detail": "Great for prototypes, models, and decorative parts with a smooth finish.",
  "materials.petg.desc": "Strong & durable",
  "materials.petg.detail": "For functional parts requiring flexibility and impact resistance.",
  "materials.abs.desc": "Heat & stress resistant",
  "materials.abs.detail": "Handles high temperatures, mechanical stress, and outdoor exposure.",
  "materials.nylon.desc": "Industrial grade",
  "materials.nylon.detail": "Maximum strength for high-performance technical components.",
  "materials.help": "Not sure which material to choose?",
  "materials.helpDesc": "We'll recommend the best option based on your part's use case. Just ask.",
  
  // WhyChooseUs
  "why.title": "Why Dimension3D?",
  "why.subtitle": "Professional 3D printing with local production and shipping across Spain",
  "why.personal.title": "Personalized Support",
  "why.personal.desc": "Every project gets individual attention. Direct and responsive communication.",
  "why.custom.title": "Custom Solutions",
  "why.custom.desc": "Technical, mechanical, hobby, automotive, and unique one-off projects.",
  "why.direct.title": "Direct Communication",
  "why.direct.desc": "Reach us on WhatsApp — no middlemen, no hassle.",
  "why.proven.title": "Proven Experience",
  "why.proven.desc": "Happy customers across Barcelona and all of Spain.",
  
  // ExpressPrinting
  "express.title": "Express Printing: Delivery in 24–48h",
  "express.desc": "Urgent project? Priority printing with the same quality. Subject to complexity and availability.",
  "express.time": "Delivery in 24–48h",
  "express.quality": "Same quality guaranteed",
  "express.fee": "Small surcharge",
  "express.note": "Mark your request as \"urgent\" to prioritize your order",
  
  // Reviews
  "reviews.title": "Customer Reviews",
  "reviews.subtitle": "Real feedback from customers we've worked with in Barcelona",
  "reviews.based": "based on",
  "reviews.verified": "verified reviews",
  "reviews.showMore": "Show more reviews",
  "reviews.showLess": "Show less",
  "reviews.verifiedBadge": "Verified",
  "reviews.footer": "Happy customers trusting Dimension3D for 3D printing in Barcelona and beyond",
  "reviews.form.title": "Worked with Dimension3D?",
  "reviews.form.subtitle": "Share your experience and help others discover our service",
  "reviews.form.name": "Name *",
  "reviews.form.namePlaceholder": "Your name",
  "reviews.form.email": "Email *",
  "reviews.form.emailPlaceholder": "your@email.com",
  "reviews.form.rating": "Your rating *",
  "reviews.form.review": "Your review *",
  "reviews.form.reviewPlaceholder": "Tell us about your experience with our service...",
  "reviews.form.orderRef": "Order reference (optional)",
  "reviews.form.orderRefPlaceholder": "Briefly describe what we printed for you",
  "reviews.form.submit": "Submit Review",
  "reviews.form.submitting": "Sending...",
  "reviews.form.success": "Thank you for your review!",
  "reviews.form.successDesc": "Your review has been submitted and will be reviewed before publishing.",
  "reviews.form.error": "Error",
  "reviews.form.errorDesc": "Could not send your review. Please try again.",
  "reviews.form.required": "Required fields",
  "reviews.form.requiredDesc": "Please fill in all required fields.",
  "reviews.form.disclaimer": "All reviews are manually verified before publishing to ensure they come from real customers.",
  
  // ServiceInfo
  "service.title": "3D Printing Service",
  "service.titleHighlight": "in Barcelona",
  "service.desc": "Dimension3D is a professional on-demand 3D printing service. Local production in Barcelona with shipping throughout Spain.",
  "service.pickup.title": "Local Pickup in Barcelona",
  "service.pickup.desc": "Schedule an appointment to pick up your order. No lines, no waiting.",
  "service.shipping.title": "Shipping Across Spain",
  "service.shipping.desc": "We deliver anywhere on the mainland with tracking included.",
  "service.feat.online": "100% Online Orders",
  "service.feat.onlineDesc": "Fully digital process. Upload your file and get a quote.",
  "service.feat.local": "Made in Barcelona",
  "service.feat.localDesc": "Local manufacturing with reduced delivery times.",
  "service.feat.appointment": "Pickup by Appointment",
  "service.feat.appointmentDesc": "Choose a day and time to collect your order in Barcelona.",
  "service.feat.shipping": "Spain-Wide Shipping",
  "service.feat.shippingDesc": "Home delivery anywhere on the mainland.",
  
  // FAQ
  "faq.title": "Frequently Asked Questions",
  "faq.subtitle": "Answers to the most common questions about our 3D printing service",
  "faq.moreQuestion": "Have another question?",
  "faq.moreAnswer": "Message us on WhatsApp",
  "faq.moreEnd": "and we'll respond in minutes",
  
  // CTA
  "cta.title": "Ready to bring your idea to life?",
  "cta.subtitle": "Upload your 3D file or contact us directly. Free quote within 1 hour, no commitment.",
  "cta.upload": "Upload Your File",
  "cta.contact": "Contact via WhatsApp",
  
  // Footer
  "footer.tagline": "Professional 3D printing service in Barcelona",
  "footer.taglineSub": "Local production · Customers from Barcelona and all of Spain",
  "footer.location.label": "Location",
  "footer.location.city": "Barcelona, Spain",
  "footer.location.pickup": "Local pickup by appointment",
  "footer.shipping.label": "Shipping",
  "footer.shipping.area": "All mainland Spain",
  "footer.shipping.tracking": "With tracking included",
  "footer.response.label": "Response",
  "footer.response.time": "Quote within 1 hour",
  "footer.response.express": "Express available (24-48h)",
  "footer.whatsapp": "Contact via WhatsApp",
  "footer.copyright": "3D printing service in Barcelona, Spain.",
  
  // WhatsApp
  "whatsapp.tooltip": "Chat with us",
  "whatsapp.message": "Hello, I'd like to request a 3D printing service from Dimension3D.",
};

const translations: Record<Language, Record<string, string>> = { es, en };

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("preferred-language");
      if (stored === "es" || stored === "en") return stored;
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("en")) return "en";
    }
    return "es";
  });

  useEffect(() => {
    localStorage.setItem("preferred-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
