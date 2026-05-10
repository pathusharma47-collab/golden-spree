import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface SeedUser {
  email: string;
  password: string;
  display_name: string;
  role: "admin" | "user";
  // Migrated mock data
  wallet_balance?: number;
  holdings?: { gold?: number; silver?: number };
}

const SEED_USERS: SeedUser[] = [
  {
    email: "admin@test.com",
    password: "admin123",
    display_name: "Admin",
    role: "admin",
    wallet_balance: 5000,
  },
  {
    email: "user@test.com",
    password: "user123",
    display_name: "Rahul",
    role: "user",
    wallet_balance: 850,
    holdings: { gold: 2.45, silver: 120 },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results: Array<Record<string, unknown>> = [];

  for (const u of SEED_USERS) {
    try {
      // Check if user exists
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list.users.find((x) => x.email === u.email);

      let userId: string;
      if (existing) {
        userId = existing.id;
        // Reset password to known value
        await admin.auth.admin.updateUserById(userId, { password: u.password });
        results.push({ email: u.email, status: "exists", id: userId });
      } else {
        const { data, error } = await admin.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: { display_name: u.display_name },
        });
        if (error || !data.user) {
          results.push({ email: u.email, status: "error", error: error?.message });
          continue;
        }
        userId = data.user.id;
        results.push({ email: u.email, status: "created", id: userId });
      }

      // Make admin if needed
      if (u.role === "admin") {
        await admin.from("user_roles").upsert(
          { user_id: userId, role: "admin" },
          { onConflict: "user_id,role" },
        );
      }

      // Set wallet balance
      if (typeof u.wallet_balance === "number") {
        await admin
          .from("wallets")
          .update({ balance: u.wallet_balance, welcome_bonus_applied: true })
          .eq("user_id", userId);
      }

      // Seed holdings
      if (u.holdings) {
        for (const [metal, grams] of Object.entries(u.holdings)) {
          if (!grams) continue;
          await admin.from("holdings").upsert(
            { user_id: userId, metal, grams },
            { onConflict: "user_id,metal" },
          );
        }
      }
    } catch (e) {
      results.push({
        email: u.email,
        status: "error",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
