import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

const CATEGORY_META: Record<string, { label: string; cls: string }> = {
  investment:  { label: "Transaction", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  withdrawal:  { label: "Transaction", cls: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  razorpay:    { label: "Transaction", cls: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  wallet:      { label: "Transaction", cls: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  reward:      { label: "Reward",      cls: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  bonus:       { label: "Bonus",       cls: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  kyc:         { label: "KYC",         cls: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  redemption:  { label: "Redemption",  cls: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  sip:         { label: "SIP",         cls: "bg-teal-500/10 text-teal-600 border-teal-500/20" },
  gift:        { label: "Gift",        cls: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  signup:      { label: "New User",    cls: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  welcome:     { label: "Welcome",     cls: "bg-primary/10 text-primary border-primary/20" },
  admin:       { label: "Announcement",cls: "bg-primary/10 text-primary border-primary/20" },
};

function badgeFor(category: string | null) {
  const key = (category || "admin").toLowerCase();
  return CATEGORY_META[key] || { label: key.charAt(0).toUpperCase() + key.slice(1), cls: "bg-muted text-muted-foreground border-border" };
}

export default function NotificationBell({ className = "" }: { className?: string }) {
  const { items, unread, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) markAllRead();
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
      >
        <Bell size={16} className="text-foreground" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="absolute right-0 top-11 z-50 w-[320px] max-w-[90vw] glass-card p-3 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                {items.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-primary flex items-center gap-1"
                    >
                      <Check size={12} /> Mark all read
                    </button>
                  </div>
                )}
              </div>
              <div className="max-h-[60vh] overflow-y-auto space-y-1.5">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                   items.map((n) => (
                     <div
                       key={n.id}
                       className="p-3 rounded-lg bg-background/80 border border-border/60"
                     >
                       <div className="flex items-center justify-between gap-2 mb-1.5">
                         {(() => {
                           const b = badgeFor(n.category);
                           return (
                             <span className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${b.cls}`}>
                               {b.label}
                             </span>
                           );
                         })()}
                         <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                           {new Date(n.created_at).toLocaleString("en-IN", {
                             dateStyle: "short",
                             timeStyle: "short",
                           })}
                         </span>
                       </div>
                       <p className="text-sm font-semibold text-foreground leading-tight mb-1">
                         {n.title}
                       </p>
                       {n.body && (
                         <p className="text-xs text-foreground/80 break-words leading-relaxed whitespace-pre-wrap">
                           {n.body}
                         </p>
                       )}
                     </div>
                   ))
                )}
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/notifications");
                }}
                className="mt-2 w-full text-center text-xs text-primary font-medium py-2 rounded-lg hover:bg-muted transition-colors"
              >
                See all notifications →
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}