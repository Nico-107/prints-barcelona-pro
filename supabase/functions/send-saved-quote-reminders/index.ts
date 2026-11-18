// 4.2: Send one reminder email 24 h after a quote is saved, if not bought
// or unsubscribed. Triggered by an hourly Supabase cron schedule.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { wrapEmail, escapeHtml, renderButton } from "../_shared/emailLayout.ts";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_ORIGIN = "https://www.dimension3dprints.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Lang = "es" | "ca" | "en" | "de" | "fr" | "nl" | "it" | "pt";

const T: Record<Lang, {
  subject: string;
  title: string;
  preheader: string;
  body: string;
  promoBody: (code: string, pct: number) => string;
  cta: string;
  unsubscribe: string;
}> = {
  es: {
    subject: "Recordatorio: tu presupuesto de Dimension3D",
    title: "Tu presupuesto sigue aquí",
    preheader: "No te olvides de tu presupuesto. Todavía está disponible.",
    body: "Solo un recordatorio: tu presupuesto sigue disponible. Ábrelo cuando quieras.",
    promoBody: (code, pct) => `Además, puedes usar el código <strong>${escapeHtml(code)}</strong> para obtener un ${pct} % de descuento.`,
    cta: "Ver mi presupuesto",
    unsubscribe: "Cancelar recordatorios",
  },
  ca: {
    subject: "Recordatori: el teu pressupost de Dimension3D",
    title: "El teu pressupost segueix aquí",
    preheader: "No t'oblidis del teu pressupost. Encara està disponible.",
    body: "Només un recordatori: el teu pressupost segueix disponible. Obre'l quan vulguis.",
    promoBody: (code, pct) => `A més, pots usar el codi <strong>${escapeHtml(code)}</strong> per obtenir un ${pct} % de descompte.`,
    cta: "Veure el meu pressupost",
    unsubscribe: "Cancel·lar recordatoris",
  },
  en: {
    subject: "Reminder: your Dimension3D quote",
    title: "Your quote is still here",
    preheader: "Don't forget your quote. It's still available.",
    body: "Just a reminder: your quote is still available. Open it whenever you're ready.",
    promoBody: (code, pct) => `Also, you can use code <strong>${escapeHtml(code)}</strong> to get ${pct} % off.`,
    cta: "View my quote",
    unsubscribe: "Unsubscribe",
  },
  de: {
    subject: "Erinnerung: dein Angebot von Dimension3D",
    title: "Dein Angebot wartet noch",
    preheader: "Vergiss dein Angebot nicht. Es ist noch verfügbar.",
    body: "Nur eine kurze Erinnerung: dein Angebot ist noch verfügbar. Öffne es, wann du möchtest.",
    promoBody: (code, pct) => `Außerdem kannst du den Code <strong>${escapeHtml(code)}</strong> für ${pct} % Rabatt verwenden.`,
    cta: "Mein Angebot ansehen",
    unsubscribe: "Abmelden",
  },
  fr: {
    subject: "Rappel : ton devis Dimension3D",
    title: "Ton devis est toujours disponible",
    preheader: "N'oublie pas ton devis. Il est toujours disponible.",
    body: "Juste un rappel : ton devis est toujours disponible. Ouvre-le quand tu veux.",
    promoBody: (code, pct) => `Tu peux aussi utiliser le code <strong>${escapeHtml(code)}</strong> pour obtenir ${pct} % de réduction.`,
    cta: "Voir mon devis",
    unsubscribe: "Se désabonner",
  },
  nl: {
    subject: "Herinnering: je offerte van Dimension3D",
    title: "Je offerte is er nog steeds",
    preheader: "Vergeet je offerte niet. Die is nog steeds beschikbaar.",
    body: "Alleen een herinnering: je offerte is nog steeds beschikbaar. Open hem wanneer je klaar bent.",
    promoBody: (code, pct) => `Je kunt ook code <strong>${escapeHtml(code)}</strong> gebruiken voor ${pct} % korting.`,
    cta: "Mijn offerte bekijken",
    unsubscribe: "Uitschrijven",
  },
  it: {
    subject: "Promemoria: il tuo preventivo Dimension3D",
    title: "Il tuo preventivo è ancora qui",
    preheader: "Non dimenticare il tuo preventivo. È ancora disponibile.",
    body: "Solo un promemoria: il tuo preventivo è ancora disponibile. Aprilo quando sei pronto.",
    promoBody: (code, pct) => `Puoi anche usare il codice <strong>${escapeHtml(code)}</strong> per ottenere il ${pct} % di sconto.`,
    cta: "Vedi il mio preventivo",
    unsubscribe: "Annulla iscrizione",
  },
  pt: {
    subject: "Lembrete: o seu orçamento da Dimension3D",
    title: "O seu orçamento ainda está aqui",
    preheader: "Não se esqueça do seu orçamento. Ainda está disponível.",
    body: "Apenas um lembrete: o seu orçamento ainda está disponível. Abra-o quando quiser.",
    promoBody: (code, pct) => `Também pode usar o código <strong>${escapeHtml(code)}</strong> para obter ${pct} % de desconto.`,
    cta: "Ver o meu orçamento",
    unsubscribe: "Cancelar subscrição",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const authResult = authenticateCronRequest(req);
  if (authResult !== null) {
    // Also accept service-role JWT
    const bearer = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
    const isServiceRole = (() => {
      try {
        const claims = JSON.parse(atob(bearer.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return claims?.role === "service_role";
      } catch { return false; }
    })();
    if (!isServiceRole) return authResult;
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const oneDayAgo = new Date(Date.now() - 24 * 3600_000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 48 * 3600_000).toISOString();

  // Find quotes saved 24–48 h ago, not reminded, not purchased, not unsubscribed
  const { data: quotes, error: selectErr } = await admin
    .from("saved_quotes")
    .select("id, token, email, quote_payload, total, language, source_page")
    .lte("created_at", oneDayAgo)
    .gte("created_at", twoDaysAgo)
    .is("reminded_at", null)
    .eq("purchased", false)
    .eq("unsubscribed", false)
    .limit(50);

  if (selectErr) {
    return new Response(JSON.stringify({ error: selectErr.message }), { status: 500, headers: { "Content-Type": "application/json", ...cors } });
  }

  // Fetch active public promo code (if any)
  const now = new Date().toISOString();
  const { data: promoRow } = await admin
    .from("promo_codes")
    .select("code, pct")
    .eq("kind", "public")
    .eq("active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("pct", { ascending: false })
    .limit(1)
    .single();

  const results: Array<{ id: string; sent: boolean; error?: string }> = [];

  for (const q of (quotes ?? [])) {
    try {
      const lang = ((q.language as Lang) in T ? q.language as Lang : "es");
      const t = T[lang];
      const quoteLink = (q.quote_payload as any)?.quoteLink
        ?? `${q.source_page ? SITE_ORIGIN + q.source_page : SITE_ORIGIN}`;
      const unsubscribeUrl = `${SITE_ORIGIN}/baja?token=${q.token}`;
      const totalFormatted = q.total
        ? q.total.toLocaleString(lang === "en" ? "en-GB" : "es-ES", { style: "currency", currency: "EUR" })
        : "";

      const promoHtml = promoRow ? `<p style="margin:12px 0;font-size:14px;color:#334155;">${t.promoBody(promoRow.code, promoRow.pct)}</p>` : "";

      const bodyHtml = `
        <p style="margin:0 0 12px;font-size:15px;color:#334155;">${escapeHtml(t.body)}</p>
        ${totalFormatted ? `<p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">${escapeHtml(totalFormatted)}</p>` : ""}
        ${renderButton(quoteLink, t.cta)}
        ${promoHtml}
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
          <a href="${escapeHtml(unsubscribeUrl)}" style="color:#94a3b8;">${escapeHtml(t.unsubscribe)}</a>
        </p>`;

      const html = wrapEmail({ preheader: t.preheader, title: t.title, bodyHtml, language: lang });

      if (RESEND_API_KEY) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Dimension3D <noreply@dimension3dprints.com>",
            to: [q.email],
            subject: t.subject,
            html,
          }),
        });
        if (!res.ok) throw new Error(`Resend ${res.status}`);
      }

      await admin.from("saved_quotes").update({ reminded_at: new Date().toISOString() }).eq("id", q.id);
      results.push({ id: q.id, sent: true });
    } catch (err) {
      console.error("[send-saved-quote-reminders]", q.id, err);
      results.push({ id: q.id, sent: false, error: String(err) });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...cors },
  });
});
