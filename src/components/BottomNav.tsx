import { Home, TrendingUp, Repeat, Gift, History } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { icon: Home, label: "Home", path: "/" },
  { icon: TrendingUp, label: "Invest", path: "/invest" },
  { icon: Repeat, label: "Redeem", path: "/redeem" },
  { icon: Gift, label: "Gift", path: "/gift" },
  { icon: History, label: "History", path: "/transactions" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-3xl rounded-b-none border-t border-border/30 px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <motion.button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 w-8 h-1 rounded-full gold-gradient"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <tab.icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
