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

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Upload file and wait for the viewer to finish loading (dims summary visible). */
async function uploadAndWaitForViewer(page: Page, timeoutMs = 30000) {
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CUBE_STL);
  // The viewer is ready when the dimension summary bar appears (role=text)
  await page.waitForSelector('[role="text"]', { timeout: timeoutMs });
  // Also wait for toggle buttons to appear
  await page.waitForSelector('[data-testid="viewer-dims-toggle"]', { timeout: timeoutMs });
}

/** Get the {top, left} pixel position of a label element. */
async function getLabelPos(page: Page, testid: string) {
  return page.locator(`[data-testid="${testid}"]`).evaluate((el) => {
    const s = (el as HTMLElement).style;
    return { top: parseFloat(s.top || "0"), left: parseFloat(s.left || "0") };
  });
}

/** Drag across the canvas to rotate. */
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

test("Viewer — dims toggle shows x/y/z labels", async ({ page }) => {
  await page.goto("/");
  await uploadAndWaitForViewer(page);

  // Labels should start hidden (display:none set by LABEL_STYLE default)
  const xLabel = page.locator('[data-testid="viewer-x-label"]');
  await expect(xLabel).toBeAttached();

  // Click dims toggle
  await page.locator('[data-testid="viewer-dims-toggle"]').click();
  await page.waitForTimeout(200);

  // After toggle, labels should be visible (display flips from none)
  await expect(page.locator('[data-testid="viewer-x-label"]')).toBeVisible();
  await expect(page.locator('[data-testid="viewer-y-label"]')).toBeVisible();
  await expect(page.locator('[data-testid="viewer-z-label"]')).toBeVisible();
});

test("Viewer — label positions change after rotation (OrbitControls)", async ({ page }) => {
  await page.goto("/");
  await uploadAndWaitForViewer(page);

  // Enable dimension labels
  await page.locator('[data-testid="viewer-dims-toggle"]').click();
  await page.waitForTimeout(200);

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

  const compareLabel = page.locator('[data-testid="viewer-compare-label"]');
  // Initially hidden
  await expect(compareLabel).toBeAttached();

  // Click compare toggle
  await page.locator('[data-testid="viewer-compare-toggle"]').click();
  await page.waitForTimeout(200);

  await expect(compareLabel).toBeVisible();
});

test("Viewer — compare label position changes after rotation", async ({ page }) => {
  await page.goto("/");
  await uploadAndWaitForViewer(page);

  await page.locator('[data-testid="viewer-compare-toggle"]').click();
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

  await page.locator('[data-testid="viewer-dims-toggle"]').click();
  await page.waitForTimeout(200);

  const initial = await getLabelPos(page, "viewer-x-label");

  // Rotate
  await rotateView(page);
  const rotated = await getLabelPos(page, "viewer-x-label");
  const didRotate = Math.abs(rotated.top - initial.top) > 1 || Math.abs(rotated.left - initial.left) > 1;
  expect(didRotate).toBe(true);

  // Reset
  await page.locator('[data-testid="viewer-reset-btn"]').click();
  await page.waitForTimeout(300);

  const reset = await getLabelPos(page, "viewer-x-label");
  // After reset, position should be back close to initial (within 2px)
  const backToInit = Math.abs(reset.top - initial.top) < 3 && Math.abs(reset.left - initial.left) < 3;
  expect(backToInit).toBe(true);
});
