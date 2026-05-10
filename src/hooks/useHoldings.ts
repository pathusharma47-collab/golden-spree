import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Holdings {
  gold: number;
  silver: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useHoldings = (): Holdings => {
  const { user } = useAuth();
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setGold(0);
      setSilver(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("holdings")
      .select("metal, grams")
      .eq("user_id", user.id);
    let g = 0;
    let s = 0;
    for (const row of data ?? []) {
      if (row.metal === "gold") g += Number(row.grams);
      else if (row.metal === "silver") s += Number(row.grams);
    }
    setGold(g);
    setSilver(s);
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

  return { gold, silver, loading, refresh };
};