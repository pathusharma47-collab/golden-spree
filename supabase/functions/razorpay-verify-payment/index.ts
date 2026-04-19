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
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay secret not configured");
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Missing payment verification fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature using HMAC SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const data = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const isValid = expectedSignature === razorpay_signature;

    const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null;

    if (!isValid) {
      if (supabase) {
        await supabase
          .from("payment_transactions")
          .update({
            payment_id: razorpay_payment_id,
            signature: razorpay_signature,
            status: "failed",
          })
          .eq("order_id", razorpay_order_id);
      }
      return new Response(
        JSON.stringify({ verified: false, error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optionally fetch payment method details
    let method: string | null = null;
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      try {
        const pRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
          headers: {
            Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
          },
        });
        if (pRes.ok) {
          const p = await pRes.json();
          method = p.method || null;
        }
      } catch (_) {
        /* noop */
      }
    }

    if (supabase) {
      await supabase
        .from("payment_transactions")
        .update({
          payment_id: razorpay_payment_id,
          signature: razorpay_signature,
          status: "success",
          method,
        })
        .eq("order_id", razorpay_order_id);
    }

    return new Response(
      JSON.stringify({ verified: true, payment_id: razorpay_payment_id, method }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
