import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "011107miko@gmail.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
  website?: string;
  formStartTime?: number;
}

// Simple in-memory rate limiting
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

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";

    if (isRateLimited(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const payload: ReviewPayload = await req.json();
    const { name, email, rating, reviewText, orderReference, website, formStartTime } = payload;

    // Honeypot check
    if (website && website.trim() !== "") {
      console.warn(`Honeypot triggered by IP: ${clientIP}`);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Timing check
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
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email.trim()) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: "Rating must be between 1 and 5" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Save review to database
    const { data: newReview, error: insertError } = await supabase
      .from("reviews")
      .insert({
        name: name.trim(),
        email: email.trim(),
        rating,
        review_text: reviewText.trim(),
        order_reference: orderReference?.trim() || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting review:", insertError);
      throw new Error("Failed to save review");
    }

    console.log("Review saved to database with ID:", newReview.id);

    // Sanitize inputs for HTML email
    const safeName = sanitizeHtml(name.trim());
    const safeEmail = sanitizeHtml(email.trim());
    const safeReviewText = sanitizeHtml(reviewText.trim());
    const safeOrderReference = orderReference ? sanitizeHtml(orderReference.trim()) : "";

    const starsDisplay = "★".repeat(rating) + "☆".repeat(5 - rating);

    // Generate approval URL
    const approveUrl = `${SUPABASE_URL}/functions/v1/approve-review?token=${newReview.approval_token}&action=approve`;
    const rejectUrl = `${SUPABASE_URL}/functions/v1/approve-review?token=${newReview.approval_token}&action=reject`;

    // Send email to admin with approval buttons
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dimension3D <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `📝 Nueva reseña de cliente – Pendiente de aprobación (${starsDisplay})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #92400e; margin: 0; font-size: 18px;">
                📝 Nueva reseña de cliente – Pendiente de aprobación
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

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #374151; margin-bottom: 16px; font-weight: 600;">¿Aprobar esta reseña?</p>
              <a href="${approveUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 12px;">
                ✓ Aprobar y publicar
              </a>
              <a href="${rejectUrl}" style="display: inline-block; background-color: #ef4444; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                ✕ Rechazar
              </a>
            </div>

            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #64748b; margin: 0; font-size: 13px;">
                Al hacer clic en "Aprobar", la reseña se publicará automáticamente en la web.
                Los enlaces de aprobación son únicos y seguros.
              </p>
            </div>

            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              Este email fue enviado automáticamente desde Dimension3D.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      // Don't fail - review is already saved
    } else {
      console.log("Review notification email sent successfully");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-review function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
