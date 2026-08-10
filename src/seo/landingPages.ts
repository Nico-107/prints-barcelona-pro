// Centralized SEO landing page content (EN + ES) for Dimension3D Barcelona
// Shared LandingPage template renders one entry per route.

export type Lang = "en" | "es" | "ca" | "fr" | "de";

// Stable topic key shared by EN/ES/CA/DE versions of the same page.
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
  | "functional-parts"
  | "madrid"
  | "choosing-service"
  | "materials-guide"
  | "file-prep"
  | "best-service"
  | "maker-income"
  | "maker-profitability"
  | "maker-customers";

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
  // Who the page speaks to. Undefined = "customer" for back-compat, so no
  // existing page changes behaviour. "maker" flips CTAs to the network
  // recruitment funnel (/makers, /maker-guide) instead of a print quote.
  audience?: "customer" | "maker";
  cityId?: string;         // when set, page uses that city's identity instead of ACTIVE_CITY
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
    metaTitle: "3D Printing Service Barcelona — Quote in 1h, From 10€",
    metaDescription: "Professional 3D printing service in Barcelona. Custom parts, prototypes and replacements. Free quote in under 1 hour. From 10€. Local pickup available.",
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
      { label: "Custom Parts from Photo or File", slug: "/custom-parts-barcelona" },
      { label: "Rapid Prototype Printing", slug: "/prototype-printing-barcelona" },
      { label: "Transparent Pricing Guide", slug: "/3d-printing-price-barcelona" },
      { label: "Full Materials Comparison", slug: "/3d-printing-materials-guide" },
      { label: "Servicio en Español", slug: "/impresion-3d-barcelona" },
      { label: "Servei en Català", slug: "/ca/impressio-3d-barcelona" }
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
      { label: "Replacement & Discontinued Parts", slug: "/replacement-parts-barcelona" },
      { label: "Functional Engineering Parts", slug: "/functional-parts-barcelona" },
      { label: "PETG for Load-Bearing Work", slug: "/petg-printing-barcelona" },
      { label: "How Pricing Works", slug: "/3d-printing-price-barcelona" },
      { label: "Piezas Personalizadas (ES)", slug: "/piezas-personalizadas-3d-barcelona" },
      { label: "Peces Personalitzades (CA)", slug: "/ca/peces-personalitzades-3d-barcelona" }
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
      { label: "Rapid Prototyping — 24–72h Cycle", slug: "/rapid-prototyping-barcelona" },
      { label: "Functional Parts for Validation", slug: "/functional-parts-barcelona" },
      { label: "Same-Day & Express Turnaround", slug: "/urgent-3d-printing-barcelona" },
      { label: "PETG Material Overview", slug: "/petg-printing-barcelona" },
      { label: "Prototipos (ES)", slug: "/prototipos-3d-barcelona" },
      { label: "Prototips (CA)", slug: "/ca/prototips-3d-barcelona" }
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
      { label: "Discontinued Replacement Parts", slug: "/replacement-parts-barcelona" },
      { label: "Custom One-Off Prints", slug: "/custom-parts-barcelona" },
      { label: "Iteration Prints for Design Reviews", slug: "/prototype-printing-barcelona" },
      { label: "Priority & Express Pricing", slug: "/3d-printing-price-barcelona" },
      { label: "Impresión Urgente (ES)", slug: "/impresion-3d-urgente-barcelona" },
      { label: "Impressió Urgent (CA)", slug: "/ca/impressio-3d-urgent-barcelona" }
    ],
    schemaServiceName: "Urgent Express 3D Printing Barcelona"
  },
  {
    slug: "/3d-printing-price-barcelona",
    topic: "pricing",
    altSlug: "/precio-impresion-3d-barcelona",
    lang: "en",
    category: "service",
    metaTitle: "3D Printing Prices Barcelona — From 10€, Free Quote in 1h",
    metaDescription: "How much does 3D printing cost in Barcelona? Small parts from 10€. Transparent pricing by size and material. Free quote in 1h, no commitment.",
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
      { label: "Main 3D Printing Service", slug: "/3d-printing-barcelona" },
      { label: "Best-Fit Service by Use Case", slug: "/best-3d-printing-service-barcelona" },
      { label: "PLA — Most Affordable Option", slug: "/pla-printing-barcelona" },
      { label: "Materials Comparison", slug: "/3d-printing-materials-guide" },
      { label: "Precios (ES)", slug: "/precio-impresion-3d-barcelona" },
      { label: "Preus (CA)", slug: "/ca/preu-impressio-3d-barcelona" }
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
      { label: "Bespoke Custom Parts", slug: "/custom-parts-barcelona" },
      { label: "Fast-Turn Urgent Prints", slug: "/urgent-3d-printing-barcelona" },
      { label: "PETG for Appliance Parts", slug: "/petg-printing-barcelona" },
      { label: "How Prices Are Built", slug: "/3d-printing-price-barcelona" },
      { label: "Recambios (ES)", slug: "/recambios-impresion-3d-barcelona" },
      { label: "Recanvis (CA)", slug: "/ca/recanvis-impressio-3d-barcelona" }
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
      { label: "PETG — Tougher & Outdoor-Ready", slug: "/petg-printing-barcelona" },
      { label: "TPU — Flexible & Rubber-Like", slug: "/tpu-printing-barcelona" },
      { label: "Choosing the Right Material", slug: "/3d-printing-materials-guide" },
      { label: "How to Prepare Your STL", slug: "/how-to-prepare-file-for-3d-printing" },
      { label: "Impresión PLA (ES)", slug: "/impresion-pla-barcelona" },
      { label: "Impressió PLA (CA)", slug: "/ca/impressio-pla-barcelona" }
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
      { label: "PLA — Easiest Everyday Prints", slug: "/pla-printing-barcelona" },
      { label: "TPU — Flexible & Rubber-Like", slug: "/tpu-printing-barcelona" },
      { label: "Full Materials Selection Guide", slug: "/3d-printing-materials-guide" },
      { label: "File Prep for FDM Prints", slug: "/how-to-prepare-file-for-3d-printing" },
      { label: "Impresión PETG (ES)", slug: "/impresion-petg-barcelona" },
      { label: "Impressió PETG (CA)", slug: "/ca/impressio-petg-barcelona" }
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
      { label: "PLA — Rigid Prints for Detail", slug: "/pla-printing-barcelona" },
      { label: "PETG — Functional Rigid Parts", slug: "/petg-printing-barcelona" },
      { label: "Materials Comparison Table", slug: "/3d-printing-materials-guide" },
      { label: "Model & Wall-Thickness Tips", slug: "/how-to-prepare-file-for-3d-printing" },
      { label: "Impresión TPU (ES)", slug: "/impresion-tpu-barcelona" },
      { label: "Impressió TPU (CA)", slug: "/ca/impressio-tpu-barcelona" }
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
      { label: "PLA — Detail-Ready Filament", slug: "/pla-printing-barcelona" },
      { label: "Custom One-Off Figures", slug: "/custom-parts-barcelona" },
      { label: "Which Service Fits Miniatures", slug: "/best-3d-printing-service-barcelona" },
      { label: "Bundle & Quantity Pricing", slug: "/3d-printing-price-barcelona" },
      { label: "Miniaturas (ES)", slug: "/miniaturas-3d-barcelona" },
      { label: "Miniatures (CA)", slug: "/ca/miniatures-3d-barcelona" }
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
      { label: "24–72h Rapid Prototyping", slug: "/rapid-prototyping-barcelona" },
      { label: "Structural Functional Parts", slug: "/functional-parts-barcelona" },
      { label: "Design Validation Prototypes", slug: "/prototype-printing-barcelona" },
      { label: "PETG for Industrial Enclosures", slug: "/petg-printing-barcelona" },
      { label: "Empresas (ES)", slug: "/impresion-3d-empresas-barcelona" },
      { label: "Empreses (CA)", slug: "/ca/impressio-3d-empreses-barcelona" }
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
      { label: "Business & R&D Prints", slug: "/3d-printing-for-business-barcelona" },
      { label: "Functional Load-Bearing Parts", slug: "/functional-parts-barcelona" },
      { label: "Single & Series Prototypes", slug: "/prototype-printing-barcelona" },
      { label: "Material Selection Guide", slug: "/3d-printing-materials-guide" },
      { label: "Prototipado Rápido (ES)", slug: "/prototipado-rapido-barcelona" },
      { label: "Prototipatge Ràpid (CA)", slug: "/ca/prototipatge-rapid-barcelona" }
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
      { label: "B2B & Engineering Printing", slug: "/3d-printing-for-business-barcelona" },
      { label: "Fast-Iteration Prototyping", slug: "/rapid-prototyping-barcelona" },
      { label: "PETG for Load & Outdoor", slug: "/petg-printing-barcelona" },
      { label: "Nylon, ABS, ASA Explained", slug: "/3d-printing-materials-guide" },
      { label: "Piezas Funcionales (ES)", slug: "/piezas-funcionales-barcelona" },
      { label: "Peces Funcionals (CA)", slug: "/ca/peces-funcionals-barcelona" }
    ],
    schemaServiceName: "Functional 3D Printed Parts Barcelona"
  },

  // ----- NEW: HOW TO CHOOSE A 3D PRINTING SERVICE -----
  {
    slug: "/how-to-choose-3d-printing-service-barcelona",
    topic: "choosing-service",
    altSlug: "/como-elegir-servicio-impresion-3d-barcelona",
    lang: "en",
    category: "use-case",
    metaTitle: "How to Choose a 3D Printing Service in Barcelona — Buyer's Guide | Dimension3D",
    metaDescription: "Practical buyer's guide to 3D printing services in Barcelona: what to ask before you order, red flags to watch for, and a neutral comparison of local workshops, online platforms and maker marketplaces.",
    h1: "How to Choose a 3D Printing Service in Barcelona",
    intro: "Before you send your file to the first Google result, take five minutes to ask a few concrete questions. The answers tell you whether the price you'll be quoted reflects the part you'll actually receive — and whether the service you're picking is genuinely suited to your project. This guide walks through what to ask, what to watch out for, and how the three common service models structurally differ.",
    sections: [
      {
        heading: "What to ask before you place an order",
        body: "A serious 3D printing service will answer all of the following clearly and in writing. If any answer is vague, that is data.\n\n• Which materials do you actually stock, and which are you happy to recommend for my part? A shop that offers twenty materials but only prints two of them regularly is different from one that keeps six materials in day-to-day rotation.\n• What layer height and infill will you use for my quote? Layer height (typically 0.12–0.28 mm on FDM) and infill percentage directly change both the price and the strength of the part.\n• What tolerance can you hold on the critical features of my geometry? FDM in practice sits around ±0.2 mm across most dimensions. Ask what the shop actually measures, not the marketing figure.\n• Who reviews my file before printing? A human, an algorithm, or nothing? File review catches wall-thickness issues, orientation problems and support decisions that automated quoting cannot see.\n• Is there a minimum order? What is the smallest thing you'll print, and for how much?\n• What's your realistic turnaround from approved quote to shipped part, in business days, for the size and material I'm asking about?\n\nA shop that answers these six questions in a WhatsApp reply within an hour has already told you a great deal about how they work."
      },
      {
        heading: "Red flags in a 3D printing quote",
        body: "Some patterns are worth pausing over before you approve a job:\n\n• A firm price without anyone looking at the file. Price on FDM is a function of grams of plastic and hours of machine time. Without opening the geometry, no one can quote either accurately — an instant number is either padded for safety or unrealistic.\n• No minimum order stated anywhere on the site. Every workshop has one, whether it's €10 or €200. Not saying so up front usually means it's negotiated case by case, which makes budgeting unpredictable.\n• Vague or missing lead times. \"Fast turnaround\" is not a lead time. \"Ships in 3–5 business days from approval\" is.\n• No support channel with a human at the other end. If your only contact route is a web form that generates a ticket number, expect the pace of communication to match.\n• Silence on file review. If nobody looks at the geometry before printing, the shop is trusting your CAD to be perfect. Most CAD isn't.\n\nNone of these on their own means a shop is bad — but three or four together is a pattern."
      },
      {
        heading: "Three service models — an objective comparison",
        body: "There are three common ways to source a 3D print in Barcelona, and they differ in structural ways that matter more than any individual company's marketing:\n\n| Feature | Local Barcelona workshop | International online platform | Maker marketplace |\n|---|---|---|---|\n| Typical lead time (approved quote → part in hand) | 2–5 business days for standard orders; express 24–48h possible | 7–14 business days including international shipping | Varies by individual maker; commonly 5–15 business days |\n| Minimum order | Set by the workshop; often €10–€50 or none | Usually no per-part minimum; per-order minimums common | Set by each maker independently |\n| Human file review before quote | Standard practice at most local workshops | Algorithmic quote by default; human review on request or by tier | Depends entirely on the individual maker |\n| Language of support | Spanish, Catalan and English available locally | Usually English-only, or a language-specific portal | Depends on the maker's own languages |\n| In-person pickup option | Available by appointment at most local workshops | Not offered — international shipping only | Sometimes, if the maker is local and willing |\n| Customisation and design help | Direct dialogue with the person producing the part | Standard specs only; customisation via ticket or premium tier | Direct with the maker, quality varies |\n\nFor Dimension3D specifically: we're a local Barcelona workshop, we quote within one hour during business hours, minimum order is €10 with no per-part minimum, every file is reviewed manually before we send the quote, we handle enquiries in Spanish, Catalan and English, and pickup in Barcelona is available by appointment.\n\nThe right choice depends on your project. If you need a single functional part next week with a specific material recommendation, a local workshop is structurally set up for that. If you need 500 identical injection-quality parts at the lowest possible unit price and can wait, an international platform's economics may fit better. Pick the model that matches the job."
      },
      {
        heading: "Questions specific to your project type",
        body: "The generic checklist above is a floor, not a ceiling. Depending on what you're ordering, add project-specific questions:\n\n• For a functional load-bearing part: ask which material and infill they recommend and why, and what the expected temperature and load environment is that they're specifying for.\n• For an outdoor part: ask specifically about UV stability. ASA and PETG behave differently outdoors than PLA. A shop that answers \"we'll print it in whatever you want\" without asking about the environment isn't optimising for the part working.\n• For a visual prototype: ask about layer height, surface finish and post-processing options (sanding, priming, painting).\n• For a batch of 20+ identical parts: ask about tiered pricing, per-batch quality control, and how they handle any parts that come out of spec.\n• For anything with a deadline: ask for an approved-quote-to-dispatch lead time in business days, not calendar days, and confirm whether express service is separately quoted.\n\nA good shop welcomes these questions. They tell them what to prioritise on your job."
      },
      {
        heading: "How Dimension3D answers each of these — in short",
        body: "For direct reference, here's how the checklist maps to our operation:\n\n• Materials in day-to-day rotation: PLA, PETG, ABS, ASA, TPU, Nylon (PA12), and carbon-fibre reinforced variants (PLA-CF, PETG-CF, Nylon-CF).\n• Layer height range: 0.12–0.28 mm depending on part function; specified per quote.\n• Typical tolerance: ±0.2 mm across most FDM dimensions; tighter features quoted individually.\n• File review: every file is opened manually before we send the quote; wall thickness, support and orientation questions get raised at that stage.\n• Minimum order: €10. No per-part minimum — a single small clip is a valid order.\n• Turnaround: standard 2–5 business days from approved quote; express 24–48h available; same-day sometimes possible when the queue allows.\n• Support language: Spanish, Catalan and English, via WhatsApp or email.\n• Pickup: available at our Barcelona workshop by appointment; shipping to mainland Spain with tracking.\n\nUse this guide with any shop you're considering. The point isn't to steer you to us — it's to give you the shape of a good conversation with any 3D printing supplier."
      }
    ],
    faqs: [
      { q: "Is instant online pricing a bad sign?", a: "Not automatically — an instant estimator is genuinely useful for a first-pass number. What matters is whether a human reviews the file before the quote is confirmed. Instant pricing followed by human review is fine. Instant pricing that goes straight to print without anyone looking at the geometry is where problems appear." },
      { q: "How do I know if a workshop can hold the tolerance I need?", a: "Ask which features you care about (holes, mating surfaces, threaded inserts) and what tolerance they can hold on those specifically. A shop that answers with an actual figure and an explanation of how they'd achieve it — orientation, wall count, post-processing — knows what they're doing. A shop that just says 'yes, high tolerance' hasn't answered the question." },
      { q: "Should I be worried about a workshop with no minimum order?", a: "No — the opposite. A stated €10-or-similar minimum with no per-part floor is a workshop set up to happily print one clip. A workshop that only quotes above €200 per order is optimised for a different type of customer, and that's fine — just make sure it matches your project." },
      { q: "What's a fair lead time for a small functional part in Barcelona?", a: "For a small PLA or PETG part with no complex geometry, from approved quote to ready-for-pickup is typically 2–5 business days at a local workshop. Express service in 24–48 hours is a common option on top of that. If someone quotes 3 weeks for a small standard part with no specific reason, ask why." },
      { q: "Is it worth paying more for a local workshop over an international online service?", a: "It depends on the project. A local workshop is structurally set up for direct dialogue, faster turnaround, in-person pickup and file review by a human. An international platform is structurally set up for high-volume standardised production. If your project matches the second profile — hundreds of identical parts, no rush, no unusual materials — the platform's economics may fit. If it matches the first profile, the price premium of local is usually smaller than people expect and the friction reduction is real." },
      { q: "How do I know a workshop will actually deliver what they've quoted?", a: "Two practical tests. First, ask to see photographs of a similar part they've printed recently — a serious workshop has a portfolio. Second, look at how they answer your pre-quote questions: precise, direct answers with acknowledged tradeoffs correlate strongly with the same behaviour on the actual job." }
    ],
    galleryImages: pick("custom-brackets.jpg", "intake-manifold.jpg", "ferrari-key-holder.jpg", "curved-parts.jpg", "black-intake.jpg", "red-adapter.jpg"),
    related: [
      { label: "Full Materials Guide", slug: "/3d-printing-materials-guide" },
      { label: "Preparing Your File Correctly", slug: "/how-to-prepare-file-for-3d-printing" },
      { label: "Best Service by Use Case", slug: "/best-3d-printing-service-barcelona" },
      { label: "How Pricing Is Calculated", slug: "/3d-printing-price-barcelona" },
      { label: "3D Printing in Barcelona (Overview)", slug: "/3d-printing-barcelona" },
      { label: "Cómo Elegir (ES)", slug: "/como-elegir-servicio-impresion-3d-barcelona" }
    ],
    schemaServiceName: "3D Printing Buyer's Guide Barcelona"
  },

  // ----- NEW: MATERIALS GUIDE -----
  {
    slug: "/3d-printing-materials-guide",
    topic: "materials-guide",
    altSlug: "/guia-materiales-impresion-3d",
    lang: "en",
    category: "material",
    metaTitle: "3D Printing Materials Guide — PLA, PETG, ABS, TPU, Nylon, CF | Dimension3D",
    metaDescription: "Practical FDM material selection guide. Real strengths, real weaknesses and typical uses for PLA, PETG, ABS, ASA, TPU, Nylon and carbon-fibre composites — with honest tradeoffs, not marketing.",
    h1: "3D Printing Materials — A Practical Selection Guide",
    intro: "The single most common reason a 3D printed part fails in use is that the wrong material was picked for the job. This guide is not a specification sheet — it's a practical description of what each material we stock is genuinely good at, what it isn't, and when to reach for something else. Every material listed here is in our day-to-day rotation.",
    sections: [
      {
        heading: "PLA — the sensible default for parts that don't need heat resistance",
        body: "PLA (polylactic acid) is the easiest FDM material to print and the most economical. It's dimensionally stable, has minimal warp, prints cleanly at small layer heights, and comes in more colours than any other filament category. For visual models, prototypes, decorative pieces, cookie cutters and any indoor part that won't see mechanical stress, PLA is the sensible default.\n\nStrengths: cheap, printable, dimensionally accurate, good aesthetic finish.\n\nWeaknesses: PLA softens around 55–60 °C. A PLA part left in a parked car in Barcelona in July will deform. It's also more brittle than PETG under sharp impact, and it degrades slowly under prolonged UV exposure.\n\nWhen NOT to use PLA: any application involving heat above 50 °C, outdoor use for more than a few weeks, or parts that need to flex or absorb impact repeatedly."
      },
      {
        heading: "PETG — the practical workhorse for functional parts",
        body: "PETG (polyethylene terephthalate glycol) is what we most often recommend when a customer says \"functional part\". It's tougher than PLA, more heat-tolerant (softens around 75–80 °C), resists moisture and UV reasonably well, and prints without an enclosure. For enclosures, brackets, mounts, replacement clips, outdoor fixtures and parts that need moderate mechanical strength without industrial-grade requirements, PETG is the practical workhorse.\n\nStrengths: tougher and more impact-resistant than PLA, better temperature and UV behaviour, food-safe grades exist, layer adhesion is good.\n\nWeaknesses: slightly stringier to print (some post-processing may be needed for clean surfaces), less rigid than ABS, not suitable for very high-temperature applications.\n\nWhen NOT to use PETG: parts exposed to sustained heat above 70 °C, or applications needing very high stiffness (Nylon or PC is better)."
      },
      {
        heading: "ABS and ASA — heat, mechanical stress, and outdoor use",
        body: "ABS (acrylonitrile butadiene styrene) is the traditional engineering plastic — strong, temperature-resistant to around 100 °C, and machinable with common tools. ASA (acrylonitrile styrene acrylate) is chemically similar but adds proper UV stabilisation, making it the correct choice for anything living outdoors year-round. Both print best in an enclosure to control warping.\n\nStrengths: heat resistance to ~100 °C, good mechanical strength, easily glued and post-machined, ASA is genuinely UV-stable.\n\nWeaknesses: prone to warping without an enclosure or good bed adhesion, ABS releases mild fumes when printing (which is why we run these in a ventilated space), and finish is usually rougher than PLA out of the printer.\n\nWhen NOT to use ABS/ASA: display models where surface finish matters more than strength, or thin-walled parts where warping distortion would compromise fit."
      },
      {
        heading: "TPU — flexible parts, gaskets and grips",
        body: "TPU (thermoplastic polyurethane) is a rubber-like filament that prints in various Shore hardness grades. It's used for anything that needs to flex, damp vibration, or seal against another surface: phone cases, gaskets, feet, cable strain-reliefs, grips, small tyres for robotics projects.\n\nStrengths: excellent flexibility with high tear resistance, chemically robust, good vibration damping.\n\nWeaknesses: slow to print (typically 20–30 mm/s vs 60+ mm/s for PLA), sensitive to moisture (needs to be kept dry), and small features (thin walls, sharp edges) are harder to resolve cleanly than in rigid materials.\n\nWhen NOT to use TPU: rigid structural parts, anything requiring high dimensional tolerance on tight-fitting features, or when print time is a critical constraint."
      },
      {
        heading: "Nylon (PA12) and carbon-fibre composites",
        body: "Nylon is the workhorse engineering polymer of FDM. High tensile strength, excellent fatigue resistance, low friction, and stable across a wide temperature range. Standard applications: gears, hinges, snap-fits, sliding mechanisms, structural brackets under repeated load.\n\nCarbon-fibre reinforced grades (PLA-CF, PETG-CF, Nylon-CF) add short-fibre reinforcement, which increases stiffness and dimensional stability at the cost of some brittleness and abrasive wear on the nozzle. They're the right call for structural brackets, drone frames, robot arms and jigs that need to hold their shape under load without deflecting.\n\nStrengths of Nylon: outstanding mechanical performance for FDM, self-lubricating, tolerates repeated flexing without fatigue failure. Carbon-fibre composites add stiffness and reduce warp.\n\nWeaknesses: Nylon is hygroscopic — it absorbs moisture from the air and needs to be printed dry. Both Nylon and CF composites are more expensive per gram than PLA/PETG. CF variants also require a hardened steel or ruby nozzle because they wear out brass in a few kilos of print.\n\nWhen NOT to use Nylon or CF: for cost-sensitive parts that PETG could do, or for parts where post-processing (painting, priming) matters more than mechanical performance."
      },
      {
        heading: "Comparison at a glance",
        body: "The table below is a rough ranking of the materials we stock across the properties that most commonly determine material choice. Rankings are relative — \"low\" for TPU flexibility means low compared with rubber, not compared with PLA. Cost is relative per-gram, at typical filament pricing.\n\n| Material | Heat resistance | Mechanical strength | Flexibility | Ease of printing | Outdoor durability | Relative cost |\n|---|---|---|---|---|---|---|\n| PLA | Low (~55 °C) | Medium | Low | High | Low | Low |\n| PETG | Medium (~75 °C) | Medium-High | Slight | Medium-High | Medium-High | Low-Medium |\n| ABS | High (~100 °C) | High | Low | Medium (needs enclosure) | Medium | Medium |\n| ASA | High (~100 °C) | High | Low | Medium (needs enclosure) | High (UV-stable) | Medium |\n| TPU | Medium | Medium (tear-resistant) | Very high | Medium-Low | Medium | Medium |\n| Nylon (PA12) | High | Very High | Low-Medium (some grades) | Medium (needs drying) | Medium | Medium-High |\n| PLA-CF | Low (~55 °C) | High (stiff) | Very low | Medium | Low | High |\n| PETG-CF | Medium (~75 °C) | High (stiff) | Very low | Medium | Medium-High | High |\n| Nylon-CF | High | Very High (stiff) | Low | Medium (needs drying) | Medium | High |\n\nIf you're unsure which of these best fits your part, describe the application when you request a quote — expected loads, temperature range, indoor or outdoor, cost sensitivity — and we'll recommend a material with the reasoning explicit."
      }
    ],
    faqs: [
      { q: "Which material is best for a part that will live outdoors in Barcelona?", a: "ASA is the correct default — it's chemically similar to ABS but genuinely UV-stable, so it holds its colour and mechanical properties over years of sun exposure. PETG is a reasonable secondary option for parts that don't need maximum UV resistance. PLA is not recommended for outdoor use beyond a few weeks." },
      { q: "Can I use PLA for a functional load-bearing part?", a: "For light indoor loads at room temperature, yes — PLA is actually stiffer than PETG on a spec sheet. The reason we usually recommend PETG for functional parts is that PLA is more brittle under sudden impact and has a much lower heat deflection point. If the part will always be indoors, never impacted, and never see heat, PLA is a valid choice." },
      { q: "What's the actual difference between PLA-CF, PETG-CF and Nylon-CF?", a: "They differ in the base polymer — the short-fibre carbon reinforcement improves stiffness in each case, but the underlying strengths remain. Nylon-CF is the strongest and most temperature-resistant, PETG-CF is a middle ground with good chemical resistance, and PLA-CF is the most economical and prints easily, but retains PLA's low heat tolerance." },
      { q: "How much does material choice actually change the price of a part?", a: "For most small parts, material accounts for maybe half of the final cost — the other half is machine time. Between PLA (cheapest) and Nylon-CF (most expensive per gram), the per-gram cost roughly doubles. But because most parts are small, the absolute difference is often only a few euros. For batches of larger parts, material choice starts to matter more." },
      { q: "Do you print with materials I don't see in this guide?", a: "The materials in this guide are our day-to-day rotation. We can source PC (polycarbonate) and other specialty grades on request if the application justifies it — ask when you request the quote and we'll advise on availability and lead time." },
      { q: "How do I decide between PETG and ABS for an outdoor bracket?", a: "For outdoor use specifically, ASA is a better default than ABS because it's UV-stable — regular ABS yellows and eventually cracks in direct sun. PETG is also a reasonable outdoor material for parts that don't need maximum heat or UV resistance. If it will see occasional impact and moderate weather, PETG. If it needs to survive sustained heat and full UV year-round, ASA." }
    ],
    galleryImages: pick("custom-brackets.jpg", "red-adapter.jpg", "curved-parts.jpg", "black-intake.jpg", "intake-manifold.jpg", "blue-molds.jpg"),
    related: [
      { label: "PLA — Everyday Rigid Filament", slug: "/pla-printing-barcelona" },
      { label: "PETG — Tougher Functional Filament", slug: "/petg-printing-barcelona" },
      { label: "TPU — Flexible & Rubber-Like", slug: "/tpu-printing-barcelona" },
      { label: "File Preparation Checklist", slug: "/how-to-prepare-file-for-3d-printing" },
      { label: "Choosing a Service in Barcelona", slug: "/how-to-choose-3d-printing-service-barcelona" },
      { label: "Guía de Materiales (ES)", slug: "/guia-materiales-impresion-3d" }
    ],
    schemaServiceName: "3D Printing Materials Guide"
  },

  // ----- NEW: FILE PREPARATION GUIDE -----
  {
    slug: "/how-to-prepare-file-for-3d-printing",
    topic: "file-prep",
    altSlug: "/como-preparar-archivo-impresion-3d",
    lang: "en",
    category: "use-case",
    metaTitle: "How to Prepare a File for 3D Printing — Practical Guide | Dimension3D",
    metaDescription: "Practical file-preparation guide for FDM 3D printing. Accepted formats, wall thickness, realistic tolerances, orientation, supports, hole sizing, and what to do if you don't have a file at all.",
    h1: "How to Prepare a File for 3D Printing",
    intro: "You've got a 3D model — or an idea of one — and you want it printed. Before you send it, spending ten minutes checking a few things will save time on your quote, avoid revisions, and produce a better part. This guide covers the practical file-preparation steps that make the difference between a smooth print and one that comes back to the design phase.",
    sections: [
      {
        heading: "Accepted file formats — and which one to send",
        body: "We accept the standard 3D file formats: STL, STEP, OBJ, 3MF, and IGES. Each has tradeoffs, and which one to send depends on where your model came from.\n\n• STL is the classic mesh format — a surface of triangles. It's universal, small in file size, and works with everything. Downside: it loses all parametric information; once exported, it's just triangles. Send STL if that's what your software exports or if you exported your model manually.\n\n• STEP (or STP) is the professional CAD interchange format. It preserves the actual geometry — planes, curves, features — so we can measure critical dimensions accurately from the source. If you're modelling in SolidWorks, Fusion 360, Onshape or any professional CAD tool, exporting STEP is preferred. It's a bit larger in file size but gives us more to work with.\n\n• 3MF is a modern replacement for STL that carries colour, material and unit information alongside the mesh. If your software supports it, 3MF is often the safest choice for a clean export.\n\n• OBJ is common in artistic and sculpting workflows (ZBrush, Blender). It preserves mesh detail well but carries no engineering data. Fine for decorative or organic models.\n\nIf you're not sure: STEP if you have it, STL as a universal fallback. Send it as-is. We'll open it, check it, and get back to you if the file has any issues before quoting."
      },
      {
        heading: "Wall thickness minimums for FDM",
        body: "The single most common cause of a printed part that fails is walls that are too thin. FDM prints in extruded lines (typically 0.4 mm wide from a standard nozzle), and walls need to be at least a few line widths thick to hold their shape and function structurally.\n\nPractical minimums for FDM (0.4 mm nozzle):\n\n• Absolute minimum for a wall that must exist: 0.8 mm (two extrusion lines).\n• Minimum for a wall that must be structural — take load, not crack when handled: 1.5–2.0 mm.\n• Comfortable default for enclosure walls, brackets, functional parts: 2.0–3.0 mm.\n• Vertical text or embossed features: at least 0.8 mm wide and 0.4 mm deep for readability.\n\nWalls thinner than 0.8 mm may not print at all — the slicer will skip them. Walls between 0.8 and 1.2 mm will print but are brittle. If your CAD includes sub-millimetre walls (e.g. shells at 0.5 mm) that were fine for injection moulding, they need to be thickened for FDM. If you're not sure whether your part meets these minimums, we'll flag it during file review."
      },
      {
        heading: "Realistic tolerances and how to design for them",
        body: "FDM is not a precision machining process. Typical accuracy on a well-tuned FDM printer is around ±0.2 mm across most dimensions — sometimes tighter on individual features, sometimes wider on large parts due to thermal contraction.\n\nWhat this means in practice:\n\n• Holes print smaller than modelled, typically by 0.1–0.3 mm on diameter, because the extrusion overshoots slightly on the inside of curves. If you need a Ø5 mm hole for a Ø5 mm shaft, model it at Ø5.2–5.3 mm, or plan to drill it out after printing.\n\n• Snap-fits and press-fits need clearance. For two parts that must slide together, allow at least 0.2 mm clearance on each mating surface. For a friction press-fit, 0.1 mm may work but is at the edge of reliability.\n\n• Threaded holes: printing threads directly in FDM works for M6 and larger, but the surface finish is rough. For anything smaller or load-bearing, we typically install a heat-set brass threaded insert (M3, M4, M5 are stocked sizes). Model the hole for the insert, not the thread — we'll do the rest.\n\n• Overall dimensions on large parts (>150 mm) can shrink 0.5–1.0 mm from thermal contraction, especially in ABS or ASA. For a critical outer dimension, we can scale-compensate at slice time.\n\nIf a specific tolerance matters — a mounting-hole spacing, a critical clearance — call it out when you send the file. That's the difference between a quote we can commit to and one we can't."
      },
      {
        heading: "Overhangs, supports and part orientation",
        body: "FDM prints layer by layer from the bed upward. Any part of your geometry that overhangs unsupported space needs support material printed underneath it — which uses filament, takes time, and leaves a rougher surface where it's removed.\n\nRules of thumb:\n\n• Overhangs steeper than 45° from vertical usually need support. A 30° overhang is easy, a 60° overhang needs support, a full 90° overhang (horizontal shelf sticking out) always needs support.\n\n• Bridges — flat sections spanning between two supports — can print unsupported up to about 20–30 mm on a well-tuned printer. Longer bridges need support underneath.\n\n• Orientation changes everything. A part that looks impossible to print in the orientation modelled is often trivial to print rotated. When we review your file, we choose the orientation that minimises supports and maximises the strength of critical features (FDM parts are strongest along the layer plane, weakest between layers — so a hinge, snap-fit or load-bearing tab should be printed with the load direction parallel to the layers, not perpendicular).\n\nYou don't need to design for a specific orientation — that's part of what file review is for. But if a feature has to be a specific finish or a specific strength direction, mention it so we orient accordingly."
      },
      {
        heading: "Hole sizing, thread inserts and press-fits",
        body: "Small mechanical features are where FDM prints most often disappoint if the design wasn't adjusted for the process. A few practical numbers:\n\n• Screw holes for wood or self-tapping screws: model at the shaft diameter (e.g. Ø3 mm for an M3 self-tapper). The plastic gives enough for the thread to bite.\n\n• Holes for metric bolts passing through: model at bolt diameter + 0.3–0.5 mm clearance. An M4 clearance hole should be Ø4.4–4.5 mm in the model.\n\n• Threaded inserts (heat-set brass inserts): we install these commonly in M3, M4 and M5. Model the hole per the insert manufacturer's spec — usually about the outside diameter of the knurled portion minus 0.1 mm. If you're not sure, model a Ø4.5 mm hole for M3, Ø5.7 mm for M4, Ø6.7 mm for M5, and we'll adjust at file review.\n\n• Press-fit shafts: allow 0.1–0.2 mm undersize on the hole for a friction fit. Tighter than that is unreliable; looser than that will spin.\n\n• Living hinges in TPU or PETG: 0.5–1.0 mm thickness, at least 5 mm wide, with rounded transitions. FDM living hinges work but have shorter fatigue lives than injection-moulded equivalents.\n\nIf you're designing from scratch specifically for FDM, these numbers save iteration. If you're adapting a design from another process (injection moulding, CNC), we'll walk through the changes needed at file review."
      },
      {
        heading: "What if you don't have a file at all",
        body: "A significant share of our orders come in with no CAD file at all. That's fine. The process is different, not worse.\n\nWhat we need instead of a file:\n\n• A clear photograph of the part or object — with a ruler, calliper or a Euro coin visible for scale. Two or three angles help. If the part is broken, photograph the pieces separately as well as together.\n\n• Key dimensions if you know them: overall height, width, depth, hole diameters, thickness of any critical features. A quick sketch with measurements written on it works well.\n\n• A description of what the part does: it holds this thing to that thing, it needs to flex, it goes outside, it takes this much weight.\n\nSend those over WhatsApp and we'll assess whether we can reconstruct the geometry from the reference. For simple parts — clips, brackets, spacers, replacement plastic bits from appliances — the reconstruction is usually straightforward and included in the standard quote. For more complex geometry, we may need a modelling fee, which we quote upfront before starting.\n\nThe worst case is that we look at the reference and tell you the reconstruction isn't practical — at which point we can point you toward alternatives (3D scanning, or a modelling contractor). We won't take on a job we can't deliver."
      }
    ],
    faqs: [
      { q: "Is STEP or STL better to send?", a: "STEP if you have it — it preserves the actual geometry so we can measure features exactly. STL is fine as a fallback and works universally. Both produce the same final part if the STL is exported at a high enough resolution." },
      { q: "What's the smallest feature I can reliably print in FDM?", a: "Features smaller than 0.8 mm on a horizontal surface will struggle to resolve cleanly on a 0.4 mm nozzle. Vertical features (like text on a wall) can go a bit smaller but become hard to read. For anything critical below 1 mm, we'll flag it at file review and discuss alternatives — a smaller nozzle, a different orientation, or resin if the feature really matters." },
      { q: "How do I know if my wall thicknesses are OK?", a: "Most CAD tools have a wall-thickness analysis feature that highlights thin regions. If you don't have one, the practical rule is: nothing structural under 1.5 mm, nothing decorative under 0.8 mm. If you send us the file, we check this as part of the standard review — we'd rather flag it than print a part that snaps." },
      { q: "Do I need to add supports myself?", a: "No — never. We handle support generation and orientation as part of the slicing process. Supports added in your CAD or by another slicer would usually just conflict with our own settings. Send the model clean." },
      { q: "Can you scale my file at print time if I need it larger or smaller?", a: "Yes, and we do this often for prototypes and gift items. Say what scale factor or final dimension you want; we'll confirm the resulting dimensions before printing so nothing surprises you." },
      { q: "What happens if my file has errors — non-manifold geometry, flipped normals?", a: "Most modern slicers repair minor mesh issues automatically. For more serious problems (holes in the surface, self-intersecting geometry) we'll flag it at file review and either repair it ourselves for straightforward cases, or send it back for correction if the fix would meaningfully change the geometry. Either way you'll know before we print." }
    ],
    galleryImages: pick("intake-manifold.jpg", "custom-brackets.jpg", "black-intake.jpg", "curved-parts.jpg", "red-adapter.jpg", "blue-molds.jpg"),
    related: [
      { label: "Full Materials Selection Guide", slug: "/3d-printing-materials-guide" },
      { label: "How to Choose a 3D Print Shop", slug: "/how-to-choose-3d-printing-service-barcelona" },
      { label: "Custom Parts from Files or Photos", slug: "/custom-parts-barcelona" },
      { label: "Prototype Iteration Cycle", slug: "/prototype-printing-barcelona" },
      { label: "Best Service by Use Case", slug: "/best-3d-printing-service-barcelona" },
      { label: "Cómo Preparar tu Archivo (ES)", slug: "/como-preparar-archivo-impresion-3d" }
    ],
    schemaServiceName: "3D Printing File Preparation Guide"
  },

  // ----- NEW: BEST 3D PRINTING SERVICE (need-based) -----
  {
    slug: "/best-3d-printing-service-barcelona",
    topic: "best-service",
    altSlug: "/mejor-servicio-impresion-3d-barcelona",
    lang: "en",
    category: "service",
    metaTitle: "Best 3D Printing Service in Barcelona — Which One Fits Your Case | Dimension3D",
    metaDescription: "There is no single \"best\" 3D printing service in Barcelona — it depends on what you're printing, how fast you need it, and what the part has to do. A practical breakdown by use case.",
    h1: "Best 3D Printing Service in Barcelona",
    intro: "There is no single \"best\" 3D printing service — the honest answer depends on what you're printing, how quickly you need it, and what the part has to survive in use. Someone printing 500 identical caps for a production run has different needs from someone who needs one replacement clip by Friday. This page breaks the question down by use case, tells you what to look for in each, and is honest about the cases where we're not the right supplier.",
    sections: [
      {
        heading: "Best for urgent parts (needed this week)",
        body: "If the deciding factor is time — a demo on Monday, a repair the machine can't wait for, a client presentation before the weekend — what matters is:\n\n• A quoted turnaround expressed in business days from approved quote, not vague \"fast turnaround\" language.\n• A clearly stated express or priority service, and what it actually costs.\n• A support channel with a human who answers within the hour during business hours, not a form that returns a ticket number.\n• Willingness to say no if the timeline isn't realistic — a shop that commits to any deadline is a shop that misses some of them.\n\nFor Dimension3D specifically: quotes come back in under 1 hour during business hours, standard turnaround is 2–5 business days from approved quote, express service delivers in 24–48 hours, and same-day production is possible when the queue allows. If your deadline can't be met, we say so upfront rather than committing and slipping."
      },
      {
        heading: "Best for one-off and custom parts",
        body: "For a single custom piece — a replacement bracket, a fixture, a personal project, a broken clip nobody sells anymore — the priorities are different:\n\n• A minimum order low enough that a single small part is a valid job.\n• A person willing to look at the geometry (or a photograph, or a rough sketch) and advise on whether it's printable and in what material.\n• No obligation to design in CAD yourself — either accepting reference images and measurements, or offering paid modelling as a separate line item.\n• Willingness to explain material choice and print settings so you understand what you're paying for.\n\nFor Dimension3D specifically: minimum order is €10, there is no per-part minimum, every file (or reference photograph) is reviewed manually before we quote, and we accept quotes based on photographs plus measurements when no CAD file exists. Material and settings are always explained on the quote so you know what you're approving."
      },
      {
        heading: "Best for business and functional prototypes",
        body: "For engineering teams, R&D departments and small manufacturers, the priorities shift again:\n\n• A working knowledge of the practical difference between materials — when Nylon-CF matters versus when PETG would do the same job for a fraction of the price.\n• Realistic tolerance commitments backed by measurement, not marketing.\n• The ability to repeat a validated part on demand at consistent quality.\n• Standard VAT invoicing and, where required, NDAs signed as a matter of course.\n• Willingness to progress from prototype to short-run production with the same supplier, without re-quoting from scratch.\n\nFor business projects, our dedicated page for business customers goes into more detail: see 3D Printing for Business Barcelona. Typical FDM accuracy is ±0.2 mm across most dimensions; tighter features are quoted individually. Short-run production of 5–200 parts is a routine part of what we do."
      },
      {
        heading: "Best for decoration, gifts and miniatures",
        body: "For personal or gift purposes — figurines, custom decoration, personalised items — the deciding factors are different again:\n\n• Available finishes and surface quality (layer height range, post-processing options).\n• Colour selection and whether the shop stocks the material variety needed for the aesthetic.\n• Realistic photos of what the shop has actually produced, not stock imagery.\n• A ready-made catalogue for items where you don't need something entirely bespoke.\n\nFor commonly-requested items — custom vases, name plates, pet plates, phone stands, cake toppers — see our product catalogue. For fine-detail character work, tabletop gaming pieces and figurines, the miniatures page explains how we approach these projects specifically, including the tradeoffs of FDM at small scales."
      },
      {
        heading: "How to decide, in short",
        body: "The five-second decision framework:\n\n• Urgent and functional → prioritise a shop with an explicit express service and human file review.\n• Single custom part → prioritise a shop with a low or zero per-part minimum and file-review willingness.\n• Business or prototype work → prioritise material knowledge, tolerance commitments, VAT invoicing, and short-run capability.\n• Gift, decoration or personal → prioritise finish options, catalogue availability, and demonstrated portfolio.\n\nFor most of these, a local Barcelona workshop is a structural fit. For very large production runs, ultra-fine detail work, or certified industrial metal parts, other types of provider are structurally better — see the honest section below."
      },
      {
        heading: "When Dimension3D is NOT the best option",
        body: "There are cases where honestly the answer is no. If any of these describe your project, we'd rather send you to the right type of provider than take a job we can't deliver well.\n\n• Very large production runs — hundreds or thousands of identical units. FDM is a per-unit process where cost scales with quantity in a way that injection moulding does not. Above roughly 200 units, or where per-unit cost matters more than tooling investment, a shop specialising in injection moulding (or a dedicated production facility with parallel-machine capacity) will produce parts more economically. For jobs in this range, look for a supplier with an injection-moulding process quote, or a large-scale FDM farm with dozens of machines running the same job in parallel.\n\n• Jewellery, ultra-fine surface detail, dental or high-precision figurines. FDM leaves visible layer lines at even the finest layer heights (about 0.08 mm on a well-tuned printer), which is fine for functional and most decorative parts but visible on jewellery-scale work. For pieces where surface detail below layer resolution matters, look for a shop working with SLA or DLP resin — the process fundamentally produces smoother surfaces at that scale.\n\n• Certified industrial metal parts. We do not offer metal 3D printing. If your project requires structural metal parts to specific certification or material standards — aerospace, medical, load-critical structural components — look for a workshop specialising in metal AM (SLM, DMLS, or binder jetting) with the relevant certifications for your industry.\n\nIn any of these cases, tell us what you're building and we'll suggest the type of provider that fits — even though it isn't us."
      }
    ],
    faqs: [
      { q: "What is the best 3D printing service in Barcelona?", a: "There is no single answer — it depends on the use case. For urgent functional parts, an express-capable local workshop with human file review. For one-off custom parts, a workshop with a low minimum order. For business and prototype work, a workshop with material expertise and tolerance commitments. For decoration and gifts, a workshop with a portfolio and finish options. The sections above walk through how to decide by need." },
      { q: "How do I compare 3D printing services objectively?", a: "Look at structural features rather than marketing: minimum order stated in numbers, turnaround expressed in business days from approved quote, whether a human reviews the file before printing, language of support, in-person pickup availability, and whether the shop can quote based on photographs when no CAD exists. Our companion buyer's guide covers this in more detail." },
      { q: "What's the fastest 3D printing service in Barcelona?", a: "For genuine urgency, look for a shop with a stated express service (24–48 hours) rather than vague \"fast\" language, and with a support channel that answers within the hour. We offer express in 24–48 hours and same-day production when the queue allows." },
      { q: "Which service is best for a single custom part?", a: "A local workshop with a low or zero per-part minimum, willing to accept a photograph or sketch when no CAD file exists, and willing to review the geometry manually. Minimum orders in the €10–€50 range are common at local workshops. Ours is €10 with no per-part minimum." },
      { q: "Is Dimension3D always the cheapest option?", a: "No. Cheapest per-unit for large production runs is usually an injection-moulding supplier or a large-scale FDM farm. For small quantities, one-off parts and functional prototypes, the price gap between local workshops is usually small — the meaningful difference is response speed, human file review and communication quality. If the price for your project matters more than any other factor, always compare quotes." },
      { q: "When should I not use FDM 3D printing at all?", a: "For pieces requiring surface detail below the layer-line resolution (roughly 0.08 mm on a well-tuned FDM printer) — fine jewellery, dental work, ultra-detailed figurines — SLA or DLP resin printing is fundamentally the right process. For structural metal parts requiring specific certifications, metal AM (SLM, DMLS) is the right process. FDM is the right tool for a wide range of applications, but not every one." }
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "custom-brackets.jpg", "intake-manifold.jpg", "purple-figures.jpg", "green-chameleon.jpg", "eiffel-tower.jpg"),
    related: [
      { label: "How to Choose a Service", slug: "/how-to-choose-3d-printing-service-barcelona" },
      { label: "Materials Selection Guide", slug: "/3d-printing-materials-guide" },
      { label: "File Preparation Guide", slug: "/how-to-prepare-file-for-3d-printing" },
      { label: "Our 3D Printing Service", slug: "/3d-printing-barcelona" },
      { label: "Transparent Price Breakdown", slug: "/3d-printing-price-barcelona" },
      { label: "Mejor Servicio (ES)", slug: "/mejor-servicio-impresion-3d-barcelona" }
    ],
    schemaServiceName: "Best 3D Printing Service Barcelona"
  },

  // ----- NEW: MAKER INCOME (how to make money with a 3D printer) -----
  {
    slug: "/how-to-make-money-with-a-3d-printer",
    topic: "maker-income",
    altSlug: "/como-ganar-dinero-con-impresora-3d",
    lang: "en",
    category: "use-case",
    audience: "maker",
    metaTitle: "How to Make Money With a 3D Printer — Honest Guide for Owners | Dimension3D",
    metaDescription: "A practical guide to earning income from a 3D printer you already own. Real income paths — local sales, marketplaces, design files, small-batch work, replacement parts, print networks — with realistic effort and honest downsides for each.",
    h1: "How to Make Money With a 3D Printer",
    intro: "You own a 3D printer and you want it to earn its keep. Good — but the internet is full of tutorials that skip the awkward parts (competition, fees, slow ramp times, the amount of hands-on hustle each channel really needs). This guide walks through the concrete ways people actually generate income from an FDM printer at home, with the tradeoffs stated up front and no promises attached. One of the shortest paths, when it works, is joining a local print network — Dimension3D's is free to join, with no signup fee, no commission and no exclusivity — so it can run in parallel with any of the other channels below.",
    sections: [
      {
        heading: "Selling finished prints locally — the fastest first sale",
        body: "Selling physical prints to people in your own city is the shortest path from printer to first income. You avoid shipping, you avoid platform fees, and the customer either loves the object in their hands or they don't — no returns from a photo not matching reality.\n\nWhat sells locally, in practice: personalised gifts (name plates, keyrings, cake toppers), practical household items (phone stands, cable holders, small organisers, planters), replacement clips and knobs neighbours ask you about once they know what you do, and modest decorative pieces (small vases, seasonal decorations, tabletop miniatures for local hobby groups). The volume is small but the friction is almost zero.\n\nRealistic effort: low to medium. You need a way to be found — a WhatsApp status, a couple of Instagram posts, a local Facebook group, a mention in a neighbourhood chat. Time to first income: fast, often within a week or two of telling anyone. Main downside: local demand caps out. In a small circle, one dozen sales in a month is already a lot, and you'll plateau quickly without expanding your reach or your catalogue."
      },
      {
        heading: "Joining a print network — free to join, no commission, orders from your area go to you",
        body: "Before the individual channels below, the shortest path to real customer orders you did not have to market for is joining a local print network. The Dimension3D maker network is set up for exactly this, and the offer is deliberately kept simple:\n\n• Joining is free — no signup fee, no application charge, no trial credit card.\n• No commission on your work — every euro a customer pays you stays with you.\n• No exclusivity clause — you continue selling on Wallapop, Etsy, Cults3D or anywhere else you already earn.\n• Terms are agreed individually with each maker before any work begins, so nothing is imposed generically.\n• Makers produce locally under the Dimension3D brand when orders arrive in their area, so you're not limited to a single city.\n\nHow the model works in practice: someone else runs the marketing pipeline — SEO, listings, ads, brand, customer relationships — and routes real orders that come in to makers in the customer's local area. You keep your printer, you keep your prices, and the jobs you accept run under the Dimension3D brand. Everything the network sends is on top of whatever else you're already doing, because there is no exclusivity clause.\n\nThe network is expanding city by city. The actual number of requests you'll see depends on real demand in your specific city — a maker in a market where the brand is well-established will see more requests than one where the network has just launched. There are no guaranteed numbers and no promised monthly volume. What is guaranteed is that joining costs nothing and there is no lock-in, so if orders in your city don't materialise yet, you have lost nothing.\n\nApply on [/makers](/makers). See [/maker-guide](/maker-guide) for the full workflow — how orders reach you, how quoting works, and how payment goes directly from customer to maker with no platform in the middle."
      },
      {
        heading: "Marketplaces (Etsy, Wallapop, eBay) — reach at the cost of fees and competition",
        body: "Marketplaces let a stranger halfway across the country find your listing on a Tuesday afternoon. That reach is genuinely valuable — and it comes with two costs.\n\nFirst, fees. Etsy charges a listing fee plus a percentage of each sale plus payment processing. eBay's fee structure is similar in effect. Wallapop is free for casual selling but takes a cut on shipping-integrated sales and pushes paid promotion. Assume something in the range of 8–15% off the top on any platform that does customer discovery for you.\n\nSecond, competition. Any product you can list, hundreds of other sellers have already listed too — often cheaper, often with better photography, sometimes shipping from a country with lower labour and material costs. Winning on price is a race to the bottom that isn't worth entering. Winning on differentiation (a niche, better photos, a specific personalisation option, faster shipping to a local market) is the only durable strategy.\n\nRealistic effort: medium to high, ongoing. Listings need updating, photos need improving, messages need answering fast, reviews need protecting. Time to first income: days to weeks after the listing is live and priced correctly. Main downside: without a specific niche or genuine differentiator, most listings drown."
      },
      {
        heading: "Selling design files (Cults3D, MakerWorld, others) — passive income that ramps slowly",
        body: "If you're comfortable in a 3D modelling tool, you can sell the file instead of the print. A single well-designed model uploaded to Cults3D or MakerWorld can sell for years without you doing anything after the upload. It is the closest thing 3D printing has to genuinely passive income.\n\nThe ramp, though, is slow. A new file with no reviews and no brand behind it typically sells nothing for the first few months. What works: publishing a steady stream of files (dozens, not two or three), building a following, and either aiming at a specific niche (a game franchise's fans, a specific hobby) or producing files with a distinctive style people learn to recognise.\n\nRealistic effort: high upfront (learning to model, iterating on quality, producing enough files to matter), low ongoing after the catalogue is built. Time to first meaningful income: months, sometimes longer. Main downside: it's a portfolio business — early income is essentially zero, and giving up before month six means walking away just before the compounding starts."
      },
      {
        heading: "Prototyping and small-batch work for local businesses",
        body: "Every neighbourhood has small businesses that occasionally need a physical part — an architect who wants a scale model for a client presentation, a bar owner who needs custom drink markers, a workshop that broke a proprietary bracket, a dental clinic that wants branded desk objects. These jobs pay better per part than consumer sales because the customer is buying a solution, not a novelty.\n\nHow to reach them: introduce yourself as a local 3D printing service to businesses in a specific radius, hand out a simple card, list yourself on Google Business, and stay responsive. The first job is the hard one; repeat jobs happen without prompting once you've delivered well.\n\nRealistic effort: medium — a few afternoons of outreach up front, then reactive work. Time to first income: weeks. Main downside: unpredictable — a good month might be four jobs, a slow month might be zero, and it takes 6–12 months of consistent presence before local businesses think of you first for this kind of work."
      },
      {
        heading: "Repair and replacement parts — high-value, high-trust work",
        body: "One of the highest-margin uses of a home printer is replacing broken plastic parts on things people already own — a specific washing-machine detergent-drawer clip, a fridge shelf support, a vacuum cleaner adaptor, a discontinued furniture connector. The customer is comparing your quote (a few tens of euros) against the alternative of buying a whole new appliance (hundreds), so pricing is generous relative to consumer items.\n\nThe catch is that most jobs require either modelling from a photo or careful measurement of the broken original. That skill takes practice. Simple symmetric parts are quick; complex geometries are legitimately hard and sometimes not worth quoting.\n\nRealistic effort: medium per job, but each successful repair produces a delighted customer who tells other people. Word of mouth on replacement work compounds unusually well. Time to first income: fast once you start telling neighbours and posting in local groups. Main downside: workload is bursty (five jobs one week, none the next), and the modelling skill has a real learning curve — expect to write off a couple of early jobs to experience."
      }
    ],
    faqs: [
      { q: "How do I join the Dimension3D maker network?", a: "Apply on [/makers](/makers) — the form takes about two minutes. We read every application personally, usually within 24 hours, and reply on WhatsApp or email. Joining is free: no signup fee, no commission on your work, and no exclusivity clause, so you continue selling wherever else you already sell. Terms are agreed individually with each maker before any work begins. Your first month is free, and after that the fee is a flat monthly amount agreed with you before it starts — commonly from €2/month. See [/maker-guide](/maker-guide) for the full walkthrough." },
      { q: "How do I monetize a 3D printer if I've never sold anything before?", a: "Start with the shortest path to a first sale: tell people you know that you're printing, take one photo of a project, and offer to do small personalised or practical jobs for anyone in your circle. Once you have one paying customer, patterns become obvious — what people ask for, what they're willing to pay, where the friction is. Every other channel (marketplaces, networks, design files) becomes easier once you've actually delivered something for money." },
      { q: "How much money can I realistically make with a 3D printer at home?", a: "Honestly, it varies enormously — from nothing at all (if the printer sits idle) to a modest side income (a few hundred euros a month, part-time) to a genuine primary income (with multiple printers and full-time hustle). What matters most is how much time you put in and which income channel you're leaning on. Passive channels like design files pay very slowly. Active channels like local sales pay faster but cap lower. Networks pay based on the demand in your city." },
      { q: "Is it worth selling on Etsy or Wallapop specifically for 3D prints?", a: "It's worth trying, but go in expecting fees to eat 10–15% and expecting the first months to be quiet. Both platforms reward sellers who have a specific niche or a distinctive style. Generic listings (a phone stand, a name keychain) compete with thousands of near-identical ones and typically don't move." },
      { q: "How long before selling 3D-printed products becomes profitable?", a: "For local direct sales, first income can arrive within days but the total often stays small unless you actively expand reach. For marketplaces, expect 1–3 months of tuning listings before consistent orders. For design files, meaningful income usually takes 6 months or more. For network-driven orders, it depends on demand in your specific city rather than time spent." },
      { q: "Do I need to register as self-employed to sell 3D prints legally?", a: "That depends entirely on your local tax rules and how much you earn, not on 3D printing specifically. In Spain, occasional casual income below certain thresholds does not require autónomo registration, but regular business activity does. Rules differ in every country. If you're going beyond casual, consult a local tax adviser — we're not tax professionals and this isn't legal advice." },
      { q: "Which income path has the best ratio of effort to money earned?", a: "Nothing dominates all the others — that's why this guide covers six of them. In practice, most makers who earn consistently combine two or three channels: for example, local repeat customers plus a print network plus a small design-file catalogue. That way slow channels compound in the background while active channels pay the bills." }
    ],
    galleryImages: pick("custom-brackets.jpg", "ferrari-key-holder.jpg", "purple-figures.jpg", "halloween-set.jpg", "cookie-cutters.jpg", "red-adapter.jpg"),
    related: [
      { label: "Real Economics of a Print Business", slug: "/is-3d-printing-business-profitable" },
      { label: "How to Get Your First Customers", slug: "/how-to-get-3d-printing-customers" },
      { label: "Join the Local Maker Network", slug: "/makers" },
      { label: "How the Network Works", slug: "/maker-guide" },
      { label: "Guía en Español", slug: "/como-ganar-dinero-con-impresora-3d" },
      { label: "Deutsche Version", slug: "/mit-3d-drucker-geld-verdienen" }
    ],
    schemaServiceName: "Making Money With a 3D Printer — Guide"
  },

  // ----- NEW: MAKER PROFITABILITY (is a 3D printing business profitable) -----
  {
    slug: "/is-3d-printing-business-profitable",
    topic: "maker-profitability",
    altSlug: "/es-rentable-negocio-impresion-3d",
    lang: "en",
    category: "use-case",
    audience: "maker",
    metaTitle: "Is a 3D Printing Business Profitable? Real Costs & Pricing | Dimension3D",
    metaDescription: "The honest economics of a 3D printing business: filament cost per gram, electricity per print hour, printer amortisation, failure rate, packaging and shipping — and a worked example turning those inputs into a defendable price.",
    h1: "Is a 3D Printing Business Profitable? The Real Numbers",
    intro: "Whether 3D printing is profitable depends on whether the price you charge covers every input that goes into a part — not just the plastic. This page breaks the cost of an FDM print down into its actual components, gives realistic ranges for each (with the reasoning), and walks through a fully worked example so you can build defendable pricing for your own work. It also covers the input most cost breakdowns leave out — customer acquisition — and how a free-to-join local network like Dimension3D's changes the math when orders come to you instead of you chasing them.",
    sections: [
      {
        heading: "Filament cost — per kilo and per gram",
        body: "Filament is the most visible input, and the easiest to price correctly if you approach it in grams rather than reels.\n\nTypical spool pricing at retail in Europe in the current market: PLA runs roughly €18–28 per kg for basic colours from mid-range brands, €30–45 per kg for silks, marbles and specialty finishes. PETG usually sits €20–30 per kg. ABS/ASA lands around €22–35 per kg. TPU is meaningfully more expensive at €35–55 per kg. Nylon and carbon-fibre-reinforced grades start around €45 per kg and climb from there.\n\nConvert to grams and price per gram becomes: PLA at roughly €0.02–0.045 per gram, PETG at €0.02–0.03, TPU at €0.035–0.055, Nylon-CF at €0.06+. A slicer estimates the grams-in-part figure directly — the number to trust for pricing is the slicer's estimate plus a small buffer (5–10%) for purge, priming and inevitable minor waste.\n\nA small everyday part is typically 15–60 g. A medium functional part is 80–200 g. A large decorative piece or a helmet can be 300 g to well over a kilo. Meaning: material cost alone on most consumer-scale prints is in the range of a few tens of cents to a few euros — small relative to the final price the customer should pay."
      },
      {
        heading: "Customer acquisition — the missing line in most cost breakdowns, and how a network zeros it out",
        body: "Every input above assumes you're already finding your own customers. That effort is real cost: months of Google Business setup before reviews compound, hours per week answering enquiries on Wallapop that don't convert, Etsy listing fees, cross-border shipping puzzles, all the trial-and-error of first-time pricing and photography. Most 3D-printing cost breakdowns leave customer acquisition out because it isn't attributable to a specific part — but it's the largest single fixed cost of running a maker side income, and the reason many otherwise-competent makers never reach profitability.\n\nThe Dimension3D maker network is designed to remove that line entirely. The offer is deliberately simple:\n\n• Joining is free — no signup fee, no application charge.\n• No commission on your work — every euro a customer pays you stays with you.\n• No exclusivity — you continue selling anywhere else you already earn.\n• Terms are agreed individually with each maker before any work begins, so nothing is imposed generically.\n• Makers produce locally under the Dimension3D brand when orders arrive in their area.\n\nHow the model works in practice: someone else runs the marketing pipeline — SEO, listings, ads, brand — and routes real customer orders to makers in the local area of each order. You keep your printer, you keep your prices, and every job you accept runs on top of whatever else you're already doing.\n\nThe network is expanding city by city, so the number of requests you'll see depends on real demand in your specific city — there are no guaranteed volumes and no promised monthly numbers. What is guaranteed is that joining costs nothing and there is no lock-in. If the network produces orders in your city, your effective customer-acquisition cost on those orders is zero, and the price-building math in the following sections runs on top of a genuinely different fixed-cost base.\n\nApply on [/makers](/makers). See [/maker-guide](/maker-guide) for the full workflow — how orders reach you, how quoting works, and how payment goes directly from customer to maker."
      },
      {
        heading: "Electricity — the cost per print hour",
        body: "A running FDM printer draws power almost entirely for the heated bed and hotend, with a small constant draw for motors and electronics. Average power draw during printing on a typical desktop FDM machine (single hotend, 60 °C bed) sits around 80–150 W. Enclosed printers with heated chambers or dual hotends run higher, sometimes 200–300 W.\n\nAt a European retail electricity price in a normal range of €0.15–0.30 per kWh, that works out to roughly €0.015–0.045 per print hour on a standard machine, or a few cents per hour. A 10-hour print in that bracket costs €0.15–0.45 in electricity. That is genuinely low — electricity is rarely the cost that decides whether a job is profitable.\n\nBe explicit about it anyway. Pricing based on plastic alone leaves a small but consistent margin unaccounted for, and over dozens of prints a month it adds up. The way to fold it in is to include a per-hour machine rate (see printer amortisation below) that combines electricity and depreciation into a single number."
      },
      {
        heading: "Printer amortisation — spreading the machine cost across print hours",
        body: "The printer itself has a finite working life. Rather than treating the purchase as a lump sum you either recovered or didn't, price it in per hour of use — the same way any equipment-based business does.\n\nA reasonable assumption for a mid-range consumer FDM printer purchased around €400–800: expect a useful working life on the order of 2,000–4,000 print hours before major components (hotend, bed, extruder) need replacing or the machine itself needs meaningful maintenance. Actual working life varies enormously with brand, care and duty cycle — some machines last much longer, some die earlier — but assuming somewhere in that range for planning is fair.\n\nDividing €400–800 across 2,000–4,000 hours gives an amortised machine cost of roughly €0.10–0.40 per print hour. Combined with electricity (a few cents an hour), a defendable machine rate is somewhere around €0.15–0.50 per print hour depending on your printer and your assumptions. For a 10-hour print, that's €1.50–5.00 attributable to the machine itself — small compared to your time, but not zero and worth including."
      },
      {
        heading: "Failure rate, packaging, shipping — the hidden costs new sellers miss",
        body: "Failed prints are real cost. A well-tuned printer running well-understood materials fails maybe 5–10% of the time in normal home operation, higher on unusual geometries or unfamiliar materials, lower on flat-bottomed simple parts you print often. Every failed print consumed material, electricity and machine time you now have to recover from successful ones. Add roughly 10% to your per-part cost as a failure buffer — more if you're working with a difficult material or a first-time geometry.\n\nPackaging matters more than most new sellers estimate. A protective mailer bag or a small box, bubble wrap, a printed label — figure €0.50–2.00 per shipped order depending on part size. Skimp on packaging and the first broken-in-transit part costs more in refunds and reviews than the packaging would have for a hundred orders.\n\nShipping is either paid by the customer (transparent, no ambiguity) or bundled into your price (simpler for the customer, but be honest with yourself about the actual cost — €4–8 for a small tracked national package in most of Europe, more for larger boxes and international destinations). Under-costed shipping is the single most common way small sellers accidentally lose money on orders."
      },
      {
        heading: "Worked example — building a price from the inputs",
        body: "Take a concrete part: a mid-sized custom bracket, 120 g of PETG, 8-hour print time, shipped nationally within Spain in a small padded box.\n\n• Material: 120 g × €0.025/g = €3.00 (PETG at a mid-range price), plus 10% waste buffer = €3.30.\n• Machine rate: 8 hours × €0.30/hour = €2.40 (mid-range printer amortisation plus electricity).\n• Failure buffer: 10% of material + machine cost = €0.57.\n• Packaging + labels: €1.20.\n• Shipping: €5.50 for a small tracked national package.\n• Direct cost so far: €12.97.\n\nAt this point you have covered every physical input and lost nothing — but you have paid yourself zero. Add labour: even 30 minutes of hands-on time (slicing, prep, post-processing, packing, communicating with the customer) at a modest €15/hour is €7.50. Direct cost including your time: €20.47.\n\nNow add margin. A commercial 3D printing service typically applies a 40–100% markup over direct cost, depending on complexity, urgency and how differentiated the offering is. For this part at a mid-range 60% markup, the final price becomes roughly €33. At the very low end (a hobby seller barely covering costs), €25 might be defendable. At the high end for an urgent job with tight-tolerance requirements, €45 is not unreasonable.\n\nThe point is not that €33 is the right number for every bracket. The point is that a price built up from inputs plus labour plus margin is defendable — you can explain every component of it to a customer who asks. A price pulled from thin air is not."
      },
      {
        heading: "Why very small cheap parts are usually unprofitable — and minimum order values",
        body: "Once you internalise the cost breakdown, one specific type of job becomes obviously problematic: the very small, very cheap request. A 5-gram print that takes 20 minutes costs less than a euro in material and machine time, but the fixed costs — labour to communicate with the customer, packaging, shipping, transaction processing — do not shrink proportionally. You still need to slice it, message the customer, pack it and ship it. On a €5 print those fixed costs consume most of the price. On a €30 print they're a footnote.\n\nThis is why almost every commercial 3D printing operation has a minimum order value, typically somewhere between €10 and €30 depending on the business model. It isn't greed — it's arithmetic. Below the minimum, orders lose money once fixed costs are honestly included.\n\nAs a maker, set your own minimum from the start. If a €5 print takes you 15 minutes of hands-on work and consumes packaging and shipping, you are losing money and building a habit of undervaluing your time. A stated minimum (whether €10, €15 or €20) filters out the requests that were never going to be worth your time and gives you space to serve the customers who do value the work."
      }
    ],
    faqs: [
      { q: "How do I join the Dimension3D maker network?", a: "Apply on [/makers](/makers) — the form takes about two minutes. We read every application personally, usually within 24 hours, and reply on WhatsApp or email. Joining is free: no signup fee, no commission on your work, and no exclusivity clause, so you continue selling wherever else you already sell. Terms are agreed individually with each maker before any work begins. Your first month is free, and after that the fee is a flat monthly amount agreed with you before it starts — commonly from €2/month. See [/maker-guide](/maker-guide) for the full walkthrough." },
      { q: "Is a 3D printing business actually profitable in practice?", a: "It can be, but not automatically — profitability depends entirely on whether the price charged covers material, machine time, failure rate, packaging, shipping and labour, and still leaves a margin. Businesses that price on plastic alone typically break even at best. Businesses that build a defendable per-part price from the inputs above regularly earn a healthy margin, especially on functional and repair work where customers are comparing against the cost of a replacement product." },
      { q: "How much does it really cost to run a 3D printer per hour?", a: "For a typical consumer FDM printer, electricity alone runs a few cents an hour (€0.015–0.045/hour at European retail rates and 80–150 W draw). Once you fold in printer amortisation (spreading the purchase price over 2,000–4,000 useful hours), a defendable per-hour machine rate lands somewhere around €0.15–0.50. Consumables (nozzles, PTFE tubes, occasional replacement parts) add a small further ongoing cost." },
      { q: "What profit margin should I charge on a 3D print?", a: "Commercial 3D printing services typically add a 40–100% markup over direct cost (material + machine time + failure buffer + packaging + shipping + labour). At the low end you're a hobby seller barely covering yourself; at the high end you're pricing for complex, urgent or differentiated work. Below 40% markup and unusual events (a returned order, a failed batch, a slow month) will eat your profit entirely." },
      { q: "Why do 3D printing services have minimum order values?", a: "Because fixed costs — communicating with the customer, slicing, packaging, shipping, transaction processing — do not scale down as the part gets smaller. A €5 print that takes 20 minutes of your time is a loss once those fixed costs are honestly included. A stated minimum (typically €10–30) filters out orders that were never going to be profitable and lets the business focus on jobs where the value is proportionate to the work." },
      { q: "How do I calculate my price per gram of filament accurately?", a: "Take the actual price you paid for the spool (including shipping if relevant) and divide by the weight in grams — for a €22, 1 kg spool that's €0.022 per gram. Then have your slicer estimate the grams of filament your part will consume, add a 5–10% waste buffer for purge and priming, and multiply. This is the material line only — not the price you charge the customer, which layers machine time, failure buffer, packaging, shipping, labour and margin on top." },
      { q: "How many prints can a consumer 3D printer do before it needs major maintenance?", a: "There is no single number — it depends on the brand, how well the printer is maintained, and how hard it's being run. A reasonable planning assumption for a mid-range consumer FDM printer is 2,000–4,000 print hours before major components (hotend, bed, extruder) need replacement or significant maintenance. Some machines last far longer with proper care; some die sooner if run hot and hard. Use whatever assumption you're comfortable with for the amortisation calculation and revise it as your own printer's history unfolds." }
    ],
    galleryImages: pick("intake-manifold.jpg", "custom-brackets.jpg", "black-intake.jpg", "curved-parts.jpg", "blue-molds.jpg", "red-adapter.jpg"),
    related: [
      { label: "Real Income Paths for Makers", slug: "/how-to-make-money-with-a-3d-printer" },
      { label: "Customer Acquisition Playbook", slug: "/how-to-get-3d-printing-customers" },
      { label: "Join the Local Maker Network", slug: "/makers" },
      { label: "Maker Network Explained", slug: "/maker-guide" },
      { label: "Rentabilidad (ES)", slug: "/es-rentable-negocio-impresion-3d" },
      { label: "Rentabilität (DE)", slug: "/ist-3d-druck-geschaeft-rentabel" }
    ],
    schemaServiceName: "3D Printing Business Profitability Guide"
  },

  // ----- NEW: MAKER CUSTOMERS (how to get 3D printing customers) -----
  {
    slug: "/how-to-get-3d-printing-customers",
    topic: "maker-customers",
    altSlug: "/como-conseguir-clientes-impresion-3d",
    lang: "en",
    category: "use-case",
    audience: "maker",
    metaTitle: "How to Get 3D Printing Customers — What Actually Works | Dimension3D",
    metaDescription: "Printer ready but nobody ordering? Practical customer-acquisition guide for 3D printing makers: Google Business Profile, marketplaces, photography, transparent pricing, response speed, repeat customers, and joining an existing print network.",
    h1: "How to Get 3D Printing Customers — The Real Problem",
    intro: "The hardest problem in 3D printing isn't printing. It's the silence between installing the printer and the first customer message arriving. This page is about closing that gap — the concrete things that convert a working printer into a steady flow of orders. If you want to skip the marketing hustle entirely, one option is joining a local print network — Dimension3D's is free to join, with no signup fee, no commission and no exclusivity — and every self-marketing path below still works alongside it.",
    sections: [
      {
        heading: "Google Business Profile — the free listing every maker skips",
        body: "Google Business Profile (formerly Google My Business) is a free listing that puts your 3D printing service on Google Maps and in the local pack at the top of local search results. It is the single highest-leverage piece of free marketing for a location-based service, and most home-based makers never set it up.\n\nWhat you need: a name for your service, a service area (you don't need a public storefront — a service-area business is a legitimate profile type), contact details, business hours, categories (3D printing service is a valid category), and photographs of your work. Google will verify the business, typically by postcard or phone, before the listing goes live.\n\nOnce live, encourage happy customers to leave a review. Reviews are the single largest signal Google uses to rank local businesses. Ten genuine reviews from real customers over a few months will outperform any amount of paid advertising for a small local service. Reply to every review, positive or negative, in a professional tone — that's visible to future customers too."
      },
      {
        heading: "Joining an existing print network — orders that come to you, free to join",
        body: "Everything else on this page is a channel you have to build yourself, and each takes months of consistency before it produces orders reliably. If you want a shorter path to real customer requests that you did not have to source yourself, joining an existing local print network is the low-friction option worth considering first.\n\nThe Dimension3D maker network is set up specifically for this, and the offer is deliberately simple:\n\n• Joining is free — no signup fee, no application charge, no trial credit card.\n• No commission on your work — every euro a customer pays you stays with you.\n• No exclusivity clause — you continue using every other channel below (Google Business, marketplaces, direct clients) in parallel.\n• Terms are agreed individually with each maker before any work begins, so nothing is imposed generically.\n• Makers produce locally under the Dimension3D brand when orders arrive in their area.\n\nHow orders reach you: a customer searches for a 3D print in their city, lands on Dimension3D, submits an enquiry, and the request is routed to a maker in their local area — you keep your printer, you set the price, and the customer pays you directly. Dimension3D never touches the money.\n\nThe network is expanding city by city, so the volume of requests you'll see depends on the real demand in your city — a maker in a market where the brand is already established will see more requests than one where the network has just launched. There are no guaranteed numbers and no promised monthly volume. What is guaranteed is that joining costs nothing and there is no lock-in — if orders don't come yet in your city, you haven't lost anything.\n\nApply on [/makers](/makers). See [/maker-guide](/maker-guide) for the full workflow — how orders reach you, how quoting works, and how payment goes directly from customer to maker.\n\nEverything below this section is what to do in parallel — building your own visibility through marketplaces, photography, pricing, response speed and repeat customers."
      },
      {
        heading: "Local marketplace listings — where people already look",
        body: "In Spain, Wallapop is where people go when they need something specific and want to see local sellers. In France, Leboncoin. In Germany, Kleinanzeigen (formerly eBay Kleinanzeigen). Etsy and eBay cover cross-border reach. Each has its own dynamics; the common thread is that people are already there, actively looking.\n\nWhat performs well on classifieds: specific practical items (name plates, phone stands, cable organisers, custom keychains, cake toppers), replacement parts described specifically enough that someone searching for the exact problem finds them, and personalised gifts with a clear photo of what the customisation looks like.\n\nWhat doesn't work: generic listings with no photograph, prices with no context, or copy that doesn't say what the item does. Compete on clarity, not on being the cheapest. The cheapest listing on every marketplace is usually one you don't want to be underbidding."
      },
      {
        heading: "Photographing your prints properly — the single biggest lever",
        body: "The gap between a listing that sells and one that doesn't is very often the photograph. Prints on a cluttered desk under harsh overhead lighting look worse than the object actually is. Prints on a clean background in soft daylight look like a professional catalogue.\n\nThe minimum practical setup for good product photography of a 3D print: a plain background (a folded white sheet, a piece of foamcore, a lightbox if you're serious), soft indirect daylight or a cheap softbox lamp, a phone camera held steady (a tripod, a stack of books, anything), and multiple angles including one that shows the object at the correct scale (either next to a coin, a hand, or a familiar object).\n\nOne genuinely well-lit photograph with a clean background will outsell three phone snaps taken quickly on the workshop floor. It costs nothing except twenty minutes of setup and re-use across every listing you post."
      },
      {
        heading: "Transparent pricing — remove friction, not margin",
        body: "Every customer message you receive that asks 'how much does this cost' is a message you didn't need to spend time on. Transparent pricing published up front (whether as a table, a per-gram figure, a minimum order value, or a set of common item prices) converts casual browsers into customers because they can decide without having to interact with a stranger.\n\nWhat to publish: your minimum order value (this alone filters out the requests that were never going to be profitable), typical prices for the categories of work you actually do (a per-gram rate, a starting-from figure for common items), and any surcharges or discounts that consistently apply (urgent surcharge, quantity discount for larger batches). You do not need to publish every possible price — you need to publish enough that the customer knows whether they're in your general range before they contact you.\n\nHiding pricing 'to preserve flexibility' loses more sales than it protects. Customers who never got a rough number will assume the worst and move on."
      },
      {
        heading: "Response speed — the underrated competitive advantage",
        body: "In service work, the first responder frequently wins the job. If a customer sends the same enquiry to three makers and one replies within thirty minutes, one within four hours and one the next day, the fast responder gets the order most of the time — regardless of who was cheapest.\n\nWhat this looks like in practice: keep WhatsApp notifications on during your working hours, reply with at least an acknowledgement even if the full quote will take longer, and set expectations honestly ('I'll have a full quote by tonight' beats silence for four hours). A short polite acknowledgement message within minutes is worth more to conversion than a beautifully-formatted quote sent six hours later.\n\nThis is not about being on-call at 2 a.m. — it's about defining your response window (say, weekdays 9 a.m. to 8 p.m.) and being consistently fast within it. Publish that window somewhere visible so customers who message outside it know when to expect an answer."
      },
      {
        heading: "Repeat vs one-off customers — where the real business is",
        body: "One-off customers pay the bills on Tuesday. Repeat customers are the actual business. A customer who ordered a bracket in March, a personalised gift in June and a small batch of prototypes in September is worth many times more, over a year, than three unrelated first-time buyers — and cost far less to acquire because you already have their trust.\n\nThe simplest thing you can do to encourage repeat business: keep the customer's file on record so a reorder takes minutes rather than starting from scratch, follow up briefly after delivery to check the part worked as expected (this is genuinely rare and it stands out), and remember what they ordered so the next conversation starts warm rather than cold. Small businesses that order once for a specific need often come back for the next one if the first experience was good and the friction to reorder is low.\n\nMost consumer channels (marketplaces, classifieds) actively discourage direct repeat business by pushing communication back through their platform. Local relationships and direct-contact customers are where the compounding happens."
      }
    ],
    faqs: [
      { q: "How do I join the Dimension3D maker network?", a: "Apply on [/makers](/makers) — the form takes about two minutes. We read every application personally, usually within 24 hours, and reply on WhatsApp or email. Joining is free: no signup fee, no commission on your work, and no exclusivity clause, so you continue selling wherever else you already sell. Terms are agreed individually with each maker before any work begins. Your first month is free, and after that the fee is a flat monthly amount agreed with you before it starts — commonly from €2/month. See [/maker-guide](/maker-guide) for the full walkthrough." },
      { q: "How do I find my first 3D printing customer?", a: "The shortest path is telling people you already know — post one clear photograph of a project to your existing social circle (Instagram, WhatsApp status, a local Facebook or Nextdoor group), offer something small and specific rather than a generic 'I can print anything', and be ready to reply quickly when the first message arrives. First customers almost always come from someone one or two connections away rather than a stranger finding your listing." },
      { q: "Is Google Business Profile worth setting up for a 3D printing service?", a: "Yes — it's free, and for any location-based service it's the single highest-leverage piece of local marketing. You do not need a public storefront (service-area business profiles are a legitimate profile type). Ten genuine reviews from happy customers over a few months will produce more sustained inbound enquiries than any amount of paid advertising for a small local operation." },
      { q: "Why do my Wallapop or Etsy listings get views but no orders?", a: "Almost always one of three things: the price is out of line with visible competition, the photograph does not show the object clearly against a clean background, or the description does not explicitly say what the object does and who it's for. Views without orders are actually a positive signal — it means the listing surfaces in search. The gap to close is between 'someone clicked' and 'someone messaged', which is usually a photography and copy problem, not a reach problem." },
      { q: "How fast do I need to reply to customer enquiries?", a: "During your stated working hours, within thirty minutes is a genuine competitive advantage and often the difference between winning and losing a job. Even if the full quote will take longer, sending a brief acknowledgement quickly ('Received, I'll have a quote by 6 p.m.') keeps the conversation warm and stops the customer messaging your competitors while they wait." },
      { q: "What's the best way to get repeat 3D printing customers?", a: "Three things: keep the customer's file on record so reorders take minutes instead of starting from scratch, follow up briefly after delivery to confirm the part worked (this is rare and stands out), and remember what someone ordered previously so the next conversation starts warm. Small businesses that ordered once for a specific need often come back if the experience was good and reordering is low-friction." },
      { q: "Does joining a print network mean I stop selling on my own?", a: "No — at least not with any network worth joining. The Dimension3D network specifically is non-exclusive: makers continue with Wallapop, Etsy, direct clients or any other channel they already use. Network orders come in addition to what you already do, which is the point. If a network requires you to stop selling elsewhere in exchange for joining, that's worth thinking hard about before signing." }
    ],
    galleryImages: pick("ferrari-key-holder.jpg", "custom-brackets.jpg", "purple-figures.jpg", "green-chameleon.jpg", "halloween-set.jpg", "red-adapter.jpg"),
    related: [
      { label: "Income Channels That Actually Pay", slug: "/how-to-make-money-with-a-3d-printer" },
      { label: "Numbers Behind a Print Business", slug: "/is-3d-printing-business-profitable" },
      { label: "Join the Local Maker Network", slug: "/makers" },
      { label: "Network Workflow & Payment", slug: "/maker-guide" },
      { label: "Guía Clientes (ES)", slug: "/como-conseguir-clientes-impresion-3d" },
      { label: "Kunden finden (DE)", slug: "/kunden-fuer-3d-druck-finden" }
    ],
    schemaServiceName: "Getting 3D Printing Customers — Guide"
  }
];
