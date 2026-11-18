// HMAC-SHA256 signed URL helpers used by order-files-zip.
// No runtime dependencies beyond the Web Crypto API (available in Deno and Node ≥18).

/** Sign "message" with key using HMAC-SHA-256; returns lowercase hex. */
export async function hmacHex(message: string, key: string): Promise<string> {
  const keyBytes = new TextEncoder().encode(key);
  const msgBytes = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, msgBytes);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string equality (both strings must be same length). */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export interface SignedOrderUrlParams {
  orderNumber: number;
  serviceRoleKey: string;
}

/** Generate exp + sig for an order zip URL (valid 30 days). */
export async function signOrderZipUrl(
  params: SignedOrderUrlParams,
): Promise<{ exp: number; sig: string }> {
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
  const sig = await hmacHex(`order.${params.orderNumber}.${exp}`, params.serviceRoleKey);
  return { exp, sig };
}

/** Verify an order zip URL signature. Returns false if expired or invalid. */
export async function verifyOrderZipSig(params: {
  orderNumber: number;
  exp: number;
  sig: string;
  serviceRoleKey: string;
}): Promise<boolean> {
  if (!Number.isFinite(params.exp) || params.exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmacHex(`order.${params.orderNumber}.${params.exp}`, params.serviceRoleKey);
  return constantTimeEqual(expected, params.sig.toLowerCase());
}

export interface SignedQuoteUrlParams {
  quoteId: string;
  serviceRoleKey: string;
}

/** Generate exp + sig for a quote zip URL (valid 30 days). */
export async function signQuoteZipUrl(
  params: SignedQuoteUrlParams,
): Promise<{ exp: number; sig: string }> {
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
  const sig = await hmacHex(`quote.${params.quoteId}.${exp}`, params.serviceRoleKey);
  return { exp, sig };
}

/** Verify a quote zip URL signature. Returns false if expired or invalid. */
export async function verifyQuoteZipSig(params: {
  quoteId: string;
  exp: number;
  sig: string;
  serviceRoleKey: string;
}): Promise<boolean> {
  if (!Number.isFinite(params.exp) || params.exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmacHex(`quote.${params.quoteId}.${params.exp}`, params.serviceRoleKey);
  return constantTimeEqual(expected, params.sig.toLowerCase());
}
