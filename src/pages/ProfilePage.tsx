import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Shield, LogOut, Settings, ChevronRight } from "lucide-react";

const ProfilePage = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

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
        <p className="text-xs font-medium text-muted-foreground px-1 mb-2">Settings</p>
        <button
          onClick={() => { logout(); navigate("/login"); }}
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
