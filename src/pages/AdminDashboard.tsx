import { useState, useEffect } from "react";
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
} from "lucide-react";

interface PriceData {
  gold24k: string;
  gold22k: string;
  silver: string;
  updatedAt: string;
}

interface Banner {
  id: string;
  imageUrl: string;
  redirectUrl: string;
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

  const [prices, setPrices] = useState<PriceData>(() => {
    const stored = localStorage.getItem("metal_prices");
    return stored ? JSON.parse(stored) : DEFAULT_PRICES;
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    const stored = localStorage.getItem("admin_banners");
    return stored ? JSON.parse(stored) : [];
  });

  const [priceSaved, setPriceSaved] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: "", imageUrl: "" });
  const [activeTab, setActiveTab] = useState<"prices" | "banners">("prices");

  const savePrices = () => {
    const updated = { ...prices, updatedAt: new Date().toISOString() };
    setPrices(updated);
    localStorage.setItem("metal_prices", JSON.stringify(updated));
    setPriceSaved(true);
    setTimeout(() => setPriceSaved(false), 2000);
  };

  const addBanner = () => {
    if (!newBanner.title || !newBanner.imageUrl) return;
    const banner: Banner = {
      id: Date.now().toString(),
      imageUrl: newBanner.imageUrl,
      redirectUrl: "https://maheshwarialankar.com",
      title: newBanner.title,
    };
    const updated = [...banners, banner];
    setBanners(updated);
    localStorage.setItem("admin_banners", JSON.stringify(updated));
    setNewBanner({ title: "", imageUrl: "" });
  };

  const removeBanner = (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    setBanners(updated);
    localStorage.setItem("admin_banners", JSON.stringify(updated));
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

              {/* Gold 24K */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Gold 24K (₹/gram)</label>
                <input
                  type="number"
                  value={prices.gold24k}
                  onChange={(e) => setPrices({ ...prices, gold24k: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Gold 22K */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Gold 22K (₹/gram)</label>
                <input
                  type="number"
                  value={prices.gold22k}
                  onChange={(e) => setPrices({ ...prices, gold22k: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Silver */}
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
            {/* Add Banner */}
            <div className="glass-card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Image size={16} className="text-primary" />
                Add Banner
              </h2>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Banner Title</label>
                <input
                  type="text"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  placeholder="e.g. Diwali Sale"
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                <input
                  type="url"
                  value={newBanner.imageUrl}
                  onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
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
                disabled={!newBanner.title || !newBanner.imageUrl}
                className="w-full h-12 rounded-xl gold-gradient text-primary-foreground font-semibold flex items-center justify-center gap-2 gold-glow disabled:opacity-50"
              >
                <Image size={18} />
                Add Banner
              </motion.button>
            </div>

            {/* Banner List */}
            {banners.length > 0 && (
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
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-16 h-12 rounded-lg object-cover bg-muted"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
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
            )}

            {banners.length === 0 && (
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
