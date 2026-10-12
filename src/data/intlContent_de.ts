// German-language content for international pages
import type { IntlHubContent, IntlCityContent, IntlGuideContent } from "@/data/intlTypes";

// ---------------------------------------------------------------------------
// Hub page — /de/3d-druck-service
// ---------------------------------------------------------------------------

export const DE_HUB: IntlHubContent = {
  slug: "/de/3d-druck-service",
  lang: "de",
  locale: "de-DE",
  countryCode: "DE",

  metaTitle: "3D-Druck Service aus Barcelona | Dimension3D",
  metaDescription:
    "Professioneller FDM 3D-Druck aus Barcelona – Angebot in 1 Stunde, Lieferung nach Deutschland in der Regel 3–5 Werktage. PLA, PETG, ABS, ASA, TPU, Nylon, PC. Ab Mindestbestellwert 10 €.",

  eyebrow: "3D-Druck Service aus Barcelona · Lieferung nach Deutschland",

  h1: "3D-Druck Service – online bestellen, nach Deutschland geliefert",

  promise: `Dimension3D ist ein FDM-Druckstudio in Barcelona mit einem Bambu Lab X2D – einem geschlossenen Drucker mit beheizter Kammer, der technisch anspruchsvolle Materialien wie ABS, ASA, Nylon und Polycarbonat zuverlässig verarbeitet. Sie laden Ihre Datei hoch, erhalten innerhalb einer Stunde (an Werktagen, Barceloner Zeit) ein verbindliches Angebot und bekommen Ihr Teil in der Regel innerhalb von 3–5 Werktagen nach Deutschland geliefert. Kein Zoll, keine Einrichtungsgebühr, Mindestbestellwert 10 €.`,

  howItWorks: `Der Ablauf ist denkbar einfach: Sie laden Ihre STL-, STEP-, OBJ- oder 3MF-Datei über den Kalkulator hoch. Bei Bestellungen bis 100 € erhalten Sie sofort einen Richtpreis; darüber hinaus erstellen wir ein manuelles Angebot und melden uns innerhalb einer Stunde (an Werktagen). Nach Ihrer Freigabe gehen Ihre Teile direkt in die Produktion. Der Versand nach Deutschland erfolgt per Standardpaket – als EU-Binnenlieferung fällt kein Zoll an. Die Versandpauschale beträgt 5,90 €, egal wie viele Teile Sie bestellen.`,

  whatWePrint: `Als 3D-Druck Dienstleister drucken wir für ein breites Spektrum an Anwendungen: Funktionsprototypen und Iterationsmodelle für Produktentwickler und Ingenieure, Ersatzteile für Maschinen, Haushaltsgeräte oder Oldtimer – gerade wenn Originalteile nicht mehr lieferbar sind. Wir fertigen Gehäuse und Halterungen für Elektronikprojekte, Steuergeräte und Embedded-Systeme, Kleinserien für Messen und Produktlaunches sowie maßgefertigte Einsätze für industrielle Vorrichtungen und Haltevorrichtungen im Automotive-Umfeld. Auch im Maker- und Hobbybereich sind wir gefragt: Brettspiel-Erweiterungen, Cosplay-Requisiten, Modellbau-Zubehör und personalisierte Geschenke werden regelmäßig bei uns 3D-drucken gelassen. Kurz gesagt: Wenn Sie eine Datei haben – oder auch nur ein Foto oder eine Skizze –, finden wir einen Weg, Ihr Teil umzusetzen.`,

  materialsText: `Unser Materialportfolio deckt die gängigsten FDM-Werkstoffe ab. PLA eignet sich für Prototypen, Sichtmodelle und Dekorationsobjekte – es ist günstig, maßhaltig und leicht zu verarbeiten. PETG kombiniert gute Zähigkeit mit Lebensmittelkontakteignung (ungefärbt) und ist die erste Wahl für mechanisch belastete Teile im Innenbereich. ABS und ASA bieten höhere Temperaturbeständigkeit und UV-Stabilität (ASA) für den Außeneinsatz. TPU ermöglicht flexible, stoßdämpfende Teile wie Dichtungen, Griffe und Schutzhüllen. Nylon überzeugt durch Zähigkeit und Abriebfestigkeit, ideal für Zahnräder, Lager und Clips. Polycarbonat (PC) hält hohen Temperaturen stand und ist schlagzäh – geeignet für anspruchsvolle technische Bauteile. Für maximale Steifigkeit bei geringem Gewicht bieten wir kohlefaserverstärkte Composites an. Wenn Sie unsicher sind, welches Material für Ihre Anwendung passt, beraten wir Sie gerne.`,

  fileFormatsText: `Wir akzeptieren STL, STEP, OBJ und 3MF. STEP-Dateien sind bevorzugt, wenn Maßhaltigkeit besonders wichtig ist, da sie exakte Geometrien ohne Triangulierungsfehler übertragen. Sie haben noch keine CAD-Datei? Schicken Sie uns einfach ein Foto oder eine Skizze per WhatsApp – wir schauen gemeinsam, was möglich ist.`,

  faqs: [
    {
      q: "Gibt es einen Zoll beim Versand von Spanien nach Deutschland?",
      a: "Nein. Spanien und Deutschland sind beide EU-Mitgliedstaaten. Als EU-Binnenlieferung fällt kein Zoll an, und es sind keine Zolldokumente erforderlich.",
    },
    {
      q: "Wie lange dauert die Lieferung nach Deutschland?",
      a: "In der Regel dauert die Lieferung 3–5 Werktage ab Versand. Wir versenden per Standardpaket; die genaue Laufzeit hängt vom Carrier und Ihrem Standort innerhalb Deutschlands ab.",
    },
    {
      q: "Was kostet der Versand?",
      a: "Die Versandpauschale beträgt 5,90 € – unabhängig von der Anzahl der Teile oder dem Gesamtgewicht Ihrer Bestellung.",
    },
    {
      q: "Gibt es eine Mindestbestellmenge oder Einrichtungsgebühr?",
      a: "Der Mindestbestellwert liegt bei 10 €. Eine Einrichtungsgebühr gibt es nicht.",
    },
    {
      q: "Welche Dateiformate werden akzeptiert?",
      a: "Wir akzeptieren STL, STEP, OBJ und 3MF. STEP empfehlen wir für technische Teile mit engen Toleranzen.",
    },
    {
      q: "Wie schnell erhalte ich ein Angebot?",
      a: "Bei Bestellungen bis 100 € erhalten Sie direkt im Kalkulator einen Sofortpreis. Bei größeren oder komplexeren Aufträgen erstellen wir ein manuelles Angebot und melden uns in der Regel innerhalb einer Stunde – an Werktagen zu Barceloner Geschäftszeiten.",
    },
    {
      q: "Kann ich mehrere Materialien in einer Bestellung kombinieren?",
      a: "Ja. Sie können verschiedene Teile in unterschiedlichen Materialien in einer Bestellung zusammenfassen. Der Versand wird trotzdem nur einmal mit 5,90 € berechnet.",
    },
    {
      q: "Was ist der Unterschied zwischen PLA und PETG für technische Teile?",
      a: "PLA ist günstig und maßhaltig, aber empfindlich gegenüber Wärme (ab ca. 60 °C) und UV-Strahlung. PETG ist zäher, feuchtigkeitsbeständiger und verträgt etwas höhere Temperaturen. Für mechanisch belastete oder im Freien eingesetzte Teile empfehlen wir PETG, ABS oder ASA.",
    },
  ],

  whatsappMsg:
    "Hallo, ich möchte 3D-Teile bestellen. Können Sie mir weiterhelfen?",

  priceTableCaption:
    "Richtwert für ein 50-g-Teil in PETG. Ihr genaues Angebot erhalten Sie über den Kalkulator.",

  breadcrumbHub: "3D-Druck Service",

  cityLinks: [
    { to: "/de/3d-druck-berlin", label: "Berlin" },
    { to: "/de/3d-druck-muenchen", label: "München" },
    { to: "/de/3d-druck-hamburg", label: "Hamburg" },
  ],

  guideLinks: [
    { to: "/de/3d-druck-kosten", label: "3D-Druck Kosten" },
    { to: "/de/3d-druck-datei-vorbereiten", label: "Datei vorbereiten" },
    { to: "/de/3d-druck-materialien", label: "Materialien im Überblick" },
  ],
};

// ---------------------------------------------------------------------------
// City pages
// ---------------------------------------------------------------------------

export const DE_CITIES: IntlCityContent[] = [
  // ── Berlin ──────────────────────────────────────────────────────────────
  {
    slug: "/de/3d-druck-berlin",
    lang: "de",
    locale: "de-DE",
    countryCode: "DE",
    city: "Berlin",
    altSlug: "/3d-printing-delivery-berlin",

    metaTitle: "3D-Druck mit Lieferung nach Berlin | Dimension3D",
    metaDescription:
      "FDM 3D-Druck aus Barcelona, geliefert nach Berlin in der Regel in 3–5 Werktagen. Angebot in 1 Stunde. PLA, PETG, ABS, ASA, TPU, Nylon. Ab 10 €, kein Zoll.",

    h1: "3D-Druck mit Lieferung nach Berlin",
    eyebrow: "3D-Druck Service · Lieferung nach Berlin in der Regel 3–5 Werktage",

    introText: `Berlin ist Deutschlands kreativste Metropole – und gleichzeitig einer der dynamischsten Standorte für Hardware-Entwicklung, Produktdesign und technologische Innovation in ganz Europa. Wer in Berlin 3D-drucken lassen möchte, findet zwar lokale Anbieter, doch die Nachfrage nach schnellen, qualitativ hochwertigen FDM-Teilen übersteigt regelmäßig das Angebot. Dimension3D aus Barcelona bietet eine zuverlässige Alternative: Dateien hochladen, Angebot in einer Stunde erhalten, Teile in der Regel innerhalb von 3–5 Werktagen im Briefkasten – ohne Zoll, da Spanien und Deutschland beide zur EU gehören.

Berlins Startup-Ökosystem zählt zu den größten auf dem Kontinent. Im und um den Bezirk Mitte, Prenzlauer Berg, Kreuzberg und Friedrichshain haben sich hunderte Hardware-Startups angesiedelt, die von der Rapid-Prototyping-Welle profitieren. Gründerinnen und Gründer, die an smarten Geräten, Medizintechnik-Gadgets, Wearables oder IoT-Produkten arbeiten, benötigen regelmäßig Funktionsprototypen in kleinen Stückzahlen – oft genug für ein Pitch-Deck oder eine Investoren-Demo. Genau hier ist ein 3D-Druck Dienstleister wie Dimension3D wertvoll: kein Mindestvolumen außer 10 €, keine Einrichtungsgebühr, schnelle Lieferung.

Die Technische Universität Berlin und die Beuth Hochschule (heute Berliner Hochschule für Technik) sind zwei der forschungsstärksten Ingenieurhochschulen Deutschlands. Studentinnen und Studenten aus Maschinenbau, Elektrotechnik, Produktdesign und Architektur greifen regelmäßig auf 3D-Druck zurück – für Semesterarbeiten, Abschlussarbeiten und Wettbewerbsprojekte. Wer keine Hochschullizenz für die campuseigenen Drucker hat oder größere Stückzahlen benötigt, kann unkompliziert bei uns bestellen.

Die Berliner Maker-Community ist legendär: FabLabs, Hackerspaces wie das c-base und diverse Co-Working-Spaces mit Werkstattcharakter ziehen Tüftlerinnen und Tüftler aus ganz Deutschland an. Viele dieser Maker-Projekte enden mit einem Bedarf nach professionell gedruckten Teilen – sei es für ein Open-Source-Hardware-Projekt, ein Kunstobjekt für eine Ausstellung oder ein maßgefertigtes Gehäuse für ein Raspberry-Pi-Projekt.

Der Berliner Mittelstand darf dabei nicht vergessen werden. Berlin ist nicht nur Startup-Stadt: Es gibt eine starke Basis an mittelständischen Unternehmen in der Elektronik-, Medizintechnik- und Automatisierungsbranche, die immer wieder Ersatzteile, Sonderanfertigungen und Produktionshilfsmittel in kleinen Stückzahlen benötigen. Gerade wenn ein Originallieferant einen Teil nicht mehr fertigt oder Lieferzeiten von mehreren Wochen hat, ist der Weg zu einem 3D-Druck Dienstleister oft der schnellste und wirtschaftlichste.

Die Kreativwirtschaft Berlins – von Spieleentwicklern über Filmproduktionen bis hin zu Requisitenwerkstätten – nutzt FDM-Druck ebenfalls intensiv. Filmrequisiten, Cosplay-Ausrüstung für die vielen Comic-Cons und Conventions der Stadt, individualisierte Brettspiel-Erweiterungen oder Dekorationsobjekte für Pop-up-Stores sind typische Aufträge. Mit TPU lassen sich weiche, flexible Teile drucken; PLA und PETG decken den Großteil der starren Anwendungen ab.

Von Barcelona nach Berlin: Die logistische Verbindung ist gut. Als EU-Binnenlieferung fällt kein Zoll an, und der Carrier benötigt in der Regel 3–5 Werktage für die Zustellung. Die Versandpauschale von 5,90 € gilt unabhängig vom Gewicht oder der Stückzahl Ihrer Bestellung – so lohnt es sich, mehrere Teile in einer Bestellung zu bündeln.

Wenn Sie Fragen zu Ihrer Konstruktion haben oder sich beim Material nicht sicher sind, schreiben Sie uns einfach per WhatsApp. Wir antworten auf Deutsch und beraten Sie ehrlich – auch wenn das bedeutet, dass wir Ihnen von einer bestimmten Lösung abraten.`,

    deliveryNote:
      "Lieferung nach Berlin in der Regel 3–5 Werktage ab Versand aus Barcelona.",

    faqs: [
      {
        q: "Gibt es lokale Abholmöglichkeiten in Berlin?",
        a: "Nein, wir versenden ausschließlich von unserem Studio in Barcelona. Die Lieferung nach Berlin dauert in der Regel 3–5 Werktage.",
      },
      {
        q: "Fallen beim Import aus Spanien Zollgebühren an?",
        a: "Nein. Spanien und Deutschland sind EU-Mitgliedstaaten – es gibt keinen Zoll im EU-Binnenmarkt.",
      },
      {
        q: "Kann ich als Berliner Startup eine Kleinserie bestellen?",
        a: "Ja. Wir fertigen Kleinserien ohne Mindestmenge (außer dem Mindestbestellwert von 10 €) und ohne Einrichtungsgebühr. Für größere Serien erstellen wir auf Anfrage ein individuelles Angebot.",
      },
      {
        q: "Welches Material empfehlen Sie für Funktionsprototypen?",
        a: "Für erste Iterationen und Passformtests empfehlen wir PLA – günstig und maßhaltig. Für mechanisch belastete Prototypen ist PETG oder ABS die bessere Wahl.",
      },
      {
        q: "Wie sende ich meine Datei ein?",
        a: "Über unseren Online-Kalkulator – einfach STL, STEP, OBJ oder 3MF hochladen. Bei Fragen oder ohne Datei können Sie uns auch per WhatsApp schreiben.",
      },
    ],

    whatsappMsg:
      "Hallo, ich bin in Berlin und möchte 3D-Teile bestellen. Können Sie mir weiterhelfen?",

    hubLink: { to: "/de/3d-druck-service", label: "3D-Druck Service" },

    siblingLinks: [
      { to: "/de/3d-druck-muenchen", label: "München" },
      { to: "/de/3d-druck-hamburg", label: "Hamburg" },
    ],

    guideLinks: [
      { to: "/de/3d-druck-kosten", label: "3D-Druck Kosten" },
      { to: "/de/3d-druck-materialien", label: "Materialien im Überblick" },
    ],
  },

  // ── München ─────────────────────────────────────────────────────────────
  {
    slug: "/de/3d-druck-muenchen",
    lang: "de",
    locale: "de-DE",
    countryCode: "DE",
    city: "München",
    altSlug: "/3d-printing-delivery-munich",

    metaTitle: "3D-Druck mit Lieferung nach München | Dimension3D",
    metaDescription:
      "FDM 3D-Druck aus Barcelona, geliefert nach München in der Regel in 3–5 Werktagen. Angebot in 1 Stunde. PLA, PETG, ABS, ASA, TPU, Nylon. Ab 10 €, kein Zoll.",

    h1: "3D-Druck mit Lieferung nach München",
    eyebrow: "3D-Druck Service · Lieferung nach München in der Regel 3–5 Werktage",

    introText: `München ist das Herz der deutschen Ingenieurswissenschaften und ein Zentrum für Hochtechnologie, Automobilzulieferer und Luft- und Raumfahrt. Wer hier 3D-drucken lassen möchte, hat hohe Ansprüche – und genau dafür ist Dimension3D aus Barcelona ausgerüstet: ein Bambu Lab X2D mit geheizter Kammer, der technisch anspruchsvolle Materialien wie ABS, ASA, Nylon und Polycarbonat mit hoher Reproduzierbarkeit verarbeitet. Angebot in einer Stunde, Lieferung nach München in der Regel in 3–5 Werktagen, keine Zollgebühren im EU-Binnenmarkt.

Die Automobilzuliefererbranche rund um München ist eine der dichtesten in Deutschland. Im Umfeld der großen OEMs und ihrer Tier-1- und Tier-2-Lieferanten gibt es einen ständigen Bedarf an Prototypenteilen, Halterungen, Abdeckungen und Montagevorrichtungen – in kleinen Stückzahlen und oft unter Zeitdruck. FDM-Druck ist in dieser Branche längst kein Nischenthema mehr, sondern Bestandteil des Entwicklungsprozesses. Wenn interne Prototypenwerkstätten ausgelastet sind oder ein Auftrag die Mindestmenge eines traditionellen Fertigers nicht erreicht, ist ein 3D-Druck Dienstleister wie Dimension3D die logische Ergänzung.

Die Technische Universität München (TUM) zählt zu den renommiertesten Ingenieursfakultäten Europas. Studierende und Forschende aus Maschinenbau, Luft- und Raumfahrttechnik, Mechatronik und Informatik haben einen hohen Bedarf an 3D-gedruckten Teilen – für Laborversuche, studentische Projekte und Dissertationen. Auch das Münchener Ökosystem aus Forschungsinstituten und Fraunhofer-Instituten greift regelmäßig auf externe 3D-Druck-Dienstleister zurück, wenn interne Kapazitäten fehlen oder ein spezielles Material benötigt wird.

Siemens hat in München einen seiner wichtigsten deutschen Standorte. Das Unternehmen selbst setzt intern auf additive Fertigung, doch das Ökosystem an Zulieferern, Systemintegratoren und Spin-offs rund um Siemens schafft eine konstante Nachfrage nach kleinen Serien gedruckter Teile. Ähnliches gilt für den Bereich Medizintechnik, der in der Münchener Region stark vertreten ist: Gehäuse für medizinische Geräte, Vorrichtungen für die Montage und Testkörper für Zertifizierungsverfahren sind typische Anwendungsfälle.

München hat auch eine lebendige Handwerks- und Designszene. Handwerksbetriebe, Innenarchitekten und Produktdesigner nutzen FDM-Druck für Musterstücke, Modelle und individuelle Kleinserien. Im Kontext des Oktoberfests und der Münchener Eventkultur werden auch dekorative und thematische Drucke in Auftrag gegeben – von maßgefertigten Requisiten bis hin zu personalisierten Geschenkartikeln.

Die Münchener Maker- und Tech-Community wächst ebenfalls: Spaces wie das MakerSpace München im Deutschen Museum oder die verschiedenen FabLabs im Stadtgebiet sind Anlaufstellen für Hobbyisten, Selbstständige und kleine Teams, die Prototypen entwickeln. Wer über die eigenen Druckmöglichkeiten hinausgehen muss – sei es wegen der Materialanforderungen, der Druckqualität oder einfach der Kapazität – findet in Dimension3D einen kompetenten Dienstleister mit direktem Draht per WhatsApp.

Die Verbindung Barcelona–München ist gut etabliert. Als EU-Binnenlieferung fällt kein Zoll an, und die Lieferzeit beträgt in der Regel 3–5 Werktage ab Versand. Die Versandpauschale von 5,90 € macht es wirtschaftlich, mehrere Teile zu bündeln. Für größere Serien oder regelmäßige Bedarfe sprechen Sie uns gerne an – wir finden gemeinsam eine Lösung.`,

    deliveryNote:
      "Lieferung nach München in der Regel 3–5 Werktage ab Versand aus Barcelona.",

    faqs: [
      {
        q: "Können Sie technische Kunststoffe wie Nylon oder PC für Automobilanwendungen drucken?",
        a: "Ja. Unser Bambu Lab X2D hat eine beheizte Kammer, die für Nylon, PC, ABS und ASA erforderlich ist. Diese Materialien eignen sich für mechanisch und thermisch belastete Teile in technischen Anwendungen.",
      },
      {
        q: "Gibt es eine Mindestmenge für Kleinserien?",
        a: "Nein, eine Stückzahl-Mindestmenge gibt es nicht. Der Mindestbestellwert beträgt 10 €, Einrichtungsgebühren fallen keine an.",
      },
      {
        q: "Fallen beim Versand von Barcelona nach München Zollgebühren an?",
        a: "Nein. Beide Länder sind EU-Mitgliedsstaaten – der EU-Binnenmarkt kennt keinen Zoll.",
      },
      {
        q: "Wie maßhaltig sind FDM-Drucke für technische Anwendungen?",
        a: "Typische Toleranzen bei FDM liegen bei ±0,2–0,3 mm. Für Passformen empfehlen wir, bei der Konstruktion Spielraum einzuplanen oder uns vorab zu kontaktieren.",
      },
      {
        q: "Kann ich STEP-Dateien aus meiner CAD-Software direkt einsenden?",
        a: "Ja, STEP ist eines unserer bevorzugten Formate, da es exakte Geometrien ohne Triangulierungsfehler überträgt. Daneben akzeptieren wir STL, OBJ und 3MF.",
      },
    ],

    whatsappMsg:
      "Hallo, ich bin in München und möchte 3D-Teile bestellen. Können Sie mir weiterhelfen?",

    hubLink: { to: "/de/3d-druck-service", label: "3D-Druck Service" },

    siblingLinks: [
      { to: "/de/3d-druck-berlin", label: "Berlin" },
      { to: "/de/3d-druck-hamburg", label: "Hamburg" },
    ],

    guideLinks: [
      { to: "/de/3d-druck-kosten", label: "3D-Druck Kosten" },
      { to: "/de/3d-druck-materialien", label: "Materialien im Überblick" },
    ],
  },

  // ── Hamburg ──────────────────────────────────────────────────────────────
  {
    slug: "/de/3d-druck-hamburg",
    lang: "de",
    locale: "de-DE",
    countryCode: "DE",
    city: "Hamburg",
    altSlug: "/3d-printing-delivery-hamburg",

    metaTitle: "3D-Druck mit Lieferung nach Hamburg | Dimension3D",
    metaDescription:
      "FDM 3D-Druck aus Barcelona, geliefert nach Hamburg in der Regel in 3–5 Werktagen. Angebot in 1 Stunde. PLA, PETG, ABS, ASA, TPU, Nylon. Ab 10 €, kein Zoll.",

    h1: "3D-Druck mit Lieferung nach Hamburg",
    eyebrow: "3D-Druck Service · Lieferung nach Hamburg in der Regel 3–5 Werktage",

    introText: `Hamburg ist Deutschlands Tor zur Welt – und mit seiner starken Industrie in Luft- und Raumfahrt, maritimer Technik und Logistik einer der anspruchsvollsten Märkte für technischen 3D-Druck. Dimension3D aus Barcelona beliefert Hamburg per EU-Standardversand: kein Zoll, Versandpauschale 5,90 €, Lieferung in der Regel 3–5 Werktage ab Versand. Angebot in einer Stunde an Werktagen.

Der Hamburger Hafen ist der drittgrößte in Europa und ein Knotenpunkt für die maritime Industrie. Schiffbau, Hafentechnik und die dazugehörigen Zulieferbetriebe haben einen kontinuierlichen Bedarf an Sonderteilen, Halterungen und Montagevorrichtungen. Wenn ein Originalteil nicht mehr beschaffbar ist oder eine Sonderanfertigung in kleiner Stückzahl benötigt wird, ist FDM-Druck in chemisch- und feuchtigkeitsbeständigen Materialien wie PETG oder ASA eine wirtschaftliche Option. Die Möglichkeit, ein Teil in wenigen Tagen zu erhalten, ohne Werkzeugkosten oder Mindestmengen zu zahlen, ist für viele maritime Betriebe attraktiv.

Die Luft- und Raumfahrtindustrie hat in Hamburg-Finkenwerder und im Umland eine starke Präsenz. Das gesamte Ökosystem aus Systemintegratoren, Dienstleistern und Zulieferern, das sich rund um die Luft- und Raumfahrt entwickelt hat, schafft eine hohe Nachfrage nach präzisen Kunststoffteilen für Testvorrichtungen, Schulungsmodelle und Produktionsunterstützung. Obwohl Teile, die direkt in zertifizierte Luftfahrzeuge verbaut werden, strengen Zertifizierungsanforderungen unterliegen, gibt es im Before- und Aftermarket, in Forschungsabteilungen und in Werkzeugbau und Schulung einen breiten Einsatzbereich für FDM-Teile.

HafenCity ist eines der ambitioniertesten Stadtentwicklungsprojekte Europas und hat sich zum Magnet für Technologie-Startups und Digitalunternehmen entwickelt. Die dort ansässigen jungen Unternehmen – von Logistik-Tech über Greentech bis hin zu Hardwareprodukten – haben ähnliche Anforderungen wie ihre Berliner Pendants: schnelle Prototypen, kleine Serien, kein bürokratischer Overhead. Dimension3D bietet genau das: Online bestellen, Angebot in einer Stunde, Produktion und Versand ohne Formular-Marathon.

Die Hamburger Hochschullandschaft ist breit aufgestellt. Die Technische Universität Hamburg (TUHH) mit ihren starken Studiengängen in Maschinenbau, Elektrotechnik und Verfahrenstechnik ist ein wichtiger Impulsgeber für Ingenieursprojekte, die auf 3D-Druck angewiesen sind. Die Hochschule für Angewandte Wissenschaften Hamburg (HAW) ist bekannt für praxisnahe Produktdesign- und Ingenieurstudiengänge – auch hier werden regelmäßig externe 3D-Druck-Kapazitäten genutzt, wenn campuseigene Drucker ausgelastet sind oder spezielle Materialien gefragt sind.

Hamburg hat eine ausgeprägte Handwerks- und Designtradition. Die Designbranche – von Interaktionsdesign über Produktdesign bis hin zu Ausstellungsgestaltung – nutzt FDM-Modelle als Kommunikationsmittel in Kundenpräsentationen und als Testträger für Ergonomiestudien. In der Musikbranche, einem weiteren Hamburger Markenzeichen (Reeperbahn-Festival, Elbphilharmonie-Umfeld), werden gelegentlich individuelle Halterungen, Gehäuse für Klanginstallationen oder Bühnenrequisiten gedruckt.

Praktisch: Barcelona und Hamburg liegen beide in der EU. Für Sie als Hamburger Besteller bedeutet das, dass keine Zolldokumente notwendig sind, keine unerwarteten Importgebühren anfallen und der Versand mit denselben Standardträgern abgewickelt wird wie eine nationale Lieferung – in der Regel 3–5 Werktage. Die Versandpauschale von 5,90 € macht Einzelbestellungen wie auch größere Sammelbestellungen gleichermaßen attraktiv. Bei Fragen schreiben Sie uns per WhatsApp auf Deutsch.`,

    deliveryNote:
      "Lieferung nach Hamburg in der Regel 3–5 Werktage ab Versand aus Barcelona.",

    faqs: [
      {
        q: "Können Sie feuchtigkeitsbeständige Materialien für maritime Anwendungen drucken?",
        a: "Ja. PETG und ASA sind feuchtigkeitsbeständig und eignen sich gut für Außen- und Feuchtraumanwendungen. ASA bietet zusätzlich gute UV-Stabilität.",
      },
      {
        q: "Gibt es Zollgebühren beim Versand von Barcelona nach Hamburg?",
        a: "Nein. Beide Länder sind Mitglieder des EU-Binnenmarkts – es fallen keine Zollgebühren an.",
      },
      {
        q: "Wie bestelle ich ohne vorhandene CAD-Datei?",
        a: "Schicken Sie uns ein Foto, eine Skizze oder eine Beschreibung per WhatsApp. Wir schauen gemeinsam, ob und wie wir das Teil umsetzen können.",
      },
      {
        q: "Können Sie Kleinserien für einen Hamburger Startup liefern?",
        a: "Ja. Wir haben keine Stückzahl-Mindestmenge, nur einen Mindestbestellwert von 10 €. Für größere Serien erstellen wir auf Anfrage individuelle Angebote.",
      },
      {
        q: "Welches Format sollte ich für technische Zeichnungen verwenden?",
        a: "STEP-Dateien aus Ihrem CAD-System sind ideal. Alternativ nehmen wir STL, OBJ und 3MF entgegen.",
      },
    ],

    whatsappMsg:
      "Hallo, ich bin in Hamburg und möchte 3D-Teile bestellen. Können Sie mir weiterhelfen?",

    hubLink: { to: "/de/3d-druck-service", label: "3D-Druck Service" },

    siblingLinks: [
      { to: "/de/3d-druck-berlin", label: "Berlin" },
      { to: "/de/3d-druck-muenchen", label: "München" },
    ],

    guideLinks: [
      { to: "/de/3d-druck-kosten", label: "3D-Druck Kosten" },
      { to: "/de/3d-druck-materialien", label: "Materialien im Überblick" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------

export const DE_GUIDES: IntlGuideContent[] = [
  // ── Kosten ───────────────────────────────────────────────────────────────
  {
    slug: "/de/3d-druck-kosten",
    lang: "de",
    locale: "de-DE",
    topic: "price",

    metaTitle: "3D-Druck Kosten: Was kostet ein 3D-Druck? | Dimension3D",
    metaDescription:
      "3D-Druck Kosten erklärt: Material, Druckzeit, Nachbearbeitung. Drei Rechenbeispiele mit echten Zahlen. Angebot in 1 Stunde bei Dimension3D ab 10 €.",

    h1: "3D-Druck Kosten: Was kostet ein 3D-Druck wirklich?",

    intro:
      "Die 3D-Druck Kosten hängen von drei Hauptfaktoren ab: Materialmenge, Druckdauer und Materialkategorie. Wer diese Stellschrauben versteht, kann seinen Auftrag gezielt optimieren – oder einfach einschätzen, ob ein Angebot realistisch ist. Dieser Leitfaden erklärt die Kalkulation transparent und zeigt drei konkrete Rechenbeispiele.",

    sections: [
      {
        heading: "Die Kostentreiber im FDM-Druck",
        body: `Beim FDM-Druck (Fused Deposition Modeling) entstehen Kosten in erster Linie durch zwei Komponenten: das verbrauchte Filament und die belegte Maschinenzeit. Hinzu kommen, wenn gewünscht, Nachbearbeitungsschritte wie Stützstruktur entfernen, Schleifen oder Lackieren – diese sind in der Regel separat zu kalkulieren und werden auf Anfrage angeboten.

**Materialkosten** ergeben sich aus dem Gewicht des gedruckten Teils multipliziert mit dem Materialpreis pro Gramm. Hochwertige Technische Filamente wie Nylon oder Polycarbonat kosten mehr als Standardmaterialien wie PLA oder PETG. Bei Dimension3D berechnen wir einen materialspezifischen Multiplikator: PLA (1,0), PETG (1,1), ABS (1,3), Nylon (1,4). Das heißt, ein Nylon-Teil kostet ceteris paribus ca. 40 % mehr als dasselbe Teil in PLA.

**Maschinenzeit** schlägt ebenfalls zu Buche. Kurze Druckjobs (unter 3 Stunden) werden mit einem höheren Stundensatz berechnet, da die Rüstzeit einen größeren Anteil ausmacht. Bei längeren Jobs sinkt der effektive Stundensatz. Bei uns gilt: 0–3 Stunden werden mit 4,95 €/h angesetzt, 3–8 Stunden mit 3,85 €/h.

**Mindestbestellwert und Einrichtungsgebühr**: Der Mindestbestellwert liegt bei 10 €, eine Einrichtungsgebühr gibt es nicht. Das bedeutet, dass sehr kleine Teile (unter dem Mindestbetrag kalkuliert) auf 10 € angehoben werden.`,
      },
      {
        heading: "So berechnet sich Ihr Angebot",
        body: `Die Grundformel lautet:

**Preis = Gewicht (g) × 0,055 × Materialmultiplikator + Druckzeit (h) × Stundensatz**

Der Stundensatz beträgt 4,95 €/h für die ersten 3 Stunden und 3,85 €/h für Stunden darüber hinaus bis 8 Stunden. Das Ergebnis wird auf volle Euro oder 50-Cent-Schritte gerundet und niemals unter 10 € angesetzt.

Konkret bedeutet das: Je leichter und kompakter Ihr Teil ist, desto stärker bestimmt die Druckzeit den Preis. Bei großen, massiven Teilen dominiert das Materialgewicht. Durch die Wahl eines geringeren Infill-Anteils (z. B. 15 % statt 40 %) lässt sich bei Nicht-Funktionsteilen Material sparen, ohne die äußere Geometrie zu verändern.

Für Bestellungen bis 100 € erhalten Sie im Kalkulator auf unserer Website einen Sofortpreis. Bei größeren oder besonders komplexen Aufträgen erstellen wir ein manuelles Angebot und melden uns in der Regel innerhalb einer Stunde (an Werktagen, Barceloner Zeit).`,
      },
      {
        heading: "Drei Rechenbeispiele",
        body: `**Beispiel 1 – Kleines Dekorationsobjekt in PLA (30 g, 0,5 h)**
Materialkosten: 30 × 0,055 × 1,0 = 1,65 €
Maschinenzeit: 0,5 × 4,95 = 2,47 €
Summe: 4,12 € → Mindestbestellwert greift → **10,00 €**

**Beispiel 2 – Funktionshalterung in PETG (80 g, 2 h)**
Materialkosten: 80 × 0,055 × 1,1 = 4,84 €
Maschinenzeit: 2 × 4,95 = 9,90 €
Summe: 14,74 € → gerundet **ca. 15,00 €**

**Beispiel 3 – Elektronikgehäuse in ABS (200 g, 5 h)**
Materialkosten: 200 × 0,055 × 1,3 = 14,30 €
Maschinenzeit: 3 × 4,95 + 2 × 3,85 = 14,85 + 7,70 = 22,55 €
Summe: 36,85 € → gerundet **ca. 37,00 €**

Diese Beispiele verdeutlichen die Skalierung: Ein kleines Teil kommt kaum unter den Mindestbestellwert. Ein mittelgroßes technisches Teil liegt typischerweise im Bereich 15–30 €. Große, materialdichte Gehäuse in technischen Polymeren können 35–60 € erreichen.`,
      },
      {
        heading: "Tipps zur Kostensenkung",
        body: `**Infill reduzieren**: Für sichtbare Modelle, Gehäuse ohne mechanische Belastung oder Prototypen zur Passformprüfung reicht ein Infill von 10–20 %. Das spart Filament und Druckzeit.

**Material dem Zweck anpassen**: Für einen einfachen Prototypen brauchen Sie kein ABS. PLA kostet weniger, ist aber für Passformtests und Sichtmodelle in der Mehrzahl der Fälle ausreichend.

**Teile bündeln**: Die Versandpauschale von 5,90 € fällt einmal pro Bestellung an. Wenn Sie mehrere Teile gleichzeitig bestellen, teilt sich die Pauschale effektiv auf alle Teile auf.

**Wandstärke optimieren**: Dünnere Wände sparen Filament, aber unterschreiten Sie nicht 1,2 mm (zwei Perimeter) – darunter leidet die Stabilität. Details zu Wandstärken und Konstruktionsregeln finden Sie in unserem Leitfaden zur Dateivorbereitung.

**Ausrichtung überdenken**: Die Druckorientierung beeinflusst Stützstrukturen und damit Materialverbrauch. Wenn Sie bei der Konstruktion Stützstrukturen durch geeignete Bauteilausrichtung oder Chamfers (Fasen statt Überhänge) vermeiden können, wirkt sich das positiv auf den Preis aus.`,
      },
      {
        heading: "Versand und Gesamtkosten nach Deutschland",
        body: `Zum Artikelpreis kommt die Versandpauschale von 5,90 €. Da Spanien und Deutschland beide dem EU-Binnenmarkt angehören, fallen keine Zollgebühren und keine Importabgaben an. Die Mehrwertsteuer wird nach den geltenden EU-Regeln ausgewiesen.

Wenn Sie eine grobe Kostenschätzung benötigen, bevor Sie eine CAD-Datei erstellen, können Sie uns auch einfach eine Beschreibung oder eine Skizze schicken – wir geben Ihnen eine unverbindliche Einschätzung per WhatsApp. Für verbindliche Angebote nutzen Sie bitte den Kalkulator auf unserer Website.`,
      },
    ],

    workedExamples: [
      {
        name: "Kleines Dekorationsobjekt",
        grams: 30,
        hours: 0.5,
        material: "PLA",
        price: "10,00 €",
        description:
          "30 g × 0,055 × 1,0 + 0,5 × 4,95 = 4,12 € → Mindestbestellwert 10 €",
      },
      {
        name: "Funktionshalterung",
        grams: 80,
        hours: 2,
        material: "PETG",
        price: "ca. 15,00 €",
        description:
          "80 g × 0,055 × 1,1 + 2 × 4,95 = 4,84 + 9,90 = 14,74 € → ca. 15 €",
      },
      {
        name: "Elektronikgehäuse",
        grams: 200,
        hours: 5,
        material: "ABS",
        price: "ca. 37,00 €",
        description:
          "200 g × 0,055 × 1,3 + 3 × 4,95 + 2 × 3,85 = 14,30 + 14,85 + 7,70 = 36,85 € → ca. 37 €",
      },
    ],

    faqs: [
      {
        q: "Gibt es eine Einrichtungsgebühr oder Mindestmenge?",
        a: "Es gibt keine Einrichtungsgebühr. Der Mindestbestellwert beträgt 10 €.",
      },
      {
        q: "Wie bekomme ich ein genaues Angebot?",
        a: "Laden Sie Ihre Datei im Kalkulator hoch. Bestellungen bis 100 € erhalten einen Sofortpreis; darüber hinaus melden wir uns in der Regel innerhalb einer Stunde mit einem manuellen Angebot.",
      },
      {
        q: "Warum ist Nylon teurer als PLA?",
        a: "Nylon-Filament ist teurer in der Anschaffung, erfordert höhere Drucktemperaturen, eine beheizte Kammer und ist fehleranfälliger in der Verarbeitung. Diese Mehrkosten spiegeln sich im Materialmultiplikator wider.",
      },
      {
        q: "Fallen Zollkosten beim Versand nach Deutschland an?",
        a: "Nein. Als EU-Binnenlieferung fällt kein Zoll an.",
      },
      {
        q: "Kann ich den Preis durch Infill-Änderung beeinflussen?",
        a: "Ja. Teile mit geringerem Infill verbrauchen weniger Material und drucken schneller. Für Prototypen und Sichtmodelle ist ein niedrigerer Infill oft ausreichend. Bitte geben Sie Ihre Anforderungen im Kommentarfeld an.",
      },
    ],

    hubLink: { to: "/de/3d-druck-service", label: "3D-Druck Service" },

    cityLinks: [
      { to: "/de/3d-druck-berlin", label: "Lieferung nach Berlin" },
      { to: "/de/3d-druck-muenchen", label: "Lieferung nach München" },
    ],
  },

  // ── Datei vorbereiten ────────────────────────────────────────────────────
  {
    slug: "/de/3d-druck-datei-vorbereiten",
    lang: "de",
    locale: "de-DE",
    topic: "file-prep",

    metaTitle: "3D-Druck Datei vorbereiten: STL, STEP & Co. | Dimension3D",
    metaDescription:
      "Wie Sie Ihre 3D-Druck Datei richtig vorbereiten: Formate, Wandstärken, Toleranzen, Überhänge und häufige Fehler. Für FDM-Druck mit Dimension3D.",

    h1: "3D-Druck Datei vorbereiten: So gelingt der Upload",

    intro:
      "Eine gut vorbereitete Datei ist die Grundlage für ein gutes Druckergebnis. Die häufigsten Probleme – fehlerhafte Geometrien, zu dünne Wände, unrealistische Toleranzerwartungen – lassen sich mit etwas Vorwissen vermeiden. Dieser Leitfaden erklärt die wichtigsten Grundregeln für FDM-Drucke, unabhängig davon, welche CAD-Software Sie verwenden.",

    sections: [
      {
        heading: "Welche Dateiformate werden akzeptiert?",
        body: `Wir akzeptieren vier Formate: **STL**, **STEP**, **OBJ** und **3MF**.

**STL** (Standard Tessellation Language) ist das weitverbreitetste Format im 3D-Druck. Fast jede CAD-Software kann STL exportieren. Wichtig: Exportieren Sie mit ausreichend hoher Auflösung (empfohlen: Winkeltoleranz ≤ 0,5°, lineare Toleranz ≤ 0,1 mm), damit Krümmungen glatt dargestellt werden.

**STEP** ist das bevorzugte Format für technische Teile. Es speichert exakte Geometrien ohne Triangulierungsfehler und ermöglicht es uns, die Datei bei Bedarf zu skalieren oder kleinere Anpassungen vorzunehmen, ohne Qualitätsverluste. Wenn Maßhaltigkeit für Sie kritisch ist, verwenden Sie STEP.

**OBJ** wird meist aus 3D-Sculpting-Programmen wie ZBrush oder Blender exportiert. Es eignet sich für organische Formen und Kunstobjekte, ist aber für technische Teile weniger ideal als STEP.

**3MF** ist ein neueres Format, das neben der Geometrie auch Farb- und Materialinformationen speichern kann. Viele moderne Slicer-Programme verwenden es intern. Es ist eine gute Alternative zu STL.

Haben Sie keine CAD-Datei? Kein Problem – schicken Sie uns ein Foto, eine Handskizze oder eine technische Zeichnung per WhatsApp. Wir prüfen, ob wir die Geometrie aus Ihren Unterlagen ableiten oder Ihnen bei der Erstellung helfen können.`,
      },
      {
        heading: "Wandstärken: Minimum und Empfehlungen",
        body: `**Mindest-Wandstärke für FDM**: In der Regel empfehlen wir mindestens **1,2 mm** für tragende Wände (entspricht zwei Perimeterlinien bei einer Düsengröße von 0,4 mm) und mindestens **0,8 mm** für rein sichtbare, nicht belastete Bereiche. Darunter liegende Wände können im Druck fehlerhafte oder instabile Ergebnisse liefern.

**Praktische Faustregel**: Wenn Sie mit dem Daumen auf Ihre Wand drücken würden und erwarten, dass sie hält – dann ist 1,5–2 mm die richtige Wahl. Wände unter 1 mm sind für FDM-Druck grundsätzlich problematisch.

**Feine Details**: Kleine Vorsprünge, Gravuren und Textelemente unter 0,5 mm werden oft nicht korrekt reproduziert. Schrift und Logos sollten mindestens 0,6 mm Höhe und 0,5 mm Breite haben, um klar erkennbar zu sein.

**Innengeometrien**: Bohrungen mit weniger als 1,5 mm Durchmesser werden im FDM-Druck häufig geschlossen oder verformt. Für präzise Passlöcher empfehlen wir, 0,1–0,2 mm Spielraum zur Nennmaß-Seite hin einzuplanen und das Loch nach dem Druck gegebenenfalls aufzubohren.`,
      },
      {
        heading: "Toleranzen und Passungen",
        body: `FDM-Druck ist kein Präzisionsverfahren im Sinne der mechanischen Bearbeitung. Typische Maßabweichungen liegen bei **±0,2–0,3 mm** in X/Y-Richtung und ±0,1–0,2 mm in Z-Richtung. Diese Werte können je nach Geometrie, Material und Druckgeschwindigkeit variieren.

**Passungen konstruieren**: Wenn zwei Teile aufeinandergesteckt oder ineinander geschraubt werden sollen, planen Sie folgendes ein:
- Schiebepassung: 0,2–0,3 mm Spielraum pro Seite
- Presspassung: 0,0–0,1 mm Spielraum
- Gewindeeinsätze (Helicoils): Empfohlen für häufig geöffnete Schraubenverbindungen in Kunststoff

**Schrumpfung**: Beim Abkühlen nach dem Druck schrumpfen Teile leicht. Bei ABS und Nylon ist dieser Effekt ausgeprägter als bei PLA oder PETG. Für größere Teile (über 100 mm Kantenlänge) in ABS oder Nylon empfehlen wir, die kritischen Maße um 0,3–0,5 % zu korrigieren.

**Erster Druck als Passformtest**: Bei komplexen mechanischen Baugruppen empfiehlt es sich, zunächst einen kleinen Ausschnitt (z. B. ein Passstück) zu drucken und zu prüfen, bevor das gesamte Teil gedruckt wird.`,
      },
      {
        heading: "Überhänge, Stützstrukturen und Ausrichtung",
        body: `**Überhänge**: FDM-Drucker benötigen für Überhänge über ca. 45° zur Horizontalen eine Stützstruktur, die nach dem Druck entfernt wird. Stützstrukturen hinterlassen Spuren auf der Oberfläche und erhöhen den Materialverbrauch. Wenn möglich, konstruieren Sie Ihr Teil so, dass Überhänge vermieden oder durch Fasen (Chamfer, 45°) und Verjüngungen ersetzt werden.

**Brücken**: Horizontale Verbindungen (Brücken) zwischen zwei Auflagepunkten können ohne Stützstruktur gedruckt werden, wenn die Brückenbreite unter ca. 50 mm liegt. Darüber sollten Sie eine Stützstruktur einplanen oder die Geometrie anpassen.

**Druckorientierung**: Die Ausrichtung des Teils auf dem Druckbett hat großen Einfluss auf Festigkeit, Oberflächenqualität und Nachbearbeitungsaufwand. FDM-Teile sind in Z-Richtung (Schichtrichtung) schwächer als in X/Y-Richtung. Wenn Ihr Teil eine Vorzugslastrichtung hat, orientieren Sie es so, dass diese Kraft quer zur Schichtrichtung verläuft.

**Flache Basis**: Teile mit kleiner Auflagefläche und hohem Schwerpunkt können während des Drucks kippen. Wenn Sie eine solche Geometrie konstruieren, erwägen Sie, eine breite Basis oder temporäre Verbindungsstege in Ihre Datei einzubauen, die Sie nach dem Druck absägen.`,
      },
      {
        heading: "Häufige Fehler und wie man sie vermeidet",
        body: `**Nicht-wasserdichte Geometrien (Non-manifold)**: STL-Dateien müssen „wasserdicht" sein – jede Kante muss von genau zwei Flächen begrenzt sein. Öffnungen, doppelte Flächen oder fehlende Polygone führen zu Fehlern im Slicer. Prüfen Sie Ihre Datei mit Tools wie Meshmixer (kostenlos), PrusaSlicer oder netfabb. Die meisten CAD-Programme bieten eine „Modell reparieren"-Funktion an.

**Falsche Einheiten**: Stellen Sie sicher, dass Ihre Datei in Millimetern exportiert wird. Inches-Exporte werden um den Faktor 25,4 zu groß oder zu klein. Prüfen Sie die Abmessungen nach dem Export.

**Zu hohe Auflösung in STL**: STL-Dateien mit extrem vielen Dreiecken (über 10 Millionen) können Slicer-Software überlasten, ohne dass sich die Druckqualität verbessert. Exportieren Sie mit moderater Auflösung (0,1–0,01 mm lineare Abweichung).

**Zu kleine Teile**: Teile unter 5 mm in der kleinsten Dimension sind für FDM-Druck kritisch. Kleine, freistehende Elemente können sich während des Drucks lösen. Prüfen Sie, ob das Teil mit FDM sinnvoll hergestellt werden kann – bei Bedarf beraten wir Sie.`,
      },
    ],

    faqs: [
      {
        q: "Kann ich mehrere Teile in einer STL-Datei schicken?",
        a: "Ja, aber empfohlen ist eine Datei pro Bauteil, damit wir Stückzahlen und Materialien flexibel zuordnen können. Bei Baugruppen bündeln Sie die Teile als separate Dateien in einer Bestellung.",
      },
      {
        q: "Muss ich die Druckorientierung vorgeben?",
        a: "Nein, wir wählen die optimale Ausrichtung für den Druck. Wenn Sie eine bestimmte Orientierung wünschen – z. B. für Oberflächenqualität an einer Sichtseite –, geben Sie das bitte im Kommentarfeld an.",
      },
      {
        q: "Was passiert, wenn meine Datei fehlerhaft ist?",
        a: "Wir prüfen jede Datei vor dem Druck. Bei behebbbaren Fehlern (z. B. kleinen Lücken) reparieren wir die Datei und informieren Sie. Bei größeren Problemen kontaktieren wir Sie vor der Produktion.",
      },
      {
        q: "Welche CAD-Software empfehlen Sie für Einsteiger?",
        a: "Für technische Teile: Fusion 360 (kostenlos für Privatnutzer und Startups), FreeCAD (Open Source). Für organische Formen: Blender (Open Source). Für sehr einfache Teile: TinkerCAD (browserbasiert, kostenlos).",
      },
      {
        q: "Kann ich ein Teil in mehreren Materialien drucken lassen?",
        a: "Unser Drucker kann in einer Druckjob-Sitzung ein Material verwenden. Wenn Sie ein Teil aus mehreren Materialien benötigen, fertigen wir es als separate Komponenten, die Sie anschließend verbinden.",
      },
    ],

    hubLink: { to: "/de/3d-druck-service", label: "3D-Druck Service" },

    cityLinks: [
      { to: "/de/3d-druck-berlin", label: "Lieferung nach Berlin" },
      { to: "/de/3d-druck-hamburg", label: "Lieferung nach Hamburg" },
    ],
  },

  // ── Materialien ──────────────────────────────────────────────────────────
  {
    slug: "/de/3d-druck-materialien",
    lang: "de",
    locale: "de-DE",
    topic: "materials",

    metaTitle: "3D-Druck Materialien im Vergleich: PLA, PETG, ABS & mehr",
    metaDescription:
      "PLA, PETG, ABS, ASA, TPU, Nylon, PC, CFK-Composites im Vergleich: Eigenschaften, Anwendungen, Vor- und Nachteile. Welches Material für Ihren 3D-Druck?",

    h1: "3D-Druck Materialien: Welches Filament ist das richtige für Sie?",

    intro:
      "Die Materialwahl ist eine der wichtigsten Entscheidungen beim 3D drucken lassen – sie bestimmt Festigkeit, Temperaturbeständigkeit, Flexibilität und Kosten des fertigen Teils. Dieser Leitfaden stellt die gängigsten FDM-Filamente vor, erklärt ihre Eigenschaften und hilft Ihnen, das passende Material für Ihren Anwendungsfall zu wählen.",

    sections: [
      {
        heading: "PLA – Der Allrounder für Prototypen und Modelle",
        body: `**Polylactid (PLA)** ist das meistverwendete FDM-Filament und der Einstieg in die Welt des 3D-Drucks. Es basiert auf nachwachsenden Rohstoffen (meist Maisstärke), ist leicht zu verarbeiten und liefert maßgenaue Ergebnisse mit guter Oberflächenqualität.

**Stärken**: Günstig, maßhaltig, geringe Verzugsneigung, gute Detailwiedergabe, biologisch abbaubar unter industriellen Bedingungen.

**Schwächen**: Begrenzte Wärmebeständigkeit (Erweichung ab ca. 55–60 °C), nicht UV-stabil, nicht feuchtigkeitsbeständig, spröde unter Schlagbelastung.

**Ideal für**: Prototypen, Passformmodelle, Sichtmodelle, Architekturmodelle, Dekorationsobjekte, Brettspiel-Zubehör, Lehrmodelle, Schulfiguren. PLA ist nicht geeignet für Teile, die im Fahrzeuginnenraum (Hitze), im Freien (UV) oder unter mechanischer Dauerbelastung eingesetzt werden.

**Tipp**: Wenn Sie unsicher sind und kein spezielles Anforderungsprofil haben, starten Sie mit PLA – es ist die günstigste Option und liefert in den meisten Fällen ein gutes Ergebnis.`,
      },
      {
        heading: "PETG – Zäh, chemisch beständig, vielseitig",
        body: `**Polyethylenterephthalat Glykol (PETG)** kombiniert die einfache Verarbeitung von PLA mit der besseren mechanischen Leistung von ABS. Es ist das meistempfohlene Material für funktionale Teile.

**Stärken**: Zäh (weniger spröde als PLA), gute chemische Beständigkeit, feuchtigkeitsbeständig, höhere Wärmeformbeständigkeit als PLA (bis ca. 70–80 °C), lebensmittelkontaktgeeignet (ungefärbt, bei sauberer Verarbeitung).

**Schwächen**: Leicht anfällig für Kratzer, etwas weicher als ABS, nicht UV-stabil (vergilbt bei Daueraussetzung).

**Ideal für**: Mechanische Teile, Halterungen, Behälter, Gehäuse für Elektronikkomponenten, Teile im Feuchtraum, Wasserleitungskomponenten (nicht druckführend), Lebensmittelkontaktbehälter (ungefärbt). PETG ist die erste Wahl für technische Teile, wenn keine extremen Temperaturanforderungen bestehen.`,
      },
      {
        heading: "ABS und ASA – Für Wärme und Außeneinsatz",
        body: `**Acrylnitril-Butadien-Styrol (ABS)** ist ein klassischer Ingenieurkunststoff mit guter Wärmebeständigkeit und Schlagzähigkeit. Es erfordert eine beheizte Kammer beim Drucken, um Verzug zu vermeiden – genau das bietet unser Bambu Lab X2D.

**Stärken**: Wärmeformbeständigkeit bis ca. 95–100 °C, gut nachbearbeitbar (schleifen, bohren, lackieren, acetonbasiertes Glätten), hohe Schlagzähigkeit.

**Schwächen**: UV-empfindlich (vergilbt und versprödet im Freien), Geruchsentwicklung beim Drucken, höhere Verzugsneigung ohne beheizte Kammer.

**Ideal für**: Elektronikgehäuse, Kfz-Teile (Innenraum), Ersatzteile für Elektrogeräte, Teile, die nachträglich bearbeitet oder lackiert werden sollen.

**ASA (Acrylnitril-Styrol-Acrylat)** ist die Außeneinsatz-Variante von ABS. Es bietet ähnliche mechanische Eigenschaften, aber deutlich bessere UV-Beständigkeit und Witterungsresistenz.

**Ideal für**: Outdoor-Halterungen, Schilder, Fahrzeugaußenteile, Gartengeräte-Komponenten, maritime Anwendungen. ASA ist die erste Wahl, wenn das Teil Sonnenlicht, Regen und Temperaturwechseln ausgesetzt ist.`,
      },
      {
        heading: "TPU – Flexibel und stoßdämpfend",
        body: `**Thermoplastisches Polyurethan (TPU)** ist ein flexibles Filament, das gummiartige Teile ermöglicht. Die Shore-Härte variiert je nach Hersteller; wir verwenden typischerweise Shore 95A (leicht flexibel, aber formstabil).

**Stärken**: Flexibel, stoßdämpfend, abriebfest, gute chemische Beständigkeit, beständig gegen Öle und Kraftstoffe.

**Schwächen**: Schwieriger zu drucken als PLA/PETG (erfordert Direktantrieb-Extruder), langsamer Druck erforderlich, begrenzte Maßhaltigkeit bei sehr weichen Varianten.

**Ideal für**: Dichtungen, Puffer, Griffe, Schutzhüllen, Telefon-Cases, Stoßdämpfer-Einsätze, flexible Scharniere, Kabeldurchführungen. TPU eignet sich überall dort, wo das Teil komprimiert, verdreht oder gestaucht werden muss, ohne zu brechen.`,
      },
      {
        heading: "Nylon, Polycarbonat und CFK-Composites – Technische Hochleistungswerkstoffe",
        body: `**Nylon (PA12/PA6)** ist der Standard-Ingenieurkunststoff für mechanisch hochbelastete Teile. Es ist zäh, abriebfest und ermöglicht Wandstärken, die unter vergleichbaren Bedingungen aus anderen Materialien brechen würden.

**Stärken**: Hohe Zähigkeit und Schlagfestigkeit, exzellente Abriebfestigkeit, gute chemische Beständigkeit, selbstschmierend (ideal für Zahnräder und Lager).

**Schwächen**: Hygroskopisch (zieht Feuchtigkeit an, was die Druckqualität und mechanische Eigenschaften beeinflusst – Filament muss trocken gelagert werden), höherer Preis, erfordert beheizte Kammer.

**Ideal für**: Zahnräder, Lager, Clip-Verbindungen, Scharnierpunkte, tragende Funktionsteile, Teile mit Gleitreibung.

**Polycarbonat (PC)** ist eines der steifsten und schlagzähesten FDM-Materialien. Es hält Temperaturen bis ca. 110–120 °C stand und ist chemisch beständig.

**Stärken**: Hervorragende Schlagzähigkeit auch bei tiefen Temperaturen, hohe Wärmeformbeständigkeit, transparent erhältlich.

**Schwächen**: Erfordert sehr hohe Drucktemperaturen und eine präzise Temperaturkontrolle, UV-empfindlich, teuer.

**Ideal für**: Sicherheitskomponenten, Gehäuse für Industrieelektronik, transparente Abdeckungen, Bauteile mit extremen Temperaturanforderungen.

**Kohlefaserverstärkte Composites (CFK-Filament)** kombinieren einen Basiskunststoff (meist PA oder PETG) mit kurzen Kohlefasern. Das Ergebnis ist eine deutlich höhere Steifigkeit bei geringerem Gewicht im Vergleich zum unverstärkten Material.

**Ideal für**: Leichtbauteile, Drohnenkomponenten, Halterungen mit hohen Steifigkeitsanforderungen, strukturelle Gehäuse. Hinweis: CFK-Filament ist abrasiv und erfordert gehärtete Düsen; wir berücksichtigen das in der Kalkulation.

Wenn Sie sich bei der Materialwahl unsicher sind, schreiben Sie uns – wir beraten Sie auf Basis Ihrer Anforderungen, ohne etwas zu verkaufen, das Sie nicht brauchen.`,
      },
      {
        heading: "Materialvergleich auf einen Blick",
        body: `| Material | Wärme | Zähigkeit | UV | Flexibel | Kosten |
|----------|-------|-----------|-----|----------|--------|
| PLA | ★★☆ | ★☆☆ | ★★☆ | Nein | € |
| PETG | ★★★ | ★★★ | ★★☆ | Nein | €€ |
| ABS | ★★★★ | ★★★ | ★★☆ | Nein | €€ |
| ASA | ★★★★ | ★★★ | ★★★★★ | Nein | €€ |
| TPU | ★★★ | ★★★★ | ★★☆ | Ja | €€ |
| Nylon | ★★★★ | ★★★★★ | ★★☆ | Nein | €€€ |
| PC | ★★★★★ | ★★★★★ | ★★☆ | Nein | €€€ |
| CFK-Composite | ★★★★ | ★★★★ | ★★☆ | Nein | €€€€ |

*Richtwert; tatsächliche Eigenschaften variieren je nach Hersteller und Druckparametern.*`,
      },
    ],

    faqs: [
      {
        q: "Welches Material empfehlen Sie für den Außeneinsatz?",
        a: "ASA ist die erste Wahl für Outdoor-Anwendungen: UV-stabil, witterungsbeständig und ähnlich mechanisch leistungsfähig wie ABS.",
      },
      {
        q: "Kann ich mit PETG Lebensmittel in Kontakt bringen?",
        a: "Ungefärbtes PETG gilt unter bestimmten Bedingungen als lebensmittelkontaktgeeignet, aber FDM-Drucke haben eine raue Oberfläche mit Mikroporen, in denen sich Bakterien ansiedeln können. Für den direkten, dauerhaften Lebensmittelkontakt empfehlen wir eine zusätzliche Beschichtung oder alternative Fertigungsverfahren.",
      },
      {
        q: "Was ist der Unterschied zwischen Nylon und PETG für Zahnräder?",
        a: "Nylon hat eine deutlich bessere Abriebfestigkeit und ist selbstschmierend – ideal für Zahnräder. PETG ist günstiger, aber unter Dauerbetrieb weniger geeignet für Gleitlageranwendungen.",
      },
      {
        q: "Warum kostet ABS mehr als PLA?",
        a: "ABS erfordert eine beheizte Kammer, höhere Drucktemperaturen und sorgfältigere Einstellungen, um Verzug zu vermeiden. Diese zusätzliche Komplexität spiegelt sich im Preis wider.",
      },
      {
        q: "Können Sie kohlefaserverstärkte Materialien drucken?",
        a: "Ja. Unser Bambu Lab X2D ist für CFK-Filamente ausgestattet. CFK-Composites bieten höhere Steifigkeit und geringeres Gewicht als unverstärkte Materialien.",
      },
    ],

    hubLink: { to: "/de/3d-druck-service", label: "3D-Druck Service" },

    cityLinks: [
      { to: "/de/3d-druck-berlin", label: "Lieferung nach Berlin" },
      { to: "/de/3d-druck-muenchen", label: "Lieferung nach München" },
    ],
  },
];
