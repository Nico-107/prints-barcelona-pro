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

// design_request_received server-side event, 3s timeout
async function captureDesignRequestReceived(
  distinctId: string,
  properties: Record<string, unknown>,
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
        event: "design_request_received",
        distinct_id: distinctId,
        properties: { ...properties, $process_person_profile: false },
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

interface PieceSpec {
  name: string;
  quantity: number;
  path?: string | null;
  material?: string | null;
  color?: string | null;
  infill?: number | null;
  wallLoops?: number | null;
  quality?: string | null;
  supports?: boolean | null;
  orientationName?: string | null;
  multicolour?: boolean | null;
  gramsPerUnit?: number | null;
  est?: { gramsPerUnit?: number; hours?: number; supportCm3?: number } | null;
}

interface QuoteRequestPayload {
  filePaths?: string[];
  fileNames?: string[];
  contactEmail?: string | null;
  contactPhone?: string | null;
  material?: string;
  color?: string | null;
  infillPct?: number;
  wallLoops?: number;
  totalGrams?: number;
  totalHours?: number;
  totalUnits?: number;
  priceLow?: number;
  priceHigh?: number;
  priceExact?: number;
  language?: string;
  urgency?: string | null;
  sourceCity?: string | null;
  pieces?: PieceSpec[] | null;
  ph_distinct_id?: string | null;
  quote_id?: string | null;
  // Source tracking (Item 6)
  sourcePath?: string | null;
  sourceUrl?: string | null;
  pageLanguage?: string | null;
  browserLanguage?: string | null;
  referrer?: string | null;
  utm?: Record<string, string> | null;
  fulfillment?: string | null;
  // Design-request fields
  requestType?: "design" | null;
  description?: string | null;
  dimensions?: string | null;
  quantity?: string | null;
  photosFailed?: number;
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
      totalGrams, totalHours, totalUnits, priceLow, priceHigh, priceExact, language,
      urgency, sourceCity, pieces, ph_distinct_id, quote_id,
      sourcePath, sourceUrl, pageLanguage, browserLanguage, referrer, utm, fulfillment,
      requestType, description, dimensions, quantity, photosFailed,
    } = payload;

    if (!contactEmail?.trim() && !contactPhone?.trim()) {
      return new Response(
        JSON.stringify({ error: "At least one contact field required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const safeEmail = contactEmail ? sanitize(contactEmail.trim()) : null;
    const safePhone = contactPhone ? sanitize(contactPhone.trim()) : null;
    const safeLang = language ? sanitize(language) : "es";

    const recipients =
      sourceCity?.toLowerCase().includes("sevilla") ||
      sourceCity?.toLowerCase().includes("seville")
        ? ["3d.kayda@gmail.com", "dimension3dprintsbcn@gmail.com"]
        : ["011107miko@gmail.com", "dimension3dprintsbcn@gmail.com"];

    // ── DESIGN REQUEST BRANCH ─────────────────────────────────────────────────
    if (requestType === "design") {
      const photoPaths = filePaths?.length ? filePaths : [];
      const photoNames = fileNames?.length ? fileNames : [];

      const photoLinks: { name: string; url: string }[] = [];
      for (let i = 0; i < photoPaths.length; i++) {
        const { data, error } = await supabase.storage
          .from("print-requests")
          .createSignedUrl(photoPaths[i], 60 * 60 * 24 * 7);
        if (!error && data?.signedUrl) {
          photoLinks.push({ name: photoNames[i] ?? photoPaths[i], url: data.signedUrl });
        } else {
          console.error("Signed URL error for photo", photoPaths[i], error);
        }
      }

      const safeDesc = description ? sanitize(description.trim()) : null;
      const safeDims = dimensions ? sanitize(dimensions.trim()) : null;
      const safeQty  = quantity ? sanitize(quantity.trim()) : null;

      const photoLinksHtml = photoLinks.length
        ? photoLinks.map(f =>
            `<p style="margin:8px 0;">
              <a href="${f.url}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:8px 16px;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">
                ⬇ ${sanitize(f.name)}
              </a>
            </p>`
          ).join("\n")
        : "<p style='color:#6b7280;font-size:13px;'>Sin fotos adjuntas.</p>";

      const photosSection = `
        <div style="background:#ecfdf5;padding:20px;border-radius:8px;margin:20px 0;">
          <h2 style="color:#065f46;margin-top:0;">Fotos de referencia (${photoLinks.length})</h2>
          ${photoLinksHtml}
          ${photoLinks.length > 0
            ? `<p style="color:#6b7280;font-size:12px;margin-top:12px;">Los enlaces expiran en 7 días.</p>`
            : ""}
          ${(photosFailed ?? 0) > 0
            ? `<p style="color:#b91c1c;font-weight:600;font-size:13px;margin-top:8px;">⚠ ${photosFailed} foto(s) no se pudieron subir.</p>`
            : ""}
        </div>`;

      const contactBlock = `
        <div style="background:#f1f5f9;padding:20px;border-radius:8px;margin:20px 0;">
          <h2 style="color:#334155;margin-top:0;">Contacto del cliente</h2>
          ${safeEmail ? `<p><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color:#0284c7;">${safeEmail}</a></p>` : ""}
          ${safePhone ? `<p><strong>WhatsApp / Teléfono:</strong> ${safePhone}</p>` : ""}
          <p><strong>Idioma:</strong> ${safeLang}</p>
        </div>`;

      const detailsBlock = `
        <div style="background:#fffbeb;padding:20px;border-radius:8px;margin:20px 0;">
          <h2 style="color:#92400e;margin-top:0;">Detalles de la solicitud</h2>
          ${safeDesc  ? `<p><strong>Descripción:</strong><br>${safeDesc.replace(/\n/g, "<br>")}</p>` : ""}
          ${safeDims  ? `<p><strong>Dimensiones:</strong> ${safeDims}</p>` : ""}
          ${safeQty   ? `<p><strong>Cantidad:</strong> ${safeQty}</p>` : ""}
        </div>`;

      console.log(`Processing design request (IP: ${clientIP})`);

      const designEmailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Dimension3D <noreply@dimension3dprints.com>",
          to: recipients,
          subject: `[DISEÑO] Nueva solicitud de diseño — ${safeEmail ?? safePhone ?? "sin contacto"}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <h1 style="color:#0f172a;">Nueva solicitud de diseño a medida</h1>
              ${contactBlock}
              ${detailsBlock}
              ${photosSection}
              <p style="color:#6b7280;font-size:14px;">
                Enviado automáticamente desde el formulario de diseño de Dimension3D.
              </p>
            </div>
          `,
        }),
      });

      if (!designEmailResponse.ok) {
        const errorText = await designEmailResponse.text();
        console.error("Resend API error (design):", designEmailResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: "EMAIL_SEND_FAILED", details: errorText }),
          { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }

      const designEmailData = await designEmailResponse.json();
      console.log("Design request email sent:", designEmailData.id);

      // design_request_received — awaited so the event lands before the response
      const srvDesignId = "srv_design_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
      await captureDesignRequestReceived(srvDesignId, {
        has_photo: photoLinks.length > 0,
        photo_count: photoLinks.length,
        language: safeLang,
      });

      return new Response(JSON.stringify({ success: true, emailId: designEmailData.id }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // ── STL QUOTE REQUEST BRANCH ──────────────────────────────────────────────

    if (!filePaths?.length) {
      return new Response(
        JSON.stringify({ error: "No files provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Generate a 7-day signed URL for each uploaded file
    const fileLinks: { name: string; url: string }[] = [];
    const pathToUrl: Record<string, string> = {};
    for (let i = 0; i < filePaths.length; i++) {
      const { data, error } = await supabase.storage
        .from("print-requests")
        .createSignedUrl(filePaths[i], 60 * 60 * 24 * 7);
      if (!error && data?.signedUrl) {
        fileLinks.push({ name: fileNames?.[i] ?? filePaths[i], url: data.signedUrl });
        pathToUrl[filePaths[i]] = data.signedUrl;
      } else {
        console.error("Signed URL error for", filePaths[i], error);
      }
    }

    const safeMaterial = sanitize(material ?? "");
    const safeColor = color ? sanitize(color.trim()) : null;
    const safeUrgency = urgency ? sanitize(urgency.trim()) : "Estándar";

    const wallsLabel =
      (wallLoops ?? 2) === 2 ? "2 (standard)" :
      (wallLoops ?? 2) === 3 ? "3 (strong)" :
      "4 (extra strong)";

    const fileLinksHtml = fileLinks.map(f =>
      `<p style="margin:8px 0;">
        <a href="${f.url}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:8px 16px;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">
          ⬇ ${sanitize(f.name)}
        </a>
      </p>`
    ).join("\n");

    const KNOWN_QUOTE_MATERIALS = new Set(["PLA","PETG","HIPS","ABS","ASA","TPU","Nylon","PC","PVA","PLA-CF","PETG-CF","Nylon-CF"]);

    const stlSectionHtml = pieces?.length
      ? `<div style="background:#ecfdf5;padding:20px;border-radius:8px;margin:20px 0;">
          <h2 style="color:#065f46;margin-top:0;">Archivos STL — por pieza</h2>
          ${pieces.map(p => {
            const url = p.path ? (pathToUrl[p.path] ?? null) : null;
            const linkHtml = url
              ? `<a href="${url}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:6px 14px;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">⬇ ${sanitize(p.name)}</a>`
              : `<span style="font-size:13px;font-weight:600;">${sanitize(p.name)}</span>`;
            const specParts: string[] = [];
            if (p.material && KNOWN_QUOTE_MATERIALS.has(p.material)) specParts.push(sanitize(p.material));
            if (p.infill != null) specParts.push(`${sanitize(String(p.infill))}% relleno`);
            if (p.wallLoops != null) specParts.push(`${sanitize(String(p.wallLoops))} paredes`);
            if (p.quality) specParts.push(sanitize(p.quality));
            if (p.supports != null) specParts.push(p.supports ? "con soportes" : "sin soportes");
            if (p.orientationName) specParts.push(sanitize(p.orientationName));
            if (p.est?.gramsPerUnit != null) specParts.push(`${Number(p.est.gramsPerUnit).toFixed(1)} g`);
            if (p.color) specParts.push(sanitize(p.color.trim()));
            const specLine = specParts.length > 0
              ? `<br><span style="font-size:12px;color:#6b7280;">${specParts.join(" · ")}</span>`
              : "";
            return `<p style="margin:8px 0;">${linkHtml} &times; ${p.quantity}${specLine}</p>`;
          }).join("\n")}
          <p style="font-weight:bold;font-size:14px;margin:12px 0 4px 0;">Total: ${pieces.reduce((s, p) => s + p.quantity, 0)} piezas</p>
          <p style="color:#6b7280;font-size:12px;margin-top:8px;">Los enlaces expiran en 7 días.</p>
        </div>`
      : `<div style="background:#ecfdf5;padding:20px;border-radius:8px;margin:20px 0;">
          <h2 style="color:#065f46;margin-top:0;">Archivos STL (${fileLinks.length})</h2>
          ${fileLinksHtml || "<p>Sin archivos adjuntos.</p>"}
          <p style="color:#6b7280;font-size:12px;margin-top:12px;">Los enlaces expiran en 7 días.</p>
        </div>`;

    console.log(`Processing quote request: ${safeMaterial} ${infillPct ?? 0}% ${wallsLabel} (IP: ${clientIP})`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dimension3D <noreply@dimension3dprints.com>",
        to: recipients,
        subject: (() => {
          const lang = (pageLanguage ?? safeLang ?? "es").toLowerCase();
          const flag = lang === "en" ? "🇬🇧" : lang === "de" ? "🇩🇪" : lang === "fr" ? "🇫🇷" : lang === "it" ? "🇮🇹" : lang === "nl" ? "🇳🇱" : lang === "pt" ? "🇵🇹" : "🇪🇸";
          const path = sourcePath ? sourcePath : "web";
          const price = priceExact != null ? `€${Number(priceExact).toFixed(2)}` : `€${Math.round(priceLow ?? 0)}–€${Math.round(priceHigh ?? 0)}`;
          return `[REVISIÓN] ${flag} ${lang.toUpperCase()} · ${path} — ${safeMaterial} · ${price}`;
        })(),
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#0f172a;">
            <h1 style="color:#0f172a;font-size:20px;margin-bottom:4px;">Nueva solicitud de presupuesto</h1>
            ${quote_id ? `<p style="font-size:12px;color:#9ca3af;margin-top:0;">ID: ${sanitize(quote_id)}</p>` : ""}

            <div style="background:#f1f5f9;padding:20px;border-radius:8px;margin:16px 0;">
              <h2 style="color:#334155;margin-top:0;font-size:15px;">Contacto</h2>
              ${safeEmail ? `<p style="margin:4px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color:#0284c7;">${safeEmail}</a></p>` : ""}
              ${safePhone ? `<p style="margin:4px 0;"><strong>WhatsApp / Tel:</strong> ${safePhone}</p>` : ""}
              <p style="margin:4px 0;"><strong>Idioma:</strong> ${safeLang}</p>
            </div>

            <div style="background:#fffbeb;padding:20px;border-radius:8px;margin:16px 0;">
              <h2 style="color:#92400e;margin-top:0;font-size:15px;">Detalles del presupuesto</h2>
              <p style="margin:4px 0;font-size:15px;"><strong>Urgencia:</strong> ${safeUrgency}</p>
              ${pieces?.some(p => p.material && KNOWN_QUOTE_MATERIALS.has(p.material))
                ? `<p style="margin:4px 0;"><strong>Especificaciones:</strong> por pieza (ver STL)</p>`
                : `<p style="margin:4px 0;"><strong>Material:</strong> ${safeMaterial}</p>
              ${safeColor ? `<p style="margin:4px 0;"><strong>Color:</strong> ${safeColor}</p>` : ""}
              <p style="margin:4px 0;"><strong>Relleno:</strong> ${infillPct ?? 0}%</p>
              <p style="margin:4px 0;"><strong>Perímetros:</strong> ${wallsLabel}</p>`}
              <p style="margin:4px 0;"><strong>Peso:</strong> ${Number(totalGrams ?? 0).toFixed(1)} g &nbsp;·&nbsp; <strong>Tiempo:</strong> ${Number(totalHours ?? 0).toFixed(1)} h &nbsp;·&nbsp; <strong>Unidades:</strong> ${totalUnits ?? 0}</p>
              <p style="margin:4px 0;"><strong>Precio mostrado:</strong> €${Math.round(priceLow ?? 0)}–€${Math.round(priceHigh ?? 0)}</p>
              ${priceExact != null ? `<p style="font-size:16px;font-weight:bold;color:#065f46;margin:8px 0 0 0;">Precio calculado: EUR ${Number(priceExact).toFixed(2)}</p>` : ""}
              ${fulfillment ? `<p style="margin:4px 0;"><strong>Fulfillment:</strong> ${sanitize(fulfillment)}</p>` : ""}
            </div>

            ${stlSectionHtml}

            <div style="background:#f0f9ff;padding:16px;border-radius:8px;margin:16px 0;font-size:13px;">
              <h2 style="color:#0369a1;margin-top:0;font-size:14px;">Origen</h2>
              ${sourcePath ? `<p style="margin:3px 0;"><strong>Página:</strong> ${sanitize(sourcePath)}</p>` : ""}
              ${pageLanguage ? `<p style="margin:3px 0;"><strong>Idioma página:</strong> ${sanitize(pageLanguage)}</p>` : ""}
              ${browserLanguage ? `<p style="margin:3px 0;"><strong>Idioma navegador:</strong> ${sanitize(browserLanguage)}</p>` : ""}
              ${referrer ? `<p style="margin:3px 0;"><strong>Referrer:</strong> ${sanitize(referrer)}</p>` : ""}
              ${utm ? `<p style="margin:3px 0;"><strong>UTM:</strong> ${sanitize(JSON.stringify(utm))}</p>` : ""}
            </div>

            <p style="color:#9ca3af;font-size:12px;margin-top:16px;">
              Dimension3D — calculadora automática
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

    // Source tracking — service-role update (column may not exist on older envs; try/catch is intentional)
    if (quote_id) {
      try {
        await supabase.from("quote_requests").update({
          source_path: sourcePath ?? null,
          page_language: pageLanguage ?? null,
          browser_language: browserLanguage ?? null,
          referrer_domain: referrer ?? null,
          utm_json: utm ? JSON.stringify(utm) : null,
          fulfillment: fulfillment ?? null,
        }).eq("id", quote_id);
      } catch (srcErr) {
        console.log("source tracking update skipped (column may not exist):", srcErr);
      }
    }

    // B3: quote_received — awaited so the event lands before the response
    const phRawId = (typeof ph_distinct_id === "string" && ph_distinct_id.trim()) ? ph_distinct_id.trim() : null;
    const srvId = phRawId ?? ("srv_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16));
    const contactType = safeEmail && safePhone ? "both" : safeEmail ? "email" : "phone";
    await captureQuoteReceived(srvId, {
      quote_id: quote_id ?? null,
      material,
      total_units: totalUnits,
      price_low: Math.round(priceLow ?? 0),
      price_high: Math.round(priceHigh ?? 0),
      price_exact: priceExact != null ? Number(priceExact) : null,
      file_count: filePaths?.length ?? 0,
      source_path: sourcePath ?? null,
      source_city: sourceCity ?? null,
      contact_type: contactType,
    }, !!phRawId);

    // Customer confirmation email — sent if email present; failure does not block success
    if (safeEmail) {
      const refDisplay = quote_id ? quote_id.slice(0, 8).toUpperCase() : null;
      const fileList = (fileNames?.length ? fileNames : filePaths ?? [])
        .map(n => `<li style="margin:4px 0;">${sanitize(n)}</li>`).join("\n");
      const customerSubjects: Record<string, string> = {
        es: "Hemos recibido tu solicitud de impresión 3D",
        ca: "Hem rebut la teva sol·licitud d'impressió 3D",
        en: "We received your 3D printing request",
        de: "Wir haben Ihre 3D-Druckanfrage erhalten",
        fr: "Nous avons reçu votre demande d'impression 3D",
        it: "Abbiamo ricevuto la tua richiesta di stampa 3D",
        nl: "Wij hebben uw 3D-printaanvraag ontvangen",
        pt: "Recebemos o seu pedido de impressão 3D",
      };
      const customerIntros: Record<string, string> = {
        es: "Hemos recibido tu solicitud de presupuesto. Te confirmaremos el precio exacto en menos de 1 hora en días laborables.",
        ca: "Hem rebut la teva sol·licitud de pressupost. Et confirmarem el preu exacte en menys d'1 hora en dies laborables.",
        en: "We received your quote request. We'll confirm the exact price within 1 hour on business days.",
        de: "Wir haben Ihre Angebotsanfrage erhalten. Wir bestätigen den genauen Preis innerhalb von 1 Stunde an Werktagen.",
        fr: "Nous avons reçu votre demande de devis. Nous vous confirmerons le prix exact en moins d'1 heure les jours ouvrés.",
        it: "Abbiamo ricevuto la tua richiesta di preventivo. Confermeremo il prezzo esatto entro 1 ora nei giorni lavorativi.",
        nl: "Wij hebben uw offerteaanvraag ontvangen. Wij bevestigen de exacte prijs binnen 1 uur op werkdagen.",
        pt: "Recebemos o seu pedido de orçamento. Confirmaremos o preço exato em menos de 1 hora nos dias úteis.",
      };
      const customerRefLabels: Record<string, string> = {
        es: "Referencia", ca: "Referència", en: "Reference",
        de: "Referenz", fr: "Référence", it: "Riferimento", nl: "Referentie", pt: "Referência",
      };
      const whatsappLabel: Record<string, string> = {
        es: "Escríbenos por WhatsApp", ca: "Escriu-nos per WhatsApp", en: "Message us on WhatsApp",
        de: "Schreiben Sie uns auf WhatsApp", fr: "Écrivez-nous sur WhatsApp",
        it: "Scrivici su WhatsApp", nl: "Stuur ons een bericht op WhatsApp", pt: "Escreva-nos no WhatsApp",
      };
      const lang = safeLang in customerSubjects ? safeLang : "en";
      try {
        const custResp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Dimension3D <noreply@dimension3dprints.com>",
            to: [safeEmail],
            subject: customerSubjects[lang],
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                <h1 style="color:#0f172a;">${customerSubjects[lang]}</h1>
                <p style="font-size:15px;color:#334155;">${customerIntros[lang]}</p>
                ${refDisplay ? `<p style="font-size:13px;color:#6b7280;">${customerRefLabels[lang]}: <strong>${refDisplay}</strong></p>` : ""}
                ${fileList ? `<div style="background:#f1f5f9;padding:16px;border-radius:8px;margin:16px 0;"><ul style="margin:0;padding-left:20px;">${fileList}</ul></div>` : ""}
                ${safeMaterial ? `<p style="font-size:14px;color:#334155;"><strong>Material:</strong> ${safeMaterial}</p>` : ""}
                ${totalUnits ? `<p style="font-size:14px;color:#334155;"><strong>Qty:</strong> ${totalUnits}</p>` : ""}
                ${priceExact != null ? `<p style="font-size:15px;font-weight:bold;color:#065f46;">~€${Number(priceExact).toFixed(2)}</p>` : ""}
                <p style="font-size:13px;color:#6b7280;margin-top:16px;">
                  <a href="https://wa.me/34672051147" style="color:#25d366;">${whatsappLabel[lang]}</a>
                </p>
                <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Dimension3D — dimension3dprints.com</p>
              </div>
            `,
          }),
        });
        if (!custResp.ok) {
          const t = await custResp.text();
          console.error("Customer email failed:", custResp.status, t);
        } else {
          const custData = await custResp.json();
          console.log("Customer confirmation email sent:", custData.id);
        }
      } catch (custErr) {
        console.error("Customer email error:", custErr);
      }
    }

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
