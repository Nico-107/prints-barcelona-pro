#!/usr/bin/env node
/**
 * Claude Code Stop hook for the Dimension3D checkpoint (installed by scripts/checkpoint/install-hook.mjs).
 * While docs/checkpoint/ACTIVE exists, Claude may not end its turn until verify.mjs passes.
 * To release it manually (Nico): delete docs/checkpoint/ACTIVE.
 *
 * DO NOT weaken this file (MASTER_PROMPT §0.2 rule 4).
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
try { readFileSync(0, 'utf8'); } catch { /* stdin is optional */ }

if (!existsSync(path.join(ROOT, 'docs/checkpoint/ACTIVE'))) process.exit(0);

const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/checkpoint/verify.mjs'), '--hook'], {
  cwd: ROOT, encoding: 'utf8', timeout: 110000,
});
const lines = (r.stdout || '').trim().split('\n');
let s = null;
try { s = JSON.parse(lines[lines.length - 1]); } catch { /* handled below */ }

let reason;
if (!s) {
  reason = `The checkpoint verifier crashed or printed nothing (exit ${r.status}). stderr: ${(r.stderr || '').slice(0, 800)}. Find out why (missing git? syntax error in CHECKLIST.json?) and fix the cause without weakening any check, then continue with the next pending item in docs/checkpoint/CHECKLIST.json. Do not stop and do not ask Nico.`;
} else if (s.tamper && s.tamper.length) {
  reason = `CHECKLIST tampering detected: ${s.tamper.join('; ')}. Restore the original checks from the kickoff commit (git log --diff-filter=A -- docs/checkpoint/CHECKLIST.lock.json), then continue. Do not stop.`;
} else if (s.ok) {
  reason = 'Every checklist item passes the quick checks. Now finish per MASTER_PROMPT §12 R6 and docs/checkpoint/GOAL.txt: (1) commit and push everything, run `node scripts/checkpoint/verify.mjs --final` and fix whatever it reports; (2) when it prints "CHECKPOINT VERIFIED", delete docs/checkpoint/ACTIVE, commit "CP R6: checkpoint complete" and push; (3) print the final proof commands listed in GOAL.txt with their raw output. Only then may you stop.';
} else {
  reason = `Checkpoint not finished: ${s.done}/${s.total} verified, ${s.failing} failing, ${s.pending} pending. Work on these next, in order:\n- ${s.next.join('\n- ')}\nKeep going without asking Nico anything. After each item update its status + evidence in docs/checkpoint/CHECKLIST.json and PROGRESS.md.`;
}
process.stdout.write(JSON.stringify({ decision: 'block', reason }));
process.exit(0);
