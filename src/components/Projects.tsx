import { useLanguage } from "@/contexts/LanguageContext";

interface Project {
  image: string;
  labelEs: string;
  labelEn: string;
}

const projects: Project[] = [
  { image: "/projects/stranger-things-lit.jpg", labelEs: "Diorama Stranger Things – PLA multicolor", labelEn: "Stranger Things Diorama – Multi-color PLA" },
  { image: "/projects/lion-king-scene.jpg", labelEs: "Figuras Rey León – PLA pintado", labelEn: "Lion King Figures – Painted PLA" },
  { image: "/projects/intake-manifold.jpg", labelEs: "Colector de admisión – PETG negro", labelEn: "Intake Manifold – Black PETG" },
  { image: "/projects/blue-molds.jpg", labelEs: "Moldes esféricos – PLA azul", labelEn: "Spherical Molds – Blue PLA" },
  { image: "/projects/red-adapter.jpg", labelEs: "Adaptador a medida – PLA rojo", labelEn: "Custom Adapter – Red PLA" },
  { image: "/projects/cookie-cutters.jpg", labelEs: "Cortadores de galletas – PLA gris", labelEn: "Cookie Cutters – Gray PLA" },
  { image: "/projects/curved-parts.jpg", labelEs: "Piezas curvadas – PLA amarillo/azul", labelEn: "Curved Parts – Yellow/Blue PLA" },
  { image: "/projects/custom-brackets.jpg", labelEs: "Soportes curvos – PLA amarillo", labelEn: "Curved Brackets – Yellow PLA" },
  { image: "/projects/lion-king-figures.jpg", labelEs: "Escena Rey León – PLA multicolor", labelEn: "Lion King Scene – Multi-color PLA" },
  { image: "/projects/stranger-things-diorama.jpg", labelEs: "Base Stranger Things – PLA multicolor", labelEn: "Stranger Things Base – Multi-color PLA" },
];

const Projects = () => {
  const { t, language } = useLanguage();

  return (
    <section id="proyectos" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("projects.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("projects.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group relative rounded-xl overflow-hidden bg-card border border-border/50 card-shadow hover:card-shadow-hover transition-all duration-300"
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
    </section>
  );
};

export default Projects;
