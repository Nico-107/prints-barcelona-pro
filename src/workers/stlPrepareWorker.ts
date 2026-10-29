/**
 * Web Worker for STL preparation (ASCII→binary + simplification).
 * Keeps the main thread responsive while processing large files.
 */
import { prepareStl } from "../lib/stlPrepare";
import type { PrepareResult, PrepareProgress } from "../lib/stlPrepare";

export type WorkerMessage =
  | { type: "prepare"; buf: ArrayBuffer }

export type WorkerResponse =
  | { type: "progress"; pct: number; stage: PrepareProgress["stage"] }
  | { type: "done"; result: PrepareResult }
  | { type: "error"; message: string }

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type !== "prepare") return;
  try {
    const result = await prepareStl(e.data.buf, (p) => {
      self.postMessage({ type: "progress", pct: p.pct, stage: p.stage } satisfies WorkerResponse);
    });
    const transfer: Transferable[] = [result.checkoutBuf];
    if (result.originalGzipped) transfer.push(result.originalGzipped);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).postMessage({ type: "done", result } satisfies WorkerResponse, transfer);
  } catch (err) {
    self.postMessage({ type: "error", message: String(err) } satisfies WorkerResponse);
  }
};
