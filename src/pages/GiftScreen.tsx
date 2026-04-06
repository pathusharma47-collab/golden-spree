import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Gift, Send, PartyPopper } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GiftScreen = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (name && phone && amount) setSent(true);
  };

  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="text-muted-foreground mb-4">
        <ArrowLeft size={22} />
      </motion.button>

      <h1 className="font-display text-2xl font-bold text-foreground">Send Gold as Gift 🎁</h1>
      <p className="text-sm text-muted-foreground mt-1">Spread joy with digital gold</p>

      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-4"
          >
            <div className="glass-card p-5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Recipient Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full mt-2 bg-surface-elevated rounded-xl px-4 py-3 text-foreground text-sm outline-none border border-border/50 focus:border-primary/50 transition-colors placeholder:text-muted-foreground/40"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full mt-2 bg-surface-elevated rounded-xl px-4 py-3 text-foreground text-sm outline-none border border-border/50 focus:border-primary/50 transition-colors placeholder:text-muted-foreground/40"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full mt-2 bg-surface-elevated rounded-xl px-4 py-3 text-foreground text-sm outline-none border border-border/50 focus:border-primary/50 transition-colors placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              className="w-full py-4 rounded-2xl font-semibold text-primary-foreground gold-gradient flex items-center justify-center gap-2 text-lg"
            >
              <Send size={18} /> Send Gift
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-16 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
              className="inline-block"
            >
              <PartyPopper size={64} className="text-primary mx-auto" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-foreground mt-6">Gift Sent! 🎉</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              ₹{amount} worth of gold has been sent to {name}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSent(false); setName(""); setPhone(""); setAmount(""); }}
              className="mt-6 px-8 py-3 rounded-xl border border-primary/30 text-primary text-sm font-medium"
            >
              Send Another
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftScreen;
