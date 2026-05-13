import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type InvestmentTx = {
  id: string;
  type: string;
  metal: "gold" | "silver" | null;
  grams: number;
  amount_inr: number;
  created_at: string;
};

export const useRecentInvestments = (opts?: { metal?: "gold" | "silver"; limit?: number }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<InvestmentTx[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    let q = supabase
      .from("investment_transactions")
      .select("id, type, metal, grams, amount_inr, created_at")
      .eq("user_id", user.id)
      .in("type", ["buy", "sip"])
      .order("created_at", { ascending: false })
      .limit(opts?.limit ?? 50);
    if (opts?.metal) q = q.eq("metal", opts.metal);
    const { data } = await q;
    setItems(
      (data ?? []).map((r) => ({
        id: r.id,
        type: r.type,
        metal: (r.metal as "gold" | "silver" | null) ?? null,
        grams: Number(r.grams) || 0,
        amount_inr: Number(r.amount_inr) || 0,
        created_at: r.created_at,
      })),
    );
    setLoading(false);
  }, [user, opts?.metal, opts?.limit]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`inv-tx-${user.id}-${opts?.metal ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "investment_transactions", filter: `user_id=eq.${user.id}` },
        () => refresh(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, opts?.metal, refresh]);

  return { items, loading, refresh };
};