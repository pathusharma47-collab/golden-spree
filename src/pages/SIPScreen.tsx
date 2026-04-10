import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Calendar, Sparkles, TrendingUp, Pause, Play, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSIP } from "@/contexts/SIPContext";
import { useWallet } from "@/contexts/WalletContext";
import { useMetalPrices } from "@/hooks/useMetalPrices";
import { toast } from "sonner";

const GST_RATE = 0.03;

const SIPScreen = () => {
  const navigate = useNavigate();
  const { activeSIPs, payInstallment, pauseSIP, resumeSIP, cancelSIP } = useSIP();
  const { balance, deductForInvestment } = useWallet();
  const prices = useMetalPrices();

  const handlePayInstallment = (sip: typeof activeSIPs[0]) => {
    if (sip.completedMonths >= sip.duration) {
      toast.info("SIP completed!", { description: "This SIP is already fully paid" });
      return;
    }
    if (sip.monthlyAmount > balance) {
      toast.error("Insufficient balance", { description: "Add funds to your wallet first" });
      return;
    }
    const rate = sip.metal === "gold" ? parseFloat(prices.gold24k) : parseFloat(prices.silver);
    const investable = sip.monthlyAmount - sip.monthlyAmount * GST_RATE;
    const grams = parseFloat((investable / rate).toFixed(4));

    const ok = deductForInvestment(sip.monthlyAmount, sip.metal, String(grams));
    if (ok) {
      payInstallment(sip.id, grams);
      toast.success(`Installment paid for ${sip.planName}`, {
        description: `₹${sip.monthlyAmount} deducted — ${grams}g ${sip.metal} added`,
      });
    }
  };

  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="text-muted-foreground mb-4">
        <ArrowLeft size={22} />
      </motion.button>

      <h1 className="font-display text-2xl font-bold text-foreground">My SIPs</h1>
      <p className="text-sm text-muted-foreground mt-1">Track your systematic investment plans</p>

      {activeSIPs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={28} className="text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold">No active SIPs</p>
          <p className="text-sm text-muted-foreground mt-1">Start a SIP from the Invest tab</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/invest")}
            className="mt-4 px-6 py-3 rounded-xl gold-gradient text-primary-foreground font-semibold text-sm"
          >
            Browse SIP Plans
          </motion.button>
        </motion.div>
      ) : (
        <div className="mt-6 space-y-4">
          {activeSIPs.map((sip, i) => {
            const progress = (sip.completedMonths / sip.duration) * 100;
            const isComplete = sip.completedMonths >= sip.duration || sip.status === "completed";
            const isPaused = sip.status === "paused";
            const isCancelled = sip.status === "cancelled";

            return (
              <motion.div
                key={sip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-5 ${isCancelled ? "opacity-60" : ""}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      sip.metal === "gold" ? "gold-gradient" : "silver-gradient"
                    }`}>
                      <Sparkles size={18} className="text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{sip.planName}</p>
                      <p className="text-[11px] text-muted-foreground">₹{sip.monthlyAmount.toLocaleString("en-IN")}/month</p>
                    </div>
                  </div>
                  {isComplete ? (
                    <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full">
                      <Trophy size={12} className="text-primary" />
                      <span className="text-[10px] font-semibold text-primary">Completed</span>
                    </div>
                  ) : isCancelled ? (
                    <div className="flex items-center gap-1 bg-destructive/10 px-2.5 py-1 rounded-full">
                      <XCircle size={12} className="text-destructive" />
                      <span className="text-[10px] font-semibold text-destructive">Cancelled</span>
                    </div>
                  ) : isPaused ? (
                    <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      <Pause size={12} className="text-amber-500" />
                      <span className="text-[10px] font-semibold text-amber-500">Paused</span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-primary">{sip.completedMonths}/{sip.duration}</span>
                  )}
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        isCancelled ? "bg-destructive/50" : isPaused ? "bg-amber-500/70" : sip.metal === "gold" ? "gold-gradient" : "silver-gradient"
                      }`}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    {Array.from({ length: sip.duration }, (_, j) => (
                      <div
                        key={j}
                        className={`w-1.5 h-1.5 rounded-full ${
                          j < sip.completedMonths ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Invested</p>
                    <p className="text-xs font-semibold text-foreground">₹{sip.totalInvested.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Accumulated</p>
                    <p className="text-xs font-semibold text-foreground">{sip.totalGrams.toFixed(4)}g</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Next Due</p>
                    <p className="text-xs font-semibold text-foreground">
                      {isComplete || isCancelled || isPaused ? "—" : new Date(sip.nextDueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>

                {/* Actions based on status */}
                {isComplete && (
                  <div className="mt-3 p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-2">
                    <Trophy size={16} className="text-primary" />
                    <p className="text-xs text-primary font-semibold">🎉 You earned {sip.bonusReward}!</p>
                  </div>
                )}

                {isCancelled && (
                  <div className="mt-3 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-[10px] text-destructive text-center">This SIP has been cancelled. Your accumulated {sip.totalGrams.toFixed(4)}g {sip.metal} is safe.</p>
                  </div>
                )}

                {isPaused && (
                  <>
                    <div className="mt-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <p className="text-[10px] text-amber-600 text-center">SIP is paused. Resume anytime to continue your plan.</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { resumeSIP(sip.id); toast.success(`${sip.planName} resumed!`); }}
                        className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5"
                      >
                        <Play size={14} /> Resume
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { cancelSIP(sip.id); toast.info(`${sip.planName} cancelled`); }}
                        className="py-3 px-4 rounded-xl border border-destructive/30 text-destructive font-semibold text-sm flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={14} /> Cancel
                      </motion.button>
                    </div>
                  </>
                )}

                {!isComplete && !isCancelled && !isPaused && (
                  <>
                    <div className="mt-3 p-2 rounded-lg bg-muted/50 flex items-center gap-2">
                      <Calendar size={12} className="text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground">Complete all {sip.duration} months to earn {sip.bonusReward}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePayInstallment(sip)}
                      className="w-full mt-3 py-3 rounded-xl gold-gradient text-primary-foreground font-semibold text-sm"
                    >
                      Pay Installment — ₹{sip.monthlyAmount.toLocaleString("en-IN")}
                    </motion.button>
                    <div className="flex gap-2 mt-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { pauseSIP(sip.id); toast.info(`${sip.planName} paused`); }}
                        className="flex-1 py-2 rounded-lg border border-amber-500/30 text-amber-500 text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Pause size={12} /> Pause
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { cancelSIP(sip.id); toast.info(`${sip.planName} cancelled`); }}
                        className="flex-1 py-2 rounded-lg border border-destructive/30 text-destructive text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <XCircle size={12} /> Cancel
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SIPScreen;