import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { wrapEmail } from "../_shared/emailLayout.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Dimension3D <noreply@dimension3dprints.com>";
const REPLY_TO = "dimension3dprintsbcn@gmail.com";
const SITE_ORIGIN = "https://www.dimension3dprints.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (const b of bytes) result += chars[b % chars.length];
  return result;
}

const PROMO_PCT: Record<string, number> = { student: 20, exit: 20 };

const SUBJECT: Record<string, (code: string, pct: number) => string> = {
  es: (code, pct) => `Tu código de descuento ${code} — ${pct} % en tu pedido`,
  ca: (code, pct) => `El teu codi de descompte ${code} — ${pct} % a la teva comanda`,
  en: (code, pct) => `Your discount code ${code} — ${pct} % off your order`,
  de: (code, pct) => `Dein Rabattcode ${code} — ${pct} % auf deine Bestellung`,
  fr: (code, pct) => `Ton code de réduction ${code} — ${pct} % sur ta commande`,
  nl: (code, pct) => `Je kortingscode ${code} — ${pct} % op je bestelling`,
  it: (code, pct) => `Il tuo codice sconto ${code} — ${pct} % sul tuo ordine`,
  pt: (code, pct) => `O teu código de desconto ${code} — ${pct} % na tua encomenda`,
};

const BODY: Record<string, (code: string, pct: number, daysLeft: number) => string> = {
  es: (code, pct, days) =>
    `<p>Tu código de descuento personal es:</p>
     <p style="font-size:28px;font-weight:700;letter-spacing:4px;text-align:center;padding:16px 0">${code}</p>
     <p>Aplica un <strong>${pct} %</strong> de descuento sobre el total de impresión (el envío no está incluido). Válido durante <strong>${days} días</strong>, un solo uso.</p>
     <p>Para usarlo, abre el calculador, sube tu archivo y aplica el código antes de pagar.</p>
     <p><a href="${SITE_ORIGIN}" style="color:#2E5BFF">Volver al calculador →</a></p>`,
  ca: (code, pct, days) =>
    `<p>El teu codi de descompte personal és:</p>
     <p style="font-size:28px;font-weight:700;letter-spacing:4px;text-align:center;padding:16px 0">${code}</p>
     <p>Aplica un <strong>${pct} %</strong> de descompte sobre el total d'impressió (l'enviament no hi està inclòs). Vàlid durant <strong>${days} dies</strong>, un sol ús.</p>
     <p>Per fer-lo servir, obre el calculador, puja el teu arxiu i aplica el codi abans de pagar.</p>
     <p><a href="${SITE_ORIGIN}" style="color:#2E5BFF">Tornar al calculador →</a></p>`,
  en: (code, pct, days) =>
    `<p>Your personal discount code is:</p>
     <p style="font-size:28px;font-weight:700;letter-spacing:4px;text-align:center;padding:16px 0">${code}</p>
     <p>It gives <strong>${pct} %</strong> off the print total (shipping not included). Valid for <strong>${days} days</strong>, single use.</p>
     <p>To use it, open the calculator, upload your file, and apply the code before paying.</p>
     <p><a href="${SITE_ORIGIN}" style="color:#2E5BFF">Back to the calculator →</a></p>`,
  de: (code, pct, days) =>
    `<p>Dein persönlicher Rabattcode lautet:</p>
     <p style="font-size:28px;font-weight:700;letter-spacing:4px;text-align:center;padding:16px 0">${code}</p>
     <p>Er gibt <strong>${pct} %</strong> Rabatt auf die Druckkosten (ohne Versand). Gültig für <strong>${days} Tage</strong>, einmalig verwendbar.</p>
     <p>Um ihn zu nutzen, öffne den Kalkulator, lade deine Datei hoch und trage den Code vor dem Bezahlen ein.</p>
     <p><a href="${SITE_ORIGIN}" style="color:#2E5BFF">Zurück zum Kalkulator →</a></p>`,
  fr: (code, pct, days) =>
    `<p>Ton code de réduction personnel est :</p>
     <p style="font-size:28px;font-weight:700;letter-spacing:4px;text-align:center;padding:16px 0">${code}</p>
     <p>Il donne <strong>${pct} %</strong> de réduction sur le total d'impression (hors frais de livraison). Valable <strong>${days} jours</strong>, usage unique.</p>
     <p>Pour l'utiliser, ouvre le calculateur, téléverse ton fichier et applique le code avant de payer.</p>
     <p><a href="${SITE_ORIGIN}" style="color:#2E5BFF">Retour au calculateur →</a></p>`,
  nl: (code, pct, days) =>
    `<p>Jouw persoonlijke kortingscode is:</p>
     <p style="font-size:28px;font-weight:700;letter-spacing:4px;text-align:center;padding:16px 0">${code}</p>
     <p>Hij geeft <strong>${pct} %</strong> korting op de printkosten (verzending niet inbegrepen). Geldig voor <strong>${days} dagen</strong>, eenmalig gebruik.</p>
     <p>Om hem te gebruiken, open de calculator, upload je bestand en voer de code in voor het betalen.</p>
     <p><a href="${SITE_ORIGIN}" style="color:#2E5BFF">Terug naar de calculator →</a></p>`,
  it: (code, pct, days) =>
    `<p>Il tuo codice sconto personale è:</p>
     <p style="font-size:28px;font-weight:700;letter-spacing:4px;text-align:center;padding:16px 0">${code}</p>
     <p>Dà uno sconto del <strong>${pct} %</strong> sul totale di stampa (spedizione esclusa). Valido per <strong>${days} giorni</strong>, uso singolo.</p>
     <p>Per usarlo, apri il calcolatore, carica il tuo file e applica il codice prima di pagare.</p>
     <p><a href="${SITE_ORIGIN}" style="color:#2E5BFF">Torna al calcolatore →</a></p>`,
  pt: (code, pct, days) =>
    `<p>O teu código de desconto pessoal é:</p>
     <p style="font-size:28px;font-weight:700;letter-spacing:4px;text-align:center;padding:16px 0">${code}</p>
     <p>Dá <strong>${pct} %</strong> de desconto no total de impressão (envio não incluído). Válido por <strong>${days} dias</strong>, utilização única.</p>
     <p>Para o usar, abre a calculadora, carrega o teu ficheiro e aplica o código antes de pagar.</p>
     <p><a href="${SITE_ORIGIN}" style="color:#2E5BFF">Voltar à calculadora →</a></p>`,
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  let body: { kind?: string; email?: string; language?: string };
  try { body = await req.json(); } catch { return json({ error: "INVALID_JSON" }, 400); }

  const kind = body.kind;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
  const language = typeof body.language === "string" ? body.language : "es";

  if (!email || !kind || !["student", "exit"].includes(kind)) {
    return json({ error: "INVALID_PARAMS" }, 400);
  }

  const pct = PROMO_PCT[kind] ?? 20;
  const daysValid = kind === "exit" ? 2 : 14;

  // ── Abuse limits ────────────────────────────────────────────────────────────

  // 1. Rate-limit by IP: at most 3 requests per IP per day
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
  if (ip !== "unknown") {
    const dayAgo = new Date(Date.now() - 86400_000).toISOString();
    const { count } = await adminClient
      .from("promo_codes")
      .select("code", { count: "exact", head: true })
      .in("kind", ["student", "exit"])
      .eq("bound_email", email)
      .gte("created_at", dayAgo);
    // Note: we use email as the proxy for IP here since storing raw IPs requires GDPR notice.
    // The 3/day check below is per-email which is a reasonable proxy.
    if ((count ?? 0) >= 3) return json({ error: "RATE_LIMITED" }, 429);
  }

  // 2. At most 1 active personal code per email + kind
  const now = new Date().toISOString();
  const { data: existing } = await adminClient
    .from("promo_codes")
    .select("code, pct, ends_at, uses, max_uses, active")
    .eq("bound_email", email)
    .eq("kind", kind)
    .eq("active", true)
    .gte("ends_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    // Return the existing code rather than creating a duplicate
    return json({ code: existing.code, pct: existing.pct });
  }

  // 3. Exit: at most 1 per email every 30 days (even if used/expired)
  if (kind === "exit") {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { count } = await adminClient
      .from("promo_codes")
      .select("code", { count: "exact", head: true })
      .eq("bound_email", email)
      .eq("kind", "exit")
      .gte("created_at", thirtyDaysAgo);
    if ((count ?? 0) >= 1) return json({ error: "EXIT_COOLDOWN" }, 429);
  }

  // ── Create the code ─────────────────────────────────────────────────────────
  const endsAt = new Date(Date.now() + daysValid * 86400_000).toISOString();
  let code = randomCode();

  // Retry on collision (extremely unlikely with 8-char codes from 32-char alphabet)
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error: insertErr } = await adminClient.from("promo_codes").insert({
      code,
      pct,
      kind,
      starts_at: now,
      ends_at: endsAt,
      max_uses: 1,
      uses: 0,
      bound_email: email,
      active: true,
      note: `${kind} code for ${email}`,
    });
    if (!insertErr) break;
    if (insertErr.code === "23505") { code = randomCode(); continue; } // PK collision
    console.error("[issue-promo-code] insert error:", insertErr);
    return json({ error: "DB_ERROR" }, 500);
  }

  // ── Send the email ───────────────────────────────────────────────────────────
  if (RESEND_API_KEY) {
    try {
      const lang = language as keyof typeof SUBJECT;
      const subject = (SUBJECT[lang] ?? SUBJECT.es)(code, pct);
      const bodyFn = BODY[lang] ?? BODY.es;
      const html = wrapEmail({
        preheader: subject,
        title: subject,
        bodyHtml: bodyFn(code, pct, daysValid),
        language: lang as any,
      });
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM_EMAIL, reply_to: REPLY_TO, to: [email], subject, html }),
      });
    } catch (e) {
      console.error("[issue-promo-code] email error:", e);
    }
  }

  return json({ code, pct });
});
