import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "011107miko@gmail.com";

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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, filePath, userEmail, message }: PrintRequestPayload = await req.json();

    // Create Supabase client with service role for signed URL generation
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a signed URL valid for 7 days
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("print-requests")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

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
        from: "Print3D BCN <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `Nueva solicitud de impresión 3D - ${fileName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0f172a;">Nueva solicitud de impresión 3D</h1>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #334155; margin-top: 0;">Detalles del cliente</h2>
              <p><strong>Email del cliente:</strong> ${userEmail}</p>
              ${message ? `<p><strong>Mensaje:</strong> ${message}</p>` : ""}
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #065f46; margin-top: 0;">Archivo 3D</h2>
              <p><strong>Nombre del archivo:</strong> ${fileName}</p>
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
    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-print-request function:", error);
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
