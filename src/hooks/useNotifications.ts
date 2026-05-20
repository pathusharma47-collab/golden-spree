import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Notification {
  id: string;
  audience: "user" | "admin" | "all";
  recipient_id: string | null;
  sender_id: string | null;
  title: string;
  body: string;
  category: string | null;
  link: string | null;
  metadata: any;
  read_by: string[];
  created_at: string;
}

export function useNotifications() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    let q = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (isAdmin) {
      // Admin sees: activity alerts (admin), their own broadcasts (all) and direct messages to them
      q = q.or(`audience.eq.admin,audience.eq.all,recipient_id.eq.${user.id}`);
    } else {
      // Users see: broadcasts + direct messages to them
      q = q.or(`recipient_id.eq.${user.id},audience.eq.all`);
    }
    const { data, error } = await q;
    if (!error) setItems((data as Notification[]) || []);
    setLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user) return;
    fetchItems();
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new as Notification;
          const forMe = isAdmin
            ? n.audience === "admin" || n.audience === "all" || n.recipient_id === user.id
            : n.audience === "all" || n.recipient_id === user.id;
          if (!forMe) return;
          setItems((prev) => [n, ...prev].slice(0, 50));
          toast(n.title, { description: n.body });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, fetchItems]);

  const unread = items.filter((n) => !n.read_by?.includes(user?.id || "")).length;

  const markAllRead = async () => {
    if (!user) return;
    const ids = items.filter((n) => !n.read_by?.includes(user.id)).map((n) => n.id);
    if (!ids.length) return;
    // Update each (small set)
    await Promise.all(
      ids.map((id) => {
        const n = items.find((x) => x.id === id)!;
        return supabase
          .from("notifications")
          .update({ read_by: [...(n.read_by || []), user.id] })
          .eq("id", id);
      })
    );
    setItems((prev) =>
      prev.map((n) => ({ ...n, read_by: [...(n.read_by || []), user.id] }))
    );
  };

  return { items, loading, unread, refresh: fetchItems, markAllRead };
}