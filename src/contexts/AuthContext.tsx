import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { registerPushForUser } from "@/lib/native";

export type UserRole = "admin" | "user";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const buildAppUser = async (supaUser: SupabaseUser): Promise<AppUser> => {
  // Fetch profile + role in parallel; if profile missing (race after signup), fall back gracefully.
  const [profileRes, rolesRes] = await Promise.all([
    supabase.from("profiles").select("display_name, email").eq("user_id", supaUser.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", supaUser.id),
  ]);

  const isAdmin = !!rolesRes.data?.some((r) => r.role === "admin");
  const displayName =
    profileRes.data?.display_name ||
    (supaUser.user_metadata?.display_name as string) ||
    (supaUser.user_metadata?.full_name as string) ||
    (supaUser.email?.split("@")[0] ?? "User");

  return {
    id: supaUser.id,
    email: supaUser.email || profileRes.data?.email || "",
    name: displayName,
    role: isAdmin ? "admin" : "user",
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = async (s: Session | null) => {
    if (!s?.user) {
      setUser(null);
      return;
    }
    const appUser = await buildAppUser(s.user);
    setUser(appUser);
    // Register the device for push notifications on native platforms.
    // No-op on web.
    registerPushForUser(appUser.id).catch(() => {});
  };

  useEffect(() => {
    // Set up listener BEFORE getSession (per Supabase guidance)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // Defer Supabase calls inside the listener
      if (newSession?.user) {
        setTimeout(() => {
          hydrate(newSession);
        }, 0);
      } else {
        setUser(null);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: existing } }) => {
      setSession(existing);
      await hydrate(existing);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (session) await hydrate(session);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, isAdmin: user?.role === "admin", logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
