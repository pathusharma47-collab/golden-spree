import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, LogOut, Fingerprint, ScanFace } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  useBiometricAuth,
  isBiometricEnabled,
  setBiometricEnabled,
} from "@/hooks/useBiometricAuth";
import logo from "@/assets/logo.jpg";
import BrandWave from "./BrandWave";

const PIN_LENGTH = 4;
const pinKey = (uid: string) => `ma_pin_${uid}`;

export const hasPin = (uid: string) => !!localStorage.getItem(pinKey(uid));
export const setPin = (uid: string, pin: string) => localStorage.setItem(pinKey(uid), pin);
export const clearPin = (uid: string) => localStorage.removeItem(pinKey(uid));

type Mode = "unlock" | "set" | "confirm";

interface Props {
  mode: "unlock" | "create";
  onSuccess: () => void;
}

const PinLockScreen = ({ mode: initialMode, onSuccess }: Props) => {
  const { user, signOut } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode === "create" ? "set" : "unlock");
  const [pin, setPinValue] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [shake, setShake] = useState(false);
  const { isAvailable: bioAvailable, kind: bioKind, authenticate: bioAuth } = useBiometricAuth();
  const autoTriedRef = useRef(false);
  const bioEnabled = !!user && isBiometricEnabled(user.id);
  const BioIcon = bioKind === "face" ? ScanFace : Fingerprint;
  const bioLabel = bioKind === "face" ? "Face ID" : "Touch ID";

  const title =
    mode === "unlock" ? "Enter your PIN" : mode === "set" ? "Create a 4-digit PIN" : "Confirm your PIN";
  const subtitle =
    mode === "unlock"
      ? "Use your PIN to unlock the app"
      : mode === "set"
      ? "You'll use this to unlock the app"
      : "Re-enter the same PIN";

  const handleDigit = (d: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPinValue(next);
    if (next.length === PIN_LENGTH) setTimeout(() => evaluate(next), 120);
  };

  const handleDelete = () => setPinValue((p) => p.slice(0, -1));

  const evaluate = async (entered: string) => {
    if (!user) return;
    if (mode === "unlock") {
      const stored = localStorage.getItem(pinKey(user.id));
      if (stored === entered) {
        onSuccess();
      } else {
        triggerError("Incorrect PIN");
      }
    } else if (mode === "set") {
      setFirstPin(entered);
      setPinValue("");
      setMode("confirm");
    } else {
      if (entered === firstPin) {
        setPin(user.id, entered);
        toast({ title: "PIN set ✨", description: "You can now unlock the app with your PIN." });
        if (bioAvailable) {
          const ok = await bioAuth("Enable biometric unlock");
          if (ok) {
            setBiometricEnabled(user.id, true);
            toast({ title: `${bioLabel} enabled`, description: "You can now unlock with biometrics." });
          }
        }
        onSuccess();
      } else {
        triggerError("PINs don't match");
        setMode("set");
        setFirstPin("");
      }
    }
  };

  const triggerError = (msg: string) => {
    setShake(true);
    toast({ title: msg, variant: "destructive" });
    setTimeout(() => {
      setPinValue("");
      setShake(false);
    }, 350);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) handleDigit(e.key);
      else if (e.key === "Backspace") handleDelete();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, mode, firstPin]);

  // Auto-prompt biometrics when arriving on the unlock screen
  useEffect(() => {
    if (autoTriedRef.current) return;
    if (mode !== "unlock" || !user || !bioAvailable || !bioEnabled) return;
    autoTriedRef.current = true;
    (async () => {
      const ok = await bioAuth("Unlock Maheshwari Alankar");
      if (ok) onSuccess();
    })();
  }, [mode, user, bioAvailable, bioEnabled, bioAuth, onSuccess]);

  const tryBiometric = async () => {
    if (!user || !bioAvailable) {
      toast({ title: "Biometrics not available on this device" });
      return;
    }
    if (mode !== "unlock") return;
    if (!bioEnabled) {
      toast({
        title: "Enable biometrics first",
        description: "Unlock with your PIN once, then we'll offer to enable biometrics.",
      });
      return;
    }
    const ok = await bioAuth("Unlock Maheshwari Alankar");
    if (ok) onSuccess();
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white shadow-sm">
            <img src={logo} alt="Maheshwari Alankar" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-base text-foreground">Maheshwari</span>
        </div>
        <span className="text-sm font-semibold text-foreground">
          {mode === "unlock" ? "Sign In" : "Set PIN"}
        </span>
        <button
          onClick={signOut}
          className="text-xs text-muted-foreground active:scale-95 flex items-center gap-1"
          aria-label="Switch account"
        >
          <LogOut size={14} />
          Switch
        </button>
      </header>

      {/* User */}
      <div className="flex flex-col items-center mt-2 relative z-10">
        <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-display text-2xl font-bold shadow-[var(--shadow-gold)]">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <p className="mt-2 text-sm font-semibold text-foreground">{user?.name || "User"}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>

        {/* Dots */}
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3 mt-5"
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => {
            const filled = i < pin.length;
            return (
              <motion.span
                key={i}
                animate={{ scale: filled ? 1.1 : 1 }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  filled ? "bg-primary shadow-[var(--shadow-gold)]" : "bg-muted"
                }`}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Numpad card */}
      <div className="mt-6 mx-5 flex-1 flex items-end pb-40 relative z-10">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="w-full glass-card p-4 grid grid-cols-3 gap-2"
        >
          {keys.map((k, idx) => {
            if (k === "") {
              const showBio = mode === "unlock" && bioAvailable && bioEnabled;
              return (
                <button
                  key={idx}
                  aria-label={showBio ? `Unlock with ${bioLabel}` : "Biometric unlock"}
                  className={`h-14 rounded-xl flex items-center justify-center active:scale-95 transition-colors ${
                    showBio ? "text-primary hover:bg-muted/40" : "text-muted-foreground"
                  }`}
                  onClick={tryBiometric}
                >
                  <BioIcon size={22} />
                </button>
              );
            }
            if (k === "del") {
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="h-14 rounded-xl bg-muted/60 flex items-center justify-center text-foreground"
                  aria-label="Delete"
                >
                  <Delete size={20} />
                </motion.button>
              );
            }
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleDigit(k)}
                className="h-14 rounded-xl bg-card border border-border font-display text-2xl font-semibold text-foreground hover:bg-muted/50 transition-colors"
              >
                {k}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <BrandWave />
    </div>
  );
};

export default PinLockScreen;