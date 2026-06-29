import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "011107miko@gmail.com";

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
    for (let i = 0; i < filePaths.length; i++) {
      const { data, error } = await supabase.storage
        .from("print-requests")
        .createSignedUrl(filePaths[i], 60 * 60 * 24 * 7);
      if (!error && data?.signedUrl) {
        fileLinks.push({ name: fileNames[i] ?? filePaths[i], url: data.signedUrl });
      } else {
        console.error("Signed URL error for", filePaths[i], error);
      }
    }

    const safeMaterial = sanitize(material);
    const safeColor = color ? sanitize(color.trim()) : null;
    const safeEmail = contactEmail ? sanitize(contactEmail.trim()) : null;
    const safePhone = contactPhone ? sanitize(contactPhone.trim()) : null;
    const safeLang = language ? sanitize(language) : "es";

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

    console.log(`Processing quote request: ${safeMaterial} ${infillPct}% ${wallsLabel} (IP: ${clientIP})`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dimension3D <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `Nueva solicitud de presupuesto — ${safeMaterial} · €${Math.round(priceLow)}–€${Math.round(priceHigh)}`,
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
              <p><strong>Material:</strong> ${safeMaterial}</p>
              ${safeColor ? `<p><strong>Color:</strong> ${safeColor}</p>` : ""}
              <p><strong>Relleno:</strong> ${infillPct}%</p>
              <p><strong>Perímetros:</strong> ${wallsLabel}</p>
              <p><strong>Peso estimado:</strong> ${totalGrams.toFixed(1)} g</p>
              <p><strong>Tiempo estimado:</strong> ${totalHours.toFixed(1)} h</p>
              <p><strong>Unidades totales:</strong> ${totalUnits}</p>
              <p><strong>Rango de precio mostrado:</strong> €${Math.round(priceLow)} – €${Math.round(priceHigh)}</p>
            </div>

            <div style="background:#ecfdf5;padding:20px;border-radius:8px;margin:20px 0;">
              <h2 style="color:#065f46;margin-top:0;">Archivos STL (${fileLinks.length})</h2>
              ${fileLinksHtml || "<p>Sin archivos adjuntos.</p>"}
              <p style="color:#6b7280;font-size:12px;margin-top:12px;">Los enlaces expiran en 7 días.</p>
            </div>

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
