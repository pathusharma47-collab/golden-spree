import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Gift, Repeat, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const transactions = [
  { id: 1, type: "credit", icon: ArrowDownLeft, label: "Gold Purchase", amount: "+₹2,000", sub: "0.32g gold", date: "Today", color: "text-emerald-400" },
  { id: 2, type: "credit", icon: Sparkles, label: "Welcome Bonus", amount: "+₹100", sub: "Bonus credit", date: "Today", color: "text-emerald-400" },
  { id: 3, type: "debit", icon: ArrowUpRight, label: "Sold Silver", amount: "-₹500", sub: "6.4g silver", date: "Yesterday", color: "text-red-400" },
  { id: 4, type: "credit", icon: Repeat, label: "SIP Investment", amount: "+₹1,000", sub: "Auto-debit", date: "3 Apr", color: "text-emerald-400" },
  { id: 5, type: "debit", icon: Gift, label: "Gift Sent", amount: "-₹1,500", sub: "To Priya", date: "1 Apr", color: "text-red-400" },
  { id: 6, type: "credit", icon: ArrowDownLeft, label: "Silver Purchase", amount: "+₹3,000", sub: "38.5g silver", date: "28 Mar", color: "text-emerald-400" },
];

const TransactionsScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="text-muted-foreground mb-4">
        <ArrowLeft size={22} />
      </motion.button>

      <h1 className="font-display text-2xl font-bold text-foreground">Transactions</h1>
      <p className="text-sm text-muted-foreground mt-1">Your activity history</p>

      <div className="mt-6 space-y-3">
        {transactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center shrink-0 ${tx.color}`}>
              <tx.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{tx.label}</p>
              <p className="text-xs text-muted-foreground">{tx.sub}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${tx.color}`}>{tx.amount}</p>
              <p className="text-xs text-muted-foreground">{tx.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsScreen;
