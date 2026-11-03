/**
 * Shareable quote links (Prompt 25 §10 / R10).
 *
 * Encodes the modal's configuration into the URL hash so opening the link
 * re-opens the modal with that config pre-selected. Encoded fields:
 *
 *   material (string key), colour (string), qty (int), urgency (string),
 *   scale (number, 1 = original), fileId (optional — the storage path if the
 *   upload already has one; null otherwise).
 *
 * Uses a compact JSON → base64url payload so the hash stays short-ish and
 * survives Google Docs / Slack URL shorteners that choke on `#` fragments
 * containing spaces or UTF-8.
 */

export interface QuoteLinkConfig {
  material: string;
  colour: string;
  qty: number;
  urgency: string;
  scale: number;
  fileId?: string | null;
}

const HASH_KEY = "q";

function b64urlEncode(obj: unknown): string {
  const json = JSON.stringify(obj);
  // btoa expects a binary string; TextEncoder → base64 keeps it UTF-8 safe
  if (typeof TextEncoder === "undefined" || typeof btoa === "undefined") return "";
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode<T>(s: string): T | null {
  try {
    if (typeof atob === "undefined" || typeof TextDecoder === "undefined") return null;
    const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}

/** Build a shareable URL hash fragment for the given config. */
export function encodeQuoteHash(config: QuoteLinkConfig): string {
  const payload = {
    m: config.material,
    c: config.colour,
    q: config.qty,
    u: config.urgency,
    s: config.scale,
    f: config.fileId ?? null,
  };
  const encoded = b64urlEncode(payload);
  return encoded ? `#${HASH_KEY}=${encoded}` : "";
}

/** Decode a URL hash fragment into a QuoteLinkConfig. Returns null if absent/invalid. */
export function decodeQuoteHash(hash: string): QuoteLinkConfig | null {
  if (!hash) return null;
  const raw = hash.replace(/^#/, "");
  const parts = raw.split("&");
  for (const p of parts) {
    const [k, v] = p.split("=");
    if (k === HASH_KEY && v) {
      const payload = b64urlDecode<{ m: string; c: string; q: number; u: string; s: number; f: string | null }>(v);
      if (!payload) return null;
      return {
        material: String(payload.m ?? "PLA"),
        colour: String(payload.c ?? ""),
        qty: Number.isFinite(payload.q) ? Math.max(1, Math.floor(payload.q as number)) : 1,
        urgency: String(payload.u ?? "standard"),
        scale: Number.isFinite(payload.s) ? Math.max(0.01, payload.s as number) : 1,
        fileId: payload.f ?? null,
      };
    }
  }
  return null;
}

/** Build the full shareable URL for the current page with this config in the hash. */
export function buildQuoteLink(origin: string, pathname: string, config: QuoteLinkConfig): string {
  return `${origin}${pathname}${encodeQuoteHash(config)}`;
}
