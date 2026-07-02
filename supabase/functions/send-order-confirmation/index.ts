import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "011107miko@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationPayload {
  customerEmail?: string | null;
  customerPhone?: string | null;
  orderNumber: number;
  finalPrice: number;
  material: string;
  color?: string | null;
  deliveryDate?: string | null;
  customerName?: string | null;
  paymentMethod?: "stripe" | "bizum" | "transfer" | "cash" | null;
  stripePaymentLink?: string | null;
}

const sanitize = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function buildPaymentBlock(
  paymentMethod: string | null | undefined,
  stripePaymentLink: string | null | undefined,
  orderNumber: number,
): string {
  if (paymentMethod === "stripe" && stripePaymentLink) {
    return `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
        <p style="color:#1e40af;font-size:15px;margin:0 0 16px 0;font-weight:600;">Completa tu pago para confirmar el pedido</p>
        <a href="${stripePaymentLink}"
           style="display:inline-block;background:#1e40af;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;">
          Pagar ahora &rarr;
        </a>
        <p style="color:#64748b;font-size:12px;margin:12px 0 0 0;">Pago seguro con tarjeta a través de Stripe</p>
      </div>
    `;
  }

  if (paymentMethod === "bizum") {
    return `
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px;margin:24px 0;">
        <p style="color:#92400e;font-size:15px;margin:0 0 8px 0;font-weight:600;">Instrucciones de pago &mdash; Bizum</p>
        <p style="color:#334155;margin:0;">Puedes pagar por Bizum al <strong>(+34) 672 051 147</strong></p>
        <p style="color:#64748b;font-size:13px;margin:8px 0 0 0;">Indica el número de pedido <strong>#${orderNumber}</strong> en el concepto.</p>
      </div>
    `;
  }

  if (paymentMethod === "transfer") {
    return `
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px;margin:24px 0;">
        <p style="color:#92400e;font-size:15px;margin:0 0 8px 0;font-weight:600;">Instrucciones de pago &mdash; Transferencia bancaria</p>
        <p style="color:#334155;margin:0;">Puedes pagar por transferencia a:</p>
        <p style="color:#0f172a;font-weight:700;font-size:15px;margin:8px 0 0 0;font-family:monospace;">ES08 1465 0120 34 1770495246</p>
        <p style="color:#64748b;font-size:13px;margin:8px 0 0 0;">Indica el número de pedido <strong>#${orderNumber}</strong> como concepto.</p>
      </div>
    `;
  }

  if (paymentMethod === "cash") {
    return `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:24px 0;">
        <p style="color:#166534;margin:0;font-size:14px;"><strong>Pago en efectivo</strong> al recoger o al entregar el pedido.</p>
      </div>
    `;
  }

  return "";
}

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
    const {
      customerEmail,
      customerPhone,
      orderNumber,
      finalPrice,
      material,
      color,
      deliveryDate,
      customerName,
      paymentMethod,
      stripePaymentLink,
    } = payload;

    if (!orderNumber) {
      return new Response(
        JSON.stringify({ error: "orderNumber is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const safeEmail = customerEmail?.trim() || null;
    const safePhone = customerPhone?.trim() || null;
    const safeName = customerName ? sanitize(customerName.trim()) : null;
    const safeMaterial = sanitize(material);
    const safeColor = color ? sanitize(color.trim()) : null;

    // Build a human-readable customer identifier for the subject line
    const clientContact = safeEmail ?? safePhone ?? "sin contacto";

    const subject = `Pedido #${orderNumber} confirmado — cliente: ${clientContact}`;

    // Customer contact block shown at the very top of the email body
    const contactRows = [
      safeName ? `<p style="margin:4px 0;"><strong>Nombre:</strong> ${safeName}</p>` : "",
      safeEmail ? `<p style="margin:4px 0;"><strong>Email:</strong> ${sanitize(safeEmail)}</p>` : "",
      safePhone ? `<p style="margin:4px 0;"><strong>Teléfono:</strong> ${sanitize(safePhone)}</p>` : "",
    ].join("");

    const clientBlock = `
      <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="color:#0f172a;font-size:13px;font-weight:700;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:.05em;">Cliente</p>
        ${contactRows || '<p style="margin:4px 0;color:#64748b;">Sin datos de contacto</p>'}
      </div>
    `;

    const deliveryHtml = deliveryDate
      ? `<p style="margin:6px 0;"><strong>Fecha de entrega estimada:</strong> ${new Date(deliveryDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>`
      : "";

    const paymentBlock = buildPaymentBlock(paymentMethod, stripePaymentLink, orderNumber);

    // Always send to the registered Resend address — the shared onboarding@resend.dev
    // sender can only deliver to the account owner's email (011107miko@gmail.com).
    // Customer contact is included in the subject and body above for easy reply.
    const resendBody = {
      from: "Dimension3D <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#0f172a;padding:24px 32px;border-radius:8px 8px 0 0;">
            <h1 style="color:#f59e0b;margin:0;font-size:22px;">Dimension3D</h1>
            <p style="color:#94a3b8;margin:4px 0 0 0;font-size:13px;">Impresión 3D profesional en Barcelona</p>
          </div>

          <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;">
            ${clientBlock}

            <p style="color:#334155;">¡El pedido ha sido confirmado!</p>

            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:20px;margin:24px 0;">
              <h2 style="color:#92400e;margin:0 0 12px 0;font-size:16px;">Detalles del pedido</h2>
              <p style="margin:6px 0;"><strong>Número de pedido:</strong> #${orderNumber}</p>
              <p style="margin:6px 0;"><strong>Material:</strong> ${safeMaterial}</p>
              ${safeColor ? `<p style="margin:6px 0;"><strong>Color:</strong> ${safeColor}</p>` : ""}
              <p style="margin:6px 0;"><strong>Precio confirmado:</strong> &euro;${finalPrice.toFixed(2)}</p>
              ${deliveryHtml}
            </div>

            ${paymentBlock}

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
              <p style="color:#166534;font-size:15px;margin:0 0 16px 0;font-weight:600;">Seguimiento del pedido</p>
              <a href="https://dimension3dprints.com/track"
                 style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;">
                Ver seguimiento &rarr; #${orderNumber}
              </a>
            </div>
          </div>

          <div style="background:#f8fafc;padding:16px 32px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none;">
            <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">
              Dimension3D &mdash; Impresión 3D profesional en Barcelona &middot; dimension3dprints.com
            </p>
          </div>
        </div>
      `,
    };

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendBody),
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
    console.log(`Order #${orderNumber} confirmation → to:${ADMIN_EMAIL} client:${clientContact} — emailId:${emailData.id}`);

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
