# Order #264 — why six files for five priced pieces

## Finding

`orders.file_paths` stores paths for **every file the client ever uploaded while the price window was open**, including files that were later removed from the cart. `orders.pieces` only holds the pieces the customer actually bought. The two arrays are built from different sources and can disagree.

## Where it happens

In `src/components/StlEstimator.tsx`:

- The price window pre-uploads files to the `print-requests` bucket as soon as they are parsed, in a fire-and-forget batch inside `onFilesChanged` (around line 669). Every successful upload is appended to `uploadedRef.current.paths` and keyed in `uploadedRef.current.byId`.
- When the customer removes a file (`removeFile`, line 818), `parsedFiles` state is filtered but **`uploadedRef.current` is not touched**. The stale path stays in the ref.
- `handleInstantBuy` sends the checkout body built by `buildCheckoutBody` (`src/lib/checkoutBody.ts`). That function fills `filePaths: p.uploaded.paths` — the stale ref — while `pieces` is built from `validFiles` (the current cart).
- `create-instant-checkout/index.ts` inserts the order with `file_paths: body.filePaths` and `pieces: v3Pieces`. The two can therefore have different lengths.

For #264 the customer most likely uploaded six STLs (including `…sensor_cover_FACE_DOWN.stl`, probably an alternate orientation they wanted to compare), removed one before paying, and the removed file stayed in `file_paths`.

Secondary contributors that can cause the same mismatch:

- `imageFile` (JPG/PNG dropped as a reference photo, line 449) and `linkFile` (oversize or prep-failed STLs, lines 576/583) are pre-uploaded but excluded from `validFiles`, so they never become priced pieces.
- The pre-upload loop re-runs on every files-changed tick with a new timestamp prefix, so earlier upload attempts also stay in the bucket as orphans. Those are not referenced in `file_paths` for the eventual order, but they do sit in storage forever.

## Consequence today

- The admin "pedidos" list shows `file_paths.length` as a loose proxy for "files on this order", which is why #264 looks like 6 files.
- The owner has to manually reconcile which file matches which piece.
- No label tells the owner "this one was uploaded but not bought".

## What this goal commits to

Per the goal preamble: "from now on the order must record only purchased pieces, and anything uploaded but not purchased must be labelled as such for the owner." The concrete steps are:

1. In `removeFile`, drop the removed id from `uploadedRef.current` (paths, names, byId) when it exists. This is a one-liner fix but is deliberately not landed under item 1.0 (which is UI-only). It lands with item 1.3 (owner emails) where the owner finally sees the distinction between "pieces" and "uploads".
2. In `buildCheckoutBody`, derive `filePaths`/`fileNames` from the priced `pieces` (using `uploaded.byId[f.id]`), not from the full `uploaded.paths` array. Images and link files that survive upload get surfaced separately.
3. Add an `uploaded_not_purchased` array (paths + original names) alongside `file_paths` on the order, populated when `uploaded.paths.length > pieces.length`. The owner email ("[PEDIDO]") shows them under "Subidos pero no comprados" (item 1.3).
4. The customer-facing order page (/pedido/&lt;token&gt;, item 1.5) only shows pieces — never the uploaded-not-purchased list.
