import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const POSTHOG_KEY = Deno.env.get("POSTHOG_KEY");
const POSTHOG_HOST = Deno.env.get("POSTHOG_HOST");

// B3: quote_received server-side event, 3s timeout
async function captureQuoteReceived(
  distinctId: string,
  properties: Record<string, unknown>,
  processPersonProfile: boolean,
): Promise<void> {
  if (!POSTHOG_KEY || !POSTHOG_HOST) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event: "quote_received",
        distinct_id: distinctId,
        properties: {
          ...properties,
          ...(processPersonProfile ? {} : { $process_person_profile: false }),
        },
      }),
      signal: controller.signal,
    });
  } catch {
    // timeout or network error
  } finally {
    clearTimeout(timer);
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface QuoteRequestPayload {
  filePaths: string[];
  fileNames: string[];
  contactEmail?: string | null;
  contactPhone?: string | null;
  material: string;
  color?: string | null;
  infillPct: number;
  wallLoops: number;
  totalGrams: number;
  totalHours: number;
  totalUnits: number;
  priceLow: number;
  priceHigh: number;
  language?: string;
  urgency?: string | null;
  sourceCity?: string | null;
  pieces?: { name: string; quantity: number; path?: string | null }[] | null;
  ph_distinct_id?: string | null;
  quote_id?: string | null;
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(clientIP);
  if (!record || now > record.resetTime) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) return true;
  record.count++;
  return false;
}

const sanitize = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const payload: QuoteRequestPayload = await req.json();
    const {
      filePaths, fileNames, contactEmail, contactPhone,
      material, color, infillPct, wallLoops,
      totalGrams, totalHours, totalUnits, priceLow, priceHigh, language,
      urgency, sourceCity, pieces, ph_distinct_id, quote_id,
    } = payload;

    if (!filePaths?.length) {
      return new Response(
        JSON.stringify({ error: "No files provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    if (!contactEmail?.trim() && !contactPhone?.trim()) {
      return new Response(
        JSON.stringify({ error: "At least one contact field required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a 7-day signed URL for each uploaded file
    const fileLinks: { name: string; url: string }[] = [];
    const pathToUrl: Record<string, string> = {};
    for (let i = 0; i < filePaths.length; i++) {
      const { data, error } = await supabase.storage
        .from("print-requests")
        .createSignedUrl(filePaths[i], 60 * 60 * 24 * 7);
      if (!error && data?.signedUrl) {
        fileLinks.push({ name: fileNames[i] ?? filePaths[i], url: data.signedUrl });
        pathToUrl[filePaths[i]] = data.signedUrl;
      } else {
        console.error("Signed URL error for", filePaths[i], error);
      }
    }

    const safeMaterial = sanitize(material);
    const safeColor = color ? sanitize(color.trim()) : null;
    const safeEmail = contactEmail ? sanitize(contactEmail.trim()) : null;
    const safePhone = contactPhone ? sanitize(contactPhone.trim()) : null;
    const safeLang = language ? sanitize(language) : "es";
    const safeUrgency = urgency ? sanitize(urgency.trim()) : "Estándar";

    const wallsLabel =
      wallLoops === 2 ? "2 (standard)" :
      wallLoops === 3 ? "3 (strong)" :
      "4 (extra strong)";

    const fileLinksHtml = fileLinks.map(f =>
      `<p style="margin:8px 0;">
        <a href="${f.url}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:8px 16px;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">
          ⬇ ${sanitize(f.name)}
        </a>
      </p>`
    ).join("\n");

    const stlSectionHtml = pieces?.length
      ? `<div style="background:#ecfdf5;padding:20px;border-radius:8px;margin:20px 0;">
          <h2 style="color:#065f46;margin-top:0;">Archivos STL — por pieza</h2>
          ${pieces.map(p => {
            const url = p.path ? (pathToUrl[p.path] ?? null) : null;
            const linkHtml = url
              ? `<a href="${url}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:6px 14px;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">⬇ ${sanitize(p.name)}</a>`
              : `<span style="font-size:13px;font-weight:600;">${sanitize(p.name)}</span>`;
            return `<p style="margin:8px 0;">${linkHtml} &times; ${p.quantity}</p>`;
          }).join("\n")}
          <p style="font-weight:bold;font-size:14px;margin:12px 0 4px 0;">Total: ${pieces.reduce((s, p) => s + p.quantity, 0)} piezas</p>
          <p style="color:#6b7280;font-size:12px;margin-top:8px;">Los enlaces expiran en 7 días.</p>
        </div>`
      : `<div style="background:#ecfdf5;padding:20px;border-radius:8px;margin:20px 0;">
          <h2 style="color:#065f46;margin-top:0;">Archivos STL (${fileLinks.length})</h2>
          ${fileLinksHtml || "<p>Sin archivos adjuntos.</p>"}
          <p style="color:#6b7280;font-size:12px;margin-top:12px;">Los enlaces expiran en 7 días.</p>
        </div>`;

    console.log(`Processing quote request: ${safeMaterial} ${infillPct}% ${wallsLabel} (IP: ${clientIP})`);

    const recipients =
      sourceCity?.toLowerCase().includes("sevilla") ||
      sourceCity?.toLowerCase().includes("seville")
        ? ["3d.kayda@gmail.com", "dimension3dprintsbcn@gmail.com"]
        : ["011107miko@gmail.com", "dimension3dprintsbcn@gmail.com"];

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dimension3D <noreply@dimension3dprints.com>",
        to: recipients,
        subject: `[REVISIÓN] Cliente envió archivo — ${safeMaterial} · €${Math.round(priceLow)}–€${Math.round(priceHigh)}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h1 style="color:#0f172a;">Nueva solicitud de presupuesto instantáneo</h1>

            <div style="background:#f1f5f9;padding:20px;border-radius:8px;margin:20px 0;">
              <h2 style="color:#334155;margin-top:0;">Contacto del cliente</h2>
              ${safeEmail ? `<p><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color:#0284c7;">${safeEmail}</a></p>` : ""}
              ${safePhone ? `<p><strong>WhatsApp / Teléfono:</strong> ${safePhone}</p>` : ""}
              <p><strong>Idioma:</strong> ${safeLang}</p>
            </div>

            <div style="background:#fffbeb;padding:20px;border-radius:8px;margin:20px 0;">
              <h2 style="color:#92400e;margin-top:0;">Detalles del presupuesto</h2>
              <p style="font-size:16px;"><strong>Urgencia / Urgency:</strong> ${safeUrgency}</p>
              <p><strong>Material:</strong> ${safeMaterial}</p>
              ${safeColor ? `<p><strong>Color:</strong> ${safeColor}</p>` : ""}
              <p><strong>Relleno:</strong> ${infillPct}%</p>
              <p><strong>Perímetros:</strong> ${wallsLabel}</p>
              <p><strong>Peso estimado:</strong> ${totalGrams.toFixed(1)} g</p>
              <p><strong>Tiempo estimado:</strong> ${totalHours.toFixed(1)} h</p>
              <p><strong>Unidades totales:</strong> ${totalUnits}</p>
              <p><strong>Rango de precio mostrado:</strong> €${Math.round(priceLow)} – €${Math.round(priceHigh)}</p>
            </div>

            ${stlSectionHtml}

            <p style="color:#6b7280;font-size:14px;">
              Enviado automáticamente desde la calculadora de precios de Dimension3D.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", emailResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "EMAIL_SEND_FAILED", details: errorText }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const emailData = await emailResponse.json();
    console.log("Quote request email sent:", emailData.id);

    // B3: quote_received — fire-and-forget (3s timeout internal)
    const phRawId = (typeof ph_distinct_id === "string" && ph_distinct_id.trim()) ? ph_distinct_id.trim() : null;
    const srvId = phRawId ?? ("srv_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16));
    captureQuoteReceived(srvId, {
      quote_id: quote_id ?? null,
      material,
      total_units: totalUnits,
      price_low: Math.round(priceLow),
      price_high: Math.round(priceHigh),
      source_city: sourceCity ?? null,
    }, !!phRawId);

    return new Response(JSON.stringify({ success: true, emailId: emailData.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-quote-request error:", error?.message, error?.stack);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", message: error?.message ?? "unknown" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
