import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured");
    }

    const { amount, upi_id, account_number, ifsc, beneficiary_name, mode = "UPI" } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (mode === "UPI" && !upi_id) {
      return new Response(
        JSON.stringify({ error: "UPI ID is required for UPI transfer" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (mode === "IMPS" && (!account_number || !ifsc || !beneficiary_name)) {
      return new Response(
        JSON.stringify({ error: "Account number, IFSC, and beneficiary name required for bank transfer" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amountInPaise = Math.round(amount * 100);

    // Create a contact first
    const contactRes = await fetch("https://api.razorpay.com/v1/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify({
        name: beneficiary_name || "Customer",
        type: "customer",
      }),
    });

    const contact = await contactRes.json();
    console.log("Contact response status:", contactRes.status, "body:", JSON.stringify(contact));
    if (!contactRes.ok) {
      console.error("Contact creation failed:", contact);
      return new Response(
        JSON.stringify({ error: "Failed to create contact" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create fund account
    const fundAccountBody: any = {
      contact_id: contact.id,
      account_type: mode === "UPI" ? "vpa" : "bank_account",
    };

    if (mode === "UPI") {
      fundAccountBody.vpa = { address: upi_id };
    } else {
      fundAccountBody.bank_account = {
        name: beneficiary_name,
        ifsc,
        account_number,
      };
    }

    const fundRes = await fetch("https://api.razorpay.com/v1/fund_accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify(fundAccountBody),
    });

    const fundAccount = await fundRes.json();
    console.log("Fund account response status:", fundRes.status, "body:", JSON.stringify(fundAccount));
    if (!fundRes.ok) {
      console.error("Fund account creation failed:", fundAccount);
      return new Response(
        JSON.stringify({ error: fundAccount.error?.description || "Failed to create fund account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create payout
    const payoutRes = await fetch("https://api.razorpay.com/v1/payouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify({
        account_number: Deno.env.get("RAZORPAY_ACCOUNT_NUMBER") || "",
        fund_account_id: fundAccount.id,
        amount: amountInPaise,
        currency: "INR",
        mode: mode === "UPI" ? "UPI" : "IMPS",
        purpose: "payout",
        queue_if_low_balance: true,
      }),
    });

    const payout = await payoutRes.json();
    if (!payoutRes.ok) {
      console.error("Payout creation failed:", payout);
      return new Response(
        JSON.stringify({ error: payout.error?.description || "Payout failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, payout_id: payout.id, status: payout.status }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Payout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
