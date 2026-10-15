// Italian (IT) and European Portuguese (PT) content for
// Dimension3D — FDM 3D printing service based in Barcelona.
import type { IntlHubContent, IntlCityContent, IntlGuideContent } from "@/data/intlTypes";

// ============================================================
// ██ ITALIAN (IT)
// ============================================================

// ─── IT Hub ─────────────────────────────────────────────────

export const itHub: IntlHubContent = {
  slug: "/it/stampa-3d-online",
  lang: "it",
  locale: "it-IT",
  countryCode: "IT",
  metaTitle: "Servizio Stampa 3D Online — Spedizione in Italia da 5,90 €",
  metaDescription:
    "Far stampare in 3D non è mai stato così semplice. Studio FDM a Barcellona, prezzi stampa 3D trasparenti, preventivo entro 1 ora nei giorni lavorativi.",
  eyebrow: "Stampa 3D Online · Spedizione in tutta Italia",
  h1: "Servizio di Stampa 3D Online con Spedizione in Italia",
  heroSubtitle: "Carica il file, preventivo in 1 ora, spedizione in Italia in 3–5 giorni lavorativi. Da 10 €, senza ordine minimo.",
  promise: `Dimension3D è uno studio FDM professionale situato a Barcellona, nel cuore del Mediterraneo. Grazie al mercato unico europeo, i tuoi pezzi viaggiano dall'Iberia all'Italia senza dogana, con la stessa semplicità di un acquisto domestico. Che tu voglia far stampare in 3D un prototipo per il tuo ufficio a Milano, un ricambio stampa 3D per una macchina industriale a Torino, o un modello architettonico per uno studio romano, il processo è identico: carichi il file, ricevi il preventivo entro un'ora nei giorni lavorativi, approvi e aspetti la consegna.

Il nostro parco macchine è interamente basato su stampanti Bambu Lab X2D con camera chiusa e piatto riscaldato. Questa architettura garantisce la stabilità termica necessaria per stampare correttamente materiali tecnici come PETG, ABS e Nylon, riducendo al minimo i difetti da warping che affliggono le macchine aperte entry-level. Il risultato sono pezzi con migliore adesione tra gli strati, superfici più consistenti e dimensioni finali più vicine al nominale.

I prezzi stampa 3D sono calcolati in modo trasparente: peso del materiale più tempo macchina, senza costi di setup e senza sorprese. Per ordini fino a 100 € ottieni un prezzo istantaneo non appena carichi il file. Sopra tale soglia un tecnico revisiona la geometria e ti risponde entro un'ora lavorativa. L'ordine minimo è di 10 €. La spedizione è una tariffa piatta di 5,90 € indipendentemente dal peso o dalla destinazione in Italia.`,

  howItWorks: `**Come funziona il servizio di stampa 3D online**

1. **Carica il file** — accettiamo STL, OBJ, STEP e 3MF. Se il tuo software esporta altro, scrivici su WhatsApp prima di caricare.
2. **Ricevi il preventivo** — per ordini ≤ 100 € il prezzo appare immediatamente dopo l'analisi automatica del modello. Sopra soglia ricevi risposta entro un'ora nei giorni lavorativi.
3. **Scegli materiale e finitura** — PLA per prototipi veloci ed economici, PETG per pezzi funzionali resistenti all'umidità, ABS per applicazioni ad alta temperatura, Nylon per componenti flessibili e resistenti all'usura.
4. **Approva e paga** — il pagamento avviene online in sicurezza. Non ti chiediamo depositi o costi aggiuntivi.
5. **Ricevi la spedizione** — il pacco parte da Barcellona e arriva solitamente in 3–5 giorni lavorativi. Ricevi il numero di tracciatura non appena il corriere ritira il pacco.`,

  whatWePrint: `**Cosa stampano i nostri clienti**

Il servizio di stampa 3D online è utilizzato per una varietà ampia di applicazioni. Ecco le categorie più frequenti:

- **Prototipi di prodotto**: modelli di verifica forma/fit/function prima di investire in stampi a iniezione. Particolarmente utile per chi lavora in ambito design industriale, packaging o elettronica di consumo.
- **Ricambi stampa 3D**: componenti di macchine obsolete o fuori produzione, supporti, attacchi e bracket personalizzati per attrezzature industriali o laboratoriali.
- **Modelli architettonici e urbanistici**: maquette di edifici, rendering tridimensionali di isolati o piani urbanistici per presentazioni a committenti o gare d'appalto.
- **Componenti per ricerca e università**: supporti, giunti, dime e fixture per laboratori di ingegneria, fisica e scienze della vita.
- **Gadget personalizzati e oggettistica**: articoli promozionali, premi aziendali, modelli illustrativi, pezzi unici per eventi.
- **Modellismo e hobby**: veicoli in scala, miniature, accessori per cosplay, componenti per scenografie.

Se non sei sicuro che il tuo progetto sia adatto alla stampa FDM, contattaci su WhatsApp con una foto o un'immagine di riferimento: ti risponderemo onestamente.`,

  materialsText: `**Materiali disponibili**

- **PLA**: il materiale più economico e facile da stampare. Ottimo per prototipi visivi, modelli, oggettistica. Temperatura di esercizio fino a circa 55 °C. Disponibile in molti colori.
- **PETG**: buon compromesso tra facilità di stampa e resistenza meccanica. Resistente all'umidità, leggermente flessibile, adatto a pezzi funzionali che non superano 70–75 °C. Ottima resistenza chimica agli acidi diluiti.
- **ABS**: materiale storico della stampa FDM, con buona resistenza meccanica e termica (fino a ~100 °C). Richiede la camera chiusa del nostro X2D per evitare il warping. Adatto a parti tecniche e carcasse.
- **Nylon (PA)**: alta resistenza agli urti, bassa frizione, ottima resistenza all'usura. Ideale per ingranaggi, boccole, guide e componenti soggetti a carichi dinamici ripetuti. Richiede post-essicazione del filamento.

Per materiali speciali (fibra di carbonio, TPU, PETG-CF) contattaci prima di caricare il file.`,

  fileFormatsText: `**Formati file accettati**: STL, OBJ, STEP (.step / .stp), 3MF. Il formato consigliato è STL o 3MF per garantire la compatibilità con il slicer. Se lavori con STEP puoi caricarlo direttamente: lo convertiamo noi. La risoluzione minima consigliata per le mesh STL è 0,01 mm per corda. File troppo grossolani possono generare superfici sfaccettate visibili sul pezzo finale.`,

  faqs: [
    {
      q: "Quanto costa far stampare in 3D un oggetto?",
      a: "Il prezzo dipende principalmente dal peso del materiale e dal tempo di stampa. Come riferimento rapido: pezzi piccoli (20–50 g, 1–2 ore) costano di solito tra 10 e 20 €; pezzi medi (100–200 g, 4–6 ore) tra 25 e 45 €. Carica il file per un preventivo esatto — per ordini ≤ 100 € il prezzo è immediato. Ordine minimo 10 €.",
    },
    {
      q: "Quanto ci vuole per ricevere il pacco in Italia?",
      a: "La spedizione parte da Barcellona. Solitamente i tempi di consegna sono di 3–5 giorni lavorativi in Italia. Non ci sono formalità doganali grazie al mercato unico UE.",
    },
    {
      q: "Devo pagare la dogana?",
      a: "No. Spagna e Italia sono entrambe nell'Unione Europea, quindi non esistono procedure doganali né dazi aggiuntivi. Il costo che vedi al checkout è quello finale.",
    },
    {
      q: "Quali file posso caricare?",
      a: "Accettiamo STL, OBJ, STEP e 3MF. Se hai dubbi sul formato o sulla qualità del tuo file, contattaci su WhatsApp: ti aiutiamo gratuitamente prima di farti procedere all'ordine.",
    },
    {
      q: "C'è un ordine minimo?",
      a: "Sì, l'ordine minimo è di 10 €. Non addebitiamo costi di setup.",
    },
    {
      q: "Posso ordinare più pezzi nello stesso ordine?",
      a: "Sì, puoi caricare più file nella stessa sessione. Il sistema calcola il preventivo per ciascun pezzo e li consolida in una spedizione unica a tariffa piatta di 5,90 €.",
    },
    {
      q: "Fate stampe in colori diversi?",
      a: "Sì, disponiamo di PLA, PETG e ABS in diversi colori. Il selettore colore è disponibile durante la configurazione dell'ordine. Per colorazioni RAL specifiche o finiture particolari contattaci prima.",
    },
  ],

  whatsappMsg:
    "Ciao Dimension3D! Vorrei un preventivo per la stampa 3D di un pezzo. Posso inviarvi il file?",
  priceTableCaption:
    "Prezzi indicativi stampa 3D FDM — IVA spagnola inclusa, spedizione 5,90 € separata",
  breadcrumbHub: "Stampa 3D Online",

  cityLinks: [
    { to: "/it/stampa-3d-milano", label: "Stampa 3D Milano" },
    { to: "/it/stampa-3d-torino", label: "Stampa 3D Torino" },
    { to: "/it/stampa-3d-roma", label: "Stampa 3D Roma" },
  ],

  guideLinks: [
    { to: "/it/prezzi-stampa-3d", label: "Guida ai prezzi" },
    { to: "/it/preparare-file-stampa-3d", label: "Preparare il file" },
    { to: "/it/materiali-stampa-3d", label: "Guida ai materiali" },
  ],
};

// ─── IT City: Milano ─────────────────────────────────────────

export const itCityMilano: IntlCityContent = {
  slug: "/it/stampa-3d-milano",
  altSlug: "/3d-printing-delivery-milan",
  lang: "it",
  locale: "it-IT",
  countryCode: "IT",
  city: "Milano",
  metaTitle: "Stampa 3D Online con Spedizione a Milano — Da 10 €",
  metaDescription:
    "Servizio stampa 3D professionale con spedizione a Milano in solitamente 3–5 giorni lavorativi.",
  h1: "Stampa 3D Online con Spedizione a Milano",
  eyebrow: "Spedizione a Milano · Solitamente 3–5 giorni lavorativi",

  introText: `Milano è la capitale italiana del design, dell'innovazione industriale e del manifatturiero avanzato. È la città del Salone del Mobile, la fiera internazionale che ogni anno raduna i migliori studi di design del mondo, attraendo professionisti che lavorano su prototipi, mock-up e modelli in scala da presentare a clienti globali. In questo ecosistema, la velocità di iterazione è tutto: una settimana in meno sul ciclo prototipo-feedback può fare la differenza tra aggiudicarsi un brief e perderlo. Il servizio di stampa 3D online di Dimension3D nasce per rispondere esattamente a questa esigenza.

Nei quartieri di Brera e Porta Nuova si concentra una densità straordinaria di studi di product design, agenzie creative e laboratori di prototipazione. Gli studi che lavorano su arredi, illuminazione, oggetti di consumo o packaging trovano nella stampa FDM un alleato naturale per validare forme e ingombri prima di commissionare prototipi in resina o stampi di campionatura. Il Bambu Lab X2D che utilizziamo, con camera chiusa e piatto riscaldato, permette di stampare ABS e Nylon con una qualità difficile da ottenere su macchine aperte: niente warping, niente delaminazione nei pezzi con pareti sottili.

L'area metropolitana milanese è anche un nodo fondamentale della catena di fornitura automotive italiana. Il distretto dei fornitori legato all'ecosistema Stellantis e alle piccole e medie imprese che lavorano su componentistica di precisione si estende fino alle province di Monza-Brianza e Varese. Piccoli fornitori, officine meccaniche e reparti di R&D spesso necessitano di ricambi stampa 3D per attrezzature obsolete, di fixture e dime di controllo per linee di assemblaggio, o di modelli funzionali per verificare l'interfaccia tra componenti meccanici prima di passare alla produzione in serie. La nostra capacità di stampare in PETG e ABS con tolleranze controllate rende il servizio adatto anche a queste applicazioni tecniche.

Il Politecnico di Milano è una delle università di ingegneria e design più importanti d'Europa. I suoi dipartimenti di Ingegneria Meccanica, Design Industriale e Ingegneria Aerospaziale generano costantemente una domanda di prototipi fisici per tesi, ricerche e progetti in collaborazione con l'industria. Studenti e ricercatori che cercano un servizio di stampa 3D online affidabile, con prezzi trasparenti e tempi certi, trovano in Dimension3D un'alternativa valida ai laboratori interni, spesso saturi nei periodi di picco preesame.

Il quartiere Isola, i nuovi hub creativi di NoLo e le aree produttive di Sesto San Giovanni ospitano inoltre una crescente comunità di maker, startup hardware e micro-imprese che lavorano su piccole serie di pezzi tecnici o oggetti personalizzati. Per questi utenti, la combinazione di ordine minimo contenuto (10 €), preventivo rapido e spedizione piatta a 5,90 € elimina le barriere d'ingresso che spesso scoraggiano gli ordini di prova.

Grazie all'appartenenza di Spagna e Italia all'Unione Europea, la spedizione da Barcellona a Milano non comporta alcuna formalità doganale. Il pacco viene consegnato da un corriere espresso europeo e solitamente arriva in 3–5 giorni lavorativi dall'approvazione dell'ordine. Ricevi il numero di tracciatura in tempo reale. Non ci sono sorprese al momento della consegna: il prezzo che hai approvato è quello definitivo, IVA spagnola già inclusa.

Per iniziare, carica il tuo file STL, STEP o 3MF sul sito. Se hai un progetto complesso, più pezzi da ottimizzare insieme, o vuoi un consiglio sul materiale prima di procedere, contattaci su WhatsApp: il team risponde nelle ore lavorative spagnole (CET/CEST, orario identico a quello italiano).`,

  deliveryNote:
    "Spedizione da Barcellona, solitamente 3–5 giorni lavorativi a Milano. Nessuna dogana UE. Tariffa piatta 5,90 €.",

  faqs: [
    {
      q: "In quanto tempo arriva il pacco a Milano?",
      a: "Solitamente in 3–5 giorni lavorativi dalla conferma dell'ordine. La spedizione parte da Barcellona con un corriere espresso europeo e non è soggetta a dogana.",
    },
    {
      q: "Stampate materiali tecnici adatti all'industria?",
      a: "Sì. Utilizziamo Bambu Lab X2D con camera chiusa per stampare ABS, PETG e Nylon con alta stabilità termica. Ideale per ricambi, fixture e prototipi funzionali.",
    },
    {
      q: "Posso usare il servizio per prototipi da presentare al Salone del Mobile?",
      a: "Certamente. La stampa FDM è ottima per mock-up di forma e fit, modelli in scala e pezzi unici per presentazioni. Contattaci con anticipo adeguato rispetto alla tua scadenza.",
    },
    {
      q: "Qual è l'ordine minimo?",
      a: "L'ordine minimo è 10 €. Non addebitiamo costi di setup.",
    },
  ],

  whatsappMsg:
    "Ciao Dimension3D! Sono a Milano e vorrei un preventivo per la stampa 3D. Posso inviare il file?",

  hubLink: { to: "/it/stampa-3d-online", label: "Stampa 3D Online Italia" },

  siblingLinks: [
    { to: "/it/stampa-3d-torino", label: "Stampa 3D Torino" },
    { to: "/it/stampa-3d-roma", label: "Stampa 3D Roma" },
  ],

  guideLinks: [
    { to: "/it/prezzi-stampa-3d", label: "Guida ai prezzi stampa 3D" },
    { to: "/it/preparare-file-stampa-3d", label: "Come preparare il file" },
    { to: "/it/materiali-stampa-3d", label: "Guida ai materiali" },
  ],
};

// ─── IT City: Torino ─────────────────────────────────────────

export const itCityTorino: IntlCityContent = {
  slug: "/it/stampa-3d-torino",
  lang: "it",
  locale: "it-IT",
  countryCode: "IT",
  city: "Torino",
  metaTitle: "Stampa 3D Online con Spedizione a Torino — Da 10 €",
  metaDescription:
    "Servizio stampa 3D professionale con spedizione a Torino in solitamente 3–5 giorni lavorativi.",
  h1: "Stampa 3D Online con Spedizione a Torino",
  eyebrow: "Spedizione a Torino · Solitamente 3–5 giorni lavorativi",

  introText: `Torino è storicamente la capitale dell'industria manifatturiera italiana, un tessuto produttivo costruito attorno all'automotive che negli ultimi due decenni si è diversificato verso l'aerospazio, l'intelligenza artificiale e il design digitale. Questa trasformazione ha generato una domanda crescente di prototipazione rapida e di pezzi tecnici one-off che la produzione tradizionale non può soddisfare in modo economico. Il servizio di stampa 3D online di Dimension3D si inserisce in questo spazio con costi trasparenti, tempi prevedibili e nessuna barriera all'ingresso.

L'ecosistema della catena di fornitura automotive torinese è tra i più strutturati d'Italia. Le PMI che gravitano intorno all'universo Stellantis e agli OEM di componentistica meccanica hanno esigenze concrete: dime di controllo dimensionale, fixture di saldatura, supporti personalizzati per attrezzature di linea, modelli funzionali per verificare l'accoppiamento tra parti prima di avviare la produzione. Per questi utilizzi il PETG e l'ABS stampati su camera chiusa sono materiali adeguati: offrono la rigidità e la stabilità termica necessarie senza il costo e i tempi di un'officina CNC per un singolo pezzo o una piccola serie.

Il Politecnico di Torino è uno degli atenei tecnici più prestigiosi d'Europa, con dipartimenti di Ingegneria Meccanica, Aerospaziale e Biomedica attivamente coinvolti in ricerche che richiedono componenti fisici. I laboratori del Politecnico sono risorsa preziosa, ma nei periodi di picco — sessioni di tesi, scadenze di progetto, conferenze internazionali — un servizio esterno affidabile e veloce diventa una valida alternativa per studenti e ricercatori che hanno bisogno di un pezzo in pochi giorni. Ordine minimo 10 €, nessun costo di setup, preventivo entro un'ora: i parametri che contano quando si lavora su budget limitati.

L'OGR — Officine Grandi Riparazioni — è diventato uno dei principali hub tecnologici e creativi del Nordovest italiano. Al suo interno convivono startup tecnologiche, acceleratori di impresa, laboratori di innovazione e studi di design. Questo mix produce una domanda eterogenea: dai prototipi di dispositivi IoT alle installazioni artistiche, dagli housing per elettronica ai pezzi decorativi per presentazioni e pitch. La stampa FDM copre bene tutto questo spettro, con materiali diversi per ogni esigenza.

Torino è anche un polo aerospaziale rilevante: l'ecosistema di fornitori e spin-off legati all'aerospazio regionale produce componenti e strutture di supporto che spesso richiedono pezzi in Nylon o PETG con buona resistenza meccanica. Il Nylon PA che stampiamo sul X2D — dopo adeguata essicazione del filamento — offre resistenza agli urti e bassa frizione, caratteristiche utili per ingranaggi, guide e boccole in ambienti a bassa-media sollecitazione.

La logistica è semplice: la Spagna è nell'Unione Europea come l'Italia, quindi non ci sono dazi né pratiche doganali. Il pacco parte da Barcellona e arriva solitamente in 3–5 giorni lavorativi a Torino. La tariffa di spedizione è piatta a 5,90 € indipendentemente dal numero di pezzi o dal peso. Ricevi tracciatura in tempo reale.

Per iniziare basta caricare il file sul sito. Per ordini fino a 100 € il preventivo è immediato. Se hai bisogno di un consiglio prima di procedere — sul materiale, sulla geometria, sulla fattibilità FDM del tuo progetto — puoi scriverci su WhatsApp. Rispondiamo nelle ore lavorative spagnole, che coincidono con quelle italiane.`,

  deliveryNote:
    "Spedizione da Barcellona, solitamente 3–5 giorni lavorativi a Torino. Nessuna dogana UE. Tariffa piatta 5,90 €.",

  faqs: [
    {
      q: "Stampate materiali adatti a fixture industriali?",
      a: "Sì. Con il Bambu Lab X2D a camera chiusa stampiamo ABS e Nylon con alta stabilità termica, adatti a fixture, dime e supporti per ambienti produttivi.",
    },
    {
      q: "Quanto tempo ci vuole per ricevere il pacco a Torino?",
      a: "Solitamente 3–5 giorni lavorativi dalla conferma dell'ordine. Nessuna dogana, la spedizione è intra-UE.",
    },
    {
      q: "Posso ordinare un singolo pezzo di ricambio?",
      a: "Sì. L'ordine minimo è 10 €. Puoi ordinare anche un singolo pezzo senza costi di setup.",
    },
    {
      q: "Come faccio a sapere se il mio design è stampabile in FDM?",
      a: "Carica il file: il sistema verifica automaticamente le criticità più comuni. Se hai dubbi, scrivici su WhatsApp con il file o una foto del design: ti risponderemo prima che tu proceda all'ordine.",
    },
  ],

  whatsappMsg:
    "Ciao Dimension3D! Sono a Torino e ho bisogno di un preventivo per stampa 3D. Posso inviare il file?",

  hubLink: { to: "/it/stampa-3d-online", label: "Stampa 3D Online Italia" },

  siblingLinks: [
    { to: "/it/stampa-3d-milano", label: "Stampa 3D Milano" },
    { to: "/it/stampa-3d-roma", label: "Stampa 3D Roma" },
  ],

  guideLinks: [
    { to: "/it/prezzi-stampa-3d", label: "Guida ai prezzi stampa 3D" },
    { to: "/it/preparare-file-stampa-3d", label: "Come preparare il file" },
    { to: "/it/materiali-stampa-3d", label: "Guida ai materiali" },
  ],
};

// ─── IT City: Roma ───────────────────────────────────────────

export const itCityRoma: IntlCityContent = {
  slug: "/it/stampa-3d-roma",
  altSlug: "/3d-printing-delivery-rome",
  lang: "it",
  locale: "it-IT",
  countryCode: "IT",
  city: "Roma",
  metaTitle: "Stampa 3D Online con Spedizione a Roma — Da 10 €",
  metaDescription:
    "Servizio stampa 3D professionale con spedizione a Roma in solitamente 3–5 giorni lavorativi.",
  h1: "Stampa 3D Online con Spedizione a Roma",
  eyebrow: "Spedizione a Roma · Solitamente 3–5 giorni lavorativi",

  introText: `Roma è una città di stratificazioni: millenni di storia costruita, modificata, conservata e reinterpretata convivono con istituzioni universitarie di rango mondiale, enti pubblici con esigenze tecniche sofisticate e un tessuto di studi di ingegneria e architettura che lavora ogni giorno su progetti unici. In questo contesto la stampa 3D svolge ruoli molto diversi da quelli che assume in altri contesti industriali, e il servizio online di Dimension3D è strutturato per servire tutta questa varietà con la stessa semplicità operativa.

La Sapienza Università di Roma è una delle università più grandi d'Europa per numero di studenti. I suoi dipartimenti di Ingegneria Civile e Industriale, Ingegneria dell'Informazione e Scienze Fisiche producono costantemente ricerche che richiedono componenti fisici: modelli strutturali in scala, supporti per strumentazione di laboratorio, fixture per esperimenti, housing per prototipi elettronici. L'Università di Roma Tor Vergata, con il suo polo tecnologico a Frascati e le collaborazioni con l'ESA, aggiunge una dimensione aerospaziale e scientifica. Ricercatori e dottorandi che lavorano su budget limitati e scadenze stringenti trovano nel nostro servizio — ordine minimo 10 €, preventivo entro un'ora, spedizione in solitamente 3–5 giorni lavorativi — un'alternativa concreta ai laboratori interni.

Roma ospita anche una delle più importanti comunità di professionisti del patrimonio culturale e della conservazione architettonica. Restauratori, archeologi e storici dell'arte collaborano sempre più con ingegneri strutturali per produrre modelli fisici di siti, reperti o elementi architettonici. La stampa FDM in PLA è adatta a riprodurre geometrie complesse da scansioni 3D — rilievi fotogrammetrici di frammenti lapidei, modelli di capitelli o cornici — per usi documentativi, didattici o di studio pre-intervento. La possibilità di caricare direttamente file OBJ o STEP generati da software di rilievo rende il workflow fluido.

Le istituzioni governative e parastatali che hanno sede a Roma — ministeri, agenzie nazionali, enti di ricerca come l'ENEA o il CNR — spesso necessitano di pezzi tecnici one-off per attrezzature laboratoriali, modelli per comunicazione istituzionale o componenti per sistemi prototipali in sviluppo. La filiera di approvvigionamento pubblica è spesso lenta per piccoli ordini; un servizio che fornisce preventivo rapido, fatturazione chiara e consegna tracciabile in pochi giorni può coprire esigenze che altrimenti resterebbero inevase per settimane.

Gli studi di architettura e urbanistica romani, che lavorano su concorsi internazionali, piani regolatori e riqualificazioni urbane, utilizzano i modelli fisici in scala come strumento di comunicazione con committenti, amministrazioni e comunità. La stampa FDM permette di produrre maquette di edifici, interi isolati o elementi urbani in scala 1:200 o 1:500 in tempi e costi incomparabilmente inferiori a quelli del modellismo manuale tradizionale. Il PETG trasparente o naturale è spesso scelto per le superfici vetrate; il PLA bianco o grigio per le strutture.

Dal punto di vista logistico, Roma è una destinazione ben servita dai corrieri europei. Grazie al mercato unico UE, la spedizione da Barcellona non comporta dogana né oneri aggiuntivi. I pacchi arrivano solitamente in 3–5 giorni lavorativi dall'approvazione dell'ordine. La tariffa di spedizione è piatta a 5,90 € indipendentemente dal numero di pezzi. Non ci sono costi di setup né ordini minimi oltre i 10 €.

Per inviare il file e ricevere il preventivo — immediato per ordini ≤ 100 €, entro un'ora lavorativa per ordini più complessi — è sufficiente accedere al sito e caricare il file STL, OBJ, STEP o 3MF. Se preferisci un confronto preliminare, il team è raggiungibile su WhatsApp nelle ore lavorative.`,

  deliveryNote:
    "Spedizione da Barcellona, solitamente 3–5 giorni lavorativi a Roma. Nessuna dogana UE. Tariffa piatta 5,90 €.",

  faqs: [
    {
      q: "Stampate modelli da file fotogrammetrici per la conservazione del patrimonio?",
      a: "Sì. Accettiamo file OBJ e STL generati da rilievi fotogrammetrici o scansioni 3D. Il PLA è il materiale più usato per questo tipo di modelli documentativi.",
    },
    {
      q: "Quanto tempo ci vuole per ricevere il pacco a Roma?",
      a: "Solitamente 3–5 giorni lavorativi dalla conferma dell'ordine. La spedizione è intra-UE, nessuna dogana.",
    },
    {
      q: "Posso richiedere fattura per un ente o un'università?",
      a: "Sì. Durante il checkout puoi inserire i dati fiscali dell'ente. Contattaci su WhatsApp se hai bisogni specifici di fatturazione istituzionale.",
    },
    {
      q: "Qual è l'ordine minimo?",
      a: "L'ordine minimo è 10 €. Nessun costo di setup.",
    },
  ],

  whatsappMsg:
    "Ciao Dimension3D! Sono a Roma e vorrei un preventivo per la stampa 3D. Posso inviare il file?",

  hubLink: { to: "/it/stampa-3d-online", label: "Stampa 3D Online Italia" },

  siblingLinks: [
    { to: "/it/stampa-3d-milano", label: "Stampa 3D Milano" },
    { to: "/it/stampa-3d-torino", label: "Stampa 3D Torino" },
  ],

  guideLinks: [
    { to: "/it/prezzi-stampa-3d", label: "Guida ai prezzi stampa 3D" },
    { to: "/it/preparare-file-stampa-3d", label: "Come preparare il file" },
    { to: "/it/materiali-stampa-3d", label: "Guida ai materiali" },
  ],
};

// ─── IT Guide: Prezzi ────────────────────────────────────────

export const itGuidePrice: IntlGuideContent = {
  slug: "/it/prezzi-stampa-3d",
  lang: "it",
  locale: "it-IT",
  topic: "price",
  metaTitle: "Prezzi Stampa 3D Online — Guida Completa 2026",
  metaDescription:
    "Come si calcolano i prezzi stampa 3D? Peso del materiale, tempo macchina, scelta del filamento: tutto spiegato con esempi reali.",
  h1: "Prezzi Stampa 3D Online: Come Funziona il Calcolo",
  intro: `Capire come vengono calcolati i prezzi stampa 3D ti aiuta a progettare pezzi più efficienti e a confrontare preventivi in modo informato. La formula di Dimension3D si basa su due componenti: il costo del materiale (proporzionale al peso in grammi) e il costo del tempo macchina (proporzionale alle ore di stampa). Non ci sono costi di setup, né tariffe minime oltre i 10 €.`,

  sections: [
    {
      heading: "Componente 1: il materiale",
      body: `Il costo del materiale è calcolato in base al peso del pezzo in grammi moltiplicato per il coefficiente specifico del filamento. PLA è il materiale di base (coefficiente 1,0); PETG è leggermente più costoso (1,1) per il filamento stesso e per le maggiori esigenze di calibrazione; ABS sale a 1,3 per i requisiti di camera chiusa e tempi di stampa più lenti; Nylon (PA) è il materiale più costoso (1,4) anche per la necessità di pre-essicazione. Il peso del pezzo viene calcolato automaticamente dallo slicer a partire dal volume della mesh e dalla densità del materiale scelto.`,
    },
    {
      heading: "Componente 2: il tempo macchina",
      body: `Il tempo macchina riflette l'occupazione della stampante. Per stampe brevi (0–3 ore) la tariffa è di 4,95 €/ora; per stampe più lunghe (oltre 3 ore) scende a 3,85 €/ora, riflettendo il miglior utilizzo della macchina su run lunghi. Il tempo viene stimato dallo slicer in base alle impostazioni di layer height, velocità e numero di perimetri. Per lo stesso pezzo, una risoluzione a 0,1 mm strato richiederà circa il doppio del tempo rispetto a 0,2 mm strato.`,
    },
    {
      heading: "Ordine minimo e tariffa di spedizione",
      body: `L'ordine minimo è 10 €. Se il calcolo peso + tempo macchina porta a un importo inferiore, il prezzo viene arrotondato al minimo. La spedizione è una tariffa piatta di 5,90 € per qualsiasi destinazione in Italia, indipendentemente dal numero di pezzi o dal peso totale. Non ci sono costi di setup o tariffe aggiuntive.`,
    },
    {
      heading: "Come ottenere il preventivo",
      body: `Per ordini fino a 100 €, il prezzo è immediato: carichi il file STL, OBJ, STEP o 3MF, selezioni materiale e colore, e il sistema calcola automaticamente il preventivo. Per ordini superiori ai 100 € un tecnico rivede il file e risponde entro un'ora nei giorni lavorativi (orario spagnolo, identico a quello italiano). Puoi anche contattarci su WhatsApp per un preventivo preliminare prima di caricare il file.`,
    },
    {
      heading: "Consigli per ridurre il costo",
      body: `Alcune accortezze progettuali possono ridurre significativamente il costo senza compromettere le prestazioni del pezzo: (1) **Ridurre il riempimento interno (infill)**: per pezzi decorativi o modelli visivi, un infill al 10–15% è spesso sufficiente e riduce sia il peso che il tempo. (2) **Scegliere il materiale corretto**: non usare ABS o Nylon se le proprietà meccaniche del PLA sono sufficienti per la tua applicazione. (3) **Orientare correttamente il pezzo**: un'orientazione che minimizza i supporti riduce sia il materiale extra che il tempo di post-elaborazione. (4) **Raggruppare i pezzi**: più pezzi in un singolo ordine condividono la tariffa di spedizione piatta.`,
    },
  ],

  workedExamples: [
    {
      name: "Supporto piccolo in PLA",
      grams: 30,
      hours: 0.5,
      material: "PLA",
      price: "~10 €",
      description:
        "Supporto per cavo o piccolo bracket decorativo. Calcolo: 30 × 0,055 × 1,0 + 0,5 × 4,95 = 1,65 + 2,48 = 4,13 € → arrotondato al minimo d'ordine di 10 €.",
    },
    {
      name: "Connettore funzionale in PETG",
      grams: 80,
      hours: 2,
      material: "PETG",
      price: "~15 €",
      description:
        "Raccordo o giunzione funzionale in PETG per applicazioni con esposizione all'umidità. Calcolo: 80 × 0,055 × 1,1 + 2 × 4,95 = 4,84 + 9,90 = 14,74 € → ~15 €.",
    },
    {
      name: "Involucro tecnico in ABS",
      grams: 200,
      hours: 5,
      material: "ABS",
      price: "~37 €",
      description:
        "Carcassa o alloggiamento per elettronica o componente meccanico soggetto a calore. Calcolo: 200 × 0,055 × 1,3 + 5 × 3,85 = 14,30 + 19,25 = 33,55 € — ma le prime 3 ore a 4,95 €: 200 × 0,055 × 1,3 + 3 × 4,95 + 2 × 3,85 = 14,30 + 14,85 + 7,70 = 36,85 € → ~37 €.",
    },
  ],

  faqs: [
    {
      q: "Il preventivo include l'IVA?",
      a: "Sì, il prezzo mostrato include l'IVA spagnola (21%). Non ci sono costi aggiuntivi nascosti.",
    },
    {
      q: "I prezzi cambiano in base alla quantità?",
      a: "Non esiste uno sconto quantità automatico, ma su grandi serie (es. 50+ pezzi identici) contattaci per una quotazione personalizzata.",
    },
    {
      q: "Posso avere un preventivo senza caricare il file?",
      a: "Puoi contattarci su WhatsApp con le dimensioni approssimative e il materiale desiderato per una stima preliminare. Per un preventivo preciso è necessario il file.",
    },
    {
      q: "Quanto costa la spedizione in Italia?",
      a: "Tariffa piatta 5,90 €, indipendentemente dal numero di pezzi, dal peso e dalla destinazione in Italia.",
    },
  ],

  hubLink: { to: "/it/stampa-3d-online", label: "Stampa 3D Online Italia" },
  cityLinks: [
    { to: "/it/stampa-3d-milano", label: "Stampa 3D Milano" },
    { to: "/it/stampa-3d-torino", label: "Stampa 3D Torino" },
    { to: "/it/stampa-3d-roma", label: "Stampa 3D Roma" },
  ],
};

// ─── IT Guide: File Prep ─────────────────────────────────────

export const itGuideFilePrep: IntlGuideContent = {
  slug: "/it/preparare-file-stampa-3d",
  lang: "it",
  locale: "it-IT",
  topic: "file-prep",
  metaTitle: "Come Preparare il File per la Stampa 3D — Guida FDM",
  metaDescription:
    "Come esportare STL, OBJ, STEP e 3MF per la stampa FDM. Errori comuni, tolleranze, spessori minimi e consigli pratici per ottenere un pezzo di qualità al primo",
  h1: "Come Preparare il File per la Stampa 3D FDM",
  intro: `La qualità di un pezzo stampato in FDM dipende in buona parte dalla qualità del file di partenza. Un file ben preparato si traduce in un preventivo accurato, nessuna richiesta di revisione da parte nostra e un pezzo finale che corrisponde alle aspettative. Questa guida copre i passi essenziali per preparare correttamente un file per la stampa 3D online.`,

  sections: [
    {
      heading: "Formati accettati",
      body: `Accettiamo **STL** (il più comune), **OBJ** (buono per mesh da scansioni), **STEP** (preferibile per pezzi ingegneristici CAD perché mantiene la geometria solida), e **3MF** (moderno e compatto, include informazioni di scala e orientazione). Se esporti da Fusion 360, SolidWorks o FreeCAD, STEP è il formato consigliato per pezzi tecnici; STL va bene per modelli organici o decorativi.`,
    },
    {
      heading: "Risoluzione della mesh STL",
      body: `Quando esporti in STL, imposta la **deviazione della corda (chord deviation)** a 0,01 mm o meno e l'**angolo massimo** a 10° o meno. Un valore troppo alto produce superfici visibilmente sfaccettate; un valore troppo basso genera file enormi senza beneficio pratico. La dimensione ideale di un file STL per la stampa FDM è tra 1 MB e 50 MB.`,
    },
    {
      heading: "Mesh watertight e manifold",
      body: `La mesh deve essere **watertight** (impermeabile): nessun buco, nessuna faccia invertita, nessuna geometria non-manifold. Errori comuni includono superfici duplicate sovrapposte, bordi condivisi da più di due facce, e normali invertite. Puoi verificare la mesh con Meshmixer (gratuito), PrusaSlicer (importa il file e controlla i warning in rosso), o Netfabb (online). Noi eseguiamo una verifica automatica al momento del caricamento e ti segnaliamo eventuali problemi prima di procedere.`,
    },
    {
      heading: "Tolleranze e accoppiamenti",
      body: `La stampa FDM ha una tolleranza dimensionale tipica di ±0,2 mm sui singoli assi e fino a ±0,5 mm su geometrie complesse. Per accoppiamenti meccanici (giunto maschio-femmina, foro-albero) aggiungi un gioco di 0,2–0,4 mm per lato rispetto a un accoppiamento di tornitura. Per filetti stampati, si consiglia di usare filetti metrici M3 o superiori; sotto M3 la qualità non è garantita con FDM. I fori verticali tendono ad essere leggermente ovali: prevedi un'alesatura manuale per accoppiamenti di precisione.`,
    },
    {
      heading: "Spessori minimi",
      body: `Lo spessore minimo raccomandato per pareti e nervature è **1,2 mm** (corrispondente a 3 perimetri con ugello da 0,4 mm). Pareti sotto 0,8 mm possono non stamparsi correttamente o risultare fragili. Per feature decorative come testo in rilievo, l'altezza minima raccomandata è 0,5 mm con larghezza minima 0,8 mm.`,
    },
    {
      heading: "Supporti e orientazione",
      body: `I supporti sono necessari per sporgenze con angolo superiore a 45° rispetto al piano di stampa. Noi aggiungiamo i supporti durante lo slicing — non è necessario modellarli nel file. Tuttavia, **l'orientazione del pezzo** nel tuo file suggerisce quella preferita: se c'è una faccia che deve avere la migliore qualità superficiale, orientala verso l'alto nel file. Se l'orientazione è critica per il tuo progetto, scrivicelo nella nota dell'ordine.`,
    },
    {
      heading: "Unità di misura",
      body: `Esporta sempre **in millimetri**. Errori di scala (es. unità impostate su pollici invece di mm) sono la causa più comune di pezzi stampati con dimensioni errate. La maggior parte dei slicer mostra le dimensioni del modello al caricamento: verifica che corrispondano a quelle attese prima di procedere al pagamento.`,
    },
  ],

  faqs: [
    {
      q: "Posso inviare un file con errori di mesh?",
      a: "Il sistema esegue una verifica automatica. Per errori minori (buchi piccoli, normali invertite isolate) possiamo correggerli noi. Per errori strutturali ti contatteremo prima di procedere.",
    },
    {
      q: "Posso caricare più pezzi in un unico file?",
      a: "Meglio file separati per pezzo, così il preventivo è più preciso. Puoi poi combinarli in un singolo ordine. Se hai un assembly con più parti che devono essere stampate insieme, contattaci prima.",
    },
    {
      q: "Cosa succede se mi sbaglio le unità di misura?",
      a: "Il sistema mostra le dimensioni del modello prima del preventivo. Controlla sempre che le dimensioni in mm corrispondano al tuo progetto. Se hai caricato un file sbagliato puoi ri-caricarlo gratuitamente prima di confermare l'ordine.",
    },
    {
      q: "Accettate file di Blender o altri software creativi?",
      a: "Sì, purché esportati in STL o OBJ con la mesh corretta. I modelli di Blender tendono ad avere mesh più complesse: verifica la watertight-ness prima di esportare.",
    },
  ],

  hubLink: { to: "/it/stampa-3d-online", label: "Stampa 3D Online Italia" },
  cityLinks: [
    { to: "/it/stampa-3d-milano", label: "Stampa 3D Milano" },
    { to: "/it/stampa-3d-torino", label: "Stampa 3D Torino" },
    { to: "/it/stampa-3d-roma", label: "Stampa 3D Roma" },
  ],
};

// ─── IT Guide: Materials ─────────────────────────────────────

export const itGuideMaterials: IntlGuideContent = {
  slug: "/it/materiali-stampa-3d",
  lang: "it",
  locale: "it-IT",
  topic: "materials",
  metaTitle: "Materiali per Stampa 3D FDM — PLA, PETG, ABS, Nylon",
  metaDescription:
    "Guida completa ai materiali FDM: PLA, PETG, ABS e Nylon. Proprietà meccaniche, temperatura di esercizio",
  h1: "Guida ai Materiali per Stampa 3D FDM",
  intro: `Scegliere il materiale giusto è uno dei passi più importanti per ottenere un pezzo stampato in 3D che soddisfi le tue esigenze. Ogni filamento ha un diverso equilibrio tra facilità di stampa, resistenza meccanica, resistenza termica e costo. Questa guida presenta le proprietà essenziali dei quattro materiali che utilizziamo, con indicazioni pratiche su quando scegliere ciascuno.`,

  sections: [
    {
      heading: "PLA — Acido Polilattico",
      body: `Il PLA è il materiale FDM più comune e più economico. Deriva da fonti rinnovabili (mais o canna da zucchero) ed è relativamente rigido e facile da stampare. **Temperatura di esercizio**: fino a circa 55–60 °C; sopra questa soglia il pezzo può deformarsi. **Resistenza meccanica**: buona in trazione e compressione, fragile in impatto. **Ideale per**: prototipi visivi, modelli architettonici, oggettistica, gadget, miniature, pezzi decorativi. **Non adatto per**: pezzi esposti a calore (vicino a fonti di calore, in ambienti caldi, in auto d'estate), carichi dinamici ripetuti, ambienti umidi prolungati. Disponibile nella più ampia gamma di colori.`,
    },
    {
      heading: "PETG — Polietilene Tereftalato Glicole",
      body: `Il PETG combina una stampa relativamente facile con proprietà meccaniche migliori del PLA. È leggermente flessibile (meno fragile in impatto), resistente all'umidità e agli acidi diluiti. **Temperatura di esercizio**: fino a 70–75 °C. **Resistenza meccanica**: superiore al PLA, buona tenacità. **Ideale per**: pezzi funzionali che devono resistere a umidità o prodotti chimici leggeri, contenitori, connettori, parti esterne di dispositivi elettronici, fixture di assemblaggio. **Attenzione**: il PETG tende ad aderire alle superfici di stampa in modo aggressivo e a produrre filamenti sottili ("stringing") se il profilo di stampa non è ottimizzato. Il nostro X2D gestisce bene questi parametri con profili calibrati.`,
    },
    {
      heading: "ABS — Acrilonitrile Butadiene Stirene",
      body: `L'ABS è il materiale tecnico più storico della stampa FDM. Offre buona resistenza meccanica e termica, ed è facilmente lavorabile con solventi (acetone) per ottenere superfici levigate. **Temperatura di esercizio**: fino a circa 95–105 °C. **Resistenza meccanica**: buona resistenza agli urti, meno fragile del PLA. **Ideale per**: carcasse per elettronica, componenti tecnici soggetti a calore moderato, pezzi che devono essere incollati, levigati o verniciati. **Richiede camera chiusa**: l'ABS è soggetto a warping intenso senza camera chiusa riscaldata. Il nostro Bambu Lab X2D è dotato di camera chiusa, il che ci permette di stampare ABS con risultati affidabili.`,
    },
    {
      heading: "Nylon (PA) — Poliammide",
      body: `Il Nylon è il materiale più versatile per applicazioni meccaniche impegnative. Alta resistenza agli urti, bassa frizione superficiale, ottima resistenza all'usura. **Temperatura di esercizio**: fino a 80–100 °C a seconda del grado. **Resistenza meccanica**: eccellente resistenza a fatica e agli urti, buona rigidità. **Ideale per**: ingranaggi, boccole, guide scorrevoli, snap-fit, componenti soggetti a carichi dinamici ripetuti, pezzi che devono scorrere su superfici metalliche. **Richiede pre-essicazione**: il Nylon è igroscopico e assorbe umidità dall'aria, il che degrada la qualità di stampa. Pre-essicchiamo il filamento prima di ogni stampa per garantire risultati ottimali.`,
    },
    {
      heading: "Come scegliere il materiale giusto",
      body: `Una guida pratica alla scelta: (1) **Pezzo visivo o modello?** → PLA. (2) **Pezzo funzionale a temperatura ambiente, con contatto con umidità o prodotti chimici?** → PETG. (3) **Pezzo tecnico soggetto a calore (fino a 100 °C) o che deve essere levigato?** → ABS. (4) **Componente meccanico soggetto a usura, frizione o carichi ciclici?** → Nylon. In caso di dubbio, descrivici l'applicazione su WhatsApp: ti consigliamo il materiale più adatto senza impegno.`,
    },
  ],

  faqs: [
    {
      q: "Qual è il materiale più economico?",
      a: "Il PLA è il materiale più economico. Il costo aumenta nell'ordine PLA < PETG < ABS < Nylon.",
    },
    {
      q: "Posso usare ABS per pezzi esposti al sole in estate?",
      a: "L'ABS regge meglio del PLA al calore, ma la temperatura interna di un'auto in estate (fino a 70–80 °C) è al limite della sua temperatura di esercizio. Per applicazioni esterne critiche, considera materiali specifici come ASA (contattaci per disponibilità).",
    },
    {
      q: "Il Nylon è adatto per ingranaggi piccoli?",
      a: "Sì, il Nylon è uno dei materiali FDM più adatti per ingranaggi grazie alla bassa frizione e alla resistenza all'usura. Per moduli inferiori a 0,5 mm, la risoluzione FDM potrebbe non essere sufficiente: contattaci con i dettagli del progetto.",
    },
    {
      q: "Offrite altri materiali oltre a questi quattro?",
      a: "Per materiali speciali come TPU, PETG-CF o fibra di carbonio, contattaci prima di caricare il file. La disponibilità dipende dalla programmazione della produzione.",
    },
  ],

  hubLink: { to: "/it/stampa-3d-online", label: "Stampa 3D Online Italia" },
  cityLinks: [
    { to: "/it/stampa-3d-milano", label: "Stampa 3D Milano" },
    { to: "/it/stampa-3d-torino", label: "Stampa 3D Torino" },
    { to: "/it/stampa-3d-roma", label: "Stampa 3D Roma" },
  ],
};

// ============================================================
// ██ PORTUGUESE — EUROPEAN (PT)
// ============================================================

// ─── PT Hub ─────────────────────────────────────────────────

export const ptHub: IntlHubContent = {
  slug: "/pt/impressao-3d-online",
  lang: "pt",
  locale: "pt-PT",
  countryCode: "PT",
  metaTitle: "Serviço de Impressão 3D Online",
  metaDescription:
    "Imprimir em 3D de forma rápida e transparente. Estúdio FDM em Barcelona, preço impressão 3D imediato até 100 €, orçamento em 1 hora nos dias úteis.",
  eyebrow: "Impressão 3D Online · Envio para todo o Portugal",
  h1: "Serviço de Impressão 3D Online com Envio para Portugal",
  heroSubtitle: "Carrega o ficheiro, orçamento em 1 hora, envio para Portugal em 3–5 dias úteis. A partir de 10 €, sem encomenda mínima.",
  promise: `A Dimension3D é um estúdio FDM profissional sediado em Barcelona. Graças ao mercado único europeu, as peças viajam de Espanha para Portugal sem qualquer formalidade aduaneira, com a mesma simplicidade de uma encomenda nacional. Seja para obter peças de substituição impressão 3D para equipamentos industriais no Porto, um protótipo para um estúdio criativo em Lisboa, ou um modelo técnico para uma instituição académica, o processo é idêntico: carregue o ficheiro, receba o orçamento em até uma hora nos dias úteis, aprove e aguarde a entrega.

O nosso parque de máquinas é integralmente composto por impressoras Bambu Lab X2D com câmara fechada e cama aquecida. Esta arquitectura assegura a estabilidade térmica necessária para imprimir correctamente materiais técnicos como PETG, ABS e Nylon, reduzindo ao mínimo os defeitos de warping comuns em máquinas abertas de entrada de gama. O resultado são peças com melhor adesão entre camadas, superfícies mais consistentes e dimensões finais mais próximas do nominal.

O preço impressão 3D é calculado de forma transparente: peso do material mais tempo de máquina, sem custos de configuração e sem surpresas. Para encomendas até 100 € obtém um preço imediato assim que carrega o ficheiro. Acima desse limiar, um técnico revê a geometria e responde em até uma hora útil. A encomenda mínima é de 10 €. O envio tem uma tarifa fixa de 5,90 € independentemente do peso ou do destino em Portugal.`,

  howItWorks: `**Como funciona o serviço de impressão 3D online**

1. **Carregue o ficheiro** — aceitamos STL, OBJ, STEP e 3MF. Caso o seu software exporte outro formato, contacte-nos via WhatsApp antes de carregar.
2. **Receba o orçamento** — para encomendas ≤ 100 € o preço aparece imediatamente após a análise automática do modelo. Acima desse valor recebe resposta em até uma hora nos dias úteis.
3. **Escolha o material e o acabamento** — PLA para protótipos rápidos e económicos, PETG para peças funcionais resistentes à humidade, ABS para aplicações a alta temperatura, Nylon para componentes flexíveis e resistentes ao desgaste.
4. **Aprove e pague** — o pagamento é efectuado online em segurança. Não exigimos depósitos nem custos adicionais.
5. **Receba a encomenda** — a encomenda parte de Barcelona e chega habitualmente em 2–4 dias úteis. Receberá o número de rastreio assim que o transportador recolher o pacote.`,

  whatWePrint: `**O que os nossos clientes imprimem**

O serviço de impressão 3D online é utilizado para uma grande variedade de aplicações. As categorias mais frequentes incluem:

- **Protótipos de produto**: modelos de verificação forma/fit/função antes de investir em moldes de injecção. Especialmente útil para quem trabalha em design industrial, embalagem ou electrónica de consumo.
- **Peças de substituição impressão 3D**: componentes de máquinas obsoletas ou descontinuadas, suportes, fixadores e brackets personalizados para equipamentos industriais ou laboratoriais.
- **Modelos arquitectónicos e urbanísticos**: maquetes de edifícios, representações tridimensionais de quarteirões ou planos urbanísticos para apresentações a clientes ou concursos.
- **Componentes para investigação e ensino**: suportes, juntas, gabaritos e fixtures para laboratórios de engenharia, física e ciências da vida.
- **Gadgets personalizados e merchandising**: artigos promocionais, prémios corporativos, modelos ilustrativos, peças únicas para eventos.
- **Modelismo e passatempos**: veículos em escala, miniaturas, acessórios para cosplay, componentes para cenografias.

Se não tiver a certeza de que o seu projecto é adequado para impressão FDM, contacte-nos via WhatsApp com uma fotografia ou imagem de referência: responderemos com honestidade.`,

  materialsText: `**Materiais disponíveis**

- **PLA**: o material mais económico e fácil de imprimir. Excelente para protótipos visuais, modelos e objectos decorativos. Temperatura de serviço até cerca de 55 °C. Disponível em muitas cores.
- **PETG**: bom equilíbrio entre facilidade de impressão e resistência mecânica. Resistente à humidade, ligeiramente flexível, adequado para peças funcionais que não excedam 70–75 °C. Boa resistência química a ácidos diluídos.
- **ABS**: material técnico clássico da impressão FDM, com boa resistência mecânica e térmica (até ~100 °C). Requer câmara fechada do nosso X2D para evitar warping. Adequado para peças técnicas e carcaças.
- **Nylon (PA)**: alta resistência a impactos, baixo atrito, excelente resistência ao desgaste. Ideal para engrenagens, casquilhos, guias e componentes sujeitos a cargas dinâmicas repetidas. Requer pré-secagem do filamento.

Para materiais especiais (fibra de carbono, TPU, PETG-CF) contacte-nos antes de carregar o ficheiro.`,

  fileFormatsText: `**Formatos de ficheiro aceites**: STL, OBJ, STEP (.step / .stp), 3MF. O formato recomendado é STL ou 3MF para garantir compatibilidade com o slicer. Se trabalha com STEP pode carregá-lo directamente: convertemos nós. A resolução mínima recomendada para as malhas STL é 0,01 mm de desvio de corda. Ficheiros demasiado grosseiros podem gerar superfícies facetadas visíveis na peça final.`,

  faqs: [
    {
      q: "Quanto custa imprimir em 3D um objecto?",
      a: "O preço depende principalmente do peso do material e do tempo de impressão. Como referência rápida: peças pequenas (20–50 g, 1–2 horas) custam geralmente entre 10 e 20 €; peças médias (100–200 g, 4–6 horas) entre 25 e 45 €. Carregue o ficheiro para obter um orçamento exacto — para encomendas ≤ 100 € o preço é imediato. Encomenda mínima de 10 €.",
    },
    {
      q: "Quanto tempo demora a encomenda a chegar a Portugal?",
      a: "O envio parte de Barcelona. Habitualmente os tempos de entrega são de 2–4 dias úteis em Portugal. Não há formalidades aduaneiras graças ao mercado único da UE.",
    },
    {
      q: "Tenho de pagar alfândega?",
      a: "Não. Espanha e Portugal fazem ambos parte da União Europeia, pelo que não existem procedimentos aduaneiros nem direitos adicionais. O preço que vê no checkout é o valor final.",
    },
    {
      q: "Que ficheiros posso carregar?",
      a: "Aceitamos STL, OBJ, STEP e 3MF. Se tiver dúvidas sobre o formato ou a qualidade do seu ficheiro, contacte-nos via WhatsApp: ajudamos gratuitamente antes de prosseguir com a encomenda.",
    },
    {
      q: "Existe encomenda mínima?",
      a: "Sim, a encomenda mínima é de 10 €. Não cobramos custos de configuração.",
    },
    {
      q: "Posso encomendar várias peças na mesma encomenda?",
      a: "Sim, pode carregar vários ficheiros na mesma sessão. O sistema calcula o orçamento para cada peça e consolida-as numa única expedição à tarifa fixa de 5,90 €.",
    },
    {
      q: "Imprimem em cores diferentes?",
      a: "Sim, dispomos de PLA, PETG e ABS em diversas cores. O selector de cor está disponível durante a configuração da encomenda. Para cores RAL específicas ou acabamentos especiais, contacte-nos antes.",
    },
  ],

  whatsappMsg:
    "Olá Dimension3D! Gostaria de obter um orçamento para impressão 3D de uma peça. Posso enviar o ficheiro?",
  priceTableCaption:
    "Preços indicativos impressão 3D FDM — IVA espanhol incluído, envio 5,90 € separado",
  breadcrumbHub: "Impressão 3D Online",

  cityLinks: [
    { to: "/pt/impressao-3d-lisboa", label: "Impressão 3D Lisboa" },
    { to: "/pt/impressao-3d-porto", label: "Impressão 3D Porto" },
  ],

  guideLinks: [
    { to: "/pt/preco-impressao-3d", label: "Guia de preços" },
    { to: "/pt/preparar-ficheiro-impressao-3d", label: "Preparar o ficheiro" },
    { to: "/pt/materiais-impressao-3d", label: "Guia de materiais" },
  ],
};

// ─── PT City: Lisboa ─────────────────────────────────────────

export const ptCityLisboa: IntlCityContent = {
  slug: "/pt/impressao-3d-lisboa",
  altSlug: "/3d-printing-delivery-lisbon",
  lang: "pt",
  locale: "pt-PT",
  countryCode: "PT",
  city: "Lisboa",
  metaTitle: "Impressão 3D com Envio para Lisboa — A partir de 10 €",
  metaDescription:
    "Serviço de impressão 3D profissional com envio para Lisboa em habitualmente 2–4 dias úteis.",
  h1: "Impressão 3D Online com Envio para Lisboa",
  eyebrow: "Envio para Lisboa · Habitualmente 2–4 dias úteis",

  introText: `Lisboa é uma das cidades europeias que mais rapidamente se tem afirmado como polo tecnológico e criativo. A transformação do Beato em Beato Tech City — um dos maiores campus de inovação da Península Ibérica — criou um ecossistema denso de startups tecnológicas, laboratórios de hardware e estúdios de design que trabalham diariamente com protótipos físicos. Para estas equipas, a velocidade de iteração é um activo competitivo: uma peça impressa em 3D que chega em dois dias pode ser o diferencial entre apresentar um protótipo funcional a um investidor ou aparecer com renders digitais.

O Beato Tech City e os espaços de co-working adjacentes à Marvila e ao Braço de Prata albergam uma crescente comunidade de fundadores de hardware, engenheiros de produto e designers industriais. A impressão FDM serve aqui múltiplas funções: validação de forma e encaixe antes de avançar para injecção plástica, produção de peças de baixo volume para primeiros clientes, e fabricação de fixtures e gabaritos de montagem para pequenas séries. O serviço de impressão 3D online da Dimension3D elimina a necessidade de equipamento próprio ou de acordos com fornecedores locais: carregue o ficheiro, receba o orçamento, aprove.

A LX Factory, no coração de Alcântara, é um espaço de manufactura criativa onde estúdios de design de produto, ateliers de moda e agências criativas trabalham lado a lado. A impressão 3D em PLA e PETG é amplamente utilizada para produzir modelos físicos de apresentação, peças de cenografia, acessórios e componentes únicos para instalações artísticas. A possibilidade de encomendar uma única peça sem mínimos de série elevados — a encomenda mínima da Dimension3D é de 10 € — torna o serviço acessível mesmo para projectos de orçamento limitado.

O ecossistema do Web Summit, que tem Lisboa como sede permanente, gerou nos últimos anos um fluxo constante de startups de hardware e deeptech que escolheram a cidade como base europeia. Muitas destas empresas trabalham em fases iniciais de desenvolvimento de produto onde a prototipagem física é frequente e os orçamentos de produção ainda não justificam investimento em ferramental. O serviço FDM com câmara fechada da Dimension3D — que permite imprimir ABS e Nylon com qualidade consistente — serve bem estas necessidades técnicas.

A transferência de tecnologia das universidades lisboetas para o sector privado é uma realidade crescente. A NOVA SBE e o Instituto Superior Técnico mantêm programas activos de colaboração com a indústria, e os spin-offs e startups resultantes desses programas frequentemente necessitam de prototipagem rápida para validar conceitos antes de avançar para fases de financiamento. O IST, com os seus departamentos de Engenharia Mecânica, Aeroespacial e de Materiais, produz também uma procura constante de componentes físicos para investigação.

A vantagem logística ibérica é relevante: Lisboa está entre as cidades europeias com melhor ligação de transporte à Península Ibérica. A proximidade geográfica com Barcelona — comparativamente a outras capitais europeias — contribui para que os tempos de envio sejam habitualmente de 2–4 dias úteis, mais rápidos do que para muitas outras origens europeias. Não há alfândega nem taxas adicionais: Espanha e Portugal partilham o mercado único da UE.

O processo é simples: carregue o ficheiro STL, OBJ, STEP ou 3MF no site. Para encomendas até 100 € o orçamento é imediato. Para projectos mais complexos ou encomendas de maior valor, um técnico responde em até uma hora nos dias úteis. A tarifa de envio é fixa em 5,90 € independentemente do número de peças. A encomenda mínima é de 10 €, sem custos de configuração.`,

  deliveryNote:
    "Envio de Barcelona, habitualmente 2–4 dias úteis para Lisboa. Sem alfândega UE. Tarifa fixa 5,90 €.",

  faqs: [
    {
      q: "Em quanto tempo chega a encomenda a Lisboa?",
      a: "Habitualmente em 2–4 dias úteis após a confirmação da encomenda. O envio parte de Barcelona com um transportador expresso europeu, sem formalidades aduaneiras.",
    },
    {
      q: "Imprimem materiais técnicos adequados para startups de hardware?",
      a: "Sim. Utilizamos Bambu Lab X2D com câmara fechada para imprimir ABS, PETG e Nylon com alta estabilidade térmica. Adequado para protótipos funcionais, housings e fixtures.",
    },
    {
      q: "Posso encomendar uma única peça?",
      a: "Sim. A encomenda mínima é de 10 €. Pode encomendar uma única peça sem custos de configuração.",
    },
    {
      q: "Qual é a vantagem de encomendar em Espanha em vez de Portugal?",
      a: "A Dimension3D opera com equipamento Bambu Lab X2D de última geração e câmara fechada, o que permite imprimir materiais técnicos com qualidade superior. Os preços são transparentes e o orçamento é imediato. A proximidade ibérica assegura tempos de entrega competitivos.",
    },
  ],

  whatsappMsg:
    "Olá Dimension3D! Estou em Lisboa e gostaria de um orçamento para impressão 3D. Posso enviar o ficheiro?",

  hubLink: { to: "/pt/impressao-3d-online", label: "Impressão 3D Online Portugal" },

  siblingLinks: [{ to: "/pt/impressao-3d-porto", label: "Impressão 3D Porto" }],

  guideLinks: [
    { to: "/pt/preco-impressao-3d", label: "Guia de preços impressão 3D" },
    { to: "/pt/preparar-ficheiro-impressao-3d", label: "Como preparar o ficheiro" },
    { to: "/pt/materiais-impressao-3d", label: "Guia de materiais" },
  ],
};

// ─── PT City: Porto ──────────────────────────────────────────

export const ptCityPorto: IntlCityContent = {
  slug: "/pt/impressao-3d-porto",
  lang: "pt",
  locale: "pt-PT",
  countryCode: "PT",
  city: "Porto",
  metaTitle: "Impressão 3D Online com Envio para o Porto",
  metaDescription:
    "Serviço de impressão 3D profissional com envio para o Porto em habitualmente 2–4 dias úteis.",
  h1: "Impressão 3D Online com Envio para o Porto",
  eyebrow: "Envio para o Porto · Habitualmente 2–4 dias úteis",

  introText: `O Porto e a região Norte de Portugal formam um dos mais dinâmicos polos industriais e de inovação da Península Ibérica. A base manufatureira da região — com uma longa tradição em metalomecânica, têxtil técnico, calçado de precisão e componentes automóveis — tem vindo a integrar progressivamente tecnologias de fabricação digital, incluindo a impressão 3D, como ferramenta de prototipagem, validação e produção de baixo volume.

A Faculdade de Engenharia da Universidade do Porto (FEUP) é uma das escolas de engenharia mais reconhecidas de Portugal e da Ibéria. Os seus departamentos de Engenharia Mecânica, Engenharia Industrial e Gestão, e Engenharia Electrotécnica e de Computadores produzem uma procura constante de componentes físicos para projectos de investigação, teses de mestrado e doutoramento, e colaborações com a indústria. Estudantes e investigadores que procuram um serviço de impressão 3D online com preços transparentes e prazos previsíveis encontram na Dimension3D uma alternativa aos laboratórios internos, frequentemente sobrecarregados em períodos de maior procura.

O ecossistema de fornecedores industriais do Norte de Portugal inclui empresas que trabalham em cadeia de valor com multinacionais do sector automóvel e agroalimentar. A Bosch Termotecnologia, sediada em Aveiro, e as unidades produtivas da Sogrape e de outros grandes grupos da região fazem parte de uma rede de empresas que frequentemente necessitam de peças de substituição para equipamentos descontinuados, gabaritos de controlo dimensional, ou protótipos funcionais para validação antes de ferramental definitivo. A impressão FDM em PETG ou ABS com câmara fechada cobre bem este tipo de aplicações.

O WOW — World of Wine — no coração de Vila Nova de Gaia, é um exemplo de como o Porto tem atraído projectos culturais e criativos de grande escala que combinam arquitectura, design e tecnologia. Estúdios de design de interiores, ateliers de arquitectura e agências criativas da região utilizam a impressão 3D para produzir modelos em escala, peças de sinalética personalizada, componentes de exposição e acessórios únicos. A possibilidade de encomendar uma única peça ou uma pequena série sem custos de configuração — encomenda mínima de 10 € — torna o serviço acessível para projectos criativos de todas as dimensões.

O corredor Porto–Braga–Guimarães concentra uma das maiores densidades europeias de PME industriais em sectores como moldes, ferramentas de corte e componentes de precisão. Muitas destas empresas têm departamentos de R&D que trabalham com prototipagem rápida para validar novos produtos antes de avançar para produção. A combinação de orçamento rápido (imediato até 100 €, em até uma hora para valores superiores), câmara fechada para materiais técnicos e envio em 2–4 dias úteis cobre bem as necessidades de ciclos curtos de desenvolvimento.

A vantagem logística da proximidade ibérica é relevante para o Porto: Barcelona fica a menos de duas horas de voo, e os corredores de transporte terrestre e logístico entre as duas cidades são bem desenvolvidos. Graças ao mercado único europeu, não há alfândega nem taxas adicionais. A tarifa de envio é fixa em 5,90 € independentemente do número de peças ou do peso. Habitualmente a encomenda chega em 2–4 dias úteis a partir da aprovação.

O processo começa pelo carregamento do ficheiro no site. O sistema aceita STL, OBJ, STEP e 3MF. Para encomendas até 100 € o orçamento é imediato; para valores superiores um técnico responde em até uma hora nos dias úteis. Se tiver dúvidas sobre o material mais adequado para a sua aplicação, a equipa está disponível via WhatsApp nos horários laborais espanhóis, que coincidem com os portugueses.`,

  deliveryNote:
    "Envio de Barcelona, habitualmente 2–4 dias úteis para o Porto. Sem alfândega UE. Tarifa fixa 5,90 €.",

  faqs: [
    {
      q: "Em quanto tempo chega a encomenda ao Porto?",
      a: "Habitualmente em 2–4 dias úteis após a confirmação da encomenda. Sem alfândega, o envio é intra-UE.",
    },
    {
      q: "Imprimem materiais para aplicações industriais?",
      a: "Sim. Com o Bambu Lab X2D de câmara fechada imprimimos ABS, PETG e Nylon com alta estabilidade térmica. Adequado para gabaritos, fixtures e peças de substituição.",
    },
    {
      q: "Posso encomendar uma única peça de substituição?",
      a: "Sim. A encomenda mínima é de 10 €. Pode encomendar uma única peça sem custos de configuração.",
    },
    {
      q: "O preço inclui IVA?",
      a: "Sim. O preço apresentado inclui o IVA espanhol (21%). Não existem custos adicionais ocultos.",
    },
  ],

  whatsappMsg:
    "Olá Dimension3D! Estou no Porto e gostaria de um orçamento para impressão 3D. Posso enviar o ficheiro?",

  hubLink: { to: "/pt/impressao-3d-online", label: "Impressão 3D Online Portugal" },

  siblingLinks: [{ to: "/pt/impressao-3d-lisboa", label: "Impressão 3D Lisboa" }],

  guideLinks: [
    { to: "/pt/preco-impressao-3d", label: "Guia de preços impressão 3D" },
    { to: "/pt/preparar-ficheiro-impressao-3d", label: "Como preparar o ficheiro" },
    { to: "/pt/materiais-impressao-3d", label: "Guia de materiais" },
  ],
};

// ─── PT Guide: Preço ─────────────────────────────────────────

export const ptGuidePrice: IntlGuideContent = {
  slug: "/pt/preco-impressao-3d",
  lang: "pt",
  locale: "pt-PT",
  topic: "price",
  metaTitle: "Preço Impressão 3D Online — Guia Completo 2026",
  metaDescription:
    "Como se calcula o preço da impressão 3D? Peso do material, tempo de máquina, escolha do filamento: tudo explicado com exemplos reais.",
  h1: "Preço da Impressão 3D Online: Como Funciona o Cálculo",
  intro: `Compreender como é calculado o preço da impressão 3D ajuda a conceber peças mais eficientes e a avaliar orçamentos de forma informada. A fórmula da Dimension3D baseia-se em duas componentes: o custo do material (proporcional ao peso em gramas) e o custo do tempo de máquina (proporcional às horas de impressão). Não existem custos de configuração, nem mínimos além dos 10 €.`,

  sections: [
    {
      heading: "Componente 1: o material",
      body: `O custo do material é calculado com base no peso da peça em gramas multiplicado pelo coeficiente específico do filamento. O PLA é o material de base (coeficiente 1,0); o PETG é ligeiramente mais caro (1,1) pelo filamento e pelos maiores requisitos de calibração; o ABS sobe para 1,3 pelos requisitos de câmara fechada e tempos de impressão mais lentos; o Nylon (PA) é o material mais caro (1,4) também pela necessidade de pré-secagem. O peso da peça é calculado automaticamente pelo slicer a partir do volume da malha e da densidade do material escolhido.`,
    },
    {
      heading: "Componente 2: o tempo de máquina",
      body: `O tempo de máquina reflecte a ocupação da impressora. Para impressões curtas (0–3 horas) a tarifa é de 4,95 €/hora; para impressões mais longas (acima de 3 horas) desce para 3,85 €/hora, reflectindo a melhor utilização da máquina em runs prolongados. O tempo é estimado pelo slicer com base nas definições de altura de camada, velocidade e número de perímetros. Para a mesma peça, uma resolução de 0,1 mm por camada requer aproximadamente o dobro do tempo face a 0,2 mm por camada.`,
    },
    {
      heading: "Encomenda mínima e tarifa de envio",
      body: `A encomenda mínima é de 10 €. Se o cálculo peso + tempo de máquina resultar num valor inferior, o preço é arredondado para o mínimo. O envio tem uma tarifa fixa de 5,90 € para qualquer destino em Portugal, independentemente do número de peças ou do peso total. Não existem custos de configuração ou tarifas adicionais.`,
    },
    {
      heading: "Como obter o orçamento",
      body: `Para encomendas até 100 €, o preço é imediato: carregue o ficheiro STL, OBJ, STEP ou 3MF, seleccione o material e a cor, e o sistema calcula automaticamente o orçamento. Para encomendas superiores a 100 € um técnico revê o ficheiro e responde em até uma hora nos dias úteis (horário espanhol, coincidente com o português). Pode também contactar-nos via WhatsApp para um orçamento preliminar antes de carregar o ficheiro.`,
    },
    {
      heading: "Conselhos para reduzir o custo",
      body: `Algumas considerações de projecto podem reduzir significativamente o custo sem comprometer o desempenho da peça: (1) **Reduzir o preenchimento interno (infill)**: para peças decorativas ou modelos visuais, um infill de 10–15% é frequentemente suficiente e reduz tanto o peso como o tempo. (2) **Escolher o material correcto**: não utilize ABS ou Nylon se as propriedades mecânicas do PLA forem suficientes para a sua aplicação. (3) **Orientar correctamente a peça**: uma orientação que minimize os suportes reduz tanto o material extra como o tempo de pós-processamento. (4) **Agrupar as peças**: várias peças numa única encomenda partilham a tarifa fixa de envio.`,
    },
  ],

  workedExamples: [
    {
      name: "Suporte pequeno em PLA",
      grams: 30,
      hours: 0.5,
      material: "PLA",
      price: "~10 €",
      description:
        "Suporte para cabo ou pequeno bracket decorativo. Cálculo: 30 × 0,055 × 1,0 + 0,5 × 4,95 = 1,65 + 2,48 = 4,13 € → arredondado para o mínimo de encomenda de 10 €.",
    },
    {
      name: "Conector funcional em PETG",
      grams: 80,
      hours: 2,
      material: "PETG",
      price: "~15 €",
      description:
        "Ligação ou junção funcional em PETG para aplicações com exposição à humidade. Cálculo: 80 × 0,055 × 1,1 + 2 × 4,95 = 4,84 + 9,90 = 14,74 € → ~15 €.",
    },
    {
      name: "Carcaça técnica em ABS",
      grams: 200,
      hours: 5,
      material: "ABS",
      price: "~37 €",
      description:
        "Carcaça ou alojamento para electrónica ou componente mecânico sujeito a calor. Cálculo: 200 × 0,055 × 1,3 + 3 × 4,95 + 2 × 3,85 = 14,30 + 14,85 + 7,70 = 36,85 € → ~37 €.",
    },
  ],

  faqs: [
    {
      q: "O orçamento inclui IVA?",
      a: "Sim, o preço apresentado inclui o IVA espanhol (21%). Não existem custos adicionais ocultos.",
    },
    {
      q: "Os preços variam em função da quantidade?",
      a: "Não existe desconto de quantidade automático, mas para grandes séries (por exemplo, 50+ peças idênticas) contacte-nos para um orçamento personalizado.",
    },
    {
      q: "Posso obter um orçamento sem carregar o ficheiro?",
      a: "Pode contactar-nos via WhatsApp com as dimensões aproximadas e o material desejado para uma estimativa preliminar. Para um orçamento preciso é necessário o ficheiro.",
    },
    {
      q: "Quanto custa o envio para Portugal?",
      a: "Tarifa fixa de 5,90 €, independentemente do número de peças, do peso e do destino em Portugal.",
    },
  ],

  hubLink: { to: "/pt/impressao-3d-online", label: "Impressão 3D Online Portugal" },
  cityLinks: [
    { to: "/pt/impressao-3d-lisboa", label: "Impressão 3D Lisboa" },
    { to: "/pt/impressao-3d-porto", label: "Impressão 3D Porto" },
  ],
};

// ─── PT Guide: File Prep ─────────────────────────────────────

export const ptGuideFilePrep: IntlGuideContent = {
  slug: "/pt/preparar-ficheiro-impressao-3d",
  lang: "pt",
  locale: "pt-PT",
  topic: "file-prep",
  metaTitle: "Como Preparar o Ficheiro para Impressão 3D — Guia FDM",
  metaDescription:
    "Como exportar STL, OBJ, STEP e 3MF para impressão FDM. Erros comuns, tolerâncias, espessuras mínimas e conselhos práticos para obter uma peça de qualidade na",
  h1: "Como Preparar o Ficheiro para Impressão 3D FDM",
  intro: `A qualidade de uma peça impressa em FDM depende em grande parte da qualidade do ficheiro de partida. Um ficheiro bem preparado traduz-se num orçamento preciso, sem pedidos de revisão da nossa parte, e numa peça final que corresponde às expectativas. Este guia aborda os passos essenciais para preparar correctamente um ficheiro para impressão 3D online.`,

  sections: [
    {
      heading: "Formatos aceites",
      body: `Aceitamos **STL** (o mais comum), **OBJ** (adequado para malhas de digitalizações), **STEP** (preferível para peças de engenharia CAD porque mantém a geometria sólida), e **3MF** (moderno e compacto, inclui informações de escala e orientação). Se exportar do Fusion 360, SolidWorks ou FreeCAD, o STEP é o formato recomendado para peças técnicas; o STL funciona bem para modelos orgânicos ou decorativos.`,
    },
    {
      heading: "Resolução da malha STL",
      body: `Ao exportar em STL, defina o **desvio de corda (chord deviation)** para 0,01 mm ou menos e o **ângulo máximo** para 10° ou menos. Um valor demasiado alto produz superfícies visivelmente facetadas; um valor demasiado baixo gera ficheiros enormes sem benefício prático. O tamanho ideal de um ficheiro STL para impressão FDM situa-se entre 1 MB e 50 MB.`,
    },
    {
      heading: "Malha watertight e manifold",
      body: `A malha deve ser **watertight** (impermeável): sem buracos, sem faces invertidas, sem geometria non-manifold. Erros comuns incluem superfícies duplicadas sobrepostas, arestas partilhadas por mais de duas faces, e normais invertidas. Pode verificar a malha com o Meshmixer (gratuito), o PrusaSlicer (importe o ficheiro e verifique os avisos a vermelho), ou o Netfabb (online). Efectuamos uma verificação automática no momento do carregamento e informamo-lo de eventuais problemas antes de prosseguir.`,
    },
    {
      heading: "Tolerâncias e acoplamentos",
      body: `A impressão FDM tem uma tolerância dimensional típica de ±0,2 mm nos eixos individuais e até ±0,5 mm em geometrias complexas. Para acoplamentos mecânicos (macho-fêmea, furo-veio) adicione uma folga de 0,2–0,4 mm por lado relativamente a um acoplamento de torneamento. Para roscas impressas, recomenda-se a utilização de roscas métricas M3 ou superiores; abaixo de M3 a qualidade não é garantida com FDM. Os furos verticais tendem a ser ligeiramente ovais: preveja uma furação manual para acoplamentos de precisão.`,
    },
    {
      heading: "Espessuras mínimas",
      body: `A espessura mínima recomendada para paredes e nervuras é de **1,2 mm** (correspondente a 3 perímetros com bico de 0,4 mm). Paredes abaixo de 0,8 mm podem não imprimir correctamente ou resultar em peças frágeis. Para elementos decorativos como texto em relevo, a altura mínima recomendada é de 0,5 mm com largura mínima de 0,8 mm.`,
    },
    {
      heading: "Suportes e orientação",
      body: `Os suportes são necessários para saliências com ângulo superior a 45° relativamente ao plano de impressão. Adicionamos os suportes durante o fatiamento — não é necessário modelá-los no ficheiro. No entanto, a **orientação da peça** no seu ficheiro sugere a orientação preferida: se existir uma face que deva ter melhor qualidade superficial, oriente-a para cima no ficheiro. Se a orientação for crítica para o seu projecto, indique-o na nota da encomenda.`,
    },
    {
      heading: "Unidades de medida",
      body: `Exporte sempre **em milímetros**. Erros de escala (por exemplo, unidades definidas em polegadas em vez de mm) são a causa mais comum de peças impressas com dimensões incorrectas. A maioria dos slicers apresenta as dimensões do modelo no momento do carregamento: verifique se correspondem às dimensões esperadas antes de prosseguir para o pagamento.`,
    },
  ],

  faqs: [
    {
      q: "Posso enviar um ficheiro com erros de malha?",
      a: "O sistema efectua uma verificação automática. Para erros menores (buracos pequenos, normais invertidas isoladas) podemos corrigi-los nós. Para erros estruturais contactamo-lo antes de prosseguir.",
    },
    {
      q: "Posso carregar várias peças num único ficheiro?",
      a: "Prefira ficheiros separados por peça para maior precisão do orçamento. Pode depois combiná-los numa única encomenda. Se tiver um assembly com várias partes a imprimir em conjunto, contacte-nos antes.",
    },
    {
      q: "O que acontece se me enganar nas unidades de medida?",
      a: "O sistema apresenta as dimensões do modelo antes do orçamento. Verifique sempre se as dimensões em mm correspondem ao seu projecto. Caso tenha carregado um ficheiro errado, pode recarregá-lo gratuitamente antes de confirmar a encomenda.",
    },
    {
      q: "Aceitam ficheiros do Blender ou de outro software criativo?",
      a: "Sim, desde que exportados em STL ou OBJ com a malha correcta. Os modelos do Blender tendem a ter malhas mais complexas: verifique a impermeabilidade antes de exportar.",
    },
  ],

  hubLink: { to: "/pt/impressao-3d-online", label: "Impressão 3D Online Portugal" },
  cityLinks: [
    { to: "/pt/impressao-3d-lisboa", label: "Impressão 3D Lisboa" },
    { to: "/pt/impressao-3d-porto", label: "Impressão 3D Porto" },
  ],
};

// ─── PT Guide: Materials ─────────────────────────────────────

export const ptGuideMaterials: IntlGuideContent = {
  slug: "/pt/materiais-impressao-3d",
  lang: "pt",
  locale: "pt-PT",
  topic: "materials",
  metaTitle: "Materiais para Impressão 3D FDM — PLA, PETG, ABS, Nylon",
  metaDescription:
    "Guia completo dos materiais FDM: PLA, PETG, ABS e Nylon. Propriedades mecânicas, temperatura de serviço",
  h1: "Guia de Materiais para Impressão 3D FDM",
  intro: `Escolher o material certo é um dos passos mais importantes para obter uma peça impressa em 3D que satisfaça as suas necessidades. Cada filamento apresenta um equilíbrio diferente entre facilidade de impressão, resistência mecânica, resistência térmica e custo. Este guia apresenta as propriedades essenciais dos quatro materiais que utilizamos, com indicações práticas sobre quando escolher cada um.`,

  sections: [
    {
      heading: "PLA — Ácido Poliláctico",
      body: `O PLA é o material FDM mais comum e mais económico. Deriva de fontes renováveis (milho ou cana-de-açúcar) e é relativamente rígido e fácil de imprimir. **Temperatura de serviço**: até cerca de 55–60 °C; acima deste valor a peça pode deformar-se. **Resistência mecânica**: boa em tracção e compressão, frágil ao impacto. **Ideal para**: protótipos visuais, modelos arquitectónicos, objectos decorativos, gadgets, miniaturas, peças de apresentação. **Não adequado para**: peças expostas a calor (perto de fontes de calor, em ambientes quentes, em automóveis no Verão), cargas dinâmicas repetidas, ambientes húmidos prolongados. Disponível na maior variedade de cores.`,
    },
    {
      heading: "PETG — Politereftalato de Etileno Glicol",
      body: `O PETG combina uma impressão relativamente fácil com propriedades mecânicas superiores ao PLA. É ligeiramente flexível (menos frágil ao impacto), resistente à humidade e a ácidos diluídos. **Temperatura de serviço**: até 70–75 °C. **Resistência mecânica**: superior ao PLA, boa tenacidade. **Ideal para**: peças funcionais que devem resistir à humidade ou a produtos químicos ligeiros, contentores, conectores, partes externas de dispositivos electrónicos, fixtures de montagem. **Atenção**: o PETG tende a aderir de forma agressiva às superfícies de impressão e a produzir fios finos ("stringing") se o perfil de impressão não estiver optimizado. O nosso X2D gere bem estes parâmetros com perfis calibrados.`,
    },
    {
      heading: "ABS — Acrilonitrila Butadieno Estireno",
      body: `O ABS é o material técnico clássico da impressão FDM. Oferece boa resistência mecânica e térmica, e é facilmente trabalhável com solventes (acetona) para obter superfícies polidas. **Temperatura de serviço**: até cerca de 95–105 °C. **Resistência mecânica**: boa resistência ao impacto, menos frágil que o PLA. **Ideal para**: carcaças para electrónica, componentes técnicos sujeitos a calor moderado, peças que devem ser coladas, lixadas ou pintadas. **Requer câmara fechada**: o ABS é sujeito a warping intenso sem câmara fechada aquecida. O nosso Bambu Lab X2D está equipado com câmara fechada, o que nos permite imprimir ABS com resultados fiáveis.`,
    },
    {
      heading: "Nylon (PA) — Poliamida",
      body: `O Nylon é o material mais versátil para aplicações mecânicas exigentes. Alta resistência ao impacto, baixo atrito superficial, excelente resistência ao desgaste. **Temperatura de serviço**: até 80–100 °C dependendo do grau. **Resistência mecânica**: excelente resistência à fadiga e ao impacto, boa rigidez. **Ideal para**: engrenagens, casquilhos, guias deslizantes, snap-fit, componentes sujeitos a cargas dinâmicas repetidas, peças que devem deslizar sobre superfícies metálicas. **Requer pré-secagem**: o Nylon é higroscópico e absorve humidade do ar, o que degrada a qualidade de impressão. Efectuamos a secagem do filamento antes de cada impressão para garantir resultados óptimos.`,
    },
    {
      heading: "Como escolher o material certo",
      body: `Um guia prático de selecção: (1) **Peça visual ou modelo?** → PLA. (2) **Peça funcional à temperatura ambiente, com contacto com humidade ou produtos químicos?** → PETG. (3) **Peça técnica sujeita a calor (até 100 °C) ou que deva ser lixada?** → ABS. (4) **Componente mecânico sujeito a desgaste, atrito ou cargas cíclicas?** → Nylon. Em caso de dúvida, descreva-nos a aplicação via WhatsApp: aconselhamos o material mais adequado sem compromisso.`,
    },
  ],

  faqs: [
    {
      q: "Qual é o material mais económico?",
      a: "O PLA é o material mais económico. O custo aumenta na seguinte ordem: PLA < PETG < ABS < Nylon.",
    },
    {
      q: "Posso utilizar ABS para peças expostas ao sol no Verão?",
      a: "O ABS suporta melhor o calor do que o PLA, mas a temperatura interior de um automóvel no Verão (até 70–80 °C) situa-se no limite da sua temperatura de serviço. Para aplicações externas críticas, considere materiais específicos como o ASA (contacte-nos para disponibilidade).",
    },
    {
      q: "O Nylon é adequado para engrenagens pequenas?",
      a: "Sim, o Nylon é um dos materiais FDM mais adequados para engrenagens graças ao baixo atrito e à resistência ao desgaste. Para módulos inferiores a 0,5 mm, a resolução FDM pode não ser suficiente: contacte-nos com os detalhes do projecto.",
    },
    {
      q: "Disponibilizam outros materiais para além destes quatro?",
      a: "Para materiais especiais como TPU, PETG-CF ou fibra de carbono, contacte-nos antes de carregar o ficheiro. A disponibilidade depende do planeamento da produção.",
    },
  ],

  hubLink: { to: "/pt/impressao-3d-online", label: "Impressão 3D Online Portugal" },
  cityLinks: [
    { to: "/pt/impressao-3d-lisboa", label: "Impressão 3D Lisboa" },
    { to: "/pt/impressao-3d-porto", label: "Impressão 3D Porto" },
  ],
};

// ============================================================
// ── Convenience exports
// ============================================================

export const IT_PAGES = {
  hub: itHub,
  cities: [itCityMilano, itCityTorino, itCityRoma],
  guides: [itGuidePrice, itGuideFilePrep, itGuideMaterials],
};

export const PT_PAGES = {
  hub: ptHub,
  cities: [ptCityLisboa, ptCityPorto],
  guides: [ptGuidePrice, ptGuideFilePrep, ptGuideMaterials],
};
