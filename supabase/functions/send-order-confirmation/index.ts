import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationPayload {
  customerEmail: string;
  orderNumber: number;
  finalPrice: number;
  material: string;
  color?: string | null;
  deliveryDate?: string | null;
  customerName?: string | null;
}

const sanitize = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify admin caller
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const { data: roleData } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) return new Response("Forbidden", { status: 403, headers: corsHeaders });

    const payload: ConfirmationPayload = await req.json();
    const { customerEmail, orderNumber, finalPrice, material, color, deliveryDate, customerName } = payload;

    if (!customerEmail || !orderNumber) {
      return new Response(
        JSON.stringify({ error: "customerEmail and orderNumber are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const safeEmail = sanitize(customerEmail.trim());
    const safeName = customerName ? sanitize(customerName.trim()) : null;
    const safeMaterial = sanitize(material);
    const safeColor = color ? sanitize(color.trim()) : null;

    const greeting = safeName ? `Hola ${safeName},` : "Hola,";

    const deliveryHtml = deliveryDate
      ? `<p><strong>Fecha de entrega estimada:</strong> ${new Date(deliveryDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>`
      : "";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dimension3D <onboarding@resend.dev>",
        to: [safeEmail],
        subject: `Pedido confirmado — #${orderNumber} · Dimension3D`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0f172a;padding:24px 32px;border-radius:8px 8px 0 0;">
              <h1 style="color:#f59e0b;margin:0;font-size:22px;">Dimension3D</h1>
              <p style="color:#94a3b8;margin:4px 0 0 0;font-size:13px;">Impresión 3D profesional en Barcelona</p>
            </div>

            <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;">
              <p style="font-size:16px;color:#0f172a;">${greeting}</p>
              <p style="color:#334155;">¡Tu pedido ha sido confirmado! Estamos preparando tu impresión 3D.</p>

              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:20px;margin:24px 0;">
                <h2 style="color:#92400e;margin:0 0 12px 0;font-size:16px;">Detalles del pedido</h2>
                <p style="margin:6px 0;"><strong>Número de pedido:</strong> #${orderNumber}</p>
                <p style="margin:6px 0;"><strong>Material:</strong> ${safeMaterial}</p>
                ${safeColor ? `<p style="margin:6px 0;"><strong>Color:</strong> ${safeColor}</p>` : ""}
                <p style="margin:6px 0;"><strong>Precio confirmado:</strong> €${finalPrice.toFixed(2)}</p>
                ${deliveryHtml}
              </div>

              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
                <p style="color:#166534;font-size:15px;margin:0 0 16px 0;font-weight:600;">Sigue el estado de tu pedido en tiempo real</p>
                <a href="https://dimension3dprints.com/track"
                   style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;">
                  Ver seguimiento → #${orderNumber}
                </a>
              </div>

              <p style="color:#64748b;font-size:13px;">¿Tienes alguna pregunta? Responde a este email o contáctanos por WhatsApp.</p>
            </div>

            <div style="background:#f8fafc;padding:16px 32px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none;">
              <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">
                Dimension3D — Impresión 3D profesional en Barcelona · dimension3dprints.com
              </p>
            </div>
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
    console.log("Order confirmation sent to", safeEmail, "— emailId:", emailData.id);

    return new Response(JSON.stringify({ success: true, emailId: emailData.id }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("send-order-confirmation error:", err?.message);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", message: err?.message ?? "unknown" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
