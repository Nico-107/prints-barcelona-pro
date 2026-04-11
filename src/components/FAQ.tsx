import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ = () => {
  const { t, language } = useLanguage();

  const faqs = language === "en" ? [
    {
      question: "What file formats do you accept?",
      answer: "We accept STL, OBJ, 3MF, and STEP files. If you have a different format or need help with your design, contact us on WhatsApp.",
    },
    {
      question: "How long does printing take?",
      answer: "Turnaround depends on the size and complexity of your part. Standard orders take 2–5 business days. Express service (24–48h) is also available.",
    },
    {
      question: "Can you print single parts and small batches?",
      answer: "Absolutely. We handle everything from one-off prototypes to small and medium production runs. Get in touch for larger volumes.",
    },
    {
      question: "Do you ship outside Barcelona?",
      answer: "Yes, we ship to all of mainland Spain with tracking included. Local pickup in Barcelona is also available by appointment.",
    },
    {
      question: "What is the precision of FDM printing?",
      answer: "Typical precision is ±0.2 mm. For parts that require tighter tolerances, we adjust parameters to match your project's needs.",
    },
  ] : [
    {
      question: "¿Qué archivos aceptáis para impresión 3D?",
      answer: "Aceptamos archivos STL, OBJ, 3MF y STEP. Si tienes otro formato o dudas sobre tu diseño, consúltanos por WhatsApp.",
    },
    {
      question: "¿Cuánto tarda la impresión?",
      answer: "El tiempo depende del tamaño y complejidad de la pieza. Normalmente entre 2-5 días laborables. Disponemos de servicio express en 24-48h.",
    },
    {
      question: "¿Imprimís piezas únicas o también series?",
      answer: "Imprimimos tanto piezas únicas como series pequeñas y medianas. Consúltanos para volúmenes mayores.",
    },
    {
      question: "¿Hacéis envíos fuera de Barcelona?",
      answer: "Sí, enviamos a toda España peninsular con seguimiento incluido. También ofrecemos recogida local en Barcelona con cita previa.",
    },
    {
      question: "¿Qué precisión tiene la impresión FDM?",
      answer: "La precisión típica es de ±0.2mm. Para piezas que requieran mayor exactitud, ajustamos los parámetros según las necesidades del proyecto.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("faq.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("faq.subtitle")}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          {t("faq.moreQuestion")} <span className="text-accent font-medium">{t("faq.moreAnswer")}</span> {t("faq.moreEnd")}
        </p>
      </div>
    </section>
  );
};

export default FAQ;
