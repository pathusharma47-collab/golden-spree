import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  path: string;
  delay?: number;
}

const QuickAction = ({ icon: Icon, label, path, delay = 0 }: QuickActionProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => navigate(path)}
      className="flex flex-col items-center gap-2"
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border/50 flex items-center justify-center text-primary transition-shadow hover:shadow-[0_0_20px_hsl(43_72%_52%/0.2)]">
        <Icon size={22} />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </motion.button>
  );
};

export default QuickAction;
