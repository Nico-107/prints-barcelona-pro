// Vercel serverless function — sends an owner email whenever the frontend
// successfully saves a quote / print / design request. Fire-and-forget from
// the frontend: a failure here must never block the customer.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";
import { renderNotifyQuoteEmail } from "./_lib/notifyQuoteEmail.js";
import { parseOwnerEmails, recipientsFor, isSevilla, SENDER } from "./_lib/recipients.js";

const MAX_BODY_BYTES = 50 * 1024;

const pieceSchema = z.object({
  name: z.string().max(200),
  quantity: z.number().int().min(1).max(10000),
  material: z.string().max(60).nullable().optional(),
  color: z.string().max(60).nullable().optional(),
  infill: z.number().nullable().optional(),
  wallLoops: z.number().nullable().optional(),
});

const payloadSchema = z.object({
  kind: z.enum(["quote", "print", "design"]).default("quote"),
  website: z.string().max(500).optional(), // honeypot — checked separately below
  contactEmail: z.string().email().max(200).nullable().optional(),
  contactPhone: z.string().max(60).nullable().optional(),
  material: z.string().max(60).nullable().optional(),
  totalUnits: z.number().int().max(100000).nullable().optional(),
  priceExact: z.number().max(1_000_000).nullable().optional(),
  pieces: z.array(pieceSchema).max(100).optional(),
  fileNames: z.array(z.string().max(300)).max(50).optional(),
  description: z.string().max(5000).nullable().optional(),
  dimensions: z.string().max(200).nullable().optional(),
  quantity: z.string().max(60).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  sourcePath: z.string().max(300).nullable().optional(),
  pageLanguage: z.string().max(10).nullable().optional(),
  sourceCity: z.string().max(60).nullable().optional(),
  countryCode: z.string().max(4).nullable().optional(),
  quoteId: z.string().max(100).nullable().optional(),
});

// Per-IP rate limit: 10 / hour. In-memory, resets on cold start.
const ipCounts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;

export function rateLimit(ip: string, now = Date.now()): boolean {
  const entry = ipCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_PER_WINDOW) return true;
  entry.count++;
  return false;
}

function clientIp(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0]!.trim();
  if (Array.isArray(fwd) && fwd.length) return (fwd[0] ?? "").split(",")[0]!.trim();
  return (req.socket?.remoteAddress ?? "unknown").toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  if (process.env.EMAIL_VIA_VERCEL !== "1") {
    // Kill switch — behave as success so the caller does not retry.
    res.status(200).json({ skipped: "EMAIL_VIA_VERCEL_disabled" });
    return;
  }

  // Size check — the frontend never sends file bytes, only metadata.
  const lengthHeader = req.headers["content-length"];
  const declared = typeof lengthHeader === "string" ? parseInt(lengthHeader, 10) : NaN;
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    res.status(413).json({ error: "PAYLOAD_TOO_LARGE" });
    return;
  }

  const ip = clientIp(req);
  if (rateLimit(ip)) {
    console.warn(`[notify-quote] rate-limited ${ip}`);
    res.status(429).json({ error: "RATE_LIMITED" });
    return;
  }

  let body: unknown = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: "INVALID_JSON" });
      return;
    }
  }

  const parsed = payloadSchema.safeParse(body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "VALIDATION_FAILED", details: parsed.error.issues.slice(0, 5) });
    return;
  }
  const payload = parsed.data;

  if (payload.website && payload.website.length > 0) {
    // Honeypot tripped — behave as success, drop it.
    console.warn(`[notify-quote] honeypot tripped from ${ip}`);
    res.status(200).json({ ok: true, dropped: "honeypot" });
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("[notify-quote] RESEND_API_KEY not set");
    res.status(200).json({ ok: true, warning: "no_resend_key" });
    return;
  }

  const ownerEmails = parseOwnerEmails(process.env.OWNER_EMAILS);
  const danielEmail = (process.env.DANIEL_EMAIL ?? "").trim() || null;
  const sevilla = isSevilla({ source_path: payload.sourcePath, page_language: payload.pageLanguage })
    || (payload.sourceCity ?? "").toLowerCase().includes("sevilla")
    || (payload.sourceCity ?? "").toLowerCase().includes("seville");
  const to = recipientsFor({ ownerEmails, danielEmail, sevilla });
  if (to.length === 0) {
    res.status(200).json({ ok: true, warning: "no_recipients" });
    return;
  }

  const firstNameOrLocal = (() => {
    const addr = (payload.contactEmail ?? "").trim();
    const local = addr ? addr.split("@")[0] : "";
    return local || (payload.contactPhone ?? "") || "cliente";
  })();
  const countryGuess = (() => {
    if (payload.countryCode) return payload.countryCode.toUpperCase();
    const addr = (payload.contactEmail ?? "").trim();
    const tld = addr.includes("@") ? addr.split("@")[1]?.split(".").pop() : null;
    if (tld && tld.length === 2) return tld.toUpperCase();
    return (payload.pageLanguage ?? "ES").toUpperCase();
  })();
  const materialSummary = (() => {
    if (payload.material) return payload.material;
    const mats = Array.from(new Set((payload.pieces ?? []).map((p) => p.material).filter(Boolean) as string[]));
    if (mats.length === 1) return mats[0];
    if (mats.length > 1) return `MIX (${mats.join(",")})`;
    return null;
  })();

  const { subject, html } = renderNotifyQuoteEmail({
    kind: payload.kind,
    firstNameOrLocal,
    customerEmail: payload.contactEmail ?? null,
    customerPhone: payload.contactPhone ?? null,
    countryCode: countryGuess,
    material: materialSummary,
    totalUnits: payload.totalUnits ?? null,
    priceExact: payload.priceExact ?? null,
    pieces: (payload.pieces ?? []).map((p) => ({
      name: p.name,
      quantity: p.quantity,
      material: p.material ?? null,
      color: p.color ?? null,
      infill: p.infill ?? null,
      wallLoops: p.wallLoops ?? null,
    })),
    fileNames: payload.fileNames ?? [],
    description: payload.description ?? null,
    dimensions: payload.dimensions ?? null,
    quantity: payload.quantity ?? null,
    sourcePath: payload.sourcePath ?? null,
    pageLanguage: payload.pageLanguage ?? null,
    notes: payload.notes ?? null,
    adminUrl: payload.quoteId
      ? `https://www.dimension3dprints.com/admin?quote=${encodeURIComponent(payload.quoteId)}`
      : "https://www.dimension3dprints.com/admin",
    quoteId: payload.quoteId ?? null,
  });

  const resend = new Resend(resendKey);
  try {
    const sent = await resend.emails.send({ from: SENDER, to, subject, html });
    if ((sent as any)?.error) {
      console.error("[notify-quote] Resend error:", (sent as any).error);
      res.status(200).json({ ok: true, email: "failed" });
      return;
    }
    const id = (sent as any)?.data?.id ?? null;
    console.log(`[notify-quote] sent ${id} kind=${payload.kind} to=${to.join(",")}`);
    res.status(200).json({ ok: true, id });
  } catch (err: any) {
    console.error("[notify-quote] send threw:", err?.message ?? err);
    res.status(200).json({ ok: true, email: "failed" });
  }
}
