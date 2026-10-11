// owner: add every country you have really shipped to (not just countries in the checkout list).
// A "Countries we have shipped to" list or map may only show entries from this file.
// Format: ISO 3166-1 alpha-2 code, orders = null (no count), or a real order count.
export interface ShippedCountry {
  code: string;
  orders: number | null;
}

export const SHIPPED_COUNTRIES: ShippedCountry[] = [
  { code: "ES", orders: null },
];
