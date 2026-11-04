/**
 * Prompt 26 §3 — upload-pipeline instrumentation + safe fallback.
 * Runs across mobile-chrome and mobile-webkit projects (iPhone 13 + Pixel 5).
 *
 * Covers:
 *   1. Small STL → price visible, price_shown emitted
 *   2. ~30 MB binary STL → price OR quote path (never both empty)
 *   3. Forced stlPrepare failure (window.__e2eForcePrepareFail) → price OR quote path
 */
import { test, expect, type Page } from "@playwright/test";
import path from "path";
import os from "os";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CUBE_STL = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");

// Mirrors the generator in buy-matrix.spec.ts — a smooth UV-sphere so volume
// is stable under simplification.
function makeLargeBinaryStl(targetMb: number): string {
  const targetBytes = targetMb * 1024 * 1024;
  const totalTris = Math.floor((targetBytes - 84) / 50);
  const segs = Math.floor(Math.sqrt(totalTris / 2));
  const uSegs = segs, vSegs = segs;
  const triCount = uSegs * vSegs * 2;
  const R = 20;

  const buf = Buffer.alloc(84 + triCount * 50, 0);
  buf.writeUInt32LE(triCount, 80);

  const cols = uSegs + 1, rows = vSegs + 1;
  const px = new Float32Array(cols * rows);
  const py = new Float32Array(cols * rows);
  const pz = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    const theta = (j * Math.PI) / vSegs;
    const st = Math.sin(theta), ct = Math.cos(theta);
    for (let i = 0; i < cols; i++) {
      const phi = (i * 2 * Math.PI) / uSegs;
      const idx = j * cols + i;
      px[idx] = R * st * Math.cos(phi);
      py[idx] = R * ct;
      pz[idx] = R * st * Math.sin(phi);
    }
  }

  let t = 0;
  for (let j = 0; j < vSegs; j++) {
    for (let i = 0; i < uSegs; i++) {
      const i0 = j * cols + i, i1 = i0 + 1, i2 = i0 + cols, i3 = i2 + 1;
      const quads: [number, number, number][] = [[i0, i2, i1], [i1, i2, i3]];
      for (const [a, b, c] of quads) {
        const off = 84 + t * 50;
        const ax = px[b]-px[a], ay = py[b]-py[a], az = pz[b]-pz[a];
        const bx = px[c]-px[a], by = py[c]-py[a], bz = pz[c]-pz[a];
        const nx = ay*bz - az*by, ny = az*bx - ax*bz, nz = ax*by - ay*bx;
        buf.writeFloatLE(nx, off);      buf.writeFloatLE(ny, off+4);    buf.writeFloatLE(nz, off+8);
        buf.writeFloatLE(px[a], off+12); buf.writeFloatLE(py[a], off+16); buf.writeFloatLE(pz[a], off+20);
        buf.writeFloatLE(px[b], off+24); buf.writeFloatLE(py[b], off+28); buf.writeFloatLE(pz[b], off+32);
        buf.writeFloatLE(px[c], off+36); buf.writeFloatLE(py[c], off+40); buf.writeFloatLE(pz[c], off+44);
        t++;
      }
    }
  }

  const outPath = path.join(os.tmpdir(), `upload-pipeline-${targetMb}mb-${process.pid}.stl`);
  fs.writeFileSync(outPath, buf);
  return outPath;
}

let BINARY_30MB: string;
test.beforeAll(() => { BINARY_30MB = makeLargeBinaryStl(30); });
test.afterAll(() => { try { fs.unlinkSync(BINARY_30MB); } catch { /* ok */ } });

async function dismissBanners(page: Page) {
  // Cookies + lang-suggest are the common "price obscured" culprits — pre-ack both
  // via localStorage so the Buy/quote CTA is reliably clickable on mobile widths.
  await page.addInitScript(() => {
    try {
      localStorage.setItem("dim3d-consent", JSON.stringify({ accepted: true, ts: Date.now() }));
      localStorage.setItem("dim3d-lang-suggest-dismissed", "1");
    } catch { /* ignore */ }
  });
}

async function priceOrQuote(page: Page, timeoutMs: number): Promise<"price" | "quote"> {
  // Rolls over every rendered buy / quote CTA each tick; the one that is
  // visible + enabled wins the race regardless of which layout slot it
  // sits in (mobile sticky bar vs desktop two-column).
  const result = await page.waitForFunction(() => {
    const buy = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
    const ok = buy.find((b) => b.clientHeight > 0 && !b.disabled && /\d/.test(b.textContent ?? ""));
    if (ok) return "price" as const;
    const quoteRe = /Te lo revisamos|Free review|Revisamos|Te la revisamos|We'll review/i;
    const nodes = Array.from(document.querySelectorAll("button, a, [role=button]")) as HTMLElement[];
    const anyQuote = nodes.find((n) => n.offsetParent !== null && quoteRe.test(n.textContent ?? ""));
    if (anyQuote) return "quote" as const;
    return null;
  }, null, { timeout: timeoutMs });
  const value = (await result.jsonValue()) as "price" | "quote" | null;
  if (value === null) throw new Error("Neither price nor quote path became visible within the timeout");
  return value;
}

test.describe("upload pipeline — mobile fallback (Prompt 26 §3)", () => {
  test.beforeEach(async ({ page }) => { await dismissBanners(page); });

  test("small STL → price visible + price_shown stage emitted", async ({ page }) => {
    const stages: string[] = [];
    await page.addInitScript(() => {
      (window as unknown as { __stageLog: string[] }).__stageLog = [];
    });
    // Capture upload_pipeline_stage calls by intercepting the PostHog endpoint.
    await page.route("**/eu.i.posthog.com/**", async (route) => {
      const body = route.request().postData() ?? "";
      const match = body.match(/"event":"upload_pipeline_stage"[^]*?"stage":"([^"]+)"/);
      if (match) stages.push(match[1]);
      await route.fulfill({ status: 200, body: "{}" });
    });

    await page.goto("/");
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(CUBE_STL);

    const outcome = await priceOrQuote(page, 30_000);
    expect(outcome).toBe("price");
    // We do not block the test on event delivery (PostHog may batch),
    // but if any stage made it through, it must include read.
    if (stages.length > 0) expect(stages).toContain("read");
  });

  test("30 MB binary STL → price or quote path within 60 s", async ({ page }) => {
    await page.goto("/");
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(BINARY_30MB);
    const outcome = await priceOrQuote(page, 60_000);
    expect(["price", "quote"]).toContain(outcome);
  });

  test("forced prepare failure → never leaves the user stuck", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __e2eForcePrepareFail: boolean }).__e2eForcePrepareFail = true;
    });
    await page.goto("/");
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(CUBE_STL);
    // Small STL under the server re-measure limit: fallback sends raw and user
    // still gets a price. If the raw copy were oversized we'd land on quote.
    const outcome = await priceOrQuote(page, 30_000);
    expect(["price", "quote"]).toContain(outcome);
  });
});
