import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronsRight, Loader2, LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SwipeToConfirmProps {
  label: string;
  loadingLabel?: string;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  variant?: "gold" | "silver" | "primary" | "destructive";
}

const variantClasses: Record<NonNullable<SwipeToConfirmProps["variant"]>, string> = {
  gold: "gold-gradient gold-glow",
  silver: "silver-gradient",
  primary: "bg-primary",
  destructive: "bg-destructive",
};

const SwipeToConfirm = ({
  label,
  loadingLabel,
  onConfirm,
  disabled,
  loading,
  icon: Icon = ChevronsRight,
  variant = "gold",
}: SwipeToConfirmProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(260);
  const KNOB = 48;

  useEffect(() => {
    const update = () => {
      const w = trackRef.current?.offsetWidth ?? 0;
      setMaxDrag(Math.max(0, w - KNOB - 4));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const labelOpacity = useTransform(x, [0, maxDrag * 0.6], [1, 0]);
  const fillWidth = useTransform(x, (v) => `${v + KNOB}px`);

  const handleDragEnd = () => {
    if (disabled || loading) {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
      return;
    }
    if (x.get() >= maxDrag * 0.85) {
      animate(x, maxDrag, { duration: 0.15, onComplete: () => {
        onConfirm();
        setTimeout(() => animate(x, 0, { type: "spring", stiffness: 300, damping: 28 }), 400);
      }});
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  const isDisabled = disabled || loading;

  return (
    <div
      ref={trackRef}
      className={`relative w-full h-14 rounded-2xl overflow-hidden select-none ${
        isDisabled ? "bg-muted" : "bg-muted/60"
      }`}
    >
      {/* Filled track behind knob */}
      {!isDisabled && (
        <motion.div
          style={{ width: fillWidth }}
          className={`absolute left-0 top-0 bottom-0 ${variantClasses[variant]} opacity-90`}
        />
      )}

      {/* Centered label */}
      <motion.div
        style={{ opacity: loading ? 1 : labelOpacity }}
        className={`absolute inset-0 flex items-center justify-center text-sm font-semibold pointer-events-none ${
          isDisabled ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            {loadingLabel ?? "Processing..."}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {label}
            <ChevronsRight size={16} className="opacity-60" />
          </span>
        )}
      </motion.div>

      {/* Draggable knob */}
      <motion.div
        drag={isDisabled ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.96 }}
        className={`absolute left-1 top-1 bottom-1 w-12 rounded-xl flex items-center justify-center z-10 ${
          isDisabled
            ? "bg-muted-foreground/20 cursor-not-allowed"
            : `${variantClasses[variant]} cursor-grab active:cursor-grabbing shadow-lg`
        }`}
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin text-primary-foreground" />
        ) : (
          <Icon size={20} className={isDisabled ? "text-muted-foreground" : "text-primary-foreground"} />
        )}
      </motion.div>
    </div>
  );
};

export default SwipeToConfirm;