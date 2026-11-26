// Fire-and-forget POST to /api/notify-quote. Never throws, never blocks the
// customer. The handler itself short-circuits when EMAIL_VIA_VERCEL=0.

export interface NotifyQuotePayload {
  kind?: "quote" | "print" | "design";
  contactEmail?: string | null;
  contactPhone?: string | null;
  material?: string | null;
  totalUnits?: number | null;
  priceExact?: number | null;
  pieces?: Array<{ name: string; quantity: number; material?: string | null; color?: string | null; infill?: number | null; wallLoops?: number | null }>;
  fileNames?: string[];
  description?: string | null;
  dimensions?: string | null;
  quantity?: string | null;
  notes?: string | null;
  sourcePath?: string | null;
  pageLanguage?: string | null;
  sourceCity?: string | null;
  countryCode?: string | null;
  quoteId?: string | null;
  website?: string; // honeypot — pass form value through; empty for real users
}

export function notifyQuote(payload: NotifyQuotePayload): void {
  if (typeof window === "undefined") return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  // Fire; swallow any error — this must never block the customer flow.
  fetch("/api/notify-quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal,
    keepalive: true,
  })
    .catch(() => {})
    .finally(() => clearTimeout(timer));
}
