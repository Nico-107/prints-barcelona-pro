import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SITE_URL = "https://dimension3dprints.com";

// Anon-callable: same permissive CORS pattern as send-quote-request (no auth required)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_MATERIALS = ["PLA", "PETG", "ABS", "TPU"];
const MAX_PRICE = 56.5;

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = requestCounts.get(ip);
  if (!rec || now > rec.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (rec.count >= MAX_REQUESTS_PER_WINDOW) return true;
  rec.count++;
  return false;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

// PRICING-START
const SETUP_FEE = 8;
const RATE_PER_GRAM = 0.22;
const MIN_PRICE = 10;
const INSTANT_BUY_MAX = 52.5;

const MATERIALS: Record<string, { density: number; multiplier: number }> = {
  PLA:      { density: 1.24, multiplier: 1.0 },
  PETG:     { density: 1.27, multiplier: 1.1 },
  HIPS:     { density: 1.07, multiplier: 1.2 },
  ABS:      { density: 1.04, multiplier: 1.3 },
  ASA:      { density: 1.07, multiplier: 1.3 },
  TPU:      { density: 1.20, multiplier: 1.3 },
  Nylon:    { density: 1.14, multiplier: 1.4 },
  PC:       { density: 1.20, multiplier: 1.5 },
  PVA:      { density: 1.23, multiplier: 1.5 },
  "PLA-CF": { density: 1.30, multiplier: 1.6 },
  "PETG-CF":{ density: 1.30, multiplier: 1.6 },
  "Nylon-CF":{ density: 1.20, multiplier: 1.6 },
};

const URGENCY_MULTIPLIER: Record<string, number> = {
  standard: 1.0,
  express:  1.25,
  urgent:   1.6,
};

const INSTANT_MATERIALS = ["PLA", "PETG", "ABS", "TPU"];

function wallFactor(loops: number): number {
  if (loops <= 2) return 0.14;
  if (loops === 3) return 0.20;
  if (loops === 4) return 0.27;
  return Math.min(0.27 + (loops - 4) * 0.07, 0.80);
}

function effectiveFill(infillPct: number, loops: number): number {
  const wf = wallFactor(loops);
  return wf + (infillPct / 100) * (1 - wf);
}

function pricingRound(x: number): number {
  return Math.floor(x + 0.5);
}

interface PricePiece {
  volumeMm3: number;
  quantity: number;
  material: string;
  infill: number;
  wallLoops: number;
}

interface OrderResult {
  parts: Array<{ gramsPerUnit: number; costCents: number }>;
  setupCents: number;
  minAdjCents: number;
  expressCents: number;
  capShaveCents: number;
  totalCents: number;
  chargedPrintCents: number;
  eligible: boolean;
}

function computeOrder(pieces: PricePiece[], urgency: string): OrderResult {
  const um = URGENCY_MULTIPLIER[urgency] ?? 1.0;

  const gramsPerUnit: number[] = [];
  const partRaw: number[] = [];

  for (const p of pieces) {
    const mat = MATERIALS[p.material];
    const ef = effectiveFill(p.infill, p.wallLoops);
    const gpu = (p.volumeMm3 / 1000) * mat.density * ef;
    const pr = gpu * p.quantity * RATE_PER_GRAM * mat.multiplier;
    gramsPerUnit.push(gpu);
    partRaw.push(pr);
  }

  const sumPartRaw = partRaw.reduce((s, v) => s + v, 0);
  const raw = SETUP_FEE + sumPartRaw;
  const base = Math.max(raw, MIN_PRICE);
  const total = base * um;

  const baseCents = pricingRound(base * 100);
  const totalCents = pricingRound(total * 100);

  const partCents = partRaw.map((pr) => pricingRound(pr * 100));
  const setupCents = 800;

  const sumPartCents = partCents.reduce((s, v) => s + v, 0);
  const residual = baseCents - (setupCents + sumPartCents);

  let minAdjCents = 0;
  if (raw < MIN_PRICE) {
    minAdjCents = residual;
  } else {
    // Add residual to largest part (first on ties)
    let maxIdx = 0;
    for (let i = 1; i < partCents.length; i++) {
      if (partCents[i] > partCents[maxIdx]) maxIdx = i;
    }
    partCents[maxIdx] += residual;
  }

  const expressCents = totalCents - baseCents;

  const eligible = totalCents <= pricingRound(INSTANT_BUY_MAX * 100);

  let capShaveCents = 0;
  if (eligible && totalCents > 5000) {
    capShaveCents = totalCents - 5000;
    // Subtract cap from the largest line (after residual)
    let maxIdx = 0;
    for (let i = 1; i < partCents.length; i++) {
      if (partCents[i] > partCents[maxIdx]) maxIdx = i;
    }
    partCents[maxIdx] -= capShaveCents;
  }

  const chargedPrintCents = totalCents - capShaveCents;

  const parts = gramsPerUnit.map((gpu, i) => ({
    gramsPerUnit: gpu,
    costCents: partCents[i],
  }));

  return {
    parts,
    setupCents,
    minAdjCents,
    expressCents,
    capShaveCents,
    totalCents,
    chargedPrintCents,
    eligible,
  };
}

function buildStripeLineItems(
  order: OrderResult,
  pieces: Array<{ name: string; quantity: number; material: string; infill: number; wallLoops: number; color?: string }>,
  language: string,
): Array<{ name: string; amount: number }> {
  const lang = language?.toLowerCase() ?? "";
  const isEs = lang.startsWith("es");
  const isCa = lang.startsWith("ca");

  const fillWord = isEs ? "relleno" : isCa ? "farciment" : "infill";
  const setupLabel = isEs ? "Preparación del pedido" : isCa ? "Preparació de la comanda" : "Order setup";
  const minAdjLabel = isEs
    ? "Ajuste al pedido mínimo (10 €)"
    : isCa
    ? "Ajust a la comanda mínima (10 €)"
    : "Adjustment to the €10 minimum";
  const expressLabel = isEs ? "Suplemento express" : isCa ? "Suplement exprés" : "Express surcharge";

  const lines: Array<{ name: string; amount: number }> = [];

  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    const cost = order.parts[i].costCents;
    if (cost <= 0) continue;
    const raw = `${p.name} — ${p.material}, ${p.infill}% ${fillWord}, ×${p.quantity}`;
    lines.push({ name: raw.slice(0, 120), amount: cost });
  }

  lines.push({ name: setupLabel, amount: order.setupCents });

  if (order.minAdjCents > 0) {
    lines.push({ name: minAdjLabel, amount: order.minAdjCents });
  }

  if (order.expressCents > 0) {
    lines.push({ name: expressLabel, amount: order.expressCents });
  }

  return lines;
}
// PRICING-END

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(clientIP)) {
      return json({ error: "Too many requests. Please try again later." }, 429);
    }

    const body = await req.json();

    // ── V2 PATH ────────────────────────────────────────────────────────────────
    const isV2 =
      body?.pricingVersion === 2 &&
      Array.isArray(body?.pieces) &&
      body.pieces.length > 0 &&
      body.pieces.every((p: unknown) => typeof (p as Record<string, unknown>)?.material === "string");

    if (isV2) {
      const {
        urgency, fulfillment, exactPrice, pieces,
        contactEmail, contactPhone, language,
        filePaths, fileNames,
        ph_distinct_id, ph_session_id,
        utm_source, utm_medium, utm_content, utm_campaign,
        product_type, customer_ref,
        color: topColor, infill: topInfill, wallLoops: topWallLoops,
        quantity: topQuantity,
      } = body;

      // ── Validation ──────────────────────────────────────────────────────────
      if (!Array.isArray(pieces) || pieces.length === 0 || pieces.length > 20) {
        return json({ error: "INVALID_PIECES" }, 400);
      }

      const VALID_INFILL = [5, 15, 30, 50, 80];

      for (const p of pieces) {
        if (!INSTANT_MATERIALS.includes(p.material)) {
          return json({ error: "INVALID_MATERIAL" }, 400);
        }
        if (!VALID_INFILL.includes(Number(p.infill))) {
          return json({ error: "INVALID_INFILL" }, 400);
        }
        const walls = Number(p.wallLoops);
        if (!Number.isInteger(walls) || walls < 2 || walls > 8) {
          return json({ error: "INVALID_WALLS" }, 400);
        }
        const qty = Number(p.quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
          return json({ error: "INVALID_QUANTITY" }, 400);
        }
        const vol = Number(p.volumeMm3);
        if (!Number.isFinite(vol) || vol <= 0 || vol > 50_000_000) {
          return json({ error: "INVALID_VOLUME" }, 400);
        }
        if (p.multicolour === true) {
          return json({ error: "INSTANT_NOT_AVAILABLE" }, 400);
        }
      }

      if (!URGENCY_MULTIPLIER[urgency]) {
        return json({ error: "INVALID_URGENCY" }, 400);
      }

      if (fulfillment !== "pickup" && fulfillment !== "shipping") {
        return json({ error: "INVALID_FULFILLMENT" }, 400);
      }

      if (!STRIPE_SECRET_KEY) return json({ error: "STRIPE_NOT_CONFIGURED" }, 500);

      // ── Server-side pricing ─────────────────────────────────────────────────
      const piecesForCalc: PricePiece[] = pieces.map((p: Record<string, unknown>) => ({
        volumeMm3: Number(p.volumeMm3),
        quantity:  Number(p.quantity),
        material:  String(p.material),
        infill:    Number(p.infill),
        wallLoops: Number(p.wallLoops),
      }));

      const order = computeOrder(piecesForCalc, urgency);

      if (!order.eligible || order.totalCents > 5250) {
        return json({ error: "PRICE_ABOVE_INSTANT_LIMIT" }, 400);
      }

      const exactPriceCents = pricingRound(Number(exactPrice) * 100);
      if (Math.abs(exactPriceCents - order.chargedPrintCents) > 2) {
        console.log(`PRICE_MISMATCH: client=${exactPriceCents} server=${order.chargedPrintCents}`);
        return json({ error: "PRICE_MISMATCH" }, 400);
      }

      // ── Sanitise & enrich pieces ────────────────────────────────────────────
      const KNOWN_MATERIALS = new Set(Object.keys(MATERIALS));
      const enrichedPieces = pieces.map((p: Record<string, unknown>, i: number) => {
        const mat = KNOWN_MATERIALS.has(String(p.material)) ? String(p.material) : String(p.material);
        return {
          name:         String(p.name ?? "").slice(0, 80),
          quantity:     Number(p.quantity),
          path:         typeof p.path === "string" ? p.path : null,
          material:     mat,
          color:        typeof p.color === "string" ? p.color.slice(0, 60) : null,
          infill:       Number(p.infill),
          wallLoops:    Number(p.wallLoops),
          multicolour:  p.multicolour === true,
          gramsPerUnit: order.parts[i].gramsPerUnit,
          costCents:    order.parts[i].costCents,
        };
      });

      // ── Product title ───────────────────────────────────────────────────────
      const allMats = enrichedPieces.map((p: { material: string }) => p.material);
      const uniqueMats = [...new Set(allMats)];
      const isUniform = uniqueMats.length === 1;

      let resolvedProductTitle: string;
      if (isUniform) {
        const firstColor = enrichedPieces.find((p: { color: string | null }) => p.color)?.color ?? null;
        resolvedProductTitle = `3D Print — ${uniqueMats[0]}${firstColor ? ` (${firstColor})` : ""}`;
      } else {
        resolvedProductTitle = `3D Print — Mixed (${uniqueMats.join(", ")})`;
      }

      // ── Notes ────────────────────────────────────────────────────────────────
      const names: string[] = Array.isArray(fileNames) ? fileNames.map(String) : [];
      const paths: string[] = Array.isArray(filePaths) ? filePaths.map(String) : [];
      const totalQty = enrichedPieces.reduce((s: number, p: { quantity: number }) => s + p.quantity, 0);

      const allInfill = [...new Set(enrichedPieces.map((p: { infill: number }) => p.infill))];
      const allWalls  = [...new Set(enrichedPieces.map((p: { wallLoops: number }) => p.wallLoops))];
      const uniformInfill = allInfill.length === 1;
      const uniformWalls  = allWalls.length === 1;

      const shippingCentsV2 = fulfillment === "shipping" ? 600 : 0;
      const totalPaidEuros = ((order.chargedPrintCents + shippingCentsV2) / 100).toFixed(2);

      let notes: string;
      if (isUniform && uniformInfill && uniformWalls) {
        // Exactly legacy format when all parts share material, infill, walls
        const singleMat = uniqueMats[0];
        const firstColor = enrichedPieces.find((p: { color: string | null }) => p.color)?.color ?? null;
        const piecesStr = enrichedPieces.length > 0
          ? `Pieces: ${enrichedPieces.map((p: { name: string; quantity: number }) => `${p.name} x${p.quantity}`).join(", ")}.`
          : "";
        notes = [
          "Instant checkout (self-service, ≤ €35).",
          contactEmail ? `Email: ${contactEmail}.` : "",
          `Material: ${singleMat}${firstColor ? ` / ${firstColor}` : ""}.`,
          `Infill: ${allInfill[0]}, ${allWalls[0]} walls, qty ${totalQty}.`,
          `Total price: €${totalPaidEuros}.`,
          names.length ? `Files: ${names.join(", ")}.` : "",
          paths.length ? `Paths: ${paths.join(", ")}.` : "",
          language ? `Language: ${language}.` : "",
          piecesStr,
        ].filter(Boolean).join(" ");
      } else {
        const matsLabel = uniqueMats.join(", ");
        const partsSummary = enrichedPieces
          .map((p: { name: string; quantity: number; material: string; infill: number; wallLoops: number; color: string | null }) => {
            const spec = `[${p.material} ${p.infill}% ${p.wallLoops}w${p.color ? ` ${p.color}` : ""}]`;
            return `${p.name} x${p.quantity} ${spec}`;
          })
          .join("; ");
        notes = [
          "Instant checkout (self-service).",
          contactEmail ? `Email: ${contactEmail}.` : "",
          `Material: Mixed (${matsLabel}).`,
          `Infill: mixed, mixed walls, qty ${totalQty}.`,
          `Total price: €${totalPaidEuros}.`,
          names.length ? `Files: ${names.join(", ")}.` : "",
          paths.length ? `Paths: ${paths.join(", ")}.` : "",
          language ? `Language: ${language}.` : "",
          `Parts: ${partsSummary}.`,
        ].filter(Boolean).join(" ");
      }

      // ── DB insert ────────────────────────────────────────────────────────────
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const { data: orderRow, error: orderErr } = await supabase
        .from("orders")
        .insert({
          product_title: resolvedProductTitle,
          customer_phone: (typeof contactPhone === "string" && contactPhone.trim()) || "see notes",
          customer_email: (typeof contactEmail === "string" && contactEmail.trim()) || null,
          status: "awaiting_payment",
          fulfillment,
          notes,
          photos: [],
          payment_method: "stripe",
          payment_status: "pending",
          file_paths: paths,
          pieces: enrichedPieces,
        })
        .select("id, order_number")
        .single();

      if (orderErr || !orderRow) {
        console.error("Order insert failed:", orderErr);
        return json({ error: "ORDER_INSERT_FAILED", details: orderErr?.message }, 500);
      }

      // ── Stripe session ───────────────────────────────────────────────────────
      const langStr = typeof language === "string" ? language : "";
      const lineItems = buildStripeLineItems(
        order,
        enrichedPieces.map((p: { name: string; quantity: number; material: string; infill: number; wallLoops: number; color: string | null }) => ({
          name: p.name,
          quantity: p.quantity,
          material: p.material,
          infill: p.infill,
          wallLoops: p.wallLoops,
          color: p.color ?? undefined,
        })),
        langStr,
      );

      const params = new URLSearchParams({ "mode": "payment" });

      for (let i = 0; i < lineItems.length; i++) {
        params.set(`line_items[${i}][quantity]`, "1");
        params.set(`line_items[${i}][price_data][currency]`, "eur");
        params.set(`line_items[${i}][price_data][unit_amount]`, String(lineItems[i].amount));
        params.set(`line_items[${i}][price_data][product_data][name]`, lineItems[i].name);
      }

      params.set("metadata[order_id]", orderRow.id);
      params.set("metadata[order_number]", String(orderRow.order_number));
      params.set("metadata[fulfillment]", fulfillment);
      params.set("metadata[pricing_version]", "2");
      params.set("metadata[part_count]", String(enrichedPieces.length));
      params.set("metadata[materials]", uniqueMats.join(",").slice(0, 200));

      params.set("success_url", `${SITE_URL}/?checkout=success`);
      params.set("cancel_url", `${SITE_URL}/?checkout=cancelled`);

      if (typeof ph_distinct_id === "string" && ph_distinct_id.trim()) params.set("metadata[ph_distinct_id]", ph_distinct_id.trim().slice(0, 500));
      if (typeof ph_session_id === "string" && ph_session_id.trim()) params.set("metadata[ph_session_id]", ph_session_id.trim().slice(0, 500));
      if (typeof utm_source === "string" && utm_source.trim()) params.set("metadata[utm_source]", utm_source.trim().slice(0, 100));
      if (typeof utm_medium === "string" && utm_medium.trim()) params.set("metadata[utm_medium]", utm_medium.trim().slice(0, 100));
      if (typeof utm_content === "string" && utm_content.trim()) params.set("metadata[utm_content]", utm_content.trim().slice(0, 100));
      if (typeof utm_campaign === "string" && utm_campaign.trim()) params.set("metadata[utm_campaign]", utm_campaign.trim().slice(0, 100));
      if (typeof product_type === "string" && product_type.trim()) params.set("metadata[product_type]", product_type.trim().slice(0, 100));
      if (typeof customer_ref === "string" && customer_ref.trim()) params.set("metadata[customer_ref]", customer_ref.trim().slice(0, 100));

      if (fulfillment === "shipping") {
        params.set("shipping_address_collection[allowed_countries][0]", "ES");
        params.set("phone_number_collection[enabled]", "true");
        const isEs2 = langStr.toLowerCase().startsWith("es");
        const isCa2 = langStr.toLowerCase().startsWith("ca");
        const shippingLabel = isEs2 ? "Envío estándar" : isCa2 ? "Enviament estàndard" : "Standard shipping";
        params.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
        params.set("shipping_options[0][shipping_rate_data][display_name]", shippingLabel);
        params.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", "600");
        params.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
      }

      if (typeof contactEmail === "string" && contactEmail.trim()) {
        params.set("customer_email", contactEmail.trim());
      }

      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Stripe v2 checkout session failed:", err);
        return json({ error: "STRIPE_SESSION_FAILED", details: err }, 502);
      }

      const session = await res.json();
      console.log(`Instant checkout v2 session created for order ${orderRow.id} (#${orderRow.order_number})`);

      return json({ checkoutUrl: session.url });
    }

    // ── LEGACY PATH (untouched) ────────────────────────────────────────────────
    const {
      material, color, infill, wallLoops, quantity,
      filePaths, fileNames, exactPrice, contactEmail, contactPhone, language,
      fulfillment,
      productName,       // optional: human-readable product name (parts pages)
      shippingRateEuros, // optional: add a separate shipping_option line (parts pages)
      pieces,
      // B1: visitor identity threaded from client for Stripe metadata
      ph_distinct_id, ph_session_id,
      utm_source, utm_medium, utm_content, utm_campaign,
      product_type, part_slug, customer_ref,
    } = body ?? {};

    const price = Number(exactPrice);
    if (!Number.isFinite(price) || price <= 0) {
      return json({ error: "INVALID_PRICE" }, 400);
    }
    if (price > MAX_PRICE) {
      console.warn(`Rejected instant checkout: price ${price} exceeds ceiling (IP: ${clientIP})`);
      return json({ error: "PRICE_ABOVE_INSTANT_LIMIT" }, 400);
    }
    if (typeof material !== "string" || !ALLOWED_MATERIALS.includes(material)) {
      return json({ error: "INVALID_MATERIAL" }, 400);
    }
    if (fulfillment !== "pickup" && fulfillment !== "shipping") {
      return json({ error: "INVALID_FULFILLMENT" }, 400);
    }
    if (!STRIPE_SECRET_KEY) return json({ error: "STRIPE_NOT_CONFIGURED" }, 500);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const names: string[] = Array.isArray(fileNames) ? fileNames.map(String) : [];
    const paths: string[] = Array.isArray(filePaths) ? filePaths.map(String) : [];
    const qty = Number(quantity) > 0 ? Number(quantity) : 1;

    const piecesStr = Array.isArray(pieces) && pieces.length > 0
      ? `Pieces: ${pieces.map((p: { name: string; quantity: number }) => `${p.name} x${p.quantity}`).join(", ")}.`
      : "";

    const notes = [
      "Instant checkout (self-service, ≤ €35).",
      contactEmail ? `Email: ${contactEmail}.` : "",
      `Material: ${material}${color ? ` / ${color}` : ""}.`,
      `Infill: ${infill ?? "n/a"}, ${wallLoops ?? "n/a"} walls, qty ${qty}.`,
      `Total price: €${price.toFixed(2)}.`,
      names.length ? `Files: ${names.join(", ")}.` : "",
      paths.length ? `Paths: ${paths.join(", ")}.` : "",
      language ? `Language: ${language}.` : "",
      piecesStr,
    ].filter(Boolean).join(" ");

    const resolvedProductTitle =
      typeof productName === "string" && productName.trim()
        ? productName.trim()
        : `3D Print — ${material}${color ? ` (${color})` : ""}`;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        product_title: resolvedProductTitle,
        customer_phone: (typeof contactPhone === "string" && contactPhone.trim()) || "see notes",
        customer_email:
          (typeof contactEmail === "string" && contactEmail.trim()) || null,
        status: "awaiting_payment",
        fulfillment,
        notes,
        photos: [],
        payment_method: "stripe",
        payment_status: "pending",
        file_paths: paths,
        pieces: Array.isArray(pieces) ? pieces : null,
      })
      .select("id, order_number")
      .single();

    if (orderErr || !order) {
      console.error("Order insert failed:", orderErr);
      return json({ error: "ORDER_INSERT_FAILED", details: orderErr?.message }, 500);
    }

    const params = new URLSearchParams({
      "mode": "payment",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "eur",
      "line_items[0][price_data][unit_amount]": String(Math.round(price * 100)),
      "line_items[0][price_data][product_data][name]":
        resolvedProductTitle,
      "metadata[order_id]": order.id,
      "metadata[order_number]": String(order.order_number),
      "metadata[fulfillment]": fulfillment,
      "success_url": `${SITE_URL}/?checkout=success`,
      "cancel_url": `${SITE_URL}/?checkout=cancelled`,
    });
    // B1: visitor identity — added to metadata for server-side order_paid event
    if (typeof ph_distinct_id === "string" && ph_distinct_id.trim()) params.set("metadata[ph_distinct_id]", ph_distinct_id.trim().slice(0, 500));
    if (typeof ph_session_id === "string" && ph_session_id.trim()) params.set("metadata[ph_session_id]", ph_session_id.trim().slice(0, 500));
    if (typeof utm_source === "string" && utm_source.trim()) params.set("metadata[utm_source]", utm_source.trim().slice(0, 100));
    if (typeof utm_medium === "string" && utm_medium.trim()) params.set("metadata[utm_medium]", utm_medium.trim().slice(0, 100));
    if (typeof utm_content === "string" && utm_content.trim()) params.set("metadata[utm_content]", utm_content.trim().slice(0, 100));
    if (typeof utm_campaign === "string" && utm_campaign.trim()) params.set("metadata[utm_campaign]", utm_campaign.trim().slice(0, 100));
    if (typeof product_type === "string" && product_type.trim()) params.set("metadata[product_type]", product_type.trim().slice(0, 100));
    if (typeof part_slug === "string" && part_slug.trim()) params.set("metadata[part_slug]", part_slug.trim().slice(0, 200));
    if (typeof customer_ref === "string" && customer_ref.trim()) params.set("metadata[customer_ref]", customer_ref.trim().slice(0, 100));
    if (fulfillment === "shipping") {
      params.set("shipping_address_collection[allowed_countries][0]", "ES");
      params.set("phone_number_collection[enabled]", "true");
    }
    const shippingCents =
      typeof shippingRateEuros === "number" && shippingRateEuros > 0
        ? Math.round(shippingRateEuros * 100)
        : 0;
    if (shippingCents > 0) {
      params.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
      params.set("shipping_options[0][shipping_rate_data][display_name]", "Envío estándar");
      params.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(shippingCents));
      params.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
    }
    if (typeof contactEmail === "string" && contactEmail.trim()) {
      params.set("customer_email", contactEmail.trim());
    }

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Stripe checkout session failed:", err);
      return json({ error: "STRIPE_SESSION_FAILED", details: err }, 502);
    }

    const session = await res.json();
    console.log(`Instant checkout session created for order ${order.id} (#${order.order_number})`);

    return json({ checkoutUrl: session.url });
  } catch (err: any) {
    console.error("create-instant-checkout error:", err?.message);
    return json({ error: "INTERNAL_ERROR", message: err?.message ?? "unknown" }, 500);
  }
});
