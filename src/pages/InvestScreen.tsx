import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMetalPrices } from "@/hooks/useMetalPrices";

const GST_RATE = 0.03;

const InvestScreen = () => {
  const [metal, setMetal] = useState<"gold" | "silver">("gold");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();
  const prices = useMetalPrices();

  const rate = metal === "gold" ? parseFloat(prices.gold24k) : parseFloat(prices.silver);
  const numAmount = parseFloat(amount) || 0;
  const gst = numAmount * GST_RATE;
  const investable = numAmount - gst;
  const grams = investable > 0 ? (investable / rate).toFixed(4) : "0.0000";

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

      {/* Toggle */}
      <div className="mt-6 glass-card p-1 flex rounded-xl">
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
      <div className="mt-6 glass-card p-6">
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
        className="w-full mt-8 py-4 rounded-2xl font-semibold text-primary-foreground gold-gradient animate-glow-pulse text-lg"
      >
        Invest Now
      </motion.button>
    </div>
  );
};

export default InvestScreen;
