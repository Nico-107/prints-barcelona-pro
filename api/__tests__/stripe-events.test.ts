import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────
// We stub the Stripe and Resend SDK modules before importing the handler so
// the real network layer is never touched.

const resendSendMock = vi.fn().mockResolvedValue({ data: { id: "mail_test_1" }, error: null });
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: resendSendMock },
  })),
}));

const constructEventAsyncMock = vi.fn();
const sessionsRetrieveMock = vi.fn();
vi.mock("stripe", () => {
  class FakeStripe {
    webhooks = { constructEventAsync: constructEventAsyncMock };
    checkout = { sessions: { retrieve: sessionsRetrieveMock } };
  }
  return { default: FakeStripe };
});

import handler, { pickLineItems } from "../stripe-events";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fakeReq(body: Buffer, headers: Record<string, string> = {}): any {
  const r: any = {
    method: "POST",
    headers: { "stripe-signature": "t=1,v1=sig", ...headers },
    [Symbol.asyncIterator]: async function* () {
      yield body;
    },
  };
  return r;
}

function fakeRes(): any {
  const r: any = {
    _status: 0,
    _body: undefined,
    status(code: number) { this._status = code; return this; },
    json(b: unknown) { this._body = b; return this; },
    send(b: unknown) { this._body = b; return this; },
    end() { return this; },
    setHeader() { return this; },
  };
  return r;
}

const fullSession = {
  id: "cs_test_1",
  metadata: { order_id: "order-123", order_number: "42", source_path: "/", page_language: "es" },
  amount_total: 2990,
  currency: "eur",
  customer_details: { name: "Ada Lovelace", email: "ada@example.com", phone: "+34 600 000 000" },
  shipping_details: { address: { line1: "Rbla", city: "Barcelona", country: "ES" }, name: "Ada" },
  shipping_cost: { amount_total: 490 },
  line_items: {
    data: [
      { description: "Keychain", quantity: 2, amount_total: 1200, price: { product: { name: "Keychain", metadata: { material: "PLA" } }, unit_amount: 600 } },
    ],
  },
  payment_intent: { id: "pi_test" },
  livemode: false,
};

describe("api/stripe-events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EMAIL_VIA_VERCEL = "1";
    process.env.STRIPE_WEBHOOK_SECRET_VERCEL = "whsec_test";
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.RESEND_API_KEY = "re_test";
    process.env.OWNER_EMAILS = "owner-a@example.com,owner-b@example.com";
    process.env.DANIEL_EMAIL = "daniel@example.com";
  });

  it("405s on GET", async () => {
    const res = fakeRes();
    const req: any = { method: "GET", headers: {}, [Symbol.asyncIterator]: async function* () {} };
    await handler(req, res);
    expect(res._status).toBe(405);
  });

  it("short-circuits when EMAIL_VIA_VERCEL=0", async () => {
    process.env.EMAIL_VIA_VERCEL = "0";
    const res = fakeRes();
    await handler(fakeReq(Buffer.from("{}")), res);
    expect(res._status).toBe(200);
    expect(res._body).toMatchObject({ skipped: "EMAIL_VIA_VERCEL_disabled" });
    expect(resendSendMock).not.toHaveBeenCalled();
  });

  it("400s when the signature cannot be verified", async () => {
    constructEventAsyncMock.mockRejectedValueOnce(new Error("bad sig"));
    const res = fakeRes();
    await handler(fakeReq(Buffer.from(`{"id":"evt_1"}`)), res);
    expect(res._status).toBe(400);
  });

  it("sends an owner email on checkout.session.completed", async () => {
    constructEventAsyncMock.mockResolvedValueOnce({ id: "evt_sig_ok_1", type: "checkout.session.completed", data: { object: { id: "cs_test_1" } } });
    sessionsRetrieveMock.mockResolvedValueOnce(fullSession);
    const res = fakeRes();
    await handler(fakeReq(Buffer.from(`{"id":"evt_sig_ok_1"}`)), res);
    expect(res._status).toBe(200);
    expect(resendSendMock).toHaveBeenCalledTimes(1);
    const args = resendSendMock.mock.calls[0]?.[0];
    expect(args.to).toEqual(["owner-a@example.com", "owner-b@example.com"]);
    expect(args.subject).toMatch(/Pedido/);
    expect(args.html).toMatch(/Ada Lovelace/);
    expect(args.html).toMatch(/ada@example.com/);
  });

  it("adds DANIEL_EMAIL for Sevilla orders", async () => {
    constructEventAsyncMock.mockResolvedValueOnce({ id: "evt_sevilla", type: "checkout.session.completed", data: { object: { id: "cs_test_1" } } });
    const sevillaSession = { ...fullSession, metadata: { ...fullSession.metadata, source_path: "/sevilla", page_language: "es" } };
    sessionsRetrieveMock.mockResolvedValueOnce(sevillaSession);
    const res = fakeRes();
    await handler(fakeReq(Buffer.from(`{"id":"evt_sevilla"}`)), res);
    expect(resendSendMock).toHaveBeenCalledTimes(1);
    const args = resendSendMock.mock.calls[0]?.[0];
    expect(args.to).toContain("daniel@example.com");
  });

  it("is idempotent — a duplicate event id is not resent", async () => {
    constructEventAsyncMock.mockResolvedValueOnce({ id: "evt_dup_1", type: "checkout.session.completed", data: { object: { id: "cs_test_1" } } });
    sessionsRetrieveMock.mockResolvedValueOnce(fullSession);
    await handler(fakeReq(Buffer.from(`{"id":"evt_dup_1"}`)), fakeRes());
    expect(resendSendMock).toHaveBeenCalledTimes(1);

    constructEventAsyncMock.mockResolvedValueOnce({ id: "evt_dup_1", type: "checkout.session.completed", data: { object: { id: "cs_test_1" } } });
    const res2 = fakeRes();
    await handler(fakeReq(Buffer.from(`{"id":"evt_dup_1"}`)), res2);
    expect(res2._body).toMatchObject({ duplicate: true });
    expect(resendSendMock).toHaveBeenCalledTimes(1);
  });

  it("ignores non-checkout events", async () => {
    constructEventAsyncMock.mockResolvedValueOnce({ id: "evt_other", type: "payment_intent.succeeded", data: { object: {} } });
    const res = fakeRes();
    await handler(fakeReq(Buffer.from(`{"id":"evt_other"}`)), res);
    expect(resendSendMock).not.toHaveBeenCalled();
    expect(res._body).toMatchObject({ ignored: "payment_intent.succeeded" });
  });
});

describe("pickLineItems", () => {
  it("falls back to product name when description is missing", () => {
    const items = pickLineItems([
      { description: null, quantity: 1, amount_total: 500, price: { product: { name: "Widget", metadata: { material: "PETG" } } } } as any,
    ]);
    expect(items[0]).toMatchObject({ name: "Widget", quantity: 1, amountCents: 500, material: "PETG" });
  });
});
