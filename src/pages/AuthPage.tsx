import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/assets/logo.jpg";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-1.9 1.3-4.4 2.1-7.2 2.1-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41 35.5 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z"/>
  </svg>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast({ title: "Please accept the policies", description: "You must agree to the Terms, Privacy and Refund policies to continue.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      return;
    }
    navigate("/", { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast({ title: "Please accept the policies", description: "You must agree to the Terms, Privacy and Refund policies to continue.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });
    setBusy(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Account created 🎉",
      description: "Check your email to verify, then sign in.",
    });
    setMode("signin");
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Reset link sent ✉️", description: "Check your email." });
    setMode("signin");
  };

  const handleGoogle = async () => {
    if (!agreed) {
      toast({ title: "Please accept the policies", description: "You must agree to the Terms, Privacy and Refund policies to continue.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast({
        title: "Google sign-in failed",
        description: result.error.message,
        variant: "destructive",
      });
      return;
    }
    if (result.redirected) return; // browser will redirect
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ background: "var(--gradient-dark)" }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg"
          >
            <img src={logo} alt="Maheshwari Alankar" className="w-full h-full object-contain bg-white" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-foreground">Maheshwari Alankar</h1>
          <p className="text-muted-foreground text-sm mt-1">Gold & Silver Savings</p>
        </div>

        {mode !== "forgot" && (
          <div className="flex gap-2 mb-4 p-1 bg-muted/40 rounded-xl">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "signin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Sign Up
            </button>
          </div>
        )}

        <form
          onSubmit={mode === "signin" ? handleSignIn : mode === "signup" ? handleSignUp : handleForgot}
          className="glass-card p-6 space-y-4"
        >
          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground"
            />
          </div>

          {mode !== "forgot" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                  required
                  minLength={6}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 pr-10 text-sm text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-primary mt-1 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-xl gold-gradient text-primary-foreground font-semibold flex items-center justify-center gap-2 gold-glow disabled:opacity-60"
          >
            {busy ? (
              <Loader2 size={18} className="animate-spin" />
            ) : mode === "signin" ? (
              <><LogIn size={18} /> Sign In</>
            ) : mode === "signup" ? (
              <><UserPlus size={18} /> Create Account</>
            ) : (
              "Send Reset Link"
            )}
          </motion.button>

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              ← Back to sign in
            </button>
          )}
        </form>

        {mode !== "forgot" && (
          <>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="w-full h-12 rounded-xl bg-card border border-border text-foreground font-semibold flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </>
        )}

      </motion.div>
    </div>
  );
};

export default AuthPage;
