// Ad-hoc query: file_mb at server_measure_sent (= bytes actually uploaded,
// after client simplification) vs the raw upload at the 'read' stage. Shows
// where the 30 MB server limit bites in reality.
// Run: node scripts/query-file-mb.mjs
const key = process.env.POSTHOG_PERSONAL_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID;
if (!key || !projectId) { console.error("env missing"); process.exit(1); }

async function hog(query) {
  const res = await fetch(`https://eu.posthog.com/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
  });
  if (!res.ok) throw new Error(`PostHog ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()).results ?? [];
}

const buckets = (stage) => `
SELECT
  '${stage}' AS stage,
  countIf(toFloat(properties.file_mb) <= 5) AS le_5,
  countIf(toFloat(properties.file_mb) > 5 AND toFloat(properties.file_mb) <= 10) AS b5_10,
  countIf(toFloat(properties.file_mb) > 10 AND toFloat(properties.file_mb) <= 20) AS b10_20,
  countIf(toFloat(properties.file_mb) > 20 AND toFloat(properties.file_mb) <= 28) AS b20_28,
  countIf(toFloat(properties.file_mb) > 28 AND toFloat(properties.file_mb) <= 30) AS b28_30,
  countIf(toFloat(properties.file_mb) > 30 AND toFloat(properties.file_mb) <= 60) AS b30_60,
  countIf(toFloat(properties.file_mb) > 60) AS gt_60,
  count() AS total
FROM events
WHERE event = 'upload_pipeline_stage'
  AND properties.stage = '${stage}'
  AND timestamp >= now() - INTERVAL 30 DAY
  AND properties.file_mb IS NOT NULL
`;

for (const s of ["read", "server_measure_sent", "server_measure_failed"]) {
  const [row] = await hog(buckets(s));
  if (!row) continue;
  const [, le5, b5, b10, b20, b28, b30, gt60, total] = row;
  const pct = (n) => total ? ((n / total) * 100).toFixed(1) + "%" : "0%";
  console.log(`\n--- stage='${s}' (n=${total}, last 30d) ---`);
  console.log(`  ≤5 MB:    ${le5}  (${pct(le5)})`);
  console.log(`  5-10:     ${b5}  (${pct(b5)})`);
  console.log(`  10-20:    ${b10}  (${pct(b10)})`);
  console.log(`  20-28:    ${b20}  (${pct(b20)})`);
  console.log(`  28-30:    ${b28}  (${pct(b28)})`);
  console.log(`  30-60:    ${b30}  (${pct(b30)})  ← > server per-file limit`);
  console.log(`  >60:      ${gt60}  (${pct(gt60)})  ← > server total limit`);
}

console.log("\n\ncheckout_failed by code (last 30d):");
for (const r of await hog(`SELECT properties.code AS code, count() AS n FROM events WHERE event='checkout_failed' AND timestamp >= now() - INTERVAL 30 DAY GROUP BY code ORDER BY n DESC`))
  console.log(`  ${r[0] ?? "(null)"}: ${r[1]}`);

console.log("\nFILE_TOO_LARGE errors — file_mb values on failed attempts:");
const rows = await hog(`SELECT toFloat(properties.file_mb) AS mb, properties.device AS dev FROM events WHERE event='upload_pipeline_stage' AND properties.stage='server_measure_failed' AND properties.error_message LIKE 'FILE_TOO_LARGE%' AND timestamp >= now() - INTERVAL 30 DAY ORDER BY timestamp DESC LIMIT 20`);
for (const r of rows) console.log(`  ${r[0]} MB  (${r[1]})`);
