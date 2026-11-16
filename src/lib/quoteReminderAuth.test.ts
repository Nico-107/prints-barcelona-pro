import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import ts from "typescript";
import { authenticateCronRequest } from "../../supabase/functions/_shared/cron-auth";

// Execute the actual entrypoint's authorization prefix, stopping before database work.
const source = readFileSync("supabase/functions/send-quote-reminders/index.ts", "utf8");
const start = source.indexOf('  if (req.method === "OPTIONS")');
const end = source.indexOf("    const admin = createClient");
const authorize = new Function("req", "Deno", "authenticateCronRequest", "corsHeaders",
  ts.transpile(source.slice(start, end) + " return null; } catch (error) { throw error; }"));

describe("reminder callback authorization", () => {
  const cronSecret = randomBytes(32).toString("hex");
  const serviceKey = randomBytes(32).toString("hex");
  const deno = { env: { get: (name: string) => ({
    LOVABLE_CRON_SECRET: cronSecret,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    SUPABASE_URL: "https://example.invalid",
  }[name]) } };

  function run(bearer?: string) {
    vi.stubGlobal("Deno", deno);
    try {
      return authorize(new Request("https://example.invalid", {
        method: "POST", headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
      }), deno, authenticateCronRequest, {});
    } finally { vi.unstubAllGlobals(); }
  }

  it("accepts the managed scheduler credential", () => {
    expect(run(cronSecret)).toBeNull();
  });
  it("preserves service-role key access", () => {
    expect(run(serviceKey)).toBeNull();
  });
  it("preserves the existing service_role JWT check", () => {
    const payload = btoa(JSON.stringify({ role: "service_role" }));
    expect(run(`header.${payload}.signature`)).toBeNull();
  });
  it("rejects a missing credential with 401", () => {
    expect(run()?.status).toBe(401);
  });
  it("rejects an incorrect credential with 401", () => {
    expect(run("incorrect-credential")?.status).toBe(401);
  });
});