/**
 * Ship-date rule — single source of truth for the "Listo y enviado el X" line.
 * Used by DeliveryPromise, OrderPanel, mobile sticky bar, toasts, and emails.
 *
 * - We never promise an arrival date. Carrier transit is excluded.
 * - Production days are driven only by urgency (standard=3, express=2, urgent=1).
 * - Weekends are skipped.
 * - Cutoff is 14:00 local time; past the cutoff, the whole window shifts by
 *   one working day (R7).
 */

const PRODUCTION_DAYS: Record<string, number> = {
  standard: 3,
  express: 2,
  urgent: 1,
};

/** 14:00 local time — orders placed after this shift one working day. */
export const CUTOFF_HOUR = 14;

/** Add N working days (skip Sat=6, Sun=0). */
function addBusinessDays(date: Date, days: number): Date {
  const d = new Date(date);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  // If we landed on a weekend (can't happen with the loop above, but defensively):
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d;
}

/** Return the working date the part is handed to the carrier. */
export function computeShipDate(now: Date, urgency: string): Date {
  const prod = PRODUCTION_DAYS[urgency] ?? 3;
  // Past the 14:00 cutoff, same-day production isn't possible: shift by one working day
  const shift = now.getHours() >= CUTOFF_HOUR ? 1 : 0;
  // Starting from "today or tomorrow depending on cutoff", add prod working days
  const start = new Date(now);
  if (shift) start.setDate(start.getDate() + 1);
  return addBusinessDays(start, prod - 1);
}

/** True when the current time is still before the 14:00 production cutoff. */
export function isBeforeCutoff(now: Date = new Date()): boolean {
  return now.getHours() < CUTOFF_HOUR;
}

function intlLocale(language: string): string {
  switch (language) {
    case "ca": return "ca-ES";
    case "es": return "es-ES";
    case "pt": return "pt-PT";
    case "fr": return "fr-FR";
    case "de": return "de-DE";
    case "nl": return "nl-NL";
    case "it": return "it-IT";
    default:   return "en-GB";
  }
}

/** Format a Date as "lun 9 nov" / "mon 9 Nov" per language. */
export function formatShipDate(date: Date, language: string): string {
  const locale = intlLocale(language);
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(date);
}

/**
 * Build the user-facing line.
 * - Shipping, long:  "Listo y enviado el lun 9 nov + envío"
 * - Shipping, short: "Enviado el lun 9 nov"
 * - Pickup, long:    "Listo para recoger el lun 9 nov"
 * - Pickup, short:   "Recoger el lun 9 nov"
 */
export function shipDateLine(
  formatted: string,
  language: string,
  fulfillment: "pickup" | "shipping",
  short: boolean,
): string {
  const isPickup = fulfillment === "pickup";
  if (isPickup) {
    switch (language) {
      case "es": return short ? `Recoger el ${formatted}` : `Listo para recoger el ${formatted}`;
      case "ca": return short ? `Recollir el ${formatted}` : `Llest per recollir el ${formatted}`;
      case "pt": return short ? `Levantar a ${formatted}` : `Pronto para levantar a ${formatted}`;
      case "fr": return short ? `Retrait le ${formatted}` : `Prêt pour retrait le ${formatted}`;
      case "de": return short ? `Abholung ${formatted}` : `Zur Abholung bereit am ${formatted}`;
      case "nl": return short ? `Afhalen op ${formatted}` : `Klaar om af te halen op ${formatted}`;
      case "it": return short ? `Ritiro il ${formatted}` : `Pronto per il ritiro il ${formatted}`;
      default:   return short ? `Pickup ${formatted}` : `Ready for pickup on ${formatted}`;
    }
  }
  // Shipping — never promise an arrival date; "+ envío" acknowledges the carrier handoff
  switch (language) {
    case "es": return short ? `Enviado el ${formatted}` : `Listo y enviado el ${formatted} + envío`;
    case "ca": return short ? `Enviat el ${formatted}` : `Llest i enviat el ${formatted} + enviament`;
    case "pt": return short ? `Enviado a ${formatted}` : `Pronto e enviado a ${formatted} + envio`;
    case "fr": return short ? `Expédié le ${formatted}` : `Prêt et expédié le ${formatted} + livraison`;
    case "de": return short ? `Versand ${formatted}` : `Fertig und versendet am ${formatted} + Versand`;
    case "nl": return short ? `Verzonden op ${formatted}` : `Klaar en verzonden op ${formatted} + verzending`;
    case "it": return short ? `Spedito il ${formatted}` : `Pronto e spedito il ${formatted} + spedizione`;
    default:   return short ? `Shipped ${formatted}` : `Ready and shipped ${formatted} + delivery`;
  }
}

/**
 * Cutoff line shown above the buy button (R7):
 *   - Before 14:00: "Pide antes de las 14:00 → lo imprimimos hoy y sale el {fecha}"
 *   - After 14:00:  "Imprimimos mañana y sale el {fecha}"  (no fake urgency)
 */
export function cutoffLine(shipDateFormatted: string, language: string, beforeCutoff: boolean): string {
  switch (language) {
    case "es":
      return beforeCutoff
        ? `Pide antes de las 14:00 → lo imprimimos hoy y sale el ${shipDateFormatted}`
        : `Imprimimos mañana y sale el ${shipDateFormatted}`;
    case "ca":
      return beforeCutoff
        ? `Demana abans de les 14:00 → l'imprimim avui i surt el ${shipDateFormatted}`
        : `L'imprimim demà i surt el ${shipDateFormatted}`;
    case "pt":
      return beforeCutoff
        ? `Peça antes das 14:00 → imprimimos hoje e segue a ${shipDateFormatted}`
        : `Imprimimos amanhã e segue a ${shipDateFormatted}`;
    case "fr":
      return beforeCutoff
        ? `Commandez avant 14:00 → imprimé aujourd'hui, expédié le ${shipDateFormatted}`
        : `Imprimé demain, expédié le ${shipDateFormatted}`;
    case "de":
      return beforeCutoff
        ? `Bis 14:00 bestellen → heute gedruckt, Versand am ${shipDateFormatted}`
        : `Morgen gedruckt, Versand am ${shipDateFormatted}`;
    case "nl":
      return beforeCutoff
        ? `Bestel vóór 14:00 → vandaag geprint, verzending op ${shipDateFormatted}`
        : `Morgen geprint, verzending op ${shipDateFormatted}`;
    case "it":
      return beforeCutoff
        ? `Ordina entro le 14:00 → stampato oggi, spedito il ${shipDateFormatted}`
        : `Stampato domani, spedito il ${shipDateFormatted}`;
    default:
      return beforeCutoff
        ? `Order before 14:00 → printed today, shipped ${shipDateFormatted}`
        : `Printed tomorrow, shipped ${shipDateFormatted}`;
  }
}
