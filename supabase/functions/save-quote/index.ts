import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { wrapEmail, escapeHtml, renderButton } from "../_shared/emailLayout.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SaveQuoteBody {
  email: string;
  quoteLink: string;
  total: number;
  language?: string;
  sourcePage?: string;
  quotePayload?: Record<string, unknown>;
  files?: Array<{ name: string; material: string; qty: number }>;
  unsubscribeBase?: string;
}

type Lang = "es" | "ca" | "en" | "de" | "fr" | "nl" | "it" | "pt";

const T: Record<Lang, {
  subject: string;
  title: string;
  preheader: string;
  body: string;
  cta: string;
  unsubscribe: string;
}> = {
  es: {
    subject: "Tu presupuesto de Dimension3D",
    title: "Tu presupuesto",
    preheader: "Aquí tienes el enlace a tu presupuesto. Válido 7 días.",
    body: "Aquí tienes el enlace directo a tu presupuesto. Ábrelo en cualquier dispositivo para retomar tu pedido.",
    cta: "Ver mi presupuesto",
    unsubscribe: "Cancelar recordatorio",
  },
  ca: {
    subject: "El teu pressupost de Dimension3D",
    title: "El teu pressupost",
    preheader: "Aquí tens l'enllaç al teu pressupost. Vàlid 7 dies.",
    body: "Aquí tens l'enllaç directe al teu pressupost. Obre'l en qualsevol dispositiu per continuar la teva comanda.",
    cta: "Veure el meu pressupost",
    unsubscribe: "Cancel·lar recordatori",
  },
  en: {
    subject: "Your Dimension3D quote",
    title: "Your quote",
    preheader: "Here's the link to your quote. Valid for 7 days.",
    body: "Here's the direct link to your quote. Open it on any device to pick up where you left off.",
    cta: "View my quote",
    unsubscribe: "Unsubscribe",
  },
  de: {
    subject: "Dein Angebot von Dimension3D",
    title: "Dein Angebot",
    preheader: "Hier ist der Link zu deinem Angebot. 7 Tage gültig.",
    body: "Hier ist der direkte Link zu deinem Angebot. Öffne ihn auf jedem Gerät, um dort weiterzumachen, wo du aufgehört hast.",
    cta: "Mein Angebot ansehen",
    unsubscribe: "Abmelden",
  },
  fr: {
    subject: "Ton devis Dimension3D",
    title: "Ton devis",
    preheader: "Voici le lien vers ton devis. Valable 7 jours.",
    body: "Voici le lien direct vers ton devis. Ouvre-le sur n'importe quel appareil pour reprendre ta commande.",
    cta: "Voir mon devis",
    unsubscribe: "Se désabonner",
  },
  nl: {
    subject: "Je offerte van Dimension3D",
    title: "Je offerte",
    preheader: "Hier is de link naar je offerte. 7 dagen geldig.",
    body: "Hier is de directe link naar je offerte. Open hem op elk apparaat om verder te gaan waar je gebleven was.",
    cta: "Mijn offerte bekijken",
    unsubscribe: "Uitschrijven",
  },
  it: {
    subject: "Il tuo preventivo Dimension3D",
    title: "Il tuo preventivo",
    preheader: "Ecco il link al tuo preventivo. Valido 7 giorni.",
    body: "Ecco il link diretto al tuo preventivo. Aprilo su qualsiasi dispositivo per continuare il tuo ordine.",
    cta: "Vedi il mio preventivo",
    unsubscribe: "Annulla iscrizione",
  },
  pt: {
    subject: "O seu orçamento da Dimension3D",
    title: "O seu orçamento",
    preheader: "Aqui está o link do seu orçamento. Válido por 7 dias.",
    body: "Aqui está o link direto do seu orçamento. Abra em qualquer dispositivo para retomar o seu pedido.",
    cta: "Ver o meu orçamento",
    unsubscribe: "Cancelar subscrição",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const body: SaveQuoteBody = await req.json();
    const { email, quoteLink, total, language, sourcePage, quotePayload, files, unsubscribeBase } = body;

    if (!email || !quoteLink || typeof total !== "number") {
      return new Response(JSON.stringify({ error: "missing_params" }), { status: 400, headers: { "Content-Type": "application/json", ...cors } });
    }

    const lang = (language as Lang) ?? "es";
    const t = T[lang] ?? T.es;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Insert into saved_quotes and get the token back
    const { data: saved, error: insertErr } = await adminClient
      .from("saved_quotes")
      .insert({
        email: email.toLowerCase().trim(),
        quote_payload: quotePayload ?? { quoteLink },
        total: parseFloat(total.toFixed(2)),
        language: lang,
        source_page: sourcePage ?? null,
      })
      .select("token")
      .single();

    if (insertErr) {
      console.error("[save-quote] insert error:", insertErr);
      return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers: { "Content-Type": "application/json", ...cors } });
    }

    const token = saved?.token as string;
    const unsubscribeUrl = unsubscribeBase
      ? `${unsubscribeBase}/baja?token=${token}`
      : `https://www.dimension3dprints.com/baja?token=${token}`;

    // Build email body
    const fileRows = (files ?? []).map(f =>
      `<tr>
        <td style="padding:6px 0;font-size:14px;color:#334155;">${escapeHtml(f.name)}</td>
        <td style="padding:6px 0 6px 12px;font-size:14px;color:#334155;white-space:nowrap;">${escapeHtml(f.material)} ×${f.qty}</td>
      </tr>`
    ).join("");

    const fileTableHtml = fileRows ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0;width:100%;">
        <tbody>${fileRows}</tbody>
      </table>` : "";

    const totalFormatted = total.toLocaleString(lang === "en" ? "en-GB" : "es-ES", { style: "currency", currency: "EUR" });

    const bodyHtml = `
      <p style="margin:0 0 16px;font-size:15px;color:#334155;">${escapeHtml(t.body)}</p>
      ${fileTableHtml}
      <p style="margin:16px 0 4px;font-size:22px;font-weight:700;color:#0f172a;">${escapeHtml(totalFormatted)}</p>
      ${renderButton(quoteLink, t.cta)}
      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
        <a href="${escapeHtml(unsubscribeUrl)}" style="color:#94a3b8;">${escapeHtml(t.unsubscribe)}</a>
      </p>`;

    const html = wrapEmail({ preheader: t.preheader, title: t.title, bodyHtml, language: lang });

    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Dimension3D <noreply@dimension3dprints.com>",
          to: [email.trim()],
          subject: t.subject,
          html,
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true, token }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...cors },
    });
  } catch (err) {
    console.error("[save-quote] unexpected error:", err);
    return new Response(JSON.stringify({ error: "unexpected" }), { status: 500, headers: { "Content-Type": "application/json", ...cors } });
  }
});
