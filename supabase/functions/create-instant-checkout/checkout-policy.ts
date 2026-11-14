export const MAX_CHARGE_CENTS = 20590;
// Keep in sync with SHIP_COUNTRIES in src/lib/instantBuy.ts (same countries, same order).
export const SHIP_COUNTRIES = ["ES","PT","FR","DE","IT","NL","BE","LU","AT","IE","PL","DK","SE","FI"] as const;

export function shippingChargeCents(fulfillment: string, discountedSubtotalCents: number): number {
  return fulfillment === "shipping" && discountedSubtotalCents < 10000 ? 590 : 0;
}

export function chargeAllowed(subtotalCents: number, fulfillment: string): boolean {
  return Number.isFinite(subtotalCents) && subtotalCents > 0 &&
    subtotalCents + shippingChargeCents(fulfillment, subtotalCents) <= MAX_CHARGE_CENTS;
}

// Section 2.1 + 2.2 + 2.3: product_data images, description and locale are
// now set at the call site per line. applyCheckoutPolicy only handles the
// policy concerns — phone collection, shipping address collection (only when
// shipping is chosen; section 2.3), and the shipping line item.
export function applyCheckoutPolicy(params: URLSearchParams, fulfillment: string, subtotalCents: number, lineCount: number): void {
  if (fulfillment === "shipping") {
    params.set("phone_number_collection[enabled]", "true");
    SHIP_COUNTRIES.forEach((country, i) => params.set(`shipping_address_collection[allowed_countries][${i}]`, country));
    params.set(`line_items[${lineCount}][quantity]`, "1");
    params.set(`line_items[${lineCount}][price_data][currency]`, "eur");
    params.set(`line_items[${lineCount}][price_data][unit_amount]`, String(shippingChargeCents(fulfillment, subtotalCents)));
    params.set(`line_items[${lineCount}][price_data][product_data][name]`, "Envío");
  }
  // Pickup: no phone, no address — section 2.3 ("Ask for less").
}

export function decodePreviewPng(value: unknown): Uint8Array | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || value.length > 2800000) throw new Error("INVALID_PREVIEW_PNG");
  const base64 = value.replace(/^data:image\/png;base64,/, "");
  let bytes: Uint8Array;
  try { bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0)); }
  catch { throw new Error("INVALID_PREVIEW_PNG"); }
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 33 || bytes.length > 2 * 1024 * 1024 || !signature.every((b, i) => bytes[i] === b)) throw new Error("INVALID_PREVIEW_PNG");
  return bytes;
}