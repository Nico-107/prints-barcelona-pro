/**
 * Prompt 2 — browser-side bridge that dispatches a mesh-analysis task to
 * the Web Worker in src/workers/meshAnalysisWorker.ts.
 *
 * Falls back to running the pipeline on the main thread if Worker
 * construction fails (e.g. SSR, tests, or old browsers that can't do
 * module workers). Repair still runs under the usual 8-second budget.
 */

import { prepareMeshForPricing, type PrepareResult } from './prepareMeshForPricing';
import type { WorkerIn, WorkerOut } from '../workers/meshAnalysisWorker';

export async function analyseMeshViaWorker(tri: Float32Array): Promise<PrepareResult> {
  if (typeof Worker === 'undefined') {
    return prepareMeshForPricing(tri);
  }
  let worker: Worker;
  try {
    worker = new Worker(new URL('../workers/meshAnalysisWorker.ts', import.meta.url), { type: 'module' });
  } catch {
    return prepareMeshForPricing(tri);
  }
  return new Promise<PrepareResult>((resolve, reject) => {
    worker.onmessage = (e: MessageEvent<WorkerOut>) => {
      try {
        if (e.data.type === 'done') resolve(e.data.result);
        else reject(new Error(e.data.message));
      } finally {
        worker.terminate();
      }
    };
    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };
    const msg: WorkerIn = { type: 'analyse', tri };
    // Transfer the buffer so we don't copy a potentially large array.
    worker.postMessage(msg, [tri.buffer]);
  });
}
