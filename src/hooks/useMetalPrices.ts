import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MetalPrices {
  gold24k: string;
  gold22k: string;
  silver: string;
  updatedAt: string;
}

const DEFAULT_PRICES: MetalPrices = {
  gold24k: "7150",
  gold22k: "6550",
  silver: "85",
  updatedAt: new Date().toISOString(),
};

export const useMetalPrices = () => {
  const [prices, setPrices] = useState<MetalPrices>(DEFAULT_PRICES);

  useEffect(() => {
    const fetchPrices = async () => {
      const { data, error } = await supabase
        .from("metal_prices")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setPrices({
          gold24k: String(data.gold_24k),
          gold22k: String(data.gold_22k),
          silver: String(data.silver),
          updatedAt: data.updated_at,
        });
      }
    };

    fetchPrices();

    // Realtime subscription for live updates
    const channel = supabase
      .channel("metal-prices-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "metal_prices" },
        () => {
          fetchPrices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return prices;
};