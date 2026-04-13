import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/contexts/WalletContext";
import { ArrowLeft, Plus, ArrowDownToLine, Wallet, ArrowUpRight, ArrowDownLeft, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useKYC } from "@/hooks/useKYC";
import { Button } from "@/components/ui/button";

const WalletPage = () => {
  const { balance, transactions, addFunds, withdraw, isNewUser } = useWallet();
  const navigate = useNavigate();
  const { isVerified, loading: kycLoading } = useKYC();
  const [mode, setMode] = useState<"add" | "withdraw" | null>(null);
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { toast.error("Enter a valid amount"); return; }

    if (mode === "add") {
      addFunds(num);
      toast.success(`₹${num.toLocaleString("en-IN")} added to wallet`);
    } else if (mode === "withdraw") {
      const ok = withdraw(num);
      if (!ok) { toast.error("Insufficient balance"); return; }
      toast.success(`₹${num.toLocaleString("en-IN")} withdrawn`);
    }
    setAmount("");
    setMode(null);
  };


  const handleWithdrawClick = () => {
    if (!isVerified) {
      toast.error("Complete KYC to withdraw funds");
      navigate("/kyc");
      return;
    }
    setMode(mode === "withdraw" ? null : "withdraw");
  };

  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="text-muted-foreground mb-4">
        <ArrowLeft size={22} />
      </motion.button>

      <h1 className="font-display text-2xl font-bold text-foreground">Wallet</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage your funds</p>

      {/* Welcome Bonus Banner */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="mt-4 gold-gradient rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <Sparkles size={18} className="text-primary-foreground" />
          <p className="text-sm font-semibold text-primary-foreground">
            ₹100 Welcome Bonus Added! 🎁
          </p>
        </motion.div>
      )}

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 glass-card p-6 text-center"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl gold-gradient flex items-center justify-center gold-glow mb-3">
          <Wallet size={24} className="text-primary-foreground" />
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Available Balance</p>
        <p className="text-4xl font-display font-bold text-foreground mt-1">
          ₹{balance.toLocaleString("en-IN")}
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 mt-4"
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode(mode === "add" ? null : "add")}
          className={`py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            mode === "add"
              ? "gold-gradient text-primary-foreground gold-glow"
              : "glass-card text-foreground"
          }`}
        >
          <Plus size={18} /> Add Funds
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleWithdrawClick}
          className={`py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            mode === "withdraw"
              ? "bg-destructive text-destructive-foreground"
              : "glass-card text-foreground"
          }`}
        >
          <ArrowDownToLine size={18} /> Withdraw
        </motion.button>
      </motion.div>

      {/* Amount Input Panel */}
      <AnimatePresence>
        {mode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 mt-4 space-y-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                {mode === "add" ? "Amount to Add (₹)" : "Amount to Withdraw (₹)"}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full text-2xl font-display font-bold bg-transparent text-foreground outline-none placeholder:text-muted-foreground/30"
                autoFocus
              />
              <div className="flex gap-2">
                {[500, 1000, 2000, 5000].map((a) => (
                  <motion.button
                    key={a}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setAmount(String(a))}
                    className="flex-1 py-2 rounded-lg border border-border/50 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    ₹{a}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className={`w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                  mode === "add"
                    ? "gold-gradient text-primary-foreground gold-glow"
                    : "bg-destructive text-destructive-foreground"
                }`}
              >
                {mode === "add" ? "Add Funds" : "Withdraw"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction History */}
      <div className="mt-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Wallet History</p>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No transactions yet. Add funds to get started ✨
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-4 flex items-center gap-3"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  tx.type === "credit" ? "bg-emerald-500/10" : "bg-destructive/10"
                }`}>
                  {tx.type === "credit"
                    ? <ArrowDownLeft size={16} className="text-emerald-500" />
                    : <ArrowUpRight size={16} className="text-destructive" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${tx.type === "credit" ? "text-emerald-500" : "text-destructive"}`}>
                  {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;