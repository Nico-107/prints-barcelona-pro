import { useState } from "react";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

const galleryItems = [
  {
    src: gallery1,
    alt: "Pieza mecánica impresa en 3D",
    category: "Mecánica",
  },
  {
    src: gallery2,
    alt: "Figura coleccionable impresa en 3D",
    category: "Hobby",
  },
  {
    src: gallery3,
    alt: "Componentes de automoción impresos en 3D",
    category: "Automoción",
  },
  {
    src: gallery4,
    alt: "Soporte de escritorio impreso en 3D",
    category: "Accesorios",
  },
  {
    src: gallery5,
    alt: "Engranajes de precisión impresos en 3D",
    category: "Prototipos",
  },
  {
    src: gallery6,
    alt: "Maqueta arquitectónica impresa en 3D",
    category: "Arquitectura",
  },
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="trabajos" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trabajos realizados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ejemplos de piezas impresas en 3D para nuestros clientes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-card card-shadow border border-border/50 cursor-pointer"
              onClick={() => setSelectedImage(item.src)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Estos son solo algunos ejemplos. Cada proyecto es único y personalizado.
        </p>

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-foreground/80 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={selectedImage}
                alt="Vista ampliada"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                className="absolute -top-4 -right-4 w-10 h-10 bg-card rounded-full flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
