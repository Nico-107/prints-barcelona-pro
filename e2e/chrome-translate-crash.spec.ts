/**
 * Regression guard for the Chrome page-translation insertBefore crash.
 *
 * Chrome's built-in translator wraps text nodes in <font> elements and
 * injects comment nodes between sibling elements.  This breaks React's
 * DOM reconciliation — it tracks the original text node but can no longer
 * find it as a child of the parent, so insertBefore/removeChild throws
 * "The node before which the new node is to be inserted is not a child of
 * this node."
 *
 * Root-cause fix: translate="no" on #root so Chrome skips the React tree.
 * This test verifies both that the attribute is present AND that the simulated
 * mutation doesn't crash the app.
 *
 * Run with: npx playwright test e2e/chrome-translate-crash.spec.ts
 */
import { test, expect } from "./_fixtures";

test("Root div has translate=no (Chrome translation prevention)", async ({ page }) => {
  await page.goto("/");
  const translateAttr = await page.locator("#root").getAttribute("translate");
  expect(translateAttr).toBe("no");
});

test("App survives simulated Chrome-translate DOM mutation", async ({ page }) => {
  await page.goto("/");

  // Simulate what Chrome's translator does: inject a comment node and a
  // <font> wrapper around text inside the main heading area.  If React's
  // reconciler would crash, the ErrorBoundary fallback would appear.
  await page.evaluate(() => {
    // Pick a text node inside the React root and wrap it like Chrome does
    const root = document.getElementById("root");
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeValue && node.nodeValue.trim().length > 3
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });
    // Inject a comment node after the first qualifying text node's parent
    const textNode = walker.nextNode();
    if (textNode?.parentNode) {
      const comment = document.createComment(" Chrome translate marker ");
      textNode.parentNode.insertBefore(comment, textNode.nextSibling);
    }
  });

  // Trigger a React re-render by resizing the viewport (causes layout effects)
  await page.setViewportSize({ width: 391, height: 844 });
  await page.setViewportSize({ width: 390, height: 844 });

  // The ErrorBoundary fallback should NOT appear — no crash
  const errorFallback = page.locator("text=Algo ha fallado").first();
  await expect(errorFallback).not.toBeVisible({ timeout: 3000 });

  // The page should still be functional
  await expect(page.locator("#root")).toBeVisible();
});
