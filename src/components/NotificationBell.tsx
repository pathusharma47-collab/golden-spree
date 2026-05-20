import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

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
                      className="p-2.5 rounded-lg bg-background/60 border border-border/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground">{n.title}</p>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                          {new Date(n.created_at).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 break-words">
                        {n.body}
                      </p>
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