import { motion } from "framer-motion";
import { ArrowLeft, Truck, Store, Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";

const options = [
  {
    icon: Truck,
    title: "Home Delivery",
    emoji: "🚚",
    desc: "Get gold coins & bars delivered to your doorstep",
  },
  {
    icon: Store,
    title: "Store Pickup",
    emoji: "🏬",
    desc: "Collect from a partner jeweller near you",
  },
  {
    icon: Banknote,
    title: "Sell",
    emoji: "💰",
    desc: "Convert your holdings to cash instantly",
  },
];

const RedeemScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="text-muted-foreground mb-4">
        <ArrowLeft size={22} />
      </motion.button>

      <h1 className="font-display text-2xl font-bold text-foreground">Redeem</h1>
      <p className="text-sm text-muted-foreground mt-1">Choose how to redeem your savings</p>

      <div className="mt-6 space-y-4">
        {options.map((opt, i) => (
          <motion.div
            key={opt.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="glass-card p-5 flex items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border/50 flex items-center justify-center text-primary shrink-0">
              <opt.icon size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {opt.title} {opt.emoji}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RedeemScreen;
