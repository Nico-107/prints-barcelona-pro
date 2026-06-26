import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PriceEstimatePayload {
  fileName?: string;
  material: string;
  infillPct: number;
  quantity: number;
  volumeCm3: number;
  grams: number;
  estHours: number;
  priceLow: number;
  priceHigh: number;
  language?: string;
}

// Simple in-memory rate limiting (resets on function cold start)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 3;

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(clientIP);

  if (!record || now > record.resetTime) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count++;
  return false;
}

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
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const payload: PriceEstimatePayload = await req.json();
    const { fileName, material, infillPct, quantity, volumeCm3, grams, estHours, priceLow, priceHigh, language } = payload;

    // Validate required fields
    if (!material || infillPct == null || quantity == null || volumeCm3 == null) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize inputs for HTML email
    const sanitize = (str: string): string =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const safeMaterial = sanitize(material);
    const safeFileName = fileName ? sanitize(fileName) : null;
    const safeLang     = language ? sanitize(language) : "es";

    console.log(`Processing price estimate: ${safeMaterial} ${infillPct}% infill x${quantity} (IP: ${clientIP})`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dimension3D <onboarding@resend.dev>",
        to: ["011107miko@gmail.com"],
        subject: "New price estimate requested",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0f172a;">New price estimate requested</h1>

            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #334155; margin-top: 0;">Estimate details</h2>
              ${safeFileName ? `<p><strong>File:</strong> ${safeFileName}</p>` : ""}
              <p><strong>Material:</strong> ${safeMaterial}</p>
              <p><strong>Infill:</strong> ${infillPct}%</p>
              <p><strong>Quantity:</strong> ${quantity}</p>
              <p><strong>Language:</strong> ${safeLang}</p>
            </div>

            <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #92400e; margin-top: 0;">Computed values</h2>
              <p><strong>Volume:</strong> ${volumeCm3.toFixed(4)} cm³</p>
              <p><strong>Weight:</strong> ${grams.toFixed(1)} g</p>
              <p><strong>Est. print time:</strong> ${estHours.toFixed(1)} h</p>
              <p><strong>Price range:</strong> €${priceLow.toFixed(0)} – €${priceHigh.toFixed(0)}</p>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              This email was sent automatically from Dimension3D when a visitor used the STL price calculator.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", emailResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "EMAIL_SEND_FAILED", details: errorText, status: emailResponse.status }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailData = await emailResponse.json();
    console.log("Price estimate email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailId: emailData.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-price-estimate:", error?.message, error?.stack);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", message: error?.message ?? "unknown" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
