import { motion } from "framer-motion";

/**
 * Decorative double-wave at the bottom of the screen using the gold theme.
 * Mirrors the reference Audit app's purple wave, restyled in Maheshwari gold.
 */
const BrandWave = ({ className = "" }: { className?: string }) => (
  <div className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden ${className}`}>
    <svg
      viewBox="0 0 375 220"
      preserveAspectRatio="none"
      className="w-full h-[220px] block"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bwGoldLight" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(43 80% 60% / 0.35)" />
          <stop offset="100%" stopColor="hsl(43 72% 48% / 0.55)" />
        </linearGradient>
        <linearGradient id="bwGoldDeep" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(43 72% 48%)" />
          <stop offset="100%" stopColor="hsl(43 65% 35%)" />
        </linearGradient>
      </defs>
      <motion.path
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        d="M0,110 C70,40 150,170 250,90 C320,40 360,120 375,100 L375,220 L0,220 Z"
        fill="url(#bwGoldLight)"
      />
      <motion.path
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
        d="M0,150 C80,90 170,200 260,140 C320,100 360,170 375,150 L375,220 L0,220 Z"
        fill="url(#bwGoldDeep)"
      />
    </svg>
  </div>
);

export default BrandWave;