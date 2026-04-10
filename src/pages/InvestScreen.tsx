import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet, Trophy, Calendar, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMetalPrices } from "@/hooks/useMetalPrices";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

const GST_RATE = 0.03;

type Tab = "gold" | "silver" | "sip";

const InvestScreen = () => {
  const [tab, setTab] = useState<Tab>("gold");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();
  const prices = useMetalPrices();
  const { balance, deductForInvestment } = useWallet();

  const metal = tab === "sip" ? "silver" : tab;
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

  // SIP data
  const completed = 6;
  const total = 12;
  const progress = (completed / total) * 100;

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
            onClick={() => { setTab(key); if (key !== "sip") setAmount(""); }}
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
            {/* SIP Progress Card */}
            <motion.div className="glass-card p-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Silver Spree Progress</span>
                <span className="text-sm font-semibold text-primary">{completed}/{total} months</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full gold-gradient"
                />
              </div>
              <div className="flex justify-between mt-3">
                {Array.from({ length: total }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < completed ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
              </div>
            </motion.div>

            {/* SIP Details */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="glass-card p-4">
                <Calendar size={18} className="text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Next Due</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">15 Apr 2026</p>
              </div>
              <div className="glass-card p-4">
                <Sparkles size={18} className="text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Monthly</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">₹1,000</p>
              </div>
            </div>

            {/* Reward */}
            <div className="mt-4 glass-card p-5 border-primary/20 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                  <Trophy size={18} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Complete & Earn Reward!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Get 5g bonus silver on completing 12 months</p>
                </div>
              </div>
            </div>

            {/* Pay SIP CTA */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/sip")}
              className="w-full mt-8 py-4 rounded-2xl font-semibold text-lg gold-gradient text-primary-foreground animate-glow-pulse"
            >
              View Full SIP Details
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvestScreen;