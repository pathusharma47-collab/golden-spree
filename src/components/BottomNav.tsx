import { Home, TrendingUp, Gift, Wallet, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Coins, label: "Gold", path: "/invest" },
  { icon: Trophy, label: "Rewards", path: "/gift" },
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40 px-1 pb-safe">
      <div className="flex items-center justify-around py-1.5">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <motion.button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              whileTap={{ scale: 0.85 }}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all"
            >
              {active && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-0 rounded-2xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <tab.icon
                size={20}
                strokeWidth={active ? 2.5 : 1.5}
                className={`relative z-10 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className={`relative z-10 text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
