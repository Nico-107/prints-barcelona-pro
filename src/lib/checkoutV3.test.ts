import { describe, it, expect } from "vitest";
import { analyzeTriangles } from "./estimator/core";
import { boxMesh, tBeamMesh } from "./estimator/fixtures";
import { evaluateV3, priceV3, stripeLinesV3, validateV3 } from "./checkoutV3";

const ANALYSES = [analyzeTriangles(boxMesh(40, 40, 40)), analyzeTriangles(tBeamMesh())];
const makeBody = (): any => ({ pricingVersion: 3, urgency: "standard", fulfillment: "pickup", exactPrice: 0, pieces: [
  { name: "box.stl", quantity: 2, path: "1-box.stl", material: "PETG", infill: 15, wallLoops: 2, quality: "standard", supports: true, orientation: "auto" },
  { name: "t.stl", quantity: 1, path: "1-t.stl", material: "Nylon", infill: 30, wallLoops: 3, quality: "high", supports: true, orientation: "auto" } ] });
const priced = () => { const b = makeBody(); b.exactPrice = priceV3(validateV3(b).value as any, ANALYSES).order.totalCents / 100; return b; };
const reject = (mut: (b: any) => void, analyses = ANALYSES): string => { const b = priced(); mut(b); const r = evaluateV3(b, analyses); return r.ok ? "ACCEPTED" : (r.error as string); };

describe("checkout v3 contract (the SAME code runs in the edge function)", () => {
  it("accepts a valid order, charges exactly the computed total, and Stripe lines add up", () => {
    const b = priced(); const r = evaluateV3(b, ANALYSES); expect(r.ok).toBe(true);
    const v = r.value!;
    expect(v.priced.order.totalCents).toBe(3657); expect(v.shippingCents).toBe(0); expect(v.chargeCents).toBe(3657);
    const lines = stripeLinesV3(v.priced, v.body.pieces, "es");
    expect(lines.reduce((s, l) => s + l.cents, 0)).toBe(v.priced.order.totalCents); expect(lines.at(-1)?.name).toBe("Preparación del pedido");
    expect(lines.every(l => l.name.length <= 120 && l.cents > 0)).toBe(true);
  });
  it("shipping is EUR 5.90 and sits outside the print total", () => {
    const b = priced(); b.fulfillment = "shipping"; const r = evaluateV3(b, ANALYSES);
    expect(r.ok).toBe(true); expect(r.value!.shippingCents).toBe(590); expect(r.value!.chargeCents).toBe(3657 + 590);
  });
  it("rejects every kind of bad request with the right code", () => {
    expect(reject(b => { delete b.urgency; })).toBe("INVALID_URGENCY");              // the bug that once broke checkout
    expect(reject(b => { b.urgency = "next_day"; })).toBe("INVALID_URGENCY");
    expect(reject(b => { b.fulfillment = "delivery"; })).toBe("INVALID_FULFILLMENT");
    expect(reject(b => { b.exactPrice = "12"; })).toBe("INVALID_PRICE");
    expect(reject(b => { b.pieces = []; })).toBe("INVALID_PIECES");
    expect(reject(b => { b.pieces = Array(21).fill(b.pieces[0]); })).toBe("INVALID_PIECES");
    expect(reject(b => { b.pieces[0].material = "HIPS"; })).toBe("INVALID_MATERIAL");
    expect(reject(b => { b.pieces[0].infill = 80; })).toBe("INVALID_INFILL");
    expect(reject(b => { b.pieces[0].infill = 25; })).toBe("INVALID_INFILL");
    expect(reject(b => { b.pieces[0].wallLoops = 6; })).toBe("INVALID_WALLS");
    expect(reject(b => { b.pieces[0].quantity = 0; })).toBe("INVALID_QUANTITY");
    expect(reject(b => { b.pieces[0].quality = "insane"; })).toBe("INVALID_QUALITY");
    expect(reject(b => { b.pieces[0].supports = "yes"; })).toBe("INVALID_SUPPORTS");
    expect(reject(b => { b.pieces[0].orientation = 7; })).toBe("INVALID_ORIENTATION");
    expect(reject(b => { b.pieces[0].path = "../secret"; })).toBe("INVALID_PATH");
    expect(reject(b => { b.pieces[0].multicolour = true; })).toBe("INSTANT_NOT_AVAILABLE");
    expect(reject(b => { b.exactPrice = 12; })).toBe("PRICE_MISMATCH");                  // tampered
    expect(reject(b => { b.urgency = "express"; })).toBe("PRICE_MISMATCH");              // client forgot to re-price
  });
  it("ABS, ASA and Nylon are instant-buy materials now", () => {
    for (const m of ["ABS", "ASA", "Nylon", "TPU", "PETG", "PLA"]) expect(reject(b => { b.pieces[0].material = m; b.exactPrice = -1; })).not.toBe("INVALID_MATERIAL");
  });
  it("over EUR 100 and parts that do not fit the plate are refused", () => {
    const big = [analyzeTriangles(boxMesh(150, 150, 80))]; const b = makeBody(); b.pieces = [{ ...b.pieces[0], quantity: 1 }];
    b.exactPrice = priceV3(validateV3(b).value as any, big).order.totalCents / 100; expect(evaluateV3(b, big).error).toBe("PRICE_ABOVE_INSTANT_LIMIT");
    const huge = [analyzeTriangles(boxMesh(300, 50, 50))]; const c = makeBody(); c.pieces = [{ ...c.pieces[0], quantity: 1 }];
    c.exactPrice = priceV3(validateV3(c).value as any, huge).order.totalCents / 100; expect(evaluateV3(c, huge).error).toBe("OVERSIZE_PART");
  });
});
