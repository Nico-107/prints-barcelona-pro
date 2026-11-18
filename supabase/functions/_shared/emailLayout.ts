// Shared email layout for Dimension3D edge functions (item 1.2).
//
// One module every email imports. Styles are inlined and kept simple so the
// result survives Gmail, Apple Mail and Outlook in both light and dark modes,
// and reflows cleanly at 360 px. No external CSS, no web fonts, no custom
// media queries beyond a single stacked-pieces breakpoint.
//
// The module is plain TypeScript with no runtime dependencies on Deno or
// Node, so the preview renderer (scripts/render-email-previews.mjs) can
// import it the same way the edge functions do.

export type EmailLanguage = "es" | "ca" | "en" | "de" | "fr" | "nl" | "it" | "pt";

export interface EmailPiece {
  name: string;
  quantity: number;
  material: string;
  color?: string | null;
  priceCents?: number | null;
}

export interface EmailLayoutOpts {
  /** Hidden preview text (appears beside the subject in inbox previews). */
  preheader: string;
  /** Controls the H1 at the top of the body. The subject is set outside. */
  title: string;
  /** Freeform HTML inside the main body container. */
  bodyHtml: string;
  /** Optional language, only used for the footer line. Defaults to es. */
  language?: EmailLanguage;
}

const SAFE_ESCAPE = /[&<>"']/g;
const SAFE_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(SAFE_ESCAPE, (c) => SAFE_ESCAPE_MAP[c]);
}

/** Truncate in the middle so file extensions remain visible. */
export function truncateMiddle(name: string, max = 42): string {
  if (name.length <= max) return name;
  const keep = max - 1; // minus the ellipsis
  const start = Math.ceil(keep * 0.6);
  const end = keep - start;
  return `${name.slice(0, start)}…${name.slice(name.length - end)}`;
}

export function formatEUR(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return "";
  return (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

const FOOTER_TAGLINE: Record<EmailLanguage, string> = {
  es: "Dimension3D · Impresión 3D en Barcelona · dimension3dprints.com",
  ca: "Dimension3D · Impressió 3D a Barcelona · dimension3dprints.com",
  en: "Dimension3D · 3D printing in Barcelona · dimension3dprints.com",
  de: "Dimension3D · 3D-Druck in Barcelona · dimension3dprints.com",
  fr: "Dimension3D · Impression 3D à Barcelone · dimension3dprints.com",
  nl: "Dimension3D · 3D-printen in Barcelona · dimension3dprints.com",
  it: "Dimension3D · Stampa 3D a Barcellona · dimension3dprints.com",
  pt: "Dimension3D · Impressão 3D em Barcelona · dimension3dprints.com",
};

const TABLE_HEADERS: Record<EmailLanguage, { piece: string; qty: string; material: string; color: string; price: string }> = {
  es: { piece: "Pieza",   qty: "Uds.", material: "Material", color: "Color",  price: "Precio" },
  ca: { piece: "Peça",    qty: "Uts.", material: "Material", color: "Color",  price: "Preu" },
  en: { piece: "Piece",   qty: "Qty",  material: "Material", color: "Colour", price: "Price" },
  de: { piece: "Teil",    qty: "Stk.", material: "Material", color: "Farbe",  price: "Preis" },
  fr: { piece: "Pièce",   qty: "Qté",  material: "Matériau", color: "Couleur", price: "Prix" },
  nl: { piece: "Onderdeel", qty: "Aantal", material: "Materiaal", color: "Kleur", price: "Prijs" },
  it: { piece: "Pezzo",   qty: "Q.tà", material: "Materiale", color: "Colore", price: "Prezzo" },
  pt: { piece: "Peça",    qty: "Qtd.", material: "Material", color: "Cor",    price: "Preço" },
};

export function renderPiecesTable(
  pieces: EmailPiece[],
  opts: { language?: EmailLanguage; showPrice?: boolean } = {}
): string {
  const lang = opts.language ?? "es";
  const h = TABLE_HEADERS[lang] ?? TABLE_HEADERS.es;
  const showPrice = !!opts.showPrice && pieces.some((p) => p.priceCents != null);

  const rows = pieces
    .map((p) => {
      const name = escapeHtml(truncateMiddle(p.name));
      const nameFull = escapeHtml(p.name);
      const qty = escapeHtml(p.quantity);
      const mat = escapeHtml(p.material);
      const col = escapeHtml(p.color ?? "Sin preferencia");
      const price = showPrice ? escapeHtml(formatEUR(p.priceCents ?? 0)) : "";

      // Each row stacks at 360px via display: block on the hidden "stacked"
      // children. The default table row shows normally on wider viewports.
      return `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 8px;font-size:14px;color:#0f172a;word-break:break-word;" title="${nameFull}">${name}</td>
          <td style="padding:10px 8px;font-size:14px;color:#334155;white-space:nowrap;text-align:right;font-variant-numeric:tabular-nums;">${qty}</td>
          <td style="padding:10px 8px;font-size:14px;color:#334155;white-space:nowrap;">${mat}</td>
          <td style="padding:10px 8px;font-size:14px;color:#334155;white-space:nowrap;">${col}</td>
          ${showPrice ? `<td style="padding:10px 8px;font-size:14px;color:#0f172a;white-space:nowrap;text-align:right;font-variant-numeric:tabular-nums;">${price}</td>` : ""}
        </tr>`;
    })
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;width:100%;margin:12px 0;">
      <thead>
        <tr style="background:#f8fafc;">
          <th align="left"  style="padding:8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:600;">${escapeHtml(h.piece)}</th>
          <th align="right" style="padding:8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:600;white-space:nowrap;">${escapeHtml(h.qty)}</th>
          <th align="left"  style="padding:8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:600;white-space:nowrap;">${escapeHtml(h.material)}</th>
          <th align="left"  style="padding:8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:600;white-space:nowrap;">${escapeHtml(h.color)}</th>
          ${showPrice ? `<th align="right" style="padding:8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:600;white-space:nowrap;">${escapeHtml(h.price)}</th>` : ""}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export function renderButton(url: string, label: string, opts: { variant?: "primary" | "secondary" } = {}): string {
  const bg = opts.variant === "secondary" ? "#f1f5f9" : "#0f172a";
  const fg = opts.variant === "secondary" ? "#0f172a" : "#ffffff";
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <td align="center" style="border-radius:8px;background:${bg};">
          <a href="${escapeHtml(url)}" target="_blank"
             style="display:inline-block;padding:12px 24px;font-size:15px;line-height:1;color:${fg};text-decoration:none;font-weight:600;border-radius:8px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

export function renderSummaryBlock(rows: Array<{ label: string; value: string | number | null | undefined }>): string {
  const items = rows
    .filter((r) => r.value !== null && r.value !== undefined && r.value !== "")
    .map(
      (r) => `
      <tr>
        <td style="padding:4px 12px 4px 0;font-size:13px;color:#64748b;vertical-align:top;white-space:nowrap;">${escapeHtml(r.label)}</td>
        <td style="padding:4px 0;font-size:14px;color:#0f172a;vertical-align:top;">${escapeHtml(r.value as string | number)}</td>
      </tr>`
    )
    .join("");
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin:12px 0;">
      <tbody>${items}</tbody>
    </table>`;
}

/** Wrap bodyHtml in the shared shell. */
export function wrapEmail(opts: EmailLayoutOpts): string {
  const lang = opts.language ?? "es";
  const footer = FOOTER_TAGLINE[lang] ?? FOOTER_TAGLINE.es;
  const preheader = escapeHtml(opts.preheader);
  const title = escapeHtml(opts.title);

  // The preheader uses the gmail-safe invisible span pattern so inbox previews
  // read the value we intend without leaking into the visible body.
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${title}</title>
    <style>
      /* Minimal stacked-pieces breakpoint for the tightest viewports. */
      @media (max-width: 360px) {
        table.d3d-pieces thead { display:none; }
        table.d3d-pieces, table.d3d-pieces tbody, table.d3d-pieces tr, table.d3d-pieces td { display:block !important; width:100% !important; }
        table.d3d-pieces tr { border:1px solid #e5e7eb; border-radius:8px; margin-bottom:8px; padding:4px 8px; }
        table.d3d-pieces td { padding:4px 0 !important; text-align:left !important; }
      }
      @media (prefers-color-scheme: dark) {
        body, .d3d-page { background:#0b1220 !important; color:#e2e8f0 !important; }
        .d3d-card { background:#111827 !important; color:#e2e8f0 !important; }
        .d3d-muted { color:#94a3b8 !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" class="d3d-page" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <tr>
              <td style="padding:0 0 12px 0;font-size:14px;letter-spacing:.02em;color:#64748b;">Dimension3D</td>
            </tr>
            <tr>
              <td class="d3d-card" style="background:#ffffff;border-radius:12px;padding:20px 24px;box-shadow:0 1px 3px rgba(15,23,42,.06);">
                <h1 style="margin:0 0 12px 0;font-size:20px;line-height:1.3;color:#0f172a;">${title}</h1>
                ${opts.bodyHtml}
              </td>
            </tr>
            <tr>
              <td class="d3d-muted" style="padding:16px 8px 0 8px;font-size:12px;color:#64748b;line-height:1.5;">
                ${escapeHtml(footer)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->
  </body>
</html>`;
}

/** Add the d3d-pieces class to a rendered pieces table. Separate so renderPiecesTable
 *  stays usable in contexts (e.g. plain preview) that don't need the stacking. */
export function stackablePiecesTable(html: string): string {
  return html.replace(
    '<table role="presentation" width="100%"',
    '<table role="presentation" class="d3d-pieces" width="100%"'
  );
}
