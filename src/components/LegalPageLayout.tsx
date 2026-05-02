import { motion } from "framer-motion";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
}

const LegalPageLayout = ({ title, subtitle, icon: Icon, children }: Props) => {
  const navigate = useNavigate();
  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate(-1)}
        className="text-muted-foreground mb-4"
        aria-label="Go back"
      >
        <ArrowLeft size={22} />
      </motion.button>

      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0">
            <Icon size={18} className="text-primary-foreground" />
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </motion.div>

      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-6 glass-card p-5 space-y-5 text-sm text-foreground/90 leading-relaxed [&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_p]:text-sm [&_p]:text-muted-foreground"
      >
        {children}
      </motion.article>

      <p className="text-[10px] text-muted-foreground text-center mt-6">
        Maheshwari Alankar • Coimbatore, Tamil Nadu, India
      </p>
    </div>
  );
};

export default LegalPageLayout;