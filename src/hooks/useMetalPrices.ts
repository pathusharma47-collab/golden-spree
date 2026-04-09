import { useState, useEffect } from "react";

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
  const [prices, setPrices] = useState<MetalPrices>(() => {
    const stored = localStorage.getItem("metal_prices");
    return stored ? JSON.parse(stored) : DEFAULT_PRICES;
  });

  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem("metal_prices");
      if (stored) setPrices(JSON.parse(stored));
    };
    window.addEventListener("storage", handler);
    // Also poll for same-tab updates
    const interval = setInterval(handler, 2000);
    return () => { window.removeEventListener("storage", handler); clearInterval(interval); };
  }, []);

  return prices;
};
