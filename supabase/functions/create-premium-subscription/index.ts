import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Cliente admin (para escribir en DB)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN")!;
    const siteUrl = Deno.env.get("SITE_URL")!;

    // ⚠️ TEMPORAL: user ficticio (hasta webhook)
    const userId = "TEMP_USER";

    // Crear suscripción en Mercado Pago
    const mpResponse = await fetch(
      "https://api.mercadopago.com/preapproval",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mpAccessToken}`,
        },
        body: JSON.stringify({
          reason: "Profinder Premium (mensual)",
          external_reference: userId,
          payer_email: "test@profinder.com",
          back_url: `${siteUrl}/premium/return`,
          notification_url: `${siteUrl}/mp/webhook`,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 100,
            currency_id: "ARS",
          },
          status: "pending",
        }),
      }
    );

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return new Response(JSON.stringify(mpData), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Guardar suscripción
    await supabaseAdmin.from("premium_subscriptions").insert({
      user_id: userId,
      mp_preapproval_id: mpData.id,
      status: "pending",
    });

    const initPoint = mpData.init_point || mpData.sandbox_init_point;

    return new Response(
      JSON.stringify({ init_point: initPoint }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
