// Plain-TS copy of supabase/functions/_shared/emailLayout.ts, trimmed to what
// the Vercel API functions need. Kept separate because the supabase/functions/
// tree is bundled by Deno; Vercel bundles this file via esbuild.

export type EmailLanguage = "es" | "ca" | "en" | "de" | "fr" | "nl" | "it" | "pt";

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

export function truncateMiddle(name: string, max = 42): string {
  if (name.length <= max) return name;
  const keep = max - 1;
  const start = Math.ceil(keep * 0.6);
  const end = keep - start;
  return `${name.slice(0, start)}…${name.slice(name.length - end)}`;
}

export function formatEUR(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return "";
  return (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
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

export function wrapEmail(opts: { preheader: string; title: string; bodyHtml: string; language?: EmailLanguage }): string {
  const lang = opts.language ?? "es";
  const preheader = escapeHtml(opts.preheader);
  const title = escapeHtml(opts.title);
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <tr><td style="padding:0 0 12px 0;font-size:14px;letter-spacing:.02em;color:#64748b;">Dimension3D</td></tr>
            <tr>
              <td style="background:#ffffff;border-radius:12px;padding:20px 24px;box-shadow:0 1px 3px rgba(15,23,42,.06);">
                <h1 style="margin:0 0 12px 0;font-size:20px;line-height:1.3;color:#0f172a;">${title}</h1>
                ${opts.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 8px 0 8px;font-size:12px;color:#64748b;line-height:1.5;">
                Dimension3D · Impresión 3D en Barcelona · dimension3dprints.com
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
