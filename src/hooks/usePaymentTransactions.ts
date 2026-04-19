import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PaymentTransaction {
  id: string;
  user_email: string;
  order_id: string;
  payment_id: string | null;
  signature: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  description: string | null;
  notes: any;
  created_at: string;
  updated_at: string;
}

export const usePaymentTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user?.email) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("user_email", user.email)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setTransactions(data as PaymentTransaction[]);
    }
    setLoading(false);
  }, [user?.email]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Poll for a specific order to reach success status (used after payment completes)
  const waitForOrderSuccess = useCallback(
    async (orderId: string, maxAttempts = 8): Promise<PaymentTransaction | null> => {
      for (let i = 0; i < maxAttempts; i++) {
        const { data } = await supabase
          .from("payment_transactions")
          .select("*")
          .eq("order_id", orderId)
          .maybeSingle();
        if (data && (data.status === "success" || data.status === "failed")) {
          await fetchTransactions();
          return data as PaymentTransaction;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      await fetchTransactions();
      return null;
    },
    [fetchTransactions]
  );

  return { transactions, loading, refetch: fetchTransactions, waitForOrderSuccess };
};
