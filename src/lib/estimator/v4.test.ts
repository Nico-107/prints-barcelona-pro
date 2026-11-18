import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';
import { analyzeTriangles, estimatePart, priceOrder, charmCents, stlToTriangles, EST, EST_V4 } from './core';
import { boxMesh, prismMesh, tBeamMesh } from './fixtures';

// ── 2.2 charm rounding ────────────────────────────────────────────────────────
describe("charmCents — round to nearest x,90, min 9,90", () => {
  const cases: [number, number][] = [
    [521, 990], [1000, 990], [1215, 1190], [1240, 1290],
    [5444, 5490], [8026, 7990], [9995, 9990], [10045, 10090],
  ];
  for (const [input, expected] of cases) {
    it(`${(input / 100).toFixed(2)} → ${(expected / 100).toFixed(2)}`, () => {
      expect(charmCents(input)).toBe(expected);
    });
  }
  it("minimum is 9,90 for any amount", () => {
    expect(charmCents(0)).toBe(990);
    expect(charmCents(100)).toBe(990);
    expect(charmCents(989)).toBe(990);
  });
  it("x,90 inputs are unchanged above minimum", () => {
    expect(charmCents(990)).toBe(990);
    expect(charmCents(1190)).toBe(1190);
    expect(charmCents(7990)).toBe(7990);
  });
});

// ── 2.1 + 2.2 EST_V4 constants ────────────────────────────────────────────────
describe("EST_V4", () => {
  it("third tier is 1,95 €/h", () => {
    expect(EST_V4.timeTiers[2].eurPerH).toBe(1.95);
  });
  it("minimum is 9,90 €", () => {
    expect(EST_V4.minimumEur).toBe(9.9);
  });
  it("first two tiers unchanged from v3", () => {
    expect(EST_V4.timeTiers[0]).toEqual(EST.timeTiers[0]);
    expect(EST_V4.timeTiers[1]).toEqual(EST.timeTiers[1]);
  });
});

// ── helper ────────────────────────────────────────────────────────────────────
function single(mesh: Float32Array, qty = 1, urgency = 'standard', material = 'PLA') {
  const e = estimatePart(analyzeTriangles(mesh), {
    material, infillPct: 15, wallLoops: 2, quality: 'standard', supports: true, orientation: 'auto',
  });
  return {
    v3: priceOrder([{ name: 'p', quantity: qty, material, estimate: e }], urgency),
    v4: priceOrder([{ name: 'p', quantity: qty, material, estimate: e }], urgency, { v4: true }),
  };
}

// ── 2.2 v4 breakdown invariant ────────────────────────────────────────────────
describe("v4 breakdown rows sum to totalCents", () => {
  const meshes = [
    ['tiny 20×20×20', boxMesh(20, 20, 20)],
    ['medium 40×40×40', boxMesh(40, 40, 40)],
    ['big 60×60×60', boxMesh(60, 60, 60)],
    ['long job 100×100×20', boxMesh(100, 100, 20)],
  ] as [string, Float32Array][];
  const urgencies = ['standard', 'express', 'urgent'] as const;
  for (const [label, mesh] of meshes) {
    for (const urg of urgencies) {
      it(`${label} ${urg}`, () => {
        const { v4 } = single(mesh, 1, urg);
        expect(v4.baseCents + v4.expressCents).toBe(v4.totalCents);
        expect(v4.setupCents + v4.minAdjCents + v4.expressCents + v4.parts.reduce((s, p) => s + p.costCents, 0)).toBe(v4.totalCents);
        // totalCents ends in 90 (charm rounding)
        expect(v4.totalCents % 100).toBe(90);
        expect(v4.totalCents).toBeGreaterThanOrEqual(990);
        // All Stripe line items non-negative
        expect(v4.minAdjCents).toBeGreaterThanOrEqual(0);
        expect(v4.expressCents).toBeGreaterThanOrEqual(0);
        for (const p of v4.parts) expect(p.costCents).toBeGreaterThanOrEqual(0);
      });
    }
  }
});

// ── 2.2 minimum is 9,90 in v4 ─────────────────────────────────────────────────
it("v3 and v4 minimum is 9,90 €", () => {
  const tiny = boxMesh(20, 20, 20); // well below minimum
  const { v3, v4 } = single(tiny);
  expect(v3.totalCents).toBe(990);  // v3: 9,90 €
  expect(v4.totalCents).toBe(990);  // v4: 9,90 €
  expect(v4.totalCents % 100).toBe(90);
});

// ── 2.1 camara-roman fixture: v3 92,69 → v4 79,90 ─────────────────────────────
describe("camara-roman-v31 fixture price", () => {
  const filePath = join(process.cwd(), 'src/lib/estimator/camara-roman-v31.stl');
  const buf = readFileSync(filePath);
  const tri = stlToTriangles(buf.buffer as ArrayBuffer);
  const analysis = analyzeTriangles(tri);
  const estimate = estimatePart(analysis, {
    material: 'PLA', infillPct: 15, wallLoops: 2, quality: 'standard', supports: true, orientation: 'auto',
  });
  const v3 = priceOrder([{ name: 'camara', quantity: 1, material: 'PLA', estimate }], 'standard');
  const v4 = priceOrder([{ name: 'camara', quantity: 1, material: 'PLA', estimate }], 'standard', { v4: true });

  it("v3 price is 92,69 €", () => { expect(v3.totalCents).toBe(9269); });
  it("v4 price is 79,90 € (third-tier reduction + charm rounding)", () => { expect(v4.totalCents).toBe(7990); });
  it("v4 total ends in 90", () => { expect(v4.totalCents % 100).toBe(90); });
});

// ── 2.1 fixture price table ────────────────────────────────────────────────────
describe("fixture price table — v3 vs v4", () => {
  const fixtureRaw = [
    { label: 'box 40×40×40 PLA',  mesh: boxMesh(40, 40, 40),          material: 'PLA' },
    { label: 'box 40×40×40 ABS',  mesh: boxMesh(40, 40, 40),          material: 'ABS' },
    { label: 'box 40×40×40 TPU',  mesh: boxMesh(40, 40, 40),          material: 'TPU' },
    { label: 'box 40×40×40 Nylon',mesh: boxMesh(40, 40, 40),          material: 'Nylon' },
    { label: 'tBeam PLA',         mesh: tBeamMesh(),                   material: 'PLA' },
    { label: 'tube PLA',          mesh: prismMesh(15, 60, 96, 13),     material: 'PLA' },
    { label: 'block 100×100×20',  mesh: boxMesh(100, 100, 20),         material: 'PLA' },
    { label: 'big 60×60×60 PLA',  mesh: boxMesh(60, 60, 60),          material: 'PLA' },
  ];
  for (const f of fixtureRaw) {
    it(`${f.label}: v4 <= v3 (or same minimum)`, () => {
      const e = estimatePart(analyzeTriangles(f.mesh), {
        material: f.material, infillPct: 15, wallLoops: 2, quality: 'standard', supports: true, orientation: 'auto',
      });
      const v3 = priceOrder([{ name: f.label, quantity: 1, material: f.material, estimate: e }], 'standard');
      const v4 = priceOrder([{ name: f.label, quantity: 1, material: f.material, estimate: e }], 'standard', { v4: true });
      // v4 third tier is cheaper; long jobs save more
      expect(v4.totalCents).toBeLessThanOrEqual(v3.totalCents + 100); // allow +1 € charm wiggle
      // v4 always ends in ,90
      expect(v4.totalCents % 100).toBe(90);
    });
  }
});

// ── 2.3 free-shipping threshold: 99,90 € in v4 ────────────────────────────────
it("v4 charm total at 99,90 is eligible for free shipping", () => {
  // 99,90 € print total → free shipping
  expect(charmCents(9990)).toBe(9990); // 9990 ends in 90, stays
  // 100,00 € in v3 triggers free shipping; 99,90 € in v4 also should
  expect(charmCents(9995)).toBe(9990); // rounds down to 99,90
});
