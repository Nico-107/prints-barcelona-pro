#!/usr/bin/env node
/**
 * The ONLY way to produce test reports that scripts/checkpoint/verify.mjs accepts.
 *
 *   node scripts/checkpoint/run-tests.mjs unit   vitest, every unit test, + coverage of supabase/functions/_shared
 *                                                → reports/vitest.json, reports/coverage-summary.json
 *   node scripts/checkpoint/run-tests.mjs e2e    Playwright, e2e/checkpoint/ only → reports/playwright.json
 *   node scripts/checkpoint/run-tests.mjs full   Playwright, every spec in e2e/ → reports/playwright-full.json
 *                                                (also saved as reports/playwright.json)
 *   node scripts/checkpoint/run-tests.mjs all    unit, then full
 *
 * Anything after "--" is passed to vitest / playwright. Filters (file names, -t, -g, --project, …)
 * mark the reports as partial: fine while iterating, but Q1, Q8 and the final verification need
 * unfiltered runs. These options do not count as filters: --workers/-j, --config/-c, --retries,
 * --timeout, --trace, --update-snapshots/-u, --maxWorkers, --minWorkers, --pool, --silent.
 *
 * Every report gets reports/<name>.fingerprint.json: the source fingerprint the run used
 * (fingerprint.mjs), the report's sha256, the command and its exit code. verify.mjs ignores reports
 * whose fingerprint differs from the current sources. Every mode first rebuilds dist/ when it was not
 * built from the current sources (some unit tests read the prerendered pages), e2e/full stop any old
 * server on the preview port, and live specs never run from here (LIVE is unset). Full output goes to a log file under node_modules/.cache/checkpoint/; the last
 * 80 lines are printed. Long suites: start this in the background and read the log.
 *
 * DO NOT weaken this file (MASTER_PROMPT §0.2 rule 4).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, openSync, closeSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceFingerprint } from './fingerprint.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const R = p => path.join(ROOT, p);
const LOG_DIR = R('node_modules/.cache/checkpoint');
const sha = b => createHash('sha256').update(b).digest('hex');
const fp = () => sourceFingerprint(ROOT).fingerprint;
const buildFp = () => sourceFingerprint(ROOT, { forBuild: true }).fingerprint;
const now = () => new Date().toISOString();

const argv = process.argv.slice(2);
const dd = argv.indexOf('--');
const modes = dd >= 0 ? argv.slice(0, dd) : argv;
const extra = dd >= 0 ? argv.slice(dd + 1) : [];
const MODE = modes[0];
if (modes.length !== 1 || !['unit', 'e2e', 'full', 'all'].includes(MODE)) {
  console.error('Usage: node scripts/checkpoint/run-tests.mjs <unit|e2e|full|all> [-- extra vitest/playwright args]');
  process.exit(2);
}

// ---------- helpers ----------
const NOT_A_FILTER = /^(?:--workers|-j|--config|-c|--retries|--timeout|--trace|--update-snapshots|-u|--maxWorkers|--minWorkers|--max-workers|--pool|--silent)(?:=|$)/;
const TAKES_VALUE = new Set(['--workers', '-j', '--config', '-c', '--retries', '--timeout', '--trace', '--maxWorkers', '--minWorkers', '--max-workers', '--pool']);
function isPartial(args) {
  for (let i = 0; i < args.length; i++) {
    if (!NOT_A_FILTER.test(args[i])) return true;
    if (TAKES_VALUE.has(args[i])) i++;
  }
  return false;
}
const PARTIAL = isPartial(extra);

function env() {
  const e = { ...process.env, FORCE_COLOR: '0' };
  delete e.NO_COLOR;
  delete e.LIVE; // live specs (production, Stripe) never run from here
  return e;
}

function run(label, cmd, args, environment) {
  mkdirSync(LOG_DIR, { recursive: true });
  const log = path.join(LOG_DIR, `${label}-${now().replace(/[:.]/g, '-')}.log`);
  const fd = openSync(log, 'w');
  console.log(`\n$ ${[cmd, ...args].join(' ')}\n  full output: ${path.relative(ROOT, log)}`);
  const r = spawnSync(cmd, args, { cwd: ROOT, env: environment, stdio: ['ignore', fd, fd] });
  closeSync(fd);
  console.log(readFileSync(log, 'utf8').split('\n').slice(-80).join('\n'));
  if (r.error) console.log(`! could not start ${cmd}: ${r.error.message}`);
  return r.status ?? 1;
}

function bumpVersion() {
  const b = R('scripts/checkpoint/bump-version.mjs');
  if (!existsSync(b)) return;
  const r = spawnSync(process.execPath, [b], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0) console.log(`! scripts/checkpoint/bump-version.mjs failed (exit ${r.status}): ${(r.stderr || r.stdout || '').slice(0, 600)}`);
}

function clear(...reports) {
  for (const p of reports) {
    rmSync(R(p), { force: true });
    rmSync(R(p.replace(/\.json$/, '.fingerprint.json')), { force: true });
  }
}

// The repo is public: strip local absolute paths (repo folder, home folder) from committed reports.
function sanitize(report) {
  const abs = R(report);
  const text = readFileSync(abs, 'utf8');
  const clean = text.split(ROOT + path.sep).join('').split(ROOT).join('.').split(os.homedir()).join('~');
  if (clean !== text) writeFileSync(abs, clean);
}

function record(report, suite, before, after, command, exitCode, startedAt) {
  sanitize(report);
  const abs = R(report);
  const rec = {
    report, suite, fingerprint: before, reportSha256: sha(readFileSync(abs)),
    partial: PARTIAL, changedDuringRun: before !== after, exitCode, command,
    startedAt, finishedAt: now(), node: process.version,
  };
  writeFileSync(abs.replace(/\.json$/, '.fingerprint.json'), JSON.stringify(rec, null, 2) + '\n');
  if (rec.changedDuringRun) console.log(`! Source files changed while "${suite}" was running, so ${report} counts as stale. Run it again without editing in parallel.`);
  if (PARTIAL) console.log(`! Extra arguments filter the run, so ${report} is marked partial (fine for iterating; Q1/Q8/final need an unfiltered run).`);
}

function vitestVersion() {
  try { return JSON.parse(readFileSync(R('node_modules/vitest/package.json'), 'utf8')).version; } catch { return 'same-as-vitest'; }
}

function previewPort() {
  let cfg = 'playwright.config.ts';
  for (let i = 0; i < extra.length; i++) {
    const a = extra[i];
    if (a === '--config' || a === '-c') cfg = extra[i + 1] || cfg;
    else if (a.startsWith('--config=')) cfg = a.slice(9);
  }
  try { const m = readFileSync(R(cfg), 'utf8').match(/localhost:(\d{2,5})/); if (m) return Number(m[1]); } catch { /* default */ }
  return 4173;
}

function listeners(port) {
  const r = spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], { encoding: 'utf8' });
  if (r.error) return null;
  return (r.stdout || '').split(/\s+/).filter(Boolean).map(Number).filter(n => n && n !== process.pid);
}

function freePort(port) {
  const pids = listeners(port);
  if (pids === null) { console.log(`(lsof not found: if an old server is running on :${port}, stop it first, or Playwright will reuse it)`); return; }
  if (!pids.length) return;
  console.log(`Stopping the old server on :${port} (pid ${pids.join(', ')}) so the tests use the fresh build.`);
  for (const pid of pids) { try { process.kill(pid, 'SIGTERM'); } catch { /* already gone */ } }
  const sleeper = new Int32Array(new SharedArrayBuffer(4));
  for (let i = 0; i < 20; i++) {
    const left = listeners(port);
    if (!left || !left.length) return;
    Atomics.wait(sleeper, 0, 0, 250);
  }
  console.log(`! Port ${port} is still busy; Playwright may reuse an old server.`);
}

function ensureDist() {
  const marker = R('dist/.checkpoint-source-fingerprint');
  if (existsSync(marker) && readFileSync(marker, 'utf8').trim() === buildFp()) {
    console.log('dist/ is already built from the current sources.');
    return true;
  }
  console.log('Building first so the e2e tests run against the current code (npm run build)…');
  const status = run('build', 'npm', ['run', 'build'], env());
  if (status !== 0) { console.log('! npm run build failed. The tests need a fresh build of the current code: fix the build first.'); return false; }
  mkdirSync(R('dist'), { recursive: true });
  writeFileSync(marker, buildFp() + '\n');
  return true;
}

// ---------- suites ----------
function unit() {
  bumpVersion();
  if (!ensureDist()) return 1; // some unit tests read the prerendered pages in dist/
  mkdirSync(R('reports'), { recursive: true });
  clear('reports/vitest.json', 'reports/coverage-summary.json');
  const hasCoverage = existsSync(R('node_modules/@vitest/coverage-v8/package.json'));
  const covDir = 'node_modules/.cache/checkpoint/coverage';
  const args = ['vitest', 'run', '--reporter=default', '--reporter=json', '--outputFile=reports/vitest.json'];
  if (hasCoverage) {
    args.push('--coverage.enabled=true', '--coverage.provider=v8', '--coverage.reporter=json-summary',
      `--coverage.reportsDirectory=${covDir}`, '--coverage.include=supabase/functions/_shared/**');
  }
  args.push(...extra);
  const startedAt = now();
  const before = fp();
  const status = run('unit', 'npx', args, env());
  const after = fp();
  const command = `npx ${args.join(' ')}`;
  if (!existsSync(R('reports/vitest.json'))) { console.log('! vitest did not write reports/vitest.json (see the log above).'); return status || 1; }
  record('reports/vitest.json', 'unit', before, after, command, status, startedAt);
  if (hasCoverage) {
    const summary = R(path.join(covDir, 'coverage-summary.json'));
    if (existsSync(summary)) {
      copyFileSync(summary, R('reports/coverage-summary.json'));
      record('reports/coverage-summary.json', 'unit', before, after, command, status, startedAt);
    } else console.log('! vitest did not produce a coverage summary (see the log above).');
  } else {
    console.log(`! Coverage skipped: @vitest/coverage-v8 is not installed (needed for Q1). Run: npm i -D @vitest/coverage-v8@${vitestVersion()}`);
  }
  console.log(`\nunit: exit ${status}`);
  return status;
}

function e2e(full) {
  bumpVersion();
  if (!ensureDist()) return 1;
  freePort(previewPort());
  mkdirSync(R('reports'), { recursive: true });
  const report = full ? 'reports/playwright-full.json' : 'reports/playwright.json';
  clear(report, 'reports/playwright.json');
  const args = ['playwright', 'test', ...(full ? [] : ['e2e/checkpoint/']), '--reporter=list,json', ...extra];
  const environment = env();
  environment.PLAYWRIGHT_JSON_OUTPUT_FILE = R(report);
  environment.PLAYWRIGHT_JSON_OUTPUT_NAME = R(report);
  const startedAt = now();
  const before = fp();
  const status = run(full ? 'full' : 'e2e', 'npx', args, environment);
  const after = fp();
  const command = `npx ${args.join(' ')}`;
  if (!existsSync(R(report))) { console.log(`! Playwright did not write ${report} (see the log above).`); return status || 1; }
  record(report, full ? 'full' : 'e2e', before, after, command, status, startedAt);
  if (full) {
    copyFileSync(R(report), R('reports/playwright.json'));
    record('reports/playwright.json', 'full', before, after, command, status, startedAt);
  }
  console.log(`\n${full ? 'full' : 'e2e'}: exit ${status}`);
  return status;
}

let code;
if (MODE === 'unit') code = unit();
else if (MODE === 'e2e') code = e2e(false);
else if (MODE === 'full') code = e2e(true);
else { const a = unit(); const b = e2e(true); code = a || b; }
console.log('Next: node scripts/checkpoint/verify.mjs');
process.exit(code ? 1 : 0);
