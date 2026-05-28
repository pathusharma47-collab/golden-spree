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

// Module-level cache to avoid flashing empty state on tab switches.
const cache = new Map<string, InvestmentTx[]>();
const keyFor = (userId: string, metal?: string, limit?: number) =>
  `${userId}::${metal ?? "all"}::${limit ?? 50}`;

export const useRecentInvestments = (opts?: { metal?: "gold" | "silver"; limit?: number }) => {
  const { user } = useAuth();
  const cacheKey = user ? keyFor(user.id, opts?.metal, opts?.limit) : null;
  const cached = cacheKey ? cache.get(cacheKey) : undefined;
  const [items, setItems] = useState<InvestmentTx[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);

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
    const mapped: InvestmentTx[] = (data ?? []).map((r) => ({
        id: r.id,
        type: r.type,
        metal: (r.metal as "gold" | "silver" | null) ?? null,
        grams: Number(r.grams) || 0,
        amount_inr: Number(r.amount_inr) || 0,
        created_at: r.created_at,
    }));
    setItems(mapped);
    cache.set(keyFor(user.id, opts?.metal, opts?.limit), mapped);
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