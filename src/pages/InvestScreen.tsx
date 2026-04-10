import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet, ChevronRight, Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMetalPrices } from "@/hooks/useMetalPrices";
import { useWallet } from "@/contexts/WalletContext";
import { useSIP, SIP_PLANS, SIPPlan } from "@/contexts/SIPContext";
import { toast } from "sonner";

const GST_RATE = 0.03;

type Tab = "gold" | "silver" | "sip";

const InvestScreen = () => {
  const [tab, setTab] = useState<Tab>("gold");
  const [amount, setAmount] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<SIPPlan | null>(null);
  const navigate = useNavigate();
  const prices = useMetalPrices();
  const { balance, deductForInvestment } = useWallet();
  const { activeSIPs, enrollInSIP } = useSIP();

  const metal = tab === "sip" ? (selectedPlan?.metal || "gold") : tab;
  const rate = metal === "gold" ? parseFloat(prices.gold24k) : parseFloat(prices.silver);
  const numAmount = parseFloat(amount) || 0;
  const gst = numAmount * GST_RATE;
  const investable = numAmount - gst;
  const grams = investable > 0 ? (investable / rate).toFixed(4) : "0.0000";

  const handleInvest = () => {
    if (numAmount <= 0) { toast.error("Enter a valid amount"); return; }
    if (numAmount > balance) {
      toast.error("Insufficient wallet balance", { description: "Add funds to your wallet first" });
      return;
    }
    const ok = deductForInvestment(numAmount, metal, grams);
    if (ok) {
      toast.success(`Invested ₹${numAmount.toLocaleString("en-IN")} in ${metal}`, {
        description: `You received ${grams}g of ${metal}`,
      });
      setAmount("");
    }
  };

  const handleEnrollSIP = (plan: SIPPlan) => {
    const alreadyEnrolled = activeSIPs.some(s => s.planId === plan.id);
    if (alreadyEnrolled) {
      toast.error("Already enrolled", { description: `You're already enrolled in ${plan.name}` });
      return;
    }
    if (plan.monthlyAmount > balance) {
      toast.error("Insufficient balance", { description: `You need ₹${plan.monthlyAmount} to start this SIP` });
      return;
    }
    // Deduct first installment
    const sipGrams = ((plan.monthlyAmount - plan.monthlyAmount * GST_RATE) / (plan.metal === "gold" ? parseFloat(prices.gold24k) : parseFloat(prices.silver))).toFixed(4);
    const ok = deductForInvestment(plan.monthlyAmount, plan.metal, sipGrams);
    if (ok) {
      enrollInSIP(plan);
      // Update the just-enrolled SIP's first installment
      toast.success(`Enrolled in ${plan.name}!`, {
        description: `First installment of ₹${plan.monthlyAmount} paid. Check SIP tab for progress.`,
      });
      setSelectedPlan(null);
    }
  };

  const enrolledPlanIds = activeSIPs.map(s => s.planId);

  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate(-1)}
        className="text-muted-foreground mb-4"
      >
        <ArrowLeft size={22} />
      </motion.button>

      <h1 className="font-display text-2xl font-bold text-foreground">Invest</h1>
      <p className="text-sm text-muted-foreground mt-1">Buy digital gold, silver & SIP</p>

      {/* Wallet Balance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 glass-card px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-primary" />
          <span className="text-sm text-muted-foreground">Wallet Balance</span>
        </div>
        <span className="text-sm font-semibold text-foreground">₹{balance.toLocaleString("en-IN")}</span>
      </motion.div>

      {/* Toggle */}
      <div className="mt-4 glass-card p-1 flex rounded-xl">
        {([
          { key: "gold" as Tab, label: "Gold" },
          { key: "silver" as Tab, label: "Silver" },
          { key: "sip" as Tab, label: "SIP" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); if (key !== "sip") setAmount(""); setSelectedPlan(null); }}
            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
              tab === key
                ? key === "gold"
                  ? "gold-gradient text-primary-foreground gold-glow"
                  : key === "silver"
                  ? "silver-gradient text-primary-foreground"
                  : "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab !== "sip" ? (
          <motion.div
            key="invest"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Amount Input */}
            <div className="mt-4 glass-card p-6">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Enter Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                className="w-full mt-3 text-3xl font-display font-bold bg-transparent text-foreground outline-none placeholder:text-muted-foreground/30"
              />

              <AnimatePresence mode="wait">
                {numAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border/50"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You get</span>
                      <span className="text-foreground font-semibold">{grams}g {metal}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">GST (3%)</span>
                      <span className="text-muted-foreground">₹{gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="text-muted-foreground">₹{rate}/g</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 mt-4">
              {[500, 1000, 2000, 5000].map((a) => (
                <motion.button
                  key={a}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAmount(String(a))}
                  className="flex-1 py-2.5 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  ₹{a}
                </motion.button>
              ))}
            </div>

            {/* CTA */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleInvest}
              className={`w-full mt-8 py-4 rounded-2xl font-semibold text-lg transition-all ${
                numAmount > 0 && numAmount <= balance
                  ? "gold-gradient text-primary-foreground animate-glow-pulse"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Invest Now
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="sip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {!selectedPlan ? (
              <>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-5 mb-3">Choose a SIP Plan</p>
                <div className="space-y-3">
                  {SIP_PLANS.map((plan, i) => {
                    const enrolled = enrolledPlanIds.includes(plan.id);
                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => !enrolled && setSelectedPlan(plan)}
                        className={`glass-card p-4 cursor-pointer transition-all ${
                          enrolled
                            ? "opacity-60 cursor-default"
                            : "hover:border-primary/30 active:scale-[0.98]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              plan.metal === "gold" ? "gold-gradient" : "silver-gradient"
                            }`}>
                              <Sparkles size={18} className="text-primary-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{plan.description}</p>
                            </div>
                          </div>
                          {enrolled ? (
                            <div className="flex items-center gap-1 text-primary">
                              <Check size={14} />
                              <span className="text-[10px] font-semibold">Enrolled</span>
                            </div>
                          ) : (
                            <ChevronRight size={18} className="text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Monthly</p>
                            <p className="text-xs font-semibold text-foreground">₹{plan.monthlyAmount.toLocaleString("en-IN")}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Duration</p>
                            <p className="text-xs font-semibold text-foreground">{plan.duration} months</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Reward</p>
                            <p className="text-xs font-semibold text-primary">{plan.bonusReward}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {activeSIPs.length > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/sip")}
                    className="w-full mt-6 py-3 rounded-xl border border-primary/30 text-primary font-semibold text-sm"
                  >
                    View My SIPs ({activeSIPs.length})
                  </motion.button>
                )}
              </>
            ) : (
              <>
                {/* Selected Plan Detail */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-6 mt-4"
                >
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="text-xs text-muted-foreground mb-3 flex items-center gap-1"
                  >
                    <ArrowLeft size={12} /> Back to plans
                  </button>

                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedPlan.metal === "gold" ? "gold-gradient gold-glow" : "silver-gradient"
                    }`}>
                      <Sparkles size={22} className="text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-display font-bold text-foreground">{selectedPlan.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedPlan.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-5">
                    <div className="text-center p-3 bg-background/50 rounded-xl">
                      <p className="text-[10px] text-muted-foreground">Monthly</p>
                      <p className="text-sm font-bold text-foreground">₹{selectedPlan.monthlyAmount.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded-xl">
                      <p className="text-[10px] text-muted-foreground">Duration</p>
                      <p className="text-sm font-bold text-foreground">{selectedPlan.duration}mo</p>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded-xl">
                      <p className="text-[10px] text-muted-foreground">Total</p>
                      <p className="text-sm font-bold text-foreground">₹{(selectedPlan.monthlyAmount * selectedPlan.duration).toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl border border-primary/20 bg-primary/5">
                    <p className="text-xs text-primary font-semibold">🎁 Reward: {selectedPlan.bonusReward}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Complete all {selectedPlan.duration} months to earn your bonus</p>
                  </div>
                </motion.div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEnrollSIP(selectedPlan)}
                  className={`w-full mt-6 py-4 rounded-2xl font-semibold text-lg transition-all ${
                    selectedPlan.monthlyAmount <= balance
                      ? "gold-gradient text-primary-foreground animate-glow-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Start SIP — ₹{selectedPlan.monthlyAmount.toLocaleString("en-IN")}/mo
                </motion.button>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  First installment will be deducted now
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvestScreen;