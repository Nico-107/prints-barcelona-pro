import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received review approval request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const action = url.searchParams.get("action") || "approve";

    if (!token) {
      return new Response(
        generateHtmlResponse("Error", "Token de aprobación no proporcionado.", false),
        {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // Validate token format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return new Response(
        generateHtmlResponse("Error", "Token de aprobación inválido.", false),
        {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the review by approval token
    const { data: review, error: fetchError } = await supabase
      .from("reviews")
      .select("*")
      .eq("approval_token", token)
      .single();

    if (fetchError || !review) {
      console.error("Review not found:", fetchError);
      return new Response(
        generateHtmlResponse(
          "No encontrada",
          "La reseña no fue encontrada o el enlace ya no es válido.",
          false
        ),
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // Check if already processed
    if (review.status !== "pending") {
      const statusText = review.status === "published" ? "aprobada" : "rechazada";
      return new Response(
        generateHtmlResponse(
          "Ya procesada",
          `Esta reseña ya fue ${statusText} anteriormente.`,
          review.status === "published"
        ),
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // Update the review status
    const newStatus = action === "reject" ? "rejected" : "published";
    const updateData: Record<string, unknown> = { status: newStatus };
    
    if (newStatus === "published") {
      updateData.published_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("reviews")
      .update(updateData)
      .eq("id", review.id);

    if (updateError) {
      console.error("Error updating review:", updateError);
      return new Response(
        generateHtmlResponse("Error", "No se pudo actualizar la reseña. Por favor, inténtalo de nuevo.", false),
        {
          status: 500,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    const actionText = newStatus === "published" ? "aprobada" : "rechazada";
    console.log(`Review ${review.id} has been ${actionText}`);

    return new Response(
      generateHtmlResponse(
        newStatus === "published" ? "¡Reseña aprobada!" : "Reseña rechazada",
        newStatus === "published"
          ? `La reseña de ${review.name} ha sido aprobada y ahora es visible en la web.`
          : `La reseña de ${review.name} ha sido rechazada.`,
        newStatus === "published"
      ),
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in approve-review function:", error);
    return new Response(
      generateHtmlResponse("Error", "Ha ocurrido un error. Por favor, inténtalo de nuevo.", false),
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      }
    );
  }
};

function generateHtmlResponse(title: string, message: string, success: boolean): string {
  const bgColor = success ? "#ecfdf5" : "#fef2f2";
  const textColor = success ? "#065f46" : "#991b1b";
  const icon = success ? "✓" : "✕";
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Reality 3D BCN</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background-color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: ${bgColor};
      color: ${textColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin: 0 auto 24px;
    }
    h1 {
      color: #1e293b;
      font-size: 24px;
      margin-bottom: 12px;
    }
    p {
      color: #64748b;
      font-size: 16px;
      line-height: 1.5;
    }
    .logo {
      margin-top: 32px;
      font-weight: 600;
      color: #94a3b8;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="logo">Reality 3D BCN</div>
  </div>
</body>
</html>
  `;
}

serve(handler);
