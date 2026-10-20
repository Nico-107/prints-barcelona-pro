#!/usr/bin/env node
/**
 * npm run xp:report
 *
 * Reads PostHog HogQL query API to compute per-variant statistics for each
 * enabled experiment. Prints a report to stdout and writes a markdown file to
 * docs/experiments/report-YYYY-MM-DD.md.
 *
 * Required env vars (in .env):
 *   POSTHOG_PERSONAL_API_KEY   — read-only personal key
 *   POSTHOG_PROJECT_ID         — numeric project ID (e.g. 208342)
 *
 * Optional flags:
 *   --dry-run    Print the HogQL queries without executing them.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

// ── env loading ────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const DRY_RUN = process.argv.includes('--dry-run');

// ── experiment registry (static copy — keeps the script standalone) ─────────

const REGISTRY = [
  {
    id: 'header_btn_r2',
    layer: 'header',
    variants: ['A', 'B'],
    primaryMetric: 'instant_checkout_initiated',
    guardrailMetrics: ['whatsapp_click'],
    startedOn: '2026-10-19',
    minDays: 21,
    maxDays: 56,
    enabled: true,
  },
  {
    id: 'modal_actions_r1',
    layer: 'checkout_modal',
    variants: ['A', 'B', 'C'],
    primaryMetric: 'instant_checkout_initiated',
    guardrailMetrics: ['whatsapp_click'],
    startedOn: '2026-10-20',
    minDays: 21,
    maxDays: 56,
    enabled: true,
  },
  {
    id: 'home_proof_r1',
    layer: 'home_body',
    variants: ['A', 'B', 'C'],
    primaryMetric: 'upload_started',
    startedOn: '2026-10-20',
    minDays: 21,
    maxDays: 56,
    enabled: true,
  },
  {
    id: 'upload_area_r1',
    layer: 'upload_area',
    variants: ['A', 'B', 'C'],
    primaryMetric: 'upload_started',
    startedOn: '2026-10-20',
    minDays: 21,
    maxDays: 56,
    enabled: true,
  },
];

// ── Bayesian statistics ──────────────────────────────────────────────────────

const RNG_SEED = 42;

/** Seeded PRNG (mulberry32) */
function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Gamma(alpha, 1) sample via Marsaglia-Tsang squeeze method (alpha >= 1).
 * Falls back to Gamma(alpha+1) * U^(1/alpha) for alpha < 1.
 */
function gammaSample(rng, alpha) {
  if (alpha < 1) {
    return gammaSample(rng, alpha + 1) * rng() ** (1 / alpha);
  }
  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x, v;
    do {
      x = normalSample(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    const x2 = x * x;
    if (u < 1 - 0.0331 * (x2 * x2)) return d * v;
    if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) return d * v;
  }
}

/** Standard normal sample via Box-Muller. */
function normalSample(rng) {
  const u1 = rng() || 1e-10;
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Beta(alpha, beta) sample via ratio of Gamma samples.
 * Works correctly for all positive alpha, beta values.
 */
function betaSample(rng, alpha, beta) {
  const x = gammaSample(rng, alpha);
  const y = gammaSample(rng, beta);
  return x / (x + y);
}

/**
 * Bayesian analysis for a set of variants.
 * Returns { probBeatControl, expectedLoss } for each non-control variant.
 * Uses Beta(1 + conversions, 1 + n - conversions) prior.
 * 20k Monte Carlo draws, seeded.
 */
export function bayesianAnalysis(variants, nDraws = 20000) {
  const rng = seededRng(RNG_SEED);
  const draws = variants.map(v => {
    const alpha = 1 + v.conversions;
    const beta = 1 + v.n - v.conversions;
    return Array.from({ length: nDraws }, () => betaSample(rng, alpha, beta));
  });

  const controlDraws = draws[0];
  const results = variants.map((v, i) => {
    if (i === 0) return { ...v, probBeatControl: null, expectedLoss: null };
    const variantDraws = draws[i];
    let beatCount = 0;
    let lossSum = 0;
    for (let j = 0; j < nDraws; j++) {
      if (variantDraws[j] > controlDraws[j]) beatCount++;
      lossSum += Math.max(0, controlDraws[j] - variantDraws[j]);
    }
    return {
      ...v,
      probBeatControl: beatCount / nDraws,
      expectedLoss: lossSum / nDraws,
    };
  });

  return results;
}

/**
 * Decision rule.
 * WINNER:        P(beat control) >= 0.95, minDays elapsed, >= 100 exposed per variant
 * NO DIFFERENCE: maxDays elapsed
 * KEEP RUNNING:  otherwise
 */
export function decisionRule({ probBeatControl, daysRunning, minDays, maxDays, exposedPerVariant }) {
  if (
    probBeatControl !== null &&
    probBeatControl >= 0.95 &&
    daysRunning >= minDays &&
    exposedPerVariant >= 100
  ) return 'WINNER';
  if (daysRunning >= maxDays) return 'NO DIFFERENCE';
  return 'KEEP RUNNING';
}

// ── HogQL query helpers ──────────────────────────────────────────────────────

function exposureQuery(experimentId) {
  return `
SELECT
  properties.variant AS variant,
  count(DISTINCT person_id) AS exposed
FROM events
WHERE event = 'experiment_exposure'
  AND properties.experiment = '${experimentId}'
  AND toDate(timestamp) >= toDate('${startedOnForId(experimentId)}')
GROUP BY variant
ORDER BY variant
  `.trim();
}

function conversionQuery(experimentId, metric) {
  return `
SELECT
  e.variant,
  count(DISTINCT c.person_id) AS conversions
FROM (
  SELECT
    person_id,
    properties.variant AS variant,
    min(timestamp) AS first_exposure
  FROM events
  WHERE event = 'experiment_exposure'
    AND properties.experiment = '${experimentId}'
    AND toDate(timestamp) >= toDate('${startedOnForId(experimentId)}')
  GROUP BY person_id, variant
) AS e
JOIN events AS c
  ON c.person_id = e.person_id
  AND c.timestamp >= e.first_exposure
  AND c.event = '${metric}'
GROUP BY e.variant
ORDER BY e.variant
  `.trim();
}

function startedOnForId(id) {
  return REGISTRY.find(r => r.id === id)?.startedOn ?? '2026-01-01';
}

// ── PostHog API ──────────────────────────────────────────────────────────────

async function hogql(query) {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!key || !projectId) {
    throw new Error('POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID must be set in .env');
  }
  const res = await fetch(`https://eu.posthog.com/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PostHog API error ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.results ?? [];
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [`# Experiment Report — ${today}`, ''];

  for (const xp of REGISTRY.filter(r => r.enabled)) {
    const expQ = exposureQuery(xp.id);
    const convQ = conversionQuery(xp.id, xp.primaryMetric);

    if (DRY_RUN) {
      console.log(`\n=== ${xp.id} — exposure query ===\n${expQ}`);
      console.log(`\n=== ${xp.id} — conversion query (${xp.primaryMetric}) ===\n${convQ}`);
      if (xp.guardrailMetrics) {
        for (const g of xp.guardrailMetrics) {
          console.log(`\n=== ${xp.id} — guardrail query (${g}) ===\n${conversionQuery(xp.id, g)}`);
        }
      }
      continue;
    }

    console.log(`Fetching ${xp.id}…`);

    let exposureRows, convRows;
    try {
      [exposureRows, convRows] = await Promise.all([
        hogql(expQ),
        hogql(convQ),
      ]);
    } catch (err) {
      console.error(`  ${err.message}`);
      lines.push(`## ${xp.id}`, '', `> Error: ${err.message}`, '');
      continue;
    }

    // Build per-variant data
    const exposedMap = Object.fromEntries(exposureRows.map(r => [r[0], Number(r[1])]));
    const convMap    = Object.fromEntries(convRows.map(r => [r[0], Number(r[1])]));

    const startDate = new Date(xp.startedOn);
    const daysRunning = Math.floor((Date.now() - startDate.getTime()) / 86400000);

    const variantData = xp.variants.map(v => ({
      variant: v,
      n: exposedMap[v] ?? 0,
      conversions: convMap[v] ?? 0,
    }));

    const analyzed = bayesianAnalysis(variantData);

    lines.push(`## ${xp.id}`, '');
    lines.push(`Layer: \`${xp.layer}\` · Primary metric: \`${xp.primaryMetric}\` · Days running: ${daysRunning}/${xp.maxDays}`);
    lines.push('');
    lines.push('| Variant | Exposed | Conversions | Rate | P(beat A) | Exp. loss | Decision |');
    lines.push('|---------|---------|-------------|------|-----------|-----------|----------|');

    for (const row of analyzed) {
      const rate = row.n > 0 ? (row.conversions / row.n * 100).toFixed(1) + '%' : '—';
      const prob = row.probBeatControl !== null ? (row.probBeatControl * 100).toFixed(1) + '%' : 'control';
      const loss = row.expectedLoss !== null ? row.expectedLoss.toFixed(4) : '—';
      const decision = row.variant === 'A' ? '—' : decisionRule({
        probBeatControl: row.probBeatControl,
        daysRunning,
        minDays: xp.minDays,
        maxDays: xp.maxDays,
        exposedPerVariant: Math.min(row.n, variantData[0].n),
      });
      lines.push(`| ${row.variant} | ${row.n} | ${row.conversions} | ${rate} | ${prob} | ${loss} | ${decision} |`);
    }

    lines.push('');

    // Guardrail metrics
    if (xp.guardrailMetrics?.length) {
      for (const g of xp.guardrailMetrics) {
        const gRows = await hogql(conversionQuery(xp.id, g));
        const gMap = Object.fromEntries(gRows.map(r => [r[0], Number(r[1])]));
        lines.push(`**Guardrail: \`${g}\`**`);
        lines.push('');
        lines.push('| Variant | Conversions | Rate |');
        lines.push('|---------|-------------|------|');
        for (const v of xp.variants) {
          const n = exposedMap[v] ?? 0;
          const c = gMap[v] ?? 0;
          const rate = n > 0 ? (c / n * 100).toFixed(1) + '%' : '—';
          lines.push(`| ${v} | ${c} | ${rate} |`);
        }
        lines.push('');
      }
    }
  }

  if (DRY_RUN) {
    console.log('\n[dry-run] No queries were executed.');
    return;
  }

  const output = lines.join('\n');
  console.log('\n' + output);

  const outDir = path.join(ROOT, 'docs', 'experiments');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `report-${today}.md`);
  fs.writeFileSync(outFile, output + '\n');
  console.log(`\nReport written to ${outFile}`);
}

// Only execute when run directly (not when imported by tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
