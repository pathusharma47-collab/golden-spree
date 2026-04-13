import { motion } from "framer-motion";
import { TrendingUp, ArrowDownRight, Gift, Coins, Calendar, Zap, RotateCw, Users, UserCheck, ChevronRight, Sparkles } from "lucide-react";
import BannerCarousel from "@/components/BannerCarousel";
import { useMetalPrices } from "@/hooks/useMetalPrices";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpg";

const quickSaveAmounts = [10, 50, 100, 500, 1000];

const Dashboard = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const prices = useMetalPrices();
  const { user } = useAuth();
  const navigate = useNavigate();

  const gold24kRate = parseFloat(prices.gold24k) || 0;
  const silverRate = parseFloat(prices.silver) || 0;
  const goldGrams = 2.45;
  const silverGrams = 120;
  const totalValue = goldGrams * gold24kRate + silverGrams * silverRate;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 pt-12 pb-28 max-w-lg mx-auto space-y-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Maheshwari Alankar" className="w-10 h-10 rounded-xl object-contain bg-card shadow-sm border border-border/50" />
          <div>
            <p className="text-muted-foreground text-xs">{greeting},</p>
            <h1 className="font-display text-lg font-bold text-foreground">{user?.name || "Arjun"}</h1>
          </div>
        </div>
        <button onClick={() => navigate("/profile")} className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles size={18} className="text-primary" />
        </button>
      </motion.div>

      {/* Gold Locker Visual */}
      <motion.div variants={itemVariants} className="glass-card p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-primary/5 translate-y-6 -translate-x-6" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg gold-gradient flex items-center justify-center">
              <Coins size={14} className="text-primary-foreground" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Gold Locker</p>
          </div>
          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-4xl font-display font-bold text-foreground">{goldGrams}<span className="text-lg text-muted-foreground ml-1">gm</span></p>
              <p className="text-sm text-muted-foreground mt-1">≈ ₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-emerald-500 text-xs font-semibold">
                <TrendingUp size={12} />
                <span>+2.4%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">today</p>
            </div>
          </div>
          {/* Gold bar visual */}
          <div className="mt-4 flex gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i < 3 ? "gold-gradient" : "bg-muted"}`} />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">3 of 5 weekly savings completed</p>
        </div>
      </motion.div>

      {/* Buy & Withdraw CTAs */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/invest")}
          className="gold-gradient gold-glow rounded-2xl py-3.5 px-4 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <TrendingUp size={18} />
          Buy Gold
        </button>
        <button
          onClick={() => navigate("/redeem")}
          className="glass-card border-2 border-primary/30 rounded-2xl py-3.5 px-4 text-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <ArrowDownRight size={18} className="text-primary" />
          Withdraw
        </button>
      </motion.div>

      {/* Quick Save Chips */}
      <motion.div variants={itemVariants} className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Instant Save</p>
          <Zap size={14} className="text-primary" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickSaveAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => navigate("/invest")}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl border-2 border-primary/20 bg-primary/5 text-foreground font-semibold text-sm hover:border-primary/50 hover:bg-primary/10 active:scale-95 transition-all"
            >
              ₹{amt}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">Tap to save instantly in 24K Digital Gold</p>
      </motion.div>

      {/* Live Prices Compact */}
      <motion.div variants={itemVariants} className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <TrendingUp size={12} className="text-primary" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Live Rates</p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[9px] font-semibold text-emerald-500 uppercase">Live</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="gold-gradient gold-glow rounded-xl p-2.5 text-center">
            <p className="text-[9px] text-primary-foreground/70 font-semibold uppercase">Gold 24K</p>
            <p className="text-xs font-bold text-primary-foreground mt-0.5">₹{parseFloat(prices.gold24k).toLocaleString("en-IN")}<span className="text-[8px] font-normal">/g</span></p>
          </div>
          <div className="gold-gradient rounded-xl p-2.5 text-center opacity-90">
            <p className="text-[9px] text-primary-foreground/70 font-semibold uppercase">Gold 22K</p>
            <p className="text-xs font-bold text-primary-foreground mt-0.5">₹{parseFloat(prices.gold22k).toLocaleString("en-IN")}<span className="text-[8px] font-normal">/g</span></p>
          </div>
          <div className="silver-gradient rounded-xl p-2.5 text-center">
            <p className="text-[9px] text-primary-foreground/70 font-semibold uppercase">Silver</p>
            <p className="text-xs font-bold text-primary-foreground mt-0.5">₹{parseFloat(prices.silver).toLocaleString("en-IN")}<span className="text-[8px] font-normal">/g</span></p>
          </div>
        </div>
      </motion.div>

      {/* Banner Carousel */}
      <motion.div variants={itemVariants}>
        <BannerCarousel />
      </motion.div>

      {/* Daily & Auto Savings */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Calendar size={14} className="text-emerald-500" />
            </div>
            <p className="text-xs font-semibold text-foreground">Daily Save</p>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">₹50</p>
          <p className="text-[10px] text-muted-foreground mt-1">7 day streak 🔥</p>
          <div className="flex gap-0.5 mt-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < 5 ? "bg-emerald-500" : "bg-muted"}`} />
            ))}
          </div>
        </div>
        <div className="glass-card p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <RotateCw size={14} className="text-primary" />
            </div>
            <p className="text-xs font-semibold text-foreground">Auto Save</p>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">₹100</p>
          <p className="text-[10px] text-muted-foreground mt-1">Monthly SIP active</p>
          <button
            onClick={() => navigate("/sip")}
            className="mt-auto pt-2 text-[11px] text-primary font-semibold flex items-center gap-1"
          >
            Manage <ChevronRight size={12} />
          </button>
        </div>
      </motion.div>

      {/* Feature Grid - Spins, Weekly, Monthly, Refer, Nominee */}
      <motion.div variants={itemVariants}>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">More Features</p>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: RotateCw, label: "Spins", desc: "Win gold daily", color: "bg-amber-500/10", iconColor: "text-amber-500", path: "/spin" },
            { icon: Calendar, label: "Weekly Save", desc: "₹200/week", color: "bg-blue-500/10", iconColor: "text-blue-500", path: "/sip" },
            { icon: Coins, label: "Monthly", desc: "₹1000/mo", color: "bg-violet-500/10", iconColor: "text-violet-500", path: "/sip" },
            { icon: Users, label: "Refer & Earn", desc: "Get free gold", color: "bg-emerald-500/10", iconColor: "text-emerald-500", path: "/refer" },
            { icon: UserCheck, label: "Nominee", desc: "Add nominee", color: "bg-rose-500/10", iconColor: "text-rose-500", path: "/nominees" },
            { icon: Gift, label: "Gift Gold", desc: "Send to friends", color: "bg-primary/10", iconColor: "text-primary", path: "/gift" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => item.path ? navigate(item.path) : null}
              className="glass-card p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon size={18} className={item.iconColor} />
              </div>
              <p className="text-[11px] font-semibold text-foreground">{item.label}</p>
              <p className="text-[9px] text-muted-foreground">{item.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Swipe to Invest Banner */}
      <motion.div variants={itemVariants}>
        <SwipeToInvest />
      </motion.div>

      {/* Silver Holdings */}
      <motion.div variants={itemVariants} className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl silver-gradient flex items-center justify-center">
              <Coins size={18} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Silver Locker</p>
              <p className="text-lg font-display font-bold text-foreground">{silverGrams} gm</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">₹{(silverGrams * silverRate).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-muted-foreground">current value</p>
          </div>
        </div>
      </motion.div>

      {/* Updated timestamp */}
      <motion.div variants={itemVariants}>
        <p className="text-[9px] text-muted-foreground text-center opacity-50">
          Prices updated: {new Date(prices.updatedAt).toLocaleString("en-IN")}
        </p>
      </motion.div>
    </motion.div>
  );
};

/* Swipe to Invest component */
const SwipeToInvest = () => {
  const navigate = useNavigate();

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x > 120) {
      navigate("/invest");
    }
  };

  return (
    <div className="glass-card p-4 overflow-hidden">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Swipe to Invest</p>
      <div className="relative h-14 rounded-2xl bg-muted/50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-muted-foreground font-medium">Swipe right to buy gold →</p>
        </div>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 280 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.05 }}
          className="absolute left-1 top-1 bottom-1 w-12 rounded-xl gold-gradient gold-glow flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
        >
          <ChevronRight size={20} className="text-primary-foreground" />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
