#!/usr/bin/env node
/**
 * Verifies that each enabled experiment's four data-xp-slot elements contain
 * DISTINCT content in the prerendered HTML. If all four slots share the same
 * content, SSR rendered the control fallback in every version slot — which
 * means the client will re-render and cause a React 18 hydration mismatch.
 *
 * Run automatically after the prerender step (see package.json build script).
 * Checked files: dist/index.html and dist/ca/index.html.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Parse enabled experiment IDs from experimentsConfig.ts (line-by-line, no TS runtime)
const configSrc = readFileSync(resolve(root, "src/lib/experimentsConfig.ts"), "utf-8");
const enabledIds = configSrc
  .split("\n")
  .filter((line) => /^\s+\w+:/.test(line) && /enabled:\s*true/.test(line))
  .map((line) => line.match(/^\s+(\w+):/)[1]);

if (enabledIds.length === 0) {
  console.log("[check-xp-ssr-text] No enabled experiments found — skipping.");
  process.exit(0);
}

/**
 * Extract all text content (strips inner tags) from the innerHTML of the
 * first element matching the given data-xp-slot + data-xp-v attributes.
 * Returns null if no element is found.
 */
function extractSlotContent(html, id, v) {
  // Match the opening tag of the slot element (either attribute order)
  const openRe = new RegExp(
    `(<[a-z][^>]*data-xp-slot="${id}"[^>]*data-xp-v="${v}"[^>]*>` +
    `|<[a-z][^>]*data-xp-v="${v}"[^>]*data-xp-slot="${id}"[^>]*>)`
  );
  const openMatch = html.match(openRe);
  if (!openMatch) return null;

  const afterOpen = html.slice(openMatch.index + openMatch[0].length);

  // Determine tag name to find matching close tag
  const tagMatch = openMatch[0].match(/^<([a-z][a-z0-9]*)/i);
  const tag = tagMatch ? tagMatch[1] : "div";

  // Walk forward to find the matching closing tag (handles nesting)
  let depth = 1;
  let pos = 0;
  const openTagRe = new RegExp(`<${tag}[\\s>]`, "gi");
  const closeTagRe = new RegExp(`</${tag}>`, "gi");

  while (depth > 0 && pos < afterOpen.length) {
    openTagRe.lastIndex = pos;
    closeTagRe.lastIndex = pos;
    const nextOpen = openTagRe.exec(afterOpen);
    const nextClose = closeTagRe.exec(afterOpen);
    if (!nextClose) break;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
      pos = nextOpen.index + 1;
    } else {
      depth--;
      pos = nextClose.index + nextClose[0].length;
    }
  }

  const innerHTML = depth === 0
    ? afterOpen.slice(0, pos - `</${tag}>`.length)
    : afterOpen.slice(0, 200); // fallback: grab first 200 chars

  // Strip all HTML tags to get plain text, collapse whitespace
  return innerHTML.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const FILES = [
  resolve(root, "dist/index.html"),
  resolve(root, "dist/ca/index.html"),
];

let errors = 0;

for (const filePath of FILES) {
  const html = readFileSync(filePath, "utf-8");
  // Strip <style> blocks so CSS selector strings don't produce false matches
  const body = html.replace(/<style[\s\S]*?<\/style>/g, "");

  console.log(`\n=== ${filePath.replace(root + "/", "")} ===`);

  const COL = 38;
  console.log(
    `${"Experiment".padEnd(22)} ${"v1".padEnd(COL)} ${"v2".padEnd(COL)} ${"v3".padEnd(COL)} v4`
  );
  console.log("─".repeat(22 + (COL + 1) * 4));

  for (const id of enabledIds) {
    const texts = [];
    for (let v = 1; v <= 4; v++) {
      const raw = extractSlotContent(body, id, v);
      texts.push(raw !== null ? raw : "(not found)");
    }

    console.log(
      `${id.padEnd(22)} ${texts.map((t) => t.slice(0, COL - 1).padEnd(COL)).join(" ")}`
    );

    const found = texts.filter((t) => t !== "(not found)");

    if (found.length === 0) {
      console.error(`  [WARN] No slot elements found for ${id} — check slot selector`);
      continue;
    }

    const unique = new Set(found);
    if (unique.size === 1) {
      console.error(
        `  [FAIL] All ${found.length} found slots have identical content: "${[...unique][0].slice(0, 80)}"\n` +
        `         This means xpText() still uses active/langOk instead of language.`
      );
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(
    `\n[check-xp-ssr-text] FAIL: ${errors} experiment(s) have identical slot texts — hydration mismatch likely.`
  );
  process.exit(1);
} else {
  console.log("\n[check-xp-ssr-text] OK: all experiments have distinct slot texts.");
}
