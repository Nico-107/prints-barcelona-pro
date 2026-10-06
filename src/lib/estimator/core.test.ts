import { describe, it, expect } from "vitest";
import { analyzeTriangles, estimatePart, priceOrder, stlToTriangles, EST } from "./core";
import type { EstimatorSettings } from "./core";
import { boxMesh, prismMesh, tBeamMesh, toBinaryStl } from "./fixtures";

const S = (material: string, orientation: 'auto' | number = 0, quality: any = 'standard', supports = true, infillPct = 15, wallLoops = 2): EstimatorSettings =>
  ({ material, infillPct, wallLoops, quality, supports, orientation });
const near = (a: number, b: number, rel = 0.0005) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.max(Math.abs(b) * rel, 0.002));
const single = (mesh: Float32Array, s: EstimatorSettings, qty = 1, urgency = 'standard') => {
  const e = estimatePart(analyzeTriangles(mesh), s);
  return { e, p: priceOrder([{ name: 'part', quantity: qty, material: s.material, estimate: e }], urgency) };
};

describe("geometry features (analytic)", () => {
  it("box 40x40x40", () => {
    const a = analyzeTriangles(boxMesh(40, 40, 40)); const o = a.orientations[0];
    near(a.volumeMm3, 64000); near(o.aUp, 1600); near(o.aDown, 1600); near(o.aSide, 6400); near(o.heightMm, 40); expect(o.overhangCm2).toBe(0);
    expect(a.insideOut).toBe(false); expect(a.triangles).toBe(12);
  });
  it("T-beam has exactly 30 cm2 of overhang when printed flange-up, none when flipped", () => {
    const a = analyzeTriangles(tBeamMesh());
    near(a.volumeMm3, 36000); near(a.orientations[0].overhangCm2, 30, 0.001); expect(a.orientations[1].overhangCm2).toBe(0); near(a.orientations[0].heightMm, 35);
  });
  it("inside-out (reversed winding) meshes give identical features", () => {
    const t = tBeamMesh(); const f = new Float32Array(t.length);
    for (let i = 0; i < t.length; i += 9) { f.set(t.slice(i, i + 3), i); f.set(t.slice(i + 6, i + 9), i + 3); f.set(t.slice(i + 3, i + 6), i + 6); }
    const a = analyzeTriangles(f); expect(a.insideOut).toBe(true); near(a.volumeMm3, 36000); near(a.orientations[0].overhangCm2, 30, 0.001);
  });
  it("ASCII and binary STL parse to the same mesh", () => {
    const t = tBeamMesh(); let s = "solid t\n";
    for (let i = 0; i < t.length; i += 9) { s += "facet normal 0 0 0\nouter loop\n"; for (let k = 0; k < 3; k++) s += `vertex ${t[i + 3 * k]} ${t[i + 3 * k + 1]} ${t[i + 3 * k + 2]}\n`; s += "endloop\nendfacet\n"; }
    s += "endsolid t\n";
    const asc = analyzeTriangles(stlToTriangles(new TextEncoder().encode(s).buffer as ArrayBuffer)); const bin = analyzeTriangles(stlToTriangles(toBinaryStl(t)));
    expect(asc.triangles).toBe(bin.triangles); near(asc.volumeMm3, bin.volumeMm3); near(asc.orientations[0].overhangCm2, bin.orientations[0].overhangCm2, 0.001);
  });
  it("degenerate triangles are skipped, not fatal", () => {
    const b = boxMesh(10, 10, 10); const d = new Float32Array(b.length + 9); d.set(b); d.set([1, 1, 1, 1, 1, 1, 1, 1, 1], b.length);
    const a = analyzeTriangles(d); expect(a.skipped).toBe(1); near(a.volumeMm3, 1000);
  });
  it("a 1.3-million-triangle mesh is analysed in well under 3 seconds", () => {
    const base = prismMesh(25, 100, 120); const reps = Math.ceil(1_300_000 / (base.length / 9)); const big = new Float32Array(base.length * reps);
    for (let r = 0; r < reps; r++) big.set(base, r * base.length);
    const t0 = Date.now(); analyzeTriangles(big); expect(Date.now() - t0).toBeLessThan(3000);
  });
});

describe("estimates and prices (golden values from the validated reference implementation)", () => {
  const box = boxMesh(40, 40, 40);
  it("box 40 in each material: grams, time and price", () => {
    let r = single(box, S('PLA')); near(r.e.plasticCm3, 15.217, 0.002); near(r.e.grams, 18.869, 0.002); near(r.e.timeSec, 5466.6, 0.002); expect(r.p.totalCents).toBe(1578);
    r = single(box, S('ABS'));   near(r.e.grams, 15.825, 0.002); near(r.e.timeSec, 5840.7, 0.002); expect(r.p.totalCents).toBe(1852);
    r = single(box, S('TPU'));   near(r.e.grams, 18.260, 0.002); near(r.e.timeSec, 6822.7, 0.002); expect(r.p.totalCents).toBe(2027);
    r = single(box, S('Nylon')); near(r.e.grams, 17.347, 0.002); near(r.e.timeSec, 5466.6, 0.002); expect(r.p.totalCents).toBe(1878);
    expect(r.p.instantEligible).toBe(true);
  });
  it("quality and strength change time, not plastic", () => {
    let r = single(box, S('PETG', 0, 'ultra')); near(r.e.timeSec, 11031.3, 0.002); expect(r.p.totalCents).toBe(2416);
    r = single(box, S('PLA', 0, 'fast')); near(r.e.timeSec, 5045.8, 0.002); expect(r.p.totalCents).toBe(1525);
    r = single(box, S('PLA', 0, 'standard', true, 30, 3)); near(r.e.plasticCm3, 24.652, 0.002); near(r.e.timeSec, 10516.4, 0.002); expect(r.p.totalCents).toBe(2267);
  });
  it("orientation: flange-up T-beam needs supports; auto flips it and saves money", () => {
    const tb = tBeamMesh();
    let r = single(tb, S('PLA', 0)); near(r.e.supportCm3, 9.768, 0.002); near(r.e.grams, 28.547, 0.002); near(r.e.timeSec, 11137.2, 0.002); expect(r.p.totalCents).toBe(2326);
    r = single(tb, S('PLA', 1)); expect(r.e.supportCm3).toBe(0); near(r.e.grams, 16.434, 0.002); near(r.e.timeSec, 3489.8, 0.002); expect(r.p.totalCents).toBe(1318);
    r = single(tb, S('PLA', 'auto')); expect(r.e.orientation).toBe(1); expect(r.p.totalCents).toBe(1318);
    r = single(tb, S('PLA', 0, 'standard', false)); expect(r.e.supportCm3).toBe(0); expect(r.p.totalCents).toBe(1318);   // customer promises no supports
  });
  it("tube, minimum price, express/urgent, long-job tiers, plates", () => {
    let r = single(prismMesh(15, 60, 96, 13), S('PLA')); near(r.e.grams, 11.247, 0.002); expect(r.p.totalCents).toBe(1245);
    r = single(boxMesh(15, 15, 15), S('PLA')); expect(r.p.totalCents).toBe(1000); expect(r.p.minAdjCents).toBe(37);
    const blk = boxMesh(100, 100, 20);
    r = single(blk, S('PLA'), 1, 'express'); expect(r.p.totalCents).toBe(3249); expect(r.p.expressCents).toBe(650);
    r = single(blk, S('PLA'), 1, 'urgent');  expect(r.p.totalCents).toBe(4159); expect(r.p.expressCents).toBe(1560);
    r = single(blk, S('PLA'), 4); expect(r.p.totalCents).toBe(6396); expect(r.p.plates).toBe(2); near(r.p.orderHours, 13.472, 0.002);
  });
  it("limits: over EUR100 and oversize are not instant-buyable", () => {
    let r = single(boxMesh(150, 150, 80), S('PLA')); expect(r.p.instantEligible).toBe(false); expect(r.p.reasons).toContain('over-limit'); expect(r.p.totalCents).toBe(11386);
    r = single(boxMesh(300, 50, 50), S('PLA')); expect(r.p.instantEligible).toBe(false); expect(r.p.reasons.some(x => x.startsWith('oversize'))).toBe(true);
    expect(single(boxMesh(10, 10, 10), S('HIPS')).p.instantEligible).toBe(false);
  });
  it("multi-part order: lines always add up to the total, express is a separate line", () => {
    const A = analyzeTriangles(box), B = analyzeTriangles(tBeamMesh()), C = analyzeTriangles(prismMesh(25, 100, 120));
    const parts = [
      { name: 'box40', quantity: 2, material: 'PETG', estimate: estimatePart(A, S('PETG', 'auto')) },
      { name: 'tBeam', quantity: 1, material: 'PLA', estimate: estimatePart(B, S('PLA', 'auto')) },
      { name: 'cyl50x100', quantity: 4, material: 'ASA', estimate: estimatePart(C, S('ASA', 'auto')) },
    ];
    const std = priceOrder(parts, 'standard'), exp = priceOrder(parts, 'express');
    expect(std.totalCents).toBe(9607); expect(std.parts.map(x => x.costCents)).toEqual([1116, 335, 7356]); expect(std.setupCents).toBe(800);
    expect(exp.totalCents).toBe(12009); expect(exp.expressCents).toBe(2402); expect(exp.plates).toBe(1);
    for (const o of [std, exp]) expect(o.setupCents + o.minAdjCents + o.expressCents + o.parts.reduce((s, x) => s + x.costCents, 0)).toBe(o.totalCents);
    expect(exp.instantEligible).toBe(false); expect(exp.reasons).toContain('over-limit');
  });
  it("random orders: invariants hold (lines sum to total, nothing negative, minimum respected)", () => {
    let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const meshes = [boxMesh(30, 20, 10), prismMesh(12, 40, 48), tBeamMesh(), prismMesh(20, 15, 64, 12), boxMesh(80, 60, 5)];
    const mats = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon']; const us = ['standard', 'express', 'urgent'];
    for (let n = 0; n < 500; n++) {
      const k = 1 + Math.floor(rnd() * 5); const parts = [];
      for (let i = 0; i < k; i++) { const m = mats[Math.floor(rnd() * 6)]; parts.push({ name: 'p' + i, quantity: 1 + Math.floor(rnd() * 20), material: m, estimate: estimatePart(analyzeTriangles(meshes[Math.floor(rnd() * 5)]), S(m, 'auto', ['fast', 'standard', 'high', 'ultra'][Math.floor(rnd() * 4)] as any, rnd() > 0.2, [5, 15, 30][Math.floor(rnd() * 3)], 2 + Math.floor(rnd() * 3))) }); }
      const o = priceOrder(parts, us[Math.floor(rnd() * 3)]);
      expect(o.setupCents + o.minAdjCents + o.expressCents + o.parts.reduce((s, x) => s + x.costCents, 0)).toBe(o.totalCents);
      expect(o.parts.every(x => x.costCents >= 0)).toBe(true); expect(o.totalCents).toBeGreaterThanOrEqual(1000);
    }
  });
  it("calibration constants are the agreed business decisions", () => {
    expect(EST.setupEur).toBe(8); expect(EST.minimumEur).toBe(10); expect(EST.plasticEurPerG).toBe(0.05);
    expect(EST.timeTiers.map(t => t.eurPerH)).toEqual([4.5, 3.5, 2.5]); expect(EST.instantMaxCents).toBe(10000); expect(EST.shippingCents).toBe(590);
    for (const m of ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon']) expect(EST.materials[m].instant).toBe(true);
  });
});
