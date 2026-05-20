import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, Check, CheckCheck, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, loading, unread, markAllRead, refresh } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const isRead = (n: any) => n.read_by?.includes(user?.id || "");
  const visible = items.filter((n) => (filter === "unread" ? !isRead(n) : true));

  const markOne = async (id: string) => {
    const n = items.find((x) => x.id === id);
    if (!n || !user || isRead(n)) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read_by: [...(n.read_by || []), user.id] })
      .eq("id", id);
    if (error) toast.error("Failed to mark as read");
    else refresh();
  };

  return (
    <div className="min-h-screen pb-28 px-4 pt-6 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-card border border-border"
            aria-label="Back"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
              <Bell size={18} className="text-primary" /> Notifications
            </h1>
            <p className="text-xs text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-[11px] text-primary font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/30"
          >
            <CheckCheck size={12} /> Mark all read
          </button>
        )}
      </motion.div>

      <div className="flex gap-2 mb-4">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 h-10 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === f
                ? "gold-gradient text-primary-foreground gold-glow"
                : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {f === "unread" && unread > 0 ? `Unread (${unread})` : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-muted-foreground">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-muted-foreground">
          <Inbox size={36} className="opacity-50" />
          <p className="text-sm">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {visible.map((n) => {
              const read = isRead(n);
              return (
                <motion.button
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => markOne(n.id)}
                  className={`w-full text-left glass-card p-3.5 flex items-start gap-3 transition-all ${
                    read ? "opacity-70" : ""
                  }`}
                >
                  <div
                    className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      read ? "bg-transparent" : "bg-primary"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(n.created_at).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 break-words">{n.body}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {n.category && (
                        <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {n.category}
                        </span>
                      )}
                      {read && (
                        <span className="text-[9px] text-emerald-600 flex items-center gap-1">
                          <Check size={10} /> Read
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}