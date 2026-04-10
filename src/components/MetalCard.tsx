import { motion } from "framer-motion";

interface MetalCardProps {
  type: "gold" | "silver";
  grams: string;
  value: string;
  delay?: number;
}

const MetalCard = ({ type, grams, value, delay = 0 }: MetalCardProps) => {
  const isGold = type === "gold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer ${
        isGold ? "gold-gradient gold-glow" : "silver-gradient"
      }`}
    >
      <div className="relative z-10">
        <p className={`text-xs font-semibold uppercase tracking-wider ${
          isGold ? "text-primary-foreground/70" : "text-primary-foreground/70"
        }`}>
          {isGold ? "Gold" : "Silver"}
        </p>
        <p className={`text-2xl font-display font-bold mt-1 ${
          isGold ? "text-primary-foreground" : "text-primary-foreground"
        }`}>
          {grams}g
        </p>
        <p className={`text-sm mt-0.5 ${
          isGold ? "text-primary-foreground/80" : "text-primary-foreground/80"
        }`}>
          ₹{value}
        </p>
      </div>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-20 ${
        isGold ? "bg-primary-foreground" : "bg-secondary-foreground"
      }`} />
    </motion.div>
  );
};

export default MetalCard;
