import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "011107miko@gmail.com";
const POSTHOG_KEY = Deno.env.get("POSTHOG_KEY");
const POSTHOG_HOST = Deno.env.get("POSTHOG_HOST");

function captureEvent(event: string, distinctId: string, properties?: Record<string, unknown>): void {
  if (!POSTHOG_KEY || !POSTHOG_HOST) return;
  fetch(`${POSTHOG_HOST}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: POSTHOG_KEY, event, distinct_id: distinctId, properties: properties ?? {} }),
  }).catch(() => {});
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PrintRequestPayload {
  fileName: string;
  filePath: string;
  userEmail: string;
  message?: string;
  isUrgent?: boolean;
   // Honeypot field - should always be empty
   website?: string;
   // Timestamp for timing-based bot detection
   formStartTime?: number;
}

// Simple in-memory rate limiting (resets on function cold start)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
     // Get client IP for rate limiting
     const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                      req.headers.get("cf-connecting-ip") || 
                      "unknown";
 
     // Check rate limit
     if (isRateLimited(clientIP)) {
       console.warn(`Rate limit exceeded for IP: ${clientIP}`);
       return new Response(
         JSON.stringify({ error: "Too many requests. Please try again later." }),
         {
           status: 429,
           headers: { "Content-Type": "application/json", ...corsHeaders },
         }
       );
     }
 
     const payload: PrintRequestPayload = await req.json();
     const { fileName, filePath, userEmail, message, isUrgent, website, formStartTime } = payload;
 
     // Honeypot check - if website field is filled, it's likely a bot
     if (website && website.trim() !== "") {
       console.warn(`Honeypot triggered by IP: ${clientIP}`);
       // Return success to not tip off the bot, but don't process
       return new Response(JSON.stringify({ success: true }), {
         status: 200,
         headers: { "Content-Type": "application/json", ...corsHeaders },
       });
     }
 
     // Timing check - if form was submitted too quickly (< 3 seconds), likely a bot
     if (formStartTime) {
       const submissionTime = Date.now() - formStartTime;
       if (submissionTime < 3000) {
         console.warn(`Form submitted too quickly (${submissionTime}ms) by IP: ${clientIP}`);
         return new Response(JSON.stringify({ success: true }), {
           status: 200,
           headers: { "Content-Type": "application/json", ...corsHeaders },
         });
       }
     }
 
     // Validate required fields
     if (!fileName || typeof fileName !== "string" || fileName.trim().length === 0) {
       return new Response(
         JSON.stringify({ error: "Invalid file name" }),
         { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }
 
     if (!filePath || typeof filePath !== "string" || filePath.trim().length === 0) {
       return new Response(
         JSON.stringify({ error: "Invalid file path" }),
         { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }
 
     if (!userEmail || typeof userEmail !== "string") {
       return new Response(
         JSON.stringify({ error: "Invalid email" }),
         { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }
 
     // Validate email format
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailRegex.test(userEmail.trim())) {
       return new Response(
         JSON.stringify({ error: "Invalid email format" }),
         { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }
 
     // Validate field lengths
     if (fileName.length > 500) {
       return new Response(
         JSON.stringify({ error: "File name too long" }),
         { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }
 
     if (message && message.length > 2000) {
       return new Response(
         JSON.stringify({ error: "Message too long" }),
         { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }
 
     // Sanitize inputs for HTML email
     const sanitize = (str: string): string => {
       return str
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
     };
 
     const safeFileName = sanitize(fileName.trim());
     const safeUserEmail = sanitize(userEmail.trim());
     const safeMessage = message ? sanitize(message.trim()) : "";
 
     console.log(`Processing print request from ${safeUserEmail} (IP: ${clientIP})`);

    // Create Supabase client with service role for signed URL generation
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a signed URL valid for 7 days
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("print-requests")
       .createSignedUrl(filePath.trim(), 60 * 60 * 24 * 7); // 7 days

    if (signedUrlError) {
      console.error("Error generating signed URL:", signedUrlError);
      throw new Error("Failed to generate download link");
    }

    const downloadUrl = signedUrlData.signedUrl;

    // Send email to admin using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dimension3D <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
         subject: `${isUrgent ? "🚨 URGENTE - " : ""}Nueva solicitud de impresión 3D - ${safeFileName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0f172a;">Nueva solicitud de impresión 3D</h1>
            
            ${isUrgent ? `
            <div style="background-color: #fef2f2; border: 2px solid #ef4444; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #dc2626; margin: 0; display: flex; align-items: center; gap: 8px;">
                ⚡ PEDIDO URGENTE - 48 HORAS
              </h2>
              <p style="color: #991b1b; margin: 8px 0 0 0;">
                El cliente ha solicitado entrega prioritaria con suplemento express.
              </p>
            </div>
            ` : ""}
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #334155; margin-top: 0;">Detalles del cliente</h2>
               <p><strong>Email del cliente:</strong> ${safeUserEmail}</p>
               ${safeMessage ? `<p><strong>Mensaje:</strong> ${safeMessage}</p>` : ""}
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #065f46; margin-top: 0;">Archivo 3D</h2>
               <p><strong>Nombre del archivo:</strong> ${safeFileName}</p>
              <p>
                <a href="${downloadUrl}" style="display: inline-block; background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                  Descargar archivo
                </a>
              </p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">
                Este enlace expira en 7 días.
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              Este email fue enviado automáticamente desde Dimension3D.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", emailResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: "EMAIL_SEND_FAILED",
          details: errorText,
          status: emailResponse.status,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    captureEvent("print request processed", "server", { is_urgent: isUrgent });

    return new Response(JSON.stringify({ success: true, emailId: emailData.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-print-request function:", error?.message, error?.stack);
    return new Response(
       JSON.stringify({ error: "INTERNAL_ERROR", message: error?.message ?? "unknown" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
