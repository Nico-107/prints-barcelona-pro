import { useState } from "react";
import { Images, X } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface Project {
  image: string;
  labelEs: string;
  labelEn: string;
}

const projects: Project[] = [
  { image: "/projects/big-ben-tower.jpg", labelEs: "Torre Big Ben – PLA gris detallado", labelEn: "Big Ben Tower – Detailed Gray PLA" },
  { image: "/projects/eiffel-tower.jpg", labelEs: "Torre Eiffel – PLA gris arquitectónico", labelEn: "Eiffel Tower – Architectural Gray PLA" },
  { image: "/projects/green-chameleon.jpg", labelEs: "Camaleón articulado – PLA verde", labelEn: "Articulated Chameleon – Green PLA" },
  { image: "/projects/halloween-set.jpg", labelEs: "Set Halloween – PLA multicolor", labelEn: "Halloween Set – Multi-color PLA" },
  { image: "/projects/ferrari-key-holder.jpg", labelEs: "Portallaves Ferrari F40 – PLA rojo", labelEn: "Ferrari F40 Key Holder – Red PLA" },
  { image: "/projects/purple-figures.jpg", labelEs: "Figuras detalladas – PLA púrpura", labelEn: "Detailed Figures – Purple PLA" },
  { image: "/projects/croc-skull.jpg", labelEs: "Cráneo de cocodrilo – PLA hueso", labelEn: "Crocodile Skull – Bone PLA" },
  { image: "/projects/black-intake.jpg", labelEs: "Conducto de admisión – PETG negro", labelEn: "Intake Duct – Black PETG" },
  { image: "/projects/purple-detail.jpg", labelEs: "Pieza detallada – PLA púrpura", labelEn: "Detailed Piece – Purple PLA" },
  { image: "/projects/intake-manifold.jpg", labelEs: "Colector de admisión – PETG negro", labelEn: "Intake Manifold – Black PETG" },
];

const Projects = () => {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const sectionRef = useReveal<HTMLElement>();

  return (
    <section ref={sectionRef} id="proyectos" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 text-accent mb-5">
            <Images className="w-7 h-7" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("projects.title")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t("projects.subtitle")}
          </p>
          <Button variant="accent" size="lg" onClick={() => setOpen(true)} className="gap-2">
            <Images className="w-4 h-4" />
            {t("projects.viewBtn")}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/50 px-6 py-4 flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">{t("projects.modal.title")}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">{t("projects.modal.subtitle")}</DialogDescription>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="group relative rounded-xl overflow-hidden bg-card border border-border card-shadow hover:card-shadow-hover transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={project.image}
                      alt={language === "es" ? project.labelEs : project.labelEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-primary-foreground text-xs font-medium leading-snug">
                      {language === "es" ? project.labelEs : project.labelEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Projects;
