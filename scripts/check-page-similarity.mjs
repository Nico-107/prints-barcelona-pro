#!/usr/bin/env node
/**
 * Checks that no two pages in the same language are too similar.
 * Reads built HTML from dist/, extracts <main> text, builds 5-word shingles,
 * and computes Jaccard similarity for every within-language pair.
 *
 * Exits 1 if any pair exceeds 0.35 (spec limit).
 * Prints the 5 highest-scoring pairs regardless.
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// All new intl routes grouped by language
const INTL_ROUTES = {
  de: [
    "/de/3d-druck-service",
    "/de/3d-druck-berlin",
    "/de/3d-druck-muenchen",
    "/de/3d-druck-hamburg",
    "/de/3d-druck-kosten",
    "/de/3d-druck-datei-vorbereiten",
    "/de/3d-druck-materialien",
    "/de/vesa-monitor-adapter",
    "/de/bosch-geschirrspuelkorb-rad",
    "/de/gardena-schlauch-adapter",
  ],
  nl: [
    "/nl/3d-printen-laten-maken",
    "/nl/3d-printen-amsterdam",
    "/nl/3d-printen-rotterdam",
    "/nl/3d-printen-eindhoven",
    "/nl/3d-printen-kosten",
    "/nl/3d-printbestand-voorbereiden",
    "/nl/3d-print-materialen",
    "/nl/vesa-monitor-adapter",
  ],
  fr: [
    "/fr/impression-3d-en-ligne",
    "/fr/impression-3d-toulouse",
    "/fr/impression-3d-montpellier",
    "/fr/impression-3d-lyon",
    "/fr/impression-3d-paris",
    "/fr/prix-impression-3d",
    "/fr/preparer-fichier-impression-3d",
    "/fr/materiaux-impression-3d",
    "/fr/adaptateur-vesa-moniteur",
    "/fr/roue-panier-lave-vaisselle-bosch",
  ],
  it: [
    "/it/stampa-3d-online",
    "/it/stampa-3d-milano",
    "/it/stampa-3d-torino",
    "/it/stampa-3d-roma",
    "/it/prezzi-stampa-3d",
    "/it/preparare-file-stampa-3d",
    "/it/materiali-stampa-3d",
    "/it/adattatore-vesa-monitor",
    "/it/imbuto-dosatore-caffe-58mm",
  ],
  pt: [
    "/pt/impressao-3d-online",
    "/pt/impressao-3d-lisboa",
    "/pt/impressao-3d-porto",
    "/pt/preco-impressao-3d",
    "/pt/preparar-ficheiro-impressao-3d",
    "/pt/materiais-impressao-3d",
  ],
};

/** Strip HTML tags, collapse whitespace, return lowercase tokens */
function extractText(html) {
  // Extract <main>…</main> content
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const text = mainMatch ? mainMatch[1] : html;
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/[^\w\s]/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

/** Build a set of 5-word shingles from a token array */
function shingles(tokens, n = 5) {
  const s = new Set();
  for (let i = 0; i <= tokens.length - n; i++) {
    s.add(tokens.slice(i, i + n).join(" "));
  }
  return s;
}

/** Jaccard similarity between two shingle sets */
function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const x of a) {
    if (b.has(x)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}

let allPairs = [];
let failures = [];
let missing = [];

for (const [lang, routes] of Object.entries(INTL_ROUTES)) {
  // Load shingles for each route
  const shingleSets = [];
  for (const route of routes) {
    const htmlPath = resolve(root, "dist", route.slice(1), "index.html");
    if (!existsSync(htmlPath)) {
      missing.push(route);
      shingleSets.push(null);
      continue;
    }
    const html = readFileSync(htmlPath, "utf-8");
    const tokens = extractText(html);
    shingleSets.push({ route, shingles: shingles(tokens) });
  }

  // Compare every pair
  const valid = shingleSets.filter(Boolean);
  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      const score = jaccard(valid[i].shingles, valid[j].shingles);
      allPairs.push({
        lang,
        a: valid[i].route,
        b: valid[j].route,
        score,
      });
      if (score > 0.35) {
        failures.push({ lang, a: valid[i].route, b: valid[j].route, score });
      }
    }
  }
}

// Sort by descending score
allPairs.sort((a, b) => b.score - a.score);

console.log("\n── Top 5 most-similar pairs ──");
for (const p of allPairs.slice(0, 5)) {
  const flag = p.score > 0.35 ? " ❌ ABOVE THRESHOLD" : "";
  console.log(`  ${p.score.toFixed(3)}  [${p.lang}]  ${p.a}  ↔  ${p.b}${flag}`);
}

if (missing.length > 0) {
  console.log(`\n⚠  ${missing.length} route(s) not built yet (skipped):`);
  missing.forEach((r) => console.log(`   ${r}`));
}

if (failures.length > 0) {
  console.error(`\n❌ check-page-similarity FAILED — ${failures.length} pair(s) above 0.35:`);
  failures.forEach((p) =>
    console.error(`   ${p.score.toFixed(3)}  [${p.lang}]  ${p.a}  ↔  ${p.b}`)
  );
  process.exit(1);
}

const checked = allPairs.length;
console.log(`\n✅ check-page-similarity: ${checked} pair(s) checked, none above 0.35`);
