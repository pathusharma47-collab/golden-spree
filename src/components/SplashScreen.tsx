import { motion } from "framer-motion";
import logo from "@/assets/logo.jpg";
import BrandWave from "./BrandWave";

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
        className="flex flex-col items-center -mt-16"
      >
        <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-[var(--shadow-gold)] bg-white">
          <img src={logo} alt="Maheshwari Alankar" className="w-full h-full object-contain" />
        </div>
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-5 font-display text-3xl font-bold text-foreground tracking-tight"
        >
          Maheshwari Alankar
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-2 text-sm text-muted-foreground"
        >
          Gold & Silver savings, simplified.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-32 flex items-center gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </motion.div>

      <BrandWave />
    </div>
  );
};

export default SplashScreen;