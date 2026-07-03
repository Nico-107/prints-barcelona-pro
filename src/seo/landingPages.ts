// Centralized SEO landing page content (EN + ES) for Dimension3D Barcelona
// Shared LandingPage template renders one entry per route.

export type Lang = "en" | "es" | "ca" | "fr";

// Stable topic key shared by EN/ES/CA versions of the same page.
// Used to resolve hreflang alternates and equivalent-page language switching.
export type LandingTopic =
  | "service-3d-printing"
  | "custom-parts"
  | "prototypes"
  | "urgent"
  | "pricing"
  | "replacement-parts"
  | "pla"
  | "petg"
  | "tpu"
  | "miniatures"
  | "business"
  | "rapid-prototyping"
  | "functional-parts";

export interface LandingFAQ {
  q: string;
  a: string;
}

export interface LandingSection {
  heading: string;
  body: string; // paragraphs separated by \n\n
}

export interface LandingContent {
  slug: string;            // "/3d-printing-barcelona"
  altSlug: string;         // legacy single-counterpart slug (kept for back-compat)
  topic: LandingTopic;     // shared key across EN/ES/CA versions
  lang: Lang;
  category: "service" | "material" | "use-case";
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: LandingSection[];
  faqs: LandingFAQ[];
  galleryImages: string[]; // paths under /projects/...
  related: { label: string; slug: string }[];
  schemaServiceName: string;
}

const ALL_IMAGES = [
  "/projects/big-ben-tower.jpg",
  "/projects/eiffel-tower.jpg",
  "/projects/green-chameleon.jpg",
  "/projects/halloween-set.jpg",
  "/projects/ferrari-key-holder.jpg",
  "/projects/purple-figures.jpg",
  "/projects/croc-skull.jpg",
  "/projects/black-intake.jpg",
  "/projects/purple-detail.jpg",
  "/projects/intake-manifold.jpg",
  "/projects/blue-molds.jpg",
  "/projects/cookie-cutters.jpg",
  "/projects/curved-parts.jpg",
  "/projects/custom-brackets.jpg",
  "/projects/lion-king-figures.jpg",
  "/projects/lion-king-scene.jpg",
  "/projects/red-adapter.jpg",
  "/projects/stranger-things-diorama.jpg",
  "/projects/stranger-things-lit.jpg",
];

const pick = (...names: string[]) =>
  names.map((n) => `/projects/${n}`).filter((p) => ALL_IMAGES.includes(p));

// ----- EN PAGES -----

export const PAGES_EN: LandingContent[] = [
  {
    slug: "/3d-printing-barcelona",
    topic: "service-3d-printing",
    altSlug: "/impresion-3d-barcelona",
    lang: "en",
    category: "service",
    metaTitle: "3D Printing in Barcelona — Quote in 1h, Delivery 24–48h | Dimension3D",
    metaDescription: "Professional 3D printing in Barcelona. Send your STL/STEP file — quote in under 1 hour, delivery in 24–48h. Functional parts, prototypes and custom prints. Local pickup or Spain-wide shipping.",
    h1: "3D Printing in Barcelona — Fast Quote, Professional Results",
    intro: "Dimension3D is a Barcelona-based 3D printing studio helping individuals, makers, engineers and small businesses bring physical parts to life — fast, clean and at a fair price. From a single replacement clip to a small batch of functional prototypes, we handle the full process locally in the city.",
    sections: [
      {
        heading: "What we print, every week, in Barcelona",
        body: "Our day-to-day work is a mix of custom one-off parts, replacements for objects that broke or are no longer sold, design prototypes for local startups, and personalised gifts. We work with FDM technology and a curated set of materials (PLA, PETG, ABS/ASA, Nylon and TPU) so we can match each project to the right plastic instead of forcing one material on everything.\n\nIf you have a 3D file (STL, OBJ, 3MF, STEP) we can quote it almost immediately. If you only have a photo, a hand sketch or a broken piece, we'll help you turn it into something printable. The goal is always the same: you describe the problem, we deliver the part."
      },
      {
        heading: "Why choose a local Barcelona provider",
        body: "Working with a printer in your own city changes everything. You skip international shipping, customs and language barriers. You can pick up your order in Barcelona by appointment, or have it shipped anywhere in mainland Spain with tracking included. Quotes happen in under 1 hour during business hours over WhatsApp, and we can show you real samples before approving a print.\n\nBeing local also means we can iterate quickly. If a prototype needs a small geometry change, we adjust it and reprint the same day instead of waiting a week for an overseas reorder."
      },
      {
        heading: "Same-day and fast turnaround when you need it",
        body: "Standard orders ship in 2–5 business days. For genuinely urgent jobs we offer an Express service in 24–48 hours, and same-day production when our queue allows it. If you have a deadline — an event, a client demo, a broken appliance you need back in service — tell us upfront and we'll be honest about what's possible.\n\nWe never ship a print that we wouldn't keep ourselves. Each part is checked for layer adhesion, dimensional accuracy and finish before it leaves the workshop."
      },
      {
        heading: "How the process works",
        body: "1. Send us your file or describe what you need on the quote form or via WhatsApp.\n2. We reply with a transparent price, recommended material and timing.\n3. You approve, we print, we test, you receive.\n\nNo subscription, no minimum order, no surprise fees. You only pay for the part you approved."
      }
    ],
    faqs: [
      { q: "How fast can I get a 3D print in Barcelona?", a: "Standard turnaround is 2–5 business days. Express service is 24–48 hours, and same-day is sometimes possible depending on the queue and part size." },
      { q: "Do I need a 3D file to order?", a: "No. If you only have a photo, a sketch or the broken original part, we can help you get to a printable file. We also offer custom design quotes." },
      { q: "Can I pick up my order in Barcelona?", a: "Yes. Local pickup in Barcelona is available by appointment. We also ship to all of mainland Spain with tracking." },
      { q: "What does a 3D print cost?", a: "Most small parts start around 10€. Final price depends on size, material, print time and quantity. You always get a transparent quote before paying anything." },
      { q: "Do you offer resin printing or FDM only?", a: "We work with FDM technology, which covers the vast majority of practical applications — functional parts, prototypes, gifts and replacements. If a project genuinely requires resin-level surface detail, we'll tell you upfront." },
      { q: "What is the maximum size you can print in one piece?", a: "Our print volume is approximately 250×250×300 mm. Objects larger than that can be printed in sections and cleanly assembled, with joints planned to minimise visibility." }
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "green-chameleon.jpg", "eiffel-tower.jpg", "purple-figures.jpg", "halloween-set.jpg", "intake-manifold.jpg"),
    related: [
      { label: "Custom Parts", slug: "/custom-parts-barcelona" },
      { label: "Prototype Printing", slug: "/prototype-printing-barcelona" },
      { label: "Urgent 3D Printing", slug: "/urgent-3d-printing-barcelona" },
      { label: "Pricing", slug: "/3d-printing-price-barcelona" }
    ],
    schemaServiceName: "3D Printing Service Barcelona"
  },
  {
    slug: "/custom-parts-barcelona",
    topic: "custom-parts",
    altSlug: "/piezas-personalizadas-3d-barcelona",
    lang: "en",
    category: "use-case",
    metaTitle: "Custom 3D Printed Parts Barcelona — STL/STEP or Photo, Quote in 1h | Dimension3D",
    metaDescription: "Custom 3D printed parts in Barcelona from your STL, STEP or photo. Functional replacements, brackets, automotive clips and prototypes. Professional quote in under 1 hour. No minimum order.",
    h1: "Custom 3D Printed Parts in Barcelona — From File to Part in 24–48h",
    intro: "Need a part that doesn't exist on any shelf? That's exactly what we do. Dimension3D produces custom 3D printed parts in Barcelona for households, workshops, drivers and makers — from a single broken clip to small batches of bespoke brackets.",
    sections: [
      {
        heading: "Common custom parts we print",
        body: "Some of the most frequent jobs we receive in Barcelona include: replacement plastic parts for appliances (washing machines, fridges, dishwashers, vacuum cleaners), broken automotive clips and trim pieces, mounting brackets for shelves, monitors and equipment, knobs and handles, drawer rails, organizers, bicycle accessories, and protective enclosures for electronics.\n\nIf the original part is no longer manufactured, or the manufacturer charges an absurd price for a tiny plastic piece, a custom 3D print is usually faster, cheaper and just as durable when made in the right material."
      },
      {
        heading: "Send a photo, get a part",
        body: "You don't need a 3D file. Most of our custom-part customers send a WhatsApp photo of the broken piece next to a ruler or a coin for scale. From there we can usually:\n\n• confirm whether it's printable,\n• recommend a material (PLA for non-load parts, PETG or ABS for stressed parts, TPU for flexible parts),\n• and give you a transparent price within the hour.\n\nFor more complex shapes we can also work from a STEP/STL file, technical drawings or measurements you provide."
      },
      {
        heading: "One-off parts and small batches",
        body: "There's no minimum order. We're equally happy printing a single replacement bracket as we are running a small batch of identical pieces for a workshop, a dental clinic, an architecture studio or a local store. For repeat customers we keep the file on record so reorders are instant."
      },
      {
        heading: "Built to actually last",
        body: "A 3D printed part is only as good as its material and print parameters. We pick the plastic and infill density based on what the part has to do — not the cheapest option. That's why custom parts from Dimension3D are often more durable than the original injected plastic they replace."
      }
    ],
    faqs: [
      { q: "Can you copy a broken part from a photo?", a: "In most cases yes — especially symmetric or simple geometric parts. Send a clear photo with a ruler or coin for scale and we'll let you know quickly." },
      { q: "What materials do you recommend for custom parts?", a: "PLA for decorative or low-stress parts, PETG for outdoor or moderately stressed parts, ABS/ASA for heat-resistant parts, and TPU for flexible parts like grips or seals." },
      { q: "Is there a minimum order?", a: "No. We print single pieces all the time, and you only pay for what you order." },
      { q: "How accurate are custom parts?", a: "Typical FDM precision is around ±0.2 mm. For tighter tolerances we adjust print parameters and can post-process critical surfaces." },
      { q: "Can you recreate a part purely from measurements, without the original?", a: "Yes. If you can provide detailed measurements, photos from multiple angles, or a technical sketch, we can model and print the part. For complex geometries a short consultation helps clarify fit requirements." },
      { q: "What happens if the printed part doesn't fit on the first attempt?", a: "FDM holds ±0.2 mm typical precision. If a first print is slightly off for a tight-tolerance fit, we apply a small dimensional adjustment (usually 0.1–0.2 mm) and reprint at a reduced cost." }
    ],
    galleryImages: pick("custom-brackets.jpg", "ferrari-key-holder.jpg", "red-adapter.jpg", "intake-manifold.jpg", "black-intake.jpg", "curved-parts.jpg"),
    related: [
      { label: "Replacement Parts", slug: "/replacement-parts-barcelona" },
      { label: "Prototype Printing", slug: "/prototype-printing-barcelona" },
      { label: "PETG Printing", slug: "/petg-printing-barcelona" },
      { label: "Urgent 3D Printing", slug: "/urgent-3d-printing-barcelona" }
    ],
    schemaServiceName: "Custom 3D Printed Parts Barcelona"
  },
  {
    slug: "/prototype-printing-barcelona",
    topic: "prototypes",
    altSlug: "/prototipos-3d-barcelona",
    lang: "en",
    category: "use-case",
    metaTitle: "Prototype 3D Printing in Barcelona | Rapid Prototyping",
    metaDescription: "Rapid prototyping in Barcelona for startups, engineers and students. Functional prototypes, product testing, iteration runs. Fast turnaround, transparent pricing.",
    h1: "Prototype 3D Printing in Barcelona",
    intro: "Dimension3D is a Barcelona partner for anyone iterating on a physical product — startups validating their first hardware, freelance engineers, industrial designers, university students and inventors. We print functional prototypes you can actually test, not just look at.",
    sections: [
      {
        heading: "Rapid prototyping that keeps your project moving",
        body: "The whole point of a prototype is to learn fast. Every extra week between iterations costs you time, money and momentum. Working with a local Barcelona printer means you can go from CAD revision to a part in hand in 24–72 hours, instead of waiting on an overseas service.\n\nWe accept STL, OBJ, 3MF and STEP files. If you're using SolidWorks, Fusion 360, Onshape, Rhino, FreeCAD or Tinkercad we can take their native exports without trouble."
      },
      {
        heading: "Functional prototypes, not display models",
        body: "We help you choose materials based on what the prototype has to do. PLA is great for first form-fit checks. PETG handles moderate stress and outdoor exposure. ABS/ASA tolerates heat. Nylon and Nylon-CF give you mechanical strength close to engineering plastics. TPU lets you prototype seals, gaskets and flexible covers.\n\nThis matters because a prototype that fails for the wrong reason — wrong material, wrong infill — wastes a whole iteration cycle."
      },
      {
        heading: "Startups, engineers, makers and student projects",
        body: "We work regularly with:\n\n• Barcelona-based hardware startups validating MVPs.\n• Freelance product designers presenting to clients.\n• Engineers needing fixtures, jigs and end-of-arm tooling.\n• UPC, ESDi, Elisava and IED students producing final-year projects.\n• Inventors filing patents who need a working physical sample.\n\nWe're happy to sign NDAs for confidential projects."
      },
      {
        heading: "From single prototypes to small production runs",
        body: "Once a prototype is validated, we can scale into low-volume production runs (typically 5 to 200 units depending on size) without you having to switch supplier. That continuity matters when you're trying to ship a product, not just print one."
      }
    ],
    faqs: [
      { q: "Which 3D file formats do you accept?", a: "STL, OBJ, 3MF and STEP. We can also work from native CAD exports — just ask." },
      { q: "Do you sign NDAs for confidential prototypes?", a: "Yes. We regularly sign NDAs for hardware startups and R&D departments." },
      { q: "Can you do small production runs after the prototype?", a: "Yes. We routinely produce 5–200 unit batches once a design is validated." },
      { q: "How fast is one iteration?", a: "Most prototype iterations are ready within 24–72 hours depending on size and material." },
      { q: "Is FDM better than resin for my prototype?", a: "For functional prototypes that need to be handled, tested or stressed, FDM is usually better — it produces stronger, tougher parts across a wider material range. Resin has higher surface detail but is more brittle. We'll advise based on what your prototype needs to prove." },
      { q: "What happens if you find a problem in my file during review?", a: "We flag it in the quote before starting — wall-thickness issues, unsupported overhangs, orientation problems that would affect strength. You decide whether to revise the file or proceed as-is with our recommendations." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "black-intake.jpg", "red-adapter.jpg", "blue-molds.jpg", "curved-parts.jpg"),
    related: [
      { label: "Custom Parts", slug: "/custom-parts-barcelona" },
      { label: "Urgent 3D Printing", slug: "/urgent-3d-printing-barcelona" },
      { label: "Pricing", slug: "/3d-printing-price-barcelona" },
      { label: "PETG Printing", slug: "/petg-printing-barcelona" }
    ],
    schemaServiceName: "Rapid Prototyping Barcelona"
  },
  {
    slug: "/urgent-3d-printing-barcelona",
    topic: "urgent",
    altSlug: "/impresion-3d-urgente-barcelona",
    lang: "en",
    category: "service",
    metaTitle: "Urgent 3D Printing in Barcelona | Same-Day & 24h",
    metaDescription: "Urgent 3D printing in Barcelona. Priority queue, same-day and 24–48h express delivery for broken parts, events and cosplay emergencies. WhatsApp now.",
    h1: "Urgent 3D Printing in Barcelona",
    intro: "Sometimes a part can't wait. A broken appliance is blocking your kitchen, a client demo is tomorrow, a cosplay deadline is this weekend. Dimension3D offers an Express 3D printing service in Barcelona with priority queueing, 24–48 hour delivery, and same-day production when our printers allow it.",
    sections: [
      {
        heading: "How urgent jobs work",
        body: "Send us a WhatsApp with what you need and your deadline. Within minutes (during business hours) we'll tell you honestly:\n\n• whether your timeline is realistic,\n• which material we recommend to print fastest without sacrificing the function,\n• and the express price.\n\nWe don't take the order if we can't deliver — we'd rather lose a job than let a customer down on a deadline."
      },
      {
        heading: "Typical urgent use cases",
        body: "• Broken appliance parts blocking daily life (washing machine pulls, fridge clips, vacuum nozzles).\n• Last-minute event props, signs, holders, brand pieces.\n• Cosplay accessories before a convention or photoshoot.\n• Engineering fixtures or replacement clips on a production line.\n• Demo prototypes for an investor meeting.\n\nIf it's printable in FDM and the geometry is reasonable, we can usually fit it into the queue."
      },
      {
        heading: "Priority queue, no design corners cut",
        body: "Express doesn't mean sloppy. We still slice with proper supports, calibrated temperatures and post-check every part before it leaves the workshop. The difference is that your job moves to the top of the queue and runs on the next available printer instead of waiting for a slot."
      },
      {
        heading: "Pickup or fast Barcelona delivery",
        body: "For urgent orders within Barcelona, local pickup by appointment is the fastest option. We can also coordinate same-day courier delivery within the city for jobs that genuinely can't be picked up. For the rest of mainland Spain, express tracked shipping is available."
      }
    ],
    faqs: [
      { q: "Can I really get a 3D print the same day in Barcelona?", a: "Sometimes — it depends on the size, the material and the current queue. WhatsApp us with the part and the deadline and we'll answer honestly within minutes." },
      { q: "How much extra does urgent printing cost?", a: "Express jobs carry a priority surcharge that depends on the size and timeline. You always see the full price before approving the order." },
      { q: "What's the fastest way to send my file?", a: "WhatsApp at +34 672 051 147. Attach your STL/STEP/photo and tell us the deadline." },
      { q: "Can urgent prints still be high quality?", a: "Yes. We don't sacrifice layer adhesion, dimensional accuracy or finish for speed — we just give your job priority." },
      { q: "Do you work weekends for genuine emergencies?", a: "Contact us via WhatsApp — for real emergencies we sometimes accommodate weekend production. It's not a guaranteed service, but always worth asking if your situation is critical." },
      { q: "What's the absolute minimum lead time possible?", a: "For small, simple parts in PLA or PETG, we've had orders ready for local pickup in as little as 3–6 hours from file approval. Larger or more complex parts always need more time." }
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "halloween-set.jpg", "stranger-things-lit.jpg", "lion-king-figures.jpg", "intake-manifold.jpg", "custom-brackets.jpg"),
    related: [
      { label: "Replacement Parts", slug: "/replacement-parts-barcelona" },
      { label: "Custom Parts", slug: "/custom-parts-barcelona" },
      { label: "Prototype Printing", slug: "/prototype-printing-barcelona" },
      { label: "Pricing", slug: "/3d-printing-price-barcelona" }
    ],
    schemaServiceName: "Urgent Express 3D Printing Barcelona"
  },
  {
    slug: "/3d-printing-price-barcelona",
    topic: "pricing",
    altSlug: "/precio-impresion-3d-barcelona",
    lang: "en",
    category: "service",
    metaTitle: "3D Printing Prices Barcelona — From 10€, Free Quote in 1h | Dimension3D",
    metaDescription: "How much does 3D printing cost in Barcelona? Small parts from 10€. Transparent pricing by size, material and quantity. Free quote in under 1 hour, no commitment.",
    h1: "3D Printing Prices in Barcelona",
    intro: "One of the first questions every customer asks is: how much will my 3D print cost? On this page we explain exactly what drives the price of a 3D print in Barcelona, with realistic examples, so you can plan your project with no surprises.",
    sections: [
      {
        heading: "What drives 3D printing prices",
        body: "Three things mainly determine the price of a 3D print:\n\n1. Material cost — PLA is the most affordable; PETG, ABS/ASA and TPU cost slightly more; Nylon and Nylon-CF are the most premium.\n2. Print time and size — bigger and taller parts use more plastic and occupy the printer for longer.\n3. Complexity — heavy supports, very fine detail, post-processing or assembly add work.\n\nWe give you a single transparent price that already includes setup, slicing, material, machine time and basic finishing."
      },
      {
        heading: "Typical price ranges",
        body: "These ranges are realistic for FDM prints in Barcelona:\n\n• Small parts (replacement clip, knob, hook, small figure): from 10€.\n• Medium parts (mounting bracket, organizer, decorative piece, mid-size figure): typically 20–60€.\n• Large parts (helmets, vases, big enclosures, tall figures): typically 60–250€.\n• Small batches: ask for a per-unit price — repeated parts get cheaper per unit.\n\nThese are starting references. The exact quote depends on your file, the chosen material and the deadline."
      },
      {
        heading: "Quantity discounts",
        body: "Repeated parts cost less per unit because slicing and setup happen once. If you need 5, 20 or 200 of the same piece, mention it in your quote request — we'll tell you exactly how the per-unit price drops as quantity grows."
      },
      {
        heading: "How to get a transparent quote",
        body: "Send your STL/OBJ/3MF/STEP file (or a photo and rough dimensions) through the upload form on our homepage or via WhatsApp. Within an hour during business hours we'll send you a clear price, the recommended material, and the realistic delivery time. Nothing is charged until you confirm the order."
      }
    ],
    faqs: [
      { q: "What's the cheapest 3D print you do?", a: "Small simple parts in PLA start around 10€. Bigger or stronger materials cost more." },
      { q: "Do you charge for the quote?", a: "No. Quotes are always free and you only pay if you confirm the order." },
      { q: "Why does the same part cost more in PETG or Nylon?", a: "Those filaments are more expensive and print slower with tighter parameters, but they last longer in stressed or outdoor applications." },
      { q: "Do bigger orders get cheaper per piece?", a: "Yes. Tell us the quantity and we'll send you a tiered price." },
      { q: "Is the quoted price fixed once I approve?", a: "Yes. Once you approve a quote the price is locked. Quotes are valid for 30 days from issue — if material costs change significantly after that period, we may need to revise." },
      { q: "Can I get a rough estimate without sending a file?", a: "Yes — describe the part size, material and quantity and we'll give you a realistic ballpark range. For an accurate binding quote, a file or clear photo with dimensions is needed." }
    ],
    galleryImages: pick("custom-brackets.jpg", "ferrari-key-holder.jpg", "purple-figures.jpg", "cookie-cutters.jpg", "blue-molds.jpg", "red-adapter.jpg"),
    related: [
      { label: "3D Printing Service", slug: "/3d-printing-barcelona" },
      { label: "Custom Parts", slug: "/custom-parts-barcelona" },
      { label: "PLA Printing", slug: "/pla-printing-barcelona" },
      { label: "Prototype Printing", slug: "/prototype-printing-barcelona" }
    ],
    schemaServiceName: "3D Printing Pricing Barcelona"
  },
  {
    slug: "/replacement-parts-barcelona",
    topic: "replacement-parts",
    altSlug: "/recambios-impresion-3d-barcelona",
    lang: "en",
    category: "use-case",
    metaTitle: "3D Printed Replacement Parts Barcelona — Broken Clips & Appliance Parts Fixed | Dimension3D",
    metaDescription: "3D printed replacement parts in Barcelona for appliances, furniture and vehicles. Broken clips, knobs, brackets and discontinued parts. Photo to part in 24–48h. From 10€.",
    h1: "3D Printed Replacement Parts in Barcelona",
    intro: "Throwing away a perfectly working appliance because of a tiny broken plastic part doesn't make sense — environmentally or financially. Dimension3D produces 3D printed replacement parts in Barcelona for appliances, furniture, vintage items and any object where the original part is no longer available.",
    sections: [
      {
        heading: "Replacements we make all the time",
        body: "Common requests we handle in Barcelona:\n\n• Washing machine and dishwasher detergent drawer parts, latches and clips.\n• Fridge shelf supports, drawer rails and hinges.\n• Vacuum cleaner brush adapters and clips.\n• Coffee machine knobs and water tank parts.\n• Furniture connectors and shelf brackets.\n• Vintage radio, camera and toy parts.\n• Bicycle and scooter clips, mounts, brackets.\n\nIf the original part broke, deformed or simply disappeared, there's a good chance we can recreate it."
      },
      {
        heading: "When the part isn't sold anymore",
        body: "Many manufacturers stop selling spare parts after a few years, leaving owners with a perfectly functional product and a missing 5€ piece of plastic. We can reverse-engineer the part from a clear photo with scale, from the broken original, or from your measurements — and print it in a material that will outlast the original."
      },
      {
        heading: "Sustainable repair instead of replacement",
        body: "Repairing instead of replacing avoids manufacturing emissions and electronic waste. A 3D printed plastic part typically uses a fraction of the energy and materials of producing a whole new appliance. We're a small contribution to the right-to-repair movement here in Barcelona."
      },
      {
        heading: "How to order a replacement part",
        body: "Send a WhatsApp with:\n\n1. A clear photo of the broken part next to a ruler or coin.\n2. A photo of where it goes (so we understand how it mounts).\n3. The brand and model of the device, if you know it.\n\nWe reply with feasibility, material recommendation and price within the hour during business hours."
      }
    ],
    faqs: [
      { q: "Can you replace any plastic part?", a: "Most simple plastic parts yes. Very thin elastic clips or parts made for high heat may need a specific material — we'll tell you upfront if it's not feasible." },
      { q: "How long does a printed replacement last?", a: "When made in the right material (PETG, ABS or Nylon for stressed parts), printed replacements often outlast the original injection-moulded plastic." },
      { q: "Is repair cheaper than buying a new appliance?", a: "Almost always. A printed part typically costs 10–60€ versus hundreds for a new appliance." },
      { q: "Can you print parts for vintage equipment?", a: "Yes. Vintage cameras, radios, toys and appliances are some of our favourite jobs because the original spare parts don't exist anymore." },
      { q: "What information gives the most accurate first-print result?", a: "A clear photo of the broken part next to a ruler or coin, a photo showing where it mounts on the device, and the brand and model name. The more context, the better the first-try fit." },
      { q: "Can you make replacement parts in metal?", a: "No — we work exclusively with polymer filaments (PLA, PETG, ABS/ASA, Nylon, TPU). For metal parts you would need a CNC machining or casting service. Our polymer replacements often outlast originals in low-heat applications." }
    ],
    galleryImages: pick("custom-brackets.jpg", "red-adapter.jpg", "curved-parts.jpg", "black-intake.jpg", "intake-manifold.jpg", "ferrari-key-holder.jpg"),
    related: [
      { label: "Custom Parts", slug: "/custom-parts-barcelona" },
      { label: "PETG Printing", slug: "/petg-printing-barcelona" },
      { label: "Urgent 3D Printing", slug: "/urgent-3d-printing-barcelona" },
      { label: "3D Printing Service", slug: "/3d-printing-barcelona" }
    ],
    schemaServiceName: "3D Printed Replacement Parts Barcelona"
  },
  {
    slug: "/pla-printing-barcelona",
    topic: "pla",
    altSlug: "/impresion-pla-barcelona",
    lang: "en",
    category: "material",
    metaTitle: "PLA 3D Printing Barcelona — Prototypes, Gifts & Decorations | Dimension3D",
    metaDescription: "PLA 3D printing in Barcelona — accurate, affordable and eco-friendly. Prototypes, decorative pieces, personalised gifts and figures. Wide colour range. Free quote in under 1 hour.",
    h1: "PLA 3D Printing in Barcelona",
    intro: "PLA is the most popular 3D printing material in the world for good reason — it's eco-friendly, easy to print with high accuracy, and available in a huge range of colours. Dimension3D offers professional PLA 3D printing in Barcelona for everything from decorative pieces to early prototypes.",
    sections: [
      {
        heading: "Why PLA",
        body: "PLA (Polylactic Acid) is a bioplastic derived from renewable sources like corn starch. Compared to other 3D printing materials it's:\n\n• Eco-friendly and biodegradable in industrial composting conditions.\n• Easy to print at very high resolution, capturing fine details.\n• Available in dozens of colours and finishes (matte, silk, glossy, glow-in-the-dark, marble, wood-fill).\n• More affordable than engineering plastics.\n\nIts main limitations are heat sensitivity (it softens above ~55°C) and lower mechanical resistance compared to PETG, ABS or Nylon."
      },
      {
        heading: "What PLA is best for",
        body: "We recommend PLA for:\n\n• Decorative pieces, sculptures, figures and dioramas.\n• Architectural and product design prototypes.\n• Gifts, personalised items, custom keychains.\n• Cookie cutters, planters, organizers (indoor use).\n• Educational and student projects.\n• Tabletop miniatures and collectibles.\n\nFor anything that needs to live outdoors, hold weight or resist heat, we'll usually recommend PETG, ABS/ASA or Nylon instead."
      },
      {
        heading: "Colour and finish options",
        body: "We stock a wide range of PLA colours: classic black, white and grey for prototypes; vibrant reds, blues, greens, yellows and purples for decorative work; and specialty filaments like silk, matte, marble-effect and glow-in-the-dark. If you're after a specific brand colour or Pantone, send us the reference and we'll match it as closely as possible."
      },
      {
        heading: "Great value, fast turnaround",
        body: "Because PLA prints fast and reliably, it's also one of the most affordable materials we offer. Small PLA parts start around 10€, and most PLA orders ship within 2–5 business days. Express turnaround is available for urgent jobs."
      }
    ],
    faqs: [
      { q: "Is PLA strong enough for functional parts?", a: "For low to moderate stress, yes. For load-bearing or high-temperature parts we recommend PETG, ABS/ASA or Nylon." },
      { q: "Is PLA really biodegradable?", a: "Yes, in industrial composting conditions. In a regular drawer it lasts for years." },
      { q: "Can you print PLA in any colour?", a: "We stock a wide standard range. For special colours, tell us the reference and we'll source the closest match." },
      { q: "What's the maximum size you can print in PLA?", a: "Typical maximum print volume is around 250×250×300 mm in one piece. Bigger objects can be printed in sections and assembled." },
      { q: "Can PLA prints be sanded, primed and painted?", a: "Yes. PLA sands easily with standard sandpaper, takes acrylic primer well, and can be painted with aerosol or brush-on acrylic paints. It's the ideal material for figures and decorative pieces you plan to finish." },
      { q: "Is PLA safe for food contact?", a: "Standard PLA is not certified for food contact — the porous FDM surface can harbour bacteria even after washing. We don't recommend it for cups, plates or cutlery. For food-contact applications, ask us about certified food-safe materials." }
    ],
    galleryImages: pick("eiffel-tower.jpg", "big-ben-tower.jpg", "green-chameleon.jpg", "purple-figures.jpg", "halloween-set.jpg", "ferrari-key-holder.jpg"),
    related: [
      { label: "PETG Printing", slug: "/petg-printing-barcelona" },
      { label: "TPU Printing", slug: "/tpu-printing-barcelona" },
      { label: "Miniatures", slug: "/miniatures-barcelona" },
      { label: "Pricing", slug: "/3d-printing-price-barcelona" }
    ],
    schemaServiceName: "PLA 3D Printing Barcelona"
  },
  {
    slug: "/petg-printing-barcelona",
    topic: "petg",
    altSlug: "/impresion-petg-barcelona",
    lang: "en",
    category: "material",
    metaTitle: "PETG 3D Printing Barcelona — Functional & Outdoor Parts | Dimension3D",
    metaDescription: "PETG 3D printing in Barcelona. Stronger than PLA, water and UV resistant. Send your STL/STEP — quote in 1h. Ideal for functional, mechanical and outdoor parts.",
    h1: "PETG 3D Printing in Barcelona",
    intro: "When a part needs to be tougher than PLA, survive outdoors or come into contact with water, PETG is usually the right answer. Dimension3D offers professional PETG 3D printing in Barcelona for functional, mechanical and outdoor applications.",
    sections: [
      {
        heading: "Why PETG",
        body: "PETG (Polyethylene Terephthalate Glycol) sits between PLA and ABS in terms of difficulty and properties. Compared to PLA it offers:\n\n• Higher impact resistance — parts flex instead of snapping.\n• Better temperature resistance (around 70–80°C softening).\n• Excellent layer adhesion, which means stronger prints.\n• Good chemical, water and UV resistance.\n\nIt's the material we recommend most often for parts that have to actually do something, not just look good."
      },
      {
        heading: "What PETG is best for",
        body: "Typical PETG jobs in Barcelona:\n\n• Outdoor mounts and brackets (planters, garden equipment, terrace fixtures).\n• Functional automotive clips and trim parts.\n• Mechanical fixtures, jigs and tooling.\n• Replacement appliance parts that get warm or wet.\n• Containers, lids and food-adjacent applications (food contact requires specific certified filament — ask us).\n• Bicycle and scooter accessories that face weather."
      },
      {
        heading: "Outdoor and water resistance",
        body: "PETG resists humidity and UV exposure much better than PLA, which makes it the natural pick for anything that lives outside year-round in Barcelona's climate. It's also less brittle in cold weather, so parts handle temperature swings without cracking."
      },
      {
        heading: "Order PETG parts in Barcelona",
        body: "Send your STL/STEP file or describe the part on the quote form. We'll suggest the right wall thickness and infill so the part is strong enough for its purpose without being unnecessarily expensive. Small PETG parts start around 12–15€."
      }
    ],
    faqs: [
      { q: "How is PETG different from PLA?", a: "PETG is tougher, more flexible under impact, more heat-resistant and survives outdoors. PLA is easier to print, captures finer detail and is cheaper." },
      { q: "Can PETG handle being outside in Barcelona summers?", a: "Yes. PETG resists UV and humidity well. For very high heat applications we may suggest ABS/ASA instead." },
      { q: "Is PETG food-safe?", a: "Standard PETG filament is not certified for food contact. Certified food-safe PETG exists and we can source it for specific projects." },
      { q: "Is PETG more expensive than PLA?", a: "Slightly. The material costs a bit more and prints slower, so the per-part price is typically 15–30% higher than PLA." },
      { q: "At what temperature does PETG start to deform?", a: "PETG begins to soften around 70–80°C. For parts near consistent heat sources — engines, dishwashers, near ovens — we recommend ABS/ASA instead, which handles up to 90–100°C." },
      { q: "How much stronger is PETG compared to PLA for functional parts?", a: "PETG typically offers around 20–30% higher impact resistance than PLA and significantly better layer adhesion. In practice, parts flex under load instead of snapping clean — which matters in real-world mechanical use." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "black-intake.jpg", "red-adapter.jpg", "curved-parts.jpg", "blue-molds.jpg"),
    related: [
      { label: "PLA Printing", slug: "/pla-printing-barcelona" },
      { label: "TPU Printing", slug: "/tpu-printing-barcelona" },
      { label: "Custom Parts", slug: "/custom-parts-barcelona" },
      { label: "Replacement Parts", slug: "/replacement-parts-barcelona" }
    ],
    schemaServiceName: "PETG 3D Printing Barcelona"
  },
  {
    slug: "/tpu-printing-barcelona",
    topic: "tpu",
    altSlug: "/impresion-tpu-barcelona",
    lang: "en",
    category: "material",
    metaTitle: "TPU Flexible 3D Printing Barcelona — Seals, Grips & Custom Rubber Parts | Dimension3D",
    metaDescription: "TPU flexible 3D printing in Barcelona. Rubber-like parts for phone mounts, seals, grips and wearables. Send STL/STEP — custom flexible parts in 24–72h.",
    h1: "TPU Flexible 3D Printing in Barcelona",
    intro: "TPU is the material that makes 3D printing flexible. If a part needs to bend, grip, cushion or seal, this is what we use. Dimension3D produces custom TPU 3D prints in Barcelona for everything from phone mounts to industrial seals.",
    sections: [
      {
        heading: "What TPU is",
        body: "TPU (Thermoplastic Polyurethane) is a rubber-like flexible filament. The exact softness depends on the shore hardness — we typically work with TPU 95A, which feels close to a hard rubber: flexible enough to bend and stretch, firm enough to keep its shape under load.\n\nIts properties make it perfect for parts that need to absorb impact, conform to shapes or seal against surfaces."
      },
      {
        heading: "What TPU is best for",
        body: "We print TPU in Barcelona for:\n\n• Phone, tablet and dashcam mounts that need to grip without scratching.\n• Custom seals, gaskets and O-rings for non-critical applications.\n• Handle grips and ergonomic covers.\n• Wearable parts and accessories.\n• Protective bumpers and cases.\n• Drone parts that need to absorb vibration.\n• Watchbands and straps."
      },
      {
        heading: "Things to know about flexible printing",
        body: "TPU is slower to print than PLA or PETG and requires careful tuning, which makes it slightly more expensive per part. Very thin walls can be too floppy, while very thick walls become too rigid — we'll suggest the wall thickness and infill that gives you the feel you want.\n\nTPU is also resistant to abrasion, oils and many chemicals, which makes it surprisingly durable for a flexible material."
      },
      {
        heading: "Order TPU parts",
        body: "Send your STL/STEP file or describe what you need. Tell us how flexible you want the part to feel — soft and squishy, rubber-like, or firm but bendable — and we'll match the geometry to that feel. Small TPU prints typically start around 15€."
      }
    ],
    faqs: [
      { q: "How flexible is your TPU?", a: "Standard TPU 95A behaves like a hard rubber — bendable and stretchable but not floppy. We can adjust the perceived softness by changing wall thickness and infill." },
      { q: "Can I print a custom phone case in TPU?", a: "Yes, as long as you have or can supply a 3D model of your phone shape. We can also adapt existing models." },
      { q: "Is TPU good for outdoor parts?", a: "Yes — it resists UV and humidity well and stays flexible across a wide temperature range." },
      { q: "Why is TPU more expensive than PLA?", a: "It prints much slower and requires careful tuning. The cost difference is normally 30–50% per part." },
      { q: "What Shore hardness is your standard TPU filament?", a: "We work primarily with TPU 95A Shore hardness, which feels like a firm rubber — bendable and stretchable but with structural stability under load. Softer variants (around 85A) can be sourced for applications that need more compliance." },
      { q: "How thin can walls be in a flexible TPU print?", a: "For reliable flexible prints we recommend a minimum wall thickness of 1.5–3.0 mm depending on the desired flexibility. Very thin walls become too floppy to control dimensionally; very thick walls lose the desired flex." }
    ],
    galleryImages: pick("curved-parts.jpg", "custom-brackets.jpg", "red-adapter.jpg", "black-intake.jpg", "intake-manifold.jpg", "blue-molds.jpg"),
    related: [
      { label: "PLA Printing", slug: "/pla-printing-barcelona" },
      { label: "PETG Printing", slug: "/petg-printing-barcelona" },
      { label: "Custom Parts", slug: "/custom-parts-barcelona" },
      { label: "Replacement Parts", slug: "/replacement-parts-barcelona" }
    ],
    schemaServiceName: "TPU Flexible 3D Printing Barcelona"
  },
  {
    slug: "/miniatures-barcelona",
    topic: "miniatures",
    altSlug: "/miniaturas-3d-barcelona",
    lang: "en",
    category: "use-case",
    metaTitle: "3D Printed Miniatures & Figures in Barcelona | Tabletop",
    metaDescription: "3D printed miniatures and figures in Barcelona for tabletop gaming, collectibles and dioramas. High-detail prints, painted-ready surfaces. Custom orders welcome.",
    h1: "3D Printed Miniatures & Figures in Barcelona",
    intro: "From tabletop gaming armies to collectible figures and detailed dioramas, miniatures are one of our favourite categories of work. Dimension3D produces high-detail 3D printed miniatures in Barcelona for hobbyists, gamers and collectors.",
    sections: [
      {
        heading: "What we print for the hobby world",
        body: "Common miniature jobs we handle in Barcelona include:\n\n• Tabletop wargame armies and squads (28mm, 32mm, 54mm scales).\n• Roleplaying game characters and monsters.\n• Display figures from films, series, anime and games.\n• Custom-designed miniatures from your concept or sketch.\n• Terrain pieces, scenery and modular dungeons.\n• Display dioramas with multiple figures and effects.\n• Replacement parts for boardgames and broken figures."
      },
      {
        heading: "High-detail prints, painted-ready",
        body: "While we work primarily with FDM technology, careful slicing, fine layer heights and the right materials let us produce miniatures with the level of detail collectors expect. We pre-orient parts to minimise visible layer lines on faces and important surfaces, and recommend the best material for the kind of paint and finish you plan to use.\n\nIf a project genuinely requires resin-level detail, we'll tell you upfront — we don't oversell what FDM can do."
      },
      {
        heading: "Custom miniatures from your concept",
        body: "Have a character idea, a family pet, a band logo turned into a figure, or a personalised gift in mind? Send us references — sketches, photos, descriptions — and we can either print an existing 3D model you provide or quote a custom 3D design before printing.\n\nWe regularly produce one-off custom figures as personalised gifts: bachelor/bachelorette parties, retirement gifts, gaming group mascots, brand mascots."
      },
      {
        heading: "Order miniatures in Barcelona",
        body: "Tell us what you want printed — file, scale and quantity — and we'll quote within the hour during business hours. We can pack carefully for local pickup in Barcelona or ship across mainland Spain with tracking."
      }
    ],
    faqs: [
      { q: "Can FDM really print detailed miniatures?", a: "Yes, with careful orientation and fine layer heights. For extreme detail (eyes, very thin features), we'll be honest about FDM's limits before quoting." },
      { q: "What scales do you print?", a: "Most common tabletop scales (28mm, 32mm, 54mm) plus larger display scales. Send your file or specify a scale and we'll confirm." },
      { q: "Do you supply primed or painted miniatures?", a: "By default we deliver clean, paint-ready prints. For painted miniatures, ask and we'll quote the painting work separately." },
      { q: "Can you design a miniature from a photo?", a: "We can quote custom 3D design from photos or references, then print the result." },
      { q: "What layer height do you use for high-detail miniatures?", a: "For display miniatures we typically use 0.10–0.12 mm layer height, which captures fine surface detail while keeping print times practical. For very small figures or extreme detail we can go to 0.08 mm." },
      { q: "Will support marks be visible on the finished miniature?", a: "We orient parts carefully to place support contact points on non-visible areas — undersides, back surfaces, bases. Some marks are inherent to FDM; we'll set realistic expectations per model before you approve the print." }
    ],
    galleryImages: pick("purple-figures.jpg", "lion-king-figures.jpg", "lion-king-scene.jpg", "stranger-things-diorama.jpg", "stranger-things-lit.jpg", "halloween-set.jpg"),
    related: [
      { label: "PLA Printing", slug: "/pla-printing-barcelona" },
      { label: "Custom Parts", slug: "/custom-parts-barcelona" },
      { label: "3D Printing Service", slug: "/3d-printing-barcelona" },
      { label: "Pricing", slug: "/3d-printing-price-barcelona" }
    ],
    schemaServiceName: "3D Printed Miniatures Barcelona"
  },

  // ----- NEW: BUSINESS -----
  {
    slug: "/3d-printing-for-business-barcelona",
    topic: "business",
    altSlug: "/impresion-3d-empresas-barcelona",
    lang: "en",
    category: "use-case",
    metaTitle: "3D Printing for Business in Barcelona — Technical Parts & Short Runs | Dimension3D",
    metaDescription: "Professional 3D printing for companies and engineers in Barcelona. Send your STL/STEP file — quote in 1 hour. Functional and technical parts, jigs, fixtures, short production runs. NDA available.",
    h1: "3D Printing for Business in Barcelona",
    intro: "Dimension3D works with engineering teams, R&D departments, workshops and small manufacturers in Barcelona who need functional 3D printed parts without the overhead of an industrial supplier. Send your file — STL, STEP or IGES — and get a professional quote within the hour. No account, no tender, no minimum volume.",
    sections: [
      {
        heading: "What we produce for business customers",
        body: "Our business customers use us for a wide range of industrial and technical applications:\n\n• Jigs, fixtures and end-of-arm tooling for production lines.\n• Functional prototypes for validation and client presentations.\n• Enclosures and housings for electronics and PCBs.\n• Replacement machine parts and wear components.\n• Short-run production of 5 to 200 identical parts.\n• Custom mounting brackets, cable management and rack hardware.\n\nWe work in PETG, ABS/ASA, Nylon and Nylon-CF for structural applications, and in PLA or PETG for low-stress functional parts. If your application calls for a specific material or tolerance, tell us upfront and we'll advise on feasibility."
      },
      {
        heading: "STL, STEP and IGES accepted — professional quote in 1 hour",
        body: "Send your file via the upload form or directly to our WhatsApp. We work with all standard CAD exports: STL, STEP, IGES, OBJ and 3MF. If you're using SolidWorks, Fusion 360, Onshape, CATIA or FreeCAD, export in any of those formats.\n\nWe review every file manually before quoting — checking wall thickness, support requirements, orientation and material suitability — so your quote reflects the real cost and the real timeline, not an automated estimate. You receive a clear line-item price within 60 minutes during business hours."
      },
      {
        heading: "Short production runs and repeat orders",
        body: "Once a part is validated, we can run repeat orders without re-quoting from scratch. We keep the sliced file and print parameters on record. For quantities of 5–200 parts, per-unit cost drops as volume grows — ask for a tiered price when you request the quote.\n\nWe can also deliver to your workshop or office in Barcelona by courier, or ship to any address in mainland Spain with tracking."
      },
      {
        heading: "Confidentiality and NDAs",
        body: "We sign NDAs for any project that requires it. Confidentiality is standard practice for us — we never share client files, designs or project details. If your R&D department or engineering team needs discretion, we handle that as a baseline, not as a special request."
      }
    ],
    faqs: [
      { q: "Do you sign NDAs for business projects?", a: "Yes. NDA signing is standard for any client who requests it. We never share client files or project details." },
      { q: "What file formats do you accept?", a: "STL, STEP, IGES, OBJ and 3MF. Native CAD exports from SolidWorks, Fusion 360, Onshape and most other tools work fine." },
      { q: "Can you supply 50 or 100 identical parts?", a: "Yes. We run short production batches from 5 to 200 units. Per-unit price drops with quantity — ask for a tiered quote." },
      { q: "What tolerances can you hold?", a: "Typical FDM accuracy is ±0.2 mm. For tighter-tolerance features we adjust parameters and can post-process critical surfaces. Tell us the requirement upfront." },
      { q: "Do you issue full VAT invoices for business orders?", a: "Yes. We issue complete VAT invoices for all business customers. Provide your company name and CIF/VAT number when placing the order." },
      { q: "What is the typical lead time for a batch of 50–100 parts?", a: "For most standard-sized parts, 5–10 business days depending on part size and material. For urgent batch requirements, contact us to discuss priority scheduling — we'll be honest about what's achievable." }
    ],
    galleryImages: pick("intake-manifold.jpg", "black-intake.jpg", "custom-brackets.jpg", "blue-molds.jpg", "curved-parts.jpg", "red-adapter.jpg"),
    related: [
      { label: "Prototype Printing", slug: "/prototype-printing-barcelona" },
      { label: "Rapid Prototyping", slug: "/rapid-prototyping-barcelona" },
      { label: "Functional Parts", slug: "/functional-parts-barcelona" },
      { label: "Urgent 3D Printing", slug: "/urgent-3d-printing-barcelona" }
    ],
    schemaServiceName: "3D Printing for Business Barcelona"
  },

  // ----- NEW: RAPID PROTOTYPING -----
  {
    slug: "/rapid-prototyping-barcelona",
    topic: "rapid-prototyping",
    altSlug: "/prototipado-rapido-barcelona",
    lang: "en",
    category: "use-case",
    metaTitle: "Rapid Prototyping Barcelona — 24–72h Cycle, STL/STEP Accepted | Dimension3D",
    metaDescription: "Rapid prototyping in Barcelona for engineers and startups. Send your STL or STEP file — functional prototype in 24–72 hours. Iterate fast. PETG, Nylon, ABS. NDA available.",
    h1: "Rapid Prototyping in Barcelona — 24–72h Iteration",
    intro: "Fast iteration is the backbone of hardware development. Dimension3D delivers rapid prototyping in Barcelona with a typical turnaround of 24–72 hours from file to part — so your next design revision is in your hands before the competition has finished their first quote request.",
    sections: [
      {
        heading: "24–72h from STL or STEP to functional part",
        body: "The moment your CAD revision is done, send it. We accept STL, STEP and IGES from any modelling tool — SolidWorks, Fusion 360, Onshape, Rhino, FreeCAD, CATIA. No conversion, no reformatting.\n\nWe manually review every file before confirming the timeline. If a geometry has a support problem or wall-thickness issue that will affect function, we flag it in the quote instead of printing a bad part and making you wait another 48 hours to find out."
      },
      {
        heading: "Material matched to the iteration stage",
        body: "We select the print material based on what the prototype has to prove, not on what's cheapest:\n\n• PLA — form-fit checks, early-stage concept models.\n• PETG — moderate stress and outdoor exposure, first functional validation.\n• ABS/ASA — heat-resistant parts, automotive and enclosure prototypes.\n• Nylon / Nylon-CF — high-load mechanical parts, closer to injection-moulded properties.\n• TPU — flexible covers, gaskets, seals.\n\nChoosing the wrong material wastes an entire iteration cycle. We'll recommend the right one in the quote."
      },
      {
        heading: "Iterations without friction",
        body: "Each revised file goes through the same same-day review and 24–72h production cycle. There's no subscription, no minimum order per iteration, and no administrative back-and-forth — you upload, we review, we quote, you approve, we print. For clients who iterate frequently, we keep your project on file and can accept revision uploads via WhatsApp directly."
      },
      {
        heading: "From prototype to small production run",
        body: "Once your design is locked, we can transition seamlessly into short-run production (5–200 units) without changing supplier or renegotiating terms. We keep the validated print parameters and can schedule a batch run at short notice."
      }
    ],
    faqs: [
      { q: "How fast is one prototyping iteration?", a: "Typically 24–72 hours from file submission to part in hand, depending on size, material and current queue." },
      { q: "Which CAD formats do you accept?", a: "STL, STEP, IGES, OBJ and 3MF. Exports from SolidWorks, Fusion 360, Onshape, Rhino, FreeCAD and most other tools work without conversion." },
      { q: "Do you flag design problems before printing?", a: "Yes. We review every file manually and flag wall-thickness issues, support problems or material mismatches in the quote before we start printing." },
      { q: "Can you run a small production batch after the prototype?", a: "Yes. We transition from prototype to short-run production (5–200 units) without changing supplier or re-establishing terms." },
      { q: "What distinguishes this from your standard prototype printing service?", a: "Rapid prototyping is specifically set up for fast multi-iteration cycles. We keep your project on file between iterations, accept revision uploads directly via WhatsApp, and prioritise turnaround within the 24–72h window without re-quoting from scratch each time." },
      { q: "Can I run multiple design revisions in the same week?", a: "Yes — that's the whole point. Each revised file goes through the same same-day review and 24–72h production cycle. Frequent iterators share files directly via WhatsApp and we turn them around without administrative delay." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "black-intake.jpg", "red-adapter.jpg", "blue-molds.jpg", "curved-parts.jpg"),
    related: [
      { label: "3D Printing for Business", slug: "/3d-printing-for-business-barcelona" },
      { label: "Functional Parts", slug: "/functional-parts-barcelona" },
      { label: "Urgent 3D Printing", slug: "/urgent-3d-printing-barcelona" },
      { label: "Pricing", slug: "/3d-printing-price-barcelona" }
    ],
    schemaServiceName: "Rapid Prototyping Barcelona"
  },

  // ----- NEW: FUNCTIONAL PARTS -----
  {
    slug: "/functional-parts-barcelona",
    topic: "functional-parts",
    altSlug: "/piezas-funcionales-barcelona",
    lang: "en",
    category: "use-case",
    metaTitle: "Functional 3D Printed Parts Barcelona — PETG, Nylon, ABS On Demand | Dimension3D",
    metaDescription: "Functional 3D printed parts in Barcelona from PETG, ABS, Nylon and TPU. Structural components, jigs, fixtures and end-use parts. Send your STL/STEP — quote in 1 hour.",
    h1: "Functional 3D Printed Parts in Barcelona — On Demand",
    intro: "Not every 3D print is decorative. Dimension3D specialises in functional 3D printed parts in Barcelona — components that load, flex, seal, mount, protect or replace something in the real world. We select the right material, wall thickness and infill for what the part actually has to do.",
    sections: [
      {
        heading: "What makes a part truly functional",
        body: "A functional part has to survive its environment and perform its job without failing. That means:\n\n• Choosing the right polymer — PETG for general functional and outdoor parts, ABS/ASA for heat and chemical resistance, Nylon for high mechanical loads, Nylon-CF for maximum stiffness, TPU for flexible or sealing applications.\n• Setting the right infill density — 20–40% for moderate loads, 60–80% for structural parts, 100% solid for load-bearing contacts.\n• Orienting the part for the dominant load direction — layer adhesion is always the weak axis in FDM.\n\nWe make all three decisions for you in the quoting stage. If a geometry won't survive the application in FDM, we'll say so before printing it."
      },
      {
        heading: "Common functional part categories",
        body: "Typical functional printing jobs in Barcelona:\n\n• Machine jigs, fixtures and guides for production lines.\n• Enclosures and housings for electronics, sensors and PCBs.\n• Replacement and repair parts for appliances, vehicles and equipment.\n• Mounting brackets, cable guides and rack hardware.\n• Custom tooling and end-of-arm grippers.\n• Structural brackets for furniture, shelving and outdoor structures.\n• Functional prototypes for mechanical validation.\n\nIf a part has a real job to do, we treat it like one."
      },
      {
        heading: "Material guide for functional printing",
        body: "Material selection for functional parts:\n\n• PETG — best all-around for functional, outdoor and water-contact parts. Easy to print, tough, UV and humidity resistant.\n• ABS/ASA — for parts that get hot (automotive, appliances near heat sources) or face UV outdoors long-term.\n• Nylon PA12 — high tensile strength, low friction, good for gears, bushings and high-wear parts.\n• Nylon-CF — stiffest FDM option, approaches aluminium in rigidity-to-weight for structural brackets.\n• TPU 95A — for flexible parts: seals, grips, bumpers, gaskets.\n\nWe'll recommend the right material for your application in the quote."
      },
      {
        heading: "From one part to a short run",
        body: "There is no minimum order. We print single functional parts as readily as a batch of 50. For repeat orders, we keep the file and parameters on record so reorders take minutes to set up. For quantities of 5–200, ask for a tiered price — per-unit cost drops as volume grows."
      }
    ],
    faqs: [
      { q: "Which material is best for load-bearing functional parts?", a: "Nylon PA12 or Nylon-CF for maximum mechanical strength. PETG for moderate loads with outdoor or water exposure. We'll specify the right one in the quote." },
      { q: "How strong is a PETG print compared to injection-moulded plastic?", a: "A well-printed PETG part at 60%+ infill is often comparable to injection-moulded PP or ABS for moderate structural loads, though anisotropic — stronger along the print plane than across layers." },
      { q: "Can you print functional parts with tight tolerances?", a: "Typical FDM holds ±0.2 mm. For critical mating surfaces we adjust parameters and can post-machine or post-process if tighter tolerances are required — discuss this in the quote." },
      { q: "Do you review files for structural suitability before printing?", a: "Yes. Every file is reviewed manually. If a geometry has an issue — thin walls, bad orientation for load direction, inadequate support — we flag it before printing." },
      { q: "What infill density do you use for load-bearing structural parts?", a: "For moderate structural loads we use 40–60% infill. For high-load or load-bearing contact surfaces we use 80–100% solid infill. We specify the infill setting in every quote so you know exactly what you're getting." },
      { q: "What post-processing is available for functional parts?", a: "Heat-set threaded inserts (M3, M4, M5) for bolt connections, ABS acetone vapour smoothing for improved surface seal, and manual tapping or light sanding of critical mating surfaces. Request any post-processing when you submit the quote." }
    ],
    galleryImages: pick("intake-manifold.jpg", "black-intake.jpg", "custom-brackets.jpg", "curved-parts.jpg", "blue-molds.jpg", "red-adapter.jpg"),
    related: [
      { label: "3D Printing for Business", slug: "/3d-printing-for-business-barcelona" },
      { label: "Rapid Prototyping", slug: "/rapid-prototyping-barcelona" },
      { label: "PETG Printing", slug: "/petg-printing-barcelona" },
      { label: "Replacement Parts", slug: "/replacement-parts-barcelona" }
    ],
    schemaServiceName: "Functional 3D Printed Parts Barcelona"
  }
];
