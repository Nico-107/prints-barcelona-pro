// Owner-facing email for a paid Stripe checkout session. Built from the
// expanded session object (with line_items, customer_details, shipping_details,
// metadata). All Spanish — the owner reads Spanish.

import { escapeHtml, formatEUR, renderButton, truncateMiddle, wrapEmail } from "./emailLayout.js";

export interface StripeLineItemLite {
  description?: string | null;
  quantity?: number | null;
  amount_total?: number | null; // cents
  price?: {
    product?: {
      name?: string | null;
      metadata?: Record<string, string> | null;
    } | string | null;
    unit_amount?: number | null;
  } | null;
}

export interface OwnerPurchaseInput {
  sessionId: string;
  orderId?: string | null;
  orderNumber?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  fulfillment: "pickup" | "shipping" | string | null;
  shippingAddress?: Record<string, unknown> | null;
  shippingCity?: string | null;
  shippingCountry?: string | null;
  deliverySpeed?: string | null; // standard | express | urgent
  materials?: string | null;
  totalPaidCents: number;
  shippingCents?: number | null;
  currency: string;
  lineItems: Array<{
    name: string;
    quantity: number;
    amountCents: number;
    material?: string | null;
  }>;
  filePaths?: string[];
  fileNames?: string[];
  adminUrl: string;
  paymentUrl?: string | null;
  sourcePath?: string | null;
  pageLanguage?: string | null;
  metadata?: Record<string, string> | null;
}

function formatAddress(addr: Record<string, unknown> | null | undefined): string | null {
  if (!addr) return null;
  const parts = [
    addr["name"],
    addr["line1"],
    addr["line2"],
    addr["postal_code"],
    addr["city"],
    addr["state"],
    addr["country"],
  ].filter((v) => typeof v === "string" && (v as string).trim() !== "") as string[];
  return parts.join(", ");
}

function urgencyLabel(u: string | null | undefined): string {
  if (u === "urgent") return "URGENTE";
  if (u === "express") return "EXPRESS";
  return "Estándar";
}

function urgencyColor(u: string | null | undefined): string {
  if (u === "urgent") return "#dc2626";
  if (u === "express") return "#d97706";
  return "#64748b";
}

export function renderOwnerPurchaseEmail(input: OwnerPurchaseInput): { subject: string; html: string } {
  const paid = formatEUR(input.totalPaidCents) || `${(input.totalPaidCents / 100).toFixed(2)} €`;
  const pieceCount = input.lineItems.reduce((s, li) => s + (li.quantity || 0), 0);

  const flag = input.fulfillment === "pickup" ? "🇪🇸" : "🚚";
  const destCountry = (input.shippingCountry ?? "").toUpperCase();
  const dest = input.fulfillment === "pickup"
    ? `${flag} Recogida en estudio`
    : `${flag} ${[input.shippingCity, destCountry].filter(Boolean).join(", ") || "envío"}`;

  const subject = `Pedido ${input.orderNumber ? "#" + input.orderNumber : input.sessionId.slice(-8)} · ${paid} · ${dest}${input.customerName ? " · " + input.customerName.split(/\s+/)[0] : ""}`;

  const waBtn = input.customerPhone
    ? `<a href="https://wa.me/${escapeHtml(input.customerPhone.replace(/\D/g, ""))}" style="display:inline-block;padding:8px 16px;background:#25d366;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;margin-right:8px;">WhatsApp</a>`
    : "";
  const mailBtn = input.customerEmail
    ? `<a href="mailto:${escapeHtml(input.customerEmail)}" style="display:inline-block;padding:8px 16px;background:#0369a1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">Email</a>`
    : "";

  const customerBlock = `
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px 16px;margin:0 0 12px 0;">
      ${input.customerName ? `<p style="margin:0 0 6px 0;font-size:15px;font-weight:600;color:#0f172a;">${escapeHtml(input.customerName)}</p>` : ""}
      ${input.customerEmail ? `<p style="margin:0 0 4px 0;font-size:13px;color:#334155;">${escapeHtml(input.customerEmail)}</p>` : ""}
      ${input.customerPhone ? `<p style="margin:0 0 8px 0;font-size:13px;color:#334155;">${escapeHtml(input.customerPhone)}</p>` : ""}
      ${waBtn || mailBtn ? `<div style="margin-top:4px;">${waBtn}${mailBtn}</div>` : ""}
    </div>`;

  const addressLine = input.fulfillment === "shipping" ? formatAddress(input.shippingAddress) : null;
  const deliveryBlock = `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin:0 0 12px 0;">
      <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Entrega</p>
      <p style="margin:0;font-size:14px;color:#0f172a;font-weight:600;">${escapeHtml(dest)}</p>
      ${addressLine ? `<p style="margin:4px 0 0 0;font-size:13px;color:#334155;">${escapeHtml(addressLine)}</p>` : ""}
      ${input.deliverySpeed ? `<p style="margin:4px 0 0 0;font-size:13px;color:#334155;">Velocidad: ${escapeHtml(urgencyLabel(input.deliverySpeed))}</p>` : ""}
    </div>`;

  const itemsRows = input.lineItems.map((li) => {
    const price = formatEUR(li.amountCents);
    const mat = li.material ? ` · ${escapeHtml(li.material)}` : "";
    return `<tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#0f172a;word-break:break-word;">${escapeHtml(truncateMiddle(li.name, 48))}${mat}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#334155;text-align:right;white-space:nowrap;">${li.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#0f172a;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">${escapeHtml(price)}</td>
    </tr>`;
  }).join("");

  const itemsTable = input.lineItems.length ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 12px 0;">
      <thead><tr style="background:#f8fafc;">
        <th align="left"  style="padding:8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:600;">Pieza</th>
        <th align="right" style="padding:8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:600;">Uds.</th>
        <th align="right" style="padding:8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:600;">Precio</th>
      </tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>` : "";

  const shippingRow = (input.shippingCents != null && input.shippingCents > 0)
    ? `<tr><td style="padding:5px 8px 5px 0;font-size:13px;color:#334155;">Envío</td><td style="padding:5px 0;font-size:13px;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">${escapeHtml(formatEUR(input.shippingCents))}</td></tr>`
    : input.fulfillment === "pickup"
    ? `<tr><td style="padding:5px 8px 5px 0;font-size:13px;color:#334155;">Recogida en estudio</td><td style="padding:5px 0;font-size:13px;text-align:right;white-space:nowrap;">0,00 €</td></tr>`
    : "";

  const totalsTable = `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin:0 0 16px 0;">
      <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Qué ha pagado el cliente</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tbody>${shippingRow}</tbody>
        <tfoot>
          <tr style="border-top:2px solid #e2e8f0;">
            <td style="padding:8px 8px 4px 0;font-size:14px;font-weight:700;color:#0f172a;">TOTAL PAGADO · Stripe</td>
            <td style="padding:8px 0 4px 0;font-size:14px;font-weight:700;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;color:#0f172a;">${escapeHtml(paid)}</td>
          </tr>
        </tfoot>
      </table>
    </div>`;

  const paths = input.filePaths ?? [];
  const names = input.fileNames ?? [];
  const filesList = paths.length ? `
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:12px 0;">
      <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;color:#92400e;">Archivos (${paths.length})</p>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#334155;">
        ${paths.map((_, i) => `<li style="margin:4px 0;">${escapeHtml(names[i] ?? paths[i])}</li>`).join("")}
      </ul>
      <p style="margin:6px 0 0 0;font-size:12px;color:#92400e;">Los enlaces firmados están en el panel de admin.</p>
    </div>` : "";

  const urgencyStrip = `<div style="background:${urgencyColor(input.deliverySpeed)};color:#fff;padding:12px 16px;text-align:center;font-weight:700;font-size:15px;border-radius:8px;margin:0 0 16px 0;">${urgencyLabel(input.deliverySpeed)}</div>`;

  const originLabel = input.sourcePath
    ? `${input.sourcePath}${input.pageLanguage ? ` (${input.pageLanguage})` : ""}`
    : null;
  const originBlock = originLabel
    ? `<p style="margin:12px 0 0 0;font-size:12px;color:#94a3b8;">Origen: ${escapeHtml(originLabel)}</p>`
    : "";

  const buttons = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
      <tr>
        <td style="padding-right:8px;">${renderButton(input.adminUrl, "Abrir en el panel")}</td>
        ${input.paymentUrl ? `<td>${renderButton(input.paymentUrl, "Ver pago en Stripe", { variant: "secondary" })}</td>` : ""}
      </tr>
    </table>`;

  const bodyHtml = `
    ${urgencyStrip}
    ${totalsTable}
    <p style="margin:0 0 12px 0;font-size:16px;font-weight:700;color:#0f172a;">${input.fulfillment === "pickup" ? "Imprimir y avisar al cliente para recoger" : `Imprimir y enviar a ${[input.shippingCity, destCountry].filter(Boolean).join(", ") || "destino"}`}</p>
    ${customerBlock}
    ${deliveryBlock}
    ${input.lineItems.length ? `<h2 style="margin:12px 0 4px 0;font-size:14px;font-weight:700;color:#0f172a;">Piezas (${pieceCount})</h2>${itemsTable}` : ""}
    ${filesList}
    ${originBlock}
    ${buttons}
  `;

  const html = wrapEmail({
    preheader: `${paid} · ${pieceCount} piezas · ${dest}`,
    title: `Pedido ${input.orderNumber ? "#" + input.orderNumber : input.sessionId.slice(-8)}`,
    bodyHtml,
    language: "es",
  });

  return { subject, html };
}
