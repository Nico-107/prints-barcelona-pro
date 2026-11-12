// Single source of truth for all customer reviews.
// Sara's Spanish original is a TODO — Nico must paste it into originalEs below.
// SARA_ES_ORIGINAL slot was empty when this file was created.

export interface Review {
  name: string;
  originalLang: string;
  original: string;
  translations: Record<string, string>;
  // 20-word-or-fewer excerpt (verbatim substring) for the V2 hero quote.
  excerpt: Record<string, string>;
}

export const REVIEWS: Review[] = [
  {
    name: "Sara Dospassos",
    originalLang: "en",
    original:
      "What an amazing place! Mikolaj helped me with an urgent order on a Friday afternoon, and it was ready the very next morning. He not only delivered my pieces with a professional finish, but he even came over to where I was to hand them to me. Absolutely fantastic.",
    translations: {
      es: "¡Un lugar increíble! Mikolaj me ayudó con un pedido urgente un viernes por la tarde y estuvo listo a la mañana siguiente. No solo entregó mis piezas con un acabado profesional, sino que incluso vino hasta donde estaba yo para entregármelas en persona. Absolutamente fantástico.",
      ca: "Un lloc increïble! En Mikolaj em va ajudar amb una comanda urgent un divendres a la tarda i estava llesta l'endemà al matí. No només va lliurar les meves peces amb un acabat professional, sinó que fins i tot va venir fins on jo era per entregar-les-me en persona. Absolutament fantàstic.",
      en: "What an amazing place! Mikolaj helped me with an urgent order on a Friday afternoon, and it was ready the very next morning. He not only delivered my pieces with a professional finish, but he even came over to where I was to hand them to me. Absolutely fantastic.",
      de: "Ein unglaublicher Ort! Mikolaj half mir bei einer dringenden Bestellung an einem Freitagabend, und sie war bereits am nächsten Morgen fertig. Er lieferte meine Teile nicht nur mit professionellem Finish, sondern kam sogar persönlich zu mir, um sie abzugeben. Absolut fantastisch.",
      fr: "Un endroit incroyable ! Mikolaj m'a aidée avec une commande urgente un vendredi après-midi, et elle était prête dès le lendemain matin. Il a non seulement livré mes pièces avec une finition professionnelle, mais il s'est même déplacé jusqu'à moi pour me les remettre. Absolument fantastique.",
      it: "Un posto incredibile! Mikolaj mi ha aiutata con un ordine urgente un venerdì pomeriggio, ed era pronto la mattina dopo. Non solo ha consegnato i miei pezzi con una finitura professionale, ma si è addirittura spostato fino a me per consegnarmeli di persona. Assolutamente fantastico.",
      nl: "Een geweldige plek! Mikolaj hielp me met een spoedbestelling op een vrijdagmiddag, en het was de volgende ochtend al klaar. Hij leverde mijn onderdelen niet alleen af met een professionele afwerking, maar hij kwam zelfs naar me toe om ze persoonlijk te overhandigen. Absoluut fantastisch.",
      pt: "Um lugar incrível! Mikolaj ajudou-me com um pedido urgente numa tarde de sexta-feira, e estava pronto na manhã seguinte. Não só entregou as minhas peças com um acabamento profissional, como foi pessoalmente ter comigo para as entregar. Absolutamente fantástico.",
    },
    excerpt: {
      es: "estuvo listo a la mañana siguiente…",
      ca: "estava llesta l'endemà al matí…",
      en: "it was ready the very next morning…",
      de: "sie war bereits am nächsten Morgen fertig…",
      fr: "elle était prête dès le lendemain matin…",
      it: "era pronto la mattina dopo…",
      nl: "het was de volgende ochtend al klaar…",
      pt: "estava pronto na manhã seguinte…",
    },
  },
  {
    name: "Kirill Gromskiy",
    originalLang: "en",
    original:
      "I'm working for a construction company. We needed a special round shadow gap profile for a wall, but there was no way to buy one because nobody sells it. So we decided to make it with the help of 3D printing. It was fast, affordable, and worked perfectly.",
    translations: {
      es: "Trabajo para una empresa de construcción. Necesitábamos un perfil especial de junta de sombra redonda para una pared, pero no había forma de comprarlo porque nadie lo vende. Así que decidimos hacerlo con la ayuda de la impresión 3D. Fue rápido, asequible y funcionó perfectamente.",
      ca: "Treballo per a una empresa de construcció. Necessitàvem un perfil especial de junta de sombra rodona per a una paret, però no hi havia manera de comprar-lo perquè ningú no el ven. Vam decidir fer-lo amb l'ajuda de la impressió 3D. Va ser ràpid, assequible i va funcionar perfectament.",
      en: "I'm working for a construction company. We needed a special round shadow gap profile for a wall, but there was no way to buy one because nobody sells it. So we decided to make it with the help of 3D printing. It was fast, affordable, and worked perfectly.",
      de: "Ich arbeite für ein Bauunternehmen. Wir brauchten ein spezielles rundes Schattenfugenprofil für eine Wand, aber es war unmöglich, eines zu kaufen, da es niemand verkauft. Also entschieden wir uns, es mithilfe des 3D-Drucks herzustellen. Es war schnell, erschwinglich und hat perfekt funktioniert.",
      fr: "Je travaille pour une entreprise de construction. Nous avions besoin d'un profil de joint d'ombre rond spécial pour un mur, mais il était impossible d'en acheter car personne n'en vend. Nous avons donc décidé de le faire grâce à l'impression 3D. C'était rapide, abordable et ça a fonctionné parfaitement.",
      it: "Lavoro per un'azienda edile. Avevamo bisogno di un profilo speciale per giunzione a ombra rotonda per una parete, ma non era possibile acquistarlo perché nessuno lo vende. Abbiamo quindi deciso di realizzarlo con l'aiuto della stampa 3D. È stato veloce, conveniente e ha funzionato perfettamente.",
      nl: "Ik werk voor een bouwbedrijf. We hadden een speciaal rond schaduwvoegprofiel nodig voor een muur, maar het was onmogelijk om er een te kopen omdat niemand het verkoopt. Dus besloten we het te maken met behulp van 3D-printen. Het was snel, betaalbaar en werkte perfect.",
      pt: "Trabalho para uma empresa de construção. Precisávamos de um perfil especial de junta de sombra redonda para uma parede, mas era impossível comprá-lo porque ninguém o vende. Decidimos então fazê-lo com recurso à impressão 3D. Foi rápido, acessível e funcionou perfeitamente.",
    },
    excerpt: {
      es: "Fue rápido, asequible y funcionó perfectamente.",
      ca: "Va ser ràpid, assequible i va funcionar perfectament.",
      en: "It was fast, affordable, and worked perfectly.",
      de: "Es war schnell, erschwinglich und hat perfekt funktioniert.",
      fr: "C'était rapide, abordable et ça a fonctionné parfaitement.",
      it: "È stato veloce, conveniente e ha funzionato perfettamente.",
      nl: "Het was snel, betaalbaar en werkte perfect.",
      pt: "Foi rápido, acessível e funcionou perfeitamente.",
    },
  },
  {
    name: "Yasser Chyoukha",
    originalLang: "en",
    original:
      "I had some parts printed for a project, and in addition to the excellent service and constant support, they helped me by doing resized tests so the printed nut would fit perfectly. The price was great, and it really saved me from a tight spot.",
    translations: {
      es: "Me imprimieron unas piezas para un proyecto y, además del excelente servicio y apoyo constante, me ayudaron haciendo pruebas de ajuste para que la tuerca impresa encajara perfectamente. El precio fue muy bueno y me sacó de un apuro.",
      ca: "Em van imprimir unes peces per a un projecte i, a més del servei excel·lent i el suport constant, em van ajudar fent proves d'ajust perquè la rosca impresa encaixés perfectament. El preu va ser molt bo i em va treure d'un apuro.",
      en: "I had some parts printed for a project, and in addition to the excellent service and constant support, they helped me by doing resized tests so the printed nut would fit perfectly. The price was great, and it really saved me from a tight spot.",
      de: "Ich ließ einige Teile für ein Projekt drucken, und neben dem hervorragenden Service und der ständigen Unterstützung halfen sie mir mit Größentests, damit die gedruckte Mutter perfekt passte. Der Preis war super und hat mich wirklich aus einer Klemme gerettet.",
      fr: "J'ai fait imprimer des pièces pour un projet, et en plus de l'excellent service et du soutien constant, ils m'ont aidé en faisant des tests de redimensionnement pour que l'écrou imprimé s'adapte parfaitement. Le prix était excellent et m'a vraiment tiré d'embarras.",
      it: "Ho fatto stampare alcune parti per un progetto e, oltre all'eccellente servizio e al supporto costante, mi hanno aiutato eseguendo test di ridimensionamento affinché il dado stampato si adattasse perfettamente. Il prezzo era ottimo e mi ha davvero salvato da una situazione difficile.",
      nl: "Ik liet onderdelen printen voor een project, en naast de uitstekende service en constante ondersteuning hielpen ze me door groottietests uit te voeren zodat de geprinte moer perfect paste. De prijs was geweldig en heeft me echt gered in een lastige situatie.",
      pt: "Mandei imprimir algumas peças para um projeto e, além do excelente serviço e apoio constante, ajudaram-me fazendo testes de redimensionamento para que a porca impressa encaixasse perfeitamente. O preço foi ótimo e realmente salvou-me numa situação difícil.",
    },
    excerpt: {
      es: "me ayudaron haciendo pruebas de ajuste para que la tuerca impresa encajara perfectamente…",
      ca: "em van ajudar fent proves d'ajust perquè la rosca impresa encaixés perfectament…",
      en: "they helped me by doing resized tests so the printed nut would fit perfectly…",
      de: "halfen sie mir mit Größentests, damit die gedruckte Mutter perfekt passte…",
      fr: "ils m'ont aidé en faisant des tests de redimensionnement pour que l'écrou imprimé s'adapte parfaitement…",
      it: "mi hanno aiutato eseguendo test di ridimensionamento affinché il dado stampato si adattasse perfettamente…",
      nl: "hielpen ze me door groottietests uit te voeren zodat de geprinte moer perfect paste…",
      pt: "ajudaram-me fazendo testes de redimensionamento para que a porca impressa encaixasse perfeitamente…",
    },
  },
  {
    name: "Filip Copaescu",
    originalLang: "en",
    original:
      "Amazing! They were able to accurately 3D print this car part in TPU, a flexible material. Great quality and service.",
    translations: {
      es: "¡Increíble! Pudieron imprimir en 3D con precisión esta pieza de coche en TPU, un material flexible. Excelente calidad y servicio.",
      ca: "Increïble! Van poder imprimir en 3D amb precisió aquesta peça de cotxe en TPU, un material flexible. Excel·lent qualitat i servei.",
      en: "Amazing! They were able to accurately 3D print this car part in TPU, a flexible material. Great quality and service.",
      de: "Unglaublich! Sie konnten dieses Autoteil aus TPU, einem flexiblen Material, präzise in 3D drucken. Tolle Qualität und toller Service.",
      fr: "Incroyable ! Ils ont pu imprimer avec précision cette pièce automobile en TPU, un matériau flexible. Excellente qualité et service.",
      it: "Incredibile! Sono riusciti a stampare in 3D con precisione questo pezzo auto in TPU, un materiale flessibile. Ottima qualità e servizio.",
      nl: "Geweldig! Ze konden dit auto-onderdeel nauwkeurig 3D-printen in TPU, een flexibel materiaal. Uitstekende kwaliteit en service.",
      pt: "Incrível! Conseguiram imprimir em 3D com precisão esta peça de automóvel em TPU, um material flexível. Ótima qualidade e serviço.",
    },
    excerpt: {
      es: "Pudieron imprimir en 3D con precisión esta pieza de coche en TPU, un material flexible.",
      ca: "Van poder imprimir en 3D amb precisió aquesta peça de cotxe en TPU, un material flexible.",
      en: "They were able to accurately 3D print this car part in TPU, a flexible material.",
      de: "Sie konnten dieses Autoteil aus TPU, einem flexiblen Material, präzise in 3D drucken.",
      fr: "Ils ont pu imprimer avec précision cette pièce automobile en TPU, un matériau flexible.",
      it: "Sono riusciti a stampare in 3D con precisione questo pezzo auto in TPU, un materiale flessibile.",
      nl: "Ze konden dit auto-onderdeel nauwkeurig 3D-printen in TPU, een flexibel materiaal.",
      pt: "Conseguiram imprimir em 3D com precisão esta peça de automóvel em TPU, um material flexível.",
    },
  },
];

/** Returns the review text in the requested locale, falling back to English. */
export function reviewText(review: Review, lang: string): string {
  return review.translations[lang] ?? review.translations.en ?? review.original;
}

/** Returns the ≤20-word excerpt for the V2 hero, in the requested locale. */
export function reviewExcerpt(review: Review, lang: string): string {
  return review.excerpt[lang] ?? review.excerpt.en ?? "";
}

/** Label shown below a translated review. Keys are i18n strings. */
export const TRANSLATED_LABEL_KEY = "review.translatedFrom";
export const SEE_ORIGINAL_KEY = "review.seeOriginal";
export const HIDE_ORIGINAL_KEY = "review.hideOriginal";
