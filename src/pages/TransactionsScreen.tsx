import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Repeat, Sparkles, Coins, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR, formatGrams, formatRelative } from "@/lib/format";

type Tx = {
  id: string;
  source: "wallet" | "invest";
  type: "credit" | "debit";
  label: string;
  sub: string;
  amount: number;
  date: string;
  icon: typeof ArrowUpRight;
};

const TransactionsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const [w, i] = await Promise.all([
        supabase.from("wallet_transactions")
          .select("id, type, amount, description, category, created_at")
          .eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
        supabase.from("investment_transactions")
          .select("id, type, metal, grams, amount_inr, created_at")
          .eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      ]);
      const wTx: Tx[] = (w.data ?? []).map((t) => ({
        id: `w-${t.id}`,
        source: "wallet",
        type: t.type as "credit" | "debit",
        label: t.description,
        sub: t.category || (t.type === "credit" ? "Wallet credit" : "Wallet debit"),
        amount: Number(t.amount),
        date: t.created_at,
        icon: t.category === "bonus" ? Sparkles : t.type === "credit" ? ArrowDownLeft : ArrowUpRight,
      }));
      const iTx: Tx[] = (i.data ?? []).map((t) => ({
        id: `i-${t.id}`,
        source: "invest",
        type: "debit",
        label: `${t.type === "sip" ? "SIP" : "Buy"} ${t.metal === "gold" ? "Gold" : "Silver"}`,
        sub: t.grams ? `${formatGrams(Number(t.grams))} ${t.metal}` : "",
        amount: Number(t.amount_inr ?? 0),
        date: t.created_at,
        icon: t.type === "sip" ? Repeat : Coins,
      }));
      const merged = [...wTx, ...iTx].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setItems(merged);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="text-muted-foreground mb-4">
        <ArrowLeft size={22} />
      </motion.button>

      <h1 className="font-display text-2xl font-bold text-foreground">Transactions</h1>
      <p className="text-sm text-muted-foreground mt-1">Your activity history</p>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 size={22} className="animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 text-center text-sm text-muted-foreground">No transactions yet.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((tx, i) => {
            const color = tx.type === "credit" ? "text-emerald-500" : "text-red-500";
            const sign = tx.type === "credit" ? "+" : "-";
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 10) * 0.04, duration: 0.3 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center shrink-0 ${color}`}>
                  <tx.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{tx.sub}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${color}`}>{sign}{formatINR(tx.amount)}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(tx.date)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionsScreen;
