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

  const adjustWallet = async (
    delta: number,
    txType: "credit" | "debit",
    description: string,
  ): Promise<boolean> => {
    if (!user) return false;
    const newBal = balance + delta;
    if (newBal < 0) return false;
    const { error: walletErr } = await supabase
      .from("wallets")
      .update({ balance: newBal })
      .eq("user_id", user.id);
    if (walletErr) return false;
    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: txType,
      amount: Math.abs(delta),
      description,
    });
    setBalance(newBal);
    await refresh();
    return true;
  };

  const addFunds = useCallback(
    async (amount: number, description = "Added funds to wallet") => {
      await adjustWallet(amount, "credit", description);
    },
    [balance, user],
  );

  const withdraw = useCallback(
    async (amount: number, description = "Withdrawn to bank"): Promise<boolean> => {
      if (amount > balance) return false;
      return adjustWallet(-amount, "debit", description);
    },
    [balance, user],
  );

  const deductForInvestment = useCallback(
    async (
      amount: number,
      metalType: "gold" | "silver",
      grams: string,
      rate?: number,
      source: "buy" | "sip" = "buy",
    ): Promise<boolean> => {
      if (!user) return false;
      if (amount > balance) return false;

      const gramsNum = parseFloat(grams) || 0;
      const gst = +(amount * 0.03).toFixed(2);
      const metalValue = +(amount - gst).toFixed(2);

      // 1. Wallet debit
      const debitOk = await adjustWallet(
        -amount,
        "debit",
        `Invested in ${metalType} (${grams}g) · ₹${metalValue} + ₹${gst} GST`,
      );
      if (!debitOk) return false;

      // 2. Upsert holdings (sum grams)
      try {
        const { data: existing } = await supabase
          .from("holdings")
          .select("id, grams")
          .eq("user_id", user.id)
          .eq("metal", metalType)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("holdings")
            .update({ grams: Number(existing.grams) + gramsNum })
            .eq("id", existing.id);
        } else {
          await supabase.from("holdings").insert({
            user_id: user.id,
            metal: metalType,
            grams: gramsNum,
          });
        }
      } catch (err) {
        console.error("Holdings update failed", err);
      }

      // 3. Investment ledger row
      try {
        await supabase.from("investment_transactions").insert({
          user_id: user.id,
          type: source === "sip" ? "sip" : "buy",
          metal: metalType,
          grams: gramsNum,
          amount_inr: amount,
          gst_amount: gst,
          rate: rate ?? null,
        });
      } catch (err) {
        console.error("Investment tx insert failed", err);
      }

      return true;
    },
    [balance, user],
  );

  return (
    <WalletContext.Provider
      value={{ balance, transactions, loading, isNewUser, addFunds, withdraw, deductForInvestment, refresh }}
    >
      {children}
    </WalletContext.Provider>
  );
};
