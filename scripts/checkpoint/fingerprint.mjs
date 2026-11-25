/**
 * Content fingerprint of everything that can change a test result.
 *
 * Used by run-tests.mjs (records the fingerprint a report was produced for) and by verify.mjs
 * (a report only counts if its recorded fingerprint equals the current one). Content-based, so git
 * checkouts, merges and touched-but-unchanged files never make a report look stale, and any real
 * change to a source file always does.
 *
 * DO NOT weaken this file (MASTER_PROMPT §0.2 rule 4).
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readlinkSync } from 'node:fs';
import path from 'node:path';

// Files whose content can change what the unit/e2e tests see.
export const SOURCE_RE =
  /^(?:(?:src|supabase|e2e|scripts|public|test-fixtures|tests\/fixtures|qa\/fixtures)\/|(?:vite|vitest|playwright|tailwind|postcss)\.config\.[cm]?[jt]s$|tsconfig[^/]*\.json$|package(?:-lock)?\.json$|index\.html$|vercel\.json$)/;

// The checkpoint's own tooling, notes and test OUTPUTS (screenshots): editing them must not
// invalidate test reports.
export const EXCLUDED = new Set([
  'scripts/checkpoint/verify.mjs',
  'scripts/checkpoint/fingerprint.mjs',
  'scripts/checkpoint/run-tests.mjs',
  'scripts/checkpoint/stop-hook.mjs',
  'scripts/checkpoint/install-hook.mjs',
]);
const EXCLUDED_RE = /^test-fixtures\/.*\.md$|(?:^|\/)(?:screens|screenshots)\//;

// Test-only files: they cannot change what `npm run build` produces (used for the dist/ marker).
const TEST_ONLY_RE = /^(?:e2e|test-fixtures|tests\/fixtures|qa\/fixtures|src\/__checkpoint__)\/|\.(?:test|spec)\.[cm]?[jt]sx?$|^(?:playwright|vitest)\.config\./;

/** Tracked + untracked (not ignored) source files, repo-relative, sorted. */
export function sourceFiles(root) {
  const out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    cwd: root, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024,
  });
  return [...new Set(out.split('\0').filter(Boolean))]
    .filter(f => SOURCE_RE.test(f) && !EXCLUDED.has(f) && !EXCLUDED_RE.test(f))
    .sort();
}

/**
 * sha256 over (path, sha1(content)) of every source file. Deleted files are skipped.
 * { forBuild: true } leaves out test-only files (fingerprint of what the build depends on).
 */
export function sourceFingerprint(root, { forBuild = false } = {}) {
  const h = createHash('sha256');
  let files = 0;
  for (const f of sourceFiles(root)) {
    if (forBuild && TEST_ONLY_RE.test(f)) continue;
    const abs = path.join(root, f);
    let st;
    try { st = lstatSync(abs); } catch { continue; }
    let data;
    if (st.isSymbolicLink()) data = Buffer.from('symlink:' + readlinkSync(abs));
    else if (st.isFile()) data = readFileSync(abs);
    else continue;
    h.update(f + '\0' + createHash('sha1').update(data).digest('hex') + '\n');
    files++;
  }
  return { fingerprint: h.digest('hex'), files };
}
