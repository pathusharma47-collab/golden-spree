/**
 * Centralized formatters used across the app.
 * Indian numbering system (lakhs/crores) for currency.
 */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrFormatterPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

export const formatINR = (value: number | string, opts?: { paise?: boolean }) => {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!isFinite(n)) return "₹0";
  return opts?.paise ? inrFormatterPaise.format(n) : inrFormatter.format(n);
};

export const formatNumber = (value: number | string) => {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!isFinite(n)) return "0";
  return numberFormatter.format(n);
};

export const formatGrams = (grams: number | string, decimals = 4) => {
  const n = typeof grams === "string" ? parseFloat(grams) : grams;
  if (!isFinite(n)) return "0g";
  return `${n.toFixed(decimals)}g`;
};

/** Returns relative time like "2m ago", "1h ago", "Just now". */
export const relativeTime = (iso: string | Date) => {
  const then = typeof iso === "string" ? new Date(iso).getTime() : iso.getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 30) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const m = Math.floor(diffSec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};