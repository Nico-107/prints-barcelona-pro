import { describe, it, expect, vi, beforeEach } from "vitest";

const resendSendMock = vi.fn().mockResolvedValue({ data: { id: "mail_notify_1" }, error: null });
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: resendSendMock } })),
}));

import handler, { rateLimit } from "../notify-quote";

function fakeRes(): any {
  const r: any = {
    _status: 0,
    _body: undefined,
    _headers: {} as Record<string, string>,
    status(code: number) { this._status = code; return this; },
    json(b: unknown) { this._body = b; return this; },
    send(b: unknown) { this._body = b; return this; },
    end() { return this; },
    setHeader(k: string, v: string) { this._headers[k] = v; return this; },
  };
  return r;
}

function fakeReq(body: unknown, headers: Record<string, string> = {}): any {
  const serialized = typeof body === "string" ? body : JSON.stringify(body);
  return {
    method: "POST",
    headers: { "content-type": "application/json", "content-length": String(Buffer.byteLength(serialized)), ...headers },
    body,
    socket: { remoteAddress: "127.0.0.1" },
  };
}

describe("api/notify-quote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EMAIL_VIA_VERCEL = "1";
    process.env.RESEND_API_KEY = "re_test";
    process.env.OWNER_EMAILS = "owner-a@example.com,owner-b@example.com";
    process.env.DANIEL_EMAIL = "daniel@example.com";
  });

  it("short-circuits when EMAIL_VIA_VERCEL=0", async () => {
    process.env.EMAIL_VIA_VERCEL = "0";
    const res = fakeRes();
    await handler(fakeReq({ kind: "quote" }), res);
    expect(res._status).toBe(200);
    expect(res._body).toMatchObject({ skipped: "EMAIL_VIA_VERCEL_disabled" });
    expect(resendSendMock).not.toHaveBeenCalled();
  });

  it("405s on GET", async () => {
    const res = fakeRes();
    const req: any = { method: "GET", headers: {}, socket: { remoteAddress: "127.0.0.1" } };
    await handler(req, res);
    expect(res._status).toBe(405);
  });

  it("204s on OPTIONS (CORS preflight)", async () => {
    const res = fakeRes();
    const req: any = { method: "OPTIONS", headers: {}, socket: { remoteAddress: "127.0.0.1" } };
    await handler(req, res);
    expect(res._status).toBe(204);
  });

  it("drops honeypot submissions without sending", async () => {
    const res = fakeRes();
    await handler(fakeReq({ kind: "quote", website: "https://spam.example", contactEmail: "spam@example.com" }), res);
    expect(res._status).toBe(200);
    expect(res._body).toMatchObject({ dropped: "honeypot" });
    expect(resendSendMock).not.toHaveBeenCalled();
  });

  it("rejects payloads larger than 50 KB", async () => {
    const res = fakeRes();
    const bigBody = { kind: "quote", notes: "x".repeat(60_000) };
    await handler(fakeReq(bigBody), res);
    expect(res._status).toBe(413);
  });

  it("rejects invalid payloads with 400", async () => {
    const res = fakeRes();
    await handler(fakeReq({ kind: "nope" as any }), res);
    expect(res._status).toBe(400);
  });

  it("sends an email when the payload is valid", async () => {
    const res = fakeRes();
    await handler(fakeReq({
      kind: "quote",
      contactEmail: "pedro@example.com",
      contactPhone: "+34 611 111 111",
      material: "PLA",
      totalUnits: 3,
      priceExact: 42.5,
      pieces: [{ name: "part.stl", quantity: 3, material: "PLA" }],
      fileNames: ["part.stl"],
      sourcePath: "/catalogo",
      pageLanguage: "es",
    }), res);
    expect(res._status).toBe(200);
    expect(resendSendMock).toHaveBeenCalledTimes(1);
    const args = resendSendMock.mock.calls[0]?.[0];
    expect(args.subject).toMatch(/REVISIÓN/);
    expect(args.to).toContain("owner-a@example.com");
    expect(args.to).not.toContain("daniel@example.com");
  });

  it("includes DANIEL_EMAIL for a Sevilla request", async () => {
    const res = fakeRes();
    await handler(fakeReq({
      kind: "quote",
      contactEmail: "p@example.com",
      sourceCity: "sevilla",
      material: "PLA",
    }), res);
    const args = resendSendMock.mock.calls[0]?.[0];
    expect(args.to).toContain("daniel@example.com");
  });
});

describe("rateLimit", () => {
  it("allows up to 10 per hour per IP", () => {
    const base = Date.now();
    for (let i = 0; i < 10; i++) expect(rateLimit("1.1.1.1", base + i)).toBe(false);
    expect(rateLimit("1.1.1.1", base + 11)).toBe(true);
    // A fresh window after 1h resets
    expect(rateLimit("1.1.1.1", base + 3_600_001)).toBe(false);
  });
});
