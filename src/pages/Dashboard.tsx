import { motion } from "framer-motion";
import { TrendingUp, ArrowDownRight, DollarSign, Gift } from "lucide-react";
import MetalCard from "@/components/MetalCard";
import QuickAction from "@/components/QuickAction";
import BannerCarousel from "@/components/BannerCarousel";
import { useMetalPrices } from "@/hooks/useMetalPrices";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const prices = useMetalPrices();
  const { user } = useAuth();

  const gold24kRate = parseFloat(prices.gold24k) || 0;
  const silverRate = parseFloat(prices.silver) || 0;
  const goldGrams = 2.45;
  const silverGrams = 120;
  const goldValue = (goldGrams * gold24kRate).toLocaleString("en-IN");
  const silverValue = (silverGrams * silverRate).toLocaleString("en-IN");
  const totalPortfolio = (goldGrams * gold24kRate + silverGrams * silverRate).toLocaleString("en-IN");

  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-muted-foreground text-sm">{greeting},</p>
        <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
          {user?.name || "Arjun"}
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
        <p className="text-4xl font-display font-bold text-foreground mt-2">₹{totalPortfolio}</p>
        <div className="flex items-center justify-center gap-1 mt-2 text-emerald-400 text-sm">
          <TrendingUp size={14} />
          <span>+2.4% today</span>
        </div>
      </motion.div>

      {/* Live Prices */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-4 glass-card p-4"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Live Rates (per gram)</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Gold 24K</p>
            <p className="text-sm font-bold text-foreground">₹{parseFloat(prices.gold24k).toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Gold 22K</p>
            <p className="text-sm font-bold text-foreground">₹{parseFloat(prices.gold22k).toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Silver</p>
            <p className="text-sm font-bold text-foreground">₹{parseFloat(prices.silver).toLocaleString("en-IN")}</p>
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground text-center mt-2">
          Updated: {new Date(prices.updatedAt).toLocaleString("en-IN")}
        </p>
      </motion.div>

      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Metal Cards */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <MetalCard type="gold" grams={String(goldGrams)} value={goldValue} delay={0.35} />
        <MetalCard type="silver" grams={String(silverGrams)} value={silverValue} delay={0.45} />
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