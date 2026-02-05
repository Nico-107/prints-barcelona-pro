import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "011107miko@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReviewPayload {
  name: string;
  email: string;
  rating: number;
  reviewText: string;
  orderReference?: string;
   // Honeypot field - should always be empty
   website?: string;
   // Timestamp for timing-based bot detection
   formStartTime?: number;
}

// Simple in-memory rate limiting (resets on function cold start)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
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

// Sanitize string for HTML output
function sanitizeHtml(str: string): string {
   return str
     .replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;")
     .replace(/'/g, "&#039;");
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received review submission request");

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

     const payload: ReviewPayload = await req.json();
     const { name, email, rating, reviewText, orderReference, website, formStartTime } = payload;

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

     console.log(`Processing review from: ${email} (IP: ${clientIP})`);

    // Validate required fields
    if (!name || !email || !reviewText || !rating) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

     // Validate field types and lengths
     if (typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
       return new Response(
         JSON.stringify({ error: "Invalid name" }),
         { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }

     if (typeof reviewText !== "string" || reviewText.trim().length === 0 || reviewText.length > 1000) {
       return new Response(
         JSON.stringify({ error: "Review text must be between 1 and 1000 characters" }),
         { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }

     if (orderReference && (typeof orderReference !== "string" || orderReference.length > 200)) {
       return new Response(
         JSON.stringify({ error: "Order reference too long" }),
         { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
       );
     }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (typeof email !== "string" || !emailRegex.test(email.trim()) || email.length > 255) {
      console.error("Invalid email format");
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate rating
     if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      console.error("Invalid rating");
      return new Response(
        JSON.stringify({ error: "Rating must be between 1 and 5" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

     // Sanitize inputs for HTML email
     const safeName = sanitizeHtml(name.trim());
     const safeEmail = sanitizeHtml(email.trim());
     const safeReviewText = sanitizeHtml(reviewText.trim());
     const safeOrderReference = orderReference ? sanitizeHtml(orderReference.trim()) : "";

    // Generate star display
    const starsDisplay = "★".repeat(rating) + "☆".repeat(5 - rating);

    // Send email to admin using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Print3D BCN <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `📝 Nueva reseña de cliente – Pendiente de verificación (${starsDisplay})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #92400e; margin: 0; font-size: 18px;">
                📝 Nueva reseña de cliente – Pendiente de verificación
              </h1>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #334155; margin-top: 0;">Datos del cliente</h2>
               <p><strong>Nombre:</strong> ${safeName}</p>
               <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
               ${safeOrderReference ? `<p><strong>Referencia del pedido:</strong> ${safeOrderReference}</p>` : ""}
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #065f46; margin-top: 0;">Reseña</h2>
              <p style="font-size: 24px; margin: 10px 0; color: #f59e0b;">${starsDisplay}</p>
              <p><strong>Valoración:</strong> ${rating}/5</p>
              <div style="background-color: white; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #10b981;">
                 <p style="margin: 0; font-style: italic; color: #374151;">"${safeReviewText}"</p>
              </div>
            </div>

            <div style="background-color: #fee2e2; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 14px;">⚠️ Acción requerida</h3>
              <p style="color: #7f1d1d; margin: 0; font-size: 14px;">
                Esta reseña requiere verificación manual antes de publicarse. 
                Comprueba que el cliente ha realizado un pedido real y, si es válida, 
                añádela manualmente a la web.
              </p>
            </div>

            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              Este email fue enviado automáticamente desde Print3D BCN.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      throw new Error("Failed to send email");
    }

    const emailData = await emailResponse.json();
    console.log("Review notification email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-review function:", error);
    return new Response(
       JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
