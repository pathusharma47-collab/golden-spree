import { motion } from "framer-motion";
import { TrendingUp, ArrowDownRight, DollarSign, Gift, Sparkles } from "lucide-react";
import MetalCard from "@/components/MetalCard";
import QuickAction from "@/components/QuickAction";

const Dashboard = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-muted-foreground text-sm">
          {greeting},
        </p>
        <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
          Arjun
        </h1>
      </motion.div>

      {/* Portfolio Value */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-6 glass-card p-6 text-center"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Portfolio</p>
        <p className="text-4xl font-display font-bold text-foreground mt-2">
          ₹24,580
        </p>
        <div className="flex items-center justify-center gap-1 mt-2 text-emerald-400 text-sm">
          <TrendingUp size={14} />
          <span>+2.4% today</span>
        </div>
      </motion.div>

      {/* Welcome Bonus */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-4 gold-gradient rounded-xl px-4 py-3 flex items-center gap-3"
      >
        <Sparkles size={18} className="text-primary-foreground" />
        <p className="text-sm font-semibold text-primary-foreground">
          ₹100 Welcome Bonus Applied 🎁
        </p>
      </motion.div>

      {/* Metal Cards */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <MetalCard type="gold" grams="2.45" value="15,230" delay={0.35} />
        <MetalCard type="silver" grams="120" value="9,350" delay={0.45} />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</p>
        <div className="flex justify-around">
          <QuickAction icon={TrendingUp} label="Invest" path="/invest" delay={0.5} />
          <QuickAction icon={ArrowDownRight} label="Redeem" path="/redeem" delay={0.55} />
          <QuickAction icon={DollarSign} label="SIP" path="/sip" delay={0.6} />
          <QuickAction icon={Gift} label="Gift" path="/gift" delay={0.65} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
