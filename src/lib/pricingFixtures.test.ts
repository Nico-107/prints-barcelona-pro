/**
 * Prompt 2 — end-to-end pricing test for the fixtures in /test-fixtures.
 *
 * Runs every file through the SAME pipeline the StlEstimator uses on the
 * live site: parse STL → prepareMeshForPricing (analyse + repair if messy)
 * → computeBundleWithCap (standard pricing + 1.6× volume cap).
 *
 * Assertions:
 *   - overpriced_stamp_22693_shells.stl : €10.00 – 12.00
 *   - control_stamp_clean.stl           : €10.00 – 12.00
 *   - ai_staircase_cutter_365k_tris.stl : €10.00 – 12.90
 *   - control_cutter_clean.stl          : €10.00 – 11.00
 *   - control clean STLs (cube-20mm,
 *     small-cube, camara-roman-v31)     : unchanged within €0.10 before/after
 *
 * Prints a human-readable table so the proof paste makes sense at a glance.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { stlToTriangles, analyzeTriangles } from './estimator/core';
import { prepareMeshForPricing } from './prepareMeshForPricing';
import { computeBundleWithCap } from './pricingWithCap';
import { computeBundleV3 } from './estimate';
import type { ParsedFile, PartDefaults } from './pricing';

const DEFAULTS: PartDefaults = {
  material: 'PLA',
  color: '',
  infill: 15,
  wallLoops: 2,
  multicolour: false,
  quality: 'standard',
  supports: true,
  orientation: 'auto',
};

interface Row {
  name: string;
  tris: number;
  shells: number;
  watertight: boolean;
  repaired: boolean;
  usedFallback: boolean;
  priceCapped: boolean;
  areaCm2: number;
  volumeCm3: number;
  grams: number;
  hours: number;
  priceEur: number;
  elapsedMs: number;
}

async function priceFixture(absPath: string, label: string): Promise<Row> {
  const buf = readFileSync(absPath);
  // Copy into a plain ArrayBuffer (readFileSync returns a Node Buffer whose
  // underlying ArrayBuffer is shared and may be larger than the slice).
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  const tri = stlToTriangles(ab);
  const prep = await prepareMeshForPricing(tri);
  const parsed: ParsedFile = {
    id: 'fixture',
    name: label,
    sizeBytes: buf.byteLength,
    volumeMm3: prep.analysis.volumeMm3,
    qty: 1,
    analysis: prep.analysis,
  };
  const bundle = computeBundleWithCap(
    [parsed],
    DEFAULTS,
    'standard',
    { partsAreMessy: !prep.quality.watertight || prep.quality.shells > 1 },
  );
  if (!bundle) throw new Error('bundle null for ' + label);
  const row: Row = {
    name: label,
    tris: prep.quality.triangles,
    shells: prep.quality.shells,
    watertight: prep.quality.watertight,
    repaired: prep.repaired,
    usedFallback: prep.usedFallback,
    priceCapped: bundle.priceCapped,
    areaCm2: prep.quality.totalSurfaceCm2,
    volumeCm3: prep.analysis.volumeMm3 / 1000,
    grams: bundle.totalGrams,
    hours: bundle.totalHours,
    priceEur: bundle.order.totalCents / 100,
    elapsedMs: prep.elapsedMs,
  };
  return row;
}

function priceRawOnly(absPath: string, label: string): Row {
  // "Before" — no repair, no cap, no prep: raw stlToTriangles + analyzeTriangles
  // + computeBundleV3 directly. Shows how bad it was.
  const buf = readFileSync(absPath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  const tri = stlToTriangles(ab);
  const analysis = analyzeTriangles(tri);
  const parsed: ParsedFile = {
    id: 'raw',
    name: label,
    sizeBytes: buf.byteLength,
    volumeMm3: analysis.volumeMm3,
    qty: 1,
    analysis,
  };
  // Direct v3 price, no cap.
  const bundle = computeBundleV3([parsed], DEFAULTS, 'standard');
  if (!bundle) throw new Error('raw bundle null for ' + label);
  return {
    name: label,
    tris: analysis.triangles,
    shells: 0,
    watertight: false,
    repaired: false,
    usedFallback: false,
    priceCapped: false,
    areaCm2: 0,
    volumeCm3: analysis.volumeMm3 / 1000,
    grams: bundle.totalGrams,
    hours: bundle.totalHours,
    priceEur: bundle.order.totalCents / 100,
    elapsedMs: 0,
  };
}

function printTable(title: string, rows: Row[]) {
  const header = ['file', 'tris', 'shells', 'repaired', 'area(cm²)', 'vol(cm³)', 'grams', 'hours', 'price'];
  const pad = (s: string, n: number) => s.padEnd(n, ' ');
  const widths = [40, 8, 7, 9, 10, 9, 7, 7, 8];
  console.log('\n' + title);
  console.log(header.map((h, i) => pad(h, widths[i])).join(' | '));
  console.log(widths.map(w => '-'.repeat(w)).join('-+-'));
  for (const r of rows) {
    const flags = r.priceCapped ? 'CAP' : r.repaired ? 'yes' : r.usedFallback ? 'FALL' : '—';
    const cols = [
      r.name,
      String(r.tris),
      String(r.shells),
      flags,
      r.areaCm2.toFixed(0),
      r.volumeCm3.toFixed(1),
      r.grams.toFixed(1),
      r.hours.toFixed(2),
      '€' + r.priceEur.toFixed(2),
    ];
    console.log(cols.map((c, i) => pad(c, widths[i])).join(' | '));
  }
}

const FIX = (name: string) => resolve(process.cwd(), 'test-fixtures', name);

describe('Prompt 2 — pricing fixture test', () => {
  it('prices every fixture inside its range, clean files unchanged', async () => {
    const after: Row[] = [];
    const before: Row[] = [];

    // --- Fixtures from test-fixtures/ ---
    const fixtures: Array<{ file: string; min: number; max: number }> = [
      { file: 'overpriced_stamp_22693_shells.stl', min: 10.0, max: 12.0 },
      { file: 'control_stamp_clean.stl',           min: 10.0, max: 12.0 },
      { file: 'ai_staircase_cutter_365k_tris.stl', min: 10.0, max: 12.9 },
      { file: 'control_cutter_clean.stl',          min: 10.0, max: 11.0 },
    ];
    for (const f of fixtures) {
      const abs = FIX(f.file);
      after.push(await priceFixture(abs, f.file));
      before.push(priceRawOnly(abs, f.file));
    }

    // --- Three clean STLs to prove we didn't regress clean prices ---
    const cleanPaths = [
      resolve(process.cwd(), 'tests/fixtures/cube-20mm.stl'),
      resolve(process.cwd(), 'qa/fixtures/small-cube.stl'),
      resolve(process.cwd(), 'src/lib/estimator/camara-roman-v31.stl'),
    ];
    const cleanAfter: Row[] = [];
    const cleanBefore: Row[] = [];
    for (const p of cleanPaths) {
      const label = p.split('/').pop()!;
      cleanAfter.push(await priceFixture(p, label));
      cleanBefore.push(priceRawOnly(p, label));
    }

    printTable('BEFORE (raw analyzeTriangles, no repair, no cap)', [...before, ...cleanBefore]);
    printTable('AFTER  (prepareMeshForPricing + computeBundleWithCap)', [...after, ...cleanAfter]);

    // --- Range assertions on the 4 fixtures ---
    for (let i = 0; i < fixtures.length; i++) {
      const row = after[i];
      const { min, max, file } = fixtures[i];
      expect(row.priceEur, `${file} price should be ≥ €${min}`).toBeGreaterThanOrEqual(min);
      expect(row.priceEur, `${file} price should be ≤ €${max}`).toBeLessThanOrEqual(max);
    }

    // --- Clean files must not regress more than €0.10 ---
    for (let i = 0; i < cleanAfter.length; i++) {
      const delta = Math.abs(cleanAfter[i].priceEur - cleanBefore[i].priceEur);
      expect(delta, `clean ${cleanAfter[i].name} changed by €${delta.toFixed(2)} — should be ≤ €0.10`).toBeLessThanOrEqual(0.10);
    }
  }, 60_000);
});
