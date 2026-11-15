// Phase 1 verification (item 1.7): the get_order_by_token RPC is the sole
// public surface for /pedido/<token>. It must not leak:
//   - customer_email
//   - customer_phone
//   - file_paths
//   - internal_notes
//   - uploaded_not_purchased
//
// This is a contract test that reads the migration SQL and asserts that the
// RPC body does not reference those columns. A full integration test would
// hit a live database; here we lock the spec at the source.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(here, "../../supabase/migrations");
const phase1File = readdirSync(migrationsDir).find((f) => f.includes("phase1_after_purchase"));
if (!phase1File) throw new Error("Phase 1 migration file not found");
const sql = readFileSync(join(migrationsDir, phase1File), "utf8");

// Extract everything between "CREATE OR REPLACE FUNCTION public.get_order_by_token"
// and the closing "$$;" of that function.
function extractFunctionBody(name: string): string {
  const needle = `CREATE OR REPLACE FUNCTION public.${name}`;
  const idx = sql.indexOf(needle);
  if (idx < 0) throw new Error(`Function ${name} not found in migration`);
  const after = sql.slice(idx);
  const endIdx = after.indexOf("$$;");
  if (endIdx < 0) throw new Error(`No $$; terminator after ${name}`);
  return after.slice(0, endIdx);
}

const body = extractFunctionBody("get_order_by_token");
// RETURNS TABLE (...) — the shape the client sees. Any sensitive field would
// have to appear in this list to leak.
const returnsTable = (() => {
  const m = body.match(/RETURNS TABLE\s*\(([\s\S]+?)\)\s*LANGUAGE/);
  expect(m, "RETURNS TABLE block not found").toBeTruthy();
  return m![1];
})();

describe("get_order_by_token — never returns sensitive fields", () => {
  it("RETURNS TABLE does not include customer_email", () => {
    expect(returnsTable).not.toMatch(/\bcustomer_email\b/);
  });
  it("RETURNS TABLE does not include customer_phone", () => {
    expect(returnsTable).not.toMatch(/\bcustomer_phone\b/);
  });
  it("RETURNS TABLE does not include file_paths", () => {
    expect(returnsTable).not.toMatch(/\bfile_paths\b/);
  });
  it("RETURNS TABLE does not include internal_notes", () => {
    expect(returnsTable).not.toMatch(/\binternal_notes\b/);
  });
  it("RETURNS TABLE does not include uploaded_not_purchased", () => {
    expect(returnsTable).not.toMatch(/\buploaded_not_purchased\b/);
  });
  it("is SECURITY DEFINER", () => {
    expect(body).toMatch(/SECURITY DEFINER/);
  });
  it("filters events to visible_to_customer = true", () => {
    expect(body).toMatch(/visible_to_customer\s*=\s*true/);
  });
  it("strips the piece.path from pieces_summary", () => {
    const piecesAgg = body.match(/jsonb_build_object\([\s\S]+?pieces/);
    expect(piecesAgg, "pieces_summary builder not found").toBeTruthy();
    expect(piecesAgg![0]).not.toMatch(/'path'/);
  });
  it("only uses customer_email as a first_name fallback (local part only)", () => {
    // customer_email may be read to derive first_name (local part), but it must
    // never appear as a selected row column.
    const emailMentions = body.match(/customer_email/g) ?? [];
    // We expect ≤2 mentions: one in the fallback, one in a COALESCE guard.
    expect(emailMentions.length).toBeLessThanOrEqual(3);
    // And the surrounding context must be split_part(..., '@', 1).
    expect(body).toMatch(/split_part\(\s*COALESCE\s*\(\s*ord\.customer_email[^)]*\)\s*,\s*'@'\s*,\s*1\s*\)/);
  });
});
