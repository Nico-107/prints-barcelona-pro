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
  const countryIso = (input.countryCode ?? "").toUpperCase() || null;
  const flag = countryIso ? flagEmoji(countryIso) : "";
  const countryLabel = countryIso ? `${flag} ${countryIso}` : flag || "??";
  const units = input.totalUnits ?? input.pieces.reduce((s, p) => s + (p.quantity ?? 0), 0);
  return `[REVISIÓN] ${total} · ${units} uds ${material} · ${countryLabel} · ${escapeHtml(input.firstNameOrLocal)}`;
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

function formatHours(h: number): string {
  const totalMin = Math.round(h * 60);
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} h`;
  return `${hrs} h ${mins} min`;
}

function renderPiecesBlock(pieces: OwnerEmailPiece[]): string {
  const base = stackablePiecesTable(renderPiecesTable(pieces, { language: "es", showPrice: pieces.some((p) => p.priceCents != null) }));

  const hasDetails = pieces.some((p) => p.infill != null || p.wallLoops != null || p.quality || p.supports !== null || p.grams != null);
  const totalGrams = pieces.some((p) => p.grams != null)
    ? pieces.reduce((s, p) => s + (p.grams ?? 0) * (p.quantity ?? 1), 0)
    : null;
  const totalHours = pieces.some((p) => p.hours != null)
    ? pieces.reduce((s, p) => s + (p.hours ?? 0) * (p.quantity ?? 1), 0)
    : null;

  const totalLine = (totalGrams != null || totalHours != null)
    ? `<p style="margin:6px 0 0 0;font-size:12px;color:#64748b;">Total: ${totalGrams != null ? `${totalGrams.toFixed(0)} g` : ""}${totalGrams != null && totalHours != null ? " · " : ""}${totalHours != null ? `${formatHours(totalHours)} de impresión` : ""}</p>`
    : "";

  const details = hasDetails
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
               <td style="padding:6px;border-bottom:1px solid #e5e7eb;text-align:right;">${p.grams != null ? Number(p.grams * (p.quantity ?? 1)).toFixed(1) : "—"}</td>
               <td style="padding:6px;border-bottom:1px solid #e5e7eb;text-align:right;">${p.hours != null ? formatHours(Number(p.hours) * (p.quantity ?? 1)) : "—"}</td>
             </tr>`).join("")}
           </tbody>
         </table>
       </details>`
    : "";
  return base + totalLine + details;
}

/** Render "Qué ha pagado el cliente" table. All rows must sum to totalPaidCents.
 *  Any unexplained remainder shows as "Otros ajustes". */
export function renderPaymentBreakdown(input: {
  pieces: OwnerEmailPiece[];
  totalPaidCents: number;
  paymentMethod?: string | null;
  fulfillment?: "pickup" | "shipping";
  urgency?: string | null;
  minAdjCents?: number | null;
  expressCents?: number | null;
  promoCode?: string | null;
  promoPct?: number | null;
  promoDiscountCents?: number | null;
}): string {
  const r = (n: number) => escapeHtml(formatEUR(n));

  type Row = { label: string; value: number; negative?: boolean };
  const rows: Row[] = [];

  // Per-piece rows
  for (const p of input.pieces) {
    if (p.priceCents != null && p.priceCents > 0) {
      const col = p.color && p.color !== "Sin preferencia" ? ` · ${escapeHtml(p.color)}` : "";
      rows.push({ label: `${escapeHtml(truncateMiddle(p.name, 32))} × ${p.quantity} ${escapeHtml(p.material)}${col}`, value: p.priceCents });
    }
  }

  if ((input.minAdjCents ?? 0) > 0) {
    rows.push({ label: "Ajuste a pedido mínimo (9,90 €)", value: input.minAdjCents! });
  }

  if ((input.expressCents ?? 0) > 0) {
    const surchargeLabel = input.urgency === "urgent"
      ? "Recargo URGENTE (+60 %)"
      : "Recargo EXPRESS (+25 %)";
    rows.push({ label: surchargeLabel, value: input.expressCents! });
  }

  if ((input.promoDiscountCents ?? 0) > 0 && input.promoCode) {
    const pctLabel = input.promoPct ? ` (−${input.promoPct} %)` : "";
    rows.push({ label: `Código ${escapeHtml(input.promoCode)}${pctLabel}`, value: -(input.promoDiscountCents!), negative: true });
  }

  if (input.fulfillment === "pickup") {
    rows.push({ label: "Recogida en estudio", value: 0 });
  } else {
    const shippingCents = input.totalPaidCents - rows.reduce((s, row) => s + row.value, 0);
    if (shippingCents !== 0) {
      rows.push({ label: shippingCents > 0 ? "Envío" : "Ajuste de envío", value: shippingCents });
    }
  }

  // Verify sum; absorb any cent-rounding remainder
  const explained = rows.reduce((s, row) => s + row.value, 0);
  const remainder = input.totalPaidCents - explained;
  if (Math.abs(remainder) > 1) {
    rows.push({ label: "Otros ajustes", value: remainder });
  }

  const payLabel = input.paymentMethod ? ` · ${escapeHtml(input.paymentMethod)}` : "";
  const tableRows = rows.map((row) => {
    const neg = row.value < 0 || row.negative;
    const valStr = row.value === 0 ? "0,00 €" : r(Math.abs(row.value));
    return `<tr>
      <td style="padding:5px 8px 5px 0;font-size:13px;color:#334155;">${row.label}</td>
      <td style="padding:5px 0;font-size:13px;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;color:${neg ? "#dc2626" : "#0f172a"};">${neg ? "&minus;" : ""}${valStr}</td>
    </tr>`;
  }).join("");

  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin:0 0 16px 0;">
      <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Qué ha pagado el cliente</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tbody>${tableRows}</tbody>
        <tfoot>
          <tr style="border-top:2px solid #e2e8f0;">
            <td style="padding:8px 8px 4px 0;font-size:14px;font-weight:700;color:#0f172a;">TOTAL PAGADO${payLabel}</td>
            <td style="padding:8px 0 4px 0;font-size:14px;font-weight:700;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;color:#0f172a;">${r(input.totalPaidCents)}</td>
          </tr>
        </tfoot>
      </table>
    </div>`;
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
  const flag = input.fulfillment === "pickup" ? "🇪🇸" : flagEmoji(input.destinationCountry);
  const deliveryLabel = input.fulfillment === "pickup"
    ? "🇪🇸 Recogida en estudio"
    : [flag, input.destinationCity, country].filter(Boolean).join(" ");

  const nextStep = input.fulfillment === "pickup"
    ? "Imprimir y avisar al cliente para recoger"
    : `Imprimir y enviar a ${[input.destinationCity, country].filter(Boolean).join(", ") || "destino"}`;

  const pieceCount = input.pieces.reduce((s, p) => s + (p.quantity ?? 0), 0);

  // ── Customer block ───────────────────────────────────────────────────────────
  const waBtn = input.customerPhone
    ? `<a href="${escapeHtml(whatsappLink(input.customerPhone))}" style="display:inline-block;padding:8px 16px;background:#25d366;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;margin-right:8px;">WhatsApp</a>`
    : "";
  const mailBtn = input.customerEmail
    ? `<a href="mailto:${escapeHtml(input.customerEmail)}" style="display:inline-block;padding:8px 16px;background:#0369a1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">Email</a>`
    : "";
  const customerName = input.customerName || null;
  const customerBlock = `
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px 16px;margin:0 0 12px 0;">
      ${customerName ? `<p style="margin:0 0 6px 0;font-size:15px;font-weight:600;color:#0f172a;">${escapeHtml(customerName)}</p>` : ""}
      ${input.customerEmail ? `<p style="margin:0 0 4px 0;font-size:13px;color:#334155;">${escapeHtml(input.customerEmail)}</p>` : ""}
      ${input.customerPhone ? `<p style="margin:0 0 8px 0;font-size:13px;color:#334155;">${escapeHtml(input.customerPhone)}</p>` : ""}
      ${waBtn || mailBtn ? `<div style="margin-top:4px;">${waBtn}${mailBtn}</div>` : ""}
    </div>`;

  // ── Delivery block ───────────────────────────────────────────────────────────
  const addressLine = input.fulfillment === "shipping" ? formatAddress(input.shippingAddress) : null;
  const deliveryBlock = `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin:0 0 12px 0;">
      <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Entrega</p>
      <p style="margin:0;font-size:14px;color:#0f172a;font-weight:600;">${escapeHtml(deliveryLabel)}</p>
      ${addressLine ? `<p style="margin:4px 0 0 0;font-size:13px;color:#334155;">${escapeHtml(addressLine)}</p>` : ""}
    </div>`;

  // ── Origin block ─────────────────────────────────────────────────────────────
  const pageFlag = input.pageLanguage ? flagEmoji(input.pageLanguage.slice(0, 2).toUpperCase()) : "";
  const originLabel = input.sourcePath
    ? `${pageFlag ? pageFlag + " " : ""}${input.sourcePath}${input.pageLanguage ? ` (${input.pageLanguage})` : ""}`
    : null;
  const originBlock = originLabel
    ? `<p style="margin:12px 0 0 0;font-size:12px;color:#94a3b8;">Origen: ${escapeHtml(originLabel)}</p>`
    : "";

  const breakdown = renderPaymentBreakdown({
    pieces: input.pieces,
    totalPaidCents: input.totalPaidCents,
    paymentMethod: input.paymentMethod,
    fulfillment: input.fulfillment,
    urgency: input.urgency,
    minAdjCents: input.minAdjCents,
    expressCents: input.expressCents,
    promoCode: input.promoCode,
    promoPct: input.promoPct,
    promoDiscountCents: input.promoDiscountCents,
  });

  const bodyHtml = `
    ${renderUrgencyStrip(input.urgency, input.shipByIso)}
    ${breakdown}
    <p style="margin:0 0 12px 0;font-size:16px;font-weight:700;color:#0f172a;">${escapeHtml(nextStep)}</p>
    ${customerBlock}
    ${deliveryBlock}
    <h2 style="margin:12px 0 4px 0;font-size:14px;font-weight:700;color:#0f172a;">Piezas (${pieceCount})</h2>
    ${renderPiecesBlock(input.pieces)}
    ${renderUploadedNotPurchased(input.uploadedNotPurchased ?? [])}
    ${originBlock}
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
  const countryIso = (input.countryCode ?? "").toUpperCase() || null;

  // ── Customer block ───────────────────────────────────────────────────────────
  const waBtn = input.customerPhone
    ? `<a href="${escapeHtml(whatsappLink(input.customerPhone))}" style="display:inline-block;padding:8px 16px;background:#25d366;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;margin-right:8px;">WhatsApp</a>`
    : "";
  const mailBtn = input.customerEmail
    ? `<a href="mailto:${escapeHtml(input.customerEmail)}" style="display:inline-block;padding:8px 16px;background:#0369a1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">Email</a>`
    : "";
  const customerBlock = `
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px 16px;margin:0 0 12px 0;">
      <p style="margin:0 0 6px 0;font-size:15px;font-weight:600;color:#0f172a;">${escapeHtml(input.firstNameOrLocal)}</p>
      ${input.customerEmail ? `<p style="margin:0 0 4px 0;font-size:13px;color:#334155;">${escapeHtml(input.customerEmail)}</p>` : ""}
      ${input.customerPhone ? `<p style="margin:0 0 8px 0;font-size:13px;color:#334155;">${escapeHtml(input.customerPhone)}</p>` : ""}
      ${countryIso ? `<p style="margin:0 0 8px 0;font-size:13px;color:#334155;">${flagEmoji(countryIso)} ${escapeHtml(countryIso)}</p>` : ""}
      ${waBtn || mailBtn ? `<div style="margin-top:4px;">${waBtn}${mailBtn}</div>` : ""}
    </div>`;

  // ── Info block ───────────────────────────────────────────────────────────────
  const infoRows: Array<{ label: string; value: string | number | null | undefined }> = [
    { label: "Material",    value: input.materialSummary || null },
    { label: "Unidades",    value: input.totalUnits ?? null },
    { label: "Calculadora", value: input.totalCents != null ? formatEUR(input.totalCents) : null },
  ];
  const pageFlag = input.pageLanguage ? flagEmoji(input.pageLanguage.slice(0, 2).toUpperCase()) : "";
  const originLabel = input.sourcePath
    ? `${pageFlag ? pageFlag + " " : ""}${input.sourcePath}${input.pageLanguage ? ` (${input.pageLanguage})` : ""}`
    : null;

  const quote = input.customerMessage
    ? `
      <div style="border-left:3px solid #f59e0b;background:#fffbeb;padding:10px 12px;margin:12px 0;font-size:14px;color:#334155;white-space:pre-wrap;">${escapeHtml(input.customerMessage)}</div>
      ${input.customerMessageTranslation ? `<p style="margin:6px 0 4px 0;font-size:12px;color:#64748b;">Traducción al español:</p>
      <div style="border-left:3px solid #cbd5e1;background:#f8fafc;padding:10px 12px;margin:0 0 12px 0;font-size:13px;color:#475569;white-space:pre-wrap;">${escapeHtml(input.customerMessageTranslation)}</div>` : ""}
    ` : "";

  const pieceCount = input.pieces.reduce((s, p) => s + (p.quantity ?? 0), 0);
  const bodyHtml = `
    <p style="margin:0 0 12px 0;font-size:16px;font-weight:700;color:#0f172a;">Responder con presupuesto</p>
    ${customerBlock}
    ${quote}
    ${renderSummaryBlock(infoRows)}
    ${input.pieces.length > 0 ? `<h2 style="margin:12px 0 4px 0;font-size:14px;font-weight:700;color:#0f172a;">Piezas (${pieceCount})</h2>${renderPiecesBlock(input.pieces)}` : ""}
    ${renderUploadedNotPurchased(input.uploadedNotPurchased ?? [])}
    ${originLabel ? `<p style="margin:12px 0 0 0;font-size:12px;color:#94a3b8;">Origen: ${escapeHtml(originLabel)}</p>` : ""}
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
