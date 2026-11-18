import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

import { isSuccessfulCheckout } from "./payment-policy.ts";
import { wrapEmail, escapeHtml, renderButton } from "../_shared/emailLayout.ts";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const POSTHOG_KEY = Deno.env.get("POSTHOG_KEY");
const POSTHOG_HOST = Deno.env.get("POSTHOG_HOST");

// 6.1: server-side PostHog capture — 3s timeout, idempotent via session.id as uuid
// Required env vars: POSTHOG_KEY (project API key), POSTHOG_HOST (e.g. https://eu.i.posthog.com)
async function captureServerEvent(
  event: string,
  distinctId: string,
  properties: Record<string, unknown>,
  idempotencyKey: string,
  processPersonProfile: boolean,
): Promise<void> {
  if (!POSTHOG_KEY || !POSTHOG_HOST) {
    console.error(`[${event}] Missing env var — POSTHOG_KEY:`, !!POSTHOG_KEY, "POSTHOG_HOST:", !!POSTHOG_HOST);
    return;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: distinctId,
        uuid: idempotencyKey,
        properties: {
          ...properties,
          ...(processPersonProfile ? {} : { $process_person_profile: false }),
        },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(`[${event}] PostHog returned ${res.status}: ${body}`);
    } else {
      console.log(`[${event}] Captured for ${distinctId} (key ${idempotencyKey})`);
    }
  } catch (e: any) {
    console.error(`[${event}] Capture failed:`, e?.message ?? e);
  } finally {
    clearTimeout(timer);
  }
}

/** Backward-compat wrapper — fires order_paid_server (6.1) */
async function captureOrderPaid(
  distinctId: string,
  properties: Record<string, unknown>,
  idempotencyKey: string,
  processPersonProfile: boolean,
): Promise<void> {
  await captureServerEvent("order_paid_server", distinctId, properties, idempotencyKey, processPersonProfile);
}

async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(",");
  const tPart = parts.find((p) => p.startsWith("t="))?.slice(2);
  const v1Part = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!tPart || !v1Part) return false;

  // Reject events older than 5 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(tPart)) > 300) return false;

  const signedPayload = `${tPart}.${body}`;
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(signedPayload));
  const computed = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === v1Part;
}

// Pure helper — also tested via src/lib/stripeWebhookHelpers.test.ts
export function shouldSendConfirmation(currentStatus: string | null | undefined): boolean {
  return currentStatus !== "paid";
}

// Pure helper: build order_paid PostHog properties from session metadata + order row
export function buildOrderPaidProps(
  session: Record<string, any>,
  order: Record<string, unknown> | null,
): Record<string, unknown> {
  const meta = (session.metadata ?? {}) as Record<string, string>;
  const pricingVersion = meta.pricing_version ? Number(meta.pricing_version) : null;
  const partCount = meta.part_count ? Number(meta.part_count) : null;
  const materialsStr = typeof meta.materials === "string" ? meta.materials : null;
  const isMixed = materialsStr ? materialsStr.includes(",") : null;

  let qualitySummary: string | null = null;
  let supportsSummary: string | null = null;
  if (pricingVersion === 3 && Array.isArray(order?.pieces)) {
    const v3Pieces = (order!.pieces as Array<Record<string, unknown>>);
    const qualities = [...new Set(v3Pieces.map(p => String(p.quality ?? "")))].filter(Boolean);
    const supportsVals = v3Pieces.map(p => p.supports);
    qualitySummary = qualities.length === 1 ? qualities[0] : qualities.length > 1 ? "mixed" : null;
    supportsSummary = supportsVals.every(s => s === true) ? "all" : supportsVals.every(s => s === false) ? "none" : "mixed";
  }

  return {
    order_id: meta.order_id ?? null,
    order_number: meta.order_number ?? null,
    value: (session.amount_total ?? 0) / 100,
    currency: (session.currency ?? "eur").toUpperCase(),
    fulfillment: meta.fulfillment ?? null,
    source_path: meta.source_path ?? null,
    product_type: meta.product_type ?? null,
    part_slug: meta.part_slug ?? null,
    utm_source: meta.utm_source ?? null,
    utm_medium: meta.utm_medium ?? null,
    utm_content: meta.utm_content ?? null,
    utm_campaign: meta.utm_campaign ?? null,
    customer_ref: meta.customer_ref ?? null,
    $session_id: meta.ph_session_id ?? null,
    ...(pricingVersion != null ? { pricing_version: pricingVersion } : {}),
    ...(partCount != null ? { part_count: partCount } : {}),
    ...(materialsStr != null ? { materials: materialsStr } : {}),
    ...(isMixed != null ? { is_mixed: isMixed } : {}),
    ...(qualitySummary != null ? { quality: qualitySummary } : {}),
    ...(supportsSummary != null ? { supports: supportsSummary } : {}),
  };
}

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const signature = req.headers.get("stripe-signature");
  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing signature or secret", { status: 400 });
  }

  const body = await req.text();

  const valid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    console.error("Invalid Stripe webhook signature");
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);
  console.log("Stripe webhook received:", event.type);

  if (isSuccessfulCheckout(event.type, event.data.object.payment_status)) {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    const orderNumber = session.metadata?.order_number;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Declared at outer scope so captureOrderPaid can use order?.pieces
    let order: {
      order_number: number | null;
      product_title: string | null;
      notes: string | null;
      file_paths: string[] | null;
      fulfillment: string | null;
      shipping_address: unknown;
      customer_phone: string | null;
      pieces: unknown;
    } | null = null;

    let dbUpdateFailed = false;

    try {
      if (orderId) {
        // Instant self-service checkout flow — paid, ready to print

        // Idempotency: read current status before updating to avoid duplicate emails
        const { data: existing } = await adminClient
          .from("orders")
          .select("payment_status")
          .eq("id", orderId)
          .maybeSingle();

        if (!shouldSendConfirmation(existing?.payment_status)) {
          // Already processed — skip email, still fire order_paid (idempotent)
          console.log(`[idempotency] Order ${orderId} already paid — skipping confirmation email`);
          const { data: existingOrder } = await adminClient
            .from("orders")
            .select("order_number, product_title, notes, file_paths, fulfillment, shipping_address, customer_phone, pieces")
            .eq("id", orderId)
            .maybeSingle();
          order = existingOrder ?? null;
        } else {
          // Authoritative contact info comes from the completed Stripe session.
          const stripeEmail =
            session.customer_details?.email ?? session.customer_email ?? null;
          const stripePhone = session.customer_details?.phone ?? null;
          const shipping =
            session.shipping_details ?? session.collected_information?.shipping_details ?? null;

          const updatePayload: Record<string, unknown> = {
            payment_status: "paid",
            status: "quote_approved",
          };
          if (stripeEmail) updatePayload.customer_email = stripeEmail;
          if (stripePhone) updatePayload.customer_phone = stripePhone;
          if (shipping) updatePayload.shipping_address = shipping;

          const { data: updatedOrder, error } = await adminClient
            .from("orders")
            .update(updatePayload)
            .eq("id", orderId)
            .select("order_number, product_title, notes, file_paths, fulfillment, shipping_address, customer_phone, pieces")
            .maybeSingle();

          if (error) {
            console.error("Failed to mark instant order " + orderId + " as paid:", error);
            dbUpdateFailed = true;
          } else {
            order = updatedOrder ?? null;
            console.log("Instant order " + orderId + " marked paid + quote_approved");

            // Increment promo uses when payment completes (not at session creation)
            const promoCodeMeta = session.metadata?.promo_code;
            if (promoCodeMeta) {
              await adminClient.rpc("increment_promo_uses", { p_code: promoCodeMeta }).catch(
                (e: unknown) => console.error("[stripe-webhook] increment_promo_uses failed:", e)
              );
            }

            const notes = order?.notes ?? "";
            const orderPieces: Array<Record<string, unknown>> | null =
              Array.isArray(order?.pieces) ? (order!.pieces as Array<Record<string, unknown>>) : null;
            const isV2Pieces = orderPieces != null && orderPieces.some((p) => typeof p.material === "string");

            let material: string;
            let color: string | null;
            let infill: string | null;
            let wallLoops: string | null;

            if (isV2Pieces) {
              const mats = [...new Set(orderPieces!.map((p) => String(p.material ?? "")))];
              const infills = [...new Set(orderPieces!.map((p) => String(p.infill ?? "")))];
              const walls = [...new Set(orderPieces!.map((p) => String(p.wallLoops ?? "")))];
              material = mats.length === 1 ? mats[0] : `Mixed (${mats.join(", ")})`;
              color = null;
              infill = infills.length === 1 ? infills[0] : "mixed";
              wallLoops = walls.length === 1 ? walls[0] : "mixed";
            } else {
              const materialMatch = /Material: ([^\s/.]+)/.exec(notes);
              const colorMatch = /Material: [^\s/.]+ \/ ([^.]+)\./.exec(notes);
              const infillMatch = /Infill: ([^,]+),/.exec(notes);
              const wallsMatch = /,\s*(\S+) walls/.exec(notes);
              material = materialMatch?.[1] ?? "PLA";
              color = colorMatch?.[1]?.trim() ?? null;
              infill = infillMatch?.[1]?.trim() ?? null;
              wallLoops = wallsMatch?.[1] ?? null;
            }

            const qtyMatch = /qty (\d+)/.exec(notes);
            const filesMatch = /Files: ([^.]+)\./.exec(notes);
            const filePaths: string[] = Array.isArray(order?.file_paths) ? order!.file_paths as string[] : [];
            const fileNames = filesMatch
              ? filesMatch[1].split(",").map((s: string) => s.trim())
              : filePaths.map((p) => p.split("/").pop() ?? p);

            const { error: mailErr } = await adminClient.functions.invoke(
              "send-order-confirmation",
              {
                body: {
                  customerEmail: stripeEmail,
                  customerPhone: stripePhone ?? order?.customer_phone ?? null,
                  orderNumber: order?.order_number,
                  finalPrice: (session.amount_total ?? 0) / 100,
                  material,
                  color,
                  infill,
                  wallLoops,
                  quantity: qtyMatch ? Number(qtyMatch[1]) : null,
                  fulfillment: order?.fulfillment ?? null,
                  shippingAddress: shipping ?? order?.shipping_address ?? null,
                  filePaths,
                  fileNames,
                  deliveryDate: null,
                  customerName: session.customer_details?.name ?? null,
                  paymentMethod: "stripe",
                  stripePaymentLink: null,
                  pieces: orderPieces,
                  sourcePath: session.metadata?.source_path ?? null,
                  pageLanguage: session.metadata?.page_language ?? null,
                  promoCode: session.metadata?.promo_code ?? null,
                  promoPct: session.metadata?.promo_pct ? Number(session.metadata.promo_pct) : null,
                  promoDiscountCents: session.metadata?.promo_discount_cents ? Number(session.metadata.promo_discount_cents) : null,
                },
              },
            );
            if (mailErr) console.error("send-order-confirmation failed:", mailErr);
          }
        }
      } else if (session.metadata?.quote_id) {
        // Phase 3: a quote link was paid — convert the quote into an order
        // and trigger the normal confirmation emails. Idempotent via
        // quote_paid_at.
        const quoteId: string = session.metadata.quote_id;
        try {
          const { data: existingPaid } = await adminClient
            .from("quote_requests")
            .select("quote_paid_at, converted_order_id")
            .eq("id", quoteId)
            .maybeSingle();
          if (existingPaid?.quote_paid_at || existingPaid?.converted_order_id) {
            console.log(`[idempotency] Quote ${quoteId} already converted — skipping`);
          } else {
            const { data: q } = await adminClient
              .from("quote_requests")
              .select("id, contact_email, contact_phone, material, color, infill, wall_loops, pieces, file_paths, quote_price_cents, quote_shipping_cents, quote_production_days, quote_fulfillment, page_language")
              .eq("id", quoteId)
              .maybeSingle();
            if (q) {
              const stripeEmail = session.customer_details?.email ?? session.customer_email ?? q.contact_email ?? null;
              const stripePhone = session.customer_details?.phone ?? q.contact_phone ?? "see notes";
              const shippingAddr = session.shipping_details ?? session.collected_information?.shipping_details ?? null;
              const pieces = Array.isArray(q.pieces) ? q.pieces : [];
              const totalPaidCents = (q.quote_price_cents ?? 0) + (q.quote_shipping_cents ?? 0);
              const productTitle = `3D Print — ${q.material ?? "Mixed"}${q.color ? ` (${q.color})` : ""}`;
              const insertPayload: Record<string, unknown> = {
                product_title: productTitle,
                customer_phone: stripePhone,
                customer_email: stripeEmail,
                status: "quote_approved",
                fulfillment: q.quote_fulfillment ?? "pickup",
                notes: "",
                photos: [],
                payment_method: "stripe",
                payment_status: "paid",
                file_paths: Array.isArray(q.file_paths) ? q.file_paths : [],
                pieces: pieces,
                total_paid_cents: totalPaidCents,
                shipping_address: shippingAddr,
                language: q.page_language ?? "es",
              };
              // Degrade when the Phase 1 columns are not present yet.
              let insertedOrder: { id: string; order_number: number; tracking_token?: string | null } | null = null;
              let tryErr: { message?: string } | null = null;
              {
                const first = await adminClient
                  .from("orders")
                  .insert(insertPayload)
                  .select("id, order_number, tracking_token")
                  .single();
                insertedOrder = first.data;
                tryErr = first.error ?? null;
                if (tryErr && typeof tryErr.message === "string" && tryErr.message.toLowerCase().includes("column")) {
                  // Strip the phase-1-only fields and retry
                  const {
                    total_paid_cents: _a, language: _b, ...retry
                  } = insertPayload;
                  const second = await adminClient
                    .from("orders")
                    .insert(retry)
                    .select("id, order_number")
                    .single();
                  insertedOrder = (second.data as typeof insertedOrder) ?? null;
                  tryErr = second.error ?? null;
                }
              }
              if (tryErr || !insertedOrder) {
                console.error(`Quote ${quoteId} → order conversion failed:`, tryErr?.message);
                dbUpdateFailed = true;
              } else {
                await adminClient
                  .from("quote_requests")
                  .update({ quote_paid_at: new Date().toISOString(), converted_order_id: insertedOrder.id, status: "accepted" })
                  .eq("id", quoteId);
                order = insertedOrder as unknown as typeof order;
                // Fire the normal order-confirmation path (owner + customer emails)
                const { error: mailErr } = await adminClient.functions.invoke("send-order-confirmation", {
                  body: {
                    orderNumber: insertedOrder.order_number,
                    finalPrice: totalPaidCents / 100,
                    material: q.material ?? "",
                    color: q.color ?? null,
                    quantity: pieces.length || 1,
                    fulfillment: q.quote_fulfillment ?? "pickup",
                    shippingAddress: shippingAddr,
                    filePaths: Array.isArray(q.file_paths) ? q.file_paths : [],
                    fileNames: Array.isArray(q.file_paths) ? (q.file_paths as string[]).map((p) => String(p)) : [],
                    customerEmail: stripeEmail,
                    customerPhone: stripePhone,
                    customerName: session.customer_details?.name ?? null,
                    pieces,
                    language: q.page_language ?? "es",
                    paymentMethod: "stripe",
                    stripePaymentLink: null,
                    sourcePath: null,
                    pageLanguage: q.page_language ?? null,
                  },
                });
                if (mailErr) console.error("send-order-confirmation (quote→order) failed:", mailErr);
              }
            }
          }
        } catch (err) {
          console.error("Quote conversion error:", err);
        }
      } else if (orderNumber) {
        // Legacy payment-link flow

        // Idempotency check
        const { data: existing } = await adminClient
          .from("orders")
          .select("payment_status")
          .eq("order_number", parseInt(orderNumber))
          .maybeSingle();

        if (!shouldSendConfirmation(existing?.payment_status)) {
          console.log(`[idempotency] Order #${orderNumber} already paid — skipping update`);
        } else {
          const { error } = await adminClient
            .from("orders")
            .update({ payment_status: "paid" })
            .eq("order_number", parseInt(orderNumber));

          // Increment promo uses if this order had a promo code
          const promoCodeMeta = session.metadata?.promo_code;
          if (!error && promoCodeMeta) {
            await adminClient.rpc("increment_promo_uses", { p_code: promoCodeMeta }).catch(
              (e: unknown) => console.error("[stripe-webhook] increment_promo_uses failed:", e)
            );
          }

          if (error) {
            console.error("Failed to update payment_status for order #" + orderNumber + ":", error);
            dbUpdateFailed = true;
          } else {
            console.log("Marked order #" + orderNumber + " as paid");
          }
        }
      }
    } catch (unexpectedErr: any) {
      // Non-DB errors: log and fall through to return 200 so Stripe stops retrying.
      // (The order may already be marked paid; a retry would only re-send emails.)
      console.error("[stripe-webhook] unexpected error:", unexpectedErr?.message ?? unexpectedErr, unexpectedErr?.stack);
    }

    // Return 500 only when the DB update itself failed — that's when a Stripe retry is useful.
    if (dbUpdateFailed) {
      return new Response(JSON.stringify({ error: "DB_UPDATE_FAILED" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // B2: order_paid — idempotent (Stripe session.id is PostHog event uuid), 3s timeout
    const meta = session.metadata ?? {};
    const rawPHId = typeof meta.ph_distinct_id === "string" ? meta.ph_distinct_id.trim() : "";

    await captureOrderPaid(
      rawPHId || ("anon_" + session.id),
      buildOrderPaidProps(session, order),
      session.id,
      !!rawPHId,
    );
  }

  // 4.5: Abandoned-checkout recovery email
  if (event.type === "checkout.session.expired") {
    let recoverySent = false;
    try {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;
      const promotionsConsent = session.consent?.promotions ?? null;
      const recoveryUrl = session.after_expiration?.recovery?.url ?? null;
      const lang = (session.metadata?.page_language ?? "es") as string;

      if (customerEmail && promotionsConsent === "opt_in" && recoveryUrl && RESEND_API_KEY) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const adminClient = createClient(supabaseUrl, serviceRoleKey);

        // Idempotency + 7-day dedup: skip if a recovery was sent in the last 7 days for this email
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
        const { data: existing } = await adminClient
          .from("checkout_recoveries")
          .select("id")
          .eq("customer_email", customerEmail.toLowerCase())
          .gte("sent_at", sevenDaysAgo)
          .maybeSingle();

        if (!existing) {
          const T: Record<string, { subject: string; preheader: string; title: string; body: string; cta: string }> = {
            es: { subject: "Tu carrito de Dimension3D sigue aquí", preheader: "Retoma tu pedido donde lo dejaste.", title: "Tu pedido sigue aquí", body: "No completaste tu pago. Tu carrito sigue guardado y puedes retomar el pedido con un solo clic.", cta: "Retomar mi pedido" },
            ca: { subject: "El teu carret de Dimension3D segueix aquí", preheader: "Reprèn la teva comanda on la vas deixar.", title: "La teva comanda segueix aquí", body: "No vas completar el pagament. El teu carret segueix guardat i pots reprendre la comanda amb un sol clic.", cta: "Reprendre la meva comanda" },
            en: { subject: "Your Dimension3D cart is still here", preheader: "Pick up your order where you left off.", title: "Your order is still here", body: "You didn't complete your payment. Your cart is still saved and you can resume your order with one click.", cta: "Resume my order" },
            de: { subject: "Dein Dimension3D-Warenkorb wartet noch", preheader: "Setze deine Bestellung fort, wo du aufgehört hast.", title: "Deine Bestellung wartet", body: "Du hast die Zahlung nicht abgeschlossen. Dein Warenkorb ist noch gespeichert und du kannst deine Bestellung mit einem Klick fortsetzen.", cta: "Meine Bestellung fortsetzen" },
            fr: { subject: "Ton panier Dimension3D t'attend toujours", preheader: "Reprends ta commande là où tu l'as laissée.", title: "Ta commande est toujours là", body: "Tu n'as pas finalisé ton paiement. Ton panier est toujours enregistré et tu peux reprendre ta commande en un clic.", cta: "Reprendre ma commande" },
            nl: { subject: "Je Dimension3D-winkelwagen wacht nog", preheader: "Ga verder met je bestelling waar je gebleven was.", title: "Je bestelling wacht", body: "Je hebt de betaling niet afgerond. Je winkelwagen is nog opgeslagen en je kunt je bestelling met één klik hervatten.", cta: "Mijn bestelling hervatten" },
            it: { subject: "Il tuo carrello Dimension3D ti aspetta ancora", preheader: "Riprendi il tuo ordine dove l'hai lasciato.", title: "Il tuo ordine è ancora qui", body: "Non hai completato il pagamento. Il tuo carrello è ancora salvato e puoi riprendere l'ordine con un clic.", cta: "Riprendi il mio ordine" },
            pt: { subject: "O teu carrinho Dimension3D ainda está aqui", preheader: "Retoma o teu pedido onde paraste.", title: "O teu pedido ainda está aqui", body: "Não concluíste o pagamento. O teu carrinho ainda está guardado e podes retomar o pedido com um clique.", cta: "Retomar o meu pedido" },
          };
          const t = T[lang] ?? T.es;
          const bodyHtml = `
            <p style="margin:0 0 16px;font-size:15px;color:#334155;">${escapeHtml(t.body)}</p>
            ${renderButton(recoveryUrl, t.cta)}`;
          const html = wrapEmail({ preheader: t.preheader, title: t.title, bodyHtml, language: lang as any });

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: "Dimension3D <noreply@dimension3dprints.com>", to: [customerEmail], subject: t.subject, html }),
          });

          await adminClient.from("checkout_recoveries").insert({
            stripe_session_id: session.id,
            customer_email: customerEmail.toLowerCase(),
            recovery_url: recoveryUrl,
            language: lang,
          });
          recoverySent = true;
          console.log(`[checkout_recovery] Sent recovery email to ${customerEmail} (session ${session.id})`);
        }
      }

      // 6.1: checkout_expired_server — fires for every expired session
      const phId = session.metadata?.ph_distinct_id ?? null;
      await captureServerEvent(
        "checkout_expired_server",
        phId || ("anon_expired_" + session.id),
        {
          stripe_session_id: session.id,
          recovery_sent: recoverySent,
          country: session.customer_details?.address?.country ?? null,
          pricing_version: session.metadata?.pricing_version ? Number(session.metadata.pricing_version) : null,
          ph_distinct_id: phId,
        },
        "expired_" + session.id,
        !!phId,
      );
    } catch (err: any) {
      console.error("[checkout_recovery] Error:", err?.message ?? err);
    }
  }

  // 4.5: Mark abandoned checkout recovered when session was completed via recovery URL
  if (event.type === "checkout.session.completed" && event.data.object.recovered_from) {
    try {
      const session = event.data.object;
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      await adminClient.from("checkout_recoveries")
        .update({ recovered: true, recovered_session_id: session.id })
        .eq("stripe_session_id", session.recovered_from);
      console.log(`[checkout_recovery] Marked session ${session.recovered_from} as recovered (new: ${session.id})`);
    } catch (err: any) {
      console.error("[checkout_recovery] Mark recovered error:", err?.message ?? err);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
