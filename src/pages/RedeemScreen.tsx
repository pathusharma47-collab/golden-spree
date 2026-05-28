import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, Store, Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useHoldings } from "@/hooks/useHoldings";
import { useMetalPrices } from "@/hooks/useMetalPrices";
import { useWallet } from "@/contexts/WalletContext";

type RedeemType = "delivery" | "pickup" | "sell";

const options: { type: RedeemType; icon: typeof Truck; title: string; emoji: string; desc: string }[] = [
  { type: "delivery", icon: Truck, title: "Home Delivery", emoji: "🚚", desc: "Get gold coins & bars delivered to your doorstep" },
  { type: "pickup", icon: Store, title: "Store Pickup", emoji: "🏬", desc: "Collect from a partner jeweller near you" },
  { type: "sell", icon: Banknote, title: "Sell", emoji: "💰", desc: "Convert your holdings to cash instantly" },
];

const RedeemScreen = () => {
  const navigate = useNavigate();
  const { gold, silver, refresh: refreshHoldings } = useHoldings();
  const { refresh: refreshWallet } = useWallet();
  const prices = useMetalPrices();

  const [type, setType] = useState<RedeemType | null>(null);
  const [metal, setMetal] = useState<"gold" | "silver">("gold");
  const [grams, setGrams] = useState("");
  const [addr, setAddr] = useState({ line1: "", city: "", pincode: "" });
  const [busy, setBusy] = useState(false);

  const holding = metal === "gold" ? gold : silver;
  const rate = Number(metal === "gold" ? prices.gold22k : prices.silver) || 0;
  const numGrams = Number(grams) || 0;
  const amount = useMemo(() => +(numGrams * rate).toFixed(2), [numGrams, rate]);

  const reset = () => {
    setType(null);
    setGrams("");
    setAddr({ line1: "", city: "", pincode: "" });
  };

  const submit = async () => {
    if (!type) return;
    if (numGrams <= 0) return toast.error("Enter grams to redeem");
    if (numGrams > holding) return toast.error("Insufficient holdings");
    if (type !== "sell" && (!addr.line1 || !addr.city || !addr.pincode)) {
      return toast.error("Enter delivery / pickup address");
    }
    setBusy(true);
    const dbType = type === "delivery" ? "home_delivery" : type === "pickup" ? "store_pickup" : "sell_back";
    const { data, error } = await supabase.rpc("process_redemption", {
      _metal: metal,
      _grams: numGrams,
      _type: dbType,
      _address: type === "sell" ? null : addr,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Redemption failed");
      return;
    }
    const amt = (data as { amount?: number } | null)?.amount ?? amount;
    if (type === "sell") {
      toast.success(`Sold ${numGrams}g ${metal}`, { description: `₹${amt.toLocaleString("en-IN")} credited to wallet` });
    } else {
      toast.success("Redemption requested", { description: `${numGrams}g ${metal} · we'll be in touch` });
    }
    await Promise.all([refreshHoldings(), refreshWallet()]);
    reset();
  };

  if (!type) {
    return (
      <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/")} className="text-muted-foreground mb-4">
          <ArrowLeft size={22} />
        </motion.button>
        <h1 className="font-display text-2xl font-bold text-foreground">Redeem</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose how to redeem your savings</p>

        <div className="mt-6 space-y-4">
          {options.map((opt, i) => (
            <motion.button
              key={opt.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setType(opt.type)}
              className="glass-card p-5 flex items-start gap-4 cursor-pointer w-full text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border/50 flex items-center justify-center text-primary shrink-0">
                <opt.icon size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{opt.title} {opt.emoji}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const activeOpt = options.find((o) => o.type === type)!;

  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      <motion.button whileTap={{ scale: 0.9 }} onClick={reset} className="text-muted-foreground mb-4">
        <ArrowLeft size={22} />
      </motion.button>

      <h1 className="font-display text-2xl font-bold text-foreground">{activeOpt.title} {activeOpt.emoji}</h1>
      <p className="text-sm text-muted-foreground mt-1">{activeOpt.desc}</p>

      {/* Metal toggle */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        {(["gold", "silver"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMetal(m)}
            className={`glass-card p-3 text-center capitalize font-semibold ${metal === m ? "ring-2 ring-primary" : "opacity-70"}`}
          >
            {m}
            <div className="text-[11px] font-normal text-muted-foreground mt-0.5">
              Balance: {(m === "gold" ? gold : silver).toFixed(4)}g
            </div>
          </button>
        ))}
      </div>

      {/* Grams input */}
      <div className="glass-card p-4 mt-4">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">Grams to {type === "sell" ? "sell" : "redeem"}</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.0001"
          min="0"
          max={holding}
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
          placeholder="0.0000"
          className="w-full bg-transparent text-2xl font-bold text-foreground mt-1 focus:outline-none"
        />
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Rate: ₹{rate.toLocaleString("en-IN")}/g</span>
          <button onClick={() => setGrams(String(holding))} className="text-primary font-semibold">Max</button>
        </div>
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{type === "sell" ? "You receive" : "Value"}</span>
          <span className="text-lg font-bold text-foreground">₹{amount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Address for delivery/pickup */}
      {type !== "sell" && (
        <div className="glass-card p-4 mt-4 space-y-3">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">
            {type === "delivery" ? "Delivery Address" : "Preferred Store / City"}
          </label>
          <input
            value={addr.line1}
            onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
            placeholder={type === "delivery" ? "Address line" : "Store name or area"}
            className="w-full bg-surface-elevated border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={addr.city}
              onChange={(e) => setAddr({ ...addr, city: e.target.value })}
              placeholder="City"
              className="bg-surface-elevated border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              value={addr.pincode}
              onChange={(e) => setAddr({ ...addr, pincode: e.target.value })}
              placeholder="Pincode"
              className="bg-surface-elevated border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={busy || numGrams <= 0 || numGrams > holding}
        onClick={submit}
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold py-4 disabled:opacity-50"
      >
        {busy ? "Processing…" : type === "sell" ? `Sell & Credit ₹${amount.toLocaleString("en-IN")}` : "Confirm Redemption"}
      </motion.button>
    </div>
  );
};

export default RedeemScreen;
