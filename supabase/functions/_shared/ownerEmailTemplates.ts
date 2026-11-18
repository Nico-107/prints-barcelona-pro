// Owner-facing email templates (item 1.3). All in Spanish — the owner reads
// Spanish regardless of the customer's language.
//
// Two variants:
//   • purchase: a paid instant order ([PEDIDO #264] 20,06 € · envío IT · …)
//   • quote:    a quote-request from the lead form ([REVISIÓN] 121,01 € · …)
//
// Both are composed on top of the shared layout so the pieces table never
// overflows and dark/light inboxes behave.

import {
  wrapEmail,
  renderPiecesTable,
  stackablePiecesTable,
  renderSummaryBlock,
  renderButton,
  escapeHtml,
  truncateMiddle,
  formatEUR,
  type EmailPiece,
} from "./emailLayout.ts";

export interface OwnerEmailPiece extends EmailPiece {
  infill?: number | null;
  wallLoops?: number | null;
  quality?: string | null;
  supports?: boolean | null;
  orientation?: string | number | null;
  grams?: number | null;
  hours?: number | null;
}

export interface OwnerUploadedNotPurchased {
  /** Clean display name (no timestamp prefix). */
  name: string;
  /** Signed URL (admin-only); falls back to '' to render as plain text. */
  signedUrl?: string | null;
}

export interface OwnerPurchaseInput {
  orderNumber: number;
  totalPaidCents: number;
  paymentMethod?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  fulfillment: "pickup" | "shipping";
  destinationCountry?: string | null;  // ISO2 like "IT"
  destinationCity?: string | null;
  shippingAddress?: Record<string, unknown> | null;
  shipByIso?: string | null;
  urgency?: "standard" | "express" | "urgent" | null;
  pieces: OwnerPurchaseEmailPiece[];
  uploadedNotPurchased?: OwnerUploadedNotPurchased[];
  adminOrderUrl: string;
  zipDownloadUrl?: string | null;
  sourcePath?: string | null;
  pageLanguage?: string | null;
  // A4: payment breakdown
  minAdjCents?: number | null;
  expressCents?: number | null;
  promoCode?: string | null;
  promoPct?: number | null;
  promoDiscountCents?: number | null;
}

export type OwnerPurchaseEmailPiece = OwnerEmailPiece;

export interface OwnerQuoteInput {
  firstNameOrLocal: string;         // Pietro | pietro.rossi
  customerMessage?: string | null;
  customerMessageTranslation?: string | null; // Spanish translation, line-by-line, if available
  customerEmail?: string | null;
  customerPhone?: string | null;
  totalCents?: number | null;        // from the calculator; optional
  countryCode?: string | null;       // ISO2
  materialSummary?: string | null;   // e.g. "TPU"
  totalUnits?: number | null;        // e.g. 20
  pieces: OwnerEmailPiece[];
  uploadedNotPurchased?: OwnerUploadedNotPurchased[];
  adminOrderUrl: string;
  zipDownloadUrl?: string | null;
  sourcePath?: string | null;
  pageLanguage?: string | null;
}

// ── Subject builders ──────────────────────────────────────────────────────────

export function purchaseSubject(input: OwnerPurchaseInput): string {
  const prefix = input.urgency === "urgent" ? "[URGENTE] " : input.urgency === "express" ? "[EXPRESS] " : "";
  const total = (input.totalPaidCents / 100).toLocaleString("es-ES", { minimumFractionDigits: 2 });
  const flag = input.fulfillment === "pickup" ? "🇪🇸" : flagEmoji(input.destinationCountry);
  const dest = input.fulfillment === "pickup"
    ? `${flag} Recogida`
    : `${flag} ${input.destinationCity || (input.destinationCountry ?? "").toUpperCase() || "envío"}`;
  const uniqueMats = Array.from(new Set(input.pieces.map((p) => p.material).filter(Boolean)));
  const matLabel = uniqueMats.length === 1 ? uniqueMats[0] : `MIX (${uniqueMats.join(",")})`;
  const firstName = input.customerName ? input.customerName.trim().split(/\s+/)[0] : null;
  const namePart = firstName ? ` · ${firstName}` : "";
  return `${prefix}Pedido #${input.orderNumber} · ${total} € · ${matLabel} · ${dest}${namePart}`;
}

export function quoteSubject(input: OwnerQuoteInput): string {
  const total = input.totalCents != null
    ? `${(input.totalCents / 100).toLocaleString("es-ES", { minimumFractionDigits: 2 })} €`
    : "sin precio";
  const material = input.materialSummary ?? "?";
  const country = (input.countryCode ?? "").toUpperCase() || "??";
  const units = input.totalUnits ?? input.pieces.reduce((s, p) => s + (p.quantity ?? 0), 0);
  return `[REVISIÓN] ${total} · ${units} uds ${material} · ${country} · ${escapeHtml(input.firstNameOrLocal)}`;
}

// ── Body helpers ──────────────────────────────────────────────────────────────

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

function flagEmoji(iso2: string | null | undefined): string {
  const c = (iso2 ?? "").trim().toUpperCase();
  if (c.length !== 2 || !/^[A-Z]{2}$/.test(c)) return "";
  const A = 0x1f1e6;
  return String.fromCodePoint(A + c.charCodeAt(0) - 65) + String.fromCodePoint(A + c.charCodeAt(1) - 65);
}

const SHIP_BY_DAYS_ES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const SHIP_BY_MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatShipByEs(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return `${SHIP_BY_DAYS_ES[d.getUTCDay()]} ${d.getUTCDate()} ${SHIP_BY_MONTHS_ES[d.getUTCMonth()]}`;
}

function renderUrgencyStrip(urgency: string | null | undefined, shipByIso: string | null | undefined): string {
  const level = urgency ?? "standard";
  const bg = level === "urgent" ? "#dc2626" : level === "express" ? "#d97706" : "#64748b";
  const label = level === "urgent" ? "URGENTE" : level === "express" ? "EXPRESS" : "Estándar";
  const shipLine = shipByIso ? ` &mdash; Sale antes del ${escapeHtml(formatShipByEs(shipByIso))}` : "";
  return `<div style="background:${bg};color:#fff;padding:12px 16px;text-align:center;font-weight:700;font-size:15px;border-radius:8px;margin:0 0 16px 0;">${label}${shipLine}</div>`;
}

function formatAddress(addr: Record<string, unknown> | null | undefined): string | null {
  if (!addr) return null;
  const parts = [
    addr["line1"], addr["line2"], addr["postal_code"], addr["city"], addr["state"], addr["country"],
  ].filter((v) => typeof v === "string" && (v as string).trim() !== "") as string[];
  return parts.join(", ");
}

function renderUploadedNotPurchased(items: OwnerUploadedNotPurchased[]): string {
  if (!items.length) return "";
  const rows = items
    .map((u) => {
      const name = escapeHtml(truncateMiddle(u.name));
      if (u.signedUrl) {
        return `<li style="margin:4px 0;"><a href="${escapeHtml(u.signedUrl)}" style="color:#0369a1;">${name}</a></li>`;
      }
      return `<li style="margin:4px 0;color:#334155;">${name}</li>`;
    })
    .join("");
  return `
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:12px 0;">
      <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;color:#92400e;">Subidos pero no comprados</p>
      <ul style="margin:0;padding-left:18px;font-size:13px;">${rows}</ul>
    </div>`;
}

function renderPiecesBlock(pieces: OwnerEmailPiece[]): string {
  const base = stackablePiecesTable(renderPiecesTable(pieces, { language: "es", showPrice: pieces.some((p) => p.priceCents != null) }));
  const details = pieces.some((p) => p.infill != null || p.wallLoops != null || p.quality || p.supports !== null || p.grams != null)
    ? `<details style="margin:4px 0 12px 0;">
         <summary style="cursor:pointer;color:#64748b;font-size:12px;">Ajustes por pieza</summary>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;border-collapse:collapse;font-size:12px;color:#334155;">
           <thead><tr>
             <th align="left" style="padding:6px;background:#f8fafc;">Pieza</th>
             <th align="right" style="padding:6px;background:#f8fafc;">Relleno %</th>
             <th align="right" style="padding:6px;background:#f8fafc;">Paredes</th>
             <th align="left"  style="padding:6px;background:#f8fafc;">Calidad</th>
             <th align="left"  style="padding:6px;background:#f8fafc;">Soportes</th>
             <th align="right" style="padding:6px;background:#f8fafc;">g/u</th>
             <th align="right" style="padding:6px;background:#f8fafc;">h</th>
           </tr></thead>
           <tbody>
             ${pieces.map((p) => `<tr>
               <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${escapeHtml(truncateMiddle(p.name))}</td>
               <td style="padding:6px;border-bottom:1px solid #e5e7eb;text-align:right;">${p.infill != null ? escapeHtml(p.infill) + "%" : "—"}</td>
               <td style="padding:6px;border-bottom:1px solid #e5e7eb;text-align:right;">${p.wallLoops != null ? escapeHtml(p.wallLoops) : "—"}</td>
               <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${p.quality ? escapeHtml(p.quality) : "—"}</td>
               <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${p.supports == null ? "—" : p.supports ? "sí" : "no"}</td>
               <td style="padding:6px;border-bottom:1px solid #e5e7eb;text-align:right;">${p.grams != null ? Number(p.grams).toFixed(1) : "—"}</td>
               <td style="padding:6px;border-bottom:1px solid #e5e7eb;text-align:right;">${p.hours != null ? Number(p.hours).toFixed(2) : "—"}</td>
             </tr>`).join("")}
           </tbody>
         </table>
       </details>`
    : "";
  return base + details;
}

function renderTwoButtons(adminUrl: string, zipUrl: string | null | undefined): string {
  const primary = renderButton(adminUrl, "Abrir en el panel");
  if (!zipUrl) return primary;
  const secondary = renderButton(zipUrl, "Descargar archivos (.zip)", { variant: "secondary" });
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
      <tr>
        <td style="padding-right:8px;">${primary}</td>
        <td>${secondary}</td>
      </tr>
    </table>`;
}

// ── Templates ─────────────────────────────────────────────────────────────────

export function renderOwnerPurchaseEmail(input: OwnerPurchaseInput): { subject: string; html: string } {
  const paid = (input.totalPaidCents / 100).toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " €";
  const country = (input.destinationCountry ?? "").toUpperCase();
  const deliveryLabel = input.fulfillment === "pickup"
    ? "Recogida en estudio"
    : [input.destinationCity, country].filter(Boolean).join(", ");
  const nextStep = input.fulfillment === "pickup"
    ? "Imprimir y avisar al cliente para recoger"
    : `Imprimir y enviar a ${deliveryLabel || "destino"}`;

  const addressLine = input.fulfillment === "shipping" ? formatAddress(input.shippingAddress) : null;
  const summary = renderSummaryBlock([
    { label: "Pagado",     value: `${paid}${input.paymentMethod ? ` · ${input.paymentMethod}` : ""}` },
    { label: "Cliente",    value: input.customerName || null },
    { label: "Email",      value: input.customerEmail || null },
    { label: "Teléfono",   value: input.customerPhone ? `${input.customerPhone}` : null },
    { label: "WhatsApp",   value: input.customerPhone ? whatsappLink(input.customerPhone) : null },
    { label: "Entrega",    value: deliveryLabel || null },
    { label: "Dirección",  value: addressLine },
    { label: "Ship-by",    value: input.shipByIso || null },
    { label: "Origen",     value: input.sourcePath ? `${input.sourcePath}${input.pageLanguage ? ` (${input.pageLanguage})` : ""}` : null },
  ]);

  const pieceCount = input.pieces.reduce((s, p) => s + (p.quantity ?? 0), 0);
  const bodyHtml = `
    ${renderUrgencyStrip(input.urgency, input.shipByIso)}
    <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#0f172a;">
      ${escapeHtml(nextStep)}
    </p>
    ${summary}
    <h2 style="margin:16px 0 4px 0;font-size:14px;color:#0f172a;">Piezas (${pieceCount})</h2>
    ${renderPiecesBlock(input.pieces)}
    ${renderUploadedNotPurchased(input.uploadedNotPurchased ?? [])}
    ${renderTwoButtons(input.adminOrderUrl, input.zipDownloadUrl)}
  `;

  const subject = purchaseSubject(input);
  const html = wrapEmail({
    preheader: `${paid} · ${pieceCount} piezas · ${deliveryLabel || "entrega"}`,
    title: `Pedido #${input.orderNumber}`,
    bodyHtml,
    language: "es",
  });
  return { subject, html };
}

export function renderOwnerQuoteEmail(input: OwnerQuoteInput): { subject: string; html: string } {
  const nextStep = "Responder con presupuesto";
  const summary = renderSummaryBlock([
    { label: "Cliente",    value: input.firstNameOrLocal },
    { label: "Email",      value: input.customerEmail || null },
    { label: "Teléfono",   value: input.customerPhone || null },
    { label: "WhatsApp",   value: input.customerPhone ? whatsappLink(input.customerPhone) : null },
    { label: "País",       value: (input.countryCode ?? "").toUpperCase() || null },
    { label: "Material",   value: input.materialSummary || null },
    { label: "Unidades",   value: input.totalUnits ?? null },
    { label: "Calculadora", value: input.totalCents != null ? formatEUR(input.totalCents) : null },
    { label: "Origen",     value: input.sourcePath ? `${input.sourcePath}${input.pageLanguage ? ` (${input.pageLanguage})` : ""}` : null },
  ]);

  const quote = input.customerMessage
    ? `
      <div style="border-left:3px solid #94a3b8;background:#f8fafc;padding:10px 12px;margin:12px 0;font-size:14px;color:#334155;white-space:pre-wrap;">${escapeHtml(input.customerMessage)}</div>
      ${input.customerMessageTranslation ? `<p style="margin:6px 0 12px 0;font-size:12px;color:#64748b;">Traducción al español (línea por línea):</p>
      <div style="border-left:3px solid #cbd5e1;background:#f8fafc;padding:10px 12px;margin:0 0 12px 0;font-size:13px;color:#475569;white-space:pre-wrap;">${escapeHtml(input.customerMessageTranslation)}</div>` : ""}
    ` : "";

  const pieceCount = input.pieces.reduce((s, p) => s + (p.quantity ?? 0), 0);
  const bodyHtml = `
    <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#0f172a;">${escapeHtml(nextStep)}</p>
    ${quote}
    ${summary}
    ${input.pieces.length > 0 ? `<h2 style="margin:16px 0 4px 0;font-size:14px;color:#0f172a;">Piezas (${pieceCount})</h2>${renderPiecesBlock(input.pieces)}` : ""}
    ${renderUploadedNotPurchased(input.uploadedNotPurchased ?? [])}
    ${renderTwoButtons(input.adminOrderUrl, input.zipDownloadUrl)}
  `;

  const subject = quoteSubject(input);
  const html = wrapEmail({
    preheader: `Nueva revisión de ${input.firstNameOrLocal}`,
    title: "Solicitud de revisión",
    bodyHtml,
    language: "es",
  });
  return { subject, html };
}
