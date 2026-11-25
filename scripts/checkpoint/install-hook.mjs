#!/usr/bin/env node
/**
 * Adds the checkpoint Stop hook to .claude/settings.json (creates the file if needed and keeps any
 * existing settings). Run once from the repo before starting Claude Code:
 *   node scripts/checkpoint/install-hook.mjs
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const P = path.join(ROOT, '.claude', 'settings.json');
const COMMAND = 'node "$CLAUDE_PROJECT_DIR/scripts/checkpoint/stop-hook.mjs"';

let settings = {};
if (existsSync(P)) {
  try { settings = JSON.parse(readFileSync(P, 'utf8')); } catch (e) {
    console.error(`.claude/settings.json is not valid JSON (${e.message}). Fix or remove it, then run this again.`);
    process.exit(1);
  }
}
if (settings.disableAllHooks === true) {
  console.error('.claude/settings.json has "disableAllHooks": true, so neither the Stop hook nor /goal would work. Remove that line and run this again.');
  process.exit(1);
}
settings.hooks = settings.hooks || {};
settings.hooks.Stop = settings.hooks.Stop || [];
const already = JSON.stringify(settings.hooks.Stop).includes('scripts/checkpoint/stop-hook.mjs');
if (!already) settings.hooks.Stop.push({ hooks: [{ type: 'command', command: COMMAND, timeout: 120 }] });
mkdirSync(path.dirname(P), { recursive: true });
writeFileSync(P, JSON.stringify(settings, null, 2) + '\n');
console.log(already ? 'Checkpoint Stop hook was already installed in .claude/settings.json.' : 'Checkpoint Stop hook installed in .claude/settings.json.');
if (!existsSync(path.join(ROOT, 'docs/checkpoint/ACTIVE'))) console.log('Note: docs/checkpoint/ACTIVE is missing, so the hook is inactive.');
