import { motion } from "framer-motion";
import { TrendingUp, ArrowDownRight, Gift, Gem, CalendarCheck, Zap, RefreshCw, UserPlus, ShieldCheck, ChevronRight, Sparkles, CircleDollarSign, Landmark, AlertCircle } from "lucide-react";
import BannerCarousel from "@/components/BannerCarousel";
import { useMetalPrices } from "@/hooks/useMetalPrices";
import { usePriceFreshness } from "@/hooks/usePriceFreshness";
import { useAuth } from "@/contexts/AuthContext";
import { useKYC } from "@/hooks/useKYC";
import { useHoldings } from "@/hooks/useHoldings";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpg";

const quickSaveAmounts = [10, 50, 100, 500, 1000];

const Dashboard = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const prices = useMetalPrices();
  const freshness = usePriceFreshness(prices.updatedAt);
  const { user } = useAuth();
  const { isVerified: kycVerified, loading: kycLoading } = useKYC();
  const navigate = useNavigate();

  const gold24kRate = parseFloat(prices.gold24k) || 0;
  const silverRate = parseFloat(prices.silver) || 0;
  const { gold: goldGrams, silver: silverGrams } = useHoldings();
  const goldValue = goldGrams * gold24kRate;
  const silverValue = silverGrams * silverRate;
  const getLockerProgress = (grams: number, goalGrams: number) =>
    grams > 0 ? Math.min(100, (grams / goalGrams) * 100) : 0;
  const goldProgress = getLockerProgress(goldGrams, 10);
  const silverProgress = getLockerProgress(silverGrams, 500);

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
            {!kycLoading && (
              <button
                onClick={() => navigate("/kyc")}
                className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                  kycVerified
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                }`}
              >
                <ShieldCheck size={10} />
                {kycVerified ? "KYC Verified" : "Complete KYC →"}
              </button>
            )}
          </div>
        </div>
        <button onClick={() => navigate("/profile")} className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles size={18} className="text-primary" />
        </button>
      </motion.div>

      {/* Banner Carousel */}
      <motion.div variants={itemVariants}>
        <BannerCarousel />
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
          {(() => {
            const colors =
              freshness.level === "fresh"
                ? { bg: "bg-emerald-500/10", dot: "bg-emerald-500", ping: "bg-emerald-400", text: "text-emerald-600" }
                : freshness.level === "stale"
                ? { bg: "bg-amber-500/10", dot: "bg-amber-500", ping: "bg-amber-400", text: "text-amber-700" }
                : { bg: "bg-destructive/10", dot: "bg-destructive", ping: "bg-destructive", text: "text-destructive" };
            return (
              <div className={`flex items-center gap-1.5 ${colors.bg} px-2 py-0.5 rounded-full`} title={`Prices updated ${freshness.label}`}>
                {freshness.level === "expired" ? (
                  <AlertCircle size={10} className={colors.text} />
                ) : (
                  <span className="relative flex h-1.5 w-1.5">
                    {freshness.level === "fresh" && (
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.ping} opacity-75`} />
                    )}
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${colors.dot}`} />
                  </span>
                )}
                <span className={`text-[9px] font-semibold ${colors.text} uppercase`}>{freshness.label}</span>
              </div>
            );
          })()}
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
        <p className="text-[9px] text-muted-foreground text-center mt-2 opacity-70">
          Last updated: {new Date(prices.updatedAt).toLocaleString("en-IN")}
        </p>
      </motion.div>

      {/* Gold + Silver Lockers (side by side) */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {/* Gold Locker */}
        <button
          onClick={() => navigate("/locker/gold")}
          className="glass-card p-4 relative overflow-hidden text-left active:scale-[0.98] transition-transform"
        >
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary/5 -translate-y-6 translate-x-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg gold-gradient flex items-center justify-center">
                <Gem size={14} className="text-primary-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Gold Locker</p>
            </div>
            <p className="text-2xl font-display font-bold text-foreground mt-2">
              {goldGrams.toFixed(goldGrams < 1 ? 4 : 2)}<span className="text-sm text-muted-foreground ml-1">gm</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ≈ ₹{goldValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full gold-gradient"
                initial={false}
                animate={{ width: `${goldProgress}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </button>

        {/* Silver Locker */}
        <button
          onClick={() => navigate("/locker/silver")}
          className="glass-card p-4 relative overflow-hidden text-left active:scale-[0.98] transition-transform"
        >
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-muted/40 -translate-y-6 translate-x-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg silver-gradient flex items-center justify-center">
                <Landmark size={14} className="text-primary-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Silver Locker</p>
            </div>
            <p className="text-2xl font-display font-bold text-foreground mt-2">
              {silverGrams.toFixed(silverGrams < 1 ? 4 : 2)}<span className="text-sm text-muted-foreground ml-1">gm</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ≈ ₹{silverValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full silver-gradient"
                initial={false}
                animate={{ width: `${silverProgress}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </button>
      </motion.div>

      {/* Buy & Sell CTAs */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2">
        <button
          onClick={() => navigate("/invest?metal=gold")}
          className="gold-gradient gold-glow rounded-2xl py-3 px-2 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <Gem size={14} />
          Buy Gold
        </button>
        <button
          onClick={() => navigate("/invest?metal=silver")}
          className="silver-gradient rounded-2xl py-3 px-2 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <Landmark size={14} />
          Buy Silver
        </button>
        <button
          onClick={() => navigate("/redeem")}
          className="glass-card border-2 border-primary/30 rounded-2xl py-3 px-2 text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <ArrowDownRight size={14} className="text-primary" />
          Sell / Redeem
        </button>
      </motion.div>

      {/* Instant Save Chips */}
      <motion.div variants={itemVariants} className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Instant Save</p>
          <Zap size={14} className="text-primary" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickSaveAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => navigate(`/invest?metal=gold&amount=${amt}`)}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl border-2 border-primary/20 bg-primary/5 text-foreground font-semibold text-sm hover:border-primary/50 hover:bg-primary/10 active:scale-95 transition-all"
            >
              ₹{amt}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">Tap to save instantly in 24K Digital Gold</p>
      </motion.div>

      {/* Daily & Auto Savings */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CalendarCheck size={14} className="text-emerald-500" />
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
              <RefreshCw size={14} className="text-primary" />
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
            { icon: Sparkles, label: "Spins", desc: "Win gold daily", color: "bg-amber-500/10", iconColor: "text-amber-500", path: "/spin" },
            { icon: CalendarCheck, label: "Weekly Save", desc: "₹200/week", color: "bg-blue-500/10", iconColor: "text-blue-500", path: "/sip" },
            { icon: CircleDollarSign, label: "Monthly", desc: "₹1000/mo", color: "bg-violet-500/10", iconColor: "text-violet-500", path: "/sip" },
            { icon: UserPlus, label: "Refer & Earn", desc: "Get free gold", color: "bg-emerald-500/10", iconColor: "text-emerald-500", path: "/refer" },
            { icon: ShieldCheck, label: "Nominee", desc: "Add nominee", color: "bg-rose-500/10", iconColor: "text-rose-500", path: "/nominees" },
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
    </motion.div>
  );
};

export default Dashboard;
