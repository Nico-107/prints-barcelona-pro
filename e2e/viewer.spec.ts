/**
 * conv-23: 3D Viewer overlay e2e
 * Asserts that dimension labels move when the view is rotated, and that
 * comparison/grid controls work.
 * Run with: npx playwright test e2e/viewer.spec.ts
 */
import { test, expect, Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CUBE_STL = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");

// Force desktop viewport — the viewer (leftSlot) in CheckoutDialog is only
// rendered via "hidden lg:flex" which becomes visible at ≥1024px.
// Mobile viewport keeps the viewer hidden, so all viewer tests run desktop-only.
test.use({ viewport: { width: 1280, height: 720 } });

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Upload file and wait for the viewer to finish loading.
 * The checkout dialog auto-opens on first file upload (StlEstimator line ~659),
 * exposing the leftSlot viewer. Wait for the dims toggle to be visible.
 */
async function uploadAndWaitForViewer(page: Page, timeoutMs = 30000) {
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);
  // Dialog auto-opens; viewer is in leftSlot (visible at lg: breakpoint)
  await page.locator('[data-testid="viewer-dims-toggle"]').first().waitFor({ state: "visible", timeout: timeoutMs });
  // Allow one animation frame cycle so label positions are computed
  await page.waitForTimeout(200);
}

/** Get the {top, left} pixel position of a label element (set by animation loop). */
async function getLabelPos(page: Page, testid: string) {
  return page.locator(`[data-testid="${testid}"]`).first().evaluate((el) => {
    const s = (el as HTMLElement).style;
    return { top: parseFloat(s.top || "0"), left: parseFloat(s.left || "0") };
  });
}

/** Drag across the canvas to rotate the view. */
async function rotateView(page: Page) {
  const canvas = page.locator("canvas").first();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas not found");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 80, cy + 40, { steps: 10 });
  await page.mouse.up();
  // Give animation frame time to update label positions
  await page.waitForTimeout(300);
}

// ── Tests ──────────────────────────────────────────────────────────────────────

test("Viewer — dims labels visible by default, toggle hides/shows them", async ({ page }) => {
  await page.goto("/");
  await uploadAndWaitForViewer(page);

  // showDims defaults to true → animation loop sets display:block for labels in front of camera
  const xLabel = page.locator('[data-testid="viewer-x-label"]').first();
  const yLabel = page.locator('[data-testid="viewer-y-label"]').first();
  const zLabel = page.locator('[data-testid="viewer-z-label"]').first();

  await expect(xLabel).toBeAttached();
  await expect(yLabel).toBeAttached();
  await expect(zLabel).toBeAttached();

  // First click: hides all labels (showDims false → projectLabel sets display:none immediately)
  await page.locator('[data-testid="viewer-dims-toggle"]').first().click();
  await page.waitForTimeout(200);

  await expect(xLabel).toBeHidden();
  await expect(yLabel).toBeHidden();
  await expect(zLabel).toBeHidden();

  // Second click: shows labels again
  await page.locator('[data-testid="viewer-dims-toggle"]').first().click();
  await page.waitForTimeout(200);

  // At least one label should be visible after re-enabling dims
  const anyVisible = await xLabel.isVisible().catch(() => false)
    || await yLabel.isVisible().catch(() => false)
    || await zLabel.isVisible().catch(() => false);
  expect(anyVisible).toBe(true);
});

test("Viewer — label positions change after rotation (OrbitControls)", async ({ page }) => {
  await page.goto("/");
  await uploadAndWaitForViewer(page);

  // Labels start visible (showDims=true default) — no toggle click needed
  const xLabel = page.locator('[data-testid="viewer-x-label"]').first();
  await expect(xLabel).toBeAttached();

  const before = await getLabelPos(page, "viewer-x-label");

  await rotateView(page);

  const after = await getLabelPos(page, "viewer-x-label");

  // At least one coordinate must have changed — labels follow the 3D point
  const moved = Math.abs(after.top - before.top) > 1 || Math.abs(after.left - before.left) > 1;
  expect(moved).toBe(true);
});

test("Viewer — compare toggle shows comparison caption label", async ({ page }) => {
  await page.goto("/");
  await uploadAndWaitForViewer(page);

  const compareLabel = page.locator('[data-testid="viewer-compare-label"]').first();
  // Compare label starts hidden (compareMode="off" → display:none)
  await expect(compareLabel).toBeAttached();
  await expect(compareLabel).toBeHidden();

  // Click compare toggle → compareMode != "off" → label becomes visible
  await page.locator('[data-testid="viewer-compare-toggle"]').first().click();
  await page.waitForTimeout(200);

  await expect(compareLabel).toBeVisible();
});

test("Viewer — compare label position changes after rotation", async ({ page }) => {
  await page.goto("/");
  await uploadAndWaitForViewer(page);

  await page.locator('[data-testid="viewer-compare-toggle"]').first().click();
  await page.waitForTimeout(200);

  const before = await getLabelPos(page, "viewer-compare-label");

  await rotateView(page);

  const after = await getLabelPos(page, "viewer-compare-label");

  const moved = Math.abs(after.top - before.top) > 1 || Math.abs(after.left - before.left) > 1;
  expect(moved).toBe(true);
});

test("Viewer — reset button restores initial camera position", async ({ page }) => {
  await page.goto("/");
  await uploadAndWaitForViewer(page);

  // Labels start visible (showDims=true default)
  const initial = await getLabelPos(page, "viewer-x-label");

  // Rotate
  await rotateView(page);
  const rotated = await getLabelPos(page, "viewer-x-label");
  const didRotate = Math.abs(rotated.top - initial.top) > 1 || Math.abs(rotated.left - initial.left) > 1;
  expect(didRotate).toBe(true);

  // Reset
  await page.locator('[data-testid="viewer-reset-btn"]').first().click();
  await page.waitForTimeout(300);

  const reset = await getLabelPos(page, "viewer-x-label");
  // After reset, position should be back close to initial (within 2px)
  const backToInit = Math.abs(reset.top - initial.top) < 3 && Math.abs(reset.left - initial.left) < 3;
  expect(backToInit).toBe(true);
});
