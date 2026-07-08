import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "011107miko@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CatalogRequestPayload {
  productSlug: string;
  productName: string;
  customization: Record<string, string>;
  contactEmail?: string | null;
  contactPhone?: string | null;
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

    const payload: CatalogRequestPayload = await req.json();
    const {
      productSlug, productName, customization,
      contactEmail, contactPhone, priceLow, priceHigh, language,
    } = payload;

    if (!productSlug?.trim() || !productName?.trim()) {
      return new Response(
        JSON.stringify({ error: "productSlug and productName are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    if (!contactEmail?.trim() && !contactPhone?.trim()) {
      return new Response(
        JSON.stringify({ error: "At least one contact field required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const safeProductName = sanitize(productName.trim());
    const safeProductSlug = sanitize(productSlug.trim());
    const safeEmail = contactEmail ? sanitize(contactEmail.trim()) : null;
    const safePhone = contactPhone ? sanitize(contactPhone.trim()) : null;
    const safeLang = language ? sanitize(language) : "es";

    const customizationEntries = customization && typeof customization === "object"
      ? Object.entries(customization)
      : [];

    const customizationHtml = customizationEntries.length
      ? customizationEntries.map(([k, v]) =>
          `<li style="margin:4px 0;"><strong>${sanitize(String(k))}:</strong> ${sanitize(String(v))}</li>`
        ).join("\n")
      : "<li>Sin personalización</li>";

    console.log(`Processing catalog request: ${safeProductSlug} (IP: ${clientIP})`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dimension3D <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `Nuevo pedido de catálogo: ${safeProductName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h1 style="color:#0f172a;">Nuevo pedido de catálogo</h1>

            <div style="background:#fffbeb;padding:20px;border-radius:8px;margin:20px 0;">
              <h2 style="color:#92400e;margin-top:0;">Producto</h2>
              <p><strong>Nombre:</strong> ${safeProductName}</p>
              <p><strong>Slug:</strong> ${safeProductSlug}</p>
              <p><strong>Rango de precio mostrado:</strong> €${Math.round(priceLow)} – €${Math.round(priceHigh)}</p>
            </div>

            <div style="background:#f1f5f9;padding:20px;border-radius:8px;margin:20px 0;">
              <h2 style="color:#334155;margin-top:0;">Personalización</h2>
              <ul style="padding-left:20px;margin:0;">
                ${customizationHtml}
              </ul>
            </div>

            <div style="background:#ecfdf5;padding:20px;border-radius:8px;margin:20px 0;">
              <h2 style="color:#065f46;margin-top:0;">Contacto del cliente</h2>
              ${safeEmail ? `<p><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color:#0284c7;">${safeEmail}</a></p>` : ""}
              ${safePhone ? `<p><strong>WhatsApp / Teléfono:</strong> ${safePhone}</p>` : ""}
              <p><strong>Idioma:</strong> ${safeLang}</p>
            </div>

            <p style="color:#6b7280;font-size:14px;">
              Enviado automáticamente desde el catálogo de Dimension3D.
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
    console.log("Catalog request email sent:", emailData.id);

    return new Response(JSON.stringify({ success: true, emailId: emailData.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-catalog-request error:", error?.message, error?.stack);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", message: error?.message ?? "unknown" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
