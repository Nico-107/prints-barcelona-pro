import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Spanish translations (default)
const es: Record<string, string> = {
  // Header
  "nav.howItWorks": "Cómo funciona",
  "nav.service": "Servicio",
  "nav.uploadFile": "Subir archivo",
  "nav.requestQuote": "Solicitar presupuesto",
  
  // Hero
  "hero.title": "Impresión 3D profesional en Barcelona",
  "hero.subtitle": "Convierte tus ideas en piezas reales. Servicio rápido, atención personalizada y calidad garantizada.",
  "hero.cta.quote": "Solicitar presupuesto",
  "hero.cta.whatsapp": "Contactar por WhatsApp",
  "hero.trustBadge": "Servicio profesional de impresión 3D en Barcelona",
  
  // FileUpload
  "upload.title": "Solicitar presupuesto",
  "upload.subtitle": "Envíanos tu archivo 3D y recibe un presupuesto personalizado en menos de 1 hora",
  "upload.dropzone": "Arrastra tu archivo aquí o haz clic para seleccionar",
  "upload.formats": "Formatos aceptados: STL, OBJ, 3MF (máx. 50MB)",
  "upload.name": "Nombre",
  "upload.namePlaceholder": "Tu nombre",
  "upload.email": "Email",
  "upload.emailPlaceholder": "tu@email.com",
  "upload.phone": "Teléfono (opcional)",
  "upload.phonePlaceholder": "Tu teléfono",
  "upload.details": "Detalles del proyecto",
  "upload.detailsPlaceholder": "Describe tu proyecto, cantidad, material preferido, plazos...",
  "upload.submit": "Enviar solicitud",
  "upload.submitting": "Enviando...",
  "upload.success.title": "¡Solicitud enviada!",
  "upload.success.desc": "Te responderemos en menos de 1 hora con tu presupuesto personalizado.",
  "upload.error.title": "Error",
  "upload.error.desc": "No se pudo enviar la solicitud. Por favor, inténtalo de nuevo.",
  "upload.error.fields": "Campos requeridos",
  "upload.error.fieldsDesc": "Por favor, completa todos los campos obligatorios.",
  "upload.whatsapp": "¿Prefieres WhatsApp?",
  "upload.whatsappDesc": "Envíanos tu archivo directamente por WhatsApp y te respondemos al momento",
  "upload.whatsappBtn": "Abrir WhatsApp",
  
  // HowItWorks
  "how.title": "Cómo funciona",
  "how.subtitle": "Sube tu archivo, recibe presupuesto en menos de 1 hora y recoge o recibe tu pieza",
  "how.step1.title": "Sube tu archivo",
  "how.step1.desc": "Envíanos tu archivo 3D (STL, OBJ, 3MF) o consúltanos por WhatsApp.",
  "how.step2.title": "Presupuesto en <1h",
  "how.step2.desc": "Revisamos tu diseño y te enviamos precio final. Sin sorpresas.",
  "how.step3.title": "Producción local",
  "how.step3.desc": "Imprimimos tu pieza en Barcelona con materiales de calidad.",
  "how.step4.title": "Recogida o envío",
  "how.step4.desc": "Recoge en Barcelona o recibe tu pedido en cualquier punto de España.",
  
  // WhatCanWePrint
  "print.title": "¿Qué podemos imprimir?",
  "print.subtitle": "Desde prototipos funcionales hasta piezas decorativas, adaptamos cada proyecto a tus necesidades",
  
  // Materials
  "materials.title": "Materiales disponibles",
  "materials.subtitle": "Trabajamos con los materiales más versátiles y resistentes del mercado",
  
  // WhyChooseUs
  "why.title": "¿Por qué Reality 3D BCN?",
  "why.subtitle": "Servicio profesional de impresión 3D en Barcelona con atención personalizada",
  
  // ExpressPrinting
  "express.title": "¿Tienes prisa?",
  "express.subtitle": "Servicio exprés disponible",
  
  // Reviews
  "reviews.title": "Reseñas de clientes de Reality 3D BCN",
  "reviews.subtitle": "Opiniones reales de clientes con los que hemos trabajado en Barcelona",
  "reviews.based": "basado en",
  "reviews.verified": "reseñas verificadas",
  "reviews.showMore": "Ver más reseñas",
  "reviews.showLess": "Ver menos",
  "reviews.verifiedBadge": "Verificada",
  "reviews.footer": "Clientes satisfechos con el servicio de impresión 3D de Reality 3D BCN en Barcelona y alrededores",
  "reviews.form.title": "¿Has trabajado con Reality 3D BCN?",
  "reviews.form.subtitle": "Déjanos tu opinión y ayuda a otros clientes a conocer nuestro servicio de impresión 3D en Barcelona",
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
  "service.title": "Información del servicio",
  "service.local": "Servicio local en Barcelona",
  "service.shipping": "Envíos a toda España",
  "service.response": "Respuesta rápida y comunicación directa",
  "service.review": "Revisión manual de archivos antes de imprimir",
  
  // FAQ
  "faq.title": "Preguntas frecuentes",
  "faq.subtitle": "Resolvemos las dudas más comunes sobre nuestro servicio de impresión 3D en Barcelona",
  
  // Footer
  "footer.rights": "Todos los derechos reservados",
  "footer.location": "Barcelona, España",
  
  // WhatsApp
  "whatsapp.tooltip": "Chatea con nosotros",
};

// English translations
const en: Record<string, string> = {
  // Header
  "nav.howItWorks": "How it works",
  "nav.service": "Service",
  "nav.uploadFile": "Upload file",
  "nav.requestQuote": "Request quote",
  
  // Hero
  "hero.title": "Professional 3D printing in Barcelona",
  "hero.subtitle": "Turn your ideas into real parts. Fast service, personalized attention and guaranteed quality.",
  "hero.cta.quote": "Request quote",
  "hero.cta.whatsapp": "Contact via WhatsApp",
  "hero.trustBadge": "Professional 3D printing service in Barcelona",
  
  // FileUpload
  "upload.title": "Request a quote",
  "upload.subtitle": "Send us your 3D file and receive a personalized quote in less than 1 hour",
  "upload.dropzone": "Drag your file here or click to select",
  "upload.formats": "Accepted formats: STL, OBJ, 3MF (max. 50MB)",
  "upload.name": "Name",
  "upload.namePlaceholder": "Your name",
  "upload.email": "Email",
  "upload.emailPlaceholder": "your@email.com",
  "upload.phone": "Phone (optional)",
  "upload.phonePlaceholder": "Your phone",
  "upload.details": "Project details",
  "upload.detailsPlaceholder": "Describe your project, quantity, preferred material, deadlines...",
  "upload.submit": "Send request",
  "upload.submitting": "Sending...",
  "upload.success.title": "Request sent!",
  "upload.success.desc": "We will respond in less than 1 hour with your personalized quote.",
  "upload.error.title": "Error",
  "upload.error.desc": "Could not send request. Please try again.",
  "upload.error.fields": "Required fields",
  "upload.error.fieldsDesc": "Please fill in all required fields.",
  "upload.whatsapp": "Prefer WhatsApp?",
  "upload.whatsappDesc": "Send us your file directly via WhatsApp and we'll respond immediately",
  "upload.whatsappBtn": "Open WhatsApp",
  
  // HowItWorks
  "how.title": "How it works",
  "how.subtitle": "Upload your file, get a quote in less than 1 hour and pick up or receive your part",
  "how.step1.title": "Upload your file",
  "how.step1.desc": "Send us your 3D file (STL, OBJ, 3MF) or contact us via WhatsApp.",
  "how.step2.title": "Quote in <1h",
  "how.step2.desc": "We review your design and send you the final price. No surprises.",
  "how.step3.title": "Local production",
  "how.step3.desc": "We print your part in Barcelona with quality materials.",
  "how.step4.title": "Pickup or shipping",
  "how.step4.desc": "Pick up in Barcelona or receive your order anywhere in Spain.",
  
  // WhatCanWePrint
  "print.title": "What can we print?",
  "print.subtitle": "From functional prototypes to decorative pieces, we adapt each project to your needs",
  
  // Materials
  "materials.title": "Available materials",
  "materials.subtitle": "We work with the most versatile and resistant materials on the market",
  
  // WhyChooseUs
  "why.title": "Why Reality 3D BCN?",
  "why.subtitle": "Professional 3D printing service in Barcelona with personalized attention",
  
  // ExpressPrinting
  "express.title": "In a hurry?",
  "express.subtitle": "Express service available",
  
  // Reviews
  "reviews.title": "Reviews from Reality 3D BCN customers",
  "reviews.subtitle": "Real opinions from clients we have worked with in Barcelona",
  "reviews.based": "based on",
  "reviews.verified": "verified reviews",
  "reviews.showMore": "Show more reviews",
  "reviews.showLess": "Show less",
  "reviews.verifiedBadge": "Verified",
  "reviews.footer": "Satisfied customers with Reality 3D BCN's 3D printing service in Barcelona and surroundings",
  "reviews.form.title": "Have you worked with Reality 3D BCN?",
  "reviews.form.subtitle": "Leave your opinion and help other customers learn about our 3D printing service in Barcelona",
  "reviews.form.name": "Name *",
  "reviews.form.namePlaceholder": "Your name",
  "reviews.form.email": "Email *",
  "reviews.form.emailPlaceholder": "your@email.com",
  "reviews.form.rating": "Your rating *",
  "reviews.form.review": "Your review *",
  "reviews.form.reviewPlaceholder": "Tell us about your experience with our service...",
  "reviews.form.orderRef": "Order reference (optional)",
  "reviews.form.orderRefPlaceholder": "Briefly describe what we printed for you",
  "reviews.form.submit": "Submit review",
  "reviews.form.submitting": "Sending...",
  "reviews.form.success": "Thank you for your review!",
  "reviews.form.successDesc": "Your review has been submitted and will be reviewed before publishing.",
  "reviews.form.error": "Error",
  "reviews.form.errorDesc": "Could not send review. Please try again.",
  "reviews.form.required": "Required fields",
  "reviews.form.requiredDesc": "Please fill in all required fields.",
  "reviews.form.disclaimer": "All reviews are manually verified before publishing to ensure they come from real customers.",
  
  // ServiceInfo
  "service.title": "Service information",
  "service.local": "Local service in Barcelona",
  "service.shipping": "Shipping throughout Spain",
  "service.response": "Fast response and direct communication",
  "service.review": "Manual file review before printing",
  
  // FAQ
  "faq.title": "Frequently asked questions",
  "faq.subtitle": "We answer the most common questions about our 3D printing service in Barcelona",
  
  // Footer
  "footer.rights": "All rights reserved",
  "footer.location": "Barcelona, Spain",
  
  // WhatsApp
  "whatsapp.tooltip": "Chat with us",
};

const translations: Record<Language, Record<string, string>> = { es, en };

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("preferred-language");
      if (stored === "es" || stored === "en") return stored;
      // Check browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("en")) return "en";
    }
    return "es"; // Default to Spanish
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
