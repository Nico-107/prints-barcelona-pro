import { describe, it, expect } from "vitest";
import { pathLanguage } from "./pathLanguage";

describe("pathLanguage", () => {
  // Spanish (default)
  it.each([
    "/",
    "/impresion-3d-barcelona",
    "/impresion-3d-empresas-barcelona",
    "/precio-impresion-3d-barcelona",
    "/makers",
    "/lemon",
    "/track",
    "/madrid",
    "/disena-tu-pieza-3d",
    "/blog",
    "/blog/precio-impresion-3d-barcelona",
    "/blog/impresion-3d-urgente-barcelona",
  ])("returns es for %s", (path) => {
    expect(pathLanguage(path)).toBe("es");
  });

  // Catalan
  it.each([
    "/ca",
    "/ca/",
    "/ca/impressio-3d-barcelona",
    "/ca/impressio-3d-empreses-barcelona",
    "/ca/peces-personalitzades-3d-barcelona",
    "/dissenya-la-teva-peca-3d",
    "/comprovador-arxiu-3d",
  ])("returns ca for %s", (path) => {
    expect(pathLanguage(path)).toBe("ca");
  });

  // German
  it.each([
    "/de/3d-druck-service",
    "/de/3d-druck-berlin",
    "/de/3d-druck-muenchen",
    "/de/3d-druck-hamburg",
    "/de/3d-druck-kosten",
    "/de/3d-druck-datei-vorbereiten",
    "/de/3d-druck-materialien",
    "/de/bosch-geschirrspuelkorb-rad",
    "/de/gardena-schlauch-adapter",
    "/de/vesa-monitor-adapter",
    "/mit-3d-drucker-geld-verdienen",
    "/ist-3d-druck-geschaeft-rentabel",
    "/kunden-fuer-3d-druck-finden",
  ])("returns de for %s", (path) => {
    expect(pathLanguage(path)).toBe("de");
  });

  // Dutch
  it.each([
    "/nl/3d-printen-laten-maken",
    "/nl/3d-printen-amsterdam",
    "/nl/3d-printen-rotterdam",
    "/nl/3d-printen-eindhoven",
    "/nl/3d-printen-kosten",
    "/nl/3d-printbestand-voorbereiden",
    "/nl/3d-print-materialen",
    "/nl/vesa-monitor-adapter",
  ])("returns nl for %s", (path) => {
    expect(pathLanguage(path)).toBe("nl");
  });

  // French
  it.each([
    "/fr/impression-3d-en-ligne",
    "/fr/impression-3d-paris",
    "/fr/impression-3d-toulouse",
    "/fr/impression-3d-montpellier",
    "/fr/impression-3d-lyon",
    "/fr/prix-impression-3d",
    "/fr/preparer-fichier-impression-3d",
    "/fr/materiaux-impression-3d",
    "/fr/roue-panier-lave-vaisselle-bosch",
    "/fr/adaptateur-vesa-moniteur",
    "/3d-printing-delivery-paris",
  ])("returns fr for %s", (path) => {
    expect(pathLanguage(path)).toBe("fr");
  });

  // Italian
  it.each([
    "/it/stampa-3d-online",
    "/it/stampa-3d-milano",
    "/it/stampa-3d-torino",
    "/it/stampa-3d-roma",
    "/it/prezzi-stampa-3d",
    "/it/preparare-file-stampa-3d",
    "/it/materiali-stampa-3d",
    "/it/adattatore-vesa-monitor",
    "/it/imbuto-dosatore-caffe-58mm",
  ])("returns it for %s", (path) => {
    expect(pathLanguage(path)).toBe("it");
  });

  // Portuguese
  it.each([
    "/pt/impressao-3d-online",
    "/pt/impressao-3d-lisboa",
    "/pt/impressao-3d-porto",
    "/pt/preco-impressao-3d",
    "/pt/preparar-ficheiro-impressao-3d",
    "/pt/materiais-impressao-3d",
  ])("returns pt for %s", (path) => {
    expect(pathLanguage(path)).toBe("pt");
  });

  // English
  it.each([
    "/3d-printing-service",
    "/3d-printing-barcelona",
    "/3d-printing-for-business-barcelona",
    "/3d-printing-materials-guide",
    "/3d-printing-price-barcelona",
    "/3d-printing-delivery-london",
    "/3d-printing-delivery-new-york",
    "/3d-printing-delivery-berlin",
    "/3d-printing-delivery-amsterdam",
    "/3d-printing-delivery-milan",
    "/3d-printing-delivery-rome",
    "/3d-printing-delivery-lisbon",
    "/3d-printing-madrid",
    "/maker-guide",
    "/privacy",
    "/design-your-3d-part",
    "/3d-file-checker",
  ])("returns en for %s", (path) => {
    expect(pathLanguage(path)).toBe("en");
  });
});
