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
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received review submission request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, rating, reviewText, orderReference }: ReviewPayload = await req.json();

    console.log("Processing review from:", email);

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
    if (rating < 1 || rating > 5) {
      console.error("Invalid rating");
      return new Response(
        JSON.stringify({ error: "Rating must be between 1 and 5" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

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
              <p><strong>Nombre:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${orderReference ? `<p><strong>Referencia del pedido:</strong> ${orderReference}</p>` : ""}
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #065f46; margin-top: 0;">Reseña</h2>
              <p style="font-size: 24px; margin: 10px 0; color: #f59e0b;">${starsDisplay}</p>
              <p><strong>Valoración:</strong> ${rating}/5</p>
              <div style="background-color: white; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #10b981;">
                <p style="margin: 0; font-style: italic; color: #374151;">"${reviewText}"</p>
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
