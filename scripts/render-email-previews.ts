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
