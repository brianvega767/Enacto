import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  try {
    const body = await req.json();

    // Mercado Pago manda el ID acá
    const preapprovalId =
      body?.data?.id || body?.id || body?.preapproval_id;

    if (!preapprovalId) {
      return new Response("No preapproval id", { status: 200 });
    }

    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN")!;

    // 1️⃣ Consultar estado real en Mercado Pago
    const mpResponse = await fetch(
      `https://api.mercadopago.com/preapproval/${preapprovalId}`,
      {
        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
        },
      }
    );

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("MP fetch error:", mpData);
      return new Response("MP error", { status: 200 });
    }

    const status = mpData.status; // authorized | active | cancelled | paused

    // 2️⃣ Supabase admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 3️⃣ Buscar la suscripción local
    const { data: subscription } = await supabaseAdmin
      .from("premium_subscriptions")
      .select("*")
      .eq("mp_preapproval_id", preapprovalId)
      .single();

    if (!subscription) {
      console.warn("Subscription not found:", preapprovalId);
      return new Response("Not found", { status: 200 });
    }

    // 4️⃣ Actualizar estado de la suscripción
    await supabaseAdmin
      .from("premium_subscriptions")
      .update({ status })
      .eq("id", subscription.id);

    // 5️⃣ Activar / desactivar premium según estado
    if (status === "authorized" || status === "active") {
      await supabaseAdmin
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", subscription.user_id);
    }

    if (status === "cancelled" || status === "paused") {
      await supabaseAdmin
        .from("profiles")
        .update({ is_premium: false })
        .eq("id", subscription.user_id);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("OK", { status: 200 });
  }
});
