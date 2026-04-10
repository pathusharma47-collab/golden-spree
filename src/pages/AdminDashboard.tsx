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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState<"prices" | "banners">("prices");

  // Edit banner state
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

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
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="text-xs text-destructive font-medium px-3 py-1.5 rounded-lg border border-destructive/30"
        >
          Logout
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["prices", "banners"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab
                ? "gold-gradient text-primary-foreground gold-glow"
                : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {tab === "prices" ? "💰 Prices" : "🖼️ Banners"}
          </button>
        ))}
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
                    <button
                      onClick={() => removeBanner(banner.id)}
                      className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
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
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;