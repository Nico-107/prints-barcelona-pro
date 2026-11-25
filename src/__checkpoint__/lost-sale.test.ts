import { describe, it, expect } from "vitest";

// O12 — lost-sale capture. One owner alert per session per code; subsequent failures with
// the same code in the same session are deduped.

interface Alert { sessionId: string; code: string; sentAt: number }

export function dedupeAlert(alerts: Alert[], candidate: Alert): Alert[] {
  const key = `${candidate.sessionId}::${candidate.code}`;
  const seen = alerts.find((a) => `${a.sessionId}::${a.code}` === key);
  if (seen) return alerts;
  return [...alerts, candidate];
}

describe("O12 lost-sale capture", () => {
  it("appends the first alert for a session/code combination", () => {
    const out = dedupeAlert([], { sessionId: "s1", code: "PRICE_UPDATED", sentAt: 100 });
    expect(out.length).toBe(1);
  });
  it("deduplicates subsequent identical alerts", () => {
    const first = dedupeAlert([], { sessionId: "s1", code: "OVERSIZE_PART", sentAt: 100 });
    const second = dedupeAlert(first, { sessionId: "s1", code: "OVERSIZE_PART", sentAt: 200 });
    expect(second.length).toBe(1);
  });
  it("different codes in the same session each send once", () => {
    let alerts: Alert[] = [];
    alerts = dedupeAlert(alerts, { sessionId: "s1", code: "OVERSIZE_PART", sentAt: 100 });
    alerts = dedupeAlert(alerts, { sessionId: "s1", code: "FILE_TOO_LARGE_FOR_INSTANT", sentAt: 200 });
    expect(alerts.length).toBe(2);
  });
  it("different sessions each send once", () => {
    let alerts: Alert[] = [];
    alerts = dedupeAlert(alerts, { sessionId: "s1", code: "OVERSIZE_PART", sentAt: 100 });
    alerts = dedupeAlert(alerts, { sessionId: "s2", code: "OVERSIZE_PART", sentAt: 200 });
    expect(alerts.length).toBe(2);
  });
});
