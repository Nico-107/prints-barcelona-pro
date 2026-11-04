import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { MAX_CHARGE_CENTS, applyCheckoutPolicy, chargeAllowed, decodePreviewPng, shippingChargeCents } from "../../supabase/functions/create-instant-checkout/checkout-policy";
import { isSuccessfulCheckout } from "../../supabase/functions/stripe-webhook/payment-policy";

function checkoutHarness() {
  let handler: (request: Request) => Promise<Response> = async () => new Response();
  let sessionParams = new URLSearchParams();
  const insert = vi.fn();
  const upload = vi.fn(async () => ({ error: null }));
  const client = {
    from: () => ({ insert: (row: unknown) => { insert(row); return { select: () => ({ single: async () => ({ data: { id: "test-order", order_number: 123 }, error: null }) }) }; } }),
    storage: { from: () => ({ upload, getPublicUrl: (path: string) => ({ data: { publicUrl: `https://example.com/${path}` } }) }) },
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

const base = { material: "PLA", exactPrice: 25, fulfillment: "shipping", quantity: 1 };

describe("deployed checkout policies", () => {
  it("allows €206 but rejects €206.01", async () => {
    const h = checkoutHarness();
    expect((await h.invoke({ ...base, exactPrice: 206, fulfillment: "pickup" })).status).toBe(200);
    expect(await (await h.invoke({ ...base, exactPrice: 206.01, fulfillment: "pickup" })).json()).toEqual({ error: "PRICE_ABOVE_INSTANT_LIMIT" });
  });
  it("keeps the legacy material whitelist", async () => {
    expect(await (await checkoutHarness().invoke({ ...base, material: "pla" })).json()).toEqual({ error: "INVALID_MATERIAL" });
  });
  it("charges €5.90 separately with the print amount unchanged", async () => {
    const h = checkoutHarness(); await h.invoke(base);
    expect(h.params().get("line_items[0][price_data][unit_amount]")).toBe("2500");
    expect(h.params().get("line_items[1][price_data][unit_amount]")).toBe("590");
    expect(h.params().get("line_items[1][price_data][product_data][name]")).toBe("Envío");
  });
  it("uses the discounted subtotal for the inclusive €100 free shipping threshold", () => {
    expect(shippingChargeCents("shipping", 9999)).toBe(590);
    expect(shippingChargeCents("shipping", 10000)).toBe(0);
    expect(shippingChargeCents("shipping", 11100 - 1110)).toBe(590);
    expect(shippingChargeCents("shipping", 11200 - 1120)).toBe(0);
  });
  it("adds the €0 shipping line at €100", async () => {
    const h = checkoutHarness(); await h.invoke({ ...base, exactPrice: 100 });
    expect(h.params().get("line_items[1][price_data][unit_amount]")).toBe("0");
  });
  it("uses automatic payment selection and auto locale", async () => {
    const h = checkoutHarness(); await h.invoke(base);
    expect(h.params().get("locale")).toBe("auto");
    expect([...h.params().keys()].some(key => key.startsWith("payment_method_types"))).toBe(false);
    expect(h.params().has("payment_intent_data[capture_method]")).toBe(false);
  });
  it("collects shipping only for the requested 11 countries", async () => {
    const h = checkoutHarness(); await h.invoke(base);
    expect([...h.params()].filter(([key]) => key.startsWith("shipping_address_collection")).map(([, value]) => value)).toEqual(["ES", "PT", "FR", "IT", "DE", "NL", "BE", "AT", "IE", "LU", "PL"]);
  });
  it("pickup collects phone but no shipping address or fee", async () => {
    const h = checkoutHarness(); await h.invoke({ ...base, fulfillment: "pickup" });
    expect(h.params().get("phone_number_collection[enabled]")).toBe("true");
    expect([...h.params().keys()].some(key => key.startsWith("shipping_address_collection") || key.startsWith("line_items[1]"))).toBe(false);
  });
  it("uploads a PNG preview and passes its public image URL", async () => {
    const h = checkoutHarness();
    await h.invoke({ ...base, preview_png: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aMc0AAAAASUVORK5CYII=" });
    expect(h.upload).toHaveBeenCalledTimes(1);
    expect(h.params().get("line_items[0][price_data][product_data][images][0]")).toMatch(/^https:\/\/example.com\/checkout-previews\/.+\.png$/);
  });
  it("missing preview performs no upload", async () => {
    const h = checkoutHarness(); await h.invoke(base); expect(h.upload).not.toHaveBeenCalled();
  });
  it("malformed preview is rejected before creating an order", async () => {
    const h = checkoutHarness(); expect((await h.invoke({ ...base, preview_png: "not-png" })).status).toBe(400); expect(h.insert).not.toHaveBeenCalled();
  });
});

describe("delayed payment settlement", () => {
  it("does not mark an unpaid completed session paid", () => { expect(isSuccessfulCheckout("checkout.session.completed", "unpaid")).toBe(false); });
  it("processes paid delayed methods", () => { expect(isSuccessfulCheckout("checkout.session.async_payment_succeeded", "paid")).toBe(true); });
  it("processes immediate paid methods", () => { expect(isSuccessfulCheckout("checkout.session.completed", "paid")).toBe(true); });
  it("does not process failed delayed payment", () => { expect(isSuccessfulCheckout("checkout.session.async_payment_failed", "unpaid")).toBe(false); });
});