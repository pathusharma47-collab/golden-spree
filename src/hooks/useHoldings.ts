import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Holdings {
  gold: number;
  silver: number;
  goldInvested: number;
  silverInvested: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

// Module-level cache so tab switches don't flash 0 values while refetching.
const cache = new Map<string, { gold: number; silver: number; goldInvested: number; silverInvested: number }>();

export const useHoldings = (): Holdings => {
  const { user } = useAuth();
  const cached = user ? cache.get(user.id) : undefined;
  const [gold, setGold] = useState(cached?.gold ?? 0);
  const [silver, setSilver] = useState(cached?.silver ?? 0);
  const [goldInvested, setGoldInvested] = useState(cached?.goldInvested ?? 0);
  const [silverInvested, setSilverInvested] = useState(cached?.silverInvested ?? 0);
  const [loading, setLoading] = useState(!cached);

  const refresh = useCallback(async () => {
    if (!user) {
      setGold(0);
      setSilver(0);
      setLoading(false);
      return;
    }
    if (!cache.has(user.id)) setLoading(true);
    const [holdingsRes, txRes] = await Promise.all([
      supabase.from("holdings").select("metal, grams").eq("user_id", user.id),
      supabase
        .from("investment_transactions")
        .select("metal, amount_inr, type")
        .eq("user_id", user.id)
        .in("type", ["buy", "sip"]),
    ]);
    let g = 0;
    let s = 0;
    for (const row of holdingsRes.data ?? []) {
      if (row.metal === "gold") g += Number(row.grams);
      else if (row.metal === "silver") s += Number(row.grams);
    }
    let gi = 0;
    let si = 0;
    for (const row of txRes.data ?? []) {
      const amt = Number(row.amount_inr) || 0;
      if (row.metal === "gold") gi += amt;
      else if (row.metal === "silver") si += amt;
    }
    setGold(g);
    setSilver(s);
    setGoldInvested(gi);
    setSilverInvested(si);
    cache.set(user.id, { gold: g, silver: s, goldInvested: gi, silverInvested: si });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime: react to holdings changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`holdings-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "holdings", filter: `user_id=eq.${user.id}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  return { gold, silver, goldInvested, silverInvested, loading, refresh };
};