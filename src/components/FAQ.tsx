import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ = () => {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);

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
  ] : language === "ca" ? [
    {
      question: "Quins arxius accepteu per a impressió 3D?",
      answer: "Acceptem arxius STL, OBJ, 3MF i STEP. Si tens un altre format o dubtes sobre el teu disseny, consulta'ns per WhatsApp.",
    },
    {
      question: "Quant triga la impressió?",
      answer: "El temps depèn de la mida i complexitat de la peça. Normalment entre 2 i 5 dies laborables. Disposem de servei express en 24-48h.",
    },
    {
      question: "Imprimiu peces úniques o també sèries?",
      answer: "Imprimim tant peces úniques com sèries petites i mitjanes. Consulta'ns per a volums més grans.",
    },
    {
      question: "Feu enviaments fora de Barcelona?",
      answer: "Sí, enviem a tota Espanya peninsular amb seguiment inclòs. També oferim recollida local a Barcelona amb cita prèvia.",
    },
    {
      question: "Quina precisió té la impressió FDM?",
      answer: "La precisió típica és de ±0,2 mm. Per a peces que requereixin més exactitud, ajustem els paràmetres segons les necessitats del projecte.",
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
    <section id="faq" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 text-accent mb-5">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("faq.title")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t("faq.shortText")}
          </p>
          <Button variant="accent" size="lg" onClick={() => setOpen(true)} className="gap-2">
            <HelpCircle className="w-4 h-4" />
            {t("faq.viewBtn")}
          </Button>

          <p className="text-sm text-muted-foreground mt-8">
            {t("faq.moreQuestion")} <span className="text-accent font-medium">{t("faq.moreAnswer")}</span> {t("faq.moreEnd")}
          </p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/50 px-6 py-4">
            <DialogTitle className="text-xl font-bold text-foreground">{t("faq.title")}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">{t("faq.subtitle")}</DialogDescription>
          </div>
          <div className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                  <AccordionTrigger className="text-left text-foreground hover:text-accent hover:no-underline py-4 font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default FAQ;
