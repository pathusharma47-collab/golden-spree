import { motion } from "framer-motion";
import { TrendingUp, ArrowDownRight, DollarSign, Gift } from "lucide-react";
import MetalCard from "@/components/MetalCard";
import QuickAction from "@/components/QuickAction";
import BannerCarousel from "@/components/BannerCarousel";
import { useMetalPrices } from "@/hooks/useMetalPrices";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.jpg";

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
      {/* Header with Logo */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
        <img src={logo} alt="Maheshwari Alankar" className="w-11 h-11 rounded-xl object-contain bg-white shadow-sm" />
        <div>
          <p className="text-muted-foreground text-sm">{greeting},</p>
          <h1 className="font-display text-xl font-bold text-foreground mt-0.5">
            {user?.name || "Arjun"}
          </h1>
        </div>
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-primary" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Live Rates</p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-500 uppercase">Live</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-background/50 rounded-xl p-3 text-center border border-border/50">
            <div className="w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-1.5">
              <span className="text-[10px]">🥇</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">Gold 24K</p>
            <p className="text-sm font-bold text-foreground mt-0.5">₹{parseFloat(prices.gold24k).toLocaleString("en-IN")}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">/gram</p>
          </div>
          <div className="bg-background/50 rounded-xl p-3 text-center border border-border/50">
            <div className="w-6 h-6 rounded-full bg-amber-400/15 flex items-center justify-center mx-auto mb-1.5">
              <span className="text-[10px]">✨</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">Gold 22K</p>
            <p className="text-sm font-bold text-foreground mt-0.5">₹{parseFloat(prices.gold22k).toLocaleString("en-IN")}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">/gram</p>
          </div>
          <div className="bg-background/50 rounded-xl p-3 text-center border border-border/50">
            <div className="w-6 h-6 rounded-full bg-slate-300/15 flex items-center justify-center mx-auto mb-1.5">
              <span className="text-[10px]">🥈</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">Silver</p>
            <p className="text-sm font-bold text-foreground mt-0.5">₹{parseFloat(prices.silver).toLocaleString("en-IN")}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">/gram</p>
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground text-center mt-3 opacity-60">
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