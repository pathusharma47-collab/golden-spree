import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Gift, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";

const SEGMENTS = [
  { label: "0.001g Gold", value: 0.001, color: "hsl(43, 72%, 48%)", textColor: "#fff" },
  { label: "₹5 Cashback", value: 5, color: "hsl(220, 15%, 93%)", textColor: "#333" },
  { label: "0.005g Gold", value: 0.005, color: "hsl(43, 80%, 60%)", textColor: "#fff" },
  { label: "Better Luck", value: 0, color: "hsl(220, 15%, 85%)", textColor: "#555" },
  { label: "₹10 Cashback", value: 10, color: "hsl(43, 72%, 48%)", textColor: "#fff" },
  { label: "0.002g Gold", value: 0.002, color: "hsl(220, 15%, 93%)", textColor: "#333" },
  { label: "₹2 Cashback", value: 2, color: "hsl(43, 65%, 35%)", textColor: "#fff" },
  { label: "Try Again", value: 0, color: "hsl(220, 15%, 85%)", textColor: "#555" },
];

const SPIN_KEY_PREFIX = "spin_last_";

const SpinWheelScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addFunds } = useWallet();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const spinKey = user ? `${SPIN_KEY_PREFIX}${user.email}` : "";
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<typeof SEGMENTS[0] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  // Check if user can spin today
  useEffect(() => {
    if (!spinKey) return;
    const checkSpin = () => {
      const last = localStorage.getItem(spinKey);
      if (!last) { setCanSpin(true); setTimeLeft(""); return; }
      const lastDate = new Date(last);
      const now = new Date();
      const nextSpin = new Date(lastDate);
      nextSpin.setHours(24, 0, 0, 0);
      if (now >= nextSpin) { setCanSpin(true); setTimeLeft(""); }
      else {
        setCanSpin(false);
        const diff = nextSpin.getTime() - now.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setTimeLeft(`${h}h ${m}m`);
      }
    };
    checkSpin();
    const interval = setInterval(checkSpin, 60000);
    return () => clearInterval(interval);
  }, [spinKey]);

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;
    const segAngle = (2 * Math.PI) / SEGMENTS.length;

    ctx.clearRect(0, 0, size, size);

    SEGMENTS.forEach((seg, i) => {
      const start = i * segAngle;
      const end = start + segAngle;

      // Segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(start + segAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = seg.textColor;
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillText(seg.label, radius - 16, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fillStyle = "hsl(43, 72%, 48%)";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px Inter";
    ctx.textAlign = "center";
    ctx.fillText("SPIN", center, center + 4);
  }, []);

  const handleSpin = () => {
    if (spinning || !canSpin) return;
    setSpinning(true);
    setShowResult(false);

    // Weighted random - higher chance for small rewards
    const weights = [15, 20, 5, 25, 3, 12, 15, 5];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let winIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { winIndex = i; break; }
    }

    const segAngle = 360 / SEGMENTS.length;
    // Calculate target: align winning segment to top (270° is top with pointer at top)
    const targetAngle = 360 - (winIndex * segAngle + segAngle / 2);
    const spins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const finalRotation = rotation + spins * 360 + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(SEGMENTS[winIndex]);
      setShowResult(true);

      // Save spin time
      if (spinKey) localStorage.setItem(spinKey, new Date().toISOString());
      setCanSpin(false);

      // Apply cashback reward
      if (SEGMENTS[winIndex].value > 0 && SEGMENTS[winIndex].label.includes("Cashback")) {
        addFunds(SEGMENTS[winIndex].value);
      }
    }, 4000);
  };

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
          <h1 className="font-display text-xl font-bold text-foreground">Daily Spin</h1>
          <p className="text-xs text-muted-foreground">Win gold & cashback rewards every day!</p>
        </div>
        <Sparkles size={20} className="text-primary ml-auto" />
      </div>

      {/* Spin Wheel */}
      <div className="glass-card p-6 flex flex-col items-center">
        {/* Pointer */}
        <div className="relative mb-2">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary mx-auto" />
        </div>

        {/* Wheel */}
        <div className="relative">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
            className="w-[280px] h-[280px]"
          >
            <canvas ref={canvasRef} width={280} height={280} className="w-full h-full" />
          </motion.div>
        </div>

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={spinning || !canSpin}
          className={`mt-6 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 ${
            canSpin && !spinning
              ? "gold-gradient gold-glow text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {spinning ? "Spinning..." : canSpin ? "🎰 Spin Now!" : `Next spin in ${timeLeft}`}
        </button>

        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          {canSpin ? "You have 1 free spin today" : "Come back tomorrow for another spin!"}
        </p>
      </div>

      {/* Reward History hint */}
      <div className="glass-card p-4 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={16} className="text-primary" />
          <p className="text-xs font-semibold text-foreground">How it works</p>
        </div>
        <ul className="text-[11px] text-muted-foreground space-y-1">
          <li>• Spin the wheel once every day for free</li>
          <li>• Win digital gold (added to your locker) or cashback</li>
          <li>• Cashback is added to your wallet instantly</li>
          <li>• The more days you spin, the bigger rewards you unlock!</li>
        </ul>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="glass-card p-8 max-w-sm w-full text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowResult(false)} className="absolute top-3 right-3 text-muted-foreground">
                <X size={18} />
              </button>
              {result.value > 0 ? (
                <>
                  <div className="w-16 h-16 rounded-full gold-gradient gold-glow flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={28} className="text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">🎉 You Won!</h2>
                  <p className="text-lg font-semibold text-primary">{result.label}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {result.label.includes("Gold")
                      ? "Gold has been added to your locker!"
                      : "Cashback added to your wallet!"}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Gift size={28} className="text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">{result.label} 🍀</h2>
                  <p className="text-xs text-muted-foreground mt-2">Come back tomorrow for another chance!</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SpinWheelScreen;
