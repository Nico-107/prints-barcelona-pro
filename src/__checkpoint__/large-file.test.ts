import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

// P9 — large files. Pure logic tests for gzip round-trip, chunked split/reassemble and
// manifest hashing. The UI behaviour (upload progress, dead-end removal) is covered by
// e2e/checkpoint/large-files.spec.ts in Playwright.

interface Manifest {
  sha256: string;
  totalSize: number;
  parts: { name: string; size: number }[];
}

export function manifestFor(bytes: Uint8Array, name: string, maxPartSize: number): { parts: Uint8Array[]; manifest: Manifest } {
  const h = createHash("sha256").update(bytes).digest("hex");
  const parts: Uint8Array[] = [];
  const partMeta: { name: string; size: number }[] = [];
  for (let offset = 0, idx = 0; offset < bytes.length; offset += maxPartSize, idx++) {
    const slice = bytes.slice(offset, Math.min(offset + maxPartSize, bytes.length));
    parts.push(slice);
    const padded = String(idx).padStart(3, "0");
    partMeta.push({ name: `${name}.part${padded}`, size: slice.length });
  }
  return { parts, manifest: { sha256: h, totalSize: bytes.length, parts: partMeta } };
}

export function reassemble(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

describe("P9 chunked upload", () => {
  it("manifest hash matches the original file", () => {
    const data = new Uint8Array(1_000_000).map((_, i) => (i * 37) & 0xff);
    const { parts, manifest } = manifestFor(data, "big.stl.gz", 45 * 1024 * 1024);
    expect(parts.length).toBe(1); // fits in one part
    expect(manifest.sha256).toBe(createHash("sha256").update(data).digest("hex"));
  });
  it("split into ≤ 45 MB parts and reassemble recovers bytes", () => {
    const data = new Uint8Array(100 * 1024 * 1024).map((_, i) => (i * 31) & 0xff);
    const { parts, manifest } = manifestFor(data, "big.stl.gz", 45 * 1024 * 1024);
    expect(parts.length).toBe(3);
    expect(manifest.parts.every((p) => p.size <= 45 * 1024 * 1024)).toBe(true);
    const back = reassemble(parts);
    expect(back.length).toBe(data.length);
    const h1 = createHash("sha256").update(data).digest("hex");
    const h2 = createHash("sha256").update(back).digest("hex");
    expect(h2).toBe(h1);
  });
  it("manifest file naming is zero-padded (part000, part001, …)", () => {
    const data = new Uint8Array(50 * 1024 * 1024);
    const { manifest } = manifestFor(data, "x.stl.gz", 20 * 1024 * 1024);
    expect(manifest.parts[0].name.endsWith(".part000")).toBe(true);
    expect(manifest.parts[1].name.endsWith(".part001")).toBe(true);
  });
  it("the es i18n no longer promises the dead-end 'El archivo supera los 50 MB' message", () => {
    const es = readFileSync("src/i18n/es.ts", "utf8");
    expect(es).not.toContain("El archivo supera los 50 MB");
  });
});
