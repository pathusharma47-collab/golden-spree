import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Banner {
  id: string;
  imageData: string;
  redirectUrl: string;
  title: string;
}

const BannerCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem("admin_banners");
      setBanners(stored ? JSON.parse(stored) : []);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="mt-4">
      <a
        href={banners[current]?.redirectUrl || "https://maheshwarialankar.com"}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative rounded-xl overflow-hidden aspect-[21/9]">
          <AnimatePresence mode="wait">
            <motion.img
              key={banners[current]?.id}
              src={banners[current]?.imageData}
              alt={banners[current]?.title}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full object-cover absolute inset-0"
            />
          </AnimatePresence>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="text-xs font-semibold text-white">{banners[current]?.title}</p>
          </div>
        </div>
      </a>
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current ? "bg-primary w-4" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;