import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { MAX_CHARGE_CENTS, applyCheckoutPolicy, chargeAllowed, decodePreviewPng, shippingChargeCents } from "../../supabase/functions/create-instant-checkout/checkout-policy";
import { isSuccessfulCheckout } from "../../supabase/functions/stripe-webhook/payment-policy";
import { analyzeTriangles } from "./estimator/core";
import { boxMesh, toBinaryStl } from "./estimator/fixtures";

// STLs served by the download mock — keyed by path prefix for easy override.
const BOX_MED = boxMesh(100, 100, 20);  // ~€19.79 PLA standard
const BOX_LG  = boxMesh(150, 150, 80);  // ~€116.45 PLA standard → free shipping

function checkoutHarness(downloadMesh = BOX_MED) {
  let handler: (request: Request) => Promise<Response> = async () => new Response();
  let sessionParams = new URLSearchParams();
  const insert = vi.fn();
  const upload = vi.fn(async () => ({ error: null }));
  const stlBuf = toBinaryStl(downloadMesh);
  const mockBlob = { size: stlBuf.byteLength, arrayBuffer: async () => stlBuf };
  const download = vi.fn(async () => ({ data: mockBlob, error: null }));
  const client = {
    from: () => ({ insert: (row: unknown) => { insert(row); return { select: () => ({ single: async () => ({ data: { id: "test-order", order_number: 123 }, error: null }) }) }; } }),
    storage: { from: () => ({ upload, download, getPublicUrl: (path: string) => ({ data: { publicUrl: `https://example.com/${path}` } }) }) },
  };
  const source = readFileSync("supabase/functions/create-instant-checkout/index.ts", "utf8").replace(/^import .*;\r?\n/gm, "");
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const exports: Record<string, any> = {};
  const mockFetch = async (_url: string, init: RequestInit) => { sessionParams = new URLSearchParams(init.body as URLSearchParams); return new Response(JSON.stringify({ url: "https://checkout.stripe.com/test" })); };
  new Function("exports", "serve", "createClient", "Deno", "fetch", "MAX_CHARGE_CENTS", "applyCheckoutPolicy", "chargeAllowed", "decodePreviewPng", "shippingChargeCents", js)(
    exports, (fn: typeof handler) => { handler = fn; }, () => client,
    { env: { get: (name: string) => name.startsWith("POSTHOG") ? undefined : "test-only" } }, mockFetch,
    MAX_CHARGE_CENTS, applyCheckoutPolicy, chargeAllowed, decodePreviewPng, shippingChargeCents,
  );
  const invoke = (body: unknown) => handler(new Request("https://example.com", { method: "POST", body: JSON.stringify(body) }));
  return { invoke, params: () => sessionParams, insert, upload, exports };
}

/** Build a valid V3 body whose exactPrice matches the server-side re-measurement for the given mesh. */
function v3Body(exports: Record<string, any>, mesh: Float32Array, opts: { fulfillment?: string; urgency?: string; qty?: number } = {}) {
  const analyses = [analyzeTriangles(mesh)];
  const piece = { name: "box.stl", path: "test/box.stl", material: "PLA", infill: 15, wallLoops: 2, quality: "standard", supports: false, orientation: 0, quantity: opts.qty ?? 1 };
  const body: any = { pricingVersion: 3, urgency: opts.urgency ?? "standard", fulfillment: opts.fulfillment ?? "shipping", exactPrice: 0, pieces: [piece] };
  body.exactPrice = exports.priceV3(body, analyses).order.totalCents / 100;
  return body;
}

describe("deployed checkout policies", () => {
  it("v2 is retired — returns VERSION_OUTDATED", async () => {
    const h = checkoutHarness();
    const r = await h.invoke({ pricingVersion: 2, urgency: "standard", fulfillment: "shipping", exactPrice: 81.38,
      pieces: [{ name: "box.stl", material: "PLA", infill: 15, wallLoops: 2, quantity: 1, volumeMm3: 1000000 }] });
    expect(r.status).toBe(400);
    expect(await r.json()).toEqual({ error: "VERSION_OUTDATED" });
  });
  it("v3 allows orders above the former €100 limit while retaining mesh pricing and other guards", () => {
    const h = checkoutHarness(BOX_LG);
    const analyses = [analyzeTriangles(BOX_LG)];
    const body = { pricingVersion: 3, urgency: "standard", fulfillment: "shipping", exactPrice: 0,
      pieces: [{ name: "box.stl", path: "box.stl", material: "PLA", infill: 15, wallLoops: 2, quality: "standard", supports: false, orientation: "auto", quantity: 1 }] };
    body.exactPrice = h.exports.priceV3(body, analyses).order.totalCents / 100;
    expect(body.exactPrice).toBeGreaterThan(100);
    const result = h.exports.evaluateCheckoutV3(body, analyses);
    expect(result.ok).toBe(true);
    expect(result.value.priced.order.totalCents).toBe(Math.round(body.exactPrice * 100));
    expect(h.exports.evaluateCheckoutV3({ ...body, exactPrice: 1 }, analyses).error).toBe("PRICE_MISMATCH");
  });
  it("allows €205.90 but rejects €205.91", () => {
    expect(chargeAllowed(20590, "pickup")).toBe(true);
    expect(chargeAllowed(20591, "pickup")).toBe(false);
    expect(chargeAllowed(20590, "shipping")).toBe(true);  // ≥€100 → free shipping, 20590 ≤ 20590
    expect(chargeAllowed(20591, "shipping")).toBe(false); // 20591 > 20590
  });
  it("v3 rejects an unsupported material", async () => {
    const h = checkoutHarness();
    const body = v3Body(h.exports, BOX_MED);
    body.pieces[0].material = "WOOD";
    const r = await h.invoke(body);
    expect(r.status).toBe(400);
  });
  it("charges €5.90 shipping as a separate line item", async () => {
    const h = checkoutHarness();
    await h.invoke(v3Body(h.exports, BOX_MED));
    const lineAmounts = [...h.params()].filter(([k]) => k.endsWith("[unit_amount]")).map(([, v]) => Number(v));
    expect(lineAmounts).toContain(590);
    // shipping (590) must NOT equal the print amount (verify separation)
    const shipIdx = lineAmounts.indexOf(590);
    expect(shipIdx).toBeGreaterThan(0); // shipping is not line_items[0]
  });
  it("uses the discounted subtotal for the inclusive €100 free shipping threshold", () => {
    expect(shippingChargeCents("shipping", 9999)).toBe(590);
    expect(shippingChargeCents("shipping", 10000)).toBe(0);
    expect(shippingChargeCents("shipping", 11100 - 1110)).toBe(590);
    expect(shippingChargeCents("shipping", 11200 - 1120)).toBe(0);
  });
  it("adds the €0 shipping line when order is ≥ €100", async () => {
    const h = checkoutHarness(BOX_LG);
    await h.invoke(v3Body(h.exports, BOX_LG));
    const lineAmounts = [...h.params()].filter(([k]) => k.endsWith("[unit_amount]")).map(([, v]) => Number(v));
    expect(lineAmounts).toContain(0); // free shipping line
  });
  it("uses automatic payment selection and auto locale", async () => {
    const h = checkoutHarness();
    await h.invoke(v3Body(h.exports, BOX_MED));
    expect(h.params().get("locale")).toBe("auto");
    expect([...h.params().keys()].some(key => key.startsWith("payment_method_types"))).toBe(false);
    expect(h.params().has("payment_intent_data[capture_method]")).toBe(false);
  });
  it("collects shipping for all 14 frontend countries", async () => {
    const h = checkoutHarness();
    await h.invoke(v3Body(h.exports, BOX_MED));
    expect([...h.params()].filter(([key]) => key.startsWith("shipping_address_collection")).map(([, value]) => value)).toEqual(["ES", "PT", "FR", "DE", "IT", "NL", "BE", "LU", "AT", "IE", "PL", "DK", "SE", "FI"]);
  });
  it("pickup collects phone but no shipping address or fee", async () => {
    const h = checkoutHarness();
    await h.invoke(v3Body(h.exports, BOX_MED, { fulfillment: "pickup" }));
    expect(h.params().get("phone_number_collection[enabled]")).toBe("true");
    // no shipping_address_collection keys; last line item is not shipping
    expect([...h.params().keys()].some(key => key.startsWith("shipping_address_collection"))).toBe(false);
    const lineAmounts = [...h.params()].filter(([k]) => k.endsWith("[unit_amount]")).map(([, v]) => Number(v));
    expect(lineAmounts).not.toContain(590);
  });
  it("uploads a PNG preview and passes its public image URL", async () => {
    const h = checkoutHarness();
    const body = v3Body(h.exports, BOX_MED);
    body.preview_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aMc0AAAAASUVORK5CYII=";
    await h.invoke(body);
    expect(h.upload).toHaveBeenCalledTimes(1);
    expect(h.params().get("line_items[0][price_data][product_data][images][0]")).toMatch(/^https:\/\/example.com\/checkout-previews\/.+\.png$/);
  });
  it("missing preview performs no upload", async () => {
    const h = checkoutHarness();
    await h.invoke(v3Body(h.exports, BOX_MED));
    expect(h.upload).not.toHaveBeenCalled();
  });
  it("malformed preview is rejected before creating an order", async () => {
    const h = checkoutHarness();
    const body = v3Body(h.exports, BOX_MED);
    body.preview_png = "not-png";
    expect((await h.invoke(body)).status).toBe(400);
    expect(h.insert).not.toHaveBeenCalled();
  });
});

describe("delayed payment settlement", () => {
  it("does not mark an unpaid completed session paid", () => { expect(isSuccessfulCheckout("checkout.session.completed", "unpaid")).toBe(false); });
  it("processes paid delayed methods", () => { expect(isSuccessfulCheckout("checkout.session.async_payment_succeeded", "paid")).toBe(true); });
  it("processes immediate paid methods", () => { expect(isSuccessfulCheckout("checkout.session.completed", "paid")).toBe(true); });
  it("does not process failed delayed payment", () => { expect(isSuccessfulCheckout("checkout.session.async_payment_failed", "unpaid")).toBe(false); });
});
