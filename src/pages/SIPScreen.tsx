import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Calendar, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SIPScreen = () => {
  const navigate = useNavigate();
  const completed = 6;
  const total = 12;
  const progress = (completed / total) * 100;

  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="text-muted-foreground mb-4">
        <ArrowLeft size={22} />
      </motion.button>

      <h1 className="font-display text-2xl font-bold text-foreground">Silver Spree SIP</h1>
      <p className="text-sm text-muted-foreground mt-1">Your monthly savings plan</p>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-6 mt-6"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-semibold text-primary">{completed}/{total} months</span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            className="h-full rounded-full gold-gradient"
          />
        </div>

        {/* Milestones */}
        <div className="flex justify-between mt-3">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < completed ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4"
        >
          <Calendar size={18} className="text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Next Due</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">15 Apr 2026</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-4"
        >
          <Sparkles size={18} className="text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Monthly</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">₹1,000</p>
        </motion.div>
      </div>

      {/* Reward */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 glass-card p-5 border-primary/20 border"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
            <Trophy size={18} className="text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Complete & Earn Reward!</p>
            <p className="text-xs text-muted-foreground mt-0.5">Get 5g bonus silver on completing 12 months</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SIPScreen;
