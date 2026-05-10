import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpg";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase puts a recovery hash like #access_token=...&type=recovery
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    } else {
      // If session already exists from a recovery flow, allow update too
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Min 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Password updated ✅" });
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--gradient-dark)" }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
            <img src={logo} alt="Maheshwari Alankar" className="w-full h-full object-contain bg-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Set new password</h1>
        </div>

        {!ready ? (
          <div className="glass-card p-6 text-center text-sm text-muted-foreground">
            This link is invalid or has expired. Request a new reset link from the sign-in screen.
            <button
              onClick={() => navigate("/auth")}
              className="block mt-4 mx-auto text-primary font-semibold"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={6}
                required
                className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={busy}
              className="w-full h-12 rounded-xl gold-gradient text-primary-foreground font-semibold flex items-center justify-center gap-2 gold-glow disabled:opacity-60"
            >
              {busy ? <Loader2 size={18} className="animate-spin" /> : <><KeyRound size={18} /> Update password</>}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
