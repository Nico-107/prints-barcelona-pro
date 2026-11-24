/**
 * Prompt 2 — mesh analysis Web Worker.
 *
 * Runs `prepareMeshForPricing` off the main thread so the StlEstimator
 * price panel never freezes while we count shells / build Manifolds /
 * batch-union watertight components. The caller posts the parsed STL
 * triangles; the worker posts back the analysis the pricing path should
 * use plus the quality stats (logged to estimate_shown / buy_clicked).
 */

import { prepareMeshForPricing, type PrepareResult } from '../lib/prepareMeshForPricing';

export type WorkerIn = { type: 'analyse'; tri: Float32Array };
export type WorkerOut =
  | { type: 'done'; result: PrepareResult }
  | { type: 'error'; message: string };

self.onmessage = async (e: MessageEvent<WorkerIn>) => {
  if (e.data.type !== 'analyse') return;
  try {
    const result = await prepareMeshForPricing(e.data.tri);
    self.postMessage({ type: 'done', result } satisfies WorkerOut);
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    } satisfies WorkerOut);
  }
};
