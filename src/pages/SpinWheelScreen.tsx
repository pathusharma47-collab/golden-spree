import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Gift, X, RotateCcw, Zap, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";

const SEGMENTS = [
  { label: "0.001g\nGold", value: 0.001, color: "#E5A100", textColor: "#fff", type: "gold", icon: "🥇" },
  { label: "No\nLuck", value: 0, color: "#E8E4DC", textColor: "#888", type: "none", icon: "😐" },
  { label: "₹50\nCash", value: 50, color: "#D4950A", textColor: "#fff", type: "cash", icon: "💰" },
  { label: "0.005g\nSilver", value: 0.005, color: "#D6D1C8", textColor: "#666", type: "silver", icon: "🥈" },
  { label: "₹5\nCash", value: 5, color: "#F0D060", textColor: "#6B5A00", type: "cash", icon: "💵" },
  { label: "₹10\nCash", value: 10, color: "#E8E4DC", textColor: "#666", type: "cash", icon: "💸" },
  { label: "0.001g\nGold", value: 0.001, color: "#F5C842", textColor: "#5C4600", type: "gold", icon: "✨" },
  { label: "Try\nAgain", value: 0, color: "#D6D1C8", textColor: "#666", type: "retry", icon: "🔄" },
];

const SPIN_KEY_PREFIX = "spin_last_";
const REWARD_HISTORY_KEY = "spin_rewards_";
const LIGHT_COUNT = 24;

interface RewardEntry {
  label: string;
  icon: string;
  type: string;
  date: string;
}

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
  const [spinsLeft, setSpinsLeft] = useState(1);
  const [activeLights, setActiveLights] = useState(0);

  // Animated lights
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLights((prev) => (prev + 1) % LIGHT_COUNT);
    }, 150);
    return () => clearInterval(interval);
  }, []);

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

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 4;
    const segAngle = (2 * Math.PI) / SEGMENTS.length;

    ctx.clearRect(0, 0, size, size);

    SEGMENTS.forEach((seg, i) => {
      const start = i * segAngle - Math.PI / 2;
      const end = start + segAngle;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      // Divider lines
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(
        center + radius * Math.cos(start),
        center + radius * Math.sin(start)
      );
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Dashed inner circle decoration
      const dashR = radius * 0.88;
      ctx.beginPath();
      ctx.arc(center, center, dashR, start + 0.05, end - 0.05);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Icon
      const iconAngle = start + segAngle / 2;
      const iconR = radius * 0.72;
      const iconX = center + iconR * Math.cos(iconAngle);
      const iconY = center + iconR * Math.sin(iconAngle);
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(seg.icon, iconX, iconY);

      // Label text (multi-line)
      const textR = radius * 0.48;
      const textX = center + textR * Math.cos(iconAngle);
      const textY = center + textR * Math.sin(iconAngle);
      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(iconAngle + Math.PI / 2);
      ctx.fillStyle = seg.textColor;
      ctx.font = "bold 10px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = seg.label.split("\n");
      lines.forEach((line, li) => {
        ctx.fillText(line, 0, (li - (lines.length - 1) / 2) * 12);
      });
      ctx.restore();
    });

    // Center hub
    const hubGrad = ctx.createRadialGradient(center, center, 2, center, center, 28);
    hubGrad.addColorStop(0, "#FFF8E1");
    hubGrad.addColorStop(1, "#E5A100");
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hub icon
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText("✦", center, center);
  }, []);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const handleSpin = () => {
    if (spinning || (!canSpin && spinsLeft <= 0)) return;
    setSpinning(true);
    setShowResult(false);

    const weights = [15, 25, 2, 8, 20, 10, 15, 5];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let winIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { winIndex = i; break; }
    }

    const segAngle = 360 / SEGMENTS.length;
    const targetAngle = -(winIndex * segAngle + segAngle / 2);
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + spins * 360 + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      const won = SEGMENTS[winIndex];
      setResult(won);
      setShowResult(true);

      if (won.type === "retry") {
        setSpinsLeft((prev) => prev + 1);
      } else {
        setSpinsLeft((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            if (spinKey) localStorage.setItem(spinKey, new Date().toISOString());
            setCanSpin(false);
          }
          return next;
        });

        if (won.value > 0) {
          if (won.type === "cash") {
            addFunds(won.value);
          } else if (won.type === "gold") {
            addFunds(won.value * 7150);
          } else if (won.type === "silver") {
            addFunds(won.value * 90);
          }
        }
      }
    }, 4000);
  };

  const isSpinnable = (canSpin && spinsLeft > 0) || spinsLeft > 1;

  // Generate light positions around the wheel
  const lights = Array.from({ length: LIGHT_COUNT }, (_, i) => {
    const angle = (i / LIGHT_COUNT) * 2 * Math.PI - Math.PI / 2;
    const r = 160;
    return {
      x: 50 + (r * Math.cos(angle)) / 3.2,
      y: 50 + (r * Math.sin(angle)) / 3.2,
      active: i % 3 === activeLights % 3,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 pt-10 pb-28 max-w-lg mx-auto bg-background"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center border border-border/50">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Rewards</h1>
          <p className="text-xs text-muted-foreground">Spin the wheel daily!</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
          <Zap size={14} className="text-primary" />
          <span className="text-xs font-bold text-primary">{spinsLeft} spin{spinsLeft !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Wheel Container */}
      <div className="flex flex-col items-center">
        {/* Pointer */}
        <div className="relative z-20 mb-[-12px]">
          <svg width="28" height="32" viewBox="0 0 28 32" className="drop-shadow-lg">
            <polygon points="14,32 0,0 28,0" fill="hsl(0, 72%, 50%)" stroke="#fff" strokeWidth="2" />
          </svg>
        </div>

        {/* Wheel with lights ring */}
        <div className="relative" style={{ width: 320, height: 320 }}>
          {/* Golden outer ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(135deg, #E5A100 0%, #F5D060 30%, #C88E00 60%, #F5D060 100%)",
              padding: 10,
            }}
          >
            <div className="w-full h-full rounded-full bg-card" />
          </div>

          {/* Animated lights */}
          {lights.map((light, i) => (
            <div
              key={i}
              className="absolute rounded-full transition-all duration-200"
              style={{
                width: 8,
                height: 8,
                left: `${light.x}%`,
                top: `${light.y}%`,
                transform: "translate(-50%, -50%)",
                backgroundColor: light.active ? "#FFF8E1" : "#C88E00",
                boxShadow: light.active ? "0 0 8px 2px rgba(255,248,225,0.8)" : "none",
              }}
            />
          ))}

          {/* Spinning wheel */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
            className="absolute rounded-full overflow-hidden"
            style={{ top: 12, left: 12, right: 12, bottom: 12 }}
          >
            <canvas
              ref={canvasRef}
              width={296}
              height={296}
              className="w-full h-full rounded-full"
            />
          </motion.div>
        </div>

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={spinning || !isSpinnable}
          className={`mt-6 w-full max-w-xs py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 ${
            isSpinnable && !spinning
              ? "gold-gradient gold-glow text-primary-foreground shadow-lg"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {spinning ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <RotateCcw size={16} />
              </motion.span>
              Spinning...
            </span>
          ) : isSpinnable ? (
            "🎰 Spin Now!"
          ) : (
            `Come Back Tomorrow`
          )}
        </button>

        <p className="text-[11px] text-muted-foreground mt-2 text-center">
          {isSpinnable
            ? `You have ${spinsLeft} free spin${spinsLeft !== 1 ? "s" : ""} available`
            : timeLeft ? `Next spin in ${timeLeft}` : "You've reached your daily limit of 1 spin."}
        </p>
      </div>

      {/* How it works */}
      <div className="glass-card p-4 mt-6">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={16} className="text-primary" />
          <p className="text-xs font-semibold text-foreground">How it works</p>
        </div>
        <ul className="text-[11px] text-muted-foreground space-y-1">
          <li>• Spin the wheel once every day for free</li>
          <li>• Win digital gold, silver or cashback rewards</li>
          <li>• Land on <span className="text-primary font-semibold">Try Again</span> to get a bonus spin!</li>
          <li>• Rewards are added to your wallet instantly</li>
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

              {result.type === "retry" ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
                    <RotateCcw size={28} className="text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">🔄 Try Again!</h2>
                  <p className="text-sm text-primary font-semibold">You earned a bonus spin!</p>
                  <p className="text-xs text-muted-foreground mt-2">Close this and spin again — it's on us!</p>
                </>
              ) : result.value > 0 ? (
                <>
                  <div className="w-16 h-16 rounded-full gold-gradient gold-glow flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={28} className="text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">🎉 You Won!</h2>
                  <p className="text-lg font-semibold text-primary">{result.label.replace("\n", " ")}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {result.type === "gold" ? "Gold value added to your wallet!" :
                     result.type === "silver" ? "Silver value added to your wallet!" :
                     "Cashback added to your wallet!"}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Gift size={28} className="text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">No Luck 🍀</h2>
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
