import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Gem, Landmark, TrendingUp, ArrowDownRight, Plus, Gift, Share2, Sparkles, ShieldCheck, Calendar, Award } from "lucide-react";
import { useMetalPrices } from "@/hooks/useMetalPrices";
import { useHoldings } from "@/hooks/useHoldings";
import { useRecentInvestments } from "@/hooks/useRecentInvestments";
import { useMemo } from "react";

const LockerScreen = () => {
  const { type } = useParams<{ type: "gold" | "silver" }>();
  const navigate = useNavigate();
  const prices = useMetalPrices();
  const isGold = type !== "silver";

  const { gold, silver, goldInvested, silverInvested } = useHoldings();
  const grams = isGold ? gold : silver;
  const { items: recent } = useRecentInvestments({ metal: isGold ? "gold" : "silver", limit: 5 });
  const goalGrams = isGold ? 10 : 500;
  const rate = parseFloat(isGold ? prices.gold22k : prices.silver) || 0;
  const value = grams * rate;
  const goalValue = goalGrams * rate;
  const progress = Math.min((grams / goalGrams) * 100, 100);
  const investedAmount = isGold ? goldInvested : silverInvested;
  const profit = value - investedAmount;
  const profitPct = investedAmount > 0 ? (profit / investedAmount) * 100 : 0;

  // Gold: 1 bar per gram. Silver: 1 bar per 50g. Capped for visual sanity.
  const rawCount = isGold ? Math.round(grams) : Math.floor(grams / 50);
  const itemCount = grams > 0 ? Math.max(1, Math.min(24, rawCount)) : 0;
  // Lay bars out on a clean grid so each one is clearly visible
  const COLS = 4;
  const COL_W = 44; // px between bar centers horizontally
  const ROW_H = 22; // px between bar centers vertically
  const items = useMemo(
    () => Array.from({ length: itemCount }).map((_, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      // Center the row horizontally; last row may have fewer items
      const itemsInRow = Math.min(COLS, itemCount - row * COLS);
      const x = (col - (itemsInRow - 1) / 2) * COL_W;
      const y = -row * ROW_H;
      return {
        id: i,
        x,
        y,
        delay: i * 0.05,
        rotate: (((i * 37) % 11) - 5) * 0.6, // subtle, deterministic tilt
      };
    }),
    [itemCount]
  );

  const themeBg = isGold
    ? "bg-gradient-to-b from-amber-50 via-yellow-50/40 to-background"
    : "bg-gradient-to-b from-slate-100 via-slate-50/60 to-background";

  const accentGrad = isGold ? "gold-gradient gold-glow" : "silver-gradient";
  const Icon = isGold ? Gem : Landmark;
  const label = isGold ? "Gold" : "Silver";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen ${themeBg} pb-28`}
    >
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-center justify-between max-w-lg mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${accentGrad} flex items-center justify-center`}>
            <Icon size={14} className="text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-foreground text-lg">{label} Locker</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 flex items-center justify-center active:scale-95 transition-transform">
          <Share2 size={16} />
        </button>
      </div>

      <div className="px-4 max-w-lg mx-auto space-y-4">
        {/* The Vault — hero visualization */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: isGold
              ? "linear-gradient(160deg, hsl(43 65% 35%) 0%, hsl(43 72% 48%) 50%, hsl(43 80% 60%) 100%)"
              : "linear-gradient(160deg, hsl(220 10% 35%) 0%, hsl(220 10% 55%) 50%, hsl(220 10% 75%) 100%)",
            boxShadow: isGold
              ? "0 20px 60px -10px hsl(43 72% 48% / 0.5), inset 0 1px 0 hsl(43 80% 75% / 0.4)"
              : "0 20px 60px -10px hsl(220 10% 50% / 0.4), inset 0 1px 0 hsl(220 10% 85% / 0.4)",
          }}
        >
          {/* Glow orbs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />

          {/* Sparkles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white"
              style={{ left: `${10 + i * 11}%`, top: `${15 + (i % 3) * 20}%` }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity }}
            />
          ))}

          <div className="relative p-6 pt-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Total {label}</p>
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                <span className="text-[9px] font-semibold text-white uppercase tracking-wider">Live</span>
              </div>
            </div>

            <motion.p
              key={grams}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl font-bold text-white leading-none"
            >
              {grams.toFixed(2)}
              <span className="text-xl font-normal text-white/70 ml-2">gm</span>
            </motion.p>
            <p className="text-white/85 text-sm mt-2">
              ≈ ₹{value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>

            {/* The vault — glass jar with items */}
            <div className="relative mt-6 h-44 mx-auto max-w-[260px]">
              {/* Jar outline */}
              <div
                className="absolute inset-x-0 bottom-0 h-40 rounded-b-[2.5rem] rounded-t-2xl border-2 border-white/40 overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {/* Fill liquid */}
                <motion.div
                  initial={{ height: "0%" }}
                  animate={{ height: `${progress}%` }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-0 inset-x-0"
                  style={{
                    background: isGold
                      ? "linear-gradient(180deg, hsl(43 95% 70% / 0.5) 0%, hsl(43 90% 55% / 0.85) 100%)"
                      : "linear-gradient(180deg, hsl(220 15% 85% / 0.5) 0%, hsl(220 15% 70% / 0.85) 100%)",
                  }}
                >
                  {/* Wave shimmer top */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-white/60 blur-sm" />
                </motion.div>

                {/* Floating coins/bars */}
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <div className="relative w-full h-full">
                    {items.map((it) => (
                      <motion.div
                        key={it.id}
                        initial={{ y: -200, opacity: 0, rotate: 0 }}
                        animate={{
                          y: it.y - 4,
                          opacity: 1,
                          rotate: it.rotate,
                          x: it.x,
                        }}
                        transition={{
                          delay: 0.5 + it.delay,
                          type: "spring",
                          stiffness: 80,
                          damping: 12,
                        }}
                        className="absolute left-1/2 bottom-2"
                        style={{ transform: `translateX(${it.x}px)` }}
                      >
                        <svg width="34" height="18" viewBox="0 0 34 18" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }}>
                          <defs>
                            <linearGradient id={`bar-${it.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              {isGold ? (
                                <>
                                  <stop offset="0%" stopColor="#FFF4C2" />
                                  <stop offset="35%" stopColor="#F4C849" />
                                  <stop offset="65%" stopColor="#B8841C" />
                                  <stop offset="100%" stopColor="#7A5410" />
                                </>
                              ) : (
                                <>
                                  <stop offset="0%" stopColor="#FAFBFC" />
                                  <stop offset="35%" stopColor="#D8DCE2" />
                                  <stop offset="65%" stopColor="#9098A4" />
                                  <stop offset="100%" stopColor="#5E6571" />
                                </>
                              )}
                            </linearGradient>
                            <linearGradient id={`bart-${it.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Bar body with bevel */}
                          <rect x="1" y="1.5" width="32" height="15" rx="1.5" fill={`url(#bar-${it.id})`} stroke={isGold ? "#6B4910" : "#4A515C"} strokeWidth="0.4" />
                          {/* Inset stamp frame */}
                          <rect x="3" y="3.5" width="28" height="11" rx="0.8" fill="none" stroke={isGold ? "#6B4910" : "#4A515C"} strokeWidth="0.3" opacity="0.5" />
                          {/* Top highlight */}
                          <rect x="2" y="2" width="30" height="3" rx="1" fill={`url(#bart-${it.id})`} />
                          {/* Stamp text */}
                          <text x="17" y="9" textAnchor="middle" fontSize="3.2" fontWeight="800" fill={isGold ? "#5C3D08" : "#2A2F38"} fontFamily="serif">MA</text>
                          <text x="17" y="12.8" textAnchor="middle" fontSize="2.2" fontWeight="700" fill={isGold ? "#6B4910" : "#3A4049"} letterSpacing="0.3">999.9</text>
                          {/* Side notches */}
                          <line x1="0.5" y1="6" x2="0.5" y2="12" stroke={isGold ? "#6B4910" : "#3A4049"} strokeWidth="0.6" />
                          <line x1="33.5" y1="6" x2="33.5" y2="12" stroke={isGold ? "#6B4910" : "#3A4049"} strokeWidth="0.6" />
                        </svg>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Glass highlight */}
                <div className="absolute top-0 left-2 w-2 h-full bg-white/20 rounded-full blur-[1px]" />
              </div>

              {/* Jar lid */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-5 rounded-xl border-2 border-white/50 bg-white/15 backdrop-blur-md flex items-center justify-center">
                <ShieldCheck size={11} className="text-white" />
              </div>

              {/* Progress label */}
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">
                <p className="text-[10px] font-bold text-white">{progress.toFixed(0)}%</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-white/85 text-[11px]">
              <span>Goal: {goalGrams}g</span>
              <span>₹{goalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </motion.div>

        {/* Performance card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 grid grid-cols-3 gap-2"
        >
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Invested</p>
            <p className="text-sm font-bold text-foreground mt-1">₹{investedAmount.toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center border-x border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current</p>
            <p className="text-sm font-bold text-foreground mt-1">₹{value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Returns</p>
            <p className={`text-sm font-bold mt-1 flex items-center justify-center gap-0.5 ${profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              <TrendingUp size={11} />
              {profitPct >= 0 ? "+" : ""}{profitPct.toFixed(1)}%
            </p>
          </div>
        </motion.div>

        {/* Action row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-2"
        >
          <button
            onClick={() => navigate(`/invest?metal=${isGold ? "gold" : "silver"}`)}
            className={`${accentGrad} rounded-2xl py-3 px-2 text-primary-foreground font-semibold text-xs flex flex-col items-center gap-1 active:scale-95 transition-transform`}
          >
            <Plus size={16} />
            Add {label}
          </button>
          <button
            onClick={() => navigate("/redeem")}
            className="glass-card border-2 border-primary/30 rounded-2xl py-3 px-2 text-foreground font-semibold text-xs flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <ArrowDownRight size={16} className="text-primary" />
            Sell
          </button>
          <button
            onClick={() => navigate("/gift")}
            className="glass-card border-2 border-primary/30 rounded-2xl py-3 px-2 text-foreground font-semibold text-xs flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <Gift size={16} className="text-primary" />
            Gift
          </button>
        </motion.div>

        {/* Live rate */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${accentGrad} flex items-center justify-center`}>
              <Sparkles size={16} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Live Rate</p>
              <p className="text-base font-bold text-foreground">₹{rate.toLocaleString("en-IN")}<span className="text-[11px] font-normal text-muted-foreground">/g</span></p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Updated</p>
            <p className="text-[11px] font-semibold text-foreground">
              {new Date(prices.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Award size={14} className="text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Milestones</p>
          </div>
          <div className="space-y-2.5">
            {[
              { g: isGold ? 1 : 50, label: "Starter" },
              { g: isGold ? 5 : 250, label: "Saver" },
              { g: isGold ? 10 : 500, label: "Achiever" },
              { g: isGold ? 25 : 1000, label: "Champion" },
            ].map((m) => {
              const reached = grams >= m.g;
              return (
                <div key={m.label} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${reached ? `${accentGrad} text-primary-foreground` : "bg-muted text-muted-foreground"}`}>
                    {reached ? "✓" : m.g}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground">{m.g}g {label}</p>
                  </div>
                  {reached && <span className="text-[10px] text-emerald-600 font-semibold">Unlocked</span>}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Recent Activity</p>
            </div>
            <button onClick={() => navigate("/transactions")} className="text-[11px] text-primary font-semibold">View all</button>
          </div>
          <div className="space-y-2">
            {recent.length === 0 ? (
              <p className="text-[11px] text-muted-foreground text-center py-3">
                No activity yet. Buy {label.toLowerCase()} to get started.
              </p>
            ) : (
              recent.map((t) => {
                const d = new Date(t.created_at);
                const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
                const when =
                  diffDays <= 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
                return (
                  <div key={t.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${accentGrad} flex items-center justify-center`}>
                        <Plus size={12} className="text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {t.type === "sip" ? "SIP" : "Buy"} {label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{when}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-foreground">+{t.grams.toFixed(isGold ? 4 : 2)}g</p>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LockerScreen;
