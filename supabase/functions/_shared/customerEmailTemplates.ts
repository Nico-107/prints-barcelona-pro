// Customer-facing email templates (item 1.4). Each render* returns
// `{ subject, html }` ready for Resend. Strings are picked from
// customerEmailStrings.ts; layout is the shared wrapEmail.
//
// The order-page URL for every button is /pedido/<tracking_token>. The
// shell works even when the customer opens the email in a dark Gmail
// theme.

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

export type { CustomerLang } from "./customerEmailStrings.ts";

export interface CustomerOrderContext {
  orderNumber: number;
  trackingToken: string;
  firstName: string | null;
  customerLanguage: CustomerLang;
  siteOrigin: string;    // e.g. "https://www.dimension3dprints.com"
  whatsappNumber: string; // e.g. "+34672051147"
}

function orderPageUrl(ctx: CustomerOrderContext): string {
  return `${ctx.siteOrigin}/pedido/${encodeURIComponent(ctx.trackingToken)}`;
}

function whatsappUrl(number: string, body?: string): string {
  const digits = number.replace(/\D/g, "");
  const q = body ? `?text=${encodeURIComponent(body)}` : "";
  return `https://wa.me/${digits}${q}`;
}

function toLangKey(lang: string | null | undefined): CustomerLang {
  const k = (lang ?? "es").toLowerCase();
  if (k === "es" || k === "ca" || k === "en" || k === "de" || k === "fr" || k === "nl" || k === "it" || k === "pt") return k;
  return "es";
}

// ── 1. Order confirmed ────────────────────────────────────────────────────────
export function renderOrderConfirmed(opts: {
  ctx: CustomerOrderContext;
  pieces: EmailPiece[];
  totalPaidCents: number;
  fulfillment: "pickup" | "shipping";
  shipByIso?: string | null;
  pickupReadyIso?: string | null;
}): { subject: string; html: string } {
  const S = stringsFor(opts.ctx.customerLanguage);
  const url = orderPageUrl(opts.ctx);
  const total = formatEUR(opts.totalPaidCents);
  const deliveryLabel = opts.fulfillment === "pickup"
    ? S.confirmed_delivery_pickup
    : S.confirmed_delivery_shipping;
  const summary = renderSummaryBlock([
    { label: S.confirmed_total_label, value: total },
    { label: S.confirmed_delivery_label, value: deliveryLabel },
    { label: opts.fulfillment === "pickup" ? S.confirmed_pickup_date_label : S.confirmed_ship_by_label,
      value: opts.fulfillment === "pickup" ? (opts.pickupReadyIso ?? null) : (opts.shipByIso ?? null) },
  ]);
  const pieces = stackablePiecesTable(renderPiecesTable(opts.pieces, { language: opts.ctx.customerLanguage }));
  const step3 = opts.fulfillment === "pickup" ? S.confirmed_step_3_pickup : S.confirmed_step_3_shipping;

  const body = `
    <p style="margin:0 0 12px 0;font-size:15px;color:#0f172a;">
      ${escapeHtml(S.hello(opts.ctx.firstName ?? ""))}
    </p>
    <p style="margin:0 0 12px 0;font-size:15px;color:#334155;">${escapeHtml(S.confirmed_intro)}</p>
    ${summary}
    ${pieces}
    <h2 style="margin:16px 0 4px 0;font-size:14px;color:#0f172a;">${escapeHtml(S.confirmed_next_heading)}</h2>
    <ol style="padding-left:18px;margin:4px 0 12px 0;color:#334155;">
      <li style="margin:4px 0;">${escapeHtml(S.confirmed_step_1)}</li>
      <li style="margin:4px 0;">${escapeHtml(S.confirmed_step_2)}</li>
      <li style="margin:4px 0;">${escapeHtml(step3)}</li>
    </ol>
    ${renderButton(url, S.button_view_order)}
    <p style="margin:12px 0 0 0;font-size:12px;color:#64748b;">${escapeHtml(S.footer_contact)}</p>
  `;

  return {
    subject: S.confirmed_subject(opts.ctx.orderNumber),
    html: wrapEmail({
      preheader: S.confirmed_preheader(opts.ctx.orderNumber),
      title: S.confirmed_title(opts.ctx.orderNumber),
      bodyHtml: body,
      language: opts.ctx.customerLanguage,
    }),
  };
}

// ── 2. In production ──────────────────────────────────────────────────────────
export function renderInProduction(opts: {
  ctx: CustomerOrderContext;
  etaIso: string;
}): { subject: string; html: string } {
  const S = stringsFor(opts.ctx.customerLanguage);
  const url = orderPageUrl(opts.ctx);
  const body = `
    <p style="margin:0 0 12px 0;font-size:15px;color:#0f172a;">${escapeHtml(S.hello(opts.ctx.firstName ?? ""))}</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#334155;">${escapeHtml(S.in_production_body(opts.etaIso))}</p>
    ${renderButton(url, S.button_view_order)}
    <p style="margin:12px 0 0 0;font-size:12px;color:#64748b;">${escapeHtml(S.footer_contact)}</p>
  `;
  return {
    subject: S.in_production_subject(opts.ctx.orderNumber),
    html: wrapEmail({
      preheader: S.in_production_preheader(opts.ctx.orderNumber),
      title: S.in_production_title,
      bodyHtml: body,
      language: opts.ctx.customerLanguage,
    }),
  };
}

// ── 3a. Shipped ───────────────────────────────────────────────────────────────
export function renderShipped(opts: {
  ctx: CustomerOrderContext;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  etaWindow: string;
}): { subject: string; html: string } {
  const S = stringsFor(opts.ctx.customerLanguage);
  const summary = renderSummaryBlock([
    { label: S.shipped_tracking_label, value: `${opts.carrier} · ${opts.trackingNumber}` },
  ]);
  const body = `
    <p style="margin:0 0 12px 0;font-size:15px;color:#0f172a;">${escapeHtml(S.hello(opts.ctx.firstName ?? ""))}</p>
    <p style="margin:0 0 12px 0;font-size:15px;color:#334155;">${escapeHtml(S.shipped_body(opts.carrier, opts.trackingNumber, opts.etaWindow))}</p>
    ${summary}
    ${renderButton(opts.trackingUrl, S.shipped_button)}
    ${renderButton(orderPageUrl(opts.ctx), S.button_view_order, { variant: "secondary" })}
    <p style="margin:12px 0 0 0;font-size:12px;color:#64748b;">${escapeHtml(S.footer_contact)}</p>
  `;
  return {
    subject: S.shipped_subject(opts.ctx.orderNumber),
    html: wrapEmail({
      preheader: S.shipped_preheader(opts.carrier),
      title: S.shipped_title,
      bodyHtml: body,
      language: opts.ctx.customerLanguage,
    }),
  };
}

// ── 3b. Ready for pickup ──────────────────────────────────────────────────────
export function renderReadyForPickup(opts: {
  ctx: CustomerOrderContext;
  pickupAddress: string;
}): { subject: string; html: string } {
  const S = stringsFor(opts.ctx.customerLanguage);
  const whats = whatsappUrl(opts.ctx.whatsappNumber,
    `Hola, quería pasar a recoger el pedido #${opts.ctx.orderNumber}. ¿Cuándo os va bien?`);
  const summary = renderSummaryBlock([
    { label: S.pickup_address_label, value: opts.pickupAddress },
  ]);
  const body = `
    <p style="margin:0 0 12px 0;font-size:15px;color:#0f172a;">${escapeHtml(S.hello(opts.ctx.firstName ?? ""))}</p>
    <p style="margin:0 0 12px 0;font-size:15px;color:#334155;">${escapeHtml(S.pickup_body_intro)} ${escapeHtml(S.pickup_by_appointment)}</p>
    ${summary}
    ${renderButton(whats, S.pickup_whatsapp_cta)}
    ${renderButton(orderPageUrl(opts.ctx), S.button_view_order, { variant: "secondary" })}
    <p style="margin:12px 0 0 0;font-size:12px;color:#64748b;">${escapeHtml(S.footer_contact)}</p>
  `;
  return {
    subject: S.pickup_subject(opts.ctx.orderNumber),
    html: wrapEmail({
      preheader: S.pickup_preheader,
      title: S.pickup_title,
      bodyHtml: body,
      language: opts.ctx.customerLanguage,
    }),
  };
}

// ── 4. Delivered / completed ──────────────────────────────────────────────────
export function renderDelivered(opts: { ctx: CustomerOrderContext }): { subject: string; html: string } {
  const S = stringsFor(opts.ctx.customerLanguage);
  const body = `
    <p style="margin:0 0 12px 0;font-size:15px;color:#0f172a;">${escapeHtml(S.hello(opts.ctx.firstName ?? ""))}</p>
    <p style="margin:0 0 12px 0;font-size:15px;color:#334155;">${escapeHtml(S.delivered_body)}</p>
    ${renderButton(orderPageUrl(opts.ctx), S.button_view_order)}
    <p style="margin:12px 0 0 0;font-size:12px;color:#64748b;">${escapeHtml(S.footer_contact)}</p>
  `;
  return {
    subject: S.delivered_subject(opts.ctx.orderNumber),
    html: wrapEmail({
      preheader: S.delivered_preheader,
      title: S.delivered_title,
      bodyHtml: body,
      language: opts.ctx.customerLanguage,
    }),
  };
}

// ── 4b. Review request (sent ~3 days after delivered) ─────────────────────────
export function renderReviewRequest(opts: { ctx: CustomerOrderContext; reviewUrl: string }): { subject: string; html: string } {
  const S = stringsFor(opts.ctx.customerLanguage);
  const body = `
    <p style="margin:0 0 12px 0;font-size:15px;color:#0f172a;">${escapeHtml(S.hello(opts.ctx.firstName ?? ""))}</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#334155;">${escapeHtml(S.review_body)}</p>
    ${renderButton(opts.reviewUrl, S.review_button)}
    <p style="margin:12px 0 0 0;font-size:12px;color:#64748b;">${escapeHtml(S.footer_contact)}</p>
  `;
  return {
    subject: S.review_subject,
    html: wrapEmail({
      preheader: S.review_preheader,
      title: S.review_title,
      bodyHtml: body,
      language: opts.ctx.customerLanguage,
    }),
  };
}

export { toLangKey };
