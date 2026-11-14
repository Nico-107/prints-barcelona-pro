// English hub content for /3d-printing-service.
// Powers the same IntlHubPage shell used for the de/fr/nl/it/pt hubs so the
// section set stays identical across the six country hubs (section 6.4).
import type { IntlHubContent } from "@/data/intlTypes";

export const EN_HUB: IntlHubContent = {
  slug: "/3d-printing-service",
  lang: "en",
  locale: "en-GB",
  countryCode: "EU",
  flag: "🇪🇺",

  metaTitle: "3D Printing Service Online · EU Shipping | Dimension3D",
  metaDescription:
    "Online 3D printing service from Barcelona. Upload STL/STEP, get a price in 1 working hour, ships across the EU in 3–5 working days. From 10 €, no setup fee.",

  eyebrow: "🇪🇺 3D printing from Barcelona · Shipping across Europe",

  h1: "3D Printing Service Online — Shipping across Europe",

  heroSubtitle:
    "Upload your file, get a price in one working hour, delivered across the EU in 3–5 working days. From 10 €, even for a single part.",
  ctaLabel: "Upload your file and see the price",
  noRegistration: "No account required · No commitment",
  trustChips: [
    "From 10 €",
    "Quote in 1 working hour",
    "Shipping 5,90 € tracked",
    "No customs within the EU",
  ],
  orgAlternateNames: ["Dimension 3D Prints", "Dimension3D BCN", "Dimension 3D Barcelona"],

  promise: `Dimension3D is a professional FDM print studio based in Barcelona. Thanks to the European single market, your parts travel from Spain to the rest of the EU with no customs formalities — the same way a domestic order would. Whether you need a functional prototype, a 3D-printed spare part for a machine, or a small series of enclosures for an electronics product, the process is always the same: upload the file, get the quote within one working hour, approve, and wait for delivery.

Our entire print fleet is based on Bambu Lab X2D printers with enclosed chambers and heated beds. That architecture provides the thermal stability needed to run technical materials such as PETG, ABS and Nylon cleanly, and keeps warping under control on the kind of parts where entry-level open printers struggle. The result is better interlayer adhesion, more consistent surfaces, and dimensions closer to nominal.

Prices are calculated transparently from material weight and print time — no setup fees and no surprises. For orders up to 200 € the price shows immediately once the file is analysed. Above that threshold a technician reviews the geometry and gets back to you within one working hour. Minimum order 10 €. Shipping is a flat 5,90 € regardless of weight or destination within the EU shipping zone.`,

  howItWorks: `**How the online 3D printing service works**

1. **Upload the file** — STL, OBJ, STEP and 3MF are accepted. If your software exports a different format, message us on WhatsApp before uploading.
2. **Get the quote** — for orders up to 200 € the price appears immediately after automatic analysis. Above that, you receive a response within one working hour.
3. **Choose material and finish** — PLA for fast, economical prototypes; PETG for functional parts that need chemical resistance; ABS for higher temperatures; Nylon for wear-resistant components.
4. **Approve and pay** — payment is handled online; cards, Apple Pay and Google Pay are supported. No deposits and no hidden charges.
5. **Receive the shipment** — the parcel leaves Barcelona and typically arrives in 3–5 working days. You get the tracking number as soon as the courier collects it.`,

  whatWePrint: `**What our customers print**

The online 3D printing service is used across a wide variety of applications. The most common ones:

- **Product prototypes**: form/fit/function checks before committing to injection moulding, especially useful for industrial-design, packaging and consumer-electronics work.
- **3D-printed spare parts**: components for machines that are obsolete or out of production — brackets, supports, clips and custom adapters for industrial or lab equipment.
- **Architectural and urban models**: building maquettes, three-dimensional renders of city blocks or masterplans for client presentations and public tenders.
- **Components for research and universities**: jigs, fixtures, mounts and holders for engineering, physics and life-sciences labs.
- **Custom gadgets and merchandise**: promotional items, corporate awards, demonstrator models and one-off pieces for events.
- **Modelling and hobby**: scale vehicles, miniatures, cosplay props and scenography parts.

If you are not sure whether your project is a good fit for FDM, send us a WhatsApp message with a photo or reference image — we answer honestly.`,

  materialsText: `**Available materials**

- **PLA** — the cheapest and easiest to print. Great for visual prototypes, models and merchandise. Service temperature up to ~55 °C. Many colours in stock.
- **PETG** — good balance of printability and mechanical strength. Humidity-resistant, slightly flexible, suitable for functional parts up to 70–75 °C. Decent chemical resistance against diluted acids.
- **ABS** — the classic FDM technical material, with solid mechanical and thermal performance (up to ~100 °C). Needs the X2D's enclosed chamber to avoid warping. Good for technical parts and housings.
- **Nylon (PA)** — high impact resistance, low friction, excellent wear resistance. Ideal for gears, bushings, guides and parts that take repeated dynamic loads. Filament is pre-dried before printing.

For specialty materials (carbon-fibre composites, TPU, PETG-CF) contact us before uploading the file.`,

  fileFormatsText: `**Accepted file formats**: STL, OBJ, STEP (.step / .stp), 3MF. The recommended formats are STL or 3MF for best slicer compatibility. STEP files are also accepted and converted on our side. The recommended minimum mesh chord deviation for STL is 0.01 mm — overly coarse exports produce visibly faceted surfaces on the final part.`,

  faqs: [
    {
      q: "How much does it cost to 3D print a small part?",
      a: "Pricing depends mainly on material weight and print time. As a quick reference: small parts (20–50 g, 1–2 hours) typically cost between 10 and 20 €; medium parts (100–200 g, 4–6 hours) between 25 and 45 €. Upload the file for an exact quote — for orders up to 200 € the price is immediate. Minimum order 10 €.",
    },
    {
      q: "How long does shipping take across the EU?",
      a: "Parcels leave Barcelona and typically arrive in 3–5 working days anywhere in the EU shipping zone. No customs paperwork, no duties.",
    },
    {
      q: "Do I have to pay customs?",
      a: "No — within the European single market there are no customs formalities or import duties. The price shown at checkout is the final price.",
    },
    {
      q: "What file formats can I upload?",
      a: "STL, OBJ, STEP and 3MF. If you have doubts about the format or quality of your file, message us on WhatsApp — we check it for free before you place the order.",
    },
    {
      q: "Is there a minimum order?",
      a: "Yes, the minimum is 10 €. There is no setup fee.",
    },
    {
      q: "Can I order multiple parts in the same order?",
      a: "Yes — upload multiple files in the same session. The system prices each part and consolidates everything into a single shipment at the flat 5,90 € rate.",
    },
    {
      q: "Do you print in different colours?",
      a: "Yes, we stock PLA, PETG and ABS in several colours. The colour selector appears while configuring the order. For specific RAL colours or special finishes, contact us first.",
    },
    {
      q: "How precise are FDM parts?",
      a: "Typical tolerance on well-oriented FDM parts is ±0.3 mm on dimensions under 100 mm, and ±0.5% on larger dimensions. For tighter tolerances (interference fits, tight bearings) tell us at upload and we will advise on orientation and material.",
    },
  ],

  whatsappMsg:
    "Hi Dimension3D! I'd like a 3D printing quote. Can I send you the file?",
  priceTableCaption:
    "Indicative FDM 3D-printing prices — Spanish VAT included, shipping 5,90 € separate",
  breadcrumbHub: "3D Printing Service",
  materialLabel: "Material",

  cityLinks: [
    { to: "/3d-printing-delivery-paris", label: "3D printing · Paris delivery" },
    { to: "/3d-printing-delivery-berlin", label: "3D printing · Berlin delivery" },
    { to: "/3d-printing-delivery-amsterdam", label: "3D printing · Amsterdam delivery" },
    { to: "/3d-printing-delivery-milan", label: "3D printing · Milan delivery" },
    { to: "/3d-printing-delivery-lisbon", label: "3D printing · Lisbon delivery" },
    { to: "/3d-printing-delivery-rome", label: "3D printing · Rome delivery" },
  ],

  guideLinks: [
    { to: "/how-to-prepare-file-for-3d-printing", label: "Prepare your file" },
    { to: "/3d-file-checker", label: "3D file checker" },
    { to: "/3d-printing-materials-comparison", label: "Materials comparison" },
  ],

  answerBlock: {
    heading: "At a glance",
    facts: [
      "From 10 € per part; minimum order 10 €, no setup fee.",
      "Shipping across the EU: flat 5,90 € with tracking.",
      "Typical lead time: 3–5 working days from approval.",
      "Accepted formats: STL, OBJ, STEP, 3MF.",
      "Payment by card, Apple Pay or Google Pay.",
      "No customs within the European single market.",
    ],
  },
  costTable: {
    caption: "Example delivered costs within the EU (PLA, ×1 part, VAT included).",
    headers: { part: "Part", shipping: "Shipping", total: "Total" },
    rows: [
      { label: "Small (≈ 10 g)",  partEur: "10,00 €", shippingEur: "5,90 €", totalEur: "15,90 €" },
      { label: "Medium (≈ 50 g)", partEur: "15,00 €", shippingEur: "5,90 €", totalEur: "20,90 €" },
      { label: "Large (≈ 200 g)", partEur: "40,00 €", shippingEur: "5,90 €", totalEur: "45,90 €" },
    ],
  },
  shippingHeading: "Shipping and customs",
  shippingText: `Parcels leave Barcelona with a European express courier and typically arrive in 3–5 working days anywhere in the EU shipping zone. The price is a flat 5,90 € regardless of weight.

There are no customs formalities or import duties within the European single market. Spanish VAT is already included in the price shown at checkout. The tracking number is sent as soon as the courier collects the parcel.`,
};
