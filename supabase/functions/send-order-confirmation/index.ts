import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_RECIPIENT = "dimension3dprintsbcn@gmail.com";
const TRACK_URL = "https://www.dimension3dprints.com/track";

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
  infill?: string | number | null;
  wallLoops?: string | number | null;
  quantity?: number | null;
  fulfillment?: string | null;
  shippingAddress?: unknown;
  filePaths?: string[] | null;
  fileNames?: string[] | null;
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

const shell = (inner: string) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#0f172a;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="color:#f59e0b;margin:0;font-size:22px;">Dimension3D</h1>
      <p style="color:#94a3b8;margin:4px 0 0 0;font-size:13px;">Impresión 3D profesional en Barcelona</p>
    </div>
    <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;">
      ${inner}
    </div>
    <div style="background:#f8fafc;padding:16px 32px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none;">
      <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">
        Dimension3D &mdash; Impresión 3D profesional en Barcelona &middot; dimension3dprints.com
      </p>
    </div>
  </div>
`;

async function sendEmail(to: string[], subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Dimension3D <noreply@dimension3dprints.com>",
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(`Resend ${res.status}: ${details}`);
  }
  return await res.json();
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();

    // Trusted internal caller: the service role key (JWT or sb_secret_* form),
    // used by stripe-webhook. Anonymous callers are still rejected below.
    const secretKeys = (Deno.env.get("SUPABASE_SECRET_KEYS") ?? "")
      .split(/[,\s]+/)
      .map((s) => s.replace(/^["'\[]+|["'\]]+$/g, "").trim())
      .filter(Boolean);

    let isServiceJwt = false;
    try {
      const part = bearer.split(".")[1];
      if (part) {
        const claims = JSON.parse(
          atob(part.replace(/-/g, "+").replace(/_/g, "/")),
        );
        isServiceJwt = claims?.role === "service_role";
      }
    } catch (_e) { /* not a JWT */ }

    const isInternal =
      (!!serviceRoleKey && bearer === serviceRoleKey) ||
      secretKeys.includes(bearer) ||
      isServiceJwt;

    if (!isInternal) {
      // Verify admin caller (unchanged path for the admin panel)
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
    }

    const payload: ConfirmationPayload = await req.json();
    const {
      customerEmail,
      customerPhone,
      orderNumber,
      finalPrice,
      material,
      color,
      infill,
      wallLoops,
      quantity,
      fulfillment,
      shippingAddress,
      filePaths,
      fileNames,
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

    const price = Number(finalPrice) || 0;
    const safeEmail = customerEmail?.trim() || null;
    const safePhone = customerPhone?.trim() || null;
    const safeName = customerName ? sanitize(customerName.trim()) : null;
    const safeMaterial = sanitize(String(material ?? "n/a"));
    const safeColor = color ? sanitize(String(color).trim()) : null;

    // 7-day signed download links for the uploaded model files (admin copy only)
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const fileLinks: { name: string; url: string }[] = [];
    const paths = Array.isArray(filePaths) ? filePaths.filter(Boolean) : [];
    const names = Array.isArray(fileNames) ? fileNames : [];
    for (let i = 0; i < paths.length; i++) {
      const { data, error } = await admin.storage
        .from("print-requests")
        .createSignedUrl(paths[i], 60 * 60 * 24 * 7);
      if (!error && data?.signedUrl) {
        fileLinks.push({ name: names[i] ?? paths[i], url: data.signedUrl });
      } else {
        console.error("Signed URL error for", paths[i], error);
      }
    }

    const filesBlock = fileLinks.length
      ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin:24px 0;">
           <p style="color:#0f172a;font-size:13px;font-weight:700;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:.05em;">Archivos (enlaces válidos 7 días)</p>
           ${fileLinks.map((f) => `<p style="margin:4px 0;"><a href="${f.url}" style="color:#1e40af;">${sanitize(f.name)}</a></p>`).join("")}
         </div>`
      : paths.length
        ? `<p style="color:#b91c1c;margin:16px 0;">No se pudieron generar enlaces de descarga (${paths.length} archivo(s)).</p>`
        : "";

    const addressHtml = shippingAddress
      ? `<p style="margin:6px 0;"><strong>Dirección de envío:</strong><br/><span style="font-family:monospace;font-size:13px;">${sanitize(JSON.stringify(shippingAddress, null, 1))}</span></p>`
      : "";

    const deliveryHtml = deliveryDate
      ? `<p style="margin:6px 0;"><strong>Fecha de entrega estimada:</strong> ${new Date(deliveryDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>`
      : "";

    const clientContact = safeEmail ?? safePhone ?? "sin contacto";

    // ---------- ADMIN COPY ----------
    const adminHtml = shell(`
      <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="color:#0f172a;font-size:13px;font-weight:700;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:.05em;">Cliente</p>
        ${safeName ? `<p style="margin:4px 0;"><strong>Nombre:</strong> ${safeName}</p>` : ""}
        <p style="margin:4px 0;"><strong>Email:</strong> ${safeEmail ? sanitize(safeEmail) : "—"}</p>
        <p style="margin:4px 0;"><strong>Teléfono:</strong> ${safePhone ? sanitize(safePhone) : "—"}</p>
      </div>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:20px;margin:0 0 24px 0;">
        <h2 style="color:#92400e;margin:0 0 12px 0;font-size:16px;">Pedido #${orderNumber}</h2>
        <p style="margin:6px 0;"><strong>Material:</strong> ${safeMaterial}</p>
        <p style="margin:6px 0;"><strong>Color:</strong> ${safeColor ?? "—"}</p>
        <p style="margin:6px 0;"><strong>Relleno:</strong> ${infill != null ? sanitize(String(infill)) : "—"}</p>
        <p style="margin:6px 0;"><strong>Paredes:</strong> ${wallLoops != null ? sanitize(String(wallLoops)) : "—"}</p>
        <p style="margin:6px 0;"><strong>Cantidad:</strong> ${quantity ?? 1}</p>
        <p style="margin:6px 0;"><strong>Entrega:</strong> ${fulfillment ? sanitize(String(fulfillment)) : "—"}</p>
        ${addressHtml}
        <p style="margin:6px 0;"><strong>Precio pagado:</strong> &euro;${price.toFixed(2)}</p>
        ${deliveryHtml}
      </div>

      ${filesBlock}
    `);

    const adminResult = await sendEmail(
      [ADMIN_RECIPIENT],
      `Pedido #${orderNumber} confirmado — cliente: ${clientContact}`,
      adminHtml,
    );

    // ---------- CUSTOMER COPY ----------
    let customerEmailId: string | null = null;
    if (safeEmail) {
      const customerHtml = shell(`
        <p style="color:#334155;">${safeName ? `Hola ${safeName}, ` : ""}¡tu pedido está confirmado!</p>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:20px;margin:24px 0;">
          <h2 style="color:#92400e;margin:0 0 12px 0;font-size:16px;">Detalles del pedido</h2>
          <p style="margin:6px 0;"><strong>Número de pedido:</strong> #${orderNumber}</p>
          <p style="margin:6px 0;"><strong>Material:</strong> ${safeMaterial}${safeColor ? ` / ${safeColor}` : ""}</p>
          <p style="margin:6px 0;"><strong>Cantidad:</strong> ${quantity ?? 1}</p>
          <p style="margin:6px 0;"><strong>Precio:</strong> &euro;${price.toFixed(2)}</p>
          ${deliveryHtml}
        </div>

        ${buildPaymentBlock(paymentMethod, stripePaymentLink, orderNumber)}

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
          <p style="color:#166534;font-size:15px;margin:0 0 12px 0;font-weight:600;">Sigue tu pedido en cualquier momento</p>
          <a href="${TRACK_URL}"
             style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;">
            Ver seguimiento &rarr; #${orderNumber}
          </a>
          <p style="color:#166534;font-size:13px;margin:14px 0 0 0;">
            Entra en <a href="${TRACK_URL}" style="color:#166534;">${TRACK_URL}</a> e introduce tu número de pedido
            <strong>#${orderNumber}</strong> junto con el email o el teléfono que nos facilitaste.
          </p>
        </div>
      `);

      const customerResult = await sendEmail(
        [safeEmail],
        `Pedido #${orderNumber} confirmado — Dimension3D`,
        customerHtml,
      );
      customerEmailId = customerResult.id ?? null;
    }

    console.log(
      `Order #${orderNumber} confirmation — internal:${isInternal} admin:${adminResult.id} customer:${customerEmailId ?? "none"} files:${fileLinks.length}`,
    );

    return new Response(
      JSON.stringify({ success: true, adminEmailId: adminResult.id, customerEmailId }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (err: any) {
    console.error("send-order-confirmation error:", err?.message);
    const msg = err?.message ?? "unknown";
    const status = msg.startsWith("Resend ") ? 502 : 500;
    return new Response(
      JSON.stringify({ error: status === 502 ? "EMAIL_SEND_FAILED" : "INTERNAL_ERROR", message: msg }),
      { status, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
