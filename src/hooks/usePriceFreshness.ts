import { useEffect, useState } from "react";

export type FreshnessLevel = "fresh" | "stale" | "expired";

export interface Freshness {
  level: FreshnessLevel;
  ageMinutes: number;
  label: string;
}

const STALE_AFTER_MIN = 15;
const EXPIRED_AFTER_MIN = 60;

/**
 * Reports how fresh the live metal prices are.
 * Re-evaluates every 30 seconds.
 */
export const usePriceFreshness = (updatedAt: string | undefined): Freshness => {
  const compute = (): Freshness => {
    if (!updatedAt) return { level: "fresh", ageMinutes: 0, label: "Live" };
    const ageMs = Date.now() - new Date(updatedAt).getTime();
    const ageMinutes = Math.max(0, Math.floor(ageMs / 60000));
    let level: FreshnessLevel = "fresh";
    if (ageMinutes >= EXPIRED_AFTER_MIN) level = "expired";
    else if (ageMinutes >= STALE_AFTER_MIN) level = "stale";
    const label =
      level === "fresh"
        ? "Live"
        : ageMinutes < 60
        ? `${ageMinutes}m ago`
        : `${Math.floor(ageMinutes / 60)}h ago`;
    return { level, ageMinutes, label };
  };

  const [state, setState] = useState<Freshness>(compute);

  useEffect(() => {
    setState(compute());
    const id = setInterval(() => setState(compute()), 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedAt]);

  return state;
};