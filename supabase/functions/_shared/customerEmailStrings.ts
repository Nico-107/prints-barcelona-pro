// Customer-email strings in all 8 supported languages (item 1.4).
//
// Strict shape per language so TypeScript catches any missing key and the
// preview renderer fails loudly if a translation is dropped. Keep the
// dictionary flat — nested objects are harder to diff when a translator
// touches a single line.
//
// Language fallback: unknown lang → "es" (owner language).

export type CustomerLang = "es" | "ca" | "en" | "de" | "fr" | "nl" | "it" | "pt";

export interface CustomerStrings {
  // common
  hello:            (name: string) => string;
  footer_contact:   string;
  button_view_order: string;
  button_whatsapp:  string;

  // confirmed
  confirmed_subject:       (orderNumber: number) => string;
  confirmed_title:         (orderNumber: number) => string;
  confirmed_preheader:     (orderNumber: number) => string;
  confirmed_intro:         string;
  confirmed_total_label:   string;
  confirmed_delivery_label: string;
  confirmed_delivery_pickup: string;
  confirmed_delivery_shipping: string;
  confirmed_ship_by_label: string;
  confirmed_pickup_date_label: string;
  confirmed_next_heading:  string;
  confirmed_step_1:        string;
  confirmed_step_2:        string;
  confirmed_step_3_pickup: string;
  confirmed_step_3_shipping: string;

  // in production
  in_production_subject:   (orderNumber: number) => string;
  in_production_title:     string;
  in_production_preheader: (orderNumber: number) => string;
  in_production_body:      (etaDate: string) => string;

  // shipped
  shipped_subject:         (orderNumber: number) => string;
  shipped_title:           string;
  shipped_preheader:       (carrier: string) => string;
  shipped_body:            (carrier: string, trackingNumber: string, etaWindow: string) => string;
  shipped_tracking_label:  string;
  shipped_button:          string;

  // ready pickup
  pickup_subject:          (orderNumber: number) => string;
  pickup_title:            string;
  pickup_preheader:        string;
  pickup_body_intro:       string;
  pickup_address_label:    string;
  pickup_by_appointment:   string;
  pickup_whatsapp_cta:     string;

  // delivered / completed
  delivered_subject:       (orderNumber: number) => string;
  delivered_title:         string;
  delivered_preheader:     string;
  delivered_body:          string;

  // review request
  review_subject:          string;
  review_title:            string;
  review_preheader:        string;
  review_body:             string;
  review_button:           string;
}

const es: CustomerStrings = {
  hello: (n) => `Hola ${n},`,
  footer_contact: "¿Alguna duda? Contesta a este correo o escríbenos por WhatsApp.",
  button_view_order: "Ver mi pedido",
  button_whatsapp: "WhatsApp",

  confirmed_subject:    (n) => `Pedido #${n} confirmado — Dimension3D`,
  confirmed_title:      (n) => `Pedido #${n} confirmado`,
  confirmed_preheader:  (n) => `Gracias — ya estamos preparando tu pedido #${n}.`,
  confirmed_intro:      "Hemos recibido tu pago. Estos son los detalles de tu pedido:",
  confirmed_total_label: "Total pagado",
  confirmed_delivery_label: "Entrega",
  confirmed_delivery_pickup: "Recogida en estudio",
  confirmed_delivery_shipping: "Envío a domicilio",
  confirmed_ship_by_label: "Enviamos antes de",
  confirmed_pickup_date_label: "Listo para recoger a partir de",
  confirmed_next_heading: "Qué pasa a continuación",
  confirmed_step_1: "Revisamos tus archivos.",
  confirmed_step_2: "Imprimimos y hacemos control de calidad.",
  confirmed_step_3_pickup: "Te avisamos por email cuando puedas pasar a recoger.",
  confirmed_step_3_shipping: "Te enviamos el número de seguimiento al salir del estudio.",

  in_production_subject:   (n) => `Pedido #${n}: en impresión`,
  in_production_title:     "Tu pedido está imprimiéndose",
  in_production_preheader: (n) => `Pedido #${n} en producción.`,
  in_production_body:      (eta) => `Hemos empezado a imprimir tu pedido. Fecha estimada: ${eta}.`,

  shipped_subject:         (n) => `Pedido #${n}: enviado`,
  shipped_title:           "Tu pedido va de camino",
  shipped_preheader:       (c) => `Enviado con ${c}.`,
  shipped_body:            (c, t, w) => `Lo ha recogido ${c}. Número de seguimiento: ${t}. Entrega estimada: ${w}.`,
  shipped_tracking_label:  "Seguimiento",
  shipped_button:          "Ver seguimiento",

  pickup_subject:          (n) => `Pedido #${n}: listo para recoger`,
  pickup_title:            "Listo para recoger",
  pickup_preheader:        "Tu pedido está listo. Pasa a recogerlo cuando te vaya bien.",
  pickup_body_intro:       "Ya puedes pasar a recoger tu pedido en el estudio.",
  pickup_address_label:    "Dirección",
  pickup_by_appointment:   "Con cita previa.",
  pickup_whatsapp_cta:     "Acordar una hora por WhatsApp",

  delivered_subject:       (n) => `Pedido #${n}: entregado`,
  delivered_title:         "Pedido entregado",
  delivered_preheader:     "Esperamos que todo esté perfecto.",
  delivered_body:          "¡Gracias por confiar en Dimension3D! Si algo no está perfecto, contesta a este correo.",

  review_subject:          "¿Nos dejas tu opinión?",
  review_title:            "¿Qué tal la impresión?",
  review_preheader:        "Un minuto de tu tiempo nos ayudaría mucho.",
  review_body:             "Si quedaste contento con el resultado, nos ayudarías mucho dejando una pequeña reseña.",
  review_button:           "Dejar una reseña",
};

const ca: CustomerStrings = {
  hello: (n) => `Hola ${n},`,
  footer_contact: "Tens algun dubte? Contesta aquest correu o escriu-nos per WhatsApp.",
  button_view_order: "Veure la meva comanda",
  button_whatsapp: "WhatsApp",

  confirmed_subject:    (n) => `Comanda #${n} confirmada — Dimension3D`,
  confirmed_title:      (n) => `Comanda #${n} confirmada`,
  confirmed_preheader:  (n) => `Gràcies — ja estem preparant la teva comanda #${n}.`,
  confirmed_intro:      "Hem rebut el pagament. Aquests són els detalls:",
  confirmed_total_label: "Total pagat",
  confirmed_delivery_label: "Lliurament",
  confirmed_delivery_pickup: "Recollida a l'estudi",
  confirmed_delivery_shipping: "Enviament a domicili",
  confirmed_ship_by_label: "Enviem abans de",
  confirmed_pickup_date_label: "A punt per recollir a partir de",
  confirmed_next_heading: "Què passa ara",
  confirmed_step_1: "Revisem els teus fitxers.",
  confirmed_step_2: "Imprimim i fem control de qualitat.",
  confirmed_step_3_pickup: "T'avisem per email quan puguis venir a recollir.",
  confirmed_step_3_shipping: "T'enviem el número de seguiment quan surt de l'estudi.",

  in_production_subject:   (n) => `Comanda #${n}: en impressió`,
  in_production_title:     "La teva comanda s'està imprimint",
  in_production_preheader: (n) => `Comanda #${n} en producció.`,
  in_production_body:      (eta) => `Hem començat a imprimir la teva comanda. Data estimada: ${eta}.`,

  shipped_subject:         (n) => `Comanda #${n}: enviada`,
  shipped_title:           "La teva comanda va de camí",
  shipped_preheader:       (c) => `Enviada amb ${c}.`,
  shipped_body:            (c, t, w) => `L'ha recollit ${c}. Número de seguiment: ${t}. Lliurament estimat: ${w}.`,
  shipped_tracking_label:  "Seguiment",
  shipped_button:          "Veure seguiment",

  pickup_subject:          (n) => `Comanda #${n}: a punt per recollir`,
  pickup_title:            "A punt per recollir",
  pickup_preheader:        "La teva comanda és a punt. Vine a recollir-la quan et vagi bé.",
  pickup_body_intro:       "Ja pots venir a recollir la teva comanda a l'estudi.",
  pickup_address_label:    "Adreça",
  pickup_by_appointment:   "Amb cita prèvia.",
  pickup_whatsapp_cta:     "Acordar una hora per WhatsApp",

  delivered_subject:       (n) => `Comanda #${n}: lliurada`,
  delivered_title:         "Comanda lliurada",
  delivered_preheader:     "Esperem que tot estigui perfecte.",
  delivered_body:          "Gràcies per confiar en Dimension3D! Si alguna cosa no està perfecta, contesta aquest correu.",

  review_subject:          "Ens deixes la teva opinió?",
  review_title:            "Com ha anat la impressió?",
  review_preheader:        "Un minut del teu temps ens ajudaria molt.",
  review_body:             "Si has quedat content amb el resultat, ens ajudaries molt deixant una petita ressenya.",
  review_button:           "Deixar una ressenya",
};

const en: CustomerStrings = {
  hello: (n) => `Hi ${n},`,
  footer_contact: "Any questions? Reply to this email or write to us on WhatsApp.",
  button_view_order: "View my order",
  button_whatsapp: "WhatsApp",

  confirmed_subject:    (n) => `Order #${n} confirmed — Dimension3D`,
  confirmed_title:      (n) => `Order #${n} confirmed`,
  confirmed_preheader:  (n) => `Thanks — we've started on order #${n}.`,
  confirmed_intro:      "We've received your payment. Here are your order details:",
  confirmed_total_label: "Total paid",
  confirmed_delivery_label: "Delivery",
  confirmed_delivery_pickup: "Studio pickup",
  confirmed_delivery_shipping: "Home shipping",
  confirmed_ship_by_label: "We'll ship by",
  confirmed_pickup_date_label: "Ready for pickup from",
  confirmed_next_heading: "What happens next",
  confirmed_step_1: "We review your files.",
  confirmed_step_2: "We print and do quality control.",
  confirmed_step_3_pickup: "We email you when your order is ready to collect.",
  confirmed_step_3_shipping: "We email you the tracking number when it leaves the studio.",

  in_production_subject:   (n) => `Order #${n}: in production`,
  in_production_title:     "Your order is printing",
  in_production_preheader: (n) => `Order #${n} is on the printer.`,
  in_production_body:      (eta) => `We've started printing your order. Estimated date: ${eta}.`,

  shipped_subject:         (n) => `Order #${n}: shipped`,
  shipped_title:           "Your order is on its way",
  shipped_preheader:       (c) => `Shipped with ${c}.`,
  shipped_body:            (c, t, w) => `${c} has picked it up. Tracking: ${t}. Estimated delivery: ${w}.`,
  shipped_tracking_label:  "Tracking",
  shipped_button:          "View tracking",

  pickup_subject:          (n) => `Order #${n}: ready for pickup`,
  pickup_title:            "Ready for pickup",
  pickup_preheader:        "Your order is ready. Come by whenever suits you.",
  pickup_body_intro:       "Your order is ready to collect at the studio.",
  pickup_address_label:    "Address",
  pickup_by_appointment:   "By appointment.",
  pickup_whatsapp_cta:     "Agree a time on WhatsApp",

  delivered_subject:       (n) => `Order #${n}: delivered`,
  delivered_title:         "Order delivered",
  delivered_preheader:     "We hope everything arrived in perfect shape.",
  delivered_body:          "Thanks for trusting Dimension3D. If anything isn't right, just reply to this email.",

  review_subject:          "Could you leave us a review?",
  review_title:            "How was the print?",
  review_preheader:        "A minute of your time would really help us.",
  review_body:             "If you were happy with the result, a short review would help us a lot.",
  review_button:           "Leave a review",
};

const de: CustomerStrings = {
  hello: (n) => `Hallo ${n},`,
  footer_contact: "Fragen? Antworte auf diese E-Mail oder schreibe uns per WhatsApp.",
  button_view_order: "Bestellung ansehen",
  button_whatsapp: "WhatsApp",

  confirmed_subject:    (n) => `Bestellung #${n} bestätigt — Dimension3D`,
  confirmed_title:      (n) => `Bestellung #${n} bestätigt`,
  confirmed_preheader:  (n) => `Danke — wir arbeiten an deiner Bestellung #${n}.`,
  confirmed_intro:      "Wir haben deine Zahlung erhalten. Hier die Details:",
  confirmed_total_label: "Gesamt bezahlt",
  confirmed_delivery_label: "Lieferung",
  confirmed_delivery_pickup: "Abholung im Studio",
  confirmed_delivery_shipping: "Versand nach Hause",
  confirmed_ship_by_label: "Versand bis",
  confirmed_pickup_date_label: "Abholbereit ab",
  confirmed_next_heading: "Was als Nächstes passiert",
  confirmed_step_1: "Wir prüfen deine Dateien.",
  confirmed_step_2: "Wir drucken und machen eine Qualitätskontrolle.",
  confirmed_step_3_pickup: "Du bekommst eine E-Mail, wenn deine Bestellung abholbereit ist.",
  confirmed_step_3_shipping: "Du bekommst die Sendungsnummer, wenn das Paket raus ist.",

  in_production_subject:   (n) => `Bestellung #${n}: im Druck`,
  in_production_title:     "Deine Bestellung wird gedruckt",
  in_production_preheader: (n) => `Bestellung #${n} läuft auf dem Drucker.`,
  in_production_body:      (eta) => `Wir haben mit dem Druck begonnen. Geschätzter Termin: ${eta}.`,

  shipped_subject:         (n) => `Bestellung #${n}: versendet`,
  shipped_title:           "Deine Bestellung ist unterwegs",
  shipped_preheader:       (c) => `Versand mit ${c}.`,
  shipped_body:            (c, t, w) => `${c} hat das Paket abgeholt. Sendungsnummer: ${t}. Voraussichtliche Zustellung: ${w}.`,
  shipped_tracking_label:  "Sendungsverfolgung",
  shipped_button:          "Sendung verfolgen",

  pickup_subject:          (n) => `Bestellung #${n}: abholbereit`,
  pickup_title:            "Abholbereit",
  pickup_preheader:        "Deine Bestellung ist fertig. Komm vorbei, wann es dir passt.",
  pickup_body_intro:       "Du kannst deine Bestellung jetzt im Studio abholen.",
  pickup_address_label:    "Adresse",
  pickup_by_appointment:   "Nach Terminvereinbarung.",
  pickup_whatsapp_cta:     "Termin per WhatsApp vereinbaren",

  delivered_subject:       (n) => `Bestellung #${n}: geliefert`,
  delivered_title:         "Bestellung geliefert",
  delivered_preheader:     "Wir hoffen, es ist alles perfekt angekommen.",
  delivered_body:          "Danke, dass du Dimension3D vertraust. Falls etwas nicht stimmt, antworte einfach auf diese E-Mail.",

  review_subject:          "Lässt du uns eine Bewertung?",
  review_title:            "Wie war der Druck?",
  review_preheader:        "Eine Minute deiner Zeit würde uns sehr helfen.",
  review_body:             "Wenn du zufrieden warst, hilft uns eine kurze Bewertung sehr weiter.",
  review_button:           "Bewertung schreiben",
};

const fr: CustomerStrings = {
  hello: (n) => `Bonjour ${n},`,
  footer_contact: "Une question ? Réponds à cet e-mail ou écris-nous sur WhatsApp.",
  button_view_order: "Voir ma commande",
  button_whatsapp: "WhatsApp",

  confirmed_subject:    (n) => `Commande #${n} confirmée — Dimension3D`,
  confirmed_title:      (n) => `Commande #${n} confirmée`,
  confirmed_preheader:  (n) => `Merci — on s'occupe de ta commande #${n}.`,
  confirmed_intro:      "Nous avons reçu ton paiement. Voici les détails :",
  confirmed_total_label: "Total payé",
  confirmed_delivery_label: "Livraison",
  confirmed_delivery_pickup: "Retrait au studio",
  confirmed_delivery_shipping: "Livraison à domicile",
  confirmed_ship_by_label: "Expédition avant le",
  confirmed_pickup_date_label: "Prêt à retirer à partir du",
  confirmed_next_heading: "Les étapes suivantes",
  confirmed_step_1: "On vérifie tes fichiers.",
  confirmed_step_2: "On imprime et on fait le contrôle qualité.",
  confirmed_step_3_pickup: "On t'envoie un e-mail quand ta commande est prête.",
  confirmed_step_3_shipping: "On t'envoie le numéro de suivi à l'expédition.",

  in_production_subject:   (n) => `Commande #${n} : en production`,
  in_production_title:     "Ta commande est en impression",
  in_production_preheader: (n) => `Commande #${n} sur l'imprimante.`,
  in_production_body:      (eta) => `On a commencé l'impression de ta commande. Date estimée : ${eta}.`,

  shipped_subject:         (n) => `Commande #${n} : expédiée`,
  shipped_title:           "Ta commande est en route",
  shipped_preheader:       (c) => `Expédiée avec ${c}.`,
  shipped_body:            (c, t, w) => `${c} a pris le colis. Numéro de suivi : ${t}. Livraison estimée : ${w}.`,
  shipped_tracking_label:  "Suivi",
  shipped_button:          "Voir le suivi",

  pickup_subject:          (n) => `Commande #${n} : prête à retirer`,
  pickup_title:            "Prête à retirer",
  pickup_preheader:        "Ta commande est prête. Passe quand ça t'arrange.",
  pickup_body_intro:       "Tu peux venir retirer ta commande au studio.",
  pickup_address_label:    "Adresse",
  pickup_by_appointment:   "Sur rendez-vous.",
  pickup_whatsapp_cta:     "Prendre rendez-vous sur WhatsApp",

  delivered_subject:       (n) => `Commande #${n} : livrée`,
  delivered_title:         "Commande livrée",
  delivered_preheader:     "On espère que tout est parfait.",
  delivered_body:          "Merci de ta confiance envers Dimension3D. Si quelque chose ne va pas, réponds à cet e-mail.",

  review_subject:          "Tu nous laisses un avis ?",
  review_title:            "Comment s'est passée l'impression ?",
  review_preheader:        "Une minute de ton temps nous aiderait beaucoup.",
  review_body:             "Si tu es content du résultat, un petit avis nous aide énormément.",
  review_button:           "Laisser un avis",
};

const nl: CustomerStrings = {
  hello: (n) => `Hoi ${n},`,
  footer_contact: "Vragen? Beantwoord deze e-mail of stuur ons een bericht via WhatsApp.",
  button_view_order: "Bekijk mijn bestelling",
  button_whatsapp: "WhatsApp",

  confirmed_subject:    (n) => `Bestelling #${n} bevestigd — Dimension3D`,
  confirmed_title:      (n) => `Bestelling #${n} bevestigd`,
  confirmed_preheader:  (n) => `Bedankt — we zijn aan de slag met bestelling #${n}.`,
  confirmed_intro:      "We hebben je betaling ontvangen. Hier zijn de details:",
  confirmed_total_label: "Totaal betaald",
  confirmed_delivery_label: "Levering",
  confirmed_delivery_pickup: "Afhalen in de studio",
  confirmed_delivery_shipping: "Verzending",
  confirmed_ship_by_label: "Verzending vóór",
  confirmed_pickup_date_label: "Klaar om op te halen vanaf",
  confirmed_next_heading: "Wat gebeurt er nu",
  confirmed_step_1: "We bekijken je bestanden.",
  confirmed_step_2: "We printen en doen kwaliteitscontrole.",
  confirmed_step_3_pickup: "We mailen je zodra je bestelling klaar is om op te halen.",
  confirmed_step_3_shipping: "We sturen je het volgnummer zodra het pakket de studio verlaat.",

  in_production_subject:   (n) => `Bestelling #${n}: wordt geprint`,
  in_production_title:     "Je bestelling wordt geprint",
  in_production_preheader: (n) => `Bestelling #${n} is op de printer.`,
  in_production_body:      (eta) => `We zijn begonnen met printen. Geschatte datum: ${eta}.`,

  shipped_subject:         (n) => `Bestelling #${n}: verzonden`,
  shipped_title:           "Je bestelling is onderweg",
  shipped_preheader:       (c) => `Verzonden met ${c}.`,
  shipped_body:            (c, t, w) => `${c} heeft het pakket opgehaald. Volgnummer: ${t}. Verwachte bezorging: ${w}.`,
  shipped_tracking_label:  "Track & trace",
  shipped_button:          "Zending volgen",

  pickup_subject:          (n) => `Bestelling #${n}: klaar om op te halen`,
  pickup_title:            "Klaar om op te halen",
  pickup_preheader:        "Je bestelling is klaar. Kom langs wanneer het je uitkomt.",
  pickup_body_intro:       "Je bestelling ligt klaar in de studio.",
  pickup_address_label:    "Adres",
  pickup_by_appointment:   "Op afspraak.",
  pickup_whatsapp_cta:     "Afspraak maken via WhatsApp",

  delivered_subject:       (n) => `Bestelling #${n}: geleverd`,
  delivered_title:         "Bestelling geleverd",
  delivered_preheader:     "We hopen dat alles perfect is aangekomen.",
  delivered_body:          "Bedankt dat je op Dimension3D vertrouwt. Als iets niet klopt, mail ons gewoon terug.",

  review_subject:          "Laat je een review achter?",
  review_title:            "Hoe was de print?",
  review_preheader:        "Een minuutje van je tijd zou ons enorm helpen.",
  review_body:             "Als je tevreden bent met het resultaat, helpt een korte review ons ontzettend.",
  review_button:           "Review achterlaten",
};

const it: CustomerStrings = {
  hello: (n) => `Ciao ${n},`,
  footer_contact: "Hai domande? Rispondi a questa email o scrivici su WhatsApp.",
  button_view_order: "Vedi il mio ordine",
  button_whatsapp: "WhatsApp",

  confirmed_subject:    (n) => `Ordine #${n} confermato — Dimension3D`,
  confirmed_title:      (n) => `Ordine #${n} confermato`,
  confirmed_preheader:  (n) => `Grazie — ci stiamo occupando del tuo ordine #${n}.`,
  confirmed_intro:      "Abbiamo ricevuto il pagamento. Ecco i dettagli:",
  confirmed_total_label: "Totale pagato",
  confirmed_delivery_label: "Consegna",
  confirmed_delivery_pickup: "Ritiro in studio",
  confirmed_delivery_shipping: "Spedizione a domicilio",
  confirmed_ship_by_label: "Spediamo entro il",
  confirmed_pickup_date_label: "Pronto per il ritiro dal",
  confirmed_next_heading: "Cosa succede dopo",
  confirmed_step_1: "Controlliamo i file.",
  confirmed_step_2: "Stampiamo e facciamo il controllo qualità.",
  confirmed_step_3_pickup: "Ti avvisiamo via email quando il tuo ordine è pronto da ritirare.",
  confirmed_step_3_shipping: "Ti inviamo il numero di tracciamento alla spedizione.",

  in_production_subject:   (n) => `Ordine #${n}: in stampa`,
  in_production_title:     "Il tuo ordine è in stampa",
  in_production_preheader: (n) => `Ordine #${n} sulla stampante.`,
  in_production_body:      (eta) => `Abbiamo iniziato a stampare il tuo ordine. Data stimata: ${eta}.`,

  shipped_subject:         (n) => `Ordine #${n}: spedito`,
  shipped_title:           "Il tuo ordine è in viaggio",
  shipped_preheader:       (c) => `Spedito con ${c}.`,
  shipped_body:            (c, t, w) => `${c} ha ritirato il pacco. Tracciamento: ${t}. Consegna stimata: ${w}.`,
  shipped_tracking_label:  "Tracciamento",
  shipped_button:          "Vedi tracciamento",

  pickup_subject:          (n) => `Ordine #${n}: pronto da ritirare`,
  pickup_title:            "Pronto da ritirare",
  pickup_preheader:        "Il tuo ordine è pronto. Passa quando ti va bene.",
  pickup_body_intro:       "Puoi passare a ritirare il tuo ordine in studio.",
  pickup_address_label:    "Indirizzo",
  pickup_by_appointment:   "Su appuntamento.",
  pickup_whatsapp_cta:     "Concordare un orario su WhatsApp",

  delivered_subject:       (n) => `Ordine #${n}: consegnato`,
  delivered_title:         "Ordine consegnato",
  delivered_preheader:     "Speriamo che sia tutto perfetto.",
  delivered_body:          "Grazie per aver scelto Dimension3D! Se qualcosa non va, rispondi a questa email.",

  review_subject:          "Ci lasci una recensione?",
  review_title:            "Com'è andata la stampa?",
  review_preheader:        "Un minuto del tuo tempo ci aiuterebbe tanto.",
  review_body:             "Se sei soddisfatto del risultato, una breve recensione ci aiuterebbe molto.",
  review_button:           "Lascia una recensione",
};

const pt: CustomerStrings = {
  hello: (n) => `Olá ${n},`,
  footer_contact: "Dúvidas? Responde a este email ou escreve-nos no WhatsApp.",
  button_view_order: "Ver a minha encomenda",
  button_whatsapp: "WhatsApp",

  confirmed_subject:    (n) => `Encomenda #${n} confirmada — Dimension3D`,
  confirmed_title:      (n) => `Encomenda #${n} confirmada`,
  confirmed_preheader:  (n) => `Obrigado — estamos a preparar a tua encomenda #${n}.`,
  confirmed_intro:      "Recebemos o pagamento. Aqui vão os detalhes:",
  confirmed_total_label: "Total pago",
  confirmed_delivery_label: "Entrega",
  confirmed_delivery_pickup: "Recolha no estúdio",
  confirmed_delivery_shipping: "Envio ao domicílio",
  confirmed_ship_by_label: "Enviamos até",
  confirmed_pickup_date_label: "Pronto para recolher a partir de",
  confirmed_next_heading: "O que acontece a seguir",
  confirmed_step_1: "Verificamos os teus ficheiros.",
  confirmed_step_2: "Imprimimos e fazemos controlo de qualidade.",
  confirmed_step_3_pickup: "Enviamos-te um email quando a tua encomenda estiver pronta.",
  confirmed_step_3_shipping: "Enviamos-te o número de seguimento quando sair do estúdio.",

  in_production_subject:   (n) => `Encomenda #${n}: em impressão`,
  in_production_title:     "A tua encomenda está a ser impressa",
  in_production_preheader: (n) => `Encomenda #${n} na impressora.`,
  in_production_body:      (eta) => `Começámos a imprimir a tua encomenda. Data estimada: ${eta}.`,

  shipped_subject:         (n) => `Encomenda #${n}: enviada`,
  shipped_title:           "A tua encomenda vai a caminho",
  shipped_preheader:       (c) => `Enviada com ${c}.`,
  shipped_body:            (c, t, w) => `${c} recolheu a encomenda. Seguimento: ${t}. Entrega estimada: ${w}.`,
  shipped_tracking_label:  "Seguimento",
  shipped_button:          "Ver seguimento",

  pickup_subject:          (n) => `Encomenda #${n}: pronta para recolher`,
  pickup_title:            "Pronta para recolher",
  pickup_preheader:        "A tua encomenda está pronta. Passa quando te der jeito.",
  pickup_body_intro:       "Já podes passar para recolher a encomenda no estúdio.",
  pickup_address_label:    "Morada",
  pickup_by_appointment:   "Com marcação.",
  pickup_whatsapp_cta:     "Combinar uma hora no WhatsApp",

  delivered_subject:       (n) => `Encomenda #${n}: entregue`,
  delivered_title:         "Encomenda entregue",
  delivered_preheader:     "Esperamos que esteja tudo perfeito.",
  delivered_body:          "Obrigado por confiares na Dimension3D. Se algo não estiver bem, responde a este email.",

  review_subject:          "Deixas-nos uma avaliação?",
  review_title:            "Como correu a impressão?",
  review_preheader:        "Um minuto do teu tempo ajudava-nos imenso.",
  review_body:             "Se ficaste satisfeito, uma pequena avaliação ajudava-nos muito.",
  review_button:           "Deixar avaliação",
};

export const STRINGS: Record<CustomerLang, CustomerStrings> = { es, ca, en, de, fr, nl, it, pt };

export function stringsFor(lang: string | null | undefined): CustomerStrings {
  const key = (lang ?? "es").toLowerCase() as CustomerLang;
  return STRINGS[key] ?? STRINGS.es;
}
