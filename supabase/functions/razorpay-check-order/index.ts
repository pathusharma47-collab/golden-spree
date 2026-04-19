import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(
        JSON.stringify({ error: "Razorpay not configured", fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch payments for this order
    const res = await fetch(`https://api.razorpay.com/v1/orders/${order_id}/payments`, {
      headers: {
        Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Razorpay order lookup failed:", res.status, text);
      return new Response(
        JSON.stringify({ status: "unknown", fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const payments = data.items || [];
    const captured = payments.find((p: any) => p.status === "captured" || p.status === "authorized");

    if (!captured) {
      return new Response(
        JSON.stringify({ status: "pending", payments_count: payments.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update DB row to success
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase
          .from("payment_transactions")
          .update({
            payment_id: captured.id,
            status: "success",
            method: captured.method || null,
          })
          .eq("order_id", order_id);
      } catch (e) {
        console.error("DB update failed:", e);
      }
    }

    return new Response(
      JSON.stringify({
        status: "success",
        payment_id: captured.id,
        method: captured.method,
        amount: captured.amount / 100,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("check-order error:", error);
    return new Response(
      JSON.stringify({ error: String(error), fallback: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
