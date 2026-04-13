import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Share2, Gift, Users, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ReferScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate a referral code from user email
  const referralCode = user?.email
    ? `MA${user.email.slice(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`
    : "MAGOLD2026";

  const referralLink = `https://maheshwarialankar.com/invite/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Maheshwari Alankar - Save in Digital Gold!",
          text: `Use my referral code ${referralCode} and get free gold on signup!`,
          url: referralLink,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const rewards = [
    { step: "1", title: "Share your link", desc: "Send to friends & family" },
    { step: "2", title: "Friend signs up", desc: "They complete KYC" },
    { step: "3", title: "Both earn gold!", desc: "₹50 worth of free gold each" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 pt-12 pb-28 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center border border-border/50">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Refer & Earn</h1>
          <p className="text-xs text-muted-foreground">Earn free gold for every referral</p>
        </div>
        <Gift size={20} className="text-primary ml-auto" />
      </div>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 text-center mb-4"
      >
        <div className="w-16 h-16 rounded-2xl gold-gradient gold-glow flex items-center justify-center mx-auto mb-4">
          <Users size={28} className="text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">Get ₹50 Free Gold</h2>
        <p className="text-sm text-muted-foreground mt-2">For every friend who joins and completes KYC</p>
      </motion.div>

      {/* Referral Code */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 mb-4"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Your Referral Code</p>
        <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3 border border-border/50">
          <p className="flex-1 text-lg font-mono font-bold text-foreground tracking-widest">{referralCode}</p>
          <button
            onClick={handleCopy}
            className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} className="text-primary" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button onClick={handleCopy} variant="outline" className="rounded-xl gap-2">
            <Copy size={14} /> Copy Link
          </Button>
          <Button onClick={handleShare} className="gold-gradient gold-glow text-primary-foreground rounded-xl gap-2">
            <Share2 size={14} /> Share
          </Button>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 mb-4"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">How It Works</p>
        <div className="space-y-4">
          {rewards.map((r, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-foreground">{r.step}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-2"
      >
        {[
          { label: "Invited", value: "0" },
          { label: "Joined", value: "0" },
          { label: "Earned", value: "₹0" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <p className="text-lg font-display font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ReferScreen;
