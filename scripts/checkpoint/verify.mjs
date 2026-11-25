#!/usr/bin/env node
/**
 * Dimension3D checkpoint verifier.
 *
 *   node scripts/checkpoint/verify.mjs            -> quick + status (no shell commands)
 *   node scripts/checkpoint/verify.mjs --final    -> everything, including shell commands
 *   node scripts/checkpoint/verify.mjs --hook     -> machine-readable last line (used by stop-hook.mjs)
 *
 * Exit code 0 only when every item is status "done" AND all its checks pass
 * (and, with --final, all shell commands pass too).
 *
 * Test reports (reports/*.json) only count when scripts/checkpoint/run-tests.mjs produced them for the
 * current source code (see fingerprint.mjs).
 *
 * DO NOT weaken this file. You may ADD check types or items. CHECKLIST.lock.json pins the checks of
 * every original item; any change to them fails verification.
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceFingerprint } from './fingerprint.mjs';

// Repo root = two levels above this file (scripts/checkpoint/verify.mjs), whatever the cwd is.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = new Set(process.argv.slice(2));
const FINAL = args.has('--final');
const HOOK = args.has('--hook');
const CK = path.join(ROOT, 'docs/checkpoint/CHECKLIST.json');
const LOCK = path.join(ROOT, 'docs/checkpoint/CHECKLIST.lock.json');

const out = [];
const log = (s = '') => { out.push(s); };

function canon(x) {
  if (Array.isArray(x)) return '[' + x.map(canon).join(',') + ']';
  if (x && typeof x === 'object') {
    return '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}';
  }
  return JSON.stringify(x);
}
const sha = s => createHash('sha256').update(s).digest('hex');
const rel = p => path.join(ROOT, p);
const read = p => readFileSync(rel(p), 'utf8');

// ---------- file walking & tiny glob ----------
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'dist-ssr', 'playwright-report', 'test-results', '.verify', 'reports']);
function walk(dir, acc = []) {
  let entries = [];
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), acc); }
    else acc.push(path.join(dir, e.name));
  }
  return acc;
}
let ALL_FILES = null;
function allFiles() { if (!ALL_FILES) ALL_FILES = walk(ROOT).map(f => path.relative(ROOT, f).split(path.sep).join('/')); return ALL_FILES; }
function globToRe(g) {
  let re = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*') { if (g[i + 1] === '*') { re += '.*'; i++; if (g[i + 1] === '/') i++; } else re += '[^/]*'; }
    else if ('.+?^${}()|[]\\'.includes(c)) re += '\\' + c;
    else re += c;
  }
  return new RegExp('^' + re + '$');
}
function filesFor(globs) {
  const res = globs.map(globToRe);
  return allFiles().filter(f => res.some(r => r.test(f)));
}
const TEXT_EXT = /\.(ts|tsx|js|mjs|cjs|json|md|sql|toml|html|css|txt|yml|yaml)$/i;

// ---------- freshness of test reports (content fingerprints, see fingerprint.mjs) ----------
// A report counts only if scripts/checkpoint/run-tests.mjs wrote it for exactly the current sources:
// reports/<name>.fingerprint.json must hold the current source fingerprint and the report's sha256.
let CUR_FP = null;
function currentFingerprint() {
  if (CUR_FP === null) CUR_FP = sourceFingerprint(ROOT).fingerprint;
  return CUR_FP;
}
function freshReport(p) {
  const how = 'node scripts/checkpoint/run-tests.mjs (MASTER_PROMPT §0.5)';
  if (!existsSync(rel(p))) return { ok: false, why: `${p} missing — produce it with ${how}` };
  const rp = p.replace(/\.json$/, '.fingerprint.json');
  if (!existsSync(rel(rp))) return { ok: false, why: `${rp} missing — ${p} only counts when produced by ${how}` };
  let rec;
  try { rec = JSON.parse(read(rp)); } catch (e) { return { ok: false, why: `cannot parse ${rp}: ${e.message}` }; }
  const again = `re-run node scripts/checkpoint/run-tests.mjs ${rec.suite || ''}`.trim();
  if (rec.reportSha256 !== sha(readFileSync(rel(p)))) return { ok: false, why: `${p} differs from what run-tests.mjs recorded (edited or replaced afterwards) — ${again}` };
  if (rec.changedDuringRun) return { ok: false, why: `${p}: source files changed while the tests were running — ${again}` };
  if (rec.fingerprint !== currentFingerprint()) return { ok: false, why: `${p} is stale: source files changed after that run (${rec.finishedAt || 'unknown time'}) — ${again}` };
  return { ok: true, rec };
}
const partialWhy = (p, suite) => `${p} comes from a filtered/partial run — run node scripts/checkpoint/run-tests.mjs ${suite} without filters`;

// ---------- report parsing ----------
let VITEST = null;
function vitest() {
  if (VITEST) return VITEST;
  const p = 'reports/vitest.json';
  const f = freshReport(p);
  if (!f.ok) return (VITEST = { error: f.why });
  try { VITEST = { data: JSON.parse(read(p)), rec: f.rec }; } catch (e) { VITEST = { error: `cannot parse ${p}: ${e.message}` }; }
  return VITEST;
}
const PW_CACHE = {};
function playwright(p = 'reports/playwright.json') {
  if (PW_CACHE[p]) return PW_CACHE[p];
  const f = freshReport(p);
  if (!f.ok) return (PW_CACHE[p] = { error: f.why });
  try { PW_CACHE[p] = { data: JSON.parse(read(p)), rec: f.rec }; } catch (e) { PW_CACHE[p] = { error: `cannot parse ${p}: ${e.message}` }; }
  return PW_CACHE[p];
}
function pwSpecs(data) {
  const specs = [];
  const visit = (suite, file) => {
    const f = suite.file || file;
    for (const sp of suite.specs || []) specs.push({ file: sp.file || f || '', title: sp.title, ok: sp.ok, tests: sp.tests || [] });
    for (const s of suite.suites || []) visit(s, f);
  };
  for (const s of data.suites || []) visit(s, s.file);
  return specs;
}

// ---------- checks ----------
function check(c) {
  switch (c.type) {
    case 'file': {
      if (!existsSync(rel(c.path))) return [false, `missing file ${c.path}`];
      const size = statSync(rel(c.path)).size;
      return size >= (c.minBytes ?? 1) ? [true] : [false, `${c.path} too small (${size} B)`];
    }
    case 'contains': {
      if (!existsSync(rel(c.path))) return [false, `missing file ${c.path}`];
      const n = (read(c.path).match(new RegExp(c.pattern, 'g' + (c.flags || ''))) || []).length;
      return n >= (c.min ?? 1) ? [true] : [false, `${c.path}: /${c.pattern}/ found ${n}× (need ≥ ${c.min ?? 1})`];
    }
    case 'present': {
      const re = new RegExp(c.pattern, c.flags || '');
      const files = filesFor(c.glob).filter(f => TEXT_EXT.test(f));
      const hit = files.find(f => { try { return re.test(read(f)); } catch { return false; } });
      return hit ? [true] : [false, `/${c.pattern}/ not found in ${c.glob.join(', ')}`];
    }
    case 'absent': {
      const re = new RegExp(c.pattern, c.flags || '');
      const files = filesFor(c.glob).filter(f => TEXT_EXT.test(f));
      const hits = files.filter(f => { try { return re.test(read(f)); } catch { return false; } });
      return hits.length === 0 ? [true] : [false, `/${c.pattern}/ must be absent but found in: ${hits.slice(0, 5).join(', ')}`];
    }
    case 'dir_count': {
      if (!existsSync(rel(c.path))) return [false, `missing dir ${c.path}`];
      const n = readdirSync(rel(c.path)).filter(f => f.endsWith(c.ext) && (!c.prefix || f.startsWith(c.prefix))).length;
      return n >= c.min ? [true] : [false, `${c.path}: ${n} ${c.prefix || ''}*${c.ext} files (need ≥ ${c.min})`];
    }
    case 'vitest': {
      if (!existsSync(rel(c.file))) return [false, `missing test file ${c.file}`];
      const v = vitest();
      if (v.error) return [false, v.error];
      const r = (v.data.testResults || []).find(t => (t.name || '').split(path.sep).join('/').endsWith(c.file));
      if (!r) return [false, `${c.file} not in reports/vitest.json — run the full vitest command`];
      const failed = (r.assertionResults || []).filter(a => a.status !== 'passed');
      const passed = (r.assertionResults || []).filter(a => a.status === 'passed').length;
      if (r.status !== 'passed' || failed.length) return [false, `${c.file}: ${failed.length} not passed (${failed.slice(0, 3).map(a => a.title).join(' | ')})`];
      if (passed === 0) return [false, `${c.file}: no passing assertions`];
      return [true];
    }
    case 'vitest_all': {
      const v = vitest();
      if (v.error) return [false, v.error];
      if (v.rec && v.rec.partial) return [false, partialWhy('reports/vitest.json', 'unit')];
      const d = v.data;
      if ((d.numFailedTests ?? 1) !== 0 || (d.numFailedTestSuites ?? 0) !== 0) return [false, `vitest: ${d.numFailedTests} failed tests, ${d.numFailedTestSuites} failed suites`];
      if ((d.numPassedTests ?? 0) < 1) return [false, 'vitest: no passed tests'];
      return [true];
    }
    case 'playwright': {
      if (!existsSync(rel(c.file))) return [false, `missing spec ${c.file}`];
      const p = playwright();
      if (p.error) return [false, p.error];
      const base = c.file.replace(/^e2e\//, '');
      const specs = pwSpecs(p.data).filter(s => s.file.split(path.sep).join('/').endsWith(base));
      if (!specs.length) return [false, `${c.file} not in reports/playwright.json — run e2e/checkpoint with the json reporter`];
      const bad = specs.filter(s => !s.ok);
      const ran = specs.filter(s => s.tests.some(t => (t.results || []).some(r => r.status === 'passed')));
      if (bad.length) return [false, `${c.file}: ${bad.length} failing (${bad.slice(0, 3).map(s => s.title).join(' | ')})`];
      if (!ran.length) return [false, `${c.file}: nothing actually passed (all skipped?)`];
      return [true];
    }
    case 'playwright_report_ok': {
      const p = playwright(c.path);
      if (p.error) return [false, p.error];
      if (p.rec && p.rec.partial) return [false, partialWhy(c.path, 'full')];
      const st = p.data.stats || {};
      if ((st.unexpected ?? 1) !== 0) return [false, `${c.path}: ${st.unexpected} unexpected results`];
      if ((st.expected ?? 0) < 1) return [false, `${c.path}: no expected results`];
      return [true];
    }
    case 'coverage': {
      if (!existsSync(rel(c.path))) return [false, `missing ${c.path} — run node scripts/checkpoint/run-tests.mjs unit (needs @vitest/coverage-v8)`];
      const f = freshReport(c.path); if (!f.ok) return [false, f.why];
      if (f.rec && f.rec.partial) return [false, partialWhy(c.path, 'unit')];
      const data = JSON.parse(read(c.path));
      let cov = 0, tot = 0;
      for (const [file, v] of Object.entries(data)) {
        if (file === 'total') continue;
        if (!file.split(path.sep).join('/').includes(c.prefix)) continue;
        cov += v.lines?.covered ?? 0; tot += v.lines?.total ?? 0;
      }
      if (!tot) return [false, `no coverage entries for ${c.prefix}`];
      const pct = (100 * cov) / tot;
      return pct >= c.min ? [true] : [false, `${c.prefix}: ${pct.toFixed(1)} % lines (need ≥ ${c.min} %)`];
    }
    case 'final_report': {
      const p = 'docs/checkpoint/FINAL_REPORT.md';
      if (!existsSync(rel(p))) return [false, `missing ${p}`];
      const txt = read(p);
      const ids = JSON.parse(readFileSync(CK, 'utf8')).items.map(i => i.id);
      const missing = ids.filter(id => !new RegExp('\\|\\s*' + id.replace('.', '\\.') + '\\s*\\|').test(txt));
      if (missing.length) return [false, `FINAL_REPORT.md lacks rows for: ${missing.join(', ')}`];
      if (!/Traceability/i.test(txt)) return [false, 'FINAL_REPORT.md lacks the traceability table'];
      return [true];
    }
    case 'cmd': {
      if (c.final && !FINAL) return [null, 'final-only'];
      const r = spawnSync(c.run, { cwd: ROOT, shell: true, encoding: 'utf8', timeout: 45 * 60 * 1000, maxBuffer: 256 * 1024 * 1024 });
      if (r.status === 0) return [true];
      const tail = ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(-6).join(' ⏎ ');
      return [false, `command failed (${r.status}): ${c.run} :: ${tail}`];
    }
    default:
      return [false, `unknown check type ${c.type}`];
  }
}

// ---------- main ----------
if (!existsSync(CK)) { console.error('CHECKLIST.json missing'); process.exit(2); }
const doc = JSON.parse(readFileSync(CK, 'utf8'));
const lock = existsSync(LOCK) ? JSON.parse(readFileSync(LOCK, 'utf8')) : null;

let tamper = [];
if (!lock) tamper.push('CHECKLIST.lock.json missing');
else {
  const byId = Object.fromEntries(doc.items.map(i => [i.id, i]));
  for (const [id, h] of Object.entries(lock.items)) {
    if (!byId[id]) { tamper.push(`item ${id} was removed`); continue; }
    if (sha(canon(byId[id].checks)) !== h) tamper.push(`checks of ${id} were changed`);
  }
}

let done = 0, pending = [], failing = [], skippedFinal = 0;
for (const it of doc.items) {
  const problems = [];
  for (const c of it.checks) {
    let res;
    try { res = check(c); } catch (e) { res = [false, `check crashed: ${e.message}`]; }
    if (res[0] === null) { skippedFinal++; continue; }
    if (!res[0]) problems.push(res[1]);
  }
  const isDone = it.status === 'done';
  if (isDone && !problems.length) { done++; log(`✔ ${it.id}  ${it.title}`); }
  else if (!isDone) { pending.push({ id: it.id, title: it.title, problems }); log(`… ${it.id}  ${it.title}  [${it.status}]${problems.length ? '  — ' + problems[0] : ''}`); }
  else { failing.push({ id: it.id, title: it.title, problems }); log(`✘ ${it.id}  ${it.title}  — ${problems.join(' ; ')}`); }
}

const total = doc.items.length;
log('');
if (tamper.length) log('TAMPER: ' + tamper.join(' ; '));
const ok = !tamper.length && pending.length === 0 && failing.length === 0;
const summary = `${FINAL ? 'FINAL' : 'QUICK'}: ${done}/${total} items verified, ${failing.length} failed, ${pending.length} pending${skippedFinal && !FINAL ? `, ${skippedFinal} final-only checks not run` : ''}`;
log(summary);
if (ok && FINAL) log(`CHECKPOINT VERIFIED: ${total}/${total} items, 0 failed, 0 pending`);

if (HOOK) {
  const next = [...failing, ...pending].slice(0, 12).map(x => `${x.id} ${x.title}${x.problems[0] ? ' — ' + x.problems[0] : ''}`);
  process.stdout.write(out.slice(-3).join('\n') + '\n' + JSON.stringify({ ok, final: FINAL, done, total, failing: failing.length, pending: pending.length, tamper, next }) + '\n');
} else {
  process.stdout.write(out.join('\n') + '\n');
}
process.exit(ok ? 0 : 1);
