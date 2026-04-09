import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMetalPrices } from "@/hooks/useMetalPrices";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

const GST_RATE = 0.03;

const InvestScreen = () => {
  const [metal, setMetal] = useState<"gold" | "silver">("gold");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();
  const prices = useMetalPrices();
  const { balance, deductForInvestment } = useWallet();

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
      <p className="text-sm text-muted-foreground mt-1">Buy digital gold & silver</p>

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
        {(["gold", "silver"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMetal(m)}
            className={`flex-1 py-3 rounded-lg text-sm font-semibold capitalize transition-all ${
              metal === m
                ? m === "gold"
                  ? "gold-gradient text-primary-foreground gold-glow"
                  : "silver-gradient text-secondary-foreground"
                : "text-muted-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

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
    </div>
  );
};

export default InvestScreen;
