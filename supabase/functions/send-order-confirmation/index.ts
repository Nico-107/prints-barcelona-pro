import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { renderOwnerPurchaseEmail, type OwnerPurchaseEmailPiece } from "../_shared/ownerEmailTemplates.ts";
import { renderOrderConfirmed, toLangKey, type CustomerLang } from "../_shared/customerEmailTemplates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_RECIPIENT = "dimension3dprintsbcn@gmail.com";
const CUSTOMER_REPLY_TO = "dimension3dprintsbcn@gmail.com";
const TRACK_URL = "https://www.dimension3dprints.com/track";
const SITE_ORIGIN = "https://www.dimension3dprints.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationPiece {
  name: string;
  quantity: number;
  material?: string | null;
  color?: string | null;
  infill?: number | null;
  wallLoops?: number | null;
  quality?: string | null;
  supports?: boolean | null;
  orientation?: string | number | null;
  costCents?: number | null;
  // v4 pieces store these at top level; v3 nested under est
  gramsPerUnit?: number | null;
  hoursPerUnit?: number | null;
  est?: { gramsPerUnit?: number; hours?: number } | null;
}

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
  pieces?: ConfirmationPiece[] | null;
  // Source tracking (Item 6)
  sourcePath?: string | null;
  pageLanguage?: string | null;
  /** Customer language — drives the customer email translation (item 1.4). */
  language?: string | null;
  // A4: payment breakdown (passed by stripe-webhook from session metadata)
  promoCode?: string | null;
  promoPct?: number | null;
  promoDiscountCents?: number | null;
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

async function sendEmail(to: string[], subject: string, html: string, opts: { replyTo?: string } = {}) {
  const body: Record<string, unknown> = {
    from: "Dimension3D <noreply@dimension3dprints.com>",
    to,
    subject,
    html,
  };
  if (opts.replyTo) body.reply_to = opts.replyTo;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
      pieces,
      sourcePath,
      pageLanguage,
      language,
      promoCode,
      promoPct,
      promoDiscountCents,
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

    // Resolve color: prefer top-level; fall back to pieces' color (or "Mixed" for multiple)
    let resolvedColor: string | null = color ? String(color).trim() : null;
    if (!resolvedColor && Array.isArray(pieces) && pieces.length > 0) {
      const pieceColors = (pieces as ConfirmationPiece[])
        .map(p => p.color?.trim() ?? null)
        .filter((c): c is string => !!c);
      if (pieceColors.length > 0) {
        const unique = [...new Set(pieceColors)];
        resolvedColor = unique.length === 1 ? unique[0] : "Mixed";
      }
    }
    const safeColor = resolvedColor ? sanitize(resolvedColor) : null;

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

    let addressHtml = "";
    if (shippingAddress && typeof shippingAddress === "object") {
      const sa = shippingAddress as Record<string, unknown>;
      const addr = (sa.address && typeof sa.address === "object")
        ? sa.address as Record<string, unknown>
        : sa;
      const addrName   = sa.name   ? sanitize(String(sa.name).trim())   : null;
      const line1      = addr.line1       ? sanitize(String(addr.line1).trim())       : null;
      const line2      = addr.line2       ? sanitize(String(addr.line2).trim())       : null;
      const postalCode = addr.postal_code ? sanitize(String(addr.postal_code).trim()) : null;
      const city       = addr.city        ? sanitize(String(addr.city).trim())        : null;
      const country    = addr.country     ? sanitize(String(addr.country).trim())     : null;
      const cityLine   = [postalCode, city].filter(Boolean).join(" ");
      const lines = [addrName, line1, line2, cityLine, country].filter(Boolean);
      if (lines.length > 0) {
        addressHtml = `<p style="margin:6px 0;"><strong>Dirección de envío:</strong><br/>${lines.join("<br/>")}</p>`;
      }
    }

    const deliveryHtml = deliveryDate
      ? `<p style="margin:6px 0;"><strong>Fecha de entrega estimada:</strong> ${new Date(deliveryDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>`
      : "";

    const clientContact = safeEmail ?? safePhone ?? "sin contacto";

    // ---------- ADMIN COPY (item 1.3: shared layout, new subject, uploads-not-bought) ----------
    // Fetch the order row to get shipping_address, uploaded_not_purchased, and the admin deep link.
    let orderRow: Record<string, unknown> | null = null;
    try {
      const { data: row } = await admin
        .from("orders")
        .select("id, shipping_address, uploaded_not_purchased, total_paid_cents, tracking_token, language, urgency, ship_by_date, min_adj_cents, express_cents, promo_code, promo_pct, promo_discount_cents")
        .eq("order_number", orderNumber)
        .maybeSingle();
      orderRow = row as Record<string, unknown> | null;
    } catch (_e) {
      // Degrade for older schemas (pre-phase-1 migration).
      try {
        const { data: row } = await admin
          .from("orders")
          .select("id, shipping_address, total_paid_cents")
          .eq("order_number", orderNumber)
          .maybeSingle();
        orderRow = row as Record<string, unknown> | null;
      } catch (_e2) { /* ignore */ }
    }

    const orderId = (orderRow?.id as string | undefined) ?? "";
    const totalPaidCents = ((): number => {
      if (orderRow && typeof orderRow.total_paid_cents === "number") return orderRow.total_paid_cents as number;
      return Math.round(price * 100);
    })();

    const uploadedNotPurchasedRaw = (orderRow?.uploaded_not_purchased as unknown) ?? [];
    const uploadedNotPurchased: Array<{ path: string; name: string }> = Array.isArray(uploadedNotPurchasedRaw)
      ? (uploadedNotPurchasedRaw as Array<Record<string, unknown>>)
          .filter((x) => x && typeof x.path === "string" && typeof x.name === "string")
          .map((x) => ({ path: x.path as string, name: x.name as string }))
      : [];
    const uploadedSigned = [] as Array<{ name: string; signedUrl: string | null }>;
    for (const u of uploadedNotPurchased) {
      const { data } = await admin.storage
        .from("print-requests")
        .createSignedUrl(u.path, 60 * 60 * 24 * 7);
      uploadedSigned.push({ name: u.name, signedUrl: data?.signedUrl ?? null });
    }

    const addrObj = (orderRow?.shipping_address as Record<string, unknown> | undefined) ?? (shippingAddress as Record<string, unknown> | undefined) ?? null;
    const flatAddr: Record<string, unknown> | null = (() => {
      if (!addrObj) return null;
      if (addrObj.address && typeof addrObj.address === "object") return addrObj.address as Record<string, unknown>;
      return addrObj as Record<string, unknown>;
    })();
    const destCountry = flatAddr && typeof flatAddr.country === "string" ? (flatAddr.country as string) : null;
    const destCity    = flatAddr && typeof flatAddr.city    === "string" ? (flatAddr.city    as string) : null;

    const ownerPieces: OwnerPurchaseEmailPiece[] = Array.isArray(pieces)
      ? (pieces as ConfirmationPiece[]).map((p) => ({
          name: String(p.name ?? ""),
          quantity: Number(p.quantity ?? 1),
          material: String(p.material ?? ""),
          color: p.color ?? null,
          priceCents: typeof p.costCents === "number" ? p.costCents : null,
          infill: typeof p.infill === "number" ? p.infill : (p.infill != null ? Number(p.infill) : null),
          wallLoops: typeof p.wallLoops === "number" ? p.wallLoops : (p.wallLoops != null ? Number(p.wallLoops) : null),
          quality: p.quality ?? null,
          supports: typeof p.supports === "boolean" ? p.supports : null,
          orientation: p.orientation ?? null,
          grams: p.gramsPerUnit ?? p.est?.gramsPerUnit ?? null,
          hours: p.hoursPerUnit ?? p.est?.hours ?? null,
        }))
      : [{ name: "Pieza", quantity: Number(quantity ?? 1), material: String(material ?? ""), color: resolvedColor }];

    const adminOrderUrl = orderId
      ? `${SITE_ORIGIN}/admin?order=${encodeURIComponent(orderId)}`
      : `${SITE_ORIGIN}/admin`;
    const zipDownloadUrl = `${supabaseUrl}/functions/v1/order-files-zip?order_number=${encodeURIComponent(String(orderNumber))}`;

    const ownerEmail = renderOwnerPurchaseEmail({
      orderNumber: Number(orderNumber),
      totalPaidCents,
      paymentMethod: paymentMethod ?? null,
      customerName: customerName ?? null,
      customerEmail: safeEmail ?? null,
      customerPhone: safePhone ?? null,
      fulfillment: (fulfillment === "pickup" ? "pickup" : "shipping"),
      destinationCountry: destCountry,
      destinationCity: destCity,
      shippingAddress: flatAddr,
      shipByIso: deliveryDate ?? (orderRow?.ship_by_date as string | null) ?? null,
      urgency: (orderRow?.urgency as "standard" | "express" | "urgent" | null) ?? null,
      pieces: ownerPieces,
      uploadedNotPurchased: uploadedSigned,
      adminOrderUrl,
      zipDownloadUrl,
      sourcePath: sourcePath ?? null,
      pageLanguage: pageLanguage ?? null,
      minAdjCents: (orderRow?.min_adj_cents as number | null) ?? null,
      expressCents: (orderRow?.express_cents as number | null) ?? null,
      promoCode: (orderRow?.promo_code as string | null) ?? promoCode ?? null,
      promoPct: (orderRow?.promo_pct as number | null) ?? promoPct ?? null,
      promoDiscountCents: (orderRow?.promo_discount_cents as number | null) ?? promoDiscountCents ?? null,
    });

    const adminResult = await sendEmail(
      [ADMIN_RECIPIENT],
      ownerEmail.subject,
      ownerEmail.html,
    );
    // Old formatting helpers kept for the customer copy (1.4 rewrites it).
    void clientContact; void filesBlock; void addressHtml; void deliveryHtml; void safeMaterial; void safeColor;

    // ---------- CUSTOMER COPY (item 1.4) ----------
    // If the customer has no email, skip silently — the admin copy still ran
    // and the owner can see "sin email" in the admin.
    let customerEmailId: string | null = null;
    if (safeEmail) {
      const orderLang = (orderRow?.language as string | undefined) ?? language ?? pageLanguage ?? "es";
      const customerLang: CustomerLang = toLangKey(orderLang);
      const trackingToken = (orderRow?.tracking_token as string | undefined) ?? null;
      const customerCtx = {
        orderNumber: Number(orderNumber),
        trackingToken: trackingToken ?? "",
        firstName: customerName ? String(customerName).trim().split(" ")[0] : (safeEmail.split("@")[0] ?? null),
        customerLanguage: customerLang,
        siteOrigin: SITE_ORIGIN,
        whatsappNumber: "+34672051147",
      };
      const customerPieces = (ownerPieces ?? []).map((p) => ({
        name: p.name,
        quantity: p.quantity,
        material: p.material,
        color: p.color ?? null,
      }));
      const { subject: customerSubject, html: customerHtml } = renderOrderConfirmed({
        ctx: customerCtx,
        pieces: customerPieces,
        totalPaidCents,
        fulfillment: (fulfillment === "pickup" ? "pickup" : "shipping"),
        shipByIso: deliveryDate ?? null,
        pickupReadyIso: fulfillment === "pickup" ? (deliveryDate ?? null) : null,
      });

      // If the token is missing (older order before migration), also append a
      // fallback plain-text pointer to /track so the customer can still find
      // the order. We do this by setting the button to /track as a safety net.
      let finalHtml = customerHtml;
      if (!trackingToken) {
        finalHtml = finalHtml.replace(
          `href="${SITE_ORIGIN}/pedido/"`,
          `href="${TRACK_URL}"`
        );
      }

      // Stripe-link payment fallback: preserve the pre-existing payment block
      // when the order is still awaiting payment. We append it below the
      // template body so the new structure stays intact.
      const paymentFallback = buildPaymentBlock(paymentMethod, stripePaymentLink, orderNumber);
      if (paymentFallback && paymentMethod === "stripe") {
        finalHtml = finalHtml.replace("</body>", `<!-- payment -->${paymentFallback}</body>`);
      }

      const customerResult = await sendEmail(
        [safeEmail],
        customerSubject,
        finalHtml,
        { replyTo: CUSTOMER_REPLY_TO },
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
