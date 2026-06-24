import type { LandingContent } from "./landingPages";

const pick = (...names: string[]) => names.map((n) => `/projects/${n}`);

export const PAGES_CA: LandingContent[] = [
  {
    slug: "/ca/impressio-3d-barcelona",
    altSlug: "/3d-printing-barcelona",
    topic: "service-3d-printing",
    lang: "ca",
    category: "service",
    metaTitle: "Impressió 3D a Barcelona — Pressupost en 1h, Lliurament 24–48h | Dimension3D",
    metaDescription: "Servei professional d'impressió 3D a Barcelona. Envia el teu arxiu STL/STEP — pressupost en menys d'1 hora, lliurament en 24–48h. Peces funcionals, prototips i peces a mida. Recollida local o enviament a Espanya.",
    h1: "Impressió 3D a Barcelona — Pressupost en 1h, Lliurament Ràpid",
    intro: "Dimension3D és un estudi d'impressió 3D ubicat a Barcelona que ajuda particulars, makers, enginyers i petites empreses a fabricar peces físiques de manera ràpida, neta i a un preu just. Des d'un sol recanvi fins a una petita tirada de prototips funcionals, gestionem tot el procés de manera local a la ciutat.",
    sections: [
      {
        heading: "Què imprimim cada setmana a Barcelona",
        body: "El nostre dia a dia combina peces úniques a mida, recanvis d'objectes trencats o descatalogats, prototips de disseny per a startups locals i regals personalitzats. Treballem amb tecnologia FDM i una selecció acurada de materials (PLA, PETG, ABS/ASA, Nylon i TPU), per triar el plàstic adequat en lloc d'imposar-ne un sol a tots els projectes.\n\nSi tens un arxiu 3D (STL, OBJ, 3MF, STEP) podem pressupostar-lo gairebé a l'instant. Si només tens una foto, un esbós o la peça trencada, t'ajudem a convertir-ho en alguna cosa imprimible. La idea és sempre la mateixa: tu ens expliques el problema, nosaltres lliurem la peça."
      },
      {
        heading: "Per què triar un proveïdor local a Barcelona",
        body: "Treballar amb una impremta 3D a la teva pròpia ciutat ho canvia tot. T'estalvies enviaments internacionals, duanes i barreres d'idioma. Pots recollir la comanda a Barcelona amb cita prèvia, o rebre-la a qualsevol punt de l'Espanya peninsular amb seguiment. Els pressupostos arriben en menys d'1 hora en horari laboral per WhatsApp i et podem ensenyar mostres reals abans d'imprimir.\n\nSer locals també ens permet iterar ràpid. Si un prototip necessita un petit canvi, l'ajustem i reimprimim el mateix dia en lloc d'esperar una setmana a un proveïdor estranger."
      },
      {
        heading: "Lliuraments ràpids i servei el mateix dia",
        body: "Les comandes estàndard es lliuren en 2–5 dies laborables. Per a encàrrecs realment urgents oferim servei Express en 24–48 hores, i fins i tot producció el mateix dia quan la cua ho permet. Si tens una data límit — un esdeveniment, una demo a un client, un electrodomèstic aturat — digues-ho des del principi i et direm amb honestedat què és viable.\n\nMai enviem una peça que no ens quedaríem nosaltres. Cada impressió es revisa pel que fa a adherència entre capes, precisió dimensional i acabat abans de sortir del taller."
      },
      {
        heading: "Com és el procés",
        body: "1. Envia'ns el teu arxiu o descriu què necessites al formulari o per WhatsApp.\n2. Et responem amb un preu clar, el material recomanat i els terminis.\n3. Tu aproves, imprimim, revisem i reps la peça.\n\nSense subscripcions, sense comanda mínima i sense sorpreses al preu."
      }
    ],
    faqs: [
      { q: "En quant de temps puc tenir una impressió 3D a Barcelona?", a: "El termini estàndard és de 2–5 dies laborables. Tenim servei Express en 24–48 hores i fins i tot lliuraments el mateix dia segons la cua i la mida de la peça." },
      { q: "Necessito un arxiu 3D per fer una comanda?", a: "No. Si només tens una foto, un esbós o la peça trencada original, t'ajudem a arribar a un arxiu imprimible. També oferim disseny a mida sota pressupost." },
      { q: "Puc recollir la comanda a Barcelona?", a: "Sí, oferim recollida local a Barcelona amb cita prèvia. També enviem a tota l'Espanya peninsular amb seguiment." },
      { q: "Quant costa una impressió 3D?", a: "La majoria de peces petites comencen des de 10€. El preu final depèn de la mida, el material, el temps d'impressió i la quantitat. Sempre reps un pressupost transparent abans de pagar res." },
      { q: "Oferiu impressió en resina o només FDM?", a: "Treballem amb tecnologia FDM, que cobreix la gran majoria d'aplicacions pràctiques — peces funcionals, prototips, regals i recanvis. Si un projecte requereix realment el nivell de detall de la resina, t'ho diem per endavant." },
      { q: "Quina és la mida màxima que podeu imprimir en una peça?", a: "El nostre volum d'impressió és d'aproximadament 250×250×300 mm. Els objectes més grans es poden imprimir per parts i acoblar neta, amb unions planificades per minimitzar la seva visibilitat." }
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "green-chameleon.jpg", "eiffel-tower.jpg", "purple-figures.jpg", "halloween-set.jpg", "intake-manifold.jpg"),
    related: [
      { label: "Peces Personalitzades", slug: "/ca/peces-personalitzades-3d-barcelona" },
      { label: "Prototips 3D", slug: "/ca/prototips-3d-barcelona" },
      { label: "Impressió 3D Urgent", slug: "/ca/impressio-3d-urgent-barcelona" },
      { label: "Preus", slug: "/ca/preu-impressio-3d-barcelona" }
    ],
    schemaServiceName: "Servei d'Impressió 3D Barcelona"
  },
  {
    slug: "/ca/peces-personalitzades-3d-barcelona",
    altSlug: "/custom-parts-barcelona",
    topic: "custom-parts",
    lang: "ca",
    category: "use-case",
    metaTitle: "Peces 3D a Mida Barcelona — STL/STEP o Foto, Pressupost en 1h | Dimension3D",
    metaDescription: "Peces 3D a mida a Barcelona des del teu STL, STEP o foto. Recanvis funcionals, suports, clips de cotxe i prototips. Pressupost professional en menys d'1 hora. Sense comanda mínima.",
    h1: "Peces 3D a Mida a Barcelona — De Fitxer a Peça en 24–48h",
    intro: "Necessites una peça que no trobes a cap botiga? Això és justament el que fem. Dimension3D fabrica peces 3D personalitzades a Barcelona per a llars, tallers, conductors i makers — des d'un sol clip trencat fins a petites tirades de suports a mida.",
    sections: [
      {
        heading: "Peces personalitzades habituals",
        body: "Alguns dels encàrrecs més freqüents que rebem a Barcelona: recanvis de plàstic per a electrodomèstics (rentadores, neveres, rentaplats, aspiradores), clips i embellidors de cotxe trencats, suports per a prestatges, monitors i equips, poms i tiradors, guies de calaix, organitzadors, accessoris per a bicicleta i carcasses protectores per a electrònica.\n\nSi la peça original ja no es fabrica, o el fabricant cobra un preu absurd per un tros de plàstic minúscul, una impressió 3D a mida sol ser més ràpida, més barata i igual de duradora quan es fa en el material adequat."
      },
      {
        heading: "Envia una foto i rep la peça",
        body: "No necessites un arxiu 3D. La majoria dels nostres clients de peces a mida ens envien per WhatsApp una foto de la peça trencada al costat d'un regle o una moneda com a referència. A partir d'aquí solem poder:\n\n• confirmar si és imprimible,\n• recomanar un material (PLA per a peces sense esforç, PETG o ABS per a peces amb càrrega, TPU per a peces flexibles),\n• i donar-te un preu clar en menys d'una hora.\n\nPer a formes més complexes també treballem amb arxius STEP/STL, plànols tècnics o mesures que tu mateix aportis."
      },
      {
        heading: "Peces úniques i petites tirades",
        body: "No hi ha comanda mínima. Tan contents imprimim un sol suport de recanvi com una petita sèrie de peces idèntiques per a un taller, una clínica dental, un estudi d'arquitectura o una botiga local. Per a clients habituals desem l'arxiu, així els reencàrrecs són immediats."
      },
      {
        heading: "Pensades per durar de debò",
        body: "Una peça impresa en 3D només és tan bona com el seu material i els seus paràmetres d'impressió. Triem el plàstic i la densitat de farciment segons la funció real de la peça, no el més barat. Per això moltes peces a mida de Dimension3D són més duradores que el plàstic injectat original que substitueixen."
      }
    ],
    faqs: [
      { q: "Podeu copiar una peça trencada a partir d'una foto?", a: "En molts casos sí — sobretot peces simètriques o amb geometria senzilla. Envia una foto clara amb regle o moneda com a referència i t'ho confirmem de seguida." },
      { q: "Quin material recomaneu per a peces a mida?", a: "PLA per a peces decoratives o sense esforç, PETG per a exteriors o càrrega moderada, ABS/ASA per a resistència a la calor i TPU per a peces flexibles com mànecs o juntes." },
      { q: "Hi ha comanda mínima?", a: "No. Imprimim peces úniques constantment, i només pagues pel que demanes." },
      { q: "Quina precisió tenen les peces a mida?", a: "La precisió típica en FDM és d'uns ±0,2 mm. Per a toleràncies més ajustades afinem paràmetres i postprocessem les superfícies crítiques." },
      { q: "Podeu recrear una peça només a partir de mesures, sense l'original?", a: "Sí. Si pots aportar mesures detallades, fotos des de diversos angles o un croquis tècnic, podem modelar i imprimir la peça. Per a geometries complexes, una breu consulta ajuda a aclarir els requisits d'ajust." },
      { q: "Què passa si la peça impresa no encaixa al primer intent?", a: "La FDM manté una precisió típica de ±0,2 mm. Si un primer intent és lleugerament fora per a un ajust de tolerància ajustada, apliquem una petita correcció dimensional (normalment 0,1–0,2 mm) i reimprimim a cost reduït." }
    ],
    galleryImages: pick("custom-brackets.jpg", "ferrari-key-holder.jpg", "red-adapter.jpg", "intake-manifold.jpg", "black-intake.jpg", "curved-parts.jpg"),
    related: [
      { label: "Recanvis 3D", slug: "/ca/recanvis-impressio-3d-barcelona" },
      { label: "Prototips 3D", slug: "/ca/prototips-3d-barcelona" },
      { label: "Impressió PETG", slug: "/ca/impressio-petg-barcelona" },
      { label: "Impressió 3D Urgent", slug: "/ca/impressio-3d-urgent-barcelona" }
    ],
    schemaServiceName: "Peces Personalitzades 3D Barcelona"
  },
  {
    slug: "/ca/prototips-3d-barcelona",
    altSlug: "/prototype-printing-barcelona",
    topic: "prototypes",
    lang: "ca",
    category: "use-case",
    metaTitle: "Prototips 3D a Barcelona | Prototipatge Ràpid FDM",
    metaDescription: "Prototipatge ràpid a Barcelona per a startups, enginyers i estudiants. Prototips funcionals, validació de producte, tirades pilot. Terminis ràpids.",
    h1: "Prototips 3D a Barcelona",
    intro: "Dimension3D és l'aliat a Barcelona per a qualsevol que estigui iterant sobre un producte físic — startups validant el seu primer hardware, enginyers freelance, dissenyadors industrials, estudiants universitaris i inventors. Imprimim prototips funcionals que pots provar de debò, no només ensenyar.",
    sections: [
      {
        heading: "Prototipatge ràpid per no aturar el teu projecte",
        body: "El sentit d'un prototip és aprendre ràpid. Cada setmana extra entre iteracions et costa temps, diners i impuls. Treballar amb una impremta 3D local a Barcelona et permet passar d'una revisió CAD a una peça a mà en 24–72 hores, sense esperar un servei estranger.\n\nAcceptem arxius STL, OBJ, 3MF i STEP. Si treballes amb SolidWorks, Fusion 360, Onshape, Rhino, FreeCAD o Tinkercad, les seves exportacions natives funcionen sense problema."
      },
      {
        heading: "Prototips funcionals, no maquetes",
        body: "T'ajudem a triar el material segons el que hagi de fer el prototip. PLA és ideal per validar forma i ajust. PETG aguanta esforç moderat i exteriors. ABS/ASA tolera calor. Nylon i Nylon-CF donen una resistència mecànica propera als plàstics d'enginyeria. TPU permet prototipar juntes, segells i cobertes flexibles.\n\nAixò importa: un prototip que falla pel motiu equivocat — material o farciment mal triats — desaprofita un cicle sencer d'iteració."
      },
      {
        heading: "Startups, enginyers, makers i projectes acadèmics",
        body: "Treballem habitualment amb:\n\n• Startups de hardware a Barcelona validant MVPs.\n• Dissenyadors de producte freelance presentant a clients.\n• Enginyers que necessiten plantilles, utillatge i eines.\n• Estudiants de la UPC, ESDi, Elisava i IED produint projectes finals.\n• Inventors en procés de patent que necessiten una mostra física funcional.\n\nSignem NDA amb gust per a projectes confidencials."
      },
      {
        heading: "Del prototip a la petita sèrie",
        body: "Un cop validat el prototip, podem escalar a tirades de baixa producció (típicament 5–200 unitats segons la mida) sense que hagis de canviar de proveïdor. Aquesta continuïtat importa quan intentes llançar un producte, no només imprimir-lo."
      }
    ],
    faqs: [
      { q: "Quins formats d'arxiu 3D accepteu?", a: "STL, OBJ, 3MF i STEP. També podem treballar amb exportacions natives del teu CAD — pregunta'ns." },
      { q: "Signeu NDA per a prototips confidencials?", a: "Sí. Signem NDA habitualment amb startups de hardware i departaments d'R+D." },
      { q: "Feu petites tirades de producció després del prototip?", a: "Sí, produïm tirades de 5–200 unitats un cop validat el disseny." },
      { q: "Quant es triga en una iteració?", a: "La majoria d'iteracions de prototip estan llestes en 24–72 hores segons mida i material." },
      { q: "És millor la FDM que la resina per al meu prototip?", a: "Per a prototips funcionals que cal manipular, provar o sotmetre a esforç, la FDM sol ser millor — produeix peces més resistents en una gamma de materials més àmplia. La resina té major detall superficial però és més fràgil. T'assessorem segons el que el teu prototip ha de demostrar." },
      { q: "Què passa si trobeu un problema al meu arxiu durant la revisió?", a: "Ho indiquem al pressupost abans de començar — problemes de gruix de paret, voladissos sense suport, orientació que afectaria la resistència. Tu decideixes si revisar l'arxiu o continuar amb les nostres recomanacions." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "black-intake.jpg", "red-adapter.jpg", "blue-molds.jpg", "curved-parts.jpg"),
    related: [
      { label: "Peces Personalitzades", slug: "/ca/peces-personalitzades-3d-barcelona" },
      { label: "Impressió 3D Urgent", slug: "/ca/impressio-3d-urgent-barcelona" },
      { label: "Preus", slug: "/ca/preu-impressio-3d-barcelona" },
      { label: "Impressió PETG", slug: "/ca/impressio-petg-barcelona" }
    ],
    schemaServiceName: "Prototipatge Ràpid Barcelona"
  },
  {
    slug: "/ca/impressio-3d-urgent-barcelona",
    altSlug: "/urgent-3d-printing-barcelona",
    topic: "urgent",
    lang: "ca",
    category: "service",
    metaTitle: "Impressió 3D Urgent a Barcelona | Express 24h",
    metaDescription: "Impressió 3D urgent a Barcelona. Cua prioritària, lliuraments en 24–48h i el mateix dia per a peces trencades, esdeveniments i cosplay. Contacta per WhatsApp.",
    h1: "Impressió 3D Urgent a Barcelona",
    intro: "De vegades una peça no pot esperar. Un electrodomèstic trencat bloqueja la teva cuina, una demo a un client és demà, un lliurament de cosplay és aquest cap de setmana. Dimension3D ofereix servei d'impressió 3D urgent a Barcelona amb cua prioritària, lliuraments en 24–48 hores i producció el mateix dia quan les màquines ho permeten.",
    sections: [
      {
        heading: "Com funcionen les comandes urgents",
        body: "Envia'ns un WhatsApp amb el que necessites i la teva data límit. En qüestió de minuts (en horari laboral) et diem amb honestedat:\n\n• si el termini és realista,\n• quin material recomanem per imprimir el més ràpid possible sense sacrificar la funció,\n• i el preu Express.\n\nNo acceptem l'encàrrec si no podem complir el termini — preferim perdre una feina abans que deixar tirat un client."
      },
      {
        heading: "Casos típics d'urgència",
        body: "• Recanvis d'electrodomèstics que bloquegen el dia a dia (tiradors de rentadora, clips de nevera, broquets d'aspiradora).\n• Atrezzo, cartells i suports d'última hora per a esdeveniments.\n• Accessoris de cosplay abans d'una convenció o sessió de fotos.\n• Plantilles d'enginyeria o clips de recanvi en una línia de producció.\n• Prototips de demo per a una reunió amb inversors.\n\nSi és imprimible en FDM i la geometria és raonable, normalment l'encaixem a la cua."
      },
      {
        heading: "Cua prioritària sense perdre qualitat",
        body: "Express no vol dir nyap. Continuem laminant amb suports adequats, temperatures calibrades i revisem cada peça abans que surti del taller. La diferència és que el teu encàrrec passa al davant de la cua i s'imprimeix a la següent màquina disponible."
      },
      {
        heading: "Recollida o lliurament ràpid a Barcelona",
        body: "Per a encàrrecs urgents a Barcelona, la recollida local amb cita prèvia és l'opció més ràpida. També coordinem missatgeria el mateix dia dins de la ciutat per a encàrrecs que no es poden recollir. Per a la resta de l'Espanya peninsular, oferim enviament express amb seguiment."
      }
    ],
    faqs: [
      { q: "Realment puc tenir una impressió 3D el mateix dia a Barcelona?", a: "De vegades — depèn de la mida, el material i la cua actual. Envia'ns un WhatsApp amb la peça i la data límit i et responem honestament en minuts." },
      { q: "Quant costa extra el servei urgent?", a: "Els encàrrecs Express tenen un recàrrec de prioritat que depèn de la mida i el termini. Sempre veus el preu total abans d'aprovar la comanda." },
      { q: "Quina és la manera més ràpida d'enviar el meu arxiu?", a: "WhatsApp al +34 672 051 147. Adjunta el STL/STEP/foto i indica el termini." },
      { q: "Les impressions urgents poden tenir bona qualitat?", a: "Sí. No sacrifiquem adherència entre capes, precisió dimensional ni acabat per la velocitat — només donem prioritat al teu encàrrec." },
      { q: "Treballeu els caps de setmana per a emergències reals?", a: "Contacta'ns per WhatsApp — per a emergències reals de vegades podem acomodar producció en cap de setmana. No és un servei garantit, però sempre val la pena preguntar si la teva situació és crítica." },
      { q: "Quin és el termini mínim absolut possible?", a: "Per a peces petites i simples en PLA o PETG, hem tingut comandes llestes per a recollida local en tan sols 3–6 hores des de l'aprovació de l'arxiu. Les peces més grans o complexes sempre necessiten més temps." }
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "halloween-set.jpg", "stranger-things-lit.jpg", "lion-king-figures.jpg", "intake-manifold.jpg", "custom-brackets.jpg"),
    related: [
      { label: "Recanvis 3D", slug: "/ca/recanvis-impressio-3d-barcelona" },
      { label: "Peces Personalitzades", slug: "/ca/peces-personalitzades-3d-barcelona" },
      { label: "Prototips 3D", slug: "/ca/prototips-3d-barcelona" },
      { label: "Preus", slug: "/ca/preu-impressio-3d-barcelona" }
    ],
    schemaServiceName: "Impressió 3D Urgent Barcelona"
  },
  {
    slug: "/ca/preu-impressio-3d-barcelona",
    altSlug: "/3d-printing-price-barcelona",
    topic: "pricing",
    lang: "ca",
    category: "service",
    metaTitle: "Preu Impressió 3D Barcelona — Des de 10€, Pressupost Gratis en 1h | Dimension3D",
    metaDescription: "Quant costa la impressió 3D a Barcelona? Peces petites des de 10€. Preus transparents per mida, material i quantitat. Pressupost gratis en menys d'1 hora, sense compromís.",
    h1: "Preu d'Impressió 3D a Barcelona",
    intro: "Una de les primeres preguntes de qualsevol client és: quant costarà la meva impressió 3D? En aquesta pàgina expliquem exactament què determina el preu d'una impressió 3D a Barcelona, amb exemples realistes, perquè puguis planificar el teu projecte sense sorpreses.",
    sections: [
      {
        heading: "Què determina el preu",
        body: "Tres factors marquen principalment el preu d'una impressió 3D:\n\n1. Cost del material — PLA és el més assequible; PETG, ABS/ASA i TPU costen una mica més; Nylon i Nylon-CF són els més premium.\n2. Temps i mida — les peces més grans i altes fan servir més plàstic i ocupen la màquina més temps.\n3. Complexitat — suports pesants, detall molt fi, postprocessat o muntatge afegeixen feina.\n\nEt donem un preu únic i transparent que ja inclou preparació, laminat, material, temps de màquina i acabat bàsic."
      },
      {
        heading: "Rangs de preu típics",
        body: "Aquestes referències són realistes per a impressions FDM a Barcelona:\n\n• Peces petites (clip, pom, ganxo, figura petita): des de 10€.\n• Peces mitjanes (suport, organitzador, decoració, figura mitjana): normalment 20–60€.\n• Peces grans (cascos, gerros, carcasses grans, figures altes): normalment 60–250€.\n• Petites tirades: demana preu per unitat — les peces repetides surten més barates.\n\nSón referències de partida. El pressupost exacte depèn del teu arxiu, material i termini."
      },
      {
        heading: "Descomptes per quantitat",
        body: "Les peces repetides costen menys per unitat perquè la preparació i el laminat es fan una sola vegada. Si necessites 5, 20 o 200 peces iguals, indica-ho a la teva sol·licitud i et direm exactament com baixa el preu per unitat segons creix la quantitat."
      },
      {
        heading: "Com demanar un pressupost clar",
        body: "Envia'ns el teu arxiu STL/OBJ/3MF/STEP (o una foto i mesures aproximades) pel formulari de la web o per WhatsApp. En menys d'una hora en horari laboral t'enviem un preu clar, el material recomanat i el termini realista. No es cobra res fins que confirmes la comanda."
      }
    ],
    faqs: [
      { q: "Quina és la impressió 3D més barata?", a: "Peces petites i simples en PLA des d'uns 10€. Materials més resistents o mides majors costen més." },
      { q: "Cobreu pel pressupost?", a: "No. Els pressupostos són sempre gratis i només pagues si confirmes la comanda." },
      { q: "Per què la mateixa peça costa més en PETG o Nylon?", a: "Aquests filaments són més cars i imprimeixen més lentament amb paràmetres més exigents, però duren molt més en aplicacions amb esforç o exteriors." },
      { q: "Les quantitats grans surten més barates per peça?", a: "Sí. Indica'ns la quantitat i t'enviem un preu escalat." },
      { q: "El preu pressupostat és fix un cop l'aprovo?", a: "Sí. Un cop aproves un pressupost, el preu queda bloquejat. Els pressupostos són vàlids per 30 dies des de l'emissió — si els costos de materials canvien significativament després d'aquest període, pot ser que calgui revisar-lo." },
      { q: "Puc obtenir una estimació aproximada sense enviar un arxiu?", a: "Sí — descriu la mida de la peça, el material i la quantitat i et donarem un rang orientatiu realista. Per a un pressupost exacte i vinculant, necessitem un arxiu o una foto clara amb dimensions." }
    ],
    galleryImages: pick("custom-brackets.jpg", "ferrari-key-holder.jpg", "purple-figures.jpg", "cookie-cutters.jpg", "blue-molds.jpg", "red-adapter.jpg"),
    related: [
      { label: "Servei d'Impressió 3D", slug: "/ca/impressio-3d-barcelona" },
      { label: "Peces Personalitzades", slug: "/ca/peces-personalitzades-3d-barcelona" },
      { label: "Impressió PLA", slug: "/ca/impressio-pla-barcelona" },
      { label: "Prototips 3D", slug: "/ca/prototips-3d-barcelona" }
    ],
    schemaServiceName: "Preus Impressió 3D Barcelona"
  },
  {
    slug: "/ca/recanvis-impressio-3d-barcelona",
    altSlug: "/replacement-parts-barcelona",
    topic: "replacement-parts",
    lang: "ca",
    category: "use-case",
    metaTitle: "Recanvis 3D Barcelona — Clips Trencats, Electrodomèstics i Peces Descatalogades | Dimension3D",
    metaDescription: "Recanvis impresos en 3D a Barcelona per a electrodomèstics, mobles i vehicles. Clips trencats, comandaments, suports i peces descatalogades. De foto a peça en 24–48h. Des de 10€.",
    h1: "Recanvis Impresos en 3D a Barcelona",
    intro: "Llençar un electrodomèstic que funciona perfectament per culpa d'un tros minúscul de plàstic trencat no té sentit — ni a nivell ambiental ni econòmic. Dimension3D fabrica recanvis impresos en 3D a Barcelona per a electrodomèstics, mobiliari, objectes antics i qualsevol producte el recanvi original del qual ja no estigui disponible.",
    sections: [
      {
        heading: "Recanvis que fem cada dia",
        body: "Encàrrecs habituals a Barcelona:\n\n• Calaixos, tiradors i clips de rentadores i rentaplats.\n• Suports de prestatges, guies i frontisses de neveres.\n• Adaptadors i clips d'aspiradores.\n• Poms i peces de dipòsits de cafeteres.\n• Connectors de mobles i suports de prestatges.\n• Peces per a ràdios antigues, càmeres i joguines vintage.\n• Clips, suports i accessoris per a bici i patinet.\n\nSi la peça original es va trencar, deformar o simplement va desaparèixer, hi ha moltes possibilitats que la puguem recrear."
      },
      {
        heading: "Quan la peça ja no es ven",
        body: "Molts fabricants deixen de vendre recanvis al cap d'uns anys, deixant el propietari amb un producte perfectament funcional i un tros de plàstic de 5€ que falta. Podem fer enginyeria inversa de la peça a partir d'una foto clara amb escala, de la peça trencada original o de les teves mesures, i la imprimim en un material que duri més que l'original."
      },
      {
        heading: "Reparar en lloc de llençar",
        body: "Reparar en lloc de reemplaçar evita emissions de fabricació i residus electrònics. Una peça impresa en 3D fa servir una fracció de l'energia i materials necessaris per fabricar un electrodomèstic nou. És la nostra petita aportació al dret a reparar aquí a Barcelona."
      },
      {
        heading: "Com demanar un recanvi",
        body: "Envia'ns un WhatsApp amb:\n\n1. Una foto clara de la peça trencada al costat d'un regle o moneda.\n2. Una foto del lloc on encaixa (per entendre com es munta).\n3. Marca i model de l'aparell, si els coneixes.\n\nEt responem amb la viabilitat, el material recomanat i el preu en menys d'una hora, en horari laboral."
      }
    ],
    faqs: [
      { q: "Podeu substituir qualsevol peça de plàstic?", a: "La majoria de peces de plàstic simples sí. Clips molt fins i elàstics o peces per a molta calor poden requerir un material específic — t'avisem si no és viable." },
      { q: "Quant dura un recanvi imprès?", a: "Quan es fa amb el material adequat (PETG, ABS o Nylon en peces amb esforç), solen durar més que el plàstic injectat original." },
      { q: "Reparar és més barat que comprar nou?", a: "Gairebé sempre. Una peça impresa costa normalment 10–60€ enfront de centenars per un electrodomèstic nou." },
      { q: "Imprimiu peces per a equips antics?", a: "Sí. Càmeres, ràdios, joguines i electrodomèstics antics són alguns dels nostres encàrrecs preferits perquè ja no existeixen recanvis originals." },
      { q: "Quina informació ajuda a obtenir el resultat més precís al primer intent?", a: "Una foto clara de la peça trencada al costat d'un regle o moneda, una foto mostrant on es munta a l'aparell, i la marca i model del dispositiu. Com més context, millor l'ajust al primer intent." },
      { q: "Podeu fer recanvis en metall?", a: "No — treballem exclusivament amb filaments polimèrics (PLA, PETG, ABS/ASA, Nylon, TPU). Per a peces metàl·liques necessitaries un servei de mecanitzat CNC o fosa. Els nostres recanvis polimèrics sovint superen la durabilitat dels originals en aplicacions de baixa temperatura." }
    ],
    galleryImages: pick("custom-brackets.jpg", "red-adapter.jpg", "curved-parts.jpg", "black-intake.jpg", "intake-manifold.jpg", "ferrari-key-holder.jpg"),
    related: [
      { label: "Peces Personalitzades", slug: "/ca/peces-personalitzades-3d-barcelona" },
      { label: "Impressió PETG", slug: "/ca/impressio-petg-barcelona" },
      { label: "Impressió 3D Urgent", slug: "/ca/impressio-3d-urgent-barcelona" },
      { label: "Servei d'Impressió 3D", slug: "/ca/impressio-3d-barcelona" }
    ],
    schemaServiceName: "Recanvis Impresos 3D Barcelona"
  },
  {
    slug: "/ca/impressio-pla-barcelona",
    altSlug: "/pla-printing-barcelona",
    topic: "pla",
    lang: "ca",
    category: "material",
    metaTitle: "Impressió PLA Barcelona — Prototips, Regals i Decoració | Dimension3D",
    metaDescription: "Impressió 3D en PLA a Barcelona — precisa, econòmica i ecològica. Prototips, decoracions, regals personalitzats i figures. Àmplia gamma de colors. Pressupost gratis en menys d'1 hora.",
    h1: "Impressió 3D en PLA a Barcelona",
    intro: "El PLA és el material d'impressió 3D més popular del món per bons motius — és ecològic, fàcil d'imprimir amb gran precisió i disponible en una enorme gamma de colors. Dimension3D ofereix impressió professional en PLA a Barcelona per a tota mena de projectes, des de peces decoratives fins a prototips inicials.",
    sections: [
      {
        heading: "Per què PLA",
        body: "El PLA (àcid polilàctic) és un bioplàstic derivat de fonts renovables com el midó de blat de moro. Comparat amb altres materials d'impressió 3D:\n\n• És ecològic i biodegradable en condicions de compostatge industrial.\n• És fàcil d'imprimir a alta resolució, capturant detalls fins.\n• Està disponible en desenes de colors i acabats (mat, seda, brillant, fluorescent, marbre, efecte fusta).\n• És més assequible que els plàstics d'enginyeria.\n\nLes seves principals limitacions són la sensibilitat a la calor (es reblaneix per damunt de ~55°C) i menor resistència mecànica que PETG, ABS o Nylon."
      },
      {
        heading: "Per a què és millor el PLA",
        body: "Recomanem PLA per a:\n\n• Peces decoratives, escultures, figures i dioràmies.\n• Prototips d'arquitectura i disseny de producte.\n• Regals, articles personalitzats, clauers a mida.\n• Talladors de galetes, testos, organitzadors (ús interior).\n• Projectes educatius i d'estudiants.\n• Miniatures de joc de taula i col·leccionables.\n\nPer a qualsevol cosa que hagi de viure a l'exterior, suportar pes o resistir calor, normalment recomanem PETG, ABS/ASA o Nylon."
      },
      {
        heading: "Opcions de color i acabat",
        body: "Tenim una àmplia gamma de colors PLA: negres, blancs i grisos clàssics per a prototips; vermells, blaus, verds, grocs i morats vibrants per a peces decoratives; i filaments especials com seda, mat, efecte marbre i fluorescent. Si cerques un color de marca específic o un Pantone, envia'ns la referència i l'igualem el màxim possible."
      },
      {
        heading: "Bona relació qualitat-preu i lliuraments ràpids",
        body: "Com que el PLA imprimeix ràpid i de manera fiable, també és un dels materials més assequibles. Les peces petites en PLA comencen des de 10€ i la majoria de comandes en PLA surten en 2–5 dies laborables. Hi ha servei Express per a urgències."
      }
    ],
    faqs: [
      { q: "És el PLA prou fort per a peces funcionals?", a: "Per a esforços baixos o moderats, sí. Per a peces amb càrrega o altes temperatures recomanem PETG, ABS/ASA o Nylon." },
      { q: "És realment biodegradable el PLA?", a: "Sí, en condicions de compostatge industrial. En un calaix normal dura anys." },
      { q: "Podeu imprimir PLA en qualsevol color?", a: "Tenim un ampli assortiment. Per a colors especials, digues-nos la referència i busquem la coincidència més propera." },
      { q: "Quina és la mida màxima en PLA?", a: "El volum màxim típic és d'uns 250×250×300 mm en una peça. Objectes més grans s'imprimeixen en parts i s'acoblen." },
      { q: "Es pot llimar, imprimar i pintar el PLA?", a: "Sí. El PLA es llima fàcilment amb paper de vidre estàndard, accepta bé l'imprimació acrílica i es pot pintar amb aerosol o pintura acrílica. És el material ideal per a figures i peces decoratives que pensis acabar o personalitzar." },
      { q: "És el PLA segur per al contacte amb aliments?", a: "El PLA estàndard no està certificat per a contacte alimentari — la superfície porosa de la FDM pot albergar bacteris fins i tot després del rentat. No el recomanem per a tasses, plats o coberts. Per a aplicacions de contacte alimentari, consulta'ns sobre materials certificats." }
    ],
    galleryImages: pick("eiffel-tower.jpg", "big-ben-tower.jpg", "green-chameleon.jpg", "purple-figures.jpg", "halloween-set.jpg", "ferrari-key-holder.jpg"),
    related: [
      { label: "Impressió PETG", slug: "/ca/impressio-petg-barcelona" },
      { label: "Impressió TPU", slug: "/ca/impressio-tpu-barcelona" },
      { label: "Miniatures 3D", slug: "/ca/miniatures-3d-barcelona" },
      { label: "Preus", slug: "/ca/preu-impressio-3d-barcelona" }
    ],
    schemaServiceName: "Impressió PLA Barcelona"
  },
  {
    slug: "/ca/impressio-petg-barcelona",
    altSlug: "/petg-printing-barcelona",
    topic: "petg",
    lang: "ca",
    category: "material",
    metaTitle: "Impressió PETG Barcelona — Peces Funcionals i d'Exterior | Dimension3D",
    metaDescription: "Impressió 3D en PETG a Barcelona. Més resistent que el PLA, suporta aigua i UV. Envia el teu STL/STEP — pressupost en 1h. Ideal per a peces funcionals, mecàniques i d'exterior.",
    h1: "Impressió 3D en PETG a Barcelona",
    intro: "Quan una peça necessita ser més dura que el PLA, sobreviure a l'exterior o estar en contacte amb aigua, el PETG sol ser la resposta. Dimension3D ofereix impressió professional en PETG a Barcelona per a aplicacions funcionals, mecàniques i d'exterior.",
    sections: [
      {
        heading: "Per què PETG",
        body: "El PETG (tereftalat de polietilè glicol) està entre el PLA i l'ABS pel que fa a dificultat i propietats. Comparat amb el PLA ofereix:\n\n• Major resistència a l'impacte — les peces flexen en lloc de trencar-se.\n• Millor resistència a temperatura (reblaneix sobre 70–80°C).\n• Excel·lent adherència entre capes, que dona impressions més fortes.\n• Bona resistència química, a l'aigua i a UV.\n\nÉs el material que més recomanem per a peces que han de complir una funció real, no només lluir bé."
      },
      {
        heading: "Per a què és millor el PETG",
        body: "Encàrrecs típics en PETG a Barcelona:\n\n• Suports i muntatges d'exterior (testos, equip de jardí, terrassa).\n• Clips funcionals i embellidors de cotxe.\n• Plantilles mecàniques, utillatge i eines.\n• Recanvis d'electrodomèstics que s'escalfen o mullen.\n• Recipients, tapes i aplicacions properes a aliments (el contacte alimentari requereix filament certificat — pregunta'ns).\n• Accessoris de bici i patinet exposats al clima."
      },
      {
        heading: "Resistència a exterior i aigua",
        body: "El PETG resisteix molt millor que el PLA la humitat i l'exposició UV, cosa que el converteix en l'opció natural per a qualsevol cosa que visqui fora tot l'any al clima de Barcelona. A més és menys trencadís en fred, així que les peces aguanten els canvis de temperatura sense esquerdar-se."
      },
      {
        heading: "Demana peces en PETG a Barcelona",
        body: "Envia el teu arxiu STL/STEP o descriu la peça al formulari. Et suggerirem el gruix de paret i el farciment adequats perquè la peça sigui prou forta sense ser innecessàriament cara. Les peces petites en PETG comencen des de 12–15€."
      }
    ],
    faqs: [
      { q: "En què es diferencia el PETG del PLA?", a: "El PETG és més dur, més flexible a l'impacte, més resistent a la calor i suporta l'exterior. El PLA és més fàcil d'imprimir, capta més detall i és més barat." },
      { q: "Aguanta el PETG els estius de Barcelona a l'exterior?", a: "Sí. El PETG resisteix bé UV i humitat. Per a aplicacions de molta calor podem suggerir ABS/ASA." },
      { q: "És el PETG apte per a aliments?", a: "El PETG estàndard no està certificat per a contacte alimentari. Existeix PETG certificat food-safe i el podem aconseguir per a projectes específics." },
      { q: "És el PETG més car que el PLA?", a: "Una mica. El material costa una mica més i imprimeix més lentament, així que el preu per peça és típicament un 15–30% més alt que en PLA." },
      { q: "A quina temperatura comença a deformar-se el PETG?", a: "El PETG comença a reblanir-se al voltant dels 70–80°C. Per a peces prop de fonts de calor constants — motors, rentaplats, prop de forns — recomanem ABS/ASA, que aguanta fins a 90–100°C." },
      { q: "Quant més resistent és el PETG que el PLA per a peces funcionals?", a: "El PETG ofereix típicament un 20–30% més de resistència a l'impacte que el PLA i una adherència entre capes significativament millor. A la pràctica, les peces flexen sota càrrega en lloc de trencar-se neta — cosa que importa en l'ús mecànic real." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "black-intake.jpg", "red-adapter.jpg", "curved-parts.jpg", "blue-molds.jpg"),
    related: [
      { label: "Impressió PLA", slug: "/ca/impressio-pla-barcelona" },
      { label: "Impressió TPU", slug: "/ca/impressio-tpu-barcelona" },
      { label: "Peces Personalitzades", slug: "/ca/peces-personalitzades-3d-barcelona" },
      { label: "Recanvis 3D", slug: "/ca/recanvis-impressio-3d-barcelona" }
    ],
    schemaServiceName: "Impressió PETG Barcelona"
  },
  {
    slug: "/ca/impressio-tpu-barcelona",
    altSlug: "/tpu-printing-barcelona",
    topic: "tpu",
    lang: "ca",
    category: "material",
    metaTitle: "Impressió TPU Flexible Barcelona — Juntes, Mànecs i Peces de Goma | Dimension3D",
    metaDescription: "Impressió 3D flexible en TPU a Barcelona. Peces tipus goma per a suports de mòbil, juntes, mànecs i wearables. Envia STL/STEP — peces flexibles a mida en 24–72h.",
    h1: "Impressió 3D Flexible en TPU a Barcelona",
    intro: "El TPU és el material que fa flexible la impressió 3D. Si una peça necessita doblegar-se, agafar, esmorteir o segellar, aquest és el que fem servir. Dimension3D fabrica impressions 3D a mida en TPU a Barcelona per a tot, des de suports de mòbil fins a juntes industrials.",
    sections: [
      {
        heading: "Què és el TPU",
        body: "El TPU (poliuretà termoplàstic) és un filament flexible tipus goma. La duresa exacta depèn de la duresa shore — normalment treballem amb TPU 95A, que es nota semblant a una goma dura: prou flexible per doblegar-se i estirar-se, prou ferm per mantenir la forma sota càrrega.\n\nLes seves propietats el fan perfecte per a peces que han d'absorbir impactes, adaptar-se a formes o segellar contra superfícies."
      },
      {
        heading: "Per a què és millor el TPU",
        body: "Imprimim TPU a Barcelona per a:\n\n• Suports de mòbil, tablet i dashcam que han d'agafar sense ratllar.\n• Juntes, segells i volanderes a mida per a aplicacions no crítiques.\n• Mànecs i fundes ergonòmiques.\n• Peces i accessoris wearables.\n• Para-xocs i carcasses protectores.\n• Peces de drons que han d'absorbir vibració.\n• Corretges de rellotge i polseres."
      },
      {
        heading: "Coses a saber sobre la impressió flexible",
        body: "El TPU és més lent d'imprimir que el PLA o el PETG i requereix afinar bé els paràmetres, cosa que el fa una mica més car per peça. Parets molt fines poden quedar massa toves, mentre que parets molt gruixudes esdevenen massa rígides — et suggerim el gruix i farciment que donen la sensació que busques.\n\nEl TPU també resisteix l'abrasió, els olis i molts productes químics, cosa que el fa sorprenentment durador per ser flexible."
      },
      {
        heading: "Demana peces en TPU",
        body: "Envia el teu arxiu STL/STEP o descriu el que necessites. Digues-nos com de flexible vols que es noti la peça — tova i tovota, tipus goma, o ferma però doblegable — i adaptem la geometria. Les peces petites en TPU comencen normalment a 15€."
      }
    ],
    faqs: [
      { q: "Com de flexible és el vostre TPU?", a: "El TPU 95A estàndard es comporta com una goma dura — es doblega i estira però no és tovota. Podem ajustar la sensació canviant gruix de paret i farciment." },
      { q: "Puc imprimir una funda de mòbil a mida en TPU?", a: "Sí, sempre que tinguis o puguis aportar un model 3D de la forma del teu mòbil. També adaptem models existents." },
      { q: "És el TPU bo per a peces d'exterior?", a: "Sí — resisteix bé UV i humitat i manté la flexibilitat en un rang ampli de temperatura." },
      { q: "Per què és el TPU més car que el PLA?", a: "Imprimeix molt més lentament i requereix afinar paràmetres. La diferència sol ser un 30–50% més per peça." },
      { q: "Quina duresa Shore té el vostre filament TPU estàndard?", a: "Treballem principalment amb duresa Shore 95A, que es nota com una goma dura — doblegable i estirable però amb estabilitat estructural sota càrrega. Es poden aconseguir variants més toves (al voltant de 85A) per a aplicacions que necessiten més flexibilitat." },
      { q: "Com de fines poden ser les parets en una impressió flexible de TPU?", a: "Per a impressions flexibles fiables recomanem un gruix mínim de paret de 1,5–3,0 mm segons la flexibilitat desitjada. Les parets molt fines queden massa inestables dimensionalment; les molt gruixudes perden la flexió desitjada." }
    ],
    galleryImages: pick("curved-parts.jpg", "custom-brackets.jpg", "red-adapter.jpg", "black-intake.jpg", "intake-manifold.jpg", "blue-molds.jpg"),
    related: [
      { label: "Impressió PLA", slug: "/ca/impressio-pla-barcelona" },
      { label: "Impressió PETG", slug: "/ca/impressio-petg-barcelona" },
      { label: "Peces Personalitzades", slug: "/ca/peces-personalitzades-3d-barcelona" },
      { label: "Recanvis 3D", slug: "/ca/recanvis-impressio-3d-barcelona" }
    ],
    schemaServiceName: "Impressió TPU Barcelona"
  },
  {
    slug: "/ca/miniatures-3d-barcelona",
    altSlug: "/miniatures-barcelona",
    topic: "miniatures",
    lang: "ca",
    category: "use-case",
    metaTitle: "Miniatures i Figures 3D a Barcelona | Tabletop Gaming",
    metaDescription: "Miniatures i figures impreses en 3D a Barcelona per a jocs de taula, col·leccionisme i dioràmies. Alt detall, llestes per pintar. Encàrrecs a mida.",
    h1: "Miniatures i Figures 3D a Barcelona",
    intro: "Des d'exèrcits de tabletop fins a figures de col·leccionista i dioràmies detallades, les miniatures són una de les nostres categories preferides. Dimension3D imprimeix miniatures 3D d'alt detall a Barcelona per a aficionats, jugadors i col·leccionistes.",
    sections: [
      {
        heading: "Què imprimim per al món del hobby",
        body: "Encàrrecs habituals de miniatures a Barcelona:\n\n• Exèrcits i esquadres de wargame (escales 28mm, 32mm, 54mm).\n• Personatges i monstres de rol.\n• Figures d'exhibició de pel·lícules, sèries, anime i videojocs.\n• Miniatures a mida dissenyades a partir del teu concepte o esbós.\n• Peces d'escenografia, terreny i masmorres modulars.\n• Dioràmies amb diverses figures i efectes.\n• Recanvis per a jocs de taula i figures trencades."
      },
      {
        heading: "Alt detall, llestes per pintar",
        body: "Tot i que treballem principalment amb tecnologia FDM, un laminat acurat, alçades de capa fines i els materials adequats ens permeten produir miniatures amb el nivell de detall que esperen els col·leccionistes. Orientem les peces per minimitzar línies de capa visibles a cares i superfícies importants, i recomanem el material segons el tipus de pintura i acabat que pensis donar.\n\nSi un projecte requereix realment detall de resina, t'ho diem des del principi — no venem al FDM el que no pot donar."
      },
      {
        heading: "Miniatures a mida des del teu concepte",
        body: "Tens una idea de personatge, una mascota familiar, el logotip del teu grup convertit en figura, o un regal personalitzat al cap? Envia'ns referències — esbossos, fotos, descripcions — i podem imprimir un model 3D que tu aportis o pressupostar el disseny 3D a mida abans d'imprimir-lo.\n\nProduïm habitualment figures úniques a mida com a regals personalitzats: comiats, jubilacions, mascotes de grups de joc, mascotes de marca."
      },
      {
        heading: "Demana miniatures a Barcelona",
        body: "Explica'ns què vols imprimir — arxiu, escala i quantitat — i et pressupostem en menys d'una hora en horari laboral. Empaquetem amb cura per a recollida local a Barcelona o enviament a tota l'Espanya peninsular amb seguiment."
      }
    ],
    faqs: [
      { q: "Realment pot el FDM imprimir miniatures detallades?", a: "Sí, amb l'orientació correcta i alçades de capa fines. Per a detall extrem (ulls, parts molt fines) et diem honestament els límits del FDM abans de pressupostar." },
      { q: "Quines escales imprimiu?", a: "Les escales més comunes de tabletop (28mm, 32mm, 54mm) i escales més grans per a exhibició. Envia el teu arxiu o indica l'escala i ho confirmem." },
      { q: "Lliureu miniatures imprimades o pintades?", a: "Per defecte lliurem impressions netes llestes per pintar. Si vols miniatures pintades, demana'ns pressupost separat per la pintura." },
      { q: "Podeu dissenyar una miniatura a partir d'una foto?", a: "Sí, pressupostem el disseny 3D a mida des de fotos o referències i després imprimim el resultat." },
      { q: "Quina alçada de capa feu servir per a miniatures d'alt detall?", a: "Per a miniatures d'exhibició fem servir típicament 0,10–0,12 mm d'alçada de capa, que capta detall superficial fi mantenint temps d'impressió pràctics. Per a figures molt petites o detall extrem podem arribar a 0,08 mm." },
      { q: "Es veuran les marques de suport a la miniatura acabada?", a: "Orientem les peces acuradament per col·locar els punts de contacte del suport en zones no visibles — parts inferiors, superfícies posteriors, bases. Algunes marques són inherents a la FDM; establim expectatives realistes per model abans que aproveu la impressió." }
    ],
    galleryImages: pick("purple-figures.jpg", "lion-king-figures.jpg", "lion-king-scene.jpg", "stranger-things-diorama.jpg", "stranger-things-lit.jpg", "halloween-set.jpg"),
    related: [
      { label: "Impressió PLA", slug: "/ca/impressio-pla-barcelona" },
      { label: "Peces Personalitzades", slug: "/ca/peces-personalitzades-3d-barcelona" },
      { label: "Servei d'Impressió 3D", slug: "/ca/impressio-3d-barcelona" },
      { label: "Preus", slug: "/ca/preu-impressio-3d-barcelona" }
    ],
    schemaServiceName: "Miniatures 3D Barcelona"
  },

  // ----- NOVA: EMPRESES -----
  {
    slug: "/ca/impressio-3d-empreses-barcelona",
    topic: "business",
    altSlug: "/3d-printing-for-business-barcelona",
    lang: "ca",
    category: "use-case",
    metaTitle: "Impressió 3D per a Empreses a Barcelona — Peces Tècniques i Tirades Curtes | Dimension3D",
    metaDescription: "Impressió 3D professional per a empreses i enginyers a Barcelona. Envia el teu arxiu STL/STEP — pressupost en 1 hora. Peces funcionals i tècniques, utillatge, tirades curtes. NDA disponible.",
    h1: "Impressió 3D per a Empreses a Barcelona",
    intro: "Dimension3D treballa amb equips d'enginyeria, departaments de R+D, tallers i petits fabricants a Barcelona que necessiten peces 3D funcionals sense els temps i la burocràcia d'un proveïdor industrial. Envia el teu arxiu — STL, STEP o IGES — i rep pressupost professional en menys d'una hora. Sense compte, sense concurs, sense volum mínim.",
    sections: [
      {
        heading: "Què produïm per a clients empresa",
        body: "Els nostres clients empresa ens fan servir per a una àmplia gamma d'aplicacions tècniques i industrials:\n\n• Utillatge, jigs, fixtures i eines de fi de braç per a línies de producció.\n• Prototips funcionals per a validació i presentacions a clients.\n• Carcasses i caixes per a electrònica i PCBs.\n• Peces de recanvi i components de desgast per a maquinària.\n• Tirades curtes de producció de 5 a 200 peces idèntiques.\n• Suports de muntatge, guies de cable i maquinari per a rack.\n\nTreballem en PETG, ABS/ASA, Nylon i Nylon-CF per a aplicacions estructurals, i en PLA o PETG per a peces funcionals de baixa càrrega. Si la teva aplicació requereix un material o tolerància específics, digues-ho des del principi."
      },
      {
        heading: "STL, STEP i IGES acceptats — pressupost professional en 1 hora",
        body: "Envia'ns el teu arxiu pel formulari de pujada o directament per WhatsApp. Treballem amb tots els formats CAD estàndard: STL, STEP, IGES, OBJ i 3MF. Si fas servir SolidWorks, Fusion 360, Onshape, CATIA o FreeCAD, exporta en qualsevol d'aquests formats.\n\nRevisem cada arxiu manualment abans de pressupostar — comprovant gruix de paret, necessitat de suports, orientació i idoneïtat del material — per tal que el pressupost reflecteixi el cost real i el termini real, no una estimació automàtica. Rebràs un preu detallat en menys de 60 minuts en horari laboral."
      },
      {
        heading: "Tirades curtes i comandes repetides",
        body: "Un cop la peça és validada, podem gestionar comandes repetides sense tornar a pressupostar des de zero. Conservem l'arxiu laminat i els paràmetres d'impressió. Per a quantitats de 5–200 peces, el cost unitari baixa amb el volum — demana preu per trams en sol·licitar el pressupost.\n\nTambé podem lliurar al teu taller o oficina de Barcelona per missatgeria, o enviar a qualsevol adreça de l'Espanya peninsular amb seguiment."
      },
      {
        heading: "Confidencialitat i NDA",
        body: "Signem NDA per a qualsevol projecte que ho requereixi. La confidencialitat és pràctica habitual per a nosaltres — mai compartim arxius, dissenys ni detalls de projectes de clients. Si el teu departament de R+D o equip d'enginyeria necessita discreció, ho gestionem com a punt de partida, no com a excepció."
      }
    ],
    faqs: [
      { q: "Signeu NDA per a projectes d'empresa?", a: "Sí. Signem NDA per a qualsevol client que ho sol·liciti. Mai compartim arxius ni detalls de projectes de clients." },
      { q: "Quins formats d'arxiu accepteu?", a: "STL, STEP, IGES, OBJ i 3MF. Exportacions natives de SolidWorks, Fusion 360, Onshape i la majoria d'eines funcionen directament." },
      { q: "Podeu subministrar 50 o 100 peces idèntiques?", a: "Sí. Fem tirades curtes de producció de 5 a 200 unitats. El preu unitari baixa amb la quantitat — demana pressupost per trams." },
      { q: "Quines toleràncies podeu mantenir?", a: "La precisió FDM típica és ±0,2 mm. Per a característiques de tolerància més ajustada ajustem paràmetres i podem post-processar superfícies crítiques. Indica'ns el requisit des del principi." },
      { q: "Emeteu factures completes amb IVA per a comandes d'empresa?", a: "Sí. Emetem factures completes amb IVA per a tots els clients empresa. Facilita'ns el nom de la teva empresa i el CIF/NIF en fer la comanda." },
      { q: "Quin és el termini típic per a una tirada de 50–100 peces?", a: "Per a la majoria de peces de mida estàndard, entre 5 i 10 dies laborables segons la mida i el material. Per a necessitats urgents de tirada, contacta'ns per parlar de planificació prioritària — et direm amb honestedat què és assolible." }
    ],
    galleryImages: pick("intake-manifold.jpg", "black-intake.jpg", "custom-brackets.jpg", "blue-molds.jpg", "curved-parts.jpg", "red-adapter.jpg"),
    related: [
      { label: "Prototips 3D", slug: "/ca/prototips-3d-barcelona" },
      { label: "Prototipatge Ràpid", slug: "/ca/prototipatge-rapid-barcelona" },
      { label: "Peces Funcionals", slug: "/ca/peces-funcionals-barcelona" },
      { label: "Impressió Urgent", slug: "/ca/impressio-3d-urgent-barcelona" }
    ],
    schemaServiceName: "Impressió 3D per a Empreses Barcelona"
  },

  // ----- NOVA: PROTOTIPATGE RÀPID -----
  {
    slug: "/ca/prototipatge-rapid-barcelona",
    topic: "rapid-prototyping",
    altSlug: "/rapid-prototyping-barcelona",
    lang: "ca",
    category: "use-case",
    metaTitle: "Prototipatge Ràpid Barcelona — Cicle 24–72h, STL/STEP Acceptat | Dimension3D",
    metaDescription: "Prototipatge ràpid a Barcelona per a enginyers i startups. Envia el teu arxiu STL o STEP — prototip funcional en 24–72 hores. Itera ràpid. PETG, Nylon, ABS. NDA disponible.",
    h1: "Prototipatge Ràpid a Barcelona — Lliurament en 24–72h",
    intro: "La iteració ràpida és la base del desenvolupament de maquinari. Dimension3D ofereix prototipatge ràpid a Barcelona amb un termini típic de 24–72 hores des d'arxiu fins a peça en mà — perquè la teva propera revisió de disseny arribi abans que la competència acabi la seva primera sol·licitud de pressupost.",
    sections: [
      {
        heading: "24–72h de STL o STEP a peça funcional",
        body: "En acabar la teva revisió CAD, envia-la. Acceptem STL, STEP i IGES de qualsevol eina de modelatge — SolidWorks, Fusion 360, Onshape, Rhino, FreeCAD, CATIA. Sense conversió, sense reformateig.\n\nRevisem cada arxiu manualment abans de confirmar el termini. Si la geometria té un problema de suports o un gruix de paret que afectarà la funció, ho assenyalem al pressupost en lloc d'imprimir una peça defectuosa i fer-te esperar altres 48 hores."
      },
      {
        heading: "Material adaptat a la fase d'iteració",
        body: "Seleccionem el material d'impressió en funció del que el prototip ha de demostrar, no el que és més barat:\n\n• PLA — verificacions de forma i ajust, models de concepte en fase primerenca.\n• PETG — càrrega moderada i exposició exterior, primera validació funcional.\n• ABS/ASA — peces resistents a la calor, prototips per a automoció i carcasses.\n• Nylon / Nylon-CF — peces mecàniques d'alta càrrega, més properes a les propietats del plàstic injectat.\n• TPU — cobertes flexibles, juntes, estanquitats.\n\nEscollir el material equivocat malbarata un cicle d'iteració complet. Al pressupost et recomanem el correcte."
      },
      {
        heading: "Iteracions sense fricció",
        body: "Cada arxiu revisat passa pel mateix cicle de revisió al dia i producció en 24–72h. Sense subscripció, sense comanda mínima per iteració i sense burocràcia — puges, revisem, pressupostem, aproves, imprimim. Per a clients que iteraren amb freqüència conservem el teu projecte en arxiu i podem rebre revisions per WhatsApp directament."
      },
      {
        heading: "Del prototip a la tirada curta de producció",
        body: "Un cop el disseny és tancat, podem passar sense costures a tirades curtes de producció (5–200 unitats) sense canviar de proveïdor ni renegociar condicions. Conservem els paràmetres d'impressió validats i podem programar una tirada amb poc marge de preavís."
      }
    ],
    faqs: [
      { q: "Quant tarda una iteració de prototipatge?", a: "Normalment entre 24 i 72 hores des de l'enviament de l'arxiu fins a la peça en mà, segons mida, material i cua actual." },
      { q: "Quins formats CAD accepteu?", a: "STL, STEP, IGES, OBJ i 3MF. Exportacions de SolidWorks, Fusion 360, Onshape, Rhino, FreeCAD i la majoria d'eines funcionen sense conversió." },
      { q: "Detecteu problemes de disseny abans d'imprimir?", a: "Sí. Revisem cada arxiu manualment i assenyalem problemes de gruix de paret, suports o material abans d'imprimir." },
      { q: "Podeu fer una tirada petita de producció després del prototip?", a: "Sí. Passem del prototip a la tirada curta (5–200 unitats) sense canviar de proveïdor ni re-establir condicions." },
      { q: "En què es diferencia això del vostre servei estàndard de prototips?", a: "El prototipatge ràpid està configurat específicament per a cicles d'iteració múltiple ràpids. Guardem el teu projecte entre iteracions, acceptem arxius de revisió directament per WhatsApp i prioritzem el termini de 24–72h sense tornar a pressupostar des de zero cada vegada." },
      { q: "Puc fer diverses revisions de disseny en la mateixa setmana?", a: "Sí — és tot el punt. Cada arxiu revisat passa pel mateix cicle de revisió al dia i producció en 24–72h. Els iteradors freqüents comparteixen arxius directament per WhatsApp i els lliurem sense demora administrativa." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "black-intake.jpg", "red-adapter.jpg", "blue-molds.jpg", "curved-parts.jpg"),
    related: [
      { label: "Impressió 3D per a Empreses", slug: "/ca/impressio-3d-empreses-barcelona" },
      { label: "Peces Funcionals", slug: "/ca/peces-funcionals-barcelona" },
      { label: "Impressió 3D Urgent", slug: "/ca/impressio-3d-urgent-barcelona" },
      { label: "Preus", slug: "/ca/preu-impressio-3d-barcelona" }
    ],
    schemaServiceName: "Prototipatge Ràpid Barcelona"
  },

  // ----- NOVA: PECES FUNCIONALS -----
  {
    slug: "/ca/peces-funcionals-barcelona",
    topic: "functional-parts",
    altSlug: "/functional-parts-barcelona",
    lang: "ca",
    category: "use-case",
    metaTitle: "Peces Funcionals 3D Barcelona — PETG, Nylon, ABS Sota Demanda | Dimension3D",
    metaDescription: "Peces funcionals 3D a Barcelona en PETG, ABS, Nylon i TPU. Components estructurals, utillatge, peces d'ús final. Envia el teu STL/STEP — pressupost en 1 hora.",
    h1: "Peces Funcionals 3D a Barcelona — Sota Demanda",
    intro: "No tota impressió 3D és decorativa. Dimension3D està especialitzat en peces funcionals impreses en 3D a Barcelona — components que carreguen, flexionen, segellen, munten, protegeixen o substitueixen alguna cosa en el món real. Seleccionem el material, el gruix de paret i el farciment correctes per al que la peça ha de fer.",
    sections: [
      {
        heading: "Què fa realment funcional una peça",
        body: "Una peça funcional ha de sobreviure al seu entorn i complir la seva comesa sense fallar. Això significa:\n\n• Escollir el polímer adequat — PETG per a peces funcionals generals i d'exterior, ABS/ASA per a resistència a la calor i productes químics, Nylon per a càrregues mecàniques altes, Nylon-CF per a màxima rigidesa, TPU per a aplicacions flexibles o d'estanquitat.\n• Configurar la densitat de farciment correcta — 20–40% per a càrregues moderades, 60–80% per a peces estructurals, 100% sòlid per a contactes portants.\n• Orientar la peça en la direcció de càrrega dominant — l'adherència entre capes és sempre l'eix feble en FDM.\n\nPrenem les tres decisions per tu en la fase de pressupost. Si una geometria no sobreviurà a l'aplicació en FDM, t'ho diem abans d'imprimir-la."
      },
      {
        heading: "Categories habituals de peces funcionals",
        body: "Treballs típics d'impressió funcional a Barcelona:\n\n• Jigs, fixtures i guies per a línies de producció.\n• Carcasses i caixes per a electrònica, sensors i PCBs.\n• Peces de recanvi i reparació per a electrodomèstics, vehicles i equips.\n• Suports de muntatge, guies de cable i maquinari per a rack.\n• Utillatge a mida i pinces de fi de braç.\n• Suports estructurals per a mobles, prestatges i estructures d'exterior.\n• Prototips funcionals per a validació mecànica.\n\nSi una peça té una feina real a fer, la tractem com a tal."
      },
      {
        heading: "Guia de materials per a impressió funcional",
        body: "Selecció de materials per a peces funcionals:\n\n• PETG — el més versàtil per a peces funcionals, d'exterior i en contacte amb aigua. Fàcil d'imprimir, robust, resistent a UV i humitat.\n• ABS/ASA — per a peces que s'escalfen (automoció, electrodomèstics prop de fonts de calor) o que afronten UV exterior a llarg termini.\n• Nylon PA12 — alta resistència a la tracció, baixa fricció, bo per a engranatges, casquets i peces d'alt desgast.\n• Nylon-CF — l'opció FDM més rígida, s'acosta a l'alumini en rigidesa per pes per a suports estructurals.\n• TPU 95A — per a peces flexibles: juntes, mànecs, topes, estanquitats.\n\nAl pressupost et recomanem el material adequat per a la teva aplicació."
      },
      {
        heading: "D'una peça a una tirada curta",
        body: "Sense comanda mínima. Imprimim peces funcionals individuals amb la mateixa facilitat que un lot de 50. Per a comandes repetides, conservem l'arxiu i els paràmetres per tal que les recomandes es gestionen en minuts. Per a quantitats de 5–200, demana preu per trams — el cost unitari baixa amb el volum."
      }
    ],
    faqs: [
      { q: "Quin material és millor per a peces funcionals amb càrrega?", a: "Nylon PA12 o Nylon-CF per a màxima resistència mecànica. PETG per a càrregues moderades amb exposició exterior o a l'aigua. Al pressupost especifiquem el correcte." },
      { q: "Quant resisteix una peça en PETG comparada amb plàstic injectat?", a: "Una peça PETG ben impresa al 60%+ de farciment és sovint comparable al PP o ABS injectat per a càrregues estructurals moderades, però anisòtropa — més resistent en el pla d'impressió que entre capes." },
      { q: "Podeu imprimir peces funcionals amb toleràncies ajustades?", a: "La FDM típica manté ±0,2 mm. Per a superfícies d'acoblament crítiques ajustem paràmetres i podem post-mecanitzar si calen toleràncies més ajustades." },
      { q: "Reviseu els arxius abans d'imprimir?", a: "Sí. Revisem cada arxiu manualment. Si hi ha un problema — parets fines, orientació inadequada per a la direcció de càrrega, suport insuficient — ho assenyalem abans d'imprimir." },
      { q: "Quina densitat de farciment feu servir per a peces estructurals amb càrrega?", a: "Per a càrregues estructurals moderades fem servir 40–60% de farciment. Per a alta càrrega o superfícies de contacte portant fem servir 80–100% sòlid. Especifiquem el farciment a cada pressupost perquè sàpigues exactament el que reps." },
      { q: "Quin postprocessat està disponible per a peces funcionals?", a: "Inserts roscats de calor (M3, M4, M5) per a connexions amb cargol, suavitzat per vapor d'acetona en ABS per a millor segell superficial, i roscat manual o llimar lleugerament superfícies d'acoblament crítiques. Sol·licita qualsevol postprocessat en enviar el pressupost." }
    ],
    galleryImages: pick("intake-manifold.jpg", "black-intake.jpg", "custom-brackets.jpg", "curved-parts.jpg", "blue-molds.jpg", "red-adapter.jpg"),
    related: [
      { label: "Impressió 3D per a Empreses", slug: "/ca/impressio-3d-empreses-barcelona" },
      { label: "Prototipatge Ràpid", slug: "/ca/prototipatge-rapid-barcelona" },
      { label: "Impressió PETG", slug: "/ca/impressio-petg-barcelona" },
      { label: "Recanvis 3D", slug: "/ca/recanvis-impressio-3d-barcelona" }
    ],
    schemaServiceName: "Peces Funcionals 3D Barcelona"
  }
];
