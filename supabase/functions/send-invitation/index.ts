
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the API key existence (without showing the actual key)
    console.log("API Key exists:", !!RESEND_API_KEY);
    
    const { email, coachName } = await req.json();
    
    if (!RESEND_API_KEY) {
      throw new Error("Resend API key is not configured");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Sprintopia <no-reply@sprintopia.app>",
        to: [email],
        subject: `${coachName} vous invite à rejoindre Sprintopia`,
        html: `
          <h1>Invitation à rejoindre Sprintopia</h1>
          <p>${coachName} vous invite à rejoindre Sprintopia en tant qu'athlète.</p>
          <p>Pour créer votre compte, cliquez sur le lien ci-dessous :</p>
          <a href="https://sprintopia.app/signup?email=${email}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Créer mon compte
          </a>
        `,
      }),
    });

    const responseText = await res.text();
    console.log("Resend API response:", responseText);

    if (res.ok) {
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { id: "email-sent", text: responseText };
      }
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      throw new Error(responseText);
    }
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
