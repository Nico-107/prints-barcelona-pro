// Owner-facing email for a new quote / print / design request from the website.

import { escapeHtml, renderButton, truncateMiddle, wrapEmail } from "./emailLayout.js";

export interface NotifyQuoteInput {
  kind: "quote" | "print" | "design";
  firstNameOrLocal: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  countryCode?: string | null;
  material?: string | null;
  totalUnits?: number | null;
  priceExact?: number | null; // euros
  pieces?: Array<{ name: string; quantity: number; material?: string | null; color?: string | null; infill?: number | null; wallLoops?: number | null }>;
  fileNames?: string[];
  description?: string | null;
  dimensions?: string | null;
  quantity?: string | null;
  sourcePath?: string | null;
  pageLanguage?: string | null;
  notes?: string | null;
  adminUrl: string;
  quoteId?: string | null;
}

function kindLabel(k: NotifyQuoteInput["kind"]): string {
  if (k === "design") return "[DISEÑO]";
  if (k === "print") return "[IMPRESIÓN]";
  return "[REVISIÓN]";
}

export function renderNotifyQuoteEmail(input: NotifyQuoteInput): { subject: string; html: string } {
  const material = input.material ?? "?";
  const units = input.totalUnits ?? (input.pieces?.reduce((s, p) => s + (p.quantity || 0), 0) ?? 0);
  const priceLabel = input.priceExact != null ? `${input.priceExact.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €` : "sin precio";
  const country = (input.countryCode ?? "").toUpperCase() || "??";
  const subject = `${kindLabel(input.kind)} ${priceLabel} · ${units} uds ${material} · ${country} · ${input.firstNameOrLocal}`;

  const waBtn = input.customerPhone
    ? `<a href="https://wa.me/${escapeHtml(input.customerPhone.replace(/\D/g, ""))}" style="display:inline-block;padding:8px 16px;background:#25d366;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;margin-right:8px;">WhatsApp</a>`
    : "";
  const mailBtn = input.customerEmail
    ? `<a href="mailto:${escapeHtml(input.customerEmail)}" style="display:inline-block;padding:8px 16px;background:#0369a1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">Email</a>`
    : "";

  const customerBlock = `
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px 16px;margin:0 0 12px 0;">
      <p style="margin:0 0 6px 0;font-size:15px;font-weight:600;color:#0f172a;">${escapeHtml(input.firstNameOrLocal)}</p>
      ${input.customerEmail ? `<p style="margin:0 0 4px 0;font-size:13px;color:#334155;">${escapeHtml(input.customerEmail)}</p>` : ""}
      ${input.customerPhone ? `<p style="margin:0 0 8px 0;font-size:13px;color:#334155;">${escapeHtml(input.customerPhone)}</p>` : ""}
      ${country ? `<p style="margin:0 0 8px 0;font-size:13px;color:#334155;">${escapeHtml(country)}</p>` : ""}
      ${waBtn || mailBtn ? `<div style="margin-top:4px;">${waBtn}${mailBtn}</div>` : ""}
    </div>`;

  const detailRows: Array<{ label: string; value: string | null }> = [
    { label: "Material", value: input.material || null },
    { label: "Unidades", value: units ? String(units) : null },
    { label: "Precio calculadora", value: input.priceExact != null ? priceLabel : null },
    { label: "Dimensiones", value: input.dimensions || null },
    { label: "Cantidad (texto)", value: input.quantity || null },
  ];
  const summary = detailRows
    .filter((r) => r.value)
    .map((r) => `<tr><td style="padding:4px 12px 4px 0;font-size:13px;color:#64748b;white-space:nowrap;">${escapeHtml(r.label)}</td><td style="padding:4px 0;font-size:14px;color:#0f172a;">${escapeHtml(r.value as string)}</td></tr>`)
    .join("");
  const summaryBlock = summary ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:12px 0;"><tbody>${summary}</tbody></table>` : "";

  const notesBlock = input.notes
    ? `<div style="border-left:3px solid #f59e0b;background:#fffbeb;padding:10px 12px;margin:12px 0;font-size:14px;color:#334155;white-space:pre-wrap;">${escapeHtml(input.notes)}</div>`
    : "";
  const descBlock = input.description
    ? `<div style="border-left:3px solid #10b981;background:#ecfdf5;padding:10px 12px;margin:12px 0;font-size:14px;color:#334155;white-space:pre-wrap;">${escapeHtml(input.description)}</div>`
    : "";

  const pieces = input.pieces ?? [];
  const piecesRows = pieces.map((p) => `<tr>
    <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#0f172a;word-break:break-word;">${escapeHtml(truncateMiddle(p.name, 48))}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;white-space:nowrap;">${p.quantity}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#334155;white-space:nowrap;">${escapeHtml(p.material ?? "")}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#334155;white-space:nowrap;">${escapeHtml(p.color ?? "")}</td>
  </tr>`).join("");
  const piecesTable = pieces.length ? `
    <h2 style="margin:12px 0 4px 0;font-size:14px;font-weight:700;color:#0f172a;">Piezas (${pieces.reduce((s, p) => s + p.quantity, 0)})</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 12px 0;">
      <thead><tr style="background:#f8fafc;">
        <th align="left"  style="padding:8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:600;">Pieza</th>
        <th align="right" style="padding:8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:600;">Uds.</th>
        <th align="left"  style="padding:8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:600;">Material</th>
        <th align="left"  style="padding:8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:600;">Color</th>
      </tr></thead>
      <tbody>${piecesRows}</tbody>
    </table>` : "";

  const files = input.fileNames ?? [];
  const filesBlock = files.length ? `
    <div style="background:#ecfdf5;padding:12px 16px;border-radius:8px;margin:12px 0;">
      <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;color:#065f46;">Archivos (${files.length})</p>
      <ul style="margin:0;padding-left:18px;font-size:13px;">${files.map((f) => `<li style="margin:4px 0;">${escapeHtml(f)}</li>`).join("")}</ul>
    </div>` : "";

  const originBlock = input.sourcePath
    ? `<p style="margin:12px 0 0 0;font-size:12px;color:#94a3b8;">Origen: ${escapeHtml(input.sourcePath + (input.pageLanguage ? ` (${input.pageLanguage})` : ""))}</p>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 12px 0;font-size:16px;font-weight:700;color:#0f172a;">${input.kind === "design" ? "Nueva solicitud de diseño" : "Responder con presupuesto"}</p>
    ${customerBlock}
    ${notesBlock}
    ${descBlock}
    ${summaryBlock}
    ${piecesTable}
    ${filesBlock}
    ${originBlock}
    ${renderButton(input.adminUrl, "Abrir en el panel")}
  `;

  const html = wrapEmail({
    preheader: `Nueva solicitud de ${input.firstNameOrLocal}`,
    title: input.kind === "design" ? "Solicitud de diseño" : "Nueva solicitud",
    bodyHtml,
    language: "es",
  });
  return { subject, html };
}
