import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
}

interface WalletContextType {
  balance: number;
  transactions: WalletTransaction[];
  loading: boolean;
  isNewUser: boolean;
  addFunds: (amount: number, description?: string) => Promise<void>;
  withdraw: (amount: number, description?: string) => Promise<boolean>;
  deductForInvestment: (
    amount: number,
    metalType: "gold" | "silver",
    grams: string,
    rate?: number,
    source?: "buy" | "sip",
    purity?: "22k" | "24k",
  ) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  balance: 0,
  transactions: [],
  loading: true,
  isNewUser: false,
  addFunds: async () => {},
  withdraw: async () => false,
  deductForInvestment: async () => false,
  refresh: async () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [walletRes, txRes] = await Promise.all([
      supabase.from("wallets").select("balance, created_at").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("wallet_transactions")
        .select("id, type, amount, description, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    setBalance(Number(walletRes.data?.balance ?? 0));
    setTransactions(
      (txRes.data ?? []).map((t) => ({
        id: t.id,
        type: t.type as "credit" | "debit",
        amount: Number(t.amount),
        description: t.description,
        date: t.created_at,
      })),
    );
    // "New user" flag = wallet created in last 30s
    if (walletRes.data?.created_at) {
      const ageMs = Date.now() - new Date(walletRes.data.created_at).getTime();
      setIsNewUser(ageMs < 30_000);
    } else {
      setIsNewUser(false);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime: listen for wallet changes (e.g. from spin reward, edge functions)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`wallet-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wallets", filter: `user_id=eq.${user.id}` },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wallet_transactions", filter: `user_id=eq.${user.id}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  // NOTE: addFunds is no longer used for real money flows — wallet credits
  // now happen server-side (Razorpay verify-payment edge function calls
  // credit_wallet_from_payment, spin wheel calls process_spin_reward).
  // We keep this as a no-op + refresh so existing callers don't break.
  const addFunds = useCallback(
    async (_amount: number, _description?: string) => {
      await refresh();
    },
    [refresh],
  );

  const withdraw = useCallback(
    async (amount: number, description = "Withdrawn to bank"): Promise<boolean> => {
      if (!user) return false;
      if (amount > balance) return false;
      const { error } = await supabase.rpc("process_withdrawal", {
        _amount: amount,
        _description: description,
      });
      if (error) {
        console.error("withdraw failed", error);
        return false;
      }
      await refresh();
      return true;
    },
    [balance, user, refresh],
  );

  const deductForInvestment = useCallback(
    async (
      amount: number,
      metalType: "gold" | "silver",
      _grams: string,
      _rate?: number,
      source: "buy" | "sip" = "buy",
      purity: "22k" | "24k" = "22k",
    ): Promise<boolean> => {
      if (!user) return false;
      if (amount > balance) return false;
      const { error } = await supabase.rpc("process_investment", {
        _metal: metalType,
        _amount: amount,
        _source: source,
        _purity: metalType === "silver" ? "silver" : purity,
      });
      if (error) {
        console.error("invest failed", error);
        return false;
      }
      await refresh();
      return true;
    },
    [balance, user, refresh],
  );

  return (
    <WalletContext.Provider
      value={{ balance, transactions, loading, isNewUser, addFunds, withdraw, deductForInvestment, refresh }}
    >
      {children}
    </WalletContext.Provider>
  );
};
