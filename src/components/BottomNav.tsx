import { Home, TrendingUp, Repeat, Wallet, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { icon: Home, label: "Home", path: "/" },
  { icon: TrendingUp, label: "Invest", path: "/invest" },
  { icon: Repeat, label: "SIP", path: "/sip" },
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const goToTab = (path: string) => {
    if (location.pathname !== path) navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40 px-1 pb-safe pointer-events-auto touch-manipulation">
      <div className="flex items-center justify-around py-1.5">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <motion.button
              type="button"
              key={tab.path}
              onClick={() => goToTab(tab.path)}
              onPointerUp={(event) => {
                if (event.pointerType !== "mouse") goToTab(tab.path);
              }}
              whileTap={{ scale: 0.85 }}
              className="relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all touch-manipulation select-none"
            >
              {active && (
                <motion.div
                  layoutId="nav-bg"
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-primary/10"
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
