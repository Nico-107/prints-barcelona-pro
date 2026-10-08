// Submit URLs to IndexNow (Bing, Yandex, Naver, Seznam).
// Google does not use IndexNow; submit there via Google Search Console instead.
//
// Usage:
//   node scripts/indexnow.mjs                  — submit every URL in dist/sitemap.xml
//   node scripts/indexnow.mjs /foo /bar/baz     — submit only these paths
//
// Run manually after each Vercel deploy that changes pages (see docs/seo-indexnow.md).
// Do NOT run as part of the build.

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const HOST = "www.dimension3dprints.com";
const KEY = "53a326533ad9c012c9c17143626f9eed";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP = resolve(root, "dist/sitemap.xml");

function readSitemapUrls(xmlPath) {
  const xml = readFileSync(xmlPath, "utf-8");
  const urls = [];
  const re = /<loc>(.*?)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) urls.push(m[1].trim());
  return urls;
}

// Collect URLs to submit
let urlList;
const args = process.argv.slice(2);
if (args.length > 0) {
  urlList = args.map((p) => `https://${HOST}${p.startsWith("/") ? p : "/" + p}`);
} else {
  if (!existsSync(SITEMAP)) {
    console.error("dist/sitemap.xml not found — run npm run build first.");
    process.exit(1);
  }
  urlList = readSitemapUrls(SITEMAP);
}

if (urlList.length === 0) {
  console.log("No URLs to submit.");
  process.exit(0);
}

const MAX_PER_CALL = 10_000;
const chunks = [];
for (let i = 0; i < urlList.length; i += MAX_PER_CALL) {
  chunks.push(urlList.slice(i, i + MAX_PER_CALL));
}

console.log(`Submitting ${urlList.length} URL(s) in ${chunks.length} call(s)…`);

for (const [i, chunk] of chunks.entries()) {
  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: chunk,
  });

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body,
  });

  console.log(`Chunk ${i + 1}/${chunks.length}: HTTP ${res.status} ${res.statusText}`);
}
