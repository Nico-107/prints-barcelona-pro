import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const POSTHOG_KEY = Deno.env.get("POSTHOG_KEY");
const POSTHOG_HOST = Deno.env.get("POSTHOG_HOST");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FileItem {
  fileName: string;
  material: string;
  infillPct: number;
  quantity: number;
  volumeCm3: number;
  grams: number;
  estHours: number;
  exactPrice: number;
}

// New batch payload (one call per upload)
interface BatchPayload {
  files: FileItem[];
  totalPrice: number;
  fileCount: number;
  filePaths?: string[];
  fileNames?: string[];
  language?: string;
  sourceCity?: string | null;
  sourcePath?: string | null;
  phDistinctId?: string | null;
  phSessionId?: string | null;
}

// Legacy single-file payload (backwards compat)
interface LegacyPayload {
  fileName?: string;
  filePaths?: string[];
  fileNames?: string[];
  material: string;
  infillPct: number;
  quantity: number;
  volumeCm3: number;
  grams: number;
  estHours: number;
  priceLow: number;
  priceHigh: number;
  exactPrice?: number;
  language?: string;
  sourceCity?: string | null;
  sourcePath?: string | null;
  phDistinctId?: string | null;
  phSessionId?: string | null;
}

// Simple in-memory rate limiting (resets on function cold start)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 3;

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(clientIP);

  if (!record || now > record.resetTime) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count++;
  return false;
}

// Server-side dedup: same phSessionId + sorted file names within 10 min → skip
const sentBatches = new Map<string, number>();
const DEDUP_WINDOW_MS = 10 * 60 * 1000;

function isBatchDuplicate(phSessionId: string | null | undefined, fileNames: string[]): boolean {
  if (!phSessionId) return false;
  const key = phSessionId + "|" + [...fileNames].sort().join(",");
  const sentAt = sentBatches.get(key);
  if (sentAt && Date.now() - sentAt < DEDUP_WINDOW_MS) return true;
  sentBatches.set(key, Date.now());
  // Evict old entries occasionally
  if (sentBatches.size > 500) {
    const now = Date.now();
    for (const [k, v] of sentBatches) {
      if (now - v > DEDUP_WINDOW_MS) sentBatches.delete(k);
    }
  }
  return false;
}

// PostHog capture helper — 3s timeout, never throws
async function capturePostHog(
  event: string,
  distinctId: string,
  properties: Record<string, unknown>,
): Promise<void> {
  if (!POSTHOG_KEY || !POSTHOG_HOST) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: distinctId,
        properties: { ...properties, $process_person_profile: false },
      }),
      signal: controller.signal,
    });
  } catch {
    // timeout or network error — never throw
  } finally {
    clearTimeout(timer);
  }
}

const sanitize = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const rawBody = await req.json();

    // Normalise to batch format regardless of whether client sent batch or legacy shape
    let files: FileItem[];
    let totalPrice: number;
    let filePaths: string[] | undefined;
    let fileNames: string[] | undefined;
    let language: string | undefined;
    let sourceCity: string | null | undefined;
    let sourcePath: string | null | undefined;
    let phDistinctId: string | null | undefined;
    let phSessionId: string | null | undefined;

    if (Array.isArray(rawBody?.files)) {
      // New batch shape
      const b = rawBody as BatchPayload;
      files = b.files;
      totalPrice = typeof b.totalPrice === "number" ? b.totalPrice : files.reduce((s, f) => s + f.exactPrice, 0);
      filePaths = b.filePaths;
      fileNames = b.fileNames;
      language = b.language;
      sourceCity = b.sourceCity;
      sourcePath = b.sourcePath;
      phDistinctId = b.phDistinctId;
      phSessionId = b.phSessionId;
    } else {
      // Legacy single-file shape — backwards compat
      const l = rawBody as LegacyPayload;
      const displayPrice = (typeof l.exactPrice === "number" && isFinite(l.exactPrice) && l.exactPrice > 0)
        ? l.exactPrice
        : (l.priceLow + l.priceHigh) / 2;
      files = [{
        fileName: l.fileName ?? "file.stl",
        material: l.material,
        infillPct: l.infillPct,
        quantity: l.quantity,
        volumeCm3: l.volumeCm3,
        grams: l.grams,
        estHours: l.estHours,
        exactPrice: displayPrice,
      }];
      totalPrice = displayPrice;
      filePaths = l.filePaths;
      fileNames = l.fileNames;
      language = l.language;
      sourceCity = l.sourceCity;
      sourcePath = l.sourcePath;
      phDistinctId = l.phDistinctId;
      phSessionId = l.phSessionId;
    }

    if (!files.length || !files[0].material || files[0].infillPct == null) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Server-side dedup guard
    if (isBatchDuplicate(phSessionId, files.map(f => f.fileName))) {
      console.log(`[send-price-estimate] Duplicate batch skipped for session ${phSessionId}`);
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const safeLang = language ? sanitize(language) : "es";
    const safeSourcePath = sourcePath ? sanitize(sourcePath) : "web";
    const fileCount = files.length;

    // Generate signed URLs for all uploaded files
    const fileLinks: { name: string; url: string }[] = [];
    if (filePaths?.length) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      for (let i = 0; i < filePaths.length; i++) {
        const { data, error } = await supabase.storage
          .from("print-requests")
          .createSignedUrl(filePaths[i], 60 * 60 * 24 * 7);
        if (!error && data?.signedUrl) {
          fileLinks.push({ name: fileNames?.[i] ?? filePaths[i], url: data.signedUrl });
        } else {
          console.error("Signed URL error for", filePaths[i], error);
        }
      }
    }

    const recipients =
      sourceCity?.toLowerCase().includes("sevilla") ||
      sourceCity?.toLowerCase().includes("seville")
        ? ["3d.kayda@gmail.com", "dimension3dprintsbcn@gmail.com"]
        : ["011107miko@gmail.com", "dimension3dprintsbcn@gmail.com"];

    const subject = `[CALCULADORA] ${fileCount} archivo(s) · €${totalPrice.toFixed(2)} · ${safeLang} · ${safeSourcePath}`;

    // Build file table rows
    const uniqueMaterials = [...new Set(files.map(f => f.material))];
    const fileTableRows = files.map(f => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;">${sanitize(f.fileName)}</td>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:center;">${sanitize(f.material)}</td>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:center;">${f.infillPct}%</td>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:center;">${f.quantity}</td>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${f.grams.toFixed(1)} g</td>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${f.estHours.toFixed(1)} h</td>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">€${f.exactPrice.toFixed(2)}</td>
      </tr>`).join("\n");

    const fileLinksHtml = fileLinks.map(f =>
      `<p style="margin:8px 0;">
        <a href="${f.url}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:8px 16px;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">
          ⬇ ${sanitize(f.name)}
        </a>
      </p>`
    ).join("\n");

    console.log(`Processing price estimate batch: ${fileCount} file(s), €${totalPrice.toFixed(2)}, ${safeLang} (IP: ${clientIP})`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dimension3D <noreply@dimension3dprints.com>",
        to: recipients,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
            <h1 style="color: #0f172a;">New price estimate — ${fileCount} file(s)</h1>

            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #334155; margin-top: 0;">Summary</h2>
              <p><strong>Files:</strong> ${fileCount}</p>
              <p><strong>Materials:</strong> ${uniqueMaterials.map(sanitize).join(", ")}</p>
              <p><strong>Language:</strong> ${safeLang}</p>
              <p><strong>Page:</strong> ${safeSourcePath}</p>
              ${sourceCity ? `<p><strong>City:</strong> ${sanitize(sourceCity)}</p>` : ""}
            </div>

            <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #92400e; margin-top: 0;">Pieces</h2>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:6px 8px;border:1px solid #e2e8f0;text-align:left;">File</th>
                    <th style="padding:6px 8px;border:1px solid #e2e8f0;">Material</th>
                    <th style="padding:6px 8px;border:1px solid #e2e8f0;">Infill</th>
                    <th style="padding:6px 8px;border:1px solid #e2e8f0;">Qty</th>
                    <th style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">Weight</th>
                    <th style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">Time</th>
                    <th style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${fileTableRows}
                  <tr style="font-weight:bold;background:#f8fafc;">
                    <td colspan="6" style="padding:6px 8px;border:1px solid #e2e8f0;">Total</td>
                    <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">€${totalPrice.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #065f46; margin-top: 0;">STL files (${fileLinks.length})</h2>
              ${fileLinksHtml || "<p>No files attached.</p>"}
              <p style="color:#6b7280;font-size:12px;margin-top:12px;">Links expire in 7 days.</p>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              This email was sent automatically from Dimension3D when a visitor used the STL price calculator.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", emailResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "EMAIL_SEND_FAILED", details: errorText, status: emailResponse.status }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailData = await emailResponse.json();
    console.log("Price estimate email sent successfully:", emailData.id);

    // Item 3: server-side PostHog capture (immune to ad blockers)
    const phId = (typeof phDistinctId === "string" && phDistinctId.trim())
      ? phDistinctId.trim()
      : "anon_" + crypto.randomUUID();
    await capturePostHog("calculator_estimate_server", phId, {
      file_count: fileCount,
      total_price: totalPrice,
      materials: uniqueMaterials.join(","),
      language: safeLang,
      source_path: sourcePath ?? null,
      source_city: sourceCity ?? null,
      $session_id: phSessionId ?? null,
    });

    return new Response(JSON.stringify({ success: true, emailId: emailData.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-price-estimate:", error?.message, error?.stack);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", message: error?.message ?? "unknown" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
