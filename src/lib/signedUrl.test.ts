import { describe, it, expect } from "vitest";
import {
  hmacHex,
  signOrderZipUrl,
  verifyOrderZipSig,
  signQuoteZipUrl,
  verifyQuoteZipSig,
} from "../../supabase/functions/_shared/signedUrl";

const KEY = "test-service-role-key-abc123";

describe("signedUrl — order", () => {
  it("sign then verify returns true", async () => {
    const { exp, sig } = await signOrderZipUrl({ orderNumber: 268, serviceRoleKey: KEY });
    expect(await verifyOrderZipSig({ orderNumber: 268, exp, sig, serviceRoleKey: KEY })).toBe(true);
  });

  it("wrong order number returns false", async () => {
    const { exp, sig } = await signOrderZipUrl({ orderNumber: 268, serviceRoleKey: KEY });
    expect(await verifyOrderZipSig({ orderNumber: 999, exp, sig, serviceRoleKey: KEY })).toBe(false);
  });

  it("expired exp returns false", async () => {
    const exp = Math.floor(Date.now() / 1000) - 1;
    const sig = await hmacHex(`order.268.${exp}`, KEY);
    expect(await verifyOrderZipSig({ orderNumber: 268, exp, sig, serviceRoleKey: KEY })).toBe(false);
  });

  it("tampered sig returns false", async () => {
    const { exp, sig } = await signOrderZipUrl({ orderNumber: 268, serviceRoleKey: KEY });
    const tampered = sig.slice(0, -4) + "0000";
    expect(await verifyOrderZipSig({ orderNumber: 268, exp, sig: tampered, serviceRoleKey: KEY })).toBe(false);
  });

  it("wrong key returns false", async () => {
    const { exp, sig } = await signOrderZipUrl({ orderNumber: 268, serviceRoleKey: KEY });
    expect(await verifyOrderZipSig({ orderNumber: 268, exp, sig, serviceRoleKey: "different-key" })).toBe(false);
  });

  it("exp is ~30 days in the future", async () => {
    const before = Math.floor(Date.now() / 1000);
    const { exp } = await signOrderZipUrl({ orderNumber: 1, serviceRoleKey: KEY });
    const after = Math.floor(Date.now() / 1000);
    const thirtyDays = 30 * 24 * 3600;
    expect(exp).toBeGreaterThanOrEqual(before + thirtyDays);
    expect(exp).toBeLessThanOrEqual(after + thirtyDays + 2);
  });
});

describe("signedUrl — quote", () => {
  const QUOTE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

  it("sign then verify returns true", async () => {
    const { exp, sig } = await signQuoteZipUrl({ quoteId: QUOTE_ID, serviceRoleKey: KEY });
    expect(await verifyQuoteZipSig({ quoteId: QUOTE_ID, exp, sig, serviceRoleKey: KEY })).toBe(true);
  });

  it("wrong quote id returns false", async () => {
    const { exp, sig } = await signQuoteZipUrl({ quoteId: QUOTE_ID, serviceRoleKey: KEY });
    expect(await verifyQuoteZipSig({ quoteId: "other-uuid", exp, sig, serviceRoleKey: KEY })).toBe(false);
  });

  it("expired exp returns false", async () => {
    const exp = Math.floor(Date.now() / 1000) - 1;
    const sig = await hmacHex(`quote.${QUOTE_ID}.${exp}`, KEY);
    expect(await verifyQuoteZipSig({ quoteId: QUOTE_ID, exp, sig, serviceRoleKey: KEY })).toBe(false);
  });

  it("order sig does not verify as quote sig", async () => {
    const { exp, sig } = await signOrderZipUrl({ orderNumber: 268, serviceRoleKey: KEY });
    expect(await verifyQuoteZipSig({ quoteId: "268", exp, sig, serviceRoleKey: KEY })).toBe(false);
  });
});
