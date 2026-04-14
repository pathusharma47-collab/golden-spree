import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Gift, X, RotateCcw, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";

const SEGMENTS = [
  { label: "0.001g Gold", value: 0.001, color: "hsl(43, 72%, 48%)", textColor: "#fff", type: "gold" },
  { label: "₹5 Cashback", value: 5, color: "hsl(220, 15%, 93%)", textColor: "#333", type: "cash" },
  { label: "0.005g Gold", value: 0.005, color: "hsl(43, 80%, 60%)", textColor: "#fff", type: "gold" },
  { label: "Better Luck", value: 0, color: "hsl(220, 15%, 85%)", textColor: "#555", type: "none" },
  { label: "₹10 Cashback", value: 10, color: "hsl(43, 72%, 48%)", textColor: "#fff", type: "cash" },
  { label: "0.002g Gold", value: 0.002, color: "hsl(220, 15%, 93%)", textColor: "#333", type: "gold" },
  { label: "₹2 Cashback", value: 2, color: "hsl(43, 65%, 35%)", textColor: "#fff", type: "cash" },
  { label: "Try Again", value: 0, color: "hsl(160, 60%, 45%)", textColor: "#fff", type: "retry" },
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
  const [spinsLeft, setSpinsLeft] = useState(1);

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
    const radius = center - 10;
    const segAngle = (2 * Math.PI) / SEGMENTS.length;

    ctx.clearRect(0, 0, size, size);

    // Outer ring shadow
    ctx.beginPath();
    ctx.arc(center, center, radius + 6, 0, 2 * Math.PI);
    ctx.fillStyle = "hsla(43, 72%, 48%, 0.15)";
    ctx.fill();

    SEGMENTS.forEach((seg, i) => {
      const start = i * segAngle;
      const end = start + segAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Icon dots on segment edges
      const dotAngle = start + segAngle / 2;
      const dotR = radius - 8;
      ctx.beginPath();
      ctx.arc(center + dotR * Math.cos(dotAngle), center + dotR * Math.sin(dotAngle), 2, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fill();

      // Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(start + segAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = seg.textColor;
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillText(seg.label, radius - 18, 4);
      ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "hsl(43, 72%, 48%)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center circle with gradient
    const gradient = ctx.createRadialGradient(center, center, 4, center, center, 28);
    gradient.addColorStop(0, "hsl(43, 80%, 60%)");
    gradient.addColorStop(1, "hsl(43, 72%, 42%)");
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px Inter";
    ctx.textAlign = "center";
    ctx.fillText("SPIN", center, center + 4);
  }, []);

  const handleSpin = () => {
    if (spinning || (!canSpin && spinsLeft <= 0)) return;
    setSpinning(true);
    setShowResult(false);

    const weights = [15, 20, 5, 25, 3, 12, 15, 5];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let winIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { winIndex = i; break; }
    }

    const segAngle = 360 / SEGMENTS.length;
    const targetAngle = 360 - (winIndex * segAngle + segAngle / 2);
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + spins * 360 + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      const won = SEGMENTS[winIndex];
      setResult(won);
      setShowResult(true);

      if (won.type === "retry") {
        // "Try Again" = grant a free bonus spin, don't save spin time
        setSpinsLeft((prev) => prev + 1);
      } else {
        // Consume a spin
        setSpinsLeft((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            // Save spin time only when all spins used
            if (spinKey) localStorage.setItem(spinKey, new Date().toISOString());
            setCanSpin(false);
          }
          return next;
        });

        // Apply reward
        if (won.value > 0) {
          if (won.type === "cash") {
            addFunds(won.value);
          } else if (won.type === "gold") {
            addFunds(won.value * 7150);
          }
        }
      }
    }, 4000);
  };

  const isSpinnable = (canSpin && spinsLeft > 0) || spinsLeft > 1;

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
        <div className="ml-auto flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
          <Zap size={14} className="text-primary" />
          <span className="text-xs font-bold text-primary">{spinsLeft} spin{spinsLeft !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Spin Wheel */}
      <div className="glass-card p-6 flex flex-col items-center relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Pointer */}
        <div className="relative mb-2 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-primary mx-auto drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <div className="relative z-10">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
            className="w-[290px] h-[290px]"
          >
            <canvas ref={canvasRef} width={290} height={290} className="w-full h-full" />
          </motion.div>
        </div>

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={spinning || !isSpinnable}
          className={`mt-6 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 relative overflow-hidden ${
            isSpinnable && !spinning
              ? "gold-gradient gold-glow text-primary-foreground"
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
            `🎰 Spin Now!`
          ) : (
            `Next spin in ${timeLeft}`
          )}
        </button>

        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          {isSpinnable
            ? `You have ${spinsLeft} free spin${spinsLeft !== 1 ? "s" : ""} available`
            : "Come back tomorrow for another spin!"}
        </p>
      </div>

      {/* How it works */}
      <div className="glass-card p-4 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={16} className="text-primary" />
          <p className="text-xs font-semibold text-foreground">How it works</p>
        </div>
        <ul className="text-[11px] text-muted-foreground space-y-1">
          <li>• Spin the wheel once every day for free</li>
          <li>• Win digital gold or cashback rewards</li>
          <li>• Land on <span className="text-emerald-500 font-semibold">Try Again</span> to get a bonus spin!</li>
          <li>• Cashback is added to your wallet instantly</li>
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
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <RotateCcw size={28} className="text-emerald-500" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">🔄 Try Again!</h2>
                  <p className="text-sm text-emerald-500 font-semibold">You earned a bonus spin!</p>
                  <p className="text-xs text-muted-foreground mt-2">Close this and spin again — it's on us!</p>
                </>
              ) : result.value > 0 ? (
                <>
                  <div className="w-16 h-16 rounded-full gold-gradient gold-glow flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={28} className="text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">🎉 You Won!</h2>
                  <p className="text-lg font-semibold text-primary">{result.label}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {result.type === "gold"
                      ? "Gold has been added to your locker!"
                      : "Cashback added to your wallet!"}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Gift size={28} className="text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">Better Luck! 🍀</h2>
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
