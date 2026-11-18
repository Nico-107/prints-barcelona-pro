// Render every email template with fixture data into docs/email-previews/.
// Item 1.2 lands this script alongside the shared layout. Later items
// (1.3 owner emails, 1.4 customer emails) drop their templates into
// supabase/functions/_shared/emailTemplates/ and they show up here.
//
// Run: `node scripts/render-email-previews.mjs` (the .mjs is just a tsx
// wrapper so the TypeScript keeps running in both Deno and Node).

import { mkdirSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  wrapEmail,
  renderPiecesTable,
  stackablePiecesTable,
  renderSummaryBlock,
  renderButton,
  type EmailLanguage,
  type EmailPiece,
} from "../supabase/functions/_shared/emailLayout.ts";

import {
  renderOwnerPurchaseEmail,
  renderOwnerQuoteEmail,
  type OwnerPurchaseEmailPiece,
} from "../supabase/functions/_shared/ownerEmailTemplates.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const outDir = join(repoRoot, "docs", "email-previews");
mkdirSync(outDir, { recursive: true });

const LANGS: EmailLanguage[] = ["es", "ca", "en", "de", "fr", "nl", "it", "pt"];

const FIXTURE_PIECES: EmailPiece[] = [
  { name: "sensor_cover_FACE_DOWN.stl", quantity: 1, material: "PETG", color: "Black", priceCents: 420 },
  { name: "bracket_left_v2.stl",         quantity: 2, material: "PETG", color: "Black", priceCents: 740 },
  { name: "bracket_right_v2_with_a_rather_long_variant_tag.stl", quantity: 2, material: "PETG", color: "Black", priceCents: 740 },
  { name: "cap_top.stl",                 quantity: 1, material: "PETG", color: "Black", priceCents: 220 },
  { name: "cap_bottom.stl",              quantity: 1, material: "PETG", color: "Black", priceCents: 220 },
];

export interface EmailFixture {
  pieces: EmailPiece[];
  order: {
    orderNumber: number;
    totalPaidCents: number;
    firstName: string;
    city: string;
    country: string;
    carrier: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    trackingToken: string;
    fulfillment: "pickup" | "shipping";
    shipByIso: string;
    etaIso: string;
  };
  language: EmailLanguage;
}

const FIXTURE_ORDER: EmailFixture["order"] = {
  orderNumber: 264,
  totalPaidCents: 2006,
  firstName: "Pietro",
  city: "Fiumicino",
  country: "IT",
  carrier: "SEUR",
  trackingNumber: "RX123456789IT",
  trackingUrl: "https://www.seur.com/livetracking?tracking=RX123456789IT",
  trackingToken: "demo-token-abcdef1234567890",
  fulfillment: "shipping",
  shipByIso: "2026-11-17",
  etaIso: "2026-11-20",
};

function makeFixture(language: EmailLanguage): EmailFixture {
  return { pieces: FIXTURE_PIECES, order: FIXTURE_ORDER, language };
}

const probes: Array<{ slug: string; html: string }> = [];

function shellProbe(language: EmailLanguage) {
  const pieces = stackablePiecesTable(renderPiecesTable(FIXTURE_PIECES, { language, showPrice: true }));
  const summary = renderSummaryBlock([
    { label: "Pedido", value: `#${FIXTURE_ORDER.orderNumber}` },
    { label: "Total", value: (FIXTURE_ORDER.totalPaidCents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" }) },
    { label: "Envío", value: `${FIXTURE_ORDER.city}, ${FIXTURE_ORDER.country}` },
  ]);
  const button = renderButton(
    `https://dimension3dprints.com/pedido/${FIXTURE_ORDER.trackingToken}`,
    { es: "Ver mi pedido", en: "View my order", ca: "Veure la meva comanda", de: "Bestellung ansehen", fr: "Voir ma commande", nl: "Bekijk mijn bestelling", it: "Vedi il mio ordine", pt: "Ver o meu pedido" }[language]
  );
  const body = `
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.5;color:#334155;">
      Hola ${FIXTURE_ORDER.firstName}, aquí tienes el estado de tu pedido.
    </p>
    ${summary}
    ${pieces}
    ${button}
  `;
  const html = wrapEmail({
    preheader: `Tu pedido #${FIXTURE_ORDER.orderNumber} está confirmado — Dimension3D`,
    title: `Pedido #${FIXTURE_ORDER.orderNumber}`,
    bodyHtml: body,
    language,
  });
  return { slug: `shell-${language}`, html };
}

for (const lang of LANGS) probes.push(shellProbe(lang));

// ── Owner email fixtures (A8) ─────────────────────────────────────────────────

const OWNER_PIECES: OwnerPurchaseEmailPiece[] = [
  { name: "sensor_cover.stl", quantity: 2, material: "TPU", color: null, priceCents: 2250, grams: 18, hours: 1.1, infill: 15, wallLoops: 2, quality: "standard", supports: false },
];
const ADMIN_URL = "https://www.dimension3dprints.com/admin?order=demo";

// A8-1: standard purchase, pickup
probes.push({
  slug: "owner-purchase-standard-pickup",
  html: renderOwnerPurchaseEmail({
    orderNumber: 268,
    totalPaidCents: 2025,
    paymentMethod: "stripe",
    customerName: "David García",
    customerEmail: "david@example.com",
    customerPhone: "+34612345678",
    fulfillment: "pickup",
    urgency: "standard",
    shipByIso: "2026-11-25",
    pieces: OWNER_PIECES,
    adminOrderUrl: ADMIN_URL,
    zipDownloadUrl: "https://example.com/zip?order_number=268&exp=9999999999&sig=abc123",
    sourcePath: "/es/impresion-3d-barcelona",
    pageLanguage: "es",
    promoCode: "DIMENSION11",
    promoPct: 10,
    promoDiscountCents: 225,
  }).html,
});

// A8-2: express purchase, shipping to Italy
probes.push({
  slug: "owner-purchase-express-shipping-it",
  html: renderOwnerPurchaseEmail({
    orderNumber: 271,
    totalPaidCents: 3615,
    paymentMethod: "stripe",
    customerName: "Pietro Rossi",
    customerEmail: "pietro@example.it",
    customerPhone: "+393451234567",
    fulfillment: "shipping",
    destinationCountry: "IT",
    destinationCity: "Fiumicino",
    shippingAddress: { address: { line1: "Via Roma 1", city: "Fiumicino", postal_code: "00054", country: "IT" }, name: "Pietro Rossi" },
    urgency: "express",
    shipByIso: "2026-11-21",
    pieces: [{ name: "bracket.stl", quantity: 3, material: "PLA", color: "White", priceCents: 980, grams: 24, hours: 1.5, infill: 20, wallLoops: 3, quality: "standard", supports: false }],
    adminOrderUrl: ADMIN_URL,
    zipDownloadUrl: "https://example.com/zip?order_number=271&exp=9999999999&sig=abc",
    sourcePath: "/it/stampa-3d-online",
    pageLanguage: "it",
    expressCents: 745,
  }).html,
});

// A8-3: urgent purchase with code + min adj
probes.push({
  slug: "owner-purchase-urgent-code-minadj",
  html: renderOwnerPurchaseEmail({
    orderNumber: 273,
    totalPaidCents: 1600,
    paymentMethod: "stripe",
    customerName: "Ana López",
    customerEmail: "ana@example.com",
    customerPhone: "+34698765432",
    fulfillment: "pickup",
    urgency: "urgent",
    shipByIso: "2026-11-19",
    pieces: [{ name: "small_part.stl", quantity: 1, material: "PETG", color: null, priceCents: 968, grams: 9, hours: 0.7, infill: 15, wallLoops: 2, quality: "fast", supports: false }],
    adminOrderUrl: ADMIN_URL,
    zipDownloadUrl: "https://example.com/zip?order_number=273&exp=9999999999&sig=abc",
    sourcePath: "/ca/prototips-3d-barcelona",
    pageLanguage: "ca",
    minAdjCents: 32,
    expressCents: 600,
  }).html,
});

// A8-4: review/quote request
probes.push({
  slug: "owner-quote-review",
  html: renderOwnerQuoteEmail({
    firstNameOrLocal: "müller_designs",
    customerMessage: "Ich brauche 50 Stück für ein Industrieprojekt — wann könnte das fertig sein?",
    customerMessageTranslation: "Necesito 50 piezas para un proyecto industrial — ¿cuándo podría estar listo?",
    customerEmail: "k.mueller@example.de",
    customerPhone: "+4917612345678",
    totalCents: 24500,
    countryCode: "DE",
    materialSummary: "PETG",
    totalUnits: 50,
    pieces: [
      { name: "housing_v3.stl", quantity: 50, material: "PETG", color: "Black", grams: 45, infill: 20, wallLoops: 3, quality: "standard", supports: false },
    ],
    adminOrderUrl: "https://www.dimension3dprints.com/admin?quote=demo",
    zipDownloadUrl: "https://example.com/zip?quote=demo",
    sourcePath: "/de/3d-druck-barcelona",
    pageLanguage: "de",
  }).html,
});

// A8-5: design request (plain HTML from send-quote-request branch — reuse quote template for now)
probes.push({
  slug: "owner-design-request",
  html: renderOwnerQuoteEmail({
    firstNameOrLocal: "fabrizio_arch",
    customerMessage: "Ho bisogno di un modello 3D di un vaso con texture esagonale, circa 20 cm di altezza.",
    customerMessageTranslation: "Necesito un modelo 3D de un jarrón con textura hexagonal, unos 20 cm de altura.",
    customerEmail: "fabrizio@example.it",
    countryCode: "IT",
    pieces: [],
    adminOrderUrl: "https://www.dimension3dprints.com/admin",
    sourcePath: "/it/stampa-3d-online",
    pageLanguage: "it",
  }).html,
});

// Auto-discover template modules (populated by items 1.3 and 1.4).
const templatesDir = join(repoRoot, "supabase", "functions", "_shared", "emailTemplates");
if (existsSync(templatesDir)) {
  const files = readdirSync(templatesDir).filter((f) => f.endsWith(".ts"));
  for (const file of files) {
    const abs = join(templatesDir, file);
    try {
      const mod: Record<string, unknown> = await import(pathToFileURL(abs).href);
      const render = mod.render as undefined | ((f: EmailFixture) => string);
      if (!render) continue;
      const slug = file.replace(/\.ts$/, "");
      for (const lang of LANGS) {
        try {
          const html = render(makeFixture(lang));
          probes.push({ slug: `${slug}-${lang}`, html });
        } catch (err) {
          console.warn(`[skip] ${slug} (${lang}): ${(err instanceof Error ? err.message : String(err))}`);
        }
      }
    } catch (err) {
      console.warn(`[skip ${file}] ${(err instanceof Error ? err.message : String(err))}`);
    }
  }
}

for (const { slug, html } of probes) {
  writeFileSync(join(outDir, `${slug}.html`), html, "utf8");
}

console.log(`✓ rendered ${probes.length} email previews to docs/email-previews/`);
