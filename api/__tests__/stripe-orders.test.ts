import { describe, it, expect, vi, beforeEach } from "vitest";

const listMock = vi.fn();
vi.mock("stripe", () => {
  class FakeStripe {
    checkout = { sessions: { list: listMock } };
  }
  return { default: FakeStripe };
});

const getUserMock = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: { getUser: getUserMock } }),
}));

import handler, { parseAdminEmails } from "../admin/stripe-orders";

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

function fakeReq(authHeader: string | undefined, query: Record<string, string> = {}): any {
  return {
    method: "GET",
    headers: authHeader ? { authorization: authHeader } : {},
    query,
    socket: { remoteAddress: "127.0.0.1" },
  };
}

describe("api/admin/stripe-orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.ADMIN_EMAILS = "admin@example.com";
    process.env.VITE_SUPABASE_URL = "https://supabase.test";
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "anon-test";
  });

  it("401s when there is no bearer token", async () => {
    const res = fakeRes();
    await handler(fakeReq(undefined), res);
    expect(res._status).toBe(401);
  });

  it("401s on invalid supabase session", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: new Error("invalid") });
    const res = fakeRes();
    await handler(fakeReq("Bearer bad"), res);
    expect(res._status).toBe(401);
  });

  it("403s when user email is not in ADMIN_EMAILS", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { email: "other@example.com" } }, error: null });
    const res = fakeRes();
    await handler(fakeReq("Bearer t"), res);
    expect(res._status).toBe(403);
  });

  it("returns paid sessions for authorised admins", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { email: "ADMIN@example.com" } }, error: null });
    listMock.mockResolvedValueOnce({
      data: [
        {
          id: "cs_1", created: 1700000000, amount_total: 2990, currency: "eur", payment_status: "paid",
          customer_details: { name: "Ada", email: "a@example.com", phone: "+34600000000" },
          shipping_details: { address: { line1: "X", city: "BCN", country: "ES" }, name: "Ada" },
          metadata: { order_id: "o-1", order_number: "42", source_path: "/", page_language: "es" },
          payment_intent: "pi_1",
          livemode: false,
        },
        { id: "cs_2", created: 1700000001, amount_total: 1990, payment_status: "unpaid", metadata: {} },
      ],
      has_more: false,
    });
    const res = fakeRes();
    await handler(fakeReq("Bearer t"), res);
    expect(res._status).toBe(200);
    expect((res._body as any).sessions).toHaveLength(1);
    const row = (res._body as any).sessions[0];
    expect(row).toMatchObject({ id: "cs_1", order_id: "o-1", customer_name: "Ada" });
    expect(row.payment_link).toMatch(/dashboard\.stripe\.com/);
  });

  it("502s on Stripe failure", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { email: "admin@example.com" } }, error: null });
    listMock.mockRejectedValueOnce(new Error("Stripe down"));
    const res = fakeRes();
    await handler(fakeReq("Bearer t"), res);
    expect(res._status).toBe(502);
  });
});

describe("parseAdminEmails", () => {
  it("trims and lowercases", () => {
    expect(parseAdminEmails(" A@EXAMPLE.com ,b@example.com")).toEqual(["a@example.com", "b@example.com"]);
  });
  it("returns [] on undefined", () => {
    expect(parseAdminEmails(undefined)).toEqual([]);
  });
});
