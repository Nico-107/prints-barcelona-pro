// Phase 3: email the customer gets when the owner clicks "Enviar presupuesto".
// Localised per the lead's page_language (or customer language if set).

import {
  wrapEmail,
  renderPiecesTable,
  stackablePiecesTable,
  renderSummaryBlock,
  renderButton,
  escapeHtml,
  formatEUR,
  type EmailPiece,
} from "./emailLayout.ts";
import { stringsFor, type CustomerLang } from "./customerEmailStrings.ts";
import { toLangKey } from "./customerEmailTemplates.ts";

export interface CustomerQuoteInput {
  firstName: string | null;
  language: CustomerLang | string | null | undefined;
  quoteUrl: string;        // /presupuesto/<token>
  priceCents: number;
  shippingCents: number;
  productionDays: number;
  message: string | null;
  expiresAtIso: string;    // 14 days from now (ISO)
  fulfillment: "pickup" | "shipping";
  pieces: EmailPiece[];
}

const QUOTE_STRINGS: Record<CustomerLang, {
  subject: (days: number) => string;
  title: string;
  intro: (price: string, days: number) => string;
  totalLabel: string;
  shippingLabel: string;
  productionLabel: string;
  productionValue: (days: number) => string;
  expiresLabel: string;
  button: string;
  secondary: string;
  shippingFreeNote: string;
}> = {
  es: {
    subject: (d) => `Tu presupuesto Dimension3D (${d} días)`,
    title: "Tu presupuesto",
    intro: (p, d) => `Ya tienes el precio: ${p}. Producción en ${d} días laborables.`,
    totalLabel: "Total", shippingLabel: "Envío", productionLabel: "Producción",
    productionValue: (d) => `${d} días laborables`,
    expiresLabel: "Válido hasta",
    button: "Aceptar y pagar",
    secondary: "Tengo una pregunta",
    shippingFreeNote: "Envío gratuito (pedido ≥ 100 €).",
  },
  ca: {
    subject: (d) => `El teu pressupost Dimension3D (${d} dies)`,
    title: "El teu pressupost",
    intro: (p, d) => `Ja tens el preu: ${p}. Producció en ${d} dies laborables.`,
    totalLabel: "Total", shippingLabel: "Enviament", productionLabel: "Producció",
    productionValue: (d) => `${d} dies laborables`,
    expiresLabel: "Vàlid fins",
    button: "Acceptar i pagar",
    secondary: "Tinc un dubte",
    shippingFreeNote: "Enviament gratuït (comanda ≥ 100 €).",
  },
  en: {
    subject: (d) => `Your Dimension3D quote (${d} days)`,
    title: "Your quote",
    intro: (p, d) => `Here's your price: ${p}. Production in ${d} working days.`,
    totalLabel: "Total", shippingLabel: "Shipping", productionLabel: "Production",
    productionValue: (d) => `${d} working days`,
    expiresLabel: "Valid until",
    button: "Accept and pay",
    secondary: "I have a question",
    shippingFreeNote: "Free shipping (order ≥ €100).",
  },
  de: {
    subject: (d) => `Dein Angebot von Dimension3D (${d} Tage)`,
    title: "Dein Angebot",
    intro: (p, d) => `Hier ist dein Preis: ${p}. Produktion in ${d} Werktagen.`,
    totalLabel: "Gesamt", shippingLabel: "Versand", productionLabel: "Produktion",
    productionValue: (d) => `${d} Werktage`,
    expiresLabel: "Gültig bis",
    button: "Annehmen und bezahlen",
    secondary: "Ich habe eine Frage",
    shippingFreeNote: "Kostenloser Versand (Bestellung ≥ 100 €).",
  },
  fr: {
    subject: (d) => `Ton devis Dimension3D (${d} jours)`,
    title: "Ton devis",
    intro: (p, d) => `Voici ton prix : ${p}. Production en ${d} jours ouvrés.`,
    totalLabel: "Total", shippingLabel: "Livraison", productionLabel: "Production",
    productionValue: (d) => `${d} jours ouvrés`,
    expiresLabel: "Valide jusqu'au",
    button: "Accepter et payer",
    secondary: "J'ai une question",
    shippingFreeNote: "Livraison gratuite (commande ≥ 100 €).",
  },
  nl: {
    subject: (d) => `Je offerte van Dimension3D (${d} dagen)`,
    title: "Je offerte",
    intro: (p, d) => `Hier is je prijs: ${p}. Productie in ${d} werkdagen.`,
    totalLabel: "Totaal", shippingLabel: "Verzending", productionLabel: "Productie",
    productionValue: (d) => `${d} werkdagen`,
    expiresLabel: "Geldig tot",
    button: "Accepteren en betalen",
    secondary: "Ik heb een vraag",
    shippingFreeNote: "Gratis verzending (bestelling ≥ € 100).",
  },
  it: {
    subject: (d) => `Il tuo preventivo Dimension3D (${d} giorni)`,
    title: "Il tuo preventivo",
    intro: (p, d) => `Ecco il prezzo: ${p}. Produzione in ${d} giorni lavorativi.`,
    totalLabel: "Totale", shippingLabel: "Spedizione", productionLabel: "Produzione",
    productionValue: (d) => `${d} giorni lavorativi`,
    expiresLabel: "Valido fino al",
    button: "Accettare e pagare",
    secondary: "Ho una domanda",
    shippingFreeNote: "Spedizione gratuita (ordine ≥ 100 €).",
  },
  pt: {
    subject: (d) => `O teu orçamento Dimension3D (${d} dias)`,
    title: "O teu orçamento",
    intro: (p, d) => `Aqui está o preço: ${p}. Produção em ${d} dias úteis.`,
    totalLabel: "Total", shippingLabel: "Envio", productionLabel: "Produção",
    productionValue: (d) => `${d} dias úteis`,
    expiresLabel: "Válido até",
    button: "Aceitar e pagar",
    secondary: "Tenho uma pergunta",
    shippingFreeNote: "Envio gratuito (encomenda ≥ 100 €).",
  },
};

export function renderCustomerQuoteEmail(input: CustomerQuoteInput): { subject: string; html: string } {
  const lang: CustomerLang = toLangKey(input.language as string | null | undefined);
  const Q = QUOTE_STRINGS[lang] ?? QUOTE_STRINGS.es;
  const S = stringsFor(lang);
  const subtotal = input.priceCents;
  const total = subtotal + input.shippingCents;
  const subtotalStr = formatEUR(subtotal);
  const totalStr = formatEUR(total);
  const shippingStr = input.shippingCents === 0 ? "0 €" : formatEUR(input.shippingCents);
  const expires = (() => {
    try { return new Date(input.expiresAtIso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }); } catch { return input.expiresAtIso; }
  })();

  const summary = renderSummaryBlock([
    { label: "Subtotal", value: subtotalStr },
    { label: Q.shippingLabel, value: shippingStr + (input.fulfillment === "shipping" && input.shippingCents === 0 ? ` · ${Q.shippingFreeNote}` : "") },
    { label: Q.productionLabel, value: Q.productionValue(input.productionDays) },
    { label: Q.totalLabel, value: totalStr },
    { label: Q.expiresLabel, value: expires },
  ]);

  const pieces = stackablePiecesTable(renderPiecesTable(input.pieces, { language: lang }));
  const ownerMsg = input.message
    ? `<div style="border-left:3px solid #94a3b8;background:#f8fafc;padding:10px 12px;margin:12px 0;font-size:14px;color:#334155;white-space:pre-wrap;">${escapeHtml(input.message)}</div>`
    : "";

  const body = `
    <p style="margin:0 0 12px 0;font-size:15px;color:#0f172a;">${escapeHtml(S.hello(input.firstName ?? ""))}</p>
    <p style="margin:0 0 12px 0;font-size:15px;color:#334155;">${escapeHtml(Q.intro(totalStr, input.productionDays))}</p>
    ${ownerMsg}
    ${pieces}
    ${summary}
    ${renderButton(input.quoteUrl, Q.button)}
    <p style="margin:12px 0 0 0;font-size:13px;color:#64748b;">
      <a href="mailto:dimension3dprintsbcn@gmail.com?subject=Consulta%20presupuesto" style="color:#0f172a;text-decoration:underline;">${escapeHtml(Q.secondary)}</a>
      · WhatsApp
      <a href="https://wa.me/34672051147" style="color:#0f172a;text-decoration:underline;">+34 672 051 147</a>
    </p>
  `;

  return {
    subject: Q.subject(input.productionDays),
    html: wrapEmail({
      preheader: Q.subject(input.productionDays),
      title: Q.title,
      bodyHtml: body,
      language: lang,
    }),
  };
}
