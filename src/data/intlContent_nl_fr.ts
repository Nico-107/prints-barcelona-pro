// NL + FR international hub, city, and guide content for Dimension3D
import type { IntlHubContent, IntlCityContent, IntlGuideContent } from "@/data/intlTypes";

// ─── NL HUB ────────────────────────────────────────────────────────────────────

export const nlHub: IntlHubContent = {
  slug: "/nl/3d-printen-laten-maken",
  lang: "nl",
  locale: "nl-NL",
  countryCode: "NL",
  metaTitle: "3D Printen Laten Maken | Bestel Online vanuit Nederland | Dimension3D",
  metaDescription: "3D printen laten maken vanuit Nederland? Dimension3D stuurt je print vanuit Barcelona. Offerte binnen 1 uur, verzending € 5,90 vlak, geen douane binnen de EU. Minimumbestelling € 10.",
  eyebrow: "3D printservice voor Nederland",
  h1: "3D Printen Laten Maken — Bestel Online, Geleverd in Nederland",
  promise: "Offerte binnen 1 uur op werkdagen (Spaanse tijd). Geen opstartkosten. Verzending € 5,90. Minimumbestelling € 10.",
  howItWorks: `Hoe werkt het? Je stuurt je 3D-bestand op — STL, OBJ, 3MF of STEP — via het formulier of WhatsApp. Op werkdagen reageren we in de regel binnen 1 uur met een exacte prijs. Bij bestellingen tot € 100 kun je ook meteen een automatische prijsindicatie krijgen. Keur je de offerte goed, dan gaan we aan de slag in ons atelier in Barcelona. Je pakket gaat dezelfde dag of de volgende werkdag op de bus en komt in de regel binnen 3–5 werkdagen in Nederland aan. Alles speelt zich af binnen de EU — geen douaneformaliteiten, geen extra heffingen.`,
  whatWePrint: `Wat kun je laten printen? De toepassingen zijn breed: reserveonderdelen voor apparaten of machines die niet meer leverbaar zijn, functionele prototypes voor product­ontwikkeling, behuizingen en adapters voor elektronica, technische brackets voor industrie of hobbyprojecten, maquettes en schaalmodellen, en decoratieve of persoonlijke objecten. FDM-printen is bijzonder geschikt voor onderdelen die mechanisch belast worden, buiten gebruikt worden of warmtebestendig moeten zijn. Twijfel je of jouw idee printbaar is? Stuur een foto of beschrijving via WhatsApp — we denken gratis mee.`,
  materialsText: `We printen in PLA, PETG, ABS, ASA, TPU (flexibel), Nylon (PA12/PA6) en koolstofvezel-composieten. PLA is de meest toegankelijke keuze: scherp geprijsd, mooie afwerking en geschikt voor de meeste binnenhuistoepassingen. PETG biedt extra sterkte en vochtbestendigheid — ideaal voor functionele onderdelen. ABS en ASA zijn warmtebestendig tot circa 90–100 °C en bestand tegen UV; perfect voor auto-onderdelen of buitenapplicaties. Nylon wordt gekozen als maximale sterkte en slijtvastheid vereist zijn. Onze Bambu Lab X2D heeft een gesloten, verwarmde kamer — dat garandeert stabiele printcondities voor alle materialen, ook voor de technisch veeleisende soorten.`,
  fileFormatsText: `We accepteren STL, OBJ, 3MF en STEP. Directe exports vanuit Fusion 360, SolidWorks, Onshape, FreeCAD en de meeste andere CAD-pakketten werken zonder conversie. Heb je alleen een tekening, foto of kapot onderdeel? Stuur het op — we bespreken de opties.`,
  faqs: [
    {
      q: "Wat is de minimumbestelling?",
      a: "De minimumbestelling is € 10. De meeste kleine losse onderdelen kosten tussen € 10 en € 40. Er is geen minimale afnamehoeveelheid — we printen net zo graag één stuk als een serie van vijftig.",
    },
    {
      q: "Hoe snel krijg ik mijn offerte?",
      a: "Op werkdagen reageren we in de regel binnen 1 uur (Spaanse kantoortijd). Voor bestellingen tot € 100 is er ook een directe prijsindicatie via de online calculator.",
    },
    {
      q: "Zijn er invoerrechten of douanekosten?",
      a: "Nee. Spanje en Nederland zijn beide lid van de EU-interne markt. Er zijn geen douaneformaliteiten of extra heffingen op zendingen tussen beide landen.",
    },
    {
      q: "Hoe lang duurt de levering naar Nederland?",
      a: "In de regel 3–5 werkdagen vanaf bevestiging. Alle zendingen worden met tracking verstuurd.",
    },
    {
      q: "Wat zijn de verzendkosten?",
      a: "Vaste verzendprijs van € 5,90 naar Nederland, ongeacht het gewicht van je bestelling.",
    },
    {
      q: "Welk bestandsformaat moet ik aanleveren?",
      a: "STL, OBJ, 3MF en STEP worden allemaal geaccepteerd. Heb je alleen een tekening of foto? Neem dan contact op via WhatsApp.",
    },
    {
      q: "Kan ik een specifiek materiaal of kleur opgeven?",
      a: "Ja. Bij je bestelling geef je het gewenste materiaal en de kleur op. Als je het niet zeker weet, omschrijf dan het gebruik van het onderdeel — dan raden we zelf de beste keuze aan.",
    },
    {
      q: "Is er een opstartkosten of bestandscontrolekosten?",
      a: "Nee. Er zijn geen opstartkosten en geen kosten voor het nalopen van je bestand. Je betaalt alleen voor het printen zelf en de verzending.",
    },
  ],
  whatsappMsg: "Hallo, ik wil graag een 3D-print laten maken via Dimension3D.",
  priceTableCaption: "Voorbeeldprijzen zijn indicatief en afhankelijk van materiaal, gewicht en printtijd. Minimumbestelling € 10.",
  breadcrumbHub: "3D Printen Laten Maken",
  cityLinks: [
    { to: "/nl/3d-printen-amsterdam", label: "3D Printen Amsterdam" },
    { to: "/nl/3d-printen-rotterdam", label: "3D Printen Rotterdam" },
    { to: "/nl/3d-printen-eindhoven", label: "3D Printen Eindhoven" },
  ],
  guideLinks: [
    { to: "/nl/3d-printen-kosten", label: "Wat kost 3D printen?" },
    { to: "/nl/3d-printbestand-voorbereiden", label: "Bestand voorbereiden" },
    { to: "/nl/3d-print-materialen", label: "Materialen vergelijken" },
  ],
};

// ─── NL CITIES ─────────────────────────────────────────────────────────────────

export const nlAmsterdam: IntlCityContent = {
  slug: "/nl/3d-printen-amsterdam",
  altSlug: "/3d-printing-delivery-amsterdam",
  lang: "nl",
  locale: "nl-NL",
  countryCode: "NL",
  city: "Amsterdam",
  metaTitle: "3D Printen Amsterdam — Bestellen & Geleverd in 3–5 Werkdagen | Dimension3D",
  metaDescription: "3D print service voor Amsterdam. Offerte binnen 1 uur, verzending € 5,90 vlak, in de regel 3–5 werkdagen levering. Geen douane binnen de EU. Minimumbestelling € 10.",
  eyebrow: "3D printservice voor Amsterdam",
  h1: "3D Printen Amsterdam — Bestel Online, Geleverd aan Huis",
  deliveryNote: "In de regel 3–5 werkdagen vanuit Barcelona naar Amsterdam. Vaste verzending € 5,90. Geen douane (EU interne markt).",
  introText: `Amsterdam heeft zich de afgelopen jaren ontwikkeld tot een van de meest dynamische technologie- en makerssteden van Europa. De stad wordt wel de Silicon Canal van Nederland genoemd — een verwijzing naar de dichtheid aan hardware-startups, creatieve technologiebedrijven en productontwikkelaars die zich langs de Amsterdamse grachten en in de haven­regio hebben gevestigd. Die bijnaam is niet overdreven: van Westpoort tot de Zuidas en het NDSM-werf bevindt zich een ecosysteem van makers, ontwerpers en ingenieurs die regelmatig op zoek zijn naar snelle, toegankelijke productieoplossingen voor prototypen, reserveonderdelen of eenmalige technische componenten.

In dat ecosysteem past 3D-printen uitstekend. Een hardware-startup die een eerste functioneel prototype wil valideren voordat ze naar een verspanend bedrijf stappen, een productdesigner die het juiste scharniermechanisme wil testen, een theatre­maker op het NDSM-werf die een unieke rekwisiet nodig heeft: voor al deze toepassingen biedt on-demand FDM-printen een kosteneffectieve en snelle oplossing die kleine series of enkelstuks net zo goed beheert als grotere batches.

Amsterdam heeft ook een sterke band met de bredere kennisinfrastructuur van Nederland. TU Delft, hoewel in Delft gevestigd, levert jaarlijks honderden afgestudeerde ingenieurs en ontwerpers die in Amsterdam terechtkomen en gewend zijn te werken met digitale ontwerphulpmiddelen en fabricageprocessen. De invloed van ASML — 's werelds dominante leverancier van chipmachines, met zijn hoofdkantoor in Eindhoven maar tentakels door heel Nederland — is ook in Amsterdam merkbaar: toeleveranciers en spin-offs die nauw samenwerken met de Eindhovense hightech­maakindustrie hebben vestigingen of relaties in Amsterdam. Dat schept een voedingsbodem voor bedrijven die kleine, precisie onderdelen snel nodig hebben zonder de minimumafnames van traditionele machinefabrieken.

Het NEMO Science Museum aan het IJ heeft bovendien al jaren een actieve makercultuur: jaarlijkse makerfestivals, educatieve workshops over digitale fabricage en een breed publiek dat vertrouwd is geraakt met 3D-printen als toegankelijke technologie. Die cultuur verspreidt zich: van hobbyprogrammeurs in de Jordan tot engineers in de startupkantoren rondom het Centraal Station.

Voor Amsterdammers die iets willen laten 3D-printen biedt Dimension3D een eenvoudige route. Je stuurt je bestand — STL, OBJ, 3MF of STEP — via het online formulier of WhatsApp. Op werkdagen ontvang je in de regel binnen 1 uur een exacte offerte (Spaanse kantoortijd). Er zijn geen opstartkosten en geen kosten voor de bestandscontrole. De minimumbestelling is € 10. Verzending van Barcelona naar Amsterdam kost € 5,90 en is altijd inclusief tracking. Omdat zowel Spanje als Nederland deel uitmaken van de EU interne markt, zijn er geen douaneformaliteiten of extra invoerheffingen — je bestelling wordt behandeld alsof het een binnenlandse zending is.

De levering duurt in de regel 3–5 werkdagen. Is het dringend? Vraag bij je bestelling om expresslevering — we bespreken dan wat haalbaar is. We printen in PLA, PETG, ABS, ASA, TPU, Nylon en koolstofvezel-composieten, op een Bambu Lab X2D met gesloten, verwarmde kamer voor stabiele printomstandigheden.

Of je nu een prototype maakt voor een Amsterdamse hardwarestartup, een onderdeel zoekt dat niet meer leverbaar is, of gewoon iets unieks wilt laten maken: stuur je bestand of omschrijving op en we nemen contact met je op.`,
  faqs: [
    {
      q: "Hoe lang duurt levering vanuit Barcelona naar Amsterdam?",
      a: "In de regel 3–5 werkdagen. Alle zendingen zijn voorzien van tracking.",
    },
    {
      q: "Betaal ik invoerrechten of douanekosten?",
      a: "Nee — Spanje en Nederland zitten allebei in de EU interne markt. Er zijn geen douaneformaliteiten.",
    },
    {
      q: "Kan ik een enkelstuks laten printen?",
      a: "Ja. Er is geen minimale hoeveelheid. Je kunt één onderdeel bestellen. Minimumbestelling is € 10.",
    },
    {
      q: "Welke materialen zijn beschikbaar?",
      a: "PLA, PETG, ABS, ASA, TPU, Nylon (PA12/PA6) en koolstofvezel-composieten. Weet je niet welk materiaal het beste past? Omschrijf het gebruik — we adviseren gratis.",
    },
    {
      q: "Hoe vraag ik een offerte aan?",
      a: "Upload je bestand via het formulier op de site, of stuur het via WhatsApp. Op werkdagen reageren we in de regel binnen 1 uur.",
    },
  ],
  whatsappMsg: "Hallo, ik wil graag iets laten 3D-printen met levering in Amsterdam.",
  hubLink: { to: "/nl/3d-printen-laten-maken", label: "Alle 3D printdiensten NL" },
  siblingLinks: [
    { to: "/nl/3d-printen-rotterdam", label: "3D Printen Rotterdam" },
    { to: "/nl/3d-printen-eindhoven", label: "3D Printen Eindhoven" },
  ],
  guideLinks: [
    { to: "/nl/3d-printen-kosten", label: "Wat kost 3D printen?" },
    { to: "/nl/3d-printbestand-voorbereiden", label: "Bestand voorbereiden" },
    { to: "/nl/3d-print-materialen", label: "Materialen vergelijken" },
  ],
};

export const nlRotterdam: IntlCityContent = {
  slug: "/nl/3d-printen-rotterdam",
  lang: "nl",
  locale: "nl-NL",
  countryCode: "NL",
  city: "Rotterdam",
  metaTitle: "3D Printen Rotterdam — Bestel Online, Levering 3–5 Werkdagen | Dimension3D",
  metaDescription: "3D printservice voor Rotterdam. Offerte binnen 1 uur, vaste verzending € 5,90, in de regel 3–5 werkdagen levering. Geen douane (EU). Minimumbestelling € 10.",
  eyebrow: "3D printservice voor Rotterdam",
  h1: "3D Printen Rotterdam — Bestel Online, Geleverd aan Huis",
  deliveryNote: "In de regel 3–5 werkdagen vanuit Barcelona naar Rotterdam. Vaste verzending € 5,90. Geen douane (EU interne markt).",
  introText: `Rotterdam is in veel opzichten een ingenieursstad. De haven — de grootste van Europa — is het kloppend hart van een logistiek en industrieel ecosysteem dat zich uitstrekt van de petrochemie in Botlek tot de maritieme dienstverlening in de Waalhaven en de hightech maakindustrie langs de A15-corridor. Wie in Rotterdam werkt aan technische vraagstukken, denkt van nature in onderdelen, toleranties en materiaaleigenschappen.

Dat maakt Rotterdam tot een uitstekende markt voor on-demand 3D-printen. In de maritieme en havengerelateerde sector duiken regelmatig situaties op waarbij een specifiek onderdeel niet meer leverbaar is of waarvan de levertijd van de originele fabrikant te lang is. Een vervangend klem, een afdichtingsstuk, een behuizing voor een sensor op een schip dat binnen twee dagen weer moet uitvaren: dit soort acute behoefte past precies bij wat FDM-printen kan bieden. Het gaat dan niet om massaproductie maar om het snel en betaalbaar oplossen van een specifiek probleem.

Erasmus MC, een van de grootste universitaire medische centra van Europa en ook de naam van het academisch ziekenhuis in Rotterdam, trekt een brede medisch-technische gemeenschap aan. Rond medische technologie in de proeffase — denk aan ergonomische hulpmiddelen, anatomische modellen voor chirurgische training of behuizingen voor meetapparatuur — is er regelmatig behoefte aan kleine series of prototypes die snel en kosteneffectief gemaakt kunnen worden. 3D-printen is in dat domein al lang geen curiositeit meer; het is een standaard ontwikkeltool. Dimension3D bedient dit segment met een directe, persoonlijke aanpak: je stuurt je bestand, we kijken naar het design, en je krijgt een realistische prijs en levertijd.

Rotterdam Make, de makerspace in de stad, vertegenwoordigt een ander type gebruiker: de hobbyist, de creatieve maker, de kleine ondernemer die een idee wil uitproberen zonder te investeren in eigen apparatuur. Makerspaces introduceren mensen bij digitale fabricage, maar hebben zelf niet altijd de capaciteit of de materiaalbreedte om elke bestelling aan te nemen. Dimension3D fungeert dan als verlengstuk: bestellingen die de makerspace niet kan of wil aannemen, komen terecht bij een professioneel atelier dat wel alle materialen in huis heeft.

De maritieme toeleveringsketen rond Rotterdam kent ook een cultuur van op maat gemaakte small-batch productie. Veel bedrijven die schepen, offshore platforms of industriële installaties onderhouden, werken met oudere apparatuur waarvoor originele onderdelen niet meer beschikbaar zijn of onacceptabel lang op zich laten wachten. FDM-printen in materialen als PETG, ABS of Nylon kan dan een interim-oplossing bieden die functioneel volwaardig is voor een tijdelijke fix of een vervanging die lang genoeg moet meegaan totdat het origineel gearriveerd is.

Voor Rotterdammers die iets willen laten printen werkt het als volgt. Je stuurt je bestand op via het online formulier of WhatsApp — STL, OBJ, 3MF of STEP. Op werkdagen reageren we in de regel binnen 1 uur met een offerte (Spaanse kantoortijd). Er zijn geen opstartkosten. De minimumbestelling is € 10. Vaste verzending van € 5,90 naar Rotterdam. Omdat beide landen deel uitmaken van de EU interne markt, zijn er geen douane­formaliteiten. Levering in de regel binnen 3–5 werkdagen.

We printen op een Bambu Lab X2D, een gesloten printer met verwarmde kamer. Dat geeft ons stabiele printcondities voor alle materialen, van gewoon PLA tot technisch veeleisend Nylon en koolstofvezel-composieten.`,
  faqs: [
    {
      q: "Hoe lang duurt levering naar Rotterdam?",
      a: "In de regel 3–5 werkdagen vanuit Barcelona. Zendingen zijn altijd inclusief tracking.",
    },
    {
      q: "Zijn er douanekosten op zendingen van Spanje naar Nederland?",
      a: "Nee. Beide landen zijn lid van de EU interne markt. Geen douanecontrole, geen invoerheffingen.",
    },
    {
      q: "Kan ik maritieme of industriële onderdelen laten printen?",
      a: "Ja. We printen in ABS, PETG, Nylon en andere materialen die geschikt zijn voor functionele en technische toepassingen. Omschrijf de toepassing bij je aanvraag en we adviseren het beste materiaal.",
    },
    {
      q: "Wat is de minimumbestelling?",
      a: "Minimumbestelling € 10. Geen minimale afnamehoeveelheid.",
    },
    {
      q: "Hoe snel krijg ik een offerte?",
      a: "Op werkdagen in de regel binnen 1 uur. Voor orders tot € 100 is er ook een directe online prijsindicatie.",
    },
  ],
  whatsappMsg: "Hallo, ik wil graag iets laten 3D-printen met levering in Rotterdam.",
  hubLink: { to: "/nl/3d-printen-laten-maken", label: "Alle 3D printdiensten NL" },
  siblingLinks: [
    { to: "/nl/3d-printen-amsterdam", label: "3D Printen Amsterdam" },
    { to: "/nl/3d-printen-eindhoven", label: "3D Printen Eindhoven" },
  ],
  guideLinks: [
    { to: "/nl/3d-printen-kosten", label: "Wat kost 3D printen?" },
    { to: "/nl/3d-printbestand-voorbereiden", label: "Bestand voorbereiden" },
    { to: "/nl/3d-print-materialen", label: "Materialen vergelijken" },
  ],
};

export const nlEindhoven: IntlCityContent = {
  slug: "/nl/3d-printen-eindhoven",
  lang: "nl",
  locale: "nl-NL",
  countryCode: "NL",
  city: "Eindhoven",
  metaTitle: "3D Printen Eindhoven — Offerte binnen 1 Uur, Levering 3–5 Werkdagen | Dimension3D",
  metaDescription: "3D printservice voor Eindhoven en Brainport-regio. Offerte binnen 1 uur, vaste verzending € 5,90, in de regel 3–5 werkdagen. Minimumbestelling € 10.",
  eyebrow: "3D printservice voor Eindhoven & Brainport",
  h1: "3D Printen Eindhoven — Bestel Online, Geleverd aan Huis",
  deliveryNote: "In de regel 3–5 werkdagen vanuit Barcelona naar Eindhoven. Vaste verzending € 5,90. Geen douane (EU interne markt).",
  introText: `Eindhoven is het technologische hart van Nederland. De stad en de omliggende Brainport-regio huisvesten een concentratie van hightech bedrijven, kennisinstellingen en maakindustrie die haar weerga in Europa nauwelijks kent. ASML, de chipmachinemaker die een sleutelpositie inneemt in de wereldwijde halfgeleiderketen, heeft hier zijn hoofdkantoor. Honderden toeleveranciers, spin-offs en aanverwante technologiebedrijven clusteren rondom de High Tech Campus — een wetenschapspark dat zichzelf de slimste vierkante kilometer ter wereld noemt.

In deze omgeving is de vraag naar precisieonderdelen, prototypes en maatwerkcomponenten structureel aanwezig. Dat geldt niet alleen voor de grote namen. In het uitgebreide toeleveranciersnetwerk van ASML en andere anchor-tenants op de High Tech Campus werken tientallen kleine en middelgrote bedrijven die regelmatig behoefte hebben aan kleine series of enkelstuks in kunststof — behuizingen, adapters, kabelgeleiders, testopstellingen, gereedschaphouders. Voor die toepassingen is FDM-printen vaak sneller en goedkoper dan traditionele bewerkingsmethoden, zeker als het gaat om iteraties waarbij het design nog niet definitief is.

De Design Academy Eindhoven is een andere bron van vraag. De academie staat internationaal bekend om haar experimentele benadering van productontwerp en materialenonderzoek. Studenten en afgestudeerden van de DAE werken vaak met prototypen waarbij de visuele en tactiele kwaliteit van een print net zo belangrijk is als de functionaliteit. PLA met een fijn laagprofiel, gevuld met 15–20% en gedrukt op hoge kwaliteit, biedt die afwerking. Dimension3D werkt graag met ontwerpers aan hun projecten — stuur je model en vertel ons wat je wilt bereiken.

DAF Trucks, ook in Eindhoven gevestigd, vertegenwoordigt de zware industrie. In de context van voertuigontwikkeling en testafdelingen zijn er altijd tussenonderdelen, fixture-componenten en mock-ups nodig. FDM-printen in ABS of Nylon biedt hier een goede interim-oplossing voor onderdelen die mechanisch en thermisch belastbaar moeten zijn maar geen spuitgiet­matrijs rechtvaardigen.

Brainport Eindhoven als geheel — de samenwerking tussen bedrijfsleven, overheid en kennisinstellingen rondom de Eindhovense technologieclusters — stimuleert ook een brede ondernemerschapscultuur. Technische startups en spin-offs die met een minimale investering een eerste werkend product willen bouwen, zijn een natuurlijke doelgroep voor on-demand printdiensten. Dimension3D biedt die laagdrempeligheid: geen lange contracten, geen minimale afnames, gewoon een bestand opsturen en een eerlijke prijs ontvangen.

Hoe werkt het vanuit Eindhoven? Je stuurt je bestand — STL, OBJ, 3MF of STEP — via het formulier of WhatsApp. Op werkdagen ontvang je in de regel binnen 1 uur een offerte. Er zijn geen opstartkosten en geen bestandscontrolekosten. De minimumbestelling is € 10 en er is geen minimum afnamehoeveelheid. Verzending van Barcelona naar Eindhoven kost € 5,90 vast. Binnen de EU zijn er geen douaneformaliteiten. Levering in de regel in 3–5 werkdagen.

We drukken op een Bambu Lab X2D met gesloten, verwarmde kamer — dat borgt stabiele printcondities voor technische materialen. We bieden PLA, PETG, ABS, ASA, TPU, Nylon en koolstofvezel-composieten. Heb je twijfels over het beste materiaal voor jouw toepassing? Beschrijf het gebruik en we adviseren je gratis.`,
  faqs: [
    {
      q: "Hoe lang duurt levering naar Eindhoven?",
      a: "In de regel 3–5 werkdagen vanuit Barcelona. Altijd met tracking.",
    },
    {
      q: "Zijn er douanekosten?",
      a: "Nee. Spanje en Nederland zijn beide EU-lidstaten. Geen douaneformaliteiten, geen extra heffingen.",
    },
    {
      q: "Kan ik technische onderdelen voor industriële toepassingen laten printen?",
      a: "Ja. We printen in ABS, Nylon, PETG en koolstofvezel-composieten voor functionele en technisch veeleisende toepassingen. Vertel ons bij de aanvraag wat de functionele eisen zijn.",
    },
    {
      q: "Wat kost een kleine serie van 10–50 stuks?",
      a: "Stuur je bestand op met de gewenste hoeveelheid. We berekenen de prijs per stuk inclusief het materiaal- en tijdsvoordeel van een serie. Offerte in de regel binnen 1 uur.",
    },
    {
      q: "Wat is de minimumbestelling?",
      a: "Minimumbestelling € 10. Geen minimale afnamehoeveelheid.",
    },
  ],
  whatsappMsg: "Hallo, ik wil graag iets laten 3D-printen met levering in Eindhoven.",
  hubLink: { to: "/nl/3d-printen-laten-maken", label: "Alle 3D printdiensten NL" },
  siblingLinks: [
    { to: "/nl/3d-printen-amsterdam", label: "3D Printen Amsterdam" },
    { to: "/nl/3d-printen-rotterdam", label: "3D Printen Rotterdam" },
  ],
  guideLinks: [
    { to: "/nl/3d-printen-kosten", label: "Wat kost 3D printen?" },
    { to: "/nl/3d-printbestand-voorbereiden", label: "Bestand voorbereiden" },
    { to: "/nl/3d-print-materialen", label: "Materialen vergelijken" },
  ],
};

// ─── NL GUIDES ─────────────────────────────────────────────────────────────────

export const nlGuidePrice: IntlGuideContent = {
  slug: "/nl/3d-printen-kosten",
  lang: "nl",
  locale: "nl-NL",
  topic: "price",
  metaTitle: "3D Printen Kosten — Wat Kost het Laten Printen in 2025? | Dimension3D",
  metaDescription: "Hoeveel kost 3D printen laten maken? Uitleg over hoe de prijs wordt berekend, voorbeeldprijzen voor PLA, PETG en ABS, en tips om kosten te besparen. Minimumbestelling € 10.",
  h1: "3D Printen Kosten — Wat Betaal Je en Hoe Wordt de Prijs Berekend?",
  intro: "De prijs van een 3D-print hangt af van twee factoren: het gewicht van het onderdeel (hoeveel filament er verbruikt wordt) en de printtijd (hoe lang de printer bezig is). Er zijn geen opstartkosten en geen kosten voor het controleren van je bestand. De minimumbestelling is € 10. Verzending kost € 5,90 vast naar Nederland.",
  sections: [
    {
      heading: "Hoe wordt de prijs berekend?",
      body: "De basisprijs bestaat uit materiaalkosten en machinekosten. Het gewicht wordt bepaald door het volume van je model, de vulgraad (infill) en het aantal wanden. De printtijd wordt beïnvloed door de geometrie, de laagdikte die je kiest en de hoeveelheid support­structuur die nodig is. PLA is het meest betaalbare materiaal; PETG is iets duurder door de hogere grondstofprijs; ABS en Nylon kosten meer door langere printtijden en hogere materiaalkosten. Voor orders tot € 100 bieden we een directe online prijsindicatie. Daarboven werken we met een handmatige offerte — je hoort in de regel binnen 1 uur.",
    },
    {
      heading: "Invloed van vulgraad en wanddikte",
      body: "Een lagere vulgraad (infill) vermindt het gewicht en de printtijd fors. Voor decoratieve objecten en niet-belaste onderdelen is 10–15% infill meer dan voldoende. Functionele, dragende onderdelen vragen 25–50% infill met 3–4 wanden. Kies niet automatisch voor maximale vulgraad: dat vergroot de prijs aanzienlijk zonder dat het altijd nodig is. Als je het niet zeker weet, omschrijf de toepassing bij je bestelling — we adviseren de meest kostenefficiënte instelling.",
    },
    {
      heading: "Materiaalkosten vergeleken",
      body: "PLA (vermenigvuldigingsfactor 1,0) is de basisreferentie. PETG (factor 1,1) is iets duurder maar biedt meer vochtbestendigheid en ductiliteit. ABS (factor 1,3) en Nylon (factor 1,4) zijn merkbaar duurder, maar zijn de juiste keuze als de toepassing dat vraagt. Koolstofvezel-composieten zijn de duurste optie — die prijs staat in verhouding tot de extra stijfheid die ze bieden.",
    },
    {
      heading: "Verzendkosten en minimumbestelling",
      body: "Verzending naar Nederland kost altijd € 5,90, ongeacht het gewicht van je bestelling. Er zijn geen douanekosten of invoerheffingen — Nederland en Spanje zijn beide EU-lidstaten. De minimumbestelling is € 10; kleine objecten of onderdelen die minder waard zijn, worden afgerond naar dat minimum.",
    },
    {
      heading: "Tips om de prijs te verlagen",
      body: "Gebruik een lagere infill als het onderdeel niet structureel belast wordt. Verklein het model als de maat het toelaat. Kies PLA als er geen speciale materiaal­eisen zijn. Combineer meerdere kleine onderdelen in één bestelling om de vaste verzendkosten te delen. Druk in PETG in plaats van Nylon als vochtbestendigheid voldoende is en mechanische belasting beperkt blijft.",
    },
  ],
  workedExamples: [
    {
      name: "Klein decoratief object",
      grams: 30,
      hours: 0.5,
      material: "PLA",
      price: "circa € 10",
      description: "30 g PLA, 0,5 uur printtijd. Berekend: 30 × 0,055 × 1,0 + 0,5 × 4,95 = 1,65 + 2,48 = € 4,13 — minimumbestelling € 10 is van toepassing.",
    },
    {
      name: "Functionele behuizing",
      grams: 80,
      hours: 2,
      material: "PETG",
      price: "circa € 15",
      description: "80 g PETG, 2 uur printtijd. Berekend: 80 × 0,055 × 1,1 + 2 × 4,95 = 4,84 + 9,90 = € 14,74 → circa € 15.",
    },
    {
      name: "Technisch ABS-onderdeel",
      grams: 200,
      hours: 5,
      material: "ABS",
      price: "circa € 37",
      description: "200 g ABS, 5 uur printtijd. Berekend: 200 × 0,055 × 1,3 + 3 × 4,95 + 2 × 3,85 = 14,30 + 14,85 + 7,70 = € 36,85 → circa € 37.",
    },
  ],
  faqs: [
    {
      q: "Wat is de minimumbestelling?",
      a: "De minimumbestelling is € 10. Kleine objecten waarvan de materiaal- en tijdskosten lager uitkomen, worden afgerond naar dat minimum.",
    },
    {
      q: "Zijn er opstartkosten?",
      a: "Nee. Geen opstartkosten, geen bestandscontrolekosten. Je betaalt alleen voor het printen en de verzending.",
    },
    {
      q: "Wat kost verzending naar Nederland?",
      a: "Vaste prijs van € 5,90, ongeacht het gewicht. Geen douanekosten — Nederland en Spanje zijn beide EU-lidstaten.",
    },
    {
      q: "Hoe lang duurt het voor ik een offerte heb?",
      a: "Voor bestellingen tot € 100 is er een directe online indicatie. Voor hogere bedragen of complexe projecten ontvang je in de regel binnen 1 uur een handmatige offerte op werkdagen.",
    },
  ],
  hubLink: { to: "/nl/3d-printen-laten-maken", label: "Terug naar 3D Printen Laten Maken" },
  cityLinks: [
    { to: "/nl/3d-printen-amsterdam", label: "3D Printen Amsterdam" },
    { to: "/nl/3d-printen-rotterdam", label: "3D Printen Rotterdam" },
    { to: "/nl/3d-printen-eindhoven", label: "3D Printen Eindhoven" },
  ],
};

export const nlGuideFilePrep: IntlGuideContent = {
  slug: "/nl/3d-printbestand-voorbereiden",
  lang: "nl",
  locale: "nl-NL",
  topic: "file-prep",
  metaTitle: "3D Printbestand Voorbereiden — STL, OBJ, 3MF Klaarmaken voor Printen | Dimension3D",
  metaDescription: "Stap-voor-stap uitleg over het voorbereiden van je 3D-bestand voor FDM-printen. Welke formaten, hoe je fouten voorkomt, juiste afmetingen en exportinstellingen.",
  h1: "3D Printbestand Voorbereiden — Tips voor een Foutloos STL of 3MF",
  intro: "Een goed voorbereid bestand bespaart tijd en geld. De meeste problemen bij 3D-printen — scheef uitgevallen maten, gaatjes in het mesh, printfouten — zijn te voorkomen met een paar eenvoudige stappen voor het exporteren. We leggen hier uit waar je op moet letten.",
  sections: [
    {
      heading: "Bestandsformaten die we accepteren",
      body: "We accepteren STL (binair of ASCII), OBJ, 3MF en STEP. Van deze vier is 3MF de beste keuze als je met Bambu Studio, PrusaSlicer of Fusion 360 werkt: het bewaart schaalinformatie en voorkomt verwarring over eenheden. STEP is ideaal als je precieze maatvoeringen wilt borgen en het design parametrisch is. STL is het meest universeel en werkt altijd, maar controleer na het exporteren de afmetingen in een gratis viewer zoals MeshLab of PrusaSlicer.",
    },
    {
      heading: "Eenheden en schaal controleren",
      body: "De meestgemaakte fout bij het exporteren naar STL is dat de eenheden verkeerd staan. Export altijd in millimeter. Als je in inch hebt gewerkt en naar STL exporteert zonder conversie, komt het model 25,4× te klein of te groot aan. Controleer na het exporteren: open het bestand in een slicer of viewer en kijk of de bounding box klopt met wat je hebt ontworpen.",
    },
    {
      heading: "Watertight mesh — gesloten oppervlakken",
      body: "Een 3D-model voor printen moet een 'watertight' mesh zijn: alle oppervlakken moeten gesloten zijn, zonder gaten of overlappende faces. De meeste professionele CAD-paketten genereren automatisch een waterdicht model als je exporteert. Problemen treden vaker op bij modellen die ge-import zijn uit scan-data of die in mesh-editors zijn gemaakt. Gebruik Meshmixer (gratis) of Netfabb om fouten te repareren. We controleren bestanden ook zelf bij ontvangst en laten het weten als er problemen zijn.",
    },
    {
      heading: "Minimale wanddikte",
      body: "FDM-printen heeft beperkingen op dunne wanden. Als je wanden dunner zijn dan 0,8 mm, worden ze mogelijk niet goed geprint. De veilige ondergrens voor functionele wanden is 1,2–1,6 mm (twee tot drie extrusielagen). Decoratieve, niet-dragende onderdelen kunnen met 0,8–1,0 mm wanden worden geprint als het design het toelaat, maar dit verhoogt het risico op fragiele resultaten.",
    },
    {
      heading: "Overhangen en support",
      body: "FDM-printers kunnen overhangen tot circa 45 graden zonder support verwerken. Steilere overhangen vragen support-materiaal, wat de prijs iets verhoogt en een post-processing stap toevoegt. Herontwerp waar mogelijk om overhangen te vermijden: chamfers in plaats van loodrechte plafonds, teardrop-gaten in plaats van ronde gaten op overhangvlakken. Als support noodzakelijk is, laten we dat weten in de offerte.",
    },
    {
      heading: "Toleranties voor passende onderdelen",
      body: "FDM-printen heeft een maatnauwkeurigheid van circa ±0,2–0,3 mm afhankelijk van het materiaal en de geometrie. Als je een onderdeel ontwerpt dat moet passen op een ander onderdeel (as-gat-passing, snapfit, rail-geleider), houd dan rekening met een speling van 0,3–0,5 mm. Stuur bij twijfel een proefmodel van het kritieke passend deel mee — we printen dan eerst een test.",
    },
    {
      heading: "Geen bestand? Geen probleem.",
      body: "Heb je alleen een foto, een tekening of een kapot onderdeel dat je wilt laten nabouwen? Stuur het via WhatsApp of het contactformulier. We bespreken de opties en kunnen in veel gevallen zelf een model maken of aanpassen.",
    },
  ],
  faqs: [
    {
      q: "Welk bestandsformaat is het beste?",
      a: "3MF voor de meeste CAD-exportworkflows; STEP als maatvoeringen kritisch zijn. STL werkt altijd maar controleer dan wel de afmetingen na het exporteren.",
    },
    {
      q: "Mijn bestand heeft fouten — kunnen jullie het repareren?",
      a: "We controleren elk bestand bij ontvangst. Kleine mesh-fouten repareren we zonder meerkosten. Complexe reparaties bespreken we vooraf.",
    },
    {
      q: "Hoe weet ik of mijn model te klein is om te printen?",
      a: "Details kleiner dan ±0,5 mm zijn moeilijk te realiseren. Stuur je bestand op en we geven aan welke details haalbaar zijn.",
    },
    {
      q: "Kunnen jullie een tekening printen als ik geen 3D-model heb?",
      a: "We kunnen een model maken op basis van een tekening of foto. Stuur het materiaal op via WhatsApp of het formulier en we bespreken wat mogelijk is.",
    },
  ],
  hubLink: { to: "/nl/3d-printen-laten-maken", label: "Terug naar 3D Printen Laten Maken" },
  cityLinks: [
    { to: "/nl/3d-printen-amsterdam", label: "3D Printen Amsterdam" },
    { to: "/nl/3d-printen-rotterdam", label: "3D Printen Rotterdam" },
    { to: "/nl/3d-printen-eindhoven", label: "3D Printen Eindhoven" },
  ],
};

export const nlGuideMaterials: IntlGuideContent = {
  slug: "/nl/3d-print-materialen",
  lang: "nl",
  locale: "nl-NL",
  topic: "materials",
  metaTitle: "3D Print Materialen Vergelijken — PLA, PETG, ABS, Nylon, TPU | Dimension3D",
  metaDescription: "Welk materiaal kiezen voor je 3D-print? Vergelijking van PLA, PETG, ABS, ASA, TPU en Nylon: sterkte, warmtebestendigheid, toepassingen en kosten.",
  h1: "3D Print Materialen — Welk Materiaal Past bij Jouw Project?",
  intro: "Het juiste materiaal kiezen maakt het verschil tussen een onderdeel dat precies doet wat het moet doen en een dat na een week breekt of vervormt. We leggen per materiaal uit wat het kan, wat het niet kan, en voor welke toepassingen het het meest geschikt is.",
  sections: [
    {
      heading: "PLA — Veelzijdig en betaalbaar",
      body: "PLA (polylactic acid) is het meest gebruikte FDM-materiaal. Het is biologisch afbreekbaar, eenvoudig te printen en beschikbaar in vrijwel elke kleur. PLA biedt een goede oppervlakte­kwaliteit en scherpe details. Het nadeel: PLA is niet warmtebestendig (begint te vervormen rond 55–60 °C) en is kwetsbaar voor langdurige UV-blootstelling of vochtige omstandigheden. Ideaal voor: decoratieve objecten, maquettes, prototypes voor visuele beoordeling, interieur­accessoires.",
    },
    {
      heading: "PETG — Sterk en vochtbestendig",
      body: "PETG combineert de printbaarheid van PLA met betere mechanische eigenschappen. Het is taai, heeft een goede schlag­vastheid en is bestand tegen water en mild chemisch contact. Warmtebestendigheid ligt rond 70–75 °C — beter dan PLA maar minder dan ABS. PETG is iets flexibeler dan PLA, wat het goed maakt voor onderdelen die licht gebogen worden. Ideaal voor: functionele onderdelen, behuizingen, connectoren, onderdelen die vochtig worden, algemeen gebruik.",
    },
    {
      heading: "ABS — Warmtebestendig en bewerkbaar",
      body: "ABS (acrylonitrile butadiene styrene) verdraagt temperaturen tot circa 90 °C en is goed bewerkbaar (schuren, snijden, lijmen). Het is hard en taai maar iets minder slagvast dan PETG. ABS vereist een gesloten printer met verwarmde kamer om krimp en delaminatie te voorkomen — onze Bambu Lab X2D is hiervoor uitgerust. Ideaal voor: auto-onderdelen, technische behuizingen, onderdelen die machinaal nabewerkt worden.",
    },
    {
      heading: "ASA — Buitengebruik en UV-bestendig",
      body: "ASA is functioneel vergelijkbaar met ABS maar heeft een significant hogere UV-weerstand. Kleuren blijven stabiel buiten, en het materiaal is bestand tegen regen, temperatuurwisselingen en UV-straling. ASA vervangt ABS op plekken waar langdurige buitenblootstelling verwacht wordt. Ideaal voor: buitenbehuizingen, zonnepaneel­montages, automotive buitentrimonderdelen.",
    },
    {
      heading: "TPU — Flexibel en rubberachtig",
      body: "TPU (thermoplastic polyurethane) is het go-to materiaal voor flexibele prints. Het gedraagt zich als rubber: buigzaam, slagvast en bestand tegen abrasie. TPU is iets langzamer te printen dan stijve materialen. Ideaal voor: afdichtingen, beschermhoesjes, trillingsdempende pads, grijpers voor robotica, sportartikelen.",
    },
    {
      heading: "Nylon — Industriële sterkte",
      body: "Nylon (PA12 of PA6) biedt de hoogste sterkte en slijtvastheid van alle standaard FDM-materialen. Het is matig hygroscopisch (absorbeert vocht uit de lucht), waardoor opslag en printcondities kritisch zijn. Onze gesloten printer met verwarmde kamer beheert dit goed. Nylon is merkbaar duurder dan de overige materialen. Ideaal voor: tandwielen, lagers, slijtage­onderdelen, industrieel gebruik.",
    },
    {
      heading: "Koolstofvezel-composieten",
      body: "We bieden PLA-CF, PETG-CF en Nylon-CF: dezelfde basispolymeren versterkt met gehakte koolstofvezels. Dit vergroot de stijfheid en verlaagt het gewicht zonder dat de print­baarheid sterk afneemt. Koolstofvezel-composieten zijn de duurste optie maar de juiste keuze als maximale stijfheid met minimaal gewicht vereist is. Ideaal voor: drone-frames, robotica-armen, race-onderdelen, lichtgewicht structurele brackets.",
    },
  ],
  faqs: [
    {
      q: "Welk materiaal is het goedkoopst?",
      a: "PLA is het goedkoopst. PETG is iets duurder. ABS en Nylon zijn duurder door hogere materiaalkosten en langere printtijden.",
    },
    {
      q: "Welk materiaal is het meest geschikt voor buitengebruik?",
      a: "ASA is de beste keuze voor langdurig buitengebruik vanwege de UV-weerstand. PETG is een goede tweede optie als UV-blootstelling beperkt is.",
    },
    {
      q: "Kan ik een flexibel onderdeel laten printen?",
      a: "Ja. We printen in TPU voor flexibele toepassingen.",
    },
    {
      q: "Hoe weet ik welk materiaal ik nodig heb?",
      a: "Omschrijf de toepassing bij je bestelling — hoe wordt het onderdeel gebruikt, welke krachten komen erop, wat is de omgeving? We adviseren gratis het beste materiaal.",
    },
  ],
  hubLink: { to: "/nl/3d-printen-laten-maken", label: "Terug naar 3D Printen Laten Maken" },
  cityLinks: [
    { to: "/nl/3d-printen-amsterdam", label: "3D Printen Amsterdam" },
    { to: "/nl/3d-printen-rotterdam", label: "3D Printen Rotterdam" },
    { to: "/nl/3d-printen-eindhoven", label: "3D Printen Eindhoven" },
  ],
};

// ─── FR HUB ────────────────────────────────────────────────────────────────────

export const frHub: IntlHubContent = {
  slug: "/fr/impression-3d-en-ligne",
  lang: "fr",
  locale: "fr-FR",
  countryCode: "FR",
  metaTitle: "Impression 3D en Ligne | Service d'Impression 3D livré en France | Dimension3D",
  metaDescription: "Faire imprimer en 3D depuis la France : devis en moins d'1 heure, livraison 9,90 € fixe, en général 2–4 jours ouvrables. Pas de droits de douane (UE). Commande minimum de 10 €.",
  eyebrow: "Service d'impression 3D pour la France",
  h1: "Impression 3D en Ligne — Devis en 1 Heure, Livré en France",
  promise: "Devis en moins d'1 heure les jours ouvrables (heure espagnole). Pas de frais de mise en route. Expédition 5,90 €. Commande minimum de 10 €.",
  howItWorks: `Comment ça fonctionne ? Vous envoyez votre fichier 3D — STL, OBJ, 3MF ou STEP — via le formulaire en ligne ou WhatsApp. Les jours ouvrables, nous répondons en général dans l'heure avec un prix exact. Pour les commandes jusqu'à 100 €, un tarif instantané est également disponible en ligne. Une fois le devis accepté, nous lançons la fabrication dans notre atelier à Barcelone. Votre colis est expédié le jour même ou le lendemain et arrive en France habituellement sous 2–4 jours ouvrables. L'ensemble du trajet reste dans l'Union européenne — aucune formalité douanière, aucune taxe supplémentaire.`,
  whatWePrint: `Que peut-on faire imprimer ? Les applications sont nombreuses : pièces de rechange pour appareils ou machines dont les composants ne sont plus disponibles, prototypes fonctionnels pour le développement de produits, boîtiers et adaptateurs pour l'électronique, supports et fixations sur mesure pour l'industrie ou le milieu amateur, maquettes et modèles architecturaux, et objets personnalisés ou décoratifs. L'impression FDM convient particulièrement aux pièces mécaniquement sollicitées, exposées à l'extérieur ou devant résister à la chaleur. Vous n'êtes pas sûr(e) que votre idée soit imprimable ? Envoyez une photo ou une description via WhatsApp — nous vous conseillons gratuitement.`,
  materialsText: `Nous imprimons en PLA, PETG, ABS, ASA, TPU (flexible), Nylon (PA12/PA6) et composites fibres de carbone. Le PLA est le choix le plus accessible : prix compétitif, beau rendu de surface, adapté à la plupart des applications d'intérieur. Le PETG offre résistance mécanique et imperméabilité — idéal pour les pièces fonctionnelles. L'ABS et l'ASA résistent à la chaleur jusqu'à environ 90–100 °C et aux UV ; parfaits pour les pièces automobiles ou les applications extérieures. Le Nylon est choisi lorsque la résistance maximale et la tenue à l'usure sont requises. Notre Bambu Lab X2D dispose d'une chambre fermée et chauffée — ce qui garantit des conditions d'impression stables pour tous les matériaux, y compris les plus exigeants techniquement.`,
  fileFormatsText: `Nous acceptons les formats STL, OBJ, 3MF et STEP. Les exports directs depuis Fusion 360, SolidWorks, Onshape, FreeCAD et la plupart des autres logiciels de CAO fonctionnent sans conversion. Vous n'avez qu'un dessin, une photo ou une pièce cassée ? Envoyez-nous le tout — nous étudierons les options ensemble.`,
  faqs: [
    {
      q: "Quelle est la commande minimum ?",
      a: "La commande minimum est de 10 €. La plupart des petites pièces individuelles se situent entre 10 € et 40 €. Il n'y a pas de quantité minimale — nous imprimons volontiers une seule pièce.",
    },
    {
      q: "Dans quel délai recevrai-je mon devis ?",
      a: "Les jours ouvrables, habituellement dans l'heure (heure de bureau espagnole). Pour les commandes jusqu'à 100 €, un tarif instantané est disponible via la calculatrice en ligne.",
    },
    {
      q: "Y a-t-il des droits de douane sur les envois depuis l'Espagne ?",
      a: "Non. L'Espagne et la France font toutes deux partie du marché intérieur de l'UE. Pas de formalités douanières, pas de taxes supplémentaires.",
    },
    {
      q: "Quel est le délai de livraison en France ?",
      a: "Habituellement 2–4 jours ouvrables à compter de la confirmation. Tous les envois sont suivis.",
    },
    {
      q: "Quels sont les frais d'expédition ?",
      a: "Tarif fixe de 5,90 € vers la France, quel que soit le poids de votre commande.",
    },
    {
      q: "Quel format de fichier dois-je fournir ?",
      a: "STL, OBJ, 3MF et STEP sont tous acceptés. Vous n'avez qu'un dessin ou une photo ? Contactez-nous via WhatsApp.",
    },
    {
      q: "Puis-je spécifier un matériau et une couleur particuliers ?",
      a: "Oui. Lors de votre commande, indiquez le matériau et la couleur souhaités. Si vous n'êtes pas sûr(e), décrivez l'usage de la pièce — nous vous recommanderons le meilleur choix.",
    },
    {
      q: "Y a-t-il des frais de mise en route ou de vérification de fichier ?",
      a: "Non. Pas de frais de mise en route, pas de frais de contrôle. Vous ne payez que l'impression et l'expédition.",
    },
  ],
  whatsappMsg: "Bonjour, je souhaite faire imprimer une pièce en 3D via Dimension3D.",
  priceTableCaption: "Les exemples de prix sont indicatifs et dépendent du matériau, du poids et du temps d'impression. Commande minimum de 10 €.",
  breadcrumbHub: "Impression 3D en Ligne",
  cityLinks: [
    { to: "/fr/impression-3d-toulouse", label: "Impression 3D Toulouse" },
    { to: "/fr/impression-3d-montpellier", label: "Impression 3D Montpellier" },
    { to: "/fr/impression-3d-lyon", label: "Impression 3D Lyon" },
    { to: "/fr/impression-3d-paris", label: "Impression 3D Paris" },
  ],
  guideLinks: [
    { to: "/fr/prix-impression-3d", label: "Prix impression 3D" },
    { to: "/fr/preparer-fichier-impression-3d", label: "Préparer son fichier" },
    { to: "/fr/materiaux-impression-3d", label: "Comparer les matériaux" },
  ],
};

// ─── FR CITIES ─────────────────────────────────────────────────────────────────

export const frToulouse: IntlCityContent = {
  slug: "/fr/impression-3d-toulouse",
  lang: "fr",
  locale: "fr-FR",
  countryCode: "FR",
  city: "Toulouse",
  metaTitle: "Impression 3D Toulouse — Devis en 1 Heure, Livraison 2–4 Jours | Dimension3D",
  metaDescription: "Service d'impression 3D pour Toulouse. Devis en moins d'1 heure, expédition 5,90 €, livraison habituellement 2–4 jours ouvrables. Commande minimum de 10 €.",
  eyebrow: "Service d'impression 3D pour Toulouse",
  h1: "Impression 3D Toulouse — Devis en 1 Heure, Livré à Domicile",
  deliveryNote: "Habituellement 2–4 jours ouvrables depuis Barcelone vers Toulouse. Expédition fixe 5,90 €. Pas de douane (marché intérieur UE).",
  introText: `Toulouse occupe une position singulière dans le paysage industriel français. Capitale européenne de l'aéronautique, elle abrite le siège social et les grandes unités de production d'Airbus, l'un des deux premiers avionneurs mondiaux. L'ensemble de la chaîne d'approvisionnement aéronautique et spatiale gravite autour de la ville : équipementiers de rang 1 et 2, sous-traitants de précision, bureaux d'études, laboratoires de qualification. Cette concentration industrielle crée un tissu de professionnels — ingénieurs, techniciens, chercheurs — qui manipulent quotidiennement des exigences de conception précises et des cycles de développement rapides.

Dans ce contexte, l'impression 3D FDM a trouvé un rôle bien défini : prototypage rapide de pièces qui seront ultérieurement usinées, fabriquées par injection ou livrées par voie conventionnelle ; gabarits de contrôle et outillages de production en petite série ; maquettes d'études d'intégration pour les cellules d'avion ou les boîtiers d'équipements embarqués. Le recours à l'impression 3D ne concerne pas uniquement les grandes entreprises : les PME de la sous-traitance aéronautique sont souvent les utilisatrices les plus agiles de ces technologies, car elles doivent répondre vite à des demandes ponctuelles sans immobiliser de budget outillage.

L'ISAE-SUPAERO, grande école d'ingénieurs aérospatiaux implantée sur le campus de Toulouse-Lespinet, contribue à cette culture de l'innovation rapide. Les étudiants et doctorants de l'école, tout comme ceux de l'Université Paul Sabatier avec sa forte composante scientifique, utilisent régulièrement l'impression 3D dans leurs projets de recherche ou de compétition (fusées étudiantes, drones, CubeSats). Un service d'impression à la demande accessible depuis Barcelone, avec un délai de réponse de moins d'une heure et une livraison en 2–4 jours ouvrables, s'intègre naturellement dans leurs cycles de travail.

Toulouse a également développé une scène créative et design distincte, nourrie par le quartier du Capitole et les nombreux espaces de coworking et fablab qui ont émergé au cours des dernières années. Des designers indépendants, des artisans et des créateurs y utilisent l'impression 3D pour concevoir des objets uniques, tester des formes ou produire des accessoires personnalisés. Pour ces utilisateurs, la valeur d'un service comme Dimension3D réside dans la simplicité : pas de frais de mise en route, pas de commande minimum contraignante (commande minimum de 10 €), et la possibilité d'envoyer un fichier et de recevoir un devis dans l'heure.

Pour les professionnels de la chaîne aéronautique, la précision matérielle est souvent un critère décisif. Nous imprimons avec le Bambu Lab X2D, une imprimante à enceinte fermée et chauffée qui garantit des conditions stables pour les matériaux techniques — ABS, ASA, Nylon et composites fibres de carbone. Ces matériaux sont adaptés aux applications où la tenue mécanique, la résistance thermique ou la stabilité dimensionnelle sont requises.

Voici comment passer commande depuis Toulouse. Vous envoyez votre fichier 3D — STL, OBJ, 3MF ou STEP — via le formulaire en ligne ou par WhatsApp. Les jours ouvrables, vous recevez habituellement un devis dans l'heure (heure de bureau espagnole). Pas de frais de mise en route. Commande minimum de 10 €. Expédition fixe de 5,90 € vers Toulouse. Aucune formalité douanière — la France et l'Espagne font partie du marché intérieur européen. Livraison habituellement en 2–4 jours ouvrables.`,
  faqs: [
    {
      q: "Quel est le délai de livraison depuis Barcelone vers Toulouse ?",
      a: "Habituellement 2–4 jours ouvrables. Tous les envois sont suivis.",
    },
    {
      q: "Y a-t-il des droits de douane ?",
      a: "Non. La France et l'Espagne font toutes deux partie du marché intérieur de l'UE. Pas de formalités douanières.",
    },
    {
      q: "Puis-je faire imprimer des pièces en matériaux techniques (ABS, Nylon) ?",
      a: "Oui. Nous imprimons en ABS, ASA, Nylon et composites fibres de carbone, adaptés aux applications aéronautiques et industrielles.",
    },
    {
      q: "Quelle est la commande minimum ?",
      a: "Commande minimum de 10 €. Pas de quantité minimale.",
    },
    {
      q: "Comment puis-je obtenir un devis ?",
      a: "Envoyez votre fichier via le formulaire ou WhatsApp. Habituellement sous 1 heure les jours ouvrables.",
    },
  ],
  whatsappMsg: "Bonjour, je souhaite faire imprimer une pièce en 3D avec livraison à Toulouse.",
  hubLink: { to: "/fr/impression-3d-en-ligne", label: "Tous nos services impression 3D France" },
  siblingLinks: [
    { to: "/fr/impression-3d-montpellier", label: "Impression 3D Montpellier" },
    { to: "/fr/impression-3d-lyon", label: "Impression 3D Lyon" },
    { to: "/fr/impression-3d-paris", label: "Impression 3D Paris" },
  ],
  guideLinks: [
    { to: "/fr/prix-impression-3d", label: "Prix impression 3D" },
    { to: "/fr/preparer-fichier-impression-3d", label: "Préparer son fichier" },
    { to: "/fr/materiaux-impression-3d", label: "Comparer les matériaux" },
  ],
};

export const frMontpellier: IntlCityContent = {
  slug: "/fr/impression-3d-montpellier",
  lang: "fr",
  locale: "fr-FR",
  countryCode: "FR",
  city: "Montpellier",
  metaTitle: "Impression 3D Montpellier — Devis en 1 Heure, Livraison 2–4 Jours | Dimension3D",
  metaDescription: "Service d'impression 3D pour Montpellier. Devis rapide, expédition 5,90 €, livraison habituellement 2–4 jours ouvrables depuis Barcelone. Commande minimum de 10 €.",
  eyebrow: "Service d'impression 3D pour Montpellier",
  h1: "Impression 3D Montpellier — Devis Rapide, Livré à Domicile",
  deliveryNote: "Habituellement 2–4 jours ouvrables depuis Barcelone vers Montpellier. Expédition fixe 5,90 €. Pas de douane (marché intérieur UE).",
  introText: `Montpellier est une ville en pleine transformation économique et scientifique. Son université, l'une des plus anciennes d'Europe, et son CHU (Centre Hospitalier Universitaire) font de la métropole un pôle biomédical reconnu à l'échelle nationale. La recherche médicale et paramédicale génère une demande constante d'équipements de laboratoire sur mesure, de maquettes anatomiques, de supports de prélèvement, de boîtiers pour appareils de mesure portables. L'impression 3D FDM répond précisément à ce besoin : elle permet de produire des pièces fonctionnelles à faible coût et en petite série, sans recourir à la sous-traitance industrielle lourde.

Le CHU de Montpellier, en particulier, est un acteur historique de l'innovation médicale en France. Dans son sillage, plusieurs start-ups de medtech et de dispositifs médicaux se sont installées dans l'agglomération. Ces entreprises en phase de développement ont souvent besoin de prototyper rapidement — un boîtier pour un capteur, un support d'électrode, un gabarit d'assemblage — avant de valider leur design et de passer à des méthodes de fabrication plus industrielles. Pour elles, l'impression à la demande offre une flexibilité irremplaçable.

L'agglomération montpelliéraine s'est également positionnée comme un hub de l'agritech et des sciences du vivant. SupAgro Montpellier, école nationale supérieure d'agronomie, et l'INRAE (Institut National de Recherche pour l'Agriculture, l'Alimentation et l'Environnement) contribuent à un écosystème de recherche appliquée où les outils de fabrication numérique sont intégrés dans les pratiques de développement. Capteurs de terrain, boîtiers de protection pour équipements de mesure en milieu rural, systèmes de fixation pour serres et infrastructures de recherche : autant d'applications où l'impression 3D en PETG ou en ABS apporte une réponse rapide et économique.

La scène des startups technologiques montpelliéraines s'est densifiée depuis l'ouverture de plusieurs espaces d'innovation et incubateurs dans le centre-ville et la zone Eureka. Les jeunes entreprises qui y sont hébergées couvrent des domaines variés — healthtech, fintech, agritech, logiciel — et ont souvent besoin ponctuellement de pièces physiques : un prototype de produit à présenter à un investisseur, un accessoire promotionnel pour un salon, une pièce fonctionnelle pour tester une intégration matérielle.

Dimension3D propose un service entièrement en ligne, sans frais de mise en route et sans contrainte de quantité au-delà de la commande minimum de 10 €. Vous envoyez votre fichier — STL, OBJ, 3MF ou STEP — via le formulaire ou WhatsApp. Les jours ouvrables, vous recevez habituellement un devis en moins d'une heure. L'expédition depuis Barcelone vers Montpellier coûte 5,90 € et la livraison prend habituellement 2–4 jours ouvrables. Comme les deux villes se trouvent dans l'Union européenne, il n'y a aucune formalité douanière. Notre imprimante Bambu Lab X2D, à enceinte fermée et chauffée, assure des conditions d'impression stables pour tous nos matériaux, des plus courants (PLA, PETG) aux plus techniques (ABS, Nylon, composites fibres de carbone).`,
  faqs: [
    {
      q: "Quel est le délai de livraison de Barcelone vers Montpellier ?",
      a: "Habituellement 2–4 jours ouvrables. Envois toujours suivis.",
    },
    {
      q: "Y a-t-il des frais de douane ?",
      a: "Non. La France et l'Espagne font partie du marché intérieur de l'UE. Pas de formalités douanières.",
    },
    {
      q: "Peut-on faire imprimer des pièces pour des applications biomédicales ou de laboratoire ?",
      a: "Oui, en particulier des supports, boîtiers et gabarits en PETG, ABS ou Nylon. Décrivez l'application et nous vous recommandons le matériau le plus approprié.",
    },
    {
      q: "Quelle est la commande minimum ?",
      a: "Commande minimum de 10 €. Pas de quantité minimale.",
    },
    {
      q: "Comment obtenir un devis ?",
      a: "Via le formulaire en ligne ou WhatsApp. Réponse habituellement en moins d'1 heure les jours ouvrables.",
    },
  ],
  whatsappMsg: "Bonjour, je souhaite faire imprimer une pièce en 3D avec livraison à Montpellier.",
  hubLink: { to: "/fr/impression-3d-en-ligne", label: "Tous nos services impression 3D France" },
  siblingLinks: [
    { to: "/fr/impression-3d-toulouse", label: "Impression 3D Toulouse" },
    { to: "/fr/impression-3d-lyon", label: "Impression 3D Lyon" },
    { to: "/fr/impression-3d-paris", label: "Impression 3D Paris" },
  ],
  guideLinks: [
    { to: "/fr/prix-impression-3d", label: "Prix impression 3D" },
    { to: "/fr/preparer-fichier-impression-3d", label: "Préparer son fichier" },
    { to: "/fr/materiaux-impression-3d", label: "Comparer les matériaux" },
  ],
};

export const frLyon: IntlCityContent = {
  slug: "/fr/impression-3d-lyon",
  lang: "fr",
  locale: "fr-FR",
  countryCode: "FR",
  city: "Lyon",
  metaTitle: "Impression 3D Lyon — Devis en 1 Heure, Livraison 2–4 Jours | Dimension3D",
  metaDescription: "Impression 3D à Lyon et Métropole. Devis rapide, expédition 5,90 €, livraison habituellement 2–4 jours depuis Barcelone. Commande minimum de 10 €.",
  eyebrow: "Service d'impression 3D pour Lyon",
  h1: "Impression 3D Lyon — Devis Rapide, Livré à Domicile",
  deliveryNote: "Habituellement 2–4 jours ouvrables depuis Barcelone vers Lyon. Expédition fixe 5,90 €. Pas de douane (marché intérieur UE).",
  introText: `Lyon est la deuxième place économique de France, portée par une industrie diversifiée qui mêle chimie, pharmacie, numérique, agroalimentaire et un tissu de PME manufacturières parmi les plus dynamiques d'Europe. La présence de groupes pharmaceutiques de rang mondial dans la région lyonnaise — Sanofi y dispose d'importants sites de production et de R&D — génère une demande continue pour des outillages de production, des gabarits de contrôle qualité, des maquettes de dispositifs médicaux et des prototypes de conditionnement. L'impression 3D FDM s'intègre naturellement dans ce cycle : les équipes d'ingénierie et de développement produit l'utilisent pour valider des designs avant d'engager des budgets de production.

L'École Centrale de Lyon, grande école d'ingénieurs généralistes implantée à Écully, est un vivier d'ingénieurs formés aux technologies de fabrication numérique. La culture de l'innovation rapide et du prototypage itératif, que la Centrale enseigne dans ses ateliers et projets, crée un tissu d'anciens élèves et de professionnels en activité qui recourent régulièrement à des services d'impression à la demande. Qu'il s'agisse d'un projet de fin d'études, d'un démonstrateur technique pour un client industriel ou d'un prototype de compétition (Formula Student, Eco-Marathon Shell), la demande de pièces imprimées rapidement et de manière fiable est permanente.

Lyon entretient également un lien historique fort avec le textile et la soie, héritage de la ville des canuts qui a façonné sa culture matérielle et artisanale. Aujourd'hui, cette tradition se prolonge dans une approche inventive du design de produit et de la mode, notamment dans le quartier de la Croix-Rousse où designers et créateurs ont réinvesti les anciens ateliers de tissage. Pour cette communauté créative, l'impression 3D ouvre des possibilités inédites : pièces de bijouterie, accessoires de mode, modules de défilé, prototypes d'emballage. Des matériaux comme le PLA sont disponibles dans une palette de couleurs étendue, et notre service permet de commander une seule pièce sans minimum de quantité (commande minimum de 10 €).

Viva Technology Lyon, aux côtés de nombreux incubateurs et accélérateurs implantés dans la Part-Dieu et sur le campus Rockefeller, a renforcé l'écosystème startup de la métropole. Les jeunes pousses lyonnaises — dans la santé numérique, l'industrie 4.0 ou la robotique — ont ponctuellement besoin de pièces mécaniques ou de prototypes de produit pour préparer des démonstrations, participer à des concours ou tester une hypothèse de design. Pour ces besoins, un service en ligne avec une réponse en moins d'une heure et une livraison en quelques jours est un atout réel.

Comment passer commande depuis Lyon ? Vous envoyez votre fichier 3D — STL, OBJ, 3MF ou STEP — via le formulaire ou WhatsApp. Les jours ouvrables, vous recevez habituellement votre devis dans l'heure (heure de bureau espagnole). Pas de frais de mise en route, pas de frais de vérification. Commande minimum de 10 €. Expédition fixe 5,90 € depuis Barcelone. Livraison habituellement en 2–4 jours ouvrables. Aucune formalité douanière — France et Espagne, marché intérieur de l'UE.`,
  faqs: [
    {
      q: "Quel est le délai de livraison de Barcelone vers Lyon ?",
      a: "Habituellement 2–4 jours ouvrables. Tous les envois sont suivis.",
    },
    {
      q: "Y a-t-il des taxes ou droits de douane ?",
      a: "Non. La France et l'Espagne font partie du marché intérieur de l'UE. Pas de formalités douanières.",
    },
    {
      q: "Puis-je commander une seule pièce ?",
      a: "Oui. Pas de quantité minimale. Commande minimum de 10 €.",
    },
    {
      q: "Quels matériaux proposez-vous pour les applications industrielles ou pharmaceutiques ?",
      a: "ABS, ASA, PETG, Nylon et composites fibres de carbone pour les applications techniques. Décrivez l'usage et nous vous conseillons.",
    },
    {
      q: "Comment obtenir un devis ?",
      a: "Via le formulaire ou WhatsApp. Habituellement sous 1 heure les jours ouvrables.",
    },
  ],
  whatsappMsg: "Bonjour, je souhaite faire imprimer une pièce en 3D avec livraison à Lyon.",
  hubLink: { to: "/fr/impression-3d-en-ligne", label: "Tous nos services impression 3D France" },
  siblingLinks: [
    { to: "/fr/impression-3d-toulouse", label: "Impression 3D Toulouse" },
    { to: "/fr/impression-3d-montpellier", label: "Impression 3D Montpellier" },
    { to: "/fr/impression-3d-paris", label: "Impression 3D Paris" },
  ],
  guideLinks: [
    { to: "/fr/prix-impression-3d", label: "Prix impression 3D" },
    { to: "/fr/preparer-fichier-impression-3d", label: "Préparer son fichier" },
    { to: "/fr/materiaux-impression-3d", label: "Comparer les matériaux" },
  ],
};

export const frParis: IntlCityContent = {
  slug: "/fr/impression-3d-paris",
  altSlug: "/3d-printing-delivery-paris",
  lang: "fr",
  locale: "fr-FR",
  countryCode: "FR",
  city: "Paris",
  metaTitle: "Impression 3D Paris — Devis en 1 Heure, Livraison 2–4 Jours | Dimension3D",
  metaDescription: "Service d'impression 3D pour Paris et Île-de-France. Devis en moins d'1 heure, expédition 5,90 €, habituellement 2–4 jours depuis Barcelone. Commande minimum de 10 €.",
  eyebrow: "Service d'impression 3D pour Paris",
  h1: "Impression 3D Paris — Devis en 1 Heure, Livré en Île-de-France",
  deliveryNote: "Habituellement 2–4 jours ouvrables depuis Barcelone vers Paris. Expédition fixe 5,90 €. Pas de douane (marché intérieur UE).",
  introText: `Paris et sa région concentrent une densité industrielle, académique et créative sans équivalent en France. La chaîne d'approvisionnement aérospatiale y est particulièrement visible : Safran, dont le siège et plusieurs centres de R&D sont implantés en Île-de-France, représente à lui seul des milliers d'ingénieurs et de techniciens travaillant sur des composants de moteurs, de nacelles et de systèmes embarqués. À proximité du site de Safran à Massy et dans l'ensemble de la zone Orly-Rungis, de nombreux équipementiers et sous-traitants opèrent dans l'aéronautique, la défense et les systèmes embarqués. Pour ces acteurs, l'impression 3D en matériaux techniques — ABS, Nylon, fibres de carbone — sert régulièrement à produire des pièces de validation, des gabarits et des outillages provisoires avant industrialisation.

Les grandes écoles parisiennes ont contribué à forger une culture d'ingénierie rigoureuse et innovante. Arts et Métiers ParisTech, dont l'ADN est profondément lié aux techniques de fabrication, forme des ingénieurs généralistes qui maîtrisent les procédés de mise en forme des matériaux — parmi lesquels l'impression 3D occupe désormais une place de premier plan. L'ENPC (École des Ponts ParisTech), Centrale Paris (aujourd'hui CentraleSupélec) et leurs communautés d'anciens élèves forment un réseau de professionnels qui, dans les bureaux d'études, les cabinets de conseil en ingénierie et les start-ups industrielles, ont régulièrement besoin de pièces prototypées rapidement.

Paris héberge aussi l'un des écosystèmes de design de produit les plus vivants d'Europe. Le Marais, en particulier, est devenu un quartier de référence pour les agences de design, les studios de création industrielle et les ateliers d'artisanat de luxe qui utilisent la fabrication numérique comme outil de production et de prototypage. Des accessoires de mode aux packagings de lancement de produit, en passant par les sculptures décorative et les pièces d'ameublement sur mesure, la demande de services d'impression 3D réactifs et de qualité est constante dans ce milieu. La possibilité de commander une pièce unique — commande minimum de 10 €, sans quantité minimale — est un critère déterminant pour ces utilisateurs.

La scène des start-ups franciliennes, portée par Station F, la Halle Freyssinet et une dizaine d'incubateurs thématiques, ajoute une autre couche de demande. Des jeunes entreprises en deeptech, en robotique ou en IoT ont régulièrement besoin de pièces mécaniques pour leurs prototypes, démonstrateurs ou kits de démonstration investisseurs. Un service qui répond en moins d'une heure et livre en quelques jours — sans contrat, sans minimum engageant — leur offre la flexibilité dont elles ont besoin à chaque itération.

Comment commander depuis Paris ? Vous envoyez votre fichier 3D — STL, OBJ, 3MF ou STEP — via le formulaire en ligne ou WhatsApp. Les jours ouvrables, vous recevez habituellement votre devis dans l'heure (heure de bureau espagnole). Pas de frais de mise en route. Commande minimum de 10 €. Expédition fixe de 5,90 € depuis Barcelone vers Paris. Livraison habituellement sous 2–4 jours ouvrables. Aucune formalité douanière — France et Espagne, marché intérieur européen.

Notre atelier à Barcelone est équipé du Bambu Lab X2D, une imprimante à enceinte fermée et chauffée qui garantit des conditions stables pour tous les matériaux : PLA, PETG, ABS, ASA, TPU, Nylon et composites fibres de carbone. Vous ne savez pas quel matériau choisir ? Décrivez l'usage de votre pièce — nous vous conseillons gratuitement.`,
  faqs: [
    {
      q: "Quel est le délai de livraison de Barcelone vers Paris ?",
      a: "Habituellement 2–4 jours ouvrables. Tous les envois sont suivis.",
    },
    {
      q: "Y a-t-il des droits de douane entre l'Espagne et la France ?",
      a: "Non. Les deux pays font partie du marché intérieur de l'UE. Pas de formalités douanières.",
    },
    {
      q: "Peut-on faire imprimer des pièces techniques pour l'aérospatial ou la défense ?",
      a: "Oui. Nous imprimons en ABS, Nylon et composites fibres de carbone pour les applications techniques. Décrivez l'application et nous vous conseillons sur le matériau.",
    },
    {
      q: "Quelle est la commande minimum ?",
      a: "Commande minimum de 10 €. Pas de quantité minimale.",
    },
    {
      q: "Comment obtenir un devis ?",
      a: "Via le formulaire ou WhatsApp. Habituellement sous 1 heure les jours ouvrables.",
    },
  ],
  whatsappMsg: "Bonjour, je souhaite faire imprimer une pièce en 3D avec livraison à Paris.",
  hubLink: { to: "/fr/impression-3d-en-ligne", label: "Tous nos services impression 3D France" },
  siblingLinks: [
    { to: "/fr/impression-3d-toulouse", label: "Impression 3D Toulouse" },
    { to: "/fr/impression-3d-montpellier", label: "Impression 3D Montpellier" },
    { to: "/fr/impression-3d-lyon", label: "Impression 3D Lyon" },
  ],
  guideLinks: [
    { to: "/fr/prix-impression-3d", label: "Prix impression 3D" },
    { to: "/fr/preparer-fichier-impression-3d", label: "Préparer son fichier" },
    { to: "/fr/materiaux-impression-3d", label: "Comparer les matériaux" },
  ],
};

// ─── FR GUIDES ─────────────────────────────────────────────────────────────────

export const frGuidePrice: IntlGuideContent = {
  slug: "/fr/prix-impression-3d",
  lang: "fr",
  locale: "fr-FR",
  topic: "price",
  metaTitle: "Prix Impression 3D — Combien Coûte Faire Imprimer en 3D ? | Dimension3D",
  metaDescription: "Comment est calculé le prix d'une impression 3D ? Exemples de tarifs pour PLA, PETG et ABS, conseils pour réduire le coût. Commande minimum de 10 €.",
  h1: "Prix Impression 3D — Comment est Calculé le Tarif ?",
  intro: "Le prix d'une impression 3D dépend de deux paramètres : le poids de la pièce (quantité de filament consommée) et le temps d'impression (durée d'utilisation de la machine). Il n'y a pas de frais de mise en route ni de frais de vérification de fichier. La commande minimum est de 10 €. L'expédition coûte 5,90 € fixe vers la France.",
  sections: [
    {
      heading: "Comment le prix est-il calculé ?",
      body: "Le prix de base se compose du coût matériau et du coût machine. Le poids est déterminé par le volume de votre modèle, le taux de remplissage (infill) choisi et l'épaisseur des parois. Le temps d'impression dépend de la géométrie, de la hauteur de couche sélectionnée et de la quantité de supports nécessaires. Le PLA est le matériau le moins cher ; le PETG est légèrement plus onéreux ; l'ABS et le Nylon coûtent davantage en raison de temps d'impression plus longs et d'un prix matière plus élevé. Pour les commandes jusqu'à 100 €, un tarif instantané est disponible en ligne. Au-delà, nous établissons un devis manuel — habituellement en moins d'une heure.",
    },
    {
      heading: "L'influence du taux de remplissage et de l'épaisseur de paroi",
      body: "Un taux de remplissage (infill) réduit diminue significativement le poids et le temps d'impression. Pour les objets décoratifs ou les pièces non sollicitées mécaniquement, un infill de 10–15 % est largement suffisant. Les pièces fonctionnelles portantes nécessitent 25–50 % d'infill avec 3–4 périmètres de paroi. N'optez pas systématiquement pour le remplissage maximal : cela augmente le prix de façon notable sans que ce soit toujours utile. En cas de doute, décrivez l'utilisation prévue dans votre commande — nous vous recommanderons le paramétrage le plus économique.",
    },
    {
      heading: "Comparaison du coût des matériaux",
      body: "Le PLA (coefficient multiplicateur 1,0) est la référence de base. Le PETG (coefficient 1,1) est légèrement plus cher mais offre une meilleure résistance à l'humidité et à la déformation. L'ABS (coefficient 1,3) et le Nylon (coefficient 1,4) sont sensiblement plus onéreux, mais sont le bon choix lorsque l'application l'exige. Les composites fibres de carbone sont l'option la plus coûteuse — ce supplément est justifié par la rigidité accrue qu'ils procurent.",
    },
    {
      heading: "Frais d'expédition et commande minimum",
      body: "L'expédition vers la France coûte toujours 5,90 €, quel que soit le poids de votre commande. Il n'y a pas de droits de douane — la France et l'Espagne sont toutes deux membres de l'UE. La commande minimum est de 10 € ; les petits objets dont le coût matière et machine est inférieur à ce seuil seront facturés au minimum.",
    },
    {
      heading: "Conseils pour réduire le coût",
      body: "Utilisez un infill faible si la pièce n'est pas soumise à des contraintes structurelles. Réduisez le modèle si les dimensions le permettent. Choisissez le PLA si aucune contrainte matériau particulière n'est requise. Regroupez plusieurs petites pièces en une seule commande pour mutualiser les frais d'expédition. Optez pour le PETG plutôt que le Nylon si la résistance à l'humidité suffit et la sollicitation mécanique reste modérée.",
    },
  ],
  workedExamples: [
    {
      name: "Petit objet décoratif",
      grams: 30,
      hours: 0.5,
      material: "PLA",
      price: "environ 10 €",
      description: "30 g PLA, 0,5 h d'impression. Calcul : 30 × 0,055 × 1,0 + 0,5 × 4,95 = 1,65 + 2,48 = 4,13 € — la commande minimum de 10 € s'applique.",
    },
    {
      name: "Boîtier fonctionnel",
      grams: 80,
      hours: 2,
      material: "PETG",
      price: "environ 15 €",
      description: "80 g PETG, 2 h d'impression. Calcul : 80 × 0,055 × 1,1 + 2 × 4,95 = 4,84 + 9,90 = 14,74 € → environ 15 €.",
    },
    {
      name: "Pièce technique en ABS",
      grams: 200,
      hours: 5,
      material: "ABS",
      price: "environ 37 €",
      description: "200 g ABS, 5 h d'impression. Calcul : 200 × 0,055 × 1,3 + 3 × 4,95 + 2 × 3,85 = 14,30 + 14,85 + 7,70 = 36,85 € → environ 37 €.",
    },
  ],
  faqs: [
    {
      q: "Quelle est la commande minimum ?",
      a: "La commande minimum est de 10 €. Les petits objets dont le coût calculé est inférieur à ce seuil sont facturés au minimum.",
    },
    {
      q: "Y a-t-il des frais de mise en route ?",
      a: "Non. Pas de frais de mise en route, pas de frais de vérification de fichier. Vous payez uniquement l'impression et l'expédition.",
    },
    {
      q: "Quel est le coût d'expédition vers la France ?",
      a: "Tarif fixe de 5,90 €, quel que soit le poids. Pas de droits de douane — la France et l'Espagne sont dans l'UE.",
    },
    {
      q: "Dans quel délai reçois-je mon devis ?",
      a: "Pour les commandes jusqu'à 100 €, un tarif instantané est disponible en ligne. Au-delà, ou pour des projets complexes, vous recevez habituellement un devis manuel en moins d'1 heure les jours ouvrables.",
    },
  ],
  hubLink: { to: "/fr/impression-3d-en-ligne", label: "Retour à Impression 3D en Ligne" },
  cityLinks: [
    { to: "/fr/impression-3d-toulouse", label: "Impression 3D Toulouse" },
    { to: "/fr/impression-3d-montpellier", label: "Impression 3D Montpellier" },
    { to: "/fr/impression-3d-lyon", label: "Impression 3D Lyon" },
    { to: "/fr/impression-3d-paris", label: "Impression 3D Paris" },
  ],
};

export const frGuideFilePrep: IntlGuideContent = {
  slug: "/fr/preparer-fichier-impression-3d",
  lang: "fr",
  locale: "fr-FR",
  topic: "file-prep",
  metaTitle: "Préparer son Fichier pour l'Impression 3D — STL, OBJ, 3MF | Dimension3D",
  metaDescription: "Comment préparer un fichier 3D pour l'impression FDM ? Formats acceptés, vérification du maillage, épaisseurs de paroi, tolérances et conseils d'export.",
  h1: "Préparer son Fichier pour l'Impression 3D — Guide Complet",
  intro: "Un fichier bien préparé permet d'éviter les retards, les erreurs d'impression et les surprises de coût. La plupart des problèmes — dimensions incorrectes, maillage non étanche, parois trop fines — peuvent être prévenus en appliquant quelques bonnes pratiques avant l'export.",
  sections: [
    {
      heading: "Formats de fichier acceptés",
      body: "Nous acceptons le STL (binaire ou ASCII), l'OBJ, le 3MF et le STEP. Parmi ces formats, le 3MF est recommandé si vous travaillez avec Bambu Studio, PrusaSlicer ou Fusion 360 : il conserve les informations d'échelle et évite les confusions d'unités. Le STEP est idéal pour les pièces paramétriques où la précision dimensionnelle est critique. Le STL est le plus universel et fonctionne toujours, mais vérifiez les dimensions après export en ouvrant le fichier dans un slicer ou un visualiseur gratuit.",
    },
    {
      heading: "Vérifier les unités et l'échelle",
      body: "L'erreur la plus fréquente lors de l'export en STL est une confusion d'unités. Exportez toujours en millimètres. Si vous avez modélisé en pouces et exportez en STL sans conversion, votre modèle arrivera 25,4 fois trop petit ou trop grand. Après export, ouvrez le fichier dans un slicer et vérifiez que les dimensions correspondent bien à ce que vous avez conçu.",
    },
    {
      heading: "Maillage étanche — surfaces fermées",
      body: "Un modèle 3D destiné à l'impression doit présenter un maillage étanche (watertight) : toutes les surfaces doivent être fermées, sans trous ni faces qui se chevauchent. La plupart des logiciels de CAO professionnels génèrent automatiquement un maillage propre à l'export. Les problèmes surviennent plus souvent avec des modèles issus de données de scan ou modifiés dans des éditeurs de maillage. Utilisez Meshmixer (gratuit) ou Netfabb pour réparer les erreurs. Nous vérifions également les fichiers à réception et vous informons en cas de problème.",
    },
    {
      heading: "Épaisseur minimale de paroi",
      body: "L'impression FDM a des limitations sur les parois minces. Des parois inférieures à 0,8 mm risquent de ne pas être imprimées correctement. L'épaisseur sécurisée pour des parois fonctionnelles est de 1,2–1,6 mm (deux à trois passages d'extrusion). Les pièces décoratives non porteuses peuvent être imprimées avec des parois de 0,8–1,0 mm, mais avec un risque de fragilité accru.",
    },
    {
      heading: "Surplombs et supports",
      body: "Les imprimantes FDM peuvent gérer des surplombs jusqu'à environ 45° sans support. Au-delà, un matériau de support est nécessaire, ce qui augmente légèrement le prix et ajoute une étape de post-traitement. Repensez si possible votre design pour éviter les surplombs : chanfreins plutôt que plafonds verticaux, trous en larme de bougie (teardrop) plutôt que ronds pour les perçages sur les faces en surplomb. Si des supports sont nécessaires, nous l'indiquerons dans le devis.",
    },
    {
      heading: "Tolérances pour les assemblages",
      body: "L'impression FDM offre une précision dimensionnelle d'environ ±0,2–0,3 mm selon le matériau et la géométrie. Si vous concevez une pièce destinée à s'emboîter avec une autre (ajustement arbre-alésage, clip, rail), prévoyez un jeu de 0,3–0,5 mm. En cas de doute, envoyez un modèle de test de la zone critique — nous imprimerons d'abord un essai.",
    },
    {
      heading: "Pas de fichier ? Pas de problème.",
      body: "Vous n'avez qu'une photo, un dessin ou une pièce cassée à remplacer ? Envoyez-nous le tout via WhatsApp ou le formulaire de contact. Nous étudions les options et pouvons souvent modéliser ou adapter la pièce pour vous.",
    },
  ],
  faqs: [
    {
      q: "Quel format de fichier est le meilleur ?",
      a: "Le 3MF pour la plupart des workflows d'export CAO ; le STEP si les cotes sont critiques. Le STL fonctionne toujours mais vérifiez les dimensions après export.",
    },
    {
      q: "Mon fichier contient des erreurs — pouvez-vous les corriger ?",
      a: "Nous vérifions chaque fichier à réception. Les petites erreurs de maillage sont corrigées sans surcoût. Les réparations complexes sont discutées au préalable.",
    },
    {
      q: "Comment savoir si mon modèle est trop petit pour être imprimé ?",
      a: "Les détails inférieurs à ±0,5 mm sont difficiles à réaliser. Envoyez votre fichier et nous vous indiquerons quels détails sont réalisables.",
    },
    {
      q: "Pouvez-vous imprimer à partir d'un dessin technique si je n'ai pas de fichier 3D ?",
      a: "Nous pouvons modéliser à partir d'un dessin ou d'une photo. Envoyez-nous le matériel via WhatsApp ou le formulaire et nous vous dirons ce qui est possible.",
    },
  ],
  hubLink: { to: "/fr/impression-3d-en-ligne", label: "Retour à Impression 3D en Ligne" },
  cityLinks: [
    { to: "/fr/impression-3d-toulouse", label: "Impression 3D Toulouse" },
    { to: "/fr/impression-3d-montpellier", label: "Impression 3D Montpellier" },
    { to: "/fr/impression-3d-lyon", label: "Impression 3D Lyon" },
    { to: "/fr/impression-3d-paris", label: "Impression 3D Paris" },
  ],
};

export const frGuideMaterials: IntlGuideContent = {
  slug: "/fr/materiaux-impression-3d",
  lang: "fr",
  locale: "fr-FR",
  topic: "materials",
  metaTitle: "Matériaux Impression 3D — PLA, PETG, ABS, Nylon, TPU Comparés | Dimension3D",
  metaDescription: "Quel matériau choisir pour votre impression 3D ? Comparaison PLA, PETG, ABS, ASA, TPU, Nylon : résistance, tenue thermique, applications et coût.",
  h1: "Matériaux Impression 3D — Quel Matériau Choisir pour Votre Projet ?",
  intro: "Le choix du matériau est déterminant : une pièce dans le bon matériau durera des années, dans le mauvais elle peut se déformer ou casser en quelques semaines. Voici un guide comparatif pour chaque matériau disponible chez Dimension3D.",
  sections: [
    {
      heading: "PLA — Polyvalent et économique",
      body: "Le PLA (acide polylactique) est le matériau FDM le plus utilisé. Il est biosourcé, facile à imprimer et disponible dans une très large gamme de couleurs. Le PLA offre un excellent rendu de surface et des détails nets. Son inconvénient : il n'est pas résistant à la chaleur (commence à se déformer vers 55–60 °C) et est sensible aux UV prolongés et à l'humidité. Idéal pour : objets décoratifs, maquettes, prototypes visuels, accessoires d'intérieur.",
    },
    {
      heading: "PETG — Résistant et imperméable",
      body: "Le PETG combine la facilité d'impression du PLA avec de meilleures propriétés mécaniques. Il est tenace, présente une bonne résistance aux chocs et supporte un contact prolongé avec l'eau et les produits chimiques doux. Sa résistance thermique est d'environ 70–75 °C — meilleure que le PLA mais inférieure à l'ABS. Le PETG est légèrement plus flexible que le PLA, ce qui le rend adapté aux pièces légèrement sollicitées en flexion. Idéal pour : pièces fonctionnelles, boîtiers, connecteurs, pièces exposées à l'humidité, usage général.",
    },
    {
      heading: "ABS — Résistance thermique et usinabilité",
      body: "L'ABS supporte des températures jusqu'à environ 90 °C et se travaille bien (ponçage, perçage, collage). Il est dur et tenace, légèrement moins résistant aux chocs que le PETG. L'ABS nécessite une imprimante à enceinte fermée et chauffée pour éviter les retraits et la délamination — notre Bambu Lab X2D est équipée pour cela. Idéal pour : pièces automobiles, boîtiers techniques, pièces destinées à l'usinage.",
    },
    {
      heading: "ASA — Extérieur et résistance aux UV",
      body: "L'ASA est fonctionnellement comparable à l'ABS mais dispose d'une résistance aux UV nettement supérieure. Les couleurs restent stables en extérieur, et le matériau résiste à la pluie, aux variations de température et aux rayonnements UV. L'ASA remplace l'ABS pour toutes les applications avec exposition extérieure prolongée. Idéal pour : boîtiers extérieurs, fixations de panneaux solaires, pièces de carrosserie extérieure automobile.",
    },
    {
      heading: "TPU — Flexible et caoutchouteux",
      body: "Le TPU (polyuréthane thermoplastique) est le matériau de référence pour les impressions flexibles. Il se comporte comme du caoutchouc : souple, résistant aux chocs et à l'abrasion. Le TPU s'imprime un peu plus lentement que les matériaux rigides. Idéal pour : joints d'étanchéité, coques de protection, patins anti-vibrations, préhenseurs robotiques, articles de sport.",
    },
    {
      heading: "Nylon — Résistance industrielle",
      body: "Le Nylon (PA12 ou PA6) offre la meilleure résistance mécanique et à l'usure parmi les matériaux FDM courants. Il est hygroscopique (absorbe l'humidité ambiante), ce qui rend les conditions de stockage et d'impression critiques. Notre imprimante à enceinte fermée et chauffée gère bien cette contrainte. Le Nylon est sensiblement plus cher que les autres matériaux. Idéal pour : engrenages, paliers, pièces d'usure, usage industriel.",
    },
    {
      heading: "Composites fibres de carbone",
      body: "Nous proposons le PLA-CF, le PETG-CF et le Nylon-CF : les mêmes polymères de base renforcés de fibres de carbone courtes. Cela augmente la rigidité et réduit le poids sans dégrader significativement l'imprimabilité. Les composites fibres de carbone sont l'option la plus onéreuse, mais le bon choix quand une rigidité maximale avec un poids minimal est requise. Idéal pour : châssis de drones, bras robotiques, pièces de compétition, supports structurels légers.",
    },
  ],
  faqs: [
    {
      q: "Quel est le matériau le moins cher ?",
      a: "Le PLA est le moins cher. Le PETG est légèrement plus cher. L'ABS et le Nylon sont plus onéreux en raison du coût matière et des temps d'impression plus longs.",
    },
    {
      q: "Quel matériau est recommandé pour une utilisation extérieure ?",
      a: "L'ASA est le meilleur choix pour une exposition extérieure prolongée grâce à sa résistance aux UV. Le PETG est une bonne option secondaire si l'exposition UV est limitée.",
    },
    {
      q: "Peut-on imprimer une pièce flexible ?",
      a: "Oui. Nous imprimons en TPU pour les applications flexibles.",
    },
    {
      q: "Comment savoir quel matériau me convient ?",
      a: "Décrivez l'utilisation de la pièce dans votre commande — contraintes mécaniques, environnement, temperature, exposition à l'humidité. Nous vous conseillons gratuitement le matériau le plus adapté.",
    },
  ],
  hubLink: { to: "/fr/impression-3d-en-ligne", label: "Retour à Impression 3D en Ligne" },
  cityLinks: [
    { to: "/fr/impression-3d-toulouse", label: "Impression 3D Toulouse" },
    { to: "/fr/impression-3d-montpellier", label: "Impression 3D Montpellier" },
    { to: "/fr/impression-3d-lyon", label: "Impression 3D Lyon" },
    { to: "/fr/impression-3d-paris", label: "Impression 3D Paris" },
  ],
};

// ─── Convenience re-exports ──────────────────────────────────────────────────

export const NL_PAGES = {
  hub: nlHub,
  cities: [nlAmsterdam, nlRotterdam, nlEindhoven],
  guides: [nlGuidePrice, nlGuideFilePrep, nlGuideMaterials],
};

export const FR_PAGES = {
  hub: frHub,
  cities: [frToulouse, frMontpellier, frLyon, frParis],
  guides: [frGuidePrice, frGuideFilePrep, frGuideMaterials],
};
