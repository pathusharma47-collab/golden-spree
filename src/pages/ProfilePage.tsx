import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Shield, LogOut, ChevronRight, FileText, Lock, RefreshCcw, Truck, Coins, Receipt } from "lucide-react";
import { useHoldings } from "@/hooks/useHoldings";
import { formatINR, formatGrams } from "@/lib/format";

const ProfilePage = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { gold, silver, goldInvested, silverInvested } = useHoldings();
  const totalInvested = goldInvested + silverInvested;

  const handleLogout = async () => {
    // Lock-only logout: keeps the session so returning users land on the PIN
    // unlock screen instead of the email sign-in page.
    await logout();
  };

  return (
    <div className="min-h-screen pb-28 px-4 pt-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-display font-bold text-foreground mb-6">Profile</h1>
      </motion.div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 flex items-center gap-4 mb-6"
      >
        <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center">
          <User size={24} className="text-primary-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
            isAdmin ? "bg-primary/15 text-primary" : "bg-secondary text-secondary-foreground"
          }`}>
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>
      </motion.div>

      {/* Holdings Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <p className="text-xs font-medium text-muted-foreground px-1 mb-2">Your Holdings</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Coins size={14} className="text-primary" />
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Gold</p>
            </div>
            <p className="text-base font-display font-bold text-foreground">{formatGrams(gold)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Invested {formatINR(goldInvested)}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Coins size={14} className="text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Silver</p>
            </div>
            <p className="text-base font-display font-bold text-foreground">{formatGrams(silver)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Invested {formatINR(silverInvested)}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/transactions")}
          className="w-full glass-card p-3 mt-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Receipt size={16} className="text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">View all transactions</p>
            <p className="text-[11px] text-muted-foreground">Total invested {formatINR(totalInvested)}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      </motion.div>

      {/* Admin Options */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-xs font-medium text-muted-foreground px-1 mb-2">Admin Controls</p>
          <button
            onClick={() => navigate("/admin")}
            className="w-full glass-card p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield size={18} className="text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">Admin Dashboard</p>
              <p className="text-[10px] text-muted-foreground">Update prices & manage banners</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <p className="text-xs font-medium text-muted-foreground px-1 mb-2">Legal & Policies</p>
        {[
          { to: "/terms", icon: FileText, label: "Terms & Conditions" },
          { to: "/privacy", icon: Lock, label: "Privacy Policy" },
          { to: "/refund", icon: RefreshCcw, label: "Refund Policy" },
          { to: "/delivery", icon: Truck, label: "Delivery Policy" },
        ].map(({ to, icon: Icon, label }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="w-full glass-card p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon size={18} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground flex-1 text-left">{label}</p>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}

        <p className="text-xs font-medium text-muted-foreground px-1 mb-2 mt-4">Settings</p>
        <button
          onClick={handleLogout}
          className="w-full glass-card p-4 flex items-center gap-3 text-destructive active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut size={18} />
          </div>
          <p className="text-sm font-medium">Logout</p>
        </button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
