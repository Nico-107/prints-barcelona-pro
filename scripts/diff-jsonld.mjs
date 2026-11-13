import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function extractJsonLd(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1]);
}
const routes = ["/madrid", "/impresion-3d-cerca-de-mi", "/3d-printing-delivery-lisbon"];
for (const route of routes) {
  const main = readFileSync(`.main-worktree/dist${route}/index.html`, "utf-8");
  const now = readFileSync(`dist${route}/index.html`, "utf-8");
  const a = extractJsonLd(main);
  const b = extractJsonLd(now);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? "") !== (b[i] ?? "")) {
      console.log(`=== ${route} JSON-LD[${i}] ===`);
      // Find the first differing substring.
      const s1 = a[i] ?? "", s2 = b[i] ?? "";
      let p = 0;
      while (p < s1.length && p < s2.length && s1[p] === s2[p]) p++;
      console.log("BEFORE:", JSON.stringify(s1.slice(Math.max(0, p - 30), p + 120)));
      console.log("AFTER :", JSON.stringify(s2.slice(Math.max(0, p - 30), p + 120)));
    }
  }
}
