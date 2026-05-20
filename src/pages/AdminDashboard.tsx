import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Image,
  Trash2,
  ExternalLink,
  CheckCircle,
  IndianRupee,
  Upload,
  Loader2,
  Pencil,
  X,
  Coins,
  ImageIcon,
  Receipt,
  ArrowDownCircle,
  ArrowUpCircle,
  Send,
  Bell,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NotificationBell from "@/components/NotificationBell";

interface PriceData {
  gold24k: string;
  gold22k: string;
  silver: string;
  updatedAt: string;
}

interface Banner {
  id: string;
  image_data: string;
  redirect_url: string;
  title: string;
}

interface TxRow {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string;
  category: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const DEFAULT_PRICES: PriceData = {
  gold24k: "7150",
  gold22k: "6550",
  silver: "85",
  updatedAt: new Date().toISOString(),
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prices, setPrices] = useState<PriceData>(DEFAULT_PRICES);
  const [pricesRowId, setPricesRowId] = useState<string | null>(null);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [savingBanner, setSavingBanner] = useState(false);

  const [priceSaved, setPriceSaved] = useState(false);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"prices" | "banners" | "transactions" | "notify">("prices");

  // Send notification state
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifTarget, setNotifTarget] = useState<"all" | "user">("all");
  const [notifUserId, setNotifUserId] = useState<string>("");
  const [users, setUsers] = useState<{ user_id: string; email: string; display_name: string | null }[]>([]);
  const [sendingNotif, setSendingNotif] = useState(false);

  // Edit banner state
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Transactions
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [txFilter, setTxFilter] = useState<"all" | "credit" | "debit">("all");

  // Load users for targeted notifications
  useEffect(() => {
    supabase
      .from("profiles")
      .select("user_id, email, display_name")
      .order("created_at", { ascending: false })
      .then(({ data }) => setUsers(data || []));
  }, []);

  const sendNotification = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (notifTarget === "user" && !notifUserId) {
      toast.error("Pick a user");
      return;
    }
    setSendingNotif(true);
    const { error } = await supabase.rpc("send_notification", {
      _title: notifTitle.trim(),
      _body: notifBody.trim(),
      _recipient_id: notifTarget === "user" ? notifUserId : null,
      _link: null,
      _category: "admin",
    });
    setSendingNotif(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(notifTarget === "all" ? "Sent to all users" : "Sent to user");
      setNotifTitle("");
      setNotifBody("");
    }
  };

  // Load prices from Supabase
  useEffect(() => {
    const fetchPrices = async () => {
      const { data, error } = await supabase
        .from("metal_prices")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setPricesRowId(data.id);
        setPrices({
          gold24k: String(data.gold_24k),
          gold22k: String(data.gold_22k),
          silver: String(data.silver),
          updatedAt: data.updated_at,
        });
      }
    };
    fetchPrices();
  }, []);

  // Load banners from Supabase
  useEffect(() => {
    const fetchBanners = async () => {
      setLoadingBanners(true);
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching banners:", error);
        toast.error("Failed to load banners");
      } else {
        setBanners(data || []);
      }
      setLoadingBanners(false);
    };
    fetchBanners();
  }, []);

  // Enrich tx rows with profile info
  const enrichTx = async (rows: any[]): Promise<TxRow[]> => {
    if (!rows.length) return [];
    const ids = Array.from(new Set(rows.map((r) => r.user_id)));
    const { data: profs } = await supabase
      .from("profiles")
      .select("user_id, email, display_name")
      .in("user_id", ids);
    const map = new Map((profs || []).map((p: any) => [p.user_id, p]));
    return rows.map((r) => ({
      ...r,
      user_email: map.get(r.user_id)?.email,
      user_name: map.get(r.user_id)?.display_name,
    }));
  };

  // Load transactions + realtime
  useEffect(() => {
    let cancelled = false;
    const fetchTx = async () => {
      setLoadingTx(true);
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) {
        console.error(error);
        toast.error("Failed to load transactions");
      } else if (!cancelled) {
        setTransactions(await enrichTx(data || []));
      }
      setLoadingTx(false);
    };
    fetchTx();

    const channel = supabase
      .channel("admin-wallet-tx")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wallet_transactions" },
        async (payload) => {
          const enriched = await enrichTx([payload.new]);
          const row = enriched[0];
          setTransactions((prev) => [row, ...prev].slice(0, 200));
          toast.success(
            `${row.type === "credit" ? "↑" : "↓"} ₹${row.amount} · ${row.user_email || "user"}`,
            { description: row.description }
          );
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const savePrices = async () => {
    if (!pricesRowId) return;
    const { error } = await supabase
      .from("metal_prices")
      .update({
        gold_24k: parseFloat(prices.gold24k),
        gold_22k: parseFloat(prices.gold22k),
        silver: parseFloat(prices.silver),
      })
      .eq("id", pricesRowId);

    if (error) {
      console.error("Error saving prices:", error);
      toast.error("Failed to save prices");
      return;
    }
    setPrices({ ...prices, updatedAt: new Date().toISOString() });
    setPriceSaved(true);
    toast.success("Prices updated for all users!");
    setTimeout(() => setPriceSaved(false), 2000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setBannerPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addBanner = async () => {
    if (!bannerTitle || !bannerPreview) return;
    setSavingBanner(true);

    const { data, error } = await supabase
      .from("banners")
      .insert({
        title: bannerTitle,
        image_data: bannerPreview,
        redirect_url: "https://maheshwarialankar.com",
        sort_order: banners.length,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding banner:", error);
      toast.error("Failed to add banner");
    } else if (data) {
      setBanners([...banners, data]);
      toast.success("Banner added successfully!");
      setBannerTitle("");
      setBannerPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setSavingBanner(false);
  };

  const removeBanner = async (id: string) => {
    const { error } = await supabase.from("banners").delete().eq("id", id);

    if (error) {
      console.error("Error removing banner:", error);
      toast.error("Failed to remove banner");
    } else {
      setBanners(banners.filter((b) => b.id !== id));
      toast.success("Banner removed");
    }
  };

  const startEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setEditTitle(banner.title);
    setEditPreview(banner.image_data);
  };

  const cancelEdit = () => {
    setEditingBanner(null);
    setEditTitle("");
    setEditPreview(null);
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEditPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveEditBanner = async () => {
    if (!editingBanner || !editTitle || !editPreview) return;
    setSavingEdit(true);

    const { error } = await supabase
      .from("banners")
      .update({
        title: editTitle,
        image_data: editPreview,
      })
      .eq("id", editingBanner.id);

    if (error) {
      console.error("Error updating banner:", error);
      toast.error("Failed to update banner");
    } else {
      setBanners(banners.map((b) =>
        b.id === editingBanner.id ? { ...b, title: editTitle, image_data: editPreview } : b
      ));
      toast.success("Banner updated!");
      cancelEdit();
    }
    setSavingEdit(false);
  };

  return (
    <div className="min-h-screen pb-28 px-4 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-card border border-border">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={async () => { await logout(); navigate("/auth"); }}
            className="text-xs text-destructive font-medium px-3 py-1.5 rounded-lg border border-destructive/30"
          >
            Logout
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(["prices", "banners", "transactions", "notify"] as const).map((tab) => {
          const TabIcon = tab === "prices" ? Coins : tab === "banners" ? ImageIcon : tab === "transactions" ? Receipt : Bell;
          const label = tab === "prices" ? "Prices" : tab === "banners" ? "Banners" : tab === "transactions" ? "Activity" : "Notify";
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-fit py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === tab
                  ? "gold-gradient text-primary-foreground gold-glow"
                  : "bg-card border border-border text-muted-foreground"
              }`}
            >
              <TabIcon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "prices" && (
          <motion.div
            key="prices"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="glass-card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <IndianRupee size={16} className="text-primary" />
                Update Metal Prices (per gram)
              </h2>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Gold 24K (₹/gram)</label>
                <input
                  type="number"
                  value={prices.gold24k}
                  onChange={(e) => setPrices({ ...prices, gold24k: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Gold 22K (₹/gram)</label>
                <input
                  type="number"
                  value={prices.gold22k}
                  onChange={(e) => setPrices({ ...prices, gold22k: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Silver (₹/gram)</label>
                <input
                  type="number"
                  value={prices.silver}
                  onChange={(e) => setPrices({ ...prices, silver: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={savePrices}
                className="w-full h-12 rounded-xl gold-gradient text-primary-foreground font-semibold flex items-center justify-center gap-2 gold-glow"
              >
                {priceSaved ? <CheckCircle size={18} /> : <Save size={18} />}
                {priceSaved ? "Saved!" : "Save Prices"}
              </motion.button>

              <p className="text-[10px] text-muted-foreground text-center">
                Last updated: {new Date(prices.updatedAt).toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === "banners" && (
          <motion.div
            key="banners"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="glass-card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Image size={16} className="text-primary" />
                Add Banner
              </h2>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Banner Title</label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="e.g. Diwali Sale"
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Upload Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 rounded-xl border-2 border-dashed border-border bg-background flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors"
                >
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <Upload size={20} />
                      <span className="text-xs">Tap to upload image (max 2MB)</span>
                    </>
                  )}
                </motion.button>
              </div>

              <p className="text-[10px] text-muted-foreground">
                All banners redirect to{" "}
                <a href="https://maheshwarialankar.com" target="_blank" className="text-primary underline">
                  maheshwarialankar.com
                </a>
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={addBanner}
                disabled={!bannerTitle || !bannerPreview || savingBanner}
                className="w-full h-12 rounded-xl gold-gradient text-primary-foreground font-semibold flex items-center justify-center gap-2 gold-glow disabled:opacity-50"
              >
                {savingBanner ? <Loader2 size={18} className="animate-spin" /> : <Image size={18} />}
                {savingBanner ? "Saving..." : "Add Banner"}
              </motion.button>
            </div>

            {loadingBanners ? (
              <div className="text-center py-8">
                <Loader2 size={24} className="animate-spin text-muted-foreground mx-auto" />
              </div>
            ) : banners.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground px-1">
                  Active Banners ({banners.length})
                </h3>
                {banners.map((banner) => (
                  <motion.div
                    key={banner.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-3 flex items-center gap-3"
                  >
                    <img
                      src={banner.image_data}
                      alt={banner.title}
                      className="w-16 h-12 rounded-lg object-cover bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{banner.title}</p>
                      <a
                        href="https://maheshwarialankar.com"
                        target="_blank"
                        className="text-[10px] text-primary flex items-center gap-1"
                      >
                        maheshwarialankar.com <ExternalLink size={10} />
                      </a>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditBanner(banner)}
                        className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => removeBanner(banner.id)}
                        className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No banners added yet
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "transactions" && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Receipt size={16} className="text-primary" />
                  Live Transactions
                </h2>
                <span className="text-[10px] text-muted-foreground">
                  {transactions.length} recent
                </span>
              </div>
              <div className="flex gap-2">
                {(["all", "credit", "debit"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTxFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      txFilter === f
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-muted-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loadingTx ? (
              <div className="text-center py-8">
                <Loader2 size={24} className="animate-spin text-muted-foreground mx-auto" />
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {transactions
                    .filter((t) => txFilter === "all" || t.type === txFilter)
                    .map((tx) => {
                      const isCredit = tx.type === "credit";
                      const Icon = isCredit ? ArrowDownCircle : ArrowUpCircle;
                      return (
                        <motion.div
                          key={tx.id}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="glass-card p-3 flex items-start gap-3"
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              isCredit
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {tx.user_name || tx.user_email || "Unknown user"}
                              </p>
                              <p
                                className={`text-sm font-semibold whitespace-nowrap ${
                                  isCredit ? "text-emerald-500" : "text-destructive"
                                }`}
                              >
                                {isCredit ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                              </p>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {tx.description}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {tx.category && (
                                <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                  {tx.category}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(tx.created_at).toLocaleString("en-IN", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </span>
                            </div>
                            {tx.user_email && tx.user_name && (
                              <p className="text-[10px] text-muted-foreground truncate">
                                {tx.user_email}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
                {transactions.filter((t) => txFilter === "all" || t.type === txFilter).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No transactions yet
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "notify" && (
          <motion.div
            key="notify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="glass-card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Send size={16} className="text-primary" />
                Send Push Notification
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setNotifTarget("all")}
                  className={`flex-1 h-10 rounded-xl text-xs font-medium transition-all ${
                    notifTarget === "all" ? "gold-gradient text-primary-foreground" : "bg-card border border-border text-muted-foreground"
                  }`}
                >
                  Broadcast to all
                </button>
                <button
                  onClick={() => setNotifTarget("user")}
                  className={`flex-1 h-10 rounded-xl text-xs font-medium transition-all ${
                    notifTarget === "user" ? "gold-gradient text-primary-foreground" : "bg-card border border-border text-muted-foreground"
                  }`}
                >
                  Specific user
                </button>
              </div>

              {notifTarget === "user" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Recipient</label>
                  <select
                    value={notifUserId}
                    onChange={(e) => setNotifUserId(e.target.value)}
                    className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select user…</option>
                    {users.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.display_name ? `${u.display_name} · ${u.email}` : u.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Festive offer"
                  maxLength={80}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Message</label>
                <textarea
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  placeholder="Type your message…"
                  maxLength={300}
                  rows={4}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <p className="text-[10px] text-muted-foreground text-right mt-1">
                  {notifBody.length}/300
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={sendNotification}
                disabled={sendingNotif}
                className="w-full h-12 rounded-xl gold-gradient text-primary-foreground font-semibold flex items-center justify-center gap-2 gold-glow disabled:opacity-50"
              >
                {sendingNotif ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {sendingNotif ? "Sending..." : "Send Notification"}
              </motion.button>

              <p className="text-[10px] text-muted-foreground text-center">
                Users will receive a real-time in-app toast and bell badge.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Banner Modal */}
      <AnimatePresence>
        {editingBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={cancelEdit}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-5 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Pencil size={16} className="text-primary" /> Edit Banner
                </h2>
                <button onClick={cancelEdit} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Banner Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Banner Image</label>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageSelect}
                  className="hidden"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => editFileInputRef.current?.click()}
                  className="w-full h-24 rounded-xl border-2 border-dashed border-border bg-background flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors"
                >
                  {editPreview ? (
                    <img src={editPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-xs text-muted-foreground flex flex-col items-center gap-2">
                      <Upload size={20} /> Tap to change image
                    </span>
                  )}
                </motion.button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={saveEditBanner}
                disabled={!editTitle || !editPreview || savingEdit}
                className="w-full h-12 rounded-xl gold-gradient text-primary-foreground font-semibold flex items-center justify-center gap-2 gold-glow disabled:opacity-50"
              >
                {savingEdit ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {savingEdit ? "Saving..." : "Save Changes"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;